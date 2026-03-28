const db = require('../db');
const { logActivity } = require('../utils/logger');
const { convertLeadToCustomer } = require('../services/conversionService');

exports.getAllCustomers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const body = req.body;
        
        // Normalize
        const normalizedName = body.name ? body.name.toUpperCase().trim() : 'KHÁCH HÀNG MỚI';
        
        const result = await db.query(
            `INSERT INTO customers (
                name, phone, email, gender, birth_date, nationality, 
                id_card, id_expiry, address, preferred_contact, role,
                customer_segment, tour_interests, special_requests, internal_notes, 
                lead_id, location_city, travel_season
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [
                normalizedName, body.phone || null, body.email || null, body.gender || null, 
                body.birth_date || null, body.nationality || 'Việt Nam', 
                body.id_card || null, body.id_expiry || null, body.address || null, 
                body.preferred_contact || 'Zalo', body.role || 'booker',
                body.customer_segment || 'New Customer', body.tour_interests || null, 
                body.special_requests || null, body.internal_notes || null, 
                body.lead_id || null, body.location_city || null, body.travel_season || null
            ]
        );

        const newCustomer = result.rows[0];

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'CUSTOMER',
            entity_id: newCustomer.id,
            details: `Tạo mới Khách hàng: ${newCustomer.name}`,
            new_data: newCustomer
        });

        res.status(201).json(newCustomer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCustomerById = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        
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
    const customerId = req.params.id;
    const client = await db.pool.connect();
    
    try {
        await client.query('BEGIN');

        // 1. Get old data for logging
        const oldRes = await client.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        if (oldRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }
        const oldCustomer = oldRes.rows[0];

        // 2. Build Dynamic Update (Null-safe)
        const updates = req.body;
        const updateFields = [];
        const queryValues = [];
        const allowedFields = [
            'name', 'phone', 'email', 'gender', 'birth_date', 'nationality', 
            'id_card', 'id_expiry', 'address', 'preferred_contact', 'role',
            'customer_segment', 'tour_interests', 'special_requests', 
            'internal_notes', 'location_city', 'travel_season'
        ];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                let val = updates[key];
                if (key === 'name' && val) val = val.toUpperCase().trim();
                
                updateFields.push(`${key} = $${queryValues.length + 1}`);
                queryValues.push(val);
            }
        });

        if (updateFields.length > 0) {
            queryValues.push(customerId);
            const updateQuery = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = $${queryValues.length} RETURNING *`;
            const result = await client.query(updateQuery, queryValues);
            const updatedCustomer = result.rows[0];

            // 3. LOG ACTIVITY
            await logActivity({
                user_id: req.user ? req.user.id : null,
                action_type: 'UPDATE',
                entity_type: 'CUSTOMER',
                entity_id: customerId,
                details: `Cập nhật thông tin Khách hàng: ${updatedCustomer.name}`,
                old_data: oldCustomer,
                new_data: updatedCustomer
            });

            await client.query('COMMIT');
            res.json(updatedCustomer);
        } else {
            await client.query('COMMIT');
            res.json(oldCustomer);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Update Customer Error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        const custId = req.params.id;
        const resCust = await db.query('SELECT name FROM customers WHERE id = $1', [custId]);
        if (resCust.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });

        await db.query('DELETE FROM customers WHERE id = $1', [custId]);

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'DELETE',
            entity_type: 'CUSTOMER',
            entity_id: custId,
            details: `Đã xóa Khách hàng: ${resCust.rows[0].name}`
        });

        res.json({ message: 'Đã xoá khách hàng thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.convertLeadToCustomer = async (req, res) => {
    const { leadId } = req.body;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const customer = await convertLeadToCustomer(client, leadId, req.user ? req.user.id : null);
        
        await client.query('COMMIT');
        res.json({ message: 'Chuyển đổi thành công', customer });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};
