const db = require('../db');
const { logActivity } = require('../utils/logger');

exports.createVoucher = async (req, res) => {
    try {
        const {
            tour_id,
            booking_id,
            booking_code,
            visa_id,
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
            const bookingCheck = await db.query('SELECT total_price, paid FROM bookings WHERE id = $1', [booking_id]);
            if (bookingCheck.rows.length > 0) {
                const b = bookingCheck.rows[0];
                const remaining = Number(b.total_price) - Number(b.paid);
                if (Number(amount) > remaining) {
                    return res.status(400).json({ message: `Số tiền thu (${Number(amount).toLocaleString('vi-VN')}đ) vượt quá số tiền còn nợ (${remaining.toLocaleString('vi-VN')}đ)!` });
                }
            }
        } else if (visa_id) {
            const visaCheck = await db.query('SELECT finance_data, total_collected FROM visas WHERE id = $1', [visa_id]);
            if (visaCheck.rows.length > 0) {
                const v = visaCheck.rows[0];
                let expectedRevenue = 0;
                try {
                    const financeDataRaw = JSON.parse(v.finance_data || '[]');
                    const suppliers = Array.isArray(financeDataRaw) ? financeDataRaw : (financeDataRaw.suppliers || []);
                    expectedRevenue = suppliers.reduce((sum, sup) => sum + (sup.services || []).reduce((s2, svc) => {
                        const base = (Number(svc.sale_price) || 0) * (Number(svc.fx) || 1) * (Number(svc.quantity) || 1);
                        return s2 + base + (Number(svc.surcharge) || 0) + (Number(svc.vat) || 0);
                    }, 0), 0);
                } catch (e) { console.error('Error parsing visa finance_data:', e); }
                
                const remaining = expectedRevenue - Number(v.total_collected || 0);
                if (Number(amount) > remaining) {
                    return res.status(400).json({ message: `Số tiền thu (${Number(amount).toLocaleString('vi-VN')}đ) vượt quá số tiền khách còn nợ (${remaining.toLocaleString('vi-VN')}đ). (Tổng dự kiến: ${expectedRevenue.toLocaleString()})!` });
                }
            }
        }

        // Auto-generate code e.g., PT-B8734-080426-A3
        const d = new Date();
        const ddmmyy = `${String(d.getDate()).padStart(2, '0')}${String(d.getMonth()+1).padStart(2, '0')}${String(d.getFullYear()).slice(2)}`;
        
        let prefix = booking_code ? booking_code : ((booking_id ? String(booking_id).substring(0, 6) : (visa_id ? `HS${visa_id}` : 'UNK')));
        // Clean prefix if it has BK_ at start to keep it short
        if (prefix.startsWith('BK_')) prefix = prefix.substring(3);
        
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const rnd = chars.charAt(Math.floor(Math.random() * chars.length)) + chars.charAt(Math.floor(Math.random() * chars.length));
        
        const voucher_code = `PT-${prefix}-${ddmmyy}-${rnd}`;

        const insertQuery = `
            INSERT INTO payment_vouchers (
                voucher_code, tour_id, booking_id, visa_id, title, amount,
                payment_method, payer_name, payer_phone, notes,
                created_by, created_by_name, status, attachment_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'Đã duyệt', $13)
            RETURNING *
        `;

        const values = [
            voucher_code, tour_id, booking_id, visa_id || null, title, amount,
            payment_method, payer_name, payer_phone, notes,
            created_by, created_by_name, attachment_url || null
        ];

        const r = await db.query(insertQuery, values);
        
        // Auto Update Booking mapping amount
        if (booking_id && amount > 0) {
            const upRes = await db.query(`
                UPDATE bookings 
                SET paid = paid + $1 
                WHERE id = $2
                RETURNING total_price, paid, booking_status
            `, [amount, booking_id]);

            if (upRes.rows.length > 0) {
                const bCheck = upRes.rows[0];
                const newPaid = Number(bCheck.paid || 0);
                const total = Number(bCheck.total_price || 0);
                
                let autoStatus = bCheck.booking_status;
                if (newPaid >= total && total > 0) {
                    autoStatus = 'Đã thanh toán';
                } else if (newPaid > 0 && newPaid < total) {
                    autoStatus = 'Đã đặt cọc';
                }

                if (autoStatus !== bCheck.booking_status) {
                    await db.query(`UPDATE bookings SET booking_status = $1 WHERE id = $2`, [autoStatus, booking_id]);
                }
            }
        } else if (visa_id && amount > 0) {
            await db.query(`UPDATE visas SET total_collected = total_collected + $1 WHERE id = $2`, [amount, visa_id]);
        }

        // LOG ACTIVITY
        await logActivity({
            user_id: created_by,
            action_type: 'CREATE',
            entity_type: 'VOUCHER',
            entity_id: r.rows[0].id,
            details: `Tạo mới Phiếu thu: ${voucher_code} (${Number(amount).toLocaleString('vi-VN')}đ)`,
            new_data: r.rows[0]
        });

        res.status(201).json(r.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating voucher', error: err.message });
    }
};

exports.getVouchersByBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const result = await db.query(`
            SELECT pv.*, u.full_name as created_by_full_name 
            FROM payment_vouchers pv 
            LEFT JOIN users u ON pv.created_by = u.id 
            WHERE pv.booking_id = $1 
            ORDER BY pv.created_at DESC
        `, [bookingId]);
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
                   td.code as tour_code,
                   tt.name as tour_name,
                   b.booking_status
            FROM payment_vouchers v
            LEFT JOIN tour_departures td ON v.tour_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN bookings b ON v.booking_id = b.id
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
        
        // BUG-02 FIX: Use role from JWT (which is already role_name via authController)
        const userRole = req.user.role || '';
        const isPrivileged = ['admin', 'manager', 'operator'].includes(userRole);
        if (!isPrivileged && voucher.created_by != req.user.id) {
            return res.status(403).json({ message: 'Lỗi Phân Quyền! Bạn không có quyền hủy Phiếu Thu này.' });
        }

        if (voucher.status === 'Đã hủy') {
            return res.status(400).json({ message: 'Phiếu thu này đã được hủy trước đó!' });
        }

        // Proceed to rollback specific paid amount to bookings
        if (voucher.booking_id && voucher.amount > 0) {
            const downRes = await db.query(`
                UPDATE bookings 
                SET paid = GREATEST(0, paid - $1)
                WHERE id = $2
                RETURNING total_price, paid, booking_status
            `, [voucher.amount, voucher.booking_id]);

            if (downRes.rows.length > 0) {
                const bCheck = downRes.rows[0];
                const newPaid = Number(bCheck.paid || 0);
                const total = Number(bCheck.total_price || 0);
                
                let autoStatus = bCheck.booking_status;
                if (newPaid === 0 && (bCheck.booking_status === 'Đã đặt cọc' || bCheck.booking_status === 'Đã thanh toán')) {
                    autoStatus = 'Giữ chỗ';
                } else if (newPaid > 0 && newPaid < total) {
                    autoStatus = 'Đã đặt cọc';
                }

                if (autoStatus !== bCheck.booking_status) {
                    await db.query(`UPDATE bookings SET booking_status = $1 WHERE id = $2`, [autoStatus, voucher.booking_id]);
                }
            }
        } else if (voucher.visa_id && voucher.amount > 0) {
            await db.query(`UPDATE visas SET total_collected = GREATEST(0, total_collected - $1) WHERE id = $2`, [voucher.amount, voucher.visa_id]);
        }

        // Set status to Cancelled
        const updatedVoucherResult = await db.query(`UPDATE payment_vouchers SET status = 'Đã hủy' WHERE id = $1 RETURNING *`, [id]);
        
        // LOG ACTIVITY
        await logActivity({
            user_id: req.user.id,
            action_type: 'UPDATE',
            entity_type: 'VOUCHER',
            entity_id: id,
            details: `Hủy Phiếu thu: ${voucher.voucher_code || id}`,
            old_data: voucher,
            new_data: updatedVoucherResult.rows[0]
        });
        
        // --- INJECT SYSTEM ALERT ---
        try {
            const systemAlertController = require('./systemAlertController');
            await systemAlertController.createAlert(
                voucher.created_by,
                'PAYMENT_REJECTED',
                '❌ Kế Toán Hủy Phiếu Thu',
                `Phiếu thu ${voucher.payment_method} trị giá ${Number(voucher.amount).toLocaleString('vi-VN')}đ của đơn ${voucher.booking_code || 'Chưa rõ'} vừa bị Kế toán từ chối hoặc Tự hủy. Hãy kiểm tra lại!`,
                voucher.booking_id,
                null
            );
        } catch(e) { console.error('Alert Error:', e); }
        // ---------------------------

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
            const downRes = await db.query(`
                UPDATE bookings 
                SET paid = GREATEST(0, paid - $1)
                WHERE id = $2
                RETURNING total_price, paid, booking_status
            `, [voucher.amount, voucher.booking_id]);

            // Recalc auto-status sau khi trừ tiền (giống cancelVoucher)
            if (downRes.rows.length > 0) {
                const bCheck = downRes.rows[0];
                const newPaid = Number(bCheck.paid || 0);
                const total = Number(bCheck.total_price || 0);
                
                let autoStatus = bCheck.booking_status;
                if (newPaid === 0 && (bCheck.booking_status === 'Đã đặt cọc' || bCheck.booking_status === 'Đã thanh toán')) {
                    autoStatus = 'Giữ chỗ';
                } else if (newPaid > 0 && newPaid < total) {
                    autoStatus = 'Đã đặt cọc';
                }

                if (autoStatus !== bCheck.booking_status) {
                    await db.query(`UPDATE bookings SET booking_status = $1 WHERE id = $2`, [autoStatus, voucher.booking_id]);
                }
            }
        } else if (voucher.status !== 'Đã hủy' && voucher.visa_id && voucher.amount > 0) {
            await db.query(`UPDATE visas SET total_collected = GREATEST(0, total_collected - $1) WHERE id = $2`, [voucher.amount, voucher.visa_id]);
        }

        await db.query('DELETE FROM payment_vouchers WHERE id = $1', [id]);
        
        // LOG ACTIVITY
        await logActivity({
            user_id: req.user.id,
            action_type: 'DELETE',
            entity_type: 'VOUCHER',
            entity_id: id,
            details: `Xóa vĩnh viễn Phiếu thu: ${voucher.voucher_code || id}`,
            old_data: voucher
        });

        res.json({ message: 'Xóa vĩnh viễn phiếu thu thành công.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting voucher', error: err.message });
    }
};

exports.getVouchersByVisa = async (req, res) => {
    try {
        const { visaId } = req.params;
        const result = await db.query(`
            SELECT pv.*, u.full_name as created_by_full_name 
            FROM payment_vouchers pv 
            LEFT JOIN users u ON pv.created_by = u.id 
            WHERE pv.visa_id = $1 
            ORDER BY pv.created_at DESC
        `, [visaId]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching vouchers by visa', error: err.message });
    }
};
