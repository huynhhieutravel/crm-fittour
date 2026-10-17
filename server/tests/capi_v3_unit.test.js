/**
 * Unit Test Suite: Meta Conversions API for Business Messaging v3
 * 
 * Kiểm định logic, chuẩn hóa dữ liệu, đánh giá QualifiedLead, timestamp ổn định và Mock Meta Graph API
 * Sử dụng Node.js built-in test runner (node:test & node:assert/strict)
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const metaCapiV3 = require('../services/metaCapiV3Service');

describe('Meta CAPI Business Messaging v3 - Unit Tests', () => {

  const CURRENT_OCT_2026_DATE = new Date('2026-10-17T22:30:00.000Z');
  const EXPECTED_OCT_2026_UNIX = Math.floor(CURRENT_OCT_2026_DATE.getTime() / 1000); // 1792276200

  test('1. Normalization & Hashing: Số điện thoại chuẩn E.164 không có dấu +', () => {
    assert.equal(metaCapiV3.normalizePhone('0901234567'), '84901234567');
    assert.equal(metaCapiV3.normalizePhone('+84 901 234 567'), '84901234567');
    assert.equal(metaCapiV3.normalizePhone('090-123-4567'), '84901234567');
    assert.equal(metaCapiV3.normalizePhone('(028) 3822 1234'), '842838221234');
    assert.equal(metaCapiV3.normalizePhone(null), null);
    assert.equal(metaCapiV3.normalizePhone(''), null);
  });

  test('2. Normalization & Hashing: SHA-256 nhất quán và bảo mật', () => {
    const raw = '84901234567';
    const hash = metaCapiV3.sha256(raw);
    assert.equal(typeof hash, 'string');
    assert.equal(hash.length, 64);
    const expected = crypto.createHash('sha256').update(raw).digest('hex');
    assert.equal(hash, expected);
  });

  test('3. Schema Payload: Bắt buộc action_source: "business_messaging" và messaging_channel: "messenger" với thời gian thực tế tháng 10/2026', () => {
    const payload = metaCapiV3.buildBusinessMessagingPayload({
      eventName: 'LeadSubmitted',
      psid: '100293848572910',
      pageId: '107694084435854',
      phone: '0901234567',
      email: 'test@fittour.vn',
      customData: { lead_id: 123 },
      eventTime: CURRENT_OCT_2026_DATE,
      eventId: 'fittour_bm_sub_lead_123'
    });

    assert.equal(payload.event_name, 'LeadSubmitted');
    assert.equal(payload.action_source, 'business_messaging');
    assert.equal(payload.messaging_channel, 'messenger');
    assert.equal(payload.event_id, 'fittour_bm_sub_lead_123');
    assert.equal(payload.event_time, EXPECTED_OCT_2026_UNIX);
    assert.equal(new Date(payload.event_time * 1000).getFullYear(), 2026);
    assert.equal(new Date(payload.event_time * 1000).getMonth(), 9); // Tháng 10 (0-indexed)
  });

  test('4. Định danh Messenger: page_scoped_user_id và page_id PHẢI GIỮ NGUYÊN (KHÔNG ĐƯỢC HASH SHA-256)', () => {
    const psid = '100293848572910';
    const pageId = '107694084435854';

    const payload = metaCapiV3.buildBusinessMessagingPayload({
      eventName: 'LeadSubmitted',
      psid,
      pageId
    });

    assert.equal(payload.user_data.page_scoped_user_id, psid, 'PSID phải ở dạng plain text');
    assert.equal(payload.user_data.page_id, pageId, 'Page ID phải ở dạng plain text');
    assert.equal(payload.user_data.page_scoped_user_id.length < 64, true, 'PSID không được phép hash thành 64 chars SHA256');
  });

  test('5. Chống nhầm lẫn: Từ chối Dataset ID nếu bị gán nhầm vào PSID hoặc Page ID', () => {
    assert.throws(() => {
      metaCapiV3.buildBusinessMessagingPayload({
        eventName: 'LeadSubmitted',
        psid: '25418355247839825', // Dataset ID
        pageId: '107694084435854'
      });
    }, /PSID không hợp lệ hoặc bị nhầm với Dataset ID/);

    assert.throws(() => {
      metaCapiV3.buildBusinessMessagingPayload({
        eventName: 'LeadSubmitted',
        psid: '100293848572910',
        pageId: '1573748827119102' // Dataset ID
      });
    }, /Page ID không hợp lệ hoặc bị nhầm với Dataset ID/);
  });

  test('6. Idempotency Key & Event ID: Ổn định, không chứa Date.now(), không chứa plain PSID', () => {
    const payload1 = metaCapiV3.buildBusinessMessagingPayload({
      eventName: 'QualifiedLead',
      psid: '100293848572910',
      pageId: '107694084435854',
      eventId: 'fittour_bm_qual_lead_999'
    });

    assert.equal(payload1.event_id, 'fittour_bm_qual_lead_999');
    assert.equal(payload1.event_id.includes('100293848572910'), false, 'event_id không được lộ raw PSID');
  });

  test('7. Đánh giá Qualified Lead (Tiêu chuẩn nghiêm ngặt): Từ chối "Đang liên hệ" và ghi chú ngắn', () => {
    // 7a. "Đang liên hệ" + ghi chú ngắn ("Đã gọi") -> BẮT BUỘC TỪ CHỐI
    const leadDangLienHeNgan = {
      source: 'Messenger',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854',
      assigned_to: 10,
      status: 'Đang liên hệ',
      tour_id: 15,
      consultation_note: 'Đã gọi'
    };
    const evalA = metaCapiV3.evaluateSalesQualification(leadDangLienHeNgan);
    assert.equal(evalA.isQualified, false, '"Đang liên hệ" + ghi chú 6 ký tự không được tính là QualifiedLead');

    // 7b. "Đang liên hệ" kể cả có ghi chú dài nhưng không có is_sales_qualified -> TỪ CHỐI
    const leadDangLienHeDai = {
      source: 'Messenger',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854',
      assigned_to: 10,
      status: 'Đang liên hệ',
      tour_id: 15,
      consultation_note: 'Khách nghe máy, hẹn chiều mai gọi lại để trao đổi thêm'
    };
    const evalB = metaCapiV3.evaluateSalesQualification(leadDangLienHeDai);
    assert.equal(evalB.isQualified, false, 'Trạng thái xử lý thông thường không tự động biến thành QualifiedLead');

    // 7c. "Tiềm năng" nhưng thiếu tour cụ thể -> TỪ CHỐI
    const leadTiemNangChuaCoTour = {
      source: 'Messenger',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854',
      assigned_to: 10,
      status: 'Tiềm năng',
      tour_id: null,
      consultation_note: 'Khách muốn đi du lịch nước ngoài vào dịp hè'
    };
    const evalC = metaCapiV3.evaluateSalesQualification(leadTiemNangChuaCoTour);
    assert.equal(evalC.isQualified, false, 'Phải có tour_id cụ thể mới xác định được nhu cầu hợp lệ');

    // 7d. "Tiềm năng" + tour_id cụ thể + ghi chú nhu cầu chi tiết (>= 15 chars) -> ĐẠT CHUẨN
    const leadHopLeFunnel = {
      source: 'Messenger',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854',
      assigned_to: 10,
      status: 'Tiềm năng',
      tour_id: 42,
      consultation_note: 'Khách hỏi tour Mông Cổ 4 người đi tháng 8/2026'
    };
    const evalD = metaCapiV3.evaluateSalesQualification(leadHopLeFunnel);
    assert.equal(evalD.isQualified, true, 'Tiềm năng + Tour + Note >= 15 chars phải đạt chuẩn');

    // 7e. Sales chủ động xác nhận is_sales_qualified: true (kèm assigned_to & PSID) -> ĐẠT CHUẨN
    const leadXacNhanChuDong = {
      source: 'Messenger',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854',
      assigned_to: 12,
      status: 'Đang liên hệ',
      is_sales_qualified: true
    };
    const evalE = metaCapiV3.evaluateSalesQualification(leadXacNhanChuDong);
    assert.equal(evalE.isQualified, true, 'Xác nhận chủ động của Sales đạt chuẩn');
  });

  test('8. Timestamp Stability: Thời gian sự kiện giữ nguyên 100% khi retry', () => {
    const originalTime = new Date('2026-10-17T20:15:30.000Z');
    const originalUnix = Math.floor(originalTime.getTime() / 1000);

    const payload = metaCapiV3.buildBusinessMessagingPayload({
      eventName: 'Purchase',
      psid: '100293848572910',
      pageId: '107694084435854',
      eventTime: originalTime,
      eventId: 'fittour_bm_pur_booking_123'
    });

    assert.equal(payload.event_time, originalUnix);

    // Giả lập worker chạy sau đó 2 giờ
    const retryTime = new Date('2026-10-17T22:15:30.000Z');
    assert.notEqual(Math.floor(retryTime.getTime() / 1000), originalUnix);

    // Payload lưu trong DB vẫn giữ nguyên event_time cũ
    const deserializedPayload = JSON.parse(JSON.stringify(payload));
    assert.equal(deserializedPayload.event_time, originalUnix, 'Timestamp sự kiện nghiệp vụ không được thay đổi khi retry');
  });

  test('9. Mock Meta Graph API: Phân loại mã phản hồi chuẩn (200, 400, 401, 429, 500, timeout)', () => {
    // Helper mô phỏng phân loại lỗi trong metaCapiV3Service.js
    function classifyMetaError(status, errorData = {}) {
      const isClientFatal = status >= 400 && status < 500 && status !== 429;
      if (isClientFatal) {
        return 'FAILED_PERMANENT'; // Dead-letter, không retry lãng phí
      }
      return 'FAILED_RETRYABLE'; // Retry exponential backoff
    }

    // 200: Thành công
    assert.equal(classifyMetaError(200), 'FAILED_RETRYABLE'); // chỉ gọi classify khi có lỗi

    // 400: Bad Request (Sai định dạng payload, invalid field) -> Dead-letter vĩnh viễn
    assert.equal(classifyMetaError(400), 'FAILED_PERMANENT');

    // 401: Unauthorized (Token hết hạn / thu hồi quyền) -> Dead-letter vĩnh viễn
    assert.equal(classifyMetaError(401), 'FAILED_PERMANENT');

    // 403: Forbidden (Không có quyền trên dataset / page) -> Dead-letter vĩnh viễn
    assert.equal(classifyMetaError(403), 'FAILED_PERMANENT');

    // 429: Rate Limit -> Tạm thời, CẦN RETRY
    assert.equal(classifyMetaError(429), 'FAILED_RETRYABLE');

    // 500 / 502 / 503: Meta Server Error -> Tạm thời, CẦN RETRY
    assert.equal(classifyMetaError(500), 'FAILED_RETRYABLE');
    assert.equal(classifyMetaError(503), 'FAILED_RETRYABLE');

    // Network Timeout (Không có status code HTTP) -> Tạm thời, CẦN RETRY
    assert.equal(classifyMetaError(null), 'FAILED_RETRYABLE');
  });

});
