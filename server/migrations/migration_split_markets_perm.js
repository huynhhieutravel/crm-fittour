const db = require('../db');
const { invalidateCache } = require('../middleware/permCheck');

const run = async () => {
    try {
        console.log('Splitting markets permissions in permissions_master...');
        
        // 1. Delete the old 'change_markets' permission
        const oldPermRes = await db.query(`SELECT id FROM permissions_master WHERE module = 'markets' AND action = 'change_markets'`);
        if (oldPermRes.rows.length > 0) {
            const oldPermId = oldPermRes.rows[0].id;
            await db.query(`DELETE FROM role_permissions_v2 WHERE permission_id = $1`, [oldPermId]);
            await db.query(`DELETE FROM user_permissions_v2 WHERE permission_id = $1`, [oldPermId]);
            await db.query(`DELETE FROM permissions_master WHERE id = $1`, [oldPermId]);
        }

        // 2. Insert new granular permissions
        const perms = [
            { action: 'view', label: 'Xem danh sách', order: 120 },
            { action: 'create', label: 'Thêm mới', order: 121 },
            { action: 'edit', label: 'Sửa thông tin', order: 122 },
            { action: 'delete', label: 'Xóa', order: 123 }
        ];

        for (let p of perms) {
            await db.query(`
                INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order)
                VALUES ('markets', $1, $2, 'Thị trường', $3)
                ON CONFLICT (module, action) DO NOTHING
            `, [p.action, p.label, p.order]);
        }
        
        // 3. Grant default access to admin and manager
        const rolesRes = await db.query(`SELECT id FROM roles WHERE name IN ('admin', 'manager')`);
        
        for (let p of perms) {
            const permRes = await db.query(`SELECT id FROM permissions_master WHERE module = 'markets' AND action = $1`, [p.action]);
            if (permRes.rows.length > 0) {
                const permId = permRes.rows[0].id;
                for (let role of rolesRes.rows) {
                    await db.query(`
                        INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                        VALUES ($1, $2, true)
                        ON CONFLICT DO NOTHING
                    `, [role.id, permId]);
                }
            }
        }

        invalidateCache();
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
};

run();
