const cron = require('node-cron');
const db = require('../db');
const axios = require('axios');

async function sendViaCloudflare(payload) {
  const workerUrl = process.env.CF_EMAIL_WORKER_URL;
  const secret = process.env.CRM_WEBHOOK_SECRET;
  
  if (!workerUrl) return { success: false, error: 'CF_EMAIL_WORKER_URL not configured' };

  try {
    const res = await axios.post(workerUrl, payload, {
      headers: {
        'Authorization': `Bearer ${secret}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    return res.data;
  } catch (err) {
    return { success: false, error: err.response?.data || err.message };
  }
}

// Chạy mỗi 1 phút
cron.schedule('* * * * *', async () => {
  try {
    // Tìm các email đang queued hoặc failed nhưng chưa vượt quá max_retries
    const result = await db.query(`
      SELECT el.id as log_id, el.retry_count, e.* 
      FROM email_logs el
      JOIN emails e ON el.email_id = e.id
      WHERE el.direction = 'outbound' 
        AND (el.status = 'queued' OR el.status = 'failed')
        AND el.retry_count < el.max_retries
        AND (el.next_retry_at IS NULL OR el.next_retry_at <= NOW())
      LIMIT 20
    `);

    for (const row of result.rows) {
      console.log(`[Email Retry] Processing email ${row.id}...`);
      
      const payload = {
        from: row.mailbox_address,
        to: row.recipient,
        subject: row.subject,
        body: row.body || row.body_text,
        inReplyTo: row.in_reply_to,
        references: row.email_references ? JSON.parse(row.email_references).join(' ') : ''
      };

      const cfRes = await sendViaCloudflare(payload);

      if (cfRes.success) {
        await db.query(`
          UPDATE email_logs 
          SET status = 'sent', updated_at = NOW() 
          WHERE id = $1
        `, [row.log_id]);
      } else {
        const nextRetry = new Date(Date.now() + 1 * 60000 * Math.pow(2, row.retry_count)); // Exponential backoff (1m, 2m, 4m...)
        await db.query(`
          UPDATE email_logs 
          SET status = 'failed', 
              error_message = $2, 
              retry_count = retry_count + 1,
              next_retry_at = $3,
              updated_at = NOW() 
          WHERE id = $1
        `, [row.log_id, typeof cfRes.error === 'object' ? JSON.stringify(cfRes.error) : cfRes.error, nextRetry]);
      }
    }
  } catch (err) {
    console.error('[Email Retry] Error:', err);
  }
});
