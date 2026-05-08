const express = require('express');
const router = express.Router();
const controller = require('../controllers/landtourController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckOrOwner } = require('../middleware/permCheck');


// Landtours
router.get('/', authenticateToken, permCheck('landtours', 'view'), controller.getAll);
router.post('/', authenticateToken, permCheck('landtours', 'create'), controller.create);
router.get('/:id', authenticateToken, permCheck('landtours', 'view'), controller.getDetails);
router.put('/:id', authenticateToken, permCheckOrOwner('landtours', 'edit', 'landtours', 'id'), controller.update);
router.delete('/:id', authenticateToken, permCheckOrOwner('landtours', 'delete', 'landtours', 'id'), controller.delete);

// Contacts
router.post('/:landtour_id/contacts', authenticateToken, permCheck('landtours', 'edit'), controller.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('landtours', 'edit'), controller.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('landtours', 'edit'), controller.deleteContact);

// Services
router.post('/:landtour_id/services', authenticateToken, permCheck('landtours', 'edit'), controller.createService);
router.put('/services/:service_id', authenticateToken, permCheck('landtours', 'edit'), controller.updateService);
router.delete('/services/:service_id', authenticateToken, permCheck('landtours', 'edit'), controller.deleteService);

// Contracts
router.post('/:landtour_id/contracts', authenticateToken, permCheck('landtours', 'edit'), controller.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('landtours', 'edit'), controller.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('landtours', 'edit'), controller.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('landtours', 'edit'), controller.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('landtours', 'edit'), controller.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('landtours', 'edit'), controller.deleteContractRate);

// Notes
router.get('/:landtour_id/notes', authenticateToken, permCheck('landtours', 'view'), controller.getNotes);
router.post('/:landtour_id/notes', authenticateToken, permCheck('landtours', 'edit'), controller.addNote);

module.exports = router;
