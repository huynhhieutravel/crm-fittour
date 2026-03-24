const db = require('../db');

exports.getAllCustomers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    const { 
        name, phone, email, gender, birth_date, nationality, 
        id_card, id_expiry, address, preferred_contact, role,
        customer_segment, tour_interests, special_requests, internal_notes, 
        lead_id, location_city, travel_season
    } = req.body;

    const normalizeDate = (d) => (d && d.trim() !== '') ? d : null;
    const nBirthDate = normalizeDate(birth_date);
    const nIdExpiry = normalizeDate(id_expiry);

    // Normalize Name to Uppercase
    const normalizedName = name ? name.toUpperCase().trim() : '';

    try {
        // Check duplication by Phone + Email
        const dupCheck = await db.query(
            'SELECT id FROM customers WHERE phone = $1 OR (email IS NOT NULL AND email != \'\' AND email = $2)',
            [phone, email]
        );
        if (dupCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Khách hàng với SĐT hoặc Email này đã tồn tại trong hệ thống.' });
        }

        const result = await db.query(
            `INSERT INTO customers (
                name, phone, email, gender, birth_date, nationality, 
                id_card, id_expiry, address, preferred_contact, role,
                customer_segment, tour_interests, special_requests, internal_notes, 
                lead_id, location_city, travel_season
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [
                normalizedName, phone, email, gender, nBirthDate, nationality, 
                id_card, nIdExpiry, address, preferred_contact, role || 'booker',
                customer_segment || 'New Customer', tour_interests, special_requests, internal_notes, 
                lead_id, location_city, travel_season
            ]
        );

        // If from lead, link notes
        if (lead_id) {
            await db.query('UPDATE lead_notes SET customer_id = $1 WHERE lead_id = $2', [result.rows[0].id, lead_id]);
        }

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        
        // Fetch linked history (from lead_notes)
        const notes = await db.query(`
            SELECT ln.*, u.full_name as creator_name 
            FROM lead_notes ln 
            LEFT JOIN users u ON ln.created_by = u.id 
            WHERE ln.customer_id = $1 
            ORDER BY ln.created_at DESC
        `, [req.params.id]);
        
        const customer = result.rows[0];
        customer.interaction_history = notes.rows;
        
        res.json(customer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateCustomer = async (req, res) => {
    try {
        const body = req.body;
        const normalizeDate = (d) => (d && d.trim() !== '') ? d : null;
        
        // Prepare parameters ensuring no 'undefined' values (pg dislikes them)
        const params = [
            body.name ? body.name.toUpperCase().trim() : null, // $1
            body.phone || null,         // $2
            body.email || null,         // $3
            body.gender || null,        // $4
            normalizeDate(body.birth_date), // $5
            body.nationality || null,   // $6
            body.id_card || null,       // $7
            normalizeDate(body.id_expiry), // $8
            body.address || null,       // $9
            body.preferred_contact || null, // $10
            body.role || null,          // $11
            body.customer_segment || null, // $12
            body.tour_interests || null, // $13
            body.special_requests || null, // $14
            body.internal_notes || null, // $15
            body.location_city || null,  // $16
            body.travel_season || null,  // $17
            req.params.id               // $18
        ];

        const result = await db.query(
            `UPDATE customers SET 
                name = COALESCE($1, name), 
                phone = COALESCE($2, phone), 
                email = COALESCE($3, email), 
                gender = COALESCE($4, gender), 
                birth_date = COALESCE($5, birth_date), 
                nationality = COALESCE($6, nationality), 
                id_card = COALESCE($7, id_card), 
                id_expiry = COALESCE($8, id_expiry), 
                address = COALESCE($9, address), 
                preferred_contact = COALESCE($10, preferred_contact), 
                role = COALESCE($11, role),
                customer_segment = COALESCE($12, customer_segment), 
                tour_interests = COALESCE($13, tour_interests), 
                special_requests = COALESCE($14, special_requests), 
                internal_notes = COALESCE($15, internal_notes),
                location_city = COALESCE($16, location_city),
                travel_season = COALESCE($17, travel_season)
            WHERE id = $18 RETURNING *`,
            params
        );

        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Update Customer Error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await db.query('DELETE FROM customers WHERE id = $1', [req.params.id]);
        res.json({ message: 'Đã xoá khách hàng thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.convertLeadToCustomer = async (req, res) => {
    const { leadId } = req.body;
    try {
        // 1. Fetch lead info
        const leadRes = await db.query('SELECT * FROM leads WHERE id = $1', [leadId]);
        if (leadRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lead' });
        const lead = leadRes.rows[0];

        // 2. Check if already converted
        const existing = await db.query('SELECT id FROM customers WHERE phone = $1', [lead.phone]);
        let customer;

        if (existing.rows.length > 0) {
            customer = existing.rows[0];
            // Link lead_id if not linked
            await db.query('UPDATE customers SET lead_id = $1 WHERE id = $2', [leadId, customer.id]);
        } else {
            // Create new customer from lead
            const normalizedName = lead.name ? lead.name.toUpperCase().trim() : '';
            const normalizeDate = (d) => (d && (typeof d === 'string' ? d.trim() !== '' : true)) ? d : null;
            const nBirthDate = normalizeDate(lead.birth_date);

            const newCust = await db.query(
                `INSERT INTO customers (name, phone, email, gender, birth_date, nationality, lead_id, customer_segment, location_city) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
                [normalizedName, lead.phone, lead.email, lead.gender, nBirthDate, lead.nationality || 'Việt Nam', leadId, 'New Customer', lead.address]
            );
            customer = newCust.rows[0];
        }

        // 3. Link notes
        await db.query('UPDATE lead_notes SET customer_id = $1 WHERE lead_id = $2', [customer.id, leadId]);

        // 4. Update Lead Status to 'Chốt đơn' and set won_at
        await db.query('UPDATE leads SET status = \'Chốt đơn\', won_at = $2 WHERE id = $1', [leadId, new Date()]);

        res.json({ message: 'Chuyển đổi thành công', customer });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
