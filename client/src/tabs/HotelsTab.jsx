import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, MapPin, Star, Building, CheckCircle, XCircle, Eye, Edit2, Trash2, AlertTriangle , ExternalLink } from 'lucide-react';
import Select from 'react-select';
import HotelDetailDrawer from '../components/modals/HotelDetailDrawer';
import { useMarkets } from '../hooks/useMarkets';

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

export default function HotelsTab({ currentUser, addToast, handleDeleteHotel }) {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Filters
    const marketOptions = useMarkets();
    const [marketFilter, setMarketFilter] = useState('');
    const [starFilter, setStarFilter] = useState('');

    useEffect(() => {
        setCurrentPage(1); // Reset page on filter change
    }, [search, marketFilter, starFilter]);

    useEffect(() => {
        fetchHotels();
    }, [currentPage, search, marketFilter, starFilter]);

    // Lắng nghe sự kiện để reload list sau khi App.jsx xóa xong
    useEffect(() => {
        const handleReload = () => fetchHotels();
        window.addEventListener('reloadHotels', handleReload);
        return () => window.removeEventListener('reloadHotels', handleReload);
    }, [search, marketFilter, starFilter]);

    const fetchHotels = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get('/api/hotels', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    search,
                    market: marketFilter,
                    star_rate: starFilter,
                    page: currentPage,
                    limit: 30
                }
            });
            if (res.data && res.data.data !== undefined) {
                setHotels(res.data.data);
                setTotalPages(res.data.totalPages || 1);
                setTotalItems(res.data.total || 0);
            } else {
                setHotels(res.data);
                setTotalPages(1);
            }
        } catch (err) {
            console.error('Error fetching hotels', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenHotel = async (hotelId) => {
        try {
            setActionLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/hotels/${hotelId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSelectedHotel(res.data);
            setIsDrawerOpen(true);
        } catch (err) {
            console.error('Lỗi khi lấy chi tiết khách sạn', err);
            if (addToast) addToast('Lỗi lấy thông tin khách sạn: ' + (err.response?.data?.message || err.message), 'error');
            else alert('Lỗi thao tác');
        } finally {
            setActionLoading(false);
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

                <div className="filter-group" style={{ flex: '0 0 240px', margin: 0 }}>
                    <label style={{ marginBottom: '8px', display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>THỊ TRƯỜNG INBOUND/MICE</label>
                    <Select
                        options={marketOptions}
                        value={marketFilter ? { label: marketFilter, value: marketFilter } : null}
                        onChange={option => setMarketFilter(option ? option.value : '')}
                        styles={reactSelectStyles}
                        isClearable
                        placeholder="🔍 Chọn thị trường..."
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
                            <th style={{ padding: '16px 20px', textAlign: 'center', width: '100px' }}>DRIVE</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '180px' }}>PHONE / EMAIL</th>
                            <th style={{ padding: '16px 20px', textAlign: 'left', width: '150px' }}>THỊ TRƯỜNG</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', width: '120px' }}>ĐÁNH GIÁ</th>
                            <th style={{ padding: '16px 20px', textAlign: 'center', width: '140px' }}>THAO TÁC</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tải dữ liệu...</td>
                            </tr>
                        ) : hotels.length === 0 ? (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                    Không có khách sạn nào khớp với tìm kiếm.
                                </td>
                            </tr>
                        ) : (
                            hotels.map(h => (
                                <tr key={h.id} className="table-row-hover" style={{ transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='white'}>
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
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        {h.drive_link ? (
                                            <a href={h.drive_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 12px', background: '#2563eb', color: 'white', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#1d4ed8'} onMouseOut={e=>e.currentTarget.style.background='#2563eb'}>
                                                <ExternalLink size={13} /> Mở
                                            </a>
                                        ) : (
                                            <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>—</span>
                                        )}
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
                                    
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        {Number(h.rating) > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: '#f59e0b', fontWeight: 600 }}>
                                                {Number(h.rating).toFixed(1)} <Star size={16} fill="#f59e0b" />
                                            </div>
                                        ) : (
                                            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                            <button className="btn-icon" title="Xem / Sửa" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#3b82f6', padding: '4px' }} onClick={() => handleOpenHotel(h.id)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn-icon" title="Xoá" style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }} onClick={() => handleDeleteHotel(h.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', background: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Hiển thị trang <span style={{ fontWeight: 600, color: '#1e293b' }}>{currentPage}</span> trên <span style={{ fontWeight: 600, color: '#1e293b' }}>{totalPages}</span> (Tổng {totalItems} NCC)
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', color: currentPage === 1 ? '#94a3b8' : '#334155', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
                        >
                            Trang trước
                        </button>
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', color: currentPage === totalPages ? '#94a3b8' : '#334155', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            )}

            {/* Khung Drawer chi tiết Khách Sạn */}
            {isDrawerOpen && (
                <HotelDetailDrawer 
                    hotel={selectedHotel} 
                    onClose={() => setIsDrawerOpen(false)} 
                    refreshList={fetchHotels}
                    currentUser={currentUser}
                    addToast={addToast}
                />
            )}
        </div>
    );
}
