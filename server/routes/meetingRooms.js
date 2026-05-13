const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const meetingRoomController = require('../controllers/meetingRoomController');

// Lấy danh sách lịch họp
router.get('/', auth, meetingRoomController.getBookings);

// Tạo lịch họp mới
router.post('/', auth, meetingRoomController.createBooking);

// Cập nhật lịch họp
router.put('/:id', auth, meetingRoomController.updateBooking);

// Hủy lịch họp
router.delete('/:id', auth, meetingRoomController.deleteBooking);

module.exports = router;
