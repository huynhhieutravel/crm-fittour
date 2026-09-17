const db = require('./db');
const fs = require('fs');
const path = require('path');

async function dumpData() {
  try {
    // 1. Raw records T7 & T8
    const rawRes = await db.query(`
      SELECT bu_name, year, month, week_number, campaign_name, ad_set_name, ad_name,
             spend, messages, cpl_msg, leads, cpl_lead
      FROM marketing_ads_reports
      WHERE year = 2026 AND month IN (7, 8)
      ORDER BY month DESC, bu_name, week_number, spend DESC
    `);

    // 2. BU Aggregation
    const buAgg = await db.query(`
      SELECT bu_name, month,
             COUNT(DISTINCT campaign_name) as campaign_count,
             COUNT(DISTINCT ad_set_name) as ad_set_count,
             SUM(spend) as total_spend,
             SUM(messages) as total_messages,
             SUM(leads) as total_leads,
             ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)/SUM(messages) ELSE 0 END) as avg_cpl_msg,
             ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)/SUM(leads) ELSE 0 END) as avg_cpl_lead
      FROM marketing_ads_reports
      WHERE year = 2026 AND month IN (7, 8)
      GROUP BY bu_name, month
      ORDER BY month, bu_name
    `);

    // 3. Tour / Ad Set Aggregation
    const tourAgg = await db.query(`
      SELECT bu_name, month,
             ad_set_name,
             campaign_name,
             SUM(spend) as spend,
             SUM(messages) as messages,
             SUM(leads) as leads,
             ROUND(CASE WHEN SUM(messages) > 0 THEN SUM(spend)/SUM(messages) ELSE 0 END) as cpl_msg,
             ROUND(CASE WHEN SUM(leads) > 0 THEN SUM(spend)/SUM(leads) ELSE 0 END) as cpl_lead
      FROM marketing_ads_reports
      WHERE year = 2026 AND month IN (7, 8)
      GROUP BY bu_name, month, ad_set_name, campaign_name
      HAVING SUM(spend) > 0
      ORDER BY month DESC, bu_name, spend DESC
    `);

    const output = {
      raw: rawRes.rows,
      buSummary: buAgg.rows,
      tourSummary: tourAgg.rows
    };

    const outPath = path.join(__dirname, '../scratch/ads_data_t7_t8.json');
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log('Saved data to ' + outPath + ' with ' + rawRes.rows.length + ' raw rows.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dumpData();
