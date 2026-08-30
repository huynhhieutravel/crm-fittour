const db = require('../db');

/**
 * Helper to compute standard week ranges for any given month/year
 * (Matching Monday-Sunday calendar, merging <=2 orphaned days into Week 1)
 */
function getWeekRanges(year, month) {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  let firstSunday = new Date(firstDay);
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() + 1);
  }
  let w1End = new Date(firstSunday);
  const daysInFirstSegment = firstSunday.getDate() - firstDay.getDate() + 1;
  if (daysInFirstSegment <= 2 && w1End.getDate() + 7 <= lastDay.getDate()) {
    w1End.setDate(w1End.getDate() + 7);
  }
  const ranges = {};
  ranges[1] = {
    startDay: firstDay.getDate(),
    endDay: w1End.getDate(),
    label: `Tuần 1 (${String(firstDay.getDate()).padStart(2, '0')} - ${String(w1End.getDate()).padStart(2, '0')}/${String(month).padStart(2, '0')})`,
    sub: `${String(firstDay.getDate()).padStart(2, '0')} - ${String(w1End.getDate()).padStart(2, '0')}/${String(month).padStart(2, '0')}`
  };
  let currentStart = new Date(w1End);
  currentStart.setDate(currentStart.getDate() + 1);
  for (let w = 2; w <= 4; w++) {
    if (currentStart > lastDay) {
      ranges[w] = null;
      continue;
    }
    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);
    if (currentEnd > lastDay) currentEnd = new Date(lastDay);
    ranges[w] = {
      startDay: currentStart.getDate(),
      endDay: currentEnd.getDate(),
      label: `Tuần ${w} (${String(currentStart.getDate()).padStart(2, '0')} - ${String(currentEnd.getDate()).padStart(2, '0')}/${String(month).padStart(2, '0')})`,
      sub: `${String(currentStart.getDate()).padStart(2, '0')} - ${String(currentEnd.getDate()).padStart(2, '0')}/${String(month).padStart(2, '0')}`
    };
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  if (currentStart <= lastDay) {
    ranges[5] = {
      startDay: currentStart.getDate(),
      endDay: lastDay.getDate(),
      label: `Tuần 5 (${String(currentStart.getDate()).padStart(2, '0')} - ${String(lastDay.getDate()).padStart(2, '0')}/${String(month).padStart(2, '0')})`,
      sub: `${String(currentStart.getDate()).padStart(2, '0')} - ${String(lastDay.getDate()).padStart(2, '0')}/${String(month).padStart(2, '0')}`
    };
  } else {
    ranges[5] = null;
  }
  return ranges;
}

const BU_METAS = {
  BU1: { label: 'BU1 - Tour Trung Quốc', icon: '🇨🇳' },
  BU2: { label: 'BU2 - Tour Nhật Bản', icon: '🇯🇵' },
  BU4: { label: 'BU4 - Sri Lanka, Ladakh, Bhutan', icon: '🇱🇰' },
  BU5: { label: 'BU5 - Ma Rốc, Ai Cập, Pakistan, Mông Cổ', icon: '🇲🇦' },
  BU3: { label: 'BU3 - Tour Châu Âu & Úc (Thử Nghiệm)', icon: '🌏' }
};

/**
 * Generate full responsive executive HTML email report
 */
async function generateMarketingAdsEmailReport({ type = 'weekly', targetYear, targetMonth, selectedWeek }) {
  const weekRanges = getWeekRanges(targetYear, targetMonth);
  const currentWeek = parseInt(selectedWeek) || 3;
  const monthDays = new Date(targetYear, targetMonth, 0).getDate();
  const currentRange = weekRanges[currentWeek];
  const timeProgressPercent = currentRange ? ((currentRange.endDay / monthDays) * 100).toFixed(1) : 75;

  // 1. Fetch Meta Ads data
  const adsRes = await db.query(`
    SELECT bu_name, week_number,
      COALESCE(SUM(spend), 0)::numeric as spend,
      COALESCE(SUM(messages), 0)::int as messages,
      COALESCE(SUM(leads), 0)::int as leads
    FROM marketing_ads_reports
    WHERE year = $1 AND month = $2
    GROUP BY bu_name, week_number
    ORDER BY bu_name, week_number
  `, [targetYear, targetMonth]);

  // 2. Fetch KPIs
  const kpiRes = await db.query(`
    SELECT bu_name, budget, target_leads, target_cpa
    FROM marketing_ads_kpis
    WHERE year = $1 AND month = $2
  `, [targetYear, targetMonth]);
  const kpiMap = {};
  kpiRes.rows.forEach(k => kpiMap[k.bu_name] = k);

  // 3. Fetch CRM Leads grouped by Week & BU
  const lastDayOfMonth = new Date(targetYear, targetMonth, 0).getDate();
  const monthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01 00:00:00`;
  const monthEnd = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')} 23:59:59`;

  let caseClauses = [];
  for (let w = 1; w <= 5; w++) {
    if (weekRanges[w]) {
      caseClauses.push(`WHEN EXTRACT(DAY FROM l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN ${weekRanges[w].startDay} AND ${weekRanges[w].endDay} THEN ${w}`);
    }
  }
  const caseSql = caseClauses.length > 0 ? `CASE ${caseClauses.join(' ')} ELSE 1 END` : `1`;

  const crmRes = await db.query(`
    SELECT 
      ${caseSql} as week_number,
      COALESCE(l.bu_group, tt.bu_group, 'OTHER') as bu_group,
      COUNT(l.id)::int as crm_leads,
      COUNT(CASE WHEN l.status = 'Chốt đơn' THEN 1 END)::int as won_deals
    FROM leads l
    LEFT JOIN tour_templates tt ON l.tour_id = tt.id
    WHERE l.created_at >= $1 AND l.created_at <= $2
    GROUP BY 1, 2
    ORDER BY 1, 2
  `, [monthStart, monthEnd]);

  // Build maps
  const adsByBUWeek = {};
  const adsTotalByWeek = {};
  let totalSpendMonth = 0;
  let totalMsgMonth = 0;
  let totalLeadAdsMonth = 0;

  adsRes.rows.forEach(r => {
    const w = parseInt(r.week_number);
    const bu = r.bu_name;
    if (!adsByBUWeek[bu]) adsByBUWeek[bu] = {};
    adsByBUWeek[bu][w] = {
      spend: parseFloat(r.spend || 0),
      messages: parseInt(r.messages || 0),
      leads: parseInt(r.leads || 0)
    };

    if (!adsTotalByWeek[w]) adsTotalByWeek[w] = { spend: 0, messages: 0, leads: 0 };
    adsTotalByWeek[w].spend += parseFloat(r.spend || 0);
    adsTotalByWeek[w].messages += parseInt(r.messages || 0);
    adsTotalByWeek[w].leads += parseInt(r.leads || 0);

    totalSpendMonth += parseFloat(r.spend || 0);
    totalMsgMonth += parseInt(r.messages || 0);
    totalLeadAdsMonth += parseInt(r.leads || 0);
  });

  const crmByBUWeek = {};
  const crmTotalByWeek = {};
  let totalCrmLeadsMonth = 0;

  crmRes.rows.forEach(r => {
    const w = parseInt(r.week_number);
    const bu = r.bu_group;
    if (!crmByBUWeek[bu]) crmByBUWeek[bu] = {};
    crmByBUWeek[bu][w] = parseInt(r.crm_leads || 0);

    if (!crmTotalByWeek[w]) crmTotalByWeek[w] = 0;
    crmTotalByWeek[w] += parseInt(r.crm_leads || 0);
    totalCrmLeadsMonth += parseInt(r.crm_leads || 0);
  });

  // Current Week Totals
  const currAds = adsTotalByWeek[currentWeek] || { spend: 0, messages: 0, leads: 0 };
  const prevWeek = currentWeek > 1 ? currentWeek - 1 : null;
  const prevAds = prevWeek ? (adsTotalByWeek[prevWeek] || { spend: 0, messages: 0, leads: 0 }) : null;

  const spendDeltaPercent = prevAds && prevAds.spend > 0 
    ? (((currAds.spend - prevAds.spend) / prevAds.spend) * 100).toFixed(1)
    : null;

  const currCPL = currAds.leads > 0 ? Math.round(currAds.spend / currAds.leads) : 0;
  const prevCPL = prevAds && prevAds.leads > 0 ? Math.round(prevAds.spend / prevAds.leads) : 0;
  const cplDeltaPercent = prevCPL > 0 ? (((currCPL - prevCPL) / prevCPL) * 100).toFixed(1) : null;
  const avgCPLMonth = totalLeadAdsMonth > 0 ? Math.round(totalSpendMonth / totalLeadAdsMonth) : 0;

  // Monthly Budget & Target Leads
  let totalBudgetMonth = 0;
  let totalTargetLeadsMonth = 0;
  Object.values(kpiMap).forEach(k => {
    totalBudgetMonth += parseFloat(k.budget || 0);
    totalTargetLeadsMonth += parseInt(k.target_leads || 0);
  });
  if (totalBudgetMonth === 0) totalBudgetMonth = 130000000;
  if (totalTargetLeadsMonth === 0) totalTargetLeadsMonth = 450;

  const currWeekTargetSpend = Math.round(totalBudgetMonth / 4);
  const currWeekTargetLeads = Math.round(totalTargetLeadsMonth / 4);

  // Status and Alerts Generation
  const alertsList = [];
  const buRowsHtml = [];

  const buKeys = ['BU1', 'BU2', 'BU4', 'BU5', 'BU3'];
  buKeys.forEach(buKey => {
    const meta = BU_METAS[buKey] || { label: buKey, icon: '📌' };
    const kpi = kpiMap[buKey] || { budget: 0, target_leads: 0 };
    const mBudget = parseFloat(kpi.budget || 0);
    const mTargetLeads = parseInt(kpi.target_leads || 0);

    const wBudget = Math.round(mBudget / 4);
    const wTargetLeads = Math.round(mTargetLeads / 4);

    const wData = (adsByBUWeek[buKey] && adsByBUWeek[buKey][currentWeek]) || { spend: 0, messages: 0, leads: 0 };
    
    // Cumulatives for BU
    let buCumSpend = 0;
    let buCumMsg = 0;
    let buCumLeads = 0;
    for (let w = 1; w <= currentWeek; w++) {
      const d = (adsByBUWeek[buKey] && adsByBUWeek[buKey][w]) || { spend: 0, messages: 0, leads: 0 };
      buCumSpend += d.spend;
      buCumMsg += d.messages;
      buCumLeads += d.leads;
    }

    const buPacePercent = mTargetLeads > 0 ? ((buCumLeads / mTargetLeads) * 100).toFixed(1) : 0;
    const buCostPerMsg = wData.messages > 0 ? Math.round(wData.spend / wData.messages) : 0;
    const buCPLWeek = wData.leads > 0 ? Math.round(wData.spend / wData.leads) : 0;

    let funnelStatusHtml = '🟢 Đạt tiến độ';
    if (mTargetLeads > 0 && buCumLeads >= mTargetLeads) {
      funnelStatusHtml = `<span style="color: #15803d; font-weight: 800;">🚀 Vượt mục tiêu</span>`;
      alertsList.push(`🚀 <b>${buKey} (${meta.label.split(' - ')[1]}):</b> <b>Đã vượt ${buPacePercent}% chỉ tiêu cả tháng</b> (${buCumLeads} / ${mTargetLeads} Lead). Tuần ${currentWeek} đã hoàn thành sớm mục tiêu.`);
    } else if (parseFloat(buPacePercent) >= parseFloat(timeProgressPercent)) {
      funnelStatusHtml = `<span style="color: #15803d; font-weight: 700;">🟢 Vượt tiến độ</span>`;
    } else if (parseFloat(buPacePercent) >= parseFloat(timeProgressPercent) - 5) {
      funnelStatusHtml = `<span style="color: #15803d; font-weight: 700;">🟢 Đạt tiến độ</span>`;
    } else if (mTargetLeads > 0) {
      funnelStatusHtml = `<span style="color: #b91c1c; font-weight: 700;">🔴 Chậm tiến độ</span>`;
      alertsList.push(`🔴 <b>${buKey} (${meta.label.split(' - ')[1]}):</b> Chậm tiến độ nghiêm trọng — sau ${currentWeek} tuần mới đạt <b>${buCumLeads} / ${mTargetLeads} Lead (${buPacePercent}% KH Tháng)</b>. Cần tối ưu lại creative & target.`);
    } else {
      funnelStatusHtml = `<span style="color: #64748b;">⚪ Thử nghiệm</span>`;
    }

    const spendBudgetWeekStr = wBudget > 0 
      ? `${wData.spend.toLocaleString('vi-VN')} / ${wBudget.toLocaleString('vi-VN')} <span style="font-size: 11.5px; color: #64748b;">(${Math.round((wData.spend / wBudget) * 100)}%)</span>`
      : `${wData.spend.toLocaleString('vi-VN')} / -`;

    const leadTargetWeekStr = wTargetLeads > 0 
      ? `<strong>${wData.leads} / ${wTargetLeads}</strong> <span style="font-size: 11px; color: ${wData.leads >= wTargetLeads ? '#15803d' : '#b91c1c'}; font-weight: 700;">(${Math.round((wData.leads / wTargetLeads) * 100)}%)</span>`
      : `<strong>${wData.leads} / 0</strong>`;

    const leadTargetMonthStr = mTargetLeads > 0 
      ? `<strong>${buCumLeads} / ${mTargetLeads}</strong> <span style="font-size: 11.5px; color: ${parseFloat(buPacePercent) >= parseFloat(timeProgressPercent) ? '#15803d' : '#b91c1c'}; font-weight: 700;">(${buPacePercent}%)</span>`
      : `<strong>${buCumLeads} / 0</strong>`;

    buRowsHtml.push(`
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #1e3a8a; font-size: 14px;">${buKey}</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${funnelStatusHtml}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${spendBudgetWeekStr}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${wData.messages} / ${buCostPerMsg.toLocaleString('vi-VN')} đ</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${leadTargetWeekStr}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${leadTargetMonthStr}</td>
      </tr>
    `);
  });

  // Top Cards Formats
  const spendBadge = spendDeltaPercent 
    ? (parseFloat(spendDeltaPercent) >= 0 
        ? `<span style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↑ +${spendDeltaPercent}%</span>`
        : `<span style="display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↓ ${spendDeltaPercent}%</span>`)
    : '';

  const cplBadge = cplDeltaPercent 
    ? (parseFloat(cplDeltaPercent) > 0 
        ? `<span style="display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↑ +${cplDeltaPercent}%</span>`
        : `<span style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↓ ${cplDeltaPercent}%</span>`)
    : '';

  const alertsBoxHtml = alertsList.length > 0 
    ? `<div style="background: #fff1f2; border-left: 4px solid #e11d48; padding: 18px 22px; border-radius: 8px; margin-top: 25px; margin-bottom: 30px;">
        <div style="font-size: 14.5px; font-weight: 800; color: #e11d48; margin-bottom: 8px;">🚨 Cảnh Báo Phân Tích & Đánh Giá Tiến Độ</div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.65;">
          ${alertsList.map(a => `<li style="margin-bottom: 4px;">${a}</li>`).join('')}
        </ul>
      </div>`
    : `<div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 18px 22px; border-radius: 8px; margin-top: 25px; margin-bottom: 30px; color: #065f46; font-weight: 600;">
        🎉 Tuyệt vời! Tất cả các BU đang đạt và vượt tiến độ kế hoạch Tháng ${targetMonth}/${targetYear}.
      </div>`;

  // System-wide weekly rows
  const systemWeeklyRows = [];
  for (let w = 1; w <= currentWeek; w++) {
    const a = adsTotalByWeek[w] || { spend: 0, messages: 0, leads: 0 };
    const cLeads = crmTotalByWeek[w] || 0;
    const pAds = w > 1 ? adsTotalByWeek[w - 1] : null;
    const pCrm = w > 1 ? (crmTotalByWeek[w - 1] || 0) : null;

    const crmDelta = pCrm > 0 ? (((cLeads - pCrm) / pCrm) * 100).toFixed(1) : null;
    const adsDelta = pAds && pAds.spend > 0 ? (((a.spend - pAds.spend) / pAds.spend) * 100).toFixed(1) : null;
    const cplCrm = cLeads > 0 ? Math.round(a.spend / cLeads) : 0;
    const pCplCrm = pCrm > 0 ? Math.round(pAds.spend / pCrm) : 0;
    const cplCrmDelta = pCplCrm > 0 ? (((cplCrm - pCplCrm) / pCplCrm) * 100).toFixed(1) : null;

    let diagnosisHtml = '';
    if (w === 1) {
      diagnosisHtml = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #166534; line-height: 1.45;">🎯 <b>Kỳ đầu:</b> ${cLeads} Lead CRM với CPL TB ${cplCrm.toLocaleString('vi-VN')} đ/lead (${a.leads} Lead Ads).</div>`;
    } else if (parseFloat(crmDelta) < -20 && parseFloat(cplCrmDelta) > 20) {
      diagnosisHtml = `<div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #92400e; line-height: 1.45;">⚠️ <b>Chi phí/Lead (CPL) tăng cao (+${cplCrmDelta}%):</b> Khiến lượng Lead sụt giảm dù vẫn duy trì ngân sách.</div>`;
    } else if (Math.abs(parseFloat(crmDelta || 0)) <= 15) {
      diagnosisHtml = `<div style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #334155; line-height: 1.45;">⚖️ <b>Duy trì ổn định:</b> Chi phí Ads và số lượng Lead giữ vững quanh mức ${cLeads} Lead/tuần.</div>`;
    } else {
      diagnosisHtml = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #166534; line-height: 1.45;">📈 Hiệu suất tăng trưởng tích cực: Lead đạt ${cLeads} (+${crmDelta}%).</div>`;
    }

    systemWeeklyRows.push(`
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #1e3a8a;">Tuần ${w}</strong><br>
          <span style="font-size: 11px; color: #64748b;">${weekRanges[w]?.sub || ''}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="font-size: 15px;">${cLeads}</strong> 
          ${crmDelta ? `<span style="display: inline-block; background: ${parseFloat(crmDelta) >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${parseFloat(crmDelta) >= 0 ? '#15803d' : '#b91c1c'}; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${parseFloat(crmDelta) >= 0 ? '↑ +' : '↓ '}${crmDelta}%</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong>${a.spend.toLocaleString('vi-VN')} đ</strong> 
          ${adsDelta ? `<span style="display: inline-block; background: ${parseFloat(adsDelta) >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${parseFloat(adsDelta) >= 0 ? '#15803d' : '#b91c1c'}; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${parseFloat(adsDelta) >= 0 ? '↑ +' : '↓ '}${adsDelta}%</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #d97706;">${cplCrm.toLocaleString('vi-VN')} đ</strong> 
          ${cplCrmDelta ? `<span style="display: inline-block; background: ${parseFloat(cplCrmDelta) > 0 ? '#fee2e2' : '#dcfce7'}; color: ${parseFloat(cplCrmDelta) > 0 ? '#b91c1c' : '#15803d'}; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${parseFloat(cplCrmDelta) > 0 ? '↑ ' : '↓ '}${cplCrmDelta}%</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${diagnosisHtml}</td>
      </tr>
    `);
  }

  // Per BU Section Tables
  const buSectionCardsHtml = [];
  buKeys.forEach(buKey => {
    const meta = BU_METAS[buKey] || { label: buKey, icon: '📌' };
    const buWeeklyData = adsByBUWeek[buKey] || {};
    const buCrmData = crmByBUWeek[buKey] || {};

    let cumSpend = 0;
    let cumLeadsCrm = 0;
    let cumMsg = 0;
    let cumLeadAds = 0;

    const rows = [];
    for (let w = 1; w <= currentWeek; w++) {
      const a = buWeeklyData[w] || { spend: 0, messages: 0, leads: 0 };
      const cLeads = buCrmData[w] || 0;
      cumSpend += a.spend;
      cumLeadsCrm += cLeads;
      cumMsg += a.messages;
      cumLeadAds += a.leads;

      const pA = w > 1 ? (buWeeklyData[w - 1] || { spend: 0, messages: 0, leads: 0 }) : null;
      const pC = w > 1 ? (buCrmData[w - 1] || 0) : null;

      const crmDelta = pC > 0 ? (((cLeads - pC) / pC) * 100).toFixed(1) : null;
      const adsDelta = pA && pA.spend > 0 ? (((a.spend - pA.spend) / pA.spend) * 100).toFixed(1) : null;
      const cpl = cLeads > 0 ? Math.round(a.spend / cLeads) : 0;
      const pCpl = (pC > 0 && pA && pA.spend > 0) ? Math.round(pA.spend / pC) : 0;
      const cplDelta = pCpl > 0 ? (((cpl - pCpl) / pCpl) * 100).toFixed(1) : null;

      let diagnosis = '';
      if (w === 1) {
        diagnosis = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #166534;">🎯 Kỳ đầu: ${cLeads} Lead CRM với CPL ${(cpl/1000).toFixed(1)}k đ/lead.</div>`;
      } else if (parseFloat(crmDelta) > 15) {
        diagnosis = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #166534;">📈 Lead tăng +${crmDelta}% nhờ tối ưu hiệu quả và mở rộng ngân sách.</div>`;
      } else if (parseFloat(crmDelta) < -15 && parseFloat(cplDelta) > 15) {
        diagnosis = `<div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #92400e;">⚠️ CPL tăng (+${cplDelta}%) làm giảm lượng Lead CRM.</div>`;
      } else {
        diagnosis = `<div style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #334155;">Chi phí Ads và lượng Lead duy trì ổn định.</div>`;
      }

      rows.push(`
        <tr>
          <td style="padding: 11px 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #1e3a8a;">Tuần ${w}</strong> <span style="font-size: 11px; color: #64748b;">(${weekRanges[w]?.sub || ''})</span></td>
          <td style="padding: 11px 12px; border-bottom: 1px solid #e2e8f0;">
            <strong>${cLeads}</strong> 
            ${crmDelta ? `<span style="background: ${parseFloat(crmDelta) >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${parseFloat(crmDelta) >= 0 ? '#15803d' : '#b91c1c'}; font-size: 11px; font-weight: 700; padding: 2px 5px; border-radius: 4px;">${parseFloat(crmDelta) >= 0 ? '↑ +' : '↓ '}${crmDelta}%</span>` : ''}
          </td>
          <td style="padding: 11px 12px; border-bottom: 1px solid #e2e8f0;">
            <strong>${a.spend.toLocaleString('vi-VN')} đ</strong> 
            ${adsDelta ? `<span style="background: ${parseFloat(adsDelta) >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${parseFloat(adsDelta) >= 0 ? '#15803d' : '#b91c1c'}; font-size: 11px; font-weight: 700; padding: 2px 5px; border-radius: 4px;">${parseFloat(adsDelta) >= 0 ? '↑ +' : '↓ '}${adsDelta}%</span>` : ''}
          </td>
          <td style="padding: 11px 12px; border-bottom: 1px solid #e2e8f0;">
            <strong>${cpl.toLocaleString('vi-VN')} đ</strong> 
            ${cplDelta ? `<span style="background: ${parseFloat(cplDelta) > 0 ? '#fee2e2' : '#dcfce7'}; color: ${parseFloat(cplDelta) > 0 ? '#b91c1c' : '#15803d'}; font-size: 11px; font-weight: 700; padding: 2px 5px; border-radius: 4px;">${parseFloat(cplDelta) > 0 ? '↑ ' : '↓ '}${cplDelta}%</span>` : ''}
          </td>
          <td style="padding: 11px 12px; border-bottom: 1px solid #e2e8f0;">${diagnosis}</td>
        </tr>
      `);
    }

    const sharePercent = totalSpendMonth > 0 ? ((cumSpend / totalSpendMonth) * 100).toFixed(1) : 0;
    const buCplAdsAvg = cumLeadAds > 0 ? Math.round(cumSpend / cumLeadAds) : 0;
    const buCplCrmAvg = cumLeadsCrm > 0 ? Math.round(cumSpend / cumLeadsCrm) : 0;

    buSectionCardsHtml.push(`
      <div class="bu-card" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 28px; overflow: hidden;">
        <div style="padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <div style="font-size: 15.5px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
            <span>${meta.icon} ${meta.label}</span>
            <span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">Chiếm ${sharePercent}% Chi Phí Ads</span>
          </div>
        </div>
        <div style="padding: 18px 20px;">
          <table class="data-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 0;">
            <thead>
              <tr>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 18%;">Kỳ Phân Tích</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Lead CRM (Δ %)</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 20%;">Chi Phí Ads (Δ %)</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Giá / Lead</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 30%;">Chẩn Đoán & Nguyên Nhân Tự Động</th>
              </tr>
            </thead>
            <tbody>
              ${rows.join('')}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 11px 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;">LŨY KẾ ${buKey}</td>
                <td style="padding: 11px 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #15803d;">${cumLeadsCrm} Lead</td>
                <td style="padding: 11px 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #2563eb;">${cumSpend.toLocaleString('vi-VN')} đ</td>
                <td style="padding: 11px 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;">${buCplCrmAvg.toLocaleString('vi-VN')} đ</td>
                <td style="padding: 11px 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;"><b>CPL Meta Ads: ${buCplAdsAvg.toLocaleString('vi-VN')} đ | ${cumMsg} Msg</b></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `);
  });

  const fullHtml = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Marketing Ads & Biến Động Leads - Tuần ${currentWeek} Tháng ${targetMonth}/${targetYear}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 25px; color: #1e293b; }
    .email-container { max-width: 860px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    @media only screen and (max-width: 640px) {
      body { padding: 10px 5px !important; }
      .email-container { border-radius: 8px !important; }
      .content-body { padding: 18px 14px !important; }
      .top-cards-table, .top-cards-table tbody, .top-cards-table tr, .top-cards-table td { display: block !important; width: 100% !important; box-sizing: border-box !important; }
      .top-cards-table { border-spacing: 0 !important; margin: 0 0 16px 0 !important; }
      .top-card { margin-bottom: 12px !important; padding: 16px !important; }
      .data-table { font-size: 11.5px !important; }
      .data-table th, .data-table td { padding: 8px 6px !important; }
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 25px; color: #1e293b;">
  <div class="email-container" style="max-width: 860px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); color: #ffffff; padding: 28px 32px;">
      <h1 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.35;">📊 FIT TOUR ERP - BÁO CÁO MARKETING ADS & LEADS</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.92;">Kỳ tổng kết: <strong>Tuần ${currentWeek} (${currentRange?.sub || ''}) Tháng ${targetMonth}/${targetYear}</strong></p>
    </div>

    <div class="content-body" style="padding: 30px 32px;">
      
      <!-- 3 TOP SUMMARY CARDS -->
      <table class="top-cards-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-bottom: 28px;">
        <tr>
          <!-- Ô 1: Ngân sách đã chi -->
          <td class="top-card" style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">NGÂN SÁCH ĐÃ CHI (TUẦN ${currentWeek})</div>
            <div style="font-size: 21px; font-weight: 800; color: #2563eb; margin-bottom: 6px; white-space: nowrap;">
              ${currAds.spend.toLocaleString('vi-VN')} đ ${spendBadge}
            </div>
            <div style="font-size: 12.5px; color: #475569;">Đạt <strong>${currWeekTargetSpend > 0 ? ((currAds.spend / currWeekTargetSpend) * 100).toFixed(1) : 0}%</strong> KH Tuần (${currWeekTargetSpend.toLocaleString('vi-VN')} đ)</div>
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 11.5px; color: #64748b; line-height: 1.5;">
              Lũy kế tháng: <strong style="color: #0f172a;">${totalSpendMonth.toLocaleString('vi-VN')} đ</strong> (${totalBudgetMonth > 0 ? ((totalSpendMonth / totalBudgetMonth) * 100).toFixed(1) : 0}%)<br>
              Còn lại KH tháng: <strong style="color: #059669;">${Math.max(0, totalBudgetMonth - totalSpendMonth).toLocaleString('vi-VN')} đ</strong>
            </div>
          </td>

          <!-- Ô 2: Lead Meta Ads -->
          <td class="top-card" style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">LEAD META ADS (THỰC TẾ)</div>
            <div style="font-size: 21px; font-weight: 800; color: #d97706; margin-bottom: 6px; white-space: nowrap;">
              ${currAds.leads} / ${currWeekTargetLeads} <span style="font-size: 14px; font-weight: 600; color: #64748b;">(${currWeekTargetLeads > 0 ? ((currAds.leads / currWeekTargetLeads) * 100).toFixed(1) : 0}%)</span>
            </div>
            <div style="font-size: 12.5px; color: #475569;">Tin nhắn Inbox: <strong>${currAds.messages} Msg</strong> (${currAds.messages > 0 ? (Math.round(currAds.spend / currAds.messages) / 1000).toFixed(1) : 0}k/Msg)</div>
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 11.5px; color: #64748b; line-height: 1.5;">
              Lũy kế Lead Ads: <strong style="color: #d97706;">${totalLeadAdsMonth} / ${totalTargetLeadsMonth}</strong> (${totalTargetLeadsMonth > 0 ? ((totalLeadAdsMonth / totalTargetLeadsMonth) * 100).toFixed(1) : 0}%)<br>
              Tổng Tin nhắn tháng: <strong style="color: #0f172a;">${totalMsgMonth.toLocaleString('vi-VN')} Msg</strong>
            </div>
          </td>

          <!-- Ô 3: CPL Thực Tế -->
          <td class="top-card" style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">CPL THỰC TẾ (META ADS)</div>
            <div style="font-size: 21px; font-weight: 800; color: #0f172a; margin-bottom: 6px; white-space: nowrap;">
              ${currCPL.toLocaleString('vi-VN')} đ ${cplBadge}
            </div>
            <div style="font-size: 12.5px; color: #475569;">${prevWeek ? `So với Tuần ${prevWeek}: <strong>${prevCPL.toLocaleString('vi-VN')} đ</strong>` : `Tuần đầu`}</div>
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 11.5px; color: #64748b; line-height: 1.5;">
              CPL TB Tháng: <strong style="color: #2563eb;">${avgCPLMonth.toLocaleString('vi-VN')} đ</strong><br>
              Tổng Lead CRM (T${currentWeek}/Tháng): <strong style="color: #15803d;">${(crmTotalByWeek[currentWeek] || 0)} / ${totalCrmLeadsMonth}</strong>
            </div>
          </td>
        </tr>
      </table>

      <!-- CẢNH BÁO PHÂN TÍCH -->
      ${alertsBoxHtml}

      <!-- BẢNG SỐ LIỆU CHI TIẾT THEO BU -->
      <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 28px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
        <span>📌 Chi tiết theo BU & Tình Trạng Funnel</span>
        <span style="font-size: 12px; font-weight: 600; color: #64748b;">(Tiến độ thời gian T${currentWeek}: ${timeProgressPercent}%)</span>
      </div>
      
      <table class="data-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 32px;">
        <thead>
          <tr>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 8%;">BU</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 20%;">Tình trạng Funnel</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 24%;">Chi tiêu / Ngân sách (Tuần)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Tin nhắn / Giá Msg</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Leads / Target (Tuần)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Lũy Kế / KH Tháng</th>
          </tr>
        </thead>
        <tbody>
          ${buRowsHtml.join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;">TỔNG CỘNG (TUẦN ${currentWeek})</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #2563eb;">${currAds.spend.toLocaleString('vi-VN')} / ${currWeekTargetSpend.toLocaleString('vi-VN')} (${currWeekTargetSpend > 0 ? Math.round((currAds.spend / currWeekTargetSpend) * 100) : 0}%)</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;">${currAds.messages} / ${currAds.messages > 0 ? Math.round(currAds.spend / currAds.messages).toLocaleString('vi-VN') : 0} đ</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #d97706; font-size: 14px;">${currAds.leads} / ${currWeekTargetLeads} (${currWeekTargetLeads > 0 ? Math.round((currAds.leads / currWeekTargetLeads) * 100) : 0}%)</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #15803d; font-size: 14px;">${totalLeadAdsMonth} / ${totalTargetLeadsMonth} (${totalTargetLeadsMonth > 0 ? Math.round((totalLeadAdsMonth / totalTargetLeadsMonth) * 100) : 0}%)</td>
          </tr>
        </tfoot>
      </table>

      <!-- BẢNG BIẾN ĐỘNG TOÀN CÔNG TY -->
      <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 30px; margin-bottom: 14px;">
        📑 BẢNG SO SÁNH CHI TIẾT TỪNG KỲ & BIẾN ĐỘNG (TOÀN HỆ THỐNG)
      </div>
      
      <table class="data-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 32px;">
        <thead>
          <tr>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 14%;">Kỳ Phân Tích</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 15%;">Lead CRM (Δ %)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 18%;">Chi Phí Ads (Δ %)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 17%;">Giá / Lead (CPL)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 36%;">Chẩn Đoán & Nguyên Nhân Tự Động</th>
          </tr>
        </thead>
        <tbody>
          ${systemWeeklyRows.join('')}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;">LŨY KẾ THÁNG</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #15803d; font-size: 15px;">${totalCrmLeadsMonth} Lead</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #2563eb; font-size: 15px;">${totalSpendMonth.toLocaleString('vi-VN')} đ</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; font-size: 15px;">${totalCrmLeadsMonth > 0 ? Math.round(totalSpendMonth / totalCrmLeadsMonth).toLocaleString('vi-VN') : 0} đ</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;"><b>CPL Meta Ads: ${avgCPLMonth.toLocaleString('vi-VN')} đ | Giá Msg: ${totalMsgMonth > 0 ? Math.round(totalSpendMonth / totalMsgMonth).toLocaleString('vi-VN') : 0} đ</b></td>
          </tr>
        </tfoot>
      </table>

      <!-- SECTION TỪNG BU -->
      <div style="margin-top: 40px; margin-bottom: 20px; border-top: 2px solid #e2e8f0; padding-top: 25px;">
        <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 6px;">📂 BẢNG BIẾN ĐỘNG CHI TIẾT THEO TỪNG BUSINESS UNIT (BU)</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 20px;">Theo dõi tiến độ ngân sách, biến động Lead CRM và chẩn đoán hiệu suất tự động qua từng tuần.</p>
      </div>

      ${buSectionCardsHtml.join('')}

      <!-- Footer CTA -->
      <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
        <a href="https://erp.fittour.vn/marketing-ads" style="display: inline-block; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.35);">👉 Mở Bảng Điều Khiển Ads & Lead CRM</a>
      </div>

      <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.5;">
        Hệ thống FIT Tour CRM & ERP tự động tổng hợp.<br>
        Báo cáo này được gửi định kỳ tới Ban Giám Đốc và Bộ phận Marketing & Sales.
      </div>
    </div>
  </div>
</body>
</html>`;

  return {
    reportTitle: `Báo Cáo Marketing Ads - Tuần ${currentWeek} Tháng ${targetMonth}/${targetYear}`,
    html: fullHtml,
    dateString: `Tuần ${currentWeek} (${currentRange?.sub || ''}) Tháng ${targetMonth}/${targetYear}`
  };
}

module.exports = {
  getWeekRanges,
  generateMarketingAdsEmailReport
};
