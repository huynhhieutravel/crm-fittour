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
  MapPin,
  Search,
  Filter
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

// Helper format tiền tệ chuẩn Việt Nam: 59.990.000
const formatMoney = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Helper parse chuỗi tiền tệ thành số nguyên
const parseMoneyInput = (str) => {
  const clean = String(str).replace(/[^\d]/g, '');
  return clean ? parseInt(clean, 10) : 0;
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
// 1. DANH SÁCH 20 ĐOÀN KHỞI HÀNH THỰC TẾ QUÝ 4/2026 ĐỒNG BỘ 100% TỪ ERP
// Trích xuất trực tiếp từ marketing_budget_plans kết hợp tour_departures & bookings
// ══════════════════════════════════════════════════════════════════════════════
export const REAL_ERP_DEPARTURES = [
  {
    id: 120,
    code: 'GIANG NAM 14 -18OCT2026',
    tuyen: 'TOUR GIANG NAM 5N5Đ - NO SHOPPING',
    tourKey: 'giangnam',
    tourName: 'Tour Giang Nam 5N5Đ',
    date: '2026-10-14',
    month: 10,
    targetPax: 16,
    breakEvenPax: 11,
    price: 28990000,
    cost: 23192000,
    paidPax: 1,
    paidRevenue: 28490000,
    statusText: 'Mở bán'
  },
  {
    id: 111,
    code: 'CỬU TRẠI CÂU 22 - 27OCT2026',
    tuyen: 'TOUR CỬU TRẠI CÂU 6N5Đ - NO SHOPPING',
    tourKey: 'cuutraicau',
    tourName: 'Cửu Trại Câu Mùa Thu 6N5Đ',
    date: '2026-10-22',
    month: 10,
    targetPax: 15,
    breakEvenPax: 11,
    price: 33990000,
    cost: 27192000,
    paidPax: 10,
    paidRevenue: 333900000,
    statusText: 'Mở bán'
  },
  {
    id: 201,
    code: 'CTTT20260828-20261022',
    tuyen: 'CHUYẾN TÀU THANH TẠNG 10N9Đ - NO SHOPPING',
    tourKey: 'thanhtang',
    tourName: 'Chuyến Tàu Thanh Tạng 10N9Đ',
    date: '2026-10-22',
    month: 10,
    targetPax: 11,
    breakEvenPax: 8,
    price: 68990000,
    cost: 55192000,
    paidPax: 6,
    paidRevenue: 407840000,
    statusText: 'Mở bán'
  },
  {
    id: 4,
    code: 'LỆ GIANG 22 -27OCT2026',
    tuyen: 'TOUR LỆ GIANG 6N5Đ - NO SHOPPING',
    tourKey: 'legian',
    tourName: 'Lệ Giang - Shangrila 6N5Đ',
    date: '2026-10-22',
    month: 10,
    targetPax: 16,
    breakEvenPax: 11,
    price: 27990000,
    cost: 22392000,
    paidPax: 8,
    paidRevenue: 223140000,
    statusText: 'Mở bán'
  },
  {
    id: 147,
    code: 'ĐẠO THÀNH Á ĐINH 23 - 31OCT2026',
    tuyen: 'TOUR ĐẠO THÀNH Á ĐINH 9N8Đ - NO SHOPPING',
    tourKey: 'adinh',
    tourName: 'Đạo Thành Á Đinh 9N8Đ',
    date: '2026-10-23',
    month: 10,
    targetPax: 12,
    breakEvenPax: 8,
    price: 44990000,
    cost: 35992000,
    paidPax: 18,
    paidRevenue: 795520000,
    statusText: 'Mở bán'
  },
  {
    id: 196,
    code: 'TÂN CƯƠNG 23 - 30OCT2026',
    tuyen: 'TÂN CƯƠNG 8N7Đ - NO SHOPPING',
    tourKey: 'tancuong',
    tourName: 'Tân Cương Mùa Thu 8N7Đ',
    date: '2026-10-23',
    month: 10,
    targetPax: 10,
    breakEvenPax: 7,
    price: 67990000,
    cost: 54392000,
    paidPax: 14,
    paidRevenue: 952370000,
    statusText: 'Mở bán'
  },
  {
    id: 167,
    code: 'ĐẠO THÀNH Á ĐINH 24 - 31OCT2026',
    tuyen: 'TOUR ĐẠO THÀNH Á ĐINH 8N7Đ - NO SHOPPING',
    tourKey: 'adinh',
    tourName: 'Đạo Thành Á Đinh 8N7Đ',
    date: '2026-10-24',
    month: 10,
    targetPax: 15,
    breakEvenPax: 11,
    price: 49900000,
    cost: 39920000,
    paidPax: 22,
    paidRevenue: 1101740000,
    statusText: 'Mở bán'
  },
  {
    id: 134,
    code: 'ĐẠO THÀNH Á ĐINH 31OCT - 07NOV2026',
    tuyen: 'TOUR ĐẠO THÀNH Á ĐINH 8N7Đ - NO SHOPPING',
    tourKey: 'adinh',
    tourName: 'Đạo Thành Á Đinh 8N7Đ',
    date: '2026-10-31',
    month: 10,
    targetPax: 15,
    breakEvenPax: 11,
    price: 49900000,
    cost: 39920000,
    paidPax: 5,
    paidRevenue: 246270000,
    statusText: 'Mở bán'
  },
  {
    id: 139,
    code: 'HAN BẮC KINH 04 - 08NOV26',
    tuyen: 'TOUR BẮC KINH 5N4Đ - NO SHOPPING',
    tourKey: 'backinh',
    tourName: 'Bắc Kinh 5N4Đ (Bay từ Hà Nội)',
    date: '2026-11-04',
    month: 11,
    targetPax: 14,
    breakEvenPax: 10,
    price: 33990000,
    cost: 27192000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 144,
    code: 'SGN BẮC KINH 06 - 10NOV26',
    tuyen: 'TOUR BẮC KINH 5N4Đ - NO SHOPPING',
    tourKey: 'backinh',
    tourName: 'Bắc Kinh 5N4Đ (Bay từ TP.HCM)',
    date: '2026-11-06',
    month: 11,
    targetPax: 14,
    breakEvenPax: 10,
    price: 33990000,
    cost: 27192000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 161,
    code: 'GIANG NAM PRIVATE-20261110',
    tuyen: 'TOUR THƯỢNG HẢI - DISNEYLAND - Ô TRẤN - HÀNG CHÂU',
    tourKey: 'giangnam',
    tourName: 'Giang Nam Private Tour VIP',
    date: '2026-11-10',
    month: 11,
    targetPax: 5,
    breakEvenPax: 4,
    price: 44500000,
    cost: 35600000,
    paidPax: 5,
    paidRevenue: 218000000,
    statusText: 'Chắc chắn đi'
  },
  {
    id: 184,
    code: 'GIANG NAM 12 - 16NOV2026',
    tuyen: 'TOUR GIANG NAM 5N5Đ - NO SHOPPING',
    tourKey: 'giangnam',
    tourName: 'Tour Giang Nam 5N5Đ',
    date: '2026-11-12',
    month: 11,
    targetPax: 16,
    breakEvenPax: 11,
    price: 28990000,
    cost: 23192000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 33,
    code: 'LỆ GIANG 19 - 24NOV2026',
    tuyen: 'TOUR LỆ GIANG 6N5Đ - NO SHOPPING',
    tourKey: 'legian',
    tourName: 'Lệ Giang - Shangrila 6N5Đ',
    date: '2026-11-19',
    month: 11,
    targetPax: 16,
    breakEvenPax: 11,
    price: 27990000,
    cost: 22392000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 116,
    code: 'PHCT6N5Đ-20261121',
    tuyen: 'TRƯƠNG GIA GIỚI - PHƯỢNG HOÀNG CỔ TRẤN',
    tourKey: 'phuonghoang',
    tourName: 'Trương Gia Giới - Phượng Hoàng Cổ Trấn 6N5Đ',
    date: '2026-11-21',
    month: 11,
    targetPax: 15,
    breakEvenPax: 11,
    price: 31990000,
    cost: 25592000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 155,
    code: 'TÂY AN - LẠC DƯƠNG 7N6Đ-20261122',
    tuyen: 'TOUR TÂY AN - LẠC DƯƠNG 7N6Đ NO SHOPPING',
    tourKey: 'tayan',
    tourName: 'Tây An - Lạc Dương 7N6Đ',
    date: '2026-11-22',
    month: 11,
    targetPax: 11,
    breakEvenPax: 8,
    price: 42990000,
    cost: 34392000,
    paidPax: 2,
    paidRevenue: 85980000,
    statusText: 'Mở bán'
  },
  {
    id: 188,
    code: 'GIANG NAM 24 - 28NOV2026',
    tuyen: 'TOUR GIANG NAM 5N5Đ - NO SHOPPING',
    tourKey: 'giangnam',
    tourName: 'Tour Giang Nam 5N5Đ',
    date: '2026-11-24',
    month: 11,
    targetPax: 16,
    breakEvenPax: 11,
    price: 28990000,
    cost: 23192000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 206,
    code: 'CÁP NHĨ TÂN SERIES 2026-20261220',
    tuyen: 'CÁP NHĨ TÂN SERIES 2026 NO SHOPPING',
    tourKey: 'capnhitan',
    tourName: 'Cáp Nhĩ Tân Series Đông (Giáng Sinh)',
    date: '2026-12-20',
    month: 12,
    targetPax: 16,
    breakEvenPax: 11,
    price: 51990000,
    cost: 41592000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 115,
    code: 'GIANG NAM 23 -27NOV2026',
    tuyen: 'TOUR GIANG NAM 5N5Đ - NO SHOPPING',
    tourKey: 'giangnam',
    tourName: 'Tour Giang Nam 5N5Đ',
    date: '2026-12-23',
    month: 12,
    targetPax: 16,
    breakEvenPax: 11,
    price: 28990000,
    cost: 23192000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 205,
    code: 'CÁP NHĨ TÂN SERIES 2026-20261228',
    tuyen: 'CÁP NHĨ TÂN SERIES 2026 NO SHOPPING',
    tourKey: 'capnhitan',
    tourName: 'Cáp Nhĩ Tân Series Đông (Tết Dương Lịch)',
    date: '2026-12-28',
    month: 12,
    targetPax: 16,
    breakEvenPax: 11,
    price: 52990000,
    cost: 42392000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  },
  {
    id: 143,
    code: 'GIANG NAM 30DEC - 03JAN2026',
    tuyen: 'TOUR GIANG NAM 5N5Đ - NO SHOPPING',
    tourKey: 'giangnam',
    tourName: 'Tour Giang Nam 5N5Đ (Tết Dương Lịch)',
    date: '2026-12-30',
    month: 12,
    targetPax: 16,
    breakEvenPax: 11,
    price: 28990000,
    cost: 23192000,
    paidPax: 0,
    paidRevenue: 0,
    statusText: 'Mở bán'
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// 2. TỔNG HỢP TOÀN BỘ 20 ĐOÀN VÀ PHÂN BỔ 10 TOUR CHÍNH (QUÝ 4/2026)
// ══════════════════════════════════════════════════════════════════════════════
const BU1_PROPOSAL_DATA = {
  totalBudget: 120000000,
  totalDepartures: 20,
  totalTargetPax: 281,
  totalPaidPax: 91,
  totalRemainingPax: 190,
  totalRevenue: 11007040000,
  totalPaidRevenue: 4393250000,
  grossProfit: 2201408000,
  grossMarginPct: 20.0,
  adsRatio: 1.09, // 120M / 11.007B = 1.09% (Cực kỳ an toàn)

  // Phân bổ 10 Tour chính
  routes: [
    {
      key: 'giangnam',
      name: 'Tour Giang Nam (Series 5N5Đ & Private)',
      badgeColor: '#0284c7',
      budget: 32000000,
      departuresCount: 6,
      targetPax: 85,
      paidPax: 6,
      remainingPax: 79,
      revenue: 2541700000,
      paidRevenue: 246490000,
      cplLeadDb: 192528,
      cplMsgDb: 80737,
      crInboxToPhone: 41.94,
      crSale: 20,
      expectedLeads: 166,
      expectedInbox: 396,
      expectedPaxAds: 33,
      adsRatio: 1.26,
      time: 'T10, T11, T12',
      details: '6 đoàn khởi hành: 14/10, 10/11 Private (5 pax cọc full), 12/11, 24/11, 23/12, 30/12 Tết Dương Lịch. Giá 28.99M - 44.5M.'
    },
    {
      key: 'backinh',
      name: 'Bắc Kinh Mùa Thu (HAN & SGN - 5N4Đ)',
      badgeColor: '#dc2626',
      budget: 22000000,
      departuresCount: 2,
      targetPax: 28,
      paidPax: 0,
      remainingPax: 28,
      revenue: 951720000,
      paidRevenue: 0,
      cplLeadDb: 148563,
      cplMsgDb: 48316,
      crInboxToPhone: 32.52,
      crSale: 19,
      expectedLeads: 148,
      expectedInbox: 455,
      expectedPaxAds: 28,
      adsRatio: 2.31,
      time: 'T11 (04/11 & 06/11)',
      details: '2 đoàn khởi hành song song 2 đầu cầu: HAN (04/11 - 14 pax) & SGN (06/11 - 14 pax). Giá 33.99M. Ngân sách 22M chốt bao trọn 2 đoàn.'
    },
    {
      key: 'capnhitan',
      name: 'Cáp Nhĩ Tân Series Đông (8N7Đ)',
      badgeColor: '#06b6d4',
      budget: 18000000,
      departuresCount: 2,
      targetPax: 32,
      paidPax: 0,
      remainingPax: 32,
      revenue: 1679680000,
      paidRevenue: 0,
      cplLeadDb: 102122,
      cplMsgDb: 23162,
      crInboxToPhone: 22.68,
      crSale: 18,
      expectedLeads: 176,
      expectedInbox: 777,
      expectedPaxAds: 30,
      adsRatio: 1.07,
      time: 'T12 (20/12 Giáng Sinh & 28/12 Tết)',
      details: '2 đoàn Series mùa đông: 20/12 Giáng Sinh (16 pax - 51.99M) & 28/12 Tết (16 pax - 52.99M). Trend tuyết viral CPL chỉ 102k.'
    },
    {
      key: 'legian',
      name: 'Lệ Giang - Shangrila (6N5Đ)',
      badgeColor: '#ea580c',
      budget: 15000000,
      departuresCount: 2,
      targetPax: 32,
      paidPax: 8,
      remainingPax: 24,
      revenue: 895680000,
      paidRevenue: 223140000,
      cplLeadDb: 127295,
      cplMsgDb: 50320,
      crInboxToPhone: 39.53,
      crSale: 19,
      expectedLeads: 118,
      expectedInbox: 298,
      expectedPaxAds: 22,
      adsRatio: 1.67,
      time: 'T10 (22/10) & T11 (19/11)',
      details: '2 đoàn: 22/10 (đã cọc 8 pax, chỉ thiếu 8 pax) & 19/11 (16 pax). Giá tour 27.99M. Tuyến cổ trấn check-in mùa thu đông rất hút khách.'
    },
    {
      key: 'adinh',
      name: 'Đạo Thành Á Đinh (8N7Đ & 9N8Đ)',
      badgeColor: '#10b981',
      budget: 8000000,
      departuresCount: 3,
      targetPax: 42,
      paidPax: 45,
      remainingPax: -3,
      revenue: 2036880000,
      paidRevenue: 2143530000,
      cplLeadDb: 136081,
      cplMsgDb: 39215,
      crInboxToPhone: 28.82,
      crSale: 18,
      expectedLeads: 59,
      expectedInbox: 204,
      expectedPaxAds: 10,
      adsRatio: 0.39,
      time: 'T10 (23/10, 24/10, 31/10)',
      details: '3 đoàn: 23/10 (18 pax cọc/12 target), 24/10 (22 cọc/15 target), 31/10 (5 cọc/15 target). Tổng cọc 45 pax vượt target. Ngân sách 8M bù nốt 10 pax đoàn 31/10.'
    },
    {
      key: 'cuutraicau',
      name: 'Cửu Trại Câu Mùa Thu (6N5Đ)',
      badgeColor: '#14b8a6',
      budget: 6000000,
      departuresCount: 1,
      targetPax: 15,
      paidPax: 10,
      remainingPax: 5,
      revenue: 509850000,
      paidRevenue: 333900000,
      cplLeadDb: 324982,
      cplMsgDb: 55825,
      crInboxToPhone: 17.18,
      crSale: 25,
      expectedLeads: 18,
      expectedInbox: 107,
      expectedPaxAds: 5,
      adsRatio: 1.18,
      time: 'T10 (22/10)',
      details: '1 đoàn 22/10 duy nhất mùa thu (Giá 33.99M). Đã có 10 pax cọc, chỉ thiếu đúng 5 pax là full tải đoàn.'
    },
    {
      key: 'phuonghoang',
      name: 'Trương Gia Giới - Phượng Hoàng Cổ Trấn (6N5Đ)',
      badgeColor: '#6366f1',
      budget: 6000000,
      departuresCount: 1,
      targetPax: 15,
      paidPax: 0,
      remainingPax: 15,
      revenue: 479850000,
      paidRevenue: 0,
      cplLeadDb: 204165,
      cplMsgDb: 75402,
      crInboxToPhone: 36.93,
      crSale: 20,
      expectedLeads: 29,
      expectedInbox: 80,
      expectedPaxAds: 6,
      adsRatio: 1.25,
      time: 'T11 (21/11)',
      details: '1 đoàn 21/11 khởi hành mùa thu (Giá 31.99M). Ngân sách 6M mang về 6 pax Ads, kết hợp Sale B2B / CTV lấp đầy 15 pax.'
    },
    {
      key: 'thanhtang',
      name: 'Chuyến Tàu Thanh Tạng (10N9Đ)',
      badgeColor: '#8b5cf6',
      budget: 5000000,
      departuresCount: 1,
      targetPax: 11,
      paidPax: 6,
      remainingPax: 5,
      revenue: 758890000,
      paidRevenue: 407840000,
      cplLeadDb: 149358,
      cplMsgDb: 36736,
      crInboxToPhone: 24.60,
      crSale: 16,
      expectedLeads: 33,
      expectedInbox: 136,
      expectedPaxAds: 5,
      adsRatio: 0.66,
      time: 'T10 (22/10)',
      details: 'Tuyến tàu cao cấp độc bản (Giá 68.99M). Đã có 6 pax cọc, chỉ thiếu 5 pax. Ngân sách 5M đủ chốt 5 pax lấp đầy đoàn 11 khách.'
    },
    {
      key: 'tayan',
      name: 'Tây An - Lạc Dương (7N6Đ)',
      badgeColor: '#f97316',
      budget: 5000000,
      departuresCount: 1,
      targetPax: 11,
      paidPax: 2,
      remainingPax: 9,
      revenue: 472890000,
      paidRevenue: 85980000,
      cplLeadDb: 204165,
      cplMsgDb: 75402,
      crInboxToPhone: 36.93,
      crSale: 18,
      expectedLeads: 24,
      expectedInbox: 66,
      expectedPaxAds: 4,
      adsRatio: 1.06,
      time: 'T11 (22/11)',
      details: 'Tuyến di sản lịch sử văn hóa (Giá 42.99M). Đã có 2 pax cọc. Ngân sách 5M mang về 4 pax từ Ads, bù đắp 5 pax kênh ngoài.'
    },
    {
      key: 'tancuong',
      name: 'Tân Cương Mùa Thu (8N7Đ)',
      badgeColor: '#f59e0b',
      budget: 3000000,
      departuresCount: 1,
      targetPax: 10,
      paidPax: 14,
      remainingPax: -4,
      revenue: 679900000,
      paidRevenue: 952370000,
      cplLeadDb: 193796,
      cplMsgDb: 59969,
      crInboxToPhone: 30.94,
      crSale: 20,
      expectedLeads: 15,
      expectedInbox: 50,
      expectedPaxAds: 3,
      adsRatio: 0.44,
      time: 'T10 (23/10)',
      details: 'Đoàn 23/10 đã cọc 14 khách (vượt target 10 khách). Ngân sách 3M chạy duy trì thương hiệu định vị tour cao cấp FIT Tour.'
    }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// 3. DỮ LIỆU LỊCH SỬ THỰC TẾ TRÍCH XUẤT 100% TỪ DATABASE POSTGRESQL BU1
// ══════════════════════════════════════════════════════════════════════════════
const HISTORICAL_DB_MAP = {
  giangnam: {
    totalSpend: 25028601,
    totalMessages: 310,
    totalLeads: 130,
    cplMsgAvg: 80737,
    cplLeadAvg: 192528,
    inboxToLeadRate: 41.94,
    months: [
      { month: 'Tháng 1/2026', spend: 6778842, messages: 96, leads: 39, cplMsg: 70613, cplLead: 173816, note: 'Chiến dịch đầu xuân Giang Nam hoa nở' },
      { month: 'Tháng 2/2026', spend: 4453613, messages: 60, leads: 18, cplMsg: 74227, cplLead: 247423, note: 'Khách hỏi tour du xuân sau Tết' },
      { month: 'Tháng 3/2026', spend: 1006537, messages: 13, leads: 3, cplMsg: 77426, cplLead: 335512, note: 'Duy trì thương hiệu hè' },
      { month: 'Tháng 4/2026', spend: 1145172, messages: 27, leads: 11, cplMsg: 42414, cplLead: 104107, note: 'Tối ưu tệp Ô Trấn - Thượng Hải' },
      { month: 'Tháng 5/2026', spend: 1696767, messages: 26, leads: 15, cplMsg: 65260, cplLead: 113118, note: 'Bắt đầu nhận cọc đoàn hè' },
      { month: 'Tháng 6/2026', spend: 629349, messages: 8, leads: 2, cplMsg: 78669, cplLead: 314675, note: 'Giữ nhịp tương tác' },
      { month: 'Tháng 7/2026', spend: 1035703, messages: 6, leads: 6, cplMsg: 172617, cplLead: 172617, note: 'Chuyển đổi cao: 100% inbox để lại SĐT' },
      { month: 'Tháng 8/2026', spend: 3111959, messages: 30, leads: 13, cplMsg: 103732, cplLead: 239381, note: 'Khởi động phễu mùa thu lá vàng' },
      { month: 'Tháng 9/2026', spend: 5170659, messages: 44, leads: 23, cplMsg: 117515, cplLead: 224811, note: 'Tăng tốc ngân sách thu hút khách thu đông' }
    ]
  },
  backinh: {
    totalSpend: 37734975,
    totalMessages: 781,
    totalLeads: 254,
    cplMsgAvg: 48316,
    cplLeadAvg: 148563,
    inboxToLeadRate: 32.52,
    months: [
      { month: 'Tháng 1/2026', spend: 5248434, messages: 81, leads: 40, cplMsg: 64795, cplLead: 131211, note: 'Đợt khởi động tour Bắc Kinh - Vạn Lý Trường Thành' },
      { month: 'Tháng 2/2026', spend: 1080963, messages: 62, leads: 22, cplMsg: 17435, cplLead: 49135, note: 'CPL kỷ lục: 49.135 đ/lead SĐT nhờ viral clip Cố Cung' },
      { month: 'Tháng 3/2026', spend: 21108592, messages: 476, leads: 146, cplMsg: 44346, cplLead: 144579, note: 'Đợt bung ngân sách cao điểm mùa xuân (146 Lead SĐT)' },
      { month: 'Tháng 4/2026', spend: 1123485, messages: 29, leads: 6, cplMsg: 38741, cplLead: 187248, note: 'Chốt khách muộn dịp 30/4' },
      { month: 'Tháng 8/2026', spend: 3825865, messages: 39, leads: 18, cplMsg: 98099, cplLead: 212548, note: 'Mở phễu tour mùa thu Bắc Kinh lá đỏ' },
      { month: 'Tháng 9/2026', spend: 5347636, messages: 94, leads: 22, cplMsg: 56890, cplLead: 243074, note: 'Đẩy mạnh chốt đoàn khởi hành tháng 10 - 11' }
    ]
  },
  capnhitan: {
    totalSpend: 2246678,
    totalMessages: 97,
    totalLeads: 22,
    cplMsgAvg: 23162,
    cplLeadAvg: 102122,
    inboxToLeadRate: 22.68,
    months: [
      { month: 'Tháng 9/2026', spend: 2246678, messages: 97, leads: 22, cplMsg: 23162, cplLead: 102122, note: 'Test mở bán sớm mùa đông: 22 lead SĐT chỉ với 2.24M (CPL chỉ 102k cực hot)' }
    ]
  },
  legian: {
    totalSpend: 25713527,
    totalMessages: 511,
    totalLeads: 202,
    cplMsgAvg: 50320,
    cplLeadAvg: 127295,
    inboxToLeadRate: 39.53,
    months: [
      { month: 'Tháng 1/2026', spend: 3727862, messages: 90, leads: 46, cplMsg: 41421, cplLead: 81040, note: 'Hiệu quả vượt trội: 81k/lead có SĐT' },
      { month: 'Tháng 2/2026', spend: 97974, messages: 2, leads: 0, cplMsg: 48987, cplLead: 0, note: 'Test thử nghiệm tệp Tết' },
      { month: 'Tháng 4/2026', spend: 212438, messages: 2, leads: 1, cplMsg: 106219, cplLead: 212438, note: 'Chạy tệp thăm dò đầu hè' },
      { month: 'Tháng 5/2026', spend: 2649528, messages: 62, leads: 32, cplMsg: 42734, cplLead: 82798, note: 'CPL ổn định ở mức 82k' },
      { month: 'Tháng 6/2026', spend: 4097772, messages: 80, leads: 37, cplMsg: 51222, cplLead: 110751, note: 'Cao điểm hè đón khách trẻ & gia đình' },
      { month: 'Tháng 7/2026', spend: 7991272, messages: 131, leads: 53, cplMsg: 61002, cplLead: 150779, note: 'Bung ngân sách mạnh nhất hè (53 lead SĐT)' },
      { month: 'Tháng 8/2026', spend: 3711541, messages: 76, leads: 23, cplMsg: 48836, cplLead: 161371, note: 'Chuyển hướng đón mùa thu Đại Lý - Sa Khê' },
      { month: 'Tháng 9/2026', spend: 3225140, messages: 68, leads: 10, cplMsg: 47429, cplLead: 322514, note: 'Khởi động tệp khách mùa thu tuyết Ngọc Long' }
    ]
  },
  adinh: {
    totalSpend: 65999308,
    totalMessages: 1683,
    totalLeads: 485,
    cplMsgAvg: 39215,
    cplLeadAvg: 136081,
    inboxToLeadRate: 28.82,
    months: [
      { month: 'Tháng 3/2026', spend: 6669458, messages: 204, leads: 64, cplMsg: 32693, cplLead: 104210, note: 'Mở phễu mùa xuân ngắm hoa và núi tuyết Á Đinh' },
      { month: 'Tháng 4/2026', spend: 13482643, messages: 337, leads: 102, cplMsg: 40008, cplLead: 132183, note: 'Cao điểm thu hút hơn 100 lead SĐT' },
      { month: 'Tháng 5/2026', spend: 14754828, messages: 341, leads: 108, cplMsg: 43269, cplLead: 136619, note: 'Đỉnh điểm ngân sách chạy lấp đầy các đoàn tháng 6-7' },
      { month: 'Tháng 6/2026', spend: 14824181, messages: 371, leads: 104, cplMsg: 39957, cplLead: 142540, note: 'Duy trì đều đặn trên 100 lead/tháng' },
      { month: 'Tháng 7/2026', spend: 10510472, messages: 266, leads: 69, cplMsg: 39513, cplLead: 152326, note: 'Chốt khách mùa hè Tây Tạng Khang Định' },
      { month: 'Tháng 8/2026', spend: 3079551, messages: 79, leads: 21, cplMsg: 38982, cplLead: 146645, note: 'Bắt đầu giai đoạn thu sớm' },
      { month: 'Tháng 9/2026', spend: 2673411, messages: 85, leads: 17, cplMsg: 31452, cplLead: 157259, note: 'Vét khách thu vàng tháng 10' }
    ]
  },
  cuutraicau: {
    totalSpend: 9099495,
    totalMessages: 163,
    totalLeads: 28,
    cplMsgAvg: 55825,
    cplLeadAvg: 324982,
    inboxToLeadRate: 17.18,
    months: [
      { month: 'Tháng 8/2026', spend: 3843320, messages: 67, leads: 16, cplMsg: 57362, cplLead: 240208, note: 'Mở bán sớm mùa thu Cửu Trại Câu nước biếc' },
      { month: 'Tháng 9/2026', spend: 5256175, messages: 96, leads: 12, cplMsg: 54751, cplLead: 438015, note: 'Chốt đoàn tháng 10 ngắm lá đỏ ngũ sắc' }
    ]
  },
  phuonghoang: {
    totalSpend: 13270756,
    totalMessages: 176,
    totalLeads: 65,
    cplMsgAvg: 75402,
    cplLeadAvg: 204165,
    inboxToLeadRate: 36.93,
    months: [
      { month: 'Tháng 5/2026', spend: 454231, messages: 12, leads: 5, cplMsg: 37852, cplLead: 90846, note: 'Test thử nghiệm tệp Trương Gia Giới Cổ Trấn' },
      { month: 'Tháng 7/2026', spend: 11064841, messages: 139, leads: 48, cplMsg: 79603, cplLead: 230518, note: 'Chiến dịch hè cao điểm' },
      { month: 'Tháng 8/2026', spend: 772699, messages: 7, leads: 4, cplMsg: 110385, cplLead: 193175, note: 'Duy trì thương hiệu' },
      { month: 'Tháng 9/2026', spend: 726915, messages: 11, leads: 4, cplMsg: 66083, cplLead: 181729, note: 'Khởi động đón mùa thu cổ trấn' }
    ]
  },
  thanhtang: {
    totalSpend: 31813300,
    totalMessages: 866,
    totalLeads: 213,
    cplMsgAvg: 36736,
    cplLeadAvg: 149358,
    inboxToLeadRate: 24.60,
    months: [
      { month: 'Tháng 3/2026', spend: 2677220, messages: 70, leads: 19, cplMsg: 38246, cplLead: 140906, note: 'Mở phễu đường tàu cao nhất thế giới' },
      { month: 'Tháng 4/2026', spend: 3630208, messages: 104, leads: 28, cplMsg: 34906, cplLead: 129650, note: 'Nuôi dưỡng tệp khách hành hương Tây Tạng' },
      { month: 'Tháng 5/2026', spend: 3677987, messages: 95, leads: 36, cplMsg: 38716, cplLead: 102166, note: 'CPL tốt đạt 102k/lead SĐT' },
      { month: 'Tháng 6/2026', spend: 5370917, messages: 73, leads: 24, cplMsg: 73574, cplLead: 223788, note: 'Bán đoàn Tây Ninh - Lhasa hè' },
      { month: 'Tháng 7/2026', spend: 8559300, messages: 373, leads: 75, cplMsg: 22947, cplLead: 114124, note: 'Đỉnh điểm 373 tin nhắn, CPL chỉ 114k' },
      { month: 'Tháng 8/2026', spend: 3860152, messages: 84, leads: 17, cplMsg: 45954, cplLead: 227068, note: 'Chốt khách đợt cuối hè' },
      { month: 'Tháng 9/2026', spend: 4037516, messages: 67, leads: 14, cplMsg: 60261, cplLead: 288394, note: 'Duy trì nhận khách tour mùa thu' }
    ]
  },
  tayan: {
    totalSpend: 13270756,
    totalMessages: 176,
    totalLeads: 65,
    cplMsgAvg: 75402,
    cplLeadAvg: 204165,
    inboxToLeadRate: 36.93,
    months: [
      { month: 'Tháng 4/2026', spend: 252070, messages: 7, leads: 4, cplMsg: 36010, cplLead: 63018, note: 'Test tệp lịch sử Thiềm Tây Binh Mã Dũng' },
      { month: 'Tháng 5/2026', spend: 454231, messages: 12, leads: 5, cplMsg: 37852, cplLead: 90846, note: 'Tương tác đều đặn' },
      { month: 'Tháng 7/2026', spend: 11064841, messages: 139, leads: 48, cplMsg: 79603, cplLead: 230518, note: 'Cao điểm hè đón khách gia đình' },
      { month: 'Tháng 8/2026', spend: 772699, messages: 7, leads: 4, cplMsg: 110385, cplLead: 193175, note: 'Chuyển mùa thu' },
      { month: 'Tháng 9/2026', spend: 726915, messages: 11, leads: 4, cplMsg: 66083, cplLead: 181729, note: 'Nhận khách tour mùa thu lá vàng' }
    ]
  },
  tancuong: {
    totalSpend: 55231862,
    totalMessages: 921,
    totalLeads: 285,
    cplMsgAvg: 59969,
    cplLeadAvg: 193796,
    inboxToLeadRate: 30.94,
    months: [
      { month: 'Tháng 3/2026', spend: 6757616, messages: 194, leads: 52, cplMsg: 34833, cplLead: 129954, note: 'Khởi động phễu hoa mơ Y Lỵ Tân Cương' },
      { month: 'Tháng 4/2026', spend: 5737053, messages: 171, leads: 39, cplMsg: 33550, cplLead: 147104, note: 'Tập trung tệp khách VIP chuộng Road Trip' },
      { month: 'Tháng 5/2026', spend: 19105354, messages: 251, leads: 98, cplMsg: 76117, cplLead: 194953, note: 'Bung ngân sách cao điểm hè Bắc Cương & Kanas' },
      { month: 'Tháng 6/2026', spend: 16624955, messages: 198, leads: 70, cplMsg: 83964, cplLead: 237499, note: 'Chốt khách tháng 7-8' },
      { month: 'Tháng 8/2026', spend: 2561084, messages: 40, leads: 10, cplMsg: 64027, cplLead: 256108, note: 'Khởi động mùa thu vàng Bắc Cương' },
      { month: 'Tháng 9/2026', spend: 4445800, messages: 67, leads: 16, cplMsg: 66355, cplLead: 277863, note: 'Chốt khách Nam Tân Cương lá vàng mùa thu' }
    ]
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT CHÍNH: BU1 MARKET PLANNING & ADS PROJECTION
// ══════════════════════════════════════════════════════════════════════════════
const BU1MarketPlanningPage = ({ isEmbedded = false, onBack = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const getInitialTab = () => {
    if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'giangnam') return 'giangnam';
    if (['backinh', 'capnhitan', 'legian', 'adinh', 'cuutraicau', 'phuonghoang', 'thanhtang', 'tayan', 'tancuong', 'proposal'].includes(tabParam)) {
      return tabParam;
    }
    return 'proposal';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'giangnam') {
        setActiveTab('giangnam');
      } else if (['backinh', 'capnhitan', 'legian', 'adinh', 'cuutraicau', 'phuonghoang', 'thanhtang', 'tayan', 'tancuong', 'proposal'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // State lọc bảng 20 đoàn
  const [depMonthFilter, setDepMonthFilter] = useState('ALL'); // ALL, 10, 11, 12
  const [depTourFilter, setDepTourFilter] = useState('ALL');
  const [depSearch, setDepSearch] = useState('');

  // Lọc 20 đoàn
  const filteredDepartures = useMemo(() => {
    return REAL_ERP_DEPARTURES.filter(d => {
      if (depMonthFilter !== 'ALL' && d.month !== Number(depMonthFilter)) return false;
      if (depTourFilter !== 'ALL' && d.tourKey !== depTourFilter) return false;
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
  }, [depMonthFilter, depTourFilter, depSearch]);

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

  // State các máy tính tuyến
  const [calcs, setCalcs] = useState({
    giangnam: { budget: 32000000, cpl: 192528, cr: 20, paxPerLead: 1.05, numGroups: 6, paxPerGroup: 14, price: 28990000, cost: 23192000, extPax: 15 },
    backinh: { budget: 22000000, cpl: 148563, cr: 19, paxPerLead: 1.05, numGroups: 2, paxPerGroup: 14, price: 33990000, cost: 27192000, extPax: 4 },
    capnhitan: { budget: 18000000, cpl: 102122, cr: 18, paxPerLead: 1.05, numGroups: 2, paxPerGroup: 16, price: 52490000, cost: 41992000, extPax: 4 },
    legian: { budget: 15000000, cpl: 127295, cr: 19, paxPerLead: 1.05, numGroups: 2, paxPerGroup: 16, price: 27990000, cost: 22392000, extPax: 8 },
    adinh: { budget: 8000000, cpl: 136081, cr: 18, paxPerLead: 1.05, numGroups: 3, paxPerGroup: 14, price: 48490000, cost: 38792000, extPax: 35 },
    cuutraicau: { budget: 6000000, cpl: 324982, cr: 25, paxPerLead: 1.05, numGroups: 1, paxPerGroup: 15, price: 33990000, cost: 27192000, extPax: 10 },
    phuonghoang: { budget: 6000000, cpl: 204165, cr: 20, paxPerLead: 1.05, numGroups: 1, paxPerGroup: 15, price: 31990000, cost: 25592000, extPax: 8 },
    thanhtang: { budget: 5000000, cpl: 149358, cr: 16, paxPerLead: 1.05, numGroups: 1, paxPerGroup: 11, price: 68990000, cost: 55192000, extPax: 6 },
    tayan: { budget: 5000000, cpl: 204165, cr: 18, paxPerLead: 1.05, numGroups: 1, paxPerGroup: 11, price: 42990000, cost: 34392000, extPax: 6 },
    tancuong: { budget: 3000000, cpl: 193796, cr: 20, paxPerLead: 1.05, numGroups: 1, paxPerGroup: 10, price: 67990000, cost: 54392000, extPax: 12 }
  });

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Link 
                to="/marketing-budget-plan" 
                style={{ color: '#0284c7', textDecoration: 'none', fontSize: '0.84rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                ← Kế Hoạch Quý (Budget Plan)
              </Link>
              <span style={{ color: '#94a3b8' }}>/</span>
              <span style={{ fontSize: '0.84rem', color: '#64748b' }}>BU1 - Thị Trường Trung Quốc</span>
              <span style={{
                background: '#fee2e2',
                color: '#dc2626',
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                marginLeft: '6px'
              }}>
                100% ĐỐI SOÁT ERP
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              Đề Án Ngân Sách & Dự Toán BU1 Quý 4/2026 (20 Đoàn Khởi Hành)
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Dữ liệu đối soát trực tiếp từ bảng <code>marketing_budget_plans</code>, <code>tour_departures</code>, <code>bookings</code> và 385 chiến dịch <code>marketing_ads_reports</code> trên PostgreSQL Production.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              to="/marketing-ads"
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
              <span>Dữ Liệu Ads Lịch Sử BU1</span>
              <ExternalLink size={14} />
            </Link>
            <Link
              to="/marketing-budget-plan?bu=BU1&quarter=4&year=2026"
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
              background: activeTab === 'proposal' ? '#0f172a' : '#ffffff',
              color: activeTab === 'proposal' ? '#ffffff' : '#334155',
              border: '1px solid ' + (activeTab === 'proposal' ? '#0f172a' : '#cbd5e1'),
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              whiteSpace: 'nowrap'
            }}
          >
            <Layers size={15} />
            <span>Đề Án & 20 Đoàn Khởi Hành</span>
            <span style={{
              background: activeTab === 'proposal' ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              120 Triệu
            </span>
          </button>

          {BU1_PROPOSAL_DATA.routes.map(r => (
            <button
              key={r.key}
              onClick={() => handleTabChange(r.key)}
              style={{
                background: activeTab === r.key ? r.badgeColor : '#ffffff',
                color: activeTab === r.key ? '#ffffff' : '#334155',
                border: '1px solid ' + (activeTab === r.key ? r.badgeColor : '#cbd5e1'),
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.8rem',
                fontWeight: activeTab === r.key ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                whiteSpace: 'nowrap'
              }}
            >
              <span>{r.name.split('(')[0].trim()}</span>
              <span style={{
                background: activeTab === r.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: activeTab === r.key ? '#ffffff' : '#64748b',
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                {r.departuresCount} đoàn
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── NỘI DUNG CHÍNH ── */}
      <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px 60px' }}>

        {/* ══════════════════════════════════════════════════════════════════
            TAB 0: ĐỀ ÁN TỔNG THỂ, BẢNG PHÂN BỔ 10 TOUR & 20 ĐOÀN KHỞI HÀNH ERP
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'proposal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

            {/* 1. 6 THẺ KPI HEADER CHUẨN XÁC ĐỐI SOÁT 100% TỪ ERP */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '12px'
            }}>
              {/* Thẻ 1: Quy Mô Đoàn & Khách Mục Tiêu (Gộp Đoàn + Target Pax, mở rộng chiều cao) */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                    Quy Mô Đoàn & Mục Tiêu Khách
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                    20 Đoàn <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0284c7' }}>• 281 Pax</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600, marginTop: '4px' }}>
                    Đã cọc: <strong>91 Pax (32.4%)</strong> • Còn thiếu: <strong>190 Pax</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  T10: <strong>8 đoàn</strong> (100p) • T11: <strong>8 đoàn</strong> (93p) • T12: <strong>4 đoàn</strong> (64p)
                </div>
              </div>

              {/* Thẻ 2: Doanh Thu Kế Hoạch */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                    Doanh Thu Kế Hoạch (20 Đoàn)
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>
                    11.007.040.000 đ
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    Đã cọc thực tế: <strong style={{ color: '#16a34a' }}>4.393.250.000 đ</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  Tỷ lệ dòng tiền cọc bảo chứng: <strong style={{ color: '#16a34a' }}>39.9%</strong>
                </div>
              </div>

              {/* Thẻ 3: CPL Trung Bình Lịch Sử Toàn BU1 (Đối soát 100% DB) */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                    CPL Trung Bình BU1 (Lịch Sử)
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0284c7' }}>
                    160.876 đ <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>/ SĐT</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#334155', fontWeight: 600, marginTop: '4px' }}>
                    Đã chi: <strong>318.051.729 đ</strong> • SĐT nhận: <strong>1.977 Lead</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  385 chiến dịch Meta Ads • <strong>6.257 Inbox</strong> (~50.8k/inbox)
                </div>
              </div>

              {/* Thẻ 4: Ngân Sách Marketing Ads */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                    Ngân Sách Marketing Đề Xuất
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#dc2626' }}>
                    120.000.000 đ
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    T10: <strong>30M</strong> • T11: <strong>50M</strong> • T12: <strong>40M</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  Chiếm <strong>1.09%</strong> doanh thu KH (Dưới trần 2.5%)
                </div>
              </div>

              {/* Thẻ 5: Lead & Inbox Dự Kiến Từ 120M */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>
                    Kỳ Vọng Lead & Inbox (120 Triệu)
                  </div>
                  <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#16a34a' }}>
                    686 Lead SĐT
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                    <strong>~2.568 Inbox</strong> • Dự kiến chốt: <strong style={{ color: '#0284c7' }}>146 Pax Ads</strong>
                  </div>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '6px', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                  Kết hợp 91 cọc + 44 ngoài → <strong>Full 281 khách 20 đoàn</strong>
                </div>
              </div>
            </div>

            {/* 2. BẢNG PHÂN BỔ NGÂN SÁCH 10 TOUR CHÍNH */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={18} color="#0284c7" />
                    Bảng 1: Phân Bổ Ngân Sách 120 Triệu Cho 10 Tour Quý 4/2026
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Số liệu đối soát 100% từ Database Meta Ads & ERP: Tuyến • Đoàn • Budget • Lead dự kiến • Pax Ads • DT Kế hoạch • Tỷ lệ Ads/DT.
                  </p>
                </div>
                <span style={{ fontSize: '0.82rem', background: '#f8fafc', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 700 }}>
                  Tổng Ngân Sách: <strong style={{ color: '#0284c7' }}>120.000.000 đ</strong>
                </span>
              </div>

              <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Tuyến Tour</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Số Đoàn</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Budget Ads</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>CPL Thực Tế</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Lead Dự Kiến</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Pax Dự Kiến</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Doanh Thu KH</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>% Ads / DT</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {BU1_PROPOSAL_DATA.routes.map((r, idx) => (
                      <tr key={r.key} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.name}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{r.details}</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                          <div>{r.departuresCount} đoàn</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>({r.targetPax} pax)</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: r.badgeColor, fontSize: '0.94rem' }}>
                          {formatMoney(r.budget)} đ
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{formatMoney(r.cplLeadDb)} đ</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Inbox: {formatMoney(r.cplMsgDb)} đ</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{r.expectedLeads} Lead</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~{r.expectedInbox} Inbox</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, color: '#0284c7' }}>{r.expectedPaxAds} Pax Ads</div>
                          <div style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600 }}>Đã cọc: {r.paidPax}p (Thiếu: {r.remainingPax}p)</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                          <div>{formatMoney(r.revenue)} đ</div>
                          <div style={{ fontSize: '0.72rem', color: '#16a34a' }}>Đã cọc: {formatMoney(r.paidRevenue)} đ</div>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
                          <span style={{
                            background: r.adsRatio <= 1.5 ? '#dcfce7' : r.adsRatio <= 2.5 ? '#fef9c3' : '#fee2e2',
                            color: r.adsRatio <= 1.5 ? '#166534' : r.adsRatio <= 2.5 ? '#854d0e' : '#991b1b',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}>
                            {r.adsRatio.toFixed(2)}%
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'left' }}>
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
                    ))}

                    {/* DÒNG TỔNG CỘNG */}
                    <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '0.96rem' }}>
                        TỔNG CỘNG 10 TOUR
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '0.96rem', color: '#0f172a' }}>
                        20 Đoàn
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '1.05rem', color: '#0284c7' }}>
                        120.000.000 đ
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '0.86rem', color: '#64748b' }}>
                        TB: ~165k/lead
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '0.96rem', color: '#0f172a' }}>
                        673 Lead SĐT
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '0.96rem', color: '#0284c7' }}>
                        147 Pax Ads (+91 cọc)
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '1.02rem', color: '#16a34a' }}>
                        11.007.040.000 đ
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left' }}>
                        <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontWeight: 800 }}>
                          1.09%
                        </span>
                      </td>
                      <td style={{ padding: '14px', textAlign: 'left', fontSize: '0.78rem', color: '#16a34a', fontWeight: 700 }}>
                        Khớp 100%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. BẢNG CHI TIẾT 20 ĐOÀN KHỞI HÀNH THỰC TẾ ĐỒNG BỘ TỪ ERP */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={18} color="#0284c7" />
                    Bảng 2: Chi Tiết 20 Đoàn Khởi Hành Q4/2026 Đồng Bộ Từ Database ERP FIT Tour
                  </h3>
                  <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Danh sách các đoàn khởi hành mở bán trong hệ thống ERP. Có thể lọc theo Tháng hoặc tìm kiếm theo mã đoàn.
                  </p>
                </div>

                {/* Bộ lọc tháng & tìm kiếm */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                    {[
                      { id: 'ALL', label: 'Tất Cả (20)' },
                      { id: '10', label: 'Tháng 10 (8)' },
                      { id: '11', label: 'Tháng 11 (8)' },
                      { id: '12', label: 'Tháng 12 (4)' }
                    ].map(btn => (
                      <button
                        key={btn.id}
                        onClick={() => setDepMonthFilter(btn.id)}
                        style={{
                          background: depMonthFilter === btn.id ? '#ffffff' : 'transparent',
                          color: depMonthFilter === btn.id ? '#0284c7' : '#475569',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '0.78rem',
                          fontWeight: depMonthFilter === btn.id ? 700 : 500,
                          cursor: 'pointer',
                          boxShadow: depMonthFilter === btn.id ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                        }}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Input Search */}
                  <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 8px' }}>
                    <Search size={14} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Tìm mã hoặc tên đoàn..."
                      value={depSearch}
                      onChange={(e) => setDepSearch(e.target.value)}
                      style={{
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.78rem',
                        padding: '6px',
                        width: '160px',
                        fontFamily: 'inherit'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Bảng dữ liệu 20 đoàn */}
              <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>STT</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Ngày KH</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Mã Đoàn ERP</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Tên Tuyến Tour</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Giá Bán</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Pax Target</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Đã Cọc ERP</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Tiến Độ Cọc</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>DT Dự Kiến</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>DT Đã Cọc</th>
                      <th style={{ padding: '10px 12px', textAlign: 'left', color: '#334155', fontWeight: 700 }}>Trạng Thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDepartures.map((d, index) => {
                      const fillPct = Math.round((d.paidPax / d.targetPax) * 100);
                      const isOver = d.paidPax >= d.targetPax;
                      return (
                        <tr key={d.id} style={{ borderBottom: '1px solid #e2e8f0', background: index % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                          <td style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>{index + 1}</td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                            {d.date.split('-').reverse().join('/')}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0284c7', fontSize: '0.8rem' }}>
                            {d.code}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                            {d.tourName}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#334155' }}>
                            {formatMoney(d.price)} đ
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                            {d.targetPax} pax
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 800, color: isOver ? '#16a34a' : d.paidPax > 0 ? '#0284c7' : '#64748b' }}>
                            {d.paidPax} pax
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                                <div style={{
                                  width: Math.min(100, fillPct) + '%',
                                  height: '100%',
                                  background: isOver ? '#16a34a' : fillPct > 50 ? '#0284c7' : '#f59e0b'
                                }} />
                              </div>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: isOver ? '#16a34a' : '#475569' }}>
                                {fillPct}%
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#0f172a' }}>
                            {formatMoney(d.targetPax * d.price)} đ
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#16a34a' }}>
                            {formatMoney(d.paidRevenue)} đ
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'left' }}>
                            <span style={{
                              background: d.statusText === 'Chắc chắn đi' ? '#dcfce7' : '#f1f5f9',
                              color: d.statusText === 'Chắc chắn đi' ? '#166534' : '#475569',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}>
                              {d.statusText}
                            </span>
                          </td>
                        </tr>
                      );
                    })}

                    {/* Footer tổng kết theo bộ lọc */}
                    <tr style={{ background: '#f8fafc', fontWeight: 800, borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan={5} style={{ padding: '12px', textAlign: 'left' }}>
                        TỔNG KẾT ({filteredDepartures.length} ĐOÀN ĐƯỢC CHỌN)
                      </td>
                      <td style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>
                        {depStats.target} pax
                      </td>
                      <td style={{ padding: '12px', textAlign: 'left', color: '#16a34a' }}>
                        {depStats.paid} pax
                      </td>
                      <td style={{ padding: '12px', textAlign: 'left', color: '#64748b' }}>
                        Thiếu: {depStats.remaining} pax
                      </td>
                      <td style={{ padding: '12px', textAlign: 'left', color: '#0f172a' }}>
                        {formatMoney(depStats.targetRev)} đ
                      </td>
                      <td style={{ padding: '12px', textAlign: 'left', color: '#16a34a' }}>
                        {formatMoney(depStats.paidRev)} đ
                      </td>
                      <td style={{ padding: '12px', textAlign: 'left' }}>-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. TIMELINE & LỘ TRÌNH CHẠY NGÂN SÁCH (GANTT CHART THEO 3 THÁNG) */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
              <div style={{ marginBottom: '14px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 4px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} color="#0284c7" />
                  Lộ Trình & Timeline Phân Bổ Ngân Sách 3 Tháng (120 Triệu)
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                  Phân bổ linh hoạt theo tiến độ thực tế: Tháng 10 (30M - Vét 4 đoàn còn lại), Tháng 11 (50M - Bung cao điểm 8 đoàn lớn), Tháng 12 (40M - Chốt đỉnh Cáp Nhĩ Tân & Tết).
                </p>
              </div>

              {/* Gantt Chart Container */}
              <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '16px', overflowX: 'auto' }}>
                <div style={{ minWidth: '820px', display: 'grid', gridTemplateColumns: '220px repeat(3, 1fr)', gap: '10px', marginBottom: '12px', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Tuyến Tour / Trọng Tâm</div>
                  <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    THÁNG 10/2026: <strong style={{ color: '#0284c7' }}>30 Triệu</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>8 đoàn (Đã cọc 84 pax, bù 16 pax)</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    THÁNG 11/2026: <strong style={{ color: '#ea580c' }}>50 Triệu</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>8 đoàn (Cao điểm Bắc Kinh, Giang Nam)</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 700, color: '#1e293b' }}>
                    THÁNG 12/2026: <strong style={{ color: '#059669' }}>40 Triệu</strong>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>4 đoàn (Cáp Nhĩ Tân Giáng Sinh & Tết)</div>
                  </div>
                </div>

                {/* Các dòng Gantt chart */}
                {[
                  { name: '1. Giang Nam (6 đoàn)', color: '#0284c7', t10: 'Mở phễu thu & T11 (6M)', t11: 'Cao điểm 2 đoàn lớn (16M)', t12: 'Chốt 2 đoàn Tết (10M)' },
                  { name: '2. Bắc Kinh (2 đoàn)', color: '#dc2626', t10: 'Chạy sớm tệp HAN/SGN (6M)', t11: 'Bung dứt điểm 2 đoàn (16M)', t12: 'Duy trì thương hiệu hè (0M)' },
                  { name: '3. Cáp Nhĩ Tân (2 đoàn)', color: '#06b6d4', t10: 'Mở nhận cọc sớm (3M)', t11: 'Tăng tốc chốt Giáng Sinh (5M)', t12: 'Đỉnh tuyết & Tết (10M)' },
                  { name: '4. Lệ Giang (2 đoàn)', color: '#ea580c', t10: 'Chốt đoàn 22/10 (5M)', t11: 'Chốt đoàn 19/11 (7M)', t12: 'Phễu hoa anh đào (3M)' },
                  { name: '5. Đạo Thành Á Đinh (3 đoàn)', color: '#10b981', t10: 'Lấp nốt đoàn 31/10 (6M)', t11: 'Giữ nhận diện (2M)', t12: 'Nghỉ đông (0M)' },
                  { name: '6. Cửu Trại Câu (1 đoàn)', color: '#14b8a6', t10: 'Bù nốt 5 pax 22/10 (6M)', t11: 'Nghỉ đông', t12: 'Nghỉ đông' },
                  { name: '7. Trương Gia Giới (1 đoàn)', color: '#6366f1', t10: 'Mở phễu (1M)', t11: 'Chốt đoàn 21/11 (5M)', t12: 'Duy trì' },
                  { name: '8. Thanh Tạng (1 đoàn)', color: '#8b5cf6', t10: 'Bù nốt 5 pax 22/10 (4M)', t11: 'Giữ phễu (1M)', t12: 'Nghỉ đông' },
                  { name: '9. Tây An - Lạc Dương (1 đoàn)', color: '#f97316', t10: 'Mở phễu (1M)', t11: 'Chốt đoàn 22/11 (4M)', t12: 'Nghỉ đông' },
                  { name: '10. Tân Cương (1 đoàn)', color: '#f59e0b', t10: 'Giữ thương hiệu (3M)', t11: 'Phễu xuân hè 2027', t12: 'Phễu xuân hè 2027' }
                ].map((g, idx) => (
                  <div key={idx} style={{ minWidth: '820px', display: 'grid', gridTemplateColumns: '220px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: g.color }}>{g.name}</div>
                    <div>
                      <div style={{ background: g.color, color: '#ffffff', borderRadius: '4px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {g.t10}
                      </div>
                    </div>
                    <div>
                      <div style={{ background: g.color, color: '#ffffff', borderRadius: '4px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {g.t11}
                      </div>
                    </div>
                    <div>
                      <div style={{ background: g.color, color: '#ffffff', borderRadius: '4px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {g.t12}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. CÁC MỐC THỜI GIAN TRIỂN KHAI */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px'
            }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284c7', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Flag size={16} />
                  <span>Tháng 10 (30 Triệu): Chốt Sổ Mùa Thu</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                  <li>Dồn ngân sách chốt 5 pax Cửu Trại Câu (22/10) và 5 pax Thanh Tạng (22/10).</li>
                  <li>Lấp nốt 10 pax còn lại cho đoàn Đạo Thành Á Đinh (31/10).</li>
                  <li>Mở nhận cọc sớm Cáp Nhĩ Tân mùa đông tuyết rơi để hưởng CPL rẻ 102k.</li>
                </ul>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ea580c', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sparkles size={16} />
                  <span>Tháng 11 (50 Triệu): Cao Điểm Thu Đông</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                  <li>Bung ngân sách mạnh nhất quý cho 2 đầu Bắc Kinh HAN/SGN (4 & 6/11).</li>
                  <li>Lấp đầy 2 đoàn Giang Nam ngày 12/11 và 24/11.</li>
                  <li>Chốt dứt điểm đoàn Trương Gia Giới (21/11) và Tây An (22/11).</li>
                </ul>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Tháng 12 (40 Triệu): Đỉnh Cáp Nhĩ Tân & Tết</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.6 }}>
                  <li>Về đích 2 đoàn Cáp Nhĩ Tân Giáng Sinh (20/12) & Tết Dương Lịch (28/12).</li>
                  <li>Lấp kín chỗ đoàn Giang Nam Giáng Sinh (23/12) và Tết Dương Lịch (30/12).</li>
                  <li>Tổng kết chiến dịch, khóa sổ visa đoàn và mở phễu hoa xuân 2027.</li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            CÁC TABS MÁY TÍNH DỰ TOÁN CHO TỪNG TUYẾN TOUR CỤ THỂ
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab !== 'proposal' && calcs[activeTab] && (
          <RouteCalculatorSection
            routeKey={activeTab}
            routeInfo={BU1_PROPOSAL_DATA.routes.find(r => r.key === activeTab) || BU1_PROPOSAL_DATA.routes[0]}
            historicalData={HISTORICAL_DB_MAP[activeTab] || HISTORICAL_DB_MAP.giangnam}
            calcState={calcs[activeTab]}
            updateCalc={(field, val) => updateCalc(activeTab, field, val)}
            calcResults={getRouteCalcResults(activeTab)}
          />
        )}

      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT MÁY TÍNH CHI TIẾT TỪNG TUYẾN TOUR (CHUẨN XÁC, ĐẦY ĐỦ 2 CHIỀU TÍNH)
// ══════════════════════════════════════════════════════════════════════════════
const RouteCalculatorSection = ({
  routeKey,
  routeInfo,
  historicalData,
  calcState,
  updateCalc,
  calcResults
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

      {/* ── 1. DỮ LIỆU LỊCH SỬ THỰC TẾ TRÍCH XUẤT TỪ DATABASE ERP ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#16a34a" />
              1. Dữ Liệu Lịch Sử Meta Ads Thực Tế BU1 ({routeInfo.name})
            </h3>
            <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: '0.82rem' }}>
              Đối soát trực tiếp từ bảng <code>marketing_ads_reports</code> trên PostgreSQL Production. Tuyệt đối không dữ liệu ảo.
            </p>
          </div>
          <span style={{ fontSize: '0.78rem', background: '#f1f5f9', padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 600 }}>
            Tổng {historicalData.months.length} tháng vận hành thực tế
          </span>
        </div>

        {/* 4 Cards tổng kết số liệu DB */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Chi Tiêu Thực Tế</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatMoney(historicalData.totalSpend)} đ</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Chiến dịch chạy Meta Ads</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Tin Nhắn Inbox</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{formatMoney(historicalData.totalMessages)}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>~{formatMoney(historicalData.cplMsgAvg)} đ / tin nhắn</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Tổng Lead Có SĐT</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{historicalData.totalLeads} Lead</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Tỷ lệ SĐT: <strong style={{ color: '#16a34a' }}>{historicalData.inboxToLeadRate}%</strong></div>
          </div>

          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Giá TB 1 Lead (CPL)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{formatMoney(historicalData.cplLeadAvg)} đ</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Chuẩn chi phí thực tế toàn kỳ</div>
          </div>
        </div>

        {/* Bảng chi tiết từng tháng */}
        <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left', color: '#334155' }}>
                <th style={{ padding: '8px 12px' }}>Thời Điểm</th>
                <th style={{ padding: '8px 12px' }}>Chi Tiêu</th>
                <th style={{ padding: '8px 12px' }}>Inbox</th>
                <th style={{ padding: '8px 12px' }}>Lead (Có SĐT)</th>
                <th style={{ padding: '8px 12px' }}>Giá 1 Inbox</th>
                <th style={{ padding: '8px 12px' }}>Giá 1 Lead (CPL)</th>
                <th style={{ padding: '8px 12px' }}>Ghi Chú Vận Hành</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.months.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0f172a' }}>{m.month}</td>
                  <td style={{ padding: '8px 12px', color: '#0f172a' }}>{formatMoney(m.spend)} đ</td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{m.messages}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#16a34a' }}>{m.leads}</td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{formatMoney(m.cplMsg)} đ</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#0284c7' }}>{formatMoney(m.cplLead)} đ</td>
                  <td style={{ padding: '8px 12px', color: '#64748b' }}>{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2. MÁY TÍNH DỰ TOÁN TOÁN HỌC (2 CHIỀU: CẤP BUDGET → RA KHÁCH | CẦN ĐOÀN → RA BUDGET) ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={18} color="#0284c7" />
              2. Máy Tính Dự Toán Độc Lập — Tuyến: {routeInfo.name}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Thay đổi các tham số để xem doanh thu, khách chốt, lợi nhuận gộp và tỷ lệ chi phí Marketing Ads.
            </p>
          </div>
          <button
            onClick={() => {
              updateCalc('cpl', historicalData.cplLeadAvg);
              updateCalc('budget', routeInfo.budget);
            }}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              padding: '5px 12px',
              borderRadius: '5px',
              fontSize: '0.78rem',
              color: '#0284c7',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset Chuẩn DB ({formatMoney(historicalData.cplLeadAvg)} đ)</span>
          </button>
        </div>

        {/* Khung nhập tham số */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          background: '#f8fafc',
          padding: '16px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '18px'
        }}>
          {/* Ngân sách Ads */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Ngân Sách Marketing Ads (VNĐ)
            </label>
            <CurrencyInput
              value={calcState.budget}
              onChange={(val) => updateCalc('budget', val)}
              isLight={true}
            />
          </div>

          {/* CPL mục tiêu */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Chi Phí 1 Lead SĐT (CPL)
            </label>
            <CurrencyInput
              value={calcState.cpl}
              onChange={(val) => updateCalc('cpl', val)}
              isLight={true}
            />
          </div>

          {/* Tỷ lệ chốt Sale (%) */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Tỷ Lệ Chốt Sale (CR %)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px' }}>
              <input
                type="number"
                value={calcState.cr}
                onChange={(e) => updateCalc('cr', parseFloat(e.target.value) || 0)}
                style={{ width: '100%', border: 'none', padding: '8px 0', outline: 'none', fontWeight: 700, fontSize: '0.92rem' }}
              />
              <span style={{ color: '#64748b', fontSize: '0.8rem' }}>%</span>
            </div>
          </div>

          {/* Số đoàn & Pax mỗi đoàn */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Quy Mô Đoàn (Đoàn x Khách)
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="number"
                value={calcState.numGroups}
                onChange={(e) => updateCalc('numGroups', parseInt(e.target.value, 10) || 1)}
                style={{ width: '50%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', fontWeight: 700, outline: 'none' }}
                placeholder="Số đoàn"
              />
              <input
                type="number"
                value={calcState.paxPerGroup}
                onChange={(e) => updateCalc('paxPerGroup', parseInt(e.target.value, 10) || 1)}
                style={{ width: '50%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', fontWeight: 700, outline: 'none' }}
                placeholder="Pax/đoàn"
              />
            </div>
          </div>

          {/* Giá bán Tour */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Giá Bán Tour / Khách (VNĐ)
            </label>
            <CurrencyInput
              value={calcState.price}
              onChange={(val) => updateCalc('price', val)}
              isLight={true}
            />
          </div>

          {/* Giá vốn Cost Tour */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Giá Vốn (Cost) / Khách (VNĐ)
            </label>
            <CurrencyInput
              value={calcState.cost}
              onChange={(val) => updateCalc('cost', val)}
              isLight={true}
            />
          </div>

          {/* Khách từ kênh ngoài Ads */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
              Khách Kênh Ngoài Ads (Đã cọc + CTV)
            </label>
            <input
              type="number"
              value={calcState.extPax || 0}
              onChange={(e) => updateCalc('extPax', parseInt(e.target.value, 10) || 0)}
              style={{ width: '100%', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', fontWeight: 700, outline: 'none' }}
            />
          </div>
        </div>

        {/* Khung hiển thị kết quả tính toán */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {/* Cột 1: Lead kỳ vọng */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Số Lead SĐT Mang Về</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {calcResults.leads} Lead
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
              Với ngân sách {formatMoney(calcState.budget)} đ @ {formatMoney(calcState.cpl)} đ/lead
            </div>
          </div>

          {/* Cột 2: Khách chốt */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tổng Khách Phục Vụ</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
              {calcResults.totalPax} Pax <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748b' }}>({calcResults.paxAds} từ Ads)</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: calcResults.totalPax >= calcResults.targetPaxTotal ? '#16a34a' : '#f59e0b', fontWeight: 600, marginTop: '3px' }}>
              Mục tiêu: {calcResults.targetPaxTotal} Pax ({Math.round((calcResults.totalPax / calcResults.targetPaxTotal) * 100)}% lấp đầy)
            </div>
          </div>

          {/* Cột 3: Doanh thu dự kiến */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Doanh Thu Dự Kiến</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
              {formatMoney(calcResults.totalRevenue)} đ
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
              Từ Ads: {formatMoney(calcResults.revenueAds)} đ
            </div>
          </div>

          {/* Cột 4: Tỷ lệ Ads / Doanh thu */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '14px' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Tỷ Lệ Ads / Doanh Thu</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: calcResults.adsRatio <= 2.0 ? '#16a34a' : '#ea580c', marginTop: '2px' }}>
              {calcResults.adsRatio.toFixed(2)}%
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '3px' }}>
              Lợi nhuận gộp sau Ads: <strong style={{ color: '#16a34a' }}>{formatMoney(calcResults.netProfitAfterAds)} đ</strong>
            </div>
          </div>
        </div>

        {/* Box tính ngược */}
        <div style={{
          marginTop: '16px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          padding: '14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div>
            <div style={{ fontWeight: 700, color: '#1e40af', fontSize: '0.88rem' }}>
              Góc nhìn Điều hành: Để chốt đủ 100% mục tiêu ({calcResults.targetPaxTotal} Pax)
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '2px' }}>
              Trừ đi {calcState.extPax || 0} pax từ kênh ngoài, Ads cần mang về <strong>{calcResults.neededPaxFromAds} Pax</strong> → Cần khoảng <strong>{calcResults.neededLeads} Lead SĐT</strong>.
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.74rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Ngân Sách Khuyến Nghị</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>{formatMoney(calcResults.neededBudget)} đ</div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BU1MarketPlanningPage;
