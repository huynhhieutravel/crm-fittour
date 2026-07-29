const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("UPDATE pgboss.job SET state = 'failed' WHERE state = 'active' AND name = 'send-email'")
  .then(() => process.exit())
  .catch(e => { console.error(e); process.exit(1); });
