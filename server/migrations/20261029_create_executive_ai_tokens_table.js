const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('=== Step 1: Creating executive_ai_tokens table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS executive_ai_tokens (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                app_name VARCHAR(100) NOT NULL,
                token_hash VARCHAR(64) NOT NULL UNIQUE,
                token_prefix VARCHAR(24) NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                revoked_at TIMESTAMPTZ,
                last_used_at TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_exec_ai_token_hash ON executive_ai_tokens(token_hash);
            CREATE INDEX IF NOT EXISTS idx_exec_ai_user_active ON executive_ai_tokens(user_id, revoked_at, expires_at);
        `);
        console.log('✅ executive_ai_tokens table created or verified');

        console.log('=== Step 2: Seeding ai_gateway:access permission into permissions_master ===');
        const permRes = await client.query(`
            INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order)
            VALUES ('ai_gateway', 'access', 'Truy cập Executive AI Gateway', 'Hệ thống', 99)
            ON CONFLICT (module, action) DO UPDATE SET label_vi = EXCLUDED.label_vi
            RETURNING id;
        `);
        const permId = permRes.rows[0]?.id;

        if (permId) {
            console.log(`✅ Seeded ai_gateway:access with id=${permId}`);
            // Grant to admin role
            await client.query(`
                INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                SELECT r.id, $1, true
                FROM roles r
                WHERE r.name = 'admin'
                ON CONFLICT DO NOTHING;
            `, [permId]);
            console.log('✅ Granted ai_gateway:access to admin role in role_permissions_v2');
        }

        await client.query('COMMIT');
        console.log('🎉 Migration 20261029_create_executive_ai_tokens_table completed successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
        throw err;
    } finally {
        client.release();
    }
}

if (require.main === module) {
    migrate().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = migrate;

