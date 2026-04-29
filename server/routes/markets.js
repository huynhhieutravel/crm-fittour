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
router.get('/all', authenticateToken, permCheck('markets', 'view'), marketController.getAllMarkets);
router.post('/', authenticateToken, permCheck('markets', 'create'), marketController.createMarket);
router.put('/reorder', authenticateToken, permCheck('markets', 'edit'), marketController.reorderMarkets);
router.put('/:id', authenticateToken, permCheck('markets', 'edit'), marketController.updateMarket);
router.delete('/:id', authenticateToken, permCheck('markets', 'delete'), marketController.deleteMarket);

module.exports = router;
