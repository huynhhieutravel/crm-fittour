const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getEvents = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        console.log(`[B2B EVENTS] Fetching events from ${start_date} to ${end_date}`);

        // 1. Get Leaders with DOB (for birthdays)
        const leadersRes = await db.query(`
            SELECT gl.id as group_leader_id, gl.name, gl.phone, gl.email, gl.dob, 
                   gl.company_id, c.name as company_name, gl.assigned_to
            FROM group_leaders gl
            LEFT JOIN b2b_companies c ON gl.company_id = c.id
            WHERE gl.dob IS NOT NULL AND gl.contact_status = 'active'
        `);
        
        // 2. Get Companies with founded_date
        const companiesRes = await db.query(`
            SELECT id as company_id, name as company_name, founded_date
            FROM b2b_companies
            WHERE founded_date IS NOT NULL
        `);
        
        // 3. Get custom events
        let eventsQuery = `
            SELECT gle.*, gl.name as leader_name, gl.phone, 
                   COALESCE(c.name, gl.company_name) as company_name, 
                   u.full_name as creator_name
            FROM group_leader_events gle
            LEFT JOIN group_leaders gl ON gle.group_leader_id = gl.id
            LEFT JOIN b2b_companies c ON gle.company_id = c.id
            LEFT JOIN users u ON gle.created_by = u.id
            WHERE 1=1
        `;
        let eventsParams = [];

        if (start_date && end_date) {
            eventsQuery += ` AND gle.event_date >= $1 AND gle.event_date <= $2`;
            eventsParams.push(start_date, end_date);
        }

        const eventsRes = await db.query(eventsQuery, eventsParams);
        const allEvents = [...eventsRes.rows];
        
        // Add Birthday & Founding events
        if (start_date && end_date) {
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const currentYear = startDate.getFullYear();
            
            // Birthdays from leaders (personal)
            leadersRes.rows.forEach(l => {
                const bDate = new Date(l.dob);
                if (isNaN(bDate)) return;
                const companyLabel = l.company_name ? ` (${l.company_name})` : '';
                [currentYear - 1, currentYear, currentYear + 1].forEach(year => {
                    const bd = new Date(year, bDate.getMonth(), bDate.getDate());
                    if (bd >= startDate && bd <= endDate) {
                        allEvents.push({ 
                            group_leader_id: l.group_leader_id, company_id: l.company_id,
                            name: l.name, phone: l.phone, company_name: l.company_name,
                            event_date: bd, event_type: 'BIRTHDAY', 
                            title: `🎂 Sinh nhật ${l.name}${companyLabel}` 
                        });
                    }
                });
            });
            
            // Founding dates from companies (organizational)
            companiesRes.rows.forEach(c => {
                const fDate = new Date(c.founded_date);
                if (isNaN(fDate)) return;
                [currentYear - 1, currentYear, currentYear + 1].forEach(year => {
                    const fd = new Date(year, fDate.getMonth(), fDate.getDate());
                    if (fd >= startDate && fd <= endDate) {
                        const yearsAgo = year - fDate.getFullYear();
                        allEvents.push({ 
                            company_id: c.company_id, company_name: c.company_name,
                            event_date: fd, event_type: 'FOUNDING', 
                            title: `🏢 Kỷ niệm ${yearsAgo} năm thành lập ${c.company_name}` 
                        });
                    }
                });
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
        const { group_leader_id, company_id, title, event_type, event_date, description } = req.body;
        
        const result = await db.query(
            `INSERT INTO group_leader_events (group_leader_id, company_id, title, event_type, event_date, description, created_by) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [group_leader_id || null, company_id || null, title, event_type, event_date, description, req.user ? req.user.id : null]
        );
        
        const newEvent = result.rows[0];
        
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'GROUP_LEADER_EVENT',
            entity_id: newEvent.id,
            details: `Thêm lịch chăm sóc B2B: ${title}`
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
        await db.query('DELETE FROM group_leader_events WHERE id = $1', [id]);
        res.json({ message: 'Deleted event' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const result = await db.query('UPDATE group_leader_events SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, event_type, event_date, description, company_id, group_leader_id } = req.body;
        
        const result = await db.query(`
            UPDATE group_leader_events 
            SET title = $1, event_type = $2, event_date = $3, description = $4, company_id = $5, group_leader_id = $6
            WHERE id = $7 
            RETURNING *
        `, [title, event_type, event_date, description, company_id || null, group_leader_id || null, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
