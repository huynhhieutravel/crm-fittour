require('dotenv').config({ path: '../.env' }); // WAIT, path must be .env!
const db = require('../db');
const facebookService = require('../services/facebookService');

async function fixMissingBUs() {
    console.log('[Retro BU Fix] Bắt đầu quét các Lead đang bị thiếu BU trên DATABASE THẬT...');
    
    try {
        const missingBULeads = await db.query(`
            SELECT l.id, l.name, c.id as conv_id 
            FROM leads l
            JOIN conversations c ON c.lead_id = l.id
            WHERE l.bu_group IS NULL AND l.status != 'Thất bại'
        `);
        
        console.log(`[Retro BU Fix] Tìm thấy ${missingBULeads.rows.length} Lead chưa có BU.`);
        
        let fixedCount = 0;
        
        for (const lead of missingBULeads.rows) {
            const msgsRes = await db.query('SELECT content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC', [lead.conv_id]);
            const allText = msgsRes.rows.map(m => m.content || '').join(' ');
            
            const autoBU = await facebookService.classifyBUFromMessage(allText);
            
            if (autoBU) {
                await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [autoBU, lead.id]);
                console.log(`[Retro BU Fix] ✅ Thành công: Đã map Lead "${lead.name}" (ID: ${lead.id}) vào BU: ${autoBU}`);
                fixedCount++;
            }
        }
        
        console.log(`[Retro BU Fix] Hoàn tất! Đã map thành công ${fixedCount} trên tổng số ${missingBULeads.rows.length} Lead bị thiếu.`);
        
    } catch (err) {
        console.error('[Retro BU Fix] Lỗi:', err);
    } finally {
        process.exit(0);
    }
}
fixMissingBUs();
