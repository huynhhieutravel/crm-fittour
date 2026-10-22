import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Calendar, DollarSign, Users, AlertTriangle, CheckCircle, 
  Clock, Share2, Edit3, Smartphone, BedDouble, Search, 
  ExternalLink, MessageCircle, Copy, Check, ChevronRight, 
  Filter, TrendingUp, ShieldCheck, ArrowUpRight, Flame, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import QuickLogisticsDrawer from '../components/drawers/QuickLogisticsDrawer';
import DepartureShareModal from '../components/modals/DepartureShareModal';

// Color Palettes
const COLORS_SIM = ['#3b82f6', '#10b981', '#94a3b8']; // eSIM, Physical, None
const COLORS_ROOM = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899', '#64748b']; // DBL, TWIN, TRIP, SGL, Odd
const COLORS_DEMO = ['#3b82f6', '#f43f5e']; // Adult, Child

const formatMoney = (val) => {
  const num = Number(val) || 0;
  if (num >= 1000000000) {
    let t = (num / 1000000000).toFixed(2);
    return t.replace(/\.00$/, '') + ' Tỷ đ';
  }
  if (num >= 1000000) {
    let t = (num / 1000000).toFixed(2);
    return t.replace(/\.00$/, '') + ' Tr đ';
  }
  return Math.round(num).toLocaleString('vi-VN') + ' đ';
};

const formatFullVND = (val) => {
  return (Number(val) || 0).toLocaleString('vi-VN') + ' đ';
};

export default function DepartureCashflowTab({ currentUser }) {
  // Navigation View: 'operations' (Toàn cảnh BU) | 'personal' (Sổ tay cá nhân Sale)
  const [activeView, setActiveView] = useState('operations');

  // Filters State
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 1..12
  const [selectedBU, setSelectedBU] = useState('all'); // 'all' or BU1..BU5
  const [searchRoute, setSearchRoute] = useState('');
  const [debtStatus, setDebtStatus] = useState('all'); // 'all', 'debt', 'settled'

  // Personal Sales View State
  const [selectedSalesUser, setSelectedSalesUser] = useState(currentUser?.id || '');

  // Data States
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsData, setStatsData] = useState(null);

  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [personalData, setPersonalData] = useState(null);

  // Modals / Drawer State
  const [quickLogisticsTourId, setQuickLogisticsTourId] = useState(null);
  const [shareModalTour, setShareModalTour] = useState(null);

  // Load Operations & BU Stats
  useEffect(() => {
    if (activeView === 'operations') {
      fetchStats();
    }
  }, [activeView, selectedYear, selectedMonth, selectedBU, searchRoute, debtStatus]);

  // Load Personal Sales Stats
  useEffect(() => {
    if (activeView === 'personal') {
      fetchPersonal();
    }
  }, [activeView, selectedSalesUser, selectedYear, selectedMonth, selectedBU]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get('/api/departure-cashflow/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          year: selectedYear,
          month: selectedMonth,
          bu: selectedBU,
          route: searchRoute,
          debtStatus: debtStatus
        }
      });
      setStatsData(res.data);
    } catch (err) {
      console.error('Error fetching cashflow stats:', err);
      toast.error('Không thể tải số liệu dòng tiền khởi hành');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchPersonal = async () => {
    setLoadingPersonal(true);
    try {
      const res = await axios.get('/api/departure-cashflow/personal', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          userId: selectedSalesUser || currentUser?.id,
          year: selectedYear,
          month: selectedMonth,
          bu: selectedBU
        }
      });
      setPersonalData(res.data);
      if (!selectedSalesUser && res.data.user?.id) {
        setSelectedSalesUser(res.data.user.id);
      }
    } catch (err) {
      console.error('Error fetching personal cashflow:', err);
      toast.error('Không thể tải sổ tay bán hàng cá nhân');
    } finally {
      setLoadingPersonal(false);
    }
  };

  // Copy Reminder Message for Sales
  const handleCopyReminder = (booking) => {
    const customerName = booking.customer_name || 'Quý khách';
    const tourName = booking.tour_name || 'chuyến đi';
    const startDate = booking.start_date ? new Date(booking.start_date).toLocaleDateString('vi-VN') : 'sắp tới';
    const total = formatFullVND(booking.total_price);
    const paid = formatFullVND(booking.paid);
    const remaining = formatFullVND(booking.remaining_debt);
    const receiptLink = booking.public_token 
      ? `${window.location.origin}/phieu-thu/${booking.public_token}` 
      : `${window.location.origin}`;

    const text = `Dạ em chào anh/chị ${customerName} từ FIT Tour ạ!\n\nEm xin gửi anh/chị thông tin thanh toán cho chuyến đi ${tourName} (Khởi hành: ${startDate}):\n- Tổng giá tour: ${total}\n- Đã thanh toán: ${paid}\n- Số tiền còn lại: ${remaining}\n\nNhờ anh/chị hỗ trợ tất toán sớm để công ty kịp hoàn tất xuất vé máy bay và hồ sơ visa/bảo hiểm cho mình ạ.\n\nAnh/chị có thể kiểm tra phiếu xác nhận điện tử tại: ${receiptLink}\n\nEm cảm ơn anh/chị rất nhiều ạ!`;

    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép mẫu nhắc nợ cho khách ${customerName}!`);
  };

  // Donut chart datasets
  const simPieData = useMemo(() => {
    if (!statsData?.logistics?.sim) return [];
    const s = statsData.logistics.sim;
    return [
      { name: 'eSIM', value: s.esim || 0 },
      { name: 'SIM Vật lý', value: s.physical || 0 },
      { name: 'Không lấy', value: s.none || 0 }
    ].filter(item => item.value > 0);
  }, [statsData]);

  const roomPieData = useMemo(() => {
    if (!statsData?.logistics?.rooms) return [];
    const r = statsData.logistics.rooms;
    return [
      { name: 'DBL (Đôi)', value: r.dbl || 0 },
      { name: 'TWIN (2G)', value: r.twin || 0 },
      { name: 'TRIP (Phòng 3)', value: r.trip || 0 },
      { name: 'SGL (Đơn)', value: r.sgl || 0 },
      { name: 'Lẻ ghép', value: r.odd || 0 }
    ].filter(item => item.value > 0);
  }, [statsData]);

  const demoPieData = useMemo(() => {
    if (!statsData?.logistics?.demographics) return [];
    const d = statsData.logistics.demographics;
    return [
      { name: 'Người lớn (ADL)', value: d.adult || 0 },
      { name: 'Trẻ em (CHD)', value: d.child || 0 }
    ].filter(item => item.value > 0);
  }, [statsData]);

  return (
    <div style={{ padding: '1.25rem 1.5rem', minHeight: '100%', color: 'var(--text, #0f172a)' }}>
      
      {/* ═══ TOP HEADER & VIEW SWITCHER ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text, #0f172a)' }}>
              Sổ Tay Khởi Hành & Dòng Tiền
            </h1>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              <ShieldCheck size={14} /> Realtime Hub
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-light, #64748b)' }}>
            Quản trị tiến độ thu hồi dòng tiền, rủi ro công nợ theo tuyến & sổ tay hậu cần đoàn
          </p>
        </div>

        {/* View Switcher Pill Buttons */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--border, #e2e8f0)',
          padding: '4px',
          borderRadius: '12px',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveView('operations')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              backgroundColor: activeView === 'operations' ? 'var(--card-bg, #ffffff)' : 'transparent',
              color: activeView === 'operations' ? '#ff4b2b' : 'var(--text-light, #64748b)',
              boxShadow: activeView === 'operations' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Layers size={16} /> Toàn Cảnh BU & Khởi Hành
          </button>
          <button
            onClick={() => setActiveView('personal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              backgroundColor: activeView === 'personal' ? 'var(--card-bg, #ffffff)' : 'transparent',
              color: activeView === 'personal' ? '#2563eb' : 'var(--text-light, #64748b)',
              boxShadow: activeView === 'personal' ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <Flame size={16} /> Sổ Tay Bán Hàng Của Tôi
          </button>
        </div>
      </div>

      {/* ═══ FILTER TOOLBAR ═══ */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '14px',
        padding: '1rem 1.25rem',
        boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
        border: '1px solid var(--border, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '1.5rem'
      }}>
        {/* Left Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          
          {/* Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Năm:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--bg, #f8fbfd)',
                color: 'var(--text, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--bg, #f8fbfd)',
                color: 'var(--text, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}
            >
              <option value="all">Tất cả tháng</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>

          {/* BU Dropdown (Transparent BU Scope) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Đơn vị:</span>
            <select
              value={selectedBU}
              onChange={(e) => setSelectedBU(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #ff4b2b',
                backgroundColor: '#fff5f3',
                color: '#ff4b2b',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            >
              <option value="all">Tất cả BU</option>
              {(statsData?.availableBUs || ['BU1', 'BU2', 'BU3', 'BU4', 'BU5']).map(bu => (
                <option key={bu} value={bu}>{bu}</option>
              ))}
            </select>
          </div>

          {/* Search Route (For Operations View) */}
          {activeView === 'operations' && (
            <div style={{ position: 'relative' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm tuyến tour / mã..."
                value={searchRoute}
                onChange={(e) => setSearchRoute(e.target.value)}
                style={{
                  padding: '6px 10px 6px 30px',
                  borderRadius: '8px',
                  border: '1px solid var(--border, #cbd5e1)',
                  backgroundColor: 'var(--bg, #f8fbfd)',
                  color: 'var(--text, #0f172a)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          )}

          {/* Sales User Selector (For Personal Sales View) */}
          {activeView === 'personal' && personalData?.salesUsers && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Nhân viên:</span>
              <select
                value={selectedSalesUser}
                onChange={(e) => setSelectedSalesUser(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #2563eb',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                {personalData.salesUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* Right Debt Filter Buttons (For Operations View) */}
        {activeView === 'operations' && (
          <div style={{ display: 'flex', backgroundColor: 'var(--bg, #f8fbfd)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)' }}>
            <button
              onClick={() => setDebtStatus('all')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: debtStatus === 'all' ? '#1e293b' : 'transparent',
                color: debtStatus === 'all' ? 'white' : 'var(--text-light, #64748b)'
              }}
            >
              Toàn bộ
            </button>
            <button
              onClick={() => setDebtStatus('debt')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: debtStatus === 'debt' ? '#ea580c' : 'transparent',
                color: debtStatus === 'debt' ? 'white' : 'var(--text-light, #64748b)'
              }}
            >
              Còn nợ
            </button>
            <button
              onClick={() => setDebtStatus('settled')}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: debtStatus === 'settled' ? '#059669' : 'transparent',
                color: debtStatus === 'settled' ? 'white' : 'var(--text-light, #64748b)'
              }}
            >
              Đã tất toán
            </button>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════
          VIEW 1: TOÀN CẢNH ĐIỀU HÀNH & BU (OPERATIONS)
          ═══════════════════════════════════════════════ */}
      {activeView === 'operations' && (
        <>
          {/* Top 4 KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {/* Card 1: Tổng Khách */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-light, #64748b)', textTransform: 'uppercase' }}>
                Tổng Khách
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text, #0f172a)' }}>
                  {statsData?.metrics?.total_pax || 0}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light, #64748b)' }}>khách</span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-light, #94a3b8)' }}>
                {statsData?.metrics?.total_departures || 0} đợt tour ghi sổ
              </p>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: '#6366f1', opacity: 0.8 }}>
                <Users size={24} />
              </div>
            </div>

            {/* Card 2: Doanh Thu Dự Kiến */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                Doanh Thu Dự Kiến
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb' }}>
                  {formatMoney(statsData?.metrics?.total_projected)}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-light, #94a3b8)' }}>
                Giá bán + Phụ phí
              </p>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: '#3b82f6', opacity: 0.8 }}>
                <TrendingUp size={24} />
              </div>
            </div>

            {/* Card 3: Thực Thu (Cọc) */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Thực Thu (Cọc)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
                  {formatMoney(statsData?.metrics?.total_collected)}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                Đạt {statsData?.metrics?.recovery_progress_pct || 0}% dòng tiền
              </p>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: '#10b981', opacity: 0.8 }}>
                <CheckCircle size={24} />
              </div>
            </div>

            {/* Card 4: Công Nợ Còn Lại */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                Công Nợ Còn Lại
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c' }}>
                  {formatMoney(statsData?.metrics?.remaining_debt)}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-light, #94a3b8)' }}>
                {(statsData?.metrics?.tiers?.partial_paid?.count || 0) + (statsData?.metrics?.tiers?.unpaid?.count || 0)} khách cọc dở dang & chưa cọc
              </p>
              <div style={{ position: 'absolute', right: '16px', top: '16px', color: '#ea580c', opacity: 0.8 }}>
                <Clock size={24} />
              </div>
            </div>
          </div>

          {/* Traffic-Light Progress Bar */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            padding: '1.25rem 1.5rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                Tiến độ thu hồi dòng tiền: <span style={{ color: '#059669' }}>{statsData?.metrics?.recovery_progress_pct || 0}%</span>
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>
                {formatMoney(statsData?.metrics?.total_collected)} / {formatMoney(statsData?.metrics?.total_projected)}
              </span>
            </div>

            {/* Segmented Bar */}
            <div style={{
              height: '14px',
              backgroundColor: '#fee2e2',
              borderRadius: '7px',
              overflow: 'hidden',
              display: 'flex',
              width: '100%'
            }}>
              <div
                style={{
                  width: `${statsData?.metrics?.recovery_progress_pct || 0}%`,
                  backgroundColor: '#10b981',
                  transition: 'width 0.4s ease'
                }}
                title="Đã thu thực tế"
              />
              <div
                style={{
                  width: `${100 - (statsData?.metrics?.recovery_progress_pct || 0)}%`,
                  backgroundColor: '#f59e0b',
                  transition: 'width 0.4s ease'
                }}
                title="Công nợ còn lại"
              />
            </div>

            {/* Legend Tiers */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginTop: '12px', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                <span><strong>{statsData?.metrics?.tiers?.fully_paid?.pax || 0}</strong> khách đã tất toán 100%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                <span><strong>{statsData?.metrics?.tiers?.partial_paid?.pax || 0}</strong> khách cọc dở dang</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                <span><strong>{statsData?.metrics?.tiers?.unpaid?.pax || 0}</strong> khách nợ 100% (chưa cọc)</span>
              </div>
            </div>
          </div>

          {/* Charts Row: Route Debt (Horizontal Bar) & Cashflow Trend (Line Chart) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            {/* Chart 1: Doanh Thu & Rủi Ro Công Nợ Theo Tuyến */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                    Doanh Thu & Rủi Ro Công Nợ Theo Tuyến Tour
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-light, #64748b)' }}>
                    So sánh tỷ trọng Đã thu (Xanh lá) và Còn nợ (Cam) trên từng tuyến
                  </p>
                </div>
              </div>

              <div style={{ height: '340px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={statsData?.routesBreakdown || []}
                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" tickFormatter={(v) => formatMoney(v)} fontSize={11} stroke="#64748b" />
                    <YAxis dataKey="route_name" type="category" width={110} fontSize={11} stroke="#64748b" />
                    <Tooltip 
                      formatter={(value, name) => [formatFullVND(value), name === 'collected' ? 'Đã thu' : 'Còn nợ']}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="collected" stackId="a" fill="#10b981" name="Đã thu" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="remaining_debt" stackId="a" fill="#f59e0b" name="Còn nợ" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Xu Hướng Dòng Tiền Qua Các Tháng (Line Chart) */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                    Xu Hướng Dòng Tiền Qua Các Tháng ({selectedYear})
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-light, #64748b)' }}>
                    Dòng tiền dự kiến (Tím) & Thực thu theo các tháng khởi hành
                  </p>
                </div>
              </div>

              <div style={{ height: '340px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={statsData?.monthlyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" fontSize={11} stroke="#64748b" />
                    <YAxis tickFormatter={(v) => formatMoney(v)} fontSize={11} stroke="#64748b" />
                    <Tooltip formatter={(value, name) => [formatFullVND(value), name === 'projected' ? 'Doanh thu dự kiến' : 'Thực thu']} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="projected" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4 }} name="Doanh thu dự kiến" />
                    <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 4 }} name="Thực thu" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Logistics Section: Surcharges + 3 Donut Charts */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            
            {/* Phụ Phí Phát Sinh */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                  Cơ Cấu Phụ Phí Phát Sinh
                </h4>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: 700, marginBottom: '10px' }}>
                Tổng phụ thu: +{formatFullVND(statsData?.logistics?.surcharges?.total || 0)}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
                {(statsData?.logistics?.surcharges?.items || []).length === 0 ? (
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-light, #94a3b8)', fontStyle: 'italic', margin: 'auto 0' }}>
                    Chưa phát sinh phụ phí nào được ghi sổ.
                  </p>
                ) : (
                  statsData.logistics.surcharges.items.map((sc, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg, #f8fbfd)',
                      fontSize: '0.8rem'
                    }}>
                      <span style={{ color: 'var(--text, #0f172a)', fontWeight: 500 }}>{sc.title}</span>
                      <span style={{ fontWeight: 700, color: '#0284c7' }}>+{formatFullVND(sc.amount)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Donut 1: Tỷ lệ SIM */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 4px', textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                Tỷ Lệ SIM Du Lịch
              </h4>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={simPieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={4}>
                      {simPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS_SIM[i % COLORS_SIM.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#3b82f6' }}>&bull; eSIM</span>
                <span style={{ color: '#10b981' }}>&bull; SIM Vật lý</span>
                <span style={{ color: '#94a3b8' }}>&bull; Không lấy</span>
              </div>
            </div>

            {/* Donut 2: Xếp phòng */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 4px', textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                Cơ Cấu Xếp Phòng
              </h4>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roomPieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={4}>
                      {roomPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS_ROOM[i % COLORS_ROOM.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.72rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#8b5cf6' }}>&bull; DBL</span>
                <span style={{ color: '#06b6d4' }}>&bull; TWIN</span>
                <span style={{ color: '#f59e0b' }}>&bull; TRIP</span>
                <span style={{ color: '#ec4899' }}>&bull; SGL</span>
              </div>
            </div>

            {/* Donut 3: Cơ cấu đối tượng */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              textAlign: 'center'
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, margin: '0 0 4px', textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                Cơ Cấu Đối Tượng
              </h4>
              <div style={{ height: '150px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={demoPieData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={62} paddingAngle={4}>
                      {demoPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS_DEMO[i % COLORS_DEMO.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '0.75rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>&bull; Người lớn (ADL)</span>
                <span style={{ color: '#f43f5e', fontWeight: 600 }}>&bull; Trẻ em (CHD)</span>
              </div>
            </div>

          </div>

          {/* Departures Table */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                Danh Sách Đợt Tour Khởi Hành ({statsData?.departures?.length || 0})
              </h3>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg, #f8fbfd)', borderBottom: '2px solid var(--border, #e2e8f0)', color: 'var(--text-light, #475569)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Mã Tour</th>
                    <th style={{ padding: '10px 12px' }}>Tên Tuyến Tour</th>
                    <th style={{ padding: '10px 10px' }}>BU</th>
                    <th style={{ padding: '10px 10px' }}>Ngày Khởi Hành</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>Số Chỗ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Doanh Thu</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Thực Thu</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Còn Nợ</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(statsData?.departures || []).map((dep, idx) => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid var(--border, #f1f5f9)', backgroundColor: idx % 2 === 0 ? 'var(--card-bg, #ffffff)' : 'var(--bg, #fafafa)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ff4b2b' }}>
                        {dep.code}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {dep.tour_name}
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 700, fontSize: '0.75rem', color: '#475569' }}>
                          {dep.bu_group || 'Chung'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 10px' }}>
                        {dep.start_date ? new Date(dep.start_date).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: dep.sold_pax >= dep.max_pax ? '#059669' : '#1e293b' }}>
                          {dep.sold_pax}/{dep.max_pax}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {formatMoney(dep.revenue)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {formatMoney(dep.collected)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: dep.debt > 0 ? '#ea580c' : '#10b981' }}>
                        {formatMoney(dep.debt)}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <button
                            onClick={() => setQuickLogisticsTourId(dep.id)}
                            title="Sổ tay ghi nhận hậu cần (SIM, Phòng, Phụ thu)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border, #cbd5e1)',
                              backgroundColor: dep.has_quick_logistics ? '#ecfdf5' : 'var(--card-bg, #fff)',
                              color: dep.has_quick_logistics ? '#059669' : 'var(--text, #0f172a)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={13} /> Sổ tay
                          </button>
                          <button
                            onClick={() => setShareModalTour(dep)}
                            title="Tạo link chia sẻ cho HDV / Đối tác"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Share2 size={13} /> Link HDV
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════
          VIEW 2: SỔ TAY BÁN HÀNG CỦA TÔI (PERSONAL SALES)
          ═══════════════════════════════════════════════ */}
      {activeView === 'personal' && (
        <>
          {/* Top 3 Personal Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                Doanh Số Của Tôi
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '6px' }}>
                {formatFullVND(personalData?.personalMetrics?.my_revenue || 0)}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-light, #64748b)' }}>
                {personalData?.personalMetrics?.total_bookings || 0} booking &bull; {personalData?.personalMetrics?.total_pax || 0} khách
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Thực Thu
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669', marginTop: '6px' }}>
                {formatFullVND(personalData?.personalMetrics?.my_collected || 0)}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#059669', fontWeight: 600 }}>
                {personalData?.personalMetrics?.settled_bookings || 0} booking đã thanh toán đủ
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                Công Nợ Cần Thu
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>
                {formatFullVND(personalData?.personalMetrics?.my_debt || 0)}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: '#ea580c', fontWeight: 600 }}>
                {personalData?.personalMetrics?.debt_bookings_count || 0} khách còn thiếu tiền
              </p>
            </div>
          </div>

          {/* Action Table 1: Danh sách khách hàng còn nợ tiền & Cảnh báo hạn chót */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            marginBottom: '1.5rem',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#ea580c" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: '#ea580c' }}>
                  Danh Sách Khách Hàng Còn Nợ Tiền ({personalData?.debtBookings?.length || 0})
                </h3>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light, #64748b)' }}>
                Bấm "Nhắc nợ Zalo" để copy mẫu tin nhắn đôn đốc gửi khách
              </span>
            </div>

            {(personalData?.debtBookings || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#059669', fontSize: '0.95rem', fontWeight: 600 }}>
                <CheckCircle size={32} style={{ margin: '0 auto 8px' }} />
                Chúc mừng! Không có booking nào đang bị nợ tiền.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg, #f8fbfd)', borderBottom: '2px solid var(--border, #e2e8f0)', color: 'var(--text-light, #475569)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '10px 12px' }}>Khách Hàng</th>
                      <th style={{ padding: '10px 10px' }}>Số Điện Thoại</th>
                      <th style={{ padding: '10px 12px' }}>Tuyến Tour</th>
                      <th style={{ padding: '10px 10px' }}>Ngày Đi</th>
                      <th style={{ padding: '10px 10px' }}>Hạn Chót D-Day</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Tổng Tiền</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Đã Đóng</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>Còn Nợ</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center' }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalData.debtBookings.map((b, idx) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border, #f1f5f9)', backgroundColor: idx % 2 === 0 ? 'var(--card-bg, #ffffff)' : 'var(--bg, #fafafa)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                          {b.customer_name}
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          {b.customer_phone ? (
                            <a href={`tel:${b.customer_phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}>
                              {b.customer_phone}
                            </a>
                          ) : '---'}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.tour_name}
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          {b.start_date ? new Date(b.start_date).toLocaleDateString('vi-VN') : '---'}
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            backgroundColor: b.urgency === 'critical' ? '#fee2e2' : (b.urgency === 'warning' ? '#fef3c7' : '#ecfdf5'),
                            color: b.urgency === 'critical' ? '#dc2626' : (b.urgency === 'warning' ? '#d97706' : '#059669')
                          }}>
                            {b.days_until_departure <= 0 
                              ? 'Đã khởi hành' 
                              : `Còn ${b.days_until_departure} ngày ${b.urgency === 'critical' ? '🔥' : ''}`}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                          {formatFullVND(b.total_price)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {formatFullVND(b.paid)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#ea580c' }}>
                          {formatFullVND(b.remaining_debt)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <button
                              onClick={() => handleCopyReminder(b)}
                              title="Sao chép mẫu tin nhắn nhắc nợ gửi khách"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#ff4b2b',
                                color: 'white',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <MessageCircle size={13} /> Nhắc Zalo
                            </button>
                            {b.public_token && (
                              <a
                                href={`/phieu-thu/${b.public_token}`}
                                target="_blank"
                                rel="noreferrer"
                                title="Xem phiếu thu điện tử"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '5px 8px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border, #cbd5e1)',
                                  backgroundColor: 'var(--card-bg, #fff)',
                                  color: 'var(--text-light, #64748b)',
                                  fontSize: '0.75rem',
                                  textDecoration: 'none'
                                }}
                              >
                                <ExternalLink size={13} />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Table 2: Tình trạng chỗ trống các đoàn mở bán */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            padding: '1.25rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                Tình Trạng Chỗ Trống Các Đoàn Mở Bán ({personalData?.availableDepartures?.length || 0})
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light, #64748b)' }}>
                Nắm chắc số chỗ còn trống để tư vấn và chốt khách kịp thời
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg, #f8fbfd)', borderBottom: '2px solid var(--border, #e2e8f0)', color: 'var(--text-light, #475569)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '10px 12px' }}>Mã Tour</th>
                    <th style={{ padding: '10px 12px' }}>Tên Tour</th>
                    <th style={{ padding: '10px 10px' }}>BU</th>
                    <th style={{ padding: '10px 10px' }}>Ngày Đi</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>Tổng Chỗ</th>
                    <th style={{ padding: '10px 10px', textAlign: 'center' }}>Đã Giữ/Bán</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Còn Trống</th>
                  </tr>
                </thead>
                <tbody>
                  {(personalData?.availableDepartures || []).map((dep, idx) => {
                    const avail = parseInt(dep.available_seats) || 0;
                    return (
                      <tr key={dep.id} style={{ borderBottom: '1px solid var(--border, #f1f5f9)', backgroundColor: idx % 2 === 0 ? 'var(--card-bg, #ffffff)' : 'var(--bg, #fafafa)' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#ff4b2b' }}>
                          {dep.code}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                          {dep.tour_name}
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 700, fontSize: '0.75rem' }}>
                            {dep.bu_group || 'Chung'}
                          </span>
                        </td>
                        <td style={{ padding: '10px 10px' }}>
                          {dep.start_date ? new Date(dep.start_date).toLocaleDateString('vi-VN') : '---'}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 600 }}>
                          {dep.max_pax}
                        </td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>
                          {dep.sold_pax}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '3px 12px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.85rem',
                            backgroundColor: avail > 0 ? '#ecfdf5' : '#fee2e2',
                            color: avail > 0 ? '#059669' : '#dc2626'
                          }}>
                            {avail > 0 ? `Còn ${avail} chỗ` : 'Hết chỗ'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Quick Logistics Drawer */}
      <QuickLogisticsDrawer
        isOpen={!!quickLogisticsTourId}
        tourId={quickLogisticsTourId}
        onClose={() => setQuickLogisticsTourId(null)}
        onSaved={fetchStats}
      />

      {/* Share Link Modal */}
      <DepartureShareModal
        isOpen={!!shareModalTour}
        tour={shareModalTour}
        onClose={() => setShareModalTour(null)}
      />

    </div>
  );
}
