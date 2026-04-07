const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Creating group_leader_events table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_leader_events (
                id SERIAL PRIMARY KEY,
                group_leader_id INTEGER REFERENCES group_leaders(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                event_date TIMESTAMP NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Adding company_founded_date column to group_leaders...');
        await client.query(`
            ALTER TABLE group_leaders ADD COLUMN IF NOT EXISTS company_founded_date DATE
        `);

        await client.query('COMMIT');
        console.log('\n✅ Migration completed: group_leader_events table + company_founded_date column created!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
