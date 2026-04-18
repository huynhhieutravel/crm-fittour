const db = require('../db');

async function up() {
    console.log('Running migration: add MICE view_profit, view_dashboard, edit_own permissions');
    
    try {
        // 1. Add new permissions to permissions_master
        await db.query(`
            INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order) VALUES
            ('group_projects', 'view_profit',    'Xem Lợi nhuận Dự án MICE',     'Tour Đoàn (B2B)', 625),
            ('group_projects', 'view_dashboard', 'Xem Dashboard MICE',            'Tour Đoàn (B2B)', 626),
            ('group_projects', 'edit_own',       'Sửa DA phụ trách',              'Tour Đoàn (B2B)', 627),
            ('group_leaders',  'edit_own',       'Sửa TĐ phụ trách',              'Tour Đoàn (B2B)', 616)
            ON CONFLICT (module, action) DO NOTHING;
        `);
        console.log('✅ Added new permissions to permissions_master.');

        // 2. Fix labels for view_all/view_own to avoid duplicates
        await db.query("UPDATE permissions_master SET label_vi = 'Xem Dự án' WHERE module='group_projects' AND action='view_all'");
        await db.query("UPDATE permissions_master SET label_vi = 'Xem DA phụ trách' WHERE module='group_projects' AND action='view_own'");
        console.log('✅ Fixed duplicate labels.');

        // 3. Auto-grant to admin, manager, group_staff, group_manager
        const rolesRes = await db.query(`SELECT id, name FROM roles WHERE name IN ('admin', 'manager', 'group_staff', 'group_manager')`);
        for (const role of rolesRes.rows) {
            // Grant view_profit + view_dashboard only to admin/manager
            if (['admin', 'manager'].includes(role.name)) {
                const viewPerms = await db.query(
                    `SELECT id FROM permissions_master WHERE module = 'group_projects' AND action IN ('view_profit', 'view_dashboard')`
                );
                for (const perm of viewPerms.rows) {
                    await db.query(
                        'INSERT INTO role_permissions_v2 (role_id, permission_id, granted) VALUES ($1, $2, true) ON CONFLICT (role_id, permission_id) DO NOTHING',
                        [role.id, perm.id]
                    );
                }
            }
            // Grant edit_own to all roles
            const editPerms = await db.query(
                `SELECT id FROM permissions_master WHERE action = 'edit_own' AND module IN ('group_projects', 'group_leaders')`
            );
            for (const perm of editPerms.rows) {
                await db.query(
                    'INSERT INTO role_permissions_v2 (role_id, permission_id, granted) VALUES ($1, $2, true) ON CONFLICT (role_id, permission_id) DO NOTHING',
                    [role.id, perm.id]
                );
            }
            console.log(`   Granted permissions to role: ${role.name}`);
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration error:', err.message);
    }
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(err => {
        console.error(err);
        process.exit(1);
    });
}

module.exports = { up };
