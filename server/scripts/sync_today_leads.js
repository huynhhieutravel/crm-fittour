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
        if (!token || !pageId) return;
        
        const START_DATE_MS = new Date('2026-04-02T00:00:00+07:00').getTime();
        const END_DATE_MS = new Date('2026-04-02T23:59:59+07:00').getTime();

        console.log(`🚀 Bắt đầu quét: Hôm nay (2/4/2026) ...`);
        
        let url = `https://graph.facebook.com/v25.0/${pageId}/conversations?fields=updated_time,participants{id,name},messages.limit(5){message,from}&limit=50&access_token=${token}`;
        let totalCreated = 0;
        let breakLoop = false;

        while (url && !breakLoop) {
            const res = await axios.get(url);
            if (!res.data || !res.data.data || res.data.data.length === 0) break;

            for (const conv of res.data.data) {
                const updatedTimeMs = new Date(conv.updated_time).getTime();
                if (updatedTimeMs < START_DATE_MS) {
                    breakLoop = true;
                    break;
                }
                if (updatedTimeMs > END_DATE_MS) continue;

                const participants = conv.participants?.data || [];
                const user = participants.find(p => p.id !== pageId);
                if (!user || user.id === pageId) continue;

                const psid = user.id;
                const existingLead = await pool.query('SELECT id FROM leads WHERE facebook_psid = $1', [psid]);
                
                if (existingLead.rows.length === 0) {
                    const messagesList = conv.messages?.data || [];
                    const userMsgObj = messagesList.find(m => m.from && m.from.id === psid);
                    const msgContent = userMsgObj && userMsgObj.message ? userMsgObj.message : '(Gửi đính kèm)';
                    const firstMessageNote = userMsgObj ? `Facebook Message: "${msgContent}"` : null;

                    const leadResult = await pool.query(
                        'INSERT INTO leads (name, source, status, facebook_psid, consultation_note, last_contacted_at, customer_id) VALUES ($1, $2, $3, $4, $5, $6, (SELECT id FROM customers WHERE facebook_psid = $7 LIMIT 1)) RETURNING *',
                        [user.name || 'Khách (2/4)', 'Messenger', 'Mới', psid, firstMessageNote, new Date(conv.updated_time), psid]
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
            } else {
                url = null;
            }
        }
        console.log(`\n✅ HOÀN TẤT Ngày 2/4! Đã khôi phục thành công ${totalCreated} khách hàng cũ từ tin nhắn!`);
    } catch (e) { 
        console.log('\n❌ Có lỗi xảy ra: ', e.message); 
    } finally {
        pool.end();
    }
};

syncAll();
