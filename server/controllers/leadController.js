const db = require('../db');

exports.getAllLeads = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT l.*, tt.name as tour_name, u.full_name as assigned_to_name,
                   (SELECT COUNT(*)::int FROM lead_notes WHERE lead_id = l.id) as notes_count,
                   (SELECT content FROM lead_notes WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as latest_note,
                   (SELECT created_at FROM lead_notes WHERE lead_id = l.id ORDER BY created_at DESC LIMIT 1) as latest_note_at
            FROM leads l 
            LEFT JOIN tour_templates tt ON l.tour_id = tt.id 
            LEFT JOIN users u ON l.assigned_to = u.id 
            ORDER BY l.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createLead = async (req, res) => {
    try {
        const { name, phone, email, source, tour_id, assigned_to, consultation_note, bu_group, gender, birth_date, classification, last_contacted_at } = req.body;
        
        console.log('ENTERING createLead with body:', req.body);

        // Broadly handle empty, null, or undefined for all optional fields
        const finalTourId = (!tour_id || tour_id === '') ? null : tour_id;
        const finalAssignedTo = (!assigned_to || assigned_to === '') ? null : assigned_to;
        const finalBirthDate = (!birth_date || birth_date === '') ? null : birth_date;
        const finalLastContacted = (!last_contacted_at || last_contacted_at === '') ? new Date() : last_contacted_at;
        const finalEmail = (!email || email === '') ? null : email;
        const finalPhone = (!phone || phone === '') ? null : phone;
        const finalConsultationNote = (!consultation_note || consultation_note === '') ? null : consultation_note;
        const finalBuGroup = (!bu_group || bu_group === '') ? null : bu_group;
        const finalGender = (!gender || gender === '') ? null : gender;

        const result = await db.query(
            'INSERT INTO leads (name, phone, email, source, tour_id, assigned_to, status, consultation_note, bu_group, gender, birth_date, classification, last_contacted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [name, finalPhone, finalEmail, source || 'Messenger', finalTourId, finalAssignedTo, 'Mới', finalConsultationNote, finalBuGroup, finalGender, finalBirthDate, classification || 'Mới', finalLastContacted]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        const fs = require('fs');
        const logContent = `[${new Date().toISOString()}] CONTROLLER ERROR: ${err.message}\n` +
                          `STACK: ${err.stack}\n` +
                          `BODY: ${JSON.stringify(req.body, null, 2)}\n\n`;
        fs.appendFileSync('./loi_tao_lead.txt', logContent);
        console.error('Create Lead Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.getLeadById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM leads WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lead' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateLead = async (req, res) => {
    const { name, phone, email, source, tour_id, status, assigned_to, consultation_note, bu_group, gender, birth_date, classification, last_contacted_at, won_at } = req.body;
    
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        // Handle tour_id and assigned_to if they are empty strings
        const finalTourId = (tour_id === '' || tour_id === undefined) ? null : tour_id;
        const finalAssignedTo = (assigned_to === '' || assigned_to === undefined) ? null : assigned_to;
        const finalBirthDate = (birth_date === '' || birth_date === undefined) ? null : birth_date;
        
        let finalWonAt = won_at;
        
        // If status is changed to 'Chốt đơn' and won_at is not set, set it to now
        if (status === 'Chốt đơn' && !won_at) {
            finalWonAt = new Date();
        }

        const result = await client.query(`UPDATE leads SET 
                name = COALESCE($1, name), 
                phone = COALESCE($2, phone), 
                email = COALESCE($3, email), 
                source = COALESCE($4, source), 
                tour_id = $5, 
                status = COALESCE($6, status), 
                assigned_to = $7, 
                consultation_note = COALESCE($8, consultation_note),
                bu_group = COALESCE($9, bu_group),
                gender = COALESCE($10, gender),
                birth_date = $11,
                classification = COALESCE($12, classification),
                last_contacted_at = COALESCE($13, last_contacted_at),
                won_at = $14
            WHERE id = $15 RETURNING *`,
            [name, phone, email, source, finalTourId, status, finalAssignedTo, consultation_note, bu_group, gender, finalBirthDate, classification, last_contacted_at, finalWonAt, req.params.id]
        );

        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy lead' });
        }

        const updatedLead = result.rows[0];

        // AUTO-CONVERT TO CUSTOMER if status is 'Chốt đơn'
        if (status === 'Chốt đơn') {
            // Check if customer already exists for this lead or phone
            const existingCustomer = await client.query(
                'SELECT id FROM customers WHERE lead_id = $1 OR (phone IS NOT NULL AND phone != \'\' AND phone = $2)',
                [req.params.id, updatedLead.phone]
            );

            if (existingCustomer.rows.length === 0) {
                // Create new customer from lead
                await client.query(
                    `INSERT INTO customers (name, phone, email, gender, birth_date, lead_id, notes, preferred_contact, role) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                    [
                        updatedLead.name, 
                        updatedLead.phone, 
                        updatedLead.email, 
                        updatedLead.gender, 
                        updatedLead.birth_date, 
                        updatedLead.id,
                        `Converted from Lead. Note: ${updatedLead.consultation_note || ''}`,
                        updatedLead.source,
                        'Người đại diện'
                    ]
                );
            } else {
                // Update existing customer info to match lead if it's the same person
                await client.query(
                    `UPDATE customers SET name = $1, email = $2, gender = $3, birth_date = $4, lead_id = $5 WHERE id = $6`,
                    [updatedLead.name, updatedLead.email, updatedLead.gender, updatedLead.birth_date, updatedLead.id, existingCustomer.rows[0].id]
                );
            }
            
            // Link all notes to the customer
            const custIdRes = await client.query('SELECT id FROM customers WHERE lead_id = $1', [updatedLead.id]);
            if (custIdRes.rows.length > 0) {
                await client.query('UPDATE lead_notes SET customer_id = $1 WHERE lead_id = $2', [custIdRes.rows[0].id, updatedLead.id]);
            }
        }

        await client.query('COMMIT');
        res.json(updatedLead);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update Lead Error:', err);
        res.status(500).json({ message: err.message });
    }
 finally {
        client.release();
    }
};

exports.deleteLead = async (req, res) => {
    try {
        await db.query('DELETE FROM leads WHERE id = $1', [req.params.id]);
        res.json({ message: 'Đã xoá lead thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
