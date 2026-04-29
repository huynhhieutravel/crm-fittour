import Swal from 'sweetalert2';

/**
 * Thay thế window.confirm() — KHÔNG gây chớp tắt trình duyệt.
 * Trả về Promise<boolean>. Sử dụng: const ok = await swalConfirm('Nội dung?');
 */
export async function swalConfirm(message, { title = 'Xác nhận', confirmText = 'Đồng ý', cancelText = 'Hủy bỏ', icon = 'question' } = {}) {
    const result = await Swal.fire({
        title,
        html: message.replace(/\n/g, '<br/>'),
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
    });
    return result.isConfirmed;
}

/**
 * Thay thế window.confirm() cho hành động XÓA — hiển thị cảnh báo đỏ.
 */
export async function swalConfirmDelete(message, { title = 'Xác nhận xóa' } = {}) {
    return swalConfirm(message, { title, confirmText: 'Xóa', icon: 'warning' });
}

/**
 * Thay thế window.prompt() — KHÔNG gây chớp tắt trình duyệt.
 * Trả về Promise<string|null>. null = user hủy.
 */
export async function swalPrompt(message, { title = 'Nhập thông tin', placeholder = '', defaultValue = '' } = {}) {
    const result = await Swal.fire({
        title,
        text: message,
        input: 'text',
        inputPlaceholder: placeholder,
        inputValue: defaultValue,
        showCancelButton: true,
        confirmButtonText: 'Xác nhận',
        cancelButtonText: 'Hủy',
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
    });
    return result.isConfirmed ? result.value : null;
}
