const db = require('../db');

async function migrate() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // ═══ 1. CREATE b2b_companies ═══
        console.log('Creating b2b_companies table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS b2b_companies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                tax_id VARCHAR(50),
                industry VARCHAR(100),
                phone VARCHAR(50),
                email VARCHAR(100),
                address TEXT,
                founded_date DATE,
                website VARCHAR(255),
                assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ═══ 2. ALTER group_leaders — add company link ═══
        console.log('Adding columns to group_leaders...');
        await client.query(`ALTER TABLE group_leaders ADD COLUMN IF NOT EXISTS company_id INT REFERENCES b2b_companies(id) ON DELETE SET NULL`);
        await client.query(`ALTER TABLE group_leaders ADD COLUMN IF NOT EXISTS position VARCHAR(100)`);
        await client.query(`ALTER TABLE group_leaders ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false`);
        await client.query(`ALTER TABLE group_leaders ADD COLUMN IF NOT EXISTS contact_status VARCHAR(50) DEFAULT 'active'`);

        // ═══ 3. ALTER group_projects — add company link ═══
        console.log('Adding company_id to group_projects...');
        await client.query(`ALTER TABLE group_projects ADD COLUMN IF NOT EXISTS company_id INT REFERENCES b2b_companies(id) ON DELETE SET NULL`);

        // ═══ 4. CREATE b2b_company_events (care schedule linked to company) ═══
        console.log('Creating group_leader_events table (if not exists)...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS group_leader_events (
                id SERIAL PRIMARY KEY,
                group_leader_id INTEGER REFERENCES group_leaders(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                event_date TIMESTAMP NOT NULL,
                description TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        // Add company_id to events too
        await client.query(`ALTER TABLE group_leader_events ADD COLUMN IF NOT EXISTS company_id INT REFERENCES b2b_companies(id) ON DELETE SET NULL`);

        await client.query('COMMIT');
        console.log('\n✅ Migration completed!');
        console.log('   - b2b_companies table created');
        console.log('   - group_leaders: +company_id, +position, +is_primary, +contact_status');
        console.log('   - group_projects: +company_id');
        console.log('   - group_leader_events: +company_id');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
