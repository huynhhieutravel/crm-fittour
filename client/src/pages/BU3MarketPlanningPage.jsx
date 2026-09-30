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
  Calendar,
  AlertCircle,
  ArrowRight,
  Target,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  HelpCircle,
  PieChart,
  Search,
  Newspaper,
  Award,
  Flame,
  Check,
  RotateCcw,
  Briefcase,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// Helper format tiền tệ VNĐ
const fmt = (val) => {
  if (!val && val !== 0) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Helper tính toán mức độ nhiệt và màu sắc cho Bản Đồ Nhiệt 12 Tháng
const getHeatmapInfo = (budget, channels) => {
  const gsaBudget = channels?.find(c => c.name.includes('Google Search Ads'))?.budget || 0;
  const prBudget = channels?.find(c => c.name.includes('PR Báo') || c.name.includes('Quỹ Dồn PR'))?.budget || 0;

  if (budget === 0) {
    return {
      level: 0,
      label: 'Cắt 100% Ads',
      badge: '🛑 Nghỉ Ads',
      bg: '#f8fafc',
      border: '#cbd5e1',
      text: '#64748b',
      barColor: '#cbd5e1',
      pct: 0,
      gsaBudget,
      prBudget
    };
  }
  if (budget <= 5000000) {
    return {
      level: 1,
      label: 'Sàn Duy Trì',
      badge: '🌱 Duy trì',
      bg: '#ecfdf5',
      border: '#86efac',
      text: '#047857',
      barColor: '#10b981',
      pct: Math.round((budget / 25000000) * 100),
      gsaBudget,
      prBudget
    };
  }
  if (budget <= 10000000) {
    return {
      level: 2,
      label: 'Khởi Động Đón Đầu',
      badge: '⚡ Khởi động',
      bg: '#fefce8',
      border: '#fde047',
      text: '#854d0e',
      barColor: '#eab308',
      pct: Math.round((budget / 25000000) * 100),
      gsaBudget,
      prBudget
    };
  }
  if (budget <= 15000000) {
    return {
      level: 3,
      label: 'Tăng Tốc Đón Đỉnh',
      badge: '🚀 Tăng tốc',
      bg: '#fff7ed',
      border: '#fdba74',
      text: '#9a3412',
      barColor: '#f97316',
      pct: Math.round((budget / 25000000) * 100),
      gsaBudget,
      prBudget
    };
  }
  return {
    level: 4,
    label: 'Cực Đại Hỏa Lực',
    badge: '🔥 Cực đại',
    bg: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)',
    border: '#f43f5e',
    text: '#9f1239',
    barColor: '#f43f5e',
    pct: Math.round((budget / 25000000) * 100),
    gsaBudget,
    prBudget
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// BỘ DỮ LIỆU MA TRẬN 12 THÁNG BU3 — NĂM 2026 - 2027
// QUY TẮC: CHẠY TRƯỚC 2 THÁNG • 3 LÀN SÓNG CAO ĐIỂM • THÁNG 2 CẮT = 0 ĐỒNG (NGHỈ TẾT ÂM LỊCH & DU XUÂN)
// ══════════════════════════════════════════════════════════════════════════════
const MONTHS_DATA = [
  {
    month: 1,
    monthLabel: 'Tháng 1',
    executionMonth: 'Tháng 1 (Cao điểm YEP) & Khai xuân',
    budget: 5000000,
    status: 'normal',
    seasonKey: 'yep',
    seasonName: 'Đại Tiệc YEP & Khai Xuân',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Tiệc Tất Niên Sát Tết', 'Gala Tri Ân Nội Bộ', 'Tour Khai Xuân Hành Hương Đầu Năm'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 5000000, pct: '100%', desc: 'Duy trì từ khoá thương hiệu & tour du xuân đầu năm, cận Tết tắt ads dồn lực phục vụ tiệc YEP' },
      { name: 'Quỹ PR Tích Lũy (Chuyển sang T3)', budget: 0, pct: '0%', desc: '💡 Tích lũy dồn ngân sách PR sang Tháng 3 sau Tết để bứt tốc chiến dịch Hè' }
    ],
    expectedInquiries: 7,
    expectedDeals: 1,
    expectedPax: 40,
    expectedRevenue: 480000000,
    leadTimeNote: 'Thời điểm diễn ra tiệc Tất Niên (YEP) trước Tết Âm lịch. Chạy Ads sàn 5M quét tour xuân, cận Tết hạ Ads để dồn lực phục vụ đại tiệc.'
  },
  {
    month: 2,
    monthLabel: 'Tháng 2',
    executionMonth: 'Kỳ Nghỉ Tết & Tháng Giêng',
    budget: 0,
    status: 'cut',
    seasonKey: 'cut',
    seasonName: 'Nghỉ Tết Âm Lịch (Cắt Ads)',
    seasonIcon: '🛑',
    colorTheme: '#64748b',
    bgTheme: '#f8fafc',
    borderTheme: '#cbd5e1',
    targetMarkets: ['Tập trung 100% nhân sự phục vụ tour Tết', 'Không chạy ads B2B tìm khách mới'],
    channels: [
      { name: 'Tắt Toàn Bộ Ads', budget: 0, pct: '0%', desc: 'Cắt giảm ngân sách về 0đ: Thị trường B2B nghỉ Tết và du xuân, không ai duyệt tour đoàn' }
    ],
    expectedInquiries: 0,
    expectedDeals: 0,
    expectedPax: 0,
    expectedRevenue: 0,
    leadTimeNote: 'Vùng trũng B2B: Toàn quốc nghỉ Tết và du xuân tháng Giêng, doanh nghiệp chưa duyệt ngân sách hè. FIT Tour tập trung dẫn tour, cắt sạch Ads 0đ.'
  },
  {
    month: 3,
    monthLabel: 'Tháng 3',
    executionMonth: 'Tháng 5 - 6 (Khởi hành hè sớm)',
    budget: 25000000,
    status: 'peak',
    seasonKey: 'summer',
    seasonName: 'Khởi Động Hè Sớm (💥 Cú Hích PR 1)',
    seasonIcon: '☀️',
    colorTheme: '#f59e0b',
    bgTheme: '#fffbeb',
    borderTheme: '#fde68a',
    targetMarkets: ['Thái Lan (Bangkok - Pattaya)', 'Singapore - Malaysia', 'Trung Quốc Hè', 'Đà Nẵng / Phú Quốc / Nha Trang'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 15000000, pct: '60%', desc: 'Đấu thầu top 1 từ khoá tour hè công ty, teambuilding biển cao cấp' },
      { name: '💥 Quỹ Dồn PR Báo Chí (Hero Push 1)', budget: 10000000, pct: '40%', desc: 'Bài PR Báo chí B2B uy tín: "Xu hướng Doanh nghiệp đặt Tour Hè sớm 2026" làm Profile thầu cả năm' }
    ],
    expectedInquiries: 32,
    expectedDeals: 6,
    expectedPax: 270,
    expectedRevenue: 3240000000,
    leadTimeNote: 'Sau Tết 1 tháng: Doanh nghiệp vào guồng, Ban Giám Đốc duyệt ngân sách Hè. Kích hoạt Cú Hích PR Báo 10M kết hợp 15M GSA đón đỉnh tìm kiếm.'
  },
  {
    month: 4,
    monthLabel: 'Tháng 4',
    executionMonth: 'Tháng 6 - 7 (Đại cao điểm hè)',
    budget: 20000000,
    status: 'peak',
    seasonKey: 'summer',
    seasonName: 'Đại Cao Điểm Hè B2B (Trọng Tâm)',
    seasonIcon: '☀️',
    colorTheme: '#f59e0b',
    bgTheme: '#fffbeb',
    borderTheme: '#fde68a',
    targetMarkets: ['Trung / Hàn / Nhật / Đài / Đông Nam Á', 'Company Trip Biển & Resort 5 Sao'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 20000000, pct: '100%', desc: 'Dồn 100% GSA chiếm lĩnh toàn bộ truy vấn tour doanh nghiệp hè trọn gói (Tận dụng link bài báo T3 đi chào thầu)' }
    ],
    expectedInquiries: 28,
    expectedDeals: 6,
    expectedPax: 280,
    expectedRevenue: 3360000000,
    leadTimeNote: 'Nhu cầu tìm kiếm Company Trip và Teambuilding hè đạt đỉnh! Đẩy tối đa 20M GSA để chốt toàn bộ hợp đồng đoàn lớn khởi hành Tháng 6 và Tháng 7.'
  },
  {
    month: 5,
    monthLabel: 'Tháng 5',
    executionMonth: 'Tháng 7 - 8 (Cao điểm teambuilding)',
    budget: 20000000,
    status: 'peak',
    seasonKey: 'summer',
    seasonName: 'Cao Điểm Hè Đợt 2 & Teambuilding',
    seasonIcon: '☀️',
    colorTheme: '#f59e0b',
    bgTheme: '#fffbeb',
    borderTheme: '#fde68a',
    targetMarkets: ['Đông Nam Á', 'Hàn Quốc - Nhật Bản', 'Quy Nhơn / Phú Quốc / Hạ Long'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 20000000, pct: '100%', desc: 'Đón các đoàn doanh nghiệp đặt tour hè gấp trong tháng 7-8 & chốt vé teambuilding biển' }
    ],
    expectedInquiries: 26,
    expectedDeals: 5,
    expectedPax: 230,
    expectedRevenue: 2760000000,
    leadTimeNote: 'Đại cao điểm chốt hợp đồng cho các đoàn gia đình nhân viên và công đoàn. Tập trung 20M GSA chốt nhanh các đoàn khởi hành Tháng 7 và Tháng 8.'
  },
  {
    month: 6,
    monthLabel: 'Tháng 6',
    executionMonth: 'Tháng 8 - 9 (Cuối hè & Khai giảng)',
    budget: 15000000,
    status: 'peak',
    seasonKey: 'summer',
    seasonName: 'Cuối Hè & Khởi Động Đón Thu Sớm',
    seasonIcon: '☀️',
    colorTheme: '#f59e0b',
    bgTheme: '#fffbeb',
    borderTheme: '#fde68a',
    targetMarkets: ['Trung Quốc', 'Đài Loan', 'Thái Lan', 'Company Trip Nội Địa'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 15000000, pct: '100%', desc: 'Duy trì GSA ổn định đón đoàn hè muộn & bắt đầu hứng từ khoá tour thu sớm' }
    ],
    expectedInquiries: 18,
    expectedDeals: 4,
    expectedPax: 160,
    expectedRevenue: 1920000000,
    leadTimeNote: 'Chốt các đoàn khởi hành hè muộn và bắt đầu hứng các truy vấn tour Mùa Thu sớm từ khối doanh nghiệp lớn với ngân sách 15M GSA ổn định.'
  },
  {
    month: 7,
    monthLabel: 'Tháng 7',
    executionMonth: 'Tháng 9 - 10 (Mùa Thu Vàng)',
    budget: 20000000,
    status: 'peak',
    seasonKey: 'autumn',
    seasonName: 'Mùa Thu Vàng (💥 Cú Hích PR 2)',
    seasonIcon: '🍁',
    colorTheme: '#ea580c',
    bgTheme: '#fff7ed',
    borderTheme: '#fed7aa',
    targetMarkets: ['Trung Quốc (Cửu Trại Câu / Bắc Kinh)', 'Hàn Quốc (Đảo Nami)', 'Nhật Bản (Núi Phú Sĩ)', 'Đài Loan'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 10000000, pct: '50%', desc: 'Từ khoá tour mùa thu lá đỏ đoàn công ty (Nhật, Hàn, Cửu Trại Câu)' },
      { name: '💥 Quỹ Dồn PR Báo Chí (Hero Push 2)', budget: 10000000, pct: '50%', desc: 'Bài PR Báo chí B2B uy tín: "Kinh nghiệm chọn đơn vị lữ hành uy tín tổ chức tour đoàn thể & thẩm định thầu"' }
    ],
    expectedInquiries: 24,
    expectedDeals: 5,
    expectedPax: 200,
    expectedRevenue: 2400000000,
    leadTimeNote: 'Chạy đón Mùa Thu Vàng (Nhật Bản, Hàn Quốc, Cửu Trại Câu). Đổ 10M GSA kết hợp Cú Hích PR 10M làm bảo chứng hồ sơ năng lực đấu thầu B2B.'
  },
  {
    month: 8,
    monthLabel: 'Tháng 8',
    executionMonth: 'Tháng 10 - 11 (Thu muộn & MICE)',
    budget: 7000000,
    status: 'normal',
    seasonKey: 'autumn',
    seasonName: 'Mùa Thu Đợt 2 & Hội Nghị Tri Ân',
    seasonIcon: '🍁',
    colorTheme: '#ea580c',
    bgTheme: '#fff7ed',
    borderTheme: '#fed7aa',
    targetMarkets: ['Trung Quốc', 'Hàn Quốc', 'Nhật Bản', 'Tour MICE Hội Thảo Kết Hợp Nghỉ Dưỡng'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 7000000, pct: '100%', desc: 'Duy trì top search B2B từ khoá tour thu & hội nghị khách hàng' }
    ],
    expectedInquiries: 9,
    expectedDeals: 2,
    expectedPax: 80,
    expectedRevenue: 960000000,
    leadTimeNote: 'Chốt hợp đồng tour Mùa Thu đợt 2 và tour MICE hội thảo kết hợp nghỉ dưỡng. Chuẩn bị bộ tài liệu giải pháp sẵn sàng pitching Year-End Party.'
  },
  {
    month: 9,
    monthLabel: 'Tháng 9',
    executionMonth: 'Tháng 11 (Vận hành) & Chuẩn bị YEP',
    budget: 3000000,
    status: 'normal',
    seasonKey: 'autumn',
    seasonName: 'Duy Trì Ổn Định & Chuyển Mùa',
    seasonIcon: '🍁',
    colorTheme: '#ea580c',
    bgTheme: '#fff7ed',
    borderTheme: '#fed7aa',
    targetMarkets: ['Trung Quốc', 'Đài Loan', 'Khu nghỉ dưỡng gần TP.HCM / Hà Nội'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 3000000, pct: '100%', desc: 'Duy trì GSA mức sàn ổn định giữ thứ hạng, dồn tiền PR sang Tháng 10' }
    ],
    expectedInquiries: 4,
    expectedDeals: 1,
    expectedPax: 35,
    expectedRevenue: 420000000,
    leadTimeNote: 'Tháng giao thoa: Giữ mức sàn 3M GSA duy trì thứ hạng từ khóa thương hiệu, tiết kiệm dồn toàn bộ nguồn lực ngân sách PR cho chiến dịch YEP T10.'
  },
  {
    month: 10,
    monthLabel: 'Tháng 10',
    executionMonth: 'Tháng 12 & Tháng 1 (Gala Dinner YEP)',
    budget: 15000000,
    status: 'peak',
    seasonKey: 'yep',
    seasonName: 'Đón Sóng YEP (💥 Cú Hích PR 3)',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Resort 5 Sao Ven Biển (Phú Quốc/Hồ Tràm)', 'Gala Dinner Trọn Gói', 'Tour Cao Cấp Tri Ân VIP'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 5000000, pct: '33.3%', desc: 'Top từ khoá tổ chức year end party công ty trọn gói' },
      { name: '💥 Quỹ Dồn PR Báo Chí (Hero Push 3)', budget: 10000000, pct: '66.7%', desc: 'Bài PR Báo chí B2B & Kinh tế: "Giải pháp tổ chức Gala Dinner & Year-End Party đỉnh cao cuối năm cho Doanh Nghiệp"' }
    ],
    expectedInquiries: 20,
    expectedDeals: 4,
    expectedPax: 180,
    expectedRevenue: 2160000000,
    leadTimeNote: 'Thời điểm các tập đoàn lớn mở thầu địa điểm và concept tiệc Tất Niên cuối năm. Kích hoạt Cú Hích PR Báo 10M kết hợp 5M GSA đón sóng mở thầu.'
  },
  {
    month: 11,
    monthLabel: 'Tháng 11',
    executionMonth: 'Tháng 12 & Tháng 1 (Chốt thầu YEP)',
    budget: 15000000,
    status: 'peak',
    seasonKey: 'yep',
    seasonName: 'Đại Cao Điểm Chốt Thầu YEP',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Tiệc Tất Niên Doanh Nghiệp', 'Gala Dinner Cuối Năm', 'Tour Tri Ân Khách Hàng'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 15000000, pct: '100%', desc: 'Đẩy mạnh 100% GSA từ khoá đặt tiệc tất niên, tổ chức YEP công ty trọn gói' }
    ],
    expectedInquiries: 22,
    expectedDeals: 5,
    expectedPax: 220,
    expectedRevenue: 2640000000,
    leadTimeNote: 'Tháng chốt hợp đồng nước rút cho các tiệc YEP tổ chức vào Tháng 12 và Tháng 1 trước Tết. Dồn hỏa lực 15M GSA quét trọn vẹn khách hàng tiềm năng.'
  },
  {
    month: 12,
    monthLabel: 'Tháng 12',
    executionMonth: 'Tháng 1 (Chốt vét YEP trước Tết)',
    budget: 5000000,
    status: 'normal',
    seasonKey: 'yep',
    seasonName: 'Chốt Vét YEP T1 & Vận Hành Đợt 1',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Gala YEP phút chót', 'Tiệc Tất Niên Doanh Nghiệp Cận Tết', 'Tour Tri Ân VIP Khởi Hành Tháng 1'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 5000000, pct: '100%', desc: 'Top từ khoá đặt tiệc tất niên gấp, gala dinner trọn gói tháng 1 cận Tết' }
    ],
    expectedInquiries: 8,
    expectedDeals: 2,
    expectedPax: 80,
    expectedRevenue: 960000000,
    leadTimeNote: 'Vừa vận hành các tiệc YEP Tháng 12, vừa giữ 5M GSA chốt vét các doanh nghiệp SME tìm địa điểm và concept tiệc muộn cho Tháng 1 cận Tết.'
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// CẤU HÌNH BỘ LỌC MÙA VỤ
// ══════════════════════════════════════════════════════════════════════════════
const SEASON_FILTERS = [
  { id: 'all', label: 'Tất Cả 12 Tháng', icon: '📅', countText: '12 Tháng • 150 Triệu' },
  { id: 'summer', label: '☀️ Mùa Hè & Teambuilding (T5-T9)', icon: '☀️', countText: 'Chạy T3-T6 • 80 Triệu' },
  { id: 'autumn', label: '🍁 Mùa Thu Vàng (T9-T11)', icon: '🍁', countText: 'Chạy T7-T9 • 30 Triệu' },
  { id: 'yep', label: '🥂 Year-End Party & Gala Cận Tết (T12-T1)', icon: '🥂', countText: 'Chạy T10-T12 & T1 • 40 Triệu' },
  { id: 'cut', label: '🛑 Kỳ Nghỉ Tết Âm Lịch (Cắt Ads)', icon: '🛑', countText: 'Tháng 2 • 0 VNĐ' }
];

export default function BU3MarketPlanningPage() {
  const [searchParams] = useSearchParams();
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [isPrinciplesOpen, setIsPrinciplesOpen] = useState(false);

  // State Máy tính B2B Phễu Doanh Nghiệp
  const [calcBudget, setCalcBudget] = useState(150000000);
  const [calcCpl, setCalcCpl] = useState(800000); // 800.000đ / Lead doanh nghiệp
  const [calcWinRate, setCalcWinRate] = useState(20); // 20% chốt thành công hợp đồng
  const [calcPaxPerDeal, setCalcPaxPerDeal] = useState(45); // 45 khách/đoàn trung bình
  const [calcTicketPrice, setCalcTicketPrice] = useState(12000000); // 12 triệu / khách TB

  // Scroll to calculator if query tab=calculator
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'calculator' || tabParam === 'may-tinh') {
      setTimeout(() => {
        const el = document.getElementById('b2b-calculator-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [searchParams]);

  // Lọc danh sách tháng
  const filteredMonths = useMemo(() => {
    if (selectedSeason === 'all') return MONTHS_DATA;
    if (selectedSeason === 'autumn') {
      return MONTHS_DATA.filter(m => m.seasonKey === 'autumn' || m.month === 7);
    }
    return MONTHS_DATA.filter(m => m.seasonKey === selectedSeason);
  }, [selectedSeason]);

  // Tổng hợp số liệu theo bộ lọc
  const summaryMetrics = useMemo(() => {
    const totalBudget = filteredMonths.reduce((sum, m) => sum + m.budget, 0);
    const totalInquiries = filteredMonths.reduce((sum, m) => sum + m.expectedInquiries, 0);
    const totalDeals = filteredMonths.reduce((sum, m) => sum + m.expectedDeals, 0);
    const totalPax = filteredMonths.reduce((sum, m) => sum + m.expectedPax, 0);
    const totalRevenue = filteredMonths.reduce((sum, m) => sum + m.expectedRevenue, 0);
    const costRatio = totalRevenue > 0 ? ((totalBudget / totalRevenue) * 100).toFixed(2) : 0;
    return {
      totalBudget,
      totalInquiries,
      totalDeals,
      totalPax,
      totalRevenue,
      costRatio
    };
  }, [filteredMonths]);

  // Kết quả máy tính B2B Phễu Doanh Nghiệp
  const calcResult = useMemo(() => {
    const inquiries = calcCpl > 0 ? Math.floor(calcBudget / calcCpl) : 0;
    const deals = Math.floor(inquiries * (calcWinRate / 100));
    const totalPax = deals * calcPaxPerDeal;
    const totalRevenue = totalPax * calcTicketPrice;
    const costRatio = totalRevenue > 0 ? ((calcBudget / totalRevenue) * 100).toFixed(2) : 0;
    const avgContractValue = deals > 0 ? Math.round(totalRevenue / deals) : 0;

    return {
      inquiries,
      deals,
      totalPax,
      totalRevenue,
      costRatio,
      avgContractValue
    };
  }, [calcBudget, calcCpl, calcWinRate, calcPaxPerDeal, calcTicketPrice]);

  return (
    <div style={{ maxWidth: '1360px', margin: '0 auto', padding: '16px 20px 80px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* ── 1. BREADCRUMB & HEADER QUẢNG BÁ ĐỀ ÁN ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#64748b', marginBottom: '14px' }}>
        <Link to="/marketing-ads?subtab=planning" style={{ color: '#86198f', textDecoration: 'none', fontWeight: 600 }}>
          Kế Hoạch Thị Trường
        </Link>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 700 }}>BU3 • B2B / MICE / Tour Doanh Nghiệp</span>
      </div>

      {/* ── 2. HERO BANNER CHUYÊN BIỆT CHO BU3 ── */}
      <div style={{
        background: 'linear-gradient(135deg, #3b0764 0%, #701a75 50%, #86198f 100%)',
        borderRadius: '14px',
        padding: '28px 32px',
        color: '#ffffff',
        boxShadow: '0 8px 24px rgba(112, 26, 117, 0.22)',
        border: '1px solid #a21caf',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '22px'
      }}>
        <div style={{
          position: 'absolute',
          right: '-40px',
          top: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(217, 70, 239, 0.25) 0%, rgba(217, 70, 239, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{
              background: '#fae8ff',
              color: '#86198f',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '6px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              FIT TOUR & ELITE BU3 • B2B & MICE
            </span>
            <span style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fdf4ff',
              fontSize: '0.74rem',
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: '6px'
            }}>
              Kế Hoạch Chuẩn Cả Năm 2027 (12 Tháng)
            </span>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '12px',
              border: '1px solid #a7f3d0'
            }}>
              ● Quy Tắc: Chạy Ads Đón Trước 02 Tháng
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 10px', color: '#ffffff', letterSpacing: '-0.02em', lineHeight: '1.25' }}>
            Đề Án & Dự Toán Ngân Sách BU3 Năm 2027 — 150.000.000 đ
          </h1>
          <p style={{ margin: '0 0 20px', fontSize: '0.94rem', color: '#f5d0fe', maxWidth: '920px', lineHeight: '1.6' }}>
            Khung phân bổ ngân sách Marketing cả năm 2027 theo chu kỳ mùa vụ cho <strong>2 thị trường trọng tâm</strong>: (1) Nước ngoài theo mùa (Hoa anh đào, Hè, Thu) và (2) Teambuilding & Company Trip trong nước (Tháng 3-4, 6-9, và Year-End Party Tháng 12 - Tháng 01).
            Tập trung duy trì Google Search Ads (GSA), Booking Báo Chí uy tín và cắt triệt để ngân sách vào Tháng 2 (Kỳ nghỉ Tết Âm lịch & Tháng Giêng) để tối ưu dòng tiền. <em>(Kế hoạch hành động Quý 4/2026 sẽ được bổ sung tiếp nối).</em>
          </p>

          {/* 4 Thẻ KPI Năm Tổng Hợp */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>Tổng Ngân Sách MKT Năm</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
                150.000.000 đ
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d8b4fe' }}>TB 12.5M/tháng • 3 Làn sóng cao điểm</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>Kỳ Vọng Lead Doanh Nghiệp</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#facc15', marginTop: '3px' }}>
                180 - 220 Lead DN
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d8b4fe' }}>Inquiries / Yêu cầu báo giá đoàn</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>Mục Tiêu Hợp Đồng Đoàn</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80', marginTop: '3px' }}>
                36 - 45 Đoàn
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d8b4fe' }}>Quy mô TB 40-50 Pax/Đoàn (~1.800 Pax)</div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>Doanh Thu Dự Kiến Đoàn</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '3px' }}>
                ~21.6 Tỷ VNĐ
              </div>
              <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>Tỷ lệ Chi phí Ads / Doanh thu: ~0.69%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. BẢNG NGUYÊN TẮC VÀNG VẬN HÀNH BU3 (FOLD / UNFOLD) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        marginBottom: '20px',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden',
        transition: 'all 0.2s'
      }}>
        {/* Thanh Header Có Thể Click Để Fold / Unfold */}
        <div 
          onClick={() => setIsPrinciplesOpen(!isPrinciplesOpen)}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '12px 18px',
            cursor: 'pointer',
            userSelect: 'none',
            background: isPrinciplesOpen ? '#fdf4ff' : '#ffffff',
            borderBottom: isPrinciplesOpen ? '1px solid #f0abfc' : 'none',
            transition: 'background 0.15s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#fae8ff',
              color: '#86198f',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={18} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: '#1e293b' }}>
                  4 Nguyên Tắc Cốt Lõi Vận Hành Ngân Sách Marketing BU3
                </h3>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                ① Chạy đón trước 02 tháng • ② Cân đối dồn tiền & Tháng 2 cắt 0đ • ③ GSA Always-on • ④ Quỹ dồn theo Quý bứt tốc PR Báo lớn
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              color: '#86198f',
              background: '#f3e8ff',
              padding: '4px 10px',
              borderRadius: '20px',
              whiteSpace: 'nowrap'
            }}>
              {isPrinciplesOpen ? 'Thu gọn ▲' : 'Xem chi tiết ▼'}
            </span>
            {isPrinciplesOpen ? <ChevronUp size={18} color="#86198f" /> : <ChevronDown size={18} color="#86198f" />}
          </div>
        </div>

        {/* Nội dung 4 Nguyên Tắc (Chỉ mở ra khi isPrinciplesOpen = true) */}
        {isPrinciplesOpen && (
          <div style={{
            padding: '16px 18px',
            background: '#ffffff'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#86198f', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <Clock size={16} />
                  <span>1. Quy Tắc "Chạy Trước 02 Tháng"</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#701a75', lineHeight: '1.5' }}>
                  Khách hàng doanh nghiệp luôn lập kế hoạch và khảo sát giá trước 6-8 tuần. Chạy ads trước 2 tháng để đón đầu giai đoạn tìm kiếm thông tin và hoàn tất thủ tục Visa/hợp đồng đoàn.
                </p>
              </div>

              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#b45309', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <TrendingUp size={16} />
                  <span>2. Cân Đối Dồn Tiền & Tháng 2 Cắt 0đ (Kỳ Nghỉ Tết)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#92400e', lineHeight: '1.5' }}>
                  Không rải đều 12.5M mỗi tháng. Dồn ngân sách cao nhất vào <strong>Tháng 3 (25M)</strong>, <strong>Tháng 4-5 (20M/tháng)</strong> và <strong>Tháng 10 (15M)</strong>. <strong>Tháng 2 cắt sạch 0đ</strong> vì trùng kỳ nghỉ Tết Âm lịch & Tháng Giêng du xuân, doanh nghiệp chưa duyệt hè, toàn bộ đội ngũ tập trung dẫn tour Tết.
                </p>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1d4ed8', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <Search size={16} />
                  <span>3. Google Search Ads (Always-on)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e40af', lineHeight: '1.5' }}>
                  Duy trì Google Search Ads liên tục 11 tháng (tổng 120 Triệu) để đón trúng khách hàng doanh nghiệp đang chủ động gõ tìm kiếm tour đoàn, teambuilding, Company Trip trên Google.
                </p>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#047857', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <Award size={16} />
                  <span>4. Quỹ Dồn Bứt Tốc PR Theo Quý</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#065f46', lineHeight: '1.5' }}>
                  Không rải vụn 2-3M/tháng cho PR vì không đủ book báo uy tín. Gom ngân sách theo Quý thành <strong>3 Cú Hích PR Báo Chí B2B</strong> (T3: 10M, T7: 10M, T10: 10M - tổng 30 Triệu PR) làm Profile bảo chứng thầu cả năm!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BẢN ĐỒ NHIỆT PHÂN BỔ NGÂN SÁCH 12 THÁNG (HEATMAP MATRIX) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '18px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
      }}>
        {/* Header Bản Đồ Nhiệt */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#fef2f2',
              color: '#ef4444',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Flame size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: '#0f172a' }}>
                Bản Đồ Nhiệt Phân Bổ Ngân Sách 12 Tháng Năm 2027 (Yearly Budget Heatmap)
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Trực quan hóa mật độ dồn ngân sách cả năm — Bấm vào tháng bất kỳ để cuộn nhanh đến bảng kế hoạch chi tiết
              </p>
            </div>
          </div>

          {/* Quick Summary Pill Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, padding: '4px 10px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
              🔍 Ads: 120.000.000 đ (80%)
            </span>
            <span style={{ fontSize: '0.74rem', background: '#fdf4ff', color: '#86198f', fontWeight: 700, padding: '4px 10px', borderRadius: '16px', border: '1px solid #f0abfc' }}>
              📰 PR Báo Chí: 30.000.000 đ (20%)
            </span>
            <span style={{ fontSize: '0.74rem', background: '#f0fdf4', color: '#15803d', fontWeight: 800, padding: '4px 10px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
              🎯 Tổng: 150.000.000 đ
            </span>
          </div>
        </div>

        {/* Thang đo nhiệt độ (Legend Bar) */}
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '8px 14px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
            Thang Đo Mức Nhiệt Ngân Sách:
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.74rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#f8fafc', border: '1px dashed #cbd5e1' }} />
              <span style={{ color: '#64748b', fontWeight: 600 }}>0đ: Cắt 100% Ads (Tháng 2 - Nghỉ Tết)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ecfdf5', border: '1px solid #86efac' }} />
              <span style={{ color: '#047857', fontWeight: 600 }}>1 - 5M: Sàn Duy Trì</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fefce8', border: '1px solid #fde047' }} />
              <span style={{ color: '#854d0e', fontWeight: 600 }}>6 - 10M: Khởi Động Đón Đầu</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#fff7ed', border: '1px solid #fdba74' }} />
              <span style={{ color: '#9a3412', fontWeight: 600 }}>11 - 19M: Tăng Tốc Đón Đỉnh</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#ffe4e6', border: '1px solid #f43f5e' }} />
              <span style={{ color: '#9f1239', fontWeight: 700 }}>20 - 25M: Cực Đại Hỏa Lực 🔥</span>
            </div>
          </div>
        </div>

        {/* 12 Ô Lưới Nhiệt (Heatmap Grid 12 Tháng) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(88px, 1fr))',
          gap: '8px'
        }}>
          {MONTHS_DATA.map((m) => {
            const heat = getHeatmapInfo(m.budget, m.channels);
            const isCut = m.budget === 0;

            return (
              <div
                key={m.month}
                onClick={() => {
                  const el = document.getElementById(`month-card-${m.month}`);
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.style.transition = 'box-shadow 0.3s';
                    el.style.boxShadow = '0 0 0 3px #86198f';
                    setTimeout(() => {
                      el.style.boxShadow = isCut ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.03)';
                    }, 1200);
                  }
                }}
                style={{
                  background: heat.bg,
                  border: isCut ? '1.5px dashed #cbd5e1' : `1.5px solid ${heat.border}`,
                  borderRadius: '8px',
                  padding: '10px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                title={`Bấm để xem chi tiết Tháng ${m.month}: ${fmt(m.budget)} đ`}
              >
                {/* Header Tháng + Mùa vụ icon */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: heat.text }}>
                    T{m.month}
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>{m.seasonIcon}</span>
                </div>

                {/* Số tiền to nổi bật */}
                <div style={{ margin: '4px 0 6px', textAlign: 'center' }}>
                  <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    color: heat.text,
                    lineHeight: 1.1
                  }}>
                    {isCut ? '0 đ' : `${m.budget / 1000000} Tr`}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: isCut ? '#94a3b8' : heat.text, opacity: 0.85, marginTop: '2px' }}>
                    {isCut ? 'Cắt sạch' : `${heat.pct}% hỏa lực`}
                  </div>
                </div>

                {/* Mini Heat Meter Bar */}
                <div style={{
                  background: 'rgba(0, 0, 0, 0.06)',
                  borderRadius: '4px',
                  height: '5px',
                  width: '100%',
                  overflow: 'hidden',
                  marginBottom: '6px'
                }}>
                  <div style={{
                    background: heat.barColor,
                    height: '100%',
                    width: `${heat.pct}%`,
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                {/* Breakdown Mini Kênh: Ads & PR */}
                <div style={{ fontSize: '0.66rem', lineHeight: 1.25, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '4px' }}>
                  {isCut ? (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', textAlign: 'center' }}>
                      Nghỉ Ads
                    </span>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>Ads:</span>
                        <strong style={{ color: '#1e293b' }}>{heat.gsaBudget / 1000000}tr</strong>
                      </div>
                      {heat.prBudget > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86198f', fontWeight: 700 }}>
                          <span>PR:</span>
                          <span>+{heat.prBudget / 1000000}tr</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                          <span>PR:</span>
                          <span>dồn</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Badge trạng thái mức nhiệt */}
                <div style={{ marginTop: '6px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: isCut ? '#e2e8f0' : 'rgba(255, 255, 255, 0.7)',
                    color: heat.text,
                    whiteSpace: 'nowrap'
                  }}>
                    {heat.badge}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CARD TRỰC QUAN: QUỸ DỒN BÁO CHÍ PR THEO QUÝ (30.000.000 Đ) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #fdf4ff 0%, #f5f3ff 100%)',
        border: '1.5px solid #d946ef',
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(217, 70, 239, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Newspaper size={20} color="#86198f" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#581c87' }}>
              Cơ Chế "Quỹ Dồn Ngân Sách PR Theo Quý" — 3 Đòn Bẩy Báo Chí Uy Tín
            </h3>
          </div>
          <span style={{ fontSize: '0.76rem', background: '#fae8ff', color: '#86198f', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', border: '1px solid #f0abfc' }}>
            Tổng Quỹ PR Báo Chí: 30.000.000 đ
          </span>
        </div>

        <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#701a75', lineHeight: 1.5 }}>
          Thay vì rải vụn 2 - 3 triệu mỗi tháng (không đủ ngân sách book bài uy tín), FIT Tour áp dụng chiến lược <strong>Quarterly Budget Pooling</strong>: Tiết kiệm ngân sách hàng tháng để gom thành <strong>3 Cú Hích PR Báo Chí B2B (mỗi đợt 10 triệu)</strong> tại 3 điểm rơi quyết định. Link bài báo làm bảo chứng tín nhiệm (Social Proof) nhúng vào hồ sơ năng lực thầu B2B phục vụ Sales chào khách cả năm.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {/* Cú hích 1 */}
          <div style={{ background: '#ffffff', border: '1.5px solid #f0abfc', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', background: '#fdf4ff', color: '#86198f', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                💥 CÚ HÍCH 1 • THÁNG 3
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#86198f' }}>10.000.000 đ</span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
              Bài PR Báo Chí B2B (Đón Hè & Teambuilding)
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
              Chủ đề: <em>"Xu hướng Doanh nghiệp đặt Tour Hè & Company Trip sớm 2026"</em>. Định vị FIT Tour là thương hiệu dẫn đầu lữ hành đoàn thể cao cấp.
            </p>
          </div>

          {/* Cú hích 2 */}
          <div style={{ background: '#ffffff', border: '1.5px solid #fed7aa', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', background: '#fff7ed', color: '#ea580c', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                💥 CÚ HÍCH 2 • THÁNG 7
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ea580c' }}>10.000.000 đ</span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
              Bài PR Báo Chí B2B (Đón Mùa Thu & Thẩm Định Thầu)
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
              Chủ đề: <em>"Kinh nghiệm thẩm định hồ sơ thầu & chọn đơn vị lữ hành uy tín cho Company Trip Mùa Thu"</em>. Tăng điểm tín nhiệm khi đấu thầu.
            </p>
          </div>

          {/* Cú hích 3 */}
          <div style={{ background: '#ffffff', border: '1.5px solid #fde68a', borderRadius: '8px', padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                💥 CÚ HÍCH 3 • THÁNG 10
              </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#b45309' }}>10.000.000 đ</span>
            </div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
              Bài PR Báo Chí B2B (Đón Sóng Year-End Party & Gala)
            </div>
            <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', lineHeight: 1.35 }}>
              Chủ đề: <em>"Giải pháp tổ chức Year-End Party & Gala Dinner tri ân khách hàng đỉnh cao cuối năm"</em>. Chốt các hợp đồng tiệc tất niên lớn.
            </p>
          </div>
        </div>
      </div>

      {/* ── 4. THANH ĐIỀU HƯỚNG BỘ LỌC THEO MÙA VỤ ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Mùa Vụ Trọng Điểm:
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {SEASON_FILTERS.map((s) => {
              const isActive = selectedSeason === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeason(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: isActive ? '2px solid #86198f' : '1px solid #cbd5e1',
                    background: isActive ? '#fdf4ff' : '#f8fafc',
                    color: isActive ? '#86198f' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <span>{s.label}</span>
                  <span style={{
                    fontSize: '0.68rem',
                    background: isActive ? '#86198f' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontWeight: 600
                  }}>
                    {s.countText}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Nút Nhảy Tới Máy Tính Dự Toán */}
        <a
          href="#b2b-calculator-section"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#86198f',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
            boxShadow: '0 2px 4px rgba(134, 25, 143, 0.25)'
          }}
        >
          <Calculator size={15} />
          <span>Mở Máy Tính Phễu B2B</span>
        </a>
      </div>

      {/* ── 5. TRỤC TIMELINE 12 THÁNG "ĐÓN ĐẦU 02 THÁNG" (TRUNG TÂM KẾ HOẠCH) ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              Trục Kế Hoạch 12 Tháng & Ma Trận Phân Bổ Ngân Sách BU3 Năm 2027
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
              Đang hiển thị {filteredMonths.length} tháng • Tổng ngân sách lọc: <strong>{fmt(summaryMetrics.totalBudget)} đ</strong> • Kỳ vọng thu hút: <strong>{summaryMetrics.totalInquiries} Lead Doanh Nghiệp (Inquiry)</strong>.
            </p>
          </div>
        </div>

        {/* BẢNG TIMELINE CHI TIẾT 12 THÁNG — BỐ CỤC 2 THÁNG 1 HÀNG */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '12px',
          alignItems: 'stretch'
        }}>
          {filteredMonths.map((m) => {
            const isCut = m.budget === 0;
            const isExpanded = expandedMonth === m.month;

            return (
              <div
                key={m.month}
                id={`month-card-${m.month}`}
                style={{
                  background: '#ffffff',
                  border: isCut ? '1px dashed #cbd5e1' : `1.5px solid ${m.borderTheme}`,
                  borderRadius: '10px',
                  padding: '14px 16px',
                  boxShadow: isCut ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.03)',
                  transition: 'all 0.15s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%'
                }}
              >
                {/* Phần trên: Tháng chạy & Đón đoàn & Ghi chú */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                    <div style={{
                      background: isCut ? '#f1f5f9' : m.bgTheme,
                      color: isCut ? '#64748b' : m.colorTheme,
                      border: `1px solid ${isCut ? '#cbd5e1' : m.borderTheme}`,
                      borderRadius: '8px',
                      padding: '6px 12px',
                      textAlign: 'center',
                      minWidth: '64px',
                      flexShrink: 0
                    }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase' }}>Chạy Ads</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2 }}>T{m.month}</div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px', minHeight: '26px' }}>
                        <span style={{
                          background: isCut ? '#f1f5f9' : m.bgTheme,
                          color: isCut ? '#475569' : m.colorTheme,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          whiteSpace: 'nowrap'
                        }}>
                          {m.seasonIcon} {m.seasonName}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                          → Đón đoàn: <strong style={{ color: '#0f172a' }}>{m.executionMonth}</strong>
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.76rem',
                        color: '#64748b',
                        lineHeight: 1.45,
                        minHeight: '48px',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {m.leadTimeNote}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hàng chỉ số: NGÂN SÁCH + LEAD DN (ĐÃ BỎ HỢP ĐỒNG ĐOÀN VÀ DOANH THU) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
                    {/* Ngân sách */}
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Ngân Sách</div>
                      <div style={{
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        color: isCut ? '#64748b' : '#86198f'
                      }}>
                        {fmt(m.budget)} đ
                      </div>
                    </div>

                    {/* Kỳ vọng Lead DN */}
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Lead Doanh Nghiệp</div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                        {isCut ? '0 Lead' : `${m.expectedInquiries} Lead DN`}
                      </div>
                    </div>
                  </div>

                  {/* Nút Xem chi tiết phân bổ kênh */}
                  <button
                    onClick={() => setExpandedMonth(isExpanded ? null : m.month)}
                    style={{
                      background: isExpanded ? '#86198f' : '#f8fafc',
                      color: isExpanded ? '#ffffff' : '#86198f',
                      border: '1px solid #d946ef',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {isExpanded ? 'Thu gọn ▲' : 'Chi tiết kênh ▼'}
                  </button>
                </div>

                {/* Phần mở rộng chi tiết phân bổ kênh (Accordion) */}
                {isExpanded && (
                  <div style={{
                    marginTop: '10px',
                    paddingTop: '10px',
                    borderTop: '1px dashed #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
                      Thị Trường Mục Tiêu & Cơ Cấu Kênh Trong Tháng:
                    </div>

                    {/* Thị trường mục tiêu */}
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {m.targetMarkets.map((t, tIdx) => (
                        <span key={tIdx} style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          color: '#334155',
                          fontSize: '0.7rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: 500
                        }}>
                          📍 {t}
                        </span>
                      ))}
                    </div>

                    {/* Chi tiết từng kênh quảng cáo */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      marginTop: '4px'
                    }}>
                      {m.channels.map((c, cIdx) => (
                        <div key={cIdx} style={{
                          background: '#fdf4ff',
                          border: '1px solid #f0abfc',
                          borderRadius: '6px',
                          padding: '8px 10px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#701a75' }}>{c.name}</span>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#86198f' }}>
                              {fmt(c.budget)} đ {c.pct && `(${c.pct})`}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', lineHeight: 1.35 }}>
                            {c.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. PHÂN TÍCH 2 PHÂN HỆ THỊ TRƯỜNG CỐT LÕI BU3 ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* Module 1: Thị trường Nước Ngoài + Theo Mùa */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #d946ef',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(217, 70, 239, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>✈️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                1. Thị Trường Nước Ngoài (Theo Mùa Vụ)
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                Đoàn công ty, MICE khen thưởng, hội nghị khách hàng VIP
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 700, color: '#e11d48' }}>🌸 Mùa Hoa Anh Đào (Tháng 3 + 4)</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>
                <strong>Thị trường:</strong> Trung Quốc, Hàn Quốc, Nhật Bản, Đài Loan.<br />
                <strong>Thời điểm chạy Ads:</strong> Tháng 1 + 2 (Chạy trước để hoàn tất Visa đoàn).
              </div>
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 700, color: '#d97706' }}>☀️ Mùa Hè Cao Điểm (Tháng 5 - 9)</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>
                <strong>Thị trường:</strong> Trung / Hàn / Nhật / Đài / Đông Nam Á (Thái Lan, Sing-Mã).<br />
                <strong>Thời điểm chạy Ads:</strong> Tháng 3 đến Tháng 7 (Dồn ngân sách cao nhất năm: 90 triệu).
              </div>
            </div>

            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 700, color: '#ea580c' }}>🍁 Mùa Thu Lá Đỏ (Tháng 9 - 11)</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>
                <strong>Thị trường:</strong> Cửu Trại Câu, Bắc Kinh, Nhật Bản, Hàn Quốc.<br />
                <strong>Thời điểm chạy Ads:</strong> Tháng 7, 8, 9 (Đón sóng hội thảo kết hợp ngắm sắc thu).
              </div>
            </div>
          </div>
        </div>

        {/* Module 2: Thị trường Trong Nước Teambuilding & YEP */}
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #0284c7',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.4rem' }}>🏖️</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                2. Thị Trường Trong Nước (Teambuilding & YEP)
              </h3>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#64748b' }}>
                Company Trip, Teambuilding bãi biển & Gala Dinner tất niên
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.82rem' }}>
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 700, color: '#0284c7' }}>🏖️ Teambuilding & Company Trip (Tháng 3-4 & Tháng 6-9)</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>
                <strong>Địa điểm:</strong> Phú Quốc, Đà Nẵng, Nha Trang, Quy Nhơn, Hồ Tràm, Hạ Long.<br />
                <strong>Quy mô đoàn:</strong> 50 - 300 khách. Trọng tâm: Kịch bản Teambuilding độc quyền FIT Tour.
              </div>
            </div>

            <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 700, color: '#b45309' }}>🥂 Year-End Party & Tri Ân Đối Tác (Tháng 12 - Tháng 01)</div>
              <div style={{ color: '#475569', marginTop: '2px' }}>
                <strong>Dịch vụ:</strong> Gala Dinner trọn gói, Concept tiệc tất niên độc bản, Tour cao cấp tri ân VIP.<br />
                <strong>Thời điểm chạy Ads:</strong> Tháng 10, 11 (đại cao điểm chốt thầu) và Tháng 12 (chốt vét SME). Tháng 1 vận hành đại tiệc & Tháng 2 cắt sạch ads nghỉ Tết.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px' }}>
              <div style={{ fontWeight: 700, color: '#475569' }}>📰 Chiến Lược Booking Báo Chí & PR Profile</div>
              <div style={{ color: '#64748b', marginTop: '2px' }}>
                Đăng các bài viết PR Báo chí B2B uy tín (30 triệu / năm gồm 3 cú hích 10 triệu) nhằm tạo uy tín đấu thầu hồ sơ năng lực B2B cho FIT Tour & Elite BU3 khi chào giá các tập đoàn lớn.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 7. MÁY TÍNH DỰ TOÁN B2B PHỄU CHUYỂN ĐỔI DOANH NGHIỆP ── */}
      <div
        id="b2b-calculator-section"
        style={{
          background: '#ffffff',
          border: '2px solid #86198f',
          borderRadius: '12px',
          padding: '24px 28px',
          boxShadow: '0 4px 16px rgba(134, 25, 143, 0.12)',
          marginBottom: '28px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={22} color="#86198f" />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
                Máy Tính Phễu B2B — Dự Toán Chuyển Đổi Hợp Đồng Đoàn
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Mô hình tính toán dựa trên số lượng Lead Doanh Nghiệp (Inquiry) → Tỷ lệ chốt hợp đồng đoàn (Won Deals) → Quy mô đoàn → Doanh thu & Tỷ lệ chi phí Ads.
            </p>
          </div>

          <button
            onClick={() => {
              setCalcBudget(150000000);
              setCalcCpl(800000);
              setCalcWinRate(20);
              setCalcPaxPerDeal(45);
              setCalcTicketPrice(12000000);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#fdf4ff',
              color: '#86198f',
              border: '1px solid #f0abfc',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} />
            <span>Khôi phục mặc định</span>
          </button>
        </div>

        {/* Khối Nhập Tham Số */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          background: '#faf5ff',
          border: '1px solid #e9d5ff',
          borderRadius: '8px',
          padding: '16px 20px',
          marginBottom: '20px'
        }}>
          {/* Tham số 1: Ngân sách */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#581c87', textTransform: 'uppercase', marginBottom: '6px' }}>
              1. Ngân Sách Dự Kiến (VNĐ)
            </label>
            <input
              type="text"
              value={calcBudget ? fmt(calcBudget) : ''}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setCalcBudget(raw ? Number(raw) : 0);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #d8b4fe',
                borderRadius: '6px',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#86198f',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#7e22ce', marginTop: '6px' }}>
              Mặc định: 150.000.000 đ/năm
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                onClick={() => setCalcBudget(150000000)}
                style={{ fontSize: '0.65rem', background: '#f3e8ff', color: '#7e22ce', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                150M Cả năm
              </button>
              <button
                onClick={() => setCalcBudget(90000000)}
                style={{ fontSize: '0.65rem', background: '#fef3c7', color: '#b45309', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                90M Hè
              </button>
              <button
                onClick={() => setCalcBudget(25000000)}
                style={{ fontSize: '0.65rem', background: '#ffe4e6', color: '#e11d48', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                25M Anh đào
              </button>
            </div>
          </div>

          {/* Tham số 2: CPL Doanh nghiệp */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#581c87', textTransform: 'uppercase', marginBottom: '6px' }}>
              2. Chi Phí / Lead DN (CPL)
            </label>
            <input
              type="text"
              value={calcCpl ? fmt(calcCpl) : ''}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setCalcCpl(raw ? Number(raw) : 0);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #d8b4fe',
                borderRadius: '6px',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#7e22ce', marginTop: '6px' }}>
              TB B2B: ~700k - 1.000k/Inquiry
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                onClick={() => setCalcCpl(700000)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                700k
              </button>
              <button
                onClick={() => setCalcCpl(800000)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                800k
              </button>
              <button
                onClick={() => setCalcCpl(1000000)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                1.000k
              </button>
            </div>
          </div>

          {/* Tham số 3: Tỷ lệ chốt hợp đồng */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#581c87', textTransform: 'uppercase', marginBottom: '6px' }}>
              3. Tỷ Lệ Chốt Thầu / Hợp Đồng (%)
            </label>
            <input
              type="number"
              step={1}
              min={1}
              max={100}
              value={calcWinRate}
              onChange={(e) => setCalcWinRate(Number(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #d8b4fe',
                borderRadius: '6px',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#16a34a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#7e22ce', marginTop: '6px' }}>
              TB chốt thầu đoàn: 18% - 25%
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                onClick={() => setCalcWinRate(18)}
                style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                18%
              </button>
              <button
                onClick={() => setCalcWinRate(20)}
                style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                20%
              </button>
              <button
                onClick={() => setCalcWinRate(25)}
                style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                25%
              </button>
            </div>
          </div>

          {/* Tham số 4: Quy mô đoàn TB */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#581c87', textTransform: 'uppercase', marginBottom: '6px' }}>
              4. Quy Mô Đoàn TB (Khách/Đoàn)
            </label>
            <input
              type="number"
              step={5}
              min={1}
              value={calcPaxPerDeal}
              onChange={(e) => setCalcPaxPerDeal(Number(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #d8b4fe',
                borderRadius: '6px',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#7e22ce', marginTop: '6px' }}>
              Đoàn công ty: 35 - 80 Pax
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                onClick={() => setCalcPaxPerDeal(35)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                35 Pax
              </button>
              <button
                onClick={() => setCalcPaxPerDeal(45)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                45 Pax
              </button>
              <button
                onClick={() => setCalcPaxPerDeal(60)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                60 Pax
              </button>
            </div>
          </div>

          {/* Tham số 5: Giá tour TB / khách */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#581c87', textTransform: 'uppercase', marginBottom: '6px' }}>
              5. Giá Tour TB / Khách (VNĐ)
            </label>
            <input
              type="text"
              value={calcTicketPrice ? fmt(calcTicketPrice) : ''}
              placeholder="0"
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setCalcTicketPrice(raw ? Number(raw) : 0);
              }}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #d8b4fe',
                borderRadius: '6px',
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0284c7',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ fontSize: '0.7rem', color: '#7e22ce', marginTop: '6px' }}>
              Tour QT: ~12-16M • Tour NĐ: ~4.5M
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                onClick={() => setCalcTicketPrice(12000000)}
                style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                12M ĐNÁ/TQ
              </button>
              <button
                onClick={() => setCalcTicketPrice(16000000)}
                style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                16M Nhật/Hàn
              </button>
              <button
                onClick={() => setCalcTicketPrice(4500000)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                4.5M Nội địa
              </button>
            </div>
          </div>
        </div>

        {/* Khối Kết Quả Dự Toán */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
          border: '1.5px solid #d946ef',
          borderRadius: '10px',
          padding: '18px 22px'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#86198f', textTransform: 'uppercase', fontWeight: 600 }}>Lead DN Dự Kiến</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#701a75', marginTop: '2px' }}>
              {calcResult.inquiries} Lead
            </div>
            <div style={{ fontSize: '0.7rem', color: '#a21caf' }}>Chi phí {fmt(calcCpl)} đ / Inquiry</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#86198f', textTransform: 'uppercase', fontWeight: 600 }}>Số Hợp Đồng Chốt (Deals)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
              {calcResult.deals} Hợp Đồng
            </div>
            <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Tỷ lệ chốt: {calcWinRate}%</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#86198f', textTransform: 'uppercase', fontWeight: 600 }}>Tổng Số Khách (Pax)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {fmt(calcResult.totalPax)} Pax
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TB {calcPaxPerDeal} Pax / Hợp đồng</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#86198f', textTransform: 'uppercase', fontWeight: 600 }}>Giá Trị TB / Hợp Đồng</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
              {fmt(calcResult.avgContractValue)} đ
            </div>
            <div style={{ fontSize: '0.7rem', color: '#0369a1' }}>~{(calcResult.avgContractValue / 1000000000).toFixed(2)} Tỷ / Đoàn</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#86198f', textTransform: 'uppercase', fontWeight: 600 }}>Tổng Doanh Thu Kế Hoạch</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
              {fmt(calcResult.totalRevenue)} đ
            </div>
            <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700 }}>
              Tỷ lệ Ads / DT: {calcResult.costRatio}% (Siêu tối ưu)
            </div>
          </div>
        </div>
      </div>

      {/* ── 8. FOOTER ACTION QUAY VỀ ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '0.84rem', color: '#64748b' }}>
          Đề án Kế Hoạch BU3 đã được thiết lập sẵn sàng trên hệ thống nội bộ FIT Tour CRM.
        </div>
        <Link
          to="/marketing-ads?subtab=planning"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#86198f',
            color: '#ffffff',
            padding: '8px 18px',
            borderRadius: '6px',
            fontSize: '0.84rem',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <span>Quay Về Danh Sách Kế Hoạch</span>
          <ArrowRight size={15} />
        </Link>
      </div>

    </div>
  );
}
