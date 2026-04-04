require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({ connectionString: process.env.DATABASE_URL });

const users = [
  { full_name: 'Trần Quốc Thịnh', username: 'tq1.sale', email: 'tq1.sale@fittour.com' },
  { full_name: 'Đoàn Thuý An', username: 'tq2.sale', email: 'tq2.sale@fittour.com' },
  { full_name: 'Nguyễn Quỳnh Phương', username: 'tq3.sale', email: 'tq3.sale@fittour.com' },
  { full_name: 'Lâm Mỹ Duyên', username: 'tq4.sale', email: 'tq4.sale@fittour.com' },
  { full_name: 'Nguyễn Hưng Thịnh', username: 'tq5.sale', email: 'tq5.sale@fittour.com' },
  { full_name: 'Lê Minh Tuấn', username: 'gu1.sale', email: 'gu1.sale@fittour.com' },
  { full_name: 'Bùi Ngọc Hiếu', username: 'gu2.sale', email: 'gu2.sale@fittour.com' },
  { full_name: 'Dương Quỳnh Như', username: 'gu3.sale', email: 'gu3.sale@fittour.com' }
];

async function run() {
  await client.connect();
  let result = "| Tên | Username | Password | BU |\n|---|---|---|---|\n";
  const chars = 'abcdefghijkmnpqrstuvwxyz23456789@#';
  
  for (const u of users) {
    let pwd = '';
    for (let i=0; i<8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    const hash = await bcrypt.hash(pwd, 10);
    
    const check = await client.query('SELECT username FROM users WHERE username = $1', [u.username]);
    let bu = u.username.startsWith('tq') ? 'BU1' : 'BU2';
    
    if (check.rows.length === 0) {
      await client.query('INSERT INTO users (username, password, full_name, email, role_id, is_active) VALUES ($1,$2,$3,$4,$5,$6)', [u.username, hash, u.full_name, u.email, 2, true]);
      result += `| ${u.full_name} | ${u.username} | \`${pwd}\` | ${bu} |\n`;
    } else {
      result += `| ${u.full_name} | ${u.username} | Đã tồn tại | ${bu} |\n`;
    }
  }
  console.log("----");
  console.log(result);
  console.log("----");
  process.exit(0);
}
run();
