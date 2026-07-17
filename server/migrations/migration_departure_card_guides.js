const db = require('../db');
const { logActivity } = require('../utils/logger');

async function runMigration() {
    try {
        console.log('Bắt đầu chạy migration add_departure_card_guides...');
        
        await db.query(`
            CREATE TABLE IF NOT EXISTS departure_card_guides (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                phone VARCHAR(255),
                profile_link TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Đã tạo bảng departure_card_guides thành công.');

    } catch (err) {
        console.error('Lỗi khi chạy migration:', err);
    }
}

runMigration();
