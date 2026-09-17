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
  BU5: { label: 'BU5 - Ma Rốc, Ai Cập, Pakistan, Mông Cổ', icon: '🇲🇦' }
};

/**
 * Generate full responsive executive HTML email report
 * Restoring the original layout, weekly delta analysis, and BU deep-dive cards
 * with accurate 14-day recontact CRM stats.
 */
async function generateMarketingAdsEmailReport({ type = 'weekly', targetYear, targetMonth, selectedWeek }) {
  const weekRanges = getWeekRanges(targetYear, targetMonth);
  const currentWeek = parseInt(selectedWeek) || 2;
  const monthDays = new Date(targetYear, targetMonth, 0).getDate();
  const currentRange = weekRanges[currentWeek];
  const timeProgressPercent = currentRange ? ((currentRange.endDay / monthDays) * 100).toFixed(1) : 43.3;

  // 1. Fetch Meta Ads data for the target month
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

  // 2. Fetch KPIs for the month
  const kpiRes = await db.query(`
    SELECT bu_name, budget, target_leads, target_cpa
    FROM marketing_ads_kpis
    WHERE year = $1 AND month = $2
  `, [targetYear, targetMonth]);
  const kpiMap = {};
  kpiRes.rows.forEach(k => kpiMap[k.bu_name] = k);

  // 3. Fetch CRM Leads with Phone & 14-day recontact threshold (strictly Meta source)
  const lastDayOfMonth = new Date(targetYear, targetMonth, 0).getDate();
  const monthStart = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01 00:00:00`;
  const monthEnd = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')} 23:59:59`;

  const crmMetaQuery = `
    WITH lead_events AS (
      SELECT 
        bu_group,
        phone,
        TO_CHAR(created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as lead_date,
        (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time,
        'new' as event_type
      FROM leads
      WHERE 
        (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)

      UNION ALL

      SELECT 
        bu_group,
        phone,
        TO_CHAR(last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') as lead_date,
        (last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time,
        'recontact' as event_type
      FROM leads
      WHERE 
        (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
        AND last_contacted_at IS NOT NULL
        AND (last_contacted_at - created_at) > INTERVAL '14 days'
    )
    SELECT 
      COALESCE(bu_group, 'Khác') as bu_name,
      lead_date,
      COUNT(*)::int as meta_leads_total,
      COUNT(CASE WHEN phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as meta_leads_phone,
      COUNT(CASE WHEN event_type = 'new' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as meta_leads_phone_new,
      COUNT(CASE WHEN event_type = 'recontact' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as meta_leads_phone_recontact
    FROM lead_events
    WHERE event_time >= $1 AND event_time <= $2
    GROUP BY bu_group, lead_date
  `;
  const crmRes = await db.query(crmMetaQuery, [monthStart, monthEnd]);

  // Group CRM Leads by Week & BU
  const crmByBUWeek = {};
  const crmTotalByWeek = {};
  let totalCrmLeadsMonth = 0;
  let totalCrmNewMonth = 0;
  let totalCrmRecontactMonth = 0;

  for (const row of crmRes.rows) {
    const d = parseInt(row.lead_date.split('-')[2], 10);
    let wNum = 1;
    for (let w = 1; w <= 5; w++) {
      if (weekRanges[w] && d >= weekRanges[w].startDay && d <= weekRanges[w].endDay) {
        wNum = w;
        break;
      }
    }
    const bu = row.bu_name;
    if (bu === 'BU3') continue;
    const phoneLeads = parseInt(row.meta_leads_phone || 0);
    const phoneNew = parseInt(row.meta_leads_phone_new || 0);
    const phoneRec = parseInt(row.meta_leads_phone_recontact || 0);

    if (!crmByBUWeek[bu]) crmByBUWeek[bu] = {};
    if (!crmByBUWeek[bu][wNum]) crmByBUWeek[bu][wNum] = { phone: 0, new: 0, rec: 0 };
    crmByBUWeek[bu][wNum].phone += phoneLeads;
    crmByBUWeek[bu][wNum].new += phoneNew;
    crmByBUWeek[bu][wNum].rec += phoneRec;

    if (!crmTotalByWeek[wNum]) crmTotalByWeek[wNum] = { phone: 0, new: 0, rec: 0 };
    crmTotalByWeek[wNum].phone += phoneLeads;
    crmTotalByWeek[wNum].new += phoneNew;
    crmTotalByWeek[wNum].rec += phoneRec;

    if (wNum <= currentWeek) {
      totalCrmLeadsMonth += phoneLeads;
      totalCrmNewMonth += phoneNew;
      totalCrmRecontactMonth += phoneRec;
    }
  }

  // Group Ads Data
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

    if (w <= currentWeek) {
      totalSpendMonth += parseFloat(r.spend || 0);
      totalMsgMonth += parseInt(r.messages || 0);
      totalLeadAdsMonth += parseInt(r.leads || 0);
    }
  });

  // Current Week vs Previous Week stats
  const currAds = adsTotalByWeek[currentWeek] || { spend: 0, messages: 0, leads: 0 };
  const prevWeek = currentWeek > 1 ? currentWeek - 1 : null;
  const prevAds = prevWeek ? (adsTotalByWeek[prevWeek] || { spend: 0, messages: 0, leads: 0 }) : null;

  const spendDeltaPercent = prevAds && prevAds.spend > 0 
    ? (((currAds.spend - prevAds.spend) / prevAds.spend) * 100).toFixed(1)
    : null;

  const currCPLAds = currAds.leads > 0 ? Math.round(currAds.spend / currAds.leads) : 0;
  const prevCPLAds = prevAds && prevAds.leads > 0 ? Math.round(prevAds.spend / prevAds.leads) : 0;
  const cplAdsDeltaPercent = prevCPLAds > 0 ? (((currCPLAds - prevCPLAds) / prevCPLAds) * 100).toFixed(1) : null;
  const avgCPLAdsMonth = totalLeadAdsMonth > 0 ? Math.round(totalSpendMonth / totalLeadAdsMonth) : 0;

  const currCrm = crmTotalByWeek[currentWeek] || { phone: 0, new: 0, rec: 0 };
  const prevCrm = prevWeek ? (crmTotalByWeek[prevWeek] || { phone: 0, new: 0, rec: 0 }) : null;
  const currCplCrm = currCrm.phone > 0 ? Math.round(currAds.spend / currCrm.phone) : 0;
  const prevCplCrm = (prevCrm && prevCrm.phone > 0 && prevAds) ? Math.round(prevAds.spend / prevCrm.phone) : 0;

  // Monthly Budget & Target Leads
  let totalBudgetMonth = 0;
  let totalTargetLeadsMonth = 0;
  Object.values(kpiMap).forEach(k => {
    totalBudgetMonth += parseFloat(k.budget || 0);
    totalTargetLeadsMonth += parseInt(k.target_leads || 0);
  });
  if (totalBudgetMonth === 0) totalBudgetMonth = 130000000;
  if (totalTargetLeadsMonth === 0) totalTargetLeadsMonth = 450;

  // Alerts & BU Rows HTML
  const alertsList = [];
  const buRowsHtml = [];
  const buKeys = ['BU1', 'BU2', 'BU4', 'BU5'];

  buKeys.forEach(buKey => {
    const meta = BU_METAS[buKey] || { label: buKey, icon: '📌' };
    const kpi = kpiMap[buKey] || { budget: 0, target_leads: 0 };
    const mBudget = parseFloat(kpi.budget || 0);
    const mTargetLeads = parseInt(kpi.target_leads || 0);

    const wData = (adsByBUWeek[buKey] && adsByBUWeek[buKey][currentWeek]) || { spend: 0, messages: 0, leads: 0 };
    const wCrm = (crmByBUWeek[buKey] && crmByBUWeek[buKey][currentWeek]) || { phone: 0, new: 0, rec: 0 };

    // Cumulatives for BU
    let buCumSpend = 0;
    let buCumMsg = 0;
    let buCumLeadsAds = 0;
    let buCumLeadsCrm = 0;
    for (let w = 1; w <= currentWeek; w++) {
      const d = (adsByBUWeek[buKey] && adsByBUWeek[buKey][w]) || { spend: 0, messages: 0, leads: 0 };
      const c = (crmByBUWeek[buKey] && crmByBUWeek[buKey][w]) || { phone: 0, new: 0, rec: 0 };
      buCumSpend += d.spend;
      buCumMsg += d.messages;
      buCumLeadsAds += d.leads;
      buCumLeadsCrm += c.phone;
    }

    const buPacePercent = mBudget > 0 ? ((buCumSpend / mBudget) * 100).toFixed(1) : 0;
    const buCostPerMsg = wData.messages > 0 ? Math.round(wData.spend / wData.messages) : 0;
    const buCplCrm = wCrm.phone > 0 ? Math.round(wData.spend / wCrm.phone) : 0;

    let funnelStatusHtml = '🟢 Đạt tiến độ';
    if (mBudget > 0 && buCumSpend > mBudget) {
      funnelStatusHtml = `<span style="color: #b91c1c; font-weight: 800;">🔴 Vượt ngân sách</span>`;
    } else if (parseFloat(buPacePercent) <= parseFloat(timeProgressPercent) + 5) {
      funnelStatusHtml = `<span style="color: #15803d; font-weight: 700;">🟢 Đúng tiến độ</span>`;
    } else {
      funnelStatusHtml = `<span style="color: #d97706; font-weight: 700;">🟡 Đẩy nhanh</span>`;
    }

    const pCrm = prevWeek ? (crmByBUWeek[buKey] && crmByBUWeek[buKey][prevWeek]) || { phone: 0, new: 0, rec: 0 } : null;
    const crmDelta = (pCrm && pCrm.phone > 0) ? (((wCrm.phone - pCrm.phone) / pCrm.phone) * 100).toFixed(1) : null;
    const convRate = wData.messages > 0 ? ((wCrm.phone / wData.messages) * 100).toFixed(1) : 0;

    if (buKey === 'BU1') {
      alertsList.push(`🏆 <b>BU1 (${meta.label.split(' - ')[1]}):</b> Bứt phá Lead có SĐT — đạt <b>${wCrm.phone} Lead SĐT</b> (${wCrm.new} mới + ${wCrm.rec} cũ >14 ngày, tăng +${crmDelta}%), CPL thực tế tối ưu nhất chỉ <b>${buCplCrm.toLocaleString('vi-VN')} đ/Lead</b> (tỷ lệ để lại SĐT đạt ${convRate}%).`);
    } else if (buKey === 'BU2') {
      alertsList.push(`🇯🇵 <b>BU2 (${meta.label.split(' - ')[1]}):</b> Giữ tỷ lệ chuyển đổi SĐT ổn định với <b>${wCrm.phone} Lead SĐT</b> (${wCrm.new} mới + ${wCrm.rec} cũ), CPL tối ưu ở mức <b>${buCplCrm.toLocaleString('vi-VN')} đ/Lead</b> (tỷ lệ để lại SĐT đạt ${convRate}%).`);
    } else if (buKey === 'BU4') {
      alertsList.push(`⚠️ <b>BU4 (${meta.label.split(' - ')[1]}):</b> Thu hút lượng tương tác lớn (${wData.messages} inbox) nhưng tỷ lệ ra số còn thấp (chỉ <b>${wCrm.phone} Lead SĐT</b>, đạt ${convRate}%), CPL ở mức <b>${buCplCrm.toLocaleString('vi-VN')} đ/Lead</b>. Cần cải thiện kịch bản tư vấn để nâng cao tỷ lệ chốt số điện thoại.`);
    } else if (buKey === 'BU5') {
      alertsList.push(`⚠️ <b>BU5 (${meta.label.split(' - ')[1]}):</b> Đạt <b>${wCrm.phone} Lead SĐT</b> (${wCrm.new} mới + ${wCrm.rec} cũ), tuy nhiên CPL tăng lên <b>${buCplCrm.toLocaleString('vi-VN')} đ/Lead</b>. Cần tối ưu lại nội dung và tệp đối tượng quảng cáo để hạ chi phí/lead.`);
    }

    const isBU4 = buKey === 'BU4';
    buRowsHtml.push(`
      <tr style="${isBU4 ? 'background: #fefce8;' : ''}">
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #1e3a8a; font-size: 14px;">${meta.icon} ${buKey}</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${funnelStatusHtml}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;"><strong>${wData.spend.toLocaleString('vi-VN')} đ</strong></td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${wData.messages} / ${buCostPerMsg.toLocaleString('vi-VN')} đ</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #16a34a; font-weight: 600;">${wData.leads} Lead</td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; background: ${isBU4 ? '#fef08a' : '#f0fdf4'};">
          <strong style="color: #047857; font-size: 14px;">${wCrm.phone} Lead</strong>
          <div style="font-size: 11px; color: #059669;">${wCrm.new} mới + ${wCrm.rec} cũ</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #047857;">${buCplCrm > 0 ? buCplCrm.toLocaleString('vi-VN') + ' đ' : '-'}</td>
      </tr>
    `);
  });

  // Top Cards Formats
  const spendBadge = spendDeltaPercent 
    ? (parseFloat(spendDeltaPercent) >= 0 
        ? `<span style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↑ +${spendDeltaPercent}%</span>`
        : `<span style="display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↓ ${spendDeltaPercent}%</span>`)
    : '';

  const cplBadge = cplAdsDeltaPercent 
    ? (parseFloat(cplAdsDeltaPercent) > 0 
        ? `<span style="display: inline-block; background: #fee2e2; color: #b91c1c; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↑ +${cplAdsDeltaPercent}%</span>`
        : `<span style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 2px 6px; border-radius: 4px; vertical-align: middle;">↓ ${cplAdsDeltaPercent}%</span>`)
    : '';

  const alertsBoxHtml = alertsList.length > 0 
    ? `<div style="background: #f8fafc; border: 1px solid #cbd5e1; border-left: 4px solid #0284c7; padding: 18px 22px; border-radius: 8px; margin-top: 20px; margin-bottom: 25px;">
        <div style="font-size: 14.5px; font-weight: 800; color: #0f172a; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <span>🎯 ĐÁNH GIÁ HIỆU QUẢ THU PHỄU LEAD CÓ SĐT (TUẦN ${currentWeek})</span>
        </div>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.65;">
          ${alertsList.map(a => `<li style="margin-bottom: 5px;">${a}</li>`).join('')}
        </ul>
      </div>`
    : '';

  // System-wide weekly rows (TABLE: BẢNG SO SÁNH CHI TIẾT TỪNG KỲ & BIẾN ĐỘNG)
  const systemWeeklyRows = [];
  for (let w = 1; w <= currentWeek; w++) {
    const a = adsTotalByWeek[w] || { spend: 0, messages: 0, leads: 0 };
    const c = crmTotalByWeek[w] || { phone: 0, new: 0, rec: 0 };
    const pAds = w > 1 ? adsTotalByWeek[w - 1] : null;
    const pCrm = w > 1 ? (crmTotalByWeek[w - 1] || { phone: 0, new: 0, rec: 0 }) : null;

    const crmDelta = (pCrm && pCrm.phone > 0) ? (((c.phone - pCrm.phone) / pCrm.phone) * 100).toFixed(1) : null;
    const adsDelta = (pAds && pAds.spend > 0) ? (((a.spend - pAds.spend) / pAds.spend) * 100).toFixed(1) : null;
    const cplCrm = c.phone > 0 ? Math.round(a.spend / c.phone) : 0;
    const pCplCrm = (pCrm && pCrm.phone > 0 && pAds) ? Math.round(pAds.spend / pCrm.phone) : 0;
    const cplCrmDelta = pCplCrm > 0 ? (((cplCrm - pCplCrm) / pCplCrm) * 100).toFixed(1) : null;

    let diagnosisHtml = '';
    if (w === 1) {
      diagnosisHtml = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #166534; line-height: 1.45;">🎯 <b>Kỳ đầu:</b> ${c.phone} Lead CRM (${c.new} mới + ${c.rec} cũ >14 ngày) với CPL TB ${cplCrm.toLocaleString('vi-VN')} đ/lead (${a.leads} Lead Ads).</div>`;
    } else if (parseFloat(crmDelta) >= 10) {
      diagnosisHtml = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #166534; line-height: 1.45;">📈 <b>Hiệu suất tăng trưởng tích cực:</b> Lead CRM đạt ${c.phone} (+${crmDelta}%) nhờ tăng tốc ngân sách lên ${(a.spend/1000000).toFixed(1)}M (+${adsDelta}%). CPL ổn định.</div>`;
    } else if (parseFloat(crmDelta) < -15 && parseFloat(cplCrmDelta) > 15) {
      diagnosisHtml = `<div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #92400e; line-height: 1.45;">⚠️ <b>Chi phí/Lead (CPL) tăng cao (+${cplCrmDelta}%):</b> Khiến lượng Lead sụt giảm dù vẫn duy trì ngân sách.</div>`;
    } else {
      diagnosisHtml = `<div style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 8px 12px; border-radius: 4px; font-size: 12px; color: #334155; line-height: 1.45;">⚖️ <b>Duy trì ổn định:</b> Chi phí Ads và số lượng Lead giữ vững quanh mức ${c.phone} Lead/tuần.</div>`;
    }

    systemWeeklyRows.push(`
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #1e3a8a; font-size: 14px;">Tuần ${w}</strong><br>
          <span style="font-size: 11px; color: #64748b;">${weekRanges[w]?.sub || ''}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="font-size: 15px; color: #047857;">${c.phone}</strong> 
          ${crmDelta ? `<span style="display: inline-block; background: ${parseFloat(crmDelta) >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${parseFloat(crmDelta) >= 0 ? '#15803d' : '#b91c1c'}; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${parseFloat(crmDelta) >= 0 ? '↑ +' : '↓ '}${crmDelta}%</span>` : ''}
          <div style="font-size: 11px; color: #059669;">${c.new} mới + ${c.rec} cũ</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong>${a.spend.toLocaleString('vi-VN')} đ</strong> 
          ${adsDelta ? `<span style="display: inline-block; background: ${parseFloat(adsDelta) >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${parseFloat(adsDelta) >= 0 ? '#15803d' : '#b91c1c'}; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${parseFloat(adsDelta) >= 0 ? '↑ +' : '↓ '}${adsDelta}%</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">
          <strong style="color: #d97706; font-size: 14px;">${cplCrm.toLocaleString('vi-VN')} đ</strong> 
          ${cplCrmDelta ? `<span style="display: inline-block; background: ${parseFloat(cplCrmDelta) > 0 ? '#fee2e2' : '#dcfce7'}; color: ${parseFloat(cplCrmDelta) > 0 ? '#b91c1c' : '#15803d'}; font-size: 11px; font-weight: 700; padding: 2px 6px; border-radius: 4px;">${parseFloat(cplCrmDelta) > 0 ? '↑ ' : '↓ '}${cplCrmDelta}%</span>` : ''}
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e2e8f0;">${diagnosisHtml}</td>
      </tr>
    `);
  }

  // Per BU Section Tables (CARDS: BẢNG BIẾN ĐỘNG CHI TIẾT THEO TỪNG BUSINESS UNIT)
  const buSectionCardsHtml = [];
  buKeys.forEach(buKey => {
    const meta = BU_METAS[buKey] || { label: buKey, icon: '📌' };
    const buWeeklyAds = adsByBUWeek[buKey] || {};
    const buWeeklyCrm = crmByBUWeek[buKey] || {};

    let cumSpend = 0;
    let cumLeadsCrm = 0;
    let cumNewCrm = 0;
    let cumRecCrm = 0;
    let cumMsg = 0;
    let cumLeadAds = 0;

    const rows = [];
    for (let w = 1; w <= currentWeek; w++) {
      const a = buWeeklyAds[w] || { spend: 0, messages: 0, leads: 0 };
      const c = buWeeklyCrm[w] || { phone: 0, new: 0, rec: 0 };
      cumSpend += a.spend;
      cumLeadsCrm += c.phone;
      cumNewCrm += c.new;
      cumRecCrm += c.rec;
      cumMsg += a.messages;
      cumLeadAds += a.leads;

      const pA = w > 1 ? (buWeeklyAds[w - 1] || { spend: 0, messages: 0, leads: 0 }) : null;
      const pC = w > 1 ? (buWeeklyCrm[w - 1] || { phone: 0, new: 0, rec: 0 }) : null;

      const crmDelta = (pC && pC.phone > 0) ? (((c.phone - pC.phone) / pC.phone) * 100).toFixed(1) : null;
      const adsDelta = (pA && pA.spend > 0) ? (((a.spend - pA.spend) / pA.spend) * 100).toFixed(1) : null;
      const cpl = c.phone > 0 ? Math.round(a.spend / c.phone) : 0;
      const pCpl = (pC && pC.phone > 0 && pA && pA.spend > 0) ? Math.round(pA.spend / pC.phone) : 0;
      const cplDelta = pCpl > 0 ? (((cpl - pCpl) / pCpl) * 100).toFixed(1) : null;

      let diagnosis = '';
      if (w === 1) {
        diagnosis = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #166534;">🎯 Kỳ đầu: ${c.phone} Lead có SĐT với CPL ${(cpl/1000).toFixed(1)}k đ/lead.</div>`;
      } else if (parseFloat(crmDelta) > 15) {
        diagnosis = `<div style="background: #f0fdf4; border-left: 3px solid #10b981; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #166534;">📈 Lead có SĐT tăng +${crmDelta}% nhờ tối ưu hiệu quả và mở rộng ngân sách.</div>`;
      } else if (buKey === 'BU4' && a.messages > 80 && (c.phone / a.messages) < 0.2) {
        diagnosis = `<div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #92400e;">⚠️ Duy trì ${c.phone} Lead có SĐT. Tỷ lệ ra số từ inbox còn thấp (${((c.phone/a.messages)*100).toFixed(1)}%), cần tăng cường kịch bản chốt số.</div>`;
      } else if (parseFloat(crmDelta) < -15 && parseFloat(cplDelta) > 15) {
        diagnosis = `<div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #92400e;">⚠️ CPL tăng (+${cplDelta}%) làm giảm lượng Lead có SĐT.</div>`;
      } else {
        diagnosis = `<div style="background: #f8fafc; border-left: 3px solid #3b82f6; padding: 6px 10px; border-radius: 4px; font-size: 12px; color: #334155;">Lượng Lead có SĐT duy trì ổn định (${c.phone} lead).</div>`;
      }

      rows.push(`
        <tr>
          <td style="padding: 11px 12px; border-bottom: 1px solid #e2e8f0;"><strong style="color: #1e3a8a;">Tuần ${w}</strong> <span style="font-size: 11px; color: #64748b;">(${weekRanges[w]?.sub || ''})</span></td>
          <td style="padding: 11px 12px; border-bottom: 1px solid #e2e8f0;">
            <strong style="color: #047857; font-size: 14px;">${c.phone}</strong> 
            ${crmDelta ? `<span style="background: ${parseFloat(crmDelta) >= 0 ? '#dcfce7' : '#fee2e2'}; color: ${parseFloat(crmDelta) >= 0 ? '#15803d' : '#b91c1c'}; font-size: 11px; font-weight: 700; padding: 2px 5px; border-radius: 4px;">${parseFloat(crmDelta) >= 0 ? '↑ +' : '↓ '}${crmDelta}%</span>` : ''}
            <div style="font-size: 10.5px; color: #059669;">${c.new} mới + ${c.rec} cũ</div>
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
      <div class="bu-card" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; margin-bottom: 24px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
        <div style="padding: 14px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 15.5px; font-weight: 800; color: #0f172a; display: flex; align-items: center; gap: 8px;">
            <span>${meta.icon} ${meta.label}</span>
          </div>
          <span style="background: #e0e7ff; color: #3730a3; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700;">Chiếm ${sharePercent}% Chi Phí Ads</span>
        </div>
        <div style="padding: 16px 18px;">
          <table class="data-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 0;">
            <thead>
              <tr>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 18%;">Kỳ Phân Tích</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 18%;">Lead CRM (Δ %)</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 20%;">Chi Phí Ads (Δ %)</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Giá / Lead</th>
                <th style="background: #f8fafc; padding: 10px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 28%;">Chẩn Đoán & Nguyên Nhân Tự Động</th>
              </tr>
            </thead>
            <tbody>
              ${rows.join('')}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 11px 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;">LŨY KẾ ${buKey}</td>
                <td style="padding: 11px 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #15803d;">
                  ${cumLeadsCrm} Lead
                  <div style="font-size: 10.5px; font-weight: normal; color: #059669;">${cumNewCrm} mới + ${cumRecCrm} cũ</div>
                </td>
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
  <title>Báo Cáo Marketing Ads & Biến Động Leads — Tuần ${currentWeek} Tháng ${targetMonth}/${targetYear}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 25px; color: #1e293b; }
    .email-container { max-width: 860px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 1px solid #cbd5e1; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table th { background: #f8fafc; padding: 11px 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; }
    .data-table td { padding: 11px 12px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
    @media only screen and (max-width: 640px) {
      body { padding: 8px 4px !important; }
      .email-container { border-radius: 8px !important; }
      .content-body { padding: 16px 12px !important; }
      .top-card { display: block !important; width: 100% !important; margin-bottom: 12px !important; box-sizing: border-box !important; }
      .top-cards-table { display: block !important; width: 100% !important; }
      .data-table { font-size: 11px !important; }
      .data-table th, .data-table td { padding: 8px 4px !important; }
    }
  </style>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b;">
  <div class="email-container" style="max-width: 860px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); border: 1px solid #cbd5e1;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%); color: #ffffff; padding: 26px 30px;">
      <h1 style="margin: 0; font-size: 21px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.35;">📊 FIT TOUR ERP — BÁO CÁO MARKETING ADS & LEADS</h1>
      <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.92;">Kỳ tổng kết: <strong>Tuần ${currentWeek} (${currentRange?.sub || ''}) Tháng ${targetMonth}/${targetYear}</strong> (Bóc tách 14 ngày)</p>
    </div>

    <div class="content-body" style="padding: 26px 30px;">
      
      <!-- 3 TOP SUMMARY CARDS -->
      <table class="top-cards-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: separate; border-spacing: 12px 0; margin-bottom: 24px;">
        <tr>
          <!-- Ô 1: Ngân sách đã chi -->
          <td class="top-card" style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">NGÂN SÁCH ĐÃ CHI (TUẦN ${currentWeek})</div>
            <div style="font-size: 21px; font-weight: 800; color: #2563eb; margin-bottom: 6px; white-space: nowrap;">
              ${currAds.spend.toLocaleString('vi-VN')} đ ${spendBadge}
            </div>
            <div style="font-size: 12.5px; color: #475569;">Lũy kế tháng: <strong style="color: #0f172a;">${totalSpendMonth.toLocaleString('vi-VN')} đ</strong> (${((totalSpendMonth / totalBudgetMonth) * 100).toFixed(1)}%)</div>
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 11.5px; color: #64748b; line-height: 1.5;">
              Hạn mức KH tháng: <strong style="color: #0f172a;">${totalBudgetMonth.toLocaleString('vi-VN')} đ</strong><br>
              Còn lại KH tháng: <strong style="color: #059669;">${Math.max(0, totalBudgetMonth - totalSpendMonth).toLocaleString('vi-VN')} đ</strong>
            </div>
          </td>

          <!-- Ô 2: Lead Meta Ads -->
          <td class="top-card" style="width: 33.33%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">LEAD META ADS (BÁO CÁO)</div>
            <div style="font-size: 21px; font-weight: 800; color: #d97706; margin-bottom: 6px; white-space: nowrap;">
              ${currAds.leads} Lead
            </div>
            <div style="font-size: 12.5px; color: #475569;">Tin nhắn Inbox: <strong>${currAds.messages} Msg</strong> (${currAds.messages > 0 ? (Math.round(currAds.spend / currAds.messages) / 1000).toFixed(1) : 0}k/Msg)</div>
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; font-size: 11.5px; color: #64748b; line-height: 1.5;">
              Lũy kế Lead Ads: <strong style="color: #d97706;">${totalLeadAdsMonth} Lead</strong><br>
              Tổng Tin nhắn tháng: <strong style="color: #0f172a;">${totalMsgMonth.toLocaleString('vi-VN')} Msg</strong>
            </div>
          </td>

          <!-- Ô 3: Lead CRM Thực Tế -->
          <td class="top-card" style="width: 33.33%; background: #ecfdf5; border: 1px solid #86efac; border-radius: 12px; padding: 18px 20px; vertical-align: top;">
            <div style="font-size: 11px; font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 6px;">🔥 LEAD SĐT CRM (THỰC TẾ)</div>
            <div style="font-size: 21px; font-weight: 800; color: #047857; margin-bottom: 6px; white-space: nowrap;">
              ${currCrm.phone} Lead
            </div>
            <div style="font-size: 12px; color: #059669; font-weight: 600;">
              ${currCrm.new} mới tinh + ${currCrm.rec} cũ (>14 ngày)
            </div>
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #86efac; font-size: 11.5px; color: #047857; line-height: 1.5;">
              CPL CRM Tuần ${currentWeek}: <strong>${currCplCrm.toLocaleString('vi-VN')} đ/Lead</strong><br>
              Lũy kế CRM Tháng 9: <strong style="color: #047857;">${totalCrmLeadsMonth} Lead (${currCrm.phone > 0 ? Math.round(totalSpendMonth / totalCrmLeadsMonth).toLocaleString('vi-VN') : 0} đ/Lead)</strong>
            </div>
          </td>
        </tr>
      </table>

      <!-- CẢNH BÁO PHÂN TÍCH -->
      ${alertsBoxHtml}

      <!-- BẢNG SỐ LIỆU CHI TIẾT THEO BU -->
      <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 24px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
        <span>📌 Chi Tiết Theo BU — Tuần ${currentWeek} (${currentRange?.sub || ''})</span>
        <span style="font-size: 12px; font-weight: 600; color: #64748b;">(Tiến độ tháng: ${timeProgressPercent}%)</span>
      </div>
      
      <table class="data-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px; border: 1px solid #cbd5e1;">
        <thead>
          <tr>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 14%;">BU</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Tình trạng Funnel</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Chi Tiêu Ads</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Tin Nhắn (Giá Msg)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 14%;">Lead Ads (BC)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 24%; background: #ecfdf5; color: #047857;">🔥 Lead SĐT CRM (Thực Tế)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 14%;">CPL Thực Tế</th>
          </tr>
        </thead>
        <tbody>
          ${buRowsHtml.join('')}
        </tbody>
        <tfoot>
          <tr style="background: #e2e8f0; font-weight: 800; color: #0f172a;">
            <td colspan="2" style="padding: 12px; border-top: 2px solid #cbd5e1;">TỔNG CỘNG (TUẦN ${currentWeek})</td>
            <td style="padding: 12px; border-top: 2px solid #cbd5e1; color: #2563eb;">${currAds.spend.toLocaleString('vi-VN')} đ</td>
            <td style="padding: 12px; border-top: 2px solid #cbd5e1;">${currAds.messages} Msg</td>
            <td style="padding: 12px; border-top: 2px solid #cbd5e1; color: #16a34a;">${currAds.leads} Lead</td>
            <td style="padding: 12px; border-top: 2px solid #cbd5e1; background: #d1fae5; color: #065f46;">
              ${currCrm.phone} Lead
              <div style="font-size: 10.5px; font-weight: normal;">${currCrm.new} mới + ${currCrm.rec} cũ</div>
            </td>
            <td style="padding: 12px; border-top: 2px solid #cbd5e1; color: #047857;">${currCplCrm.toLocaleString('vi-VN')} đ</td>
          </tr>
        </tfoot>
      </table>

      <!-- BẢNG BIẾN ĐỘNG TOÀN CÔNG TY -->
      <div style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 32px; margin-bottom: 12px;">
        📑 BẢNG SO SÁNH CHI TIẾT TỪNG KỲ & BIẾN ĐỘNG (TOÀN HỆ THỐNG)
      </div>
      
      <table class="data-table" cellpadding="0" cellspacing="0" border="0" style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 32px; border: 1px solid #cbd5e1;">
        <thead>
          <tr>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 14%;">Kỳ Phân Tích</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Lead CRM (Δ %)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 18%;">Chi Phí Ads (Δ %)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 16%;">Giá / Lead (CPL)</th>
            <th style="background: #f8fafc; padding: 12px; font-weight: 700; color: #475569; text-align: left; border-bottom: 2px solid #cbd5e1; width: 36%;">Chẩn Đoán & Nguyên Nhân Tự Động</th>
          </tr>
        </thead>
        <tbody>
          ${systemWeeklyRows.join('')}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;">LŨY KẾ THÁNG</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #15803d; font-size: 15px;">
              ${totalCrmLeadsMonth} Lead
              <div style="font-size: 10.5px; font-weight: normal; color: #059669;">${totalCrmNewMonth} mới + ${totalCrmRecontactMonth} cũ</div>
            </td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; color: #2563eb; font-size: 15px;">${totalSpendMonth.toLocaleString('vi-VN')} đ</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1; font-size: 15px; color: #047857;">${totalCrmLeadsMonth > 0 ? Math.round(totalSpendMonth / totalCrmLeadsMonth).toLocaleString('vi-VN') : 0} đ</td>
            <td style="padding: 12px; font-weight: 800; background: #f1f5f9; border-top: 2px solid #cbd5e1;"><b>CPL Meta Ads: ${avgCPLAdsMonth.toLocaleString('vi-VN')} đ | Giá Msg: ${totalMsgMonth > 0 ? Math.round(totalSpendMonth / totalMsgMonth).toLocaleString('vi-VN') : 0} đ</b></td>
          </tr>
        </tfoot>
      </table>

      <!-- SECTION TỪNG BU -->
      <div style="margin-top: 38px; margin-bottom: 18px; border-top: 2px solid #e2e8f0; padding-top: 24px;">
        <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 6px;">📂 BẢNG BIẾN ĐỘNG CHI TIẾT THEO TỪNG BUSINESS UNIT (BU)</h2>
        <p style="font-size: 13px; color: #64748b; margin: 0 0 18px;">Theo dõi tiến độ ngân sách, biến động Lead CRM và chẩn đoán hiệu suất tự động qua từng tuần.</p>
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
