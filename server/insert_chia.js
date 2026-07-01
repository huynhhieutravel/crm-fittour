require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const provider = {
  code: 'CHI-001',
  name: 'Chia Embassy',
  phone: '+842834',
  created_at: '2024-05-21 00:00:00',
  services: [
    { sku: '90', name: 'Phí TT nhà Cung Cấp', desc: 'Thanh toán đơn vị xử lý trực tiếp 100$/ visa', cost: 2560000, sale: 0 },
    { sku: '91', name: 'Phí Tư vấn, xử lý', desc: '', cost: 100000, sale: 0 },
    { sku: '92', name: 'HH trực tiếp', desc: 'Phí trách nhiệm xuyên suốt', cost: 50000, sale: 0 },
    { sku: '93', name: 'Phí xét khẩn 3 ngày', desc: 'Phí khẩn xét 3 ngày đóng thêm 50$', cost: 1260000, sale: 0 },
    { sku: '94', name: 'Phí dịch vụ visa Fittour KL', desc: 'Giá áp dụng khách lẻ', cost: 0, sale: 3500000 },
    { sku: '95', name: 'Phí dịch vụ visa Fittour Agent', desc: 'Giá áp dụng Đại lí', cost: 0, sale: 3100000 }
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
