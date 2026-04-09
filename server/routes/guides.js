const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const authenticateToken = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');

router.get('/', authenticateToken, permCheck('guides', 'view'), guideController.getAllGuides);
router.post('/', authenticateToken, permCheck('guides', 'create'), guideController.createGuide);
router.get('/timeline/data', authenticateToken, permCheck('guides', 'view'), guideController.getGuideTimeline);
router.get('/:id', authenticateToken, permCheck('guides', 'view'), guideController.getGuideById);
router.put('/:id', authenticateToken, permCheck('guides', 'edit'), guideController.updateGuide);
router.delete('/:id', authenticateToken, permCheck('guides', 'delete'), guideController.deleteGuide);

module.exports = router;
