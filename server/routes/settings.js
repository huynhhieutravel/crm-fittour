const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const metaCapi = require('../services/metaCapiService');

const SENSITIVE_KEYS = [
    'meta_capi_access_token',
    'meta_page_access_token',
    'meta_system_user_token',
    'meta_app_secret',
    'zalo_access_token',
    'zalo_refresh_token',
    'zalo_secret_key',
    'gemini_api_key',
    'jwt_secret'
];
const MASK_PLACEHOLDER = '••••••••••••••••';

// 1. Lấy tất cả cài đặt (Admin/Manager only) - Che toàn bộ token nhạy cảm
router.get('/', auth, admin, async (req, res) => {
    try {
        const result = await db.query('SELECT key, value, description FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            if (SENSITIVE_KEYS.includes(row.key)) {
                const hasValue = Boolean(row.value && String(row.value).trim() !== '');
                settings[row.key] = hasValue ? MASK_PLACEHOLDER : '';
                settings[`${row.key}_configured`] = hasValue;
            } else {
                settings[row.key] = row.value;
            }
        });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1.1 Lấy Visa Checklist Template (Public cho staff)
router.get('/visa-checklist', auth, async (req, res) => {
    try {
        const result = await db.query("SELECT value FROM settings WHERE key = 'visa_checklist_template'");
        if (result.rows.length > 0 && result.rows[0].value) {
            let data = result.rows[0].value;
            // Parse if it's string (sometimes Postgres JSONB is returned as object, sometimes string if stored as text)
            if (typeof data === 'string') {
                try { data = JSON.parse(data); } catch(e){}
            }
            res.json(data);
        } else {
            res.json(null);
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1.2 Cập nhật Visa Checklist Template (Admin/Manager only)
router.post('/visa-checklist', auth, admin, async (req, res) => {
    try {
        const { template } = req.body;
        // Stringify if needed, or store as JSONB (assuming the column is jsonb or text)
        const valueToStore = typeof template === 'object' ? JSON.stringify(template) : template;
        await db.query(
            "INSERT INTO settings (key, value) VALUES ('visa_checklist_template', $1) ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()",
            [valueToStore]
        );
        res.json({ success: true, message: 'Đã cập nhật danh mục Master Checklist' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Cập nhật cài đặt - Bảo vệ chống ghi đè rỗng/mask vào token bí mật
router.post('/update', auth, admin, async (req, res) => {
    const { settings } = req.body; // { key: value, ... }
    try {
        for (const [key, value] of Object.entries(settings)) {
            // Guard: Nếu là sensitive key và giá trị nhận được là chuỗi mask hoặc rỗng thì KHÔNG ghi đè vào DB!
            if (SENSITIVE_KEYS.includes(key)) {
                if (!value || typeof value !== 'string' || value.startsWith('••••') || value === '__CONFIGURED__') {
                    continue; // Skip update to preserve secret
                }
            }
            await db.query(
                'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
                [key, value]
            );
        }
        res.json({ success: true, message: 'Đã cập nhật cài đặt thành công!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Test CAPI Connection
router.post('/test-capi', auth, admin, async (req, res) => {
    try {
        console.log('[CAPI] Manual test triggered from UI - Sending Test Suite (Lead, Contact, Purchase)');
        
        const testUser = {
            email: 'test@fittour.com',
            phone: '0901234567',
            facebook_psid: 'test_psid_123'
        };

        const results = [];

        // 1. Sent Lead 
        const leadRes = await metaCapi.sendEvent('Lead', testUser, { note: 'Test Lead from CRM' });
        results.push({ event: 'Lead', success: leadRes.success });

        // 2. Sent Contact
        const contactRes = await metaCapi.sendEvent('Contact', testUser, { note: 'Test Contact from CRM' });
        results.push({ event: 'Contact', success: contactRes.success });

        // 3. Sent Purchase
        const purchaseRes = await metaCapi.sendEvent('Purchase', testUser, { 
            note: 'Test Purchase from CRM',
            value: 25000000,
            currency: 'VND',
            content_name: 'Tour Test Châu Âu'
        });
        results.push({ event: 'Purchase', success: purchaseRes.success });

        const allSuccess = results.every(r => r.success);

        if (allSuccess) {
            res.json({ success: true, message: 'Gửi thành công chuỗi sự kiện test (Lead, Contact, Purchase)! Hãy kiểm tra payload trong Terminal và tab Diagnostics trên Meta.' });
        } else {
            res.status(400).json({ success: false, error: 'Có lỗi khi gửi một hoặc nhiều sự kiện', details: results });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Xác minh quyền Meta Token thực tế (Admin only, Không in secret)
router.get('/verify-meta-permissions', auth, admin, async (req, res) => {
    try {
        const metaCapiV3 = require('../services/metaCapiV3Service');
        const verification = await metaCapiV3.verifyTokenPermissions();
        res.json(verification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Kiểm thử chuỗi 3 sự kiện (LeadSubmitted, QualifiedLead, Purchase) trên môi trường cách ly cho Business Messaging v3
// KHÔNG TẠO BOOKING GIẢ, KHÔNG TẠO PHIẾU THU GIẢ TRONG PRODUCTION DB
router.post('/test-business-messaging-isolated', auth, admin, async (req, res) => {
    try {
        const { test_event_code, page_id, psid } = req.body;
        const metaCapiV3 = require('../services/metaCapiV3Service');
        const result = await metaCapiV3.sendIsolatedTestEvents({
            testEventCode: test_event_code,
            pageId: page_id,
            customPsid: psid
        });
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 6. Kiểm thử chuỗi 3 sự kiện (Lead, QualifiedLead, Purchase) cách ly cho CRM Standard CAPI (action_source: system_generated)
// KHÔNG TẠO BOOKING GIẢ, KHÔNG TẠO PHIẾU THU GIẢ TRONG PRODUCTION DB
router.post('/test-crm-capi-isolated', auth, admin, async (req, res) => {
    try {
        const { test_event_code } = req.body;
        const metaCapiCrm = require('../services/metaCapiCrmService');
        const result = await metaCapiCrm.sendIsolatedTestCrmEvents({
            testEventCode: test_event_code
        });
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 7. Lấy báo cáo trạng thái Outbox và Feature Flags của Meta CAPI
router.get('/crm-capi-status', auth, admin, async (req, res) => {
    try {
        const stats = await db.query(`
            SELECT 
                action_source,
                event_name,
                status,
                COUNT(*) as count
            FROM meta_capi_events
            GROUP BY action_source, event_name, status
            ORDER BY action_source, event_name, status;
        `);
        const flags = await db.query(`
            SELECT key, value FROM settings 
            WHERE key IN ('meta_capi_enabled', 'meta_capi_crm_enabled', 'meta_capi_business_messaging_v3_enabled', 'meta_dataset_id', 'meta_capi_purchase_value_source')
        `);
        res.json({
            success: true,
            flags: flags.rows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {}),
            outboxStats: stats.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
