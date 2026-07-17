const db = require('../db');

async function runMigration() {
    try {
        console.log('Bắt đầu chạy migration add_columns_to_departure_card_guides...');
        
        await db.query(`
            ALTER TABLE departure_card_guides 
            ADD COLUMN IF NOT EXISTS avatar_url TEXT,
            ADD COLUMN IF NOT EXISTS description TEXT;
        `);
        console.log('Đã thêm avatar_url và description thành công.');

    } catch (err) {
        console.error('Lỗi khi chạy migration:', err);
    }
}

runMigration();
