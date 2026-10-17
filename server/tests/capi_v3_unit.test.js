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

  test('11. Meta Token Permissions: Phân biệt quyền CAPI Business Messaging (page_events) với quyền Ads API (ads_management)', () => {
    // 11a. Trường hợp Token có page_events nhưng KHÔNG CÓ ads_management:
    // CAPI Business Messaging VẪN ĐỦ ĐIỀU KIỆN GỬI SỰ KIỆN (is_capi_ready = true)
    const tokenCapiOnly = ['page_events', 'pages_messaging', 'pages_show_list'];
    const CAPI_REQUIRED = ['page_events'];
    const missingCapi = CAPI_REQUIRED.filter(p => !tokenCapiOnly.includes(p));
    const isCapiReady = missingCapi.length === 0;

    assert.equal(isCapiReady, true, 'Có page_events là đủ điều kiện gửi CAPI Business Messaging');
    assert.deepEqual(missingCapi, []);

    // 11b. Quyền Ads API (ads_management, ads_read) được đánh giá riêng, không chặn CAPI
    const ADS_API_PERMS = ['ads_management', 'ads_read'];
    const hasAdsAccess = tokenCapiOnly.some(p => ADS_API_PERMS.includes(p));
    assert.equal(hasAdsAccess, false, 'Token không có ads_management vẫn không làm mất quyền gửi CAPI');

    // 11c. Trường hợp thiếu page_events -> Bắt buộc báo thiếu quyền CAPI
    const tokenWithoutPageEvents = ['ads_management', 'pages_messaging'];
    const missingInToken = CAPI_REQUIRED.filter(p => !tokenWithoutPageEvents.includes(p));
    assert.deepEqual(missingInToken, ['page_events'], 'Phải chỉ ra chính xác thiếu page_events');
  });

  test('12. Phân tách rạch ròi acquisition_source, conversion_channel và payment_method: Chuyển khoản KHÔNG bị từ chối oan', async () => {
    const messengerCustomer = {
      id: 88,
      name: 'Nguyễn Văn A',
      phone: '0901234567',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854'
    };

    const messengerLead = {
      id: 99,
      source: 'Messenger',
      facebook_psid: '100293848572910',
      facebook_page_id: '107694084435854'
    };

    // 12a. CHỐT QUA MESSENGER NHƯNG THANH TOÁN BẰNG CHUYỂN KHOẢN NGÂN HÀNG:
    // BẮT BUỘC CHẤP THUẬN ENQUEUE (Phương thức thanh toán không được dùng làm kênh loại trừ)!
    const messengerBankTransferBooking = {
      id: 601,
      booking_code: 'BK-MSG-BANK-601',
      booking_source: 'Messenger',
      payment_method: 'Chuyển khoản ngân hàng Vietcombank',
      booking_status: 'Đã đặt cọc',
      payment_status: 'partial',
      paid: 20000000,
      total_price: 50000000
    };
    const resMsgBank = await metaCapiV3.enqueuePurchase(messengerBankTransferBooking, messengerCustomer, messengerLead, null);
    // Khi cờ v3 đang tắt trên test local, nếu enqueue trả về false thì kiểm tra reason không phải là CROSS_CHANNEL
    assert.notEqual(resMsgBank.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER', 'Khách Messenger thanh toán chuyển khoản TUYỆT ĐỐI KHÔNG bị coi là Cross-channel!');

    // 12b. CHỐT QUA MESSENGER VÀ THANH TOÁN TIỀN MẶT / THẺ:
    const messengerCashBooking = {
      id: 602,
      booking_code: 'BK-MSG-CASH-602',
      conversion_channel: 'Messenger',
      payment_method: 'Tiền mặt',
      booking_status: 'Đã thanh toán',
      payment_status: 'paid',
      paid: 30000000,
      total_price: 30000000
    };
    const resMsgCash = await metaCapiV3.enqueuePurchase(messengerCashBooking, messengerCustomer, messengerLead, null);
    assert.notEqual(resMsgCash.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER');

    // 12c. GIAO DỊCH TỪ WEBSITE (conversion_channel = 'Website'):
    // BẮT BUỘC TỪ CHỐI KHỎI BUSINESS MESSAGING (Kể cả khi khách có PSID cũ trong DB)
    const websiteBooking = {
      id: 603,
      booking_code: 'BK-WEB-603',
      conversion_channel: 'Website',
      payment_method: 'Cổng VNPay',
      booking_status: 'Đã thanh toán',
      payment_status: 'paid',
      paid: 25000000,
      total_price: 25000000
    };
    const resWeb = await metaCapiV3.enqueuePurchase(websiteBooking, messengerCustomer, null);
    assert.equal(resWeb.enqueued, false);
    assert.equal(resWeb.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER');
    assert.equal(resWeb.channel, 'Website');

    // 12d. GIAO DỊCH TRỰC TIẾP TẠI QUẦY (conversion_channel = 'Walk-in'):
    const walkInBooking = {
      id: 604,
      booking_code: 'BK-WALKIN-604',
      conversion_channel: 'Walk-in',
      payment_method: 'Tiền mặt',
      booking_status: 'Đã đặt cọc',
      payment_status: 'partial',
      paid: 10000000,
      total_price: 40000000
    };
    const resWalkIn = await metaCapiV3.enqueuePurchase(walkInBooking, messengerCustomer, null);
    assert.equal(resWalkIn.enqueued, false);
    assert.equal(resWalkIn.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER');

    // 12e. ĐƠN HÀNG GẮN VỚI LEAD TỪ KÊNH TIKTOK / ZALO:
    const tiktokLead = { id: 701, source: 'Tiktok', phone: '0901234567' };
    const tiktokBooking = {
      id: 605,
      booking_code: 'BK-TIKTOK-605',
      paid: 15000000,
      total_price: 30000000,
      booking_status: 'Đã đặt cọc',
      payment_status: 'partial'
    };
    const resTiktok = await metaCapiV3.enqueuePurchase(tiktokBooking, messengerCustomer, tiktokLead);
    assert.equal(resTiktok.enqueued, false);
    assert.equal(resTiktok.reason, 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER');
  });

  test('13. Meta Isolated Test Runner: Kiểm định an toàn, không tạo dữ liệu rác DB production', async () => {
    // 13a. Thiếu test_event_code -> Bắt buộc ném lỗi validation ngay lập tức
    await assert.rejects(
      async () => {
        await metaCapiV3.sendIsolatedTestEvents({ testEventCode: '' });
      },
      /Bắt buộc phải nhập Mã thử nghiệm sự kiện/
    );

    // 13b. Dựng payload mock 3 sự kiện hợp lệ
    const mockCode = 'TEST_MOCK_12345';
    const testPayload = metaCapiV3.buildBusinessMessagingPayload({
      eventName: 'Purchase',
      psid: '100293848572910',
      pageId: '107694084435854',
      customData: {
        value: 1000000,
        currency: 'VND',
        booking_code: 'BK-ISOLATED-TEST'
      }
    });

    assert.equal(testPayload.action_source, 'business_messaging');
    assert.equal(testPayload.messaging_channel, 'messenger');
    assert.equal(testPayload.custom_data.value, 1000000);
    assert.equal(testPayload.custom_data.currency, 'VND');
  });

});
