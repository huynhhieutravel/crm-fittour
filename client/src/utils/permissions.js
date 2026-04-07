/**
 * PERMISSIONS UTILITY - Nguồn sự thật duy nhất cho quyền Frontend
 * 
 * Mọi Drawer/Tab phải import hàm này thay vì tự viết isViewOnly.
 * Khi cần thay đổi quyền, CHỉ SỬA FILE NÀY - 1 lần duy nhất.
 */

// Các role được phép CHỈNH SỬA (Create/Edit) trong từng nhóm module
const EDIT_ROLES = {
    // Module chính (Tour, Booking, Lead, Customer...)
    core: ['admin', 'manager', 'operations'],
    
    // Module Tour Đoàn / MICE (Group Projects, Group Leaders, Group NCC...)
    group: ['admin', 'manager', 'operations', 'group_manager', 'group_staff'],
    
    // Module NCC (Hotels, Restaurants, Transport, Airline, Insurance, Landtour, Ticket)
    suppliers: ['admin', 'manager', 'operations'],
};

// Các role được phép XÓA (Delete)
const DELETE_ROLES = {
    core: ['admin', 'manager'],
    group: ['admin', 'manager', 'group_manager'],
    suppliers: ['admin', 'manager'],
};

// Các role được phép TẠO MỚI (Create / Nút "Thêm")
const CREATE_ROLES = {
    core: ['admin', 'manager', 'operations'],
    group: ['admin', 'manager', 'operations', 'group_manager', 'group_staff'],
    suppliers: ['admin', 'manager', 'operations'],
};

/**
 * Kiểm tra user có quyền chỉnh sửa module hay không
 * @param {string} role - Role của currentUser
 * @param {string} moduleGroup - 'core' | 'group' | 'suppliers'
 * @returns {boolean}
 */
export const canEdit = (role, moduleGroup = 'core') => {
    return (EDIT_ROLES[moduleGroup] || EDIT_ROLES.core).includes(role);
};

/**
 * Kiểm tra user có quyền xóa trong module hay không  
 * @param {string} role - Role của currentUser
 * @param {string} moduleGroup - 'core' | 'group' | 'suppliers'
 * @returns {boolean}
 */
export const canDelete = (role, moduleGroup = 'core') => {
    return (DELETE_ROLES[moduleGroup] || DELETE_ROLES.core).includes(role);
};

/**
 * Kiểm tra user có quyền tạo mới trong module hay không
 * @param {string} role - Role của currentUser
 * @param {string} moduleGroup - 'core' | 'group' | 'suppliers'
 * @returns {boolean}
 */
export const canCreate = (role, moduleGroup = 'core') => {
    return (CREATE_ROLES[moduleGroup] || CREATE_ROLES.core).includes(role);
};

/**
 * Shortcut: Trả về isViewOnly (ngược lại canEdit)
 * Dùng khi cần drop-in thay thế biến isViewOnly cũ
 */
export const isViewOnly = (role, moduleGroup = 'core') => {
    return !canEdit(role, moduleGroup);
};
