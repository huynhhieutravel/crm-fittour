require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const providers = [
  {
    code: 'BT-001',
    name: 'BT Tour - Hà Nội',
    phone: '0919402166',
    created_at: '2024-08-16 00:00:00',
    contacts: [{ name: 'PHAN NGOC TINH', phone: '0919402166' }],
    services: [
      { sku: '231', name: 'Phí Visa Hàn Quốc - đầu Hà Nội', desc: 'Phí nộp visa HQ đầu Hà Nội', cost: 2170000 },
      { sku: '232', name: 'Phí Visa Nhật Bản - đầu Hà Nội', desc: 'Phí nộp visa NB đầu Hà Nội', cost: 1500000 },
      { sku: '233', name: 'Land Tour HQ', desc: '', cost: 0 }
    ]
  },
  {
    code: 'GON-001',
    name: 'Gonsee Travel - Hà Nội',
    phone: '0916050124',
    created_at: '2024-08-16 00:00:00',
    contacts: [{ name: 'DAO THI PHUONG ANH', phone: '0916050124' }],
    services: [
      { sku: '230', name: 'Phí visa Ai Cập đại lý', desc: 'Đại Lý nộp visa đầu Hà Nội', cost: 1500000 }
    ]
  },
  {
    code: 'DLV-001',
    name: 'Cty CP Truyền thông Du Lịch Việt',
    phone: '028 73056789',
    created_at: '2024-06-21 00:00:00',
    contacts: [{ name: 'LA MANH TOAN', phone: '0989754722' }],
    services: [
      { sku: '166', name: 'Phí nộp visa Nhat Bản single', desc: 'bao gồm phí LSQ và phí dịch vụ', cost: 1000000 },
      { sku: '167', name: 'Phí nộp visa Nhật bản Multi', desc: 'bao gồm phí LSQ và phí dịch vụ', cost: 2500000 },
      { sku: '168', name: 'Phí nộp visa đoàn (E-VISA GROUP)', desc: 'bao gồm phí LSQ và phí dịch vụ', cost: 1000000 },
      { sku: '239', name: 'Phí dịch vụ (Khách không đạt visa)', desc: 'Trường hợp khách rớt Visa', cost: 400000 }
    ]
  },
  {
    code: 'V24H-001',
    name: 'Visa 24H',
    phone: '0904097017',
    created_at: '2024-05-31 00:00:00',
    contacts: [{ name: 'BÙI THỊ THIỆN TÂM', phone: '' }],
    services: [
      { sku: '157', name: 'Phí visa Single - QT VN', desc: 'phí thu vào 24H', cost: 2590000 }
    ]
  },
  {
    code: 'TBT-001',
    name: 'Cty CP TMDV Thien Bao Tri TBT',
    address: '22 Hoa Thi, P7, Q Phu Nhuan, TpHCM',
    phone: '0917196778',
    created_at: '2024-05-27 00:00:00',
    contacts: [{ name: 'Ms. Hiền', title: 'GĐ', phone: '0917196778' }],
    services: [
      { sku: '150', name: 'Phí Visa TQ single', desc: 'Phí Visa Thu về TBT 100$', cost: 2590000 },
      { sku: '151', name: 'Phí Khẩn (Phí phát sinh nếu có)', desc: 'Phí khẩn xét 3 ngày có 50$', cost: 1129500 },
      { sku: '152', name: 'Phí Visa TQ (QT Canada)', desc: 'Phí cho QT Canada (Phí 135$)', cost: 3500000 },
      { sku: '153', name: 'Phí Visa TQ (QT Mỹ)', desc: 'Phí cho QT Mỹ (Phí 225$)', cost: 5700000 }
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
      
      for (const c of p.contacts) {
        // Wait, does visa_provider_contacts have title?
        // Let's just insert name and phone, title might not exist
        await db.query(`
          INSERT INTO visa_provider_contacts (visa_provider_id, name, phone)
          VALUES ($1, $2, $3);
        `, [providerId, c.name, c.phone || null]);
      }
      
      for (const s of p.services) {
        await db.query(`
          INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, description, cost_price, sale_price, quantity, kt_price, rate)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
        `, [providerId, s.sku, s.name, 'Visa', s.desc, s.cost, 0, 1.00, 0, 0]);
      }
      
      console.log('Seed completed for', p.name);
    } catch (e) {
      console.error('Error seeding data for', p.name, e.message);
    }
  }
  process.exit(0);
}

seed();
