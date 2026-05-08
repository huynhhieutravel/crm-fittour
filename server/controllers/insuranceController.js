const db = require('../db');
const { logActivity } = require('../utils/logger');
const { generateSupplierCode } = require('../utils/supplierHelper');

// === INSURANCES ===
exports.getAll = async (req, res) => {
    try {
        const { search, province, market, market_group, page = 1, limit = 30 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM insurances WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM insurances WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (search) {
            const searchClause = ` AND (name ILIKE $${paramIndex} OR code ILIKE $${paramIndex})`;
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`);
            paramIndex++;
        }
        if (market_group) {
            const markets = market_group.split(",").map(m => m.trim());
            const placeholders = markets.map((_, i) => `$${paramIndex + i}`).join(", ");
            const filterClause = ` AND market IN (${placeholders})`;
            query += filterClause;
            countQuery += filterClause;
            params.push(...markets);
            paramIndex += markets.length;
        } else if (market) {
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
        const entityRes = await db.query('SELECT * FROM insurances WHERE id = $1', [id]);
        if (entityRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy Bảo Hiểm' });
        const entity = entityRes.rows[0];

        const contactsRes = await db.query('SELECT * FROM insurance_contacts WHERE insurance_id = $1 ORDER BY id ASC', [id]);
        const servicesRes = await db.query('SELECT * FROM insurance_services WHERE insurance_id = $1 ORDER BY id ASC', [id]);
        const contractsRes = await db.query('SELECT * FROM insurance_contracts WHERE insurance_id = $1 ORDER BY valid_from DESC', [id]);
        
        const ratesRes = await db.query(`
            SELECT r.*, s.name as service_name
            FROM insurance_contract_rates r
            JOIN insurance_contracts c ON r.contract_id = c.id
            LEFT JOIN insurance_services s ON r.service_id = s.id
            WHERE c.insurance_id = $1
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
        const { code, name, tax_id, insurance_class, phone, email, country, province, address, notes, website, bank_account_name, bank_account_number, bank_name, market, rating, drive_link, contacts, services } = req.body;

        await client.query('BEGIN');

        let finalCode = code;
        if (!finalCode || finalCode.trim() === '') {
            finalCode = await generateSupplierCode(client, 'insurances', 'INS-');
        }

        const result = await client.query(
            `INSERT INTO insurances (code, name, tax_id, insurance_class, phone, email, country, province, address, notes, website, bank_account_name, bank_account_number, bank_name, market, rating, drive_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
            [finalCode, name, tax_id, insurance_class, phone, email, country, province, address, notes, website, bank_account_name, bank_account_number, bank_name, market, rating || 0, drive_link || null]
        );
        const newId = result.rows[0].id;

        if (contacts && Array.isArray(contacts)) {
            for (const c of contacts) {
                if (c.name && c.name.trim() !== '') {
                    await client.query(
                        'INSERT INTO insurance_contacts (insurance_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5)',
                        [newId, c.name, c.position, c.phone, c.email]
                    );
                }
            }
        }

        if (services && Array.isArray(services)) {
            for (const s of services) {
                if (!s.name) continue;
                await client.query(
                    'INSERT INTO insurance_services (insurance_id, sku, service_type, name, description, notes, coverage_amount, duration_days, cost_price, net_price, sale_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                    [newId, s.sku || null, s.service_type || null, s.name || null, s.description || null, s.notes || null, s.coverage_amount || null, s.duration_days || null, s.cost_price || null, s.net_price || null, s.sale_price || null]
                );
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'INSURANCE',
                entity_id: newId,
                details: `Đã thêm mới Bảo Hiểm: ${name}`,
                new_data: result.rows[0]
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
            code, name, tax_id, insurance_class, phone, email, country, province, address, notes, website, bank_account_name, bank_account_number, bank_name, market, rating, drive_link,
            contacts, services,
            deleted_contact_ids, deleted_service_ids
        } = req.body;

        await client.query('BEGIN');

        // Fetch old data for logging
        const oldInsuranceRes = await client.query('SELECT * FROM insurances WHERE id = $1', [id]);
        if (oldInsuranceRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy Bảo Hiểm' });
        }
        const oldInsurance = oldInsuranceRes.rows[0];

        const result = await client.query(
            `UPDATE insurances SET code=$1, name=$2, tax_id=$3, insurance_class=$4, phone=$5, email=$6, country=$7, province=$8, address=$9, notes=$10, website=$11, bank_account_name=$12, bank_account_number=$13, bank_name=$14, market=$15, rating=$16, drive_link=$17, updated_at=CURRENT_TIMESTAMP WHERE id=$18 RETURNING *`,
            [code, name, tax_id, insurance_class, phone, email, country, province, address, notes, website, bank_account_name, bank_account_number, bank_name, market, rating || 0, drive_link || null, id]
        );

        if (deleted_contact_ids && deleted_contact_ids.length > 0) {
            await client.query('DELETE FROM insurance_contacts WHERE id = ANY($1::int[])', [deleted_contact_ids]);
        }
        if (deleted_service_ids && deleted_service_ids.length > 0) {
            await client.query('DELETE FROM insurance_services WHERE id = ANY($1::int[])', [deleted_service_ids]);
        }

        if (contacts !== undefined) {
            for (const c of contacts) {
                if (!c.name || c.name.trim() === '') continue;
                if (typeof c.id === 'string' || Number(c.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO insurance_contacts (insurance_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5)',
                        [id, c.name, c.position, c.phone, c.email]
                    );
                } else {
                    await client.query(
                        'UPDATE insurance_contacts SET name=$1, position=$2, phone=$3, email=$4 WHERE id=$5',
                        [c.name, c.position, c.phone, c.email, c.id]
                    );
                }
            }
        }

        if (services !== undefined) {
            for (const s of services) {
                if (!s.name) continue;
                if (typeof s.id === 'string' || Number(s.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO insurance_services (insurance_id, sku, service_type, name, description, notes, coverage_amount, duration_days, cost_price, net_price, sale_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
                        [id, s.sku || null, s.service_type || null, s.name || null, s.description || null, s.notes || null, s.coverage_amount || null, s.duration_days || null, s.cost_price || null, s.net_price || null, s.sale_price || null]
                    );
                } else {
                    await client.query(
                        'UPDATE insurance_services SET sku=$1, service_type=$2, name=$3, description=$4, notes=$5, coverage_amount=$6, duration_days=$7, cost_price=$8, net_price=$9, sale_price=$10 WHERE id=$11',
                        [s.sku || null, s.service_type || null, s.name || null, s.description || null, s.notes || null, s.coverage_amount || null, s.duration_days || null, s.cost_price || null, s.net_price || null, s.sale_price || null, s.id]
                    );
                }
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'INSURANCE',
                entity_id: id,
                details: `Cập nhật thông tin Bảo Hiểm: ${name}`,
                old_data: oldInsurance,
                new_data: result.rows[0]
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

        // Fetch old data for logging
        const oldInsuranceRes = await db.query('SELECT * FROM insurances WHERE id = $1', [id]);
        if (oldInsuranceRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy Bảo Hiểm' });
        const oldInsurance = oldInsuranceRes.rows[0];

        const checkDeps = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM insurance_contracts WHERE insurance_id = $1) as contract_count,
                (SELECT COUNT(*) FROM insurance_services WHERE insurance_id = $1) as service_count
        `, [id]);
        
        const deps = checkDeps.rows[0];
        const totalDeps = parseInt(deps.contract_count) + parseInt(deps.service_count);

        if (totalDeps > 0 && req.query.force !== 'true') {
            return res.status(409).json({ 
                message: `Bảo Hiểm này đang có ${deps.contract_count} hợp đồng và ${deps.service_count} dịch vụ. Xóa sẽ xóa toàn bộ dữ liệu phụ lục bên trong.`,
                has_deps: true,
                dep_count: totalDeps
            });
        }

        await db.query('DELETE FROM insurances WHERE id = $1', [id]);
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'INSURANCE',
                entity_id: id,
                details: `Xóa Bảo Hiểm: ${oldInsurance.name}`,
                old_data: oldInsurance
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
        const { insurance_id } = req.params;
        const { name, position, phone, email } = req.body;
        const result = await db.query(
            'INSERT INTO insurance_contacts (insurance_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [insurance_id, name, position, phone, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        const { name, position, phone, email } = req.body;
        const result = await db.query(
            'UPDATE insurance_contacts SET name=$1, position=$2, phone=$3, email=$4 WHERE id=$6 RETURNING *',
            [name, position, phone, email, contact_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const { contact_id } = req.params;
        await db.query('DELETE FROM insurance_contacts WHERE id = $1', [contact_id]);
        res.json({ message: 'Deleted contact' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === SERVICES ===
exports.createService = async (req, res) => {
    try {
        const { insurance_id } = req.params;
        const { sku, service_type, name, description, notes, coverage_amount, duration_days, cost_price, net_price, sale_price } = req.body;
        const result = await db.query(
            'INSERT INTO insurance_services (insurance_id, sku, service_type, name, description, notes, coverage_amount, duration_days, cost_price, net_price, sale_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [insurance_id, sku || null, service_type || null, name || null, description || null, notes || null, coverage_amount || null, duration_days || null, cost_price || null, net_price || null, sale_price || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { service_id } = req.params;
        const { sku, service_type, name, description, notes, coverage_amount, duration_days, cost_price, net_price, sale_price } = req.body;
        const result = await db.query(
            'UPDATE insurance_services SET sku=$1, service_type=$2, name=$3, description=$4, notes=$5, coverage_amount=$6, duration_days=$7, cost_price=$8, net_price=$9, sale_price=$10 WHERE id=$12 RETURNING *',
            [sku || null, service_type || null, name || null, description || null, notes || null, coverage_amount || null, duration_days || null, cost_price || null, net_price || null, sale_price || null, service_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { service_id } = req.params;
        await db.query('DELETE FROM insurance_services WHERE id = $1', [service_id]);
        res.json({ message: 'Deleted service' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === CONTRACTS ===
exports.createContract = async (req, res) => {
    try {
        const { insurance_id } = req.params;
        const { name, valid_from, valid_to, notes } = req.body;
        const result = await db.query(
            'INSERT INTO insurance_contracts (insurance_id, name, valid_from, valid_to, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [insurance_id, name, valid_from || null, valid_to || null, notes]
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
            'UPDATE insurance_contracts SET name=$1, valid_from=$2, valid_to=$3, notes=$4 WHERE id=$6 RETURNING *',
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
        await db.query('DELETE FROM insurance_contracts WHERE id = $1', [contract_id]);
        res.json({ message: 'Deleted contract' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === RATES ===
exports.createContractRate = async (req, res) => {
    try {
        const { contract_id } = req.params;
        const { service_id, dummy_rate } = req.body;
        const result = await db.query(
            `INSERT INTO insurance_contract_rates (contract_id, service_id, dummy_rate) VALUES ($1, $2, $3, $4) RETURNING *`,
            [contract_id, service_id, dummy_rate]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        const { service_id, dummy_rate } = req.body;
        const result = await db.query(
            `UPDATE insurance_contract_rates SET service_id=$1, dummy_rate=$2 WHERE id=$4 RETURNING *`,
            [service_id, dummy_rate, rate_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteContractRate = async (req, res) => {
    try {
        const { rate_id } = req.params;
        await db.query('DELETE FROM insurance_contract_rates WHERE id = $1', [rate_id]);
        res.json({ message: 'Deleted rate' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === NOTES ===
exports.getNotes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT n.*, u.full_name as creator_name FROM insurance_notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.insurance_id = $1 ORDER BY n.created_at DESC',
            [req.params.insurance_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addNote = async (req, res) => {
    const { insurance_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO insurance_notes (insurance_id, content, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [insurance_id, content, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add Insurance Note Error:', err);
        res.status(500).json({ message: err.message });
    }
};
