import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import { X, User, Briefcase, Calendar, Mail, Phone, Target, TrendingUp, DollarSign, Award, MapPin } from 'lucide-react';

const EmployeeProfileModal = ({ isOpen, onClose, userId, period, year, month, quarter }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen && userId) {
            fetchProfile();
        }
    }, [isOpen, userId, period, year, month, quarter]);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/dashboard/employee-profile/${userId}?period=${period}&year=${year}&month=${month}&quarter=${quarter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(res.data);
        } catch (err) {
            console.error('Error fetching employee profile:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Calculate working duration
    const calculateDuration = (createdAt) => {
        if (!createdAt) return 'Chưa xác định';
        const start = new Date(createdAt);
        const now = new Date();
        const diffMonths = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
        if (diffMonths < 12) {
            return `${diffMonths} tháng`;
        }
        const years = Math.floor(diffMonths / 12);
        const remainingMonths = diffMonths % 12;
        return `${years} năm ${remainingMonths > 0 ? remainingMonths + ' tháng' : ''}`;
    };

    return ReactDOM.createPortal(
        <div className="drawer-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', zIndex: 9999 }} onClick={onClose}>
            <div className="drawer-content animate-slide-left" style={{ background: '#ffffff', width: 'calc(100vw - var(--sidebar-width, 260px))', height: '100%', overflowY: 'auto', boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.1)', position: 'relative', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
                
                {/* Close Button */}
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.8)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, color: '#64748b', transition: 'all 0.2s', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }} onMouseOver={e => e.currentTarget.style.color = '#0f172a'}>
                    <X size={20} />
                </button>

                {loading ? (
                    <div style={{ padding: '100px 0', textAlign: 'center', color: '#64748b' }}>Đang tải dữ liệu nhân sự...</div>
                ) : !profile ? (
                    <div style={{ padding: '100px 0', textAlign: 'center', color: '#ef4444' }}>Không tìm thấy thông tin nhân sự.</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'row', minHeight: '400px' }}>
                        
                        {/* Left Side: Profile Info (Glassmorphism) */}
                        <div style={{ flex: '0 0 400px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #e2e8f0' }}>
                            <div style={{ flexShrink: 0, width: '140px', height: '140px', borderRadius: '50%', background: '#e2e8f0', marginBottom: '24px', overflow: 'hidden', border: '4px solid #ffffff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                                {profile.user.avatar_url ? (
                                    <img src={profile.user.avatar_url} alt={profile.user.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#3b82f6', color: '#fff', fontSize: '3rem', fontWeight: 'bold' }}>
                                        {profile.user.full_name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center' }}>
                                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0', textAlign: 'center' }}>{profile.user.full_name}</h2>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#dbeafe', color: '#1d4ed8', padding: '6px 16px', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '32px' }}>
                                    <Briefcase size={14} /> {profile.user.position || 'Nhân viên'}
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '0.9rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Calendar size={16} /></div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Thâm niên</span>
                                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{calculateDuration(profile.user.created_at)}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '0.9rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Mail size={16} /></div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
                                            <span style={{ fontWeight: 500, color: '#1e293b', wordBreak: 'break-all' }}>{profile.user.email || 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#475569', fontSize: '0.9rem' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Phone size={16} /></div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>SĐT</span>
                                            <span style={{ fontWeight: 500, color: '#1e293b' }}>{profile.user.phone || 'Chưa cập nhật'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side: Performance Metrics */}
                        <div style={{ flex: '1 1 auto', padding: '40px', background: '#ffffff', minWidth: 0 }}>
                            <div style={{ marginBottom: '32px' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>Hiệu Suất Kinh Doanh</h3>
                                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                                    Số liệu ghi nhận trong {period === 'month' ? `Tháng ${month}/${year}` : period === 'quarter' ? `Quý ${quarter}/${year}` : `Năm ${year}`}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                                
                                {/* Metric 1: Lịch khởi hành phụ trách */}
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <div style={{ background: '#fce7f3', color: '#db2777', padding: '8px', borderRadius: '8px' }}><MapPin size={18} /></div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Đoàn Đang Điều Hành</div>
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>{profile.performance.toursOperatingCount} <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 'normal'}}>đoàn</span></div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Tour đang phụ trách trong {period === 'month' ? `Tháng ${month}` : period === 'quarter' ? `Quý ${quarter}` : `Năm ${year}`}</div>
                                </div>

                                {/* Metric 2: Số đơn hàng */}
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <div style={{ background: '#dbeafe', color: '#2563eb', padding: '8px', borderRadius: '8px' }}><Award size={18} /></div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Đơn Hàng (Đã Chốt)</div>
                                    </div>
                                    <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#0f172a' }}>{profile.performance.bookingsCount} <span style={{fontSize: '1rem', color: '#64748b', fontWeight: 'normal'}}>đơn</span></div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Tổng cộng {profile.performance.totalPax} khách</div>
                                </div>

                                {/* Metric 3: Doanh thu mang về */}
                                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px', gridColumn: 'span 2', transition: 'transform 0.2s', cursor: 'default' }} onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseOut={e=>e.currentTarget.style.transform='none'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                                        <div style={{ background: '#dcfce3', color: '#16a34a', padding: '8px', borderRadius: '8px' }}><DollarSign size={18} /></div>
                                        <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>Doanh Thu Mang Về (Giá Trị Đơn Hàng)</div>
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>{profile.performance.revenue.toLocaleString('vi-VN')} đ</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <TrendingUp size={14} color="#3b82f6" /> Đã thu thực tế: <strong style={{color: '#3b82f6'}}>{profile.performance.collectedRevenue.toLocaleString('vi-VN')} đ</strong>
                                    </div>
                                </div>

                            </div>

                            {/* Tours List Table */}
                            {profile.toursList && profile.toursList.length > 0 && (
                                <div style={{ marginTop: '32px' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>Danh sách Lịch khởi hành phụ trách</h4>
                                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                            <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                                                <tr>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Mã Tour</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Tên Tour</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Khởi hành</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Bán/Tổng</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Doanh thu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profile.toursList.map((tour, idx) => {
                                                    const dateObj = new Date(tour.start_date);
                                                    const dateStr = !isNaN(dateObj) ? `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}` : tour.start_date;
                                                    return (
                                                    <tr key={idx} style={{ borderBottom: idx !== profile.toursList.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                                        <td style={{ padding: '12px 16px', color: '#2563eb', fontWeight: 500 }}>{tour.code}</td>
                                                        <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={tour.template_name}>{tour.template_name || '-'}</td>
                                                        <td style={{ padding: '12px 16px', color: '#475569' }}>{dateStr}</td>
                                                        <td style={{ padding: '12px 16px', color: '#475569' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{ height: '6px', width: '40px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                                    <div style={{ height: '100%', width: `${Math.min(100, (tour.sold / (tour.max_participants || 1)) * 100)}%`, background: tour.sold >= tour.max_participants ? '#10b981' : tour.sold > 0 ? '#3b82f6' : '#94a3b8' }}></div>
                                                                </div>
                                                                <span style={{ color: tour.sold >= tour.max_participants ? '#10b981' : tour.sold > 0 ? '#3b82f6' : '#94a3b8', fontWeight: 600 }}>{tour.sold}</span>/{tour.max_participants}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500 }}>{parseFloat(tour.revenue || 0).toLocaleString('vi-VN')}đ</td>
                                                    </tr>
                                                )})}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Bookings List Table */}
                            {profile.bookingsList && profile.bookingsList.length > 0 && (
                                <div style={{ marginTop: '32px' }}>
                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '16px' }}>Danh sách Đơn hàng (Giữ chỗ) đã chốt</h4>
                                    <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                                            <thead style={{ background: '#f8fafc', color: '#64748b' }}>
                                                <tr>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Ngày chốt</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Khách hàng</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Tour (Mã)</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Số khách</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Giá trị Đơn</th>
                                                    <th style={{ padding: '12px 16px', fontWeight: 600, borderBottom: '1px solid #e2e8f0' }}>Đã thu</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {profile.bookingsList.map((booking, idx) => {
                                                    const dateObj = new Date(booking.created_at);
                                                    const dateStr = !isNaN(dateObj) ? `${dateObj.getDate()}/${dateObj.getMonth()+1}/${dateObj.getFullYear()}` : booking.created_at;
                                                    return (
                                                    <tr key={idx} style={{ borderBottom: idx !== profile.bookingsList.length - 1 ? '1px solid #f1f5f9' : 'none', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f8fafc'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                                        <td style={{ padding: '12px 16px', color: '#475569' }}>{dateStr}</td>
                                                        <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500 }}>{booking.customer_name || 'Khách vãng lai'}</td>
                                                        <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={booking.tour_name}>
                                                            <div style={{ color: '#2563eb', fontWeight: 500, fontSize: '0.8rem' }}>{booking.tour_code}</div>
                                                            <div style={{ fontSize: '0.75rem' }}>{booking.tour_name || '-'}</div>
                                                        </td>
                                                        <td style={{ padding: '12px 16px', color: '#0f172a', fontWeight: 500 }}>{booking.pax_count} <span style={{fontSize:'0.75rem', color:'#64748b'}}>khách</span></td>
                                                        <td style={{ padding: '12px 16px', color: '#16a34a', fontWeight: 500 }}>{parseFloat(booking.total_price || 0).toLocaleString('vi-VN')}đ</td>
                                                        <td style={{ padding: '12px 16px', color: '#3b82f6', fontWeight: 500 }}>{parseFloat(booking.paid || 0).toLocaleString('vi-VN')}đ</td>
                                                    </tr>
                                                )})}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                )}
            </div>
        </div>,
        document.body
    );
};

export default EmployeeProfileModal;
