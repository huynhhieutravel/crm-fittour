import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Building, Users, MapPin, Phone, Mail, Link as LinkIcon, Trash2, Plus, Clock } from 'lucide-react';

const VisaProviderDetailDrawer = ({ provider, onClose, onSuccess, addToast }) => {
    const [form, setForm] = useState({
        code: '', name: '', phone: '', email: '', address: '', country: '', processing_time: '', notes: ''
    });
    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('info'); // info, contacts, services

    useEffect(() => {
        if (provider?.id) {
            fetchProviderDetails();
        }
    }, [provider]);

    const fetchProviderDetails = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/visa-providers/${provider.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data;
            setForm({
                code: data.code || '', name: data.name || '', phone: data.phone || '',
                email: data.email || '', address: data.address || '', 
                country: data.country || '', processing_time: data.processing_time || '', 
                notes: data.notes || ''
            });
            setContacts(data.contacts || []);
            setServices(data.services || []);
        } catch (err) {
            addToast('Lỗi khi tải chi tiết', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.name) return addToast('Tên nhà cung cấp không được để trống', 'error');
        try {
            setSaving(true);
            const token = localStorage.getItem('token');
            if (provider?.id) {
                await axios.put(`/api/visa-providers/${provider.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
                addToast('Đã cập nhật Nhà cung cấp', 'success');
            } else {
                await axios.post('/api/visa-providers', form, { headers: { Authorization: `Bearer ${token}` } });
                addToast('Đã tạo Nhà cung cấp', 'success');
            }
            onSuccess();
        } catch (err) {
            addToast(err.response?.data?.error || 'Lỗi khi lưu', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddContact = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/visa-providers/${provider.id}/contacts`, { name: 'Người liên hệ mới', position: '', phone: '', email: '' }, { headers: { Authorization: `Bearer ${token}` } });
            setContacts([...contacts, res.data]);
            addToast('Đã thêm liên hệ', 'success');
        } catch (err) { addToast('Lỗi khi thêm liên hệ', 'error'); }
    };

    const updateContact = async (idx, field, value) => {
        const newContacts = [...contacts];
        newContacts[idx][field] = value;
        setContacts(newContacts);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/visa-providers/${provider.id}/contacts/${newContacts[idx].id}`, newContacts[idx], { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) { console.error('Lỗi lưu liên hệ'); }
    };

    const handleDeleteContact = async (contactId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/visa-providers/${provider.id}/contacts/${contactId}`, { headers: { Authorization: `Bearer ${token}` } });
            setContacts(contacts.filter(c => c.id !== contactId));
            addToast('Đã xóa liên hệ', 'success');
        } catch (err) { addToast('Lỗi khi xóa', 'error'); }
    };

    const handleAddService = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`/api/visa-providers/${provider.id}/services`, { 
                sku: `VS-${Date.now().toString().slice(-4)}`, name: 'Dịch vụ Visa mới', visa_type: '', cost_price: 0, sale_price: 0 
            }, { headers: { Authorization: `Bearer ${token}` } });
            setServices([...services, res.data]);
            addToast('Đã thêm dịch vụ', 'success');
        } catch (err) { addToast('Lỗi khi thêm dịch vụ', 'error'); }
    };

    const updateService = async (idx, field, value) => {
        const newServices = [...services];
        newServices[idx][field] = value;
        setServices(newServices);
        try {
            const token = localStorage.getItem('token');
            await axios.put(`/api/visa-providers/${provider.id}/services/${newServices[idx].id}`, newServices[idx], { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) { console.error('Lỗi lưu dịch vụ'); }
    };

    const handleDeleteService = async (serviceId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/visa-providers/${provider.id}/services/${serviceId}`, { headers: { Authorization: `Bearer ${token}` } });
            setServices(services.filter(s => s.id !== serviceId));
            addToast('Đã xóa dịch vụ', 'success');
        } catch (err) { addToast(err.response?.data?.error || 'Lỗi khi xóa', 'error'); }
    };

    return (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '600px', background: 'white', boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', color: 'white' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={20} color="#0ea5e9" />
                    {provider?.id ? form.name : 'Thêm Nhà Cung Cấp Visa Mới'}
                </h2>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button onClick={handleSave} disabled={saving} style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu lại'}
                    </button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}><X size={24} /></button>
                </div>
            </div>

            {provider?.id && (
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <button onClick={() => setActiveTab('info')} style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'info' ? 'white' : 'transparent', color: activeTab === 'info' ? '#3b82f6' : '#64748b', fontWeight: 600, borderBottom: activeTab === 'info' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}>Thông tin chung</button>
                    <button onClick={() => setActiveTab('contacts')} style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'contacts' ? 'white' : 'transparent', color: activeTab === 'contacts' ? '#3b82f6' : '#64748b', fontWeight: 600, borderBottom: activeTab === 'contacts' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}>Người liên hệ ({contacts.length})</button>
                    <button onClick={() => setActiveTab('services')} style={{ flex: 1, padding: '12px', border: 'none', background: activeTab === 'services' ? 'white' : 'transparent', color: activeTab === 'services' ? '#3b82f6' : '#64748b', fontWeight: 600, borderBottom: activeTab === 'services' ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer' }}>Dịch vụ cung cấp ({services.length})</button>
                </div>
            )}

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải...</div> : (
                    <>
                        {activeTab === 'info' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Mã NCC</label>
                                        <input type="text" className="form-control" value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="Tự động tạo nếu để trống" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div style={{ flex: 2 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Tên Nhà cung cấp *</label>
                                        <input type="text" className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={14} /> Số điện thoại</label>
                                        <input type="text" className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> Email</label>
                                        <input type="email" className="form-control" value={form.email} onChange={e => setForm({...form, email: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> Quốc gia xử lý</label>
                                        <input type="text" className="form-control" value={form.country} onChange={e => setForm({...form, country: e.target.value})} placeholder="VD: Hàn Quốc, Nhật Bản..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> Thời gian xử lý TB</label>
                                        <input type="text" className="form-control" value={form.processing_time} onChange={e => setForm({...form, processing_time: e.target.value})} placeholder="VD: 5-7 ngày làm việc" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Địa chỉ</label>
                                    <input type="text" className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Ghi chú nội bộ</label>
                                    <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={4} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', resize: 'vertical' }} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'contacts' && (
                            <div>
                                {contacts.map((c, idx) => (
                                    <div key={c.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '16px', position: 'relative' }}>
                                        <button onClick={() => handleDeleteContact(c.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingRight: '24px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Họ tên</label>
                                                <input type="text" className="form-control" value={c.name} onChange={e => updateContact(idx, 'name', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Chức vụ</label>
                                                <input type="text" className="form-control" value={c.position} onChange={e => updateContact(idx, 'position', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Số điện thoại</label>
                                                <input type="text" className="form-control" value={c.phone} onChange={e => updateContact(idx, 'phone', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Email</label>
                                                <input type="email" className="form-control" value={c.email} onChange={e => updateContact(idx, 'email', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleAddContact} style={{ width: '100%', padding: '12px', background: 'white', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <Plus size={18} /> Thêm người liên hệ
                                </button>
                            </div>
                        )}

                        {activeTab === 'services' && (
                            <div>
                                {services.map((s, idx) => (
                                    <div key={s.id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '16px', position: 'relative', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                        <button onClick={() => handleDeleteService(s.id)} style={{ position: 'absolute', top: '16px', right: '16px', background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}><Trash2 size={16} /></button>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', paddingRight: '36px', marginBottom: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Mã Dịch vụ (SKU)</label>
                                                <input type="text" className="form-control" value={s.sku} onChange={e => updateService(idx, 'sku', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600, color: '#3b82f6', background: '#f8fafc' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 600 }}>Tên Dịch vụ *</label>
                                                <input type="text" className="form-control" value={s.name} onChange={e => updateService(idx, 'name', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }} />
                                            </div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Loại Visa</label>
                                                <input type="text" className="form-control" value={s.visa_type} onChange={e => updateService(idx, 'visa_type', e.target.value)} placeholder="E-Visa, Visa dán..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Giá NET (Chi) đ</label>
                                                <input type="number" className="form-control" value={s.cost_price} onChange={e => updateService(idx, 'cost_price', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textAlign: 'right' }} />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Giá BÁN đ</label>
                                                <input type="number" className="form-control" value={s.sale_price} onChange={e => updateService(idx, 'sale_price', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', textAlign: 'right', fontWeight: 600, color: '#16a34a' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={handleAddService} style={{ width: '100%', padding: '12px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                    <Plus size={18} /> Thêm dịch vụ
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VisaProviderDetailDrawer;
