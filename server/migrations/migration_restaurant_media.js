const db = require('../db');

async function up() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS restaurant_media (
            id SERIAL PRIMARY KEY,
            restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
            file_url TEXT NOT NULL,
            file_name VARCHAR(255) NOT NULL,
            file_type VARCHAR(50) NOT NULL DEFAULT 'image',
            file_size INTEGER DEFAULT 0,
            sort_order INTEGER DEFAULT 0,
            caption VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_restaurant_media_restaurant_id ON restaurant_media(restaurant_id);
    `);
    console.log('✅ Created table: restaurant_media');
}

up().then(() => process.exit(0)).catch(err => { console.error('❌ Migration failed:', err); process.exit(1); });
