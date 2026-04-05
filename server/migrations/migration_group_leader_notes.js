const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        await client.query(`
            CREATE TABLE IF NOT EXISTS group_leader_notes (
                id SERIAL PRIMARY KEY,
                group_leader_id INTEGER NOT NULL REFERENCES group_leaders(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_group_leader_notes_leader_id ON group_leader_notes(group_leader_id)
        `);

        await client.query('COMMIT');
        console.log('Migration group_leader_notes completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit(0);
    }
}

migrate();
