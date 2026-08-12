const db = require('../db');
const { createBookingWithLock } = require('../services/bookingService');
const { logActivity } = require('../utils/logger');
const SystemEvents = require('../constants/SystemEvents');

exports.createReservation = async (req, res) => {
    const idempotencyKey = req.headers['idempotency-key'] || null;

    if (!idempotencyKey) {
        return res.status(400).json({ error: 'Missing Idempotency-Key header' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        const payload = { 
            ...req.body, 
            booking_status: 'HELD', // Explicitly held
            created_by: req.user ? req.user.id : null 
        };
        
        const result = await createBookingWithLock(client, payload, idempotencyKey);

        if (!result.success) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(result.statusCode || 400).json({ error: result.error });
        }

        await client.query('COMMIT');
        client.release();
        
        const newBooking = result.booking;
        
        // Log activity after commit (if not an idempotent return)
        if (!result.isIdempotentReturn) {
            await logActivity({
                user_id: req.user ? req.user.id : null,
                action_type: 'CREATE',
                description: 'Tạo Reservation (HELD): ' + newBooking.booking_code,
                target_id: newBooking.id,
                target_table: 'bookings'
            });
        }

        return res.status(201).json({
            success: true,
            data: {
                reservation_id: newBooking.reservation_id,
                status: newBooking.booking_status,
                expires_at: newBooking.expires_at,
                booking_code: newBooking.booking_code,
                tour_departure_id: newBooking.tour_departure_id,
                pax_count: newBooking.pax_count
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        console.error('Error creating reservation:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
