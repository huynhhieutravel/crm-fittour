const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS marketing_ads_reports (
        id SERIAL PRIMARY KEY,
        bu_name VARCHAR(100),
        year INTEGER,
        month INTEGER,
        week_number INTEGER,
        campaign_name VARCHAR(255),
        ad_set_name VARCHAR(255),
        ad_name VARCHAR(255),
        spend NUMERIC DEFAULT 0,
        messages INTEGER DEFAULT 0,
        cpl_msg NUMERIC DEFAULT 0,
        leads INTEGER DEFAULT 0,
        cpl_lead NUMERIC DEFAULT 0,
        crm_leads_manual INTEGER DEFAULT 0,
        crm_won_manual INTEGER DEFAULT 0,
        is_locked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS marketing_ads_kpis (
        id SERIAL PRIMARY KEY,
        bu_name VARCHAR(100),
        year INTEGER,
        month INTEGER,
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
    console.log('✅ Created marketing_ads_reports and marketing_ads_kpis tables if not exists.');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await pool.end();
  }
}

migrate();
