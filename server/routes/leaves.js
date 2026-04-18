const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const auth = require('../middleware/auth');

router.get('/', auth, leaveController.getLeaves);
router.post('/', auth, leaveController.createLeave);
router.delete('/:id', auth, leaveController.deleteLeave);

router.get('/today', auth, leaveController.getTodayLeaves);
router.get('/balance/all', auth, leaveController.getAllBalances);
router.get('/balance', auth, leaveController.getMyBalance);
router.get('/balance/:userId', auth, leaveController.getMyBalance);
router.post('/balance/bulk', auth, leaveController.bulkUpdateBalance);
router.put('/balance', auth, leaveController.updateBalance);

router.put('/:id/approve', auth, leaveController.approveLeave);
router.put('/:id/reject', auth, leaveController.rejectLeave);

module.exports = router;
