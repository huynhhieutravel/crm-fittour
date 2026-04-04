require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const adminUser = await db.query("SELECT id FROM users WHERE username = 'admin' LIMIT 1");
    if (adminUser.rows.length === 0) {
      console.log('Admin user not found. Cannot safely proceed.');
      process.exit(1);
    }
    const adminId = adminUser.rows[0].id;

    // Remove user permissions for all non-admins
    await db.query(`DELETE FROM user_permissions WHERE user_id != $1`, [adminId]);

    // SET NULL for assigned foreign keys to prevent constraint errors
    const tablesToNullifyUser = [
        { table: 'customers', col: 'assigned_to' },
        { table: 'leads', col: 'assigned_to' },
        { table: 'tasks', col: 'assigned_to' },
        { table: 'departure_reminders', col: 'assigned_to' },
        { table: 'booking_transactions', col: 'created_by' },
        { table: 'customer_events', col: 'created_by' },
        { table: 'lead_notes', col: 'created_by' },
        { table: 'tour_notes', col: 'created_by' },
        { table: 'tour_departures', col: 'operator_id' }
    ];

    for (let t of tablesToNullifyUser) {
        try {
            await db.query(`UPDATE ${t.table} SET ${t.col} = NULL WHERE ${t.col} != $1 AND ${t.col} IS NOT NULL`, [adminId]);
            console.log(`Nullified ${t.col} in ${t.table}`);
        } catch (e) {
            console.error(`Error updating table ${t.table}:`, e.message);
        }
    }

    // Now delete all users except admin
    await db.query(`DELETE FROM users WHERE id != $1 AND username != 'admin'`, [adminId]);
    console.log('Deleted all users except admin.');

    // Users to create from the image
    // HI1 - Hồng Trang - hi1.sale
    // HI2 - Max Vũ - hi2.sale
    // HI3 - Huy - hi3.sale
    const usersToCreate = [
        { username: 'hi1.sale', name: 'Hồng Trang' },
        { username: 'hi2.sale', name: 'Max Vũ' },
        { username: 'hi3.sale', name: 'Huy' }
    ];

    const passwords = [];
    
    // Get staff role id
    let roleId = null;
    const roleReq = await db.query("SELECT id FROM roles ORDER BY id ASC LIMIT 1"); // Assuming role 1 might be admin or staff but we let the users specify role later if needed
    
    const staffRoleReq = await db.query("SELECT id FROM roles WHERE name ilike '%staff%' or name ilike '%sale%' limit 1");
    if(staffRoleReq.rows.length > 0) roleId = staffRoleReq.rows[0].id;
    else if(roleReq.rows.length > 0) roleId = roleReq.rows[0].id;

    for (const u of usersToCreate) {
        // Generate password
        const pass = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6).toUpperCase() + '@' + Math.floor(Math.random()*100);
        passwords.push({ username: u.username, name: u.name, password: pass });
        
        const salt = await bcrypt.genSalt(10);
        const hashedPw = await bcrypt.hash(pass, salt);

        await db.query(
            `INSERT INTO users (username, password, full_name, email, role, role_id) 
            VALUES ($1, $2, $3, $4, 'staff', $5)`,
            [u.username, hashedPw, u.name, u.username + '@fittour.com', roleId]
        );
        console.log(`Created ${u.username}`);
    }

    console.log('\n--- NEW PASSWORDS ---');
    passwords.forEach(p => console.log(`${p.name} (${p.username}): ${p.password}`));
    console.log('---------------------');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
