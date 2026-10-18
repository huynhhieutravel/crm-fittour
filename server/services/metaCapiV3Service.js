/**
 * Meta Conversions API (CAPI) for Business Messaging v3
 * 
 * Kiến trúc chuẩn hoá cho Click-to-Messenger Ads:
 * - action_source: "business_messaging"
 * - messaging_channel: "messenger"
 * - Cặp định danh bắt buộc: page_scoped_user_id (PSID thô, KHÔNG HASH) và page_id (Page ID thô, KHÔNG HASH)
 * - Tên sự kiện chuẩn: LeadSubmitted, QualifiedLead, Purchase
 * - Idempotency & Deduplication: event_id ổn định theo business entity, KHÔNG dùng Date.now() hay lộ PSID
 * - Outbox Engine: Transaction-safe enqueue, UNIQUE constraint ở DB, Worker lock (SKIP LOCKED), exponential backoff retry
 * - Feature Flag: meta_capi_business_messaging_v3_enabled (Mặc định tắt, độc lập với CAPI v2)
 */

const axios = require('axios');
const crypto = require('crypto');
const db = require('../db');

const META_GRAPH_VERSION = 'v26.0';

// Known dataset IDs to prevent accidental hallucination/misassignment
const KNOWN_DATASET_IDS = new Set(['1573748827119102', '25418355247839825', '835404925628132']);

/**
 * SHA-256 helper cho PII (Phone, Email)
 */
function sha256(val) {
  if (!val || typeof val !== 'string') return null;
  const clean = val.trim().toLowerCase();
  if (!clean) return null;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

/**
 * Chuẩn hóa số điện thoại theo chuẩn quốc tế E.164 không có dấu +
 * Ví dụ: 0901234567 -> 84901234567
 */
function normalizePhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  let phone = rawPhone.replace(/[\s\-\.\(\)\+]/g, '');
  if (!phone) return null;
  if (phone.startsWith('0')) {
    phone = '84' + phone.substring(1);
  }
  return phone;
}

/**
 * Lấy cài đặt hệ thống từ DB
 */
async function getSetting(key) {
  try {
    const res = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows.length > 0 ? res.rows[0].value : null;
  } catch (err) {
    console.error(`[CAPI-v3] Lỗi đọc cấu hình ${key}:`, err.message);
    return null;
  }
}

/**
 * Kiểm tra xem ID có bị nhầm thành Dataset ID không
 */
function isInvalidIdentifier(id) {
  if (!id) return true;
  const strId = String(id).trim();
  return KNOWN_DATASET_IDS.has(strId);
}

/**
 * Xây dựng payload chuẩn Meta Conversions API for Business Messaging v26.0
 */
function buildBusinessMessagingPayload({
  eventName,
  psid,
  pageId,
  phone = null,
  email = null,
  customData = {},
  eventTime = null,
  eventId = null
}) {
  // 1. Kiểm định cặp định danh bắt buộc của Business Messaging
  if (!psid || isInvalidIdentifier(psid)) {
    throw new Error(`PSID không hợp lệ hoặc bị nhầm với Dataset ID: ${psid}`);
  }
  if (!pageId || isInvalidIdentifier(pageId)) {
    throw new Error(`Page ID không hợp lệ hoặc bị nhầm với Dataset ID: ${pageId}`);
  }

  // 2. Chuẩn hoá thời gian sự kiện (Timestamp thực tế, không hardcode)
  const timestamp = eventTime instanceof Date 
    ? Math.floor(eventTime.getTime() / 1000)
    : (typeof eventTime === 'number' ? Math.floor(eventTime) : Math.floor(Date.now() / 1000));

  // 3. User Data: Giữ nguyên PSID và Page ID thô theo yêu cầu của Business Messaging
  const user_data = {
    page_scoped_user_id: String(psid).trim(),
    page_id: String(pageId).trim()
  };

  // Bổ sung Phone và Email nếu có (đã hash SHA-256)
  const normPhone = normalizePhone(phone);
  if (normPhone) {
    user_data.ph = [sha256(normPhone)];
  }
  if (email && typeof email === 'string' && email.trim()) {
    user_data.em = [sha256(email)];
  }

  // 4. Custom Data
  const cleanCustomData = {
    event_source: 'crm',
    lead_event_source: 'FIT Tour CRM Business Messaging v3',
    ...customData
  };

  // 5. Event Object
  return {
    event_name: eventName,
    event_time: timestamp,
    event_id: eventId,
    action_source: 'business_messaging',
    messaging_channel: 'messenger',
    user_data,
    custom_data: cleanCustomData
  };
}

/**
 * Đưa sự kiện vào bảng outbox meta_capi_events (Transaction-safe)
 */
async function enqueueEvent({
  eventName,
  businessEntityType,
  businessEntityId,
  pageId,
  psid,
  phone = null,
  email = null,
  customData = {},
  eventTime = new Date(),
  client = null,
  forceEnqueue = false
}) {
  const runner = client || db;

  // 0. Kiểm tra feature flag: Nếu tắt (false) và không ép buộc (forceEnqueue = false), KHÔNG ghi vào outbox để tránh tạo backlog
  const isV3Enabled = await getSetting('meta_capi_business_messaging_v3_enabled');
  if (isV3Enabled !== 'true' && !forceEnqueue) {
    console.log(`[CAPI-v3] Feature flag meta_capi_business_messaging_v3_enabled đang TẮT. Bỏ qua enqueue ${eventName} cho ${businessEntityType} #${businessEntityId} (Không tạo backlog).`);
    return { enqueued: false, reason: 'FEATURE_FLAG_DISABLED' };
  }

  // 1. Kiểm tra cặp định danh
  if (!pageId || isInvalidIdentifier(pageId)) {
    console.warn(`[CAPI-v3] Bỏ qua enqueue ${eventName} cho ${businessEntityType} #${businessEntityId}: Thiếu Page ID hợp lệ hoặc bị nhầm Dataset ID.`);
    return { enqueued: false, reason: 'MISSING_OR_INVALID_PAGE_ID' };
  }
  if (!psid || isInvalidIdentifier(psid)) {
    console.warn(`[CAPI-v3] Bỏ qua enqueue ${eventName} cho ${businessEntityType} #${businessEntityId}: Thiếu PSID hợp lệ.`);
    return { enqueued: false, reason: 'MISSING_OR_INVALID_PSID' };
  }

  // 2. Tạo event_id ổn định, không dùng Date.now() và không lộ raw PSID
  let eventCode = 'evt';
  if (eventName === 'LeadSubmitted') eventCode = 'sub';
  else if (eventName === 'QualifiedLead') eventCode = 'qual';
  else if (eventName === 'Purchase') eventCode = 'pur';

  const eventId = `fittour_bm_${eventCode}_${businessEntityType}_${businessEntityId}`;
  const idempotencyKey = `idemp_${eventName}_${businessEntityType}_${businessEntityId}`;
  const psidHash = sha256(String(psid));

  // 3. Xây dựng payload
  const payload = buildBusinessMessagingPayload({
    eventName,
    psid,
    pageId,
    phone,
    email,
    customData,
    eventTime,
    eventId
  });

  // 4. Lưu vào bảng meta_capi_events với cơ chế khử trùng DB UNIQUE
  try {
    const insertQuery = `
      INSERT INTO meta_capi_events (
        event_id,
        event_name,
        action_source,
        messaging_channel,
        business_entity_type,
        business_entity_id,
        idempotency_key,
        page_id,
        psid_hash,
        payload,
        status,
        created_at,
        updated_at
      ) VALUES ($1, $2, 'business_messaging', 'messenger', $3, $4, $5, $6, $7, $8, 'PENDING', NOW(), NOW())
      ON CONFLICT (event_name, business_entity_type, business_entity_id) DO NOTHING
      RETURNING id, event_id, status;
    `;

    const res = await runner.query(insertQuery, [
      eventId,
      eventName,
      businessEntityType,
      businessEntityId,
      idempotencyKey,
      String(pageId),
      psidHash,
      JSON.stringify(payload)
    ]);

    if (res.rows.length === 0) {
      console.log(`[CAPI-v3] Sự kiện ${eventName} cho ${businessEntityType} #${businessEntityId} đã tồn tại trong outbox (Chống trùng lặp thành công).`);
      return { enqueued: false, reason: 'ALREADY_EXISTS', eventId };
    }

    console.log(`[CAPI-v3] ✅ Đã enqueue sự kiện ${eventName} (Outbox ID #${res.rows[0].id}, Event ID: ${eventId})`);
    return { enqueued: true, outboxId: res.rows[0].id, eventId };

  } catch (err) {
    console.error(`[CAPI-v3] Lỗi khi enqueue sự kiện ${eventName}:`, err.message);
    throw err;
  }
}

/**
 * Worker xử lý hàng đợi Outbox (Concurrency-Safe với FOR UPDATE SKIP LOCKED)
 * 
 * @param {object} options
 * @param {number} options.limit - Số lượng sự kiện xử lý mỗi đợt (mặc định 10)
 * @param {boolean} options.isDryRun - Nếu true, chỉ claim và trả về kết quả giả lập (dùng cho test)
 */
async function processOutboxBatch({ limit = 10, isDryRun = false } = {}) {
  // 1. Kiểm tra feature flag CAPI v3
  const isV3Enabled = await getSetting('meta_capi_business_messaging_v3_enabled');
  if (isV3Enabled !== 'true' && !isDryRun) {
    return { processed: 0, reason: 'FEATURE_FLAG_DISABLED' };
  }

  // 2. Lấy credentials
  const datasetId = await getSetting('meta_dataset_id');
  const accessToken = await getSetting('meta_capi_access_token');
  const testEventCode = await getSetting('meta_test_event_code');

  if (!isDryRun && (!datasetId || !accessToken)) {
    console.error('[CAPI-v3 Worker] Thiếu dataset_id hoặc meta_capi_access_token');
    return { processed: 0, reason: 'MISSING_CREDENTIALS' };
  }

  const workerId = `worker_${process.pid}_${Date.now()}`;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 3. Claim các sự kiện đang chờ bằng SKIP LOCKED
    // Hỗ trợ tự phục hồi: Nếu worker trước bị crash/timeout khiến sự kiện kẹt ở PROCESSING > 5 phút, nó sẽ được thu hồi tự động
    const claimQuery = `
      UPDATE meta_capi_events
      SET status = 'PROCESSING',
          locked_at = NOW(),
          locked_by = $1,
          updated_at = NOW()
      WHERE id IN (
        SELECT id FROM meta_capi_events
        WHERE (
          (status IN ('PENDING', 'FAILED_RETRYABLE') AND (next_retry_at IS NULL OR next_retry_at <= NOW()))
          OR (status = 'PROCESSING' AND locked_at < NOW() - INTERVAL '5 minutes')
        )
        ORDER BY id ASC
        LIMIT $2
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *;
    `;

    const claimedRes = await client.query(claimQuery, [workerId, limit]);
    const eventsToProcess = claimedRes.rows;

    await client.query('COMMIT');

    if (eventsToProcess.length === 0) {
      return { processed: 0, successCount: 0, failedCount: 0 };
    }

    console.log(`[CAPI-v3 Worker] Đã claim ${eventsToProcess.length} sự kiện để gửi lên Meta...`);

    let successCount = 0;
    let failedCount = 0;

    for (const record of eventsToProcess) {
      const payloadData = typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload;

      if (isDryRun) {
        // Chế độ Dry-Run: Mô phỏng thành công
        await db.query(`
          UPDATE meta_capi_events
          SET status = 'SENT',
              sent_at = NOW(),
              locked_at = NULL,
              locked_by = NULL,
              updated_at = NOW()
          WHERE id = $1
        `, [record.id]);
        successCount++;
        continue;
      }

      // Xây dựng request body (Bảo mật: Token truyền qua Header và Body, KHÔNG để trên query URL để tránh lọt vào log Nginx/Axios)
      const requestBody = {
        data: [payloadData],
        access_token: accessToken
      };
      if (testEventCode && testEventCode.trim()) {
        requestBody.test_event_code = testEventCode.trim();
      }

      const metaUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${datasetId}/events`;

      try {
        const response = await axios.post(metaUrl, requestBody, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        });
        const fbtraceId = response.data?.fbtrace_id || null;

        await db.query(`
          UPDATE meta_capi_events
          SET status = 'SENT',
              sent_at = NOW(),
              fbtrace_id = $1,
              locked_at = NULL,
              locked_by = NULL,
              updated_at = NOW()
          WHERE id = $2
        `, [fbtraceId, record.id]);

        successCount++;
        console.log(`[CAPI-v3 Worker] ✅ Gửi thành công sự kiện #${record.id} (${record.event_name}) | fbtrace_id: ${fbtraceId}`);

      } catch (err) {
        failedCount++;
        let errResp = err.response ? err.response.data : null;
        let errMsg = err.message || 'Lỗi gửi Meta CAPI';

        // Bảo mật P0: Khử bỏ mọi dấu vết của token nếu tình cờ xuất hiện trong message lỗi
        if (accessToken) {
          errMsg = errMsg.split(accessToken).join('[REDACTED_TOKEN]');
          if (errResp) {
            try {
              errResp = JSON.parse(JSON.stringify(errResp).split(accessToken).join('[REDACTED_TOKEN]'));
            } catch (_) {}
          }
        }

        const attempts = record.attempts + 1;

        // Phân loại lỗi: Lỗi client 4xx (trừ rate limit 429) là lỗi không thể retry (Dead-letter)
        const isClientFatal = err.response && err.response.status >= 400 && err.response.status < 500 && err.response.status !== 429;
        const reachedMaxAttempts = attempts >= record.max_attempts;

        if (isClientFatal || reachedMaxAttempts) {
          // Lỗi vĩnh viễn (Dead-letter)
          await db.query(`
            UPDATE meta_capi_events
            SET status = 'FAILED_PERMANENT',
                attempts = $1,
                error_message = $2,
                error_response = $3,
                locked_at = NULL,
                locked_by = NULL,
                updated_at = NOW()
            WHERE id = $4
          `, [attempts, errMsg, JSON.stringify(errResp || {}), record.id]);
          console.error(`[CAPI-v3 Worker] ❌ Sự kiện #${record.id} thất bại vĩnh viễn (status: FAILED_PERMANENT):`, errMsg);
        } else {
          // Lỗi tạm thời (5xx, rate limit, timeout): Retry có exponential backoff (30s, 60s, 120s...)
          const backoffSeconds = Math.min(3600, Math.pow(2, attempts) * 30);
          await db.query(`
            UPDATE meta_capi_events
            SET status = 'FAILED_RETRYABLE',
                attempts = $1,
                error_message = $2,
                error_response = $3,
                next_retry_at = NOW() + ($5 || ' seconds')::interval,
                locked_at = NULL,
                locked_by = NULL,
                updated_at = NOW()
          WHERE id = $4
          `, [attempts, errMsg, JSON.stringify(errResp || {}), record.id, `${backoffSeconds}`]);
          console.warn(`[CAPI-v3 Worker] ⚠️ Sự kiện #${record.id} thất bại tạm thời, sẽ thử lại sau ${backoffSeconds}s (Lần ${attempts}/${record.max_attempts}):`, errMsg);
        }
      }
    }

    return { processed: eventsToProcess.length, successCount, failedCount };

  } catch (err) {
    console.error('[CAPI-v3 Worker] Lỗi vòng lặp worker:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Đánh giá điều kiện Qualified Lead của Sales
 * Quy chuẩn nghiêm ngặt cho FIT Tour:
 * 1. BẮT BUỘC có Sales tiếp nhận (assigned_to IS NOT NULL)
 * 2. BẮT BUỘC có định danh hợp lệ (Messenger: PSID + Page ID; Kênh khác: SĐT E.164)
 * 3. BẮT BUỘC có xác nhận chất lượng thực sự từ Sales:
 *    - Hoặc: Sales trực tiếp đánh dấu hợp lệ (is_sales_qualified === true)
 *    - Hoặc: Đạt trạng thái 'Tiềm năng' VÀ đã chọn Tour cụ thể (tour_id IS NOT NULL) VÀ có ghi chú tư vấn chi tiết về nhu cầu (>= 15 ký tự)
 *    - TUYỆT ĐỐI KHÔNG tự động coi 'Đang liên hệ' hay ghi chú sơ sài là Qualified!
 */
function evaluateSalesQualification(lead, updates = {}) {
  const merged = { ...lead, ...updates };

  // 1. Phải có nhân viên tư vấn tiếp nhận
  const hasAssigned = Boolean(merged.assigned_to);

  // 2. Định danh liên hệ hợp lệ
  const isMessenger = merged.source === 'Messenger' || Boolean(merged.facebook_psid);
  let hasValidIdentity = false;

  if (isMessenger) {
    hasValidIdentity = Boolean(merged.facebook_psid && merged.facebook_page_id && !isInvalidIdentifier(merged.facebook_page_id));
  } else {
    hasValidIdentity = Boolean(normalizePhone(merged.phone));
  }

  // 3. Tiêu chí xác nhận nghiệp vụ của Sales:
  // Cách A: Sales chủ động xác nhận (Nút toggle trên CRM)
  const isExplicitlyQualified = Boolean(merged.is_sales_qualified);

  // Cách B: Trạng thái 'Tiềm năng' + Có Tour cụ thể + Ghi chú tư vấn chi tiết (>= 15 ký tự, ví dụ lịch khởi hành/số khách/nhu cầu)
  const normClassification = String(merged.classification || '').trim().toLowerCase();
  const normStatus = String(merged.status || '').trim().toLowerCase();
  const isStatusTiemNang = normStatus.includes('tiềm năng') || ['tiềm năng', 'hot'].includes(normClassification);
  const hasSpecificTour = Boolean(merged.tour_id);
  const hasSubstantialNote = Boolean(merged.consultation_note && merged.consultation_note.trim().length >= 15);
  const isFunnelQualified = isStatusTiemNang && hasSpecificTour && hasSubstantialNote;

  const hasRealQualification = isExplicitlyQualified || isFunnelQualified;
  const isQualified = hasAssigned && hasValidIdentity && hasRealQualification;

  return {
    isQualified,
    details: {
      hasAssigned,
      hasValidIdentity,
      isExplicitlyQualified,
      isFunnelQualified,
      isMessenger
    }
  };
}

/**
 * Enqueue sự kiện LeadSubmitted cho khách mới từ Messenger
 */
async function enqueueLeadSubmitted(lead, client = null) {
  if (lead.source !== 'Messenger' || !lead.facebook_psid || !lead.facebook_page_id) {
    return { enqueued: false, reason: 'NOT_MESSENGER_LEAD' };
  }

  return enqueueEvent({
    eventName: 'LeadSubmitted',
    businessEntityType: 'lead',
    businessEntityId: lead.id,
    pageId: lead.facebook_page_id,
    psid: lead.facebook_psid,
    phone: lead.phone,
    email: lead.email,
    customData: {
      lead_id: lead.id,
      lead_source: lead.source,
      content_name: lead.tour_name || 'Khách hỏi tour Messenger'
    },
    eventTime: lead.created_at || new Date(),
    client
  });
}

/**
 * Enqueue sự kiện QualifiedLead khi đạt tiêu chí chất lượng Sales
 */
async function enqueueQualifiedLead(lead, client = null) {
  if (lead.source !== 'Messenger' || !lead.facebook_psid || !lead.facebook_page_id) {
    return { enqueued: false, reason: 'NOT_MESSENGER_LEAD' };
  }

  return enqueueEvent({
    eventName: 'QualifiedLead',
    businessEntityType: 'lead',
    businessEntityId: lead.id,
    pageId: lead.facebook_page_id,
    psid: lead.facebook_psid,
    phone: lead.phone,
    email: lead.email,
    customData: {
      lead_id: lead.id,
      lead_status: lead.status,
      classification: lead.classification || 'Tiềm năng',
      content_name: lead.tour_name || 'Tour quan tâm'
    },
    eventTime: new Date(),
    client
  });
}

/**
 * Kiểm định điều kiện giao dịch Purchase thực tế cho Booking
 * YÊU CẦU NGHIÊM NGẶT THEO NGUYÊN TẮC KẾ TOÁN THỰC THU:
 * 1. BẮT BUỘC: Tiền thực thu (paid hoặc paid_amount) phải > 0.
 *    - Tuyệt đối KHÔNG ghi nhận Purchase khi paid <= 0 bất kể nhãn trạng thái là gì!
 *    - Tránh tình trạng nhân viên chỉ đổi nhãn trạng thái 'Đã đặt cọc', 'Đã thanh toán', 'Hoàn thành' mà chưa có phiếu thu/tiền thực.
 * 2. Phải có trạng thái xác nhận hợp lệ đi kèm (không nằm trong trạng thái hủy/hoàn tiền).
 */
function isEligiblePurchaseBooking(booking) {
  if (!booking) return false;

  // 1. RÀNG BUỘC CỐT TỬ: BẮT BUỘC tiền thực thu phải > 0
  const paidAmount = Number(booking.paid || booking.paid_amount || 0);
  if (paidAmount <= 0) {
    return false;
  }

  // 2. Không nằm trong trạng thái hủy hoặc hoàn tiền
  const INVALID_STATUSES = ['Đã hủy', 'Hủy', 'CANCELLED', 'FAILED', 'Refunded', 'Đã hoàn tiền', 'Chờ xử lý', 'Chưa thanh toán'];
  if (booking.booking_status && INVALID_STATUSES.includes(booking.booking_status)) {
    return false;
  }
  if (booking.payment_status && INVALID_STATUSES.includes(booking.payment_status)) {
    return false;
  }

  // 3. Phải có trạng thái giao dịch hợp lệ đi kèm với số tiền đã thu
  const VALID_PAYMENT_STATUSES = ['paid', 'partial', 'Đã đặt cọc', 'Đã thanh toán', 'Hoàn thành', 'PAID', 'DEPOSITED'];
  const VALID_BOOKING_STATUSES = ['Đã đặt cọc', 'Đã thanh toán', 'Hoàn thành', 'Xác nhận'];

  const hasValidPaymentStatus = booking.payment_status && VALID_PAYMENT_STATUSES.includes(booking.payment_status);
  const hasValidBookingStatus = booking.booking_status && VALID_BOOKING_STATUSES.includes(booking.booking_status);

  // Nếu không set status nhưng đã có tiền thu thực tế > 0 và không bị hủy -> vẫn hợp lệ
  if (!booking.booking_status && !booking.payment_status) {
    return true;
  }

  return (hasValidPaymentStatus || hasValidBookingStatus);
}

/**
 * Enqueue sự kiện Purchase cho Booking hợp lệ
 * PHÂN BIỆT RÕ RÀNG GIỮA:
 * - acquisition_source (Nguồn khách tiếp cận ban đầu)
 * - conversion_channel (Kênh chốt đơn / hội thoại)
 * - payment_method (Phương thức thanh toán: chuyển khoản, tiền mặt, POS... KHÔNG dùng làm kênh loại trừ)
 * 
 * NGUYÊN TẮC QUAN TRỌNG:
 * Khách chốt qua Messenger nhưng thanh toán bằng chuyển khoản ngân hàng là hoàn toàn bình thường và chiếm đa số.
 * Tuyệt đối KHÔNG loại trừ kênh Messenger chỉ vì phương thức thanh toán là 'chuyển khoản' hay 'ngân hàng'.
 */
async function enqueuePurchase(booking, customer, lead = null, client = null) {
  // 1. Kiểm tra điều kiện giao dịch tài chính thực tế (BẮT BUỘC paid > 0)
  if (!isEligiblePurchaseBooking(booking)) {
    console.log(`[CAPI-v3] Booking #${booking.booking_code || booking.id} chưa đủ điều kiện giao dịch Purchase (Status: ${booking.booking_status}, Payment: ${booking.payment_status}, Paid: ${booking.paid || 0}). Yêu cầu paid > 0 và trạng thái tài chính hợp lệ.`);
    return { enqueued: false, reason: 'NOT_ELIGIBLE_TRANSACTION' };
  }

  // 2. Phân tách rạch ròi 3 tầng dữ liệu:
  // Tầng A: Kênh chốt giao dịch (Conversion Channel)
  const conversionChannel = (
    booking.conversion_channel || 
    booking.booking_source || 
    booking.source || 
    ''
  ).trim();

  // Tầng B: Nguồn khách tiếp cận ban đầu (Acquisition Source)
  const acquisitionSource = (
    booking.acquisition_source || 
    (lead && lead.source) || 
    (customer && customer.source) || 
    ''
  ).trim();

  // Tầng C: Phương thức thanh toán (Payment Method: Chuyển khoản, Tiền mặt, POS...)
  const paymentMethod = (
    booking.payment_method || 
    (booking.payment_details && booking.payment_details.method) || 
    ''
  ).trim();

  // Danh sách các kênh tiếp cận hoặc kênh chốt đơn RÕ RÀNG NGOÀI HỘI THOẠI MESSENGER:
  // (Lưu ý: KHÔNG bao giờ đưa 'chuyển khoản', 'ngân hàng' vào đây vì đó là payment_method)
  const EXPLICIT_NON_MESSENGER_CHANNELS = [
    'website', 'web', 'landing_page', 'form', 'hotline', 
    'walk-in', 'trực tiếp', 'zalo', 'tiktok', 'referral', 'đối tác', 'offline_store'
  ];

  // Nếu kênh chốt đơn (conversionChannel) rõ ràng thuộc kênh ngoài Messenger (vd: khách tự đặt qua website, hoặc đến trực tiếp quầy)
  if (conversionChannel && EXPLICIT_NON_MESSENGER_CHANNELS.includes(conversionChannel.toLowerCase())) {
    console.log(`[CAPI-v3] Booking #${booking.booking_code || booking.id} có kênh chốt đơn là '${conversionChannel}' (ngoài hội thoại Messenger). Bỏ qua Business Messaging.`);
    return { enqueued: false, reason: 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER', channel: conversionChannel };
  }

  // Nếu Lead gắn kèm đến từ kênh ngoài Messenger (vd: Tiktok, Zalo, Form website)
  if (lead && lead.source && EXPLICIT_NON_MESSENGER_CHANNELS.includes(lead.source.toLowerCase())) {
    console.log(`[CAPI-v3] Booking #${booking.booking_code || booking.id} gắn với Lead từ nguồn '${lead.source}' (ngoài Messenger). Bỏ qua Business Messaging.`);
    return { enqueued: false, reason: 'CROSS_CHANNEL_PURCHASE_NOT_MESSENGER', channel: lead.source };
  }

  // Xác nhận nguồn gốc giao dịch phát sinh trong hoặc bắt nguồn từ hội thoại Messenger:
  // - conversionChannel là 'messenger' / 'facebook' / 'chat'
  // - HOẶC Lead gắn kèm có nguồn gốc Messenger VÀ sở hữu cặp PSID + Page ID hợp lệ
  const isMessengerAttributed = 
    ['messenger', 'facebook', 'chat'].includes(conversionChannel.toLowerCase()) ||
    (lead && ['messenger', 'facebook'].includes((lead.source || '').toLowerCase()) && lead.facebook_psid && lead.facebook_page_id) ||
    (!conversionChannel && lead && lead.facebook_psid && lead.facebook_page_id);

  if (!isMessengerAttributed) {
    console.log(`[CAPI-v3] Booking #${booking.booking_code || booking.id} không có bằng chứng phát sinh từ hội thoại Messenger. Bỏ qua luồng Business Messaging.`);
    return { enqueued: false, reason: 'NOT_MESSENGER_PURCHASE', channel: conversionChannel || acquisitionSource || 'unknown' };
  }

  // 3. Kiểm tra cặp định danh PSID & Page ID
  const psid = (lead && lead.facebook_psid) || (customer && customer.facebook_psid);
  const pageId = (lead && lead.facebook_page_id) || (customer && customer.facebook_page_id);

  if (!psid || !pageId || isInvalidIdentifier(psid) || isInvalidIdentifier(pageId)) {
    console.log(`[CAPI-v3] Booking #${booking.booking_code || booking.id} thiếu PSID hoặc Page ID hợp lệ. Bỏ qua luồng Business Messaging.`);
    return { enqueued: false, reason: 'MISSING_OR_INVALID_MESSENGER_IDENTIFIERS', channel: 'messenger_without_psid' };
  }

  // 4. Đo lường doanh thu thực thu:
  // Đọc chính sách từ settings: 'paid_amount' (mặc định cho thực thu) hoặc 'contract_value'
  const valueSource = (await getSetting('meta_capi_purchase_value_source')) || 'paid_amount';
  let purchaseValue = 0;

  if (valueSource === 'contract_value') {
    purchaseValue = Number(booking.total_price) || 0;
  } else {
    purchaseValue = Number(booking.paid || booking.paid_amount) || 0;
  }

  return enqueueEvent({
    eventName: 'Purchase',
    businessEntityType: 'booking',
    businessEntityId: booking.id,
    pageId: pageId,
    psid: psid,
    phone: (customer && customer.phone) || (lead && lead.phone),
    email: (customer && customer.email) || (lead && lead.email),
    customData: {
      booking_code: booking.booking_code,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status,
      payment_method: paymentMethod || 'Chuyển khoản / Khác',
      value: purchaseValue,
      currency: 'VND',
      value_measurement_policy: valueSource,
      tour_id: booking.tour_id
    },
    eventTime: booking.created_at || new Date(),
    client
  });
}

/**
 * Thu hồi và mở khóa các sự kiện bị kẹt ở trạng thái PROCESSING quá lâu (do worker crash / restart)
 */
async function recoverStaleLocks(timeoutMinutes = 5) {
  try {
    const res = await db.query(`
      UPDATE meta_capi_events
      SET status = 'FAILED_RETRYABLE',
          locked_at = NULL,
          locked_by = NULL,
          updated_at = NOW()
      WHERE status = 'PROCESSING'
        AND locked_at < NOW() - ($1 || ' minutes')::interval
      RETURNING id;
    `, [timeoutMinutes]);
    if (res.rows.length > 0) {
      console.log(`[CAPI-v3] 🔄 Đã thu hồi và phục hồi ${res.rows.length} sự kiện bị kẹt do worker cũ crash/timeout.`);
    }
    return res.rows.length;
  } catch (err) {
    console.error('[CAPI-v3] Lỗi khi thu hồi stale locks:', err.message);
    return 0;
  }
}

/**
 * Kiểm tra danh sách quyền thực tế của Meta Access Token qua Graph API
 * Phân biệt rõ:
 * 1. Quyền bắt buộc cho CAPI Business Messaging (page_events, pages_messaging)
 * 2. Quyền cho Ads API (ads_management, ads_read - dùng cho báo cáo quảng cáo, không chặn CAPI)
 * Không bao giờ in hoặc trả về token thô
 */
async function verifyTokenPermissions(customToken = null) {
  const token = customToken || (await getSetting('meta_capi_access_token'));
  if (!token || !token.trim()) {
    return { success: false, error: 'Chưa cấu hình Access Token' };
  }

  try {
    const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/me/permissions`;
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    const data = response.data?.data || [];
    const grantedPermissions = data
      .filter(p => p.status === 'granted')
      .map(p => p.permission);

    // 1. Quyền cốt tử cho Conversions API for Business Messaging
    const CAPI_REQUIRED_PERMISSIONS = [
      'page_events'
    ];
    const missingCapiPermissions = CAPI_REQUIRED_PERMISSIONS.filter(p => !grantedPermissions.includes(p));

    // 2. Quyền tương tác Messenger / Webhook
    const hasPagesMessaging = grantedPermissions.includes('pages_messaging');

    // 3. Quyền cho Marketing Ads API (dành cho module báo cáo ads, không bắt buộc để gửi CAPI events)
    const ADS_API_PERMISSIONS = ['ads_management', 'ads_read'];
    const hasAdsManagement = grantedPermissions.includes('ads_management');
    const hasAdsRead = grantedPermissions.includes('ads_read');
    const missingAdsPermissions = ADS_API_PERMISSIONS.filter(p => !grantedPermissions.includes(p));

    return {
      success: true,
      granted_permissions: grantedPermissions,
      has_page_events: grantedPermissions.includes('page_events'),
      has_pages_messaging: hasPagesMessaging,
      has_ads_management: hasAdsManagement,
      has_ads_read: hasAdsRead,
      // Đánh giá tính sẵn sàng riêng cho CAPI:
      is_capi_ready: missingCapiPermissions.length === 0,
      missing_capi_permissions: missingCapiPermissions,
      // Đánh giá tính sẵn sàng cho Ads API:
      is_ads_api_ready: hasAdsManagement || hasAdsRead,
      missing_ads_permissions: missingAdsPermissions
    };
  } catch (err) {
    const errData = err.response?.data?.error;
    const cleanMsg = (errData?.message || err.message || 'Lỗi kiểm tra quyền Meta Token').split(token).join('[REDACTED]');
    return {
      success: false,
      error: cleanMsg,
      code: errData?.code || null
    };
  }
}

/**
 * Gửi kiểm thử chuỗi 3 sự kiện (LeadSubmitted, QualifiedLead, Purchase) trên môi trường cách ly
 * HOÀN TOÀN KHÔNG TẠO BOOKING GIẢ, KHÔNG TẠO PHIẾU THU GIẢ TRONG PRODUCTION DB.
 * 
 * @param {object} options
 * @param {string} options.testEventCode - Mã Test Events từ tab Thử nghiệm sự kiện của Meta
 * @param {string} options.pageId - Page ID (mặc định lấy cấu hình hoặc 107694084435854)
 * @param {string} options.customPsid - PSID thử nghiệm (hoặc PSID của tài khoản nội bộ test)
 */
async function sendIsolatedTestEvents({
  testEventCode,
  pageId = '107694084435854',
  customPsid = '100293848572910'
} = {}) {
  if (!testEventCode || !testEventCode.trim()) {
    throw new Error('Bắt buộc phải nhập Mã thử nghiệm sự kiện (test_event_code) từ Meta Events Manager!');
  }

  const datasetId = await getSetting('meta_dataset_id') || '835404925628132';
  const accessToken = await getSetting('meta_capi_access_token');

  if (!accessToken || !accessToken.trim()) {
    throw new Error('Chưa cấu hình Meta CAPI Access Token trong settings.');
  }

  const cleanTestCode = testEventCode.trim();
  const testNow = new Date();
  const nowUnix = Math.floor(testNow.getTime() / 1000);

  // 1. Mock Event 1: LeadSubmitted
  const payloadLeadSubmitted = buildBusinessMessagingPayload({
    eventName: 'LeadSubmitted',
    psid: customPsid,
    pageId: pageId,
    phone: '0901234567',
    email: 'test_audit@fittour.vn',
    customData: {
      content_name: 'Tour Thử Nghiệm Cách Ly FIT TOUR (Không lưu DB)',
      lead_source: 'Messenger Test Sandbox'
    },
    eventTime: testNow,
    eventId: `fittour_test_sub_${nowUnix}`
  });

  // 2. Mock Event 2: QualifiedLead
  const payloadQualifiedLead = buildBusinessMessagingPayload({
    eventName: 'QualifiedLead',
    psid: customPsid,
    pageId: pageId,
    phone: '0901234567',
    customData: {
      lead_status: 'Tiềm năng',
      classification: 'Đạt chuẩn Sales',
      content_name: 'Tour Thử Nghiệm Cách Ly FIT TOUR'
    },
    eventTime: testNow,
    eventId: `fittour_test_qual_${nowUnix}`
  });

  // 3. Mock Event 3: Purchase (Doanh thu thử nghiệm 1,000,000 VND)
  const payloadPurchase = buildBusinessMessagingPayload({
    eventName: 'Purchase',
    psid: customPsid,
    pageId: pageId,
    phone: '0901234567',
    customData: {
      booking_code: `BK-TEST-MOCK-${nowUnix}`,
      value: 1000000,
      currency: 'VND',
      value_measurement_policy: 'paid_amount',
      payment_method: 'Chuyển khoản (Mock Test)'
    },
    eventTime: testNow,
    eventId: `fittour_test_pur_${nowUnix}`
  });

  const metaUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${datasetId}/events`;
  const requestBody = {
    data: [payloadLeadSubmitted, payloadQualifiedLead, payloadPurchase],
    test_event_code: cleanTestCode,
    access_token: accessToken
  };

  try {
    const response = await axios.post(metaUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    return {
      success: true,
      dataset_id: datasetId,
      page_id: pageId,
      test_event_code: cleanTestCode,
      events_sent: ['LeadSubmitted', 'QualifiedLead', 'Purchase'],
      events_received: response.data?.events_received || 3,
      fbtrace_id: response.data?.fbtrace_id || null,
      messages: response.data?.messages || [],
      isolated_notice: 'Hoàn toàn không ghi nhận dữ liệu vào bảng bookings, booking_transactions hay leads của production.'
    };
  } catch (err) {
    let errResp = err.response ? err.response.data : null;
    let errMsg = err.message || 'Lỗi gửi Meta Test Events';

    // Bảo mật: Xoá bỏ mọi dấu vết của token nếu có
    if (accessToken) {
      errMsg = errMsg.split(accessToken).join('[REDACTED_TOKEN]');
      if (errResp) {
        try {
          errResp = JSON.parse(JSON.stringify(errResp).split(accessToken).join('[REDACTED_TOKEN]'));
        } catch (_) {}
      }
    }

    return {
      success: false,
      dataset_id: datasetId,
      page_id: pageId,
      test_event_code: cleanTestCode,
      error_message: errMsg,
      meta_error: errResp?.error || errResp,
      isolated_notice: 'Không có dữ liệu rác nào được tạo trong DB.'
    };
  }
}

module.exports = {
  sha256,
  normalizePhone,
  buildBusinessMessagingPayload,
  enqueueEvent,
  processOutboxBatch,
  recoverStaleLocks,
  evaluateSalesQualification,
  isEligiblePurchaseBooking,
  enqueueLeadSubmitted,
  enqueueQualifiedLead,
  enqueuePurchase,
  verifyTokenPermissions,
  sendIsolatedTestEvents,
  getSetting,
  KNOWN_DATASET_IDS
};
