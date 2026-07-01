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

exports.getTrash = async (req, res) => {
    try {
        const { type } = req.query; // 'OP_TOUR' or 'BOOKING'
        let data = [];
        if (type === 'OP_TOUR') {
            const result = await db.query(`
                SELECT td.id, td.code, td.start_date, td.status, td.created_at, tt.name as tour_name, td.tour_info
                FROM tour_departures_raw td
                LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
                WHERE td.is_deleted = true
                ORDER BY td.updated_at DESC
            `);
            data = result.rows.map(row => ({...row, tour_name: row.tour_name || (row.tour_info ? row.tour_info.tour_name : 'Unknown')}));
        } else if (type === 'BOOKING') {
            const result = await db.query(`
                SELECT b.id, b.booking_code, b.pax_count, b.total_price, b.booking_status, b.created_at, td.code as tour_code, c.name as customer_name
                FROM bookings_raw b
                LEFT JOIN tour_departures_raw td ON b.tour_departure_id = td.id
                LEFT JOIN customers c ON b.customer_id = c.id
                WHERE b.is_deleted = true
                ORDER BY b.updated_at DESC
            `);
            data = result.rows;
        }
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi lấy thùng rác' });
    }
};

exports.restoreTrash = async (req, res) => {
    try {
        const { type, id } = req.body;
        if (type === 'OP_TOUR') {
            await db.query(`UPDATE tour_departures_raw SET is_deleted = false WHERE id = $1`, [id]);
            if (global.logActivity) {
                await global.logActivity({ user_id: req.user ? req.user.id : null, action_type: 'RESTORE', entity_type: 'OP_TOUR', entity_id: id, details: 'Phục hồi Lịch khởi hành từ thùng rác' });
            }
        } else if (type === 'BOOKING') {
            await db.query(`UPDATE bookings_raw SET is_deleted = false WHERE id = $1`, [id]);
            if (global.logActivity) {
                await global.logActivity({ user_id: req.user ? req.user.id : null, action_type: 'RESTORE', entity_type: 'BOOKING', entity_id: id, details: 'Phục hồi Khách hàng từ thùng rác' });
            }
        }
        res.json({ message: 'Phục hồi thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi phục hồi' });
    }
};
