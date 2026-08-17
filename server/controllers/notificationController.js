const db = require('../db');
const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:it@fittour.vn',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

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
    const { timeRange, category } = req.query;

    let query = `
      SELECT n.*, l.bu_group, l.assigned_to 
      FROM user_notifications n
      LEFT JOIN leads l ON (n.type = 'NEW_LEAD' AND n.reference_id::text = l.id::text)
      WHERE n.user_id = $1
    `;
    const params = [userId];
    let paramIndex = 2;

    if (timeRange === 'today') {
      query += ` AND n.created_at >= CURRENT_DATE`;
    } else if (timeRange === 'yesterday') {
      query += ` AND n.created_at >= CURRENT_DATE - INTERVAL '1 day' AND n.created_at < CURRENT_DATE`;
    } else if (timeRange === 'this_week') {
      query += ` AND n.created_at >= date_trunc('week', CURRENT_DATE)`;
    } else if (timeRange === 'this_month') {
      query += ` AND n.created_at >= date_trunc('month', CURRENT_DATE)`;
    }

    if (category) {
      if (category === 'my_leads') {
        query += ` AND l.assigned_to = $${paramIndex++}`;
        params.push(userId);
      } else if (category === 'unassigned') {
        query += ` AND l.assigned_to IS NULL AND n.type = 'NEW_LEAD'`;
      } else if (category === 'unassigned_bu') {
        query += ` AND l.bu_group IS NULL AND n.type = 'NEW_LEAD'`;
      } else if (category.startsWith('BU')) {
        query += ` AND l.bu_group = $${paramIndex++}`;
        params.push(category);
      }
    }

    query += ` ORDER BY n.created_at DESC LIMIT 100`;

    const result = await db.query(query, params);

    // Get unread count with same filters? No, unread count can be global for badge
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

const subscribe = async (req, res) => {
  try {
      const { subscription } = req.body;
      const user_id = req.user.id;

      if (!subscription || !subscription.endpoint) {
          return res.status(400).json({ error: "Invalid subscription" });
      }

      await db.query(
          `INSERT INTO device_subscriptions (user_id, subscription_json) 
           VALUES ($1, $2) 
           ON CONFLICT (user_id, subscription_json) DO NOTHING`,
          [user_id, subscription]
      );

      res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ error: 'Server error' });
  }
};

const sendPushToUser = async (user_id, payload, pushType = null) => {
  try {
      if (pushType) {
          const userRes = await db.query('SELECT notification_preferences FROM users WHERE id = $1', [user_id]);
          const prefs = userRes.rows[0]?.notification_preferences || {};
          
          if (pushType === 'BU_LEAD' && prefs.push_bu_message === false) return;
          if (pushType === 'PERSONAL_ASSIGNMENT' && prefs.push_personal_assignment === false) return;
      }

      const result = await db.query(`SELECT subscription_json FROM device_subscriptions WHERE user_id = $1`, [user_id]);
      const subscriptions = result.rows;
      
      const promises = subscriptions.map(sub => {
          const pushSubscription = sub.subscription_json;
          return webpush.sendNotification(pushSubscription, JSON.stringify(payload)).catch(err => {
              if (err.statusCode === 404 || err.statusCode === 410) {
                  return db.query(`DELETE FROM device_subscriptions WHERE subscription_json = $1`, [pushSubscription]);
              } else {
                  console.error('Error sending push notification: ', err);
              }
          });
      });
      await Promise.all(promises);
  } catch (error) {
      console.error("sendPushToUser error:", error);
  }
};


const broadcastNewLead = async (lead, bu_group) => {
    try {
        if (!bu_group) return;
        // Lấy tất cả user thuộc bu_group
        const usersRes = await db.query(`SELECT id FROM users WHERE bu_group = $1 AND role IN ('sale', 'admin', 'manager')`, [bu_group]);
        const users = usersRes.rows;
        
        // Lấy thông tin chi tiết Lead (bao gồm tour/sản phẩm)
        const leadRes = await db.query(
            `SELECT l.*, t.name as tour_name 
             FROM leads l 
             LEFT JOIN tour_templates t ON l.tour_id = t.id 
             WHERE l.id = $1`, 
            [lead.id]
        );
        const fullLead = leadRes.rows[0] || {};
        const customerName = fullLead.name || lead.customer_name || 'Khách hàng';
        const tourName = fullLead.tour_name || 'Chưa rõ sản phẩm';
        
        const promises = users.map(async (u) => {
            const userId = u.id;
            const message = `Lead ${customerName}, nhu cầu ${tourName}, thuộc ${bu_group} của bạn.`;
            const title = 'Lead mới cần tiếp nhận';
            
            // Insert vào user_notifications
            const notifRes = await db.query(
                `INSERT INTO user_notifications (user_id, title, message, link, type, reference_id) 
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [userId, title, message, `/leads/${lead.id}`, 'NEW_LEAD', lead.id]
            );
            
            // Push Notification
            await sendPushToUser(userId, {
                title: title,
                body: message,
                url: `/inbox?psid=${lead.id}` 
            }, 'BU_LEAD');
            
            // Tạm thời có thể bắn socket ở đây nếu cần, nhưng frontend có thể pull
        });
        
        await Promise.all(promises);
    } catch (e) {
        console.error('broadcastNewLead Error:', e);
    }
};


const getGlobalCenterLeads = async (req, res) => {
  try {
    const { timeRange, category } = req.query;
    let query = `
      SELECT l.id, l.name, l.phone, l.email, l.source, l.status, l.assigned_to, l.bu_group, l.tour_id, l.created_at, l.last_contacted_at, 
             COALESCE(l.facebook_psid, l.zalo_uid) as source_id, l.facebook_psid, l.zalo_uid, u.full_name as assigned_to_name,
             (SELECT SUM(total_price) FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới', 'CANCELLED', 'EXPIRED'))::numeric as total_spent,
             CASE WHEN c.id IS NOT NULL THEN true ELSE false END as is_returning_customer
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      LEFT JOIN customers c ON l.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (timeRange === 'today') {
      query += ` AND (l.created_at >= CURRENT_DATE OR l.last_contacted_at >= CURRENT_DATE)`;
    } else if (timeRange === 'yesterday') {
      query += ` AND ((l.created_at >= CURRENT_DATE - INTERVAL '1 day' AND l.created_at < CURRENT_DATE) OR (l.last_contacted_at >= CURRENT_DATE - INTERVAL '1 day' AND l.last_contacted_at < CURRENT_DATE))`;
    } else if (timeRange === 'this_week') {
      query += ` AND (l.created_at >= date_trunc('week', CURRENT_DATE) OR l.last_contacted_at >= date_trunc('week', CURRENT_DATE))`;
    } else if (timeRange === 'this_month') {
      query += ` AND (l.created_at >= date_trunc('month', CURRENT_DATE) OR l.last_contacted_at >= date_trunc('month', CURRENT_DATE))`;
    }

    if (category) {
      if (category === 'my_leads') {
        query += ` AND l.assigned_to = $${paramIndex++}`;
        params.push(req.user.id);
      } else if (category === 'unassigned') {
        query += ` AND l.assigned_to IS NULL`;
      } else if (category === 'unassigned_bu') {
        query += ` AND l.bu_group IS NULL`;
      } else if (category !== 'all' && category.startsWith('BU')) {
        query += ` AND l.bu_group = $${paramIndex++}`;
        params.push(category);
      }
    }

    query += ` ORDER BY l.created_at DESC LIMIT 100`;

    const result = await db.query(query, params);

    // Map to notification format
    const formatted = result.rows.map(l => ({
        id: 'lead_' + l.id,
        reference_id: l.id,
        type: 'NEW_LEAD',
        title: l.assigned_to_name ? `Đã tiếp nhận` : `Lead mới`,
        message: l.name || 'Khách hàng',
        link: `/leads/${l.id}`,
        is_read: !!l.assigned_to_name,
        created_at: l.created_at,
        last_contacted_at: l.last_contacted_at,
        assigned_to: l.assigned_to,
        assigned_to_name: l.assigned_to_name,
        bu_group: l.bu_group,
        tour_id: l.tour_id,
        phone: l.phone,
        source: l.source,
        source_id: l.source_id,
        zalo_uid: l.zalo_uid,
        facebook_psid: l.facebook_psid,
        is_returning_customer: l.is_returning_customer,
        total_spent: l.total_spent
    }));

    res.json({
      notifications: formatted,
      unreadCount: 0
    });
  } catch (error) {
    console.error('[Notification Controller] getGlobalCenterLeads Error:', error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  getGlobalCenterLeads,
  broadcastNewLead,
  getDLQ,
  getSentLogs,
  getStats,
  replayDLQ,
  getSuppressionList,
  unbanEmail,
  getInAppNotifications,
  markAsRead,
  markAllAsRead,
  subscribe,
  sendPushToUser
};
