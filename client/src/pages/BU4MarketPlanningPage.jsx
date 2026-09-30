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
  FolderGit2,
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
  ArrowLeft
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

// Helper format tiền tệ chuẩn Việt Nam có dấu chấm: 59.990.000
const formatMoney = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Helper parse chuỗi có dấu chấm thành số nguyên
const parseMoneyInput = (str) => {
  const clean = String(str).replace(/[^\d]/g, '');
  return clean ? parseInt(clean, 10) : 0;
};

// Component Input Tiền Tệ: Tự động format .000.000 mượt mà khi gõ
const CurrencyInput = ({ value, onChange, placeholder = '0', unit = 'đ' }) => {
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
      background: '#0d131f',
      borderRadius: '6px',
      border: '1px solid #263346',
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
          color: '#f8fafc',
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

// Hàm tính tuần chuẩn hoá của ERP (Đồng bộ 100% với Báo Cáo Tuần Marketing Ads)
const getWeekRanges = (year, month) => {
  if (!year || !month) return {};
  const y = parseInt(year);
  const m = parseInt(month);
  
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0); 
  
  let firstSunday = new Date(firstDay);
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() + 1);
  }
  
  let w1End = new Date(firstSunday);
  const daysInFirstSegment = firstSunday.getDate() - firstDay.getDate() + 1;
  // Rule ERP: Nếu ngày lẻ đầu tháng <= 2 ngày, gộp vào tuần liền kề tiếp theo
  if (daysInFirstSegment <= 2 && w1End.getDate() + 7 <= lastDay.getDate()) {
    w1End.setDate(w1End.getDate() + 7);
  }
  
  const ranges = {};
  ranges[1] = `${firstDay.getDate()}/${m} - ${w1End.getDate()}/${m}`;
  
  let currentStart = new Date(w1End);
  currentStart.setDate(currentStart.getDate() + 1);
  
  for (let w = 2; w <= 4; w++) {
    if (currentStart > lastDay) {
      ranges[w] = '';
      continue;
    }
    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);
    if (currentEnd > lastDay) currentEnd = new Date(lastDay);
    
    ranges[w] = `${currentStart.getDate()}/${m} - ${currentEnd.getDate()}/${m}`;
    
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  
  if (currentStart <= lastDay) {
    ranges[5] = `${currentStart.getDate()}/${m} - ${lastDay.getDate()}/${m}`;
  } else {
    ranges[5] = '';
  }
  return ranges;
};

// ══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU ĐỀ XUẤT KẾ HOẠCH NGÂN SÁCH & TIMELINE QUÝ 4/2026 (BU4)
// TỔNG NGÂN SÁCH ĐỀ XUẤT: 30.000.000 đ (Tròn 30 triệu)
// ══════════════════════════════════════════════════════════════════════════════
const BU4_PROPOSAL_DATA = {
  totalBudget: 30000000,
  totalLeadsPhone: 120, // 88-92 Bhutan + 11-12 Sri Lanka + 12-16 Ladakh (Dải: 111 - 120 Lead)
  totalMessages: 698,   // 508-520 Bhutan + 94 Sri Lanka + 38-50 Ladakh (~640 - 698 Inbox)
  totalPaxAds: 35,      // 28-35 Bhutan + 3 Sri Lanka + 3-4 Ladakh (Dải: 34 - 42 pax)
  totalPaxExternal: 11, // Web, TikTok, cá nhân Sale
  totalPaxOverall: 46,  // Kịch bản lấp đầy tối thiểu hòa vốn 45 - 53 pax (Mục tiêu full 5 đoàn ERP: 70 pax)
  totalRevenue: 3960450000, // Doanh thu Full Đoàn Quý 4 theo ERP (5 đoàn BU4, 70 pax mục tiêu)
  minRevenue: 2544560000,   // Kịch bản lấp đầy tối thiểu hòa vốn (45 pax)
  adsRevenue: 2000000000,   // Doanh thu trực tiếp từ 34 - 42 Pax Ads (~1.95 - 2.42 Tỷ)
  grossProfit: 792090000,   // Lãi gộp Full Đoàn ERP (20% biên lãi)
  routes: {
    bhutan: {
      name: 'Bhutan (3 Đoàn)',
      flag: '',
      badgeColor: '#38bdf8',
      budget: 21060000,
      tourPrice: 59990000,
      leadsPhone: 90, // 21.060.000 / 233.121 đ = 90.3 leads (hoặc 88 lead theo mức 238.000 đ)
      messages: 510,  // Tỷ lệ SĐT thực tế DB 17.71% (90 / 0.1771 = 508 - 510)
      inboxToPhoneRate: 17.7,
      cr: 20,
      paxPerLead: 1.5,
      paxAds: 28,     // 90 * 20% * 1.5 = 27 ~ 28 pax (nếu group 1.8-2 slot = 35 pax)
      paxExternal: 11,
      paxTotal: 39,
      numGroups: 3,
      revenue: 2339610000,
      adsRevenue: 1679720000,
      months: {
        10: {
          budget: 6060000,
          leadsPhone: 26,
          messages: 147,
          paxAds: 8,
          weeks: {
            1: { days: 4, budget: 860000, leads: 4, pax: 1, note: 'Khởi động nuôi phễu (4 ngày x ~215k)' },
            2: { days: 7, budget: 1300000, leads: 5.5, pax: 1.8, note: 'Giữ nhịp tương tác ấm (7 ngày)' },
            3: { days: 7, budget: 1300000, leads: 5.5, pax: 1.8, note: 'Giữ nhịp tương tác ấm (7 ngày)' },
            4: { days: 7, budget: 1300000, leads: 5.5, pax: 1.8, note: 'Thu thập tệp khách tiềm năng' },
            5: { days: 6, budget: 1300000, leads: 5.5, pax: 1.6, note: 'Chốt sớm khách đăng ký trước (6 ngày)' }
          }
        },
        11: {
          budget: 8000000,
          leadsPhone: 34,
          messages: 192,
          paxAds: 10.5,
          weeks: {
            1: { days: 8, budget: 2100000, leads: 9, pax: 3, note: 'Bung ngân sách cao điểm Đoàn 1' },
            2: { days: 7, budget: 2100000, leads: 9, pax: 3, note: 'Chốt chính Đoàn 1 & mở Đoàn 2' },
            3: { days: 7, budget: 1900000, leads: 8, pax: 2.5, note: 'Đẩy mạnh chốt Đoàn 2' },
            4: { days: 7, budget: 1900000, leads: 8, pax: 2, note: 'Gom suất cuối Đoàn 2' },
            5: { days: 1, budget: 0, leads: 0, pax: 0, note: '-' }
          }
        },
        12: {
          budget: 7000000,
          leadsPhone: 30,
          messages: 170,
          paxAds: 9,
          weeks: {
            1: { days: 6, budget: 2000000, leads: 8.5, pax: 2.5, note: 'Khóa sổ Đoàn 2, dồn lực Đoàn 3' },
            2: { days: 7, budget: 2000000, leads: 8.5, pax: 2.5, note: 'Chốt chính Đoàn 3 Tết' },
            3: { days: 7, budget: 1500000, leads: 6.5, pax: 2, note: 'Về đích chốt nốt Đoàn 3' },
            4: { days: 7, budget: 1500000, leads: 6.5, pax: 2, note: 'Tăng cường chốt cận ngày khởi hành' },
            5: { days: 4, budget: 0, leads: 0, pax: 0, note: '-' }
          }
        }
      }
    },
    ladakh: {
      name: 'Ladakh (Tăng Cường Pax)',
      flag: '',
      badgeColor: '#f59e0b',
      budget: 2940000,
      tourPrice: 49990000,
      dailyBudget: 420000,
      durationDays: 7,
      endDate: '07/10/2026',
      leadsPhone: 16, // 2.94M / 181.018 đ = 16.2 leads (hoặc 12 leads theo kịch bản T8 244k)
      messages: 38,   // Rate 41.8% thực tế DB (16 / 0.4184 = 38 inbox)
      cr: 23,
      paxAds: 4,      // 16 * 23% = 3.7 ~ 4 pax
      paxExternal: 0,
      paxTotal: 4,
      revenue: 199960000,
      adsRevenue: 199960000,
      months: {
        10: {
          budget: 2940000,
          leadsPhone: 16,
          messages: 38,
          paxAds: 4,
          weeks: {
            1: { days: 4, budget: 1680000, leads: 9, pax: 2.5, note: 'Chạy tăng cường (4 ngày x 420k)' },
            2: { days: 3, budget: 1260000, leads: 7, pax: 1.5, note: 'Chốt 3-4 suất tăng cường (Đến 07/10)' },
            3: { days: 0, budget: 0, leads: 0, pax: 0, note: 'Đã đóng tour ngày 07/10' },
            4: { days: 0, budget: 0, leads: 0, pax: 0, note: 'Tắt hoàn toàn Ads' },
            5: { days: 0, budget: 0, leads: 0, pax: 0, note: 'Tắt hoàn toàn Ads' }
          }
        },
        11: { budget: 0, leadsPhone: 0, messages: 0, paxAds: 0, weeks: { 1: { budget: 0, leads: 0, pax: 0 }, 2: { budget: 0, leads: 0, pax: 0 }, 3: { budget: 0, leads: 0, pax: 0 }, 4: { budget: 0, leads: 0, pax: 0 }, 5: { budget: 0, leads: 0, pax: 0 } } },
        12: { budget: 0, leadsPhone: 0, messages: 0, paxAds: 0, weeks: { 1: { budget: 0, leads: 0, pax: 0 }, 2: { budget: 0, leads: 0, pax: 0 }, 3: { budget: 0, leads: 0, pax: 0 }, 4: { budget: 0, leads: 0, pax: 0 }, 5: { budget: 0, leads: 0, pax: 0 } } }
      }
    },
    srilanka: {
      name: 'Sri Lanka (Tăng Cường Pax)',
      flag: '',
      badgeColor: '#10b981',
      budget: 6000000,
      tourPrice: 39990000,
      dailyBudget: 300000,
      durationDays: 20,
      endDate: '20/10/2026',
      leadsPhone: 11, // 6M / 508.063 đ = 11.8 leads (hoặc 11 leads theo kịch bản T9 560k)
      messages: 94,   // Rate 12.5% chuẩn thực tế DB (9 leads / 72 inboxes)
      cr: 20,
      paxAds: 3,      // 11 leads * 20% * 1.25 = 2.75 ~ 3 pax
      paxExternal: 0,
      paxTotal: 3,
      revenue: 119970000,
      adsRevenue: 119970000,
      months: {
        10: {
          budget: 6000000,
          leadsPhone: 11,
          messages: 94,
          paxAds: 3,
          weeks: {
            1: { days: 4, budget: 1200000, leads: 2.2, pax: 0.6, note: '4 ngày x 300k (Mở phễu đầu tháng)' },
            2: { days: 7, budget: 2100000, leads: 3.9, pax: 1.0, note: '7 ngày x 300k (Kéo tương tác)' },
            3: { days: 7, budget: 2100000, leads: 3.9, pax: 1.0, note: '7 ngày x 300k (Lọc khách chất lượng)' },
            4: { days: 2, budget: 600000, leads: 1.0, pax: 0.4, note: '2 ngày x 300k (Kết thúc 20/10)' },
            5: { days: 0, budget: 0, leads: 0, pax: 0, note: 'Tạm dừng đợt 1 để xuất vé' }
          }
        },
        11: { budget: 0, leadsPhone: 0, messages: 0, paxAds: 0, weeks: { 1: { budget: 0, leads: 0, pax: 0 }, 2: { budget: 0, leads: 0, pax: 0 }, 3: { budget: 0, leads: 0, pax: 0 }, 4: { budget: 0, leads: 0, pax: 0 }, 5: { budget: 0, leads: 0, pax: 0 } } },
        12: { budget: 0, leadsPhone: 0, messages: 0, paxAds: 0, weeks: { 1: { budget: 0, leads: 0, pax: 0 }, 2: { budget: 0, leads: 0, pax: 0 }, 3: { budget: 0, leads: 0, pax: 0 }, 4: { budget: 0, leads: 0, pax: 0 }, 5: { budget: 0, leads: 0, pax: 0 } } }
      }
    }
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU LỊCH SỬ THỰC TẾ TRÍCH XUẤT TỪ DATABASE BU4
// ══════════════════════════════════════════════════════════════════════════════

// 1. Bhutan (Giai đoạn Mùa Thu: Tháng 6 đến Tháng 8/2026 - Chuẩn 100% DB Production)
const BHUTAN_HISTORICAL_DATA = {
  totalSpend: 18416556,
  totalMessages: 446,
  totalLeads: 79,
  cplMsgAvg: 41293,
  cplLeadAvg: 233121, // 18.416.556 đ / 79 leads = 233.121 đ / lead chuẩn toàn bộ chiến dịch
  cplJuly: 240155,    // Tháng 7 cao điểm: 15.610.094 đ / 65 leads = 240.155 đ
  cplJune: 213109,    // Tháng 6 khởi động: 2.770.422 đ / 13 leads = 213.109 đ
  inboxToLeadRate: 17.71, // 79 / 446 = 17.71% (~5.6 inbox / 1 lead SĐT)
  months: [
    {
      month: 'Tháng 6/2026',
      spend: 2770422,
      messages: 48,
      leads: 13,
      cplMsg: 57717,
      cplLead: 213109,
      note: 'Khởi động test phễu hình ảnh bài tổng cuối năm'
    },
    {
      month: 'Tháng 7/2026',
      spend: 15610094,
      messages: 398,
      leads: 65,
      cplMsg: 39221,
      cplLead: 240155,
      note: 'Tháng cao điểm bung ngân sách kéo khách chính các đoàn mùa thu'
    },
    {
      month: 'Tháng 8/2026',
      spend: 36040,
      messages: 0,
      leads: 1,
      cplMsg: 0,
      cplLead: 36040,
      note: 'Duy trì test lẻ tẻ tệp khách quan tâm'
    }
  ]
};

// 2. Ladakh (Toàn bộ mùa Hè 2026: Tháng 4 đến Tháng 9/2026 - Chuẩn 100% DB Production)
const LADAKH_HISTORICAL_DATA = {
  totalSpend: 68243970,
  totalMessages: 901,
  totalLeads: 377,
  cplMsgAvg: 75742,
  cplLeadAvg: 181018, // 68.243.970 đ / 377 leads = 181.018 đ / lead toàn mùa
  cplSept: 183845,    // Tháng 9 gần nhất: 2.389.986 đ / 13 leads = 183.845 đ
  cplAug: 244623,     // Tháng 8: 2.935.479 đ / 12 leads = 244.623 đ
  inboxToLeadRate: 41.84, // 377 leads / 901 inboxes = 41.84% (Cứ ~2.4 inbox là có 1 SĐT)
  months: [
    {
      month: 'Tháng 4/2026',
      spend: 1142876,
      messages: 17,
      leads: 6,
      cplMsg: 67228,
      cplLead: 190479,
      note: 'Khởi động sớm chiến dịch Roadtrip hè'
    },
    {
      month: 'Tháng 5/2026',
      spend: 11691654,
      messages: 191,
      leads: 86,
      cplMsg: 61213,
      cplLead: 135949,
      note: 'Tăng tốc đầu mùa hè, CPL 135k cực kỳ tối ưu'
    },
    {
      month: 'Tháng 6/2026',
      spend: 28122450,
      messages: 314,
      leads: 139,
      cplMsg: 89562,
      cplLead: 202320,
      note: 'Đỉnh điểm ngân sách cao điểm hè, thu về 139 leads'
    },
    {
      month: 'Tháng 7/2026',
      spend: 21961525,
      messages: 302,
      leads: 121,
      cplMsg: 72720,
      cplLead: 181500,
      note: 'Duy trì chốt các đoàn mùa thu tháng 8-9'
    },
    {
      month: 'Tháng 8/2026',
      spend: 2935479,
      messages: 44,
      leads: 12,
      cplMsg: 66715,
      cplLead: 244623,
      note: 'Lọc kỹ tệp khách muộn cuối hè'
    },
    {
      month: 'Tháng 9/2026',
      spend: 2389986,
      messages: 33,
      leads: 13,
      cplMsg: 72424,
      cplLead: 183845,
      note: 'Chạy tăng cường các suất cuối trước khi đóng tour mùa đông'
    }
  ]
};

// 3. Sri Lanka (Tháng 8 & Tháng 9/2026 - Tuyến mới BU4 - Chuẩn 100% DB Production)
const SRILANKA_HISTORICAL_DATA = {
  totalSpend: 4572565,
  totalMessages: 72,
  totalLeads: 9,
  cplMsgAvg: 63508,
  cplLeadAvg: 508063, // 4.572.565 đ / 9 leads = 508.063 đ / lead chuẩn 2 tháng thực tế
  cplSept: 560499,    // 1.681.497 đ / 3 leads = 560.499 đ / lead tháng 9
  cplAug: 481845,     // 2.891.068 đ / 6 leads = 481.845 đ / lead tháng 8
  inboxToLeadRate: 12.5, // 9 leads / 72 inboxes = 12.5% (Cứ 8 inbox là có 1 SĐT)
  months: [
    {
      month: 'Tháng 8/2026',
      spend: 2891068,
      messages: 50,
      leads: 6,
      cplMsg: 57821,
      cplLead: 481845,
      note: 'Khởi động mở bán tour Sri Lanka mùa đông'
    },
    {
      month: 'Tháng 9/2026',
      spend: 1681497,
      messages: 22,
      leads: 3,
      cplMsg: 76432,
      cplLead: 560499,
      note: 'Duy trì chạy tương tác và gom tệp khách quan tâm'
    }
  ]
};

const BU4MarketPlanningPage = ({ isEmbedded = false, onBack = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const getInitialTab = () => {
    if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'bhutan') return 'bhutan';
    if (tabParam === 'ladakh') return 'ladakh';
    if (tabParam === 'srilanka') return 'srilanka';
    if (tabParam === 'proposal') return 'proposal';
    return 'proposal';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'bhutan') {
        setActiveTab('bhutan');
      } else if (tabParam === 'ladakh') {
        setActiveTab('ladakh');
      } else if (tabParam === 'srilanka') {
        setActiveTab('srilanka');
      } else if (tabParam === 'proposal') {
        setActiveTab('proposal');
      }
    }
  }, [tabParam]);

  // ──────────────────────────────────────────────────────────────────────────
  // 1. STATES CHO BHUTAN
  // ──────────────────────────────────────────────────────────────────────────
  const [numGroups, setNumGroups] = useState(3);
  const [paxPerGroup, setPaxPerGroup] = useState(12);
  const [tourPrice, setTourPrice] = useState(59990000);
  const [costPerPax, setCostPerPax] = useState(47992000);
  const [cplTarget, setCplTarget] = useState(233121); // CPL thực tế chuẩn DB Bhutan: 233.121 đ
  const [crSale, setCrSale] = useState(20); // 20%
  const [paxPerLead, setPaxPerLead] = useState(1.5);
  const [inboxToLeadRate, setInboxToLeadRate] = useState(17.7); // 17.7% thực tế DB (79 leads / 446 inboxes)

  // States cho Phần 3: Dự Trù Marketing (Tính Ngược) của Bhutan
  const [bhutanBudgetCap, setBhutanBudgetCap] = useState(21060000); // 21.060.000 đ (Khớp trọn gói đề xuất 30tr)
  const [bhutanBudgetCr, setBhutanBudgetCr] = useState(20); // 20% theo yêu cầu
  const [bhutanBudgetPaxPerLead, setBhutanBudgetPaxPerLead] = useState(1.5);

  const applyPreset = (preset) => {
    if (preset === 'practical_fit') {
      setNumGroups(3);
      setPaxPerGroup(12);
      setCrSale(7);
      setPaxPerLead(1.35);
      setCplTarget(233121);
      setTourPrice(59990000);
    } else if (preset === 'erp_standard') {
      setNumGroups(3);
      setPaxPerGroup(16);
      setCrSale(7);
      setPaxPerLead(1.0);
      setCplTarget(240000);
      setTourPrice(59990000);
    } else if (preset === 'warm_optimized') {
      setNumGroups(3);
      setPaxPerGroup(10);
      setCrSale(10);
      setPaxPerLead(1.35);
      setCplTarget(220000);
      setTourPrice(59990000);
    }
  };

  // Tính xuôi (Phần 2)
  const calc = useMemo(() => {
    const safePaxPerGroup = paxPerGroup > 0 ? paxPerGroup : 1;
    const totalPax = numGroups * safePaxPerGroup;
    const safePaxPerLead = paxPerLead > 0 ? paxPerLead : 1;
    const requiredDeals = Math.ceil(totalPax / safePaxPerLead);
    const crDecimal = (crSale > 0 ? crSale : 0.5) / 100;
    const requiredLeads = crDecimal > 0 ? Math.ceil(requiredDeals / crDecimal) : 0;
    const rateInboxDecimal = (inboxToLeadRate > 0 ? inboxToLeadRate : 1) / 100;
    const requiredInboxes = rateInboxDecimal > 0 ? Math.ceil(requiredLeads / rateInboxDecimal) : 0;
    const totalAdsBudget = Math.round(requiredLeads * cplTarget);
    const cpaPerPax = totalPax > 0 ? Math.round(totalAdsBudget / totalPax) : 0;
    const totalRevenue = totalPax * tourPrice;
    const grossProfitPerPax = tourPrice - costPerPax;
    const totalGrossProfit = totalPax * grossProfitPerPax;
    const adsToRevenueRatio = totalRevenue > 0 ? ((totalAdsBudget / totalRevenue) * 100).toFixed(2) : '0';
    const adsToProfitRatio = totalGrossProfit > 0 ? ((totalAdsBudget / totalGrossProfit) * 100).toFixed(1) : '0';

    let safetyLevel = 'An toàn';
    let safetyDesc = 'Chi phí quảng cáo dưới 20% lợi nhuận gộp và < 5% doanh thu, đảm bảo an toàn tài chính.';
    if (parseFloat(adsToProfitRatio) > 25) {
      safetyLevel = 'Vượt trần ngân sách';
      safetyDesc = 'Chi phí quảng cáo chiếm hơn 25% lợi nhuận gộp, cần tối ưu thêm tỷ lệ chốt sale.';
    } else if (parseFloat(adsToProfitRatio) > 20) {
      safetyLevel = 'Cận trần chi phí';
      safetyDesc = 'Chi phí quảng cáo xấp xỉ 20% lợi nhuận gộp, cần sale theo sát tệp lead.';
    }

    const octBudget = 1550000;
    const octLeads = Math.round(octBudget / (cplTarget || 1));
    const remainingBudget = Math.max(0, totalAdsBudget - octBudget);
    const novBudget = Math.round(remainingBudget * 0.55);
    const decBudget = Math.round(remainingBudget * 0.45);
    const novLeads = Math.round(novBudget / (cplTarget || 1));
    const decLeads = Math.round(decBudget / (cplTarget || 1));

    return {
      totalPax,
      requiredDeals,
      requiredLeads,
      requiredInboxes,
      totalAdsBudget,
      cpaPerPax,
      totalRevenue,
      totalGrossProfit,
      adsToRevenueRatio,
      adsToProfitRatio,
      safetyLevel,
      safetyDesc,
      octBudget,
      octLeads,
      novBudget,
      novLeads,
      decBudget,
      decLeads
    };
  }, [numGroups, paxPerGroup, tourPrice, costPerPax, cplTarget, crSale, paxPerLead, inboxToLeadRate]);

  // Tính ngược cho Marketing Bhutan (Phần 3)
  const bhutanReverseCalc = useMemo(() => {
    const cpl = cplTarget > 0 ? cplTarget : 233121;
    const leads = Math.floor(bhutanBudgetCap / cpl);
    const inboxes = Math.round(leads / ((inboxToLeadRate || 17.7) / 100));
    const safeBudgetCr = bhutanBudgetCr > 0 ? bhutanBudgetCr : 0.5;
    const deals = (leads * (safeBudgetCr / 100)).toFixed(1);
    const pax = Math.round(parseFloat(deals) * (bhutanBudgetPaxPerLead || 1));
    const revenue = pax * tourPrice;
    const adsRatio = revenue > 0 ? ((bhutanBudgetCap / revenue) * 100).toFixed(2) : '0';
    const roi = bhutanBudgetCap > 0 ? (revenue / bhutanBudgetCap).toFixed(1) : '0';
    const percentOfGroup = Math.round((pax / (paxPerGroup || 12)) * 100);

    return {
      cpl,
      leads,
      inboxes,
      deals,
      pax,
      revenue,
      adsRatio,
      roi,
      percentOfGroup
    };
  }, [bhutanBudgetCap, cplTarget, inboxToLeadRate, bhutanBudgetCr, bhutanBudgetPaxPerLead, tourPrice, paxPerGroup]);

  // Two-way sync handlers cho Bhutan
  const handleBhutanSection2PaxChange = (val) => {
    const desiredPax = parseFloat(val);
    if (!isNaN(desiredPax) && desiredPax > 0) {
      const safePaxPerLead = paxPerLead > 0 ? paxPerLead : 1.35;
      const leads = calc.requiredLeads > 0 ? calc.requiredLeads : 1;
      const newCr = (desiredPax / (leads * safePaxPerLead)) * 100;
      setCrSale(Math.min(30, Math.max(0.5, Math.round(newCr * 10) / 10)));
    }
  };

  const handleBhutanSection3PaxChange = (val) => {
    const desiredPax = parseFloat(val);
    if (!isNaN(desiredPax) && desiredPax > 0) {
      const safePaxPerLead = bhutanBudgetPaxPerLead > 0 ? bhutanBudgetPaxPerLead : 1.35;
      const leads = bhutanReverseCalc.leads;
      if (leads > 0 && safePaxPerLead > 0) {
        const newCr = (desiredPax / (leads * safePaxPerLead)) * 100;
        setBhutanBudgetCr(Math.min(30, Math.max(0.5, Math.round(newCr * 10) / 10)));
      }
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 2. STATES CHO LADAKH
  // ──────────────────────────────────────────────────────────────────────────
  const [ladakhNumGroups, setLadakhNumGroups] = useState(1);
  const [ladakhPaxPerGroup, setLadakhPaxPerGroup] = useState(12);
  const [ladakhTourPrice, setLadakhTourPrice] = useState(36990000); // 36.990.000 đ (Roadtrip) hoặc 42.900.000 đ (Motor)
  const [ladakhCostPerPax, setLadakhCostPerPax] = useState(29592000);
  const [ladakhCplTarget, setLadakhCplTarget] = useState(181018); // CPL toàn mùa DB: 181.018 đ (T9 là 183.845 đ)
  const [ladakhCrSale, setLadakhCrSale] = useState(23); // 23%
  const [ladakhPaxPerLead, setLadakhPaxPerLead] = useState(1.2);
  const [ladakhInboxToLeadRate, setLadakhInboxToLeadRate] = useState(41.8); // 41.8% thực tế DB (377 leads / 901 inboxes)

  // States cho Phần 3: Dự Trù Marketing (Tính Ngược) của Ladakh
  const [ladakhBudgetCap, setLadakhBudgetCap] = useState(2940000); // 2.940.000 đ (420k/ngày x 7 ngày)
  const [ladakhBudgetCr, setLadakhBudgetCr] = useState(23);
  const [ladakhBudgetPaxPerLead, setLadakhBudgetPaxPerLead] = useState(1.2);

  const applyLadakhPreset = (preset) => {
    if (preset === 'oct_final_7days') {
      setLadakhNumGroups(1);
      setLadakhPaxPerGroup(2);
      setLadakhTourPrice(36990000);
      setLadakhCplTarget(181018);
      setLadakhCrSale(10);
      setLadakhPaxPerLead(1.2);
    } else if (preset === 'roadtrip_full') {
      setLadakhNumGroups(1);
      setLadakhPaxPerGroup(12);
      setLadakhTourPrice(36990000);
      setLadakhCostPerPax(29592000);
      setLadakhCplTarget(181018);
      setLadakhCrSale(7);
      setLadakhPaxPerLead(1.25);
    } else if (preset === 'motor_trip_full') {
      setLadakhNumGroups(1);
      setLadakhPaxPerGroup(10);
      setLadakhTourPrice(42900000);
      setLadakhCostPerPax(34320000);
      setLadakhCplTarget(181018);
      setLadakhCrSale(8);
      setLadakhPaxPerLead(1.1);
    }
  };

  const ladakhCalc = useMemo(() => {
    const safePaxPerGroup = ladakhPaxPerGroup > 0 ? ladakhPaxPerGroup : 1;
    const totalPax = ladakhNumGroups * safePaxPerGroup;
    const safePaxPerLead = ladakhPaxPerLead > 0 ? ladakhPaxPerLead : 1;
    const requiredDeals = Math.ceil(totalPax / safePaxPerLead);
    const crDecimal = (ladakhCrSale > 0 ? ladakhCrSale : 0.5) / 100;
    const requiredLeads = crDecimal > 0 ? Math.ceil(requiredDeals / crDecimal) : 0;
    const rateInboxDecimal = (ladakhInboxToLeadRate > 0 ? ladakhInboxToLeadRate : 1) / 100;
    const requiredInboxes = rateInboxDecimal > 0 ? Math.ceil(requiredLeads / rateInboxDecimal) : 0;
    const totalAdsBudget = Math.round(requiredLeads * ladakhCplTarget);
    const cpaPerPax = totalPax > 0 ? Math.round(totalAdsBudget / totalPax) : 0;
    const totalRevenue = totalPax * ladakhTourPrice;
    const grossProfitPerPax = ladakhTourPrice - ladakhCostPerPax;
    const totalGrossProfit = totalPax * grossProfitPerPax;
    const adsToRevenueRatio = totalRevenue > 0 ? ((totalAdsBudget / totalRevenue) * 100).toFixed(2) : '0';
    const adsToProfitRatio = totalGrossProfit > 0 ? ((totalAdsBudget / totalGrossProfit) * 100).toFixed(1) : '0';

    let safetyLevel = 'An toàn';
    let safetyDesc = 'Chi phí quảng cáo dưới 20% lợi nhuận gộp và < 5% doanh thu, biên lợi nhuận ròng an toàn.';
    if (parseFloat(adsToProfitRatio) > 25) {
      safetyLevel = 'Vượt trần ngân sách';
      safetyDesc = 'Chi phí quảng cáo chiếm hơn 25% lợi nhuận gộp, cần tối ưu thêm tỷ lệ chốt sale.';
    } else if (parseFloat(adsToProfitRatio) > 20) {
      safetyLevel = 'Cận trần chi phí';
      safetyDesc = 'Chi phí quảng cáo xấp xỉ 20% lợi nhuận gộp, cần sale theo sát tệp lead.';
    }

    const plan7DaysBudget = 2940000; // 420.000 đ x 7 ngày
    const plan7DaysLeads = Math.round(plan7DaysBudget / (ladakhCplTarget || 181018));
    const plan7DaysInboxes = Math.round(plan7DaysLeads / ((ladakhInboxToLeadRate || 41.8) / 100));
    const plan7DaysDeals = (plan7DaysLeads * (ladakhCrSale / 100)).toFixed(1);
    const plan7DaysPax = Math.round(plan7DaysLeads * (ladakhCrSale / 100) * safePaxPerLead);

    return {
      totalPax,
      requiredDeals,
      requiredLeads,
      requiredInboxes,
      totalAdsBudget,
      cpaPerPax,
      totalRevenue,
      totalGrossProfit,
      adsToRevenueRatio,
      adsToProfitRatio,
      safetyLevel,
      safetyDesc,
      plan7DaysBudget,
      plan7DaysLeads,
      plan7DaysInboxes,
      plan7DaysDeals,
      plan7DaysPax
    };
  }, [ladakhNumGroups, ladakhPaxPerGroup, ladakhTourPrice, ladakhCostPerPax, ladakhCplTarget, ladakhCrSale, ladakhPaxPerLead, ladakhInboxToLeadRate]);

  // Tính ngược cho Marketing Ladakh (Phần 3)
  const ladakhReverseCalc = useMemo(() => {
    const cpl = ladakhCplTarget > 0 ? ladakhCplTarget : 181018;
    const leads = Math.floor(ladakhBudgetCap / cpl);
    const inboxes = Math.round(leads / ((ladakhInboxToLeadRate || 41.8) / 100));
    const safeBudgetCr = ladakhBudgetCr > 0 ? ladakhBudgetCr : 0.5;
    const deals = (leads * (safeBudgetCr / 100)).toFixed(1);
    const pax = Math.round(parseFloat(deals) * (ladakhBudgetPaxPerLead || 1));
    const revenue = pax * ladakhTourPrice;
    const adsRatio = revenue > 0 ? ((ladakhBudgetCap / revenue) * 100).toFixed(2) : '0';
    const roi = ladakhBudgetCap > 0 ? (revenue / ladakhBudgetCap).toFixed(1) : '0';
    const percentOfGroup = Math.round((pax / (ladakhPaxPerGroup || 12)) * 100);

    return {
      cpl,
      leads,
      inboxes,
      deals,
      pax,
      revenue,
      adsRatio,
      roi,
      percentOfGroup
    };
  }, [ladakhBudgetCap, ladakhCplTarget, ladakhInboxToLeadRate, ladakhBudgetCr, ladakhBudgetPaxPerLead, ladakhTourPrice, ladakhPaxPerGroup]);

  // Two-way sync handlers cho Ladakh
  const handleLadakhSection4PaxChange = (val) => {
    const desiredPax = parseFloat(val);
    if (!isNaN(desiredPax) && desiredPax > 0) {
      const safePaxPerLead = ladakhPaxPerLead > 0 ? ladakhPaxPerLead : 1.25;
      const leads = ladakhCalc.requiredLeads > 0 ? ladakhCalc.requiredLeads : 1;
      const newCr = (desiredPax / (leads * safePaxPerLead)) * 100;
      setLadakhCrSale(Math.min(30, Math.max(0.5, Math.round(newCr * 10) / 10)));
    }
  };

  const handleLadakhSection3PaxChange = (val) => {
    const desiredPax = parseFloat(val);
    if (!isNaN(desiredPax) && desiredPax > 0) {
      const safePaxPerLead = ladakhBudgetPaxPerLead > 0 ? ladakhBudgetPaxPerLead : 1.25;
      const leads = ladakhReverseCalc.leads;
      if (leads > 0 && safePaxPerLead > 0) {
        const newCr = (desiredPax / (leads * safePaxPerLead)) * 100;
        setLadakhBudgetCr(Math.min(30, Math.max(0.5, Math.round(newCr * 10) / 10)));
      }
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // 3. STATES CHO SRI LANKA
  // ──────────────────────────────────────────────────────────────────────────
  const [srilankaNumGroups, setSrilankaNumGroups] = useState(1);
  const [srilankaPaxPerGroup, setSrilankaPaxPerGroup] = useState(12);
  const [srilankaTourPrice, setSrilankaTourPrice] = useState(39990000); // 39.990.000 đ
  const [srilankaCostPerPax, setSrilankaCostPerPax] = useState(31992000);
  const [srilankaCplTarget, setSrilankaCplTarget] = useState(508063); // CPL trung bình thực tế 2 tháng: 508.063 đ (T8: 481.845 đ, T9: 560.499 đ)
  const [srilankaCrSale, setSrilankaCrSale] = useState(20); // 20%
  const [srilankaPaxPerLead, setPaxPerLeadSrilanka] = useState(1.25);
  const [srilankaInboxToLeadRate, setSrilankaInboxToLeadRate] = useState(12.5); // 12.5% thực tế (9 leads / 72 inboxes)

  // States cho Phần 3: Dự Trù Marketing của Sri Lanka
  const [srilankaBudgetCap, setSrilankaBudgetCap] = useState(6000000); // 6.000.000 đ (300k/ngày x 20 ngày)
  const [srilankaBudgetCr, setSrilankaBudgetCr] = useState(20);
  const [srilankaBudgetPaxPerLead, setSrilankaBudgetPaxPerLead] = useState(1.25);

  const applySrilankaPreset = (preset) => {
    if (preset === 'oct_plan_20days') {
      setSrilankaNumGroups(1);
      setSrilankaPaxPerGroup(3);
      setSrilankaTourPrice(39990000);
      setSrilankaCplTarget(508063);
      setSrilankaCrSale(20);
      setSrilankaPaxPerLead(1.25);
    } else if (preset === 'standard_full_group') {
      setSrilankaNumGroups(1);
      setSrilankaPaxPerGroup(12);
      setSrilankaTourPrice(39990000);
      setSrilankaCostPerPax(31992000);
      setSrilankaCplTarget(508063);
      setSrilankaCrSale(10);
      setSrilankaPaxPerLead(1.25);
    }
  };

  const srilankaCalc = useMemo(() => {
    const safePaxPerGroup = srilankaPaxPerGroup > 0 ? srilankaPaxPerGroup : 1;
    const totalPax = srilankaNumGroups * safePaxPerGroup;
    const safePaxPerLead = srilankaPaxPerLead > 0 ? srilankaPaxPerLead : 1;
    const requiredDeals = Math.ceil(totalPax / safePaxPerLead);
    const crDecimal = (srilankaCrSale > 0 ? srilankaCrSale : 0.5) / 100;
    const requiredLeads = crDecimal > 0 ? Math.ceil(requiredDeals / crDecimal) : 0;
    const rateInboxDecimal = (srilankaInboxToLeadRate > 0 ? srilankaInboxToLeadRate : 1) / 100;
    const requiredInboxes = rateInboxDecimal > 0 ? Math.ceil(requiredLeads / rateInboxDecimal) : 0;
    const totalAdsBudget = Math.round(requiredLeads * srilankaCplTarget);
    const cpaPerPax = totalPax > 0 ? Math.round(totalAdsBudget / totalPax) : 0;
    const totalRevenue = totalPax * srilankaTourPrice;
    const grossProfitPerPax = srilankaTourPrice - srilankaCostPerPax;
    const totalGrossProfit = totalPax * grossProfitPerPax;
    const adsToRevenueRatio = totalRevenue > 0 ? ((totalAdsBudget / totalRevenue) * 100).toFixed(2) : '0';
    const adsToProfitRatio = totalGrossProfit > 0 ? ((totalAdsBudget / totalGrossProfit) * 100).toFixed(1) : '0';

    let safetyLevel = 'An toàn';
    let safetyDesc = 'Chi phí quảng cáo dưới 20% lợi nhuận gộp và < 5% doanh thu, đảm bảo an toàn tài chính.';
    if (parseFloat(adsToProfitRatio) > 25) {
      safetyLevel = 'Vượt trần ngân sách';
      safetyDesc = 'Chi phí quảng cáo chiếm hơn 25% lợi nhuận gộp, cần tối ưu thêm CPL hoặc CR.';
    } else if (parseFloat(adsToProfitRatio) > 20) {
      safetyLevel = 'Cận trần chi phí';
      safetyDesc = 'Chi phí quảng cáo xấp xỉ 20% lợi nhuận gộp, cần sale theo sát tệp lead.';
    }

    const plan20DaysBudget = 6000000; // 300.000 đ x 20 ngày
    const plan20DaysLeads = Math.round(plan20DaysBudget / (srilankaCplTarget || 508063));
    const plan20DaysInboxes = Math.round(plan20DaysLeads / ((srilankaInboxToLeadRate || 12.5) / 100));
    const plan20DaysDeals = (plan20DaysLeads * (srilankaCrSale / 100)).toFixed(1);
    const plan20DaysPax = Math.round(plan20DaysLeads * (srilankaCrSale / 100) * safePaxPerLead);

    return {
      totalPax,
      requiredDeals,
      requiredLeads,
      requiredInboxes,
      totalAdsBudget,
      cpaPerPax,
      totalRevenue,
      totalGrossProfit,
      adsToRevenueRatio,
      adsToProfitRatio,
      safetyLevel,
      safetyDesc,
      plan20DaysBudget,
      plan20DaysLeads,
      plan20DaysInboxes,
      plan20DaysDeals,
      plan20DaysPax
    };
  }, [srilankaNumGroups, srilankaPaxPerGroup, srilankaTourPrice, srilankaCostPerPax, srilankaCplTarget, srilankaCrSale, srilankaPaxPerLead, srilankaInboxToLeadRate]);

  const srilankaReverseCalc = useMemo(() => {
    const cpl = srilankaCplTarget > 0 ? srilankaCplTarget : 508063;
    const leads = Math.floor(srilankaBudgetCap / cpl);
    const inboxes = Math.round(leads / ((srilankaInboxToLeadRate || 12.5) / 100));
    const safeBudgetCr = srilankaBudgetCr > 0 ? srilankaBudgetCr : 0.5;
    const deals = (leads * (safeBudgetCr / 100)).toFixed(1);
    const pax = Math.round(parseFloat(deals) * (srilankaBudgetPaxPerLead || 1));
    const revenue = pax * srilankaTourPrice;
    const adsRatio = revenue > 0 ? ((srilankaBudgetCap / revenue) * 100).toFixed(2) : '0';
    const roi = srilankaBudgetCap > 0 ? (revenue / srilankaBudgetCap).toFixed(1) : '0';
    const percentOfGroup = Math.round((pax / (srilankaPaxPerGroup || 12)) * 100);

    return {
      cpl,
      leads,
      inboxes,
      deals,
      pax,
      revenue,
      adsRatio,
      roi,
      percentOfGroup
    };
  }, [srilankaBudgetCap, srilankaCplTarget, srilankaInboxToLeadRate, srilankaBudgetCr, srilankaBudgetPaxPerLead, srilankaTourPrice, srilankaPaxPerGroup]);

  // Two-way sync handlers cho Sri Lanka
  const handleSrilankaSection4PaxChange = (val) => {
    const desiredPax = parseFloat(val);
    if (!isNaN(desiredPax) && desiredPax > 0) {
      const safePaxPerLead = srilankaPaxPerLead > 0 ? srilankaPaxPerLead : 1.3;
      const leads = srilankaCalc.requiredLeads > 0 ? srilankaCalc.requiredLeads : 1;
      const newCr = (desiredPax / (leads * safePaxPerLead)) * 100;
      setSrilankaCrSale(Math.min(30, Math.max(0.5, Math.round(newCr * 10) / 10)));
    }
  };

  const handleSrilankaSection3PaxChange = (val) => {
    const desiredPax = parseFloat(val);
    if (!isNaN(desiredPax) && desiredPax > 0) {
      const safePaxPerLead = srilankaBudgetPaxPerLead > 0 ? srilankaBudgetPaxPerLead : 1.3;
      const leads = srilankaReverseCalc.leads;
      if (leads > 0 && safePaxPerLead > 0) {
        const newCr = (desiredPax / (leads * safePaxPerLead)) * 100;
        setSrilankaBudgetCr(Math.min(30, Math.max(0.5, Math.round(newCr * 10) / 10)));
      }
    }
  };

  return (
    <div style={{
      maxWidth: '1160px',
      margin: '0 auto',
      padding: '24px 20px 80px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      color: activeTab === 'proposal' ? '#1e293b' : '#cbd5e1',
      background: activeTab === 'proposal' ? '#f8fafc' : '#090d16',
      minHeight: '100vh'
    }}>
      {/* ── CSS Scoped Cho Grid 3 Cột Chuẩn Màn Hình ── */}
      <style>{`
        .bu4-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }
        @media (max-width: 992px) {
          .bu4-grid-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .bu4-grid-3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* ── Nút Quay Lại Khi Embedded Trong Marketing Ads ── */}
      {onBack && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
          padding: '10px 16px',
          background: activeTab === 'proposal' ? '#ffffff' : '#0d131f',
          border: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#0284c7',
              border: 'none',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(2, 132, 199, 0.3)'
            }}
          >
            <ArrowLeft size={15} />
            <span>← Quay lại Danh Sách Kế Hoạch BU</span>
          </button>
          <div style={{ fontSize: '0.82rem', color: activeTab === 'proposal' ? '#475569' : '#94a3b8' }}>
            Đang xem: <strong>Kế Hoạch & Dự Toán Ngân Sách BU4 (Quý 4/2026)</strong>
          </div>
          <Link
            to="/tai-lieu/thi-truong-bu4"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#0284c7',
              fontSize: '0.8rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <span>Mở toàn màn hình</span>
            <ExternalLink size={13} />
          </Link>
        </div>
      )}

      {/* ── Top Header & Breadcrumb ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '16px',
        borderBottom: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
          <FolderGit2 size={16} color={activeTab === 'proposal' ? '#0284c7' : '#94a3b8'} />
          <span>BU4 Strategy /</span>
          <span style={{ color: activeTab === 'proposal' ? '#0f172a' : '#e2e8f0', fontWeight: 600 }}>
            {activeTab === 'proposal' && 'Bảng Đề Xuất & Timeline Quý 4 (30 Triệu)'}
            {activeTab === 'bhutan' && 'Dự Toán Ads Bhutan (Quý 4)'}
            {activeTab === 'ladakh' && 'Kế Hoạch Ads Ladakh (Tăng Cường 7 Ngày Đến 07/10)'}
            {activeTab === 'srilanka' && 'Kế Hoạch Ads Sri Lanka (Tăng Cường 20 Ngày Đến 20/10)'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{
            background: activeTab === 'proposal' ? '#ffffff' : '#131d2e',
            color: activeTab === 'proposal' ? '#475569' : '#94a3b8',
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '4px',
            border: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b',
            fontWeight: 600
          }}>BU4</span>
          <span style={{
            background: activeTab === 'proposal' ? '#ffffff' : '#131d2e',
            color: activeTab === 'proposal' ? '#1e293b' : '#cbd5e1',
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '4px',
            border: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b',
            fontWeight: 500
          }}>
            {activeTab === 'proposal' ? (
              <span>Ngân Sách Đề Xuất: <strong style={{ color: '#0284c7' }}>30.000.000 đ</strong></span>
            ) : (
              <span>CPL Lịch Sử: <strong style={{ color: '#38bdf8' }}>
                {activeTab === 'bhutan' && `${formatMoney(BHUTAN_HISTORICAL_DATA.cplLeadAvg)} đ`}
                {activeTab === 'ladakh' && `${formatMoney(LADAKH_HISTORICAL_DATA.cplLeadAvg)} đ`}
                {activeTab === 'srilanka' && `${formatMoney(SRILANKA_HISTORICAL_DATA.cplLeadAvg)} đ`}
              </strong></span>
            )}
          </span>
        </div>
      </div>

      {/* ── Tiêu Đề Chính ── */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          margin: '0 0 6px',
          color: activeTab === 'proposal' ? '#0f172a' : '#f8fafc',
          letterSpacing: '-0.02em'
        }}>
          Kế Hoạch & Dự Toán Ngân Sách BU4
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>
          Đề xuất phân bổ ngân sách marketing 30 triệu Quý 4, timeline vận hành và bảng đề xuất đơn giản theo từng tuyến.
        </p>
      </div>

      {/* ── Navigation Tabs (Tuyến Tour) ── */}
      <div style={{
        display: 'flex',
        gap: '6px',
        borderBottom: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b',
        paddingBottom: '10px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={() => setActiveTab('proposal')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'proposal' ? '1px solid #0284c7' : '1px solid #e2e8f0',
            background: activeTab === 'proposal' ? '#0284c7' : '#ffffff',
            color: activeTab === 'proposal' ? '#ffffff' : '#64748b',
            fontWeight: activeTab === 'proposal' ? 600 : 400,
            fontSize: '0.86rem',
            cursor: 'pointer',
            boxShadow: activeTab === 'proposal' ? '0 1px 3px rgba(2, 132, 199, 0.2)' : 'none'
          }}
        >
          <span>0. Bảng Đề Xuất & Timeline Q4 (30 Tr) {activeTab === 'proposal' && '(Đang xem)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('bhutan')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'bhutan' ? '1px solid #0284c7' : (activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid transparent'),
            background: activeTab === 'bhutan' ? (activeTab === 'proposal' ? '#0284c7' : '#131d2e') : (activeTab === 'proposal' ? '#ffffff' : 'transparent'),
            color: activeTab === 'bhutan' ? (activeTab === 'proposal' ? '#ffffff' : '#38bdf8') : '#64748b',
            fontWeight: activeTab === 'bhutan' ? 600 : 400,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <span>1. Bhutan {activeTab === 'bhutan' && '(Đang xem)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ladakh')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'ladakh' ? '1px solid #0284c7' : (activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid transparent'),
            background: activeTab === 'ladakh' ? (activeTab === 'proposal' ? '#0284c7' : '#131d2e') : (activeTab === 'proposal' ? '#ffffff' : 'transparent'),
            color: activeTab === 'ladakh' ? (activeTab === 'proposal' ? '#ffffff' : '#38bdf8') : '#64748b',
            fontWeight: activeTab === 'ladakh' ? 600 : 400,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <span>2. Ladakh {activeTab === 'ladakh' && '(Đang xem)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('srilanka')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '6px',
            border: activeTab === 'srilanka' ? '1px solid #0284c7' : (activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid transparent'),
            background: activeTab === 'srilanka' ? (activeTab === 'proposal' ? '#0284c7' : '#131d2e') : (activeTab === 'proposal' ? '#ffffff' : 'transparent'),
            color: activeTab === 'srilanka' ? (activeTab === 'proposal' ? '#ffffff' : '#38bdf8') : '#64748b',
            fontWeight: activeTab === 'srilanka' ? 600 : 400,
            fontSize: '0.86rem',
            cursor: 'pointer'
          }}
        >
          <span>3. Sri Lanka {activeTab === 'srilanka' && '(Đang xem)'}</span>
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 0: BẢNG ĐỀ XUẤT TỔNG THỂ & TIMELINE QUÝ 4 (30 TRIỆU)
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'proposal' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ── 1. TỔNG BUDGET ĐỀ XUẤT & KỲ VỌNG (TỔNG QUAN GỌN GÀNG) ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px'
          }}>
            {/* Tổng Budget */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
                Tổng Budget Đề Xuất
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0284c7', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                30.000.000 đ
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Gói ngân sách marketing Q4 (Tròn 30 triệu)
              </div>
            </div>

            {/* Kỳ vọng Lead SĐT */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
                Kỳ Vọng Lead Dự Kiến
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                111 - 120 Lead SĐT
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Thu về <strong>~643 - 698 Tin nhắn Inbox</strong> (Rate TB ~17.5%)
              </div>
            </div>

            {/* Kỳ vọng Pax chốt */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
                Kỳ Vọng Pax Dự Kiến
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                34 - 42 Pax <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>(Tổng: 45 - 53 Pax)</span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                <strong>34 - 42 Pax từ Ads</strong> + 11 Pax kênh ngoài Ads (Đạt & vượt chỉ tiêu)
              </div>
            </div>

            {/* Doanh thu dự kiến */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px 18px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Doanh Thu Dự Kiến
                </div>
                
                {/* Dòng 1: Full Đoàn Dự Kiến */}
                <div style={{ marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DT Full Đoàn Dự Kiến (Kế hoạch ERP):</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                    3.960.450.000 đ
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Full 5 đoàn BU4 (70 Pax) • Chi phí Ads: <strong style={{ color: '#16a34a' }}>0.76%</strong> <span style={{ color: '#94a3b8' }}>(Tối thiểu 45 Pax: ~2.54 Tỷ)</span>
                  </div>
                </div>

                {/* Dòng 2: Pax từ Meta Ads Dự Kiến */}
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '4px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 600 }}>DT Pax từ Meta Ads Dự Kiến:</div>
                  <div style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0284c7', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
                    ~1.95 - 2.42 Tỷ
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Từ 34 - 42 Pax Ads • Chi phí Ads: <strong style={{ color: '#0284c7' }}>1.24% - 1.54%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. XONG TỚI TABLE ĐỀ XUẤT ĐƠN GIẢN (HEADING: TUYẾN • BUDGET • LEAD DỰ KIẾN • PAX DỰ KIẾN) ── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} color="#0284c7" />
                  Bảng Phân Bổ Ngân Sách Quý 4 Theo Tuyến
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Bảng tính đơn giản: Tuyến • Budget & Lead dự kiến • Pax dự kiến.
                </p>
              </div>
              <span style={{ fontSize: '0.82rem', background: '#f8fafc', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 600 }}>
                Tổng Budget: <strong style={{ color: '#0284c7' }}>30.000.000 đ</strong>
              </span>
            </div>

            {/* Bảng Table đơn giản theo đúng yêu cầu: Gộp Budget & Lead Dự Kiến */}
            <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <table style={{ width: '100%', minWidth: '720px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={{ padding: '11px 14px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', minWidth: '220px' }}>
                      Tuyến
                    </th>
                    <th style={{ padding: '11px 14px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', minWidth: '150px' }}>
                      Budget & Lead Dự Kiến
                    </th>
                    <th style={{ padding: '11px 14px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', minWidth: '140px' }}>
                      Pax Dự Kiến
                    </th>
                    <th style={{ padding: '11px 14px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', minWidth: '240px' }}>
                      Kế Hoạch & Chi Tiết Tính Toán
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* 1. Bhutan */}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}><strong>Bhutan</strong> (3 Đoàn)</div>
                      <div style={{ fontSize: '0.73rem', color: '#16a34a', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap' }}>
                        • DT Full Đoàn: <strong>~2.52 - 2.88 Tỷ</strong> <span style={{ color: '#64748b', fontWeight: 400 }}>(Full 3 đoàn: 42 - 48 pax)</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#0284c7', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap' }}>
                        • DT Pax Meta Ads: <strong>~1.68 - 2.10 Tỷ</strong> <span style={{ color: '#64748b', fontWeight: 400 }}>(28 - 35 pax)</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.98rem', whiteSpace: 'nowrap' }}>
                        21.060.000 đ
                      </div>
                      <div style={{ marginTop: '3px', fontWeight: 600, color: '#0f172a', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                        88 - 92 Lead SĐT
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        ~508 - 520 Inbox (Rate 17.7%)
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.96rem' }}>28 - 35 Pax (từ Ads)</div>
                      <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+11 ngoài = 39 - 46 Pax (Full: 48 pax)</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                      • Tháng 10: <strong>6.060.000 đ</strong> (tăng cường đón sóng) • Tháng 11: <strong>8 triệu</strong> (cao điểm) • Tháng 12: <strong>7 triệu</strong> (về đích).<br />
                      • CPL thực tế TB: <strong>233.121 đ/lead</strong> (~5.6 inbox/SĐT). 21.06 triệu mang về 88 - 92 Lead SĐT.<br />
                      • Tỷ lệ chốt sale 20%, hệ số group 1.5 - 2 slot → 28 - 35 Pax từ Ads. 11 pax kênh ngoài → Tổng 39 - 46 Pax.
                    </td>
                  </tr>

                  {/* 2. Sri Lanka */}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}><strong>Sri Lanka</strong> (Tăng Cường Pax)</div>
                      <div style={{ fontSize: '0.73rem', color: '#16a34a', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap' }}>
                        • DT Full Đoàn: <strong>~400 - 480 Tr</strong> <span style={{ color: '#64748b', fontWeight: 400 }}>(10 - 12 pax ghép full tour)</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#10b981', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap' }}>
                        • DT Pax Meta Ads: <strong>~120 Tr</strong> <span style={{ color: '#64748b', fontWeight: 400 }}>(3 pax Ads)</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.98rem', whiteSpace: 'nowrap' }}>
                        6.000.000 đ
                      </div>
                      <div style={{ marginTop: '3px', fontWeight: 600, color: '#0f172a', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                        11 - 12 Lead SĐT
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        ~78 - 94 Inbox (Rate 12.5%)
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.96rem' }}>3 Pax (từ Ads)</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Ghép đoàn: 10 - 12 Pax (CR 20%)</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                      • CPL thực tế TB: <strong>508.063 đ</strong> (T8: 481k, T9: 560k). Tỷ lệ SĐT 12.5% (~8 inbox/SĐT).<br />
                      • 6 triệu mang về 11 - 12 Lead SĐT (~88 - 94 inbox). Tăng cường chốt 3 Pax, dừng 20/10 để xuất vé.
                    </td>
                  </tr>

                  {/* 3. Ladakh */}
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}><strong>Ladakh</strong> (Tăng Cường Pax)</div>
                      <div style={{ fontSize: '0.73rem', color: '#16a34a', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap' }}>
                        • DT Full Đoàn: <strong>~600 - 686 Tr</strong> <span style={{ color: '#64748b', fontWeight: 400 }}>(12 - 16 pax full tour)</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#d97706', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap' }}>
                        • DT Pax Meta Ads: <strong>~150 - 200 Tr</strong> <span style={{ color: '#64748b', fontWeight: 400 }}>(3 - 4 pax Ads)</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#d97706', fontSize: '0.98rem', whiteSpace: 'nowrap' }}>
                        2.940.000 đ
                      </div>
                      <div style={{ marginTop: '3px', fontWeight: 600, color: '#0f172a', fontSize: '0.84rem', whiteSpace: 'nowrap' }}>
                        12 - 16 Lead SĐT
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        ~38 - 50 Inbox (Rate 41.8%)
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, color: '#d97706', fontSize: '0.96rem' }}>3 - 4 Pax (từ Ads)</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Chốt tăng cường trước 07/10 (CR 23%)</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                      • CPL thực tế toàn mùa: <strong>181.018 đ</strong> (T9 gần nhất: 183.845 đ, T8: 244.623 đ). Tỷ lệ SĐT 41.8% (~2.4 inbox/SĐT).<br />
                      • 2.94 triệu mang về 16 Lead SĐT (~38 inbox). Kịch bản thận trọng T8: 12 Lead SĐT. Tăng cường chốt 3 - 4 Pax trước khi đóng mùa đông.
                    </td>
                  </tr>

                  {/* TỔNG CỘNG */}
                  <tr style={{ background: '#f8fafc', borderTop: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}><strong>TỔNG CỘNG</strong></div>
                      <div style={{ fontSize: '0.73rem', color: '#16a34a', fontWeight: 700, marginTop: '3px', whiteSpace: 'nowrap' }}>
                        • DT Full Đoàn: <strong>3.960.450.000 đ</strong> <span style={{ color: '#64748b', fontWeight: 500 }}>(Full 5 đoàn ERP - 70 pax)</span>
                      </div>
                      <div style={{ fontSize: '0.73rem', color: '#0284c7', fontWeight: 700, marginTop: '1px', whiteSpace: 'nowrap' }}>
                        • DT Pax Meta Ads: <strong>~1.95 - 2.42 Tỷ</strong> <span style={{ color: '#64748b', fontWeight: 500 }}>(34 - 42 pax)</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1.05rem', whiteSpace: 'nowrap' }}>
                        30.000.000 đ
                      </div>
                      <div style={{ marginTop: '3px', fontWeight: 700, color: '#0f172a', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                        111 - 120 Lead SĐT
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        ~643 - 698 Inbox (Rate TB 17.5%)
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '1rem' }}>34 - 42 Pax (từ Ads)</div>
                      <div style={{ fontSize: '0.76rem', color: '#16a34a', fontWeight: 700 }}>Tổng nguồn: 45 - 53 Pax (Mục tiêu ERP: 70 Pax)</div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontSize: '0.82rem', lineHeight: '1.6' }}>
                      <div>• <strong>DT Full Đoàn Dự Kiến:</strong> <strong style={{ color: '#16a34a' }}>3.960.450.000 đ</strong> <span style={{ color: '#64748b', fontSize: '0.76rem' }}>(Full 5 đoàn BU4: 3 đoàn Bhutan + Ladakh + Sri Lanka - 70 Pax mục tiêu ERP)</span> • Chi phí Ads: <strong style={{ color: '#16a34a' }}>0.76%</strong> <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>(Tối thiểu 45 Pax: ~2.54 Tỷ)</span></div>
                      <div>• <strong>DT Pax từ Meta Ads Dự Kiến:</strong> <strong style={{ color: '#0284c7' }}>~1.95 - 2.42 Tỷ</strong> <span style={{ color: '#64748b', fontSize: '0.76rem' }}>(Từ 34 - 42 Pax do ngân sách Ads mang về)</span> • Chi phí Ads: <strong style={{ color: '#0284c7' }}>1.24% - 1.54%</strong></div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quick Navigation Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('bhutan')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Máy Tính Dự Toán Ads Bhutan
                </button>
                <button
                  onClick={() => setActiveTab('ladakh')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Kế Hoạch Ladakh (Tăng Cường 7 Ngày)
                </button>
                <button
                  onClick={() => setActiveTab('srilanka')}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    color: '#334155',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Kế Hoạch Sri Lanka (Tăng Cường 20 Ngày)
                </button>
              </div>

              <Link
                to="/marketing-ads"
                style={{
                  color: '#0284c7',
                  fontSize: '0.8rem',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 500
                }}
              >
                <span>Mở Bảng Điều Khiển Marketing Ads ERP</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          {/* ── 3. TIMELINE & LỘ TRÌNH CHẠY NGÂN SÁCH (MÀU CHỈ Ở BIỂU ĐỒ) ── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} color="#0284c7" />
                Lộ Trình & Timeline Chạy Ngân Sách Quý 4 (01/10 - 31/12/2026)
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                Quy luật chạy dồn lực: Bhutan chạy đều 3 tháng (tập trung cao điểm T11-12), Sri Lanka tăng cường pax 20 ngày đầu tháng 10, Ladakh tăng cường pax 7 ngày đầu tháng 10 trước khi đóng tour mùa đông.
              </p>
            </div>

            {/* Khung Gantt Chart */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              padding: '16px',
              overflowX: 'auto'
            }}>
              {/* Header Tháng */}
              <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '190px repeat(3, 1fr)', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tuyến Tour / Trọng Tâm</div>
                <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                  THÁNG 10/2026 <span style={{ color: '#0284c7', fontWeight: 700 }}>(15.000.000 đ)</span>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Chạy song song 3 tuyến</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                  THÁNG 11/2026 <span style={{ color: '#ea580c', fontWeight: 700 }}>(8.000.000 đ)</span>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Cao điểm bung ngân sách Bhutan</div>
                </div>
                <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                  THÁNG 12/2026 <span style={{ color: '#059669', fontWeight: 700 }}>(7.000.000 đ)</span>
                  <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Về đích chốt Đoàn 3 & khách Tết</div>
                </div>
              </div>

              {/* DÒNG 1: BHUTAN */}
              <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '190px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0284c7' }}>1. Bhutan (3 Đoàn)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Trọng tâm • 21.060.000 đ</div>
                  </div>
                </div>
                <div>
                  <div style={{
                    width: '100%',
                    background: '#0284c7',
                    color: '#ffffff',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(2, 132, 199, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Phase 1: 6.060.000 đ</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '3px' }}>26 Leads</span>
                  </div>
                </div>
                <div>
                  <div style={{
                    width: '100%',
                    background: '#ea580c',
                    color: '#ffffff',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    boxShadow: '0 1px 3px rgba(234, 88, 12, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Phase 2: 8.000.000 đ</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '3px' }}>Chốt Đoàn 1 & 2</span>
                  </div>
                </div>
                <div>
                  <div style={{
                    width: '100%',
                    background: '#059669',
                    color: '#ffffff',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    boxShadow: '0 1px 3px rgba(5, 150, 105, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>Phase 3: 7.000.000 đ</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '3px' }}>Chốt Đoàn 3 Tết</span>
                  </div>
                </div>
              </div>

              {/* DÒNG 2: SRI LANKA */}
              <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '190px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#10b981' }}>2. Sri Lanka (Tăng Cường Pax)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>300k/ngày • 6.000.000 đ</div>
                  </div>
                </div>
                <div>
                  <div style={{
                    width: '85%',
                    background: '#10b981',
                    color: '#ffffff',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span>01 - 20/10 (20 ngày)</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '3px' }}>11 - 12 Leads</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#d97706', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <Flag size={12} color="#d97706" />
                    <span>20/10: Chốt vé (3 pax)</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                  Chăm sóc tệp ấm / Ghép đoàn
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                  Khởi hành mùa đông
                </div>
              </div>

              {/* DÒNG 3: LADAKH */}
              <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '190px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '12px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#d97706' }}>3. Ladakh (Tăng Cường Pax)</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>420k/ngày • 2.940.000 đ</div>
                  </div>
                </div>
                <div>
                  <div style={{
                    width: '65%',
                    background: '#d97706',
                    color: '#ffffff',
                    borderRadius: '4px',
                    padding: '6px 8px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <span>01 - 07/10 (7 ngày)</span>
                    <span style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '3px' }}>12 - 16 Leads</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#dc2626', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    <Flag size={12} color="#dc2626" />
                    <span>07/10: Dừng Ads (3 - 4 pax) • Đóng mùa đông</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                  Đã đóng tour mùa đông
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                  Đóng mùa đông
                </div>
              </div>
            </div>

            {/* Milestones Cards */}
            <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#0284c7', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={13} /> 15/11: Chốt Đoàn 1 Bhutan
                </div>
                <div style={{ color: '#64748b' }}>Hoàn tất 12/12 khách Đoàn 1 nhờ đợt bung ngân sách 8 triệu đầu tháng 11.</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#059669', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Target size={13} /> 20/12: Khóa Sổ 3 Đoàn Bhutan
                </div>
                <div style={{ color: '#64748b' }}>Đạt và vượt chỉ tiêu 36 khách Bhutan (28 - 35 Pax Ads + 11 Pax Ngoài = 39 - 46 Pax), hoàn thành kế hoạch 3 đoàn.</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#10b981', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flag size={13} /> 20/10: Chốt Vé Sri Lanka
                </div>
                <div style={{ color: '#64748b' }}>Tiêu hết 6.0tr (11 - 12 lead), tăng cường chốt đủ 3 pax đợt đầu. Tạm ngưng ads để xuất vé.</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 12px', fontSize: '0.75rem' }}>
                <div style={{ fontWeight: 700, color: '#d97706', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flag size={13} /> 07/10: Đóng Tuyến Ladakh
                </div>
                <div style={{ color: '#64748b' }}>Tiêu hết 2.94tr (12 - 16 lead), tăng cường chốt 3 - 4 pax. Sau 07/10 dừng hẳn Ads do Ladakh vào mùa đông.</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: BHUTAN
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'bhutan' && (
        <div>
          {/* ── 1. BẢNG DỮ LIỆU LỊCH SỬ THỰC TẾ (TỐI GIẢN) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                  1. Dữ liệu lịch sử chạy Ads Bhutan (Tháng 6 đến Tháng 8/2026)
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Số liệu thực tế trích xuất từ database Meta Ads của BU4 (Toàn bộ 3 tháng chiến dịch Mùa Thu cuối năm)
                </p>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Tỷ lệ lọc SĐT từ Inbox: <strong style={{ color: '#38bdf8' }}>17.7%</strong> (~5.6 inbox / 1 lead SĐT)
              </div>
            </div>

            {/* 4 Chỉ số tóm tắt */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Tổng chi phí đã chi</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {formatMoney(BHUTAN_HISTORICAL_DATA.totalSpend)} đ
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Tin nhắn (Inbox)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {BHUTAN_HISTORICAL_DATA.totalMessages} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {formatMoney(BHUTAN_HISTORICAL_DATA.cplMsgAvg)} đ / inbox
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Lead thu về (Có SĐT)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {BHUTAN_HISTORICAL_DATA.totalLeads} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Tỷ lệ chuyển đổi: 17.7%
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>CPL Thực Tế (1 SĐT)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                  {formatMoney(BHUTAN_HISTORICAL_DATA.cplLeadAvg)} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  ~233.121 đ / lead chuẩn thực tế
                </div>
              </div>
            </div>

            {/* Bảng Chi Tiết Tháng 6 & Tháng 7 */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Thời Điểm</th>
                    <th style={{ padding: '8px 10px' }}>Chi Tiêu</th>
                    <th style={{ padding: '8px 10px' }}>Inbox</th>
                    <th style={{ padding: '8px 10px' }}>Lead (Có SĐT)</th>
                    <th style={{ padding: '8px 10px' }}>Giá 1 Inbox</th>
                    <th style={{ padding: '8px 10px' }}>Giá 1 Lead (CPL)</th>
                    <th style={{ padding: '8px 10px' }}>Ghi Chú Vận Hành</th>
                  </tr>
                </thead>
                <tbody>
                  {BHUTAN_HISTORICAL_DATA.months.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{m.month}</td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{formatMoney(m.spend)} đ</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{m.messages}</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{m.leads}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{formatMoney(m.cplMsg)} đ</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#38bdf8' }}>{formatMoney(m.cplLead)} đ</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 2. MÁY TÍNH DỰ TOÁN NGÂN SÁCH THEO ĐOÀN (TÍNH XUÔI) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '22px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#94a3b8', border: '1px solid #1e293b' }}>
                  <Calculator size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    2. Máy Tính Dự Toán Ngân Sách Ads Theo Đoàn (Tính Xuôi)
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                    Mục tiêu: Đạt đủ số đoàn (vd: 3 đoàn × 12 pax) → Cần bao nhiêu Lead và Chi phí Ads
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => applyPreset('practical_fit')}
                  style={{
                    background: '#0d131f',
                    border: '1px solid #263346',
                    color: '#cbd5e1',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Thực tế: 3 đoàn × 12 pax
                </button>
                <button
                  onClick={() => applyPreset('erp_standard')}
                  style={{
                    background: '#0d131f',
                    border: '1px solid #263346',
                    color: '#94a3b8',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Chuẩn ERP: 3 đoàn × 16 pax
                </button>
              </div>
            </div>

            {/* Khung Nhập Tham Số (3 ô 1 hàng) */}
            <div className="bu4-grid-3" style={{
              padding: '16px',
              background: '#0d131f',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Số đoàn cần chạy full:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4].map(n => (
                    <button
                      key={n}
                      onClick={() => setNumGroups(n)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '5px',
                        border: '1px solid ' + (numGroups === n ? '#38bdf8' : '#263346'),
                        background: numGroups === n ? '#1e293b' : 'transparent',
                        color: numGroups === n ? '#38bdf8' : '#94a3b8',
                        fontWeight: numGroups === n ? 600 : 400,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {n} Đoàn
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Quy mô khách / đoàn:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Tự nhập số tùy ý)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '95px'
                  }}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={paxPerGroup}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setPaxPerGroup(isNaN(val) ? '' : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[10, 12, 16, 20].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPaxPerGroup(p)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: '5px',
                          border: '1px solid ' + (paxPerGroup === p ? '#38bdf8' : '#263346'),
                          background: paxPerGroup === p ? '#1e293b' : 'transparent',
                          color: paxPerGroup === p ? '#38bdf8' : '#94a3b8',
                          fontWeight: paxPerGroup === p ? 600 : 400,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {p} khách
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Nhập tay (vd: 14, 15, 18...) hoặc bấm chọn nhanh
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Tỷ lệ chốt Sale (CR):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="30"
                      value={crSale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setCrSale(Math.min(30, Math.max(0.1, val)));
                      }}
                      style={{
                        width: '56px',
                        background: '#0d131f',
                        border: '1px solid #263346',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '2px 4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <strong style={{ color: '#38bdf8' }}>%</strong>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={crSale}
                  onChange={(e) => setCrSale(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>1% (Thấp)</span>
                  <span>7% (Chuẩn ERP)</span>
                  <span>15%</span>
                  <span>30% (Max)</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá 1 Lead có SĐT (CPL):
                </label>
                <CurrencyInput
                  value={cplTarget}
                  onChange={(val) => setCplTarget(val)}
                  unit="đ/lead"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Mặc định: <strong>233.121 đ</strong> (lịch sử BU4)
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Hệ số khách đi cùng:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Khách / deal)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '90px'
                  }}>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      value={paxPerLead}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setPaxPerLead(isNaN(val) ? 1 : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[
                      { label: 'Solo (1.0)', val: 1.0 },
                      { label: 'Đôi (1.35)', val: 1.35 },
                      { label: 'Nhóm (1.5)', val: 1.5 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setPaxPerLead(item.val)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '4px',
                          border: '1px solid ' + (paxPerLead === item.val ? '#38bdf8' : '#263346'),
                          background: paxPerLead === item.val ? '#1e293b' : 'transparent',
                          color: paxPerLead === item.val ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: paxPerLead === item.val ? 600 : 400
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Có thể tự nhập số (vd: 1.25, 1.4) hoặc chọn nút
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá tour trọn gói / khách:
                </label>
                <CurrencyInput
                  value={tourPrice}
                  onChange={(val) => setTourPrice(val)}
                  unit="đ"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Chuẩn: <strong>59.990.000 đ</strong>
                </div>
              </div>
            </div>

            {/* ── KẾT QUẢ DỰ TOÁN ── */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '10px' }}>
                KẾT QUẢ DỰ TOÁN CHO {numGroups} ĐOÀN ({calc.totalPax} KHÁCH):
              </div>

              <div className="bu4-grid-3">
                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <PhoneCall size={14} color="#64748b" />
                    <span>SỐ LEAD CẦN CÓ (SĐT)</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(calc.requiredLeads)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Để chốt <strong>{calc.requiredDeals} deal</strong> ({calc.totalPax} khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={14} color="#64748b" />
                    <span>SỐ INBOX (TIN NHẮN) CẦN</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(calc.requiredInboxes)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Dựa trên tỷ lệ lọc SĐT 17.5%
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#38bdf8" />
                      <span>KHÁCH CHỐT DỰ KIẾN (PAX)</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Nhập tay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#131d2e',
                      border: '1px solid #38bdf8',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      width: '100px'
                    }}>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={calc.totalPax}
                        onChange={(e) => handleBhutanSection2PaxChange(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '1.45rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 400 }}>pax</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      Mục tiêu <strong>{numGroups} đoàn</strong> ({paxPerGroup} khách/đoàn)
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                    ⇄ Nhập số khách sẽ kéo thanh CR <strong>{crSale}%</strong> (hoặc kéo CR đổi khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <DollarSign size={14} color="#38bdf8" />
                    <span>TỔNG DỰ TOÁN KINH PHÍ ADS</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                    {formatMoney(calc.totalAdsBudget)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94a3b8' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Khoảng <strong>~{(calc.totalAdsBudget / 1000000).toFixed(1)} triệu VNĐ</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    CHI PHÍ ADS / KHÁCH CHỐT
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(calc.cpaPerPax)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Chiếm <strong>{calc.adsToRevenueRatio}%</strong> doanh thu
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <TrendingUp size={14} color="#10b981" />
                    <span>DOANH THU TẠO RA DỰ KIẾN</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(calc.totalRevenue)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Lợi nhuận gộp: <strong style={{ color: '#10b981' }}>~{formatMoney(calc.totalGrossProfit)} đ</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Đánh Giá An Toàn & Doanh Thu */}
            <div style={{
              background: '#0d131f',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                  Tình trạng tài chính: {calc.safetyLevel} ({calc.adsToProfitRatio}% Lợi Nhuận Gộp)
                </span>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {calc.safetyDesc}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Doanh thu {calc.totalPax} khách: </span>
                <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>{formatMoney(calc.totalRevenue)} đ</strong>
              </div>
            </div>

            {/* Phân bổ theo 3 tháng */}
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '10px' }}>
                Phân bổ ngân sách {formatMoney(calc.totalAdsBudget)} đ theo từng tháng:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Tháng 10 (Khởi động)</span>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>31 ngày</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    {formatMoney(calc.octBudget)} đ
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Mục tiêu: <strong>~{calc.octLeads} leads</strong> (50.000 đ/ngày)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Tháng 11 (Tăng tốc chốt)</span>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>Cao điểm</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    {formatMoney(calc.novBudget)} đ
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Mục tiêu: <strong>~{calc.novLeads} leads</strong> (~{formatMoney(Math.round(calc.novBudget / 30))} đ/ngày)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, marginBottom: '4px' }}>
                    <span>Tháng 12 (Về đích Đoàn 3)</span>
                    <span style={{ color: '#64748b', fontWeight: 400 }}>Tăng cường</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '2px' }}>
                    {formatMoney(calc.decBudget)} đ
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Mục tiêu: <strong>~{calc.decLeads} leads</strong> (~{formatMoney(Math.round(calc.decBudget / 31))} đ/ngày)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3. DỰ TRÙ CHO MARKETING (TÍNH NGƯỢC: CẤP NGÂN SÁCH → RA LEAD & KHÁCH) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '22px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#38bdf8', border: '1px solid #1e293b' }}>
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    3. Dự Trù Cho Marketing (Tính Ngược: Cấp Ngân Sách → Ra Số Lead SĐT & Khách Chốt)
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                    Góc nhìn Marketer: Giả định được cấp ngân sách (ví dụ: 20 triệu) → Tính ra số Lead có SĐT mang về và số Khách chốt được
                  </p>
                </div>
              </div>

              {/* Nút bấm ngân sách nhanh */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '5 Triệu (Test)', val: 5000000 },
                  { label: '10 Triệu (1 Tháng)', val: 10000000 },
                  { label: '20 Triệu (Ví dụ)', val: 20000000 },
                  { label: '30 Triệu (Quý 4)', val: 30000000 }
                ].map(b => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setBhutanBudgetCap(b.val)}
                    style={{
                      background: bhutanBudgetCap === b.val ? '#1e293b' : '#0d131f',
                      border: '1px solid ' + (bhutanBudgetCap === b.val ? '#38bdf8' : '#263346'),
                      color: bhutanBudgetCap === b.val ? '#38bdf8' : '#cbd5e1',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: bhutanBudgetCap === b.val ? 600 : 400
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Khung Nhập Tham Số Tính Ngược */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '14px',
              padding: '16px',
              background: '#0d131f',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                  Ngân sách được cấp cho MKT:
                </label>
                <CurrencyInput
                  value={bhutanBudgetCap}
                  onChange={(val) => setBhutanBudgetCap(val)}
                  unit="đ"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Tự do nhập số tiền bất kỳ (vd: 20.000.000 đ)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá 1 Lead có SĐT (CPL):
                </label>
                <CurrencyInput
                  value={cplTarget}
                  onChange={(val) => setCplTarget(val)}
                  unit="đ/lead"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Lịch sử chuẩn BU4: <strong>233.121 đ</strong> (T7: <strong>240.155 đ</strong>)
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Tỷ lệ chốt của Sale (CR):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="30"
                      value={bhutanBudgetCr}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setBhutanBudgetCr(Math.min(30, Math.max(0.1, val)));
                      }}
                      style={{
                        width: '56px',
                        background: '#0d131f',
                        border: '1px solid #263346',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '2px 4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <strong style={{ color: '#38bdf8' }}>%</strong>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={bhutanBudgetCr}
                  onChange={(e) => setBhutanBudgetCr(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>1% (Thấp)</span>
                  <span>7% (Chuẩn ERP)</span>
                  <span>15%</span>
                  <span>30% (Max)</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Hệ số khách đi cùng:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Khách / deal)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '90px'
                  }}>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      value={bhutanBudgetPaxPerLead}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setBhutanBudgetPaxPerLead(isNaN(val) ? 1 : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[
                      { label: 'Solo (1.0)', val: 1.0 },
                      { label: 'Đôi (1.35)', val: 1.35 },
                      { label: 'Nhóm (1.5)', val: 1.5 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setBhutanBudgetPaxPerLead(item.val)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '4px',
                          border: '1px solid ' + (bhutanBudgetPaxPerLead === item.val ? '#38bdf8' : '#263346'),
                          background: bhutanBudgetPaxPerLead === item.val ? '#1e293b' : 'transparent',
                          color: bhutanBudgetPaxPerLead === item.val ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: bhutanBudgetPaxPerLead === item.val ? 600 : 400
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Khách du lịch thường đi cặp đôi hoặc gia đình
                </div>
              </div>
            </div>

            {/* Kết Quả Đầu Ra Dự Kiến Từ Ngân Sách */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '10px' }}>
                ĐẦU RA DỰ KIẾN KHI CẤP {formatMoney(bhutanBudgetCap)} Đ CHO MARKETING:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <PhoneCall size={14} color="#38bdf8" />
                    <span>SỐ LEAD CÓ SĐT THU VỀ</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                    {bhutanReverseCalc.leads} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    CPL tính toán: <strong>{formatMoney(bhutanReverseCalc.cpl)} đ/lead</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={14} color="#64748b" />
                    <span>SỐ TIN NHẮN (INBOX) CẦN ĐÓN</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(bhutanReverseCalc.inboxes)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Tỷ lệ lọc SĐT thực tế: <strong>{inboxToLeadRate}%</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#38bdf8" />
                      <span>KHÁCH CHỐT DỰ KIẾN (PAX)</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Nhập tay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#131d2e',
                      border: '1px solid #38bdf8',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      width: '100px'
                    }}>
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={bhutanReverseCalc.pax}
                        onChange={(e) => handleBhutanSection3PaxChange(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400 }}>pax</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      tương ứng <strong style={{ color: '#38bdf8' }}>~{bhutanReverseCalc.deals} deal</strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                    ⇄ Nhập số khách sẽ kéo thanh CR <strong>{bhutanBudgetCr}%</strong> (hoặc kéo CR đổi khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    DOANH THU TẠO RA DỰ KIẾN
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(bhutanReverseCalc.revenue)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Chi phí Ads: <strong>{bhutanReverseCalc.adsRatio}%</strong> Doanh thu (ROI {bhutanReverseCalc.roi}x)
                  </div>
                </div>
              </div>
            </div>

            {/* Hộp Báo Cáo Cam Kết Marketing Cho Sếp / BOD */}
            <div style={{
              background: '#0d131f',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '14px 18px',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              lineHeight: '1.6'
            }}>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#38bdf8" />
                <span>Báo Cáo Đề Xuất Marketing:</span>
              </div>
              Khi được duyệt cấp ngân sách <strong>{formatMoney(bhutanBudgetCap)} đ</strong>, đội ngũ Marketing cam kết thu về <strong>{bhutanReverseCalc.leads} Lead có SĐT</strong> (qua việc chăm sóc ~{formatMoney(bhutanReverseCalc.inboxes)} tin nhắn). Với tỷ lệ chốt <strong>{bhutanBudgetCr}%</strong> của Sale và hệ số đi cùng <strong>{bhutanBudgetPaxPerLead}</strong>, dự kiến chuyển đổi thành <strong>~{bhutanReverseCalc.pax} khách tham gia tour</strong>, lấp đầy <strong>{bhutanReverseCalc.percentOfGroup}%</strong> của 1 đoàn {paxPerGroup} khách và mang về <strong>{formatMoney(bhutanReverseCalc.revenue)} đ Doanh Thu</strong> (Chi phí Marketing chỉ chiếm <strong>{bhutanReverseCalc.adsRatio}%</strong> doanh thu, tối ưu biên lợi nhuận ròng).
            </div>
          </div>

          {/* Footer Link */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: '#131d2e',
            borderRadius: '6px',
            border: '1px solid #1e293b',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
              Bước 1 (Bhutan) đã hoàn tất. Chuyển sang Ladakh để kiểm tra kế hoạch 7 ngày.
            </span>
            <button
              onClick={() => setActiveTab('ladakh')}
              style={{
                background: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                padding: '6px 14px',
                borderRadius: '5px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Sang Bước 2: Ladakh →
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: LADAKH (BƯỚC 2 - ĐẦY ĐỦ DỮ LIỆU & MÁY TÍNH DỰ TOÁN)
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ladakh' && (
        <div>
          {/* ── 1. BẢNG DỮ LIỆU LỊCH SỬ THỰC TẾ META ADS LADAKH (T4 - T9/2026) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                  1. Dữ liệu lịch sử chạy Ads Ladakh toàn mùa (Tháng 4 đến Tháng 9/2026)
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Số liệu thực tế trích xuất từ database Meta Ads của BU4 cho toàn bộ các chiến dịch Roadtrip & Motor Trip
                </p>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Tỷ lệ lọc SĐT từ Inbox: <strong style={{ color: '#38bdf8' }}>41.8%</strong> (Cứ ~2.4 inbox là có 1 SĐT)
              </div>
            </div>

            {/* 4 Chỉ số tóm tắt Ladakh */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Tổng chi phí đã chi</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {formatMoney(LADAKH_HISTORICAL_DATA.totalSpend)} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  6 tháng vận hành (Tháng 4 đến Tháng 9/2026)
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Tin nhắn (Inbox)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {LADAKH_HISTORICAL_DATA.totalMessages} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {formatMoney(LADAKH_HISTORICAL_DATA.cplMsgAvg)} đ / inbox
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Lead thu về (Có SĐT)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {LADAKH_HISTORICAL_DATA.totalLeads} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Tỷ lệ chuyển đổi: 41.8%
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>CPL Thực Tế (1 SĐT)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                  {formatMoney(LADAKH_HISTORICAL_DATA.cplLeadAvg)} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Tháng 9 gần nhất: <strong>{formatMoney(LADAKH_HISTORICAL_DATA.cplSept)} đ</strong>
                </div>
              </div>
            </div>

            {/* Bảng Chi Tiết 6 Tháng Của Ladakh */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Thời Điểm</th>
                    <th style={{ padding: '8px 10px' }}>Chi Tiêu</th>
                    <th style={{ padding: '8px 10px' }}>Inbox</th>
                    <th style={{ padding: '8px 10px' }}>Lead (Có SĐT)</th>
                    <th style={{ padding: '8px 10px' }}>Giá 1 Inbox</th>
                    <th style={{ padding: '8px 10px' }}>Giá 1 Lead (CPL)</th>
                    <th style={{ padding: '8px 10px' }}>Ghi Chú Vận Hành</th>
                  </tr>
                </thead>
                <tbody>
                  {LADAKH_HISTORICAL_DATA.months.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{m.month}</td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{formatMoney(m.spend)} đ</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{m.messages}</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{m.leads}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{formatMoney(m.cplMsg)} đ</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#38bdf8' }}>{formatMoney(m.cplLead)} đ</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 2. KẾ HOẠCH CHẠY TĂNG CƯỜNG 7 NGÀY THÁNG 10 (01/10 - 07/10) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Calendar size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                2. Kế hoạch chạy tăng cường 7 ngày tháng 10 (01/10 → 07/10/2026)
              </h3>
            </div>

            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Kế hoạch chạy tăng cường 7 ngày tháng 10 (từ 01/10 đến 07/10): Ngân sách <strong>420.000 đ/ngày</strong> (tổng 2.940.000 đ) hoặc mức tối thiểu <strong>210.000 đ/ngày</strong> (tổng 1.470.000 đ) để tăng cường các suất cuối cho đợt khởi hành tháng 10 trước khi đóng tour mùa đông.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>NGÂN SÁCH / NGÀY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                  420.000 đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Thời gian: 7 ngày (01 - 07/10)
                </div>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginBottom: '4px' }}>TỔNG KINH PHÍ 7 NGÀY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>
                  {formatMoney(ladakhCalc.plan7DaysBudget)} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Đúng mức đề xuất ~2.94 triệu VNĐ
                </div>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>LEAD DỰ KIẾN THU VỀ</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                  ~{ladakhCalc.plan7DaysLeads} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads (SĐT)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Tương đương ~{ladakhCalc.plan7DaysInboxes} tin nhắn inbox
                </div>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>KHÁCH CHỐT MỤC TIÊU</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                  1 - 2 <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>khách</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Trám chỗ cuối cho đoàn 10/10
                </div>
              </div>
            </div>

            <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px 16px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <strong>Hiệu quả tài chính:</strong> Với 1.470.000 đ ngân sách Ads, nếu chốt được 1 khách đi tour Roadtrip (36.990.000 đ) hoặc Motor (42.900.000 đ), chi phí Ads chỉ chiếm <strong>~3.4% - 3.9% doanh thu</strong>, hoàn toàn nằm trong chuẩn an toàn của ERP.
            </div>
          </div>

          {/* ── 3. DỰ TRÙ CHO MARKETING LADAKH (TÍNH NGƯỢC TỪ NGÂN SÁCH ĐƯỢC CẤP) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '22px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#38bdf8', border: '1px solid #1e293b' }}>
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    3. Dự Trù Cho Marketing (Tính Ngược: Cấp Ngân Sách → Ra Số Lead SĐT & Khách Chốt)
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                    Góc nhìn Marketer: Nếu được cấp ngân sách X triệu → Suy ra sẽ mang về được bao nhiêu Lead có SĐT và Khách chốt
                  </p>
                </div>
              </div>

              {/* Nút bấm ngân sách mẫu */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '2.94 Triệu (420k/ngày)', val: 2940000 },
                  { label: '1.47 Triệu (210k/ngày)', val: 1470000 },
                  { label: '5 Triệu', val: 5000000 },
                  { label: '10 Triệu', val: 10000000 },
                  { label: '20 Triệu (Ví dụ)', val: 20000000 }
                ].map(b => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setLadakhBudgetCap(b.val)}
                    style={{
                      background: ladakhBudgetCap === b.val ? '#1e293b' : '#0d131f',
                      border: '1px solid ' + (ladakhBudgetCap === b.val ? '#38bdf8' : '#263346'),
                      color: ladakhBudgetCap === b.val ? '#38bdf8' : '#cbd5e1',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: ladakhBudgetCap === b.val ? 600 : 400
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form nhập liệu */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '14px',
              padding: '16px',
              background: '#0d131f',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                  Ngân sách được cấp cho MKT:
                </label>
                <CurrencyInput
                  value={ladakhBudgetCap}
                  onChange={(val) => setLadakhBudgetCap(val)}
                  unit="đ"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Tự do nhập số tiền bất kỳ (vd: 20.000.000 đ)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá 1 Lead có SĐT (CPL):
                </label>
                <CurrencyInput
                  value={ladakhCplTarget}
                  onChange={(val) => setLadakhCplTarget(val)}
                  unit="đ/lead"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Lịch sử toàn mùa: <strong>181.018 đ</strong> (Tháng 9 gần nhất: <strong>183.845 đ</strong>, T8: <strong>244.623 đ</strong>)
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Tỷ lệ chốt của Sale (CR):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="30"
                      value={ladakhBudgetCr}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setLadakhBudgetCr(Math.min(30, Math.max(0.1, val)));
                      }}
                      style={{
                        width: '56px',
                        background: '#0d131f',
                        border: '1px solid #263346',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '2px 4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <strong style={{ color: '#38bdf8' }}>%</strong>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={ladakhBudgetCr}
                  onChange={(e) => setLadakhBudgetCr(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>1% (Thấp)</span>
                  <span>7% (Chuẩn ERP)</span>
                  <span>15%</span>
                  <span>30% (Max)</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Hệ số khách đi cùng:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Khách / deal)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '90px'
                  }}>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      value={ladakhBudgetPaxPerLead}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLadakhBudgetPaxPerLead(isNaN(val) ? 1 : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[
                      { label: 'Solo (1.0)', val: 1.0 },
                      { label: 'Đôi (1.25)', val: 1.25 },
                      { label: 'Nhóm (1.5)', val: 1.5 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setLadakhBudgetPaxPerLead(item.val)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '4px',
                          border: '1px solid ' + (ladakhBudgetPaxPerLead === item.val ? '#38bdf8' : '#263346'),
                          background: ladakhBudgetPaxPerLead === item.val ? '#1e293b' : 'transparent',
                          color: ladakhBudgetPaxPerLead === item.val ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: ladakhBudgetPaxPerLead === item.val ? 600 : 400
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Đầu ra dự kiến từ ngân sách Ladakh */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '10px' }}>
                ĐẦU RA DỰ KIẾN KHI CẤP {formatMoney(ladakhBudgetCap)} Đ CHO MARKETING:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <PhoneCall size={14} color="#38bdf8" />
                    <span>SỐ LEAD CÓ SĐT THU VỀ</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                    {ladakhReverseCalc.leads} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    CPL tính toán: <strong>{formatMoney(ladakhReverseCalc.cpl)} đ/lead</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={14} color="#64748b" />
                    <span>SỐ TIN NHẮN (INBOX) CẦN ĐÓN</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(ladakhReverseCalc.inboxes)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Tỷ lệ lọc SĐT thực tế: <strong>{ladakhInboxToLeadRate}%</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#38bdf8" />
                      <span>KHÁCH CHỐT DỰ KIẾN (PAX)</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Nhập tay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#131d2e',
                      border: '1px solid #38bdf8',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      width: '100px'
                    }}>
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={ladakhReverseCalc.pax}
                        onChange={(e) => handleLadakhSection3PaxChange(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400 }}>pax</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      tương ứng <strong style={{ color: '#38bdf8' }}>~{ladakhReverseCalc.deals} deal</strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                    ⇄ Nhập số khách sẽ kéo thanh CR <strong>{ladakhBudgetCr}%</strong> (hoặc kéo CR đổi khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    DOANH THU TẠO RA DỰ KIẾN
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(ladakhReverseCalc.revenue)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Chi phí Ads: <strong>{ladakhReverseCalc.adsRatio}%</strong> Doanh thu (ROI {ladakhReverseCalc.roi}x)
                  </div>
                </div>
              </div>
            </div>

            {/* Báo cáo cam kết Marketing Ladakh */}
            <div style={{
              background: '#0d131f',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '14px 18px',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              lineHeight: '1.6'
            }}>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#38bdf8" />
                <span>Báo Cáo Đề Xuất Marketing:</span>
              </div>
              Khi được duyệt cấp ngân sách <strong>{formatMoney(ladakhBudgetCap)} đ</strong>, đội ngũ Marketing cam kết thu về <strong>{ladakhReverseCalc.leads} Lead có SĐT</strong> (qua việc chăm sóc ~{formatMoney(ladakhReverseCalc.inboxes)} tin nhắn). Với tỷ lệ chốt <strong>{ladakhBudgetCr}%</strong> của Sale và hệ số đi cùng <strong>{ladakhBudgetPaxPerLead}</strong>, dự kiến chuyển đổi thành <strong>~{ladakhReverseCalc.pax} khách tham gia tour</strong>, mang lại <strong>{formatMoney(ladakhReverseCalc.revenue)} đ Doanh Thu</strong> (Chi phí Marketing chỉ chiếm <strong>{ladakhReverseCalc.adsRatio}%</strong> doanh thu).
            </div>
          </div>

          {/* ── 4. MÁY TÍNH DỰ TOÁN NGÂN SÁCH THEO ĐOÀN CHO LADAKH (TÍNH XUÔI) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '22px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#94a3b8', border: '1px solid #1e293b' }}>
                  <Calculator size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    4. Máy Tính Dự Toán Ngân Sách Ads Theo Đoàn (Tính Xuôi)
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                    Có thể tùy chỉnh số đoàn hoặc chọn các kịch bản sẵn để dự phóng chi phí
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => applyLadakhPreset('oct_final_7days')}
                  style={{
                    background: '#0d131f',
                    border: '1px solid #263346',
                    color: '#cbd5e1',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Tăng cường 7 ngày: 2 khách
                </button>
                <button
                  onClick={() => applyLadakhPreset('roadtrip_full')}
                  style={{
                    background: '#0d131f',
                    border: '1px solid #263346',
                    color: '#94a3b8',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Full 1 Đoàn Roadtrip (12 khách)
                </button>
                <button
                  onClick={() => applyLadakhPreset('motor_trip_full')}
                  style={{
                    background: '#0d131f',
                    border: '1px solid #263346',
                    color: '#94a3b8',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Full 1 Đoàn Motor (10 khách)
                </button>
              </div>
            </div>

            {/* Khung Nhập Tham Số (3 ô 1 hàng) */}
            <div className="bu4-grid-3" style={{
              padding: '16px',
              background: '#0d131f',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Số đoàn cần chạy:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => setLadakhNumGroups(n)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '5px',
                        border: '1px solid ' + (ladakhNumGroups === n ? '#38bdf8' : '#263346'),
                        background: ladakhNumGroups === n ? '#1e293b' : 'transparent',
                        color: ladakhNumGroups === n ? '#38bdf8' : '#94a3b8',
                        fontWeight: ladakhNumGroups === n ? 600 : 400,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {n} Đoàn
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Quy mô khách / đoàn:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Tự nhập số tùy ý)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '95px'
                  }}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={ladakhPaxPerGroup}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setLadakhPaxPerGroup(isNaN(val) ? '' : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[2, 10, 12, 16].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setLadakhPaxPerGroup(p)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: '5px',
                          border: '1px solid ' + (ladakhPaxPerGroup === p ? '#38bdf8' : '#263346'),
                          background: ladakhPaxPerGroup === p ? '#1e293b' : 'transparent',
                          color: ladakhPaxPerGroup === p ? '#38bdf8' : '#94a3b8',
                          fontWeight: ladakhPaxPerGroup === p ? 600 : 400,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {p === 2 ? '2 (tăng cường)' : `${p} pax`}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Nhập tay (vd: 14, 15, 18...) hoặc bấm chọn nhanh
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Tỷ lệ chốt Sale (CR):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="30"
                      value={ladakhCrSale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setLadakhCrSale(Math.min(30, Math.max(0.1, val)));
                      }}
                      style={{
                        width: '56px',
                        background: '#0d131f',
                        border: '1px solid #263346',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '2px 4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <strong style={{ color: '#38bdf8' }}>%</strong>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={ladakhCrSale}
                  onChange={(e) => setLadakhCrSale(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>1% (Thấp)</span>
                  <span>7% (Chuẩn ERP)</span>
                  <span>15%</span>
                  <span>30% (Max)</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá 1 Lead có SĐT (CPL):
                </label>
                <CurrencyInput
                  value={ladakhCplTarget}
                  onChange={(val) => setLadakhCplTarget(val)}
                  unit="đ/lead"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Mặc định: <strong>183.845 đ</strong> (lịch sử T9)
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Hệ số khách đi cùng:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Khách / deal)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '90px'
                  }}>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      value={ladakhPaxPerLead}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setLadakhPaxPerLead(isNaN(val) ? 1 : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[
                      { label: 'Solo (1.0)', val: 1.0 },
                      { label: 'Đôi (1.25)', val: 1.25 },
                      { label: 'Nhóm (1.5)', val: 1.5 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setLadakhPaxPerLead(item.val)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '4px',
                          border: '1px solid ' + (ladakhPaxPerLead === item.val ? '#38bdf8' : '#263346'),
                          background: ladakhPaxPerLead === item.val ? '#1e293b' : 'transparent',
                          color: ladakhPaxPerLead === item.val ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: ladakhPaxPerLead === item.val ? 600 : 400
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá tour trọn gói / khách:
                </label>
                <CurrencyInput
                  value={ladakhTourPrice}
                  onChange={(val) => setLadakhTourPrice(val)}
                  unit="đ"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Roadtrip: <strong>36.990.000 đ</strong> | Motor: <strong>42.900.000 đ</strong>
                </div>
              </div>
            </div>

            {/* Kết quả dự toán Ladakh */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '10px' }}>
                KẾT QUẢ DỰ TOÁN CHO {ladakhNumGroups} ĐOÀN ({ladakhCalc.totalPax} KHÁCH):
              </div>

              <div className="bu4-grid-3">
                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <PhoneCall size={14} color="#64748b" />
                    <span>SỐ LEAD CẦN CÓ (SĐT)</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(ladakhCalc.requiredLeads)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Để chốt <strong>{ladakhCalc.requiredDeals} deal</strong> ({ladakhCalc.totalPax} khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={14} color="#64748b" />
                    <span>SỐ INBOX (TIN NHẮN) CẦN</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(ladakhCalc.requiredInboxes)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Dựa trên tỷ lệ lọc SĐT 41.8%
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#38bdf8" />
                      <span>KHÁCH CHỐT DỰ KIẾN (PAX)</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Nhập tay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#131d2e',
                      border: '1px solid #38bdf8',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      width: '100px'
                    }}>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={ladakhCalc.totalPax}
                        onChange={(e) => handleLadakhSection4PaxChange(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '1.45rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 400 }}>pax</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      Mục tiêu <strong>{ladakhNumGroups} đoàn</strong> ({ladakhPaxPerGroup} khách/đoàn)
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                    ⇄ Nhập số khách sẽ kéo thanh CR <strong>{ladakhCrSale}%</strong> (hoặc kéo CR đổi khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <DollarSign size={14} color="#38bdf8" />
                    <span>TỔNG DỰ TOÁN KINH PHÍ ADS</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                    {formatMoney(ladakhCalc.totalAdsBudget)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94a3b8' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Khoảng <strong>~{(ladakhCalc.totalAdsBudget / 1000000).toFixed(1)} triệu VNĐ</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    CHI PHÍ ADS / KHÁCH CHỐT
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(ladakhCalc.cpaPerPax)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Chiếm <strong>{ladakhCalc.adsToRevenueRatio}%</strong> doanh thu
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <TrendingUp size={14} color="#10b981" />
                    <span>DOANH THU TẠO RA DỰ KIẾN</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(ladakhCalc.totalRevenue)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Lợi nhuận gộp: <strong style={{ color: '#10b981' }}>~{formatMoney(ladakhCalc.totalGrossProfit)} đ</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Đánh giá an toàn tài chính Ladakh */}
            <div style={{
              background: '#0d131f',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                  Tình trạng tài chính: {ladakhCalc.safetyLevel} ({ladakhCalc.adsToProfitRatio}% Lợi Nhuận Gộp)
                </span>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {ladakhCalc.safetyDesc}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Doanh thu {ladakhCalc.totalPax} khách: </span>
                <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>{formatMoney(ladakhCalc.totalRevenue)} đ</strong>
              </div>
            </div>
          </div>

          {/* ── 5. CHIẾN LƯỢC ĐÓNG SỔ MÙA LADAKH & CHUYỂN PHỄU SANG BHUTAN ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Compass size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                5. Chiến lược đóng sổ mùa Ladakh 2026 & Quy trình chuyển phễu (Cross-Selling)
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#38bdf8' }}>1.</span> Hạn chót nộp Visa Ấn Độ (05/10)
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Hệ thống e-Visa du lịch Ấn Độ yêu cầu tối thiểu 48 đến 72 giờ làm việc để xét duyệt. Để đoàn khởi hành 10/10 bay kịp, đội ngũ Sale bắt buộc phải khóa sổ và thu đủ hồ sơ khách trước <strong>17h00 ngày 05/10</strong>.
                </p>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#38bdf8' }}>2.</span> Tắt hoàn toàn Ads Ladakh (07/10)
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Sau ngày 07/10, tắt 100% chiến dịch quảng cáo Ladakh. Thời tiết vùng núi Himalaya từ nửa cuối tháng 10 bắt đầu trở lạnh dưới 0°C, các đèo Khardung La (5.359m) và Chang La bắt đầu đóng băng tuyết, khép lại trọn vẹn mùa tour 2026.
                </p>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#38bdf8' }}>3.</span> Kịch bản Sale chuyển phễu sang Bhutan
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Mọi lead Ladakh phát sinh muộn hoặc khách không kịp chuẩn bị visa sẽ được Sale điều hướng: <em>"Mùa Ladakh sắp đóng đèo đón đông, mời anh/chị trải nghiệm Bhutan 5N4Đ (khởi hành 11/11 & 12/12) ngắm trọn mùa thu vàng Himalaya và thủ tục visa cực nhanh gọn"</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Navigation */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: '#131d2e',
            borderRadius: '6px',
            border: '1px solid #1e293b',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              onClick={() => setActiveTab('bhutan')}
              style={{
                background: '#0d131f',
                color: '#cbd5e1',
                border: '1px solid #263346',
                padding: '6px 14px',
                borderRadius: '5px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              ← Quay lại Bước 1: Bhutan
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('srilanka')}
                style={{
                  background: '#1e293b',
                  color: '#38bdf8',
                  border: '1px solid #334155',
                  padding: '6px 14px',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Sang Bước 3: Sri Lanka →
              </button>
              <Link
                to="/marketing-budget-plan?bu=BU4&quarter=4&year=2026"
                style={{
                  background: '#0d131f',
                  color: '#94a3b8',
                  border: '1px solid #263346',
                  padding: '6px 14px',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  textDecoration: 'none'
                }}
              >
                Mở Kế Hoạch ERP
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3: SRI LANKA (BƯỚC TIẾP THEO)
         ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'srilanka' && (
        <div>
          {/* ── 1. BẢNG DỮ LIỆU LỊCH SỬ THỰC TẾ SRI LANKA ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                  1. Dữ liệu lịch sử chạy Ads Sri Lanka (Tháng 8 & Tháng 9/2026)
                </h3>
                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                  Số liệu thực tế trích xuất từ database Meta Ads của BU4 cho chiến dịch thử nghiệm tuyến mới
                </p>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Tỷ lệ lọc SĐT từ Inbox: <strong style={{ color: '#38bdf8' }}>12.5%</strong> (Cứ 8 inbox là có 1 SĐT)
              </div>
            </div>

            {/* 4 Chỉ số tóm tắt */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '18px' }}>
              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Tổng chi phí đã chi</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {formatMoney(SRILANKA_HISTORICAL_DATA.totalSpend)} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  2 tháng vận hành
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Tin nhắn (Inbox)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {SRILANKA_HISTORICAL_DATA.totalMessages} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  {formatMoney(SRILANKA_HISTORICAL_DATA.cplMsgAvg)} đ / inbox
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>Lead thu về (Có SĐT)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                  {SRILANKA_HISTORICAL_DATA.totalLeads} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Tỷ lệ chuyển đổi: 12.5%
                </div>
              </div>

              <div style={{ background: '#0d131f', padding: '12px 14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '4px' }}>CPL Thực Tế (1 SĐT)</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#38bdf8' }}>
                  {formatMoney(SRILANKA_HISTORICAL_DATA.cplLeadAvg)} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Tháng 9 gần nhất: <strong>{formatMoney(SRILANKA_HISTORICAL_DATA.cplSept)} đ</strong>
                </div>
              </div>
            </div>

            {/* Bảng Chi Tiết 2 Tháng Của Sri Lanka */}
            <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px 10px' }}>Thời Điểm</th>
                    <th style={{ padding: '8px 10px' }}>Chi Tiêu</th>
                    <th style={{ padding: '8px 10px' }}>Inbox</th>
                    <th style={{ padding: '8px 10px' }}>Lead (Có SĐT)</th>
                    <th style={{ padding: '8px 10px' }}>Giá 1 Inbox</th>
                    <th style={{ padding: '8px 10px' }}>Giá 1 Lead (CPL)</th>
                    <th style={{ padding: '8px 10px' }}>Ghi Chú Vận Hành</th>
                  </tr>
                </thead>
                <tbody>
                  {SRILANKA_HISTORICAL_DATA.months.map((m, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{m.month}</td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{formatMoney(m.spend)} đ</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{m.messages}</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#f8fafc' }}>{m.leads}</td>
                      <td style={{ padding: '10px', color: '#94a3b8' }}>{formatMoney(m.cplMsg)} đ</td>
                      <td style={{ padding: '10px', fontWeight: 600, color: '#38bdf8' }}>{formatMoney(m.cplLead)} đ</td>
                      <td style={{ padding: '10px', color: '#64748b' }}>{m.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px 16px', fontSize: '0.8rem', color: '#94a3b8' }}>
              ℹ️ <strong>Dữ liệu thực tế thị trường Sri Lanka:</strong> Hai tháng T8 & T9/2026 ghi nhận tổng chi <strong>4.572.565 đ</strong>, thu về <strong>9 Lead SĐT</strong> từ <strong>72 Tin nhắn Inbox</strong>. CPL trung bình thực tế đạt <strong>508.063 đ/lead</strong> (Tháng 8: 481.845 đ, Tháng 9: 560.499 đ). Tỷ lệ chuyển đổi SĐT từ Inbox đạt <strong>12.5%</strong> (cứ 8 inbox có 1 SĐT). Kế hoạch Quý 4 với ngân sách <strong>6.000.000 đ</strong> (300.000 đ/ngày x 20 ngày đến 20/10) hoàn toàn khả thi mang về 11 - 12 Lead SĐT và chốt 3 Pax.
            </div>
          </div>

          {/* ── 2. KẾ HOẠCH CHẠY 20 NGÀY THÁNG 10 (01/10 → 20/10) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Calendar size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                2. Kế hoạch chạy 20 ngày tháng 10 (01/10 → 20/10/2026)
              </h3>
            </div>

            <p style={{ margin: '0 0 16px', color: '#94a3b8', fontSize: '0.85rem', lineHeight: '1.5' }}>
              Kế hoạch chạy 20 ngày tháng 10 (từ 01/10 đến 20/10): Ngân sách <strong>300.000 đ/ngày</strong> trong 20 ngày (Tổng <strong>6.000.000 đ</strong>) để nuôi tệp quan tâm, gom khách chốt vé máy bay đợt đầu trước mùa cao điểm.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>NGÂN SÁCH / NGÀY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                  300.000 đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Thời gian: 20 ngày (01 - 20/10)
                </div>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginBottom: '4px' }}>TỔNG KINH PHÍ 20 NGÀY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#38bdf8' }}>
                  {formatMoney(srilankaCalc.plan20DaysBudget)} đ
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Đúng mức đề xuất 6.0 triệu VNĐ
                </div>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>LEAD DỰ KIẾN THU VỀ</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                  ~{srilankaCalc.plan20DaysLeads} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads (SĐT)</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Tương đương ~{srilankaCalc.plan20DaysInboxes} tin nhắn inbox
                </div>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>KHÁCH CHỐT MỤC TIÊU</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#f8fafc' }}>
                  3 <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>pax</span> (~2 - 3 deal)
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                  Trám chỗ đoàn tháng 11 & 12
                </div>
              </div>
            </div>

            <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '12px 16px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <strong>Hiệu quả tài chính:</strong> Với 6.000.000 đ ngân sách Ads (300k/ngày trong 20 ngày), mang về khoảng 11 - 12 Lead SĐT. Chỉ cần Sale chốt 3 khách đi tour Sri Lanka (giá ~39.990.000 đ), doanh thu đạt ~120 triệu VNĐ, chi phí Marketing chỉ chiếm <strong>~5% doanh thu</strong>, cực kỳ an toàn và sinh lời cao.
            </div>
          </div>

          {/* ── 3. DỰ TRÙ CHO MARKETING SRI LANKA (TÍNH NGƯỢC) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '22px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#38bdf8', border: '1px solid #1e293b' }}>
                  <Sparkles size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    3. Dự Trù Cho Marketing Sri Lanka (Tính Ngược: Cấp Ngân Sách → Ra Số Lead SĐT & Khách Chốt)
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                    Góc nhìn Marketer: Giả định được cấp ngân sách (ví dụ: 3 triệu hoặc 20 triệu) → Tính ra số Lead có SĐT mang về và số Khách chốt được
                  </p>
                </div>
              </div>

              {/* Nút bấm ngân sách nhanh */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: '6 Triệu (300k/ngày)', val: 6000000 },
                  { label: '3 Triệu (150k/ngày)', val: 3000000 },
                  { label: '10 Triệu (1 Tháng)', val: 10000000 },
                  { label: '20 Triệu (Chuẩn)', val: 20000000 },
                  { label: '30 Triệu (Đẩy mạnh)', val: 30000000 }
                ].map(b => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={() => setSrilankaBudgetCap(b.val)}
                    style={{
                      background: srilankaBudgetCap === b.val ? '#1e293b' : '#0d131f',
                      border: '1px solid ' + (srilankaBudgetCap === b.val ? '#38bdf8' : '#263346'),
                      color: srilankaBudgetCap === b.val ? '#38bdf8' : '#cbd5e1',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: srilankaBudgetCap === b.val ? 600 : 400
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Khung Nhập Tham Số Tính Ngược */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '14px',
              padding: '16px',
              background: '#0d131f',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                  Ngân sách được cấp cho MKT:
                </label>
                <CurrencyInput
                  value={srilankaBudgetCap}
                  onChange={(val) => setSrilankaBudgetCap(val)}
                  unit="đ"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Nhập số tiền bất kỳ (vd: 6.000.000 đ hoặc 20.000.000 đ)
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá 1 Lead có SĐT (CPL):
                </label>
                <CurrencyInput
                  value={srilankaCplTarget}
                  onChange={(val) => setSrilankaCplTarget(val)}
                  unit="đ/lead"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Lịch sử chuẩn 2 tháng: <strong>508.063 đ</strong> (Tháng 8: <strong>481.845 đ</strong>, Tháng 9: <strong>560.499 đ</strong>)
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Tỷ lệ chốt của Sale (CR):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="30"
                      value={srilankaBudgetCr}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setSrilankaBudgetCr(Math.min(30, Math.max(0.1, val)));
                      }}
                      style={{
                        width: '56px',
                        background: '#0d131f',
                        border: '1px solid #263346',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '2px 4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <strong style={{ color: '#38bdf8' }}>%</strong>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={srilankaBudgetCr}
                  onChange={(e) => setSrilankaBudgetCr(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>1% (Thấp)</span>
                  <span>7% (Chuẩn ERP)</span>
                  <span>15%</span>
                  <span>30% (Max)</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Hệ số khách đi cùng:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Khách / deal)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '90px'
                  }}>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      value={srilankaBudgetPaxPerLead}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSrilankaBudgetPaxPerLead(isNaN(val) ? 1 : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[
                      { label: 'Solo (1.0)', val: 1.0 },
                      { label: 'Đôi (1.3)', val: 1.3 },
                      { label: 'Nhóm (1.5)', val: 1.5 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setSrilankaBudgetPaxPerLead(item.val)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '4px',
                          border: '1px solid ' + (srilankaBudgetPaxPerLead === item.val ? '#38bdf8' : '#263346'),
                          background: srilankaBudgetPaxPerLead === item.val ? '#1e293b' : 'transparent',
                          color: srilankaBudgetPaxPerLead === item.val ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: srilankaBudgetPaxPerLead === item.val ? 600 : 400
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Đầu ra dự kiến từ ngân sách Sri Lanka */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '10px' }}>
                ĐẦU RA DỰ KIẾN KHI CẤP {formatMoney(srilankaBudgetCap)} Đ CHO MARKETING:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <PhoneCall size={14} color="#38bdf8" />
                    <span>SỐ LEAD CÓ SĐT THU VỀ</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                    {srilankaReverseCalc.leads} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    CPL tính toán: <strong>{formatMoney(srilankaReverseCalc.cpl)} đ/lead</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={14} color="#64748b" />
                    <span>SỐ TIN NHẮN (INBOX) CẦN ĐÓN</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(srilankaReverseCalc.inboxes)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Tỷ lệ lọc SĐT thực tế: <strong>{srilankaInboxToLeadRate}%</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#38bdf8" />
                      <span>KHÁCH CHỐT DỰ KIẾN (PAX)</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Nhập tay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#131d2e',
                      border: '1px solid #38bdf8',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      width: '100px'
                    }}>
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={srilankaReverseCalc.pax}
                        onChange={(e) => handleSrilankaSection3PaxChange(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400 }}>pax</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      tương ứng <strong style={{ color: '#38bdf8' }}>~{srilankaReverseCalc.deals} deal</strong>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                    ⇄ Nhập số khách sẽ kéo thanh CR <strong>{srilankaBudgetCr}%</strong> (hoặc kéo CR đổi khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    DOANH THU TẠO RA DỰ KIẾN
                  </div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(srilankaReverseCalc.revenue)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Chi phí Ads: <strong>{srilankaReverseCalc.adsRatio}%</strong> Doanh thu (ROI {srilankaReverseCalc.roi}x)
                  </div>
                </div>
              </div>
            </div>

            {/* Hộp Báo Cáo Đề Xuất Marketing Cho Sri Lanka */}
            <div style={{
              background: '#0d131f',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '14px 18px',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              lineHeight: '1.6'
            }}>
              <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#38bdf8" />
                <span>Báo Cáo Đề Xuất Marketing Sri Lanka:</span>
              </div>
              Khi được duyệt cấp ngân sách <strong>{formatMoney(srilankaBudgetCap)} đ</strong>, đội ngũ Marketing cam kết thu về <strong>{srilankaReverseCalc.leads} Lead có SĐT</strong> (qua việc chăm sóc ~{formatMoney(srilankaReverseCalc.inboxes)} tin nhắn). Với tỷ lệ chốt <strong>{srilankaBudgetCr}%</strong> của Sale và hệ số đi cùng <strong>{srilankaBudgetPaxPerLead}</strong>, dự kiến chuyển đổi thành <strong>~{srilankaReverseCalc.pax} khách tham gia tour</strong>, mang lại <strong>{formatMoney(srilankaReverseCalc.revenue)} đ Doanh Thu</strong> (Chi phí Marketing chỉ chiếm <strong>{srilankaReverseCalc.adsRatio}%</strong> doanh thu).
            </div>
          </div>

          {/* ── 4. MÁY TÍNH DỰ TOÁN NGÂN SÁCH ADS THEO ĐOÀN SRI LANKA (TÍNH XUÔI) ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '22px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#94a3b8', border: '1px solid #1e293b' }}>
                  <Calculator size={18} />
                </span>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    4. Máy Tính Dự Toán Ngân Sách Ads Theo Đoàn Sri Lanka (Tính Xuôi)
                  </h3>
                  <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                    Mục tiêu số đoàn cần chốt full → Tìm ra số lead và ngân sách Ads cần rót
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => applySrilankaPreset('oct_plan_20days')}
                  style={{
                    background: '#0d131f',
                    border: '1px solid #263346',
                    color: '#cbd5e1',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Kế hoạch 20 ngày: 2 khách
                </button>
                <button
                  onClick={() => applySrilankaPreset('standard_full_group')}
                  style={{
                    background: '#0d131f',
                    border: '1px solid #263346',
                    color: '#94a3b8',
                    padding: '5px 10px',
                    borderRadius: '5px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Full 1 Đoàn Sri Lanka (12 khách)
                </button>
              </div>
            </div>

            {/* Khung Nhập Tham Số Sri Lanka (3 ô 1 hàng) */}
            <div className="bu4-grid-3" style={{
              padding: '16px',
              background: '#0d131f',
              borderRadius: '8px',
              border: '1px solid #1e293b',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Số đoàn cần chạy:
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => setSrilankaNumGroups(n)}
                      style={{
                        flex: 1,
                        padding: '6px 0',
                        borderRadius: '5px',
                        border: '1px solid ' + (srilankaNumGroups === n ? '#38bdf8' : '#263346'),
                        background: srilankaNumGroups === n ? '#1e293b' : 'transparent',
                        color: srilankaNumGroups === n ? '#38bdf8' : '#94a3b8',
                        fontWeight: srilankaNumGroups === n ? 600 : 400,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      {n} Đoàn
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Quy mô khách / đoàn:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Tự nhập số tùy ý)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '95px'
                  }}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={srilankaPaxPerGroup}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setSrilankaPaxPerGroup(isNaN(val) ? '' : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[10, 12, 16, 20].map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSrilankaPaxPerGroup(p)}
                        style={{
                          flex: 1,
                          padding: '6px 0',
                          borderRadius: '5px',
                          border: '1px solid ' + (srilankaPaxPerGroup === p ? '#38bdf8' : '#263346'),
                          background: srilankaPaxPerGroup === p ? '#1e293b' : 'transparent',
                          color: srilankaPaxPerGroup === p ? '#38bdf8' : '#94a3b8',
                          fontWeight: srilankaPaxPerGroup === p ? 600 : 400,
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        {p} khách
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Nhập tay (vd: 14, 15, 18...) hoặc bấm chọn nhanh
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  <span>Tỷ lệ chốt Sale (CR):</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="30"
                      value={srilankaCrSale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) setSrilankaCrSale(Math.min(30, Math.max(0.1, val)));
                      }}
                      style={{
                        width: '56px',
                        background: '#0d131f',
                        border: '1px solid #263346',
                        borderRadius: '4px',
                        color: '#38bdf8',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        padding: '2px 4px',
                        textAlign: 'center',
                        outline: 'none'
                      }}
                    />
                    <strong style={{ color: '#38bdf8' }}>%</strong>
                  </div>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  step="0.5"
                  value={srilankaCrSale}
                  onChange={(e) => setSrilankaCrSale(parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#64748b' }}>
                  <span>1% (Thấp)</span>
                  <span>7% (Chuẩn ERP)</span>
                  <span>15%</span>
                  <span>30% (Max)</span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá 1 Lead có SĐT (CPL):
                </label>
                <CurrencyInput
                  value={srilankaCplTarget}
                  onChange={(val) => setSrilankaCplTarget(val)}
                  unit="đ/lead"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Mặc định: <strong>508.063 đ</strong> (lịch sử 2 tháng BU4)
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Hệ số khách đi cùng:
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    (Khách / deal)
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#0d131f',
                    borderRadius: '6px',
                    border: '1px solid #263346',
                    padding: '0 8px',
                    width: '90px'
                  }}>
                    <input
                      type="number"
                      step="0.05"
                      min="1.0"
                      max="5.0"
                      value={srilankaPaxPerLead}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setSrilankaPaxPerLead(isNaN(val) ? 1 : val);
                      }}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontWeight: 600,
                        fontSize: '0.88rem',
                        padding: '7px 0',
                        outline: 'none',
                        textAlign: 'center',
                        fontFamily: 'inherit'
                      }}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>pax</span>
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
                    {[
                      { label: 'Solo (1.0)', val: 1.0 },
                      { label: 'Đôi (1.3)', val: 1.3 },
                      { label: 'Nhóm (1.5)', val: 1.5 }
                    ].map(item => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setSrilankaPaxPerLead(item.val)}
                        style={{
                          flex: 1,
                          padding: '6px 2px',
                          borderRadius: '4px',
                          border: '1px solid ' + (srilankaPaxPerLead === item.val ? '#38bdf8' : '#263346'),
                          background: srilankaPaxPerLead === item.val ? '#1e293b' : 'transparent',
                          color: srilankaPaxPerLead === item.val ? '#38bdf8' : '#94a3b8',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          fontWeight: srilankaPaxPerLead === item.val ? 600 : 400
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Có thể tự nhập số (vd: 1.25, 1.4) hoặc chọn nút
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                  Giá tour trọn gói / khách:
                </label>
                <CurrencyInput
                  value={srilankaTourPrice}
                  onChange={(val) => setSrilankaTourPrice(val)}
                  unit="đ"
                />
                <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                  Chuẩn: <strong>39.990.000 đ</strong>
                </div>
              </div>
            </div>

            {/* Kết quả dự toán Sri Lanka */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600, marginBottom: '10px' }}>
                KẾT QUẢ DỰ TOÁN CHO {srilankaNumGroups} ĐOÀN ({srilankaCalc.totalPax} KHÁCH):
              </div>

              <div className="bu4-grid-3">
                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <PhoneCall size={14} color="#64748b" />
                    <span>SỐ LEAD CẦN CÓ (SĐT)</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(srilankaCalc.requiredLeads)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>leads</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Để chốt <strong>{srilankaCalc.requiredDeals} deal</strong> ({srilankaCalc.totalPax} khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <MessageSquare size={14} color="#64748b" />
                    <span>SỐ INBOX (TIN NHẮN) CẦN</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(srilankaCalc.requiredInboxes)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>inbox</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Dựa trên tỷ lệ lọc SĐT 12.5%
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="#38bdf8" />
                      <span>KHÁCH CHỐT DỰ KIẾN (PAX)</span>
                    </div>
                    <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Nhập tay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      background: '#131d2e',
                      border: '1px solid #38bdf8',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      width: '100px'
                    }}>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={srilankaCalc.totalPax}
                        onChange={(e) => handleSrilankaSection4PaxChange(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          color: '#38bdf8',
                          fontSize: '1.45rem',
                          fontWeight: 700,
                          outline: 'none',
                          fontFamily: 'inherit'
                        }}
                      />
                      <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 400 }}>pax</span>
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', lineHeight: '1.3' }}>
                      Mục tiêu <strong>{srilankaNumGroups} đoàn</strong> ({srilankaPaxPerGroup} khách/đoàn)
                    </div>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                    ⇄ Nhập số khách sẽ kéo thanh CR <strong>{srilankaCrSale}%</strong> (hoặc kéo CR đổi khách)
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <DollarSign size={14} color="#38bdf8" />
                    <span>TỔNG DỰ TOÁN KINH PHÍ ADS</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#38bdf8' }}>
                    {formatMoney(srilankaCalc.totalAdsBudget)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#94a3b8' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Khoảng <strong>~{(srilankaCalc.totalAdsBudget / 1000000).toFixed(1)} triệu VNĐ</strong>
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                    CHI PHÍ ADS / KHÁCH CHỐT
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(srilankaCalc.cpaPerPax)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Chiếm <strong>{srilankaCalc.adsToRevenueRatio}%</strong> doanh thu
                  </div>
                </div>

                <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '16px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <TrendingUp size={14} color="#10b981" />
                    <span>DOANH THU TẠO RA DỰ KIẾN</span>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>
                    {formatMoney(srilankaCalc.totalRevenue)} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: '#64748b' }}>đ</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Lợi nhuận gộp: <strong style={{ color: '#10b981' }}>~{formatMoney(srilankaCalc.totalGrossProfit)} đ</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Đánh giá an toàn tài chính Sri Lanka */}
            <div style={{
              background: '#0d131f',
              border: '1px solid #1e293b',
              borderRadius: '6px',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc' }}>
                  Tình trạng tài chính: {srilankaCalc.safetyLevel} ({srilankaCalc.adsToProfitRatio}% Lợi Nhuận Gộp)
                </span>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  {srilankaCalc.safetyDesc}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Doanh thu {srilankaCalc.totalPax} khách: </span>
                <strong style={{ fontSize: '0.92rem', color: '#f8fafc' }}>{formatMoney(srilankaCalc.totalRevenue)} đ</strong>
              </div>
            </div>
          </div>

          {/* ── 5. CHIẾN LƯỢC ĐỊNH HƯỚNG THỊ TRƯỜNG SRI LANKA & KỊCH BẢN SALE GOM KHÁCH GHÉP ── */}
          <div style={{
            background: '#131d2e',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Compass size={18} color="#38bdf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0, color: '#f8fafc' }}>
                5. Định Hướng Thị Trường Sri Lanka & Kịch Bản Sale Gom Khách Ghép
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#38bdf8' }}>1.</span> Mùa Vàng Du Lịch Sri Lanka (Tháng 11 → Tháng 4)
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Khu vực bờ biển phía Tây và Nam Sri Lanka (Colombo, Galle, Mirissa) bước vào mùa biển êm, trời xanh khô ráo không mưa bão. Đây là thời điểm lý tưởng nhất trong năm để trải nghiệm ngắm cá voi xanh Mirissa, đi chuyến tàu hỏa leo núi qua đồi chè xanh mướt Ella và safari voi hoang dã tại vườn quốc gia Yala.
                </p>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#38bdf8' }}>2.</span> Duy Trì & Tăng Tỷ Lệ Lấy SĐT (Hiện Tại 12.5% → Mục Tiêu 18%+)
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Chi phí CPL thực tế đạt 508.063 đ/lead (T8: 481k, T9: 560k) với tỷ lệ ra SĐT 12.5% (~8 inbox/lead). Kế hoạch tháng 10 sẽ giữ định dạng Carousel kèm lịch trình chi tiết và bảng ưu đãi độc quyền 3 suất đầu tiên để tối ưu CPL và đẩy tỷ lệ ra SĐT lên trên 18%.
                </p>
              </div>

              <div style={{ background: '#0d131f', border: '1px solid #1e293b', borderRadius: '6px', padding: '14px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#38bdf8' }}>3.</span> Kịch Bản Cross-Selling Gom Khách Ghép Từ Tuyến Khác
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.5' }}>
                  Tận dụng lượng data khách quan tâm Ladakh (không kịp visa hoặc sợ thời tiết lạnh âm độ mùa đông) và khách tìm hiểu Bhutan (muốn mức ngân sách nhẹ nhàng ~39.99tr thay vì ~60tr), đội ngũ Sale chủ động tư vấn: <em>"Sri Lanka là hành trình di sản Phật giáo & thiên nhiên nhiệt đới ấm áp, thủ tục visa điện tử cực nhanh"</em> để gom đủ đoàn 10 - 12 khách.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Navigation cho Sri Lanka */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            background: '#131d2e',
            borderRadius: '6px',
            border: '1px solid #1e293b',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setActiveTab('ladakh')}
                style={{
                  background: '#0d131f',
                  color: '#cbd5e1',
                  border: '1px solid #263346',
                  padding: '6px 14px',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ← Quay lại Bước 2: Ladakh
              </button>
              <button
                onClick={() => setActiveTab('bhutan')}
                style={{
                  background: '#0d131f',
                  color: '#cbd5e1',
                  border: '1px solid #263346',
                  padding: '6px 14px',
                  borderRadius: '5px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                ← Về Bước 1: Bhutan
              </button>
            </div>
            <Link
              to="/marketing-budget-plan?bu=BU4&quarter=4&year=2026"
              style={{
                background: '#1e293b',
                color: '#38bdf8',
                border: '1px solid #334155',
                padding: '6px 14px',
                borderRadius: '5px',
                fontSize: '0.8rem',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Mở Kế Hoạch Ngân Sách ERP BU4 →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default BU4MarketPlanningPage;
