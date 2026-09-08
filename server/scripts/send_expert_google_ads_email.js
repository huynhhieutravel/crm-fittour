require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { sendMail } = require('../utils/mailer');

async function sendExpertReport() {
  const recipient = 'huynhtronghieu1911@gmail.com';
  console.log(`🚀 Đang chuẩn bị gửi Báo Cáo Chuyên Gia Google Ads BU3 tới: ${recipient}...`);

  const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Hiệu Suất Google Ads & Phễu Chuyển Đổi B2B (BU3)</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 680px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%); padding: 36px 32px; color: #ffffff; text-align: left; position: relative; }
    .badge-pill { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.15); backdrop-filter: blur(8px); border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #93c5fd; margin-bottom: 12px; }
    .title { font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 14px; color: #cbd5e1; margin: 0; line-height: 1.5; }
    .meta-bar { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.12); display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
    .content { padding: 32px; }
    .section-title { font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 16px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; }
    .kpi-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 4px; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #0f172a; }
    .kpi-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .table-custom { width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 13px; }
    .table-custom th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; }
    .table-custom td { padding: 11px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .recommendation-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .rec-item { display: flex; gap: 10px; margin-bottom: 14px; font-size: 13px; line-height: 1.55; color: #166534; }
    .rec-item:last-child { margin-bottom: 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); text-align: center; }
    .footer { background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    
    <!-- HEADER -->
    <div class="header">
      <div class="badge-pill">GROWTH INTELLIGENCE • BU3 MICE & B2B</div>
      <h1 class="title">Báo Cáo Chiến Lược Hiệu Suất Google Ads & Phễu Chuyển Đổi B2B</h1>
      <p class="subtitle">Kỳ đánh giá: <b>Tháng 08/2026</b> • Đơn vị: Khối Tour Doanh Nghiệp (BU3) • ERP FIT Tour</p>
      <div class="meta-bar">
        <span><b>Chiến dịch:</b> [ BU3 | SEARCH | Tour Doanh Nghiệp | VN | T8-2026 ]</span>
        <span><b>Đánh giá:</b> TỐI ƯU CHI PHÍ TỐT (CPA 73.000 ₫)</span>
      </div>
    </div>

    <!-- BODY -->
    <div class="content">

      <!-- EXECUTIVE SUMMARY (NO REVENUE / BUSINESS RESULT) -->
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 10px 10px 0; margin-bottom: 28px;">
        <h3 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #1e3a8a; text-transform: uppercase;">
          🎯 TÓM TẮT ĐIỀU HÀNH TỪ CHUYÊN GIA TĂNG TRƯỞNG
        </h3>
        <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.6;">
          Chiến dịch Google Search Ads tháng 8 dành cho BU3 (Tour Doanh Nghiệp) ghi nhận hiệu suất tối ưu ngân sách vượt kỳ vọng. Với tổng chi phí giải ngân <b>4.380.000 ₫</b> (87.6% kế hoạch), chiến dịch đạt <b>4.640 lượt hiển thị</b> và <b>231 lượt truy cập</b> chất lượng cao (CTR đạt <b>4.98%</b>, gấp đôi benchmark ngành). Trên website, chiến dịch đã thúc đẩy <b>263 lượt tương tác sâu</b> với sản phẩm tour B2B và tạo ra <b>60 lượt liên hệ trực tiếp</b> với chi phí chuyển đổi (CPA) rất tiết kiệm, chỉ <b>73.000 ₫ / hành động liên hệ</b>.
        </p>
      </div>

      <!-- 4 EXECUTIVE MARKETING KPI CARDS -->
      <div style="display: table; width: 100%; margin-bottom: 24px;">
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-right: 7px; padding-bottom: 14px;">
            <div class="kpi-card" style="border-left: 4px solid #3b82f6;">
              <div class="kpi-label">NGÂN SÁCH & GIẢI NGÂN</div>
              <div class="kpi-val" style="color: #1e3a8a;">4.38 Tr ₫</div>
              <div class="kpi-sub">Target: <b>5.00 Tr ₫</b> • Đã dùng <b>87.6%</b> (🟢 Chuẩn)</div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding-left: 7px; padding-bottom: 14px;">
            <div class="kpi-card" style="border-left: 4px solid #10b981;">
              <div class="kpi-label">LƯỢT NHẤP & CTR (SEARCH)</div>
              <div class="kpi-val" style="color: #059669;">231 Clicks</div>
              <div class="kpi-sub">Hiển thị: <b>4.640</b> • CTR: <b style="color:#059669;">4.98%</b> (Gấp đôi thị trường)</div>
            </div>
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-right: 7px;">
            <div class="kpi-card" style="border-left: 4px solid #8b5cf6;">
              <div class="kpi-label">GIÁ THẦU TRUNG BÌNH (CPC)</div>
              <div class="kpi-val" style="color: #7c3aed;">18.961 ₫</div>
              <div class="kpi-sub">Target: <b>25.000 ₫</b> • Tiết kiệm <b>24.1%</b> giá bid</div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding-left: 7px;">
            <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
              <div class="kpi-label">TỔNG HÀNH ĐỘNG LIÊN HỆ (GA4)</div>
              <div class="kpi-val" style="color: #d97706;">60 Actions</div>
              <div class="kpi-sub">CPA: <b style="color:#d97706;">73.000 ₫</b> / liên hệ (Rất rẻ)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 1: GOOGLE ADS METRICS -->
      <div class="section-title">📊 1. Hiệu Suất Quảng Cáo Tìm Kiếm (Google Search Ads)</div>
      <table class="table-custom">
        <thead>
          <tr>
            <th>Chỉ số</th>
            <th style="text-align: right;">Thực tế T8/2026</th>
            <th style="text-align: right;">Benchmark / Target</th>
            <th style="text-align: right;">Đánh giá chuyên gia</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><b>Lượt hiển thị (Impressions)</b></td>
            <td style="text-align: right; font-weight: 700;">4.640</td>
            <td style="text-align: right; color: #64748b;">4.000</td>
            <td style="text-align: right; color: #059669; font-weight: 600;">+16.0% vượt độ phủ</td>
          </tr>
          <tr>
            <td><b>Lần nhấp (Clicks)</b></td>
            <td style="text-align: right; font-weight: 700; color: #2563eb;">231</td>
            <td style="text-align: right; color: #64748b;">180</td>
            <td style="text-align: right; color: #059669; font-weight: 600;">+28.3% so với kỳ vọng</td>
          </tr>
          <tr>
            <td><b>Tỷ lệ nhấp (CTR)</b></td>
            <td style="text-align: right; font-weight: 800; color: #059669;">4.98%</td>
            <td style="text-align: right; color: #64748b;">2.50% (Chuẩn B2B)</td>
            <td style="text-align: right; color: #059669; font-weight: 700;">⭐ Xuất sắc (Gấp 2 lần)</td>
          </tr>
          <tr>
            <td><b>CPC Trung bình</b></td>
            <td style="text-align: right; font-weight: 700;">18.961 ₫</td>
            <td style="text-align: right; color: #64748b;">25.000 ₫</td>
            <td style="text-align: right; color: #059669; font-weight: 600;">Tiết kiệm 24.1% giá bid</td>
          </tr>
          <tr>
            <td><b>Tổng chi phí đầu tư</b></td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">4.380.000 ₫</td>
            <td style="text-align: right; color: #64748b;">5.000.000 ₫</td>
            <td style="text-align: right; color: #2563eb; font-weight: 600;">Tối ưu ngân sách tốt</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 2: GA4 INTERACTION FUNNEL -->
      <div class="section-title">⚡ 2. Phễu Tương Tác & Chuyển Đổi Trên Website (GA4)</div>
      <table class="table-custom">
        <thead>
          <tr>
            <th>Hành động / Tương tác</th>
            <th style="text-align: center;">Lượt sự kiện</th>
            <th style="text-align: center;">Số người dùng</th>
            <th style="text-align: right;">Tỷ trọng</th>
            <th style="text-align: right;">Ý nghĩa chuyển đổi</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #f8fafc;">
            <td><b>Quan tâm Tour B2B (interest_b2b_tour)</b></td>
            <td style="text-align: center; font-weight: 800; color: #2563eb;">263</td>
            <td style="text-align: center; color: #64748b;">132</td>
            <td style="text-align: right;">–</td>
            <td style="text-align: right; font-size: 12px; color: #2563eb;">Khách xem sâu lịch trình & chính sách</td>
          </tr>
          <tr>
            <td><b>💬 Nhấp Chat Zalo Doanh Nghiệp (click_zalo)</b></td>
            <td style="text-align: center; font-weight: 700; color: #0284c7;">32</td>
            <td style="text-align: center; color: #64748b;">27</td>
            <td style="text-align: right; font-weight: 700; color: #0284c7;">53.3%</td>
            <td style="text-align: right; font-size: 12px; color: #059669;">Nút Zalo trên website</td>
          </tr>
          <tr>
            <td><b>📞 Nhấp Gọi Hotline (click_phone)</b></td>
            <td style="text-align: center; font-weight: 700; color: #16a34a;">14</td>
            <td style="text-align: center; color: #64748b;">9</td>
            <td style="text-align: right; font-weight: 700; color: #16a34a;">23.3%</td>
            <td style="text-align: right; font-size: 12px; color: #16a34a;">Nút Hotline trên website</td>
          </tr>
          <tr>
            <td><b>📝 Nhấp Yêu Cầu Tư Vấn (click_consultation)</b></td>
            <td style="text-align: center; font-weight: 700; color: #ea580c;">7</td>
            <td style="text-align: center; color: #64748b;">6</td>
            <td style="text-align: right; font-weight: 700; color: #ea580c;">11.7%</td>
            <td style="text-align: right; font-size: 12px;">Đăng ký nhận lịch trình chi tiết</td>
          </tr>
          <tr>
            <td><b>✉️ Nhấp Gửi Email (click_email)</b></td>
            <td style="text-align: center; font-weight: 700; color: #8b5cf6;">7</td>
            <td style="text-align: center; color: #64748b;">6</td>
            <td style="text-align: right; font-weight: 700; color: #8b5cf6;">11.7%</td>
            <td style="text-align: right; font-size: 12px;">Yêu cầu báo giá chính thức</td>
          </tr>
          <tr style="border-top: 2px solid #cbd5e1; background: #fffbeb;">
            <td><b>TỔNG HÀNH ĐỘNG LIÊN HỆ TRÊN WEBSITE</b></td>
            <td style="text-align: center; font-weight: 800; color: #d97706; font-size: 15px;">60</td>
            <td style="text-align: center; font-weight: 700; color: #b45309;">48</td>
            <td style="text-align: right; font-weight: 800;">100%</td>
            <td style="text-align: right; font-weight: 800; color: #d97706;">CPA: 73.000 ₫ / hành động</td>
          </tr>
        </tbody>
      </table>

      <!-- SECTION 3: RECOMMENDATIONS (REMOVED REVENUE, BUSINESS SECTION, ZALO PRIORITY, KEYWORD EXPANSION) -->
      <div class="recommendation-box">
        <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 800; color: #15803d; text-transform: uppercase;">
          💡 KHUYẾN NGHỊ TỐI ƯU CHIẾN DỊCH TỪ CHUYÊN GIA:
        </h4>
        <div class="rec-item">
          <span>⏰</span>
          <div><b>Tập trung phân bổ ngân sách theo khung giờ vàng doanh nghiệp:</b> Chiến dịch đạt CPA ấn tượng <b>73.000 ₫/liên hệ</b> và CTR <b>4.98%</b>. Đề xuất điều chỉnh lịch quảng cáo (Ad Schedule) dồn 80% ngân sách vào các khung giờ hành chính từ thứ Hai đến thứ Sáu (8h30 - 11h30 và 14h00 - 17h00), giảm bid vào ban đêm và cuối tuần để tối ưu chi phí tối đa.</div>
        </div>
        <div class="rec-item">
          <span>🎯</span>
          <div><b>Tối ưu tỷ lệ chuyển đổi trang đích (On-site CRO):</b> Website ghi nhận đến <b>263 lượt quan tâm sâu (interest_b2b_tour)</b> nhưng chỉ có 60 lượt thực hiện nhấp nút liên hệ (tỷ lệ chuyển đổi đạt 22.8%). Khuyến nghị bổ sung phần bằng chứng tin cậy (social proof: logo các doanh nghiệp đối tác tiêu biểu, hình ảnh đoàn thực tế) và làm rõ nét hơn nút nhận báo giá nhanh để gia tăng tỷ lệ khách nhấp liên hệ.</div>
        </div>
      </div>

      <!-- CTA BUTTON -->
      <div style="text-align: center; margin: 32px 0 16px 0;">
        <a href="https://erp.fittour.vn/marketing-google-ads" class="cta-btn">
          👉 MỞ BẢNG ĐIỀU KHIỂN GOOGLE ADS TRÊN ERP
        </a>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="footer">
      <p style="margin: 0 0 6px 0; font-weight: 700; color: #475569;">HỆ THỐNG QUẢN TRỊ NỘI BỘ FIT TOUR (ERP CRM)</p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">
        Email này được tạo và gửi tự động từ Module Marketing Ads • Báo Cáo Google Ads BU3.<br>
        Bản quyền © 2026 FIT Tour. Mọi thông tin trong báo cáo là bảo mật nội bộ.
      </p>
    </div>

  </div>
</body>
</html>
  `;

  try {
    const result = await sendMail({
      from: '"[FIT Tour ERP] Marketing Analytics" <loki@fittour.vn>',
      to: recipient,
      subject: '📊 [BÁO CÁO CHIẾN DỊCH] Hiệu Suất Google Search Ads & Tương Tác Website B2B (BU3) - Tháng 8/2026',
      html: htmlContent
    });

    console.log('✅ Gửi email báo cáo thành công! MessageId:', result.messageId);
  } catch (err) {
    console.error('❌ Lỗi gửi email:', err);
    throw err;
  }
}

sendExpertReport().then(() => process.exit(0)).catch(() => process.exit(1));
