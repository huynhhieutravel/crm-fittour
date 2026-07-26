const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fittour_crm',
  password: process.env.DB_PASSWORD || 'fittour@2024',
  port: process.env.DB_PORT || 5432,
});

async function run() {
    const payload = {
      template_type: "generic",
      elements: [
        {
          title: "Trần Quốc Thịnh (Kinh nghiệm 8 năm)",
          subtitle: "PROJECT MANAGER | GUIDE. Chuyên các tuyến Trung Quốc, Đông Nam Á, Himalaya...",
          image_url: "https://media.fittour.vn/uploads/2024/05/trip-planner-tran-thinh.webp",
          buttons: [
            {
              type: "web_url",
              title: "Liên hệ Chuyên Gia",
              url: "https://dulichcoguu.com/tran-quoc-thinh/"
            }
          ]
        }
      ]
    };

    try {
        await pool.query(
            'INSERT INTO message_templates (name, description, payload) VALUES ($1, $2, $3)',
            [
                'Thẻ Chuyên Gia - Trần Quốc Thịnh', 
                'Thẻ giới thiệu chuyên gia Trần Quốc Thịnh. HDV chuyên các tuyến Trung Quốc, Đông Nam Á, Hàn Quốc, Nhật Bản, Đài Loan, Himalaya, Con đường tơ lụa, Ai Cập, Ấn Độ.', 
                payload
            ]
        );
        console.log('Thêm thẻ thành công!');
    } catch (error) {
        console.error('Lỗi:', error.message);
    } finally {
        await pool.end();
    }
}

run();
