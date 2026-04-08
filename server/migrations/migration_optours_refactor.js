const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
    try {
        console.log('Connecting to database...');
        
        console.log('1. Expanding tour_departures table...');
        await pool.query(`
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS tour_info JSONB DEFAULT '{}';
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS expenses JSONB DEFAULT '[]';
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS guides_json JSONB DEFAULT '[]';
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS itinerary TEXT;
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS market VARCHAR(200);
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS total_revenue NUMERIC DEFAULT 0;
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS actual_revenue NUMERIC DEFAULT 0;
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS total_expense NUMERIC DEFAULT 0;
            ALTER TABLE tour_departures ADD COLUMN IF NOT EXISTS profit NUMERIC DEFAULT 0;
            ALTER TABLE tour_departures ALTER COLUMN status TYPE VARCHAR(50);
        `);

        console.log('2. Expanding bookings table...');
        await pool.query(`
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS raw_details JSONB DEFAULT '{}';
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id);
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS created_by_name VARCHAR(100);
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS surcharge NUMERIC(12,2) DEFAULT 0;
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS base_price NUMERIC(12,2) DEFAULT 0;
            ALTER TABLE bookings ADD COLUMN IF NOT EXISTS paid NUMERIC(12,2) DEFAULT 0;
            ALTER TABLE bookings ALTER COLUMN booking_code TYPE VARCHAR(50);
            ALTER TABLE bookings ALTER COLUMN booking_status TYPE VARCHAR(50);
        `);

        console.log('3. Updating status translations...');
        // Update Bookings
        await pool.query(`UPDATE bookings SET booking_status = 'Hoàn thành' WHERE booking_status = 'completed';`);
        await pool.query(`UPDATE bookings SET booking_status = 'Giữ chỗ' WHERE booking_status = 'confirmed';`);
        await pool.query(`UPDATE bookings SET booking_status = 'Mới' WHERE booking_status = 'pending';`);
        await pool.query(`UPDATE bookings SET booking_status = 'Huỷ' WHERE booking_status = 'cancelled';`);
        await pool.query(`UPDATE bookings SET booking_status = 'Hoàn thành' WHERE booking_status = 'Thành công';`);

        // Update Departures
        await pool.query(`UPDATE tour_departures SET status = 'Hoàn thành' WHERE status = 'Completed';`);
        await pool.query(`UPDATE tour_departures SET status = 'Mở bán' WHERE status = 'Open';`);
        await pool.query(`UPDATE tour_departures SET status = 'Chắc chắn đi' WHERE status = 'Guaranteed';`);
        await pool.query(`UPDATE tour_departures SET status = 'Đã đầy' WHERE status = 'Full';`);
        await pool.query(`UPDATE tour_departures SET status = 'Huỷ' WHERE status = 'Cancelled';`);

        console.log('4. Creating payment_vouchers table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS payment_vouchers (
                id SERIAL PRIMARY KEY,
                voucher_code VARCHAR(100) UNIQUE,
                tour_id INTEGER REFERENCES tour_departures(id) ON DELETE CASCADE,
                booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
                title VARCHAR(255),
                amount NUMERIC DEFAULT 0,
                payment_method VARCHAR(50),
                payer_name VARCHAR(255),
                payer_phone VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Đã duyệt',
                notes TEXT,
                attachment_url TEXT,
                created_by INTEGER,
                created_by_name VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_vouchers_booking ON payment_vouchers(booking_id);
            CREATE INDEX IF NOT EXISTS idx_vouchers_tour ON payment_vouchers(tour_id);
        `);

        console.log('Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        pool.end();
    }
}

runMigration();
