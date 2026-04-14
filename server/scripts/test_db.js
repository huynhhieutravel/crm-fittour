const db = require('../db');

async function check() {
  const res = await db.query('SELECT * FROM permissions WHERE module = $1', ['travel-support']);
  console.log(res.rows);
  process.exit();
}
check();
