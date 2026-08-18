/**
 * Routes: Quản lý Cài đặt Zalo AI Agent & Knowledge Base
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/zaloAiAgentController');
const verifyToken = require('../middleware/auth');

// Settings API
router.get('/settings', verifyToken, controller.getSettings);
router.post('/settings', verifyToken, controller.updateSettings);

// Knowledge Base (RAG) API
router.get('/knowledge', verifyToken, controller.getKnowledgeList);
router.post('/knowledge', verifyToken, controller.createKnowledge);
router.put('/knowledge/:id', verifyToken, controller.updateKnowledge);
router.delete('/knowledge/:id', verifyToken, controller.deleteKnowledge);

// Test Playground API
router.post('/test-chat', verifyToken, controller.testAiResponse);

module.exports = router;
