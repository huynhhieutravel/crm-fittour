const db = require('../db');

exports.getOrgChart = async (req, res) => {
    try {
        const result = await db.query('SELECT value FROM app_settings WHERE key = $1', ['org_chart']);
        if (result.rows.length > 0) {
            res.json(result.rows[0].value || { nodes: [], edges: [] });
        } else {
            res.json({ nodes: [], edges: [] });
        }
    } catch (err) {
        console.error('getOrgChart Error:', err);
        res.status(500).json({ error: 'Lỗi khi tải sơ đồ tổ chức' });
    }
};

exports.saveOrgChart = async (req, res) => {
    try {
        const data = req.body; // { nodes: [...], edges: [...] }
        await db.query(`
            INSERT INTO app_settings (key, value, updated_at) 
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (key) DO UPDATE 
            SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
        `, ['org_chart', JSON.stringify(data)]);
        
        // Log activity
        try {
            await db.query(`
                INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details)
                VALUES ($1, $2, $3, $4, $5)
            `, [req.user.id, 'UPDATE', 'SYSTEM', 0, 'Admin cập nhật Sơ đồ tổ chức']);
        } catch (logErr) {
            console.error('Failed to log activity:', logErr);
        }

        res.json({ message: 'Lưu sơ đồ tổ chức thành công!' });
    } catch (err) {
        console.error('saveOrgChart Error:', err);
        res.status(500).json({ error: 'Lỗi khi lưu sơ đồ tổ chức' });
    }
};
