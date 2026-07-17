const db = require('../db');

async function up() {
    console.log('Running migration: add departure_card_data column to tour_departures_raw');
    try {
        await db.query(`
            ALTER TABLE tour_departures_raw ADD COLUMN IF NOT EXISTS departure_card_data JSONB DEFAULT '{}'::jsonb;
        `);
        console.log('✅ Added "departure_card_data" column successfully.');

        // Recreate the view to include the new column
        await db.query(`
            DROP VIEW IF EXISTS tour_departures;
            CREATE VIEW tour_departures AS
            SELECT * FROM tour_departures_raw
            WHERE COALESCE(is_deleted, false) = false;
        `);
        console.log('✅ Recreated "tour_departures" view successfully.');
    } catch (e) {
        console.log('❌ Failed migration:', e.message);
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
