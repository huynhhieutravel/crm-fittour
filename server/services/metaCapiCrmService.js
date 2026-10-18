/**
 * Meta Conversions API (CAPI) for CRM Standard
 * 
 * Chuẩn tích hợp chuyển đổi CRM Server-to-Server qua Meta Conversions API v26.0:
 * - action_source: "system_generated" (chuẩn CRM theo tài liệu Meta hiện hành)
 * - Event Matching: Phone (E.164 SHA-256), Email (SHA-256), External ID (CRM Entity ID SHA-256)
 * - Kiến trúc Outbox Pattern (meta_capi_events), Deduplication CRM-side & Retry Exponential Backoff
 * - Bảo đảm an toàn tuyệt đối: Không lộ token, không in PII, không tự chế dữ liệu giả.
 */

const axios = require('axios');
const crypto = require('crypto');
const db = require('../db');

const META_GRAPH_VERSION = 'v26.0';
const DEFAULT_DATASET_ID = '835404925628132';

// Helper: Đọc cấu hình từ DB
async function getSetting(key) {
  try {
    const res = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows.length > 0 ? res.rows[0].value : null;
  } catch (err) {
    console.error(`[CAPI-CRM] Lỗi đọc setting ${key}:`, err.message);
    return null;
  }
}

// Helper: SHA-256 chuẩn hóa cho Meta
function sha256(value) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim().toLowerCase();
  if (str === '') return null;
  return crypto.createHash('sha256').update(str).digest('hex');
}

// Helper: Chuẩn hóa số điện thoại theo định dạng E.164 bỏ dấu +
// Ví dụ: "0901 234 567" -> "84901234567"
function normalizePhone(phone) {
  if (!phone) return null;
  let digits = String(phone).replace(/[^\d]/g, '');
  if (!digits) return null;

  if (digits.startsWith('0')) {
    digits = '84' + digits.substring(1);
  } else if (!digits.startsWith('84') && (digits.length === 9 || digits.length === 10)) {
    digits = '84' + digits;
  }

  // Số điện thoại Việt Nam chuẩn dài từ 11 đến 12 chữ số khi có mã quốc gia 84
  if (digits.length < 10 || digits.length > 15) {
    return null;
  }
  return digits;
}

// Helper: Chuẩn hóa email
function normalizeEmail(email) {
  if (!email) return null;
  const cleaned = String(email).trim().toLowerCase();
  if (cleaned.includes('@') && cleaned.includes('.') && cleaned.length >= 6) {
    return cleaned;
  }
  return null;
}

/**
 * Xây dựng payload chuẩn Meta Conversions API cho CRM (action_source: "system_generated")
 * 
 * NGUYÊN TẮC BẢO TOÀN DỮ LIỆU:
 * 1. Tuyệt đối KHÔNG đưa CRM Lead ID vào user_data.lead_id! lead_id chỉ dành riêng cho Meta Lead Gen ID thật.
 * 2. CRM Lead/Booking ID được đưa vào user_data.external_id (SHA-256) và custom_data.
 * 3. fbc chỉ được truyền khi có chuỗi 'fb.1...' thực tế thu thập từ click quảng cáo.
 * 4. Không truyền page_id, messaging_channel hay PSID vào user_data của luồng CRM.
 */
function buildCrmPayload({
  eventName,
  phone = null,
  email = null,
  externalId = null,
  metaLeadId = null,
  fbc = null,
  customData = {},
  eventTime = new Date(),
  eventId = null
}) {
  const unixTimestamp = Math.floor(new Date(eventTime).getTime() / 1000);
  const stableEventId = eventId || `fittour_crm_${eventName.toLowerCase()}_${externalId || Date.now()}`;

  const userData = {};

  // 1. Số điện thoại (E.164 SHA-256)
  const normPhone = normalizePhone(phone);
  if (normPhone) {
    userData.ph = [sha256(normPhone)];
  }

  // 2. Email (SHA-256)
  const normEmail = normalizeEmail(email);
  if (normEmail) {
    userData.em = [sha256(normEmail)];
  }

  // 3. External ID: Mã định danh CRM của khách hàng (SHA-256)
  if (externalId !== null && externalId !== undefined) {
    userData.external_id = [sha256(String(externalId))];
  }

  // 4. Meta Lead ID: CHỈ DÙNG khi đây là ID do Meta Lead Form phát hành (ID số chuỗi dài)
  // Ràng buộc bảo vệ: Không cho phép CRM internal ID bị gán nhầm vào lead_id của Meta
  if (metaLeadId && String(metaLeadId).trim()) {
    const cleanLeadId = String(metaLeadId).trim();
    // Meta Lead ID thường là số nguyên dài từ 12 ký tự trở lên
    if (/^\d{10,25}$/.test(cleanLeadId)) {
      userData.lead_id = cleanLeadId;
    }
  }

  // 5. Facebook Click ID (fbc): Chỉ nhận chuỗi bắt đầu bằng "fb." thực tế
  if (fbc && String(fbc).startsWith('fb.')) {
    userData.fbc = String(fbc).trim();
  }

  // 6. Custom Data & Event Source Parameters
  const mergedCustomData = {
    lead_event_source: 'FIT Tour CRM',
    event_source: 'crm',
    crm_entity_id: externalId ? String(externalId) : undefined,
    ...customData
  };

  return {
    event_name: eventName,
    event_time: unixTimestamp,
    event_id: stableEventId,
    action_source: 'system_generated',
    user_data: userData,
    custom_data: mergedCustomData
  };
}

/**
 * Kiểm định điều kiện giao dịch Purchase thực tế cho Booking
 * TUÂN THỦ NGUYÊN TẮC KẾ TOÁN THỰC THU:
 * 1. BẮT BUỘC: Tiền thực thu (paid) phải > 0.
 * 2. Tuyệt đối loại bỏ các trạng thái Hủy, Hoàn tiền, Thất bại.
 */
function isEligiblePurchaseBooking(booking) {
  if (!booking) return false;

  const paidAmount = Number(booking.paid || booking.paid_amount || 0);
  if (paidAmount <= 0) {
    return false;
  }

  const statusStr = String(booking.booking_status || '').toLowerCase();
  const paymentStr = String(booking.payment_status || '').toLowerCase();

  const isCancelled = (
    statusStr.includes('hủy') || 
    statusStr.includes('huỷ') || 
    statusStr.includes('cancel') || 
    statusStr.includes('fail') || 
    statusStr.includes('refund') || 
    statusStr.includes('hoàn tiền') ||
    statusStr === 'chưa thanh toán' ||
    statusStr === 'chờ xử lý' ||
    paymentStr.includes('hủy') || 
    paymentStr.includes('huỷ') || 
    paymentStr.includes('cancel') || 
    paymentStr.includes('fail') || 
    paymentStr.includes('refund') || 
    paymentStr.includes('hoàn tiền') ||
    paymentStr === 'chưa thanh toán' ||
    paymentStr === 'chờ xử lý'
  );

  if (isCancelled) {
    return false;
  }

  return true;
}

/**
 * Đánh giá điều kiện Qualified Lead của Sales cho CRM CAPI
 * Yêu cầu:
 * 1. Phải có nhân viên tư vấn phụ trách (assigned_to)
 * 2. Phải có định danh hợp lệ cho Meta matching (SĐT E.164 hoặc Email)
 * 3. Đạt tiêu chuẩn xác nhận của Sales:
 *    - Sales bấm xác nhận (is_sales_qualified === true)
 *    - Hoặc: Trạng thái 'Tiềm năng' + Đã chọn Tour cụ thể + Ghi chú tư vấn chi tiết (>= 15 ký tự)
 */
function evaluateSalesQualification(lead, updates = {}) {
  const merged = { ...lead, ...updates };

  const hasAssigned = Boolean(merged.assigned_to);
  const hasValidPhone = Boolean(normalizePhone(merged.phone));
  const hasValidEmail = Boolean(normalizeEmail(merged.email));
  const hasValidIdentity = hasValidPhone || hasValidEmail;

  const isExplicitlyQualified = Boolean(merged.is_sales_qualified);
  const isStatusTiemNang = merged.status === 'Tiềm năng' || ['Tiềm năng', 'Hot'].includes(merged.classification);
  const hasSpecificTour = Boolean(merged.tour_id);
  const hasSubstantialNote = Boolean(merged.consultation_note && merged.consultation_note.trim().length >= 15);
  const isFunnelQualified = isStatusTiemNang && hasSpecificTour && hasSubstantialNote;

  const isQualified = hasAssigned && hasValidIdentity && (isExplicitlyQualified || isFunnelQualified);

  return {
    isQualified,
    details: {
      hasAssigned,
      hasValidIdentity,
      hasValidPhone,
      hasValidEmail,
      isExplicitlyQualified,
      isFunnelQualified
    }
  };
}

/**
 * Kiểm tra tính hợp lệ theo cơ chế Canary
 * - 'disabled': Mặc định tắt canary, không gửi sự kiện tự động
 * - 'allowlist': Chỉ gửi cho các ID được chỉ định trong meta_capi_crm_canary_allowlist (VD: "888101,12345")
 * - 'all': Gửi cho toàn bộ (chỉ bật khi đã hoàn tất nghiệm thu canary)
 * - Kiểm tra giới hạn tối đa số sự kiện trong ngày (meta_capi_crm_canary_daily_limit)
 */
async function isCanaryEligible(businessEntityType, businessEntityId, client = null) {
  const canaryMode = (await getSetting('meta_capi_crm_canary_mode')) || 'disabled';

  if (canaryMode === 'disabled') {
    return { eligible: false, reason: 'CANARY_MODE_DISABLED' };
  }

  if (canaryMode === 'allowlist') {
    const rawAllowlist = (await getSetting('meta_capi_crm_canary_allowlist')) || '';
    const allowedIds = rawAllowlist
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    const targetIdStr = String(businessEntityId);
    if (!allowedIds.includes(targetIdStr)) {
      return { eligible: false, reason: 'CANARY_NOT_IN_ALLOWLIST', allowedIds };
    }
  }

  const dailyLimitSetting = await getSetting('meta_capi_crm_canary_daily_limit');
  const dailyLimit = dailyLimitSetting ? parseInt(dailyLimitSetting, 10) : 20;
  if (dailyLimit > 0) {
    const dbRunner = client || db;
    const countToday = await dbRunner.query(`
      SELECT COUNT(*)::int as cnt FROM meta_capi_events
      WHERE action_source = 'system_generated'
        AND created_at >= CURRENT_DATE;
    `);
    if ((countToday.rows[0]?.cnt || 0) >= dailyLimit) {
      return { eligible: false, reason: 'CANARY_DAILY_LIMIT_EXCEEDED', dailyLimit };
    }
  }

  return { eligible: true, canaryMode };
}

/**
 * Enqueue sự kiện CRM vào Outbox (meta_capi_events)
 * - Ràng buộc Unique: uq_capi_event_entity (event_name, business_entity_type, business_entity_id)
 * - Nếu Feature Flag meta_capi_crm_enabled đang TẮT: Không insert vào DB, không tích tụ backlog.
 * - Kiểm soát chặt chẽ bởi cơ chế Canary bảo vệ (allowlist / daily limit)
 */
async function enqueueCrmEvent({
  eventName,
  businessEntityType,
  businessEntityId,
  phone = null,
  email = null,
  externalId = null,
  metaLeadId = null,
  fbc = null,
  customData = {},
  client = null
}) {
  // 1. Kiểm tra feature flag CRM CAPI
  const isCrmEnabled = await getSetting('meta_capi_crm_enabled');
  if (isCrmEnabled !== 'true') {
    return { enqueued: false, reason: 'CRM_CAPI_FEATURE_FLAG_DISABLED' };
  }

  // 1.1 Kiểm tra cơ chế Canary bảo vệ (Tránh flood toàn bộ Lead/Booking mới khi bật cờ)
  const canaryCheck = await isCanaryEligible(businessEntityType, businessEntityId, client);
  if (!canaryCheck.eligible) {
    console.log(`[CAPI-CRM Canary] Bỏ qua ${businessEntityType} #${businessEntityId}: ${canaryCheck.reason}`);
    return { enqueued: false, reason: canaryCheck.reason };
  }

  // 2. Kiểm tra định danh bắt buộc cho CRM matching (phải có SĐT hoặc Email hoặc Meta Lead ID)
  const normPhone = normalizePhone(phone);
  const normEmail = normalizeEmail(email);
  if (!normPhone && !normEmail && !metaLeadId) {
    return { enqueued: false, reason: 'NO_VALID_MATCHING_KEY' };
  }

  // 3. Khóa chống trùng ổn định (Idempotency Key)
  const idempotencyKey = `fittour_crm_${eventName.toLowerCase()}_${businessEntityType}_${businessEntityId}`;
  const eventId = `fittour_crm_evt_${eventName.toLowerCase()}_${businessEntityType}_${businessEntityId}`;

  // 4. Xây dựng payload chuẩn
  const payload = buildCrmPayload({
    eventName,
    phone: normPhone,
    email: normEmail,
    externalId: externalId || businessEntityId,
    metaLeadId,
    fbc,
    customData,
    eventId
  });

  const dbRunner = client || db;

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
        payload,
        status,
        attempts,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, 'system_generated', NULL,
        $3, $4, $5,
        $6, 'PENDING', 0, NOW(), NOW()
      )
      ON CONFLICT (event_name, business_entity_type, business_entity_id) DO NOTHING
      RETURNING id;
    `;

    const res = await dbRunner.query(insertQuery, [
      eventId,
      eventName,
      businessEntityType,
      businessEntityId,
      idempotencyKey,
      JSON.stringify(payload)
    ]);

    if (res.rows.length === 0) {
      console.log(`[CAPI-CRM] Sự kiện ${eventName} cho ${businessEntityType} #${businessEntityId} đã tồn tại trong outbox (Chống trùng lặp thành công).`);
      return { enqueued: false, reason: 'ALREADY_EXISTS_IDEMPOTENT', idempotencyKey };
    }

    console.log(`[CAPI-CRM] ✅ Đã enqueue sự kiện ${eventName} (Outbox ID #${res.rows[0].id}, Event ID: ${eventId})`);
    return { enqueued: true, outboxId: res.rows[0].id, eventId };

  } catch (err) {
    console.error(`[CAPI-CRM] Lỗi enqueue sự kiện ${eventName}:`, err.message);
    throw err;
  }
}

/**
 * Enqueue sự kiện Lead cho khách mới trong CRM
 */
async function enqueueLead(lead, client = null) {
  if (!lead) return { enqueued: false, reason: 'NULL_LEAD' };

  return enqueueCrmEvent({
    eventName: 'Lead',
    businessEntityType: 'lead',
    businessEntityId: lead.id,
    phone: lead.phone,
    email: lead.email,
    externalId: lead.id,
    metaLeadId: lead.meta_lead_id,
    fbc: lead.fbclid ? `fb.1.${Date.now()}.${lead.fbclid}` : null,
    customData: {
      lead_source: lead.source || 'CRM Lead',
      content_name: lead.tour_name || 'Khách hàng tiềm năng FIT TOUR'
    },
    client
  });
}

/**
 * Enqueue sự kiện QualifiedLead khi Sales xác nhận khách đủ tiêu chuẩn
 */
async function enqueueQualifiedLead(lead, client = null) {
  if (!lead) return { enqueued: false, reason: 'NULL_LEAD' };

  return enqueueCrmEvent({
    eventName: 'QualifiedLead',
    businessEntityType: 'lead',
    businessEntityId: lead.id,
    phone: lead.phone,
    email: lead.email,
    externalId: lead.id,
    metaLeadId: lead.meta_lead_id,
    customData: {
      lead_status: lead.status,
      classification: lead.classification || 'Tiềm năng',
      content_name: lead.tour_name || 'Tour quan tâm'
    },
    client
  });
}

/**
 * Enqueue sự kiện Purchase cho Booking có khoản thanh toán thực tế hợp lệ
 * - Mặc định gửi đúng 1 sự kiện cho lần thanh toán đầu tiên của mỗi Booking
 * - Đo lường giá trị theo chính sách được duyệt trong DB (contract_value hoặc paid_value)
 */
async function enqueuePurchase(booking, customer, lead = null, client = null) {
  if (!booking) return { enqueued: false, reason: 'NULL_BOOKING' };

  // 1. Kiểm định điều kiện tài chính thực thu (paid > 0)
  if (!isEligiblePurchaseBooking(booking)) {
    console.log(`[CAPI-CRM] Booking #${booking.booking_code || booking.id} chưa đủ điều kiện Purchase (Status: ${booking.booking_status}, Paid: ${booking.paid || 0}).`);
    return { enqueued: false, reason: 'NOT_ELIGIBLE_TRANSACTION' };
  }

  // 2. Xác định thông tin đối soát từ Customer hoặc Lead
  const customerPhone = (customer && customer.phone) || (lead && lead.phone) || booking.customer_phone;
  const customerEmail = (customer && customer.email) || (lead && lead.email) || booking.customer_email;
  const externalId = (customer && customer.id) || booking.customer_id || (lead && lead.id);

  if (!normalizePhone(customerPhone) && !normalizeEmail(customerEmail)) {
    console.log(`[CAPI-CRM] Booking #${booking.booking_code || booking.id} thiếu Số điện thoại và Email khách hàng để matching.`);
    return { enqueued: false, reason: 'MISSING_CUSTOMER_CONTACT' };
  }

  // 3. Đọc chính sách đo lường giá trị: contract_value (tổng HĐ) hay paid_value (số tiền thực thu)
  const valuePolicy = await getSetting('meta_capi_purchase_value_source') || 'contract_value';
  let purchaseValue = 0;
  if (valuePolicy === 'paid_value') {
    purchaseValue = Number(booking.paid || booking.paid_amount || 0);
  } else {
    purchaseValue = Number(booking.total_price || booking.paid || 0);
  }

  // 4. Phân tầng nguồn gốc và phương thức thanh toán
  const leadSource = (lead && lead.source) || (customer && customer.source) || booking.source || 'CRM';
  const conversionChannel = booking.conversion_channel || booking.booking_source || 'Direct';
  const paymentMethod = booking.payment_method || (booking.payment_details && booking.payment_details.method) || 'Chuyển khoản';

  return enqueueCrmEvent({
    eventName: 'Purchase',
    businessEntityType: 'booking',
    businessEntityId: booking.id,
    phone: customerPhone,
    email: customerEmail,
    externalId,
    metaLeadId: lead ? lead.meta_lead_id : null,
    customData: {
      booking_code: booking.booking_code || `BK-${booking.id}`,
      value: purchaseValue,
      currency: 'VND',
      value_measurement_policy: valuePolicy,
      lead_source: leadSource,
      conversion_channel: conversionChannel,
      payment_method: paymentMethod,
      content_name: booking.tour_name || 'Tour Du Lịch FIT TOUR'
    },
    client
  });
}

/**
 * Worker xử lý hàng đợi Outbox cho CRM CAPI (action_source: "system_generated")
 * Sử dụng hàng đợi an toàn FOR UPDATE SKIP LOCKED
 */
async function processCrmOutboxBatch({ limit = 10, isDryRun = false } = {}) {
  const isCrmEnabled = await getSetting('meta_capi_crm_enabled');
  if (isCrmEnabled !== 'true' && !isDryRun) {
    return { processed: 0, reason: 'CRM_CAPI_FEATURE_FLAG_DISABLED' };
  }

  const datasetId = (await getSetting('meta_dataset_id')) || DEFAULT_DATASET_ID;
  const accessToken = await getSetting('meta_capi_access_token');
  const testEventCode = await getSetting('meta_test_event_code');

  if (!isDryRun && (!datasetId || !accessToken)) {
    console.error('[CAPI-CRM Worker] Thiếu dataset_id hoặc meta_capi_access_token');
    return { processed: 0, reason: 'MISSING_CREDENTIALS' };
  }

  const workerId = `crm_worker_${process.pid}_${Date.now()}`;
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // Claim các sự kiện CRM bằng FOR UPDATE SKIP LOCKED
    const claimQuery = `
      UPDATE meta_capi_events
      SET status = 'PROCESSING',
          locked_at = NOW(),
          locked_by = $1,
          updated_at = NOW()
      WHERE id IN (
        SELECT id FROM meta_capi_events
        WHERE action_source = 'system_generated'
          AND (
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

    console.log(`[CAPI-CRM Worker] Đã claim ${eventsToProcess.length} sự kiện CRM để gửi lên Meta...`);

    let successCount = 0;
    let failedCount = 0;

    for (const record of eventsToProcess) {
      const payloadData = typeof record.payload === 'string' ? JSON.parse(record.payload) : record.payload;

      if (isDryRun) {
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
        console.log(`[CAPI-CRM Worker] ✅ Gửi thành công sự kiện CRM #${record.id} (${record.event_name}) | fbtrace_id: ${fbtraceId}`);

      } catch (err) {
        failedCount++;
        let errResp = err.response ? err.response.data : null;
        let errMsg = err.message || 'Lỗi gửi Meta CRM CAPI';

        // Khử trùng token bảo mật
        if (accessToken) {
          errMsg = errMsg.split(accessToken).join('[REDACTED_TOKEN]');
          if (errResp) {
            try {
              errResp = JSON.parse(JSON.stringify(errResp).split(accessToken).join('[REDACTED_TOKEN]'));
            } catch (_) {}
          }
        }

        const attempts = record.attempts + 1;
        const isClientFatal = err.response && err.response.status >= 400 && err.response.status < 500 && err.response.status !== 429;
        const reachedMaxAttempts = attempts >= record.max_attempts;

        if (isClientFatal || reachedMaxAttempts) {
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
          console.error(`[CAPI-CRM Worker] ❌ Sự kiện #${record.id} thất bại vĩnh viễn (status: FAILED_PERMANENT):`, errMsg);
        } else {
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
          console.warn(`[CAPI-CRM Worker] ⚠️ Sự kiện #${record.id} thất bại tạm thời, retry sau ${backoffSeconds}s (Lần ${attempts}/${record.max_attempts}):`, errMsg);
        }
      }
    }

    return { processed: eventsToProcess.length, successCount, failedCount };

  } catch (err) {
    console.error('[CAPI-CRM Worker] Lỗi vòng lặp worker:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Kiểm tra kết nối Meta CAPI thuần túy (Read-only Ping)
 * - Xác minh tính hợp lệ của Token và Dataset
 * - TUYỆT ĐỐI KHÔNG gửi bất kỳ sự kiện hay giá trị doanh thu giả nào vào Dataset production
 */
async function checkCapiConnection() {
  const datasetId = (await getSetting('meta_dataset_id')) || DEFAULT_DATASET_ID;
  const accessToken = await getSetting('meta_capi_access_token');

  if (!accessToken || !datasetId) {
    return {
      success: false,
      error: 'MISSING_CREDENTIALS',
      message: 'Thiếu Meta Dataset ID hoặc CAPI Access Token trong bảng Settings'
    };
  }

  try {
    const debugRes = await axios.get(`https://graph.facebook.com/debug_token?input_token=${accessToken}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 10000
    });

    const tokenData = debugRes.data?.data || {};
    const scopes = tokenData.scopes || [];
    const granularScopes = tokenData.granular_scopes || [];
    
    let targetDatasets = [];
    granularScopes.forEach(gs => {
      if (gs.target_ids) {
        targetDatasets.push(...gs.target_ids);
      }
    });

    const isDatasetAuthorized = targetDatasets.length === 0 || targetDatasets.includes(String(datasetId));

    return {
      success: true,
      valid: tokenData.is_valid,
      app_id: tokenData.app_id,
      application: tokenData.application || 'Meta Conversions API',
      dataset_id: datasetId,
      is_dataset_authorized: isDatasetAuthorized,
      target_datasets: targetDatasets,
      scopes: scopes,
      message: 'Kết nối Meta Graph API thành công! Token và Dataset hợp lệ (Kiểm tra Read-only, không phát sinh sự kiện hay doanh thu ảo).'
    };
  } catch (err) {
    const errorData = err.response ? err.response.data?.error : err.message;
    return {
      success: false,
      error: 'TOKEN_VALIDATION_FAILED',
      message: (errorData && errorData.message) || err.message,
      details: errorData
    };
  }
}

/**
 * Gửi sự kiện kiểm thử cách ly trực tiếp đến Meta Events Manager (Test Events)
 * RÀNG BUỘC NGHIÊM NGẶT:
 * 1. BẮT BUỘC có testEventCode hợp lệ từ phiên Test Events đang mở trên Events Manager. Tuyệt đối không dùng mã hardcode 'TEST99999'!
 * 2. Mặc định chỉ gửi Lead và QualifiedLead. KHÔNG tự động gửi Purchase hoặc doanh thu giả vào Dataset production.
 * 3. Nếu Meta cảnh báo mã test không khớp phiên hoạt động, hệ thống bắt ngay cảnh báo và thông báo rõ cho Admin.
 */
async function sendIsolatedTestCrmEvents({ testEventCode = null, includePurchase = false } = {}) {
  const datasetId = (await getSetting('meta_dataset_id')) || DEFAULT_DATASET_ID;
  const accessToken = await getSetting('meta_capi_access_token');

  if (!accessToken || !datasetId) {
    return { success: false, error: 'MISSING_CREDENTIALS', message: 'Thiếu Meta Dataset ID hoặc CAPI Access Token' };
  }

  const cleanTestCode = (testEventCode || '').trim();

  // Guard 1: Chặn đứng mọi trường hợp không có mã test hoặc dùng mã hardcode TEST99999
  if (!cleanTestCode || cleanTestCode === 'TEST99999') {
    return {
      success: false,
      error: 'INVALID_OR_MISSING_TEST_CODE',
      message: 'Bắt buộc nhập mã Test Event Code thực tế từ tab Thử nghiệm sự kiện trên Meta Events Manager (VD: TEST12345). Tuyệt đối không để trống hoặc dùng mã giả lập TEST99999 để tránh ô nhiễm dữ liệu!'
    };
  }

  // Guard 2: Chỉ gửi Lead & QualifiedLead. Chỉ khi includePurchase=true mới gửi kèm Purchase tượng trưng giá trị 0đ
  const events = [
    buildCrmPayload({
      eventName: 'Lead',
      phone: '0901234567',
      email: 'test.lead@fittour.vn',
      externalId: 'test_lead_isolated_001',
      customData: {
        test_isolated: true,
        content_name: 'Tour Khảo Sát Thử Nghiệm CRM'
      }
    }),
    buildCrmPayload({
      eventName: 'QualifiedLead',
      phone: '0901234567',
      email: 'test.lead@fittour.vn',
      externalId: 'test_lead_isolated_001',
      customData: {
        test_isolated: true,
        lead_status: 'Tiềm năng',
        content_name: 'Tour Khảo Sát Thử Nghiệm CRM'
      }
    })
  ];

  if (includePurchase) {
    events.push(buildCrmPayload({
      eventName: 'Purchase',
      phone: '0901234567',
      email: 'test.lead@fittour.vn',
      externalId: 'test_lead_isolated_001',
      customData: {
        test_isolated: true,
        value: 0, // Giá trị an toàn tuyệt đối 0 VND
        currency: 'VND',
        booking_code: 'BK-TEST-CRM-ISOLATED',
        payment_method: 'Chuyển khoản (Kiểm thử cách ly)'
      }
    }));
  }

  const results = [];
  const metaUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${datasetId}/events`;
  let hasSessionMismatchWarning = false;
  let sessionWarningMessage = null;

  for (const evt of events) {
    const body = {
      data: [evt],
      access_token: accessToken,
      test_event_code: cleanTestCode
    };

    try {
      const res = await axios.post(metaUrl, body, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const messages = res.data?.messages || [];
      const mismatchMsg = messages.find(m => {
        const text = typeof m === 'string' ? m : (m && m.message ? m.message : JSON.stringify(m));
        return text.includes('does not match an active Test Events session');
      });
      if (mismatchMsg) {
        hasSessionMismatchWarning = true;
        sessionWarningMessage = typeof mismatchMsg === 'string' ? mismatchMsg : (mismatchMsg.message || JSON.stringify(mismatchMsg));
      }

      results.push({
        event: evt.event_name,
        success: !mismatchMsg,
        status: res.status,
        events_received: res.data?.events_received,
        fbtrace_id: res.data?.fbtrace_id,
        messages: messages
      });
    } catch (err) {
      results.push({
        event: evt.event_name,
        success: false,
        status: err.response?.status,
        error: err.response?.data?.error || err.message
      });
    }
  }

  if (hasSessionMismatchWarning) {
    return {
      success: false,
      warning: true,
      error: 'TEST_EVENT_CODE_MISMATCH',
      message: `Cảnh báo từ Meta: Mã test "${cleanTestCode}" không khớp với bất kỳ phiên Test Events nào đang mở cho Dataset này. Sự kiện đã được gửi nhưng sẽ KHÔNG xuất hiện trên màn hình Test Events. Vui lòng mở Events Manager -> Tab Thử nghiệm sự kiện và lấy đúng mã hiển thị tại đó!`,
      details: results
    };
  }

  const allSuccess = results.every(r => r.success);
  return {
    success: allSuccess,
    message: allSuccess ? `Gửi thành công ${results.length} sự kiện kiểm thử với mã ${cleanTestCode}. Hãy kiểm tra màn hình Test Events trên Meta!` : 'Có lỗi khi gửi một hoặc nhiều sự kiện test.',
    results
  };
}

module.exports = {
  META_GRAPH_VERSION,
  DEFAULT_DATASET_ID,
  sha256,
  normalizePhone,
  normalizeEmail,
  buildCrmPayload,
  isEligiblePurchaseBooking,
  evaluateSalesQualification,
  isCanaryEligible,
  enqueueCrmEvent,
  enqueueLead,
  enqueueQualifiedLead,
  enqueuePurchase,
  processCrmOutboxBatch,
  checkCapiConnection,
  sendIsolatedTestCrmEvents
};
