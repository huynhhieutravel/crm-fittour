const db = require('../db');
const { logActivity } = require('../utils/logger');
const path = require('path');
const fs = require('fs');
const ExcelJS = require('exceljs');

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
          SUM(CASE WHEN booking_status NOT IN ('Huỷ', 'CANCELLED', 'EXPIRED') THEN pax_count ELSE 0 END) AS total_sold,
          SUM(CASE WHEN booking_status IN ('Giữ chỗ', 'Mới', 'pending', 'HELD') THEN pax_count ELSE 0 END) AS total_reserved,
          SUM(CASE WHEN booking_status NOT IN ('Huỷ', 'CANCELLED', 'EXPIRED') THEN COALESCE(paid, 0) ELSE 0 END) AS total_paid,
          SUM(CASE WHEN booking_status NOT IN ('Huỷ', 'CANCELLED', 'EXPIRED') THEN COALESCE(total_price, 0) ELSE 0 END) AS total_booking_amount
        FROM bookings
        GROUP BY tour_departure_id
      ) ba ON ba.tour_departure_id = td.id
      WHERE COALESCE(td.is_deleted, false) = false
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
        tt.code as template_code,
        (
          SELECT COALESCE(SUM(b.pax_count), 0)
          FROM bookings b
          WHERE b.tour_departure_id = td.id AND b.booking_status NOT IN ('Huỷ', 'Mới', 'Giữ chỗ', 'CANCELLED', 'EXPIRED', 'HELD')
        ) AS total_sold,
        (
          SELECT COALESCE(SUM(b.pax_count), 0)
          FROM bookings b
          WHERE b.tour_departure_id = td.id AND b.booking_status IN ('Giữ chỗ', 'Mới', 'pending', 'HELD')
        ) AS total_reserved
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE COALESCE(tt.is_active, true) = true AND COALESCE(td.is_deleted, false) = false
      ORDER BY 
         CASE WHEN td.start_date < CURRENT_DATE THEN 1 ELSE 0 END ASC,
         CASE WHEN td.start_date >= CURRENT_DATE THEN td.start_date END ASC,
         CASE WHEN td.start_date < CURRENT_DATE THEN td.start_date END DESC
    `);
    
    const publicTours = result.rows.map(row => {
        return {
            id: row.id,
            tour_code: row.tour_code,
            template_code: row.template_code,

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
      WHERE td.id = $1 AND COALESCE(td.is_deleted, false) = false
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
      return res.status(400).json({ error: 'Mã tour này đã tồn tại trên hệ thống (hoặc đang nằm trong Thùng rác). Vui lòng đổi mã hoặc kiểm tra lại lịch khởi hành!' });
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
      return res.status(400).json({ error: 'Mã tour này đã tồn tại trên hệ thống (hoặc đang nằm trong Thùng rác). Vui lòng đổi mã hoặc kiểm tra lại lịch khởi hành!' });
    }
    res.status(500).json({ error: 'Lỗi khi cập nhật tour' });
  }
};

exports.deleteOpTour = async (req, res) => {
  const { id } = req.params;
  try {
    // Check if there are active bookings tied to this departure (bỏ qua các booking đã Huỷ)
    const bookingCheck = await db.query("SELECT COUNT(*) as cnt FROM bookings WHERE tour_departure_id = $1 AND booking_status != 'Huỷ'", [id]);
    if (Number(bookingCheck.rows[0].cnt) > 0) {
      return res.status(409).json({ hasBookings: true, error: `Không thể xóa: Lịch khởi hành này đang có ${bookingCheck.rows[0].cnt} khách hàng đang hoạt động. Hãy chuyển khách sang tour khác trước khi đưa vào thùng rác.` });
    }
    
    const currentRes = await db.query('SELECT * FROM tour_departures WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    const current = currentRes.rows[0];

    // SOFT DELETE: Mark the tour as deleted
    await db.query('UPDATE tour_departures_raw SET is_deleted = true WHERE id = $1', [id]);

    // LOG ACTIVITY
    await logActivity({
        user_id: req.user ? req.user.id : null,
        action_type: 'DELETE',
        entity_type: 'OP_TOUR',
        entity_id: id,
        details: `Đưa Lịch khởi hành vào Thùng rác: ${current.code}`,
        old_data: current
    });

    res.json({ message: 'Đã chuyển vào Thùng rác thành công' });
  } catch (error) {
    console.error('Error in deleteOpTour:', error);
    res.status(500).json({ error: 'Lỗi khi đưa vào Thùng rác' });
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
           WHERE tour_departure_id = $1 AND id != $2 
           AND (
               booking_status IN ('CONFIRMED', 'COMPLETED', 'Xác nhận', 'Hoàn thành', 'Mới', 'pending')
               OR (booking_status IN ('HELD', 'Giữ chỗ') AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP))
           )
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
    
    if ((isPrivileged || isNewBooking) && bookingData.created_by) {
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
               RETURNING past_trip_count, COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = customers.id AND booking_status NOT IN ('Huỷ', 'Mới', 'CANCELLED', 'EXPIRED')), 0) as crm_trip_count
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
                       COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = $1 AND booking_status NOT IN ('Huỷ', 'Mới', 'CANCELLED', 'EXPIRED')), 0) as crm_trip_count
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
        const currentBookedRes = await client.query(`SELECT COALESCE(SUM(pax_count), 0) as total_booked FROM bookings WHERE tour_departure_id = $1 AND (booking_status IN ('CONFIRMED', 'COMPLETED', 'Xác nhận', 'Hoàn thành', 'Mới', 'pending') OR (booking_status IN ('HELD', 'Giữ chỗ') AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)))`, [targetTourId]);
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

// ===================================================
// B2C Public Endpoint — Normalized & Whitelisted
// Dùng bởi Astro frontend proxy (fittour.vn)
// KHÔNG chứa: discount, cost, internal_notes, close_time
// ===================================================
const { fetchActiveTours, transformB2CTour } = require('../services/opTourService');

exports.getB2COpTours = async (req, res) => {
  try {
    const rows = await fetchActiveTours();
    const b2cTours = rows.map(transformB2CTour);

    res.set('Cache-Control', 'public, max-age=300');
    res.json({
      success: true,
      data: b2cTours,
      meta: {
        total: b2cTours.length,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in getB2COpTours:', error);
    res.status(500).json({
      success: false,
      error: 'Lịch khởi hành đang được cập nhật. Vui lòng thử lại sau.'
    });
  }
};

exports.exportBU245Namelist = async (req, res) => {
  const { id } = req.params;
  const { members: customMembers, bookingName } = req.body || {};
  try {
    const tourRes = await db.query(`
      SELECT 
        td.*, td.code as tour_code, COALESCE(tt.name, td.tour_info->>'tour_name') as tour_name, 
        tt.code as template_code, tt.duration as template_duration, tt.bu_group,
        g.name as guide_name,
        u.full_name as operator_name
      FROM tour_departures td
      LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
      LEFT JOIN guides g ON td.guide_id = g.id
      LEFT JOIN users u ON td.operator_id = u.id
      WHERE td.id = $1
    `, [id]);

    if (tourRes.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tour' });
    }
    const tour = tourRes.rows[0];

    let members = customMembers;
    if (!members || !Array.isArray(members) || members.length === 0) {
      const bRes = await db.query(`
        SELECT b.*, c.name as customer_name, c.phone as customer_phone, u.full_name as created_by_name
        FROM bookings b
        LEFT JOIN customers c ON b.customer_id = c.id
        LEFT JOIN users u ON b.created_by = u.id
        WHERE b.tour_departure_id = $1
        ORDER BY b.created_at ASC
      `, [id]);
      
      members = [];
      bRes.rows.forEach(b => {
        const st = b.booking_status || '';
        if (st.includes('uỷ') || st.includes('ủy') || st.includes('Huỷ') || st.includes('Hủy') || st === 'CANCELLED') return;
        const raw = typeof b.raw_details === 'string' ? JSON.parse(b.raw_details) : (b.raw_details || {});
        const bInfo = raw.bookingInfo || {};
        const bookerGender = bInfo.gender || b.gender || '';
        const bMembers = raw.members || [];
        const pricingRows = raw.pricingRows || [];
        const salesName = b.created_by_name || 'Sales';
        const tourPrice = (pricingRows && pricingRows.length > 0) ? pricingRows[0].price : (raw.price_adult || 0);
        const inNote = pricingRows[0]?.internalNote || '';
        const cuNote = pricingRows[0]?.note || '';
        const bNoteCombined = [inNote, cuNote].filter(Boolean).join(' | ');

        if (bMembers.length === 0) {
          members.push({
            name: b.customer_name || b.name || bInfo.name || '',
            phone: b.customer_phone || b.phone || bInfo.phone || '',
            docId: b.cmnd || bInfo.cmnd || '',
            gender: bookerGender,
            bookerGender: bookerGender,
            dob: bInfo.dob || b.birth_date || '',
            salesPerson: salesName,
            bTourPrice: tourPrice,
            bTotal: b.total_price || 0,
            bPaid: b.paid || 0,
            bRemaining: (Number(b.total_price) || 0) - (Number(b.paid) || 0),
            bNote: bNoteCombined || ''
          });
        } else {
          bMembers.forEach((m, mIdx) => {
            const rawG = (m.gender && m.gender !== 'Chọn' && m.gender !== '---') ? m.gender : (mIdx === 0 ? bookerGender : '');
            members.push({
              ...m,
              gender: rawG,
              bookerGender: bookerGender,
              salesPerson: salesName,
              bTourPrice: mIdx === 0 ? tourPrice : '',
              bTotal: mIdx === 0 ? (b.total_price || 0) : '',
              bPaid: mIdx === 0 ? (b.paid || 0) : '',
              bRemaining: mIdx === 0 ? ((Number(b.total_price) || 0) - (Number(b.paid) || 0)) : '',
              bNote: (mIdx === 0 && bNoteCombined) ? (bNoteCombined + (m.note ? ` - ${m.note}` : '')) : (m.note || '')
            });
          });
        }
      });
    }

    let templatePath = path.resolve(__dirname, '../../data_import/namelist-fittour.xlsx');
    if (!fs.existsSync(templatePath)) {
      templatePath = path.resolve(process.cwd(), '../data_import/namelist-fittour.xlsx');
    }
    if (!fs.existsSync(templatePath)) {
      templatePath = path.resolve(process.cwd(), 'data_import/namelist-fittour.xlsx');
    }
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: 'Không tìm thấy file mẫu namelist-fittour.xlsx' });
    }

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(templatePath);

    // Sheet 2 là Egypt, chứa drawing1.xml có logo FIT TOUR
    const ws = wb.worksheets[1] || wb.worksheets[0];
    ws.name = (tour.tour_code || 'Namelist').replace(/[\\/*?:[\]]/g, '').slice(0, 30);
    
    // Xóa các sheet khác
    wb.worksheets.forEach(w => {
      if (w.id !== ws.id) wb.removeWorksheet(w.id);
    });

    const getCountryFlag = (tourName = '') => {
      const t = (tourName || '').toLowerCase();
      if (t.includes('ai cập') || t.includes('egypt')) return '🇪🇬 ';
      if (t.includes('maroc') || t.includes('morocco')) return '🇲🇦 ';
      if (t.includes('pakistan')) return '🇵🇰 ';
      if (t.includes('mông cổ') || t.includes('mongolia')) return '🇲🇳 ';
      if (t.includes('nhật bản') || t.includes('japan')) return '🇯🇵 ';
      if (t.includes('hàn quốc') || t.includes('korea')) return '🇰🇷 ';
      if (t.includes('ấn độ') || t.includes('india')) return '🇮🇳 ';
      if (t.includes('tây ban nha') || t.includes('spain')) return '🇪🇸 ';
      if (t.includes('bồ đào nha') || t.includes('portugal')) return '🇵🇹 ';
      if (t.includes('thổ nhĩ kỳ') || t.includes('turkey')) return '🇹🇷 ';
      if (t.includes('úc') || t.includes('australia')) return '🇦🇺 ';
      if (t.includes('châu âu') || t.includes('europe')) return '🇪🇺 ';
      if (t.includes('trung quốc') || t.includes('china')) return '🇨🇳 ';
      return '';
    };

    function parseDateToUTC(dateStr) {
      if (!dateStr) return null;
      if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
        return new Date(Date.UTC(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate()));
      }
      const str = String(dateStr).trim();
      const ymdMatch = str.match(/^(\d{4})[-/. ](\d{1,2})[-/. ](\d{1,2})/);
      if (ymdMatch) {
        return new Date(Date.UTC(Number(ymdMatch[1]), Number(ymdMatch[2]) - 1, Number(ymdMatch[3])));
      }
      const dmyMatch = str.match(/^(\d{1,2})[-/. ](\d{1,2})[-/. ](\d{4})/);
      if (dmyMatch) {
        return new Date(Date.UTC(Number(dmyMatch[3]), Number(dmyMatch[2]) - 1, Number(dmyMatch[1])));
      }
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      }
      return null;
    }

    function parseMoney(val) {
      if (val === undefined || val === null || val === '') return '';
      if (typeof val === 'number') return isNaN(val) ? '' : val;
      const cleaned = String(val).replace(/[^\d.-]/g, '');
      if (!cleaned) return '';
      const num = Number(cleaned);
      return isNaN(num) ? '' : num;
    }

    function splitName(fullName) {
      const clean = (fullName || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').trim().toUpperCase();
      const parts = clean.split(/\s+/);
      if (parts.length > 1) {
        return { surname: parts[0], givenName: parts.slice(1).join(' ') };
      }
      return { surname: clean, givenName: '' };
    }

    function formatFlightTime(t) {
      if (!t) return '';
      const clean = String(t).trim();
      const plusMatch = clean.match(/\+(\d+)/);
      const plusSuffix = plusMatch ? `+${plusMatch[1]}` : '';
      const base = clean.replace(/\s*\(\s*\+\d+\s*\)/g, '').replace(/\+\d+/g, '').trim();
      
      if (base.includes(':')) {
        const parts = base.replace(/[^\d:]/g, '').split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].slice(0, 2)}${plusSuffix}`;
      }
      const digits = base.replace(/[^\d]/g, '');
      if (digits.length === 4) {
        return `${digits.slice(0, 2)}:${digits.slice(2, 4)}${plusSuffix}`;
      }
      return clean;
    }

    const PNR_STATUS_CODES = new Set(['HK', 'HL', 'HN', 'SS', 'SA', 'UC', 'UN', 'TK', 'GK', 'PK', 'DK', 'NN']);
    const MONTHS = new Set(['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']);

    function isFlightNumber(code, num) {
      if (!code || !num) return false;
      const upperCode = code.toUpperCase();
      if (!/^[A-Z0-9]{2}$/.test(upperCode)) return false;
      if (/^\d{2}$/.test(upperCode)) return false;
      if (PNR_STATUS_CODES.has(upperCode)) return false;
      if (MONTHS.has(upperCode)) return false;
      if (!/^\d{1,4}[A-Z]?$/i.test(num)) return false;
      return true;
    }

    function parseFlightLine(line) {
      let str = String(line || '').trim();
      if (!str) return null;
      if (/^(quá cảnh|transit|chặng đi|chặng về|nơi đi|nơi đến|ghi chú)/i.test(str)) return null;

      str = str.replace(/^\s*\d+[\s.)/-]+\s*/, '').trim();
      if (!str) return null;

      let flightNo = '';
      let journey = '';
      let depTime = '';
      let arrTime = '';

      const flightMatches = [...str.matchAll(/\b([A-Z0-9]{2})\s*(\d{1,4}[A-Z]?)\b/gi)];
      for (const match of flightMatches) {
        if (isFlightNumber(match[1], match[2])) {
          flightNo = `${match[1].toUpperCase()} ${match[2].toUpperCase()}`;
          break;
        }
      }

      const timeColon = [...str.matchAll(/(\d{1,2}:\d{2}(?:\s*(?:\(\s*)?\+\d+(?:\s*\))?)?)/g)].map(m => m[1]);
      if (timeColon.length >= 2) {
        depTime = formatFlightTime(timeColon[0]);
        arrTime = formatFlightTime(timeColon[1]);
      } else if (timeColon.length === 1) {
        depTime = formatFlightTime(timeColon[0]);
      } else {
        const fourDigitMatches = [...str.matchAll(/(?:^|[\s|(\[])(\d{4}(?:\s*(?:\(\s*)?\+\d+(?:\s*\))?)?)(?=[\s|)\],]|$)/g)].map(m => m[1]);
        const flightDigits = flightNo ? flightNo.replace(/[^\d]/g, '') : '';
        const timeCandidates = fourDigitMatches.filter(n => {
          if (n.startsWith('202')) return false;
          if (n === flightDigits) return false;
          return true;
        });
        if (timeCandidates.length >= 2) {
          depTime = formatFlightTime(timeCandidates[0]);
          arrTime = formatFlightTime(timeCandidates[1]);
        } else if (timeCandidates.length === 1) {
          depTime = formatFlightTime(timeCandidates[0]);
        }
      }

      const joinedRoute = str.match(/\b([A-Z]{3})([A-Z]{3})\b/);
      if (joinedRoute) {
        const origin = joinedRoute[1].toUpperCase();
        const dest = joinedRoute[2].toUpperCase();
        if (!MONTHS.has(origin) && !MONTHS.has(dest)) {
          journey = origin + dest;
        }
      }
      if (!journey) {
        const separatedRoute = str.match(/\b([A-Z]{3})\s*[-–—/]\s*([A-Z]{3})\b/i);
        if (separatedRoute) {
          journey = (separatedRoute[1] + separatedRoute[2]).toUpperCase();
        }
      }

      if (!flightNo && !journey && !depTime) {
        flightNo = str;
      }

      return { flightNo, journey, depTime, arrTime, raw: str };
    }

    function extractFlightSegments(text) {
      if (!text) return [];
      const rawLines = text.split(/[\r\n]+/);
      const segments = [];
      
      for (const rawLine of rawLines) {
        const trimmed = rawLine.trim();
        if (!trimmed) continue;
        
        const flightMatches = [...trimmed.matchAll(/\b([A-Z0-9]{2})\s*(\d{1,4}[A-Z]?)\b/gi)]
          .filter(m => isFlightNumber(m[1], m[2]));
          
        if (flightMatches.length > 1) {
          const secondFlightIndex = flightMatches[1].index;
          const part1 = trimmed.slice(0, secondFlightIndex).trim();
          const part2 = trimmed.slice(secondFlightIndex).trim();
          const seg1 = parseFlightLine(part1);
          if (seg1 && seg1.flightNo) segments.push(seg1);
          const seg2 = parseFlightLine(part2);
          if (seg2 && seg2.flightNo) segments.push(seg2);
        } else {
          const seg = parseFlightLine(trimmed);
          if (seg) {
            if (!seg.flightNo && (seg.depTime || seg.arrTime) && segments.length > 0) {
              const prev = segments[segments.length - 1];
              if (!prev.depTime && !prev.arrTime) {
                prev.depTime = seg.depTime;
                prev.arrTime = seg.arrTime;
                if (seg.journey && !prev.journey) prev.journey = seg.journey;
                continue;
              }
            }
            if (seg.flightNo) {
              segments.push(seg);
            }
          }
        }
      }
      return segments;
    }

    const flag = getCountryFlag(tour.tour_name || '');
    let rawTourName = (tour.tour_name || tour.tour_code || 'TOUR').toUpperCase().trim();
    if (flag && !rawTourName.includes(flag.trim())) {
      rawTourName = `${flag}${rawTourName}`;
    }

    let dateRangeStr = '';
    let durationStr = '';
    if (tour.start_date && tour.end_date) {
      const sDate = new Date(tour.start_date);
      const eDate = new Date(tour.end_date);
      const sDay = String(sDate.getDate()).padStart(2, '0');
      const eDay = String(eDate.getDate()).padStart(2, '0');
      const eMonth = eDate.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const eYear = eDate.getFullYear();
      const days = Math.round((eDate - sDate) / (1000 * 60 * 60 * 24)) + 1;
      const nights = Math.max(0, days - 1);
      dateRangeStr = `${sDay}-${eDay}${eMonth} ${eYear}`;
      durationStr = `(${days}D${nights}N)`;
    }
    const fullTourTitle = `${rawTourName} ${dateRangeStr} ${durationStr}`.trim();
    const operatorName = tour.tour_info?.operators || tour.operator_name || 'FIT TOUR';
    const leaderName = tour.guide_name || tour.guides?.[0]?.name || tour.tour_info?.tour_guide || 'Mr. LE THANH HA';

    ws.getCell('F2').value = fullTourTitle;
    ws.getCell('F3').value = 'FIT TOUR';
    ws.getCell('H3').value = 'Operator';
    ws.getCell('I3').value = operatorName;
    ws.getCell('H4').value = leaderName;

    // Chuyến bay nếu có
    const flightDepDate = parseDateToUTC(tour.start_date);
    const flightRetDate = parseDateToUTC(tour.end_date);

    // 1. Xóa sạch dữ liệu mẫu (dummy Egypt Qatar Airways) ở các dòng 6 -> 13
    for (let r = 6; r <= 13; r++) {
      ['D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach(col => {
        ws.getCell(col + r).value = null;
      });
    }

    // 2. Bóc tách các chặng bay (Chặng 1, Chặng 2) cho chiều đi và chiều về
    const rawDep = tour.tour_info?.departure_flight || tour.departure_flight || '';
    const rawRet = tour.tour_info?.return_flight || tour.return_flight || '';

    let depSegments = extractFlightSegments(rawDep);
    if (depSegments.length === 0 && rawDep.trim()) {
      depSegments = [{ flightNo: rawDep.trim(), journey: '', depTime: '', arrTime: '' }];
    }

    let retSegments = extractFlightSegments(rawRet);
    if (retSegments.length === 0 && rawRet.trim()) {
      retSegments = [{ flightNo: rawRet.trim(), journey: '', depTime: '', arrTime: '' }];
    }

    const writeFlightRow = (rowNum, seg, dateVal) => {
      if (!seg) return;
      if (dateVal) {
        const dCell = ws.getCell(`D${rowNum}`);
        dCell.value = dateVal;
        dCell.numFmt = 'dd/mm/yyyy;@';
      }
      if (seg.journey) {
        const eCell = ws.getCell(`E${rowNum}`);
        eCell.value = seg.journey;
        eCell.numFmt = '@';
      }
      if (seg.flightNo) {
        const fCell = ws.getCell(`F${rowNum}`);
        fCell.value = seg.flightNo;
        fCell.numFmt = '@';
      }
      if (seg.depTime) {
        const gCell = ws.getCell(`G${rowNum}`);
        gCell.value = seg.depTime;
        gCell.numFmt = '@';
      }
      if (seg.arrTime) {
        const hCell = ws.getCell(`H${rowNum}`);
        hCell.value = seg.arrTime;
        hCell.numFmt = '@';
      }
    };

    // 3. Điền vào bảng chuyến bay: HAN (Hàng 6..9) và SGN (Hàng 10..13)
    if (depSegments[0]) writeFlightRow(6, depSegments[0], flightDepDate);
    if (depSegments[1]) writeFlightRow(7, depSegments[1], flightDepDate);
    if (retSegments[0]) writeFlightRow(8, retSegments[0], flightRetDate);
    if (retSegments[1]) writeFlightRow(9, retSegments[1], flightRetDate);

    if (depSegments[0]) writeFlightRow(10, depSegments[0], flightDepDate);
    if (depSegments[1]) writeFlightRow(11, depSegments[1], flightDepDate);
    if (retSegments[0]) writeFlightRow(12, retSegments[0], flightRetDate);
    if (retSegments[1]) writeFlightRow(13, retSegments[1], flightRetDate);

    if (depSegments.length > 2) {
      const extra = depSegments.slice(2).map(s => s.flightNo || s.raw).join(', ');
      const fCell7 = ws.getCell('F7');
      fCell7.value = `${fCell7.value || ''} / ${extra}`.trim();
      const fCell11 = ws.getCell('F11');
      fCell11.value = `${fCell11.value || ''} / ${extra}`.trim();
    }
    if (retSegments.length > 2) {
      const extra = retSegments.slice(2).map(s => s.flightNo || s.raw).join(', ');
      const fCell9 = ws.getCell('F9');
      fCell9.value = `${fCell9.value || ''} / ${extra}`.trim();
      const fCell13 = ws.getCell('F13');
      fCell13.value = `${fCell13.value || ''} / ${extra}`.trim();
    }

    // Đếm số lượng phòng
    let doubleCount = 0;
    let twinCount = 0;
    let singleCount = 0;
    const countedDouble = new Set();
    const countedTwin = new Set();
    members.forEach(m => {
      const rType = String(m.roomType || '').toLowerCase();
      const rCode = String(m.roomCode || '').trim().toLowerCase();
      const combinedRoom = `${rType} ${rCode}`;
      if (combinedRoom.includes('single') || combinedRoom.includes('đơn') || combinedRoom.includes('sgl')) {
        singleCount++;
      } else if (combinedRoom.includes('twin') || combinedRoom.includes('twn')) {
        if (rCode) {
          if (!countedTwin.has(rCode)) { countedTwin.add(rCode); twinCount++; }
        } else { twinCount += 0.5; }
      } else if (combinedRoom.includes('double') || combinedRoom.includes('đôi') || combinedRoom.includes('dbl')) {
        if (rCode) {
          if (!countedDouble.has(rCode)) { countedDouble.add(rCode); doubleCount++; }
        } else { doubleCount += 0.5; }
      }
    });
    ws.getCell('D16').value = Math.ceil(doubleCount) || '';
    ws.getCell('E16').value = Math.ceil(twinCount) || '';
    ws.getCell('F16').value = singleCount || '';

    // Fonts theo chuẩn mẫu Namelist BU2,4,5
    const redFont = { name: 'Times New Roman', size: 14, color: { argb: 'FFFF0000' } };
    const boldRedFont = { name: 'Times New Roman', size: 14, bold: true, color: { argb: 'FFFF0000' } };
    const blackFont = { name: 'Times New Roman', size: 14, color: { argb: 'FF000000' } };

    // Template có sẵn 11 hàng từ hàng 19 đến hàng 29 (không dùng dòng Team Leader mặc định)
    const templateRows = 11;
    if (members.length > templateRows) {
      const extraCount = members.length - templateRows;
      ws.duplicateRow(20, extraCount, true);
    }

    const dataCols = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

    // Điền danh sách hành khách BẮT ĐẦU TỪ HÀNG 19 (STT 1, 2, 3...)
    members.forEach((m, idx) => {
      const rIdx = 19 + idx;
      const { surname, givenName } = splitName(m.name);
      const rawG = String(m.gender || (m.isBooker ? m.bookerGender : '') || m.bookerGender || '').trim().toLowerCase();
      let gender = '';
      if (rawG && rawG !== 'chọn' && rawG !== 'none' && rawG !== '---' && rawG !== 'chua_ro') {
        if (rawG.includes('nữ') || rawG.includes('nu') || rawG === 'f' || rawG.includes('female') || rawG === 'w') {
          gender = 'Female';
        } else if (rawG.includes('nam') || rawG === 'm' || rawG.includes('male')) {
          gender = 'Male';
        }
      }

      ws.getCell(`A${rIdx}`).value = idx + 1;
      ws.getCell(`A${rIdx}`).font = blackFont;

      ws.getCell(`B${rIdx}`).value = surname;
      ws.getCell(`B${rIdx}`).font = boldRedFont;

      ws.getCell(`C${rIdx}`).value = givenName;
      ws.getCell(`C${rIdx}`).font = boldRedFont;

      ws.getCell(`D${rIdx}`).value = gender;
      ws.getCell(`D${rIdx}`).font = redFont;

      const dobDate = parseDateToUTC(m.dob);
      if (dobDate) {
        ws.getCell(`E${rIdx}`).value = dobDate;
        ws.getCell(`E${rIdx}`).numFmt = 'd mmm yyyy;@';
      } else {
        ws.getCell(`E${rIdx}`).value = '';
      }
      ws.getCell(`E${rIdx}`).font = redFont;

      ws.getCell(`F${rIdx}`).value = m.docId || '';
      ws.getCell(`F${rIdx}`).font = redFont;

      const doeDate = parseDateToUTC(m.expiryDate);
      if (doeDate) {
        ws.getCell(`G${rIdx}`).value = doeDate;
        ws.getCell(`G${rIdx}`).numFmt = 'd mmm yyyy;@';
      } else {
        ws.getCell(`G${rIdx}`).value = '';
      }
      ws.getCell(`G${rIdx}`).font = redFont;

      ws.getCell(`H${rIdx}`).value = (m.nationality && m.nationality !== 'Việt Nam' && m.nationality !== 'VN') ? m.nationality : 'VMN';
      ws.getCell(`H${rIdx}`).font = redFont;

      ws.getCell(`I${rIdx}`).value = m.phone || '';
      ws.getCell(`I${rIdx}`).font = redFont;

      ws.getCell(`J${rIdx}`).value = m.roomCode || m.roomType || '';
      ws.getCell(`J${rIdx}`).font = redFont;

      ws.getCell(`K${rIdx}`).value = m.salesPerson || '';
      ws.getCell(`K${rIdx}`).font = redFont;

      ws.getCell(`L${rIdx}`).value = m.bNote || m.note || '';
      ws.getCell(`L${rIdx}`).font = blackFont;

      ws.getCell(`M${rIdx}`).value = parseMoney(m.bTourPrice);
      ws.getCell(`M${rIdx}`).font = blackFont;

      ws.getCell(`N${rIdx}`).value = parseMoney(m.surcharge);
      ws.getCell(`N${rIdx}`).font = blackFont;

      ws.getCell(`O${rIdx}`).value = parseMoney(m.discount);
      ws.getCell(`O${rIdx}`).font = blackFont;

      ws.getCell(`P${rIdx}`).value = parseMoney(m.bTotal);
      ws.getCell(`P${rIdx}`).font = blackFont;

      ws.getCell(`Q${rIdx}`).value = parseMoney(m.bPaid);
      ws.getCell(`Q${rIdx}`).font = blackFont;

      ws.getCell(`R${rIdx}`).value = parseMoney(m.bRemaining);
      ws.getCell(`R${rIdx}`).font = blackFont;
    });

    // Dọn dẹp các hàng mẫu còn thừa từ (19 + members.length) đến 29
    for (let r = 19 + members.length; r <= 29; r++) {
      dataCols.forEach(col => {
        ws.getCell(`${col}${r}`).value = '';
      });
    }

    const safeTourCode = (tour.tour_code || 'Tour').replace(/[\s\/\\]+/g, '_');
    const safePrefix = bookingName ? `${bookingName.replace(/[\s\/\\]+/g, '_')}_` : '';
    const nowStr = new Date().toISOString().slice(0, 10);
    const finalFileName = `Namelist_BU245_${safePrefix}${safeTourCode}_${nowStr}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFileName)}"`);
    await wb.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting BU245 namelist:', error);
    res.status(500).json({ error: 'Lỗi khi xuất danh sách Namelist BU2,4,5' });
  }
};

