/**
 * bu5MarketingMasterPlan.js
 * Master Dataset & Calculation Logic for BU5 Product & Marketing Budget Schedule 2026 - 2027
 * Source: Google Spreadsheet https://docs.google.com/spreadsheets/d/10kuQXdFgFLVSRS4CbKYa-ozuch6RnPJd8NTo36fFhrc/edit?usp=sharing
 * (KẾ HOẠCH SẢN PHẨM - BU5 - 2026&2027)
 */

// 1. Danh sách sản phẩm & Giá bán chuẩn theo Tab P&L sản phẩm
export const BU5_PRODUCTS_CATALOG = {
  pakistan: {
    id: 'pakistan',
    name: 'Pakistan',
    fullName: 'Pakistan (Mùa Hoa Anh Đào & Mùa Thu Hunza)',
    category: 'Tuyến trụ cột',
    pricePerPax: 74900000,
    costPerPax: 67000000,
    defaultPaxPerGroup: 10,
    icon: '🏔️',
    color: '#16a34a',
    badgeBg: '#dcfce7',
    badgeText: '#166534',
    note: 'Mùa hoa (T3-4) và Mùa thu (T10) là hai campaign độc lập'
  },
  aicap: {
    id: 'aicap',
    name: 'Ai Cập',
    fullName: 'Ai Cập Huyền Bí & Du Thuyền Sông Nile 5 Sao',
    category: 'Tuyến trụ cột',
    pricePerPax: 104900000,
    costPerPax: 89372535,
    defaultPaxPerGroup: 10,
    icon: '☀️',
    color: '#d97706',
    badgeBg: '#fef3c7',
    badgeText: '#92400e',
    note: 'Bán lặp lại, tạo nền sản phẩm đường xa; ưu tiên mùa thu, cuối năm và Tết'
  },
  maroc: {
    id: 'maroc',
    name: 'Maroc',
    fullName: 'Ma Rốc - Viên Ngọc Bắc Phi & Sa Mạc Sahara',
    category: 'Tuyến trụ cột',
    pricePerPax: 109000000,
    costPerPax: 90175564,
    defaultPaxPerGroup: 10,
    icon: '🏜️',
    color: '#e11d48',
    badgeBg: '#ffe4e6',
    badgeText: '#9f1239',
    note: 'Bán lặp lại, kết hợp văn hóa và sa mạc; ưu tiên Tết và 30/4'
  },
  nga: {
    id: 'nga',
    name: 'Nga - Bắc Cực Quang',
    fullName: 'Nga - Săn Cực Quang Murmansk & Moscow - Saint Petersburg',
    category: 'Tuyến mùa vụ',
    pricePerPax: 165000000,
    costPerPax: 140000000,
    defaultPaxPerGroup: 10,
    icon: '❄️',
    color: '#0284c7',
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    note: 'Sản phẩm mùa đông, trải nghiệm Bắc Cực; gom 3 đoàn cao điểm tháng 2'
  },
  baikal: {
    id: 'baikal',
    name: 'Baikal',
    fullName: 'Hồ Baikal Mùa Đông Băng Tuyết',
    category: 'Tuyến mùa vụ',
    pricePerPax: 85000000,
    costPerPax: 72000000,
    defaultPaxPerGroup: 10,
    icon: '🧊',
    color: '#06b6d4',
    badgeBg: '#cffafe',
    badgeText: '#155e75',
    note: 'Sản phẩm thử nghiệm mùa đông đặc thù'
  },
  mongco: {
    id: 'mongco',
    name: 'Mông Cổ',
    fullName: 'Mông Cổ - Thảo Nguyên Bất Tận & Sa Mạc Gobi',
    category: 'Tuyến trụ cột',
    pricePerPax: 78900000,
    costPerPax: 68900000,
    defaultPaxPerGroup: 10,
    icon: '🐎',
    color: '#059669',
    badgeBg: '#d1fae5',
    badgeText: '#065f46',
    note: 'Sản phẩm volume chủ lực mùa hè (T6-T9), tổng 6 đoàn'
  },
  trunga: {
    id: 'trunga',
    name: 'Trung Á',
    fullName: 'Con Đường Tơ Lụa Trung Á (Kazakhstan - Kyrgyzstan - Uzbekistan)',
    category: 'Tuyến mùa vụ',
    pricePerPax: 80000000,
    costPerPax: 72000000,
    defaultPaxPerGroup: 10,
    icon: '🏛️',
    color: '#8b5cf6',
    badgeBg: '#ede9fe',
    badgeText: '#5b21b6',
    note: 'Bổ sung lựa chọn mùa hè, mỗi tháng 1 đoàn từ tháng 6 đến tháng 9'
  },
  alaska: {
    id: 'alaska',
    name: 'Alaska',
    fullName: 'Alaska - Thiên Nhiên Hoang Dã Vùng Cực Bắc Mỹ (Hè & Thu)',
    category: 'Tuyến định vị',
    pricePerPax: 215000000,
    costPerPax: 185000000,
    defaultPaxPerGroup: 10,
    icon: '🌲',
    color: '#0284c7',
    badgeBg: '#e0f2fe',
    badgeText: '#075985',
    note: 'Thiên nhiên và wildlife phân khúc premium; 2 đoàn (T7 hè & T8-9 lễ 2/9)'
  },
  nammy: {
    id: 'nammy',
    name: 'Nam Mỹ',
    fullName: 'Nam Mỹ Huyền Thoại (Brazil - Argentina - Peru - Chile)',
    category: 'Tuyến định vị',
    pricePerPax: 330900000,
    costPerPax: 270000000,
    defaultPaxPerGroup: 10,
    icon: '🗿',
    color: '#f59e0b',
    badgeBg: '#fef3c7',
    badgeText: '#78350f',
    note: 'Mở rộng danh mục đường xa đỉnh cao, tạo khác biệt; visa chuẩn bị 9-10 tháng'
  },
  namibia: {
    id: 'namibia',
    name: 'Namibia',
    fullName: 'Namibia - Wildlife, Cồn Cát Đỏ Sossusvlei & Bờ Biển Skeleton',
    category: 'Tuyến định vị',
    pricePerPax: 180000000,
    costPerPax: 150000000,
    defaultPaxPerGroup: 10,
    icon: '🦒',
    color: '#ea580c',
    badgeBg: '#ffedd5',
    badgeText: '#9a3412',
    note: 'Wildlife, sa mạc và mùa lễ 2/9 phân khúc siêu cao cấp'
  },
  bacmongco: {
    id: 'bacmongco',
    name: 'Bắc Mông Cổ',
    fullName: 'Bắc Mông Cổ - Hồ Khovsgol & Bộ Tộc Tuần Lộc Tsaatan',
    category: 'Tuyến phát triển',
    pricePerPax: 98900000,
    costPerPax: 87700000,
    defaultPaxPerGroup: 10,
    icon: '🦌',
    color: '#475569',
    badgeBg: '#f1f5f9',
    badgeText: '#1e293b',
    note: 'Mở rộng hệ sinh thái sản phẩm Mông Cổ mùa thu lá vàng'
  }
};

// 2. Danh sách 28 đợt khởi hành / 30 đoàn BU5 2026 - 2027 từ Google Sheet Tab "Lịch khởi hành"
// Số tháng chạy trước mặc định (lead_months) lấy theo Tab "Kế hoạch triển khai":
// Tour đường xa, visa khó (Alaska, Nam Mỹ, Namibia): chạy trước 7-10 tháng
// Tour mùa đông/Tết (Nga, Ai Cập Tết, Maroc Tết): chạy trước 5-6 tháng
// Tour mùa hè (Mông Cổ, Trung Á): chạy trước 4-6 tháng
// Tour ngắn hạn/trụ cột: chạy trước 3-4 tháng
export const BU5_RAW_DEPARTURES = [
  {
    stt: 1,
    productKey: 'pakistan',
    name: 'Pakistan mùa thu',
    departureMonth: '2026-10',
    displayTime: '10/2026',
    season: 'Mùa thu',
    groupsCount: 0,
    defaultLeadMonths: 2,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Mở đầu chu kỳ sản phẩm (dự bị)'
  },
  {
    stt: 2,
    productKey: 'aicap',
    name: 'Ai Cập mùa thu',
    departureMonth: '2026-11',
    displayTime: '11/2026',
    season: 'Mùa thu',
    groupsCount: 1,
    defaultLeadMonths: 3,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Mở bán mùa đẹp nhất Ai Cập'
  },
  {
    stt: 3,
    productKey: 'maroc',
    name: 'Maroc mùa thu',
    departureMonth: '2026-11',
    displayTime: '11/2026',
    season: 'Mùa thu',
    groupsCount: 1,
    defaultLeadMonths: 3,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Thời tiết mát mẻ sa mạc Sahara'
  },
  {
    stt: 4,
    productKey: 'aicap',
    name: 'Ai Cập cuối năm',
    departureMonth: '2026-12',
    displayTime: '12/2026',
    season: 'Cuối năm',
    groupsCount: 1,
    defaultLeadMonths: 4,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Mùa Giáng Sinh & Năm Mới'
  },
  {
    stt: 5,
    productKey: 'aicap',
    name: 'Ai Cập Tết Nguyên Đán',
    departureMonth: '2027-02',
    displayTime: '02/2027',
    season: 'Tết / Mùa xuân',
    groupsCount: 1,
    defaultLeadMonths: 5,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Nghỉ Tết Âm Lịch 7-10 ngày'
  },
  {
    stt: 6,
    productKey: 'maroc',
    name: 'Maroc Tết Nguyên Đán',
    departureMonth: '2027-02',
    displayTime: '02/2027',
    season: 'Tết / Mùa xuân',
    groupsCount: 1,
    defaultLeadMonths: 5,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Tour độc bản mùa Tết'
  },
  {
    stt: 7,
    productKey: 'nga',
    name: 'Nga - Săn Cực Quang Murmansk (3 Đoàn)',
    departureMonth: '2027-02',
    displayTime: '02/2027',
    season: 'Mùa đông',
    groupsCount: 3,
    defaultLeadMonths: 5,
    category: 'Tuyến mùa vụ',
    status: 'Đang làm chương trình',
    note: 'Chiến dịch trọng điểm 3 đoàn cao điểm săn Cực quang'
  },
  {
    stt: 8,
    productKey: 'baikal',
    name: 'Baikal mùa đông',
    departureMonth: '2027-02',
    displayTime: '02/2027',
    season: 'Mùa đông',
    groupsCount: 0,
    defaultLeadMonths: 3,
    category: 'Tuyến mùa vụ',
    status: 'Đề xuất',
    note: 'Đề xuất thử nghiệm'
  },
  {
    stt: 9,
    productKey: 'maroc',
    name: 'Maroc mùa xuân',
    departureMonth: '2027-03',
    displayTime: '03/2027',
    season: 'Mùa xuân',
    groupsCount: 1,
    defaultLeadMonths: 6,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Thời tiết ấm áp mùa xuân Bắc Phi'
  },
  {
    stt: 10,
    productKey: 'nga',
    name: 'Nga - Bắc Cực Quang (Đợt 2)',
    departureMonth: '2027-03',
    displayTime: '03/2027',
    season: 'Mùa đông',
    groupsCount: 0,
    defaultLeadMonths: 4,
    category: 'Tuyến mùa vụ',
    status: 'Đang làm chương trình',
    note: 'Đợt dự phòng'
  },
  {
    stt: 11,
    productKey: 'pakistan',
    name: 'Pakistan Mùa Hoa Anh Đào (2 Đoàn)',
    departureMonth: '2027-03',
    displayTime: '03/2027',
    season: 'Mùa xuân',
    groupsCount: 2,
    defaultLeadMonths: 4,
    category: 'Tuyến trụ cột',
    status: 'Làm mới sản phẩm',
    note: 'Mùa hoa thung lũng Hunza đẹp nhất trong năm'
  },
  {
    stt: 12,
    productKey: 'aicap',
    name: 'Ai Cập Lễ 30/4',
    departureMonth: '2027-04',
    displayTime: '04/2027',
    season: 'Mùa xuân / 30-4',
    groupsCount: 1,
    defaultLeadMonths: 7,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Kỳ nghỉ lễ 30/4 kéo dài 4 ngày'
  },
  {
    stt: 13,
    productKey: 'maroc',
    name: 'Maroc Lễ 30/4',
    departureMonth: '2027-04',
    displayTime: '04/2027',
    season: 'Mùa xuân / 30-4',
    groupsCount: 1,
    defaultLeadMonths: 7,
    category: 'Tuyến trụ cột',
    status: 'Đang bán',
    note: 'Kỳ nghỉ lễ 30/4'
  },
  {
    stt: 14,
    productKey: 'pakistan',
    name: 'Pakistan Mùa Hoa Đợt 2',
    departureMonth: '2027-04',
    displayTime: '04/2027',
    season: 'Mùa xuân / 30-4',
    groupsCount: 0,
    defaultLeadMonths: 4,
    category: 'Tuyến trụ cột',
    status: 'Làm mới sản phẩm',
    note: 'Đợt mở rộng nếu nhu cầu cao'
  },
  {
    stt: 15,
    productKey: 'mongco',
    name: 'Mông Cổ đầu hè',
    departureMonth: '2027-06',
    displayTime: '06/2027',
    season: 'Mùa hè',
    groupsCount: 1,
    defaultLeadMonths: 4,
    category: 'Tuyến trụ cột',
    status: 'Làm mới sản phẩm',
    note: 'Mở màn mùa hè Mông Cổ'
  },
  {
    stt: 16,
    productKey: 'trunga',
    name: 'Trung Á đầu hè',
    departureMonth: '2027-06',
    displayTime: '06/2027',
    season: 'Mùa hè',
    groupsCount: 1,
    defaultLeadMonths: 4,
    category: 'Tuyến mùa vụ',
    status: 'Làm mới sản phẩm',
    note: 'Mở màn cung đường Tơ Lụa hè'
  },
  {
    stt: 17,
    productKey: 'mongco',
    name: 'Mông Cổ chính hè (2 Đoàn)',
    departureMonth: '2027-07',
    displayTime: '07/2027',
    season: 'Mùa hè',
    groupsCount: 2,
    defaultLeadMonths: 5,
    category: 'Tuyến trụ cột',
    status: 'Làm mới sản phẩm',
    note: 'Cao điểm hè & Lễ hội Naadam'
  },
  {
    stt: 18,
    productKey: 'trunga',
    name: 'Trung Á chính hè',
    departureMonth: '2027-07',
    displayTime: '07/2027',
    season: 'Mùa hè',
    groupsCount: 1,
    defaultLeadMonths: 5,
    category: 'Tuyến mùa vụ',
    status: 'Làm mới sản phẩm',
    note: 'Đoàn tháng 7'
  },
  {
    stt: 19,
    productKey: 'alaska',
    name: 'Alaska mùa hè hoang dã',
    departureMonth: '2027-07',
    displayTime: '07/2027',
    season: 'Mùa hè',
    groupsCount: 1,
    defaultLeadMonths: 7,
    category: 'Tuyến định vị',
    status: 'Làm mới sản phẩm',
    note: 'Khám phá gấu nâu bắt cá hồi, sông băng Alaska'
  },
  {
    stt: 20,
    productKey: 'mongco',
    name: 'Mông Cổ tháng 8 (2 Đoàn)',
    departureMonth: '2027-08',
    displayTime: '08/2027',
    season: 'Mùa hè',
    groupsCount: 2,
    defaultLeadMonths: 6,
    category: 'Tuyến trụ cột',
    status: 'Làm mới sản phẩm',
    note: 'Đoàn gia đình & nhóm bạn hè'
  },
  {
    stt: 21,
    productKey: 'trunga',
    name: 'Trung Á tháng 8',
    departureMonth: '2027-08',
    displayTime: '08/2027',
    season: 'Mùa hè',
    groupsCount: 1,
    defaultLeadMonths: 6,
    category: 'Tuyến mùa vụ',
    status: 'Làm mới sản phẩm',
    note: 'Đoàn tháng 8'
  },
  {
    stt: 22,
    productKey: 'alaska',
    name: 'Alaska mùa thu (Lễ 2/9)',
    departureMonth: '2027-09',
    displayTime: '08-09/2027',
    season: 'Lễ 2/9 / Mùa thu',
    groupsCount: 1,
    defaultLeadMonths: 8,
    category: 'Tuyến định vị',
    status: 'Đề xuất',
    note: 'Mùa thu tundra đổi màu rực rỡ và cực quang sớm'
  },
  {
    stt: 23,
    productKey: 'mongco',
    name: 'Mông Cổ cuối hè',
    departureMonth: '2027-09',
    displayTime: '09/2027',
    season: 'Cuối hè',
    groupsCount: 1,
    defaultLeadMonths: 7,
    category: 'Tuyến trụ cột',
    status: 'Làm mới sản phẩm',
    note: 'Hoàn tất trọn vẹn mục tiêu 6 đoàn Mông Cổ'
  },
  {
    stt: 24,
    productKey: 'trunga',
    name: 'Trung Á cuối hè',
    departureMonth: '2027-09',
    displayTime: '09/2027',
    season: 'Cuối hè',
    groupsCount: 1,
    defaultLeadMonths: 7,
    category: 'Tuyến mùa vụ',
    status: 'Làm mới sản phẩm',
    note: 'Hoàn tất mục tiêu 4 đoàn Trung Á'
  },
  {
    stt: 25,
    productKey: 'nammy',
    name: 'Nam Mỹ huyền thoại',
    departureMonth: '2027-09',
    displayTime: '09/2027',
    season: 'Mùa thu',
    groupsCount: 1,
    defaultLeadMonths: 9,
    category: 'Tuyến định vị',
    status: 'Làm mới sản phẩm',
    note: 'Siêu phẩm đường xa độc bản 330tr, visa chuẩn bị 9 tháng'
  },
  {
    stt: 26,
    productKey: 'namibia',
    name: 'Namibia Châu Phi mùa lễ 2/9',
    departureMonth: '2027-09',
    displayTime: '09/2027',
    season: 'Lễ 2/9',
    groupsCount: 1,
    defaultLeadMonths: 8,
    category: 'Tuyến định vị',
    status: 'Đề xuất',
    note: 'Wildlife, sa mạc sossusvlei và mùa lễ 2/9'
  },
  {
    stt: 27,
    productKey: 'bacmongco',
    name: 'Bắc Mông Cổ mùa thu',
    departureMonth: '2027-09',
    displayTime: '09-10/2027',
    season: 'Mùa thu',
    groupsCount: 1,
    defaultLeadMonths: 5,
    category: 'Tuyến phát triển',
    status: 'Làm mới sản phẩm',
    note: 'Bộ tộc tuần lộc Tsaatan & Hồ Khovsgol'
  },
  {
    stt: 28,
    productKey: 'pakistan',
    name: 'Pakistan Mùa Thu Hunza (2 Đoàn)',
    departureMonth: '2027-10',
    displayTime: '10/2027',
    season: 'Mùa thu',
    groupsCount: 2,
    defaultLeadMonths: 5,
    category: 'Tuyến trụ cột',
    status: 'Làm mới sản phẩm',
    note: 'Mùa thu vàng rực rỡ thung lũng Hunza'
  }
];

// 3. Danh sách chuỗi 15 tháng theo dõi (Timeline Span): 08/2026 -> 10/2027
export const TIMELINE_MONTHS = [
  { key: '2026-08', label: 'T08/26', fullLabel: 'Tháng 08/2026', year: 2026, month: 8, quarter: 'Q3' },
  { key: '2026-09', label: 'T09/26', fullLabel: 'Tháng 09/2026', year: 2026, month: 9, quarter: 'Q3' },
  { key: '2026-10', label: 'T10/26', fullLabel: 'Tháng 10/2026', year: 2026, month: 10, quarter: 'Q4' },
  { key: '2026-11', label: 'T11/26', fullLabel: 'Tháng 11/2026', year: 2026, month: 11, quarter: 'Q4' },
  { key: '2026-12', label: 'T12/26', fullLabel: 'Tháng 12/2026', year: 2026, month: 12, quarter: 'Q4' },
  { key: '2027-01', label: 'T01/27', fullLabel: 'Tháng 01/2027', year: 2027, month: 1, quarter: 'Q1' },
  { key: '2027-02', label: 'T02/27', fullLabel: 'Tháng 02/2027', year: 2027, month: 2, quarter: 'Q1' },
  { key: '2027-03', label: 'T03/27', fullLabel: 'Tháng 03/2027', year: 2027, month: 3, quarter: 'Q1' },
  { key: '2027-04', label: 'T04/27', fullLabel: 'Tháng 04/2027', year: 2027, month: 4, quarter: 'Q2' },
  { key: '2027-05', label: 'T05/27', fullLabel: 'Tháng 05/2027', year: 2027, month: 5, quarter: 'Q2' },
  { key: '2027-06', label: 'T06/27', fullLabel: 'Tháng 06/2027', year: 2027, month: 6, quarter: 'Q2' },
  { key: '2027-07', label: 'T07/27', fullLabel: 'Tháng 07/2027', year: 2027, month: 7, quarter: 'Q3' },
  { key: '2027-08', label: 'T08/27', fullLabel: 'Tháng 08/2027', year: 2027, month: 8, quarter: 'Q3' },
  { key: '2027-09', label: 'T09/27', fullLabel: 'Tháng 09/2027', year: 2027, month: 9, quarter: 'Q3' },
  { key: '2027-10', label: 'T10/27', fullLabel: 'Tháng 10/2027', year: 2027, month: 10, quarter: 'Q4' }
];

// 4. Helper thao tác tháng (Date utility)
export function addMonthsToKey(monthKey, delta) {
  const [yStr, mStr] = monthKey.split('-');
  const y = parseInt(yStr, 10);
  const m = parseInt(mStr, 10);
  const total = y * 12 + (m - 1) + delta;
  const newY = Math.floor(total / 12);
  const newM = (total % 12) + 1;
  return `${newY}-${String(newM).padStart(2, '0')}`;
}

export function getMonthDifference(fromKey, toKey) {
  const [y1, m1] = fromKey.split('-').map(Number);
  const [y2, m2] = toKey.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1);
}

/**
 * 5. Tính toán ma trận Dòng tiền MKT theo tháng (Core Calculation Engine)
 * 
 * @param {Object} options
 * @param {Object} options.leadOverrides - Map {[stt]: leadMonths (1-10)}
 * @param {number} options.mktRatio - Tỷ lệ MKT (mặc định 0.01 = 1%)
 * @param {string} options.distributionMode - 'even' (chia đều) | 'funnel' (20% khởi động, 60% cao điểm, 20% chốt cọc)
 * @param {string} options.yearFilter - '2027' (chỉ các đoàn 2027) | 'ALL' (cả 2026-2027) | '2026'
 * @param {boolean} options.showPrepMonths2026 - Có hiển thị các tháng chuẩn bị cuối 2026 cho tour 2027 hay không
 * @param {number} options.paxPerGroupOverride - Số khách/đoàn (mặc định 10)
 */
export function calculateBU5MonthlySchedule({
  leadOverrides = {},
  mktRatio = 0.01,
  distributionMode = 'even',
  yearFilter = '2027', // Mặc định tập trung vào năm 2027
  showPrepMonths2026 = true,
  paxPerGroupOverride = null
} = {}) {
  // Lọc danh sách đoàn theo năm khởi hành
  const sourceDepartures = BU5_RAW_DEPARTURES.filter(dep => {
    if (yearFilter === '2027') return dep.departureMonth.startsWith('2027');
    if (yearFilter === '2026') return dep.departureMonth.startsWith('2026');
    return true; // 'ALL'
  });

  const departures = sourceDepartures.map(dep => {
    const prod = BU5_PRODUCTS_CATALOG[dep.productKey] || {};
    const paxPerGroup = paxPerGroupOverride || prod.defaultPaxPerGroup || 10;
    const totalPax = dep.groupsCount * paxPerGroup;
    const pricePerPax = prod.pricePerPax || 0;
    const costPerPax = prod.costPerPax || 0;
    const revenue = totalPax * pricePerPax;
    const grossProfit = totalPax * (pricePerPax - costPerPax);
    const mktBudget = Math.round(revenue * mktRatio);
    
    // Số tháng chạy trước (cho phép tùy biến từ 1 đến 10 tháng)
    const rawLead = leadOverrides[dep.stt] !== undefined ? leadOverrides[dep.stt] : dep.defaultLeadMonths;
    const leadMonths = Math.min(10, Math.max(1, parseInt(rawLead, 10) || 1));
    
    // Tháng khởi hành và Tháng bắt đầu chạy truyền thông
    const depMonth = dep.departureMonth;
    const startMonth = addMonthsToKey(depMonth, -leadMonths);
    
    // Danh sách các tháng mà chiến dịch MKT hoạt động: từ startMonth đến tháng liền kề trước depMonth
    const activeMonths = [];
    for (let i = 0; i < leadMonths; i++) {
      activeMonths.push(addMonthsToKey(startMonth, i));
    }

    // Phân bổ ngân sách MKT vào từng tháng theo chế độ
    const monthlyAllocations = {};
    if (dep.groupsCount > 0 && mktBudget > 0) {
      if (distributionMode === 'funnel' && leadMonths >= 3) {
        // Phễu du lịch cao cấp:
        // Tháng đầu: 20% (Teaser / Nhận diện)
        // Các tháng giữa: 60% chia đều (Cao điểm chốt cọc)
        // Tháng cuối: 20% (Đóng đoàn / Last call)
        const firstMonthBudget = Math.round(mktBudget * 0.20);
        const lastMonthBudget = Math.round(mktBudget * 0.20);
        const middleMonthsCount = leadMonths - 2;
        const middleBudgetPerMonth = middleMonthsCount > 0 
          ? Math.round((mktBudget * 0.60) / middleMonthsCount) 
          : 0;

        activeMonths.forEach((m, idx) => {
          if (idx === 0) {
            monthlyAllocations[m] = firstMonthBudget;
          } else if (idx === activeMonths.length - 1) {
            monthlyAllocations[m] = lastMonthBudget;
          } else {
            monthlyAllocations[m] = middleBudgetPerMonth;
          }
        });
      } else {
        // Mặc định: Phân bổ đều cho N tháng chạy trước
        const budgetPerMonth = Math.round(mktBudget / leadMonths);
        let accumulated = 0;
        activeMonths.forEach((m, idx) => {
          if (idx === activeMonths.length - 1) {
            // Tháng cuối cùng bù sai số làm tròn
            monthlyAllocations[m] = mktBudget - accumulated;
          } else {
            monthlyAllocations[m] = budgetPerMonth;
            accumulated += budgetPerMonth;
          }
        });
      }
    }

    return {
      ...dep,
      prod,
      paxPerGroup,
      totalPax,
      pricePerPax,
      costPerPax,
      revenue,
      grossProfit,
      mktBudget,
      leadMonths,
      startMonth,
      depMonth,
      activeMonths,
      monthlyAllocations
    };
  });

  // Xác định danh sách tháng hiển thị
  let activeTimelineMonths = TIMELINE_MONTHS;
  if (yearFilter === '2027') {
    if (showPrepMonths2026) {
      // Bao gồm cả các tháng chuẩn bị cuối 2026 (từ 09/2026 đến 10/2027)
      activeTimelineMonths = TIMELINE_MONTHS.filter(tm => tm.key >= '2026-09');
    } else {
      // Chỉ các tháng nằm trọn trong năm 2027
      activeTimelineMonths = TIMELINE_MONTHS.filter(tm => tm.key.startsWith('2027'));
    }
  } else if (yearFilter === '2026') {
    activeTimelineMonths = TIMELINE_MONTHS.filter(tm => tm.key.startsWith('2026'));
  }

  // Tổng hợp theo danh sách tháng
  const monthlyTotals = {};
  const monthlyDepartureRevenues = {};
  const monthlyDeparturesCount = {};
  const monthlyActiveTours = {};

  activeTimelineMonths.forEach(tm => {
    monthlyTotals[tm.key] = 0;
    monthlyDepartureRevenues[tm.key] = 0;
    monthlyDeparturesCount[tm.key] = 0;
    monthlyActiveTours[tm.key] = [];
  });

  departures.forEach(dep => {
    // 1. Cộng dồn ngân sách MKT giải ngân theo tháng
    Object.entries(dep.monthlyAllocations).forEach(([mKey, amount]) => {
      if (monthlyTotals[mKey] !== undefined) {
        monthlyTotals[mKey] += amount;
        monthlyActiveTours[mKey].push({
          departureStt: dep.stt,
          tourName: dep.name,
          productKey: dep.productKey,
          depMonth: dep.departureMonth,
          leadMonths: dep.leadMonths,
          amount,
          groupsCount: dep.groupsCount,
          totalRevenue: dep.revenue,
          percentageOfTourBudget: dep.mktBudget > 0 ? (amount / dep.mktBudget) * 100 : 0
        });
      }
    });

    // 2. Doanh thu khởi hành thực tế của tháng
    if (monthlyDepartureRevenues[dep.departureMonth] !== undefined && dep.groupsCount > 0) {
      monthlyDepartureRevenues[dep.departureMonth] += dep.revenue;
      monthlyDeparturesCount[dep.departureMonth] += dep.groupsCount;
    }
  });

  // Thống kê tổng hợp toàn bộ kế hoạch
  const totalGroups = departures.reduce((sum, d) => sum + d.groupsCount, 0);
  const totalPax = departures.reduce((sum, d) => sum + d.totalPax, 0);
  const totalRevenue = departures.reduce((sum, d) => sum + d.revenue, 0);
  const totalGrossProfit = departures.reduce((sum, d) => sum + d.grossProfit, 0);
  const totalMktBudget = departures.reduce((sum, d) => sum + d.mktBudget, 0);
  
  // Tách riêng: Phần MKT chi trong năm 2027 vs Phần MKT chi trước vào cuối 2026
  let mktIn2027Only = 0;
  let mktPrepIn2026 = 0;
  Object.entries(monthlyTotals).forEach(([mKey, amount]) => {
    if (mKey.startsWith('2027')) {
      mktIn2027Only += amount;
    } else if (mKey.startsWith('2026')) {
      mktPrepIn2026 += amount;
    }
  });

  // Tính tháng có chi phí MKT cao điểm nhất (Peak Month)
  let peakMonthKey = activeTimelineMonths[0]?.key || '2027-02';
  let peakMonthAmount = 0;
  Object.entries(monthlyTotals).forEach(([mKey, amount]) => {
    if (amount > peakMonthAmount) {
      peakMonthAmount = amount;
      peakMonthKey = mKey;
    }
  });

  const activeMonthsCount = Object.values(monthlyTotals).filter(v => v > 0).length || 1;
  const avgMonthlyMkt = Math.round(totalMktBudget / activeMonthsCount);

  return {
    departures,
    timelineMonths: activeTimelineMonths,
    allTimelineMonths: TIMELINE_MONTHS,
    monthlyTotals,
    monthlyDepartureRevenues,
    monthlyDeparturesCount,
    monthlyActiveTours,
    kpis: {
      totalGroups,
      totalPax,
      totalRevenue,
      totalGrossProfit,
      totalMktBudget,
      mktRatio,
      yearFilter,
      showPrepMonths2026,
      mktIn2027Only,
      mktPrepIn2026,
      peakMonthKey,
      peakMonthAmount,
      avgMonthlyMkt,
      activeMonthsCount,
      avgLeadMonths: Number((departures.filter(d => d.groupsCount > 0).reduce((s, d) => s + d.leadMonths, 0) / (departures.filter(d => d.groupsCount > 0).length || 1)).toFixed(1))
    }
  };
}
