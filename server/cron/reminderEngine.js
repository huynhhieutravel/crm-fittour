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

const processLeadReminders = async () => {
    try {
        console.log('[CRON] Quét Lead Reminders đến hạn...');
        
        // Tìm các nhắc nhở chưa thông báo (notified_bell = false) và đến hạn (due_date <= hiện tại)
        const result = await db.query(`
            SELECT lr.*, l.name as lead_name 
            FROM lead_reminders lr
            JOIN leads l ON lr.lead_id = l.id
            WHERE lr.notified_bell = false 
              AND lr.due_date <= CURRENT_TIMESTAMP
              AND lr.status = 'PENDING'
        `);
        
        for (const reminder of result.rows) {
            const title = 'Nhắc nhở chăm sóc khách hàng';
            const message = `Đã đến giờ hẹn chăm sóc khách: ${reminder.lead_name}. Ghi chú: ${reminder.title || 'Không có'}`;
            const link = `/workspace?lead_id=${reminder.lead_id}`;
            
            // Insert notification
            const notifRes = await db.query(`
                INSERT INTO user_notifications (user_id, title, message, link, is_read)
                VALUES ($1, $2, $3, $4, false)
                RETURNING *
            `, [reminder.assigned_to, title, message, link]);
            
            // Emit via socket if possible
            if (global.io) {
                global.io.to(`user_${reminder.assigned_to}`).emit('new_notification', notifRes.rows[0]);
            }
            
            // Mark as notified
            await db.query(`UPDATE lead_reminders SET notified_bell = true WHERE id = $1`, [reminder.id]);
        }
        if (result.rows.length > 0) {
            console.log(`[CRON] Đã thông báo cho ${result.rows.length} Lead Reminders.`);
        }
    } catch (err) {
        console.error('[CRON] Lỗi khi xử lý Lead Reminders:', err);
    }
};

const startCronJobs = () => {
    // Chạy lúc 00:30 phút mỗi ngày cho Departure Reminders
    cron.schedule('30 0 * * *', () => {
        generateReminders();
    }, {
        timezone: "Asia/Ho_Chi_Minh"
    });
    
    // Chạy mỗi 15 phút để check Lead Reminders
    cron.schedule('*/15 * * * *', () => {
        processLeadReminders();
    });
    
    console.log('[CRON] reminderEngine đã đính kèm vào luồng hệ thống.');
    
    // Auto run once immediately so we can test the UI on first start!
    setTimeout(() => {
        generateReminders();
        processLeadReminders();
    }, 5000); // 5 sec delay on boot
};

module.exports = { startCronJobs, generateReminders, processLeadReminders };
