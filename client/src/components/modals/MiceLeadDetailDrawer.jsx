import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, CheckSquare, Phone, MapPin, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

export default function MiceLeadDetailDrawer({ lead, onClose, refreshList, addToast, currentUser }) {
    const [formData, setFormData] = useState({
        name: '', phone: '', zalo_name: '', source: '', expected_pax: '', destination: '', deadline: '', status: 'New', notes: '',
        metadata: {
            sales_process: {
                step1_intake: { source_detail: '', customer_type: '' },
                step2_verification: { phone_valid: false, zalo_valid: false, company_identified: false, real_need: false },
                step3_discovery: { special_requests: '', consultation_notes: '', budget: '' }
            }
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (lead) {
            setFormData({
                ...lead,
                metadata: lead.metadata?.sales_process ? lead.metadata : {
                    sales_process: {
                        step1_intake: { source_detail: '', customer_type: '' },
                        step2_verification: { phone_valid: false, zalo_valid: false, company_identified: false, real_need: false },
                        step3_discovery: { special_requests: '', consultation_notes: '', budget: '' }
                    }
                },
                deadline: lead.deadline ? new Date(lead.deadline).toISOString().substring(0, 16) : ''
            });
        }
    }, [lead]);

    const handleMetaChange = (step, field, value) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                sales_process: {
                    ...prev.metadata.sales_process,
                    [step]: {
                        ...prev.metadata.sales_process[step],
                        [field]: value
                    }
                }
            }
        }));
    };

    const handleSave = async () => {
        if (!formData.name) return addToast ? addToast('Tên khách là bắt buộc', 'warning') : alert('Tên khách là bắt buộc');
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = { ...formData };
            if (payload.deadline) {
                payload.deadline = new Date(payload.deadline).toISOString();
            } else {
                payload.deadline = null;
            }

            if (lead?.id) {
                await axios.put(`/api/mice-leads/${lead.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('Cập nhật Lead thành công', 'success');
            } else {
                await axios.post('/api/mice-leads', payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('Tạo Lead thành công', 'success');
            }
            refreshList();
            onClose();
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi khi lưu Lead', 'error');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = { padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none', fontSize: '0.85rem' };
    const labelStyle = { fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px', display: 'block' };

    return (
        <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="drawer-content" style={{ width: '100%', height: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.2s' }}>
                
                {/* HEAD */}
                <div style={{ padding: '1.5rem', background: 'linear-gradient(to right, #1e293b, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: 'white', fontWeight: 600 }}>
                        {lead ? `Lead: ${lead.name}` : 'Thêm mới Lead MICE'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
                </div>

                {/* BODY */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{ width: '100%', maxWidth: '1200px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div className="form-group">
                            <label style={labelStyle}>Tên Khách / Công ty *</label>
                            <input type="text" style={{...inputStyle, fontWeight: 'bold'}} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Nhập tên..." />
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Số điện thoại</label>
                            <input type="text" style={inputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="09xxxx..." />
                        </div>
                        <div className="form-group">
                            <label style={labelStyle}>Tên Zalo (Nếu có)</label>
                            <input type="text" style={inputStyle} value={formData.zalo_name} onChange={e => setFormData({...formData, zalo_name: e.target.value})} placeholder="Tên Zalo hiển thị..." />
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1rem', color: '#0f172a', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckSquare size={18} color="#3b82f6" /> QUY TRÌNH SALES (BƯỚC 1 - 4)
                    </h3>

                    {/* BƯỚC 1 */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '0.95rem' }}>Bước 1: Tiếp nhận (Lead Intake)</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Nguồn thông tin</label>
                                <select style={inputStyle} value={formData.source} onChange={e => setFormData({...formData, source: e.target.value})}>
                                    <option value="">Chọn nguồn...</option>
                                    <option value="Website">Website / Landing page</option>
                                    <option value="Fanpage/Zalo">Fanpage / Zalo OA</option>
                                    <option value="Phân bổ">Leader/PGD phân bổ</option>
                                    <option value="Tự khai thác">Tự khai thác</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Phân loại khách</label>
                                <select style={inputStyle} value={formData.metadata.sales_process.step1_intake.customer_type} onChange={e => handleMetaChange('step1_intake', 'customer_type', e.target.value)}>
                                    <option value="">Chọn loại...</option>
                                    <option value="Doanh nghiệp">Doanh nghiệp</option>
                                    <option value="Team building">Team building</option>
                                    <option value="Private/Event">Private / Event</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* BƯỚC 2 */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '0.95rem' }}>Bước 2: Xác minh (Lead Verification)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.metadata.sales_process.step2_verification.phone_valid} onChange={e => handleMetaChange('step2_verification', 'phone_valid', e.target.checked)} style={{ width: '18px', height: '18px' }}/>
                                Số điện thoại hợp lệ / Zalo hoạt động
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.metadata.sales_process.step2_verification.zalo_valid} onChange={e => handleMetaChange('step2_verification', 'zalo_valid', e.target.checked)} style={{ width: '18px', height: '18px' }}/>
                                Tên Zalo là người thật (không phải clone/ảo)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.metadata.sales_process.step2_verification.company_identified} onChange={e => handleMetaChange('step2_verification', 'company_identified', e.target.checked)} style={{ width: '18px', height: '18px' }}/>
                                Xác định được Tên công ty / Đơn vị
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                <input type="checkbox" checked={formData.metadata.sales_process.step2_verification.real_need} onChange={e => handleMetaChange('step2_verification', 'real_need', e.target.checked)} style={{ width: '18px', height: '18px' }}/>
                                Có dấu hiệu nhu cầu thật (Lịch trình, Ngân sách...)
                            </label>
                        </div>
                    </div>

                    {/* BƯỚC 3 & 4 */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#334155', fontSize: '0.95rem' }}>Bước 3 & 4: Tư vấn sơ bộ & Chốt Deadline</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={labelStyle}>Điểm đến mong muốn</label>
                                <input type="text" style={inputStyle} value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})} placeholder="Phú Quốc, Đà Lạt..." />
                            </div>
                            <div>
                                <label style={labelStyle}>Số lượng (Pax) ước tính</label>
                                <input type="text" style={inputStyle} value={formData.expected_pax} onChange={e => setFormData({...formData, expected_pax: e.target.value})} placeholder="Khoảng 30-40" />
                            </div>
                            <div>
                                <label style={labelStyle}>Ngân sách dự kiến</label>
                                <input type="text" style={inputStyle} value={formData.metadata.sales_process.step3_discovery.budget} onChange={e => handleMetaChange('step3_discovery', 'budget', e.target.value)} placeholder="5 triệu/pax" />
                            </div>
                            <div>
                                <label style={{...labelStyle, color: '#ef4444'}}>Deadline phản hồi (Hẹn gửi BG) *</label>
                                <input type="datetime-local" style={{...inputStyle, borderColor: '#fca5a5'}} value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={labelStyle}>Yêu cầu đặc thù (Gala, Teambuilding, VIP...)</label>
                                <input type="text" style={inputStyle} value={formData.metadata.sales_process.step3_discovery.special_requests} onChange={e => handleMetaChange('step3_discovery', 'special_requests', e.target.value)} placeholder="Gala Dinner bờ biển..." />
                            </div>
                            <div style={{ gridColumn: 'span 4' }}>
                                <label style={labelStyle}>Ghi chú / Tư vấn sơ bộ (Đã hướng khách ntn?)</label>
                                <textarea style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} value={formData.metadata.sales_process.step3_discovery.consultation_notes} onChange={e => handleMetaChange('step3_discovery', 'consultation_notes', e.target.value)} placeholder="Đề xuất 2 option: Option 1 đi cáp treo, Option 2 đi cano..."></textarea>
                            </div>
                        </div>
                    </div>
                    </div>
                </div>

                {/* FOOTER */}
                <div style={{ padding: '1.25rem 2rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                    <select 
                        value={formData.status} 
                        onChange={e => setFormData({...formData, status: e.target.value})}
                        style={{ padding: '8px 12px', borderRadius: '6px', border: '2px solid #3b82f6', outline: 'none', fontWeight: 'bold', color: '#1e293b', fontSize: '0.85rem' }}
                    >
                        <option value="New">Trạng thái: Mới</option>
                        <option value="Contacted">Trạng thái: Đang xác minh</option>
                        <option value="Qualified">Trạng thái: Đã lọc (Qualified)</option>
                        <option value="Lost">Trạng thái: Xịt (Lost)</option>
                    </select>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onClose} style={{ padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Hủy</button>
                        <button onClick={handleSave} disabled={loading} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                            <Save size={16} /> Lưu Chi Tiết
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
