require('dotenv').config({ path: '../.env' });
const db = require('../db/index');

async function migrate() {
  try {
    await db.query('BEGIN');

    // 1. Dữ liệu tổng quan Khách sạn
    await db.query(`
      CREATE TABLE IF NOT EXISTS hotels (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE,
        name VARCHAR(255) NOT NULL,
        tax_id VARCHAR(50),
        build_year VARCHAR(10),
        phone VARCHAR(50),
        email VARCHAR(100),
        country VARCHAR(100),
        province VARCHAR(100),
        address TEXT,
        notes TEXT,
        star_rate VARCHAR(20),
        website VARCHAR(255),
        hotel_class VARCHAR(100),
        project_name VARCHAR(255),
        bank_account_name VARCHAR(255),
        bank_account_number VARCHAR(100),
        bank_name VARCHAR(255),
        market VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Danh bạ liên hệ Khách sạn
    await db.query(`
      CREATE TABLE IF NOT EXISTS hotel_contacts (
        id SERIAL PRIMARY KEY,
        hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(100),
        dob DATE,
        phone VARCHAR(50),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Các loại phòng / SKU của Khách sạn
    await db.query(`
      CREATE TABLE IF NOT EXISTS hotel_room_types (
        id SERIAL PRIMARY KEY,
        hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
        sku VARCHAR(50),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        max_occupancy INT DEFAULT 2,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Các Hợp đồng / Bảng giá theo thời vụ
    await db.query(`
      CREATE TABLE IF NOT EXISTS hotel_contracts (
        id SERIAL PRIMARY KEY,
        hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
        contract_name VARCHAR(255) NOT NULL,
        valid_from DATE,
        valid_to DATE,
        status VARCHAR(50) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Giá chi tiết (Rates) cho từng loại phòng theo Hợp đồng
    await db.query(`
      CREATE TABLE IF NOT EXISTS hotel_contract_rates (
        id SERIAL PRIMARY KEY,
        contract_id INT REFERENCES hotel_contracts(id) ON DELETE CASCADE,
        room_type_id INT REFERENCES hotel_room_types(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        day_type VARCHAR(50) DEFAULT 'All', -- All, Weekday, Weekend, Holiday
        currency VARCHAR(10) DEFAULT 'VND', -- Hỗ trợ VND, USD, EUR, vv.
        contract_price NUMERIC(20,2), -- Giá hợp đồng (Giá tham khảo)
        net_price NUMERIC(20,2), -- Giá vốn / NET
        sell_price NUMERIC(20,2), -- Giá bán
        description TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Quản lý định mức phòng (Allotment)
    await db.query(`
      CREATE TABLE IF NOT EXISTS hotel_allotments (
        id SERIAL PRIMARY KEY,
        hotel_id INT REFERENCES hotels(id) ON DELETE CASCADE,
        room_type_id INT REFERENCES hotel_room_types(id) ON DELETE CASCADE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        day_type VARCHAR(50) DEFAULT 'All',
        allotment_count INT DEFAULT 0, -- Số lượng phòng hold
        cut_off_days INT DEFAULT 0, -- Số ngày nhả phòng (VD: 14 ngày trước checkin)
        currency VARCHAR(10) DEFAULT 'VND',
        net_price NUMERIC(20,2),
        sell_price NUMERIC(20,2),
        description TEXT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query('COMMIT');
    console.log('Quản lý Khách sạn / Nhà Cung Cấp tables created successfully!');
  } catch (e) {
    await db.query('ROLLBACK');
    console.error('Error migrating hotels tables', e);
  } finally {
    process.exit();
  }
}

migrate();
