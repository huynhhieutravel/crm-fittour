require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const provider = {
  code: 'KOR-001',
  name: 'Korea Ambasy',
  phone: '1234',
  created_at: '2024-05-20 00:00:00',
  services: [
    { sku: '55', name: 'Phí Tem LSQ 80$', desc: 'Quy định cấp Multi cần dán 2 tem 40$', qty: 1.00, cost: 2050000, sale: 0 },
    { sku: '56', name: 'Phí Trung tâm tiếp nhận KVAC', desc: '343 Điện Biên Phủ, Q3', qty: 1.00, cost: 390000, sale: 0 },
    { sku: '57', name: 'Phí dịch Thuật', desc: 'dịch thuật tư pháp tính theo trang', qty: 6.00, cost: 50000, sale: 0 },
    { sku: '58', name: 'Phí Ship', desc: '(Phí Ship, xử lý hình ảnh, Bưu điện,...)', qty: 1.00, cost: 100000, sale: 0 },
    { sku: '59', name: 'HH trực tiếp', desc: 'Phí trách nhiệm xuyên suốt trong qúa trình xử lý hồ sơ', qty: 1.00, cost: 50000, sale: 0 },
    { sku: '67', name: 'Phí Visa Fittour', desc: 'Phí visa Thu vào', qty: 1.00, cost: 0, sale: 5500000 },
    { sku: '191', name: 'Phí rửa/ in ảnh KTS', desc: 'Phí in 1 set 4 ảnh thẻ', qty: 1.00, cost: 30000, sale: 0 }
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
      `, [providerId, s.sku, s.name, 'Visa', s.desc, s.cost, s.sale, s.qty, 0, 0]);
    }
    
    console.log('Seed completed for', provider.name);
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data:', e.message);
    process.exit(1);
  }
}

seed();
