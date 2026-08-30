require("dotenv").config();
const { pool } = require("../db");

async function runQA() {
  console.log("=================================================================");
  console.log("                     COMPREHENSIVE QA AUDIT                      ");
  console.log("=================================================================");

  // 1. Meta Ads by Week & BU
  const adsBU = await pool.query(`
    SELECT 
      bu_name,
      week_number,
      SUM(spend)::numeric as spend,
      SUM(messages)::int as messages,
      SUM(leads)::int as lead_ads,
      ROUND(SUM(spend)::numeric / NULLIF(SUM(leads), 0)) as cpl_ads,
      ROUND(SUM(spend)::numeric / NULLIF(SUM(messages), 0)) as cost_msg
    FROM marketing_ads_reports
    WHERE month = 8 AND year = 2026
    GROUP BY bu_name, week_number
    ORDER BY bu_name, week_number
  `);
  console.log("\n--- 1. META ADS BY BU & WEEK ---");
  console.table(adsBU.rows);

  // 2. Meta Ads System-wide
  const adsSystem = await pool.query(`
    SELECT 
      week_number,
      SUM(spend)::numeric as spend,
      SUM(messages)::int as messages,
      SUM(leads)::int as lead_ads,
      ROUND(SUM(spend)::numeric / NULLIF(SUM(leads), 0)) as cpl_ads,
      ROUND(SUM(spend)::numeric / NULLIF(SUM(messages), 0)) as cost_msg
    FROM marketing_ads_reports
    WHERE month = 8 AND year = 2026
    GROUP BY week_number
    ORDER BY week_number
  `);
  console.log("\n--- 2. META ADS SYSTEM TOTAL BY WEEK ---");
  console.table(adsSystem.rows);

  // 3. CRM Leads by BU & Week (matching Lead Controller logic)
  const crmBU = await pool.query(`
    SELECT 
      COALESCE(l.bu_group, tt.bu_group, 'OTHER') as bu_group,
      CASE 
        WHEN EXTRACT(DAY FROM l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 1 AND 9 THEN 1
        WHEN EXTRACT(DAY FROM l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 10 AND 16 THEN 2
        WHEN EXTRACT(DAY FROM l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 17 AND 23 THEN 3
        ELSE 4
      END as week_number,
      COUNT(l.id)::int as crm_leads,
      COUNT(CASE WHEN l.status = 'Chốt đơn' THEN 1 END)::int as won_deals
    FROM leads l
    LEFT JOIN tour_templates tt ON l.tour_id = tt.id
    WHERE l.created_at >= '2026-08-01 00:00:00' AND l.created_at <= '2026-08-23 23:59:59'
    GROUP BY 1, 2
    ORDER BY 1, 2
  `);
  console.log("\n--- 3. CRM LEADS BY BU & WEEK ---");
  console.table(crmBU.rows);

  // 4. CRM Leads Total
  const crmTotal = await pool.query(`
    SELECT 
      CASE 
        WHEN EXTRACT(DAY FROM l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 1 AND 9 THEN 1
        WHEN EXTRACT(DAY FROM l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 10 AND 16 THEN 2
        WHEN EXTRACT(DAY FROM l.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh') BETWEEN 17 AND 23 THEN 3
        ELSE 4
      END as week_number,
      COUNT(l.id)::int as total_crm_leads,
      COUNT(CASE WHEN l.status = 'Chốt đơn' THEN 1 END)::int as total_won_deals
    FROM leads l
    WHERE l.created_at >= '2026-08-01 00:00:00' AND l.created_at <= '2026-08-23 23:59:59'
    GROUP BY 1
    ORDER BY 1
  `);
  console.log("\n--- 4. CRM LEADS TOTAL BY WEEK ---");
  console.table(crmTotal.rows);

  process.exit(0);
}

runQA().catch(e => { console.error(e); process.exit(1); });
