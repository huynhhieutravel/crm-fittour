const db = require('./db/index');

async function migrateAddWebsiteUrl() {
    console.log("🚀 Starting Rag Documents Schema Update...");
    
    try {
        await db.query('BEGIN');

        console.log("Adding website_url column to rag_documents table...");
        await db.query(`
            ALTER TABLE rag_documents 
            ADD COLUMN IF NOT EXISTS website_url TEXT;
        `);

        await db.query('COMMIT');
        console.log("✅ Schema Update completed successfully!");

    } catch (e) {
        await db.query('ROLLBACK');
        console.error("❌ Schema Update failed! Rolled back changes.", e);
    } finally {
        process.exit();
    }
}

migrateAddWebsiteUrl();
