const db = require('../db');

async function up() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log("Creating mice_leads table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS mice_leads (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                zalo_name VARCHAR(255),
                source VARCHAR(100),
                expected_pax VARCHAR(100),
                destination VARCHAR(255),
                deadline TIMESTAMP,
                status VARCHAR(50) DEFAULT 'New', -- New, Contacted, Qualified, Lost, Converted
                assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
                notes TEXT,
                metadata JSONB DEFAULT '{}', -- stores steps checklists
                converted_project_id INTEGER REFERENCES group_projects(id) ON DELETE SET NULL,
                converted_company_id INTEGER REFERENCES b2b_companies(id) ON DELETE SET NULL,
                converted_leader_id INTEGER REFERENCES group_leaders(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Injecting default role permissions for mice_leads...");
        
        const roles = await client.query('SELECT id, name FROM roles');
        for (let r of roles.rows) {
            let canView = false, canCreate = false, canEdit = false, canDelete = false;
            
            if (r.name === 'admin' || r.name === 'manager' || r.name === 'group_manager') {
                canView = true; canCreate = true; canEdit = true; canDelete = true;
            } else if (r.name === 'sales' || r.name === 'group_staff') {
                canView = true; canCreate = true; canEdit = true; canDelete = false;
            } else if (r.name === 'marketing' || r.name === 'operations') {
                canView = true;
            }

            const existingPerm = await client.query('SELECT 1 FROM role_permissions WHERE role_id=$1 AND module_name=$2', [r.id, 'mice_leads']);
            if (existingPerm.rows.length === 0) {
                 await client.query('INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES ($1,$2,$3,$4,$5,$6)',
                 [r.id, 'mice_leads', canView, canCreate, canEdit, canDelete]);
            }
        }

        await client.query('COMMIT');
        console.log("Migration mice_leads success!");
    } catch(err) {
        await client.query('ROLLBACK');
        console.error("Migration failed", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

up();
