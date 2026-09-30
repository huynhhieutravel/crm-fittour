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
  MapPin
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
// DỮ LIỆU ĐỀ XUẤT KẾ HOẠCH NGÂN SÁCH & TIMELINE QUÝ 4/2026 (BU1 - TRUNG QUỐC)
// TỔNG NGÂN SÁCH ĐỀ XUẤT: 120.000.000 đ (40.000.000 đ / Tháng)
// ══════════════════════════════════════════════════════════════════════════════
const BU1_PROPOSAL_DATA = {
  totalBudget: 120000000,
  totalLeadsPhone: 812, // Tổng kỳ vọng lead SĐT
  totalMessages: 2580,  // Tổng kỳ vọng tin nhắn Inbox
  totalPaxAds: 162,     // Khách chốt trực tiếp từ Ads
  totalPaxExternal: 36, // Khách quen, giới thiệu, cá nhân Sale
  totalPaxOverall: 198, // Tổng số khách phục vụ dự kiến
  totalRevenue: 6320000000, // Doanh thu dự kiến ~6.32 tỷ VNĐ
  adsRevenue: 5180000000,
  adsRatio: 1.90, // Tỷ lệ Ads / Doanh thu ~1.90%
  routes: {
    giangnam: {
      name: 'Giang Nam (5N5Đ)',
      badgeColor: '#0284c7',
      budget: 30000000,
      tourPrice: 27990000,
      tourCost: 22392000,
      leadsPhone: 156,
      messages: 372,
      inboxToPhoneRate: 41.94,
      cr: 20,
      paxPerLead: 1.05,
      paxAds: 33,
      paxExternal: 7,
      paxTotal: 40,
      numGroups: 2,
      revenue: 1119600000,
      adsRevenue: 923670000,
      cplLeadDb: 192528
    },
    backinh: {
      name: 'Bắc Kinh (5N4Đ)',
      badgeColor: '#dc2626',
      budget: 25000000,
      tourPrice: 33990000,
      tourCost: 27192000,
      leadsPhone: 168,
      messages: 517,
      inboxToPhoneRate: 32.52,
      cr: 19,
      paxPerLead: 1.05,
      paxAds: 34,
      paxExternal: 6,
      paxTotal: 40,
      numGroups: 2,
      revenue: 1359600000,
      adsRevenue: 1155660000,
      cplLeadDb: 148563
    },
    legian: {
      name: 'Lệ Giang - Shangrila (6N5Đ)',
      badgeColor: '#ea580c',
      budget: 20000000,
      tourPrice: 27990000,
      tourCost: 22392000,
      leadsPhone: 157,
      messages: 397,
      inboxToPhoneRate: 39.53,
      cr: 19,
      paxPerLead: 1.05,
      paxAds: 31,
      paxExternal: 5,
      paxTotal: 36,
      numGroups: 2,
      revenue: 1007640000,
      adsRevenue: 867690000,
      cplLeadDb: 127295
    },
    capnhitan: {
      name: 'Cáp Nhĩ Tân Mùa Đông (Series)',
      badgeColor: '#06b6d4',
      budget: 15000000,
      tourPrice: 51990000,
      tourCost: 41592000,
      leadsPhone: 147,
      messages: 648,
      inboxToPhoneRate: 22.68,
      cr: 18,
      paxPerLead: 1.05,
      paxAds: 28,
      paxExternal: 5,
      paxTotal: 33,
      numGroups: 2,
      revenue: 1715670000,
      adsRevenue: 1455720000,
      cplLeadDb: 102122
    },
    adinh: {
      name: 'Đạo Thành Á Đinh (8N7Đ)',
      badgeColor: '#10b981',
      budget: 12000000,
      tourPrice: 41900000,
      tourCost: 33520000,
      leadsPhone: 88,
      messages: 305,
      inboxToPhoneRate: 28.82,
      cr: 18,
      paxPerLead: 1.05,
      paxAds: 17,
      paxExternal: 5,
      paxTotal: 22,
      numGroups: 1,
      revenue: 921800000,
      adsRevenue: 712300000,
      cplLeadDb: 136081
    },
    tancuong: {
      name: 'Tân Cương Mùa Thu & Lễ (8N7Đ)',
      badgeColor: '#f59e0b',
      budget: 10000000,
      tourPrice: 67990000,
      tourCost: 54392000,
      leadsPhone: 52,
      messages: 168,
      inboxToPhoneRate: 30.94,
      cr: 20,
      paxPerLead: 1.05,
      paxAds: 11,
      paxExternal: 4,
      paxTotal: 15,
      numGroups: 1,
      revenue: 1019850000,
      adsRevenue: 747890000,
      cplLeadDb: 193796
    },
    thanhtang: {
      name: 'Chuyến Tàu Thanh Tạng (10N9Đ)',
      badgeColor: '#8b5cf6',
      budget: 8000000,
      tourPrice: 68990000,
      tourCost: 55192000,
      leadsPhone: 54,
      messages: 220,
      inboxToPhoneRate: 24.60,
      cr: 16,
      paxPerLead: 1.05,
      paxAds: 9,
      paxExternal: 3,
      paxTotal: 12,
      numGroups: 1,
      revenue: 827880000,
      adsRevenue: 620910000,
      cplLeadDb: 149358
    }
  }
};

// ══════════════════════════════════════════════════════════════════════════════
// DỮ LIỆU LỊCH SỬ THỰC TẾ TRÍCH XUẤT 100% TỪ DATABASE POSTGRESQL PRODUCTION BU1
// ══════════════════════════════════════════════════════════════════════════════

// 1. GIANG NAM (63 records thực tế DB)
const GIANGNAM_HISTORICAL_DATA = {
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
};

// 2. BẮC KINH (31 records thực tế DB)
const BACKINH_HISTORICAL_DATA = {
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
};

// 3. ĐẠO THÀNH Á ĐINH (79 records thực tế DB)
const ADINH_HISTORICAL_DATA = {
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
};

// 4. TÂN CƯƠNG (39 records thực tế DB)
const TANCUONG_HISTORICAL_DATA = {
  totalSpend: 55231862,
  totalMessages: 921,
  totalLeads: 285,
  cplMsgAvg: 59969,
  cplLeadAvg: 193796,
  inboxToLeadRate: 30.94,
  months: [
    { month: 'Tháng 3/2026', spend: 6757819, messages: 194, leads: 52, cplMsg: 34834, cplLead: 129958, note: 'Khởi động phễu hoa mơ Y Lỵ Tân Cương' },
    { month: 'Tháng 4/2026', spend: 5737053, messages: 171, leads: 39, cplMsg: 33550, cplLead: 147104, note: 'Tập trung tệp khách VIP chuộng Road Trip' },
    { month: 'Tháng 5/2026', spend: 19105354, messages: 251, leads: 98, cplMsg: 76117, cplLead: 194953, note: 'Bung ngân sách cao điểm hè Bắc Cương & Kanas' },
    { month: 'Tháng 6/2026', spend: 16624955, messages: 198, leads: 70, cplMsg: 83964, cplLead: 237499, note: 'Chốt khách tháng 7-8' },
    { month: 'Tháng 8/2026', spend: 2561084, messages: 40, leads: 10, cplMsg: 64027, cplLead: 256108, note: 'Khởi động mùa thu vàng Bắc Cương' },
    { month: 'Tháng 9/2026', spend: 4445800, messages: 67, leads: 16, cplMsg: 66355, cplLead: 277863, note: 'Chốt khách Nam Tân Cương lá vàng mùa thu' }
  ]
};

// 5. CHUYẾN TÀU THANH TẠNG (66 records thực tế DB)
const THANHTANG_HISTORICAL_DATA = {
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
};

// 6. LỆ GIANG - SHANGRI-LA (34 records thực tế DB)
const LEGIAN_HISTORICAL_DATA = {
  totalSpend: 25713527,
  totalMessages: 511,
  totalLeads: 202,
  cplMsgAvg: 50320,
  cplLeadAvg: 127295,
  inboxToLeadRate: 39.53,
  months: [
    { month: 'Tháng 1/2026', spend: 3727862, messages: 90, leads: 46, cplMsg: 41421, cplLead: 81040, note: 'Hiệu quả vượt trội: 81k/lead có SĐT' },
    { month: 'Tháng 5/2026', spend: 2649528, messages: 62, leads: 32, cplMsg: 42734, cplLead: 82798, note: 'CPL ổn định ở mức 82k' },
    { month: 'Tháng 6/2026', spend: 4097772, messages: 80, leads: 37, cplMsg: 51222, cplLead: 110751, note: 'Cao điểm hè đón khách trẻ & gia đình' },
    { month: 'Tháng 7/2026', spend: 7991272, messages: 131, leads: 53, cplMsg: 61002, cplLead: 150779, note: 'Bung ngân sách mạnh nhất hè (53 lead SĐT)' },
    { month: 'Tháng 8/2026', spend: 3711541, messages: 76, leads: 23, cplMsg: 48836, cplLead: 161371, note: 'Chuyển hướng đón mùa thu Đại Lý - Sa Khê' },
    { month: 'Tháng 9/2026', spend: 3225140, messages: 68, leads: 10, cplMsg: 47429, cplLead: 322514, note: 'Khởi động tệp khách mùa thu tuyết Ngọc Long' }
  ]
};

// 7. CÁP NHĨ TÂN (Test T9 mở bán mùa đông thực tế DB)
const CAPNHITAN_HISTORICAL_DATA = {
  totalSpend: 2246678,
  totalMessages: 97,
  totalLeads: 22,
  cplMsgAvg: 23162,
  cplLeadAvg: 102122,
  inboxToLeadRate: 22.68,
  months: [
    { month: 'Tháng 9/2026', spend: 2246678, messages: 97, leads: 22, cplMsg: 23162, cplLead: 102122, note: 'Test mở bán sớm mùa đông: 22 lead SĐT chỉ với 2.24M (CPL chỉ 102k cực hot)' }
  ]
};

// ══════════════════════════════════════════════════════════════════════════════
// COMPONENT CHÍNH: BU1 MARKET PLANNING & ADS PROJECTION
// ══════════════════════════════════════════════════════════════════════════════
const BU1MarketPlanningPage = ({ isEmbedded = false, onBack = null }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');

  const getInitialTab = () => {
    if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'giangnam') return 'giangnam';
    if (tabParam === 'backinh') return 'backinh';
    if (tabParam === 'adinh') return 'adinh';
    if (tabParam === 'tancuong') return 'tancuong';
    if (tabParam === 'thanhtang') return 'thanhtang';
    if (tabParam === 'legian') return 'legian';
    if (tabParam === 'capnhitan') return 'capnhitan';
    if (tabParam === 'proposal') return 'proposal';
    return 'proposal';
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);

  useEffect(() => {
    if (tabParam) {
      if (tabParam === 'calculator' || tabParam === 'may-tinh' || tabParam === 'giangnam') {
        setActiveTab('giangnam');
      } else if (tabParam === 'backinh') {
        setActiveTab('backinh');
      } else if (tabParam === 'adinh') {
        setActiveTab('adinh');
      } else if (tabParam === 'tancuong') {
        setActiveTab('tancuong');
      } else if (tabParam === 'thanhtang') {
        setActiveTab('thanhtang');
      } else if (tabParam === 'legian') {
        setActiveTab('legian');
      } else if (tabParam === 'capnhitan') {
        setActiveTab('capnhitan');
      } else if (tabParam === 'proposal') {
        setActiveTab('proposal');
      }
    }
  }, [tabParam]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  // State máy tính cho Giang Nam
  const [gnBudgetCap, setGnBudgetCap] = useState(30000000);
  const [gnCplTarget, setGnCplTarget] = useState(192528);
  const [gnCr, setGnCr] = useState(20);
  const [gnPaxPerLead, setGnPaxPerLead] = useState(1.05);
  const [gnNumGroups, setGnNumGroups] = useState(2);
  const [gnPaxPerGroup, setGnPaxPerGroup] = useState(16);
  const [gnPrice, setGnPrice] = useState(27990000);
  const [gnCost, setGnCost] = useState(22392000);

  // State máy tính cho Bắc Kinh
  const [bkBudgetCap, setBkBudgetCap] = useState(25000000);
  const [bkCplTarget, setBkCplTarget] = useState(148563);
  const [bkCr, setBkCr] = useState(19);
  const [bkPaxPerLead, setBkPaxPerLead] = useState(1.05);
  const [bkNumGroups, setBkNumGroups] = useState(2);
  const [bkPaxPerGroup, setBkPaxPerGroup] = useState(14);
  const [bkPrice, setBkPrice] = useState(33990000);
  const [bkCost, setBkCost] = useState(27192000);

  // State máy tính cho Á Đinh
  const [adBudgetCap, setAdBudgetCap] = useState(12000000);
  const [adCplTarget, setAdCplTarget] = useState(136081);
  const [adCr, setAdCr] = useState(18);
  const [adPaxPerLead, setAdPaxPerLead] = useState(1.05);
  const [adNumGroups, setAdNumGroups] = useState(1);
  const [adPaxPerGroup, setAdPaxPerGroup] = useState(15);
  const [adPrice, setAdPrice] = useState(41900000);
  const [adCost, setAdCost] = useState(33520000);

  // State máy tính cho Tân Cương
  const [tcBudgetCap, setTcBudgetCap] = useState(10000000);
  const [tcCplTarget, setTcCplTarget] = useState(193796);
  const [tcCr, setTcCr] = useState(20);
  const [tcPaxPerLead, setTcPaxPerLead] = useState(1.05);
  const [tcNumGroups, setTcNumGroups] = useState(1);
  const [tcPaxPerGroup, setTcPaxPerGroup] = useState(10);
  const [tcPrice, setTcPrice] = useState(67990000);
  const [tcCost, setTcCost] = useState(54392000);

  // State máy tính cho Thanh Tạng
  const [ttBudgetCap, setTtBudgetCap] = useState(8000000);
  const [ttCplTarget, setTtCplTarget] = useState(149358);
  const [ttCr, setTtCr] = useState(16);
  const [ttPaxPerLead, setTtPaxPerLead] = useState(1.05);
  const [ttNumGroups, setTtNumGroups] = useState(1);
  const [ttPaxPerGroup, setTtPaxPerGroup] = useState(10);
  const [ttPrice, setTtPrice] = useState(68990000);
  const [ttCost, setTtCost] = useState(55192000);

  // State máy tính cho Lệ Giang
  const [lgBudgetCap, setLgBudgetCap] = useState(20000000);
  const [lgCplTarget, setLgCplTarget] = useState(127295);
  const [lgCr, setLgCr] = useState(19);
  const [lgPaxPerLead, setLgPaxPerLead] = useState(1.05);
  const [lgNumGroups, setLgNumGroups] = useState(2);
  const [lgPaxPerGroup, setLgPaxPerGroup] = useState(16);
  const [lgPrice, setLgPrice] = useState(27990000);
  const [lgCost, setLgCost] = useState(22392000);

  // State máy tính cho Cáp Nhĩ Tân
  const [cnBudgetCap, setCnBudgetCap] = useState(15000000);
  const [cnCplTarget, setCnCplTarget] = useState(102122);
  const [cnCr, setCnCr] = useState(18);
  const [cnPaxPerLead, setCnPaxPerLead] = useState(1.05);
  const [cnNumGroups, setCnNumGroups] = useState(2);
  const [cnPaxPerGroup, setCnPaxPerGroup] = useState(16);
  const [cnPrice, setCnPrice] = useState(51990000);
  const [cnCost, setCnCost] = useState(41592000);

  // Hàm tính toán reactive cho Cách 2 (Cấp ngân sách -> Ra Lead & Pax)
  const calculateReverse = (budget, cpl, cr, paxRatio, tourPrice, convRate) => {
    const leads = cpl > 0 ? Math.round(budget / cpl) : 0;
    const inboxes = convRate > 0 ? Math.round(leads / (convRate / 100)) : Math.round(leads * 3.5);
    const pax = leads > 0 ? parseFloat((leads * (cr / 100) * paxRatio).toFixed(1)) : 0;
    const revenue = Math.round(pax * tourPrice);
    const adsRatio = revenue > 0 ? parseFloat(((budget / revenue) * 100).toFixed(2)) : 0;
    return { leads, inboxes, pax, revenue, adsRatio };
  };

  // Hàm tính toán reactive cho Cách 1 (Tính xuôi theo đoàn)
  const calculateForward = (numGroups, paxPerGroup, externalPax, cr, paxRatio, cpl, tourPrice, tourCost) => {
    const targetPaxTotal = numGroups * paxPerGroup;
    const paxNeededFromAds = Math.max(0, targetPaxTotal - externalPax);
    const leadsNeeded = (cr > 0 && paxRatio > 0) 
      ? Math.ceil(paxNeededFromAds / ((cr / 100) * paxRatio)) 
      : 0;
    const adsBudgetNeeded = Math.round(leadsNeeded * cpl);
    const totalRevenue = targetPaxTotal * tourPrice;
    const totalCost = targetPaxTotal * tourCost;
    const grossProfit = totalRevenue - totalCost - adsBudgetNeeded;
    const adsRatio = totalRevenue > 0 ? parseFloat(((adsBudgetNeeded / totalRevenue) * 100).toFixed(2)) : 0;
    const breakEvenPax = (tourPrice - tourCost) > 0 ? Math.ceil(adsBudgetNeeded / (tourPrice - tourCost)) : 0;
    return {
      targetPaxTotal,
      paxNeededFromAds,
      leadsNeeded,
      adsBudgetNeeded,
      totalRevenue,
      grossProfit,
      adsRatio,
      breakEvenPax
    };
  };

  // Memo kết quả cho từng tuyến
  const gnRev = useMemo(() => calculateReverse(gnBudgetCap, gnCplTarget, gnCr, gnPaxPerLead, gnPrice, GIANGNAM_HISTORICAL_DATA.inboxToLeadRate), [gnBudgetCap, gnCplTarget, gnCr, gnPaxPerLead, gnPrice]);
  const gnFwd = useMemo(() => calculateForward(gnNumGroups, gnPaxPerGroup, 7, gnCr, gnPaxPerLead, gnCplTarget, gnPrice, gnCost), [gnNumGroups, gnPaxPerGroup, gnCr, gnPaxPerLead, gnCplTarget, gnPrice, gnCost]);

  const bkRev = useMemo(() => calculateReverse(bkBudgetCap, bkCplTarget, bkCr, bkPaxPerLead, bkPrice, BACKINH_HISTORICAL_DATA.inboxToLeadRate), [bkBudgetCap, bkCplTarget, bkCr, bkPaxPerLead, bkPrice]);
  const bkFwd = useMemo(() => calculateForward(bkNumGroups, bkPaxPerGroup, 6, bkCr, bkPaxPerLead, bkCplTarget, bkPrice, bkCost), [bkNumGroups, bkPaxPerGroup, bkCr, bkPaxPerLead, bkCplTarget, bkPrice, bkCost]);

  const adRev = useMemo(() => calculateReverse(adBudgetCap, adCplTarget, adCr, adPaxPerLead, adPrice, ADINH_HISTORICAL_DATA.inboxToLeadRate), [adBudgetCap, adCplTarget, adCr, adPaxPerLead, adPrice]);
  const adFwd = useMemo(() => calculateForward(adNumGroups, adPaxPerGroup, 5, adCr, adPaxPerLead, adCplTarget, adPrice, adCost), [adNumGroups, adPaxPerGroup, adCr, adPaxPerLead, adCplTarget, adPrice, adCost]);

  const tcRev = useMemo(() => calculateReverse(tcBudgetCap, tcCplTarget, tcCr, tcPaxPerLead, tcPrice, TANCUONG_HISTORICAL_DATA.inboxToLeadRate), [tcBudgetCap, tcCplTarget, tcCr, tcPaxPerLead, tcPrice]);
  const tcFwd = useMemo(() => calculateForward(tcNumGroups, tcPaxPerGroup, 4, tcCr, tcPaxPerLead, tcCplTarget, tcPrice, tcCost), [tcNumGroups, tcPaxPerGroup, tcCr, tcPaxPerLead, tcCplTarget, tcPrice, tcCost]);

  const ttRev = useMemo(() => calculateReverse(ttBudgetCap, ttCplTarget, ttCr, ttPaxPerLead, ttPrice, THANHTANG_HISTORICAL_DATA.inboxToLeadRate), [ttBudgetCap, ttCplTarget, ttCr, ttPaxPerLead, ttPrice]);
  const ttFwd = useMemo(() => calculateForward(ttNumGroups, ttPaxPerGroup, 3, ttCr, ttPaxPerLead, ttCplTarget, ttPrice, ttCost), [ttNumGroups, ttPaxPerGroup, ttCr, ttPaxPerLead, ttCplTarget, ttPrice, ttCost]);

  const lgRev = useMemo(() => calculateReverse(lgBudgetCap, lgCplTarget, lgCr, lgPaxPerLead, lgPrice, LEGIAN_HISTORICAL_DATA.inboxToLeadRate), [lgBudgetCap, lgCplTarget, lgCr, lgPaxPerLead, lgPrice]);
  const lgFwd = useMemo(() => calculateForward(lgNumGroups, lgPaxPerGroup, 5, lgCr, lgPaxPerLead, lgCplTarget, lgPrice, lgCost), [lgNumGroups, lgPaxPerGroup, lgCr, lgPaxPerLead, lgCplTarget, lgPrice, lgCost]);

  const cnRev = useMemo(() => calculateReverse(cnBudgetCap, cnCplTarget, cnCr, cnPaxPerLead, cnPrice, CAPNHITAN_HISTORICAL_DATA.inboxToLeadRate), [cnBudgetCap, cnCplTarget, cnCr, cnPaxPerLead, cnPrice]);
  const cnFwd = useMemo(() => calculateForward(cnNumGroups, cnPaxPerGroup, 5, cnCr, cnPaxPerLead, cnCplTarget, cnPrice, cnCost), [cnNumGroups, cnPaxPerGroup, cnCr, cnPaxPerLead, cnCplTarget, cnPrice, cnCost]);

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: activeTab === 'proposal' ? '#1e293b' : '#cbd5e1',
      background: activeTab === 'proposal' ? '#f8fafc' : '#090d16',
      paddingBottom: '80px'
    }}>
      {/* ── HEADER THANH ĐIỀU HƯỚNG BREADCRUMB & METADATA ── */}
      <div style={{
        padding: '16px 28px',
        borderBottom: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        background: activeTab === 'proposal' ? '#ffffff' : '#090d16'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          <FolderGit2 size={16} color={activeTab === 'proposal' ? '#0284c7' : '#94a3b8'} />
          <span style={{ color: activeTab === 'proposal' ? '#64748b' : '#94a3b8' }}>Tài liệu nội bộ</span>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ color: activeTab === 'proposal' ? '#0284c7' : '#38bdf8', fontWeight: 600 }}>Thị trường BU1 (Tour Trung Quốc)</span>
          <span style={{ color: '#475569' }}>/</span>
          <span style={{ color: activeTab === 'proposal' ? '#0f172a' : '#e2e8f0', fontWeight: 600 }}>
            {activeTab === 'proposal' && 'Bảng Đề Xuất & Timeline Quý 4 (120 Triệu)'}
            {activeTab === 'giangnam' && 'Dự Toán Ads Giang Nam (5N5Đ)'}
            {activeTab === 'backinh' && 'Dự Toán Ads Bắc Kinh (5N4Đ)'}
            {activeTab === 'adinh' && 'Kế Hoạch Ads Đạo Thành Á Đinh (8N7Đ)'}
            {activeTab === 'tancuong' && 'Kế Hoạch Ads Tân Cương (8N7Đ)'}
            {activeTab === 'thanhtang' && 'Kế Hoạch Ads Chuyến Tàu Thanh Tạng (10N9Đ)'}
            {activeTab === 'legian' && 'Dự Toán Ads Lệ Giang - Shangrila (6N5Đ)'}
            {activeTab === 'capnhitan' && 'Dự Toán Ads Cáp Nhĩ Tân Mùa Đông (Series)'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '20px',
            background: activeTab === 'proposal' ? '#ffffff' : '#131d2e',
            color: activeTab === 'proposal' ? '#475569' : '#94a3b8',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            border: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b'
          }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Dữ liệu Postgres DB Sản Xuất (385 Báo Cáo Ads)</span>
          </div>

          <div style={{
            fontSize: '0.75rem',
            padding: '4px 10px',
            borderRadius: '20px',
            background: activeTab === 'proposal' ? '#ffffff' : '#131d2e',
            color: activeTab === 'proposal' ? '#1e293b' : '#cbd5e1',
            fontWeight: 600,
            border: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b'
          }}>
            CPL TB: <strong style={{ color: activeTab === 'proposal' ? '#0284c7' : '#38bdf8' }}>160.876 đ</strong>
          </div>
        </div>
      </div>

      {/* ── TIÊU ĐỀ TRANG & TỔNG QUAN ── */}
      <div style={{ padding: '24px 28px 12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: '0 0 6px',
              color: activeTab === 'proposal' ? '#0f172a' : '#f8fafc',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>Kế Hoạch Thị Trường & Dự Toán Ads BU1</span>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#0284c7',
                background: '#e0f2fe',
                padding: '2px 10px',
                borderRadius: '12px'
              }}>
                Tour Trung Quốc • FIT Tour
              </span>
            </h1>
            <p style={{
              margin: 0,
              color: activeTab === 'proposal' ? '#64748b' : '#94a3b8',
              fontSize: '0.88rem',
              maxWidth: '850px',
              lineHeight: 1.5
            }}>
              Bảng kế hoạch phân bổ ngân sách 120 triệu Quý 4/2026 cho BU1 (Trung Quốc) dựa trên <strong>100% dữ liệu thực tế trích xuất từ database ERP</strong> (385 báo cáo chiến dịch, 318.051.729 đ chi tiêu, 6.257 inbox, 1.977 lead có SĐT). Tách riêng từng tuyến trọng điểm: Giang Nam, Bắc Kinh, Á Đinh, Tân Cương, Thanh Tạng, Lệ Giang, Cáp Nhĩ Tân.
            </p>
          </div>
        </div>
      </div>

      {/* ── THANH CHỌN TABS CÁC TUYẾN ── */}
      <div style={{
        padding: '0 28px',
        margin: '12px 0 20px',
        display: 'flex',
        gap: '6px',
        borderBottom: activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b',
        overflowX: 'auto',
        paddingBottom: '10px'
      }}>
        {[
          { id: 'proposal', label: '0. Bảng Đề Xuất & Timeline Q4 (120 Tr)', color: '#0284c7' },
          { id: 'giangnam', label: '1. Giang Nam (5N5Đ)', color: '#0284c7' },
          { id: 'backinh', label: '2. Bắc Kinh (5N4Đ)', color: '#dc2626' },
          { id: 'adinh', label: '3. Đạo Thành Á Đinh (8N7Đ)', color: '#10b981' },
          { id: 'tancuong', label: '4. Tân Cương (8N7Đ)', color: '#f59e0b' },
          { id: 'thanhtang', label: '5. Thanh Tạng (10N9Đ)', color: '#8b5cf6' },
          { id: 'legian', label: '6. Lệ Giang - Shangrila (6N5Đ)', color: '#ea580c' },
          { id: 'capnhitan', label: '7. Cáp Nhĩ Tân (Series Đông)', color: '#06b6d4' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            style={{
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.84rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              border: activeTab === tab.id ? '1px solid #0284c7' : (activeTab === 'proposal' ? '1px solid #e2e8f0' : '1px solid #1e293b'),
              background: activeTab === tab.id ? '#0284c7' : (activeTab === 'proposal' ? '#ffffff' : '#131d2e'),
              color: activeTab === tab.id ? '#ffffff' : (activeTab === 'proposal' ? '#475569' : '#94a3b8'),
              fontWeight: activeTab === tab.id ? 600 : 400,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(2, 132, 199, 0.25)' : 'none'
            }}
          >
            <span>{tab.label} {activeTab === tab.id && '(Đang xem)'}</span>
          </button>
        ))}
      </div>

      {/* ── NỘI DUNG TỪNG TAB ── */}
      <div style={{ padding: '0 28px' }}>
        
        {/* ══════════════════════════════════════════════════════════════════
            TAB 0: BẢNG ĐỀ XUẤT & TIMELINE QUÝ 4 (120 TRIỆU) - LIGHT THEME
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'proposal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* 1. Top Summary Cards (Tổng quan gọn gàng) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
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
                  120.000.000 đ
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Gói ngân sách marketing Q4 BU1 (40 triệu / tháng)
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
                  790 - 825 Lead SĐT
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Thu về từ khoảng <strong>~2.500 - 2.650 Tin nhắn Inbox</strong> (Số thực tế DB)
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
                  155 - 168 Pax <span style={{ fontSize: '1rem', fontWeight: 500, color: '#64748b' }}>(Tổng: 190 - 205 Pax)</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  <strong>155 - 168 Pax từ Ads</strong> + 36 Pax kênh ngoài Ads (Lấp đầy 12-14 đoàn)
                </div>
              </div>

              {/* Doanh thu dự kiến */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 18px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
                <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, letterSpacing: '0.04em', marginBottom: '4px' }}>
                  Doanh Thu Dự Kiến
                </div>
                <div style={{ fontSize: '1.65rem', fontWeight: 700, color: '#16a34a', letterSpacing: '-0.02em', marginBottom: '2px' }}>
                  6.320.000.000 đ
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Chi phí Ads / Doanh thu: <strong style={{ color: '#16a34a' }}>1.90%</strong> (Biên an toàn rất cao)
                </div>
              </div>
            </div>

            {/* 2. TABLE ĐỀ XUẤT ĐƠN GIẢN (CÁC CỘT ĐỀU CANH TRÁI THEO ĐÚNG YÊU CẦU) */}
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
                    Bảng Phân Bổ Ngân Sách Quý 4 Theo Tuyến (BU1 - Trung Quốc)
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Bảng tính chuẩn: Tuyến • Budget • Lead dự kiến • Pax dự kiến • Kế hoạch & chi tiết tính toán (Tất cả cột canh trái).
                  </p>
                </div>
                <span style={{ fontSize: '0.82rem', background: '#f8fafc', padding: '5px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', color: '#334155', fontWeight: 600 }}>
                  Tổng Budget: <strong style={{ color: '#0284c7' }}>120.000.000 đ</strong>
                </span>
              </div>

              {/* Bảng Table đơn giản */}
              <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <table style={{ width: '100%', minWidth: '820px', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                        Tuyến
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                        Budget
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                        Lead Dự Kiến
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                        Pax Dự Kiến
                      </th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', color: '#334155', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase' }}>
                        Kế Hoạch & Chi Tiết Tính Toán
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 1. Giang Nam */}
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <strong>Giang Nam</strong> (5N5Đ)
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0284c7', fontSize: '0.96rem', whiteSpace: 'nowrap' }}>
                        30.000.000 đ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        <div>150 - 156 Lead</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~372 Inbox (Rate 41.9%)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.96rem' }}>31 - 35 Pax (từ Ads)</div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+7 ngoài = 38 - 42 Pax (2 đoàn 16 pax)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        • Tuyến phễu chủ lực mùa thu/đông (Ô Trấn, Hàng Châu, Tô Châu, Thượng Hải). Giá tour: <strong>27.990.000 đ</strong>.<br />
                        • CPL thực tế TB: <strong>192.528 đ/lead</strong> (tỷ lệ để lại SĐT cực cao 41.94%).<br />
                        • CR Sale 20%, hệ số 1.05 → Mang về 33 khách từ Ads. Thêm khách quen & kênh ngoài đạt full 2 đoàn.
                      </td>
                    </tr>

                    {/* 2. Bắc Kinh */}
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <strong>Bắc Kinh</strong> (5N4Đ)
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#dc2626', fontSize: '0.96rem', whiteSpace: 'nowrap' }}>
                        25.000.000 đ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        <div>165 - 170 Lead</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~517 Inbox (Rate 32.5%)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#dc2626', fontSize: '0.96rem' }}>32 - 36 Pax (từ Ads)</div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+6 ngoài = 38 - 42 Pax (2 đoàn 14 pax)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        • Tuyến văn hóa di sản truyền thống: Cố Cung, Vạn Lý Trường Thành, Di Hòa Viên. Giá tour: <strong>33.990.000 đ</strong>.<br />
                        • CPL thực tế TB: <strong>148.563 đ/lead</strong> (31 báo cáo thực tế). Khách gia đình và trung niên chốt rất dứt khoát.<br />
                        • CR Sale 19% → 34 khách từ Ads, lấp đầy 2 đoàn khởi hành lá vàng & tuyết đầu mùa.
                      </td>
                    </tr>

                    {/* 3. Lệ Giang - Shangrila */}
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <strong>Lệ Giang - Shangrila</strong> (6N5Đ)
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#ea580c', fontSize: '0.96rem', whiteSpace: 'nowrap' }}>
                        20.000.000 đ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        <div>150 - 157 Lead</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~397 Inbox (Rate 39.5%)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#ea580c', fontSize: '0.96rem' }}>29 - 33 Pax (từ Ads)</div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+5 ngoài = 34 - 38 Pax (2 đoàn 16 pax)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        • Cung đường Đại Lý - Lệ Giang - Shangri-La cảnh sắc huyền ảo. Giá tour: <strong>27.990.000 đ</strong>.<br />
                        • CPL thực tế TB rẻ nhất phân khúc: <strong>127.295 đ/lead</strong> (Tỷ lệ để lại SĐT cao 39.53%).<br />
                        • Tệp cặp đôi, bạn bè, check-in giới trẻ rất mạnh trong mùa thu đông.
                      </td>
                    </tr>

                    {/* 4. Cáp Nhĩ Tân Mùa Đông */}
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <strong>Cáp Nhĩ Tân</strong> (Series Đông)
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#06b6d4', fontSize: '0.96rem', whiteSpace: 'nowrap' }}>
                        15.000.000 đ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        <div>140 - 147 Lead</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~648 Inbox (Rate 22.7%)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#06b6d4', fontSize: '0.96rem' }}>26 - 29 Pax (từ Ads)</div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+5 ngoài = 31 - 34 Pax (2 đoàn 16 pax)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        • Tuyến hot trend đỉnh cao mùa đông (Thế giới Băng Tuyết & Làng Tuyết Hương). Giá tour: <strong>51.990.000 đ</strong>.<br />
                        • Test mở bán thực tế T9: CPL đạt <strong>102.122 đ/lead</strong> cực tốt. Khách sẵn sàng cọc sớm từ T10.<br />
                        • Doanh thu dự kiến khủng: <strong>1.71 tỷ VNĐ</strong>, chi phí Ads chỉ chiếm <strong>0.87%</strong> doanh thu!
                      </td>
                    </tr>

                    {/* 5. Đạo Thành Á Đinh */}
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <strong>Đạo Thành Á Đinh</strong> (8N7Đ)
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#10b981', fontSize: '0.96rem', whiteSpace: 'nowrap' }}>
                        12.000.000 đ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        <div>85 - 88 Lead</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~305 Inbox (Rate 28.8%)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#10b981', fontSize: '0.96rem' }}>16 - 18 Pax (từ Ads)</div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+5 ngoài = 21 - 23 Pax (1 đoàn 15 pax)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        • Cung đường "Mặt Trời Cuối Cùng Của Trái Đất" - Thành Đô / Khang Định / Á Đinh. Giá tour: <strong>41.900.000 đ</strong>.<br />
                        • CPL thực tế TB: <strong>136.081 đ/lead</strong> (79 báo cáo thực tế). Vét nốt khách ngắm thu vàng tháng 10.<br />
                        • Sau tháng 10 bước vào mùa đông tuyết rơi, tạm đóng và giữ nhịp phễu cho mùa xuân.
                      </td>
                    </tr>

                    {/* 6. Tân Cương */}
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <strong>Tân Cương</strong> (8N7Đ)
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#f59e0b', fontSize: '0.96rem', whiteSpace: 'nowrap' }}>
                        10.000.000 đ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        <div>50 - 52 Lead</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~168 Inbox (Rate 30.9%)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.96rem' }}>10 - 12 Pax (từ Ads)</div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+4 ngoài = 14 - 16 Pax (1 đoàn 10 pax)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        • Tour hành trình cao cấp (Road Trip Kanas - Kashgar). Giá tour: <strong>67.990.000 đ</strong>.<br />
                        • CPL thực tế TB: <strong>193.796 đ/lead</strong>. Chạy chiến dịch Nam Tân Cương lá vàng mùa thu & tết.<br />
                        • Giá trị tour rất lớn, mang về hơn 1 tỷ doanh thu chỉ với 10 triệu Ads.
                      </td>
                    </tr>

                    {/* 7. Chuyến Tàu Thanh Tạng */}
                    <tr style={{ borderBottom: '2px solid #cbd5e1' }}>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap' }}>
                        <strong>Chuyến Tàu Thanh Tạng</strong> (10N9Đ)
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 700, color: '#8b5cf6', fontSize: '0.96rem', whiteSpace: 'nowrap' }}>
                        8.000.000 đ
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#0f172a' }}>
                        <div>50 - 54 Lead</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>~220 Inbox (Rate 24.6%)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left' }}>
                        <div style={{ fontWeight: 700, color: '#8b5cf6', fontSize: '0.96rem' }}>8 - 10 Pax (từ Ads)</div>
                        <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 600 }}>+3 ngoài = 11 - 13 Pax (1 đoàn 10 pax)</div>
                      </td>
                      <td style={{ padding: '14px 16px', textAlign: 'left', color: '#475569', fontSize: '0.82rem', lineHeight: '1.5' }}>
                        • Tuyến đường sắt cao nhất thế giới (Tây Ninh - Lhasa - Shigatse). Giá tour: <strong>68.990.000 đ</strong>.<br />
                        • CPL thực tế TB: <strong>149.358 đ/lead</strong> (66 báo cáo thực tế).<br />
                        • Sản phẩm độc bản, khách hàng trung thành và độ tuổi 35 - 55 tuổi có khả năng chi trả cao.
                      </td>
                    </tr>

                    {/* HÀNG TỔNG CỘNG */}
                    <tr style={{ background: '#f8fafc', fontWeight: 700 }}>
                      <td style={{ padding: '16px', textAlign: 'left', fontSize: '1rem', color: '#0f172a' }}>
                        <strong>TỔNG CỘNG BU1</strong>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'left', fontSize: '1.15rem', color: '#0284c7' }}>
                        120.000.000 đ
                      </td>
                      <td style={{ padding: '16px', textAlign: 'left', fontSize: '1rem', color: '#0f172a' }}>
                        790 - 824 Lead SĐT
                      </td>
                      <td style={{ padding: '16px', textAlign: 'left', fontSize: '1rem' }}>
                        <span style={{ color: '#0284c7' }}>155 - 168 Pax Ads</span>
                        <div style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 600 }}>Tổng: 191 - 204 Pax</div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'left', color: '#0f172a', fontSize: '0.86rem' }}>
                        Doanh thu ước tính: <strong style={{ color: '#16a34a' }}>6.32 Tỷ VNĐ</strong> • Tỷ lệ Ads/DT: <strong style={{ color: '#0284c7' }}>1.90%</strong> • Đạt 100% mục tiêu Q4
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ghi chú nhanh dưới bảng */}
              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => handleTabChange('giangnam')}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#0284c7', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Xem Chi Tiết Giang Nam →
                  </button>
                  <button
                    onClick={() => handleTabChange('backinh')}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Xem Chi Tiết Bắc Kinh →
                  </button>
                  <button
                    onClick={() => handleTabChange('capnhitan')}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', color: '#06b6d4', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Xem Chi Tiết Cáp Nhĩ Tân →
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
                  <span>Mở Bảng Báo Cáo Marketing Ads BU1</span>
                  <ExternalLink size={13} />
                </Link>
              </div>
            </div>

            {/* 3. TIMELINE & LỘ TRÌNH CHẠY NGÂN SÁCH (GANTT CHART THEO THÁNG) */}
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
                  Phân bổ 40.000.000 đ / tháng. Tháng 10 tập trung vét Á Đinh & mở sớm Cáp Nhĩ Tân. Tháng 11 bung cao điểm mùa thu đông Giang Nam - Bắc Kinh - Lệ Giang. Tháng 12 về đích chốt tour Giáng sinh & Tết.
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
                <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '210px repeat(3, 1fr)', gap: '10px', marginBottom: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tuyến Tour / Trọng Tâm</div>
                  <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                    THÁNG 10/2026 <span style={{ color: '#0284c7', fontWeight: 700 }}>(40.000.000 đ)</span>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Vét Á Đinh & Bung Cáp Nhĩ Tân</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                    THÁNG 11/2026 <span style={{ color: '#ea580c', fontWeight: 700 }}>(40.000.000 đ)</span>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Cao điểm Giang Nam & Bắc Kinh</div>
                  </div>
                  <div style={{ textAlign: 'center', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px', borderRadius: '4px', fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>
                    THÁNG 12/2026 <span style={{ color: '#059669', fontWeight: 700 }}>(40.000.000 đ)</span>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 400 }}>Chốt Tết & Đỉnh Cáp Nhĩ Tân</div>
                  </div>
                </div>

                {/* DÒNG 1: GIANG NAM */}
                <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '210px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0284c7' }}>1. Giang Nam (5N5Đ)</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Trọng tâm • 30.000.000 đ</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#0284c7', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mở bán mùa thu (8 Tr)</span>
                      <span>42 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#0284c7', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cao điểm chốt Đoàn 1 (12 Tr)</span>
                      <span>62 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#0284c7', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Chốt Đoàn 2 Tết (10 Tr)</span>
                      <span>52 Leads</span>
                    </div>
                  </div>
                </div>

                {/* DÒNG 2: BẮC KINH */}
                <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '210px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#dc2626' }}>2. Bắc Kinh (5N4Đ)</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Di sản • 25.000.000 đ</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#dc2626', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mở bán lá đỏ (7 Tr)</span>
                      <span>47 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#dc2626', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cao điểm Cố Cung (10 Tr)</span>
                      <span>67 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#dc2626', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Chốt khách Tết (8 Tr)</span>
                      <span>54 Leads</span>
                    </div>
                  </div>
                </div>

                {/* DÒNG 3: CÁP NHĨ TÂN */}
                <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '210px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#06b6d4' }}>3. Cáp Nhĩ Tân (Series)</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Trend Băng Tuyết • 15.000.000 đ</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#06b6d4', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mở bán sớm (6 Tr)</span>
                      <span>58 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#06b6d4', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Cao điểm Giáng sinh (5 Tr)</span>
                      <span>49 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#06b6d4', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Khóa sổ tour Tết (4 Tr)</span>
                      <span>40 Leads</span>
                    </div>
                  </div>
                </div>

                {/* DÒNG 4: LỆ GIANG */}
                <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '210px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ea580c' }}>4. Lệ Giang - Shangrila</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Cảnh sắc • 20.000.000 đ</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#ea580c', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Thu đông Sa Khê (6 Tr)</span>
                      <span>47 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#ea580c', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tuyết Ngọc Long (8 Tr)</span>
                      <span>63 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#ea580c', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Chốt suất cuối năm (6 Tr)</span>
                      <span>47 Leads</span>
                    </div>
                  </div>
                </div>

                {/* DÒNG 5: Á ĐINH */}
                <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '210px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#10b981' }}>5. Đạo Thành Á Đinh</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Vét mùa thu • 12.000.000 đ</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#10b981', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Vét nốt tháng 10 (8 Tr)</span>
                      <span>58 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#cbd5e1', color: '#475569', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tạm đóng tour (2 Tr giữ tệp)</span>
                      <span>15 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#cbd5e1', color: '#475569', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Phễu xuân 2027 (2 Tr)</span>
                      <span>15 Leads</span>
                    </div>
                  </div>
                </div>

                {/* DÒNG 6: TÂN CƯƠNG & THANH TẠNG */}
                <div style={{ minWidth: '760px', display: 'grid', gridTemplateColumns: '210px repeat(3, 1fr)', gap: '10px', alignItems: 'center', padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#f59e0b' }}>6. Tân Cương & Thanh Tạng</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tour VIP cao cấp • 18.000.000 đ</div>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#f59e0b', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Chạy phễu VIP (5 Tr)</span>
                      <span>28 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#f59e0b', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mở bán tour Tết (7 Tr)</span>
                      <span>40 Leads</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ background: '#f59e0b', color: '#ffffff', borderRadius: '4px', padding: '5px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Chốt khách VIP (6 Tr)</span>
                      <span>38 Leads</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 4. MILESTONES & ACTION ITEMS (CÁC MỐC THỜI GIAN QUAN TRỌNG) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '14px'
            }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#0284c7', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Flag size={16} />
                  <span>Tuần 1 - 2 Tháng 10: Khởi Động Chiến Dịch</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  <li>Bật chiến dịch mùa đông Cáp Nhĩ Tân (Trend tuyết rơi đang sốt).</li>
                  <li>Tập trung chốt dứt điểm các đoàn Giang Nam & Bắc Kinh khởi hành tháng 10.</li>
                  <li>Khóa sổ nhận khách tour Đạo Thành Á Đinh mùa thu.</li>
                </ul>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#ea580c', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Sparkles size={16} />
                  <span>Tháng 11: Cao Điểm Bung Ngân Sách</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  <li>Bung ngân sách mạnh cho Giang Nam (Ô Trấn) và Bắc Kinh (Cố Cung lá vàng).</li>
                  <li>Chốt full 100% chỗ cho các đoàn Lệ Giang - Shangri-La ngắm tuyết Ngọc Long.</li>
                  <li>Nhận cọc đợt 1 cho các đoàn Cáp Nhĩ Tân khởi hành Giáng Sinh & Tết Dương Lịch.</li>
                </ul>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#16a34a', fontWeight: 700, fontSize: '0.9rem' }}>
                  <CheckCircle2 size={16} />
                  <span>Tháng 12: Về Đích & Khóa Sổ Tết</span>
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#475569', lineHeight: 1.5 }}>
                  <li>Khóa sổ vé máy bay và visa đoàn cho toàn bộ tour Tết Dương Lịch.</li>
                  <li>Đẩy mạnh chốt các suất cuối cùng của tour Tết Âm Lịch (Giang Nam, Cáp Nhĩ Tân).</li>
                  <li>Tổng kết chiến dịch Quý 4, chuẩn bị ngân sách phễu hoa anh đào xuân 2027.</li>
                </ul>
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 1: GIANG NAM (5N5Đ - Ô TRẤN / HÀNG CHÂU / THƯỢNG HẢI)
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'giangnam' && (
          <RouteDetailSection
            routeName="Giang Nam (5N5Đ)"
            historicalData={GIANGNAM_HISTORICAL_DATA}
            budgetCap={gnBudgetCap}
            setBudgetCap={setGnBudgetCap}
            cplTarget={gnCplTarget}
            setCplTarget={setGnCplTarget}
            cr={gnCr}
            setCr={setGnCr}
            paxPerLead={gnPaxPerLead}
            setPaxPerLead={setGnPaxPerLead}
            numGroups={gnNumGroups}
            setNumGroups={setGnNumGroups}
            paxPerGroup={gnPaxPerGroup}
            setPaxPerGroup={setGnPaxPerGroup}
            price={gnPrice}
            setPrice={setGnPrice}
            cost={gnCost}
            setCost={setGnCost}
            reverseCalc={gnRev}
            forwardCalc={gnFwd}
            externalPax={7}
            quickBudgets={[
              { label: '10 Tr (1 Tháng)', val: 10000000 },
              { label: '20 Tr (2 Tháng)', val: 20000000 },
              { label: '30 Tr (Quý 4 Đề Xuất)', val: 30000000 },
              { label: '40 Tr (Mở Rộng)', val: 40000000 }
            ]}
            highlights={[
              'Ô Trấn (Wuzhen) - Đệ nhất cổ trấn sông nước nghìn năm tuổi, trải nghiệm ngủ đêm trong trấn cổ.',
              'Hàng Châu - Du thuyền thưởng ngoạn Tây Hồ, thăm đồn điền trà Long Tỉnh trứ danh.',
              'Thượng Hải - Bến Thượng Hải hoa lệ, Tháp truyền hình Đông Phương Minh Châu, Phố Nam Kinh.',
              'Tô Châu - Hàn Sơn Tự, Sư Tử Lâm - Di sản hoa viên cổ kính bậc nhất Trung Hoa.',
              'Cam kết NO SHOPPING, dịch vụ khách sạn 4 sao tiêu chuẩn quốc tế, bay Vietnam Airlines / China Eastern.'
            ]}
            targetCustomers="Gia đình đa thế hệ, nhóm bạn gái chuộng chụp ảnh cổ phục Cổ trấn, khách trung niên yêu thích văn thơ và cảnh sắc lãng mạn Giang Nam mùa thu."
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 2: BẮC KINH (5N4Đ - CỐ CUNG / VẠN LÝ TRƯỜNG THÀNH)
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'backinh' && (
          <RouteDetailSection
            routeName="Bắc Kinh (5N4Đ)"
            historicalData={BACKINH_HISTORICAL_DATA}
            budgetCap={bkBudgetCap}
            setBudgetCap={setBkBudgetCap}
            cplTarget={bkCplTarget}
            setCplTarget={setBkCplTarget}
            cr={bkCr}
            setCr={setBkCr}
            paxPerLead={bkPaxPerLead}
            setPaxPerLead={setBkPaxPerLead}
            numGroups={bkNumGroups}
            setNumGroups={setBkNumGroups}
            paxPerGroup={bkPaxPerGroup}
            setPaxPerGroup={setBkPaxPerGroup}
            price={bkPrice}
            setPrice={setBkPrice}
            cost={bkCost}
            setCost={setBkCost}
            reverseCalc={bkRev}
            forwardCalc={bkFwd}
            externalPax={6}
            quickBudgets={[
              { label: '10 Tr (1 Tháng)', val: 10000000 },
              { label: '20 Tr (2 Tháng)', val: 20000000 },
              { label: '25 Tr (Quý 4 Đề Xuất)', val: 25000000 },
              { label: '35 Tr (Mở Rộng)', val: 35000000 }
            ]}
            highlights={[
              'Cố Cung (Tử Cấm Thành) - 9.999 gian phòng tráng lệ, biểu tượng quyền lực 24 đời hoàng đế Minh - Thanh.',
              'Vạn Lý Trường Thành (Cư Dung Quan) - Kỳ quan thế giới sừng sững giữa núi non đại ngàn.',
              'Di Hòa Viên (Cung điện mùa hè) - Hoa viên hoàng gia đỉnh cao của nghệ thuật cảnh quan kiến trúc cổ.',
              'Thưởng thức Vịt quay Bắc Kinh nguyên con chuẩn phong vị hoàng gia tại nhà hàng lừng danh.',
              'Cam kết NO SHOPPING, ở khách sạn 4 sao trung tâm, thời gian tham quan sâu, không chạy show cưỡi ngựa xem hoa.'
            ]}
            targetCustomers="Khách hàng trung niên và lớn tuổi yêu thích lịch sử, tri thức; các gia đình dẫn bố mẹ đi du lịch báo hiếu; giáo viên, cán bộ hưu trí."
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 3: ĐẠO THÀNH Á ĐINH (8N7Đ - THÀNH ĐÔ / KHANG ĐỊNH / LÝ ĐƯỜNG)
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'adinh' && (
          <RouteDetailSection
            routeName="Đạo Thành Á Đinh (8N7Đ)"
            historicalData={ADINH_HISTORICAL_DATA}
            budgetCap={adBudgetCap}
            setBudgetCap={setAdBudgetCap}
            cplTarget={adCplTarget}
            setCplTarget={setAdCplTarget}
            cr={adCr}
            setCr={setAdCr}
            paxPerLead={adPaxPerLead}
            setPaxPerLead={setAdPaxPerLead}
            numGroups={adNumGroups}
            setNumGroups={setAdNumGroups}
            paxPerGroup={adPaxPerGroup}
            setPaxPerGroup={setAdPaxPerGroup}
            price={adPrice}
            setPrice={setAdPrice}
            cost={adCost}
            setCost={setAdCost}
            reverseCalc={adRev}
            forwardCalc={adFwd}
            externalPax={5}
            quickBudgets={[
              { label: '6 Tr (Vét Thu)', val: 6000000 },
              { label: '12 Tr (Quý 4 Đề Xuất)', val: 12000000 },
              { label: '18 Tr (Mở Rộng)', val: 18000000 }
            ]}
            highlights={[
              'Hồ Sữa & Hồ Ngũ Sắc Á Đinh - Kỳ quan thiên nhiên được mệnh danh là "Vùng đất mặt trời cuối cùng của hành tinh".',
              'Tam thần sơn thiêng Liệp Mộc, Ương Mại Dũng, Tiên Nãi Nhật phủ tuyết trắng quanh năm.',
              'Vượt cung đèo Chân Trời Tây Tạng, Khang Định, Lý Đường - Quê hương của Đạt Lai Lạt Ma thứ 7.',
              'Thiết kế chuẩn thích nghi độ cao, trang bị bình oxy cá nhân, xe chuyên dụng đường đèo an toàn tuyệt đối.',
              'Cam kết NO SHOPPING, trải nghiệm văn hóa Tạng độc bản và nhiếp ảnh chuyên nghiệp.'
            ]}
            targetCustomers="Dân du lịch trải nghiệm, phượt thủ nâng cấp tour chất lượng cao, người đam mê nhiếp ảnh phong cảnh, khách từ 28 - 45 tuổi có thể lực tốt."
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 4: TÂN CƯƠNG (8N7Đ - ROAD TRIP BẮC CƯƠNG / NAM CƯƠNG)
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'tancuong' && (
          <RouteDetailSection
            routeName="Tân Cương (8N7Đ - 9N8Đ)"
            historicalData={TANCUONG_HISTORICAL_DATA}
            budgetCap={tcBudgetCap}
            setBudgetCap={setTcBudgetCap}
            cplTarget={tcCplTarget}
            setCplTarget={setTcCplTarget}
            cr={tcCr}
            setCr={setTcCr}
            paxPerLead={tcPaxPerLead}
            setPaxPerLead={setTcPaxPerLead}
            numGroups={tcNumGroups}
            setNumGroups={setTcNumGroups}
            paxPerGroup={tcPaxPerGroup}
            setPaxPerGroup={setTcPaxPerGroup}
            price={tcPrice}
            setPrice={setTcPrice}
            cost={tcCost}
            setCost={setTcCost}
            reverseCalc={tcRev}
            forwardCalc={tcFwd}
            externalPax={4}
            quickBudgets={[
              { label: '5 Tr (Test Thu)', val: 5000000 },
              { label: '10 Tr (Quý 4 Đề Xuất)', val: 10000000 },
              { label: '15 Tr (Mở Rộng)', val: 15000000 }
            ]}
            highlights={[
              'Hồ Kanas - Thụy Sĩ thu nhỏ của Châu Á với làn nước đổi màu diệu kỳ và rừng thông kim vàng rực mùa thu.',
              'Làng cổ Hemu - Ngôi làng cổ tích của người Tuva giữa thung lũng sương khói mờ ảo.',
              'Kashgar - Trái tim Con Đường Tơ Lụa nghìn năm, thánh đường Hồi giáo và chợ Bazaar sầm uất.',
              'Trải nghiệm ẩm thực cừu nướng trứ danh, bánh mì naan nóng hổi và trà thảo mộc sa mạc độc đáo.',
              'Cam kết NO SHOPPING, xe du lịch đời mới tiện nghi cho hành trình Road Trip dài, HDV bản địa am hiểu sâu sắc.'
            ]}
            targetCustomers="Khách hàng thượng lưu, doanh nhân, giới tinh hoa mê khám phá những vùng đất huyền thoại xa xôi, có ngân sách chi trả từ 60 - 80 triệu/người."
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 5: CHUYẾN TÀU THANH TẠNG (10N9Đ - TÂY NINH / LHASA / SHIGATSE)
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'thanhtang' && (
          <RouteDetailSection
            routeName="Chuyến Tàu Thanh Tạng (10N9Đ)"
            historicalData={THANHTANG_HISTORICAL_DATA}
            budgetCap={ttBudgetCap}
            setBudgetCap={setTtBudgetCap}
            cplTarget={ttCplTarget}
            setCplTarget={setTtCplTarget}
            cr={ttCr}
            setCr={setTtCr}
            paxPerLead={ttPaxPerLead}
            setPaxPerLead={setTtPaxPerLead}
            numGroups={ttNumGroups}
            setNumGroups={setTtNumGroups}
            paxPerGroup={ttPaxPerGroup}
            setPaxPerGroup={setTtPaxPerGroup}
            price={ttPrice}
            setPrice={setTtPrice}
            cost={ttCost}
            setCost={setTtCost}
            reverseCalc={ttRev}
            forwardCalc={ttFwd}
            externalPax={3}
            quickBudgets={[
              { label: '5 Tr (1 Tháng)', val: 5000000 },
              { label: '8 Tr (Quý 4 Đề Xuất)', val: 8000000 },
              { label: '12 Tr (Mở Rộng)', val: 12000000 }
            ]}
            highlights={[
              'Hành trình trên tuyến đường sắt cao nhất hành tinh (5.072m) với khoang tàu điều áp cấp oxy đặc biệt.',
              'Cung điện Potala - Biểu tượng thiêng liêng sừng sững giữa bầu trời Lhasa.',
              'Chùa Jokhang (Đại Chiêu Tự) và vòng kora linh thiêng quanh quảng trường Barkhor.',
              'Hồ Yamdrok - Viên ngọc bích màu ngọc lam giữa rặng Himalaya tuyết phủ.',
              'Cam kết NO SHOPPING, giấy phép vào Tây Tạng (Tibet Permit) trọn gói chuyên nghiệp, bác sĩ/y tế túc trực hỗ trợ.'
            ]}
            targetCustomers="Khách hàng hướng đạo Phật giáo, người tìm kiếm trải nghiệm tâm linh sâu sắc, người mê văn hóa Tây Tạng và các cung đường độc bản thế giới."
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 6: LỆ GIANG - SHANGRI-LA (6N5Đ - ĐẠI LÝ / SA KHÊ / NGỌC LONG)
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'legian' && (
          <RouteDetailSection
            routeName="Lệ Giang - Shangrila (6N5Đ)"
            historicalData={LEGIAN_HISTORICAL_DATA}
            budgetCap={lgBudgetCap}
            setBudgetCap={setLgBudgetCap}
            cplTarget={lgCplTarget}
            setCplTarget={setLgCplTarget}
            cr={lgCr}
            setCr={setLgCr}
            paxPerLead={lgPaxPerLead}
            setPaxPerLead={setLgPaxPerLead}
            numGroups={lgNumGroups}
            setNumGroups={setLgNumGroups}
            paxPerGroup={lgPaxPerGroup}
            setPaxPerGroup={setLgPaxPerGroup}
            price={lgPrice}
            setPrice={setLgPrice}
            cost={lgCost}
            setCost={setLgCost}
            reverseCalc={lgRev}
            forwardCalc={lgFwd}
            externalPax={5}
            quickBudgets={[
              { label: '10 Tr (1 Tháng)', val: 10000000 },
              { label: '20 Tr (Quý 4 Đề Xuất)', val: 20000000 },
              { label: '28 Tr (Mở Rộng)', val: 28000000 }
            ]}
            highlights={[
              'Lệ Giang Cổ Trấn - Di sản văn hóa thế giới với mạng lưới kênh rạch và cầu đá thơ mộng.',
              'Núi Tuyết Ngọc Long - Cáp treo đưa du khách lên độ cao 4.506m ngắm sông băng vĩnh cửu.',
              'Lam Nguyệt Cốc (Blue Moon Valley) - Hồ nước xanh biếc tựa chốn bồng lai tiên cảnh dưới chân núi tuyết.',
              'Shangri-La - Tu viện Songzanlin (Tiểu Potala của Vân Nam) uy nghiêm trầm mặc.',
              'Sa Khê Cổ Trấn - Trạm dừng chân nguyên sơ nhất trên Con Đường Trà Mã Cổ Đạo.',
              'Cam kết NO SHOPPING, khách sạn 4 sao phong cách Vân Nam, show diễn Ấn Tượng Lệ Giang hoành tráng.'
            ]}
            targetCustomers="Giới trẻ, cặp đôi, hội nhóm bạn bè đi du lịch chụp ảnh check-in; người yêu thích không khí cổ trấn lãng mạn và tuyết trắng mùa đông."
          />
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB 7: CÁP NHĨ TÂN (SERIES MÙA ĐÔNG BĂNG TUYẾT 2026 - LÀNG TUYẾT)
            ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'capnhitan' && (
          <RouteDetailSection
            routeName="Cáp Nhĩ Tân Mùa Đông (Series)"
            historicalData={CAPNHITAN_HISTORICAL_DATA}
            budgetCap={cnBudgetCap}
            setBudgetCap={setCnBudgetCap}
            cplTarget={cnCplTarget}
            setCplTarget={setCnCplTarget}
            cr={cnCr}
            setCr={setCnCr}
            paxPerLead={cnPaxPerLead}
            setPaxPerLead={setCnPaxPerLead}
            numGroups={cnNumGroups}
            setNumGroups={setCnNumGroups}
            paxPerGroup={cnPaxPerGroup}
            setPaxPerGroup={setCnPaxPerGroup}
            price={cnPrice}
            setPrice={setCnPrice}
            cost={cnCost}
            setCost={setCnCost}
            reverseCalc={cnRev}
            forwardCalc={cnFwd}
            externalPax={5}
            quickBudgets={[
              { label: '5 Tr (Test Sớm)', val: 5000000 },
              { label: '10 Tr (1 Tháng)', val: 10000000 },
              { label: '15 Tr (Quý 4 Đề Xuất)', val: 15000000 },
              { label: '25 Tr (Bung Đỉnh)', val: 25000000 }
            ]}
            highlights={[
              'Thế giới Băng Tuyết Cáp Nhĩ Tân (Harbin Ice and Snow World) - Lễ hội băng lớn nhất thế giới với các lâu đài băng phát sáng rực rỡ.',
              'Làng Tuyết Hương (China Snow Town) - Ngôi làng cổ tích với lớp tuyết dày mịn hình nấm bồng bềnh như truyện thần thoại.',
              'Khu trượt tuyết Yabuli Ski Resort tiêu chuẩn Olympic - Trải nghiệm trượt tuyết đẳng cấp quốc tế.',
              'Nhà thờ Saint Sophia tráng lệ mang đậm dấu ấn kiến trúc Nga sa hoàng.',
              'Cam kết NO SHOPPING, trải nghiệm xe trượt tuyết ngựa kéo, hắt nước đóng băng kỳ thú, trang bị giữ ấm chuyên dụng.'
            ]}
            targetCustomers="Khách hàng miền Nam và các gia đình muốn trải nghiệm mùa đông tuyết rơi đích thực; các bạn trẻ mê phong cách chụp ảnh mùa đông tuyết trắng; khách du lịch cao cấp săn vé Giáng sinh & Tết."
          />
        )}

      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENT DÙNG CHUNG CHO CẢ 7 TUYẾN: ROUTE DETAIL SECTION
// ══════════════════════════════════════════════════════════════════════════════
const RouteDetailSection = ({
  routeName,
  historicalData,
  budgetCap,
  setBudgetCap,
  cplTarget,
  setCplTarget,
  cr,
  setCr,
  paxPerLead,
  setPaxPerLead,
  numGroups,
  setNumGroups,
  paxPerGroup,
  setPaxPerGroup,
  price,
  setPrice,
  cost,
  setCost,
  reverseCalc,
  forwardCalc,
  externalPax,
  quickBudgets,
  highlights,
  targetCustomers
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>

      {/* ── 1. DỮ LIỆU LỊCH SỬ THỰC TẾ TỪ DATABASE ERP ── */}
      <div style={{
        background: '#131d2e',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="#10b981" />
              1. Dữ Liệu Lịch Sử Thực Tế Từ Database ({routeName})
            </h3>
            <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
              Trích xuất từ bảng marketing_ads_reports trên Postgres VPS. Dữ liệu chuẩn xác 100%, không fake.
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', background: '#0d131f', padding: '4px 10px', borderRadius: '4px', border: '1px solid #263346', color: '#94a3b8' }}>
            Tổng {historicalData.months.length} tháng ghi nhận
          </span>
        </div>

        {/* 4 Cards tổng kết số liệu */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Tổng Chi Tiêu Thực Tế</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>{formatMoney(historicalData.totalSpend)} đ</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Chiến dịch chạy Meta Ads</div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Tổng Tin Nhắn Inbox</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#f8fafc' }}>{formatMoney(historicalData.totalMessages)}</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>~{formatMoney(historicalData.cplMsgAvg)} đ / tin nhắn</div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Tổng Lead (Có SĐT)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#10b981' }}>{historicalData.totalLeads} Lead</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Tỷ lệ SĐT: <strong style={{ color: '#10b981' }}>{historicalData.inboxToLeadRate}%</strong></div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Giá TB 1 Lead (CPL)</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#38bdf8' }}>{formatMoney(historicalData.cplLeadAvg)} đ</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>Chuẩn chi phí thực tế toàn kỳ</div>
          </div>
        </div>

        {/* Bảng chi tiết từng tháng */}
        <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid #1e293b' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ background: '#0d131f', borderBottom: '1px solid #263346', color: '#94a3b8', textAlign: 'left' }}>
                <th style={{ padding: '10px 12px' }}>Thời Điểm</th>
                <th style={{ padding: '10px 12px' }}>Chi Tiêu</th>
                <th style={{ padding: '10px 12px' }}>Inbox</th>
                <th style={{ padding: '10px 12px' }}>Lead (Có SĐT)</th>
                <th style={{ padding: '10px 12px' }}>Giá 1 Inbox</th>
                <th style={{ padding: '10px 12px' }}>Giá 1 Lead (CPL)</th>
                <th style={{ padding: '10px 12px' }}>Ghi Chú Vận Hành Thực Tế</th>
              </tr>
            </thead>
            <tbody>
              {historicalData.months.map((m, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>{m.month}</td>
                  <td style={{ padding: '10px 12px', color: '#e2e8f0' }}>{formatMoney(m.spend)} đ</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{m.messages}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#f8fafc' }}>{m.leads}</td>
                  <td style={{ padding: '10px 12px', color: '#94a3b8' }}>{formatMoney(m.cplMsg)} đ</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#38bdf8' }}>{formatMoney(m.cplLead)} đ</td>
                  <td style={{ padding: '10px 12px', color: '#64748b' }}>{m.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 2. CÁCH 2: DỰ TRÙ CHO MARKETING (TÍNH NGƯỢC: CẤP NGÂN SÁCH → RA LEAD & KHÁCH) ── */}
      <div style={{
        background: '#131d2e',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#38bdf8', border: '1px solid #1e293b' }}>
              <Sparkles size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                2. Dự Trù Cho Marketing (Cách 2: Cấp Ngân Sách → Ra Số Lead SĐT & Khách Chốt)
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                Góc nhìn Marketer: Giả định được cấp ngân sách X triệu → Tính ra số Lead có SĐT mang về và số Khách chốt được
              </p>
            </div>
          </div>

          {/* Quick Budget Buttons */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {quickBudgets.map(b => (
              <button
                key={b.val}
                type="button"
                onClick={() => setBudgetCap(b.val)}
                style={{
                  background: budgetCap === b.val ? '#1e293b' : '#0d131f',
                  border: '1px solid ' + (budgetCap === b.val ? '#38bdf8' : '#263346'),
                  color: budgetCap === b.val ? '#38bdf8' : '#cbd5e1',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: budgetCap === b.val ? 600 : 400
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Khung nhập tham số tính ngược */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
              value={budgetCap}
              onChange={(val) => setBudgetCap(val)}
              unit="đ"
            />
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
              Tự do nhập số tiền bất kỳ
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
              Lịch sử chuẩn DB: <strong>{formatMoney(historicalData.cplLeadAvg)} đ</strong>
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
                  max="40"
                  value={cr}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) setCr(Math.min(40, Math.max(0.1, val)));
                  }}
                  style={{
                    width: '52px',
                    background: '#0d131f',
                    border: '1px solid #263346',
                    borderRadius: '4px',
                    color: '#f8fafc',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    padding: '2px 4px',
                    textAlign: 'center',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>%</span>
              </div>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="0.5"
              value={cr}
              onChange={(e) => setCr(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
              <span>Thận trọng (10%)</span>
              <span style={{ color: '#38bdf8', fontWeight: 600 }}>Thực tế FIT ({cr}%)</span>
              <span>Kỳ vọng (25%)</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
              <span>Hệ số khách / 1 Lead:</span>
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>{paxPerLead} người</span>
            </div>
            <input
              type="range"
              min="1"
              max="2.5"
              step="0.05"
              value={paxPerLead}
              onChange={(e) => setPaxPerLead(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: '#64748b', marginTop: '2px' }}>
              <span>Đi 1 mình (1.0)</span>
              <span>Cặp đôi / Nhóm (1.5 - 2.0)</span>
            </div>
          </div>
        </div>

        {/* 4 Cards kết quả tính ngược */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Số Lead SĐT Mang Về</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#38bdf8' }}>{reverseCalc.leads} Lead</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Tương đương ~<strong>{formatMoney(reverseCalc.inboxes)}</strong> tin nhắn
            </div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Số Khách Chốt (Từ Ads)</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#10b981' }}>{reverseCalc.pax} Khách</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Tỷ lệ chốt Sale {cr}% × {paxPerLead} khách/lead
            </div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Doanh Thu Mang Lại</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>{formatMoney(reverseCalc.revenue)} đ</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Giá tour: {formatMoney(price)} đ / khách
            </div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Tỷ Lệ Ads / Doanh Thu</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: reverseCalc.adsRatio <= 3 ? '#10b981' : '#f59e0b' }}>
              {reverseCalc.adsRatio}%
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Mức chuẩn ngành tour: &lt; 4%
            </div>
          </div>
        </div>

        {/* Tóm tắt kết luận quản trị */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.05)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '0.82rem',
          color: '#cbd5e1',
          lineHeight: 1.5
        }}>
          <strong>Kết luận quản trị:</strong> Khi được duyệt ngân sách <strong>{formatMoney(budgetCap)} đ</strong>, đội ngũ Marketing dự kiến mang về <strong>{reverseCalc.leads} Lead có SĐT</strong> (qua việc tiếp cận và chăm sóc ~{formatMoney(reverseCalc.inboxes)} tin nhắn). Với tỷ lệ chốt <strong>{cr}%</strong> và hệ số đi cùng <strong>{paxPerLead}</strong>, chuyển đổi thành <strong>~{reverseCalc.pax} khách tham gia tour</strong>, mang lại <strong>{formatMoney(reverseCalc.revenue)} đ Doanh Thu</strong> (Chi phí Marketing chiếm <strong>{reverseCalc.adsRatio}%</strong> doanh thu, đảm bảo tối ưu biên lợi nhuận ròng).
        </div>
      </div>

      {/* ── 3. CÁCH 1: MÁY TÍNH DỰ TOÁN NGÂN SÁCH THEO ĐOÀN (TÍNH XUÔI) ── */}
      <div style={{
        background: '#131d2e',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '22px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ background: '#0d131f', padding: '6px 8px', borderRadius: '6px', color: '#94a3b8', border: '1px solid #1e293b' }}>
              <Calculator size={18} />
            </span>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                3. Máy Tính Dự Toán Ads Theo Đoàn (Cách 1: Tính Xuôi Số Đoàn → Ngân Sách)
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '0.8rem' }}>
                Góc nhìn Điều hành: Mục tiêu đạt đủ số đoàn (ví dụ: {numGroups} đoàn × {paxPerGroup} khách) → Cần bao nhiêu Lead và Ngân sách Ads
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => { setNumGroups(2); setPaxPerGroup(16); }}
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
              Chuẩn 2 đoàn × 16 pax
            </button>
            <button
              onClick={() => { setNumGroups(3); setPaxPerGroup(16); }}
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
              Mở rộng 3 đoàn
            </button>
          </div>
        </div>

        {/* Khung nhập tham số tính xuôi */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
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
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
              Khách / 1 đoàn:
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0d131f', borderRadius: '6px', border: '1px solid #263346', padding: '0 8px' }}>
              <input
                type="number"
                min="5"
                max="50"
                value={paxPerGroup}
                onChange={(e) => setPaxPerGroup(parseInt(e.target.value, 10) || 1)}
                style={{ width: '100%', background: 'transparent', border: 'none', color: '#f8fafc', fontWeight: 600, fontSize: '0.92rem', padding: '8px 0', outline: 'none' }}
              />
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>khách</span>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
              Giá bán tour / khách:
            </label>
            <CurrencyInput
              value={price}
              onChange={(val) => setPrice(val)}
              unit="đ"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
              Giá vốn tour / khách:
            </label>
            <CurrencyInput
              value={cost}
              onChange={(val) => setCost(val)}
              unit="đ"
            />
          </div>
        </div>

        {/* Kết quả tính xuôi */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Tổng Mục Tiêu Khách</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f8fafc' }}>{forwardCalc.targetPaxTotal} Khách</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              {forwardCalc.paxNeededFromAds} từ Ads + {externalPax} kênh ngoài
            </div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Lead SĐT Cần Có</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#38bdf8' }}>{forwardCalc.leadsNeeded} Lead</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Tỷ lệ chốt {cr}% × {paxPerLead} pax/lead
            </div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Ngân Sách Ads Cần Cấp</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#f59e0b' }}>{formatMoney(forwardCalc.adsBudgetNeeded)} đ</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Dựa trên CPL {formatMoney(cplTarget)} đ
            </div>
          </div>

          <div style={{ background: '#0d131f', padding: '14px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>Lợi Nhuận Gộp Tạm Tính</div>
            <div style={{ fontSize: '1.45rem', fontWeight: 700, color: '#10b981' }}>{formatMoney(forwardCalc.grossProfit)} đ</div>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
              Hòa vốn khi đạt: <strong>{forwardCalc.breakEvenPax} khách</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. CHIẾN LƯỢC SẢN PHẨM & THỊ TRƯỜNG TUYẾN ── */}
      <div style={{
        background: '#131d2e',
        border: '1px solid #1e293b',
        borderRadius: '8px',
        padding: '22px'
      }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="#0284c7" />
          4. Chiến Lược Sản Phẩm & Định Vị Khách Hàng ({routeName})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* USP & Điểm khác biệt */}
          <div style={{ background: '#0d131f', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} />
              <span>Điểm Khác Biệt & USP Cạnh Tranh</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              {highlights.map((h, i) => (
                <li key={i} style={{ marginBottom: '6px' }}>{h}</li>
              ))}
            </ul>
          </div>

          {/* Chân dung khách hàng & Thông điệp Ads */}
          <div style={{ background: '#0d131f', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Users size={15} />
              <span>Chân Dung Khách Hàng Mục Tiêu</span>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              {targetCustomers}
            </p>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MessageSquare size={15} />
              <span>Thông Điệp Content Meta Ads Chủ Lực</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1', background: '#131d2e', padding: '10px 12px', borderRadius: '6px', border: '1px solid #263346', lineHeight: 1.5 }}>
              "Hành trình không ghé điểm mua sắm bắt buộc (No Shopping), tối đa hóa thời gian trải nghiệm văn hóa và cảnh sắc thiên nhiên nguyên bản cùng FIT Tour."
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BU1MarketPlanningPage;
