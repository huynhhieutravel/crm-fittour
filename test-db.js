const db = require('./server/db/index.js');
async function test() {
  const q = `SELECT TO_CHAR(DATE(l.created_at), 'YYYY-MM-DD') as period, l.status, COUNT(*)::int as count FROM leads l WHERE 1=1 AND l.created_at >= $1 AND l.created_at <= $2 GROUP BY 1, l.status ORDER BY 1`;
  const res = await db.query(q, ['2026-03-27', '2026-04-02 23:59:59']);
  console.log(res.rows);
  process.exit(0);
}
test();
