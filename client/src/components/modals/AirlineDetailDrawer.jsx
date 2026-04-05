import React, { useState, useEffect } from 'react';
import StarRating from '../common/StarRating';
import axios from 'axios';
import { X, Save, Plus, Trash2, Plane, ShoppingBag, Users, FileText, Send, Clock, PlusCircle } from 'lucide-react';
import Select from 'react-select';
import { MARKET_OPTIONS } from '../../constants/markets';

export default function AirlineDetailDrawer({ airline, onClose, refreshList, currentUser, addToast }) {
    const [activeTab, setActiveTab] = useState('general');
    
    // States - match actual DB columns
    const [formData, setFormData] = useState({
        code: '', name: '', tax_id: '', phone: '', email: '',
        country: '', province: '', address: '', notes: '', airline_class: '',
        website: '', market: '',
        bank_account_name: '', bank_account_number: '', bank_name: '', rating: ''
    });

    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);

    const [deletedContactIds, setDeletedContactIds] = useState([]);
    const [deletedServiceIds, setDeletedServiceIds] = useState([]);

    const [loading, setLoading] = useState(false);

    const [airlineNotes, setAirlineNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const fetchAirlineNotes = async () => {
        if (!airline?.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/airlines/${airline.id}/notes`, { headers: { Authorization: `Bearer ${token}` } });
            setAirlineNotes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAirlineNote = async () => {
        if (!newNote.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/airlines/${airline.id}/notes`, { content: newNote }, { headers: { Authorization: `Bearer ${token}` } });
            setNewNote('');
            fetchAirlineNotes();
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi thêm ghi chú!', 'error'); else alert('Lỗi thêm ghi chú!');
        }
    };

    useEffect(() => {
        if (airline) {
            setFormData({
                code: airline.code || '', name: airline.name || '', tax_id: airline.tax_id || '',
                phone: airline.phone || '', email: airline.email || '',
                country: airline.country || '', province: airline.province || '', address: airline.address || '',
                notes: airline.notes || '', airline_class: airline.airline_class || '', 
                website: airline.website || '',
                market: airline.market || '',
                bank_account_name: airline.bank_account_name || '', 
                bank_account_number: airline.bank_account_number || '', 
                bank_name: airline.bank_name || ''
            });

            setContacts(airline.contacts || []);
            setServices(airline.services || []);
            
            fetchAirlineNotes();
        } else {
            // New airline - start with empty rows
            setContacts([{ id: Date.now() + 1, name: '', position: '', phone: '', email: '' }]);
            setServices([{ id: Date.now() + 2, name: '', description: '', capacity: '' }]);
            setAirlineNotes([]);
        }
    }, [airline]);

    const handleSaveGlobal = async () => {
        try {
            if (!formData.name) {
                if (addToast) addToast('Tên Hãng bay là bắt buộc!', 'error');
                else alert('Tên Hãng bay là bắt buộc!');
                return;
            }
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = { 
                ...formData, contacts, services,
                deleted_contact_ids: deletedContactIds,
                deleted_service_ids: deletedServiceIds
            };
            
            if (airline?.id) {
                await axios.put(`/api/airlines/${airline.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('✅ Cập nhật thông tin Hãng bay thành công!');
                refreshList();
            } else {
                await axios.post('/api/airlines', payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('✅ Tạo Hãng bay thành công!');
                refreshList();
                onClose();
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            if (addToast) addToast('Lỗi: ' + msg, 'error'); else alert('Lỗi: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const isViewOnly = currentUser?.role !== 'admin' && currentUser?.role !== 'manager' && currentUser?.role !== 'operations';

    const handleContactChange = (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index][field] = value;
        setContacts(newContacts);
    };

    const handleServiceChange = (index, field, value) => {
        const newArr = [...services];
        newArr[index][field] = value;
        setServices(newArr);
    };

    const handleDeleteContact = (index, c) => {
        if (c.id && c.id < 1e12) setDeletedContactIds(prev => [...prev, c.id]);
        setContacts(contacts.filter((_, idx) => idx !== index));
    };

    const handleDeleteService = (index, s) => {
        if (s.id && s.id < 1e12) setDeletedServiceIds(prev => [...prev, s.id]);
        setServices(services.filter((_, idx) => idx !== index));
    };

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

    return (
        <div className="drawer-overlay" style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end'
        }}>
            <div className="drawer-content" style={{
                width: '1200px', maxWidth: '100%', background: '#f8fafc', height: '100%',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                {/* HEAD */}
                <div style={{ padding: '1.5rem 2.5rem', background: 'linear-gradient(to right, #7c2d12, #9a3412)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Plane size={24} color="#fdba74"/> {airline ? `Quản lý: ${airline.name}` : 'Thêm mới Hãng bay'}
                        </h2>
                        {airline && <div style={{ fontSize: '0.85rem', color: '#fed7aa', marginTop: '6px' }}>Mã định danh hệ thống: {airline.code}</div>}
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
                        <ShoppingBag size={16} /> Hạng Vé & Dịch Vụ
                    </div>
                    {airline && (
                        <div onClick={() => setActiveTab('notes')} style={tabStyle(activeTab === 'notes')}>
                            <FileText size={16} /> Lịch Sử Ghi Chú
                        </div>
                    )}
                </div>

                {/* BODY */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
                    {activeTab === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* GENERAL INFO */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <Plane size={18} color="#cbd5e1" /> Thông tin Hãng bay
                               </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2rem' }}>
                                    <div>
                                        <label style={labelStyle}>Mã Nhà Cung Cấp *</label>
                                        <input type="text" style={{ ...drawerInputStyle, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} disabled={isViewOnly} placeholder="AIR-..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>TÊN HÃNG BAY *</label>
                                        <input type="text" style={{ ...drawerInputStyle, fontWeight: 600, color: '#0f172a', borderColor: '#94a3b8' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isViewOnly} placeholder="Nhập tên hãng bay..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Số Điện Thoại</label>
                                        <input type="text" style={drawerInputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={isViewOnly} placeholder="Phone" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Email Hệ Thống</label>
                                        <input type="email" style={drawerInputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isViewOnly} placeholder="Email" />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>LOẠI HÌNH HÃNG BAY</label>
                                        <select style={drawerInputStyle} value={formData.airline_class} onChange={e => setFormData({...formData, airline_class: e.target.value})} disabled={isViewOnly}>
                                            <option value="">Chọn loại hình...</option>
                                            <option value="domestic">Hãng bay Nội Địa</option>
                                            <option value="international">Hãng bay Nước Ngoài</option>
                                            <option value="charter">Charter / Chuyên Cơ</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Thị trường MICE/Inbound</label>
                                        <Select 
                                            options={MARKET_OPTIONS}
                                            value={formData.market ? { label: formData.market, value: formData.market } : null}
                                            onChange={option => setFormData({...formData, market: option ? option.value : ''})}
                                            styles={reactSelectStyles}
                                            isClearable
                                            isDisabled={isViewOnly}
                                            placeholder="🔍 Gõ để tìm hoặc chọn..."
                                            noOptionsMessage={() => "Không tìm thấy thị trường"}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>MẠNG ĐƯỜNG BAY</label>
                                        <input type="text" style={drawerInputStyle} value={formData.airline_class} onChange={e => setFormData({...formData, airline_class: e.target.value})} disabled={isViewOnly} placeholder="Đông Nam Á, Châu Âu, Mỹ..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Website</label>
                                        <input type="text" style={drawerInputStyle} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} disabled={isViewOnly} placeholder="https://..." />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={labelStyle}>Địa chỉ chi tiết</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }}>
                                            <input type="text" style={drawerInputStyle} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} disabled={isViewOnly} placeholder="Quốc gia" />
                                            <input type="text" style={drawerInputStyle} value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} disabled={isViewOnly} placeholder="Tỉnh / Thành phố" />
                                            <input type="text" style={drawerInputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={isViewOnly} placeholder="Số nhà, Đường..." />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <label style={labelStyle}>Ghi chú đặc biệt</label>
                                        <textarea style={{...drawerInputStyle, resize: 'vertical'}} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={isViewOnly} rows={2} placeholder="Sức chứa, thời gian hoạt động, yêu cầu đặc biệt..." />
                                    </div>
                                    <div style={{ gridColumn: 'span 1' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Đánh giá chất lượng</label>
                                        <StarRating 
                                            rating={Number(formData.rating) || 0} 
                                            onChange={(val) => setFormData({...formData, rating: val})} 
                                            disabled={isViewOnly} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CONTACTS */}
                            <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <Users size={18} color="#cbd5e1" /> Liên Hệ Vận Hành
                                </h3>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ background: '#f1f5f9' }}>
                                            <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Họ và tên</th>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Chức vụ</th>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Số điện thoại</th>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                                                <th style={{ padding: '12px 16px', width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contacts.map((c, i) => (
                                                <tr key={c.id || i}>
                                                    <td style={inputCell}><input style={inlineInput} value={c.name || ''} onChange={e => handleContactChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên liên hệ" /></td>
                                                    <td style={inputCell}><input style={inlineInput} value={c.position || ''} onChange={e => handleContactChange(i, 'position', e.target.value)} disabled={isViewOnly} placeholder="Quản lý / Bếp trưởng" /></td>
                                                    <td style={inputCell}><input style={inlineInput} value={c.phone || ''} onChange={e => handleContactChange(i, 'phone', e.target.value)} disabled={isViewOnly} placeholder="Phone" /></td>
                                                    <td style={inputCell}><input style={inlineInput} type="email" value={c.email || ''} onChange={e => handleContactChange(i, 'email', e.target.value)} disabled={isViewOnly} placeholder="Email" /></td>
                                                    <td style={{ ...inputCell, textAlign: 'center' }}>
                                                        {!isViewOnly && (
                                                            <button style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px' }} onClick={() => handleDeleteContact(i, c)}><Trash2 size={16} /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
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
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minHeight: '400px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                <ShoppingBag size={18} color="#cbd5e1" /> DANH MỤC HẠNG VÉ & DỊCH VỤ CUNG CẤP
                            </h3>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
    <table style={{ width: 'max-content', minWidth: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead style={{ background: '#f1f5f9' }}>
            <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '80px' }}>SKU</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '120px' }}>Loại hình dịch vụ</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '200px' }}>Dịch vụ cung cấp</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '150px' }}>Hành trình vé</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '100px' }}>SHCB đi</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '130px' }}>Ngày đi</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '100px' }}>SHCB về</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '130px' }}>Ngày về</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '130px' }}>Hạn FullPay</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '130px' }}>Hạn vào tên</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '130px' }}>Hạn cắt cọc</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '150px' }}>TT Thanh toán</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '80px', textAlign: 'center' }}>Số lượng</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '220px' }}>Ghi chú</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '110px' }}>Giá KT</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '110px' }}>Giá gốc</th>
                <th style={{ padding: '8px 12px', fontWeight: 600, width: '110px' }}>Giá bán</th>
                <th style={{ padding: '8px 12px', width: '50px' }}></th>
            </tr>
        </thead>
        <tbody>
            {services.map((s, i) => (
                <tr key={s.id || i} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input style={{...inlineInput, background: '#fef3c7'}} value={s.sku || ''} onChange={e => handleServiceChange(i, 'sku', e.target.value)} disabled={isViewOnly} placeholder="SKU" />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <select style={inlineInput} value={s.service_type || ''} onChange={e => handleServiceChange(i, 'service_type', e.target.value)} disabled={isViewOnly}>
                            <option value="">-- Chọn --</option>
                            <option value="Vé series">Vé series</option>
                            <option value="Vé lẻ">Vé lẻ</option>
                            <option value="ADHOC">ADHOC</option>
                        </select>
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input style={{...inlineInput, fontWeight: 600}} value={s.name || ''} onChange={e => handleServiceChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên dịch vụ..." />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input style={inlineInput} value={s.routing || ''} onChange={e => handleServiceChange(i, 'routing', e.target.value)} disabled={isViewOnly} placeholder="HAN-SGN // SGN-HAN" />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input style={inlineInput} value={s.flight_number_outbound || ''} onChange={e => handleServiceChange(i, 'flight_number_outbound', e.target.value)} disabled={isViewOnly} placeholder="Ví dụ: VN201" />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input type="date" style={inlineInput} value={s.departure_date ? s.departure_date.substring(0,10) : ''} onChange={e => handleServiceChange(i, 'departure_date', e.target.value)} disabled={isViewOnly} />
                            <input type="time" style={{...inlineInput, color: '#64748b'}} value={s.departure_time || ''} onChange={e => handleServiceChange(i, 'departure_time', e.target.value)} disabled={isViewOnly} />
                        </div>
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input style={inlineInput} value={s.flight_number_inbound || ''} onChange={e => handleServiceChange(i, 'flight_number_inbound', e.target.value)} disabled={isViewOnly} placeholder="Ví dụ: VN206" />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <input type="date" style={inlineInput} value={s.return_date ? s.return_date.substring(0,10) : ''} onChange={e => handleServiceChange(i, 'return_date', e.target.value)} disabled={isViewOnly} />
                            <input type="time" style={{...inlineInput, color: '#64748b'}} value={s.return_time || ''} onChange={e => handleServiceChange(i, 'return_time', e.target.value)} disabled={isViewOnly} />
                        </div>
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input type="date" style={{...inlineInput, background: '#fef2f2'}} value={s.full_pay_deadline ? s.full_pay_deadline.substring(0,10) : ''} onChange={e => handleServiceChange(i, 'full_pay_deadline', e.target.value)} disabled={isViewOnly} />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input type="date" style={{...inlineInput, background: '#fef2f2'}} value={s.naming_deadline ? s.naming_deadline.substring(0,10) : ''} onChange={e => handleServiceChange(i, 'naming_deadline', e.target.value)} disabled={isViewOnly} />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input type="date" style={{...inlineInput, background: '#fef2f2'}} value={s.deposit_deadline ? s.deposit_deadline.substring(0,10) : ''} onChange={e => handleServiceChange(i, 'deposit_deadline', e.target.value)} disabled={isViewOnly} />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input style={inlineInput} value={s.payment_status || ''} onChange={e => handleServiceChange(i, 'payment_status', e.target.value)} disabled={isViewOnly} placeholder="Nhập gõ text..." />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input type="number" style={{...inlineInput, textAlign: 'center', background: '#eef2ff', fontWeight: 600, color: '#4f46e5'}} value={s.capacity || ''} onChange={e => handleServiceChange(i, 'capacity', e.target.value)} disabled={isViewOnly} placeholder="0" />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <textarea style={{...inlineInput, minHeight: '44px', resize: 'vertical', padding: '6px 8px'}} value={s.notes || ''} onChange={e => handleServiceChange(i, 'notes', e.target.value)} disabled={isViewOnly} placeholder="(Bấm Enter xuổng dòng)" rows={2} />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input type="number" style={inlineInput} value={s.cost_price || ''} onChange={e => handleServiceChange(i, 'cost_price', e.target.value)} disabled={isViewOnly} placeholder="Giá KT" />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input type="number" style={inlineInput} value={s.net_price || ''} onChange={e => handleServiceChange(i, 'net_price', e.target.value)} disabled={isViewOnly} placeholder="Giá Gốc" />
                    </td>
                    <td style={{...inputCell, padding: '10px 12px'}}>
                        <input type="number" style={{...inlineInput, color: '#16a34a', fontWeight:'bold'}} value={s.sale_price || ''} onChange={e => handleServiceChange(i, 'sale_price', e.target.value)} disabled={isViewOnly} placeholder="Giá Bán" />
                    </td>
                    <td style={{...inputCell, textAlign: 'center', padding: '10px 12px'}}>
                        {!isViewOnly && (
                            <button style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={() => handleDeleteService(i, s)}><Trash2 size={16} /></button>
                        )}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
</div>
                            {!isViewOnly && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                    <button style={{ background: '#f8fafc', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setServices([...services, { id: Date.now(), name: '', capacity: '' }])}>
                                        <Plus size={16} /> Thêm Dịch Vụ
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && airline && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="consultation-section animate-fade-in">
                                <h2 className="consultation-title">Lịch sử tư vấn & Chăm sóc</h2>
                                <p className="consultation-subtitle">Theo dõi các lần trao đổi và ghi chú tiến trình với đối tác hãng hàng không.</p>
                                
                                {!isViewOnly && (
                                    <div className="note-input-container">
                                        <div className="note-input-label">
                                            <PlusCircle size={18} /> THÊM GHI CHÚ MỚI
                                        </div>
                                        <textarea 
                                            className="note-textarea" 
                                            placeholder="Nhập nội dung tư vấn..." 
                                            value={newNote} 
                                            onChange={e => setNewNote(e.target.value)}
                                        />
                                        <button type="button" className="note-submit-btn" onClick={handleAddAirlineNote}>
                                            <Send size={16} /> Gửi
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {airlineNotes.map(note => (
                                        <div key={note.id} style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid #eaeff4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#6366f1' }}>
                                                        {note.creator_name?.charAt(0) || 'U'}
                                                    </div>
                                                    <strong>{note.creator_name}</strong>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} />
                                                    <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                                                </div>
                                            </div>
                                            <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.content}</div>
                                        </div>
                                    ))}
                                    {airlineNotes.length === 0 && (
                                        <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '1rem' }}>
                                            <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                            <div>Chưa có lịch sử trạng thái hoặc ghi chú nào.</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER SAVE */}
                <div style={{ background: 'white', padding: '1.25rem 2.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexShrink: 0, boxShadow: '0 -4px 10px rgba(0,0,0,0.02)' }}>
                    <button onClick={onClose} style={{ padding: '0.6rem 2rem', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}>HỦY ĐÓNG</button>
                    {!isViewOnly && (
                        <button onClick={handleSaveGlobal} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 2rem', background: 'linear-gradient(to right, #ea580c, #c2410c)', color: 'white', border: 'none', fontWeight: 600, borderRadius: '8px', boxShadow: '0 4px 6px rgba(234, 88, 12, 0.2)', cursor: 'pointer' }}>
                            <Save size={18} /> LƯU HOÀN TẤT
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

const labelStyle = { fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' };

const tabStyle = (isActive) => ({
    padding: '1rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.95rem',
    color: isActive ? '#ea580c' : '#64748b',
    borderBottom: isActive ? '3px solid #ea580c' : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
});
