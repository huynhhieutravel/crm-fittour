const express = require('express');
const router = express.Router();
const managementController = require('../controllers/managementController');
const authMiddleware = require('../middleware/auth');

// Protected route: require authentication
router.get('/overview', authMiddleware, managementController.getFullDashboardMetrics);

module.exports = router;
