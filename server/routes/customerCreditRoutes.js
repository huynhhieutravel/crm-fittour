/**
 * Routes: Quản lý Bảo lưu tiền cọc & Hạn mức tín dụng khách hàng (ADR 0011)
 */
const express = require('express');
const router = express.Router();
const controller = require('../controllers/customerCreditController');
const auth = require('../middleware/auth');

// 1. Tách Booking & Bảo lưu tiền cọc cho hành khách hủy
router.post('/split-and-retain', auth, controller.splitAndRetainDeposit);

// 2. Tra cứu danh sách phiếu bảo lưu còn hiệu lực (tìm theo SĐT hoặc mã)
router.get('/active', auth, controller.getActiveCredits);

// 3. Cấn trừ tiền bảo lưu vào Booking mới
router.post('/drawdown', auth, controller.drawdownCredit);

// 4. Chi tiết phiếu bảo lưu để In / Tải PDF
router.get('/:id/voucher', auth, controller.getCreditVoucher);

module.exports = router;

