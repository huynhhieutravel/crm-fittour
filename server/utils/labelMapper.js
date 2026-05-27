const LABEL_MAP = {
  // Common
  id: 'Mã số (ID)',
  created_at: 'Ngày tạo',
  updated_at: 'Ngày cập nhật',
  status: 'Trạng thái',
  
  // User/HR
  employee_name: 'Tên nhân viên',
  leave_type: 'Loại nghỉ',
  from_date: 'Từ ngày',
  to_date: 'Đến ngày',
  days: 'Số ngày',
  reason: 'Lý do',
  full_name: 'Họ và tên',
  email: 'Email',
  phone: 'Số điện thoại',
  username: 'Tên đăng nhập',
  
  // CRM / Leads
  lead_name: 'Tên Lead',
  lead_source: 'Nguồn Lead',
  customer_name: 'Tên khách hàng',
  contact_info: 'Thông tin liên hệ',
  assigned_to: 'Người phụ trách',
  priority: 'Mức độ ưu tiên',
  
  // Booking / Tour
  booking_code: 'Mã Booking',
  tour_name: 'Tên Tour',
  tour_code: 'Mã Tour',
  departure_date: 'Ngày khởi hành',
  pax_count: 'Số lượng khách',
  total_amount: 'Tổng tiền',
  
  // Finance
  invoice_code: 'Mã Hóa đơn/Đề nghị',
  amount: 'Số tiền',
  payment_method: 'Phương thức thanh toán'
};

/**
 * Maps a raw JSON key to a readable Vietnamese label.
 * Fallbacks to capitalizing the raw key if no mapping exists.
 */
function getLabel(key) {
  if (LABEL_MAP[key]) return LABEL_MAP[key];
  
  // Fallback: remove underscores and capitalize first letter
  return key.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase());
}

module.exports = {
  getLabel,
  LABEL_MAP
};
