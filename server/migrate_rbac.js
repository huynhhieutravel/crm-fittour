const client = require('./db');

async function migrateRBAC() {
  try {
    console.log('--- Starting RBAC Database Migration ---');
    
    // 1. Alter Users Table
    console.log('1. Altering users table (adding is_active, phone)...');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE');
    await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)');
    
    // 2. Fix invalid role_ids based on username conventions
    console.log('2. Fixing user role_ids to match correct roles table...');
    // sales = 2, marketing = 3, operations = 4, manager = 5, admin = 1
    await client.query("UPDATE users SET role_id = 1 WHERE username LIKE '%admin' OR username = 'admin'");
    await client.query("UPDATE users SET role_id = 5 WHERE username LIKE '%manager'");
    await client.query("UPDATE users SET role_id = 3 WHERE username LIKE '%staff'");
    await client.query("UPDATE users SET role_id = 2 WHERE username LIKE '%sale'");
    
    // 3. Create role_permissions table
    console.log('3. Creating role_permissions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        module_name VARCHAR(50) NOT NULL,
        can_view BOOLEAN DEFAULT FALSE,
        can_create BOOLEAN DEFAULT FALSE,
        can_edit BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        UNIQUE(role_id, module_name)
      )
    `);
    
    // 4. Create user_permissions table (Overrides)
    console.log('4. Creating user_permissions table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_permissions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        module_name VARCHAR(50) NOT NULL,
        can_view BOOLEAN DEFAULT FALSE,
        can_create BOOLEAN DEFAULT FALSE,
        can_edit BOOLEAN DEFAULT FALSE,
        can_delete BOOLEAN DEFAULT FALSE,
        UNIQUE(user_id, module_name)
      )
    `);
    
    // 5. Seed default role permissions
    console.log('5. Seeding default role permissions...');
    const modules = ['leads', 'tours', 'departures', 'guides', 'customers', 'bookings', 'users', 'settings'];
    const roles = await client.query('SELECT * FROM roles');
    
    for (const role of roles.rows) {
      for (const mod of modules) {
        let permissions = { cv: false, cc: false, ce: false, cd: false };
        
        // Admin gets everything
        if (role.name === 'admin' || role.name === 'manager') {
          permissions = { cv: true, cc: true, ce: true, cd: true };
        } 
        else if (role.name === 'sales') {
          if (['leads', 'customers', 'bookings', 'tours'].includes(mod)) {
             permissions = { cv: true, cc: true, ce: true, cd: false };
          } else if (mod === 'departures' || mod === 'guides') {
             permissions = { cv: true, cc: false, ce: false, cd: false };
          }
        }
        else if (role.name === 'operations') {
          if (['tours', 'departures', 'guides'].includes(mod)) {
             permissions = { cv: true, cc: true, ce: true, cd: false };
          } else if (['leads', 'customers', 'bookings'].includes(mod)) {
             permissions = { cv: true, cc: false, ce: false, cd: false };
          }
        }
        else if (role.name === 'marketing') {
          if (['leads', 'tours'].includes(mod)) {
             permissions = { cv: true, cc: true, ce: true, cd: false };
          } else if (mod === 'customers' || mod === 'departures') {
             permissions = { cv: true, cc: false, ce: false, cd: false };
          }
        }
        
        await client.query(`
          INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (role_id, module_name) DO UPDATE SET
            can_view = EXCLUDED.can_view,
            can_create = EXCLUDED.can_create,
            can_edit = EXCLUDED.can_edit,
            can_delete = EXCLUDED.can_delete
        `, [role.id, mod, permissions.cv, permissions.cc, permissions.ce, permissions.cd]);
      }
    }
    
    console.log('--- ✅ RBAC Migration Completed Successfully! ---');
  } catch (err) {
    console.error('--- ❌ Migration Error:', err.message);
  } finally {
    process.exit();
  }
}

migrateRBAC();
