const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupProjectController');
const authenticateToken = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// group_projects: admin, manager, group_manager, group_staff + operations, marketing (view only)
const VIEW_ROLES = ['admin', 'manager', 'group_manager', 'group_staff', 'operations', 'marketing'];
const EDIT_ROLES = ['admin', 'manager', 'group_manager', 'group_staff'];
const DELETE_ROLES = ['admin', 'manager', 'group_manager'];

router.get('/stats', authenticateToken, roleCheck(VIEW_ROLES), controller.getProjectStats);
router.get('/', authenticateToken, roleCheck(VIEW_ROLES), controller.getAllProjects);
router.post('/', authenticateToken, roleCheck(EDIT_ROLES), controller.createProject);
router.put('/:id', authenticateToken, roleCheck(EDIT_ROLES), controller.updateProject);
router.delete('/:id', authenticateToken, roleCheck(DELETE_ROLES), controller.deleteProject);

module.exports = router;
