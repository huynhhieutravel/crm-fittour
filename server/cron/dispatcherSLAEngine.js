const cron = require('node-cron');
const db = require('../db');
const telegramService = require('../services/telegramService');

const startDispatcherSLAEngine = () => {
    // Run every minute: '* * * * *'
    cron.schedule('* * * * *', async () => {
        try {
            // Find leads dispatched more than 30 mins ago but not yet assigned, and SLA 30m not notified
            const res30m = await db.query(`
                SELECT id, telegram_message_id, dispatched_at 
                FROM leads
                WHERE dispatched_at IS NOT NULL 
                AND assigned_to IS NULL
                AND telegram_message_id IS NOT NULL
                AND dispatched_at < NOW() - INTERVAL '30 minutes'
                AND sla_30m_notified_at IS NULL
            `);

            for (const row of res30m.rows) {
                await telegramService.sendDispatchReminder(row.telegram_message_id, '30m');
                await db.query(`UPDATE leads SET sla_30m_notified_at = NOW() WHERE id = $1`, [row.id]);
            }

            // Find leads dispatched more than 60 mins ago but not yet assigned, and SLA 60m not notified
            const res60m = await db.query(`
                SELECT id, telegram_message_id, dispatched_at 
                FROM leads
                WHERE dispatched_at IS NOT NULL 
                AND assigned_to IS NULL
                AND telegram_message_id IS NOT NULL
                AND dispatched_at < NOW() - INTERVAL '60 minutes'
                AND sla_60m_notified_at IS NULL
            `);

            for (const row of res60m.rows) {
                await telegramService.sendDispatchReminder(row.telegram_message_id, '60m');
                await db.query(`UPDATE leads SET sla_60m_notified_at = NOW() WHERE id = $1`, [row.id]);
            }

        } catch (err) {
            console.error('[CRON] Lỗi khi chạy Dispatcher SLA Engine:', err);
        }
    });
};

module.exports = { startDispatcherSLAEngine };
