require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function runMigration() {
    try {
        console.log('=== ADDING PRICING FIELDS ===');
        
        await db.query(`
            ALTER TABLE ticket_services 
            ADD COLUMN IF NOT EXISTS cost_price NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS net_price NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS sale_price NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS notes TEXT;
        `);
        console.log('✔ Added pricing to ticket_services.');

        await db.query(`
            ALTER TABLE transport_services 
            ADD COLUMN IF NOT EXISTS cost_price NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS net_price NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS sale_price NUMERIC(15,2),
            ADD COLUMN IF NOT EXISTS notes TEXT;
        `);
        console.log('✔ Added pricing to transport_services.');

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

runMigration();
