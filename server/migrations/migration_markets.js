const db = require('../db');

async function migrate() {
  console.log('--- STARTING MARKETS TABLE MIGRATION ---');
  try {
    // 1. Tạo bảng markets
    console.log('Creating markets table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS markets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id INTEGER REFERENCES markets(id) ON DELETE SET NULL,
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // 2. Kiểm tra nếu đã có data thì skip
    const existing = await db.query('SELECT COUNT(*) as count FROM markets');
    if (Number(existing.rows[0].count) > 0) {
      console.log('Markets table already has data. Skipping seed.');
      process.exit(0);
    }

    // 3. Seed data - Cấu trúc phân cấp Cha-Con
    console.log('Seeding market data...');
    
    const MARKET_TREE = [
      {
        name: 'Việt Nam',
        children: [
          'Việt Nam (MICE)', 'TP.HCM', 'Hà Nội', 'Nha Trang', 'Vũng Tàu',
          'Long Hải - Hồ Tràm', 'Phú Yên', 'Đà Lạt', 'Bảo Lộc', 'Đà Nẵng',
          'Hội An', 'Phan Thiết', 'Hàm Thuận Nam', 'Ninh Chữ', 'Châu Đốc',
          'Phú Quốc', 'Hạ Long', 'Đồng Nai', 'Miền Tây', 'Cần Thơ'
        ]
      },
      {
        name: 'Trung Quốc Đại Lục',
        children: [
          'Trung Quốc', 'Bắc Kinh', 'Cáp Nhĩ Tân', 'Cửu Trại Câu',
          'Giang Nam', 'Giang Tây', 'Lệ Giang', 'Tân Cương', 'Tây An',
          'Tây Tạng', 'Vân Nam', 'Á Đinh', 'Trương Gia Giới', 'Quý Châu',
          'Trùng Khánh', 'Thượng Hải'
        ]
      },
      {
        name: 'Đông Bắc Á',
        children: ['Hàn Quốc', 'Nhật Bản', 'Mông Cổ', 'Đài Loan']
      },
      {
        name: 'Nam Á & Himalayas',
        children: [
          'Ấn Độ', 'Bhutan', 'Himalayas', 'Kailash', 'Kashmir',
          'Ladakh', 'Nepal', 'Pakistan'
        ]
      },
      {
        name: 'Trung Á & Lân Cận',
        children: ['Trung Á', 'Caucasus', 'Silk Road']
      },
      {
        name: 'Đông Nam Á',
        children: [
          'Đông Nam Á', 'Bali', 'Bromo', 'Campuchia', 'Thái Lan',
          'Singapore', 'Malaysia', 'Lào', 'Philippines'
        ]
      },
      {
        name: 'Châu Âu & Nga',
        children: ['Châu Âu', 'Tây Âu', 'Bắc Âu', 'Đông Âu', 'Nga - Murmansk']
      },
      {
        name: 'Trung Đông & Châu Phi',
        children: [
          'Trung Đông', 'Thổ Nhĩ Kỳ', 'Dubai', 'Ai Cập', 'Morocco', 'Châu Phi'
        ]
      },
      {
        name: 'Châu Úc & Châu Mỹ',
        children: ['Úc', 'New Zealand', 'Mỹ', 'Canada']
      }
    ];

    for (let gi = 0; gi < MARKET_TREE.length; gi++) {
      const group = MARKET_TREE[gi];
      
      // Insert parent (nhóm gốc)
      const parentRes = await db.query(
        'INSERT INTO markets (name, parent_id, sort_order) VALUES ($1, NULL, $2) RETURNING id',
        [group.name, gi * 10]
      );
      const parentId = parentRes.rows[0].id;
      console.log(`  ✅ Nhóm: ${group.name} (id=${parentId})`);

      // Insert children
      for (let ci = 0; ci < group.children.length; ci++) {
        await db.query(
          'INSERT INTO markets (name, parent_id, sort_order) VALUES ($1, $2, $3)',
          [group.children[ci], parentId, ci * 10]
        );
      }
      console.log(`     → ${group.children.length} điểm đến`);
    }

    console.log('--- MARKETS MIGRATION COMPLETED SUCCESSFULLY ---');
    process.exit(0);
  } catch (err) {
    console.error('MIGRATION FAILED:', err);
    process.exit(1);
  }
}

migrate();
