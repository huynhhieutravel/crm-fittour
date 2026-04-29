const db = require('../db');
const { invalidateCache } = require('../middleware/permCheck');

const run = async () => {
    try {
        console.log('Adding markets permission to permissions_master...');
        
        // Insert permission 'change_markets'
        const insertRes = await db.query(`
            INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order)
            VALUES ('markets', 'change_markets', 'Thêm/Sửa/Xóa Thị trường', 'Thị trường', 120)
            ON CONFLICT DO NOTHING
            RETURNING id;
        `);
        
        console.log('Inserted:', insertRes.rowCount > 0 ? 'Success' : 'Already exists');
        
        // Let's also grant this permission to admin and manager by default
        const permRes = await db.query(`SELECT id FROM permissions_master WHERE module = 'markets' AND action = 'change_markets'`);
        if (permRes.rows.length > 0) {
            const permId = permRes.rows[0].id;
            
            // Get role_ids for admin and manager
            const rolesRes = await db.query(`SELECT id, role_name FROM user_roles WHERE role_name IN ('admin', 'manager')`);
            
            for (let role of rolesRes.rows) {
                await db.query(`
                    INSERT INTO role_permissions_v2 (role_id, permission_id, granted)
                    VALUES ($1, $2, true)
                    ON CONFLICT DO NOTHING
                `, [role.id, permId]);
            }
            console.log('Granted default access to admin and manager');
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
