import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator,
  Zap, 
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
  Database,
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
const getHeatmapInfo = (budget, channels, isQ4 = false) => {
  const gsaBudget = channels?.find(c => c.name.includes('Google Search Ads'))?.budget || 0;
  const prBudget = channels?.find(c => c.name.includes('PR Báo') || c.name.includes('Quỹ Dồn PR') || c.name.includes('Báo Chí'))?.budget || 0;

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
  const maxRef = isQ4 ? 28000000 : 25000000;
  const pct = Math.round((budget / maxRef) * 100);

  if (budget <= 6000000) {
    return {
      level: 1,
      label: 'Sàn Duy Trì',
      badge: '🌱 Duy trì',
      bg: '#ecfdf5',
      border: '#86efac',
      text: '#047857',
      barColor: '#10b981',
      pct,
      gsaBudget,
      prBudget
    };
  }
  if (budget <= 10000000) {
    return {
      level: 2,
      label: isQ4 ? 'Tăng Tốc Chốt Thầu' : 'Khởi Động Đón Đầu',
      badge: isQ4 ? '🚀 Tăng tốc' : '⚡ Khởi động',
      bg: '#fefce8',
      border: '#fde047',
      text: '#854d0e',
      barColor: '#eab308',
      pct,
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
      pct,
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
    pct,
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
    seasonName: 'Khởi Động Hè Sớm (📰 PR Báo Chí Đợt 1)',
    seasonIcon: '☀️',
    colorTheme: '#f59e0b',
    bgTheme: '#fffbeb',
    borderTheme: '#fde68a',
    targetMarkets: ['Thái Lan (Bangkok - Pattaya)', 'Singapore - Malaysia', 'Trung Quốc Hè', 'Đà Nẵng / Phú Quốc / Nha Trang'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 15000000, pct: '60%', desc: 'Đấu thầu top 1 từ khoá tour hè công ty, teambuilding biển cao cấp' },
      { name: '📰 Quỹ Dồn PR Báo Chí (Đợt 1)', budget: 10000000, pct: '40%', desc: 'Bài PR Báo chí B2B uy tín: "Xu hướng Doanh nghiệp đặt Tour Hè sớm 2026" làm Profile thầu cả năm' }
    ],
    expectedInquiries: 32,
    expectedDeals: 6,
    expectedPax: 270,
    expectedRevenue: 3240000000,
    leadTimeNote: 'Sau Tết 1 tháng: Doanh nghiệp vào guồng, Ban Giám Đốc duyệt ngân sách Hè. Đăng bài PR Báo chí 10M kết hợp 15M GSA đón đỉnh tìm kiếm.'
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
    seasonName: 'Mùa Thu Vàng (📰 PR Báo Chí Đợt 2)',
    seasonIcon: '🍁',
    colorTheme: '#ea580c',
    bgTheme: '#fff7ed',
    borderTheme: '#fed7aa',
    targetMarkets: ['Trung Quốc (Cửu Trại Câu / Bắc Kinh)', 'Hàn Quốc (Đảo Nami)', 'Nhật Bản (Núi Phú Sĩ)', 'Đài Loan'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 10000000, pct: '50%', desc: 'Từ khoá tour mùa thu lá đỏ đoàn công ty (Nhật, Hàn, Cửu Trại Câu)' },
      { name: '📰 Quỹ Dồn PR Báo Chí (Đợt 2)', budget: 10000000, pct: '50%', desc: 'Bài PR Báo chí B2B uy tín: "Kinh nghiệm chọn đơn vị lữ hành uy tín tổ chức tour đoàn thể & thẩm định thầu"' }
    ],
    expectedInquiries: 24,
    expectedDeals: 5,
    expectedPax: 200,
    expectedRevenue: 2400000000,
    leadTimeNote: 'Chạy đón Mùa Thu Vàng (Nhật Bản, Hàn Quốc, Cửu Trại Câu). Đổ 10M GSA kết hợp bài PR Báo chí 10M làm bảo chứng hồ sơ năng lực đấu thầu B2B.'
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
    seasonName: 'Đón Sóng YEP (📰 PR Báo Chí Đợt 3)',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Resort 5 Sao Ven Biển (Phú Quốc/Hồ Tràm)', 'Gala Dinner Trọn Gói', 'Tour Cao Cấp Tri Ân VIP'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 5000000, pct: '33.3%', desc: 'Top từ khoá tổ chức year end party công ty trọn gói' },
      { name: '📰 Quỹ Dồn PR Báo Chí (Đợt 3)', budget: 10000000, pct: '66.7%', desc: 'Bài PR Báo chí B2B & Kinh tế: "Giải pháp tổ chức Gala Dinner & Year-End Party đỉnh cao cuối năm cho Doanh Nghiệp"' }
    ],
    expectedInquiries: 20,
    expectedDeals: 4,
    expectedPax: 180,
    expectedRevenue: 2160000000,
    leadTimeNote: 'Thời điểm các tập đoàn lớn mở thầu địa điểm và concept tiệc Tất Niên cuối năm. Lên bài PR Báo chí 10M kết hợp 5M GSA đón sóng mở thầu.'
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

// ══════════════════════════════════════════════════════════════════════════════
// BỘ DỮ LIỆU KẾ HOẠCH NƯỚC RÚT BU3 — QUÝ 4/2026 (T10 - T12/2026)
// TỔNG NGÂN SÁCH: 28.000.000 Đ (GSA: 23M • PR BÁO CHÍ VTC NEWS: 5M)
// TRỌNG TÂM: CHIẾN DỊCH YEAR-END PARTY & GALA DINNER DOANH NGHIỆP CUỐI NĂM
// ══════════════════════════════════════════════════════════════════════════════
const Q4_MONTHS_DATA = [
  {
    month: 10,
    monthLabel: 'Tháng 10/2026',
    executionMonth: 'Tháng 12/2026 & Tháng 1/2027 (Tiệc YEP & Gala)',
    budget: 12000000,
    status: 'peak',
    seasonKey: 'yep',
    seasonName: 'Đón Sóng Year-End Party (Bài PR Thương Hiệu VTC News 5M)',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Gala Dinner Doanh Nghiệp', 'Resort Hồ Tràm / Phan Thiết / Phú Quốc', 'Tour Tri Ân Đối Tác VIP'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 7000000, pct: '58.3%', desc: 'Top từ khóa: tổ chức year end party trọn gói, gala dinner công ty, đặt tiệc tất niên' },
      { name: 'Bài PR Báo Chí (VTC News)', budget: 5000000, pct: '41.7%', desc: 'Bài PR thương hiệu FIT Tour trên VTC News: "FIT Tour mang đến trải nghiệm riêng cho Tour Công Ty" (xây dựng tài sản thương hiệu lâu dài)' }
    ],
    expectedInquiries: 14,
    expectedDeals: 2,
    expectedPax: 80,
    expectedRevenue: 960000000,
    leadTimeNote: 'Thời điểm các tập đoàn lớn mở thầu địa điểm và concept tiệc Tất Niên cuối năm. Đăng bài PR thương hiệu FIT Tour trên VTC News (5M) kết hợp 7M GSA đón sóng mở thầu ban đầu.',
    actionChecklist: [
      'Tuần 1: Hoàn thiện Profile năng lực "Bộ Sưu Tập Concept YEP 2026" (gửi trực tiếp 200 khách hàng doanh nghiệp cũ).',
      'Tuần 2: Lên bài PR báo điện tử VTC News khẳng định thương hiệu FIT Tour mang đến trải nghiệm riêng Tour Công Ty, làm bảo chứng tín nhiệm thầu lâu dài.',
      'Tuần 3: Bật chiến dịch Google Search Ads ngân sách 7M đón truy vấn thầu YEP sớm.',
      'Tuần 4: Họp chốt danh sách pitching với tối thiểu 10 tập đoàn và tổng công ty tiềm năng.'
    ]
  },
  {
    month: 11,
    monthLabel: 'Tháng 11/2026',
    executionMonth: 'Tháng 12/2026 & Tháng 1/2027 (Đại cao điểm chốt thầu)',
    budget: 10000000,
    status: 'peak',
    seasonKey: 'yep',
    seasonName: 'Đại Cao Điểm Chốt Thầu YEP (Hỏa Lực 10M GSA)',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Tiệc Tất Niên Doanh Nghiệp', 'Gala Dinner Trọn Gói Sân Khấu', 'Company Trip Biển Cận Tết'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 10000000, pct: '100%', desc: 'Đấu thầu hỏa lực tập trung toàn bộ từ khóa: đặt tiệc tất niên, công ty tổ chức YEP uy tín, tiệc công ty cuối năm' }
    ],
    expectedInquiries: 18,
    expectedDeals: 3,
    expectedPax: 120,
    expectedRevenue: 1440000000,
    leadTimeNote: 'Tháng chốt hợp đồng nước rút cho các tiệc YEP Tháng 12 và Tháng 1. Hỏa lực 10M GSA tập trung chuyển đổi các doanh nghiệp đang chốt phương án tiệc.',
    actionChecklist: [
      'Tuần 1: Đẩy mạnh ngân sách GSA lên tối đa, tập trung khung giờ 8h30 - 11h30 và 14h - 17h (giờ làm việc hành chính của HR/Admin).',
      'Tuần 2: Khảo sát địa điểm (Site Inspection) trực tiếp cùng khách hàng tại các khách sạn/resort đối tác.',
      'Tuần 3: Đàm phán và chốt ký hợp đồng ít nhất 3 đoàn trọng điểm (40 - 100 khách).',
      'Tuần 4: Chốt hợp đồng các đoàn Company Trip kết hợp Gala khởi hành Tháng 12.'
    ]
  },
  {
    month: 12,
    monthLabel: 'Tháng 12/2026',
    executionMonth: 'Tháng 1/2027 (Chốt vét YEP trước Tết Âm)',
    budget: 6000000,
    status: 'normal',
    seasonKey: 'yep',
    seasonName: 'Chốt Vét YEP SME & Vận Hành Đợt 1 (6M GSA)',
    seasonIcon: '🥂',
    colorTheme: '#d97706',
    bgTheme: '#fef3c7',
    borderTheme: '#fde68a',
    targetMarkets: ['Gala YEP phút chót (SME)', 'Tiệc Tất Niên Doanh Nghiệp Cận Tết', 'Tour Tri Ân Khách VIP Tháng 1'],
    channels: [
      { name: 'Google Search Ads (GSA)', budget: 6000000, pct: '100%', desc: 'Top từ khóa đặt tiệc tất niên gấp, gala dinner trọn gói tháng 1 cận Tết' }
    ],
    expectedInquiries: 8,
    expectedDeals: 2,
    expectedPax: 70,
    expectedRevenue: 840000000,
    leadTimeNote: 'Vừa vận hành các tiệc YEP Tháng 12, vừa giữ 6M GSA chốt vét các doanh nghiệp SME tìm địa điểm và concept tiệc muộn cho Tháng 1 cận Tết.',
    actionChecklist: [
      'Tuần 1 - 2: Vận hành trơn tru các tiệc Gala Dinner tổ chức trong Tháng 12 Dương lịch.',
      'Tuần 2 - 3: Giữ GSA 6M chốt vét các công ty SME chốt tiệc cận Tết Âm (Tháng 1).',
      'Tuần 4: Đóng toàn bộ chiến dịch Ads, tập trung dồn 100% nhân sự chuẩn bị vận hành các sự kiện cao điểm Tháng 1.'
    ]
  }
];

// 3 Trụ Cột Sản Phẩm Chiến Lược Của BU3 Trong Quý 4/2026
const Q4_PRODUCTS = [
  {
    id: 'prod-yep-gala',
    title: 'Gala Dinner & Year-End Party Concept Độc Bản',
    icon: '🥂',
    badge: 'Trọng Tâm Số 1 (70% Doanh Thu)',
    themeColor: '#d97706',
    targetClients: 'Doanh nghiệp 50 - 300 khách (Khối SME, Ngân hàng, Công nghệ, BĐS)',
    description: 'Giải pháp tiệc tất niên trọn gói từ A-Z: Khảo sát địa điểm khách sạn/resort 4-5 sao, viết kịch bản cá nhân hóa theo văn hóa thương hiệu, âm thanh ánh sáng màn hình LED đỉnh cao, MC chuyên nghiệp và vũ đoàn.',
    keySellingPoints: [
      'Concept độc bản không trùng lặp (Game tương tác, Tri ân, Khởi sắc)',
      'Quan hệ đối tác trực tiếp với các Trung tâm hội nghị & Resort giá tốt',
      'Đội ngũ điều hành hiện trường 1:1, xử lý sự cố trong 5 phút'
    ],
    priceRange: '1.200.000 – 2.500.000 đ/k (Tiệc riêng) • Gói trọn gói 10 – 15 Tr/k',
    targetDeals: '3 - 4 Đoàn (~170 khách) • DT: ~2.04 Tỷ VNĐ'
  },
  {
    id: 'prod-trip-bien',
    title: 'Company Trip Biển & Resort Cận Tết (2N1Đ / 3N2Đ)',
    icon: '🏖️',
    badge: 'Gói Kết Hợp Teambuilding',
    themeColor: '#0284c7',
    targetClients: 'Các công ty kết hợp nghỉ dưỡng thưởng Tết cho toàn thể nhân viên',
    description: 'Chương trình du lịch ngắn ngày ven biển: Teambuilding bãi biển vui nhộn gắn kết buổi chiều, tiệc Gala Dinner ấm cúng tại khán phòng sang trọng buổi tối. Thời gian di chuyển nhanh dưới 2-3 giờ.',
    keySellingPoints: [
      'Tuyến điểm gần: Hồ Tràm, Phan Thiết, Vũng Tàu, Long Hải, Phú Quốc',
      'Xe Limousine / Universe đời mới phục vụ suốt tuyến',
      'Kịch bản Teambuilding bản quyền độc quyền của FIT Tour'
    ],
    priceRange: '2.800.000 – 5.500.000 đ/k (Tour 2N1Đ – 3N2Đ)',
    targetDeals: '2 Đoàn (~80 khách) • DT: ~760 Triệu VNĐ'
  },
  {
    id: 'prod-mice-vip',
    title: 'Tour MICE & Tri Ân Khách Hàng VIP / Đối Tác',
    icon: '✈️',
    badge: 'Dòng Cao Cấp Thượng Lưu',
    themeColor: '#86198f',
    targetClients: 'Ban Lãnh đạo, Đại lý xuất sắc, Cổ đông và Khách hàng VIP',
    description: 'Hành trình đẳng cấp quốc tế hoặc trong nước chuẩn 5 sao dành cho nhóm nhỏ lãnh đạo: Thái Lan nghỉ dưỡng riêng tư, Đài Loan mùa thu đông, Singapore kết hợp hội nghị, Trung Quốc mùa thu sang đông.',
    keySellingPoints: [
      'Dịch vụ VIP: Khách sạn 5 sao quốc tế, ẩm thực Michelin/Fine Dining',
      'Quà tặng độc bản và xe sang đưa đón chuyên biệt',
      'Hướng dẫn viên và Quản lý tour cao cấp kinh nghiệm trên 10 năm'
    ],
    priceRange: '15.000.000 – 35.000.000 đ/k (Tuyến VIP 5 sao)',
    targetDeals: '1 Đoàn VIP (~20 khách) • DT: ~440 Triệu VNĐ'
  }
];

const SEASON_FILTERS = [
  { id: 'all', label: 'Tất Cả 12 Tháng', icon: '📅', countText: '12 Tháng • 150 Triệu' },
  { id: 'summer', label: '☀️ Mùa Hè & Teambuilding (T5-T9)', icon: '☀️', countText: 'Chạy T3-T6 • 80 Triệu' },
  { id: 'autumn', label: '🍁 Mùa Thu Vàng (T9-T11)', icon: '🍁', countText: 'Chạy T7-T9 • 30 Triệu' },
  { id: 'yep', label: '🥂 Year-End Party & Gala Cận Tết (T12-T1)', icon: '🥂', countText: 'Chạy T10-T12 & T1 • 40 Triệu' },
  { id: 'cut', label: '🛑 Kỳ Nghỉ Tết Âm Lịch (Cắt Ads)', icon: '🛑', countText: 'Tháng 2 • 0 VNĐ' }
];

export default function BU3MarketPlanningPage() {
  const [searchParams] = useSearchParams();
  const [activeCycle, setActiveCycle] = useState(() => {
    const c = searchParams.get('cycle');
    if (c === '2027' || c === 'year_2027') return 'year_2027';
    return 'q4_2026';
  });
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [isPrinciplesOpen, setIsPrinciplesOpen] = useState(false);

  const isQ4 = activeCycle === 'q4_2026';

  // State Máy tính B2B Phễu Doanh Nghiệp
  const [calcBudget, setCalcBudget] = useState(() => {
    const c = searchParams.get('cycle');
    return (c === '2027' || c === 'year_2027') ? 150000000 : 28000000;
  });
  const [calcCpl, setCalcCpl] = useState(() => {
    const c = searchParams.get('cycle');
    return (c === '2027' || c === 'year_2027') ? 800000 : 700000;
  });
  const [calcWinRate, setCalcWinRate] = useState(() => {
    const c = searchParams.get('cycle');
    return (c === '2027' || c === 'year_2027') ? 20 : 16;
  });
  const [calcPaxPerDeal, setCalcPaxPerDeal] = useState(45);
  const [calcTicketPrice, setCalcTicketPrice] = useState(12000000);

  const handleSwitchCycle = (newCycle) => {
    setActiveCycle(newCycle);
    if (newCycle === 'q4_2026') {
      setCalcBudget(28000000);
      setCalcCpl(700000);
      setCalcWinRate(16);
    } else {
      setCalcBudget(150000000);
      setCalcCpl(800000);
      setCalcWinRate(20);
    }
    const url = new URL(window.location);
    url.searchParams.set('cycle', newCycle === 'q4_2026' ? 'q4_2026' : '2027');
    window.history.replaceState({}, '', url);
  };

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

  // Lọc danh sách tháng theo chu kỳ đang chọn
  const filteredMonths = useMemo(() => {
    if (isQ4) return Q4_MONTHS_DATA;
    if (selectedSeason === 'all') return MONTHS_DATA;
    if (selectedSeason === 'autumn') {
      return MONTHS_DATA.filter(m => m.seasonKey === 'autumn' || m.month === 7);
    }
    return MONTHS_DATA.filter(m => m.seasonKey === selectedSeason);
  }, [isQ4, selectedSeason]);

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

      {/* ── SELECTOR CHUYỂN ĐỔI CHU KỲ: Q4/2026 vs CẢ NĂM 2027 ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff',
        border: '1.5px solid #e9d5ff',
        borderRadius: '12px',
        padding: '10px 14px',
        marginBottom: '18px',
        boxShadow: '0 2px 8px rgba(134, 25, 143, 0.06)',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#86198f', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Chọn Chu Kỳ Kế Hoạch:
          </span>
          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
            (Chuyển đổi tức thời giữa Chiến dịch Nước Rút Q4/2026 và Đề Án Cả Năm 2027)
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleSwitchCycle('q4_2026')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: isQ4 ? '2px solid #86198f' : '1px solid #cbd5e1',
              background: isQ4 ? 'linear-gradient(135deg, #fae8ff 0%, #fdf4ff 100%)' : '#f8fafc',
              color: isQ4 ? '#86198f' : '#475569',
              fontSize: '0.84rem',
              fontWeight: isQ4 ? 800 : 600,
              cursor: 'pointer',
              boxShadow: isQ4 ? '0 2px 6px rgba(134, 25, 143, 0.18)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>⚡ Quý 4/2026 — Nước Rút YEP (28 Triệu)</span>
            {isQ4 && <span style={{ background: '#86198f', color: '#fff', fontSize: '0.66rem', padding: '1px 6px', borderRadius: '10px' }}>Đang xem</span>}
          </button>

          <button
            onClick={() => handleSwitchCycle('year_2027')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '8px 16px',
              borderRadius: '8px',
              border: !isQ4 ? '2px solid #86198f' : '1px solid #cbd5e1',
              background: !isQ4 ? 'linear-gradient(135deg, #fae8ff 0%, #fdf4ff 100%)' : '#f8fafc',
              color: !isQ4 ? '#86198f' : '#475569',
              fontSize: '0.84rem',
              fontWeight: !isQ4 ? 800 : 600,
              cursor: 'pointer',
              boxShadow: !isQ4 ? '0 2px 6px rgba(134, 25, 143, 0.18)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            <span>📅 Cả Năm 2027 — Đề Án Chuẩn (150 Triệu)</span>
            {!isQ4 && <span style={{ background: '#86198f', color: '#fff', fontSize: '0.66rem', padding: '1px 6px', borderRadius: '10px' }}>Đang xem</span>}
          </button>
        </div>
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
              {isQ4 ? '⚡ Kế Hoạch Nước Rút Quý 4/2026 (T10 - T12/2026)' : '📅 Kế Hoạch Chuẩn Cả Năm 2027 (12 Tháng)'}
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
            {isQ4 
              ? 'Kế Hoạch Nước Rút & Dự Toán Ngân Sách BU3 Quý 4/2026 — 28.000.000 đ' 
              : 'Đề Án & Dự Toán Ngân Sách BU3 Năm 2027 — 150.000.000 đ'}
          </h1>
          <p style={{ margin: '0 0 20px', fontSize: '0.94rem', color: '#f5d0fe', maxWidth: '920px', lineHeight: '1.6' }}>
            {isQ4
              ? 'Chiến dịch tập trung hỏa lực 3 tháng cuối năm (Tháng 10, 11, 12) đánh chiếm thị trường Year-End Party (YEP), Gala Dinner doanh nghiệp và Company Trip biển kết hợp tri ân đối tác VIP đón Tết Nguyên Đán. Tổng ngân sách 28 Triệu (23M Google Search Ads + 5M Bài PR Báo Chí VTC News trong Tháng 10).'
              : 'Khung phân bổ ngân sách Marketing cả năm 2027 theo chu kỳ mùa vụ cho 2 thị trường trọng tâm: (1) Nước ngoài theo mùa (Hoa anh đào, Hè, Thu) và (2) Teambuilding & Company Trip trong nước (Tháng 3-4, 6-9, và Year-End Party Tháng 12 - Tháng 01). Tập trung duy trì Google Search Ads (GSA), Booking Báo Chí uy tín và cắt triệt để ngân sách vào Tháng 2 (Kỳ nghỉ Tết Âm lịch & Tháng Giêng) để tối ưu dòng tiền.'}
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
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>
                {isQ4 ? 'Tổng Ngân Sách Q4' : 'Tổng Ngân Sách MKT Năm'}
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8', marginTop: '3px' }}>
                {isQ4 ? '28.000.000 đ' : '150.000.000 đ'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d8b4fe' }}>
                {isQ4 ? 'T10: 12M • T11: 10M • T12: 6M' : 'TB 12.5M/tháng • 3 Làn sóng cao điểm'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>Kỳ Vọng Lead Doanh Nghiệp</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#facc15', marginTop: '3px' }}>
                {isQ4 ? '38 - 40 Lead DN' : '180 - 220 Lead DN'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d8b4fe' }}>
                {isQ4 ? 'Yêu cầu báo giá YEP & Gala Đoàn' : 'Inquiries / Yêu cầu báo giá đoàn'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>Mục Tiêu Hợp Đồng Đoàn</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4ade80', marginTop: '3px' }}>
                {isQ4 ? '6 - 7 Đoàn' : '36 - 45 Đoàn'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#d8b4fe' }}>
                {isQ4 ? 'Quy mô TB 40 Pax/Đoàn (~260 - 280 Pax)' : 'Quy mô TB 40-50 Pax/Đoàn (~1.800 Pax)'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.72rem', color: '#e9d5ff', textTransform: 'uppercase', fontWeight: 600 }}>Doanh Thu Dự Kiến Đoàn</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginTop: '3px' }}>
                {isQ4 ? '~3.24 Tỷ VNĐ' : '~21.6 Tỷ VNĐ'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#4ade80', fontWeight: 600 }}>
                {isQ4 ? 'Tỷ lệ Chi phí Ads / DT: ~0.86%' : 'Tỷ lệ Chi phí Ads / DT: ~0.69%'}
              </div>
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
                ① Chạy đón trước 02 tháng • ② Cân đối dồn tiền & Tháng 2 cắt 0đ • ③ GSA Always-on • ④ PR Báo chí uy tín (VTC News) làm Profile thầu
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
                  Không rải đều 12.5M mỗi tháng. Dồn ngân sách cao nhất vào <strong>Tháng 3 (25M)</strong>, <strong>Tháng 4-5 (20M/tháng)</strong> và <strong>Tháng 10-11 (15M/tháng)</strong>. <strong>Tháng 2 cắt sạch 0đ</strong> vì trùng kỳ nghỉ Tết Âm lịch & Tháng Giêng du xuân.
                </p>
              </div>

              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#1d4ed8', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <Search size={16} />
                  <span>3. Google Search Ads (Always-on)</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#1e40af', lineHeight: '1.5' }}>
                  Duy trì Google Search Ads liên tục để đón trúng khách hàng doanh nghiệp đang chủ động gõ tìm kiếm tour đoàn, teambuilding, Company Trip, Gala YEP trên Google.
                </p>
              </div>

              <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#047857', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <Award size={16} />
                  <span>4. Ngân Sách PR Báo Chí Uy Tín</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#065f46', lineHeight: '1.5' }}>
                  Không rải vụn ngân sách cho PR vì không đủ book báo uy tín. Gom ngân sách thành các bài <strong>PR Báo Chí B2B uy tín</strong> (như VTC News, CafeF...) làm Profile bảo chứng thầu phục vụ Sales chốt khách!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── BẢN ĐỒ NHIỆT PHÂN BỔ NGÂN SÁCH (HEATMAP MATRIX) ── */}
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
                {isQ4 
                  ? 'Bản Đồ Nhiệt Phân Bổ Ngân Sách Quý 4/2026 (T10 - T12/2026) — 28 Triệu' 
                  : 'Bản Đồ Nhiệt Phân Bổ Ngân Sách 12 Tháng Năm 2027 (Yearly Budget Heatmap)'}
              </h3>
              <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                {isQ4
                  ? 'Trực quan hóa mật độ dồn ngân sách 3 tháng nước rút YEP cuối năm — Bấm vào tháng để cuộn nhanh'
                  : 'Trực quan hóa mật độ dồn ngân sách cả năm — Bấm vào tháng bất kỳ để cuộn nhanh đến bảng kế hoạch chi tiết'}
              </p>
            </div>
          </div>

          {/* Quick Summary Pill Tags */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.74rem', background: '#eff6ff', color: '#1d4ed8', fontWeight: 700, padding: '4px 10px', borderRadius: '16px', border: '1px solid #bfdbfe' }}>
              🔍 Ads: {isQ4 ? '23.000.000 đ (82.1%)' : '120.000.000 đ (80%)'}
            </span>
            <span style={{ fontSize: '0.74rem', background: '#fdf4ff', color: '#86198f', fontWeight: 700, padding: '4px 10px', borderRadius: '16px', border: '1px solid #f0abfc' }}>
              📰 PR Báo Chí (VTC News): {isQ4 ? '5.000.000 đ (17.9%)' : '30.000.000 đ (20%)'}
            </span>
            <span style={{ fontSize: '0.74rem', background: '#f0fdf4', color: '#15803d', fontWeight: 800, padding: '4px 10px', borderRadius: '16px', border: '1px solid #bbf7d0' }}>
              🎯 Tổng: {isQ4 ? '28.000.000 đ' : '150.000.000 đ'}
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
              <span style={{ color: '#64748b', fontWeight: 600 }}>0đ: Cắt 100% Ads (Nghỉ Tết)</span>
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

        {/* Ô Lưới Nhiệt (Heatmap Grid) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isQ4 ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(auto-fit, minmax(88px, 1fr))',
          gap: '8px'
        }}>
          {(isQ4 ? Q4_MONTHS_DATA : MONTHS_DATA).map((m) => {
            const heat = getHeatmapInfo(m.budget, m.channels, isQ4);
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
                  padding: isQ4 ? '12px 14px' : '10px 8px',
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
                    {isQ4 ? m.monthLabel : `T${m.month}`}
                  </span>
                  <span style={{ fontSize: '0.9rem' }}>{m.seasonIcon}</span>
                </div>

                {/* Số tiền to nổi bật */}
                <div style={{ margin: '4px 0 6px', textAlign: isQ4 ? 'left' : 'center' }}>
                  <div style={{
                    fontSize: isQ4 ? '1.25rem' : '1.05rem',
                    fontWeight: 800,
                    color: heat.text,
                    lineHeight: 1.1
                  }}>
                    {isCut ? '0 đ' : `${m.budget / 1000000} Tr`}
                  </div>
                  <div style={{ fontSize: '0.66rem', color: isCut ? '#94a3b8' : heat.text, opacity: 0.85, marginTop: '2px' }}>
                    {isCut ? 'Cắt sạch' : `${heat.pct}% hỏa lực ${isQ4 ? 'Quý 4' : 'Năm'}`}
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
                <div style={{ fontSize: '0.68rem', lineHeight: 1.35, borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '4px' }}>
                  {isCut ? (
                    <span style={{ color: '#94a3b8', fontStyle: 'italic', display: 'block', textAlign: 'center' }}>
                      Nghỉ Ads
                    </span>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                        <span>Google Search Ads:</span>
                        <strong style={{ color: '#1e293b' }}>{heat.gsaBudget / 1000000} Tr</strong>
                      </div>
                      {heat.prBudget > 0 ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#86198f', fontWeight: 700 }}>
                          <span>📰 PR Báo chí:</span>
                          <span>+{heat.prBudget / 1000000} Tr</span>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                          <span>PR Báo chí:</span>
                          <span>dồn</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Badge trạng thái mức nhiệt */}
                <div style={{ marginTop: '6px', textAlign: isQ4 ? 'left' : 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    padding: '2px 6px',
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

      {/* ── CARD TRỰC QUAN: BÁO CHÍ PR THEO QUÝ ── */}
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
              {isQ4 
                ? 'PR Báo Chí B2B Quý 4/2026 — 5.000.000 đ (VTC News • Bài PR Thương Hiệu FIT Tour Dài Hạn)'
                : 'Cơ Chế "Quỹ Ngân Sách PR Theo Quý" — 3 Đợt Báo Chí Uy Tín (30 Triệu)'}
            </h3>
          </div>
          <span style={{ fontSize: '0.76rem', background: '#fae8ff', color: '#86198f', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', border: '1px solid #f0abfc' }}>
            {isQ4 ? 'Ngân Sách PR Q4: 5.000.000 đ (VTC News)' : 'Tổng Quỹ PR Báo Chí Năm: 30.000.000 đ'}
          </span>
        </div>

        <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#701a75', lineHeight: 1.5 }}>
          {isQ4
            ? 'Trong Quý 4/2026, ngân sách PR Báo chí 5 Triệu được kích hoạt ngay đầu Tháng 10 đăng tải bài viết PR trực diện thương hiệu FIT Tour trên báo điện tử VTC News. Bài viết tập trung khẳng định: "FIT Tour mang đến trải nghiệm riêng cho Tour Công Ty", xây dựng tài sản thương hiệu uy tín lâu dài để Sales chào khách và gửi kèm hồ sơ năng lực dự thầu suốt Tháng 10, Tháng 11 và các mùa thầu tiếp theo.'
            : 'Thay vì rải vụn mỗi tháng không đủ book bài uy tín, FIT Tour áp dụng chiến lược gom ngân sách thành 3 đợt PR Báo Chí B2B (mỗi đợt 10 triệu) tại 3 điểm rơi quyết định. Link bài báo làm bảo chứng tín nhiệm (Social Proof) nhúng vào hồ sơ năng lực thầu B2B phục vụ Sales chào khách cả năm.'}
        </p>

        {isQ4 ? (
          <div style={{ background: '#ffffff', border: '1.5px solid #f0abfc', borderRadius: '8px', padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.74rem', background: '#fdf4ff', color: '#86198f', fontWeight: 800, padding: '3px 8px', borderRadius: '4px' }}>
                📰 BÀI PR BÁO CHÍ THÁNG 10/2026 — ĐÓN SÓNG MỞ THẦU YEAR-END PARTY
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#86198f' }}>5.000.000 đ</span>
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
              Bài Viết PR Thương Hiệu FIT Tour Lâu Dài Trên VTC News
            </div>
            <p style={{ margin: '0 0 8px', fontSize: '0.78rem', color: '#64748b', lineHeight: 1.45 }}>
              Chủ đề: <em>"FIT Tour — Mang đến trải nghiệm riêng biệt cho Tour Công Ty"</em> trên báo <strong>VTC News</strong>. Bài viết định vị trực diện thương hiệu FIT Tour, khẳng định năng lực cá nhân hóa theo văn hóa doanh nghiệp, tạo lập tài sản thương hiệu uy tín bền vững cho công ty.
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', fontSize: '0.72rem' }}>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                📌 Nhúng link VTC News trực tiếp vào Profile & Catalogue YEP FIT Tour
              </span>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                📌 Gửi kèm báo giá Email Marketing tới 500 khách hàng cũ
              </span>
              <span style={{ background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                📌 Làm bảo chứng uy tín cho Google Search Ads & Đấu thầu
              </span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            {/* Đợt PR 1 */}
            <div style={{ background: '#ffffff', border: '1.5px solid #f0abfc', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', background: '#fdf4ff', color: '#86198f', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                  📰 ĐỢT PR 1 • THÁNG 3
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

            {/* Đợt PR 2 */}
            <div style={{ background: '#ffffff', border: '1.5px solid #fed7aa', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', background: '#fff7ed', color: '#ea580c', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                  📰 ĐỢT PR 2 • THÁNG 7
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

            {/* Đợt PR 3 */}
            <div style={{ background: '#ffffff', border: '1.5px solid #fde68a', borderRadius: '8px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.72rem', background: '#fef3c7', color: '#b45309', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                  📰 ĐỢT PR 3 • THÁNG 10
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
        )}
      </div>

      {/* ── 4. THANH BỘ LỌC (CHỈ DÀNH CHO CẢ NĂM 2027) HOẶC TÓM TẮT Q4 ── */}
      {!isQ4 ? (
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
      ) : (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 18px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#64748b' }}>
            <span style={{ fontWeight: 800, color: '#86198f' }}>⚡ Lộ Trình Quý 4/2026:</span>
            <span>Tháng 10 (12M: Mở thầu + PR VTC News 5M + 7M GSA) → Tháng 11 (10M: Đại cao điểm chốt thầu GSA) → Tháng 12 (6M: Chốt vét SME & Vận hành GSA).</span>
          </div>

          <a
            href="#b2b-calculator-section"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#86198f',
              color: '#ffffff',
              padding: '7px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <Calculator size={14} />
            <span>Mở Máy Tính Phễu Q4</span>
          </a>
        </div>
      )}

      {/* ── 5. TRỤC TIMELINE THÁNG "ĐÓN ĐẦU 02 THÁNG" ── */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              {isQ4 
                ? 'Trục Kế Hoạch 3 Tháng Nước Rút BU3 Quý 4/2026' 
                : 'Trục Kế Hoạch 12 Tháng & Ma Trận Phân Bổ Ngân Sách BU3 Năm 2027'}
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
              Đang hiển thị {filteredMonths.length} tháng • Tổng ngân sách: <strong>{fmt(summaryMetrics.totalBudget)} đ</strong> • Kỳ vọng thu hút: <strong>{summaryMetrics.totalInquiries} Lead Doanh Nghiệp (Inquiry)</strong>.
            </p>
          </div>
        </div>

        {/* BẢNG TIMELINE CHI TIẾT CÁC THÁNG */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isQ4 ? 'repeat(auto-fit, minmax(360px, 1fr))' : 'repeat(auto-fit, minmax(420px, 1fr))',
          gap: '14px',
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
                  padding: '16px 18px',
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
                      minWidth: '68px',
                      flexShrink: 0
                    }}>
                      <div style={{ fontSize: '0.66rem', fontWeight: 600, textTransform: 'uppercase' }}>Chạy Ads</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1.2 }}>
                        {isQ4 ? `T${m.month}` : `T${m.month}`}
                      </div>
                      {isQ4 && <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#86198f' }}>2026</div>}
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

                {/* Hàng chỉ số: NGÂN SÁCH + LEAD DN */}
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
                        fontSize: '1.08rem',
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

                    {/* Dự kiến chốt đoàn */}
                    {isQ4 && (
                      <div>
                        <div style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Chốt Đoàn</div>
                        <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#16a34a' }}>
                          {m.expectedDeals} Đoàn (~{m.expectedPax}p)
                        </div>
                      </div>
                    )}
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

                {/* Phần mở rộng chi tiết phân bổ kênh & Action Checklist (Accordion) */}
                {isExpanded && (
                  <div style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px dashed #e2e8f0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
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

                    {/* ACTION CHECKLIST TỪNG TUẦN (NẾU CÓ) */}
                    {m.actionChecklist && m.actionChecklist.length > 0 && (
                      <div style={{
                        marginTop: '8px',
                        background: '#fefce8',
                        border: '1px solid #fde047',
                        borderRadius: '6px',
                        padding: '10px 12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 800, color: '#854d0e', textTransform: 'uppercase', marginBottom: '6px' }}>
                          <CheckCircle2 size={14} color="#854d0e" />
                          <span>Kế Hoạch Hành Động Chi Tiết Từng Tuần (Action Checklist):</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {m.actionChecklist.map((task, taskIdx) => (
                            <div key={taskIdx} style={{ fontSize: '0.74rem', color: '#713f12', lineHeight: 1.4, display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                              <span style={{ color: '#b45309', fontWeight: 700 }}>•</span>
                              <span>{task}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 6. KHỐI TRỌNG TÂM CHIẾN LƯỢC: 3 TRỤ CỘT SẢN PHẨM Q4 HOẶC 2 PHÂN HỆ CẢ NĂM ── */}
      {isQ4 ? (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ marginBottom: '14px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
              3 Trụ Cột Sản Phẩm Chiến Lược Của BU3 Trong Quý 4/2026
            </h2>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
              Bộ sản phẩm chủ lực định vị phân khúc trung và cao cấp, phục vụ các đối tác doanh nghiệp trong dịp Year-End Party và đón Tết Nguyên Đán.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '16px'
          }}>
            {Q4_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${prod.themeColor}`,
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  {/* Header sản phẩm */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{prod.icon}</span>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: '#fdf4ff',
                      color: prod.themeColor,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #f0abfc'
                    }}>
                      {prod.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>
                    {prod.title}
                  </h3>

                  <div style={{ fontSize: '0.76rem', color: '#86198f', fontWeight: 600, marginBottom: '8px' }}>
                    🎯 Khách mục tiêu: {prod.targetClients}
                  </div>

                  <p style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.45, margin: '0 0 12px' }}>
                    {prod.description}
                  </p>

                  {/* 3 Selling points */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '8px 10px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '4px' }}>
                      Điểm Khác Biệt & Lợi Thế Cạnh Tranh:
                    </div>
                    {prod.keySellingPoints.map((usp, uIdx) => (
                      <div key={uIdx} style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.35, display: 'flex', alignItems: 'flex-start', gap: '5px' }}>
                        <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>
                        <span>{usp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer card sản phẩm: Giá & Target */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '10px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '0.76rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Đơn giá dự kiến:</div>
                    <strong style={{ color: '#0f172a' }}>{prod.priceRange}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.66rem', color: '#64748b' }}>Chỉ tiêu chốt Q4:</div>
                    <strong style={{ color: '#16a34a' }}>{prod.targetDeals}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
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
                  Đăng các bài viết PR Báo chí B2B uy tín trên các đầu báo lớn nhằm tạo uy tín đấu thầu hồ sơ năng lực B2B cho FIT Tour & Elite BU3 khi chào giá các tập đoàn lớn.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {isQ4 
                  ? 'Máy Tính Phễu B2B Quý 4/2026 — Dự Toán Chuyển Đổi Hợp Đồng YEP & Gala' 
                  : 'Máy Tính Phễu B2B — Dự Toán Chuyển Đổi Hợp Đồng Đoàn Năm 2027'}
              </h2>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#64748b' }}>
              Mô hình tính toán dựa trên số lượng Lead Doanh Nghiệp (Inquiry) → Tỷ lệ chốt hợp đồng đoàn (Won Deals) → Quy mô đoàn → Doanh thu & Tỷ lệ chi phí Ads.
            </p>
          </div>

          <button
            onClick={() => {
              if (isQ4) {
                setCalcBudget(28000000);
                setCalcCpl(700000);
                setCalcWinRate(16);
                setCalcPaxPerDeal(40);
                setCalcTicketPrice(12000000);
              } else {
                setCalcBudget(150000000);
                setCalcCpl(800000);
                setCalcWinRate(20);
                setCalcPaxPerDeal(45);
                setCalcTicketPrice(12000000);
              }
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
            <span>Khôi phục mặc định {isQ4 ? 'Q4' : '2027'}</span>
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
              {isQ4 ? 'Mặc định Q4: 28.000.000 đ' : 'Mặc định: 150.000.000 đ/năm'}
            </div>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px' }}>
              <button
                onClick={() => setCalcBudget(28000000)}
                style={{ fontSize: '0.65rem', background: '#fae8ff', color: '#86198f', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 700 }}
              >
                28M Q4/2026
              </button>
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
                style={{ fontSize: '0.65rem', background: '#fae8ff', color: '#86198f', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 700 }}
              >
                700k (Q4 Vừa Sức)
              </button>
              <button
                onClick={() => setCalcCpl(500000)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                500k
              </button>
              <button
                onClick={() => setCalcCpl(800000)}
                style={{ fontSize: '0.65rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 600 }}
              >
                800k
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
                onClick={() => setCalcWinRate(22)}
                style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontWeight: 700 }}
              >
                22% (YEP)
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
          Đề án Kế Hoạch BU3 ({isQ4 ? 'Quý 4/2026' : 'Năm 2027'}) đã được thiết lập sẵn sàng trên hệ thống nội bộ FIT Tour CRM.
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
