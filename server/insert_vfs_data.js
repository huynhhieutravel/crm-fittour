require('dotenv').config({ path: __dirname + '/.env' });
const db = require('./db');

async function seed() {
  try {
    const providerRes = await db.query(`
      INSERT INTO visa_providers (code, name, address, phone, created_at, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id;
    `, ['VFS-001', 'VFS - TRUNG TÂM TIẾP NHẬN CHÂU ÂU', '04 ĐOÀN VĂN BƠ, QUẬN 4', '02835212002', '2024-08-16 00:00:00', 'active']);
    
    const providerId = providerRes.rows[0].id;
    console.log('Created provider with ID:', providerId);
    
    await db.query(`
      INSERT INTO visa_provider_contacts (visa_provider_id, name)
      VALUES ($1, 'CHI NHÁNH QUẬN 4 + Q1');
    `, [providerId]);
    
    await db.query(`
      INSERT INTO visa_provider_services (visa_provider_id, sku, name, visa_type, description, cost_price, sale_price, quantity, kt_price, rate)
      VALUES 
      ($1, '234', 'Phí trung tâm tiếp nhận', 'Visa', '', 750000, 0, 1.00, 0, 0),
      ($1, '235', 'Phí Lãnh sự quán', 'Visa', '', 2900000, 0, 1.00, 0, 0),
      ($1, '236', 'Phí Khẩn, Lịch ngoài', 'Visa', '', 3600000, 0, 1.00, 0, 0),
      ($1, '237', 'Phí photo chụp tại Trung tâm', 'Visa', '', 40000, 0, 1.00, 0, 0),
      ($1, '240', 'Phí Visa FIT thu về', 'Visa', 'Phí thu khách lẻ', 0, 6500000, 1.00, 0, 0),
      ($1, '241', 'Phí visa Agnecy thu về', 'Visa', 'Phí thu Đại Lý gửi khách', 0, 5800000, 1.00, 0, 0);
    `, [providerId]);

    console.log('Seed completed for VFS-001');
    process.exit(0);
  } catch (e) {
    console.error('Error seeding data:', e);
    process.exit(1);
  }
}

seed();
