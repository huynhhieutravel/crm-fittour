const cron = require('node-cron');
const db = require('../db');

const startAuditLogCleanupCron = () => {
    // Chạy lúc 3:00 sáng mỗi ngày: '0 3 * * *'
    cron.schedule('0 3 * * *', async () => {
        console.log(`[${new Date().toISOString()}] Bắt đầu dọn dẹp Nhật ký hoạt động cũ hơn 30 ngày...`);
        try {
            // Delete logs older than 30 days
            const result = await db.query(
                `DELETE FROM activity_logs WHERE created_at < NOW() - INTERVAL '30 days'`
            );
            console.log(`[${new Date().toISOString()}] Đã dọn dẹp xong. Xóa thành công ${result.rowCount} dòng nhật ký rác.`);
        } catch (err) {
            console.error('Lỗi khi chạy Cron Audit Log Cleanup:', err);
        }
    });
};

module.exports = { startAuditLogCleanupCron };
