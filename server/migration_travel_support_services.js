const db = require('./db');

async function migrate() {
    console.log('--- Đang kiểm tra & cập nhật bảng Dịch vụ Hỗ trợ ---');
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS travel_support_services (
                id SERIAL PRIMARY KEY,
                sale_id INTEGER REFERENCES users(id),
                service_type VARCHAR(100),
                group_name VARCHAR(255),
                service_name TEXT NOT NULL,
                usage_date DATE,
                departure_date DATE,
                return_date DATE,
                route TEXT,
                quantity NUMERIC DEFAULT 1,
                unit_cost NUMERIC DEFAULT 0,
                total_cost NUMERIC DEFAULT 0,
                unit_price NUMERIC DEFAULT 0,
                total_income NUMERIC DEFAULT 0,
                tax NUMERIC DEFAULT 0,
                profit NUMERIC DEFAULT 0,
                collected_amount NUMERIC DEFAULT 0,
                notes TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Bảng travel_support_services đã sẵn sàng!');
    } catch (error) {
        console.error('❌ Lỗi migration:', error);
    }
}

migrate();
