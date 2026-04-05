const db = require('../db');

async function up() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log("Creating group_leaders table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_leaders (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                company_name VARCHAR(255),
                phone VARCHAR(50),
                email VARCHAR(255),
                preferences TEXT,
                dob DATE,
                metadata JSONB DEFAULT '{}',
                assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Creating group_projects table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_projects (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                group_leader_id INTEGER REFERENCES group_leaders(id) ON DELETE SET NULL,
                source VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Báo giá',
                destination VARCHAR(255),
                expected_pax INTEGER DEFAULT 0,
                departure_date DATE,
                return_date DATE,
                expected_month VARCHAR(50),
                price_per_pax NUMERIC(15, 2) DEFAULT 0,
                total_revenue NUMERIC(15, 2) DEFAULT 0,
                assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
                notes TEXT,
                metadata JSONB DEFAULT '{}',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Trigger for calculating price_per_pax dynamically on update or insert
        await client.query(`
            CREATE OR REPLACE FUNCTION calc_price_per_pax()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.expected_pax > 0 THEN
                    NEW.price_per_pax = ROUND(NEW.total_revenue / NEW.expected_pax, 2);
                ELSE
                    NEW.price_per_pax = 0;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            DROP TRIGGER IF EXISTS calc_group_project_price ON group_projects;
            CREATE TRIGGER calc_group_project_price
            BEFORE INSERT OR UPDATE ON group_projects
            FOR EACH ROW
            EXECUTE FUNCTION calc_price_per_pax();
        `);

        console.log("Injecting default role permissions for group_projects & group_leaders...");
        
        // Trưởng Sale / Manager / Admin permissions mapping logic
        // Need to loop through roles and apply reasonable defaults
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

            // check if exists
            const existingLeader = await client.query('SELECT 1 FROM role_permissions WHERE role_id=$1 AND module_name=$2', [r.id, 'group_leaders']);
            if (existingLeader.rows.length === 0) {
                 await client.query('INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES ($1,$2,$3,$4,$5,$6)',
                 [r.id, 'group_leaders', canView, canCreate, canEdit, canDelete]);
            }
            
            const existingProj = await client.query('SELECT 1 FROM role_permissions WHERE role_id=$1 AND module_name=$2', [r.id, 'group_projects']);
            if (existingProj.rows.length === 0) {
                 await client.query('INSERT INTO role_permissions (role_id, module_name, can_view, can_create, can_edit, can_delete) VALUES ($1,$2,$3,$4,$5,$6)',
                 [r.id, 'group_projects', canView, canCreate, canEdit, canDelete]);
            }
        }

        await client.query('COMMIT');
        console.log("Migration BU3 MICE modules success!");
    } catch(err) {
        await client.query('ROLLBACK');
        console.error("Migration failed", err);
    } finally {
        client.release();
        process.exit(0);
    }
}

up();
