const db = require('./db/index');

async function migrate() {
    try {
        console.log('Adding visa_id to payment_vouchers...');
        // Alter payment_vouchers
        await db.query(`ALTER TABLE payment_vouchers ADD COLUMN IF NOT EXISTS visa_id INTEGER`);
        
        console.log('Adding total_collected and total_paid to visas...');
        // Alter visas
        await db.query(`ALTER TABLE visas ADD COLUMN IF NOT EXISTS total_collected BIGINT DEFAULT 0`);
        await db.query(`ALTER TABLE visas ADD COLUMN IF NOT EXISTS total_paid BIGINT DEFAULT 0`);

        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
