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

/**
 * Chuẩn hoá giới tính từ mọi nguồn:
 * - 'female', 'f', 'nữ', 'nu', 'w' -> 'Nữ'
 * - 'male', 'm', 'nam' -> 'Nam'
 * - 'chọn', '', null, undefined -> ''
 */
export const normalizeGender = (g) => {
  if (!g) return '';
  const str = String(g).trim().toLowerCase();
  if (str === 'chọn' || str === '---' || str === 'none' || str === 'chua_ro' || str === 'null' || str === 'undefined') return '';
  if (str === 'female' || str === 'f' || str === 'nữ' || str === 'nu' || str === 'w' || str.includes('nữ') || str.includes('female')) return 'Nữ';
  if (str === 'male' || str === 'm' || str === 'nam' || str.includes('nam') || str.includes('male')) return 'Nam';
  return g;
};

/**
 * Hiển thị tiếng Việt: 'Nam' | 'Nữ' | placeholder (mặc định '')
 */
export const formatGenderVN = (g, placeholder = '') => {
  const norm = normalizeGender(g);
  if (!norm) return placeholder;
  return norm;
};

/**
 * Hiển thị tiếng Anh (Namelist quốc tế): 'Male' | 'Female' | placeholder
 */
export const formatGenderEN = (g, placeholder = '') => {
  const norm = normalizeGender(g);
  if (norm === 'Nam') return 'Male';
  if (norm === 'Nữ') return 'Female';
  return placeholder;
};

/**
 * Mã 1 ký tự xuất DS Tour TQ / Visa: 'M' | 'F' | ''
 */
export const formatGenderCode = (g) => {
  const norm = normalizeGender(g);
  if (norm === 'Nam') return 'M';
  if (norm === 'Nữ') return 'F';
  return '';
};
