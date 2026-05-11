const db = require('./db');
async function run() {
  try {
    await db.query("DROP TRIGGER IF EXISTS trigger_update_leave_balance ON leave_requests;");
    await db.query("DROP FUNCTION IF EXISTS update_leave_used_days();");
    console.log("Success dropping trigger");
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
