const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Fetching roles...');
        const rolesRes = await client.query("SELECT id, name FROM roles WHERE name IN ('admin', 'manager', 'group_manager', 'group_staff')");
        const roles = rolesRes.rows;

        const newModules = ['b2b_companies', 'group_leaders', 'group_projects'];

        for (const role of roles) {
            for (const mod of newModules) {
                let cv = false, cc = false, ce = false, cd = false;

                if (role.name === 'admin' || role.name === 'manager' || role.name === 'group_manager') {
                    cv = true; cc = true; ce = true; cd = true;
                } else if (role.name === 'group_staff') {
                     // Staff có thể xem, tạo và sửa (thu thập data, lên dự án), nhưng KHÔNG thể xoá để bảo vệ data.
                    cv = true; cc = true; ce = true; cd = false;
                }

                await client.query(`
                    INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (role_id, module_name) DO UPDATE SET
                        can_view = EXCLUDED.can_view,
                        can_create = EXCLUDED.can_create,
                        can_edit = EXCLUDED.can_edit,
                        can_delete = EXCLUDED.can_delete
                `, [role.id, mod, cv, cc, ce, cd]);
                
                console.log(`✅ ${role.name} → ${mod}: view=${cv} create=${cc} edit=${ce} delete=${cd}`);
            }
        }

        await client.query('COMMIT');
        console.log('\\n✅ Core MICE permissions migration completed!');
    } catch(err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
