const db = require('../db');

async function migrate() {
    try {
        await db.query(`ALTER TABLE email_groups ADD COLUMN IF NOT EXISTS target_bus jsonb DEFAULT '[]'::jsonb;`);
        console.log("Migration successful: Added target_bus to email_groups");
        process.exit(0);
    } catch (e) {
        console.error("Migration failed:", e);
        process.exit(1);
    }
}

migrate();
