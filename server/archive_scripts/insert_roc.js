require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const provider = {
  code: 'ROC-001',
  name: 'ROC Taiwan',
  phone: '+02834',
  created_at: '2024-05-21 00:00:00',
  services: [
    { sku: '89', name: 'PHÍ DỊCH VỤ FITTOUR', desc: '', cost: 0, sale: 500000 }
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
