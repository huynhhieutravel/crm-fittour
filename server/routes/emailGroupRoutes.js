const express = require('express');
const router = express.Router();
const emailGroupController = require('../controllers/emailGroupController');

const auth = require('../middleware/auth');

// Phải có quyền admin hoặc manager
const roleCheck = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.get('/', auth, roleCheck, emailGroupController.getAllGroups);
router.get('/code/:code', auth, roleCheck, emailGroupController.getGroupByCode);
router.post('/', auth, roleCheck, emailGroupController.createGroup);
router.put('/:id', auth, roleCheck, emailGroupController.updateGroup);
router.delete('/:id', auth, roleCheck, emailGroupController.deleteGroup);

module.exports = router;
