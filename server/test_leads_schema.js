const db = require('./db/index');

async function test() {
  const result = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'leads'");
  console.log(result.rows.map(r => r.column_name));
  process.exit(0);
}
test();
