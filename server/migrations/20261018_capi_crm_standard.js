/**
 * Migration: Meta Conversions API CRM Standard
 * 
 * Khởi tạo cấu hình an toàn cho feature flag meta_capi_crm_enabled (mặc định 'false')
 */

const db = require('../db');

async function up() {
    console.log('[MIGRATION CAPI CRM] Bắt đầu khởi tạo cấu hình CRM Standard CAPI...');

    const dbInfo = await db.query('SELECT current_database() as db_name, current_user as db_user;');
    console.log(`[MIGRATION CAPI CRM] Database kết nối: "${dbInfo.rows[0]?.db_name}" (User: "${dbInfo.rows[0]?.db_user}")`);

    await db.query(`
        INSERT INTO settings (key, value, description)
        VALUES 
            ('meta_capi_crm_enabled', 'false', 'Bật Meta Conversions API cho CRM Standard (Mặc định tắt)'),
            ('meta_capi_crm_canary_mode', 'disabled', 'Chế độ Canary CRM: disabled (tắt), allowlist (chỉ gửi ID cho phép), all (toàn bộ)'),
            ('meta_capi_crm_canary_allowlist', '', 'Danh sách Lead ID hoặc Booking ID được phép thử nghiệm canary (phân cách bằng dấu phẩy)'),
            ('meta_capi_crm_canary_daily_limit', '20', 'Giới hạn tối đa số lượng sự kiện CRM được gửi mỗi ngày trong giai đoạn canary')
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
