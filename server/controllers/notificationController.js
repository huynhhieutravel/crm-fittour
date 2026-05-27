const db = require('../db');
const queueService = require('../services/queueService');

const getDLQ = async (req, res) => {
  try {
    const query = `
      SELECT id as log_id, status, error_message, updated_at,
             recipient_email as recipient, subject
      FROM notification_logs
      WHERE channel = 'email' 
        AND status IN ('failed', 'hard_failed', 'suppressed')
      ORDER BY updated_at DESC
      LIMIT 100
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('[Notification Controller] getDLQ Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getSentLogs = async (req, res) => {
  try {
    const query = `
      SELECT id as log_id, status, error_message, updated_at, created_at,
             recipient_email as recipient, subject, event_name, channel
      FROM notification_logs
      WHERE channel = 'email' 
      ORDER BY created_at DESC
      LIMIT 200
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('[Notification Controller] getSentLogs Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT status, COUNT(*) as count
      FROM notification_logs
      WHERE channel = 'email'
      GROUP BY status
    `;
    const result = await db.query(statsQuery);
    
    const stats = {
      sent: 0,
      failed: 0,
      suppressed: 0,
      pending: 0
    };

    result.rows.forEach(row => {
      if (row.status === 'sent') stats.sent += parseInt(row.count);
      else if (['failed', 'hard_failed'].includes(row.status)) stats.failed += parseInt(row.count);
      else if (row.status === 'suppressed') stats.suppressed += parseInt(row.count);
      else if (['pending', 'queued'].includes(row.status)) stats.pending += parseInt(row.count);
    });

    res.json(stats);
  } catch (error) {
    console.error('[Notification Controller] getStats Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const replayDLQ = async (req, res) => {
  res.status(400).json({ error: 'Replay tính năng đang được bảo trì sau khi chuyển sang hệ thống Queue mới.' });
};

const getSuppressionList = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM suppression_list ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('[Notification Controller] getSuppressionList Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const unbanEmail = async (req, res) => {
  const { email } = req.params;
  try {
    await db.query('DELETE FROM suppression_list WHERE email = $1', [email]);
    res.json({ message: `Đã mở khóa (unban) email: ${email}` });
  } catch (error) {
    console.error('[Notification Controller] unbanEmail Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const getInAppNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(
      'SELECT * FROM user_notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    const unreadCountRes = await db.query(
      'SELECT COUNT(*) FROM user_notifications WHERE user_id = $1 AND is_read = false',
      [userId]
    );
    
    res.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadCountRes.rows[0].count)
    });
  } catch (error) {
    console.error('[Notification Controller] getInAppNotifications Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = req.params.id;
    await db.query(
      'UPDATE user_notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [notifId, userId]
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('[Notification Controller] markAsRead Error:', error);
    res.status(500).json({ error: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    await db.query(
      'UPDATE user_notifications SET is_read = true WHERE user_id = $1',
      [userId]
    );
    res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error('[Notification Controller] markAllAsRead Error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDLQ,
  getSentLogs,
  getStats,
  replayDLQ,
  getSuppressionList,
  unbanEmail,
  getInAppNotifications,
  markAsRead,
  markAllAsRead
};
