const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query("SELECT guide_name, COUNT(*) as total_reviews, ROUND(AVG(rating), 1) as avg_rating FROM customer_reviews WHERE is_deleted = false AND approval_status = 'approved' AND guide_name IS NOT NULL AND guide_name != '' GROUP BY guide_name ORDER BY avg_rating DESC, total_reviews DESC");
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  }
  await client.end();
}
run();
