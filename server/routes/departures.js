const express = require('express');
const router = express.Router();
const departureController = require('../controllers/departureController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_DEPARTURE_ROLES = ['admin', 'manager', 'operations'];

router.get('/', authenticateToken, roleCheck(['admin', 'manager', 'operations', 'sales', "group_manager"]), departureController.getAllDepartures);
router.post('/', authenticateToken, roleCheck(ALLOWED_DEPARTURE_ROLES), departureController.createDeparture);
router.get('/:id', authenticateToken, roleCheck(['admin', 'manager', 'operations', 'sales', "group_manager"]), departureController.getDepartureById);
router.get('/:id/bookings', authenticateToken, roleCheck(['admin', 'manager', 'operations', 'sales', "group_manager"]), departureController.getDepartureBookings);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_DEPARTURE_ROLES), departureController.updateDeparture);
router.post('/:id/duplicate', authenticateToken, roleCheck(ALLOWED_DEPARTURE_ROLES), departureController.duplicateDeparture);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager', "group_manager"]), departureController.deleteDeparture);

module.exports = router;
