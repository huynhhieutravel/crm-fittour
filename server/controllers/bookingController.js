const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.getAllBookings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, c.name as customer_name, tt.name as tour_name 
            FROM bookings b 
            LEFT JOIN customers c ON b.customer_id = c.id 
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            ORDER BY b.created_at DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createBooking = async (req, res) => {
    const { booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status, notes, pax_details, service_details } = req.body;
    try {
        // Auto-generate booking code if missing
        let finalCode = booking_code;
        if (!finalCode || finalCode.trim() === '') {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const rand = Math.floor(1000 + Math.random() * 9000);
            finalCode = `FT-${dateStr}-${rand}`;
        }

        const result = await db.query(
            'INSERT INTO bookings (booking_code, customer_id, tour_id, tour_departure_id, start_date, pax_count, total_price, payment_status, booking_status, notes, pax_details, service_details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *',
            [
              finalCode, customer_id, tour_id || null, tour_departure_id || null, 
              start_date || null, pax_count || 0, total_price || 0, payment_status || 'unpaid', 
              booking_status || 'pending', notes || null, 
              typeof pax_details === 'object' ? JSON.stringify(pax_details) : (pax_details || '[]'), 
              typeof service_details === 'object' ? JSON.stringify(service_details) : (service_details || '[]')
            ]
        );
        
        const newBooking = result.rows[0];

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
            SELECT b.*, c.name as customer_name, tt.name as tour_name
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.id = $1
        `, [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy booking' });
        res.json(result.rows[0]);
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
            'booking_status', 'notes', 'pax_details', 'service_details'
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
