const db = require('../db');

async function up() {
    console.log('Running migration: add keywords column to business_units');
    try {
        await db.query(`
            ALTER TABLE business_units ADD COLUMN IF NOT EXISTS keywords TEXT[] DEFAULT '{}';
        `);
        console.log('✅ Added "keywords" column successfully.');
    } catch (e) {
        console.log('❌ Failed to add "keywords" column:', e.message);
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
