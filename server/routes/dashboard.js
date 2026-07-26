const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const verifyToken = require('../middleware/auth');

router.get('/overview', verifyToken, dashboardController.getOverviewStats);
router.get('/leader-overview', verifyToken, dashboardController.getLeaderOverview);
router.get('/employee-profile/:id', verifyToken, dashboardController.getEmployeeProfile);

module.exports = router;
