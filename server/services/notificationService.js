const db = require('../db');
const { POLICIES, CHANNELS } = require('../config/notificationPolicies');
const queueService = require('./queueService');

/**
 * Hàm emit chính của Notification Service
 * @param {string} eventName Tên sự kiện (VD: 'leave.approved')
 * @param {Object} payload Dữ liệu truyền vào (VD: { recipient_user_id, recipient_email, subject, data: {} })
 * @param {string} idempotencyKey Key chống trùng (VD: 'leave-123-approved')
 */
const emit = async (eventName, payload, idempotencyKey) => {
  try {
    const policy = POLICIES[eventName];
    if (!policy) {
      console.warn(`[Notification] No policy found for event: ${eventName}`);
      return;
    }

    const { channels, template_slug } = policy;
    const correlationId = `REQ-${new Date().toISOString().replace(/[-:T.]/g, '').substring(0, 14)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Kiểm tra idempotency_key ở notification_logs trước tiên
    if (idempotencyKey) {
      const existing = await db.query('SELECT id FROM notification_logs WHERE idempotency_key = $1', [idempotencyKey]);
      if (existing.rows.length > 0) {
        console.log(`[Notification] Skip duplicate event (Idempotency Hit): ${idempotencyKey}`);
        return;
      }
    }

    // Lặp qua các channel cần phát sóng
    for (const channel of channels) {
      // 1. Lưu log vào notification_logs
      const notifRes = await db.query(`
        INSERT INTO notification_logs 
        (event_name, channel, recipient_user_id, recipient_email, subject, template_slug, status, idempotency_key, correlation_id, metadata)
        VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9)
        RETURNING id
      `, [
        eventName, 
        channel, 
        payload.recipient_user_id || null, 
        payload.recipient_email || null, 
        payload.subject || 'Thông báo hệ thống', 
        template_slug || null, 
        idempotencyKey ? `${idempotencyKey}-${channel}` : null, 
        correlationId, 
        payload.metadata || '{}'
      ]);

      const notificationLogId = notifRes.rows[0].id;

      // 2. Xử lý logic từng channel
      if (channel === CHANNELS.EMAIL && payload.recipient_email) {
        await handleEmailChannel(notificationLogId, eventName, payload, template_slug, idempotencyKey, correlationId);
      } else if (channel === CHANNELS.IN_APP) {
        await handleInAppChannel(notificationLogId, eventName, payload);
      }
    }

  } catch (err) {
    console.error(`[Notification] Emit Error:`, err);
  }
};

const handleEmailChannel = async (notificationLogId, eventName, payload, template_slug, idempotencyKey, correlationId) => {
  try {
    // 1. Lấy template từ DB (nếu có) hoặc render logic
    let bodyHtml = payload.html_body || '';
    let subject = payload.subject || 'Thông báo từ hệ thống ERP';

    if (template_slug && !bodyHtml) {
      const tplRes = await db.query('SELECT subject_template, body_template FROM email_templates WHERE slug = $1', [template_slug]);
      if (tplRes.rows.length > 0) {
        const tpl = tplRes.rows[0];
        
        // Simple {{variable}} replacement (A lightweight alternative to Handlebars for now)
        subject = tpl.subject_template.replace(/{{(.*?)}}/g, (match, p1) => payload.data[p1.trim()] || match);
        bodyHtml = tpl.body_template.replace(/{{(.*?)}}/g, (match, p1) => payload.data[p1.trim()] || match);
      } else {
        bodyHtml = `<p>Thông báo sự kiện: <b>${eventName}</b></p><pre>${JSON.stringify(payload.data, null, 2)}</pre>`;
      }
    }

    // 2. Kiểm tra Suppression List
    const suppRes = await db.query('SELECT id, reason FROM suppression_list WHERE email = $1', [payload.recipient_email]);
    if (suppRes.rows.length > 0) {
      console.log(`[Notification] Blocked sending to suppressed email: ${payload.recipient_email} (Reason: ${suppRes.rows[0].reason})`);
      await db.query('UPDATE notification_logs SET status = $1, error_message = $2 WHERE id = $3', ['skipped', 'Bị chặn bởi Suppression List', notificationLogId]);
      return;
    }

    // 3. Đẩy vào pg-boss Queue thực sự (Rate Limited, Retries)
    await queueService.enqueue('send-email', {
      notificationLogId: notificationLogId,
      recipient: payload.recipient_email,
      subject: subject,
      bodyHtml: bodyHtml,
      cc: null,
      bcc: null,
      in_reply_to: null,
      email_references: null
    }, { 
      retryLimit: 4, 
      retryBackoff: true // Exponential backoff builtin của pg-boss
    });

    // Đánh dấu notification đã đẩy thành công sang queue
    await db.query('UPDATE notification_logs SET status = $1 WHERE id = $2', ['sent_to_queue', notificationLogId]);

  } catch (err) {
    console.error(`[Notification] handleEmailChannel Error:`, err);
    await db.query('UPDATE notification_logs SET status = $1, error_message = $2 WHERE id = $3', ['failed', err.message, notificationLogId]);
  }
};

const handleInAppChannel = async (notificationLogId, eventName, payload) => {
  try {
    const userId = payload.user_id;
    if (!userId) {
      console.warn('[Notification] In-App channel skipped: No user_id in payload');
      return;
    }

    let title = 'Thông báo mới';
    let message = 'Bạn có một thông báo mới từ hệ thống.';
    let link = '/';

    // Map content based on eventName
    if (eventName === 'leave_approved') {
      title = 'Đơn xin nghỉ phép đã được duyệt';
      message = `Đơn xin nghỉ phép của bạn từ ${payload.date} đã được duyệt.`;
      link = '/leaves';
    } else if (eventName === 'leave_rejected') {
      title = 'Đơn xin nghỉ phép bị từ chối';
      message = `Đơn xin nghỉ phép của bạn từ ${payload.date} đã bị từ chối.`;
      link = '/leaves';
    }

    // Insert to DB
    const res = await db.query(`
      INSERT INTO user_notifications (user_id, title, message, link, is_read)
      VALUES ($1, $2, $3, $4, false)
      RETURNING *
    `, [userId, title, message, link]);

    const notif = res.rows[0];

    // Emit over socket.io if available
    if (global.io) {
      global.io.to(`user_${userId}`).emit('new_notification', notif);
    }

    await db.query('UPDATE notification_logs SET status = $1 WHERE id = $2', ['sent', notificationLogId]);
  } catch (err) {
    console.error('[Notification] In-App channel error:', err);
    await db.query('UPDATE notification_logs SET status = $1, error_message = $2 WHERE id = $3', ['failed', err.message, notificationLogId]);
  }
};

module.exports = {
  emit
};
