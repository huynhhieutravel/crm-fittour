const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'search_customer',
    description: 'Tìm kiếm khách hàng theo tên hoặc số điện thoại. Trả về thông tin chi tiết: tên, SĐT, email, phân khúc VIP, tổng chuyến đi, ghi chú mới nhất.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        keyword: { type: Type.STRING, description: 'Tên hoặc số điện thoại cần tìm' },
      },
      required: ['keyword'],
    },
  },

  handler: async (args, user) => {
    const { keyword } = args;

    // RBAC: Giới hạn theo dữ liệu
    if (user.role !== 'admin' && !user.perms?.customers?.view_all && !user.perms?.customers?.view_own) {
      return { action: 'READ', status: 'WARNING', message: '❌ Sếp ơi, tài khoản của sếp hiện chưa được cấp quyền truy cập/tra cứu thông tin Khách hàng (Customers) ạ.' };
    }
    const result = await db.query(`
      SELECT c.id, c.name, c.phone, c.email, c.customer_segment, c.address,
             c.special_requests, c.internal_notes, c.tour_interests,
             COALESCE(c.past_trip_count, 0) as past_trips,
             COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as crm_trips,
             (SELECT content FROM lead_notes WHERE customer_id = c.id ORDER BY created_at DESC LIMIT 1) as latest_note
      FROM customers c
      WHERE c.name ILIKE $1 OR c.phone ILIKE $1
      ORDER BY c.created_at DESC LIMIT 5
    `, [`%${keyword}%`]);

    if (result.rows.length === 0) {
      return { action: 'READ', status: 'NOT_FOUND', message: `Không tìm thấy khách hàng nào khớp với "${keyword}".` };
    }

    return {
      action: 'READ', status: 'SUCCESS',
      data: result.rows.map(c => ({
        id: c.id, // Bắt buộc phải có để API Booking hoạt động
        name: c.name, phone: c.phone || 'N/A', email: c.email || 'N/A',
        vip: c.customer_segment, total_trips: parseInt(c.past_trips) + parseInt(c.crm_trips),
        interests: c.tour_interests, special: c.special_requests,
        notes: c.internal_notes, latest_note: c.latest_note
      })),
      count: result.rows.length
    };
  }
};
