const express = require('express');
const router = express.Router();
const controller = require('../controllers/voucherController');
const authenticateToken = require('../middleware/auth');

router.get('/', authenticateToken, controller.getAllVouchers);
router.post('/', authenticateToken, controller.createVoucher);
router.get('/booking/:bookingId', authenticateToken, controller.getVouchersByBooking);
router.put('/:id/cancel', authenticateToken, controller.cancelVoucher);
router.delete('/:id', authenticateToken, controller.deleteVoucher);

module.exports = router;
