const { Pool } = require('pg');
require('dotenv').config({ path: __dirname + '/../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('Adding pax_details, service_details, discount to bookings table...');
        await pool.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS pax_details JSONB DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS service_details JSONB DEFAULT '[]',
            ADD COLUMN IF NOT EXISTS discount DECIMAL(15,2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS is_new_customer BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS new_customer_info JSONB;
        `);
        console.log('Successfully added new columns to bookings table.');
    } catch (e) {
        console.error('Error during migration:', e);
    } finally {
        pool.end();
    }
}

migrate();
