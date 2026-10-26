import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  Compass, 
  MapPin, 
  Info, 
  X, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Layers
} from 'lucide-react';
import { getCategoryBadgeStyle, BU5_PRODUCTS_CATALOG } from '../data/bu5MarketingMasterPlan';

// Helper format số tiền VND chuẩn
const fmtVND = (num) => {
  if (!num) return '0\u00A0đ';
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}\u00A0đ`;
};

const fmtMillion = (num) => {
  if (!num) return '0 triệu';
  const tr = num / 1000000;
  return `${tr >= 1000 ? (tr / 1000).toFixed(2) + ' Tỷ' : Math.round(tr) + ' triệu'}`;
};

// 15 mốc tháng từ Google Sheet Tab "Timeline theo tháng" (gid=2106737229)
export const TIMELINE_MONTHS = [
  { key: '10/26', label: '10/26', year: 2026, isPrep: true, quarter: 'Q4/2026' },
  { key: '11/26', label: '11/26', year: 2026, isPrep: true, quarter: 'Q4/2026' },
  { key: '12/26', label: '12/26', year: 2026, isPrep: true, quarter: 'Q4/2026' },
  { key: '01/27', label: '01/27', year: 2027, isPrep: false, quarter: 'Q1/2027' },
  { key: '02/27', label: '02/27', year: 2027, isPrep: false, quarter: 'Q1/2027', holiday: '🧧 Tết' },
  { key: '03/27', label: '03/27', year: 2027, isPrep: false, quarter: 'Q1/2027' },
  { key: '04/27', label: '04/27', year: 2027, isPrep: false, quarter: 'Q2/2027', holiday: '🏖️ 30/4' },
  { key: '05/27', label: '05/27', year: 2027, isPrep: false, quarter: 'Q2/2027' },
  { key: '06/27', label: '06/27', year: 2027, isPrep: false, quarter: 'Q2/2027' },
  { key: '07/27', label: '07/27', year: 2027, isPrep: false, quarter: 'Q3/2027' },
  { key: '08/27', label: '08/27', year: 2027, isPrep: false, quarter: 'Q3/2027', holiday: '🇻🇳 2/9' },
  { key: '09/27', label: '09/27', year: 2027, isPrep: false, quarter: 'Q3/2027', holiday: '🇻🇳 2/9' },
  { key: '10/27', label: '10/27', year: 2027, isPrep: false, quarter: 'Q4/2027' },
  { key: '11/27', label: '11/27', year: 2027, isPrep: false, quarter: 'Q4/2027' },
  { key: '12/27', label: '12/27', year: 2027, isPrep: false, quarter: 'Q4/2027' }
];

// Chi tiết từng đợt khởi hành theo sản phẩm & tháng
export const DEPARTURE_DETAILS = {
  'pakistan-10/26': {
    theme: 'Pakistan Mùa Thu (Đợt mở đầu)',
    desc: 'Hành trình ngắm mùa lá vàng thung lũng Hunza và đèo Khunjerab.',
    leadMonths: 'Chạy trước 2-3 tháng',
    startMkt: '08/2026',
    notes: 'Tour mở đầu chu kỳ vận hành BU5'
  },
  'pakistan-03/27': {
    theme: 'Pakistan Mùa Hoa Anh Đào Hunza (Đợt 1)',
    desc: 'Mùa hoa anh đào & hoa mơ nở rực rỡ khắp thung lũng Hunza, cao tốc Karakoram hùng vĩ.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '11/2026',
    notes: 'Mùa hoa Hunza đẹp nhất trong năm, tỷ lệ chốt cọc cao'
  },
  'pakistan-04/27': {
    theme: 'Pakistan Mùa Hoa & Kỳ Nghỉ Lễ 30/4',
    desc: 'Tận dụng kỳ nghỉ 30/4 kéo dài 4 ngày, trải nghiệm mùa xuân thung lũng bất tử.',
    leadMonths: 'Chạy trước 4-5 tháng',
    startMkt: '12/2026',
    notes: 'Rơi đúng kỳ nghỉ Lễ 30/04'
  },
  'pakistan-10/27': {
    theme: 'Pakistan Mùa Thu Hunza (Đợt 1 mùa thu)',
    desc: 'Mùa thu vàng rực rỡ thung lũng Hunza, văn hóa bộ tộc Baltit & Altit.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '05/2027',
    notes: 'Đoàn thu chính vụ của BU5'
  },
  'pakistan-11/27': {
    theme: 'Pakistan Mùa Thu Muộn & Đèo Khunjerab',
    desc: 'Mùa thu vàng chuyển giao sang chớm đông tuyết phủ dãy Karakoram.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '07/2027',
    notes: 'Thời tiết se lạnh, cảnh sắc hùng vĩ'
  },
  'pakistan-12/27': {
    theme: 'Pakistan Đón Năm Mới Mùa Đông',
    desc: 'Tour đặc biệt mùa đông tuyết trắng thung lũng phía Bắc Pakistan.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '08/2027',
    notes: 'Khám phá mùa đông Karakoram'
  },

  'aicap-11/26': {
    theme: 'Ai Cập Mùa Thu Khởi Đầu',
    desc: 'Khám phá Kim Tự Tháp Giza, Đại Bảo Tàng Cairo & Du thuyền 5 sao sông Nile.',
    leadMonths: 'Chạy trước 3 tháng',
    startMkt: '08/2026',
    notes: 'Thời tiết mát mẻ nhất trong năm tại Ai Cập'
  },
  'aicap-12/26': {
    theme: 'Ai Cập Mùa Giáng Sinh & Năm Mới',
    desc: 'Du thuyền sông Nile mùa lễ hội cuối năm, Cairo & Luxor huyền bí.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '08/2026',
    notes: 'Nhu cầu đi nghỉ đông cao cấp của khách VIP'
  },
  'aicap-02/27': {
    theme: 'Ai Cập Tết Nguyên Đán 2027 (Du Thuyền 5 Sao)',
    desc: 'Tour độc bản đón Tết cổ truyền trên sông Nile, quần thể Kim Tự Tháp & Đền Abu Simbel.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '09/2026',
    notes: 'Nghỉ Tết Âm Lịch 7-10 ngày, sản phẩm trụ cột gom khách sớm'
  },
  'aicap-04/27': {
    theme: 'Ai Cập Lễ 30/4 & Du Thuyền Nile',
    desc: 'Tận dụng trọn vẹn 4 ngày nghỉ lễ 30/4 khám phá nền văn minh sông Nile 5.000 năm.',
    leadMonths: 'Chạy trước 6 tháng',
    startMkt: '10/2026',
    notes: 'Rơi đúng dịp nghỉ lễ 30/04'
  },
  'aicap-11/27': {
    theme: 'Ai Cập Mùa Thu 2027',
    desc: 'Khởi động mùa tour thu đông Ai Cập năm 2027.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '07/2027',
    notes: 'Mùa du lịch Ai Cập lý tưởng'
  },
  'aicap-12/27': {
    theme: 'Ai Cập Cuối Năm & Mùa Lễ Hội 2027',
    desc: 'Du thuyền sông Nile mùa Giáng sinh và năm mới 2028.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '08/2027',
    notes: 'Phân khúc khách hàng trung niên & gia đình VIP'
  },

  'maroc-11/26': {
    theme: 'Maroc Mùa Thu Sa Mạc Sahara',
    desc: 'Khám phá Casablanca, thành phố xanh Chefchaouen, Marrakech & lều sang trọng Sahara.',
    leadMonths: 'Chạy trước 3 tháng',
    startMkt: '08/2026',
    notes: 'Thời tiết mùa thu mát mẻ tại Bắc Phi'
  },
  'maroc-02/27': {
    theme: 'Maroc Tết Nguyên Đán 2027',
    desc: 'Đón Tết cổ truyền tại ốc đảo Sahara & khách sạn Riad cổ kính Marrakech.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '09/2026',
    notes: 'Rơi đúng kỳ nghỉ Tết Nguyên Đán, khách đăng ký cọc sớm'
  },
  'maroc-03/27': {
    theme: 'Maroc Mùa Xuân Hoa Nở',
    desc: 'Mùa xuân Bắc Phi ấm áp, thung lũng hoa hồng Dades & sa mạc Merzouga.',
    leadMonths: 'Chạy trước 6 tháng',
    startMkt: '09/2026',
    notes: 'Khí hậu mùa xuân tuyệt đẹp'
  },
  'maroc-04/27': {
    theme: 'Maroc Lễ 30/4',
    desc: 'Kỳ nghỉ 30/4 khám phá cung đường ngàn Kasbah và văn hóa Berber cổ xưa.',
    leadMonths: 'Chạy trước 7 tháng',
    startMkt: '09/2026',
    notes: 'Kỳ nghỉ lễ 30/04 kéo dài 4 ngày'
  },
  'maroc-11/27': {
    theme: 'Maroc Mùa Thu 2027',
    desc: 'Mùa du lịch chính vụ sa mạc Sahara Bắc Phi năm 2027.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '07/2027',
    notes: 'Thời tiết khô ráo, nắng vàng sa mạc'
  },
  'maroc-12/27': {
    theme: 'Maroc Cuối Năm & Tết Dương Lịch 2028',
    desc: 'Trải nghiệm đón năm mới tại sa mạc Sahara huyền ảo.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '08/2027',
    notes: 'Khách hàng phân khúc cao cấp'
  },

  'nga-02/27': {
    theme: 'Nga - Săn Cực Quang Murmansk (3 Đoàn gom)',
    desc: 'Chiến dịch trọng điểm 3 đoàn cao điểm Bắc Cực Murmansk, làng tuyết Teriberka & xe tuần lộc.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '09/2026',
    notes: 'Tết Âm Lịch & Mùa cực quang đẹp nhất bán đảo Kola'
  },
  'nga-12/27': {
    theme: 'Nga - Đón Năm Mới Mùa Đông Vùng Cực',
    desc: 'Săn Cực quang Murmansk & mùa đông tuyết trắng Quảng Trường Đỏ Moscow.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '08/2027',
    notes: 'Trải nghiệm mùa đông nước Nga kinh điển'
  },

  'baikal-02/27': {
    theme: 'Hồ Baikal Mùa Đông Băng Tuyết (Tết 2027)',
    desc: 'Khám phá mặt băng xanh trong vắt hồ Baikal, đảo Olkhon & xe UAZ trên băng.',
    leadMonths: 'Chạy trước 3-4 tháng',
    startMkt: '10/2026',
    notes: 'Thời điểm mặt hồ đóng băng dày và trong suốt nhất'
  },
  'baikal-03/27': {
    theme: 'Hồ Baikal Mùa Băng Tan Chớm Xuân',
    desc: 'Hiện tượng băng vỡ nghệ thuật và những tảng băng ngọc bích kỳ ảo.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '11/2026',
    notes: 'Đợt khởi hành cuối cùng của mùa đông Baikal'
  },

  'mongco-06/27': {
    theme: 'Mông Cổ Mở Màn Mùa Hè',
    desc: 'Thảo nguyên xanh ngát, sa mạc Gobi & trải nghiệm cưỡi ngựa sống cùng dân du mục.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '02/2027',
    notes: 'Mở màn chuỗi sản phẩm volume chủ lực hè của BU5'
  },
  'mongco-07/27': {
    theme: 'Mông Cổ Cao Điểm Hè & Lễ Hội Naadam (2 Đoàn)',
    desc: 'Đại lễ hội truyền thống Naadam (Bắn cung, Đấu vật, Đua ngựa), cao điểm du lịch hè.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '02/2027',
    notes: '2 đoàn đồng loạt khởi hành, nhu cầu gia đình cực cao'
  },
  'mongco-08/27': {
    theme: 'Mông Cổ Hè Trải Nghiệm (2 Đoàn)',
    desc: 'Khám phá hẻm núi Yoliin Am, cồn cát biết hát Khongoryn Els & ngắm dải Ngân Hà.',
    leadMonths: 'Chạy trước 6 tháng',
    startMkt: '02/2027',
    notes: '2 đoàn gia đình và nhóm bạn hè'
  },
  'mongco-09/27': {
    theme: 'Mông Cổ Mùa Thu Thảo Nguyên & Lễ 2/9',
    desc: 'Thảo nguyên đổi sang sắc vàng óng ả, thời tiết se lạnh mát mẻ.',
    leadMonths: 'Chạy trước 7 tháng',
    startMkt: '02/2027',
    notes: 'Rơi vào kỳ nghỉ Lễ Quốc Khánh 2/9'
  },

  'trunga-04/27': {
    theme: 'Trung Á Mùa Hoa Tulip & Lễ 30/4',
    desc: 'Quê hương hoa tulip dại, các thánh đường Samarkand, Bukhara & Tashkent.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '12/2026',
    notes: 'Rơi vào dịp nghỉ Lễ 30/04'
  },
  'trunga-06/27': {
    theme: 'Trung Á Con Đường Tơ Lụa Mùa Hè (Đoàn 1)',
    desc: 'Khám phá 3-5 nước Trung Á: Kazakhstan, Kyrgyzstan, Uzbekistan.',
    leadMonths: 'Chạy trước 4 tháng',
    startMkt: '02/2027',
    notes: 'Mở màn mùa tour hè Trung Á'
  },
  'trunga-07/27': {
    theme: 'Trung Á Chính Hè (Đoàn 2)',
    desc: 'Hồ Issyk-Kul trong xanh, dãy núi Thiên Sơn hùng vĩ & các di sản Ba Tư.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '02/2027',
    notes: 'Đoàn khởi hành tháng 7 hè'
  },
  'trunga-08/27': {
    theme: 'Trung Á Mùa Thu Hoạch Trái Cây (Đoàn 3)',
    desc: 'Mùa dưa lưới và trái cây ngọt ngào vùng Trung Á, khí hậu mát mẻ.',
    leadMonths: 'Chạy trước 6 tháng',
    startMkt: '02/2027',
    notes: 'Đoàn tháng 8 trước thềm Lễ 2/9'
  },

  'alaska-07/27': {
    theme: 'Alaska Thiên Nhiên Hoang Dã Mùa Hè',
    desc: 'Khám phá vịnh băng Kenai Fjords, gấu nâu bắt cá hồi tại Brooks Falls & đỉnh Denali.',
    leadMonths: 'Chạy trước 7 tháng',
    startMkt: '12/2026',
    notes: 'Tuyến định vị siêu cao cấp, visa Mỹ chuẩn bị sớm 7 tháng'
  },
  'alaska-08/27': {
    theme: 'Alaska Mùa Thu Đổi Màu Tundra & Lễ 2/9',
    desc: 'Thảm thực vật Tundra đổi màu đỏ thắm, sông băng rực rỡ và cơ hội ngắm cực quang sớm.',
    leadMonths: 'Chạy trước 8 tháng',
    startMkt: '12/2026',
    notes: 'Khởi hành dịp Lễ 2/9, trải nghiệm độc bản Bắc Mỹ'
  },

  'nammy-09/27': {
    theme: 'Nam Mỹ Huyền Thoại (Brazil - Argentina - Peru - Chile)',
    desc: 'Thánh địa Machu Picchu, thác nước khổng lồ Iguazu, sông băng Perito Moreno & Rio De Janeiro.',
    leadMonths: 'Chạy trước 9-10 tháng',
    startMkt: '12/2026',
    notes: 'Đỉnh cao tour đường xa, giá bán 330.9 triệu/pax, visa chuẩn bị 9 tháng'
  },

  'namibia-08/27': {
    theme: 'Namibia - Wildlife Safari & Cồn Cát Đỏ Sossusvlei (Lễ 2/9)',
    desc: 'Cồn cát đỏ cao nhất thế giới Sossusvlei, thung lũng cây khô Deadvlei & Safari vườn quốc gia Etosha.',
    leadMonths: 'Chạy trước 8 tháng',
    startMkt: '01/2027',
    notes: 'Khởi hành dịp Lễ 2/9, sản phẩm định vị phong cách hoang dã'
  },

  'bacmongco-09/27': {
    theme: 'Bắc Mông Cổ - Hồ Khovsgol & Mùa Thu Lá Vàng',
    desc: 'Hồ nước ngọt sâu nhất Mông Cổ, rừng Taiga đổi màu vàng rực rỡ và văn hóa du mục phương Bắc.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '04/2027',
    notes: 'Khởi hành mùa thu lá vàng Bắc Mông Cổ'
  },
  'bacmongco-10/27': {
    theme: 'Bắc Mông Cổ - Bộ Tộc Tuần Lộc Tsaatan',
    desc: 'Cưỡi ngựa vượt rừng Taiga băng giá tiếp cận bộ tộc tuần lộc nguyên thủy Tsaatan.',
    leadMonths: 'Chạy trước 5 tháng',
    startMkt: '05/2027',
    notes: 'Trải nghiệm văn hóa sinh tồn độc nhất vô nhị'
  }
};

// 11 Tuyến sản phẩm chính xác theo Google Sheet BU5 Tab Timeline
export const PRODUCT_TIMELINE_ROWS = [
  {
    stt: 1,
    id: 'pakistan',
    name: 'Pakistan',
    fullName: 'Pakistan - Mùa Hoa Anh Đào & Thu Hunza',
    category: 'Tuyến trụ cột',
    icon: '🏔️',
    color: '#16a34a',
    pricePerPax: 74900000,
    costPerPax: 67000000,
    departures: {
      '10/26': 1,
      '03/27': 1,
      '04/27': 1,
      '10/27': 1,
      '11/27': 1,
      '12/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 2,
    id: 'aicap',
    name: 'Ai Cập',
    fullName: 'Ai Cập Huyền Bí & Du Thuyền Nile 5 Sao',
    category: 'Tuyến trụ cột',
    icon: '☀️',
    color: '#d97706',
    pricePerPax: 104900000,
    costPerPax: 89372535,
    departures: {
      '11/26': 1,
      '12/26': 1,
      '02/27': 1,
      '04/27': 1,
      '11/27': 1,
      '12/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 3,
    id: 'maroc',
    name: 'Maroc',
    fullName: 'Maroc - Viên Ngọc Bắc Phi & Sa Mạc Sahara',
    category: 'Tuyến trụ cột',
    icon: '🏜️',
    color: '#e11d48',
    pricePerPax: 109000000,
    costPerPax: 90175564,
    departures: {
      '11/26': 1,
      '02/27': 1,
      '03/27': 1,
      '04/27': 1,
      '11/27': 1,
      '12/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 4,
    id: 'nga',
    name: 'Nga - Bắc Cực Quang',
    fullName: 'Nga - Săn Cực Quang Murmansk & Moscow - St. Petersburg',
    category: 'Tuyến mùa vụ',
    icon: '❄️',
    color: '#0284c7',
    pricePerPax: 165000000,
    costPerPax: 140000000,
    departures: {
      '02/27': 1,
      '12/27': 1
    },
    totalGroups: 2
  },
  {
    stt: 5,
    id: 'baikal',
    name: 'Baikal',
    fullName: 'Hồ Baikal Mùa Đông Băng Tuyết',
    category: 'Tuyến mùa vụ',
    icon: '🧊',
    color: '#06b6d4',
    pricePerPax: 85000000,
    costPerPax: 72000000,
    departures: {
      '02/27': 1,
      '03/27': 1
    },
    totalGroups: 2
  },
  {
    stt: 6,
    id: 'mongco',
    name: 'Mông Cổ',
    fullName: 'Mông Cổ - Thảo Nguyên Bất Tận & Sa Mạc Gobi',
    category: 'Tuyến trụ cột',
    icon: '🐎',
    color: '#059669',
    pricePerPax: 78900000,
    costPerPax: 68900000,
    departures: {
      '06/27': 1,
      '07/27': 2,
      '08/27': 2,
      '09/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 7,
    id: 'trunga',
    name: 'Trung Á',
    fullName: 'Con Đường Tơ Lụa Trung Á 5 Nước',
    category: 'Tuyến mùa vụ',
    icon: '🏛️',
    color: '#8b5cf6',
    pricePerPax: 80000000,
    costPerPax: 72000000,
    departures: {
      '04/27': 1,
      '06/27': 1,
      '07/27': 1,
      '08/27': 1
    },
    totalGroups: 4
  },
  {
    stt: 8,
    id: 'alaska',
    name: 'Alaska',
    fullName: 'Alaska - Vùng Cực Bắc Mỹ (Hè & Thu)',
    category: 'Tuyến định vị',
    icon: '🌲',
    color: '#0284c7',
    pricePerPax: 215000000,
    costPerPax: 185000000,
    departures: {
      '07/27': 1,
      '08/27': 1
    },
    totalGroups: 2
  },
  {
    stt: 9,
    id: 'nammy',
    name: 'Nam Mỹ',
    fullName: 'Nam Mỹ Huyền Thoại (Brazil - Argentina - Peru - Chile)',
    category: 'Tuyến định vị',
    icon: '🗿',
    color: '#f59e0b',
    pricePerPax: 330900000,
    costPerPax: 270000000,
    departures: {
      '09/27': 1
    },
    totalGroups: 1
  },
  {
    stt: 10,
    id: 'namibia',
    name: 'Namibia',
    fullName: 'Namibia - Wildlife Safari & Cồn Cát Đỏ Sossusvlei',
    category: 'Tuyến định vị',
    icon: '🦒',
    color: '#ea580c',
    pricePerPax: 180000000,
    costPerPax: 150000000,
    departures: {
      '08/27': 1
    },
    totalGroups: 1
  },
  {
    stt: 11,
    id: 'bacmongco',
    name: 'Bắc Mông Cổ',
    fullName: 'Bắc Mông Cổ - Hồ Khovsgol & Tuần Lộc Tsaatan',
    category: 'Tuyến phát triển',
    icon: '🦌',
    color: '#475569',
    pricePerPax: 98900000,
    costPerPax: 87700000,
    departures: {
      '09/27': 1,
      '10/27': 1
    },
    totalGroups: 2
  }
];

// Tổng số đoàn theo tháng chính xác 100% từ dòng 17 Google Sheet
export const MONTHLY_TOTAL_DEPARTURES = {
  '10/26': 1,
  '11/26': 2,
  '12/26': 1,
  '01/27': 0,
  '02/27': 4,
  '03/27': 3,
  '04/27': 4,
  '05/27': 0,
  '06/27': 2,
  '07/27': 4,
  '08/27': 5,
  '09/27': 3,
  '10/27': 2,
  '11/27': 3,
  '12/27': 4
};

export default function BU5ProductTimelineTable() {
  const [hoveredCell, setHoveredCell] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedCellModal, setSelectedCellModal] = useState(null);
  const [selectedMonthModal, setSelectedMonthModal] = useState(null);

  // Đóng Modal bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedCellModal(null);
        setSelectedMonthModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCellClick = (row, tm, count) => {
    if (count <= 0) return;
    const key = `${row.id}-${tm.key}`;
    const detail = DEPARTURE_DETAILS[key] || {
      theme: `${row.name} (${tm.label})`,
      desc: row.fullName,
      leadMonths: 'Chạy trước 4-6 tháng',
      startMkt: 'Theo kế hoạch',
      notes: 'Khởi hành theo tiến độ BU5'
    };
    const pax = count * 10;
    const revenue = count * 10 * row.pricePerPax;
    const profit = count * 10 * (row.pricePerPax - row.costPerPax);
    const mktBudget = revenue * 0.01;

    setSelectedCellModal({
      product: row,
      month: tm,
      count,
      pax,
      revenue,
      profit,
      mktBudget,
      detail
    });
  };

  const handleMonthHeaderClick = (tm) => {
    const activeProducts = PRODUCT_TIMELINE_ROWS.filter(row => (row.departures[tm.key] || 0) > 0).map(row => {
      const count = row.departures[tm.key];
      const pax = count * 10;
      const revenue = count * 10 * row.pricePerPax;
      const mktBudget = revenue * 0.01;
      const detail = DEPARTURE_DETAILS[`${row.id}-${tm.key}`];
      return {
        product: row,
        count,
        pax,
        revenue,
        mktBudget,
        detail
      };
    });

    const totalRevenue = activeProducts.reduce((sum, item) => sum + item.revenue, 0);
    const totalMkt = activeProducts.reduce((sum, item) => sum + item.mktBudget, 0);
    const totalPax = activeProducts.reduce((sum, item) => sum + item.pax, 0);
    const totalCount = activeProducts.reduce((sum, item) => sum + item.count, 0);

    setSelectedMonthModal({
      month: tm,
      activeProducts,
      totalRevenue,
      totalMkt,
      totalPax,
      totalCount
    });
  };

  const scrollToSection = (id) => {
    setSelectedCellModal(null);
    setSelectedMonthModal(null);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #cbd5e1',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      marginBottom: '36px',
      position: 'relative'
    }}>
      {/* ── BANNER TIÊU ĐỀ CHUẨN GOOGLE SHEET BU5 ── */}
      <div style={{
        background: '#000000',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🗓️</span>
            <h2 style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              BU5 - TIMELINE SẢN PHẨM THEO THÁNG
            </h2>
          </div>
          <p style={{
            margin: '4px 0 0',
            color: '#94a3b8',
            fontSize: '0.8rem'
          }}>
            Kế hoạch tổng thể nhịp độ khởi hành 11 tuyến sản phẩm (15 tháng từ 10/2026 đến 12/2027) • Bấm vào ô để xem Doanh Thu
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#38bdf8',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            Tổng 38 lượt khởi hành (34 đoàn 2027 + 4 đoàn cuối 2026)
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/10kuQXdFgFLVSRS4CbKYa-ozuch6RnPJd8NTo36fFhrc/edit#gid=2106737229"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#059669',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <span>Mở Sheet Timeline</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ── THANH CHÚ THÍCH VÀNG NHƯ GOOGLE SHEET ── */}
      <div style={{
        background: '#fef3c7',
        borderBottom: '1px solid #fde68a',
        padding: '8px 24px',
        fontSize: '0.78rem',
        color: '#78350f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={14} color="#b45309" />
          <span>
            <strong>Hướng dẫn xem:</strong> Rê chuột để xem nhanh tooltip • <strong>Bấm vào ô</strong> để xem chi tiết Doanh thu, Lợi nhuận và Ngân sách MKT 1%.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '18px', height: '14px', borderRadius: '3px', background: '#dbeafe', border: '1px solid #93c5fd', display: 'inline-block' }} />
            <span>Có đoàn khởi hành (Bấm xem)</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '18px', height: '14px', borderRadius: '3px', background: '#fef3c7', border: '1px solid #f59e0b', display: 'inline-block' }} />
            <span>Tổng đoàn tháng</span>
          </span>
        </div>
      </div>

      {/* ── BẢNG TIMELINE SẢN PHẨM ── */}
      <div style={{ overflowX: 'auto', position: 'relative' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.84rem',
          textAlign: 'center'
        }}>
          {/* Header Bảng */}
          <thead>
            <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '2px solid #334155' }}>
              <th style={{
                padding: '12px 10px',
                width: '36px',
                textAlign: 'center',
                borderRight: '1px solid #1e293b',
                fontWeight: 700
              }}>#</th>

              <th style={{
                padding: '12px 14px',
                minWidth: '180px',
                textAlign: 'left',
                borderRight: '2px solid #334155',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                Sản Phẩm
              </th>

              {/* 15 Cột Tháng */}
              {TIMELINE_MONTHS.map(tm => {
                const isPrep = tm.year === 2026;
                const isPeak = ['02/27', '04/27', '07/27', '08/27'].includes(tm.key);
                return (
                  <th
                    key={tm.key}
                    onClick={() => handleMonthHeaderClick(tm)}
                    style={{
                      padding: '10px 4px',
                      minWidth: '58px',
                      borderRight: '1px solid #1e293b',
                      background: isPeak ? '#0f172a' : (isPrep ? '#1e293b' : '#000000'),
                      whiteSpace: 'nowrap',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                    title={`Bấm để xem tổng quan toàn bộ tour trong tháng ${tm.label}`}
                  >
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: isPrep ? '#fbbf24' : (isPeak ? '#38bdf8' : '#ffffff')
                    }}>
                      {tm.label}
                    </div>
                    {tm.holiday && (
                      <div style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: tm.holiday.includes('Tết') ? '#f87171' : '#38bdf8',
                        marginTop: '2px'
                      }}>
                        {tm.holiday}
                      </div>
                    )}
                  </th>
                );
              })}

              <th style={{
                padding: '12px 10px',
                width: '80px',
                textAlign: 'center',
                background: '#0f172a',
                borderLeft: '2px solid #334155',
                fontWeight: 800,
                color: '#38bdf8'
              }}>
                Tổng Đoàn
              </th>
            </tr>
          </thead>

          {/* Body Bảng: 11 Tuyến Sản Phẩm */}
          <tbody>
            {PRODUCT_TIMELINE_ROWS.map((row, idx) => {
              const badgeStyle = getCategoryBadgeStyle(row.category);
              return (
                <tr
                  key={row.id}
                  style={{
                    background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{
                    padding: '10px 8px',
                    color: '#64748b',
                    fontWeight: 600,
                    borderRight: '1px solid #f1f5f9'
                  }}>
                    {row.stt}
                  </td>

                  {/* Cột Tên Sản Phẩm */}
                  <td style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    borderRight: '2px solid #e2e8f0',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>{row.icon}</span>
                      <span style={{ color: row.color, fontSize: '0.88rem' }}>{row.name}</span>
                      <span style={{
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {row.category}
                      </span>
                    </div>
                  </td>

                  {/* 15 Ô Tháng của Sản Phẩm */}
                  {TIMELINE_MONTHS.map(tm => {
                    const count = row.departures[tm.key] || 0;
                    const hasTour = count > 0;
                    const cellKey = `${row.id}-${tm.key}`;
                    const isCellHovered = hoveredCell?.key === cellKey;
                    const detail = DEPARTURE_DETAILS[cellKey];

                    return (
                      <td
                        key={tm.key}
                        onClick={() => handleCellClick(row, tm, count)}
                        onMouseEnter={(e) => {
                          if (hasTour) {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setTooltipPos({
                              x: rect.left + rect.width / 2,
                              y: rect.top
                            });
                            setHoveredCell({
                              key: cellKey,
                              product: row,
                              month: tm,
                              count,
                              detail,
                              revenue: count * 10 * row.pricePerPax,
                              mkt: count * 10 * row.pricePerPax * 0.01
                            });
                          }
                        }}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          padding: '6px 4px',
                          borderRight: '1px solid #f1f5f9',
                          background: hasTour ? (isCellHovered ? '#93c5fd' : '#dbeafe') : (isCellHovered ? '#f1f5f9' : 'transparent'),
                          transition: 'all 0.12s ease',
                          cursor: hasTour ? 'pointer' : 'default',
                          position: 'relative'
                        }}
                      >
                        {hasTour ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '24px',
                            borderRadius: '4px',
                            background: count > 1 ? '#1d4ed8' : '#2563eb',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            boxShadow: isCellHovered ? '0 2px 8px rgba(37, 99, 235, 0.45)' : '0 1px 3px rgba(37, 99, 235, 0.25)',
                            transform: isCellHovered ? 'scale(1.12)' : 'scale(1)',
                            transition: 'transform 0.12s ease'
                          }}>
                            {count}
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>·</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Cột Tổng Số Đoàn của Tuyến */}
                  <td style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: 800,
                    color: '#0284c7',
                    background: '#f8fafc',
                    borderLeft: '2px solid #e2e8f0',
                    fontSize: '0.86rem'
                  }}>
                    {row.totalGroups} đoàn
                  </td>
                </tr>
              );
            })}

            {/* ── DÒNG TỔNG KẾT THEO THÁNG (DÒNG 17 GOOGLE SHEET) ── */}
            <tr style={{
              background: '#fef3c7',
              borderTop: '2px solid #f59e0b',
              fontWeight: 800,
              color: '#78350f'
            }}>
              <td colSpan={2} style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderRight: '2px solid #fde68a',
                fontSize: '0.88rem'
              }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Tổng số đoàn theo tháng:
                </span>
              </td>

              {/* 15 Giá trị Tổng Tháng */}
              {TIMELINE_MONTHS.map(tm => {
                const total = MONTHLY_TOTAL_DEPARTURES[tm.key] || 0;
                const isPeak = total >= 4;

                return (
                  <td
                    key={tm.key}
                    onClick={() => handleMonthHeaderClick(tm)}
                    style={{
                      padding: '12px 4px',
                      borderRight: '1px solid #fde68a',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: total === 0 ? '#a16207' : (isPeak ? '#b45309' : '#78350f'),
                      background: isPeak ? '#fde68a' : '#fef3c7',
                      cursor: 'pointer'
                    }}
                    title={`Bấm xem danh sách ${total} đoàn tháng ${tm.label}`}
                  >
                    {total}
                  </td>
                );
              })}

              {/* Tổng Cộng Toàn Bộ 15 Tháng */}
              <td style={{
                padding: '12px 8px',
                textAlign: 'center',
                background: '#fde68a',
                borderLeft: '2px solid #f59e0b',
                color: '#78350f',
                fontSize: '0.94rem',
                fontWeight: 800
              }}>
                38 đoàn
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── INTERACTIVE FLOATING TOOLTIP KHI RÊ CHUỘT ── */}
      {hoveredCell && (
        <div style={{
          position: 'fixed',
          left: `${Math.min(window.innerWidth - 320, Math.max(20, tooltipPos.x - 140))}px`,
          top: `${tooltipPos.y - 120}px`,
          zIndex: 9999,
          background: '#0f172a',
          color: '#ffffff',
          borderRadius: '8px',
          padding: '10px 14px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          border: '1px solid #334155',
          pointerEvents: 'none',
          width: '280px',
          fontSize: '0.78rem',
          lineHeight: 1.4,
          animation: 'fadeIn 0.15s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800, color: '#38bdf8', fontSize: '0.85rem' }}>
              {hoveredCell.product.icon} {hoveredCell.product.name}
            </span>
            <span style={{ background: '#0284c7', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 }}>
              Tháng {hoveredCell.month.label}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '6px' }}>
            <div style={{ background: '#1e293b', padding: '4px 6px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Khởi hành:</div>
              <div style={{ fontWeight: 800, color: '#34d399' }}>{hoveredCell.count} đoàn ({hoveredCell.count * 10} Pax)</div>
            </div>
            <div style={{ background: '#1e293b', padding: '4px 6px', borderRadius: '4px' }}>
              <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Doanh thu:</div>
              <div style={{ fontWeight: 800, color: '#fde047' }}>{fmtMillion(hoveredCell.revenue)}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
            {hoveredCell.detail?.theme || hoveredCell.product.fullName}
          </div>

          <div style={{ fontSize: '0.68rem', color: '#38bdf8', fontStyle: 'italic', textAlign: 'right' }}>
            👉 Bấm vào ô để xem phân tích chi tiết & MKT 1%
          </div>
        </div>
      )}

      {/* ── 3 THẺ ĐIỂM RƠI CÁC KỲ NGHỈ LỄ & TẾT (GHI CHÚ GOOGLE SHEET BÊN PHẢI) ── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px'
      }}>
        {/* Card 1: Tết Âm Lịch 2027 */}
        <div 
          onClick={() => handleMonthHeaderClick(TIMELINE_MONTHS.find(m => m.key === '02/27'))}
          style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #fecaca',
            padding: '12px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Bấm để xem danh sách 4 đoàn mùa Tết"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🧧</span>
              <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.86rem' }}>
                Tết Âm Lịch 2027 (Điểm rơi T02/2027)
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>4 đoàn cất cánh 👉</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
            • <strong>Thời gian:</strong> Nghỉ 7 ngày (04/02 – 10/02/2027) hoặc 10 ngày (05/02 – 14/02/2027).<br />
            • <strong>4 đoàn cất cánh:</strong> Ai Cập Tết, Maroc Tết, Nga Murmansk (3 đoàn), Baikal mùa đông.
          </div>
        </div>

        {/* Card 2: Lễ 30/04 & 01/05 */}
        <div 
          onClick={() => handleMonthHeaderClick(TIMELINE_MONTHS.find(m => m.key === '04/27'))}
          style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #bfdbfe',
            padding: '12px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Bấm để xem danh sách 4 đoàn mùa Lễ 30/4"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🏖️</span>
              <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.86rem' }}>
                Lễ 30/04 – 01/05 (Điểm rơi T04/2027)
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 700 }}>4 đoàn cất cánh 👉</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
            • <strong>Thời gian:</strong> Nghỉ 4 ngày (Thứ 6 30/04 đến Thứ 2 03/05/2027).<br />
            • <strong>4 đoàn cất cánh:</strong> Pakistan (Hoa Anh Đào), Ai Cập lễ 30/4, Maroc mùa xuân, Trung Á.
          </div>
        </div>

        {/* Card 3: Lễ Quốc Khánh 2/9 */}
        <div 
          onClick={() => handleMonthHeaderClick(TIMELINE_MONTHS.find(m => m.key === '08/27'))}
          style={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #fed7aa',
            padding: '12px 14px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
          title="Bấm để xem danh sách 5 đoàn mùa Lễ 2/9"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.1rem' }}>🇻🇳</span>
              <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '0.86rem' }}>
                Lễ Quốc Khánh 2/9 (Điểm rơi T08 – T09/2027)
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 700 }}>5 đoàn đỉnh cao 👉</span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
            • <strong>Thời gian:</strong> Nghỉ 4 ngày (Thứ 5 02/09 đến Chủ nhật 05/09/2027).<br />
            • <strong>5 đoàn đỉnh cao:</strong> Alaska (Lễ 2/9), Namibia, Nam Mỹ, Bắc Mông Cổ, Mông Cổ mùa thu.
          </div>
        </div>
      </div>

      {/* ── MODAL CHI TIẾT KHI BẤM VÀO 1 Ô TOUR CỤ THỂ ── */}
      {selectedCellModal && (
        <div 
          onClick={() => setSelectedCellModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '620px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              animation: 'scaleUp 0.15s ease'
            }}
          >
            {/* Header Modal */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.4rem' }}>{selectedCellModal.product.icon}</span>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                    {selectedCellModal.product.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                    {selectedCellModal.product.fullName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 800
                }}>
                  Tháng {selectedCellModal.month.label}
                </span>
                <button
                  onClick={() => setSelectedCellModal(null)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Nội dung chi tiết */}
            <div style={{ padding: '24px' }}>
              {/* Tên chủ đề hành trình */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px 16px',
                marginBottom: '18px'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0284c7', marginBottom: '4px' }}>
                  HÀNH TRÌNH KHỞI HÀNH THÁNG {selectedCellModal.month.label}:
                </div>
                <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  {selectedCellModal.detail.theme}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5 }}>
                  {selectedCellModal.detail.desc}
                </div>
              </div>

              {/* 4 Thẻ KPI Doanh Thu & Ngân Sách */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {/* 1. Doanh thu kế hoạch */}
                <div style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: '10px',
                  padding: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#0369a1', fontWeight: 700, marginBottom: '4px' }}>
                    <DollarSign size={15} />
                    <span>DOANH THU KẾ HOẠCH</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7' }}>
                    {fmtMillion(selectedCellModal.revenue)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '2px' }}>
                    {fmtVND(selectedCellModal.revenue)}
                  </div>
                </div>

                {/* 2. Kinh phí Marketing 1% */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '14px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#15803d', fontWeight: 700, marginBottom: '4px' }}>
                    <TrendingUp size={15} />
                    <span>KINH PHÍ MKT ĐỊNH MỨC 1%</span>
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a' }}>
                    {fmtVND(selectedCellModal.mktBudget)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#15803d', marginTop: '2px' }}>
                    Linh hoạt điều phối theo thực tế cọc
                  </div>
                </div>

                {/* 3. Quy mô đoàn & Target Pax */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                    <Users size={15} />
                    <span>QUY MÔ ĐOÀN</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedCellModal.count} đoàn • {selectedCellModal.pax} Pax
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Giá bán: <strong>{fmtVND(selectedCellModal.product.pricePerPax)}</strong> / Pax
                  </div>
                </div>

                {/* 4. Lãi gộp dự kiến */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#475569', fontWeight: 700, marginBottom: '4px' }}>
                    <Sparkles size={15} />
                    <span>LÃI GỘP KẾ HOẠCH</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a' }}>
                    {fmtMillion(selectedCellModal.profit)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Tỷ suất lãi gộp: ~{Math.round((selectedCellModal.profit / selectedCellModal.revenue) * 100)}% Doanh thu
                  </div>
                </div>
              </div>

              {/* Thông tin chuẩn bị MKT & Vận hành */}
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '14px',
                fontSize: '0.82rem',
                color: '#475569',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={15} color="#0284c7" />
                  <span><strong>Thời gian chạy trước (Lead time):</strong> {selectedCellModal.detail.leadMonths} (bắt đầu từ {selectedCellModal.detail.startMkt}).</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={15} color="#16a34a" />
                  <span><strong>Ghi chú kế hoạch:</strong> {selectedCellModal.detail.notes}.</span>
                </div>
              </div>

              {/* Nút thao tác chuyển nhanh */}
              <div style={{
                marginTop: '20px',
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => scrollToSection('sec-monthly-mkt')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Calendar size={14} />
                  <span>Xem Ma Trận Dòng Tiền MKT</span>
                </button>
                <button
                  onClick={() => scrollToSection('sec-departures')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Layers size={14} />
                  <span>Xem Lịch 27 Đoàn</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL TỔNG QUAN KHI BẤM VÀO TIÊU ĐỀ 1 THÁNG ── */}
      {selectedMonthModal && (
        <div 
          onClick={() => setSelectedMonthModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '640px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
              animation: 'scaleUp 0.15s ease'
            }}
          >
            {/* Header Modal Tháng */}
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>
                  Tổng Quan Khởi Hành Tháng {selectedMonthModal.month.label} ({selectedMonthModal.month.quarter})
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {selectedMonthModal.totalCount > 0 
                    ? `Có tổng cộng ${selectedMonthModal.totalCount} đoàn cất cánh trong tháng này`
                    : 'Tháng không bố trí đoàn khởi hành (Giai đoạn chuẩn bị hoặc mùa thấp điểm)'}
                </div>
              </div>

              <button
                onClick={() => setSelectedMonthModal(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Nội dung chi tiết tháng */}
            <div style={{ padding: '24px' }}>
              {/* Thống kê nhanh của tháng */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                marginBottom: '18px'
              }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tổng số đoàn:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    {selectedMonthModal.totalCount} đoàn ({selectedMonthModal.totalPax} Pax)
                  </div>
                </div>
                <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#0369a1' }}>Tổng doanh thu:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0284c7' }}>
                    {fmtMillion(selectedMonthModal.totalRevenue)}
                  </div>
                </div>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 12px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#15803d' }}>Tổng kinh phí MKT 1%:</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#16a34a' }}>
                    {fmtMillion(selectedMonthModal.totalMkt)}
                  </div>
                </div>
              </div>

              {/* Danh sách các tuyến cất cánh */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
                  DANH SÁCH SẢN PHẨM KHỞI HÀNH:
                </div>
                {selectedMonthModal.activeProducts.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedMonthModal.activeProducts.map((item, idx) => (
                      <div 
                        key={idx}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                            {item.product.icon} {item.product.name} ({item.count} đoàn)
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {item.detail?.theme || item.product.fullName}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: '#0284c7', fontSize: '0.88rem' }}>
                            {fmtMillion(item.revenue)}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#16a34a', fontWeight: 600 }}>
                            MKT: {fmtVND(item.mktBudget)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    background: '#f8fafc',
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}>
                    Tháng này không có đoàn khởi hành nào được xếp lịch.
                  </div>
                )}
              </div>

              {/* Nút đóng */}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setSelectedMonthModal(null)}
                  style={{
                    background: '#0f172a',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
