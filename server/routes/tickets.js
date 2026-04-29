const express = require('express');
const router = express.Router();
const controller = require('../controllers/ticketController');
const authenticateToken = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');


// Tickets
router.get('/', authenticateToken, permCheck('tickets', 'view'), controller.getAll);
router.post('/', authenticateToken, permCheck('tickets', 'create'), controller.create);
router.get('/:id', authenticateToken, permCheck('tickets', 'view'), controller.getDetails);
router.put('/:id', authenticateToken, permCheck('tickets', 'edit'), controller.update);
router.delete('/:id', authenticateToken, permCheck('tickets', 'delete'), controller.delete);

// Contacts
router.post('/:ticket_id/contacts', authenticateToken, permCheck('tickets', 'edit'), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('tickets', 'edit'), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('tickets', 'edit'), controller.deleteContact);

// Services
router.post('/:ticket_id/services', authenticateToken, permCheck('tickets', 'edit'), controller.createService);
router.put('/services/:service_id', authenticateToken, permCheck('tickets', 'edit'), controller.updateService);
router.delete('/services/:service_id', authenticateToken, permCheck('tickets', 'edit'), controller.deleteService);

// Contracts
router.post('/:ticket_id/contracts', authenticateToken, permCheck('tickets', 'edit'), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('tickets', 'edit'), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('tickets', 'edit'), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('tickets', 'edit'), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('tickets', 'edit'), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('tickets', 'edit'), controller.deleteContractRate);

// Notes
router.get('/:ticket_id/notes', authenticateToken, permCheck('tickets', 'view'), controller.getNotes);
router.post('/:ticket_id/notes', authenticateToken, permCheck('tickets', 'edit'), controller.addNote);

// Media
router.get('/:ticket_id/media', authenticateToken, permCheck('tickets', 'view'), controller.getTicketMedia);
router.post('/:ticket_id/media', authenticateToken, permCheck('tickets', 'edit'), controller.uploadTicketMedia);
router.delete('/media/:media_id', authenticateToken, permCheck('tickets', 'edit'), controller.deleteTicketMedia);

module.exports = router;
