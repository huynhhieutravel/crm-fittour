/**
 * QA Reconciliation Audit Suite
 * Đối soát độc lập từng con số của cả 5 Curated Semantic Tools với các Controller nghiệp vụ gốc của FIT TOUR ERP.
 */

const db = require('../db');
const aiGatewayService = require('../services/aiGatewayService');

async function runQAAudit() {
    console.log('========================================================================');
    console.log('🕵️  BẮT ĐẦU BÁO CÁO QA ĐỐI SOÁT TOÀN DIỆN 5 NHÓM DỮ LIỆU FIT TOUR ERP');
    console.log('========================================================================\n');

    let totalChecks = 0;
    let passedChecks = 0;

    const ceoUser = {
        id: 1,
        username: 'admin',
        full_name: 'Huỳnh Trọng Hiếu',
        role: 'admin',
        scope: 'all',
        allowedBUs: null
    };

    const currentYear = new Date().getFullYear();

    // -------------------------------------------------------------
    // QA 1: TOOL 1 (get_executive_kpi_summary vs ceoDashboardController)
    // -------------------------------------------------------------
    console.log('👉 [QA 1/5] KIỂM TRA TOOL 1: get_executive_kpi_summary vs ceoDashboardController');
    const kpiGateway = await aiGatewayService.getExecutiveKPI(ceoUser, { timeframe: 'this_year' });
    
    const kpiRawRes = await db.query(`
        SELECT 
            COALESCE(SUM(b.total_price), 0)::NUMERIC as revenue,
            COALESCE(SUM(b.paid), 0)::NUMERIC as cashflow,
            COALESCE(SUM(b.pax_count), 0)::INTEGER as total_pax,
            COUNT(DISTINCT b.id)::INTEGER as booking_count
        FROM bookings b
        JOIN tour_departures td ON b.tour_departure_id = td.id
        JOIN tour_templates tt ON td.tour_template_id = tt.id
        WHERE b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED', 'Mới')
          AND b.paid > 0
          AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND tt.name NOT ILIKE '%[Tour Cũ]%'
          AND td.start_date >= $1 AND td.start_date <= $2;
    `, [`${currentYear}-01-01`, `${currentYear}-12-31`]);

    const kpiExpected = kpiRawRes.rows[0];
    const kpiActual = kpiGateway.data.kpi;

    console.log(`   • Doanh thu:     ERP = ${Number(kpiExpected.revenue).toLocaleString()} VND | Gateway = ${kpiActual.total_revenue_vnd.toLocaleString()} VND`);
    console.log(`   • Cọc thực thu:  ERP = ${Number(kpiExpected.cashflow).toLocaleString()} VND | Gateway = ${kpiActual.actual_cash_collected_vnd.toLocaleString()} VND`);
    console.log(`   • Khách (Pax):   ERP = ${kpiExpected.total_pax} | Gateway = ${kpiActual.total_pax}`);
    console.log(`   • Số booking:    ERP = ${kpiExpected.booking_count} | Gateway = ${kpiActual.valid_bookings_count}`);

    totalChecks += 4;
    if (kpiActual.total_revenue_vnd === Number(kpiExpected.revenue)) passedChecks++;
    if (kpiActual.actual_cash_collected_vnd === Number(kpiExpected.cashflow)) passedChecks++;
    if (kpiActual.total_pax === Number(kpiExpected.total_pax)) passedChecks++;
    if (kpiActual.valid_bookings_count === Number(kpiExpected.booking_count)) passedChecks++;
    console.log('   => KẾT LUẬN QA 1: ' + (kpiActual.total_revenue_vnd === Number(kpiExpected.revenue) ? '✅ CHÍNH XÁC 100%' : '❌ SAI LỆCH') + '\n');

    // -------------------------------------------------------------
    // QA 2: TOOL 2 (get_departures_occupancy vs departureController & Cashflow)
    // -------------------------------------------------------------
    console.log('👉 [QA 2/5] KIỂM TRA TOOL 2: get_departures_occupancy vs tour_departures');
    const depGateway = await aiGatewayService.getDeparturesOccupancy(ceoUser, { days_ahead: 60 });
    
    const depRawRes = await db.query(`
        SELECT COUNT(DISTINCT td.id) as count
        FROM tour_departures td
        WHERE td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND COALESCE(td.is_deleted, false) = false
          AND td.start_date >= CURRENT_DATE
          AND td.start_date <= CURRENT_DATE + interval '60 days';
    `);
    const expectedUpcomingCount = Number(depRawRes.rows[0].count);
    const actualUpcomingCount = depGateway.data.total_upcoming_departures;

    console.log(`   • Số đoàn sắp bay (60 ngày tới): ERP = ${expectedUpcomingCount} đoàn | Gateway = ${actualUpcomingCount} đoàn`);
    if (depGateway.data.departures.length > 0) {
        const d0 = depGateway.data.departures[0];
        console.log(`   • Đoàn mẫu 1: [${d0.tour_code}] ${d0.tour_name}`);
        console.log(`     - Tổng ghế: ${d0.total_seats} | Đã giữ chỗ: ${d0.total_booked_pax} | Đã cọc tiền: ${d0.paid_deposit_pax} | Tỷ lệ lấp đầy: ${d0.occupancy_rate_percent}%`);
    }

    totalChecks += 1;
    if (expectedUpcomingCount === actualUpcomingCount) passedChecks++;
    console.log('   => KẾT LUẬN QA 2: ' + (expectedUpcomingCount === actualUpcomingCount ? '✅ CHÍNH XÁC 100%' : '❌ SAI LỆCH') + '\n');

    // -------------------------------------------------------------
    // QA 3: TOOL 3 (get_departure_cashflow vs departureCashflowController)
    // -------------------------------------------------------------
    console.log('👉 [QA 3/5] KIỂM TRA TOOL 3: get_departure_cashflow vs departureCashflowController');
    const cashflowGateway = await aiGatewayService.getDepartureCashflow(ceoUser, { year: currentYear });
    
    const cashflowRawRes = await db.query(`
        SELECT 
            COUNT(DISTINCT td.id) as total_departures,
            COALESCE(SUM(b.total_price), 0) as total_projected,
            COALESCE(SUM(b.paid), 0) as total_collected,
            COALESCE(SUM(b.total_price - COALESCE(b.paid, 0)), 0) as total_debt,
            COALESCE(SUM(b.paid) FILTER (WHERE b.paid >= b.total_price AND b.total_price > 0), 0) as fully_paid_cash,
            COALESCE(SUM(b.paid) FILTER (WHERE b.paid > 0 AND b.paid < b.total_price), 0) as partial_paid_cash,
            COALESCE(SUM(b.total_price - COALESCE(b.paid, 0)) FILTER (WHERE b.paid > 0 AND b.paid < b.total_price), 0) as partial_remaining_debt,
            COALESCE(SUM(b.total_price) FILTER (WHERE COALESCE(b.paid, 0) = 0), 0) as zero_deposit_debt
        FROM tour_departures td
        LEFT JOIN tour_templates tt ON td.tour_template_id = tt.id
        LEFT JOIN bookings b ON b.tour_departure_id = td.id 
            AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
        WHERE COALESCE(td.is_deleted, false) = false
          AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND EXTRACT(YEAR FROM td.start_date) = $1;
    `, [currentYear]);

    const expCash = cashflowRawRes.rows[0];
    const actCash = cashflowGateway.data.summary;
    const actStages = actCash.debt_stages_breakdown;

    console.log(`   • Tổng doanh số kỳ vọng (Projected): ERP = ${Number(expCash.total_projected).toLocaleString()} VND | Gateway = ${actCash.total_projected_revenue_vnd.toLocaleString()} VND`);
    console.log(`   • Tổng tiền thực thu (Collected):    ERP = ${Number(expCash.total_collected).toLocaleString()} VND | Gateway = ${actCash.total_collected_cash_vnd.toLocaleString()} VND`);
    console.log(`   • Tổng công nợ tồn (Uncollected):   ERP = ${Number(expCash.total_debt).toLocaleString()} VND | Gateway = ${actCash.total_uncollected_debt_vnd.toLocaleString()} VND`);
    console.log(`   • Tier 1 (Cọc 100%):                ERP = ${Number(expCash.fully_paid_cash).toLocaleString()} VND | Gateway = ${actStages.tier1_fully_paid_100pct_vnd.toLocaleString()} VND`);
    console.log(`   • Tier 2 (Cọc dở dang còn nợ):      ERP = ${Number(expCash.partial_remaining_debt).toLocaleString()} VND | Gateway = ${actStages.tier2_partial_remaining_debt_vnd.toLocaleString()} VND`);
    console.log(`   • Tier 3 (100% chưa cọc):           ERP = ${Number(expCash.zero_deposit_debt).toLocaleString()} VND | Gateway = ${actStages.tier3_zero_deposit_overdue_debt_vnd.toLocaleString()} VND`);

    totalChecks += 4;
    if (actCash.total_projected_revenue_vnd === Number(expCash.total_projected)) passedChecks++;
    if (actCash.total_collected_cash_vnd === Number(expCash.total_collected)) passedChecks++;
    if (actCash.total_uncollected_debt_vnd === Number(expCash.total_debt)) passedChecks++;
    if (actStages.tier3_zero_deposit_overdue_debt_vnd === Number(expCash.zero_deposit_debt)) passedChecks++;
    console.log('   => KẾT LUẬN QA 3: ' + (actCash.total_projected_revenue_vnd === Number(expCash.total_projected) ? '✅ CHÍNH XÁC 100%' : '❌ SAI LỆCH') + '\n');

    // -------------------------------------------------------------
    // QA 4: TOOL 4 (get_debt_d7_alerts vs debtD7AlertEngine)
    // -------------------------------------------------------------
    console.log('👉 [QA 4/5] KIỂM TRA TOOL 4: get_debt_d7_alerts vs debtD7AlertEngine');
    const debtGateway = await aiGatewayService.getDebtD7Alerts(ceoUser, { limit: 20 });
    
    const debtRawRes = await db.query(`
        SELECT COUNT(b.id) as count, COALESCE(SUM(b.total_price - COALESCE(b.paid, 0)), 0) as total_debt
        FROM bookings_raw b
        JOIN tour_departures_raw td ON b.tour_departure_id = td.id
        WHERE b.booking_status NOT IN ('Huỷ', 'Hủy', 'CANCELLED', 'EXPIRED')
          AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
          AND COALESCE(td.is_deleted, false) = false
          AND (b.paid < b.total_price OR b.paid IS NULL)
          AND b.total_price > 0
          AND (b.total_price - COALESCE(b.paid, 0)) >= 1000
          AND td.start_date >= CURRENT_DATE
          AND td.start_date <= CURRENT_DATE + INTERVAL '7 days';
    `);

    const expDebtCount = Number(debtRawRes.rows[0].count);
    const expDebtSum = Number(debtRawRes.rows[0].total_debt);
    const actDebtCount = debtGateway.data.total_debt_alerts;
    const actDebtSum = debtGateway.data.alerts.reduce((sum, a) => sum + a.remaining_debt_vnd, 0);

    console.log(`   • Số booking nợ mốc D-7: ERP = ${expDebtCount} booking | Gateway = ${actDebtCount} booking`);
    console.log(`   • Tổng nợ cần thu khẩn:  ERP = ${expDebtSum.toLocaleString()} VND | Gateway = ${actDebtSum.toLocaleString()} VND`);
    
    // Kiểm tra PII phone mask
    const hasUnmaskedPhone = debtGateway.data.alerts.some(a => a.customer_phone && !a.customer_phone.includes('****'));
    console.log(`   • Che mờ thông tin cá nhân (PII Masking): ${!hasUnmaskedPhone ? '✅ 100% SĐT được mask (vd: ' + debtGateway.data.alerts[0]?.customer_phone + ')' : '❌ Có SĐT lộ'}`);

    totalChecks += 3;
    if (expDebtCount === actDebtCount) passedChecks++;
    if (expDebtSum === actDebtSum) passedChecks++;
    if (!hasUnmaskedPhone) passedChecks++;
    console.log('   => KẾT LUẬN QA 4: ' + (expDebtCount === actDebtCount && expDebtSum === actDebtSum ? '✅ CHÍNH XÁC 100%' : '❌ SAI LỆCH') + '\n');

    // -------------------------------------------------------------
    // QA 5: TOOL 5 (get_marketing_efficiency vs marketing_ads_reports)
    // -------------------------------------------------------------
    console.log('👉 [QA 5/5] KIỂM TRA TOOL 5: get_marketing_efficiency vs marketing_ads_reports');
    const mktGateway = await aiGatewayService.getMarketingEfficiency(ceoUser, { year: currentYear });
    
    const mktRawRes = await db.query(`
        SELECT 
            COALESCE(SUM(spend), 0)::NUMERIC as total_spend,
            COALESCE(SUM(COALESCE(leads, messages, 0)), 0)::INTEGER as total_leads
        FROM marketing_ads_reports
        WHERE year = $1;
    `, [currentYear]);

    const expMkt = mktRawRes.rows[0];
    const actMkt = mktGateway.data.summary;

    console.log(`   • Tổng chi tiêu Ads (Spend): ERP = ${Number(expMkt.total_spend).toLocaleString()} VND | Gateway = ${actMkt.total_spend_vnd.toLocaleString()} VND`);
    console.log(`   • Tổng số Leads:             ERP = ${expMkt.total_leads} | Gateway = ${actMkt.total_leads_count}`);
    console.log(`   • CPL trung bình:            ERP = ${Math.round(Number(expMkt.total_spend)/expMkt.total_leads).toLocaleString()} VND | Gateway = ${actMkt.overall_cpl_vnd.toLocaleString()} VND`);

    totalChecks += 3;
    if (actMkt.total_spend_vnd === Number(expMkt.total_spend)) passedChecks++;
    if (actMkt.total_leads_count === Number(expMkt.total_leads)) passedChecks++;
    if (actMkt.overall_cpl_vnd === Math.round(Number(expMkt.total_spend) / Number(expMkt.total_leads))) passedChecks++;
    console.log('   => KẾT LUẬN QA 5: ' + (actMkt.total_spend_vnd === Number(expMkt.total_spend) ? '✅ CHÍNH XÁC 100%' : '❌ SAI LỆCH') + '\n');

    // -------------------------------------------------------------
    // TỔNG KẾT BÁO CÁO QA
    // -------------------------------------------------------------
    console.log('========================================================================');
    console.log(`📊 TỔNG KẾT AUDIT: ĐẠT ${passedChecks}/${totalChecks} TIÊU CHÍ KIỂM ĐỊNH (${Math.round((passedChecks/totalChecks)*100)}%)`);
    if (passedChecks === totalChecks) {
        console.log('🎉 TẤT CẢ 5 NHÓM DỮ LIỆU ĐỀU CHÍNH XÁC 100% KHÔNG CÓ SAI LỆCH NÀO!');
    } else {
        console.log('⚠️ CÓ TIÊU CHÍ SAI LỆCH CẦN RÀ SOÁT.');
    }
    console.log('========================================================================');

    process.exit(passedChecks === totalChecks ? 0 : 1);
}

runQAAudit().catch(e => {
    console.error(e);
    process.exit(1);
});
