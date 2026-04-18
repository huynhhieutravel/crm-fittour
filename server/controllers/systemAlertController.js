const db = require('../db');

exports.getMyAlerts = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(`
            SELECT * FROM system_alerts
            WHERE user_id = $1 AND is_resolved = FALSE
            ORDER BY created_at DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi getMyAlerts:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.resolveAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const result = await db.query(`
            UPDATE system_alerts 
            SET is_resolved = TRUE, resolved_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `, [id, userId]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy cảnh báo hoặc không có quyền' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Lỗi resolveAlert:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.resolveAll = async (req, res) => {
    try {
        const userId = req.user.id;
        
        await db.query(`
            UPDATE system_alerts 
            SET is_resolved = TRUE, resolved_at = CURRENT_TIMESTAMP
            WHERE user_id = $1 AND is_resolved = FALSE
        `, [userId]);
        
        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi resolveAll:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

/**
 * Hàm Utility để gọi nội bộ từ các controller khác
 */
exports.createAlert = async (userId, type, title, message, relatedId = null, link = null) => {
    try {
        if (!userId) return;
        const result = await db.query(`
            INSERT INTO system_alerts (user_id, alert_type, title, message, related_id, related_link)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [userId, type, title, message, relatedId, link]);
        return result.rows[0];
    } catch (err) {
        console.error('Lỗi createAlert (internal):', err);
    }
};
