const client = require('./db');
async function migrateGender() {
  try {
    await client.query("UPDATE leads SET gender = 'female' WHERE gender = 'Nữ'");
    await client.query("UPDATE leads SET gender = 'male' WHERE gender = 'Nam'");
    console.log('Gender migration completed.');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit();
  }
}
migrateGender();
