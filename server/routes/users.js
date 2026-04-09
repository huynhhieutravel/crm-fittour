const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');

// GET /api/users — Tất cả user đã đăng nhập đều có thể lấy danh sách
router.get('/', auth, userController.getAllUsers);
router.get('/roles', auth, permCheck('users', 'view'), userController.getRoles);
router.get('/teams', auth, userController.getTeams);
router.get('/allowed-roles', auth, userController.getAllowedRoles);

// Team CRUD (Admin only)
router.post('/teams', auth, permCheck('users', 'manage_team'), userController.createTeam);
router.put('/teams/:id', auth, permCheck('users', 'manage_team'), userController.updateTeam);
router.delete('/teams/:id', auth, permCheck('users', 'manage_team'), userController.deleteTeam);

// Team members
router.get('/teams/:teamId/members', auth, userController.getTeamMembers);
router.post('/teams/:teamId/members', auth, permCheck('users', 'manage_team'), userController.addTeamMember);
router.delete('/teams/:teamId/members/:userId', auth, permCheck('users', 'manage_team'), userController.removeTeamMember);

// Team managers
router.post('/teams/:teamId/managers', auth, permCheck('users', 'manage_team'), userController.setTeamManager);
router.delete('/teams/:teamId/managers/:userId', auth, permCheck('users', 'manage_team'), userController.removeTeamManager);

// User CRUD
router.post('/', auth, userController.createUser);
router.put('/:id', auth, userController.updateUser);
router.put('/:id/password', auth, userController.changePassword);
router.delete('/:id', auth, permCheck('users', 'delete'), userController.deleteUser);

module.exports = router;
