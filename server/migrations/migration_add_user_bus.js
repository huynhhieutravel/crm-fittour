const db = require('../db');

async function up() {
    console.log('Running migration: add bus (Multiple BUs) column to users');
    try {
        await db.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bus text[] DEFAULT '{}';
        `);
        console.log('✅ Added "bus" column successfully.');
    } catch (e) {
        console.log('❌ Failed to add "bus" column:', e.message);
    }
    console.log('Migration completed.');
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { up };
