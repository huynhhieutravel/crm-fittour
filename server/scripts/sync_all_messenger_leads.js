const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const getSetting = async (key) => {
    const res = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows.length > 0 ? res.rows[0].value : null;
};

const getPageToken = async () => {
    const dbToken = await getSetting('meta_page_access_token');
    const token = dbToken || process.env.FB_PAGE_TOKEN;
    try {
        const accountsRes = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`);
        if (accountsRes.data?.data?.length > 0) {
            const page = accountsRes.data.data[0];
            return { token: page.access_token, pageId: page.id };
        }
        
        // System User token often returns empty accounts, try /me instead
        const meRes = await axios.get(`https://graph.facebook.com/v25.0/me?access_token=${token}`);
        if (meRes.data && meRes.data.id) {
            return { token, pageId: meRes.data.id };
        }
    } catch (err) {
        console.log('API Error in getPageToken:', err.response ? err.response.data : err.message);
    }
    return { token, pageId: null };
};

const syncAll = async () => {
    try {
        const { token, pageId } = await getPageToken();
        if (!token) { console.log('❌ Lỗi: Không tìm thấy Facebook Token - process.env.FB_PAGE_TOKEN:', process.env.FB_PAGE_TOKEN); return; }
        if (!pageId) { console.log('❌ Lỗi: Token không phải quyền Page. token:', token.substring(0, 15)+ '...'); return; }
        
        // MỐC THỜI GIAN THEO MÚI GIỜ VIỆT NAM (+07:00)
        // 00:00 Ngày 1/4/2026
        const START_DATE_MS = new Date('2026-04-01T00:00:00+07:00').getTime();
        // 23:59 Ngày 1/4/2026
        const END_DATE_MS = new Date('2026-04-01T23:59:59+07:00').getTime();

        console.log(`🚀 Bắt đầu quét Lịch sử tin nhắn: Hôm nay (1/4/2026) ...`);
        
        let url = `https://graph.facebook.com/v25.0/${pageId}/conversations?fields=updated_time,participants{id,name},messages.limit(20){message,from}&limit=50&access_token=${token}`;
        let totalCreated = 0;
        let pageCount = 1;
        let breakLoop = false;

        while (url && !breakLoop) {
            console.log(`Đang quét trang dữ liệu thứ ${pageCount}...`);
            const res = await axios.get(url);
            
            if (!res.data || !res.data.data || res.data.data.length === 0) {
                break;
            }

            for (const conv of res.data.data) {
                const updatedTimeMs = new Date(conv.updated_time).getTime();

                // NẾU GẶP TIN NHẮN TRƯỚC NGÀY 1/4/2026 -> THOÁT TOÀN BỘ (DỪNG QUÉT NHANH)
                if (updatedTimeMs < START_DATE_MS) {
                    console.log(`⛔️ Đã lùi về thời gian xa hơn 1/4/2026 (${conv.updated_time}). TỰ ĐỘNG DỪNG (BREAK)!`);
                    breakLoop = true;
                    break;
                }

                // NẾU GẶP TIN NHẮN TRONG TƯƠNG LAI -> BỎ QUA NGƯỜI NÀY
                if (updatedTimeMs > END_DATE_MS) {
                    continue;
                }

                // Hợp lệ: Chỉ nằm trong tháng 3
                const participants = conv.participants?.data || [];
                const user = participants.find(p => p.id !== pageId);
                if (!user || user.id === pageId) continue;

                const psid = user.id;
                const existingLead = await pool.query('SELECT id FROM leads WHERE facebook_psid = $1', [psid]);
                
                if (existingLead.rows.length === 0) {
                    const messagesList = conv.messages?.data || [];
                    const userMsgObj = messagesList.find(m => m.from && m.from.id === psid);
                    const msgContent = userMsgObj && userMsgObj.message ? userMsgObj.message : '(Gửi tập tin đính kèm / Nhãn dán / Hình ảnh)';
                    const firstMessageNote = userMsgObj ? `Khách nhắn ngày 1/4: "${msgContent}"` : null;

                    const leadResult = await pool.query(
                        'INSERT INTO leads (name, source, status, facebook_psid, consultation_note, last_contacted_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                        [user.name || 'Khách Facebook (1/4)', 'Messenger', 'Mới', psid, firstMessageNote, new Date(conv.updated_time)]
                    );

                    if (userMsgObj) {
                        const newConv = await pool.query(
                            'INSERT INTO conversations (source, external_id, lead_id, last_message, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                            ['messenger', psid, leadResult.rows[0].id, msgContent, new Date(conv.updated_time)]
                        );
                        await pool.query(
                            'INSERT INTO messages (conversation_id, sender_type, content, created_at) VALUES ($1, $2, $3, $4)',
                            [newConv.rows[0].id, 'customer', msgContent, new Date(conv.updated_time)]
                        );
                    }
                    totalCreated++;
                    process.stdout.write('+');
                }
            }
            console.log('');
            
            if (res.data.paging && res.data.paging.next && !breakLoop) {
                url = res.data.paging.next;
                pageCount++;
            } else {
                url = null;
            }
        }
        console.log(`\n✅ HOÀN TẤT Ngày 1/4! Đã khôi phục thành công ${totalCreated} khách hàng cũ từ tin nhắn!`);
    } catch (e) { 
        console.log('\n❌ Có lỗi xảy ra: ', e.message); 
    } finally {
        pool.end();
    }
};

syncAll();
