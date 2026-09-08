const { Pool } = require('pg');
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function migrate() {
  try {
    console.log('🔄 Bắt đầu tạo bảng google_ads_monthly_reports và google_ads_kpis...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS google_ads_monthly_reports (
        id SERIAL PRIMARY KEY,
        bu_name VARCHAR(100) DEFAULT 'BU3',
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        campaign_name VARCHAR(255) DEFAULT '[ BU3 | SEARCH | Tour Doanh Nghiệp | VN ]',
        spend NUMERIC DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        clicks INTEGER DEFAULT 0,
        conversions_ads NUMERIC DEFAULT 0,
        
        -- GA4 Events
        interest_b2b_tour INTEGER DEFAULT 0,
        interest_b2b_tour_users INTEGER DEFAULT 0,
        click_zalo INTEGER DEFAULT 0,
        click_zalo_users INTEGER DEFAULT 0,
        click_phone INTEGER DEFAULT 0,
        click_phone_users INTEGER DEFAULT 0,
        click_consultation INTEGER DEFAULT 0,
        click_consultation_users INTEGER DEFAULT 0,
        click_email INTEGER DEFAULT 0,
        click_email_users INTEGER DEFAULT 0,
        generate_lead INTEGER DEFAULT 0,
        form_submit INTEGER DEFAULT 0,
        form_start INTEGER DEFAULT 0,
        page_view INTEGER DEFAULT 0,
        user_engagement INTEGER DEFAULT 0,
        
        -- CRM Business Output
        crm_leads INTEGER DEFAULT 0,
        crm_won INTEGER DEFAULT 0,
        revenue_won NUMERIC DEFAULT 0,
        
        -- Status & Notes
        notes TEXT,
        is_locked BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(bu_name, year, month)
      );

      CREATE TABLE IF NOT EXISTS google_ads_kpis (
        id SERIAL PRIMARY KEY,
        bu_name VARCHAR(100) DEFAULT 'BU3',
        year INTEGER NOT NULL,
        month INTEGER NOT NULL,
        budget NUMERIC DEFAULT 0,
        target_leads INTEGER DEFAULT 0,
        target_cpl NUMERIC DEFAULT 0,
        target_groups INTEGER DEFAULT 0,
        target_cpa NUMERIC DEFAULT 0,
        pic_name VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(bu_name, year, month)
      );
    `);
    console.log('✅ Đã tạo thành công 2 bảng google_ads_monthly_reports và google_ads_kpis.');

    // Seed data mẫu cho Tháng 8/2026 (theo đúng ảnh chụp thực tế của User)
    const checkExist = await pool.query(
      'SELECT id FROM google_ads_monthly_reports WHERE bu_name = $1 AND year = $2 AND month = $3',
      ['BU3', 2026, 8]
    );

    if (checkExist.rows.length === 0) {
      await pool.query(`
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
          notes
        ) VALUES (
          'BU3', 2026, 8, '[ BU3 | SEARCH | Tour Doanh Nghiệp | VN | T8-2026 ]',
          4380000, 4640, 231, 0,
          263, 132,
          32, 27,
          14, 9,
          7, 6,
          7, 6,
          0, 246, 247,
          23733, 18532,
          18, 2, 125000000,
          'Chiến dịch chi tiêu gần hết ngân sách ngày. Tương tác Zalo và gọi điện đạt tỷ trọng cao nhất.'
        )
      `);
      console.log('✅ Đã nạp dữ liệu mẫu Tháng 8/2026 cho BU3.');
    }

    const checkKpi = await pool.query(
      'SELECT id FROM google_ads_kpis WHERE bu_name = $1 AND year = $2 AND month = $3',
      ['BU3', 2026, 8]
    );

    if (checkKpi.rows.length === 0) {
      await pool.query(`
        INSERT INTO google_ads_kpis (
          bu_name, year, month,
          budget, target_leads, target_cpl,
          target_groups, target_cpa, pic_name, notes
        ) VALUES (
          'BU3', 2026, 8,
          5000000, 20, 250000,
          2, 80000, 'Leader BU3', 'Chạy thử nghiệm chiến dịch Search B2B Tour Doanh Nghiệp'
        )
      `);
      console.log('✅ Đã nạp KPI mục tiêu mẫu Tháng 8/2026 cho BU3.');
    }

  } catch (err) {
    console.error('❌ Lỗi khi chạy migration Google Ads:', err);
    throw err;
  } finally {
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));
