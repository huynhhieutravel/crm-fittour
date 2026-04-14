const { Pool } = require('pg');
require('dotenv').config({ path: './.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const fix = async () => {
  const query = `
    UPDATE marketing_ads_reports 
    SET 
      cpl_msg = CASE WHEN messages > 0 THEN spend / messages ELSE 0 END,
      cpl_lead = CASE WHEN leads > 0 THEN spend / leads ELSE 0 END
    WHERE year = 2026 AND month = 3 AND week_number = 1;
  `;
  const result = await pool.query(query);
  console.log(`Fixed ${result.rowCount} rows.`);
  pool.end();
};
fix().catch(err => { console.error(err); pool.end(); });
