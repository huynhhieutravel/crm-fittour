const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function run() {
    let baseWhereBU = `is_deleted = false AND approval_status = 'approved' AND (bu_id IS NULL OR UPPER(bu_id) NOT IN ('MARKETING', 'KẾ TOÁN', 'KE TOAN'))`;
    
    // Simulate query for 'Tháng này'
    const groupType = 'week';
    
    const trendRes = await pool.query(`
      SELECT DATE_TRUNC('${groupType}', review_date) as date, COUNT(*) as total, AVG(rating) as avg_rating
      FROM customer_reviews WHERE ${baseWhereBU}
      GROUP BY DATE_TRUNC('${groupType}', review_date)
      ORDER BY date ASC
    `);

    const buTrendRes = await pool.query(`
      SELECT DATE_TRUNC('${groupType}', review_date) as date, COALESCE(bu_id, 'Chưa phân') as bu_id, COUNT(*) as total
      FROM customer_reviews WHERE ${baseWhereBU}
      GROUP BY DATE_TRUNC('${groupType}', review_date), COALESCE(bu_id, 'Chưa phân')
    `);

    const trendMap = {};
    trendRes.rows.forEach(r => {
        trendMap[r.date] = {
            date: r.date,
            total: parseInt(r.total),
            avg_rating: parseFloat(r.avg_rating)
        };
    });

    buTrendRes.rows.forEach(r => {
        if (trendMap[r.date]) {
            trendMap[r.date][r.bu_id] = parseInt(r.total);
        }
    });

    console.log(JSON.stringify(Object.values(trendMap), null, 2));
    process.exit(0);
}
run();
