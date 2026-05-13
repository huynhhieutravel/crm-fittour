const db = require('../db');

async function up() {
    console.log('Running migration: add bu column to meeting_bookings');
    try {
        await db.query(`
            ALTER TABLE meeting_bookings ADD COLUMN IF NOT EXISTS bu VARCHAR(50);
        `);
        console.log('✅ Added "bu" column successfully.');
    } catch (e) {
        console.log('❌ Failed to add "bu" column:', e.message);
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
