const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../public/uploads/receipts');

const startMediaCleanupCron = () => {
    // Chạy lúc 2 giờ sáng mỗi ngày: '0 2 * * *'
    cron.schedule('0 2 * * *', () => {
        console.log(`[${new Date().toISOString()}] Bắt đầu dọn dẹp các ảnh Phiếu Thu đã quá 60 ngày...`);
        try {
            if (!fs.existsSync(uploadDir)) return;
            
            const files = fs.readdirSync(uploadDir);
            const now = Date.now();
            const DAYS_60_IN_MS = 60 * 24 * 60 * 60 * 1000;
            let deletedCount = 0;

            files.forEach(file => {
                const filePath = path.join(uploadDir, file);
                const stats = fs.statSync(filePath);
                
                // Thuật toán quét Time
                if (now - stats.birthtimeMs > DAYS_60_IN_MS) {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                }
            });
            console.log(`[${new Date().toISOString()}] Đã dọn dẹp xong. Đã xóa ${deletedCount} file ảnh rác.`);
        } catch (err) {
            console.error('Lỗi khi chạy Cron Media Cleanup:', err);
        }
    });
};

module.exports = { startMediaCleanupCron };
