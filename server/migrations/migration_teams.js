const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        console.log('=== Phase 1: Creating teams table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                code VARCHAR(50) UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ teams table created');

        console.log('=== Phase 2: Creating team_managers junction table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS team_managers (
                id SERIAL PRIMARY KEY,
                team_id INT REFERENCES teams(id) ON DELETE CASCADE,
                user_id INT REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(team_id, user_id)
            );
        `);
        console.log('✅ team_managers table created');

        console.log('=== Phase 3: Adding team_id to users ===');
        // Check if column already exists
        const colCheck = await client.query(`
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'team_id'
        `);
        if (colCheck.rows.length === 0) {
            await client.query(`
                ALTER TABLE users ADD COLUMN team_id INT REFERENCES teams(id) ON DELETE SET NULL;
            `);
            console.log('✅ team_id column added to users');
        } else {
            console.log('⏭️  team_id column already exists');
        }

        console.log('=== Phase 4: Seeding initial teams ===');
        await client.query(`
            INSERT INTO teams (name, code) VALUES
                ('Sale', 'sale'),
                ('Marketing', 'marketing'),
                ('Điều hành Tour', 'operations'),
                ('Tour Đoàn (MICE)', 'mice')
            ON CONFLICT (code) DO NOTHING;
        `);
        console.log('✅ 4 teams seeded');

        console.log('=== Phase 5: Auto-assigning users to teams based on role ===');
        
        // Sale team: roles sales, sales_lead
        const saleTeam = await client.query("SELECT id FROM teams WHERE code = 'sale'");
        if (saleTeam.rows.length > 0) {
            const saleTeamId = saleTeam.rows[0].id;
            const saleResult = await client.query(`
                UPDATE users SET team_id = $1 
                WHERE role_id IN (SELECT id FROM roles WHERE name IN ('sales', 'sales_lead'))
                AND team_id IS NULL
            `, [saleTeamId]);
            console.log(`  → ${saleResult.rowCount} users assigned to Sale team`);

            // Register sales_lead as manager
            await client.query(`
                INSERT INTO team_managers (team_id, user_id)
                SELECT $1, u.id FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE r.name = 'sales_lead'
                ON CONFLICT (team_id, user_id) DO NOTHING
            `, [saleTeamId]);
        }

        // Marketing team
        const mktTeam = await client.query("SELECT id FROM teams WHERE code = 'marketing'");
        if (mktTeam.rows.length > 0) {
            const mktTeamId = mktTeam.rows[0].id;
            const mktResult = await client.query(`
                UPDATE users SET team_id = $1 
                WHERE role_id IN (SELECT id FROM roles WHERE name IN ('marketing', 'marketing_lead'))
                AND team_id IS NULL
            `, [mktTeamId]);
            console.log(`  → ${mktResult.rowCount} users assigned to Marketing team`);

            await client.query(`
                INSERT INTO team_managers (team_id, user_id)
                SELECT $1, u.id FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE r.name = 'marketing_lead'
                ON CONFLICT (team_id, user_id) DO NOTHING
            `, [mktTeamId]);
        }

        // Operations team
        const opsTeam = await client.query("SELECT id FROM teams WHERE code = 'operations'");
        if (opsTeam.rows.length > 0) {
            const opsTeamId = opsTeam.rows[0].id;
            const opsResult = await client.query(`
                UPDATE users SET team_id = $1 
                WHERE role_id IN (SELECT id FROM roles WHERE name IN ('operations', 'operations_lead'))
                AND team_id IS NULL
            `, [opsTeamId]);
            console.log(`  → ${opsResult.rowCount} users assigned to Operations team`);

            await client.query(`
                INSERT INTO team_managers (team_id, user_id)
                SELECT $1, u.id FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE r.name = 'operations_lead'
                ON CONFLICT (team_id, user_id) DO NOTHING
            `, [opsTeamId]);
        }

        // MICE team: group_staff, group_manager
        const miceTeam = await client.query("SELECT id FROM teams WHERE code = 'mice'");
        if (miceTeam.rows.length > 0) {
            const miceTeamId = miceTeam.rows[0].id;
            const miceResult = await client.query(`
                UPDATE users SET team_id = $1 
                WHERE role_id IN (SELECT id FROM roles WHERE name IN ('group_staff', 'group_manager'))
                AND team_id IS NULL
            `, [miceTeamId]);
            console.log(`  → ${miceResult.rowCount} users assigned to MICE team`);

            await client.query(`
                INSERT INTO team_managers (team_id, user_id)
                SELECT $1, u.id FROM users u
                JOIN roles r ON u.role_id = r.id
                WHERE r.name = 'group_manager'
                ON CONFLICT (team_id, user_id) DO NOTHING
            `, [miceTeamId]);
        }

        console.log('=== Phase 6: Adding new permissions to permissions_master ===');
        
        // Get current max sort_order for each group to insert after existing entries
        // view_team permissions
        await client.query(`
            INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
                ('leads', 'view_team', 'Xem Lead của Team', 'Marketing & Sales', 101),
                ('bookings', 'view_team', 'Xem Booking của Team', 'Booking & Khách hàng', 301),
                ('bookings', 'edit_team', 'Sửa Booking của Team', 'Booking & Khách hàng', 304),
                ('customers', 'view_team', 'Xem KH của Team', 'Booking & Khách hàng', 321),
                ('users', 'manage_team', 'Quản lý nhân viên trong Team', 'Hệ thống', 705),
                ('users', 'reset_password_team', 'Đổi mật khẩu NV trong Team', 'Hệ thống', 706)
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ 6 new permissions added');

        // Fix sort_order conflicts: shift existing entries that clash
        // view_own for leads was 101, now view_team is 101 → bump view_own to 102
        await client.query(`
            UPDATE permissions_master SET sort_order = 102 
            WHERE module = 'leads' AND action = 'view_own' AND sort_order = 101
        `);
        await client.query(`
            UPDATE permissions_master SET sort_order = 103 
            WHERE module = 'leads' AND action = 'create' AND sort_order = 102
        `);
        await client.query(`
            UPDATE permissions_master SET sort_order = 104 
            WHERE module = 'leads' AND action = 'edit' AND sort_order = 103
        `);
        await client.query(`
            UPDATE permissions_master SET sort_order = 105 
            WHERE module = 'leads' AND action = 'delete' AND sort_order = 104
        `);
        await client.query(`
            UPDATE permissions_master SET sort_order = 106 
            WHERE module = 'leads' AND action = 'assign' AND sort_order = 105
        `);
        await client.query(`
            UPDATE permissions_master SET sort_order = 107 
            WHERE module = 'leads' AND action = 'export' AND sort_order = 106
        `);

        // Bookings: view_team at 301, shift view_own from 301 to 302
        await client.query(`
            UPDATE permissions_master SET sort_order = 302 
            WHERE module = 'bookings' AND action = 'view_own' AND sort_order = 301
        `);

        // Customers: view_team at 321, shift view_own from 321 to 322
        await client.query(`
            UPDATE permissions_master SET sort_order = 322 
            WHERE module = 'customers' AND action = 'view_own' AND sort_order = 321
        `);

        await client.query('COMMIT');

        console.log('\n🎉 Migration completed successfully!');
        
        // Verification
        console.log('\n=== Verification ===');
        const teams = await pool.query('SELECT * FROM teams');
        console.log('Teams:', teams.rows);
        
        const managers = await pool.query(`
            SELECT t.name as team, u.full_name as manager 
            FROM team_managers tm 
            JOIN teams t ON tm.team_id = t.id 
            JOIN users u ON tm.user_id = u.id
        `);
        console.log('Managers:', managers.rows);
        
        const userCount = await pool.query(`
            SELECT t.name as team, COUNT(u.id) as members 
            FROM users u 
            JOIN teams t ON u.team_id = t.id 
            GROUP BY t.name
        `);
        console.log('Members per team:', userCount.rows);

        const newPerms = await pool.query(`
            SELECT module, action, label_vi FROM permissions_master 
            WHERE action IN ('view_team', 'edit_team', 'manage_team', 'reset_password_team')
            ORDER BY sort_order
        `);
        console.log('New permissions:', newPerms.rows);

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
