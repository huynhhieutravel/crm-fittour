const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/public/reviews
// Lấy 20 review mới nhất chưa bị xóa để hiển thị trên web public
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const maxLimit = Math.min(limit, 50); // Cap at 50 to prevent abuse
    const offset = parseInt(req.query.offset) || 0;

    const query = `
      SELECT 
        reviewer_name, 
        rating, 
        comment, 
        review_date, 
        source, 
        photo_count,
        proof_url
      FROM customer_reviews 
      WHERE is_deleted = false 
        AND rating >= 4 -- Chỉ lấy review 4, 5 sao
      ORDER BY review_date DESC 
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query(query, [maxLimit, offset]);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Lỗi Public Reviews API:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Lỗi hệ thống khi lấy dữ liệu đánh giá.' 
    });
  }
});

module.exports = router;
