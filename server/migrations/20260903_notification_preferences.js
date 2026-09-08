const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function up() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS bus text[] DEFAULT '{}';
            ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"push_bu_message": true, "push_personal_assignment": true, "push_customer_message": true}';
        `);
        await client.query('COMMIT');
        console.log("Migration UP successful: users notification_preferences and bus added.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration UP failed: ", e);
        throw e;
    } finally {
        client.release();
    }
}

up().then(() => process.exit(0)).catch(() => process.exit(1));
