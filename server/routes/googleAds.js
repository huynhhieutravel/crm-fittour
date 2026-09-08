const express = require('express');
const router = express.Router();
const db = require('../db');
const gptAuth = require('../middleware/gptAuth');
const { logActivity } = require('../utils/logger');
const { emitEvent } = require('../utils/eventBus');

// Hỗ trợ cả JWT Auth (CRM User) và API Key (GPT/Analytics Bot)
router.use(gptAuth);

// Helper tính toán các chỉ số phễu chuyển đổi
const computeReportMetrics = (row) => {
  const spend = parseFloat(row.spend || 0);
  const impressions = parseInt(row.impressions || 0);
  const clicks = parseInt(row.clicks || 0);
  
  const click_zalo = parseInt(row.click_zalo || 0);
  const click_phone = parseInt(row.click_phone || 0);
  const click_consultation = parseInt(row.click_consultation || 0);
  const click_email = parseInt(row.click_email || 0);
  const generate_lead = parseInt(row.generate_lead || 0);
  const form_submit = parseInt(row.form_submit || 0);
  const crm_leads = parseInt(row.crm_leads || 0);
  const crm_won = parseInt(row.crm_won || 0);
  const revenue_won = parseFloat(row.revenue_won || 0);

  // Tổng các hành động liên hệ trực tiếp
  const total_actions = click_zalo + click_phone + click_consultation + click_email + generate_lead;
  
  // Tổng đầu mối tiềm năng (lead) = generate_lead hoặc crm_leads
  const total_leads = (generate_lead > 0) ? generate_lead : crm_leads;

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const avg_cpc = clicks > 0 ? spend / clicks : 0;
  const cpa = total_actions > 0 ? spend / total_actions : 0;
  const cpl = total_leads > 0 ? spend / total_leads : 0;
  const conversion_rate = clicks > 0 ? (total_actions / clicks) * 100 : 0;
  const roi = spend > 0 && revenue_won > 0 ? (revenue_won / spend) : 0;

  return {
    ...row,
    spend,
    impressions,
    clicks,
    total_actions,
    total_leads,
    ctr: Number(ctr.toFixed(2)),
    avg_cpc: Math.round(avg_cpc),
    cpa: Math.round(cpa),
    cpl: Math.round(cpl),
    conversion_rate: Number(conversion_rate.toFixed(2)),
    revenue_won,
    roi: Number(roi.toFixed(2))
  };
};

// 1. Lấy danh sách báo cáo Google Ads theo Năm
router.get('/', async (req, res) => {
  try {
    const { year, bu_name } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetBu = bu_name || 'BU3';

    const query = `
      SELECT * FROM google_ads_monthly_reports
      WHERE bu_name = $1 AND year = $2
      ORDER BY month ASC
    `;
    const result = await db.query(query, [targetBu, targetYear]);

    const enriched = result.rows.map(computeReportMetrics);

    res.json({
      success: true,
      year: targetYear,
      bu_name: targetBu,
      data: enriched
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách Google Ads:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy dữ liệu Google Ads' });
  }
});

// 2. Lấy dữ liệu KPI mục tiêu
router.get('/kpis', async (req, res) => {
  try {
    const { year, bu_name } = req.query;
    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetBu = bu_name || 'BU3';

    const query = `
      SELECT * FROM google_ads_kpis
      WHERE bu_name = $1 AND year = $2
      ORDER BY month ASC
    `;
    const result = await db.query(query, [targetBu, targetYear]);

    res.json({
      success: true,
      year: targetYear,
      bu_name: targetBu,
      kpis: result.rows
    });
  } catch (error) {
    console.error('Lỗi khi lấy KPI Google Ads:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy KPI Google Ads' });
  }
});

// 3. Cập nhật hoặc Thêm mới KPI mục tiêu
router.post('/kpis', async (req, res) => {
  try {
    const {
      bu_name = 'BU3',
      year,
      month,
      budget,
      target_leads,
      target_cpl,
      target_groups,
      target_cpa,
      pic_name,
      notes
    } = req.body;

    const query = `
      INSERT INTO google_ads_kpis (
        bu_name, year, month,
        budget, target_leads, target_cpl,
        target_groups, target_cpa, pic_name, notes,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
      ON CONFLICT (bu_name, year, month)
      DO UPDATE SET
        budget = EXCLUDED.budget,
        target_leads = EXCLUDED.target_leads,
        target_cpl = EXCLUDED.target_cpl,
        target_groups = EXCLUDED.target_groups,
        target_cpa = EXCLUDED.target_cpa,
        pic_name = EXCLUDED.pic_name,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await db.query(query, [
      bu_name,
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1,
      parseFloat(budget) || 0,
      parseInt(target_leads) || 0,
      parseFloat(target_cpl) || 0,
      parseInt(target_groups) || 0,
      parseFloat(target_cpa) || 0,
      pic_name || '',
      notes || ''
    ]);

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Lỗi khi cập nhật KPI Google Ads:', error);
    res.status(500).json({ error: 'Lỗi server cập nhật KPI' });
  }
});

// 4. Thêm mới hoặc Cập nhật Báo cáo Tháng (Upsert)
router.post('/monthly-report', async (req, res) => {
  try {
    const {
      id,
      bu_name = 'BU3',
      year,
      month,
      campaign_name,
      spend,
      impressions,
      clicks,
      conversions_ads,
      interest_b2b_tour,
      interest_b2b_tour_users,
      click_zalo,
      click_zalo_users,
      click_phone,
      click_phone_users,
      click_consultation,
      click_consultation_users,
      click_email,
      click_email_users,
      generate_lead,
      form_submit,
      form_start,
      page_view,
      user_engagement,
      crm_leads,
      crm_won,
      revenue_won,
      notes
    } = req.body;

    const query = `
      INSERT INTO google_ads_monthly_reports (
        bu_name, year, month, campaign_name,
        spend, impressions, clicks, conversions_ads,
        interest_b2b_tour, interest_b2b_tour_users,
        click_zalo, click_zalo_users,
        click_phone, click_phone_users,
        click_consultation, click_consultation_users,
        click_email, click_email_users,
        generate_lead, form_submit, form_start,
        page_view, user_engagement,
        crm_leads, crm_won, revenue_won,
        notes, updated_at
      ) VALUES (
        $1, $2, $3, $4,
        $5, $6, $7, $8,
        $9, $10,
        $11, $12,
        $13, $14,
        $15, $16,
        $17, $18,
        $19, $20, $21,
        $22, $23,
        $24, $25, $26,
        $27, CURRENT_TIMESTAMP
      )
      ON CONFLICT (bu_name, year, month)
      DO UPDATE SET
        campaign_name = EXCLUDED.campaign_name,
        spend = EXCLUDED.spend,
        impressions = EXCLUDED.impressions,
        clicks = EXCLUDED.clicks,
        conversions_ads = EXCLUDED.conversions_ads,
        interest_b2b_tour = EXCLUDED.interest_b2b_tour,
        interest_b2b_tour_users = EXCLUDED.interest_b2b_tour_users,
        click_zalo = EXCLUDED.click_zalo,
        click_zalo_users = EXCLUDED.click_zalo_users,
        click_phone = EXCLUDED.click_phone,
        click_phone_users = EXCLUDED.click_phone_users,
        click_consultation = EXCLUDED.click_consultation,
        click_consultation_users = EXCLUDED.click_consultation_users,
        click_email = EXCLUDED.click_email,
        click_email_users = EXCLUDED.click_email_users,
        generate_lead = EXCLUDED.generate_lead,
        form_submit = EXCLUDED.form_submit,
        form_start = EXCLUDED.form_start,
        page_view = EXCLUDED.page_view,
        user_engagement = EXCLUDED.user_engagement,
        crm_leads = EXCLUDED.crm_leads,
        crm_won = EXCLUDED.crm_won,
        revenue_won = EXCLUDED.revenue_won,
        notes = EXCLUDED.notes,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const values = [
      bu_name,
      parseInt(year) || new Date().getFullYear(),
      parseInt(month) || new Date().getMonth() + 1,
      campaign_name || '[ BU3 | SEARCH | Tour Doanh Nghiệp | VN ]',
      parseFloat(spend) || 0,
      parseInt(impressions) || 0,
      parseInt(clicks) || 0,
      parseFloat(conversions_ads) || 0,
      parseInt(interest_b2b_tour) || 0,
      parseInt(interest_b2b_tour_users) || 0,
      parseInt(click_zalo) || 0,
      parseInt(click_zalo_users) || 0,
      parseInt(click_phone) || 0,
      parseInt(click_phone_users) || 0,
      parseInt(click_consultation) || 0,
      parseInt(click_consultation_users) || 0,
      parseInt(click_email) || 0,
      parseInt(click_email_users) || 0,
      parseInt(generate_lead) || 0,
      parseInt(form_submit) || 0,
      parseInt(form_start) || 0,
      parseInt(page_view) || 0,
      parseInt(user_engagement) || 0,
      parseInt(crm_leads) || 0,
      parseInt(crm_won) || 0,
      parseFloat(revenue_won) || 0,
      notes || ''
    ];

    const result = await db.query(query, values);
    const enriched = computeReportMetrics(result.rows[0]);

    if (req.user?.id) {
      await logActivity({
        user_id: req.user.id,
        action_type: 'UPDATE_GOOGLE_ADS',
        entity_type: 'MARKETING_ADS',
        entity_id: result.rows[0].id,
        details: `Cập nhật Báo cáo Google Ads BU3 Tháng ${result.rows[0].month}/${result.rows[0].year}`
      }).catch(err => console.error('logActivity error:', err));
    }

    res.json({ success: true, data: enriched });
  } catch (error) {
    console.error('Lỗi khi lưu báo cáo Google Ads:', error);
    res.status(500).json({ error: 'Lỗi server khi lưu báo cáo' });
  }
});

// 5. Xóa báo cáo tháng
router.delete('/monthly-report/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleteQuery = `
      DELETE FROM google_ads_monthly_reports 
      WHERE id = $1 AND (is_locked IS NULL OR is_locked = false) 
      RETURNING *
    `;
    const result = await db.query(deleteQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Không tìm thấy dòng báo cáo hoặc dữ liệu đã bị khoá.' });
    }

    res.json({ success: true, message: 'Đã xoá báo cáo thành công' });
  } catch (error) {
    console.error('Lỗi khi xoá báo cáo Google Ads:', error);
    res.status(500).json({ error: 'Lỗi server khi xoá báo cáo' });
  }
});

// 6. Khóa / Mở khóa báo cáo
router.put('/monthly-report/:id/lock', async (req, res) => {
  try {
    const { id } = req.params;
    const { is_locked } = req.body;
    const query = `UPDATE google_ads_monthly_reports SET is_locked = $1 WHERE id = $2 RETURNING *`;
    const result = await db.query(query, [!!is_locked, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Lỗi khi khoá/mở khoá báo cáo Google Ads:', error);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Helper resolve danh sách nhận: Group BU3 + email ngoài (huynhhieutravel@gmail.com)
async function getBU3Recipients(customExternalEmail) {
  const recipients = new Set();
  
  // 1. Luôn thêm email ngoài được user chỉ định (mặc định: huynhhieutravel@gmail.com)
  recipients.add('huynhhieutravel@gmail.com');
  if (customExternalEmail && customExternalEmail.trim()) {
    recipients.add(customExternalEmail.trim());
  }

  try {
    // 2. Lấy cấu hình Group Email BU3
    const groupRes = await db.query(
      "SELECT users, external_emails, target_bus FROM email_groups WHERE code = 'BU3' AND is_active = true"
    );

    let explicitUserIds = [];
    let targetBus = ['BU3'];

    if (groupRes.rows.length > 0) {
      const g = groupRes.rows[0];
      if (Array.isArray(g.users) && g.users.length > 0) {
        explicitUserIds = g.users.map(Number).filter(Boolean);
      }
      if (Array.isArray(g.target_bus) && g.target_bus.length > 0) {
        targetBus = g.target_bus;
      }
      if (Array.isArray(g.external_emails)) {
        g.external_emails.forEach(e => {
          if (e && e.includes('@')) recipients.add(e.trim());
        });
      }
    }

    // 3. Lấy email của các users thuộc BU3 (cả gán trực tiếp lẫn theo target_bus = 'BU3')
    let conditions = [];
    let params = [];
    let pIdx = 1;

    if (explicitUserIds.length > 0) {
      conditions.push(`id = ANY($${pIdx}::int[])`);
      params.push(explicitUserIds);
      pIdx++;
    }
    if (targetBus.length > 0) {
      conditions.push(`bus && $${pIdx}::text[]`);
      params.push(targetBus);
      pIdx++;
    }

    if (conditions.length > 0) {
      const usersQuery = `
        SELECT email FROM users 
        WHERE is_active = true 
          AND email IS NOT NULL 
          AND email != '' 
          AND (${conditions.join(' OR ')})
      `;
      const usersRes = await db.query(usersQuery, params);
      usersRes.rows.forEach(u => {
        if (u.email && u.email.includes('@')) {
          recipients.add(u.email.trim());
        }
      });
    }
  } catch (err) {
    console.error('Lỗi khi resolve BU3 recipients:', err);
  }

  return Array.from(recipients);
}

// 6.5. Lấy danh sách người nhận email dự kiến (Preview Group BU3 + email ngoài)
router.get('/recipients', async (req, res) => {
  try {
    const list = await getBU3Recipients(req.query.external_email || 'huynhhieutravel@gmail.com');
    res.json({
      success: true,
      group: 'BU3',
      default_external: 'huynhhieutravel@gmail.com',
      recipients: list
    });
  } catch (error) {
    console.error('Lỗi lấy recipients:', error);
    res.status(500).json({ error: 'Lỗi server khi lấy danh sách recipients' });
  }
});

// 7. Gửi Email Báo Cáo Tháng BU3
router.post('/send-email', async (req, res) => {
  try {
    const { month, year, recipient_email } = req.body;
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;
    const targetYear = parseInt(year) || new Date().getFullYear();

    // Lấy dữ liệu báo cáo
    const reportRes = await db.query(
      'SELECT * FROM google_ads_monthly_reports WHERE bu_name = $1 AND year = $2 AND month = $3',
      ['BU3', targetYear, targetMonth]
    );

    if (reportRes.rows.length === 0) {
      return res.status(400).json({ error: `Chưa có dữ liệu báo cáo Tháng ${targetMonth}/${targetYear} để gửi.` });
    }

    const report = computeReportMetrics(reportRes.rows[0]);

    // Lấy KPI
    const kpiRes = await db.query(
      'SELECT * FROM google_ads_kpis WHERE bu_name = $1 AND year = $2 AND month = $3',
      ['BU3', targetYear, targetMonth]
    );
    const kpi = kpiRes.rows[0] || {};

    const targetRecipients = await getBU3Recipients(recipient_email);

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Báo Cáo Hiệu Suất Google Ads & Phễu B2B (BU3)</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    .container { max-width: 680px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e3a8a 100%); padding: 36px 32px; color: #ffffff; text-align: left; }
    .badge-pill { display: inline-block; padding: 4px 12px; background: rgba(255,255,255,0.15); border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; color: #93c5fd; margin-bottom: 12px; }
    .title { font-size: 24px; font-weight: 800; line-height: 1.3; margin: 0 0 8px 0; color: #ffffff; }
    .subtitle { font-size: 14px; color: #cbd5e1; margin: 0; line-height: 1.5; }
    .meta-bar { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.12); display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; }
    .content { padding: 32px; }
    .section-title { font-size: 15px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.04em; margin: 0 0 16px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px; }
    .kpi-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 18px; }
    .kpi-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 4px; }
    .kpi-val { font-size: 22px; font-weight: 800; color: #0f172a; }
    .kpi-sub { font-size: 12px; color: #64748b; margin-top: 4px; }
    .table-custom { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px; }
    .table-custom th { background: #f8fafc; color: #475569; font-weight: 700; text-align: left; padding: 10px 12px; border-bottom: 2px solid #e2e8f0; }
    .table-custom td { padding: 11px 12px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
    .recommendation-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .rec-item { display: flex; gap: 10px; margin-bottom: 12px; font-size: 13px; line-height: 1.5; color: #166534; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .footer { background: #f8fafc; padding: 24px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge-pill">GROWTH INTELLIGENCE • BU3 MICE & B2B</div>
      <h1 class="title">Báo Cáo Chiến Lược Google Ads & Phễu B2B</h1>
      <p class="subtitle">Kỳ đánh giá: <b>Tháng ${targetMonth}/${targetYear}</b> • Đơn vị: Khối Tour Doanh Nghiệp (BU3) • ERP FIT Tour</p>
      <div class="meta-bar">
        <span><b>Chiến dịch:</b> ${report.campaign_name}</span>
        <span><b>Đánh giá:</b> TỐI ƯU CHI PHÍ TỐT (CPA ${report.cpa.toLocaleString('vi-VN')} ₫)</span>
      </div>
    </div>

    <div class="content">
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 16px 20px; border-radius: 0 10px 10px 0; margin-bottom: 24px;">
        <h3 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #1e3a8a; text-transform: uppercase;">
          🎯 TÓM TẮT ĐIỀU HÀNH TỪ CHUYÊN GIA
        </h3>
        <p style="margin: 0; font-size: 13px; color: #1e40af; line-height: 1.6;">
          Chiến dịch Google Search Ads Tháng ${targetMonth}/${targetYear} ghi nhận chi phí thực tế <b>${report.spend.toLocaleString('vi-VN')} ₫</b>, đạt <b>${report.impressions.toLocaleString('vi-VN')} lượt hiển thị</b> và <b>${report.clicks} lượt nhấp</b> chất lượng (CTR <b>${report.ctr}%</b>). Trên website, chiến dịch đã thúc đẩy <b>${report.interest_b2b_tour} lượt quan tâm sâu tour B2B</b> và mang về <b>${report.total_actions} hành động liên hệ trực tiếp</b> với chi phí chuyển đổi (CPA) rất tiết kiệm, chỉ <b>${report.cpa.toLocaleString('vi-VN')} ₫ / hành động</b>.
        </p>
      </div>

      <div style="display: table; width: 100%; margin-bottom: 24px;">
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-right: 7px; padding-bottom: 14px;">
            <div class="kpi-card" style="border-left: 4px solid #3b82f6;">
              <div class="kpi-label">CHI PHÍ ĐẦU TƯ</div>
              <div class="kpi-val" style="color: #1e3a8a;">${(report.spend / 1000000).toFixed(2)} Tr ₫</div>
              <div class="kpi-sub">Target: <b>${parseFloat(kpi.budget || 0).toLocaleString('vi-VN')} ₫</b></div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding-left: 7px; padding-bottom: 14px;">
            <div class="kpi-card" style="border-left: 4px solid #10b981;">
              <div class="kpi-label">LƯỢT NHẤP & CTR</div>
              <div class="kpi-val" style="color: #059669;">${report.clicks} Clicks</div>
              <div class="kpi-sub">CTR: <b style="color:#059669;">${report.ctr}%</b> (Chuẩn B2B)</div>
            </div>
          </div>
        </div>
        <div style="display: table-row;">
          <div style="display: table-cell; width: 50%; padding-right: 7px;">
            <div class="kpi-card" style="border-left: 4px solid #8b5cf6;">
              <div class="kpi-label">GIÁ THẦU TRUNG BÌNH (CPC)</div>
              <div class="kpi-val" style="color: #7c3aed;">${report.avg_cpc.toLocaleString('vi-VN')} ₫</div>
              <div class="kpi-sub">Target: <b>${parseFloat(kpi.target_cpl || 25000).toLocaleString('vi-VN')} ₫</b></div>
            </div>
          </div>
          <div style="display: table-cell; width: 50%; padding-left: 7px;">
            <div class="kpi-card" style="border-left: 4px solid #f59e0b;">
              <div class="kpi-label">TƯƠNG TÁC LIÊN HỆ (GA4)</div>
              <div class="kpi-val" style="color: #d97706;">${report.total_actions} Actions</div>
              <div class="kpi-sub">CPA: <b style="color:#d97706;">${report.cpa.toLocaleString('vi-VN')} ₫</b>/hành động</div>
            </div>
          </div>
        </div>
      </div>

      <div class="section-title">⚡ Chi Tiết Phễu Tương Tác Chuyển Đổi Trên Website (GA4)</div>
      <table class="table-custom">
        <thead>
          <tr>
            <th>Hành Động / Kênh</th>
            <th style="text-align: center;">Số Lượt</th>
            <th style="text-align: right;">Đánh Giá</th>
          </tr>
        </thead>
        <tbody>
          <tr style="background: #f8fafc;">
            <td><b>Quan tâm Tour B2B (interest_b2b_tour)</b></td>
            <td style="text-align: center; font-weight: 800; color: #2563eb;">${report.interest_b2b_tour}</td>
            <td style="text-align: right; color: #2563eb; font-weight: 600;">Xem sâu lịch trình & chính sách</td>
          </tr>
          <tr>
            <td>💬 Chat Zalo Doanh Nghiệp (click_zalo)</td>
            <td style="text-align: center; font-weight: 700; color: #0284c7;">${report.click_zalo}</td>
            <td style="text-align: right; color: #0284c7; font-weight: 600;">Nút Zalo trên website</td>
          </tr>
          <tr>
            <td>📞 Gọi Hotline Trực Tiếp (click_phone)</td>
            <td style="text-align: center; font-weight: 700; color: #16a34a;">${report.click_phone}</td>
            <td style="text-align: right; color: #16a34a; font-weight: 600;">Nút Hotline trên website</td>
          </tr>
          <tr>
            <td>📝 Yêu Cầu Tư Vấn (click_consultation)</td>
            <td style="text-align: center; font-weight: 700; color: #ea580c;">${report.click_consultation}</td>
            <td style="text-align: right; color: #ea580c;">Đăng ký nhận lịch trình</td>
          </tr>
          <tr>
            <td>✉️ Gửi Email Báo Giá (click_email)</td>
            <td style="text-align: center; font-weight: 700; color: #8b5cf6;">${report.click_email}</td>
            <td style="text-align: right; color: #8b5cf6;">Thư chào hàng doanh nghiệp</td>
          </tr>
          <tr style="background: #fffbeb; font-weight: 700;">
            <td>TỔNG HÀNH ĐỘNG LIÊN HỆ TRỰC TIẾP</td>
            <td style="text-align: center; color: #d97706; font-size: 15px;">${report.total_actions}</td>
            <td style="text-align: right; color: #d97706;">CPA: ${report.cpa.toLocaleString('vi-VN')} ₫</td>
          </tr>
        </tbody>
      </table>

      <div class="recommendation-box">
        <h4 style="margin: 0 0 10px 0; font-size: 13px; font-weight: 800; color: #15803d; text-transform: uppercase;">
          💡 KHUYẾN NGHỊ TỐI ƯU CHIẾN DỊCH TỪ CHUYÊN GIA:
        </h4>
        <div class="rec-item">
          <span>⏰</span>
          <div><b>Tập trung phân bổ ngân sách theo khung giờ vàng doanh nghiệp:</b> Chiến dịch đạt CPA ấn tượng <b>${report.cpa.toLocaleString('vi-VN')} ₫/liên hệ</b>. Đề xuất điều chỉnh lịch quảng cáo (Ad Schedule) tập trung ngân sách vào khung giờ hành chính (8h30 - 11h30 và 14h00 - 17h00 từ thứ 2 đến thứ 6) để tiếp cận trúng đối tượng nhân sự phụ trách đặt tour.</div>
        </div>
        <div class="rec-item">
          <span>🎯</span>
          <div><b>Tối ưu tỷ lệ chuyển đổi trang đích (On-site CRO):</b> Website ghi nhận đến <b>${report.interest_b2b_tour} lượt quan tâm sâu (interest_b2b_tour)</b>. Khuyến nghị bổ sung phần bằng chứng tin cậy (social proof: logo các doanh nghiệp đối tác tiêu biểu, hình ảnh đoàn thực tế) và làm rõ nét nút nhận báo giá nhanh để gia tăng số lượng khách để lại thông tin liên hệ.</div>
        </div>
      </div>

      <div style="text-align: center; margin: 28px 0 10px 0;">
        <a href="https://erp.fittour.vn/marketing-google-ads" class="cta-btn">
          👉 MỞ BẢNG ĐIỀU KHIỂN GOOGLE ADS BU3 TRÊN ERP
        </a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #475569;">HỆ THỐNG ERP FIT TOUR</p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">Báo cáo bảo mật nội bộ phục vụ theo dõi hiệu quả Marketing Ads BU3.</p>
    </div>
  </div>
</body>
</html>
    `;

    const { sendMail } = require('../utils/mailer');
    await sendMail({
      from: '"[FIT Tour ERP] Marketing Analytics" <loki@fittour.vn>',
      to: targetRecipients.join(', '),
      subject: `📊 [BÁO CÁO CHIẾN DỊCH] Hiệu Suất Google Search Ads & Tương Tác Website B2B (BU3) - Tháng ${targetMonth}/${targetYear}`,
      html: htmlContent
    });

    if (req.user?.id) {
      await logActivity({
        user_id: req.user.id,
        action_type: 'TRIGGER_REPORT',
        entity_type: 'SYSTEM',
        entity_id: null,
        details: `Gửi Email Báo cáo Google Ads BU3 Tháng ${targetMonth}/${targetYear} tới Group BU3 (${targetRecipients.length} recipients: ${targetRecipients.join(', ')})`
      }).catch(err => console.error(err));
    }

    res.json({ 
      success: true, 
      message: `Đã gửi báo cáo Tháng ${targetMonth}/${targetYear} thành công tới Group BU3 + email ngoài (${targetRecipients.length} người nhận)!`,
      recipients: targetRecipients 
    });
  } catch (error) {
    console.error('Lỗi khi gửi email báo cáo Google Ads:', error);
    res.status(500).json({ error: 'Lỗi server khi gửi email' });
  }
});

module.exports = router;
