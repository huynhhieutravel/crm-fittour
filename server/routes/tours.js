const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_TOUR_ROLES = ['admin', 'manager', 'operations'];

router.get('/', authenticateToken, roleCheck(['admin', 'manager', 'operations', 'sales']), tourController.getAllTours);
router.post('/', authenticateToken, roleCheck(ALLOWED_TOUR_ROLES), tourController.createTour);
router.get('/:id', authenticateToken, roleCheck(['admin', 'manager', 'operations', 'sales']), tourController.getTourById);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_TOUR_ROLES), tourController.updateTour);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager']), tourController.deleteTour);
router.get('/:id/notes', authenticateToken, roleCheck(['admin', 'manager', 'operations', 'sales']), tourController.getTourNotes);
router.post('/notes', authenticateToken, roleCheck(ALLOWED_TOUR_ROLES), tourController.addTourNote);

module.exports = router;
