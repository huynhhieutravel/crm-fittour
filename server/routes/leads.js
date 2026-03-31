const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_LEAD_ROLES = ['admin', 'manager', 'sales', 'marketing'];

router.get('/stats', authenticateToken, roleCheck(ALLOWED_LEAD_ROLES), leadController.getLeadStats);
router.get('/', authenticateToken, roleCheck(ALLOWED_LEAD_ROLES), leadController.getAllLeads);
router.post('/bulk-update', authenticateToken, roleCheck(ALLOWED_LEAD_ROLES), leadController.bulkUpdateLeads);
router.post('/', authenticateToken, roleCheck(ALLOWED_LEAD_ROLES), leadController.createLead);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_LEAD_ROLES), leadController.getLeadById);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_LEAD_ROLES), leadController.updateLead);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager']), leadController.deleteLead);

module.exports = router;
