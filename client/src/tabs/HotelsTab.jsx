import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MapPin, Star, Building, CheckCircle, XCircle } from 'lucide-react';
import Select from 'react-select';
import HotelDetailDrawer from '../components/modals/HotelDetailDrawer';

const PROVINCE_OPTIONS = [
    { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
    { value: 'Hà Nội', label: 'Hà Nội' },
    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
    { value: 'Phuket', label: 'Phuket (Thái Lan)' },
    { value: 'Bangkok', label: 'Bangkok (Thái Lan)' },
    { value: 'Bali', label: 'Bali (Indonesia)' },
    { value: 'Seoul', label: 'Seoul (Hàn Quốc)' },
    { value: 'Tokyo', label: 'Tokyo (Nhật Bản)' },
    { value: 'Đài Bắc', label: 'Đài Bắc (Đài Loan)' },
    { value: 'Dubai', label: 'Dubai (UAE)' }
];

const STAR_OPTIONS = [
    { value: '5_star', label: '5 Sao' },
    { value: '4_star', label: '4 Sao' },
    { value: '3_star', label: '3 Sao' },
    { value: 'resort', label: 'Resort / Villa' },
    { value: 'other', label: 'Khác' }
];

const reactSelectStyles = {
    control: (base) => ({
        ...base,
        height: '44px',
        minHeight: '44px',
        borderRadius: '8px',
        borderColor: '#cbd5e1',
        boxShadow: 'none',
        '&:hover': { borderColor: '#94a3b8' }
    }),
        valueContainer: (base) => ({
            ...base,
            padding: '0 12px',
            height: '42px',
            display: 'flex',
            alignItems: 'center'
        }),
        input: (base) => ({
            ...base,
            margin: 0,
            padding: 0
        })
    };

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
                    <Select
                        options={PROVINCE_OPTIONS}
                        value={PROVINCE_OPTIONS.find(o => o.value === provinceFilter) || null}
                        onChange={option => setProvinceFilter(option ? option.value : '')}
                        styles={reactSelectStyles}
                        isClearable
                        placeholder="Tất cả Tỉnh/Thành"
                    />
                </div>

                <div className="filter-group" style={{ flex: '0 0 160px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>HẠNG DỊCH VỤ</label>
                    <Select
                        options={STAR_OPTIONS}
                        value={STAR_OPTIONS.find(o => o.value === starFilter) || null}
                        onChange={option => setStarFilter(option ? option.value : '')}
                        styles={reactSelectStyles}
                        isClearable
                        placeholder="Mọi hạng sao"
                    />
                </div>
                
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end', height: '100%', paddingTop: '1.4rem' }}>
                    {(currentUser?.role === 'admin' || currentUser?.role === 'manager' || currentUser?.role === 'operations') && (
                        <button className="btn btn-primary" onClick={handleAddHotel} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '44px', padding: '0 1.5rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600, background: '#2563eb', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)', cursor: 'pointer' }}>
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
