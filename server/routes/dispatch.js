const express = require('express');
const router = express.Router();
const dispatchController = require('../controllers/dispatchController');
const authenticateToken = require('../middleware/auth');

router.get('/dashboard', authenticateToken, dispatchController.getDashboard);
router.post('/assign/:id', authenticateToken, dispatchController.assignLead);
router.get('/snapshots', authenticateToken, dispatchController.getSnapshotsList);
router.get('/snapshots/:date', authenticateToken, dispatchController.getSnapshotData);
router.post('/snapshots', authenticateToken, dispatchController.saveSnapshot);

module.exports = router;
