/**
 * DEEP QA VERIFICATION SUITE - CRM FIT TOUR
 * Kiểm thử toàn diện và sâu rộng toàn bộ các logic của Zalo AI Engine:
 * 1. Cấu hình Database
 * 2. Guardrail Regex xưng hô & bảo vệ địa danh nước Anh
 * 3. Loại bỏ câu hỏi thừa khi có SĐT
 * 4. Bộ lọc điểm khởi hành (HCM vs Hà Nội)
 * 5. Live Gemini API End-to-End (3 kịch bản: Hỏi lịch bay HCM, Cho SĐT, Tour nước Anh)
 */
require('dotenv').config({ path: 'server/.env' });
const db = require('../db');
const zaloAiService = require('../services/zaloAiService');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runDeepQA() {
  console.log('================================================================');
  console.log('         DEEP QA VERIFICATION SUITE - FIT TOUR CRM AI           ');
  console.log('================================================================\n');

  // -------------------------------------------------------------
  // PHẦN 1: KIỂM TRA DATABASE (ai_agent_settings)
  // -------------------------------------------------------------
  console.log('--- PHẦN 1: KIỂM TRA CẤU HÌNH DATABASE ---');
  try {
    const configRes = await db.query("SELECT setting_key, setting_value FROM ai_agent_settings WHERE setting_key = 'chat_instructions'");
    const chatInstr = configRes.rows[0]?.setting_value || {};
    
    assert(
      chatInstr.greeting_message && chatInstr.greeting_message.includes('Quý khách'),
      'Greeting message trong DB có xưng hô "Quý khách"'
    );
    assert(
      !/(anh\/chị|anh\b|chị\b)/i.test(chatInstr.greeting_message),
      'Greeting message trong DB hoàn toàn sạch từ "anh", "chị", "anh/chị"'
    );
    assert(
      chatInstr.instructions && chatInstr.instructions.includes('Quý khách') && chatInstr.instructions.includes('tuyệt đối không dùng anh/chị'),
      'Chat instructions trong DB có điều khoản bắt buộc xưng "Quý khách"'
    );
  } catch (err) {
    assert(false, `Lỗi đọc DB: ${err.message}`);
  }

  // -------------------------------------------------------------
  // PHẦN 2: KIỂM TRA REGEX GUARDRAIL (formatAiReply)
  // -------------------------------------------------------------
  console.log('\n--- PHẦN 2: KIỂM TRA REGEX GUARDRAIL (formatAiReply) ---');
  
  // 2.1. Đổi anh/chị có tên -> Quý khách (không ghép tên)
  const t1 = zaloAiService.formatAiReply('Chào anh Linh, em có thể hỗ trợ gì cho anh Linh ạ?');
  assert(t1.includes('Quý khách') && !t1.includes('Linh') && !t1.includes('anh'), `Thay "anh Linh" -> "Quý khách" (Kết quả: "${t1}")`);

  const t2 = zaloAiService.formatAiReply('Dạ em chào chị Lan, chúc chị Lan một ngày tốt lành!');
  assert(t2.includes('Quý khách') && !t2.includes('Lan') && !t2.includes('chị'), `Thay "chị Lan" -> "Quý khách" (Kết quả: "${t2}")`);

  const t3 = zaloAiService.formatAiReply('Chào Quý khách Hoàng, rất vui được gặp Quý khách Hoàng.');
  assert(t3.includes('Quý khách') && !t3.includes('Hoàng'), `Loại bỏ tên riêng "Quý khách Hoàng" -> "Quý khách" (Kết quả: "${t3}")`);

  // 2.2. Không nuốt các từ thông dụng tiếng Việt
  const t4 = zaloAiService.formatAiReply('Quý khách có thể tham khảo lịch trình và Quý khách vui lòng kiểm tra lại nhé.');
  assert(t4.includes('có thể') && t4.includes('vui lòng'), `Bảo tồn các từ vựng phổ biến "có thể", "vui lòng" (Kết quả: "${t4}")`);

  const t5 = zaloAiService.formatAiReply('Quý khách an tâm trải nghiệm, Quý khách cần thêm thông tin gì không ạ?');
  assert(t5.includes('an tâm') && t5.includes('cần'), `Bảo tồn các từ "an tâm", "cần" (Kết quả: "${t5}")`);

  // 2.3. Bảo vệ địa danh nước Anh / visa Anh
  const t6 = zaloAiService.formatAiReply('FIT TOUR có tour Anh khởi hành từ HCM và hỗ trợ thủ tục visa Anh cho Quý khách.');
  assert(t6.includes('tour Anh') && t6.includes('visa Anh'), `Bảo vệ chuẩn xác "tour Anh" và "visa Anh" (Kết quả: "${t6}")`);

  const t7 = zaloAiService.formatAiReply('Vương quốc Anh là điểm đến tuyệt vời, Quý khách muốn đi Anh vào mùa thu không ạ?');
  assert(t7.includes('Vương quốc Anh') && t7.includes('đi Anh'), `Bảo vệ "Vương quốc Anh" và "đi Anh" (Kết quả: "${t7}")`);

  // 2.4. Đuôi câu thân mật
  const t8 = zaloAiService.formatAiReply('Em sẽ gửi lịch ngay anh nhé!');
  assert(t8.includes('ngay nhé ạ!') && !t8.includes('anh nhé'), `Đổi đuôi câu "ngay anh nhé!" -> "ngay nhé ạ!" (Kết quả: "${t8}")`);

  const t9 = zaloAiService.formatAiReply('Dạ để em hỗ trợ chị nhé.');
  assert(t9.includes('nhé ạ!') || t9.includes('Quý khách'), `Đổi đuôi câu "chị nhé" lịch sự (Kết quả: "${t9}")`);

  // -------------------------------------------------------------
  // PHẦN 3: KIỂM TRA LOẠI BỎ CÂU HỎI THỪA (removeTrailingQuestions)
  // -------------------------------------------------------------
  console.log('\n--- PHẦN 3: KIỂM TRA LOẠI BỎ CÂU HỎI THỪA (removeTrailingQuestions) ---');

  const qText1 = `Dạ FIT TOUR đã nhận được số điện thoại của Quý khách. Chuyên viên tư vấn sẽ liên hệ trực tiếp để tư vấn chi tiết cho mình ngay nhé ạ!

Quý khách dự định đi mấy người và có cần hỗ trợ visa luôn không ạ?`;
  const cleanQ1 = zaloAiService.removeTrailingQuestions(qText1);
  assert(!cleanQ1.includes('visa') && !cleanQ1.includes('mấy người') && !cleanQ1.endsWith('?'), `Cắt sạch câu hỏi mở ở đoạn cuối (Kết quả: "${cleanQ1.replace(/\n/g, ' ')}")`);
  assert(cleanQ1.includes('liên hệ'), 'Giữ trọn vẹn thông báo chuyên viên liên hệ');

  const qText2 = `Dạ em cảm ơn Quý khách rất nhiều. Quý khách muốn đi vào tháng mấy ạ?`;
  const cleanQ2 = zaloAiService.removeTrailingQuestions(qText2);
  assert(!cleanQ2.endsWith('?') && !cleanQ2.includes('tháng mấy'), `Cắt câu hỏi đơn lẻ và tự động thêm câu chốt liên hệ`);
  assert(cleanQ2.includes('liên hệ trực tiếp'), 'Tự động bổ sung câu chốt liên hệ chuẩn nếu thiếu');

  // -------------------------------------------------------------
  // PHẦN 4: KIỂM TRA BỘ LỌC ĐIỂM KHỞI HÀNH (TP.HCM vs HÀ NỘI)
  // -------------------------------------------------------------
  console.log('\n--- PHẦN 4: KIỂM TRA BỘ LỌC ĐIỂM KHỞI HÀNH ---');
  
  // 4.1. Lọc thủ công HCM
  const hcmDepartures = await zaloAiService.queryDepartures({ keyword: 'Bắc Kinh', departure_city: 'hcm' });
  const hasHcmTour = hcmDepartures.departures?.some(d => d.departure_code?.includes('SGN') || d.start_date_str === '06/11/2026');
  const hasNoHanoiInHcm = !hcmDepartures.departures?.some(d => d.departure_code?.includes('HAN') || d.start_date_str === '04/11/2026');
  assert(hasHcmTour, `Tìm thấy tour Bắc Kinh khởi hành từ HCM (06/11)`);
  assert(hasNoHanoiInHcm, `Bộ lọc HCM loại bỏ hoàn toàn các tour khởi hành từ Hà Nội (04/11)`);

  // 4.2. Lọc thủ công Hà Nội
  const hanDepartures = await zaloAiService.queryDepartures({ keyword: 'Bắc Kinh', departure_city: 'hanoi' });
  const hasHanTour = hanDepartures.departures?.some(d => d.departure_code?.includes('HAN') || d.start_date_str === '04/11/2026');
  const hasNoHcmInHan = !hanDepartures.departures?.some(d => d.departure_code?.includes('SGN') || d.start_date_str === '06/11/2026');
  assert(hasHanTour, `Tìm thấy tour Bắc Kinh khởi hành từ Hà Nội (04/11)`);
  assert(hasNoHcmInHan, `Bộ lọc Hà Nội loại bỏ hoàn toàn các tour khởi hành từ HCM`);

  // 4.3. Tự động nhận diện từ khóa "tour bắc kinh khởi hành hcm"
  const autoHcm = await zaloAiService.queryDepartures({ keyword: 'tour bắc kinh khởi hành hcm' });
  assert(autoHcm.detected_city === 'hcm', `Tự động trích xuất departure_city = 'hcm' từ keyword`);
  assert(autoHcm.count > 0 && !autoHcm.departures.some(d => d.departure_code?.includes('HAN')), `Tự động lọc chính xác danh sách tour HCM khi có keyword`);

  // -------------------------------------------------------------
  // PHẦN 5: LIVE GEMINI API END-TO-END (3 KỊCH BẢN THỰC TẾ)
  // -------------------------------------------------------------
  console.log('\n--- PHẦN 5: LIVE GEMINI API END-TO-END ---');
  
  // Scenario 1: Khách hỏi tour Bắc Kinh từ HCM, chưa có SĐT
  console.log('  -> Kịch bản 1: Khách hỏi "Tour Bắc Kinh bay từ Sài Gòn có lịch nào?" (Không có SĐT)');
  const res1 = await zaloAiService.processCustomerMessage({
    message: 'Tour Bắc Kinh bay từ Sài Gòn có lịch nào em ơi?',
    conversationHistory: [],
    leadContext: { zalo_uid: 'qa_tester_1' }
  });
  console.log(`     [AI Reply]:\n${res1.reply}\n`);
  assert(res1.reply.includes('Quý khách'), 'AI xưng hô "Quý khách" trong phản hồi');
  assert(!/(anh\/chị|anh\b|chị\b)/i.test(res1.reply), 'AI không đoán giới tính anh/chị');
  assert(res1.reply.includes('06/11') || res1.reply.includes('SGN'), 'AI trả về đúng lịch khởi hành từ HCM (06/11)');
  assert(!res1.reply.includes('04/11'), 'AI KHÔNG đưa lịch Hà Nội (04/11) vào kết quả HCM');
  assert(res1.reply.includes('?'), 'AI có câu hỏi mở ở cuối để tiếp tục hỗ trợ khách khi chưa có SĐT');

  // Scenario 2: Khách cung cấp số điện thoại
  console.log('  -> Kịch bản 2: Khách cung cấp số điện thoại "Tư vấn cho tôi qua số 0909888999 nha"');
  const res2 = await zaloAiService.processCustomerMessage({
    message: 'Tư vấn cho tôi qua số 0909888999 nha',
    conversationHistory: [
      { sender: 'user', text: 'Tour Bắc Kinh bay từ Sài Gòn có lịch nào em ơi?' },
      { sender: 'model', text: res1.reply }
    ],
    leadContext: { zalo_uid: 'qa_tester_1' }
  });
  console.log(`     [AI Reply]:\n${res2.reply}\n`);
  assert(res2.reply.includes('Quý khách'), 'AI xưng hô "Quý khách" khi cảm ơn khách cho số');
  assert(!/(anh\/chị|anh\b|chị\b)/i.test(res2.reply), 'AI không dùng anh/chị khi nhận SĐT');
  assert(res2.reply.includes('liên hệ') || res2.reply.includes('chuyên viên'), 'AI có câu chốt chuyên viên sẽ liên hệ');
  assert(!res2.reply.endsWith('?') && !res2.reply.endsWith('ạ?'), 'AI TUYỆT ĐỐI KHÔNG CÓ CÂU HỎI THỪA Ở CUỐI KHI CÓ SĐT');

  // Scenario 3: Khách hỏi tour Anh (bảo vệ địa danh nước Anh)
  console.log('  -> Kịch bản 3: Khách hỏi "FIT TOUR có tour Anh hay làm visa Anh không?"');
  const res3 = await zaloAiService.processCustomerMessage({
    message: 'FIT TOUR có tour Anh hay làm visa Anh không?',
    conversationHistory: [],
    leadContext: { zalo_uid: 'qa_tester_3' }
  });
  console.log(`     [AI Reply]:\n${res3.reply}\n`);
  assert(res3.reply.includes('Anh') || res3.reply.includes('Châu Âu'), 'AI hiểu và phản hồi đúng về tuyến tour Anh / Châu Âu');
  assert(!res3.reply.includes('tour Quý khách') && !res3.reply.includes('visa Quý khách'), 'Từ "tour Anh" / "visa Anh" KHÔNG bị biến thành "tour Quý khách"');

  // -------------------------------------------------------------
  // TỔNG KẾT
  // -------------------------------------------------------------
  console.log('================================================================');
  console.log(`TỔNG KẾT QA: ${passedTests}/${totalTests} TESTS PASSED (${((passedTests/totalTests)*100).toFixed(1)}%)`);
  if (failedTests > 0) {
    console.log(`CẢNH BÁO: CÓ ${failedTests} TEST BỊ LỖI!`);
  } else {
    console.log('XÁC NHẬN: TẤT CẢ CÁC BÀI TEST ĐỀU HOÀN TOÀN ĐẠT CHUẨN AN TOÀN 100%! 🎉');
  }
  console.log('================================================================');

  if (db.pool) {
    await db.pool.end();
  }
  process.exit(failedTests > 0 ? 1 : 0);
}

runDeepQA().catch(err => {
  console.error('Fatal QA error:', err);
  process.exit(1);
});
