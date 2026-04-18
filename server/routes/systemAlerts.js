const express = require('express');
const router = express.Router();
const systemAlertController = require('../controllers/systemAlertController');
const auth = require('../middleware/auth');

router.get('/', auth, systemAlertController.getMyAlerts);
router.put('/:id/resolve', auth, systemAlertController.resolveAlert);
router.put('/resolve-all', auth, systemAlertController.resolveAll);

module.exports = router;
