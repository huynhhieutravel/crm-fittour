const client = require('./db');
async function migrateCustomers() {
  try {
    // 1. Add new columns to customers table
    console.log('--- Adding columns to customers table ---');
    await client.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS first_deal_date DATE');
    await client.query('ALTER TABLE customers ADD COLUMN IF NOT EXISTS assigned_to INTEGER REFERENCES users(id)');
    
    // 2. Set default first_deal_date for existing customers
    await client.query('UPDATE customers SET first_deal_date = created_at::DATE WHERE first_deal_date IS NULL');
    
    // 3. Standardize gender values in customers table to English
    console.log('--- Standardizing gender in customers table ---');
    await client.query("UPDATE customers SET gender = 'female' WHERE gender = 'Nữ'");
    await client.query("UPDATE customers SET gender = 'male' WHERE gender = 'Nam'");
    
    console.log('--- ✅ Customers table migration completed! ---');
  } catch (err) {
    console.error('--- ❌ Error migrating customers:', err.message);
  } finally {
    process.exit();
  }
}
migrateCustomers();
