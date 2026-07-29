const PgBoss = require('pg-boss');
require('dotenv').config();
const { readFileSync } = require('fs');

async function run() {
  const boss = new PgBoss({ connectionString: process.env.DATABASE_URL });
  await boss.start(); // Only starts the instance, doesn't register workers!
  
  // Actually, wait, instead of writing HTML again, what if we just fetch data and enqueue?
  // Let's just run send_test.js but REMOVE process.exit(0), so it stays alive until pg-boss finishes processing!
}
run();
