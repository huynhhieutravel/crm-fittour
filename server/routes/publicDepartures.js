const express = require('express');
const router = express.Router();
const db = require('../db');
const rateLimit = require('express-rate-limit');

/**
 * Public API cho Lịch Khởi Hành — Dành cho khách hàng & ChatGPT Bot.
 * KHÔNG YÊU CẦU XÁC THỰC. Chỉ trả dữ liệu an toàn (công khai).
 * Tuyệt đối KHÔNG trả: giá vốn, ghi chú nội bộ, thông tin HDV, thông tin khách.
 */

// Rate limiting: 60 requests/phút/IP
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' }
});
router.use(limiter);

// GET /api/public/departures
router.get('/', async (req, res) => {
  try {
    const { country, month, year, available, search } = req.query;
    const targetYear = year || new Date().getFullYear();

    let query = `
      SELECT 
        td.id,
        td.code as departure_code,
        tt.name as tour_name,
        tt.destination,
        tt.duration,
        tt.bu_group,
        tt.image_url,
        tt.website_link,
        tt.highlights,
        td.start_date,
        td.end_date,
        td.actual_price,
        td.discount_price,
        td.price_child_6_11,
        td.price_child_2_5,
        td.price_infant,
        td.single_room_supplement,
        td.visa_fee,
        td.tip_fee,
        td.max_participants,
        td.status,
        td.deadline_booking,
        td.departure_card_data,
        (SELECT COALESCE(SUM(pax_count), 0) 
         FROM bookings 
         WHERE tour_departure_id = td.id 
         AND booking_status NOT IN ('Huỷ')) as sold_pax
      FROM tour_departures td
      JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE COALESCE(tt.is_active, true) = true
        AND td.status IN ('Mở bán', 'Sắp chạy', 'Đã đầy', 'Chắc chắn đi')
        AND td.start_date >= CURRENT_DATE
        AND EXTRACT(YEAR FROM td.start_date) = $1
    `;
    const params = [targetYear];
    let paramCount = 1;

    if (country) {
      paramCount++;
      query += ` AND (tt.destination ILIKE $${paramCount} OR tt.name ILIKE $${paramCount} OR tt.bu_group ILIKE $${paramCount})`;
      params.push(`%${country}%`);
    }

    if (month) {
      paramCount++;
      query += ` AND EXTRACT(MONTH FROM td.start_date) = $${paramCount}`;
      params.push(month);
    }

    if (search) {
      paramCount++;
      query += ` AND (tt.name ILIKE $${paramCount} OR tt.destination ILIKE $${paramCount} OR tt.highlights ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY td.start_date ASC`;

    const result = await db.query(query, params);

    // Transform data — chỉ trả trường an toàn, tính số chỗ còn
    const departures = result.rows.map(row => {
      const remaining = Math.max(0, (row.max_participants || 0) - (parseInt(row.sold_pax) || 0));
      const cardData = row.departure_card_data;
      const hasData = cardData && typeof cardData === 'object' && Object.keys(cardData).length > 0;
      return {
        tour_name: row.tour_name,
        destination: row.destination,
        duration: row.duration,
        bu_group: row.bu_group,
        departure_code: row.departure_code,
        start_date: row.start_date,
        end_date: row.end_date,
        actual_price: row.actual_price ? Number(row.actual_price) : null,
        discount_price: row.discount_price ? Number(row.discount_price) : null,
        price_child_6_11: row.price_child_6_11 ? Number(row.price_child_6_11) : null,
        price_child_2_5: row.price_child_2_5 ? Number(row.price_child_2_5) : null,
        price_infant: row.price_infant ? Number(row.price_infant) : null,
        single_room_supplement: row.single_room_supplement ? Number(row.single_room_supplement) : null,
        visa_fee: row.visa_fee ? Number(row.visa_fee) : null,
        tip_fee: row.tip_fee ? Number(row.tip_fee) : null,
        max_participants: row.max_participants,
        seats_remaining: remaining,
        availability: remaining > 0 ? (remaining <= 3 ? 'Sắp đầy' : 'Còn chỗ') : 'Hết chỗ',
        status: row.status,
        deadline_booking: row.deadline_booking,
        image_url: row.image_url,
        website_link: row.website_link,
        highlights: row.highlights,
        has_card_data: !!hasData,
      };
    });

    // Nếu có filter available=true, chỉ trả tour còn chỗ
    const filtered = available === 'true' 
      ? departures.filter(d => d.seats_remaining > 0) 
      : departures;

    res.json({
      total: filtered.length,
      year: Number(targetYear),
      departures: filtered,
    });

  } catch (error) {
    console.error('Lỗi Public Departures API:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// GET /api/public/departures/:code
// Dành cho trang Thẻ Khởi Hành (Astro)
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const query = `
      SELECT 
        td.code as departure_code,
        tt.name as tour_name,
        tt.destination,
        tt.duration,
        tt.website_link,
        td.start_date,
        td.end_date,
        td.departure_card_data
      FROM tour_departures td
      JOIN tour_templates tt ON td.tour_template_id = tt.id
      WHERE td.code = $1
    `;
    const result = await db.query(query, [code]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy lịch khởi hành' });
    }

    const row = result.rows[0];
    res.json({
      tour_name: row.tour_name,
      destination: row.destination,
      duration: row.duration,
      website_link: row.website_link,
      departure_code: row.departure_code,
      start_date: row.start_date,
      end_date: row.end_date,
      departure_card_data: row.departure_card_data || {}
    });
  } catch (error) {
    console.error('Lỗi Public Departure Card API:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

module.exports = router;
