import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, Plus, Trash2, Building, Phone, MapPin, Globe, CreditCard } from 'lucide-react';

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
    const [roomTypes, setRoomTypes] = useState([]);
    const [contracts, setContracts] = useState([]);
    const [allotments, setAllotments] = useState([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (hotel) {
            setFormData({
                code: hotel.code || '', name: hotel.name || '', tax_id: hotel.tax_id || '',
                build_year: hotel.build_year || '', phone: hotel.phone || '', email: hotel.email || '',
                country: hotel.country || '', province: hotel.province || '', address: hotel.address || '',
                notes: hotel.notes || '', star_rate: hotel.star_rate || '', website: hotel.website || '',
                hotel_class: hotel.hotel_class || '', project_name: hotel.project_name || '',
                market: hotel.market || '', bank_account_name: hotel.bank_account_name || '',
                bank_account_number: hotel.bank_account_number || '', bank_name: hotel.bank_name || ''
            });
            setContacts(hotel.contacts || []);
            setRoomTypes(hotel.room_types || []);
            setContracts(hotel.contracts || []);
            setAllotments(hotel.allotments || []);
        }
    }, [hotel]);

    const handleSaveGeneral = async () => {
        try {
            if (!formData.name) return alert('Tên Khách sạn là bắt buộc!');
            setLoading(true);
            const token = localStorage.getItem('token');
            if (hotel?.id) {
                await axios.put(`/api/hotels/${hotel.id}`, formData, { headers: { Authorization: `Bearer ${token}` } });
                alert('Cập nhật thông tin thành công!');
            } else {
                await axios.post('/api/hotels', formData, { headers: { Authorization: `Bearer ${token}` } });
                alert('Tạo Khách sạn thành công! Có thể tiếp tục thêm Báo giá.');
                // In full implementation, we should reload the exact hotel ID, but here let's just close and refresh
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

    return (
        <div className="drawer-overlay" style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(0,0,0,0.5)', zIndex: 10000, display: 'flex', justifyContent: 'flex-end'
        }}>
            <div className="drawer-content" style={{
                width: '1000px', maxWidth: '100%', background: '#f8fafc', height: '100%',
                display: 'flex', flexDirection: 'column',
                boxShadow: '-5px 0 25px rgba(0,0,0,0.1)', animation: 'slideInRight 0.3s ease'
            }}>
                {/* HEAD */}
                <div style={{ padding: '1.5rem 2rem', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                {hotel && (
                    <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #e2e8f0', padding: '0 2rem' }}>
                        <div className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')} style={tabStyle(activeTab === 'general')}>
                            Hồ sơ gốc & Liên hệ
                        </div>
                        <div className={`tab-btn ${activeTab === 'rates' ? 'active' : ''}`} onClick={() => setActiveTab('rates')} style={tabStyle(activeTab === 'rates')}>
                            Hợp đồng & Báo giá
                        </div>
                        <div className={`tab-btn ${activeTab === 'allotment' ? 'active' : ''}`} onClick={() => setActiveTab('allotment')} style={tabStyle(activeTab === 'allotment')}>
                            Quỹ phòng định mức
                        </div>
                    </div>
                )}

                {/* BODY */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    {activeTab === 'general' && (
                        <div>
                            <div className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
                                <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                                            
                                            <optgroup label="Việt Nam">
                                                <option value="Việt Nam (MICE)">Việt Nam (MICE)</option>
                                            </optgroup>
                                            
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
                                    <div className="form-group">
                                        <label>Website</label>
                                        <input type="text" className="form-control" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} disabled={isViewOnly} />
                                    </div>
                                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                                        <label>Ghi chú KS</label>
                                        <textarea className="form-control" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} disabled={isViewOnly} rows={3} />
                                    </div>
                                </div>
                            </div>

                            {!isViewOnly && (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                    <button className="btn btn-secondary" onClick={onClose}>Hủy Bỏ</button>
                                    <button className="btn btn-primary" onClick={handleSaveGeneral} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Save size={16} /> Lưu Thông Tin
                                    </button>
                                </div>
                            )}

                        </div>
                    )}

                    {activeTab === 'rates' && (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '4rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📈</div>
                            {isViewOnly ? (
                                <p>Bạn không có quyền thêm sửa hợp đồng.</p>
                            ) : (
                                <div>
                                    <p>Module Quản lý báo giá chuyên sâu đang được nhà phát triển kích hoạt...</p>
                                    <button className="btn btn-primary btn-sm"><Plus size={14}/> Thêm Hợp Đồng / Bảng Giá</button>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'allotment' && (
                        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '4rem' }}>
                            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🏨</div>
                            <p>Tính năng xem ma trận quỹ phòng sẽ sớm ra mắt.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

const tabStyle = (isActive) => ({
    padding: '1rem 1.5rem',
    fontWeight: isActive ? 600 : 500,
    color: isActive ? '#3b82f6' : '#64748b',
    borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s'
});
