const client = require('./db');
async function checkGender() {
  try {
    const res = await client.query('SELECT DISTINCT gender FROM leads');
    console.log('Genders in DB:', res.rows.map(r => r.gender));
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
checkGender();
