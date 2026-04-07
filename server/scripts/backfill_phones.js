const db = require('../db');

const extractVietnamPhone = (text) => {
    if (!text) return null;
    const phoneRegex = /(?:\+84|0)(?:[\s.\-]*[35789])(?:[\s.\-]*[0-9]){8}\b/g;
    const matches = text.match(phoneRegex);
    if (matches && matches.length > 0) {
        let phone = matches[0].replace(/[\s.\-+]/g, '');
        if (phone.startsWith('84')) phone = '0' + phone.substring(2);
        return phone;
    }
    return null;
};

(async () => {
    try {
        // 1. Ensure column exists
        await db.query('ALTER TABLE leads ADD COLUMN IF NOT EXISTS fb_conversation_link TEXT;');
        console.log('✅ Column fb_conversation_link added/verified');

        // 2. Backfill: Scan all customer messages for phone numbers
        const msgs = await db.query(`
            SELECT m.content, c.lead_id 
            FROM messages m 
            JOIN conversations c ON m.conversation_id = c.id 
            WHERE m.sender_type = 'customer'
        `);
        
        let count = 0;
        for (const row of msgs.rows) {
            const phone = extractVietnamPhone(row.content);
            if (phone) {
                const check = await db.query('SELECT phone FROM leads WHERE id = $1', [row.lead_id]);
                if (check.rows.length > 0 && !check.rows[0].phone) {
                    await db.query('UPDATE leads SET phone = $1 WHERE id = $2', [phone, row.lead_id]);
                    console.log('📞 Đã điền SĐT', phone, 'cho Lead ID', row.lead_id);
                    count++;
                }
            }
        }
        console.log(`\nTổng cộng: ${count} Lead đã được cập nhật SĐT`);
        
        // 3. Restart PM2 để fix lỗi cũ
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
})();
