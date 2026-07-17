const db = require('./db/index');

async function migrateRagDocuments() {
    console.log("🚀 Starting Rag Documents Migration...");
    
    try {
        await db.query('BEGIN');

        console.log("Creating rag_documents table...");
        await db.query(`
            CREATE TABLE IF NOT EXISTS rag_documents (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                
                -- Phục vụ AI phân loại ngữ cảnh
                category VARCHAR(100),
                
                -- Phục vụ Auth (Bắt đăng nhập hay không)
                visibility VARCHAR(50) DEFAULT 'private',
                
                -- Lưu trữ Kép (Dual-Content)
                content_text TEXT,           
                attachment_url TEXT,         
                
                -- Tùy chọn Ưu tiên hiển thị trên UI cho nhân viên
                display_priority VARCHAR(20) DEFAULT 'text',
                
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await db.query('COMMIT');
        console.log("✅ Migration completed successfully!");

    } catch (e) {
        await db.query('ROLLBACK');
        console.error("❌ Migration failed! Rolled back changes.", e);
    } finally {
        process.exit();
    }
}

migrateRagDocuments();
