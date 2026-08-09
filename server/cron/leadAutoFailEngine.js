const cron = require('node-cron');
const db = require('../db');
const { emitEvent } = require('../utils/eventBus');
const SystemEvents = require('../constants/SystemEvents');

const startLeadAutoFailCron = () => {
    // Chạy mỗi ngày vào lúc 01:00 AM
    cron.schedule('0 1 * * *', async () => {
        try {
            console.log('[CRON] Khởi chạy quét Lead Auto-Fail tự động...');
            
            // Tìm các lead:
            // - assigned_to IS NULL (Chưa phân)
            // - status NOT IN ('Chốt đơn', 'Thất bại', 'Không phản hồi')
            // - phone IS NULL OR phone = ''
            // - email IS NULL OR email = ''
            // - COALESCE(last_contacted_at, created_at) < NOW() - INTERVAL '7 days'
            
            const sweepQuery = `
                UPDATE leads
                SET status = 'Không phản hồi', updated_at = NOW()
                WHERE assigned_to IS NULL
                  AND status NOT IN ('Chốt đơn', 'Thất bại', 'Không phản hồi')
                  AND (phone IS NULL OR phone = '')
                  AND (email IS NULL OR email = '')
                  AND COALESCE(last_contacted_at, created_at) < NOW() - INTERVAL '7 days'
                RETURNING id, name, facebook_psid, status;
            `;
            
            const result = await db.query(sweepQuery);
            
            if (result.rows.length > 0) {
                console.log(`[CRON] Đã dọn dẹp (Auto-Fail) thành công ${result.rows.length} Leads rác.`);
                
                // Ghi log qua eventBus (Tuỳ chọn)
                const eventCode = SystemEvents.find(e => e.code === 'LEAD_STATUS_CHANGED')?.code;
                if (eventCode) {
                    for (const lead of result.rows) {
                        emitEvent(eventCode, {
                            lead_id: lead.id,
                            lead_name: lead.name,
                            old_status: 'Mới',
                            status: lead.status,
                            user_id: 1, // Admin / System
                            user_name: 'Hệ thống (Auto-Fail)'
                        }).catch(() => {});
                    }
                }
            } else {
                console.log('[CRON] Không có Lead rác nào cần dọn dẹp hôm nay.');
            }
            
        } catch (err) {
            console.error('[CRON] Lỗi khi chạy quét Lead Auto-Fail:', err);
        }
    });
    
    console.log('[CRON] leadAutoFailEngine đã đính kèm vào luồng hệ thống.');
};

module.exports = { startLeadAutoFailCron };
