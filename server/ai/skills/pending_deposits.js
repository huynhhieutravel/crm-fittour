const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'get_pending_deposits',
    description: 'Liệt kê các booking chưa đóng đủ tiền cọc hoặc chưa thanh toán. Dùng cho Kế toán hoặc Manager kiểm tra công nợ.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        status_filter: { type: Type.STRING, description: 'Lọc theo trạng thái: "unpaid" (chưa cọc), "partial" (cọc 1 phần). Mặc định: cả hai.' },
      },
      required: [],
    },
  },

  handler: async (args, user) => {
    // RBAC: Kiểm tra quyền xem bookings hoặc vouchers toàn cục
    if (user.role !== 'admin' && !user.perms?.bookings?.view_all && !user.perms?.vouchers?.view_all) {
      return {
        action: 'READ', status: 'WARNING',
        message: '❌ Sếp ơi, chức năng xem công nợ yêu cầu quyền Xem toàn bộ Booking/Phiếu thu. Account của sếp chưa được cấp quyền này ạ.'
      };
    }

    let statusFilter = "('unpaid', 'partial')";
    if (args.status_filter === 'unpaid') statusFilter = "('unpaid')";
    if (args.status_filter === 'partial') statusFilter = "('partial')";

    const result = await db.query(`
      SELECT b.booking_code, b.total_price, b.paid,
             c.name as customer_name, c.phone as customer_phone,
             COALESCE(tt.name, 'N/A') as tour_name, td.start_date
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE b.payment_status IN ${statusFilter} AND b.booking_status NOT IN ('Huỷ')
      ORDER BY td.start_date ASC LIMIT 20
    `);

    return {
      action: 'READ', status: 'SUCCESS',
      data: result.rows.map(b => ({
        code: b.booking_code, customer: b.customer_name, phone: b.customer_phone,
        tour: b.tour_name,
        departure: b.start_date ? new Date(b.start_date).toLocaleDateString('vi-VN') : 'N/A',
        total: Number(b.total_price), paid: Number(b.paid),
        remaining: Number(b.total_price) - Number(b.paid)
      })),
      count: result.rows.length
    };
  }
};
