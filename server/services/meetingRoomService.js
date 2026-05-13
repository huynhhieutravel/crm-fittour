const db = require('../db');

/**
 * Hàm ghi nhật ký hệ thống (Audit Log) dùng chung transaction (nếu có)
 */
async function logActivity(client, userId, action, entityId, detailsObj) {
    const details = JSON.stringify(detailsObj);
    const q = `INSERT INTO activity_logs (user_id, action_type, entity_type, entity_id, details) VALUES ($1, $2, 'MEETING_ROOM', $3, $4)`;
    await client.query(q, [userId, action, entityId, details]);
}

/**
 * Lấy danh sách phòng họp (Chỉ lấy status = 'approved')
 */
exports.getBookings = async (start, end) => {
    let query = `
        SELECT m.*, u.full_name as organizer_name 
        FROM meeting_bookings m 
        LEFT JOIN users u ON m.organizer_id = u.id 
        WHERE m.status = 'approved'
    `;
    let params = [];

    if (start && end) {
        query += ' AND m.start_time >= $1 AND m.start_time <= $2';
        params = [start, end];
    }
    
    query += ' ORDER BY m.start_time ASC';
    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Tạo lịch đặt phòng mới (Sử dụng EXCLUDE CONSTRAINT của PostgreSQL)
 */
exports.createBooking = async (data, requestUser) => {
    let client;
    try {
        const { title, description, start_time, end_time, attendees, bu } = data;
        const organizer_id = requestUser ? requestUser.id : null; 

        if (!title || !start_time || !end_time) {
            throw new Error('Thiếu thông tin bắt buộc');
        }

        const start = new Date(start_time);
        const end = new Date(end_time);
        const now = new Date();

        if (start >= end) throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
        if (start < now) throw new Error('Không thể đặt phòng cho thời gian trong quá khứ');
        if (end.getTime() - start.getTime() > 8 * 60 * 60 * 1000) throw new Error('Thời lượng họp tối đa không được vượt quá 8 tiếng');
        
        if (start.toDateString() !== end.toDateString()) {
            throw new Error('Chỉ được phép đặt lịch họp trong cùng 1 ngày');
        }

        client = await db.pool.connect();
        await client.query('BEGIN');

        const attendeesJson = attendees ? JSON.stringify(attendees) : '[]';

        // Nhờ EXCLUDE CONSTRAINT, DB sẽ tự chặn Overlap. 
        // Không cần lock tay, hoàn toàn race-safe.
        const result = await client.query(
            `INSERT INTO meeting_bookings (title, description, start_time, end_time, organizer_id, attendees, bu, status) 
             VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, 'approved') RETURNING *`,
            [title, description, start_time, end_time, organizer_id, attendeesJson, bu || null]
        );
        const newBooking = result.rows[0];

        await logActivity(client, organizer_id, 'CREATE', newBooking.id, {
            booking_id: newBooking.id,
            title: title,
            start_time: start_time,
            end_time: end_time,
            action: "Đặt phòng họp mới"
        });

        await client.query('COMMIT');
        return newBooking;
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        // Bắt lỗi EXCLUDE_VIOLATION của PostgreSQL
        if (err.code === '23P01') {
            // Lấy thông tin lịch bị trùng để trả về thông báo chi tiết
            const conflictRes = await db.query(`
                SELECT title, start_time, end_time FROM meeting_bookings 
                WHERE (start_time < $2) AND (end_time > $1) AND status = 'approved' LIMIT 1
            `, [data.start_time, data.end_time]);
            
            if (conflictRes.rows.length > 0) {
                const c = conflictRes.rows[0];
                throw new Error(`Phòng đã được đặt lịch "${c.title}" trong khung giờ này. Vui lòng chọn giờ khác.`);
            }
            throw new Error('Phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn giờ khác.');
        }
        throw err;
    } finally {
        if (client) client.release();
    }
};

/**
 * Sửa thông tin lịch họp
 */
exports.updateBooking = async (id, data, requestUser) => {
    let client;
    try {
        const { title, description, start_time, end_time, attendees, bu } = data;

        if (!title || !start_time || !end_time) {
            throw new Error('Thiếu thông tin bắt buộc');
        }

        const start = new Date(start_time);
        const end = new Date(end_time);
        const now = new Date();

        if (start >= end) throw new Error('Thời gian kết thúc phải sau thời gian bắt đầu');
        if (end.getTime() - start.getTime() > 8 * 60 * 60 * 1000) throw new Error('Thời lượng họp tối đa không được vượt quá 8 tiếng');
        
        if (start.toDateString() !== end.toDateString()) {
            throw new Error('Chỉ được phép cập nhật lịch họp trong cùng 1 ngày');
        }

        client = await db.pool.connect();
        await client.query('BEGIN');

        const currentRes = await client.query(`SELECT * FROM meeting_bookings WHERE id = $1 FOR UPDATE`, [id]);
        if (currentRes.rows.length === 0) throw new Error('Không tìm thấy lịch họp');
        const oldBooking = currentRes.rows[0];

        if (new Date(oldBooking.start_time) <= now) {
            throw new Error('Không thể sửa thông tin lịch họp đã bắt đầu hoặc đã diễn ra trong quá khứ.');
        }

        const attendeesJson = attendees ? JSON.stringify(attendees) : '[]';

        const updated = await client.query(
            `UPDATE meeting_bookings 
             SET title = $1, description = $2, start_time = $3, end_time = $4, attendees = $5, bu = $6, updated_at = CURRENT_TIMESTAMP
             WHERE id = $7 RETURNING *`,
            [title, description, start_time, end_time, attendeesJson, bu || null, id]
        );
        const updatedBooking = updated.rows[0];

        await logActivity(client, requestUser.id, 'UPDATE', id, {
            booking_id: id,
            title: title,
            old_start: oldBooking.start_time,
            new_start: start_time,
            old_end: oldBooking.end_time,
            new_end: end_time,
            action: "Cập nhật lịch họp"
        });

        await client.query('COMMIT');
        return updatedBooking;
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        if (err.code === '23P01') {
            const conflictRes = await db.query(`
                SELECT title FROM meeting_bookings 
                WHERE (start_time < $2) AND (end_time > $1) AND id != $3 AND status = 'approved' LIMIT 1
            `, [data.start_time, data.end_time, id]);
            
            if (conflictRes.rows.length > 0) {
                const c = conflictRes.rows[0];
                throw new Error(`Khung giờ bạn sửa bị trùng với lịch họp "${c.title}". Vui lòng chọn giờ khác.`);
            }
            throw new Error('Khung giờ bạn sửa bị trùng với một lịch họp khác. Vui lòng chọn giờ khác.');
        }
        throw err;
    } finally {
        if (client) client.release();
    }
};

/**
 * Huỷ lịch họp (Soft Delete)
 */
exports.deleteBooking = async (id, requestUser) => {
    let client;
    try {
        client = await db.pool.connect();
        await client.query('BEGIN');

        const currentRes = await client.query(`SELECT * FROM meeting_bookings WHERE id = $1 FOR UPDATE`, [id]);
        if (currentRes.rows.length === 0) throw new Error('Không tìm thấy lịch họp');
        const booking = currentRes.rows[0];

        if (booking.status === 'cancelled') throw new Error('Lịch họp này đã bị huỷ trước đó');

        // Không cho phép huỷ cuộc họp đã diễn ra
        const now = new Date();
        const startTime = new Date(booking.start_time);
        if (now > startTime) {
            throw new Error('Không thể huỷ cuộc họp đã bắt đầu hoặc đã kết thúc trong quá khứ.');
        }

        await client.query(`UPDATE meeting_bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1`, [id]);

        await logActivity(client, requestUser.id, 'DELETE', id, {
            booking_id: id,
            title: booking.title,
            start_time: booking.start_time,
            action: "Huỷ đặt phòng"
        });

        await client.query('COMMIT');
        return { message: 'Đã huỷ lịch họp thành công' };
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        throw err;
    } finally {
        if (client) client.release();
    }
};
