import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Cell, PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, Activity, DollarSign, Users, Plane, Globe, Award, Shield, 
  Calendar, CheckCircle, AlertTriangle, ArrowRight, X
} from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const formatMoney = (val) => {
  const num = Number(val);
  if (num >= 1000000000) {
    let t = (num / 1000000000).toFixed(1);
    return (t.endsWith('.0') ? t.slice(0, -2) : t) + ' Tỷ';
  }
  if (num >= 1000000) {
    let t = (num / 1000000).toFixed(1);
    return (t.endsWith('.0') ? t.slice(0, -2) : t) + ' Tr';
  }
  return Math.round(num).toLocaleString('vi-VN') + 'đ';
};

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  if (percent < 0.03) return null; // Hide labels for very small slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" style={{ fontSize: '13px', fontWeight: 'bold' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const GrowthIndicator = ({ current, previous }) => {
  if (!previous || previous === 0) return null;
  const growth = ((current - previous) / previous) * 100;
  if (Math.abs(growth) < 0.1) return null;
  
  const isPositive = growth >= 0;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '0.75rem', fontWeight: 700,
      color: isPositive ? '#10b981' : '#ef4444',
      background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
      padding: '4px 8px', borderRadius: '12px', marginLeft: '12px'
    }}>
      {isPositive ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
    </div>
  );
};

const CEODepartureDashboardTab = ({ currentUser }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;

  const [dateFilter, setDateFilter] = useState('year_this'); // 'year_this', 'month', 'month-select', 'quarter', 'year', 'custom'
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  
  const [selectedBU, setSelectedBU] = useState('Tất cả');
  const [availableBUs, setAvailableBUs] = useState(['Tất cả']);

  const [drilldownData, setDrilldownData] = useState([]);
  const [drilldownModal, setDrilldownModal] = useState({ isOpen: false, title: '', loading: false });

  // Fetch BUs on mount
  useEffect(() => {
    axios.get('/api/business-units', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
         const buList = res.data.filter(b => b.id !== 'BU3').map(b => b.id);
         setAvailableBUs(['Tất cả', ...buList]);
      })
      .catch(err => console.error(err));
  }, []);

  const getBounds = () => {
      const now = new Date();
      let start = new Date();
      let end = new Date();
      let prevStart = new Date();
      let prevEnd = new Date();

      switch (dateFilter) {
        case "year_this":
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date(now.getFullYear(), 12, 0, 23, 59, 59, 999);
          prevStart = new Date(now.getFullYear() - 1, 0, 1);
          prevEnd = new Date(now.getFullYear() - 1, 12, 0, 23, 59, 59, 999);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          prevEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
          break;
        case "month-select":
          start = new Date(selectedYear, selectedMonth, 1);
          end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
          prevStart = new Date(selectedYear, selectedMonth - 1, 1);
          prevEnd = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
          break;
        case "quarter":
          start = new Date(selectedYear, (selectedQuarter - 1) * 3, 1);
          end = new Date(selectedYear, (selectedQuarter - 1) * 3 + 3, 0, 23, 59, 59, 999);
          prevStart = new Date(selectedYear, (selectedQuarter - 2) * 3, 1);
          prevEnd = new Date(selectedYear, (selectedQuarter - 2) * 3 + 3, 0, 23, 59, 59, 999);
          break;
        case "year":
          start = new Date(selectedYear, 0, 1);
          end = new Date(selectedYear, 12, 0, 23, 59, 59, 999);
          prevStart = new Date(selectedYear - 1, 0, 1);
          prevEnd = new Date(selectedYear - 1, 12, 0, 23, 59, 59, 999);
          break;
        case "custom":
          return {
             startDate: customRange.startDate ? new Date(customRange.startDate + 'T00:00:00') : null,
             endDate: customRange.endDate ? new Date(customRange.endDate + 'T23:59:59') : null,
             prevStartDate: null,
             prevEndDate: null
          };
        default:
          return { startDate: null, endDate: null, prevStartDate: null, prevEndDate: null };
      }
      return { startDate: start, endDate: end, prevStartDate: prevStart, prevEndDate: prevEnd };
  };

  useEffect(() => {
    fetchData();
  }, [dateFilter, selectedMonth, selectedQuarter, selectedYear, customRange.startDate, customRange.endDate, selectedBU]);

  const formatDateString = (date) => date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const bounds = getBounds();
      if (dateFilter === 'custom' && (!bounds.startDate || !bounds.endDate)) {
          setLoading(false);
          return;
      }
      
      const params = new URLSearchParams();
      if (bounds.startDate) params.append('startDate', formatDateString(bounds.startDate));
      if (bounds.endDate) params.append('endDate', formatDateString(bounds.endDate));
      if (bounds.prevStartDate) params.append('prevStartDate', formatDateString(bounds.prevStartDate));
      if (bounds.prevEndDate) params.append('prevEndDate', formatDateString(bounds.prevEndDate));
      if (selectedBU && selectedBU !== 'Tất cả') params.append('bu_group', selectedBU);

      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/ceo-dashboard/departures?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching CEO dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrilldown = async (type, value, label) => {
    setDrilldownModal({ isOpen: true, title: `Chi Tiết Dữ Liệu: ${label}`, loading: true });
    setDrilldownData([]);
    try {
      const bounds = getBounds();
      const params = new URLSearchParams();
      if (bounds.startDate) params.append('startDate', formatDateString(bounds.startDate));
      if (bounds.endDate) params.append('endDate', formatDateString(bounds.endDate));
      if (selectedBU && selectedBU !== 'Tất cả') params.append('bu_group', selectedBU);
      params.append('type', type);
      params.append('value', value);

      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/ceo-dashboard/drill-down?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
      setDrilldownData(res.data);
    } catch (err) {
      console.error('Error fetching drilldown:', err);
    } finally {
      setDrilldownModal(prev => ({ ...prev, loading: false }));
    }
  };

  const { sales = [], bus = [], markets = [], upcoming = [], totals = {}, prev_totals = {} } = data || {};

  const formattedSales = sales.map(s => ({ ...s, booking_count: Number(s.booking_count), revenue: Number(s.revenue), cashflow: Number(s.cashflow), total_pax: Number(s.total_pax||0) }));
  const formattedBus = bus.map(b => ({ ...b, revenue: Number(b.revenue), cashflow: Number(b.cashflow) }));
  const formattedMarkets = markets.map(m => ({ ...m, revenue: Number(m.revenue) }));

  return (
    <div className="ceo-dashboard animate-slide-up" style={{ padding: '0 24px 24px 24px' }}>
      {/* Executive Filter */}
      <div className="executive-filter-panel" style={{ padding: '0', marginBottom: '20px', width: '100%' }}>
        <div className="filter-scroll-container">
          <div className="horizontal-filter-row" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'stretch' }}>
            
            {/* Row 1: BU & Date Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'nowrap', width: '100%', justifyContent: 'flex-start', overflowX: 'auto' }}>

              {/* BU Filter: Pill Action Bar */}
              <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '8px', flexShrink: 0 }}>
                 {availableBUs.map(bu => {
                    const isActive = selectedBU === bu;
                    return (
                       <button
                          key={bu}
                          onClick={() => setSelectedBU(bu)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textTransform: 'uppercase',
                            padding: '6px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', border: '1px solid #e2e8f0',
                            backgroundColor: isActive ? '#3b82f6' : 'white', color: isActive ? 'white' : '#64748b',
                            boxShadow: isActive ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
                            transition: 'all 0.2s'
                          }}
                       >
                          {bu === 'Tất cả' ? 'Tất cả BU' : bu}
                       </button>
                    );
                 })}
              </div>

              <div className="filter-divider" style={{ minHeight: '30px', borderLeft: '1px solid #e2e8f0', margin: '0' }}></div>

              <div className="segmented-control glass text-white" style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setDateFilter('year_this')}
                  className={`segment-btn ${dateFilter === 'year_this' ? "active" : ""}`}
                >
                  Năm này
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`segment-btn ${dateFilter === 'month' ? "active" : ""}`}
                >
                  Tháng này
                </button>
              </div>

              <div className="filter-divider" style={{ minHeight: '30px', borderLeft: '1px solid #e2e8f0', margin: '0' }}></div>

              <div className="segmented-control glass" style={{ flexShrink: 0 }}>
                {["month-select", "quarter", "year", "custom"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={`segment-btn ${dateFilter === f ? "active" : ""}`}
                  >
                    {f === "month-select" ? "Tháng" : f === "quarter" ? "Quý" : f === "year" ? "Năm" : "Tùy chọn"}
                  </button>
                ))}
              </div>

              {dateFilter === "month-select" && (
                <div className="executive-select-wrapper">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                    {["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {dateFilter === "quarter" && (
                <div className="executive-select-wrapper">
                  <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}>
                    {[1, 2, 3, 4].map((q) => <option key={q} value={q}>Quý {q}</option>)}
                  </select>
                </div>
              )}

              {(["month-select", "quarter", "year"].includes(dateFilter)) && (
                <div className="executive-select-wrapper">
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                    {[2023, 2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                </div>
              )}

              {dateFilter === "custom" && (
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '12px' }}>
                  <div className="date-input-group premium">
                    <Calendar size={13} style={{ color: '#6366f1' }} />
                    <input type="date" value={customRange.startDate} onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })} />
                  </div>
                  <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>→</span>
                  <div className="date-input-group premium">
                    <Calendar size={13} style={{ color: '#6366f1' }} />
                    <input type="date" value={customRange.endDate} onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
          <Activity size={40} className="animate-spin" style={{ margin: '0 auto 1.5rem auto' }} />
          Đang tổng hợp dữ liệu chiến lược cho CEO...
        </div>
      ) : (
        <>
          {/* TOP KPI CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            {/* 1. Doanh Thu (Revenue) */}
            <div className="ceo-card revenue" style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Tổng Doanh Thu Đơn Hàng</span>
                <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', color: '#2563eb' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'baseline' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {formatMoney(totals.total_revenue || 0)}
                </div>
                <GrowthIndicator current={totals.total_revenue || 0} previous={prev_totals.total_revenue || 0} />
              </div>
              <div style={{ height: '1px', background: '#f1f5f9', width: '100%', marginBottom: '16px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
                  <Users size={14} /> {totals.total_pax || 0} khách
                </div>
                <span>đã chốt thành công</span>
              </div>
            </div>

            {/* 2. Thực Thu (Cashflow) */}
            <div className="ceo-card cashflow" style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Dòng Tiền Thực Thu (Cash)</span>
                <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#10b981' }}>
                  <DollarSign size={20} />
                </div>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'baseline' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {formatMoney(totals.total_cashflow || 0)}
                </div>
                <GrowthIndicator current={totals.total_cashflow || 0} previous={prev_totals.total_cashflow || 0} />
              </div>
              {/* Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${totals.total_revenue > 0 ? Math.min((totals.total_cashflow / totals.total_revenue) * 100, 100) : 0}%`, 
                  height: '100%', 
                  background: '#10b981',
                  borderRadius: '3px'
                }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                 <span style={{ color: '#64748b' }}>Tỷ lệ thu hồi vốn:</span>
                 <span style={{ fontWeight: 700, color: '#10b981' }}>{totals.total_revenue > 0 ? Math.round((totals.total_cashflow / totals.total_revenue) * 100) : 0}%</span>
              </div>
            </div>

            {/* 3. Lịch Khởi Hành (Departures) */}
            <div className="ceo-card departures" style={{
              background: '#fff',
              padding: '24px',
              borderRadius: '24px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Số Chuyến Khởi Hành</span>
                <div style={{ padding: '10px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', color: '#8b5cf6' }}>
                  <Plane size={20} />
                </div>
              </div>
              <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'baseline' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
                  {totals.total_departures || 0} <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>Dự kiến</span>
                </div>
                <GrowthIndicator current={totals.total_departures || 0} previous={prev_totals.total_departures || 0} />
              </div>
              <div style={{ height: '1px', background: '#f1f5f9', width: '100%', marginBottom: '16px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f5f3ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>
                  Active
                </div>
                <span>Đang trong kỳ vận hành</span>
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
            
            {/* 1. REVENUE BY BU & MARKET */}
            <div className="analytics-card" style={{ gridColumn: 'span 8', background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} color="#3b82f6" /> Xếp Hạng Doanh Thu Theo Khối BU
              </h3>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={formattedBus} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="bu_group" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                    <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000000).toFixed(0)}Tr`} />
                    <Tooltip 
                      formatter={(val) => Number(val).toLocaleString('vi-VN') + 'đ'}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{fill: 'transparent'}}
                    />
                    <Bar dataKey="revenue" name="Doanh Thu" fill="#3b82f6" radius={[8, 8, 0, 0]} barSize={45}
                         onClick={(data) => fetchDrilldown('bu_group', data.bu_group, data.bu_group)}
                         style={{ cursor: 'pointer' }}
                    />
                    <Bar dataKey="cashflow" name="Thực Thu" fill="#10b981" radius={[8, 8, 0, 0]} barSize={45}
                         onClick={(data) => fetchDrilldown('bu_group', data.bu_group, data.bu_group)}
                         style={{ cursor: 'pointer' }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="analytics-card" style={{ gridColumn: 'span 4', background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Globe size={20} color="#06b6d4" /> Tỷ Trọng Thị Trường
              </h3>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={formattedMarkets}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="market"
                      onClick={(data) => fetchDrilldown('market', data.market, data.market)}
                      labelLine={false}
                      label={renderCustomizedLabel}
                      style={{ cursor: 'pointer' }}
                    >
                      {formattedMarkets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => Number(val).toLocaleString('vi-VN') + 'đ'} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. SALES LEADERBOARD */}
            <div className="analytics-card" style={{ gridColumn: 'span 6', background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={20} color="#f59e0b" /> Bảng Vàng Sales (Top Revenue)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem' }}>NHÂN VIÊN</th>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>ĐƠN</th>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'center' }}>KHÁCH</th>
                      <th style={{ padding: '12px', color: '#64748b', fontSize: '0.8rem', textAlign: 'right' }}>DOANH THU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formattedSales.map((s, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => fetchDrilldown('sale', s.sale_name, s.sale_name)}>
                        <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ width: '22px', height: '22px', background: idx === 0 ? '#fef3c7' : '#f1f5f9', color: idx === 0 ? '#d97706' : '#64748b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem' }}>{idx+1}</span>
                            {s.sale_name}
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>{s.booking_count}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10b981', fontWeight: 700, fontSize: '0.85rem' }}>{s.total_pax}</td>
                        <td style={{ padding: '12px', textAlign: 'right', fontWeight: 800, color: '#1d4ed8', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>{Math.round(s.revenue).toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. UPCOMING HEALTH */}
            <div className="analytics-card" style={{ gridColumn: 'span 6', background: '#fff', padding: '24px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
               <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plane size={20} color="#ec4899" /> Theo Dõi Sức Khỏe Lịch Khởi Hành
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcoming.map((u, idx) => {
                  const fillRate = Math.round((u.current_pax / (u.max_participants || 1)) * 100);
                  const isWarning = fillRate < 60;
                  
                  return (
                    <div key={idx} style={{ padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.9rem' }}>{u.tour_name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(u.start_date).toLocaleDateString('vi-VN')}</div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(fillRate, 100)}%`, height: '100%', background: isWarning ? '#ef4444' : '#10b981' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isWarning ? '#ef4444' : '#10b981', minWidth: '40px' }}>{fillRate}%</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <div style={{ color: '#64748b' }}>Hành khách: <strong>{u.current_pax} / {u.max_participants}</strong></div>
                        <div style={{ fontWeight: 700, color: '#1d4ed8' }}>DT: {Math.round(u.total_revenue).toLocaleString('vi-VN')}đ</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Drilldown Modal (Standardized) */}
      {drilldownModal.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '95%', maxWidth: '1300px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 25px', borderBottom: '2px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '18px' }}>{drilldownModal.title}</h3>
                <div style={{ color: '#3b82f6', borderBottom: '2px dashed #93c5fd', paddingBottom: '4px', marginTop: '2px' }}></div>
                <div style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>
                  Bảng phân tích chi tiết dữ liệu cấp độ Tour — <span style={{ color: '#2563eb', fontWeight: 700 }}>{drilldownData?.length || 0} kết quả</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => setDrilldownModal({ isOpen: false, title: '', loading: false })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                  <X size={22} color="#64748b" />
                </button>
              </div>
            </div>
            
            {/* Content / Table */}
            <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '0' }}>
              {drilldownModal.loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><Activity size={32} color="#3b82f6" className="spin" /></div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 700, color: '#334155', width: '60px' }}>STT</th>
                      <th style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 700, color: '#334155' }}>Mã & Tên Tour</th>
                      <th style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 700, color: '#334155', width: '120px' }}>Khởi Hành</th>
                      <th style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', textAlign: 'center', whiteSpace: 'nowrap', fontWeight: 700, color: '#334155', width: '100px' }}>Số Khách</th>
                      <th style={{ padding: '12px 16px', borderRight: '1px solid #e2e8f0', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700, color: '#334155', width: '160px' }}>Doanh Thu (đ)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap', fontWeight: 700, color: '#334155', width: '160px' }}>Thực Thu (đ)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drilldownData.length === 0 ? (
                      <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Không tìm thấy tour phù hợp.</td></tr>
                    ) : drilldownData.map((d, i) => (
                      <tr key={d.departure_id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? 'white' : '#fafbfc' }}>
                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 'bold', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', borderRight: '1px solid #f1f5f9' }}>
                           <div style={{ fontWeight: 800, color: '#1e293b' }}>{d.tour_code}</div>
                           <div style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginTop: '4px' }}>{d.tour_name}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                          {new Date(d.start_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center', borderRight: '1px solid #f1f5f9' }}>
                          <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 10px', borderRadius: '8px', fontWeight: 700 }}>{d.total_pax}</span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#3b82f6', borderRight: '1px solid #f1f5f9' }}>
                          {Number(d.total_revenue).toLocaleString('vi-VN')}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#10b981' }}>
                          {Number(d.total_cashflow).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
          </div>
        </div>
      )}

      <style>{`
        .ceo-dashboard .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .ceo-dashboard .stat-card:hover {
          transform: translateY(-5px);
        }
        .analytics-card {
          transition: all 0.3s ease;
        }
        .analytics-card:hover {
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }

        /* Fixed Single-Row Filter Panel */
        .executive-filter-panel {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }
        .filter-scroll-container {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .filter-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .horizontal-filter-row {
          width: 100%;
        }

        .segmented-control.glass {
          display: flex;
          background: #f8fafc;
          padding: 5px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          flex-shrink: 0;
          gap: 4px;
        }
        .segment-btn {
          padding: 7px 15px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          border-radius: 6px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
        }
        .segment-btn:hover {
          color: #6366f1;
        }
        .segment-btn.active {
          background: #ffffff;
          color: #6366f1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filter-divider {
          width: 1px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        .executive-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .executive-select-wrapper::after {
          content: '▾';
          position: absolute;
          right: 12px;
          font-size: 12px;
          color: #6366f1;
          pointer-events: none;
        }
        .executive-select-wrapper select {
          padding: 7px 30px 7px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 800;
          color: #1e293b;
          outline: none;
          cursor: pointer;
          appearance: none;
          min-width: 100px;
        }

        .date-input-group.premium {
          display: flex;
          align-items: center; gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 5px 12px;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .date-input-group input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 10px;
          font-weight: 800;
          color: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default CEODepartureDashboardTab;
