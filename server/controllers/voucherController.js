const db = require('../db');

exports.createVoucher = async (req, res) => {
    try {
        const {
            tour_id,
            booking_id,
            booking_code,
            title,
            amount,
            payment_method,
            payer_name,
            payer_phone,
            notes,
            attachment_url
        } = req.body;

        const created_by = req.user.id;
        const created_by_name = req.user.username;

        // VALIDATION: Prevent Overcharging
        if (booking_id) {
            const bookingCheck = await db.query('SELECT total, paid FROM op_tour_bookings WHERE id = $1', [booking_id]);
            if (bookingCheck.rows.length > 0) {
                const b = bookingCheck.rows[0];
                const remaining = Number(b.total) - Number(b.paid);
                if (Number(amount) > remaining) {
                    return res.status(400).json({ message: `Số tiền thu (${Number(amount).toLocaleString('vi-VN')}đ) vượt quá số tiền còn nợ (${remaining.toLocaleString('vi-VN')}đ)!` });
                }
            }
        }

        // Auto-generate code e.g., PT-B8734-080426-A3
        const d = new Date();
        const ddmmyy = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth()+1).padStart(2, '0')}${String(d.getFullYear()).slice(2)}`;
        
        let prefix = booking_code ? booking_code : ((booking_id ? String(booking_id).substring(0, 6) : 'UNK'));
        // Clean prefix if it has BK_ at start to keep it short
        if (prefix.startsWith('BK_')) prefix = prefix.substring(3);
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const rnd = chars.charAt(Math.floor(Math.random() * chars.length)) + chars.charAt(Math.floor(Math.random() * chars.length));
        
        const voucher_code = `PT-${prefix}-${ddmmyy}-${rnd}`;

        const insertQuery = `
            INSERT INTO payment_vouchers (
                voucher_code, tour_id, booking_id, title, amount,
                payment_method, payer_name, payer_phone, notes,
                created_by, created_by_name, status, attachment_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Đã duyệt', $12)
            RETURNING *
        `;

        const values = [
            voucher_code, tour_id, booking_id, title, amount,
            payment_method, payer_name, payer_phone, notes,
            created_by, created_by_name, attachment_url || null
        ];

        const r = await db.query(insertQuery, values);
        
        // Auto Update Booking mapping amount
        if (booking_id && amount > 0) {
            const upRes = await db.query(`
                UPDATE op_tour_bookings 
                SET paid = paid + $1 
                WHERE id = $2
                RETURNING total, paid, status
            `, [amount, booking_id]);

            if (upRes.rows.length > 0) {
                const bCheck = upRes.rows[0];
                const newPaid = Number(bCheck.paid || 0);
                const total = Number(bCheck.total || 0);
                
                let autoStatus = bCheck.status;
                if (newPaid >= total && total > 0) {
                    autoStatus = 'Đã thanh toán';
                } else if (newPaid > 0 && newPaid < total) {
                    autoStatus = 'Đã đặt cọc';
                }

                if (autoStatus !== bCheck.status) {
                    await db.query(`UPDATE op_tour_bookings SET status = $1 WHERE id = $2`, [autoStatus, booking_id]);
                }
            }
        }

        res.status(201).json(r.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating voucher', error: err.message });
    }
};

exports.getVouchersByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const result = await db.query('SELECT * FROM payment_vouchers WHERE booking_id = $1 ORDER BY created_at DESC', [bookingId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching vouchers', error: err.message });
    }
};

exports.getAllVouchers = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT v.*, 
                   t.tour_name, 
                   t.tour_code,
                   b.status as booking_status
            FROM payment_vouchers v
            LEFT JOIN op_tours t ON v.tour_id = t.id
            LEFT JOIN op_tour_bookings b ON v.booking_id = b.id
            ORDER BY v.created_at DESC
            LIMIT 2000
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching all vouchers', error: err.message });
    }
};

exports.cancelVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const vCheck = await db.query('SELECT * FROM payment_vouchers WHERE id = $1', [id]);
        if (vCheck.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });
        
        const voucher = vCheck.rows[0];
        
        // Kế toán / Quản lý / Admin hoặc chính người tạo mới được hủy
        if (req.user.role !== 'admin' && req.user.role !== 'manager' && req.user.role !== 'operator' && voucher.created_by != req.user.id) {
            return res.status(403).json({ message: 'Lỗi Phân Quyền! Bạn không có quyền hủy Phiếu Thu này.' });
        }

        if (voucher.status === 'Đã hủy') {
            return res.status(400).json({ message: 'Phiếu thu này đã được hủy trước đó!' });
        }

        // Proceed to rollback specific paid amount to op_tour_bookings
        if (voucher.booking_id && voucher.amount > 0) {
            const downRes = await db.query(`
                UPDATE op_tour_bookings 
                SET paid = GREATEST(0, paid - $1)
                WHERE id = $2
                RETURNING total, paid, status
            `, [voucher.amount, voucher.booking_id]);

            if (downRes.rows.length > 0) {
                const bCheck = downRes.rows[0];
                const newPaid = Number(bCheck.paid || 0);
                const total = Number(bCheck.total || 0);
                
                let autoStatus = bCheck.status;
                if (newPaid === 0 && (bCheck.status === 'Đã đặt cọc' || bCheck.status === 'Đã thanh toán')) {
                    autoStatus = 'Giữ chỗ';
                } else if (newPaid > 0 && newPaid < total) {
                    autoStatus = 'Đã đặt cọc';
                }

                if (autoStatus !== bCheck.status) {
                    await db.query(`UPDATE op_tour_bookings SET status = $1 WHERE id = $2`, [autoStatus, voucher.booking_id]);
                }
            }
        }

        // Set status to Cancelled
        await db.query(`UPDATE payment_vouchers SET status = 'Đã hủy' WHERE id = $1`, [id]);
        
        res.json({ message: 'Hủy phiếu thu thành công và đã hoàn tất khấu trừ lệnh.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error cancelling voucher', error: err.message });
    }
};

exports.deleteVoucher = async (req, res) => {
    try {
        const { id } = req.params;
        const vCheck = await db.query('SELECT * FROM payment_vouchers WHERE id = $1', [id]);
        if (vCheck.rows.length === 0) return res.status(404).json({ message: 'Voucher not found' });
        
        const voucher = vCheck.rows[0];
        // If not cancelled yet, we must rollback the paid amount before deleting
        if (voucher.status !== 'Đã hủy' && voucher.booking_id && voucher.amount > 0) {
            await db.query(`
                UPDATE op_tour_bookings 
                SET paid = paid - $1 
                WHERE id = $2
            `, [voucher.amount, voucher.booking_id]);
        }

        await db.query('DELETE FROM payment_vouchers WHERE id = $1', [id]);
        res.json({ message: 'Xóa vĩnh viễn phiếu thu thành công.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting voucher', error: err.message });
    }
};
