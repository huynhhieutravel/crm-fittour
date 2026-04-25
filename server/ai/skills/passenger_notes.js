const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'get_departure_passenger_notes',
    description: 'Lấy danh sách khách và ghi chú đặc biệt của một chuyến khởi hành cụ thể. Dùng trước khi tour bay để check khách cần lưu ý gì (dị ứng, VIP, trẻ em...).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        tour_keyword: { type: Type.STRING, description: 'Tên tour hoặc mã lịch khởi hành để tìm' },
      },
      required: ['tour_keyword'],
    },
  },

  handler: async (args) => {
    const { tour_keyword } = args;
    const depResult = await db.query(`
      SELECT td.id, td.code, COALESCE(tt.name, td.tour_info->>'tour_name') as tour_name, td.start_date
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE (tt.name ILIKE $1 OR td.code ILIKE $1 OR td.tour_info->>'tour_name' ILIKE $1)
        AND td.start_date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY td.start_date ASC LIMIT 1
    `, [`%${tour_keyword}%`]);

    if (depResult.rows.length === 0) {
      return { action: 'READ', status: 'NOT_FOUND', message: `Không tìm thấy lịch khởi hành nào khớp "${tour_keyword}".` };
    }

    const dep = depResult.rows[0];
    const paxResult = await db.query(`
      SELECT c.name, c.phone, c.special_requests, c.internal_notes, b.notes as booking_notes, b.booking_status
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.tour_departure_id = $1 AND b.booking_status NOT IN ('Huỷ')
      ORDER BY c.name ASC
    `, [dep.id]);

    return {
      action: 'READ', status: 'SUCCESS',
      tour: { code: dep.code, name: dep.tour_name, date: dep.start_date ? new Date(dep.start_date).toLocaleDateString('vi-VN') : 'N/A' },
      data: paxResult.rows.map(p => ({
        name: p.name, phone: p.phone, status: p.booking_status,
        special: p.special_requests || '', notes: p.internal_notes || '',
        booking_notes: p.booking_notes || ''
      })),
      count: paxResult.rows.length
    };
  }
};
