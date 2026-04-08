import React, { useState, useEffect } from 'react';
import StarRating from '../common/StarRating';
import axios from 'axios';
import { X, Save, Plus, Trash2, Building, BedDouble, CalendarDays, Users, FileText, Send, Clock, PlusCircle, ExternalLink, Link2 } from 'lucide-react';
import Select from 'react-select';
import { MARKET_OPTIONS } from '../../constants/markets';
import { isViewOnly as checkViewOnly } from '../../utils/permissions';

export default function HotelDetailDrawer({ hotel, onClose, refreshList, currentUser, addToast }) {
    const [activeTab, setActiveTab] = useState('general');
    
    // States
    const [formData, setFormData] = useState({
        code: '', name: '', tax_id: '', build_year: '', phone: '', email: '',
        country: '', province: '', address: '', notes: '', star_rate: '',
        website: '', hotel_class: '', project_name: '', market: '', drive_link: '',
        bank_account_name: '', bank_account_number: '', bank_name: '', rating: ''
    });

    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);
    const [allotments, setAllotments] = useState([]);

    const [deletedContactIds, setDeletedContactIds] = useState([]);
    const [deletedServiceIds, setDeletedServiceIds] = useState([]);
    const [deletedAllotmentIds, setDeletedAllotmentIds] = useState([]);

    const [availableContracts, setAvailableContracts] = useState([]);
    const [activeContractId, setActiveContractId] = useState(null);

    const [loading, setLoading] = useState(false);

    const [hotelNotes, setHotelNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const fetchHotelNotes = async () => {
        if (!hotel?.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/hotels/${hotel.id}/notes`, { headers: { Authorization: `Bearer ${token}` } });
            setHotelNotes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddHotelNote = async () => {
        if (!newNote.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/hotels/${hotel.id}/notes`, { content: newNote }, { headers: { Authorization: `Bearer ${token}` } });
            setNewNote('');
            fetchHotelNotes();
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi thêm ghi chú!', 'error'); else alert('Lỗi thêm ghi chú!');
        }
    };

    useEffect(() => {
        if (hotel) {
            setFormData({
                ...hotel,
                code: hotel.code || '', name: hotel.name || '', tax_id: hotel.tax_id || '',
                phone: hotel.phone || '', email: hotel.email || '',
                country: hotel.country || '', province: hotel.province || '', address: hotel.address || '',
                notes: hotel.notes || '', star_rate: hotel.star_rate || '', website: hotel.website || '',
                market: hotel.market || '', drive_link: hotel.drive_link || '', rating: hotel.rating || ''
            });

            setContacts(hotel.contacts || []);
            
            if (hotel.contracts && hotel.contracts.length > 0) {
                setAvailableContracts(hotel.contracts);
                setActiveContractId(hotel.contracts[0].id);
                if (hotel.contracts[0].rates) {
                    const mappedServices = hotel.contracts[0].rates.map(r => ({
                        id: r.id, sku: r.sku, name: r.room_name, start_date: r.start_date?.split('T')[0] || '', end_date: r.end_date?.split('T')[0] || '',
                        day_type: r.day_type, contract_price: r.contract_price, net_price: r.net_price, sell_price: r.sell_price, description: r.description, notes: r.notes
                    }));
                    setServices(mappedServices);
                } else {
                    setServices([]);
                }
            } else {
                setAvailableContracts([]);
                setServices([]);
            }

            if (hotel.allotments) {
                 const mappedAllots = hotel.allotments.map(a => ({
                    id: a.id, sku: a.sku, name: a.room_name, start_date: a.start_date?.split('T')[0] || '', end_date: a.end_date?.split('T')[0] || '',
                    day_type: a.day_type, allotment_count: a.allotment_count, cut_off_days: a.cut_off_days, net_price: a.net_price, sell_price: a.sell_price, description: a.description, notes: a.notes
                }));
                setAllotments(mappedAllots);
            } else {
                setAllotments([]);
            }
            
            fetchHotelNotes();
        } else {
            setContacts([{ id: Date.now() + 1, name: '', position: '', dob: '', phone: '', email: '' }]);
            setServices([{ id: Date.now() + 2, sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', contract_price: 0, net_price: 0, sell_price: 0 }]);
            setAllotments([{ id: Date.now() + 3, sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', allotment_count: 0, cut_off_days: 0, net_price: 0, sell_price: 0 }]);
            setHotelNotes([]);
        }
    }, [hotel]);

    const handleSaveGlobal = async () => {
        try {
            if (!formData.name) return addToast ? addToast('Tên Khách sạn là bắt buộc!', 'warning') : alert('Tên Khách sạn là bắt buộc!');
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = { 
                ...formData, contacts, services, allotments,
                deleted_contact_ids: deletedContactIds,
                deleted_service_ids: deletedServiceIds,
                deleted_allotment_ids: deletedAllotmentIds,
                contract_id: activeContractId
            };
            
            if (hotel?.id) {
                await axios.put(`/api/hotels/${hotel.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('Cập nhật thông tin thành công!', 'success'); else alert('Cập nhật thông tin thành công!');
            } else {
                await axios.post('/api/hotels', payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('Tạo Khách sạn thành công!', 'success'); else alert('Tạo Khách sạn thành công!');
                refreshList();
                onClose();
            }
            refreshList();
        } catch (err) {
            const msg = (err.response?.data?.message || err.message);
            if (addToast) addToast('Lỗi: ' + msg, 'error'); else alert('Lỗi: ' + msg);
        } finally {
            setLoading(false);
        }
    };

    const isViewOnly = checkViewOnly(currentUser?.role, 'suppliers');

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

    const handleAllotmentChange = (index, field, value) => {
        const newArr = [...allotments];
        newArr[index][field] = value;
        setAllotments(newArr);
    };

    const handleDeleteContact = (index, c) => {
        if (c.id && c.id < 1e12) setDeletedContactIds(prev => [...prev, c.id]);
        setContacts(contacts.filter((_, idx) => idx !== index));
    };

    const handleDeleteService = (index, s) => {
        if (s.id && s.id < 1e12) setDeletedServiceIds(prev => [...prev, s.id]);
        setServices(services.filter((_, idx) => idx !== index));
    };

    const handleDeleteAllotment = (index, a) => {
        if (a.id && a.id < 1e12) setDeletedAllotmentIds(prev => [...prev, a.id]);
        setAllotments(allotments.filter((_, idx) => idx !== index));
    };

    const handleContractChange = (contractId) => {
        if (services.length > 0 && !window.confirm('Chuyển Hợp đồng sẽ xổ lại bảng giá, các thay đổi chưa được Lưu sẽ bị mất. Bạn có chắc chắn?')) return;
        setActiveContractId(contractId);
        const contract = availableContracts.find(c => c.id === parseInt(contractId));
        if (contract && contract.rates) {
            const mappedServices = contract.rates.map(r => ({
                id: r.id, sku: r.sku, name: r.room_name, start_date: r.start_date?.split('T')[0] || '', end_date: r.end_date?.split('T')[0] || '',
                day_type: r.day_type, contract_price: r.contract_price, net_price: r.net_price, sell_price: r.sell_price, description: r.description, notes: r.notes
            }));
            setServices(mappedServices);
            setDeletedServiceIds([]); // reset delete tracker when switching contract
        } else {
            setServices([]);
        }
    };

    const inputCell = { padding: '8px', borderBottom: '1px solid #e2e8f0', background: 'transparent' };
    const inlineInput = { width: '100%', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '6px 8px', fontSize: '13px', background: 'white', outline: 'none' };
    const drawerInputStyle = { padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', width: '100%', outline: 'none', background: 'white', transition: 'border 0.2s' };
    
    const reactSelectStyles = {
        control: (base) => ({
            ...base,
            height: '40px',
            minHeight: '40px',
            borderRadius: '8px',
            borderColor: '#cbd5e1',
            boxShadow: 'none',
            '&:hover': { borderColor: '#94a3b8' }
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 12px',
            height: '38px',
            display: 'flex',
            alignItems: 'center'
        }),
        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0
        })
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
                <div style={{ padding: '1.5rem 2.5rem', background: 'linear-gradient(to right, #1e293b, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Building size={24} color="#38bdf8"/> {hotel ? `Quản lý: ${hotel.name}` : 'Thêm mới Khách sạn/Nhà cung cấp'}
                        </h2>
                        {hotel && <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>Mã định danh hệ thống: {hotel.code}</div>}
                    </div>
                    <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '50%', padding: '6px', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='rgba(255,255,255,0.2)'} onMouseOut={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'}>
                        <X size={20} />
                    </button>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 2.5rem', flexShrink: 0, gap: '2rem' }}>
                    <div className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')} style={tabStyle(activeTab === 'general')}>
                        <Users size={16} /> Hồ Sơ & Liên Hệ
                    </div>
                    <div className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')} style={tabStyle(activeTab === 'rates')}>
                        <BedDouble size={16} /> Báo Giá Dịch Vụ
                    </div>
                    <div className={`tab-btn ${activeTab === 'allotment' ? 'active' : ''}`} onClick={() => setActiveTab('allotment')} style={tabStyle(activeTab === 'allotment')}>
                        <CalendarDays size={16} /> Quỹ Allotment
                    </div>
                    {hotel && (
                        <div className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')} style={tabStyle(activeTab === 'notes')}>
                            <FileText size={16} /> Lịch Sử Ghi Chú
                        </div>
                    )}
                </div>

                {/* BODY SET */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem 2.5rem' }}>
                    {activeTab === 'general' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            {/* GENERAL INFO */}
                            <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <Building size={18} color="#cbd5e1" /> Thông tin cơ sở
                               </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem 2rem' }}>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Mã Nhà Cung Cấp *</label>
                                        <input type="text" style={{ ...drawerInputStyle, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} disabled={isViewOnly} placeholder="HOTEL-..." />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Tên Khách Sạn *</label>
                                        <input type="text" style={{ ...drawerInputStyle, fontWeight: 600, color: '#0f172a', borderColor: '#94a3b8' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isViewOnly} placeholder="Nhập tên..." />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Số Điện Thoại</label>
                                        <input type="text" style={drawerInputStyle} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={isViewOnly} placeholder="Phone" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Email Hệ Thống</label>
                                        <input type="email" style={drawerInputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isViewOnly} placeholder="Email" />
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Hạng sao / Class</label>
                                        <select style={drawerInputStyle} value={formData.star_rate} onChange={e => setFormData({...formData, star_rate: e.target.value})} disabled={isViewOnly}>
                                            <option value="">Chọn hạng...</option>
                                            <option value="5_star">5 Sao</option>
                                            <option value="4_star">4 Sao</option>
                                            <option value="3_star">3 Sao</option>
                                            <option value="resort">Khu nghỉ dưỡng - Resort</option>
                                            <option value="boutique">Boutique</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Thị trường MICE/Inbound</label>
                                        <Select 
                                            options={MARKET_OPTIONS}
                                            value={hotel?.market ? { label: hotel.market, value: hotel.market } : (formData.market ? { label: formData.market, value: formData.market } : null)}
                                            onChange={option => setFormData({...formData, market: option ? option.value : ''})}
                                            styles={reactSelectStyles}
                                            isClearable
                                            isDisabled={isViewOnly}
                                            placeholder="🔍 Gõ để tìm hoặc chọn..."
                                            noOptionsMessage={() => "Không tìm thấy thị trường"}
                                        />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Địa chỉ chi tiết</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }}>
                                            <input type="text" style={drawerInputStyle} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} disabled={isViewOnly} placeholder="Quốc gia" />
                                            <input type="text" style={drawerInputStyle} value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} disabled={isViewOnly} placeholder="Tỉnh / Ban" />
                                            <input type="text" style={drawerInputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={isViewOnly} placeholder="Số nhà, Đường..." />
                                        </div>
                                    </div>
                                    <div style={{ gridColumn: 'span 2', background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase' }}>
                                            <Link2 size={16} /> Link Drive Dữ Liệu NCC
                                        </label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <input type="url" style={{ ...drawerInputStyle, flex: 1, borderColor: '#93c5fd', background: 'white' }} value={formData.drive_link} onChange={e => setFormData({...formData, drive_link: e.target.value})} disabled={isViewOnly} placeholder="https://drive.google.com/..." />
                                            {formData.drive_link && (
                                                <a href={formData.drive_link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 12px', background: '#2563eb', color: 'white', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                                                    <ExternalLink size={14} /> Mở Drive
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Ghi chú đặc biệt</label>
                                        <textarea style={{...drawerInputStyle, resize: 'vertical'}} value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={isViewOnly} rows={2} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 1' }}>
                                        <label style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Đánh giá chất lượng</label>
                                        <StarRating 
                                            rating={Number(formData.rating) || 0} 
                                            onChange={(val) => setFormData({...formData, rating: val})} 
                                            disabled={isViewOnly} 
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* CONTACTS INFO */}
                            <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', position: 'relative' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <Users size={18} color="#cbd5e1" /> Liên Hệ Vận Hành
                                </h3>
                                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                                    <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <thead style={{ background: '#f1f5f9' }}>
                                            <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Họ và tên</th>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Chức vụ</th>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Ngày sinh</th>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Số điện thoại</th>
                                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Email</th>
                                                <th style={{ padding: '12px 16px', width: '50px' }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {contacts.map((c, i) => (
                                                <tr key={c.id || i}>
                                                    <td style={inputCell}><input style={inlineInput} value={c.name} onChange={e => handleContactChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên liên hệ" /></td>
                                                    <td style={inputCell}><input style={inlineInput} value={c.position} onChange={e => handleContactChange(i, 'position', e.target.value)} disabled={isViewOnly} placeholder="Sales / GM" /></td>
                                                    <td style={inputCell}><input style={inlineInput} type="date" value={c.dob} onChange={e => handleContactChange(i, 'dob', e.target.value)} disabled={isViewOnly} /></td>
                                                    <td style={inputCell}><input style={inlineInput} value={c.phone} onChange={e => handleContactChange(i, 'phone', e.target.value)} disabled={isViewOnly} placeholder="Phone" /></td>
                                                    <td style={inputCell}><input style={inlineInput} type="email" value={c.email} onChange={e => handleContactChange(i, 'email', e.target.value)} disabled={isViewOnly} placeholder="Email" /></td>
                                                    <td style={{ ...inputCell, textAlign: 'center' }}>
                                                        {!isViewOnly && (
                                                            <button style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#fef2f2'} onMouseOut={e=>e.currentTarget.style.background='transparent'} onClick={() => handleDeleteContact(i, c)}><Trash2 size={16} /></button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {!isViewOnly && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                        <button className="btn" style={{ background: '#f8fafc', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setContacts([...contacts, { id: Date.now(), name: '', position: '', dob: '', phone: '', email: '' }])}>
                                            <Plus size={16} /> Bổ sung người liên hệ
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rates' && (
                        <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minHeight: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                <h3 style={{ marginTop: 0, marginBottom: 0, fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <BedDouble size={18} color="#cbd5e1" /> SẢN PHẨM / DỊCH VỤ PHÒNG
                                </h3>
                                {availableContracts.length > 0 && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Hợp đồng áp dụng:</label>
                                        <select 
                                            value={activeContractId || ''} 
                                            onChange={e => handleContractChange(e.target.value)}
                                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a', background: '#f8fafc', outline: 'none' }}
                                        >
                                            {availableContracts.map(c => (
                                                <option key={c.id} value={c.id}>{c.contract_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: '1200px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            <th style={{ padding: '12px', width: '80px', fontWeight: 600 }}>SKU Code</th>
                                            <th style={{ padding: '12px', width: '160px', fontWeight: 600 }}>Tên Hạng Phòng/Dịch Vụ</th>
                                            <th style={{ padding: '12px', width: '120px', fontWeight: 600 }}>Hiệu lực Từ</th>
                                            <th style={{ padding: '12px', width: '120px', fontWeight: 600 }}>Đến lúc</th>
                                            <th style={{ padding: '12px', width: '110px', fontWeight: 600 }}>Thuộc tính</th>
                                            <th style={{ padding: '12px', width: '100px', fontWeight: 600 }}>Giá Contract</th>
                                            <th style={{ padding: '12px', width: '100px', fontWeight: 600 }}>Giá Net</th>
                                            <th style={{ padding: '12px', width: '100px', fontWeight: 600 }}>Giá Bán Pub</th>
                                            <th style={{ padding: '12px', fontWeight: 600 }}>Policy/Ghi chú</th>
                                            <th style={{ padding: '12px', width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((s, i) => (
                                            <tr key={s.id || i} style={{ transition: 'background 0.2s', ':hover': { background: '#f8fafc'} }}>
                                                <td style={inputCell}><input style={inlineInput} value={s.sku} onChange={e => handleServiceChange(i, 'sku', e.target.value)} disabled={isViewOnly} placeholder="SGL" /></td>
                                                <td style={inputCell}><input style={inlineInput} value={s.name} onChange={e => handleServiceChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Phòng Single" /></td>
                                                <td style={inputCell}><input type="date" style={inlineInput} value={s.start_date} onChange={e => handleServiceChange(i, 'start_date', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input type="date" style={inlineInput} value={s.end_date} onChange={e => handleServiceChange(i, 'end_date', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}>
                                                    <select style={{...inlineInput, background: '#f8fafc', borderColor: 'transparent'}} value={s.day_type} onChange={e => handleServiceChange(i, 'day_type', e.target.value)} disabled={isViewOnly}>
                                                        <option value="Ngày thường">Ngày thường</option>
                                                        <option value="Cuối tuần">Cuối tuần</option>
                                                        <option value="Lễ Tết">Lễ Tết</option>
                                                    </select>
                                                </td>
                                                <td style={inputCell}><input type="number" style={inlineInput} value={s.contract_price} onChange={e => handleServiceChange(i, 'contract_price', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input type="number" style={{...inlineInput, color: '#ef4444', fontWeight: 600}} value={s.net_price} onChange={e => handleServiceChange(i, 'net_price', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input type="number" style={{...inlineInput, color: '#10b981', fontWeight: 600}} value={s.sell_price} onChange={e => handleServiceChange(i, 'sell_price', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input style={inlineInput} value={s.notes} onChange={e => handleServiceChange(i, 'notes', e.target.value)} disabled={isViewOnly} placeholder="Free Bfst" /></td>
                                                <td style={{ ...inputCell, textAlign: 'center' }}>
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
                                    <button className="btn" style={{ background: '#f8fafc', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setServices([...services, { id: Date.now(), sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', contract_price: 0, net_price: 0, sell_price: 0 }])}>
                                        <Plus size={16} /> Thêm Dòng Báo Giá
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'allotment' && (
                        <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', minHeight: '400px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                <CalendarDays size={18} color="#cbd5e1" /> THEO DÕI QUỸ PHÒNG (ALLOTMENT)
                            </h3>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: '1300px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            <th style={{ padding: '12px', width: '80px', fontWeight: 600 }}>SKU Code</th>
                                            <th style={{ padding: '12px', width: '160px', fontWeight: 600 }}>Loại Phòng</th>
                                            <th style={{ padding: '12px', width: '120px', fontWeight: 600 }}>Giữ Từ Ký</th>
                                            <th style={{ padding: '12px', width: '120px', fontWeight: 600 }}>Hết Hạn</th>
                                            <th style={{ padding: '12px', width: '110px', fontWeight: 600 }}>Áp Dụng</th>
                                            <th style={{ padding: '12px', width: '90px', fontWeight: 600, textAlign: 'center' }}>Hệ Số Block</th>
                                            <th style={{ padding: '12px', width: '90px', fontWeight: 600, textAlign: 'center' }}>Cut-off Days</th>
                                            <th style={{ padding: '12px', width: '100px', fontWeight: 600 }}>Phí Net/Ngày</th>
                                            <th style={{ padding: '12px', width: '100px', fontWeight: 600 }}>Giá Bán Trừ</th>
                                            <th style={{ padding: '12px', fontWeight: 600 }}>Ghi chú</th>
                                            <th style={{ padding: '12px', width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allotments.map((a, i) => (
                                            <tr key={a.id || i} style={{ transition: 'background 0.2s' }}>
                                                <td style={inputCell}><input style={inlineInput} value={a.sku} onChange={e => handleAllotmentChange(i, 'sku', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input style={inlineInput} value={a.name} onChange={e => handleAllotmentChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Double Room" /></td>
                                                <td style={inputCell}><input type="date" style={inlineInput} value={a.start_date} onChange={e => handleAllotmentChange(i, 'start_date', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input type="date" style={inlineInput} value={a.end_date} onChange={e => handleAllotmentChange(i, 'end_date', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}>
                                                    <select style={{...inlineInput, background: '#f8fafc', borderColor: 'transparent'}} value={a.day_type} onChange={e => handleAllotmentChange(i, 'day_type', e.target.value)} disabled={isViewOnly}>
                                                        <option value="Ngày thường">Ngày thường</option>
                                                        <option value="Cuối tuần">Cuối tuần</option>
                                                        <option value="Lễ Tết">Lễ Tết</option>
                                                    </select>
                                                </td>
                                                <td style={inputCell}><input type="number" style={{...inlineInput, textAlign: 'center', background: '#eef2ff', fontWeight: 600, color: '#4f46e5', borderColor: '#c7d2fe'}} value={a.allotment_count} onChange={e => handleAllotmentChange(i, 'allotment_count', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input type="number" style={{...inlineInput, textAlign: 'center', background: '#fef2f2', fontWeight: 600, color: '#ef4444', borderColor: '#fecaca'}} value={a.cut_off_days} onChange={e => handleAllotmentChange(i, 'cut_off_days', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input type="number" style={inlineInput} value={a.net_price} onChange={e => handleAllotmentChange(i, 'net_price', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input type="number" style={inlineInput} value={a.sell_price} onChange={e => handleAllotmentChange(i, 'sell_price', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={inputCell}><input style={inlineInput} value={a.notes} onChange={e => handleAllotmentChange(i, 'notes', e.target.value)} disabled={isViewOnly} /></td>
                                                <td style={{ ...inputCell, textAlign: 'center' }}>
                                                    {!isViewOnly && (
                                                        <button style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', padding: '4px' }} onClick={() => handleDeleteAllotment(i, a)}><Trash2 size={16} /></button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!isViewOnly && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                    <button className="btn" style={{ background: '#f8fafc', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }} onClick={() => setAllotments([...allotments, { id: Date.now(), sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', allotment_count: 0, cut_off_days: 0, net_price: 0, sell_price: 0 }])}>
                                        <Plus size={16} /> Bổ sung quỹ phòng
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && hotel && (
                        <div style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
                            <div className="consultation-section animate-fade-in" style={{ gridColumn: 'span 3' }}>
                                <h2 className="consultation-title">Lịch sử tư vấn & Chăm sóc</h2>
                                <p className="consultation-subtitle">Theo dõi các lần trao đổi và ghi chú tiến trình với đối tác khách sạn.</p>
                                
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
                                        <button type="button" className="note-submit-btn" onClick={handleAddHotelNote}>
                                            <Send size={16} /> Gửi
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {hotelNotes.map(note => (
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
                                    {hotelNotes.length === 0 && (
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
                    <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem 2rem', background: '#f1f5f9', color: '#475569', border: 'none', fontWeight: 600, borderRadius: '8px' }}>HỦY ĐÓNG</button>
                    {!isViewOnly && (
                        <button className="btn btn-primary" onClick={handleSaveGlobal} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 2rem', background: 'linear-gradient(to right, #3b82f6, #2563eb)', color: 'white', border: 'none', fontWeight: 600, borderRadius: '8px', boxShadow: '0 4px 6px rgba(59, 130, 246, 0.2)' }}>
                            <Save size={18} /> LƯU HOÀN TẤT
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

const tabStyle = (isActive) => ({
    padding: '1rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.95rem',
    color: isActive ? '#2563eb' : '#64748b',
    borderBottom: isActive ? '3px solid #2563eb' : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative'
});
