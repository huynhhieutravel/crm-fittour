const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const targetYear = 2026;
  const targetMonth = 7;
  const isWeekly = false; // test monthly first

  const aggQuery = `
    SELECT bu_name, year, month, week_number,
      SUM(spend) as actual_spend, 
      SUM(messages) as actual_messages, 
      SUM(leads) as actual_leads,
      SUM(crm_leads_manual) as actual_crm_leads,
      SUM(crm_won_manual) as actual_crm_won
    FROM marketing_ads_reports
    WHERE year = $1 AND month = $2
    GROUP BY bu_name, year, month, week_number
  `;
  const aggResult = await pool.query(aggQuery, [targetYear, targetMonth]);
  
  const kpiQuery = `SELECT * FROM marketing_ads_kpis WHERE year = $1 AND month = $2`;
  const kpiResult = await pool.query(kpiQuery, [targetYear, targetMonth]);

  const activeBUs = [{id: 'BU1'}, {id: 'BU2'}, {id: 'BU3'}, {id: 'BU4'}, {id: 'BU5'}, {id: 'KHAC'}];

  let totalBudget = 0;
  let totalSpend = 0;
  let totalTargetLeads = 0;
  let totalActualLeads = 0;
  let totalActualCrmWon = 0;

  const alerts = [];
  const buBreakdownHtml = activeBUs.map(bu => {
    const kpi = kpiResult.rows.find(k => k.bu_name === bu.id) || {};
    const actualRecords = aggResult.rows.filter(a => a.bu_name === bu.id);
    const actual = actualRecords.reduce((acc, curr) => ({
      spend: acc.spend + parseFloat(curr.actual_spend || 0),
      leads: acc.leads + parseInt(curr.actual_leads || 0),
      crm_won: acc.crm_won + parseInt(curr.actual_crm_won || 0)
    }), { spend: 0, leads: 0, crm_won: 0 });

    const budget = parseFloat(kpi.budget || 0);
    const targetLeads = parseInt(kpi.target_leads || 0);
    const targetCPA = parseFloat(kpi.target_cpa || 0);
    
    if (budget === 0 && targetLeads === 0 && targetCPA === 0 && actual.spend === 0 && actual.leads === 0 && actual.crm_won === 0) {
      return '';
    }

    totalBudget += budget;
    totalSpend += actual.spend;
    totalTargetLeads += targetLeads;
    totalActualLeads += actual.leads;
    totalActualCrmWon += actual.crm_won;

    const daysInPeriod = new Date(targetYear, targetMonth, 0).getDate();
    const targetLeadsPerWeek = (targetLeads / daysInPeriod) * 7;
    const uniqueWeeks = new Set(actualRecords.map(a => `${a.year}-${a.month}-${a.week_number}`)).size;
    const actualLeadsPerWeek = uniqueWeeks > 0 ? actual.leads / uniqueWeeks : 0;
    
    const isThieuLead = actualLeadsPerWeek < targetLeadsPerWeek;
    const actualCPA = (actual.crm_won > 0) ? (actual.spend / actual.crm_won) : (actual.spend > 0 ? actual.spend : 0);
    const isCpaVuot = targetCPA > 0 && actualCPA > targetCPA;
    
    const shortfallLeads = Math.ceil(Math.max(0, targetLeadsPerWeek - actualLeadsPerWeek));
    const excessCpa = Math.ceil(Math.max(0, actualCPA - targetCPA));
    const formatK = (val) => `${(val / 1000).toLocaleString('vi-VN')}k`;
    
    let statusLabel = '🟢 Tốt';
    let statusColor = '#10b981';
    
    if (isThieuLead && isCpaVuot) {
      statusLabel = '🔴 Gãy funnel';
      statusColor = '#ef4444';
      alerts.push(`🚨 <b>${bu.id}:</b> Gãy Funnel (Thiếu ${shortfallLeads} Lead/tuần, CPA vượt ngưỡng ${formatK(excessCpa)})`);
    } else if (isThieuLead) {
      statusLabel = '🟡 Nguy cơ (Thiếu Lead)';
      statusColor = '#f59e0b';
      alerts.push(`⚠️ <b>${bu.id}:</b> Thiếu ${shortfallLeads} Lead/tuần so với Target.`);
    } else if (isCpaVuot) {
      statusLabel = '🟡 Nguy cơ (CPA cao)';
      statusColor = '#f59e0b';
      alerts.push(`⚠️ <b>${bu.id}:</b> CPA đang vượt mức Target ${formatK(excessCpa)}.`);
    }

    if (targetLeads === 0 && targetCPA === 0) {
      statusLabel = 'Chưa có Target';
      statusColor = '#94a3b8';
    }

    // Budget Alert
    if (budget > 0) {
      const budgetUsage = actual.spend / budget;
      const leadProgress = targetLeads > 0 ? (actual.leads / targetLeads) : 0;
      if (budgetUsage > 0.8 && leadProgress < 0.6) {
         alerts.push(`💸 <b>${bu.id}:</b> Đã tiêu >80% Ngân sách nhưng lượng Lead mới đạt ${(leadProgress*100).toFixed(0)}%.`);
      }
    }

    const cpl = actual.leads > 0 ? actual.spend / actual.leads : 0;

    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold;">${bu.id}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: ${statusColor}; font-weight: bold;">${statusLabel}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${actual.spend.toLocaleString('vi-VN')} / ${budget.toLocaleString('vi-VN')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${actual.leads} / ${targetLeads}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0;">${formatK(cpl)}</td>
      </tr>
    `;
  }).join('');

  const totalCPL = totalActualLeads > 0 ? totalSpend / totalActualLeads : 0;
  const totalCPA = totalActualCrmWon > 0 ? totalSpend / totalActualCrmWon : (totalSpend > 0 ? totalSpend : 0);
  const budgetUsagePercent = totalBudget > 0 ? ((totalSpend / totalBudget) * 100).toFixed(1) : 0;
  
  const alertsHtml = alerts.length > 0 
    ? `<div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
         <h4 style="margin: 0 0 10px; color: #e11d48;">Cảnh Báo Phân Tích</h4>
         <ul style="margin: 0; padding-left: 20px; line-height: 1.6; color: #334155;">
           ${alerts.map(a => `<li>${a}</li>`).join('')}
         </ul>
       </div>`
    : `<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 20px; border-radius: 4px; color: #065f46; font-weight: 500;">
         🎉 Tuyệt vời! Các BU đang hoạt động ổn định và giữ vững KPI.
       </div>`;

  const html = `
    <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px;">
      <h2 style="color: #1e293b; margin-top: 0; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">Báo Cáo Marketing Ads - Tháng ${targetMonth}/${targetYear}</h2>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px; gap: 15px; flex-wrap: wrap;">
         <div style="flex: 1; min-width: 150px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Ngân sách đã chi</div>
            <div style="font-size: 20px; color: #3b82f6; font-weight: bold; margin-top: 5px;">${totalSpend.toLocaleString('vi-VN')} đ</div>
            <div style="font-size: 12px; color: #475569; margin-top: 5px;">${budgetUsagePercent}% so với Kế hoạch</div>
         </div>
         <div style="flex: 1; min-width: 150px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Lead Thực tế / Mục tiêu</div>
            <div style="font-size: 20px; color: #f59e0b; font-weight: bold; margin-top: 5px;">${totalActualLeads} / ${totalTargetLeads}</div>
         </div>
         <div style="flex: 1; min-width: 150px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0;">
            <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">CPL / CPA Trung bình</div>
            <div style="font-size: 20px; color: #10b981; font-weight: bold; margin-top: 5px;">${(totalCPL/1000).toFixed(1)}k / ${(totalCPA/1000).toFixed(1)}k</div>
         </div>
      </div>

      ${alertsHtml}

      <h3 style="color: #1e293b; font-size: 16px;">Chi tiết theo BU</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
        <thead style="background: #f1f5f9;">
          <tr>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">BU</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Tình trạng Funnel</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Chi tiêu / Ngân sách</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Leads / Target</th>
            <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">CPL</th>
          </tr>
        </thead>
        <tbody>
          ${buBreakdownHtml}
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://erp.fittour.vn/marketing-ads" style="background: #3b82f6; color: white; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 500; display: inline-block;">Xem Bảng Điều Khiển Ads</a>
      </div>
    </div>
  `;

  console.log(html);
  process.exit(0);
}
run();
