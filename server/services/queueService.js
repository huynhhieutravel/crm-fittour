const { PgBoss } = require('pg-boss');
const db = require('../db');
const { sendMail } = require('../utils/mailer');

let boss;

async function startQueue() {
  boss = new PgBoss(process.env.DATABASE_URL);
  
  boss.on('error', error => console.error('[pg-boss] Error:', error));

  await boss.start();
  console.log('[pg-boss] Queue engine started. Ready to process jobs.');

  // Tạo queue nếu chưa tồn tại
  try {
    await boss.createQueue('send-email');
  } catch (err) {
    // Ignore error if queue already exists
  }

  // Đăng ký worker xử lý gửi email (Rate Limit: 5 job/giây để chống spam)
  await boss.work('send-email', {
    teamSize: 5,
    teamConcurrency: 2,
    newJobCheckInterval: 2000
  }, async (jobs) => {
    const jobList = Array.isArray(jobs) ? jobs : [jobs];
    for (const job of jobList) {
      await processSendEmail(job);
    }
  });
}

async function enqueue(jobName, data, options = {}) {
  if (!boss) throw new Error('pg-boss is not initialized');
  return await boss.send(jobName, data, options);
}

async function processSendEmail(job) {
  const { notificationLogId, recipient, subject, bodyHtml, cc, bcc, in_reply_to, email_references, from } = job.data;

  try {
    console.log(`[Queue] Processing send-email job ${job.id} for recipient: ${recipient}`);
    
    // Check suppression list again just in case
    const suppRes = await db.query('SELECT id FROM suppression_list WHERE email = $1', [recipient]);
    if (suppRes.rows.length > 0) {
      console.log(`[Queue] Recipient ${recipient} is in suppression list. Skipping.`);
      await updateEmailStatus(notificationLogId, 'suppressed', 'Bị chặn bởi Suppression List');
      return { status: 'suppressed' };
    }

    // Build template & signature
    const COMPANY_SIGNATURE = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; font-size: 13px; color: #475569; line-height: 1.6; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
        <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 600px;">
          <tr>
            <td style="width: 120px; vertical-align: top; padding-right: 15px;">
              <img src="https://erp.fittour.vn/logo.png" alt="FIT Tour" style="width: 120px; height: auto; display: block;" />
            </td>
            <td style="vertical-align: top;">
              <strong style="color: #0f172a; font-size: 14px; text-transform: uppercase;">Công ty TNHH Du lịch Quốc tế FIT Tour</strong><br>
              <span style="color: #0284c7; font-weight: 600; font-size: 12px;">TINH TẾ, CHUYÊN BIỆT & ĐẲNG CẤP</span><br>
              <div style="margin-top: 8px; font-size: 13px;">
                <b>Hotline:</b> <a href="tel:0934888854" style="color: #0f172a; text-decoration: none;">0934 888 854</a> | <b>Website:</b> <a href="https://fittour.vn" style="color: #0284c7; text-decoration: none;">fittour.vn</a><br>
                <b>Văn phòng:</b> Đ. Lương Hữu Khánh/19 Phạm Ngũ Lão, Phường, Quận 1, Hồ Chí Minh 700000
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    const signatureHtml = `<div class="email-signature-wrapper">${COMPANY_SIGNATURE}</div>`;
    let finalHtml = bodyHtml + signatureHtml;

    const htmlContent = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; color: #334155; line-height: 1.6; max-width: 800px; margin: 0 auto;">
        <div style="font-size: 14px;">
          ${finalHtml}
        </div>
      </div>
    `;

    // Send via Nodemailer
    const info = await sendMail({
      from: from || '"[Thông báo ERP FIT Tour]" <loki@fittour.vn>',
      to: recipient,
      cc: cc,
      bcc: bcc,
      subject: subject,
      html: htmlContent,
      inReplyTo: in_reply_to,
      references: email_references
    });

    console.log(`[Queue] Email sent successfully. MessageId: ${info.messageId}`);
    await updateEmailStatus(notificationLogId, 'sent', null);
    
    return { success: true, messageId: info.messageId };

  } catch (err) {
    console.error(`[Queue] Failed to send email to ${recipient}:`, err.message);
    
    const errorMsg = err.message.toLowerCase();
    const isHardFail = errorMsg.includes('550') || 
                       errorMsg.includes('invalid') || 
                       errorMsg.includes('reject') || 
                       errorMsg.includes('not found') || 
                       errorMsg.includes('553');

    if (isHardFail) {
      console.log(`[Queue] Hard Fail detected for ${recipient}. Adding to suppression list.`);
      // Add to suppression list
      await db.query(`
        INSERT INTO suppression_list (email, reason, source_event) 
        VALUES ($1, $2, $3) 
        ON CONFLICT (email) DO NOTHING
      `, [recipient, 'hard_bounce', 'send-email']);
      
      await updateEmailStatus(notificationLogId, 'hard_failed', err.message);
      
      // We don't throw an error to pg-boss, we just return so it doesn't retry this hard bounce.
      return { success: false, hardFail: true, error: err.message };
    }

    // Soft fail -> throw error to let pg-boss retry based on its exponential backoff config
    await updateEmailStatus(notificationLogId, 'failed', err.message);
    throw err;
  }
}

async function updateEmailStatus(notificationLogId, status, errorMsg) {
  if (notificationLogId) {
    await db.query('UPDATE notification_logs SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3', [status, errorMsg, notificationLogId]);
  }
}

module.exports = {
  startQueue,
  enqueue,
  getBoss: () => boss
};
