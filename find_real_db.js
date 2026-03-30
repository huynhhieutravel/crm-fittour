const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server/.env') });

async function findData() {
  const client = new Client({
    connectionString: 'postgres://localhost:5432/postgres'
  });

  try {
    await client.connect();
    const res = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false');
    console.log('--- DATABASES FOUND ---');
    for (const row of res.rows) {
      console.log(`- ${row.datname}`);
    }
    
    for (const row of res.rows) {
      const dbName = row.datname;
      const dbClient = new Client({
        connectionString: `postgres://localhost:5432/${dbName}`
      });
      try {
        await dbClient.connect();
        const tables = await dbClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(`\nTables in [${dbName}]:`);
        console.log(tables.rows.map(t => t.table_name).join(', '));
      } catch (e) {
        console.log(`Could not connect to [${dbName}]: ${e.message}`);
      } finally {
        await dbClient.end();
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

findData();
