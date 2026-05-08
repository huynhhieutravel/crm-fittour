const express = require('express');
const router = express.Router();
const controller = require('../controllers/insuranceController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckOrOwner } = require('../middleware/permCheck');


// Insurances
router.get('/', authenticateToken, permCheck('insurances', 'view'), controller.getAll);
router.post('/', authenticateToken, permCheck('insurances', 'create'), controller.create);
router.get('/:id', authenticateToken, permCheck('insurances', 'view'), controller.getDetails);
router.put('/:id', authenticateToken, permCheckOrOwner('insurances', 'edit', 'insurances', 'id'), controller.update);
router.delete('/:id', authenticateToken, permCheckOrOwner('insurances', 'delete', 'insurances', 'id'), controller.delete);

// Contacts
router.post('/:insurance_id/contacts', authenticateToken, permCheck('insurances', 'edit'), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('insurances', 'edit'), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('insurances', 'edit'), controller.deleteContact);

// Services
router.post('/:insurance_id/services', authenticateToken, permCheck('insurances', 'edit'), controller.createService);
router.put('/services/:service_id', authenticateToken, permCheck('insurances', 'edit'), controller.updateService);
router.delete('/services/:service_id', authenticateToken, permCheck('insurances', 'edit'), controller.deleteService);

// Contracts
router.post('/:insurance_id/contracts', authenticateToken, permCheck('insurances', 'edit'), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('insurances', 'edit'), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('insurances', 'edit'), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('insurances', 'edit'), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('insurances', 'edit'), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('insurances', 'edit'), controller.deleteContractRate);

// Notes
router.get('/:insurance_id/notes', authenticateToken, permCheck('insurances', 'view'), controller.getNotes);
router.post('/:insurance_id/notes', authenticateToken, permCheck('insurances', 'edit'), controller.addNote);

module.exports = router;
