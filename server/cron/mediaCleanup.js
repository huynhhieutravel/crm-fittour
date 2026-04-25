const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../public/uploads/receipts');

const db = require('../db');

const startMediaCleanupCron = () => {
    // Chạy lúc 2 giờ sáng mỗi ngày: '0 2 * * *'
    cron.schedule('0 2 * * *', async () => {
        console.log(`[${new Date().toISOString()}] Bắt đầu dọn dẹp các ảnh Phiếu Thu/Passport rác đã quá 60 ngày...`);
        try {
            if (!fs.existsSync(uploadDir)) return;
            
            // Lấy danh sách đang sử dụng
            let activeUrls = new Set();
            try {
                const [vouchersRes, passportsRes, bookingsRes] = await Promise.all([
                    db.query('SELECT attachment_url FROM payment_vouchers WHERE attachment_url IS NOT NULL'),
                    db.query('SELECT passport_url FROM customers WHERE passport_url IS NOT NULL'),
                    db.query(`SELECT DISTINCT jsonb_array_elements(raw_details->'members')->>'passportUrl' as url FROM bookings WHERE jsonb_typeof(raw_details->'members') = 'array'`)
                ]);
                vouchersRes.rows.forEach(r => activeUrls.add(r.attachment_url));
                passportsRes.rows.forEach(r => activeUrls.add(r.passport_url));
                bookingsRes.rows.forEach(r => {
                    if (r.url) activeUrls.add(r.url);
                });
            } catch (dbErr) {
                console.error('Lỗi khi lấy danh sách URL đang dùng, hủy dọn dẹp để đảm bảo an toàn:', dbErr);
                return; // KHÔNG XÓA NẾU LỖI DB ĐỂ BẢO TOÀN DỮ LIỆU
            }

            const files = fs.readdirSync(uploadDir);
            const now = Date.now();
            const DAYS_60_IN_MS = 60 * 24 * 60 * 60 * 1000;
            let deletedCount = 0;

            files.forEach(file => {
                if (file.startsWith('._') || file.startsWith('.DS_Store')) return; // Ignore System files
                
                const filePath = path.join(uploadDir, file);
                const publicUrl = `/uploads/receipts/${file}`;
                const stats = fs.statSync(filePath);
                
                // Thuật toán quét Time + DB
                if (now - stats.birthtimeMs > DAYS_60_IN_MS) {
                    if (!activeUrls.has(publicUrl)) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                    }
                }
            });
            console.log(`[${new Date().toISOString()}] Đã dọn dẹp xong. Đã xóa ${deletedCount} file ảnh rác (Không sử dụng & > 60 ngày).`);
        } catch (err) {
            console.error('Lỗi khi chạy Cron Media Cleanup:', err);
        }
    });
};

module.exports = { startMediaCleanupCron };
