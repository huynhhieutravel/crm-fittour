const pool = require('../db');

async function runMigration() {
    try {
        console.log("Starting migration: add fields to guides table...");

        const queries = [
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS passport_expiry DATE;`,
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS id_card VARCHAR(50);`,
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS id_card_date DATE;`,
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS guide_card_type VARCHAR(50);`,
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS guide_card_number VARCHAR(50);`,
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS guide_card_expiry DATE;`,
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS passport_url TEXT;`,
            `ALTER TABLE guides ADD COLUMN IF NOT EXISTS guide_card_url TEXT;`
        ];

        for (const q of queries) {
            await pool.query(q);
            console.log(`Executed: ${q}`);
        }

        console.log("Migration completed successfully.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
}

runMigration();
