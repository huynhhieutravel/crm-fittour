require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT bu_name, month, target_leads, target_cpl FROM marketing_ads_kpis WHERE year=2026 AND month=4 ORDER BY bu_name').then(res => {
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}).catch(console.error);
