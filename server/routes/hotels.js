const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const authenticateToken = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');


// Hotels
router.get('/', authenticateToken, permCheck('hotels', 'view'), hotelController.getHotels);
router.post('/', authenticateToken, permCheck('hotels', 'create'), hotelController.createHotel);
router.get('/:id', authenticateToken, permCheck('hotels', 'view'), hotelController.getHotelDetails);
router.put('/:id', authenticateToken, permCheck('hotels', 'edit'), hotelController.updateHotel);
router.delete('/:id', authenticateToken, permCheck('hotels', 'delete'), hotelController.deleteHotel);

// Contacts
router.post('/:hotel_id/contacts', authenticateToken, permCheck('hotels', 'edit'), hotelController.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.deleteContact);

// Room Types
router.post('/:hotel_id/room-types', authenticateToken, permCheck('hotels', 'edit'), hotelController.createRoomType);
router.put('/room-types/:room_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.updateRoomType);
router.delete('/room-types/:room_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.deleteRoomType);

// Contracts
router.post('/:hotel_id/contracts', authenticateToken, permCheck('hotels', 'edit'), hotelController.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('hotels', 'edit'), hotelController.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.deleteContractRate);

// Allotments
router.post('/:hotel_id/allotments', authenticateToken, permCheck('hotels', 'edit'), hotelController.createAllotment);
router.put('/allotments/:allotment_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.updateAllotment);
router.delete('/allotments/:allotment_id', authenticateToken, permCheck('hotels', 'edit'), hotelController.deleteAllotment);

// Notes
router.get('/:hotel_id/notes', authenticateToken, permCheck('hotels', 'view'), hotelController.getHotelNotes);
router.post('/:hotel_id/notes', authenticateToken, permCheck('hotels', 'edit'), hotelController.addHotelNote);

module.exports = router;
