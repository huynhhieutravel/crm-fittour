const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const metaCapi = require('../services/metaCapiService');

// 1. Lấy tất cả cài đặt (Admin/Manager only)
router.get('/', auth, admin, async (req, res) => {
    try {
        const result = await db.query('SELECT key, value, description FROM settings');
        const settings = {};
        result.rows.forEach(row => {
            settings[row.key] = row.value;
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

// 2. Cập nhật cài đặt
router.post('/update', auth, admin, async (req, res) => {
    const { settings } = req.body; // { key: value, ... }
    try {
        for (const [key, value] of Object.entries(settings)) {
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

module.exports = router;
