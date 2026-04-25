const db = require('../../db');

module.exports = {
  declaration: {
    name: 'get_upcoming_birthdays',
    description: 'Lấy danh sách khách hàng có sinh nhật trong tháng này. Dùng cho CSKH chúc mừng hoặc gửi ưu đãi.',
    parameters: { type: 'OBJECT', properties: {}, required: [] },
  },

  handler: async () => {
    const result = await db.query(`
      SELECT name, phone, email, birth_date, customer_segment
      FROM customers
      WHERE birth_date IS NOT NULL AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
      ORDER BY EXTRACT(DAY FROM birth_date) ASC
    `);

    return {
      action: 'READ', status: 'SUCCESS',
      data: result.rows.map(c => ({
        name: c.name, phone: c.phone,
        birthday: c.birth_date ? new Date(c.birth_date).toLocaleDateString('vi-VN') : 'N/A',
        vip: c.customer_segment
      })),
      count: result.rows.length
    };
  }
};
