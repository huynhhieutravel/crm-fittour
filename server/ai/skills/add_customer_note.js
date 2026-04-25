const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'add_customer_note',
    description: 'Thêm ghi chú cho một khách hàng đã có trong hệ thống. Ví dụ: "Khách dị ứng hải sản", "VIP hay cọc trễ".',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer_name_or_phone: { type: Type.STRING, description: 'Tên hoặc số điện thoại của khách để tìm kiếm' },
        note_content: { type: Type.STRING, description: 'Nội dung ghi chú cần thêm' },
      },
      required: ['customer_name_or_phone', 'note_content'],
    },
  },

  handler: async (args, user) => {
    const { customer_name_or_phone, note_content } = args;
    const custResult = await db.query(
      `SELECT id, name, phone FROM customers WHERE name ILIKE $1 OR phone ILIKE $1 ORDER BY created_at DESC LIMIT 3`,
      [`%${customer_name_or_phone}%`]
    );

    if (custResult.rows.length === 0) {
      return { action: 'WRITE', status: 'NOT_FOUND', message: `❌ Không tìm thấy khách hàng "${customer_name_or_phone}" trong hệ thống.` };
    }
    if (custResult.rows.length > 1) {
      const list = custResult.rows.map(c => `👤 ${c.name} (${c.phone || 'Không SĐT'})`).join('\n');
      return { action: 'WRITE', status: 'AMBIGUOUS', message: `Tìm thấy ${custResult.rows.length} khách trùng tên:\n${list}\nSếp cho em biết cụ thể hơn (SĐT) nhé!` };
    }

    const customer = custResult.rows[0];
    await db.query('INSERT INTO lead_notes (customer_id, content, created_by) VALUES ($1, $2, $3)', [customer.id, note_content, user ? user.id : null]);

    return { action: 'WRITE', status: 'SUCCESS', message: `✅ Đã thêm ghi chú cho khách "${customer.name}": "${note_content}"` };
  }
};
