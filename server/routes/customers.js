const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_CUSTOMER_ROLES = ['admin', 'manager', 'sales', 'operations'];

router.get('/birthdays/upcoming', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.getUpcomingBirthdays);
router.get('/check-phone', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.checkPhoneExists);
router.get('/', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.getAllCustomers);
router.post('/', authenticateToken, roleCheck(['admin', 'manager', 'sales']), customerController.createCustomer);
const customerEventController = require('../controllers/customerEventController');

// Utilities
router.get('/utils/duplicates', authenticateToken, roleCheck(['admin', 'manager']), customerController.getDuplicates);
router.post('/utils/merge', authenticateToken, roleCheck(['admin', 'manager']), customerController.mergeCustomers);

// MUST BE BEFORE /:id to avoid matching "events" to id
router.get('/events/all', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerEventController.getEvents);
router.post('/events', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerEventController.createEvent);
router.put('/events/:id/status', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerEventController.updateEventStatus);
router.put('/events/:id', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerEventController.updateEvent);
router.delete('/events/:id', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerEventController.deleteEvent);

router.get('/:id', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.getCustomerById);
router.post('/:id/notes', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.addNote);
router.put('/:id', authenticateToken, roleCheck(['admin', 'manager', 'sales']), customerController.updateCustomer);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager']), customerController.deleteCustomer);
router.post('/convert', authenticateToken, roleCheck(['admin', 'manager', 'sales']), customerController.convertLeadToCustomer);

module.exports = router;
