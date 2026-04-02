const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const syncAll = async () => {
    try {
        const res = await pool.query('SELECT value FROM settings WHERE key = $1', ['meta_page_access_token']);
        const token = res.rows.length > 0 ? res.rows[0].value : process.env.FB_PAGE_TOKEN;
        
        const accountsRes = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${token}`);
        let pageId = null;
        if (accountsRes.data?.data?.length > 0) { pageId = accountsRes.data.data[0].id; }
        else {
            const meRes = await axios.get(`https://graph.facebook.com/v25.0/me?access_token=${token}`);
            pageId = meRes.data.id;
        }

        let url = `https://graph.facebook.com/v25.0/${pageId}/conversations?fields=updated_time,participants{id,name},messages.limit(5){message,from}&limit=10&access_token=${token}`;
        const fbRes = await axios.get(url);
        
        for (const conv of fbRes.data.data) {
            const participants = conv.participants?.data || [];
            const user = participants.find(p => p.id !== pageId);
            if (!user) continue;

            const existingLead = await pool.query('SELECT id FROM leads WHERE facebook_psid = $1', [user.id]);
            const existingConv = await pool.query('SELECT id FROM conversations WHERE external_id = $1', [user.id]);

            console.log(`- Tên: ${user.name}, Cập nhật: ${conv.updated_time}`);
            console.log(`  + Đã có trong bảng Leads? ${existingLead.rows.length > 0}`);
            console.log(`  + Đã có trong bảng Conversations? ${existingConv.rows.length > 0}`);
        }
    } catch (e) { console.log(e.message); } finally { pool.end(); }
};
syncAll();
