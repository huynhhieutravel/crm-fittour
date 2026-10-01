const cron = require('node-cron');
const db = require('../db');
const { emitEvent } = require('../utils/eventBus');

// Run on the 1st of every month at 08:00
cron.schedule('0 8 1 * *', async () => {
  console.log('[Cron] Running Monthly Dashboard Stats...');
  try {
    await sendMonthlyDashboardStats();
  } catch (error) {
    console.error('[Cron] Error generating Monthly Dashboard Stats:', error);
  }
});

async function getDashboardStats(monthNum, yearNum) {
  const params = [yearNum, monthNum];
  
  // 1. Top metrics (Doanh số Sales và Thực thu) -> Tính theo created_at
  const bookingRes = await db.query(
    `SELECT COALESCE(SUM(total_price), 0) as booking_value,
            COALESCE(SUM(pax_count), 0) as total_pax_booked
     FROM bookings 
     WHERE booking_status NOT IN ('Huỷ', 'Hủy', 'Mới', 'CANCELLED', 'EXPIRED') 
     AND paid > 0
     AND EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2`,
    params
  );
  const total_revenue = parseFloat(bookingRes.rows[0].booking_value);

  const voucherRes = await db.query(
    `SELECT COALESCE(SUM(amount), 0) as actual_revenue 
     FROM payment_vouchers 
     WHERE status = 'Đã duyệt' 
     AND EXTRACT(YEAR FROM created_at) = $1 AND EXTRACT(MONTH FROM created_at) = $2`,
    params
  );
  const total_collected = parseFloat(voucherRes.rows[0].actual_revenue);

  // 2. Đoàn & Khách & Lấp đầy theo BU -> Tính theo tour start_date
  const toursRes = await db.query(
    `SELECT 
        CASE
          WHEN tt.bu_group IS NOT NULL AND tt.bu_group != '' THEN 
            CASE 
              WHEN tt.bu_group ~ '^[0-9]+$' THEN 'BU' || tt.bu_group 
              ELSE UPPER(TRIM(tt.bu_group))
            END
          WHEN tt.name ILIKE '%Mông Cổ%' OR tt.name ILIKE '%Mongolia%' 
            OR tt.name ILIKE '%Ai Cập%' OR tt.name ILIKE '%Maroc%' OR tt.name ILIKE '%Ma Rốc%' 
            OR tt.name ILIKE '%Pakistan%' OR tt.name ILIKE '%Thổ Nhĩ Kỳ%' OR tt.name ILIKE '%Nam Mỹ%' 
            OR tt.name ILIKE '%Tây Á%' OR tt.name ILIKE '%Alaska%' OR tt.name ILIKE '%Trung Á%' 
            OR tt.destination IN ('Ai Cập', 'Maroc', 'Nam Mỹ', 'Mông Cổ', 'Châu Mỹ', 'Tây Á / Trung Đông')
            THEN 'BU5'
          WHEN tt.name ILIKE '%Nhật Bản%' OR tt.name ILIKE '%Japan%' OR tt.name ILIKE '%Hàn Quốc%' OR tt.name ILIKE '%Đài Loan%' 
            OR tt.destination = 'Nhật Bản'
            THEN 'BU2'
          WHEN tt.name ILIKE '%Bhutan%' OR tt.name ILIKE '%Ladakh%' OR tt.name ILIKE '%Bromo%' OR tt.name ILIKE '%Tây Tạng%' OR tt.name ILIKE '%Nepal%' OR tt.name ILIKE '%Sri Lanka%'
            OR tt.destination IN ('Bhutan', 'Ladakh', 'Indonesia', 'Tây Tạng')
            THEN 'BU4'
          WHEN tt.name ILIKE '%Châu Âu%' OR tt.name ILIKE '%Pháp%' OR tt.name ILIKE '%Úc%' OR tt.destination = 'Châu Âu'
            THEN 'BU2'
          ELSE 'BU1'
        END as bu_group,
        td.id as departure_id,
        COALESCE(
          NULLIF(td.actual_price, 0),
          NULLIF(td.price_adult, 0),
          NULLIF((td.tour_info->>'price_adult')::numeric, 0),
          NULLIF(tt.price, 0),
          (SELECT ROUND(AVG(NULLIF(total_price/NULLIF(pax_count,0), 0))) FROM bookings WHERE tour_departure_id = td.id),
          0
        ) as actual_price,
        tt.name as tour_name,
        COALESCE(
          NULLIF(td.max_participants, 0),
          NULLIF((td.tour_info->>'total_seats')::integer, 0),
          15
        ) as max_pax,
        (SELECT COALESCE(SUM(pax_count), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Hủy', 'Mới', 'CANCELLED', 'EXPIRED') AND paid > 0) as sold_pax,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Hủy', 'Mới', 'CANCELLED', 'EXPIRED') AND paid > 0) as revenue
     FROM tour_departures td
     JOIN tour_templates tt ON td.tour_template_id = tt.id
     WHERE EXTRACT(YEAR FROM td.start_date) = $1 AND EXTRACT(MONTH FROM td.start_date) = $2
     AND td.status NOT IN ('Huỷ', 'Hủy', 'CANCELLED')
     ORDER BY td.start_date ASC`,
    params
  );

  // Danh mục tour cơ bản của từng BU (dùng khi BU chưa có lịch khởi hành trong tháng)
  const defaultToursByBU = {
    BU1: ['Tour Tân Cương 9N8Đ', 'Tour Bắc Kinh 5N4Đ', 'Tour Giang Nam 5N', 'Tour Đạo Thành Á Đinh 8N7Đ'],
    BU2: ['Tour Nhật Bản mùa xuân 6N5Đ', 'Tour Nhật Bản Mùa Hoa Anh Đào 6N5Đ', 'Tour Đài Loan 5N4Đ'],
    BU4: ['Tour núi lửa Bromo 6N5Đ', 'Tour du lịch Ladakh 8N7Đ', 'Tour Bhutan 5N4Đ'],
    BU5: ['Tour Mông Cổ 8N7Đ', 'Roadtrip Mông Cổ 12N9Đ', 'Tour Nam Mỹ 14N13Đ', 'Tour Pakistan 10N9Đ']
  };

  const BU_COLORS = {
    BU1: { badgeBg: '#fef2f2', badgeColor: '#b91c1c', badgeBorder: '#fecaca' },
    BU2: { badgeBg: '#eff6ff', badgeColor: '#1d4ed8', badgeBorder: '#bfdbfe' },
    BU4: { badgeBg: '#fffbeb', badgeColor: '#b45309', badgeBorder: '#fde68a' },
    BU5: { badgeBg: '#faf5ff', badgeColor: '#7e22ce', badgeBorder: '#e9d5ff' }
  };

  // Khởi tạo 4 BU bán tour định kỳ (BU1, BU2, BU4, BU5 - loại trừ BU3 MICE)
  const buData = {};
  ['BU1', 'BU2', 'BU4', 'BU5'].forEach(code => {
    buData[code] = {
      bu_code: code,
      badgeBg: BU_COLORS[code].badgeBg,
      badgeColor: BU_COLORS[code].badgeColor,
      badgeBorder: BU_COLORS[code].badgeBorder,
      total_pax: 0,
      sold_pax: 0,
      tour_count: 0,
      revenue: 0,
      planned_revenue: 0,
      departing_tours: {}, // cleanTourName -> count
      default_tours: defaultToursByBU[code] || []
    };
  });

  let totalTourMaxPax = 0;
  let totalTourSoldPax = 0;
  let totalDepartures = 0;

  toursRes.rows.forEach(t => {
    let bu = t.bu_group || 'Khác';
    if (!bu.startsWith('BU') && bu !== 'Khác') {
      bu = 'BU' + bu;
    }

    // Bỏ BU3 theo yêu cầu người dùng (MICE / Đoàn riêng không có mở chỗ định kỳ)
    if (bu === 'BU3') {
      return;
    }

    const maxPax = parseInt(t.max_pax) || 0;
    const soldPax = parseInt(t.sold_pax) || 0;
    const rev = parseFloat(t.revenue) || 0;
    const price = parseFloat(t.actual_price) || 0;

    totalDepartures += 1;
    totalTourMaxPax += maxPax;
    totalTourSoldPax += soldPax;

    if (!buData[bu]) {
      buData[bu] = {
        bu_code: bu,
        badgeBg: '#f8fafc',
        badgeColor: '#475569',
        badgeBorder: '#e2e8f0',
        total_pax: 0,
        sold_pax: 0,
        tour_count: 0,
        revenue: 0,
        planned_revenue: 0,
        departing_tours: {},
        default_tours: []
      };
    }

    buData[bu].total_pax += maxPax;
    buData[bu].sold_pax += soldPax;
    buData[bu].tour_count += 1;
    buData[bu].revenue += rev;
    buData[bu].planned_revenue += maxPax * price;

    // Chuẩn hoá tên tour ngắn gọn, súc tích
    let cleanName = (t.tour_name || 'Tour')
      .replace(/ – /g, ' - ')
      .replace(/\s*-\s*No Shopping/gi, '')
      .replace(/\s*-\s*Bay thẳng/gi, '')
      .replace(/\s*-\s*Road\s*trip/gi, '')
      .replace(/\s*-\s*KS 4-5 sao/gi, '')
      .replace(/\s*-\s*KS 4 sao/gi, '')
      .replace(/trọn gói/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!buData[bu].departing_tours[cleanName]) {
      buData[bu].departing_tours[cleanName] = 0;
    }
    buData[bu].departing_tours[cleanName] += 1;
  });

  // 3. Top 10 Sales của tháng -> Tính theo created_at
  const salesRes = await db.query(`
    SELECT 
        COALESCE(u.full_name, b.created_by_name, 'Chưa gán') as sale_name,
        COUNT(b.id) as bookings_count,
        SUM(b.pax_count) as total_pax,
        SUM(b.total_price) as revenue,
        SUM(b.paid) as collected_revenue
    FROM bookings b
    LEFT JOIN users u ON b.created_by = u.id
    WHERE EXTRACT(YEAR FROM b.created_at) = $1 AND EXTRACT(MONTH FROM b.created_at) = $2
    AND b.booking_status NOT IN ('Huỷ', 'Hủy', 'Mới', 'CANCELLED', 'EXPIRED')
    AND b.paid > 0
    GROUP BY sale_name
    ORDER BY revenue DESC
    LIMIT 10
  `, params);

  return {
    totalDepartures,
    totalTourMaxPax,
    totalTourSoldPax,
    total_revenue,
    total_collected,
    buData,
    topSales: salesRes.rows
  };
}

function generateDashboardEmailHtml({ reportMonth, yearNum, prevMonthNum, currentStats, prevStats }) {
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };
  
  const renderGrowth = (growth) => {
    if (growth > 0) return `<span style="display: inline-block; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 12px; font-size: 11.5px; font-weight: 700;">↑ ${growth}%</span>`;
    if (growth < 0) return `<span style="display: inline-block; background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 12px; font-size: 11.5px; font-weight: 700;">↓ ${Math.abs(growth)}%</span>`;
    return `<span style="display: inline-block; background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 12px; font-size: 11.5px; font-weight: 700;">-</span>`;
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatShortVND = (amount) => {
    if (!amount || amount === 0) return '0 đ';
    if (amount >= 1000000000) {
      return (amount / 1000000000).toFixed(2).replace(/\.00$/, '') + ' tỷ';
    }
    if (amount >= 1000000) {
      return Math.round(amount / 1000000) + ' tr';
    }
    return formatVND(amount);
  };

  const growthRevenue = calculateGrowth(currentStats.total_revenue, prevStats?.total_revenue);
  const growthCollected = calculateGrowth(currentStats.total_collected, prevStats?.total_collected);
  const growthDepartures = calculateGrowth(currentStats.totalDepartures, prevStats?.totalDepartures);

  const standardOrder = ['BU1', 'BU2', 'BU4', 'BU5'];
  const sortedBUs = Object.values(currentStats.buData || {})
    .filter(b => b.bu_code !== 'BU3')
    .sort((a, b) => {
      const idxA = standardOrder.indexOf(a.bu_code);
      const idxB = standardOrder.indexOf(b.bu_code);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return b.tour_count - a.tour_count;
    });

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Hiệu Suất Tour - Tháng ${reportMonth}</title>
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <div style="max-width: 780px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); overflow: hidden;">
    
    <!-- Header Banner -->
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 26px 24px; color: #ffffff;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td>
            <div style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #93c5fd; margin-bottom: 6px;">
              FIT TOUR ERP • BÁO CÁO HỆ THỐNG
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1.3;">
              📊 Báo Cáo Hiệu Suất Tour Hàng Tháng
            </h1>
            <div style="margin-top: 6px; font-size: 13px; color: #bfdbfe;">
              Dữ liệu kinh doanh, doanh thu thực thu và tỷ lệ lấp đầy theo Business Unit (BU)
            </div>
          </td>
          <td style="text-align: right; vertical-align: top; width: 120px;">
            <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 700; color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.3);">
              Tháng ${reportMonth}
            </div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Main Content Area -->
    <div style="padding: 24px;">
      <!-- PREFACE_PLACEHOLDER -->

      <!-- Top 3 Metrics KPI Cards -->
      <table style="width: 100%; border-collapse: separate; border-spacing: 10px; margin: -10px -10px 16px -10px; table-layout: fixed;">
        <tr>
          <!-- KPI 1 -->
          <td style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 14px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 6px;">
              💼 DOANH SỐ SALES
            </div>
            <div style="font-size: 20px; font-weight: 800; color: #2563eb; line-height: 1.2; margin-bottom: 8px;">
              ${formatVND(currentStats.total_revenue || 0)}
            </div>
            <div style="font-size: 12px; color: #475569;">
              ${renderGrowth(growthRevenue)} <span style="font-size: 11px; color: #64748b;">vs T${String(prevMonthNum).padStart(2, '0')}</span>
            </div>
          </td>

          <!-- KPI 2 -->
          <td style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 14px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 6px;">
              💰 THỰC THU KHÁCH
            </div>
            <div style="font-size: 20px; font-weight: 800; color: #059669; line-height: 1.2; margin-bottom: 8px;">
              ${formatVND(currentStats.total_collected || 0)}
            </div>
            <div style="font-size: 12px; color: #475569;">
              ${renderGrowth(growthCollected)} <span style="font-size: 11px; color: #64748b;">vs T${String(prevMonthNum).padStart(2, '0')}</span>
            </div>
          </td>

          <!-- KPI 3 -->
          <td style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 14px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; margin-bottom: 6px;">
              ✈️ KHỞI HÀNH (ĐOÀN)
            </div>
            <div style="font-size: 20px; font-weight: 800; color: #d97706; line-height: 1.2; margin-bottom: 4px;">
              ${currentStats.totalDepartures || 0} đoàn
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">
              Kế hoạch: ${currentStats.totalTourMaxPax || 0} chỗ <span style="font-weight: normal; color: #64748b;">(Đã bán: ${currentStats.totalTourSoldPax || 0})</span>
            </div>
            <div style="font-size: 12px; color: #475569;">
              ${renderGrowth(growthDepartures)} <span style="font-size: 11px; color: #64748b;">số đoàn</span>
            </div>
          </td>
        </tr>
      </table>

      <!-- Section: BU Performance -->
      <div style="margin-top: 28px; margin-bottom: 12px;">
        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
          📊 Chi Tiết Đoàn Khởi Hành & Lấp Đầy Theo BU
        </h3>
        <p style="margin: 0; font-size: 12.5px; color: #64748b;">
          Danh sách tour, số đoàn, chỉ tiêu chỗ mở bán và doanh thu thực thu trong tháng
        </p>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 12px 14px; color: #334155; font-weight: 700; width: 230px;">Khối BU & Tên Tour</th>
              <th style="padding: 12px 8px; text-align: center; color: #334155; font-weight: 700; width: 65px;">Số Đoàn</th>
              <th style="padding: 12px 8px; text-align: center; color: #334155; font-weight: 700; width: 75px;">Kế Hoạch</th>
              <th style="padding: 12px 8px; text-align: center; color: #334155; font-weight: 700; width: 70px;">Đã Bán</th>
              <th style="padding: 12px 8px; text-align: center; color: #334155; font-weight: 700; width: 75px;">Còn Trống</th>
              <th style="padding: 12px 12px; text-align: right; color: #334155; font-weight: 700; width: 130px;">Doanh Thu Thực</th>
              <th style="padding: 12px 10px; text-align: center; color: #334155; font-weight: 700; width: 85px;">Lấp Đầy</th>
            </tr>
          </thead>
          <tbody>
            ${sortedBUs.length === 0 ? `
              <tr>
                <td colspan="7" style="padding: 16px; text-align: center; color: #94a3b8;">Không có dữ liệu khởi hành trong tháng.</td>
              </tr>
            ` : sortedBUs.map((row, idx) => {
              const ratio = row.total_pax > 0 ? Math.round((row.sold_pax / row.total_pax) * 100) : 0;
              let ratioBadge = `<span style="display: inline-block; background: #eff6ff; color: #1d4ed8; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 11.5px;">${ratio}%</span>`;
              if (row.tour_count === 0) {
                ratioBadge = `<span style="display: inline-block; background: #f1f5f9; color: #94a3b8; padding: 2px 8px; border-radius: 12px; font-weight: 600; font-size: 11px;">Chưa KH</span>`;
              } else if (ratio >= 80) {
                ratioBadge = `<span style="display: inline-block; background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 11.5px;">${ratio}%</span>`;
              } else if (ratio <= 40) {
                ratioBadge = `<span style="display: inline-block; background: #fee2e2; color: #b91c1c; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 11.5px;">${ratio}%</span>`;
              }
              const rowBg = idx % 2 === 1 ? '#f8fafc' : '#ffffff';
              const vacant = row.total_pax > 0 ? Math.max(0, row.total_pax - row.sold_pax) : 0;

              // Danh sách tour hiển thị rõ tên từng tour
              let tourListHtml = '';
              const depTours = Object.entries(row.departing_tours || {});
              if (depTours.length > 0) {
                tourListHtml = depTours.map(([name, count]) => {
                  return `<div style="color: #1e293b; margin-top: 3px; font-size: 12px;">• <strong>${name}</strong> <span style="color: #64748b; font-size: 11px;">(${count} đoàn)</span></div>`;
                }).join('');
              } else {
                const dList = row.default_tours || [];
                tourListHtml = dList.map(name => {
                  return `<div style="color: #64748b; margin-top: 2px; font-size: 11.5px;">• ${name}</div>`;
                }).join('') + `<div style="font-size: 11px; color: #94a3b8; font-style: italic; margin-top: 4px;">(Tháng này chưa có đoàn khởi hành)</div>`;
              }

              return `
              <tr style="background: ${rowBg};">
                <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
                  <span style="display: inline-block; background: ${row.badgeBg || '#eff6ff'}; color: ${row.badgeColor || '#1d4ed8'}; border: 1px solid ${row.badgeBorder || '#bfdbfe'}; padding: 3px 10px; border-radius: 6px; font-weight: 800; font-size: 13px; letter-spacing: 0.5px;">
                    ${row.bu_code}
                  </span>
                  <div style="margin-top: 4px; line-height: 1.45;">
                    ${tourListHtml}
                  </div>
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; vertical-align: middle;">
                  ${row.tour_count > 0 
                    ? `<strong style="color: #0f172a; font-size: 13.5px;">${row.tour_count}</strong> <span style="font-size: 11.5px; color: #475569;">đoàn</span>` 
                    : `<span style="color: #94a3b8; font-size: 12px;">0 đoàn</span>`}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; vertical-align: middle;">
                  ${row.total_pax > 0 
                    ? `<strong style="color: #1e293b; font-size: 13px;">${row.total_pax}</strong> <span style="font-size: 11px; color: #64748b;">chỗ</span>` 
                    : `<span style="color: #94a3b8; font-size: 12px;">-</span>`}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; vertical-align: middle;">
                  ${row.tour_count > 0 
                    ? `<strong style="color: ${row.sold_pax > 0 ? '#15803d' : '#475569'}; font-size: 13px;">${row.sold_pax}</strong> <span style="font-size: 11px; color: #64748b;">khách</span>` 
                    : `<span style="color: #94a3b8; font-size: 12px;">-</span>`}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; vertical-align: middle;">
                  ${row.tour_count > 0 
                    ? `<strong style="color: ${vacant > 0 ? '#ea580c' : '#15803d'}; font-size: 13px;">${vacant}</strong> <span style="font-size: 11px; color: #64748b;">chỗ</span>` 
                    : `<span style="color: #94a3b8; font-size: 12px;">-</span>`}
                </td>
                <td style="padding: 12px 12px; border-bottom: 1px solid #e2e8f0; text-align: right; vertical-align: middle;">
                  ${row.revenue > 0 
                    ? `<strong style="color: #059669; font-size: 13px;">${formatVND(row.revenue)}</strong>` 
                    : `<span style="color: #64748b; font-size: 12.5px;">0 đ</span>`}
                  ${row.planned_revenue > 0 
                    ? `<div style="font-size: 10.5px; color: #94a3b8; margin-top: 2px;">Kế hoạch: ${formatShortVND(row.planned_revenue)}</div>` 
                    : ''}
                </td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; vertical-align: middle;">
                  ${ratioBadge}
                </td>
              </tr>
              `;
            }).join('')}
          </tbody>
          <!-- Footer Total Row -->
          <tfoot>
            <tr style="background: #f1f5f9; border-top: 2px solid #cbd5e1; font-weight: 700;">
              <td style="padding: 12px 14px; color: #0f172a; font-size: 13px;">
                Tổng cộng toàn công ty
              </td>
              <td style="padding: 12px 8px; text-align: center; color: #0f172a; font-size: 13px;">
                ${currentStats.totalDepartures || 0} đoàn
              </td>
              <td style="padding: 12px 8px; text-align: center; color: #0f172a; font-size: 13px;">
                ${currentStats.totalTourMaxPax || 0} chỗ
              </td>
              <td style="padding: 12px 8px; text-align: center; color: #15803d; font-size: 13px;">
                ${currentStats.totalTourSoldPax || 0} khách
              </td>
              <td style="padding: 12px 8px; text-align: center; color: #ea580c; font-size: 13px;">
                ${Math.max(0, (currentStats.totalTourMaxPax || 0) - (currentStats.totalTourSoldPax || 0))} chỗ
              </td>
              <td style="padding: 12px 12px; text-align: right; color: #059669; font-size: 13px;">
                ${formatVND(Object.values(currentStats.buData || {}).reduce((s, b) => s + (b.revenue || 0), 0))}
              </td>
              <td style="padding: 12px 10px; text-align: center;">
                <span style="display: inline-block; background: #e2e8f0; color: #334155; padding: 2px 8px; border-radius: 12px; font-weight: 700; font-size: 11.5px;">
                  ${currentStats.totalTourMaxPax > 0 ? Math.round(((currentStats.totalTourSoldPax || 0) / currentStats.totalTourMaxPax) * 100) : 0}%
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Section: Top 10 Sales -->
      <div style="margin-top: 28px; margin-bottom: 12px;">
        <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #0f172a;">
          🏆 Vinh Danh Top 10 Sales Xuất Sắc (Tháng ${reportMonth})
        </h3>
        <p style="margin: 0; font-size: 12.5px; color: #64748b;">
          Xếp hạng thành tích theo doanh số bán tour trong tháng
        </p>
      </div>

      <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 24px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; text-align: left;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
              <th style="padding: 12px 10px; text-align: center; color: #475569; font-weight: 700; width: 60px;">Top</th>
              <th style="padding: 12px 14px; color: #475569; font-weight: 700;">Tên Nhân Viên</th>
              <th style="padding: 12px 10px; text-align: center; color: #475569; font-weight: 700;">Đơn / Khách</th>
              <th style="padding: 12px 14px; text-align: right; color: #475569; font-weight: 700;">Doanh Thu Sales</th>
              <th style="padding: 12px 14px; text-align: right; color: #475569; font-weight: 700;">Đã Thu Khách</th>
            </tr>
          </thead>
          <tbody>
            ${(currentStats.topSales || []).length === 0 ? `
              <tr>
                <td colspan="5" style="padding: 16px; text-align: center; color: #94a3b8;">Không có dữ liệu sales trong tháng.</td>
              </tr>
            ` : currentStats.topSales.map((sale, index) => {
              let rankBadge = `<span style="font-weight: 700; color: #64748b;">${index + 1}</span>`;
              let rowBg = index % 2 === 1 ? '#f8fafc' : '#ffffff';
              
              if (index === 0) {
                rankBadge = `<span style="display: inline-block; background: #fef08a; color: #854d0e; padding: 2px 8px; border-radius: 12px; font-weight: 800; font-size: 12px;">🥇 1</span>`;
                rowBg = '#fffdf0';
              } else if (index === 1) {
                rankBadge = `<span style="display: inline-block; background: #e2e8f0; color: #334155; padding: 2px 8px; border-radius: 12px; font-weight: 800; font-size: 12px;">🥈 2</span>`;
              } else if (index === 2) {
                rankBadge = `<span style="display: inline-block; background: #ffedd5; color: #9a3412; padding: 2px 8px; border-radius: 12px; font-weight: 800; font-size: 12px;">🥉 3</span>`;
              }

              return `
              <tr style="background: ${rowBg};">
                <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${rankBadge}</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1e293b;">${sale.sale_name}</td>
                <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${sale.bookings_count} đơn / ${sale.total_pax} khách</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #2563eb;">${formatVND(sale.revenue)}</td>
                <td style="padding: 12px 14px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: 700; color: #059669;">${formatVND(sale.collected_revenue)}</td>
              </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Action Button -->
      <div style="text-align: center; margin: 32px 0 12px 0;">
        <a href="https://erp.fittour.vn/dashboard" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 10px rgba(37, 99, 235, 0.25);">
          👉 Mở Bảng Điều Khiển ERP FIT Tour
        </a>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; line-height: 1.6;">
      Email này được tự động gửi định kỳ từ hệ thống FIT Tour CRM & ERP.<br>
      Dữ liệu tự động tổng hợp vào 08:00 ngày đầu tiên mỗi tháng.<br>
      Vui lòng không trả lời trực tiếp email này.
    </div>

  </div>
</body>
</html>`;
}

async function sendMonthlyDashboardStats(targetMonth, targetYear) {
  const date = new Date();
  let monthNum, yearNum;
  
  if (targetMonth && targetYear) {
    monthNum = parseInt(targetMonth, 10);
    yearNum = parseInt(targetYear, 10);
  } else {
    // Default to previous month
    date.setMonth(date.getMonth() - 1);
    monthNum = date.getMonth() + 1;
    yearNum = date.getFullYear();
  }
  
  const reportMonth = `${String(monthNum).padStart(2, '0')}/${yearNum}`;
  
  let prevMonthNum = monthNum === 1 ? 12 : monthNum - 1;
  let prevYearNum = monthNum === 1 ? yearNum - 1 : yearNum;

  const currentStats = await getDashboardStats(monthNum, yearNum);
  const prevStats = await getDashboardStats(prevMonthNum, prevYearNum);

  const html = generateDashboardEmailHtml({
    reportMonth,
    monthNum,
    yearNum,
    prevMonthNum,
    prevYearNum,
    currentStats,
    prevStats
  });

  const payload = {
    month: reportMonth,
    html_content: html
  };

  emitEvent('MONTHLY_DASHBOARD_STATS', payload);
}

module.exports = {
  sendMonthlyDashboardStats,
  getDashboardStats,
  generateDashboardEmailHtml
};
