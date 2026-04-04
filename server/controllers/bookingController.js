const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getAllBookings = async (req, res) => {
    try {
        const { page, limit, search, status, payment_status } = req.query;
        
        let whereClauses = [];
        let params = [];
        let paramCount = 1;

        if (search) {
            whereClauses.push(`(b.booking_code ILIKE $${paramCount} OR c.name ILIKE $${paramCount} OR c.phone ILIKE $${paramCount} OR tt.code ILIKE $${paramCount} OR td.code ILIKE $${paramCount})`);
            params.push(`%${search}%`);
            paramCount++;
        }
        if (status) {
            whereClauses.push(`b.booking_status = $${paramCount}`);
            params.push(status);
            paramCount++;
        }
        if (payment_status) {
            whereClauses.push(`b.payment_status = $${paramCount}`);
            params.push(payment_status);
            paramCount++;
        }

        const whereString = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

        // Pagination
        if (page && limit) {
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            const offset = (pageNum - 1) * limitNum;

            const countResult = await db.query(`
                SELECT COUNT(*) 
                FROM bookings b
                LEFT JOIN customers c ON b.customer_id = c.id
                LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
                LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
                ${whereString}
            `, params);
            
            const totalRows = parseInt(countResult.rows[0].count);

            params.push(limitNum);
            params.push(offset);
            
            const result = await db.query(`
                SELECT 
                    b.*, 
                    c.name as customer_name,
                    c.phone as customer_phone,
                    c.customer_segment,
                    c.past_trip_count,
                    tt.name as tour_name,
                    tt.code as tour_code,
                    td.code as departure_code,
                    COALESCE((SELECT SUM(amount) FROM booking_transactions WHERE booking_id = b.id), 0) as paid_amount
                FROM bookings b 
                LEFT JOIN customers c ON b.customer_id = c.id 
                LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
                LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
                ${whereString}
                ORDER BY b.created_at DESC
                LIMIT $${paramCount} OFFSET $${paramCount + 1}
            `, params);
            
            return res.json({
                data: result.rows,
                total: totalRows,
                page: pageNum,
                totalPages: Math.ceil(totalRows / limitNum)
            });
        }

        // Return all if no pagination params (for backwards compatibility)
        const result = await db.query(`
            SELECT 
                b.*, 
                c.name as customer_name, 
                c.phone as customer_phone,
                c.customer_segment,
                c.past_trip_count,
                tt.name as tour_name,
                tt.code as tour_code,
                td.code as departure_code,
                COALESCE((SELECT SUM(amount) FROM booking_transactions WHERE booking_id = b.id), 0) as paid_amount
            FROM bookings b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            ${whereString}
            ORDER BY b.created_at DESC
        `, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBooking = async (req, res) => {
    const { 
        booking_code, customer_id, tour_id, tour_departure_id, start_date, 
        pax_count, total_price, payment_status, booking_status, notes, 
        pax_details, service_details, discount, 
        initial_deposit_amount, initial_deposit_method, initial_deposit_date 
    } = req.body;
    try {
        // Auto-generate booking code if missing
        let finalCode = booking_code;
        if (!finalCode || finalCode.trim() === '') {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const rand = Math.floor(1000 + Math.random() * 9000);
            finalCode = `FT-${dateStr}-${rand}`;
        }

        const result = await db.query(
            'INSERT INTO bookings (booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status, notes, pax_details, service_details, discount) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
            [
              finalCode, customer_id, tour_id || null, tour_departure_id || null, 
              start_date || null, pax_count || 0, total_price || 0, payment_status || 'unpaid', 
              booking_status || 'pending', notes || null, 
              typeof pax_details === 'object' ? JSON.stringify(pax_details) : (pax_details || '[]'), 
              typeof service_details === 'object' ? JSON.stringify(service_details) : (service_details || '[]'),
              discount || 0
            ]
        );
        
        const newBooking = result.rows[0];

        // Process Initial Deposit if any
        if (initial_deposit_amount && Number(initial_deposit_amount) > 0) {
            await db.query(`
                INSERT INTO booking_transactions (booking_id, amount, payment_method, transaction_date, notes, created_by)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                newBooking.id, 
                Number(initial_deposit_amount), 
                initial_deposit_method || 'CASH', 
                initial_deposit_date || new Date(), 
                'Thu cọc lúc khởi tạo Đơn hàng',
                req.user ? req.user.id : null
            ]);
            
            // Re-evaluate payment status dynamically
            const depositAmt = Number(initial_deposit_amount);
            const tPrice = Number(newBooking.total_price);
            let finalStatus = 'unpaid';
            if (depositAmt >= tPrice && tPrice > 0) finalStatus = 'paid';
            else if (depositAmt > 0) finalStatus = 'partial';

            if (finalStatus !== newBooking.payment_status) {
                await db.query("UPDATE bookings SET payment_status = $1 WHERE id = $2", [finalStatus, newBooking.id]);
                newBooking.payment_status = finalStatus;
            }
        }

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'BOOKING',
            entity_id: newBooking.id,
            details: `Tạo mới Booking: ${newBooking.booking_code}`,
            new_data: newBooking
        });

        res.status(201).json(newBooking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBookingById = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email, c.customer_segment, c.past_trip_count, tt.name as tour_name
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.id = $1
        `, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });
        
        const booking = result.rows[0];
        
        // Fetch Passengers 
        // Note: fallback to the c_name if full_name is empty (migrating data)
        const paxResult = await db.query(`
            SELECT bp.*, c.name as c_name, c.phone as c_phone 
            FROM booking_passengers bp 
            LEFT JOIN customers c ON bp.customer_id = c.id
            WHERE bp.booking_id = $1
        `, [req.params.id]);
        booking.passengers = paxResult.rows.map(p => ({
            ...p,
            display_name: p.full_name || p.c_name || 'Khách chưa có tên'
        }));

        // Fetch Transactions
        const txResult = await db.query(`
            SELECT bt.*, u.full_name as creator_name
            FROM booking_transactions bt
            LEFT JOIN users u ON bt.created_by = u.id
            WHERE bt.booking_id = $1
            ORDER BY bt.transaction_date ASC, bt.created_at ASC
        `, [req.params.id]);
        booking.transactions = txResult.rows;

        res.json(booking);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateBooking = async (req, res) => {
    const bookingId = req.params.id;
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Get old data
        const oldRes = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
        if (oldRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy booking' });
        }
        const oldBooking = oldRes.rows[0];

        // 2. Build Dynamic Update
        const updates = req.body;
        const updateFields = [];
        const queryValues = [];
        const allowedFields = [
            'booking_code', 'customer_id', 'tour_id', 'tour_departure_id', 
            'start_date', 'pax_count', 'total_price', 'payment_status', 
            'booking_status', 'notes', 'pax_details', 'service_details', 'discount'
        ];

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key)) {
                updateFields.push(`${key} = $${queryValues.length + 1}`);
                if (['pax_details', 'service_details'].includes(key) && typeof updates[key] !== 'string') {
                    queryValues.push(JSON.stringify(updates[key]));
                } else {
                    queryValues.push(updates[key]);
                }
            }
        });

        if (updateFields.length > 0) {
            queryValues.push(bookingId);
            const updateQuery = `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = $${queryValues.length} RETURNING *`;
            const result = await client.query(updateQuery, queryValues);
            const updatedBooking = result.rows[0];

            // 3. LOG ACTIVITY
            await logActivity({
                user_id: req.user ? req.user.id : null,
                action_type: 'UPDATE',
                entity_type: 'BOOKING',
                entity_id: bookingId,
                details: `Cập nhật Booking: ${updatedBooking.booking_code}`,
                old_data: oldBooking,
                new_data: updatedBooking
            });

            await client.query('COMMIT');
            res.json(updatedBooking);
        } else {
            await client.query('COMMIT');
            res.json(oldBooking);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.deleteBooking = async (req, res) => {
    try {
        const bookingId = req.params.id;
        const resBook = await db.query('SELECT booking_code FROM bookings WHERE id = $1', [bookingId]);
        if (resBook.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });

        // Kiểm tra giao dịch thanh toán trước khi xóa
        const txCount = await db.query('SELECT COUNT(*)::int as c FROM booking_transactions WHERE booking_id = $1', [bookingId]);
        if (txCount.rows[0].c > 0 && req.query.force !== 'true') {
            return res.status(409).json({
                message: `Đơn hàng ${resBook.rows[0].booking_code} có ${txCount.rows[0].c} giao dịch thanh toán. Xóa sẽ mất toàn bộ lịch sử thu tiền.`,
                has_transactions: true,
                tx_count: txCount.rows[0].c
            });
        }

        await db.query('DELETE FROM bookings WHERE id = $1', [bookingId]);

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'DELETE',
            entity_type: 'BOOKING',
            entity_id: bookingId,
            details: `Đã xóa Booking: ${resBook.rows[0].booking_code}`
        });

        res.json({ message: 'Đã xoá booking thành công' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createGroupBooking = async (req, res) => {
    const { departure_id, group_name, passengers, total_price } = req.body;
    
    // Validate passengers
    if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
        return res.status(400).json({ message: 'Cần ít nhất 1 hành khách trong nhóm' });
    }
    
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Generate booking code
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.floor(1000 + Math.random() * 9000);
        const bookingCode = `GRP-${dateStr}-${rand}`;

        // 2. Find or Create Representative Customer (first passenger)
        const firstPax = passengers[0];
        let customerId;
        const custRes = await client.query('SELECT id FROM customers WHERE phone = $1', [firstPax.phone]);
        if (custRes.rows.length > 0) {
            customerId = custRes.rows[0].id;
        } else {
            const newCust = await client.query(
                'INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING id',
                [firstPax.name, firstPax.phone]
            );
            customerId = newCust.rows[0].id;
        }

        // 3. Create Booking
        const bookingRes = await client.query(
            `INSERT INTO bookings (
                booking_code, customer_id, tour_departure_id, 
                pax_count, total_price, booking_status, 
                is_group, group_name, payment_status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [
                bookingCode, customerId, departure_id, 
                passengers.length, total_price, 'confirmed', 
                true, group_name, 'unpaid'
            ]
        );
        const booking = bookingRes.rows[0];

        // 4. Create Passengers
        for (const pax of passengers) {
            let paxCustomerId;
            const pCustRes = await client.query('SELECT id FROM customers WHERE phone = $1', [pax.phone]);
            if (pCustRes.rows.length > 0) {
                paxCustomerId = pCustRes.rows[0].id;
            } else {
                const newPCust = await client.query(
                    'INSERT INTO customers (name, phone) VALUES ($1, $2) RETURNING id',
                    [pax.name, pax.phone]
                );
                paxCustomerId = newPCust.rows[0].id;
            }

            await client.query(
                'INSERT INTO booking_passengers (booking_id, customer_id, pax_type, price) VALUES ($1, $2, $3, $4)',
                [booking.id, paxCustomerId, pax.pax_type, pax.price]
            );
        }

        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'BOOKING',
            entity_id: booking.id,
            details: `Tạo mới Nhóm Booking: ${booking.booking_code} (${group_name})`,
            new_data: booking
        });

        await client.query('COMMIT');
        res.status(201).json(booking);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Group Booking Error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.addTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, payment_method, transaction_date, notes } = req.body;
        
        // 1. Check if booking exists
        const bRes = await db.query('SELECT total_price FROM bookings WHERE id = $1', [id]);
        if (bRes.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });

        // 2. Insert transaction
        const result = await db.query(`
            INSERT INTO booking_transactions (booking_id, amount, payment_method, transaction_date, notes, created_by)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `, [id, amount, payment_method, transaction_date || new Date(), notes, req.user ? req.user.id : null]);
        
        const newTx = result.rows[0];

        // 3. Update payment_status if fully paid
        const sumRes = await db.query('SELECT SUM(amount) as total_paid FROM booking_transactions WHERE booking_id = $1', [id]);
        const totalPaid = parseFloat(sumRes.rows[0].total_paid || 0);
        const totalPrice = parseFloat(bRes.rows[0].total_price || 0);
        
        if (totalPaid >= totalPrice && totalPrice > 0) {
            await db.query("UPDATE bookings SET payment_status = 'paid' WHERE id = $1", [id]);
        } else if (totalPaid > 0 && totalPaid < totalPrice) {
            await db.query("UPDATE bookings SET payment_status = 'partial' WHERE id = $1", [id]);
        }

        // 4. Log
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'PAYMENT',
            entity_type: 'BOOKING',
            entity_id: id,
            details: `Thêm giao dịch thanh toán: ${Number(amount).toLocaleString('vi-VN')}đ`,
            new_data: newTx
        });

        res.status(201).json(newTx);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updatePassenger = async (req, res) => {
    try {
        const { paxId } = req.params;
        const { full_name, passport_number, passport_expired, visa_status, special_requests } = req.body;
        
        const result = await db.query(`
            UPDATE booking_passengers 
            SET full_name = COALESCE($1, full_name), 
                passport_number = COALESCE($2, passport_number), 
                passport_expired = COALESCE($3, passport_expired), 
                visa_status = COALESCE($4, visa_status), 
                special_requests = COALESCE($5, special_requests),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6 RETURNING *
        `, [full_name, passport_number, passport_expired, visa_status, special_requests, paxId]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy khách' });
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
