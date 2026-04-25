const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'create_customer',
    description: 'Tạo mới một Khách hàng chính thức (Customer) trong hệ thống CRM. Dùng khi user yêu cầu "tạo khách hàng", thay vì "tạo lead".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Tên khách hàng (bắt buộc)' },
        phone: { type: Type.STRING, description: 'Số điện thoại khách' },
        email: { type: Type.STRING, description: 'Email khách (nếu có)' },
        notes: { type: Type.STRING, description: 'Ghi chú về khách hàng' },
      },
      required: ['name'],
    },
  },

  validate: async (args, user) => {
    const { phone } = args;
    if (phone && phone.trim() !== '') {
      const db = require('../../db');
      const existing = await db.query('SELECT id, name FROM customers WHERE phone = $1 ORDER BY created_at DESC LIMIT 1', [phone.trim()]);
      if (existing.rows.length > 0) {
        return {
          status: 'ERROR',
          message: `⚠️ **Trùng SĐT!** Khách hàng có SĐT ${phone} đã tồn tại với tên "${existing.rows[0].name}" (ID: ${existing.rows[0].id}). Em không tạo thêm để tránh trùng lặp. Sếp muốn tìm khách hàng này không?`
        };
      }
    }
    return { status: 'SUCCESS' };
  },

  handler: async (args, user) => {
    const { name, phone, email, notes } = args;
    const normalizedName = name ? name.toUpperCase().trim() : 'KHÁCH HÀNG MỚI';

    // Check trùng SĐT đã được xử lý ở validate

    // Prepare insert

    const result = await db.query(
      `INSERT INTO customers (name, phone, email, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [normalizedName, phone || null, email || null, notes || null]
    );

    return {
      action: 'WRITE', status: 'SUCCESS',
      message: `✅ Đã tạo Khách hàng (Customer) thành công!`,
      data: {
        id: result.rows[0].id,
        name: result.rows[0].name,
        phone: result.rows[0].phone
      }
    };
  }
};
