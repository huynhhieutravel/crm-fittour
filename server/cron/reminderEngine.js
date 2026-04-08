const cron = require('node-cron');
const db = require('../db');

/**
 * CẤU HÌNH NHẮC NHỞ TỰ ĐỘNG (Dễ dàng thay đổi số ngày hoặc thêm bớt loại nhắc nhở)
 * - PREPARE_DOCS: start_date - 7 days (Nhắc chuẩn bị giấy tờ/Visa)
 * - ITINERARY: start_date - 1 day (Gửi Lịch trình chi tiết)
 * - FEEDBACK: end_date + 1 day (Hỏi thăm / Xin Feedback)
 * - REBOOK: end_date + 7 days (Gợi ý Tour tương tự / Upsell)
 * (Nhắc thanh toán đã được tắt theo yêu cầu)
 */

const REMINDER_CONFIG = [
    { type: 'PREPARE_DOCS', condition: "(td.start_date - INTERVAL '7 days')::date" },
    { type: 'ITINERARY', condition: "(td.start_date - INTERVAL '1 days')::date" },
    { type: 'FEEDBACK', condition: "(td.end_date + INTERVAL '1 days')::date" },
    { type: 'REBOOK', condition: "(td.end_date + INTERVAL '7 days')::date" }
];

const generateReminders = async () => {
    try {
        console.log('[CRON] Khởi chạy quét Reminder tự động...');

        // 1. Dọn dẹp: Tự động đánh dấu HỦY các nhắc nhở của Tour đã bị Hủy (Tránh rác thông báo)
        await db.query(`
            UPDATE departure_reminders 
            SET status = 'CANCELLED' 
            WHERE status = 'PENDING' 
              AND tour_departure_id IN (SELECT id FROM tour_departures WHERE status = 'Huỷ');
        `);

        // 2. Chạy quét sinh nhắc nhở
        for (const q of REMINDER_CONFIG) {
            const sql = `
                INSERT INTO departure_reminders (tour_departure_id, type, due_date, assigned_to)
                SELECT 
                    td.id as tour_departure_id, 
                    $1 as type, 
                    ${q.condition} as due_date,
                    td.guide_id as assigned_to
                FROM tour_departures td
                WHERE td.start_date IS NOT NULL
                  AND td.end_date IS NOT NULL
                  AND td.status != 'Huỷ'
                  AND ${q.condition} <= CURRENT_DATE
                ON CONFLICT (tour_departure_id, type) 
                DO UPDATE SET 
                    due_date = EXCLUDED.due_date,
                    assigned_to = EXCLUDED.assigned_to 
                WHERE departure_reminders.status = 'PENDING';
            `;
            // NOTE: Chỉ update lại due_date và assigned_to nếu nhắc nhở đó vẫn đang PENDING
            await db.query(sql, [q.type]);
        }
        console.log('[CRON] Quét Reminder tự động hoàn tất thành công.');
    } catch (err) {
        console.error('[CRON] Lỗi khi tạo Reminders:', err);
    }
};

const startCronJobs = () => {
    // Chạy lúc 00:30 phút mỗi ngày
    cron.schedule('30 0 * * *', () => {
        generateReminders();
    }, {
        timezone: "Asia/Ho_Chi_Minh"
    });
    
    console.log('[CRON] reminderEngine đã đính kèm vào luồng hệ thống.');
    
    // Auto run once immediately so we can test the UI on first start!
    setTimeout(() => {
        generateReminders();
    }, 5000); // 5 sec delay on boot
};

module.exports = { startCronJobs, generateReminders };
