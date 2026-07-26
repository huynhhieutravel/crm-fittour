const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fittour_crm',
  password: process.env.DB_PASSWORD || 'fittour@2024',
  port: process.env.DB_PORT || 5432,
});

async function runMigration() {
    try {
        console.log('--- Đang kiểm tra bảng message_templates ---');
        
        // 1. Thêm cột description
        console.log('Đang thêm cột description...');
        await pool.query(`
            ALTER TABLE message_templates 
            ADD COLUMN IF NOT EXISTS description TEXT;
        `);
        console.log('✅ Đã thêm cột description thành công.');

    } catch (error) {
        console.error('❌ Lỗi chạy migration:', error.message);
    } finally {
        await pool.end();
    }
}

runMigration();
