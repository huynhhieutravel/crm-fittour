const { Pool } = require('pg');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Chống lỗi Lệch múi giờ Z (Timezone Shift) trên VPS
pool.on('connect', async (client) => {
  await client.query("SET timezone = 'Asia/Ho_Chi_Minh'");
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool
};
