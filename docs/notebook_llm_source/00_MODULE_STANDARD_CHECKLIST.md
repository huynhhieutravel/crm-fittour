# Tiêu Chuẩn Kỹ Thuật Khi Tạo/Cập Nhật Module Mới (FIT Tour CRM)

> Tài liệu này đóng vai trò như một "Bộ nhớ cốt lõi" cho AI và Developer khi làm việc với hệ thống FIT Tour CRM.
> YÊU CẦU BẮT BUỘC: Đọc kỹ tài liệu này trước khi thiết kế, tạo mới hoặc bảo trì bất kỳ Tab/Module nào (ví dụ: Khách sạn, Nhà cung cấp, Hướng dẫn viên, v.v.) nhằm tránh lặp lại các lỗi không đồng bộ UI/UX.

## 1. Cơ Chế Xóa Dữ Liệu (Deletion Flow)
**TUYỆT ĐỐI KHÔNG SỬ DỤNG local state nội bộ (`window.confirm`, local `Modal`) tại tab con để xác nhận xóa.** 
Mọi hành động xóa đều bắt buộc phải kết nối thông qua **Global Modal** thống nhất phân bổ tại `App.jsx`.

*Quy trình chuẩn mực:*
- **Bước 1:** Component `App.jsx` khai báo cờ rác (ví dụ: `newModuleToDelete`, `setNewModuleToDelete`) và có hàm thực thi rác `confirmDeleteNewModule()`.
- **Bước 2:** Truyền hàm đánh dấu rác cho tab con qua Props: `handleDeleteRecord={(id) => setNewModuleToDelete(id)}`.
- **Bước 3:** Tại tab con, chỉ việc gọi `onClick={() => handleDeleteRecord(item.id)}`. Điều này sẽ kích hoạt `App.jsx` bung Global Modal màu đen (Xác nhận xóa dữ liệu?).
- **Bước 4 (Catch 409):** Khi User bấm "XÓA THỰC SỰ", `App.jsx` sẽ gửi `axios.delete(...)`. Nếu API bị kẹp dữ liệu phụ thuộc, bắt 409 Conflict và chạy `window.confirm` xin lệnh force delete (tham khảo hàm xóa Hotel, Tour, Customer có sẵn).
- **Bước 5 (Làm mới nền):** Xóa thành công phải gọi `setNewModuleToDelete(null)`, gỡ Modal đi, và gửi tín hiệu Reload dạng Event qua cửa sổ Window: `window.dispatchEvent(new CustomEvent('reloadNewModuleTab'));`.
- **Bước 6:** Bên trong tab con, luôn cài sẵn event Listener đón tín hiệu Reset:
  ```javascript
  useEffect(() => {
      const handleReload = () => fetchData();
      window.addEventListener('reloadNewModuleTab', handleReload);
      return () => window.removeEventListener('reloadNewModuleTab', handleReload);
  }, []);
  ```

## 2. Thông Báo Giao Diện (Toast Notifications)
**KHÔNG dùng `alert()` cho các thông báo giao diện ở production.** Lệnh `alert()` chặn DOM và làm mất luồng trải nghiệm Single Page Application (SPA).
- Chỉ dùng `addToast` trên root (chuyền vào qua props từ `App.jsx`).
- *Cú pháp Thành công:* `addToast('Chỉnh sửa thành công!')`.
- *Cú pháp Lỗi:* `addToast('Lỗi: ' + error.message, 'error')`.

## 3. Trạng Thái Tải Đơn (Loading States)
Đây là gốc rễ của hiện tượng "chớp tắt màn hình" khi bấm Sửa/View.
- Bảng chính sử dụng state `loading` chung.
- Khi người dùng click nút Xem/Sửa mở Modal/Drawer lấy data chi tiết, **KHÔNG ĐƯỢC set `loading(true)`** vì thẻ Table sẽ bị Unmount.
- Bắt buộc tạo một Loading con `[actionLoading, setActionLoading] = useState(false)` chỉ để làm mờ nhẹ input hoặc vô hiệu hóa nút submit tạm thời. Màn hình phía sau phải không bị nhấp nháy.

## 4. Giao Diện Nhất Quán (UI/UX Harmony)
- Icon cho "Sửa / Xem" là `<Edit2 size={16} />` màu Blue (`#3b82f6`).
- Icon cho "Xóa" là `<Trash2 size={16} />` màu Red (`#ef4444`).
- Cấu trúc nút bấm luôn bọc trong thẻ `<button className="btn-icon" style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>`.
- Thiết kế thanh công cụ đầu vào quy mô Module luôn bắt buộc nhúng `<div className="filter-bar">` chứa box search ở góc trái và nút Thêm Mới `+` màu Xanh dương chuẩn ở góc phải.
