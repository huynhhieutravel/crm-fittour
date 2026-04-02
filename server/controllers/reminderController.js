const db = require('../db');

exports.getTodayReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        // Chúng ta lấy nhắc nhở cho sale cụ thể, mà due_date tới hạn (<= hôm nay) và chưa completed
        const result = await db.query(`
            SELECT br.*, 
                   b.booking_code,
                   c.name as customer_name, c.phone as customer_phone,
                   td.start_date, td.end_date, t.name as tour_name
            FROM booking_reminders br
            JOIN bookings b ON br.booking_id = b.id
            JOIN customers c ON br.customer_id = c.id
            JOIN tour_departures td ON b.tour_departure_id = td.id
            JOIN tour_templates t ON td.tour_template_id = t.id
            WHERE br.assigned_to = $1 
              AND br.status = 'PENDING'
              AND br.due_date <= CURRENT_DATE
            ORDER BY br.due_date ASC, br.created_at ASC
        `, [userId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi getTodayReminders:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getAllReminders = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.query(`
            SELECT br.*, 
                   u.full_name as staff_name,
                   tt.name as tour_name,
                   td.start_date as tour_start_date,
                   td.code as tour_code,
                   (SELECT COUNT(*) FROM bookings WHERE tour_departure_id = td.id AND booking_status IN ('confirmed', 'Thành công')) as total_pax
            FROM departure_reminders br
            JOIN tour_departures td ON br.tour_departure_id = td.id
            JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN users u ON br.assigned_to = u.id
            WHERE br.assigned_to = $1 OR br.assigned_to IS NULL OR ((SELECT role FROM users WHERE id = $1) IN ('admin', 'manager', 'operations'))
            ORDER BY br.status DESC, br.due_date ASC
        `, [userId]);
        
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi getAllReminders:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.markDone = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            UPDATE departure_reminders 
            SET status = 'COMPLETED', resolved_at = CURRENT_TIMESTAMP
            WHERE id = $1 AND (assigned_to = $2 OR assigned_to IS NULL OR (SELECT role FROM users WHERE id = $2) IN ('admin', 'manager', 'operations'))
            RETURNING *
        `, [id, req.user.id]);
        
        if (result.rows.length === 0) return res.status(403).json({ message: 'Không có quyền hoặc không tìm thấy nhắc nhở' });
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Lỗi markDone reminder:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.getDeparturesReminders = async (req, res) => {
    try {
        const { tour_departure_id } = req.params;
        let result = await db.query(`
            SELECT br.*, 
                   u.full_name as staff_name
            FROM departure_reminders br
            LEFT JOIN users u ON br.assigned_to = u.id
            WHERE br.tour_departure_id = $1
            ORDER BY 
              CASE WHEN br.status = 'COMPLETED' THEN 1 ELSE 0 END, 
              br.due_date ASC
        `, [tour_departure_id]);
        
        // Auto-generate system defaults if empty (due to lazy init)
        if (result.rows.length === 0) {
            const reminderEngine = require('../cron/reminderEngine');
            await reminderEngine.generateReminders();
            
            result = await db.query(`
                SELECT br.*, 
                       u.full_name as staff_name
                FROM departure_reminders br
                LEFT JOIN users u ON br.assigned_to = u.id
                WHERE br.tour_departure_id = $1
                ORDER BY 
                  CASE WHEN br.status = 'COMPLETED' THEN 1 ELSE 0 END, 
                  br.due_date ASC
            `, [tour_departure_id]);
        }

        
        res.json(result.rows);
    } catch (err) {
        console.error('Lỗi getDeparturesReminders:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.createCustomReminder = async (req, res) => {
    try {
        const { tour_departure_id, custom_title, due_date, assigned_to } = req.body;
        // Loại nhắc nhở CUSTOM sẽ được sinh ID chuỗi để không bị conflict
        const customType = 'CUSTOM_' + Date.now();
        
        const result = await db.query(`
            INSERT INTO departure_reminders (tour_departure_id, type, due_date, assigned_to, custom_title, status)
            VALUES ($1, $2, $3, $4, $5, 'PENDING')
            RETURNING *
        `, [tour_departure_id, customType, due_date, assigned_to, custom_title]);
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Lỗi createCustomReminder:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.updateReminder = async (req, res) => {
    try {
        const { id } = req.params;
        const { custom_title, due_date, assigned_to } = req.body;
        
        const result = await db.query(`
            UPDATE departure_reminders 
            SET custom_title = COALESCE($1, custom_title), 
                due_date = $2, 
                assigned_to = COALESCE($3, assigned_to)
            WHERE id = $4
            RETURNING *
        `, [custom_title, due_date, assigned_to, id]);
        
        res.json({ success: true, item: result.rows[0] });
    } catch (err) {
        console.error('Lỗi updateReminder:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        const { id } = req.params;
        // Only allow deleting CUSTOM reminders to prevent system reminders from being removed entirely?
        // Actually, let users delete any reminder they want if they are admin/manager. Let's keep it simple.
        await db.query(`
            DELETE FROM departure_reminders 
            WHERE id = $1 AND type LIKE 'CUSTOM_%'
        `, [id]);
        
        res.json({ success: true });
    } catch (err) {
        console.error('Lỗi deleteReminder:', err);
        res.status(500).json({ message: 'Lỗi server' });
    }
};
