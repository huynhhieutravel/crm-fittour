require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function runMigration() {
    try {
        console.log('Connecting to database...');
        
        await pool.query(`
            CREATE TABLE IF NOT EXISTS dispatch_weekly_responsibilities (
                year INT NOT NULL,
                week_number INT NOT NULL,
                bu_group VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (year, week_number)
            );
        `);
        console.log('Table dispatch_weekly_responsibilities created or already exists.');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS dispatch_schedules (
                id SERIAL PRIMARY KEY,
                date DATE NOT NULL,
                shift_type VARCHAR(50) NOT NULL,
                bu_group VARCHAR(255),
                user_id INT REFERENCES users(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE (date, shift_type)
            );
        `);
        console.log('Table dispatch_schedules created or already exists.');

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

runMigration();
