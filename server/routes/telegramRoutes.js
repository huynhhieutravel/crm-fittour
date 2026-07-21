const express = require('express');
const router = express.Router();
const telegramController = require('../controllers/telegramController');

router.post('/webhook', telegramController.handleWebhook);
router.get('/set-webhook', telegramController.setWebhook); // Manual trigger to set webhook

module.exports = router;
