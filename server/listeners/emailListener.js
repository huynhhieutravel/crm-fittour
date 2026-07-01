const db = require('../db');
const { onEvent } = require('../utils/eventBus');
const SystemEvents = require('../constants/SystemEvents');
const { render } = require('../utils/templateRenderer');
const queueService = require('../services/queueService');

/**
 * Registers listeners for all defined system events.
 */
function registerEmailListeners() {
  SystemEvents.forEach(eventMeta => {
    onEvent(eventMeta.code, async (payload) => {
      try {
        await processEmailEvent(eventMeta, payload);
      } catch (err) {
        console.error(`[EmailListener] Error processing event ${eventMeta.code}:`, err);
      }
    });
  });
  console.log('[EmailListener] Registered generic event listeners for system events.');
}

async function processEmailEvent(eventMeta, payload) {
  const { code, label } = eventMeta;

  // 1. Check if there is an active rule for this event
  const ruleRes = await db.query('SELECT * FROM email_rules WHERE event_code = $1 AND is_active = true', [code]);
  if (ruleRes.rows.length === 0) {
    return; // No active rule, do nothing
  }

  const rule = ruleRes.rows[0];

  const resolveGroups = async (groupCodes, externalEmails) => {
    let userIds = [];
    let external = [...(externalEmails || [])];
    if (groupCodes && groupCodes.length > 0) {
      const gRes = await db.query('SELECT users, external_emails FROM email_groups WHERE code = ANY($1) AND is_active = true', [groupCodes]);
      for (const g of gRes.rows) {
        if (g.users) userIds.push(...g.users);
        if (g.external_emails) external.push(...g.external_emails);
      }
    }
    let userEmails = [];
    if (userIds.length > 0) {
      const uIds = [...new Set(userIds)];
      const uRes = await db.query('SELECT email FROM users WHERE id = ANY($1) AND is_active = true AND email IS NOT NULL', [uIds]);
      userEmails = uRes.rows.map(u => u.email).filter(e => e);
    }
    return [...new Set([...userEmails, ...external])].filter(e => e);
  };

  const toRecipients = await resolveGroups(rule.email_groups, rule.external_emails);
  const ccRecipients = await resolveGroups(rule.cc_groups, rule.cc_external_emails);
  const bccRecipients = await resolveGroups(rule.bcc_groups, rule.bcc_external_emails);

  if (toRecipients.length === 0 && ccRecipients.length === 0 && bccRecipients.length === 0) {
    console.log(`[EmailListener] No recipients resolved for event ${code}.`);
    return;
  }

  // 5. Render Template
  const htmlContent = render(code, label, payload, rule.body_template);
  
  let subject = `[Thông báo Hệ thống] ${label}`;
  if (rule.subject_template) {
    subject = rule.subject_template;
    for (const [key, value] of Object.entries(payload)) {
      if (typeof value !== 'object' && value !== null && value !== undefined) {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        subject = subject.replace(regex, value);
      }
    }
  }

  // 6. Define Recipients
  const finalTo = toRecipients.length > 0 ? toRecipients.join(',') : (ccRecipients.length > 0 ? ccRecipients.join(',') : bccRecipients.join(','));
  const finalCc = toRecipients.length > 0 ? ccRecipients.join(',') : ''; // If we fell back CC to TO, don't CC them again
  const finalBcc = bccRecipients.join(',');

  if (!finalTo) {
    console.log(`[EmailListener] No final recipients for event ${code}.`);
    return;
  }

  // 7. Tạo log trong notification_logs để hiển thị trên UI (System Outbox)
  let notificationLogId = null;
  try {
    const notifRes = await db.query(`
      INSERT INTO notification_logs 
      (event_name, channel, recipient_email, subject, status, metadata)
      VALUES ($1, 'email', $2, $3, 'pending', $4)
      RETURNING id
    `, [code, finalTo, subject, JSON.stringify(payload)]);
    notificationLogId = notifRes.rows[0].id;
  } catch (logErr) {
    console.error(`[EmailListener] Lỗi khi tạo notification_log cho event ${code}:`, logErr);
  }

  console.log(`[EmailListener] Enqueueing email for event ${code} (LogID: ${notificationLogId}, TO: ${toRecipients.length}, CC: ${ccRecipients.length}, BCC: ${bccRecipients.length})`);
  
  await queueService.enqueue('send-email', {
    notificationLogId: notificationLogId, 
    recipient: finalTo,
    cc: finalCc,
    bcc: finalBcc,
    subject,
    bodyHtml: htmlContent,
    from: '"[ERP FIT Tour]" <loki@fittour.vn>'
  }, {
    retryLimit: 3,
    retryBackoff: true
  });
}

module.exports = {
  registerEmailListeners
};
