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

  let toRecipients = await resolveGroups(rule.email_groups, rule.external_emails);
  let ccRecipients = await resolveGroups(rule.cc_groups, rule.cc_external_emails);
  let bccRecipients = await resolveGroups(rule.bcc_groups, rule.bcc_external_emails);

  // --- DYNAMIC OVERRIDE CHO ĐƠN XIN NGHỈ PHÉP ---
  if (code === 'LEAVE_REQUEST_CREATED' && payload.send_to_all === false && payload.applicant_id) {
    try {
      const applicantRes = await db.query('SELECT bus FROM users WHERE id = $1', [payload.applicant_id]);
      const applicantBUs = applicantRes.rows.length > 0 ? applicantRes.rows[0].bus : [];
      
      const q = `
         SELECT email FROM users 
         WHERE is_active = true 
         AND email IS NOT NULL 
         AND (
            bus && $1::text[] 
            OR role IN ('admin', 'manager', 'group_manager', 'operations_lead')
            OR role ILIKE '%manager%'
            OR role ILIKE '%lead%'
            OR position ILIKE '%giám đốc%'
            OR position ILIKE '%trưởng phòng%'
            OR position ILIKE '%quản lý%'
            OR position ILIKE '%pgđ%'
         )
      `;
      const buBodRes = await db.query(q, [applicantBUs || []]);
      const dynamicEmails = buBodRes.rows.map(r => r.email);
      toRecipients = [...new Set(dynamicEmails)].filter(e => e);
      ccRecipients = [];  // Xóa sạch CC để đảm bảo không bị rò rỉ nếu Admin lỡ cấu hình ALL_STAFF vào CC
      bccRecipients = []; // Xóa sạch BCC
    } catch (overrideErr) {
      console.error('[EmailListener] Error overriding recipients for LEAVE_REQUEST_CREATED:', overrideErr);
    }
  }
  // ---------------------------------------------

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
  let safeTo = toRecipients;
  let safeCc = ccRecipients.filter(email => !safeTo.includes(email));
  let safeBcc = bccRecipients.filter(email => !safeTo.includes(email) && !safeCc.includes(email));

  const finalTo = safeTo.length > 0 ? safeTo.join(',') : (safeCc.length > 0 ? safeCc.join(',') : safeBcc.join(','));
  const finalCc = safeTo.length > 0 ? safeCc.join(',') : ''; // If we fell back CC to TO, don't CC them again
  const finalBcc = safeBcc.join(',');

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
