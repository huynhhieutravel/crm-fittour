const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const authenticateToken = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public (authenticated users) — Dropdown data
router.get('/', authenticateToken, marketController.getMarkets);
router.get('/flat', authenticateToken, marketController.getMarketsFlat);

// Admin only — Management
router.get('/all', authenticateToken, admin, marketController.getAllMarkets);
router.post('/', authenticateToken, admin, marketController.createMarket);
router.put('/reorder', authenticateToken, admin, marketController.reorderMarkets);
router.put('/:id', authenticateToken, admin, marketController.updateMarket);
router.delete('/:id', authenticateToken, admin, marketController.deleteMarket);

module.exports = router;
