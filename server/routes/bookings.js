const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny } = require('../middleware/permCheck');

router.get('/', authenticateToken, permCheckAny([['bookings','view_all'], ['bookings','view_own']]), bookingController.getAllBookings);
router.post('/', authenticateToken, permCheck('bookings', 'create'), bookingController.createBooking);
router.post('/group', authenticateToken, permCheck('bookings', 'create'), bookingController.createGroupBooking);
router.get('/:id', authenticateToken, permCheckAny([['bookings','view_all'], ['bookings','view_own']]), bookingController.getBookingById);
router.put('/:id', authenticateToken, permCheckAny([['bookings','edit_all'], ['bookings','edit_own']]), bookingController.updateBooking);
router.delete('/:id', authenticateToken, permCheck('bookings', 'delete'), bookingController.deleteBooking);

// Sub-resources
router.post('/:id/transactions', authenticateToken, permCheck('vouchers', 'create'), bookingController.addTransaction);
router.put('/passengers/:paxId', authenticateToken, permCheckAny([['bookings','edit_all'], ['bookings','edit_own']]), bookingController.updatePassenger);

module.exports = router;
