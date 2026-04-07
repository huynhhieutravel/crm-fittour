const express = require('express');
const router = express.Router();
const guideController = require('../controllers/guideController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const ALLOWED_GUIDE_ROLES = ['admin', 'manager', 'operations'];

router.get('/', authenticateToken, roleCheck([...ALLOWED_GUIDE_ROLES, "group_manager"]), guideController.getAllGuides);
router.post('/', authenticateToken, roleCheck(ALLOWED_GUIDE_ROLES), guideController.createGuide);
router.get('/timeline/data', authenticateToken, roleCheck([...ALLOWED_GUIDE_ROLES, "group_manager"]), guideController.getGuideTimeline);

router.get('/:id', authenticateToken, roleCheck([...ALLOWED_GUIDE_ROLES, "group_manager"]), guideController.getGuideById);
router.put('/:id', authenticateToken, roleCheck(ALLOWED_GUIDE_ROLES), guideController.updateGuide);
router.delete('/:id', authenticateToken, roleCheck(['admin', 'manager', "group_manager"]), guideController.deleteGuide);

module.exports = router;
