const express = require('express');
const router = express.Router();
const controller = require('../controllers/b2bCompanyController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// b2b_companies: admin, manager, group_manager, group_staff
const VIEW_ROLES = ['admin', 'manager', 'group_manager', 'group_staff'];
const EDIT_ROLES = ['admin', 'manager', 'group_manager', 'group_staff'];
const DELETE_ROLES = ['admin', 'manager', 'group_manager'];

router.get('/', authenticateToken, roleCheck(VIEW_ROLES), controller.getAllCompanies);
router.get('/:id', authenticateToken, roleCheck(VIEW_ROLES), controller.getCompanyById);
router.post('/', authenticateToken, roleCheck(EDIT_ROLES), controller.createCompany);
router.put('/:id', authenticateToken, roleCheck(EDIT_ROLES), controller.updateCompany);
router.delete('/:id', authenticateToken, roleCheck(DELETE_ROLES), controller.deleteCompany);

router.post('/:id/notes', authenticateToken, roleCheck(EDIT_ROLES), controller.addCompanyNote);
router.post('/:id/events', authenticateToken, roleCheck(EDIT_ROLES), controller.addCompanyEvent);
router.put('/events/:eventId/status', authenticateToken, roleCheck(EDIT_ROLES), controller.updateEventStatus);

module.exports = router;
