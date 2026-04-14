const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLogController');
const auth = require('../middleware/auth');
const permCheck = require('../middleware/permCheck');

// Require admin or manage_team level to view global audit logs (or a specific new permission if needed)
// For now, let's map it to users/view or settings/view, but Settings is safest for global logs.
router.get('/', auth, permCheck('settings', 'view'), auditLogController.getAuditLogs);

module.exports = router;
