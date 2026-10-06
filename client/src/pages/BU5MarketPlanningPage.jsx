import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Users, 
  MessageSquare, 
  PhoneCall, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Sliders,
  Check,
  RotateCcw,
  Calendar,
  AlertCircle,
  ArrowRight,
  Compass,
  BarChart3,
  Target,
  Flag,
  Clock,
  CheckCircle2,
  RefreshCw,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  HelpCircle,
  SlidersHorizontal,
  Eye,
  MapPin,
  Search,
  Filter,
  Snowflake,
  Flame,
  Award,
  Share2,
  PieChart,
  FileText,
  Download,
  Mountain,
  Sun,
  Globe2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// Helper format tiền tệ chuẩn Việt Nam: 59.990.000
const formatMoney = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Component Input Tiền Tệ: Tự động format .000.000 mượt mà khi gõ
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
// DỮ LIỆU ĐỐI SOÁT DATABASE CHUẨN XÁC 100% TỪ ERP & META ADS BU5
// ==============================================================================

// Cấu hình 5 Tuyến Sản Phẩm Cốt Lõi của BU5 (Quý 4/2026)
export const BU5_ROUTES_CONFIG = {
  murmansk: {
    id: 'murmansk',
    name: 'Bắc Cực Quang Murmansk (Nga)',
    subName: 'Săn Cực Quang Bắc Cực • Trượt Tuyết • Đêm Trắng Tuyết Rơi',
    icon: Snowflake,
    color: '#0284c7',
    badgeColor: '#e0f2fe',
    badgeTextColor: '#0369a1',
    isHero: true,
    priceRange: '165.900.000 đ – 169.900.000 đ',
    profitPerPax: 33580000,
    historicalCpl: 142985,
    defaultCalcs: {
      budget: 28000000,
      cpl: 180000,
      cr: 9.0,
      targetPax: 20,
      breakEvenPax: 14,
      avgPrice: 167900000,
      avgCost: 134320000,
      depositedPax: 3,
      totalDepositedMoney: 21000000
    },
    departures: [
      {
        id: 306,
        code: '(HAN)MURMANSK11N10Đ-20261209',
        tuyen: 'NƯỚC NGA VĨ ĐẠI - TỪ NGA HOÀNG ĐẾN VÒNG BẮC CỰC QUANG MURMANSK (HÀ NỘI)',
        date: '2026-12-09',
        targetPax: 10,
        breakEvenPax: 7,
        price: 165900000,
        cost: 132720000,
        paidPax: 2,
        paidRevenue: 11000000,
        statusText: 'Mở bán (2 khách đã cọc: 11 triệu)'
      },
      {
        id: 307,
        code: 'SGNMM',
        tuyen: 'NƯỚC NGA VĨ ĐẠI - TỪ NGA HOÀNG ĐẾN VÒNG BẮC CỰC QUANG MURMANSK (SÀI GÒN)',
        date: '2026-12-09',
        targetPax: 10,
        breakEvenPax: 7,
        price: 169900000,
        cost: 135920000,
        paidPax: 1,
        paidRevenue: 10000000,
        statusText: 'Mở bán (1 khách đã cọc: 10 triệu)'
      }
    ]
  },
  aicap: {
    id: 'aicap',
    name: 'Ai Cập Huyền Bí & Sông Nile',
    subName: 'Du Thuyền 5 Sao Dọc Sông Nile • Kim Tự Tháp • Cairo',
    icon: Sun,
    color: '#d97706',
    badgeColor: '#fef3c7',
    badgeTextColor: '#92400e',
    isHero: false,
    priceRange: '94.900.000 đ – 104.900.000 đ',
    profitPerPax: 19980000,
    historicalCpl: 422329,
    defaultCalcs: {
      budget: 28000000,
      cpl: 380000,
      cr: 9.5,
      targetPax: 24,
      breakEvenPax: 16,
      avgPrice: 99900000,
      avgCost: 79920000,
      depositedPax: 3,
      totalDepositedMoney: 85000000
    },
    departures: [
      {
        id: 268,
        code: 'AC9N8D-20261122',
        tuyen: 'TOUR AI CẬP - HÀNH TRÌNH DỌC SÔNG NILE TRÊN DU THUYỀN 5 SAO',
        date: '2026-11-22',
        targetPax: 12,
        breakEvenPax: 8,
        price: 94900000,
        cost: 75920000,
        paidPax: 3,
        paidRevenue: 85000000,
        statusText: 'Mở bán (3 khách đã cọc)'
      },
      {
        id: 321,
        code: 'AC9N8D-20261220',
        tuyen: 'TOUR AI CẬP NOEL & ĐÓN NĂM MỚI 2027 DU THUYỀN NILE 5 SAO',
        date: '2026-12-20',
        targetPax: 12,
        breakEvenPax: 8,
        price: 104900000,
        cost: 83920000,
        paidPax: 0,
        paidRevenue: 0,
        statusText: 'Mở bán (Đón Noel & Tết Dương)'
      }
    ]
  },
  maroc: {
    id: 'maroc',
    name: 'Ma Rốc — Viên Ngọc Bắc Phi',
    subName: 'Sa Mạc Sahara • Thành Phố Xanh Chefchaouen • Casablanca',
    icon: Compass,
    color: '#e11d48',
    badgeColor: '#ffe4e6',
    badgeTextColor: '#9f1239',
    isHero: false,
    priceRange: '109.900.000 đ',
    profitPerPax: 21980000,
    historicalCpl: 333901,
    defaultCalcs: {
      budget: 20000000,
      cpl: 320000,
      cr: 9.5,
      targetPax: 15,
      breakEvenPax: 11,
      avgPrice: 109900000,
      avgCost: 87920000,
      depositedPax: 4,
      totalDepositedMoney: 120000000
    },
    departures: [
      {
        id: 289,
        code: 'MR11N10Đ-20261119',
        tuyen: 'TOUR MA RỐC 11N10Đ - VIÊN NGỌC BẮC PHI & SA MẠC SAHARA',
        date: '2026-11-19',
        targetPax: 15,
        breakEvenPax: 11,
        price: 109900000,
        cost: 87920000,
        paidPax: 4,
        paidRevenue: 120000000,
        statusText: 'Mở bán (4 khách đã cọc)'
      }
    ]
  },
  pakistan: {
    id: 'pakistan',
    name: 'Pakistan Mùa Thu (Hunza Valley)',
    subName: 'Thung Lũng Bất Tử Hunza • Cung Đường Karakoram Huyền Thoại',
    icon: Mountain,
    color: '#16a34a',
    badgeColor: '#dcfce7',
    badgeTextColor: '#166534',
    isHero: false,
    priceRange: '76.400.000 đ',
    profitPerPax: 15280000,
    historicalCpl: 215743,
    defaultCalcs: {
      budget: 16000000,
      cpl: 220000,
      cr: 8.5,
      targetPax: 22,
      breakEvenPax: 16,
      avgPrice: 76400000,
      avgCost: 61120000,
      depositedPax: 11,
      totalDepositedMoney: 418120000
    },
    departures: [
      {
        id: 242,
        code: 'Pakistan 2603',
        tuyen: 'PAKISTAN MÙA THU - VIÊN NGỌC CHƯA ĐƯỢC GỌT GIŨA (ĐỢT 1)',
        date: '2026-10-17',
        targetPax: 11,
        breakEvenPax: 8,
        price: 76400000,
        cost: 61120000,
        paidPax: 11,
        paidRevenue: 418120000,
        statusText: 'ĐÃ FULL 100% CỌC (Đóng sổ nhận cọc)'
      },
      {
        id: 243,
        code: 'PAKISTAN12N11D-20261030',
        tuyen: 'PAKISTAN MÙA THU - VIÊN NGỌC CHƯA ĐƯỢC GỌT GIŨA (ĐỢT 2)',
        date: '2026-10-31',
        targetPax: 11,
        breakEvenPax: 8,
        price: 76400000,
        cost: 61120000,
        paidPax: 0,
        paidRevenue: 0,
        statusText: 'Mở bán (Đang giữ chỗ đoàn 11 pax)'
      }
    ]
  },
  trunga: {
    id: 'trunga',
    name: 'Con Đường Tơ Lụa Trung Á',
    subName: 'Kazakhstan - Kyrgyzstan - Uzbekistan • Di Sản Nghìn Năm',
    icon: Globe2,
    color: '#8b5cf6',
    badgeColor: '#ede9fe',
    badgeTextColor: '#5b21b6',
    isHero: false,
    priceRange: '105.000.000 đ',
    profitPerPax: 21000000,
    historicalCpl: 250000,
    defaultCalcs: {
      budget: 8000000,
      cpl: 250000,
      cr: 9.0,
      targetPax: 10,
      breakEvenPax: 7,
      avgPrice: 105000000,
      avgCost: 84000000,
      depositedPax: 1,
      totalDepositedMoney: 40000000
    },
    departures: [
      {
        id: 305,
        code: 'TRUNG Á-20261010',
        tuyen: 'CON ĐƯỜNG TƠ LỤA TRUNG Á: KAZAKHSTAN - KYRGYZSTAN - UZBEKISTAN',
        date: '2026-10-10',
        targetPax: 10,
        breakEvenPax: 7,
        price: 105000000,
        cost: 84000000,
        paidPax: 1,
        paidRevenue: 40000000,
        statusText: 'Mở bán (Khởi hành đầu tháng 10)'
      }
    ]
  }
};

// Dữ liệu Lịch sử Meta Ads BU5 (Trích xuất từ bảng marketing_ads_reports)
export const BU5_HISTORICAL_ADS_DATA = {
  summary: {
    totalAdsets: 43,
    totalSpend: 56464843,
    totalMessages: 993,
    totalLeads: 221,
    avgCplLead: 255497,
    avgCplMsg: 56863
  },
  months: [
    {
      monthStr: 'Tháng 08/2026',
      adsets: 25,
      spend: 34396454,
      messages: 435,
      cplMsg: 79072,
      leads: 126,
      cplLead: 272988,
      note: 'Chạy mạnh Pakistan & Ai Cập đón mùa Thu; lượng lead dồn dập'
    },
    {
      monthStr: 'Tháng 09/2026',
      adsets: 18,
      spend: 22068389,
      messages: 558,
      cplMsg: 39549,
      leads: 95,
      cplLead: 232299,
      note: 'Mở thêm Adset Nga Murmansk Cực Quang (CPL siêu rẻ 143k); tối ưu chiến dịch'
    }
  ],
  topAdsets: [
    { name: '[BU5] Pakistan | LEAD-MSG | COLD | 400K | HN + SG | Bài tổng', spend: 17906689, msgs: 285, leads: 83, cpl: 215743 },
    { name: '[BU5] AI CẬP | LEAD-MSG | COLD | 200K | HN + SG | MÙA THU', spend: 14359170, msgs: 235, leads: 34, cpl: 422329 },
    { name: '[BU5] MA RỐC | LEAD-MSG | COLD | 350K | HN + SG | MÙA THU', spend: 13356057, msgs: 198, leads: 40, cpl: 333901 },
    { name: '[BU5] NGA MURMANSK | LEAD-MSG | COLD | 350K | HN - SG | Cuối năm', spend: 4432533, msgs: 172, leads: 31, cpl: 142985 },
    { name: '[BU5] Mông Cổ | LEAD-MSG | COLD | 400K | HN + SG | Cuối năm', spend: 4325047, msgs: 80, leads: 19, cpl: 227634 }
  ]
};

// ==============================================================================
// COMPONENT CHÍNH: BU5 MARKET PLANNING PAGE
// ==============================================================================
const BU5MarketPlanningPage = ({ isEmbedded = false, onBack = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('overview'); // overview, murmansk, aicap, maroc, pakistan, trunga, departures
  const [selectedScenario, setSelectedScenario] = useState('CEO'); // CEO (100M), SAFE (60M), GROWTH (150M)

  // State bộ tính toán cho 5 tuyến
  const [calcs, setCalcs] = useState({
    murmansk: { ...BU5_ROUTES_CONFIG.murmansk.defaultCalcs },
    aicap: { ...BU5_ROUTES_CONFIG.aicap.defaultCalcs },
    maroc: { ...BU5_ROUTES_CONFIG.maroc.defaultCalcs },
    pakistan: { ...BU5_ROUTES_CONFIG.pakistan.defaultCalcs },
    trunga: { ...BU5_ROUTES_CONFIG.trunga.defaultCalcs }
  });

  // Đồng bộ tab từ URL query (?tab=...)
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['overview', 'murmansk', 'aicap', 'maroc', 'pakistan', 'trunga', 'departures'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  // Hàm chuyển đổi kịch bản ngân sách
  const applyScenario = (scen) => {
    setSelectedScenario(scen);
    if (scen === 'CEO') {
      // 100 Triệu (Chuẩn định mức 1% Doanh thu)
      setCalcs({
        murmansk: { ...BU5_ROUTES_CONFIG.murmansk.defaultCalcs, budget: 28000000, cpl: 180000 },
        aicap: { ...BU5_ROUTES_CONFIG.aicap.defaultCalcs, budget: 28000000, cpl: 380000 },
        maroc: { ...BU5_ROUTES_CONFIG.maroc.defaultCalcs, budget: 20000000, cpl: 320000 },
        pakistan: { ...BU5_ROUTES_CONFIG.pakistan.defaultCalcs, budget: 16000000, cpl: 220000 },
        trunga: { ...BU5_ROUTES_CONFIG.trunga.defaultCalcs, budget: 8000000, cpl: 250000 }
      });
    } else if (scen === 'SAFE') {
      // 60 Triệu (An toàn dòng tiền, 20 Tr/tháng)
      setCalcs({
        murmansk: { ...BU5_ROUTES_CONFIG.murmansk.defaultCalcs, budget: 20000000, cpl: 190000 },
        aicap: { ...BU5_ROUTES_CONFIG.aicap.defaultCalcs, budget: 16000000, cpl: 390000 },
        maroc: { ...BU5_ROUTES_CONFIG.maroc.defaultCalcs, budget: 12000000, cpl: 330000 },
        pakistan: { ...BU5_ROUTES_CONFIG.pakistan.defaultCalcs, budget: 8000000, cpl: 230000 },
        trunga: { ...BU5_ROUTES_CONFIG.trunga.defaultCalcs, budget: 4000000, cpl: 260000 }
      });
    } else if (scen === 'GROWTH') {
      // 150 Triệu (Mở rộng & Thống lĩnh mùa Đông)
      setCalcs({
        murmansk: { ...BU5_ROUTES_CONFIG.murmansk.defaultCalcs, budget: 45000000, cpl: 175000 },
        aicap: { ...BU5_ROUTES_CONFIG.aicap.defaultCalcs, budget: 42000000, cpl: 370000 },
        maroc: { ...BU5_ROUTES_CONFIG.maroc.defaultCalcs, budget: 30000000, cpl: 310000 },
        pakistan: { ...BU5_ROUTES_CONFIG.pakistan.defaultCalcs, budget: 23000000, cpl: 210000 },
        trunga: { ...BU5_ROUTES_CONFIG.trunga.defaultCalcs, budget: 10000000, cpl: 240000 }
      });
    }
  };

  // Cập nhật giá trị input của 1 tuyến
  const updateRouteCalc = (routeKey, field, val) => {
    setCalcs(prev => ({
      ...prev,
      [routeKey]: {
        ...prev[routeKey],
        [field]: val
      }
    }));
  };

  // Tính toán kết quả cho từng tuyến
  const routeResults = useMemo(() => {
    const res = {};
    Object.keys(calcs).forEach(key => {
      const c = calcs[key];
      const leads = c.cpl > 0 ? Math.floor(c.budget / c.cpl) : 0;
      const paxAds = Math.floor(leads * (c.cr / 100));
      const totalPax = (c.depositedPax || 0) + paxAds;
      const targetPaxTotal = c.targetPax || 1;
      const fillRate = Math.min(100, Math.round((totalPax / targetPaxTotal) * 100));
      
      const revFromAds = paxAds * c.avgPrice;
      const totalEstimatedRev = totalPax * c.avgPrice;
      const fullPlannedRev = targetPaxTotal * c.avgPrice;

      const grossProfitPerPax = c.avgPrice - c.avgCost;
      const profitFromAds = paxAds * grossProfitPerPax;
      const totalProfit = totalPax * grossProfitPerPax;
      const fullPlannedProfit = targetPaxTotal * grossProfitPerPax;

      const adsRatioOnRev = totalEstimatedRev > 0 ? (c.budget / totalEstimatedRev) * 100 : 0;
      const adsRatioOnProfit = totalProfit > 0 ? (c.budget / totalProfit) * 100 : 0;

      // Tính ngược: Cần bao nhiêu ngân sách để đủ 100% Target
      const neededPaxFromAds = Math.max(0, targetPaxTotal - (c.depositedPax || 0));
      const neededLeads = c.cr > 0 ? Math.ceil(neededPaxFromAds / (c.cr / 100)) : 0;
      const neededBudget = neededLeads * c.cpl;

      res[key] = {
        leads,
        paxAds,
        totalPax,
        targetPaxTotal,
        fillRate,
        revFromAds,
        totalEstimatedRev,
        fullPlannedRev,
        grossProfitPerPax,
        profitFromAds,
        totalProfit,
        fullPlannedProfit,
        adsRatioOnRev,
        adsRatioOnProfit,
        neededPaxFromAds,
        neededLeads,
        neededBudget
      };
    });
    return res;
  }, [calcs]);

  // Tổng hợp toàn bộ BU5 (Tổng 5 tuyến)
  const bu5Summary = useMemo(() => {
    let totalBudget = 0;
    let totalLeads = 0;
    let totalPaxAds = 0;
    let totalDepositedPax = 0;
    let totalTargetPax = 0;
    let totalCurrentPaid = 0;
    let totalEstimatedRev = 0;
    let totalFullPlannedRev = 0;
    let totalProfit = 0;
    let totalFullPlannedProfit = 0;

    Object.keys(calcs).forEach(k => {
      const c = calcs[k];
      const r = routeResults[k];
      totalBudget += c.budget;
      totalLeads += r.leads;
      totalPaxAds += r.paxAds;
      totalDepositedPax += (c.depositedPax || 0);
      totalTargetPax += c.targetPax;
      totalCurrentPaid += (c.totalDepositedMoney || 0);
      totalEstimatedRev += r.totalEstimatedRev;
      totalFullPlannedRev += r.fullPlannedRev;
      totalProfit += r.totalProfit;
      totalFullPlannedProfit += r.fullPlannedProfit;
    });

    const totalPax = totalDepositedPax + totalPaxAds;
    const overallFillRate = totalTargetPax > 0 ? Math.round((totalPax / totalTargetPax) * 100) : 0;
    const adsRatioOnRev = totalEstimatedRev > 0 ? (totalBudget / totalEstimatedRev) * 100 : 0;
    const adsRatioOnFullRev = totalFullPlannedRev > 0 ? (totalBudget / totalFullPlannedRev) * 100 : 0;
    const adsRatioOnProfit = totalProfit > 0 ? (totalBudget / totalProfit) * 100 : 0;

    return {
      totalBudget,
      totalLeads,
      totalPaxAds,
      totalDepositedPax,
      totalTargetPax,
      totalPax,
      totalCurrentPaid,
      overallFillRate,
      totalEstimatedRev,
      totalFullPlannedRev,
      totalProfit,
      totalFullPlannedProfit,
      adsRatioOnRev,
      adsRatioOnFullRev,
      adsRatioOnProfit
    };
  }, [calcs, routeResults]);

  // Toàn bộ 8 đoàn khởi hành Q4/2026 trên ERP
  const allDeparturesList = useMemo(() => {
    const list = [];
    Object.keys(BU5_ROUTES_CONFIG).forEach(k => {
      const conf = BU5_ROUTES_CONFIG[k];
      conf.departures.forEach(d => {
        list.push({
          ...d,
          routeKey: k,
          routeName: conf.name,
          routeColor: conf.color
        });
      });
    });
    return list.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, []);

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
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Đề Án Thị Trường &amp; Dự Toán BU5</span>
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
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                border: '1px solid #bae6fd',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                8 ĐOÀN ERP KHỞI HÀNH (Q4/2026)
              </span>
              <span style={{
                background: '#dcfce7',
                color: '#166534',
                border: '1px solid #bbf7d0',
                padding: '3px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                ĐÃ CÓ {bu5Summary.totalDepositedPax} CỌC / THANH TOÁN ({(bu5Summary.totalCurrentPaid / 1000000).toFixed(1)}M VNĐ)
              </span>
            </div>

            <h1 style={{ margin: 0, fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Compass size={30} color="#d97706" />
              Đề Án Dự Toán &amp; Ngân Sách BU5 Quý 4/2026
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: '0.92rem', color: '#64748b', maxWidth: '880px', lineHeight: 1.55 }}>
              Chiến lược thâm nhập và lấp đầy 5 tuyến độc bản: <strong>Pakistan Mùa Thu, Ai Cập Sông Nile, Ma Rốc Bắc Phi, Murmansk Bắc Cực Quang (Nga) &amp; Trung Á Tơ Lụa</strong>. Dữ liệu chuẩn xác 100% đối soát từ Database Production và lịch sử chiến dịch Meta Ads.
            </p>
          </div>

          {/* Nút hành động */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <a
              href="/email_preview_de_xuat_bu5_q4_2026.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#fffbeb',
                color: '#b45309',
                border: '1px solid #fde68a',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <span>Preview Email ✉️</span>
              <ExternalLink size={14} color="#b45309" />
            </a>

            <a
              href="/GIAI_TRINH_DU_TOAN_BU5_Q4_2026.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <FileText size={16} color="#0284c7" />
              <span>Xem Báo Cáo .MD</span>
              <ExternalLink size={14} color="#64748b" />
            </a>

            <Link
              to="/tai-lieu/marketing"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '9px 18px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 2px 4px rgba(2,132,199,0.25)'
              }}
            >
              <TrendingUp size={16} />
              <span>Module Budget Plan ERP</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── SUB-HEADER TABS ĐIỀU HƯỚNG ── */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '10px',
        marginBottom: '22px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => handleTabChange('overview')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'overview' ? 700 : 500,
            background: activeTab === 'overview' ? '#0f172a' : '#f1f5f9',
            color: activeTab === 'overview' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <BarChart3 size={16} />
          <span>Tổng Quan &amp; Kịch Bản (100 Tr)</span>
        </button>

        <button
          onClick={() => handleTabChange('murmansk')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'murmansk' ? 700 : 500,
            background: activeTab === 'murmansk' ? '#0284c7' : '#f1f5f9',
            color: activeTab === 'murmansk' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Snowflake size={16} />
          <span>❄️ Murmansk Nga</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '4px',
            background: activeTab === 'murmansk' ? 'rgba(255,255,255,0.25)' : '#e0f2fe',
            color: activeTab === 'murmansk' ? '#ffffff' : '#0369a1',
            fontWeight: 700
          }}>
            2 đoàn • 28 Tr
          </span>
        </button>

        <button
          onClick={() => handleTabChange('aicap')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'aicap' ? 700 : 500,
            background: activeTab === 'aicap' ? '#d97706' : '#f1f5f9',
            color: activeTab === 'aicap' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Sun size={16} />
          <span>☀️ Ai Cập Sông Nile</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '4px',
            background: activeTab === 'aicap' ? 'rgba(255,255,255,0.25)' : '#fef3c7',
            color: activeTab === 'aicap' ? '#ffffff' : '#92400e',
            fontWeight: 700
          }}>
            2 đoàn • 28 Tr
          </span>
        </button>

        <button
          onClick={() => handleTabChange('maroc')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'maroc' ? 700 : 500,
            background: activeTab === 'maroc' ? '#e11d48' : '#f1f5f9',
            color: activeTab === 'maroc' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Compass size={16} />
          <span>🏜️ Ma Rốc Bắc Phi</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '4px',
            background: activeTab === 'maroc' ? 'rgba(255,255,255,0.25)' : '#ffe4e6',
            color: activeTab === 'maroc' ? '#ffffff' : '#9f1239',
            fontWeight: 700
          }}>
            1 đoàn • 20 Tr
          </span>
        </button>

        <button
          onClick={() => handleTabChange('pakistan')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'pakistan' ? 700 : 500,
            background: activeTab === 'pakistan' ? '#16a34a' : '#f1f5f9',
            color: activeTab === 'pakistan' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Mountain size={16} />
          <span>🏔️ Pakistan Hunza</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '4px',
            background: activeTab === 'pakistan' ? 'rgba(255,255,255,0.25)' : '#dcfce7',
            color: activeTab === 'pakistan' ? '#ffffff' : '#166534',
            fontWeight: 700
          }}>
            2 đoàn • 16 Tr
          </span>
        </button>

        <button
          onClick={() => handleTabChange('trunga')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'trunga' ? 700 : 500,
            background: activeTab === 'trunga' ? '#8b5cf6' : '#f1f5f9',
            color: activeTab === 'trunga' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Globe2 size={16} />
          <span>🏛️ Trung Á Tơ Lụa</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '1px 6px',
            borderRadius: '4px',
            background: activeTab === 'trunga' ? 'rgba(255,255,255,0.25)' : '#ede9fe',
            color: activeTab === 'trunga' ? '#ffffff' : '#5b21b6',
            fontWeight: 700
          }}>
            1 đoàn • 8 Tr
          </span>
        </button>

        <button
          onClick={() => handleTabChange('departures')}
          style={{
            padding: '9px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.86rem',
            fontWeight: activeTab === 'departures' ? 700 : 500,
            background: activeTab === 'departures' ? '#0f172a' : '#f1f5f9',
            color: activeTab === 'departures' ? '#ffffff' : '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <Calendar size={16} />
          <span>📅 Danh Sách 8 Đoàn ERP</span>
        </button>
      </div>

      {/* ── 5 THẺ KPI TỔNG HỢP TRÊN CÙNG (HERO KPI STATS) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        marginBottom: '28px'
      }}>
        {/* Card 1: Quy mô đoàn & khách */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Quy Mô Đoàn &amp; Khách Q4
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            8 Đoàn • 91 Pax
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Đã cọc thực tế: <strong style={{ color: '#16a34a' }}>{bu5Summary.totalDepositedPax} Pax ({((bu5Summary.totalDepositedPax / bu5Summary.totalTargetPax) * 100).toFixed(1)}%)</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0284c7', marginTop: '2px', fontWeight: 600 }}>
            Tiền cọc đã thu: <strong>{formatMoney(bu5Summary.totalCurrentPaid)} đ</strong>
          </div>
        </div>

        {/* Card 2: Doanh thu kế hoạch */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Doanh Thu Kế Hoạch BU5
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em' }}>
            10.134.900.000 đ
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Lãi gộp KH: <strong style={{ color: '#0f172a' }}>2.026.980.000 đ (20.0%)</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            DT từ 20 cọc: <strong>2.950.870.000 đ (29.1%)</strong>
          </div>
        </div>

        {/* Card 3: CPL lịch sử Meta Ads */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              CPL Lịch Sử BU5 (Meta Ads)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BarChart3 size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#b45309', letterSpacing: '-0.02em' }}>
            255.497 đ <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>/ SĐT</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Đã chi 2 tháng (T8+T9): <strong style={{ color: '#0f172a' }}>56.464.843 đ</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
            Phễu: <strong>993 Inbox (56.8k/msg) • 221 Lead SĐT</strong>
          </div>
        </div>

        {/* Card 4: Ngân sách Ads đề xuất */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '2px solid #10b981',
          padding: '18px 20px',
          boxShadow: '0 2px 6px rgba(16,185,129,0.08)',
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            top: '-10px',
            right: '12px',
            background: '#10b981',
            color: '#ffffff',
            fontSize: '0.7rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '10px'
          }}>
            Đang áp dụng: {selectedScenario}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase' }}>
              Ngân Sách Ads Đề Xuất (3 Tháng)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#15803d', letterSpacing: '-0.02em' }}>
            {formatMoney(bu5Summary.totalBudget)} đ
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '4px' }}>
            Bình quân: <strong>~{formatMoney(Math.round(bu5Summary.totalBudget / 3))} đ / tháng</strong>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#15803d', marginTop: '2px', fontWeight: 600 }}>
            Tỷ lệ Ads / DT kế hoạch: <strong>{bu5Summary.adsRatioOnFullRev.toFixed(2)}%</strong> (Định mức 1%)
          </div>
        </div>

        {/* Card 5: Kỳ vọng phễu chuyển đổi */}
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '18px 20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Kỳ Vọng Phễu Chuyển Đổi
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f3e8ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={17} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7e22ce', letterSpacing: '-0.02em' }}>
            ~{bu5Summary.totalLeads} Lead SĐT
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Chốt Ads: <strong style={{ color: '#7e22ce' }}>~{bu5Summary.totalPaxAds} Pax</strong> (+{bu5Summary.totalDepositedPax} cọc = <strong>{bu5Summary.totalPax}/{bu5Summary.totalTargetPax} Pax</strong>)
          </div>
          <div style={{ fontSize: '0.78rem', color: '#16a34a', marginTop: '2px', fontWeight: 600 }}>
            Đạt <strong>{bu5Summary.overallFillRate}% công suất</strong> • Ads/Lãi gộp: <strong>{bu5Summary.adsRatioOnProfit.toFixed(1)}%</strong>
          </div>
        </div>
      </div>

      {/* ── NỘI DUNG CHI TIẾT THEO TABS ── */}
      {activeTab === 'overview' && (
        <>
          {/* KHỐI 1: BẢN CHẤT THỊ TRƯỜNG & CHIẾN LƯỢC 5 TUYẾN BU5 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={20} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  1. Phân Tích Bản Chất BU5: Thị Trường Khám Phá Chiều Sâu &amp; Lợi Nhuận Gộp Đột Phá
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  Sản phẩm du lịch trải nghiệm độc bản, không cạnh tranh giá đại trà, biên lãi từ 15 đến 34 triệu/khách.
                </p>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginTop: '16px'
            }}>
              {/* Box 1: Murmansk Bắc Cực Quang Nga */}
              <div style={{
                background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
                border: '1.5px solid #7dd3fc',
                borderRadius: '10px',
                padding: '16px 18px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '14px',
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  MŨI NHỌN MÙA ĐÔNG (165.9M - 169.9M)
                </div>
                <h3 style={{ margin: '6px 0 8px', fontSize: '1rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Snowflake size={16} color="#0284c7" />
                  Bắc Cực Quang Murmansk (Nga)
                </h3>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Lợi thế độc quyền:</strong> Hành trình săn Cực quang tại Vòng Bắc Cực, trải nghiệm xe tuyết Husky, tàu phá băng nguyên tử.</li>
                  <li><strong>Biên lãi khủng:</strong> Giá tour ~168 triệu, lãi gộp đạt <strong>33.5 - 34 triệu/khách</strong>.</li>
                  <li><strong>CPL siêu tốt:</strong> Dữ liệu thực tế tháng 9 cho thấy CPL săn cực quang chỉ <strong>142.985 đ/lead</strong>!</li>
                </ul>
              </div>

              {/* Box 2: Ai Cập Sông Nile */}
              <div style={{
                background: 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)',
                border: '1.5px solid #fde68a',
                borderRadius: '10px',
                padding: '16px 18px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '14px',
                  background: '#d97706',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  DI SẢN NGHÌN NĂM (94.9M - 104.9M)
                </div>
                <h3 style={{ margin: '6px 0 8px', fontSize: '1rem', fontWeight: 800, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sun size={16} color="#d97706" />
                  Ai Cập Du Thuyền Sông Nile 5 Sao
                </h3>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Tuyến kinh điển:</strong> Kim Tự Tháp Giza, Thung lũng các Vị Vua, du thuyền 5 sao dọc sông Nile.</li>
                  <li><strong>2 Đợt khởi hành:</strong> 22/11 (đã có 3 khách cọc) và 20/12 (đón Giáng Sinh &amp; Tết Dương Lịch).</li>
                  <li><strong>Lãi gộp:</strong> Đạt <strong>18.9 - 21.0 triệu/khách</strong>.</li>
                </ul>
              </div>

              {/* Box 3: Ma Rốc Bắc Phi */}
              <div style={{
                background: 'linear-gradient(180deg, #fff1f2 0%, #ffffff 100%)',
                border: '1.5px solid #fecdd3',
                borderRadius: '10px',
                padding: '16px 18px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '14px',
                  background: '#e11d48',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  VIÊN NGỌC BẮC PHI (109.9M)
                </div>
                <h3 style={{ margin: '6px 0 8px', fontSize: '1rem', fontWeight: 800, color: '#9f1239', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Compass size={16} color="#e11d48" />
                  Ma Rốc &amp; Sa Mạc Sahara
                </h3>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Trải nghiệm độc đáo:</strong> Cưỡi lạc đà ngắm hoàng hôn sa mạc Sahara, thị trấn màu xanh Chefchaouen.</li>
                  <li><strong>Tình trạng booking:</strong> Đã có <strong>4 khách cọc</strong> (120 triệu tiền về), cần thêm 11 pax để full đoàn 15 chỗ.</li>
                  <li><strong>Biên lãi gộp:</strong> Đạt <strong>21.98 triệu/khách</strong>.</li>
                </ul>
              </div>

              {/* Box 4: Pakistan Mùa Thu */}
              <div style={{
                background: 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)',
                border: '1.5px solid #bbf7d0',
                borderRadius: '10px',
                padding: '16px 18px',
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-10px',
                  left: '14px',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  VIÊN NGỌC CHƯA MÀI (76.4M)
                </div>
                <h3 style={{ margin: '6px 0 8px', fontSize: '1rem', fontWeight: 800, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mountain size={16} color="#16a34a" />
                  Pakistan Thung Lũng Hunza
                </h3>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.83rem', color: '#334155', lineHeight: 1.6 }}>
                  <li><strong>Thành tích xuất sắc:</strong> Đoàn 17/10 đã <strong>FULL 100% CỌC (11/11 pax)</strong>, thu về 418 triệu tiền cọc.</li>
                  <li><strong>Kế hoạch Q4:</strong> Mở bán tiếp đợt 31/10 (11 pax), tập trung chuyển đổi tệp lead sẵn có.</li>
                  <li><strong>Biên lãi gộp:</strong> Đạt <strong>15.28 triệu/khách</strong>.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* KHỐI 2: DỮ LIỆU LỊCH SỬ META ADS BU5 (SỐ LIỆU THỰC POSTGRESQL) */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart3 size={20} color="#0284c7" />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    2. Dữ Liệu Lịch Sử Meta Ads Thực Tế BU5 (Đối Soát Database)
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    Trích xuất 100% từ bảng <code>marketing_ads_reports</code> trên PostgreSQL Production (Tháng 8 &amp; Tháng 9/2026).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#475569' }}>
                  Tổng ngân sách đã chi: <strong style={{ color: '#0f172a' }}>56.464.843 đ</strong>
                </div>
                <div style={{ background: '#fef3c7', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', color: '#92400e' }}>
                  Tổng phễu thu về: <strong>993 Inbox • 221 Lead SĐT</strong>
                </div>
              </div>
            </div>

            {/* Bảng chi tiết 2 tháng */}
            <div style={{ overflowX: 'auto', marginBottom: '18px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Tháng Báo Cáo</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center' }}>Số Adset</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Chi Phí (VNĐ)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Tin Nhắn (Inbox)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Chi Phí / Inbox</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Lead SĐT</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right' }}>Chi Phí / SĐT (CPL)</th>
                    <th style={{ padding: '10px 14px', textAlign: 'left' }}>Ghi Chú Đánh Giá</th>
                  </tr>
                </thead>
                <tbody>
                  {BU5_HISTORICAL_ADS_DATA.months.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{m.monthStr}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748b' }}>{m.adsets}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                        {formatMoney(m.spend)} đ
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>{m.messages}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b' }}>{formatMoney(m.cplMsg)} đ</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{m.leads}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#b45309' }}>
                        {formatMoney(m.cplLead)} đ
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: '#64748b' }}>{m.note}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '10px 14px', color: '#0f172a' }}>TỔNG CỘNG / TRUNG BÌNH</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}>43 Adset</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#0284c7' }}>
                      {formatMoney(BU5_HISTORICAL_ADS_DATA.summary.totalSpend)} đ
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>{BU5_HISTORICAL_ADS_DATA.summary.totalMessages}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                      {formatMoney(BU5_HISTORICAL_ADS_DATA.summary.avgCplMsg)} đ
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#16a34a' }}>
                      {BU5_HISTORICAL_ADS_DATA.summary.totalLeads}
                    </td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', color: '#b45309' }}>
                      {formatMoney(BU5_HISTORICAL_ADS_DATA.summary.avgCplLead)} đ
                    </td>
                    <td style={{ padding: '10px 14px', color: '#16a34a' }}>Đạt tiêu chuẩn CPL dòng tour cao cấp</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bảng Top Adset Chiến Dịch */}
            <h4 style={{ margin: '14px 0 8px', fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>
              🎯 Các Adset Trọng Tâm Chi Phí Lớn Nhất BU5:
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
              {BU5_HISTORICAL_ADS_DATA.topAdsets.map((ad, i) => (
                <div key={i} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {ad.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                    <span>Đã chi: <strong style={{ color: '#0284c7' }}>{formatMoney(ad.spend)} đ</strong></span>
                    <span>Lead SĐT: <strong style={{ color: '#16a34a' }}>{ad.leads}</strong> ({formatMoney(ad.cpl)} đ/lead)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KHỐI 3: QUYẾT ĐỊNH NGÂN SÁCH 100 TRIỆU CHO Q4 & 3 KỊCH BẢN TƯƠNG TÁC */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    3. Quyết Định Ngân Sách 100 Triệu / 3 Tháng Q4 (Chuẩn Định Mức 1%) &amp; Các Kịch Bản
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    Doanh thu kế hoạch 8 đoàn đạt 10.135 Tỷ $\rightarrow$ Định mức Marketing 1% chính xác là 101.35 Triệu (Làm tròn: 100.000.000 đ).
                  </p>
                </div>
              </div>
            </div>

            {/* Giải trình định mức */}
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px 18px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
              <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertCircle size={16} color="#d97706" />
                <span>Căn cứ định mức tài chính Ban Giám Đốc (CEO):</span>
              </div>
              <p style={{ margin: '4px 0' }}>
                • <strong>Tại sao 100 Triệu cho 3 tháng?</strong> Bình quân ~33.3 Triệu/tháng cho toàn BU5. Với 8 đoàn khởi hành giá trị cao (tổng doanh thu 10.135 Tỷ và lãi gộp lên tới 2.027 Tỷ), mức chi 100 triệu chỉ chiếm đúng <strong>0.99% Doanh thu</strong> và <strong>4.93% Lãi gộp</strong>, hoàn toàn nằm trong trần an toàn vốn của doanh nghiệp.
              </p>
              <p style={{ margin: '4px 0 0' }}>
                • <strong>Kỳ vọng mang lại:</strong> Thu về <strong>~397 Lead SĐT</strong> (~1.480 Inbox tư vấn), dự kiến chốt thêm <strong>~36 khách từ Ads</strong>. Cộng dồn với 20 khách đã cọc trước đó sẽ đạt <strong>56/91 Pax (61.5% tải tổng)</strong>, mang về doanh thu thực tế ước tính <strong>~6.32 Tỷ đồng</strong> và lãi gộp đạt trên <strong>1.26 Tỷ đồng</strong>!
              </p>
            </div>

            {/* 3 Thẻ Kịch Bản Tương Tác */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px'
            }}>
              {/* Kịch bản 1: CEO 100M */}
              <div 
                onClick={() => applyScenario('CEO')}
                style={{
                  border: selectedScenario === 'CEO' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: selectedScenario === 'CEO' ? '#f0fdf4' : '#ffffff',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {selectedScenario === 'CEO' && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    ĐANG CHỌN
                  </span>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: '4px' }}>
                  KỊCH BẢN CHÍNH • ĐỊNH MỨC 1% (100M / 3 THÁNG)
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  100.000.000 đ
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  • Phân bổ 5 tuyến: Murmansk 28M, Ai Cập 28M, Ma Rốc 20M, Pakistan 16M, Trung Á 8M.<br/>
                  • Lead kỳ vọng: <strong>~397 SĐT</strong> • Chốt: <strong>~36 Pax Ads</strong><br/>
                  • Tải đạt: <strong>56/91 Pax (61.5%)</strong> • % Ads/DT: <strong>0.99%</strong>
                </div>
              </div>

              {/* Kịch bản 2: SAFE 60M */}
              <div 
                onClick={() => applyScenario('SAFE')}
                style={{
                  border: selectedScenario === 'SAFE' ? '2px solid #0284c7' : '1px solid #e2e8f0',
                  background: selectedScenario === 'SAFE' ? '#f0f9ff' : '#ffffff',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {selectedScenario === 'SAFE' && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    ĐANG CHỌN
                  </span>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', marginBottom: '4px' }}>
                  KỊCH BẢN AN TOÀN VỐN (60M / 3 THÁNG)
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  60.000.000 đ
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  • Rút gọn ngân sách còn 20 Tr/tháng, chỉ tập trung Murmansk &amp; Ai Cập.<br/>
                  • Lead kỳ vọng: <strong>~238 SĐT</strong> • Chốt: <strong>~21 Pax Ads</strong><br/>
                  • Tải đạt: <strong>41/91 Pax (45.1%)</strong> • % Ads/DT: <strong>0.59%</strong>
                </div>
              </div>

              {/* Kịch bản 3: GROWTH 150M */}
              <div 
                onClick={() => applyScenario('GROWTH')}
                style={{
                  border: selectedScenario === 'GROWTH' ? '2px solid #8b5cf6' : '1px solid #e2e8f0',
                  background: selectedScenario === 'GROWTH' ? '#faf5ff' : '#ffffff',
                  borderRadius: '10px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                {selectedScenario === 'GROWTH' && (
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '12px',
                    background: '#8b5cf6',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '10px'
                  }}>
                    ĐANG CHỌN
                  </span>
                )}
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#8b5cf6', textTransform: 'uppercase', marginBottom: '4px' }}>
                  KỊCH BẢN TĂNG TỐC MỞ RỘNG (150M / 3 THÁNG)
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  150.000.000 đ
                </div>
                <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
                  • Chi 50 Tr/tháng để phủ sóng săn cực quang Nga &amp; Noel Ai Cập.<br/>
                  • Lead kỳ vọng: <strong>~595 SĐT</strong> • Chốt: <strong>~54 Pax Ads</strong><br/>
                  • Tải đạt: <strong>74/91 Pax (81.3%)</strong> • % Ads/DT: <strong>1.48%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* KHỐI 4: BẢNG MA TRẬN TỔNG HỢP 5 TUYẾN BU5 */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '24px 28px',
            marginBottom: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                  4. Bảng Phân Bổ Ngân Sách &amp; Dự Báo Phễu Chuyển Đổi 5 Tuyến BU5
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                  Tự động tính toán theo kịch bản đang chọn: <strong>{selectedScenario} ({formatMoney(bu5Summary.totalBudget)} đ)</strong>.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tuyến Tour</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Số Đoàn</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Ngân Sách (VNĐ)</th>
                    <th style={{ padding: '10px 12px', textAlign: 'center' }}>Tỷ Trọng</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>CPL Dự Kiến</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Lead SĐT</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Khách Ads</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Đã Cọc</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Tổng Pax</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Tải Đoàn</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Doanh Thu Dự Kiến</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.keys(BU5_ROUTES_CONFIG).map(k => {
                    const conf = BU5_ROUTES_CONFIG[k];
                    const c = calcs[k];
                    const r = routeResults[k];
                    const pct = bu5Summary.totalBudget > 0 ? ((c.budget / bu5Summary.totalBudget) * 100).toFixed(1) : '0';

                    return (
                      <tr key={k} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 700, color: conf.color }}>
                          {conf.name}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>
                          {conf.departures.length} đoàn
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {formatMoney(c.budget)} đ
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                          {pct}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#b45309', fontWeight: 600 }}>
                          {formatMoney(c.cpl)} đ
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                          {r.leads}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#7e22ce' }}>
                          ~{r.paxAds} pax
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                          {c.depositedPax} cọc
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                          {r.totalPax} / {c.targetPax}
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: r.fillRate >= 60 ? '#16a34a' : '#d97706' }}>
                          {r.fillRate}%
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                          {formatMoney(r.totalEstimatedRev)} đ
                        </td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '12px', color: '#0f172a' }}>TỔNG CỘNG 5 TUYẾN</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>8 Đoàn</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#16a34a', fontSize: '0.92rem' }}>
                      {formatMoney(bu5Summary.totalBudget)} đ
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>100%</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#0284c7' }}>
                      {bu5Summary.totalLeads} Lead
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#7e22ce' }}>
                      ~{bu5Summary.totalPaxAds} Pax
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#16a34a' }}>
                      {bu5Summary.totalDepositedPax} Cọc
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#0f172a' }}>
                      {bu5Summary.totalPax} / {bu5Summary.totalTargetPax}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#16a34a' }}>
                      {bu5Summary.overallFillRate}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: '#0284c7', fontSize: '0.92rem' }}>
                      ~{formatMoney(bu5Summary.totalEstimatedRev)} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 5: KÝ TRÌNH BAN GIÁM ĐỐC & CTA */}
          <div style={{
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '12px',
            padding: '28px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div>
              <div style={{ display: 'inline-block', background: 'rgba(217, 119, 6, 0.25)', border: '1px solid rgba(217, 119, 6, 0.5)', padding: '3px 10px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '10px' }}>
                KÝ TRÌNH PHÊ DUYỆT • MARKETING &amp; BAN GIÁM ĐỐC
              </div>
              <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Đề Xuất Phê Duyệt Ngân Sách BU5 Quý 4/2026: {formatMoney(bu5Summary.totalBudget)} VNĐ
              </h3>
              <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#94a3b8', maxWidth: '780px', lineHeight: 1.55 }}>
                Bản đề án tối ưu dòng tiền theo đúng định mức 1% Doanh thu: Phân bổ 100 triệu cho 3 tháng trên cả 5 tuyến khám phá độc bản — Đón đầu mùa Cực quang Nga Murmansk (28M) &amp; Ai Cập Noel (28M), hoàn tất lấp đầy 8 đoàn khởi hành với doanh thu kế hoạch vượt 10 Tỷ đồng.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleTabChange('murmansk')}
                style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calculator size={16} />
                <span>Mở Máy Tính Từng Tuyến</span>
              </button>
              <button
                onClick={() => handleTabChange('departures')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  padding: '11px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calendar size={16} />
                <span>Chi Tiết 8 Đoàn ERP</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── CHI TIẾT TỪNG TUYẾN (MÁY TÍNH DỰ TOÁN) ── */}
      {['murmansk', 'aicap', 'maroc', 'pakistan', 'trunga'].includes(activeTab) && (() => {
        const routeKey = activeTab;
        const routeConf = BU5_ROUTES_CONFIG[routeKey];
        const c = calcs[routeKey];
        const res = routeResults[routeKey];
        const RouteIcon = routeConf.icon;

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
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: routeConf.badgeColor, color: routeConf.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <RouteIcon size={24} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                      Máy Tính Dự Toán: {routeConf.name}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                      {routeConf.subName} • Giá tour: <strong>{routeConf.priceRange}</strong>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', color: '#475569' }}>
                    Số đoàn Q4: <strong style={{ color: '#0f172a' }}>{routeConf.departures.length} đoàn</strong>
                  </div>
                  <div style={{ background: '#ecfdf5', border: '1px solid #86efac', padding: '6px 12px', borderRadius: '6px', fontSize: '0.82rem', color: '#166534' }}>
                    Lãi gộp: <strong>~{formatMoney(routeConf.profitPerPax)} đ / khách</strong>
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
                  <span>Tham Số Dự Toán (Input)</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Ngân sách */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Ngân sách Ads dự kiến (3 tháng Q4):
                    </label>
                    <CurrencyInput
                      value={c.budget}
                      onChange={(v) => updateRouteCalc(routeKey, 'budget', v)}
                    />
                  </div>

                  {/* CPL */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Chi phí trên mỗi Lead SĐT (CPL):
                    </label>
                    <CurrencyInput
                      value={c.cpl}
                      onChange={(v) => updateRouteCalc(routeKey, 'cpl', v)}
                    />
                    <span style={{ fontSize: '0.74rem', color: '#64748b', display: 'block', marginTop: '3px' }}>
                      Lịch sử thực tế: <strong>~{formatMoney(routeConf.historicalCpl)} đ</strong>
                    </span>
                  </div>

                  {/* Tỷ lệ chốt CR */}
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
                      Định mức dòng cao cấp: <strong>7.5% - 10.0%</strong>
                    </span>
                  </div>

                  {/* Khách đã cọc */}
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Khách đã cọc thực tế (Database):
                    </label>
                    <NumberInput
                      value={c.depositedPax}
                      onChange={(v) => updateRouteCalc(routeKey, 'depositedPax', v)}
                      unit="pax"
                    />
                  </div>
                </div>
              </div>

              {/* Cột Phải: Kết Quả Dự Báo Phễu */}
              <div style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '22px 24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={18} color="#16a34a" />
                  <span>Kết Quả Dự Báo Phễu (Output)</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Số Lead SĐT mang về:</span>
                    <strong style={{ color: '#0284c7', fontSize: '1rem' }}>{res.leads} Lead SĐT</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Khách chốt từ Ads:</span>
                    <strong style={{ color: '#7e22ce', fontSize: '1rem' }}>~{res.paxAds} Pax</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Tổng pax (+ khách cọc):</span>
                    <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{res.totalPax} / {res.targetPaxTotal} Pax ({res.fillRate}%)</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#166534' }}>Doanh thu dự kiến:</span>
                    <strong style={{ color: '#166534', fontSize: '1rem' }}>{formatMoney(res.totalEstimatedRev)} đ</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Lãi gộp ước tính:</span>
                    <strong style={{ color: '#0f172a' }}>{formatMoney(res.totalProfit)} đ</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: '#f8fafc', borderRadius: '6px', fontSize: '0.85rem' }}>
                    <span style={{ color: '#64748b' }}>Tỷ lệ Ads / Doanh thu:</span>
                    <strong style={{ color: '#0284c7' }}>{res.adsRatioOnRev.toFixed(2)}%</strong>
                  </div>
                </div>

                {/* Tính ngược: Để lấp đầy 100% chỗ */}
                <div style={{ marginTop: '16px', padding: '12px', background: '#fefce8', border: '1px solid #fde047', borderRadius: '8px', fontSize: '0.8rem', color: '#854d0e', lineHeight: 1.5 }}>
                  <strong>💡 Bài toán lấp đầy 100% ({res.targetPaxTotal} chỗ):</strong><br/>
                  Cần chốt thêm <strong>{res.neededPaxFromAds} Pax</strong> $\rightarrow$ Cần <strong>{res.neededLeads} Lead SĐT</strong> với ngân sách yêu cầu là <strong>{formatMoney(res.neededBudget)} đ</strong>.
                </div>
              </div>
            </div>

            {/* Danh sách các đoàn thuộc tuyến này */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <h3 style={{ margin: '0 0 14px', fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                Lịch Khởi Hành Q4/2026 Thuộc Tuyến: {routeConf.name}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Mã Đoàn</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Tên Tuyến Khởi Hành</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Ngày Bay</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Giá Bán / Pax</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Target</th>
                      <th style={{ padding: '8px 12px', textAlign: 'center' }}>Đã Cọc</th>
                      <th style={{ padding: '8px 12px', textAlign: 'right' }}>Tiền Cọc Đã Thu</th>
                      <th style={{ padding: '8px 12px', textAlign: 'left' }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {routeConf.departures.map(dep => (
                      <tr key={dep.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>{dep.code}</td>
                        <td style={{ padding: '8px 12px', fontWeight: 600, color: '#0f172a' }}>{dep.tuyen}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', color: '#475569' }}>{dep.date}</td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {formatMoney(dep.price)} đ
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>{dep.targetPax}p</td>
                        <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>
                          {dep.paidPax}p
                        </td>
                        <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                          {formatMoney(dep.paidRevenue)} đ
                        </td>
                        <td style={{ padding: '8px 12px', fontSize: '0.8rem', color: '#64748b' }}>{dep.statusText}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── DANH SÁCH 8 ĐOÀN KHỞI HÀNH (DEPARTURES TAB) ── */}
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
                Bảng Đối Soát 8 Đoàn Khởi Hành BU5 Quý 4/2026 (Database Production)
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                Đối soát trực tiếp từ bảng <code>marketing_budget_plans</code> &amp; <code>tour_departures</code>.
              </p>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: '6px', fontSize: '0.85rem', color: '#166534', fontWeight: 700 }}>
              Tổng Target: {allDeparturesList.reduce((s, d) => s + (d.targetPax || 0), 0)} Pax • Đã Cọc: {allDeparturesList.reduce((s, d) => s + (d.paidPax || 0), 0)} Pax • DT: {(allDeparturesList.reduce((s, d) => s + (d.targetPax * d.price), 0) / 1000000000).toFixed(3)} Tỷ
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Mã Đoàn</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tên Tuyến Khởi Hành</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Khởi Hành</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Target</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Giá Bán / Pax</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Doanh Thu Đoàn</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Lãi Gộp Kế Hoạch</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Đã Cọc</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>Tiền Cọc Đã Thu</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Tình Trạng</th>
                </tr>
              </thead>
              <tbody>
                {allDeparturesList.map((dep, index) => {
                  const grossProfitPerPax = dep.price - dep.cost;
                  const totalProfit = dep.targetPax * grossProfitPerPax;
                  const totalRev = dep.targetPax * dep.price;

                  return (
                    <tr key={dep.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>{index + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: dep.routeColor }}>{dep.code}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>{dep.tuyen}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#475569', whiteSpace: 'nowrap' }}>{dep.date}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>{dep.targetPax}p</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{formatMoney(dep.price)} đ</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>
                        {formatMoney(totalRev)} đ
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        {formatMoney(totalProfit)} đ
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>
                        {dep.paidPax}p
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                        {formatMoney(dep.paidRevenue)} đ
                      </td>
                      <td style={{ padding: '10px 12px', fontSize: '0.8rem', color: '#64748b' }}>
                        {dep.statusText}
                      </td>
                    </tr>
                  );
                })}
                {(() => {
                  const totalTarget = allDeparturesList.reduce((s, d) => s + (d.targetPax || 0), 0);
                  const totalRev = allDeparturesList.reduce((s, d) => s + (d.targetPax * d.price), 0);
                  const totalProfit = allDeparturesList.reduce((s, d) => s + (d.targetPax * (d.price - d.cost)), 0);
                  const totalPaidPax = allDeparturesList.reduce((s, d) => s + (d.paidPax || 0), 0);
                  const totalPaidRev = allDeparturesList.reduce((s, d) => s + (d.paidRevenue || 0), 0);

                  return (
                    <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan={4} style={{ padding: '12px', color: '#0f172a' }}>
                        TỔNG CỘNG 8 ĐOÀN BU5 (QUÝ 4/2026)
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#0f172a' }}>{totalTarget} Pax</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#0284c7', fontSize: '0.92rem' }}>
                        {formatMoney(totalRev)} đ
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#16a34a', fontSize: '0.92rem' }}>
                        {formatMoney(totalProfit)} đ
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', color: '#16a34a' }}>{totalPaidPax} Pax</td>
                      <td style={{ padding: '12px', textAlign: 'right', color: '#16a34a' }}>
                        {formatMoney(totalPaidRev)} đ
                      </td>
                      <td style={{ padding: '12px', color: '#16a34a' }}>
                        Đã cọc {((totalPaidPax / totalTarget) * 100).toFixed(1)}% chỉ tiêu
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BU5MarketPlanningPage;
