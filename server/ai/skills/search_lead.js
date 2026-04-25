const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'search_lead',
    description: `Tìm kiếm Lead (khách hàng tiềm năng) theo tên, số điện thoại, hoặc mã lead.
QUAN TRỌNG: Skill này tìm trong bảng LEADS (khách tiềm năng chưa chốt).
Khác với search_customer (tìm trong bảng khách đã đi tour).
Dùng khi nhân viên muốn: mở lead cũ, tìm lead, check lead, xem lead.`,
    parameters: {
      type: Type.OBJECT,
      properties: {
        keyword: { type: Type.STRING, description: 'Tên, SĐT, hoặc mã lead cần tìm' },
      },
      required: ['keyword'],
    },
  },

  handler: async (args, user) => {
    const { keyword } = args;
    
    // RBAC: Check quyền cơ bản
    if (user.role !== 'admin' && !user.perms?.leads?.view_all && !user.perms?.leads?.view_own) {
      return { action: 'READ', status: 'WARNING', message: '❌ Sếp ơi, tài khoản của sếp hiện chưa được cấp quyền truy cập/tra cứu thông tin Lead ạ.' };
    }

    // Khác với trước đây, AI sẽ query TOÀN BỘ hệ thống để biết tổng số liệu có keyword này
    const result = await db.query(`
      SELECT l.id, l.name, l.phone, l.email, l.source, l.status, l.classification,
             l.consultation_note, l.bu_group, l.created_at, l.assigned_to,
             u.full_name as assigned_to_name
      FROM leads l
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE (l.name ILIKE $1 OR l.phone ILIKE $1)
      ORDER BY l.created_at DESC LIMIT 10
    `, [`%${keyword}%`]);

    if (result.rows.length === 0) {
      return { action: 'READ', status: 'NOT_FOUND', message: `Không tìm thấy lead nào khớp "${keyword}" trong hệ thống.` };
    }

    // RBAC Logic Masking: Tách dữ liệu được xem và dữ liệu bị ẩn
    const canViewAll = user.role === 'admin' || user.role?.includes('manager') || user.perms?.leads?.view_all;
    let accessibleLeads = [];
    let restrictedCount = 0;

    for (let row of result.rows) {
       // Chỉ cho phép nếu có view_all hoặc user.id = l.assigned_to
       if (canViewAll || row.assigned_to === user.id) {
           accessibleLeads.push(row);
       } else {
           restrictedCount++;
       }
    }

    if (accessibleLeads.length === 0 && restrictedCount > 0) {
       return { action: 'READ', status: 'RESTRICTED', message: `📌 Tìm thấy ${restrictedCount} khách hàng tiềm năng khớp "${keyword}", nhưng sếp không có quyền xem thông tin chi tiết vì các lead này đang được Sales khác quản lý.` };
    }

    let messageStr = `Đã tìm thấy tổng cộng ${result.rows.length} lead.`;
    if (restrictedCount > 0) {
       messageStr = `Đã tìm thấy ${result.rows.length} lead tên "${keyword}". Sếp có quyền xem chi tiết ${accessibleLeads.length} lead, bị ẩn ${restrictedCount} lead do Sales khác quản lý.`;
    } else {
       messageStr = `Đã tìm thấy ${accessibleLeads.length} lead khớp "${keyword}" hợp lệ với quyền của sếp.`;
    }

    return {
      action: 'READ', status: 'SUCCESS',
      message: messageStr,
      data: accessibleLeads.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone || 'N/A',
        email: l.email || 'N/A',
        source: l.source,
        status: l.status,
        classification: l.classification,
        note: l.consultation_note,
        bu: l.bu_group,
        assigned_to: l.assigned_to_name || 'Chưa gán',
        created_at: l.created_at ? new Date(l.created_at).toLocaleDateString('vi-VN') : 'N/A'
      })),
      count: accessibleLeads.length
    };
  }
};
