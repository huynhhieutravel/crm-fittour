const db = require('../db');

async function migrate() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS hotel_notes (
                id SERIAL PRIMARY KEY,
                hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
                content TEXT NOT NULL,
                created_by INT REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Migration successful: hotel_notes created");
        process.exit(0);
    } catch(err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
}
migrate();
