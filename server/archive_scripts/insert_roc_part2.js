require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const services = [
  { sku: '84', name: 'Phí LSQ', desc: 'Phí LSQ 50$', cost: 1280000, sale: 0 },
  { sku: '85', name: 'Phí xét khẩn', desc: 'Phí phụ thu xét khẩn 25$', cost: 650000, sale: 0 },
  { sku: '86', name: 'HH trực tiếp', desc: 'Phí trách nhiệm xuyên suốt khi trả KQ visa', cost: 100000, sale: 0 },
  { sku: '87', name: 'Phí DV visa Fittour KL', desc: 'Phí chưa bao gồm Phí khẩn - Khách lẻ', cost: 0, sale: 2600000 },
  { sku: '88', name: 'Phí DV visa Fittour Agent', desc: 'Phí chưa bao gồm Phí khẩn - Agent', cost: 0, sale: 2100000 }
];

async function seed() {
  try {
    const res = await db.query(`SELECT id FROM visa_providers WHERE code = 'ROC-001'`);
    if (res.rows.length === 0) {
      console.log('Provider ROC-001 not found!');
      process.exit(1);
    }
    const providerId = res.rows[0].id;
    
    // update phone
    await db.query(`UPDATE visa_providers SET phone = '+842834' WHERE id = $1`, [providerId]);
    
    for (const s of services) {
      await db.query(`
        INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, description, cost_price, sale_price, quantity, kt_price, rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `, [providerId, s.sku, s.name, 'Visa', s.desc, s.cost, s.sale, 1.00, 0, 0]);
    }
    
    console.log('Seed completed for ROC Taiwan Part 2');
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data:', e.message);
    process.exit(1);
  }
}

seed();
