const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function detailedAnalysis() {
  console.log('=== CHI TIẾT TUẦN 4 THÁNG 9/2026 THEO BU ===');
  const w4Ads = await pool.query(`
    SELECT bu_name, 
      count(*) as adset_count,
      sum(spend)::numeric as spend,
      sum(messages)::int as messages,
      sum(leads)::int as leads
    FROM marketing_ads_reports
    WHERE year=2026 AND month=9 AND week_number=4
    GROUP BY bu_name
    ORDER BY bu_name
  `);
  
  const w3Ads = await pool.query(`
    SELECT bu_name, 
      sum(spend)::numeric as spend,
      sum(messages)::int as messages,
      sum(leads)::int as leads
    FROM marketing_ads_reports
    WHERE year=2026 AND month=9 AND week_number=3
    GROUP BY bu_name
    ORDER BY bu_name
  `);
  const w3Map = {};
  w3Ads.rows.forEach(r => w3Map[r.bu_name] = r);

  const crmW4 = await pool.query(`
    WITH lead_events AS (
      SELECT bu_group, phone, 'new' as event_type, created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as evt_time
      FROM leads
      WHERE (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
      UNION ALL
      SELECT bu_group, phone, 'recontact' as event_type, last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as evt_time
      FROM leads
      WHERE (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
        AND last_contacted_at IS NOT NULL
        AND (last_contacted_at - created_at) > INTERVAL '14 days'
    )
    SELECT COALESCE(bu_group, 'Khác') as bu_name,
      COUNT(CASE WHEN phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as crm_phone,
      COUNT(CASE WHEN event_type = 'new' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as crm_new,
      COUNT(CASE WHEN event_type = 'recontact' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as crm_rec
    FROM lead_events
    WHERE evt_time >= '2026-09-21 00:00:00' AND evt_time <= '2026-09-27 23:59:59'
    GROUP BY bu_group
  `);
  const crmMap = {};
  crmW4.rows.forEach(r => crmMap[r.bu_name] = r);

  const rows = w4Ads.rows.map(r => {
    const w3 = w3Map[r.bu_name] || { spend: 0, messages: 0, leads: 0 };
    const crm = crmMap[r.bu_name] || { crm_phone: 0, crm_new: 0, crm_rec: 0 };
    const spend = parseFloat(r.spend);
    const msgs = r.messages;
    const leads = r.leads;
    const cplAds = leads > 0 ? Math.round(spend / leads) : 0;
    const cplCrm = crm.crm_phone > 0 ? Math.round(spend / crm.crm_phone) : 0;
    const w3Spend = parseFloat(w3.spend);
    const spendDiff = w3Spend > 0 ? (((spend - w3Spend)/w3Spend)*100).toFixed(1) + '%' : 'N/A';
    const leadsDiff = w3.leads > 0 ? (((leads - w3.leads)/w3.leads)*100).toFixed(1) + '%' : 'N/A';
    return {
      BU: r.bu_name,
      Adsets: r.adset_count,
      'Chi tiêu (đ)': spend.toLocaleString('vi-VN'),
      'Spend WoW': spendDiff,
      'Inbox': msgs,
      'Lead Ads': leads,
      'Leads WoW': leadsDiff,
      'CPL Ads (đ)': cplAds.toLocaleString('vi-VN'),
      'CRM Phone': `${crm.crm_phone} (${crm.crm_new}+${crm.crm_rec})`,
      'CPL CRM (đ)': cplCrm.toLocaleString('vi-VN')
    };
  });
  console.table(rows);

  console.log('\n=== LŨY KẾ THÁNG 9/2026 (HẾT TUẦN 4) SO VỚI KPI ===');
  const ads = await pool.query(`
    SELECT bu_name,
      sum(spend)::numeric as total_spend,
      sum(messages)::int as total_msgs,
      sum(leads)::int as total_leads_ads
    FROM marketing_ads_reports
    WHERE year=2026 AND month=9
    GROUP BY bu_name
    ORDER BY bu_name
  `);

  const kpis = await pool.query(`
    SELECT bu_name, budget, target_leads, target_cpl
    FROM marketing_ads_kpis
    WHERE year=2026 AND month=9
  `);
  const kpiMap = {};
  kpis.rows.forEach(k => kpiMap[k.bu_name] = k);

  const crmMonth = await pool.query(`
    WITH lead_events AS (
      SELECT bu_group, phone, 'new' as event_type, created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as evt_time
      FROM leads
      WHERE (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
      UNION ALL
      SELECT bu_group, phone, 'recontact' as event_type, last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' as evt_time
      FROM leads
      WHERE (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
        AND last_contacted_at IS NOT NULL
        AND (last_contacted_at - created_at) > INTERVAL '14 days'
    )
    SELECT COALESCE(bu_group, 'Khác') as bu_name,
      COUNT(CASE WHEN phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as crm_phone,
      COUNT(CASE WHEN event_type = 'new' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as crm_new,
      COUNT(CASE WHEN event_type = 'recontact' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as crm_rec
    FROM lead_events
    WHERE evt_time >= '2026-09-01 00:00:00' AND evt_time <= '2026-09-27 23:59:59'
    GROUP BY bu_group
  `);
  const crmMonthMap = {};
  crmMonth.rows.forEach(c => crmMonthMap[c.bu_name] = c);

  let sumSpend = 0, sumMsgs = 0, sumAdsLeads = 0, sumCrmPhone = 0, sumBudget = 0, sumTargetLeads = 0;
  
  const report = ads.rows.map(r => {
    const kpi = kpiMap[r.bu_name] || { budget: 0, target_leads: 0 };
    const c = crmMonthMap[r.bu_name] || { crm_phone: 0, crm_new: 0, crm_rec: 0 };
    const spend = parseFloat(r.total_spend);
    const msgs = r.total_msgs;
    const leadsAds = r.total_leads_ads;
    const crmPhone = c.crm_phone;
    const budget = parseFloat(kpi.budget || 0);
    const targetLeads = parseInt(kpi.target_leads || 0);

    sumSpend += spend;
    sumMsgs += msgs;
    sumAdsLeads += leadsAds;
    sumCrmPhone += crmPhone;
    sumBudget += budget;
    sumTargetLeads += targetLeads;

    return {
      BU: r.bu_name,
      'Chi tiêu MTD': spend.toLocaleString('vi-VN') + ' đ',
      'Ngân sách': budget.toLocaleString('vi-VN') + ' đ',
      '% Budget': ((spend / budget) * 100).toFixed(1) + '%',
      'Lead Ads': leadsAds,
      'CRM Phone': `${crmPhone} (${c.crm_new}+${c.crm_rec})`,
      'Target Leads': targetLeads,
      '% Lead KPI (CRM)': ((crmPhone / targetLeads) * 100).toFixed(1) + '%',
      'CPL Ads TB': Math.round(spend / leadsAds).toLocaleString('vi-VN') + ' đ',
      'CPL CRM TB': crmPhone > 0 ? Math.round(spend / crmPhone).toLocaleString('vi-VN') + ' đ' : '0 đ'
    };
  });
  console.table(report);

  console.log('--- TOÀN HỆ THỐNG THÁNG 9 (W1-W4) ---');
  console.log({
    'Tổng Chi Tiêu': sumSpend.toLocaleString('vi-VN') + ' đ',
    'Tổng Ngân Sách': sumBudget.toLocaleString('vi-VN') + ' đ',
    'Tỷ Lệ Tiêu Budget': ((sumSpend / sumBudget) * 100).toFixed(1) + '%',
    'Tổng Lead Ads Meta': sumAdsLeads,
    'Tổng Lead CRM (có SĐT)': sumCrmPhone,
    'Chỉ Tiêu KPI Lead': sumTargetLeads,
    'Tỷ Lệ Đạt KPI Lead (CRM)': ((sumCrmPhone / sumTargetLeads) * 100).toFixed(1) + '%',
    'CPL CRM TB Toàn Hệ Thống': Math.round(sumSpend / sumCrmPhone).toLocaleString('vi-VN') + ' đ'
  });

  pool.end();
}

detailedAnalysis().catch(e => { console.error(e); pool.end(); });
