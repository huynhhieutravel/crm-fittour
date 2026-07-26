const express = require('express');
const router = express.Router();
const globalActivityController = require('../controllers/globalActivityController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, globalActivityController.getGlobalActivities);
router.post('/', authMiddleware, globalActivityController.createGlobalActivity);
router.post('/:id/react', authMiddleware, globalActivityController.toggleReaction);

module.exports = router;
