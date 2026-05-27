const express = require('express');
const router = express.Router();
const emailRuleController = require('../controllers/emailRuleController');
const auth = require('../middleware/auth');

const roleCheck = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'manager')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

router.get('/events', auth, roleCheck, emailRuleController.getSystemEvents);
router.get('/', auth, roleCheck, emailRuleController.getAllRules);
router.post('/', auth, roleCheck, emailRuleController.createRule);
router.put('/:id', auth, roleCheck, emailRuleController.updateRule);
router.delete('/:id', auth, roleCheck, emailRuleController.deleteRule);

module.exports = router;
