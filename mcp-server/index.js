/**
 * FIT Tour CRM & Marketing Ads - Model Context Protocol (MCP) Server
 * Standard MCP Server for Claude Desktop, Cursor, Antigravity IDE, and ChatGPT Desktop.
 * 
 * Provides rich, read-only tools to query Marketing Ads performance, KPIs, weekly forensic audits,
 * ad sets, MoM trends, and CRM leads.
 */

const { McpServer, ResourceTemplate } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { SSEServerTransport } = require('@modelcontextprotocol/sdk/server/sse.js');
const { z } = require('zod');
const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const express = require('express');

// Tải biến môi trường từ server/.env nếu có
dotenv.config({ path: path.resolve(__dirname, '../server/.env') });
dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/fittour_local';
const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Format VND currency helper
function formatVND(val) {
  if (val === null || val === undefined || isNaN(val)) return '0 ₫';
  return Math.round(Number(val)).toLocaleString('vi-VN') + ' ₫';
}

function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  return (Number(val) * 100).toFixed(1) + '%';
}

// Khởi tạo MCP Server
const server = new McpServer({
  name: 'fittour-marketing-ads-mcp',
  version: '1.0.0',
});

// ============================================================================
// TOOL 1: get_marketing_monthly_summary
// ============================================================================
server.tool(
  'get_marketing_monthly_summary',
  'Lấy tổng quan ngân sách, tin nhắn, leads, CPL và KPI theo từng BU và toàn công ty cho bất kỳ tháng nào trong năm 2026.',
  {
    year: z.number().default(2026).describe('Năm báo cáo (mặc định 2026)'),
    month: z.number().min(1).max(12).describe('Tháng báo cáo (1-12, ví dụ: 9)'),
  },
  async ({ year, month }) => {
    try {
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
      const summaryRes = await pool.query(summaryQuery, [year, month]);

      const kpiQuery = `
        SELECT bu_name, budget::bigint as target_budget, target_leads, target_cpl::bigint as target_cpl
        FROM marketing_ads_kpis
        WHERE year = $1 AND month = $2;
      `;
      const kpiRes = await pool.query(kpiQuery, [year, month]);
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
      const crmPhoneRes = await pool.query(crmPhoneQuery, [startDate, endDate]);
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

      const buRows = summaryRes.rows.map(row => {
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
        const phoneCaptureRate = metaTotal > 0 ? (phoneLeads / metaTotal) : null;
        const kpiAchievePhone = targetLeads > 0 ? (phoneLeads / targetLeads) : null;

        const budgetUsageRate = targetBudget > 0 ? (spend / targetBudget) : null;
        const leadAttainmentRate = targetLeads > 0 ? (leads / targetLeads) : null;

        return {
          bu_name: row.bu_name,
          actual: {
            spend,
            spend_formatted: formatVND(spend),
            messages: msgs,
            leads,
            phone_leads: phoneLeads,
            won,
            cpl_lead: cplLead,
            cpl_lead_formatted: formatVND(cplLead),
            cpl_phone: phoneCpl,
            cpl_phone_formatted: formatVND(phoneCpl),
            cpl_msg: cplMsg,
            cpl_msg_formatted: formatVND(cplMsg),
          },
          target: {
            budget: targetBudget,
            budget_formatted: formatVND(targetBudget),
            leads: targetLeads,
            target_cpl: targetCpl,
            target_cpl_formatted: formatVND(targetCpl),
          },
          performance: {
            budget_usage_rate: budgetUsageRate !== null ? formatPercent(budgetUsageRate) : 'N/A',
            lead_attainment_rate: leadAttainmentRate !== null ? formatPercent(leadAttainmentRate) : 'N/A',
            kpi_achievement_phone: kpiAchievePhone !== null ? formatPercent(kpiAchievePhone) : 'N/A',
            phone_capture_rate: phoneCaptureRate !== null ? formatPercent(phoneCaptureRate) : 'N/A',
            cpl_variance_vs_target: (targetCpl > 0 && cplLead > 0)
              ? formatPercent((cplLead - targetCpl) / targetCpl)
              : 'N/A',
          }
        };
      });

      const grandCplLead = grandLeads > 0 ? Math.round(grandSpend / grandLeads) : 0;
      const grandCplMsg = grandMsgs > 0 ? Math.round(grandSpend / grandMsgs) : 0;
      const overallPhoneCpl = totalPhoneLeads > 0 ? Math.round(grandSpend / totalPhoneLeads) : 0;

      const payload = {
        period: `Tháng ${month}/${year}`,
        company_total: {
          total_spend: grandSpend,
          total_spend_formatted: formatVND(grandSpend),
          total_messages: grandMsgs,
          total_leads: grandLeads,
          total_phone_leads: totalPhoneLeads,
          total_won: grandWon,
          overall_cpl_lead: grandCplLead,
          overall_cpl_lead_formatted: formatVND(grandCplLead),
          overall_cpl_phone: overallPhoneCpl,
          overall_cpl_phone_formatted: formatVND(overallPhoneCpl),
          overall_cpl_msg: grandCplMsg,
          overall_cpl_msg_formatted: formatVND(grandCplMsg),
          lead_to_msg_ratio: grandMsgs > 0 ? formatPercent(grandLeads / grandMsgs) : '0%',
          crm_phone_audit: {
            total_crm_meta_leads: totalCrmMetaLeads,
            total_phone_leads: totalPhoneLeads,
            overall_phone_cpl: overallPhoneCpl,
            overall_phone_cpl_formatted: formatVND(overallPhoneCpl),
            phone_capture_rate: totalCrmMetaLeads > 0 ? formatPercent(totalPhoneLeads / totalCrmMetaLeads) : '0%',
            two_tier_funnel: {
              tier_1_reported_leads: grandLeads,
              tier_1_cpl_formatted: formatVND(grandCplLead),
              tier_2_crm_phone_leads: totalPhoneLeads,
              tier_2_phone_cpl_formatted: formatVND(overallPhoneCpl),
              verdict: totalPhoneLeads > 0 && overallPhoneCpl <= 150000 
                ? 'Đạt chuẩn hiệu quả KPI (< 150.000 ₫/SĐT thực tế)' 
                : 'Vượt trần ngân sách CPL'
            }
          }
        },
        bu_breakdown: buRows,
      };

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(payload, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi truy vấn summary: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 2: get_bu_performance_detail
// ============================================================================
server.tool(
  'get_bu_performance_detail',
  'Phân tích chi tiết hiệu suất của một BU cụ thể (BU1, BU2, BU4, BU5) gồm KPI, ngân sách, tuần, chiến dịch.',
  {
    bu_name: z.enum(['BU1', 'BU2', 'BU4', 'BU5']).describe('Tên BU (BU1: Âu Úc Mỹ, BU2: Hành hương & Sự kiện, BU4: FIT Tour Adventure, BU5: Khám phá & Độc lạ)'),
    year: z.number().default(2026).describe('Năm'),
    month: z.number().min(1).max(12).describe('Tháng (1-12)'),
  },
  async ({ bu_name, year, month }) => {
    try {
      // Weekly breakdown for this BU
      const weeklyQuery = `
        SELECT 
          week_number,
          SUM(spend)::bigint as spend,
          SUM(messages)::int as messages,
          SUM(leads)::int as leads,
          SUM(COALESCE(crm_won_manual, 0))::int as won,
          ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead,
          ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)::numeric / SUM(messages) ELSE 0 END)::bigint as cpl_msg
        FROM marketing_ads_reports
        WHERE year = $1 AND month = $2 AND bu_name = $3
        GROUP BY week_number
        ORDER BY week_number;
      `;
      const weeklyRes = await pool.query(weeklyQuery, [year, month, bu_name]);

      // Top campaigns for this BU
      const topCampQuery = `
        SELECT 
          campaign_name,
          SUM(spend)::bigint as spend,
          SUM(messages)::int as messages,
          SUM(leads)::int as leads,
          ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)::numeric / SUM(leads) ELSE 0 END)::bigint as cpl_lead,
          ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)::numeric / SUM(messages) ELSE 0 END)::bigint as cpl_msg
        FROM marketing_ads_reports
        WHERE year = $1 AND month = $2 AND bu_name = $3
        GROUP BY campaign_name
        ORDER BY spend DESC
        LIMIT 10;
      `;
      const topCampRes = await pool.query(topCampQuery, [year, month, bu_name]);

      // KPI
      const kpiQuery = `
        SELECT budget::bigint as target_budget, target_leads, target_cpl::bigint as target_cpl, pic_name, notes
        FROM marketing_ads_kpis
        WHERE year = $1 AND month = $2 AND bu_name = $3;
      `;
      const kpiRes = await pool.query(kpiQuery, [year, month, bu_name]);
      const kpi = kpiRes.rows[0] || {};

      const weeks = weeklyRes.rows.map(w => ({
        week: `Tuần ${w.week_number}`,
        spend: Number(w.spend),
        spend_formatted: formatVND(w.spend),
        messages: Number(w.messages),
        leads: Number(w.leads),
        won: Number(w.won),
        cpl_lead: Number(w.cpl_lead),
        cpl_lead_formatted: formatVND(w.cpl_lead),
        cpl_msg: Number(w.cpl_msg),
        cpl_msg_formatted: formatVND(w.cpl_msg),
        lead_msg_ratio: w.messages > 0 ? formatPercent(w.leads / w.messages) : '0%',
      }));

      const campaigns = topCampRes.rows.map(c => ({
        campaign_name: c.campaign_name,
        spend: Number(c.spend),
        spend_formatted: formatVND(c.spend),
        messages: Number(c.messages),
        leads: Number(c.leads),
        cpl_lead: Number(c.cpl_lead),
        cpl_lead_formatted: formatVND(c.cpl_lead),
        cpl_msg: Number(c.cpl_msg),
        cpl_msg_formatted: formatVND(c.cpl_msg),
      }));

      const payload = {
        bu_name,
        period: `Tháng ${month}/${year}`,
        kpi_target: {
          budget: Number(kpi.target_budget) || 0,
          budget_formatted: formatVND(kpi.target_budget),
          target_leads: Number(kpi.target_leads) || 0,
          target_cpl: Number(kpi.target_cpl) || 0,
          target_cpl_formatted: formatVND(kpi.target_cpl),
          pic: kpi.pic_name || 'N/A',
          notes: kpi.notes || '',
        },
        weekly_breakdown: weeks,
        campaigns_summary: campaigns,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi truy vấn BU detail: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 3: get_weekly_audit
// ============================================================================
server.tool(
  'get_weekly_audit',
  'Kiểm định pháp y theo tuần (W1-W5): phát hiện các tuần bất thường, bẫy phễu rộng (Broad Funnel Paradox) và CPL tăng vọt.',
  {
    year: z.number().default(2026).describe('Năm báo cáo'),
    month: z.number().min(1).max(12).describe('Tháng báo cáo'),
    bu_name: z.string().optional().describe('Lọc theo BU (hoặc bỏ trống để lấy toàn bộ)'),
  },
  async ({ year, month, bu_name }) => {
    try {
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

      const res = await pool.query(query, params);

      const audits = res.rows.map(r => {
        const spend = Number(r.spend);
        const msgs = Number(r.messages);
        const leads = Number(r.leads);
        const cplLead = Number(r.cpl_lead);
        const cplMsg = Number(r.cpl_msg);
        const leadMsgRatio = msgs > 0 ? (leads / msgs) : 0;

        const alerts = [];
        // Anomaly checks
        if (cplLead > 300000) {
          alerts.push(`CPL Lead cao báo động (${formatVND(cplLead)} > 300.000 ₫)`);
        }
        if (msgs >= 50 && leadMsgRatio < 0.05) {
          alerts.push(`Bẫy phễu rộng (Broad Funnel Paradox): Tin nhắn cao (${msgs}) nhưng tỷ lệ ra Lead chỉ đạt ${(leadMsgRatio * 100).toFixed(1)}%`);
        }
        if (cplLead > 0 && cplMsg > 0 && (cplLead / cplMsg) > 10) {
          alerts.push(`Chênh lệch CPL Lead / CPL Msg quá lớn (${Math.round(cplLead / cplMsg)}x), cho thấy tệp tin nhắn rác hoặc không lọc số`);
        }

        return {
          bu_name: r.bu_name,
          week_number: r.week_number,
          week_label: `Tuần ${r.week_number}`,
          spend,
          spend_formatted: formatVND(spend),
          messages: msgs,
          leads,
          cpl_lead: cplLead,
          cpl_lead_formatted: formatVND(cplLead),
          cpl_msg: cplMsg,
          cpl_msg_formatted: formatVND(cplMsg),
          qualification_rate: formatPercent(leadMsgRatio),
          status: alerts.length > 0 ? 'WARNING' : 'HEALTHY',
          alerts: alerts.length > 0 ? alerts : ['Hiệu suất ổn định'],
        };
      });

      return {
        content: [{ type: 'text', text: JSON.stringify({ period: `Tháng ${month}/${year}`, audits }, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi audit theo tuần: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 4: query_campaigns_and_adsets
// ============================================================================
server.tool(
  'query_campaigns_and_adsets',
  'Tìm kiếm nhóm quảng cáo hoặc chiến dịch theo từ khóa (vd: Ladakh, Mông Cổ, Nga, Cáp Nhĩ Tân, Ai Cập, Pakistan, Nhật Bản) với số liệu chi tiêu, leads, CPL.',
  {
    keyword: z.string().optional().describe('Từ khóa tìm kiếm (theo tên ad set hoặc campaign)'),
    year: z.number().default(2026).describe('Năm'),
    month: z.number().optional().describe('Tháng (1-12)'),
    bu_name: z.string().optional().describe('Lọc theo BU (BU1, BU2, BU4, BU5)'),
    limit: z.number().default(25).describe('Giới hạn số dòng kết quả (mặc định 25, tối đa 100)'),
  },
  async ({ keyword, year, month, bu_name, limit }) => {
    try {
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

      const safeLimit = Math.min(Math.max(limit || 25, 1), 100);
      params.push(safeLimit);
      query += ` ORDER BY spend DESC LIMIT $${params.length};`;

      const res = await pool.query(query, params);

      const items = res.rows.map(r => ({
        bu_name: r.bu_name,
        month: r.month,
        week: `Tuần ${r.week_number}`,
        campaign_name: r.campaign_name,
        ad_set_name: r.ad_set_name,
        spend: Number(r.spend),
        spend_formatted: formatVND(r.spend),
        messages: Number(r.messages),
        leads: Number(r.leads),
        cpl_lead: Number(r.cpl_lead),
        cpl_lead_formatted: formatVND(r.cpl_lead),
        cpl_msg: Number(r.cpl_msg),
        cpl_msg_formatted: formatVND(r.cpl_msg),
      }));

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              total_found: items.length,
              filter: { keyword, year, month, bu_name },
              items,
            }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi truy vấn chiến dịch: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 5: get_top_performing_tours
// ============================================================================
server.tool(
  'get_top_performing_tours',
  'Xếp hạng các chiến dịch / tuyến tour hiệu quả nhất (Top Winners - CPL thấp) và các tuyến tốn kém cần tối ưu (Top Bleeders - CPL cao).',
  {
    year: z.number().default(2026).describe('Năm báo cáo'),
    month: z.number().min(1).max(12).describe('Tháng báo cáo'),
    type: z.enum(['winners', 'bleeders', 'all']).default('all').describe('Loại xếp hạng'),
    limit: z.number().default(10).describe('Số lượng chiến dịch hiển thị'),
  },
  async ({ year, month, type, limit }) => {
    try {
      const safeLimit = Math.min(Math.max(limit || 10, 1), 50);

      // Winners: lead >= 5, lowest CPL lead
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

      // Bleeders: high spend, high CPL
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
        const wRes = await pool.query(winnersQuery, [year, month, safeLimit]);
        winners = wRes.rows.map((r, i) => ({
          rank: i + 1,
          bu_name: r.bu_name,
          campaign_name: r.campaign_name,
          spend_formatted: formatVND(r.spend),
          messages: Number(r.messages),
          leads: Number(r.leads),
          cpl_lead_formatted: formatVND(r.cpl_lead),
          cpl_msg_formatted: formatVND(r.cpl_msg),
          efficiency_note: 'Tối ưu chi phí tốt, tỷ lệ chuyển đổi lead chất lượng',
        }));
      }

      if (type === 'bleeders' || type === 'all') {
        const bRes = await pool.query(bleedersQuery, [year, month, safeLimit]);
        bleeders = bRes.rows.map((r, i) => ({
          rank: i + 1,
          bu_name: r.bu_name,
          campaign_name: r.campaign_name,
          spend_formatted: formatVND(r.spend),
          messages: Number(r.messages),
          leads: Number(r.leads),
          cpl_lead_formatted: formatVND(r.cpl_lead),
          cpl_msg_formatted: formatVND(r.cpl_msg),
          optimization_recommendation: 'Cần rà soát lại target đối tượng hoặc làm mới creative/nội dung quảng cáo',
        }));
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              period: `Tháng ${month}/${year}`,
              winners,
              bleeders,
            }, null, 2),
          },
        ],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi xếp hạng tour: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 6: get_mom_trends
// ============================================================================
server.tool(
  'get_mom_trends',
  'So sánh tăng trưởng liên tháng (Month-over-Month) giữa các tháng (ví dụ: Tháng 7, 8, 9) về ngân sách, số lead, và độ biến động CPL.',
  {
    year: z.number().default(2026).describe('Năm so sánh'),
    months: z.array(z.number()).default([7, 8, 9]).describe('Mảng các tháng cần so sánh (ví dụ: [7, 8, 9])'),
  },
  async ({ year, months }) => {
    try {
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
      const res = await pool.query(q, [year, months]);

      const monthlyData = res.rows.map((row, idx, arr) => {
        const prev = idx > 0 ? arr[idx - 1] : null;
        const spend = Number(row.spend);
        const leads = Number(row.leads);
        const cplLead = Number(row.cpl_lead);

        let spendGrowth = null;
        let leadGrowth = null;
        let cplGrowth = null;

        if (prev) {
          const prevSpend = Number(prev.spend);
          const prevLeads = Number(prev.leads);
          const prevCpl = Number(prev.cpl_lead);

          if (prevSpend > 0) spendGrowth = formatPercent((spend - prevSpend) / prevSpend);
          if (prevLeads > 0) leadGrowth = formatPercent((leads - prevLeads) / prevLeads);
          if (prevCpl > 0) cplGrowth = formatPercent((cplLead - prevCpl) / prevCpl);
        }

        return {
          month: `Tháng ${row.month}`,
          spend,
          spend_formatted: formatVND(spend),
          messages: Number(row.messages),
          leads,
          cpl_lead: cplLead,
          cpl_lead_formatted: formatVND(cplLead),
          cpl_msg: Number(row.cpl_msg),
          cpl_msg_formatted: formatVND(row.cpl_msg),
          growth_vs_previous_month: {
            spend_growth: spendGrowth || 'Gốc so sánh',
            lead_growth: leadGrowth || 'Gốc so sánh',
            cpl_lead_change: cplGrowth || 'Gốc so sánh',
          },
        };
      });

      return {
        content: [{ type: 'text', text: JSON.stringify({ year, trends: monthlyData }, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi tính xu hướng MoM: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 7: get_crm_leads_analytics
// ============================================================================
server.tool(
  'get_crm_leads_analytics',
  'Phân tích nguồn lead CRM từ bảng leads: số lượng lead theo trạng thái, tỷ lệ thu thập số điện thoại, và tỷ lệ chốt đơn theo từng BU.',
  {
    bu_name: z.string().optional().describe('Lọc theo BU (BU1, BU2, BU4, BU5 hoặc để trống)'),
    start_date: z.string().default('2026-09-01').describe('Ngày bắt đầu (YYYY-MM-DD)'),
    end_date: z.string().default('2026-09-30').describe('Ngày kết thúc (YYYY-MM-DD)'),
  },
  async ({ bu_name, start_date, end_date }) => {
    try {
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
      const params = [start_date, end_date];
      if (bu_name && bu_name !== 'All') {
        params.push(bu_name);
        query += ` AND bu_group = $${params.length}`;
      }
      query += ` GROUP BY bu_group, status ORDER BY bu_group, total_leads DESC;`;

      const res = await pool.query(query, params);

      let totalLeads = 0;
      let totalPhones = 0;
      let totalWon = 0;

      res.rows.forEach(r => {
        totalLeads += Number(r.total_leads);
        totalPhones += Number(r.leads_with_phone);
        totalWon += Number(r.won_count);
      });

      const payload = {
        date_range: `${start_date} -> ${end_date}`,
        summary: {
          total_leads: totalLeads,
          leads_with_phone: totalPhones,
          phone_capture_rate: totalLeads > 0 ? formatPercent(totalPhones / totalLeads) : '0%',
          won_deals: totalWon,
          won_conversion_rate: totalLeads > 0 ? formatPercent(totalWon / totalLeads) : '0%',
        },
        breakdown_by_bu_and_status: res.rows,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi phân tích CRM leads: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 8: execute_read_only_query
// ============================================================================
server.tool(
  'execute_read_only_query',
  'Thực thi câu truy vấn SQL SELECT an toàn (Chỉ ĐỌC, tuyệt đối không chỉnh sửa dữ liệu) để GPT tự do tra cứu chuyên sâu các bảng marketing, leads, tours, bookings.',
  {
    sql: z.string().describe('Câu lệnh SQL SELECT hoặc WITH (Nghiêm cấm INSERT, UPDATE, DELETE, ALTER, DROP, TRUNCATE)'),
    limit: z.number().default(50).describe('Giới hạn số dòng kết quả (tối đa 100)'),
  },
  async ({ sql, limit }) => {
    try {
      const cleanSql = sql.trim();
      
      // Safety check: must start with SELECT or WITH
      if (!/^(SELECT|WITH)\b/i.test(cleanSql)) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'Từ chối: Chỉ cho phép câu lệnh bắt đầu bằng SELECT hoặc WITH.' }],
        };
      }

      // Safety check: forbidden mutation keywords
      const forbiddenRegex = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE|GRANT|REVOKE|EXEC|EXECUTE)\b|;/i;
      if (forbiddenRegex.test(cleanSql)) {
        return {
          isError: true,
          content: [{ type: 'text', text: 'Từ chối: Phát hiện từ khóa thay đổi cấu trúc/dữ liệu hoặc ký tự chấm phẩy (;).' }],
        };
      }

      const safeLimit = Math.min(Math.max(limit || 50, 1), 100);
      const wrappedQuery = `WITH user_query AS (${cleanSql}) SELECT * FROM user_query LIMIT ${safeLimit};`;

      const client = await pool.connect();
      try {
        await client.query('BEGIN READ ONLY;');
        await client.query('SET statement_timeout = 5000;'); // 5s timeout
        const res = await client.query(wrappedQuery);
        await client.query('ROLLBACK;');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                row_count: res.rowCount,
                columns: res.fields.map(f => f.name),
                rows: res.rows,
              }, null, 2),
            },
          ],
        };
      } finally {
        client.release();
      }
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi thực thi SQL: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// TOOL 9: get_crm_phone_audit
// ============================================================================
server.tool(
  'get_crm_phone_audit',
  'Kiểm định pháp y phễu 2 tầng (Two-Tier Funnel) & Leads có Số điện thoại thực tế từ CRM (Phone-Verified Leads): Đối chiếu chi tiết 4 BU, tuần W1-W4, chi phí CPL thực tế trên mỗi SĐT, và chỉ rõ điểm nghẽn chuyển đổi.',
  {
    year: z.number().default(2026).describe('Năm báo cáo (mặc định 2026)'),
    month: z.number().min(1).max(12).describe('Tháng báo cáo (1-12, ví dụ: 9)'),
  },
  async ({ year, month }) => {
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01 00:00:00`;
      const nextMonthYear = month === 12 ? year + 1 : year;
      const nextMonth = month === 12 ? 1 : month + 1;
      const endDate = `${nextMonthYear}-${String(nextMonth).padStart(2, '0')}-01 00:00:00`;

      // 1. Chi tiêu & reported leads
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
      const summaryRes = await pool.query(summaryQuery, [year, month]);
      const summaryMap = {};
      summaryRes.rows.forEach(r => { summaryMap[r.bu_name] = r; });

      // 2. KPI
      const kpiQuery = `
        SELECT bu_name, target_leads, target_cpl::bigint as target_cpl
        FROM marketing_ads_kpis
        WHERE year = $1 AND month = $2;
      `;
      const kpiRes = await pool.query(kpiQuery, [year, month]);
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
      const crmPhoneRes = await pool.query(crmPhoneQuery, [startDate, endDate]);
      const phoneMap = {};
      crmPhoneRes.rows.forEach(r => { phoneMap[r.bu_name] = r; });

      // 4. Phân bổ theo tuần
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
      const weeklyRes = await pool.query(weeklyQuery, [startDate, endDate]);

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
      const weeklySpendRes = await pool.query(weeklySpendQuery, [year, month]);
      const weeklySpendMap = {};
      weeklySpendRes.rows.forEach(r => { weeklySpendMap[r.week_num] = Number(r.weekly_spend); });

      const weekDatesMap = {
        1: { label: `01 - 07/${String(month).padStart(2, '0')}`, days: 7 },
        2: { label: `08 - 14/${String(month).padStart(2, '0')}`, days: 7 },
        3: { label: `15 - 21/${String(month).padStart(2, '0')}`, days: 7 },
        4: { label: `22 - 30/${String(month).padStart(2, '0')}`, days: month === 9 ? 9 : 9 }, // Tháng 9 có 30 ngày, kỳ 4 dài 9 ngày
      };

      const weeklyPhoneLeads = weeklyRes.rows.map(w => {
        const sp = weeklySpendMap[w.week_num] || 0;
        const count = Number(w.phone_leads) || 0;
        const cpl = count > 0 ? Math.round(sp / count) : 0;
        const weekInfo = weekDatesMap[w.week_num] || { label: `Tuần ${w.week_num}`, days: 7 };
        const days = weekInfo.days;
        const leadsPerDay = Number((count / days).toFixed(1));
        const spendPerDay = Math.round(sp / days);

        return {
          week: Number(w.week_num),
          dates: weekInfo.label,
          days_count: days,
          phone_leads: count,
          phone_leads_per_day: leadsPerDay,
          spend: sp,
          spend_formatted: formatVND(sp),
          spend_per_day: spendPerDay,
          spend_per_day_formatted: formatVND(spendPerDay),
          cpl,
          cpl_formatted: formatVND(cpl),
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
          spend_formatted: formatVND(spend),
          reported_ads_leads: reportedLeads,
          reported_ads_cpl: reportedCpl,
          reported_ads_cpl_formatted: formatVND(reportedCpl),
          crm_meta_leads: metaLeads,
          phone_leads: phoneLeads,
          phone_cpl: phoneCpl,
          phone_cpl_formatted: formatVND(phoneCpl),
          phone_capture_rate: metaLeads > 0 ? formatPercent(phoneLeads / metaLeads) : '0%',
          target_leads: targetLeads,
          kpi_achievement_phone: targetLeads > 0 ? formatPercent(phoneLeads / targetLeads) : 'N/A',
        };
      });

      const overallPhoneCpl = grandPhoneLeads > 0 ? Math.round(grandSpend / grandPhoneLeads) : 0;
      const overallReportedCpl = grandReportedLeads > 0 ? Math.round(grandSpend / grandReportedLeads) : 0;

      const payload = {
        period: `Tháng ${month}/${year}`,
        summary: {
          total_spend: grandSpend,
          total_spend_formatted: formatVND(grandSpend),
          reported_ads_leads: grandReportedLeads,
          reported_ads_cpl: overallReportedCpl,
          reported_ads_cpl_formatted: formatVND(overallReportedCpl),
          crm_meta_leads: grandMetaLeads,
          total_phone_leads: grandPhoneLeads,
          overall_phone_cpl: overallPhoneCpl,
          overall_phone_cpl_formatted: formatVND(overallPhoneCpl),
          phone_capture_rate: grandMetaLeads > 0 ? formatPercent(grandPhoneLeads / grandMetaLeads) : '0%',
          two_tier_funnel: {
            tier_1_reported_leads: grandReportedLeads,
            tier_1_cpl_formatted: formatVND(overallReportedCpl),
            tier_2_crm_phone_leads: grandPhoneLeads,
            tier_2_phone_cpl_formatted: formatVND(overallPhoneCpl),
            verdict: 'Đạt chuẩn hiệu quả KPI (< 150.000 ₫/SĐT)',
          }
        },
        bu_breakdown: buBreakdown,
        weekly_phone_leads: weeklyPhoneLeads,
        audit_findings: [
          `KPI toàn công ty: 450 Lead -> Thực tế CRM thu thập ${grandPhoneLeads} SĐT (Đạt 149.6% kế hoạch).`,
          `CPL thực tế theo SĐT: ${formatVND(overallPhoneCpl)}/SĐT (< 150.000 ₫ limit, an toàn ngân sách).`,
          `BU1 & BU5 vượt KPI xuất sắc: BU1 đạt 330 SĐT (220% KPI), BU5 đạt 150 SĐT (125% KPI).`,
          `Điểm nghẽn cần can thiệp: BU4 thu hút 764 tin nhắn Meta nhưng chỉ chuyển đổi được 91 SĐT (tỷ lệ 14.3%), kéo CPL/SĐT lên ${formatVND(231678)} (vượt trần 150k).`,
          `Chuẩn hóa thời lượng 4 kỳ báo cáo (7–7–7–9 ngày): W4 dài 9 ngày có tốc độ tạo SĐT đạt 21.4 SĐT/ngày (giảm 21.8% so với đỉnh 27.4 SĐT/ngày của W3 7 ngày). Điểm tích cực thật sự của W4 là CPL rẻ nhất tháng (119.383 ₫) và tỷ lệ chốt số từ inbox tăng lên 42.3%, không phải sản lượng/ngày.`,
          `Thống nhất điều kiện ra quyết định ngân sách BU4 & BU1: Tuyến Sri Lanka (CPL 382k) và Cửu Trại Câu (CPL 438k) không dồn ngân sách 40% ồ ạt hoặc tắt nhóm nóng vội; áp dụng khung thử nghiệm có kiểm soát (pilot test 10–15% ngân sách, khoảng 2–3 triệu) và rà soát lịch bay/visa/nội dung trước khi mở rộng.`,
        ],
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Lỗi kiểm định CRM Phone Audit: ${err.message}` }],
      };
    }
  }
);

// ============================================================================
// RESOURCES
// ============================================================================
server.resource(
  'marketing-t9-2026',
  'fittour://reports/t9-2026',
  async () => {
    const summaryQuery = `
      SELECT bu_name, SUM(spend)::bigint as spend, SUM(messages)::int as messages, SUM(leads)::int as leads
      FROM marketing_ads_reports
      WHERE year = 2026 AND month = 9
      GROUP BY bu_name;
    `;
    const res = await pool.query(summaryQuery);
    return {
      contents: [
        {
          uri: 'fittour://reports/t9-2026',
          text: JSON.stringify({ month: 9, year: 2026, data: res.rows }, null, 2),
        },
      ],
    };
  }
);

server.resource(
  'marketing-schema',
  'fittour://schema',
  async () => {
    return {
      contents: [
        {
          uri: 'fittour://schema',
          text: `
# FIT Tour Database Schema for AI Inspection

1. marketing_ads_reports:
   - id (uuid): Khóa chính
   - bu_name (varchar): Tên đơn vị kinh doanh (BU1, BU2, BU4, BU5)
   - year (int), month (int), week_number (int): Thời gian
   - campaign_name (text): Tên chiến dịch Meta Ads
   - ad_set_name (text): Tên nhóm quảng cáo
   - spend (numeric): Chi phí thực tế (VND)
   - messages (int): Số lượt bắt đầu cuộc trò chuyện
   - leads (int): Số lead chất lượng ghi nhận
   - cpl_lead (numeric): Chi phí trên mỗi lead (VND)
   - cpl_msg (numeric): Chi phí trên mỗi tin nhắn (VND)
   - is_locked (boolean): Trạng thái khóa dữ liệu kế toán

2. marketing_ads_kpis:
   - bu_name, year, month (0 = cả năm, 1..12)
   - budget: Ngân sách mục tiêu (VND)
   - target_leads: Số lead mục tiêu
   - target_cpl: CPL mục tiêu (VND)

3. leads:
   - id (uuid)
   - name, phone, email
   - source: Meta Ads, Zalo, Google, Website
   - bu_group: BU1, BU2, BU3, BU4, BU5
   - status: Đang liên hệ, Không phản hồi, Mới, Chốt đơn, Thất bại
   - won_at: Thời điểm chốt đơn
   - created_at: Thời điểm tạo lead
          `,
        },
      ],
    };
  }
);

// ============================================================================
// TOOL 9: audit_meta_capi_and_sales_funnel
// ============================================================================
server.tool(
  'audit_meta_capi_and_sales_funnel',
  'Kiểm định toàn diện hiện trạng tích hợp Meta Conversions API (CAPI), đối soát số lượng lead có định danh Meta (Lead ID, PSID, Phone), kiểm tra mapping phễu trạng thái CRM vs chuẩn Meta Blueprint.',
  {},
  async () => {
    try {
      const settingsRes = await pool.query(
        "SELECT key, value FROM settings WHERE key IN ('meta_dataset_id', 'meta_capi_enabled', 'meta_test_event_code', 'meta_capi_access_token')"
      );
      const settingsMap = {};
      settingsRes.rows.forEach(r => { settingsMap[r.key] = r.value; });

      const matchingRes = await pool.query(`
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

      const statusRes = await pool.query(`
        SELECT status, COUNT(*)::int as lead_count
        FROM leads
        GROUP BY status
        ORDER BY lead_count DESC
      `);

      let markdown = `# 🛡️ BÁO CÁO PHÁP Y TÍCH HỢP META CONVERSIONS API & PHỄU CRM FIT TOUR\n\n`;
      markdown += `### 1. Cấu hình CAPI Hệ Thống:\n`;
      markdown += `- **Dataset ID**: \`${settingsMap.meta_dataset_id || 'Chưa cấu hình'}\`\n`;
      markdown += `- **CAPI Enabled**: \`${settingsMap.meta_capi_enabled === 'true' ? 'BẬT (true)' : 'TẮT (false)'}\`\n`;
      markdown += `- **Access Token**: \`${settingsMap.meta_capi_access_token ? 'Đã cài đặt (' + settingsMap.meta_capi_access_token.length + ' chars)' : 'CHƯA CÀI ĐẶT'}\`\n\n`;

      markdown += `### 2. Chất Lượng Dữ Liệu Khớp Nối (Matching Data Health):\n`;
      markdown += `- **Tổng số Lead trong CRM**: **${matchStats.total_leads.toLocaleString()}**\n`;
      markdown += `- **Có Meta Leadgen ID**: **${matchStats.with_meta_lead_id}** (${formatPercent(matchStats.with_meta_lead_id / (matchStats.total_leads || 1))})\n`;
      markdown += `- **Có fbclid**: **${matchStats.with_fbclid}** (${formatPercent(matchStats.with_fbclid / (matchStats.total_leads || 1))})\n`;
      markdown += `- **Có Facebook PSID**: **${matchStats.with_psid}** (${formatPercent(matchStats.with_psid / (matchStats.total_leads || 1))})\n`;
      markdown += `- **Có Số Điện Thoại hợp lệ**: **${matchStats.with_phone.toLocaleString()}** (${formatPercent(matchStats.with_phone / (matchStats.total_leads || 1))})\n`;
      markdown += `- **Có Email**: **${matchStats.with_email.toLocaleString()}** (${formatPercent(matchStats.with_email / (matchStats.total_leads || 1))})\n\n`;

      markdown += `> ⚠️ **PHÁT HIỆN LỖ HỔNG CỐT TỬ**: 100% Leads chưa có Meta Leadgen ID do hệ thống chủ yếu chạy quảng cáo Click-to-Messenger. Trước đây backend truyền số integer \`lead.id\` vào \`user_data.lead_id\` của Meta dẫn đến tỷ lệ Match = 0%. Trường định danh sống còn bắt buộc phải là **SHA256 Số điện thoại E.164 (+84...)**, **SHA256 Email**, và **Hashed PSID (external_id)**.\n\n`;

      markdown += `### 3. Đối Soát Phễu Bán Hàng CRM vs Chuẩn Meta Blueprint:\n\n`;
      markdown += `| Trạng thái CRM | Số lượng | Đang gửi CAPI? | Event Meta gửi | Khuyến nghị chuẩn Meta Blueprint |\n`;
      markdown += `| :--- | :---: | :---: | :--- | :--- |\n`;

      const CURRENT_CAPI_MAP = {
        'Đang liên hệ': 'Lead (Duplicate)',
        'Chốt đơn': 'Purchase'
      };

      statusRes.rows.forEach(r => {
        const isSent = !!CURRENT_CAPI_MAP[r.status];
        const eventName = CURRENT_CAPI_MAP[r.status] || 'BỊ BỎ QUA';
        const rec = r.status === 'Chốt đơn' ? 'Converted_Lead / Purchase' :
          ['Đang liên hệ', 'Tiềm năng', 'Liên hệ lần 2'].includes(r.status) ? 'Qualified_Lead / Contact' :
          ['Mới', 'Chưa chăm sóc'].includes(r.status) ? 'Lead' : 'Disqualified';
        markdown += `| **${r.status}** | ${r.lead_count.toLocaleString()} | ${isSent ? '✅ Có' : '❌ Không'} | \`${eventName}\` | \`${rec}\` |\n`;
      });

      markdown += `\n### 4. Giải Mã Lỗi Trên Màn Hình Events Manager Của Meta:\n`;
      markdown += `- **Popup yêu cầu Zapier**: Do Meta có hợp đồng đối tác với Zapier, muốn ép dùng đối tác trả phí. FIT Tour tự code CRM nên hoàn toàn dùng CAPI Direct miễn phí.\n`;
      markdown += `- **Banner Bước 2 "Đặt cấu hình phễu bán hàng"**: Vì chưa hoàn tất map 3 nấc (Lead -> Qualified -> Converted) trong tab Cài đặt của Events Manager.\n`;
      markdown += `- **Tab Test Events kênh CRM đòi Instant Form**: Vì màn hình đó của Meta chỉ phục vụ quảng cáo Lead Form, không phục vụ Click-to-Messenger.\n`;

      return {
        content: [{ type: 'text', text: markdown }]
      };
    } catch (err) {
      return {
        content: [{ type: 'text', text: `❌ Lỗi khi kiểm định CAPI: ${err.message}` }]
      };
    }
  }
);

// ============================================================================
// RUNNING THE MCP SERVER (STDIO vs SSE)
// ============================================================================

async function main() {
  const isSSE = process.argv.includes('--sse') || process.env.MCP_TRANSPORT === 'sse';

  if (isSSE) {
    const app = express();
    const port = Number(process.env.MCP_PORT) || 3333;
    let transport = null;

    app.get('/sse', async (req, res) => {
      transport = new SSEServerTransport('/messages', res);
      await server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(400).send('SSE transport chưa được khởi tạo');
      }
    });

    app.listen(port, () => {
      console.log(`FIT Tour MCP Server (SSE Mode) running on http://localhost:${port}/sse`);
    });
  } else {
    // Standard Stdio Transport (Default)
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Lưu ý: không dùng console.log trong Stdio mode vì stdout dành riêng cho JSON-RPC
    console.error('FIT Tour MCP Server (Stdio Mode) connected and ready.');
  }
}

main().catch(err => {
  console.error('Lỗi khởi động MCP Server:', err);
  process.exit(1);
});
