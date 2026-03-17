const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, customerController.getAllCustomers);
router.post('/', authenticateToken, customerController.createCustomer);
router.get('/:id', authenticateToken, customerController.getCustomerById);
router.put('/:id', authenticateToken, customerController.updateCustomer);
router.delete('/:id', authenticateToken, customerController.deleteCustomer);

module.exports = router;
