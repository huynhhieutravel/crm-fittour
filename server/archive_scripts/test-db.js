const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
  const trendRes = await pool.query(`
      SELECT DATE_TRUNC('month', review_date) as date, COUNT(*) as total, AVG(rating) as avg_rating
      FROM customer_reviews 
      GROUP BY DATE_TRUNC('month', review_date)
      ORDER BY date ASC
    `);

    const buTrendRes = await pool.query(`
      SELECT DATE_TRUNC('month', review_date) as date, COALESCE(bu_id, 'Chưa phân') as bu_id, COUNT(*) as total
      FROM customer_reviews 
      GROUP BY DATE_TRUNC('month', review_date), COALESCE(bu_id, 'Chưa phân')
    `);

    const trendMap = {};
    trendRes.rows.forEach(r => {
        trendMap[r.date] = {
            date: r.date,
            total: parseInt(r.total),
            avg_rating: parseFloat(r.avg_rating)
        };
    });

    let misses = 0;
    buTrendRes.rows.forEach(r => {
        if (trendMap[r.date]) {
            trendMap[r.date][r.bu_id] = parseInt(r.total);
        } else {
            console.log("No match for date:", r.date);
            misses++;
        }
    });

    console.log("Misses:", misses);
    console.log(Object.values(trendMap)[0]);
    process.exit(0);
}
run();
