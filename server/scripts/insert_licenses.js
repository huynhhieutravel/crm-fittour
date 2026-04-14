const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function insertLicenses() {
  const items = [
    { name: 'Hợp đồng đoàn nội địa', link: 'https://drive.google.com/open?id=1UVVScGRA3qgLpJn3BByAAdHUFSgMPSSF&usp=drive_copy' },
    { name: 'Hợp đồng đoàn quốc tế', link: 'https://drive.google.com/open?id=1ibXbbgP4cgkFG9X1tqSkZH8VGhjM__RT&usp=drive_copy' },
    { name: 'Phiếu đề xuất kế toán', link: 'https://drive.google.com/open?id=1P28ad9tHeg1QSOkINxO36KlTDNS67vh6&usp=drive_copy' },
    { name: 'Quy định nhân sự FIT Tour', link: 'https://drive.google.com/open?id=17UZ2cBLEj4Mi0f-Wf1OO9x8K2s41U6ny&usp=drive_copy' }
  ];

  try {
    for (const item of items) {
      // Check if it already exists to avoid duplicates
      const check = await pool.query('SELECT id FROM licenses WHERE name = $1', [item.name]);
      if (check.rows.length === 0) {
        await pool.query('INSERT INTO licenses (name, link) VALUES ($1, $2)', [item.name, item.link]);
        console.log(`Inserted: ${item.name}`);
      } else {
        console.log(`Already exists: ${item.name}`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

insertLicenses();
