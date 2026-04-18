---
description: Scaffold the Frontend Layout (Tab + Drawer) for a New Module using Standard CSS Tokens, Filters, and Modals.
---

# /scaffold-frontend-module — Tiêu chuẩn Clone Frontend React
Kích hoạt agent này để hướng dẫn LLM cách dựng (hoặc sửa) giao diện UI Cốt lõi của một Module nhằm đảm bảo 100% không bị lệch CSS, sai màu sắc hay sai vị trí Filter/Popup.

MỖI KHI XÂY DỰNG 1 TAB MỚI HOẶC 1 DRAWER MỚI, YÊU CẦU LLM TUÂN THỦ NGHIÊM NGẶT CÁC CẤU TRÚC HTML/CSS SAU ĐÂY:

## 1. Cấu trúc Khung Tab Chính (List View)
Mọi file `*Tab.jsx` đều phải bọc trong `<div style={{ padding: '0 2rem' }}>`.

### A. Thanh Filter (Filter Bar)
KHÔNG DÙNG inline-style hỗn loạn. Bắt buộc dùng class `.filter-bar`, `.filter-group`, `.filter-input`, `.filter-select`.

```jsx
{/* Thanh công cụ */}
<div className="filter-bar">
    {/* Ô Tìm Kiếm - Dài nhất */}
    <div className="filter-group" style={{ flex: '1 1 300px' }}>
        <label>TÌM KIẾM DỮ LIỆU</label>
        <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
                className="filter-input"
                style={{ paddingLeft: '40px', width: '100%' }}
                type="text"
                placeholder="Mã, tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
    </div>

    {/* Ô Bộ Lọc Select - react-select */}
    <div className="filter-group" style={{ flex: '0 0 240px' }}>
        <label>THỊ TRƯỜNG</label>
        <Select options={options} className="react-select-container" classNamePrefix="react-select" />
    </div>

    {/* Nút Thêm Mới */}
    <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '1.4rem' }}>
        <button className="btn-pro-save" onClick={handleAddNew}>
            <Plus size={18} /> Thêm Mới
        </button>
    </div>
</div>
```

### B. Bảng Dữ Liệu (Data Table)
Bắt buộc dùng wrapper `.data-table-container` và class bảng `.data-table` để kế thừa hover, shadow, padding.

```jsx
<div className="data-table-container">
    <table className="data-table">
        <thead>
            <tr>
                <th>MÃ</th>
                <th>TÊN KHÁCH</th>
                <th style={{ textAlign: 'center' }}>THAO TÁC</th>
            </tr>
        </thead>
        <tbody>
            {loading ? (
                <tr><td colSpan="3" style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</td></tr>
            ) : data.map(item => (
                <tr key={item.id}>
                    <td>{item.code}</td>
                    <td>{item.name}</td>
                    <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button className="btn-action btn-edit-pro" onClick={() => edit(item)}><Edit2 size={16}/></button>
                            <button className="btn-action btn-delete-pro" onClick={() => remove(item)}><Trash2 size={16}/></button>
                        </div>
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
```

### C. Phân Trang (Pagination)
```jsx
{totalPages > 1 && (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Hiển thị trang <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentPage}</span> trên <span style={{ fontWeight: 600, color: '#1e293b' }}>{totalPages}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-pro-cancel" style={{ padding: '6px 12px', height: 'auto' }}>Trang trước</button>
            <button className="btn-pro-cancel" style={{ padding: '6px 12px', height: 'auto' }}>Trang sau</button>
        </div>
    </div>
)}
```

## 2. Tiêu Chuẩn Ngăn Kéo (Drawer / Pop-up)
Tự code Drawer Overlay bằng DOM API (KHÔNG dùng component Default từ Browser như confirm/alert). Component Drawer nằm chung file hoặc tạo 1 component con `DetailDrawer.jsx`. Cấu trúc tĩnh:

```jsx
function DetailDrawer({ data, onClose }) {
    return (
        <div className="glass-modal-overlay" onClick={onClose}>
            {/* Click ngoài để đóng - e.stopPropagation chặn đóng khi click vào Drawer */}
            <div className="drawer-content slide-in-right" onClick={e => e.stopPropagation()} style={{ width: '800px', maxWidth: '90vw' }}>
                
                {/* Drawer Header */}
                <div className="drawer-header" style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                            {data ? `Cập nhật thông tin: ${data.code}` : 'Tạo mới hồ sơ'}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Vui lòng điền đầy đủ các thông tin bắt buộc (*).</p>
                    </div>
                    <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'}>
                        <X size={20} />
                    </button>
                </div>

                {/* Drawer Body Area (có thể chèn Flex/Grid) */}
                <div className="drawer-body" style={{ padding: '2rem', height: 'calc(100% - 150px)', overflowY: 'auto' }}>
                    {/* form fields here */}
                </div>

                {/* Drawer Footer Buttons */}
                <div className="drawer-footer" style={{ padding: '1.25rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'white', position: 'sticky', bottom: 0, zIndex: 10 }}>
                    <button className="btn-pro-cancel" onClick={onClose}>
                        Hủy bỏ
                    </button>
                    <button className="btn-pro-save" onClick={handleSave}>
                        <Save size={18} /> Lưu dữ liệu
                    </button>
                </div>
            </div>
        </div>
    );
}
```

## 3. Các Class Nút Bấm Khác
Nếu có thao tác trên Item của bảng:
- `btn-view-pro` (Màu xanh nước biển: icon con mắt `Eye`)
- `btn-edit-pro` (Màu xanh biển nhạt: icon Sửa `Edit2`)
- `btn-delete-pro` (Màu đỏ: icon Xóa `Trash2`)
- `btn-success-pro` (Màu xanh lá: icon `CheckCircle`)

## Lưu ý ⚠️
Để chạy Workflow này, chỉ cần dán yêu cầu: `/scaffold-frontend-module Build giao diện X` -> Agent sẽ phải tự xem file này và làm theo template 100%.
