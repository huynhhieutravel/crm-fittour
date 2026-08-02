const fs = require('fs');
let content = fs.readFileSync('controllers/notificationController.js', 'utf8');

const broadcastFunc = `
exports.broadcastNewLead = async (lead, bu_group) => {
    try {
        if (!bu_group) return;
        // Lấy tất cả user thuộc bu_group
        const usersRes = await db.query(\`SELECT id FROM users WHERE bu_group = $1 AND role IN ('sale', 'admin', 'manager')\`, [bu_group]);
        const users = usersRes.rows;
        
        const promises = users.map(async (u) => {
            const userId = u.id;
            const message = \`Có Lead mới vào \${bu_group}: \${lead.customer_name || 'Khách hàng'}\`;
            const title = 'Lead mới cần tiếp nhận';
            
            // Insert vào user_notifications
            const notifRes = await db.query(
                \`INSERT INTO user_notifications (user_id, title, message, link, type, reference_id) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *\`,
                [userId, title, message, \`/leads/\${lead.id}\`, 'NEW_LEAD', lead.id]
            );
            
            // Push Notification
            await exports.sendPushToUser(userId, {
                title: title,
                body: message,
                url: \`/global-chat\` // Cần link sang trung tâm giám sát
            });
            
            // Tạm thời có thể bắn socket ở đây nếu cần, nhưng frontend có thể pull
        });
        
        await Promise.all(promises);
    } catch (e) {
        console.error('broadcastNewLead Error:', e);
    }
};
`;

if (!content.includes('broadcastNewLead')) {
    content = content.replace('module.exports = {', broadcastFunc + '\nmodule.exports = {\n  broadcastNewLead,');
    fs.writeFileSync('controllers/notificationController.js', content);
    console.log("Patched notificationController.js");
}
