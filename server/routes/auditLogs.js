const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const auth = require('../middleware/auth');
const permCheck = require('../middleware/permCheck');

router.get('/', auth, permCheck('settings', 'view'), auditLogController.getAuditLogs);
router.get('/trash', auth, permCheck('settings', 'view'), auditLogController.getTrash);
router.post('/restore', auth, permCheck('settings', 'view'), auditLogController.restoreTrash);

module.exports = router;
