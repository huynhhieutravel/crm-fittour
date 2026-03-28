const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const metaCapi = require('../services/metaCapiService');

// 1. Lấy tất cả cài đặt
router.get('/', auth, async (req, res) => {
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

// 2. Cập nhật cài đặt
router.post('/update', auth, async (req, res) => {
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
router.post('/test-capi', auth, async (req, res) => {
    try {
        console.log('[CAPI] Manual test triggered from UI');
        const result = await metaCapi.sendEvent('Lead', {
            email: 'test@example.com',
            phone: '0901234567',
            facebook_psid: 'test_psid_123'
        }, {
            note: 'Test event from CRM Settings UI'
        });

        if (result.success) {
            res.json({ success: true, message: 'Gửi sự kiện test thành công! Kiểm tra tab Thử nghiệm sự kiện trên Meta.' });
        } else {
            res.status(400).json({ success: false, error: result.error || 'Gửi thất bại' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
