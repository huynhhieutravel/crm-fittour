const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckOrOwner } = require('../middleware/permCheck');

router.get('/', authenticateToken, permCheck('tours', 'view'), tourController.getAllTours);
router.post('/bulk-delete', authenticateToken, permCheck('tours', 'delete'), tourController.bulkDeleteTours);
router.post('/', authenticateToken, permCheck('tours', 'create'), tourController.createTour);
router.get('/:id', authenticateToken, permCheck('tours', 'view'), tourController.getTourById);
router.put('/:id', authenticateToken, permCheckOrOwner('tours', 'edit', 'tour_templates', 'id'), tourController.updateTour);
router.delete('/:id', authenticateToken, permCheckOrOwner('tours', 'delete', 'tour_templates', 'id'), tourController.deleteTour);
router.get('/:id/notes', authenticateToken, permCheck('tours', 'view'), tourController.getTourNotes);
router.post('/notes', authenticateToken, permCheck('tours', 'edit'), tourController.addTourNote);

module.exports = router;
