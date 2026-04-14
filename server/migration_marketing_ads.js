const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
  const query = `
    CREATE TABLE IF NOT EXISTS marketing_ads_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      bu_name VARCHAR(50) NOT NULL,
      year INT NOT NULL,
      month INT NOT NULL,
      week_number INT NOT NULL,
      campaign_name TEXT,
      ad_set_name TEXT,
      ad_name TEXT,
      spend NUMERIC,
      messages INT,
      cpl_msg NUMERIC,
      leads INT,
      cpl_lead NUMERIC,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log("Migration successful: Table marketing_ads_reports created or already exists.");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
