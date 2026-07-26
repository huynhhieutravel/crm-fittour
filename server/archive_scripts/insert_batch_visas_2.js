require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const providers = [
  {
    code: 'ANP-001',
    name: 'An Phuc Translation',
    phone: '0338818947',
    created_at: '2024-05-23 00:00:00',
    services: [
      { sku: '141', name: 'Dịch thuật dấu Tư Pháp', desc: 'tính theo trang', cost: 50000, sale: 0 },
      { sku: '142', name: 'dịch thuật dấu công ty', desc: 'tính theo trang', cost: 40000, sale: 0 },
      { sku: '189', name: 'Phí Ship hồ sơ dưới 10 trang', desc: 'Tính theo lược', cost: 27000, sale: 0 }
    ]
  },
  {
    code: 'GLO-001',
    name: 'Global Translatation',
    phone: '0909699191',
    created_at: '2024-05-23 00:00:00',
    services: [
      { sku: '139', name: 'Dịch thuật dấu Tư Pháp', desc: 'tính theo trang', cost: 50000, sale: 0 },
      { sku: '140', name: 'Dịch thuật dấu công ty', desc: 'tính theo trang', cost: 40000, sale: 0 }
    ]
  },
  {
    code: 'FRA-001',
    name: 'France Embassy Ho Chi Minh',
    address: '27 Đ. Nguyễn Thị Minh Khai, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
    phone: '028 3520 6800',
    notes: 'TLS Hồ Chí Minh - Vincom Building 45 Lý Tự Trọng',
    created_at: '2024-05-22 00:00:00',
    services: [
      { sku: '133', name: 'Phí LSQ', desc: '', cost: 2680000, sale: 0 },
      { sku: '134', name: 'Phí dịch thuật tư pháp', desc: '', cost: 1000000, sale: 0 },
      { sku: '135', name: 'Phí tứ vấn', desc: '', cost: 100000, sale: 0 },
      { sku: '136', name: 'HH trực tiếp', desc: '', cost: 100000, sale: 0 },
      { sku: '137', name: 'Phí dịch vụ Visa FIT', desc: '', cost: 0, sale: 6500000 },
      { sku: '138', name: 'Phí dịch vụ Visa Agent', desc: '', cost: 0, sale: 5300000 },
      { sku: '190', name: 'Phí trung tâm tiếp nhận TLS', desc: '', cost: 677000, sale: 0 }
    ]
  },
  {
    code: 'BRA-001',
    name: 'Embassy of Brazil in Hanoi',
    address: '44B P. Lý Thường Kiệt, Trần Hưng Đạo, Hoàn Kiếm, Hà Nội 10000',
    phone: '024 3843 2544',
    created_at: '2024-05-22 00:00:00',
    services: [
      { sku: '128', name: 'Phí LSQ', desc: '', cost: 5623000, sale: 0 },
      { sku: '129', name: 'Phí Tư vấn', desc: '', cost: 100000, sale: 0 },
      { sku: '130', name: 'Phí chuyển phát Hà Nội', desc: '', cost: 260000, sale: 0 },
      { sku: '131', name: 'HH trực tiếp', desc: '', cost: 50000, sale: 0 },
      { sku: '132', name: 'Phí dịch vụ visa FIT TOUR', desc: '', cost: 0, sale: 6700000 }
    ]
  },
  {
    code: 'NZL-001',
    name: 'New Zealand embassy',
    address: 'The Metropolitan, 235 Đ. Đồng Khởi, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh',
    phone: '0901 807 770',
    created_at: '2024-05-22 00:00:00',
    services: [
      { sku: '122', name: 'Phí LSQ', desc: '', cost: 3400000, sale: 0 },
      { sku: '123', name: 'Phí dịch Thuật', desc: '', cost: 1000000, sale: 0 },
      { sku: '124', name: 'Phí Tư vấn', desc: '', cost: 100000, sale: 0 },
      { sku: '125', name: 'HH trực tiếp', desc: '', cost: 100000, sale: 0 },
      { sku: '126', name: 'Phí dịch vụ Visa FIT', desc: '', cost: 0, sale: 6900000 },
      { sku: '127', name: 'Phí dịch vụ Visa Agent', desc: '', cost: 0, sale: 6500000 }
    ]
  }
];

async function seed() {
  for (const p of providers) {
    try {
      const address = p.address || null;
      const notes = p.notes || null;
      const res = await db.query(`
        INSERT INTO visa_providers (code, name, address, phone, notes, created_at, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
      `, [p.code, p.name, address, p.phone, notes, p.created_at, 'active']);
      
      const providerId = res.rows[0].id;
      console.log('Created provider:', p.name, 'with ID:', providerId);
      
      for (const s of p.services) {
        await db.query(`
          INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, description, cost_price, sale_price, quantity, kt_price, rate)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `, [providerId, s.sku, s.name, 'Visa', s.desc, s.cost, s.sale, 1.00, 0, 0]);
      }
      
      console.log('Seed completed for', p.name);
    } catch (e) {
      console.error('Error seeding data for', p.name, e.message);
    }
  }
  process.exit(0);
}

seed();
