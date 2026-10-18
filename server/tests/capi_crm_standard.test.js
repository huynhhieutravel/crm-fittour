/**
 * TEST SUITE: Meta Conversions API CRM Standard (Option A)
 * 
 * Kiểm tra toàn diện 8 khía cạnh cốt lõi:
 * 1. Normalization & Hashing (SĐT E.164, Email, External ID)
 * 2. Payload Schema chuẩn CRM (action_source: "system_generated", phân biệt lead_id vs CRM ID)
 * 3. Chống nhầm lẫn: Không mang PSID/Page ID vào user_data của luồng CRM
 * 4. Idempotency Key & Khử trùng lặp DB (Unique Constraint)
 * 5. Tiêu chuẩn đánh giá QualifiedLead (Nghiệp vụ Sales)
 * 6. Nguyên tắc Kế toán Thực thu Purchase (BẮT BUỘC paid > 0, chặn đơn hủy)
 * 7. Feature Flag An Toàn: Khi CRM CAPI OFF, không tạo backlog trong DB; De-conflict với Legacy CAPI
 * 8. Concurrency Worker (FOR UPDATE SKIP LOCKED) & Mock Isolated Test Runner
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const db = require('../db');
const metaCapiCrm = require('../services/metaCapiCrmService');
const metaCapiLegacy = require('../services/metaCapiService');

const sha256 = (val) => crypto.createHash('sha256').update(String(val).trim().toLowerCase()).digest('hex');

const TEST_LEAD_ID = 888101;
const TEST_BOOKING_ID = 777101;

test.describe('Meta Conversions API CRM Standard - Unit & Integration Tests', () => {

  test.before(async () => {
    // Đảm bảo dọn dẹp các bản ghi test cũ
    await db.query("DELETE FROM meta_capi_events;");
  });

  test.after(async () => {
    // Dọn dẹp sau test và trả feature flag về an toàn
    await db.query("DELETE FROM meta_capi_events WHERE (business_entity_type = 'lead' AND business_entity_id = $1) OR (business_entity_type = 'booking' AND business_entity_id = $2)", [TEST_LEAD_ID, TEST_BOOKING_ID]);
    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_crm_enabled'");
    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_business_messaging_v3_enabled'");
  });

  test('1. Normalization & Hashing: SĐT chuẩn E.164 không dấu +, Email sạch, External ID hash', () => {
    // Phone
    assert.equal(metaCapiCrm.normalizePhone('0901 234 567'), '84901234567');
    assert.equal(metaCapiCrm.normalizePhone('+84 901-234-567'), '84901234567');
    assert.equal(metaCapiCrm.normalizePhone('84901234567'), '84901234567');
    assert.equal(metaCapiCrm.normalizePhone('12345'), null, 'SĐT quá ngắn phải bị loại bỏ');
    assert.equal(metaCapiCrm.normalizePhone(null), null);

    // Email
    assert.equal(metaCapiCrm.normalizeEmail('  KhachHang@FitTour.VN '), 'khachhang@fittour.vn');
    assert.equal(metaCapiCrm.normalizeEmail('invalid-email'), null);
    assert.equal(metaCapiCrm.normalizeEmail(null), null);

    // SHA-256
    const expectedHash = sha256('84901234567');
    assert.equal(metaCapiCrm.sha256('84901234567'), expectedHash);
  });

  test('2. Schema Payload: Bắt buộc action_source: "system_generated" và phân biệt rạch ròi Meta Lead ID vs CRM ID', () => {
    const payload = metaCapiCrm.buildCrmPayload({
      eventName: 'Lead',
      phone: '0901234567',
      email: 'lead@fittour.vn',
      externalId: 12345,
      metaLeadId: '987654321012345', // ID thật từ Meta Form
      fbc: 'fb.1.1712345678.AbCdEf',
      customData: { content_name: 'Tour Mông Cổ' }
    });

    assert.equal(payload.action_source, 'system_generated', 'Phải dùng chuẩn system_generated cho CRM');
    assert.equal(payload.event_name, 'Lead');
    assert.equal(typeof payload.event_time, 'number');

    // User data
    assert.equal(payload.user_data.ph[0], sha256('84901234567'));
    assert.equal(payload.user_data.em[0], sha256('lead@fittour.vn'));
    assert.equal(payload.user_data.external_id[0], sha256('12345'));
    assert.equal(payload.user_data.lead_id, '987654321012345', 'Meta Lead ID thật phải được giữ nguyên');
    assert.equal(payload.user_data.fbc, 'fb.1.1712345678.AbCdEf');

    // Chống đưa CRM ID vào user_data.lead_id
    const payloadFakeLeadId = metaCapiCrm.buildCrmPayload({
      eventName: 'Lead',
      phone: '0901234567',
      externalId: 12345,
      metaLeadId: '12345' // Bị nhầm CRM ID ngắn
    });
    assert.equal(payloadFakeLeadId.user_data.lead_id, undefined, 'CRM ID ngắn tuyệt đối không được đưa vào user_data.lead_id');

    // Không có thuộc tính Business Messaging
    assert.equal(payload.user_data.page_id, undefined);
    assert.equal(payload.user_data.page_scoped_user_id, undefined);
    assert.equal(payload.messaging_channel, undefined);

    // Custom data
    assert.equal(payload.custom_data.lead_event_source, 'FIT Tour CRM');
    assert.equal(payload.custom_data.event_source, 'crm');
    assert.equal(payload.custom_data.content_name, 'Tour Mông Cổ');
  });

  test('3. Đánh giá QualifiedLead: Tuân thủ quy chuẩn nghiệp vụ của Sales', () => {
    // 3a. Chưa gán Sales -> Từ chối
    const unassigned = metaCapiCrm.evaluateSalesQualification({ phone: '0901234567', assigned_to: null, status: 'Tiềm năng' });
    assert.equal(unassigned.isQualified, false);

    // 3b. Không có SĐT và Email -> Từ chối
    const noContact = metaCapiCrm.evaluateSalesQualification({ phone: null, email: null, assigned_to: 1, status: 'Tiềm năng' });
    assert.equal(noContact.isQualified, false);

    // 3c. Trạng thái 'Đang liên hệ' và ghi chú ngắn -> Từ chối
    const dangLienHe = metaCapiCrm.evaluateSalesQualification({ phone: '0901234567', assigned_to: 1, status: 'Đang liên hệ', consultation_note: 'Khách hỏi giá' });
    assert.equal(dangLienHe.isQualified, false);

    // 3d. Sales chủ động tích chọn is_sales_qualified -> Đạt chuẩn
    const explicit = metaCapiCrm.evaluateSalesQualification({ phone: '0901234567', assigned_to: 1, is_sales_qualified: true });
    assert.equal(explicit.isQualified, true);

    // 3e. Trạng thái 'Tiềm năng' + Đã chọn Tour + Ghi chú tư vấn cụ thể (>= 15 ký tự) -> Đạt chuẩn
    const funnel = metaCapiCrm.evaluateSalesQualification({
      phone: '0901234567',
      assigned_to: 1,
      status: 'Tiềm năng',
      tour_id: 10,
      consultation_note: 'Khách dự kiến đi 4 người khởi hành tháng 11, cần visa nhanh.'
    });
    assert.equal(funnel.isQualified, true);
  });

  test('4. Purchase Eligibility (Nguyên tắc Kế toán Thực thu): BẮT BUỘC paid > 0, từ chối đơn hủy', () => {
    // Đơn chưa thanh toán (paid = 0) -> Bị chặn
    assert.equal(metaCapiCrm.isEligiblePurchaseBooking({ paid: 0, booking_status: 'Xác nhận' }), false);
    assert.equal(metaCapiCrm.isEligiblePurchaseBooking({ paid: null, booking_status: 'Đã thanh toán' }), false);

    // Đơn đã thanh toán nhưng bị Hủy/Hoàn tiền -> Bị chặn
    assert.equal(metaCapiCrm.isEligiblePurchaseBooking({ paid: 50000000, booking_status: 'Huỷ' }), false);
    assert.equal(metaCapiCrm.isEligiblePurchaseBooking({ paid: 50000000, booking_status: 'Đã hoàn tiền' }), false);

    // Đơn hợp lệ có tiền thực thu
    assert.equal(metaCapiCrm.isEligiblePurchaseBooking({ paid: 20000000, booking_status: 'Đã đặt cọc' }), true);
    assert.equal(metaCapiCrm.isEligiblePurchaseBooking({ paid: 50000000, booking_status: 'Đã thanh toán' }), true);
  });

  test('5. Feature Flag OFF: Tuyệt đối KHÔNG enqueue vào DB, KHÔNG tạo backlog tích lũy', async () => {
    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_crm_enabled'");

    const res = await metaCapiCrm.enqueueLead({ id: TEST_LEAD_ID, phone: '0901234567', name: 'Khách Test OFF' });
    assert.equal(res.enqueued, false);
    assert.equal(res.reason, 'CRM_CAPI_FEATURE_FLAG_DISABLED');

    // Kiểm tra không có bản ghi nào lọt vào DB
    const checkDb = await db.query("SELECT * FROM meta_capi_events WHERE business_entity_type = 'lead' AND business_entity_id = $1", [TEST_LEAD_ID]);
    assert.equal(checkDb.rows.length, 0, 'DB không được chứa sự kiện khi feature flag tắt');
  });

  test('6. Feature Flag ON: Enqueue thành công & Chống trùng lặp tuyệt đối (CRM Idempotency)', async () => {
    await db.query("UPDATE settings SET value = 'true' WHERE key = 'meta_capi_crm_enabled'");

    // 6a. Enqueue lần đầu: Thành công
    const res1 = await metaCapiCrm.enqueueLead({ id: TEST_LEAD_ID, phone: '0901234567', name: 'Khách Test ON', source: 'Website' });
    assert.equal(res1.enqueued, true);
    assert.equal(typeof res1.outboxId, 'number');

    // 6b. Enqueue lại cùng sự kiện Lead: Bị chặn bởi Idempotency / Unique Constraint
    const res2 = await metaCapiCrm.enqueueLead({ id: TEST_LEAD_ID, phone: '0901234567', name: 'Khách Test ON Lần 2' });
    assert.equal(res2.enqueued, false);
    assert.equal(res2.reason, 'ALREADY_EXISTS_IDEMPOTENT');

    // 6c. Enqueue QualifiedLead: Thành công vì khác event_name
    const resQual = await metaCapiCrm.enqueueQualifiedLead({ id: TEST_LEAD_ID, phone: '0901234567', status: 'Tiềm năng' });
    assert.equal(resQual.enqueued, true);

    // 6d. Enqueue Purchase cho Booking: Thành công
    const resPur = await metaCapiCrm.enqueuePurchase(
      { id: TEST_BOOKING_ID, booking_code: 'BK-TEST-CRM', paid: 15000000, total_price: 30000000, booking_status: 'Đã đặt cọc' },
      { id: 999, phone: '0901234567', email: 'cust@fittour.vn' }
    );
    assert.equal(resPur.enqueued, true);

    // 6e. Enqueue lại Purchase khi khách nộp thêm đợt 2: Bị chặn hoàn toàn, tránh nhân đôi doanh thu
    const resPur2 = await metaCapiCrm.enqueuePurchase(
      { id: TEST_BOOKING_ID, booking_code: 'BK-TEST-CRM', paid: 30000000, total_price: 30000000, booking_status: 'Đã thanh toán' },
      { id: 999, phone: '0901234567', email: 'cust@fittour.vn' }
    );
    assert.equal(resPur2.enqueued, false);
    assert.equal(resPur2.reason, 'ALREADY_EXISTS_IDEMPOTENT', 'Các đợt thanh toán kế tiếp không được nhân đôi Purchase');
  });

  test('7. Worker Concurrency & Safe Locking: FOR UPDATE SKIP LOCKED chạy song song an toàn', async () => {
    // Chạy song song 2 worker batches trong chế độ dry-run
    const [workerA, workerB] = await Promise.all([
      metaCapiCrm.processCrmOutboxBatch({ limit: 2, isDryRun: true }),
      metaCapiCrm.processCrmOutboxBatch({ limit: 2, isDryRun: true })
    ]);

    const totalProcessed = workerA.processed + workerB.processed;
    assert.equal(totalProcessed >= 3, true, 'Hai worker phải chia nhau xử lý toàn bộ các sự kiện PENDING');

    // Kiểm tra tất cả sự kiện đã chuyển sang SENT
    const checkSent = await db.query(
      "SELECT status FROM meta_capi_events WHERE (business_entity_type = 'lead' AND business_entity_id = $1) OR (business_entity_type = 'booking' AND business_entity_id = $2)",
      [TEST_LEAD_ID, TEST_BOOKING_ID]
    );
    assert.equal(checkSent.rows.every(r => r.status === 'SENT'), true);
  });

  test('8. De-conflict với Legacy CAPI: Khi CRM CAPI bật, Legacy CAPI tự động bàn giao (DELEGATED_TO_CRM_CAPI)', async () => {
    // Đảm bảo cờ CRM đang BẬT
    await db.query("UPDATE settings SET value = 'true' WHERE key = 'meta_capi_crm_enabled'");
    await db.query("UPDATE settings SET value = 'true' WHERE key = 'meta_capi_enabled'");

    // Gọi legacy CAPI sendEvent -> Phải trả về DELEGATED_TO_CRM_CAPI
    const resLegacy = await metaCapiLegacy.sendEvent('Lead', { phone: '0901234567' });
    assert.equal(resLegacy.success, true);
    assert.equal(resLegacy.reason, 'DELEGATED_TO_CRM_CAPI');

    // Gọi sendStatusChangeEvent -> Bị chặn
    const resStatus = await metaCapiLegacy.sendStatusChangeEvent({ id: TEST_LEAD_ID }, 'Đang liên hệ');
    assert.equal(resStatus.success, true);
    assert.equal(resStatus.reason, 'DELEGATED_TO_CRM_CAPI');
  });

});
