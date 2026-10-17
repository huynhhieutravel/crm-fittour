/**
 * Meta Conversions API (CAPI) Service
 * 
 * Gửi sự kiện server-side về Meta qua Conversions API v25.0.
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
const axios = require('axios');
const crypto = require('crypto');
const db = require('../db');

const API_VERSION = 'v26.0';

// Helper: SHA-256 hash (Meta requires hashed user data)
const sha256 = (value) => {
  if (!value) return null;
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
};

// Helper: Get setting from DB
const getSetting = async (key) => {
  try {
    const res = await db.query('SELECT value FROM settings WHERE key = $1', [key]);
    return res.rows.length > 0 ? res.rows[0].value : null;
  } catch (err) {
    console.error(`[CAPI] Error reading setting ${key}:`, err.message);
    return null;
  }
};

/**
 * Send an event to Meta Conversions API
 * 
 * @param {string} eventName - Standard event name (Lead, Purchase, InitiateCheckout, etc.)
 * @param {object} userData - User data for matching { email, phone, facebook_psid, meta_lead_id, fbclid }
 * @param {object} customData - Custom event data { lead_status, tour_name, value, currency, etc. }
 * @param {string} eventSourceUrl - URL where the event occurred (optional)
 */
exports.sendEvent = async (eventName, userData = {}, customData = {}, eventSourceUrl = null) => {
  try {
    // 1. Check if CAPI is enabled
    const capiEnabled = await getSetting('meta_capi_enabled');
    if (capiEnabled !== 'true') {
      console.log(`[CAPI] Disabled. Skipping event: ${eventName}`);
      return { success: false, reason: 'CAPI disabled' };
    }

    // 1.1 De-conflict with CAPI v3 (Business Messaging):
    // Nếu v3 đang bật và user có facebook_psid (kênh Messenger), bàn giao quyền cho v3, tránh duplicate event
    const v3Enabled = await getSetting('meta_capi_business_messaging_v3_enabled');
    if (v3Enabled === 'true' && userData.facebook_psid) {
      console.log(`[CAPI Legacy] Đã phân luồng sang CAPI v3 Business Messaging cho khách có PSID. Bỏ qua legacy CAPI.`);
      return { success: true, reason: 'DELEGATED_TO_V3' };
    }

    // 2. Get credentials
    const accessToken = await getSetting('meta_capi_access_token');
    const datasetId = await getSetting('meta_dataset_id');
    const testEventCode = await getSetting('meta_test_event_code');

    if (!accessToken || !datasetId) {
      console.error('[CAPI] Missing access_token or dataset_id. Configure in Settings.');
      return { success: false, reason: 'Missing credentials' };
    }

    // 3. Build user_data (hash PII fields)
    const user_data = {};
    
    if (userData.email) {
      user_data.em = [sha256(userData.email)];
    }
    if (userData.phone) {
      // Normalize phone: remove spaces, add country code if needed
      let phone = userData.phone.replace(/[\s\-\(\)]/g, '');
      if (phone.startsWith('0')) phone = '84' + phone.substring(1); // Vietnam +84
      user_data.ph = [sha256(phone)];
    }
    if (userData.facebook_psid) {
      user_data.external_id = [sha256(userData.facebook_psid)];
      user_data.fb_login_id = userData.facebook_psid;
    }
    if (userData.meta_lead_id) {
      user_data.lead_id = userData.meta_lead_id;
    }
    if (userData.fbclid) {
      user_data.fbc = `fb.1.${Date.now()}.${userData.fbclid}`;
    }

    // 4. Build event payload
    const eventPayload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: `${eventName.toLowerCase()}_${customData.lead_id || 'unknown'}_${Date.now()}`,
      action_source: 'system_generated',
      user_data: user_data,
      custom_data: {
        lead_event_source: 'FIT Tour CRM',
        event_source: 'crm',
        ...customData
      }
    };

    if (eventSourceUrl) {
      eventPayload.event_source_url = eventSourceUrl;
    }

    // 5. Build request body (Bảo mật: Token truyền qua Header và Body, KHÔNG để trên query URL để tránh lọt vào log Nginx/Axios)
    const requestBody = {
      data: [eventPayload],
      access_token: accessToken
    };

    // Add test_event_code if configured (for testing in Events Manager)
    if (testEventCode && testEventCode.trim() !== '') {
      requestBody.test_event_code = testEventCode.trim();
    }

    // 6. Send to Meta (Clean URL without token query param)
    const url = `https://graph.facebook.com/${API_VERSION}/${datasetId}/events`;
    
    console.log(`[CAPI Legacy] Payload for event: ${eventName} (Clean URL)`);

    const response = await axios.post(url, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`[CAPI Legacy] ✅ Event "${eventName}" sent successfully.`, {
      events_received: response.data.events_received,
      fbtrace_id: response.data.fbtrace_id
    });

    return { success: true, data: response.data };

  } catch (error) {
    const errorData = error.response ? error.response.data : error.message;
    console.error(`[CAPI Legacy] ❌ Failed to send event "${eventName}":`, errorData);
    return { success: false, error: errorData };
  }
};

/**
 * Send a Lead event (when a new lead is created)
 */
exports.sendLeadEvent = async (lead) => {
  return exports.sendEvent('Lead', {
    email: lead.email,
    phone: lead.phone,
    facebook_psid: lead.facebook_psid,
    meta_lead_id: lead.meta_lead_id,
    fbclid: lead.fbclid
  }, {
    lead_id: lead.id,
    lead_source: lead.source,
    content_name: lead.tour_name || 'General Inquiry'
  });
};

/**
 * Send a Purchase event (when lead status changes to "Chốt đơn")
 */
exports.sendPurchaseEvent = async (lead, tourName, value = 0) => {
  return exports.sendEvent('Purchase', {
    email: lead.email,
    phone: lead.phone,
    facebook_psid: lead.facebook_psid,
    meta_lead_id: lead.meta_lead_id,
    fbclid: lead.fbclid
  }, {
    lead_id: lead.id,
    content_name: tourName || lead.tour_name || 'Tour FIT TOUR',
    value: value,
    currency: 'VND'
  });
};

/**
 * Send a status change event (for intermediate stages)
 */
exports.sendStatusChangeEvent = async (lead, newStatus, tourName = null, value = 0) => {
  // Quy tắc phân luồng: Tuyệt đối KHÔNG gửi Purchase từ việc đổi trạng thái Lead (tránh giá tour niêm yết ảo & trùng lặp với Booking).
  // Purchase được kích hoạt độc quyền từ Booking hợp lệ trong bookingController.
  if (newStatus === 'Chốt đơn') {
    console.log(`[CAPI Legacy] Bỏ qua gửi Purchase từ trạng thái Lead "Chốt đơn". Sự kiện Purchase được quản lý độc quyền qua Booking thực tế.`);
    return { success: true, reason: 'PURCHASE_DELEGATED_TO_BOOKING' };
  }

  // Đối với 'Đang liên hệ': Nếu CAPI v3 đang bật, bỏ qua hoàn toàn vì tiêu chuẩn QualifiedLead v3 yêu cầu Sales xác nhận nghiệp vụ
  const v3Enabled = await getSetting('meta_capi_business_messaging_v3_enabled');
  if (v3Enabled === 'true') {
    console.log(`[CAPI Legacy] CAPI v3 đang bật. Bỏ qua gửi Lead từ trạng thái "${newStatus}" để tránh duplicate tín hiệu.`);
    return { success: true, reason: 'DELEGATED_TO_V3' };
  }

  const STATUS_TO_EVENT = {
    'Đang liên hệ': 'Lead'
  };

  const eventName = STATUS_TO_EVENT[newStatus];
  
  if (!eventName) {
    console.log(`[CAPI Legacy] Bỏ qua, không gửi event cho trạng thái: ${newStatus}`);
    return { success: true, reason: 'Status ignored' };
  }
  
  return exports.sendEvent(eventName, {
    email: lead.email,
    phone: lead.phone,
    facebook_psid: lead.facebook_psid,
    meta_lead_id: lead.meta_lead_id,
    fbclid: lead.fbclid
  }, {
    lead_id: lead.id,
    lead_status: newStatus,
    content_name: tourName || lead.tour_name || 'Tour FIT TOUR',
    value: value || 0,
    currency: 'VND'
  });
};
