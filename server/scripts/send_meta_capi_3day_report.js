/**
 * send_meta_capi_3day_report.js
 * 
 * Script tổng hợp và gửi email báo cáo vận hành Meta CRM Standard CAPI & Auto-Resolution sau 3 ngày
 * Gửi đến: huynhhieutravel@gmail.com
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { pool } = require('../db');
const { sendMail } = require('../utils/mailer');

async function generateAndSendReport() {
  console.log('[REPORT] Bắt đầu tổng hợp số liệu 3 ngày...');

  const statsQuery = `
    SELECT
      (SELECT COUNT(*) FROM meta_capi_events) AS total_events,
      (SELECT COUNT(*) FROM meta_capi_events WHERE status = 'SENT') AS sent_events,
      (SELECT COUNT(*) FROM meta_capi_events WHERE status = 'FAILED_FATAL') AS failed_events,
      (SELECT COUNT(*) FROM meta_capi_events WHERE event_name = 'Lead') AS lead_events,
      (SELECT COUNT(*) FROM meta_capi_events WHERE event_name = 'QualifiedLead') AS qualified_lead_events,
      (SELECT COUNT(*) FROM meta_capi_events WHERE event_name = 'Purchase') AS purchase_events,
      (SELECT COUNT(*) FROM customers WHERE lead_id IS NOT NULL) AS customers_with_lead,
      (SELECT COUNT(*) FROM customers) AS total_customers,
      (SELECT COUNT(*) FROM leads WHERE customer_id IS NOT NULL) AS leads_with_customer,
      (SELECT COUNT(*) FROM leads) AS total_leads,
      (SELECT COALESCE(SUM(b.paid), 0) FROM bookings b JOIN customers c ON b.customer_id = c.id WHERE c.lead_id IS NOT NULL) AS attributed_paid_amount,
      (SELECT COALESCE(SUM(b.total_price), 0) FROM bookings b JOIN customers c ON b.customer_id = c.id WHERE c.lead_id IS NOT NULL) AS attributed_contract_amount;
  `;

  const { rows } = await pool.query(statsQuery);
  const s = rows[0];

  const recentEventsQuery = `
    SELECT event_name, business_entity_type, business_entity_id, status, fbtrace_id, created_at, sent_at
    FROM meta_capi_events
    ORDER BY id DESC
    LIMIT 10;
  `;
  const recentEvents = (await pool.query(recentEventsQuery)).rows;

  const formatVND = (num) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 680px; margin: 0 auto; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 24px; color: #ffffff;">
        <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700;">FIT TOUR CRM — BÁO CÁO VẬN HÀNH META CAPI & ATTRIBUTION</h1>
        <p style="margin: 0; font-size: 13px; opacity: 0.9;">Thời gian tạo: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })} (Múi giờ VN)</p>
      </div>

      <div style="padding: 24px;">
        <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-top: 0;">1. Tổng quan Meta Standard CAPI (Dataset: 835404925628132)</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">Tổng sự kiện ghi nhận</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #1e3a8a; font-weight: 700;">${s.total_events}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">Gửi thành công sang Meta (SENT)</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; color: #16a34a; font-weight: 700;">${s.sent_events} (${s.total_events > 0 ? ((s.sent_events/s.total_events)*100).toFixed(1) : 0}%)</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">Thất bại (FAILED)</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; color: ${s.failed_events > 0 ? '#dc2626' : '#64748b'}; font-weight: 700;">${s.failed_events}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">- Sự kiện Lead</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${s.lead_events}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">- Sự kiện QualifiedLead</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${s.qualified_lead_events}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">- Sự kiện Purchase</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right;">${s.purchase_events}</td>
          </tr>
        </table>

        <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">2. Hiệu quả Auto-Resolution & Doanh thu Marketing</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">Khách hàng đã nối nguồn Lead</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #0284c7;">${s.customers_with_lead} / ${s.total_customers}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">Tổng tiền thực thu từ Lead Marketing</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #16a34a;">${formatVND(s.attributed_paid_amount)}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">Tổng giá trị hợp đồng được bảo chứng</td>
            <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 700; color: #1e3a8a;">${formatVND(s.attributed_contract_amount)}</td>
          </tr>
        </table>

        <h2 style="font-size: 15px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b;">3. Danh sách sự kiện gần nhất</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background-color: #f8fafc; color: #475569; text-align: left;">
              <th style="padding: 8px; border-bottom: 2px solid #e2e8f0;">Sự kiện</th>
              <th style="padding: 8px; border-bottom: 2px solid #e2e8f0;">Thực thể</th>
              <th style="padding: 8px; border-bottom: 2px solid #e2e8f0;">Trạng thái</th>
              <th style="padding: 8px; border-bottom: 2px solid #e2e8f0;">Meta Trace ID</th>
            </tr>
          </thead>
          <tbody>
            ${recentEvents.map(e => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${e.event_name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;">${e.business_entity_type} #${e.business_entity_id}</td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9;"><span style="color: ${e.status === 'SENT' ? '#16a34a' : '#ef4444'}; font-weight: bold;">${e.status}</span></td>
                <td style="padding: 8px; border-bottom: 1px solid #f1f5f9; font-family: monospace;">${e.fbtrace_id || 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="background-color: #f8fafc; padding: 16px 24px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;">
        FIT TOUR CRM Automation System • Báo cáo định kỳ gửi đến ${process.env.TARGET_REPORT_EMAIL || 'huynhhieutravel@gmail.com'}
      </div>
    </div>
  `;

  console.log('[REPORT] Đang gửi email qua sendMail()...');
  const recipient = 'huynhhieutravel@gmail.com';
  const mailResult = await sendMail({
    from: process.env.SMTP_USER,
    to: recipient,
    subject: `[FIT TOUR CRM] Báo cáo vận hành Meta Standard CAPI & Auto-Resolution (3 ngày)`,
    html: htmlContent
  });

  console.log('[REPORT] Đã gửi email thành công! MessageId:', mailResult.messageId);
  await pool.end();
}

generateAndSendReport().catch(err => {
  console.error('[REPORT] Lỗi gửi báo cáo:', err);
  process.exit(1);
});
