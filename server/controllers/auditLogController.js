const db = require('../db');

exports.getAuditLogs = async (req, res) => {
    try {
        const { module, action_type, user_id, start_date, end_date, page = 1, limit = 50 } = req.query;
        const offset = (page - 1) * limit;

        const values = [];
        let conditions = [];

        if (module) {
            if (module.includes(',')) {
                const modules = module.split(',');
                const placeholders = modules.map(m => {
                    values.push(m);
                    return `$${values.length}`;
                }).join(',');
                conditions.push(`l.entity_type IN (${placeholders})`);
            } else {
                values.push(module);
                conditions.push(`l.entity_type = $${values.length}`);
            }
        }
        if (action_type) {
            values.push(action_type);
            conditions.push(`l.action_type = $${values.length}`);
        }
        if (user_id) {
            values.push(user_id);
            conditions.push(`l.user_id = $${values.length}`);
        }
        if (start_date) {
            values.push(start_date);
            conditions.push(`l.created_at >= $${values.length}::timestamp`);
        }
        if (end_date) {
            values.push(`${end_date} 23:59:59`); // Include the whole day
            conditions.push(`l.created_at <= $${values.length}::timestamp`);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Query total count
        const countRes = await db.query(
            `SELECT COUNT(*) FROM activity_logs l ${whereClause}`,
            values
        );
        const totalItems = parseInt(countRes.rows[0].count);

        // Query logs joined with users
        const itemsRes = await db.query(`
            SELECT l.*, u.full_name, u.username
            FROM activity_logs l
            LEFT JOIN users u ON l.user_id = u.id
            ${whereClause}
            ORDER BY l.created_at DESC
            LIMIT $${values.length + 1} OFFSET $${values.length + 2}
        `, [...values, limit, offset]);

        res.json({
            data: itemsRes.rows,
            total: totalItems,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(totalItems / limit)
        });

    } catch (err) {
        console.error('Lỗi khi lấy audit logs:', err.message);
        res.status(500).json({ message: 'Lỗi server khi lấy nhật ký hệ thống.' });
    }
};
