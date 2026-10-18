/**
 * FIT TOUR - LIVE TEST SCRIPT CHO META CAPI V3
 * Gửi trực tiếp sự kiện kiểm thử đến Meta Dataset 835404925628132
 * Tuyệt đối không in token, không in PII, không tạo dữ liệu rác trong DB
 */

const axios = require('axios');
const db = require('../db');
const metaCapiV3 = require('../services/metaCapiV3Service');

const META_GRAPH_VERSION = 'v26.0';
const DEFAULT_DATASET_ID = '835404925628132';
const DEFAULT_PAGE_ID = '107694084435854';

async function runLiveTest({
  eventName = 'LeadSubmitted',
  testEventCode = null,
  psid = null,
  pageId = DEFAULT_PAGE_ID,
  useSystemUserToken = false
} = {}) {
  // 1. Đọc credentials an toàn
  const datasetRes = await db.query("SELECT value FROM settings WHERE key = 'meta_dataset_id'");
  const datasetId = (datasetRes.rows[0] && datasetRes.rows[0].value) || DEFAULT_DATASET_ID;

  const tokenKey = useSystemUserToken ? 'meta_system_user_token' : 'meta_capi_access_token';
  const tokenRes = await db.query("SELECT value FROM settings WHERE key = $1", [tokenKey]);
  const accessToken = tokenRes.rows[0] ? tokenRes.rows[0].value : null;

  if (!accessToken || !accessToken.trim()) {
    console.error(`[LIVE-TEST] ❌ Không tìm thấy ${tokenKey} trong settings.`);
    return { success: false, error: 'MISSING_TOKEN' };
  }

  // 2. Chuẩn bị định danh thử nghiệm
  const targetPageId = pageId || DEFAULT_PAGE_ID;
  const targetPsid = psid || '28469636549326815'; // PSID của hội thoại nội bộ thử nghiệm

  // 3. Dựng payload chuẩn Business Messaging v3
  const now = new Date();
  const eventTimeUnix = Math.floor(now.getTime() / 1000);
  const eventId = `fittour_bm_live_test_${eventName.toLowerCase()}_${eventTimeUnix}`;

  let customData = {
    test_run: true,
    test_name: 'FIT TOUR CAPI Live Test'
  };

  if (eventName === 'LeadSubmitted') {
    customData.lead_source = 'Click-to-Messenger Live Test';
    customData.content_name = 'Tour Khảo Sát Thử Nghiệm';
  } else if (eventName === 'QualifiedLead') {
    customData.lead_status = 'Tiềm năng';
    customData.classification = 'Đạt chuẩn Sales';
  } else if (eventName === 'Purchase') {
    customData.booking_code = `BK-TEST-LIVE-${eventTimeUnix}`;
    customData.value = 1000000;
    customData.currency = 'VND';
    customData.value_measurement_policy = 'paid_amount';
    customData.payment_method = 'Chuyển khoản (Kiểm thử cách ly)';
  }

  const payload = metaCapiV3.buildBusinessMessagingPayload({
    eventName,
    psid: targetPsid,
    pageId: targetPageId,
    phone: '0901234567',
    email: 'livetest@fittour.vn',
    customData,
    eventTime: now,
    eventId
  });

  // 4. Request Body
  const requestBody = {
    data: [payload],
    access_token: accessToken
  };

  const cleanTestCode = (testEventCode || '').trim();
  if (cleanTestCode) {
    requestBody.test_event_code = cleanTestCode;
  }

  const metaUrl = `https://graph.facebook.com/${META_GRAPH_VERSION}/${datasetId}/events`;

  console.log(`[LIVE-TEST] ========================================================`);
  console.log(`[LIVE-TEST] GỬI SỰ KIỆN: ${eventName}`);
  console.log(`[LIVE-TEST] Endpoint: POST ${metaUrl}`);
  console.log(`[LIVE-TEST] Dataset ID: ${datasetId}`);
  console.log(`[LIVE-TEST] Page ID: ${targetPageId}`);
  console.log(`[LIVE-TEST] PSID (masked): ${targetPsid.substring(0, 4)}***${targetPsid.slice(-4)}`);
  console.log(`[LIVE-TEST] Action Source: ${payload.action_source}`);
  console.log(`[LIVE-TEST] Messaging Channel: ${payload.messaging_channel}`);
  console.log(`[LIVE-TEST] Test Event Code: ${cleanTestCode || '(KHÔNG CÓ - SẼ ĐI VÀO DATASET TRỰC TIẾP)'}`);
  console.log(`[LIVE-TEST] Token Dùng: ${tokenKey} (Length: ${accessToken.length})`);
  console.log(`[LIVE-TEST] ========================================================`);

  try {
    const response = await axios.post(metaUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    console.log(`[LIVE-TEST] ✅ THÀNH CÔNG!`);
    console.log(`[LIVE-TEST] HTTP Status: ${response.status} ${response.statusText}`);
    console.log(`[LIVE-TEST] Events Received: ${response.data?.events_received}`);
    console.log(`[LIVE-TEST] FBTrace ID: ${response.data?.fbtrace_id}`);
    if (response.data?.messages && response.data.messages.length > 0) {
      console.log(`[LIVE-TEST] Messages từ Meta:`, response.data.messages);
    }

    return {
      success: true,
      http_status: response.status,
      events_received: response.data?.events_received,
      fbtrace_id: response.data?.fbtrace_id,
      messages: response.data?.messages || [],
      test_event_code: cleanTestCode || null
    };

  } catch (err) {
    const status = err.response ? err.response.status : (err.code || 500);
    const errData = err.response?.data?.error;

    let errMsg = errData?.message || err.message || 'Lỗi gửi Meta Graph API';
    if (accessToken) errMsg = errMsg.split(accessToken).join('[REDACTED_TOKEN]');

    console.log(`[LIVE-TEST] ❌ META TRẢ LỖI!`);
    console.log(`[LIVE-TEST] HTTP Status: ${status}`);
    console.log(`[LIVE-TEST] Meta Error Code: ${errData?.code || 'N/A'}`);
    console.log(`[LIVE-TEST] Meta Error Subcode: ${errData?.error_subcode || 'N/A'}`);
    console.log(`[LIVE-TEST] Error Type: ${errData?.type || 'N/A'}`);
    console.log(`[LIVE-TEST] Error Message: ${errMsg}`);
    console.log(`[LIVE-TEST] FBTrace ID: ${errData?.fbtrace_id || err.response?.data?.fbtrace_id || 'N/A'}`);

    return {
      success: false,
      http_status: status,
      error_code: errData?.code,
      error_subcode: errData?.error_subcode,
      error_type: errData?.type,
      error_message: errMsg,
      fbtrace_id: errData?.fbtrace_id || err.response?.data?.fbtrace_id || null
    };
  }
}

// Cho phép chạy qua CLI: node live_test_meta_capi.js LeadSubmitted [TEST_CODE] [PSID]
if (require.main === module) {
  const eventName = process.argv[2] || 'LeadSubmitted';
  const testCode = process.argv[3] || process.env.META_TEST_EVENT_CODE || null;
  const psid = process.argv[4] || null;

  runLiveTest({ eventName, testEventCode: testCode, psid })
    .then((res) => {
      console.log('\n--- KẾT QUẢ CUỐI CÙNG ---');
      console.log(JSON.stringify(res, null, 2));
      process.exit(res.success ? 0 : 1);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}

module.exports = { runLiveTest };
