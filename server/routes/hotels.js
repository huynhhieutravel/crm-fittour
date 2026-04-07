const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_ROLES = ['admin', 'manager', 'operations'];

// Hotels
router.get('/', authenticateToken, roleCheck([...ALLOWED_ROLES, "group_manager"]), hotelController.getHotels);
router.post('/', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.createHotel);
router.get('/:id', authenticateToken, roleCheck([...ALLOWED_ROLES, "group_manager"]), hotelController.getHotelDetails);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.updateHotel);
router.delete('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.deleteHotel);

// Contacts
router.post('/:hotel_id/contacts', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.createContact);
router.put('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.deleteContact);

// Room Types
router.post('/:hotel_id/room-types', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.createRoomType);
router.put('/room-types/:room_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.updateRoomType);
router.delete('/room-types/:room_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.deleteRoomType);

// Contracts
router.post('/:hotel_id/contracts', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.createContract);
router.put('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.createContractRate);
router.put('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.deleteContractRate);

// Allotments
router.post('/:hotel_id/allotments', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.createAllotment);
router.put('/allotments/:allotment_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.updateAllotment);
router.delete('/allotments/:allotment_id', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.deleteAllotment);

// Notes
router.get('/:hotel_id/notes', authenticateToken, roleCheck([...ALLOWED_ROLES, "group_manager"]), hotelController.getHotelNotes);
router.post('/:hotel_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), hotelController.addHotelNote);

module.exports = router;
