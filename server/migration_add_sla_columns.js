const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Adding sla_30m_notified_at column...');
        await client.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS sla_30m_notified_at TIMESTAMP WITH TIME ZONE;
        `);

        console.log('Adding sla_60m_notified_at column...');
        await client.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS sla_60m_notified_at TIMESTAMP WITH TIME ZONE;
        `);

        await client.query('COMMIT');
        console.log('Migration successful!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
