import React, { useState, useEffect } from 'react';
import StarRating from '../common/StarRating';
import axios from 'axios';
import { X, Save, Plus, Trash2, Truck, ShoppingBag, Users, FileText, Send, Clock, PlusCircle, ExternalLink, Link2, ImageIcon, Upload, File, Download, Eye } from 'lucide-react';
import Select from 'react-select';
import { useMarkets } from '../../hooks/useMarkets';
import { isViewOnly as checkViewOnly } from '../../utils/permissions';

export default function TransportDetailDrawer({ transport, onClose, refreshList, currentUser, checkPerm, addToast }) {
    const [activeTab, setActiveTab] = useState('general');
    
    // States - match actual DB columns
    const marketOptions = useMarkets();
    const [formData, setFormData] = useState({
        code: '', name: '', tax_id: '', phone: '', email: '',
        country: '', province: '', address: '', notes: '', transport_class: '',
        website: '', vehicle_type: '', market: '', drive_link: '',
        bank_account_name: '', bank_account_number: '', bank_name: '', rating: ''
    });

    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);

    const [deletedContactIds, setDeletedContactIds] = useState([]);
    const [deletedServiceIds, setDeletedServiceIds] = useState([]);

    const [loading, setLoading] = useState(false);

    const [transportNotes, setTransportNotes] = useState([]);
    const [newNote, setNewNote] = useState('');

    const [mediaFiles, setMediaFiles] = useState([]);
    const [pendingUploads, setPendingUploads] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [lightboxMedia, setLightboxMedia] = useState(null);
    const fileInputRef = React.useRef(null);

    const fetchTransportNotes = async () => {
        if (!transport?.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/transports/${transport.id}/notes`, { headers: { Authorization: `Bearer ${token}` } });
            setTransportNotes(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddTransportNote = async () => {
        if (!newNote.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`/api/transports/${transport.id}/notes`, { content: newNote }, { headers: { Authorization: `Bearer ${token}` } });
            setNewNote('');
            fetchTransportNotes();
        } catch (err) {
            console.error(err);
            if (addToast) addToast('Lỗi thêm ghi chú!', 'error'); else alert('Lỗi thêm ghi chú!');
        }
    };

    const fetchMedia = async () => {
        if (!transport?.id) return;
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/transports/${transport.id}/media`, { headers: { Authorization: `Bearer ${token}` } });
            setMediaFiles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = async (files) => {
        if (mediaFiles.length + pendingUploads.length >= 10) { addToast?.('Đã đạt tối đa 10 file!', 'error'); return; }
        const validFiles = Array.from(files).filter(f => f.size <= 10 * 1024 * 1024);
        if (validFiles.length < files.length) addToast?.('Một số file vượt quá 10MB và đã bị loại.', 'warning');
        
        if (!transport?.id) {
            const newPending = validFiles.map(f => ({ file: f, url: URL.createObjectURL(f), isPending: true }));
            setPendingUploads(prev => [...prev, ...newPending].slice(0, 10 - mediaFiles.length));
            return;
        }

        const token = localStorage.getItem('token');
        setLoading(true);
        for (const file of validFiles) {
            try {
                const fd = new FormData();
                fd.append('file', file);
                await axios.post(`/api/transports/${transport.id}/media`, fd, {
                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                    onUploadProgress: (evt) => setUploadProgress(Math.round((evt.loaded * 100) / evt.total))
                });
            } catch (err) {
                addToast?.(`Lỗi upload ${file.name}`, 'error');
            }
        }
        setUploadProgress(0);
        setLoading(false);
        fetchMedia();
    };

    const handleDeleteMedia = async (media) => {
        if (!window.confirm('Bạn có chắc chắn xóa file này?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/transports/media/${media.id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchMedia();
            addToast?.('Xóa thành công', 'success');
        } catch (err) {
            addToast?.('Xóa thất bại', 'error');
        }
    };

    const handleDrag = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(e.type === "dragenter" || e.type === "dragover"); };
    const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileUpload(e.dataTransfer.files); };
    const removePendingUpload = (index) => setPendingUploads(prev => prev.filter((_, i) => i !== index));

    useEffect(() => {
        if (transport) {
            setFormData({
                code: transport.code || '', name: transport.name || '', tax_id: transport.tax_id || '',
                phone: transport.phone || '', email: transport.email || '',
                country: transport.country || '', province: transport.province || '', address: transport.address || '',
                notes: transport.notes || '', transport_class: transport.transport_class || '', 
                website: transport.website || '', vehicle_type: transport.vehicle_type || '',
                market: transport.market || '', drive_link: transport.drive_link || '',
                bank_account_name: transport.bank_account_name || '', 
                bank_account_number: transport.bank_account_number || '', 
                bank_name: transport.bank_name || ''
            });

            setContacts(transport.contacts || []);
            setServices(transport.services || []);
            
            fetchTransportNotes();
            fetchMedia();
            setPendingUploads([]);
        } else {
            // New transport - start with empty rows
            setContacts([{ id: Date.now() + 1, name: '', position: '', phone: '', email: '' }]);
            setServices([{ id: Date.now() + 2, name: '', description: '', capacity: '' }]);
            setTransportNotes([]);
            setMediaFiles([]);
            setPendingUploads([]);
        }
    }, [transport]);

    const handleSaveGlobal = async () => {
        try {
            if (!formData.name) {
                if (addToast) addToast('Tên Nhà xe là bắt buộc!', 'error');
                else alert('Tên Nhà xe là bắt buộc!');
                return;
            }
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = { 
                ...formData, contacts, services,
                deleted_contact_ids: deletedContactIds,
                deleted_service_ids: deletedServiceIds
            };
            
            if (transport?.id) {
                await axios.put(`/api/transports/${transport.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                
                // Cập nhật lại media nếu lúc đầu failed? Hiện tại edit thì upload luôn lúc chọn ảnh.
                
                if (addToast) addToast('✅ Cập nhật thông tin nhà xe thành công!');
                refreshList();
                onClose();
            } else {
                const created = await axios.post('/api/transports', payload, { headers: { Authorization: `Bearer ${token}` } });
                
                if (pendingUploads.length > 0 && created.data.id) {
                    for (const p of pendingUploads) {
                        try {
                            const fd = new FormData();
                            fd.append('file', p.file);
                            await axios.post(`/api/transports/${created.data.id}/media`, fd, {
                                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
                            });
                        } catch(e) { console.error("Lỗi upload file", e); }
                    }
                }
                
                if (addToast) addToast('✅ Tạo Nhà xe thành công!');
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

    const isViewOnly = checkPerm ? (transport ? !checkPerm('transports', 'edit') : !checkPerm('transports', 'create')) : checkViewOnly(currentUser?.role, 'suppliers');

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
                            <Truck size={24} color="#fdba74"/> {transport ? `Quản lý: ${transport.name}` : 'Thêm mới Nhà xe'}
                        </h2>
                        {transport && <div style={{ fontSize: '0.85rem', color: '#fed7aa', marginTop: '6px' }}>Mã định danh hệ thống: {transport.code}</div>}
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
                        <ImageIcon size={16} /> Phương Tiện & Dịch Vụ
                    </div>
                    {transport && (
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
                                    <Truck size={18} color="#cbd5e1" /> Thông tin Nhà xe
                               </h3>
                                <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 2rem' }}>
                                    <div>
                                        <label style={labelStyle}>Mã Nhà Cung Cấp *</label>
                                        <input type="text" style={{ ...drawerInputStyle, background: '#f1f5f9', color: '#64748b', fontWeight: 600 }} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} disabled={isViewOnly} placeholder="TRANS-..." />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Tên Nhà Xe *</label>
                                        <input type="text" style={{ ...drawerInputStyle, fontWeight: 600, color: '#0f172a', borderColor: '#94a3b8' }} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isViewOnly} placeholder="Nhập tên nhà xe..." />
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
                                        <label style={labelStyle}>Loại hình Nhà xe</label>
                                        <select style={drawerInputStyle} value={formData.transport_class} onChange={e => setFormData({...formData, transport_class: e.target.value})} disabled={isViewOnly}>
                                            <option value="">Chọn loại hình...</option>
                                            <option value="4_seats">Bốn chỗ</option>
                                            <option value="7_seats">Bảy chỗ</option>
                                            <option value="16_seats">16 chỗ</option>
                                            <option value="29_seats">29 chỗ</option>
                                            <option value="45_seats">45 chỗ</option>
                                            <option value="limousine">Limousine</option>
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
                                        <label style={labelStyle}>Loại xe / Dịch vụ</label>
                                        <input type="text" style={drawerInputStyle} value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})} disabled={isViewOnly} placeholder="Việt Nam, Trung Hoa, Âu..." />
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
                        <div className="card" style={{ background: 'white', padding: '2rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', color: '#475569', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                                    <ImageIcon size={18} color="#cbd5e1" /> HÌNH ẢNH XE & BẢNG GIÁ ĐÍNH KÈM
                                </h3>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{mediaFiles.length + pendingUploads.length}/10 file</span>
                            </div>

                            {!isViewOnly && (mediaFiles.length + pendingUploads.length) < 10 && (
                                <div 
                                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    style={{ border: `2px dashed ${isDragging ? '#3b82f6' : '#cbd5e1'}`, borderRadius: '12px', padding: '2.5rem', textAlign: 'center', background: isDragging ? '#eff6ff' : '#f8fafc', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.5rem' }}
                                >
                                    <input type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf" style={{ display: 'none' }} ref={fileInputRef} onChange={e => handleFileUpload(e.target.files)} />
                                    <Upload size={32} color={isDragging ? '#3b82f6' : '#94a3b8'} style={{ margin: '0 auto 12px' }} />
                                    <p style={{ margin: '0 0 8px', color: '#334155', fontWeight: 600 }}>Kéo thả file vào đây hoặc click để chọn</p>
                                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Hỗ trợ: JPG, PNG, WebP, PDF (Tối đa 10MB/file)</p>
                                    {uploadProgress > 0 && <div style={{ marginTop: '1rem', background: '#e2e8f0', borderRadius: '8px', overflow: 'hidden' }}><div style={{ width: `${uploadProgress}%`, background: '#3b82f6', height: '4px', transition: 'width 0.2s' }} /></div>}
                                </div>
                            )}

                            {loading && uploadProgress === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Đang tải...</div>
                            ) : (mediaFiles.length > 0 || pendingUploads.length > 0) ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1rem' }}>
                                    {[...pendingUploads, ...mediaFiles].map((m, idx) => {
                                        const isPending = m.isPending;
                                        const isPdf = isPending ? m.file.type === 'application/pdf' : m.file_type === 'pdf';
                                        const fileUrl = isPending ? m.url : m.file_url;
                                        const fileName = isPending ? m.file.name : m.file_name;
                                        
                                        return (
                                            <div key={isPending ? `pending-${idx}` : m.id} style={{ position: 'relative', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', background: '#f8fafc', aspectRatio: '1', display: 'flex', flexDirection: 'column' }}>
                                                {isPending && <div style={{ position: 'absolute', top: '8px', left: '8px', background: 'rgba(245,158,11,0.9)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, zIndex: 2 }}>Chưa lưu</div>}
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: isPdf ? '#eff6ff' : '#fff', position: 'relative', overflow: 'hidden' }}>
                                                    {isPdf ? <File size={40} color="#3b82f6" /> : <img src={fileUrl} alt={fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                    <div className="media-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: 0, transition: 'opacity 0.2s' }}>
                                                        {isPdf ? (
                                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ background: 'white', padding: '8px', borderRadius: '50%', color: '#0f172a' }}><Download size={18} /></a>
                                                        ) : (
                                                            <button onClick={() => setLightboxMedia(m)} style={{ background: 'white', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: '#0f172a' }}><Eye size={18} /></button>
                                                        )}
                                                        {!isViewOnly && (
                                                            <button onClick={() => isPending ? removePendingUpload(idx) : handleDeleteMedia(m)} style={{ background: '#ef4444', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', color: 'white' }}><Trash2 size={18} /></button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ padding: '8px', fontSize: '0.75rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', borderTop: '1px solid #e2e8f0', background: 'white' }} title={fileName}>{fileName}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '12px' }}>
                                    <ImageIcon size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                                    <div style={{ fontSize: '0.9rem' }}>Chưa có hình ảnh hoặc file đính kèm nào</div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'notes' && transport && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div className="consultation-section animate-fade-in">
                                <h2 className="consultation-title">Lịch sử tư vấn & Chăm sóc</h2>
                                <p className="consultation-subtitle">Theo dõi các lần trao đổi và ghi chú tiến trình với đối tác nhà xe.</p>
                                
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
                                        <button type="button" className="note-submit-btn" onClick={handleAddTransportNote}>
                                            <Send size={16} /> Gửi
                                        </button>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    {transportNotes.map(note => (
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
                                    {transportNotes.length === 0 && (
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

                {/* LIGHTBOX FOR IMAGES */}
                {lightboxMedia && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button onClick={() => setLightboxMedia(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={32} /></button>
                        <img src={lightboxMedia.isPending ? lightboxMedia.url : lightboxMedia.file_url} alt="Preview" style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} />
                    </div>
                )}

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
