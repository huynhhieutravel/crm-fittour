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
            <div className="filter-bar" style={{ 
                display: 'flex', 
                flexDirection: 'row',
                flexWrap: 'wrap', 
                gap: '1rem', 
                alignItems: 'center', 
                backgroundColor: 'white',
                padding: '1.25rem',
                borderRadius: '1rem',
                boxShadow: 'var(--shadow)',
                marginBottom: '2rem'
            }}>
                <div className="filter-group" style={{ flex: '1 1 300px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>TÌM KIẾM NHÀ CUNG CẤP</label>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            className="filter-input"
                            style={{ width: '100%', paddingLeft: '40px', height: '44px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                            type="text"
                            placeholder="Mã, Tên khách sạn..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-group" style={{ flex: '0 0 200px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>TỈNH THÀNH / KHU VỰC</label>
                    <select 
                        className="filter-input" 
                        style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', outline: 'none' }}
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
                    </select>
                </div>

                <div className="filter-group" style={{ flex: '0 0 160px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>HẠNG DỊCH VỤ</label>
                    <select 
                        className="filter-input" 
                        style={{ width: '100%', height: '44px', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '0 12px', outline: 'none' }}
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
                
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '1.4rem' }}>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'operations') && (
                        <button className="btn btn-primary" onClick={handleAddHotel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '44px', padding: '0 1.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                            <Plus size={18} /> Thêm Mới
                        </button>
                    )}
                </div>
            </div>

            {/* Bảng Dữ Liệu */}
            <div className="table-responsive" style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                        <tr style={{ color: '#475569', fontSize: '0.8rem' }}>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '120px' }}>MÃ NCC</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left' }}>TÊN KHÁCH SẠN</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '140px' }}>HẠNG SAO</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '180px' }}>KHU VỰC</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '180px' }}>PHONE / EMAIL</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '150px' }}>THỊ TRƯỜNG</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : hotels.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Không có khách sạn nào khớp với tìm kiếm.
                                </td>
                            </tr>
                        ) : (
                            hotels.map(h => (
                                <tr key={h.id} className="table-row-hover" style={{ cursor: 'pointer', transition: 'background 0.2s' }} onClick={() => handleOpenHotel(h.id)} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='white'}>
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, color: '#3b82f6' }}>{h.code}</td>
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' }}>
                                            <Building size={16} color="#475569" />
                                            {h.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
                                            <Star size={14} fill="#f59e0b" />
                                            {h.star_rate === '5_star' ? '5 Sao' : 
                                             h.star_rate === '4_star' ? '4 Sao' : 
                                             h.star_rate === '3_star' ? '3 Sao' : 
                                             h.star_rate === 'resort' ? 'Resort' : 'Khác'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#475569' }}>
                                            <MapPin size={14} color="#94a3b8" />
                                            {h.province || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div style={{ fontSize: '0.85rem' }}>
                                            <div style={{ fontWeight: 500, color: '#1e293b' }}>{h.phone || '-'}</div>
                                            <div style={{ color: '#64748b' }}>{h.email || '-'}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
                                        <span className="badge" style={{ background: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
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
