const express = require('express');
const router = express.Router();
const controller = require('../controllers/b2bCompanyController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny, permCheckOrOwner } = require('../middleware/permCheck');

router.get('/', authenticateToken, permCheckAny([['b2b_companies','view_all'], ['b2b_companies','view_own']]), controller.getAllCompanies);
router.get('/:id', authenticateToken, permCheckAny([['b2b_companies','view_all'], ['b2b_companies','view_own']]), controller.getCompanyById);
router.post('/', authenticateToken, permCheck('b2b_companies', 'create'), controller.createCompany);
router.put('/:id', authenticateToken, permCheckOrOwner('b2b_companies', 'edit', 'b2b_companies', 'id', 'assigned_to'), controller.updateCompany);
router.delete('/:id', authenticateToken, permCheckOrOwner('b2b_companies', 'delete', 'b2b_companies', 'id', 'assigned_to'), controller.deleteCompany);

router.post('/:id/notes', authenticateToken, permCheck('b2b_companies', 'edit'), controller.addCompanyNote);
router.post('/:id/events', authenticateToken, permCheck('b2b_companies', 'edit'), controller.addCompanyEvent);
router.put('/events/:eventId/status', authenticateToken, permCheck('b2b_companies', 'edit'), controller.updateEventStatus);

module.exports = router;
