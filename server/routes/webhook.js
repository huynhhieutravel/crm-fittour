const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Verification endpoint for Facebook
router.get('/facebook', webhookController.verifyWebhook);

// Handling incoming messages
router.post('/facebook', webhookController.handleWebhookEvent);

module.exports = router;
