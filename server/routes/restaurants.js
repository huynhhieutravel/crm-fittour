const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckOrOwner } = require('../middleware/permCheck');


// Restaurants
router.get('/', authenticateToken, permCheck('restaurants', 'view'), restaurantController.getRestaurants);
router.post('/', authenticateToken, permCheck('restaurants', 'create'), restaurantController.createRestaurant);
router.get('/:id', authenticateToken, permCheck('restaurants', 'view'), restaurantController.getRestaurantDetails);
router.put('/:id', authenticateToken, permCheckOrOwner('restaurants', 'edit', 'restaurants', 'id'), restaurantController.updateRestaurant);
router.delete('/:id', authenticateToken, permCheckOrOwner('restaurants', 'delete', 'restaurants', 'id'), restaurantController.deleteRestaurant);

// Contacts
router.post('/:restaurant_id/contacts', authenticateToken, permCheckOrOwner('restaurants', 'edit', 'restaurants', 'restaurant_id'), restaurantController.createContact);
router.put('/contacts/:contact_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.updateContact);
router.delete('/contacts/:contact_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.deleteContact);

// Services (Room Types equivalent)
router.post('/:restaurant_id/services', authenticateToken, permCheckOrOwner('restaurants', 'edit', 'restaurants', 'restaurant_id'), restaurantController.createRoomType);
router.put('/services/:room_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.updateRoomType);
router.delete('/services/:room_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.deleteRoomType);

// Contracts
router.post('/:restaurant_id/contracts', authenticateToken, permCheckOrOwner('restaurants', 'edit', 'restaurants', 'restaurant_id'), restaurantController.createContract);
router.put('/contracts/:contract_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.updateContract);
router.delete('/contracts/:contract_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.deleteContract);

// Contract Rates
router.post('/contracts/:contract_id/rates', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.createContractRate);
router.put('/rates/:rate_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.updateContractRate);
router.delete('/rates/:rate_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.deleteContractRate);

// Notes
router.get('/:restaurant_id/notes', authenticateToken, permCheck('restaurants', 'view'), restaurantController.getRestaurantNotes);
router.post('/:restaurant_id/notes', authenticateToken, permCheckOrOwner('restaurants', 'edit', 'restaurants', 'restaurant_id'), restaurantController.addRestaurantNote);

// Media Gallery (Images & PDF Menus)
router.get('/:restaurant_id/media', authenticateToken, permCheck('restaurants', 'view'), restaurantController.getRestaurantMedia);
router.post('/:restaurant_id/media', authenticateToken, permCheckOrOwner('restaurants', 'edit', 'restaurants', 'restaurant_id'), restaurantController.uploadRestaurantMedia);
router.delete('/media/:media_id', authenticateToken, permCheck('restaurants', 'edit'), restaurantController.deleteRestaurantMedia);

module.exports = router;
