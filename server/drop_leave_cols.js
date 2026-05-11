const db = require('./db');
async function run() {
  try {
    await db.query("ALTER TABLE leave_requests DROP COLUMN IF EXISTS start_date, DROP COLUMN IF EXISTS end_date, DROP COLUMN IF EXISTS session;");
    console.log("Success");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
