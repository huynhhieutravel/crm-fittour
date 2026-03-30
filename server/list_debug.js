const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const client = new Client({
    connectionString: 'postgres://localhost:5432/postgres'
  });
  await client.connect();
  
  console.log("--- DATABASES ---");
  const dbs = await client.query("SELECT datname FROM pg_database WHERE datistemplate = false");
  console.log(dbs.rows.map(r => r.datname));

  console.log("\n--- TABLES IN 'postgres' ---");
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  console.log(tables.rows.map(t => t.table_name));

  await client.end();
}
run();
