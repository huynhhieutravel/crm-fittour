const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'email-smtp.ap-southeast-1.amazonaws.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Gửi email qua SMTP (Amazon SES)
 * @param {Object} options Options gửi mail
 * @param {string} options.from Địa chỉ người gửi (VD: sale1@fittour.vn)
 * @param {string} options.to Địa chỉ người nhận
 * @param {string} [options.cc] Địa chỉ người nhận CC
 * @param {string} [options.bcc] Địa chỉ người nhận BCC
 * @param {string} options.subject Tiêu đề email
 * @param {string} options.html Nội dung email dạng HTML
 * @param {string} [options.inReplyTo] Message-ID của email gốc (Dành cho Reply)
 * @param {string} [options.references] Chuỗi Message-ID references (Dành cho Threading)
 */
const sendMail = async ({ from, to, cc, bcc, subject, html, inReplyTo, references }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Chưa cấu hình SMTP Credentials (SMTP_USER/SMTP_PASS).');
  }

  const transporter = createTransporter();

  // Đảm bảo "from" luôn hiển thị tên kèm theo nếu có (VD: "Quynh Phuong <quynhphuong.bu1@fittour.vn>")
  // Nếu chỉ có email, Nodemailer vẫn chấp nhận.
  let mailOptions = {
    from,
    to,
    cc,
    bcc,
    subject,
    html,
  };

  // Cấu hình headers để giữ luồng (Threading) khi Reply
  if (inReplyTo) {
    mailOptions.inReplyTo = inReplyTo;
  }
  if (references) {
    mailOptions.references = references;
  }

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendMail };
