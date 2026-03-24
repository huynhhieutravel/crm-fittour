const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    console.log('Using DB URL:', process.env.DATABASE_URL);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        console.log('--- Customers Table ---');
        const custRes = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers'");
        custRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

        console.log('\n--- Lead Notes Table ---');
        const notesRes = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'lead_notes'");
        notesRes.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
