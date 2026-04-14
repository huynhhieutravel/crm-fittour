const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS marketing_ads_kpis (
          id SERIAL PRIMARY KEY,
          bu_name VARCHAR(100),
          year INTEGER,
          month INTEGER, -- 0 for yearly master KPI, 1-12 for monthly overrides
          budget NUMERIC DEFAULT 0,
          target_routes INTEGER DEFAULT 0,
          target_groups INTEGER DEFAULT 0,
          target_customers INTEGER DEFAULT 0,
          target_cpa NUMERIC DEFAULT 0,
          target_leads INTEGER DEFAULT 0,
          target_cpl NUMERIC DEFAULT 0,
          pic_name VARCHAR(255),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(bu_name, year, month)
      );
    `);
    console.log('Migration successful: Table marketing_ads_kpis created.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    pool.end();
  }
}

migrate();
