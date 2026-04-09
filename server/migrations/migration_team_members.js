const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('=== Step 1: Create team_members junction table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS team_members (
                id SERIAL PRIMARY KEY,
                team_id INT REFERENCES teams(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(team_id, user_id)
            );
        `);
        console.log('✅ team_members table created');

        console.log('=== Step 2: Migrate data from users.team_id → team_members ===');
        const migrated = await client.query(`
            INSERT INTO team_members (team_id, user_id)
            SELECT team_id, id FROM users WHERE team_id IS NOT NULL
            ON CONFLICT (team_id, user_id) DO NOTHING
        `);
        console.log(`✅ ${migrated.rowCount} user-team memberships migrated`);

        await client.query('COMMIT');

        console.log('\n🎉 Migration completed!');

        // Verification
        const verify = await pool.query(`
            SELECT u.full_name, u.username, 
                   ARRAY_AGG(t.name ORDER BY t.name) as teams,
                   EXISTS(SELECT 1 FROM team_managers tm WHERE tm.user_id = u.id) as is_manager
            FROM users u
            LEFT JOIN team_members tmb ON tmb.user_id = u.id
            LEFT JOIN teams t ON tmb.team_id = t.id
            GROUP BY u.id, u.full_name, u.username
            HAVING COUNT(t.id) > 0
            ORDER BY u.full_name
        `);
        console.log('\n=== Users & Their Teams ===');
        verify.rows.forEach(r => {
            const badge = r.is_manager ? ' ⭐ MANAGER' : '';
            console.log(`  ${r.full_name} (@${r.username}): [${r.teams.join(', ')}]${badge}`);
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
