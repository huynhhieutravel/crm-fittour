const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'get_revenue_report',
    description: 'Lấy báo cáo doanh thu tổng quan: tổng lead, lead mới, lead chốt, doanh thu booking, số tour đang hoạt động. Có thể lọc theo khoảng thời gian.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        start_date: { type: Type.STRING, description: 'Ngày bắt đầu (YYYY-MM-DD). Mặc định: đầu tháng hiện tại.' },
        end_date: { type: Type.STRING, description: 'Ngày kết thúc (YYYY-MM-DD). Mặc định: hôm nay.' },
      },
      required: [],
    },
  },

  handler: async (args, user) => {
    // RBAC: Kiểm tra theo Permission phân quyền thực tế
    if (!user.perms?.costings?.view && !user.perms?.bookings?.view_all && user.role !== 'admin') {
      return {
        action: 'READ', status: 'WARNING',
        message: '❌ Xin lỗi sếp, chức năng báo cáo doanh thu yêu cầu quyền "Xem Dự toán (costings)" hoặc "Xem tất cả Bookings". Sếp chưa có các quyền này ạ.'
      };
    }

    const now = new Date();
    const startDate = args.start_date || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = args.end_date || now.toISOString().split('T')[0];
    const params = [startDate, endDate + ' 23:59:59'];

    const leadsRes = await db.query(`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'Mới') as new_leads,
             COUNT(*) FILTER (WHERE status = 'Chốt đơn') as won
      FROM leads WHERE created_at >= $1 AND created_at <= $2
    `, params);

    const revenueRes = await db.query(`
      SELECT COALESCE(SUM(total_price), 0) as revenue, COALESCE(SUM(paid), 0) as collected
      FROM bookings WHERE created_at >= $1 AND created_at <= $2 AND booking_status NOT IN ('Huỷ')
    `, params);

    const depsRes = await db.query(`SELECT COUNT(*) as active FROM tour_departures WHERE start_date >= CURRENT_DATE AND status != 'Huỷ'`);

    return {
      action: 'READ', status: 'SUCCESS',
      data: {
        period: `${startDate} → ${endDate}`,
        leads_total: parseInt(leadsRes.rows[0].total),
        leads_new: parseInt(leadsRes.rows[0].new_leads),
        leads_won: parseInt(leadsRes.rows[0].won),
        revenue: parseFloat(revenueRes.rows[0].revenue),
        collected: parseFloat(revenueRes.rows[0].collected),
        active_departures: parseInt(depsRes.rows[0].active)
      }
    };
  }
};
