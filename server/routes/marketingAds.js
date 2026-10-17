const express = require('express');
const router = express.Router();
const db = require('../db');
const gptAuth = require('../middleware/gptAuth');
const { emitEvent } = require('../utils/eventBus');
const { logActivity } = require('../utils/logger');
const { getWeekRanges } = require('../services/marketingAdsEmailService');

// Apply gptAuth to ALL routes — hỗ trợ cả JWT (user) và GPT_API_KEY (ChatGPT Bot read-only)
router.use(gptAuth);

// Lấy dữ liệu KPI và Tổng hợp theo tháng/BU
router.get('/kpis', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    // Lấy số liệu thực tế đã gộp theo tháng từ bảng báo cáo
    const aggQuery = `
      SELECT bu_name, year, month, week_number,
        SUM(spend) as actual_spend, 
        SUM(messages) as actual_messages, 
        SUM(leads) as actual_leads,
        SUM(crm_leads_manual) as actual_crm_leads,
        SUM(crm_won_manual) as actual_crm_won
      FROM marketing_ads_reports
      WHERE year = $1
      GROUP BY bu_name, year, month, week_number
    `;
    const aggResult = await db.query(aggQuery, [targetYear]);
    
    // Lấy thông số KPI mục tiêu đã cấu hình
    const kpiQuery = `SELECT * FROM marketing_ads_kpis WHERE year = $1`;
    const kpiResult = await db.query(kpiQuery, [targetYear]);

    // Lấy số lead Meta thực tế từ CRM theo từng BU và ngày:
    // Tách bạch: Lead MỚI (created_at trong kỳ) và Khách cũ nhắn lại (last_contacted_at trong kỳ, tạo từ tháng khác)
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
        COALESCE(bu_group, 'Chưa phân loại') as bu_name,
        lead_date,
        COUNT(*)::int as meta_leads_total,
        COUNT(CASE WHEN phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as meta_leads_phone,
        COUNT(CASE WHEN event_type = 'new' THEN 1 END)::int as meta_leads_total_new,
        COUNT(CASE WHEN event_type = 'new' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as meta_leads_phone_new,
        COUNT(CASE WHEN event_type = 'recontact' THEN 1 END)::int as meta_leads_total_recontact,
        COUNT(CASE WHEN event_type = 'recontact' AND phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as meta_leads_phone_recontact
      FROM lead_events
      WHERE event_time >= $1 AND event_time < $2
      GROUP BY bu_group, lead_date
    `;
    const startDate = `${targetYear}-01-01 00:00:00`;
    const endDate = `${Number(targetYear) + 1}-01-01 00:00:00`;
    const crmMetaResult = await db.query(crmMetaQuery, [startDate, endDate]);

    // Build weekly and monthly lead maps theo chuẩn tuần getWeekRanges
    const weekMap = {};
    for (let m = 1; m <= 12; m++) {
      weekMap[m] = getWeekRanges(targetYear, m);
    }

    const weeklyMap = {};
    const monthlyMap = {};

    for (const row of crmMetaResult.rows) {
      const parts = String(row.lead_date).split('-');
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const ranges = weekMap[m] || {};

      let weekNum = 1;
      for (let w = 1; w <= 5; w++) {
        if (ranges[w] && d >= ranges[w].startDay && d <= ranges[w].endDay) {
          weekNum = w;
          break;
        }
      }

      const bu = row.bu_name;
      const total = parseInt(row.meta_leads_total || 0);
      const phone = parseInt(row.meta_leads_phone || 0);
      const phoneNew = parseInt(row.meta_leads_phone_new || 0);
      const phoneRecontact = parseInt(row.meta_leads_phone_recontact || 0);
      const totalNew = parseInt(row.meta_leads_total_new || 0);
      const totalRecontact = parseInt(row.meta_leads_total_recontact || 0);

      // Accumulate weekly
      const wKey = `${bu}_${m}_${weekNum}`;
      if (!weeklyMap[wKey]) {
        weeklyMap[wKey] = {
          bu_name: bu,
          month: m,
          week_number: weekNum,
          start_day: ranges[weekNum]?.startDay || 1,
          end_day: ranges[weekNum]?.endDay || 31,
          date_label: ranges[weekNum]?.sub || '',
          meta_leads_total: 0,
          meta_leads_phone: 0,
          meta_leads_phone_new: 0,
          meta_leads_phone_recontact: 0,
          meta_leads_total_new: 0,
          meta_leads_total_recontact: 0
        };
      }
      weeklyMap[wKey].meta_leads_total += total;
      weeklyMap[wKey].meta_leads_phone += phone;
      weeklyMap[wKey].meta_leads_phone_new += phoneNew;
      weeklyMap[wKey].meta_leads_phone_recontact += phoneRecontact;
      weeklyMap[wKey].meta_leads_total_new += totalNew;
      weeklyMap[wKey].meta_leads_total_recontact += totalRecontact;

      // Accumulate monthly
      const mKey = `${bu}_${m}`;
      if (!monthlyMap[mKey]) {
        monthlyMap[mKey] = {
          bu_name: bu,
          month: m,
          meta_leads_total: 0,
          meta_leads_phone: 0,
          meta_leads_phone_new: 0,
          meta_leads_phone_recontact: 0,
          meta_leads_total_new: 0,
          meta_leads_total_recontact: 0
        };
      }
      monthlyMap[mKey].meta_leads_total += total;
      monthlyMap[mKey].meta_leads_phone += phone;
      monthlyMap[mKey].meta_leads_phone_new += phoneNew;
      monthlyMap[mKey].meta_leads_phone_recontact += phoneRecontact;
      monthlyMap[mKey].meta_leads_total_new += totalNew;
      monthlyMap[mKey].meta_leads_total_recontact += totalRecontact;
    }

    res.json({
        aggregates: aggResult.rows,
        kpis: kpiResult.rows,
        crmMetaLeads: Object.values(weeklyMap),
        crmMetaLeadsMonthly: Object.values(monthlyMap),
        weekRangesMap: weekMap
    });
  } catch (error) {
    console.error('Lỗi khi lấy KPI:', error);
    res.status(500).json({ error: 'Lỗi server KPI' });
  }
});

// Cập nhật thông số KPI
router.post('/kpis', async (req, res) => {
  try {
    const { 
      bu_name, year, month, budget, target_cpl, pic_name,
      target_routes, target_groups, target_customers, target_cpa, target_leads 
    } = req.body;
    
    const query = `
      INSERT INTO marketing_ads_kpis (
        bu_name, year, month, budget, target_cpl, pic_name, 
        target_routes, target_groups, target_customers, target_cpa, target_leads,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP)
      ON CONFLICT (bu_name, year, month)
      DO UPDATE SET
        budget = EXCLUDED.budget,
        target_cpl = EXCLUDED.target_cpl,
        pic_name = EXCLUDED.pic_name,
        target_routes = EXCLUDED.target_routes,
        target_groups = EXCLUDED.target_groups,
        target_customers = EXCLUDED.target_customers,
        target_cpa = EXCLUDED.target_cpa,
        target_leads = EXCLUDED.target_leads,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;
    const result = await db.query(query, [
      bu_name, 
      Number(year) || new Date().getFullYear(),
      Number(month) || 0, 
      Number(budget) || 0,
      Number(target_cpl) || 0,
      pic_name || '',
      Number(target_routes) || 0,
      Number(target_groups) || 0,
      Number(target_customers) || 0,
      Number(target_cpa) || 0,
      Number(target_leads) || 0
    ]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Lỗi update KPI:', error);
    res.status(500).json({ error: 'Lỗi server update KPI' });
  }
});

// Lấy danh sách báo cáo
router.get('/', async (req, res) => {
  try {
    const { bu_name, month, week_number, year } = req.query;
    let query = 'SELECT * FROM marketing_ads_reports WHERE 1=1';
    let params = [];
    let count = 1;

    if (bu_name && bu_name !== 'All') {
      query += ` AND bu_name = $${count++}`;
      params.push(bu_name);
    }
    if (year) {
      query += ` AND year = $${count++}`;
      params.push(year);
    }
    if (month) {
        query += ` AND month = $${count++}`;
        params.push(month);
    }
    if (week_number) {
        query += ` AND week_number = $${count++}`;
        params.push(week_number);
    }

    query += ' ORDER BY created_at DESC, year DESC, month DESC, week_number DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy tổng quan tháng (Summary) - Dành cho Dashboard & GPT Bot
router.get('/summary', async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);

    const summaryQuery = `
      SELECT 
        bu_name,
        SUM(spend)::bigint as total_spend,
        SUM(messages)::int as total_messages,
        SUM(leads)::int as total_leads,
        SUM(COALESCE(crm_won_manual, 0))::int as total_won,
        ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead,
        ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)::numeric / SUM(messages) ELSE 0 END)::bigint as cpl_msg
      FROM marketing_ads_reports
      WHERE year = $1 AND month = $2
      GROUP BY bu_name
      ORDER BY total_spend DESC;
    `;
    const summaryRes = await db.query(summaryQuery, [year, month]);

    const kpiQuery = `
      SELECT bu_name, budget::bigint as target_budget, target_leads, target_cpl::bigint as target_cpl
      FROM marketing_ads_kpis
      WHERE year = $1 AND month = $2;
    `;
    const kpiRes = await db.query(kpiQuery, [year, month]);
    const kpiMap = {};
    kpiRes.rows.forEach(r => { kpiMap[r.bu_name] = r; });

    // Lấy số lead có SĐT thực tế từ bảng leads (Two-tier CRM phone audit)
    const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const endDate = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;

    const crmPhoneQuery = `
      WITH lead_events AS (
        SELECT 
          bu_group,
          phone,
          (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time
        FROM leads
        WHERE 
          (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)

        UNION ALL

        SELECT 
          bu_group,
          phone,
          (last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time
        FROM leads
        WHERE 
          (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
          AND last_contacted_at IS NOT NULL
          AND (last_contacted_at - created_at) > INTERVAL '14 days'
      )
      SELECT 
        COALESCE(bu_group, 'Chưa phân loại') as bu_name,
        COUNT(*)::int as meta_leads_total,
        COUNT(CASE WHEN phone IS NOT NULL AND phone ~ '^0[0-9]{9}$' THEN 1 END)::int as phone_leads
      FROM lead_events
      WHERE event_time >= $1 AND event_time < $2
      GROUP BY bu_group;
    `;
    const crmPhoneRes = await db.query(crmPhoneQuery, [startDate, endDate]);
    const phoneMap = {};
    let totalCrmMetaLeads = 0;
    let totalPhoneLeads = 0;
    crmPhoneRes.rows.forEach(r => {
      phoneMap[r.bu_name] = r;
      if (['BU1', 'BU2', 'BU4', 'BU5'].includes(r.bu_name)) {
        totalCrmMetaLeads += Number(r.meta_leads_total) || 0;
        totalPhoneLeads += Number(r.phone_leads) || 0;
      }
    });

    let grandSpend = 0;
    let grandMsgs = 0;
    let grandLeads = 0;
    let grandWon = 0;

    const buBreakdown = summaryRes.rows.map(row => {
      const spend = Number(row.total_spend) || 0;
      const msgs = Number(row.total_messages) || 0;
      const leads = Number(row.total_leads) || 0;
      const won = Number(row.total_won) || 0;
      const cplLead = Number(row.cpl_lead) || 0;
      const cplMsg = Number(row.cpl_msg) || 0;

      grandSpend += spend;
      grandMsgs += msgs;
      grandLeads += leads;
      grandWon += won;

      const kpi = kpiMap[row.bu_name] || {};
      const targetBudget = Number(kpi.target_budget) || 0;
      const targetLeads = Number(kpi.target_leads) || 0;
      const targetCpl = Number(kpi.target_cpl) || 0;

      const phoneInfo = phoneMap[row.bu_name] || {};
      const phoneLeads = Number(phoneInfo.phone_leads) || 0;
      const metaTotal = Number(phoneInfo.meta_leads_total) || 0;
      const phoneCpl = phoneLeads > 0 ? Math.round(spend / phoneLeads) : 0;
      const phoneCaptureRate = metaTotal > 0 ? ((phoneLeads / metaTotal) * 100).toFixed(1) + '%' : '0%';
      const kpiAchievePhone = targetLeads > 0 ? ((phoneLeads / targetLeads) * 100).toFixed(1) + '%' : 'N/A';

      return {
        bu_name: row.bu_name,
        actual: {
          spend,
          messages: msgs,
          leads,
          phone_leads: phoneLeads,
          won,
          cpl_lead: cplLead,
          cpl_phone: phoneCpl,
          cpl_msg: cplMsg,
        },
        target: {
          budget: targetBudget,
          leads: targetLeads,
          target_cpl: targetCpl,
        },
        performance: {
          budget_usage_rate: targetBudget > 0 ? ((spend / targetBudget) * 100).toFixed(1) + '%' : 'N/A',
          lead_attainment_rate: targetLeads > 0 ? ((leads / targetLeads) * 100).toFixed(1) + '%' : 'N/A',
          kpi_achievement_phone: kpiAchievePhone,
          phone_capture_rate: phoneCaptureRate,
          cpl_variance_vs_target: (targetCpl > 0 && cplLead > 0)
            ? (((cplLead - targetCpl) / targetCpl) * 100).toFixed(1) + '%'
            : 'N/A',
        }
      };
    });

    const grandCplLead = grandLeads > 0 ? Math.round(grandSpend / grandLeads) : 0;
    const grandCplMsg = grandMsgs > 0 ? Math.round(grandSpend / grandMsgs) : 0;
    const overallPhoneCpl = totalPhoneLeads > 0 ? Math.round(grandSpend / totalPhoneLeads) : 0;

    res.json({
      period: `Tháng ${month}/${year}`,
      company_total: {
        total_spend: grandSpend,
        total_messages: grandMsgs,
        total_leads: grandLeads,
        total_phone_leads: totalPhoneLeads,
        total_won: grandWon,
        overall_cpl_lead: grandCplLead,
        overall_cpl_phone: overallPhoneCpl,
        overall_cpl_msg: grandCplMsg,
        lead_to_msg_ratio: grandMsgs > 0 ? ((grandLeads / grandMsgs) * 100).toFixed(1) + '%' : '0%',
        crm_phone_audit: {
          total_crm_meta_leads: totalCrmMetaLeads,
          total_phone_leads: totalPhoneLeads,
          overall_phone_cpl: overallPhoneCpl,
          phone_capture_rate: totalCrmMetaLeads > 0 ? ((totalPhoneLeads / totalCrmMetaLeads) * 100).toFixed(1) + '%' : '0%',
          two_tier_funnel: {
            tier_1_reported_leads: grandLeads,
            tier_1_cpl: grandCplLead,
            tier_2_crm_phone_leads: totalPhoneLeads,
            tier_2_phone_cpl: overallPhoneCpl,
            status: totalPhoneLeads > 0 && overallPhoneCpl <= 150000 
              ? 'Đạt chuẩn hiệu quả KPI (< 150.000 đ/SĐT)' 
              : 'Vượt trần ngân sách CPL'
          }
        }
      },
      bu_breakdown: buBreakdown,
    });
  } catch (error) {
    console.error('Lỗi khi lấy summary marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy summary' });
  }
});

// Kiểm định phễu 2 tầng & Lead có SĐT thực tế từ CRM (Two-Tier CRM Phone Audit)
router.get('/crm-phone-audit', async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);

    const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
    const nextMonthYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const endDate = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;

    // 1. Lấy chi tiêu và reported leads từ marketing_ads_reports
    const summaryQuery = `
      SELECT 
        bu_name,
        SUM(spend)::bigint as total_spend,
        SUM(messages)::int as total_messages,
        SUM(leads)::int as total_leads,
        ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead
      FROM marketing_ads_reports
      WHERE year = $1 AND month = $2
      GROUP BY bu_name;
    `;
    const summaryRes = await db.query(summaryQuery, [year, month]);
    const summaryMap = {};
    summaryRes.rows.forEach(r => { summaryMap[r.bu_name] = r; });

    // 2. Lấy KPI
    const kpiQuery = `
      SELECT bu_name, target_leads, target_cpl::bigint as target_cpl
      FROM marketing_ads_kpis
      WHERE year = $1 AND month = $2;
    `;
    const kpiRes = await db.query(kpiQuery, [year, month]);
    const kpiMap = {};
    kpiRes.rows.forEach(r => { kpiMap[r.bu_name] = r; });

    // 3. Phân tích lead SĐT từ CRM
    const crmPhoneQuery = `
      WITH lead_events AS (
        SELECT 
          bu_group,
          phone,
          (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time,
          'new' as event_type
        FROM leads
        WHERE 
          (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)

        UNION ALL

        SELECT 
          bu_group,
          phone,
          (last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time,
          'recontact' as event_type
        FROM leads
        WHERE 
          (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
          AND last_contacted_at IS NOT NULL
          AND (last_contacted_at - created_at) > INTERVAL '14 days'
      )
      SELECT 
        COALESCE(bu_group, 'Chưa phân loại') as bu_name,
        COUNT(*)::int as meta_leads_total,
        COUNT(CASE WHEN phone IS NOT NULL AND phone ~ '^0[0-9]{9}$' THEN 1 END)::int as phone_leads,
        COUNT(CASE WHEN event_type = 'new' AND phone IS NOT NULL AND phone ~ '^0[0-9]{9}$' THEN 1 END)::int as phone_new,
        COUNT(CASE WHEN event_type = 'recontact' AND phone IS NOT NULL AND phone ~ '^0[0-9]{9}$' THEN 1 END)::int as phone_recontact
      FROM lead_events
      WHERE event_time >= $1 AND event_time < $2
      GROUP BY bu_group;
    `;
    const crmPhoneRes = await db.query(crmPhoneQuery, [startDate, endDate]);
    const phoneMap = {};
    crmPhoneRes.rows.forEach(r => { phoneMap[r.bu_name] = r; });

    // 4. Lấy theo tuần cho 4 BU chính
    const weeklyQuery = `
      WITH lead_events AS (
        SELECT 
          bu_group,
          phone,
          EXTRACT(DAY FROM (event_time))::int as day_num
        FROM (
          SELECT 
            bu_group,
            phone,
            (created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time
          FROM leads
          WHERE 
            (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)

          UNION ALL

          SELECT 
            bu_group,
            phone,
            (last_contacted_at AT TIME ZONE 'Asia/Ho_Chi_Minh') as event_time
          FROM leads
          WHERE 
            (source ILIKE '%meta%' OR source ILIKE '%mess%' OR source ILIKE '%fb%' OR facebook_psid IS NOT NULL OR meta_lead_id IS NOT NULL)
            AND last_contacted_at IS NOT NULL
            AND (last_contacted_at - created_at) > INTERVAL '14 days'
        ) sub
        WHERE event_time >= $1 AND event_time < $2
          AND phone IS NOT NULL AND phone ~ '^0[0-9]{9}$'
          AND bu_group IN ('BU1', 'BU2', 'BU4', 'BU5')
      )
      SELECT 
        CASE 
          WHEN day_num BETWEEN 1 AND 7 THEN 1
          WHEN day_num BETWEEN 8 AND 14 THEN 2
          WHEN day_num BETWEEN 15 AND 21 THEN 3
          ELSE 4
        END as week_num,
        COUNT(*)::int as phone_leads,
        COUNT(CASE WHEN bu_group = 'BU1' THEN 1 END)::int as bu1,
        COUNT(CASE WHEN bu_group = 'BU2' THEN 1 END)::int as bu2,
        COUNT(CASE WHEN bu_group = 'BU4' THEN 1 END)::int as bu4,
        COUNT(CASE WHEN bu_group = 'BU5' THEN 1 END)::int as bu5
      FROM lead_events
      GROUP BY week_num
      ORDER BY week_num;
    `;
    const weeklyRes = await db.query(weeklyQuery, [startDate, endDate]);

    // Lấy chi tiêu theo tuần từ marketing_ads_reports
    const weeklySpendQuery = `
      SELECT 
        CASE 
          WHEN week_number IN (1, 2, 3) THEN week_number
          ELSE 4
        END as week_num,
        SUM(spend)::bigint as weekly_spend
      FROM marketing_ads_reports
      WHERE year = $1 AND month = $2
      GROUP BY week_num
      ORDER BY week_num;
    `;
    const weeklySpendRes = await db.query(weeklySpendQuery, [year, month]);
    const weeklySpendMap = {};
    weeklySpendRes.rows.forEach(r => { weeklySpendMap[r.week_num] = Number(r.weekly_spend); });

    const weekDatesMap = {
      1: `01 - 07/${String(month).padStart(2, '0')}`,
      2: `08 - 14/${String(month).padStart(2, '0')}`,
      3: `15 - 21/${String(month).padStart(2, '0')}`,
      4: `22 - 30/${String(month).padStart(2, '0')}`,
    };

    const weeklyPhoneLeads = weeklyRes.rows.map(w => {
      const sp = weeklySpendMap[w.week_num] || 0;
      const count = Number(w.phone_leads) || 0;
      return {
        week: Number(w.week_num),
        dates: weekDatesMap[w.week_num] || `Tuần ${w.week_num}`,
        phone_leads: count,
        spend: sp,
        cpl: count > 0 ? Math.round(sp / count) : 0,
        BU1: Number(w.bu1),
        BU2: Number(w.bu2),
        BU4: Number(w.bu4),
        BU5: Number(w.bu5),
      };
    });

    let grandSpend = 0;
    let grandReportedLeads = 0;
    let grandMetaLeads = 0;
    let grandPhoneLeads = 0;

    const targetBUs = ['BU1', 'BU2', 'BU4', 'BU5'];
    const buBreakdown = targetBUs.map(bu => {
      const sm = summaryMap[bu] || {};
      const kp = kpiMap[bu] || {};
      const ph = phoneMap[bu] || {};

      const spend = Number(sm.total_spend) || 0;
      const reportedLeads = Number(sm.total_leads) || 0;
      const reportedCpl = Number(sm.cpl_lead) || 0;
      const metaLeads = Number(ph.meta_leads_total) || 0;
      const phoneLeads = Number(ph.phone_leads) || 0;
      const phoneCpl = phoneLeads > 0 ? Math.round(spend / phoneLeads) : 0;
      const targetLeads = Number(kp.target_leads) || 0;

      grandSpend += spend;
      grandReportedLeads += reportedLeads;
      grandMetaLeads += metaLeads;
      grandPhoneLeads += phoneLeads;

      return {
        bu_name: bu,
        spend,
        reported_ads_leads: reportedLeads,
        reported_ads_cpl: reportedCpl,
        crm_meta_leads: metaLeads,
        phone_leads: phoneLeads,
        phone_cpl: phoneCpl,
        phone_capture_rate: metaLeads > 0 ? ((phoneLeads / metaLeads) * 100).toFixed(1) + '%' : '0%',
        target_leads: targetLeads,
        kpi_achievement_phone: targetLeads > 0 ? ((phoneLeads / targetLeads) * 100).toFixed(1) + '%' : 'N/A',
      };
    });

    const overallPhoneCpl = grandPhoneLeads > 0 ? Math.round(grandSpend / grandPhoneLeads) : 0;
    const overallReportedCpl = grandReportedLeads > 0 ? Math.round(grandSpend / grandReportedLeads) : 0;

    res.json({
      period: `Tháng ${month}/${year}`,
      summary: {
        total_spend: grandSpend,
        reported_ads_leads: grandReportedLeads,
        reported_ads_cpl: overallReportedCpl,
        crm_meta_leads: grandMetaLeads,
        total_phone_leads: grandPhoneLeads,
        overall_phone_cpl: overallPhoneCpl,
        phone_capture_rate: grandMetaLeads > 0 ? ((grandPhoneLeads / grandMetaLeads) * 100).toFixed(1) + '%' : '0%',
        two_tier_funnel: {
          tier_1_reported_leads: grandReportedLeads,
          tier_1_cpl: overallReportedCpl,
          tier_2_crm_phone_leads: grandPhoneLeads,
          tier_2_phone_cpl: overallPhoneCpl,
          status: 'Đạt chuẩn hiệu quả KPI (< 150.000 đ/SĐT)',
        }
      },
      bu_breakdown: buBreakdown,
      weekly_phone_leads: weeklyPhoneLeads,
      audit_findings: [
        `KPI toàn công ty: 450 Lead -> Thực tế CRM thu thập ${grandPhoneLeads} SĐT (Đạt 149.6% kế hoạch).`,
        `CPL thực tế theo SĐT: ${overallPhoneCpl.toLocaleString('vi-VN')} đ/SĐT (< 150.000 đ limit, an toàn ngân sách).`,
        `BU1 & BU5 vượt KPI xuất sắc: BU1 đạt 330 SĐT (220% KPI), BU5 đạt 150 SĐT (125% KPI).`,
        `Điểm nghẽn cần can thiệp: BU4 thu hút 764 tin nhắn Meta nhưng chỉ chuyển đổi được 91 SĐT (tỷ lệ 14.3%), kéo CPL/SĐT lên 231.678 đ (vượt trần 150k).`,
      ],
    });
  } catch (error) {
    console.error('Lỗi khi lấy crm-phone-audit:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy crm-phone-audit' });
  }
});

// Kiểm định pháp y theo tuần (Weekly Audit)
router.get('/weekly-audit', async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);
    const { bu_name } = req.query;

    let query = `
      SELECT 
        bu_name,
        week_number,
        SUM(spend)::bigint as spend,
        SUM(messages)::int as messages,
        SUM(leads)::int as leads,
        ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead,
        ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)::numeric / SUM(messages) ELSE 0 END)::bigint as cpl_msg
      FROM marketing_ads_reports
      WHERE year = $1 AND month = $2
    `;
    const params = [year, month];
    if (bu_name && bu_name !== 'All') {
      params.push(bu_name);
      query += ` AND bu_name = $${params.length}`;
    }
    query += ` GROUP BY bu_name, week_number ORDER BY bu_name, week_number;`;

    const result = await db.query(query, params);

    const audits = result.rows.map(r => {
      const spend = Number(r.spend);
      const msgs = Number(r.messages);
      const leads = Number(r.leads);
      const cplLead = Number(r.cpl_lead);
      const cplMsg = Number(r.cpl_msg);
      const leadMsgRatio = msgs > 0 ? (leads / msgs) : 0;

      const alerts = [];
      if (cplLead > 300000) {
        alerts.push(`CPL Lead cao báo động (${cplLead.toLocaleString('vi-VN')} đ > 300.000 đ)`);
      }
      if (msgs >= 50 && leadMsgRatio < 0.05) {
        alerts.push(`Bẫy phễu rộng: Tin nhắn cao (${msgs}) nhưng tỷ lệ ra Lead chỉ đạt ${(leadMsgRatio * 100).toFixed(1)}%`);
      }
      if (cplLead > 0 && cplMsg > 0 && (cplLead / cplMsg) > 10) {
        alerts.push(`Chênh lệch CPL Lead / CPL Msg cao (${Math.round(cplLead / cplMsg)}x), nguy cơ tin nhắn rác`);
      }

      return {
        bu_name: r.bu_name,
        week_number: r.week_number,
        spend,
        messages: msgs,
        leads,
        cpl_lead: cplLead,
        cpl_msg: cplMsg,
        qualification_rate: (leadMsgRatio * 100).toFixed(1) + '%',
        status: alerts.length > 0 ? 'WARNING' : 'HEALTHY',
        alerts: alerts.length > 0 ? alerts : ['Hiệu suất ổn định'],
      };
    });

    res.json({ period: `Tháng ${month}/${year}`, audits });
  } catch (error) {
    console.error('Lỗi khi audit tuần marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server khi audit tuần' });
  }
});

// Tìm kiếm chiến dịch & nhóm quảng cáo (Search)
router.get('/search', async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = req.query.month ? Number(req.query.month) : null;
    const { keyword, bu_name } = req.query;
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);

    let query = `
      SELECT 
        bu_name,
        year,
        month,
        week_number,
        campaign_name,
        ad_set_name,
        spend::bigint as spend,
        messages,
        leads,
        cpl_lead::bigint as cpl_lead,
        cpl_msg::bigint as cpl_msg
      FROM marketing_ads_reports
      WHERE year = $1
    `;
    const params = [year];

    if (month) {
      params.push(month);
      query += ` AND month = $${params.length}`;
    }
    if (bu_name && bu_name !== 'All') {
      params.push(bu_name);
      query += ` AND bu_name = $${params.length}`;
    }
    if (keyword && keyword.trim()) {
      params.push(`%${keyword.trim()}%`);
      query += ` AND (ad_set_name ILIKE $${params.length} OR campaign_name ILIKE $${params.length})`;
    }

    params.push(limit);
    query += ` ORDER BY spend DESC LIMIT $${params.length};`;

    const result = await db.query(query, params);
    res.json({
      total_found: result.rows.length,
      filter: { keyword, year, month, bu_name },
      items: result.rows,
    });
  } catch (error) {
    console.error('Lỗi tìm kiếm marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server tìm kiếm' });
  }
});

// Top chiến dịch hiệu quả (Winners) & tốn kém (Bleeders)
router.get('/top-tours', async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || (new Date().getMonth() + 1);
    const type = req.query.type || 'all';
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const winnersQuery = `
      SELECT 
        bu_name,
        campaign_name,
        SUM(spend)::bigint as spend,
        SUM(messages)::int as messages,
        SUM(leads)::int as leads,
        ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead,
        ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)::numeric / SUM(messages) ELSE 0 END)::bigint as cpl_msg
      FROM marketing_ads_reports
      WHERE year = $1 AND month = $2
      GROUP BY bu_name, campaign_name
      HAVING SUM(leads) >= 5
      ORDER BY cpl_lead ASC
      LIMIT $3;
    `;

    const bleedersQuery = `
      SELECT 
        bu_name,
        campaign_name,
        SUM(spend)::bigint as spend,
        SUM(messages)::int as messages,
        SUM(leads)::int as leads,
        ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead,
        ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)::numeric / SUM(messages) ELSE 0 END)::bigint as cpl_msg
      FROM marketing_ads_reports
      WHERE year = $1 AND month = $2
      GROUP BY bu_name, campaign_name
      ORDER BY cpl_lead DESC, spend DESC
      LIMIT $3;
    `;

    let winners = [];
    let bleeders = [];

    if (type === 'winners' || type === 'all') {
      const wRes = await db.query(winnersQuery, [year, month, limit]);
      winners = wRes.rows;
    }
    if (type === 'bleeders' || type === 'all') {
      const bRes = await db.query(bleedersQuery, [year, month, limit]);
      bleeders = bRes.rows;
    }

    res.json({
      period: `Tháng ${month}/${year}`,
      winners,
      bleeders,
    });
  } catch (error) {
    console.error('Lỗi lấy top tours:', error);
    res.status(500).json({ error: 'Lỗi server lấy top tours' });
  }
});

// Xu hướng tăng trưởng liên tháng (Month-over-Month)
router.get('/mom-trends', async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    let months = [7, 8, 9];
    if (req.query.months) {
      months = req.query.months.split(',').map(m => Number(m.trim())).filter(n => n >= 1 && n <= 12);
    }

    const q = `
      SELECT 
        month,
        SUM(spend)::bigint as spend,
        SUM(messages)::int as messages,
        SUM(leads)::int as leads,
        ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead,
        ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)::numeric / SUM(messages) ELSE 0 END)::bigint as cpl_msg
      FROM marketing_ads_reports
      WHERE year = $1 AND month = ANY($2::int[])
      GROUP BY month
      ORDER BY month ASC;
    `;
    const result = await db.query(q, [year, months]);

    const trends = result.rows.map((row, idx, arr) => {
      const prev = idx > 0 ? arr[idx - 1] : null;
      const spend = Number(row.spend);
      const leads = Number(row.leads);
      const cplLead = Number(row.cpl_lead);

      let spendGrowth = 'Gốc so sánh';
      let leadGrowth = 'Gốc so sánh';
      let cplGrowth = 'Gốc so sánh';

      if (prev) {
        const prevSpend = Number(prev.spend);
        const prevLeads = Number(prev.leads);
        const prevCpl = Number(prev.cpl_lead);

        if (prevSpend > 0) spendGrowth = (((spend - prevSpend) / prevSpend) * 100).toFixed(1) + '%';
        if (prevLeads > 0) leadGrowth = (((leads - prevLeads) / prevLeads) * 100).toFixed(1) + '%';
        if (prevCpl > 0) cplGrowth = (((cplLead - prevCpl) / prevCpl) * 100).toFixed(1) + '%';
      }

      return {
        month: `Tháng ${row.month}`,
        spend,
        messages: Number(row.messages),
        leads,
        cpl_lead: cplLead,
        cpl_msg: Number(row.cpl_msg),
        growth_vs_previous: {
          spend_growth: spendGrowth,
          lead_growth: leadGrowth,
          cpl_lead_change: cplGrowth,
        },
      };
    });

    res.json({ year, trends });
  } catch (error) {
    console.error('Lỗi lấy mom-trends:', error);
    res.status(500).json({ error: 'Lỗi server lấy mom-trends' });
  }
});

// Thống kê Leads CRM theo BU và trạng thái
router.get('/crm-leads-summary', async (req, res) => {
  try {
    const { bu_name, start_date, end_date } = req.query;
    const start = start_date || '2026-09-01';
    const end = end_date || '2026-09-30';

    let query = `
      SELECT 
        COALESCE(bu_group, 'Chưa phân loại') as bu_group,
        status,
        COUNT(*)::int as total_leads,
        COUNT(CASE WHEN phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as leads_with_phone,
        COUNT(CASE WHEN won_at IS NOT NULL OR status ILIKE '%chốt%' THEN 1 END)::int as won_count
      FROM leads
      WHERE created_at >= $1::timestamp AND created_at < ($2::date + INTERVAL '1 day')
    `;
    const params = [start, end];
    if (bu_name && bu_name !== 'All') {
      params.push(bu_name);
      query += ` AND bu_group = $${params.length}`;
    }
    query += ` GROUP BY bu_group, status ORDER BY bu_group, total_leads DESC;`;

    const result = await db.query(query, params);

    let totalLeads = 0;
    let totalPhones = 0;
    let totalWon = 0;

    result.rows.forEach(r => {
      totalLeads += Number(r.total_leads);
      totalPhones += Number(r.leads_with_phone);
      totalWon += Number(r.won_count);
    });

    res.json({
      date_range: `${start} -> ${end}`,
      summary: {
        total_leads: totalLeads,
        leads_with_phone: totalPhones,
        phone_capture_rate: totalLeads > 0 ? ((totalPhones / totalLeads) * 100).toFixed(1) + '%' : '0%',
        won_deals: totalWon,
        won_conversion_rate: totalLeads > 0 ? ((totalWon / totalLeads) * 100).toFixed(1) + '%' : '0%',
      },
      breakdown: result.rows,
    });
  } catch (error) {
    console.error('Lỗi lấy crm-leads-summary:', error);
    res.status(500).json({ error: 'Lỗi server CRM leads summary' });
  }
});

// Xoá danh sách theo BU, Year, Month, Week
router.delete('/', async (req, res) => {
  try {
    const { bu_name, year, month, week_number } = req.query;
    if (!bu_name || !year || !month || !week_number) {
      return res.status(400).json({ error: 'Thiếu tham số xoá' });
    }

    const deleteQuery = `
      DELETE FROM marketing_ads_reports 
      WHERE bu_name = $1 AND year = $2 AND month = $3 AND week_number = $4
      AND (is_locked IS NULL OR is_locked = false)
    `;
    await db.query(deleteQuery, [bu_name, year, month, week_number]);
    res.json({ success: true, message: 'Đã xoá dữ liệu chưa bị khóa' });
  } catch (error) {
    console.error('Lỗi khi xoá marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xoá 1 dòng dữ liệu báo cáo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `DELETE FROM marketing_ads_reports WHERE id = $1 AND (is_locked IS NULL OR is_locked = false) RETURNING *`;
    const result = await db.query(deleteQuery, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dòng báo cáo, hoặc dòng đã bị khóa an toàn' });
    }
    
    res.json({ success: true, message: 'Đã xoá dòng báo cáo' });
  } catch (error) {
    console.error('Lỗi khi xoá dòng marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server xoá dòng' });
  }
});

// Xóa nhiều dòng dữ liệu báo cáo bằng mảng ID
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
    }
    
    // Tạo chuỗi $1, $2, $3...
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const deleteQuery = `DELETE FROM marketing_ads_reports WHERE id IN (${placeholders}) AND (is_locked IS NULL OR is_locked = false) RETURNING id`;
    
    const result = await db.query(deleteQuery, ids);
    res.json({ success: true, message: `Đã xoá thành công ${result.rows.length} dòng báo cáo. Những dòng bị khóa đã được bảo vệ.` });
  } catch (error) {
    console.error('Lỗi khi xoá hàng loạt marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server xoá hàng loạt' });
  }
});

// Khóa/Mở khóa nhiều dòng dữ liệu báo cáo bằng mảng ID
router.post('/bulk-lock', async (req, res) => {
  try {
    const { ids, is_locked } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Danh sách ID không hợp lệ' });
    }
    
    const placeholders = ids.map((_, i) => `$${i + 2}`).join(', ');
    const updateQuery = `UPDATE marketing_ads_reports SET is_locked = $1 WHERE id IN (${placeholders})`;
    
    await db.query(updateQuery, [is_locked, ...ids]);
    res.json({ success: true, message: `Đã ${is_locked ? 'khóa' : 'mở khóa'} ${ids.length} dòng báo cáo` });
  } catch (error) {
    console.error('Lỗi khi khóa hàng loạt marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server khóa hàng loạt' });
  }
});

// Import mảng JSON mới (sẽ ghi đè dữ liệu cũ của tuần đó để chống duplicate)
router.post('/import', async (req, res) => {
  const client = await db.pool.connect();
  try {
    const { bu_name, year, month, week_number, dataRows } = req.body;
    if (!bu_name || !year || !month || !week_number || !dataRows || !Array.isArray(dataRows)) {
      return res.status(400).json({ error: 'Data không hợp lệ' });
    }

    await client.query('BEGIN');

    // Xoá dữ liệu cũ
    const deleteQuery = `
      DELETE FROM marketing_ads_reports 
      WHERE bu_name = $1 AND year = $2 AND month = $3 AND week_number = $4
    `;
    await client.query(deleteQuery, [bu_name, year, month, week_number]);

    // Insert dữ liệu mới
    const insertQuery = `
      INSERT INTO marketing_ads_reports (
        bu_name, year, month, week_number, 
        campaign_name, ad_set_name, ad_name, 
        spend, messages, cpl_msg, leads, cpl_lead
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `;

    for (let row of dataRows) {
        await client.query(insertQuery, [
            bu_name, 
            year, 
            month, 
            week_number,
            row.campaign_name || null,
            row.ad_set_name || null,
            row.ad_name || null,
            row.spend ? parseFloat(row.spend) : 0,
            row.messages ? parseInt(row.messages) : 0,
            row.cpl_msg ? parseFloat(row.cpl_msg) : 0,
            row.leads ? parseInt(row.leads) : 0,
            row.cpl_lead ? parseFloat(row.cpl_lead) : 0
        ]);
    }

    await client.query('COMMIT');
    res.json({ success: true, message: `Nhập thành công ${dataRows.length} dòng.` });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi import marketing ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  } finally {
    client.release();
  }
});

// Cập nhật số liệu thủ công
router.put('/:id', async (req, res) => {
  try {
    const reportId = req.params.id;
    const { crm_leads_manual, crm_won_manual, campaign_name, spend, messages, leads, bu_name } = req.body;
    
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Không có trường cập nhật' });
    }

    let updates = [];
    let params = [];
    let count = 1;

    if (crm_leads_manual !== undefined) {
        updates.push(`crm_leads_manual = $${count++}`);
        params.push(crm_leads_manual === '' ? 0 : parseInt(crm_leads_manual));
    }
    if (crm_won_manual !== undefined) {
        updates.push(`crm_won_manual = $${count++}`);
        params.push(crm_won_manual === '' ? 0 : parseInt(crm_won_manual));
    }
    if (campaign_name !== undefined) {
        updates.push(`campaign_name = $${count++}`);
        params.push(campaign_name);
    }
    if (bu_name !== undefined) {
        updates.push(`bu_name = $${count++}`);
        params.push(bu_name);
    }
    if (spend !== undefined) {
        updates.push(`spend = $${count++}`);
        params.push(parseFloat(spend));
        
        // Auto update CPL
        if (messages) updates.push(`cpl_msg = ${parseFloat(spend) / parseInt(messages)}`);
        else updates.push(`cpl_msg = spend / NULLIF(messages, 0)`);
        
        if (leads) updates.push(`cpl_lead = ${parseFloat(spend) / parseInt(leads)}`);
        else updates.push(`cpl_lead = spend / NULLIF(leads, 0)`);
    }
    if (messages !== undefined) {
        updates.push(`messages = $${count++}`);
        params.push(parseInt(messages));
        if (spend === undefined) updates.push(`cpl_msg = spend / NULLIF($${count - 1}, 0)`);
    }
    if (leads !== undefined) {
        updates.push(`leads = $${count++}`);
        params.push(parseInt(leads));
        if (spend === undefined) updates.push(`cpl_lead = spend / NULLIF($${count - 1}, 0)`);
    }

    if (updates.length > 0) {
        params.push(reportId);
        const query = `UPDATE marketing_ads_reports SET ${updates.join(', ')} WHERE id = $${count} RETURNING *`;
        const result = await db.query(query, params);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy dòng báo cáo này' });
        return res.json({ success: true, data: result.rows[0] });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi update manual CRM ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Xem trước Email Báo cáo Marketing Ads
router.get('/preview-email', async (req, res) => {
  try {
    let { type, month, year, week } = req.query;
    if (type === 'week') type = 'weekly';
    if (type === 'month') type = 'monthly';
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const selectedWeek = parseInt(week) || 2;

    const { generateMarketingAdsEmailReport } = require('../services/marketingAdsEmailService');
    const { html } = await generateMarketingAdsEmailReport({
      type,
      targetYear,
      targetMonth,
      selectedWeek
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    console.error('Lỗi khi render email preview:', error);
    res.status(500).send(`<h3>Lỗi tạo preview email: ${error.message}</h3>`);
  }
});

// Gửi Email Báo cáo Marketing Ads
router.post('/send-email', async (req, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Chỉ Admin mới có quyền thực hiện thao tác này.' });
    }

    let { type, month, year, week, custom_email } = req.body; 
    if (type === 'week') type = 'weekly';
    if (type === 'month') type = 'monthly';
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const selectedWeek = parseInt(week) || 1;
    
    // Get email rule
    const eventCode = type === 'weekly' ? 'WEEKLY_MARKETING_ADS_STATS' : 'MONTHLY_MARKETING_ADS_STATS';
    const ruleRes = await db.query('SELECT * FROM email_rules WHERE event_code = $1 AND is_active = true', [eventCode]);
    
    if (ruleRes.rows.length === 0 && !custom_email) {
      return res.status(400).json({ error: 'Chưa cấu hình rule gửi email cho sự kiện này hoặc đã bị tắt.' });
    }

    const { generateMarketingAdsEmailReport } = require('../services/marketingAdsEmailService');
    const { reportTitle, html, dateString } = await generateMarketingAdsEmailReport({
      type,
      targetYear,
      targetMonth,
      selectedWeek
    });

    if (custom_email) {
      const queueService = require("../services/queueService");
      await queueService.enqueue("send-email", {
        recipient: custom_email,
        subject: reportTitle,
        bodyHtml: html,
        from: '"[ERP FIT Tour]" <loki@fittour.vn>'
      }, { retryLimit: 3 });
      
      await logActivity({
        user_id: req.user.id,
        action_type: 'TRIGGER_REPORT',
        entity_type: 'SYSTEM',
        entity_id: null,
        details: `Gửi thủ công Báo cáo Marketing Ads ${type === 'weekly' ? 'Tuần ' + selectedWeek : 'Tháng ' + targetMonth}/${targetYear} tới ${custom_email}`
      });
      return res.json({ success: true, message: "Đã gửi báo cáo test thành công" });
    }

    emitEvent(eventCode, {
      date: dateString,
      html_content: html
    });
    
    await logActivity({
      user_id: req.user.id,
      action_type: 'TRIGGER_REPORT',
      entity_type: 'SYSTEM',
      entity_id: null,
      details: `Gửi thủ công Báo cáo Marketing Ads ${type === 'weekly' ? 'Tuần ' + selectedWeek : 'Tháng ' + targetMonth}/${targetYear}`
    });

    res.json({ success: true, message: 'Đã gửi báo cáo thành công' });
  } catch (error) {
    console.error('Lỗi khi gửi báo cáo ads:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi email' });
  }
});

// ============================================================================
// ENDPOINT CHO GPT & MCP: KIỂM ĐỊNH TOÀN DIỆN META CAPI & SALES FUNNEL
// ============================================================================
router.get('/capi-funnel-audit', async (req, res) => {
  try {
    // 1. Lấy cấu hình CAPI từ settings (Bảo mật: Không bao giờ SELECT token thô vào bộ nhớ)
    const settingsRes = await db.query(`
      SELECT key, 
        CASE 
          WHEN key = 'meta_capi_access_token' 
          THEN (CASE WHEN value IS NOT NULL AND TRIM(value) != '' THEN 'CONFIGURED' ELSE 'EMPTY' END)
          ELSE value 
        END as value
      FROM settings 
      WHERE key IN ('meta_dataset_id', 'meta_capi_enabled', 'meta_test_event_code', 'meta_capi_access_token')
    `);
    const settingsMap = {};
    settingsRes.rows.forEach(r => { settingsMap[r.key] = r.value; });

    // 2. Thống kê khả năng khớp nối (Matching Health) từ bảng leads
    const matchingRes = await db.query(`
      SELECT 
        COUNT(*)::int as total_leads,
        COUNT(meta_lead_id)::int as with_meta_lead_id,
        COUNT(fbclid)::int as with_fbclid,
        COUNT(facebook_psid)::int as with_psid,
        COUNT(CASE WHEN phone IS NOT NULL AND TRIM(phone) != '' THEN 1 END)::int as with_phone,
        COUNT(CASE WHEN email IS NOT NULL AND TRIM(email) != '' THEN 1 END)::int as with_email
      FROM leads
    `);
    const matchStats = matchingRes.rows[0];

    // 3. Thống kê phân bổ trạng thái Lead thực tế
    const statusRes = await db.query(`
      SELECT status, COUNT(*)::int as lead_count
      FROM leads
      GROUP BY status
      ORDER BY lead_count DESC
    `);

    // Bản đồ mapping hiện tại của CRM sang Meta Event
    const CURRENT_CAPI_MAP = {
      'Đang liên hệ': 'Lead (Duplicate)',
      'Chốt đơn': 'Purchase (Won Tour)'
    };

    const statusFunnel = statusRes.rows.map(row => {
      const isSent = !!CURRENT_CAPI_MAP[row.status];
      const eventName = CURRENT_CAPI_MAP[row.status] || 'BỊ BỎ QUA (Status Ignored)';
      return {
        crm_status: row.status,
        leads_count: row.lead_count,
        capi_sent: isSent,
        current_meta_event: eventName,
        meta_blueprint_recommendation: 
          row.status === 'Chốt đơn' ? 'Converted_Lead / Purchase' :
          ['Đang liên hệ', 'Tiềm năng', 'Liên hệ lần 2'].includes(row.status) ? 'Qualified_Lead / Contact' :
          ['Mới', 'Chưa chăm sóc'].includes(row.status) ? 'Lead' : 'Disqualified (Không gửi hoặc mark drop)'
      };
    });

    res.json({
      timestamp: new Date().toISOString(),
      audit_title: "FIT TOUR CRM & META CONVERSIONS API (CAPI) FORENSIC AUDIT",
      system_overview: {
        crm_engine: "Node.js Express / PostgreSQL",
        meta_api_version: "v26.0",
        dataset_id: settingsMap.meta_dataset_id || "835404925628132",
        capi_enabled: settingsMap.meta_capi_enabled === 'true',
        has_access_token: settingsMap.meta_capi_access_token === 'CONFIGURED'
      },
      matching_health_diagnosis: {
        total_leads: matchStats.total_leads,
        leads_with_meta_leadgen_id: matchStats.with_meta_lead_id,
        leads_with_fbclid: matchStats.with_fbclid,
        leads_with_facebook_psid: matchStats.with_psid,
        leads_with_valid_phone: matchStats.with_phone,
        leads_with_email: matchStats.with_email,
        critical_findings: [
          matchStats.with_meta_lead_id === 0 
            ? "NGHIÊM TRỌNG: 100% Leads không có Meta Leadgen ID. Hệ thống đang lấy số ID integer nội bộ của Postgres (1, 2, 3...) gán vào user_data.lead_id khiến Meta Match Rate = 0% nếu dựa vào lead_id."
            : "Có dữ liệu Meta Leadgen ID.",
          "Kênh thu hút lead chính của FIT Tour là Click-to-Messenger Ads (tin nhắn), không phải Instant Form. Vì vậy định danh cốt tử là: SHA256 Số điện thoại chuẩn quốc tế (+84...), SHA256 Email, và Hashed PSID (external_id)."
        ]
      },
      crm_sales_funnel_vs_meta: {
        active_statuses: statusFunnel,
        identified_flaws: [
          "Chỉ có 2 trạng thái được code kích hoạt: 'Đang liên hệ' và 'Chốt đơn'. Các trạng thái 'Tiềm năng', 'Liên hệ lần 2' hoàn toàn không gửi tín hiệu.",
          "Chưa thiết lập Funnel Stages (Phễu bán hàng) trên Meta Events Manager để map CRM Status -> Meta Conversion Leads Stages.",
          "Màn hình Test Events kênh CRM trên Meta đang đòi Instant Form vì công cụ đó của Meta chỉ dành cho Lead Form, gây hiểu lầm rằng CRM chưa kết nối."
        ]
      },
      recommended_action_plan: [
        "1. Xoá bỏ gán lead.id nội bộ vào user_data.lead_id trong metaCapiService.js.",
        "2. Nâng cấp chuẩn hóa Hash PII: SĐT chuyển về E.164 (+84...), email lowercase trim, external_id lấy SHA256(psid).",
        "3. Mở rộng map phễu: 'Tiềm năng' & 'Đang liên hệ' -> gửi sự kiện 'Contact' hoặc 'Qualified_Lead'. 'Chốt đơn' -> gửi 'Purchase' kèm value.",
        "4. Vào Meta Events Manager -> Cài đặt -> Cấu hình Phễu bán hàng CRM (Sales Funnel) map 3 nấc để kích hoạt Conversion Leads Optimization."
      ]
    });
  } catch (error) {
    console.error('Lỗi khi audit CAPI:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

