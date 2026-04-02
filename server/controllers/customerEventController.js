const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getEvents = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        console.log(`[CUSTOMER EVENTS] Fetching events from ${start_date} to ${end_date}`);

        // 1. Get Birthdays in range
        let birthdayQuery = `
            SELECT id as customer_id, name, phone, email, birth_date as date, customer_segment, assigned_to
            FROM customers
            WHERE birth_date IS NOT NULL
        `;
        let birthdayParams = [];
        
        let eventsQuery = `
            SELECT ce.*, c.name as customer_name, c.phone, c.customer_segment, u.full_name as creator_name
            FROM customer_events ce
            JOIN customers c ON ce.customer_id = c.id
            LEFT JOIN users u ON ce.created_by = u.id
            WHERE 1=1
        `;
        let eventsParams = [];

        if (start_date && end_date) {
            eventsQuery += ` AND ce.event_date >= $1 AND ce.event_date <= $2`;
            eventsParams.push(start_date, end_date);
            
            // Birthday logic: we need to find if the month/day falls within the range.
            // Simplified: we will fetch all birthdays and filter in Javascript
        }

        const eventsRes = await db.query(eventsQuery, eventsParams);
        const customersRes = await db.query(birthdayQuery, birthdayParams);
        
        const allEvents = [...eventsRes.rows];
        
        // Add Birthday events
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const currentYear = startDate.getFullYear();
            
            customersRes.rows.forEach(c => {
                const bDate = new Date(c.date);
                if (isNaN(bDate)) return;
                
                const bThisYear = new Date(currentYear, bDate.getMonth(), bDate.getDate());
                const bNextYear = new Date(currentYear + 1, bDate.getMonth(), bDate.getDate());
                const bPrevYear = new Date(currentYear - 1, bDate.getMonth(), bDate.getDate());
                
                if (bThisYear >= startDate && bThisYear <= endDate) {
                    allEvents.push({ ...c, event_date: bThisYear, event_type: 'BIRTHDAY', title: `Sinh nhật ${c.name}` });
                }
                if (bNextYear >= startDate && bNextYear <= endDate) {
                    allEvents.push({ ...c, event_date: bNextYear, event_type: 'BIRTHDAY', title: `Sinh nhật ${c.name}` });
                }
                if (bPrevYear >= startDate && bPrevYear <= endDate) {
                    allEvents.push({ ...c, event_date: bPrevYear, event_type: 'BIRTHDAY', title: `Sinh nhật ${c.name}` });
                }
            });
        }

        res.json(allEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const { customer_id, title, event_type, event_date, description } = req.body;
        
        const result = await db.query(
            `INSERT INTO customer_events (customer_id, title, event_type, event_date, description, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
            [customer_id, title, event_type, event_date, description, req.user ? req.user.id : null]
        );
        
        const newEvent = result.rows[0];
        
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'CUSTOMER_EVENT',
            entity_id: newEvent.id,
            details: `Thêm sự kiện: ${title}`
        });

        res.status(201).json(newEvent);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM customer_events WHERE id = $1', [id]);
        res.json({ message: 'Deleted event' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await db.query('UPDATE customer_events SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, event_type, event_date, description } = req.body;
        
        // Cập nhật và lấy thông tin creator
        const result = await db.query(`
            UPDATE customer_events 
            SET title = $1, event_type = $2, event_date = $3, description = $4
            WHERE id = $5 
            RETURNING *
        `, [title, event_type, event_date, description, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
