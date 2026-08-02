const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("UPDATE tour_templates SET keywords = 'Pakistan' WHERE code='PAKISTAN12N11D'")
  .then(res => { console.log('Done'); process.exit(); })
  .catch(err => { console.error(err); process.exit(); });
