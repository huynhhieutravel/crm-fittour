const express = require('express');
const router = express.Router();
const controller = require('../controllers/voucherController');
const authenticateToken = require('../middleware/auth');
const { permCheck, permCheckAny } = require('../middleware/permCheck');

router.get('/', authenticateToken, permCheckAny([['vouchers','view_all'], ['vouchers','view_own']]), controller.getAllVouchers);
router.post('/', authenticateToken, permCheck('vouchers', 'create'), controller.createVoucher);
router.get('/booking/:bookingId', authenticateToken, permCheckAny([['vouchers','view_all'], ['vouchers','view_own']]), controller.getVouchersByBooking);
router.put('/:id/cancel', authenticateToken, permCheck('vouchers', 'cancel'), controller.cancelVoucher);
router.delete('/:id', authenticateToken, permCheck('vouchers', 'delete'), controller.deleteVoucher);

module.exports = router;
