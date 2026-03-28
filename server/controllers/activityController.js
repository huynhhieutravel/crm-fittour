const db = require('../db');

exports.getActivityLogs = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT al.*, u.full_name as user_name, u.username 
            FROM activity_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 50
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
