const db = require('./db/index');

async function migrate() {
    try {
        console.log('Adding Visa permissions to permissions_master...');
        await db.query(`
            INSERT INTO permissions_master (module, action, description) VALUES
            ('visas', 'view_all', 'Xem tất cả Visa'),
            ('visas', 'view_own', 'Xem Visa cá nhân'),
            ('visas', 'create', 'Tạo Visa mới'),
            ('visas', 'edit', 'Chỉnh sửa Visa'),
            ('visas', 'delete', 'Xóa Visa')
            ON CONFLICT DO NOTHING;
        `);
        console.log('Migration successful.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
}

migrate();
