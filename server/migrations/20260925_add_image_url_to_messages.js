const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function up() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Add image_url column to messages table if not exists
    await client.query(`
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS image_url TEXT;
    `);

    await client.query('COMMIT');
    console.log("✅ Migration UP successful: image_url column added to messages table.");
  } catch (e) {
    await client.query('ROLLBACK');
    console.error("❌ Migration UP failed:", e);
    throw e;
  } finally {
    client.release();
  }
}

up().then(() => process.exit(0)).catch(() => process.exit(1));
