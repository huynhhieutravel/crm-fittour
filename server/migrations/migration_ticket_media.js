const db = require('../db');

async function migrate() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS ticket_media (
                id SERIAL PRIMARY KEY,
                ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
                file_url VARCHAR(255) NOT NULL,
                file_name VARCHAR(255) NOT NULL,
                file_type VARCHAR(50),
                file_size INT,
                sort_order INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Created table: ticket_media');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}
migrate();
