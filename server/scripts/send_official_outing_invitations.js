const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const fs = require('fs');
const { sendMail } = require('../utils/mailer');

const INVITATIONS_JSON = path.resolve(__dirname, '../../outing-dalat-2026/assets/invitations_data.json');
const LOGS_DIR = path.resolve(__dirname, '../logs');
const REPORT_PATH = path.resolve(LOGS_DIR, 'invitations_dispatch_report.json');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function generateEmailHtml(member) {
  const displayName = member.nickname || member.ho_ten;
  const isLongTerm = member.tenure && member.tenure.includes('năm');

  const tenureTributeText = isLongTerm
    ? `⭐ <strong style="color: #c2410c;">Hành trình gắn bó cùng đại gia đình FIT TOUR:</strong> Bạn chính thức gia nhập từ ngày <strong>${member.join_date}</strong> — tính đến nay đã là <strong style="color: #111827; text-decoration: underline; text-decoration-color: #f59e0b;">${member.tenure}</strong> bền bỉ đồng hành, cống hiến và vượt qua bao mùa tour cùng công ty. FIT TOUR thật sự trân trọng và biết ơn sự gắn bó của bạn!`
    : `⭐ <strong style="color: #c2410c;">Hành trình gắn bó cùng đại gia đình FIT TOUR:</strong> Bạn gia nhập từ ngày <strong>${member.join_date}</strong> — dù mới đồng hành được <strong style="color: #111827; text-decoration: underline; text-decoration-color: #f59e0b;">${member.tenure}</strong>, bạn đã là một mảnh ghép nhiệt huyết và không thể thiếu của đại gia đình FIT TOUR. Cảm ơn năng lượng tích cực và sự đồng hành của bạn!`;

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thư mời ${displayName} tham dự FIT TOUR Company Trip 2026</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1f2937;">
  
  <!-- Outer Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 30px 10px;">
    <tr>
      <td align="center">
        
        <!-- Main Email Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Top Accent Header Bar -->
          <tr>
            <td style="background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); padding: 20px 28px; text-align: left;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #fef3c7; display: inline-block;">
                      FIT TOGETHER 2026 • COMPANY TRIP
                    </span>
                    <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                      THƯ MỜI THAM DỰ COMPANY TRIP
                    </h1>
                  </td>
                  <td align="right" style="font-size: 28px;">
                    🌲
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Content Body -->
          <tr>
            <td style="padding: 28px 24px; line-height: 1.65; font-size: 15px; color: #374151;">
              
              <!-- Greeting & Milestone Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #fffbeb; border: 1px solid #fed7aa; border-radius: 14px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-size: 17px; font-weight: 800; color: #9a3412; margin-bottom: 6px;">
                      Gửi <span style="color: #ea580c;">${displayName}</span> thân mến,
                    </div>
                    <div style="font-size: 13px; color: #78350f; line-height: 1.55;">
                      ${tenureTributeText}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Intro Paragraphs -->
              <p style="margin: 0 0 14px 0;">
                Sau những tháng ngày cùng nhau bận rộn với từng đoàn khách, xử lý từng phát sinh và dốc sức cho công việc, cuối cùng cũng đến lúc chúng ta cùng tạm gác lại bộn bề để dành trọn vẹn vài ngày cho chính mình.
              </p>

              <p style="margin: 0 0 14px 0;">
                Tháng 11 này, <strong style="color: #111827;">đại gia đình FIT TOUR sẽ cùng nhau lên đường đến Đà Lạt với chuyến đi Company Trip 2026 – We Rise Together!</strong>
              </p>

              <p style="margin: 0 0 14px 0;">
                Chuyến đi này là dịp để anh chị em chúng ta được chậm lại một nhịp, ngồi lại cùng nhau chia sẻ những câu chuyện đời thường ngoài công việc, cùng khám phá những trải nghiệm mới và lưu giữ thêm thật nhiều kỷ niệm gắn kết.
              </p>

              <p style="margin: 0 0 22px 0;">
                FIT TOUR trân trọng mời <strong style="color: #0284c7;">${displayName}</strong> cùng đồng hành trên chuyến xe đặc biệt lần này!
              </p>

              <!-- Section: THÔNG TIN CHUYẾN ĐI (No leaf icon) -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; margin-bottom: 22px;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                      THÔNG TIN CHUYẾN ĐI
                    </h3>
                    <ul style="margin: 0; padding-left: 18px; font-size: 14px; color: #334155; line-height: 1.7;">
                      <li><strong>Thời gian:</strong> 11 – 14/11/2026 (4 ngày 3 đêm)</li>
                      <li><strong>Địa điểm:</strong> Đà Lạt – Lâm Đồng</li>
                      <li><strong>Chủ đề:</strong> WE RISE TOGETHER</li>
                      <li><strong>Thành phần:</strong> Đại gia đình FIT TOUR (32 Thành viên)</li>
                    </ul>

                    <!-- Button Lịch trình trực tuyến ngay dưới thông tin chuyến đi -->
                    <div style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed #cbd5e1;">
                      <a href="https://erp.fittour.vn/outing-dalat-2026/index.html" target="_blank" style="display: inline-block; background-color: #0071e3; color: #ffffff; padding: 10px 20px; border-radius: 30px; font-weight: 700; text-decoration: none; font-size: 13px; box-shadow: 0 2px 6px rgba(0, 113, 227, 0.3);">
                        📖 Xem Lịch Trình Chi Tiết &amp; Chuẩn Bị Hành Trang →
                      </a>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Section: CHÚNG TA SẼ CÙNG NHAU LÀM GÌ? (No target icon) -->
              <div style="margin-bottom: 22px;">
                <h3 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
                  CHÚNG TA SẼ CÙNG NHAU LÀM GÌ?
                </h3>
                
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; line-height: 1.6; color: #374151;">
                  <tr>
                    <td style="padding-bottom: 8px;">
                      🏕️ <strong>Camping giữa thiên nhiên Đà Lạt:</strong> Cùng đón cái lạnh trong veo của cao nguyên, quây quần bên bữa ăn ngoài trời và chia sẻ những câu chuyện mà ngày thường ở văn phòng ít khi có dịp tỉ tê.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px;">
                      🥾 <strong>Trekking nhẹ nhàng 2 km xuyên rừng thông:</strong> Một chặng đi bộ êm ả dưới tán thông xanh mướt, thong thả hít thở không khí trong lành của núi rừng và cùng nhau trò chuyện rôm rả trên từng bước chân.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px;">
                      🛶 <strong>Trải nghiệm chèo SUP Hồ Tuyền Lâm:</strong> Thả mình lướt nhẹ trên mặt hồ tĩnh lặng, chụp những khung hình đẹp và cùng thử sức với hoạt động dưới nước cực kỳ thư giãn.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px;">
                      ☕ <strong>Một ngày tự do khám phá:</strong> Nhâm nhi ly cà phê sáng, dạo những góc phố quen, thưởng thức ẩm thực phố núi mà không cần phải vội vã với deadline hay lịch họp.
                    </td>
                  </tr>
                  <tr>
                    <td style="padding-bottom: 8px;">
                      🍢 <strong>BBQ &amp; Acoustic Night:</strong> Đêm lửa ấm, thịt nướng thơm lừng, tiếng đàn guitar mộc mạc và những giọng hát mộc của chính anh chị em nhà mình.
                    </td>
                  </tr>
                </table>

                <p style="margin: 6px 0 0 0; font-size: 13px; font-style: italic; color: #64748b;">
                  Và chắc chắn không thể thiếu những bức hình tập thể rạng rỡ, những tiếng cười ngẫu hứng và những mẩu chuyện vui mà sau chuyến đi sẽ còn được nhắc nhớ rất lâu!
                </p>
              </div>

              <!-- Section: WE RISE TOGETHER -->
              <div style="border-left: 4px solid #f59e0b; padding-left: 14px; margin-bottom: 22px;">
                <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #111827;">
                  WE RISE TOGETHER – CÙNG NHAU VƯƠN XA
                </h3>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">
                  Suốt cả năm qua, chúng ta đã cùng nhau chăm chút cho từng trải nghiệm của khách hàng. Nhưng trong chuyến đi này, <strong style="color: #111827;">chính mỗi chúng ta mới là những người được tận hưởng trọn vẹn từng khoảnh khắc ấy.</strong>
                </p>
                <p style="margin: 0 0 8px 0; font-size: 14px; color: #4b5563;">
                  Tạm cất lại những áp lực công việc thường nhật, đây là khoảng thời gian để nạp lại năng lượng, chăm sóc bản thân và kết nối sâu sắc hơn với những người đồng đội thân thương.
                </p>
                <p style="margin: 0; font-size: 14px; font-weight: 600; color: #b45309;">
                  Bởi vì điều làm nên một chuyến đi đáng nhớ, sau cùng, luôn là những con người đã cùng ta đồng hành suốt chặng đường.
                </p>
              </div>

              <!-- Section: HẸN GẶP BẠN TẠI ĐÀ LẠT -->
              <div style="margin-bottom: 22px;">
                <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 800; color: #0f172a;">
                  HẸN GẶP BẠN TẠI ĐÀ LẠT!
                </h3>
                <p style="margin: 0 0 8px 0;">
                  FIT TOUR rất mong sẽ thấy nụ cười của <strong style="color: #0284c7;">${displayName}</strong> trong chuyến đi lần này. Sự hiện diện đầy đủ của từng thành viên chính là điều làm nên trọn vẹn ý nghĩa của Company Trip 2026.
                </p>
                <p style="margin: 0;">
                  Bạn hãy chuẩn bị hành trang gọn nhẹ, một đôi giày đi bộ thật êm, sạc đầy pin điện thoại và mang theo một tinh thần thật thoải mái nhé!
                </p>
              </div>

              <!-- Attached Card Preview Inside Email (Clean, No Captions) -->
              <div style="margin: 26px 0; text-align: center;">
                <img src="cid:invitationCard" alt="Thẻ Thư Mời ${displayName}" style="width: 100%; max-width: 540px; height: auto; border-radius: 16px; display: block; margin: 0 auto; box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08); border: 1px solid #e5e7eb;">
              </div>

              <!-- Sign-off -->
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                <div style="font-size: 16px; font-weight: 900; color: #ea580c; margin-bottom: 10px;">
                  11/11/2026 – Đà Lạt, chúng ta cùng lên đường! 🧡
                </div>
                <div style="font-size: 14px; color: #4b5563; line-height: 1.5;">
                  Thân mến,<br>
                  <strong style="color: #111827; font-size: 15px;">Ban Tổ chức Company Trip 2026</strong><br>
                  <strong style="color: #f59e0b;">FIT TOUR – Du lịch có GUU</strong>
                </div>
              </div>

            </td>
          </tr>

          <!-- Footer Bar -->
          <tr>
            <td style="background-color: #f9fafb; padding: 16px 24px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af;">
              Email này được gửi từ hệ thống điều phối Company Trip 2026 của FIT TOUR.<br>
              Địa chỉ: 19 Lương Hữu Khánh, Phường Bến Thành, TP. Hồ Chí Minh.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

async function dispatchAllOfficialInvitations() {
  const rawData = fs.readFileSync(INVITATIONS_JSON, 'utf8');
  const members = JSON.parse(rawData);

  console.log(`=======================================================`);
  console.log(`🚀 BẮT ĐẦU PHÁT HÀNH THƯ MỜI CHÍNH THỨC (${members.length} THÀNH VIÊN)`);
  console.log(`=======================================================\n`);

  const report = {
    startedAt: new Date().toISOString(),
    total: members.length,
    successCount: 0,
    failCount: 0,
    results: []
  };

  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const displayName = member.nickname || member.ho_ten;
    const recipientEmail = member.email;
    const subject = `Thư mời ${displayName} tham dự FIT TOUR Company Trip 2026`;

    // File ảnh đính kèm từ thư mục invitations
    const cardFullPath = path.resolve(__dirname, '../../outing-dalat-2026', member.card_image);

    console.log(`[${i + 1}/${members.length}] STT ${member.stt}: ${member.ho_ten} (@${displayName}) -> ${recipientEmail}`);

    if (!fs.existsSync(cardFullPath)) {
      console.error(`   ❌ LỖI: Không tìm thấy file ảnh tại: ${cardFullPath}`);
      report.failCount++;
      report.results.push({
        stt: member.stt,
        ho_ten: member.ho_ten,
        nickname: displayName,
        email: recipientEmail,
        status: 'FAILED',
        error: 'Missing card image file'
      });
      continue;
    }

    const htmlContent = generateEmailHtml(member);
    const attachments = [
      {
        filename: `Thu-Moi-FIT-Trip-2026-${displayName}.png`,
        path: cardFullPath,
        cid: 'invitationCard'
      }
    ];

    try {
      const result = await sendMail({
        from: '"FIT TOUR Company Trip 2026" <loki@fittour.vn>',
        to: recipientEmail,
        subject: subject,
        html: htmlContent,
        attachments: attachments
      });

      console.log(`   ✅ Gửi thành công! MessageId: ${result.messageId}`);
      report.successCount++;
      report.results.push({
        stt: member.stt,
        ho_ten: member.ho_ten,
        nickname: displayName,
        email: recipientEmail,
        status: 'SENT',
        messageId: result.messageId,
        sentAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(`   ❌ LỖI GỬI:`, err.message);
      report.failCount++;
      report.results.push({
        stt: member.stt,
        ho_ten: member.ho_ten,
        nickname: displayName,
        email: recipientEmail,
        status: 'FAILED',
        error: err.message
      });
    }

    // Delay 2 giây giữa mỗi email để bảo vệ danh tiếng IP và tôn trọng rate limit Zoho Mail
    if (i < members.length - 1) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  report.completedAt = new Date().toISOString();
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), 'utf8');

  // Copy report sang outing-dalat-2026/assets/dispatch_report.json để có thể đối soát trên web
  const webReportPath = path.resolve(__dirname, '../../outing-dalat-2026/assets/dispatch_report.json');
  fs.writeFileSync(webReportPath, JSON.stringify(report, null, 2), 'utf8');

  console.log(`\n=======================================================`);
  console.log(`🎉 HOÀN TẤT PHÁT HÀNH THƯ MỜI!`);
  console.log(`   Tổng số: ${report.total}`);
  console.log(`   Thành công: ${report.successCount}`);
  console.log(`   Thất bại: ${report.failCount}`);
  console.log(`   Báo cáo lưu tại: ${REPORT_PATH}`);
  console.log(`=======================================================`);
}

dispatchAllOfficialInvitations()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Lỗi nghiêm trọng:', err);
    process.exit(1);
  });

