const express = require('express');
const router = express.Router();
const controller = require('../controllers/departureCashflowController');
const verifyToken = require('../middleware/auth');

// Public endpoints (no login required)
router.get('/public-share/:token', controller.getPublicDepartureShare);

// Protected endpoints (requires valid token)
router.get('/stats', verifyToken, controller.getCashflowStats);
router.get('/personal', verifyToken, controller.getPersonalCashflow);
router.get('/departures/:id/quick-logistics', verifyToken, controller.getDepartureQuickLogistics);
router.put('/departures/:id/quick-logistics', verifyToken, controller.saveDepartureQuickLogistics);
router.post('/departures/:id/share-link', verifyToken, controller.generateDepartureShareLink);

module.exports = router;
