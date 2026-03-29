const db = require('./db');

async function migrate() {
    console.log('--- STARTING CASCADE DELETE MIGRATION ---');
    try {
        await db.query(`
            ALTER TABLE lead_notes DROP CONSTRAINT IF EXISTS lead_notes_lead_id_fkey;
            ALTER TABLE lead_notes ADD CONSTRAINT lead_notes_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
            
            ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_lead_id_fkey;
            ALTER TABLE conversations ADD CONSTRAINT conversations_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
        `);
        console.log('✅ Cập nhật ON DELETE CASCADE thành công!');
    } catch (err) {
        console.error('❌ Lỗi:', err);
    } finally {
        process.exit();
    }
}

migrate();
