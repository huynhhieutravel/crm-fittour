/**
 * Migration: Meta Conversions API for Business Messaging v3
 * 
 * - Thêm facebook_page_id vào bảng leads và conversations
 * - Thêm is_sales_qualified, sales_qualified_at vào bảng leads
 * - Tạo bảng outbox meta_capi_events với ràng buộc duy nhất (event_name, business_entity_type, business_entity_id)
 * - Khởi tạo các cấu hình feature flag an toàn trong bảng settings
 */

const db = require('../db');

async function up() {
    console.log('[MIGRATION CAPI v3] Bắt đầu nâng cấp CAPI Business Messaging v3...');

    // 1. Cột facebook_page_id cho bảng leads (Hỗ trợ Đa Fanpage)
    await db.query(`
        ALTER TABLE leads 
        ADD COLUMN IF NOT EXISTS facebook_page_id VARCHAR(50);
    `);
    console.log('✅ Đã thêm cột facebook_page_id vào bảng leads');

    // 2. Cột tiêu chí chất lượng Sales Qualified cho bảng leads
    await db.query(`
        ALTER TABLE leads 
        ADD COLUMN IF NOT EXISTS is_sales_qualified BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS sales_qualified_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log('✅ Đã thêm cột is_sales_qualified, sales_qualified_at vào bảng leads');

    // 3. Cột facebook_page_id cho bảng conversations
    await db.query(`
        ALTER TABLE conversations 
        ADD COLUMN IF NOT EXISTS facebook_page_id VARCHAR(50);
    `);
    console.log('✅ Đã thêm cột facebook_page_id vào bảng conversations');

    // 4. Bảng outbox meta_capi_events với cơ chế khử trùng CRM-side và worker lock
    await db.query(`
        CREATE TABLE IF NOT EXISTS meta_capi_events (
            id SERIAL PRIMARY KEY,
            event_id VARCHAR(120) NOT NULL UNIQUE,
            event_name VARCHAR(50) NOT NULL,
            action_source VARCHAR(50) NOT NULL DEFAULT 'business_messaging',
            messaging_channel VARCHAR(50) DEFAULT 'messenger',
            business_entity_type VARCHAR(50) NOT NULL,
            business_entity_id INTEGER NOT NULL,
            idempotency_key VARCHAR(120) NOT NULL,
            page_id VARCHAR(50),
            psid_hash VARCHAR(64),
            payload JSONB NOT NULL,
            status VARCHAR(30) DEFAULT 'PENDING',
            attempts INTEGER DEFAULT 0,
            max_attempts INTEGER DEFAULT 5,
            next_retry_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            locked_at TIMESTAMP WITH TIME ZONE,
            locked_by VARCHAR(100),
            sent_at TIMESTAMP WITH TIME ZONE,
            fbtrace_id VARCHAR(100),
            error_message TEXT,
            error_response JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            CONSTRAINT uq_capi_event_entity UNIQUE (event_name, business_entity_type, business_entity_id)
        );
    `);
    console.log('✅ Đã tạo bảng outbox meta_capi_events với UNIQUE(event_name, business_entity_type, business_entity_id)');

    // 5. Index cho Worker polling tối ưu
    await db.query(`
        CREATE INDEX IF NOT EXISTS idx_meta_capi_events_worker 
        ON meta_capi_events (status, next_retry_at) 
        WHERE status IN ('PENDING', 'FAILED_RETRYABLE');
    `);
    console.log('✅ Đã tạo index tối ưu cho Worker outbox');

    // 6. Cấu hình Feature Flag trong bảng settings (MẶC ĐỊNH FALSE ĐỂ ĐẢM BẢO AN TOÀN TUYỆT ĐỐI)
    await db.query(`
        INSERT INTO settings (key, value, description)
        VALUES 
            ('meta_capi_business_messaging_v3_enabled', 'false', 'Bật Conversions API for Business Messaging v3 (Mặc định tắt)'),
            ('meta_capi_purchase_value_source', 'contract_value', 'Chính sách tính giá trị Purchase: contract_value (Tổng giá trị HĐ) hoặc paid_value (Tiền thực thu)')
        ON CONFLICT (key) DO NOTHING;
    `);
    console.log('✅ Đã khởi tạo feature flag an toàn trong bảng settings');

    console.log('[MIGRATION CAPI v3] Hoàn tất nâng cấp!');
}

async function down() {
    console.log('[ROLLBACK CAPI v3] Bắt đầu rollback migration CAPI v3...');

    await db.query(`DROP TABLE IF EXISTS meta_capi_events CASCADE;`);
    console.log('↩️ Đã xoá bảng meta_capi_events');

    await db.query(`
        ALTER TABLE leads 
        DROP COLUMN IF EXISTS facebook_page_id,
        DROP COLUMN IF EXISTS is_sales_qualified,
        DROP COLUMN IF EXISTS sales_qualified_at;
    `);
    console.log('↩️ Đã gỡ các cột mới khỏi bảng leads');

    await db.query(`
        ALTER TABLE conversations 
        DROP COLUMN IF EXISTS facebook_page_id;
    `);
    console.log('↩️ Đã gỡ cột facebook_page_id khỏi bảng conversations');

    await db.query(`
        DELETE FROM settings 
        WHERE key IN ('meta_capi_business_messaging_v3_enabled', 'meta_capi_purchase_value_source');
    `);
    console.log('↩️ Đã xoá các key settings của CAPI v3');

    console.log('[ROLLBACK CAPI v3] Hoàn tất rollback!');
}

if (require.main === module) {
    const action = process.argv[2] === 'down' ? down : up;
    action()
        .then(() => process.exit(0))
        .catch(err => {
            console.error('Migration failed:', err);
            process.exit(1);
        });
}

module.exports = { up, down };
