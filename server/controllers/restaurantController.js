const db = require('../db');
const { generateSupplierCode } = require('../utils/supplierHelper');
const { logActivity } = require('../utils/logger');

// === RESTAURANTS ===
exports.getRestaurants = async (req, res) => {
    try {
        const { search, province, restaurant_class, market, market_group, page = 1, limit = 30 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM restaurants WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM restaurants WHERE 1=1';
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
        if (restaurant_class) {
            const filterClause = ` AND restaurant_class = $${paramIndex}`;
            query += filterClause;
            countQuery += filterClause;
            params.push(restaurant_class);
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

exports.getRestaurantDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurantRes = await db.query('SELECT * FROM restaurants WHERE id = $1', [id]);
        if (restaurantRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
        const restaurant = restaurantRes.rows[0];

        const contactsRes = await db.query('SELECT * FROM restaurant_contacts WHERE restaurant_id = $1 ORDER BY id ASC', [id]);
        const servicesRes = await db.query('SELECT * FROM restaurant_services WHERE restaurant_id = $1 ORDER BY id ASC', [id]);
        const contractsRes = await db.query('SELECT * FROM restaurant_contracts WHERE restaurant_id = $1 ORDER BY valid_from DESC', [id]);
        
        // Fetch all rates for this restaurant (joined with contracts)
        const ratesRes = await db.query(`
            SELECT r.*, s.name as service_name
            FROM restaurant_contract_rates r
            JOIN restaurant_contracts c ON r.contract_id = c.id
            LEFT JOIN restaurant_services s ON r.service_id = s.id
            WHERE c.restaurant_id = $1
        `, [id]);

        restaurant.contacts = contactsRes.rows;
        restaurant.services = servicesRes.rows;
        restaurant.contracts = contractsRes.rows;
        
        // Attach rates to contracts
        restaurant.contracts.forEach(contract => {
            contract.rates = ratesRes.rows.filter(r => r.contract_id === contract.id);
        });

        res.json(restaurant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.createRestaurant = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { 
            code, name, tax_id, phone, email, country, province, 
            address, notes, restaurant_class, website, cuisine_type, 
            bank_account_name, bank_account_number, bank_name, market, rating, drive_link,
            contacts, services
        } = req.body;

        await client.query('BEGIN');

        let finalCode = code;
        if (!finalCode || finalCode.trim() === '') {
            finalCode = await generateSupplierCode(client, 'restaurants', 'REST-');
        }

        const result = await client.query(
            `INSERT INTO restaurants (
                code, name, tax_id, phone, email, country, province, 
                address, notes, restaurant_class, website, cuisine_type, 
                bank_account_name, bank_account_number, bank_name, market, rating, drive_link
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [finalCode, name, tax_id, phone, email, country, province, address, notes, restaurant_class, website, cuisine_type, bank_account_name, bank_account_number, bank_name, market, rating || 0, drive_link || null]
        );
        const newRestaurantId = result.rows[0].id;

        // Xử lý Contacts (restaurant_contacts: name, position, phone, email, zalo, skype)
        if (contacts && Array.isArray(contacts)) {
            for (const c of contacts) {
                if (c.name && c.name.trim() !== '') {
                    await client.query(
                        'INSERT INTO restaurant_contacts (restaurant_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5)',
                        [newRestaurantId, c.name, c.position, c.phone, c.email]
                    );
                }
            }
        }

        // Xử lý Services (restaurant_services: name, description, capacity, cost_price, net_price, sale_price, notes)
        if (services && Array.isArray(services)) {
            for (const s of services) {
                if (!s.name) continue;
                await client.query(
                    'INSERT INTO restaurant_services (restaurant_id, name, description, capacity, cost_price, net_price, sale_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                    [newRestaurantId, s.name, s.description || null, s.capacity || null, s.cost_price || null, s.net_price || null, s.sale_price || null, s.notes || null]
                );
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'RESTAURANT',
                entity_id: newRestaurantId,
                details: `Đã thêm mới Nhà hàng: ${name}`,
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

exports.updateRestaurant = async (req, res) => {
    const client = await db.pool.connect();
    try {
        const { id } = req.params;
        const { 
            code, name, tax_id, phone, email, country, province, 
            address, notes, restaurant_class, website, cuisine_type, 
            bank_account_name, bank_account_number, bank_name, market, rating, drive_link,
            contacts, services,
            deleted_contact_ids, deleted_service_ids
        } = req.body;

        await client.query('BEGIN');

        // Fetch old data for logging
        const oldRestRes = await client.query('SELECT * FROM restaurants WHERE id = $1', [id]);
        if (oldRestRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
        }
        const oldRest = oldRestRes.rows[0];

        const result = await client.query(
            `UPDATE restaurants SET 
                code=$1, name=$2, tax_id=$3, phone=$4, email=$5, country=$6, province=$7, 
                address=$8, notes=$9, restaurant_class=$10, website=$11, cuisine_type=$12, 
                bank_account_name=$13, bank_account_number=$14, bank_name=$15, market=$16, rating=$17, drive_link=$18, updated_at=CURRENT_TIMESTAMP
            WHERE id=$19 RETURNING *`,
            [code, name, tax_id, phone, email, country, province, address, notes, restaurant_class, website, cuisine_type, bank_account_name, bank_account_number, bank_name, market, rating || 0, drive_link || null, id]
        );

        // --- XÓA CÁC ĐỐI TƯỢNG BỊ LOẠI BỎ (DELETE) ---
        if (deleted_contact_ids && deleted_contact_ids.length > 0) {
            await client.query('DELETE FROM restaurant_contacts WHERE id = ANY($1::int[])', [deleted_contact_ids]);
        }
        if (deleted_service_ids && deleted_service_ids.length > 0) {
            await client.query('DELETE FROM restaurant_services WHERE id = ANY($1::int[])', [deleted_service_ids]);
        }

        // --- CẬP NHẬT HOẶC TẠO MỚI (UPSERT) ---
        // Contacts (restaurant_contacts: name, position, phone, email)
        if (contacts !== undefined) {
            for (const c of contacts) {
                if (!c.name || c.name.trim() === '') continue;
                if (typeof c.id === 'string' || Number(c.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO restaurant_contacts (restaurant_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5)',
                        [id, c.name, c.position, c.phone, c.email]
                    );
                } else {
                    await client.query(
                        'UPDATE restaurant_contacts SET name=$1, position=$2, phone=$3, email=$4 WHERE id=$5',
                        [c.name, c.position, c.phone, c.email, c.id]
                    );
                }
            }
        }

        // Services (restaurant_services: name, description, capacity, cost_price, net_price, sale_price, notes)
        if (services !== undefined) {
            for (const s of services) {
                if (!s.name) continue;
                if (typeof s.id === 'string' || Number(s.id) > 1000000000000) {
                    await client.query(
                        'INSERT INTO restaurant_services (restaurant_id, name, description, capacity, cost_price, net_price, sale_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                        [id, s.name, s.description || null, s.capacity || null, s.cost_price || null, s.net_price || null, s.sale_price || null, s.notes || null]
                    );
                } else {
                    await client.query(
                        'UPDATE restaurant_services SET name=$1, description=$2, capacity=$3, cost_price=$4, net_price=$5, sale_price=$6, notes=$7 WHERE id=$8',
                        [s.name, s.description || null, s.capacity || null, s.cost_price || null, s.net_price || null, s.sale_price || null, s.notes || null, s.id]
                    );
                }
            }
        }

        await client.query('COMMIT');

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'RESTAURANT',
                entity_id: id,
                details: `Cập nhật thông tin Nhà hàng: ${name}`,
                old_data: oldRest,
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

exports.deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch old data for logging
        const oldRestRes = await db.query('SELECT * FROM restaurants WHERE id = $1', [id]);
        if (oldRestRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy nhà hàng' });
        const oldRest = oldRestRes.rows[0];

        const checkDeps = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM restaurant_contracts WHERE restaurant_id = $1) as contract_count,
                (SELECT COUNT(*) FROM restaurant_services WHERE restaurant_id = $1) as service_count
        `, [id]);
        
        const deps = checkDeps.rows[0];
        const totalDeps = parseInt(deps.contract_count) + parseInt(deps.service_count);

        if (totalDeps > 0 && req.query.force !== 'true') {
            return res.status(409).json({ 
                message: `Nhà hàng này đang có ${deps.contract_count} hợp đồng và ${deps.service_count} dịch vụ. Xóa nhà hàng sẽ xóa toàn bộ dữ liệu phụ lục bên trong.`,
                has_deps: true,
                dep_count: totalDeps
            });
        }

        await db.query('DELETE FROM restaurants WHERE id = $1', [id]);
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'RESTAURANT',
                entity_id: id,
                details: `Xóa Nhà hàng: ${oldRest.name}`,
                old_data: oldRest
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
        const { restaurant_id } = req.params;
        const { name, position, phone, email } = req.body;
        const result = await db.query(
            'INSERT INTO restaurant_contacts (restaurant_id, name, position, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [restaurant_id, name, position, phone, email]
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
            'UPDATE restaurant_contacts SET name=$1, position=$2, phone=$3, email=$4 WHERE id=$5 RETURNING *',
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
        await db.query('DELETE FROM restaurant_contacts WHERE id = $1', [contact_id]);
        res.json({ message: 'Deleted contact' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === SERVICES ===
exports.createRoomType = async (req, res) => {
    try {
        const { restaurant_id } = req.params;
        const { name, description, capacity, cost_price, net_price, sale_price, notes } = req.body;
        const result = await db.query(
            'INSERT INTO restaurant_services (restaurant_id, name, description, capacity, cost_price, net_price, sale_price, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [restaurant_id, name, description, capacity || null, cost_price || null, net_price || null, sale_price || null, notes || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateRoomType = async (req, res) => {
    try {
        const { room_id } = req.params;
        const { name, description, capacity, cost_price, net_price, sale_price, notes } = req.body;
        const result = await db.query(
            'UPDATE restaurant_services SET name=$1, description=$2, capacity=$3, cost_price=$4, net_price=$5, sale_price=$6, notes=$7 WHERE id=$8 RETURNING *',
            [name, description, capacity, cost_price || null, net_price || null, sale_price || null, notes || null, room_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteRoomType = async (req, res) => {
    try {
        const { room_id } = req.params;
        await db.query('DELETE FROM restaurant_services WHERE id = $1', [room_id]);
        res.json({ message: 'Deleted service' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === CONTRACTS ===
exports.createContract = async (req, res) => {
    try {
        const { restaurant_id } = req.params;
        const { name, valid_from, valid_to, notes } = req.body;
        const result = await db.query(
            'INSERT INTO restaurant_contracts (restaurant_id, name, valid_from, valid_to, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [restaurant_id, name, valid_from || null, valid_to || null, notes]
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
            'UPDATE restaurant_contracts SET name=$1, valid_from=$2, valid_to=$3, notes=$4 WHERE id=$5 RETURNING *',
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
        await db.query('DELETE FROM restaurant_contracts WHERE id = $1', [contract_id]);
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
            `INSERT INTO restaurant_contract_rates 
             (contract_id, service_id, fita_net, fita_sale, fita_commission, fite_net, fite_sale, fite_commission, series_net, series_sale, series_commission, charter_net, charter_sale, charter_commission) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
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
            `UPDATE restaurant_contract_rates SET 
             service_id=$1, fita_net=$2, fita_sale=$3, fita_commission=$4, fite_net=$5, fite_sale=$6, fite_commission=$7, series_net=$8, series_sale=$9, series_commission=$10, charter_net=$11, charter_sale=$12, charter_commission=$13
             WHERE id=$14 RETURNING *`,
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
        await db.query('DELETE FROM restaurant_contract_rates WHERE id = $1', [rate_id]);
        res.json({ message: 'Deleted rate' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// === NOTES ===
exports.getRestaurantNotes = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT n.*, u.full_name as creator_name FROM restaurant_notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.restaurant_id = $1 ORDER BY n.created_at DESC',
            [req.params.restaurant_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.addRestaurantNote = async (req, res) => {
    const { restaurant_id } = req.params;
    const { content } = req.body;
    const user_id = req.user.id;
    try {
        const result = await db.query(
            'INSERT INTO restaurant_notes (restaurant_id, content, user_id) VALUES ($1, $2, $3) RETURNING *',
            [restaurant_id, content, user_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Add Restaurant Note Error:', err);
        res.status(500).json({ message: err.message });
    }
};

// === MEDIA GALLERY ===
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const mediaUploadDir = path.join(__dirname, '../public/uploads/restaurants');
if (!fs.existsSync(mediaUploadDir)) {
    fs.mkdirSync(mediaUploadDir, { recursive: true });
}

const mediaStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, mediaUploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'rest-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const mediaUpload = multer({
    storage: mediaStorage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ cho phép file ảnh (JPG, PNG, WebP) hoặc PDF'));
        }
    }
}).single('file');

exports.getRestaurantMedia = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM restaurant_media WHERE restaurant_id = $1 ORDER BY sort_order ASC, id ASC',
            [req.params.restaurant_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.uploadRestaurantMedia = async (req, res) => {
    const { restaurant_id } = req.params;

    // Check current count before uploading
    try {
        const countRes = await db.query('SELECT COUNT(*) as total FROM restaurant_media WHERE restaurant_id = $1', [restaurant_id]);
        if (parseInt(countRes.rows[0].total) >= 10) {
            return res.status(400).json({ message: 'Tối đa 10 file cho mỗi nhà hàng. Vui lòng xóa file cũ trước.' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    mediaUpload(req, res, async (uploadErr) => {
        if (uploadErr) {
            if (uploadErr.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File quá lớn! Tối đa 10MB.' });
            }
            return res.status(400).json({ message: uploadErr.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'Không có file nào được tải lên.' });
        }

        try {
            const fileUrl = `/uploads/restaurants/${req.file.filename}`;
            const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
            const result = await db.query(
                'INSERT INTO restaurant_media (restaurant_id, file_url, file_name, file_type, file_size) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [restaurant_id, fileUrl, req.file.originalname, fileType, req.file.size]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
    });
};

exports.deleteRestaurantMedia = async (req, res) => {
    try {
        const { media_id } = req.params;
        const mediaRes = await db.query('SELECT * FROM restaurant_media WHERE id = $1', [media_id]);
        if (mediaRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy file' });

        const media = mediaRes.rows[0];
        // Delete physical file
        const filename = path.basename(media.file_url);
        const filePath = path.join(mediaUploadDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await db.query('DELETE FROM restaurant_media WHERE id = $1', [media_id]);
        res.json({ message: 'Đã xóa file thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
