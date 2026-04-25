const express = require('express');
const router = express.Router();
const controller = require('../controllers/opTourController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny } = require('../middleware/permCheck');

// Public
router.get('/public', controller.getPublicOpTours);

// List & View: cần view_all hoặc view_own
router.get('/', authenticateToken, permCheckAny([['op_tours','view_all'], ['op_tours','view_own']]), controller.getAllOpTours);
router.get('/:id', authenticateToken, permCheckAny([['op_tours','view_all'], ['op_tours','view_own']]), controller.getOpTourById);

// Create / Edit / Delete
router.post('/bulk-delete', authenticateToken, permCheck('op_tours', 'delete'), controller.bulkDeleteOpTours);
router.post('/', authenticateToken, permCheck('op_tours', 'create'), controller.createOpTour);
router.put('/:id', authenticateToken, permCheck('op_tours', 'edit'), controller.updateOpTour);
router.delete('/:id', authenticateToken, permCheck('op_tours', 'delete'), controller.deleteOpTour);

// Bookings / Revenues
router.get('/:id/bookings', authenticateToken, permCheckAny([['bookings','view_all'], ['bookings','view_own']]), controller.getOpTourBookings);
router.post('/:id/bookings', authenticateToken, permCheck('bookings', 'create'), controller.addOpTourBooking);
router.put('/:id/bookings/:bookingId', authenticateToken, permCheckAny([['bookings','edit_all'], ['bookings','edit_own']]), controller.updateOpTourBooking);
router.put('/:id/bookings/:bookingId/transfer', authenticateToken, permCheckAny([['bookings','edit_all'], ['bookings','edit_own']]), controller.transferOpTourBooking);
router.delete('/:id/bookings/:bookingId', authenticateToken, permCheck('bookings', 'delete'), controller.deleteOpTourBooking);

module.exports = router;
