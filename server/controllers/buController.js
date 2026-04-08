const db = require('../db');

exports.getAllBUs = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM business_units ORDER BY sort_order ASC, id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi tải danh sách BU' });
    }
};

exports.updateBU = async (req, res) => {
    const { id } = req.params;
    const { label, countries, description, is_active, sort_order, keywords } = req.body;
    
    console.log(`[BU_DEBUG] UPDATE REQUEST - ID: ${id}`);
    console.log(`[BU_DEBUG] Payload:`, { label, countries, description, is_active, sort_order });
    
    try {
        const result = await db.query(
            'UPDATE business_units SET label = $1, countries = $2, description = $3, is_active = $4, sort_order = $5, keywords = $6, updated_at = NOW() WHERE id = $7 RETURNING *',
            [label, countries, description, is_active, sort_order, keywords || [], id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy BU' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi cập nhật BU' });
    }
};

exports.reorderBUs = async (req, res) => {
    const { orders } = req.body; 
    console.log(`[BU_DEBUG] REORDER REQUEST - Count: ${orders?.length}`);
    
    if (!orders || !Array.isArray(orders)) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        for (const item of orders) {
            console.log(`[BU_DEBUG] Setting ${item.id} -> order ${item.sort_order}`);
            await client.query('UPDATE business_units SET sort_order = $1 WHERE id = $2', [item.sort_order, item.id]);
        }
        await client.query('COMMIT');
        console.log(`[BU_DEBUG] REORDER COMMIT SUCCESS`);
        res.json({ message: 'Sắp xếp thành công' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(`[BU_DEBUG] REORDER FAILED:`, err);
        res.status(500).json({ message: 'Lỗi khi sắp xếp BU' });
    } finally {
        client.release();
    }
};

exports.createBU = async (req, res) => {
    const { id, label, countries, description, keywords } = req.body;
    try {
        const maxOrderResult = await db.query('SELECT MAX(sort_order) as max_order FROM business_units');
        const nextOrder = (maxOrderResult.rows[0].max_order || 0) + 1;

        const result = await db.query(
            'INSERT INTO business_units (id, label, countries, description, keywords, is_active, sort_order, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, TRUE, $6, NOW(), NOW()) RETURNING *',
            [id, label, countries, description, keywords || [], nextOrder]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi tạo BU mới' });
    }
};
