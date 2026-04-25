const db = require('../../db');

module.exports = {
  declaration: {
    name: "search_supplier",
    description: "Tra cứu hệ thống Nhà cung cấp (Suppliers / Vendors). Dùng khi user muốn tìm kiếm số điện thoại, giá cả, email của các đối tác: Khách sạn, Nhà hàng, Hãng xe, Hãng bay, Landtour...",
    parameters: {
      type: "OBJECT",
      properties: {
        keyword: {
          type: "STRING",
          description: "Tên nhà cung cấp, số điện thoại, email hoặc mã cần tìm (ví dụ: 'Phương Trang', 'Local Star', 'Bamboo')."
        },
        type: {
          type: "STRING",
          description: "Loại nhà cung cấp nếu có nhắc đến. (Trả về 1 trong các giá trị: 'hotels', 'restaurants', 'transports', 'airlines', 'tickets', 'landtours', 'insurances'). Mặc định là 'all' nếu không rõ."
        }
      },
      required: ["keyword"]
    }
  },
  handler: async (args, user) => {
    let { keyword, type = 'all' } = args;

    // RBAC
    if (user.role !== 'admin' && !user.perms?.suppliers?.view) {
      return { action: 'READ', status: 'WARNING', message: '❌ Sếp ơi, tài khoản của sếp hiện chưa được cấp quyền truy cập Nhà Cung Cấp ạ.' };
    }

    const tables = ['hotels', 'restaurants', 'transports', 'airlines', 'tickets', 'landtours', 'insurances'];
    const searchTables = tables.includes(type) ? [type] : tables;

    let allResults = [];

    for (const tbl of searchTables) {
        try {
            const query = `
                SELECT id, name, phone, email, contract_status, contact_person
                FROM ${tbl}
                WHERE name ILIKE $1 OR phone ILIKE $1 OR email ILIKE $1
                LIMIT 5
            `;
            const res = await db.query(query, [`%${keyword}%`]);
            if (res.rows.length > 0) {
                res.rows.forEach(r => allResults.push({ ...r, _table: tbl }));
            }
        } catch (e) {
            // bỏ qua lỗi nếu table chưa sẵn sàng
        }
    }

    if (allResults.length === 0) {
        return { action: 'READ', status: 'NOT_FOUND', message: `Không tìm thấy nhà cung cấp nào khớp với "${keyword}".` };
    }

    // Tối ưu Token
    return {
        action: 'READ', status: 'SUCCESS',
        message: `Đã tìm thấy ${allResults.length} nhà cung cấp có chứa "${keyword}".`,
        data: allResults
    };
  }
};
