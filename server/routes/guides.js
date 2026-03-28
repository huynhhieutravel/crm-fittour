const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, guideController.getAllGuides);
router.get('/timeline', authenticateToken, guideController.getGuideTimeline);
router.post('/', authenticateToken, guideController.createGuide);
router.get('/:id', authenticateToken, guideController.getGuideById);
router.put('/:id', authenticateToken, guideController.updateGuide);
router.delete('/:id', authenticateToken, guideController.deleteGuide);

module.exports = router;
