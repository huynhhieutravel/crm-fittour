const db = require('../db');

async function up() {
    console.log('Running migration: modify activity_logs table');
    try {
        await db.query(`
            ALTER TABLE activity_logs RENAME COLUMN action TO action_type;
        `);
    } catch (e) {
        console.log('RENAME action TO action_type might already be done or failed:', e.message);
    }

    try {
        await db.query(`
            ALTER TABLE activity_logs ADD COLUMN entity_type VARCHAR(50);
            ALTER TABLE activity_logs ADD COLUMN entity_id INTEGER;
            ALTER TABLE activity_logs ADD COLUMN old_data JSONB;
            ALTER TABLE activity_logs ADD COLUMN new_data JSONB;
            ALTER TABLE activity_logs ALTER COLUMN details TYPE TEXT;
        `);
    } catch (e) {
        console.log('ADD columns might already be done or failed:', e.message);
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
