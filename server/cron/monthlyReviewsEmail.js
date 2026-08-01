const cron = require('node-cron');
const db = require('../db');
const { onEvent, eventBus } = require('../utils/eventBus');

// Run on the 1st of every month at 08:00 (DISABLED - User wants to send manually)
// cron.schedule('0 8 1 * *', async () => {
//   console.log('[Cron] Running Monthly Reviews Stats...');
//   try {
//     await sendMonthlyReviewsStats();
//   } catch (error) {
//     console.error('[Cron] Error generating Monthly Reviews Stats:', error);
//   }
// });


async function sendMonthlyReviewsStats(targetMonth, targetYear) {
  const date = new Date();
  let month, year;
  
  if (targetMonth && targetYear) {
    month = String(targetMonth).padStart(2, '0');
    year = targetYear;
  } else {
    // Default to previous month
    date.setMonth(date.getMonth() - 1);
    month = String(date.getMonth() + 1).padStart(2, '0');
    year = date.getFullYear();
  }
  
  // Format MM/YYYY
  const reportMonth = `${month}/${year}`;
  
  // Start and End dates for the selected month
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(year, parseInt(month, 10), 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;
  
  // Previous month dates
  const prevMonthObj = new Date(year, parseInt(month, 10) - 2, 1);
  const prevMonthStr = String(prevMonthObj.getMonth() + 1).padStart(2, '0');
  const prevYearStr = prevMonthObj.getFullYear();
  const prevLastDay = new Date(prevYearStr, parseInt(prevMonthStr, 10), 0).getDate();
  
  const prevStartDate = `${prevYearStr}-${prevMonthStr}-01`;
  const prevEndDate = `${prevYearStr}-${prevMonthStr}-${prevLastDay}`;

  const baseWhere = `is_deleted = false AND approval_status = 'approved' AND (bu_id IS NULL OR UPPER(bu_id) NOT IN ('MARKETING', 'KẾ TOÁN', 'KE TOAN')) AND review_date >= $1 AND review_date <= $2`;
  
  const overviewRes = await db.query(`
    SELECT COUNT(*) as total, AVG(rating) as avg_rating, SUM(CASE WHEN photo_count >= 5 THEN 1 ELSE 0 END) as rich_reviews
    FROM customer_reviews WHERE ${baseWhere}
  `, [startDate, endDate]);
  
  const prevOverviewRes = await db.query(`
    SELECT COUNT(*) as total, AVG(rating) as avg_rating, SUM(CASE WHEN photo_count >= 5 THEN 1 ELSE 0 END) as rich_reviews
    FROM customer_reviews WHERE ${baseWhere}
  `, [prevStartDate, prevEndDate]);
  
  const buBreakdownRes = await db.query(`
    SELECT COALESCE(bu_id, 'Chưa phân') as bu_id, COUNT(*) as total, AVG(rating) as avg_rating, SUM(CASE WHEN photo_count >= 5 THEN 1 ELSE 0 END) as rich_reviews
    FROM customer_reviews WHERE ${baseWhere}
    GROUP BY COALESCE(bu_id, 'Chưa phân')
    ORDER BY total DESC
  `, [startDate, endDate]);

  const overview = overviewRes.rows[0];
  const prevOverview = prevOverviewRes.rows[0] || {};
  
  const total_reviews = parseInt(overview.total || 0);
  const avg_rating = parseFloat(overview.avg_rating || 0).toFixed(1);
  const rich_reviews = parseInt(overview.rich_reviews || 0);

  const prev_total = parseInt(prevOverview.total || 0);
  const prev_avg = parseFloat(prevOverview.avg_rating || 0).toFixed(1);
  const prev_rich = parseInt(prevOverview.rich_reviews || 0);

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };
  
  const growthTotal = calculateGrowth(total_reviews, prev_total);
  const growthRating = calculateGrowth(avg_rating, prev_avg);
  const growthRich = calculateGrowth(rich_reviews, prev_rich);
  
  const renderGrowth = (growth) => {
     if (growth > 0) return `<span style="color: #16a34a; font-weight: 600;">↑ ${growth}%</span>`;
     if (growth < 0) return `<span style="color: #dc2626; font-weight: 600;">↓ ${Math.abs(growth)}%</span>`;
     return `<span style="color: #64748b; font-weight: 600;">-</span>`;
  };

  // Generate HTML
  let html = `
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-top: 20px;">
      <h3 style="margin-top: 0; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Tổng Quan Tháng ${reportMonth}</h3>
      <table style="width: 100%; text-align: left; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Tổng Đánh Giá</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Điểm Trung Bình</th>
          <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Đánh Giá Chi Tiết (≥5 Ảnh)</th>
        </tr>
        <tr>
          <td style="padding: 10px; font-size: 24px; font-weight: bold; color: #3b82f6; vertical-align: top;">
            ${total_reviews}
            <div style="font-size: 12px; font-weight: normal; color: #64748b; margin-top: 4px;">${renderGrowth(growthTotal)} (so với ${prev_total})</div>
          </td>
          <td style="padding: 10px; font-size: 24px; font-weight: bold; color: #f59e0b; vertical-align: top;">
            ${avg_rating} <span style="font-size:16px;">⭐</span>
            <div style="font-size: 12px; font-weight: normal; color: #64748b; margin-top: 4px;">${renderGrowth(growthRating)} (so với ${prev_avg})</div>
          </td>
          <td style="padding: 10px; font-size: 24px; font-weight: bold; color: #10b981; vertical-align: top;">
            ${rich_reviews}
            <div style="font-size: 12px; font-weight: normal; color: #64748b; margin-top: 4px;">${renderGrowth(growthRich)} (so với ${prev_rich})</div>
          </td>
        </tr>
      </table>
      
      <h3 style="margin-top: 20px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">Thống Kê Theo BU</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: left;">BU</th>
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: center;">Tổng Đánh Giá</th>
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: center;">Điểm Trung Bình</th>
            <th style="padding: 12px; border-bottom: 2px solid #e2e8f0; text-align: center;">Bài ĐG Chi Tiết</th>
          </tr>
        </thead>
        <tbody>
          ${buBreakdownRes.rows.map(row => {
            const ratio = row.total > 0 ? Math.round(row.rich_reviews / row.total * 100) : 0;
            return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 500;">${row.bu_id}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center;">${row.total}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #f59e0b;">${parseFloat(row.avg_rating).toFixed(1)}</td>
              <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: center; color: #10b981;">
                ${row.rich_reviews} <span style="font-size: 11px; color: #64748b;">(${ratio}%)</span>
              </td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: center;">
        <a href="https://erp.fittour.vn/guides/reviews?viewMode=dashboard" style="background: #3b82f6; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; display: inline-block;">Xem Chi Tiết Dashboard</a>
      </div>
    </div>
  `;

  const payload = {
    month: reportMonth,
    total_reviews,
    avg_rating,
    rich_reviews,
    html_content: html
  };

  // Emit event so emailListener will catch it and send if there is an active rule
  const { emitEvent } = require('../utils/eventBus');
  emitEvent('MONTHLY_REVIEWS_STATS', payload);
}

module.exports = {
  sendMonthlyReviewsStats
};
