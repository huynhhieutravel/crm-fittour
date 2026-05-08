const db = require('./server/db');
async function run() {
  try {
    await db.query("ALTER TABLE leave_requests ADD COLUMN leave_dates JSONB DEFAULT '[]'");
    console.log('Column added');
  } catch (e) {
    console.error(e);
  } finally {
    process.exit();
  }
}
run();
