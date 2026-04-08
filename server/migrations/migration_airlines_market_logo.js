require('dotenv').config({ path: __dirname + '/../.env' });
const db = require('../db');

async function migrate() {
    console.log('=== ALTERING AIRLINES SCHEMA ===');
    try {
        await db.query(`ALTER TABLE airlines ALTER COLUMN market TYPE TEXT;`);
        console.log('✔ Changed airlines.market to TEXT');
        
        await db.query(`ALTER TABLE airlines ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255);`);
         console.log('✔ Added airlines.logo_url');

        console.log('=== MIGRATION COMPLETED ===');
    } catch (e) {
        console.error('❌ MIGRATION FAILED:', e);
    } finally {
        process.exit(0);
    }
}

migrate();
