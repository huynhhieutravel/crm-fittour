require('dotenv').config();
const db = require('../db');

async function migrate() {
    try {
        console.log('1. Adding assigned_at to leads if not exists...');
        await db.pool.query(`
            ALTER TABLE leads 
            ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP;
        `);

        console.log('2. Creating dispatch_snapshots table...');
        await db.pool.query(`
            CREATE TABLE IF NOT EXISTS dispatch_snapshots (
                id SERIAL PRIMARY KEY,
                snapshot_date DATE UNIQUE NOT NULL,
                data JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL
            );
        `);

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
