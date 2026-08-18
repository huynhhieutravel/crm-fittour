const db = require('../db');
const { logActivity } = require('../utils/logger');
const { getDataScope } = require('../middleware/teamScope');
const { getUserMergedPerms } = require('../middleware/permCheck');
const { emitEvent } = require('../utils/eventBus');
const SystemEvents = require('../constants/SystemEvents');
const zaloZnsService = require('../services/zaloZnsService');

exports.getAllBookings = async (req, res) => {
    try {
        const { page, limit, search, status, payment_status, sale_id } = req.query;
        
        let whereClauses = [];
        let params = [];
        let paramCount = 1;

        // Data Scoping: giới hạn theo team
        if (req.user && req.user.role !== 'admin') {
            const perms = await getUserMergedPerms(req.user.id, req.user.role);
            const scope = await getDataScope(req.user.id, 'bookings', perms);
            
            if (scope.scope === 'team' || scope.scope === 'own') {
                whereClauses.push(`b.created_by = ANY($${paramCount})`);
                params.push(scope.userIds);
                paramCount++;
            } else if (scope.scope === 'none') {
                return res.json({ data: [], total: 0, page: 1, totalPages: 0 });
            }
        }

        if (search) {
            whereClauses.push(`(b.booking_code ILIKE $${paramCount} OR c.name ILIKE $${paramCount} OR c.phone ILIKE $${paramCount} OR tt.code ILIKE $${paramCount} OR td.code ILIKE $${paramCount})`);
            params.push(`%${search}%`);
            paramCount++;
        }
        if (status) {
            if (status === 'Giữ chỗ' || status === 'HELD') {
                whereClauses.push(`b.booking_status IN ('Giữ chỗ', 'HELD')`);
            } else {
                whereClauses.push(`b.booking_status = $${paramCount}`);
                params.push(status);
                paramCount++;
            }
        }
        if (payment_status) {
            whereClauses.push(`b.payment_status = $${paramCount}`);
            params.push(payment_status);
            paramCount++;
        }
        if (sale_id) {
            whereClauses.push(`(b.created_by = $${paramCount})`);
            params.push(sale_id);
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
                    tt.bu_group,
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
                tt.bu_group,
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
    // Generate Idempotency Key (Admin/Sale UI might not pass this, so we generate a fallback or allow null)
    // Ideally, UI should send 'idempotency-key' header.
    const idempotencyKey = req.headers['idempotency-key'] || null;

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const { createBookingWithLock } = require('../services/bookingService');
        
        const payload = { ...req.body, created_by: req.user ? req.user.id : null };
        const result = await createBookingWithLock(client, payload, idempotencyKey);

        if (!result.success) {
            await client.query('ROLLBACK');
            return res.status(result.statusCode || 400).json({ error: result.error });
        }

        await client.query('COMMIT');
        
        const newBooking = result.booking;
        
        // Log activity after commit
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'BOOKING',
            entity_id: newBooking.id,
            details: `Tạo mới Booking: ${newBooking.booking_code}`,
            new_data: newBooking
        });

        // EMAIL EVENT
        emitEvent(SystemEvents.find(e => e.code === 'BOOKING_CREATED').code, {
            booking_code: newBooking.booking_code,
            customer_id: newBooking.customer_id,
            total_price: newBooking.total_price,
            created_at: new Date().toISOString()
        });

        res.status(201).json(newBooking);
    } catch (err) {
        if (err.code === '23505') {
            return res.status(400).json({ message: 'Mã Booking này đã tồn tại trên hệ thống (hoặc đang nằm trong Thùng rác). Vui lòng dùng mã khác!' });
        }
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

        // Auto-fix missing public_token for old bookings (Migrations fallback)
        if (!booking.public_token) {
            const tokenRes = await db.query('UPDATE bookings_raw SET public_token = gen_random_uuid() WHERE id = $1 RETURNING public_token', [booking.id]);
            if (tokenRes.rows.length > 0) {
                booking.public_token = tokenRes.rows[0].public_token;
            }
        }
        
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

exports.getPublicReceipt = async (req, res) => {
    try {
        const { token } = req.params;
        // Fetch Booking
        const result = await db.query(`
            SELECT b.id, b.booking_code, b.start_date, b.pax_count, b.total_price, b.payment_status, b.booking_status, b.created_at, b.public_token,
                   c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
                   tt.name as tour_name, tt.code as tour_code, td.code as departure_code,
                   b.tour_departure_id
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.public_token = $1
        `, [token]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy hóa đơn' });
        
        const booking = result.rows[0];
        
        // Fetch Passengers
        const paxResult = await db.query(`
            SELECT full_name, pax_type, price
            FROM booking_passengers 
            WHERE booking_id = $1
        `, [booking.id]);
        booking.passengers = paxResult.rows;

        // Fetch Transactions
        const txResult = await db.query(`
            SELECT amount, payment_method, transaction_date
            FROM booking_transactions
            WHERE booking_id = $1
            ORDER BY transaction_date ASC
        `, [booking.id]);
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

            // LOG ACTIVITY
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

            // EMAIL EVENTS (Sau khi Commit thành công)
            if (updates.booking_status && updates.booking_status !== oldBooking.booking_status) {
                if (updates.booking_status === 'Xác nhận' || updates.booking_status === 'CONFIRMED') {
                    emitEvent(SystemEvents.find(e => e.code === 'BOOKING_CONFIRMED').code, {
                        booking_code: updatedBooking.booking_code,
                        status: updatedBooking.booking_status,
                        updated_at: new Date().toISOString()
                    });
                } else if (updates.booking_status === 'Huỷ' || updates.booking_status === 'CANCELLED') {
                    emitEvent(SystemEvents.find(e => e.code === 'BOOKING_CANCELLED').code, {
                        booking_code: updatedBooking.booking_code,
                        status: updatedBooking.booking_status,
                        updated_at: new Date().toISOString()
                    });
                }
            }
            emitEvent(SystemEvents.find(e => e.code === 'BOOKING_UPDATED').code, {
                booking_code: updatedBooking.booking_code,
                updated_at: new Date().toISOString()
            });

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
        const resBook = await db.query('SELECT booking_code, * FROM bookings WHERE id = $1', [bookingId]);
        if (resBook.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });

        const bData = resBook.rows[0];

        // Kiểm tra giao dịch thanh toán (Phiếu thu) trước khi xóa
        const txCount = await db.query('SELECT COUNT(*)::int as c FROM booking_transactions WHERE booking_id = $1', [bookingId]);
        if (txCount.rows[0].c > 0 && req.query.force !== 'true') {
            return res.status(409).json({
                message: `Đơn hàng ${bData.booking_code} đang có ${txCount.rows[0].c} phiếu thu. Bạn phải Hủy các phiếu thu này trước khi đưa khách hàng vào thùng rác để đảm bảo đối soát kế toán.`,
                has_transactions: true,
                tx_count: txCount.rows[0].c
            });
        }

        // SOFT DELETE: Đánh dấu is_deleted = true thay vì DELETE (giữ nguyên phiếu thu)
        await db.query('UPDATE bookings_raw SET is_deleted = true WHERE id = $1', [bookingId]);

        // LOG ACTIVITY
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'DELETE',
            entity_type: 'BOOKING',
            entity_id: bookingId,
            details: `Đưa Khách hàng vào Thùng rác: ${bData.booking_code}`,
            old_data: bData
        });

        res.json({ message: 'Đã đưa khách hàng vào Thùng rác thành công' });
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
                passengers.length, total_price, 'HELD', 
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

exports.sendZaloPaymentRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT b.booking_code, b.total_price, b.public_token, c.phone, c.name as customer_name, tt.name as tour_name, td.code as tour_code
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.id = $1
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
        const booking = result.rows[0];
        if (!booking.phone) return res.status(400).json({ message: 'Khách hàng không có số điện thoại' });

        const txResult = await db.query('SELECT SUM(amount) as paid FROM booking_transactions WHERE booking_id = $1', [id]);
        const paid = Number(txResult.rows[0].paid) || 0;
        const remaining = Number(booking.total_price) - paid;

        // NOTE: In production, ZNS template_id needs to be registered with Zalo
        // We use a dummy templateId for now, and format data accordingly.
        const templateId = "REQUEST_PAYMENT_TEMPLATE_ID"; 
        const templateData = {
            customer_name: booking.customer_name,
            booking_code: booking.booking_code,
            tour_name: booking.tour_name || 'Tour Khách Đoàn',
            tour_code: booking.tour_code || '',
            total_price: Number(booking.total_price).toString(),
            paid_amount: paid.toString(),
            amount: remaining.toString(),
            transfer_amount: remaining.toString()
        };

        const response = await zaloZnsService.sendZnsMessage(booking.phone, templateId, templateData);
        res.json({ message: 'Đã gửi yêu cầu thanh toán qua Zalo ZNS', data: response });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.sendZaloPaymentConfirm = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query(`
            SELECT b.booking_code, b.total_price, b.public_token, c.phone, c.name as customer_name, tt.name as tour_name, td.code as tour_code
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.id = $1
        `, [id]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Booking not found' });
        const booking = result.rows[0];
        if (!booking.phone) return res.status(400).json({ message: 'Khách hàng không có số điện thoại' });

        const txResult = await db.query('SELECT SUM(amount) as paid FROM booking_transactions WHERE booking_id = $1', [id]);
        const paid = Number(txResult.rows[0].paid) || 0;

        // NOTE: In production, ZNS template_id needs to be registered with Zalo
        const templateId = "CONFIRM_PAYMENT_TEMPLATE_ID"; 
        const templateData = {
            customer_name: booking.customer_name,
            booking_code: booking.booking_code,
            tour_name: booking.tour_name || 'Tour Khách Đoàn',
            tour_code: booking.tour_code || '',
            total_price: Number(booking.total_price).toString(),
            paid_amount: paid.toString(),
            booking_status: booking.booking_status || 'Đã đặt cọc',
            receipt_url: `https://erp.fittour.vn/receipt/${booking.public_token}`
        };

        const response = await zaloZnsService.sendZnsMessage(booking.phone, templateId, templateData);
        res.json({ message: 'Đã xác nhận thanh toán qua Zalo ZNS', data: response });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
