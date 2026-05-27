const cron = require('node-cron');
const db = require('../db');
const { sendMail } = require('../utils/mailer');

async function sendViaNodemailer(row) {
  try {
    const fromFormatted = row.display_name 
      ? `"${row.display_name}" <${row.mailbox_address}>`
      : row.mailbox_address;

    // Build the Email Template Wrapper
    const COMPANY_SIGNATURE = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #475569; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px;">
          <tr>
            <td style="width: 120px; vertical-align: top; padding-right: 15px;">
              <img src="https://erp.fittour.vn/logo.png" alt="FIT Tour" style="width: 120px; height: auto; display: block;" />
            </td>
            <td style="vertical-align: top;">
              <strong style="color: #0f172a; font-size: 14px; text-transform: uppercase;">Công ty Cổ phần Lữ hành Quốc tế FIT Tour</strong><br>
              <span style="color: #0284c7; font-weight: 600; font-size: 12px;">TINH TẾ, CHUYÊN BIỆT & ĐẲNG CẤP</span><br>
              <div style="margin-top: 8px; font-size: 13px;">
                <b>Hotline:</b> <a href="tel:0909811836" style="color: #0f172a; text-decoration: none;">090 981 1836</a><br>
                <b>Email:</b> <a href="mailto:info@fittour.vn" style="color: #0284c7; text-decoration: none;">info@fittour.vn</a> | <b>Website:</b> <a href="https://fittour.vn" style="color: #0284c7; text-decoration: none;">fittour.vn</a><br>
                <b>Văn phòng:</b> Tầng 6, Tòa nhà 192-194 Hoa Lan, Phường 2, Phú Nhuận, TP.HCM
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    const activeSignature = row.signature || COMPANY_SIGNATURE;
    const signatureHtml = `<div class="email-signature-wrapper">${activeSignature}</div>`;
    
    // Cleanly wrap the body
    let rawBody = row.body || row.body_text || '';
    // If the email is a reply/forward, the quoted text is usually separated by a <br/><br/><div style="border-left... 
    // We should ideally put the signature BEFORE the quoted text if possible.
    let finalHtml = '';
    
    if (rawBody.includes('--- Trả lời ---') || rawBody.includes('---------- Forwarded message ----------')) {
      // Split by the reply/forward divider
      const parts = rawBody.split(/(<br\s*\/?>\s*<br\s*\/?>\s*<div[^>]*>.*?--- Trả lời ---.*?|<\br\s*\/?>\s*<br\s*\/?>\s*<div[^>]*>.*?---------- Forwarded message ----------.*?)/i);
      if (parts.length > 1) {
        finalHtml = parts[0] + signatureHtml + parts.slice(1).join('');
      } else {
        finalHtml = rawBody + signatureHtml;
      }
    } else {
      finalHtml = rawBody + signatureHtml;
    }

    const htmlContent = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <div style="font-size: 14px;">
          ${finalHtml}
        </div>
      </div>
    `;

    const info = await sendMail({
      from: fromFormatted,
      to: row.recipient,
      cc: row.cc,
      bcc: row.bcc,
      subject: row.subject,
      html: htmlContent,
      inReplyTo: row.in_reply_to,
      references: row.email_references ? JSON.parse(row.email_references).join(' ') : undefined
    });
    return { success: true, messageId: info.messageId };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Chạy mỗi 1 phút
cron.schedule('* * * * *', async () => {
  try {
    // Tìm các email đang queued hoặc failed nhưng chưa vượt quá max_retries
    const result = await db.query(`
      SELECT el.id as log_id, el.retry_count, e.*, m.display_name, m.signature 
      FROM email_logs el
      JOIN emails e ON el.email_id = e.id
      LEFT JOIN email_mailboxes m ON e.mailbox_address = m.email_address
      WHERE el.direction = 'outbound' 
        AND (el.status = 'queued' OR el.status = 'failed')
        AND el.retry_count < el.max_retries
        AND (el.next_retry_at IS NULL OR el.next_retry_at <= NOW())
      LIMIT 20
    `);

    for (const row of result.rows) {
      console.log(`[Email Retry] Processing email ${row.id}...`);
      
      const mailRes = await sendViaNodemailer(row);

      if (mailRes.success) {
        await db.query(`
          UPDATE email_logs 
          SET status = 'sent', updated_at = NOW() 
          WHERE id = $1
        `, [row.log_id]);
      } else {
        const errorMsg = mailRes.error ? mailRes.error.toLowerCase() : '';
        // Kiểm tra Hard Fail (Email không tồn tại, sai định dạng, bị reject)
        const isHardFail = errorMsg.includes('550') || 
                           errorMsg.includes('invalid') || 
                           errorMsg.includes('reject') || 
                           errorMsg.includes('not found') || 
                           errorMsg.includes('553');

        if (isHardFail) {
          console.log(`[Email Retry] Hard Fail detected for log_id ${row.log_id}. Halting retries.`);
          await db.query(`
            UPDATE email_logs 
            SET status = 'hard_failed', 
                error_message = $2, 
                retry_count = max_retries, -- Max out retries to stop queue
                updated_at = NOW() 
            WHERE id = $1
          `, [row.log_id, mailRes.error]);
        } else {
          console.log(`[Email Retry] Soft Fail detected for log_id ${row.log_id}. Will retry.`);
          const nextRetry = new Date(Date.now() + 1 * 60000 * Math.pow(2, row.retry_count)); // Exponential backoff (1m, 2m, 4m...)
          await db.query(`
            UPDATE email_logs 
            SET status = 'failed', 
                error_message = $2, 
                retry_count = retry_count + 1,
                next_retry_at = $3,
                updated_at = NOW() 
            WHERE id = $1
          `, [row.log_id, mailRes.error, nextRetry]);
        }
      }
    }
  } catch (err) {
    console.error('[Email Retry] Error:', err);
  }
});
