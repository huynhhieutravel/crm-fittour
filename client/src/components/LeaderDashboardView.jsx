import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ResponsiveContainer, Funnel, FunnelChart, Tooltip, Legend,
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import { 
  TrendingUp, Activity, DollarSign, Users, Shield, AlertTriangle, ExternalLink
} from 'lucide-react';
import OpTourBookingListModal from './modals/OpTourBookingListModal';
import EmployeeProfileModal from './modals/EmployeeProfileModal';

const LeaderDashboardView = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const [year, setYear] = useState(String(currentYear));
    const [month, setMonth] = useState(String(currentMonth));
    const [quarter, setQuarter] = useState(String(Math.floor((currentMonth + 2) / 3)));
    const [period, setPeriod] = useState('month');
    const [activeTab, setActiveTab] = useState('BU1'); // Default to BU1
    const [activeSalesTab, setActiveSalesTab] = useState('BU1');
    const [activeScheduleTab, setActiveScheduleTab] = useState('BU1');
    const [mainTab, setMainTab] = useState('so-lieu'); // 'so-lieu' or 'nhan-su'
    const [isBookingListOpen, setIsBookingListOpen] = useState(false);
    const [selectedTourForModal, setSelectedTourForModal] = useState(null);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchData();
    }, [year, month, quarter, period]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`/api/dashboard/leader-overview?period=${period}&year=${year}&month=${month}&quarter=${quarter}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
            if (res.data.tourPerformance && res.data.tourPerformance.length > 0) {
                // If the default active tab doesn't exist, pick the first one
                if (!res.data.tourPerformance.find(b => b.bu_name === activeTab)) {
                    setActiveTab(res.data.tourPerformance[0].bu_name);
                }
                if (!res.data.tourPerformance.find(b => b.bu_name === activeSalesTab)) {
                    setActiveSalesTab(res.data.tourPerformance[0].bu_name);
                }
                if (res.data.workSchedules && res.data.workSchedules.length > 0 && !res.data.workSchedules.find(b => b.bu_name === activeScheduleTab)) {
                    setActiveScheduleTab(res.data.workSchedules[0].bu_name);
                }
            }
        } catch (err) {
            console.error('Error fetching leader data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Đang tải báo cáo Management...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Lỗi tải dữ liệu.</div>;

    const { topMetrics, funnel, tourPerformance, alerts, workSchedules } = data;
    
    // Funnel colors
    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981'];

    // Find active BU data
    const activeBUData = tourPerformance.find(b => b.bu_name === activeTab) || { total_revenue: 0, total_pax: 0, sold_pax: 0, tours: [] };
    const activeSalesBUData = tourPerformance.find(b => b.bu_name === activeSalesTab) || { sales: [] };
    const activeScheduleBUData = (workSchedules || []).find(b => b.bu_name === activeScheduleTab) || { users: [] };
    
    // Generate dates for the calendar based on selected period
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const calendarDays = period === 'month' ? Array.from({length: daysInMonth}, (_, i) => {
        const d = i + 1;
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, d);
        const dayOfWeek = dateObj.toLocaleDateString('vi-VN', { weekday: 'short' }).replace(/T|Th/g, 'T');
        return { dateStr, day: d, dayOfWeek, isWeekend: dateObj.getDay() === 0 || dateObj.getDay() === 6 };
    }) : [];
    
    const emptyPax = activeBUData.total_pax - activeBUData.sold_pax;
    const occupancyData = [
        { name: 'Chỗ đã bán', value: activeBUData.sold_pax },
        { name: 'Chỗ trống', value: emptyPax > 0 ? emptyPax : 0 }
    ];

    return (
        <div className="management-dashboard animate-slide-up" style={{ padding: '0 0px 24px 0px' }}>
            {/* Executive Single-Row Filter Bar */}
            <div className="executive-filter-panel mb-8" style={{ display: 'flex', gap: '16px', alignItems: 'center', background: 'rgba(255,255,255,0.8)', padding: '16px 24px', borderRadius: '20px', border: '1px solid #e2e8f0', backdropFilter: 'blur(10px)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '32px' }}>
                <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
                    <button onClick={() => setPeriod('month')} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: period === 'month' ? '#ffffff' : 'transparent', color: period === 'month' ? '#1e293b' : '#64748b', fontWeight: 600, boxShadow: period === 'month' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Tháng</button>
                    <button onClick={() => setPeriod('quarter')} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: period === 'quarter' ? '#ffffff' : 'transparent', color: period === 'quarter' ? '#1e293b' : '#64748b', fontWeight: 600, boxShadow: period === 'quarter' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Quý</button>
                    <button onClick={() => setPeriod('year')} style={{ padding: '8px 24px', borderRadius: '8px', border: 'none', background: period === 'year' ? '#ffffff' : 'transparent', color: period === 'year' ? '#1e293b' : '#64748b', fontWeight: 600, boxShadow: period === 'year' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>Năm</button>
                </div>

                <div style={{ width: '1px', height: '24px', background: '#cbd5e1', margin: '0 8px' }}></div>

                {period === 'month' && (
                    <select value={month} onChange={e => setMonth(e.target.value)} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', fontWeight: 500, outline: 'none', cursor: 'pointer', minWidth: '120px' }}>
                        {Array.from({length: 12}, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                    </select>
                )}

                {period === 'quarter' && (
                    <select value={quarter} onChange={e => setQuarter(e.target.value)} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', fontWeight: 500, outline: 'none', cursor: 'pointer', minWidth: '120px' }}>
                        {[1, 2, 3, 4].map(q => <option key={q} value={q}>Quý {q}</option>)}
                    </select>
                )}

                <select value={year} onChange={e => setYear(e.target.value)} style={{ padding: '10px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#1e293b', fontWeight: 500, outline: 'none', cursor: 'pointer', minWidth: '120px' }}>
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                </select>
            </div>

            {/* Main Dashboard Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' }}>
                <button 
                    onClick={() => setMainTab('so-lieu')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: 'transparent',
                        color: mainTab === 'so-lieu' ? '#0f172a' : '#64748b',
                        fontWeight: mainTab === 'so-lieu' ? 'bold' : '600',
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'so-lieu' ? '3px solid #3b82f6' : '3px solid transparent',
                        transform: 'translateY(2px)',
                        transition: 'all 0.2s'
                    }}
                >
                    📈 Báo Cáo Số Liệu
                </button>
                <button 
                    onClick={() => setMainTab('nhan-su')}
                    style={{
                        padding: '12px 24px',
                        border: 'none',
                        background: 'transparent',
                        color: mainTab === 'nhan-su' ? '#0f172a' : '#64748b',
                        fontWeight: mainTab === 'nhan-su' ? 'bold' : '600',
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        borderBottom: mainTab === 'nhan-su' ? '3px solid #10b981' : '3px solid transparent',
                        transform: 'translateY(2px)',
                        transition: 'all 0.2s'
                    }}
                >
                    👥 Quản Lý Nhân Sự
                </button>
            </div>

            {mainTab === 'so-lieu' && (
                <>
            {/* Khối 1: Bức Tranh Tài Chính & Hiệu Quả */}
            <div className="grid-cards-4 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                <div className="glass" style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderLeft: '4px solid #3b82f6', padding: '24px', borderRadius: '16px', gap: '8px', boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.1), 0 8px 10px -6px rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59,130,246,0.1)' }}>
                    <div className="stat-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="stat-icon-wrapper" style={{background: '#dbeafe', color: '#2563eb', padding: '10px', borderRadius: '10px'}}><DollarSign size={20} /></div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Doanh Số Sales</h3>
                    </div>
                    <div className="stat-value" style={{ fontSize: 'clamp(1rem, 1.2vw + 0.5rem, 1.35rem)', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '-0.5px', lineHeight: '1.2', marginTop: '4px' }}>{topMetrics.totalBookingValue.toLocaleString('vi-VN')}đ</div>
                    <div className="stat-trend text-blue-600" style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 500 }}>Tổng giá trị booking mới</div>
                </div>

                <div className="glass" style={{ display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', borderLeft: '4px solid #10b981', padding: '24px', borderRadius: '16px', gap: '8px', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.1), 0 8px 10px -6px rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16,185,129,0.1)' }}>
                    <div className="stat-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="stat-icon-wrapper" style={{background: '#d1fae5', color: '#059669', padding: '10px', borderRadius: '10px'}}><Activity size={20} /></div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Thực Thu (Tiền Mặt)</h3>
                    </div>
                    <div className="stat-value text-emerald-600" style={{ fontSize: 'clamp(1rem, 1.2vw + 0.5rem, 1.35rem)', fontWeight: '800', color: '#059669', whiteSpace: 'nowrap', letterSpacing: '-0.5px', lineHeight: '1.2', marginTop: '4px' }}>{topMetrics.actualRevenue.toLocaleString('vi-VN')}đ</div>
                    <div className="stat-trend text-emerald-600" style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 500 }}>Dòng tiền đã vào TK</div>
                </div>

                <div className="glass" style={{ display: 'flex', flexDirection: 'column', borderLeft: '4px solid #f59e0b', padding: '24px', borderRadius: '16px', background: '#ffffff', gap: '8px', boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.1), 0 8px 10px -6px rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <div className="stat-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="stat-icon-wrapper" style={{background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '10px'}}><Users size={20} /></div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tổng Đoàn & Khách</h3>
                    </div>
                    <div className="stat-value" style={{ fontSize: 'clamp(1rem, 1.2vw + 0.5rem, 1.35rem)', fontWeight: '800', color: '#b45309', whiteSpace: 'nowrap', letterSpacing: '-0.5px', lineHeight: '1.2', marginTop: '4px' }}>{topMetrics.totalTourSoldPax} / {topMetrics.totalTourMaxPax} khách</div>
                    <div className="stat-trend text-amber-600" style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 500 }}>Tổng {topMetrics.totalDepartures} đoàn khởi hành</div>
                </div>

                <div className="glass" style={{ display: 'flex', flexDirection: 'column', borderLeft: '4px solid #f59e0b', padding: '24px', borderRadius: '16px', background: '#ffffff', gap: '8px', boxShadow: '0 10px 25px -5px rgba(245, 158, 11, 0.1), 0 8px 10px -6px rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245,158,11,0.1)' }}>
                    <div className="stat-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="stat-icon-wrapper" style={{background: '#fef3c7', color: '#d97706', padding: '10px', borderRadius: '10px'}}><Users size={20} /></div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#475569', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Chi Phí CPL (Cost/Lead)</h3>
                    </div>
                    <div className="stat-value" style={{ fontSize: 'clamp(1rem, 1.2vw + 0.5rem, 1.35rem)', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap', letterSpacing: '-0.5px', lineHeight: '1.2', marginTop: '4px' }}>{topMetrics.cpl.toLocaleString('vi-VN')}đ</div>
                    <div className="stat-trend text-amber-600" style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 500 }}>Tiền Ads: {topMetrics.totalMarketingSpend.toLocaleString('vi-VN')} đ</div>
                </div>
            </div>

            <div style={{ display: 'block', marginBottom: '40px' }}>
                {/* Khối 3: Phân Tích Tỷ Lệ Tour Theo BU */}
                <div className="card glass" style={{ padding: '32px 24px', borderRadius: '20px', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}><TrendingUp size={22} className="text-emerald-600" /> Phân Tích Tỷ Lệ Tour (Theo BU)</h3>
                    
                    {/* BU Tabs */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
                        {tourPerformance.map(bu => (
                            <button 
                                key={bu.bu_name}
                                onClick={() => setActiveTab(bu.bu_name)}
                                style={{
                                    padding: '8px 20px',
                                    borderRadius: '99px',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    background: activeTab === bu.bu_name ? '#1e293b' : '#f1f5f9',
                                    color: activeTab === bu.bu_name ? '#fff' : '#64748b',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {bu.bu_name} <span style={{ fontSize: '0.85rem', marginLeft: '4px', opacity: 0.8 }}>({bu.tours.length})</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-row-mobile-column" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                        <div className="pie-chart-container" style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                                <PieChart width={200} height={200}>
                                    <Pie
                                        data={occupancyData}
                                        cx={100} cy={100}
                                        innerRadius={65} outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        <Cell fill="#10b981" /> {/* Sold */}
                                        <Cell fill="#e2e8f0" /> {/* Empty */}
                                    </Pie>
                                    <Tooltip formatter={(value) => value.toLocaleString('vi-VN')} />
                                </PieChart>
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>{activeBUData.total_pax > 0 ? Math.round((activeBUData.sold_pax / activeBUData.total_pax) * 100) : 0}%</div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Lấp đầy</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 10, height: 10, background: '#10b981', borderRadius: '4px' }}></div> Bán</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><div style={{ width: 10, height: 10, background: '#e2e8f0', borderRadius: '4px' }}></div> Trống</div>
                            </div>
                        </div>

                        {/* Tour List Drill-down */}
                        <div style={{ flex: 1, maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                            <h4 style={{ fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>
                                Đã Thu: <span style={{ color: '#059669' }}>{activeBUData.total_collected ? activeBUData.total_collected.toLocaleString('vi-VN') : 0}đ</span> / Dự kiến: <span style={{ color: '#475569' }}>{activeBUData.total_revenue.toLocaleString('vi-VN')}đ</span> ({activeBUData.total_revenue > 0 ? Math.round((activeBUData.total_collected / activeBUData.total_revenue) * 100) : 0}%)
                            </h4>
                            <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                                <table style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 10 }}>
                                        <tr>
                                            <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Mã Tour</th>
                                            <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Khởi hành</th>
                                            <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Bán/Tổng</th>
                                            <th style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Doanh thu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {activeBUData.tours.map(t => (
                                            <tr key={t.tour_code} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                                <td style={{ padding: '10px 12px', fontWeight: 500 }}>
                                                    <a href="#" onClick={(e) => { e.preventDefault(); setSelectedTourForModal({ id: t.departure_id, tour_code: t.tour_code, start_date: t.start_date }); setIsBookingListOpen(true); }} style={{ color: '#2563eb', textDecoration: 'none', cursor: 'pointer' }} onMouseOver={e=>e.target.style.textDecoration='underline'} onMouseOut={e=>e.target.style.textDecoration='none'}>
                                                        {t.tour_code}
                                                    </a>
                                                </td>
                                                <td style={{ padding: '10px 12px' }}>{new Date(t.start_date).toLocaleDateString('vi-VN')}</td>
                                                <td style={{ padding: '10px 12px', minWidth: '150px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ flex: 1, background: '#e2e8f0', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', background: t.sold_pax < t.max_pax * 0.5 ? '#ef4444' : '#10b981', width: `${t.max_pax > 0 ? Math.min((t.sold_pax / t.max_pax) * 100, 100) : 0}%`, transition: 'width 0.3s' }}></div>
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', minWidth: '40px' }}>{t.sold_pax}/{t.max_pax}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '10px 12px', fontWeight: 500 }}>{t.revenue.toLocaleString('vi-VN')}đ</td>
                                            </tr>
                                        ))}
                                        {activeBUData.tours.length === 0 && (
                                            <tr>
                                                <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Không có lịch khởi hành trong tháng này</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sales Performance Block */}
            <div className="card glass" style={{ padding: '32px 24px', borderRadius: '20px', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', marginTop: '24px' }}>
                <h3 style={{ fontWeight: 'bold', fontSize: '1.125rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}><Users size={22} className="text-blue-600" /> Phân Tích Tỷ Lệ Sales (Theo BU)</h3>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
                    {tourPerformance.map(bu => (
                        <button 
                            key={`sales-tab-${bu.bu_name}`}
                            onClick={() => setActiveSalesTab(bu.bu_name)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '99px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                background: activeSalesTab === bu.bu_name ? '#1e293b' : '#f1f5f9',
                                color: activeSalesTab === bu.bu_name ? '#fff' : '#64748b',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {bu.bu_name} <span style={{ fontSize: '0.85rem', marginLeft: '4px', opacity: 0.8 }}>({(bu.sales || []).length})</span>
                        </button>
                    ))}
                </div>

                <div className="flex-row-mobile-column" style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
                    {/* Sales Pie Chart */}
                    <div className="pie-chart-container" style={{ flex: '0 0 250px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: '250px', height: '250px', position: 'relative' }}>
                            {(!activeSalesBUData.sales || activeSalesBUData.sales.length === 0 || activeSalesBUData.sales.reduce((sum, s) => sum + s.revenue, 0) === 0) ? (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.9rem', border: '2px dashed #e2e8f0', borderRadius: '50%' }}>Chưa có doanh thu</div>
                            ) : (
                                <PieChart width={300} height={250} style={{ marginLeft: '-25px' }}>
                                    <Pie
                                        data={(activeSalesBUData.sales || []).filter(s => s.revenue > 0).map((s, i) => ({ name: s.sale_name, value: s.revenue, fill: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#14b8a6', '#84cc16', '#6366f1'][i % 10] }))}
                                        cx={150} cy={120}
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value, index, name, percent }) => {
                                            const RADIAN = Math.PI / 180;
                                            
                                            // Vị trí tên ở ngoài (gần hơn)
                                            const radiusOut = outerRadius * 1.05;
                                            const xOut = cx + radiusOut * Math.cos(-midAngle * RADIAN);
                                            const yOut = cy + radiusOut * Math.sin(-midAngle * RADIAN);
                                            
                                            // Vị trí % ở trong thanh màu
                                            const radiusIn = innerRadius + (outerRadius - innerRadius) * 0.5;
                                            const xIn = cx + radiusIn * Math.cos(-midAngle * RADIAN);
                                            const yIn = cy + radiusIn * Math.sin(-midAngle * RADIAN);

                                            const nameShort = name.split(' ').pop(); 
                                            
                                            return (
                                                <g>
                                                    <text x={xOut} y={yOut} fill="#475569" textAnchor={xOut > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="0.75rem" fontWeight="600">
                                                        {nameShort}
                                                    </text>
                                                    {percent > 0.05 && (
                                                        <text x={xIn} y={yIn} fill="#ffffff" textAnchor="middle" dominantBaseline="central" fontSize="0.75rem" fontWeight="bold">
                                                            {(percent * 100).toFixed(0)}%
                                                        </text>
                                                    )}
                                                </g>
                                            );
                                        }}
                                        labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                                    >
                                    </Pie>
                                    <Tooltip formatter={(value) => value.toLocaleString('vi-VN') + 'đ'} />
                                </PieChart>
                            )}
                            {activeSalesBUData.sales && activeSalesBUData.sales.reduce((sum, s) => sum + s.revenue, 0) > 0 && (
                                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', width: '100%', zIndex: -1 }}>
                                    <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#1e293b' }}>Doanh Thu</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Sales Đóng Góp</div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div style={{ flex: 1, maxHeight: '350px', overflowY: 'auto', paddingRight: '8px' }}>
                        <h4 style={{ fontWeight: 'bold', color: '#334155', marginBottom: '12px' }}>
                            Tổng Doanh Thu Đã Chốt: <span style={{ color: '#059669' }}>{(activeSalesBUData.sales || []).reduce((sum, s) => sum + s.revenue, 0).toLocaleString('vi-VN')}đ</span>
                            {(() => {
                                const totalCompanyRevenue = tourPerformance.reduce((acc, bu) => acc + (bu.sales || []).reduce((sum, s) => sum + s.revenue, 0), 0);
                                const currentBURevenue = (activeSalesBUData.sales || []).reduce((sum, s) => sum + s.revenue, 0);
                                const percentage = totalCompanyRevenue > 0 ? Math.round((currentBURevenue / totalCompanyRevenue) * 100) : 0;
                                return <span style={{ color: '#64748b', fontSize: '0.9rem', marginLeft: '8px', fontWeight: 'normal' }}>(Chiếm {percentage}% toàn công ty)</span>;
                            })()}
                        </h4>
                        <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                            <table style={{ width: '100%', textAlign: 'left', fontSize: '0.9rem', borderCollapse: 'collapse' }}>
                                <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                                    <tr>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Tên Nhân Viên</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Tỷ trọng</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Đơn/Khách</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Doanh Thu Ghi Nhận</th>
                                        <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: 600 }}>Đã Thu Khách</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(activeSalesBUData.sales || []).map((s, idx) => {
                                        const totalRev = (activeSalesBUData.sales || []).reduce((sum, x) => sum + x.revenue, 0);
                                        const percentage = totalRev > 0 ? Math.round((s.revenue / totalRev) * 100) : 0;
                                        const color = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f43f5e', '#14b8a6', '#84cc16', '#6366f1'][idx % 10];
                                        return (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: color }}></div>
                                                {s.sale_name}
                                            </td>
                                            <td style={{ padding: '12px 16px', fontWeight: 'bold', color: color }}>{percentage}%</td>
                                            <td style={{ padding: '12px 16px', color: '#475569' }}>{s.bookings_count} đơn / {s.total_pax} khách</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#3b82f6' }}>{s.revenue.toLocaleString('vi-VN')}đ</td>
                                            <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#10b981' }}>{s.collected_revenue.toLocaleString('vi-VN')}đ</td>
                                        </tr>
                                    )})}
                                    {(!activeSalesBUData.sales || activeSalesBUData.sales.length === 0) && (
                                        <tr>
                                            <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Không có dữ liệu sales trong kỳ này</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            </>
            )}

            {/* 5. PHÂN TÍCH LỊCH LÀM VIỆC & NGHỈ PHÉP */}
            {mainTab === 'nhan-su' && period === 'month' && (
            <div className="section-container" style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: '#e0f2fe', color: '#0284c7', padding: '12px', borderRadius: '12px' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Phân Tích Lịch Làm Việc (Theo BU)</h2>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, marginTop: '4px' }}>Theo dõi ngày nghỉ phép và ngày làm việc của nhân sự</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', flexWrap: 'wrap' }}>
                    {(workSchedules || []).map(bu => (
                        <button 
                            key={`schedule-tab-${bu.bu_name}`}
                            onClick={() => setActiveScheduleTab(bu.bu_name)}
                            style={{
                                padding: '8px 20px',
                                borderRadius: '99px',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                background: activeScheduleTab === bu.bu_name ? '#1e293b' : '#f1f5f9',
                                color: activeScheduleTab === bu.bu_name ? '#fff' : '#64748b',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {bu.bu_name} ({bu.users.length})
                        </button>
                    ))}
                </div>

                <div className="table-container" style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', fontSize: '0.85rem', borderCollapse: 'collapse', minWidth: '1200px' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', fontWeight: 600, position: 'sticky', left: 0, background: '#f8fafc', zIndex: 10 }}>Nhân Viên</th>
                                {calendarDays.map(d => (
                                    <th key={d.dateStr} style={{ padding: '8px 4px', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', fontWeight: 600, textAlign: 'center', minWidth: '35px', background: d.isWeekend ? '#f1f5f9' : '#f8fafc', color: d.isWeekend ? '#ef4444' : '#475569' }}>
                                        <div style={{ fontSize: '0.7rem' }}>{d.dayOfWeek}</div>
                                        <div>{d.day}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(activeScheduleBUData.users || []).map((u, idx) => (
                                <tr key={u.user_id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>
                                    <td 
                                        onClick={() => { setSelectedEmployeeId(u.user_id); setIsEmployeeModalOpen(true); }}
                                        style={{ padding: '10px 16px', fontWeight: 600, color: '#3b82f6', borderRight: '1px solid #e2e8f0', position: 'sticky', left: 0, background: '#ffffff', zIndex: 5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s' }}
                                        onMouseOver={e => e.currentTarget.style.color = '#1d4ed8'}
                                        onMouseOut={e => e.currentTarget.style.color = '#3b82f6'}
                                    >
                                        {u.full_name}
                                        <ExternalLink size={14} />
                                    </td>
                                    {calendarDays.map(d => {
                                        const isLeave = u.leaves.find(l => l.date === d.dateStr);
                                        return (
                                            <td key={d.dateStr} style={{ padding: '4px', borderRight: '1px solid #e2e8f0', textAlign: 'center', background: d.isWeekend && !isLeave ? '#f8fafc' : 'transparent' }}>
                                                {isLeave ? (
                                                    <div title={isLeave.type} style={{ width: '100%', height: '24px', background: '#fecdd3', color: '#e11d48', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.7rem' }}>N</div>
                                                ) : (
                                                    <div style={{ width: '100%', height: '24px', background: d.isWeekend ? 'transparent' : '#dcfce3', color: '#166534', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {!d.isWeekend && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }}></span>}
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {(!activeScheduleBUData.users || activeScheduleBUData.users.length === 0) && (
                                <tr>
                                    <td colSpan={calendarDays.length + 1} style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Không có nhân sự nào trong BU này</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}
            {mainTab === 'nhan-su' && period !== 'month' && (
                <div style={{ padding: '60px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📅</div>
                    <h3 style={{ fontSize: '1.25rem', color: '#334155', fontWeight: 'bold' }}>Vui lòng chọn bộ lọc "Tháng"</h3>
                    <p>Lịch làm việc chi tiết chỉ khả dụng khi bạn xem theo từng Tháng.</p>
                </div>
            )}

            {isBookingListOpen && selectedTourForModal && (
                <OpTourBookingListModal
                    isOpen={isBookingListOpen}
                    onClose={() => setIsBookingListOpen(false)}
                    tour={selectedTourForModal}
                    currentUser={currentUser}
                />
            )}

            <EmployeeProfileModal
                isOpen={isEmployeeModalOpen}
                onClose={() => setIsEmployeeModalOpen(false)}
                userId={selectedEmployeeId}
                period={period}
                year={year}
                month={month}
                quarter={quarter}
            />

        </div>
    );
};

export default LeaderDashboardView;
