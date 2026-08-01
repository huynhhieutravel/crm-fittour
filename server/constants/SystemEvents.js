const SystemEvents = [
  // HR
  { code: 'LEAVE_REQUEST_CREATED', label: 'Đơn xin nghỉ phép', category: 'Nhân sự' },
  { code: 'LEAVE_REQUEST_APPROVED', label: 'Duyệt đơn nghỉ phép', category: 'Nhân sự' },
  { code: 'LEAVE_REQUEST_REJECTED', label: 'Từ chối đơn nghỉ phép', category: 'Nhân sự' },
  
  // Meeting Room
  { code: 'MEETING_ROOM_BOOKED', label: 'Đặt phòng họp mới', category: 'Phòng họp' },
  
  // Khách Hàng (Đánh giá)
  { code: 'MONTHLY_REVIEWS_STATS', label: 'Báo cáo Đánh giá hàng tháng', category: 'Khách hàng' },
  
  // Marketing & Dashboard
  { code: 'WEEKLY_MARKETING_ADS_STATS', label: 'Báo cáo Marketing Ads hàng tuần', category: 'Marketing' },
  { code: 'MONTHLY_MARKETING_ADS_STATS', label: 'Báo cáo Marketing Ads hàng tháng', category: 'Marketing' },
  { code: 'MONTHLY_DASHBOARD_STATS', label: 'Báo cáo Hiệu suất Tour hàng tháng', category: 'Sản phẩm Tour' },
  
  // CRM
  { code: 'LEAD_CREATED', label: 'Có Lead mới', category: 'Khách hàng' },
  { code: 'LEAD_ASSIGNED', label: 'Phân công Lead', category: 'Khách hàng' },
  { code: 'LEAD_STATUS_CHANGED', label: 'Cập nhật trạng thái Lead', category: 'Khách hàng' },
  
  // Booking
  { code: 'BOOKING_CREATED', label: 'Tạo Booking mới', category: 'Booking' },
  { code: 'BOOKING_CONFIRMED', label: 'Xác nhận Booking', category: 'Booking' },
  { code: 'BOOKING_CANCELLED', label: 'Hủy Booking', category: 'Booking' },
  
  // Tour
  { code: 'TOUR_CREATED', label: 'Tạo Tour mới', category: 'Sản phẩm Tour' },
  { code: 'TOUR_UPDATED', label: 'Cập nhật Tour', category: 'Sản phẩm Tour' },
  { code: 'TOUR_STATUS_CHANGED', label: 'Đổi trạng thái Tour', category: 'Sản phẩm Tour' },
  
  // Finance
  { code: 'INVOICE_CREATED', label: 'Tạo Invoice/Đề nghị', category: 'Kế toán' },
  { code: 'PAYMENT_RECEIVED', label: 'Nhận thanh toán', category: 'Kế toán' },
  
  // System
  { code: 'USER_CREATED', label: 'Tạo nhân sự mới', category: 'Hệ thống' },
  { code: 'PASSWORD_RESET', label: 'Cấp lại mật khẩu', category: 'Hệ thống' }
];

module.exports = SystemEvents;
