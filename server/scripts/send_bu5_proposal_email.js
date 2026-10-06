require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { sendMail } = require('../utils/mailer');

async function sendBU5ProposalEmail(customRecipients = null) {
  const defaultRecipients = [
    'ceo@fittour.com.vn',
    'vyphan@fittour.com.vn',
    'huynhhieutravel@gmail.com',
    'jo@fittour.com.vn'
  ];

  const recipients = (customRecipients && customRecipients.length > 0) ? customRecipients : defaultRecipients;
  const isTest = customRecipients && customRecipients.length > 0 && !customRecipients.includes('ceo@fittour.com.vn');

  console.log(`🚀 Đang chuẩn bị gửi Email Đề Xuất BU5 tới ${recipients.length} người nhận${isTest ? ' [CHẾ ĐỘ TEST]' : ''}:`);
  recipients.forEach((r, idx) => console.log(`   ${idx + 1}. ${r}`));

  const htmlPath = path.resolve(__dirname, '../../client/public/email_preview_de_xuat_bu5_q4_2026.html');
  let rawHtml = fs.readFileSync(htmlPath, 'utf8');

  // Loại bỏ thanh preview toolbar để email gửi đi là phiên bản chính thức sạch đẹp
  let cleanHtml = rawHtml.replace(/<!-- THANH CÔNG CỤ XEM TRƯỚC \(PREVIEW TOOLBAR\) -->[\s\S]*?<!-- CONTAINER CHÍNH CỦA EMAIL -->/, '<!-- CONTAINER CHÍNH CỦA EMAIL -->');

  const baseSubject = '[Đề Xuất] Kế Hoạch & Phê Duyệt Ngân Sách BU5 — Quý 4/2026 (100 Triệu • 5 Tuyến Độc Bản)';
  const subject = (isTest ? '[TEST EMAIL] ' : '') + baseSubject;

  try {
    const result = await sendMail({
      from: '"[FIT Tour ERP] Kế Hoạch Thị Trường — BU5" <loki@fittour.vn>',
      to: recipients.join(', '),
      subject: subject,
      html: cleanHtml
    });

    console.log('✅ Gửi email BU5 thành công!');
    console.log('🔑 MessageId:', result.messageId);
    console.log('👥 Accepted:', result.accepted);
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi gửi email BU5:', err);
    throw err;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let customList = null;
  if (args.length > 0) {
    customList = args.join(',').split(',').map(s => s.trim()).filter(Boolean);
  }
  sendBU5ProposalEmail(customList)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { sendBU5ProposalEmail };
