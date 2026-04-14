const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const check = async () => {
  const result = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'marketing_ads_kpis'");
  console.log(result.rows);
  pool.end();
};
check().catch(err => { console.error(err); pool.end(); });
