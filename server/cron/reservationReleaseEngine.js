const cron = require('node-cron');
const db = require('../db');
const { logActivity } = require('../utils/logger');
const SystemEvents = require('../constants/SystemEvents');
const { emitEvent } = require('../utils/eventBus');

function startReservationReleaseCron() {
    console.log('🕒 Bắt đầu chạy Cronjob: Reservation Release Engine (Auto-Expire HELD bookings)');
    
    // Run every minute
    cron.schedule('* * * * *', async () => {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // Find and update all HELD bookings that have expired
            const updateRes = await client.query(`
                UPDATE bookings 
                SET booking_status = 'EXPIRED', 
                    notes = CONCAT(COALESCE(notes, ''), '\n[Hệ thống tự động giải phóng do hết hạn giữ chỗ (expires_at)]')
                WHERE booking_status IN ('HELD', 'Giữ chỗ') 
                  AND expires_at IS NOT NULL
                  AND expires_at <= CURRENT_TIMESTAMP
                RETURNING id, booking_code, tour_departure_id, pax_count, created_by
            `);

            if (updateRes.rows.length > 0) {
                console.log(`[RESERVATION_ENGINE] Released ${updateRes.rows.length} expired reservations.`);
                
                // Log activity for each released booking
                for (const row of updateRes.rows) {
                    await logActivity({
                        user_id: null, // System
                        action_type: 'UPDATE',
                        details: `Hệ thống tự động EXPIRED booking do hết hạn giữ chỗ: ${row.booking_code}`,
                        entity_id: row.id,
                        entity_type: 'BOOKING'
                    });
                    
                    emitEvent('BOOKING_CANCELLED', {
                        booking_id: row.id,
                        booking_code: row.booking_code,
                        status: 'EXPIRED',
                        user_id: row.created_by,
                        updated_at: new Date().toISOString()
                    });
                }
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('[RESERVATION_ENGINE] Lỗi khi chạy auto-release:', err);
        } finally {
            client.release();
        }
    });
}

module.exports = { startReservationReleaseCron };
