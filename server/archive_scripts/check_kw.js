const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query("SELECT id, code, name, keywords FROM tour_templates WHERE keywords ILIKE '%Mùa thu%'")
  .then(res => { console.log(res.rows); process.exit(); })
  .catch(err => { console.error(err); process.exit(); });
