/**
 * Lead Auto-Resolution Service
 * 
 * Tự động đối soát và liên kết Khách hàng / Booking với Lead Marketing tương ứng:
 * 1. Khắc phục vấn đề Sales tạo Booking hoặc Khách hàng trực tiếp mà bỏ qua bước chuyển đổi Lead.
 * 2. Bảo toàn chuỗi Attribution cho Meta Conversions API (Purchase CAPI) và CRM Funnel.
 * 3. Áp dụng quy tắc Multi-level Waterfall nghiêm ngặt, chống gán nhầm khi có nhiều Lead trùng SĐT.
 * 4. Ghi nhận AMBIGUOUS_MATCH nếu không đủ bằng chứng tin cậy; tuyệt đối không gán tùy tiện.
 */

const db = require('../db');
const { logActivity } = require('../utils/logger');

/**
 * Chuẩn hóa số điện thoại cho mục đích matching
 * Trả về các biến thể để so khớp trong DB: E.164 (84...), Nội địa (0...), và 9 số cuối.
 */
function normalizePhoneForMatch(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/[^\d]/g, '');
  if (!digits || digits.length < 9 || digits.length > 15) return null;

  let e164 = digits;
  let domestic = digits;
  let suffix9 = digits.slice(-9);

  if (digits.startsWith('0')) {
    e164 = '84' + digits.substring(1);
    domestic = digits;
  } else if (digits.startsWith('84')) {
    e164 = digits;
    domestic = '0' + digits.substring(2);
  } else if (digits.length === 9) {
    e164 = '84' + digits;
    domestic = '0' + digits;
  }

  return {
    raw: phone,
    digits,
    e164,
    domestic,
    suffix9
  };
}

/**
 * Tìm các Lead ứng viên theo thứ tự ưu tiên nhận diện
 * 1. Số điện thoại (E.164, Nội địa 0..., suffix 9 số)
 * 2. Email chuẩn hóa (nếu không có hoặc không khớp SĐT)
 * 3. Facebook PSID (nếu có)
 */
async function findCandidateLeads({ phone = null, email = null, facebookPsid = null, runner = db }) {
  const normPhone = normalizePhoneForMatch(phone);

  // 1. Tìm theo Số điện thoại
  if (normPhone) {
    const query = `
      SELECT l.*
      FROM leads l
      WHERE l.phone IS NOT NULL 
        AND (
          regexp_replace(l.phone, '[^0-9]', '', 'g') = $1
          OR regexp_replace(l.phone, '[^0-9]', '', 'g') = $2
          OR (length(regexp_replace(l.phone, '[^0-9]', '', 'g')) >= 9 AND RIGHT(regexp_replace(l.phone, '[^0-9]', '', 'g'), 9) = $3)
        )
      ORDER BY l.created_at DESC;
    `;
    const res = await runner.query(query, [normPhone.domestic, normPhone.e164, normPhone.suffix9]);
    if (res.rows.length > 0) {
      return { matchKey: 'phone', candidates: res.rows };
    }
  }

  // 2. Tìm theo Email
  if (email && String(email).includes('@') && String(email).length >= 6) {
    const cleanEmail = String(email).trim().toLowerCase();
    const query = `
      SELECT l.*
      FROM leads l
      WHERE l.email IS NOT NULL AND lower(trim(l.email)) = $1
      ORDER BY l.created_at DESC;
    `;
    const res = await runner.query(query, [cleanEmail]);
    if (res.rows.length > 0) {
      return { matchKey: 'email', candidates: res.rows };
    }
  }

  // 3. Tìm theo Facebook PSID
  if (facebookPsid && String(facebookPsid).trim()) {
    const cleanPsid = String(facebookPsid).trim();
    const query = `
      SELECT l.*
      FROM leads l
      WHERE l.facebook_psid IS NOT NULL AND l.facebook_psid = $1
      ORDER BY l.created_at DESC;
    `;
    const res = await runner.query(query, [cleanPsid]);
    if (res.rows.length > 0) {
      return { matchKey: 'facebook_psid', candidates: res.rows };
    }
  }

  return { matchKey: null, candidates: [] };
}

/**
 * Trọng tài lựa chọn Lead tối ưu theo quy chuẩn nghiệp vụ
 * Tuân thủ nguyên tắc:
 * - Không cướp Lead của Customer khác (loại trừ lead.customer_id != customer.id)
 * - Ưu tiên Lead cùng Tour
 * - Phân xử thời gian tương tác gần nhất
 * - Báo AMBIGUOUS_MATCH nếu không đủ bằng chứng phân biệt, không gán tùy tiện
 */
async function resolveBestCandidate({ candidates, customer = null, booking = null, runner = db }) {
  if (!candidates || candidates.length === 0) {
    return { resolved: false, reason: 'NO_CANDIDATE' };
  }

  const customerId = customer ? customer.id : null;

  // Lọc 1: Loại bỏ những Lead đã gắn cứng với một Customer khác hợp lệ (tránh xung đột dữ liệu)
  const viableCandidates = candidates.filter(lead => {
    if (!lead.customer_id) return true;
    if (customerId && Number(lead.customer_id) === Number(customerId)) return true;
    return false; // Đã gắn với customer khác -> loại trừ
  });

  if (viableCandidates.length === 0) {
    return { resolved: false, reason: 'ALL_CANDIDATES_BOUND_TO_OTHER_CUSTOMERS' };
  }

  // Trường hợp lý tưởng: Chỉ có duy nhất 1 ứng viên hợp lệ
  if (viableCandidates.length === 1) {
    return {
      resolved: true,
      lead: viableCandidates[0],
      matchType: 'EXACT_UNIQUE'
    };
  }

  // Nếu có nhiều ứng viên (> 1): Thực thi các tầng trọng tài

  // Trọng tài 1: Đã từng có quan hệ với chính Customer này từ trước
  if (customerId) {
    const existingBound = viableCandidates.filter(l => Number(l.customer_id) === Number(customerId));
    if (existingBound.length === 1) {
      return {
        resolved: true,
        lead: existingBound[0],
        matchType: 'PREVIOUS_CUSTOMER_BOUND'
      };
    }
  }

  // Xác định Tour mục tiêu từ Booking (nếu có)
  let targetTourId = booking ? (booking.tour_id || null) : null;
  if (!targetTourId && booking && booking.tour_departure_id) {
    try {
      const depRes = await runner.query('SELECT tour_template_id FROM tour_departures WHERE id = $1', [booking.tour_departure_id]);
      if (depRes.rows.length > 0) {
        targetTourId = depRes.rows[0].tour_template_id;
      }
    } catch (_) {}
  }

  // Trọng tài 2: Khớp chính xác Tour quan tâm (Tour matching)
  if (targetTourId) {
    const tourMatchedCandidates = viableCandidates.filter(l => Number(l.tour_id) === Number(targetTourId));
    if (tourMatchedCandidates.length === 1) {
      return {
        resolved: true,
        lead: tourMatchedCandidates[0],
        matchType: 'TOUR_EXACT_MATCH'
      };
    }

    if (tourMatchedCandidates.length > 1) {
      // Trong các lead cùng Tour, kiểm tra khoảng cách thời gian (recency)
      const activeTourLeads = tourMatchedCandidates.filter(l => l.status !== 'Thất bại');
      if (activeTourLeads.length === 1) {
        return {
          resolved: true,
          lead: activeTourLeads[0],
          matchType: 'TOUR_ACTIVE_RECENCY_MATCH'
        };
      }
      // Vẫn còn nhiều lead cùng tour đang mở -> Mơ hồ, không gán ẩu
      return {
        resolved: false,
        reason: 'AMBIGUOUS_MATCH',
        candidateIds: tourMatchedCandidates.map(c => c.id),
        detail: `Nhiều Lead cùng quan tâm Tour #${targetTourId}`
      };
    }
  }

  // Trọng tài 3: Không khớp Tour hoặc không có Tour -> Xét trạng thái và khoảng cách thời gian
  // Loại trừ các Lead đã 'Thất bại' hoặc 'Không có nhu cầu'
  const activeCandidates = viableCandidates.filter(l => {
    const statusStr = String(l.status || '').toLowerCase();
    const classStr = String(l.classification || '').toLowerCase();
    return !statusStr.includes('thất bại') && !classStr.includes('không có nhu cầu');
  });

  if (activeCandidates.length === 1) {
    // Kiểm tra Lead này có được tạo trong vòng 60 ngày gần đây không
    const leadTime = new Date(activeCandidates[0].created_at).getTime();
    const refTime = booking ? new Date(booking.created_at).getTime() : Date.now();
    const diffDays = Math.abs(refTime - leadTime) / (1000 * 60 * 60 * 24);

    if (diffDays <= 60) {
      return {
        resolved: true,
        lead: activeCandidates[0],
        matchType: 'RECENT_ACTIVE_MATCH'
      };
    }
  }

  // Nếu vẫn còn từ 2 Lead trở lên hoặc không có căn cứ rõ ràng -> Báo AMBIGUOUS_MATCH
  return {
    resolved: false,
    reason: 'AMBIGUOUS_MATCH',
    candidateIds: viableCandidates.map(c => c.id),
    detail: `Phát hiện ${viableCandidates.length} Lead trùng định danh nhưng không đủ cơ sở phân định chắc chắn`
  };
}

/**
 * Hàm thực thi toàn diện: Đối soát và tự động gắn kết (Auto-link)
 * Được gọi khi:
 * - Tạo Customer từ Booking
 * - Tạo/Cập nhật Booking
 * - Chuẩn bị gửi sự kiện Purchase CAPI
 * 
 * RÀNG BUỘC NGHIỆP VỤ:
 * - isPaid = false: Chỉ liên kết đối soát, KHÔNG tự đánh dấu Lead là 'Chốt đơn'.
 * - isPaid = true: Tự động cập nhật Lead: status='Chốt đơn', won_at=NOW(), is_sales_qualified=TRUE.
 * - Không ghi đè nếu customer.lead_id đã có liên kết hợp lệ.
 */
async function resolveAndLinkLead({
  customerId = null,
  customer = null,
  booking = null,
  isPaid = false,
  client = null
}) {
  const runner = client || db;

  // 1. Nạp Customer nếu chỉ có customerId
  let targetCustomer = customer;
  if (!targetCustomer && customerId) {
    const cRes = await runner.query('SELECT * FROM customers WHERE id = $1', [customerId]);
    if (cRes.rows.length > 0) targetCustomer = cRes.rows[0];
  }

  // 2. Nếu Customer đã có lead_id hợp lệ sẵn từ trước -> Tôn trọng liên kết đã lưu
  if (targetCustomer && targetCustomer.lead_id) {
    const existingLeadRes = await runner.query('SELECT * FROM leads WHERE id = $1', [targetCustomer.lead_id]);
    if (existingLeadRes.rows.length > 0) {
      const existingLead = existingLeadRes.rows[0];

      // Nếu có thanh toán thực tế hợp lệ và Lead chưa chốt -> Đồng bộ Won
      if (isPaid && existingLead.status !== 'Chốt đơn') {
        await runner.query(`
          UPDATE leads 
          SET status = 'Chốt đơn',
              won_at = COALESCE(won_at, NOW()),
              is_sales_qualified = TRUE,
              sales_qualified_at = COALESCE(sales_qualified_at, NOW()),
              customer_id = COALESCE(customer_id, $1),
              updated_at = NOW()
          WHERE id = $2
        `, [targetCustomer.id, existingLead.id]);
        existingLead.status = 'Chốt đơn';
        existingLead.is_sales_qualified = true;
      }

      return {
        resolved: true,
        lead: existingLead,
        matchType: 'EXISTING_LINK'
      };
    }
  }

  // 3. Thu thập định danh từ Customer hoặc Booking
  const phone = (targetCustomer && targetCustomer.phone) || (booking && booking.customer_phone) || null;
  const email = (targetCustomer && targetCustomer.email) || (booking && booking.customer_email) || null;
  const psid = (targetCustomer && targetCustomer.facebook_psid) || null;

  if (!phone && !email && !psid) {
    return { resolved: false, reason: 'NO_IDENTIFIERS_PROVIDED' };
  }

  // 4. Tìm các ứng viên Lead
  const { matchKey, candidates } = await findCandidateLeads({ phone, email, facebookPsid: psid, runner });
  if (candidates.length === 0) {
    return { resolved: false, reason: 'NO_MATCHING_LEADS_FOUND' };
  }

  // 5. Phân xử trọng tài chọn Lead tốt nhất
  const decision = await resolveBestCandidate({
    candidates,
    customer: targetCustomer,
    booking,
    runner
  });

  if (!decision.resolved) {
    if (decision.reason === 'AMBIGUOUS_MATCH' && targetCustomer) {
      // Ghi nhận log cảnh báo AMBIGUOUS_MATCH để hậu kiểm, không gán ẩu
      logActivity({
        user_id: null,
        action_type: 'AMBIGUOUS_MATCH',
        entity_type: 'CUSTOMER',
        entity_id: String(targetCustomer.id),
        details: `Cảnh báo đối soát Lead: ${decision.detail} (Ứng viên: [${decision.candidateIds.join(', ')}])`,
        new_data: {
          customer_id: targetCustomer.id,
          candidate_lead_ids: decision.candidateIds,
          booking_id: booking ? booking.id : null
        }
      }).catch(() => {});
    }
    return decision;
  }

  const selectedLead = decision.lead;

  // 6. Tự động liên kết hai chiều vào Database (Atomic & Safe)
  try {
    if (targetCustomer && targetCustomer.id) {
      // Gắn lead_id cho customer (nếu đang null)
      await runner.query(`
        UPDATE customers 
        SET lead_id = $1 
        WHERE id = $2 AND lead_id IS NULL;
      `, [selectedLead.id, targetCustomer.id]);

      // Gắn customer_id cho lead (nếu đang null hoặc chính customer này)
      await runner.query(`
        UPDATE leads 
        SET customer_id = $1 
        WHERE id = $2 AND (customer_id IS NULL OR customer_id = $1);
      `, [targetCustomer.id, selectedLead.id]);
    }

    // 7. Đồng bộ trạng thái nghiệp vụ khi Booking có thanh toán thực tế hợp lệ
    if (isPaid) {
      await runner.query(`
        UPDATE leads 
        SET status = 'Chốt đơn',
            won_at = COALESCE(won_at, NOW()),
            is_sales_qualified = TRUE,
            sales_qualified_at = COALESCE(sales_qualified_at, NOW()),
            updated_at = NOW()
        WHERE id = $1 AND status != 'Chốt đơn';
      `, [selectedLead.id]);

      selectedLead.status = 'Chốt đơn';
      selectedLead.is_sales_qualified = true;
    }

    // Ghi nhật ký hệ thống
    if (targetCustomer) {
      logActivity({
        user_id: null,
        action_type: 'AUTO_RESOLVE_LEAD',
        entity_type: 'CUSTOMER',
        entity_id: String(targetCustomer.id),
        details: `Tự động liên kết Lead #${selectedLead.id} cho Khách hàng #${targetCustomer.id} (Cơ chế: ${decision.matchType}, IsPaid: ${isPaid})`,
        new_data: {
          customer_id: targetCustomer.id,
          lead_id: selectedLead.id,
          match_type: decision.matchType,
          booking_id: booking ? booking.id : null,
          is_paid: isPaid
        }
      }).catch(() => {});
    }

    console.log(`[LeadAutoResolution] ✅ Đã kết nối Lead #${selectedLead.id} với Customer #${targetCustomer?.id || 'N/A'} (Match: ${decision.matchType}, Paid: ${isPaid})`);

    return {
      resolved: true,
      lead: selectedLead,
      matchType: decision.matchType,
      linkedCustomerId: targetCustomer?.id || null
    };

  } catch (err) {
    console.error(`[LeadAutoResolution] Lỗi liên kết Lead #${selectedLead.id}:`, err.message);
    throw err;
  }
}

module.exports = {
  normalizePhoneForMatch,
  findCandidateLeads,
  resolveBestCandidate,
  resolveAndLinkLead
};
