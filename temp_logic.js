    let aggQuery = `
      SELECT bu_name, year, month, week_number,
        SUM(spend) as actual_spend, 
        SUM(messages) as actual_messages, 
        SUM(leads) as actual_leads,
        SUM(crm_leads_manual) as actual_crm_leads,
        SUM(crm_won_manual) as actual_crm_won
      FROM marketing_ads_reports
      WHERE year = $1 AND month = $2
    `;
    const queryParams = [targetYear, targetMonth];
    if (type === 'weekly' && week) {
       aggQuery += ` AND week_number <= $3`;
       queryParams.push(parseInt(week));
    }
    aggQuery += ` GROUP BY bu_name, year, month, week_number`;
    
    const aggResult = await db.query(aggQuery, queryParams);
    
    const kpiQuery = `SELECT * FROM marketing_ads_kpis WHERE year = $1 AND month = $2`;
    const kpiResult = await db.query(kpiQuery, [targetYear, targetMonth]);
  
    const activeBUs = [{id: 'BU1'}, {id: 'BU2'}, {id: 'BU3'}, {id: 'BU4'}, {id: 'BU5'}, {id: 'KHAC'}];
  
    let totalBudget = 0;
    let totalSpend = 0;
    let totalMonthlyBudget = 0;
    let totalAccumulatedSpend = 0;
    let totalTargetLeads = 0;
    let totalActualLeads = 0;
    let totalActualMessages = 0;
    let totalActualCrmWon = 0;
  
    const alerts = [];
    const buBreakdownHtml = activeBUs.map(bu => {
      const kpi = kpiResult.rows.find(k => k.bu_name === bu.id) || {};
      const allActualRecords = aggResult.rows.filter(a => a.bu_name === bu.id);
      const currentWeekRecords = (type === 'weekly' && week) 
          ? allActualRecords.filter(a => parseInt(a.week_number) === parseInt(week))
          : allActualRecords;

      const actual = currentWeekRecords.reduce((acc, curr) => ({
        spend: acc.spend + parseFloat(curr.actual_spend || 0),
        messages: acc.messages + parseInt(curr.actual_messages || 0),
        leads: acc.leads + parseInt(curr.actual_leads || 0),
        crm_won: acc.crm_won + parseInt(curr.actual_crm_won || 0)
      }), { spend: 0, messages: 0, leads: 0, crm_won: 0 });

      const accumulated = allActualRecords.reduce((acc, curr) => ({
        spend: acc.spend + parseFloat(curr.actual_spend || 0)
      }), { spend: 0 });
  
      const monthlyBudget = parseFloat(kpi.budget || 0);
      let budget = monthlyBudget;
      let targetLeads = parseInt(kpi.target_leads || 0);
      const targetCPA = parseFloat(kpi.target_cpa || 0);
      
      if (budget === 0 && targetLeads === 0 && targetCPA === 0 && actual.spend === 0 && actual.leads === 0 && actual.crm_won === 0) {
        return '';
      }

      if (type === 'weekly') {
         budget = budget / 4; 
         targetLeads = Math.ceil(targetLeads / 4);
      }

      totalBudget += budget;
      totalSpend += actual.spend;
      totalMonthlyBudget += monthlyBudget;
      totalAccumulatedSpend += accumulated.spend;
      totalTargetLeads += targetLeads;
      totalActualLeads += actual.leads;
      totalActualMessages += actual.messages;
      totalActualCrmWon += actual.crm_won;
  
      const daysInPeriod = new Date(targetYear, targetMonth, 0).getDate();
      const targetLeadsPerWeek = (targetLeads / daysInPeriod) * 7;
      const uniqueWeeks = new Set(allActualRecords.map(a => `${a.year}-${a.month}-${a.week_number}`)).size;
      const actualLeadsPerWeek = uniqueWeeks > 0 ? actual.leads / uniqueWeeks : 0;
      
      const isThieuLead = type === 'weekly' ? (actual.leads < targetLeads) : (actualLeadsPerWeek < targetLeadsPerWeek);
      const actualCPA = (actual.crm_won > 0) ? (actual.spend / actual.crm_won) : 0;
      const isCpaVuot = targetCPA > 0 && actualCPA > targetCPA;
      
      const shortfallLeads = type === 'weekly' ? Math.max(0, targetLeads - actual.leads) : Math.ceil(Math.max(0, targetLeadsPerWeek - actualLeadsPerWeek));
      const excessCpa = Math.ceil(Math.max(0, actualCPA - targetCPA));
      const formatK = (val) => `${(val / 1000).toLocaleString('vi-VN')}k`;
      
      let statusLabel = '🟢 Tốt';
      let statusColor = '#10b981';
      
      if (isThieuLead && isCpaVuot) {
        statusLabel = '🔴 Gãy funnel';
        statusColor = '#ef4444';
        alerts.push(`🚨 <b>${bu.id}:</b> Gãy Funnel (Thiếu ${shortfallLeads} Lead, CPA vượt ngưỡng ${formatK(excessCpa)})`);
      } else if (isThieuLead) {
        statusLabel = '🟡 Nguy cơ (Thiếu Lead)';
        statusColor = '#f59e0b';
        alerts.push(`⚠️ <b>${bu.id}:</b> Thiếu ${shortfallLeads} Lead so với Target.`);
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
  
      const cpm = actual.messages > 0 ? actual.spend / actual.messages : 0;
  
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; white-space: nowrap;">${bu.id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; color: ${statusColor}; font-weight: bold; white-space: nowrap;">${statusLabel}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${actual.spend.toLocaleString('vi-VN')} / ${budget.toLocaleString('vi-VN')} <span style="font-size: 12px; color: #64748b;">(${budget > 0 ? Math.round((actual.spend / budget) * 100) : 0}%)</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${actual.messages.toLocaleString('vi-VN')} / ${formatK(cpm)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${actual.leads} / ${targetLeads} <span style="color: #64748b;">(${targetLeads > 0 ? Math.round((actual.leads / targetLeads) * 100) : 0}%)</span></td>
          <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; white-space: nowrap;">${formatK(cpl)}</td>
        </tr>
      `;
    }).join('');
  
    const totalCPL = totalActualLeads > 0 ? totalSpend / totalActualLeads : 0;
    const totalCPA = totalActualCrmWon > 0 ? totalSpend / totalActualCrmWon : 0;
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

    const reportTitle = type === 'weekly' ? `Báo Cáo Marketing Ads - Tuần ${week} Tháng ${targetMonth}/${targetYear}` : `Báo Cáo Marketing Ads - Tháng ${targetMonth}/${targetYear}`;
  
    // Template renderer của hệ thống sẽ chỉ render phần nội dung bên trong <div class="content">...</div> 
    // vì tiêu đề sẽ được nó tự động chèn vào ({{eventLabel}})
    const html = `
        <table style="width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 20px; table-layout: fixed;">
           <tr>
             <td style="width: 32%; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; vertical-align: top;">
                <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Ngân sách đã chi ${type === 'weekly' ? '(Tuần)' : ''}</div>
                <div style="font-size: 20px; color: #3b82f6; font-weight: bold; margin-top: 5px; white-space: nowrap;">${totalSpend.toLocaleString('vi-VN')} đ</div>
                <div style="font-size: 12px; color: #475569; margin-top: 5px;">${budgetUsagePercent}% so với Kế hoạch ${type === 'weekly' ? 'tuần' : 'tháng'}</div>
                ${type === 'weekly' ? `
                <div style="margin-top: 15px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                   <div style="font-size: 11px; color: #64748b; font-weight: bold; text-transform: uppercase;">Lũy kế tháng (${week} tuần)</div>
                   <div style="font-size: 14px; color: #334155; font-weight: bold; margin-top: 3px;">${totalAccumulatedSpend.toLocaleString('vi-VN')} đ</div>
                   <div style="font-size: 11px; color: #475569; margin-top: 2px;">Còn lại: ${Math.max(0, totalMonthlyBudget - totalAccumulatedSpend).toLocaleString('vi-VN')} đ <span style="font-weight: 500;">(${totalMonthlyBudget > 0 ? Math.round((totalMonthlyBudget - totalAccumulatedSpend) / totalMonthlyBudget * 100) : 0}%)</span></div>
                </div>
                ` : ''}
             </td>
             <td style="width: 2%;"></td>
             <td style="width: 32%; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; vertical-align: top;">
                <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">Lead Thực tế / Mục tiêu</div>
                <div style="font-size: 20px; color: #f59e0b; font-weight: bold; margin-top: 5px; white-space: nowrap;">${totalActualLeads} / ${totalTargetLeads} <span style="font-size: 14px; color: #64748b; font-weight: normal;">(${totalTargetLeads > 0 ? Math.round((totalActualLeads / totalTargetLeads) * 100) : 0}%)</span></div>
             </td>
             <td style="width: 2%;"></td>
             <td style="width: 32%; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; vertical-align: top;">
                <div style="font-size: 12px; color: #64748b; font-weight: bold; text-transform: uppercase;">CPL ${totalActualCrmWon > 0 ? '/ CPA ' : ''}Trung bình</div>
                <div style="font-size: 20px; color: #10b981; font-weight: bold; margin-top: 5px; white-space: nowrap;">${(totalCPL/1000).toFixed(1)}k${totalActualCrmWon > 0 ? ` / ${(totalCPA/1000).toFixed(1)}k` : ''}</div>
             </td>
           </tr>
        </table>
  
        ${alertsHtml}
  
        <h3 style="color: #1e293b; font-size: 16px;">Chi tiết theo BU</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
          <thead style="background: #f1f5f9;">
            <tr>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">BU</th>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Tình trạng Funnel</th>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Chi tiêu / Ngân sách</th>
              <th style="padding: 10px; border-bottom: 2px solid #cbd5e1;">Tin nhắn / Chi phí</th>
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
    `;

    if (custom_email) {
      const queueService = require("../services/queueService");
      await queueService.enqueue("send-email", {
        recipient: custom_email,
