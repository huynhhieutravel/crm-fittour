const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Adjust path if needed

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Running migration: Add is_deleted column for Soft Delete...');

    // 1. Add is_deleted to tour_departures
    await client.query(`
      ALTER TABLE tour_departures 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
    `);
    console.log('Added is_deleted to tour_departures.');

    // 2. Add is_deleted to bookings
    await client.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;
    `);
    console.log('Added is_deleted to bookings.');

    // 3. Update existing records just to be safe
    await client.query('UPDATE tour_departures SET is_deleted = FALSE WHERE is_deleted IS NULL;');
    await client.query('UPDATE bookings SET is_deleted = FALSE WHERE is_deleted IS NULL;');

    await client.query('COMMIT');
    console.log('Migration completed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
  } finally {
    client.release();
    pool.end();
  }
}

runMigration();
