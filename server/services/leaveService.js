const db = require('../db');

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
          AND lr.leave_type = 'annual'
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

        const q = `
            INSERT INTO leave_requests (
                user_id, leave_type, total_days, reason, 
                contact_phone, handover_user_id, handover_note, status, approved_by, approved_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'approved', $8, NOW()) RETURNING *;
        `;
        const result = await client.query(q, [
            applyForId, leave_type, calculated_total_days, reason, 
            contact_phone, handover_user_id || null, handover_note, approved_by || null
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
        await logActivity(client, requestUser.id, 'CREATE', newLeave.id, requestUser.id !== parseInt(applyForId) ? `Tạo dùm đơn cho user ${applyForId}` : `Tự tạo đơn`);
        await syncLeaveBalance(client, applyForId, year);

        await client.query('COMMIT');
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
        if (status === 'rejected' && leave.status !== 'pending') throw new Error('Đơn này không ở trạng thái chờ duyệt.');
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
