const fs = require('fs');
let code = fs.readFileSync('server/controllers/notificationController.js', 'utf8');

const regex = /const getGlobalCenterLeads = async \(req, res\) => \{[\s\S]*?\n\};\n/m;
const newFunc = `const getGlobalCenterLeads = async (req, res) => {
  try {
    const { timeRange, category } = req.query;

    let query = \`
      SELECT l.id, l.name, l.phone, l.email, l.source, l.status, l.assigned_to, l.bu_group, l.created_at, u.name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE 1=1
    \`;
    const params = [];
    let paramIndex = 1;

    if (timeRange === 'today') {
      query += \` AND l.created_at >= CURRENT_DATE\`;
    } else if (timeRange === 'yesterday') {
      query += \` AND l.created_at >= CURRENT_DATE - INTERVAL '1 day' AND l.created_at < CURRENT_DATE\`;
    } else if (timeRange === 'this_week') {
      query += \` AND l.created_at >= date_trunc('week', CURRENT_DATE)\`;
    } else if (timeRange === 'this_month') {
      query += \` AND l.created_at >= date_trunc('month', CURRENT_DATE)\`;
    }

    if (category) {
      if (category === 'my_leads') {
        query += \` AND l.assigned_to = $\${paramIndex++}\`;
        params.push(req.user.id);
      } else if (category === 'unassigned') {
        query += \` AND l.assigned_to IS NULL\`;
      } else if (category.startsWith('BU')) {
        query += \` AND l.bu_group = $\${paramIndex++}\`;
        params.push(category);
      }
    }

    query += \` ORDER BY l.created_at DESC LIMIT 100\`;

    const result = await db.query(query, params);

    // Map to notification format
    const formatted = result.rows.map(l => ({
        id: 'lead_' + l.id,
        reference_id: l.id,
        type: 'NEW_LEAD',
        title: l.assigned_to_name ? \`Lead đã được tiếp nhận\` : \`Lead mới cần tiếp nhận\`,
        message: \`Có Lead mới vào \${l.bu_group || 'Hệ thống'}: \${l.name || 'Khách hàng'}\`,
        link: \`/leads/\${l.id}\`,
        is_read: !!l.assigned_to_name,
        created_at: l.created_at,
        assigned_to: l.assigned_to,
        assigned_to_name: l.assigned_to_name,
        bu_group: l.bu_group
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
`;

code = code.replace(regex, newFunc);
fs.writeFileSync('server/controllers/notificationController.js', code);
