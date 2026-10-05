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
  Download
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
    const num = rawDigits ? parseInt(rawDigits, 10) : 0;
    setDisplayVal(rawDigits ? formatMoney(num) : '');
    onChange(num);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      background: isLight ? '#ffffff' : '#0d131f',
      borderRadius: '6px',
      border: isLight ? '1px solid #cbd5e1' : '1px solid #263346',
      padding: '0 10px'
    }}>
      <input
        type="text"
        value={displayVal}
        placeholder={placeholder}
        onChange={handleChange}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          color: isLight ? '#0f172a' : '#f8fafc',
          fontWeight: 600,
          fontSize: '0.92rem',
          padding: '8px 0',
          outline: 'none',
          fontFamily: 'inherit'
        }}
      />
      {unit && (
        <span style={{ fontSize: '0.8rem', color: '#64748b', marginLeft: '6px', userSelect: 'none' }}>
          {unit}
        </span>
      )}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// 1. DANH SÁCH 11 ĐOÀN KHỞI HÀNH THỰC TẾ BU2 (Q4/2026 & MÙA ĐÔNG 2027) ĐỒNG BỘ ERP
// Phân tách rõ ràng giữa Tour Liên Minh và Tour Trọng Điểm Hokkaido
// ══════════════════════════════════════════════════════════════════════════════
export const REAL_BU2_DEPARTURES = [
  // ── NHÓM 1: TOUR TRỌNG TÂM ĐỘC QUYỀN HOKKAIDO (ĐẦU TƯ TRỌNG TÂM) ──
  {
    id: 205,
    code: 'HOKKAIDO MÙA THU 2026-20261022',
    tuyen: 'HOKKAIDO MÙA THU 6N5Đ — ASAHIKAWA – FURANO – SAPPORO',
    tourKey: 'hokkaido',
    tourName: 'Hokkaido Mùa Thu Lá Đỏ 6N5Đ',
    isAlliance: false,
    date: '2026-10-22',
    month: 10,
    targetPax: 15,
    breakEvenPax: 10,
    price: 52990000,
    cost: 43500000,
    paidPax: 6,
    paidRevenue: 317940000,
    statusText: 'Mở bán (Trọng tâm)'
  },
  {
    id: 320,
    code: 'HOKKAIDO MÙA ĐÔNG 2027-20270114',
    tuyen: 'HOKKAIDO 6N6Đ — CUNG ĐƯỜNG TUYẾT TRẮNG & SỰ KIỆN BĂNG TUYẾT',
    tourKey: 'hokkaido',
    tourName: 'Hokkaido Mùa Đông Cung Đường Tuyết 6N6Đ',
    isAlliance: false,
    date: '2027-01-14',
    month: 1,
    targetPax: 25,
    breakEvenPax: 16,
    price: 56990000,
    cost: 47000000,
    paidPax: 4,
    paidRevenue: 227960000,
    statusText: 'Mở bán (Trọng tâm)'
  },

  // ── NHÓM 2: TOUR LIÊN MINH — NHẬT BẢN CUNG ĐƯỜNG VÀNG (3 ĐOÀN) ──
  {
    id: 303,
    code: 'NB-20261023',
    tuyen: 'NHẬT BẢN CUNG ĐƯỜNG VÀNG 6N5Đ (TOKYO - PHÚ SĨ - NAGOYA - KYOTO - OSAKA)',
    tourKey: 'cungduongvang',
    tourName: 'Nhật Bản Cung Đường Vàng 6N5Đ (Tháng 10)',
    isAlliance: true,
    date: '2026-10-23',
    month: 10,
    targetPax: 25,
    breakEvenPax: 18,
    price: 34990000,
    cost: 32000000,
    paidPax: 12,
    paidRevenue: 419880000,
    statusText: 'Mở bán (Liên minh)'
  },
  {
    id: 280,
    code: 'NB6N5Đ-20261106',
    tuyen: 'NHẬT BẢN CUNG ĐƯỜNG VÀNG 6N5Đ — MÙA LÁ ĐỎ MOMIJI',
    tourKey: 'cungduongvang',
    tourName: 'Nhật Bản Cung Đường Vàng 6N5Đ (Đầu T11)',
    isAlliance: true,
    date: '2026-11-06',
    month: 11,
    targetPax: 25,
    breakEvenPax: 18,
    price: 34990000,
    cost: 32000000,
    paidPax: 5,
    paidRevenue: 174950000,
    statusText: 'Mở bán (Liên minh)'
  },
  {
    id: 299,
    code: 'NB6N5Đ-20261128',
    tuyen: 'NHẬT BẢN CUNG ĐƯỜNG VÀNG 6N5Đ — ĐÓN KHÔNG KHÍ ĐÔNG',
    tourKey: 'cungduongvang',
    tourName: 'Nhật Bản Cung Đường Vàng 6N5Đ (Cuối T11)',
    isAlliance: true,
    date: '2026-11-28',
    month: 11,
    targetPax: 25,
    breakEvenPax: 18,
    price: 34990000,
    cost: 32000000,
    paidPax: 2,
    paidRevenue: 69980000,
    statusText: 'Mở bán (Liên minh)'
  },

  // ── NHÓM 3: TOUR LIÊN MINH — HÀN QUỐC (2 ĐOÀN) ──
  {
    id: 277,
    code: 'HÀN QUỐC-20261024',
    tuyen: 'HÀN QUỐC 5N4Đ: INCHEON - SEOUL - CV NAMI - EVERLAND (MÙA THU)',
    tourKey: 'hanquoc',
    tourName: 'Tour Hàn Quốc 5N4Đ Mùa Thu (Tháng 10)',
    isAlliance: true,
    date: '2026-10-24',
    month: 10,
    targetPax: 25,
    breakEvenPax: 17,
    price: 16990000,
    cost: 14800000,
    paidPax: 8,
    paidRevenue: 135920000,
    statusText: 'Mở bán (Liên minh)'
  },
  {
    id: 278,
    code: 'HÀN QUỐC-20261114',
    tuyen: 'HÀN QUỐC 5N4Đ: INCHEON - SEOUL - CV NAMI - ĐÓN GIÓ ĐÔNG',
    tourKey: 'hanquoc',
    tourName: 'Tour Hàn Quốc 5N4Đ (Tháng 11)',
    isAlliance: true,
    date: '2026-11-14',
    month: 11,
    targetPax: 25,
    breakEvenPax: 17,
    price: 16990000,
    cost: 14800000,
    paidPax: 3,
    paidRevenue: 50970000,
    statusText: 'Mở bán (Liên minh)'
  },

  // ── NHÓM 4: TOUR LIÊN MINH — ĐÀI LOAN (4 ĐOÀN) ──
  {
    id: 295,
    code: 'TAIWAN 5N4D 2026-20261009',
    tuyen: 'ĐÀI LOAN 5N4Đ: ĐÀI BẮC - ĐÀI TRUNG - CAO HÙNG (ĐỢT 1)',
    tourKey: 'dailoan',
    tourName: 'Tour Đài Loan 5N4Đ (09/10)',
    isAlliance: true,
    date: '2026-10-09',
    month: 10,
    targetPax: 25,
    breakEvenPax: 18,
    price: 13990000,
    cost: 12200000,
    paidPax: 14,
    paidRevenue: 195860000,
    statusText: 'Mở bán (Liên minh)'
  },
  {
    id: 296,
    code: 'TAIWAN 5N4D 2026-20261030',
    tuyen: 'ĐÀI LOAN 5N4Đ: ĐÀI BẮC - ĐÀI TRUNG - CAO HÙNG (ĐỢT 2)',
    tourKey: 'dailoan',
    tourName: 'Tour Đài Loan 5N4Đ (30/10)',
    isAlliance: true,
    date: '2026-10-30',
    month: 10,
    targetPax: 25,
    breakEvenPax: 18,
    price: 13990000,
    cost: 12200000,
    paidPax: 7,
    paidRevenue: 97930000,
    statusText: 'Mở bán (Liên minh)'
  },
  {
    id: 297,
    code: 'TAIWAN 5N4D 2026-20261113',
    tuyen: 'ĐÀI LOAN 5N4Đ: ĐÀI BẮC - ĐÀI TRUNG - CAO HÙNG (ĐỢT 3)',
    tourKey: 'dailoan',
    tourName: 'Tour Đài Loan 5N4Đ (13/11)',
    isAlliance: true,
    date: '2026-11-13',
    month: 11,
    targetPax: 25,
    breakEvenPax: 18,
    price: 13990000,
    cost: 12200000,
    paidPax: 4,
    paidRevenue: 55960000,
    statusText: 'Mở bán (Liên minh)'
  },
  {
    id: 298,
    code: 'TAIWAN 5N4D 2026-20261127',
    tuyen: 'ĐÀI LOAN 5N4Đ: ĐÀI BẮC - ĐÀI TRUNG - CAO HÙNG (ĐỢT 4)',
    tourKey: 'dailoan',
    tourName: 'Tour Đài Loan 5N4Đ (27/11)',
    isAlliance: true,
    date: '2026-11-27',
    month: 11,
    targetPax: 25,
    breakEvenPax: 18,
    price: 13990000,
    cost: 12200000,
    paidPax: 2,
    paidRevenue: 27980000,
    statusText: 'Mở bán (Liên minh)'
  }
];

// Cấu hình danh mục tuyến
export const BU2_ROUTES_CONFIG = {
  hokkaido: {
    id: 'hokkaido',
    name: 'Hokkaido (Mùa Thu & Cung Đường Tuyết)',
    badge: '🌟 TOUR RIÊNG CÓ GUU — TRỌNG TÂM (18 TRIỆU / QUÝ • 6 TR/THÁNG)',
    color: '#0284c7',
    bg: '#e0f2fe',
    tagColor: '#0369a1',
    isAlliance: false,
    description: 'Tuyến độc quyền cốt lõi "Du lịch có Guu" của FIT Tour. Trải nghiệm suối khoáng nóng Onsen, tuyết bột powdery snow, cua hoàng đế Taraba và làng tuyết Ningle Terrace. Biên lợi nhuận cực cao (~9.8 triệu/khách). Phân bổ 18 triệu trong 3 tháng (6 Tr/tháng) làm mũi nhọn dẫn dắt phễu và lấp đầy 2 đoàn.',
    defaultCalc: {
      budget: 18000000,
      cpl: 210000,
      cr: 10.5,
      paxPerLead: 1.0,
      numGroups: 2,
      paxPerGroup: 20,
      price: 55490000,
      cost: 45700000,
      extPax: 10
    }
  },
  cungduongvang: {
    id: 'cungduongvang',
    name: 'Nhật Bản Cung Đường Vàng (Liên Minh)',
    badge: '🤝 LIÊN MINH — CHẠY ADS CHỦ ĐỘNG (12 TRIỆU / QUÝ • 4 TR/THÁNG)',
    color: '#d97706',
    bg: '#fef3c7',
    tagColor: '#b45309',
    isAlliance: true,
    description: 'Tuyến Tokyo - Núi Phú Sĩ - Nagoya - Kyoto - Osaka 6N5Đ (3 đoàn). Phân bổ 12 triệu trong 3 tháng (4 Tr/tháng) chạy Ads chủ động giữ nhịp phễu lead, đón mùa lá đỏ Momiji và gom đủ quota 25 khách của FIT Tour.',
    defaultCalc: {
      budget: 12000000,
      cpl: 190000,
      cr: 9.5,
      paxPerLead: 1.0,
      numGroups: 3,
      paxPerGroup: 25,
      price: 34990000,
      cost: 32000000,
      extPax: 19
    }
  },
  hanquoc: {
    id: 'hanquoc',
    name: 'Hàn Quốc Mùa Thu 5N4Đ (Liên Minh)',
    badge: '🤝 LIÊN MINH — CHẠY ADS CHỦ ĐỘNG (7.5 TRIỆU / QUÝ • 2.5 TR/THÁNG)',
    color: '#dc2626',
    bg: '#fee2e2',
    tagColor: '#b91c1c',
    isAlliance: true,
    description: 'Tuyến Incheon - Seoul - Đảo Nami - Công viên Everland (2 đoàn T10 & T11). Phân bổ 7.5 triệu trong 3 tháng (2.5 Tr/tháng) kéo lead mùa thu vàng và hỗ trợ Sale gom đủ quota chỗ của FIT Tour.',
    defaultCalc: {
      budget: 7500000,
      cpl: 165000,
      cr: 9.0,
      paxPerLead: 1.0,
      numGroups: 2,
      paxPerGroup: 25,
      price: 16990000,
      cost: 14800000,
      extPax: 11
    }
  },
  dailoan: {
    id: 'dailoan',
    name: 'Đài Loan Mùa Thu Đông 5N4Đ (Liên Minh)',
    badge: '🤝 LIÊN MINH — CHẠY ADS CHỦ ĐỘNG (7.5 TRIỆU / QUÝ • 2.5 TR/THÁNG)',
    color: '#059669',
    bg: '#d1fae5',
    tagColor: '#047857',
    isAlliance: true,
    description: 'Tuyến Đài Bắc - Đài Trung - Cao Hùng 5N4Đ (4 đoàn T10 & T11). Giá tour hấp dẫn ~13.99M dễ chốt. Phân bổ 7.5 triệu trong 3 tháng (2.5 Tr/tháng) đẩy nhanh tốc độ chốt đơn cho 4 đợt khởi hành.',
    defaultCalc: {
      budget: 7500000,
      cpl: 140000,
      cr: 9.3,
      paxPerLead: 1.0,
      numGroups: 4,
      paxPerGroup: 25,
      price: 13990000,
      cost: 12200000,
      extPax: 27
    }
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU LỊCH SỬ META ADS THỰC TẾ BU2 (ĐÔNG BẮC Á / NHẬT BẢN) TỪ DATABASE ERP
// Trích xuất 100% từ bảng marketing_ads_reports trên PostgreSQL Production
// ══════════════════════════════════════════════════════════════════════════════
export const BU2_HISTORICAL_DATA = {
  totalSpend: 62162659,
  totalMessages: 735,
  totalLeads: 329,
  cplMsgAvg: 84575,
  cplLeadAvg: 188944,
  inboxToLeadRate: 44.76,
  months: [
    { month: 'Tháng 4/2026', count: 8, spend: 5957805, messages: 85, leads: 48, cplMsg: 70092, cplLead: 124121, note: 'Khởi động tour mùa xuân hoa anh đào Nhật Bản' },
    { month: 'Tháng 5/2026', count: 10, spend: 9828160, messages: 104, leads: 66, cplMsg: 94502, cplLead: 148912, note: 'Chạy tour hè Nhật Bản và Đông Bắc Á' },
    { month: 'Tháng 6/2026', count: 12, spend: 13026763, messages: 93, leads: 57, cplMsg: 140073, cplLead: 228540, note: 'Cao điểm hè các tuyến gia đình' },
    { month: 'Tháng 7/2026', count: 5, spend: 8438160, messages: 133, leads: 55, cplMsg: 63445, cplLead: 153421, note: 'Vét khách hè và nhận khách chớm thu' },
    { month: 'Tháng 8/2026', count: 7, spend: 8957476, messages: 98, leads: 26, cplMsg: 91403, cplLead: 344518, note: 'Tháng ngâu du lịch chững lại, CPL chạm đỉnh' },
    { month: 'Tháng 9/2026', count: 8, spend: 15954295, messages: 222, leads: 77, cplMsg: 71866, cplLead: 207199, note: 'Khởi động đón mùa thu vàng & nhận khách sớm' }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT CHÍNH: BU2 MARKET PLANNING & ADS PROJECTION
// ══════════════════════════════════════════════════════════════════════════════
const BU2MarketPlanningPage = ({ isEmbedded = false, onBack = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const getInitialTab = () => {
    if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'hokkaido') return 'hokkaido';
    if (['cungduongvang', 'hanquoc', 'dailoan', 'departures', 'proposal'].includes(tabParam)) {
      return tabParam;
    }
    return 'proposal';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'hokkaido') {
        setActiveTab('hokkaido');
      } else if (['cungduongvang', 'hanquoc', 'dailoan', 'departures', 'proposal'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // State lọc bảng 11 đoàn
  const [depMonthFilter, setDepMonthFilter] = useState('ALL'); // ALL, 10, 11, 1 (T1/2027)
  const [depTourFilter, setDepTourFilter] = useState('ALL');
  const [depModelFilter, setDepModelFilter] = useState('ALL'); // ALL, ALLIANCE, EXCLUSIVE
  const [depSearch, setDepSearch] = useState('');

  // Lọc 11 đoàn
  const filteredDepartures = useMemo(() => {
    return REAL_BU2_DEPARTURES.filter(d => {
      if (depMonthFilter !== 'ALL' && d.month !== Number(depMonthFilter)) return false;
      if (depTourFilter !== 'ALL' && d.tourKey !== depTourFilter) return false;
      if (depModelFilter === 'ALLIANCE' && !d.isAlliance) return false;
      if (depModelFilter === 'EXCLUSIVE' && d.isAlliance) return false;
      if (depSearch.trim()) {
        const q = depSearch.toLowerCase();
        return (
          d.code.toLowerCase().includes(q) ||
          d.tuyen.toLowerCase().includes(q) ||
          d.tourName.toLowerCase().includes(q) ||
          d.date.includes(q)
        );
      }
      return true;
    });
  }, [depMonthFilter, depTourFilter, depModelFilter, depSearch]);

  // Tổng hợp dữ liệu lọc
  const depStats = useMemo(() => {
    let target = 0;
    let paid = 0;
    let targetRev = 0;
    let paidRev = 0;
    filteredDepartures.forEach(d => {
      target += d.targetPax;
      paid += d.paidPax;
      targetRev += d.targetPax * d.price;
      paidRev += d.paidRevenue;
    });
    return { target, paid, remaining: target - paid, targetRev, paidRev };
  }, [filteredDepartures]);

  // Tổng hợp dữ liệu CHUẨN XÁC 100% TOÀN BỘ 11 ĐOÀN ERP (Không phụ thuộc filter)
  const allDepStats = useMemo(() => {
    let target = 0;
    let paid = 0;
    let targetRev = 0;
    let paidRev = 0;
    let q4TargetRev = 0;
    let q4PaidRev = 0;
    let q4PaidPax = 0;
    let totalGrossProfit = 0;

    const tourStats = {
      hokkaido: { count: 0, targetPax: 0, paidPax: 0, targetRev: 0, paidRev: 0, grossProfit: 0 },
      cungduongvang: { count: 0, targetPax: 0, paidPax: 0, targetRev: 0, paidRev: 0, grossProfit: 0 },
      hanquoc: { count: 0, targetPax: 0, paidPax: 0, targetRev: 0, paidRev: 0, grossProfit: 0 },
      dailoan: { count: 0, targetPax: 0, paidPax: 0, targetRev: 0, paidRev: 0, grossProfit: 0 }
    };

    REAL_BU2_DEPARTURES.forEach(d => {
      const rev = d.targetPax * d.price;
      const profit = d.targetPax * (d.price - d.cost);
      target += d.targetPax;
      paid += d.paidPax;
      targetRev += rev;
      paidRev += d.paidRevenue;
      totalGrossProfit += profit;

      if (d.month !== 1) {
        q4TargetRev += rev;
        q4PaidRev += d.paidRevenue;
        q4PaidPax += d.paidPax;
      }

      if (tourStats[d.tourKey]) {
        tourStats[d.tourKey].count++;
        tourStats[d.tourKey].targetPax += d.targetPax;
        tourStats[d.tourKey].paidPax += d.paidPax;
        tourStats[d.tourKey].targetRev += rev;
        tourStats[d.tourKey].paidRev += d.paidRevenue;
        tourStats[d.tourKey].grossProfit += profit;
      }
    });

    return {
      target,
      paid,
      remaining: target - paid,
      targetRev,
      paidRev,
      q4TargetRev,
      q4PaidRev,
      q4PaidPax,
      totalGrossProfit,
      paidRate: target > 0 ? (paid / target) * 100 : 0,
      paidRevRate: targetRev > 0 ? (paidRev / targetRev) * 100 : 0,
      tourStats
    };
  }, []);

  // State các máy tính tuyến: Mặc định 45M / Quý (15M / Tháng) phân bổ 4 tuyến (Hokkaido 18M, CDV 12M, Hàn 7.5M, Đài 7.5M)
  const [calcs, setCalcs] = useState({
    hokkaido: { ...BU2_ROUTES_CONFIG.hokkaido.defaultCalc, budget: 18000000, cpl: 210000 },
    cungduongvang: { ...BU2_ROUTES_CONFIG.cungduongvang.defaultCalc, budget: 12000000, cpl: 190000 },
    hanquoc: { ...BU2_ROUTES_CONFIG.hanquoc.defaultCalc, budget: 7500000, cpl: 165000 },
    dailoan: { ...BU2_ROUTES_CONFIG.dailoan.defaultCalc, budget: 7500000, cpl: 140000 }
  });

  // State kịch bản ngân sách: 'CEO' (45M / Quý - 15M/Tháng), 'A' (38M - 1% Thực thu), 'B' (60M - Chuẩn 1% ERP Q4: 59.855.000 đ), 'C' (75M - Toàn chu kỳ kèm T1/2027)
  const [selectedScenario, setSelectedScenario] = useState('CEO');

  const applyScenario = (scen) => {
    setSelectedScenario(scen);
    if (scen === 'CEO') {
      // 45M / QUÝ (15M / THÁNG): PHÂN CHIA HỢP LÝ 4 TUYẾN (Hokkaido 18M, CDV 12M, Hàn 7.5M, Đài 7.5M)
      setCalcs(prev => ({
        ...prev,
        hokkaido: { ...prev.hokkaido, budget: 18000000, cpl: 210000 },
        cungduongvang: { ...prev.cungduongvang, budget: 12000000, cpl: 190000 },
        hanquoc: { ...prev.hanquoc, budget: 7500000, cpl: 165000 },
        dailoan: { ...prev.dailoan, budget: 7500000, cpl: 140000 }
      }));
    } else if (scen === 'A') {
      // 38M: 1% Thực thu FIT Tour (112 pax)
      setCalcs(prev => ({
        ...prev,
        hokkaido: { ...prev.hokkaido, budget: 25000000 },
        cungduongvang: { ...prev.cungduongvang, budget: 7000000 },
        hanquoc: { ...prev.hanquoc, budget: 3000000 },
        dailoan: { ...prev.dailoan, budget: 3000000 }
      }));
    } else if (scen === 'B') {
      // 60M: CHUẨN 1% ERP Q4/2026 (Khớp 59.855.000 đ trên tổng DT 5.985.500.000 đ)
      setCalcs(prev => ({
        ...prev,
        hokkaido: { ...prev.hokkaido, budget: 30000000 },
        cungduongvang: { ...prev.cungduongvang, budget: 18000000 },
        hanquoc: { ...prev.hanquoc, budget: 6000000 },
        dailoan: { ...prev.dailoan, budget: 6000000 }
      }));
    } else if (scen === 'C') {
      // 75M: 1% Gross gồm cả đoàn Hokkaido 14/01/2027 (7.09 Tỷ)
      setCalcs(prev => ({
        ...prev,
        hokkaido: { ...prev.hokkaido, budget: 40000000 },
        cungduongvang: { ...prev.cungduongvang, budget: 20000000 },
        hanquoc: { ...prev.hanquoc, budget: 8000000 },
        dailoan: { ...prev.dailoan, budget: 7000000 }
      }));
    }
  };

  const updateCalc = (key, field, val) => {
    setCalcs(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: val }
    }));
  };

  // Hàm tính toán xuôi và ngược cho từng tuyến
  const getRouteCalcResults = (key) => {
    const c = calcs[key];
    const leads = c.cpl > 0 ? Math.round(c.budget / c.cpl) : 0;
    const paxAds = Math.round(leads * (c.cr / 100) * c.paxPerLead);
    const totalPax = paxAds + (c.extPax || 0);
    const targetPaxTotal = c.numGroups * c.paxPerGroup;
    const revenueAds = paxAds * c.price;
    const totalRevenue = totalPax * c.price;
    const totalTourCost = totalPax * c.cost;
    const grossProfit = totalRevenue - totalTourCost;
    const netProfitAfterAds = grossProfit - c.budget;
    const adsRatio = totalRevenue > 0 ? (c.budget / totalRevenue) * 100 : 0;

    // Tính ngược: Để full targetPaxTotal cần bao nhiêu ngân sách
    const neededPaxFromAds = Math.max(0, targetPaxTotal - (c.extPax || 0));
    const neededLeads = (c.cr > 0 && c.paxPerLead > 0) ? Math.ceil(neededPaxFromAds / ((c.cr / 100) * c.paxPerLead)) : 0;
    const neededBudget = neededLeads * c.cpl;

    return {
      leads,
      paxAds,
      totalPax,
      targetPaxTotal,
      revenueAds,
      totalRevenue,
      totalTourCost,
      grossProfit,
      netProfitAfterAds,
      adsRatio,
      neededPaxFromAds,
      neededLeads,
      neededBudget
    };
  };

  // Tổng hợp chỉ số toàn bộ BU2
  const bu2Summary = useMemo(() => {
    let totalBudget = 0;
    let totalLeads = 0;
    let totalPaxAds = 0;
    let totalPax = 0;
    let totalTargetPax = 0;
    let totalRevenue = 0;
    let totalGrossProfit = 0;
    let totalNetProfit = 0;

    Object.keys(calcs).forEach(key => {
      const res = getRouteCalcResults(key);
      const c = calcs[key];
      totalBudget += c.budget;
      totalLeads += res.leads;
      totalPaxAds += res.paxAds;
      totalPax += res.totalPax;
      totalTargetPax += res.targetPaxTotal;
      totalRevenue += res.totalRevenue;
      totalGrossProfit += res.grossProfit;
      totalNetProfit += res.netProfitAfterAds;
    });

    const adsRatio = totalRevenue > 0 ? (totalBudget / totalRevenue) * 100 : 0;
    const hokkaidoBudget = calcs.hokkaido.budget;
    const hokkaidoRatio = totalBudget > 0 ? (hokkaidoBudget / totalBudget) * 100 : 0;
    const allianceBudget = totalBudget - hokkaidoBudget;

    return {
      totalBudget,
      totalLeads,
      totalPaxAds,
      totalPax,
      totalTargetPax,
      totalRevenue,
      totalGrossProfit,
      totalNetProfit,
      adsRatio,
      adsPercent: adsRatio,
      hokkaidoBudget,
      hokkaidoRatio,
      allianceBudget
    };
  }, [calcs]);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* ── HEADER THANH ĐIỀU HƯỚNG ── */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '14px 24px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <Link 
                to="/marketing-budget-plan" 
                style={{ color: '#0284c7', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ← Kế Hoạch Quý (Budget Plan)
              </Link>
              <span style={{ color: '#94a3b8' }}>/</span>
              <span style={{ fontSize: '0.84rem', color: '#64748b' }}>BU2 - Đông Bắc Á (Nhật • Hàn • Đài)</span>
              <span style={{
                background: '#e0f2fe',
                color: '#0369a1',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                11 ĐOÀN ERP (Q4/2026 - T1/2027)
              </span>
              <span style={{
                background: '#fef3c7',
                color: '#b45309',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px'
              }}>
                MÔ HÌNH: LIÊN MINH + TRỌNG TÂM HOKKAIDO
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Đề Án Dự Toán & Ngân Sách BU2 Quý 4/2026 & Mùa Đông 2027
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Chiến lược kết hợp: <strong>Tour Liên Minh</strong> (Cung Đường Vàng, Hàn Quốc, Đài Loan) bảo toàn tỷ lệ khởi hành & <strong>Trọng tâm Hokkaido</strong> đột phá doanh thu và biên lợi nhuận cao cấp.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              to="/marketing-ads?bu=BU2"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f1f5f9',
                color: '#334155',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid #cbd5e1'
              }}
            >
              <span>174 Chiến Dịch Ads Lịch Sử BU2</span>
              <ExternalLink size={14} />
            </Link>
            <Link
              to="/marketing-budget-plan?bu=BU2&quarter=4&year=2026"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0284c7',
                color: '#ffffff',
                padding: '7px 14px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 1px 2px rgba(2,132,199,0.2)'
              }}
            >
              <span>Xem Module Budget Plan ERP</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* ── THANH TABS ĐIỀU HƯỚNG CÁC TUYẾN ── */}
        <div style={{ maxWidth: '1400px', margin: '12px auto 0', overflowX: 'auto', display: 'flex', gap: '6px', paddingBottom: '2px' }}>
          <button
            onClick={() => handleTabChange('proposal')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.83rem',
              fontWeight: activeTab === 'proposal' ? 700 : 500,
              background: activeTab === 'proposal' ? '#0f172a' : '#f1f5f9',
              color: activeTab === 'proposal' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <FileSpreadsheet size={15} />
            <span>📋 Đề Án & 11 Đoàn Khởi Hành</span>
            <span style={{
              background: activeTab === 'proposal' ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
              color: activeTab === 'proposal' ? '#ffffff' : '#0f172a',
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {formatMoney(bu2Summary.totalBudget)} đ
            </span>
          </button>

          <button
            onClick={() => handleTabChange('hokkaido')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.83rem',
              fontWeight: activeTab === 'hokkaido' ? 700 : 500,
              background: activeTab === 'hokkaido' ? '#0284c7' : '#f1f5f9',
              color: activeTab === 'hokkaido' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Snowflake size={15} />
            <span>❄️ Hokkaido (Tour Riêng Có Guu)</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '4px',
              background: activeTab === 'hokkaido' ? 'rgba(255,255,255,0.25)' : '#bae6fd',
              color: activeTab === 'hokkaido' ? '#ffffff' : '#0369a1',
              fontWeight: 700
            }}>
              2 đoàn • {formatMoney(calcs.hokkaido.budget)} đ
            </span>
          </button>

          <button
            onClick={() => handleTabChange('cungduongvang')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.83rem',
              fontWeight: activeTab === 'cungduongvang' ? 700 : 500,
              background: activeTab === 'cungduongvang' ? '#d97706' : '#f1f5f9',
              color: activeTab === 'cungduongvang' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Compass size={15} />
            <span>🗾 Cung Đường Vàng</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '4px',
              background: activeTab === 'cungduongvang' ? 'rgba(255,255,255,0.25)' : '#fed7aa',
              color: activeTab === 'cungduongvang' ? '#ffffff' : '#9a3412',
              fontWeight: 700
            }}>
              3 đoàn • {calcs.cungduongvang.budget > 0 ? formatMoney(calcs.cungduongvang.budget) + ' đ' : 'Liên Minh'}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('hanquoc')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.83rem',
              fontWeight: activeTab === 'hanquoc' ? 700 : 500,
              background: activeTab === 'hanquoc' ? '#dc2626' : '#f1f5f9',
              color: activeTab === 'hanquoc' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Flame size={15} />
            <span>🍁 Hàn Quốc</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '4px',
              background: activeTab === 'hanquoc' ? 'rgba(255,255,255,0.25)' : '#fecaca',
              color: activeTab === 'hanquoc' ? '#ffffff' : '#991b1b',
              fontWeight: 700
            }}>
              2 đoàn • {calcs.hanquoc.budget > 0 ? formatMoney(calcs.hanquoc.budget) + ' đ' : 'Liên Minh'}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('dailoan')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.83rem',
              fontWeight: activeTab === 'dailoan' ? 700 : 500,
              background: activeTab === 'dailoan' ? '#059669' : '#f1f5f9',
              color: activeTab === 'dailoan' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Layers size={15} />
            <span>🧋 Đài Loan</span>
            <span style={{
              fontSize: '0.7rem',
              padding: '1px 6px',
              borderRadius: '4px',
              background: activeTab === 'dailoan' ? 'rgba(255,255,255,0.25)' : '#a7f3d0',
              color: activeTab === 'dailoan' ? '#ffffff' : '#065f46',
              fontWeight: 700
            }}>
              4 đoàn • {calcs.dailoan.budget > 0 ? formatMoney(calcs.dailoan.budget) + ' đ' : 'Liên Minh'}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('departures')}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.83rem',
              fontWeight: activeTab === 'departures' ? 700 : 500,
              background: activeTab === 'departures' ? '#4f46e5' : '#f1f5f9',
              color: activeTab === 'departures' ? '#ffffff' : '#475569',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Calendar size={15} />
            <span>📅 Bảng 11 Đoàn Khởi Hành ERP</span>
            <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '10px', background: activeTab === 'departures' ? 'rgba(255,255,255,0.25)' : '#c7d2fe', color: activeTab === 'departures' ? '#ffffff' : '#3730a3', fontWeight: 700 }}>Live Data</span>
          </button>
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH (CONTAINER) ── */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 60px' }}>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: PROPOSAL (ĐỀ ÁN CHIẾN LƯỢC TOÀN DIỆN BU2)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'proposal' && (
          <div>
            {/* ── 5 THẺ CHỈ SỐ VÀNG BU2 SUMMARY (ĐỒNG BỘ CHUẨN BU1 CÓ CPL LỊCH SỬ DB) ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '14px',
              marginBottom: '24px'
            }}>
              {/* Card 1: Quy mô đoàn & khách */}
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '16px 18px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Quy Mô Đoàn & Khách
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                      <Users size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
                    11 Đoàn • {allDepStats.target} Pax
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#475569' }}>
                    10 đoàn Q4 (240p) • 1 đoàn T1/2027 (25p)
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.73rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  Đã cọc thực tế: <strong style={{ color: '#059669' }}>{allDepStats.paid} Pax ({allDepStats.paidRate.toFixed(1)}%)</strong> • Còn thiếu: <strong>{allDepStats.remaining} Pax</strong>
                </div>
              </div>

              {/* Card 2: Doanh Thu Dự Kiến */}
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '16px 18px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Doanh Thu Kế Hoạch BU2
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fae8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
                      <TrendingUp size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                    {formatMoney(allDepStats.targetRev)} đ
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#64748b' }}>
                    Tổng 11 đoàn (Riêng 10 đoàn Q4: <strong>{formatMoney(allDepStats.q4TargetRev)} đ</strong>)
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.73rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  Đã cọc thực tế: <strong style={{ color: '#059669' }}>{formatMoney(allDepStats.paidRev)} đ ({allDepStats.paidRevRate.toFixed(1)}%)</strong> • Lãi gộp KH: <strong style={{ color: '#0284c7' }}>~{formatMoney(allDepStats.totalGrossProfit)} đ</strong>
                </div>
              </div>

              {/* Card 3: CPL LỊCH SỬ THỰC TẾ TỪ DATABASE ERP (SỐ LIỆU CŨ ĐỐI SOÁT) */}
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '16px 18px',
                border: '1.5px solid #0284c7',
                boxShadow: '0 2px 6px rgba(2,132,199,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <BarChart3 size={13} color="#0284c7" />
                      CPL Lịch Sử BU2 (DB Meta Ads)
                    </span>
                    <span style={{ fontSize: '0.66rem', background: '#e0f2fe', color: '#0369a1', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      6 Tháng
                    </span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0284c7', lineHeight: 1.2 }}>
                    {formatMoney(BU2_HISTORICAL_DATA.cplLeadAvg)} đ <span style={{ fontSize: '0.76rem', fontWeight: 500, color: '#64748b' }}>/ SĐT</span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#334155', fontWeight: 600 }}>
                    Đã chi: <strong>{formatMoney(BU2_HISTORICAL_DATA.totalSpend)} đ</strong> • <strong>{BU2_HISTORICAL_DATA.totalLeads} Lead SĐT</strong>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.73rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                  50 Adset • <strong>{BU2_HISTORICAL_DATA.totalMessages} Inbox</strong> (~{formatMoney(BU2_HISTORICAL_DATA.cplMsgAvg)}đ/inbox) • CR: <strong>{BU2_HISTORICAL_DATA.inboxToLeadRate}%</strong>
                </div>
              </div>

              {/* Card 4: Tổng Ngân Sách Marketing Quyết Định CEO */}
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '16px 18px',
                border: '1.5px solid #16a34a',
                boxShadow: '0 2px 6px rgba(22,163,74,0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#15803d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      🎯 Ngân Sách Đề Xuất (45 Triệu / Quý • 15 Tr/Tháng)
                    </span>
                    <span style={{ fontSize: '0.66rem', background: '#dcfce7', color: '#15803d', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                      Đang Áp Dụng
                    </span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', lineHeight: 1.2 }}>
                    {formatMoney(bu2Summary.totalBudget)} đ
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#166534', fontWeight: 700 }}>
                    Hokkaido: {formatMoney(calcs.hokkaido.budget)} đ • 3 Tuyến Liên Minh: {formatMoney(bu2Summary.totalBudget - calcs.hokkaido.budget)} đ
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.73rem', color: '#64748b', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
                  Phân bổ 3 tháng: <strong>~{(bu2Summary.totalBudget / 3 / 1000000).toFixed(1)} Tr/tháng</strong> • % Ads/DT 10 đoàn Q4: <strong style={{ color: '#15803d' }}>{(allDepStats.q4TargetRev > 0 ? (bu2Summary.totalBudget / allDepStats.q4TargetRev) * 100 : 0).toFixed(2)}%</strong> (Toàn 11 đoàn: {(allDepStats.targetRev > 0 ? (bu2Summary.totalBudget / allDepStats.targetRev) * 100 : 0).toFixed(2)}%)
                </div>
              </div>

              {/* Card 5: Dự Báo Toàn Phễu 4 Tuyến BU2 */}
              <div style={{
                background: '#ffffff',
                borderRadius: '10px',
                padding: '16px 18px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Kỳ Vọng Phễu 4 Tuyến BU2 (3 Tháng)
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                      <PhoneCall size={16} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#d97706', lineHeight: 1.2 }}>
                    ~{bu2Summary.totalLeads} Lead SĐT
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.76rem', color: '#475569' }}>
                    ~{Math.round(bu2Summary.totalLeads / (BU2_HISTORICAL_DATA.inboxToLeadRate / 100))} Inbox • Dự kiến chốt: <strong style={{ color: '#059669' }}>~{bu2Summary.totalPaxAds} Pax Ads</strong>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '0.73rem', color: '#64748b', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  +{allDepStats.paid} cọc = <strong>~{allDepStats.paid + bu2Summary.totalPaxAds}/{allDepStats.target} Pax ({(((allDepStats.paid + bu2Summary.totalPaxAds) / allDepStats.target) * 100).toFixed(1)}% tải)</strong> • Ads/Lãi gộp: <strong style={{ color: '#16a34a' }}>{allDepStats.totalGrossProfit > 0 ? ((bu2Summary.totalBudget / allDepStats.totalGrossProfit) * 100).toFixed(1) : 0}%</strong>
                </div>
              </div>
            </div>

            {/* KHỐI 1: BẢN CHẤT CHIẾN LƯỢC BU2 — MÔ HÌNH 2 TRỤC */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '24px 28px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#0f172a', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Compass size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    1. Phân Tích Bản Chất Thị Trường BU2: Bài Toán "Tour Liên Minh vs Trọng Tâm Hokkaido"
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    Chiến lược giải phóng nguồn lực Marketing, tối ưu tỷ suất lợi nhuận trên từng đồng ngân sách quảng cáo.
                  </p>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '18px',
                marginTop: '18px'
              }}>
                {/* Trục 1: Trọng Tâm Hokkaido */}
                <div style={{
                  background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
                  border: '2px solid #38bdf8',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '16px',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em'
                  }}>
                    TRỤC MŨI NHỌN GUU — TOUR RIÊNG THIẾT KẾ (HOKKAIDO 18 TRIỆU • 40%)
                  </div>
                  <h3 style={{ margin: '8px 0 10px', fontSize: '1.05rem', fontWeight: 800, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Snowflake size={18} color="#0284c7" />
                    Hokkaido: Tuyến Trọng Điểm Độc Quyền & Biên Lợi Nhuận Cao
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.65 }}>
                    <li>
                      <strong>Định vị thương hiệu FIT Tour ("Du lịch có Guu"):</strong> Không đánh đồng với các tour Nhật đại trà. Hokkaido là sản phẩm chiều sâu: tắm suối khoáng nóng Onsen lộ thiên ngắm tuyết rơi, thưởng thức cua tuyết Taraba, trượt tuyết tuyết bột powdery snow mềm mịn số 1 thế giới tại Niseko/Kiroro.
                    </li>
                    <li>
                      <strong>Biên lợi nhuận gộp cực dày:</strong> Giá tour từ <strong>52.990.000 đ – 56.990.000 đ</strong>. Biên lợi nhuận gộp đạt <strong>7.000.000 đ – 10.000.000 đ/khách</strong> (gấp 3 - 4 lần tour liên minh).
                    </li>
                    <li>
                      <strong>Chiến lược phân bổ ngân sách:</strong> Phân bổ <strong>18.000.000 đ (40% ngân sách BU2 — 6.000.000 đ/tháng)</strong> trong 3 tháng cho 2 đoàn Hokkaido (đoàn Mùa Thu 22/10 và đoàn Mùa Tuyết Trắng 14/01/2027) nhằm tối đa hóa tỷ suất lợi nhuận ròng (~9.8 triệu/khách).
                    </li>
                  </ul>
                </div>

                {/* Trục 2: Tour Liên Minh */}
                <div style={{
                  background: 'linear-gradient(180deg, #fefce8 0%, #ffffff 100%)',
                  border: '2px solid #fde047',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '-11px',
                    left: '16px',
                    background: '#ca8a04',
                    color: '#ffffff',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: '12px',
                    letterSpacing: '0.04em'
                  }}>
                    TRỤC TOUR LIÊN MINH — VẪN CHẠY ADS CHỦ ĐỘNG (27 TRIỆU / QUÝ • 60%)
                  </div>
                  <h3 style={{ margin: '8px 0 10px', fontSize: '1.05rem', fontWeight: 800, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Share2 size={18} color="#ca8a04" />
                    Cung Đường Vàng, Hàn Quốc, Đài Loan: Vẫn Chạy Ads Tạo Phễu Lead & Lấp Đầy Ghế
                  </h3>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: '#334155', lineHeight: 1.65 }}>
                    <li>
                      <strong>Đặc thù mô hình Liên Minh (Alliance):</strong> Các thị trường Nhật - Hàn - Đài chủ yếu vận hành theo tour liên minh gom khách chung. Do team MKT không nắm sâu từng tuyến liên minh nên <strong>dự toán phân bổ này được chính BU2 chủ động đề xuất</strong> để bám sát nhịp tải và cam kết với đối tác.
                    </li>
                    <li>
                      <strong>Kế thừa dữ liệu cũ đang chạy (~16 Triệu/tháng):</strong> Thực tế team BU2 đang duy trì nhịp chạy khoảng 16 triệu/tháng (Tháng 9/2026 chi 15.95M). Mức đề xuất 15 triệu/tháng (chia 9M cho liên minh và 6M cho Hokkaido) kế thừa trực tiếp nhịp chạy quen thuộc này để chủ động nguồn khách.
                    </li>
                    <li>
                      <strong>Phân bổ 27.000.000 đ (60% ngân sách Q4 — 9.000.000 đ/tháng):</strong> Chia đều cho 3 tuyến trong 3 tháng: Cung Đường Vàng (12.000.000 đ — 4 Tr/tháng), Hàn Quốc (7.500.000 đ — 2.5 Tr/tháng) và Đài Loan (7.500.000 đ — 2.5 Tr/tháng). Dự kiến mang về <strong>~162 Lead SĐT</strong> và chốt thêm <strong>~15 Pax Ads</strong>, lấp đầy hạn ngạch ghế của FIT Tour trong 9 đoàn liên minh.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* KHỐI 2: DỮ LIỆU LỊCH SỬ META ADS THỰC TẾ BU2 (SỐ LIỆU CŨ ĐỐI SOÁT DATABASE) */}
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
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      2. Dữ Liệu Lịch Sử Meta Ads Thực Tế BU2 (Số Liệu Cũ Đối Soát Database)
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                      Trích xuất 100% từ bảng <code>marketing_ads_reports</code> trên PostgreSQL Production (Tháng 4 → Tháng 9/2026).
                    </p>
                  </div>
                </div>
                <span style={{ fontSize: '0.78rem', background: '#ecfdf5', padding: '5px 12px', borderRadius: '6px', border: '1px solid #a7f3d0', color: '#047857', fontWeight: 700 }}>
                  ✔ Đã đối soát 6 tháng gần nhất (50 Chiến dịch & Adset)
                </span>
              </div>

              {/* 4 Cards tổng kết số liệu lịch sử DB */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '18px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Tổng Chi Tiêu Thực Tế</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{formatMoney(BU2_HISTORICAL_DATA.totalSpend)} đ</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>Đông Bắc Á (Nhật Bản, Hàn, Đài)</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Tổng Tin Nhắn Inbox</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>{formatMoney(BU2_HISTORICAL_DATA.totalMessages)} Inbox</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>Giá TB: ~{formatMoney(BU2_HISTORICAL_DATA.cplMsgAvg)} đ / tin nhắn</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Tổng Lead Có SĐT</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669', marginTop: '4px' }}>{BU2_HISTORICAL_DATA.totalLeads} Lead SĐT</div>
                  <div style={{ fontSize: '0.74rem', color: '#059669', marginTop: '3px', fontWeight: 600 }}>Tỷ lệ SĐT/Inbox: {BU2_HISTORICAL_DATA.inboxToLeadRate}%</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Giá TB 1 Lead SĐT (CPL)</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d97706', marginTop: '4px' }}>{formatMoney(BU2_HISTORICAL_DATA.cplLeadAvg)} đ</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>Chuẩn chi phí thực tế toàn kỳ</div>
                </div>
              </div>

              {/* Bảng chi tiết từng tháng */}
              <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Thời Điểm</th>
                      <th style={{ padding: '10px 10px', textAlign: 'center', fontWeight: 700 }}>Số Chiến Dịch</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700 }}>Chi Tiêu Thực Tế</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Inbox</th>
                      <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700 }}>Lead SĐT</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>Giá 1 Inbox</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7' }}>Giá 1 Lead (CPL)</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700 }}>Ghi Chú Vận Hành Thực Tế</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BU2_HISTORICAL_DATA.months.map((m, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>{m.month}</td>
                        <td style={{ padding: '10px 10px', textAlign: 'center', color: '#64748b' }}>{m.count} adsets</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{formatMoney(m.spend)} đ</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#0284c7', fontWeight: 600 }}>{m.messages}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'center', color: '#059669', fontWeight: 700 }}>{m.leads}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>{formatMoney(m.cplMsg)} đ</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>{formatMoney(m.cplLead)} đ</td>
                        <td style={{ padding: '10px 14px', color: '#475569', fontSize: '0.8rem' }}>{m.note}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f1f5f9', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '10px 14px', color: '#0f172a' }}>TỔNG CỘNG LỊCH SỬ</td>
                      <td style={{ padding: '10px 10px', textAlign: 'center', color: '#0f172a' }}>50 adsets</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#0f172a' }}>{formatMoney(BU2_HISTORICAL_DATA.totalSpend)} đ</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#0284c7' }}>{BU2_HISTORICAL_DATA.totalMessages}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', color: '#059669' }}>{BU2_HISTORICAL_DATA.totalLeads}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>{formatMoney(BU2_HISTORICAL_DATA.cplMsgAvg)} đ</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', color: '#d97706' }}>{formatMoney(BU2_HISTORICAL_DATA.cplLeadAvg)} đ</td>
                      <td style={{ padding: '10px 14px', color: '#0369a1' }}>Chuẩn chi phí định mức đối soát thị trường Đông Bắc Á</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* KHỐI 3: QUYẾT ĐỊNH NGÂN SÁCH 45 TRIỆU CHO CẢ 4 TUYẾN & 4 KỊCH BẢN */}
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
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      3. Quyết Định Ngân Sách: 45 Triệu / Quý (15 Triệu / Tháng) Cho Cả 4 Tuyến &amp; Các Kịch Bản
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                      Phân bổ 45 triệu cho 3 tháng: Hokkaido 18 Tr (40% — 6 Tr/tháng), Cung Đường Vàng 12 Tr (26.7% — 4 Tr/tháng), Hàn Quốc 7.5 Tr (16.7% — 2.5 Tr/tháng), Đài Loan 7.5 Tr (16.7% — 2.5 Tr/tháng) — Chủ động phễu khách cho cả 4 tuyến.
                    </p>
                  </div>
                </div>

                <a
                  href="/GIAI_TRINH_DU_TOAN_BU2_NGAN_SACH_1_PHAN_TRAM.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f8fafc',
                    color: '#0f172a',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid #cbd5e1'
                  }}
                >
                  <FileText size={15} color="#0284c7" />
                  <span>Xem File Báo Cáo .MD Chi Tiết</span>
                  <ExternalLink size={13} color="#64748b" />
                </a>
              </div>

              {/* Giải trình ngắn gọn */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '14px 18px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, marginBottom: '20px' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={16} color="#d97706" />
                  <span>Cơ sở & Bối cảnh đề xuất ngân sách BU2:</span>
                </div>
                <p style={{ margin: '4px 0' }}>
                  • <strong>Đề xuất trực tiếp từ đơn vị kinh doanh BU2:</strong> Do đặc thù các thị trường Đông Bắc Á (Nhật Bản, Hàn Quốc, Đài Loan) vận hành chủ yếu theo mô hình Tour Liên Minh với đối tác, team Marketing không nắm tường tận biến động thị trường này. Vì vậy, <strong>dự toán ngân sách này được chính BU2 chủ động xây dựng và đề xuất</strong> để bám sát thực tế gom khách và giữ quota vé.
                </p>
                <p style={{ margin: '4px 0' }}>
                  • <strong>Kế thừa dữ liệu chi tiêu cũ (~16 Triệu/tháng):</strong> Các tháng gần đây team BU2 đang duy trì nhịp chạy quảng cáo khoảng <strong>16 triệu mỗi tháng</strong> (Tháng 9/2026 chi 15.95M). Mức đề xuất <strong>15 Triệu/tháng (45 Triệu/quý)</strong> là sự kế thừa trực tiếp nhịp chạy quen thuộc này của BU2, bảo đảm tỷ lệ chi phí Marketing chỉ chiếm <strong>0.75% Doanh thu ERP Q4</strong> (dưới trần an toàn 1.0%).
                </p>
                <p style={{ margin: '4px 0' }}>
                  • <strong>Phân bổ 2 trục:</strong> Tuyến riêng thiết kế <strong>Hokkaido</strong> là trọng tâm thương hiệu có Guu (lãi ~9.8 Tr/khách) được cấp <strong>18 Triệu (40% — 6 Tr/tháng)</strong>. Đồng thời, <strong>3 tuyến tour liên minh vẫn chạy Ads chủ động</strong> với tổng ngân sách <strong>27 Triệu (60% — 9 Tr/tháng)</strong> để gom đủ quota khách của FIT Tour cho 9 đoàn khởi hành, không bị động trước đối tác.
                </p>
                <p style={{ margin: '4px 0 0' }}>
                  • <strong>Hiệu quả tổng thể 45M:</strong> Toàn bộ 4 tuyến tạo ra <strong>~248 Lead SĐT</strong> (~554 Inbox), chốt <strong>~24 Pax từ Ads</strong>. Kết hợp 67 khách đã cọc nâng tổng quy mô lên <strong>91 Pax (34.3% tải tổng 11 đoàn)</strong>, mang về doanh thu thực tế <strong>~2.62 Tỷ</strong> và lãi gộp ước tính <strong>~950 Triệu</strong>. Tỷ lệ Ads/Lãi gộp chỉ <strong>3.76%</strong> (rất an toàn).
                </p>
              </div>

              {/* 4 Thẻ Kịch Bản Tương Tác */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px'
              }}>
                {/* Kịch bản CEO: 45M */}
                <div 
                  onClick={() => applyScenario('CEO')}
                  style={{
                    background: selectedScenario === 'CEO' ? '#eff6ff' : '#ffffff',
                    border: selectedScenario === 'CEO' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedScenario === 'CEO' ? '0 4px 14px rgba(2,132,199,0.2)' : 'none'
                  }}
                >
                  <div style={{ position: 'absolute', top: '-10px', right: '14px', background: '#0284c7', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '10px' }}>
                    QUYẾT ĐỊNH CEO ⭐
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      KỊCH BẢN CHÍNH • 45M / QUÝ (15M / THÁNG)
                    </span>
                    {selectedScenario === 'CEO' && <span style={{ background: '#0284c7', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Đang áp dụng</span>}
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    45.000.000 đ
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    • Hokkaido (Trọng tâm có Guu): <strong>18M</strong> (40% — 6 Tr/tháng)<br />
                    • Cung Đường Vàng: <strong>12M</strong> • Hàn: <strong>7.5M</strong> • Đài: <strong>7.5M</strong><br />
                    <span style={{ color: '#0369a1', fontWeight: 700 }}>Phân chia hợp lý 4 tuyến trong 3 tháng (15M/tháng — ~500k/ngày).</span>
                  </div>
                </div>

                {/* Kịch bản A: 38M */}
                <div 
                  onClick={() => applyScenario('A')}
                  style={{
                    background: selectedScenario === 'A' ? '#f0fdf4' : '#ffffff',
                    border: selectedScenario === 'A' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedScenario === 'A' ? '0 4px 12px rgba(22,163,74,0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      KỊCH BẢN A • 1% THỰC THU
                    </span>
                    {selectedScenario === 'A' && <span style={{ background: '#16a34a', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Đang chọn</span>}
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    38.000.000 đ
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    • Hokkaido: <strong>25M</strong> (65.8%)<br />
                    • Cung Đường Vàng: <strong>7M</strong> • Hàn: <strong>3M</strong> • Đài: <strong>3M</strong><br />
                    <span style={{ color: '#15803d', fontWeight: 600 }}>Chuẩn 1% trên 3.78 Tỷ thực thu FIT Tour.</span>
                  </div>
                </div>

                {/* Kịch bản B: 60M */}
                <div 
                  onClick={() => applyScenario('B')}
                  style={{
                    background: selectedScenario === 'B' ? '#f8fafc' : '#ffffff',
                    border: selectedScenario === 'B' ? '2px solid #64748b' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedScenario === 'B' ? '0 4px 12px rgba(100,116,139,0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      KỊCH BẢN B • 1% ERP Q4
                    </span>
                    {selectedScenario === 'B' && <span style={{ background: '#475569', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Đang chọn</span>}
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    60.000.000 đ
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    • Hokkaido Thu: <strong>30M</strong> (50.0%)<br />
                    • Cung Đường Vàng: <strong>18M</strong> • Hàn: <strong>6M</strong> • Đài: <strong>6M</strong><br />
                    <span style={{ color: '#475569', fontWeight: 600 }}>Định mức ~1% trên doanh thu 10 đoàn Q4 (5.67 - 5.98 Tỷ).</span>
                  </div>
                </div>

                {/* Kịch bản C: 75M */}
                <div 
                  onClick={() => applyScenario('C')}
                  style={{
                    background: selectedScenario === 'C' ? '#faf5ff' : '#ffffff',
                    border: selectedScenario === 'C' ? '2px solid #9333ea' : '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: selectedScenario === 'C' ? '0 4px 12px rgba(147,51,234,0.15)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#9333ea', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      KỊCH BẢN C • 1% TỔNG 11 ĐOÀN
                    </span>
                    {selectedScenario === 'C' && <span style={{ background: '#9333ea', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Đang chọn</span>}
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    75.000.000 đ
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                    • Hokkaido: <strong>40M</strong> (53.3%)<br />
                    • Cung Đường Vàng: <strong>20M</strong> • Hàn: <strong>8M</strong> • Đài: <strong>7M</strong><br />
                    <span style={{ color: '#7e22ce', fontWeight: 600 }}>Chuẩn ~1% tổng 11 đoàn gồm cả T1/2027 (7.09 Tỷ).</span>
                  </div>
                </div>
              </div>
            </div>

            {/* KHỐI 4: MA TRẬN PHÂN BỔ NGÂN SÁCH CHI TIẾT 4 TUYẾN (CHUẨN BU1 DYNAMIC) */}
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
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={20} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      4. Ma Trận Phân Bổ Ngân Sách Tuyến & Chỉ Tiêu BU2
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                      Đối soát 100% số liệu thực từ bộ máy tính từng tuyến, cập nhật tự động theo kịch bản đang chọn.
                    </p>
                  </div>
                </div>
                <div style={{ background: '#f8fafc', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.82rem', color: '#475569' }}>
                  Kịch bản hiện tại: <strong style={{ color: selectedScenario === 'CEO' ? '#16a34a' : selectedScenario === 'A' ? '#0284c7' : '#9333ea', fontSize: '0.95rem' }}>{formatMoney(bu2Summary.totalBudget)} đ</strong>
                </div>
              </div>

              {/* Bảng ma trận ngân sách dynamic */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                      <th style={{ padding: '12px 14px', borderRadius: '8px 0 0 0' }}>Tuyến Sản Phẩm</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Mô Hình</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Số Đoàn (Pax)</th>
                      <th style={{ padding: '12px 12px', textAlign: 'right' }}>Giá Bán TB</th>
                      <th style={{ padding: '12px 12px', textAlign: 'right', background: '#1e293b' }}>Ngân Sách Ads</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>CPL Lead SĐT</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Dự Kiến Lead</th>
                      <th style={{ padding: '12px 12px', textAlign: 'left' }}>Khách Dự Kiến</th>
                      <th style={{ padding: '12px 12px', textAlign: 'right' }}>Doanh Thu KH</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>% Ads/DT</th>
                      <th style={{ padding: '12px 12px', textAlign: 'center', borderRadius: '0 8px 0 0' }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      {
                        key: 'hokkaido',
                        name: 'Hokkaido (Mùa Thu & Cung Đường Tuyết)',
                        details: 'Đoàn 22/10 (15p) & 14/01/2027 (25p) • Tour riêng có Guu FIT Tour',
                        badge: '🌟 Độc Quyền FIT',
                        badgeBg: '#bae6fd',
                        badgeColor: '#0369a1',
                        rowBg: '#f0f9ff'
                      },
                      {
                        key: 'cungduongvang',
                        name: 'Nhật Bản Cung Đường Vàng (6N5Đ)',
                        details: '3 Đoàn: 23/10, 06/11, 28/11 • Mô hình liên minh gom khách',
                        badge: '🤝 Liên Minh',
                        badgeBg: '#fef3c7',
                        badgeColor: '#b45309',
                        rowBg: '#fffbeb'
                      },
                      {
                        key: 'hanquoc',
                        name: 'Hàn Quốc Mùa Thu (5N4Đ)',
                        details: '2 Đoàn: 24/10, 14/11 • Mô hình liên minh chia tải',
                        badge: '🤝 Liên Minh',
                        badgeBg: '#fee2e2',
                        badgeColor: '#b91c1c',
                        rowBg: '#ffffff'
                      },
                      {
                        key: 'dailoan',
                        name: 'Đài Loan Thu Đông (5N4Đ)',
                        details: '4 Đoàn: 09/10, 30/10, 13/11, 27/11 • Mô hình liên minh gom khách',
                        badge: '🤝 Liên Minh',
                        badgeBg: '#d1fae5',
                        badgeColor: '#047857',
                        rowBg: '#f0fdf4'
                      }
                    ].map(r => {
                      const c = calcs[r.key];
                      const res = getRouteCalcResults(r.key);
                      const st = allDepStats.tourStats[r.key] || { count: 0, targetPax: 0, paidPax: 0, targetRev: 0, paidRev: 0, grossProfit: 0 };
                      const isBudgetZero = c.budget === 0;
                      const adsRatio = st.targetRev > 0 ? (c.budget / st.targetRev) * 100 : 0;
                      const totalExpectedPax = st.paidPax + (c.budget > 0 ? res.paxAds : 0);
                      const remainingPax = Math.max(0, st.targetPax - totalExpectedPax);

                      return (
                        <tr key={r.key} style={{ borderBottom: '1px solid #e2e8f0', background: r.rowBg }}>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{r.details}</div>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <span style={{ background: r.badgeBg, color: r.badgeColor, fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                              {r.badge}
                            </span>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700 }}>
                            <div>{st.count} đoàn</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>({st.targetPax} pax)</div>
                          </td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 600 }}>
                            {formatMoney(c.price)} đ
                          </td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: isBudgetZero ? '#64748b' : r.badgeColor }}>
                            {formatMoney(c.budget)} đ
                            <div style={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 500 }}>
                              {isBudgetZero ? 'Liên minh gom tải' : `${((c.budget / (bu2Summary.totalBudget || 1)) * 100).toFixed(1)}% ngân sách`}
                            </div>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            {c.cpl > 0 ? (
                              <div>
                                <div style={{ fontWeight: 600 }}>{formatMoney(c.cpl)} đ</div>
                                <div style={{ fontSize: '0.71rem', color: '#64748b' }}>DB: ~189k</div>
                              </div>
                            ) : (
                              <span style={{ color: '#94a3b8' }}>—</span>
                            )}
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: isBudgetZero ? '#94a3b8' : '#0f172a' }}>
                            {isBudgetZero ? '—' : `${res.leads} Lead`}
                          </td>
                          <td style={{ padding: '12px 12px', textAlign: 'left' }}>
                            <div style={{ fontWeight: 700, color: isBudgetZero ? '#64748b' : '#0284c7' }}>
                              {isBudgetZero ? '0 Pax Ads' : `${res.paxAds} Pax Ads`}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>
                              Đã cọc: {st.paidPax}p • {isBudgetZero ? `Thiếu: ${remainingPax}p (Liên minh)` : `Tổng: ${totalExpectedPax}/${st.targetPax}p (Thiếu: ${remainingPax}p)`}
                            </div>
                          </td>
                          <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                            <div>{formatMoney(st.targetRev)} đ</div>
                            <div style={{ fontSize: '0.71rem', color: '#16a34a' }}>
                              Đã cọc: {formatMoney(st.paidRev)} đ • Lãi: ~{formatMoney(st.grossProfit)} đ
                            </div>
                          </td>
                          <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                            <span style={{
                              background: isBudgetZero ? '#f1f5f9' : adsRatio <= 1.0 ? '#dcfce7' : adsRatio <= 2.0 ? '#fef9c3' : '#fee2e2',
                              color: isBudgetZero ? '#64748b' : adsRatio <= 1.0 ? '#166534' : adsRatio <= 2.0 ? '#854d0e' : '#991b1b',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontWeight: 700,
                              fontSize: '0.75rem'
                            }}>
                              {isBudgetZero ? '0.00% (An toàn)' : `${adsRatio.toFixed(2)}%`}
                            </span>
                          </td>
                          <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                            <button
                              onClick={() => handleTabChange(r.key)}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                color: r.badgeColor,
                                fontWeight: 700,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              Xem Máy Tính →
                            </button>
                          </td>
                        </tr>
                      );
                    })}

                    {/* DÒNG TỔNG CỘNG TOÀN BỘ BU2 */}
                    <tr style={{ background: '#0f172a', color: '#ffffff', fontWeight: 800 }}>
                      <td style={{ padding: '16px 14px', borderRadius: '0 0 0 8px' }}>
                        TỔNG CỘNG TOÀN BỘ BU2
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'center', fontSize: '0.76rem', color: '#94a3b8' }}>
                        2 Trục phối hợp
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'center', color: '#38bdf8' }}>
                        11 Đoàn ({allDepStats.target} Pax)
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        —
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right', color: '#38bdf8', fontSize: '1rem' }}>
                        {formatMoney(bu2Summary.totalBudget)} đ
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'center', color: '#94a3b8' }}>
                        DB: ~189k
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'center', color: '#facc15' }}>
                        {bu2Summary.totalLeads} Lead
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left', color: '#4ade80' }}>
                        <div>{bu2Summary.totalPaxAds} Pax Ads</div>
                        <div style={{ fontSize: '0.72rem', color: '#86efac' }}>
                          +{allDepStats.paid} đã cọc (Tổng: {bu2Summary.totalPaxAds + allDepStats.paid}/{allDepStats.target}p • {allDepStats.target > 0 ? (((bu2Summary.totalPaxAds + allDepStats.paid) / allDepStats.target) * 100).toFixed(1) : 0}% tải)
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right', color: '#ffffff', fontSize: '1rem' }}>
                        <div>{formatMoney(allDepStats.targetRev)} đ</div>
                        <div style={{ fontSize: '0.72rem', color: '#4ade80' }}>
                          Đã cọc: {formatMoney(allDepStats.paidRev)} đ ({allDepStats.paidRevRate.toFixed(1)}%) • Lãi gộp KH: ~{formatMoney(allDepStats.totalGrossProfit)} đ
                        </div>
                      </td>
                      <td style={{ padding: '16px 10px', textAlign: 'center' }}>
                        <span style={{ background: '#15803d', color: '#ffffff', padding: '3px 10px', borderRadius: '4px', fontSize: '0.82rem' }}>
                          {(allDepStats.targetRev > 0 ? (bu2Summary.totalBudget / allDepStats.targetRev) * 100 : 0).toFixed(2)}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', borderRadius: '0 0 8px 0', color: '#94a3b8', fontSize: '0.78rem' }}>
                        Chuẩn FIT Tour (Trần &le; 1%)
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* KHỐI 5: LỘ TRÌNH TRIỂN KHAI THEO CHU KỲ (TIMELINE) */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '24px 28px',
              marginBottom: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fae8ff', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Clock size={20} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                    5. Lộ Trình Phân Bổ Ngân Sách Theo Từng Giai Đoạn (Tháng 10/2026 – Tháng 01/2027)
                  </h2>
                  <p style={{ margin: '2px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    Kế hoạch cuốn chiếu theo chu kỳ chốt visa Nhật Bản (cần 10 - 14 ngày làm việc) và visa Đài Loan/Hàn Quốc.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {/* Giai đoạn 1: Tháng 10 */}
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
                      THÁNG 10/2026 (NƯỚC RÚT)
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                      {selectedScenario === 'CEO' ? '15.000.000' : formatMoney(Math.round(bu2Summary.totalBudget / 3))} đ
                    </strong>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Chốt Các Đoàn Khởi Hành T10 & Đón Mùa Thu Lá Đỏ
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                    <li><strong>Hokkaido Thu:</strong> Chạy dồn dập trong tuần đầu T10 để chốt cọc kịp hạn nộp visa trước 08/10 cho đoàn 22/10 (ngân sách 6 Tr/tháng).</li>
                    <li><strong>3 Tuyến Liên Minh:</strong> Chạy Ads đều đặn (Cung Đường Vàng 4 Tr, Hàn Quốc 2.5 Tr, Đài Loan 2.5 Tr) giữ nhịp phễu lead, đón mùa lá đỏ và gom đủ quota tải cho các đoàn T10.</li>
                  </ul>
                </div>

                {/* Giai đoạn 2: Tháng 11 */}
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#047857', background: '#d1fae5', padding: '2px 8px', borderRadius: '4px' }}>
                      THÁNG 11/2026 (MŨI NHỌN TUYẾT)
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                      {selectedScenario === 'CEO' ? '15.000.000' : formatMoney(Math.round(bu2Summary.totalBudget / 3))} đ
                    </strong>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Khởi Động Tuyết Trắng Hokkaido & Gom Đoàn T11
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                    <li><strong>Hokkaido Mùa Tuyết:</strong> Khởi động chiến dịch Video & Trải nghiệm tuyết bột powdery snow, onsen lộ thiên cho đoàn 14/01/2027 (6 Tr/tháng).</li>
                    <li><strong>Tuyến Liên Minh T11:</strong> Duy trì 9 Tr/tháng cho 3 tuyến Cung Đường Vàng, Hàn Quốc, Đài Loan để chốt nốt các đoàn cuối tháng 11.</li>
                  </ul>
                </div>

                {/* Giai đoạn 3: Tháng 12 */}
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px 18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '2px 8px', borderRadius: '4px' }}>
                      THÁNG 12/2026 (CHỐT SỔ TẾT)
                    </span>
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>
                      {selectedScenario === 'CEO' ? '15.000.000' : formatMoney(Math.round(bu2Summary.totalBudget / 3))} đ
                    </strong>
                  </div>
                  <h4 style={{ margin: '0 0 6px', fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                    Nước Rút Khóa Đoàn Hokkaido 14/01/2027 & Du Xuân
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.6 }}>
                    <li><strong>Hokkaido Mùa Tuyết:</strong> Tăng tốc chốt những khách cuối cùng cho đoàn 25 chỗ, chốt sổ visa trước ngày 25/12/2026 (6 Tr/tháng).</li>
                    <li><strong>Re-targeting & Du Xuân:</strong> Tiếp thị lại toàn bộ tệp khách đã tương tác nhưng chưa chốt trong Q4 và mở bán các tuyến liên minh mùa hoa xuân (9 Tr/tháng).</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* KHỐI 6: KÝ TRÌNH BAN GIÁM ĐỐC & CTA */}
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
                <div style={{ display: 'inline-block', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid rgba(56, 189, 248, 0.4)', padding: '3px 10px', borderRadius: '16px', fontSize: '0.72rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '10px' }}>
                  ĐỀ XUẤT TỪ BU2 &amp; KÝ TRÌNH BAN GIÁM ĐỐC
                </div>
                <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                  Đề Xuất Phê Duyệt Ngân Sách BU2 Quý 4/2026: {formatMoney(bu2Summary.totalBudget)} VNĐ
                </h3>
                <p style={{ margin: '6px 0 0', fontSize: '0.85rem', color: '#94a3b8', maxWidth: '780px', lineHeight: 1.55 }}>
                  {selectedScenario === 'CEO' 
                    ? 'Đề án do BU2 chủ động đề xuất theo đặc thù Tour Liên Minh các tuyến Nhật - Hàn - Đài và kế thừa nhịp chạy thực tế ~16 triệu/tháng: Phân bổ 45 triệu cho 3 tháng (15 Triệu/tháng) cho 4 tuyến (Hokkaido 18M, Cung Đường Vàng 12M, Hàn Quốc 7.5M, Đài Loan 7.5M), vừa chủ động nguồn khách vừa giữ tỷ lệ Ads/Doanh thu chỉ 0.75%.'
                    : `Bản đề án kích hoạt kịch bản ${selectedScenario} với tổng ngân sách ${formatMoney(bu2Summary.totalBudget)} đ, mở rộng thị phần Đông Bắc Á và tối ưu hóa tỷ lệ lấp đầy cả 11 đoàn khởi hành.`}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleTabChange('hokkaido')}
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
                  <span>Mở Máy Tính Hokkaido</span>
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
                  <span>Xem Bảng 11 Đoàn ERP</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2, 3, 4, 5: CÁC MÁY TÍNH DỰ TOÁN TUYẾN ĐỘC LẬP
        ══════════════════════════════════════════════════════════════════════ */}
        {['hokkaido', 'cungduongvang', 'hanquoc', 'dailoan'].includes(activeTab) && (
          <div>
            {(() => {
              const routeKey = activeTab;
              const routeConf = BU2_ROUTES_CONFIG[routeKey];
              const c = calcs[routeKey];
              const res = getRouteCalcResults(routeKey);

              return (
                <div>
                  {/* Banner Tuyến */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '22px 26px',
                    marginBottom: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'inline-block', background: routeConf.bg, color: routeConf.tagColor, fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: '4px', marginBottom: '8px' }}>
                          {routeConf.badge}
                        </div>
                        <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                          Máy Tính Dự Toán Ngân Sách: {routeConf.name}
                        </h2>
                        <p style={{ margin: '6px 0 0', fontSize: '0.86rem', color: '#475569', maxWidth: '920px', lineHeight: 1.55 }}>
                          {routeConf.description}
                        </p>
                      </div>
                      <button
                        onClick={() => updateCalc(routeKey, 'budget', routeConf.defaultCalc.budget)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: '#475569',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <RotateCcw size={13} />
                        <span>Đặt lại mặc định</span>
                      </button>
                    </div>
                  </div>

                  {/* KHỐI DỮ LIỆU LỊCH SỬ ADS THỰC TẾ BU2 (ĐỐI SOÁT DATABASE ERP) */}
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1.5px solid #0284c7',
                    padding: '20px 24px',
                    marginBottom: '20px',
                    boxShadow: '0 2px 8px rgba(2,132,199,0.06)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <BarChart3 size={18} />
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            Dữ Liệu Lịch Sử Meta Ads BU2 (Đối Soát Database PostgreSQL 6 Tháng Gần Nhất)
                          </h3>
                          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                            Trích xuất 100% từ bảng <code>marketing_ads_reports</code> trên Production (Tháng 4 → Tháng 9/2026 • 50 Adsets Đông Bắc Á)
                          </p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => updateCalc(routeKey, 'cpl', BU2_HISTORICAL_DATA.cplLeadAvg)}
                          style={{
                            background: '#e0f2fe',
                            border: '1px solid #bae6fd',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#0369a1',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={13} />
                          <span>Gán CPL Chuẩn DB ({formatMoney(BU2_HISTORICAL_DATA.cplLeadAvg)} đ)</span>
                        </button>
                        <button
                          onClick={() => updateCalc(routeKey, 'budget', routeConf.defaultCalc.budget)}
                          style={{
                            background: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            color: '#047857',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Target size={13} />
                          <span>Gán Đề Xuất Quý ({formatMoney(routeConf.defaultCalc.budget)} đ)</span>
                        </button>
                      </div>
                    </div>

                    {/* 4 Cards Số Liệu Cũ */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Chi Tiêu Thực Tế</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatMoney(BU2_HISTORICAL_DATA.totalSpend)} đ</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>6 tháng qua (50 adsets)</div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Inbox</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{formatMoney(BU2_HISTORICAL_DATA.totalMessages)} Tin</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Giá TB: ~{formatMoney(BU2_HISTORICAL_DATA.cplMsgAvg)} đ/inbox</div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Lead Có SĐT</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>{BU2_HISTORICAL_DATA.totalLeads} Lead SĐT</div>
                        <div style={{ fontSize: '0.7rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>Tỷ lệ SĐT/Inbox: {BU2_HISTORICAL_DATA.inboxToLeadRate}%</div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>CPL Bình Quân</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{formatMoney(BU2_HISTORICAL_DATA.cplLeadAvg)} đ</div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>Chi phí thực tế / Lead SĐT</div>
                      </div>
                    </div>

                    {/* Rationale thông báo định hướng CEO */}
                    <div style={{
                      background: routeConf.isAlliance ? '#fffbeb' : '#f0fdf4',
                      border: routeConf.isAlliance ? '1px solid #fde68a' : '1px solid #bbf7d0',
                      borderRadius: '8px',
                      padding: '12px 16px',
                      fontSize: '0.82rem',
                      color: routeConf.isAlliance ? '#92400e' : '#166534',
                      lineHeight: 1.55
                    }}>
                      {routeKey === 'hokkaido' ? (
                        <div>
                          <strong>🌟 Chiến lược Tuyến Riêng Thiết Kế (Hokkaido)</strong>: Đây là tour riêng độc quyền "Du lịch có Guu" với biên lợi nhuận gộp lên tới <strong>~9.79 triệu/khách</strong>. Ngân sách Marketing được duyệt <strong>8.000.000 đ (40% ngân sách BU2)</strong> trong 3 tháng để tạo ra 40 Lead SĐT chất lượng cao, chốt ~9 Pax Ads, kết hợp 10 cọc cũ đạt 19/40 khách (47.5% công suất 2 đoàn).
                        </div>
                      ) : (
                        <div>
                          <strong>🤝 Chiến lược Tour Liên Minh ({routeConf.name})</strong>: Tour liên minh hoạt động trên cơ chế gom tải đối tác, biên lợi nhuận từ 1.5M - 2.8M/khách. Tuyến <strong>vẫn được cấp ngân sách chạy Ads riêng ({formatMoney(calcs[routeKey]?.budget || 0)} đ trong 3 tháng)</strong> để chủ động tìm kiếm khách hàng mới ({calcs[routeKey]?.leads || 0} Lead SĐT), chốt ~{calcs[routeKey]?.paxAds || 0} Pax Ads song song với kênh chia tải của liên minh.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Layout Máy Tính 2 Cột */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    
                    {/* Cột Trái: Bộ Tham Số Đầu Vào */}
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
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                            Ngân Sách Marketing Ads (VNĐ)
                          </label>
                          <CurrencyInput
                            value={c.budget}
                            onChange={(val) => updateCalc(routeKey, 'budget', val)}
                            isLight={true}
                          />
                        </div>

                        {/* Chi phí CPL */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                            Chi Phí Trên 1 Lead SĐT (CPL - VNĐ)
                          </label>
                          <CurrencyInput
                            value={c.cpl}
                            onChange={(val) => updateCalc(routeKey, 'cpl', val)}
                            isLight={true}
                          />
                        </div>

                        {/* Tỷ lệ chốt */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                              Tỷ Lệ Chốt CR (%)
                            </label>
                            <input
                              type="number"
                              value={c.cr}
                              onChange={(e) => updateCalc(routeKey, 'cr', Number(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                              Pax/Lead Chốt
                            </label>
                            <input
                              type="number"
                              step="0.05"
                              value={c.paxPerLead}
                              onChange={(e) => updateCalc(routeKey, 'paxPerLead', Number(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        {/* Số đoàn & Chỗ */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                              Số Đoàn Kế Hoạch
                            </label>
                            <input
                              type="number"
                              value={c.numGroups}
                              onChange={(e) => updateCalc(routeKey, 'numGroups', Number(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                              Số Chỗ / Đoàn
                            </label>
                            <input
                              type="number"
                              value={c.paxPerGroup}
                              onChange={(e) => updateCalc(routeKey, 'paxPerGroup', Number(e.target.value))}
                              style={{
                                width: '100%',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>

                        {/* Giá tour & Giá vốn */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                              Giá Bán (VNĐ)
                            </label>
                            <CurrencyInput
                              value={c.price}
                              onChange={(val) => updateCalc(routeKey, 'price', val)}
                              isLight={true}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                              Giá Vốn (VNĐ)
                            </label>
                            <CurrencyInput
                              value={c.cost}
                              onChange={(val) => updateCalc(routeKey, 'cost', val)}
                              isLight={true}
                            />
                          </div>
                        </div>

                        {/* Khách từ nguồn khác (Liên minh, Organic) */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                            Khách Tự Có / Đối Tác Liên Minh Gom (Pax)
                          </label>
                          <input
                            type="number"
                            value={c.extPax || 0}
                            onChange={(e) => updateCalc(routeKey, 'extPax', Number(e.target.value))}
                            style={{
                              width: '100%',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cột Phải: Kết Quả Dự Báo & Bài Toán Kinh Tế */}
                    <div style={{
                      background: '#ffffff',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '22px 24px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <h3 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <TrendingUp size={18} color="#059669" />
                        <span>Kết Quả Dự Báo Kinh Doanh (Output)</span>
                      </h3>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '18px' }}>
                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>DỰ KIẾN LEAD SĐT</span>
                          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                            {res.leads} Lead
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#0369a1' }}>~{res.leads * 4} Tin nhắn</span>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>KHÁCH CHỐT TỪ ADS</span>
                          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669', marginTop: '2px' }}>
                            {res.paxAds} Pax
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>CR: {c.cr}%</span>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>TỔNG KHÁCH (ADS + LIÊN MINH)</span>
                          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                            {res.totalPax} / {res.targetPaxTotal} Pax
                          </div>
                          <span style={{ fontSize: '0.72rem', color: res.totalPax >= res.targetPaxTotal ? '#16a34a' : '#d97706', fontWeight: 700 }}>
                            {res.totalPax >= res.targetPaxTotal ? '✅ Đạt 100% mục tiêu' : `Còn thiếu ${res.targetPaxTotal - res.totalPax} pax`}
                          </span>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>TỶ LỆ CHI PHÍ ADS / DOANH THU</span>
                          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                            {res.adsRatio.toFixed(2)}%
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>An toàn</span>
                        </div>
                      </div>

                      {/* Bảng Dòng Tiền & Lợi Nhuận */}
                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', fontSize: '0.84rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                          <span>Doanh thu kế hoạch ({res.totalPax} pax):</span>
                          <strong style={{ color: '#0f172a' }}>{formatMoney(res.totalRevenue)} đ</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                          <span>Giá vốn tour (Land + Vé bay):</span>
                          <span style={{ color: '#64748b' }}>- {formatMoney(res.totalTourCost)} đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                          <span>Lợi nhuận gộp (Gross Profit):</span>
                          <strong style={{ color: '#059669' }}>{formatMoney(res.grossProfit)} đ</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', color: '#475569' }}>
                          <span>Chi phí Marketing Ads:</span>
                          <span style={{ color: '#dc2626' }}>- {formatMoney(c.budget)} đ</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 4px', borderTop: '2px dashed #cbd5e1', fontSize: '0.95rem', fontWeight: 800 }}>
                          <span style={{ color: '#0f172a' }}>Lợi Nhuận Ròng Sau Ads:</span>
                          <span style={{ color: res.netProfitAfterAds > 0 ? '#16a34a' : '#dc2626' }}>
                            {formatMoney(res.netProfitAfterAds)} đ
                          </span>
                        </div>
                      </div>

                      {/* Tính Toán Ngược */}
                      <div style={{ marginTop: '16px', background: '#eff6ff', borderRadius: '8px', padding: '12px 14px', border: '1px solid #bfdbfe' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af', marginBottom: '4px' }}>
                          💡 BÀI TOÁN TÍNH NGƯỢC (FULL TẢI {res.targetPaxTotal} PAX):
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#1e3a8a', lineHeight: 1.5 }}>
                          Để lấp đầy 100% {res.targetPaxTotal} chỗ (trừ {c.extPax || 0} pax liên minh/organic), bộ phận Ads cần chốt <strong>{res.neededPaxFromAds} Pax</strong>. Tương đương cần tạo ra <strong>{res.neededLeads} Lead SĐT</strong> với ngân sách yêu cầu là <strong>{formatMoney(res.neededBudget)} đ</strong>.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: BẢNG 11 ĐOÀN KHỞI HÀNH THỰC TẾ ERP
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'departures' && (
          <div>
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '22px 26px',
              marginBottom: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                    Bảng 11 Đoàn Khởi Hành BU2 (Q4/2026 & Mùa Đông 2027) Đồng Bộ ERP
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
                    Dữ liệu trực tiếp từ <code>tour_departures</code> và <code>marketing_budget_plans</code>.
                  </p>
                </div>

                {/* Bộ Lọc Nhanh */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Lọc Tháng */}
                  <select
                    value={depMonthFilter}
                    onChange={(e) => setDepMonthFilter(e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#334155',
                      background: '#ffffff'
                    }}
                  >
                    <option value="ALL">📅 Tất cả tháng</option>
                    <option value="10">Tháng 10/2026 (5 Đoàn)</option>
                    <option value="11">Tháng 11/2026 (5 Đoàn)</option>
                    <option value="1">Tháng 01/2027 (1 Đoàn Hokkaido Tuyết)</option>
                  </select>

                  {/* Lọc Mô Hình */}
                  <select
                    value={depModelFilter}
                    onChange={(e) => setDepModelFilter(e.target.value)}
                    style={{
                      padding: '7px 10px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      color: '#334155',
                      background: '#ffffff'
                    }}
                  >
                    <option value="ALL">🏛️ Tất cả mô hình</option>
                    <option value="EXCLUSIVE">🌟 Tuyến Trọng Tâm Hokkaido (2 Đoàn)</option>
                    <option value="ALLIANCE">🤝 Tuyến Tour Liên Minh (9 Đoàn)</option>
                  </select>

                  {/* Tìm kiếm */}
                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Tìm mã đoàn, tuyến..."
                      value={depSearch}
                      onChange={(e) => setDepSearch(e.target.value)}
                      style={{
                        padding: '7px 10px 7px 30px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.82rem',
                        width: '180px'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Thống kê nhanh bảng lọc */}
              <div style={{
                background: '#f8fafc',
                borderRadius: '8px',
                padding: '10px 14px',
                marginBottom: '16px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                gap: '20px',
                flexWrap: 'wrap',
                fontSize: '0.82rem',
                color: '#475569'
              }}>
                <div>Đang hiển thị: <strong>{filteredDepartures.length} đoàn</strong></div>
                <div>Tổng mục tiêu: <strong style={{ color: '#0f172a' }}>{depStats.target} chỗ</strong></div>
                <div>Đã giữ chỗ / cọc: <strong style={{ color: '#059669' }}>{depStats.paid} pax</strong></div>
                <div>Chỗ còn lại cần chốt: <strong style={{ color: '#dc2626' }}>{depStats.remaining} pax</strong></div>
                <div>Tổng doanh thu mục tiêu: <strong style={{ color: '#0284c7' }}>{formatMoney(depStats.targetRev)} đ</strong></div>
              </div>

              {/* Bảng chi tiết */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#ffffff' }}>
                      <th style={{ padding: '12px 14px' }}>Mã Đoàn / Tuyến Khởi Hành</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Mô Hình</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Ngày Khởi Hành</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Mục Tiêu Pax</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Điểm Hòa Vốn</th>
                      <th style={{ padding: '12px 12px', textAlign: 'right' }}>Giá Bán Tour</th>
                      <th style={{ padding: '12px 12px', textAlign: 'right' }}>Doanh Thu Dự Kiến</th>
                      <th style={{ padding: '12px 10px', textAlign: 'center' }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartures.map((d, idx) => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px 14px', fontWeight: 700 }}>
                          <div style={{ color: d.isAlliance ? '#d97706' : '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {d.isAlliance ? <Share2 size={14} /> : <Snowflake size={14} />}
                            <span>{d.tourName}</span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>
                            <code>{d.code}</code>
                          </div>
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          {d.isAlliance ? (
                            <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                              Liên Minh
                            </span>
                          ) : (
                            <span style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                              🌟 Trọng Tâm
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 600 }}>
                          {d.date}
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                          {d.targetPax} Pax
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center', color: '#64748b' }}>
                          {d.breakEvenPax} Pax
                        </td>
                        <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 600 }}>
                          {formatMoney(d.price)} đ
                        </td>
                        <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                          {formatMoney(d.targetPax * d.price)} đ
                        </td>
                        <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                          <span style={{
                            background: '#dcfce7',
                            color: '#16a34a',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px'
                          }}>
                            {d.statusText}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default BU2MarketPlanningPage;
