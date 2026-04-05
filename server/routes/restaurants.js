const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_ROLES = ['admin', 'manager', 'operations'];

// Restaurants
router.get('/', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.getRestaurants);
router.post('/', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.createRestaurant);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.getRestaurantDetails);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.updateRestaurant);
router.delete('/:id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.deleteRestaurant);

// Contacts
router.post('/:restaurant_id/contacts', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.createContact);
router.put('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.deleteContact);

// Services (Room Types equivalent)
router.post('/:restaurant_id/services', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.createRoomType);
router.put('/services/:room_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.updateRoomType);
router.delete('/services/:room_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.deleteRoomType);

// Contracts
router.post('/:restaurant_id/contracts', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.createContract);
router.put('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.createContractRate);
router.put('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.deleteContractRate);

// Notes
router.get('/:restaurant_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.getRestaurantNotes);
router.post('/:restaurant_id/notes', authenticateToken, roleCheck(ALLOWED_ROLES), restaurantController.addRestaurantNote);

module.exports = router;
