const express = require('express');
const router = express.Router();
const tokenController = require('../controllers/executiveAiTokenController');
const auth = require('../middleware/auth');
const { permCheck } = require('../middleware/permCheck');

// Tất cả các thao tác quản lý Token đều yêu cầu đăng nhập và có quyền ai_gateway:access
router.use(auth, permCheck('ai_gateway', 'access'));

// Danh sách tokens
router.get('/', tokenController.listTokens);

// Tạo token mới
router.post('/', tokenController.createToken);

// Thu hồi token
router.post('/:id/revoke', tokenController.revokeToken);

// Rotate token
router.post('/:id/rotate', tokenController.rotateToken);

module.exports = router;

