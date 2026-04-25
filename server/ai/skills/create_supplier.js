const db = require('../../db');
const { logActivity } = require('../../utils/logger');

module.exports = {
  declaration: {
    name: "create_supplier",
    description: "Tạo mới nhà cung cấp (Suppliers / Vendors). Định tuyến tự động vào đúng bảng (hotels, restaurants, airlines...).",
    parameters: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING", description: "Tên nhà cung cấp (Ví dụ: 'Nha Trang Lodge Hotel', 'Nhà xe Phương Trang')" },
        type: { 
          type: "STRING", 
          enum: ['hotels', 'restaurants', 'transports', 'airlines', 'tickets', 'landtours', 'insurances'],
          description: "Loại nhà cung cấp NHẤT ĐỊNH PHẢI CÓ để phân loại. Bạn PHẢI trả về đúng một trong các giá trị sau: 'hotels', 'restaurants', 'transports', 'airlines', 'tickets', 'landtours', 'insurances'." 
        },
        contact_person: { type: "STRING", description: "Người liên hệ (nếu có)" },
        phone: { type: "STRING", description: "Số điện thoại (nếu có)" },
        email: { type: "STRING", description: "Email (nếu có)" },
        notes: { type: "STRING", description: "Ghi chú, lời dặn dò bổ sung (nếu có)." }
      },
      required: ["name", "type"]
    }
  },
  handler: async (args, user) => {
    let { name, type, contact_person, phone, email, notes } = args;

    // RBAC: Check quyền cơ bản
    if (user.role !== 'admin' && !user.perms?.suppliers?.create) {
      return { action: 'CREATE', status: 'WARNING', message: '❌ Sếp ơi, tài khoản của sếp hiện chưa được cấp quyền Tạo Nhà Cung Cấp.' };
    }

    const validTables = ['hotels', 'restaurants', 'transports', 'airlines', 'tickets', 'landtours', 'insurances'];
    if (!validTables.includes(type)) {
        return { action: 'CREATE', status: 'ERROR', message: `Loại nhà cung cấp "${type}" không hợp lệ. Vui lòng thử lại.` };
    }

    try {
        const insertQuery = `
            INSERT INTO ${type} (
                name, contact_person, phone, email, notes, contract_status
            ) VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *
        `;

        const result = await db.query(insertQuery, [
            name, contact_person || null, phone || null, email || null, notes || null
        ]);
        
        const newDoc = result.rows[0];

        // Log
        await logActivity({
            user_id: user.id,
            action_type: 'CREATE',
            entity_type: type.toUpperCase(),
            entity_id: newDoc.id,
            details: `AI tạo mới Nhà Cung Cấp (${type}): ${name}`
        });

        return {
            action: 'CREATE', status: 'SUCCESS',
            message: `✅ Đã tạo Nhà Cung Cấp **${name}** vào danh sách \`${type}\` thành công!`,
            data: { id: newDoc.id, table: type }
        };

    } catch (err) {
        if (err.code === '23505') {
            return { action: 'CREATE', status: 'ERROR', message: `Nhà cung cấp **${name}** đã tồn tại trong ${type}.` };
        }
        return { action: 'CREATE', status: 'ERROR', message: `Lỗi hệ thống: ${err.message}` };
    }
  }
};
