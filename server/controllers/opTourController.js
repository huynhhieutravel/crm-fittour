const db = require('../db');
const { logActivity } = require('../utils/logger');

// ===================================================
// OpTours REFACTORED — reads from tour_departures + bookings
// (legacy op_tours and op_tour_bookings are deprecated)
// ===================================================

exports.getAllOpTours = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        td.id, td.tour_template_id, td.code as tour_code, COALESCE(tt.name, td.tour_info->>'tour_name') as tour_name, 
        td.start_date, td.end_date, td.market, td.market_ids, td.status,
        td.total_revenue, td.actual_revenue, td.total_expense, td.profit,
        td.tour_info, td.expenses, td.guides_json as guides, td.itinerary, 
        td.created_at, td.updated_at,
        td.max_participants,
        td.actual_price, td.discount_price,
        td.guide_id, td.operator_id,
        tt.code as template_code, tt.duration as template_duration, tt.bu_group,
        g.name as guide_name,
        COALESCE(ba.total_sold, 0) AS total_sold,
        COALESCE(ba.total_reserved, 0) AS total_reserved,
        COALESCE(ba.total_paid, 0) AS total_paid,
        COALESCE(ba.total_booking_amount, 0) AS total_booking_amount
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      LEFT JOIN guides g ON td.guide_id = g.id
      LEFT JOIN (
        SELECT 
          tour_departure_id,
          SUM(CASE WHEN booking_status NOT IN ('Huỷ') THEN pax_count ELSE 0 END) AS total_sold,
          SUM(CASE WHEN booking_status IN ('Giữ chỗ', 'Mới') THEN pax_count ELSE 0 END) AS total_reserved,
          SUM(CASE WHEN booking_status NOT IN ('Huỷ') THEN COALESCE(paid, 0) ELSE 0 END) AS total_paid,
          SUM(CASE WHEN booking_status NOT IN ('Huỷ') THEN COALESCE(total_price, 0) ELSE 0 END) AS total_booking_amount
        FROM bookings
        GROUP BY tour_departure_id
      ) ba ON ba.tour_departure_id = td.id
      ORDER BY 
         CASE WHEN td.start_date < CURRENT_DATE THEN 1 ELSE 0 END ASC,
         CASE WHEN td.start_date >= CURRENT_DATE THEN td.start_date END ASC,
         CASE WHEN td.start_date < CURRENT_DATE THEN td.start_date END DESC
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
        td.id, td.code as tour_code, COALESCE(tt.name, td.tour_info->>'tour_name') as tour_name, 
        td.start_date, td.end_date, td.market, td.market_ids, td.status,
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
      WHERE COALESCE(tt.is_active, true) = true
      ORDER BY 
         CASE WHEN td.start_date < CURRENT_DATE THEN 1 ELSE 0 END ASC,
         CASE WHEN td.start_date >= CURRENT_DATE THEN td.start_date END ASC,
         CASE WHEN td.start_date < CURRENT_DATE THEN td.start_date END DESC
    `);
    
    const publicTours = result.rows.map(row => {
        return {
            id: row.id,
            tour_code: row.tour_code,
            tour_name: row.tour_name,
            start_date: row.start_date,
            end_date: row.end_date,
            market: row.market,
            market_ids: row.market_ids,
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
      SELECT td.*, COALESCE(tt.name, td.tour_info->>'tour_name') as tour_name, tt.code as template_code, tt.duration as template_duration, tt.bu_group,
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
  const { tour_code, tour_name, start_date, end_date, market, market_ids, status, tour_info, revenues, expenses, guides, itinerary, tour_template_id } = req.body;
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
       (code, tour_template_id, start_date, end_date, market, market_ids, status, 
        tour_info, expenses, guides_json, itinerary, max_participants) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
       RETURNING *`,
      [
        code, tour_template_id, sDate, eDate, market || null, market_ids ? JSON.stringify(market_ids) : '[]', status || 'Mở bán', 
        JSON.stringify(tour_info || {}), 
        JSON.stringify(expenses || []), 
        JSON.stringify(guides || []), 
        itinerary || null,
        tour_info?.total_seats || 20
      ]
    );
    
    // Return with mapped fields
    const row = result.rows[0];

    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'CREATE',
        entity_type: 'OP_TOUR',
        entity_id: row.id,
        details: `Tạo mới Điều hành Tour: ${row.code}`,
        new_data: row
    });

    res.status(201).json({
      ...row,
      tour_code: row.code,
      tour_name: tour_name, // from request body
      guides: row.guides_json
    });
  } catch (error) {
    console.error('Error in createOpTour:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Mã tour này đã tồn tại trên hệ thống. Vui lòng đổi mã hoặc kiểm tra lại lịch khởi hành!' });
    }
    res.status(500).json({ error: 'Lỗi khi tạo tour mới' });
  }
};

exports.updateOpTour = async (req, res) => {
  const { id } = req.params;
  const { tour_code, tour_name, tour_template_id, start_date, end_date, market, market_ids, status, total_revenue, actual_revenue, total_expense, profit, tour_info, revenues, expenses, guides, itinerary } = req.body;
  
  try {
    const currentRes = await db.query('SELECT * FROM tour_departures WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    const current = currentRes.rows[0];

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
           tour_template_id = COALESCE($15, tour_template_id),
           market_ids = $16,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $17 RETURNING *`,
       [
         tour_code, sDate, eDate, market, status, 
         tRev, aRev, tExp, pfit, 
         JSON.stringify(tour_info || {}), 
         JSON.stringify(expenses || []), 
         JSON.stringify(guides || []), 
         itinerary ? (typeof itinerary === 'string' ? itinerary : JSON.stringify(itinerary)) : null, 
         tour_info?.total_seats || null,
         tour_template_id || null,
         market_ids ? JSON.stringify(market_ids) : '[]',
         id
       ]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    
    const row = result.rows[0];

    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'UPDATE',
        entity_type: 'OP_TOUR',
        entity_id: id,
        details: `Cập nhật Điều hành Tour: ${row.code}`,
        old_data: current,
        new_data: row
    });

    res.json({
      ...row,
      tour_code: row.code,
      tour_name: tour_name,
      guides: row.guides_json
    });
  } catch (error) {
    console.error('Error in updateOpTour:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Mã tour này đã tồn tại trên hệ thống. Vui lòng đổi mã hoặc kiểm tra lại lịch khởi hành!' });
    }
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
    
    const currentRes = await db.query('SELECT * FROM tour_departures WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    const current = currentRes.rows[0];

    const result = await db.query('DELETE FROM tour_departures WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });

    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'DELETE',
        entity_type: 'OP_TOUR',
        entity_id: id,
        details: `Xóa Điều hành Tour: ${current.code}`,
        old_data: current
    });

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
    const userRoleNameLower = userRoleName.toLowerCase();
    const isPrivileged = ['admin', 'manager', 'operations', 'operations_lead', 'operator', 'accountant'].includes(userRoleNameLower);

    // Determine Assignment properties
    let assignId = req.user ? req.user.id : null;
    let assignName = req.user ? (req.user.full_name || req.user.username || 'Sales') : 'Sales';
    
    if (isPrivileged && bookingData.created_by) {
        assignId = bookingData.created_by;
        assignName = bookingData.created_by_name || assignName;
    }

    if (!isNewBooking) {
        // Permission check
        const bCheck = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingData.id]);
        if (bCheck.rows.length > 0) {
             const existingBooking = bCheck.rows[0];
             if (!isPrivileged && existingBooking.created_by != req.user.id) {
                  await client.query('ROLLBACK');
                  return res.status(403).json({ error: 'Lỗi phân quyền! Bạn không có quyền chỉnh sửa Booking của người khác.' });
             }
             // Lưu old_data để log
             var oldBookingData = existingBooking;
        }

        // Update existing booking
        let updateQuery = `
            UPDATE bookings
            SET customer_id = $1, pax_count = $2,
                base_price = $3, surcharge = $4, discount = $5, total_price = $6, paid = $7,
                booking_status = $8, raw_details = $9, notes = $10, updated_at = CURRENT_TIMESTAMP
        `;
        const updateParams = [
            bookingData.customer_id || null, paxCount,
            Number(bookingData.base_price) || 0, Number(bookingData.surcharge) || 0, Number(bookingData.discount) || 0, totalPrice, paidAmount,
            bookingStatus, JSON.stringify(rawDetails), bookingData.notes || null
        ];

        let paramCounter = 11;
        if (isPrivileged && bookingData.created_by) {
             updateQuery += `, created_by = $${paramCounter++}, created_by_name = $${paramCounter++} `;
             updateParams.push(assignId, assignName);
        }

        updateQuery += ` WHERE id = $${paramCounter++} AND tour_departure_id = $${paramCounter++} RETURNING *`;
        updateParams.push(bookingData.id, id);

        const updatedRes = await client.query(updateQuery, updateParams);
        newBooking = bookingData;
        
        // LOG ACTIVITY cho UPDATE BOOKING
        if (updatedRes.rows && updatedRes.rows.length > 0) {
            await logActivity({
                user_id: req.user ? req.user.id : null,
                action_type: 'UPDATE',
                entity_type: 'BOOKING',
                entity_id: bookingData.id,
                details: `Cập nhật Giữ chỗ: ${bookingData.booking_code || bookingData.id}`,
                old_data: oldBookingData,
                new_data: updatedRes.rows[0]
            });
        }
    } else {
        // Generate booking code
        const bookingCode = `BK-${Date.now().toString(36).toUpperCase()}`;
        
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
            assignId, assignName
        ]);
        newBooking = { ...bookingData, id: insertRes.rows[0].id, booking_code: bookingCode };

        // LOG ACTIVITY cho CREATE BOOKING
        await logActivity({
            user_id: req.user ? req.user.id : null,
            action_type: 'CREATE',
            entity_type: 'BOOKING',
            entity_id: newBooking.id,
            details: `Tạo mới Giữ chỗ: ${newBooking.booking_code}`,
            new_data: insertRes.rows[0]
        });
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
          // Ưu tiên dùng personalId (CCCD 12 số trích xuất từ Hộ chiếu) làm id_card, nếu không có mới dùng docId (Số hộ chiếu)
          const cmnd = m.personalId || m.docId || '';
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
                  SET id_card = COALESCE(NULLIF(id_card, ''), NULLIF($1, '')),
                      birth_date = COALESCE(birth_date, NULLIF($2, '')::date),
                      email = COALESCE(NULLIF(email, ''), NULLIF($4, '')),
                      passport_url = COALESCE(NULLIF(passport_url, ''), NULLIF($5, ''))
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
        } else if (m.docId && m.docId.trim() !== '') {
          // Nhánh 2: Không có SĐT nhưng CÓ số Hộ chiếu/CCCD → Tra cứu bằng id_card
          const memberName = m.name ? m.name.trim() : '';
          if (!memberName || memberName.startsWith('Khách ')) continue;

          const name = memberName.toUpperCase();
          // Tương tự, ưu tiên personalId nếu có
          const cmnd = m.personalId ? m.personalId.trim() : (m.docId ? m.docId.trim() : '');
          const dob = m.dob || null;

          try {
            const custCheck = await db.query(
              `SELECT id FROM customers WHERE UPPER(TRIM(id_card)) = $1 LIMIT 1`,
              [cmnd.toUpperCase()]
            );

            if (custCheck.rows.length > 0) {
              // Đã tồn tại → Bổ sung thông tin thiếu (không ghi đè data cũ)
              const custFound = custCheck.rows[0];
              await db.query(`
                UPDATE customers 
                SET birth_date = COALESCE(birth_date, NULLIF($1, '')::date),
                    email = COALESCE(NULLIF(email, ''), NULLIF($2, '')),
                    name = COALESCE(NULLIF(name, ''), $3)
                WHERE id = $4
              `, [dob, m.email ? m.email.trim() : '', name, custFound.id]);
            } else {
              // Chưa tồn tại → Tạo mới customer với phone rỗng
              await db.query(
                `INSERT INTO customers 
                 (name, phone, id_card, birth_date, email, customer_segment, past_trip_count, role, assigned_to)
                 VALUES ($1, '', $2, NULLIF($3, '')::date, NULLIF($4, ''), 'New Customer', 0, 'passenger', $5)`,
                [name, cmnd, dob, m.email ? m.email.trim() : '', req.user ? req.user.id : null]
              );
            }
          } catch (autoErr) {
            console.warn('Auto-convert member (by passport) warning:', autoErr.message);
          }
        }
        // else: Không SĐT, không HC → không tạo customer, data vẫn lưu trong raw_details của booking
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
    const bCheck = await db.query('SELECT * FROM bookings WHERE id = $1 AND tour_departure_id = $2', [bookingId, id]);
    if (bCheck.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy Booking' });
    const oldBooking = bCheck.rows[0];
    const booking = oldBooking;

    // BUG-02 FIX: Use role_name (from roles table) instead of legacy role field
    const userRoleName = req.user.role_name || req.user.role || '';
    const userRoleNameLower = userRoleName.toLowerCase();
    const isPrivileged = ['admin', 'manager', 'operations', 'operations_lead', 'operator', 'accountant'].includes(userRoleNameLower);
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
    
    // Fetch updated booking for new_data
    const newBCheck = await db.query('SELECT * FROM bookings WHERE id = $1 AND tour_departure_id = $2', [bookingId, id]);
    const updatedBooking = newBCheck.rows[0];

    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'UPDATE',
        entity_type: 'BOOKING',
        entity_id: bookingId,
        details: `Cập nhật Trạng thái/Ghi chú Giữ chỗ: ${updatedBooking?.booking_code || bookingId}`,
        old_data: oldBooking,
        new_data: updatedBooking
    });
    
    res.json({ message: 'Cập nhật thành công' });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật Booking' });
  }

};

exports.deleteOpTourBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  try {
    const bCheck = await db.query('SELECT * FROM bookings WHERE id = $1 AND tour_departure_id = $2', [bookingId, id]);
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
    
    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'DELETE',
        entity_type: 'BOOKING',
        entity_id: bookingId,
        details: `Xóa Giữ chỗ: ${booking.booking_code || bookingId}`,
        old_data: booking
    });
    
    res.json({ message: 'Xóa vĩnh viễn thành công' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Lỗi khi xóa Booking' });
  }
};

exports.bulkDeleteOpTours = async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) return res.status(400).json({ error: 'Không có ID nào được gửi' });

  try {
    let successCount = 0, failCount = 0;
    for (const id of ids) {
      const bookingCheck = await db.query('SELECT COUNT(*) as cnt FROM bookings WHERE tour_departure_id = $1', [id]);
      if (Number(bookingCheck.rows[0].cnt) > 0) {
        failCount++;
        continue;
      }
      const result = await db.query('DELETE FROM tour_departures WHERE id = $1', [id]);
      if (result.rowCount > 0) successCount++;
    }
    let msg = `Đã xóa ${successCount} tour.`;
    if (failCount > 0) msg += ` Bỏ qua ${failCount} tour do đang có Booking.`;
    res.json({ message: msg });
  } catch (error) {
    console.error('Error in bulkDeleteOpTours:', error);
    res.status(500).json({ error: 'Lỗi khi xóa hàng loạt' });
  }
};

exports.transferOpTourBooking = async (req, res) => {
  const { id, bookingId } = req.params;
  const { targetTourId } = req.body;
  
  if (!targetTourId) return res.status(400).json({ error: 'Vui lòng chọn Tour đích cần chuyển tới.' });
  if (id == targetTourId) return res.status(400).json({ error: 'Tour đích phải khác Tour hiện tại.' });

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Check existing booking and verify source tour
    const bCheck = await client.query('SELECT * FROM bookings WHERE id = $1 AND tour_departure_id = $2 FOR UPDATE', [bookingId, id]);
    if (bCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Không tìm thấy Booking trên Tour này.' });
    }
    const booking = bCheck.rows[0];

    // Authorize
    const userRoleName = req.user.role_name || req.user.role || '';
    const isPrivileged = ['admin', 'manager', 'operator', 'accountant'].includes(userRoleName);
    if (!isPrivileged && booking.created_by != req.user.id) {
        await client.query('ROLLBACK');
        return res.status(403).json({ error: 'Lỗi phân quyền! Bạn không có quyền chuyển Booking của người khác.' });
    }

    // 2. Fetch target tour details
    const tCheck = await client.query('SELECT status, tour_info, max_participants FROM tour_departures WHERE id = $1 FOR UPDATE', [targetTourId]);
    if (tCheck.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Tour đích không tồn tại.' });
    }
    const targetTour = tCheck.rows[0];
    if (targetTour.status && targetTour.status.toLowerCase().includes('hủy')) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Không thể chuyển sang một Tour đang ở trạng thái Hủy.' });
    }

    // 3. Verify target tour capacity (optional but good)
    const rawTourInfo = targetTour.tour_info || {};
    const tourInfo = typeof rawTourInfo === 'string' ? JSON.parse(rawTourInfo) : rawTourInfo;
    const totalSeats = Number(tourInfo.total_seats || targetTour.max_participants || 0);
    const allowOverbooking = tourInfo.allow_overbooking === true;

    if (!allowOverbooking && totalSeats > 0) {
        const currentBookedRes = await client.query(`SELECT SUM(pax_count) as total_booked FROM bookings WHERE tour_departure_id = $1 AND (booking_status != 'Huỷ' AND booking_status != 'Hủy')`, [targetTourId]);
        const currentBooked = Number(currentBookedRes.rows[0].total_booked || 0);
        const incomingQty = Number(booking.pax_count || 0);
        
        if (currentBooked + incomingQty > totalSeats) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: `Tour đích không đủ chỗ! (Chỉ còn ${Math.max(0, totalSeats - currentBooked)} chỗ, Booking cần ${incomingQty} chỗ).` });
        }
    }

    // 4. Update the booking
    let rawDetails = booking.raw_details;
    try {
      if (typeof rawDetails === 'string') rawDetails = JSON.parse(rawDetails);
    } catch (e) {
      rawDetails = {};
    }
    if (!rawDetails || typeof rawDetails !== 'object') rawDetails = {};

    rawDetails.transferHistory = rawDetails.transferHistory || [];
    rawDetails.transferHistory.push({
        from_tour_id: id,
        to_tour_id: targetTourId,
        date: new Date().toISOString(),
        by: req.user?.id || 0
    });

    const updateQuery = 'UPDATE bookings SET tour_departure_id = $1, raw_details = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3';
    await client.query(updateQuery, [targetTourId, JSON.stringify(rawDetails), bookingId]);

    await client.query('COMMIT');
    res.json({ message: 'Chuyển tour thành công!' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error transferring booking:', error);
    res.status(500).json({ error: 'Lỗi hệ thống khi chuyển tour: ' + error.message });
  } finally {
    client.release();
  }
};
