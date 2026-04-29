const db = require('../db');
const { logActivity } = require('../utils/logger');

// === TRANSPORTS ===
exports.getAll = async (req, res) => {
    try {
        const { search, province, market, market_group, page = 1, limit = 30 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM transports WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM transports WHERE 1=1';
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
        const entityRes = await db.query('SELECT * FROM transports WHERE id = $1', [id]);
        if (entityRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy Nhà xe' });
        const entity = entityRes.rows[0];

        const contactsRes = await db.query('SELECT * FROM transport_contacts WHERE transport_id = $1 ORDER BY id ASC', [id]);
        const servicesRes = await db.query('SELECT * FROM transport_services WHERE transport_id = $1 ORDER BY id ASC', [id]);
        const contractsRes = await db.query('SELECT * FROM transport_contracts WHERE transport_id = $1 ORDER BY valid_from DESC', [id]);
        
        const ratesRes = await db.query(`
            SELECT r.*, s.name as service_name
            FROM transport_contract_rates r
            JOIN transport_contracts c ON r.contract_id = c.id
            LEFT JOIN transport_services s ON r.service_id = s.id
            WHERE c.transport_id = $1
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
        const { code, name, tax_id, vehicle_type, phone, email, country, province, address, notes, transport_class, website, bank_account_name, bank_account_number, bank_name, market, rating, drive_link, contacts, services } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            `INSERT INTO transports (code, name, tax_id, vehicle_type, phone, email, country, province, address, notes, transport_class, website, bank_account_name, bank_account_number, bank_name, market, rating, drive_link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [code, name, tax_id, vehicle_type, phone, email, country, province, address, notes, transport_class, website, bank_account_name, bank_account_number, bank_name, market, rating || 0, drive_link || null]
        );
        const newId = result.rows[0].id;

        if (contacts && Array.isArray(contacts)) {
            for (const c of contacts) {
                if (c.name && c.name.trim() !== '') {
                    await client.query(
                        'INSERT INTO transport_contacts (transport_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5)',
                        [newId, c.name, c.position, c.phone, c.email]
                    );
                }
            }
        }

        if (services && Array.isArray(services)) {
            for (const s of services) {
                if (!s.name) continue;
                await client.query(
                    'INSERT INTO transport_services (transport_id, name, description, capacity, cost_price, net_price, sale_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [newId, s.name || null, s.description || null, s.capacity || null, s.cost_price || null, s.net_price || null, s.sale_price || null, s.notes || null]
                );
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'TRANSPORT',
                entity_id: newId,
                details: `Đã thêm mới Nhà xe: ${name}`
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
            code, name, tax_id, vehicle_type, phone, email, country, province, address, notes, transport_class, website, bank_account_name, bank_account_number, bank_name, market, rating, drive_link,
            contacts, services,
            deleted_contact_ids, deleted_service_ids
        } = req.body;

        await client.query('BEGIN');

        const result = await client.query(
            `UPDATE transports SET code=$1, name=$2, tax_id=$3, vehicle_type=$4, phone=$5, email=$6, country=$7, province=$8, address=$9, notes=$10, transport_class=$11, website=$12, bank_account_name=$13, bank_account_number=$14, bank_name=$15, market=$16, rating=$17, drive_link=$18, updated_at=CURRENT_TIMESTAMP WHERE id=$19 RETURNING *`,
            [code, name, tax_id, vehicle_type, phone, email, country, province, address, notes, transport_class, website, bank_account_name, bank_account_number, bank_name, market, rating || 0, drive_link || null, id]
        );

        if (deleted_contact_ids && deleted_contact_ids.length > 0) {
            await client.query('DELETE FROM transport_contacts WHERE id = ANY($1::int[])', [deleted_contact_ids]);
        }
        if (deleted_service_ids && deleted_service_ids.length > 0) {
            await client.query('DELETE FROM transport_services WHERE id = ANY($1::int[])', [deleted_service_ids]);
        }

        if (contacts !== undefined) {
            for (const c of contacts) {
                if (!c.name || c.name.trim() === '') continue;
                if (typeof c.id === 'string' || Number(c.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO transport_contacts (transport_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5)',
                        [id, c.name, c.position, c.phone, c.email]
                    );
                } else {
                    await client.query(
                        'UPDATE transport_contacts SET name=$1, position=$2, phone=$3, email=$4 WHERE id=$5',
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
                        'INSERT INTO transport_services (transport_id, name, description, capacity, cost_price, net_price, sale_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                        [id, s.name || null, s.description || null, s.capacity || null, s.cost_price || null, s.net_price || null, s.sale_price || null, s.notes || null]
                    );
                } else {
                    await client.query(
                        'UPDATE transport_services SET name=$1, description=$2, capacity=$3, cost_price=$4, net_price=$5, sale_price=$6, notes=$7 WHERE id=$8',
                        [s.name || null, s.description || null, s.capacity || null, s.cost_price || null, s.net_price || null, s.sale_price || null, s.notes || null, s.id]
                    );
                }
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'TRANSPORT',
                entity_id: id,
                details: `Cập nhật thông tin Nhà xe: ${name}`
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
                (SELECT COUNT(*) FROM transport_contracts WHERE transport_id = $1) as contract_count,
                (SELECT COUNT(*) FROM transport_services WHERE transport_id = $1) as service_count
        `, [id]);
        
        const deps = checkDeps.rows[0];
        const totalDeps = parseInt(deps.contract_count) + parseInt(deps.service_count);

        if (totalDeps > 0 && req.query.force !== 'true') {
            return res.status(409).json({ 
                message: `Nhà xe này đang có ${deps.contract_count} hợp đồng và ${deps.service_count} dịch vụ. Xóa sẽ xóa toàn bộ dữ liệu phụ lục bên trong.`,
                has_deps: true,
                dep_count: totalDeps
            });
        }

        await db.query('DELETE FROM transports WHERE id = $1', [id]);
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'TRANSPORT',
                entity_id: id,
                details: `Xóa Nhà xe ID ${id}`
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
        const { transport_id } = req.params;
        const { name, position, phone, email } = req.body;
        const result = await db.query(
            'INSERT INTO transport_contacts (transport_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [transport_id, name, position, phone, email]
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
            'UPDATE transport_contacts SET name=$1, position=$2, phone=$3, email=$4 WHERE id=$6 RETURNING *',
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
        await db.query('DELETE FROM transport_contacts WHERE id = $1', [contact_id]);
        res.json({ message: 'Deleted contact' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === SERVICES ===
exports.createService = async (req, res) => {
    try {
        const { transport_id } = req.params;
        const { name, description, capacity, cost_price, net_price, sale_price, notes } = req.body;
        const result = await db.query(
            'INSERT INTO transport_services (transport_id, name, description, capacity, cost_price, net_price, sale_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [transport_id, name || null, description || null, capacity || null, cost_price || null, net_price || null, sale_price || null, notes || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateService = async (req, res) => {
    try {
        const { service_id } = req.params;
        const { name, description, capacity, cost_price, net_price, sale_price, notes } = req.body;
        const result = await db.query(
            'UPDATE transport_services SET name=$1, description=$2, capacity=$3, cost_price=$4, net_price=$5, sale_price=$6, notes=$7 WHERE id=$9 RETURNING *',
            [name || null, description || null, capacity || null, cost_price || null, net_price || null, sale_price || null, notes || null, service_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteService = async (req, res) => {
    try {
        const { service_id } = req.params;
        await db.query('DELETE FROM transport_services WHERE id = $1', [service_id]);
        res.json({ message: 'Deleted service' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === CONTRACTS ===
exports.createContract = async (req, res) => {
    try {
        const { transport_id } = req.params;
        const { name, valid_from, valid_to, notes } = req.body;
        const result = await db.query(
            'INSERT INTO transport_contracts (transport_id, name, valid_from, valid_to, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [transport_id, name, valid_from || null, valid_to || null, notes]
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
            'UPDATE transport_contracts SET name=$1, valid_from=$2, valid_to=$3, notes=$4 WHERE id=$6 RETURNING *',
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
        await db.query('DELETE FROM transport_contracts WHERE id = $1', [contract_id]);
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
            `INSERT INTO transport_contract_rates (contract_id, service_id, fita_net, fita_sale, fita_commission, fite_net, fite_sale, fite_commission, series_net, series_sale, series_commission, charter_net, charter_sale, charter_commission) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
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
            `UPDATE transport_contract_rates SET service_id=$1, fita_net=$2, fita_sale=$3, fita_commission=$4, fite_net=$5, fite_sale=$6, fite_commission=$7, series_net=$8, series_sale=$9, series_commission=$10, charter_net=$11, charter_sale=$12, charter_commission=$13 WHERE id=$15 RETURNING *`,
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
        await db.query('DELETE FROM transport_contract_rates WHERE id = $1', [rate_id]);
        res.json({ message: 'Deleted rate' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === NOTES ===
exports.getNotes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT n.*, u.full_name as creator_name FROM transport_notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.transport_id = $1 ORDER BY n.created_at DESC',
            [req.params.transport_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addNote = async (req, res) => {
    const { transport_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO transport_notes (transport_id, content, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [transport_id, content, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add Transport Note Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// === MEDIA ===
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const storageDir = path.join(__dirname, '../public/uploads/transports');
if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, storageDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP) hoặc PDF'));
        }
    }
}).array('files', 10);

exports.uploadTransportMedia = (req, res) => {
    upload(req, res, async function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: 'Lỗi tải file: ' + err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'Không có file nào được tải lên' });
        }

        const transport_id = req.params.transport_id;
        const client = await db.pool.connect();

        try {
            await client.query('BEGIN');
            const results = [];
            for (const file of req.files) {
                const file_url = '/uploads/transports/' + file.filename;
                const file_type = file.mimetype === 'application/pdf' ? 'pdf' : 'image';
                
                const insertRes = await client.query(
                    'INSERT INTO transport_media (transport_id, file_url, file_name, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                    [transport_id, file_url, file.originalname, file_type, file.size]
                );
                results.push(insertRes.rows[0]);
            }
            await client.query('COMMIT');

            if (req.user) {
                await logActivity({
                    user_id: req.user.id,
                    action_type: 'UPDATE',
                    entity_type: 'TRANSPORT',
                    entity_id: transport_id,
                    details: `Tải lên ${req.files.length} file đính kèm/menu`
                });
            }

            res.status(201).json(results);
        } catch (error) {
            await client.query('ROLLBACK');
            req.files.forEach(f => {
                if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
            });
            console.error('Upload Error:', error);
            res.status(500).json({ message: 'Lỗi server khi lưu file' });
        } finally {
            client.release();
        }
    });
};

exports.getTransportMedia = async (req, res) => {
    try {
        const { transport_id } = req.params;
        const result = await db.query(
            'SELECT * FROM transport_media WHERE transport_id = $1 ORDER BY sort_order ASC, created_at DESC',
            [transport_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteTransportMedia = async (req, res) => {
    try {
        const { media_id } = req.params;
        const findRes = await db.query('SELECT * FROM transport_media WHERE id = $1', [media_id]);
        if (findRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy file' });
        
        const media = findRes.rows[0];
        await db.query('DELETE FROM transport_media WHERE id = $1', [media_id]);
        
        const filePath = path.join(__dirname, '../public', media.file_url);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'TRANSPORT',
                entity_id: media.transport_id,
                details: `Xóa file đính kèm: ${media.file_name}`
            });
        }

        res.json({ message: 'Xóa file thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
