const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, bookingController.getAllBookings);
router.post('/', authenticateToken, bookingController.createBooking);
router.get('/:id', authenticateToken, bookingController.getBookingById);
router.put('/:id', authenticateToken, bookingController.updateBooking);
router.delete('/:id', authenticateToken, bookingController.deleteBooking);

module.exports = router;
