const db = require('../db');

async function up() {
    try {
        console.log('Running migration: 20260812_webhook_outbox');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS webhook_outbox (
                id SERIAL PRIMARY KEY,
                app_id VARCHAR(10) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                payload JSONB,
                status VARCHAR(20) DEFAULT 'PENDING',
                retry_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_error TEXT
            );
            
            CREATE INDEX IF NOT EXISTS idx_webhook_outbox_status ON webhook_outbox(status);
        `);

        console.log('Migration 20260812_webhook_outbox completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        throw err;
    }
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { up };
