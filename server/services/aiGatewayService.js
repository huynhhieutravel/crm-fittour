const db = require('../db');
const { sanitizeObject } = require('../utils/piiSanitizer');

/**
 * AI Gateway Business Service Layer
 * Cung cấp 5 Curated Semantic Tools chuẩn hóa, đối soát khớp 100% với logic ERP.
 */

// -------------------------------------------------------------
// TOOL 1: getExecutiveKPI (Nguồn đối soát: ceoDashboardController.js)
// -------------------------------------------------------------
async function getExecutiveKPI(aiUser, filters = {}) {
    let { timeframe, startDate, endDate, bu_group } = filters;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    let dateFilter = '1=1';
    let params = [];
    let pIdx = 1;

    if (timeframe === 'this_month') {
        const startStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(currentYear, currentMonth, 0).getDate();
        const endStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        params.push(startStr, endStr);
        dateFilter = `td.start_date >= $${pIdx++} AND td.start_date <= $${pIdx++}`;
        startDate = startStr;
        endDate = endStr;
    } else if (timeframe === 'last_month') {
        const lastMonthDate = new Date(currentYear, now.getMonth() - 1, 1);
        const lmYear = lastMonthDate.getFullYear();
        const lmMonth = lastMonthDate.getMonth() + 1;
        const startStr = `${lmYear}-${String(lmMonth).padStart(2, '0')}-01`;
        const lastDay = new Date(lmYear, lmMonth, 0).getDate();
        const endStr = `${lmYear}-${String(lmMonth).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        params.push(startStr, endStr);
        dateFilter = `td.start_date >= $${pIdx++} AND td.start_date <= $${pIdx++}`;
        startDate = startStr;
        endDate = endStr;
    } else if (timeframe === 'this_year' || (!startDate && !endDate)) {
        params.push(`${currentYear}-01-01`, `${currentYear}-12-31`);
        dateFilter = `td.start_date >= $${pIdx++} AND td.start_date <= $${pIdx++}`;
        startDate = `${currentYear}-01-01`;
        endDate = `${currentYear}-12-31`;
    } else if (startDate && endDate) {
        params.push(startDate, endDate);
        dateFilter = `td.start_date >= $${pIdx++} AND td.start_date <= $${pIdx++}`;
    }

    let scopeNotice = null;
    let buCondition = '';

    if (aiUser.scope !== 'all') {
        const allowed = Array.isArray(aiUser.allowedBUs) ? aiUser.allowedBUs : [];
        if (allowed.length === 0) {
            buCondition = ' AND 1=0';
            scopeNotice = 'Tài khoản chưa được gán vào Business Unit nào.';
        } else {
            if (bu_group && !allowed.includes(bu_group)) {
                scopeNotice = `Cảnh báo: Bạn không có quyền xem ${bu_group}. Hệ thống tự động chuyển sang phạm vi được cấp phép: ${allowed.join(', ')}.`;
            }
            params.push(allowed);
            buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = ANY($${pIdx++})`;
        }
    } else {
        if (bu_group && bu_group !== 'Tất cả' && bu_group !== 'all') {
            params.push(bu_group);
            buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = $${pIdx++}`;
        }
    }

    const kpiSummaryQuery = `
        SELECT 
            COALESCE(SUM(b.total_price), 0)::NUMERIC as total_revenue,
            COALESCE(SUM(b.paid), 0)::NUMERIC as actual_cash_collected,
            COALESCE(SUM(b.pax_count), 0)::INTEGER as total_pax,
            COUNT(DISTINCT b.id)::INTEGER as valid_bookings_count,
            COUNT(DISTINCT td.id)::INTEGER as active_departures_count
        FROM bookings b
        JOIN tour_departures td ON b.tour_departure_id = td.id
        JOIN tour_templates tt ON td.tour_template_id = tt.id
        WHERE b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED', 'Mới')
          AND b.paid > 0
          AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND tt.name NOT ILIKE '%[Tour Cũ]%'
          AND ${dateFilter}
          ${buCondition};
    `;

    const buBreakdownQuery = `
        SELECT 
            COALESCE(tt.bu_group, 'Chưa phân loại') as bu_group,
            COALESCE(SUM(b.total_price), 0)::NUMERIC as revenue,
            COALESCE(SUM(b.paid), 0)::NUMERIC as cashflow,
            COALESCE(SUM(b.pax_count), 0)::INTEGER as pax_count,
            COUNT(DISTINCT b.id)::INTEGER as booking_count
        FROM bookings b
        JOIN tour_departures td ON b.tour_departure_id = td.id
        JOIN tour_templates tt ON td.tour_template_id = tt.id
        WHERE b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED', 'Mới')
          AND b.paid > 0
          AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND tt.name NOT ILIKE '%[Tour Cũ]%'
          AND ${dateFilter}
          ${buCondition}
        GROUP BY COALESCE(tt.bu_group, 'Chưa phân loại')
        ORDER BY revenue DESC;
    `;

    const [summaryRes, buRes] = await Promise.all([
        db.query(kpiSummaryQuery, params),
        db.query(buBreakdownQuery, params)
    ]);

    const summary = summaryRes.rows[0] || {};
    const totalRevenue = Number(summary.total_revenue || 0);
    const actualCash = Number(summary.actual_cash_collected || 0);
    const collectionRate = totalRevenue > 0 ? Number(((actualCash / totalRevenue) * 100).toFixed(2)) : 0;

    const breakdown = buRes.rows.map(r => ({
        bu_group: r.bu_group,
        revenue: Number(r.revenue),
        cashflow: Number(r.cashflow),
        pax_count: Number(r.pax_count),
        booking_count: Number(r.booking_count),
        collection_rate: Number(r.revenue) > 0 ? Number(((Number(r.cashflow) / Number(r.revenue)) * 100).toFixed(2)) : 0
    }));

    return sanitizeObject({
        success: true,
        tool: 'get_executive_kpi_summary',
        data: {
            kpi: {
                total_revenue_vnd: totalRevenue,
                actual_cash_collected_vnd: actualCash,
                uncollected_debt_vnd: totalRevenue - actualCash,
                collection_rate_percent: collectionRate,
                total_pax: Number(summary.total_pax || 0),
                valid_bookings_count: Number(summary.valid_bookings_count || 0),
                active_departures_count: Number(summary.active_departures_count || 0)
            },
            breakdown_by_bu: breakdown
        },
        metadata: {
            scope_applied: aiUser.scope,
            user_allowed_bus: aiUser.allowedBUs,
            requested_timeframe: timeframe || 'custom',
            applied_date_range: { start_date: startDate, end_date: endDate },
            currency: 'VND',
            timezone: 'Asia/Ho_Chi_Minh',
            scope_notice: scopeNotice,
            reconciliation_source: 'server/controllers/ceoDashboardController.js',
            business_rule: 'Chỉ ghi nhận booking có phát sinh cọc thực tế (paid > 0), tour departure không hủy và không thuộc danh mục [Tour Cũ].',
            generated_at: new Date().toISOString()
        }
    });
}

// -------------------------------------------------------------
// TOOL 2: getDeparturesOccupancy (Nguồn đối soát: departureController.js & departureCashflowController.js)
// -------------------------------------------------------------
async function getDeparturesOccupancy(aiUser, filters = {}) {
    const daysAhead = Math.min(Math.max(parseInt(filters.days_ahead) || 30, 1), 180);
    const params = [daysAhead];
    let pIdx = 2;

    let buCondition = '';
    let scopeNotice = null;

    if (aiUser.scope !== 'all') {
        const allowed = Array.isArray(aiUser.allowedBUs) ? aiUser.allowedBUs : [];
        if (allowed.length === 0) {
            buCondition = ' AND 1=0';
            scopeNotice = 'Tài khoản chưa được gán vào Business Unit nào.';
        } else {
            params.push(allowed);
            buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = ANY($${pIdx++})`;
        }
    } else if (filters.bu_group && filters.bu_group !== 'all') {
        params.push(filters.bu_group);
        buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = $${pIdx++}`;
    }

    const query = `
        SELECT 
            td.id as departure_id,
            td.code as departure_code,
            td.start_date,
            td.status as departure_status,
            tt.code as tour_code,
            tt.name as tour_name,
            COALESCE(tt.bu_group, 'Chưa phân loại') as bu_group,
            COALESCE(td.max_participants, 20) as total_seats,
            COALESCE(SUM(CASE WHEN b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED') THEN b.pax_count ELSE 0 END), 0)::INTEGER as total_booked_pax,
            COALESCE(SUM(CASE WHEN b.paid > 0 AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED') THEN b.pax_count ELSE 0 END), 0)::INTEGER as paid_pax,
            COALESCE(SUM(CASE WHEN b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED') THEN b.total_price ELSE 0 END), 0)::NUMERIC as total_departure_revenue,
            COALESCE(SUM(CASE WHEN b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED') THEN b.paid ELSE 0 END), 0)::NUMERIC as total_departure_collected,
            (DATE(td.start_date AT TIME ZONE 'Asia/Ho_Chi_Minh') - CURRENT_DATE)::INTEGER as days_until_departure
        FROM tour_departures td
        JOIN tour_templates tt ON td.tour_template_id = tt.id
        LEFT JOIN bookings b ON b.tour_departure_id = td.id
        WHERE td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND COALESCE(td.is_deleted, false) = false
          AND td.start_date >= CURRENT_DATE
          AND td.start_date <= CURRENT_DATE + ($1 * interval '1 day')
          ${buCondition}
        GROUP BY td.id, td.code, td.start_date, td.status, tt.code, tt.name, tt.bu_group, td.max_participants
        ORDER BY td.start_date ASC
        LIMIT 50;
    `;

    const res = await db.query(query, params);

    const departures = res.rows.map(r => {
        const totalSeats = Number(r.total_seats) || 20;
        const bookedPax = Number(r.total_booked_pax) || 0;
        const paidPax = Number(r.paid_pax) || 0;
        const occupancyRate = totalSeats > 0 ? Number(((bookedPax / totalSeats) * 100).toFixed(1)) : 0;
        const depositRate = totalSeats > 0 ? Number(((paidPax / totalSeats) * 100).toFixed(1)) : 0;
        const rev = Number(r.total_departure_revenue || 0);
        const collected = Number(r.total_departure_collected || 0);

        return {
            departure_id: r.departure_id,
            departure_code: r.departure_code,
            tour_code: r.tour_code,
            tour_name: r.tour_name,
            bu_group: r.bu_group,
            start_date: r.start_date,
            days_until_departure: r.days_until_departure,
            total_seats: totalSeats,
            total_booked_pax: bookedPax,
            paid_deposit_pax: paidPax,
            available_seats: Math.max(totalSeats - bookedPax, 0),
            occupancy_rate_percent: occupancyRate,
            deposit_rate_percent: depositRate,
            departure_projected_revenue_vnd: rev,
            departure_collected_cash_vnd: collected,
            departure_remaining_debt_vnd: Math.max(0, rev - collected),
            status: occupancyRate >= 100 ? 'FULL' : (occupancyRate >= 70 ? 'GOOD' : 'OPEN')
        };
    });

    return sanitizeObject({
        success: true,
        tool: 'get_departures_occupancy',
        data: {
            days_ahead: daysAhead,
            total_upcoming_departures: departures.length,
            departures
        },
        metadata: {
            scope_applied: aiUser.scope,
            user_allowed_bus: aiUser.allowedBUs,
            scope_notice: scopeNotice,
            timezone: 'Asia/Ho_Chi_Minh',
            business_rule: 'Booked pax bao gồm toàn bộ khách đã giữ chỗ; Paid pax là khách đã có phát sinh cọc tiền thật.',
            generated_at: new Date().toISOString()
        }
    });
}

// -------------------------------------------------------------
// TOOL 3: getDepartureCashflow (Nguồn đối soát: departureCashflowController.js)
// -------------------------------------------------------------
async function getDepartureCashflow(aiUser, filters = {}) {
    const year = parseInt(filters.year) || new Date().getFullYear();
    const month = filters.month && filters.month !== 'all' ? parseInt(filters.month) : null;

    let params = [year];
    let pIdx = 2;
    let monthCond = '';
    if (month) {
        params.push(month);
        monthCond = ` AND EXTRACT(MONTH FROM td.start_date) = $${pIdx++}`;
    }

    let buCondition = '';
    let scopeNotice = null;

    if (aiUser.scope !== 'all') {
        const allowed = Array.isArray(aiUser.allowedBUs) ? aiUser.allowedBUs : [];
        if (allowed.length === 0) {
            buCondition = ' AND 1=0';
            scopeNotice = 'Tài khoản chưa được gán vào Business Unit nào.';
        } else {
            params.push(allowed);
            buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = ANY($${pIdx++})`;
        }
    } else if (filters.bu_group && filters.bu_group !== 'all') {
        params.push(filters.bu_group);
        buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = $${pIdx++}`;
    }

    const query = `
        SELECT 
            EXTRACT(MONTH FROM td.start_date)::INTEGER as month,
            COALESCE(SUM(b.total_price), 0)::NUMERIC as total_projected,
            COALESCE(SUM(b.paid), 0)::NUMERIC as total_collected,
            COALESCE(SUM(b.total_price - COALESCE(b.paid, 0)), 0)::NUMERIC as total_debt,
            COALESCE(SUM(b.paid) FILTER (WHERE b.paid >= b.total_price AND b.total_price > 0), 0)::NUMERIC as fully_paid_cash,
            COALESCE(SUM(b.paid) FILTER (WHERE b.paid > 0 AND b.paid < b.total_price), 0)::NUMERIC as partial_paid_cash,
            COALESCE(SUM(b.total_price - COALESCE(b.paid, 0)) FILTER (WHERE b.paid > 0 AND b.paid < b.total_price), 0)::NUMERIC as partial_remaining_debt,
            COALESCE(SUM(b.total_price) FILTER (WHERE COALESCE(b.paid, 0) = 0), 0)::NUMERIC as zero_deposit_debt,
            COUNT(DISTINCT td.id)::INTEGER as departure_count,
            COUNT(DISTINCT b.id)::INTEGER as booking_count
        FROM tour_departures td
        LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
        LEFT JOIN bookings b ON b.tour_departure_id = td.id 
            AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
        WHERE COALESCE(td.is_deleted, false) = false
          AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND EXTRACT(YEAR FROM td.start_date) = $1
          ${monthCond}
          ${buCondition}
        GROUP BY EXTRACT(MONTH FROM td.start_date)
        ORDER BY month ASC;
    `;

    const res = await db.query(query, params);

    let totalProj = 0;
    let totalColl = 0;
    let totalDbt = 0;
    let fullyPaidCash = 0;
    let partialPaidCash = 0;
    let partialRemDebt = 0;
    let zeroDepositDebt = 0;

    const monthlyStats = res.rows.map(r => {
        const proj = Number(r.total_projected || 0);
        const coll = Number(r.total_collected || 0);
        const dbt = Number(r.total_debt || 0);
        totalProj += proj;
        totalColl += coll;
        totalDbt += dbt;
        fullyPaidCash += Number(r.fully_paid_cash || 0);
        partialPaidCash += Number(r.partial_paid_cash || 0);
        partialRemDebt += Number(r.partial_remaining_debt || 0);
        zeroDepositDebt += Number(r.zero_deposit_debt || 0);

        return {
            month: r.month,
            projected_revenue_vnd: proj,
            collected_cash_vnd: coll,
            remaining_debt_vnd: dbt,
            recovery_rate_percent: proj > 0 ? Number(((coll / proj) * 100).toFixed(1)) : 0,
            tier1_fully_paid_cash_vnd: Number(r.fully_paid_cash || 0),
            tier2_partial_collected_vnd: Number(r.partial_paid_cash || 0),
            tier2_partial_remaining_debt_vnd: Number(r.partial_remaining_debt || 0),
            tier3_zero_deposit_debt_vnd: Number(r.zero_deposit_debt || 0),
            departure_count: r.departure_count,
            booking_count: r.booking_count
        };
    });

    return sanitizeObject({
        success: true,
        tool: 'get_departure_cashflow',
        data: {
            year,
            selected_month: month || 'all',
            summary: {
                total_projected_revenue_vnd: totalProj,
                total_collected_cash_vnd: totalColl,
                total_uncollected_debt_vnd: totalDbt,
                overall_recovery_rate_percent: totalProj > 0 ? Number(((totalColl / totalProj) * 100).toFixed(1)) : 0,
                debt_stages_breakdown: {
                    tier1_fully_paid_100pct_vnd: fullyPaidCash,
                    tier2_partial_collected_vnd: partialPaidCash,
                    tier2_partial_remaining_debt_vnd: partialRemDebt,
                    tier3_zero_deposit_overdue_debt_vnd: zeroDepositDebt
                }
            },
            monthly_breakdown: monthlyStats
        },
        metadata: {
            scope_applied: aiUser.scope,
            user_allowed_bus: aiUser.allowedBUs,
            scope_notice: scopeNotice,
            currency: 'VND',
            timezone: 'Asia/Ho_Chi_Minh',
            reconciliation_source: 'server/controllers/departureCashflowController.js (Departure Cashflow Hub)',
            business_rule: 'Tuân thủ chuẩn Phân Tầng Công Nợ Booking (Debt Collection Stages): Tier 1 (100%), Tier 2 (Cọc dở dang), Tier 3 (Nợ 100% chưa cọc).',
            generated_at: new Date().toISOString()
        }
    });
}

// -------------------------------------------------------------
// TOOL 4: getDebtD7Alerts (Nguồn đối soát: debtD7AlertEngine.js)
// -------------------------------------------------------------
async function getDebtD7Alerts(aiUser, filters = {}) {
    const limit = Math.min(Math.max(parseInt(filters.limit) || 20, 1), 50);
    const params = [limit];
    let pIdx = 2;

    let buCondition = '';
    let scopeNotice = null;

    if (aiUser.scope !== 'all') {
        const allowed = Array.isArray(aiUser.allowedBUs) ? aiUser.allowedBUs : [];
        if (allowed.length === 0) {
            buCondition = ' AND 1=0';
            scopeNotice = 'Tài khoản chưa được gán vào Business Unit nào.';
        } else {
            params.push(allowed);
            buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = ANY($${pIdx++})`;
        }
    } else if (filters.bu_group && filters.bu_group !== 'all') {
        params.push(filters.bu_group);
        buCondition = ` AND COALESCE(tt.bu_group, 'Chưa phân loại') = $${pIdx++}`;
    }

    const query = `
        SELECT 
            b.id as booking_id,
            b.booking_code,
            COALESCE(c.name, b.new_customer_info->>'name', 'Khách lẻ') as customer_name,
            COALESCE(c.phone, b.new_customer_info->>'phone', '') as customer_phone,
            COALESCE(tt.bu_group, 'Chưa phân loại') as bu_group,
            td.code as tour_code,
            COALESCE(tt.name, td.market, 'Tour du lịch') as tour_name,
            td.id as departure_id,
            td.start_date as departure_date,
            (DATE(td.start_date AT TIME ZONE 'Asia/Ho_Chi_Minh') - CURRENT_DATE)::INTEGER as days_until_departure,
            b.total_price::NUMERIC as total_price,
            COALESCE(b.paid, 0)::NUMERIC as paid_amount,
            (b.total_price - COALESCE(b.paid, 0))::NUMERIC as remaining_debt,
            COALESCE(u.full_name, 'Chưa gán') as assigned_sale
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
          ${buCondition}
        ORDER BY td.start_date ASC, remaining_debt DESC
        LIMIT $1;
    `;

    const res = await db.query(query, params);

    const alerts = res.rows.map(r => ({
        booking_id: r.booking_id,
        booking_code: r.booking_code,
        customer_name: r.customer_name,
        customer_phone: r.customer_phone,
        bu_group: r.bu_group,
        tour_code: r.tour_code,
        tour_name: r.tour_name,
        departure_date: r.departure_date,
        days_until_departure: r.days_until_departure,
        urgency: r.days_until_departure <= 2 ? 'CRITICAL_D2' : (r.days_until_departure <= 4 ? 'URGENT_D4' : 'WATCHLIST_D7'),
        total_price_vnd: Number(r.total_price),
        paid_amount_vnd: Number(r.paid_amount),
        remaining_debt_vnd: Number(r.remaining_debt),
        assigned_sale: r.assigned_sale,
        action_link: `/op-tours?open_departure_id=${r.departure_id}&highlight_booking_id=${r.booking_id}`
    }));

    return sanitizeObject({
        success: true,
        tool: 'get_debt_d7_alerts',
        data: {
            total_debt_alerts: alerts.length,
            alerts
        },
        metadata: {
            scope_applied: aiUser.scope,
            user_allowed_bus: aiUser.allowedBUs,
            scope_notice: scopeNotice,
            currency: 'VND',
            timezone: 'Asia/Ho_Chi_Minh',
            reconciliation_source: 'server/cron/debtD7AlertEngine.js',
            business_rule: 'Lọc các booking có số dư nợ >= 1.000 VND và ngày bay trong vòng 7 ngày tới (D-Day).',
            pii_protection: 'Số điện thoại khách hàng đã được che mờ (masking) theo chính sách an toàn thông tin.',
            generated_at: new Date().toISOString()
        }
    });
}

// -------------------------------------------------------------
// TOOL 5: getMarketingEfficiency (Nguồn đối soát: marketing_ads_reports)
// -------------------------------------------------------------
async function getMarketingEfficiency(aiUser, filters = {}) {
    const year = parseInt(filters.year) || new Date().getFullYear();
    const month = filters.month && filters.month !== 'all' ? parseInt(filters.month) : null;

    let params = [year];
    let pIdx = 2;
    let monthCond = '';
    if (month) {
        params.push(month);
        monthCond = ` AND month = $${pIdx++}`;
    }

    let buCondition = '';
    let scopeNotice = null;

    if (aiUser.scope !== 'all') {
        const allowed = Array.isArray(aiUser.allowedBUs) ? aiUser.allowedBUs : [];
        if (allowed.length === 0) {
            buCondition = ' AND 1=0';
            scopeNotice = 'Tài khoản chưa được gán vào Business Unit nào.';
        } else {
            params.push(allowed);
            buCondition = ` AND bu_name = ANY($${pIdx++})`;
        }
    } else if (filters.bu_group && filters.bu_group !== 'all') {
        params.push(filters.bu_group);
        buCondition = ` AND bu_name = $${pIdx++}`;
    }

    const adsQuery = `
        SELECT 
            COALESCE(bu_name, 'Chưa gán BU') as bu_group,
            COALESCE(SUM(spend), 0)::NUMERIC as total_spend,
            COALESCE(SUM(COALESCE(leads, messages, 0)), 0)::INTEGER as total_leads,
            COUNT(id)::INTEGER as total_campaigns
        FROM marketing_ads_reports
        WHERE year = $1
          ${monthCond}
          ${buCondition}
        GROUP BY bu_name
        ORDER BY total_spend DESC;
    `;

    const res = await db.query(adsQuery, params);

    let totalSpend = 0;
    let totalLeads = 0;

    const buStats = res.rows.map(r => {
        const spend = Number(r.total_spend || 0);
        const leads = Number(r.total_leads || 0);
        totalSpend += spend;
        totalLeads += leads;
        const cpl = leads > 0 ? Math.round(spend / leads) : 0;
        return {
            bu_group: r.bu_group,
            spend_vnd: spend,
            leads_count: leads,
            cpl_vnd: cpl,
            total_campaigns: r.total_campaigns
        };
    });

    const overallCPL = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;

    return sanitizeObject({
        success: true,
        tool: 'get_marketing_efficiency',
        data: {
            year,
            month: month || 'all',
            summary: {
                total_spend_vnd: totalSpend,
                total_leads_count: totalLeads,
                overall_cpl_vnd: overallCPL
            },
            breakdown_by_bu: buStats
        },
        metadata: {
            scope_applied: aiUser.scope,
            user_allowed_bus: aiUser.allowedBUs,
            scope_notice: scopeNotice,
            currency: 'VND',
            timezone: 'Asia/Ho_Chi_Minh',
            reconciliation_source: 'server/routes/marketingAds.js (marketing_ads_reports)',
            business_rule: 'Tổng hợp chi tiêu ads và leads từ bảng marketing_ads_reports chuẩn hóa theo từng BU.',
            generated_at: new Date().toISOString()
        }
    });
}

module.exports = {
    getExecutiveKPI,
    getDeparturesOccupancy,
    getDepartureCashflow,
    getDebtD7Alerts,
    getMarketingEfficiency
};
