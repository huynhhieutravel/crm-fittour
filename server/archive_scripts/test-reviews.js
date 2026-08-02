require('dotenv').config();
const db = require('./db');

async function test() {
  const query = `
      SELECT 
        reviewer_name, 
        rating, 
        comment, 
        review_date, 
        source, 
        photo_count,
        proof_url
      FROM customer_reviews 
      WHERE is_deleted = false 
        AND rating >= 4
      ORDER BY review_date DESC 
      LIMIT 2
    `;

    const result = await db.query(query, []);
    console.log(result.rows);
    process.exit(0);
}
test();
