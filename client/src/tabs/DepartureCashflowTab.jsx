import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import { 
  Calendar, DollarSign, Users, AlertTriangle, CheckCircle, 
  Clock, Share2, Edit3, Smartphone, BedDouble, Search, 
  ExternalLink, MessageCircle, Copy, Check, ChevronRight, ChevronDown,
  Filter, TrendingUp, ShieldCheck, ArrowUpRight, Flame, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import QuickLogisticsDrawer from '../components/drawers/QuickLogisticsDrawer';
import DepartureShareModal from '../components/modals/DepartureShareModal';

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

const formatShortMoney = (val) => {
  const num = Number(val) || 0;
  if (num === 0) return '0';
  if (num >= 1000000000) {
    let t = (num / 1000000000).toFixed(1);
    return t.replace(/\.0$/, '') + ' Tỷ';
  }
  if (num >= 1000000) {
    let t = (num / 1000000).toFixed(0);
    return t + ' Tr';
  }
  return Math.round(num).toLocaleString('vi-VN');
};

const formatFullVND = (val) => {
  return (Number(val) || 0).toLocaleString('vi-VN') + ' đ';
};

// Helper to auto-resolve user's BU:
// "Auto chọn đúng BU của mình đang thuộc, chỉ chọn Tất cả nếu là BU3 hoặc team khác, hoặc chưa có BU"
const resolveAutoBU = (bus) => {
  if (!bus || !Array.isArray(bus) || bus.length === 0) return 'all';
  const standardBUs = bus.filter(b => b && /^BU\d+$/i.test(String(b).trim()));
  const nonBU3 = standardBUs.filter(b => b.toUpperCase() !== 'BU3');
  if (nonBU3.length > 0) return nonBU3[0].toUpperCase();
  return 'all';
};

export default function DepartureCashflowTab({ currentUser }) {
  const navigate = useNavigate();

  const handleOpenDepartureBookings = (departureId, bookingId) => {
    if (!departureId) {
      toast.error('Không tìm thấy thông tin Lịch khởi hành cho booking này');
      return;
    }
    sessionStorage.setItem('pendingOpenBookingListId', String(departureId));
    if (bookingId) {
      sessionStorage.setItem('pendingHighlightBookingId', String(bookingId));
    }
    navigate(`/op-tours?open_departure_id=${departureId}&highlight_booking_id=${bookingId || ''}`);
  };
  // Responsive mobile state
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation View: 'operations' (Toàn cảnh BU) | 'personal' (Sổ tay cá nhân Sale)
  const [activeView, setActiveView] = useState('operations');

  const userChangedBURef = useRef(false);

  // Filters State
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // Default to current month (Requirement 1 & 2)
  const [selectedMonths, setSelectedMonths] = useState([currentMonth]);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const monthPickerRef = useRef(null);

  // Auto-resolve initial BU
  const getInitialBU = () => {
    if (currentUser?.bus) {
      return resolveAutoBU(currentUser.bus);
    }
    try {
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (savedUser?.bus) {
        return resolveAutoBU(savedUser.bus);
      }
    } catch (e) {}
    return 'all';
  };

  const [selectedBU, setSelectedBU] = useState(getInitialBU);
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

  // Click outside to close Month Picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
        setShowMonthPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getMonthSummaryText = () => {
    if (selectedMonths.length === 0 || selectedMonths.length === 12) {
      return 'Tất cả các tháng';
    }
    if (selectedMonths.length === 1) {
      return `Tháng ${selectedMonths[0]}`;
    }
    const sorted = [...selectedMonths].sort((a, b) => a - b);
    if (sorted.length <= 3) {
      return sorted.map(m => `T${m}`).join(', ');
    }
    return `${sorted.length} tháng đã chọn`;
  };

  const toggleMonth = (m) => {
    setSelectedMonths(prev => {
      if (prev.length === 12) {
        return [m];
      }
      if (prev.includes(m)) {
        const next = prev.filter(x => x !== m);
        return next.length === 0 ? [currentMonth] : next;
      } else {
        return [...prev, m].sort((a, b) => a - b);
      }
    });
  };

  // Helper to format months query param
  const getMonthsQueryParam = () => {
    if (selectedMonths.length === 12 || selectedMonths.length === 0) {
      return 'all';
    }
    return [...selectedMonths].sort((a, b) => a - b).join(',');
  };

  // Load Operations & BU Stats
  useEffect(() => {
    if (activeView === 'operations') {
      fetchStats();
    }
  }, [activeView, selectedYear, selectedMonths, selectedBU, searchRoute, debtStatus]);

  // Load Personal Sales Stats
  useEffect(() => {
    if (activeView === 'personal') {
      fetchPersonal();
    }
  }, [activeView, selectedSalesUser, selectedYear, selectedMonths, selectedBU]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const monthsParam = getMonthsQueryParam();
      const res = await axios.get('/api/departure-cashflow/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          year: selectedYear,
          months: monthsParam,
          month: selectedMonths.length === 1 ? selectedMonths[0] : monthsParam,
          bu: selectedBU,
          route: searchRoute,
          debtStatus: debtStatus
        }
      });
      setStatsData(res.data);
      // Auto-select BU from server response if user hasn't changed it and it's still 'all'
      if (!userChangedBURef.current && res.data?.userBUs && res.data.userBUs.length > 0) {
        const autoBU = resolveAutoBU(res.data.userBUs);
        if (autoBU !== 'all' && selectedBU === 'all') {
          setSelectedBU(autoBU);
        }
      }
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
      const monthsParam = getMonthsQueryParam();
      const res = await axios.get('/api/departure-cashflow/personal', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        params: {
          userId: selectedSalesUser || currentUser?.id,
          year: selectedYear,
          months: monthsParam,
          month: selectedMonths.length === 1 ? selectedMonths[0] : monthsParam,
          bu: selectedBU
        }
      });
      setPersonalData(res.data);
      if (!selectedSalesUser && res.data.user?.id) {
        setSelectedSalesUser(res.data.user.id);
      }
      if (!userChangedBURef.current && res.data.user?.bus && res.data.user.bus.length > 0) {
        const autoBU = resolveAutoBU(res.data.user.bus);
        if (autoBU !== 'all' && selectedBU === 'all') {
          setSelectedBU(autoBU);
        }
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



  return (
    <div style={{ padding: isMobile ? '0.25rem 0 1rem' : '0.5rem 0 1.5rem', minHeight: '100%', color: 'var(--text, #0f172a)' }}>
      
      {/* ═══ TOP VIEW SWITCHER: TOÀN CẢNH BU vs SỔ TAY CÁ NHÂN ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: isMobile ? '0.75rem' : '1rem'
      }}>
        <div style={{
          display: isMobile ? 'flex' : 'inline-flex',
          width: isMobile ? '100%' : 'auto',
          backgroundColor: '#f1f5f9',
          padding: '4px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          gap: '4px'
        }}>
          <button
            onClick={() => setActiveView('operations')}
            style={{
              flex: isMobile ? 1 : 'none',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '7px 6px' : '8px 18px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: isMobile ? '0.78rem' : '0.86rem',
              backgroundColor: activeView === 'operations' ? 'var(--card-bg, #ffffff)' : 'transparent',
              color: activeView === 'operations' ? '#ff4b2b' : 'var(--text-light, #64748b)',
              boxShadow: activeView === 'operations' ? '0 2px 6px rgba(255, 75, 43, 0.15)' : 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <Layers size={isMobile ? 14 : 16} /> {isMobile ? 'Toàn Cảnh BU' : 'Toàn Cảnh BU & Khởi Hành'}
          </button>
          <button
            onClick={() => setActiveView('personal')}
            style={{
              flex: isMobile ? 1 : 'none',
              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '7px 6px' : '8px 18px',
              borderRadius: '9px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: isMobile ? '0.78rem' : '0.86rem',
              backgroundColor: activeView === 'personal' ? 'var(--card-bg, #ffffff)' : 'transparent',
              color: activeView === 'personal' ? '#2563eb' : 'var(--text-light, #64748b)',
              boxShadow: activeView === 'personal' ? '0 2px 6px rgba(37, 99, 235, 0.15)' : 'none',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap'
            }}
          >
            <Flame size={isMobile ? 14 : 16} /> {isMobile ? 'Sổ Tay Của Tôi' : 'Sổ Tay Bán Hàng Của Tôi'}
          </button>
        </div>

        {activeView === 'personal' && (
          <div style={{ fontSize: isMobile ? '0.78rem' : '0.85rem', color: 'var(--text-light, #64748b)', display: 'flex', alignItems: 'center', gap: '6px', width: isMobile ? '100%' : 'auto' }}>
            <span>Đang xem sổ tay của:</span>
            <span style={{ fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              {personalData?.user?.full_name || currentUser?.full_name || 'Tôi'}
            </span>
          </div>
        )}
      </div>

      {/* ═══ TOP UNIFIED ACTION & FILTER BAR (NĂM, THÁNG, BU, TUYẾN, CÔNG NỢ) ═══ */}
      <div style={{
        backgroundColor: 'var(--card-bg, #ffffff)',
        borderRadius: '16px',
        padding: isMobile ? '0.75rem' : '0.85rem 1.25rem',
        boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
        border: '1px solid var(--border, #e2e8f0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: isMobile ? '8px' : '12px',
        marginBottom: isMobile ? '1rem' : '1.25rem'
      }}>
        {/* LEFT SIDE: ALL FILTERS */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? '8px' : '10px', width: isMobile ? '100%' : 'auto' }}>
          
          {/* Year Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Năm:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                border: '1px solid var(--border, #cbd5e1)',
                backgroundColor: 'var(--bg, #f8fbfd)',
                color: 'var(--text, #0f172a)',
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {[currentYear - 1, currentYear, currentYear + 1].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Multi-Month Selector */}
          <div ref={monthPickerRef} style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Tháng:</span>
              <button
                type="button"
                onClick={() => setShowMonthPicker(prev => !prev)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: selectedMonths.length === 12 
                    ? '1px solid var(--border, #cbd5e1)' 
                    : '1.5px solid #ff4b2b',
                  backgroundColor: selectedMonths.length === 12 
                    ? 'var(--bg, #f8fbfd)' 
                    : '#fff5f3',
                  color: selectedMonths.length === 12 
                    ? 'var(--text, #0f172a)' 
                    : '#ff4b2b',
                  fontSize: isMobile ? '0.8rem' : '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <Calendar size={13} />
                <span>{getMonthSummaryText()}</span>
                <ChevronDown size={14} style={{ opacity: 0.7 }} />
              </button>
            </div>

            {showMonthPicker && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                width: isMobile ? 'calc(100vw - 44px)' : '280px',
                maxWidth: '300px',
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1px solid var(--border, #cbd5e1)',
                borderRadius: '12px',
                padding: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 100
              }}>
                {/* Quick actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border, #f1f5f9)' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedMonths([currentMonth])}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      border: '1px solid #ffd5ce',
                      backgroundColor: '#fff5f3',
                      color: '#ff4b2b',
                      cursor: 'pointer'
                    }}
                  >
                    Tháng này (T{currentMonth})
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMonths.length === 12) {
                        setSelectedMonths([currentMonth]);
                      } else {
                        setSelectedMonths([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '5px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                      border: '1px solid var(--border, #cbd5e1)',
                      backgroundColor: 'var(--bg, #f8fafc)',
                      color: 'var(--text-light, #475569)',
                      cursor: 'pointer'
                    }}
                  >
                    {selectedMonths.length === 12 ? 'Bỏ tất cả' : 'Cả 12 tháng'}
                  </button>
                </div>

                {/* Grid 12 months (4x3) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                    const isSelected = selectedMonths.includes(m);
                    const isCurrent = m === currentMonth;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMonth(m)}
                        style={{
                          position: 'relative',
                          padding: '8px 2px',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          fontWeight: isSelected ? 700 : 500,
                          border: isSelected ? '1.5px solid #ff4b2b' : '1px solid var(--border, #e2e8f0)',
                          backgroundColor: isSelected ? '#fff5f3' : 'var(--card-bg, #ffffff)',
                          color: isSelected ? '#ff4b2b' : 'var(--text, #334155)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        Tháng {m}
                        {isCurrent && (
                          <span
                            title="Tháng hiện tại"
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '3px',
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: '#ff4b2b'
                            }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Footer status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid var(--border, #f1f5f9)', fontSize: '0.74rem', color: 'var(--text-light, #64748b)' }}>
                  <span>{selectedMonths.length === 12 ? 'Tất cả các tháng' : `${selectedMonths.length} tháng được chọn`}</span>
                  <button
                    type="button"
                    onClick={() => setShowMonthPicker(false)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#ff4b2b',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '2px 6px'
                    }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* BU Dropdown (Auto-selected to user's BU) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Đơn vị:</span>
            <select
              value={selectedBU}
              onChange={(e) => {
                userChangedBURef.current = true;
                setSelectedBU(e.target.value);
              }}
              style={{
                padding: '6px 8px',
                borderRadius: '8px',
                border: selectedBU !== 'all' ? '1.5px solid #ff4b2b' : '1px solid var(--border, #cbd5e1)',
                backgroundColor: selectedBU !== 'all' ? '#fff5f3' : 'var(--bg, #f8fbfd)',
                color: selectedBU !== 'all' ? '#ff4b2b' : 'var(--text, #0f172a)',
                fontSize: isMobile ? '0.8rem' : '0.85rem',
                fontWeight: 700,
                cursor: 'pointer'
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
            <div style={{ position: 'relative', width: isMobile ? '100%' : 'auto', flex: isMobile ? '1 1 100%' : 'none' }}>
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
                  fontSize: isMobile ? '0.8rem' : '0.85rem',
                  width: isMobile ? '100%' : '180px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          {/* Sales User Selector (For Personal Sales View) */}
          {activeView === 'personal' && personalData?.salesUsers && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: isMobile ? '100%' : 'auto' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>Nhân viên:</span>
              <select
                value={selectedSalesUser}
                onChange={(e) => setSelectedSalesUser(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: '1px solid #93c5fd',
                  backgroundColor: '#eff6ff',
                  color: '#1d4ed8',
                  fontSize: isMobile ? '0.8rem' : '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  flex: isMobile ? 1 : 'none'
                }}
              >
                {personalData.salesUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.full_name || u.username}</option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* RIGHT SIDE: VIEW SWITCHER + DEBT FILTER */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
          
          {/* Debt Filter Buttons (For Operations View) */}
          {activeView === 'operations' && (
            <div style={{ display: 'flex', width: isMobile ? '100%' : 'auto', backgroundColor: 'var(--bg, #f8fbfd)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border, #e2e8f0)' }}>
              <button
                onClick={() => setDebtStatus('all')}
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '5px 4px' : '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: debtStatus === 'all' ? '#1e293b' : 'transparent',
                  color: debtStatus === 'all' ? 'white' : 'var(--text-light, #64748b)',
                  transition: 'all 0.15s',
                  textAlign: 'center'
                }}
              >
                Toàn bộ
              </button>
              <button
                onClick={() => setDebtStatus('debt')}
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '5px 4px' : '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: debtStatus === 'debt' ? '#ea580c' : 'transparent',
                  color: debtStatus === 'debt' ? 'white' : 'var(--text-light, #64748b)',
                  transition: 'all 0.15s',
                  textAlign: 'center'
                }}
              >
                Còn nợ
              </button>
              <button
                onClick={() => setDebtStatus('settled')}
                style={{
                  flex: isMobile ? 1 : 'none',
                  padding: isMobile ? '5px 4px' : '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  backgroundColor: debtStatus === 'settled' ? '#059669' : 'transparent',
                  color: debtStatus === 'settled' ? 'white' : 'var(--text-light, #64748b)',
                  transition: 'all 0.15s',
                  textAlign: 'center'
                }}
              >
                Đã tất toán
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          VIEW 1: TOÀN CẢNH ĐIỀU HÀNH & BU (OPERATIONS)
          ═══════════════════════════════════════════════ */}
      {activeView === 'operations' && (
        <>
          {/* Top 4 KPI Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: isMobile ? '8px' : '1rem',
            marginBottom: isMobile ? '1rem' : '1.5rem'
          }}>
            {/* Card 1: Tổng Khách */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: isMobile ? '10px 12px' : '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: 'var(--text-light, #64748b)', textTransform: 'uppercase' }}>
                Tổng Khách
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: 'var(--text, #0f172a)' }}>
                  {statsData?.metrics?.total_pax || 0}
                </span>
                <span style={{ fontSize: isMobile ? '0.75rem' : '0.85rem', color: 'var(--text-light, #64748b)' }}>khách</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.68rem' : '0.78rem', color: 'var(--text-light, #94a3b8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {statsData?.metrics?.total_departures || 0} đợt tour
              </p>
              <div style={{ position: 'absolute', right: isMobile ? '10px' : '16px', top: isMobile ? '10px' : '16px', color: '#6366f1', opacity: 0.8 }}>
                <Users size={isMobile ? 18 : 24} />
              </div>
            </div>

            {/* Card 2: Doanh Thu Dự Kiến */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: isMobile ? '10px 12px' : '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                Doanh Thu Dự Kiến
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: isMobile ? '1.15rem' : '1.8rem', fontWeight: 800, color: '#2563eb' }}>
                  {formatMoney(statsData?.metrics?.total_projected)}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.68rem' : '0.78rem', color: 'var(--text-light, #94a3b8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Giá bán + Phụ phí
              </p>
              <div style={{ position: 'absolute', right: isMobile ? '10px' : '16px', top: isMobile ? '10px' : '16px', color: '#3b82f6', opacity: 0.8 }}>
                <TrendingUp size={isMobile ? 18 : 24} />
              </div>
            </div>

            {/* Card 3: Thực Thu (Cọc) */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: isMobile ? '10px 12px' : '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Thực Thu (Cọc)
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: isMobile ? '1.15rem' : '1.8rem', fontWeight: 800, color: '#059669' }}>
                  {formatMoney(statsData?.metrics?.total_collected)}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.68rem' : '0.78rem', color: '#059669', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Đạt {statsData?.metrics?.recovery_progress_pct || 0}% dòng tiền
              </p>
              <div style={{ position: 'absolute', right: isMobile ? '10px' : '16px', top: isMobile ? '10px' : '16px', color: '#10b981', opacity: 0.8 }}>
                <CheckCircle size={isMobile ? 18 : 24} />
              </div>
            </div>

            {/* Card 4: Công Nợ Còn Lại */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: isMobile ? '10px 12px' : '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              position: 'relative'
            }}>
              <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                Công Nợ Còn Lại
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: isMobile ? '1.15rem' : '1.8rem', fontWeight: 800, color: '#ea580c' }}>
                  {formatMoney(statsData?.metrics?.remaining_debt)}
                </span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.68rem' : '0.78rem', color: 'var(--text-light, #94a3b8)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(statsData?.metrics?.tiers?.partial_paid?.count || 0) + (statsData?.metrics?.tiers?.unpaid?.count || 0)} khách nợ
              </p>
              <div style={{ position: 'absolute', right: isMobile ? '10px' : '16px', top: isMobile ? '10px' : '16px', color: '#ea580c', opacity: 0.8 }}>
                <Clock size={isMobile ? 18 : 24} />
              </div>
            </div>
          </div>

          {/* Traffic-Light Progress Bar */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            padding: isMobile ? '12px' : '1.25rem 1.5rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            marginBottom: isMobile ? '1rem' : '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              <span style={{ fontSize: isMobile ? '0.8rem' : '0.9rem', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                Tiến độ thu hồi dòng tiền: <span style={{ color: '#059669' }}>{statsData?.metrics?.recovery_progress_pct || 0}%</span>
              </span>
              <span style={{ fontSize: isMobile ? '0.74rem' : '0.8rem', fontWeight: 600, color: 'var(--text-light, #64748b)' }}>
                {formatMoney(statsData?.metrics?.total_collected)} / {formatMoney(statsData?.metrics?.total_projected)}
              </span>
            </div>

            {/* Segmented Bar */}
            <div style={{
              height: isMobile ? '10px' : '14px',
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
            <div style={{
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              gap: isMobile ? '6px' : '10px',
              marginTop: '10px',
              fontSize: isMobile ? '0.75rem' : '0.825rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                <span><strong>{statsData?.metrics?.tiers?.fully_paid?.pax || 0}</strong> khách đã tất toán 100%</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                <span><strong>{statsData?.metrics?.tiers?.partial_paid?.pax || 0}</strong> khách cọc dở dang</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block' }} />
                <span><strong>{statsData?.metrics?.tiers?.unpaid?.pax || 0}</strong> khách nợ 100% (chưa cọc)</span>
              </div>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              ROW 1: DOANH THU & RỦI RO CÔNG NỢ THEO TUYẾN TOUR (FULL WIDTH - 1 DÒNG)
              ════════════════════════════════════════════════════════════════════════ */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '16px',
            padding: isMobile ? '12px 10px' : '1.5rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            marginBottom: isMobile ? '1rem' : '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: isMobile ? '30px' : '36px',
                  height: isMobile ? '30px' : '36px',
                  borderRadius: '10px',
                  backgroundColor: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4f46e5'
                }}>
                  <TrendingUp size={isMobile ? 16 : 20} />
                </div>
                <div>
                  <h3 style={{
                    fontSize: isMobile ? '0.88rem' : '1rem',
                    fontWeight: 800,
                    margin: 0,
                    textTransform: 'uppercase',
                    color: 'var(--text, #0f172a)',
                    letterSpacing: '0.2px'
                  }}>
                    DOANH THU & RỦI RO CÔNG NỢ THEO TUYẾN TOUR
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.72rem' : '0.8rem', color: 'var(--text-light, #64748b)' }}>
                    So sánh tỷ trọng Đã thu (Xanh) và Còn nợ (Cam) trên từng nhóm tour
                  </p>
                </div>
              </div>

              {/* Top-Right Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '20px', fontSize: isMobile ? '0.78rem' : '0.85rem', fontWeight: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#10b981', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text, #1e293b)' }}>Đã thu</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#f59e0b', display: 'inline-block' }} />
                  <span style={{ color: 'var(--text, #1e293b)' }}>Còn nợ</span>
                </div>
              </div>
            </div>

            <div style={{
              height: `${Math.max(320, (statsData?.routesBreakdown?.length || 10) * (isMobile ? 26 : 28) + 50)}px`,
              width: '100%'
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={statsData?.routesBreakdown || []}
                  margin={{ top: 10, right: isMobile ? 12 : 30, left: isMobile ? -15 : 10, bottom: 10 }}
                  barSize={isMobile ? 14 : 18}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => isMobile ? formatShortMoney(v) : formatMoney(v)}
                    fontSize={isMobile ? 10 : 12}
                    stroke="#64748b"
                    tickLine={false}
                  />
                  <YAxis
                    dataKey="route_name"
                    type="category"
                    width={isMobile ? 95 : 170}
                    fontSize={isMobile ? 11 : 12}
                    fontWeight={600}
                    stroke="#475569"
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickFormatter={(v) => isMobile && v && v.length > 11 ? v.slice(0, 10) + '…' : v}
                  />
                  <Tooltip 
                    formatter={(value, name) => [formatFullVND(value), name === 'collected' ? 'Đã thu' : 'Còn nợ']}
                  />
                  <Bar dataKey="collected" stackId="a" fill="#10b981" name="Đã thu" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="remaining_debt" stackId="a" fill="#f59e0b" name="Còn nợ" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════════════
              ROW 2: XU HƯỚNG DÒNG TIỀN (65%) & CƠ CẤU PHỤ PHÍ (35%)
              ════════════════════════════════════════════════════════════════════════ */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: isMobile ? '1rem' : '1.5rem',
            marginBottom: isMobile ? '1rem' : '1.5rem'
          }}>
            {/* Chart 2: Xu Hướng Dòng Tiền Qua Các Tháng (Line Chart) */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              padding: isMobile ? '12px 10px' : '1.5rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: isMobile ? '30px' : '36px',
                    height: isMobile ? '30px' : '36px',
                    borderRadius: '10px',
                    backgroundColor: '#ecfdf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#059669'
                  }}>
                    <Calendar size={isMobile ? 16 : 20} />
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: isMobile ? '0.88rem' : '1rem',
                      fontWeight: 800,
                      margin: 0,
                      textTransform: 'uppercase',
                      color: 'var(--text, #0f172a)'
                    }}>
                      XU HƯỚNG DÒNG TIỀN ({selectedYear})
                    </h3>
                    <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.72rem' : '0.8rem', color: 'var(--text-light, #64748b)' }}>
                      Dòng tiền dự kiến (Tím) & Thực thu theo các tháng khởi hành
                    </p>
                  </div>
                </div>
              </div>

              <div style={{ height: isMobile ? '250px' : '320px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={statsData?.monthlyTrend || []} margin={{ top: 10, right: isMobile ? 10 : 20, left: isMobile ? -15 : 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" fontSize={isMobile ? 10 : 12} stroke="#64748b" tickLine={false} />
                    <YAxis tickFormatter={(v) => isMobile ? formatShortMoney(v) : formatMoney(v)} fontSize={isMobile ? 10 : 12} stroke="#64748b" tickLine={false} axisLine={false} width={isMobile ? 48 : 65} />
                    <Tooltip formatter={(value, name) => [formatFullVND(value), name === 'projected' ? 'Doanh thu dự kiến' : 'Thực thu']} />
                    <Legend wrapperStyle={{ fontSize: isMobile ? '11px' : '12px', paddingTop: '8px' }} />
                    <Line type="monotone" dataKey="projected" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3.5, fill: '#6366f1' }} activeDot={{ r: 6 }} name="Doanh thu dự kiến" />
                    <Line type="monotone" dataKey="collected" stroke="#10b981" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 3.5, fill: '#10b981' }} activeDot={{ r: 6 }} name="Thực thu" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Phụ Phí Phát Sinh */}
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '16px',
              padding: isMobile ? '12px 10px' : '1.5rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{
                  width: isMobile ? '30px' : '36px',
                  height: isMobile ? '30px' : '36px',
                  borderRadius: '10px',
                  backgroundColor: '#fff7ed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ea580c'
                }}>
                  <DollarSign size={isMobile ? 16 : 20} />
                </div>
                <div>
                  <h4 style={{
                    fontSize: isMobile ? '0.88rem' : '0.95rem',
                    fontWeight: 800,
                    margin: 0,
                    textTransform: 'uppercase',
                    color: 'var(--text, #0f172a)'
                  }}>
                    CƠ CẤU PHỤ PHÍ PHÁT SINH
                  </h4>
                  <div style={{ fontSize: isMobile ? '0.78rem' : '0.82rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
                    Tổng phụ thu: <strong style={{ fontSize: isMobile ? '0.86rem' : '0.92rem' }}>+{formatFullVND(statsData?.logistics?.surcharges?.total || 0)}</strong>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '10px',
                flex: 1,
                maxHeight: isMobile ? '200px' : '290px',
                overflowY: 'auto',
                paddingRight: '4px'
              }}>
                {(statsData?.logistics?.surcharges?.items || []).length === 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: '140px',
                    color: 'var(--text-light, #94a3b8)'
                  }}>
                    <p style={{ fontSize: '0.82rem', fontStyle: 'italic', margin: 0 }}>
                      Chưa phát sinh phụ phí nào được ghi sổ.
                    </p>
                  </div>
                ) : (
                  statsData.logistics.surcharges.items.map((sc, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      fontSize: '0.82rem'
                    }}>
                      <span style={{ color: 'var(--text, #1e293b)', fontWeight: 600 }}>{sc.title}</span>
                      <span style={{
                        fontWeight: 800,
                        color: '#0284c7',
                        backgroundColor: '#e0f2fe',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.8rem'
                      }}>
                        +{formatFullVND(sc.amount)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Departures Table */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            padding: isMobile ? '12px 10px' : '1.25rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
              <h3 style={{ fontSize: isMobile ? '0.88rem' : '1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase' }}>
                Danh Sách Đợt Tour Khởi Hành ({statsData?.departures?.length || 0})
              </h3>
              {isMobile && (
                <span style={{ fontSize: '0.7rem', color: '#ff4b2b', fontWeight: 600 }}>
                  👉 Vuốt ngang xem đủ cột
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg, #f8fbfd)', borderBottom: '2px solid var(--border, #e2e8f0)', color: 'var(--text-light, #475569)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: isMobile ? '8px 10px' : '10px 14px' }}>Tên Tuyến Tour</th>
                    <th style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>BU</th>
                    <th style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>Ngày Khởi Hành</th>
                    <th style={{ padding: isMobile ? '8px 6px' : '10px 10px', textAlign: 'center' }}>Số Chỗ</th>
                    <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right' }}>Doanh Thu</th>
                    <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right' }}>Thực Thu</th>
                    <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right' }}>Còn Nợ</th>
                    <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(statsData?.departures || []).map((dep, idx) => (
                    <tr key={dep.id} style={{ borderBottom: '1px solid var(--border, #f1f5f9)', backgroundColor: idx % 2 === 0 ? 'var(--card-bg, #ffffff)' : 'var(--bg, #fafafa)' }}>
                      <td style={{ padding: isMobile ? '8px 10px' : '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text, #0f172a)', fontSize: isMobile ? '0.82rem' : '0.86rem', lineHeight: 1.3 }}>
                          {dep.tour_name}
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          marginTop: '3px',
                          color: '#ff4b2b',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: '#fff5f3',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          border: '1px solid #ffd5ce',
                          letterSpacing: '0.01em'
                        }}>
                          {dep.code}
                        </div>
                      </td>
                      <td style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>
                        <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 700, fontSize: '0.72rem', color: '#475569' }}>
                          {dep.bu_group || 'Chung'}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>
                        {dep.start_date ? new Date(dep.start_date).toLocaleDateString('vi-VN') : '---'}
                      </td>
                      <td style={{ padding: isMobile ? '8px 6px' : '10px 10px', textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: dep.sold_pax >= dep.max_pax ? '#059669' : '#1e293b' }}>
                          {dep.sold_pax}/{dep.max_pax}
                        </span>
                      </td>
                      <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {formatMoney(dep.revenue)}
                      </td>
                      <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                        {formatMoney(dep.collected)}
                      </td>
                      <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right', fontWeight: 700, color: dep.debt > 0 ? '#ea580c' : '#10b981' }}>
                        {formatMoney(dep.debt)}
                      </td>
                      <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            onClick={() => setQuickLogisticsTourId(dep.id)}
                            title="Sổ tay ghi nhận hậu cần (SIM, Phòng, Phụ thu)"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border, #cbd5e1)',
                              backgroundColor: dep.has_quick_logistics ? '#ecfdf5' : 'var(--card-bg, #fff)',
                              color: dep.has_quick_logistics ? '#059669' : 'var(--text, #0f172a)',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={12} /> Sổ tay
                          </button>
                          <button
                            onClick={() => setShareModalTour(dep)}
                            title="Tạo link chia sẻ cho HDV / Đối tác"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: '#e0f2fe',
                              color: '#0284c7',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            <Share2 size={12} /> Link HDV
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
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: isMobile ? '8px' : '1rem',
            marginBottom: isMobile ? '1rem' : '1.5rem'
          }}>
            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: isMobile ? '10px 12px' : '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)'
            }}>
              <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase' }}>
                Doanh Số Của Tôi
              </span>
              <div style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: '#2563eb', marginTop: '4px' }}>
                {formatFullVND(personalData?.personalMetrics?.my_revenue || 0)}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.7rem' : '0.78rem', color: 'var(--text-light, #64748b)' }}>
                {personalData?.personalMetrics?.total_bookings || 0} booking &bull; {personalData?.personalMetrics?.total_pax || 0} khách
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: isMobile ? '10px 12px' : '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)'
            }}>
              <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
                Thực Thu
              </span>
              <div style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                {formatFullVND(personalData?.personalMetrics?.my_collected || 0)}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#059669', fontWeight: 600 }}>
                {personalData?.personalMetrics?.settled_bookings || 0} booking đã thanh toán đủ
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              borderRadius: '14px',
              padding: isMobile ? '10px 12px' : '1.25rem',
              boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
              border: '1px solid var(--border, #e2e8f0)'
            }}>
              <span style={{ fontSize: isMobile ? '0.68rem' : '0.75rem', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                Công Nợ Cần Thu
              </span>
              <div style={{ fontSize: isMobile ? '1.35rem' : '1.8rem', fontWeight: 800, color: '#ea580c', marginTop: '4px' }}>
                {formatFullVND(personalData?.personalMetrics?.my_debt || 0)}
              </div>
              <p style={{ margin: '2px 0 0', fontSize: isMobile ? '0.7rem' : '0.78rem', color: '#ea580c', fontWeight: 600 }}>
                {personalData?.personalMetrics?.debt_bookings_count || 0} khách còn thiếu tiền
              </p>
            </div>
          </div>

          {/* Action Table 1: Danh sách khách hàng còn nợ tiền & Cảnh báo hạn chót */}
          <div style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            borderRadius: '14px',
            padding: isMobile ? '12px 10px' : '1.25rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            marginBottom: isMobile ? '1rem' : '1.5rem',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#ea580c" />
                <h3 style={{ fontSize: isMobile ? '0.88rem' : '1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: '#ea580c' }}>
                  Danh Sách Khách Hàng Còn Nợ ({personalData?.debtBookings?.length || 0})
                </h3>
              </div>
              {isMobile && (
                <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 600 }}>
                  👉 Vuốt ngang xem đủ cột
                </span>
              )}
            </div>

            {(personalData?.debtBookings || []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#059669', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle size={28} style={{ margin: '0 auto 6px' }} />
                Chúc mừng! Không có booking nào đang bị nợ tiền.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg, #f8fbfd)', borderBottom: '2px solid var(--border, #e2e8f0)', color: 'var(--text-light, #475569)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: isMobile ? '8px 10px' : '10px 12px' }}>Khách Hàng</th>
                      <th style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>Số Điện Thoại</th>
                      <th style={{ padding: isMobile ? '8px 10px' : '10px 12px' }}>Tuyến Tour</th>
                      <th style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>Ngày Đi</th>
                      <th style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>Hạn Chót D-Day</th>
                      <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right' }}>Tổng Tiền</th>
                      <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right' }}>Đã Đóng</th>
                      <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right' }}>Còn Nợ</th>
                      <th style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'center' }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personalData.debtBookings.map((b, idx) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--border, #f1f5f9)', backgroundColor: idx % 2 === 0 ? 'var(--card-bg, #ffffff)' : 'var(--bg, #fafafa)' }}>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontWeight: 700, color: 'var(--text, #0f172a)' }}>
                          {b.customer_name}
                        </td>
                        <td style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>
                          {b.customer_phone ? (
                            <a href={`tel:${b.customer_phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}>
                              {b.customer_phone}
                            </a>
                          ) : '---'}
                        </td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontWeight: 600, maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.tour_name}
                        </td>
                        <td style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>
                          {b.start_date ? new Date(b.start_date).toLocaleDateString('vi-VN') : '---'}
                        </td>
                        <td style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            backgroundColor: b.urgency === 'critical' ? '#fee2e2' : (b.urgency === 'warning' ? '#fef3c7' : '#ecfdf5'),
                            color: b.urgency === 'critical' ? '#dc2626' : (b.urgency === 'warning' ? '#d97706' : '#059669')
                          }}>
                            {b.days_until_departure <= 0 
                              ? 'Đã khởi hành' 
                              : `Còn ${b.days_until_departure} ngày ${b.urgency === 'critical' ? '🔥' : ''}`}
                          </span>
                        </td>
                        <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                          {formatFullVND(b.total_price)}
                        </td>
                        <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {formatFullVND(b.paid)}
                        </td>
                        <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'right', fontWeight: 800, color: '#ea580c' }}>
                          {formatFullVND(b.remaining_debt)}
                        </td>
                        <td style={{ padding: isMobile ? '8px 8px' : '10px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <button
                              onClick={() => handleOpenDepartureBookings(b.departure_id, b.id)}
                              title="Mở danh sách Khách đặt chỗ trong Lịch khởi hành"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#0284c7',
                                color: 'white',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Users size={12} /> Khách đặt chỗ
                            </button>
                            <button
                              onClick={() => handleCopyReminder(b)}
                              title="Sao chép mẫu tin nhắn nhắc nợ gửi khách"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                border: '1px solid var(--border, #cbd5e1)',
                                backgroundColor: 'var(--card-bg, #fff)',
                                color: 'var(--text-light, #64748b)',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              <Copy size={12} />
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
                                  padding: '4px 6px',
                                  borderRadius: '6px',
                                  border: '1px solid var(--border, #cbd5e1)',
                                  backgroundColor: 'var(--card-bg, #fff)',
                                  color: 'var(--text-light, #64748b)',
                                  fontSize: '0.72rem',
                                  textDecoration: 'none'
                                }}
                              >
                                <ExternalLink size={12} />
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
            padding: isMobile ? '12px 10px' : '1.25rem',
            boxShadow: 'var(--shadow, 0 1px 3px rgba(0,0,0,0.05))',
            border: '1px solid var(--border, #e2e8f0)',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '6px' }}>
              <h3 style={{ fontSize: isMobile ? '0.88rem' : '1rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', color: 'var(--text, #0f172a)' }}>
                Tình Trạng Chỗ Trống Các Đoàn Mở Bán ({personalData?.availableDepartures?.length || 0})
              </h3>
              {isMobile && (
                <span style={{ fontSize: '0.7rem', color: '#ff4b2b', fontWeight: 600 }}>
                  👉 Vuốt ngang xem đủ cột
                </span>
              )}
            </div>

            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <table style={{ width: '100%', minWidth: '680px', borderCollapse: 'collapse', textAlign: 'left', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--bg, #f8fbfd)', borderBottom: '2px solid var(--border, #e2e8f0)', color: 'var(--text-light, #475569)', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: isMobile ? '8px 10px' : '10px 12px' }}>Mã Tour</th>
                    <th style={{ padding: isMobile ? '8px 10px' : '10px 12px' }}>Tên Tour</th>
                    <th style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>BU</th>
                    <th style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>Ngày Đi</th>
                    <th style={{ padding: isMobile ? '8px 6px' : '10px 10px', textAlign: 'center' }}>Tổng Chỗ</th>
                    <th style={{ padding: isMobile ? '8px 6px' : '10px 10px', textAlign: 'center' }}>Đã Giữ/Bán</th>
                    <th style={{ padding: isMobile ? '8px 10px' : '10px 12px', textAlign: 'center' }}>Còn Trống</th>
                  </tr>
                </thead>
                <tbody>
                  {(personalData?.availableDepartures || []).map((dep, idx) => {
                    const avail = parseInt(dep.available_seats) || 0;
                    return (
                      <tr key={dep.id} style={{ borderBottom: '1px solid var(--border, #f1f5f9)', backgroundColor: idx % 2 === 0 ? 'var(--card-bg, #ffffff)' : 'var(--bg, #fafafa)' }}>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontWeight: 700, color: '#ff4b2b' }}>
                          {dep.code}
                        </td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', fontWeight: 600 }}>
                          {dep.tour_name}
                        </td>
                        <td style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>
                          <span style={{ padding: '2px 6px', borderRadius: '4px', backgroundColor: '#f1f5f9', fontWeight: 700, fontSize: '0.72rem', color: '#475569' }}>
                            {dep.bu_group || 'Chung'}
                          </span>
                        </td>
                        <td style={{ padding: isMobile ? '8px 6px' : '10px 10px' }}>
                          {dep.start_date ? new Date(dep.start_date).toLocaleDateString('vi-VN') : '---'}
                        </td>
                        <td style={{ padding: isMobile ? '8px 6px' : '10px 10px', textAlign: 'center', fontWeight: 600 }}>
                          {dep.max_pax}
                        </td>
                        <td style={{ padding: isMobile ? '8px 6px' : '10px 10px', textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>
                          {dep.sold_pax}
                        </td>
                        <td style={{ padding: isMobile ? '8px 10px' : '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 800,
                            fontSize: '0.75rem',
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
