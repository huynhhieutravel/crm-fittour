const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/announcementController');

// Public direct link (No auth required)
router.get('/public/latest', ctrl.getLatestAnnouncement);
router.get('/public/:idOrCode', ctrl.getPublicAnnouncement);

// All authenticated users can view list and single announcement
router.get('/suggest-code', auth, ctrl.suggestNextCode);
router.get('/', auth, ctrl.getAnnouncements);
router.get('/:id', auth, ctrl.getAnnouncementById);

// Admin & Manager can create and update
router.post('/', auth, (req, res, next) => {
    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Bạn không có quyền tạo văn bản thông báo' });
    }
    next();
}, ctrl.createAnnouncement);

router.put('/:id', auth, (req, res, next) => {
    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Bạn không có quyền chỉnh sửa văn bản thông báo' });
    }
    next();
}, ctrl.updateAnnouncement);

// Admin & Manager can delete
router.delete('/:id', auth, (req, res, next) => {
    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Bạn không có quyền xóa văn bản thông báo' });
    }
    next();
}, ctrl.deleteAnnouncement);

module.exports = router;
