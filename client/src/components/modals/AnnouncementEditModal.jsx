import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Sparkles, FileText, UserCheck, Calendar, Paperclip, Pin, Layers } from 'lucide-react';

const TEMPLATES = {
    notice: `<p>Nhằm mục đích chuẩn hóa quy trình vận hành và nâng cao hiệu quả phối hợp làm việc giữa các phòng ban trong Công ty TNHH Du lịch Quốc tế FIT TOUR, Ban Giám Đốc trân trọng thông báo:</p>
<p><strong>1. Mục đích & Nội dung chính:</strong></p>
<ul>
    <li>Toàn thể cán bộ nhân viên tuân thủ nghiêm túc các quy định đã ban hành.</li>
    <li>Mọi phát sinh sự cố trong quá trình triển khai tour cần được báo cáo kịp thời theo đúng luồng xử lý.</li>
</ul>
<p><strong>2. Thời gian và Phạm vi áp dụng:</strong></p>
<p>Thông báo này có hiệu lực kể từ ngày ký và được phổ biến đến toàn thể các bộ phận liên quan.</p>
<p>Đề nghị các Trưởng bộ phận, Giám đốc khối và toàn thể nhân viên nghiêm túc thực hiện thông báo này.</p>`,

    decision: `<p><em>- Căn cứ Điều lệ tổ chức và hoạt động của Công ty TNHH Du lịch Quốc tế FIT TOUR;</em></p>
<p><em>- Căn cứ nhu cầu thực tế và năng lực phát triển của các khối kinh doanh;</em></p>
<p><em>- Xét đề nghị của Phòng Hành chính - Nhân sự.</em></p>
<h3 style="text-align: center; text-transform: uppercase; margin: 20px 0 15px;">QUYẾT ĐỊNH:</h3>
<p><strong>Điều 1.</strong> Ban hành kèm theo quyết định này Quy chế làm việc và cơ chế phối hợp nội bộ mới dành cho khối nhân sự trực thuộc.</p>
<p><strong>Điều 2.</strong> Quyết định này có hiệu lực thi hành kể từ ngày ký. Các quy định trước đây trái với quyết định này đều bãi bỏ.</p>
<p><strong>Điều 3.</strong> Các Trưởng bộ phận, Trưởng phòng Kinh doanh, Điều hành và các cá nhân có tên chịu trách nhiệm thi hành quyết định này.</p>`,

    holiday: `<p>Ban Giám Đốc Công ty TNHH Du lịch Quốc tế FIT TOUR xin trân trọng thông báo đến toàn thể Quý Đối tác, Quý Khách hàng cùng toàn thể Cán bộ - Nhân viên lịch nghỉ lễ như sau:</p>
<p><strong>1. Thời gian nghỉ lễ:</strong></p>
<ul>
    <li><strong>Bắt đầu nghỉ:</strong> Kể từ ngày ... tháng ... năm 2026.</li>
    <li><strong>Thời gian đi làm lại:</strong> Ngày ... tháng ... năm 2026.</li>
</ul>
<p><strong>2. Phân công trực ban & Hỗ trợ khẩn cấp:</strong></p>
<p>Các khối Hướng dẫn viên và Điều hành tour đang thực hiện hành trình vẫn duy trì kênh liên lạc 24/7 để đảm bảo hỗ trợ khách hàng tốt nhất.</p>
<p>Kính chúc toàn thể CBNV có một kỳ nghỉ lễ thật vui vẻ, hạnh phúc và an toàn!</p>`
};

export default function AnnouncementEditModal({ item, onClose, onSaved, addToast }) {
    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        code: item?.code || '',
        title: item?.title || '',
        category: item?.category || 'Thông báo',
        issue_date: item?.issue_date ? item.issue_date.split('T')[0] : new Date().toISOString().split('T')[0],
        effective_date: item?.effective_date ? item.effective_date.split('T')[0] : '',
        signer_id: item?.signer_id || '',
        signer_name: item?.signer_name || '',
        signer_position: item?.signer_position || '',
        recipient_scope: item?.recipient_scope || 'Toàn thể CBNV',
        summary: item?.summary || '',
        content_html: item?.content_html || TEMPLATES.notice,
        attachment_url: item?.attachment_url || '',
        is_pinned: Boolean(item?.is_pinned),
        status: item?.status || 'published'
    });

    useEffect(() => {
        fetchUsers();
        if (!item) {
            handleAutoGenerateCode('TB');
        }
    }, []);

    const fetchUsers = async () => {
        try {
            setLoadingUsers(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } });
            setUsers(res.data);

            // If creating new and no signer set, default to Nguyễn Nhất Vũ (Tổng Giám Đốc)
            if (!item) {
                const vuUser = res.data.find(u => u.full_name?.toLowerCase().includes('vũ') || u.full_name?.toLowerCase().includes('vu'));
                if (vuUser) {
                    setFormData(prev => ({
                        ...prev,
                        signer_id: vuUser.id,
                        signer_name: vuUser.full_name,
                        signer_position: vuUser.position || 'Tổng Giám Đốc'
                    }));
                } else {
                    setFormData(prev => ({
                        ...prev,
                        signer_name: 'Nguyễn Nhất Vũ',
                        signer_position: 'Tổng Giám Đốc'
                    }));
                }
            }
        } catch (err) {
            console.error('Failed to fetch users for signer selection:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const handleAutoGenerateCode = async (typeOverride) => {
        try {
            const token = localStorage.getItem('token');
            const type = typeOverride || (formData.category === 'Quyết định' ? 'QD' : 'TB');
            const res = await axios.get(`/api/announcements/suggest-code?type=${type}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data?.code) {
                setFormData(prev => ({ ...prev, code: res.data.code }));
                if (addToast) addToast(`Đã tự động tạo mã: ${res.data.code}`, 'info');
            }
        } catch (err) {
            console.error('Error generating code:', err);
        }
    };

    const handleSignerChange = (userId) => {
        const selected = users.find(u => u.id === parseInt(userId, 10));
        if (selected) {
            setFormData(prev => ({
                ...prev,
                signer_id: selected.id,
                signer_name: selected.full_name,
                signer_position: selected.position || (selected.role_name === 'admin' ? 'Tổng Giám Đốc' : 'Trưởng Bộ Phận')
            }));
        } else {
            setFormData(prev => ({ ...prev, signer_id: '', signer_name: '', signer_position: '' }));
        }
    };

    const handleApplyTemplate = (type) => {
        const tpl = TEMPLATES[type];
        if (tpl) {
            setFormData(prev => ({ ...prev, content_html: tpl }));
            if (addToast) addToast('Đã áp dụng khung văn bản mẫu!', 'success');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) return addToast ? addToast('Vui lòng nhập tiêu đề văn bản!', 'warning') : alert('Nhập tiêu đề');
        if (!formData.code.trim()) return addToast ? addToast('Vui lòng nhập mã số văn bản!', 'warning') : alert('Nhập mã số');
        if (!formData.content_html.trim()) return addToast ? addToast('Vui lòng nhập nội dung văn bản!', 'warning') : alert('Nhập nội dung');

        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (item?.id) {
                await axios.put(`/api/announcements/${item.id}`, formData, config);
                if (addToast) addToast('Đã cập nhật văn bản thông báo!', 'success');
            } else {
                await axios.post('/api/announcements', formData, config);
                if (addToast) addToast('Đã tạo văn bản thông báo mới!', 'success');
            }

            if (onSaved) onSaved();
            onClose();
        } catch (err) {
            console.error(err);
            if (addToast) addToast(err.response?.data?.message || 'Lỗi khi lưu văn bản', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="announcement-edit-overlay">
            <style>{`
                .announcement-edit-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(6px);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 16px;
                }
                .announcement-edit-card {
                    background: white;
                    border-radius: 16px;
                    width: 900px;
                    max-width: 100%;
                    max-height: 92vh;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);
                    overflow: hidden;
                }
                @media (max-width: 640px) {
                    .announcement-edit-overlay {
                        padding: 8px;
                    }
                    .announcement-edit-card {
                        border-radius: 12px;
                        max-height: 96vh;
                    }
                    .announcement-edit-form {
                        padding: 14px !important;
                        gap: 14px !important;
                    }
                }
            `}</style>

            <div className="announcement-edit-card">
                
                {/* Header */}
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <FileText size={18} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                                {item ? `Sửa văn bản: ${item.code}` : 'Soạn Thảo Văn Bản Mới'}
                            </h3>
                            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                                Chuẩn thể thức văn bản nội bộ ERP FIT Tour
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body Form */}
                <form className="announcement-edit-form" onSubmit={handleSubmit} style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Row 1: Code & Category & Status */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Mã số văn bản *
                            </label>
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="VD: TB-2026/08/01-FIT"
                                    style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', fontWeight: 600, color: '#0284c7' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleAutoGenerateCode()}
                                    title="Tự động tạo mã tiếp theo"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0 12px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                                >
                                    <Sparkles size={14} /> Tự tạo mã
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Loại văn bản *
                            </label>
                            <select
                                value={formData.category}
                                onChange={e => {
                                    const cat = e.target.value;
                                    setFormData({ ...formData, category: cat });
                                    if (!item) {
                                        handleAutoGenerateCode(cat === 'Quyết định' ? 'QD' : 'TB');
                                    }
                                }}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}
                            >
                                <option value="Thông báo">Thông báo nội bộ</option>
                                <option value="Quyết định">Quyết định ban hành</option>
                                <option value="Quy chế">Quy chế - Quy định</option>
                                <option value="Thông báo nghỉ lễ">Thông báo nghỉ lễ</option>
                                <option value="Hướng dẫn công việc">Hướng dẫn công việc</option>
                                <option value="Khác">Khác</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Trạng thái
                            </label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}
                            >
                                <option value="published">Đã ban hành (Hiển thị)</option>
                                <option value="draft">Bản nháp (Chỉ Admin/Manager)</option>
                                <option value="expired">Hết hiệu lực</option>
                            </select>
                        </div>
                    </div>

                    {/* Row 2: Title */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Tiêu đề văn bản *
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            placeholder="VD: Thông báo nghỉ lễ Quốc Khánh 2/9 năm 2026 hoặc Quyết định ban hành cơ chế thưởng BU5..."
                            style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', fontWeight: 500 }}
                        />
                    </div>

                    {/* Row 3: Signer & Dates */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                <UserCheck size={14} style={{ display: 'inline', marginRight: '4px' }} /> Người ra quyết định / Người ký *
                            </label>
                            <select
                                value={formData.signer_id}
                                onChange={e => handleSignerChange(e.target.value)}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', background: 'white' }}
                            >
                                <option value="">-- Chọn nhân sự ký duyệt --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.full_name} ({u.position || u.role_name})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Chức danh hiển thị trên văn bản
                            </label>
                            <input
                                type="text"
                                value={formData.signer_position}
                                onChange={e => setFormData({ ...formData, signer_position: e.target.value })}
                                placeholder="VD: Tổng Giám Đốc, Trưởng Phòng..."
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} /> Ngày ban hành *
                            </label>
                            <input
                                type="date"
                                value={formData.issue_date}
                                onChange={e => setFormData({ ...formData, issue_date: e.target.value })}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Row 4: Recipients & Effective Date */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                Nơi nhận / Phạm vi áp dụng
                            </label>
                            <input
                                type="text"
                                value={formData.recipient_scope}
                                onChange={e => setFormData({ ...formData, recipient_scope: e.target.value })}
                                placeholder="VD: Toàn thể CBNV, Khối Sales, Khối Điều Hành..."
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                            />
                            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                                {['Toàn thể CBNV', 'Khối Sales', 'Khối Điều Hành', 'Khối HDV', 'Phòng Kế Toán'].map(chip => (
                                    <button
                                        type="button"
                                        key={chip}
                                        onClick={() => setFormData({ ...formData, recipient_scope: chip })}
                                        style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', cursor: 'pointer' }}
                                    >
                                        + {chip}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                                <Paperclip size={14} style={{ display: 'inline', marginRight: '4px' }} /> Link File Đính kèm / Scan (nếu có)
                            </label>
                            <input
                                type="url"
                                value={formData.attachment_url}
                                onChange={e => setFormData({ ...formData, attachment_url: e.target.value })}
                                placeholder="https://drive.google.com/..."
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Row 5: Summary */}
                    <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                            Trích yếu tóm tắt ngắn (Dưới 300 ký tự)
                        </label>
                        <textarea
                            value={formData.summary}
                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                            placeholder="Tóm tắt 1-2 câu nội dung để nhân viên dễ nắm bắt và tìm kiếm..."
                            rows={2}
                            maxLength={300}
                            style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', resize: 'none' }}
                        />
                    </div>

                    {/* Row 6: Content Editor & Template Buttons */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                                Nội dung chi tiết văn bản (HTML / Rich Text) *
                            </label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Chèn mẫu nhanh:</span>
                                <button
                                    type="button"
                                    onClick={() => handleApplyTemplate('notice')}
                                    style={{ fontSize: '12px', padding: '3px 8px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Mẫu Thông Báo
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleApplyTemplate('decision')}
                                    style={{ fontSize: '12px', padding: '3px 8px', background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Mẫu Quyết Định
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleApplyTemplate('holiday')}
                                    style={{ fontSize: '12px', padding: '3px 8px', background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    Mẫu Nghỉ Lễ
                                </button>
                            </div>
                        </div>

                        <textarea
                            value={formData.content_html}
                            onChange={e => setFormData({ ...formData, content_html: e.target.value })}
                            placeholder="Nhập nội dung văn bản theo các điều khoản..."
                            rows={10}
                            style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', fontFamily: 'monospace', outline: 'none', lineHeight: 1.5 }}
                        />
                        <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                            * Hỗ trợ định dạng HTML (thẻ &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;table&gt;, &lt;h3&gt;). Khi bấm "Xem", văn bản sẽ tự động chuyển thành trang A4 Word in hoa chỉnh chu.
                        </div>
                    </div>

                    {/* Row 7: Pin checkbox */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                        <input
                            type="checkbox"
                            id="pinCheckbox"
                            checked={formData.is_pinned}
                            onChange={e => setFormData({ ...formData, is_pinned: e.target.checked })}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        <label htmlFor="pinCheckbox" style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Pin size={14} color="#eab308" /> Ghim văn bản này lên đầu danh sách (Thông báo quan trọng)
                        </label>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            style={{ padding: '9px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.7 : 1 }}
                        >
                            <Save size={16} /> {saving ? 'Đang lưu...' : (item ? 'Lưu Thay Đổi' : 'Ban Hành Văn Bản')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
