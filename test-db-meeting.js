require('dotenv').config({path: './server/.env'});
const db = require('./server/db');
db.query("SELECT * FROM meeting_bookings LIMIT 1")
  .then(res => console.log("OK:", res.rows))
  .catch(err => console.error("ERROR:", err.message))
  .finally(() => process.exit(0));
