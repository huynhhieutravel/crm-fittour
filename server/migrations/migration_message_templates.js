const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function migrate() {
    try {
        console.log('Connecting to database:', process.env.DATABASE_URL);
        
        // 1. Create table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS message_templates (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                payload JSONB NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ Table message_templates created (or already exists).');

        // 2. Clear existing templates (optional, just to be safe for seed)
        await pool.query(`TRUNCATE TABLE message_templates RESTART IDENTITY CASCADE;`);

        // 3. Insert Dummy Data (Ladakh & Tân Cương)
        const ladakhPayload = {
            "template_type": "generic",
            "elements": [
                {
                    "title": "🍁 Tour Ladakh - Mùa Thu Vàng (15/09)",
                    "image_url": "https://fittour.vn/wp-content/uploads/2023/10/DJI_0442-scaled.jpg",
                    "subtitle": "Giá từ: 35.000.000 VNĐ\\nĐã bao gồm: Vé máy bay KHỨ HỒI, Visa, HDV tiếng Việt, KS 4 sao.",
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": "https://fittour.vn/kham-pha-vung-dat-tieu-tay-tang-an-do-tour-ladakh-10n9d/",
                            "title": "Xem Chi Tiết"
                        },
                        {
                            "type": "postback",
                            "title": "Giữ Chỗ Ngay",
                            "payload": "BOOK_LADAKH"
                        }
                    ]
                }
            ]
        };

        const tancuongPayload = {
            "template_type": "generic",
            "elements": [
                {
                    "title": "Road Trip Tân Cương - Hồ Bạch Sa",
                    "image_url": "https://media.fittour.vn/uploads/2025/08/road-trip-tan-cuong-ho-bach-sa-cap-doi-fit-tour.webp",
                    "subtitle": "Khám phá danh sách các tour du lịch nước ngoài tuyệt đẹp cùng FIT Tour.",
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": "https://fittour.vn/du-lich-nuoc-ngoai/",
                            "title": "Xem Trên Website"
                        }
                    ]
                }
            ]
        };

        await pool.query(`
            INSERT INTO message_templates (name, payload) 
            VALUES ($1, $2), ($3, $4)
        `, ['Mẫu Thẻ Ladakh 15/9', ladakhPayload, 'Mẫu Thẻ Tân Cương', tancuongPayload]);
        
        console.log('✅ Dummy templates inserted successfully.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

migrate();
