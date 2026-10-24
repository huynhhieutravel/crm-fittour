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

// Format số tiền gọn gàng dạng triệu: 32.5M
const fmtShort = (val) => {
  if (!val || isNaN(val)) return '-';
  const num = Number(val);
  if (num === 0) return '-';
  if (num >= 1000000) {
    const m = (num / 1000000).toFixed(1);
    return (m.endsWith('.0') ? m.slice(0, -2) : m) + 'M';
  }
  if (num >= 1000) {
    return Math.round(num / 1000) + 'k';
  }
  return String(num);
};

export default function BU5MonthlyMktReport({ currentUser = null }) {
  // View mode: 'matrix' | 'monthly' | 'leadtime' | 'chart'
  const [viewMode, setViewMode] = useState('matrix');

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
    <div style={{ fontFamily: 'Inter, -apple-system, sans-serif', color: '#0f172a', padding: '0 0 40px 0' }}>
      
      {/* ── 1. HEADER BANNER CHUYÊN NGHIỆP ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        borderRadius: '16px',
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-40px',
          width: '260px',
          height: '260px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(15, 23, 42, 0) 70%)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                border: '1px solid rgba(56, 189, 248, 0.3)'
              }}>
                Master Plan 2027 (BU5)
              </span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid rgba(16, 185, 129, 0.3)'
              }}>
                Định Mức 1% Doanh Thu (316.5M)
              </span>
              <span style={{
                background: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                padding: '4px 12px',
                borderRadius: '999px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid rgba(245, 158, 11, 0.3)'
              }}>
                27 Đoàn Khởi Hành Năm 2027
              </span>
            </div>

            <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Báo Cáo Dự Toán &amp; Dòng Tiền Marketing BU5 Năm 2027 (Theo Từng Tháng)
            </h1>
            <p style={{ margin: 0, fontSize: '0.95rem', color: '#cbd5e1', maxWidth: '850px', lineHeight: 1.5 }}>
              Mô hình hóa chi tiết ngân sách Marketing 1% doanh thu cho 27 đoàn năm 2027 theo từng tháng độc lập (không gộp năm), phân bổ dựa trên thời gian chạy truyền thông trước 1 đến 10 tháng theo đặc thù từng tuyến độc bản (Alaska, Nam Mỹ, Mông Cổ, Nga, Pakistan...). Đồng bộ 100% với Google Sheet của BU5.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <a
              href="https://docs.google.com/spreadsheets/d/10kuQXdFgFLVSRS4CbKYa-ozuch6RnPJd8NTo36fFhrc/edit?usp=sharing"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 15px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                backdropFilter: 'blur(4px)',
                transition: 'all 0.2s ease'
              }}
            >
              <ExternalLink size={15} />
              Mở Google Sheet
            </a>

            <button
              onClick={handleExportExcel}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 15px',
                background: '#10b981',
                border: 'none',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <Download size={15} />
              Xuất Excel (.xlsx)
            </button>
          </div>
        </div>

        {/* Thanh trạng thái kế hoạch 2027 & Checkbox chạy trước cuối 2026 */}
        <div style={{
          marginTop: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.28)',
          padding: '12px 16px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.12)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e2e8f0', fontSize: '0.86rem' }}>
            <span style={{ 
              background: '#0284c7', 
              color: '#ffffff', 
              padding: '2px 8px', 
              borderRadius: '4px', 
              fontSize: '0.75rem', 
              fontWeight: 800 
            }}>
              KẾ HOẠCH NĂM 2027
            </span>
            <span>
              <strong>27 Đoàn Khởi Hành</strong> • Doanh thu: <strong>31.65 Tỷ</strong> • Quỹ MKT (1%): <strong>316.46M</strong>
            </span>
          </div>

          {/* Toggle các tháng chuẩn bị cuối 2026 (T09-T12/26) */}
          <label style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '8px', 
            fontSize: '0.82rem', 
            color: '#e2e8f0', 
            cursor: 'pointer', 
            background: 'rgba(255, 255, 255, 0.08)', 
            padding: '6px 12px', 
            borderRadius: '6px' 
          }}>
            <input
              type="checkbox"
              checked={showPrepMonths2026}
              onChange={(e) => setShowPrepMonths2026(e.target.checked)}
              style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#38bdf8' }}
            />
            <span>Bao gồm 4 tháng chạy trước cuối 2026 (T09-T12/26: <strong style={{ color: '#38bdf8' }}>{fmtShort(kpis.mktPrepIn2026)}</strong> chuẩn bị tour Tết 2027)</span>
          </label>
        </div>

        {/* Thông tin chốt từ Sheet */}
        <div style={{
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.15)',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}>
          <div>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Tổng quy mô:</span> {kpis.totalGroups} đoàn • {kpis.totalPax} khách (10 khách/đoàn)
          </div>
          <div>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Doanh thu kế hoạch:</span> {fmt(kpis.totalRevenue)}
          </div>
          <div>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Ngân sách MKT (1%):</span> <strong style={{ color: '#38bdf8' }}>{fmt(kpis.totalMktBudget)}</strong>
          </div>
          <div>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Chu kỳ triển khai:</span> {timelineMonths.length} tháng ({timelineMonths[0]?.fullLabel} - {timelineMonths[timelineMonths.length - 1]?.fullLabel})
          </div>
        </div>
      </div>

      {/* ── 2. KPI SUMMARY CARDS (ĐỒNG BỘ ĐỘNG THEO PHẠM VI 2027) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        {/* Card 1: Tổng Ngân Sách MKT */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              {yearScope === '2027' ? 'Tổng MKT Kế Hoạch 2027 (1%)' : 'Tổng Ngân Sách MKT (1%)'}
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {fmt(kpis.totalMktBudget)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>
              Chuẩn 1.00% của {fmt(kpis.totalRevenue)} ({kpis.totalGroups} đoàn)
            </div>
          </div>
        </div>

        {/* Card 2: Dòng tiền MKT chi trong năm 2027 hoặc Bình quân / tháng */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              {yearScope === '2027' ? 'Chi Trong Năm 2027 (T1-T10)' : 'Chi Phí MKT Bình Quân / Tháng'}
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em' }}>
              {yearScope === '2027' ? fmt(kpis.mktIn2027Only) : fmt(kpis.avgMonthlyMkt)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
              {yearScope === '2027' 
                ? `Chiếm ${((kpis.mktIn2027Only / (kpis.totalMktBudget || 1)) * 100).toFixed(1)}% tổng ngân sách 2027`
                : `Trải đều qua ${timelineMonths.length} tháng phát sinh chi phí`
              }
            </div>
          </div>
        </div>

        {/* Card 3: Chạy trước cuối 2026 hoặc Tháng Cao Điểm Nhất */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              {yearScope === '2027' ? 'Chạy Trước Cuối 2026 (T9-T12)' : 'Tháng Chi Tiêu Đỉnh Điểm (Peak)'}
            </span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
              {yearScope === '2027' ? <Clock size={18} /> : <Flame size={18} />}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: yearScope === '2027' ? '#d97706' : '#d97706', letterSpacing: '-0.02em' }}>
              {yearScope === '2027' ? fmt(kpis.mktPrepIn2026) : fmt(kpis.peakMonthAmount)}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 600, marginTop: '4px' }}>
              {yearScope === '2027'
                ? `Chiếm ${((kpis.mktPrepIn2026 / (kpis.totalMktBudget || 1)) * 100).toFixed(1)}% (gom khách Tết T2 & visa)`
                : `Rơi vào ${kpis.peakMonthKey} (nhiều tour lớn)`
              }
            </div>
          </div>
        </div>

        {/* Card 4: Quy mô hoặc thời gian chạy trước bình quân */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Thời Gian Chạy Trước TB</span>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {kpis.avgLeadMonths} Tháng
            </div>
            <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 600, marginTop: '4px' }}>
              Biên độ tùy chỉnh: 1 đến 10 tháng
            </div>
          </div>
        </div>
      </div>

      {/* ── 2.5 STRATEGIC INSIGHT BOX: BÀI TOÁN CHUẨN BỊ 2027 ── */}
      {yearScope === '2027' && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%)',
          border: '1px solid #a7f3d0',
          borderRadius: '12px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          gap: '16px',
          alignItems: 'flex-start'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: '#10b981',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            <Sparkles size={20} />
          </div>
          <div style={{ fontSize: '0.88rem', color: '#064e3b', lineHeight: 1.6 }}>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#065f46', marginBottom: '4px' }}>
              Chiến Lược Dòng Tiền & Kế Hoạch Chuẩn Bị Cho 2027 (Ngân sách MKT 1% = {fmt(kpis.totalMktBudget)}):
            </div>
            <div style={{ marginBottom: '4px' }}>
              • <strong>Kế hoạch thuần 2027:</strong> Tập trung vận hành <strong>27 đoàn</strong> (270 khách mục tiêu), doanh thu <strong>{fmt(kpis.totalRevenue)}</strong> (~31.65 Tỷ). Định mức kinh phí Marketing 1% là <strong>{fmt(kpis.totalMktBudget)}</strong>.
            </div>
            <div style={{ marginBottom: '4px' }}>
              • <strong>Bắt buộc giải ngân {fmt(kpis.mktPrepIn2026)} (28.6%) ngay từ cuối năm 2026 (T09-T12/2026):</strong> Do các tuyến đầu năm 2027 (Ai Cập Tết T2, Maroc Tết T2, 3 đoàn săn Cực quang Nga T2, 2 đoàn Pakistan mùa hoa T3) cần thời gian truyền thông 4-6 tháng để gom khách và làm thủ tục visa, dòng tiền MKT bắt buộc phải chi trước từ quý IV/2026.
            </div>
            <div>
              • <strong>Dòng tiền giải ngân trong năm 2027 ({fmt(kpis.mktIn2027Only)} - 71.4%):</strong> Rải đều qua các tháng T1-T10/2027, đạt đỉnh điểm chi tiêu vào <strong>Tháng 02/2027 ({fmt(kpis.peakMonthAmount)})</strong> khi đồng thời chạy chiến dịch cho Lễ 30/4, Hè Mông Cổ và Trung Á.
            </div>
          </div>
        </div>
      )}

      {/* ── 3. TOOLBAR ĐIỀU KHIỂN & BỘ LỌC ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid #e2e8f0',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Nhóm nút chọn View Mode */}
        <div style={{ display: 'flex', gap: '6px', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('matrix')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: viewMode === 'matrix' ? 700 : 500,
              border: 'none',
              background: viewMode === 'matrix' ? '#0f172a' : 'transparent',
              color: viewMode === 'matrix' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} />
            Ma Trận 15 Tháng
          </button>

          <button
            onClick={() => setViewMode('monthly')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: viewMode === 'monthly' ? 700 : 500,
              border: 'none',
              background: viewMode === 'monthly' ? '#0f172a' : 'transparent',
              color: viewMode === 'monthly' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <Eye size={14} />
            Soi Chi Tiết Từng Tháng
          </button>

          <button
            onClick={() => setViewMode('leadtime')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: viewMode === 'leadtime' ? 700 : 500,
              border: 'none',
              background: viewMode === 'leadtime' ? '#0f172a' : 'transparent',
              color: viewMode === 'leadtime' ? '#ffffff' : '#475569',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <SlidersHorizontal size={14} />
            Cài Đặt Chạy Trước (1-10T)
          </button>

          <button
            onClick={() => setViewMode('chart')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.85rem',
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

        {/* Bộ lọc kịch bản tính toán */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Phương thức phân bổ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Phân bổ:</span>
            <select
              value={distributionMode}
              onChange={(e) => setDistributionMode(e.target.value)}
              style={{
                padding: '6px 10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1e293b',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="even">Chia đều các tháng</option>
              <option value="funnel">Phễu MKT (20% Đầu - 60% Giữa - 20% Cuối)</option>
            </select>
          </div>

          {/* Tỷ lệ MKT % */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>Tỷ lệ:</span>
            <select
              value={mktRatio}
              onChange={(e) => setMktRatio(parseFloat(e.target.value))}
              style={{
                padding: '6px 10px',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#0f172a',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value={0.008}>0.8% Doanh thu</option>
              <option value={0.01}>1.0% Doanh thu (Chuẩn)</option>
              <option value={0.012}>1.2% Doanh thu</option>
              <option value={0.015}>1.5% Doanh thu</option>
              <option value={0.02}>2.0% Doanh thu (Trần)</option>
            </select>
          </div>

          {/* Ô tìm kiếm */}
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm tên tour / tuyến..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px 6px 30px',
                fontSize: '0.85rem',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#f8fafc',
                outline: 'none',
                width: '180px'
              }}
            />
          </div>
        </div>
      </div>

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
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#eff6ff', border: '1px solid #bfdbfe' }} /> &lt;3M
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dbeafe', border: '1px solid #93c5fd' }} /> 3M-6M
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#bfdbfe', border: '1px solid #60a5fa' }} /> 6M-10M
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#fef3c7', border: '1px solid #fcd34d' }} /> &gt;10M
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
                  <th style={{ padding: '12px 10px', width: '105px', textAlign: 'right', borderRight: '1px solid #1e293b' }}>Doanh Thu</th>
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

                      <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 600, color: isZeroGroup ? '#94a3b8' : '#1e293b', borderRight: '1px solid #f1f5f9' }}>
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
                          borderRight: '1px solid #334155'
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
                <strong>Giai đoạn T9/2026 - T02/2027:</strong> Ngân sách duy trì ở mức cao (~28M - 35M/tháng) do đồng thời mở chiến dịch cho Ai Cập, Maroc mùa thu, 3 đoàn Cực quang Nga tháng 2 và kích hoạt sớm các tour đường xa (Alaska, Nam Mỹ, Pakistan hoa).
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
