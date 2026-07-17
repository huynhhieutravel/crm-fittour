const express = require('express');
const router = express.Router();
const ragDocController = require('../controllers/ragDocController');
const auth = require('../middleware/auth'); 

// Only allow authenticated CRM users to manage documents
// router.use(auth); // Disabled per user request (no login required)

// CRUD routes for the Admin UI
router.get('/', ragDocController.getItems);
router.post('/', ragDocController.createItem);
router.get('/:id', ragDocController.getItem);
router.put('/:id', ragDocController.updateItem);
router.delete('/:id', ragDocController.deleteItem);

module.exports = router;
