const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_BOOKING_ROLES = ['admin', 'manager', 'sales', 'operations'];

router.get('/', authenticateToken, roleCheck([...ALLOWED_BOOKING_ROLES, "group_manager"]), bookingController.getAllBookings);
router.post('/', authenticateToken, roleCheck(['admin', 'manager', 'sales', "group_manager"]), bookingController.createBooking);
router.post('/group', authenticateToken, roleCheck(['admin', 'manager', 'sales', "group_manager"]), bookingController.createGroupBooking);
router.get('/:id', authenticateToken, roleCheck([...ALLOWED_BOOKING_ROLES, "group_manager"]), bookingController.getBookingById);
router.put('/:id', authenticateToken, roleCheck(['admin', 'manager', 'sales', "group_manager"]), bookingController.updateBooking);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager', "group_manager"]), bookingController.deleteBooking);

// Sub-resources
router.post('/:id/transactions', authenticateToken, roleCheck(['admin', 'manager', 'sales', 'accountant', "group_manager"]), bookingController.addTransaction);
router.put('/passengers/:paxId', authenticateToken, roleCheck(ALLOWED_BOOKING_ROLES), bookingController.updatePassenger);

module.exports = router;
