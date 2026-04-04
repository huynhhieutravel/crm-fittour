import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2, Building, Phone, MapPin, Globe, CreditCard, Users, BedDouble, CalendarDays } from 'lucide-react';

export default function HotelDetailDrawer({ hotel, onClose, refreshList, currentUser }) {
    const [activeTab, setActiveTab] = useState('general');
    
    // States
    const [formData, setFormData] = useState({
        code: '', name: '', tax_id: '', build_year: '', phone: '', email: '',
        country: '', province: '', address: '', notes: '', star_rate: '',
        website: '', hotel_class: '', project_name: '', market: '',
        bank_account_name: '', bank_account_number: '', bank_name: ''
    });

    const [contacts, setContacts] = useState([]);
    const [services, setServices] = useState([]);
    const [allotments, setAllotments] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (hotel) {
            setFormData({
                ...hotel,
                code: hotel.code || '', name: hotel.name || '', tax_id: hotel.tax_id || '',
                phone: hotel.phone || '', email: hotel.email || '',
                country: hotel.country || '', province: hotel.province || '', address: hotel.address || '',
                notes: hotel.notes || '', star_rate: hotel.star_rate || '', website: hotel.website || '',
                market: hotel.market || ''
            });

            // If we have detailed arrays from API
            setContacts(hotel.contacts || []);
            
            // Map rates back to monolithic services
            if (hotel.contracts && hotel.contracts.length > 0 && hotel.contracts[0].rates) {
                const mappedServices = hotel.contracts[0].rates.map(r => ({
                    id: r.id, sku: r.sku, name: r.room_name, start_date: r.start_date?.split('T')[0] || '', end_date: r.end_date?.split('T')[0] || '',
                    day_type: r.day_type, contract_price: r.contract_price, net_price: r.net_price, sell_price: r.sell_price, description: r.description, notes: r.notes
                }));
                setServices(mappedServices);
            } else {
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
        } else {
            // New hotel initialization
            setContacts([{ id: Date.now() + 1, name: '', position: '', dob: '', phone: '', email: '' }]);
            setServices([{ id: Date.now() + 2, sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', contract_price: 0, net_price: 0, sell_price: 0 }]);
            setAllotments([{ id: Date.now() + 3, sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', allotment_count: 0, cut_off_days: 0, net_price: 0, sell_price: 0 }]);
        }
    }, [hotel]);

    const handleSaveGlobal = async () => {
        try {
            if (!formData.name) return alert('Tên Khách sạn là bắt buộc!');
            setLoading(true);
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                contacts,
                services,
                allotments
            };
            
            if (hotel?.id) {
                await axios.put(`/api/hotels/${hotel.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
                alert('Cập nhật thông tin thành công!');
            } else {
                await axios.post('/api/hotels', payload, { headers: { Authorization: `Bearer ${token}` } });
                alert('Tạo Khách sạn thành công!');
                // Auto close on success creation
                refreshList();
                onClose();
            }
            refreshList();
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.message || err.message));
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

    const handleAllotmentChange = (index, field, value) => {
        const newArr = [...allotments];
        newArr[index][field] = value;
        setAllotments(newArr);
    };

    return (
        <div className="drawer-overlay" style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end'
        }}>
            <div className="drawer-content" style={{
                width: '1200px', maxWidth: '100%', background: '#f8fafc', height: '100%',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease'
            }}>
                {/* HEAD */}
                <div style={{ padding: '1.5rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>
                            {hotel ? `Quản lý: ${hotel.name}` : 'Thêm mới Khách sạn'}
                        </h2>
                        {hotel && <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>Mã hệ thống: {hotel.code}</div>}
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* TABS */}
                <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 2rem', flexShrink: 0 }}>
                    <div className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')} style={tabStyle(activeTab === 'general')}>
                        <Users size={16} style={{marginRight: 6}}/> Hồ sơ gốc & Liên hệ
                    </div>
                    <div className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')} style={tabStyle(activeTab === 'rates')}>
                        <BedDouble size={16} style={{marginRight: 6}}/> Sản phẩm & Dịch vụ
                    </div>
                    <div className={`tab-btn ${activeTab === 'allotment' ? 'active' : ''}`} onClick={() => setActiveTab('allotment')} style={tabStyle(activeTab === 'allotment')}>
                        <CalendarDays size={16} style={{marginRight: 6}}/> Allotment (Quỹ chờ)
                    </div>
                </div>

                {/* BODY SET */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {activeTab === 'general' && (
                        <div>
                            {/* GENERAL INFO */}
                            <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '10px' }}>
                                    <Building size={18} color="#3b82f6" /> Thông tin cơ bản
                               </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label>Mã Nhà Cung Cấp *</label>
                                        <input type="text" className="form-control" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group">
                                        <label>Tên Khách Sạn *</label>
                                        <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group">
                                        <label>Số Điện Thoại</label>
                                        <input type="text" className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Liên Hệ</label>
                                        <input type="text" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group">
                                        <label>Hạng sao (Class)</label>
                                        <select className="form-select" value={formData.star_rate} onChange={e => setFormData({...formData, star_rate: e.target.value})} disabled={isViewOnly}>
                                            <option value="">Chọn hạng...</option>
                                            <option value="5_star">5 Sao</option>
                                            <option value="4_star">4 Sao</option>
                                            <option value="3_star">3 Sao</option>
                                            <option value="resort">Khu nghỉ dưỡng - Resort</option>
                                            <option value="boutique">Boutique</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Quốc gia</label>
                                        <input type="text" className="form-control" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group">
                                        <label>Tỉnh thành</label>
                                        <input type="text" className="form-control" value={formData.province} onChange={e => setFormData({...formData, province: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Địa chỉ</label>
                                        <input type="text" className="form-control" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group">
                                        <label>Thị trường mục tiêu</label>
                                        <select className="form-select" value={formData.market} onChange={e => setFormData({...formData, market: e.target.value})} disabled={isViewOnly}>
                                            <option value="">-- Chọn Thị Trường --</option>
                                            <optgroup label="Việt Nam"><option value="Việt Nam (MICE)">Việt Nam (MICE)</option></optgroup>
                                            <optgroup label="Trung Quốc Đại Lục">
                                                <option value="Trung Quốc">Trung Quốc (Chung)</option>
                                                <option value="Bắc Kinh">Bắc Kinh</option>
                                                <option value="Cáp Nhĩ Tân">Cáp Nhĩ Tân</option>
                                                <option value="Cửu Trại Câu">Cửu Trại Câu</option>
                                                <option value="Giang Nam">Giang Nam</option>
                                                <option value="Giang Tây">Giang Tây</option>
                                                <option value="Lệ Giang">Lệ Giang</option>
                                                <option value="Tân Cương">Tân Cương</option>
                                                <option value="Tây An">Tây An</option>
                                                <option value="Tây Tạng">Tây Tạng</option>
                                                <option value="Vân Nam">Vân Nam</option>
                                                <option value="Á Đinh">Á Đinh</option>
                                            </optgroup>
                                            <optgroup label="Đông Bắc Á">
                                                <option value="Hàn Quốc">Hàn Quốc</option>
                                                <option value="Nhật Bản">Nhật Bản</option>
                                                <option value="Mông Cổ">Mông Cổ</option>
                                                <option value="Đài Loan">Đài Loan</option>
                                            </optgroup>
                                            <optgroup label="Nam Á & Himalayas">
                                                <option value="Bhutan">Bhutan</option>
                                                <option value="Himalayas">Himalayas</option>
                                                <option value="Kailash">Kailash</option>
                                                <option value="Kashmir">Kashmir</option>
                                                <option value="Ladakh">Ladakh</option>
                                                <option value="Nepal">Nepal</option>
                                                <option value="Pakistan">Pakistan</option>
                                            </optgroup>
                                            <optgroup label="Trung Á & Lân Cận">
                                                <option value="Trung Á">Trung Á</option>
                                                <option value="Caucasus">Caucasus</option>
                                                <option value="Silk Road">Silk Road</option>
                                            </optgroup>
                                            <optgroup label="Đông Nam Á">
                                                <option value="Đông Nam Á">Đông Nam Á (Chung)</option>
                                                <option value="Bromo">Bromo (Indonesia)</option>
                                                <option value="Thái Lan">Thái Lan</option>
                                                <option value="Singapore">Singapore</option>
                                                <option value="Malaysia">Malaysia</option>
                                            </optgroup>
                                            <optgroup label="Châu Âu & Nga">
                                                <option value="Châu Âu">Châu Âu</option>
                                                <option value="Nga - Murmansk">Nga - Murmansk</option>
                                            </optgroup>
                                            <optgroup label="Trung Đông & Châu Phi">
                                                <option value="Trung Đông">Trung Đông</option>
                                                <option value="Thổ Nhĩ Kỳ">Thổ Nhĩ Kỳ</option>
                                                <option value="Dubai">Dubai</option>
                                                <option value="Ai Cập">Ai Cập</option>
                                                <option value="Morocco">Morocco</option>
                                                <option value="Châu Phi">Châu Phi</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Ghi chú KS</label>
                                        <textarea className="form-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={isViewOnly} rows={2} />
                                    </div>
                                </div>
                            </div>

                            {/* CONTACTS INFO */}
                            <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', position: 'relative' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', textTransform: 'uppercase', color: '#1e293b' }}>
                                    THÔNG TIN LIÊN HỆ
                                </h3>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: '#64748b' }}>
                                            <th style={{ paddingBottom: '8px' }}>Họ và tên</th>
                                            <th style={{ paddingBottom: '8px' }}>Chức vụ</th>
                                            <th style={{ paddingBottom: '8px' }}>Ngày sinh</th>
                                            <th style={{ paddingBottom: '8px' }}>Số điện thoại</th>
                                            <th style={{ paddingBottom: '8px' }}>Email</th>
                                            <th style={{ paddingBottom: '8px', width: '40px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contacts.map((c, i) => (
                                            <tr key={c.id || i}>
                                                <td style={{ paddingRight: '8px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={c.name} onChange={e => handleContactChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên" />
                                                </td>
                                                <td style={{ paddingRight: '8px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={c.position} onChange={e => handleContactChange(i, 'position', e.target.value)} disabled={isViewOnly} placeholder="Chức vụ" />
                                                </td>
                                                <td style={{ paddingRight: '8px', paddingBottom: '8px' }}>
                                                    <input type="date" className="form-control form-control-sm" value={c.dob} onChange={e => handleContactChange(i, 'dob', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '8px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={c.phone} onChange={e => handleContactChange(i, 'phone', e.target.value)} disabled={isViewOnly} placeholder="Số điện thoại" />
                                                </td>
                                                <td style={{ paddingRight: '8px', paddingBottom: '8px' }}>
                                                    <input type="email" className="form-control form-control-sm" value={c.email} onChange={e => handleContactChange(i, 'email', e.target.value)} disabled={isViewOnly} placeholder="Email" />
                                                </td>
                                                <td style={{ paddingBottom: '8px', textAlign: 'center' }}>
                                                    {!isViewOnly && (
                                                        <button className="btn btn-sm" style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }} onClick={() => setContacts(contacts.filter((_, idx) => idx !== i))}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {!isViewOnly && (
                                    <button className="btn" style={{ position: 'absolute', bottom: '-15px', right: '1.5rem', width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} onClick={() => setContacts([...contacts, { id: Date.now(), name: '', position: '', dob: '', phone: '', email: '' }])}>
                                        <Plus size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'rates' && (
                        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative', minHeight: '400px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', textTransform: 'uppercase', color: '#1e293b' }}>
                                SẢN PHẨM / DỊCH VỤ
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: '#64748b' }}>
                                            <th style={{ paddingBottom: '8px', width: '60px' }}>SKU</th>
                                            <th style={{ paddingBottom: '8px', width: '140px' }}>Tên dịch vụ</th>
                                            <th style={{ paddingBottom: '8px', width: '110px' }}>Giai đoạn từ</th>
                                            <th style={{ paddingBottom: '8px', width: '110px' }}>Đến</th>
                                            <th style={{ paddingBottom: '8px', width: '100px' }}>Loại ngày</th>
                                            <th style={{ paddingBottom: '8px', width: '90px' }}>Giá KT</th>
                                            <th style={{ paddingBottom: '8px', width: '90px' }}>Giá Net</th>
                                            <th style={{ paddingBottom: '8px', width: '90px' }}>Giá bán</th>
                                            <th style={{ paddingBottom: '8px' }}>Ghi chú</th>
                                            <th style={{ paddingBottom: '8px', width: '30px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {services.map((s, i) => (
                                            <tr key={s.id || i}>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={s.sku} onChange={e => handleServiceChange(i, 'sku', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={s.name} onChange={e => handleServiceChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên phòng..." />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="date" className="form-control form-control-sm" value={s.start_date} onChange={e => handleServiceChange(i, 'start_date', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="date" className="form-control form-control-sm" value={s.end_date} onChange={e => handleServiceChange(i, 'end_date', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <select className="form-select form-select-sm" value={s.day_type} onChange={e => handleServiceChange(i, 'day_type', e.target.value)} disabled={isViewOnly}>
                                                        <option value="Ngày thường">Ngày thường</option>
                                                        <option value="Cuối tuần">Cuối tuần</option>
                                                        <option value="Lễ Tết">Lễ Tết</option>
                                                    </select>
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="number" className="form-control form-control-sm" value={s.contract_price} onChange={e => handleServiceChange(i, 'contract_price', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="number" className="form-control form-control-sm" value={s.net_price} onChange={e => handleServiceChange(i, 'net_price', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="number" className="form-control form-control-sm" value={s.sell_price} onChange={e => handleServiceChange(i, 'sell_price', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={s.notes} onChange={e => handleServiceChange(i, 'notes', e.target.value)} disabled={isViewOnly} placeholder="Ghi chú..." />
                                                </td>
                                                <td style={{ paddingBottom: '8px', textAlign: 'center' }}>
                                                    {!isViewOnly && (
                                                        <button className="btn btn-sm" style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }} onClick={() => setServices(services.filter((_, idx) => idx !== i))}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!isViewOnly && (
                                <button className="btn" style={{ position: 'absolute', bottom: '-15px', right: '1.5rem', width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} onClick={() => setServices([...services, { id: Date.now(), sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', contract_price: 0, net_price: 0, sell_price: 0 }])}>
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'allotment' && (
                        <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative', minHeight: '400px' }}>
                            <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', textTransform: 'uppercase', color: '#1e293b' }}>
                                ALLOTMENT
                            </h3>
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', color: '#64748b' }}>
                                            <th style={{ paddingBottom: '8px', width: '60px' }}>SKU</th>
                                            <th style={{ paddingBottom: '8px', width: '140px' }}>Tên dịch vụ</th>
                                            <th style={{ paddingBottom: '8px', width: '110px' }}>Giai đoạn từ</th>
                                            <th style={{ paddingBottom: '8px', width: '110px' }}>Đến</th>
                                            <th style={{ paddingBottom: '8px', width: '100px' }}>Loại ngày</th>
                                            <th style={{ paddingBottom: '8px', width: '70px', textAlign: 'center' }}>Số lượng block</th>
                                            <th style={{ paddingBottom: '8px', width: '70px', textAlign: 'center' }}>Số ngày COD</th>
                                            <th style={{ paddingBottom: '8px', width: '90px' }}>Net/Ngày</th>
                                            <th style={{ paddingBottom: '8px', width: '90px' }}>Bán/Ngày</th>
                                            <th style={{ paddingBottom: '8px' }}>Ghi chú</th>
                                            <th style={{ paddingBottom: '8px', width: '30px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {allotments.map((a, i) => (
                                            <tr key={a.id || i}>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={a.sku} onChange={e => handleAllotmentChange(i, 'sku', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={a.name} onChange={e => handleAllotmentChange(i, 'name', e.target.value)} disabled={isViewOnly} placeholder="Tên phòng..." />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="date" className="form-control form-control-sm" value={a.start_date} onChange={e => handleAllotmentChange(i, 'start_date', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="date" className="form-control form-control-sm" value={a.end_date} onChange={e => handleAllotmentChange(i, 'end_date', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <select className="form-select form-select-sm" value={a.day_type} onChange={e => handleAllotmentChange(i, 'day_type', e.target.value)} disabled={isViewOnly}>
                                                        <option value="Ngày thường">Ngày thường</option>
                                                        <option value="Cuối tuần">Cuối tuần</option>
                                                        <option value="Lễ Tết">Lễ Tết</option>
                                                    </select>
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="number" className="form-control form-control-sm" value={a.allotment_count} onChange={e => handleAllotmentChange(i, 'allotment_count', e.target.value)} disabled={isViewOnly} placeholder="Qty" style={{textAlign: 'center'}} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="number" className="form-control form-control-sm" value={a.cut_off_days} onChange={e => handleAllotmentChange(i, 'cut_off_days', e.target.value)} disabled={isViewOnly} placeholder="Days" style={{textAlign: 'center', color: '#ef4444', fontWeight: 'bold'}} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="number" className="form-control form-control-sm" value={a.net_price} onChange={e => handleAllotmentChange(i, 'net_price', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="number" className="form-control form-control-sm" value={a.sell_price} onChange={e => handleAllotmentChange(i, 'sell_price', e.target.value)} disabled={isViewOnly} />
                                                </td>
                                                <td style={{ paddingRight: '4px', paddingBottom: '8px' }}>
                                                    <input type="text" className="form-control form-control-sm" value={a.notes} onChange={e => handleAllotmentChange(i, 'notes', e.target.value)} disabled={isViewOnly} placeholder="Ghi chú..." />
                                                </td>
                                                <td style={{ paddingBottom: '8px', textAlign: 'center' }}>
                                                    {!isViewOnly && (
                                                        <button className="btn btn-sm" style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }} onClick={() => setAllotments(allotments.filter((_, idx) => idx !== i))}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {!isViewOnly && (
                                <button className="btn" style={{ position: 'absolute', bottom: '-15px', right: '1.5rem', width: '32px', height: '32px', borderRadius: '50%', background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }} onClick={() => setAllotments([...allotments, { id: Date.now(), sku: '', name: '', start_date: '', end_date: '', day_type: 'Ngày thường', allotment_count: 0, cut_off_days: 0, net_price: 0, sell_price: 0 }])}>
                                    <Plus size={18} />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* FOOTER SAVE */}
                <div style={{ background: 'white', padding: '1rem 2rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexShrink: 0 }}>
                    <button className="btn btn-secondary" onClick={onClose} style={{ padding: '0.6rem 1.5rem', background: '#ef4444', color: 'white', border: 'none' }}>Đóng</button>
                    {!isViewOnly && (
                        <button className="btn btn-primary" onClick={handleSaveGlobal} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1.5rem', background: '#3b82f6', color: 'white', border: 'none' }}>
                            <Save size={18} /> Lưu Toàn Bộ
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}

const tabStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#3b82f6' : '#64748b',
    borderBottom: isActive ? '3px solid #3b82f6' : '3px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s'
});
