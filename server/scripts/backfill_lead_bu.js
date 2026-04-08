/**
 * Backfill BU cho Leads từ 1/4/2026 chưa có bu_group
 * V3: Lấy TẤT CẢ messages (cả customer + page), ưu tiên tin nhắn quanh SĐT
 */
const db = require('../db');

const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');

async function backfill() {
    console.log('=== BACKFILL LEAD BU V3 (Từ 1/4/2026) ===');
    console.log('📌 Bao gồm tin nhắn từ Fanpage (page) + Khách (customer)');
    
    // 1. Lấy tất cả BU + keywords
    const busResult = await db.query(
        "SELECT id, label, countries, keywords FROM business_units WHERE is_active = true ORDER BY sort_order ASC"
    );
    const buList = busResult.rows;
    console.log(`Loaded ${buList.length} BU configs`);

    // Pre-build keyword map
    const buKeywordMap = buList.map(bu => ({
        id: bu.id,
        label: bu.label,
        normalizedKeywords: [...(bu.countries || []), ...(bu.keywords || [])]
            .filter(k => k && k.trim().length >= 2)
            .map(k => ({ original: k, normalized: normalize(k) }))
    }));
    
    // 2. Lấy leads từ 1/4 chưa có BU
    const leadsResult = await db.query(`
        SELECT l.id, l.name, l.consultation_note, l.tour_id, l.phone,
               tt.name as tour_name, tt.destination as tour_destination, tt.bu_group as tour_bu
        FROM leads l
        LEFT JOIN tour_templates tt ON l.tour_id = tt.id
        WHERE l.created_at >= '2026-04-01'
        AND (l.bu_group IS NULL OR l.bu_group = '')
        ORDER BY l.created_at DESC
    `);
    
    console.log(`Found ${leadsResult.rows.length} leads without BU since April 1`);
    
    let updated = 0;
    let skipped = 0;
    const unmatched = [];
    
    for (const lead of leadsResult.rows) {
        // Strategy 1: Nếu lead có tour_id và tour đó có bu_group → dùng luôn
        if (lead.tour_bu) {
            await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [lead.tour_bu, lead.id]);
            console.log(`  ✅ Lead #${lead.id} (${lead.name}) → ${lead.tour_bu} (từ Tour: ${lead.tour_name})`);
            updated++;
            continue;
        }
        
        // Strategy 2: Lấy TẤT CẢ messages (customer + page) theo thứ tự thời gian
        const msgsResult = await db.query(`
            SELECT m.content, m.sender_type, m.created_at
            FROM messages m 
            JOIN conversations conv ON m.conversation_id = conv.id 
            WHERE conv.lead_id = $1
            ORDER BY m.created_at ASC
        `, [lead.id]);
        
        let textToSearch = lead.consultation_note || '';
        
        if (msgsResult.rows.length > 0) {
            // Tìm vị trí tin nhắn có SĐT
            const phoneRegex = /(?:\+84|0)(?:[\s\.\-]*[3|5|7|8|9])(?:[\s\.\-]*[0-9]){8}\b/;
            let phoneIdx = -1;
            
            for (let i = 0; i < msgsResult.rows.length; i++) {
                if (msgsResult.rows[i].content && phoneRegex.test(msgsResult.rows[i].content)) {
                    phoneIdx = i;
                    break;
                }
            }
            
            if (phoneIdx >= 0) {
                // Lấy từ tin nhắn có SĐT + 2 tin tiếp theo (cả page lẫn customer)
                const contextMsgs = msgsResult.rows.slice(phoneIdx, phoneIdx + 3);
                const contextText = contextMsgs.map(m => m.content).join(' ');
                textToSearch += ' ' + contextText;
                
                // Cũng lấy 2 tin nhắn trước SĐT (nhân viên có thể hỏi "anh/chị quan tâm tour nào?")
                const beforeMsgs = msgsResult.rows.slice(Math.max(0, phoneIdx - 2), phoneIdx);
                const beforeText = beforeMsgs.map(m => m.content).join(' ');
                textToSearch += ' ' + beforeText;
            }
            
            // Gộp TẤT CẢ messages (cả page replies) làm fallback
            const allText = msgsResult.rows.map(m => m.content || '').join(' ');
            textToSearch += ' ' + allText;
        }
        
        // Thêm tour_name + destination
        textToSearch += ' ' + (lead.tour_name || '') + ' ' + (lead.tour_destination || '');
        
        if (textToSearch.trim().length < 2) {
            unmatched.push({ id: lead.id, name: lead.name, reason: 'Không có nội dung' });
            skipped++;
            continue;
        }
        
        const normalizedText = normalize(textToSearch);
        let matchedBU = null;
        let matchedKW = null;
        
        for (const bu of buKeywordMap) {
            for (const kw of bu.normalizedKeywords) {
                if (normalizedText.includes(kw.normalized)) {
                    matchedBU = bu.id;
                    matchedKW = kw.original;
                    break;
                }
            }
            if (matchedBU) break;
        }
        
        if (matchedBU) {
            await db.query('UPDATE leads SET bu_group = $1 WHERE id = $2', [matchedBU, lead.id]);
            console.log(`  ✅ Lead #${lead.id} (${lead.name}) → ${matchedBU} (keyword: "${matchedKW}")`);
            updated++;
        } else {
            const preview = textToSearch.replace(/\s+/g, ' ').substring(0, 100);
            unmatched.push({ id: lead.id, name: lead.name, reason: preview });
            skipped++;
        }
    }
    
    console.log('\n=== KẾT QUẢ ===');
    console.log(`✅ Đã gán BU: ${updated} leads`);
    console.log(`⚠️  Không match: ${skipped} leads`);
    
    if (unmatched.length > 0) {
        console.log('\n--- LEADS KHÔNG MATCH (cần chọn tay) ---');
        unmatched.forEach(u => {
            console.log(`  #${u.id}: ${u.name} | ${u.reason}`);
        });
    }
    
    process.exit(0);
}

backfill().catch(err => { console.error('FATAL:', err); process.exit(1); });
