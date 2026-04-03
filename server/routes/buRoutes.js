const express = require('express');
const router = express.Router();
const buController = require('../controllers/buController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', auth, buController.getAllBUs);
router.post('/', auth, admin, buController.createBU);
router.put('/reorder', auth, admin, buController.reorderBUs);
router.put('/:id', auth, admin, buController.updateBU);

module.exports = router;
