const db = require('../db');
const { logActivity } = require('../utils/logger');

// ═══════════════════════════════════════════════════════════
// GET /api/cskh/stats — Dashboard statistics
// ═══════════════════════════════════════════════════════════
exports.getStats = async (req, res) => {
    try {
        const colorCounts = await db.query(`
            SELECT priority_color, COUNT(*)::int as cnt 
            FROM cskh_tasks 
            WHERE status IN ('pending','in_progress','overdue') 
            GROUP BY priority_color
        `);
        const statusCounts = await db.query(`
            SELECT status, COUNT(*)::int as cnt 
            FROM cskh_tasks 
            GROUP BY status
        `);
        const todayDue = await db.query(`
            SELECT COUNT(*)::int as cnt 
            FROM cskh_tasks 
            WHERE due_date <= CURRENT_DATE AND status IN ('pending','overdue')
        `);
        res.json({
            by_color: colorCounts.rows,
            by_status: statusCounts.rows,
            today_due: todayDue.rows[0]?.cnt || 0
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════
// GET /api/cskh/tasks — List tasks with filters
// ═══════════════════════════════════════════════════════════
exports.getTasks = async (req, res) => {
    try {
        const { status, color, search, assigned_to, page = 1, limit = 30 } = req.query;
        const conditions = [];
        const params = [];
        let paramIdx = 1;

        // Status filter
        if (status === 'active') {
            conditions.push(`t.status IN ('pending','in_progress','overdue')`);
        } else if (status === 'completed') {
            conditions.push(`t.status = 'completed'`);
        } else if (status === 'canceled') {
            conditions.push(`t.status = 'canceled'`);
        } else if (!status || status === 'all') {
            // no filter
        } else {
            conditions.push(`t.status = $${paramIdx++}`);
            params.push(status);
        }

        // Color filter
        if (color && color !== 'all') {
            conditions.push(`t.priority_color = $${paramIdx++}`);
            params.push(color);
        }

        // Search
        if (search) {
            conditions.push(`(c.name ILIKE $${paramIdx} OR c.phone ILIKE $${paramIdx})`);
            params.push(`%${search}%`);
            paramIdx++;
        }

        // Assigned to
        if (assigned_to) {
            conditions.push(`t.assigned_to = $${paramIdx++}`);
            params.push(parseInt(assigned_to));
        }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Count
        const countRes = await db.query(`
            SELECT COUNT(*)::int as total 
            FROM cskh_tasks t 
            JOIN customers c ON t.customer_id = c.id 
            ${where}
        `, params);

        // Main query
        const sql = `
            SELECT t.*, 
                   c.name as customer_name, c.phone as customer_phone, c.email as customer_email,
                   c.customer_segment, c.assigned_to as customer_staff,
                   r.rule_name, r.trigger_event, r.description as rule_description,
                   u_assigned.full_name as assigned_name,
                   u_resolved.full_name as resolved_name,
                   (SELECT MAX(td.start_date) 
                    FROM tour_departures td 
                    JOIN bookings b ON b.tour_departure_id = td.id 
                    WHERE b.customer_id = t.customer_id AND td.start_date > CURRENT_DATE
                   ) as next_departure,
                   (SELECT MAX(td2.end_date) 
                    FROM tour_departures td2 
                    JOIN bookings b2 ON b2.tour_departure_id = td2.id 
                    WHERE b2.customer_id = t.customer_id
                   ) as last_trip_end,
                   (SELECT COUNT(*)::int FROM bookings WHERE customer_id = t.customer_id AND booking_status NOT IN ('Huỷ','Mới')) as total_bookings
            FROM cskh_tasks t 
            JOIN customers c ON t.customer_id = c.id
            LEFT JOIN cskh_rules r ON t.rule_id = r.id
            LEFT JOIN users u_assigned ON t.assigned_to = u_assigned.id
            LEFT JOIN users u_resolved ON t.resolved_by = u_resolved.id
            ${where}
            ORDER BY 
                CASE t.priority_color 
                    WHEN 'red' THEN 1 
                    WHEN 'yellow' THEN 2 
                    WHEN 'green' THEN 3 
                    WHEN 'gray' THEN 4 
                    ELSE 5 
                END,
                CASE t.status 
                    WHEN 'overdue' THEN 1 
                    WHEN 'pending' THEN 2 
                    WHEN 'in_progress' THEN 3 
                    WHEN 'completed' THEN 4 
                    WHEN 'canceled' THEN 5 
                    ELSE 6 
                END,
                t.due_date ASC
            LIMIT $${paramIdx++} OFFSET $${paramIdx++}
        `;
        params.push(parseInt(limit), offset);

        const result = await db.query(sql, params);

        res.json({
            tasks: result.rows,
            total: countRes.rows[0]?.total || 0,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error('[CSKH] getTasks error:', err);
        res.status(500).json({ message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════
// POST /api/cskh/tasks/:id/process — Process a care task
// ═══════════════════════════════════════════════════════════
exports.processTask = async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const taskId = parseInt(req.params.id);
        const { interaction_result, call_outcome, notes, reminders } = req.body;

        // Load task + rule
        const taskRes = await client.query(`
            SELECT t.*, r.retry_max, r.retry_interval_days 
            FROM cskh_tasks t 
            LEFT JOIN cskh_rules r ON t.rule_id = r.id 
            WHERE t.id = $1
        `, [taskId]);
        if (taskRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Task không tồn tại' });
        }
        const task = taskRes.rows[0];

        // Build post-care notes
        const postCareArr = [];
        if (reminders?.passport) postCareArr.push('Nhắc mang hộ chiếu, visa, giấy tờ');
        if (reminders?.luggage) postCareArr.push('Nhắc chuẩn bị hành lý, đọc lịch trình');
        if (reminders?.review) postCareArr.push('Nhắc đánh giá Google Maps / Facebook');
        if (reminders?.promo) postCareArr.push('Thông báo ưu đãi, tour mới sắp có');
        const postCareStr = postCareArr.join('; ');

        // Log interaction
        await client.query(`
            INSERT INTO cskh_interaction_logs (task_id, customer_id, interaction_result, call_outcome, notes, post_care_notes, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
            taskId,
            task.customer_id,
            interaction_result,
            interaction_result === 'answered' ? call_outcome : null,
            notes || null,
            postCareStr || null,
            req.user?.id || null
        ]);

        // Update task based on result
        if (interaction_result === 'answered') {
            switch (call_outcome) {
                case 'booked':
                    await client.query(`
                        UPDATE cskh_tasks SET status = 'completed', priority_color = 'green', 
                        resolved_by = $1, resolved_at = NOW() WHERE id = $2
                    `, [req.user?.id, taskId]);
                    break;
                case 'thinking': {
                    const newRetry = task.retry_count + 1;
                    const interval = task.retry_interval_days || 2;
                    const newDue = new Date();
                    newDue.setDate(newDue.getDate() + interval);
                    await client.query(`
                        UPDATE cskh_tasks SET status = 'pending', priority_color = 'yellow', 
                        retry_count = $1, due_date = $2 WHERE id = $3
                    `, [newRetry, newDue.toISOString().split('T')[0], taskId]);
                    break;
                }
                case 'refused':
                    await client.query(`
                        UPDATE cskh_tasks SET status = 'completed', priority_color = 'gray', 
                        resolved_by = $1, resolved_at = NOW() WHERE id = $2
                    `, [req.user?.id, taskId]);
                    break;
                case 'info_only':
                default:
                    await client.query(`
                        UPDATE cskh_tasks SET status = 'completed', 
                        resolved_by = $1, resolved_at = NOW() WHERE id = $2
                    `, [req.user?.id, taskId]);
                    break;
            }
        } else {
            // No answer / busy — retry logic
            const retryMax = task.retry_max || 3;
            const newRetry = task.retry_count + 1;

            if (newRetry >= retryMax) {
                await client.query(`
                    UPDATE cskh_tasks SET status = 'canceled', retry_count = $1, 
                    resolved_by = $2, resolved_at = NOW() WHERE id = $3
                `, [newRetry, req.user?.id, taskId]);
            } else {
                const interval = task.retry_interval_days || 1;
                const newDue = new Date();
                newDue.setDate(newDue.getDate() + interval);
                await client.query(`
                    UPDATE cskh_tasks SET status = 'pending', retry_count = $1, due_date = $2 WHERE id = $3
                `, [newRetry, newDue.toISOString().split('T')[0], taskId]);
            }
        }

        await client.query('COMMIT');

        // Log activity
        await logActivity({
            user_id: req.user?.id,
            action_type: 'CSKH_PROCESS',
            entity_type: 'CSKH_TASK',
            entity_id: taskId,
            details: `Xử lý CSKH task #${taskId}: ${interaction_result} → ${call_outcome || 'N/A'}`
        });

        res.json({ ok: true, message: 'Đã ghi nhận kết quả' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('[CSKH] processTask error:', err);
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

// ═══════════════════════════════════════════════════════════
// POST /api/cskh/tasks/:id/skip — Skip/cancel a task
// ═══════════════════════════════════════════════════════════
exports.skipTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        await db.query(`
            UPDATE cskh_tasks SET status = 'canceled', resolved_by = $1, resolved_at = NOW() WHERE id = $2
        `, [req.user?.id, taskId]);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════
// POST /api/cskh/tasks — Create manual task (Todo list)
// ═══════════════════════════════════════════════════════════
exports.createTask = async (req, res) => {
    try {
        const { customer_id, title, description, due_date, assigned_to, priority_color } = req.body;
        if (!customer_id || !title) {
            return res.status(400).json({ message: 'Cần chọn khách hàng và nhập tiêu đề' });
        }
        const result = await db.query(`
            INSERT INTO cskh_tasks (customer_id, title, description, due_date, assigned_to, priority_color, status)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending')
            RETURNING *
        `, [
            customer_id, title, description || null,
            due_date || new Date().toISOString().split('T')[0],
            assigned_to || req.user?.id || null,
            priority_color || 'yellow'
        ]);

        await logActivity({
            user_id: req.user?.id,
            action_type: 'CREATE',
            entity_type: 'CSKH_TASK',
            entity_id: result.rows[0].id,
            details: `Tạo CSKH task: ${title}`
        });

        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════
// PUT /api/cskh/tasks/:id — Update task
// ═══════════════════════════════════════════════════════════
exports.updateTask = async (req, res) => {
    try {
        const taskId = parseInt(req.params.id);
        const { title, description, due_date, assigned_to, priority_color, status } = req.body;
        const fields = [];
        const params = [];
        let idx = 1;

        if (title !== undefined) { fields.push(`title = $${idx++}`); params.push(title); }
        if (description !== undefined) { fields.push(`description = $${idx++}`); params.push(description); }
        if (due_date !== undefined) { fields.push(`due_date = $${idx++}`); params.push(due_date); }
        if (assigned_to !== undefined) { fields.push(`assigned_to = $${idx++}`); params.push(assigned_to); }
        if (priority_color !== undefined) { fields.push(`priority_color = $${idx++}`); params.push(priority_color); }
        if (status !== undefined) {
            fields.push(`status = $${idx++}`);
            params.push(status);
            if (status === 'completed' || status === 'canceled') {
                fields.push(`resolved_by = $${idx++}`);
                params.push(req.user?.id);
                fields.push(`resolved_at = NOW()`);
            }
        }

        if (fields.length === 0) return res.json({ message: 'Nothing to update' });

        params.push(taskId);
        const result = await db.query(`UPDATE cskh_tasks SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, params);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════
// GET /api/cskh/rules — List all rules
// ═══════════════════════════════════════════════════════════
exports.getRules = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT r.*, 
                   (SELECT COUNT(*)::int FROM cskh_tasks WHERE rule_id = r.id AND status IN ('pending','in_progress','overdue')) as active_tasks
            FROM cskh_rules r 
            ORDER BY r.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════
// PUT /api/cskh/rules/:id — Update a rule
// ═══════════════════════════════════════════════════════════
exports.updateRule = async (req, res) => {
    try {
        const ruleId = parseInt(req.params.id);
        const { rule_name, offset_days, retry_max, retry_interval_days, is_active, description, default_color } = req.body;
        const result = await db.query(`
            UPDATE cskh_rules SET 
                rule_name = COALESCE($1, rule_name),
                offset_days = COALESCE($2, offset_days),
                retry_max = COALESCE($3, retry_max),
                retry_interval_days = COALESCE($4, retry_interval_days),
                is_active = COALESCE($5, is_active),
                description = COALESCE($6, description),
                default_color = COALESCE($7, default_color)
            WHERE id = $8
            RETURNING *
        `, [rule_name, offset_days, retry_max, retry_interval_days, is_active, description, default_color, ruleId]);

        if (result.rows.length === 0) return res.status(404).json({ message: 'Rule not found' });

        await logActivity({
            user_id: req.user?.id,
            action_type: 'UPDATE',
            entity_type: 'CSKH_RULE',
            entity_id: ruleId,
            details: `Cập nhật CSKH rule: ${result.rows[0].rule_name}`
        });

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ═══════════════════════════════════════════════════════════
// GET /api/cskh/search-customers — Bulk customer search
// ═══════════════════════════════════════════════════════════
exports.searchCustomers = async (req, res) => {
    try {
        const { tour_id, departure_id, segment, source, assigned_to, min_trips, has_phone, search } = req.query;
        const conditions = [];
        const params = [];
        let idx = 1;

        if (search) {
            conditions.push(`(c.name ILIKE $${idx} OR c.phone ILIKE $${idx})`);
            params.push(`%${search}%`);
            idx++;
        }

        if (tour_id) {
            conditions.push(`EXISTS (SELECT 1 FROM bookings b JOIN tour_departures td ON b.tour_departure_id = td.id WHERE b.customer_id = c.id AND td.tour_template_id = $${idx++})`);
            params.push(parseInt(tour_id));
        }

        if (departure_id) {
            conditions.push(`EXISTS (SELECT 1 FROM bookings b WHERE b.customer_id = c.id AND b.tour_departure_id = $${idx++})`);
            params.push(parseInt(departure_id));
        }

        if (assigned_to) {
            conditions.push(`c.assigned_to = $${idx++}`);
            params.push(parseInt(assigned_to));
        }

        if (has_phone === 'yes') {
            conditions.push(`c.phone IS NOT NULL AND c.phone != ''`);
        }

        if (min_trips) {
            conditions.push(`(
                COALESCE(c.past_trip_count, 0) + 
                COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ','Mới')), 0)
            ) >= $${idx++}`);
            params.push(parseInt(min_trips));
        }

        const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const result = await db.query(`
            SELECT c.id, c.name, c.phone, c.email, c.customer_segment, c.assigned_to, c.birth_date,
                   COALESCE(c.past_trip_count, 0) as past_trip_count,
                   COALESCE((SELECT COUNT(*)::int FROM bookings WHERE customer_id = c.id AND booking_status NOT IN ('Huỷ','Mới')), 0) as crm_trip_count,
                   (SELECT string_agg(DISTINCT tt.name, ', ') FROM bookings b JOIN tour_departures td ON b.tour_departure_id = td.id JOIN tour_templates tt ON td.tour_template_id = tt.id WHERE b.customer_id = c.id) as tours_history,
                   u.full_name as staff_name
            FROM customers c
            LEFT JOIN users u ON c.assigned_to = u.id
            ${where}
            ORDER BY c.name ASC
            LIMIT 500
        `, params);

        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
