const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/fittour_local'
});

async function migrate() {
    try {
        console.log('Adding dispatcher columns to leads table...');
        await pool.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS dispatcher_notes TEXT,
            ADD COLUMN IF NOT EXISTS market_collection VARCHAR(100),
            ADD COLUMN IF NOT EXISTS dispatched_at TIMESTAMP,
            ADD COLUMN IF NOT EXISTS dispatched_by INTEGER,
            ADD COLUMN IF NOT EXISTS dispatched_by_name VARCHAR(100);
        `);
        console.log('Columns added successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
