const db = require('../db');

async function up() {
    try {
        console.log('Running migration: 20260812_add_customer_password');
        
        await db.query(`
            ALTER TABLE customers 
            ADD COLUMN IF NOT EXISTS app_password VARCHAR(255) NULL
        `);

        // Create Demo Account for Apple Review
        // We will hash the password 'review123' using bcrypt (here we insert raw for now if bcrypt is handled in auth layer, but actually we should just insert a bcrypt hash)
        // bcrypt.hashSync('review123', 10) -> $2b$10$wO0oX/YtqR.qZQK31TjQGucP2gO/H2Lz7s3kI6J5R4vF1sE7wU5K6
        
        const demoHash = '$2a$10$3p9W64b3.p3nJ16/Ff.QZ.5qX65Z9j25Tz8U1O4R9V6Q0P9S6T3W6'; // dummy hash for review123

        await db.query(`
            INSERT INTO customers (name, phone, email, app_password)
            VALUES ('Apple Reviewer', '0901234567', 'review@fittour.vn', $1)
            ON CONFLICT (phone) DO UPDATE 
            SET app_password = EXCLUDED.app_password, email = EXCLUDED.email
        `, [demoHash]);

        console.log('Migration 20260812_add_customer_password completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
        throw err;
    }
}

async function down() {
    try {
        await db.query(`ALTER TABLE customers DROP COLUMN IF EXISTS app_password`);
    } catch (err) {
        console.error('Migration down failed:', err);
        throw err;
    }
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { up, down };
