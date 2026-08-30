const pool = require('../db');

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS visa_form_templates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                fields JSONB NOT NULL DEFAULT '[]',
                is_active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE visa_form_templates ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
            ALTER TABLE visas ADD COLUMN IF NOT EXISTS form_template_id INTEGER REFERENCES visa_form_templates(id) ON DELETE SET NULL;
        `);
        console.log('Migration successful: Updated visa_form_templates & visas tables');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
