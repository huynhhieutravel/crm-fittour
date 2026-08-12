const cron = require('node-cron');
const db = require('../db');

function initIdempotencyCleanup() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('[Cron] Starting idempotency cleanup...');
            const result = await db.query(`
                DELETE FROM idempotency_keys
                WHERE created_at < NOW() - INTERVAL '24 hours'
                AND status = 'completed'
            `);
            console.log(`[Cron] Idempotency cleanup finished. Deleted ${result.rowCount} old keys.`);
        } catch (error) {
            console.error('[Cron] Error during idempotency cleanup:', error);
        }
    });
}

module.exports = initIdempotencyCleanup;
