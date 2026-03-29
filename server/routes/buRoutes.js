const express = require('express');
const router = express.Router();
const buController = require('../controllers/buController');
const auth = require('../middleware/auth');

router.get('/', auth, buController.getAllBUs);
router.post('/', auth, buController.createBU);
router.put('/reorder', auth, buController.reorderBUs);
router.put('/:id', auth, buController.updateBU);

module.exports = router;
