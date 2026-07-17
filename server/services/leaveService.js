const db = require('../db');
const notificationService = require('./notificationService');
const { emitEvent } = require('../utils/eventBus');
const SystemEvents = require('../constants/SystemEvents');

/**
 * Service Layer cho Leave System (Quản lý Ngày Phép)
 * Áp dụng: Transaction 100%, Row Locking, Audit Log
 */

// Hàm dùng chung cho Audit Log (buộc dùng client trong transaction nếu có)
async function logActivity(client, userId, action, entityId, details) {
    const q = `INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details) VALUES ($1, $2, 'LEAVE_REQUEST', $3, $4)`;
    await client.query(q, [userId, action, entityId, details]);
}

// Đồng bộ số dư phép (được bọc trong transaction bằng client)
async function syncLeaveBalance(client, userId, year) {
    if (!userId || !year) return;
    const sumRes = await client.query(`
        SELECT COALESCE(SUM(lr.total_days), 0) as total_used
        FROM leave_requests lr
        WHERE lr.user_id = $1 
          AND lr.status = 'approved' 
          AND lr.leave_type != 'business_trip'
          AND EXISTS (
              SELECT 1 FROM leave_request_dates lrd 
              WHERE lrd.leave_request_id = lr.id AND EXTRACT(YEAR FROM lrd.leave_date) = $2
          )
    `, [userId, year]);
    
    const used_days = parseFloat(sumRes.rows[0].total_used);
    
    await client.query(`
        UPDATE leave_balances 
        SET used_days = $1 
        WHERE user_id = $2 AND year = $3
    `, [used_days, userId, year]);
}

exports.createLeave = async (data, requestUser) => {
    let client;
    try {
        const { target_user_id, leave_type, leave_dates, reason, contact_phone, handover_user_id, handover_note, approved_by } = data;
        
        const applyForId = target_user_id || requestUser.id;
        let calculated_total_units = 0;
        const dateValuesForQuery = [];
        
        for (const d of leave_dates) {
            let units = 2;
            if (d.session === 'morning' || d.session === 'afternoon') units = 1;
            calculated_total_units += units;
            dateValuesForQuery.push(d.date);
        }

        const calculated_total_days = calculated_total_units / 2;
        const sortedDates = [...leave_dates].map(d => d.date).sort();
        const year = new Date(sortedDates[0]).getFullYear();

        client = await db.pool.connect();
        await client.query('BEGIN');
        
        // Chống overlap
        const overlapResult = await client.query(`
            SELECT lrd.leave_date FROM leave_request_dates lrd
            JOIN leave_requests lr ON lr.id = lrd.leave_request_id
            WHERE lr.user_id = $1 AND lrd.leave_date = ANY($2::date[]) 
            AND lr.status IN ('pending', 'approved') LIMIT 1 FOR UPDATE
        `, [applyForId, dateValuesForQuery]);

        if (overlapResult.rows.length > 0) {
            throw new Error(`Ngày ${new Date(overlapResult.rows[0].leave_date).toLocaleDateString('vi-VN')} đã tồn tại trong một đơn xin nghỉ khác.`);
        }

        // Tự động duyệt mọi đơn xin nghỉ theo yêu cầu
        const isSelf = requestUser.id === parseInt(applyForId);
        const initialStatus = 'approved';
        const initialApprovedBy = isSelf ? null : requestUser.id;

        const q = `
            INSERT INTO leave_requests (
                user_id, leave_type, total_days, reason, 
                contact_phone, handover_user_id, handover_note, status, approved_by, approved_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *;
        `;
        const result = await client.query(q, [
            applyForId, leave_type, calculated_total_days, reason, 
            contact_phone, handover_user_id || null, handover_note, initialStatus, initialApprovedBy
        ]);
        const newLeave = result.rows[0];

        // Insert dates
        const dateValues = [];
        const dateParams = [];
        let paramCount = 1;
        for (const d of leave_dates) {
            dateValues.push(`($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`);
            dateParams.push(newLeave.id, d.date, d.duration || 1, d.session || 'full');
        }
        await client.query(`INSERT INTO leave_request_dates (leave_request_id, leave_date, duration, session_type) VALUES ${dateValues.join(', ')}`, dateParams);

        // Audit & Sync Balance
        const createMsg = !isSelf ? `Tạo dùm đơn cho user ${applyForId} (Hệ thống tự động duyệt)` : `Tự tạo đơn xin nghỉ`;
        await logActivity(client, requestUser.id, 'CREATE', newLeave.id, createMsg);
        
        if (initialStatus === 'approved') {
            await syncLeaveBalance(client, applyForId, year);
        }

        await client.query('COMMIT');

        // --- GỬI THÔNG BÁO (Sau khi Commit thành công để tránh Rollback ẩn) ---
        try {
            const applicantRes = await db.query('SELECT full_name FROM users WHERE id = $1', [applyForId]);
            const applicantName = applicantRes.rows.length > 0 ? applicantRes.rows[0].full_name : 'Nhân sự';
            
            let handoverName = 'Không có';
            if (handover_user_id) {
                const handoverRes = await db.query('SELECT full_name FROM users WHERE id = $1', [handover_user_id]);
                if (handoverRes.rows.length > 0) handoverName = handoverRes.rows[0].full_name;
            }
            
            const formattedDates = leave_dates.map(d => {
                const dateStr = new Date(d.date).toLocaleDateString('vi-VN');
                const sessionStr = d.session === 'morning' ? ' (Sáng)' : (d.session === 'afternoon' ? ' (Chiều)' : ' (Cả ngày)');
                return dateStr + sessionStr;
            }).join(', ');
            
            // EMAIL EVENT
            const eventObj = SystemEvents.find(e => e.code === 'LEAVE_REQUEST_CREATED');
            if (eventObj) {
                emitEvent(eventObj.code, {
                    employee_name: applicantName,
                    leave_type: leave_type,
                    reason: reason,
                    leave_dates: formattedDates,
                    total_days: calculated_total_days,
                    handover_to: handoverName,
                    handover_note: handover_note || 'Không có',
                    contact_phone: contact_phone || 'Không có',
                    created_at: new Date().toISOString(),
                    applicant_id: applyForId,
                    send_to_all: data.send_to_all !== undefined ? data.send_to_all : true
                });
            }

            // Nếu admin tạo dùm (tự động duyệt), thì phát thêm event Đã Duyệt để báo cho nhân sự
            if (initialStatus === 'approved') {
                const approvedEventObj = SystemEvents.find(e => e.code === 'LEAVE_REQUEST_APPROVED');
                if (approvedEventObj) {
                    emitEvent(approvedEventObj.code, {
                        employee_name: applicantName,
                        leave_type: leave_type,
                        leave_dates: formattedDates,
                        status: 'APPROVED',
                        processed_by: isSelf ? 'Hệ thống (Tự động duyệt)' : (requestUser.full_name || requestUser.name || 'Admin'),
                        reject_reason: '',
                        updated_at: new Date().toISOString()
                    });
                }
            }
        } catch (notifErr) {
            console.error('[LeaveService] Error sending event for new leave:', notifErr);
        }

        return newLeave;
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        throw err;
    } finally {
        if (client) client.release();
    }
};

exports.updateLeave = async (id, data, requestUser) => {
    let client;
    try {
        const { leave_type, leave_dates, reason, contact_phone, handover_user_id, handover_note } = data;
        let calculated_total_units = 0;
        
        for (const d of leave_dates) {
            let units = 2;
            if (d.session === 'morning' || d.session === 'afternoon') units = 1;
            calculated_total_units += units;
        }
        const calculated_total_days = calculated_total_units / 2;

        client = await db.pool.connect();
        await client.query('BEGIN');

        // Row lock
        const lr = await client.query(`SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE`, [id]);
        if (lr.rows.length === 0) throw new Error('Đơn không tồn tại');
        const leave = lr.rows[0];

        const qUpdate = `
            UPDATE leave_requests 
            SET leave_type = $1, total_days = $2, reason = $3, contact_phone = $4, 
                handover_user_id = $5, handover_note = $6, updated_at = NOW()
            WHERE id = $7 RETURNING *;
        `;
        const result = await client.query(qUpdate, [
            leave_type, calculated_total_days, reason, contact_phone, 
            handover_user_id || null, handover_note, id
        ]);
        const updatedLeave = result.rows[0];

        await client.query('DELETE FROM leave_request_dates WHERE leave_request_id = $1', [id]);
        
        const dateValues = [];
        const dateParams = [];
        let paramCount = 1;
        for (const d of leave_dates) {
            dateValues.push(`($${paramCount++}, $${paramCount++}, $${paramCount++}, $${paramCount++})`);
            dateParams.push(id, d.date, d.duration || 1, d.session || 'full');
        }
        await client.query(`INSERT INTO leave_request_dates (leave_request_id, leave_date, duration, session_type) VALUES ${dateValues.join(', ')}`, dateParams);

        if (updatedLeave.status === 'approved') {
            const sortedDates = [...leave_dates].map(d => d.date).sort();
            const year = new Date(sortedDates[0]).getFullYear();
            await syncLeaveBalance(client, updatedLeave.user_id, year);
        }

        await logActivity(client, requestUser.id, 'UPDATE', id, 'Cập nhật nội dung đơn');
        await client.query('COMMIT');
        return updatedLeave;
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        throw err;
    } finally {
        if (client) client.release();
    }
};

exports.changeStatus = async (id, status, requestUser, rejectReason = null) => {
    let client;
    try {
        client = await db.pool.connect();
        await client.query('BEGIN');

        // Row lock & Status Check to prevent Race Conditions
        const lr = await client.query(`SELECT * FROM leave_requests WHERE id = $1 FOR UPDATE`, [id]);
        if (lr.rows.length === 0) throw new Error('Đơn không tồn tại');
        const leave = lr.rows[0];

        if (status === 'approved' && leave.status !== 'pending') throw new Error('Đơn này không ở trạng thái chờ duyệt (có thể ai đó đã xử lý).');
        if (status === 'rejected' && !['pending', 'approved'].includes(leave.status)) throw new Error('Chỉ có thể từ chối đơn đang chờ duyệt hoặc đã duyệt.');
        if (status === 'pending' && leave.status === 'pending') throw new Error('Đơn đang ở trạng thái chờ duyệt rồi.');

        let qUpdate = `UPDATE leave_requests SET status = $1, updated_at = NOW() `;
        const params = [status, id];
        let paramCount = 3;

        if (status === 'approved' || status === 'rejected') {
            qUpdate += `, approved_by = $${paramCount++}, approved_at = NOW(), reject_reason = $${paramCount++} `;
            params.push(requestUser.id, rejectReason);
        } else if (status === 'pending') {
            qUpdate += `, approved_by = NULL, approved_at = NULL, reject_reason = NULL `;
        } else if (status === 'cancelled') {
             // Do nothing extra for cancelled
        }

        qUpdate += ` WHERE id = $2 RETURNING *;`;
        const result = await client.query(qUpdate, params);
        const updatedLeave = result.rows[0];

        // Sync Balance
        const datesRes = await client.query('SELECT MIN(leave_date) as first_date FROM leave_request_dates WHERE leave_request_id = $1', [id]);
        if (datesRes.rows.length > 0 && datesRes.rows[0].first_date) {
            const year = new Date(datesRes.rows[0].first_date).getFullYear();
            await syncLeaveBalance(client, updatedLeave.user_id, year);
        }

        await logActivity(client, requestUser.id, 'STATUS_CHANGE', id, `Chuyển trạng thái: ${leave.status} -> ${status}`);
        
        await client.query('COMMIT');

        // Gửi Notification (Sau khi Commit thành công)
        if (status === 'approved' || status === 'rejected') {
            try {
                const userRes = await db.query('SELECT full_name, email FROM users WHERE id = $1', [updatedLeave.user_id]);
                const u = userRes.rows[0];
                if (u && u.email) {
                    const eventName = status === 'approved' ? 'leave.approved' : 'leave.rejected';
                    const subject = status === 'approved' ? '✅ Đơn xin nghỉ phép đã được duyệt' : '❌ Đơn xin nghỉ phép bị từ chối';
                    const html_body = status === 'approved' 
                        ? `<p>Xin chào <b>${u.full_name}</b>,</p><p>Đơn xin nghỉ phép (Loại: ${leave.leave_type}) của bạn đã được <b>Duyệt</b>.</p><p>Hệ thống CRM FIT Tour.</p>`
                        : `<p>Xin chào <b>${u.full_name}</b>,</p><p>Đơn xin nghỉ phép của bạn đã bị <b>Từ chối</b>.</p><p>Lý do: ${rejectReason || 'Không có'}</p><p>Hệ thống CRM FIT Tour.</p>`;
                    
                    notificationService.emit(eventName, {
                        recipient_user_id: updatedLeave.user_id,
                        recipient_email: u.email,
                        subject: subject,
                        html_body: html_body,
                        data: {}
                    }, `leave-${id}-${status}`); // Idempotency key
                }

                // EMAIL EVENTS (dùng db.query vì đã COMMIT rồi, client sắp release)
                const allDatesRes = await db.query('SELECT leave_date, session_type FROM leave_request_dates WHERE leave_request_id = $1 ORDER BY leave_date ASC', [id]);
                const formattedDates = allDatesRes.rows.map(d => {
                    const dateStr = new Date(d.leave_date).toLocaleDateString('vi-VN');
                    const sessionStr = d.session_type === 'morning' ? ' (Sáng)' : (d.session_type === 'afternoon' ? ' (Chiều)' : ' (Cả ngày)');
                    return dateStr + sessionStr;
                }).join(', ');

                const eventCode = status === 'approved' ? 'LEAVE_REQUEST_APPROVED' : 'LEAVE_REQUEST_REJECTED';
                const eventObj = SystemEvents.find(e => e.code === eventCode);
                if (eventObj) {
                    emitEvent(eventObj.code, {
                        employee_name: u.full_name,
                        leave_type: leave.leave_type,
                        leave_dates: formattedDates,
                        status: status.toUpperCase(),
                        processed_by: requestUser.full_name || requestUser.name || 'Admin',
                        reject_reason: rejectReason || '',
                        updated_at: new Date().toISOString()
                    });
                }

            } catch (notifyErr) {
                console.error('Error sending leave notification:', notifyErr);
            }
        }

        return updatedLeave;
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        throw err;
    } finally {
        if (client) client.release();
    }
};

exports.deleteLeave = async (id, requestUser) => {
    return this.changeStatus(id, 'cancelled', requestUser);
};
