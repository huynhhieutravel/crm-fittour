const { pool } = require('../db');

async function insertLeads() {
  const names = ['Telegram 6', 'Telegram 7', 'Telegram 8', 'Telegram 9', 'Telegram 10'];
  for (const name of names) {
    try {
      await pool.query(
        `INSERT INTO leads (name, source, status, created_at) 
         VALUES ($1, 'Telegram', 'Mới', NOW())`,
        [name]
      );
      console.log(`Inserted ${name}`);
    } catch (e) {
      console.error('Error inserting:', name, e.message);
    }
  }
  process.exit();
}

insertLeads();
