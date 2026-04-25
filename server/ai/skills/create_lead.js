const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'create_lead',
    description: 'Tạo mới một Lead (khách hàng tiềm năng) trong hệ thống CRM. Dùng khi nhân viên muốn ghi nhận khách mới từ các kênh tư vấn.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Tên khách hàng (bắt buộc)' },
        phone: { type: Type.STRING, description: 'Số điện thoại khách' },
        email: { type: Type.STRING, description: 'Email khách (nếu có)' },
        source: { 
          type: Type.STRING, 
          enum: ['Messenger', 'Hotline', 'Zalo', 'Website', 'Walk-in', 'Referral'],
          description: 'Nguồn lead: Messenger, Hotline, Zalo, Website, Walk-in, Referral. Mặc định: Hotline' 
        },
        consultation_note: { type: Type.STRING, description: 'Ghi chú tư vấn ban đầu, ví dụ: "Khách quan tâm tour Thái, đi 2 người"' },
        bu_group: { 
          type: Type.STRING, 
          enum: ['BU1', 'BU2', 'BU3', 'BU4'],
          description: 'Nhóm BU (Business Unit): BU1, BU2, BU3, BU4 (nếu biết)' 
        },
      },
      required: ['name'],
    },
  },

  validate: async (args, user) => {
    const { phone } = args;
    if (phone && phone.trim() !== '') {
      const db = require('../../db');
      const existing = await db.query('SELECT id, name FROM leads WHERE phone = $1 ORDER BY created_at DESC LIMIT 1', [phone.trim()]);
      if (existing.rows.length > 0) {
        return {
          status: 'ERROR',
          message: `⚠️ **Trùng SĐT!** Số điện thoại ${phone} đã tồn tại ở Lead "${existing.rows[0].name}" (ID: ${existing.rows[0].id}). Em không tạo thêm để tránh trùng lặp dữ liệu. Sếp muốn cập nhật Lead cũ hoặc tạo Booking cho khách này không?`
        };
      }
    }
    return { status: 'SUCCESS' };
  },

  handler: async (args, user) => {
    let { name, phone, email, source, consultation_note, bu_group } = args;
    const normalizedName = name ? name.toUpperCase().trim() : 'KHÁCH HÀNG MỚI';
    
    // Strict Enum Fallbacks
    const validSources = ['Messenger', 'Hotline', 'Zalo', 'Website', 'Walk-in', 'Referral'];
    if (!validSources.includes(source)) source = 'Hotline';
    
    const validBUs = ['BU1', 'BU2', 'BU3', 'BU4'];
    if (bu_group && !validBUs.includes(bu_group)) bu_group = null;

    // Check trùng SĐT đã được xử lý ở validate

    const result = await db.query(
      `INSERT INTO leads (name, phone, email, source, consultation_note, bu_group, status, classification, assigned_to, last_contacted_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'Mới', 'Mới', $7, $8) RETURNING *`,
      [normalizedName, phone || null, email || null, source || 'Hotline',
       consultation_note || null, bu_group || null,
       user ? user.id : null, new Date()]
    );

    return {
      action: 'WRITE', status: 'SUCCESS',
      message: `✅ Đã tạo Lead mới thành công!`,
      data: {
        id: result.rows[0].id, name: result.rows[0].name,
        phone: result.rows[0].phone, source: result.rows[0].source,
        status: result.rows[0].status, note: result.rows[0].consultation_note
      }
    };
  }
};
