const { Type } = require('@google/genai');
const db = require('../../db');

module.exports = {
  declaration: {
    name: 'check_tour_availability',
    description: `Kiểm tra tình trạng slot còn trống của tour. Tìm theo tên tour, thị trường, hoặc địa danh.
Khi nhân viên hỏi theo thị trường (VD: "Trung Quốc"), hãy truyền thêm các địa danh con vào mảng keywords.
VD: thị trường "Trung Quốc" → keywords: ["Trung Quốc", "Bắc Kinh", "Thượng Hải", "Giang Nam", "Hoành Vỹ"]
VD: thị trường "Nhật" → keywords: ["Nhật", "Tokyo", "Osaka", "Hokkaido", "Fuji"]
Dùng kiến thức tour_markets để mở rộng.`,
    parameters: {
      type: Type.OBJECT,
      properties: {
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'Mảng các từ khóa tìm kiếm tour (tên tour, thị trường, địa danh). VD: ["Trung Quốc", "Bắc Kinh", "Giang Nam"]'
        },
        months: {
          type: Type.ARRAY,
          items: { type: Type.NUMBER },
          description: 'Mảng các tháng cần kiểm tra (1-12). VD: [5, 6] cho tháng 5 và 6. Nếu không chỉ định thì tìm tất cả tương lai.'
        },
      },
      required: ['keywords'],
    },
  },

  handler: async (args) => {
    const { keywords, months } = args;

    // Build WHERE conditions cho nhiều keywords (dùng OR)
    const keywordConditions = keywords.map((_, i) => {
      const idx = i + 1;
      return `(tt.name ILIKE $${idx} OR td.market ILIKE $${idx} OR td.code ILIKE $${idx} OR td.tour_info->>'tour_name' ILIKE $${idx})`;
    }).join(' OR ');

    const params = keywords.map(k => `%${k}%`);

    let query = `
      SELECT td.id, td.code, COALESCE(tt.name, td.tour_info->>'tour_name') as tour_name,
             td.start_date, td.end_date, td.status, td.max_participants, td.market,
             COALESCE((SELECT SUM(b.pax_count) FROM bookings b WHERE b.tour_departure_id = td.id AND b.booking_status NOT IN ('Huỷ')), 0) as total_sold
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE td.status NOT IN ('Huỷ')
        AND td.start_date >= CURRENT_DATE
        AND (${keywordConditions})
    `;

    // Filter theo months (nếu có)
    if (months && months.length > 0) {
      const monthPlaceholders = months.map((_, i) => `$${params.length + i + 1}`).join(', ');
      query += ` AND EXTRACT(MONTH FROM td.start_date) IN (${monthPlaceholders})`;
      params.push(...months);
    }

    query += ` ORDER BY td.start_date ASC LIMIT 20`;

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      const monthStr = months && months.length > 0 ? ` tháng ${months.join(', ')}` : '';
      return { action: 'READ', status: 'NOT_FOUND', message: `Không tìm thấy tour nào khớp "${keywords.join(', ')}"${monthStr} trong tương lai.` };
    }

    return {
      action: 'READ', status: 'SUCCESS',
      data: result.rows.map(t => {
        const maxSlots = t.max_participants || 0;
        const sold = parseInt(t.total_sold);
        const available = maxSlots - sold;

        // Phân biệt: chưa cấu hình slot vs thật sự hết chỗ
        let slot_status;
        if (maxSlots === 0) {
          slot_status = 'Chưa cấu hình slot (liên hệ OP)';
        } else if (available <= 0) {
          slot_status = 'HẾT CHỖ';
        } else if (available <= 5) {
          slot_status = `Còn ${available} chỗ (sắp hết!)`;
        } else {
          slot_status = `Còn ${available} chỗ`;
        }

        return {
          id: t.id, // Bắt buộc phải có để API Booking hoạt động
          code: t.code,
          tour_name: t.tour_name,
          market: t.market || 'N/A',
          start_date: t.start_date ? new Date(t.start_date).toLocaleDateString('vi-VN') : 'N/A',
          end_date: t.end_date ? new Date(t.end_date).toLocaleDateString('vi-VN') : 'N/A',
          max_slots: maxSlots,
          sold,
          available: maxSlots === 0 ? 'Chưa cấu hình' : available,
          slot_status,
          status: t.status
        };
      }),
      count: result.rows.length
    };
  }
};
