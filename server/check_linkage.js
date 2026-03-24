const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    try {
        console.log('--- NGUYEN A Lead Info ---');
        const lead = await client.query("SELECT * FROM leads WHERE name ILIKE 'Nguyen A'");
        console.log(lead.rows);

        console.log('\n--- NGUYEN A Customer Info ---');
        const cust = await client.query("SELECT * FROM customers WHERE name ILIKE 'NGUYEN A'");
        console.log(cust.rows);

        if (cust.rows.length > 0) {
            console.log('\n--- Linked Notes for Customer ---');
            const notes = await client.query("SELECT * FROM lead_notes WHERE customer_id = $1", [cust.rows[0].id]);
            console.log(notes.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
check();
