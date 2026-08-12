const db = require('../db');

async function up() {
    try {
        console.log('Running migration: 20260811_mobile_app_link');
        
        await db.query(`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS app_id VARCHAR(10),
            ADD COLUMN IF NOT EXISTS mobile_link_sync_status VARCHAR(20),
            ADD COLUMN IF NOT EXISTS mobile_link_synced_at TIMESTAMP;
        `);

        await db.query(`
            CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_customers_app_id_unique 
            ON customers(app_id) WHERE app_id IS NOT NULL;
        `);

        console.log('Migration 20260811_mobile_app_link completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
        throw err;
    }
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { up };
