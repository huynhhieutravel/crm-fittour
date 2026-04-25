const db = require('../../db');
const { logActivity } = require('../../utils/logger');

module.exports = {
  declaration: {
    name: "create_op_tour",
    description: "Tạo Lịch Khởi Hành (Tour Departure / Op Tour) mới. Thường dùng khi user nói 'Lên lịch', 'Tạo ngày khởi hành', 'Mở bán tour'.",
    parameters: {
      type: "OBJECT",
      properties: {
        tour_name: {
          type: "STRING",
          description: "Tên của Tour khởi hành (Ví dụ: Tour Thái Lan 5N4Đ, Tour Nhật Bản)."
        },
        code: {
          type: "STRING",
          description: "Mã lịch khởi hành (Ví dụ: THAI-0106, NRT-2503). Nếu user không cung cấp, hãy tự sinh mã theo dạng: TênTourVietTat-NgayThang (Ví dụ: TLA-0106)."
        },
        start_date: {
          type: "STRING",
          description: "Ngày khởi hành (Định dạng YYYY-MM-DD)."
        },
        end_date: {
          type: "STRING",
          description: "Ngày kết thúc (Định dạng YYYY-MM-DD)."
        },
        total_seats: {
          type: "INTEGER",
          description: "Tổng số chỗ (max_participants). Mặc định là 20 nếu user không nói rõ."
        },
        market: {
          type: "STRING",
          enum: ['Inbound', 'Outbound', 'Domestic', 'Đoàn', 'Khác'],
          description: "Thị trường. Chỉ được phép trả về: 'Inbound', 'Outbound', 'Domestic', 'Đoàn'. Mặc định: 'Khác'."
        }
      },
      required: ["tour_name", "start_date"]
    }
  },
  validate: async (args, user) => {
    const { tour_name, start_date, end_date } = args;
    
    // Check ngày tháng nghịch lý
    if (start_date && end_date) {
      if (new Date(end_date) < new Date(start_date)) {
        return {
          status: 'ERROR',
          message: `❌ Lỗi thời không: Ngày về (${end_date}) sao lại nằm TRƯỚC ngày đi (${start_date}) được sếp ơi!`
        };
      }
    }

    // Kiểm tra DB thử xem tour_name có tồn tại không
    const db = require('../../db');
    const tSearch = await db.query('SELECT id, name FROM tour_templates WHERE name ILIKE $1 LIMIT 1', [`%${tour_name}%`]);
    if (tSearch.rows.length === 0) {
      return { 
         status: 'ERROR', 
         message: `❌ Không tìm thấy Sản phẩm Tour gốc nào có chữ "${tour_name}". Sếp kiểm tra lại đúng tên Tour hoặc thêm vào danh mục trước khi mở lịch nhé!` 
      };
    }
    return { status: 'SUCCESS' };
  },
  handler: async (args, user) => {
    let { 
        tour_name, 
        code, 
        start_date, 
        end_date, 
        total_seats = 20, 
        market = 'Khác' 
    } = args;

    // RBAC: Kiểm tra quyền
    if (user.role !== 'admin' && !user.perms?.op_tours?.create) {
      return { action: 'CREATE', status: 'WARNING', message: '❌ Cảnh báo hệ thống: Tài khoản của bạn không được cấp quyền Tạo Lịch Khởi Hành (Op Tours).' };
    }

    try {
        if (!code) {
           const rand = Math.floor(100 + Math.random() * 900);
           const dateStr = start_date ? start_date.split('-').join('').slice(4, 8) : '0000';
           code = `TOUR-${dateStr}-${rand}`;
        }

        const validMarkets = ['Inbound', 'Outbound', 'Domestic', 'Đoàn', 'Khác'];
        if (!validMarkets.includes(market)) {
           market = 'Khác';
        }

        const tour_info = {
            total_seats: total_seats
        };

        // Auto-lookup tour_template_id by tour_name
        const tSearch = await db.query('SELECT id, name FROM tour_templates WHERE name ILIKE $1 LIMIT 1', [`%${tour_name}%`]);
        if (tSearch.rows.length === 0) {
             return { action: 'CREATE', status: 'ERROR', message: `Không tìm thấy Sản phẩm Tour (Template) nào có tên chứa "${tour_name}". Vui lòng sử dụng một tên Tour gốc đã có trong hệ thống hoặc dùng lệnh tra cứu Tour trước.` };
        }
        const tour_template_id = tSearch.rows[0].id;
        const actual_tour_name = tSearch.rows[0].name;

        const insertQuery = `
            INSERT INTO tour_departures (
                code, tour_template_id, start_date, end_date, market, status, 
                tour_info, max_participants
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `;

        const result = await db.query(insertQuery, [
            code, tour_template_id, start_date || null, end_date || null, market, 'Mở bán', 
            JSON.stringify(tour_info), total_seats
        ]);
        
        const newTour = result.rows[0];

        // Log Activity
        await logActivity({
            user_id: user.id,
            action_type: 'CREATE',
            entity_type: 'OP_TOUR',
            entity_id: newTour.id,
            details: `AI tạo Lịch Khởi Hành ${code} (${total_seats} chỗ)`
        });

        return {
            action: 'CREATE', status: 'SUCCESS',
            message: `🎉 Đã tạo Lịch Khởi Hành thành công! \n\n**Tên Tour Gốc:** ${actual_tour_name}\n**Mã Khởi Hành:** ${newTour.code}\n**Khởi hành:** ${start_date || 'Chưa định'}\n**Số chỗ:** ${total_seats}\n**Trạng thái:** Mở bán`,
            data: {
                id: newTour.id,
                code: newTour.code,
                start_date: newTour.start_date
            }
        };

    } catch (err) {
        if (err.code === '23505') {
            return { action: 'CREATE', status: 'ERROR', message: `Mã tour **${code}** đã tồn tại trong hệ thống. Vui lòng chọn mã khác.` };
        }
        return { action: 'CREATE', status: 'ERROR', message: `Lỗi hệ thống: ${err.message}` };
    }
  }
};
