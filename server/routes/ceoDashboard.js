const express = require('express');
const router = express.Router();
const ceoDashboardController = require('../controllers/ceoDashboardController');
const authenticateToken = require('../middleware/auth');

router.get('/departures', authenticateToken, ceoDashboardController.getCEODeparturesOverview);
router.get('/drill-down', authenticateToken, ceoDashboardController.getDrilldownData);

module.exports = router;
