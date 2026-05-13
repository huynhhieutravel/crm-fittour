const db = require('../db');
const leaveService = require('../services/leaveService');

function isManager(user) {
    if (!user) return false;
    return ['admin', 'manager', 'group_manager', 'operations_lead'].includes(user.role) || user.role.includes('manager') || user.role.includes('lead');
}

// Lấy danh sách đơn xin nghỉ (Có phân trang, bộ lọc)
exports.getLeaves = async (req, res) => {
    try {
        const { page = 1, limit = 20, status, user_id, month, year } = req.query;
        const offset = (page - 1) * limit;
        
        let conditions = [];
        let params = [];

        // Nếu không phải Manager/Admin, chỉ được xem đơn của bản thân
        if (!isManager(req.user)) {
            params.push(req.user.id);
            conditions.push(`lr.user_id = $${params.length}`);
        } else if (user_id) {
            params.push(user_id);
            conditions.push(`lr.user_id = $${params.length}`);
        }

        if (status) {
            params.push(status);
            conditions.push(`lr.status = $${params.length}`);
        }

        if (month && year) {
            params.push(year, month);
            conditions.push(`EXISTS (SELECT 1 FROM leave_request_dates d WHERE d.leave_request_id = lr.id AND EXTRACT(YEAR FROM d.leave_date) = $${params.length - 1} AND EXTRACT(MONTH FROM d.leave_date) = $${params.length})`);
        } else if (year) {
            params.push(year);
            conditions.push(`EXISTS (SELECT 1 FROM leave_request_dates d WHERE d.leave_request_id = lr.id AND EXTRACT(YEAR FROM d.leave_date) = $${params.length})`);
        }
        
        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const countQuery = `SELECT COUNT(*) FROM leave_requests lr ${whereClause}`;
        const countRes = await db.query(countQuery, params);
        const totalRows = parseInt(countRes.rows[0].count);

        const dataQuery = `
            SELECT lr.*, 
                   u.full_name as user_name, u.avatar_url, t.name as team_name,
                   h.full_name as handover_name,
                   a.full_name as approved_by_name,
                   COALESCE(lb.total_days, (SELECT NULLIF(value, '')::numeric FROM settings WHERE key = 'leave_default_days'), 12) - COALESCE(lb.used_days, 0) as available_days,
                   (
                       SELECT json_agg(json_build_object('date', d.leave_date, 'session', d.session_type) ORDER BY d.leave_date ASC)
                       FROM leave_request_dates d
                       WHERE d.leave_request_id = lr.id
                   ) as dates,
                   (SELECT MIN(d.leave_date) FROM leave_request_dates d WHERE d.leave_request_id = lr.id) as first_leave_date
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN teams t ON u.team_id = t.id
            LEFT JOIN users h ON lr.handover_user_id = h.id
            LEFT JOIN users a ON lr.approved_by = a.id
            LEFT JOIN leave_balances lb ON lb.user_id = lr.user_id AND lb.year = EXTRACT(YEAR FROM (SELECT MIN(d.leave_date) FROM leave_request_dates d WHERE d.leave_request_id = lr.id))
            ${whereClause}
            ORDER BY lr.created_at DESC
            LIMIT $${params.length + 1} OFFSET $${params.length + 2}
        `;
        const dataRes = await db.query(dataQuery, [...params, limit, offset]);

        res.json({
            data: dataRes.rows,
            pagination: {
                total: totalRows,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(totalRows / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Tra cứu số dư phép cá nhân
exports.getMyBalance = async (req, res) => {
    try {
        const year = req.query.year || new Date().getFullYear();
        const userId = req.params.userId || req.user.id;
        
        if (parseInt(userId) !== req.user.id && !isManager(req.user)) {
             return res.status(403).json({ error: 'Không được phép xem quỹ phép của người khác' });
        }

        const balRes = await db.query(`SELECT * FROM leave_balances WHERE user_id = $1 AND year = $2`, [userId, year]);
        
        if (balRes.rows.length === 0) {
            const setRes = await db.query("SELECT value FROM settings WHERE key = 'leave_default_days'");
            let defaultDays = 12.0;
            if (setRes.rows.length > 0 && setRes.rows[0].value) {
                defaultDays = parseFloat(setRes.rows[0].value);
            }
            return res.json({ total_days: defaultDays, used_days: 0.0, available: defaultDays });
        }
        
        let { total_days, used_days } = balRes.rows[0];
        total_days = parseFloat(total_days) || 0;
        used_days = parseFloat(used_days) || 0;
        
        res.json({ total_days, used_days, available: total_days - used_days });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Tạo đơn xin nghỉ
exports.createLeave = async (req, res) => {
    try {
        if (!Array.isArray(req.body.leave_dates) || req.body.leave_dates.length === 0) {
            return res.status(400).json({ error: 'Vui lòng chọn ít nhất một ngày nghỉ' });
        }
        const newLeave = await leaveService.createLeave(req.body, req.user);
        res.status(201).json(newLeave);
    } catch (err) {
        if (err.message.includes('trùng lặp') || err.message.includes('tồn tại')) {
             return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật đơn xin nghỉ
exports.updateLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const lr = await db.query(`SELECT * FROM leave_requests WHERE id = $1`, [id]);
        if (lr.rows.length === 0) return res.status(404).json({ error: 'Đơn không tồn tại' });
        const leave = lr.rows[0];
        
        if (leave.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền sửa đơn này' });
        }
        if (leave.status !== 'pending' && req.user.role !== 'admin') {
            return res.status(400).json({ error: 'Chỉ có thể sửa đơn khi đang chờ duyệt' });
        }

        const updatedLeave = await leaveService.updateLeave(id, req.body, req.user);
        res.json(updatedLeave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Quản lý: Duyệt đơn
exports.approveLeave = async (req, res) => {
    try {
        if (!isManager(req.user)) return res.status(403).json({ error: 'Chỉ Quản lý hoặc Admin mới có quyền duyệt đơn' });
        const leave = await leaveService.changeStatus(req.params.id, 'approved', req.user);
        res.json(leave);
    } catch (err) {
        if (err.message.includes('trạng thái chờ duyệt')) return res.status(409).json({ error: err.message });
        res.status(500).json({ error: err.message });
    }
};

// Quản lý: Từ chối đơn
exports.rejectLeave = async (req, res) => {
    try {
        if (!isManager(req.user)) return res.status(403).json({ error: 'Chỉ Quản lý hoặc Admin mới có quyền từ chối đơn' });
        const leave = await leaveService.changeStatus(req.params.id, 'rejected', req.user, req.body.reject_reason);
        res.json(leave);
    } catch (err) {
        if (err.message.includes('trạng thái chờ duyệt')) return res.status(409).json({ error: err.message });
        res.status(500).json({ error: err.message });
    }
};

// Quản lý: Chuyển đơn về trạng thái Chờ duyệt (Undo)
exports.revertToPending = async (req, res) => {
    try {
        if (!isManager(req.user)) return res.status(403).json({ error: 'Chỉ Quản lý hoặc Admin mới có quyền thao tác' });
        const leave = await leaveService.changeStatus(req.params.id, 'pending', req.user);
        res.json(leave);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa/Hủy đơn
exports.deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;
        const lr = await db.query(`SELECT * FROM leave_requests WHERE id = $1`, [id]);
        if (lr.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn' });
        const leave = lr.rows[0];
        
        if (leave.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền xóa đơn này' });
        }
        
        const datesRes = await db.query('SELECT MIN(leave_date) as first_date FROM leave_request_dates WHERE leave_request_id = $1', [id]);
        const firstDate = datesRes.rows.length > 0 ? new Date(datesRes.rows[0].first_date) : null;
        
        const today = new Date();
        today.setHours(0,0,0,0);
        
        if (leave.status !== 'pending' && firstDate && firstDate < today && req.user.role !== 'admin') {
            return res.status(400).json({ error: 'Không thể hủy đơn đã qua hạn hoặc đã bắt đầu nghỉ' });
        }

        await leaveService.deleteLeave(id, req.user);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xem toàn bộ ngày phép (Cho màn hình cấu hình Của Admin/HR)
exports.getAllBalances = async (req, res) => {
    try {
       if (!isManager(req.user)) return res.status(403).json({ error: 'Access denied' });
       const year = req.query.year || new Date().getFullYear();
       
       const q = `
           SELECT u.id as user_id, 
                  u.full_name, 
                  u.username, 
                  (SELECT t.name FROM team_members tmb JOIN teams t ON tmb.team_id = t.id WHERE tmb.user_id = u.id LIMIT 1) as team_name,
                  COALESCE(b.total_days, (SELECT NULLIF(value, '')::numeric FROM settings WHERE key = 'leave_default_days'), 12) as total_days,
                  COALESCE(b.used_days, 0) as used_days,
                  b.id as balance_id
           FROM users u
           LEFT JOIN leave_balances b ON b.user_id = u.id AND b.year = $1
           WHERE u.is_active = true
           ORDER BY team_name NULLS LAST, u.full_name
       `;
       const result = await db.query(q, [year]);
       res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật cấu hình phép cho nhiều nhân viên (Bulk edit)
exports.bulkUpdateBalance = async (req, res) => {
    try {
        if (!isManager(req.user)) return res.status(403).json({ error: 'Access denied' });
        const { year, total_days, userIds } = req.body;
        
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ error: 'Danh sách nhân viên không hợp lệ' });
        }

        const q = `
            INSERT INTO leave_balances (user_id, year, total_days, used_days)
            SELECT unnest($1::int[]), $2, $3, 0
            ON CONFLICT (user_id, year) 
            DO UPDATE SET total_days = $3;
        `;
        await db.query(q, [userIds, year, parseFloat(total_days)]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật cấu hình ngày phép (Admin/HR)
exports.updateBalance = async (req, res) => {
    try {
        if (!isManager(req.user)) return res.status(403).json({ error: 'Access denied' });
        const { user_id, year, total_days } = req.body;
        
        const q = `
            INSERT INTO leave_balances (user_id, year, total_days, used_days)
            VALUES ($1, $2, $3, 0)
            ON CONFLICT (user_id, year) 
            DO UPDATE SET total_days = $3
            RETURNING *;
        `;
        const result = await db.query(q, [user_id, year, parseFloat(total_days)]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Today on leave
exports.getTodayLeaves = async (req, res) => {
    try {
        const q = `
            SELECT DISTINCT ON (lr.id) lr.*, u.full_name, u.avatar_url, t.name as team_name, h.full_name as handover_name,
                   lrd.duration, lrd.session_type
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN teams t ON u.team_id = t.id
            LEFT JOIN users h ON lr.handover_user_id = h.id
            JOIN leave_request_dates lrd ON lrd.leave_request_id = lr.id
            WHERE lr.status = 'approved'
            AND lrd.leave_date = CURRENT_DATE
            ORDER BY lr.id, u.full_name
        `;
        const result = await db.query(q);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
