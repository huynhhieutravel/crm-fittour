/**
 * Migration: Tạo bảng ai_agent_settings và rag_knowledge_chunks
 * Dành riêng cho Zalo Sandbox AI Agent (Meta Business Agent style)
 */
const db = require('../db');

async function up() {
  await db.query(`
    -- 1. Bảng lưu cấu hình AI Agent
    CREATE TABLE IF NOT EXISTS ai_agent_settings (
      id SERIAL PRIMARY KEY,
      setting_key VARCHAR(100) UNIQUE NOT NULL,
      setting_value JSONB NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW()
    );

    -- 2. Bảng lưu tài liệu / kiến thức RAG
    CREATE TABLE IF NOT EXISTS rag_knowledge_chunks (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      category VARCHAR(50) DEFAULT 'general',
      content TEXT NOT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_rag_knowledge_active ON rag_knowledge_chunks(is_active);
    CREATE INDEX IF NOT EXISTS idx_rag_knowledge_category ON rag_knowledge_chunks(category);
  `);

  // Seed default AI settings if not exists
  const initialSettings = [
    {
      key: 'basic_info',
      value: {
        company_name: 'FIT TOUR - Du lịch có GUU',
        description: 'FIT TOUR là thương hiệu tour thiết kế được yêu thích nhất 2024 - 2025, được vinh danh bởi Travellive Magazine & Hotlist 🏆 FIT TOUR - BEST OF BESPOKE TOUR IN VIET NAM 2024-2025 by Travellive Magazine & Hotlist.',
        website: 'https://fittour.vn/',
        phone: '0836999909',
        email: 'info@fittour.com.vn',
        address: 'TP. Hồ Chí Minh'
      }
    },
    {
      key: 'chat_instructions',
      value: {
        collect_phone: true,
        collect_email: false,
        timing: 'on_interest',
        instructions: `4. Không tự suy diễn\nKhông bao giờ tự tạo ra:\nGiá\nLịch\nChương trình\nVisa\nChính sách\nKhuyến mãi\nDịch vụ\n\nLuôn chào đón lịch sự, thân thiện, mang phong cách Du lịch có GUU. Khéo léo xin số điện thoại hoặc Zalo để gửi file PDF lịch trình chi tiết.`,
        greeting_message: 'Chào Anh/Chị, em là chuyên viên tư vấn của FIT TOUR - Du lịch có GUU. Rất vui được hỗ trợ Anh/Chị ạ. Anh/Chị đang quan tâm đến tour du lịch hay dịch vụ nào bên em thế ạ? Anh/Chị cứ cho em biết nhu cầu để em tư vấn kỹ hơn nhé.'
      }
    },
    {
      key: 'system_config',
      value: {
        is_sandbox_bot_enabled: true,
        mute_on_sales_assigned: true
      }
    }
  ];

  for (const s of initialSettings) {
    await db.query(`
      INSERT INTO ai_agent_settings (setting_key, setting_value)
      VALUES ($1, $2)
      ON CONFLICT (setting_key) DO NOTHING;
    `, [s.key, JSON.stringify(s.value)]);
  }

  // Seed sample knowledge items if empty
  const countRes = await db.query(`SELECT COUNT(*) FROM rag_knowledge_chunks`);
  if (parseInt(countRes.rows[0].count) === 0) {
    const sampleChunks = [
      {
        title: '[BU5] - THỊ TRƯỜNG 4 - AI CẬP - TOUR AI CẬP',
        category: 'tour',
        content: `Tour Ai Cập Huyền Bí - Hành trình sông Nile & Kim Tự Tháp:\n- Thời gian lý tưởng: Tháng 10 đến tháng 4 năm sau khi thời tiết mát mẻ.\n- Trải nghiệm nổi bật: Du thuyền 5 sao trên sông Nile, ngắm Kim Tự Tháp Giza, bay khinh khí cầu tại Luxor, đền Abu Simbel kỳ vĩ.\n- Lưu ý: Cần chuẩn bị visa Ai Cập trước chuyến bay.`
      },
      {
        title: '[BU4] - THỊ TRƯỜNG 3 - LADAKH - TOUR LADAKH',
        category: 'tour',
        content: `Tour Khám phá Ladakh - Tiểu Tây Tạng trên đất Ấn Độ:\n- Điểm nổi bật: Đèo Khardung La cao nhất thế giới, hồ Pangong Tso xanh biếc, thung lũng Nubra cưỡi lạc đà 2 bướu, tu viện cổ kính Thiksey và Hemis.\n- Lưu ý sức khỏe: Độ cao trên 3.500m - 5.300m. Cần nghỉ ngơi ngày đầu tại Leh để thích nghi độ cao.`
      },
      {
        title: '[VISA] - THỊ TRƯỜNG 5 - DỊCH VỤ VISA',
        category: 'visa',
        content: `Dịch vụ tư vấn và hỗ trợ Visa Du lịch FIT TOUR:\n- Hỗ trợ các thị trường: Trung Quốc, Ấn Độ, Châu Âu (Schengen), Ai Cập, Mông Cổ, Pakistan.\n- Quy trình: Thẩm định hồ sơ, tối ưu hóa hồ sơ tài chính và công việc, đặt lịch hẹn và theo dõi tiến độ cấp visa.\n- Liên hệ: Vui lòng để lại số điện thoại để chuyên viên visa hỗ trợ riêng.`
      }
    ];

    for (const chunk of sampleChunks) {
      await db.query(`
        INSERT INTO rag_knowledge_chunks (title, category, content)
        VALUES ($1, $2, $3);
      `, [chunk.title, chunk.category, chunk.content]);
    }
  }

  console.log('✅ Migration ai_agent_settings & rag_knowledge_chunks completed successfully');
}

up().then(() => process.exit(0)).catch(e => { console.error('❌ Migration failed:', e); process.exit(1); });
