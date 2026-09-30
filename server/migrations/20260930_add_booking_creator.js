const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function up() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if bookings_raw table exists
    const rawCheck = await client.query("SELECT table_name FROM information_schema.tables WHERE table_name = 'bookings_raw'");
    if (rawCheck.rows.length > 0) {
      await client.query(`
        ALTER TABLE bookings_raw ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES users(id);
        ALTER TABLE bookings_raw ADD COLUMN IF NOT EXISTS creator_name VARCHAR(100);
      `);

      // Refresh bookings view to include new columns
      await client.query(`
        CREATE OR REPLACE VIEW bookings AS
        SELECT *
        FROM bookings_raw
        WHERE (COALESCE(is_deleted, false) = false);
      `);
    } else {
      await client.query(`
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS creator_id INTEGER REFERENCES users(id);
        ALTER TABLE bookings ADD COLUMN IF NOT EXISTS creator_name VARCHAR(100);
      `);
    }

    await client.query('COMMIT');
    console.log("✅ Migration UP successful: creator_id & creator_name added to bookings.");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("❌ Migration UP failed:", e);
    throw e;
  } finally {
    client.release();
  }
}

up().then(() => process.exit(0)).catch(() => process.exit(1));
