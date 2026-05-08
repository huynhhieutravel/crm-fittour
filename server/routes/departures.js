const express = require('express');
const router = express.Router();
const departureController = require('../controllers/departureController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny, permCheckOrOwner } = require('../middleware/permCheck');

router.get('/', authenticateToken, permCheckAny([['op_tours','view_all'], ['op_tours','view_own']]), departureController.getAllDepartures);
router.post('/', authenticateToken, permCheck('op_tours', 'create'), departureController.createDeparture);
router.get('/:id', authenticateToken, permCheckAny([['op_tours','view_all'], ['op_tours','view_own']]), departureController.getDepartureById);
router.get('/:id/bookings', authenticateToken, permCheckAny([['bookings','view_all'], ['bookings','view_own']]), departureController.getDepartureBookings);
router.put('/:id', authenticateToken, permCheckOrOwner('op_tours', 'edit', 'tour_departures', 'id', 'operator_id'), departureController.updateDeparture);
router.post('/:id/duplicate', authenticateToken, permCheck('op_tours', 'clone'), departureController.duplicateDeparture);
router.delete('/:id', authenticateToken, permCheckOrOwner('op_tours', 'delete', 'tour_departures', 'id', 'operator_id'), departureController.deleteDeparture);

module.exports = router;
