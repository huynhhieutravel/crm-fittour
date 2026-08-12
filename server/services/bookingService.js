const crypto = require('crypto');

/**
 * Shared Booking Service - The Single Gate for Inventory Mutation
 * All booking creations (Admin, Sale, Online) MUST use this service
 * to ensure Atomic Reservation & Idempotency.
 */

const HOLD_MINUTES = Number(process.env.RESERVATION_HOLD_MINUTES || 15);

/**
 * Computes a simple SHA-256 hash of the payload for idempotency checking
 */
function computeRequestHash(payload) {
    return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/**
 * createBookingWithLock
 * @param {object} client - pg pool client (must be in a transaction: BEGIN)
 * @param {object} payload - booking data
 * @param {string} idempotencyKey - UUID for idempotency
 * @returns {object} { success, booking, error, statusCode }
 */
async function createBookingWithLock(client, payload, idempotencyKey) {
    try {
        const reqHash = computeRequestHash(payload);

        // 1. Idempotency Check
        if (idempotencyKey) {
            const idempRes = await client.query('SELECT * FROM bookings WHERE idempotency_key = $1 FOR UPDATE', [idempotencyKey]);
            if (idempRes.rows.length > 0) {
                const existing = idempRes.rows[0];
                if (existing.request_hash === reqHash) {
                    // Exact same request, return original booking
                    return { success: true, booking: existing, isIdempotentReturn: true };
                } else {
                    // Same key but different request -> 409
                    return { success: false, error: 'IDEMPOTENCY_KEY_REUSED: Same key used with different payload', statusCode: 409 };
                }
            }
        }

        // 2. FOR UPDATE lock on tour_departures
        if (!payload.tour_departure_id) {
            return { success: false, error: 'Missing tour_departure_id', statusCode: 400 };
        }

        const tourRes = await client.query('SELECT max_participants, tour_info FROM tour_departures WHERE id = $1 FOR UPDATE', [payload.tour_departure_id]);
        if (tourRes.rows.length === 0) {
            return { success: false, error: 'Không tìm thấy Tour Departure', statusCode: 404 };
        }

        const targetTour = tourRes.rows[0];
        const rawTourInfo = targetTour.tour_info || {};
        const tourInfo = typeof rawTourInfo === 'string' ? JSON.parse(rawTourInfo) : rawTourInfo;
        const totalSeats = Number(tourInfo.total_seats || targetTour.max_participants || 0);
        const allowOverbooking = tourInfo.allow_overbooking === true;
        const newQty = Number(payload.pax_count !== undefined ? payload.pax_count : 1);

        if (newQty <= 0) {
            return { success: false, error: 'Số lượng khách (pax_count) không hợp lệ', statusCode: 400 };
        }

        if (totalSeats === 0 && !allowOverbooking) {
            return { success: false, error: 'SOLD_OUT: Tour này chưa cấu hình số chỗ hoặc đã hết chỗ (Capacity = 0).', statusCode: 400 };
        }

        // 3. Inventory Check (V2 Logic)
        if (!allowOverbooking && totalSeats > 0) {
            const soldRes = await client.query(`
                SELECT COALESCE(SUM(pax_count), 0) as total_booked 
                FROM bookings 
                WHERE tour_departure_id = $1 
                AND (
                    booking_status IN ('CONFIRMED', 'COMPLETED', 'Xác nhận', 'Hoàn thành', 'Mới', 'pending')
                    OR (booking_status IN ('HELD', 'Giữ chỗ') AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP))
                )
            `, [payload.tour_departure_id]);

            const soldSoFar = Number(soldRes.rows[0].total_booked || 0);
            
            if (soldSoFar + newQty > totalSeats) {
                return { 
                    success: false, 
                    error: `SOLD_OUT: Tour chỉ còn ${totalSeats - soldSoFar} chỗ. Yêu cầu ${newQty} chỗ thất bại.`, 
                    statusCode: 400 
                };
            }
        }

        // 4. Generate Reservation ID and Expiry
        const reservation_id = crypto.randomUUID();
        let status = payload.booking_status || 'HELD';
        
        // Canonical English Mapping for safety
        const statusMap = {
            'Giữ chỗ': 'HELD', 'pending': 'HELD', 'Mới': 'HELD',
            'Đã xác nhận': 'CONFIRMED', 'confirmed': 'CONFIRMED',
            'Hoàn thành': 'COMPLETED', 'completed': 'COMPLETED',
            'Hủy': 'CANCELLED', 'Huỷ': 'CANCELLED', 'cancelled': 'CANCELLED'
        };
        if (statusMap[status]) status = statusMap[status];

        let expires_at = null;
        if (status === 'HELD') {
            const holdTime = new Date();
            holdTime.setMinutes(holdTime.getMinutes() + HOLD_MINUTES);
            expires_at = holdTime;
        }

        // Auto-generate booking code if missing
        let finalCode = payload.booking_code;
        if (!finalCode || finalCode.trim() === '') {
            const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const rand = require('crypto').randomBytes(3).toString('hex').toUpperCase();
            finalCode = `FT-${dateStr}-${rand}`;
        }

        // 5. INSERT
        await client.query('SAVEPOINT insert_booking');
        const insertRes = await client.query(
            `INSERT INTO bookings (
                booking_code, customer_id, tour_id, tour_departure_id, start_date, 
                pax_count, total_price, payment_status, booking_status, notes, 
                pax_details, service_details, discount, 
                reservation_id, expires_at, idempotency_key, request_hash,
                raw_details, created_by, created_by_name, surcharge, base_price, paid
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                $18, $19, $20, $21, $22, $23
            ) RETURNING *`,
            [
                finalCode, 
                payload.customer_id || null, 
                payload.tour_id || null, 
                payload.tour_departure_id || null, 
                payload.start_date || null, 
                newQty, 
                payload.total_price || payload.total || 0, 
                payload.payment_status || 'unpaid', 
                status, 
                payload.notes || null, 
                typeof payload.pax_details === 'object' ? JSON.stringify(payload.pax_details) : (payload.pax_details || '[]'), 
                typeof payload.service_details === 'object' ? JSON.stringify(payload.service_details) : (payload.service_details || '[]'),
                payload.discount || 0,
                reservation_id,
                expires_at,
                idempotencyKey || null,
                idempotencyKey ? reqHash : null,
                typeof payload.raw_details === 'object' ? JSON.stringify(payload.raw_details) : (payload.raw_details || '{}'),
                payload.created_by || null,
                payload.created_by_name || null,
                payload.surcharge || 0,
                payload.base_price || 0,
                payload.paid || 0
            ]
        );

        const newBooking = insertRes.rows[0];
        
        // Process Initial Deposit if any
        if (payload.initial_deposit_amount && Number(payload.initial_deposit_amount) > 0) {
            await client.query(`
                INSERT INTO booking_transactions (booking_id, amount, payment_method, transaction_date, notes, created_by)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [
                newBooking.id, 
                Number(payload.initial_deposit_amount), 
                payload.initial_deposit_method || 'CASH', 
                payload.initial_deposit_date || new Date(), 
                'Thu cọc lúc khởi tạo Đơn hàng',
                payload.created_by || null
            ]);
            
            // Re-evaluate payment status dynamically
            const depositAmt = Number(payload.initial_deposit_amount);
            const tPrice = Number(newBooking.total_price);
            let finalStatus = 'unpaid';
            if (depositAmt >= tPrice && tPrice > 0) finalStatus = 'paid';
            else if (depositAmt > 0) finalStatus = 'partial';

            if (finalStatus !== 'unpaid') {
                const updateRes = await client.query('UPDATE bookings SET payment_status = $1 WHERE id = $2 RETURNING *', [finalStatus, newBooking.id]);
                return { success: true, booking: updateRes.rows[0] };
            }
        }

        return { success: true, booking: newBooking };
    } catch (err) {
        // If it's a unique constraint violation on idempotency_key
        if (err.code === '23505' && err.constraint === 'bookings_idempotency_key_key') {
            await client.query('ROLLBACK TO SAVEPOINT insert_booking');
            // Re-fetch to return 409 or exact booking (race condition mitigated by DB unique constraint)
            const reqHash = computeRequestHash(payload);
            const idempRes = await client.query('SELECT * FROM bookings WHERE idempotency_key = $1', [idempotencyKey]);
            if (idempRes.rows.length > 0) {
                const existing = idempRes.rows[0];
                if (existing.request_hash === reqHash) {
                    return { success: true, booking: existing, isIdempotentReturn: true };
                } else {
                    return { success: false, error: 'IDEMPOTENCY_KEY_REUSED: Same key used with different payload', statusCode: 409 };
                }
            }
        }
        
        console.error('Error in createBookingWithLock:', err);
        return { success: false, error: err.message, statusCode: 500 };
    }
}

module.exports = {
    createBookingWithLock,
    computeRequestHash
};
