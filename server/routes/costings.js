const express = require('express');
const router = express.Router();
const costingController = require('../controllers/costingController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_ROLES = ['admin', 'manager', 'operations'];

router.get('/', authenticateToken, roleCheck(ALLOWED_ROLES), costingController.getAllCostings);
router.get('/:tour_departure_id', authenticateToken, roleCheck(ALLOWED_ROLES), costingController.getCostingByDeparture);
router.post('/:tour_departure_id', authenticateToken, roleCheck(ALLOWED_ROLES), costingController.saveCosting);

module.exports = router;
