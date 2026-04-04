import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MapPin, Star, Building, CheckCircle, XCircle } from 'lucide-react';
import HotelDetailDrawer from '../components/modals/HotelDetailDrawer';

export default function HotelsTab({ currentUser }) {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Filters
    const [provinceFilter, setProvinceFilter] = useState('');
    const [starFilter, setStarFilter] = useState('');

    useEffect(() => {
        fetchHotels();
    }, [search, provinceFilter, starFilter]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/hotels', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search,
                    province: provinceFilter,
                    star_rate: starFilter
                }
            });
            setHotels(res.data);
        } catch (err) {
            console.error('Error fetching hotels', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenHotel = async (hotelId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/hotels/${hotelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedHotel(res.data);
            setIsDrawerOpen(true);
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết khách sạn', err);
            alert('Lỗi thao tác');
        }
    };

    const handleAddHotel = () => {
        setSelectedHotel(null); // Tự động tạo mới
        setIsDrawerOpen(true);
    };

    return (
        <div style={{ padding: '0 2rem' }}>
            {/* Thanh công cụ */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: 'min-content' }}>
                    <div className="search-bar" style={{ flex: 1, maxWidth: '350px' }}>
                        <Search size={18} />
                        <input
                            type="text"
                            placeholder="Tìm mã, tên khách sạn..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <select 
                        className="form-select" 
                        style={{ width: '180px' }}
                        value={provinceFilter}
                        onChange={(e) => setProvinceFilter(e.target.value)}
                    >
                        <option value="">Tất cả Tỉnh/Thành</option>
                        <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                        <option value="Hà Nội">Hà Nội</option>
                        <option value="Đà Nẵng">Đà Nẵng</option>
                        <option value="Phuket">Phuket (Thái Lan)</option>
                        <option value="Bangkok">Bangkok (Thái Lan)</option>
                        <option value="Bali">Bali (Indonesia)</option>
                        <option value="Seoul">Seoul (Hàn Quốc)</option>
                        <option value="Tokyo">Tokyo (Nhật Bản)</option>
                        <option value="Đài Bắc">Đài Bắc (Đài Loan)</option>
                        <option value="Dubai">Dubai (UAE)</option>
                        {/* More can be added */}
                    </select>

                    <select 
                        className="form-select" 
                        style={{ width: '150px' }}
                        value={starFilter}
                        onChange={(e) => setStarFilter(e.target.value)}
                    >
                        <option value="">Mọi hạng sao</option>
                        <option value="5_star">5 Sao</option>
                        <option value="4_star">4 Sao</option>
                        <option value="3_star">3 Sao</option>
                        <option value="resort">Resort / Villa</option>
                        <option value="other">Khác</option>
                    </select>
                </div>
                
                {(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'operations') && (
                    <button className="btn btn-primary" onClick={handleAddHotel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Thêm Khách Sạn
                    </button>
                )}
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>MÃ NCC</th>
                            <th>TÊN KHÁCH SẠN</th>
                            <th>HẠNG SAO</th>
                            <th>KHU VỰC</th>
                            <th>PHONE / EMAIL</th>
                            <th>THỊ TRƯỜNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : hotels.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                                    Không có khách sạn nào khớp với tìm kiếm.
                                </td>
                            </tr>
                        ) : (
                            hotels.map(h => (
                                <tr key={h.id} style={{ cursor: 'pointer' }} onClick={() => handleOpenHotel(h.id)}>
                                    <td style={{ fontWeight: 600, color: '#3b82f6' }}>{h.code}</td>
                                    <td style={{ fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Building size={16} color="#64748b" />
                                            {h.name}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <Star size={14} fill="#f59e0b" />
                                            {h.star_rate === '5_star' ? '5 Sao' : 
                                             h.star_rate === '4_star' ? '4 Sao' : 
                                             h.star_rate === '3_star' ? '3 Sao' : 
                                             h.star_rate === 'resort' ? 'Resort' : 'Khác'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                            <MapPin size={14} color="#64748b" />
                                            {h.province || '-'}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div>{h.phone || '-'}</div>
                                            <div style={{ color: '#64748b' }}>{h.email || '-'}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>
                                            {h.market || 'Chưa phân loại'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Khung Drawer chi tiết Khách Sạn */}
            {isDrawerOpen && (
                <HotelDetailDrawer 
                    hotel={selectedHotel} 
                    onClose={() => setIsDrawerOpen(false)} 
                    refreshList={fetchHotels}
                    currentUser={currentUser}
                />
            )}
        </div>
    );
}
