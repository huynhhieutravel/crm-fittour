const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_GUIDE_ROLES = ['admin', 'manager', 'operations'];

router.get('/', authenticateToken, roleCheck(ALLOWED_GUIDE_ROLES), guideController.getAllGuides);
router.post('/', authenticateToken, roleCheck(ALLOWED_GUIDE_ROLES), guideController.createGuide);
router.get('/:id', authenticateToken, roleCheck(ALLOWED_GUIDE_ROLES), guideController.getGuideById);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_GUIDE_ROLES), guideController.updateGuide);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager']), guideController.deleteGuide);
router.get('/timeline/data', authenticateToken, roleCheck(ALLOWED_GUIDE_ROLES), guideController.getGuideTimeline);

module.exports = router;
