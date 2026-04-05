const db = require('../db');
const { logActivity } = require('../utils/logger');

async function migrate() {
    try {
        await db.query(`ALTER TABLE group_projects ADD COLUMN IF NOT EXISTS return_date DATE`);
        console.log('Migration ADD return_date successful');
    } catch (err) {
        console.error('Migration failed', err);
    } finally {
        process.exit();
    }
}
migrate();
