const db = require('./index');

async function run() {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('Ensuring visas table exists...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS visas (
                id SERIAL PRIMARY KEY,
                code VARCHAR(100),
                name VARCHAR(200),
                customer_id INTEGER,
                customer_name VARCHAR(200),
                customer_phone VARCHAR(50),
                customer_type VARCHAR(50),
                status VARCHAR(50),
                market VARCHAR(50),
                visa_type VARCHAR(50),
                receipt_date DATE,
                result_date DATE,
                fingerprint_date DATE,
                stamp_date DATE,
                return_date DATE,
                quantity INTEGER,
                service_package VARCHAR(200),
                is_urgent BOOLEAN,
                is_evisa BOOLEAN,
                exchange_rate NUMERIC,
                booking_code VARCHAR(100),
                branch VARCHAR(100),
                notes TEXT,
                finance_data JSONB,
                created_by INTEGER,
                handled_by INTEGER,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Ensuring visa_members table exists...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS visa_members (
                id SERIAL PRIMARY KEY,
                visa_id INTEGER,
                fullname VARCHAR(200),
                passport_number VARCHAR(100),
                phone VARCHAR(50),
                dob DATE,
                age_type VARCHAR(50),
                checklist_data JSONB,
                evaluation_data JSONB
            );
        `);

        console.log('Creating visa_templates table...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS visa_templates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                visa_type VARCHAR(50),
                market VARCHAR(50),
                checklist_config JSONB DEFAULT '[]'::jsonb,
                is_active BOOLEAN DEFAULT true,
                created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log('Adding visa_template_id to visas table...');
        await client.query(`
            ALTER TABLE visas ADD COLUMN IF NOT EXISTS visa_template_id INTEGER REFERENCES visa_templates(id) ON DELETE SET NULL;
        `);

        await client.query('COMMIT');
        console.log('Schema update successful!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating schema:', err);
    } finally {
        client.release();
        process.exit();
    }
}

run();
