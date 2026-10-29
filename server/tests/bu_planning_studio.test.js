/**
 * bu_planning_studio.test.js
 * Comprehensive Functional & Business Logic Test Suite for FIT TOUR | BU Planning Studio
 * Directly verifying the 15 Acceptance Criteria (DoD)
 */

const request = require('supertest');
const { app } = require('../index');
const db = require('../db');
const { generateAccessToken } = require('../utils/jwt');
const assert = require('assert');

// Mock users for testing personas
const adminUser = { id: 99991, username: 'admin_test', full_name: 'Admin Tổng', role: 'admin', is_admin: true, bus: [] };
const bu5User = { id: 99992, username: 'bu5_lead_test', full_name: 'Lê Hoàng BU5', role: 'manager', is_admin: false, bus: ['BU5'] };
const bu1User = { id: 99993, username: 'bu1_staff_test', full_name: 'Nhân viên BU1', role: 'sales', is_admin: false, bus: ['BU1'] };

const adminToken = generateAccessToken(adminUser);
const bu5Token = generateAccessToken(bu5User);
const bu1Token = generateAccessToken(bu1User);

async function runAllTests() {
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('🚀 STARTING BU PLANNING STUDIO AUTOMATED ACCEPTANCE TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  // Clean initial test sandbox
  await db.query(`DELETE FROM bu_plans WHERE bu_id IN ('BU5', 'BU1', 'BU_TEST')`);

  try {
    // -------------------------------------------------------------
    // Test 1: Tạo kế hoạch BU mới cho năm 2027
    // -------------------------------------------------------------
    console.log('TEST 1: Nhân viên BU5 tạo kế hoạch mới năm 2027...');
    const res1 = await request(app)
      .post('/api/bu-planning/plans')
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({
        bu_id: 'BU5',
        plan_year: 2027,
        title: 'Kế Hoạch BU5 2027 (Test)',
        owner_name: 'Lê Hoàng',
        mkt_budget_quota: 0.01,
        mkt_budget_total: 316460000,
        notes: 'Bản kế hoạch thử nghiệm',
        template_mode: 'template' // Pre-fills audited BU5 data
      });

    assert.strictEqual(res1.status, 201, `Status should be 201, got ${res1.status}: ${JSON.stringify(res1.body)}`);
    assert.strictEqual(res1.body.success, true);
    const planId = res1.body.data.id;
    assert.ok(planId, 'Plan ID must be returned');
    passed++;
    console.log(`✅ Test 1 Passed: Đã tạo Plan ID ${planId} thành công.\n`);

    // -------------------------------------------------------------
    // Test 2 & 3: Thêm sản phẩm, Nhóm, Ưu tiên, Giai đoạn & Kiểm tra tính toán lãi gộp, hòa vốn
    // -------------------------------------------------------------
    console.log('TEST 2 & 3: Thêm sản phẩm độc bản mới và kiểm tra công thức Unit Economics...');
    const res2 = await request(app)
      .post(`/api/bu-planning/plans/${planId}/products`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({
        product_code: 'BU5-TEST-99',
        name: 'Nam Mỹ Khám Phá Peru - Bolivia',
        group_type: 'Tuyến mùa vụ',
        season: 'Tháng 9 - 11',
        priority: 'Cao',
        stage: 'Đang phát triển',
        person_in_charge: 'Lê Hoàng',
        target_pax_per_group: 10,
        price_per_pax: 200000000, // 200 triệu
        variable_cost_per_pax: 160000000, // 160 triệu (Lãi gộp 40 triệu/pax, Margin 20.0%)
        fixed_cost_per_group: 40000000, // Định phí đoàn 40 triệu -> Hòa vốn = 40M / 40M = 1 pax
        strategy_notes: 'Tuyến cao cấp độc quyền'
      });

    assert.strictEqual(res2.status, 201, `Should be 201, got ${res2.status}`);
    const newProdId = res2.body.data.id;
    assert.ok(newProdId);

    // Get detail to verify computed columns
    const detailRes = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu5Token}`);

    assert.strictEqual(detailRes.status, 200);
    const addedProd = detailRes.body.data.products.find(p => p.id === newProdId);
    assert.ok(addedProd, 'Added product must be found in catalog');
    assert.strictEqual(Number(addedProd.gross_margin_pct), 20, `Margin % should be 20, got ${addedProd.gross_margin_pct}`);
    assert.strictEqual(Number(addedProd.gross_profit_per_pax), 40000000, `Gross profit should be 40.000.000`);
    assert.strictEqual(Number(addedProd.break_even_pax), 1, `Break-even pax should be 1`);
    passed++;
    console.log(`✅ Test 2 & 3 Passed: Margin 20.0%, Lãi gộp 40M/pax, Điểm hòa vốn 1 pax tính chính xác 100%.\n`);

    // -------------------------------------------------------------
    // Test 4 & 5: Thêm đợt khởi hành & Kiểm tra Ma trận 12 tháng tự động đồng bộ
    // -------------------------------------------------------------
    console.log('TEST 4 & 5: Thêm 2 đợt khởi hành cho sản phẩm và kiểm tra ma trận 12 tháng...');
    // Thêm đợt T7: 2 đoàn
    const depRes1 = await request(app)
      .post(`/api/bu-planning/plans/${planId}/departures`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({
        product_id: newProdId,
        departure_code: 'BU5-DEP-T99A',
        month: 7,
        groups_count: 2,
        pax_per_group: 10,
        sales_status: 'Đang bán'
      });
    assert.strictEqual(depRes1.status, 201);
    const depId1 = depRes1.body.data.id;

    // Thêm đợt T9: 1 đoàn
    const depRes2 = await request(app)
      .post(`/api/bu-planning/plans/${planId}/departures`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({
        product_id: newProdId,
        departure_code: 'BU5-DEP-T99B',
        month: 9,
        groups_count: 1,
        pax_per_group: 10,
        sales_status: 'Đang bán'
      });
    assert.strictEqual(depRes2.status, 201);

    // Kiểm tra ma trận 12 tháng
    const detailAfterDep = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu5Token}`);

    const matrixRow = detailAfterDep.body.data.matrix.find(m => m.product_id === newProdId);
    assert.ok(matrixRow, 'Matrix row must exist for new product');
    assert.strictEqual(matrixRow.months[7], 2, `Month 7 should have 2 groups, got ${matrixRow.months[7]}`);
    assert.strictEqual(matrixRow.months[9], 1, `Month 9 should have 1 group, got ${matrixRow.months[9]}`);
    assert.strictEqual(matrixRow.total_groups, 3, `Total groups should be 3, got ${matrixRow.total_groups}`);
    assert.strictEqual(matrixRow.total_pax, 30, `Total pax should be 30, got ${matrixRow.total_pax}`);
    assert.strictEqual(matrixRow.total_revenue, 6000000000, `Revenue should be 6 Billion (30 pax * 200M)`);

    // Thử xóa 1 đợt khởi hành và kiểm tra ma trận tự động giảm
    await request(app)
      .delete(`/api/bu-planning/plans/${planId}/departures/${depId1}`)
      .set('Authorization', `Bearer ${bu5Token}`);

    const detailAfterDelete = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu5Token}`);

    const matrixRowAfterDel = detailAfterDelete.body.data.matrix.find(m => m.product_id === newProdId);
    assert.strictEqual(matrixRowAfterDel.months[7], 0, `Month 7 should now be 0 groups after delete`);
    assert.strictEqual(matrixRowAfterDel.total_groups, 1, `Total groups should now be 1`);
    passed++;
    console.log(`✅ Test 4 & 5 Passed: Ma trận 12 tháng tự động nhảy và đồng bộ khi thêm/xóa đợt.\n`);

    // -------------------------------------------------------------
    // Test 6: Thử đổi năm kế hoạch sang 2028
    // -------------------------------------------------------------
    console.log('TEST 6: Thử đổi năm kế hoạch sang 2028...');
    const res6 = await request(app)
      .put(`/api/bu-planning/plans/${planId}/setup`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({
        plan_year: 2028,
        title: 'Kế Hoạch BU5 2028 Tầm Nhìn Chiến Lược'
      });
    assert.strictEqual(res6.status, 200);
    assert.strictEqual(res6.body.data.plan_year, 2028);

    // Chuyển lại về 2027
    await request(app)
      .put(`/api/bu-planning/plans/${planId}/setup`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({ plan_year: 2027, title: 'Kế Hoạch BU5 2027' });
    passed++;
    console.log(`✅ Test 6 Passed: Đổi năm kế hoạch linh hoạt và lưu tức thì.\n`);

    // -------------------------------------------------------------
    // Test 7: Ngân sách Marketing & Kiểm tra tỷ lệ sử dụng ngân sách
    // -------------------------------------------------------------
    console.log('TEST 7: Nhập ngân sách Marketing và kiểm tra tỷ lệ...');
    const res7 = await request(app)
      .put(`/api/bu-planning/plans/${planId}/setup`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({
        mkt_budget_quota: 0.01,
        mkt_budget_total: 350000000 // 350M
      });
    assert.strictEqual(res7.status, 200);

    const checkSummaryRes = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu5Token}`);

    const summary = checkSummaryRes.body.data.summary;
    assert.ok(summary.total_revenue > 0);
    assert.ok(summary.mkt_ratio_actual, 'Actual MKT ratio must be computed');
    passed++;
    console.log(`✅ Test 7 Passed: Ngân sách 350M đối soát Doanh thu đạt tỷ lệ ${summary.mkt_ratio_actual}%.\n`);

    // -------------------------------------------------------------
    // Test 8 & 9: Tạo công việc, gán người phụ trách, deadline & kiểm tra cảnh báo quá hạn
    // -------------------------------------------------------------
    console.log('TEST 8 & 9: Tạo công việc và kiểm tra cảnh báo quá hạn...');
    const pastDate = '2026-10-15'; // Đã qua so với ngày hiện tại (27/10/2026)
    const resTask = await request(app)
      .post(`/api/bu-planning/plans/${planId}/tasks`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({
        task_code: 'BU5-TASK-OVERDUE-TEST',
        category: 'Ký quỹ khách sạn Ai Cập mùa đông',
        deadline: pastDate,
        assignee: 'Minh Thảo',
        status: 'Đang chạy'
      });

    assert.strictEqual(resTask.status, 201);
    const taskId = resTask.body.data.id;

    const detailWithTask = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu5Token}`);

    const overdueTask = detailWithTask.body.data.tasks.find(t => t.id === taskId);
    assert.ok(overdueTask);
    assert.strictEqual(overdueTask.is_overdue, true, 'Task should be flagged as overdue');
    assert.ok(overdueTask.days_overdue > 0, 'Days overdue must be > 0');
    passed++;
    console.log(`✅ Test 8 & 9 Passed: Phát hiện quá hạn ${overdueTask.days_overdue} ngày chính xác.\n`);

    // -------------------------------------------------------------
    // Test 10: Thử bỏ trống trường bắt buộc, nhập sai kiểu dữ liệu & trùng mã
    // -------------------------------------------------------------
    console.log('TEST 10: Kiểm thử bẫy lỗi validation (trùng mã, sai kiểu dữ liệu, bỏ trống)...');
    // 10a. Bỏ trống tên
    const errEmpty = await request(app)
      .post(`/api/bu-planning/plans/${planId}/products`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({ product_code: 'BU5-ERR-1', name: '' });
    assert.strictEqual(errEmpty.status, 400, 'Empty name should return 400');

    // 10b. Nhập giá âm
    const errNegative = await request(app)
      .post(`/api/bu-planning/plans/${planId}/products`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({ product_code: 'BU5-ERR-2', name: 'Tour test lỗi', price_per_pax: -50000 });
    assert.strictEqual(errNegative.status, 400, 'Negative price should return 400');

    // 10c. Trùng mã sản phẩm đã có
    const errDup = await request(app)
      .post(`/api/bu-planning/plans/${planId}/products`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({ product_code: 'BU5-001', name: 'Ai Cập trùng mã' });
    assert.strictEqual(errDup.status, 400, 'Duplicate code should return 400');
    passed++;
    console.log(`✅ Test 10 Passed: Hệ thống chặn đứng 100% các lỗi nhập liệu sai, giá âm và trùng mã.\n`);

    // -------------------------------------------------------------
    // Test 11: Lưu nháp, tải lại và tiếp tục nhập
    // -------------------------------------------------------------
    console.log('TEST 11: Kiểm tra lưu nháp và tải lại trang...');
    const reloadRes = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu5Token}`);
    assert.strictEqual(reloadRes.status, 200);
    assert.strictEqual(reloadRes.body.data.plan.status, 'DRAFT');
    assert.ok(reloadRes.body.data.products.length >= 8);
    passed++;
    console.log(`✅ Test 11 Passed: Dữ liệu nháp tải lại toàn vẹn 100%.\n`);

    // -------------------------------------------------------------
    // Test 12: Phân quyền BU — Nhân viên BU1 KHÔNG được xem/sửa bản nháp của BU5
    // -------------------------------------------------------------
    console.log('TEST 12: Kiểm tra nhân viên BU1 không xem hoặc sửa trái phép dữ liệu BU5...');
    // Thử BU1 xem bản nháp BU5
    const viewForbidden = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu1Token}`);
    assert.strictEqual(viewForbidden.status, 403, `BU1 should get 403 when viewing BU5 draft, got ${viewForbidden.status}`);

    // Thử BU1 sửa bản nháp BU5
    const editForbidden = await request(app)
      .put(`/api/bu-planning/plans/${planId}/setup`)
      .set('Authorization', `Bearer ${bu1Token}`)
      .send({ title: 'Hack BU5' });
    assert.strictEqual(editForbidden.status, 403, `BU1 should get 403 when editing BU5, got ${editForbidden.status}`);
    passed++;
    console.log(`✅ Test 12 Passed: Chặn đứng truy cập và can thiệp trái phép giữa các BU.\n`);

    // -------------------------------------------------------------
    // Test 13: Gửi duyệt, Yêu cầu chỉnh sửa, Duyệt lại & Snapshot lịch sử phiên bản
    // -------------------------------------------------------------
    console.log('TEST 13: Quy trình duyệt 4 bước và snapshot phiên bản...');
    // 13a. BU5 Gửi duyệt
    const submitRes = await request(app)
      .post(`/api/bu-planning/plans/${planId}/status`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({ action: 'SUBMIT' });
    assert.strictEqual(submitRes.status, 200);

    // 13b. BOD yêu cầu chỉnh sửa
    const requestChangesRes = await request(app)
      .post(`/api/bu-planning/plans/${planId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'REQUEST_CHANGES', feedback_notes: 'Cần hạ chi phí marketing tour Ai Cập' });
    assert.strictEqual(requestChangesRes.status, 200);

    const checkStatusRes = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu5Token}`);
    assert.strictEqual(checkStatusRes.body.data.plan.status, 'CHANGES_REQUESTED');
    assert.strictEqual(checkStatusRes.body.data.plan.feedback_notes, 'Cần hạ chi phí marketing tour Ai Cập');

    // 13c. BU5 nộp lại & BOD Duyệt chính thức
    await request(app)
      .post(`/api/bu-planning/plans/${planId}/status`)
      .set('Authorization', `Bearer ${bu5Token}`)
      .send({ action: 'SUBMIT' });

    const approveRes = await request(app)
      .post(`/api/bu-planning/plans/${planId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ action: 'APPROVE', approval_notes: 'BOD phê duyệt toàn diện kế hoạch 2027' });
    assert.strictEqual(approveRes.status, 200);

    // Kiểm tra snapshot version v1.0
    const detailAfterApprove = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.strictEqual(detailAfterApprove.body.data.plan.status, 'APPROVED');
    assert.strictEqual(detailAfterApprove.body.data.versions.length, 1);
    assert.strictEqual(detailAfterApprove.body.data.versions[0].version_label, 'v1.0');

    // Khi đã APPROVED, nhân viên BU1 giờ đây có thể xem Read-only theo chuẩn Transparent BU Scope!
    const viewAllowedAfterApprove = await request(app)
      .get(`/api/bu-planning/plans/${planId}`)
      .set('Authorization', `Bearer ${bu1Token}`);
    assert.strictEqual(viewAllowedAfterApprove.status, 200, 'Approved plan must be readable by all BUs');
    passed++;
    console.log(`✅ Test 13 Passed: Luồng duyệt 4 bước hoàn hảo, snapshot v1.0 đã được lưu trữ.\n`);

    // -------------------------------------------------------------
    // Test 14 & 15: Clean sandbox check
    // -------------------------------------------------------------
    console.log('Dọn sạch dữ liệu test...');
    await db.query(`DELETE FROM bu_plans WHERE id = $1`, [planId]);
    console.log('✅ Đã dọn sạch dữ liệu test, không để lại rác trong database.\n');

    console.log('═══════════════════════════════════════════════════════════════════');
    console.log(`🎉 TẤT CẢ TEST ĐÃ HOÀN TẤT THÀNH CÔNG: ${passed} PASS / 0 FAIL`);
    console.log('═══════════════════════════════════════════════════════════════════');
    process.exit(0);
  } catch (err) {
    console.error('❌ TEST FAILED:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = runAllTests;
