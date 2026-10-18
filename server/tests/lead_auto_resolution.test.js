/**
 * Unit & Integration Tests: Lead Auto-Resolution Service
 * 
 * Kiểm thử toàn diện cơ chế ghép nối tự động giữa Customer/Booking và Marketing Lead:
 * 1. Chuẩn hóa số điện thoại đa định dạng (E.164, Nội địa, Suffix 9 số)
 * 2. Ưu tiên liên kết đã tồn tại (không ghi đè trái phép)
 * 3. Trọng tài phân giải đa tầng: Duy nhất, Đã gắn, Khớp Tour, Thời gian tương tác
 * 4. Nhận diện trường hợp mơ hồ (AMBIGUOUS_MATCH) - không gán tùy tiện
 * 5. Đồng bộ trạng thái Chốt đơn chỉ khi isPaid = true
 * 6. Tích hợp trơn tru với Meta CAPI Purchase
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const leadAutoResolution = require('../services/leadAutoResolutionService');
const metaCapiCrm = require('../services/metaCapiCrmService');

test('Lead Auto-Resolution - Multi-level Matching & Attribution Tests', async (t) => {

  await t.test('1. Chuẩn hóa Số điện thoại: E.164, 0... và Suffix 9 số', () => {
    const res1 = leadAutoResolution.normalizePhoneForMatch('0901 234 567');
    assert.equal(res1.e164, '84901234567');
    assert.equal(res1.domestic, '0901234567');
    assert.equal(res1.suffix9, '901234567');

    const res2 = leadAutoResolution.normalizePhoneForMatch('+84 982.901.592');
    assert.equal(res2.e164, '84982901592');
    assert.equal(res2.domestic, '0982901592');
    assert.equal(res2.suffix9, '982901592');

    const res3 = leadAutoResolution.normalizePhoneForMatch('912345678'); // 9 digits
    assert.equal(res3.e164, '84912345678');
    assert.equal(res3.domestic, '0912345678');

    assert.equal(leadAutoResolution.normalizePhoneForMatch('123'), null);
    assert.equal(leadAutoResolution.normalizePhoneForMatch(''), null);
    assert.equal(leadAutoResolution.normalizePhoneForMatch(null), null);
  });

  await t.test('2. Duy nhất 1 ứng viên: Ghép chính xác EXACT_UNIQUE', async () => {
    const candidates = [
      { id: 101, phone: '0901234567', name: 'Khách A', tour_id: 180, status: 'Mới', customer_id: null }
    ];

    const decision = await leadAutoResolution.resolveBestCandidate({
      candidates,
      customer: { id: 50, phone: '0901234567' },
      booking: { id: 70, tour_id: 180 }
    });

    assert.equal(decision.resolved, true);
    assert.equal(decision.matchType, 'EXACT_UNIQUE');
    assert.equal(decision.lead.id, 101);
  });

  await t.test('3. Loại trừ Lead đã gắn cứng với Customer khác: Không cướp Lead', async () => {
    const candidates = [
      { id: 101, phone: '0901234567', customer_id: 999 }, // Đã thuộc về customer 999
      { id: 102, phone: '0901234567', customer_id: null } // Lead mở chưa có customer
    ];

    const decision = await leadAutoResolution.resolveBestCandidate({
      candidates,
      customer: { id: 50, phone: '0901234567' },
      booking: { id: 70 }
    });

    assert.equal(decision.resolved, true);
    assert.equal(decision.matchType, 'EXACT_UNIQUE');
    assert.equal(decision.lead.id, 102); // Chọn 102, bỏ 101
  });

  await t.test('4. Ưu tiên Lead đã gắn với chính Customer này từ trước: PREVIOUS_CUSTOMER_BOUND', async () => {
    const candidates = [
      { id: 101, phone: '0901234567', customer_id: 50 },  // Đã từng gắn với customer 50
      { id: 102, phone: '0901234567', customer_id: null } // Lead mới
    ];

    const decision = await leadAutoResolution.resolveBestCandidate({
      candidates,
      customer: { id: 50, phone: '0901234567' },
      booking: { id: 70 }
    });

    assert.equal(decision.resolved, true);
    assert.equal(decision.matchType, 'PREVIOUS_CUSTOMER_BOUND');
    assert.equal(decision.lead.id, 101);
  });

  await t.test('5. Nhiều Lead trùng SĐT: Trọng tài theo Tour mục tiêu (TOUR_EXACT_MATCH)', async () => {
    const candidates = [
      { id: 201, phone: '0901234567', tour_id: 180, status: 'Đang liên hệ', customer_id: null }, // Tour Thượng Hải
      { id: 202, phone: '0901234567', tour_id: 290, status: 'Đang liên hệ', customer_id: null }  // Tour Mông Cổ
    ];

    // Booking đặt Tour Thượng Hải (180)
    const decision = await leadAutoResolution.resolveBestCandidate({
      candidates,
      customer: { id: 50, phone: '0901234567' },
      booking: { id: 80, tour_id: 180 }
    });

    assert.equal(decision.resolved, true);
    assert.equal(decision.matchType, 'TOUR_EXACT_MATCH');
    assert.equal(decision.lead.id, 201);
  });

  await t.test('6. Nhiều Lead nhưng chỉ 1 Lead còn Hoạt động gần đây: RECENT_ACTIVE_MATCH', async () => {
    const now = new Date();
    const candidates = [
      { id: 301, phone: '0901234567', status: 'Thất bại', classification: 'Không có nhu cầu', created_at: new Date(now - 120 * 86400000) },
      { id: 302, phone: '0901234567', status: 'Đang liên hệ', classification: 'Mới', created_at: new Date(now - 10 * 86400000) }
    ];

    const decision = await leadAutoResolution.resolveBestCandidate({
      candidates,
      customer: { id: 50, phone: '0901234567' },
      booking: { id: 90, created_at: now }
    });

    assert.equal(decision.resolved, true);
    assert.equal(decision.matchType, 'RECENT_ACTIVE_MATCH');
    assert.equal(decision.lead.id, 302);
  });

  await t.test('7. Trường hợp Mơ hồ (AMBIGUOUS_MATCH): Tuyệt đối KHÔNG gán tùy tiện', async () => {
    const now = new Date();
    const candidates = [
      { id: 401, phone: '0901234567', tour_id: 180, status: 'Đang liên hệ', created_at: new Date(now - 5 * 86400000) },
      { id: 402, phone: '0901234567', tour_id: 290, status: 'Đang liên hệ', created_at: new Date(now - 3 * 86400000) }
    ];

    // Booking không rõ tour_id (hoặc tour khác hoàn toàn 350)
    const decision = await leadAutoResolution.resolveBestCandidate({
      candidates,
      customer: { id: 50, phone: '0901234567' },
      booking: { id: 95, tour_id: 350, created_at: now }
    });

    assert.equal(decision.resolved, false);
    assert.equal(decision.reason, 'AMBIGUOUS_MATCH');
    assert.deepEqual(decision.candidateIds, [401, 402]);
  });

  await t.test('8. Tôn trọng liên kết đã lưu (EXISTING_LINK): Không ghi đè', async () => {
    // Mock DB runner
    const mockRunner = {
      query: async (sql, params) => {
        if (sql.includes('SELECT * FROM leads WHERE id = $1')) {
          return { rows: [{ id: 888, name: 'Khách Cũ', status: 'Đang liên hệ' }] };
        }
        return { rows: [] };
      }
    };

    const decision = await leadAutoResolution.resolveAndLinkLead({
      customer: { id: 50, lead_id: 888, phone: '0901234567' },
      booking: { id: 100 },
      isPaid: false,
      client: mockRunner
    });

    assert.equal(decision.resolved, true);
    assert.equal(decision.matchType, 'EXISTING_LINK');
    assert.equal(decision.lead.id, 888);
  });

  await t.test('9. Nghiệp vụ: Chưa thanh toán (isPaid=false) -> KHÔNG đổi status Lead sang Chốt đơn', async () => {
    let leadStatusUpdated = false;
    const mockRunner = {
      query: async (sql, params) => {
        if (sql.includes('FROM leads l')) {
          return { rows: [{ id: 555, phone: '0901234567', status: 'Mới', customer_id: null }] };
        }
        if (sql.includes('UPDATE customers SET lead_id')) {
          return { rows: [] };
        }
        if (sql.includes('UPDATE leads SET customer_id')) {
          return { rows: [] };
        }
        if (sql.includes("status = 'Chốt đơn'")) {
          leadStatusUpdated = true;
          return { rows: [] };
        }
        return { rows: [] };
      }
    };

    const res = await leadAutoResolution.resolveAndLinkLead({
      customer: { id: 50, phone: '0901234567' },
      booking: { id: 101, paid: 0 },
      isPaid: false, // CHƯA THANH TOÁN
      client: mockRunner
    });

    assert.equal(res.resolved, true);
    assert.equal(res.lead.id, 555);
    assert.equal(leadStatusUpdated, false, 'Khi isPaid=false, tuyệt đối không được tự động cập nhật Chốt đơn!');
  });

  await t.test('10. Nghiệp vụ: Đã thanh toán (isPaid=true) -> Tự động đồng bộ status Lead sang Chốt đơn & Qualified', async () => {
    let leadWonUpdated = false;
    const mockRunner = {
      query: async (sql, params) => {
        if (sql.includes('FROM leads l')) {
          return { rows: [{ id: 777, phone: '0901234567', status: 'Đang liên hệ', customer_id: null }] };
        }
        if (sql.includes('UPDATE customers SET lead_id')) {
          return { rows: [] };
        }
        if (sql.includes('UPDATE leads SET customer_id')) {
          return { rows: [] };
        }
        if (sql.includes("status = 'Chốt đơn'")) {
          leadWonUpdated = true;
          return { rows: [] };
        }
        return { rows: [] };
      }
    };

    const res = await leadAutoResolution.resolveAndLinkLead({
      customer: { id: 60, phone: '0901234567' },
      booking: { id: 102, paid: 15000000 },
      isPaid: true, // ĐÃ THANH TOÁN THẬT
      client: mockRunner
    });

    assert.equal(res.resolved, true);
    assert.equal(res.lead.id, 777);
    assert.equal(leadWonUpdated, true, 'Khi isPaid=true, hệ thống phải tự động đồng bộ status=Chốt đơn và is_sales_qualified=true!');
    assert.equal(res.lead.status, 'Chốt đơn');
    assert.equal(res.lead.is_sales_qualified, true);
  });

});
