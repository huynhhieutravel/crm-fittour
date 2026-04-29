const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');
const authenticateToken = require('../middleware/auth');
const admin = require('../middleware/admin');
const { permCheck } = require('../middleware/permCheck');

// Public (authenticated users) — Dropdown data
router.get('/', authenticateToken, marketController.getMarkets);
router.get('/flat', authenticateToken, marketController.getMarketsFlat);

// Admin only — Management
router.get('/all', authenticateToken, permCheck('markets', 'change_markets'), marketController.getAllMarkets);
router.post('/', authenticateToken, permCheck('markets', 'change_markets'), marketController.createMarket);
router.put('/reorder', authenticateToken, permCheck('markets', 'change_markets'), marketController.reorderMarkets);
router.put('/:id', authenticateToken, permCheck('markets', 'change_markets'), marketController.updateMarket);
router.delete('/:id', authenticateToken, permCheck('markets', 'change_markets'), marketController.deleteMarket);

module.exports = router;
