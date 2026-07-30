const express = require('express');
const router = express.Router();
const controller = require('../controllers/transportController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckOrOwner } = require('../middleware/permCheck');


// Transports
router.get('/', authenticateToken, permCheck('transports', 'view'), controller.getAll);
router.post('/', authenticateToken, permCheck('transports', 'create'), controller.create);
router.get('/:id', authenticateToken, permCheck('transports', 'view'), controller.getDetails);
router.put('/:id', authenticateToken, permCheckOrOwner('transports', 'edit', 'transports', 'id'), controller.update);
router.delete('/:id', authenticateToken, permCheckOrOwner('transports', 'delete', 'transports', 'id'), controller.delete);

// Contacts
router.post('/:transport_id/contacts', authenticateToken, permCheckOrOwner('transports', 'edit', 'transports', 'transport_id'), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('transports', 'edit'), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteContact);

// Services
router.post('/:transport_id/services', authenticateToken, permCheckOrOwner('transports', 'edit', 'transports', 'transport_id'), controller.createService);
router.put('/services/:service_id', authenticateToken, permCheck('transports', 'edit'), controller.updateService);
router.delete('/services/:service_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteService);

// Contracts
router.post('/:transport_id/contracts', authenticateToken, permCheckOrOwner('transports', 'edit', 'transports', 'transport_id'), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('transports', 'edit'), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('transports', 'edit'), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('transports', 'edit'), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteContractRate);

// Notes
router.get('/:transport_id/notes', authenticateToken, permCheck('transports', 'view'), controller.getNotes);
router.post('/:transport_id/notes', authenticateToken, permCheckOrOwner('transports', 'edit', 'transports', 'transport_id'), controller.addNote);

// Media
router.get('/:transport_id/media', authenticateToken, permCheck('transports', 'view'), controller.getTransportMedia);
router.post('/:transport_id/media', authenticateToken, permCheckOrOwner('transports', 'edit', 'transports', 'transport_id'), controller.uploadTransportMedia);
router.delete('/media/:media_id', authenticateToken, permCheck('transports', 'edit'), controller.deleteTransportMedia);

module.exports = router;
