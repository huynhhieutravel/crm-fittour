const db = require('../db');

async function migrate() {
    try {
        console.log('Running migration...');
        await db.query(`
            ALTER TABLE restaurant_services 
            ADD COLUMN IF NOT EXISTS cost_price NUMERIC,
            ADD COLUMN IF NOT EXISTS net_price NUMERIC,
            ADD COLUMN IF NOT EXISTS sale_price NUMERIC,
            ADD COLUMN IF NOT EXISTS notes TEXT;
        `);
        console.log('Migration local successful!');
    } catch (e) {
        console.error('Migration failed:', e);
    }
    process.exit(0);
}
migrate();
