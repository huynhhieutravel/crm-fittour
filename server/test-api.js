const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const req = { query: { page: '1', limit: 'undefined' } };
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE r.is_deleted = false';
    const values = [];
    let paramIndex = 1;

    const query = `
      SELECT r.*
      FROM customer_reviews r
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `;
    
    values.push(limit, offset);
    console.log("Query:", query);
    console.log("Values:", values);
    
    const result = await client.query(query, values);
    console.log("SUCCESS query");

  } catch (err) {
    console.error("ERROR:", err.message);
  }
  await client.end();
}
run();
