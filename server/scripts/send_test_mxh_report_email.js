require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { sendMail } = require('../utils/mailer');

async function sendTestEmail(targetEmail = 'huynhtronghieu1911@gmail.com') {
  console.log(`🚀 Đang chuẩn bị gửi email test báo cáo tổng hợp MXH tới: ${targetEmail}`);

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
      to: targetEmail,
      subject: subject,
      html: cleanHtml
    });

    console.log('✅ Gửi email test thành công!');
    console.log('🔑 MessageId:', result.messageId);
    console.log('👥 Accepted:', result.accepted);
    return result;
  } catch (err) {
    console.error('❌ Lỗi khi gửi email:', err);
    throw err;
  }
}

const recipient = process.argv[2] || 'huynhtronghieu1911@gmail.com';
sendTestEmail(recipient)
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
