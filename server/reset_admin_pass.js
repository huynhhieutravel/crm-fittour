require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash('admin123', salt);
    const res = await db.query(
      `UPDATE users SET password = $1 WHERE username = 'admin' RETURNING id`,
      [hashedPw]
    );

    if (res.rows.length > 0) {
      console.log('Admin password reset successfully to: admin123');
    } else {
        const res2 = await db.query(
            "INSERT INTO users (username, password, full_name, email, role, role_id) VALUES ('admin', $1, 'Admin', 'admin@fittour.com', 'admin', 1) RETURNING id",
            [hashedPw]
        );
      console.log('Admin user added and password set to: admin123');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
