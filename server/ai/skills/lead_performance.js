const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'get_lead_performance',
    description: 'Báo cáo hiệu suất Sale: mỗi nhân viên nhận bao nhiêu lead, chốt bao nhiêu đơn. Có thể lọc theo khoảng thời gian và BU.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        start_date: { type: Type.STRING, description: 'Ngày bắt đầu (YYYY-MM-DD)' },
        end_date: { type: Type.STRING, description: 'Ngày kết thúc (YYYY-MM-DD)' },
        bu_group: { type: Type.STRING, description: 'Lọc theo BU: BU1, BU2, BU3...' },
      },
      required: [],
    },
  },

  handler: async (args, user) => {
    const now = new Date();
    const startDate = args.start_date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = args.end_date || now.toISOString().split('T')[0];
    const params = [startDate, endDate + ' 23:59:59'];

    let buFilter = '';
    if (args.bu_group) {
      params.push(args.bu_group);
      buFilter = `AND l.bu_group = $${params.length}`;
    }
    let userFilter = '';
    if (user.role !== 'admin' && !user.perms?.leads?.view_all) {
      params.push(user.id);
      userFilter = `AND u.id = $${params.length}`;
    }

    const result = await db.query(`
      SELECT u.full_name,
             COUNT(l.id)::int as total_leads,
             COUNT(CASE WHEN l.status = 'Chốt đơn' THEN 1 END)::int as won_leads
      FROM users u
      JOIN roles r ON u.role_id = r.id
      LEFT JOIN leads l ON u.id = l.assigned_to AND l.created_at >= $1 AND l.created_at <= $2 ${buFilter}
      WHERE r.name IN ('sales', 'sales_lead', 'manager', 'admin')
      ${userFilter}
      GROUP BY u.id, u.full_name
      HAVING COUNT(l.id) > 0
      ORDER BY total_leads DESC
    `, params);

    return {
      action: 'READ', status: 'SUCCESS',
      period: `${startDate} → ${endDate}`,
      data: result.rows.map(r => ({
        name: r.full_name, total: r.total_leads, won: r.won_leads,
        rate: r.total_leads > 0 ? Math.round(r.won_leads / r.total_leads * 100) + '%' : '0%'
      })),
      count: result.rows.length
    };
  }
};
