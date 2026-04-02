const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_CUSTOMER_ROLES = ['admin', 'manager', 'sales', 'operations'];

router.get('/birthdays/upcoming', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.getUpcomingBirthdays);
router.get('/', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.getAllCustomers);
router.post('/', authenticateToken, roleCheck(['admin', 'manager', 'sales']), customerController.createCustomer);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.getCustomerById);
router.post('/:id/notes', authenticateToken, roleCheck(ALLOWED_CUSTOMER_ROLES), customerController.addNote);
router.put('/:id', authenticateToken, roleCheck(['admin', 'manager', 'sales']), customerController.updateCustomer);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager']), customerController.deleteCustomer);
router.post('/convert', authenticateToken, roleCheck(['admin', 'manager', 'sales']), customerController.convertLeadToCustomer);

module.exports = router;
