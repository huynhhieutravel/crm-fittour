import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, GripVertical, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import visaFormTemplateService from '../services/visaFormTemplateService';

const DEFAULT_FRANCE_VISA_FIELDS = [
    {
        name: "purpose",
        type: "select",
        label: "Mục đích chuyến đi",
        options: ["Du lịch", "Thăm thân", "Công tác", "Du học/Định cư"],
        allow_custom: true
    },
    {
        name: "job_type",
        type: "select",
        label: "Công việc hiện tại",
        options: [
            "Chủ doanh nghiệp",
            "Nhân viên hợp đồng",
            "Kinh doanh tự do",
            "Học sinh - Sinh viên",
            "Hưu trí",
            "Nội trợ / Thất nghiệp"
        ],
        allow_custom: true
    },
    {
        name: "travel_history",
        type: "textarea",
        label: "Lịch sử du lịch (Những nước từng đi)",
        placeholder: "VD: Đã đi Thái Lan, Singapore, Hàn Quốc, Nhật Bản..."
    },
    {
        name: "itinerary",
        type: "textarea",
        label: "Lịch trình dự kiến (Đi cùng ai?)",
        placeholder: "VD: Dự kiến đi tháng 10, đi cùng chồng và 2 con..."
    },
    {
        name: "assets",
        type: "textarea",
        label: "Tài sản hiện có",
        placeholder: "VD: Có 1 căn nhà mặt đất, 1 xe ô tô đứng tên cá nhân..."
    },
    {
        name: "finance",
        type: "textarea",
        label: "Tài chính",
        placeholder: "VD: Sổ tiết kiệm 500 triệu (đã gửi 3 tháng)..."
    }
];

const VisaFormTemplatesPage = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    
    // Form state
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [fields, setFields] = useState([]);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const res = await visaFormTemplateService.getTemplates();
            setTemplates(res.data);
        } catch (err) {
            toast.error("Lỗi lấy danh sách mẫu Form");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (template = null) => {
        if (template) {
            setEditingId(template.id);
            setName(template.name);
            setFields(template.fields || []);
        } else {
            setEditingId(null);
            setName('Mẫu Form Visa ');
            setFields(JSON.parse(JSON.stringify(DEFAULT_FRANCE_VISA_FIELDS)));
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleAddField = () => {
        setFields([...fields, { 
            name: `field_${Date.now()}`, 
            label: 'Câu hỏi mới', 
            type: 'text', 
            allow_custom: false,
            options: [] 
        }]);
    };

    const handleUpdateField = (index, key, value) => {
        const newFields = [...fields];
        newFields[index][key] = value;
        setFields(newFields);
    };

    const handleRemoveField = (index) => {
        const newFields = fields.filter((_, i) => i !== index);
        setFields(newFields);
    };

    const handleOptionsChange = (index, value) => {
        const options = value.split(',').map(o => o.trim()).filter(o => o);
        handleUpdateField(index, 'options', options);
    };

    const handleSave = async () => {
        if (!name.trim()) return toast.error("Vui lòng nhập tên mẫu Form");
        if (fields.length === 0) return toast.error("Mẫu Form cần ít nhất 1 câu hỏi");

        // Validate fields
        for (const field of fields) {
            if (!field.label.trim()) return toast.error("Có câu hỏi chưa nhập tiêu đề");
            if (field.type === 'select' && (!field.options || field.options.length === 0)) {
                return toast.error(`Câu hỏi "${field.label}" dạng chọn (Dropdown) cần ít nhất 1 lựa chọn`);
            }
        }

        try {
            toast.loading("Đang lưu...", { id: 'save' });
            if (editingId) {
                await visaFormTemplateService.updateTemplate(editingId, { name, fields, is_active: true });
                toast.success("Cập nhật thành công", { id: 'save' });
            } else {
                await visaFormTemplateService.createTemplate({ name, fields, is_active: true });
                toast.success("Tạo thành công", { id: 'save' });
            }
            fetchTemplates();
            handleCloseModal();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi lưu dữ liệu", { id: 'save' });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xoá mẫu Form này? Nếu đã có hồ sơ sử dụng mẫu này, hệ thống sẽ không cho phép xoá.")) return;
        try {
            toast.loading("Đang xoá...", { id: 'delete' });
            await visaFormTemplateService.deleteTemplate(id);
            toast.success("Xoá thành công", { id: 'delete' });
            fetchTemplates();
        } catch (err) {
            toast.error(err.response?.data?.message || "Lỗi xoá dữ liệu", { id: 'delete' });
        }
    };

    return (
        <div className="container-fluid" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>Quản Lý Mẫu Form Khảo Sát Visa</h2>
                <button onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3b82f6', color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                    <Plus size={18} /> Tạo Mẫu Form Mới
                </button>
            </div>

            <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên Mẫu Form</th>
                                <th>Số lượng câu hỏi</th>
                                <th>Ngày tạo</th>
                                <th style={{ textAlign: 'right' }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map(tpl => (
                                <tr key={tpl.id}>
                                    <td>#{tpl.id}</td>
                                    <td style={{ fontWeight: 600 }}>{tpl.name}</td>
                                    <td>{tpl.fields?.length || 0} câu</td>
                                    <td>{new Date(tpl.created_at).toLocaleDateString('vi-VN')}</td>
                                    <td style={{ textAlign: 'right' }}>
                                        <button onClick={() => handleOpenModal(tpl)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '16px' }}><Edit2 size={18} /></button>
                                        <button onClick={() => handleDelete(tpl.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal Form Builder */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                    <div style={{ background: 'white', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{editingId ? 'Chỉnh Sửa Mẫu Form' : 'Tạo Mẫu Form Mới'}</h3>
                            <button onClick={handleCloseModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={24} /></button>
                        </div>
                        
                        {/* Body */}
                        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, backgroundColor: '#f8fafc' }}>
                            <div className="form-group" style={{ marginBottom: '24px' }}>
                                <label style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Tên Mẫu Form <span style={{ color: 'red' }}>*</span></label>
                                <input type="text" className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="VD: Mẫu Visa Châu Âu (Schengen)" style={{ padding: '12px' }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem' }}>Danh Sách Câu Hỏi ({fields.length})</h4>
                                <button onClick={handleAddField} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', padding: '8px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <Plus size={16} /> Thêm câu hỏi
                                </button>
                            </div>

                            {fields.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                                    Chưa có câu hỏi nào. Hãy bấm "Thêm câu hỏi" để bắt đầu thiết kế Form.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {fields.map((field, index) => (
                                        <div key={index} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
                                                <button onClick={() => handleRemoveField(index)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </div>
                                            
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingRight: '32px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Tiêu đề câu hỏi (Label)</label>
                                                    <input type="text" className="form-control" value={field.label} onChange={e => handleUpdateField(index, 'label', e.target.value)} placeholder="VD: Tình trạng hôn nhân" />
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Mã định danh (Key trong DB)</label>
                                                    <input type="text" className="form-control" value={field.name} onChange={e => handleUpdateField(index, 'name', e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="VD: tinh_trang_hon_nhan" disabled={editingId ? true : false} title={editingId ? "Không thể đổi Key khi đã lưu để tránh mất dữ liệu cũ" : ""} />
                                                </div>
                                            </div>

                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
                                                <div>
                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Loại câu hỏi (Type)</label>
                                                    <select className="form-control" value={field.type} onChange={e => handleUpdateField(index, 'type', e.target.value)}>
                                                        <option value="text">Chữ ngắn (VD: Tên, SDT)</option>
                                                        <option value="textarea">Đoạn văn dài (VD: Lịch sử du lịch)</option>
                                                        <option value="select">Dropdown Trắc Nghiệm (Có sẵn Options)</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', display: 'block' }}>Placeholder (Gợi ý chữ mờ)</label>
                                                    <input type="text" className="form-control" value={field.placeholder || ''} onChange={e => handleUpdateField(index, 'placeholder', e.target.value)} placeholder="VD: Nhập thông tin..." />
                                                </div>
                                            </div>

                                            {field.type === 'select' && (
                                                <div style={{ marginTop: '16px', background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                    <label style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '4px', display: 'block', fontWeight: 600 }}>Các lựa chọn (Cách nhau bằng dấu phẩy)</label>
                                                    <input type="text" className="form-control" value={(field.options || []).join(', ')} onChange={e => handleOptionsChange(index, e.target.value)} placeholder="VD: Độc thân, Đã kết hôn, Ly dị" />
                                                    
                                                    <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <input type="checkbox" id={`custom_${index}`} checked={field.allow_custom || false} onChange={e => handleUpdateField(index, 'allow_custom', e.target.checked)} style={{ width: '16px', height: '16px' }} />
                                                        <label htmlFor={`custom_${index}`} style={{ margin: 0, fontSize: '0.9rem', cursor: 'pointer' }}>Cho phép khách chọn "Khác" và tự nhập tay thêm</label>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {editingId && (
                                <div style={{ marginTop: '20px', padding: '16px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                                    <AlertTriangle color="#d97706" size={24} style={{ flexShrink: 0 }} />
                                    <div style={{ color: '#92400e', fontSize: '0.9rem' }}>
                                        <strong>Lưu ý quan trọng (QA Rule):</strong> Việc xoá bớt một câu hỏi khỏi Form hoặc đổi Mã định danh (Key) có thể khiến dữ liệu của khách hàng cũ (đã điền trước đó) bị ẩn đi trên giao diện. Bạn nên hạn chế xoá câu hỏi cũ.
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Footer */}
                        <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                            <button onClick={handleCloseModal} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Huỷ</button>
                            <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: '#3b82f6', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                                <Save size={18} /> Lưu Mẫu Form
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VisaFormTemplatesPage;
