const express = require('express');
const router = express.Router();
const controller = require('../controllers/transportController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_ROLES = ['admin', 'manager', 'operations'];

// Transports
router.get('/', authenticateToken, roleCheck([...ALLOWED_ROLES, "group_manager"]), controller.getAll);
router.post('/', authenticateToken, roleCheck(ALLOWED_ROLES), controller.create);
router.get('/:id', authenticateToken, roleCheck([...ALLOWED_ROLES, "group_manager"]), controller.getDetails);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.update);
router.delete('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.delete);

// Contacts
router.post('/:transport_id/contacts', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContact);

// Services
router.post('/:transport_id/services', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createService);
router.put('/services/:service_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateService);
router.delete('/services/:service_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteService);

// Contracts
router.post('/:transport_id/contracts', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, roleCheck(ALLOWED_ROLES), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), controller.deleteContractRate);

// Notes
router.get('/:transport_id/notes', authenticateToken, roleCheck([...ALLOWED_ROLES, "group_manager"]), controller.getNotes);
router.post('/:transport_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), controller.addNote);

module.exports = router;
