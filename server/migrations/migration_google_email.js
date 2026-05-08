const db = require('../db');

async function up() {
    try {
        console.log('Adding google_email column to users table...');
        await db.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS google_email VARCHAR(255) UNIQUE;
        `);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

up();
