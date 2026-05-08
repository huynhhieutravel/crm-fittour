const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');

// Static routes MUST come before /:id dynamic routes
router.get('/today', auth, leaveController.getTodayLeaves);
router.get('/balance/all', auth, leaveController.getAllBalances);
router.get('/balance', auth, leaveController.getMyBalance);
router.get('/balance/:userId', auth, leaveController.getMyBalance);
router.post('/balance/bulk', auth, leaveController.bulkUpdateBalance);
router.put('/balance', auth, leaveController.updateBalance);

router.get('/', auth, leaveController.getLeaves);
router.post('/', auth, leaveController.createLeave);
router.put('/:id', auth, leaveController.updateLeave);
router.delete('/:id', auth, leaveController.deleteLeave);

router.put('/:id/approve', auth, leaveController.approveLeave);
router.put('/:id/reject', auth, leaveController.rejectLeave);
router.put('/:id/pending', auth, leaveController.revertToPending);

module.exports = router;
