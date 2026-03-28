const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting migration phase 13 (Adding Gender and Passport to Guides)...');
    
    await client.query('BEGIN');

    // Add gender column
    await client.query(`
      ALTER TABLE guides ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
    `);
    
    // Add passport column
    await client.query(`
      ALTER TABLE guides ADD COLUMN IF NOT EXISTS passport VARCHAR(50);
    `);

    await client.query('COMMIT');
    console.log('Migration phase 13 completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
