const db = require('../db');

// ===================================================
// OpTours REFACTORED — reads from tour_departures + bookings
// (legacy op_tours and op_tour_bookings are deprecated)
// ===================================================

exports.getAllOpTours = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        td.id, td.tour_template_id, td.code as tour_code, tt.name as tour_name, 
        td.start_date, td.end_date, td.market, td.status,
        td.total_revenue, td.actual_revenue, td.total_expense, td.profit,
        td.tour_info, td.expenses, td.guides_json as guides, td.itinerary, 
        td.created_at, td.updated_at,
        td.max_participants,
        td.actual_price, td.discount_price,
        td.guide_id, td.operator_id,
        tt.code as template_code, tt.duration as template_duration,
        g.name as guide_name,
        (
          SELECT COALESCE(SUM(b.pax_count), 0)
          FROM bookings b
          WHERE b.tour_departure_id = td.id AND b.booking_status NOT IN ('Huỷ')
        ) AS total_sold,
        (
          SELECT COALESCE(SUM(b.pax_count), 0)
          FROM bookings b
          WHERE b.tour_departure_id = td.id AND b.booking_status IN ('Giữ chỗ', 'Mới')
        ) AS total_reserved,
        (
          SELECT COALESCE(SUM(COALESCE(b.paid, 0)), 0)
          FROM bookings b
          WHERE b.tour_departure_id = td.id AND b.booking_status NOT IN ('Huỷ')
        ) AS total_paid
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      LEFT JOIN guides g ON td.guide_id = g.id
      ORDER BY td.start_date DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllOpTours:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getPublicOpTours = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        td.id, td.code as tour_code, tt.name as tour_name, 
        td.start_date, td.end_date, td.market, td.status,
        td.tour_info, td.max_participants,
        (
          SELECT COALESCE(SUM(b.pax_count), 0)
          FROM bookings b
          WHERE b.tour_departure_id = td.id AND b.booking_status NOT IN ('Huỷ', 'Mới', 'Giữ chỗ')
        ) AS total_sold,
        (
          SELECT COALESCE(SUM(b.pax_count), 0)
          FROM bookings b
          WHERE b.tour_departure_id = td.id AND b.booking_status IN ('Giữ chỗ', 'Mới')
        ) AS total_reserved
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      ORDER BY td.start_date DESC
    `);
    
    const publicTours = result.rows.map(row => {
        return {
            id: row.id,
            tour_code: row.tour_code,
            tour_name: row.tour_name,
            start_date: row.start_date,
            end_date: row.end_date,
            market: row.market,
            status: row.status,
            tour_info: row.tour_info,
            max_participants: row.max_participants,
            public_stats: {
                heldCount: Number(row.total_reserved),
                soldCount: Number(row.total_sold)
            }
        };
    });
    
    res.json(publicTours);
  } catch (error) {
    console.error('Error in getPublicOpTours:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getOpTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(`
      SELECT td.*, tt.name as tour_name, tt.code as template_code, tt.duration as template_duration,
             g.name as guide_name
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      LEFT JOIN guides g ON td.guide_id = g.id
      WHERE td.id = $1
    `, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tour' });
    }
    // Map field names so frontend doesn't break
    const row = result.rows[0];
    res.json({
      ...row,
      tour_code: row.code,
      guides: row.guides_json
    });
  } catch (error) {
    console.error('Error in getOpTourById:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createOpTour = async (req, res) => {
  const { tour_code, tour_name, start_date, end_date, market, status, tour_info, revenues, expenses, guides, itinerary, tour_template_id } = req.body;
  try {
    const sDate = start_date || null;
    const eDate = end_date || null;

    // tour_template_id is required for the new schema
    if (!tour_template_id) {
      return res.status(400).json({ error: 'Vui lòng chọn Sản phẩm Tour (tour_template_id)' });
    }

    // Generate code from tour_code or auto
    const code = tour_code || `OP-${Date.now()}`;

    const result = await db.query(
      `INSERT INTO tour_departures 
       (code, tour_template_id, start_date, end_date, market, status, 
        tour_info, expenses, guides_json, itinerary, max_participants) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        code, tour_template_id, sDate, eDate, market || null, status || 'Mở bán', 
        JSON.stringify(tour_info || {}), 
        JSON.stringify(expenses || []), 
        JSON.stringify(guides || []), 
        itinerary || null,
        tour_info?.total_seats || 20
      ]
    );
    
    // Return with mapped fields
    const row = result.rows[0];
    res.status(201).json({
      ...row,
      tour_code: row.code,
      tour_name: tour_name, // from request body
      guides: row.guides_json
    });
  } catch (error) {
    console.error('Error in createOpTour:', error);
    res.status(500).json({ error: 'Lỗi khi tạo tour mới' });
  }
};

exports.updateOpTour = async (req, res) => {
  const { id } = req.params;
  const { tour_code, tour_name, tour_template_id, start_date, end_date, market, status, total_revenue, actual_revenue, total_expense, profit, tour_info, revenues, expenses, guides, itinerary } = req.body;
  
  try {
    const sDate = start_date || null;
    const eDate = end_date || null;
    const tRev = total_revenue !== '' && total_revenue !== undefined ? total_revenue : 0;
    const aRev = actual_revenue !== '' && actual_revenue !== undefined ? actual_revenue : 0;
    const tExp = total_expense !== '' && total_expense !== undefined ? total_expense : 0;
    const pfit = profit !== '' && profit !== undefined ? profit : 0;

    const result = await db.query(
      `UPDATE tour_departures 
       SET code = $1, start_date = $2, end_date = $3, market = $4, status = $5, 
           total_revenue = $6, actual_revenue = $7, total_expense = $8, profit = $9,
           tour_info = $10, expenses = $11, guides_json = $12, itinerary = $13, 
           max_participants = COALESCE($14, max_participants),
           tour_template_id = COALESCE($16, tour_template_id),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $15 RETURNING *`,
       [
         tour_code, sDate, eDate, market, status, 
         tRev, aRev, tExp, pfit, 
         JSON.stringify(tour_info || {}), 
         JSON.stringify(expenses || []), 
         JSON.stringify(guides || []), 
         itinerary, 
         tour_info?.total_seats || null,
         id,
         tour_template_id || null
       ]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    
    const row = result.rows[0];
    res.json({
      ...row,
      tour_code: row.code,
      tour_name: tour_name,
      guides: row.guides_json
    });
  } catch (error) {
    console.error('Error in updateOpTour:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật tour' });
  }
};

exports.deleteOpTour = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if there are bookings tied to this departure
    const bookingCheck = await db.query('SELECT COUNT(*) as cnt FROM bookings WHERE tour_departure_id = $1', [id]);
    if (Number(bookingCheck.rows[0].cnt) > 0) {
      return res.status(400).json({ error: `Không thể xóa: Tour này đang có ${bookingCheck.rows[0].cnt} booking. Hãy huỷ hoặc chuyển booking trước.` });
    }
    
    const result = await db.query('DELETE FROM tour_departures WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json({ message: 'Xóa tour thành công' });
  } catch (error) {
    console.error('Error in deleteOpTour:', error);
    res.status(500).json({ error: 'Lỗi khi xóa tour' });
  }
};

exports.addOpTourBooking = async (req, res) => {
  const { id } = req.params;  // tour_departure_id
  const bookingData = req.body;
  
  // BUG-01 FIX: Use transaction with row lock to prevent race condition
  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Lấy thông tin tour departure — FOR UPDATE lock để chặn concurrent booking
    const tourRes = await client.query('SELECT tour_info, max_participants FROM tour_departures WHERE id = $1 FOR UPDATE', [id]);
    if (tourRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Không tìm thấy tour' });
    }

    const rawTourInfo = tourRes.rows[0].tour_info || {};
    let tourInfo = typeof rawTourInfo === 'string' ? JSON.parse(rawTourInfo) : rawTourInfo;
    const totalSeats = Number(tourInfo.total_seats || tourRes.rows[0].max_participants || 0);
    const allowOverbooking = tourInfo.allow_overbooking === true;

    // Check capacity (within the lock)
    const currentBookingStatus = bookingData.status || 'Giữ chỗ';
    if (!['Hủy', 'Huỷ'].includes(currentBookingStatus)) {
        const soldRes = await client.query(`
           SELECT COALESCE(SUM(pax_count), 0) as sold
           FROM bookings
           WHERE tour_departure_id = $1 AND id != $2 AND booking_status NOT IN ('Huỷ')
        `, [id, bookingData.id || -1]);
        
        const soldSoFar = Number(soldRes.rows[0].sold || 0);
        const newQty = Number(bookingData.qty || bookingData.pax_count || 0);
        if (!allowOverbooking && totalSeats > 0 && (soldSoFar + newQty > totalSeats)) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                error: `QUÁ SỐ CHỖ: Tour chỉ còn ${totalSeats - soldSoFar} chỗ (Tổng: ${totalSeats}). Bạn đang giữ/bán ${newQty} chỗ. Vui lòng bật "Cho bán quá chỗ" trong cài đặt Tour nếu muốn tiếp tục.`
            });
        }
    }
    
    // Edit or Create
    let newBooking;
    let isNewBooking = !bookingData.id;
    
    const rawDetails = bookingData.raw_details || {};
    const paxCount = Number(bookingData.qty || bookingData.pax_count || 0);
    const totalPrice = Number(bookingData.total || bookingData.total_price || 0);
    const paidAmount = Number(bookingData.paid || 0);
    const bookingStatus = bookingData.status || 'Giữ chỗ';

    // BUG-02 FIX: Check cả role_name (bảng roles) lẫn role (text cũ) để tương thích
    const userRoleName = req.user.role_name || req.user.role || '';
    const isPrivileged = ['admin', 'manager', 'operator'].includes(userRoleName);

    if (!isNewBooking) {
        // Permission check
        const bCheck = await client.query('SELECT created_by FROM bookings WHERE id = $1', [bookingData.id]);
        if (bCheck.rows.length > 0) {
             const existingBooking = bCheck.rows[0];
             if (!isPrivileged && existingBooking.created_by != req.user.id) {
                  await client.query('ROLLBACK');
                  return res.status(403).json({ error: 'Lỗi phân quyền! Bạn không có quyền chỉnh sửa Booking của người khác.' });
             }
        }

        // Update existing booking
        await client.query(`
            UPDATE bookings
            SET customer_id = $1, pax_count = $2,
                base_price = $3, surcharge = $4, discount = $5, total_price = $6, paid = $7,
                booking_status = $8, raw_details = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
            WHERE id = $11 AND tour_departure_id = $12
        `, [
            bookingData.customer_id || null, paxCount,
            Number(bookingData.base_price) || 0, Number(bookingData.surcharge) || 0, Number(bookingData.discount) || 0, totalPrice, paidAmount,
            bookingStatus, JSON.stringify(rawDetails), bookingData.notes || null, bookingData.id, id
        ]);
        newBooking = bookingData;
    } else {
        // Generate booking code
        const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`;
        
        // Create new booking
        const insertRes = await client.query(`
            INSERT INTO bookings (
                booking_code, tour_departure_id, customer_id, pax_count,
                base_price, surcharge, discount, total_price, paid, 
                booking_status, payment_status, raw_details, notes,
                created_by, created_by_name
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        `, [
            bookingCode, id, bookingData.customer_id || null, paxCount,
            Number(bookingData.base_price) || 0, Number(bookingData.surcharge) || 0, Number(bookingData.discount) || 0, totalPrice, paidAmount,
            bookingStatus, paidAmount >= totalPrice && totalPrice > 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid'),
            JSON.stringify(rawDetails), bookingData.notes || null,
            req.user ? req.user.id : null, req.user ? req.user.full_name : 'Sales'
        ]);
        newBooking = { ...bookingData, id: insertRes.rows[0].id, booking_code: bookingCode };
    }

    // COMMIT the critical booking section
    await client.query('COMMIT');

    // === AUTO-CONVERT ENGINE & VIP ENGINE (outside transaction — non-critical) ===
    function getVipLevel(totalTrips) {
        if (totalTrips >= 7) return 'VIP 1';
        if (totalTrips >= 4) return 'VIP 2';
        if (totalTrips >= 3) return 'VIP 3';
        if (totalTrips >= 2) return 'Repeat Customer';
        return 'New Customer';
    }

    // 1. Process Booker VIP (if this is a brand new booking)
    if (isNewBooking && bookingData.customer_id) {
       try {
           const updateRes = await db.query(`
               UPDATE customers 
               SET updated_at = CURRENT_TIMESTAMP
               WHERE id = $1 
               RETURNING past_trip_count, COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = customers.id AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as crm_trip_count
           `, [bookingData.customer_id]);
           
           if (updateRes.rows.length > 0) {
               const r = updateRes.rows[0];
               const totalTrips = parseInt(r.past_trip_count) + parseInt(r.crm_trip_count);
               const newVip = getVipLevel(totalTrips);
               await db.query('UPDATE customers SET customer_segment = $1 WHERE id = $2', [newVip, bookingData.customer_id]);
           }
       } catch (err) {
           console.error('Booker VIP update error:', err.message);
       }
    }

    // 2. Process Members (Passengers) — Chạy khi tạo mới HOẶC cập nhật Booking
    if (true) {
      const members = bookingData.raw_details?.members || [];
      const bookerPhone = bookingData.phone ? bookingData.phone.replace(/[\s\-\.]/g, '') : '';

      for (const m of members) {
        if (m.phone && m.phone.trim() !== '') {
          const memberPhone = m.phone.replace(/[\s\-\.]/g, '');
          
          const memberName = m.name ? m.name.trim() : '';
          if (!memberName || memberName.startsWith('Khách ')) continue;

          const name = memberName.toUpperCase();
          const cmnd = m.docId || '';
          const dob = m.dob || null;
          
          try {
            const custCheck = await db.query(
               `SELECT id FROM customers 
                WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = $1 
                   OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = $2 LIMIT 1`,
               [memberPhone, memberPhone.replace(/^0/, '')]
            );

            if (custCheck.rows.length > 0) {
               // Passenger đã tồn tại → chỉ bổ sung CMND/Ngày sinh nếu thiếu
                const custFound = custCheck.rows[0];
               await db.query(`
                  UPDATE customers 
                  SET id_card = COALESCE(NULLIF($1, ''), id_card),
                      birth_date = COALESCE(NULLIF($2, '')::date, birth_date),
                      email = COALESCE(NULLIF($4, ''), email),
                      passport_url = COALESCE(NULLIF($5, ''), passport_url)
                  WHERE id = $3
               `, [cmnd, dob, custFound.id, m.email ? m.email.trim() : '', m.passportUrl || '']);
            } else {
               // BUG-04 FIX: Thêm assigned_to = sale đang tạo booking để khách không bị "mất tích"
               await db.query(
                 `INSERT INTO customers 
                  (name, phone, id_card, birth_date, email, customer_segment, past_trip_count, role, passport_url, assigned_to)
                  VALUES ($1, $2, $3, NULLIF($4, '')::date, NULLIF($8, ''), $5, $6, $7, $9, $10)`,
                 [name, m.phone.trim(), cmnd, dob, 'New Customer', 0, 'passenger', m.email ? m.email.trim() : '', m.passportUrl || '', req.user ? req.user.id : null]
               );
            }
          } catch (autoErr) {
            console.warn('Auto-convert member warning:', autoErr.message);
          }
        }
      }
    }  // end passenger block

    res.status(200).json({ message: 'Thêm Booking thành công', booking: newBooking });
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Error in addOpTourBooking:', error);
    res.status(500).json({ error: 'Lỗi khi lưu Booking' });
  } finally {
    client.release();
  }
};

exports.getOpTourBookings = async (req, res) => {
  const { id } = req.params;  // tour_departure_id
  try {
    const result = await db.query(`
      SELECT b.*, c.name as customer_name, c.phone as customer_phone
      FROM bookings b
      LEFT JOIN customers c ON b.customer_id = c.id
      WHERE b.tour_departure_id = $1 
      ORDER BY b.created_at DESC
    `, [id]);
    
    const bookings = result.rows.map(row => ({
        ...row,
        // Map fields for OpTours frontend compatibility
        tour_id: row.tour_departure_id,
        name: row.customer_name || '',
        phone: row.customer_phone || '',
        qty: row.pax_count,
        total: row.total_price,
        status: row.booking_status,
        raw_details: typeof row.raw_details === 'string' ? JSON.parse(row.raw_details) : (row.raw_details || {})
    }));
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách Bookings' });
  }
};

exports.updateOpTourBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  const { status, note } = req.body;
  try {
    const bCheck = await db.query('SELECT total_price, paid, booking_status, created_by FROM bookings WHERE id = $1 AND tour_departure_id = $2', [bookingId, id]);
    if (bCheck.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy Booking' });
    const booking = bCheck.rows[0];

    // BUG-02 FIX: Use role_name (from roles table) instead of legacy role field
    const userRoleName = req.user.role_name || req.user.role || '';
    const isPrivileged = ['admin', 'manager', 'operator'].includes(userRoleName);
    if (!isPrivileged && booking.created_by != req.user.id) {
        return res.status(403).json({ error: 'Lỗi phân quyền! Bạn không có quyền thao tác trên Booking của người khác.' });
    }

    if (status) {
        const paid = Number(booking.paid || 0);
        const total = Number(booking.total_price || 0);
        
        if (status === 'Đã thanh toán' && (paid < total || total === 0)) {
             return res.status(400).json({ error: 'Không thể chuyển trạng thái sang Đã thanh toán do chưa đủ dư nợ!' });
        }
        if (status === 'Đã đặt cọc' && (paid === 0 || paid >= total)) {
             return res.status(400).json({ error: 'Không thể chuyển trạng thái sang Đã đặt cọc (Số dư không hợp lệ)!' });
        }
        if ((status === 'Mới' || status === 'Giữ chỗ') && paid > 0) {
             return res.status(400).json({ error: 'Không thể hạ trạng thái xuống khi Booking này đang giữ tiền cọc!' });
        }

        await db.query('UPDATE bookings SET booking_status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tour_departure_id = $3', [status, bookingId, id]);

        // === RECALC VIP TIER cho khách khi trạng thái booking thay đổi ===
        const custRes = await db.query('SELECT customer_id FROM bookings WHERE id = $1', [bookingId]);
        if (custRes.rows.length > 0 && custRes.rows[0].customer_id) {
            const custId = custRes.rows[0].customer_id;
            const vipRes = await db.query(`
                SELECT past_trip_count,
                       COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = $1 AND booking_status NOT IN ('Huỷ', 'Mới')), 0) as crm_trip_count
                FROM customers WHERE id = $1
            `, [custId]);
            if (vipRes.rows.length > 0) {
                const r = vipRes.rows[0];
                const totalTrips = parseInt(r.past_trip_count || 0) + parseInt(r.crm_trip_count || 0);
                let newVip = 'New Customer';
                if (totalTrips >= 7) newVip = 'VIP 1';
                else if (totalTrips >= 4) newVip = 'VIP 2';
                else if (totalTrips >= 3) newVip = 'VIP 3';
                else if (totalTrips >= 2) newVip = 'Repeat Customer';
                await db.query('UPDATE customers SET customer_segment = $1 WHERE id = $2', [newVip, custId]);
            }
        }
    }
    
    if (note !== undefined) {
        await db.query('UPDATE bookings SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND tour_departure_id = $3', [note, bookingId, id]);
    }
    
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật Booking' });
  }

};

exports.deleteOpTourBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  try {
    const bCheck = await db.query('SELECT paid, created_by FROM bookings WHERE id = $1 AND tour_departure_id = $2', [bookingId, id]);
    if (bCheck.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy Booking' });
    const booking = bCheck.rows[0];

    const userRoleName = req.user.role_name || req.user.role || '';
    if (!['admin', 'manager'].includes(userRoleName)) {
        return res.status(403).json({ error: 'Lỗi phân quyền! Chỉ Admin hoặc Manager mới có quyền Xóa vĩnh viễn Booking.' });
    }

    if (Number(booking.paid) > 0) {
        return res.status(400).json({ error: 'CẢNH BÁO: Không thể Xóa vĩnh viễn Booking đã có dữ liệu Nộp Tiền!\nHãy vào Hợp Đồng/ Phiếu thu Xóa khoản tiền liên quan trước, hoặc sử dụng chức năng Đổi trạng thái sang "Huỷ".' });
    }

    await db.query('DELETE FROM bookings WHERE id = $1 AND tour_departure_id = $2', [bookingId, id]);
    res.json({ message: 'Xóa vĩnh viễn thành công' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Lỗi khi xóa Booking' });
  }
};
