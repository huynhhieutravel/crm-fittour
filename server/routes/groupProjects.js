const express = require('express');
const router = express.Router();
const controller = require('../controllers/groupProjectController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny, permCheckOrOwner } = require('../middleware/permCheck');

router.get('/stats', authenticateToken, permCheckAny([['group_projects','view_all'], ['group_projects','view_own']]), controller.getProjectStats);
router.get('/', authenticateToken, permCheckAny([['group_projects','view_all'], ['group_projects','view_own']]), controller.getAllProjects);
router.post('/', authenticateToken, permCheck('group_projects', 'create'), controller.createProject);
router.put('/:id', authenticateToken, permCheckOrOwner('group_projects', 'edit', 'group_projects', 'id', 'assigned_to'), controller.updateProject);
router.delete('/:id', authenticateToken, permCheckOrOwner('group_projects', 'delete', 'group_projects', 'id', 'assigned_to'), controller.deleteProject);

module.exports = router;
