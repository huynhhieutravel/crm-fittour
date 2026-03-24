const { Client } = require('pg');
require('dotenv').config();

async function testNote() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  try {
    console.log('Inserting test note for customer 1...');
    const res = await client.query(
      'INSERT INTO lead_notes (customer_id, content, created_by) VALUES ($1, $2, $3) RETURNING *',
      [1, 'Manual test note from node script', 1]
    );
    console.log('Inserted note:', res.rows[0]);
    
    if (res.rows[0].customer_id === 1) {
      console.log('SUCCESS: customer_id saved correctly.');
    } else {
      console.log('FAILURE: customer_id is null or incorrect.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

testNote();
