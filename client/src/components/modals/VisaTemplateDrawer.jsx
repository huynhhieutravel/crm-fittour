import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, AlertTriangle } from 'lucide-react';
import Select from 'react-select';
import { canEdit, canCreate, canDelete } from '../../utils/permissions';
import { swalConfirm } from '../../utils/swalHelpers';
import { useMarkets } from '../../hooks/useMarkets';
import { useVisaChecklistTemplate } from '../../hooks/useVisaChecklistTemplate';

const reactSelectStyles = {
    control: (base) => ({
        ...base, height: '42px', minHeight: '42px', borderRadius: '8px', borderColor: '#cbd5e1'
    }),
    valueContainer: (base) => ({ ...base, padding: '0 12px' })
};

const VISA_TYPES = ['Visa Dán', 'E-Visa', 'Khác'];

const VisaTemplateDrawer = ({ isOpen, onClose, templateId, refreshData, checkPerm, currentUser }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        market: '',
        visa_type: 'Visa Dán',
        is_active: true,
        checklist_config: []
    });

    const marketOptions = useMarkets();
    const { template: VISA_CHECKLIST_TEMPLATE, loading: templateLoading } = useVisaChecklistTemplate();

    useEffect(() => {
        if (templateId) {
            fetchTemplate();
        } else {
            // Default select all? Or select none? Let's select none by default.
            setFormData({
                name: '',
                market: '',
                visa_type: 'Visa Dán',
                is_active: true,
                checklist_config: []
            });
        }
    }, [templateId]);

    const fetchTemplate = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/visa-templates/${templateId}`);
            setFormData({
                name: res.data.name || '',
                market: res.data.market || '',
                visa_type: res.data.visa_type || 'Visa Dán',
                is_active: res.data.is_active,
                checklist_config: res.data.checklist_config || []
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleItemToggle = (itemName) => {
        setFormData(prev => {
            const config = [...prev.checklist_config];
            const idx = config.indexOf(itemName);
            if (idx > -1) {
                config.splice(idx, 1);
            } else {
                config.push(itemName);
            }
            return { ...prev, checklist_config: config };
        });
    };

    const handleGroupToggle = (groupItems, isAllSelected) => {
        setFormData(prev => {
            let config = [...prev.checklist_config];
            if (isAllSelected) {
                // Remove all from group
                groupItems.forEach(item => {
                    config = config.filter(name => name !== item.name);
                });
            } else {
                // Add all from group
                groupItems.forEach(item => {
                    if (!config.includes(item.name)) {
                        config.push(item.name);
                    }
                });
            }
            return { ...prev, checklist_config: config };
        });
    };

    const handleSave = async () => {
        if (!formData.name || !formData.market) {
            alert('Vui lòng nhập Tên Sản phẩm và Thị trường!');
            return;
        }

        try {
            if (templateId) {
                await axios.put(`/api/visa-templates/${templateId}`, formData);
            } else {
                await axios.post('/api/visa-templates', formData);
            }
            refreshData();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu');
        }
    };

    const handleDelete = async () => {
        const confirmed = await swalConfirm('Xác nhận xóa', 'Bạn có chắc muốn xóa Sản phẩm Visa này? Lưu ý: Không thể xóa nếu đã có hồ sơ sử dụng sản phẩm này.');
        if (!confirmed) return;

        try {
            await axios.delete(`/api/visa-templates/${templateId}`);
            refreshData();
            onClose();
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa');
        }
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
                
                {/* Header */}
                <div className="drawer-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>
                        {templateId ? 'Cập nhật Sản phẩm Visa' : 'Thêm Sản phẩm Visa'}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {templateId && (checkPerm ? checkPerm('visas', 'delete') : canDelete(currentUser?.role, 'visas')) && (
                            <button className="btn-pro-danger" onClick={handleDelete} style={{ height: '36px', padding: '0 12px' }}>
                                Xóa
                            </button>
                        )}
                        {(checkPerm ? checkPerm('visas', 'edit') : canEdit(currentUser?.role, 'visas')) && (
                            <button className="btn-pro-save" onClick={handleSave} style={{ height: '36px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Save size={16} /> Lưu
                            </button>
                        )}
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#64748b' }}>
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="drawer-body" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                    {(loading || templateLoading) ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Đang tải...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 2 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Tên Sản phẩm Visa <span style={{color: 'red'}}>*</span></label>
                                    <input 
                                        type="text" 
                                        value={formData.name} 
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                        style={{ width: '100%', padding: '0 12px', height: '42px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
                                        placeholder="VD: Visa du lịch Pháp"
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Trạng thái</label>
                                    <Select 
                                        options={[{value: true, label: 'Hoạt động'}, {value: false, label: 'Tạm ngưng'}]}
                                        value={{ value: formData.is_active, label: formData.is_active ? 'Hoạt động' : 'Tạm ngưng' }}
                                        onChange={opt => setFormData({...formData, is_active: opt.value})}
                                        styles={reactSelectStyles}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Thị trường <span style={{color: 'red'}}>*</span></label>
                                    <Select 
                                        options={marketOptions}
                                        value={formData.market ? { label: formData.market, value: formData.market } : null}
                                        onChange={opt => setFormData({...formData, market: opt ? opt.value : ''})}
                                        styles={reactSelectStyles}
                                        placeholder="Chọn..."
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Loại Visa</label>
                                    <Select 
                                        options={VISA_TYPES.map(t => ({value: t, label: t}))}
                                        value={formData.visa_type ? { label: formData.visa_type, value: formData.visa_type } : null}
                                        onChange={opt => setFormData({...formData, visa_type: opt ? opt.value : ''})}
                                        styles={reactSelectStyles}
                                        placeholder="Chọn..."
                                    />
                                </div>
                            </div>

                            <div style={{ marginTop: '1rem', borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
                                <h4 style={{ margin: '0 0 1rem 0', color: '#1e293b', fontSize: '1rem', fontWeight: 700 }}>
                                    Cấu hình Master Checklist
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {VISA_CHECKLIST_TEMPLATE.map((group, gIdx) => {
                                        const groupItems = group.items;
                                        const isAllSelected = groupItems.every(item => formData.checklist_config.includes(item.name));
                                        
                                        return (
                                            <div key={gIdx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                                    <div style={{ fontWeight: 700, color: '#334155' }}>
                                                        {group.group}
                                                        {group.subgroup && <span style={{ marginLeft: '8px', fontWeight: 'normal', color: '#64748b', fontSize: '0.9em' }}>({group.subgroup})</span>}
                                                    </div>
                                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#3b82f6', fontWeight: 600 }}>
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isAllSelected}
                                                            onChange={() => handleGroupToggle(groupItems, isAllSelected)}
                                                        />
                                                        {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                                    </label>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                                    {groupItems.map((item, iIdx) => (
                                                        <label key={iIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.85rem', color: '#475569', cursor: 'pointer', marginTop: '4px' }}>
                                                            <input 
                                                                type="checkbox" 
                                                                checked={formData.checklist_config.includes(item.name)}
                                                                onChange={() => handleItemToggle(item.name)}
                                                                style={{ marginTop: '2px' }}
                                                            />
                                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                <span>{item.name}</span>
                                                                {item.note && <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>{item.note}</span>}
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisaTemplateDrawer;
