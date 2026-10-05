import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Search, 
  Calendar,
  Layers,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper format tiền tệ
const fmt = (val) => {
  if (!val && val !== 0) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// ══════════════════════════════════════════════════════════════════════════════
// CẤU HÌNH THỜI GIAN (QUÝ)
// ══════════════════════════════════════════════════════════════════════════════
const QUARTERS = [
  { id: 'Q4_2026', label: 'Quý 4/2026', period: '01/10/2026 - 31/12/2026', status: 'active', statusLabel: 'Hiện tại' },
  { id: 'Q1_2027', label: 'Quý 1/2027', period: '01/01/2027 - 31/03/2027', status: 'upcoming', statusLabel: 'Sắp tới' },
  { id: 'Q2_2027', label: 'Quý 2/2027', period: '01/04/2027 - 30/06/2027', status: 'upcoming', statusLabel: 'Dự kiến' },
  { id: 'Q3_2027', label: 'Quý 3/2027', period: '01/07/2027 - 30/09/2027', status: 'upcoming', statusLabel: 'Dự kiến' }
];

// ══════════════════════════════════════════════════════════════════════════════
// 5 BU (GỌN GÀNG, KHÔNG GHI THỊ TRƯỜNG DÀI DÒNG)
// ══════════════════════════════════════════════════════════════════════════════
const BU_TABS = [
  { id: 'ALL', name: 'Tất cả BU', hasPlan: true },
  { id: 'BU1', name: 'BU1', hasPlan: true },
  { id: 'BU2', name: 'BU2', hasPlan: true },
  { id: 'BU3', name: 'BU3', hasPlan: true },
  { id: 'BU4', name: 'BU4', hasPlan: true },
  { id: 'BU5', name: 'BU5', hasPlan: true }
];

// Dữ liệu kế hoạch Quý 4/2026
const Q4_PLANS = [
  {
    id: 'bu1',
    bu: 'BU1',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán Ngân Sách BU1 — Quý 4/2026 (20 Đoàn Khởi Hành)',
    subtitle: 'Đề xuất phân bổ ngân sách Marketing 120 triệu Quý 4 cho thị trường Tour Trung Quốc khớp 100% với 20 đoàn khởi hành thực tế trong ERP (Tổng mục tiêu 281 pax, đã cọc 91 pax, doanh thu kế hoạch 11.01 tỷ).',
    quarter: 'Quý 4/2026',
    period: '01/10/2026 - 31/12/2026',
    status: 'active',
    statusLabel: 'Đang áp dụng',
    badgeColor: '#dc2626',
    badgeBg: '#fee2e2',
    budget: 120000000,
    expectedLeads: '673 - 720 Lead SĐT',
    expectedMessages: '~2.450 Inbox',
    expectedPaxAds: '147 Pax Ads',
    totalPaxOverall: '281 Pax (Đã cọc 91p)',
    adsRevenue: '~4.85 Tỷ',
    fullRevenue: '11.007.040.000 đ',
    costRatio: '1.09%',
    path: '/tai-lieu/thi-truong-bu1',
    hasPlan: true,
    routes: [
      { name: 'Giang Nam (6 Đoàn - 85p)', budget: '32.000.000 đ', leads: '166 SĐT', pax: '33 Pax Ads', cpl: '192.528 đ', time: 'T10, T11, T12', tab: 'giangnam' },
      { name: 'Bắc Kinh (2 Đoàn - 28p)', budget: '22.000.000 đ', leads: '148 SĐT', pax: '28 Pax Ads', cpl: '148.563 đ', time: 'T11 (HAN/SGN)', tab: 'backinh' },
      { name: 'Cáp Nhĩ Tân (2 Đoàn - 32p)', budget: '18.000.000 đ', leads: '176 SĐT', pax: '30 Pax Ads', cpl: '102.122 đ', time: 'T12 (Giáng Sinh/Tết)', tab: 'capnhitan' },
      { name: 'Lệ Giang (2 Đoàn - 32p)', budget: '15.000.000 đ', leads: '118 SĐT', pax: '22 Pax Ads', cpl: '127.295 đ', time: 'T10 & T11', tab: 'legian' },
      { name: 'Đạo Thành Á Đinh (3 Đoàn - 42p)', budget: '8.000.000 đ', leads: '59 SĐT', pax: '10 Pax Ads', cpl: '136.081 đ', time: 'T10 (Cọc 45p)', tab: 'adinh' },
      { name: 'Cửu Trại Câu (1 Đoàn - 15p)', budget: '6.000.000 đ', leads: '18 SĐT', pax: '5 Pax Ads', cpl: '324.982 đ', time: 'T10 (Cọc 10p)', tab: 'cuutraicau' },
      { name: 'Trương Gia Giới (1 Đoàn - 15p)', budget: '6.000.000 đ', leads: '29 SĐT', pax: '6 Pax Ads', cpl: '204.165 đ', time: 'T11', tab: 'phuonghoang' },
      { name: 'Thanh Tạng (1 Đoàn - 11p)', budget: '5.000.000 đ', leads: '33 SĐT', pax: '5 Pax Ads', cpl: '149.358 đ', time: 'T10 (Cọc 6p)', tab: 'thanhtang' },
      { name: 'Tây An - Lạc Dương (1 Đoàn - 11p)', budget: '5.000.000 đ', leads: '24 SĐT', pax: '4 Pax Ads', cpl: '204.165 đ', time: 'T11', tab: 'tayan' },
      { name: 'Tân Cương (1 Đoàn - 10p)', budget: '3.000.000 đ', leads: '15 SĐT', pax: '3 Pax Ads', cpl: '193.796 đ', time: 'T10 (Cọc 14p)', tab: 'tancuong' }
    ],
    highlights: [
      'Đồng bộ 100% với 20 đoàn khởi hành thực tế trong module Marketing Budget Plan ERP',
      'Tổng mục tiêu 281 khách (Đã cọc 91 pax - 32.4%, doanh thu đã cọc 4.39 tỷ)',
      'Tổng doanh thu kế hoạch 11.007.040.000 đ (~11.01 Tỷ VNĐ) với 120M Marketing Ads',
      'Tỷ lệ Chi phí Ads / Doanh thu cực kỳ an toàn: 1.09% (Dưới trần 2.5%)',
      'Đầy đủ Máy tính dự toán độc lập 10 tour & Bảng 20 đoàn khởi hành có bộ lọc theo tháng'
    ]
  },
  {
    id: 'bu2',
    bu: 'BU2',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán Ngân Sách BU2 — Q4/2026 (45 Triệu / Quý • 15 Tr/Tháng)',
    subtitle: 'Đề án do BU2 chủ động đề xuất theo đặc thù Tour Liên Minh Nhật - Hàn - Đài (MKT không nắm sâu thị trường liên minh). Kế thừa nhịp chạy thực tế ~16 triệu/tháng: Phân bổ 45 Triệu/quý (15M/tháng) cho 4 tuyến, bảo đảm trần an toàn vốn 0.75% Doanh thu ERP Q4.',
    quarter: 'Quý 4/2026',
    period: '01/10/2026 - 31/12/2026',
    status: 'active',
    statusLabel: 'Đang áp dụng',
    badgeColor: '#0284c7',
    badgeBg: '#e0f2fe',
    budget: 45000000,
    expectedLeads: '~248 Lead SĐT',
    expectedMessages: '~554 Inbox',
    expectedPaxAds: '~24 Pax Ads',
    totalPaxOverall: '240 Pax (10 Đoàn Q4) • Mở rộng: 265 Pax (11 Đoàn)',
    adsRevenue: '~847.4 Triệu Ads • Thực tế: ~2.62 Tỷ',
    fullRevenue: '5.985.500.000 đ (ERP Q4) • Mở rộng: ~7.09 Tỷ',
    costRatio: '0.75% Doanh thu ERP Q4 (45M / 5.98 Tỷ)',
    path: '/tai-lieu/thi-truong-bu2',
    hasPlan: true,
    routes: [
      { name: '❄️ Hokkaido Thu Đông (2 Đoàn - 40p)', budget: '18.000.000 đ (6 Tr/tháng)', leads: '86 SĐT', pax: '9 Pax Ads (+10 cọc = 19p)', cpl: '210.000 đ', time: '22/10 & 14/01/2027', tab: 'hokkaido' },
      { name: '🗾 Cung Đường Vàng (3 Đoàn - 75p)', budget: '12.000.000 đ (4 Tr/tháng)', leads: '63 SĐT', pax: '6 Pax Ads (+19 cọc = 25p)', cpl: '190.000 đ', time: 'T10 & T11/2026', tab: 'cungduongvang' },
      { name: '🍁 Hàn Quốc Mùa Thu (2 Đoàn - 50p)', budget: '7.500.000 đ (2.5 Tr/tháng)', leads: '45 SĐT', pax: '4 Pax Ads (+11 cọc = 15p)', cpl: '165.000 đ', time: 'T10 & T11/2026', tab: 'hanquoc' },
      { name: '🧋 Đài Loan Thu Đông (4 Đoàn - 100p)', budget: '7.500.000 đ (2.5 Tr/tháng)', leads: '54 SĐT', pax: '5 Pax Ads (+27 cọc = 32p)', cpl: '140.000 đ', time: 'T10 & T11/2026', tab: 'dailoan' }
    ],
    highlights: [
      'Đề xuất trực tiếp từ BU2: Phù hợp đặc thù Tour Liên Minh các thị trường Nhật - Hàn - Đài (team MKT không nắm rõ thị trường)',
      'Kế thừa dữ liệu chi tiêu thực tế: BU2 đang duy trì nhịp chạy ~16 triệu mỗi tháng (Tháng 9/2026 chi 15.95M)',
      'Phân bổ 45 Triệu / Quý (15 Triệu / Tháng) cân đối 2 trục: Hokkaido (18M — 40%) & 3 Tuyến liên minh (27M — 60%)',
      'Tỷ lệ Ads / Doanh thu trên 10 đoàn Q4 chỉ 0.75% (dưới trần an toàn vốn 1.0%), Ads / Lãi gộp chỉ 3.76%',
      'Kỳ vọng toàn phễu: ~248 Lead SĐT (~554 Inbox), chốt ~24 Pax Ads, kết hợp 67 khách cọc sẵn bảo chứng 91 Pax (34.3% tải)'
    ]
  },
  {
    id: 'bu3',
    bu: 'BU3',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán Ngân Sách BU3 — Q4/2026 (28M) & Cả Năm 2027 (150M)',
    subtitle: 'Chiến dịch Nước Rút Quý 4/2026 (28 Triệu: Year-End Party, Gala Dinner & Company Trip cận Tết) kết hợp Đề án chuẩn 12 tháng năm 2027 (150 Triệu: GSA + Báo chí VTC News).',
    quarter: 'Q4/2026 & Năm 2027',
    period: 'Q4/2026 (28M) • Cả Năm (150M)',
    status: 'active',
    statusLabel: 'Đang áp dụng',
    badgeColor: '#86198f',
    badgeBg: '#fae8ff',
    budget: 28000000,
    expectedLeads: '38 - 40 Lead Q4 • 220 Lead Năm',
    expectedMessages: '~200 - 1.200 Inquiry',
    expectedPaxAds: '6 - 7 Đoàn Q4 (~270p) • 45 Đoàn Năm (~1.800p)',
    totalPaxOverall: '270 Pax Q4 • 2.200 Pax Năm',
    adsRevenue: '~3.24 Tỷ Q4 • ~21.6 Tỷ Năm',
    fullRevenue: '3.240.000.000 đ',
    costRatio: '0.86%',
    path: '/tai-lieu/thi-truong-bu3?cycle=q4_2026',
    hasPlan: true,
    routes: [
      { name: '⚡ Quý 4/2026: YEP & Gala (28M)', budget: '28.000.000 đ', leads: '40 Lead DN', pax: '7 Đoàn (270p)', cpl: '700.000 đ', time: 'Chạy T10-T12/2026', tab: 'q4' },
      { name: 'Mùa Hè & Teambuilding (90M)', budget: '90.000.000 đ', leads: '115 Lead DN', pax: '26 Đoàn (1.170p)', cpl: '780.000 đ', time: 'Chạy T3-T7 • Đi T5-T9', tab: 'summer' },
      { name: 'Mùa Hoa Anh Đào (25M)', budget: '25.000.000 đ', leads: '32 Lead DN', pax: '5 Đoàn (225p)', cpl: '781.250 đ', time: 'Chạy T1-T2 • Đi T3-T4', tab: 'sakura' },
      { name: 'Mùa Thu Lá Đỏ (30M)', budget: '30.000.000 đ', leads: '38 Lead DN', pax: '9 Đoàn (330p)', cpl: '789.473 đ', time: 'Chạy T7-T9 • Đi T9-T11', tab: 'autumn' }
    ],
    highlights: [
      '⚡ Quý 4/2026 (Nước rút YEP): 28 Triệu (T10: 12M gồm 5M PR thương hiệu FIT Tour VTC News + 7M GSA, T11: 10M GSA, T12: 6M GSA chốt vét)',
      '📅 Cả Năm 2027: 150 Triệu (120M Ads + 30M PR Báo chí theo Quý), Tháng 2 cắt sạch 0đ nghỉ Tết',
      'Đầy đủ 3 Trụ Cột Sản Phẩm Q4: Gala YEP Độc Bản (70%), Company Trip Biển Cận Tết, Tour MICE VIP',
      'Đầy đủ Máy tính Phễu B2B chuyển đổi cho cả 2 chu kỳ: Lead DN → Hợp đồng đoàn → Doanh thu'
    ]
  },
  {
    id: 'bu4',
    bu: 'BU4',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán Ngân Sách BU4 — Quý 4/2026',
    subtitle: 'Đề xuất phân bổ ngân sách Marketing 30 triệu Quý 4 cho các thị trường đặc thù (Bhutan, Ladakh, Sri Lanka), timeline vận hành và bảng đề xuất theo từng tuyến.',
    quarter: 'Quý 4/2026',
    period: '01/10/2026 - 31/12/2026',
    status: 'active',
    statusLabel: 'Đang áp dụng',
    badgeColor: '#0284c7',
    badgeBg: '#e0f2fe',
    budget: 30000000,
    expectedLeads: '111 - 120 Lead SĐT',
    expectedMessages: '~643 - 698 Inbox',
    expectedPaxAds: '34 - 42 Pax',
    totalPaxOverall: '45 - 53 Pax',
    adsRevenue: '~1.95 - 2.42 Tỷ',
    fullRevenue: '3.960.450.000 đ',
    costRatio: '1.24% - 1.54%',
    path: '/tai-lieu/thi-truong-bu4',
    hasPlan: true,
    routes: [
      { name: 'Bhutan (3 Đoàn)', budget: '21.060.000 đ', leads: '88 - 92 SĐT', pax: '28 - 35 Pax', cpl: '233.121 đ', time: 'T10 - T12', tab: 'bhutan' },
      { name: 'Ladakh (Tăng Cường)', budget: '2.940.000 đ', leads: '12 - 16 SĐT', pax: '3 - 4 Pax', cpl: '181.018 đ', time: '01 - 07/10', tab: 'ladakh' },
      { name: 'Sri Lanka (Tăng Cường)', budget: '6.000.000 đ', leads: '11 - 12 SĐT', pax: '3 Pax', cpl: '508.063 đ', time: '01 - 20/10', tab: 'srilanka' }
    ],
    highlights: [
      '100% đối soát số liệu chuẩn Database Production (loại bỏ toàn bộ dữ liệu ảo)',
      'Tổng ngân sách đề xuất tròn 30 triệu VNĐ, phân bổ 3 giai đoạn rõ ràng',
      'Chi phí Ads chỉ chiếm 1.24% - 1.54% doanh thu trực tiếp từ Ads',
      'Đầy đủ Máy tính dự toán tính xuôi (theo đoàn) & tính ngược (theo ngân sách)'
    ]
  },
  {
    id: 'bu5',
    bu: 'BU5',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán BU5 (Khám Phá & Độc Bản)',
    subtitle: 'Đề án 5 tuyến độc bản: Murmansk Bắc Cực Quang (Nga), Ai Cập Sông Nile, Ma Rốc, Pakistan, Trung Á. Đối soát chuẩn xác 8 đoàn ERP trị giá 10.135 Tỷ.',
    status: 'ready',
    statusLabel: 'Sẵn sàng triển khai',
    badgeText: '8 Đoàn ERP • 91 Pax',
    badgeColor: '#b45309',
    badgeBg: '#fef3c7',
    budget: 100000000,
    expectedLeads: '~397 Lead SĐT',
    expectedMessages: '~1.480 Inbox',
    expectedPaxAds: '~36 Pax',
    totalPaxOverall: '58 Pax (+22 cọc)',
    adsRevenue: '~6.34 Tỷ (Thực tế)',
    fullRevenue: '10.134.900.000 đ',
    costRatio: '0.99% (Chuẩn định mức 1%)',
    path: '/tai-lieu/thi-truong-bu5',
    hasPlan: true,
    routes: [
      { name: '❄️ Murmansk Nga (2 Đoàn)', budget: '28.000.000 đ', leads: '155 SĐT', pax: '~14 Pax (+3 cọc = 17p)', cpl: '180.000 đ', time: '09/12', tab: 'murmansk' },
      { name: '☀️ Ai Cập Sông Nile (2 Đoàn)', budget: '28.000.000 đ', leads: '74 SĐT', pax: '~7 Pax', cpl: '380.000 đ', time: '22/11 & 20/12', tab: 'aicap' },
      { name: '🏜️ Ma Rốc Bắc Phi (1 Đoàn)', budget: '20.000.000 đ', leads: '63 SĐT', pax: '~6 Pax', cpl: '320.000 đ', time: '19/11', tab: 'maroc' },
      { name: '🏔️ Pakistan Hunza (2 Đoàn)', budget: '16.000.000 đ', leads: '73 SĐT', pax: '~6 Pax', cpl: '220.000 đ', time: '17/10 & 31/10', tab: 'pakistan' },
      { name: '🏛️ Trung Á Tơ Lụa (1 Đoàn)', budget: '8.000.000 đ', leads: '32 SĐT', pax: '~3 Pax', cpl: '250.000 đ', time: '10/10', tab: 'trunga' }
    ],
    highlights: [
      '100% đối soát số liệu chuẩn Database Production (8 đoàn ERP, 22 cọc đã thu 684.1M VNĐ)',
      'Định mức ngân sách chuẩn xác 1% Doanh thu: 100.000.000 đ cho 3 tháng Q4',
      'Chi phí Ads chỉ chiếm 0.99% doanh thu kế hoạch và 4.93% tổng lãi gộp',
      'Tuyến săn Cực quang Nga Murmansk và Ai Cập Noel là 2 mũi nhọn bùng nổ doanh số'
    ]
  }
];

export default function MarketPlanningSubTab() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4_2026');
  const [selectedBu, setSelectedBu] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currentQuarterInfo = useMemo(() => {
    return QUARTERS.find(q => q.id === selectedQuarter) || QUARTERS[0];
  }, [selectedQuarter]);

  // Lọc kế hoạch theo Quý, Tab BU và ô tìm kiếm
  const filteredPlans = useMemo(() => {
    if (selectedQuarter !== 'Q4_2026') {
      return [];
    }
    return Q4_PLANS.filter(p => {
      if (selectedBu !== 'ALL' && p.bu !== selectedBu) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inSub = p.subtitle.toLowerCase().includes(q);
        const inBu = p.bu.toLowerCase().includes(q);
        const inRoutes = p.routes ? p.routes.some(r => r.name.toLowerCase().includes(q)) : false;
        if (!inTitle && !inSub && !inBu && !inRoutes) return false;
      }
      return true;
    });
  }, [selectedQuarter, selectedBu, searchQuery]);

  // Thống kê nhanh linh hoạt theo BU đang chọn (BU1, BU3, BU4 hoặc Tổng hợp các BU)
  const headerStats = useMemo(() => {
    if (selectedBu === 'BU1') {
      return {
        appliedLabel: 'BU1',
        appliedSub: 'Tour Trung Quốc • 20 Đoàn Q4',
        budgetLabel: 'Ngân Sách Marketing BU1',
        budgetVal: '120.000.000 đ',
        budgetSub: '10 Tuyến khởi hành Q4/2026',
        paxLabel: 'Kỳ Vọng Pax Ads BU1',
        paxVal: '147 Pax Ads',
        paxSub: 'Tổng mục tiêu: 281 Pax (Đã cọc 91p)',
        ratioLabel: 'Tỷ Lệ Ads / Doanh Thu Kế Hoạch',
        ratioVal: '1.09%',
        ratioSub: 'Doanh thu kế hoạch: 11.01 Tỷ'
      };
    }
    if (selectedBu === 'BU2') {
      return {
        appliedLabel: 'BU2',
        appliedSub: 'Tour Liên Minh + Trọng Tâm Hokkaido',
        budgetLabel: 'Ngân Sách Marketing BU2',
        budgetVal: '45.000.000 đ',
        budgetSub: '15 Tr/Tháng • Hokkaido: 18M • Liên Minh: 27M',
        paxLabel: 'Quy Mô 11 Đoàn BU2',
        paxVal: '265 Pax (91p Bảo Chứng)',
        paxSub: 'Ads chốt: ~24p • Đã cọc: 67p (34.3% tải)',
        ratioLabel: 'Tỷ Lệ Ads / Doanh Thu 10 Đoàn Q4',
        ratioVal: '0.75%',
        ratioSub: 'Doanh thu ERP Q4: 5.985 Tỷ (Trần ≤ 1.0%)'
      };
    }
    if (selectedBu === 'BU3') {
      return {
        appliedLabel: 'BU3',
        appliedSub: 'B2B • MICE • Tour Doanh Nghiệp',
        budgetLabel: 'Ngân Sách Marketing BU3',
        budgetVal: '150.000.000 đ',
        budgetSub: '12 Tháng (Chạy trước 2T • T12 = 0đ)',
        paxLabel: 'Mục Tiêu Đoàn Doanh Nghiệp',
        paxVal: '36 - 45 Đoàn',
        paxSub: 'Quy mô TB: ~1.800 Pax B2B',
        ratioLabel: 'Tỷ Lệ Ads / Doanh Thu Kế Hoạch',
        ratioVal: '0.69%',
        ratioSub: 'Doanh thu kế hoạch: ~21.6 Tỷ'
      };
    }
    if (selectedBu === 'BU4') {
      return {
        appliedLabel: 'BU4',
        appliedSub: 'Quý 4/2026 • Đã duyệt',
        budgetLabel: 'Ngân Sách Marketing BU4',
        budgetVal: '30.000.000 đ',
        budgetSub: 'Phân bổ 3 giai đoạn rõ ràng',
        paxLabel: 'Kỳ Vọng Pax Ads BU4',
        paxVal: '34 - 42 Pax',
        paxSub: 'Tổng nguồn: 45 - 53 Pax',
        ratioLabel: 'Tỷ Lệ Chi Phí Ads Mục Tiêu',
        ratioVal: '1.24% - 1.54%',
        ratioSub: 'Doanh thu Ads: ~1.95 - 2.42 Tỷ'
      };
    }
    if (selectedBu === 'BU5') {
      return {
        appliedLabel: 'BU5',
        appliedSub: 'Khám Phá & Độc Bản • 8 Đoàn Q4',
        budgetLabel: 'Ngân Sách Marketing BU5',
        budgetVal: '100.000.000 đ',
        budgetSub: '5 Tuyến • Chuẩn định mức 1% Doanh thu',
        paxLabel: 'Mục Tiêu Khách BU5',
        paxVal: '91 Pax (56p Bảo Chứng)',
        paxSub: 'Ads chốt: ~36p • Đã cọc: 20p (61.5% tải)',
        ratioLabel: 'Tỷ Lệ Ads / Doanh Thu Kế Hoạch',
        ratioVal: '0.99%',
        ratioSub: 'Doanh thu kế hoạch: 10.135 Tỷ'
      };
    }
    // ALL hoặc các BU khác
    return {
      appliedLabel: 'BU1 + BU2 + BU3 + BU4 + BU5',
      appliedSub: '5 Đề án đang áp dụng',
      budgetLabel: 'Tổng Ngân Sách Đã Duyệt',
      budgetVal: '445.000.000 đ',
      budgetSub: 'BU1: 120M • BU2: 45M • BU3: 150M • BU4: 30M • BU5: 100M',
      paxLabel: 'Tổng Quy Mô Đoàn & Khách',
      paxVal: '2.482 - 2.890 Pax',
      paxSub: '20 đoàn BU1 + 11 đoàn BU2 + 45 đoàn BU3 + BU4 + 8 đoàn BU5',
      ratioLabel: 'Tỷ Lệ Ads / Tổng DT Kế Hoạch',
      ratioVal: '0.83%',
      ratioSub: 'Tổng DT kế hoạch: ~53.55 Tỷ'
    };
  }, [selectedBu]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* ── 1. HEADER MODULE TỔNG QUAN ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: '10px',
        padding: '24px 28px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
        border: '1px solid #334155'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              MARKETING STRATEGY & ADS FORECAST
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{currentQuarterInfo.label}</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0 0 6px', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            Danh Sách Kế Hoạch & Dự Toán Thị Trường
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', maxWidth: '820px', lineHeight: '1.5' }}>
            Quản lý kế hoạch ngân sách Marketing và dự toán theo từng Business Unit (BU1 - BU5) phân theo chu kỳ thời gian. Dữ liệu kế hoạch BU1, BU2, BU3 và BU4 đã được chuẩn hoá và đối soát trực tiếp với Database Production của hệ thống.
          </p>
        </div>

        {/* 4 Thống kê nhanh toàn module (Linh hoạt theo BU) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Kế Hoạch Áp Dụng</div>
            <div style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: selectedBu === 'BU1' ? '#f87171' : selectedBu === 'BU3' ? '#f0abfc' : '#38bdf8',
              marginTop: '2px'
            }}>
              {headerStats.appliedLabel}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{headerStats.appliedSub}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{headerStats.budgetLabel}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>{headerStats.budgetVal}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{headerStats.budgetSub}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{headerStats.paxLabel}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{headerStats.paxVal}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{headerStats.paxSub}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{headerStats.ratioLabel}</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{headerStats.ratioVal}</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{headerStats.ratioSub}</div>
          </div>
        </div>
      </div>

      {/* ── 2. THANH THỜI GIAN (QUÝ) & TÌM KIẾM ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Chọn Quý */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Thời Gian Kế Hoạch:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {QUARTERS.map((q) => {
              const isActive = selectedQuarter === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuarter(q.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: isActive ? '#0284c7' : '#f8fafc',
                    color: isActive ? '#ffffff' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{q.label}</span>
                  {q.status === 'active' && (
                    <span style={{
                      fontSize: '0.66rem',
                      background: isActive ? '#38bdf8' : '#e0f2fe',
                      color: isActive ? '#0c4a6e' : '#0369a1',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      Hiện tại
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px', maxWidth: '340px', flex: '1 1 220px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm theo BU, tuyến tour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.82rem',
              color: '#1e293b'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── 3. TAB BU (GỌN GÀNG, VỪA ĐỦ, KHÔNG CẦN GHI THỊ TRƯỜNG DÀI DÒNG) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px'
      }}>
        {BU_TABS.map((b) => {
          const isSelected = selectedBu === b.id;
          const hasPlan = b.hasPlan && b.id !== 'ALL';
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBu(b.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 14px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                background: isSelected ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isSelected ? '0 2px 4px rgba(2, 132, 199, 0.12)' : 'none'
              }}
            >
              <span style={{
                fontSize: '0.88rem',
                fontWeight: isSelected ? 800 : 700,
                color: isSelected ? '#0284c7' : '#334155'
              }}>
                {b.name}
              </span>
              {b.id === 'ALL' ? (
                <span style={{
                  fontSize: '0.68rem',
                  background: isSelected ? '#e0f2fe' : '#f1f5f9',
                  color: isSelected ? '#0369a1' : '#64748b',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  Tất cả
                </span>
              ) : hasPlan ? (
                <span style={{
                  fontSize: '0.68rem',
                  background: '#ecfdf5',
                  color: '#059669',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  border: '1px solid #a7f3d0'
                }}>
                  Đang áp dụng
                </span>
              ) : (
                <span style={{
                  fontSize: '0.68rem',
                  background: '#f8fafc',
                  color: '#94a3b8',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 500,
                  border: '1px solid #e2e8f0'
                }}>
                  Trống link
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 4. DANH SÁCH CARD KẾ HOẠCH ── */}
      {selectedQuarter !== 'Q4_2026' ? (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '48px 20px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '1.1rem' }}>
            Kế Hoạch Cho {currentQuarterInfo.label} Đang Được Chuẩn Bị
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem' }}>
            Hiện tại hệ thống đang áp dụng đề án cho Quý 4/2026. Các quý tiếp theo sẽ được cập nhật khi các BU hoàn tất đề án.
          </p>
          <button
            onClick={() => setSelectedQuarter('Q4_2026')}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Quay Về Quý 4/2026
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredPlans.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '36px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>Không tìm thấy kế hoạch phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              if (plan.hasPlan) {
                // CARD CHI TIẾT KẾ HOẠCH ĐÃ HOÀN TẤT & ĐANG ÁP DỤNG (BU1, BU3 & BU4)
                const isBU1 = plan.bu === 'BU1';
                const isBU3 = plan.bu === 'BU3';
                return (
                  <div
                    key={plan.id}
                    style={{
                      background: '#ffffff',
                      border: isBU3 ? '2px solid #d946ef' : isBU1 ? '2px solid #f87171' : '2px solid #38bdf8',
                      borderRadius: '8px',
                      padding: '20px',
                      boxShadow: isBU3 ? '0 2px 8px rgba(217, 70, 239, 0.08)' : isBU1 ? '0 2px 8px rgba(220, 38, 38, 0.08)' : '0 2px 8px rgba(2, 132, 199, 0.08)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    {/* Header Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            background: plan.badgeBg,
                            color: plan.badgeColor,
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: '4px'
                          }}>
                            {plan.bu}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                            {plan.quarter} ({plan.period})
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0'
                          }}>
                            ● {plan.statusLabel}
                          </span>
                        </div>
                        <h3 style={{ margin: '6px 0 2px', fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
                          {plan.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', maxWidth: '800px', lineHeight: '1.4' }}>
                          {plan.subtitle}
                        </p>
                      </div>

                      {/* CÁC NÚT HÀNH ĐỘNG: MÁY TÍNH & DATA CŨ + XEM CHI TIẾT KẾ HOẠCH */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* NÚT MÁY TÍNH & DATA CŨ (TRƯỚC NÚT XEM CHI TIẾT) */}
                        <a
                          href={`${plan.path}?tab=calculator`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isBU3 ? '#fdf4ff' : isBU1 ? '#fef2f2' : '#f0f9ff',
                            color: isBU3 ? '#86198f' : isBU1 ? '#dc2626' : '#0284c7',
                            border: isBU3 ? '1px solid #f0abfc' : isBU1 ? '1px solid #fca5a5' : '1px solid #7dd3fc',
                            borderRadius: '6px',
                            padding: '9px 14px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'none',
                            boxShadow: isBU3 ? '0 1px 2px rgba(134, 25, 143, 0.08)' : isBU1 ? '0 1px 2px rgba(220, 38, 38, 0.08)' : '0 1px 2px rgba(2, 132, 199, 0.08)',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Calculator size={15} color={isBU3 ? '#86198f' : isBU1 ? '#dc2626' : '#0284c7'} />
                          <span>Máy Tính & Data Cũ</span>
                        </a>

                        {/* NÚT XEM CHI TIẾT KẾ HOẠCH */}
                        <a
                          href={plan.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: isBU3 ? '#86198f' : isBU1 ? '#dc2626' : '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '9px 16px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'none',
                            boxShadow: isBU3 ? '0 2px 4px rgba(134, 25, 143, 0.25)' : isBU1 ? '0 2px 4px rgba(220, 38, 38, 0.25)' : '0 2px 4px rgba(2, 132, 199, 0.25)'
                          }}
                        >
                          <span>Xem Chi Tiết Kế Hoạch</span>
                          <ArrowRight size={15} />
                        </a>
                      </div>
                    </div>

                    {/* 4 Chỉ số KPI nổi bật (Grid) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px 14px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Ngân Sách Kế Hoạch</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: isBU3 ? '#86198f' : isBU1 ? '#dc2626' : '#0284c7', marginTop: '2px' }}>
                          {fmt(plan.budget)} đ
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {isBU3 ? '12 Tháng • Chạy trước 2T' : isBU1 ? '10 Tuyến khởi hành Q4' : 'Phân bổ 3 giai đoạn rõ ràng'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Kỳ Vọng Lead SĐT</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          {plan.expectedLeads}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{plan.expectedMessages}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Kỳ Vọng Khách (Pax)</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          {plan.expectedPaxAds}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Tổng nguồn: {plan.totalPaxOverall}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Doanh Thu Dự Kiến</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                          {plan.fullRevenue || plan.adsRevenue}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                          {isBU3 ? `Tỷ lệ Ads/DT: ${plan.costRatio} (B2B Đoàn)` : isBU1 ? `Ads: ${plan.adsRevenue} • Tỷ lệ: ${plan.costRatio}` : `Doanh thu Ads: ${plan.adsRevenue} (${plan.costRatio})`}
                        </div>
                      </div>
                    </div>

                    {/* Các tuyến tour trọng điểm */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        {isBU3 ? 'Phân Bổ Các Chiến Dịch Trọng Điểm:' : `Phân Bổ Tuyến Trọng Điểm (${plan.routes?.length || 0} Tuyến):`}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
                        {plan.routes.map((r, rIdx) => (
                          <a
                            key={rIdx}
                            href={`${plan.path}?tab=${r.tab || ''}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '8px 10px',
                              fontSize: '0.78rem',
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'block',
                              transition: 'all 0.15s',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{r.name}</span>
                              <span style={{ fontSize: '0.7rem', color: isBU3 ? '#86198f' : isBU1 ? '#dc2626' : '#0284c7', fontWeight: 600 }}>
                                {r.time} • Xem data & tính →
                              </span>
                            </div>
                            <div style={{ color: isBU3 ? '#86198f' : isBU1 ? '#dc2626' : '#0284c7', fontWeight: 600, marginTop: '3px' }}>
                              {r.budget}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              {r.leads && <span>{r.leads} • </span>}
                              {r.pax && <span>{r.pax}</span>}
                              {r.cpl && <span> (CPL: {r.cpl})</span>}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Điểm nhấn nổi bật */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Điểm nhấn:</div>
                      {plan.highlights.map((h, hIdx) => (
                        <div key={hIdx} style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} color="#10b981" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              }

              // CARD CHO CÁC BU TẠM ĐỂ TRỐNG LINK (BU1, BU2, BU3, BU5)
              return (
                <div
                  key={plan.id}
                  style={{
                    background: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    opacity: 0.85
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {plan.bu}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Quý 4/2026
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: '#f1f5f9',
                        color: '#94a3b8',
                        border: '1px solid #e2e8f0'
                      }}>
                        {plan.statusLabel}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '0.96rem', fontWeight: 600, color: '#334155' }}>
                      {plan.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                      {plan.subtitle}
                    </p>
                  </div>

                  <div>
                    <span style={{
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      display: 'inline-block'
                    }}>
                      Trống link (Thêm sau)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
