const express = require('express');
const router = express.Router();
const controller = require('../controllers/transportController');
const authenticateToken = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');


// Transports
router.get('/', authenticateToken, permCheck('transports', 'view'), controller.getAll);
router.post('/', authenticateToken, permCheck('transports', 'create'), controller.create);
router.get('/:id', authenticateToken, permCheck('transports', 'view'), controller.getDetails);
router.put('/:id', authenticateToken, permCheck('transports', 'edit'), controller.update);
router.delete('/:id', authenticateToken, permCheck('transports', 'delete'), controller.delete);

// Contacts
router.post('/:transport_id/contacts', authenticateToken, permCheck('transports', 'edit'), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('transports', 'edit'), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteContact);

// Services
router.post('/:transport_id/services', authenticateToken, permCheck('transports', 'edit'), controller.createService);
router.put('/services/:service_id', authenticateToken, permCheck('transports', 'edit'), controller.updateService);
router.delete('/services/:service_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteService);

// Contracts
router.post('/:transport_id/contracts', authenticateToken, permCheck('transports', 'edit'), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('transports', 'edit'), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('transports', 'edit'), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('transports', 'edit'), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteContractRate);

// Notes
router.get('/:transport_id/notes', authenticateToken, permCheck('transports', 'view'), controller.getNotes);
router.post('/:transport_id/notes', authenticateToken, permCheck('transports', 'edit'), controller.addNote);

module.exports = router;
