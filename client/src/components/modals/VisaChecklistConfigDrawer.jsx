import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { useVisaChecklistTemplate } from '../../hooks/useVisaChecklistTemplate';

const VisaChecklistConfigDrawer = ({ isOpen, onClose }) => {
    const { template, loading, saveTemplate } = useVisaChecklistTemplate();
    const [localTemplate, setLocalTemplate] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen && template) {
            // Deep copy to edit locally
            setLocalTemplate(JSON.parse(JSON.stringify(template)));
        }
    }, [isOpen, template]);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            setSaving(true);
            await saveTemplate(localTemplate);
            alert('Lưu cấu hình thành công!');
            onClose();
        } catch (error) {
            alert('Có lỗi xảy ra khi lưu cấu hình.');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const addGroup = () => {
        setLocalTemplate([...localTemplate, { group: 'Nhóm Mới', subgroup: '', items: [] }]);
    };

    const removeGroup = (gIdx) => {
        const confirmStr = 'Bạn có chắc muốn xoá nhóm này và toàn bộ tuỳ chọn bên trong?';
        if (window.confirm(confirmStr)) {
            const newTpl = [...localTemplate];
            newTpl.splice(gIdx, 1);
            setLocalTemplate(newTpl);
        }
    };

    const updateGroupTitle = (gIdx, val) => {
        const newTpl = [...localTemplate];
        newTpl[gIdx].group = val;
        setLocalTemplate(newTpl);
    };

    const updateSubgroupTitle = (gIdx, val) => {
        const newTpl = [...localTemplate];
        newTpl[gIdx].subgroup = val;
        setLocalTemplate(newTpl);
    };

    const addItem = (gIdx) => {
        const newTpl = [...localTemplate];
        newTpl[gIdx].items.push({ name: 'Tuỳ chọn mới', status: 'Chờ bổ sung', file_link: '' });
        setLocalTemplate(newTpl);
    };

    const updateItemName = (gIdx, iIdx, val) => {
        const newTpl = [...localTemplate];
        newTpl[gIdx].items[iIdx].name = val;
        setLocalTemplate(newTpl);
    };

    const updateItemNote = (gIdx, iIdx, val) => {
        const newTpl = [...localTemplate];
        newTpl[gIdx].items[iIdx].note = val;
        setLocalTemplate(newTpl);
    };

    const removeItem = (gIdx, iIdx) => {
        const newTpl = [...localTemplate];
        newTpl[gIdx].items.splice(iIdx, 1);
        setLocalTemplate(newTpl);
    };

    return (
        <div className="drawer-overlay" onClick={onClose} style={{ 
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end'
        }}>
            <div className="drawer-content" onClick={e => e.stopPropagation()} style={{ 
                width: '800px', maxWidth: '100%', background: '#f8fafc', height: '100%',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <div className="drawer-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={20} color="#3b82f6" /> Cấu hình Danh mục Giấy tờ Visa
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-pro-save" onClick={handleSave} disabled={saving} style={{ height: '36px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="drawer-body" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Đang tải cấu hình...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe', fontSize: '0.9rem', color: '#1e40af' }}>
                                <strong>Lưu ý:</strong> Thay đổi cấu trúc tại đây sẽ lập tức áp dụng cho Form mẫu của toàn bộ hệ thống.
                            </div>

                            {localTemplate.map((group, gIdx) => (
                                <div key={gIdx} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                                    <button 
                                        onClick={() => removeGroup(gIdx)}
                                        style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                        title="Xoá Nhóm"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', width: '90%' }}>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Tên Nhóm Lớn</label>
                                            <input 
                                                type="text" 
                                                value={group.group} 
                                                onChange={(e) => updateGroupTitle(gIdx, e.target.value)}
                                                className="form-control"
                                                style={{ width: '100%', fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}
                                                placeholder="Ví dụ: A - Hồ Sơ Công Ty"
                                            />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Tên Nhóm Nhỏ (Nếu có)</label>
                                            <input 
                                                type="text" 
                                                value={group.subgroup || ''} 
                                                onChange={(e) => updateSubgroupTitle(gIdx, e.target.value)}
                                                className="form-control"
                                                style={{ width: '100%', fontSize: '0.9rem' }}
                                                placeholder="Ví dụ: Giấy tờ tuỳ thân..."
                                            />
                                        </div>
                                    </div>

                                    <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '1rem' }}>
                                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#334155', marginBottom: '8px', fontWeight: 600 }}>Danh sách giấy tờ trong nhóm này:</label>
                                        
                                        {group.items.map((item, iIdx) => (
                                            <div key={iIdx} style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', background: '#f8fafc', padding: '10px', borderRadius: '6px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <GripVertical size={16} color="#cbd5e1" style={{ cursor: 'grab' }} />
                                                    <input 
                                                        type="text" 
                                                        value={item.name} 
                                                        onChange={(e) => updateItemName(gIdx, iIdx, e.target.value)}
                                                        className="form-control"
                                                        style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}
                                                        placeholder="Tên giấy tờ (VD: Hộ chiếu, CCCD...)"
                                                    />
                                                    <button 
                                                        onClick={() => removeItem(gIdx, iIdx)}
                                                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px' }}
                                                        title="Xóa giấy tờ này"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '26px' }}>
                                                    <input 
                                                        type="text" 
                                                        value={item.note || ''} 
                                                        onChange={(e) => updateItemNote(gIdx, iIdx, e.target.value)}
                                                        className="form-control"
                                                        style={{ flex: 1, fontSize: '0.85rem', color: '#64748b' }}
                                                        placeholder="Ghi chú thêm (VD: Gửi HC gốc, kèm visa rời...)"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <button 
                                            onClick={() => addItem(gIdx)}
                                            style={{ marginTop: '10px', background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '8px 12px', borderRadius: '6px', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <Plus size={14} /> Thêm tuỳ chọn giấy tờ
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button 
                                onClick={addGroup}
                                style={{ background: '#f1f5f9', border: '2px dashed #94a3b8', padding: '1rem', borderRadius: '8px', color: '#475569', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
                            >
                                <Plus size={18} /> THÊM NHÓM MỚI
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisaChecklistConfigDrawer;
