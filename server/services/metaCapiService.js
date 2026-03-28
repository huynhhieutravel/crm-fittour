/**
 * Meta Conversions API (CAPI) Service
 * 
 * Gửi sự kiện server-side về Meta qua Conversions API v25.0.
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
const axios = require('axios');
const crypto = require('crypto');
const db = require('../db');

const API_VERSION = 'v25.0';

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
      // User says use HASHED_PSID for external_id for better matching
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

    // 5. Build request body
    const requestBody = {
      data: [eventPayload]
    };

    // Add test_event_code if configured (for testing in Events Manager)
    if (testEventCode && testEventCode.trim() !== '') {
      requestBody.test_event_code = testEventCode.trim();
    }

    // 6. Send to Meta
    const url = `https://graph.facebook.com/${API_VERSION}/${datasetId}/events?access_token=${accessToken}`;
    
    console.log(`[CAPI] Sending event: ${eventName}`, {
      user_data_keys: Object.keys(user_data),
      custom_data: customData,
      test_mode: !!testEventCode
    });

    const response = await axios.post(url, requestBody);

    console.log(`[CAPI] ✅ Event "${eventName}" sent successfully.`, {
      events_received: response.data.events_received,
      fbtrace_id: response.data.fbtrace_id
    });

    return { success: true, data: response.data };

  } catch (error) {
    const errorData = error.response ? error.response.data : error.message;
    console.error(`[CAPI] ❌ Failed to send event "${eventName}":`, errorData);
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
  // Map CRM statuses to Meta event names
  // Map CRM statuses to Meta event names (Optimized for Ads performance)
  const statusEventMap = {
    'Mới': 'Lead',
    'Đã tư vấn': 'Contact',
    'Tư vấn lần 2': 'QualifiedLead', // Custom Event or QualifiedLead
    'Đặt cọc': 'InitiateCheckout',
    'Chốt đơn': 'Purchase',
  };

  const eventName = statusEventMap[newStatus] || 'Other';
  
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
