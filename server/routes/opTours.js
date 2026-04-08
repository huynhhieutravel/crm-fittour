const express = require('express');
const router = express.Router();
const controller = require('../controllers/opTourController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_ROLES = ['admin', 'manager', 'group_manager']; 

router.get('/public', controller.getPublicOpTours);
router.get('/', authenticateToken, roleCheck(ALLOWED_ROLES.concat(['group_staff', 'sales', 'marketing'])), controller.getAllOpTours);
router.post('/', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createOpTour);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_ROLES.concat(['group_staff', 'sales', 'marketing'])), controller.getOpTourById);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateOpTour);
router.delete('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteOpTour);

// Bookings / Revenues
// Bookings / Revenues
router.get('/:id/bookings', authenticateToken, controller.getOpTourBookings);
router.post('/:id/bookings', authenticateToken, roleCheck(['admin', 'manager', 'group_manager', 'sales', 'group_staff']), controller.addOpTourBooking);
router.put('/:id/bookings/:bookingId', authenticateToken, roleCheck(['admin', 'manager', 'group_manager', 'sales', 'group_staff']), controller.updateOpTourBooking);

module.exports = router;
