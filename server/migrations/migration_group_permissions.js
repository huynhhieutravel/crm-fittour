const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // === 1. Tạo Roles mới cho Tour Đoàn ===
        console.log('Creating group_manager role...');
        await client.query(`INSERT INTO roles (name) VALUES ('group_manager') ON CONFLICT DO NOTHING`);
        console.log('Creating group_staff role...');
        await client.query(`INSERT INTO roles (name) VALUES ('group_staff') ON CONFLICT DO NOTHING`);

        // === 2. Lấy tất cả role IDs ===
        const rolesRes = await client.query('SELECT id, name FROM roles ORDER BY id');
        const allRoles = rolesRes.rows;
        console.log('All roles:', allRoles.map(r => `${r.name}(${r.id})`).join(', '));

        // === 3. Thêm 7 group module permissions cho mỗi role ===
        const groupModules = [
            'group_hotels', 'group_restaurants', 'group_transports',
            'group_tickets', 'group_airlines', 'group_landtours', 'group_insurances'
        ];

        for (const role of allRoles) {
            for (const mod of groupModules) {
                // Default permissions based on role
                let can_view = false, can_create = false, can_edit = false, can_delete = false;

                if (role.name === 'admin') {
                    can_view = true; can_create = true; can_edit = true; can_delete = true;
                } else if (role.name === 'group_manager') {
                    can_view = true; can_create = true; can_edit = true; can_delete = true;
                } else if (role.name === 'group_staff') {
                    can_view = true; can_create = false; can_edit = false; can_delete = false;
                }
                // All other roles (sales, marketing, operations, manager) → all false

                await client.query(`
                    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (role_id, module_name) DO NOTHING
                `, [role.id, mod, can_view, can_create, can_edit, can_delete]);
                
                console.log(`  ✅ ${role.name} → ${mod}: view=${can_view} create=${can_create} edit=${can_edit} delete=${can_delete}`);
            }
        }

        // === 4. Cũng thêm FIT modules (leads, tours, etc.) cho 2 role mới ===
        const fitModules = ['leads', 'tours', 'departures', 'guides', 'customers', 'bookings', 'users', 'settings'];
        const newGroupRoles = allRoles.filter(r => r.name === 'group_manager' || r.name === 'group_staff');
        
        for (const role of newGroupRoles) {
            for (const mod of fitModules) {
                // group_manager/group_staff mặc định không có quyền FIT modules
                await client.query(`
                    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
                    VALUES ($1, $2, false, false, false, false)
                    ON CONFLICT (role_id, module_name) DO NOTHING
                `, [role.id, mod]);
            }
            console.log(`  ✅ ${role.name} → FIT modules: all false (isolated)`);
        }

        await client.query('COMMIT');
        console.log('\n✅ Migration completed: Roles + Group Permissions created!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
