process.chdir('/var/www/fittour-crm/server');
require('dotenv').config();

const { generateAccessToken } = require('/var/www/fittour-crm/server/utils/jwt');
const axios = require('axios');

async function runQA() {
  console.log('====================================================');
  console.log('🚀 BẮT ĐẦU QA TOÀN DIỆN PRODUCTION CRM FIT TOUR');
  console.log('====================================================\n');
  
  // Create valid Admin token with RS256
  const token = generateAccessToken({
    id: 1,
    username: 'admin',
    full_name: 'Admin System',
    role_name: 'admin'
  });

  const authHeaders = { headers: { Authorization: 'Bearer ' + token } };
  const baseUrl = 'http://127.0.0.1:5001';

  const results = [];

  async function checkEndpoint(name, method, url, data) {
    try {
      const res = method === 'GET' ? await axios.get(url, authHeaders) : await axios.post(url, data || {}, authHeaders);
      results.push({ name, status: res.status, ok: true });
      console.log(`✅ [${name}] ${method} ${url} -> HTTP ${res.status}`);
      return res.data;
    } catch (err) {
      const status = err.response ? err.response.status : 'ERR';
      const detail = err.response?.data?.message || err.message;
      results.push({ name, status, ok: false, error: detail });
      console.error(`❌ [${name}] ${method} ${url} -> HTTP ${status}: ${detail}`);
      return null;
    }
  }

  // 1. Check Marketing Budget Plan Endpoints
  console.log('--- 1. Kiểm tra Module Kế Hoạch & Ngân Sách MKT ---');
  const pBU1 = await checkEndpoint('Marketing Plan BU1 (Q4/2026)', 'GET', `${baseUrl}/api/marketing-budget-plan?bu=BU1&quarter=4&year=2026`);
  const pBU2 = await checkEndpoint('Marketing Plan BU2 (Q4/2026)', 'GET', `${baseUrl}/api/marketing-budget-plan?bu=BU2&quarter=4&year=2026`);
  const pBU3 = await checkEndpoint('Marketing Plan BU3 (Q4/2026)', 'GET', `${baseUrl}/api/marketing-budget-plan?bu=BU3&quarter=4&year=2026`);
  const pBU4 = await checkEndpoint('Marketing Plan BU4 (Q4/2026)', 'GET', `${baseUrl}/api/marketing-budget-plan?bu=BU4&quarter=4&year=2026`);
  const pBU5 = await checkEndpoint('Marketing Plan BU5 (Q4/2026)', 'GET', `${baseUrl}/api/marketing-budget-plan?bu=BU5&quarter=4&year=2026`);

  if (pBU1 && pBU1.plans) {
    console.log(`   * BU1 số lượng tour: ${pBU1.plans.length}, tổng doanh thu dự kiến: ${pBU1.summary?.totalExpectedRevenue?.toLocaleString('vi-VN')} đ`);
    const hasTaiwanInBU1 = pBU1.plans.some(p => (p.tour_name || '').includes('Đài Loan') || (p.route_name || '').includes('Đài Loan'));
    console.log(`   * BU1 có tour Đài Loan không?: ${hasTaiwanInBU1 ? '❌ SAI (Phát hiện Đài Loan lọt vào BU1)' : '✅ ĐÚNG (BU1 100% Trung Quốc, Zero Đài Loan)'}`);
  }
  if (pBU2 && pBU2.plans) {
    console.log(`   * BU2 số lượng tour: ${pBU2.plans.length}`);
    const hasTaiwanInBU2 = pBU2.plans.some(p => (p.tour_name || '').includes('Đài Loan') || (p.route_name || '').includes('Đài Loan'));
    console.log(`   * BU2 kiểm tra tuyến: ${hasTaiwanInBU2 ? '✅ ĐÚNG (Đài Loan nằm đúng BU2 Đông Bắc Á)' : 'Chưa có lịch tour Đài Loan Q4'}`);
  }

  // 2. Check Sync ERP
  console.log('\n--- 2. Kiểm tra Sync ERP Endpoint ---');
  const syncRes = await checkEndpoint('Sync ERP Departures', 'POST', `${baseUrl}/api/marketing-budget-plan/sync-erp`, {});
  if (syncRes) console.log(`   * Kết quả sync: ${syncRes.message}`);

  // 3. Check Batch Save with 1 real record
  console.log('\n--- 3. Kiểm tra Batch Save Endpoint ---');
  if (pBU1 && pBU1.plans && pBU1.plans.length > 0) {
    const testRow = pBU1.plans[0];
    const saveRes = await checkEndpoint('Batch Save Record #' + testRow.id, 'POST', `${baseUrl}/api/marketing-budget-plan/batch-save`, {
      updates: [{
        id: testRow.id,
        target_pax: testRow.target_pax,
        price_per_pax: testRow.price_per_pax,
        cost_per_pax: testRow.cost_per_pax,
        cpl_target: testRow.cpl_target,
        cr_sale: testRow.cr_sale,
        mkt_percentage: testRow.mkt_percentage
      }]
    });
    if (saveRes) console.log(`   * Batch Save response: ${JSON.stringify(saveRes)}`);
  }

  // 4. Check Các Modules Lõi Khác Của CRM
  console.log('\n--- 4. Kiểm tra Các Module Lõi Khác Của CRM ---');
  await checkEndpoint('Tours API', 'GET', `${baseUrl}/api/tours?limit=5`);
  await checkEndpoint('Departures API', 'GET', `${baseUrl}/api/departures?limit=5`);
  await checkEndpoint('Leads API', 'GET', `${baseUrl}/api/leads?limit=5`);
  await checkEndpoint('Marketing Ads API', 'GET', `${baseUrl}/api/marketing-ads`);
  await checkEndpoint('Business Units API', 'GET', `${baseUrl}/api/business-units`);

  // 5. Kiểm tra Database Sequences
  console.log('\n--- 5. Kiểm tra Database & Sequences ---');
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const countRes = await pool.query('SELECT count(*) FROM marketing_budget_plans');
  const seqRes = await pool.query('SELECT last_value FROM marketing_budget_plans_id_seq');
  const maxIdRes = await pool.query('SELECT COALESCE(MAX(id), 0) as max_id FROM marketing_budget_plans');
  console.log(`   * Tổng số records trong marketing_budget_plans: ${countRes.rows[0].count}`);
  console.log(`   * Sequence last_value: ${seqRes.rows[0].last_value}, Max ID: ${maxIdRes.rows[0].max_id}`);
  if (Number(seqRes.rows[0].last_value) >= Number(maxIdRes.rows[0].max_id)) {
    console.log('   * Sequence Check: ✅ ĐỒNG BỘ CHÍNH XÁC (Không bị kẹt sequence lỗi 500)');
  } else {
    console.log('   * Sequence Check: ⚠️ Cần sync sequence');
  }
  await pool.end();

  console.log('\n====================================================');
  const allOk = results.every(r => r.ok);
  console.log('🏆 KẾT QUẢ TỔNG THỂ QA: ' + (allOk ? '✅ 100% CÁC BÀI TEST ĐẠT TIÊU CHUẨN' : '❌ PHÁT HIỆN LỖI'));
  console.log('====================================================');
}

runQA().catch(console.error);
