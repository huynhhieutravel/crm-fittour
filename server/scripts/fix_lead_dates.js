require('dotenv').config({ path: __dirname + '/../.env' });
const axios = require('axios');
const db = require('../db');

(async () => {
    console.log('🔄 Đang khôi phục ngày giờ gốc của Lead...');
    const resSettings = await db.query("SELECT value FROM settings WHERE key = 'meta_page_access_token'");
    let token = resSettings.rows.length > 0 ? resSettings.rows[0].value : process.env.FB_PAGE_TOKEN;
    
    let pageId = null;
    try {
        const accRes = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`);
        if (accRes.data && accRes.data.data && accRes.data.data.length > 0) {
            token = accRes.data.data[0].access_token;
            pageId = accRes.data.data[0].id;
        }
    } catch(e) {}
    
    if (!token || !pageId) {
        console.error('❌ Lỗi: Không tìm thấy Token hoặc Page ID');
        process.exit(1);
    }
    
    const endpoint = `https://graph.facebook.com/v25.0/${pageId}/conversations?fields=updated_time,participants{id,name},messages.limit(20){message,from,created_time}&limit=100&access_token=${token}`;
    try {
        const res = await axios.get(endpoint);
        const convs = res.data.data || [];
        let count = 0;
        
        for (const conv of convs) {
            const participants = conv.participants?.data || [];
            const user = participants.find(p => p.id !== pageId);
            if (!user) continue;
            
            const psid = user.id;
            let earliestTime = null;
            
            if (conv.messages && conv.messages.data) {
                const customerMsgs = conv.messages.data.filter(m => m.from && m.from.id === psid && m.created_time);
                if (customerMsgs.length > 0) {
                    earliestTime = new Date(customerMsgs[customerMsgs.length - 1].created_time);
                }
            }
            
            if (!earliestTime && conv.updated_time) {
                earliestTime = new Date(conv.updated_time);
            }
            
            if (earliestTime) {
                // Update leads that were created today but actually belong to the past
                const leadRes = await db.query(
                    `SELECT id FROM leads 
                     WHERE facebook_psid = $1 
                     AND created_at >= CURRENT_DATE`,
                    [psid]
                );
                
                if (leadRes.rows.length > 0) {
                    const leadId = leadRes.rows[0].id;
                    await db.query(`UPDATE leads SET created_at = $1 WHERE id = $2`, [earliestTime, leadId]);
                    console.log(`✅ Đã sửa giờ Lead #${leadId} (${user.name}) -> ${earliestTime.toLocaleString()}`);
                    count++;
                }
            }
        }
        console.log(`🎉 Đã sửa xong ngày giờ gốc cho ${count} Leads!`);
    } catch(e) {
        console.error('❌ Lỗi Graph API:', e.response?.data || e.message);
    }
    process.exit(0);
})();
