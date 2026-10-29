const cron = require('node-cron');
const db = require('../db');
const { sendMail } = require('../utils/mailer');

/**
 * Format currency to Vietnamese Dong string (e.g. 36.780.000 đ)
 */
function formatVND(amount) {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('vi-VN').format(num) + ' đ';
}

/**
 * Generate standard HTML email template for D-7 Debt Warning
 */
function generateDebtEmailHtml(salesName, debtList) {
    const totalRemaining = debtList.reduce((sum, item) => sum + (parseFloat(item.remaining_debt) || 0), 0);
    const baseUrl = process.env.BASE_URL || 'https://erp.fittour.vn';

    const rowsHtml = debtList.map((b, idx) => {
        const link = `${baseUrl}/op-tours?open_departure_id=${b.departure_id}&highlight_booking_id=${b.booking_id}`;
        const startDateStr = b.start_date ? new Date(b.start_date).toLocaleDateString('vi-VN') : '---';
        const daysText = b.days_until_departure <= 0 
            ? 'Đã khởi hành' 
            : `Còn ${b.days_until_departure} ngày ${b.days_until_departure <= 3 ? '🔥' : ''}`;

        return `
            <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 10px 12px; font-weight: 700; color: #0f172a;">
                    ${b.customer_name || 'Khách lẻ'}<br/>
                    <span style="font-size: 12px; font-weight: 500; color: #64748b;">${b.customer_phone || '---'}</span>
                </td>
                <td style="padding: 10px 12px; color: #334155; font-size: 13px;">
                    <strong>${b.tour_name}</strong><br/>
                    <span style="font-size: 11px; color: #64748b;">Mã đoàn: ${b.tour_code || '---'}</span>
                </td>
                <td style="padding: 10px 12px; text-align: center; font-size: 13px; color: #475569;">
                    ${startDateStr}
                </td>
                <td style="padding: 10px 12px; text-align: center;">
                    <span style="display: inline-block; padding: 3px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; background-color: #fee2e2; color: #dc2626;">
                        ${daysText}
                    </span>
                </td>
                <td style="padding: 10px 12px; text-align: right; font-weight: 800; color: #ea580c; font-size: 14px;">
                    ${formatVND(b.remaining_debt)}
                </td>
                <td style="padding: 10px 12px; text-align: center;">
                    <a href="${link}" target="_blank" style="display: inline-block; padding: 6px 12px; background-color: #0284c7; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 12px; font-weight: 700;">
                        Khách đặt chỗ &rarr;
                    </a>
                </td>
            </tr>
        `;
    }).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Cảnh Báo Công Nợ D-7</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px; color: #1e293b;">
        <div style="max-width: 780px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #cbd5e1;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding: 24px 30px; border-bottom: 4px solid #ea580c;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">
                            FIT TOUR <span style="color: #ea580c;">| CẢNH BÁO CÔNG NỢ D-7</span>
                        </h1>
                        <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">
                            Hạn Chót Khởi Hành & Thu Hồi Dòng Tiền Booking (≤ 7 Ngày)
                        </p>
                    </div>
                </div>
            </div>

            <!-- Intro Box -->
            <div style="padding: 24px 30px; background-color: #fff7ed; border-bottom: 1px solid #fed7aa;">
                <p style="margin: 0 0 10px 0; font-size: 15px; line-height: 1.5; color: #9a3412;">
                    Xin chào <strong>${salesName}</strong>,
                </p>
                <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #7c2d12;">
                    Hệ thống ghi nhận bạn có <strong>${debtList.length} booking</strong> sắp đến ngày khởi hành (chỉ còn <strong>≤ 7 ngày</strong>) nhưng khách hàng <strong>chưa thanh toán đủ 100%</strong>.
                </p>
                <div style="display: inline-block; background-color: #ffffff; border: 1px solid #fdba74; padding: 10px 16px; border-radius: 8px;">
                    <span style="font-size: 12px; color: #9a3412; font-weight: 600; text-transform: uppercase;">Tổng công nợ cần thu gấp:</span>
                    <div style="font-size: 22px; font-weight: 900; color: #c2410c; margin-top: 2px;">
                        ${formatVND(totalRemaining)}
                    </div>
                </div>
            </div>

            <!-- Table of Debt Bookings -->
            <div style="padding: 24px 30px; overflow-x: auto;">
                <h3 style="margin: 0 0 14px 0; font-size: 15px; font-weight: 700; color: #1e293b; text-transform: uppercase;">
                    📋 Danh Sách Khách Hàng Cần Đôn Đốc Thanh Toán
                </h3>
                <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13px;">
                    <thead>
                        <tr style="background-color: #f1f5f9; border-bottom: 2px solid #cbd5e1; color: #475569; font-size: 12px; text-transform: uppercase;">
                            <th style="padding: 10px 12px;">Khách Hàng</th>
                            <th style="padding: 10px 12px;">Tuyến Tour</th>
                            <th style="padding: 10px 12px; text-align: center;">Ngày Đi</th>
                            <th style="padding: 10px 12px; text-align: center;">D-Day</th>
                            <th style="padding: 10px 12px; text-align: right;">Còn Nợ</th>
                            <th style="padding: 10px 12px; text-align: center;">Hành Động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>

            <!-- Footer / Guidance -->
            <div style="padding: 20px 30px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
                <p style="margin: 0 0 6px 0;">
                    💡 <strong>Chính sách cảnh báo 1 lần:</strong> Email này chỉ gửi đúng 1 lần khi booking chạm mốc ≤ 7 ngày trước khởi hành.
                </p>
                <p style="margin: 0;">
                    Nhấn vào nút <strong>[Khách đặt chỗ]</strong> để mở trực tiếp danh sách hành khách trong Lịch khởi hành và kiểm tra chứng từ thanh toán.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Scan database for debt bookings entering <= 7 days threshold,
 * send 1 consolidated email per sales consultant, and register in-app notification.
 */
async function scanAndDispatchDebtD7Alerts() {
    console.log('[CRON-DEBT-D7] Bắt đầu quét công nợ D-7 khởi hành...');

    try {
        // Query active bookings with debt approaching within 7 days
        // that have not yet had email alert sent
        const candidateQuery = `
            SELECT 
                b.id as booking_id,
                b.booking_code,
                COALESCE(c.name, b.new_customer_info->>'name', 'Khách lẻ') as customer_name,
                COALESCE(c.phone, b.new_customer_info->>'phone', '') as customer_phone,
                b.total_price,
                COALESCE(b.paid, 0) as paid,
                (b.total_price - COALESCE(b.paid, 0)) as remaining_debt,
                td.id as departure_id,
                td.code as tour_code,
                COALESCE(tt.name, td.market, 'Tour du lịch') as tour_name,
                td.start_date,
                (DATE(td.start_date AT TIME ZONE 'Asia/Ho_Chi_Minh') - CURRENT_DATE)::int as days_until_departure,
                b.created_by,
                u.full_name as sales_name,
                u.email as sales_email,
                u.is_active as sales_active,
                tt.bu_group
            FROM bookings_raw b
            JOIN tour_departures_raw td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
              AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
              AND COALESCE(td.is_deleted, false) = false
              AND (b.paid < b.total_price OR b.paid IS NULL)
              AND b.total_price > 0
              AND (b.total_price - COALESCE(b.paid, 0)) >= 1000
              AND td.start_date >= CURRENT_DATE
              AND td.start_date <= CURRENT_DATE + INTERVAL '7 days'
              AND b.id NOT IN (
                  SELECT booking_id FROM booking_debt_d7_alerts WHERE email_sent_at IS NOT NULL
              )
            ORDER BY td.start_date ASC
        `;

        const candidatesRes = await db.query(candidateQuery);
        const candidates = candidatesRes.rows;

        if (candidates.length === 0) {
            console.log('[CRON-DEBT-D7] Không có booking nào mới phát sinh cần cảnh báo.');
            return { dispatchedCount: 0, recipientCount: 0 };
        }

        console.log(`[CRON-DEBT-D7] Tìm thấy ${candidates.length} booking nợ trong ngưỡng <= 7 ngày cần cảnh báo.`);

        // Group candidates by sales user
        const groupedBySales = {};
        for (const c of candidates) {
            const salesId = c.created_by || 0;
            if (!groupedBySales[salesId]) {
                groupedBySales[salesId] = {
                    salesId,
                    salesName: c.sales_name || 'Nhân sự phụ trách',
                    salesEmail: c.sales_email,
                    salesActive: c.sales_active !== false,
                    buGroup: c.bu_group,
                    bookings: []
                };
            }
            groupedBySales[salesId].bookings.push(c);
        }

        let totalEmailsSent = 0;
        let totalBookingsLogged = 0;

        for (const salesKey of Object.keys(groupedBySales)) {
            const group = groupedBySales[salesKey];
            let targetEmail = group.salesEmail;
            let targetUserId = group.salesId;

            // Fallback if sales inactive or email missing
            if (!targetEmail || !group.salesActive) {
                console.warn(`[CRON-DEBT-D7] Sales ID ${group.salesId} (${group.salesName}) không có email hoặc đã nghỉ. Đang tìm tài khoản BU Leader/Admin fallback...`);
                const fallbackRes = await db.query(`
                    SELECT id, full_name, email 
                    FROM users 
                    WHERE is_active = true 
                      AND (role = 'admin' OR role = 'ceo' OR (role = 'manager' AND $1 = ANY(bus)))
                    ORDER BY CASE WHEN role = 'manager' THEN 1 WHEN role = 'admin' THEN 2 ELSE 3 END
                    LIMIT 1
                `, [group.buGroup || 'BU1']);

                if (fallbackRes.rows.length > 0) {
                    targetEmail = fallbackRes.rows[0].email;
                    targetUserId = fallbackRes.rows[0].id;
                    group.salesName = `${group.salesName} (Người nhận thay: ${fallbackRes.rows[0].full_name})`;
                } else {
                    targetEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
                }
            }

            if (!targetEmail) {
                console.error(`[CRON-DEBT-D7] Không tìm thấy email người nhận cho Sales ID ${group.salesId}. Bỏ qua gửi email.`);
                continue;
            }

            // 1. Send ONE consolidated email for this Sales user
            const emailSubject = `🚨 [CẢNH BÁO CÔNG NỢ D-7] Bạn có ${group.bookings.length} booking sắp khởi hành chưa thanh toán đủ!`;
            const emailHtml = generateDebtEmailHtml(group.salesName, group.bookings);

            try {
                await sendMail({
                    from: `"FIT Tour ERP | Cảnh Báo Công Nợ" <${process.env.SMTP_USER || 'system@fittour.vn'}>`,
                    to: targetEmail,
                    subject: emailSubject,
                    html: emailHtml
                });
                totalEmailsSent++;
                console.log(`[CRON-DEBT-D7] Đã gửi email cảnh báo tới ${targetEmail} (${group.bookings.length} booking).`);
            } catch (mailErr) {
                console.error(`[CRON-DEBT-D7] Lỗi gửi email tới ${targetEmail}:`, mailErr.message);
                // Do not mark email_sent_at so it can retry later
                continue;
            }

            // 2. Insert records into booking_debt_d7_alerts and create in-app notification
            for (const b of group.bookings) {
                await db.query(`
                    INSERT INTO booking_debt_d7_alerts (
                        booking_id, user_id, departure_id, customer_name, customer_phone,
                        tour_code, tour_name, remaining_debt, days_until_departure, email_sent_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    ON CONFLICT (booking_id) DO UPDATE SET
                        user_id = EXCLUDED.user_id,
                        email_sent_at = NOW(),
                        remaining_debt = EXCLUDED.remaining_debt,
                        days_until_departure = EXCLUDED.days_until_departure,
                        updated_at = NOW()
                `, [
                    b.booking_id,
                    targetUserId,
                    b.departure_id,
                    b.customer_name,
                    b.customer_phone,
                    b.tour_code,
                    b.tour_name,
                    b.remaining_debt,
                    b.days_until_departure
                ]);

                // Create standard in-app notification for the bell dropdown
                const notifTitle = `🚨 Cảnh báo công nợ D-7: ${b.customer_name}`;
                const notifMsg = `Khách còn nợ ${formatVND(b.remaining_debt)} tour ${b.tour_name} (còn ${b.days_until_departure} ngày đến ngày đi). Bấm để mở danh sách Khách đặt chỗ.`;
                const deepLink = `/op-tours?open_departure_id=${b.departure_id}&highlight_booking_id=${b.booking_id}`;

                const notifRes = await db.query(`
                    INSERT INTO user_notifications (user_id, title, message, link, is_read, type, reference_id)
                    VALUES ($1, $2, $3, $4, false, 'DEBT_D7_ALERT', $5)
                    RETURNING *
                `, [targetUserId, notifTitle, notifMsg, deepLink, b.booking_id]);

                // Socket real-time emit
                if (global.io && notifRes.rows[0]) {
                    global.io.to(`user_${targetUserId}`).emit('new_notification', notifRes.rows[0]);
                    global.io.to(`user_${targetUserId}`).emit('debt_d7_alert_refresh');
                }

                totalBookingsLogged++;
            }
        }

        console.log(`[CRON-DEBT-D7] Hoàn tất quét công nợ D-7: Gửi ${totalEmailsSent} email, ghi nhận ${totalBookingsLogged} cảnh báo.`);
        return { dispatchedCount: totalBookingsLogged, recipientCount: totalEmailsSent };
    } catch (err) {
        console.error('[CRON-DEBT-D7] Lỗi trong quá trình quét cảnh báo công nợ:', err);
        throw err;
    }
}

/**
 * Start cron job at 08:30 AM every day
 */
function startDebtD7AlertCron() {
    // Run at 08:30 AM every day (Asia/Ho_Chi_Minh)
    cron.schedule('30 8 * * *', async () => {
        console.log('[CRON] Kích hoạt tiến trình tự động quét công nợ D-7 (08:30 AM)...');
        await scanAndDispatchDebtD7Alerts().catch(err => {
            console.error('[CRON] Thất bại khi chạy quét công nợ D-7:', err);
        });
    }, {
        scheduled: true,
        timezone: 'Asia/Ho_Chi_Minh'
    });

    console.log('⏰ [CRON-DEBT-D7] Đã lập lịch quét cảnh báo công nợ D-7 hàng ngày lúc 08:30 AM.');
}

module.exports = {
    startDebtD7AlertCron,
    scanAndDispatchDebtD7Alerts
};
