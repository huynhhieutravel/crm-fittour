const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const db = require('../db');
const { scanAndDispatchDebtD7Alerts } = require('../cron/debtD7AlertEngine');

/**
 * GET /api/debt-alerts/pending
 * Returns pending D-7 debt alerts for the current logged-in user that haven't been shown in popup yet
 */
router.get('/pending', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(`
            SELECT 
                a.id,
                a.id as alert_id,
                a.booking_id,
                a.departure_id,
                a.departure_id as tour_departure_id,
                a.customer_name,
                a.customer_phone,
                a.tour_code,
                a.tour_name,
                a.remaining_debt,
                a.days_until_departure,
                a.email_sent_at,
                a.created_at,
                td.start_date
            FROM booking_debt_d7_alerts a
            JOIN bookings_raw b ON a.booking_id = b.id
            JOIN tour_departures_raw td ON a.departure_id = td.id
            WHERE a.user_id = $1
              AND a.popup_shown_at IS NULL
              AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
              AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
              AND (b.paid < b.total_price OR b.paid IS NULL)
              AND (b.total_price - COALESCE(b.paid, 0)) >= 1000
            ORDER BY a.days_until_departure ASC, a.remaining_debt DESC
        `, [userId]);

        return res.json({
            success: true,
            alerts: result.rows
        });
    } catch (err) {
        console.error('[API-DEBT-ALERTS] Lỗi lấy danh sách alert pending:', err);
        return res.status(500).json({ success: false, message: 'Lỗi server khi lấy cảnh báo công nợ' });
    }
});

/**
 * POST /api/debt-alerts/acknowledge
 * Marks pending alerts as shown in popup so they never popup again
 */
router.post('/acknowledge', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const alertIds = req.body?.alert_ids || req.body?.alertIds;

        if (Array.isArray(alertIds) && alertIds.length > 0) {
            await db.query(`
                UPDATE booking_debt_d7_alerts
                SET popup_shown_at = NOW(), updated_at = NOW()
                WHERE user_id = $1 AND id = ANY($2::int[])
            `, [userId, alertIds]);
        } else {
            // Acknowledge all pending for this user
            await db.query(`
                UPDATE booking_debt_d7_alerts
                SET popup_shown_at = NOW(), updated_at = NOW()
                WHERE user_id = $1 AND popup_shown_at IS NULL
            `, [userId]);
        }

        return res.json({ success: true, message: 'Đã xác nhận xem cảnh báo' });
    } catch (err) {
        console.error('[API-DEBT-ALERTS] Lỗi acknowledge alerts:', err);
        return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái cảnh báo' });
    }
});

/**
 * POST /api/debt-alerts/scan-now
 * Manually trigger scanning process (Admins / Managers only)
 */
router.post('/scan-now', auth, async (req, res) => {
    try {
        const userRole = req.user.role || req.user.role_name;
        if (!['admin', 'ceo', 'manager'].includes(userRole)) {
            return res.status(403).json({ success: false, message: 'Chỉ Quản trị viên mới được kích hoạt quét thủ công' });
        }

        const summary = await scanAndDispatchDebtD7Alerts();
        return res.json({
            success: true,
            message: 'Đã hoàn tất quét và phát cảnh báo công nợ D-7',
            summary
        });
    } catch (err) {
        console.error('[API-DEBT-ALERTS] Lỗi scan-now:', err);
        return res.status(500).json({ success: false, message: err.message || 'Lỗi khi quét công nợ D-7' });
    }
});

module.exports = router;
