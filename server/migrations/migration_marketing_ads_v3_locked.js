/**
 * Migration: Add is_locked column to marketing_ads_reports
 * Safe to run multiple times (IF NOT EXISTS)
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        await pool.query(`
            ALTER TABLE marketing_ads_reports 
            ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false
        `);
        console.log('✅ Column is_locked added (or already exists)');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
