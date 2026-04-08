/**
 * Sync ALL messages từ Facebook API vào DB cho conversations hiện có
 * Kéo cả customer + page messages, tránh trùng lặp
 */
const db = require('../db');
const axios = require('axios');

async function getPageToken() {
    const res = await db.query("SELECT value FROM settings WHERE key = 'meta_page_access_token'");
    const token = res.rows[0]?.value;
    if (!token) return { token: null, pageId: null };
    
    // Resolve page ID from System User token (same logic as facebookService.js)
    try {
        const accountsRes = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`);
        if (accountsRes.data?.data?.length > 0) {
            const page = accountsRes.data.data[0];
            console.log(`Resolved Page: ${page.name} (${page.id})`);
            return { token: page.access_token, pageId: page.id };
        }
    } catch (err) {
        console.log('Could not resolve page accounts, trying token directly');
    }
    
    // Fallback
    return { token, pageId: null };
}

async function syncAllMessages() {
    console.log('=== SYNC TẤT CẢ TIN NHẮN TỪ FACEBOOK ===');
    
    const { token, pageId } = await getPageToken();
    if (!token || !pageId) {
        console.error('Không tìm thấy Page Token hoặc Page ID');
        process.exit(1);
    }
    
    // Lấy tất cả conversations có external_id (là PSID)
    const convResult = await db.query(`
        SELECT c.id, c.external_id, c.lead_id, l.name as lead_name
        FROM conversations c
        LEFT JOIN leads l ON c.lead_id = l.id
        WHERE c.external_id IS NOT NULL
        AND c.source = 'messenger'
        AND l.created_at >= '2026-04-01'
        ORDER BY c.updated_at DESC
    `);
    
    console.log(`Found ${convResult.rows.length} conversations to sync`);
    
    let totalNew = 0;
    let totalPageMsgs = 0;
    let errors = 0;
    
    for (const conv of convResult.rows) {
        try {
            // Kéo 10 tin nhắn gần nhất từ Facebook
            const endpoint = `https://graph.facebook.com/v25.0/${pageId}/conversations?fields=messages.limit(10){message,from,created_time}&user_id=${conv.external_id}&access_token=${token}`;
            const res = await axios.get(endpoint);
            
            if (!res.data?.data?.[0]?.messages?.data) continue;
            
            const fbMessages = res.data.data[0].messages.data;
            
            // Check existing messages in DB for this conversation
            const existingResult = await db.query(
                'SELECT content FROM messages WHERE conversation_id = $1',
                [conv.id]
            );
            const existingContents = new Set(existingResult.rows.map(r => r.content));
            
            let newCount = 0;
            let pageCount = 0;
            
            // Lưu tin nhắn mới (ngược lại vì FB API trả newest first)
            for (const msg of fbMessages.reverse()) {
                if (!msg.message || msg.message.trim() === '') continue;
                
                // Skip nếu đã có trong DB
                if (existingContents.has(msg.message)) continue;
                
                const senderType = (msg.from && msg.from.id !== pageId) ? 'customer' : 'page';
                const createdAt = msg.created_time || new Date().toISOString();
                
                await db.query(
                    'INSERT INTO messages (conversation_id, sender_type, content, created_at) VALUES ($1, $2, $3, $4)',
                    [conv.id, senderType, msg.message, createdAt]
                );
                
                newCount++;
                if (senderType === 'page') pageCount++;
            }
            
            if (newCount > 0) {
                console.log(`  ✅ ${conv.lead_name || conv.external_id}: +${newCount} tin (${pageCount} từ page)`);
                totalNew += newCount;
                totalPageMsgs += pageCount;
            }
            
            // Rate limiting - chờ 200ms giữa mỗi request
            await new Promise(r => setTimeout(r, 200));
            
        } catch (err) {
            if (err.response?.status === 400 || err.response?.data?.error?.code === 100) {
                // Conversation not found or user not accessible - skip
            } else {
                console.error(`  ❌ ${conv.lead_name}: ${err.message}`);
                errors++;
            }
        }
    }
    
    console.log('\n=== KẾT QUẢ ===');
    console.log(`✅ Tin nhắn mới: ${totalNew}`);
    console.log(`📤 Tin nhắn page (fanpage): ${totalPageMsgs}`);
    console.log(`❌ Lỗi: ${errors}`);
    
    // Now re-run BU classification with new messages
    console.log('\n=== CHẠY LẠI BACKFILL BU VỚI TIN NHẮN MỚI ===');
    
    const busResult = await db.query(
        "SELECT id, label, countries, keywords FROM business_units WHERE is_active = true ORDER BY sort_order ASC"
    );
    
    const normalize = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
    
    const buKeywordMap = busResult.rows.map(bu => ({
        id: bu.id,
        label: bu.label,
        normalizedKeywords: [...(bu.countries || []), ...(bu.keywords || [])]
            .filter(k => k && k.trim().length >= 2)
            .map(k => ({ original: k, normalized: normalize(k) }))
    }));
    
    const leadsResult = await db.query(`
        SELECT l.id, l.name, l.consultation_note
        FROM leads l
        WHERE l.created_at >= '2026-04-01'
        AND (l.bu_group IS NULL OR l.bu_group = '')
    `);
    
    let buUpdated = 0;
    
    for (const lead of leadsResult.rows) {
        const msgsResult = await db.query(`
            SELECT m.content FROM messages m 
            JOIN conversations conv ON m.conversation_id = conv.id 
            WHERE conv.lead_id = $1
            ORDER BY m.created_at ASC
        `, [lead.id]);
        
        const allText = (lead.consultation_note || '') + ' ' + msgsResult.rows.map(m => m.content || '').join(' ');
        if (allText.trim().length < 2) continue;
        
        const normalizedText = normalize(allText);
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
            buUpdated++;
        }
    }
    
    console.log(`\n✅ BU updated: ${buUpdated} leads`);
    process.exit(0);
}

syncAllMessages().catch(err => { console.error('FATAL:', err); process.exit(1); });
