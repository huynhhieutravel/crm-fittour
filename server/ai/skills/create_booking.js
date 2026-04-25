const db = require('../../db');
const { logActivity } = require('../../utils/logger');

module.exports = {
  declaration: {
    name: "create_booking",
    description: "Tạo Giữ chỗ (Booking) mới cho 1 Khách hàng vào 1 Lịch Khởi Hành (Tour Departure). Dùng khi User yêu cầu 'Giới chỗ', 'Tạo booking', 'Book tour'.",
    parameters: {
      type: "OBJECT",
      properties: {
        customer_id: {
          type: "INTEGER",
          description: "ID của Khách hàng (bắt buộc). NGUYÊN TẮC: Nếu chưa biết ID, phải gọi hàm search_customer tìm trước. Nếu khách chưa tồn tại, gọi create_customer trước."
        },
        tour_departure_id: {
          type: "INTEGER",
          description: "ID của Lịch Khởi Hành (bắt buộc). Dùng hàm check_tour để tìm ID lịch khởi hành chính xác trước khi tạo booking."
        },
        pax_count: {
          type: "INTEGER",
          description: "Số lượng khách (chỗ cần giữ). Mặc định 1."
        },
        customer_name: {
          type: "STRING",
          description: "Tên hiển thị của khách hàng (chỉ dùng để in ra màn hình cho con người check lại)."
        },
        tour_name: {
          type: "STRING",
          description: "Tên hiển thị của Tour (chỉ dùng để in ra màn hình cho con người check lại)."
        },
        total_price: {
          type: "INTEGER",
          description: "Tổng tiền của Booking này (dựa trên trao đổi với hệ thống/khách hàng). Nếu không rõ, gửi 0."
        },
        initial_deposit_amount: {
          type: "INTEGER",
          description: "Tiền đặt cọc ban đầu ngay lúc tạo (nếu có khách chuyển khoản/tiền mặt luôn). Nếu không ai nhắc tới, gửi 0."
        },
        notes: {
          type: "STRING",
          description: "Ghi chú dành cho booking (nếu có)."
        }
      },
      required: ["customer_id", "customer_name", "tour_departure_id", "tour_name", "pax_count"]
    }
  },
  handler: async (args, user) => {
    const { 
        customer_id, 
        tour_departure_id, 
        pax_count = 1, 
        total_price = 0, 
        initial_deposit_amount = 0,
        notes = null
    } = args;

    // RBAC: Kiểm tra quyền
    if (user.role !== 'admin' && !user.perms?.bookings?.create) {
      return { action: 'CREATE', status: 'WARNING', message: '❌ Sếp ơi, tài khoản của sếp hiện chưa được cấp quyền Tạo Booking (Giữ chỗ) ạ.' };
    }

    try {
        // Sinh mã Booking FT-YYYYMMDD-XXXX
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const rand = Math.floor(1000 + Math.random() * 9000);
        const bookingCode = `FT-${dateStr}-${rand}`;

        // Lấy thông tin start_date và tour_id từ tour_departures
        const tourCheck = await db.query('SELECT tour_template_id, start_date FROM tour_departures WHERE id = $1', [tour_departure_id]);
        if (tourCheck.rows.length === 0) {
            return { action: 'CREATE', status: 'ERROR', message: `Không tìm thấy Lịch khởi hành với ID ${tour_departure_id}.` };
        }
        const tInfo = tourCheck.rows[0];

        // Lấy Khách hàng
        const cusCheck = await db.query('SELECT name FROM customers WHERE id = $1', [customer_id]);
        if (cusCheck.rows.length === 0) {
            return { action: 'CREATE', status: 'ERROR', message: `Không tìm thấy Khách hàng với ID ${customer_id}.` };
        }

        // Tạo Booking
        const insertQuery = `
            INSERT INTO bookings (
                booking_code, customer_id, tour_id, tour_departure_id, start_date, 
                pax_count, total_price, payment_status, booking_status, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
        `;
        const result = await db.query(insertQuery, [
            bookingCode, customer_id, tInfo.tour_template_id || null, tour_departure_id, tInfo.start_date,
            pax_count, total_price, 'unpaid', 'Mới', notes
        ]);
        const newBooking = result.rows[0];

        // Logic thu cọc nếu có
        if (initial_deposit_amount && Number(initial_deposit_amount) > 0) {
            await db.query(`
                INSERT INTO booking_transactions (booking_id, amount, payment_method, transaction_date, notes, created_by)
                VALUES ($1, $2, $3, CURRENT_DATE, $4, $5)
            `, [
                newBooking.id, 
                Number(initial_deposit_amount), 
                'CASH', 
                'Thu cọc lúc khởi tạo qua AI Copilot',
                user.id
            ]);
            
            const depositAmt = Number(initial_deposit_amount);
            const tPrice = Number(total_price);
            let finalStatus = 'unpaid';
            if (depositAmt >= tPrice && tPrice > 0) finalStatus = 'paid';
            else if (depositAmt > 0) finalStatus = 'partial';

            if (finalStatus !== 'unpaid') {
                await db.query("UPDATE bookings SET payment_status = $1 WHERE id = $2", [finalStatus, newBooking.id]);
                newBooking.payment_status = finalStatus;
            }
        }

        // Cập nhật count booking trong lịch khởi hành để giữ chỗ (hỗ trợ hiển thị Dashboard)
        try {
            await db.query('UPDATE tour_departures SET booked_seats = COALESCE(booked_seats, 0) + $1 WHERE id = $2', [pax_count, tour_departure_id]);
        } catch(e) {
            // bỏ qua nếu schema ko có cột booked_seats, đây là backup logic
        }

        // Log Activity
        await logActivity({
            user_id: user.id,
            action_type: 'CREATE',
            entity_type: 'BOOKING',
            entity_id: newBooking.id,
            details: `AI tạo Booking giữ chỗ ${pax_count} khách cho ${cusCheck.rows[0].name}`
        });

        return {
            action: 'CREATE', status: 'SUCCESS',
            message: `🎉 Đã tạo thành công Booking mã **${newBooking.booking_code}** giữ ${pax_count} chỗ cho khách ${cusCheck.rows[0].name}.`,
            data: {
                id: newBooking.id,
                booking_code: newBooking.booking_code,
                pax_count: newBooking.pax_count,
                total_price: newBooking.total_price,
                status: newBooking.booking_status,
                payment_status: newBooking.payment_status
            }
        };

    } catch (err) {
        return { action: 'CREATE', status: 'ERROR', message: `Lỗi hệ thống: ${err.message}` };
    }
  }
};
