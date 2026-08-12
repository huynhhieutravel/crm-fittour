const cron = require('node-cron');
const db = require('../db');
const axios = require('axios');

async function processOutbox() {
    const client = await db.pool.connect();
    try {
        const result = await client.query(`
            SELECT id, app_id, event_type, payload, retry_count 
            FROM webhook_outbox 
            WHERE status IN ('PENDING', 'FAILED') AND retry_count < 5
            ORDER BY created_at ASC
            LIMIT 10
        `);

        if (result.rows.length === 0) return;

        const astroUrl = process.env.ASTRO_API_URL || 'http://localhost:4322';
        const astroSecret = process.env.ASTRO_ERP_SECRET;

        for (const job of result.rows) {
            try {
                if (job.event_type === 'unlink') {
                    const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
                    
                    await axios.patch(`${astroUrl}/api/erp/mobile-users/${job.app_id}/link`, payload, {
                        headers: { 
                            'Authorization': `Bearer ${astroSecret}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    // Thành công -> xóa luôn khỏi outbox hoặc đánh dấu SUCCESS
                    await client.query(`DELETE FROM webhook_outbox WHERE id = $1`, [job.id]);
                }
            } catch (err) {
                console.error(`Outbox Job Failed (ID: ${job.id}):`, err.message);
                await client.query(`
                    UPDATE webhook_outbox 
                    SET status = 'FAILED', 
                        retry_count = retry_count + 1, 
                        last_error = $1, 
                        updated_at = NOW() 
                    WHERE id = $2
                `, [err.message, job.id]);
            }
        }
    } catch (err) {
        console.error('Error processing webhook outbox:', err);
    } finally {
        client.release();
    }
}

function startWebhookOutboxEngine() {
    // Chạy mỗi 1 phút
    cron.schedule('* * * * *', () => {
        processOutbox();
    });
}

module.exports = { startWebhookOutboxEngine, processOutbox };
