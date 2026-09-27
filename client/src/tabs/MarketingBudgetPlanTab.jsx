import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
  DollarSign, TrendingUp, Target, Percent, Users, Calendar, AlertTriangle,
  CheckCircle2, Download, RefreshCw, Search, Filter, Edit2, Save, X,
  FileSpreadsheet, Layers, ExternalLink, ShieldAlert, PieChart, Plus,
  Sliders, ArrowUpRight, Check, Sparkles, Building2, MapPin, ChevronLeft, ChevronRight,
  MoveHorizontal, Share2, Link2
} from 'lucide-react';

const QUARTER_OPTIONS = [
  { value: 'ALL', label: 'Cả Năm (Tất cả quý)' },
  { value: '1', label: 'Quý 1 (T1 - T3)' },
  { value: '2', label: 'Quý 2 (T4 - T6)' },
  { value: '3', label: 'Quý 3 (T7 - T9)' },
  { value: '4', label: 'Quý 4 (T10 - T12)' },
];

const YEAR_OPTIONS = [2025, 2026, 2027];

const BU_LIST = [
  { id: 'BU1', label: 'BU1', desc: 'Thị trường Trung Quốc', color: '#ef4444' },
  { id: 'BU2', label: 'BU2', desc: 'Đài Loan • Nhật Bản • Hàn Quốc • Châu Âu', color: '#3b82f6' },
  { id: 'BU3', label: 'BU3', desc: 'MICE Tour • Sự kiện đoàn', color: '#10b981' },
  { id: 'BU4', label: 'BU4', desc: 'Himalayas (Ladakh • Bhutan • Sri Lanka)', color: '#f59e0b' },
  { id: 'BU5', label: 'BU5', desc: 'Tây Á • Trung Á • Pakistan • Ma Rốc • Ai Cập', color: '#8b5cf6' },
];

const APPROVAL_STATUSES = [
  { id: 'Chờ BOD duyệt', label: 'Chờ BOD duyệt', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'Đã duyệt', label: 'Đã duyệt', color: '#10b981', bg: '#ecfdf5' },
  { id: 'Điều chỉnh', label: 'Cần điều chỉnh', color: '#3b82f6', bg: '#eff6ff' },
  { id: 'Từ chối', label: 'Từ chối', color: '#ef4444', bg: '#fef2f2' },
];

const TOUR_STATUSES = ['Đang mở bán', 'Chưa mở bán', 'Gần đủ đoàn', 'Đã khởi hành', 'Đóng đoàn'];

// Helper to format number with thousand dot separators: 32000000 -> 32.000.000
function formatNumberWithDots(val) {
  if (val === undefined || val === null || val === '') return '';
  const num = typeof val === 'number' ? val : Number(String(val).replace(/\./g, '').replace(/,/g, '').trim());
  if (isNaN(num)) return '';
  return num.toLocaleString('vi-VN');
}

// Parse string with dots back to integer: "32.000.000" -> 32000000
function parseNumberFromDots(str) {
  if (str === undefined || str === null || str === '') return 0;
  const cleaned = String(str).replace(/\./g, '').replace(/,/g, '').trim();
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

export default function MarketingBudgetPlanTab({ currentUser, addToast, bus = [] }) {
  // 3-tier permissions: Staff view-only | Marketing/BU Lead plan edits | Admin/BOD approve
  const userRole = (currentUser?.role || '').toLowerCase();
  const isAdminOrBOD = ['admin', 'ceo', 'bod', 'director', 'superadmin'].includes(userRole) || Boolean(currentUser?.is_admin);
  const canEditPlan = isAdminOrBOD || ['manager', 'marketing', 'bu_lead', 'leader'].includes(userRole) || Boolean(currentUser?.is_bu_leader);

  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [routesSummary, setRoutesSummary] = useState([]);
  
  // Filters (Initialized from URL parameters for seamless sharing)
  const [selectedBU, setSelectedBU] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const bu = (p.get('bu') || p.get('bu_id') || '').toUpperCase();
      if (['BU1', 'BU2', 'BU3', 'BU4', 'BU5'].includes(bu)) return bu;
    }
    return 'BU1';
  });

  const [selectedQuarter, setSelectedQuarter] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const q = p.get('quarter') || p.get('q');
      if (q && ['1', '2', '3', '4', 'ALL'].includes(q.toUpperCase())) return q.toUpperCase();
    }
    return '4';
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const y = parseInt(p.get('year') || p.get('y'));
      if (y && [2025, 2026, 2027].includes(y)) return y;
    }
    return 2026;
  });

  const [search, setSearch] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('search') || '';
    }
    return '';
  });

  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedEval, setSelectedEval] = useState('ALL');

  // Synchronize filter state into the browser URL (enables sharing & bookmarking)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('bu', selectedBU);
    params.set('quarter', selectedQuarter);
    params.set('year', String(selectedYear));
    if (search.trim()) {
      params.set('search', search.trim());
    } else {
      params.delete('search');
    }
    const newRelativeUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newRelativeUrl);
  }, [selectedBU, selectedQuarter, selectedYear, search]);

  // Support browser Back/Forward navigation with URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const p = new URLSearchParams(window.location.search);
      const bu = (p.get('bu') || p.get('bu_id') || '').toUpperCase();
      if (['BU1', 'BU2', 'BU3', 'BU4', 'BU5'].includes(bu)) {
        setSelectedBU(bu);
      }
      const q = p.get('quarter') || p.get('q');
      if (q && ['1', '2', '3', '4', 'ALL'].includes(q.toUpperCase())) {
        setSelectedQuarter(q.toUpperCase());
      }
      const y = parseInt(p.get('year') || p.get('y'));
      if (y && [2025, 2026, 2027].includes(y)) {
        setSelectedYear(y);
      }
      const s = p.get('search');
      if (s !== null) {
        setSearch(s);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Copy shareable link to clipboard
  const handleCopyShareLink = (targetBU) => {
    const buToUse = targetBU || selectedBU;
    const shareUrl = `${window.location.origin}/marketing-budget-plan?bu=${buToUse}&quarter=${selectedQuarter}&year=${selectedYear}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      if (addToast) {
        addToast(`Đã sao chép link bộ lọc ${buToUse} (Q${selectedQuarter}/${selectedYear})!`, 'success');
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Đã sao chép link chia sẻ!',
          text: shareUrl,
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // View mode: 'detailed' (Sheet BU1) or 'dashboard' (Sheet DASHBOARD)
  const [viewMode, setViewMode] = useState('detailed');

  // Mobile display type: 'card' (thumb-friendly cards) or 'table' (full raw spreadsheet)
  const [mobileViewType, setMobileViewType] = useState(() => {
    return (typeof window !== 'undefined' && window.innerWidth <= 768) ? 'card' : 'table';
  });

  // Modified rows tracked for batch saving
  const [modifiedIds, setModifiedIds] = useState(new Set());

  // Drawer Edit
  const [editingItem, setEditingItem] = useState(null);

  // Refs for Top & Table Horizontal Scroll Sync
  const tableContainerRef = useRef(null);
  const topScrollRef = useRef(null);
  const isSyncingScroll = useRef(false);
  const [tableScrollWidth, setTableScrollWidth] = useState(3950);

  useEffect(() => {
    const updateWidth = () => {
      if (tableContainerRef.current) {
        setTableScrollWidth(tableContainerRef.current.scrollWidth || 3950);
      }
    };
    updateWidth();
    const timer = setTimeout(updateWidth, 300);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateWidth);
    };
  }, [plans, viewMode]);

  const handleTableScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (topScrollRef.current && tableContainerRef.current) {
      topScrollRef.current.scrollLeft = tableContainerRef.current.scrollLeft;
    }
    setTimeout(() => { isSyncingScroll.current = false; }, 10);
  };

  const handleTopScroll = () => {
    if (isSyncingScroll.current) return;
    isSyncingScroll.current = true;
    if (tableContainerRef.current && topScrollRef.current) {
      tableContainerRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
    setTimeout(() => { isSyncingScroll.current = false; }, 10);
  };

  const scrollToSection = (leftPos) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTo({ left: leftPos, behavior: 'smooth' });
    }
    if (topScrollRef.current) {
      topScrollRef.current.scrollTo({ left: leftPos, behavior: 'smooth' });
    }
  };

  const scrollByAmount = (amount) => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  // Mouse Drag to Scroll on Table
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e) => {
    const tagName = e.target.tagName.toUpperCase();
    if (['INPUT', 'SELECT', 'BUTTON', 'A', 'TEXTAREA', 'SVG', 'PATH'].includes(tagName)) return;
    setIsDragging(true);
    setStartX(e.pageX - (tableContainerRef.current?.offsetLeft || 0));
    setScrollLeftState(tableContainerRef.current?.scrollLeft || 0);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !tableContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - (tableContainerRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    tableContainerRef.current.scrollLeft = scrollLeftState - walk;
    if (topScrollRef.current) {
      topScrollRef.current.scrollLeft = scrollLeftState - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const token = localStorage.getItem('token');
  const authHeaders = useMemo(() => ({
    headers: { Authorization: `Bearer ${token}` }
  }), [token]);

  // Fetch plans and summary
  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBU !== 'ALL') params.append('bu_id', selectedBU);
      if (selectedQuarter !== 'ALL') params.append('quarter', selectedQuarter);
      if (selectedYear) params.append('year', selectedYear);
      if (search.trim()) params.append('search', search.trim());
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (selectedEval !== 'ALL') params.append('evaluation', selectedEval);

      const [plansRes, summaryRes] = await Promise.all([
        axios.get(`/api/marketing-budget-plan?${params.toString()}`, authHeaders),
        axios.get(`/api/marketing-budget-plan/summary?${params.toString()}`, authHeaders)
      ]);

      if (plansRes.data.success) {
        setPlans(plansRes.data.data);
      }
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.summary);
        setRoutesSummary(summaryRes.data.routes_summary || []);
      }
      setModifiedIds(new Set());
    } catch (err) {
      console.error('Fetch error:', err);
      if (addToast) addToast('Lỗi khi tải dữ liệu ngân sách Marketing', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedBU, selectedQuarter, selectedYear, search, selectedStatus, selectedEval]);

  // Handle cell edit and recalculate derived metrics locally
  const handleCellChange = (id, field, value) => {
    setPlans(prevPlans => prevPlans.map(row => {
      if (row.id !== id) return row;

      const updated = { ...row, [field]: value };

      // Local recalculation matching Excel
      const target_pax = Number(field === 'target_pax' ? value : updated.target_pax) || 0;
      const price_per_pax = Number(field === 'price_per_pax' ? value : updated.price_per_pax) || 0;
      const cost_per_pax = Number(field === 'cost_per_pax' ? value : updated.cost_per_pax) || 0;
      const cpl_target = Number(field === 'cpl_target' ? value : updated.cpl_target) || 0;
      const cr_sale = Number(field === 'cr_sale' ? value : updated.cr_sale) || 0.10;
      const mkt_percentage = Number(field === 'mkt_percentage' ? value : updated.mkt_percentage) || 0.01;

      const gross_profit_per_pax = price_per_pax - cost_per_pax;
      const expected_revenue = target_pax * price_per_pax;
      const expected_gross_profit = target_pax * gross_profit_per_pax;
      const required_leads = cr_sale > 0 ? Math.ceil(target_pax / cr_sale) : 0;
      const budget_ads = required_leads * cpl_target;
      const ads_to_profit_ratio = expected_gross_profit > 0 
        ? Number((budget_ads / expected_gross_profit).toFixed(4)) 
        : 0;
      const mkt_cost = Math.round(expected_revenue * mkt_percentage);

      let evaluation = 'An toàn';
      if (ads_to_profit_ratio > 0.25) evaluation = 'VƯỢT TRẦN';
      else if (ads_to_profit_ratio > 0.20) evaluation = 'Cận trần';

      return {
        ...updated,
        target_pax,
        price_per_pax,
        cost_per_pax,
        cpl_target,
        cr_sale,
        mkt_percentage,
        gross_profit_per_pax,
        expected_revenue,
        expected_gross_profit,
        required_leads,
        budget_ads,
        ads_to_profit_ratio,
        mkt_cost,
        evaluation
      };
    }));

    setModifiedIds(prev => new Set(prev).add(id));
  };

  // Batch Save modified rows
  const handleSaveAll = async () => {
    if (modifiedIds.size === 0) {
      if (addToast) addToast('Không có thay đổi nào cần lưu', 'info');
      return;
    }

    const updates = plans.filter(p => modifiedIds.has(p.id));
    try {
      const res = await axios.post('/api/marketing-budget-plan/batch-save', { updates }, authHeaders);
      if (res.data.success) {
        if (addToast) addToast(`Đã lưu thành công ${res.data.count} lịch khởi hành!`, 'success');
        setModifiedIds(new Set());
        fetchData();
      }
    } catch (err) {
      console.error('Save error:', err);
      if (addToast) addToast('Lỗi khi lưu dữ liệu', 'error');
    }
  };

  // Sync from ERP Departures
  const handleSyncERP = async () => {
    const result = await Swal.fire({
      title: 'Đồng bộ từ Lịch khởi hành ERP?',
      text: 'Hệ thống sẽ quét toàn bộ Lịch khởi hành của các Sản phẩm trong ERP và cập nhật vào bảng Ngân sách Marketing.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Đồng bộ ngay',
      cancelButtonText: 'Hủy'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const res = await axios.post('/api/marketing-budget-plan/sync-erp', {}, authHeaders);
        if (res.data.success) {
          Swal.fire({
            title: 'Thành công!',
            text: res.data.message || 'Đã đồng bộ dữ liệu từ ERP',
            icon: 'success'
          });
          fetchData();
        }
      } catch (err) {
        console.error('Sync error:', err);
        Swal.fire('Lỗi', 'Không thể đồng bộ từ ERP: ' + err.message, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    const params = new URLSearchParams();
    params.append('bu_id', selectedBU);
    params.append('year', selectedYear);
    params.append('quarter', selectedQuarter);

    const url = `/api/marketing-budget-plan/export-excel?${params.toString()}`;
    window.open(url, '_blank');
  };

  // Save from Drawer
  const handleSaveDrawer = async (itemData) => {
    try {
      const res = await axios.put(`/api/marketing-budget-plan/${itemData.id}`, itemData, authHeaders);
      if (res.data.success) {
        if (addToast) addToast('Đã cập nhật lịch khởi hành!', 'success');
        setEditingItem(null);
        fetchData();
      }
    } catch (err) {
      console.error('Update error:', err);
      if (addToast) addToast('Lỗi khi cập nhật lịch khởi hành', 'error');
    }
  };

  // Format VND with non-breaking space and nowrap
  const formatMoney = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
  };

  const formatPercent = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0.0%';
    return (Number(val) * 100).toFixed(1) + '%';
  };

  // Enrich plans with Route Grouping meta
  const enrichedPlans = useMemo(() => {
    // Sort by tuyen then date
    const sorted = [...plans].sort((a, b) => {
      if (a.tuyen !== b.tuyen) return (a.tuyen || '').localeCompare(b.tuyen || '');
      return new Date(a.departure_date || 0) - new Date(b.departure_date || 0);
    });

    // Count departures per route
    const counts = {};
    sorted.forEach(p => {
      counts[p.tuyen] = (counts[p.tuyen] || 0) + 1;
    });

    let lastTuyen = null;
    return sorted.map((p, index) => {
      const isFirstOfRoute = p.tuyen !== lastTuyen;
      lastTuyen = p.tuyen;
      return {
        ...p,
        isFirstOfRoute,
        routeCount: counts[p.tuyen] || 1,
        displayIndex: index + 1
      };
    });
  }, [plans]);

  return (
    <div style={{
      padding: '0 1.25rem 2.5rem 1.25rem',
      minHeight: '100vh',
      background: 'var(--bg)',
      width: '100%',
      minWidth: 0,
      maxWidth: '100%',
      boxSizing: 'border-box'
    }}>
      {/* 1. Header & Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 0 0.75rem 0',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e3989 0%, #3b82f6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 4px 10px rgba(30, 57, 137, 0.25)'
          }}>
            <FileSpreadsheet size={20} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', margin: 0, letterSpacing: '-0.02em' }}>
              Kế Hoạch & Ngân Sách Marketing Q{selectedQuarter}/{selectedYear}
            </h1>
          </div>
        </div>

        {/* View Mode & Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* View Mode Toggle */}
          <div style={{
            display: 'flex',
            background: 'white',
            borderRadius: '10px',
            padding: '3px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0'
          }}>
            <button
              onClick={() => setViewMode('detailed')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                background: viewMode === 'detailed' ? '#1e3989' : 'transparent',
                color: viewMode === 'detailed' ? 'white' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              <Layers size={15} /> Bảng Chi Tiết Đoàn
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '7px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.82rem',
                background: viewMode === 'dashboard' ? '#1e3989' : 'transparent',
                color: viewMode === 'dashboard' ? 'white' : '#64748b',
                transition: 'all 0.2s'
              }}
            >
              <PieChart size={15} /> Dashboard Tổng Hợp Tuyến
            </button>
          </div>

          {/* Sync ERP (Only for users with edit privilege) */}
          {canEditPlan && (
            <button
              onClick={handleSyncERP}
              className="btn-pro-cancel"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.82rem',
                color: '#1e3989',
                borderColor: '#cbd5e1'
              }}
              title="Đồng bộ lịch khởi hành mới nhất từ ERP"
            >
              <RefreshCw size={15} /> Đồng Bộ ERP
            </button>
          )}

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="btn-pro-cancel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.82rem',
              color: '#059669',
              borderColor: '#a7f3d0',
              background: '#ecfdf5'
            }}
            title="Tải file Excel đúng mẫu ngan-sach-mkt-sale.xlsx"
          >
            <Download size={15} /> Xuất Excel
          </button>

          {/* View-Only Badge for general staff */}
          {!canEditPlan && (
            <span style={{
              fontSize: '0.75rem',
              color: '#475569',
              background: '#f1f5f9',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #e2e8f0'
            }}>
              👁️ Chế độ chỉ xem
            </span>
          )}

          {/* Save Changes (Only for users with edit privilege) */}
          {canEditPlan && modifiedIds.size > 0 && (
            <button
              onClick={handleSaveAll}
              className="btn-pro-save"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.82rem',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)'
              }}
            >
              <Save size={15} /> Lưu Thay Đổi ({modifiedIds.size})
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Summary KPI Cards - Compact Ribbon (Vừa đủ, không bị kéo dài dư khoảng trống) */}
      <div className="mkt-kpi-ribbon" style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '0.85rem',
        alignItems: 'stretch'
      }}>
        {/* Doanh thu dự kiến */}
        <div className="mkt-kpi-card" style={{
          background: 'white',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #3b82f6',
          flex: '1 1 180px',
          maxWidth: '240px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng Doanh Thu
            </span>
            <DollarSign size={15} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', marginTop: '3px', whiteSpace: 'nowrap' }}>
            {formatMoney(summary?.total_revenue)}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }} title="Doanh thu từ Giữ chỗ đã thanh toán / cọc">
            <span style={{ color: '#64748b', fontSize: '0.66rem' }}>Đang có:</span>
            <strong>{formatMoney(summary?.total_current_revenue)}</strong>
          </div>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '1px' }}>
            {summary?.total_target_pax || 0} Pax mục tiêu (Đã có {summary?.total_current_pax || 0})
          </div>
        </div>

        {/* Tổng Lãi Gộp */}
        <div style={{
          background: 'white',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #10b981',
          flex: '1 1 180px',
          maxWidth: '240px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Tổng Lãi Gộp
            </span>
            <TrendingUp size={15} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', marginTop: '3px', whiteSpace: 'nowrap' }}>
            {formatMoney(summary?.total_gross_profit)}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }} title="Lãi gộp theo số pax đang có">
            <span style={{ color: '#64748b', fontSize: '0.66rem' }}>Đang có:</span>
            <strong>{formatMoney(summary?.total_current_gross_profit)}</strong>
          </div>
          <div style={{ fontSize: '0.66rem', color: '#94a3b8', marginTop: '1px' }}>
            {summary?.total_revenue > 0 ? `Biên lãi: ${((summary.total_gross_profit / summary.total_revenue) * 100).toFixed(1)}%` : '0%'}
          </div>
        </div>

        {/* Tổng Budget Ads */}
        <div style={{
          background: 'white',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #f59e0b',
          flex: '1 1 160px',
          maxWidth: '220px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Budget Ads Dự Toán
            </span>
            <Target size={15} color="#d97706" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706', marginTop: '3px', whiteSpace: 'nowrap' }}>
            {formatMoney(summary?.total_budget_ads)}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
            Lead = Pax / CR Sale (10%)
          </div>
        </div>

        {/* ADS / LÃI GỘP */}
        <div style={{
          background: 'white',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          borderLeft: `4px solid ${(summary?.avg_ads_profit_ratio || 0) > 0.25 ? '#ef4444' : ((summary?.avg_ads_profit_ratio || 0) > 0.20 ? '#f59e0b' : '#10b981')}`,
          flex: '1 1 160px',
          maxWidth: '220px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              ADS / Lãi Gộp
            </span>
            <Percent size={15} color={(summary?.avg_ads_profit_ratio || 0) > 0.25 ? '#ef4444' : '#10b981'} />
          </div>
          <div style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            color: (summary?.avg_ads_profit_ratio || 0) > 0.25 ? '#dc2626' : ((summary?.avg_ads_profit_ratio || 0) > 0.20 ? '#d97706' : '#16a34a'),
            marginTop: '3px',
            whiteSpace: 'nowrap'
          }}>
            {formatPercent(summary?.avg_ads_profit_ratio)}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748b', marginTop: '4px' }}>
            {(summary?.avg_ads_profit_ratio || 0) <= 0.20 ? '🟢 An toàn (<=20%)' : ((summary?.avg_ads_profit_ratio || 0) <= 0.25 ? '🟡 Cận trần (<=25%)' : '🔴 VƯỢT TRẦN (>25%)')}
          </div>
        </div>

        {/* Chi Phí MKT Quý (1% Doanh thu) */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3989 0%, #1e293b 100%)',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 2px 6px rgba(30, 57, 137, 0.2)',
          color: 'white',
          flex: '1 1 170px',
          maxWidth: '230px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Chi Phí MKT (1%)
            </span>
            <Sparkles size={15} color="#60a5fa" />
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fcd34d', marginTop: '3px', whiteSpace: 'nowrap' }}>
            {formatMoney(summary?.total_mkt_cost)}
          </div>
          <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '4px' }}>
            Định mức 1% Doanh thu
          </div>
        </div>

        {/* Giám Sát Đoàn */}
        <div style={{
          background: 'white',
          padding: '8px 12px',
          borderRadius: '10px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          border: '1px solid #e2e8f0',
          flex: '1 1 180px',
          maxWidth: '250px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Giám Sát Đoàn
            </span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
              {summary?.total_departures || 0} lịch
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.72rem', background: '#f0fdf4', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #bbf7d0' }}>
              🟢 {summary?.safe_count || 0}
            </span>
            <span style={{ fontSize: '0.72rem', background: '#fffbeb', color: '#92400e', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #fde68a' }}>
              🟡 {summary?.warning_count || 0}
            </span>
            <span style={{ fontSize: '0.72rem', background: '#fef2f2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #fecaca' }}>
              🔴 {summary?.danger_count || 0}
            </span>
          </div>
        </div>
      </div>

      {/* 3. BU Tabs Bar (Shareable Hyperlinks with native copy support) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '0.4rem',
        marginBottom: '0.75rem'
      }}>
        {BU_LIST.map(bu => {
          const isActive = selectedBU === bu.id;
          const shareUrl = `/marketing-budget-plan?bu=${bu.id}&quarter=${selectedQuarter}&year=${selectedYear}`;
          return (
            <a
              key={bu.id}
              href={shareUrl}
              onClick={(e) => {
                e.preventDefault();
                setSelectedBU(bu.id);
              }}
              title={`Nhấp để lọc ${bu.id}, hoặc chuột phải chọn "Sao chép địa chỉ liên kết" để gửi`}
              style={{
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '10px',
                border: isActive ? `2px solid ${bu.color}` : '1px solid #e2e8f0',
                background: isActive ? `${bu.color}10` : 'white',
                color: isActive ? bu.color : '#64748b',
                fontWeight: isActive ? 800 : 500,
                fontSize: '0.8rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: isActive ? `0 2px 8px ${bu.color}20` : '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: bu.color }} />
              <span>{bu.label}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: isActive ? 700 : 400 }}>({bu.desc})</span>
            </a>
          );
        })}

        {/* Copy Shareable Link Button */}
        <button
          type="button"
          onClick={() => handleCopyShareLink()}
          title="Sao chép liên kết trực tiếp của bộ lọc này để gửi qua Zalo / Tin nhắn"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '6px 12px',
            borderRadius: '10px',
            border: '1px dashed #3b82f6',
            background: '#eff6ff',
            color: '#1d4ed8',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            marginLeft: 'auto',
            boxShadow: '0 1px 2px rgba(59,130,246,0.08)',
            transition: 'all 0.15s'
          }}
        >
          <Share2 size={13} />
          <span>Sao chép link bộ lọc</span>
        </button>
      </div>

      {/* 4. COMPACT HORIZONTAL FILTER TOOLBAR (Single line, sleek, not bulky) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
        background: 'white',
        padding: '0.65rem 1rem',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            style={{ paddingLeft: '32px', width: '100%', height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
            type="text"
            placeholder="Tìm Tuyến, Mã đoàn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Quý */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Quý:</span>
          <select
            style={{ height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem' }}
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
          >
            {QUARTER_OPTIONS.map(q => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>

        {/* Năm */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Năm:</span>
          <select
            style={{ height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {YEAR_OPTIONS.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Tình trạng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Tình trạng:</span>
          <select
            style={{ height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem' }}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">Tất cả tình trạng</option>
            {TOUR_STATUSES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Đánh giá */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', whiteSpace: 'nowrap' }}>Đánh giá:</span>
          <select
            style={{ height: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', padding: '0 8px', fontSize: '0.82rem' }}
            value={selectedEval}
            onChange={(e) => setSelectedEval(e.target.value)}
          >
            <option value="ALL">Tất cả</option>
            <option value="An toàn">🟢 An toàn</option>
            <option value="Cận trần">🟡 Cận trần</option>
            <option value="VƯỢT TRẦN">🔴 Vượt trần</option>
          </select>
        </div>

        {/* Color Legend (Compact) */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#1e3989', display: 'inline-block' }}></span>
            <span>Cột ERP/Nhập</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f6b26b', display: 'inline-block' }}></span>
            <span><strong>Cột màu vàng tự tính</strong></span>
          </div>
        </div>
      </div>

      {/* 5. Main Content Area */}
      {viewMode === 'detailed' ? (
        /* ================= SHEET 1: DETAILED DEPARTURES VIEW ================= */
        <div>
          {/* Custom Scrollbar & High Contrast Header CSS */}
          <style>{`
            .mkt-custom-scroll::-webkit-scrollbar {
              height: 14px;
              width: 14px;
            }
            .mkt-custom-scroll::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 8px;
            }
            .mkt-custom-scroll::-webkit-scrollbar-thumb {
              background: #2563eb;
              border-radius: 8px;
              border: 3px solid #f1f5f9;
            }
            .mkt-custom-scroll::-webkit-scrollbar-thumb:hover {
              background: #1e3989;
            }

            /* High Contrast Table Headers (Pure White text on Navy #1e3989) */
            .mkt-th-navy {
              background: #1e3989 !important;
              color: #ffffff !important;
              font-weight: 800 !important;
              text-transform: uppercase !important;
              font-size: 0.77rem !important;
              letter-spacing: 0.04em !important;
              vertical-align: middle !important;
              padding: 10px 12px !important;
              border-bottom: 2px solid #162a66 !important;
              box-sizing: border-box !important;
              text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
            }
            .mkt-th-yellow {
              background: #f6b26b !important;
              color: #0f172a !important;
              font-weight: 800 !important;
              text-transform: uppercase !important;
              font-size: 0.77rem !important;
              letter-spacing: 0.04em !important;
              vertical-align: middle !important;
              padding: 10px 12px !important;
              border-bottom: 2px solid #d97706 !important;
              box-sizing: border-box !important;
            }
            .mkt-cell-stt {
              width: 54px !important;
              min-width: 54px !important;
              max-width: 54px !important;
              text-align: center !important;
              vertical-align: middle !important;
              box-sizing: border-box !important;
              padding: 6px 4px !important;
            }

            /* Mobile Responsiveness */
            .mkt-mobile-only {
              display: none;
            }
            .mkt-desktop-table-container {
              display: block;
            }

            @media (max-width: 768px) {
              .mkt-kpi-ribbon {
                display: grid !important;
                grid-template-columns: repeat(2, 1fr) !important;
                gap: 8px !important;
              }
              .mkt-kpi-card {
                max-width: 100% !important;
                padding: 8px 10px !important;
              }
              .mkt-mobile-toggle-bar {
                display: block !important;
              }
              .mkt-mobile-only {
                display: block !important;
              }
            }
          `}</style>

          {/* Mobile Display Mode Switcher (Visible on small screens) */}
          <div className="mkt-mobile-toggle-bar" style={{ display: 'none', marginBottom: '10px' }}>
            <div style={{
              display: 'flex',
              background: '#e2e8f0',
              borderRadius: '10px',
              padding: '3px',
              gap: '4px'
            }}>
              <button
                type="button"
                onClick={() => setMobileViewType('card')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: mobileViewType === 'card' ? '#1e3989' : 'transparent',
                  color: mobileViewType === 'card' ? 'white' : '#64748b',
                  boxShadow: mobileViewType === 'card' ? '0 2px 6px rgba(30,57,137,0.25)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                📱 Dạng Thẻ Gọn (Dễ xem)
              </button>
              <button
                type="button"
                onClick={() => setMobileViewType('table')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: mobileViewType === 'table' ? '#1e3989' : 'transparent',
                  color: mobileViewType === 'table' ? 'white' : '#64748b',
                  boxShadow: mobileViewType === 'table' ? '0 2px 6px rgba(30,57,137,0.25)' : 'none',
                  transition: 'all 0.15s'
                }}
              >
                📊 Bảng Chi Tiết Đầy Đủ
              </button>
            </div>
          </div>

          {/* MOBILE CARD VIEW: Dedicated thumb-friendly card layout for phones */}
          {mobileViewType === 'card' && (
            <div className="mkt-mobile-only" style={{ marginBottom: '1.5rem' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: 'white', borderRadius: '12px' }}>
                  <RefreshCw className="spin" size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                  Đang tải dữ liệu lịch khởi hành...
                </div>
              ) : enrichedPlans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', background: 'white', borderRadius: '12px' }}>
                  <p style={{ fontWeight: 600 }}>Chưa có lịch khởi hành cho bộ lọc này</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {enrichedPlans.map((p) => {
                    const isExceeded = p.evaluation === 'VƯỢT TRẦN';
                    const isWarning = p.evaluation === 'Cận trần';
                    const isSafe = p.evaluation === 'An toàn';
                    const evalBg = isExceeded ? '#fef2f2' : (isWarning ? '#fffbeb' : '#f0fdf4');
                    const evalColor = isExceeded ? '#b91c1c' : (isWarning ? '#b45309' : '#15803d');
                    const evalBorder = isExceeded ? '#fecaca' : (isWarning ? '#fde68a' : '#bbf7d0');

                    return (
                      <div
                        key={p.id}
                        style={{
                          background: 'white',
                          borderRadius: '14px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        {/* Header: STT, Tuyến, Mã lịch, Đánh giá */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              fontWeight: 800,
                              fontSize: '0.8rem',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #fde68a',
                              marginTop: '2px'
                            }}>
                              #{p.displayIndex}
                            </span>
                            <div>
                              <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                                {p.tuyen}
                              </div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace', marginTop: '2px' }}>
                                {p.departure_code}
                              </div>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: evalBg,
                            color: evalColor,
                            border: `1px solid ${evalBorder}`,
                            whiteSpace: 'nowrap'
                          }}>
                            {isSafe ? '🟢 An toàn' : (isWarning ? '🟡 Cận trần' : '🔴 VƯỢT TRẦN')}
                          </span>
                        </div>

                        {/* Ngày khởi hành & Tình trạng */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#475569', background: '#f8fafc', padding: '6px 10px', borderRadius: '8px' }}>
                          <span>📅 Khởi hành: <strong>{p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN') : '-'}</strong></span>
                          <span style={{ fontWeight: 600, color: '#1e3989' }}>{p.status_text || 'Đang mở bán'}</span>
                        </div>

                        {/* Tiến độ Pax thực tế vs Mục tiêu */}
                        <div style={{ background: '#f0fdf4', padding: '8px 10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>
                            <span>Số khách: <strong>{p.current_pax || 0}</strong> / {p.target_pax} khách mục tiêu</span>
                            <span>{p.pax_completion_rate || 0}%</span>
                          </div>
                          <div style={{ height: '6px', width: '100%', background: '#dcfce7', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min(100, p.pax_completion_rate || 0)}%`,
                              background: (p.current_pax || 0) >= p.target_pax ? '#16a34a' : '#2563eb',
                              borderRadius: '4px'
                            }} />
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#15803d', marginTop: '4px' }}>
                            Hòa vốn: {p.break_even_pax} pax • Đã thu: <strong>{formatMoney(p.current_revenue)}</strong>
                          </div>
                        </div>

                        {/* 4-Box Key Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Giá Bán / Khách</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3989' }}>{formatMoney(p.price_per_pax)}</span>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Doanh Thu Dự Kiến</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{formatMoney(p.expected_revenue)}</span>
                          </div>
                          <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <span style={{ fontSize: '0.68rem', color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Budget Ads ({formatPercent(p.ads_to_profit_ratio)})</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#d97706' }}>{formatMoney(p.budget_ads)}</span>
                          </div>
                          <div style={{ background: '#eff6ff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                            <span style={{ fontSize: '0.68rem', color: '#1d4ed8', display: 'block', textTransform: 'uppercase', fontWeight: 700 }}>Chi Phí MKT (1%)</span>
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3989' }}>{formatMoney(p.mkt_cost)}</span>
                          </div>
                        </div>

                        {/* Footer: Trạng thái duyệt & Nút mở Drawer */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{
                            fontSize: '0.74rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            background: p.approval_status === 'Đã duyệt' ? '#ecfdf5' : (p.approval_status === 'Từ chối' ? '#fef2f2' : '#fffbeb'),
                            color: p.approval_status === 'Đã duyệt' ? '#047857' : (p.approval_status === 'Từ chối' ? '#b91c1c' : '#b45309'),
                            border: '1px solid currentColor'
                          }}>
                            {p.approval_status || 'Chờ BOD duyệt'}
                          </span>
                          <button
                            onClick={() => setEditingItem(p)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: '7px',
                              border: '1px solid #cbd5e1',
                              background: '#f8fafc',
                              color: '#1e3989',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            {canEditPlan ? '✏️ Xem & Sửa' : '👁️ Xem chi tiết'} ➔
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* DESKTOP TABLE VIEW (Or mobile table view if toggled) */}
          <div style={{ display: (typeof window !== 'undefined' && window.innerWidth <= 768 && mobileViewType === 'card') ? 'none' : 'block' }}>
            {/* Quick Jump Navigator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              padding: '8px 12px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '10px 10px 0 0',
              borderBottom: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e3989', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                🧭 Cuộn nhanh bảng:
              </span>
              <button
                type="button"
                onClick={() => scrollToSection(0)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#1e3989',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                }}
              >
                📍 1. Thông Tin & Giá ERP
              </button>
              <button
                type="button"
                onClick={() => scrollToSection(1900)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #f6b26b',
                  background: '#fef3c7',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  color: '#92400e',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(246,178,107,0.2)'
                }}
              >
                ⚡ 2. Cột Tự Tính (Tháng, Doanh Thu, Lãi Gộp) ▶
              </button>
              <button
                type="button"
                onClick={() => scrollToSection(2850)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: '1px solid #93c5fd',
                  background: '#eff6ff',
                  cursor: 'pointer',
                  fontSize: '0.76rem',
                  fontWeight: 700,
                  color: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 1px 2px rgba(59,130,246,0.1)'
                }}
              >
                🎯 3. Ads, Chi Phí MKT (1%) & Duyệt ▶▶
              </button>
            </div>

            {/* Top Horizontal Scrollbar (Nằm ngay trên đầu bảng, kéo được ngay tức thì) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#e2e8f0',
              border: '1px solid #cbd5e1',
              borderBottom: 'none',
              padding: '3px 10px',
              gap: '8px'
            }}>
              <div style={{ fontSize: '0.71rem', fontWeight: 800, color: '#1e3989', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
                <MoveHorizontal size={14} color="#2563eb" />
                <span>Thanh kéo ngang:</span>
              </div>
              <div
                ref={topScrollRef}
                onScroll={handleTopScroll}
                className="mkt-custom-scroll"
                style={{
                  flex: 1,
                  overflowX: 'scroll',
                  overflowY: 'hidden',
                  height: '16px',
                  cursor: 'pointer'
                }}
                title="Kéo thanh trượt xanh này để trượt ngang qua lại bảng mà không cần cuộn chuột xuống đáy"
              >
                <div style={{ width: `${tableScrollWidth}px`, height: '1px' }} />
              </div>
            </div>

            {/* Data Table Container with Natural Height & Drag-to-Scroll */}
            <div
              className="data-table-container mkt-custom-scroll"
              ref={tableContainerRef}
              onScroll={handleTableScroll}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              style={{
                background: 'white',
                borderRadius: '0 0 12px 12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                overflowX: 'auto',
                overflowY: 'visible',
                width: '100%',
                minWidth: 0,
                maxWidth: '100%',
                border: '1px solid #cbd5e1',
                cursor: isDragging ? 'grabbing' : 'default',
                userSelect: isDragging ? 'none' : 'auto'
              }}
            >
              <table className="data-table" style={{ width: '100%', minWidth: '2700px', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ background: '#1e3989', color: 'white' }}>
                    {/* ERP / Source Columns (Navy) with 100% Crisp White Text */}
                    <th className="mkt-th-yellow mkt-cell-stt" style={{ position: 'sticky', top: 0, left: 0, zIndex: 20 }}>STT</th>
                    <th className="mkt-th-navy" style={{ width: '220px', minWidth: '220px', maxWidth: '220px', boxSizing: 'border-box', textAlign: 'left', position: 'sticky', top: 0, left: '54px', zIndex: 20, boxShadow: '3px 0 6px rgba(0,0,0,0.1)' }}>Tuyến (Sản Phẩm)</th>
                    <th className="mkt-th-navy" style={{ minWidth: '170px', textAlign: 'left', position: 'sticky', top: 0, zIndex: 10 }}>Mã Lịch Khởi Hành</th>
                    <th className="mkt-th-navy" style={{ minWidth: '110px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>Ngày Khởi Hành</th>
                    <th className="mkt-th-navy" style={{ minWidth: '140px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>Pax Mục Tiêu</th>
                    <th className="mkt-th-navy" style={{ minWidth: '95px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>Pax Hòa Vốn</th>
                    <th className="mkt-th-navy" style={{ minWidth: '140px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>Giá Bán / Khách</th>
                    <th className="mkt-th-navy" style={{ minWidth: '140px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>Giá Vốn / Khách</th>
                    <th className="mkt-th-navy" style={{ minWidth: '115px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>CPL Kỳ Vọng</th>
                    <th className="mkt-th-navy" style={{ minWidth: '115px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>Tình Trạng</th>
                    <th className="mkt-th-navy" style={{ minWidth: '400px', textAlign: 'left', position: 'sticky', top: 0, zIndex: 10 }}>Ghi Chú / Đề Xuất</th>

                    {/* AUTO CALCULATED COLUMNS (Yellow/Orange #f6b26b) */}
                    <th className="mkt-th-yellow" style={{ minWidth: '110px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                      Tháng
                    </th>
                    <th className="mkt-th-yellow" style={{ minWidth: '150px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>
                      Lãi Gộp / Khách
                    </th>
                    <th className="mkt-th-yellow" style={{ minWidth: '185px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>
                      Doanh Thu Dự Kiến
                    </th>
                    <th className="mkt-th-yellow" style={{ minWidth: '185px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>
                      Lãi Gộp Dự Kiến
                    </th>
                    <th className="mkt-th-yellow" style={{ minWidth: '90px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>
                      Lead Cần
                    </th>
                    <th className="mkt-th-yellow" style={{ minWidth: '155px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>
                      Budget Ads Dự Toán
                    </th>
                    <th className="mkt-th-yellow" style={{ minWidth: '115px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
                      % Ads / Lãi Gộp
                    </th>

                    {/* Proposal Marketing & Approvals */}
                    <th className="mkt-th-navy" style={{ minWidth: '105px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>Đề Xuất % MKT</th>
                    <th className="mkt-th-navy" style={{ minWidth: '155px', textAlign: 'right', position: 'sticky', top: 0, zIndex: 10 }}>Chi Phí MKT (1%)</th>
                    <th className="mkt-th-yellow" style={{ minWidth: '135px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>Trạng Thái Duyệt</th>
                    <th className="mkt-th-navy" style={{ minWidth: '90px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>Drive Dự Toán</th>
                    <th className="mkt-th-yellow" style={{ minWidth: '115px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>Đánh Giá</th>
                    <th className="mkt-th-navy" style={{ minWidth: '70px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>Sửa</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="24" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <RefreshCw className="spin" size={24} style={{ margin: '0 auto 8px auto', display: 'block' }} />
                        Đang tải dữ liệu lịch khởi hành và ngân sách...
                      </td>
                    </tr>
                  ) : enrichedPlans.length === 0 ? (
                    <tr>
                      <td colSpan="24" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px' }}>Chưa có lịch khởi hành cho bộ lọc này</div>
                        <button onClick={handleSyncERP} className="btn-pro-save" style={{ margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <RefreshCw size={16} /> Đồng bộ từ Lịch khởi hành ERP ngay
                        </button>
                      </td>
                    </tr>
                  ) : (
                    enrichedPlans.map((p, idx) => {
                      const isModified = modifiedIds.has(p.id);
                      const isExceeded = p.evaluation === 'VƯỢT TRẦN';
                      const isWarning = p.evaluation === 'Cận trần';

                      return (
                        <tr
                          key={p.id}
                          style={{
                            background: isModified ? '#fffbeb' : (idx % 2 === 0 ? 'white' : '#f8fafc'),
                            borderTop: p.isFirstOfRoute && idx > 0 ? '2px solid #94a3b8' : '1px solid #e2e8f0',
                            borderBottom: '1px solid #e2e8f0',
                            transition: 'background 0.15s'
                          }}
                        >
                          {/* STT (Centered both horizontally & vertically) */}
                          <td className="mkt-cell-stt" style={{
                            fontWeight: 800,
                            color: '#475569',
                            background: isModified ? '#fffbeb' : (idx % 2 === 0 ? 'white' : '#f8fafc'),
                            position: 'sticky',
                            left: 0,
                            zIndex: 4,
                            borderBottom: '1px solid #e2e8f0',
                            textAlign: 'center',
                            verticalAlign: 'middle'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                              {p.displayIndex}
                            </div>
                          </td>

                          {/* Tuyến: Nhóm theo Tuyến thông minh (Sticky Frozen) */}
                          <td style={{
                            width: '220px',
                            minWidth: '220px',
                            maxWidth: '220px',
                            boxSizing: 'border-box',
                            fontWeight: 700,
                            color: '#1e293b',
                            position: 'sticky',
                            left: '54px',
                            zIndex: 4,
                            background: isModified ? '#fffbeb' : (idx % 2 === 0 ? 'white' : '#f8fafc'),
                            boxShadow: '3px 0 6px rgba(0,0,0,0.06)',
                            borderBottom: '1px solid #e2e8f0'
                          }}>
                          {p.isFirstOfRoute ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span style={{ fontSize: '0.88rem', color: '#0f172a', fontWeight: 700, lineHeight: 1.3 }}>{p.tuyen}</span>
                              {p.routeCount > 1 && (
                                <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600, background: '#eff6ff', padding: '1px 6px', borderRadius: '4px', alignSelf: 'flex-start' }}>
                                  📁 Tuyến có {p.routeCount} lịch khởi hành
                                </span>
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '0.75rem', color: '#64748b', fontSize: '0.78rem' }}>
                              <span style={{ color: '#94a3b8' }}>↳</span>
                              <span style={{ fontStyle: 'italic' }}>Cùng tuyến ({p.tuyen})</span>
                            </div>
                          )}
                        </td>

                      {/* Mã Lịch Khởi Hành */}
                      <td style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {p.departure_code}
                      </td>

                      {/* Ngày Khởi Hành */}
                      <td style={{ textAlign: 'center', color: '#334155', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN') : '-'}
                      </td>

                      {/* Pax Mục Tiêu (Editable if canEditPlan) + Pax đang có (từ Giữ chỗ) */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '6px 10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                          <input
                            type="number"
                            disabled={!canEditPlan}
                            readOnly={!canEditPlan}
                            style={{
                              width: '64px',
                              textAlign: 'right',
                              padding: '4px 6px',
                              borderRadius: '6px',
                              border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                              background: canEditPlan ? 'white' : 'transparent',
                              fontSize: '0.82rem',
                              fontWeight: 700,
                              cursor: canEditPlan ? 'text' : 'default'
                            }}
                            value={p.target_pax}
                            onChange={(e) => handleCellChange(p.id, 'target_pax', Number(e.target.value))}
                          />
                          <div style={{
                            fontSize: '0.71rem',
                            fontWeight: 600,
                            color: (p.current_pax || 0) >= p.target_pax ? '#15803d' : '#2563eb',
                            background: (p.current_pax || 0) >= p.target_pax ? '#dcfce7' : '#eff6ff',
                            border: (p.current_pax || 0) >= p.target_pax ? '1px solid #86efac' : '1px solid #bfdbfe',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            whiteSpace: 'nowrap'
                          }}
                          title="Số pax từ Giữ chỗ đã thanh toán / cọc">
                            <span>Đang có: <strong>{p.current_pax || 0}</strong> pax</span>
                            <span style={{ fontSize: '0.67rem', opacity: 0.85 }}>({p.pax_completion_rate || 0}%)</span>
                          </div>
                        </div>
                      </td>

                      {/* Pax Hòa Vốn (Editable if canEditPlan) */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <input
                          type="number"
                          disabled={!canEditPlan}
                          readOnly={!canEditPlan}
                          style={{
                            width: '60px',
                            textAlign: 'right',
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                            background: canEditPlan ? 'white' : 'transparent',
                            fontSize: '0.82rem',
                            cursor: canEditPlan ? 'text' : 'default'
                          }}
                          value={p.break_even_pax}
                          onChange={(e) => handleCellChange(p.id, 'break_even_pax', Number(e.target.value))}
                        />
                      </td>

                      {/* Giá Bán / Khách (Định dạng có dấu chấm) */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <input
                          type="text"
                          disabled={!canEditPlan}
                          readOnly={!canEditPlan}
                          style={{
                            width: '120px',
                            textAlign: 'right',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                            background: canEditPlan ? 'white' : 'transparent',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#1e3989',
                            cursor: canEditPlan ? 'text' : 'default'
                          }}
                          value={formatNumberWithDots(p.price_per_pax)}
                          onChange={(e) => handleCellChange(p.id, 'price_per_pax', parseNumberFromDots(e.target.value))}
                          placeholder="0"
                        />
                      </td>

                      {/* Giá Vốn / Khách (Định dạng có dấu chấm) */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <input
                          type="text"
                          disabled={!canEditPlan}
                          readOnly={!canEditPlan}
                          style={{
                            width: '120px',
                            textAlign: 'right',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                            background: canEditPlan ? 'white' : 'transparent',
                            fontSize: '0.82rem',
                            cursor: canEditPlan ? 'text' : 'default'
                          }}
                          value={formatNumberWithDots(p.cost_per_pax)}
                          onChange={(e) => handleCellChange(p.id, 'cost_per_pax', parseNumberFromDots(e.target.value))}
                          placeholder="0"
                        />
                      </td>

                      {/* CPL Kỳ Vọng (Định dạng có dấu chấm) */}
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <input
                          type="text"
                          disabled={!canEditPlan}
                          readOnly={!canEditPlan}
                          style={{
                            width: '95px',
                            textAlign: 'right',
                            padding: '4px 6px',
                            borderRadius: '6px',
                            border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                            background: canEditPlan ? 'white' : 'transparent',
                            fontSize: '0.82rem',
                            cursor: canEditPlan ? 'text' : 'default'
                          }}
                          value={formatNumberWithDots(p.cpl_target)}
                          onChange={(e) => handleCellChange(p.id, 'cpl_target', parseNumberFromDots(e.target.value))}
                          placeholder="140.000"
                        />
                      </td>

                      {/* Tình Trạng */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <select
                          disabled={!canEditPlan}
                          style={{
                            fontSize: '0.75rem',
                            padding: '3px 6px',
                            borderRadius: '6px',
                            border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                            background: canEditPlan ? 'white' : 'transparent',
                            cursor: canEditPlan ? 'pointer' : 'default'
                          }}
                          value={p.status_text || 'Đang mở bán'}
                          onChange={(e) => handleCellChange(p.id, 'status_text', e.target.value)}
                        >
                          {TOUR_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Ghi Chú / Đề Xuất (Mở rộng thoải mái, dễ đọc) */}
                      <td style={{ minWidth: '400px', maxWidth: '480px', padding: '6px 10px' }}>
                        <input
                          type="text"
                          disabled={!canEditPlan}
                          readOnly={!canEditPlan}
                          style={{
                            width: '100%',
                            minWidth: '380px',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                            fontSize: '0.82rem',
                            background: canEditPlan ? '#ffffff' : 'transparent',
                            color: '#1e293b',
                            cursor: canEditPlan ? 'text' : 'default'
                          }}
                          value={p.notes || ''}
                          onChange={(e) => handleCellChange(p.id, 'notes', e.target.value)}
                          placeholder={canEditPlan ? "Nhập ghi chú, đề xuất chạy Ads, thay đổi lịch bay..." : "-"}
                        />
                      </td>

                      {/* ================= CÁC Ô MÀU VÀNG TỰ TÍNH (Luôn trên 1 hàng, nowrap) ================= */}
                      {/* Tháng */}
                      <td style={{ textAlign: 'center', background: '#fef9c3', fontWeight: 600, color: '#854d0e', whiteSpace: 'nowrap' }}>
                        {p.month_label}
                      </td>

                      {/* Lãi Gộp / Khách */}
                      <td style={{
                        textAlign: 'right',
                        background: '#fef9c3',
                        fontWeight: 700,
                        color: p.gross_profit_per_pax < 0 ? '#dc2626' : '#15803d',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatMoney(p.gross_profit_per_pax)}
                      </td>

                      {/* Doanh Thu Dự Kiến (Tự tính) + Doanh thu đang có (từ Giữ chỗ) */}
                      <td style={{ textAlign: 'right', background: '#fef9c3', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '6px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#1e3989', fontSize: '0.85rem' }}>
                          {formatMoney(p.expected_revenue)}
                        </div>
                        <div style={{
                          fontSize: '0.71rem',
                          fontWeight: 600,
                          color: '#059669',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '3px'
                        }}
                        title="Doanh thu từ Giữ chỗ đã thanh toán / cọc">
                          <span style={{ color: '#64748b', fontSize: '0.68rem' }}>Đang có:</span>
                          <span style={{ fontWeight: 700 }}>{formatMoney(p.current_revenue)}</span>
                        </div>
                      </td>

                      {/* Lãi Gộp Dự Kiến (Tự tính) + Lãi gộp đang có */}
                      <td style={{ textAlign: 'right', background: '#fef9c3', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: '6px 10px' }}>
                        <div style={{ fontWeight: 800, color: '#047857', fontSize: '0.85rem' }}>
                          {formatMoney(p.expected_gross_profit)}
                        </div>
                        <div style={{
                          fontSize: '0.71rem',
                          fontWeight: 600,
                          color: '#047857',
                          marginTop: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: '3px'
                        }}
                        title="Lãi gộp theo số pax đang có">
                          <span style={{ color: '#64748b', fontSize: '0.68rem' }}>Đang có:</span>
                          <span style={{ fontWeight: 700 }}>{formatMoney(p.current_gross_profit)}</span>
                        </div>
                      </td>

                      {/* Lead Cần (Pax / CR Sale) */}
                      <td style={{ textAlign: 'right', background: '#fef9c3', fontWeight: 700, color: '#b45309', whiteSpace: 'nowrap' }}>
                        {p.required_leads}
                      </td>

                      {/* Budget Ads Dự Toán (Lead * CPL) */}
                      <td style={{ textAlign: 'right', background: '#fef9c3', fontWeight: 800, color: '#b45309', whiteSpace: 'nowrap' }}>
                        {formatMoney(p.budget_ads)}
                      </td>

                      {/* % Ads / Lãi Gộp */}
                      <td style={{
                        textAlign: 'center',
                        background: isExceeded ? '#fee2e2' : (isWarning ? '#fef3c7' : '#fef9c3'),
                        fontWeight: 800,
                        color: isExceeded ? '#b91c1c' : (isWarning ? '#b45309' : '#15803d'),
                        whiteSpace: 'nowrap'
                      }}>
                        {formatPercent(p.ads_to_profit_ratio)}
                      </td>

                      {/* Đề Xuất % MKT (Mặc định 1%) */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                          <input
                            type="number"
                            step="0.1"
                            disabled={!canEditPlan}
                            readOnly={!canEditPlan}
                            style={{
                              width: '45px',
                              textAlign: 'right',
                              padding: '3px',
                              borderRadius: '6px',
                              border: canEditPlan ? '1px solid #cbd5e1' : 'none',
                              background: canEditPlan ? 'white' : 'transparent',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              color: '#1e3989',
                              cursor: canEditPlan ? 'text' : 'default'
                            }}
                            value={(p.mkt_percentage * 100).toFixed(1)}
                            onChange={(e) => handleCellChange(p.id, 'mkt_percentage', Number(e.target.value) / 100)}
                          />
                          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>%</span>
                        </div>
                      </td>

                      {/* Chi Phí MKT Quý (1% Doanh thu) */}
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#1e3989', background: '#eff6ff', whiteSpace: 'nowrap' }}>
                        {formatMoney(p.mkt_cost)}
                      </td>

                      {/* Trạng Thái Phê Duyệt */}
                      <td style={{ textAlign: 'center', background: '#fef9c3', whiteSpace: 'nowrap' }}>
                        {canEditPlan ? (
                          <select
                            style={{
                              fontSize: '0.75rem',
                              padding: '3px 6px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontWeight: 600,
                              background: p.approval_status === 'Đã duyệt' ? '#ecfdf5' : (p.approval_status === 'Từ chối' ? '#fef2f2' : '#fffbeb'),
                              color: p.approval_status === 'Đã duyệt' ? '#047857' : (p.approval_status === 'Từ chối' ? '#b91c1c' : '#b45309'),
                              cursor: 'pointer'
                            }}
                            value={p.approval_status || 'Chờ BOD duyệt'}
                            onChange={(e) => handleCellChange(p.id, 'approval_status', e.target.value)}
                          >
                            {APPROVAL_STATUSES.map(st => (
                              <option
                                key={st.id}
                                value={st.id}
                                disabled={st.id === 'Đã duyệt' && !isAdminOrBOD}
                              >
                                {st.label} {st.id === 'Đã duyệt' && !isAdminOrBOD ? '(Chỉ BOD)' : ''}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            background: p.approval_status === 'Đã duyệt' ? '#ecfdf5' : (p.approval_status === 'Từ chối' ? '#fef2f2' : '#fffbeb'),
                            color: p.approval_status === 'Đã duyệt' ? '#047857' : (p.approval_status === 'Từ chối' ? '#b91c1c' : '#b45309')
                          }}>
                            {p.approval_status || 'Chờ BOD duyệt'}
                          </span>
                        )}
                      </td>

                      {/* Link Drive */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {p.drive_link ? (
                          <a
                            href={p.drive_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#2563eb', display: 'inline-flex', alignItems: 'center', gap: '3px', textDecoration: 'none', fontWeight: 600 }}
                            title={p.drive_link}
                          >
                            <ExternalLink size={13} /> Link
                          </a>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>-</span>
                        )}
                      </td>

                      {/* Đánh Giá Tự Tính */}
                      <td style={{ textAlign: 'center', background: '#fef9c3', whiteSpace: 'nowrap' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: isExceeded ? '#ef4444' : (isWarning ? '#f59e0b' : '#10b981'),
                          color: 'white',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}>
                          {p.evaluation}
                        </span>
                      </td>

                      {/* Thao Tác */}
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn-action btn-edit-pro"
                          onClick={() => setEditingItem(p)}
                          title="Sửa chi tiết & cấu hình nâng cao"
                          style={{ padding: '4px 7px', borderRadius: '6px' }}
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : (
        /* ================= SHEET 2: DASHBOARD TỔNG HỢP TUYẾN ================= */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
          {/* Bảng Tổng Hợp Tuyến */}
          <div className="data-table-container" style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid #e2e8f0',
            gridColumn: '1 / -1'
          }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1e3989', margin: 0 }}>
                  📊 Bảng Tổng Hợp Ngân Sách Marketing Theo Tuyến
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Tổng hợp số lịch khởi hành, doanh thu dự kiến, lãi gộp và chi phí Marketing 1% cho từng tuyến tour
                </p>
              </div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1e3989', background: '#eff6ff', padding: '5px 12px', borderRadius: '8px' }}>
                {routesSummary.length} Tuyến Tour
              </span>
            </div>

            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#1e3989', color: 'white' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', whiteSpace: 'nowrap' }}>Tuyến Tour</th>
                  <th style={{ textAlign: 'center', width: '90px', whiteSpace: 'nowrap' }}>Số Đoàn</th>
                  <th style={{ textAlign: 'right', width: '120px', whiteSpace: 'nowrap' }}>Tổng Pax Mục Tiêu</th>
                  <th style={{ textAlign: 'center', width: '110px', whiteSpace: 'nowrap' }}>Đề Xuất % MKT</th>
                  <th style={{ textAlign: 'right', width: '160px', background: '#2563eb', whiteSpace: 'nowrap' }}>Chi Phí MKT Quý (1%)</th>
                  <th style={{ textAlign: 'right', width: '170px', whiteSpace: 'nowrap' }}>Doanh Thu Dự Kiến</th>
                  <th style={{ textAlign: 'right', width: '170px', whiteSpace: 'nowrap' }}>Lãi Gộp Dự Kiến</th>
                  <th style={{ textAlign: 'right', width: '150px', whiteSpace: 'nowrap' }}>Budget Ads</th>
                  <th style={{ textAlign: 'center', width: '120px', whiteSpace: 'nowrap' }}>ADS / Lãi Gộp</th>
                  <th style={{ textAlign: 'center', width: '100px', whiteSpace: 'nowrap' }}>Chi Tiết</th>
                </tr>
              </thead>
              <tbody>
                {routesSummary.map((r, i) => {
                  const isSafe = r.ads_profit_ratio <= 0.20;
                  const isWarn = r.ads_profit_ratio > 0.20 && r.ads_profit_ratio <= 0.25;

                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #e2e8f0', background: i % 2 === 0 ? 'white' : '#f8fafc' }}>
                      <td style={{ fontWeight: 700, color: '#1e293b', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={15} color="#6366f1" />
                          <span>{r.tuyen}</span>
                        </div>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '6px' }}>
                          {r.departure_count} đoàn
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>{r.total_target_pax} pax</td>
                      <td style={{ textAlign: 'center', fontWeight: 700, color: '#1e3989', whiteSpace: 'nowrap' }}>
                        {(r.mkt_percentage * 100).toFixed(1)}%
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#1e3989', background: '#eff6ff', whiteSpace: 'nowrap' }}>
                        {formatMoney(r.total_mkt_cost)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap' }}>
                        {formatMoney(r.expected_revenue)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669', whiteSpace: 'nowrap' }}>
                        {formatMoney(r.expected_gross_profit)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#d97706', whiteSpace: 'nowrap' }}>
                        {formatMoney(r.budget_ads)}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          background: isSafe ? '#ecfdf5' : (isWarn ? '#fffbeb' : '#fef2f2'),
                          color: isSafe ? '#059669' : (isWarn ? '#d97706' : '#dc2626')
                        }}>
                          {formatPercent(r.ads_profit_ratio)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => {
                            setSearch(r.tuyen);
                            setViewMode('detailed');
                          }}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#2563eb',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 600
                          }}
                        >
                          Xem lịch &gt;
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {/* Tổng Cộng Dòng Cuối */}
                <tr style={{ background: '#1e293b', color: 'white', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                  <td style={{ padding: '12px' }}>TỔNG CỘNG HỆ THỐNG</td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{summary?.total_departures || 0} đoàn</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{summary?.total_target_pax || 0} pax</td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>1.0%</td>
                  <td style={{ textAlign: 'right', color: '#fcd34d', background: '#0f172a', whiteSpace: 'nowrap' }}>
                    {formatMoney(summary?.total_mkt_cost)}
                  </td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{formatMoney(summary?.total_revenue)}</td>
                  <td style={{ textAlign: 'right', color: '#34d399', whiteSpace: 'nowrap' }}>{formatMoney(summary?.total_gross_profit)}</td>
                  <td style={{ textAlign: 'right', color: '#fbbf24', whiteSpace: 'nowrap' }}>{formatMoney(summary?.total_budget_ads)}</td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{formatPercent(summary?.avg_ads_profit_ratio)}</td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DETAIL DRAWER (Per /scaffold-frontend-module workflow) */}
      {editingItem && (
        <DetailDrawer
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveDrawer}
          formatMoney={formatMoney}
          formatPercent={formatPercent}
          canEditPlan={canEditPlan}
          isAdminOrBOD={isAdminOrBOD}
        />
      )}
    </div>
  );
}

// Drawer Component adhering 100% to /scaffold-frontend-module
function DetailDrawer({ item, onClose, onSave, formatMoney, formatPercent, canEditPlan, isAdminOrBOD }) {
  const [formData, setFormData] = useState({
    ...item,
    target_pax: item.target_pax || 20,
    break_even_pax: item.break_even_pax || 14,
    price_per_pax: item.price_per_pax || 0,
    cost_per_pax: item.cost_per_pax || 0,
    cpl_target: item.cpl_target || 150000,
    cr_sale: item.cr_sale !== undefined ? item.cr_sale : 0.10,
    mkt_percentage: item.mkt_percentage !== undefined ? item.mkt_percentage : 0.01,
    status_text: item.status_text || 'Đang mở bán',
    approval_status: item.approval_status || 'Chờ BOD duyệt',
    notes: item.notes || '',
    drive_link: item.drive_link || 'https://drive.google.com/'
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Live Recalculations inside Drawer
  const derived = useMemo(() => {
    const target_pax = Number(formData.target_pax) || 0;
    const price_per_pax = Number(formData.price_per_pax) || 0;
    const cost_per_pax = Number(formData.cost_per_pax) || 0;
    const cpl_target = Number(formData.cpl_target) || 0;
    const cr_sale = Number(formData.cr_sale) || 0.10;
    const mkt_percentage = Number(formData.mkt_percentage) || 0.01;

    const gross_profit_per_pax = price_per_pax - cost_per_pax;
    const expected_revenue = target_pax * price_per_pax;
    const expected_gross_profit = target_pax * gross_profit_per_pax;
    const required_leads = cr_sale > 0 ? Math.ceil(target_pax / cr_sale) : 0;
    const budget_ads = required_leads * cpl_target;
    const ads_to_profit_ratio = expected_gross_profit > 0 ? budget_ads / expected_gross_profit : 0;
    const mkt_cost = Math.round(expected_revenue * mkt_percentage);

    let evaluation = 'An toàn';
    if (ads_to_profit_ratio > 0.25) evaluation = 'VƯỢT TRẦN';
    else if (ads_to_profit_ratio > 0.20) evaluation = 'Cận trần';

    return {
      gross_profit_per_pax,
      expected_revenue,
      expected_gross_profit,
      required_leads,
      budget_ads,
      ads_to_profit_ratio,
      mkt_cost,
      evaluation
    };
  }, [formData]);

  return (
    <div className="glass-modal-overlay" onClick={onClose}>
      <div
        className="drawer-content slide-in-right"
        onClick={e => e.stopPropagation()}
        style={{ width: '850px', maxWidth: '92vw', background: 'white' }}
      >
        {/* Drawer Header */}
        <div
          className="drawer-header"
          style={{
            padding: '1.25rem 2rem',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            position: 'sticky',
            top: 0,
            zIndex: 10
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#1e3989', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>
                {formData.bu_id}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                {formData.tuyen}
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Mã lịch: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formData.departure_code}</span> • Ngày: {formData.departure_date ? new Date(formData.departure_date).toLocaleDateString('vi-VN') : '-'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'white',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body Area */}
        <div className="drawer-body" style={{ padding: '1.75rem 2rem', height: 'calc(100% - 150px)', overflowY: 'auto' }}>
          {/* Live Calculated Metric Cards Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #fef9c3 0%, #fffbeb 100%)',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '1.25rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>
                ⚡ KẾT QUẢ TÍNH TOÁN TỰ ĐỘNG (LIVE RECALCULATION)
              </span>
              <span style={{
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                background: derived.evaluation === 'VƯỢT TRẦN' ? '#ef4444' : (derived.evaluation === 'Cận trần' ? '#f59e0b' : '#10b981'),
                color: 'white'
              }}>
                {derived.evaluation}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                <div style={{ fontSize: '0.7rem', color: '#78350f', fontWeight: 600 }}>DOANH THU DỰ KIẾN</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e3989', marginTop: '2px', whiteSpace: 'nowrap' }}>{formatMoney(derived.expected_revenue)}</div>
              </div>
              <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                <div style={{ fontSize: '0.7rem', color: '#78350f', fontWeight: 600 }}>LÃI GỘP DỰ KIẾN</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', marginTop: '2px', whiteSpace: 'nowrap' }}>{formatMoney(derived.expected_gross_profit)}</div>
              </div>
              <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                <div style={{ fontSize: '0.7rem', color: '#78350f', fontWeight: 600 }}>LEAD CẦN & ADS</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706', marginTop: '2px', whiteSpace: 'nowrap' }}>{derived.required_leads} lead • {formatMoney(derived.budget_ads)}</div>
              </div>
              <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #fef08a' }}>
                <div style={{ fontSize: '0.7rem', color: '#78350f', fontWeight: 600 }}>CHI PHÍ MKT (1%)</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#2563eb', marginTop: '2px', whiteSpace: 'nowrap' }}>{formatMoney(derived.mkt_cost)}</div>
              </div>
            </div>
          </div>

          {/* Thực tế từ Giữ chỗ (Đã thanh toán / cọc) */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#166534' }}>
                🟢 THỰC TẾ TỪ GIỮ CHỖ (ĐÃ THANH TOÁN / CỌC):
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
              <span style={{ color: '#15803d' }}>
                Pax hiện có: <strong>{item.current_pax || 0}</strong> / {formData.target_pax} ({item.pax_completion_rate || 0}%)
              </span>
              <span style={{ color: '#15803d' }}>
                Doanh thu: <strong>{formatMoney(item.current_revenue)}</strong>
              </span>
              <span style={{ color: '#15803d' }}>
                Lãi gộp: <strong>{formatMoney(item.current_gross_profit)}</strong>
              </span>
            </div>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            {/* Pax mục tiêu */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                PAX MỤC TIÊU (SỐ KHÁCH) *
              </label>
              <input
                type="number"
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}
                value={formData.target_pax}
                onChange={(e) => handleChange('target_pax', Number(e.target.value))}
              />
            </div>

            {/* Pax hòa vốn */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                PAX HÒA VỐN *
              </label>
              <input
                type="number"
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                value={formData.break_even_pax}
                onChange={(e) => handleChange('break_even_pax', Number(e.target.value))}
              />
            </div>

            {/* Giá bán / khách */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                GIÁ BÁN / KHÁCH (VNĐ) *
              </label>
              <input
                type="text"
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#1e3989' }}
                value={formatNumberWithDots(formData.price_per_pax)}
                onChange={(e) => handleChange('price_per_pax', parseNumberFromDots(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>= {formatMoney(formData.price_per_pax)}</span>
            </div>

            {/* Giá vốn / khách */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                GIÁ VỐN / KHÁCH (VNĐ) *
              </label>
              <input
                type="text"
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}
                value={formatNumberWithDots(formData.cost_per_pax)}
                onChange={(e) => handleChange('cost_per_pax', parseNumberFromDots(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>= {formatMoney(formData.cost_per_pax)}</span>
            </div>

            {/* CPL Kỳ Vọng */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                CPL KỲ VỌNG (CHI PHÍ / 1 LEAD CÓ SĐT)
              </label>
              <input
                type="text"
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                value={formatNumberWithDots(formData.cpl_target)}
                onChange={(e) => handleChange('cpl_target', parseNumberFromDots(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>= {formatMoney(formData.cpl_target)} / Lead</span>
            </div>

            {/* CR Sale dự kiến */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                CR SALE DỰ KIẾN (TỶ LỆ CHỐT LEAD THÀNH KHÁCH)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1"
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  value={formData.cr_sale}
                  onChange={(e) => handleChange('cr_sale', Number(e.target.value))}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                  {(formData.cr_sale * 100).toFixed(0)}%
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Mặc định: 10% (10 Lead có 1 khách)</span>
            </div>

            {/* Đề xuất % Marketing */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                ĐỀ XUẤT % MARKETING (QUY ĐỊNH: 1% DOANH THU)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 700, color: '#1e3989' }}
                  value={(formData.mkt_percentage * 100).toFixed(1)}
                  onChange={(e) => handleChange('mkt_percentage', Number(e.target.value) / 100)}
                />
                <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>%</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Chi phí MKT: {formatMoney(derived.mkt_cost)}</span>
            </div>

            {/* Trạng thái phê duyệt */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                TRẠNG THÁI PHÊ DUYỆT CỦA BAN GIÁM ĐỐC
              </label>
              <select
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}
                value={formData.approval_status}
                onChange={(e) => handleChange('approval_status', e.target.value)}
              >
                {APPROVAL_STATUSES.map(st => (
                  <option
                    key={st.id}
                    value={st.id}
                    disabled={st.id === 'Đã duyệt' && !isAdminOrBOD}
                  >
                    {st.label} {st.id === 'Đã duyệt' && !isAdminOrBOD ? '(Chỉ BOD)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Tình trạng đoàn */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                TÌNH TRẠNG ĐOÀN
              </label>
              <select
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                value={formData.status_text}
                onChange={(e) => handleChange('status_text', e.target.value)}
              >
                {TOUR_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Link Google Drive */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                LINK DRIVE DỰ TOÁN CHI TIẾT
              </label>
              <input
                type="text"
                style={{ width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                placeholder="https://drive.google.com/..."
                value={formData.drive_link}
                onChange={(e) => handleChange('drive_link', e.target.value)}
              />
            </div>

            {/* Ghi chú / Đề xuất */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px', display: 'block' }}>
                GHI CHÚ / ĐỀ XUẤT CHO ĐỘI NGŨ MARKETING & SALE
              </label>
              <textarea
                rows="3"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                placeholder="Thông tin cần lưu ý hoặc đề xuất về ngân sách, cách chạy Ads, giá vé máy bay..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Drawer Footer Buttons */}
        <div
          className="drawer-footer"
          style={{
            padding: '1.25rem 2rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            background: 'white',
            position: 'sticky',
            bottom: 0,
            zIndex: 10
          }}
        >
          <button className="btn-pro-cancel" onClick={onClose}>
            {canEditPlan ? 'Hủy bỏ' : 'Đóng'}
          </button>
          {canEditPlan && (
            <button
              className="btn-pro-save"
              onClick={() => onSave(formData)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={18} /> Lưu Dữ Liệu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
