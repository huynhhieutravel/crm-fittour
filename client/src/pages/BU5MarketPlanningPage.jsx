import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  ChevronRight,
  ExternalLink,
  Sliders,
  Calendar,
  AlertCircle,
  ArrowRight,
  Compass,
  BarChart3,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  Snowflake,
  Flame,
  FileText,
  Download,
  Mountain,
  Sun,
  Globe2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import BU5MonthlyMktReport from '../components/BU5MonthlyMktReport';
import {
  BU5_PRODUCTS_CATALOG,
  BU5_RAW_DEPARTURES,
  TIMELINE_MONTHS,
  calculateBU5MonthlySchedule
} from '../data/bu5MarketingMasterPlan';

// Helper format tiền tệ chuẩn Việt Nam: 59.990.000
const formatMoney = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Component Input Tiền Tệ
const CurrencyInput = ({ value, onChange, placeholder = '0', unit = 'đ', isLight = false }) => {
  const [displayVal, setDisplayVal] = useState(formatMoney(value));

  useEffect(() => {
    setDisplayVal(formatMoney(value));
  }, [value]);

  const handleChange = (e) => {
    const rawDigits = e.target.value.replace(/[^\d]/g, '');
    const num = rawDigits === '' ? 0 : parseInt(rawDigits, 10);
    setDisplayVal(formatMoney(num));
    if (onChange) onChange(num);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={displayVal}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '8px 32px 8px 12px',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: isLight ? '#0f172a' : '#1e293b',
          background: isLight ? '#ffffff' : '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      <span style={{
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#64748b',
        pointerEvents: 'none'
      }}>
        {unit}
      </span>
    </div>
  );
};

// Component Input Số Nguyên (Pax, Lead, Ngày...)
const NumberInput = ({ value, onChange, placeholder = '0', unit = '', min = 0, max = 9999 }) => {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/[^\d]/g, '');
    let num = raw === '' ? 0 : parseInt(raw, 10);
    if (num < min) num = min;
    if (num > max) num = max;
    if (onChange) onChange(num);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <input
        type="text"
        value={value ?? ''}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: unit ? '8px 38px 8px 12px' : '8px 12px',
          fontSize: '0.9rem',
          fontWeight: 700,
          color: '#1e293b',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          outline: 'none',
          boxSizing: 'border-box'
        }}
      />
      {unit && (
        <span style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#64748b',
          pointerEvents: 'none'
        }}>
          {unit}
        </span>
      )}
    </div>
  );
};

// ==============================================================================
// CẤU HÌNH 10 TUYẾN SẢN PHẨM BU5 NĂM 2027 (MASTER PLAN GOOGLE SHEET)
// ==============================================================================
export const BU5_ROUTES_2027 = {
  mongco: {
    id: 'mongco',
    name: 'Mông Cổ - Thảo Nguyên Bất Tận',
    subName: 'Lễ Hội Naadam • Sa Mạc Gobi • Hồ Khovsgol • Thảo Nguyên',
    icon: Mountain,
    color: '#059669',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    price: 78900000,
    cost: 68900000,
    groups: 6,
    targetPax: 60,
    revenue: 4734000000,
    profit: 600000000,
    mktBudget: 47340000,
    leadMonths: '4 - 7 tháng',
    startMonth: '02/2027',
    departureMonths: '06, 07 (x2), 08 (x2), 09/2027',
    defaultCalcs: { budget: 47340000, cpl: 160000, cr: 9.0, depositedPax: 0 }
  },
  murmansk: {
    id: 'murmansk',
    name: 'Nga - Săn Cực Quang Murmansk',
    subName: 'Vòng Bắc Cực Murmansk • Moscow • Saint Petersburg • Xe Tuyết Husky',
    icon: Snowflake,
    color: '#0284c7',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    price: 165000000,
    cost: 140000000,
    groups: 3,
    targetPax: 30,
    revenue: 4950000000,
    profit: 750000000,
    mktBudget: 49500000,
    leadMonths: '5 tháng',
    startMonth: '09/2026',
    departureMonths: '02/2027 (3 đoàn cao điểm)',
    defaultCalcs: { budget: 49500000, cpl: 180000, cr: 8.5, depositedPax: 0 }
  },
  alaska: {
    id: 'alaska',
    name: 'Alaska - Hoang Dã Vùng Cực Bắc Mỹ',
    subName: 'Sông Băng Alaska • Gấu Nâu Bắt Cá Hồi • Cực Quang Sớm • Mùa Thu Tundra',
    icon: Mountain,
    color: '#0369a1',
    badgeBg: '#e0f2fe',
    badgeText: '#075985',
    price: 215000000,
    cost: 185000000,
    groups: 2,
    targetPax: 20,
    revenue: 4300000000,
    profit: 600000000,
    mktBudget: 43000000,
    leadMonths: '7 - 8 tháng',
    startMonth: '12/2026',
    departureMonths: '07/2027 (Hè) & 09/2027 (Lễ 2/9)',
    defaultCalcs: { budget: 43000000, cpl: 240000, cr: 8.0, depositedPax: 0 }
  },
  trunga: {
    id: 'trunga',
    name: 'Con Đường Tơ Lụa Trung Á',
    subName: 'Kazakhstan • Kyrgyzstan • Uzbekistan • Samarkand Huyền Thoại',
    icon: Globe2,
    color: '#8b5cf6',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
    price: 80000000,
    cost: 72000000,
    groups: 4,
    targetPax: 40,
    revenue: 3200000000,
    profit: 320000000,
    mktBudget: 32000000,
    leadMonths: '4 - 7 tháng',
    startMonth: '02/2027',
    departureMonths: '06, 07, 08, 09/2027',
    defaultCalcs: { budget: 32000000, cpl: 200000, cr: 9.0, depositedPax: 0 }
  },
  maroc: {
    id: 'maroc',
    name: 'Ma Rốc - Sa Mạc Sahara & Bắc Phi',
    subName: 'Casablanca • Marrakech • Sa Mạc Đêm Ngàn Sao Sahara • Chefchaouen Xanh',
    icon: Compass,
    color: '#e11d48',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
    price: 109000000,
    cost: 90175564,
    groups: 3,
    targetPax: 30,
    revenue: 3270000000,
    profit: 564733080,
    mktBudget: 32700000,
    leadMonths: '5 - 7 tháng',
    startMonth: '09/2026',
    departureMonths: '02/2027 (Tết), 03/2027, 04/2027 (Lễ 30/4)',
    defaultCalcs: { budget: 32700000, cpl: 250000, cr: 8.5, depositedPax: 0 }
  },
  nammy: {
    id: 'nammy',
    name: 'Nam Mỹ Huyền Thoại (Brazil - Argentina - Peru - Chile)',
    subName: 'Machu Picchu • Thác Iguazu • Sông Băng Perito Moreno • Rio De Janeiro',
    icon: Sun,
    color: '#f59e0b',
    badgeBg: '#fef3c7',
    badgeText: '#78350f',
    price: 330900000,
    cost: 270000000,
    groups: 1,
    targetPax: 10,
    revenue: 3309000000,
    profit: 609000000,
    mktBudget: 33090000,
    leadMonths: '9 tháng',
    startMonth: '12/2026',
    departureMonths: '09/2027 (Mùa thu Nam Mỹ)',
    defaultCalcs: { budget: 33090000, cpl: 300000, cr: 7.5, depositedPax: 0 }
  },
  pakistan: {
    id: 'pakistan',
    name: 'Pakistan - Hoa Anh Đào & Thu Hunza',
    subName: 'Thung Lũng Bất Tử Hunza • Đèo Khunjerab • Cao Tốc Karakoram',
    icon: Mountain,
    color: '#16a34a',
    badgeBg: '#dcfce7',
    badgeText: '#166534',
    price: 74900000,
    cost: 67000000,
    groups: 4,
    targetPax: 40,
    revenue: 2996000000,
    profit: 316000000,
    mktBudget: 29960000,
    leadMonths: '4 - 5 tháng',
    startMonth: '11/2026',
    departureMonths: '03/2027 (2 đoàn hoa) & 10/2027 (2 đoàn thu)',
    defaultCalcs: { budget: 29960000, cpl: 200000, cr: 9.0, depositedPax: 0 }
  },
  aicap: {
    id: 'aicap',
    name: 'Ai Cập Huyền Bí & Du Thuyền Sông Nile 5 Sao',
    subName: 'Kim Tự Tháp Giza • Du Thuyền 5 Sao Luxor - Aswan • Cairo Huyền Bí',
    icon: Sun,
    color: '#d97706',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    price: 104900000,
    cost: 89372535,
    groups: 2,
    targetPax: 20,
    revenue: 2098000000,
    profit: 310549300,
    mktBudget: 20980000,
    leadMonths: '5 - 7 tháng',
    startMonth: '09/2026',
    departureMonths: '02/2027 (Tết) & 04/2027 (Lễ 30/4)',
    defaultCalcs: { budget: 20980000, cpl: 230000, cr: 8.5, depositedPax: 0 }
  },
  namibia: {
    id: 'namibia',
    name: 'Namibia - Wildlife & Sa Mạc Sossusvlei',
    subName: 'Cồn Cát Đỏ Sossusvlei • Bờ Biển Skeleton • Wildlife Safari Etosha',
    icon: Globe2,
    color: '#ea580c',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    price: 180000000,
    cost: 150000000,
    groups: 1,
    targetPax: 10,
    revenue: 1800000000,
    profit: 300000000,
    mktBudget: 18000000,
    leadMonths: '8 tháng',
    startMonth: '01/2027',
    departureMonths: '09/2027 (Lễ 2/9)',
    defaultCalcs: { budget: 18000000, cpl: 260000, cr: 8.0, depositedPax: 0 }
  },
  bacmongco: {
    id: 'bacmongco',
    name: 'Bắc Mông Cổ - Tuần Lộc Tsaatan & Hồ Khovsgol',
    subName: 'Bộ Tộc Tuần Lộc Tsaatan • Hồ Băng Khovsgol • Rừng Taiga Hoang Sơ',
    icon: Mountain,
    color: '#475569',
    badgeBg: '#f1f5f9',
    badgeText: '#1e293b',
    price: 98900000,
    cost: 87700000,
    groups: 1,
    targetPax: 10,
    revenue: 989000000,
    profit: 112000000,
    mktBudget: 9890000,
    leadMonths: '5 tháng',
    startMonth: '04/2027',
    departureMonths: '09-10/2027 (Mùa thu lá vàng)',
    defaultCalcs: { budget: 9890000, cpl: 220000, cr: 8.5, depositedPax: 0 }
  }
};

// ==============================================================================
// COMPONENT CHÍNH: BU5 MARKET PLANNING PAGE (100% NĂM 2027)
// ==============================================================================
const BU5MarketPlanningPage = ({ isEmbedded = false, onBack = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = new URLSearchParams(window.location.search).get('tab');
    if (tabFromUrl && ['overview', 'monthly-mkt', 'departures', 'mongco', 'murmansk', 'alaska', 'trunga', 'maroc', 'nammy', 'pakistan', 'aicap', 'namibia'].includes(tabFromUrl)) {
      return tabFromUrl;
    }
    return 'monthly-mkt'; // Mặc định mở Báo cáo Dòng tiền MKT theo tháng
  });

  // State tính toán cho từng tuyến
  const [routeCalcs, setRouteCalcs] = useState(() => {
    const initial = {};
    Object.keys(BU5_ROUTES_2027).forEach(k => {
      initial[k] = { ...BU5_ROUTES_2027[k].defaultCalcs };
    });
    return initial;
  });

  // Đồng bộ tab từ URL query (?tab=...)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['overview', 'monthly-mkt', 'departures', 'mongco', 'murmansk', 'alaska', 'trunga', 'maroc', 'nammy', 'pakistan', 'aicap', 'namibia'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  const updateRouteCalc = (routeKey, field, val) => {
    setRouteCalcs(prev => ({
      ...prev,
      [routeKey]: {
        ...prev[routeKey],
        [field]: val
      }
    }));
  };

  // Tính toán toàn bộ 24 đợt / 27 đoàn năm 2027 từ Master Plan
  const plan2027 = useMemo(() => {
    return calculateBU5MonthlySchedule({
      yearFilter: '2027',
      mktRatio: 0.01,
      showPrepMonths2026: true
    });
  }, []);

  const { departures: departures2027, kpis } = plan2027;

  return (
    <div style={{
      maxWidth: '1380px',
      margin: '0 auto',
      padding: isEmbedded ? '10px 0' : '20px 24px 60px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#0f172a'
    }}>
      {/* ── BREADCRUMB & HEADER ── */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b', marginBottom: '8px', flexWrap: 'wrap' }}>
          <Link to="/tai-lieu" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600 }}>
            ← Về Trung Tâm Tài Liệu
          </Link>
          <span>/</span>
          <Link to="/tai-lieu/marketing" style={{ color: '#0284c7', textDecoration: 'none' }}>
            Marketing Hub
          </Link>
          <span>/</span>
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Kế Hoạch &amp; Ngân Sách BU5 Năm 2027</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <span style={{
                background: '#fef3c7',
                color: '#92400e',
                border: '1px solid #fde68a',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.03em'
              }}>
                BU5 • KHÁM PHÁ &amp; ĐỘC BẢN (ADVENTURE &amp; EXOTIC)
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Kế Hoạch Sản Phẩm &amp; Ngân Sách Marketing BU5 Năm 2027
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: '#64748b', maxWidth: '880px', lineHeight: 1.55 }}>
              Kế hoạch chi tiết 27 đoàn du lịch độc bản năm 2027 (Mông Cổ, Nga Cực Quang, Alaska, Nam Mỹ, Trung Á, Ma Rốc, Pakistan, Ai Cập, Namibia, Bắc Mông Cổ). Dữ liệu chuẩn xác 100% trích xuất từ Master Plan Google Sheet của BU5 với định mức ngân sách Marketing 1% doanh thu (~316.46 Triệu).
            </p>
          </div>

          {/* Nút hành động */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://docs.google.com/spreadsheets/d/10kuQXdFgFLVSRS4CbKYa-ozuch6RnPJd8NTo36fFhrc/edit?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ecfdf5',
                color: '#065f46',
                border: '1px solid #a7f3d0',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <span>Mở Google Sheet BU5</span>
              <ExternalLink size={14} color="#059669" />
            </a>


          </div>
        </div>
      </div>

      {/* ── 5 THẺ KPI TỔNG HỢP NĂM 2027 (HERO KPI STATS) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
        gap: '12px',
        marginBottom: '22px'
      }}>
        {/* Card 1: Quy mô 2027 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          minWidth: 0
        }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Quy mô 2027
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            27 Đoàn • 270 Pax
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Tổng số: <strong style={{ color: '#0369a1' }}>24 đợt khởi hành</strong>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '2px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Tiêu chuẩn: <strong>10 khách / đoàn</strong>
          </div>
        </div>

        {/* Card 2: Doanh thu 2027 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          minWidth: 0
        }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Doanh thu 2027
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            31.646.000.000 đ
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Lãi gộp KH: <strong style={{ color: '#16a34a' }}>4.48 Tỷ (14.2%)</strong>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0369a1', marginTop: '2px', fontWeight: 600, whiteSpace: 'nowrap' }}>
            Bình quân: <strong>~1.17 Tỷ đ / đoàn</strong>
          </div>
        </div>

        {/* Card 3: Tổng Budget MKT 2027 (1%) */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          minWidth: 0
        }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Tổng Budget MKT 2027 (1%)
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            316.460.000 đ
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Chuẩn đúng: <strong style={{ color: '#10b981' }}>1.00% Doanh Thu</strong>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap' }}>
            Bình quân: <strong>~11.72 Triệu / đoàn</strong>
          </div>
        </div>

        {/* Card 4: Chạy trước cuối 2026 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          minWidth: 0
        }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Chạy trước cuối 2026
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            90.439.620 đ
          </div>
          <div style={{ fontSize: '0.78rem', color: '#92400e', marginTop: '4px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Chiếm 28.6% tổng ngân sách
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap' }}>
            Gom khách Tết &amp; visa Murmansk
          </div>
        </div>

        {/* Card 5: Giải Ngân Năm 2027 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '14px 12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          minWidth: 0
        }}>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Giải Ngân Năm 2027
            </span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
            226.020.380 đ
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0369a1', marginTop: '4px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Chiếm 71.4% tổng quỹ MKT
          </div>
          <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap' }}>
            Rải đều 10 tháng • Đỉnh: <strong>T02/2027</strong>
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG CHI TIẾT THEO TABS (HIỂN THỊ TRỰC TIẾP TRÊN SHEET TABS DƯỚI ĐÁY) ── */}

      {/* ── NỘI DUNG CHI TIẾT THEO TABS ── */}
      {activeTab === 'monthly-mkt' && (
        <BU5MonthlyMktReport />
      )}

      {/* ── TAB TỔNG QUAN KẾ HOẠCH NĂM 2027 ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Banner dẫn tới Ma Trận Dòng Tiền */}
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            borderRadius: '12px',
            padding: '24px 28px',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 8px 24px -4px rgba(2, 132, 199, 0.4)'
          }}>
            <div style={{ maxWidth: '820px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ background: '#ffffff', color: '#0369a1', padding: '3px 9px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 800 }}>
                  MASTER PLAN GOOGLE SHEET 2027 (BU5)
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e0f2fe' }}>
                  27 Đoàn Khởi Hành • 31.65 Tỷ DT • Ngân Sách MKT 1%: 316.46 triệu
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '1.3rem', fontWeight: 800, color: '#ffffff' }}>
                Báo Cáo Dự Toán &amp; Phân Bổ Dòng Tiền Marketing BU5 Năm 2027
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#e0f2fe', lineHeight: 1.55 }}>
                Đã lập lịch chi tiết theo từng tháng độc lập cho toàn bộ <strong>27 đoàn khởi hành trong năm 2027</strong> với chu kỳ chạy trước 1 đến 10 tháng. Trong đó, <strong>28.6% (90.44 triệu)</strong> chạy trước từ cuối 2026 và <strong>71.4% (226.02 triệu)</strong> phát sinh trong năm 2027.
              </p>
            </div>
            <button
              onClick={() => handleTabChange('monthly-mkt')}
              style={{
                padding: '12px 24px',
                background: '#ffffff',
                color: '#0284c7',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.92rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                whiteSpace: 'nowrap'
              }}
            >
              <Calendar size={18} />
              <span>Mở Ma Trận Dòng Tiền 15 Tháng</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Bảng tổng hợp 10 tuyến 2027 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Bảng Tổng Hợp 10 Tuyến Sản Phẩm Độc Bản BU5 Năm 2027 (Đối Soát Master Plan)
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>STT</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left' }}>Tuyến Sản Phẩm</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Số Đoàn</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Target Pax</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Giá Bán / Pax</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Doanh Thu Kế Hoạch</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Lãi Gộp Kế Hoạch</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Kinh Phí MKT 1%</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Chạy Trước</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(BU5_ROUTES_2027).map(([key, route], idx) => (
                    <tr key={key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        <span style={{ color: route.color }}>{route.name}</span>
                        <div style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 400 }}>{route.departureMonths}</div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 700 }}>{route.groups} đoàn</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>{route.targetPax}p</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{formatMoney(route.price)} đ</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>{formatMoney(route.revenue)} đ</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{formatMoney(route.profit)} đ</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{formatMoney(route.mktBudget)} đ</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center', color: '#64748b' }}>{route.leadMonths}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleTabChange(key)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            cursor: 'pointer'
                          }}
                        >
                          Soi Tuyến →
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                    <td colSpan={2} style={{ padding: '14px', color: '#0f172a' }}>
                      TỔNG CỘNG NĂM 2027 (10 TUYẾN SẢN PHẨM)
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#0f172a' }}>27 đoàn</td>
                    <td style={{ padding: '14px', textAlign: 'center', color: '#0f172a' }}>270 Pax</td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#0284c7', fontSize: '0.96rem' }}>
                      31.646.000.000 đ
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#16a34a', fontSize: '0.96rem' }}>
                      4.482.282.380 đ
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right', color: '#10b981', fontSize: '0.96rem' }}>
                      316.460.000 đ
                    </td>
                    <td colSpan={2} style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                      1.00% Doanh Thu Kế Hoạch
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB DANH SÁCH 27 ĐOÀN KHỞI HÀNH NĂM 2027 (GOOGLE SHEET) ── */}
      {activeTab === 'departures' && (
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '24px 28px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Bảng Kế Hoạch 27 Đoàn Khởi Hành BU5 Năm 2027 (Đối Soát Google Sheet Master Plan)
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Trích xuất 100% từ Tab "Lịch khởi hành" &amp; "Kế hoạch triển khai" — 24 đợt khởi hành trong năm 2027.
              </p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>
              27 Đoàn • 270 Pax • Doanh Thu: 31.646 Tỷ • Ngân Sách MKT 1%: 316.46 triệu
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Khởi Hành</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tên Tuyến / Đợt Khởi Hành</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Số Đoàn</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Số Khách</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Giá Bán / Pax</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Doanh Thu Kế Hoạch</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Lãi Gộp Kế Hoạch</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ngân Sách MKT (1%)</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Chạy Trước</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Bắt Đầu MKT</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Trạng Thái Sheet</th>
                </tr>
              </thead>
              <tbody>
                {departures2027.map((dep, index) => {
                  const prod = BU5_PRODUCTS_CATALOG[dep.productKey] || {};

                  return (
                    <tr key={dep.stt} style={{ borderBottom: '1px solid #f1f5f9', background: dep.groupsCount === 0 ? '#f8fafc' : '#ffffff' }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#0369a1', whiteSpace: 'nowrap' }}>
                        {dep.displayTime}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                        <span style={{ marginRight: '6px' }}>{prod.icon || '🧭'}</span>
                        <span>{dep.name}</span>
                        {dep.groupsCount > 1 && (
                          <span style={{ marginLeft: '6px', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700 }}>
                            {dep.groupsCount} đoàn
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                        {dep.groupsCount} đoàn
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>
                        {dep.totalPax} pax
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>
                        {formatMoney(dep.pricePerPax)} đ
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                        {formatMoney(dep.revenue)} đ
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        {formatMoney(dep.grossProfit)} đ
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                        {formatMoney(dep.mktBudget)} đ
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>
                        {dep.leadMonths} tháng
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: dep.startMonth.startsWith('2026') ? '#d97706' : '#64748b', fontWeight: dep.startMonth.startsWith('2026') ? 700 : 500, whiteSpace: 'nowrap' }}>
                        {dep.startMonth}
                        {dep.startMonth.startsWith('2026') && (
                          <span style={{ display: 'block', fontSize: '0.7rem', color: '#d97706' }}>chạy trước cuối 2026</span>
                        )}
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#475569' }}>
                        <span style={{
                          background: dep.status === 'Đang bán' ? '#ecfdf5' : dep.status === 'Làm mới sản phẩm' ? '#eff6ff' : '#f1f5f9',
                          color: dep.status === 'Đang bán' ? '#166534' : dep.status === 'Làm mới sản phẩm' ? '#1e40af' : '#475569',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          fontSize: '0.75rem'
                        }}>
                          {dep.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #0f172a' }}>
                  <td colSpan={3} style={{ padding: '14px 12px', color: '#0f172a' }}>
                    TỔNG CỘNG 2027 (24 ĐỢT KHỞI HÀNH TRÊN GOOGLE SHEET)
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: '#0f172a' }}>
                    {kpis.totalGroups} đoàn
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'center', color: '#0f172a' }}>
                    {kpis.totalPax} Pax
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right' }}>—</td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#0284c7', fontSize: '0.94rem' }}>
                    {formatMoney(kpis.totalRevenue)} đ
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#16a34a', fontSize: '0.94rem' }}>
                    {formatMoney(kpis.totalGrossProfit)} đ
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#10b981', fontSize: '0.94rem' }}>
                    {formatMoney(kpis.totalMktBudget)} đ
                  </td>
                  <td colSpan={3} style={{ padding: '14px 12px', textAlign: 'left', color: '#64748b', fontSize: '0.8rem' }}>
                    Dòng tiền: <strong>{formatMoney(kpis.mktPrepIn2026)} đ</strong> (cuối 2026) + <strong>{formatMoney(kpis.mktIn2027Only)} đ</strong> (năm 2027)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CHI TIẾT TỪNG TUYẾN NĂM 2027 (MÁY TÍNH DỰ TOÁN) ── */}
      {['mongco', 'murmansk', 'alaska', 'trunga', 'maroc', 'nammy', 'pakistan', 'aicap', 'namibia', 'bacmongco'].includes(activeTab) && (() => {
        const routeKey = activeTab;
        const routeConf = BU5_ROUTES_2027[routeKey];
        if (!routeConf) return null;
        const c = routeCalcs[routeKey] || routeConf.defaultCalcs;
        const RouteIcon = routeConf.icon;

        // Tính toán phễu
        const leads = c.cpl > 0 ? Math.floor(c.budget / c.cpl) : 0;
        const paxFromAds = Math.floor(leads * (c.cr / 100));
        const totalPax = (c.depositedPax || 0) + paxFromAds;
        const totalEstimatedRev = totalPax * routeConf.price;
        const grossProfitPerPax = routeConf.price - routeConf.cost;
        const totalProfit = totalPax * grossProfitPerPax;
        const adsRatioOnRev = totalEstimatedRev > 0 ? (c.budget / totalEstimatedRev) * 100 : 0;

        // Lọc các đoàn của tuyến trong năm 2027
        const routeDepartures = departures2027.filter(d => d.productKey === routeKey || (routeKey === 'mongco' && d.productKey === 'mongco') || (routeKey === 'murmansk' && d.productKey === 'nga'));

        return (
          <div>
            {/* Header Tuyến */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: `1.5px solid ${routeConf.color}`,
              padding: '22px 24px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: routeConf.badgeBg, color: routeConf.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RouteIcon size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      Máy Tính Dự Toán 2027: {routeConf.name}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                      {routeConf.subName} • Giá tour: <strong>{formatMoney(routeConf.price)} đ</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
                    Quy mô năm 2027: <strong style={{ color: '#0f172a' }}>{routeConf.groups} đoàn ({routeConf.targetPax} pax)</strong>
                  </div>
                  <div style={{ background: '#ecfdf4', border: '1px solid #86efac', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', color: '#166534' }}>
                    Lãi gộp KH: <strong>{formatMoney(routeConf.profit)} đ</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout 2 Cột: Input Tham Số & Kết Quả Tính Toán */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* Cột Trái: Input Tham Số */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '22px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} color="#0284c7" />
                  <span>Tham Số Dự Toán Năm 2027 (Input)</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Ngân sách Marketing phân bổ cho tuyến (Định mức 1% Doanh thu):
                    </label>
                    <CurrencyInput
                      value={c.budget}
                      onChange={(v) => updateRouteCalc(routeKey, 'budget', v)}
                    />
                    <span style={{ fontSize: '0.74rem', color: '#10b981', display: 'block', marginTop: '3px', fontWeight: 600 }}>
                      Chuẩn định mức 1% của {formatMoney(routeConf.revenue)} đ = <strong>{formatMoney(routeConf.mktBudget)} đ</strong>
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Chi phí trên mỗi Lead SĐT (CPL giả định):
                    </label>
                    <CurrencyInput
                      value={c.cpl}
                      onChange={(v) => updateRouteCalc(routeKey, 'cpl', v)}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Tỷ lệ chuyển đổi chốt đơn (CR Sale):
                    </label>
                    <NumberInput
                      value={c.cr}
                      onChange={(v) => updateRouteCalc(routeKey, 'cr', v)}
                      unit="%"
                      max={100}
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                      Định mức dòng khám phá độc bản: <strong>8.0% - 10.0%</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Cột Phải: Kết Quả Dự Toán */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '22px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={18} color="#16a34a" />
                  <span>Kỳ Vọng Phễu Chuyển Đổi &amp; Tài Chính</span>
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DỰ KIẾN LEAD SĐT:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                      ~{leads} Lead
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>KHÁCH CHỐT TỪ ADS:</span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                      ~{paxFromAds} Pax
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>DOANH THU KỲ VỌNG:</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                      {formatMoney(totalEstimatedRev)} đ
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LÃI GỘP KỲ VỌNG:</span>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                      {formatMoney(totalProfit)} đ
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '14px', padding: '10px 14px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #a7f3d0', fontSize: '0.82rem', color: '#065f46' }}>
                  Tỷ lệ Marketing / Doanh thu dự kiến: <strong>{adsRatioOnRev.toFixed(2)}%</strong> (Định mức tiêu chuẩn: <strong>1.00%</strong>).
                </div>
              </div>
            </div>

            {/* Bảng các đợt khởi hành của tuyến */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Lịch Khởi Hành Năm 2027 Thuộc Tuyến: {routeConf.name}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>STT</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Khởi Hành</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Tên Đợt Khởi Hành</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Số Đoàn</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Số Pax</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Doanh Thu KH</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Kinh Phí MKT (1%)</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Chạy Trước</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Bắt Đầu MKT</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Tình Trạng</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeDepartures.map((d, i) => (
                      <tr key={d.stt} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748b' }}>{i + 1}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#0369a1' }}>{d.displayTime}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{d.name}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{d.groupsCount} đoàn</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{d.totalPax} pax</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>{formatMoney(d.revenue)} đ</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>{formatMoney(d.mktBudget)} đ</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center' }}>{d.leadMonths} tháng</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: d.startMonth.startsWith('2026') ? 700 : 500, color: d.startMonth.startsWith('2026') ? '#d97706' : '#64748b' }}>
                          {d.startMonth}
                        </td>
                        <td style={{ padding: '8px 12px', color: '#64748b', fontSize: '0.8rem' }}>{d.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── GOOGLE SHEETS STYLE BOTTOM TABS BAR (STICKY DƯỚI ĐÁY BẢNG TÍNH) ── */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 100,
        background: '#f1f5f9',
        borderTop: '2px solid #cbd5e1',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        overflowX: 'auto',
        gap: '4px',
        height: '42px',
        margin: isEmbedded ? '24px 0 0 0' : '28px -24px -60px -24px'
      }}>
        {/* Label Google Sheet branding indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 12px',
          borderRight: '1px solid #cbd5e1',
          color: '#475569',
          fontSize: '0.76rem',
          fontWeight: 800,
          whiteSpace: 'nowrap'
        }}>
          <FileSpreadsheet size={15} color="#059669" />
          <span>SHEETS BU5</span>
        </div>

        {[
          { key: 'monthly-mkt', label: 'Ma Trận Dòng Tiền MKT 2027', icon: <Calendar size={13} /> },
          { key: 'departures', label: 'Lịch 27 Đoàn', icon: <Layers size={13} /> },
          { key: 'overview', label: 'P&L & Tổng Quan', icon: <BarChart3 size={13} /> },
          { key: 'mongco', label: 'Mông Cổ (6 đoàn)', color: '#059669' },
          { key: 'murmansk', label: 'Nga Murmansk (3 đoàn)', color: '#0284c7' },
          { key: 'alaska', label: 'Alaska (2 đoàn)', color: '#0369a1' },
          { key: 'trunga', label: 'Trung Á (4 đoàn)', color: '#8b5cf6' },
          { key: 'maroc', label: 'Ma Rốc (3 đoàn)', color: '#e11d48' },
          { key: 'nammy', label: 'Nam Mỹ (1 đoàn)', color: '#f59e0b' },
          { key: 'pakistan', label: 'Pakistan (4 đoàn)', color: '#16a34a' },
          { key: 'aicap', label: 'Ai Cập (2 đoàn)', color: '#d97706' }
        ].map(tab => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                height: '34px',
                borderRadius: '6px 6px 0 0',
                border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                borderBottom: isActive ? '3px solid #059669' : 'none',
                background: isActive ? '#ffffff' : 'transparent',
                color: isActive ? '#0f172a' : '#475569',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.82rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.1s ease',
                boxShadow: isActive ? '0 -1px 3px rgba(0,0,0,0.04)' : 'none'
              }}
            >
              {tab.icon}
              {tab.color && (
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: tab.color, display: 'inline-block' }} />
              )}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BU5MarketPlanningPage;
