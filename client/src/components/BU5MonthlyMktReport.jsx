import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Sliders,
  Download,
  RotateCcw,
  Save,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  PieChart,
  BarChart3,
  Flame,
  Info,
  Compass,
  ArrowUpRight,
  Eye,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

import {
  BU5_PRODUCTS_CATALOG,
  BU5_RAW_DEPARTURES,
  TIMELINE_MONTHS,
  calculateBU5MonthlySchedule,
  addMonthsToKey,
  getCategoryBadgeStyle
} from '../data/bu5MarketingMasterPlan';

// Helper format tiền tệ VNĐ: 32.000.000 đ
const fmt = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 đ';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' đ';
};

// Format số tiền gọn gàng tiếng Việt: 1049 triệu, 2.1 triệu
const fmtShort = (val) => {
  if (!val || isNaN(val)) return '-';
  const num = Number(val);
  if (num === 0) return '-';
  if (num >= 1000000) {
    const m = (num / 1000000).toFixed(1);
    const cleanM = m.endsWith('.0') ? m.slice(0, -2) : m;
    return `${cleanM} triệu`;
  }
  if (num >= 1000) {
    return Math.round(num / 1000) + 'k';
  }
  return String(num);
};

// Format tiền tỷ gọn gàng: 31.65 Tỷ
const fmtBillion = (val) => {
  if (!val || isNaN(val)) return '0 Tỷ';
  return (Number(val) / 1000000000).toFixed(2) + ' Tỷ';
};

// Format tiền triệu gọn gàng: 316.5 triệu
const fmtMillion = (val) => {
  if (!val || isNaN(val)) return '0 triệu';
  const num = (Number(val) / 1000000).toFixed(1);
  const clean = num.endsWith('.0') ? num.slice(0, -2) : num;
  return `${clean} triệu`;
};

export default function BU5MonthlyMktReport({ currentUser = null }) {
  // View mode: 'matrix' | 'executive' | 'monthly' | 'leadtime' | 'chart'
  const [viewMode, setViewMode] = useState('matrix'); // Mặc định mở Bảng Tính Ma Trận (Spreadsheet-First)

  // Filter & Search
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculation parameters
  const [yearScope, setYearScope] = useState('2027'); // Mặc định tập trung vào năm 2027 theo yêu cầu
  const [showPrepMonths2026, setShowPrepMonths2026] = useState(true);
  const [mktRatio, setMktRatio] = useState(0.01); // 1% Doanh thu
  const [distributionMode, setDistributionMode] = useState('even'); // 'even' | 'funnel'
  const [leadOverrides, setLeadOverrides] = useState({});
  const [selectedMonthDrilldown, setSelectedMonthDrilldown] = useState('2027-02'); // Tháng mặc định soi chi tiết

  // Loading & Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [hasSavedSettings, setHasSavedSettings] = useState(false);

  // Accordion state cho 4 Quý trong Executive View (mặc định mở Quý 4/2026 để giải trình chạy trước)
  const [expandedQuarterIds, setExpandedQuarterIds] = useState({ 'Q4_2026': true });

  // 1. Tải cài đặt đã lưu từ Backend (nếu có)
  useEffect(() => {
    let isMounted = true;
    const fetchSavedSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get('/api/marketing-budget-plan/bu5-monthly-schedule', authHeaders);
        if (res.data?.success && res.data.settings && isMounted) {
          const s = res.data.settings;
          if (s.leadOverrides) setLeadOverrides(s.leadOverrides);
          if (s.mktRatio) setMktRatio(s.mktRatio);
          if (s.distributionMode) setDistributionMode(s.distributionMode);
          if (s.yearScope) setYearScope(s.yearScope);
          setHasSavedSettings(true);
        }
      } catch (err) {
        console.warn('Không tải được saved settings BU5 (sẽ dùng mặc định):', err.message);
      }
    };
    fetchSavedSettings();
    return () => { isMounted = false; };
  }, []);

  // 2. Chạy Calculation Engine
  const calculationResult = useMemo(() => {
    return calculateBU5MonthlySchedule({
      leadOverrides,
      mktRatio,
      distributionMode,
      yearFilter: yearScope,
      showPrepMonths2026
    });
  }, [leadOverrides, mktRatio, distributionMode, yearScope, showPrepMonths2026]);

  const {
    departures,
    timelineMonths,
    monthlyTotals,
    monthlyDepartureRevenues,
    monthlyDeparturesCount,
    monthlyActiveTours,
    kpis
  } = calculationResult;

  // Lọc danh sách departures theo bộ lọc
  const filteredDepartures = useMemo(() => {
    return departures.filter(dep => {
      if (selectedCategory !== 'ALL' && dep.category !== selectedCategory) return false;
      if (selectedProduct !== 'ALL' && dep.productKey !== selectedProduct) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = dep.name.toLowerCase().includes(q);
        const inProd = (dep.prod?.name || '').toLowerCase().includes(q);
        const inTime = dep.displayTime.toLowerCase().includes(q);
        if (!inName && !inProd && !inTime) return false;
      }
      return true;
    });
  }, [departures, selectedCategory, selectedProduct, searchQuery]);

  // 1. Dữ liệu tổng hợp theo 4 Quý (Quarterly Grouping cho Executive View)
  const quarterlyData = useMemo(() => {
    const q4_26 = {
      id: 'Q4_2026',
      label: 'Quý 4/2026 (Chuẩn Bị)',
      badge: 'Chạy Trước',
      badgeColor: '#d97706',
      badgeBg: '#fef3c7',
      months: ['2026-09', '2026-10', '2026-11', '2026-12'],
      mkt: 0,
      rev: 0,
      groups: 0,
      tag: 'Gieo hạt & Gom khách Tết, Visa Murmansk/Alaska'
    };
    const q1_27 = {
      id: 'Q1_2027',
      label: 'Quý 1/2027 (Đỉnh MKT)',
      badge: 'Đỉnh MKT',
      badgeColor: '#dc2626',
      badgeBg: '#fee2e2',
      months: ['2027-01', '2027-02', '2027-03'],
      mkt: 0,
      rev: 0,
      groups: 0,
      tag: 'Đỉnh điểm MKT T2 & Gặt hái 8 đoàn Tết/Xuân'
    };
    const q2_27 = {
      id: 'Q2_2027',
      label: 'Quý 2/2027 (Gối Đầu Hè)',
      badge: 'Giữ Nhịp',
      badgeColor: '#2563eb',
      badgeBg: '#dbeafe',
      months: ['2027-04', '2027-05', '2027-06'],
      mkt: 0,
      rev: 0,
      groups: 0,
      tag: 'Chốt khách 30/4 & Khởi động hè Mông Cổ'
    };
    const q34_27 = {
      id: 'Q34_2027',
      label: 'Quý 3-4/2027 (Đỉnh Thu & Đóng Sổ)',
      badge: 'Đỉnh Thu',
      badgeColor: '#16a34a',
      badgeBg: '#dcfce7',
      months: ['2027-07', '2027-08', '2027-09', '2027-10'],
      mkt: 0,
      rev: 0,
      groups: 0,
      tag: 'Thu 18.2 Tỷ (Nam Mỹ, Namibia, Mông Cổ Naadam)'
    };

    const quarters = [q4_26, q1_27, q2_27, q34_27];

    quarters.forEach(q => {
      q.months.forEach(m => {
        q.mkt += (monthlyTotals[m] || 0);
        q.rev += (monthlyDepartureRevenues[m] || 0);
        q.groups += (monthlyDeparturesCount[m] || 0);
      });

      // 1. Danh sách các tour ĐANG CHI TIỀN MKT trong quý này (Cash-Out)
      const mktToursList = [];
      departures.forEach(dep => {
        if (dep.groupsCount > 0 && dep.monthlyAllocations) {
          const mktInQ = q.months.reduce((sum, m) => sum + (dep.monthlyAllocations[m] || 0), 0);
          if (mktInQ > 0) {
            mktToursList.push({
              stt: dep.stt,
              name: dep.name,
              category: dep.category,
              departureMonth: dep.departureMonth,
              leadMonths: dep.leadMonths,
              groupsCount: dep.groupsCount,
              totalPax: dep.totalPax,
              mktInQ,
              totalMktBudget: dep.mktBudget,
              pctOfTourMkt: dep.mktBudget > 0 ? Math.round((mktInQ / dep.mktBudget) * 100) : 0,
              pctOfQuarterMkt: q.mkt > 0 ? ((mktInQ / q.mkt) * 100).toFixed(1) : '0.0'
            });
          }
        }
      });
      q.mktTours = mktToursList.sort((a, b) => b.mktInQ - a.mktInQ);

      // 2. Danh sách các đoàn THỰC TẾ KHỞI HÀNH trong quý này (Cash-In)
      q.departingTours = departures
        .filter(dep => dep.groupsCount > 0 && q.months.includes(dep.departureMonth))
        .map(dep => ({
          stt: dep.stt,
          name: dep.name,
          category: dep.category,
          departureMonth: dep.departureMonth,
          groupsCount: dep.groupsCount,
          totalPax: dep.totalPax,
          revenue: dep.revenue,
          grossProfit: dep.grossProfit,
          pricePerPax: dep.pricePerPax
        }))
        .sort((a, b) => b.revenue - a.revenue);

      q.grossProfit = q.departingTours.reduce((sum, d) => sum + (d.grossProfit || 0), 0);
    });

    return quarters;
  }, [departures, monthlyTotals, monthlyDepartureRevenues, monthlyDeparturesCount]);

  // 2. Dữ liệu tổng hợp 10 Tuyến Sản Phẩm (Pareto ranking cho Executive View)
  const productAggregates = useMemo(() => {
    const map = {};
    departures.forEach(dep => {
      if (!map[dep.productKey]) {
        map[dep.productKey] = {
          key: dep.productKey,
          name: dep.name,
          category: dep.category,
          groups: 0,
          pax: 0,
          revenue: 0,
          grossProfit: 0,
          mktBudget: 0,
          pricePerPax: dep.pricePerPax,
          icon: dep.prod?.icon || '🧭',
          leadMonths: dep.leadMonths,
          startMonth: dep.startMonth
        };
      }
      map[dep.productKey].groups += dep.groupsCount;
      map[dep.productKey].pax += dep.totalPax;
      map[dep.productKey].revenue += dep.revenue;
      map[dep.productKey].grossProfit += dep.grossProfit;
      map[dep.productKey].mktBudget += dep.mktBudget;
    });

    return Object.values(map)
      .filter(p => p.groups > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [departures]);

  // Handler cập nhật Lead Time cho 1 tour (1 -> 10 tháng)
  const handleUpdateLeadTime = (stt, newMonths) => {
    const val = Math.min(10, Math.max(1, parseInt(newMonths, 10) || 1));
    setLeadOverrides(prev => ({
      ...prev,
      [stt]: val
    }));
  };

  // Khôi phục mặc định Google Sheet
  const handleResetToDefault = () => {
    Swal.fire({
      title: 'Khôi phục mặc định?',
      text: 'Số tháng chạy trước sẽ được thiết lập lại theo đúng kế hoạch triển khai của Google Sheet!',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0f172a',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đồng ý khôi phục',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        setLeadOverrides({});
        setMktRatio(0.01);
        setDistributionMode('even');
        Swal.fire({
          icon: 'success',
          title: 'Đã khôi phục mặc định',
          timer: 1500,
          showConfirmButton: false
        });
      }
    });
  };

  // Lưu cấu hình vào Hệ thống
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post('/api/marketing-budget-plan/bu5-monthly-schedule/save-settings', {
        leadOverrides,
        mktRatio,
        distributionMode,
        notes: `Cập nhật ngày ${new Date().toLocaleDateString('vi-VN')}`
      }, authHeaders);

      setHasSavedSettings(true);
      Swal.fire({
        icon: 'success',
        title: 'Đã lưu cấu hình thành công!',
        text: 'Cấu hình phân bổ dòng tiền MKT BU5 đã được lưu vào cơ sở dữ liệu hệ thống CRM.',
        confirmButtonColor: '#0f172a'
      });
    } catch (err) {
      console.error('Lưu cấu hình thất bại:', err);
      Swal.fire({
        icon: 'error',
        title: 'Không thể lưu cấu hình',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Xuất file Excel (.xlsx) chuẩn chỉnh
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Ma trận MKT theo 15 tháng
      const matrixHeaders = [
        'STT', 'Tuyến / Sản phẩm', 'Mùa / Dịp', 'Khởi hành', 'Số đoàn', 'Số khách', 
        'Giá bán/khách', 'Doanh thu kế hoạch', 'Ngân sách MKT (1%)', 'Chạy trước (Tháng)', 'Bắt đầu truyền thông',
        ...timelineMonths.map(tm => tm.fullLabel)
      ];

      const matrixRows = departures.map(dep => {
        const row = [
          dep.stt,
          dep.name,
          dep.season,
          dep.displayTime,
          dep.groupsCount,
          dep.totalPax,
          dep.pricePerPax,
          dep.revenue,
          dep.mktBudget,
          dep.leadMonths,
          dep.startMonth
        ];
        timelineMonths.forEach(tm => {
          row.push(dep.monthlyAllocations[tm.key] || 0);
        });
        return row;
      });

      // Dòng tổng
      const totalRow = [
        'TỔNG',
        'TOÀN BỘ BU5',
        '',
        '',
        kpis.totalGroups,
        kpis.totalPax,
        '',
        kpis.totalRevenue,
        kpis.totalMktBudget,
        `${kpis.avgLeadMonths} tháng (TB)`,
        ''
      ];
      timelineMonths.forEach(tm => {
        totalRow.push(monthlyTotals[tm.key] || 0);
      });
      matrixRows.push(totalRow);

      const wsMatrix = XLSX.utils.aoa_to_sheet([matrixHeaders, ...matrixRows]);
      XLSX.utils.book_append_sheet(wb, wsMatrix, 'Ma Trận Dòng Tiền MKT');

      // Sheet 2: Báo cáo tổng hợp theo tháng
      const monthlySummaryHeaders = [
        'Tháng', 'Kinh phí MKT Dự kiến (VNĐ)', 'Doanh thu Khởi hành Trong Tháng', 'Số Đoàn Khởi Hành', 'Số Tour Đang Chạy Ads'
      ];
      const monthlySummaryRows = timelineMonths.map(tm => [
        tm.fullLabel,
        monthlyTotals[tm.key] || 0,
        monthlyDepartureRevenues[tm.key] || 0,
        monthlyDeparturesCount[tm.key] || 0,
        (monthlyActiveTours[tm.key] || []).length
      ]);
      const wsMonthly = XLSX.utils.aoa_to_sheet([monthlySummaryHeaders, ...monthlySummaryRows]);
      XLSX.utils.book_append_sheet(wb, wsMonthly, 'Dòng Tiền Theo Tháng');

      const fileSuffix = yearScope === '2027' ? 'Ke_Hoach_2027' : 'Toan_Bo_2026_2027';
      XLSX.writeFile(wb, `BU5_Bao_Cao_Kinh_Phi_MKT_${fileSuffix}.xlsx`);
    } catch (err) {
      console.error('Lỗi xuất Excel:', err);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi xuất file Excel',
        text: err.message
      });
    }
  };

  return (
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#0f172a', padding: '0 0 20px 0' }}>
      
      {/* ── TOOLBAR ĐIỀU KHIỂN CHUẨN GOOGLE SHEETS ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '10px',
        padding: '12px 18px',
        border: '1px solid #e2e8f0',
        marginBottom: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Nhóm nút chọn View Mode */}
        <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
          <button
            onClick={() => setViewMode('matrix')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '5px',
              fontSize: '0.84rem',
              fontWeight: viewMode === 'matrix' ? 700 : 500,
              border: 'none',
              background: viewMode === 'matrix' ? '#0f172a' : 'transparent',
              color: viewMode === 'matrix' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            Bảng Tính Ma Trận (15 Tháng)
          </button>

          <button
            onClick={() => setViewMode('executive')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '5px',
              fontSize: '0.84rem',
              fontWeight: viewMode === 'executive' ? 700 : 500,
              border: 'none',
              background: viewMode === 'executive' ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'transparent',
              color: viewMode === 'executive' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={14} color={viewMode === 'executive' ? '#ffffff' : '#0284c7'} />
            Bản Trình Sếp (Executive)
          </button>

          <button
            onClick={() => setViewMode('leadtime')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '5px',
              fontSize: '0.84rem',
              fontWeight: viewMode === 'leadtime' ? 700 : 500,
              border: 'none',
              background: viewMode === 'leadtime' ? '#0f172a' : 'transparent',
              color: viewMode === 'leadtime' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <SlidersHorizontal size={14} />
            Cài Đặt Chạy Trước
          </button>

          <button
            onClick={() => setViewMode('chart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '5px',
              fontSize: '0.84rem',
              fontWeight: viewMode === 'chart' ? 700 : 500,
              border: 'none',
              background: viewMode === 'chart' ? '#0f172a' : 'transparent',
              color: viewMode === 'chart' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <BarChart3 size={14} />
            Biểu Đồ Dòng Tiền
          </button>
        </div>

        {/* Tùy chọn & In PDF */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Checkbox 4 tháng chuẩn bị cuối 2026 */}
          <label style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.82rem', 
            color: '#334155', 
            cursor: 'pointer', 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0',
            padding: '5px 10px', 
            borderRadius: '6px' 
          }}>
            <input
              type="checkbox"
              checked={showPrepMonths2026}
              onChange={(e) => setShowPrepMonths2026(e.target.checked)}
              style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#0284c7' }}
            />
            <span>Hiện 4 tháng chuẩn bị cuối 2026 (<strong>{fmtShort(kpis.mktPrepIn2026)}</strong>)</span>
          </label>

          {/* Nút In / Xuất PDF A4 */}
          <button
            onClick={() => window.print()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              fontSize: '0.84rem',
              fontWeight: 700,
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
            }}
            title="In hoặc lưu PDF chuẩn A4 gửi Ban Giám Đốc"
          >
            <Download size={14} />
            In / Xuất PDF
          </button>
        </div>
      </div>

      {/* ── 3.5. VIEW 0: BẢN TRÌNH BAN GIÁM ĐỐC (EXECUTIVE SUMMARY) ── */}
      {viewMode === 'executive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* KHỐI 1: 4 THẺ CHỈ SỐ SỐNG CÒN (BIG NUMBERS 30 GIÂY) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
              borderLeft: '5px solid #38bdf8'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: '6px' }}>
                DOANH THU 2027
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                {fmtBillion(kpis.totalRevenue)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', whiteSpace: 'nowrap' }}>
                <strong>27 Đoàn</strong> • <strong>270 Khách VIP</strong> (24 đợt)
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #e2e8f0',
              borderLeft: '5px solid #10b981',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>
                LÃI GỘP 2027
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#10b981', whiteSpace: 'nowrap' }}>
                {fmtBillion(kpis.totalGrossProfit)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap' }}>
                Biên lợi nhuận gộp đạt <strong>{kpis.grossMarginPercent}%</strong>
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #e2e8f0',
              borderLeft: '5px solid #0284c7',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px' }}>
                TỔNG BUDGET MKT 2027 (1%)
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#0284c7', whiteSpace: 'nowrap' }}>
                {fmtMillion(kpis.totalMktBudget)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '6px', whiteSpace: 'nowrap' }}>
                Chuẩn định mức <strong>1.00% Doanh Thu</strong> ({fmt(kpis.totalMktBudget)})
              </div>
            </div>

            <div style={{
              background: '#fffbeb',
              borderRadius: '12px',
              padding: '18px 20px',
              border: '1px solid #fef3c7',
              borderLeft: '5px solid #d97706',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#92400e', marginBottom: '6px' }}>
                CHẠY TRƯỚC CUỐI 2026
              </div>
              <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#d97706', whiteSpace: 'nowrap' }}>
                {fmtMillion(kpis.prep2026Budget)}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#92400e', marginTop: '6px', whiteSpace: 'nowrap' }}>
                Chiếm <strong>28.6%</strong> (Gom khách Tết &amp; Visa Murmansk)
              </div>
            </div>
          </div>

          {/* KHỐI 2: TOP 3 TRỤ CỘT DOANH THU (PARETO 44.2%) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  TOP 3 TUYẾN TRỤ CỘT (Gánh 44.2% Doanh Thu Toàn BU5)
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Quy luật Pareto: Tập trung bảo vệ 3 tuyến này đảm bảo 13.98 Tỷ doanh thu &amp; 1.95 Tỷ lãi gộp
                </span>
              </div>
              <span style={{
                background: '#eff6ff',
                color: '#1e40af',
                fontSize: '0.78rem',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: '20px',
                border: '1px solid #bfdbfe'
              }}>
                Tổng 3 Tuyến: 13.98 Tỷ DT • 139.8 triệu MKT
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {productAggregates.slice(0, 3).map((prod, idx) => {
                const ranks = ['#1', '#2', '#3'];
                const pct = ((prod.revenue / (kpis.totalRevenue || 1)) * 100).toFixed(1);
                return (
                  <div key={prod.key} style={{
                    background: idx === 0 ? '#f0f9ff' : (idx === 1 ? '#f0fdf4' : '#faf5ff'),
                    border: `1px solid ${idx === 0 ? '#bae6fd' : (idx === 1 ? '#bbf7d0' : '#e9d5ff')}`,
                    borderRadius: '10px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                        <span style={{ color: idx === 0 ? '#0284c7' : (idx === 1 ? '#16a34a' : '#8b5cf6'), marginRight: '6px' }}>{ranks[idx]}</span>
                        {prod.name}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', background: '#ffffff', border: '1px solid #e2e8f0' }}>
                        {pct}% DT
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#475569', marginBottom: '4px' }}>
                      <span>Quy mô: <strong>{prod.groups} đoàn</strong> ({prod.pax} pax)</span>
                      <span>Giá: <strong>{fmtShort(prod.pricePerPax)}</strong>/pax</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 800, marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(0,0,0,0.1)' }}>
                      <span style={{ color: '#0284c7' }}>DT: {fmtBillion(prod.revenue)}</span>
                      <span style={{ color: '#16a34a' }}>Lãi: {fmtBillion(prod.grossProfit)}</span>
                      <span style={{ color: '#d97706' }}>MKT: {fmtMillion(prod.mktBudget)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KHỐI 3: BẢNG ĐỐI XỨNG DÒNG TIỀN 4 QUÝ (CASH-IN VS CASH-OUT) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  CÂN ĐỐI DÒNG TIỀN THEO 4 QUÝ CHIẾN LƯỢC (Tiền Chi MKT vs Doanh Thu Thu Về)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Bấm vào từng Quý hoặc nút bên phải để mở rộng xem các dòng tour con chi tiết (Tiền chi MKT vs Đoàn khởi hành).
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const allExpanded = quarterlyData.every(q => expandedQuarterIds[q.id]);
                  if (allExpanded) {
                    setExpandedQuarterIds({});
                  } else {
                    const next = {};
                    quarterlyData.forEach(q => { next[q.id] = true; });
                    setExpandedQuarterIds(next);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#334155',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {quarterlyData.every(q => expandedQuarterIds[q.id]) ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {quarterlyData.every(q => expandedQuarterIds[q.id]) ? 'Thu gọn tất cả chi tiết' : 'Mở rộng tất cả dòng tour con'}
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '6px 0 0 0' }}>GIAI ĐOẠN / QUÝ</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>SỐ THÁNG</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>TIỀN CHI MKT (CASH-OUT)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>DOANH THU THU VỀ (CASH-IN)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>ĐOÀN KHỞI HÀNH</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left', borderRadius: '0 6px 0 0' }}>ĐÁNH GIÁ CÂN ĐỐI DÒNG TIỀN</th>
                  </tr>
                </thead>
                <tbody>
                  {quarterlyData.map((q, idx) => {
                    const isExpanded = !!expandedQuarterIds[q.id];
                    const mktPercent = ((q.mkt / (kpis.totalMktBudget || 1)) * 100).toFixed(1);
                    return (
                      <React.Fragment key={q.id}>
                        <tr
                          onClick={() => setExpandedQuarterIds(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                          style={{
                            borderBottom: isExpanded ? 'none' : '1px solid #e2e8f0',
                            background: isExpanded ? '#f0f9ff' : (idx % 2 === 0 ? '#ffffff' : '#f8fafc'),
                            cursor: 'pointer',
                            transition: 'background 0.15s ease'
                          }}
                        >
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: isExpanded ? '#0284c7' : '#94a3b8' }}>
                                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </span>
                              <div>
                                <div style={{ fontWeight: 800, color: '#0f172a' }}>{q.label}</div>
                                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '2px' }}>
                                  <span style={{ fontSize: '0.72rem', color: q.badgeColor, background: q.badgeBg, padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                    {q.badge}
                                  </span>
                                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                    ({q.mktTours.length} tour MKT • {q.groups} đoàn KH)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>
                            {q.months.length} tháng
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>
                              {fmtMillion(q.mkt)}
                            </span>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{mktPercent}% ngân sách</div>
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: q.rev > 0 ? '#10b981' : '#94a3b8' }}>
                              {q.rev > 0 ? fmtBillion(q.rev) : '0 VNĐ'}
                            </span>
                            {q.grossProfit > 0 && (
                              <div style={{ fontSize: '0.72rem', color: '#16a34a' }}>Lãi: {fmtBillion(q.grossProfit)}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                            {q.groups > 0 ? `${q.groups} đoàn` : '0 đoàn'}
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.8rem', color: '#475569' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{q.tag}</span>
                              <span style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>
                                {isExpanded ? 'Đóng ▲' : 'Xem chi tiết ▼'}
                              </span>
                            </div>
                          </td>
                        </tr>

                        {/* ACCORDION CHI TIẾT DÒNG TOUR CON CỦA QUÝ */}
                        {isExpanded && (
                          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                            <td colSpan={6} style={{ padding: '16px 20px' }}>
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
                                gap: '16px'
                              }}>
                                {/* CỘT TRÁI: TIỀN RA (CHI MKT) */}
                                <div style={{
                                  background: '#ffffff',
                                  border: '1px solid #bfdbfe',
                                  borderRadius: '10px',
                                  padding: '14px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                    <div>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                                        Tiền Chi MKT (Cash-Out): {fmtMillion(q.mkt)}
                                      </div>
                                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                        {q.mktTours.length} chiến dịch tour đang giải ngân ngân sách trong quý
                                      </div>
                                    </div>
                                    <span style={{ fontSize: '0.72rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                      {mktPercent}% Quỹ 2027
                                    </span>
                                  </div>

                                  <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                      <thead>
                                        <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                          <th style={{ padding: '6px 8px', textAlign: 'left' }}>Tuyến Tour</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'center' }}>Tháng KH</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'center' }}>Chạy Trước</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>MKT Trong Quý</th>
                                          <th style={{ padding: '6px 8px', textAlign: 'right' }}>% Quý</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {q.mktTours.map((tour) => (
                                          <tr key={`${q.id}_mkt_${tour.stt}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '7px 8px', fontWeight: 700, color: '#0f172a' }}>
                                              {tour.name}
                                            </td>
                                            <td style={{ padding: '7px 8px', textAlign: 'center', color: '#0369a1', fontWeight: 600 }}>
                                              {tour.departureMonth}
                                            </td>
                                            <td style={{ padding: '7px 8px', textAlign: 'center', color: '#64748b' }}>
                                              {tour.leadMonths}T
                                            </td>
                                            <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                                              {fmtMillion(tour.mktInQ)}
                                            </td>
                                            <td style={{ padding: '7px 8px', textAlign: 'right', color: '#64748b' }}>
                                              {tour.pctOfQuarterMkt}%
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>

                                {/* CỘT PHẢI: TIỀN VÀO (DOANH THU & ĐOÀN KHỞI HÀNH) */}
                                <div style={{
                                  background: '#ffffff',
                                  border: '1px solid #bbf7d0',
                                  borderRadius: '10px',
                                  padding: '14px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                                    <div>
                                      <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>
                                        Doanh Thu Thu Về (Cash-In): {q.rev > 0 ? fmtBillion(q.rev) : '0 VNĐ'}
                                      </div>
                                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                        {q.departingTours.length > 0 ? `${q.groups} đoàn khởi hành (${q.departingTours.length} tuyến)` : 'Giai đoạn chuẩn bị (chưa khởi hành)'}
                                      </div>
                                    </div>
                                    {q.rev > 0 && (
                                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                                        Lãi gộp: {fmtBillion(q.grossProfit)}
                                      </span>
                                    )}
                                  </div>

                                  {q.departingTours.length === 0 ? (
                                    <div style={{
                                      background: '#fffbeb',
                                      border: '1px solid #fef3c7',
                                      borderRadius: '8px',
                                      padding: '16px',
                                      color: '#92400e',
                                      fontSize: '0.8rem',
                                      lineHeight: 1.55
                                    }}>
                                      <strong>Giai đoạn gieo hạt &amp; chuẩn bị:</strong> Chưa có đoàn khởi hành trong quý này. Toàn bộ <strong>{fmtMillion(q.mkt)}</strong> chi trước dùng để chạy chiến dịch quảng cáo gom khách tour Tết (Ai Cập, Maroc, Nga Murmansk) và chuẩn bị hồ sơ visa dài hạn (Alaska, Nam Mỹ). Doanh thu tương ứng sẽ được gặt hái vào các quý năm 2027.
                                    </div>
                                  ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                                        <thead>
                                          <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                                            <th style={{ padding: '6px 8px', textAlign: 'left' }}>Đoàn Khởi Hành</th>
                                            <th style={{ padding: '6px 8px', textAlign: 'center' }}>Tháng KH</th>
                                            <th style={{ padding: '6px 8px', textAlign: 'center' }}>Quy Mô</th>
                                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Doanh Thu</th>
                                            <th style={{ padding: '6px 8px', textAlign: 'right' }}>Lãi Gộp</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {q.departingTours.map((tour) => (
                                            <tr key={`${q.id}_dep_${tour.stt}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                              <td style={{ padding: '7px 8px', fontWeight: 700, color: '#0f172a' }}>
                                                {tour.name}
                                              </td>
                                              <td style={{ padding: '7px 8px', textAlign: 'center', color: '#166534', fontWeight: 600 }}>
                                                {tour.departureMonth}
                                              </td>
                                              <td style={{ padding: '7px 8px', textAlign: 'center', color: '#475569' }}>
                                                {tour.groupsCount} đoàn ({tour.totalPax} pax)
                                              </td>
                                              <td style={{ padding: '7px 8px', textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>
                                                {fmtBillion(tour.revenue)}
                                              </td>
                                              <td style={{ padding: '7px 8px', textAlign: 'right', color: '#0284c7', fontWeight: 600 }}>
                                                {fmtBillion(tour.grossProfit)}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <tr style={{ background: '#f1f5f9', fontWeight: 900, borderTop: '2px solid #0f172a' }}>
                    <td style={{ padding: '12px 14px', color: '#0f172a' }}>TỔNG CỘNG CẢ NĂM 2027</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>15 tháng</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0284c7', fontSize: '1rem' }}>
                      {fmtMillion(kpis.totalMktBudget)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#10b981', fontSize: '1rem' }}>
                      {fmtBillion(kpis.totalRevenue)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#0f172a', fontSize: '1rem' }}>
                      {kpis.totalGroups} đoàn
                    </td>
                    <td style={{ padding: '12px 14px', color: '#15803d', fontSize: '0.85rem' }}>
                      ✔ Đúng chuẩn định mức 1.00% Doanh Thu
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 4: BẢNG 10 TUYẾN SẢN PHẨM RÚT GỌN (COMPACT PORTFOLIO) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '20px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
          }}>
            <div style={{ marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                  BẢNG 10 TUYẾN SẢN PHẨM BU5 NĂM 2027 (Đơn Vị Rút Gọn Tỷ / Triệu)
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Sắp xếp theo thứ tự doanh thu đóng góp từ cao đến thấp
                </span>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '2px solid #e2e8f0', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'center', width: '50px' }}>Hạng</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tuyến Sản Phẩm</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Phân Loại</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Số Đoàn</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Số Pax</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Giá Vé / Pax</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Doanh Thu (Tỷ)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Lãi Gộp (Tỷ)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>MKT 1% (Tr)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', width: '180px' }}>Tỷ Trọng Doanh Thu</th>
                  </tr>
                </thead>
                <tbody>
                  {productAggregates.map((prod, idx) => {
                    const badgeStyle = getCategoryBadgeStyle(prod.category);
                    const revPct = ((prod.revenue / (kpis.totalRevenue || 1)) * 100);
                    return (
                      <tr key={prod.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 800, color: idx < 3 ? '#0284c7' : '#94a3b8' }}>
                          #{idx + 1}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                          {prod.name}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: badgeStyle.bg,
                            color: badgeStyle.text,
                            border: `1px solid ${badgeStyle.border}`
                          }}>
                            {prod.category}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                          {prod.groups}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>
                          {prod.pax}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>
                          {fmtShort(prod.pricePerPax)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>
                          {fmtBillion(prod.revenue)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                          {fmtBillion(prod.grossProfit)}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#d97706' }}>
                          {fmtMillion(prod.mktBudget)}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              flex: 1,
                              height: '8px',
                              background: '#f1f5f9',
                              borderRadius: '4px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                width: `${Math.min(100, (revPct / 16) * 100)}%`,
                                height: '100%',
                                background: idx < 3 ? 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)' : '#94a3b8',
                                borderRadius: '4px'
                              }} />
                            </div>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', width: '38px', textAlign: 'right' }}>
                              {revPct.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#f8fafc', fontWeight: 900, borderTop: '2px solid #0f172a' }}>
                    <td colSpan={3} style={{ padding: '12px 14px', color: '#0f172a' }}>TỔNG CỘNG CẢ NĂM 2027</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#0f172a' }}>{kpis.totalGroups}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{kpis.totalPax}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#64748b' }}>—</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0284c7', fontSize: '0.95rem' }}>{fmtBillion(kpis.totalRevenue)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#16a34a', fontSize: '0.95rem' }}>{fmtBillion(kpis.totalGrossProfit)}</td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#d97706', fontSize: '0.95rem' }}>{fmtMillion(kpis.totalMktBudget)}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>100.0% Doanh Thu</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 5: PHIẾU TRÌNH BAN GIÁM ĐỐC PHÊ DUYỆT */}
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
          }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
              3 ĐỀ XUẤT HÀNH ĐỘNG KÍNH TRÌNH BAN GIÁM ĐỐC:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0284c7', marginBottom: '4px' }}>
                  1. Duyệt Định Mức 1% Doanh Thu
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  Khống chế ngân sách MKT cả năm 2027 ở mức <strong>316.460.000 VNĐ</strong> theo tiến độ khởi hành 27 đoàn.
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#d97706', marginBottom: '4px' }}>
                  2. Cấp Hạn Mức Tạm Ứng Quý 4/2026
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  Cho phép ứng trước <strong>90.439.620 VNĐ</strong> để gom khách tour Tết và nộp hồ sơ Visa Murmansk, Alaska, Nam Mỹ trước 5-9 tháng.
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#16a34a', marginBottom: '4px' }}>
                  3. Theo Dõi Realtime & Cắt Lỗ Cuốn Chiếu
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  Toàn bộ chi phí phân bổ theo từng tháng độc lập, tự động điều chỉnh nếu tiến độ cọc thực tế có thay đổi.
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── 4. VIEW 1: BẢNG MA TRẬN 15 THÁNG (HEATMAP MATRIX) ── */}
      {viewMode === 'matrix' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Header giải thích */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                Bảng Ma Trận Ngân Sách Marketing {yearScope === '2027' ? 'Kế Hoạch 2027 (Theo Từng Tháng)' : '15 Tháng (08/2026 – 10/2027)'}
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                {yearScope === '2027'
                  ? `Ma trận phân bổ kinh phí MKT 1% doanh thu cho ${kpis.totalGroups} đoàn năm 2027, bao gồm các tháng chạy trước cuối 2026 để chuẩn bị tour Tết & đón đầu cọc.`
                  : 'Mỗi ô thể hiện số tiền kinh phí MKT (1% doanh thu) phân bổ vào tháng đó. Ô đậm hơn tương ứng số tiền chi lớn hơn.'
                }
              </p>
            </div>

            {/* Chú thích màu Heatmap */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
              <span>Mức chi:</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#eff6ff', border: '1px solid #bfdbfe' }} /> &lt;3 triệu
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dbeafe', border: '1px solid #93c5fd' }} /> 3 - 6 triệu
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#bfdbfe', border: '1px solid #60a5fa' }} /> 6 - 10 triệu
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fef3c7', border: '1px solid #fcd34d' }} /> &gt;10 triệu
              </span>
            </div>
          </div>

          {/* Table container cuộn ngang */}
          <div style={{ overflowX: 'auto', maxHeight: '720px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#0f172a', color: '#ffffff' }}>
                <tr>
                  <th style={{ padding: '12px 10px', width: '38px', textAlign: 'center', borderRight: '1px solid #1e293b' }}>#</th>
                  <th style={{ padding: '12px 12px', minWidth: '190px', borderRight: '1px solid #1e293b' }}>Tuyến / Sản Phẩm</th>
                  <th style={{ padding: '12px 10px', width: '85px', textAlign: 'center', borderRight: '1px solid #1e293b' }}>Khởi Hành</th>
                  <th style={{ padding: '12px 8px', width: '55px', textAlign: 'center', borderRight: '1px solid #1e293b' }}>Đoàn</th>
                  <th style={{ padding: '12px 10px', width: '115px', textAlign: 'right', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>Doanh Thu</th>
                  <th style={{ padding: '12px 10px', width: '95px', textAlign: 'right', borderRight: '1px solid #1e293b', background: '#1e293b', color: '#38bdf8' }}>MKT 1%</th>
                  <th style={{ padding: '12px 8px', width: '80px', textAlign: 'center', borderRight: '2px solid #334155' }}>Chạy Trước</th>
                  
                  {/* Cột Tháng (Phân biệt tháng chuẩn bị cuối 2026 vs dòng tiền 2027) */}
                  {timelineMonths.map(tm => {
                    const isPrepMonth = tm.year === 2026;
                    return (
                      <th 
                        key={tm.key} 
                        style={{ 
                          padding: '10px 8px', 
                          minWidth: '78px', 
                          textAlign: 'center', 
                          borderRight: '1px solid #1e293b',
                          background: tm.key === selectedMonthDrilldown ? '#0284c7' : (isPrepMonth ? '#1e293b' : '#0f172a'),
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          setSelectedMonthDrilldown(tm.key);
                          setViewMode('monthly');
                        }}
                        title={`Bấm để xem chi tiết ${tm.fullLabel}${isPrepMonth ? ' (Giai đoạn chạy trước cuối 2026 chuẩn bị cho 2027)' : ''}`}
                      >
                        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: isPrepMonth ? '#fbbf24' : '#ffffff' }}>
                          {tm.label}
                        </div>
                        <div style={{ fontSize: '0.62rem', color: isPrepMonth ? '#fcd34d' : '#94a3b8' }}>
                          {isPrepMonth ? 'Chạy trước' : tm.quarter}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {filteredDepartures.map((dep, rIdx) => {
                  const isZeroGroup = dep.groupsCount === 0;
                  return (
                    <tr 
                      key={dep.stt}
                      style={{
                        background: isZeroGroup ? '#f8fafc' : (rIdx % 2 === 0 ? '#ffffff' : '#fcfcfd'),
                        opacity: isZeroGroup ? 0.6 : 1,
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                        {dep.stt}
                      </td>

                      <td style={{ padding: '10px 12px', borderRight: '1px solid #f1f5f9' }}>
                        {/* Hàng 1: Tên sản phẩm + Badge nằm cùng 1 hàng */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 700, color: isZeroGroup ? '#64748b' : '#0f172a', fontSize: '0.85rem' }}>
                            {dep.prod?.icon} {dep.name}
                          </span>
                          {dep.category && (() => {
                            const badgeStyle = getCategoryBadgeStyle(dep.category);
                            return (
                              <span style={{ 
                                background: badgeStyle.bg, 
                                color: badgeStyle.text,
                                border: `1px solid ${badgeStyle.border}`,
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                whiteSpace: 'nowrap'
                              }}>
                                {dep.category}
                              </span>
                            );
                          })()}
                        </div>

                        {/* Hàng 2: Text mô tả nằm bên dưới */}
                        {dep.note && (
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', lineHeight: 1.35 }}>
                            • {dep.note}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                        {dep.displayTime}
                      </td>

                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: isZeroGroup ? '#94a3b8' : '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                        {dep.groupsCount > 0 ? dep.groupsCount : '-'}
                      </td>

                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: isZeroGroup ? '#94a3b8' : '#1e293b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {dep.revenue > 0 ? fmtShort(dep.revenue) : '-'}
                      </td>

                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: isZeroGroup ? '#94a3b8' : '#0284c7', background: '#f8fafc', borderRight: '1px solid #f1f5f9' }}>
                        {dep.mktBudget > 0 ? fmt(dep.mktBudget) : '-'}
                      </td>

                      <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '2px solid #e2e8f0' }}>
                        <span 
                          onClick={() => {
                            setViewMode('leadtime');
                          }}
                          style={{
                            background: dep.leadMonths >= 7 ? '#fef3c7' : (dep.leadMonths >= 4 ? '#eff6ff' : '#ecfdf5'),
                            color: dep.leadMonths >= 7 ? '#92400e' : (dep.leadMonths >= 4 ? '#1e40af' : '#065f46'),
                            padding: '3px 7px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-block'
                          }}
                          title={`Click để chỉnh số tháng chạy trước (hiện tại: ${dep.leadMonths} tháng, bắt đầu từ ${dep.startMonth})`}
                        >
                          {dep.leadMonths}T
                        </span>
                      </td>

                      {/* 15 Ô Phân bổ theo từng tháng */}
                      {timelineMonths.map(tm => {
                        const amount = dep.monthlyAllocations[tm.key] || 0;
                        const hasBudget = amount > 0;
                        
                        // Tính màu nền Heatmap
                        let cellBg = 'transparent';
                        let textColor = '#cbd5e1';
                        let cellBorder = '1px solid #f8fafc';

                        if (hasBudget) {
                          if (amount >= 10000000) {
                            cellBg = '#fef3c7'; // Vàng đậm
                            textColor = '#92400e';
                            cellBorder = '1px solid #fcd34d';
                          } else if (amount >= 6000000) {
                            cellBg = '#bfdbfe'; // Xanh đậm
                            textColor = '#1e3a8a';
                            cellBorder = '1px solid #93c5fd';
                          } else if (amount >= 3000000) {
                            cellBg = '#dbeafe'; // Xanh vừa
                            textColor = '#1d4ed8';
                            cellBorder = '1px solid #bfdbfe';
                          } else {
                            cellBg = '#eff6ff'; // Xanh nhạt
                            textColor = '#2563eb';
                            cellBorder = '1px solid #dbeafe';
                          }
                        }

                        // Kiểm tra nếu đây chính là tháng khởi hành
                        const isDepMonth = dep.departureMonth === tm.key;

                        return (
                          <td
                            key={tm.key}
                            style={{
                              padding: '8px 6px',
                              textAlign: 'right',
                              fontSize: '0.78rem',
                              fontWeight: hasBudget ? 700 : 400,
                              background: cellBg,
                              color: textColor,
                              borderRight: '1px solid #f1f5f9',
                              position: 'relative'
                            }}
                            title={hasBudget ? `${dep.name}\nTháng: ${tm.fullLabel}\nKinh phí MKT: ${fmt(amount)}\nKhởi hành: ${dep.displayTime}` : ''}
                          >
                            {hasBudget ? (
                              <span>{fmtShort(amount)}</span>
                            ) : (
                              isDepMonth ? (
                                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>✈️ Khởi hành</span>
                              ) : (
                                <span style={{ color: '#e2e8f0' }}>·</span>
                              )
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>

              {/* DÒNG CỐ ĐỊNH TỔNG KẾT DÒNG TIỀN THEO THÁNG */}
              <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 10, background: '#0f172a', color: '#ffffff' }}>
                {/* 1. Tổng kinh phí MKT chi ra trong tháng */}
                <tr style={{ borderTop: '2px solid #38bdf8' }}>
                  <td colSpan={6} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, fontSize: '0.88rem', color: '#38bdf8' }}>
                    TỔNG KINH PHÍ MKT GIẢI NGÂN THEO THÁNG (1% DT):
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#94a3b8', fontSize: '0.75rem' }}>
                    100%
                  </td>
                  {timelineMonths.map(tm => {
                    const total = monthlyTotals[tm.key] || 0;
                    return (
                      <td 
                        key={tm.key}
                        style={{
                          padding: '12px 8px',
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          color: total >= 30000000 ? '#fde047' : (total > 0 ? '#ffffff' : '#64748b'),
                          background: tm.key === selectedMonthDrilldown ? '#0284c7' : '#0f172a',
                          borderRight: '1px solid #1e293b'
                        }}
                      >
                        {total > 0 ? fmtShort(total) : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Doanh thu khởi hành thực tế trong tháng để đối chiếu */}
                <tr style={{ background: '#1e293b', borderTop: '1px solid #334155' }}>
                  <td colSpan={6} style={{ padding: '8px 14px', textAlign: 'right', fontWeight: 600, fontSize: '0.78rem', color: '#cbd5e1' }}>
                    Doanh thu các đoàn khởi hành trong tháng:
                  </td>
                  <td style={{ padding: '8px 8px', textAlign: 'center', color: '#94a3b8', fontSize: '0.72rem' }}>
                    34.8 Tỷ
                  </td>
                  {timelineMonths.map(tm => {
                    const depRev = monthlyDepartureRevenues[tm.key] || 0;
                    return (
                      <td 
                        key={tm.key}
                        style={{
                          padding: '8px 8px',
                          textAlign: 'right',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          color: depRev > 0 ? '#34d399' : '#64748b',
                          borderRight: '1px solid #334155',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {depRev > 0 ? fmtShort(depRev) : '-'}
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Tỷ trọng MKT / Doanh thu khởi hành tháng */}
                <tr style={{ background: '#090d16', borderTop: '1px solid #1e293b' }}>
                  <td colSpan={7} style={{ padding: '6px 14px', textAlign: 'right', fontWeight: 500, fontSize: '0.72rem', color: '#94a3b8' }}>
                    Số lượng tour chạy Ads trong tháng:
                  </td>
                  {timelineMonths.map(tm => {
                    const activeCount = (monthlyActiveTours[tm.key] || []).length;
                    return (
                      <td 
                        key={tm.key}
                        style={{
                          padding: '6px 8px',
                          textAlign: 'right',
                          fontSize: '0.72rem',
                          color: activeCount > 0 ? '#93c5fd' : '#475569',
                          borderRight: '1px solid #1e293b'
                        }}
                      >
                        {activeCount > 0 ? `${activeCount} tour` : '-'}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* ── 5. VIEW 2: SOI CHI TIẾT TỪNG THÁNG (MONTHLY DRILL-DOWN) ── */}
      {viewMode === 'monthly' && (
        <div>
          {/* Thanh cuộn chọn tháng */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '12px',
            marginBottom: '20px'
          }}>
            {timelineMonths.map(tm => {
              const isSelected = tm.key === selectedMonthDrilldown;
              const amount = monthlyTotals[tm.key] || 0;
              const toursCount = (monthlyActiveTours[tm.key] || []).length;

              return (
                <button
                  key={tm.key}
                  onClick={() => setSelectedMonthDrilldown(tm.key)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    background: isSelected ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#0f172a',
                    cursor: 'pointer',
                    minWidth: '120px',
                    textAlign: 'left',
                    boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: isSelected ? '#38bdf8' : '#64748b' }}>
                    {tm.quarter} • {tm.label}
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, margin: '4px 0 2px 0' }}>
                    {fmtShort(amount)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isSelected ? '#cbd5e1' : '#64748b' }}>
                    {toursCount} tour chạy Ads
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chi tiết tháng đang chọn */}
          {(() => {
            const currentMonthObj = timelineMonths.find(m => m.key === selectedMonthDrilldown) || timelineMonths[0];
            const currentMonthBudget = monthlyTotals[selectedMonthDrilldown] || 0;
            const toursInMonth = monthlyActiveTours[selectedMonthDrilldown] || [];
            const depRevenue = monthlyDepartureRevenues[selectedMonthDrilldown] || 0;
            const depsCount = monthlyDeparturesCount[selectedMonthDrilldown] || 0;

            return (
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
              }}>
                {/* Header chi tiết tháng */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '16px',
                  paddingBottom: '20px',
                  borderBottom: '1px solid #e2e8f0',
                  marginBottom: '24px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Báo Cáo Chi Tiết Ngân Sách
                    </span>
                    <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                      {currentMonthObj.fullLabel}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    <div style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tổng Ngân Sách MKT Cần Chi:</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7' }}>{fmt(currentMonthBudget)}</div>
                    </div>

                    <div style={{ background: '#f8fafc', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Doanh Thu Khởi Hành Tháng:</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>{fmt(depRevenue)} ({depsCount} đoàn)</div>
                    </div>
                  </div>
                </div>

                {/* Danh sách tour chạy Ads trong tháng này */}
                {toursInMonth.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <Info size={32} style={{ margin: '0 auto 10px auto', color: '#94a3b8' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Không có chiến dịch Marketing nào cần giải ngân trong tháng này.</div>
                    <div style={{ fontSize: '0.85rem' }}>Các tour đều đã kết thúc hoặc chưa đến chu kỳ mở truyền thông.</div>
                  </div>
                ) : (
                  <div>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>
                      Danh Sách {toursInMonth.length} Tour Đang Chạy Chiến Dịch Quảng Cáo Trong {currentMonthObj.fullLabel}:
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {toursInMonth.map((t, idx) => {
                        const prod = BU5_PRODUCTS_CATALOG[t.productKey] || {};
                        const tourBudgetShare = currentMonthBudget > 0 ? ((t.amount / currentMonthBudget) * 100).toFixed(1) : 0;
                        const depMonthStr = t.depMonth;

                        return (
                          <div
                            key={idx}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '16px 20px',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              gap: '16px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                background: prod.badgeBg || '#e0f2fe',
                                color: prod.badgeText || '#0369a1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.25rem'
                              }}>
                                {prod.icon || '✈️'}
                              </div>

                              <div>
                                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                                  #{t.departureStt} • {t.tourName}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '10px', marginTop: '3px' }}>
                                  <span>✈️ Khởi hành: <strong>{depMonthStr}</strong> ({t.groupsCount} đoàn)</span>
                                  <span>•</span>
                                  <span>⏱️ Chạy trước: <strong>{t.leadMonths} tháng</strong></span>
                                  <span>•</span>
                                  <span>Doanh thu tour: {fmtShort(t.totalRevenue)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Số tiền và tỷ trọng */}
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                                {fmt(t.amount)}
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '2px' }}>
                                Chiếm {tourBudgetShare}% ngân sách tháng
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── 6. VIEW 3: CÀI ĐẶT CHẠY TRƯỚC 1 - 10 THÁNG (LEAD TIME MANAGER) ── */}
      {viewMode === 'leadtime' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                Bộ Quản Trị Chu Kỳ Truyền Thông & Số Tháng Chạy Trước (Lead Time Manager)
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                Điều chỉnh số tháng chạy quảng cáo trước khi tour khởi hành (từ 1 đến 10 tháng). Khi thay đổi, dòng tiền giải ngân các tháng sẽ tự động tính toán lại tức thì.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveSettings}
                disabled={isSaving}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                <Save size={14} />
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>

              <button
                onClick={handleResetToDefault}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} />
                Về Mặc Định Sheet
              </button>
            </div>
          </div>

          {/* Grid các tour để điều chỉnh */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '14px' }}>
            {departures.filter(d => d.groupsCount > 0).map(dep => {
              const currentLead = dep.leadMonths;
              const prod = dep.prod || {};

              return (
                <div
                  key={dep.stt}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                        #{dep.stt} • {dep.name}
                      </div>
                      <span style={{
                        background: '#e0f2fe',
                        color: '#0369a1',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {dep.groupsCount} đoàn • {dep.displayTime}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '12px' }}>
                      Doanh thu: {fmtShort(dep.revenue)} | Ngân sách 1% MKT: <strong style={{ color: '#0284c7' }}>{fmt(dep.mktBudget)}</strong>
                    </div>
                  </div>

                  {/* Thanh trượt điều chỉnh Lead Time (1 - 10 tháng) */}
                  <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                        Số tháng chạy trước:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleUpdateLeadTime(dep.stt, currentLead - 1)}
                          disabled={currentLead <= 1}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            cursor: currentLead <= 1 ? 'not-allowed' : 'pointer',
                            fontWeight: 700
                          }}
                        >
                          -
                        </button>
                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', minWidth: '32px', textAlign: 'center' }}>
                          {currentLead} T
                        </span>
                        <button
                          onClick={() => handleUpdateLeadTime(dep.stt, currentLead + 1)}
                          disabled={currentLead >= 10}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            border: '1px solid #cbd5e1',
                            background: '#f8fafc',
                            cursor: currentLead >= 10 ? 'not-allowed' : 'pointer',
                            fontWeight: 700
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={currentLead}
                      onChange={(e) => handleUpdateLeadTime(dep.stt, e.target.value)}
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        accentColor: '#0284c7'
                      }}
                    />

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                      <span>Bắt đầu chạy: <strong style={{ color: '#0284c7' }}>{dep.startMonth}</strong></span>
                      <span>Mỗi tháng: <strong>{fmtShort(Math.round(dep.mktBudget / currentLead))}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 7. VIEW 4: BIỂU ĐỒ & VISUAL TIMELINE ── */}
      {viewMode === 'chart' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
            Biểu Đồ Phân Bổ Ngân Sách Marketing 15 Tháng (08/2026 - 10/2027)
          </h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '0.85rem', color: '#64748b' }}>
            Minh họa trực quan độ cao của dòng tiền MKT theo từng tháng, giúp Ban Lãnh Đạo chuẩn bị nguồn vốn dự phòng hợp lý.
          </p>

          {/* Bar Chart CSS mượt mà */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '260px', paddingBottom: '30px', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
            {/* Trục mức đỉnh */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'flex-end' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: '#ffffff', padding: '0 4px' }}>Đỉnh: {fmtShort(kpis.peakMonthAmount)}</span>
            </div>

            {timelineMonths.map(tm => {
              const amount = monthlyTotals[tm.key] || 0;
              const maxAmount = kpis.peakMonthAmount || 1;
              const heightPercent = Math.max(4, Math.round((amount / maxAmount) * 100));
              const isPeak = amount === kpis.peakMonthAmount && amount > 0;

              return (
                <div
                  key={tm.key}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    position: 'relative'
                  }}
                >
                  {/* Nhãn giá trị trên đầu cột */}
                  {amount > 0 && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isPeak ? '#d97706' : '#0f172a', marginBottom: '6px' }}>
                      {fmtShort(amount)}
                    </span>
                  )}

                  {/* Cột Bar */}
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${heightPercent}%`,
                      background: isPeak 
                        ? 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)' 
                        : (amount > 0 ? 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)' : '#f1f5f9'),
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease',
                      boxShadow: amount > 0 ? '0 2px 4px rgba(2, 132, 199, 0.2)' : 'none'
                    }}
                    title={`${tm.fullLabel}: ${fmt(amount)}`}
                  />

                  {/* Nhãn tháng dưới chân cột */}
                  <div style={{ position: 'absolute', bottom: '-24px', fontSize: '0.72rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
                    {tm.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Phân tích nhận định chuyên sâu */}
          <div style={{ marginTop: '36px', background: '#f8fafc', padding: '16px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} color="#0284c7" /> Nhận Định Chiến Lược Ngân Sách MKT BU5 (2026 - 2027):
            </h4>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
              <li>
                <strong>Giai đoạn T9/2026 - T02/2027:</strong> Ngân sách duy trì ở mức cao (~28 - 35 triệu/tháng) do đồng thời mở chiến dịch cho Ai Cập, Maroc mùa thu, 3 đoàn Cực quang Nga tháng 2 và kích hoạt sớm các tour đường xa (Alaska, Nam Mỹ, Pakistan hoa).
              </li>
              <li>
                <strong>Tháng 02/2027 là đỉnh điểm chi tiêu ({fmt(kpis.peakMonthAmount)}):</strong> Giai đoạn này là điểm giao thoa giữa chiến dịch chốt cọc cao điểm cho Ai Cập/Maroc 30/4 và bắt đầu truyền thông mạnh mẽ cho mùa hè Mông Cổ & Trung Á.
              </li>
              <li>
                <strong>Tour Nam Mỹ & Alaska:</strong> Cần chạy trước 7-9 tháng nhằm phục vụ quy trình xin Visa phức tạp và tâm lý chốt vé sớm của phân khúc khách hàng cao cấp chi từ 200 - 330 triệu/tour.
              </li>
              <li>
                <strong>Bảo toàn định mức 1%:</strong> Toàn bộ 30 đoàn được khống chế trong đúng 1% doanh thu ({fmt(kpis.totalMktBudget)}), bảo vệ biên lợi nhuận ròng của BU5 ở mức bền vững.
              </li>
            </ul>
          </div>
        </div>
      )}

    </div>
  );
}
