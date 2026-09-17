/**
 * tourHelpers.js
 * Tiện ích dùng chung cho Sản phẩm / Tour
 */

/**
 * Kiểm tra xem một tour có phải là Tour Private (Đoàn riêng / May đo / Charter) hay không.
 * Một tour được xem là Private nếu:
 * 1. tour_type có chứa 'private' (vd: 'Private Tour', 'Private')
 * 2. code có chứa 'private' (vd: 'GIANG NAM PRIVATE')
 * 3. name có chứa từ 'private' (vd: 'Tour Thượng Hải - Hàng Châu (Private)')
 */
export const isPrivateTour = (tour) => {
  if (!tour) return false;
  const type = String(tour.tour_type || '').toLowerCase();
  if (type.includes('private')) return true;
  const code = String(tour.code || '').toLowerCase();
  if (code.includes('private')) return true;
  const name = String(tour.name || '').toLowerCase();
  if (/\bprivate\b/i.test(name)) return true;
  return false;
};
