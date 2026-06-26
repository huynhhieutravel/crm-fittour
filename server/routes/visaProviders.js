const express = require('express');
const router = express.Router();
const controller = require('../controllers/visaProviderController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_ROLES = ['admin', 'manager', 'operations'];

// Visa_providers
router.get('/', authenticateToken, roleCheck(ALLOWED_ROLES), controller.getAll);
router.post('/', authenticateToken, roleCheck(ALLOWED_ROLES), controller.create);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.getDetails);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.update);
router.delete('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.delete);

// Contacts
router.post('/:visa_provider_id/contacts', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContact);

// Services
router.post('/:visa_provider_id/services', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createService);
router.put('/services/:service_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateService);
router.delete('/services/:service_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteService);

// Contracts
router.post('/:visa_provider_id/contracts', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContractRate);

// Notes
router.get('/:visa_provider_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), controller.getNotes);
router.post('/:visa_provider_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), controller.addNote);

module.exports = router;
