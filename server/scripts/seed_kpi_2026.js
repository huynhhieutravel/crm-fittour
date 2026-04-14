/**
 * Seed KPI targets cho 12 tháng năm 2026
 * BU1: 40.000.000đ, 150 Lead, 150.000đ CPL
 * BU2: 50.000.000đ, 125 Lead, 150.000đ CPL
 * BU4: 20.000.000đ, 100 Lead, 150.000đ CPL
 */
const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const BU_TARGETS = [
  { bu_name: 'BU1', budget: 40000000, target_leads: 150, target_cpl: 150000 },
  { bu_name: 'BU2', budget: 50000000, target_leads: 125, target_cpl: 150000 },
  { bu_name: 'BU4', budget: 20000000, target_leads: 100, target_cpl: 150000 },
];

const YEAR = 2026;

async function seed() {
  let count = 0;
  for (const bu of BU_TARGETS) {
    for (let month = 1; month <= 12; month++) {
      const query = `
        INSERT INTO marketing_ads_kpis (
          bu_name, year, month, budget, target_cpl, pic_name,
          target_routes, target_groups, target_customers, target_cpa, target_leads,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, '', 0, 0, 0, 0, $6, CURRENT_TIMESTAMP)
        ON CONFLICT (bu_name, year, month)
        DO UPDATE SET
          budget = EXCLUDED.budget,
          target_cpl = EXCLUDED.target_cpl,
          target_leads = EXCLUDED.target_leads,
          updated_at = CURRENT_TIMESTAMP
        RETURNING *;
      `;
      const result = await pool.query(query, [
        bu.bu_name, YEAR, month,
        bu.budget, bu.target_cpl, bu.target_leads
      ]);
      count++;
      console.log(`✅ ${bu.bu_name} - Tháng ${month}: Budget=${bu.budget.toLocaleString()}, Lead=${bu.target_leads}, CPL=${bu.target_cpl.toLocaleString()}`);
    }
  }
  console.log(`\n🎉 Đã seed ${count} records KPI cho năm ${YEAR}!`);
  await pool.end();
}

seed().catch(err => {
  console.error('❌ Lỗi:', err);
  process.exit(1);
});
