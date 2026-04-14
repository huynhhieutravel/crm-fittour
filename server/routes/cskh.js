const express = require('express');
const router = express.Router();
const cskhController = require('../controllers/cskhController');
const authenticateToken = require('../middleware/auth');
const { permCheckAny } = require('../middleware/permCheck');

// Shared permission with customers module
const cskhPerm = [['customers', 'view_all'], ['customers', 'view_own']];
const cskhEditPerm = [['customers', 'edit'], ['customers', 'view_all']];

// Stats & Dashboard
router.get('/stats', authenticateToken, permCheckAny(cskhPerm), cskhController.getStats);

// Tasks
router.get('/tasks', authenticateToken, permCheckAny(cskhPerm), cskhController.getTasks);
router.post('/tasks', authenticateToken, permCheckAny(cskhEditPerm), cskhController.createTask);
router.put('/tasks/:id', authenticateToken, permCheckAny(cskhEditPerm), cskhController.updateTask);
router.post('/tasks/:id/process', authenticateToken, permCheckAny(cskhEditPerm), cskhController.processTask);
router.post('/tasks/:id/skip', authenticateToken, permCheckAny(cskhEditPerm), cskhController.skipTask);

// Rules config
router.get('/rules', authenticateToken, permCheckAny(cskhPerm), cskhController.getRules);
router.put('/rules/:id', authenticateToken, permCheckAny(cskhEditPerm), cskhController.updateRule);

// Bulk customer search
router.get('/search-customers', authenticateToken, permCheckAny(cskhPerm), cskhController.searchCustomers);

module.exports = router;
