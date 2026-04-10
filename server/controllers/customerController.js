const db = require('../db');
const { logActivity } = require('../utils/logger');
const { convertLeadToCustomer } = require('../services/conversionService');
const { getDataScope } = require('../middleware/teamScope');
const { getUserMergedPerms } = require('../middleware/permCheck');

// Helper: Tính phân khúc VIP tự động dựa trên tổng số chuyến đi
function computeVipTier(totalTrips) {
    if (totalTrips >= 7) return 'VIP 1';
    if (totalTrips >= 4) return 'VIP 2';
    if (totalTrips >= 3) return 'VIP 3';
    if (totalTrips >= 2) return 'Repeat Customer';
    return 'New Customer';
}

exports.checkPhoneExists = async (req, res) => {
    try {
        const phone = req.query.phone;
        if (!phone) return res.json({ exists: false });
        
        const stripped = phone.replace(/[\s\-\.]/g, '');
        const result = await db.query(`
            SELECT id, name, customer_segment, past_trip_count,
            COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = customers.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as crm_trip_count
            FROM customers 
            WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = $1
               OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = $2
            LIMIT 1
        `, [stripped, stripped.replace(/^0/, '')]);

        if (result.rows.length > 0) {
            const cust = result.rows[0];
            const total = parseInt(cust.past_trip_count || 0) + parseInt(cust.crm_trip_count || 0);
            return res.json({ exists: true, customer: { ...cust, total_trips: total }});
        }
        res.json({ exists: false });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        
        // Data Scoping
        let scopeClause = '';
        let scopeParams = [];
        let paramOffset = 0;
        
        if (req.user && req.user.role !== 'admin') {
            const perms = await getUserMergedPerms(req.user.id, req.user.role);
            const scope = await getDataScope(req.user.id, 'customers', perms);
            
            // Bypass data isolation if explicitly searching (to prevent duplicates)
            const isSearching = search && search.trim().length > 0;
            
            if (!isSearching) {
                if (scope.scope === 'team' || scope.scope === 'own') {
                    scopeClause = `WHERE c.assigned_to = ANY($1)`;
                    scopeParams = [scope.userIds];
                    paramOffset = 1;
                } else if (scope.scope === 'none') {
                    return res.json([]);
                }
            }
        }

        let queryStr = `
            SELECT c.*, 
                   COALESCE((SELECT SUM(total_price) FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as total_spent,
                   COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as crm_trip_count,
                   (SELECT content FROM lead_notes WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_note,
                   l.source as lead_source
            FROM customers c
            LEFT JOIN leads l ON c.lead_id = l.id
            ${scopeClause}
        `;

        if (search) {
            const searchParam = `$${paramOffset + 1}`;
            queryStr += ` ${scopeClause ? 'AND' : 'WHERE'} (c.name ILIKE ${searchParam} OR c.phone ILIKE ${searchParam}) `;
            scopeParams.push(`%${search}%`);
        }

        queryStr += ` ORDER BY c.created_at DESC, c.id DESC `;
        
        if (search) {
            queryStr += ` LIMIT 30`;
        }

        const result = await db.query(queryStr, scopeParams);
        
        const currentYear = new Date().getFullYear();
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay() || 7;
        startOfWeek.setDate(startOfWeek.getDate() - day + 1);
        startOfWeek.setHours(0,0,0,0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        endOfWeek.setHours(23,59,59,999);

        const customers = result.rows.map(c => {
            const pastTrips = parseInt(c.past_trip_count || 0);
            const crmTrips = parseInt(c.crm_trip_count || 0);
            const totalTrips = pastTrips + crmTrips;
            const segment = computeVipTier(totalTrips);
            
            let is_birthday_this_week = false;
            if (c.birth_date) {
                const bDate = new Date(c.birth_date);
                const bThisYear = new Date(currentYear, bDate.getMonth(), bDate.getDate());
                if (bThisYear >= startOfWeek && bThisYear <= endOfWeek) {
                    is_birthday_this_week = true;
                }
            }
            
            return {
                ...c,
                total_spent: parseFloat(c.total_spent || 0),
                past_trip_count: pastTrips,
                crm_trip_count: crmTrips,
                total_trip_count: totalTrips,
                customer_segment: segment,
                is_birthday_this_week
            };
        });
        res.json(customers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createCustomer = async (req, res) => {
    try {
        const body = req.body;
        
        // Normalize
        const normalizedName = body.name ? body.name.toUpperCase().trim() : 'KHÁCH HÀNG MỚI';
        
        // 1. Check for duplicate phone
        if (body.phone && body.phone.trim() !== '') {
            const existingCust = await db.query('SELECT name FROM customers WHERE phone = $1', [body.phone.trim()]);
            if (existingCust.rows.length > 0) {
                return res.status(409).json({ 
                    message: `Số điện thoại này đã tồn tại ở khách hàng mang tên "${existingCust.rows[0].name}". Vui lòng kiểm tra lại danh bạ Khách Hàng thay vì tạo mới!`
                });
            }
        }

        const result = await db.query(
            `INSERT INTO customers (
                name, phone, email, gender, birth_date, nationality, 
                id_card, id_expiry, address, preferred_contact, role,
                customer_segment, tour_interests, special_requests, internal_notes, 
                lead_id, location_city, travel_season, first_deal_date, assigned_to,
                destinations, experiences, travel_styles, created_at, past_trip_count, passport_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26) RETURNING *`,
            [
                normalizedName, body.phone || null, body.email || null, body.gender || null, 
                body.birth_date || null, body.nationality || 'Việt Nam', 
                body.id_card || null, body.id_expiry || null, body.address || null, 
                body.preferred_contact || 'Zalo', body.role || 'booker',
                body.customer_segment || 'New Customer', body.tour_interests || null, 
                body.special_requests || null, body.internal_notes || null, 
                body.lead_id || null, body.location_city || null, body.travel_season || null,
                body.first_deal_date || new Date(),
                body.assigned_to || null,
                body.destinations ? JSON.stringify(body.destinations) : '[]',
                body.experiences ? JSON.stringify(body.experiences) : '[]',
                body.travel_styles ? JSON.stringify(body.travel_styles) : '[]',
                body.created_at || new Date(),
                parseInt(body.past_trip_count) || 0,
                body.passport_url || null
            ]
        );

        const newCustomer = result.rows[0];

        // 2. Retroactive Lead Claiming
        if (newCustomer.phone || newCustomer.facebook_psid) {
            await db.query(`
                UPDATE leads 
                SET customer_id = $1 
                WHERE customer_id IS NULL AND (
                    (phone = $2 AND $2 IS NOT NULL AND $2 != '') OR 
                    (facebook_psid = $3 AND $3 IS NOT NULL AND $3 != '')
                )
            `, [newCustomer.id, newCustomer.phone, newCustomer.facebook_psid]);
        }

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
        const result = await db.query(`
            SELECT c.*, 
                   COALESCE((SELECT SUM(total_price) FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0)::numeric as total_spent,
                   COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as crm_trip_count
            FROM customers c WHERE c.id = $1
        `, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        
        const notes = await db.query(`
            SELECT ln.*, u.full_name as creator_name 
            FROM lead_notes ln 
            LEFT JOIN users u ON ln.created_by = u.id 
            WHERE ln.customer_id = $1 
            ORDER BY ln.created_at DESC
        `, [req.params.id]);

        const bookings = await db.query(`
            SELECT b.*, tt.name as tour_name, td.start_date as departure_date, td.status as departure_status
            FROM bookings b
            LEFT JOIN tour_templates tt ON b.tour_id = tt.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            WHERE b.customer_id = $1
            ORDER BY td.start_date DESC
        `, [req.params.id]);
        
        const events = await db.query(`
            SELECT ce.*, u.full_name as creator_name
            FROM customer_events ce
            LEFT JOIN users u ON ce.created_by = u.id
            WHERE ce.customer_id = $1
            ORDER BY ce.event_date DESC
        `, [req.params.id]);
        
        const customer = result.rows[0];
        customer.total_spent = parseFloat(customer.total_spent);
        const pastTrips = parseInt(customer.past_trip_count || 0);
        const crmTrips = parseInt(customer.crm_trip_count || 0);
        customer.past_trip_count = pastTrips;
        customer.crm_trip_count = crmTrips;
        customer.total_trip_count = pastTrips + crmTrips;
        customer.customer_segment = computeVipTier(customer.total_trip_count);
        customer.interaction_history = notes.rows;
        customer.booking_history = bookings.rows;
        
        let allEvents = [...events.rows];
        if (customer.birth_date) {
            const bDate = new Date(customer.birth_date);
            const currentYear = new Date().getFullYear();
            const bThisYear = new Date(currentYear, bDate.getMonth(), bDate.getDate());
            const bNextYear = new Date(currentYear + 1, bDate.getMonth(), bDate.getDate());
            allEvents.push({ id: 'b1', event_date: bThisYear, event_type: 'BIRTHDAY', title: `Sinh nhật ${customer.name}` });
            allEvents.push({ id: 'b2', event_date: bNextYear, event_type: 'BIRTHDAY', title: `Sinh nhật ${customer.name}` });
            allEvents.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
        }
        
        customer.events = allEvents;
        
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
            'internal_notes', 'location_city', 'travel_season', 
            'first_deal_date', 'assigned_to', 'destinations', 'experiences', 'travel_styles', 'created_at',
            'past_trip_count', 'passport_url'
        ];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                let val = updates[key];
                if (key === 'name' && val) val = val.toUpperCase().trim();
                if (['destinations', 'experiences', 'travel_styles'].includes(key)) {
                    val = JSON.stringify(val || []);
                }
                
                updateFields.push(`${key} = $${queryValues.length + 1}`);
                queryValues.push(val);
            }
        });

        if (updateFields.length > 0) {
            queryValues.push(customerId);
            const updateQuery = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = $${queryValues.length} RETURNING *`;
            const result = await client.query(updateQuery, queryValues);
            const updatedCustomer = result.rows[0];

            // 2.5 Retroactive Lead Claiming after Update
            if (updates.phone !== undefined || updates.facebook_psid !== undefined) {
                const phoneToCheck = updates.phone !== undefined ? updates.phone : updatedCustomer.phone;
                const psidToCheck = updates.facebook_psid !== undefined ? updates.facebook_psid : updatedCustomer.facebook_psid;
                
                if (phoneToCheck || psidToCheck) {
                    await client.query(`
                        UPDATE leads 
                        SET customer_id = $1 
                        WHERE customer_id IS NULL AND (
                            (phone = $2 AND $2 IS NOT NULL AND $2 != '') OR 
                            (facebook_psid = $3 AND $3 IS NOT NULL AND $3 != '')
                        )
                    `, [updatedCustomer.id, phoneToCheck, psidToCheck]);
                }
            }

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
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const custId = req.params.id;
        const resCust = await client.query('SELECT name FROM customers WHERE id = $1', [custId]);
        if (resCust.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy khách hàng' });
        }

        // Kiểm tra booking liên kết
        const bCount = await client.query('SELECT COUNT(*)::int as c FROM bookings WHERE customer_id = $1', [custId]);
        if (bCount.rows[0].c > 0) {
            await client.query('ROLLBACK');
            return res.status(409).json({
                message: `Khách hàng "${resCust.rows[0].name}" có ${bCount.rows[0].c} đơn hàng liên kết. Không thể xóa trực tiếp.`,
                has_bookings: true
            });
        }

        // MED-08 FIX: Xóa các bản ghi con trước để tránh FK violation
        await client.query('DELETE FROM lead_notes WHERE customer_id = $1', [custId]);
        await client.query('DELETE FROM customer_events WHERE customer_id = $1', [custId]);
        await client.query('UPDATE leads SET customer_id = NULL WHERE customer_id = $1', [custId]);
        await client.query('DELETE FROM booking_passengers WHERE customer_id = $1', [custId]);
        
        await client.query('DELETE FROM customers WHERE id = $1', [custId]);

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'DELETE',
            entity_type: 'CUSTOMER',
            entity_id: custId,
            details: `Đã xóa Khách hàng: ${resCust.rows[0].name}`
        });

        await client.query('COMMIT');
        res.json({ message: 'Đã xoá khách hàng thành công' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
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

exports.addNote = async (req, res) => {
    try {
        const customerId = req.params.id;
        const { content } = req.body;
        
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Nội dung ghi chú không được để trống' });
        }
        
        const result = await db.query(
            'INSERT INTO lead_notes (customer_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
            [customerId, content, req.user ? req.user.id : null]
        );
        
        const noteWithUser = await db.query(
            'SELECT ln.*, u.full_name as creator_name FROM lead_notes ln LEFT JOIN users u ON ln.created_by = u.id WHERE ln.id = $1',
            [result.rows[0].id]
        );
        
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE_NOTE',
            entity_type: 'CUSTOMER',
            entity_id: customerId,
            details: `Thêm ghi chú cho Khách hàng: ${(content || '').substring(0, 50)}...`
        });
        
        res.status(201).json(noteWithUser.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getUpcomingBirthdays = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT id, name, phone, email, birth_date, customer_segment, assigned_to
            FROM customers
            WHERE birth_date IS NOT NULL 
              AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            ORDER BY EXTRACT(DAY FROM birth_date) ASC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDuplicates = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT phone, COUNT(*) as count, array_agg(id) as customer_ids
            FROM customers
            WHERE phone IS NOT NULL AND phone != ''
            GROUP BY phone
            HAVING COUNT(*) > 1
        `);
        
        const duplicateGroups = [];
        for (const group of result.rows) {
            const ids = group.customer_ids;
            const customersResult = await db.query(`SELECT * FROM customers WHERE id = ANY($1)`, [ids]);
            duplicateGroups.push({
                phone: group.phone,
                count: group.count,
                customers: customersResult.rows
            });
        }
        res.json(duplicateGroups);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.mergeCustomers = async (req, res) => {
    const { primaryId, secondaryIds } = req.body;
    if (!primaryId || !secondaryIds || secondaryIds.length === 0) {
        return res.status(400).json({ message: 'Missing primaryId or secondaryIds' });
    }
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Move bookings
        await client.query(`UPDATE bookings SET customer_id = $1 WHERE customer_id = ANY($2)`, [primaryId, secondaryIds]);
        
        // 2. Move booking passengers
        await client.query(`UPDATE booking_passengers SET customer_id = $1 WHERE customer_id = ANY($2)`, [primaryId, secondaryIds]);
        
        // 3. Move lead notes
        await client.query(`UPDATE lead_notes SET customer_id = $1 WHERE customer_id = ANY($2)`, [primaryId, secondaryIds]);
        
        // 4. Move events
        await client.query(`UPDATE customer_events SET customer_id = $1 WHERE customer_id = ANY($2)`, [primaryId, secondaryIds]);
        
        // 5. Move leads
        await client.query(`UPDATE leads SET customer_id = $1 WHERE customer_id = ANY($2)`, [primaryId, secondaryIds]);
        
        // 6. Delete subordinate customers
        await client.query(`DELETE FROM customers WHERE id = ANY($1)`, [secondaryIds]);
        
        await client.query('COMMIT');
        
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'MERGE',
            entity_type: 'CUSTOMER',
            entity_id: primaryId,
            details: `Gộp ${secondaryIds.length} khách hàng vào #${primaryId}`
        });
        
        res.json({ message: 'Merge successful' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};
