const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, tourController.getAllTours);
router.post('/', authenticateToken, tourController.createTour);
router.get('/:id', authenticateToken, tourController.getTourById);
router.put('/:id', authenticateToken, tourController.updateTour);
router.delete('/:id', authenticateToken, tourController.deleteTour);

module.exports = router;
