require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const provider = {
  code: 'CAN-001',
  name: 'Canada Embassy',
  phone: '028 3827 9899',
  created_at: '2024-05-22 00:00:00',
  services: [
    { sku: '100', name: 'Phí LSQ Canada', desc: '', cost: 3600000, sale: 0 },
    { sku: '101', name: 'Phí dịch thuật', desc: 'dịch thuật tư pháp 50k/ tramg', cost: 1000000, sale: 0 },
    { sku: '102', name: 'Phí Tư vấn', desc: '', cost: 100000, sale: 0 },
    { sku: '103', name: 'HH Trực tiếp', desc: '', cost: 100000, sale: 0 },
    { sku: '104', name: 'Phí trung tâm tiếp nhận', desc: 'Phí lăn tay 26$', cost: 617000, sale: 0 },
    { sku: '105', name: 'Phí dịch vụ visa Fittour KL', desc: '', cost: 0, sale: 7500000 },
    { sku: '106', name: 'Phí dịch vụ visa Fittour Agent', desc: '', cost: 0, sale: 6700000 }
  ]
};

async function seed() {
  try {
    const res = await db.query(`
      INSERT INTO visa_providers (code, name, phone, created_at, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id;
    `, [provider.code, provider.name, provider.phone, provider.created_at, 'active']);
    
    const providerId = res.rows[0].id;
    console.log('Created provider:', provider.name, 'with ID:', providerId);
    
    for (const s of provider.services) {
      await db.query(`
        INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, description, cost_price, sale_price, quantity, kt_price, rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `, [providerId, s.sku, s.name, 'Visa', s.desc, s.cost, s.sale, 1.00, 0, 0]);
    }
    
    console.log('Seed completed for', provider.name);
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data:', e.message);
    process.exit(1);
  }
}

seed();
