/**
 * Migration: Cập nhật quy tắc xưng hô "Quý khách" và lời chào Zalo AI trong ai_agent_settings
 */
const db = require('../db');

async function up() {
  console.log('[Migration] Bắt đầu cập nhật ai_agent_settings chuẩn hoá xưng hô Quý khách...');
  try {
    const res = await db.query("SELECT setting_value FROM ai_agent_settings WHERE setting_key = 'chat_instructions'");
    let currentVal = res.rows[0]?.setting_value || {};

    const newGreeting = 'Dạ FIT TOUR xin chào Quý khách! Em là tư vấn viên FIT TOUR. Rất vui được hỗ trợ Quý khách! 💚\nQuý khách đang quan tâm tour nào hoặc cần em tư vấn thêm thông tin gì ạ?';
    const newInstructions = `Tư vấn thân thiện, lịch sự, đúng phong cách FIT TOUR - Du lịch có Guu. BẮT BUỘC xưng em hoặc FIT TOUR, gọi khách là Quý khách (tuyệt đối không dùng anh/chị, không đoán giới tính, không ghép tên riêng vào sau Quý khách). Nếu có lịch khởi hành thì cung cấp ngày đi, giá và link website. Nếu chưa có lịch khởi hành cho tuyến khách hỏi, báo khách FIT TOUR hiện chưa có lịch công bố cho tuyến này và giới thiệu các tuyến thế mạnh (Ladakh, Bhutan, Mông Cổ, Trung Quốc, Ai Cập...) hoặc đề xuất thiết kế tour riêng (Bespoke). Tuyệt đối không chèo kéo xin SĐT nếu khách chỉ hỏi thông tin chung. Chỉ xin số điện thoại khi khách chủ động hỏi đặt cọc, tính giá đoàn riêng hoặc yêu cầu nhân viên tư vấn gọi lại.`;

    // Cập nhật giá trị nếu lời chào cũ còn chứa Anh/Chị
    if (!currentVal.greeting_message || /anh\/chị|anh\b|chị\b/i.test(currentVal.greeting_message)) {
      currentVal.greeting_message = newGreeting;
    }

    // Luôn đảm bảo quy tắc Quý khách được cập nhật vào instructions
    if (!currentVal.instructions || !currentVal.instructions.includes('Quý khách')) {
      currentVal.instructions = newInstructions;
    } else if (!currentVal.instructions.includes('tuyệt đối không dùng anh/chị')) {
      currentVal.instructions = newInstructions;
    }

    await db.query(`
      INSERT INTO ai_agent_settings (setting_key, setting_value, updated_at)
      VALUES ('chat_instructions', $1, NOW())
      ON CONFLICT (setting_key) DO UPDATE
      SET setting_value = $1, updated_at = NOW()
    `, [currentVal]);

    console.log('✅ [Migration] Cập nhật chat_instructions trong ai_agent_settings thành công!');
  } catch (err) {
    console.error('❌ [Migration] Lỗi cập nhật ai_agent_settings:', err.message);
  } finally {
    if (db.pool) {
      await db.pool.end();
    }
  }
}

up().catch(console.error);
