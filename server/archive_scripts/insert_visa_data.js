require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

async function seed() {
  try {
    const providerRes = await db.query(`
      INSERT INTO visa_providers (code, name, created_at, status)
      VALUES ('VS-0001', 'VISA KHẨN - cá nhân', '2024-10-01 00:00:00', 'active')
      RETURNING id;
    `);
    
    const providerId = providerRes.rows[0].id;
    
    await db.query(`
      INSERT INTO visa_provider_contacts (visa_provider_id, name, phone)
      VALUES ($1, 'NGUYEN THI MINH NGAN', '0795767477');
    `, [providerId]);
    
    await db.query(`
      INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, cost_price, sale_price, quantity, kt_price, rate)
      VALUES 
      ($1, '248', 'Phí Visa Single - Triều Hảo', 'Visa', 300000, 0, 1.00, 0, 0),
      ($1, '249', 'Phí visa nhiều lần', 'Visa', 600000, 0, 1.00, 0, 0);
    `, [providerId]);

    console.log('Seed completed for VS-0001');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();
