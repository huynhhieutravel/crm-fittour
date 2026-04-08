const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/licenseController');

// All authenticated users can view
router.get('/', auth, ctrl.getLicenses);

// Only admin/manager can create/update/delete
router.post('/', auth, (req, res, next) => {
    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Không có quyền thực hiện' });
    }
    next();
}, ctrl.createLicense);

router.put('/:id', auth, (req, res, next) => {
    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Không có quyền thực hiện' });
    }
    next();
}, ctrl.updateLicense);

router.delete('/:id', auth, (req, res, next) => {
    if (!['admin', 'manager'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Không có quyền thực hiện' });
    }
    next();
}, ctrl.deleteLicense);

module.exports = router;
