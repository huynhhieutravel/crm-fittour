const express = require('express');
const router = express.Router();
const zaloV2Controller = require('../controllers/zaloV2Controller');

// TEST 1: Xác thực OAuth & Lấy Token
router.get('/auth/login', zaloV2Controller.login);
router.get('/auth/callback', zaloV2Controller.callback);
router.get('/test-connection', zaloV2Controller.testConnection);

// TEST 2 & 3: Webhook (Nhận tin nhắn & Phản hồi)
router.get('/webhook', zaloV2Controller.verifyWebhook);
router.post('/webhook', zaloV2Controller.handleWebhook);

// SANDBOX UI
router.get('/sandbox/messages', zaloV2Controller.getSandboxMessages);
router.post('/sandbox/reply', zaloV2Controller.replySandboxMessage);
router.delete('/sandbox/messages/:uid', zaloV2Controller.deleteSandboxMessages);

// --- AI Session Management ---
router.get('/ai-session/:zaloUid', zaloV2Controller.getAiSessionStatus);
router.get('/ai-session/:zaloUid/status', zaloV2Controller.getAiSessionStatus);
router.post('/ai-session/toggle', zaloV2Controller.toggleAiSession);

// --- ZNS Demo Module ---
router.post('/zns/demo-send', zaloV2Controller.sendZnsDemo);

module.exports = router;
