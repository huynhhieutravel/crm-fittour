const db = require('../db');

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
            conditions.push(`EXTRACT(YEAR FROM lr.start_date) = $${params.length - 1} AND EXTRACT(MONTH FROM lr.start_date) = $${params.length}`);
        } else if (year) {
            params.push(year);
            conditions.push(`EXTRACT(YEAR FROM lr.start_date) = $${params.length}`);
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
                   COALESCE(lb.total_days, (SELECT NULLIF(value, '')::numeric FROM settings WHERE key = 'leave_default_days'), 12) - COALESCE(lb.used_days, 0) as available_days
            FROM leave_requests lr
            JOIN users u ON lr.user_id = u.id
            LEFT JOIN teams t ON u.team_id = t.id
            LEFT JOIN users h ON lr.handover_user_id = h.id
            LEFT JOIN users a ON lr.approved_by = a.id
            LEFT JOIN leave_balances lb ON lb.user_id = lr.user_id AND lb.year = EXTRACT(YEAR FROM lr.start_date)
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
        
        // Ensure user only sees their own balance unless manager
        if (parseInt(userId) !== req.user.id && !isManager(req.user)) {
             return res.status(403).json({ error: 'Không được phép xem quỹ phép của người khác' });
        }

        const balRes = await db.query(`SELECT * FROM leave_balances WHERE user_id = $1 AND year = $2`, [userId, year]);
        
        if (balRes.rows.length === 0) {
            // Read default from settings
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
    let client;
    try {
        const { target_user_id, leave_type, leave_dates, reason, contact_phone, handover_user_id, handover_note, approved_by } = req.body;
        
        if (!Array.isArray(leave_dates) || leave_dates.length === 0) {
            return res.status(400).json({ error: 'Vui lòng chọn ít nhất một ngày nghỉ' });
        }
        if (leave_dates.length > 30) {
            return res.status(400).json({ error: 'Không thể xin nghỉ quá 30 ngày trong một đơn' });
        }

        const applyForId = target_user_id || req.user.id;
        
        let actual_start_date = null;
        let actual_end_date = null;
        let calculated_total_units = 0;
        
        const datesSet = new Set();
        const dateValuesForQuery = [];
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const maxFutureDate = new Date();
        maxFutureDate.setDate(today.getDate() + 180);
        const minPastDate = new Date();
        minPastDate.setDate(today.getDate() - 14);

        for (const d of leave_dates) {
            if (datesSet.has(d.date)) {
                return res.status(400).json({ error: `Ngày ${d.date} bị trùng lặp trong đơn` });
            }
            datesSet.add(d.date);
            const dateObj = new Date(d.date);
            
            if (req.user.role !== 'admin' && req.user.role !== 'hr') {
                if (dateObj > maxFutureDate) {
                    return res.status(400).json({ error: `Không thể xin phép vượt quá 180 ngày trong tương lai (${d.date})` });
                }
                if (dateObj < minPastDate) {
                    return res.status(400).json({ error: `Không thể xin phép cho ngày cách đây quá 14 ngày (${d.date})` });
                }
            }

            const dayOfWeek = dateObj.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) {
                return res.status(400).json({ error: `Không thể chọn Thứ 7 hoặc Chủ Nhật (${d.date})` });
            }
            
            let units = 2;
            if (d.session === 'morning' || d.session === 'afternoon') units = 1;
            calculated_total_units += units;
            
            dateValuesForQuery.push(d.date);
        }

        const sortedDates = [...leave_dates].map(d => d.date).sort();
        actual_start_date = sortedDates[0];
        actual_end_date = sortedDates[sortedDates.length - 1];

        const calculated_total_days = calculated_total_units / 2;

        if (!leave_type || !actual_start_date || !actual_end_date || calculated_total_days <= 0) {
            return res.status(400).json({ error: 'Vui lòng điền đủ thông tin ngày và loại nghỉ' });
        }

        client = await db.pool.connect();
        
        // Chống overlap
        const overlapCheckQuery = `
            SELECT lrd.leave_date 
            FROM leave_request_dates lrd
            JOIN leave_requests lr ON lr.id = lrd.leave_request_id
            WHERE lr.user_id = $1 
            AND lrd.leave_date = ANY($2::date[]) 
            AND lr.status IN ('pending', 'approved')
            LIMIT 1
        `;
        const overlapResult = await client.query(overlapCheckQuery, [applyForId, dateValuesForQuery]);
        if (overlapResult.rows.length > 0) {
            const overlappedDate = new Date(overlapResult.rows[0].leave_date).toLocaleDateString('vi-VN');
            client.release();
            return res.status(400).json({ error: `Ngày ${overlappedDate} đã tồn tại trong một đơn xin nghỉ phép khác đang chờ duyệt hoặc đã duyệt.` });
        }

        await client.query('BEGIN');

        const q = `
            INSERT INTO leave_requests (
                user_id, leave_type, start_date, end_date, total_days, reason, 
                contact_phone, handover_user_id, handover_note, status, approved_by, approved_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'approved', $10, NOW()) RETURNING *;
        `;
        const params = [
            applyForId, leave_type, actual_start_date, actual_end_date, calculated_total_days, reason, 
            contact_phone, handover_user_id || null, handover_note, approved_by || null
        ];
        
        const result = await client.query(q, params);
        const newLeave = result.rows[0];

        // Insert leave dates
        const dateValues = [];
        const dateParams = [];
        let paramCount = 1;
        for (const d of leave_dates) {
            dateValues.push(`($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`);
            dateParams.push(newLeave.id, d.date, d.duration || 1, d.session || 'full');
        }
        
        const qDates = `
            INSERT INTO leave_request_dates (leave_request_id, leave_date, duration, session_type)
            VALUES ${dateValues.join(', ')}
        `;
        await client.query(qDates, dateParams);

        await client.query('COMMIT');

        try {
            if (req.user.id !== parseInt(applyForId)) {
                await db.query(`
                    INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details)
                    VALUES ($1, 'CREATE', 'LEAVE_REQUEST', $2, $3)
                `, [req.user.id, newLeave.id, `Tạo dùm đơn xin nghỉ cho nhân viên (ID: ${applyForId})`]);
            } else {
                 await db.query(`
                    INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details)
                    VALUES ($1, 'CREATE', 'LEAVE_REQUEST', $2, $3)
                `, [req.user.id, newLeave.id, `Tự tạo đơn xin nghỉ`]);
            }
        } catch (logErr) {
            console.error("Failed to log activity", logErr);
        }

        res.status(201).json(newLeave);
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        if (client) client.release();
    }
};

// Quản lý: Duyệt đơn
exports.approveLeave = async (req, res) => {
    try {
        if (!isManager(req.user)) return res.status(403).json({ error: 'Chỉ Quản lý hoặc Admin mới có quyền duyệt đơn' });
        
        const { id } = req.params;
        const q = `
            UPDATE leave_requests 
            SET status = 'approved', approved_by = $1, approved_at = NOW(), updated_at = NOW()
            WHERE id = $2 RETURNING *;
        `;
        const result = await db.query(q, [req.user.id, id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Đơn không tồn tại' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Quản lý: Từ chối đơn
exports.rejectLeave = async (req, res) => {
    try {
        if (!isManager(req.user)) return res.status(403).json({ error: 'Chỉ Quản lý hoặc Admin mới có quyền từ chối đơn' });
        
        const { id } = req.params;
        const { reject_reason } = req.body;
        
        const q = `
            UPDATE leave_requests 
            SET status = 'rejected', approved_by = $1, approved_at = NOW(), reject_reason = $2, updated_at = NOW()
            WHERE id = $3 RETURNING *;
        `;
        const result = await db.query(q, [req.user.id, reject_reason, id]);
        
        if (result.rows.length === 0) return res.status(404).json({ error: 'Đơn không tồn tại' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Xóa/Hủy đơn (Chủ đơn huỷ khi pending)
exports.deleteLeave = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get the leave request first
        const lr = await db.query(`SELECT * FROM leave_requests WHERE id = $1`, [id]);
        if (lr.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn' });
        
        const leave = lr.rows[0];
        
        if (leave.user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Không có quyền xóa đơn này' });
        }
        
        const today = new Date();
        today.setHours(0,0,0,0);
        const startDate = new Date(leave.start_date);
        
        if (leave.status !== 'pending' && startDate < today && req.user.role !== 'admin') {
            return res.status(400).json({ error: 'Không thể hủy đơn đã qua hạn hoặc đã bắt đầu nghỉ' });
        }
        
        await db.query(`UPDATE leave_requests SET status = 'cancelled', updated_at = NOW() WHERE id = $1`, [id]);
        
        try {
            await db.query(`
                INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details)
                VALUES ($1, 'UPDATE', 'LEAVE_REQUEST', $2, $3)
            `, [req.user.id, id, `Đã hủy đơn xin nghỉ phép từ ngày ${new Date(leave.start_date).toLocaleDateString('vi-VN')} của ID: ${leave.user_id}`]);
        } catch (logErr) {
            console.error("Failed to log activity", logErr);
        }

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

        // Cập nhật hoặc chèn mới cho những ID được chọn
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
            LEFT JOIN leave_request_dates lrd ON lrd.leave_request_id = lr.id
            WHERE lr.status = 'approved'
            AND (
                lrd.leave_date = CURRENT_DATE 
                OR 
                (lrd.id IS NULL AND CURRENT_DATE >= lr.start_date AND CURRENT_DATE <= lr.end_date)
            )
            ORDER BY lr.id, u.full_name
        `;
        const result = await db.query(q);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
