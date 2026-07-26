const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth'); // Assuming you have standard auth middleware

// Lấy danh sách email bị lỗi
router.get('/dlq', auth, notificationController.getDLQ);

// Lấy danh sách email đã gửi (Lịch sử)
router.get('/sent', auth, notificationController.getSentLogs);

// Thống kê dashboard
router.get('/stats', auth, notificationController.getStats);

// Gửi lại email bị lỗi
router.post('/dlq/:id/replay', auth, notificationController.replayDLQ);

// Lấy danh sách email bị khóa (Hard Bounced / Cấm gửi)
router.get('/suppression', auth, notificationController.getSuppressionList);

// Mở khóa email bị cấm
router.delete('/suppression/:email', auth, notificationController.unbanEmail);
// --- In-App Notifications ---
router.get('/in-app', auth, notificationController.getInAppNotifications);
router.get('/global-center', auth, notificationController.getGlobalCenterLeads);
router.put('/in-app/read-all', auth, notificationController.markAllAsRead);
router.put('/in-app/:id/read', auth, notificationController.markAsRead);
router.post('/subscribe', auth, notificationController.subscribe);

module.exports = router;
