const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getAll = async (req, res) => {
    try {
        const { search, market, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        let query = 'SELECT vt.*, u.full_name as created_by_name FROM visa_templates vt LEFT JOIN users u ON vt.created_by = u.id WHERE 1=1';
        let countQuery = 'SELECT COUNT(*) as total FROM visa_templates vt WHERE 1=1';
        let params = [];
        let paramIndex = 1;

        if (search) {
            const searchClause = ` AND (vt.name ILIKE $${paramIndex})`;
            query += searchClause;
            countQuery += searchClause;
            params.push(`%${search}%`);
            paramIndex++;
        }
        
        if (market) {
            const filterClause = ` AND vt.market = $${paramIndex}`;
            query += filterClause;
            countQuery += filterClause;
            params.push(market);
            paramIndex++;
        }

        query += ` ORDER BY COALESCE(vt.is_active, true) DESC, vt.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
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
        console.error('Lỗi getAll visa_templates:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM visa_templates WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy Sản phẩm Visa' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.create = async (req, res) => {
    try {
        const { name, visa_type, market, checklist_config, is_active } = req.body;
        const created_by = req.user?.id;

        const result = await db.query(
            `INSERT INTO visa_templates (name, visa_type, market, checklist_config, is_active, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [name, visa_type, market, checklist_config ? JSON.stringify(checklist_config) : '[]', is_active !== undefined ? is_active : true, created_by]
        );
        
        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'CREATE',
                entity_type: 'VISA_TEMPLATE',
                entity_id: result.rows[0].id,
                details: `Tạo mới Sản phẩm Visa: ${name}`,
                new_data: result.rows[0]
            });
        }
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, visa_type, market, checklist_config, is_active } = req.body;

        const oldRes = await db.query('SELECT * FROM visa_templates WHERE id = $1', [id]);
        if (oldRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy Sản phẩm Visa' });
        const oldData = oldRes.rows[0];

        const result = await db.query(
            `UPDATE visa_templates SET name=$1, visa_type=$2, market=$3, checklist_config=$4, is_active=$5, updated_at=CURRENT_TIMESTAMP WHERE id=$6 RETURNING *`,
            [name, visa_type, market, checklist_config ? JSON.stringify(checklist_config) : '[]', is_active !== undefined ? is_active : true, id]
        );

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'UPDATE',
                entity_type: 'VISA_TEMPLATE',
                entity_id: id,
                details: `Cập nhật Sản phẩm Visa: ${name}`,
                old_data: oldData,
                new_data: result.rows[0]
            });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        
        const checkRes = await db.query('SELECT COUNT(*) as c FROM visas WHERE visa_template_id = $1', [id]);
        if (parseInt(checkRes.rows[0].c) > 0) {
            return res.status(400).json({ message: 'Không thể xóa Sản phẩm Visa đã có hồ sơ liên kết. Vui lòng tắt Trạng thái (is_active) thay vì xóa.' });
        }

        const oldRes = await db.query('SELECT * FROM visa_templates WHERE id = $1', [id]);
        if (oldRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy Sản phẩm Visa' });

        await db.query('DELETE FROM visa_templates WHERE id = $1', [id]);

        if (req.user) {
            await logActivity({
                user_id: req.user.id,
                action_type: 'DELETE',
                entity_type: 'VISA_TEMPLATE',
                entity_id: id,
                details: `Xóa Sản phẩm Visa: ${oldRes.rows[0].name}`,
                old_data: oldRes.rows[0]
            });
        }
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};
