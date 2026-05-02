const db = require('../db');
const crypto = require('crypto');

// ══════════════════════════════════════════════
// WEBHOOK: Nhận email từ Cloudflare Worker
// ══════════════════════════════════════════════
const WEBHOOK_SECRET = process.env.EMAIL_WEBHOOK_SECRET || 'dev-secret';
const WEBHOOK_MAX_AGE = 300; // 5 phút

function verifyWebhookSignature(req) {
  if (process.env.NODE_ENV !== 'production') return true; // Skip verify trên localhost
  const sig = req.headers['x-webhook-signature'];
  const ts = req.headers['x-webhook-timestamp'];
  if (!sig || !ts) return false;
  const age = Math.floor(Date.now() / 1000) - parseInt(ts);
  if (age > WEBHOOK_MAX_AGE) return false;
  const expected = crypto.createHmac('sha256', WEBHOOK_SECRET)
    .update(`${ts}.${JSON.stringify(req.body)}`).digest('hex');
  return sig === expected;
}

// Xác định retention tier dựa trên sender domain
function getRetentionTier(sender, recipient, domains = ['fittour.vn']) {
  const senderDomain = (sender || '').split('@')[1]?.toLowerCase();
  if (domains.includes(senderDomain)) return 'employee';
  return 'customer';
}

exports.incomingWebhook = async (req, res) => {
  try {
    if (!verifyWebhookSignature(req)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }
    const { mailbox_address, subject, sender, recipient, cc, bcc, body, body_text,
      message_id, in_reply_to, email_references, thread_id, normalized_subject,
      raw_headers, attachments, idempotency_key } = req.body;

    // Idempotency check
    if (idempotency_key) {
      const existing = await db.query('SELECT email_id FROM email_logs WHERE idempotency_key = $1', [idempotency_key]);
      if (existing.rows.length > 0) return res.json({ status: 'duplicate', email_id: existing.rows[0].email_id });
    }

    // Tìm user_id từ mailbox
    const mbResult = await db.query('SELECT user_id FROM email_mailboxes WHERE email_address = $1 AND is_active = true', [mailbox_address || recipient]);
    const user_id = mbResult.rows[0]?.user_id || null;

    // Insert email
    const result = await db.query(`
      INSERT INTO emails (user_id, mailbox_address, folder, subject, sender, recipient, cc, bcc,
        body, body_text, message_id, in_reply_to, email_references, thread_id, normalized_subject, raw_headers, date)
      VALUES ($1,$2,'inbox',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15, NOW())
      RETURNING id
    `, [user_id, mailbox_address || recipient, subject, sender, recipient, cc, bcc,
        body, body_text, message_id, in_reply_to, JSON.stringify(email_references), thread_id, normalized_subject, raw_headers]);

    const emailId = result.rows[0].id;

    // Insert attachments
    if (attachments && attachments.length > 0) {
      const tier = getRetentionTier(sender, recipient);
      for (const att of attachments) {
        await db.query(`INSERT INTO email_attachments (email_id, filename, mimetype, size, r2_key, content_id, disposition, retention_tier)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [emailId, att.filename, att.mimetype, att.size, att.r2_key, att.content_id, att.disposition || 'attachment', tier]);
      }
    }

    // Log
    await db.query(`INSERT INTO email_logs (email_id, direction, status, idempotency_key) VALUES ($1,'inbound','delivered',$2)`,
      [emailId, idempotency_key]);

    // Socket.IO notify
    if (user_id) {
      const io = req.app.get('io');
      if (io) {
        io.to(`user_${user_id}`).emit('new_email', {
          id: emailId, sender, subject, preview: (body_text || '').substring(0, 100)
        });
      }
    }

    res.json({ status: 'ok', email_id: emailId });
  } catch (err) {
    console.error('Webhook error:', err);
    console.error('Webhook error detail:', JSON.stringify(err, null, 2));
    res.status(500).json({ error: err.message, stack: err.stack });
  }
};

// ══════════════════════════════════════════════
// LIST EMAILS
// ══════════════════════════════════════════════
exports.listEmails = async (req, res) => {
  try {
    const { folder = 'inbox', status, page = 1, limit = 20 } = req.query;
    const userId = req.user?.id;
    const offset = (page - 1) * limit;

    let where = 'WHERE e.folder = $1';
    let params = [folder];
    let idx = 2;

    // Filter by user_id unless the user is Admin
    if (req.user?.role !== 'Admin' && req.user?.role !== 'Administrator') {
      where += ` AND e.user_id = $${idx}`;
      params.push(userId);
      idx++;
    }

    if (status) { where += ` AND e.status = $${idx}`; params.push(status); idx++; }

    // Group by thread, sort by latest message
    const result = await db.query(`
      SELECT e.*, 
        (SELECT COUNT(*) FROM emails e2 WHERE e2.thread_id = e.thread_id) as thread_count,
        (SELECT COUNT(*) FROM email_attachments ea WHERE ea.email_id = e.id) as attachment_count
      FROM emails e
      ${where}
      ORDER BY e.date DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, limit, offset]);

    const countResult = await db.query(`SELECT COUNT(*) FROM emails e ${where}`, params);

    res.json({
      emails: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit)
    });
  } catch (err) {
    console.error('List emails error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// GET SINGLE EMAIL
// ══════════════════════════════════════════════
exports.getEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM emails WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email not found' });

    const email = result.rows[0];

    // Get attachments
    const atts = await db.query('SELECT * FROM email_attachments WHERE email_id = $1', [id]);
    email.attachments = atts.rows;

    // Mark as read + log activity
    if (!email.is_read) {
      await db.query('UPDATE emails SET is_read = true WHERE id = $1', [id]);
    }
    await db.query('INSERT INTO email_activity_logs (email_id, user_id, action) VALUES ($1, $2, $3)',
      [id, req.user?.id, 'read']);

    res.json(email);
  } catch (err) {
    console.error('Get email error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// GET THREAD
// ══════════════════════════════════════════════
exports.getThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const result = await db.query(`
      SELECT e.*, 
        (SELECT json_agg(ea.*) FROM email_attachments ea WHERE ea.email_id = e.id) as attachments
      FROM emails e WHERE e.thread_id = $1 ORDER BY e.date ASC
    `, [threadId]);

    // Internal notes for this thread
    const notes = await db.query('SELECT n.*, u.name as user_name FROM email_internal_notes n LEFT JOIN users u ON n.user_id = u.id WHERE n.thread_id = $1 ORDER BY n.created_at ASC', [threadId]);

    res.json({ emails: result.rows, notes: notes.rows });
  } catch (err) {
    console.error('Get thread error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// SEND EMAIL (push to Cloudflare Worker outbound queue)
// ══════════════════════════════════════════════
exports.sendEmail = async (req, res) => {
  try {
    const { to, subject, body, body_text, cc, bcc, mailbox_address } = req.body;
    const userId = req.user?.id;

    // Check rate limit
    const rateResult = await db.query(`
      SELECT COUNT(*) FROM emails 
      WHERE mailbox_address = $1 AND folder = 'sent' AND date > NOW() - INTERVAL '1 minute'
    `, [mailbox_address]);
    
    const mbResult = await db.query('SELECT max_send_per_minute FROM email_mailboxes WHERE email_address = $1', [mailbox_address]);
    const maxRate = mbResult.rows[0]?.max_send_per_minute || 10;
    
    if (parseInt(rateResult.rows[0].count) >= maxRate) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait.' });
    }

    // Generate message ID
    const messageId = `<${crypto.randomUUID()}@fittour.vn>`;
    const threadId = crypto.createHash('sha1').update(messageId).digest('hex');

    // Save to DB as sent
    const result = await db.query(`
      INSERT INTO emails (user_id, mailbox_address, email_type, folder, subject, sender, recipient, cc, bcc,
        body, body_text, message_id, thread_id, normalized_subject, status, date)
      VALUES ($1,$2,'personal','sent',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'closed', NOW())
      RETURNING *
    `, [userId, mailbox_address, subject, mailbox_address, to, cc, bcc, body, body_text, messageId, threadId,
        (subject || '').replace(/^(Re|Fwd|Fw):\s*/gi, '').trim().toLowerCase()]);

    // Log activity
    await db.query('INSERT INTO email_activity_logs (email_id, user_id, action) VALUES ($1,$2,$3)',
      [result.rows[0].id, userId, 'send']);
    await db.query(`INSERT INTO email_logs (email_id, direction, status) VALUES ($1,'outbound','queued')`,
      [result.rows[0].id]);

    // TODO: Phase 2 — Call Cloudflare Worker outbound queue
    // For now, just save to DB

    res.json({ status: 'queued', email: result.rows[0] });
  } catch (err) {
    console.error('Send email error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// REPLY
// ══════════════════════════════════════════════
exports.replyEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { body, body_text, cc, bcc, mailbox_address } = req.body;
    const userId = req.user?.id;

    // Get original email
    const orig = await db.query('SELECT * FROM emails WHERE id = $1', [id]);
    if (orig.rows.length === 0) return res.status(404).json({ error: 'Original email not found' });
    const original = orig.rows[0];

    const messageId = `<${crypto.randomUUID()}@fittour.vn>`;
    const reSubject = original.subject?.startsWith('Re:') ? original.subject : `Re: ${original.subject}`;

    // Build references chain
    let refs = [];
    try { refs = JSON.parse(original.email_references || '[]'); } catch(e) { refs = []; }
    if (original.message_id && !refs.includes(original.message_id)) refs.push(original.message_id);

    const result = await db.query(`
      INSERT INTO emails (user_id, mailbox_address, email_type, folder, subject, sender, recipient, cc, bcc,
        body, body_text, message_id, in_reply_to, email_references, thread_id, normalized_subject, status, date)
      VALUES ($1,$2,'personal','sent',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'closed', NOW())
      RETURNING *
    `, [userId, mailbox_address, reSubject, mailbox_address, original.sender, cc, bcc, body, body_text,
        messageId, original.message_id, JSON.stringify(refs), original.thread_id, original.normalized_subject]);

    await db.query('INSERT INTO email_activity_logs (email_id, user_id, action, metadata) VALUES ($1,$2,$3,$4)',
      [result.rows[0].id, userId, 'reply', JSON.stringify({ original_email_id: id })]);
    await db.query(`INSERT INTO email_logs (email_id, direction, status) VALUES ($1,'outbound','queued')`,
      [result.rows[0].id]);

    res.json({ status: 'queued', email: result.rows[0] });
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// FORWARD
// ══════════════════════════════════════════════
exports.forwardEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { to, body_prefix, mailbox_address } = req.body;
    const userId = req.user?.id;

    const orig = await db.query('SELECT * FROM emails WHERE id = $1', [id]);
    if (orig.rows.length === 0) return res.status(404).json({ error: 'Email not found' });
    const original = orig.rows[0];

    const messageId = `<${crypto.randomUUID()}@fittour.vn>`;
    const fwdSubject = `Fwd: ${original.subject}`;
    const fwdBody = `${body_prefix || ''}\n\n---------- Forwarded message ----------\nFrom: ${original.sender}\nDate: ${original.date}\nSubject: ${original.subject}\n\n${original.body_text || original.body || ''}`;

    // Forward creates new thread
    const threadId = crypto.createHash('sha1').update(messageId).digest('hex');

    const result = await db.query(`
      INSERT INTO emails (user_id, mailbox_address, email_type, folder, subject, sender, recipient,
        body, body_text, message_id, thread_id, normalized_subject, status, date)
      VALUES ($1,$2,'personal','sent',$3,$4,$5,$6,$7,$8,$9,$10,'closed', NOW())
      RETURNING *
    `, [userId, mailbox_address, fwdSubject, mailbox_address, to, fwdBody, fwdBody,
        messageId, threadId, original.normalized_subject]);

    await db.query('INSERT INTO email_activity_logs (email_id, user_id, action, metadata) VALUES ($1,$2,$3,$4)',
      [result.rows[0].id, userId, 'forward', JSON.stringify({ original_email_id: id, forwarded_to: to })]);

    res.json({ status: 'queued', email: result.rows[0] });
  } catch (err) {
    console.error('Forward error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// UPDATE (read/star/status/assign)
// ══════════════════════════════════════════════
exports.updateEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read, is_starred, status, assigned_to, priority } = req.body;
    const fields = []; const vals = []; let idx = 1;

    if (is_read !== undefined) { fields.push(`is_read = $${idx}`); vals.push(is_read); idx++; }
    if (is_starred !== undefined) { fields.push(`is_starred = $${idx}`); vals.push(is_starred); idx++; }
    if (status) { fields.push(`status = $${idx}`); vals.push(status); idx++; if (status === 'closed') { fields.push(`resolved_at = NOW()`); } }
    if (assigned_to !== undefined) { fields.push(`assigned_to = $${idx}`); vals.push(assigned_to); idx++; }
    if (priority) { fields.push(`priority = $${idx}`); vals.push(priority); idx++; }

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    vals.push(id);
    const result = await db.query(`UPDATE emails SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, vals);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email not found' });

    // Log action
    const action = status ? status : (assigned_to ? 'assign' : 'update');
    await db.query('INSERT INTO email_activity_logs (email_id, user_id, action, metadata) VALUES ($1,$2,$3,$4)',
      [id, req.user?.id, action, JSON.stringify(req.body)]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update email error:', err);
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// MOVE FOLDER
// ══════════════════════════════════════════════
exports.moveEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const { folder } = req.body;
    const valid = ['inbox', 'sent', 'draft', 'archive', 'trash'];
    if (!valid.includes(folder)) return res.status(400).json({ error: 'Invalid folder' });

    const result = await db.query('UPDATE emails SET folder = $1 WHERE id = $2 RETURNING *', [folder, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Email not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// DELETE
// ══════════════════════════════════════════════
exports.deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM emails WHERE id = $1', [id]);
    res.json({ status: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// DRAFTS
// ══════════════════════════════════════════════
exports.saveDraft = async (req, res) => {
  try {
    const { id, to, subject, body, body_text, cc, bcc, mailbox_address } = req.body;
    const userId = req.user?.id;

    if (id) {
      const result = await db.query(`UPDATE emails SET subject=$1, recipient=$2, body=$3, body_text=$4, cc=$5, bcc=$6 WHERE id=$7 AND folder='draft' RETURNING *`,
        [subject, to, body, body_text, cc, bcc, id]);
      return res.json(result.rows[0]);
    }

    const result = await db.query(`
      INSERT INTO emails (user_id, mailbox_address, folder, subject, sender, recipient, cc, bcc, body, body_text, date)
      VALUES ($1,$2,'draft',$3,$4,$5,$6,$7,$8,$9, NOW()) RETURNING *
    `, [userId, mailbox_address, subject, mailbox_address, to, cc, bcc, body, body_text]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// SEARCH (Vietnamese full-text)
// ══════════════════════════════════════════════
exports.searchEmails = async (req, res) => {
  try {
    const { q, folder } = req.query;
    const userId = req.user?.id;
    if (!q) return res.status(400).json({ error: 'Query required' });

    let where = `WHERE e.user_id = $1 AND e.search_vector @@ plainto_tsquery('vietnamese', $2)`;
    let params = [userId, q];
    if (folder) { where += ' AND e.folder = $3'; params.push(folder); }

    const result = await db.query(`
      SELECT e.*, ts_rank(e.search_vector, plainto_tsquery('vietnamese', $2)) as rank
      FROM emails e ${where} ORDER BY rank DESC LIMIT 50
    `, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// UNREAD COUNT
// ══════════════════════════════════════════════
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user?.id;
    let query = 'SELECT folder, COUNT(*) as count FROM emails WHERE is_read = false';
    let params = [];

    if (req.user?.role !== 'Admin' && req.user?.role !== 'Administrator') {
      query += ' AND user_id = $1';
      params.push(userId);
    }
    
    query += ' GROUP BY folder';

    const result = await db.query(query, params);
    const counts = {};
    result.rows.forEach(r => { counts[r.folder] = parseInt(r.count); });
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// RATE CHECK (Worker gọi trước khi gửi)
// ══════════════════════════════════════════════
exports.rateCheck = async (req, res) => {
  try {
    const { mailbox } = req.query;
    const countResult = await db.query(`
      SELECT COUNT(*) FROM emails WHERE mailbox_address = $1 AND folder = 'sent' AND date > NOW() - INTERVAL '1 minute'
    `, [mailbox]);
    const mbResult = await db.query('SELECT max_send_per_minute FROM email_mailboxes WHERE email_address = $1', [mailbox]);
    const max = mbResult.rows[0]?.max_send_per_minute || 10;
    const current = parseInt(countResult.rows[0].count);
    res.json({ mailbox, current, max, allowed: current < max });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ══════════════════════════════════════════════
// MAILBOX ADMIN CRUD
// ══════════════════════════════════════════════
exports.listMailboxes = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT m.*, u.full_name as user_name FROM email_mailboxes m 
      LEFT JOIN users u ON m.user_id = u.id ORDER BY m.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createMailbox = async (req, res) => {
  try {
    const { email_address, user_id, display_name, signature, mailbox_type, max_send_per_minute } = req.body;
    const result = await db.query(`
      INSERT INTO email_mailboxes (email_address, user_id, display_name, signature, mailbox_type, max_send_per_minute)
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
    `, [email_address, user_id, display_name, signature, mailbox_type || 'personal', max_send_per_minute || 10]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateMailbox = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, display_name, signature, is_active, max_send_per_minute } = req.body;
    const result = await db.query(`
      UPDATE email_mailboxes SET user_id=COALESCE($1,user_id), display_name=COALESCE($2,display_name),
        signature=COALESCE($3,signature), is_active=COALESCE($4,is_active), max_send_per_minute=COALESCE($5,max_send_per_minute)
      WHERE id=$6 RETURNING *
    `, [user_id, display_name, signature, is_active, max_send_per_minute, id]);
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteMailbox = async (req, res) => {
  try {
    await db.query('DELETE FROM email_mailboxes WHERE id = $1', [req.params.id]);
    res.json({ status: 'deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
