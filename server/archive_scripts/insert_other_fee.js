require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const provider = {
  code: 'OTH-001',
  name: 'Other Fee',
  phone: '01111',
  created_at: '2024-05-23 00:00:00',
  services: [
    { sku: '143', name: 'Phí HPH Lãnh sự', desc: 'Làm tại LSQ đại diện tại VN', cost: 1500000, sale: 0 },
    { sku: '144', name: 'Phí HPH Bộ Ngoại Giao', desc: 'Làm tại Bộ Ngoại Giao TpHCM', cost: 70000, sale: 0 },
    { sku: '145', name: 'Rửa hình thẻ', desc: 'trường hợp LSQ yêu cầu bổ sung lại', cost: 30000, sale: 0 },
    { sku: '146', name: 'Phí Ship/ chuyển phát', desc: 'chuyển phát, bổ sung hồ sơ', cost: 50000, sale: 0 },
    { sku: '155', name: 'Phí dịch vụ visa dẫn khách Lăn tay', desc: 'Hồ sơ Đại Lý làm sẵn, NV Fit Tour chỉ dẫn khách nộp', cost: 0, sale: 300000 },
    { sku: '238', name: 'Phí Dịch Thuật Thu Hộ/ thanh toán hộ', desc: 'Phí tính theo trang 40k hoặc 50k/ trang', cost: 50000, sale: 50000 }
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
