const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const authMiddleware = require('../middleware/auth');

// ══ Webhook (không cần auth — dùng HMAC) ══
router.post('/incoming', emailController.incomingWebhook);

// ══ Rate check (Worker gọi — không cần auth) ══
router.get('/rate-check', emailController.rateCheck);

// ══ Tất cả routes dưới đây cần đăng nhập ══
router.use(authMiddleware);

// ══ Mailbox Admin (static paths FIRST, before /:id) ══
router.get('/mailboxes', emailController.listMailboxes);
router.post('/mailboxes', emailController.createMailbox);
router.put('/mailboxes/:id', emailController.updateMailbox);
router.delete('/mailboxes/:id', emailController.deleteMailbox);

// Email list + static paths
router.get('/', emailController.listEmails);
router.get('/unread-count', emailController.getUnreadCount);
router.get('/search', emailController.searchEmails);
router.get('/threads', emailController.getThread);

// Param-based paths (AFTER static paths)
router.get('/:id', emailController.getEmail);

// Actions
router.post('/send', emailController.sendEmail);
router.post('/reply/:id', emailController.replyEmail);
router.post('/forward/:id', emailController.forwardEmail);
router.post('/drafts', emailController.saveDraft);

// Updates
router.put('/:id', emailController.updateEmail);
router.put('/:id/move', emailController.moveEmail);
router.delete('/:id', emailController.deleteEmail);

module.exports = router;
