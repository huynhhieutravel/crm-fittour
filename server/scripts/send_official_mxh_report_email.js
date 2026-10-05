require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { sendMail } = require('../utils/mailer');

async function sendOfficialReportEmail() {
  const recipients = [
    'kietchauforworks0801@gmail.com',
    'huynhhieutravel@gmail.com',
    'long301197@gmail.com',
    'vyphan@fittour.com.vn',
    'ceo@fittour.com.vn'
  ];

  console.log(`🚀 Đang chuẩn bị gửi Email Báo Cáo Tổng Hợp MXH & Digital Tháng 09/2026 tới ${recipients.length} người nhận:`);
  recipients.forEach((r, idx) => console.log(`   ${idx + 1}. ${r}`));

  const htmlPath = path.resolve(__dirname, '../../client/public/email_preview_bao_cao_tong_hop_mxh_t9_2026.html');
  if (!fs.existsSync(htmlPath)) {
    throw new Error(`Không tìm thấy file HTML tại: ${htmlPath}`);
  }

  let rawHtml = fs.readFileSync(htmlPath, 'utf8');

  // Loại bỏ thanh preview toolbar để email gửi đi là phiên bản chính thức sạch đẹp
  let cleanHtml = rawHtml.replace(/<!-- THANH CÔNG CỤ XEM TRƯỚC \(PREVIEW TOOLBAR\) -->[\s\S]*?<!-- CONTAINER CHÍNH CỦA EMAIL -->/, '<!-- CONTAINER CHÍNH CỦA EMAIL -->');

  const subject = '[BÁO CÁO TỔNG HỢP] Kết Quả Đa Kênh MXH & Digital Tháng 09/2026 & Kế Hoạch Tháng 10/2026 | FIT Tour';

  try {
    const result = await sendMail({
      from: '"[FIT Tour ERP] Marketing & Digital" <loki@fittour.vn>',
      to: recipients.join(', '),
      subject: subject,
      html: cleanHtml
    });

    console.log('✅ Gửi email báo cáo chính thức thành công!');
    console.log('🔑 MessageId:', result.messageId);
    console.log('👥 Accepted:', result.accepted);
    if (result.rejected && result.rejected.length > 0) {
      console.log('⚠️ Rejected:', result.rejected);
    }
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi gửi email:', err);
    throw err;
  }
}

sendOfficialReportEmail()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
