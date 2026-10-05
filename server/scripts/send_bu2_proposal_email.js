require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { sendMail } = require('../utils/mailer');

async function sendBU2ProposalEmail(customRecipients = null) {
  const defaultRecipients = [
    'ceo@fittour.com.vn',
    'vyphan@fittour.com.vn',
    'huynhhieutravel@gmail.com',
    'obm@fittour.com.vn'
  ];

  const recipients = (customRecipients && customRecipients.length > 0) ? customRecipients : defaultRecipients;
  const isTest = customRecipients && customRecipients.length > 0 && !customRecipients.includes('ceo@fittour.com.vn');

  console.log(`🚀 Đang chuẩn bị gửi Email Đề Xuất BU2 tới ${recipients.length} người nhận${isTest ? ' [CHẾ ĐỘ TEST]' : ''}:`);
  recipients.forEach((r, idx) => console.log(`   ${idx + 1}. ${r}`));

  const htmlPath = path.resolve(__dirname, '../../client/public/email_preview_de_xuat_bu2_q4_2026.html');
  let rawHtml = fs.readFileSync(htmlPath, 'utf8');

  // Loại bỏ thanh preview toolbar để email gửi đi là phiên bản chính thức sạch đẹp
  let cleanHtml = rawHtml.replace(/<!-- THANH CÔNG CỤ XEM TRƯỚC \(PREVIEW TOOLBAR\) -->[\s\S]*?<!-- CONTAINER CHÍNH CỦA EMAIL -->/, '<!-- CONTAINER CHÍNH CỦA EMAIL -->');

  const baseSubject = '[Đề Xuất] Kế Hoạch & Phê Duyệt Ngân Sách BU2 — Quý 4/2026 (45 Triệu / Quý • 15 Triệu / Tháng)';
  const subject = (isTest ? '[TEST EMAIL] ' : '') + baseSubject;

  try {
    const result = await sendMail({
      from: '"[FIT Tour ERP] Kế Hoạch Thị Trường — BU2" <loki@fittour.vn>',
      to: recipients.join(', '),
      subject: subject,
      html: cleanHtml
    });

    console.log('✅ Gửi email BU2 thành công!');
    console.log('🔑 MessageId:', result.messageId);
    console.log('👥 Accepted:', result.accepted);
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi gửi email BU2:', err);
    throw err;
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let customList = null;
  if (args.length > 0) {
    customList = args.join(',').split(',').map(s => s.trim()).filter(Boolean);
  }
  sendBU2ProposalEmail(customList)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { sendBU2ProposalEmail };
