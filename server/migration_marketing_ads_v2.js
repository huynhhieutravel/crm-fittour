const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('Adding manual CRM tracking columns to marketing_ads_reports...');
        await pool.query(`
            ALTER TABLE marketing_ads_reports 
            ADD COLUMN IF NOT EXISTS crm_leads_manual INTEGER DEFAULT 0,
            ADD COLUMN IF NOT EXISTS crm_won_manual INTEGER DEFAULT 0
        `);
        console.log('Migration successful!');
    } catch (e) {
        console.error('Migration failed:', e);
    } finally {
        pool.end();
    }
}

migrate();
