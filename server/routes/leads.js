const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny } = require('../middleware/permCheck');

router.get('/stats', authenticateToken, permCheckAny([['leads','view_all'], ['leads','view_own']]), leadController.getLeadStats);
router.get('/', authenticateToken, permCheckAny([['leads','view_all'], ['leads','view_own']]), leadController.getAllLeads);
router.post('/bulk-update', authenticateToken, permCheck('leads', 'edit'), leadController.bulkUpdateLeads);
router.post('/', authenticateToken, permCheck('leads', 'create'), leadController.createLead);
router.get('/:id', authenticateToken, permCheckAny([['leads','view_all'], ['leads','view_own']]), leadController.getLeadById);
router.put('/:id', authenticateToken, permCheck('leads', 'edit'), leadController.updateLead);
router.delete('/:id', authenticateToken, permCheck('leads', 'delete'), leadController.deleteLead);

module.exports = router;
