const db = require('../db');
const { logActivity } = require('../utils/logger');

// === VISA_PROVIDERS ===
exports.getAll = async (req, res) => {
    try {
        const { search, province, market, page = 1, limit = 30 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM visa_providers WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM visa_providers WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (search) {
            const searchClause = ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`;
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (market) {
            const filterClause = ` AND market = $${paramIndex}`;
            query += filterClause;
            countQuery += filterClause;
            params.push(market);
            paramIndex++;
        }
        if (province) {
            const filterClause = ` AND province = $${paramIndex}`;
            query += filterClause;
            countQuery += filterClause;
            params.push(province);
            paramIndex++;
        }

        query += ` ORDER BY id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        const queryParams = [...params, limit, offset];

        const [dataResult, countResult] = await Promise.all([
            db.query(query, queryParams),
            db.query(countQuery, params)
        ]);

        const total = parseInt(countResult.rows[0].total, 10);

        res.json({
            data: dataResult.rows,
            total,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.getDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const entityRes = await db.query('SELECT * FROM visa_providers WHERE id = $1', [id]);
        if (entityRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy Nhà Cung Cấp Visa' });
        const entity = entityRes.rows[0];

        const contactsRes = await db.query('SELECT * FROM visa_provider_contacts WHERE visa_provider_id = $1 ORDER BY id ASC', [id]);
        const servicesRes = await db.query('SELECT * FROM visa_provider_services WHERE visa_provider_id = $1 ORDER BY id ASC', [id]);
        const contractsRes = await db.query('SELECT * FROM visa_provider_contracts WHERE visa_provider_id = $1 ORDER BY valid_from DESC', [id]);
        
        const ratesRes = await db.query(`
            SELECT r.*, s.name as service_name
            FROM visa_provider_contract_rates r
            JOIN visa_provider_contracts c ON r.contract_id = c.id
            LEFT JOIN visa_provider_services s ON r.service_id = s.id
            WHERE c.visa_provider_id = $1
        `, [id]);

        entity.contacts = contactsRes.rows;
        entity.services = servicesRes.rows;
        entity.contracts = contractsRes.rows;
        
        entity.contracts.forEach(contract => {
            contract.rates = ratesRes.rows.filter(r => r.contract_id === contract.id);
        });

        res.json(entity);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { code, name, phone, email, address, notes, country, processing_time, market, contacts, services } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO visa_providers (code, name, phone, email, address, notes, country, processing_time, market) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [code, name, phone, email, address, notes, country, processing_time, market]
        );
        const newId = result.rows[0].id;

        if (contacts && Array.isArray(contacts)) {
            for (const c of contacts) {
                if (c.name && c.name.trim() !== '') {
                    await client.query(
                        'INSERT INTO visa_provider_contacts (visa_provider_id, name, position, phone, email, dob) VALUES ($1, $2, $3, $4, $5, $6)',
                        [newId, c.name, c.position, c.phone, c.email, c.dob]
                    );
                }
            }
        }

        if (services && Array.isArray(services)) {
            for (const s of services) {
                if (!s.name) continue;
                await client.query(
                    'INSERT INTO visa_provider_services (visa_provider_id, visa_type, sku, name, cost_price, sale_price, description, notes, quantity, kt_price, rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                    [newId, s.visa_type || null, s.sku || null, s.name, s.cost_price || null, s.sale_price || null, s.description || null, s.notes || null, s.quantity || 1.00, s.kt_price || 0, s.rate || 0]
                );
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'VISA_PROVIDER',
                entity_id: newId,
                details: `Đã thêm mới Nhà Cung Cấp Visa: ${name}`
            });
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Mã Nhà cung cấp đã tồn tại!' });
        }
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.update = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { 
            code, name, phone, email, address, notes, country, processing_time, market,
            contacts, services,
            deleted_contact_ids, deleted_service_ids
        } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE visa_providers SET code=$1, name=$2, phone=$3, email=$4, address=$5, notes=$6, country=$7, processing_time=$8, market=$9, updated_at=CURRENT_TIMESTAMP WHERE id=$10 RETURNING *`,
            [code, name, phone, email, address, notes, country, processing_time, market, id]
        );

        if (deleted_contact_ids && deleted_contact_ids.length > 0) {
            await client.query('DELETE FROM visa_provider_contacts WHERE id = ANY($1::int[])', [deleted_contact_ids]);
        }
        if (deleted_service_ids && deleted_service_ids.length > 0) {
            await client.query('DELETE FROM visa_provider_services WHERE id = ANY($1::int[])', [deleted_service_ids]);
        }

        if (contacts !== undefined) {
            for (const c of contacts) {
                if (!c.name || c.name.trim() === '') continue;
                if (typeof c.id === 'string' || Number(c.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO visa_provider_contacts (visa_provider_id, name, position, phone, email, dob) VALUES ($1, $2, $3, $4, $5, $6)',
                        [id, c.name, c.position, c.phone, c.email, c.dob]
                    );
                } else {
                    await client.query(
                        'UPDATE visa_provider_contacts SET name=$1, position=$2, phone=$3, email=$4, dob=$5 WHERE id=$6',
                        [c.name, c.position, c.phone, c.email, c.dob, c.id]
                    );
                }
            }
        }

        if (services !== undefined) {
            for (const s of services) {
                if (!s.name) continue;
                if (typeof s.id === 'string' || Number(s.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO visa_provider_services (visa_provider_id, visa_type, sku, name, cost_price, sale_price, description, notes, quantity, kt_price, rate) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                        [id, s.visa_type || null, s.sku || null, s.name, s.cost_price || null, s.sale_price || null, s.description || null, s.notes || null, s.quantity || 1.00, s.kt_price || 0, s.rate || 0]
                    );
                } else {
                    await client.query(
                        'UPDATE visa_provider_services SET visa_type=$1, sku=$2, name=$3, cost_price=$4, sale_price=$5, description=$6, notes=$7, quantity=$8, kt_price=$9, rate=$10 WHERE id=$11',
                        [s.visa_type || null, s.sku || null, s.name, s.cost_price || null, s.sale_price || null, s.description || null, s.notes || null, s.quantity || 1.00, s.kt_price || 0, s.rate || 0, s.id]
                    );
                }
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'VISA_PROVIDER',
                entity_id: id,
                details: `Cập nhật thông tin Nhà Cung Cấp Visa: ${name}`
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        const checkDeps = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM visa_provider_contracts WHERE visa_provider_id = $1) as contract_count,
                (SELECT COUNT(*) FROM visa_provider_services WHERE visa_provider_id = $1) as service_count
        `, [id]);
        
        const deps = checkDeps.rows[0];
        const totalDeps = parseInt(deps.contract_count) + parseInt(deps.service_count);

        if (totalDeps > 0 && req.query.force !== 'true') {
            return res.status(409).json({ 
                message: `Nhà Cung Cấp Visa này đang có ${deps.contract_count} hợp đồng và ${deps.service_count} dịch vụ. Xóa sẽ xóa toàn bộ dữ liệu phụ lục bên trong.`,
                has_deps: true,
                dep_count: totalDeps
            });
        }

        await db.query('DELETE FROM visa_providers WHERE id = $1', [id]);
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'VISA_PROVIDER',
                entity_id: id,
                details: `Xóa Nhà Cung Cấp Visa ID ${id}`
            });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

// === CONTACTS ===
exports.createContact = async (req, res) => {
    try {
        const { visa_provider_id } = req.params;
        const { name, position, phone, email, dob } = req.body;
        const result = await db.query(
            'INSERT INTO visa_provider_contacts (visa_provider_id, name, position, phone, email, dob) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [visa_provider_id, name, position, phone, email, dob]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        const { name, position, phone, email, dob } = req.body;
        const result = await db.query(
            'UPDATE visa_provider_contacts SET name=$1, position=$2, phone=$3, email=$4, dob=$5 WHERE id=$6 RETURNING *',
            [name, position, phone, email, dob, contact_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        await db.query('DELETE FROM visa_provider_contacts WHERE id = $1', [contact_id]);
        res.json({ message: 'Deleted contact' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === SERVICES ===
exports.createService = async (req, res) => {
    try {
        const { visa_provider_id } = req.params;
        const { visa_type } = req.body;
        const result = await db.query(
            'INSERT INTO visa_provider_services (visa_provider_id, visa_type) VALUES ($1, $2) RETURNING *',
            [visa_provider_id, visa_type || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { service_id } = req.params;
        const { visa_type } = req.body;
        const result = await db.query(
            'UPDATE visa_provider_services SET visa_type=$1 WHERE id=$2 RETURNING *',
            [visa_type || null, service_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { service_id } = req.params;
        await db.query('DELETE FROM visa_provider_services WHERE id = $1', [service_id]);
        res.json({ message: 'Deleted service' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === CONTRACTS ===
exports.createContract = async (req, res) => {
    try {
        const { visa_provider_id } = req.params;
        const { name, valid_from, valid_to, notes } = req.body;
        const result = await db.query(
            'INSERT INTO visa_provider_contracts (visa_provider_id, name, valid_from, valid_to, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [visa_provider_id, name, valid_from || null, valid_to || null, notes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContract = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const { name, valid_from, valid_to, notes } = req.body;
        const result = await db.query(
            'UPDATE visa_provider_contracts SET name=$1, valid_from=$2, valid_to=$3, notes=$4 WHERE id=$5 RETURNING *',
            [name, valid_from || null, valid_to || null, notes, contract_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContract = async (req, res) => {
    try {
        const { contract_id } = req.params;
        await db.query('DELETE FROM visa_provider_contracts WHERE id = $1', [contract_id]);
        res.json({ message: 'Deleted contract' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === RATES ===
exports.createContractRate = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const { service_id, fita_net, fita_sale, fita_commission, fite_net, fite_sale, fite_commission, series_net, series_sale, series_commission, charter_net, charter_sale, charter_commission } = req.body;
        const result = await db.query(
            `INSERT INTO visa_provider_contract_rates (contract_id, service_id, fita_net, fita_sale, fita_commission, fite_net, fite_sale, fite_commission, series_net, series_sale, series_commission, charter_net, charter_sale, charter_commission) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [contract_id, service_id, fita_net, fita_sale, fita_commission, fite_net, fite_sale, fite_commission, series_net, series_sale, series_commission, charter_net, charter_sale, charter_commission]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        const { service_id, fita_net, fita_sale, fita_commission, fite_net, fite_sale, fite_commission, series_net, series_sale, series_commission, charter_net, charter_sale, charter_commission } = req.body;
        const result = await db.query(
            `UPDATE visa_provider_contract_rates SET service_id=$1, fita_net=$2, fita_sale=$3, fita_commission=$4, fite_net=$5, fite_sale=$6, fite_commission=$7, series_net=$8, series_sale=$9, series_commission=$10, charter_net=$11, charter_sale=$12, charter_commission=$13 WHERE id=$14 RETURNING *`,
            [service_id, fita_net, fita_sale, fita_commission, fite_net, fite_sale, fite_commission, series_net, series_sale, series_commission, charter_net, charter_sale, charter_commission, rate_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        await db.query('DELETE FROM visa_provider_contract_rates WHERE id = $1', [rate_id]);
        res.json({ message: 'Deleted rate' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === NOTES ===
exports.getNotes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT n.*, u.full_name as creator_name FROM visa_provider_notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.visa_provider_id = $1 ORDER BY n.created_at DESC',
            [req.params.visa_provider_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addNote = async (req, res) => {
    const { visa_provider_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO visa_provider_notes (visa_provider_id, content, user_id) VALUES ($1, $2, $3) RETURNING *',
            [visa_provider_id, content, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add Visa_provider Note Error:', err);
        res.status(500).json({ message: err.message });
    }
};
