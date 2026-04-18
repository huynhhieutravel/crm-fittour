const db = require('./db/index');

async function migrate() {
    try {
        console.log('Adding finance_data column to visas...');
        await db.query(`ALTER TABLE visas ADD COLUMN IF NOT EXISTS finance_data JSONB DEFAULT '[]'`);
        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
