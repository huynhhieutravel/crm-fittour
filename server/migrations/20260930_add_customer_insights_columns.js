const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    console.log('Adding missing insights & passport_url columns to customers table...');
    
    await client.query(`
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS destinations TEXT DEFAULT '[]';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS experiences TEXT DEFAULT '[]';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS travel_styles TEXT DEFAULT '[]';
      ALTER TABLE customers ADD COLUMN IF NOT EXISTS passport_url TEXT;
    `);
    
    await client.query('COMMIT');
    console.log('✅ Added missing customer columns successfully!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
