import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2, Building, Users, Map, Link as LinkIcon, Edit2, ShoppingBag } from 'lucide-react';
import Select from 'react-select';

export default function VisaProviderDetailDrawer({ provider, mode = 'edit', onClose, onSuccess, addToast, currentUser, checkPerm }) {
    const isNew = !provider?.id;
    const isViewOnly = mode === 'view';
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const [form, setForm] = useState({
        code: '', name: '', phone: '', email: '', country: '', processing_time: '',
        market: '', address: '', notes: ''
    });
    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);

    const [marketOptions, setMarketOptions] = useState([]);

    useEffect(() => {
        fetchMarkets();
        if (provider) {
            fetchDetail();
        } else {
            setForm({ code: '', name: '', phone: '', email: '', country: '', processing_time: '', market: '', address: '', notes: '' });
            setContacts([]);
            setServices([]);
        }
    }, [provider]);

    const fetchMarkets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/markets', { headers: { Authorization: `Bearer ${token}` } });
            const markets = Array.isArray(res.data) ? res.data : (res.data?.data || []);
            setMarketOptions(markets.map(m => ({ label: m.name, value: m.name })));
        } catch (err) {
            console.error('Lỗi lấy thị trường:', err);
        }
    };

    const fetchDetail = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/visa-providers/${provider.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = res.data.data || res.data;
            setForm({
                code: data.code || '', name: data.name || '', phone: data.phone || '',
                email: data.email || '', country: data.country || '', processing_time: data.processing_time || '',
                market: data.market || '', address: data.address || '', notes: data.notes || ''
            });
            setContacts(data.contacts || []);
            setServices(data.services || []);
        } catch (err) {
            console.error('Lỗi chi tiết:', err);
            addToast?.('Không lấy được chi tiết nhà cung cấp', 'error');
        }
    };

    const handleSave = async () => {
        if (!form.name) return addToast?.('Vui lòng nhập tên nhà cung cấp', 'error');
        setSaving(true);
        try {
            const payload = {
                ...form,
                contacts: contacts.filter(c => c.name || c.phone || c.email),
                services: services.filter(s => s.name || s.sku)
            };
            const token = localStorage.getItem('token');
            if (isNew) {
                await axios.post('/api/visa-providers', payload, { headers: { Authorization: `Bearer ${token}` } });
                addToast?.('Thêm thành công!', 'success');
            } else {
                await axios.put(`/api/visa-providers/${provider.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                addToast?.('Cập nhật thành công!', 'success');
            }
            onSuccess?.();
        } catch (err) {
            addToast?.('Lỗi khi lưu: ' + (err.response?.data?.message || err.message), 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateContact = (idx, field, val) => {
        const newC = [...contacts];
        newC[idx][field] = val;
        setContacts(newC);
    };

    const updateService = (idx, field, val) => {
        const newS = [...services];
        newS[idx][field] = val;
        setServices(newS);
    };

    const labelStyle = { fontSize: '0.8rem', color: '#64748b', display: 'block', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' };
    const inputCell = { padding: '8px', borderBottom: '1px solid #e2e8f0', background: 'transparent' };
    const inlineInput = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 8px', fontSize: '13px', background: 'white', outline: 'none' };
    const drawerInputStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', width: '100%', outline: 'none', background: 'white', transition: 'border 0.2s' };
    
    const reactSelectStyles = {
        control: (base) => ({
            ...base, height: '40px', minHeight: '40px', borderRadius: '8px', borderColor: '#cbd5e1', boxShadow: 'none',
            '&:hover': { borderColor: '#94a3b8' }
        }),
        valueContainer: (base) => ({ ...base, padding: '0 12px', height: '38px', display: 'flex', alignItems: 'center' }),
        input: (base) => ({ ...base, margin: 0, padding: 0 })
    };

    const tabStyle = (isActive) => ({
        padding: '16px 0',
        borderBottom: isActive ? '2px solid #ea580c' : '2px solid transparent',
        color: isActive ? '#ea580c' : '#64748b',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.2s'
    });

    
    if (isViewOnly) {
        return (
            <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }} onClick={onClose}>
                <div className="drawer-content" style={{ width: '900px', maxWidth: '100%', background: '#f1f5f9', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} onClick={e => e.stopPropagation()}>
                    {/* VIEW HEADER */}
                    <div style={{ padding: '2rem 2.5rem', background: 'linear-gradient(to right, #0284c7, #0369a1)', color: 'white', position: 'relative', flexShrink: 0 }}>
                        <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', color: 'white' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Building size={28} color="#7dd3fc"/> {form.name}
                        </h2>
                        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.9rem', color: '#bae6fd' }}>
                            <span><strong>Mã:</strong> {form.code || 'N/A'}</span>
                            <span><strong>Quốc gia xử lý:</strong> {form.country || 'N/A'}</span>
                            <span><strong>TG Xử lý:</strong> {form.processing_time || 'N/A'}</span>
                        </div>
                    </div>

                    {/* VIEW BODY (No Tabs, Everything Scrollable) */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* 1. THÔNG TIN CHUNG */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <Map size={18} color="#0284c7" /> THÔNG TIN LIÊN LẠC & GHI CHÚ
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>SỐ ĐIỆN THOẠI</div><div style={{ fontWeight: 500 }}>{form.phone || '-'}</div></div>
                                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>EMAIL</div><div style={{ fontWeight: 500 }}>{form.email || '-'}</div></div>
                                <div><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>THỊ TRƯỜNG</div><div style={{ fontWeight: 500 }}>{form.market || '-'}</div></div>
                                <div style={{ gridColumn: '1 / -1' }}><div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>ĐỊA CHỈ</div><div style={{ fontWeight: 500 }}>{form.address || '-'}</div></div>
                                {form.notes && (
                                    <div style={{ gridColumn: '1 / -1', background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px solid #fde68a' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#d97706', fontWeight: 600, marginBottom: '4px' }}>GHI CHÚ NỘI BỘ</div>
                                        <div style={{ whiteSpace: 'pre-wrap', color: '#92400e' }}>{form.notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. NGƯỜI LIÊN HỆ */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <Users size={18} color="#0284c7" /> NGƯỜI LIÊN HỆ VẬN HÀNH
                            </h3>
                            {contacts.length === 0 ? <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Chưa có người liên hệ.</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                                            <th style={{ padding: '10px 16px', borderRadius: '6px 0 0 6px' }}>Họ Tên</th>
                                            <th style={{ padding: '10px 16px' }}>Chức Vụ</th>
                                            <th style={{ padding: '10px 16px' }}>Điện Thoại</th>
                                            <th style={{ padding: '10px 16px', borderRadius: '0 6px 6px 0' }}>Email</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contacts.map((c, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{c.name || '-'}</td>
                                                <td style={{ padding: '12px 16px', color: '#64748b' }}>{c.position || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{c.phone || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{c.email || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* 3. DỊCH VỤ CUNG CẤP */}
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1rem', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                                <ShoppingBag size={18} color="#0284c7" /> DỊCH VỤ VISA CUNG CẤP
                            </h3>
                            {services.length === 0 ? <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0 }}>Chưa có dịch vụ nào.</p> : (
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                                            <th style={{ padding: '10px 16px', borderRadius: '6px 0 0 6px' }}>Mã SKU</th>
                                            <th style={{ padding: '10px 16px' }}>Tên Dịch Vụ</th>
                                            <th style={{ padding: '10px 16px' }}>Loại Visa</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'right' }}>Giá Net</th>
                                            <th style={{ padding: '10px 16px', textAlign: 'right', borderRadius: '0 6px 6px 0' }}>Giá Bán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((s, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                <td style={{ padding: '12px 16px', color: '#0284c7', fontWeight: 600 }}>{s.sku || '-'}</td>
                                                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.name || '-'}</td>
                                                <td style={{ padding: '12px 16px' }}>{s.visa_type || '-'}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right' }}>{s.cost_price ? Number(s.cost_price).toLocaleString() : '-'}</td>
                                                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>{s.sale_price ? Number(s.sale_price).toLocaleString() : '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

return (
        <div className="drawer-overlay" style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end' }}>
            <div className="drawer-content" style={{ width: '1200px', maxWidth: '100%', background: '#f8fafc', height: '100%', display: 'flex', flexDirection: 'column', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {/* HEAD */}
                <div style={{ padding: '1.5rem 2.5rem', background: 'linear-gradient(to right, #7c2d12, #9a3412)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Building size={24} color="#fdba74"/> {provider?.id ? `Quản lý: ${form.name}` : 'Thêm Nhà Cung Cấp Visa Mới'}
                        </h2>
                        {provider?.id && <div style={{ fontSize: '0.85rem', color: '#fed7aa', marginTop: '6px' }}>Mã định danh hệ thống: {form.code}</div>}
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
                        <X size={20} />
                    </button>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 2.5rem', flexShrink: 0, gap: '2rem' }}>
                    <div onClick={() => setActiveTab('general')} style={tabStyle(activeTab === 'general')}>
                        <Users size={16} /> Hồ Sơ & Liên Hệ
                    </div>
                    <div onClick={() => setActiveTab('services')} style={tabStyle(activeTab === 'services')}>
                        <ShoppingBag size={16} /> Danh Mục Dịch Vụ
                    </div>
                </div>

                {/* BODY */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
                    {activeTab === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* GENERAL INFO */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <Map size={18} color="#cbd5e1" /> HỒ SƠ NHÀ CUNG CẤP VISA
                               </h3>
                                <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2rem' }}>
                                    <div>
                                        <label style={labelStyle}>Mã NCC Visa (Tự Động)</label>
                                        <input type="text" style={{ ...drawerInputStyle, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }} value={form.code} onChange={e => setForm({...form, code: e.target.value})} disabled={isViewOnly} placeholder="Tự động tạo nếu để trống" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Tên Nhà Cung Cấp *</label>
                                        <input type="text" style={{ ...drawerInputStyle, fontWeight: 600, color: '#0f172a', borderColor: '#94a3b8' }} value={form.name} onChange={e => setForm({...form, name: e.target.value})} disabled={isViewOnly} placeholder="Nhập tên nhà cung cấp..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Số Điện Thoại</label>
                                        <input type="text" style={drawerInputStyle} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} disabled={isViewOnly} placeholder="Phone" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email Hệ Thống</label>
                                        <input type="email" style={drawerInputStyle} value={form.email} onChange={e => setForm({...form, email: e.target.value})} disabled={isViewOnly} placeholder="Email" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Quốc gia xử lý</label>
                                        <input type="text" style={drawerInputStyle} value={form.country} onChange={e => setForm({...form, country: e.target.value})} disabled={isViewOnly} placeholder="VD: Hàn Quốc, Nhật Bản..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Thời gian xử lý TB</label>
                                        <input type="text" style={drawerInputStyle} value={form.processing_time} onChange={e => setForm({...form, processing_time: e.target.value})} disabled={isViewOnly} placeholder="VD: 5-7 ngày làm việc" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Thị trường MICE/Inbound</label>
                                        <Select 
                                            isMulti
                                            options={marketOptions}
                                            value={form.market ? form.market.split(', ').map(m => ({ label: m, value: m })) : []}
                                            onChange={options => setForm({...form, market: options ? options.map(o => o.value).join(', ') : ''})}
                                            styles={reactSelectStyles}
                                            isClearable
                                            isDisabled={isViewOnly}
                                            placeholder="🔍 Gõ để tìm hoặc chọn nhiều..."
                                            noOptionsMessage={() => "Không tìm thấy thị trường"}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Địa chỉ</label>
                                        <input type="text" style={drawerInputStyle} value={form.address} onChange={e => setForm({...form, address: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={labelStyle}>Ghi chú nội bộ</label>
                                        <textarea style={{ ...drawerInputStyle, minHeight: '80px', resize: 'vertical' }} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} disabled={isViewOnly} placeholder="Ghi chú thêm..."></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* CONTACTS TABLE */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                        <Users size={18} color="#cbd5e1" /> LIÊN HỆ VẬN HÀNH
                                    </h3>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ background: '#f1f5f9' }}>
                                            <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                <th style={{ padding: '12px 16px', borderRadius: '6px 0 0 6px', width: '25%' }}>Tên liên hệ</th>
                                                <th style={{ padding: '12px 16px', width: '20%' }}>Chức vụ</th>
                                                <th style={{ padding: '12px 16px', width: '20%' }}>Số điện thoại</th>
                                                <th style={{ padding: '12px 16px', width: '25%' }}>Email</th>
                                                <th style={{ padding: '12px 16px', borderRadius: '0 6px 6px 0', width: '40px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contacts.length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có người liên hệ</td></tr>
                                            ) : (
                                                contacts.map((c, i) => (
                                                    <tr key={c.id || i} style={{ ':hover': { background: '#f8fafc' } }}>
                                                        <td style={inputCell}><input style={inlineInput} value={c.name || ''} onChange={e => updateContact(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên liên hệ" /></td>
                                                        <td style={inputCell}><input style={inlineInput} value={c.position || ''} onChange={e => updateContact(i, 'position', e.target.value)} disabled={isViewOnly} placeholder="Chức vụ" /></td>
                                                        <td style={inputCell}><input style={inlineInput} value={c.phone || ''} onChange={e => updateContact(i, 'phone', e.target.value)} disabled={isViewOnly} placeholder="Số điện thoại" /></td>
                                                        <td style={inputCell}><input style={inlineInput} value={c.email || ''} onChange={e => updateContact(i, 'email', e.target.value)} disabled={isViewOnly} placeholder="Email" /></td>
                                                        <td style={{ ...inputCell, textAlign: 'center' }}>
                                                            {!isViewOnly && (
                                                                <button onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {!isViewOnly && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                        <button style={{ background: '#f8fafc', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setContacts([...contacts, { id: Date.now(), name: '', position: '', phone: '', email: '' }])}>
                                            <Plus size={16} /> Bổ sung người liên hệ
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'services' && (
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <ShoppingBag size={18} color="#cbd5e1" /> DANH MỤC DỊCH VỤ VISA
                                </h3>
                            </div>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            <th style={{ padding: '12px 16px', borderRadius: '6px 0 0 6px', width: '15%' }}>Mã SKU</th>
                                            <th style={{ padding: '12px 16px', width: '25%' }}>Tên dịch vụ cung cấp</th>
                                            <th style={{ padding: '12px 16px', width: '15%' }}>Loại Visa</th>
                                            <th style={{ padding: '12px 16px', width: '15%' }}>Giá Net</th>
                                            <th style={{ padding: '12px 16px', width: '15%' }}>Giá Bán</th>
                                            <th style={{ padding: '12px 16px', borderRadius: '0 6px 6px 0', width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.length === 0 ? (
                                            <tr><td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Chưa có dịch vụ nào được định nghĩa</td></tr>
                                        ) : (
                                            services.map((s, i) => (
                                                <tr key={s.id || i} style={{ ':hover': { background: '#f8fafc' } }}>
                                                    <td style={inputCell}><input style={{...inlineInput, fontWeight: 600, color: '#3b82f6', background: '#f8fafc'}} value={s.sku || ''} onChange={e => updateService(i, 'sku', e.target.value)} disabled={isViewOnly} placeholder="SKU" /></td>
                                                    <td style={inputCell}><input style={{...inlineInput, fontWeight: 600}} value={s.name || ''} onChange={e => updateService(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="VD: Visa du lịch Hàn Quốc" /></td>
                                                    <td style={inputCell}><input style={inlineInput} value={s.visa_type || ''} onChange={e => updateService(i, 'visa_type', e.target.value)} disabled={isViewOnly} placeholder="E-Visa, Visa dán..." /></td>
                                                    <td style={inputCell}><input style={{...inlineInput, textAlign: 'right'}} type="number" value={s.cost_price || ''} onChange={e => updateService(i, 'cost_price', e.target.value)} disabled={isViewOnly} placeholder="0" /></td>
                                                    <td style={inputCell}><input style={{...inlineInput, textAlign: 'right', fontWeight: 600, color: '#16a34a'}} type="number" value={s.sale_price || ''} onChange={e => updateService(i, 'sale_price', e.target.value)} disabled={isViewOnly} placeholder="0" /></td>
                                                    <td style={{ ...inputCell, textAlign: 'center' }}>
                                                        {!isViewOnly && (
                                                            <button onClick={() => setServices(services.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
                                                                <Trash2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            {!isViewOnly && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                    <button style={{ background: '#f8fafc', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setServices([...services, { id: Date.now(), sku: '', name: '', visa_type: '', cost_price: '', sale_price: '' }])}>
                                        <Plus size={16} /> Thêm Dịch Vụ
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div style={{ padding: '1rem 2.5rem', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
                    <button onClick={onClose} style={{ padding: '8px 20px', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                        HỦY ĐÓNG
                    </button>
                    {!isViewOnly && (
                        <button onClick={handleSave} disabled={saving} style={{ padding: '8px 20px', background: '#ea580c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                            <Save size={16} /> {saving ? 'ĐANG LƯU...' : 'LƯU HOÀN TẤT'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
