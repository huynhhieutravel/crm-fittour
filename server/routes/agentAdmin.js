const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/agentAdminController');

// Tất cả routes yêu cầu auth VÀ phải là ADMIN
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Truy cập bị từ chối. Chỉ Admin mới được quyền vào khu vực cấu hình Copilot.' });
    }
};

router.get('/brain', auth, requireAdmin, ctrl.listBrainFiles);
router.get('/brain/:category/:filename', auth, requireAdmin, ctrl.readBrainFile);
router.put('/brain/:category/:filename', auth, requireAdmin, ctrl.updateBrainFile);
router.post('/reload', auth, requireAdmin, ctrl.reloadBrain);
router.get('/logs', auth, requireAdmin, ctrl.getLogs);
router.get('/stats', auth, requireAdmin, ctrl.getStats);
router.get('/skills', auth, requireAdmin, ctrl.listSkills);

module.exports = router;
