const db = require('./db');

async function migrate() {
    try {
        console.log('--- STARTING HEALTH CHECK MIGRATION ---');
        
        // 1. Create activity_logs table
        await db.query(`
            CREATE TABLE IF NOT EXISTS activity_logs (
                id SERIAL PRIMARY KEY,
                user_id INTEGER,
                action_type VARCHAR(50) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE', 'CONVERT'
                entity_type VARCHAR(50) NOT NULL, -- 'LEAD', 'CUSTOMER', 'BOOKING'
                entity_id INTEGER NOT NULL,
                details TEXT,
                old_data JSONB,
                new_data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ activity_logs table created or already exists');

        // Fix created_at default if needed (PSQL uses CURRENT_TIMESTAMP)
        await db.query(`ALTER TABLE activity_logs ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP`);

        // 2. Add some missing columns to leads if any (budget, source_id already checked in schema)
        
        console.log('--- MIGRATION COMPLETED SUCCESSFULY ---');
    } catch (err) {
        console.error('Migration Error:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
