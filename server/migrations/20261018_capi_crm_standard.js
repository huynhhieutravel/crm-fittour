/**
 * Migration: Meta Conversions API CRM Standard
 * 
 * Khởi tạo cấu hình an toàn cho feature flag meta_capi_crm_enabled (mặc định 'false')
 */

const db = require('../db');

async function up() {
    console.log('[MIGRATION CAPI CRM] Bắt đầu khởi tạo cấu hình CRM Standard CAPI...');

    await db.query(`
        INSERT INTO settings (key, value, description)
        VALUES 
            ('meta_capi_crm_enabled', 'false', 'Bật Meta Conversions API cho CRM Standard (Mặc định tắt)')
        ON CONFLICT (key) DO NOTHING;
    `);

    console.log('✅ Đã khởi tạo key meta_capi_crm_enabled trong bảng settings');
    console.log('[MIGRATION CAPI CRM] Hoàn tất nâng cấp!');
}

async function down() {
    console.log('[ROLLBACK CAPI CRM] Bắt đầu rollback migration CAPI CRM...');
    await db.query(`DELETE FROM settings WHERE key = 'meta_capi_crm_enabled';`);
    console.log('↩️ Đã xoá key meta_capi_crm_enabled khỏi settings');
}

if (require.main === module) {
    up().then(() => process.exit(0)).catch(err => {
        console.error('Migration error:', err);
        process.exit(1);
    });
}

module.exports = { up, down };
