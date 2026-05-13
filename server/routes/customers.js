const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny, permCheckOrOwner } = require('../middleware/permCheck');
const customerEventController = require('../controllers/customerEventController');

router.get('/birthdays/upcoming', authenticateToken, permCheckAny([['customers','view_all'], ['customers','view_own']]), customerController.getUpcomingBirthdays);
router.get('/check-phone', authenticateToken, permCheckAny([['customers','view_all'], ['customers','view_own']]), customerController.checkPhoneExists);
router.get('/', authenticateToken, permCheckAny([['customers','view_all'], ['customers','view_own']]), customerController.getAllCustomers);
router.post('/', authenticateToken, permCheck('customers', 'create'), customerController.createCustomer);

// Utilities
router.get('/utils/duplicates', authenticateToken, permCheck('customers', 'view_all'), customerController.getDuplicates);
router.post('/utils/merge', authenticateToken, permCheck('customers', 'edit'), customerController.mergeCustomers);

// Events — MUST BE BEFORE /:id
router.get('/events/all', authenticateToken, permCheckAny([['customers','view_all'], ['customers','view_own']]), customerEventController.getEvents);
router.post('/events', authenticateToken, permCheck('customers', 'edit'), customerEventController.createEvent);
router.put('/events/:id/status', authenticateToken, permCheck('customers', 'edit'), customerEventController.updateEventStatus);
router.put('/events/:id', authenticateToken, permCheck('customers', 'edit'), customerEventController.updateEvent);
router.delete('/events/:id', authenticateToken, permCheck('customers', 'delete'), customerEventController.deleteEvent);

router.get('/:id', authenticateToken, permCheckAny([['customers','view_all'], ['customers','view_own']]), customerController.getCustomerById);
router.post('/:id/notes', authenticateToken, permCheck('customers', 'edit'), customerController.addNote);
router.put('/:id', authenticateToken, permCheckOrOwner('customers', 'edit', 'customers', 'id', 'assigned_to'), customerController.updateCustomer);
router.delete('/:id', authenticateToken, permCheck('customers', 'delete'), customerController.deleteCustomer);
router.post('/convert', authenticateToken, permCheck('customers', 'create'), customerController.convertLeadToCustomer);

module.exports = router;
