require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

const services = [
  { sku: '49', name: 'Tem LSQ 20$', desc: 'Tem dán Form 20$', qty: 1.00, cost: 512000, sale: 0 },
  { sku: '50', name: 'Tem LSQ 30$', desc: 'Tem dán Form 30$ | Ghi chú: Áp dụng CT07 - Visa Đại Đô Thị 3 TP lớn (TpHCM, Dânng, Hanoi)', qty: 1.00, cost: 768000, sale: 0 },
  { sku: '51', name: 'Phí Trung tâm tiếp nhận KVAC', desc: '343 Điện Biên Phủ, Q3', qty: 1.00, cost: 390000, sale: 0 },
  { sku: '52', name: 'Phí Dịch Thuật', desc: 'Phí dịch thuật Tư pháp (tính theo trang)', qty: 6.00, cost: 50000, sale: 0 },
  { sku: '53', name: 'Phí Ship', desc: '', qty: 1.00, cost: 100000, sale: 0 },
  { sku: '54', name: 'HH trực tiếp', desc: 'Phí xử lý hồ sơ (Giao nhận, tư vấn, gửi xe, Nộp - trả KQ, Bổ sung LSQ)', qty: 1.00, cost: 50000, sale: 0 },
  { sku: '154', name: 'Phí dịch vụ Visa Fittour', desc: '', qty: 1.00, cost: 0, sale: 2500000 },
  { sku: '158', name: 'Phí dịch vụ visa Agent', desc: '', qty: 1.00, cost: 0, sale: 2000000 }
];

async function seed() {
  try {
    const res = await db.query(`SELECT id FROM visa_providers WHERE code = 'KOR-001'`);
    if (res.rows.length === 0) {
      console.log('Provider KOR-001 not found!');
      process.exit(1);
    }
    const providerId = res.rows[0].id;
    
    // update phone
    await db.query(`UPDATE visa_providers SET phone = '123' WHERE id = $1`, [providerId]);
    
    for (const s of services) {
      await db.query(`
        INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, description, cost_price, sale_price, quantity, kt_price, rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
      `, [providerId, s.sku, s.name, 'Visa', s.desc, s.cost, s.sale, s.qty, 0, 0]);
    }
    
    console.log('Seed completed for Korea Ambasy Part 2');
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data:', e.message);
    process.exit(1);
  }
}

seed();
