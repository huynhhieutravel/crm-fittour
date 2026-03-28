const express = require('express');
const router = express.Router();
const departureController = require('../controllers/departureController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, departureController.getAllDepartures);
router.post('/', authenticateToken, departureController.createDeparture);
router.get('/:id', authenticateToken, departureController.getDepartureById);
router.put('/:id', authenticateToken, departureController.updateDeparture);
router.post('/:id/duplicate', authenticateToken, departureController.duplicateDeparture);
router.delete('/:id', authenticateToken, departureController.deleteDeparture);

module.exports = router;
