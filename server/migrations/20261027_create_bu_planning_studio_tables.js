const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('=== Step 1: Creating bu_plans table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS bu_plans (
                id SERIAL PRIMARY KEY,
                bu_id VARCHAR(50) NOT NULL,
                plan_year INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                owner_name VARCHAR(150),
                owner_id INT REFERENCES users(id) ON DELETE SET NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
                mkt_budget_quota NUMERIC(5, 4) DEFAULT 0.0100,
                mkt_budget_total NUMERIC(15, 2) DEFAULT 0,
                notes TEXT,
                feedback_notes TEXT,
                created_by INT REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_bu_plan_year UNIQUE (bu_id, plan_year)
            );
            CREATE INDEX IF NOT EXISTS idx_bu_plans_bu_year ON bu_plans(bu_id, plan_year);
            CREATE INDEX IF NOT EXISTS idx_bu_plans_status ON bu_plans(status);
        `);
        console.log('✅ bu_plans table created or verified');

        console.log('=== Step 2: Creating bu_plan_products table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS bu_plan_products (
                id SERIAL PRIMARY KEY,
                plan_id INT NOT NULL REFERENCES bu_plans(id) ON DELETE CASCADE,
                product_code VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                group_type VARCHAR(100) DEFAULT 'Tuyến trụ cột',
                season VARCHAR(100),
                priority VARCHAR(50) DEFAULT 'Cao',
                stage VARCHAR(50) DEFAULT 'Đang bán',
                person_in_charge VARCHAR(150),
                target_pax_per_group INT DEFAULT 10,
                price_per_pax NUMERIC(15, 2) DEFAULT 0,
                variable_cost_per_pax NUMERIC(15, 2) DEFAULT 0,
                fixed_cost_per_group NUMERIC(15, 2) DEFAULT 0,
                strategy_notes TEXT,
                color VARCHAR(20) DEFAULT '#0284c7',
                icon VARCHAR(50) DEFAULT 'Compass',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_bu_plan_product_code UNIQUE (plan_id, product_code)
            );
            CREATE INDEX IF NOT EXISTS idx_bu_plan_products_plan_id ON bu_plan_products(plan_id);
        `);
        console.log('✅ bu_plan_products table created or verified');

        console.log('=== Step 3: Creating bu_plan_departures table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS bu_plan_departures (
                id SERIAL PRIMARY KEY,
                plan_id INT NOT NULL REFERENCES bu_plans(id) ON DELETE CASCADE,
                product_id INT NOT NULL REFERENCES bu_plan_products(id) ON DELETE CASCADE,
                departure_code VARCHAR(50) NOT NULL,
                month INT NOT NULL CHECK (month >= 1 AND month <= 12),
                original_milestone VARCHAR(50),
                groups_count INT NOT NULL DEFAULT 1,
                pax_per_group INT NOT NULL DEFAULT 10,
                sales_status VARCHAR(50) DEFAULT 'Đang bán',
                person_in_charge VARCHAR(150),
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_bu_plan_departure_code UNIQUE (plan_id, departure_code)
            );
            CREATE INDEX IF NOT EXISTS idx_bu_plan_departures_plan_prod ON bu_plan_departures(plan_id, product_id);
            CREATE INDEX IF NOT EXISTS idx_bu_plan_departures_month ON bu_plan_departures(plan_id, month);
        `);
        console.log('✅ bu_plan_departures table created or verified');

        console.log('=== Step 4: Creating bu_plan_tasks table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS bu_plan_tasks (
                id SERIAL PRIMARY KEY,
                plan_id INT NOT NULL REFERENCES bu_plans(id) ON DELETE CASCADE,
                task_code VARCHAR(50) NOT NULL,
                season_stage VARCHAR(100),
                related_products TEXT,
                category VARCHAR(255) NOT NULL,
                deadline DATE,
                completed_date DATE,
                assignee VARCHAR(150),
                status VARCHAR(50) DEFAULT 'Đang chạy',
                obstacles_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT uq_bu_plan_task_code UNIQUE (plan_id, task_code)
            );
            CREATE INDEX IF NOT EXISTS idx_bu_plan_tasks_plan ON bu_plan_tasks(plan_id);
            CREATE INDEX IF NOT EXISTS idx_bu_plan_tasks_deadline ON bu_plan_tasks(deadline);
        `);
        console.log('✅ bu_plan_tasks table created or verified');

        console.log('=== Step 5: Creating bu_plan_versions table ===');
        await client.query(`
            CREATE TABLE IF NOT EXISTS bu_plan_versions (
                id SERIAL PRIMARY KEY,
                plan_id INT NOT NULL REFERENCES bu_plans(id) ON DELETE CASCADE,
                version_label VARCHAR(50) NOT NULL,
                snapshot_data JSONB NOT NULL,
                created_by_name VARCHAR(150),
                approval_notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE INDEX IF NOT EXISTS idx_bu_plan_versions_plan ON bu_plan_versions(plan_id);
        `);
        console.log('✅ bu_plan_versions table created or verified');

        console.log('=== Step 6: Registering permissions ===');
        await client.query(`
            INSERT INTO permissions_master (module, action, label_vi, group_vi, sort_order)
            VALUES 
                ('bu_planning', 'view', 'Xem Kế Hoạch BU', 'Kế Hoạch & Dự Toán', 280),
                ('bu_planning', 'edit', 'Lập & Chỉnh Sửa Kế Hoạch BU', 'Kế Hoạch & Dự Toán', 281),
                ('bu_planning', 'approve', 'Phê Duyệt Kế Hoạch BU', 'Kế Hoạch & Dự Toán', 282)
            ON CONFLICT DO NOTHING;
        `);
        console.log('✅ Permissions registered');

        await client.query('COMMIT');
        console.log('🎉 BU Planning Studio Schema Migration finished successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err.message);
        throw err;
    } finally {
        client.release();
        await db.pool.end();
    }
}

if (require.main === module) {
    migrate()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = migrate;
