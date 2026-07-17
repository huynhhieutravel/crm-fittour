const db = require('../db/index');

async function up() {
    console.log("🚀 Starting add target_bus Migration...");
    try {
        await db.query('BEGIN');
        
        console.log("Thêm cột target_bus vào bảng rag_documents...");
        await db.query(`
            ALTER TABLE rag_documents 
            ADD COLUMN IF NOT EXISTS target_bus text[] DEFAULT '{}';
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

up();
