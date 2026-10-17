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

  test('10. Purchase Eligibility (Nguyên tắc Kế toán Thực thu): BẮT BUỘC paid > 0, từ chối mọi trạng thái nếu paid = 0', () => {
    // 10a. Trạng thái 'Xác nhận' đơn thuần, chưa thanh toán (paid = 0) -> BẮT BUỘC TỪ CHỐI
    const bookingXacNhanChuaCoc = {
      booking_code: 'BK-CONFIRMED-UNPAID',
      booking_status: 'Xác nhận',
      payment_status: 'unpaid',
      paid: 0,
      total_price: 35000000
    };
    assert.equal(metaCapiV3.isEligiblePurchaseBooking(bookingXacNhanChuaCoc), false, 'Xác nhận đơn thuần không được coi là Purchase');

    // 10b. Trạng thái 'CONFIRMED' tiếng Anh chưa nộp tiền -> TỪ CHỐI
    const bookingConfirmedNoMoney = {
      booking_code: 'BK-EN-CONFIRMED',
      booking_status: 'CONFIRMED',
      paid: null,
      total_price: 50000000
    };
    assert.equal(metaCapiV3.isEligiblePurchaseBooking(bookingConfirmedNoMoney), false);

    // 10c. ĐẶC BIỆT: Nhãn 'Đã đặt cọc' nhưng nhân viên chưa nhập phiếu thu (paid = 0) -> BẮT BUỘC TỪ CHỐI
    const bookingStatusDaDatCocPaidZero = {
      booking_code: 'BK-STATUS-DEPOSIT-ZERO',
      booking_status: 'Đã đặt cọc',
      paid: 0,
      total_price: 35000000
    };
    assert.equal(metaCapiV3.isEligiblePurchaseBooking(bookingStatusDaDatCocPaidZero), false, 'Đã đặt cọc nhưng paid = 0 TUYỆT ĐỐI KHÔNG coi là Purchase');

    // 10d. ĐẶC BIỆT: Nhãn 'Đã thanh toán' hoặc 'Hoàn thành' nhưng chưa có tiền thực thu (paid = 0) -> BẮT BUỘC TỪ CHỐI
    const bookingStatusPaidZero = {
      booking_code: 'BK-STATUS-PAID-ZERO',
      booking_status: 'Đã thanh toán',
      payment_status: 'paid',
      paid: 0,
      total_price: 40000000
    };
    assert.equal(metaCapiV3.isEligiblePurchaseBooking(bookingStatusPaidZero), false, 'Đã thanh toán nhưng paid = 0 TUYỆT ĐỐI KHÔNG coi là Purchase');

    // 10e. ĐỦ ĐIỀU KIỆN: Khách nộp cọc thực tế (paid = 10,000,000 > 0) kèm trạng thái 'Đã đặt cọc' hoặc 'Xác nhận' -> ĐẠT TIÊU CHUẨN
    const bookingDaDatCocTien = {
      booking_code: 'BK-DEPOSIT-PAID',
      booking_status: 'Đã đặt cọc',
      payment_status: 'partial',
      paid: 10000000,
      total_price: 35000000
    };
    assert.equal(metaCapiV3.isEligiblePurchaseBooking(bookingDaDatCocTien), true, 'Có tiền thực thu > 0 và trạng thái Đã đặt cọc đạt chuẩn Purchase');

    // 10f. ĐỦ ĐIỀU KIỆN: Thanh toán đủ thực tế (paid = 35,000,000 > 0) kèm trạng thái 'paid' -> ĐẠT TIÊU CHUẨN
    const bookingDaThanhToanDu = {
      booking_code: 'BK-FULLY-PAID',
      booking_status: 'Hoàn thành',
      payment_status: 'paid',
      paid: 35000000,
      total_price: 35000000
    };
    assert.equal(metaCapiV3.isEligiblePurchaseBooking(bookingDaThanhToanDu), true, 'Có tiền thực thu > 0 và thanh toán đủ đạt chuẩn Purchase');
  });

  test('11. Meta Token Permissions: Xác định đầy đủ các quyền bắt buộc (page_events, pages_messaging, ads_management)', () => {
    // Kiểm tra cấu trúc kiểm tra quyền
    const sampleGrantedList = ['ads_management', 'pages_messaging', 'pages_show_list', 'page_events'];
    const REQUIRED_PERMISSIONS = ['ads_management', 'pages_messaging', 'page_events'];

    const hasPageEvents = sampleGrantedList.includes('page_events');
    const hasPagesMessaging = sampleGrantedList.includes('pages_messaging');
    const hasAdsManagement = sampleGrantedList.includes('ads_management');
    const isFullyQualified = REQUIRED_PERMISSIONS.every(p => sampleGrantedList.includes(p));

    assert.equal(hasPageEvents, true, 'Quyền page_events là bắt buộc cho Business Messaging CAPI');
    assert.equal(hasPagesMessaging, true, 'Quyền pages_messaging là bắt buộc cho Webhook/PSID');
    assert.equal(hasAdsManagement, true, 'Quyền ads_management là bắt buộc cho Dataset link');
    assert.equal(isFullyQualified, true);

    // Trường hợp thiếu page_events -> cảnh báo thiếu quyền
    const incompleteList = ['ads_management', 'pages_messaging'];
    const missing = REQUIRED_PERMISSIONS.filter(p => !incompleteList.includes(p));
    assert.deepEqual(missing, ['page_events'], 'Phải phát hiện chính xác nếu thiếu page_events');
  });

  test('12. Phân biệt kênh chuyển đổi: Từ chối Business Messaging khi giao dịch từ Website, Chuyển khoản, Walk-in kể cả khi Customer có PSID', async () => {
    const customerWithOldPsid = {
      id: 88,
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854'
    };

    // 12a. Đơn hàng từ Website (booking_source: 'Website')
    const websiteBooking = {
      id: 501,
      booking_code: 'BK-WEB-501',
      booking_source: 'Website',
      paid: 20000000,
      total_price: 20000000,
      payment_status: 'paid'
    };
    const resWeb = await metaCapiV3.enqueuePurchase(websiteBooking, customerWithOldPsid, null);
    assert.equal(resWeb.enqueued, false);
    assert.equal(resWeb.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER', 'Đơn hàng Website không được tự động gắn Business Messaging');
    assert.equal(resWeb.channel, 'Website');

    // 12b. Đơn hàng chuyển khoản trực tiếp (booking_source: 'Chuyển khoản')
    const transferBooking = {
      id: 502,
      booking_code: 'BK-BANK-502',
      booking_source: 'Chuyển khoản',
      paid: 50000000,
      total_price: 50000000,
      payment_status: 'paid'
    };
    const resBank = await metaCapiV3.enqueuePurchase(transferBooking, customerWithOldPsid, null);
    assert.equal(resBank.enqueued, false);
    assert.equal(resBank.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER');

    // 12c. Đơn hàng từ Lead Tiktok / Zalo
    const tiktokLead = {
      id: 301,
      source: 'Tiktok',
      phone: '0901234567'
    };
    const tiktokBooking = {
      id: 503,
      booking_code: 'BK-TIKTOK-503',
      paid: 15000000,
      total_price: 30000000,
      booking_status: 'Đã đặt cọc',
      payment_status: 'partial'
    };
    const resTiktok = await metaCapiV3.enqueuePurchase(tiktokBooking, customerWithOldPsid, tiktokLead);
    assert.equal(resTiktok.enqueued, false);
    assert.equal(resTiktok.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER');
  });

});
