require('dotenv').config();
const db = require('./db');
const { classifyBUFromMessage, classifyTourFromMessage } = require('./services/facebookService');

async function run() {
    const isApply = process.argv.includes('--apply');
    
    if (isApply) {
        console.log('--- CHẾ ĐỘ THỰC THI (APPLY MODE): ĐANG UPDATE DATABASE ---');
    } else {
        console.log('--- CHẾ ĐỘ XEM TRƯỚC (DRY RUN): KHÔNG SỬA DATABASE ---');
        console.log('--- (Thêm cờ --apply để cập nhật thật sự) ---\\n');
    }

    try {
        const query = `
            SELECT l.id, l.name, l.source, c.id as conversation_id
            FROM leads l
            LEFT JOIN conversations c ON c.lead_id = l.id
            WHERE (l.bu_group IS NULL OR l.bu_group = '')
              AND l.created_at >= NOW() - INTERVAL '7 days'
            ORDER BY l.created_at DESC
        `;
        const res = await db.query(query);
        const leads = res.rows;
        
        console.log(`Tìm thấy ${leads.length} Lead chưa phân BU trong 7 ngày qua.\\n`);
        
        let matchCount = 0;

        for (const lead of leads) {
            if (!lead.conversation_id) continue;
            
            // Get all messages from this conversation sent by the customer
            const msgQuery = await db.query(
                "SELECT content FROM messages WHERE conversation_id = $1 ORDER BY created_at ASC",
                [lead.conversation_id]
            );
            
            const allText = msgQuery.rows.map(m => m.content).join(' ');
            if (!allText.trim()) continue;
            
            // Run through classifier
            const autoBU = await classifyBUFromMessage(allText);
            const autoTour = await classifyTourFromMessage(allText);
            
            let finalBU = autoBU;
            let finalTourId = null;
            
            if (autoTour) {
                finalTourId = autoTour.tour_id;
                if (!finalBU && autoTour.bu_group) {
                    finalBU = autoTour.bu_group;
                }
            }
            
            if (finalBU) {
                matchCount++;
                console.log(`✅ Lead ID: ${lead.id} | Tên: ${lead.name}`);
                // console.log(`   Tin nhắn: "${allText.substring(0, 100)}..."`);
                console.log(`   👉 Sẽ phân vào: BU ${finalBU} ${finalTourId ? '(Tour ID: ' + finalTourId + ')' : ''}`);
                
                if (isApply) {
                    if (finalTourId) {
                        await db.query('UPDATE leads SET bu_group = $1, tour_id = $2 WHERE id = $3', [finalBU, finalTourId, lead.id]);
                        console.log(`   [ĐÃ UPDATE] Đã cập nhật BU và Tour vào DB.`);
                    } else {
                        await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [finalBU, lead.id]);
                        console.log(`   [ĐÃ UPDATE] Đã cập nhật BU vào DB.`);
                    }
                }
                console.log('');
            }
        }
        
        console.log(`--- TỔNG KẾT: Có ${matchCount}/${leads.length} Lead có thể cứu vãn được ---`);
    } catch (e) {
        console.error('Lỗi quét Lead:', e);
    }
    process.exit(0);
}

run();
