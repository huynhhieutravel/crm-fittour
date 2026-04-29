import React, { useState, useEffect } from 'react';
import StarRating from '../common/StarRating';
import axios from 'axios';
import { X, Save, Plus, Trash2, Map, ShoppingBag, Users, FileText, Send, Clock, PlusCircle , ExternalLink, Link2 } from 'lucide-react';
import Select from 'react-select';
import { useMarkets } from '../../hooks/useMarkets';
import { isViewOnly as checkViewOnly } from '../../utils/permissions';

export default function LandtourDetailDrawer({ landtour, onClose, refreshList, currentUser, checkPerm, addToast }) {
    const [activeTab, setActiveTab] = useState('general');
    
    // States - match actual DB columns
    const marketOptions = useMarkets();
    const [formData, setFormData] = useState({
        code: '', name: '', tax_id: '', phone: '', email: '',
        country: '', province: '', address: '', notes: '',
        website: '', landtour_class: '', market: '', drive_link: '',
        bank_account_name: '', bank_account_number: '', bank_name: '', rating: ''
    });

    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);

    const [deletedContactIds, setDeletedContactIds] = useState([]);
    const [deletedServiceIds, setDeletedServiceIds] = useState([]);

    const [loading, setLoading] = useState(false);

    const [landtourNotes, setLandtourNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const fetchLandtourNotes = async () => {
        if (!landtour?.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/landtours/${landtour.id}/notes`, { headers: { Authorization: `Bearer ${token}` } });
            setLandtourNotes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddLandtourNote = async () => {
        if (!newNote.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/landtours/${landtour.id}/notes`, { content: newNote }, { headers: { Authorization: `Bearer ${token}` } });
            setNewNote('');
            fetchLandtourNotes();
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi thêm ghi chú!', 'error'); else alert('Lỗi thêm ghi chú!');
        }
    };

    useEffect(() => {
        if (landtour) {
            setFormData({
                code: landtour.code || '', name: landtour.name || '', tax_id: landtour.tax_id || '',
                phone: landtour.phone || '', email: landtour.email || '',
                country: landtour.country || '', province: landtour.province || '', address: landtour.address || '',
                notes: landtour.notes || '', 
                website: landtour.website || '', landtour_class: landtour.landtour_class || '',
                market: landtour.market || '', drive_link: landtour.drive_link || '',
                bank_account_name: landtour.bank_account_name || '', 
                bank_account_number: landtour.bank_account_number || '', 
                bank_name: landtour.bank_name || ''
            });

            setContacts(landtour.contacts || []);
            setServices(landtour.services || []);
            
            fetchLandtourNotes();
        } else {
            // New landtour - start with empty rows
            setContacts([{ id: Date.now() + 1, name: '', position: '', phone: '', email: '' }]);
            setServices([{ id: Date.now() + 2, name: '', description: '', capacity: '' }]);
            setLandtourNotes([]);
        }
    }, [landtour]);

    const handleSaveGlobal = async () => {
        try {
            if (!formData.name) {
                if (addToast) addToast('Tên Land Tour là bắt buộc!', 'error');
                else alert('Tên Land Tour là bắt buộc!');
                return;
            }
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = { 
                ...formData, contacts, services,
                deleted_contact_ids: deletedContactIds,
                deleted_service_ids: deletedServiceIds
            };
            
            if (landtour?.id) {
                await axios.put(`/api/landtours/${landtour.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('✅ Cập nhật thông tin land tour thành công!');
                refreshList();
            } else {
                await axios.post('/api/landtours', payload, { headers: { Authorization: `Bearer ${token}` } });
                if (addToast) addToast('✅ Tạo Land Tour thành công!');
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

    const isViewOnly = checkPerm ? (landtour ? !checkPerm('landtours', 'edit') : !checkPerm('landtours', 'create')) : checkViewOnly(currentUser?.role, 'suppliers');

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
                            <Map size={24} color="#fdba74"/> {landtour ? `Quản lý: ${landtour.name}` : 'Thêm mới Land Tour'}
                        </h2>
                        {landtour && <div style={{ fontSize: '0.85rem', color: '#fed7aa', marginTop: '6px' }}>Mã định danh hệ thống: {landtour.code}</div>}
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
                    {landtour && (
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
                                    <Map size={18} color="#cbd5e1" /> Thông tin Land Tour
                               </h3>
                                <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2rem' }}>
                                    <div>
                                        <label style={labelStyle}>Mã NCC Land Tour *</label>
                                        <input type="text" style={{ ...drawerInputStyle, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} disabled={isViewOnly} placeholder="LAND-..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Tên Land Tour *</label>
                                        <input type="text" style={{ ...drawerInputStyle, fontWeight: 600, color: '#0f172a', borderColor: '#94a3b8' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isViewOnly} placeholder="Nhập tên land tour..." />
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
                                        <label style={labelStyle}>Loại hình Land Tour</label>
                                        <select style={drawerInputStyle} value={formData.landtour_class} onChange={e => setFormData({...formData, landtour_class: e.target.value})} disabled={isViewOnly}>
                                            <option value="full_package">Land Tour Trọn Gói</option>
                                            <option value="partial_package">Land Tour Từng Phần</option>
                                            <option value="join_in">Land Tour Ghép</option>
                                            <option value="other">Khác</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Thị trường MICE/Inbound</label>
                                        <Select 
                                            isMulti
                                            options={marketOptions}
                                            value={formData.market ? formData.market.split(', ').map(m => ({ label: m, value: m })) : []}
                                            onChange={options => setFormData({...formData, market: options ? options.map(o => o.value).join(', ') : ''})}
                                            styles={reactSelectStyles}
                                            isClearable
                                            isDisabled={isViewOnly}
                                            placeholder="🔍 Gõ để tìm hoặc chọn nhiều..."
                                            noOptionsMessage={() => "Không tìm thấy thị trường"}
                                        />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Mã Số Thuế</label>
                                        <input type="text" style={drawerInputStyle} value={formData.tax_id} onChange={e => setFormData({...formData, tax_id: e.target.value})} disabled={isViewOnly} placeholder="Mã số thuế..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Website</label>
                                        <input type="text" style={drawerInputStyle} value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} disabled={isViewOnly} placeholder="https://..." />
                                    </div>
                                    <div style={{ gridColumn: 'span 2' }}>
                                        <label style={labelStyle}>Địa chỉ chi tiết</label>
                                        <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '1rem' }}>
                                            <input type="text" style={drawerInputStyle} value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} disabled={isViewOnly} placeholder="Quốc gia" />
                                            <input type="text" style={drawerInputStyle} value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} disabled={isViewOnly} placeholder="Tỉnh / Thành phố" />
                                            <input type="text" style={drawerInputStyle} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={isViewOnly} placeholder="Số nhà, Đường..." />
                                        </div>
                                    </div>
                                    
                                    <div style={{ gridColumn: 'span 2', background: '#eff6ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                        <label style={{ ...labelStyle, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                                <ShoppingBag size={18} color="#cbd5e1" /> DANH MỤC DỊCH VỤ LAND TOUR
                            </h3>
                            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: '1300px', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead style={{ background: '#f1f5f9' }}>
                                        <tr style={{ textAlign: 'left', color: '#475569', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '80px' }}>SKU</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '130px' }}>Loại hình dịch vụ</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '200px' }}>Dịch vụ cung cấp</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '180px' }}>Mô tả</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '150px' }}>Ghi chú</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '80px', textAlign: 'center' }}>Số lượng</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '120px' }}>Giá KT</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '120px' }}>Giá gốc</th>
                                            <th style={{ padding: '12px 16px', fontWeight: 600, width: '120px' }}>Giá bán</th>
                                            <th style={{ padding: '12px 16px', width: '50px', textAlign: 'center' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((s, i) => (
                                            <tr key={s.id || i}>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input style={inlineInput} value={s.sku || ''} onChange={e => handleServiceChange(i, 'sku', e.target.value)} disabled={isViewOnly} placeholder="SKU" /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input style={inlineInput} value={s.service_type || ''} onChange={e => handleServiceChange(i, 'service_type', e.target.value)} disabled={isViewOnly} placeholder="Loại" /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input style={{...inlineInput, fontWeight: 600}} value={s.name || ''} onChange={e => handleServiceChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên dịch vụ..." /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input style={inlineInput} value={s.description || ''} onChange={e => handleServiceChange(i, 'description', e.target.value)} disabled={isViewOnly} placeholder="Chi tiết..." /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input style={inlineInput} value={s.notes || ''} onChange={e => handleServiceChange(i, 'notes', e.target.value)} disabled={isViewOnly} placeholder="Ghi chú..." /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input type="number" style={{...inlineInput, textAlign: 'center', background: '#eef2ff', fontWeight: 600, color: '#4f46e5', borderColor: '#c7d2fe'}} value={s.capacity || ''} onChange={e => handleServiceChange(i, 'capacity', e.target.value)} disabled={isViewOnly} placeholder="1" /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input type="number" style={inlineInput} value={s.cost_price || ''} onChange={e => handleServiceChange(i, 'cost_price', e.target.value)} disabled={isViewOnly} placeholder="Giá KT" /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input type="number" style={inlineInput} value={s.net_price || ''} onChange={e => handleServiceChange(i, 'net_price', e.target.value)} disabled={isViewOnly} placeholder="Giá gốc" /></td>
                                                <td style={{...inputCell, borderBottom: '1px solid #e2e8f0'}}><input type="number" style={{...inlineInput, color: '#16a34a', fontWeight: 'bold'}} value={s.sale_price || ''} onChange={e => handleServiceChange(i, 'sale_price', e.target.value)} disabled={isViewOnly} placeholder="Giá bán" /></td>
                                                <td style={{...inputCell, textAlign: 'center', borderBottom: '1px solid #e2e8f0'}}>
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
                                    <button style={{ background: '#f8fafc', color: '#3b82f6', border: '1px dashed #cbd5e1', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, borderRadius: '6px', cursor: 'pointer' }} onClick={() => setServices([...services, { id: Date.now(), name: '', description: '', capacity: '' }])}>
                                        <Plus size={16} /> Thêm Dịch Vụ
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && landtour && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="consultation-section animate-fade-in">
                                <h2 className="consultation-title">Lịch sử tư vấn & Chăm sóc</h2>
                                <p className="consultation-subtitle">Theo dõi các lần trao đổi và ghi chú tiến trình với đối tác land tour.</p>
                                
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
                                        <button type="button" className="note-submit-btn" onClick={handleAddLandtourNote}>
                                            <Send size={16} /> Gửi
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {landtourNotes.map(note => (
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
                                    {landtourNotes.length === 0 && (
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
