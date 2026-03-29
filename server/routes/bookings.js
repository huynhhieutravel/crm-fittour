const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_BOOKING_ROLES = ['admin', 'manager', 'sales', 'operations'];

router.get('/', authenticateToken, roleCheck(ALLOWED_BOOKING_ROLES), bookingController.getAllBookings);
router.post('/', authenticateToken, roleCheck(['admin', 'manager', 'sales']), bookingController.createBooking);
router.post('/group', authenticateToken, roleCheck(['admin', 'manager', 'sales']), bookingController.createGroupBooking);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_BOOKING_ROLES), bookingController.getBookingById);
router.put('/:id', authenticateToken, roleCheck(['admin', 'manager', 'sales']), bookingController.updateBooking);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager']), bookingController.deleteBooking);

module.exports = router;
