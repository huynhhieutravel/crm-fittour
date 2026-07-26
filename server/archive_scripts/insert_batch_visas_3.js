require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const providers = [
  {
    code: 'EGY-001',
    name: 'Egypt Embassy in Hanoi, Vietnam',
    phone: '+84 24 3829 4999',
    created_at: '2024-05-22 00:00:00',
    services: [
      { sku: '117', name: 'Phí LSQ', cost: 720000, sale: 0 },
      { sku: '118', name: 'Phí tư vấn. xử lý', cost: 100000, sale: 0 },
      { sku: '119', name: 'HH trực tiếp', cost: 100000, sale: 0 },
      { sku: '120', name: 'Phí dịch vụ visa FIT', cost: 0, sale: 1600000 },
      { sku: '121', name: 'Phí dịch vụ visa Agent', cost: 0, sale: 1300000 }
    ]
  },
  {
    code: 'IND-001',
    name: 'India Embassy',
    address: '214 Đ. Võ Thị Sáu, Võ Thị Sáu, Quận 3, Thành phố Hồ Chí Minh',
    phone: '028 3744 2400',
    created_at: '2024-05-22 00:00:00',
    services: [
      { sku: '107', name: 'Phí LSQ', cost: 511200, sale: 0 },
      { sku: '108', name: 'Phí tư vấn', cost: 100000, sale: 0 },
      { sku: '109', name: 'HH trực tiếp', cost: 50000, sale: 0 },
      { sku: '110', name: 'Phí dịch vụ Visa FIT', cost: 0, sale: 1500000 },
      { sku: '111', name: 'Phí dịch vụ Visa Agent', cost: 0, sale: 1200000 },
      { sku: '112', name: 'Phí LSQ', cost: 511200, sale: 0 },
      { sku: '113', name: 'Phí Tư vấn', cost: 100000, sale: 0 },
      { sku: '114', name: 'HH trực tiếp', cost: 50000, sale: 0 },
      { sku: '115', name: 'Phí dịch vụ Visa FIT', cost: 0, sale: 2500000 },
      { sku: '116', name: 'Phí dịch vụ Visa Agent', cost: 0, sale: 2100000 }
    ]
  }
];

async function seed() {
  for (const p of providers) {
    try {
      const address = p.address || null;
      const res = await db.query(`
        INSERT INTO visa_providers (code, name, address, phone, created_at, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id;
      `, [p.code, p.name, address, p.phone, p.created_at, 'active']);
      
      const providerId = res.rows[0].id;
      console.log('Created provider:', p.name, 'with ID:', providerId);
      
      for (const s of p.services) {
        await db.query(`
          INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, cost_price, sale_price, quantity, kt_price, rate)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
        `, [providerId, s.sku, s.name, 'Visa', s.cost, s.sale, 1.00, 0, 0]);
      }
      
      console.log('Seed completed for', p.name);
    } catch (e) {
      console.error('Error seeding data for', p.name, e.message);
    }
  }
  process.exit(0);
}

seed();
