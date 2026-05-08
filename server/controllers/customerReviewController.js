const db = require('../db');
const fs = require('fs');
const { logActivity } = require('../utils/logger');
const path = require('path');

// Configure upload directory
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'reviews');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 50, source, bu_id, status, search } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE r.is_deleted = false';
    const values = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (r.reviewer_name ILIKE $${paramIndex} OR r.comment ILIKE $${paramIndex} OR r.guide_name ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (source) {
      whereClause += ` AND r.source = $${paramIndex++}`;
      values.push(source);
    }
    if (bu_id) {
      if (bu_id === 'null') {
        whereClause += ` AND r.bu_id IS NULL`;
      } else {
        whereClause += ` AND r.bu_id = $${paramIndex++}`;
        values.push(bu_id);
      }
    }
    if (status) {
      whereClause += ` AND r.approval_status = $${paramIndex++}`;
      values.push(status);
    }
    if (req.query.start_date) {
      whereClause += ` AND r.review_date >= $${paramIndex++}`;
      values.push(req.query.start_date);
    }
    if (req.query.end_date) {
      whereClause += ` AND r.review_date <= $${paramIndex++}`;
      values.push(req.query.end_date);
    }

    const query = `
      SELECT r.*, 
             TO_CHAR(r.review_date AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as review_date_str,
             u.full_name as created_by_name,
             a.full_name as approved_by_name,
             b.label as bu_name
      FROM customer_reviews r
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN users a ON r.approved_by = a.id
      LEFT JOIN business_units b ON r.bu_id = b.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    
    values.push(limit, offset);
    const result = await db.query(query, values);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM customer_reviews r ${whereClause}`;
    const countValues = values.slice(0, paramIndex - 2);
    const countResult = await db.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching customer reviews:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách đánh giá', error: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    const { reviewer_name, rating, comment, review_date, source, guide_name, bu_id } = req.body;
    const created_by = req.user.id;
    
    // Check duplicates (soft warning, but we still insert)
    const duplicateCheck = await db.query(
      'SELECT id FROM customer_reviews WHERE reviewer_name = $1 AND comment = $2 AND review_date = $3 AND is_deleted = false LIMIT 1',
      [reviewer_name, comment, review_date]
    );
    const isDuplicate = duplicateCheck.rows.length > 0;

    let proof_url = null;
    if (req.file) {
      proof_url = `/uploads/reviews/${req.file.filename}`;
    }

    const result = await db.query(`
      INSERT INTO customer_reviews 
      (reviewer_name, rating, comment, review_date, source, guide_name, bu_id, proof_url, created_by, approval_status, approved_by, approved_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'approved', $9, NOW())
      RETURNING *
    `, [reviewer_name, rating, comment, review_date, source || 'other', guide_name, bu_id || null, proof_url, created_by]);

    // Audit log
    await logActivity({
        user_id: created_by,
        action_type: 'CREATE',
        entity_type: 'CUSTOMER_REVIEW',
        entity_id: result.rows[0].id,
        details: `Tạo mới Đánh giá khách hàng từ nguồn ${source || 'other'}`,
        new_data: result.rows[0]
    });

    res.json({ 
      success: true, 
      message: isDuplicate ? 'Tạo đánh giá thành công (Có cảnh báo: Đánh giá này có thể bị trùng lặp).' : 'Tạo đánh giá thành công.', 
      isDuplicate,
      data: result.rows[0] 
    });
  } catch (error) {
    console.error('Error creating customer review:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi tạo đánh giá', error: error.message });
  }
};

exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'
    const approved_by = req.user.id;
    const role = req.user.role;

    if (role !== 'admin' && role !== 'manager' && role !== 'accountant') {
      return res.status(403).json({ success: false, message: 'Chỉ Quản lý hoặc Admin mới có quyền duyệt.' });
    }

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ.' });
    }

    const oldResult = await db.query('SELECT * FROM customer_reviews WHERE id = $1', [id]);
    const oldData = oldResult.rows[0];

    const result = await db.query(`
      UPDATE customer_reviews 
      SET approval_status = $1, approved_by = $2, approved_at = NOW()
      WHERE id = $3
      RETURNING *
    `, [status, approved_by, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }

    // Audit log
    await logActivity({
        user_id: approved_by,
        action_type: 'UPDATE',
        entity_type: 'CUSTOMER_REVIEW',
        entity_id: id,
        details: `Cập nhật trạng thái đánh giá khách hàng thành ${status}`,
        old_data: oldData,
        new_data: result.rows[0]
    });

    const statusText = status === 'approved' ? 'Phê duyệt' : (status === 'rejected' ? 'Từ chối' : 'Chờ duyệt');
    res.json({ success: true, message: `Đã ${statusText.toLowerCase()} đánh giá thành công.`, data: result.rows[0] });
  } catch (error) {
    console.error('Error approving customer review:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi duyệt đánh giá', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const role = req.user.role;

    if (role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Chỉ Admin mới có quyền xóa đánh giá.' });
    }

    const existing = await db.query('SELECT proof_url FROM customer_reviews WHERE id = $1', [id]);
    if (existing.rows.length > 0 && existing.rows[0].proof_url) {
      const filePath = path.join(__dirname, '..', existing.rows[0].proof_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Soft delete
    await db.query('UPDATE customer_reviews SET is_deleted = true WHERE id = $1', [id]);
    
    // Audit log
    await logActivity({
        user_id: req.user.id,
        action_type: 'DELETE',
        entity_type: 'CUSTOMER_REVIEW',
        entity_id: id,
        details: `Xóa đánh giá khách hàng ID ${id}`,
        old_data: existing.rows[0]
    });

    res.json({ success: true, message: 'Xóa đánh giá thành công.' });
  } catch (error) {
    console.error('Error deleting customer review:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi xóa đánh giá', error: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { month, year, bu_id } = req.query;

    let guideWhere = `WHERE is_deleted = false AND approval_status = 'approved' AND guide_name IS NOT NULL AND guide_name != ''`;
    const guideValues = [];
    let guideParamIndex = 1;

    if (month && month !== 'Tất cả' && year && year !== 'Tất cả') {
       guideWhere += ` AND EXTRACT(MONTH FROM review_date) = $${guideParamIndex++} AND EXTRACT(YEAR FROM review_date) = $${guideParamIndex++}`;
       guideValues.push(month, year);
    } else if (year && year !== 'Tất cả') {
       guideWhere += ` AND EXTRACT(YEAR FROM review_date) = $${guideParamIndex++}`;
       guideValues.push(year);
    }

    if (bu_id && bu_id !== 'Tất cả') {
       if (bu_id === 'null') {
          guideWhere += ` AND bu_id IS NULL`;
       } else {
          guideWhere += ` AND bu_id = $${guideParamIndex++}`;
          guideValues.push(bu_id);
       }
    }

    const guideStats = await db.query(`
      SELECT guide_name, COUNT(*) as total_reviews, ROUND(AVG(rating), 1) as avg_rating
      FROM customer_reviews 
      ${guideWhere}
      GROUP BY guide_name
      ORDER BY avg_rating DESC, total_reviews DESC
    `, guideValues);

    let buWhere = `WHERE r.is_deleted = false AND r.approval_status = 'approved'`;
    const buValues = [];
    let buParamIndex = 1;

    if (month && month !== 'Tất cả' && year && year !== 'Tất cả') {
       buWhere += ` AND EXTRACT(MONTH FROM r.review_date) = $${buParamIndex++} AND EXTRACT(YEAR FROM r.review_date) = $${buParamIndex++}`;
       buValues.push(month, year);
    } else if (year && year !== 'Tất cả') {
       buWhere += ` AND EXTRACT(YEAR FROM r.review_date) = $${buParamIndex++}`;
       buValues.push(year);
    }
    
    // Support filtering from outside (start_date, end_date)
    if (req.query.start_date) {
      buWhere += ` AND r.review_date >= $${buParamIndex++}`;
      buValues.push(req.query.start_date);
    }
    if (req.query.end_date) {
      buWhere += ` AND r.review_date <= $${buParamIndex++}`;
      buValues.push(req.query.end_date);
    }

    const buStats = await db.query(`
      SELECT COALESCE(b.label, 'Chưa xếp hạng') as bu_name, COUNT(r.*) as total_reviews, ROUND(AVG(r.rating), 1) as avg_rating
      FROM customer_reviews r
      LEFT JOIN business_units b ON r.bu_id = b.id
      ${buWhere}
      GROUP BY b.id, b.label
      ORDER BY avg_rating DESC, total_reviews DESC
    `, buValues);

    res.json({
      success: true,
      guideStats: guideStats.rows,
      buStats: buStats.rows
    });
  } catch (error) {
    console.error('Error fetching review stats:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi lấy thống kê', error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_name, rating, comment, review_date, source, guide_name, bu_id } = req.body;
    
    let proof_url = req.body.proof_url;
    if (req.file) {
      proof_url = `/uploads/reviews/${req.file.filename}`;
    }

    const oldResult = await db.query('SELECT * FROM customer_reviews WHERE id = $1', [id]);
    const oldData = oldResult.rows[0];

    if (!oldData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }

    const result = await db.query(`
      UPDATE customer_reviews 
      SET reviewer_name = COALESCE($1, reviewer_name),
          rating = COALESCE($2, rating),
          comment = COALESCE($3, comment),
          review_date = COALESCE($4, review_date),
          source = COALESCE($5, source),
          guide_name = COALESCE($6, guide_name),
          bu_id = COALESCE($7, bu_id),
          proof_url = COALESCE($8, proof_url)
      WHERE id = $9
      RETURNING *
    `, [reviewer_name, rating, comment, review_date, source, guide_name, bu_id, proof_url, id]);

    // Audit log
    await logActivity({
        user_id: req.user.id,
        action_type: 'UPDATE',
        entity_type: 'CUSTOMER_REVIEW',
        entity_id: id,
        details: `Cập nhật nội dung đánh giá khách hàng ID ${id}`,
        old_data: oldData,
        new_data: result.rows[0]
    });

    res.json({ success: true, message: 'Cập nhật đánh giá thành công.', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating customer review:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật đánh giá', error: error.message });
  }
};

exports.updateReviewBU = async (req, res) => {
  try {
    const { id } = req.params;
    const { bu_id } = req.body;
    
    const oldResult = await db.query('SELECT * FROM customer_reviews WHERE id = $1', [id]);
    const oldData = oldResult.rows[0];

    if (!oldData) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }

    const result = await db.query(`
      UPDATE customer_reviews 
      SET bu_id = $1
      WHERE id = $2
      RETURNING *
    `, [bu_id || null, id]);

    await logActivity({
        user_id: req.user.id,
        action_type: 'UPDATE',
        entity_type: 'CUSTOMER_REVIEW',
        entity_id: id,
        details: `Cập nhật BU đánh giá khách hàng ID ${id}`,
        old_data: oldData,
        new_data: result.rows[0]
    });

    res.json({ success: true, message: 'Cập nhật BU thành công.', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating BU for customer review:', error);
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật BU', error: error.message });
  }
};
