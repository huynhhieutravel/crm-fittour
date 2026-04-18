const db = require('../db');

// Helper to check for guide schedule overlaps (checks BOTH tour_departures AND group_projects)
const checkGuideOverlap = async (guide_id, start_date, end_date, exclude_id = null) => {
    if (!guide_id || !start_date || !end_date) return false;
    
    // Check tour_departures
    let query = `
        SELECT id FROM tour_departures 
        WHERE guide_id = $1 
        AND status != 'Huỷ'
        AND (
            (start_date <= $3 AND end_date >= $2)
        )
    `;
    const params = [guide_id, start_date, end_date];
    
    if (exclude_id) {
        query += ` AND id != $4`;
        params.push(exclude_id);
    }
    
    const result = await db.query(query, params);
    if (result.rows.length > 0) return true;

    // Also check group_projects (BU3 MICE tours)
    const gpResult = await db.query(`
        SELECT id FROM group_projects
        WHERE guide_id = $1 AND status NOT IN ('Chưa thành công')
        AND departure_date IS NOT NULL AND return_date IS NOT NULL
        AND (departure_date <= $3 AND return_date >= $2)
    `, [guide_id, start_date, end_date]);
    
    return gpResult.rows.length > 0;
};

exports.getAllDepartures = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT 
                td.*, 
                tt.name as template_name, tt.duration as template_duration,
                g.name as guide_name,
                (SELECT COALESCE(SUM(pax_count), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ')) as sold_pax
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN guides g ON td.guide_id = g.id
            ORDER BY COALESCE(tt.is_active, true) DESC, td.start_date DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.createDeparture = async (req, res) => {
    const { 
        code, tour_template_id, start_date, end_date, max_participants, status,
        actual_price, discount_price,
        guide_id, operator_id, supplier_info, min_participants, break_even_pax,
        deadline_booking, deadline_visa, deadline_payment,
        price_rules, additional_services, notes
    } = req.body;
    try {
        // Check for guide overlap
        if (guide_id && start_date && end_date) {
            const isOverlapping = await checkGuideOverlap(guide_id, start_date, end_date);
            if (isOverlapping) {
                return res.status(400).json({ 
                    message: 'HDV đã có lịch công tác trong thời gian này! Vui lòng chọn HDV khác hoặc đổi ngày.' 
                });
            }
        }

        // Sanitize
        const final_guide = guide_id === '' ? null : guide_id;
        const final_operator = operator_id === '' ? null : operator_id;

        const generatedCode = code || ('DEP-' + (start_date ? new Date(start_date).toISOString().slice(2,10).replace(/-/g, '') : new Date().toISOString().slice(2,10).replace(/-/g, '')) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
        const result = await db.query(
            `INSERT INTO tour_departures (
                code, tour_template_id, start_date, end_date, max_participants, status,
                actual_price, discount_price, 
                guide_id, operator_id, supplier_info, min_participants, break_even_pax,
                deadline_booking, deadline_visa, deadline_payment,
                price_rules, additional_services, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            [
                generatedCode, tour_template_id, start_date, end_date, max_participants, status || 'Mở bán',
                actual_price, discount_price,
                final_guide, final_operator, 
                typeof supplier_info === 'object' ? JSON.stringify(supplier_info) : (supplier_info || '{}'), 
                min_participants, break_even_pax,
                deadline_booking, deadline_visa, deadline_payment,
                typeof price_rules === 'object' ? JSON.stringify(price_rules) : (price_rules || '[]'), 
                typeof additional_services === 'object' ? JSON.stringify(additional_services) : (additional_services || '[]'), 
                notes
            ]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getDepartureById = async (req, res) => {
    try {
        const departureResult = await db.query(`
            SELECT td.*, tt.name as template_name, g.name as guide_name
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN guides g ON td.guide_id = g.id
            WHERE td.id = $1
        `, [req.params.id]);

        if (departureResult.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });

        const bookingsResult = await db.query(`
            SELECT b.*, c.name as customer_name, c.phone as customer_phone, c.customer_segment, c.past_trip_count
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.tour_departure_id = $1
            ORDER BY b.created_at DESC
        `, [req.params.id]);

        const bookings = bookingsResult.rows;
        for (let i = 0; i < bookings.length; i++) {
            const passengers = await db.query(`
                SELECT bp.*, c.name as customer_name, c.phone as customer_phone
                FROM booking_passengers bp
                JOIN customers c ON bp.customer_id = c.id
                WHERE bp.booking_id = $1
            `, [bookings[i].id]);
            bookings[i].passengers = passengers.rows;
        }

        const departure = departureResult.rows[0];
        departure.bookings = bookings;
        departure.sold_pax = bookings.reduce((sum, b) => b.booking_status !== 'Huỷ' ? sum + Number(b.pax_count) : sum, 0);

        res.json(departure);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateDeparture = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ message: 'Không có dữ liệu để cập nhật' });
    }

    try {
        // Fetch current record to get missing fields for overlap check
        const currentRes = await db.query('SELECT guide_id, start_date, end_date FROM tour_departures WHERE id = $1', [id]);
        if (currentRes.rows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });
        }
        const current = currentRes.rows[0];

        const guide_id = updates.guide_id !== undefined ? updates.guide_id : current.guide_id;
        const start_date = updates.start_date || (current.start_date ? current.start_date.toISOString().split('T')[0] : null);
        const end_date = updates.end_date || (current.end_date ? current.end_date.toISOString().split('T')[0] : null);

        if (guide_id && start_date && end_date) {
            const isOverlapping = await checkGuideOverlap(guide_id, start_date, end_date, id);
            if (isOverlapping) {
                return res.status(400).json({ 
                    message: 'HDV đã có lịch công tác trong thời gian này! Vui lòng chọn HDV khác hoặc đổi ngày.' 
                });
            }
        }

        const setClause = [];
        const values = [];
        let index = 1;

        for (const [key, value] of Object.entries(updates)) {
            // Only allow valid columns
            const validColumns = [
                'code', 'start_date', 'end_date', 'max_participants', 'status',
                'actual_price', 'discount_price',
                'guide_id', 'operator_id', 
                'supplier_info', 'min_participants', 'break_even_pax',
                'deadline_booking', 'deadline_visa', 'deadline_payment',
                'price_rules', 'additional_services', 'notes'
            ];
            // Format empty string to null for specific fields
            let finalValue = value;
            if (value === '' && ['guide_id', 'operator_id', 'break_even_pax', 'max_participants'].includes(key)) {
                finalValue = null;
            }
            if (['price_rules', 'additional_services', 'supplier_info'].includes(key)) {
                finalValue = typeof value === 'string' ? value : JSON.stringify(value);
            }

            if (validColumns.includes(key)) {
                setClause.push(`${key} = $${index}`);
                values.push(finalValue);
                index++;
            }
        }

        if (setClause.length === 0) {
            return res.status(400).json({ message: 'Không có trường hợp lệ để cập nhật' });
        }

        values.push(id);
        const query = `UPDATE tour_departures SET ${setClause.join(', ')} WHERE id = $${index} RETURNING *`;
        
        const result = await db.query(query, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });

        // --- INJECT SYSTEM ALERT FOR SALES ---
        try {
            let alertMessage = null;
            let alertType = null;
            if (updates.status === 'Huỷ' && current.status !== 'Huỷ') {
                alertMessage = `🚨 Ops vừa HUỶ lịch khởi hành ${result.rows[0].code || id}. Bạn đang có khách trong đoàn này!`;
                alertType = 'TOUR_CANCELLED';
            } else if (updates.start_date && (current.start_date && updates.start_date !== current.start_date.toISOString().split('T')[0])) {
                alertMessage = `⚠️ Ops đã ĐỔI NGÀY bay của Tour ${result.rows[0].code || id} sang ${updates.start_date}. Hãy báo ngay cho Khách!`;
                alertType = 'TOUR_CHANGED';
            }

            if (alertMessage) {
                // Find all sales who have bookings on this departure
                const salesRes = await db.query(`SELECT DISTINCT assigned_to FROM bookings WHERE tour_departure_id = $1 AND assigned_to IS NOT NULL AND booking_status != 'Huỷ'`, [id]);
                if (salesRes.rows.length > 0) {
                    const systemAlertController = require('./systemAlertController');
                    for (const row of salesRes.rows) {
                        await systemAlertController.createAlert(
                            row.assigned_to,
                            alertType,
                            alertType === 'TOUR_CANCELLED' ? '❌ TOUR ĐÃ HUỶ' : '🔄 TOUR ĐỔI LỊCH BAY',
                            alertMessage,
                            id,
                            null
                        );
                    }
                }
            }
        } catch(e) { console.error('Alert Error Departure:', e); }
        // ------------------------------------

        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteDeparture = async (req, res) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        const depId = req.params.id;

        // === BUG-06 FIX: Chặn xóa nếu có booking đã thu tiền ===
        const paidCheck = await client.query(
            'SELECT COUNT(*)::int as cnt FROM bookings WHERE tour_departure_id = $1 AND paid > 0',
            [depId]
        );
        if (paidCheck.rows[0].cnt > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                message: `Không thể xóa: Lịch khởi hành này có ${paidCheck.rows[0].cnt} booking đã thu tiền. Hãy hoàn tiền hoặc huỷ các phiếu thu trước khi xóa.` 
            });
        }

        // Chặn xóa nếu có booking active (chưa Huỷ)
        const activeCheck = await client.query(
            "SELECT COUNT(*)::int as cnt FROM bookings WHERE tour_departure_id = $1 AND booking_status NOT IN ('Huỷ', 'Hủy')",
            [depId]
        );
        if (activeCheck.rows[0].cnt > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ 
                message: `Không thể xóa: Lịch khởi hành này còn ${activeCheck.rows[0].cnt} booking đang hoạt động. Hãy huỷ tất cả booking trước khi xóa.` 
            });
        }

        // 1. Xóa booking_passengers & booking_transactions (con của bookings đã Huỷ)
        await client.query(`
            DELETE FROM booking_passengers WHERE booking_id IN (SELECT id FROM bookings WHERE tour_departure_id = $1)
        `, [depId]);
        await client.query(`
            DELETE FROM booking_transactions WHERE booking_id IN (SELECT id FROM bookings WHERE tour_departure_id = $1)
        `, [depId]);

        // 2. Xóa bookings (chỉ các booking đã Huỷ còn sót lại)
        await client.query('DELETE FROM bookings WHERE tour_departure_id = $1', [depId]);

        // 3. Xóa payment_vouchers liên quan
        await client.query(`
            DELETE FROM payment_vouchers WHERE tour_id = $1
        `, [depId]);

        // 4. Xóa departure_reminders
        await client.query('DELETE FROM departure_reminders WHERE tour_departure_id = $1', [depId]);

        // 5. Xóa departure (tour_costings sẽ tự cascade nhờ ON DELETE CASCADE)
        const result = await client.query('DELETE FROM tour_departures WHERE id = $1 RETURNING *', [depId]);
        if (result.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });
        }

        await client.query('COMMIT');
        res.json({ message: 'Đã xoá lịch khởi hành thành công' });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: err.message });
    } finally {
        client.release();
    }
};

exports.getDepartureBookings = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, c.name as customer_name, c.phone as customer_phone, c.customer_segment, c.past_trip_count
            FROM bookings b
            JOIN customers c ON b.customer_id = c.id
            WHERE b.tour_departure_id = $1
            ORDER BY b.created_at DESC
        `, [req.params.id]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.duplicateDeparture = async (req, res) => {
    try {
        const original = await db.query('SELECT * FROM tour_departures WHERE id = $1', [req.params.id]);
        if (original.rows.length === 0) return res.status(404).json({ message: 'Không tìm thấy lịch khởi hành' });
        
        const dep = original.rows[0];
        const generatedCode = 'DEP-' + (dep.start_date ? new Date(dep.start_date).toISOString().slice(2,10).replace(/-/g, '') : new Date().toISOString().slice(2,10).replace(/-/g, '')) + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        
        const result = await db.query(
            `INSERT INTO tour_departures (
                code, tour_template_id, start_date, end_date, max_participants, status,
                actual_price, discount_price,
                guide_id, operator_id, supplier_info, min_participants, break_even_pax,
                deadline_booking, deadline_visa, deadline_payment,
                price_rules, additional_services, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
            [
                generatedCode, dep.tour_template_id, dep.start_date, dep.end_date, dep.max_participants, 'Mở bán',
                dep.actual_price, dep.discount_price,
                dep.guide_id, dep.operator_id, dep.supplier_info, dep.min_participants, dep.break_even_pax,
                dep.deadline_booking, dep.deadline_visa, dep.deadline_payment,
                typeof dep.price_rules === 'object' ? JSON.stringify(dep.price_rules) : (dep.price_rules || '[]'),
                typeof dep.additional_services === 'object' ? JSON.stringify(dep.additional_services) : (dep.additional_services || '[]'),
                dep.notes
            ]
        );
        
        // Return with template info
        const populated = await db.query(`
            SELECT td.*, tt.name as template_name, g.name as guide_name
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN guides g ON td.guide_id = g.id
            WHERE td.id = $1
        `, [result.rows[0].id]);
        
        res.status(201).json(populated.rows[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
