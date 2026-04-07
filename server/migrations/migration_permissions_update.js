const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Revoking group modules access for Sales...');
        await client.query(`
            UPDATE role_permissions 
            SET can_view = false, can_create = false, can_edit = false, can_delete = false 
            FROM roles r 
            WHERE r.id = role_permissions.role_id 
            AND r.name = 'sales' 
            AND module_name LIKE 'group_%'
        `);

        console.log('Revoking Create/Edit for Sales on FIT items...');
        await client.query(`
            UPDATE role_permissions 
            SET can_create = false, can_edit = false 
            FROM roles r 
            WHERE r.id = role_permissions.role_id 
            AND r.name = 'sales' 
            AND module_name IN ('tours', 'departures', 'bookings')
        `);

        console.log('Granting View access for Group Manager on FIT items...');
        await client.query(`
            INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) 
            SELECT r.id, m.mod_name, true, false, false, false 
            FROM roles r 
            CROSS JOIN (VALUES ('tours'), ('departures'), ('guides'), ('bookings'), ('customers')) AS m(mod_name) 
            WHERE r.name = 'group_manager' 
            ON CONFLICT (role_id, module_name) DO UPDATE SET can_view = true
        `);

        await client.query('COMMIT');
        console.log('✅ Migration permissions update successful!');
    } catch(err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
