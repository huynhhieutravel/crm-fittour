require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const providers = [
  {
    code: 'AUS-001',
    name: 'Australia Embassy',
    phone: '02835218100',
    created_at: '2024-05-21 00:00:00',
    services: [
      { sku: '78', name: 'Phí LSQ', cost: 3440000, sale: 0 },
      { sku: '79', name: 'Phí lăn tay - Trung tâm tiếp nhận VFS', cost: 271000, sale: 0 },
      { sku: '80', name: 'Phí tư vấn, chuyển phát', cost: 100000, sale: 0 },
      { sku: '81', name: 'HH trực tiếp', cost: 100000, sale: 0 },
      { sku: '82', name: 'Phí Visa dịch vụ - Khách Lẻ', desc: 'Phí áp dụng khách lẻ', cost: 0, sale: 6500000 },
      { sku: '83', name: 'Phí Visa Dịch vu - Agent', desc: 'Phí áp dụng Đại lí', cost: 0, sale: 5800000 },
      { sku: '156', name: 'Phí dịch thuật', desc: 'tính theo trang , dịch dấu tư pháp', cost: 50000, sale: 0 }
    ]
  },
  {
    code: 'USA-001',
    name: 'USA Embassy',
    phone: '+84283',
    created_at: '2024-05-21 00:00:00',
    services: [
      { sku: '68', name: 'Phí LSQ', desc: 'Phí LSQ 185$', cost: 4728000, sale: 0 },
      { sku: '69', name: 'Phí Chuyển phát Bưu điện', desc: 'Phí Bưu điện', cost: 290000, sale: 0 },
      { sku: '70', name: 'HH trực tiếp', desc: 'Phí trách nhiệm xuyên suốt', cost: 100000, sale: 0 },
      { sku: '71', name: 'Phí dịch vụ Fittour KL', desc: 'Phí khách lẻ', cost: 0, sale: 6900000 },
      { sku: '72', name: 'Phí dịch vụ Fit Tour Agent', desc: 'Phí Đại lí', cost: 0, sale: 6000000 },
      { sku: '73', name: 'Phí LSQ', desc: 'Phí LSQ 185$', cost: 4728600, sale: 0 },
      { sku: '74', name: 'Phí Chuyển phát', desc: 'Phí Ship hồ sơ LSQ', cost: 299000, sale: 0 },
      { sku: '75', name: 'HH trực tiếp', desc: 'Phí trách nhiệm xuyên suốt khi có KQ visa', cost: 100000, sale: 0 },
      { sku: '76', name: 'Phí dịch vụ Fittour KL', desc: 'Giá áp dụng khách lẻ', cost: 0, sale: 7200000 },
      { sku: '77', name: 'Phí dịch vụ Fittour Agent', desc: 'Giá áp dụng Đại lí', cost: 0, sale: 6200000 }
    ]
  },
  {
    code: 'PHO-001',
    name: 'Ngo Hoang Nguyen - Phoenix Tour',
    address: '292 Chu Văn An, Bình Thạnh',
    phone: '0973519587',
    created_at: '2024-05-21 00:00:00',
    services: [
      { sku: '63', name: 'Phí visa Single', desc: 'Phí Đại Lý - 7 ngày làm việc có Kết quả Visa Single', cost: 2000000, sale: 0 },
      { sku: '64', name: 'Phí visa Multi', desc: 'Phí Đại Lý - 7 ngày làm việc có Kết quả Visa Multi 5 năm', cost: 4500000, sale: 0 },
      { sku: '65', name: 'Phí visa GROUP - Đoàn Thể', desc: 'Submit visa trước 12 ngày - Yêu cầu HĐ trách nhiệm', cost: 1000000, sale: 0 },
      { sku: '66', name: 'Phí dịch vụ', cost: 1000000, sale: 0 }
    ]
  },
  {
    code: 'JAP-001',
    name: 'Japan Ambasy',
    address: '02839333510',
    phone: '02839333510',
    created_at: '2024-05-20 00:00:00',
    services: [
      { sku: '60', name: 'Phí Nộp trung gian', desc: 'dịch vụ thu về từ Du Lịch Việt', cost: 0, sale: 0, kt: 1000000 },
      { sku: '61', name: 'Phí Ship', cost: 0, sale: 0, kt: 100000 },
      { sku: '62', name: 'HH trực tiếp', desc: 'Phí trách nhiệm xuyên suốt quá trình xử lý visa', cost: 0, sale: 0, kt: 50000 },
      { sku: '164', name: 'Phí dịch vụ visa Fit Tour', cost: 0, sale: 2500000 },
      { sku: '165', name: 'Phí dịch vụ visa AGENT', cost: 0, sale: 1500000 }
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
        const desc = s.desc || '';
        const kt = s.kt || 0;
        await db.query(`
          INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, description, cost_price, sale_price, quantity, kt_price, rate)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `, [providerId, s.sku, s.name, 'Visa', desc, s.cost, s.sale, 1.00, kt, 0]);
      }
      
      console.log('Seed completed for', p.name);
    } catch (e) {
      console.error('Error seeding data for', p.name, e.message);
    }
  }
  process.exit(0);
}

seed();
