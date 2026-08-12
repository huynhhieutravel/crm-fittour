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
            CREATE TABLE IF NOT EXISTS idempotency_keys (
                scope VARCHAR(255) NOT NULL,
                key VARCHAR(255) NOT NULL,
                request_path TEXT NOT NULL,
                request_hash VARCHAR(255) NOT NULL,
                status VARCHAR(50) NOT NULL, -- 'processing', 'completed'
                response_body JSONB,
                status_code INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                completed_at TIMESTAMP,
                PRIMARY KEY (scope, key)
            );
        `);
        await client.query(`CREATE INDEX IF NOT EXISTS idx_idempotency_keys_cleanup ON idempotency_keys(created_at, status);`);
        await client.query('COMMIT');
        console.log("Migration UP successful: idempotency_keys table created.");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Migration UP failed: ", e);
        throw e;
    } finally {
        client.release();
    }
}

up().then(() => process.exit(0)).catch(() => process.exit(1));
