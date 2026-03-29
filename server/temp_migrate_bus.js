const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('Starting migration...');
    
    const checkColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'business_units' 
      AND column_name IN ('is_active', 'sort_order')
    `);
    
    const existingColumns = checkColumns.rows.map(r => r.column_name);
    
    if (!existingColumns.includes('is_active')) {
      console.log('Adding is_active column...');
      await pool.query('ALTER TABLE business_units ADD COLUMN is_active BOOLEAN DEFAULT TRUE');
    }
    
    if (!existingColumns.includes('sort_order')) {
      console.log('Adding sort_order column...');
      await pool.query('ALTER TABLE business_units ADD COLUMN sort_order INTEGER DEFAULT 0');
    }
    
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
delay(1000);
