const db = require('../db');
const crypto = require('crypto');

/**
 * Helper to build date range filters based on year and month
 */
function buildDateCondition(alias, year, month, startParamIdx = 1) {
    const params = [];
    let idx = startParamIdx;
    let sql = '';

    const y = parseInt(year) || new Date().getFullYear();
    sql += `EXTRACT(YEAR FROM ${alias}.start_date) = $${idx++}`;
    params.push(y);

    if (month && month !== 'all') {
        const m = parseInt(month);
        sql += ` AND EXTRACT(MONTH FROM ${alias}.start_date) = $${idx++}`;
        params.push(m);
    }

    return { sql, params, nextIdx: idx };
}

/**
 * 1. GET /api/departure-cashflow/stats
 * Overview stats, cashflow progress, route debt comparison, monthly trend, and logistics
 */
exports.getCashflowStats = async (req, res) => {
    try {
        const { year, month, months, bu, route, debtStatus } = req.query;
        const currentYear = parseInt(year) || new Date().getFullYear();

        // 1. Build Departure Base Filter
        let depWhere = `
            COALESCE(td.is_deleted, false) = false
            AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
        `;
        let depParams = [currentYear];
        let pIdx = 2;

        depWhere += ` AND EXTRACT(YEAR FROM td.start_date) = $1`;

        const monthInput = months || month;
        if (monthInput && monthInput !== 'all') {
            const mArr = String(monthInput).split(',')
                .map(m => parseInt(m.trim()))
                .filter(m => !isNaN(m) && m >= 1 && m <= 12);
            if (mArr.length > 0 && mArr.length < 12) {
                depWhere += ` AND EXTRACT(MONTH FROM td.start_date) = ANY($${pIdx++}::int[])`;
                depParams.push(mArr);
            }
        }

        if (bu && bu !== 'all') {
            depWhere += ` AND tt.bu_group = $${pIdx++}`;
            depParams.push(bu);
        }

        if (route && route.trim()) {
            depWhere += ` AND (tt.name ILIKE $${pIdx} OR td.code ILIKE $${pIdx} OR td.market ILIKE $${pIdx})`;
            depParams.push(`%${route.trim()}%`);
            pIdx++;
        }

        // 2. Fetch Aggregated Metrics from Bookings
        let bookingDebtFilter = '';
        if (debtStatus === 'debt') {
            bookingDebtFilter = `AND (b.paid < b.total_price OR b.paid IS NULL)`;
        } else if (debtStatus === 'settled') {
            bookingDebtFilter = `AND (b.paid >= b.total_price AND b.total_price > 0)`;
        }

        const metricsQuery = `
            SELECT 
                COUNT(DISTINCT td.id) as total_departures,
                COALESCE(SUM(b.pax_count), 0) as total_pax,
                COALESCE(SUM(b.total_price), 0) as total_projected,
                COALESCE(SUM(b.paid), 0) as total_collected,
                COUNT(b.id) FILTER (WHERE COALESCE(b.total_price, 0) > 0 AND COALESCE(b.paid, 0) >= b.total_price) as fully_paid_count,
                COALESCE(SUM(b.pax_count) FILTER (WHERE COALESCE(b.total_price, 0) > 0 AND COALESCE(b.paid, 0) >= b.total_price), 0) as fully_paid_pax,
                COUNT(b.id) FILTER (WHERE COALESCE(b.total_price, 0) > 0 AND COALESCE(b.paid, 0) > 0 AND COALESCE(b.paid, 0) < b.total_price) as partial_paid_count,
                COALESCE(SUM(b.pax_count) FILTER (WHERE COALESCE(b.total_price, 0) > 0 AND COALESCE(b.paid, 0) > 0 AND COALESCE(b.paid, 0) < b.total_price), 0) as partial_paid_pax,
                COUNT(b.id) FILTER (WHERE COALESCE(b.paid, 0) = 0) as unpaid_count,
                COALESCE(SUM(b.pax_count) FILTER (WHERE COALESCE(b.paid, 0) = 0), 0) as unpaid_pax
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN bookings b ON b.tour_departure_id = td.id 
                AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
                ${bookingDebtFilter}
            WHERE ${depWhere}
        `;

        const metricsRes = await db.query(metricsQuery, depParams);
        const mRow = metricsRes.rows[0];

        const totalProjected = parseFloat(mRow.total_projected) || 0;
        const totalCollected = parseFloat(mRow.total_collected) || 0;
        const remainingDebt = Math.max(0, totalProjected - totalCollected);
        const recoveryProgress = totalProjected > 0 ? Math.min(100, (totalCollected / totalProjected) * 100) : 0;

        // 3. Route Debt Breakdown (Horizontal Stacked Bar Chart)
        const routesQuery = `
            SELECT 
                CASE 
                    WHEN tt.name ILIKE '%Giang Nam%' OR td.market ILIKE '%Giang Nam%' THEN 'Giang Nam'
                    WHEN tt.name ILIKE '%Á Đinh%' OR tt.name ILIKE '%Đạo Thành%' OR td.market ILIKE '%Á Đinh%' THEN 'Đạo Thành Á Đinh'
                    WHEN tt.name ILIKE '%Tân Cương%' OR td.market ILIKE '%Tân Cương%' THEN 'Tân Cương'
                    WHEN tt.name ILIKE '%Thanh Tạng%' OR tt.name ILIKE '%Tây Tạng%' OR td.market ILIKE '%Tây Tạng%' THEN 'Thanh Tạng'
                    WHEN tt.name ILIKE '%Bắc Kinh%' OR td.market ILIKE '%Bắc Kinh%' THEN 'Bắc Kinh'
                    WHEN tt.name ILIKE '%Lệ Giang%' OR td.market ILIKE '%Lệ Giang%' THEN 'Lệ Giang'
                    WHEN tt.name ILIKE '%Bhutan%' OR td.market ILIKE '%Bhutan%' THEN 'Bhutan'
                    WHEN tt.name ILIKE '%Ladakh%' OR td.market ILIKE '%Ladakh%' THEN 'Ladakh'
                    WHEN tt.name ILIKE '%Vũ Hán%' OR td.market ILIKE '%Vũ Hán%' THEN 'Vũ Hán'
                    WHEN tt.name ILIKE '%Nhật Bản%' OR td.market ILIKE '%Nhật Bản%' THEN 'Nhật Bản'
                    WHEN tt.name ILIKE '%Hàn Quốc%' OR td.market ILIKE '%Hàn Quốc%' THEN 'Hàn Quốc'
                    WHEN tt.name ILIKE '%Pakistan%' OR td.market ILIKE '%Pakistan%' THEN 'Pakistan'
                    WHEN tt.name ILIKE '%Mông Cổ%' OR tt.name ILIKE '%Orkhon%' OR td.market ILIKE '%Mông Cổ%' THEN 'Mông Cổ'
                    WHEN tt.name ILIKE '%Đài Loan%' OR td.market ILIKE '%Đài Loan%' THEN 'Đài Loan'
                    WHEN tt.name ILIKE '%Ai Cập%' OR td.market ILIKE '%Ai Cập%' THEN 'Ai Cập'
                    WHEN tt.name ILIKE '%Châu Âu%' OR td.market ILIKE '%Châu Âu%' THEN 'Châu Âu'
                    WHEN NULLIF(TRIM(td.market), '') IS NOT NULL THEN TRIM(td.market)
                    WHEN tt.name IS NOT NULL THEN REGEXP_REPLACE(REGEXP_REPLACE(tt.name, '^(TOUR|LỊCH KHỞI HÀNH|LKH)\\s+', '', 'i'), '\\s*\\d+N\\d+Đ.*$', '', 'i')
                    ELSE 'Khác'
                END as route_name,
                COALESCE(SUM(b.total_price), 0) as total_revenue,
                COALESCE(SUM(b.paid), 0) as collected,
                GREATEST(0, COALESCE(SUM(b.total_price), 0) - COALESCE(SUM(b.paid), 0)) as remaining_debt,
                COALESCE(SUM(b.pax_count), 0) as sold_pax
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN bookings b ON b.tour_departure_id = td.id 
                AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
                ${bookingDebtFilter}
            WHERE ${depWhere}
            GROUP BY 1
            HAVING COALESCE(SUM(b.total_price), 0) > 0
            ORDER BY total_revenue DESC
            LIMIT 15
        `;
        const routesRes = await db.query(routesQuery, depParams);

        // 4. Monthly Cashflow Trend for the full year (12 months)
        let trendWhere = `
            COALESCE(td.is_deleted, false) = false
            AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
            AND EXTRACT(YEAR FROM td.start_date) = $1
        `;
        let trendParams = [currentYear];
        let tIdx = 2;

        if (bu && bu !== 'all') {
            trendWhere += ` AND tt.bu_group = $${tIdx++}`;
            trendParams.push(bu);
        }

        const monthlyQuery = `
            SELECT 
                EXTRACT(MONTH FROM td.start_date)::int as month_num,
                COALESCE(SUM(b.total_price), 0) as projected,
                COALESCE(SUM(b.paid), 0) as collected
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN bookings b ON b.tour_departure_id = td.id 
                AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
            WHERE ${trendWhere}
            GROUP BY EXTRACT(MONTH FROM td.start_date)
            ORDER BY month_num ASC
        `;
        const monthlyRes = await db.query(monthlyQuery, trendParams);
        const monthMap = {};
        monthlyRes.rows.forEach(r => {
            monthMap[r.month_num] = {
                projected: parseFloat(r.projected) || 0,
                collected: parseFloat(r.collected) || 0
            };
        });

        const monthlyTrend = [];
        for (let m = 1; m <= 12; m++) {
            monthlyTrend.push({
                month: `T${m}`,
                month_num: m,
                projected: monthMap[m]?.projected || 0,
                collected: monthMap[m]?.collected || 0
            });
        }

        // 5. Logistics Breakdown (SIM, Rooming, Demographics, Surcharges)
        // Aggregating from departure_quick_logistics
        const logisticsQuery = `
            SELECT 
                dql.sim_counts,
                dql.room_counts,
                dql.demographics,
                dql.surcharges
            FROM departure_quick_logistics dql
            JOIN tour_departures td ON dql.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE ${depWhere}
        `;
        const logisticsRes = await db.query(logisticsQuery, depParams);

        let simTotals = { physical: 0, esim: 0, none: 0 };
        let roomTotals = { dbl: 0, twin: 0, trip: 0, sgl: 0, odd: 0 };
        let demoTotals = { adult: 0, child: 0 };
        let surchargesList = [];
        let totalSurchargesAmount = 0;

        if (logisticsRes.rows.length > 0) {
            logisticsRes.rows.forEach(row => {
                const s = row.sim_counts || {};
                simTotals.physical += parseInt(s.physical) || 0;
                simTotals.esim += parseInt(s.esim) || 0;
                simTotals.none += parseInt(s.none) || 0;

                const r = row.room_counts || {};
                roomTotals.dbl += parseInt(r.dbl) || 0;
                roomTotals.twin += parseInt(r.twin) || 0;
                roomTotals.trip += parseInt(r.trip) || 0;
                roomTotals.sgl += parseInt(r.sgl) || 0;
                roomTotals.odd += parseInt(r.odd) || 0;

                const d = row.demographics || {};
                demoTotals.adult += parseInt(d.adult) || 0;
                demoTotals.child += parseInt(d.child) || 0;

                const scList = Array.isArray(row.surcharges) ? row.surcharges : [];
                scList.forEach(sc => {
                    const amt = parseFloat(sc.amount) || 0;
                    if (amt > 0) {
                        totalSurchargesAmount += amt;
                        surchargesList.push({
                            title: sc.title || sc.label || 'Phụ phí phát sinh',
                            amount: amt,
                            note: sc.note || ''
                        });
                    }
                });
            });
        } else {
            // Fallback estimation when no quick-logistics yet
            const totalPax = parseInt(mRow.total_pax) || 0;
            demoTotals.adult = totalPax;
            simTotals.none = totalPax;
            roomTotals.dbl = Math.floor(totalPax / 2);
            roomTotals.sgl = totalPax % 2;
        }

        // 6. Departures Detail List for Table
        const listQuery = `
            SELECT 
                td.id,
                td.code,
                COALESCE(tt.name, td.market, 'Chưa đặt tên') as tour_name,
                td.start_date,
                td.end_date,
                td.max_participants as max_pax,
                tt.bu_group,
                td.status,
                COALESCE(ba.sold_pax, 0) as sold_pax,
                COALESCE(ba.revenue, 0) as revenue,
                COALESCE(ba.collected, 0) as collected,
                GREATEST(0, COALESCE(ba.revenue, 0) - COALESCE(ba.collected, 0)) as debt,
                g.name as guide_name,
                dsl.token as share_token,
                CASE WHEN dql.id IS NOT NULL THEN true ELSE false END as has_quick_logistics
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN guides g ON td.guide_id = g.id
            LEFT JOIN departure_share_links dsl ON dsl.tour_departure_id = td.id AND dsl.is_active = true
            LEFT JOIN departure_quick_logistics dql ON dql.tour_departure_id = td.id
            LEFT JOIN (
                SELECT 
                    tour_departure_id,
                    SUM(pax_count) as sold_pax,
                    SUM(total_price) as revenue,
                    SUM(paid) as collected
                FROM bookings
                WHERE booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
                GROUP BY tour_departure_id
            ) ba ON ba.tour_departure_id = td.id
            WHERE ${depWhere}
            ORDER BY td.start_date ASC
            LIMIT 50
        `;
        const listRes = await db.query(listQuery, depParams);

        // 7. Get available BUs for Dropdown
        const buRes = await db.query(`
            SELECT DISTINCT bu_group 
            FROM tour_templates 
            WHERE bu_group IS NOT NULL AND bu_group != ''
            ORDER BY bu_group ASC
        `);
        const availableBUs = buRes.rows.map(r => r.bu_group);

        let userBUs = [];
        if (req.user && req.user.id) {
            const uRes = await db.query('SELECT bus FROM users WHERE id = $1', [req.user.id]);
            if (uRes.rows.length > 0 && Array.isArray(uRes.rows[0].bus)) {
                userBUs = uRes.rows[0].bus;
            }
        }

        res.json({
            metrics: {
                total_departures: parseInt(mRow.total_departures) || 0,
                total_pax: parseInt(mRow.total_pax) || 0,
                total_projected: totalProjected,
                total_collected: totalCollected,
                remaining_debt: remainingDebt,
                recovery_progress_pct: parseFloat(recoveryProgress.toFixed(1)),
                tiers: {
                    fully_paid: {
                        count: parseInt(mRow.fully_paid_count) || 0,
                        pax: parseInt(mRow.fully_paid_pax) || 0
                    },
                    partial_paid: {
                        count: parseInt(mRow.partial_paid_count) || 0,
                        pax: parseInt(mRow.partial_paid_pax) || 0
                    },
                    unpaid: {
                        count: parseInt(mRow.unpaid_count) || 0,
                        pax: parseInt(mRow.unpaid_pax) || 0
                    }
                }
            },
            routesBreakdown: routesRes.rows.map(r => ({
                route_name: r.route_name,
                total_revenue: parseFloat(r.total_revenue) || 0,
                collected: parseFloat(r.collected) || 0,
                remaining_debt: parseFloat(r.remaining_debt) || 0,
                sold_pax: parseInt(r.sold_pax) || 0
            })),
            monthlyTrend,
            logistics: {
                sim: simTotals,
                rooms: roomTotals,
                demographics: demoTotals,
                surcharges: {
                    total: totalSurchargesAmount,
                    items: surchargesList.slice(0, 10)
                }
            },
            departures: listRes.rows,
            availableBUs,
            userBUs
        });

    } catch (err) {
        console.error("Error in getCashflowStats:", err);
        res.status(500).json({ error: "Lỗi tải số liệu Dòng tiền khởi hành: " + err.message });
    }
};

/**
 * 2. GET /api/departure-cashflow/personal
 * Personal Sales perspective: My revenue, debt collection list with D-Day alerts, seat availability
 */
exports.getPersonalCashflow = async (req, res) => {
    try {
        const { userId, year, month, months } = req.query;
        const targetUserId = parseInt(userId) || req.user.id;
        const currentYear = parseInt(year) || new Date().getFullYear();

        // 1. Fetch User Info
        const userRes = await db.query('SELECT id, full_name, username, bus FROM users WHERE id = $1', [targetUserId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy nhân viên' });
        }
        const targetUser = userRes.rows[0];

        // 2. Build date condition for personal sales bookings
        let dateWhere = `EXTRACT(YEAR FROM b.created_at) = $2`;
        let dateParams = [targetUserId, currentYear];
        let pIdx = 3;

        const monthInput = months || month;
        if (monthInput && monthInput !== 'all') {
            const mArr = String(monthInput).split(',')
                .map(m => parseInt(m.trim()))
                .filter(m => !isNaN(m) && m >= 1 && m <= 12);
            if (mArr.length > 0 && mArr.length < 12) {
                dateWhere += ` AND EXTRACT(MONTH FROM b.created_at) = ANY($${pIdx++}::int[])`;
                dateParams.push(mArr);
            }
        }

        // 3. Personal Sales Overview Metrics
        const personalMetricsRes = await db.query(`
            SELECT 
                COUNT(b.id) as total_bookings,
                COALESCE(SUM(b.pax_count), 0) as total_pax,
                COALESCE(SUM(b.total_price), 0) as my_revenue,
                COALESCE(SUM(b.paid), 0) as my_collected,
                GREATEST(0, COALESCE(SUM(b.total_price), 0) - COALESCE(SUM(b.paid), 0)) as my_debt,
                COUNT(b.id) FILTER (WHERE b.paid >= b.total_price AND b.total_price > 0) as settled_bookings,
                COUNT(b.id) FILTER (WHERE b.paid < b.total_price OR b.paid IS NULL) as debt_bookings_count
            FROM bookings b
            WHERE b.created_by = $1
              AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
              AND ${dateWhere}
        `, dateParams);
        const pMetrics = personalMetricsRes.rows[0];

        // 4. Detailed Customer Debt List with D-Day countdown
        const debtListRes = await db.query(`
            SELECT 
                b.id,
                b.booking_code,
                COALESCE(c.name, b.new_customer_info->>'name', 'Khách hàng') as customer_name,
                COALESCE(c.phone, b.new_customer_info->>'phone', '') as customer_phone,
                b.pax_count,
                b.total_price,
                COALESCE(b.paid, 0) as paid,
                GREATEST(0, b.total_price - COALESCE(b.paid, 0)) as remaining_debt,
                b.booking_status,
                b.public_token,
                td.id as departure_id,
                td.code as tour_code,
                COALESCE(tt.name, td.market, 'Tour du lịch') as tour_name,
                td.start_date,
                CEIL(EXTRACT(EPOCH FROM (td.start_date::timestamp - CURRENT_TIMESTAMP)) / 86400)::int as days_until_departure
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN tour_departures td ON b.tour_departure_id = td.id
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE b.created_by = $1
              AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
              AND (b.paid < b.total_price OR b.paid IS NULL)
              AND b.total_price > 0
            ORDER BY 
               CASE WHEN td.start_date >= CURRENT_DATE THEN 0 ELSE 1 END ASC,
               td.start_date ASC
            LIMIT 50
        `, [targetUserId]);

        const debtList = debtListRes.rows.map(row => {
            const days = row.days_until_departure !== null ? row.days_until_departure : 999;
            let urgency = 'normal';
            if (days <= 7) urgency = 'critical';
            else if (days <= 14) urgency = 'warning';

            return {
                ...row,
                total_price: parseFloat(row.total_price) || 0,
                paid: parseFloat(row.paid) || 0,
                remaining_debt: parseFloat(row.remaining_debt) || 0,
                days_until_departure: days,
                urgency
            };
        });

        // 5. Active Available Departures (Tình trạng chỗ trống tour mở bán)
        const { bu: selectedBU } = req.query;
        let buFilter = '';
        const depParams = [];

        if (selectedBU && selectedBU !== 'all') {
            buFilter = `AND tt.bu_group = $1`;
            depParams.push(selectedBU);
        } else {
            const userBUs = Array.isArray(targetUser.bus) && targetUser.bus.length > 0 
                ? targetUser.bus.filter(b => b && b.toUpperCase().startsWith('BU')) 
                : [];
            if (userBUs.length > 0) {
                buFilter = `AND tt.bu_group = ANY($1)`;
                depParams.push(userBUs);
            }
        }

        const openToursRes = await db.query(`
            SELECT 
                td.id,
                td.code,
                COALESCE(tt.name, td.market, 'Tour') as tour_name,
                td.start_date,
                td.end_date,
                tt.bu_group,
                COALESCE(td.max_participants, 0) as max_pax,
                COALESCE(ba.sold_pax, 0) as sold_pax,
                GREATEST(0, COALESCE(td.max_participants, 0) - COALESCE(ba.sold_pax, 0)) as available_seats
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN (
                SELECT 
                    tour_departure_id,
                    SUM(pax_count) as sold_pax
                FROM bookings
                WHERE booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
                GROUP BY tour_departure_id
            ) ba ON ba.tour_departure_id = td.id
            WHERE COALESCE(td.is_deleted, false) = false
              AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
              AND td.start_date >= CURRENT_DATE
              ${buFilter}
            ORDER BY td.start_date ASC
            LIMIT 25
        `, depParams);

        // 6. Fetch Sales users list for the switcher dropdown
        const salesUsersRes = await db.query(`
            SELECT u.id, u.full_name, u.username, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.is_active = true
            ORDER BY u.full_name ASC
        `);

        res.json({
            user: {
                id: targetUser.id,
                full_name: targetUser.full_name,
                bus: targetUser.bus
            },
            personalMetrics: {
                my_revenue: parseFloat(pMetrics.my_revenue) || 0,
                my_collected: parseFloat(pMetrics.my_collected) || 0,
                my_debt: parseFloat(pMetrics.my_debt) || 0,
                total_bookings: parseInt(pMetrics.total_bookings) || 0,
                total_pax: parseInt(pMetrics.total_pax) || 0,
                settled_bookings: parseInt(pMetrics.settled_bookings) || 0,
                debt_bookings_count: parseInt(pMetrics.debt_bookings_count) || 0
            },
            debtBookings: debtList,
            availableDepartures: openToursRes.rows,
            salesUsers: salesUsersRes.rows
        });

    } catch (err) {
        console.error("Error in getPersonalCashflow:", err);
        res.status(500).json({ error: "Lỗi tải sổ tay cá nhân Sale: " + err.message });
    }
};

/**
 * 3. GET /api/departure-cashflow/departures/:id/quick-logistics
 * Get quick logistics data for a specific tour departure
 */
exports.getDepartureQuickLogistics = async (req, res) => {
    const { id } = req.params;
    try {
        const depRes = await db.query(`
            SELECT td.*, COALESCE(tt.name, td.market) as tour_name, tt.bu_group
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            WHERE td.id = $1
        `, [id]);

        if (depRes.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy tour khởi hành' });
        }
        const tour = depRes.rows[0];

        // Fetch Bookings for this departure
        const bookingsRes = await db.query(`
            SELECT 
                b.id,
                b.booking_code,
                COALESCE(c.name, b.new_customer_info->>'name', 'Khách hàng') as customer_name,
                COALESCE(c.phone, b.new_customer_info->>'phone', '') as customer_phone,
                b.pax_count,
                b.total_price,
                b.paid,
                b.booking_status,
                b.created_by,
                u.full_name as created_by_name
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            LEFT JOIN users u ON b.created_by = u.id
            WHERE b.tour_departure_id = $1
              AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
            ORDER BY b.created_at ASC
        `, [id]);

        // Fetch Existing Logistics
        const logRes = await db.query(`
            SELECT * FROM departure_quick_logistics WHERE tour_departure_id = $1
        `, [id]);

        let logisticsData;
        if (logRes.rows.length > 0) {
            logisticsData = logRes.rows[0];
        } else {
            // Default initial counts based on bookings pax count
            const totalPax = bookingsRes.rows.reduce((sum, b) => sum + (parseInt(b.pax_count) || 0), 0);
            logisticsData = {
                tour_departure_id: parseInt(id),
                sim_counts: { physical: totalPax, esim: 0, none: 0 },
                room_counts: { dbl: Math.floor(totalPax / 2), twin: 0, trip: 0, sgl: totalPax % 2, odd: 0 },
                demographics: { adult: totalPax, child: 0 },
                surcharges: [],
                booking_overrides: {}
            };
        }

        res.json({
            tour: {
                id: tour.id,
                code: tour.code,
                tour_name: tour.tour_name,
                start_date: tour.start_date,
                end_date: tour.end_date,
                bu_group: tour.bu_group,
                max_participants: tour.max_participants
            },
            bookings: bookingsRes.rows,
            logistics: logisticsData
        });

    } catch (err) {
        console.error("Error in getDepartureQuickLogistics:", err);
        res.status(500).json({ error: "Lỗi tải sổ tay hậu cần: " + err.message });
    }
};

/**
 * 4. PUT /api/departure-cashflow/departures/:id/quick-logistics
 * Update quick logistics data (SIM, Room, Demographics, Surcharges)
 */
exports.saveDepartureQuickLogistics = async (req, res) => {
    const { id } = req.params;
    const { sim_counts, room_counts, demographics, surcharges, booking_overrides } = req.body || {};

    try {
        const query = `
            INSERT INTO departure_quick_logistics 
                (tour_departure_id, sim_counts, room_counts, demographics, surcharges, booking_overrides, updated_by, updated_at)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
            ON CONFLICT (tour_departure_id) DO UPDATE SET
                sim_counts = EXCLUDED.sim_counts,
                room_counts = EXCLUDED.room_counts,
                demographics = EXCLUDED.demographics,
                surcharges = EXCLUDED.surcharges,
                booking_overrides = EXCLUDED.booking_overrides,
                updated_by = EXCLUDED.updated_by,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *
        `;

        const result = await db.query(query, [
            id,
            JSON.stringify(sim_counts || { physical: 0, esim: 0, none: 0 }),
            JSON.stringify(room_counts || { dbl: 0, twin: 0, trip: 0, sgl: 0, odd: 0 }),
            JSON.stringify(demographics || { adult: 0, child: 0 }),
            JSON.stringify(surcharges || []),
            JSON.stringify(booking_overrides || {}),
            req.user ? req.user.id : null
        ]);

        res.json({
            message: 'Đã lưu sổ tay ghi nhận hậu cần thành công',
            logistics: result.rows[0]
        });

    } catch (err) {
        console.error("Error in saveDepartureQuickLogistics:", err);
        res.status(500).json({ error: "Lỗi lưu sổ tay hậu cần: " + err.message });
    }
};

/**
 * 5. POST /api/departure-cashflow/departures/:id/share-link
 * Generate or retrieve secure token share link for HDV / partner
 */
exports.generateDepartureShareLink = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body || {};

    try {
        // Check existing active link
        const existing = await db.query(`
            SELECT * FROM departure_share_links 
            WHERE tour_departure_id = $1 AND is_active = true
            ORDER BY created_at DESC LIMIT 1
        `, [id]);

        let linkRecord;
        if (existing.rows.length > 0) {
            linkRecord = existing.rows[0];
        } else {
            const token = crypto.randomBytes(16).toString('hex');
            const insertRes = await db.query(`
                INSERT INTO departure_share_links 
                    (tour_departure_id, token, title, created_by)
                VALUES 
                    ($1, $2, $3, $4)
                RETURNING *
            `, [id, token, title || 'Sổ tay đoàn', req.user ? req.user.id : null]);
            linkRecord = insertRes.rows[0];
        }

        const protocol = req.protocol || 'https';
        const host = (req.get && req.get('host')) || req.headers?.host || 'erp.fittour.vn';
        const fullUrl = `${protocol}://${host}/tai-lieu/doan/${linkRecord.token}`;

        res.json({
            success: true,
            token: linkRecord.token,
            title: linkRecord.title,
            url: fullUrl,
            view_count: linkRecord.view_count,
            created_at: linkRecord.created_at
        });

    } catch (err) {
        console.error("Error in generateDepartureShareLink:", err);
        res.status(500).json({ error: "Lỗi tạo link chia sẻ: " + err.message });
    }
};

/**
 * 6. GET /api/departure-cashflow/public-share/:token
 * Public Endpoint (NO AUTH): Returns whitelisted tour manifest, rooming, SIM info.
 * FINANCIAL DATA IS STRICTLY HIDDEN!
 */
exports.getPublicDepartureShare = async (req, res) => {
    const { token } = req.params;

    try {
        const linkRes = await db.query(`
            SELECT dsl.*, td.id as departure_id
            FROM departure_share_links dsl
            JOIN tour_departures td ON dsl.tour_departure_id = td.id
            WHERE dsl.token = $1 AND dsl.is_active = true
        `, [token]);

        if (linkRes.rows.length === 0) {
            return res.status(404).json({ error: 'Liên kết không tồn tại hoặc đã hết hạn.' });
        }
        const link = linkRes.rows[0];

        // Increment view count asynchronously
        db.query(`
            UPDATE departure_share_links 
            SET view_count = view_count + 1, last_accessed_at = CURRENT_TIMESTAMP 
            WHERE id = $1
        `, [link.id]).catch(e => console.error("Update view_count err:", e));

        // Fetch Tour Departure Info
        const tourRes = await db.query(`
            SELECT 
                td.id,
                td.code as tour_code,
                COALESCE(tt.name, td.market, 'Tour du lịch') as tour_name,
                td.start_date,
                td.end_date,
                td.itinerary,
                td.tour_info,
                g.name as guide_name,
                g.phone as guide_phone,
                u.full_name as operator_name,
                u.phone as operator_phone
            FROM tour_departures td
            LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
            LEFT JOIN guides g ON td.guide_id = g.id
            LEFT JOIN users u ON td.operator_id = u.id
            WHERE td.id = $1
        `, [link.departure_id]);

        if (tourRes.rows.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy thông tin chuyến đi' });
        }
        const tour = tourRes.rows[0];

        // Fetch Passenger Manifest (Whitelisted: Names, Gender, Phone, Room, SIM, Notes - NO MONEY)
        const bRes = await db.query(`
            SELECT 
                b.id,
                b.booking_code,
                COALESCE(c.name, b.new_customer_info->>'name', 'Khách hàng') as customer_name,
                COALESCE(c.phone, b.new_customer_info->>'phone', '') as customer_phone,
                b.pax_count,
                b.raw_details
            FROM bookings b
            LEFT JOIN customers c ON b.customer_id = c.id
            WHERE b.tour_departure_id = $1
              AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
            ORDER BY b.created_at ASC
        `, [link.departure_id]);

        // Fetch Quick Logistics
        const logRes = await db.query(`
            SELECT * FROM departure_quick_logistics WHERE tour_departure_id = $1
        `, [link.departure_id]);
        const logistics = logRes.rows[0] || null;

        // Extract clean passenger list
        const passengers = [];
        bRes.rows.forEach(b => {
            const raw = typeof b.raw_details === 'string' ? JSON.parse(b.raw_details) : (b.raw_details || {});
            const members = Array.isArray(raw.members) && raw.members.length > 0 ? raw.members : null;
            
            if (members) {
                members.forEach((m, idx) => {
                    passengers.push({
                        stt: passengers.length + 1,
                        name: m.name || (idx === 0 ? b.customer_name : `Khách đi cùng ${b.customer_name}`),
                        gender: m.gender || '---',
                        phone: m.phone || (idx === 0 ? b.customer_phone : ''),
                        room_type: m.room || m.roomType || 'Theo phân bổ',
                        sim_type: m.sim || m.simType || '---',
                        note: m.note || ''
                    });
                });
            } else {
                for (let i = 0; i < (parseInt(b.pax_count) || 1); i++) {
                    passengers.push({
                        stt: passengers.length + 1,
                        name: i === 0 ? b.customer_name : `${b.customer_name} (Khách ${i + 1})`,
                        gender: '---',
                        phone: i === 0 ? b.customer_phone : '',
                        room_type: 'Theo phân bổ',
                        sim_type: '---',
                        note: ''
                    });
                }
            }
        });

        res.json({
            title: link.title || 'Sổ tay đoàn',
            tour: {
                tour_code: tour.tour_code,
                tour_name: tour.tour_name,
                start_date: tour.start_date,
                end_date: tour.end_date,
                guide: {
                    name: tour.guide_name,
                    phone: tour.guide_phone
                },
                operator: {
                    name: tour.operator_name,
                    phone: tour.operator_phone
                }
            },
            total_passengers: passengers.length,
            passengers,
            logistics: logistics ? {
                sim_counts: logistics.sim_counts,
                room_counts: logistics.room_counts,
                demographics: logistics.demographics
            } : null
        });

    } catch (err) {
        console.error("Error in getPublicDepartureShare:", err);
        res.status(500).json({ error: "Lỗi truy cập sổ tay đoàn công khai: " + err.message });
    }
};
