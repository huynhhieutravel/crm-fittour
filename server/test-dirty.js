require('dotenv').config();
const db = require('./db');
async function test() {
  const result = await db.query(`SELECT reviewer_name, comment FROM customer_reviews ORDER BY review_date DESC LIMIT 5`);
  console.log(result.rows);
  process.exit(0);
}
test();
