const express = require('express');
const router = express.Router();
const controller = require('../controllers/airlineController');
const authenticateToken = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');


// Airlines
router.get('/', authenticateToken, permCheck('airlines', 'view'), controller.getAll);
router.post('/', authenticateToken, permCheck('airlines', 'create'), controller.create);
router.get('/:id', authenticateToken, permCheck('airlines', 'view'), controller.getDetails);
router.put('/:id', authenticateToken, permCheck('airlines', 'edit'), controller.update);
router.delete('/:id', authenticateToken, permCheck('airlines', 'delete'), controller.delete);

// Contacts
router.post('/:airline_id/contacts', authenticateToken, permCheck('airlines', 'edit'), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('airlines', 'edit'), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('airlines', 'edit'), controller.deleteContact);

// Services
router.post('/:airline_id/services', authenticateToken, permCheck('airlines', 'edit'), controller.createService);
router.put('/services/:service_id', authenticateToken, permCheck('airlines', 'edit'), controller.updateService);
router.delete('/services/:service_id', authenticateToken, permCheck('airlines', 'edit'), controller.deleteService);

// Contracts
router.post('/:airline_id/contracts', authenticateToken, permCheck('airlines', 'edit'), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('airlines', 'edit'), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('airlines', 'edit'), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('airlines', 'edit'), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('airlines', 'edit'), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('airlines', 'edit'), controller.deleteContractRate);

// Notes
router.get('/:airline_id/notes', authenticateToken, permCheck('airlines', 'view'), controller.getNotes);
router.post('/:airline_id/notes', authenticateToken, permCheck('airlines', 'edit'), controller.addNote);

module.exports = router;
