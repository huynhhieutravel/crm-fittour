const meetingRoomService = require('../services/meetingRoomService');

// Lấy danh sách lịch họp
exports.getBookings = async (req, res) => {
    try {
        const { start, end } = req.query;
        const bookings = await meetingRoomService.getBookings(start, end);
        res.json(bookings);
    } catch (err) {
        console.error("Lỗi getBookings:", err.message);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
};

// Đặt lịch họp mới
exports.createBooking = async (req, res) => {
    try {
        const newBooking = await meetingRoomService.createBooking(req.body, req.user);
        res.status(201).json(newBooking);
    } catch (err) {
        console.error("Lỗi createBooking:", err.message);
        if (err.message.includes('Phòng đã được đặt')) {
            return res.status(409).json({ error: err.message });
        }
        if (err.message.includes('Thiếu thông tin') || err.message.includes('quá khứ') || err.message.includes('Thời lượng')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
};

// Cập nhật lịch họp
exports.updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBooking = await meetingRoomService.updateBooking(id, req.body, req.user);
        res.json(updatedBooking);
    } catch (err) {
        console.error("Lỗi updateBooking:", err.message);
        if (err.message.includes('trùng với một lịch họp khác')) {
            return res.status(409).json({ error: err.message });
        }
        if (err.message.includes('Thiếu thông tin') || err.message.includes('quá khứ') || err.message.includes('Thời lượng') || err.message.includes('đã bắt đầu')) {
            return res.status(400).json({ error: err.message });
        }
        if (err.message.includes('Không tìm thấy')) {
            return res.status(404).json({ error: err.message });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

// Hủy lịch họp
exports.deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await meetingRoomService.deleteBooking(id, req.user);
        res.json(result);
    } catch (err) {
        console.error("Lỗi deleteBooking:", err.message);
        if (err.message.includes('Không tìm thấy')) {
            return res.status(404).json({ error: err.message });
        }
        if (err.message.includes('bị huỷ trước đó') || err.message.includes('đã bắt đầu hoặc đã kết thúc')) {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Server error' });
    }
};
