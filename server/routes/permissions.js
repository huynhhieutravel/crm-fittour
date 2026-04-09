const express = require('express');
const router = express.Router();
const controller = require('../controllers/permissionController');
const authenticateToken = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');

// Public cho user đang đăng nhập: lấy quyền cuối cùng của mình
router.get('/my', authenticateToken, controller.getMyPermissions);

// Admin-only: quản lý quyền
router.get('/master', authenticateToken, controller.getMaster);
router.get('/role/:roleId', authenticateToken, permCheck('users', 'change_permissions'), controller.getRolePermissions);
router.put('/role/:roleId', authenticateToken, permCheck('users', 'change_permissions'), controller.updateRolePermissions);
router.get('/user/:userId', authenticateToken, permCheck('users', 'change_permissions'), controller.getUserPermissions);
router.put('/user/:userId', authenticateToken, permCheck('users', 'change_permissions'), controller.updateUserPermissions);

module.exports = router;
