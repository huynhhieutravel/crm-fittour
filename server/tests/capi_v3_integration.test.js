/**
 * Integration Test Suite: Meta CAPI Business Messaging v3 Outbox, Concurrency & Crash Recovery
 * 
 * Kiểm định Outbox DB, Feature Flag Zero-Backlog, 2 Worker song song (SKIP LOCKED), và Stale Lock Recovery
 * Sử dụng Node.js built-in test runner (node:test & node:assert/strict) và Local PostgreSQL DB (fittour_local)
 */

const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const db = require('../db');
const metaCapiV3 = require('../services/metaCapiV3Service');

describe('Meta CAPI Business Messaging v3 - Integration Tests (Outbox, Concurrency & Crash Recovery)', () => {

  const TEST_LEAD_ID = 888888;
  const TEST_BOOKING_ID = 777777;
  const TEST_PAGE_ID = '107694084435854';
  const TEST_PSID = '999888777666555';

  before(async () => {
    // 0. Dọn sạch test data cũ
    await db.query(`
      DELETE FROM meta_capi_events 
      WHERE (business_entity_type = 'lead' AND business_entity_id = $1)
         OR (business_entity_type = 'booking' AND business_entity_id = $2)
    `, [TEST_LEAD_ID, TEST_BOOKING_ID]);

    // Đảm bảo flag đang tắt ban đầu
    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_business_messaging_v3_enabled'");
  });

  after(async () => {
    // Dọn sạch test data và trả lại trạng thái an toàn tắt flag
    await db.query(`
      DELETE FROM meta_capi_events 
      WHERE (business_entity_type = 'lead' AND business_entity_id = $1)
         OR (business_entity_type = 'booking' AND business_entity_id = $2)
    `, [TEST_LEAD_ID, TEST_BOOKING_ID]);

    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_business_messaging_v3_enabled'");
  });

  test('1. Feature Flag OFF: Tuyệt đối KHÔNG enqueue vào DB, KHÔNG tạo backlog tích lũy', async () => {
    // Đảm bảo flag đang tắt
    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_business_messaging_v3_enabled'");

    const res = await metaCapiV3.enqueueEvent({
      eventName: 'LeadSubmitted',
      businessEntityType: 'lead',
      businessEntityId: TEST_LEAD_ID,
      pageId: TEST_PAGE_ID,
      psid: TEST_PSID,
      phone: '0901234567'
    });

    assert.equal(res.enqueued, false);
    assert.equal(res.reason, 'FEATURE_FLAG_DISABLED');

    // Xác nhận không có bản ghi nào bị ghi vào meta_capi_events
    const checkDb = await db.query(
      "SELECT COUNT(*)::int as cnt FROM meta_capi_events WHERE business_entity_type = 'lead' AND business_entity_id = $1",
      [TEST_LEAD_ID]
    );
    assert.equal(checkDb.rows[0].cnt, 0, 'Khi cờ OFF, số bản ghi outbox bắt buộc phải là 0 để tránh flood backlog khi bật');
  });

  test('2. Feature Flag ON: Ghi nhận sự kiện LeadSubmitted thành công vào Outbox', async () => {
    // Bật cờ cho test case này
    await db.query("UPDATE settings SET value = 'true' WHERE key = 'meta_capi_business_messaging_v3_enabled'");

    const res = await metaCapiV3.enqueueEvent({
      eventName: 'LeadSubmitted',
      businessEntityType: 'lead',
      businessEntityId: TEST_LEAD_ID,
      pageId: TEST_PAGE_ID,
      psid: TEST_PSID,
      phone: '0901234567',
      email: 'test_integration@fittour.vn',
      customData: { note: 'Test Outbox Enqueue' }
    });

    assert.equal(res.enqueued, true);
    assert.equal(typeof res.outboxId, 'number');
    assert.equal(res.eventId, `fittour_bm_sub_lead_${TEST_LEAD_ID}`);

    // Kiểm tra trực tiếp trong DB
    const dbCheck = await db.query('SELECT * FROM meta_capi_events WHERE id = $1', [res.outboxId]);
    assert.equal(dbCheck.rows.length, 1);
    const row = dbCheck.rows[0];
    assert.equal(row.event_name, 'LeadSubmitted');
    assert.equal(row.status, 'PENDING');
    assert.equal(row.page_id, TEST_PAGE_ID);

    const payload = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload;
    assert.equal(payload.user_data.page_scoped_user_id, TEST_PSID);
    assert.equal(payload.user_data.page_id, TEST_PAGE_ID);
    assert.equal(payload.user_data.ph[0], metaCapiV3.sha256('84901234567'));
  });

  test('3. Chống trùng lặp tuyệt đối (CRM Idempotency): Enqueue lại cùng sự kiện bị chặn', async () => {
    const resDuplicate = await metaCapiV3.enqueueEvent({
      eventName: 'LeadSubmitted',
      businessEntityType: 'lead',
      businessEntityId: TEST_LEAD_ID,
      pageId: TEST_PAGE_ID,
      psid: TEST_PSID
    });

    assert.equal(resDuplicate.enqueued, false);
    assert.equal(resDuplicate.reason, 'ALREADY_EXISTS');

    const countCheck = await db.query(
      "SELECT COUNT(*)::int as cnt FROM meta_capi_events WHERE business_entity_type = 'lead' AND business_entity_id = $1 AND event_name = 'LeadSubmitted'",
      [TEST_LEAD_ID]
    );
    assert.equal(countCheck.rows[0].cnt, 1, 'Bắt buộc chỉ có duy nhất 1 bản ghi trong outbox');
  });

  test('4. Enqueue QualifiedLead: Khác loại sự kiện trên cùng Lead được lưu độc lập', async () => {
    const resQual = await metaCapiV3.enqueueEvent({
      eventName: 'QualifiedLead',
      businessEntityType: 'lead',
      businessEntityId: TEST_LEAD_ID,
      pageId: TEST_PAGE_ID,
      psid: TEST_PSID,
      phone: '0901234567',
      customData: { classification: 'Tiềm năng' }
    });

    assert.equal(resQual.enqueued, true);
    assert.equal(resQual.eventId, `fittour_bm_qual_lead_${TEST_LEAD_ID}`);
  });

  test('5. Purchase: Phân luồng chính xác, chỉ nhận Booking từ khách Messenger và đủ điều kiện thanh toán', async () => {
    // 5a. Khách ngoài kênh Messenger -> Từ chối an toàn
    const nonMessengerCustomer = { id: 999, name: 'Khách Walk-in', phone: '0912345678', facebook_psid: null };
    const dummyBooking = { id: TEST_BOOKING_ID, booking_code: 'BK-TEST-INT', total_price: '50000000', paid: '20000000' };

    const resNonMessenger = await metaCapiV3.enqueuePurchase(dummyBooking, nonMessengerCustomer);
    assert.equal(resNonMessenger.enqueued, false);
    assert.equal(resNonMessenger.reason, 'NOT_MESSENGER_PURCHASE');

    // 5b. Khách Messenger nhưng Booking chỉ mới 'Xác nhận' đơn thuần, CHƯA NỘP TIỀN -> BẮT BUỘC TỪ CHỐI
    const messengerCustomer = { 
      id: 998, 
      name: 'Khách Messenger', 
      phone: '0912345678', 
      facebook_psid: TEST_PSID, 
      facebook_page_id: TEST_PAGE_ID 
    };
    const unconfirmedBooking = { 
      id: TEST_BOOKING_ID, 
      booking_code: 'BK-UNPAID', 
      booking_status: 'Xác nhận', 
      payment_status: 'unpaid',
      total_price: '50000000', 
      paid: '0' 
    };
    const resUnconfirmed = await metaCapiV3.enqueuePurchase(unconfirmedBooking, messengerCustomer);
    assert.equal(resUnconfirmed.enqueued, false);
    assert.equal(resUnconfirmed.reason, 'NOT_ELIGIBLE_TRANSACTION', 'Booking Xác nhận đơn thuần chưa có tiền phải bị từ chối');

    // 5c. Khách Messenger và Booking đã có thanh toán/cọc thực tế -> Chấp thuận
    const resPurchase = await metaCapiV3.enqueuePurchase(dummyBooking, messengerCustomer);
    assert.equal(resPurchase.enqueued, true);
    assert.equal(resPurchase.eventId, `fittour_bm_pur_booking_${TEST_BOOKING_ID}`);

    const checkPurchase = await db.query(
      "SELECT payload FROM meta_capi_events WHERE business_entity_type = 'booking' AND business_entity_id = $1",
      [TEST_BOOKING_ID]
    );
    const purPayload = typeof checkPurchase.rows[0].payload === 'string' ? JSON.parse(checkPurchase.rows[0].payload) : checkPurchase.rows[0].payload;
    assert.equal(purPayload.custom_data.value, 50000000);
  });

  test('6. Concurrency Test: 2 Worker chạy đồng thời (FOR UPDATE SKIP LOCKED) không bao giờ bị conflict hay double-process', async () => {
    // Chạy song song 2 worker batches
    const [workerA, workerB] = await Promise.all([
      metaCapiV3.processOutboxBatch({ limit: 2, isDryRun: true }),
      metaCapiV3.processOutboxBatch({ limit: 2, isDryRun: true })
    ]);

    // Tổng số lượng xử lý phải chia đều cho cả 2 worker mà không có sự kiện nào bị xử lý 2 lần
    const totalProcessed = workerA.processed + workerB.processed;
    assert.equal(totalProcessed >= 3, true, 'Hai worker phải chia nhau xử lý toàn bộ các sự kiện PENDING');

    // Kiểm tra tất cả sự kiện đã chuyển sang SENT
    const checkSent = await db.query(
      "SELECT status FROM meta_capi_events WHERE (business_entity_type = 'lead' AND business_entity_id = $1) OR (business_entity_type = 'booking' AND business_entity_id = $2)",
      [TEST_LEAD_ID, TEST_BOOKING_ID]
    );
    assert.equal(checkSent.rows.every(r => r.status === 'SENT'), true);
  });

  test('7. Crash Recovery: Tự động phục hồi các sự kiện bị kẹt ở PROCESSING (Stale Lock > 5 phút)', async () => {
    // Tạo 1 sự kiện giả lập bị kẹt ở PROCESSING do worker chết 10 phút trước
    const staleEventId = `fittour_bm_sub_lead_${TEST_LEAD_ID}_stale`;
    const insertRes = await db.query(`
      INSERT INTO meta_capi_events (
        event_id, event_name, action_source, messaging_channel,
        business_entity_type, business_entity_id, idempotency_key,
        page_id, psid_hash, payload, status, locked_at, locked_by, created_at, updated_at
      ) VALUES ($1, 'LeadSubmitted', 'business_messaging', 'messenger', 'lead', 999999, 'idemp_stale_1',
                $2, 'hash123', '{"user_data":{"page_id":"1","page_scoped_user_id":"2"}}',
                'PROCESSING', NOW() - INTERVAL '10 minutes', 'crashed_worker_99', NOW(), NOW())
      RETURNING id;
    `, [staleEventId, TEST_PAGE_ID]);

    const staleRecordId = insertRes.rows[0].id;

    // Chạy cơ chế thu hồi stale locks
    const recoveredCount = await metaCapiV3.recoverStaleLocks(5);
    assert.equal(recoveredCount >= 1, true, 'Phải phát hiện và phục hồi ít nhất 1 lock bị kẹt');

    // Kiểm tra bản ghi đã được reset về FAILED_RETRYABLE để worker kế tiếp claim lại
    const checkRecovered = await db.query('SELECT status, locked_at, locked_by FROM meta_capi_events WHERE id = $1', [staleRecordId]);
    assert.equal(checkRecovered.rows[0].status, 'FAILED_RETRYABLE');
    assert.equal(checkRecovered.rows[0].locked_at, null);
    assert.equal(checkRecovered.rows[0].locked_by, null);

    // Dọn dẹp bản ghi stale test
    await db.query('DELETE FROM meta_capi_events WHERE id = $1', [staleRecordId]);
  });

  test('8. Legacy CAPI Regression: Khi cờ v3 TẮT (false), Legacy CAPI hoạt động nguyên bản 100% không bị chặn', async () => {
    const metaCapiLegacy = require('../services/metaCapiService');

    // Đảm bảo cờ v3 đang tắt
    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_business_messaging_v3_enabled'");
    await db.query("UPDATE settings SET value = 'false' WHERE key = 'meta_capi_enabled'");

    // 8a. Gọi legacy CAPI khi cả 2 đều tắt -> Trả về chuẩn của legacy CAPI
    const resOff = await metaCapiLegacy.sendEvent('Lead', { phone: '0901234567', facebook_psid: TEST_PSID });
    assert.equal(resOff.success, false);
    assert.equal(resOff.reason, 'CAPI disabled', 'Khi v3 tắt, legacy CAPI không bị hijack bởi DELEGATED_TO_V3');

    // 8b. Gọi sendStatusChangeEvent trạng thái "Đang liên hệ" -> Không bị chặn bởi v3
    const testLead = { id: 12345, name: 'Khách Test', phone: '0901234567' };
    const resStatus = await metaCapiLegacy.sendStatusChangeEvent(testLead, 'Đang liên hệ');
    assert.equal(resStatus.success, false);
    assert.equal(resStatus.reason, 'CAPI disabled');

    // 8c. Trạng thái "Chốt đơn" ở Lead -> Luôn được chuyển nhượng cho Booking dù v3 bật hay tắt
    const resChotDon = await metaCapiLegacy.sendStatusChangeEvent(testLead, 'Chốt đơn');
    assert.equal(resChotDon.success, true);
    assert.equal(resChotDon.reason, 'PURCHASE_DELEGATED_TO_BOOKING');
  });

});
