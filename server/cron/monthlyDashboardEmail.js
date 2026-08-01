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
     WHERE booking_status NOT IN ('Huỷ', 'Mới') 
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
        tt.bu_group,
        td.id as departure_id,
        td.max_participants as max_pax,
        (SELECT COALESCE(SUM(pax_count), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Mới')) as sold_pax,
        (SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE tour_departure_id = td.id AND booking_status NOT IN ('Huỷ', 'Mới')) as revenue
     FROM tour_departures_raw td
     JOIN tour_templates tt ON td.tour_template_id = tt.id
     WHERE EXTRACT(YEAR FROM td.start_date) = $1 AND EXTRACT(MONTH FROM td.start_date) = $2
     AND td.status != 'Huỷ'
     AND (td.is_deleted IS NULL OR td.is_deleted = false)`,
    params
  );

  const buData = {};
  let totalTourMaxPax = 0;
  let totalTourSoldPax = 0;
  let totalDepartures = toursRes.rows.length;

  toursRes.rows.forEach(t => {
    totalTourMaxPax += parseInt(t.max_pax) || 0;
    totalTourSoldPax += parseInt(t.sold_pax) || 0;

    const bu = t.bu_group || 'Khác';
    if (!buData[bu]) {
      buData[bu] = {
        bu_name: bu,
        total_pax: 0,
        sold_pax: 0,
        tour_count: 0,
        revenue: 0
      };
    }

    buData[bu].total_pax += parseInt(t.max_pax) || 0;
    buData[bu].sold_pax += parseInt(t.sold_pax) || 0;
    buData[bu].tour_count += 1;
    buData[bu].revenue += parseFloat(t.revenue) || 0;
  });

  // 3. Top 10 Sales của tháng -> Tính theo created_at
  const salesRes = await db.query(`
    SELECT 
        COALESCE(u.full_name, b.created_by_name, 'Chưa gán') as sale_name,
        COUNT(b.id) as bookings_count,
        SUM(b.pax_count) as total_pax,
        SUM(b.total_price) as revenue,
        SUM(b.paid) as collected_revenue
    FROM tour_departures_raw td
    JOIN bookings b ON b.tour_departure_id = td.id
    LEFT JOIN users u ON b.created_by = u.id
    WHERE EXTRACT(YEAR FROM b.created_at) = $1 AND EXTRACT(MONTH FROM b.created_at) = $2
    AND (td.is_deleted IS NULL OR td.is_deleted = false)
    AND td.status != 'Huỷ'
    AND b.booking_status NOT IN ('Huỷ', 'Mới')
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

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };
  
  const renderGrowth = (growth) => {
     if (growth > 0) return `<span style="color: #16a34a; font-weight: 600;">↑ ${growth}%</span>`;
     if (growth < 0) return `<span style="color: #dc2626; font-weight: 600;">↓ ${Math.abs(growth)}%</span>`;
     return `<span style="color: #64748b; font-weight: 600;">-</span>`;
  };

  const formatVND = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const growthRevenue = calculateGrowth(currentStats.total_revenue, prevStats.total_revenue);
  const growthCollected = calculateGrowth(currentStats.total_collected, prevStats.total_collected);
  const growthDepartures = calculateGrowth(currentStats.totalDepartures, prevStats.totalDepartures);

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #1e293b;">
      <h2 style="color: #0f172a; border-bottom: 2px solid #f1f5f9; padding-bottom: 12px; margin-bottom: 24px;">
        📊 Báo cáo Tổng quan Hiệu suất Tour - Tháng ${reportMonth}
      </h2>

      <!-- Top Metrics -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; background: #f8fafc; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr>
            <th style="padding: 16px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;">Doanh số Sales</th>
            <th style="padding: 16px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;">Thực thu</th>
            <th style="padding: 16px; text-align: left; border-bottom: 1px solid #e2e8f0; color: #475569; font-weight: 600;">Đoàn & Khách (Khởi hành)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 16px;">
              <div style="font-size: 24px; font-weight: bold; color: #3b82f6; margin-bottom: 4px;">${formatVND(currentStats.total_revenue)}</div>
              <div style="font-size: 13px;">${renderGrowth(growthRevenue)} so với T${String(prevMonthNum).padStart(2, '0')}</div>
            </td>
            <td style="padding: 16px;">
              <div style="font-size: 24px; font-weight: bold; color: #10b981; margin-bottom: 4px;">${formatVND(currentStats.total_collected)}</div>
              <div style="font-size: 13px;">${renderGrowth(growthCollected)} so với T${String(prevMonthNum).padStart(2, '0')}</div>
            </td>
            <td style="padding: 16px;">
              <div style="font-size: 20px; font-weight: bold; color: #f59e0b; margin-bottom: 4px;">${currentStats.totalDepartures} đoàn</div>
              <div style="font-size: 14px; color: #475569;">(${currentStats.totalTourSoldPax}/${currentStats.totalTourMaxPax} khách)</div>
              <div style="font-size: 13px; margin-top: 4px;">${renderGrowth(growthDepartures)} số đoàn</div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- BU Performance -->
      <h3 style="color: #334155; margin-bottom: 16px; font-size: 18px;">Phân tích Lấp đầy theo BU</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Tên BU</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Số Đoàn</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Đã bán / Tổng</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Doanh Thu (Khởi hành)</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Lấp đầy (%)</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(currentStats.buData).sort((a, b) => b.tour_count - a.tour_count).map(row => {
            const ratio = row.total_pax > 0 ? Math.round((row.sold_pax / row.total_pax) * 100) : 0;
            let ratioColor = '#3b82f6';
            if (ratio >= 80) ratioColor = '#10b981';
            if (ratio <= 40) ratioColor = '#ef4444';
            
            return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #334155;">${row.bu_name}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${row.tour_count}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${row.sold_pax} / ${row.total_pax}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: #059669;">${formatVND(row.revenue)}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; color: ${ratioColor}; font-weight: bold;">
                ${ratio}%
              </td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <!-- Top 10 Sales -->
      <h3 style="color: #334155; margin-bottom: 16px; font-size: 18px;">Vinh Danh Top 10 Sales Xuất Sắc (Tháng ${reportMonth})</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 32px; font-size: 14px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600; width: 50px;">Top</th>
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Tên Nhân Viên</th>
            <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Đơn/Khách</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Doanh Thu Sales</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e2e8f0; color: #475569; font-weight: 600;">Đã Thu Khách</th>
          </tr>
        </thead>
        <tbody>
          ${currentStats.topSales.map((sale, index) => {
            let rankColor = '#64748b';
            let rankIcon = '';
            if (index === 0) { rankColor = '#eab308'; rankIcon = '🏆 '; }
            if (index === 1) { rankColor = '#94a3b8'; rankIcon = '🥈 '; }
            if (index === 2) { rankColor = '#b45309'; rankIcon = '🥉 '; }

            return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: bold; font-size: 16px; color: ${rankColor};">${rankIcon}${index + 1}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #3b82f6;">${sale.sale_name}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #475569;">${sale.bookings_count} đơn / ${sale.total_pax} khách</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #3b82f6;">${formatVND(sale.revenue)}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold; color: #10b981;">${formatVND(sale.collected_revenue)}</td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        Đây là email tự động từ hệ thống FIT Tour CRM.<br>
        Vui lòng không trả lời email này.
      </div>
    </div>
  `;

  const payload = {
    month: reportMonth,
    html_content: html
  };

  emitEvent('MONTHLY_DASHBOARD_STATS', payload);
}

module.exports = {
  sendMonthlyDashboardStats
};
