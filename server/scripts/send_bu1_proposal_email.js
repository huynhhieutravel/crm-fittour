require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { sendMail } = require('../utils/mailer');

async function sendBU1ProposalEmail() {
  const recipients = [
    'huynhhieutravel@gmail.com',
    'quocthinh.tran@fittour.com.vn',
    'vyphan@fittour.com.vn',
    'ceo@fittour.com.vn'
  ];

  console.log(`🚀 Đang chuẩn bị gửi Email Đề Xuất BU1 tới ${recipients.length} người nhận:`);
  recipients.forEach((r, idx) => console.log(`   ${idx + 1}. ${r}`));

  const htmlPath = path.resolve(__dirname, '../../client/public/email_preview_de_xuat_bu1_q4_2026.html');
  let rawHtml = fs.readFileSync(htmlPath, 'utf8');

  // Loại bỏ thanh preview toolbar để email gửi đi là phiên bản chính thức sạch đẹp
  let cleanHtml = rawHtml.replace(/<!-- THANH CÔNG CỤ XEM TRƯỚC \(PREVIEW TOOLBAR\) -->[\s\S]*?<!-- CONTAINER CHÍNH CỦA EMAIL -->/, '<!-- CONTAINER CHÍNH CỦA EMAIL -->');

  const subject = '[Đề Xuất] Kế Hoạch & Phê Duyệt Ngân Sách Meta Ads BU1 — Quý 4/2026 (120 Triệu VNĐ • 20 Đoàn Khởi Hành)';

  try {
    const result = await sendMail({
      from: '"[FIT Tour ERP] Marketing Ads — BU1" <loki@fittour.vn>',
      to: recipients.join(', '),
      subject: subject,
      html: cleanHtml
    });

    console.log('✅ Gửi email BU1 thành công tới toàn bộ danh sách!');
    console.log('🔑 MessageId:', result.messageId);
    console.log('👥 Accepted:', result.accepted);
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi gửi email BU1:', err);
    throw err;
  }
}

sendBU1ProposalEmail()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
