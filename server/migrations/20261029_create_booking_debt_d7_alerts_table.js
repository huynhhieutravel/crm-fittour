const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('=== Step 1: Creating booking_debt_d7_alerts table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS booking_debt_d7_alerts (
                id SERIAL PRIMARY KEY,
                booking_id INT UNIQUE NOT NULL REFERENCES bookings_raw(id) ON DELETE CASCADE,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                departure_id INT NOT NULL REFERENCES tour_departures_raw(id) ON DELETE CASCADE,
                customer_name VARCHAR(255),
                customer_phone VARCHAR(50),
                tour_code VARCHAR(255),
                tour_name VARCHAR(255),
                remaining_debt NUMERIC(15, 2) DEFAULT 0,
                days_until_departure INT,
                email_sent_at TIMESTAMPTZ,
                popup_shown_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_debt_d7_user_popup ON booking_debt_d7_alerts(user_id, popup_shown_at);
            CREATE INDEX IF NOT EXISTS idx_debt_d7_booking ON booking_debt_d7_alerts(booking_id);
        `);
        console.log('✅ booking_debt_d7_alerts table created or verified');

        await client.query('COMMIT');
        console.log('🎉 Migration 20261029_create_booking_debt_d7_alerts_table finished successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
    }
}

if (require.main === module) {
    migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrate;
