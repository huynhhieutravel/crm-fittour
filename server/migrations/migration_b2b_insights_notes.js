const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('1. Adding insight columns to b2b_companies...');
        await client.query(`
            ALTER TABLE b2b_companies
            ADD COLUMN IF NOT EXISTS travel_styles TEXT,
            ADD COLUMN IF NOT EXISTS experiences TEXT,
            ADD COLUMN IF NOT EXISTS internal_notes TEXT,
            ADD COLUMN IF NOT EXISTS special_requests TEXT,
            ADD COLUMN IF NOT EXISTS first_deal_date DATE
        `);

        console.log('2. Creating b2b_company_notes table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS b2b_company_notes (
                id SERIAL PRIMARY KEY,
                company_id INT REFERENCES b2b_companies(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_by INT REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('3. Ensuring group_leader_events has company_id (it should already have it)');
        await client.query(`
            ALTER TABLE group_leader_events 
            ADD COLUMN IF NOT EXISTS company_id INT REFERENCES b2b_companies(id) ON DELETE SET NULL
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
