const db = require('../db');

exports.getAllOpTours = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM op_tours ORDER BY start_date DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error in getAllOpTours:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.getOpTourById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM op_tours WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tour' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in getOpTourById:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
};

exports.createOpTour = async (req, res) => {
  const { tour_code, tour_name, start_date, end_date, market, status, tour_info, revenues, expenses, guides, itinerary } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO op_tours 
       (tour_code, tour_name, start_date, end_date, market, status, tour_info, revenues, expenses, guides, itinerary) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [tour_code, tour_name, start_date, end_date, market, status, tour_info || '{}', revenues || '[]', expenses || '[]', guides || '[]', itinerary]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in createOpTour:', error);
    res.status(500).json({ error: 'Lỗi khi tạo tour mới' });
  }
};

exports.updateOpTour = async (req, res) => {
  const { id } = req.params;
  const { tour_code, tour_name, start_date, end_date, market, status, total_revenue, actual_revenue, total_expense, profit, tour_info, revenues, expenses, guides, itinerary } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE op_tours 
       SET tour_code = $1, tour_name = $2, start_date = $3, end_date = $4, market = $5, status = $6, 
           total_revenue = $7, actual_revenue = $8, total_expense = $9, profit = $10,
           tour_info = $11, revenues = $12, expenses = $13, guides = $14, itinerary = $15, 
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $16 RETURNING *`,
       [tour_code, tour_name, start_date, end_date, market, status, total_revenue, actual_revenue, total_expense, profit, tour_info, revenues, expenses, guides, itinerary, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error in updateOpTour:', error);
    res.status(500).json({ error: 'Lỗi khi cập nhật tour' });
  }
};

exports.deleteOpTour = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM op_tours WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Không tìm thấy tour' });
    res.json({ message: 'Xóa tour thành công' });
  } catch (error) {
    console.error('Error in deleteOpTour:', error);
    res.status(500).json({ error: 'Lỗi khi xóa tour' });
  }
};

exports.addOpTourBooking = async (req, res) => {
  const { id } = req.params;
  const bookingData = req.body;
  
  try {
    // 1. Lấy dữ liệu tour hiện tại
    const tourRes = await db.query('SELECT revenues FROM op_tours WHERE id = $1', [id]);
    if (tourRes.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tour' });
    }
    
    let revenues = tourRes.rows[0].revenues || [];
    if (typeof revenues === 'string') {
      try { revenues = JSON.parse(revenues); } catch(e) { revenues = []; }
    }
    
    // Xử lý Edit hoặc Create
    let newBooking;
    if (bookingData.id) {
       // Thao tác Cập nhật
       const existingIndex = revenues.findIndex(b => b.id === bookingData.id);
       if (existingIndex > -1) {
          const oldBooking = revenues[existingIndex];
          newBooking = {
             ...oldBooking,
             ...bookingData,
             updated_at: new Date().toISOString()
          };
          revenues[existingIndex] = newBooking;
       } else {
          // Fallback nếu không khớp id
          newBooking = {
            ...bookingData,
            created_at: new Date().toISOString()
          };
          revenues.push(newBooking);
       }
    } else {
       // Thao tác Tạo mới
       newBooking = {
         ...bookingData,
         id: `BK_${Date.now()}_${Math.floor(Math.random()*1000)}`,
         created_at: new Date().toISOString()
       };
       revenues.push(newBooking);
    }
    
    // 2. Cập nhật lại mảng revenues vào op_tours
    await db.query(
      'UPDATE op_tours SET revenues = $1 WHERE id = $2',
      [JSON.stringify(revenues), id]
    );

    // 3. Tự động xử lý danh sách khách hàng đi kèm (Upsert vào bảng customers)
    const members = bookingData.raw_details?.members || [];
    for (const m of members) {
      if (m.phone && m.phone.trim() !== '') {
        const phone = m.phone.replace(/[\\s\\-\\.]/g, '');
        const name = m.name ? m.name.toUpperCase().trim() : 'KHÁCH ĐI KÈM';
        const cmnd = m.docId || '';
        const dob = m.dob || null;
        
        // Kiểm tra xem khách hàng đã tồn tại chưa
        const custCheck = await db.query(
          `SELECT id, past_trip_count FROM customers 
           WHERE REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = $1 
              OR REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', '') = $2`,
          [phone, phone.replace(/^0/, '')]
        );

        if (custCheck.rows.length > 0) {
           // Đã tồn tại -> Chỉ tăng past_trip_count nếu cần + Cập nhật CMND nếu trống
           const custFound = custCheck.rows[0];
           await db.query(
             `UPDATE customers 
              SET past_trip_count = COALESCE(past_trip_count, 0) + 1,
                  id_card = COALESCE(id_card, NULLIF($1, '')),
                  birth_date = COALESCE(birth_date, NULLIF($2, '')::date)
              WHERE id = $3`,
             [cmnd, dob, custFound.id]
           );
        } else {
           // Chưa tồn tại -> Tạo mới Customer
           await db.query(
             `INSERT INTO customers 
              (name, phone, id_card, birth_date, customer_segment, past_trip_count)
              VALUES ($1, $2, $3, NULLIF($4, '')::date, $5, 1)`,
             [name, m.phone.trim(), cmnd, dob, 'New Customer']
           );
        }
      }
    }

    res.status(200).json({ message: 'Thêm Booking thành công', booking: newBooking });
  } catch (error) {
    console.error('Error in addOpTourBooking:', error);
    res.status(500).json({ error: 'Lỗi khi lưu Booking' });
  }
};

