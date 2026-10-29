import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import {
  Calendar, Layers, Target, DollarSign, TrendingUp, Users, Plus, Edit2,
  Trash2, Save, Send, CheckCircle2, AlertTriangle, ShieldAlert, Download,
  Printer, RefreshCw, Search, Filter, X, ChevronRight, ArrowRight,
  Clock, Check, Sparkles, Building2, MapPin, Eye, FileText, ChevronLeft,
  Sliders, History, Lock, Unlock, HelpCircle, AlertCircle, Home,
  Award, Trophy, Gamepad2, CheckCircle, Zap, Play
} from 'lucide-react';

// Format currency standard
const fmt = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const fmtVND = (val) => `${fmt(val)} ₫`;

const BU_LIST = [
  { id: 'BU1', name: 'BU1', desc: 'Thị trường Trung Quốc', color: '#ef4444' },
  { id: 'BU2', name: 'BU2', desc: 'Đài Loan • Nhật Bản • Hàn Quốc', color: '#3b82f6' },
  { id: 'BU3', name: 'BU3', desc: 'B2B MICE • Doanh nghiệp', color: '#8b5cf6' },
  { id: 'BU4', name: 'BU4', desc: 'Himalayas (Bhutan • Ladakh • Sri Lanka)', color: '#f59e0b' },
  { id: 'BU5', name: 'BU5', desc: 'Tây Á • Trung Á • Khám phá độc bản', color: '#10b981' },
];

const STAGES = [
  { id: 1, title: '1. Mục Tiêu Kinh Doanh BU', short: 'Mục Tiêu', icon: Sliders },
  { id: 2, title: '2. Danh Mục Sản Phẩm', short: 'Sản Phẩm', icon: Layers },
  { id: 3, title: '3. Lịch Đoàn Khởi Hành', short: 'Lịch Đoàn', icon: Calendar },
  { id: 4, title: '4. Ma Trận 12T (MKT Khai Thác)', short: 'Ma Trận 12T', icon: TrendingUp },
  { id: 5, title: '5. Đối Soát & Phê Duyệt', short: 'Đối Soát & Duyệt', icon: CheckCircle2 },
];

// Hệ thống nhiệm vụ Game Hướng Dẫn Từng Bước (Gamified Guided Tour)
const QUEST_STAGES = [
  {
    id: 1,
    levelName: "Level 1: Thiết Lập & Mục Tiêu Kinh Doanh",
    shortName: "Chặng 1: Mục Tiêu BU",
    badge: "🎯 KIM CHỈ NAM",
    title: "Thiết Lập Mục Tiêu Kinh Doanh Toàn Năm Của BU",
    mission: "Xác lập chỉ tiêu cốt lõi của BU: Doanh thu, Số đoàn, Số khách và Lãi gộp. Đây là cơ sở định hình kế hoạch sản phẩm để Team Marketing xem và khai thác.",
    stepDetails: [
      {
        step: "Bước 1: Điền Doanh Thu (Target Revenue)",
        ghiGi: "Nhập tổng doanh số bán tour BU cam kết đạt trong năm (VD: 15.000.000.000 ₫).",
        tacDung: "Định hình quy mô đơn vị; hệ thống tự trích 1% làm hạn mức cho Team Marketing khai thác và làm chuẩn đối soát tại Chặng 5."
      },
      {
        step: "Bước 2: Điền Số Đoàn (Target Groups)",
        ghiGi: "Nhập tổng số đoàn tour dự kiến tổ chức thành công trong năm (VD: 15 đoàn).",
        tacDung: "Căn cứ để phân bổ lịch khởi hành (Chặng 3) và ma trận 12 tháng (Chặng 4), đảm bảo không mở thừa hoặc thiếu lịch."
      },
      {
        step: "Bước 3: Điền Số Khách (Target Pax)",
        ghiGi: "Nhập tổng số lượng khách mục tiêu phục vụ toàn năm (VD: 150 khách).",
        tacDung: "Hệ thống tự tính sĩ số trung bình mỗi đoàn (~10 pax/đoàn) để kiểm tra tính khả thi về năng lực phục vụ."
      }
    ],
    checklist: [
      "Bước 1: Điền Mục tiêu Doanh thu toàn năm (tự trích 1% ngân sách Marketing)",
      "Bước 2: Điền Mục tiêu Số đoàn khởi hành trong năm",
      "Bước 3: Điền Mục tiêu Số khách (pax) và xem sĩ số trung bình mỗi đoàn",
      "Kiểm tra Lãi gộp & Biên lãi kỳ vọng",
      "Bấm nút 'Xong Bước 1 ➔ Sang Bước 2' hoặc 'Lưu Thiết Lập'"
    ],
    hint: "Số liệu mục tiêu ở 3 bước này là kim chỉ nam để giỏ sản phẩm (Chặng 2) và ma trận lịch đoàn (Chặng 4) bám sát.",
    nextActionLabel: "Lưu & Sang Chặng 2: Giỏ Sản Phẩm ➔",
    targetStage: 2
  },
  {
    id: 2,
    levelName: "Level 2: Giỏ Sản Phẩm & Định Giá",
    shortName: "Chặng 2: Sản Phẩm",
    badge: "⚔️ VŨ KHÍ CỐT LÕI",
    title: "Xây Dựng Giỏ Sản Phẩm Tour & Định Giá (Unit Economics)",
    mission: "Khai báo danh mục tour của BU, chia nhóm trụ cột/khám phá, gõ Giá bán và Biến phí để hệ thống tự tính Lãi gộp & Điểm hòa vốn.",
    checklist: [
      "Gõ trực tiếp vào ô bảng tính hoặc bấm '⚡ Nạp Mẫu BU5' / '📋 Dán từ Sheets'",
      "Chọn Nhóm sản phẩm (Trụ cột / Độc bản / Tiềm năng) & Mức ưu tiên",
      "Nhập Giá bán (₫) & Biến phí trực tiếp (₫) cho từng pax",
      "Kiểm tra cột Lãi gộp ⚡ và Điểm hòa vốn ⚡ tự động tính chuẩn xác"
    ],
    hint: "Dùng phím Tab để nhảy ô nhanh như Excel, Enter để xuống dòng!",
    nextActionLabel: "Lưu Bảng Tính & Sang Chặng 3: Lịch Đoàn ➔",
    targetStage: 3
  },
  {
    id: 3,
    levelName: "Level 3: Lịch Đoàn Khởi Hành",
    shortName: "Chặng 3: Lịch Đoàn",
    badge: "📅 PHÂN BỔ LỊCH",
    title: "Lập Lịch Khởi Hành Cho Các Tuyến Tour",
    mission: "Khai báo các đợt khởi hành cụ thể cho từng sản phẩm. Đây là lịch trình trọng tâm để Marketing nắm bắt thời điểm tung chiến dịch.",
    checklist: [
      "Bấm 'Thêm Đợt Khởi Hành' cho từng tuyến tour",
      "Chọn Ngày khởi hành, Thời gian đi (ngày/đêm), Số chỗ mục tiêu",
      "Đặt Hạn chốt nhận khách (Closing date) để kịp làm Visa & Vé máy bay",
      "Kiểm tra bảng tổng hợp số đoàn toàn năm"
    ],
    hint: "Nên mở lịch sớm trước 3-6 tháng để Marketing có đủ thời gian chạy quảng cáo thu hút khách.",
    nextActionLabel: "Tiếp Tục: Sang Chặng 4: Ma Trận 12 Tháng ➔",
    targetStage: 4
  },
  {
    id: 4,
    levelName: "Level 4: Ma Trận 12 Tháng (Cơ Sở MKT Khai Thác)",
    shortName: "Chặng 4: Ma Trận 12T",
    badge: "📊 CƠ SỞ KHAI THÁC",
    title: "Ma Trận Khởi Hành 12 Tháng (Cơ Sở Để Team MKT Khai Thác)",
    mission: "Gõ số đoàn dự kiến vào lưới 12 tháng (T1 đến T12). Doanh thu, số khách và dòng tiền sẽ tự nhảy số. Team Marketing sẽ theo dõi bảng này để lên lịch trình khai thác khách hàng.",
    checklist: [
      "Gõ trực tiếp số đoàn vào các ô tháng T1...T12 trong bảng ma trận",
      "Quan sát dòng Tổng doanh thu và Lãi gộp từng tháng tự động tính",
      "Kiểm tra hạn mức ngân sách Marketing 1% tự động trích theo doanh thu",
      "Cân đối dòng tiền và tính khả thi giữa các tháng"
    ],
    hint: "Gõ 0 hoặc để trống vào tháng thấp điểm để dồn lực đoàn vào tháng vàng.",
    nextActionLabel: "Tiếp Tục: Sang Chặng 5: Kiểm Tra & Duyệt ➔",
    targetStage: 5
  },
  {
    id: 5,
    levelName: "Level 5: Đối Soát Kế Hoạch & Phê Duyệt BOD",
    shortName: "Chặng 5: Đối Soát & Duyệt",
    badge: "🏆 VỀ ĐÍCH",
    title: "Đối Soát Kế Hoạch Với Mục Tiêu Ban Đầu & Gửi Phê Duyệt BOD",
    mission: "So sánh tổng kế hoạch sản phẩm lập được với Chỉ tiêu kinh doanh đặt ra ở Bước 1. Rà soát danh sách công việc và gửi trình duyệt Ban Giám Đốc.",
    checklist: [
      "Đối soát Doanh thu, Số đoàn, Số khách và Lãi gộp sản phẩm vs Mục tiêu Bước 1",
      "Rà soát Danh sách công việc triển khai (Action Items Checklist)",
      "Bấm nút 'Gửi Duyệt BOD' màu xanh trên thanh tiêu đề",
      "Nhận huy hiệu Hoàn Thành Bản Kế Hoạch BU!"
    ],
    hint: "Khi BOD duyệt v1.0, kế hoạch sẽ được công bố để Marketing và Vận hành chính thức chạy chiến dịch.",
    nextActionLabel: "🚀 Gửi Duyệt BOD Ngay!",
    targetStage: null
  }
];

// Âm thanh chúc mừng Web Audio API chuẩn (Chime 3 nốt không cần file ngoài)
const playLevelUpSound = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(659.25, now + 0.12); // E5
    osc.frequency.setValueAtTime(783.99, now + 0.24); // G5
    
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    
    osc.start(now);
    osc.stop(now + 0.55);
  } catch (e) {
    // Không làm gián đoạn nếu trình duyệt chặn audio
  }
};

export default function BUPlanningStudioTab({ currentUser, addToast, bus = [], standalone = false }) {
  // Determine user permissions
  const userRole = (currentUser?.role || currentUser?.role_name || '').toLowerCase();
  const isAdminOrBOD = ['admin', 'ceo', 'bod', 'director', 'superadmin'].includes(userRole) || Boolean(currentUser?.is_admin);

  // Focus mode (Fullscreen Standalone Page without sidebar) - MẶC ĐỊNH LÀ TRANG TRẮNG TOÀN MÀN HÌNH
  const [isFocusMode, setIsFocusMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('fullscreen') === 'false' || p.get('sidebar') === 'true') {
        return false;
      }
    }
    return true; // Mặc định luôn là Trang Trắng Toàn Màn Hình!
  });
  const [showGuideBanner, setShowGuideBanner] = useState(true);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteRawText, setPasteRawText] = useState('');
  const [gridProducts, setGridProducts] = useState([]);
  const [isSavingGrid, setIsSavingGrid] = useState(false);
  const autoSaveTimerRef = useRef(null);

  // ── GAME QUEST GUIDED TOUR SYSTEM ──
  const [isGameMode, setIsGameMode] = useState(true);
  const [activeQuestModal, setActiveQuestModal] = useState(null); // ID của stage mở pop-up nhiệm vụ
  const [gameTourStep, setGameTourStep] = useState(1); // RPG Interactive Tour: 1: Doanh Thu, 2: Số Đoàn, 3: Số Khách, null: tắt
  const [stage2TourStep, setStage2TourStep] = useState(1); // RPG Stage 2 Tour: 1: Tên Tour, 2: Giá Bán, 3: Biến Phí & Lãi Gộp, null: tắt
  const [celebrationData, setCelebrationData] = useState(null); // Data pop-up chúc mừng khi vượt qua 1 chặng
  const [completedStages, setCompletedStages] = useState(() => [1]);

  const handleCompleteStage = (fromStage) => {
    playLevelUpSound();
    setCompletedStages(prev => Array.from(new Set([...prev, fromStage])));

    if (!isGameMode) {
      if (fromStage < 5) setActiveStage(fromStage + 1);
      return;
    }

    const curr = QUEST_STAGES.find(q => q.id === fromStage);
    const next = QUEST_STAGES.find(q => q.id === fromStage + 1);

    if (next) {
      setCelebrationData({
        fromStage,
        toStage: fromStage + 1,
        title: `🎉 XUẤT SẮC! HOÀN THÀNH ${curr?.shortName.toUpperCase()}!`,
        message: `Bạn đã xuất sắc vượt qua ${curr?.levelName}. Hãy tiến lên ${next?.levelName} để tiếp tục kế hoạch!`,
        nextLevelName: next.levelName,
        nextTitle: next.title,
        nextHint: next.hint
      });
    } else {
      setCelebrationData({
        fromStage: 5,
        toStage: null,
        title: `🏆 CHIẾN THẮNG TUYỆT ĐỐI! HOÀN THÀNH KẾ HOẠCH BU ${selectedBU}!`,
        message: `Toàn bộ 5 chặng lập kế hoạch kinh doanh và dự toán tài chính năm ${selectedYear} đã được hoàn tất thành công!`,
        nextLevelName: "HOÀN TẤT 100%",
        nextTitle: "BOD Sẽ Phê Duyệt & Ban Hành",
        nextHint: "Chúc mừng BUM đã đưa BU tiến thêm một bước tiến lớn!"
      });
    }
  };

  const handleProceedNextStage = () => {
    if (!celebrationData) return;
    const nextStage = celebrationData.toStage;
    setCelebrationData(null);
    if (nextStage) {
      setActiveStage(nextStage);
      setTimeout(() => {
        setActiveQuestModal(nextStage);
      }, 250);
    }
  };

  // Filters
  const [selectedBU, setSelectedBU] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const bu = (p.get('bu') || '').toUpperCase();
      if (['BU1', 'BU2', 'BU3', 'BU4', 'BU5'].includes(bu)) return bu;
    }
    const userBU = currentUser?.bus?.[0];
    return userBU ? String(userBU).toUpperCase() : 'BU5';
  });

  const [selectedYear, setSelectedYear] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      const y = parseInt(p.get('year'));
      if (y && [2026, 2027, 2028, 2029].includes(y)) return y;
    }
    return 2027;
  });

  const [activeStage, setActiveStage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [planDetail, setPlanDetail] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Modals & Drawers state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    product_code: '', name: '', group_type: 'Tuyến trụ cột', season: 'Tháng 11 - Tháng 4',
    priority: 'Cao', stage: 'Đang bán', person_in_charge: '', target_pax_per_group: 10,
    price_per_pax: 100000000, variable_cost_per_pax: 85000000, fixed_cost_per_group: 0,
    strategy_notes: '', color: '#0284c7'
  });

  const [showDepartureModal, setShowDepartureModal] = useState(false);
  const [editingDeparture, setEditingDeparture] = useState(null);
  const [departureForm, setDepartureForm] = useState({
    product_id: '', departure_code: '', month: 1, groups_count: 1, pax_per_group: 10,
    sales_status: 'Đang bán', person_in_charge: '', notes: ''
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    task_code: '', season_stage: '', related_products: '', category: '',
    deadline: '', completed_date: '', assignee: '', status: 'Đang chạy', obstacles_notes: ''
  });

  const [showVersionsDrawer, setShowVersionsDrawer] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [taskFilter, setTaskFilter] = useState('ALL'); // ALL, OVERDUE, RUNNING, DONE
  const [matrixCellModal, setMatrixCellModal] = useState(null); // { product, month, deps }

  // Check if current user has edit permission for this BU
  const userBUs = Array.isArray(currentUser?.bus) ? currentUser.bus.map(b => String(b).toUpperCase()) : [];
  const canEditCurrentBU = isAdminOrBOD || userBUs.length === 0 || userBUs.includes(selectedBU);
  const isPlanLocked = currentPlan && currentPlan.status === 'APPROVED' && !isAdminOrBOD;

  // Sync URL params
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    params.set('bu', selectedBU);
    params.set('year', String(selectedYear));
    const newRelativeUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newRelativeUrl);
  }, [selectedBU, selectedYear]);

  // Load plans list and detail
  const loadPlanData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/bu-planning/plans?bu_id=${selectedBU}&year=${selectedYear}`);
      if (res.data.success && res.data.data.length > 0) {
        const found = res.data.data[0];
        setCurrentPlan(found);
        // Load full detail
        const detailRes = await axios.get(`/api/bu-planning/plans/${found.id}`);
        if (detailRes.data.success) {
          const detail = detailRes.data.data;
          setPlanDetail(detail);
          setLastSaved(new Date().toLocaleTimeString('vi-VN'));

          // Sync grid products
          const prods = detail.products || [];
          if (prods.length > 0) {
            setGridProducts(prods);
          } else {
            // Provide 3 blank editable rows ready for typing immediately
            setGridProducts([
              { id: 'temp_1', product_code: `${selectedBU}-SP-01`, name: '', group_type: 'Tuyến trụ cột', priority: 'Cao', stage: 'Đang bán', season: '', person_in_charge: currentUser?.full_name || '', target_pax_per_group: 10, price_per_pax: 0, variable_cost_per_pax: 0, fixed_cost_per_group: 0, gross_profit_per_pax: 0, gross_margin_pct: 0, break_even_pax: 0 },
              { id: 'temp_2', product_code: `${selectedBU}-SP-02`, name: '', group_type: 'Khám phá độc bản', priority: 'Trung bình', stage: 'Chuẩn bị', season: '', person_in_charge: currentUser?.full_name || '', target_pax_per_group: 10, price_per_pax: 0, variable_cost_per_pax: 0, fixed_cost_per_group: 0, gross_profit_per_pax: 0, gross_margin_pct: 0, break_even_pax: 0 },
              { id: 'temp_3', product_code: `${selectedBU}-SP-03`, name: '', group_type: 'Tuyến mới / Tiềm năng', priority: 'Thấp', stage: 'Nghiên cứu', season: '', person_in_charge: currentUser?.full_name || '', target_pax_per_group: 10, price_per_pax: 0, variable_cost_per_pax: 0, fixed_cost_per_group: 0, gross_profit_per_pax: 0, gross_margin_pct: 0, break_even_pax: 0 }
            ]);
          }
        }
      } else {
        setCurrentPlan(null);
        setPlanDetail(null);
        setGridProducts([]);
      }
    } catch (err) {
      if (err.response?.status === 403) {
        // Test 12 Privacy rule: restricted from viewing
        setCurrentPlan({ status: 'HIDDEN_DRAFT', bu_id: selectedBU });
        setPlanDetail(null);
        setGridProducts([]);
      } else {
        console.error('Error loading plan:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanData();
  }, [selectedBU, selectedYear]);

  // 1. Setup Form Actions
  const handleCreatePlan = async (templateMode = 'template') => {
    if (!canEditCurrentBU) {
      Swal.fire('Truy cập bị từ chối', `Bạn không có quyền tạo kế hoạch cho đơn vị ${selectedBU}.`, 'error');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        bu_id: selectedBU,
        plan_year: selectedYear,
        title: `Kế Hoạch & Dự Toán Kinh Doanh ${selectedBU} Năm ${selectedYear}`,
        owner_name: currentUser?.full_name || `Trưởng ${selectedBU}`,
        mkt_budget_quota: 0.0100,
        mkt_budget_total: selectedBU === 'BU5' ? 316460000 : 150000000,
        notes: `Kế hoạch thương mại ${selectedBU} năm ${selectedYear} lập từ BU Planning Studio.`,
        template_mode: templateMode
      };
      const res = await axios.post('/api/bu-planning/plans', payload);
      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Khởi tạo thành công!',
          text: templateMode === 'template' 
            ? `Đã nạp sẵn bộ danh mục tour và lịch đoàn mẫu chuẩn của ${selectedBU}!` 
            : `Đã tạo kế hoạch trắng năm ${selectedYear} cho ${selectedBU}.`,
          timer: 2000,
          showConfirmButton: false
        });
        await loadPlanData();
        setActiveStage(2); // Jump to Product Catalog
      }
    } catch (err) {
      Swal.fire('Lỗi khởi tạo', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetup = async (e) => {
    if (e) e.preventDefault();
    if (!currentPlan) return;
    try {
      setLoading(true);
      const res = await axios.put(`/api/bu-planning/plans/${currentPlan.id}/setup`, {
        plan_year: selectedYear,
        title: currentPlan.title,
        owner_name: currentPlan.owner_name,
        target_revenue: Number(currentPlan.target_revenue || 0),
        target_groups: parseInt(currentPlan.target_groups || 0, 10),
        target_pax: parseInt(currentPlan.target_pax || 0, 10),
        target_gross_profit: Number(currentPlan.target_gross_profit || 0),
        target_margin_pct: Number(currentPlan.target_margin_pct || 0),
        notes: currentPlan.notes
      });
      if (res.data.success) {
        setLastSaved(new Date().toLocaleTimeString('vi-VN'));
        if (addToast) addToast('Đã lưu mục tiêu kinh doanh BU!', 'success');
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi lưu thiết lập', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlanMeta = handleUpdateSetup;

  // 2. Product Actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    const count = (planDetail?.products?.length || 0) + 1;
    setProductForm({
      product_code: `${selectedBU}-${String(count).padStart(3, '0')}`,
      name: '',
      group_type: 'Tuyến trụ cột',
      season: 'Tháng 11 - Tháng 4',
      priority: 'Cao',
      stage: 'Đang bán',
      person_in_charge: currentPlan?.owner_name || '',
      target_pax_per_group: 10,
      price_per_pax: 89000000,
      variable_cost_per_pax: 75000000,
      fixed_cost_per_group: 0,
      strategy_notes: '',
      color: '#0284c7'
    });
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      product_code: prod.product_code,
      name: prod.name,
      group_type: prod.group_type || 'Tuyến trụ cột',
      season: prod.season || '',
      priority: prod.priority || 'Cao',
      stage: prod.stage || 'Đang bán',
      person_in_charge: prod.person_in_charge || '',
      target_pax_per_group: prod.target_pax_per_group || 10,
      price_per_pax: prod.price_per_pax || 0,
      variable_cost_per_pax: prod.variable_cost_per_pax || 0,
      fixed_cost_per_group: prod.fixed_cost_per_group || 0,
      strategy_notes: prod.strategy_notes || '',
      color: prod.color || '#0284c7'
    });
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.product_code.trim()) {
      Swal.fire('Thiếu thông tin', 'Vui lòng điền đủ Mã sản phẩm và Tên sản phẩm.', 'warning');
      return;
    }
    if (Number(productForm.price_per_pax) < 0 || Number(productForm.variable_cost_per_pax) < 0) {
      Swal.fire('Giá trị không hợp lệ', 'Giá bán và chi phí không được là số âm.', 'warning');
      return;
    }

    try {
      const payload = {
        ...productForm,
        product_id: editingProduct ? editingProduct.id : undefined
      };
      const res = await axios.post(`/api/bu-planning/plans/${currentPlan.id}/products`, payload);
      if (res.data.success) {
        setShowProductModal(false);
        if (addToast) addToast(res.data.message, 'success');
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi lưu sản phẩm', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleDeleteProduct = async (prodId, prodName) => {
    const result = await Swal.fire({
      title: 'Xóa sản phẩm này?',
      text: `Sản phẩm "${prodName}" và tất cả các đợt khởi hành của nó sẽ bị xóa.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });
    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`/api/bu-planning/plans/${currentPlan.id}/products/${prodId}`);
      if (res.data.success) {
        if (addToast) addToast('Đã xóa sản phẩm!', 'success');
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi xóa sản phẩm', err.response?.data?.message || err.message, 'error');
    }
  };

  // ═══ EXCEL-STYLE GRID ACTIONS (STAGE 2) ═══
  const handleGridCellChange = (index, field, value) => {
    setGridProducts(prev => {
      const next = [...prev];
      const row = { ...next[index], [field]: value };

      // Recalculate Unit Economics inline
      const price = Number(row.price_per_pax) || 0;
      const varCost = Number(row.variable_cost_per_pax) || 0;
      const fixedCost = Number(row.fixed_cost_per_group) || 0;
      const gp = price - varCost;
      row.gross_profit_per_pax = gp;
      row.gross_margin_pct = price > 0 ? Number(((gp / price) * 100).toFixed(1)) : 0;
      row.break_even_pax = gp > 0 ? Math.ceil(fixedCost / gp) : 0;

      next[index] = row;
      return next;
    });

    // Debounced Auto-save to server
    if (currentPlan?.id) {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = setTimeout(async () => {
        try {
          setIsSavingGrid(true);
          const validRows = gridProducts.filter(r => r.name && r.name.trim().length > 0);
          if (validRows.length > 0) {
            await axios.post(`/api/bu-planning/plans/${currentPlan.id}/batch-products`, { products: validRows });
            setLastSaved(new Date().toLocaleTimeString('vi-VN'));
          }
        } catch (err) {
          console.error('Auto save error:', err);
        } finally {
          setIsSavingGrid(false);
        }
      }, 1500);
    }
  };

  const focusGridCell = (rowIndex, field) => {
    setTimeout(() => {
      const el = document.getElementById(`grid-cell-${rowIndex}-${field}`);
      if (el) {
        el.focus();
        if (el.select) el.select();
      }
    }, 40);
  };

  const handleAddGridRow = (afterIndex = null, focusField = 'name') => {
    const newIdx = gridProducts.length + 1;
    const newRow = {
      id: `temp_${Date.now()}`,
      product_code: `${selectedBU}-SP-${String(newIdx).padStart(2, '0')}`,
      name: '',
      group_type: 'Tuyến trụ cột',
      priority: 'Cao',
      stage: 'Đang bán',
      season: 'Tháng 5 - Tháng 9',
      person_in_charge: currentUser?.full_name || '',
      target_pax_per_group: 10,
      price_per_pax: 0,
      variable_cost_per_pax: 0,
      fixed_cost_per_group: 0,
      gross_profit_per_pax: 0,
      gross_margin_pct: 0,
      break_even_pax: 0
    };

    setGridProducts(prev => {
      let targetRowIndex;
      let next;
      if (afterIndex === null || afterIndex === undefined || afterIndex >= prev.length - 1) {
        targetRowIndex = prev.length;
        next = [...prev, newRow];
      } else {
        targetRowIndex = afterIndex + 1;
        next = [...prev];
        next.splice(afterIndex + 1, 0, newRow);
      }
      setTimeout(() => {
        focusGridCell(targetRowIndex, focusField);
      }, 60);
      return next;
    });
  };

  const handleGridKeyDown = (e, rowIndex, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex < gridProducts.length - 1) {
        focusGridCell(rowIndex + 1, field);
      } else {
        handleAddGridRow(rowIndex, field);
      }
    } else if (e.key === 'ArrowDown') {
      if (rowIndex < gridProducts.length - 1) {
        e.preventDefault();
        focusGridCell(rowIndex + 1, field);
      }
    } else if (e.key === 'ArrowUp') {
      if (rowIndex > 0) {
        e.preventDefault();
        focusGridCell(rowIndex - 1, field);
      }
    } else if (e.key === 'Tab' && !e.shiftKey) {
      if (field === 'variable_cost_per_pax') {
        e.preventDefault();
        if (rowIndex < gridProducts.length - 1) {
          focusGridCell(rowIndex + 1, 'name');
        } else {
          handleAddGridRow(rowIndex, 'name');
        }
      }
    }
  };

  const handleDuplicateGridRow = (index) => {
    const target = gridProducts[index];
    if (!target) return;
    const cloned = {
      ...target,
      id: `temp_${Date.now()}`,
      product_code: `${target.product_code}-COPY`,
      name: `${target.name} (Bản sao)`
    };
    setGridProducts(prev => {
      const next = [...prev];
      next.splice(index + 1, 0, cloned);
      return next;
    });
  };

  const handleDeleteGridRow = async (index) => {
    const target = gridProducts[index];
    if (!target) return;
    if (target.id && typeof target.id === 'number' && currentPlan?.id) {
      const confirm = await Swal.fire({
        title: 'Xóa sản phẩm này?',
        text: `Bạn có chắc muốn xóa sản phẩm "${target.name || target.product_code}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Xóa ngay',
        cancelButtonText: 'Hủy'
      });
      if (!confirm.isConfirmed) return;
      try {
        await axios.delete(`/api/bu-planning/plans/${currentPlan.id}/products/${target.id}`);
        await loadPlanData();
      } catch (err) {
        Swal.fire('Lỗi', err.response?.data?.message || 'Không thể xóa sản phẩm', 'error');
        return;
      }
    }
    setGridProducts(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveGridExplicit = async () => {
    if (!currentPlan?.id) {
      Swal.fire('Lưu ý', 'Vui lòng hoàn tất Bước 1 (Khởi tạo kế hoạch) trước khi lưu sản phẩm.', 'warning');
      return;
    }
    const validRows = gridProducts.filter(r => r.name && r.name.trim().length > 0);
    if (validRows.length === 0) {
      Swal.fire('Lưu ý', 'Vui lòng nhập ít nhất một dòng có Tên sản phẩm / Tuyến.', 'info');
      return;
    }
    try {
      setIsSavingGrid(true);
      const res = await axios.post(`/api/bu-planning/plans/${currentPlan.id}/batch-products`, { products: validRows });
      if (res.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Đã lưu bảng tính thành công!',
          text: `Đã lưu ${res.data.data.length} sản phẩm vào cơ sở dữ liệu.`,
          timer: 1500,
          showConfirmButton: false
        });
        setLastSaved(new Date().toLocaleTimeString('vi-VN'));
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi', err.response?.data?.message || 'Lỗi lưu bảng tính', 'error');
    } finally {
      setIsSavingGrid(false);
    }
  };

  const handleMatrixCellChange = async (productId, month, value) => {
    if (!currentPlan?.id) return;
    const count = parseInt(value, 10) || 0;
    try {
      await axios.post(`/api/bu-planning/plans/${currentPlan.id}/matrix-cell`, {
        product_id: productId,
        month,
        groups_count: count
      });
      const detailRes = await axios.get(`/api/bu-planning/plans/${currentPlan.id}`);
      if (detailRes.data.success) {
        setPlanDetail(detailRes.data.data);
        setLastSaved(new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (err) {
      console.error('Matrix cell update error:', err);
    }
  };

  const handleParseAndImportPaste = async () => {
    if (!pasteRawText.trim()) {
      Swal.fire('Chưa có dữ liệu', 'Vui lòng dán dữ liệu bảng tính vào khung nhập.', 'info');
      return;
    }

    const lines = pasteRawText.trim().split(/\r?\n/).filter(line => line.trim().length > 0);
    const parsedRows = [];

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split('\t');
      const cols = parts.length > 1 ? parts : lines[i].split(',');

      if (i === 0 && (cols[0].toLowerCase().includes('mã') || cols[1]?.toLowerCase().includes('tên') || cols[0].toLowerCase().includes('stt'))) {
        continue;
      }

      const code = cols[0]?.trim() || `${selectedBU}-SP-${String(gridProducts.length + parsedRows.length + 1).padStart(2, '0')}`;
      const name = cols[1]?.trim() || cols[0]?.trim();
      if (!name) continue;

      const groupType = cols[2]?.trim() || 'Tuyến trụ cột';
      const priority = cols[3]?.trim() || 'Cao';
      const stage = cols[4]?.trim() || 'Đang bán';
      const pax = parseInt(cols[5]?.replace(/[^\d]/g, ''), 10) || 10;
      const price = parseInt(cols[6]?.replace(/[^\d]/g, ''), 10) || 0;
      const varCost = parseInt(cols[7]?.replace(/[^\d]/g, ''), 10) || 0;
      const fixedCost = parseInt(cols[8]?.replace(/[^\d]/g, ''), 10) || 0;

      parsedRows.push({
        id: `paste_${Date.now()}_${i}`,
        product_code: code,
        name: name,
        group_type: groupType,
        priority: priority,
        stage: stage,
        season: '',
        person_in_charge: currentUser?.full_name || '',
        target_pax_per_group: pax,
        price_per_pax: price,
        variable_cost_per_pax: varCost,
        fixed_cost_per_group: fixedCost,
        gross_profit_per_pax: price - varCost,
        gross_margin_pct: price > 0 ? Number((((price - varCost) / price) * 100).toFixed(1)) : 0,
        break_even_pax: (price - varCost) > 0 ? Math.ceil(fixedCost / (price - varCost)) : 0
      });
    }

    if (parsedRows.length === 0) {
      Swal.fire('Lỗi định dạng', 'Không thể nhận diện dòng nào từ dữ liệu dán vào.', 'error');
      return;
    }

    setGridProducts(prev => [...prev.filter(r => r.name), ...parsedRows]);
    setShowPasteModal(false);
    setPasteRawText('');

    if (currentPlan?.id) {
      try {
        setIsSavingGrid(true);
        await axios.post(`/api/bu-planning/plans/${currentPlan.id}/batch-products`, { products: parsedRows });
        Swal.fire({
          icon: 'success',
          title: 'Dán thành công!',
          text: `Đã nhập và lưu ${parsedRows.length} sản phẩm từ bảng tính!`,
          timer: 2000,
          showConfirmButton: false
        });
        await loadPlanData();
      } catch (err) {
        Swal.fire('Lưu thất bại', err.response?.data?.message || err.message, 'error');
      } finally {
        setIsSavingGrid(false);
      }
    }
  };

  // 3. Departure Actions
  const handleOpenAddDeparture = (defaultProductId = null, defaultMonth = null) => {
    setEditingDeparture(null);
    const prodList = planDetail?.products || [];
    const firstProd = defaultProductId 
      ? prodList.find(p => p.id === defaultProductId) 
      : prodList[0];

    const nextCount = (planDetail?.departures?.length || 0) + 1;
    setDepartureForm({
      product_id: firstProd ? firstProd.id : '',
      departure_code: `${selectedBU}-DEP-${String(nextCount).padStart(3, '0')}`,
      month: defaultMonth || 1,
      groups_count: 1,
      pax_per_group: firstProd?.target_pax_per_group || 10,
      sales_status: 'Đang bán',
      person_in_charge: currentPlan?.owner_name || '',
      notes: ''
    });
    setShowDepartureModal(true);
  };

  const handleOpenEditDeparture = (dep) => {
    setEditingDeparture(dep);
    setDepartureForm({
      product_id: dep.product_id,
      departure_code: dep.departure_code,
      month: dep.month,
      groups_count: dep.groups_count,
      pax_per_group: dep.pax_per_group,
      sales_status: dep.sales_status || 'Đang bán',
      person_in_charge: dep.person_in_charge || '',
      notes: dep.notes || ''
    });
    setShowDepartureModal(true);
  };

  const handleSaveDeparture = async (e) => {
    e.preventDefault();
    if (!departureForm.product_id || !departureForm.month) {
      Swal.fire('Thiếu thông tin', 'Vui lòng chọn sản phẩm và tháng khởi hành.', 'warning');
      return;
    }

    try {
      const payload = {
        ...departureForm,
        departure_id: editingDeparture ? editingDeparture.id : undefined
      };
      const res = await axios.post(`/api/bu-planning/plans/${currentPlan.id}/departures`, payload);
      if (res.data.success) {
        setShowDepartureModal(false);
        setMatrixCellModal(null);
        if (addToast) addToast(res.data.message, 'success');
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi lưu đợt khởi hành', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleDeleteDeparture = async (depId, depCode) => {
    const result = await Swal.fire({
      title: 'Xóa đợt khởi hành?',
      text: `Xác nhận xóa đợt khởi hành mã ${depCode}? Ma trận 12 tháng sẽ tự động trừ đi số đoàn này.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });
    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`/api/bu-planning/plans/${currentPlan.id}/departures/${depId}`);
      if (res.data.success) {
        if (addToast) addToast('Đã xóa đợt khởi hành!', 'success');
        setMatrixCellModal(null);
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi xóa đợt khởi hành', err.response?.data?.message || err.message, 'error');
    }
  };

  // 4. Task Actions
  const handleOpenAddTask = () => {
    setEditingTask(null);
    const count = (planDetail?.tasks?.length || 0) + 1;
    setTaskForm({
      task_code: `${selectedBU}-M${String(count).padStart(2, '0')}`,
      season_stage: 'Quý 1',
      related_products: '',
      category: '',
      deadline: '',
      completed_date: '',
      assignee: currentPlan?.owner_name || '',
      status: 'Đang chạy',
      obstacles_notes: ''
    });
    setShowTaskModal(true);
  };

  const handleOpenEditTask = (tsk) => {
    setEditingTask(tsk);
    setTaskForm({
      task_code: tsk.task_code,
      season_stage: tsk.season_stage || '',
      related_products: tsk.related_products || '',
      category: tsk.category || '',
      deadline: tsk.deadline ? tsk.deadline.substring(0, 10) : '',
      completed_date: tsk.completed_date ? tsk.completed_date.substring(0, 10) : '',
      assignee: tsk.assignee || '',
      status: tsk.status || 'Đang chạy',
      obstacles_notes: tsk.obstacles_notes || ''
    });
    setShowTaskModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.category.trim()) {
      Swal.fire('Thiếu thông tin', 'Vui lòng điền nội dung hạng mục công việc.', 'warning');
      return;
    }

    try {
      const payload = {
        ...taskForm,
        task_id: editingTask ? editingTask.id : undefined
      };
      const res = await axios.post(`/api/bu-planning/plans/${currentPlan.id}/tasks`, payload);
      if (res.data.success) {
        setShowTaskModal(false);
        if (addToast) addToast(res.data.message, 'success');
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi lưu công việc', err.response?.data?.message || err.message, 'error');
    }
  };

  const handleDeleteTask = async (taskId, code) => {
    const result = await Swal.fire({
      title: 'Xóa công việc này?',
      text: `Xác nhận xóa công việc ${code}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Đồng ý xóa',
      cancelButtonText: 'Hủy'
    });
    if (!result.isConfirmed) return;

    try {
      const res = await axios.delete(`/api/bu-planning/plans/${currentPlan.id}/tasks/${taskId}`);
      if (res.data.success) {
        if (addToast) addToast('Đã xóa công việc!', 'success');
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi xóa công việc', err.response?.data?.message || err.message, 'error');
    }
  };

  // 5. Approval State Machine Actions
  const handleStatusTransition = async (action, notes = '') => {
    try {
      setLoading(true);
      const res = await axios.post(`/api/bu-planning/plans/${currentPlan.id}/status`, {
        action,
        feedback_notes: notes,
        approval_notes: notes
      });
      if (res.data.success) {
        if (action === 'SUBMIT') {
          handleCompleteStage(5);
        } else {
          Swal.fire('Thành công', res.data.message, 'success');
        }
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi chuyển trạng thái', err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 6. Export Excel (.xlsx) matching Google Sheet format
  const handleExportExcel = () => {
    if (!planDetail) return;
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Dashboard
      const dashData = [
        ['FIT TOUR / BU PLANNING STUDIO — EXECUTIVE REPORT'],
        ['Kế hoạch kinh doanh tóm tắt điều hành'],
        ['Đơn vị:', selectedBU, 'Năm kế hoạch:', selectedYear, 'Trạng thái:', currentPlan.status],
        [],
        ['CHỈ TIÊU KẾ HOẠCH TỔNG HỢP'],
        ['Tổng số đoàn:', planDetail.summary.total_groups],
        ['Tổng khách (Pax):', planDetail.summary.total_pax],
        ['Doanh thu kế hoạch:', fmt(planDetail.summary.total_revenue) + ' đ'],
        ['Lãi gộp kế hoạch:', fmt(planDetail.summary.total_gross_profit) + ' đ'],
        ['Tỷ suất lãi gộp trung bình:', planDetail.summary.gross_margin_pct + '%'],
        ['Ngân sách MKT kế hoạch (1%):', fmt(planDetail.summary.mkt_budget_required_1pct) + ' đ'],
        ['Ngân sách MKT đề xuất:', fmt(planDetail.summary.mkt_budget_total) + ' đ'],
        ['Tỷ lệ MKT / Doanh thu:', planDetail.summary.mkt_ratio_actual + '%']
      ];
      const wsDash = XLSX.utils.aoa_to_sheet(dashData);
      XLSX.utils.book_append_sheet(wb, wsDash, '01 Dashboard');

      // Sheet 2: Ma tran nam
      const matHeader = ['Mã SP', 'Tên Sản Phẩm', 'Ưu Tiên', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'Cả Năm', 'Giai Đoạn'];
      const matRows = planDetail.matrix.map(m => [
        m.product_code, m.name, m.priority,
        m.months[1] || 0, m.months[2] || 0, m.months[3] || 0, m.months[4] || 0,
        m.months[5] || 0, m.months[6] || 0, m.months[7] || 0, m.months[8] || 0,
        m.months[9] || 0, m.months[10] || 0, m.months[11] || 0, m.months[12] || 0,
        m.total_groups, m.stage
      ]);
      const wsMatrix = XLSX.utils.aoa_to_sheet([matHeader, ...matRows]);
      XLSX.utils.book_append_sheet(wb, wsMatrix, '02 Ma trận năm');

      // Sheet 3: Lich doan
      const depHeader = ['Mã Đợt', 'Tháng KH', 'Mã SP', 'Tên Sản Phẩm', 'Số Đoàn', 'Khách/Đoàn', 'Tổng Khách', 'Giá/Khách', 'Biến Phí', 'Định Phí', 'Doanh Thu', 'Lãi Gộp', 'Trạng Thái', 'Phụ Trách'];
      const depRows = planDetail.departures.map(d => [
        d.departure_code, `Tháng ${d.month}`, d.product_code, d.product_name,
        d.groups_count, d.pax_per_group, d.total_pax,
        d.price_per_pax, d.variable_cost_per_pax, d.fixed_cost_per_group,
        d.total_revenue, d.total_gross_profit, d.sales_status, d.person_in_charge
      ]);
      const wsDep = XLSX.utils.aoa_to_sheet([depHeader, ...depRows]);
      XLSX.utils.book_append_sheet(wb, wsDep, '03 Lịch đoàn');

      // Sheet 4: San pham
      const prodHeader = ['Mã SP', 'Tên Tuyến / Sản Phẩm', 'Nhóm', 'Mùa Bán', 'Ưu Tiên', 'Giai Đoạn', 'Phụ Trách', 'Khách/Đoàn', 'Giá Bán', 'Biến Phí', 'Định Phí', 'Lãi Gộp/Pax', 'Biên Lãi %', 'Hòa Vốn (Pax)'];
      const prodRows = planDetail.products.map(p => [
        p.product_code, p.name, p.group_type, p.season, p.priority, p.stage, p.person_in_charge,
        p.target_pax_per_group, p.price_per_pax, p.variable_cost_per_pax, p.fixed_cost_per_group,
        p.gross_profit_per_pax, `${p.gross_margin_pct}%`, p.break_even_pax
      ]);
      const wsProd = XLSX.utils.aoa_to_sheet([prodHeader, ...prodRows]);
      XLSX.utils.book_append_sheet(wb, wsProd, '04 Sản phẩm');

      // Sheet 5: Marketing
      const mktHeader = ['Tháng', 'Số Đoàn KH', 'Khách KH', 'Doanh Thu KH', 'Lãi Gộp KH', 'Ngân Sách MKT (1%)', 'Tỷ Lệ MKT/DT'];
      const mktRows = planDetail.monthly_cashflow.map(m => [
        m.month_label, m.groups_count, m.pax_count, m.revenue, m.gross_profit, m.mkt_budget_planned, m.mkt_ratio
      ]);
      const wsMkt = XLSX.utils.aoa_to_sheet([mktHeader, ...mktRows]);
      XLSX.utils.book_append_sheet(wb, wsMkt, '05 Marketing');

      // Sheet 6: Tien do
      const taskHeader = ['Mã Việc', 'Mùa / Giai Đoạn', 'Sản Phẩm', 'Hạng Mục', 'Hạn Hoàn Thành', 'Ngày Hoàn Tất', 'Phụ Trách', 'Trạng Thái', 'Quá Hạn?'];
      const taskRows = planDetail.tasks.map(t => [
        t.task_code, t.season_stage, t.related_products, t.category,
        t.deadline ? t.deadline.substring(0, 10) : '',
        t.completed_date ? t.completed_date.substring(0, 10) : '',
        t.assignee, t.status, t.is_overdue ? `Quá hạn ${t.days_overdue} ngày` : 'Đúng hạn'
      ]);
      const wsTasks = XLSX.utils.aoa_to_sheet([taskHeader, ...taskRows]);
      XLSX.utils.book_append_sheet(wb, wsTasks, '06 Tiến độ');

      XLSX.writeFile(wb, `FIT_TOUR_${selectedBU}_KE_HOACH_${selectedYear}.xlsx`);
      if (addToast) addToast(`Đã xuất file Excel cho ${selectedBU} (${selectedYear})!`, 'success');
    } catch (err) {
      Swal.fire('Lỗi xuất Excel', err.message, 'error');
    }
  };

  // 7. Print / PDF report
  const handlePrintPDF = () => {
    window.print();
  };

  // 8. Localhost Dev Sandbox Helpers
  const handleDevSeedBU5 = async () => {
    try {
      setLoading(true);
      const res = await axios.post('/api/bu-planning/dev-seed-demo', { buId: 'BU5', year: 2027 });
      if (res.data.success) {
        Swal.fire('Đã Nạp Dữ Liệu Chuẩn!', res.data.message, 'success');
        setSelectedBU('BU5');
        setSelectedYear(2027);
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi Seed', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDevResetSandbox = async () => {
    const confirm = await Swal.fire({
      title: 'Dọn sạch Sandbox?',
      text: 'Toàn bộ dữ liệu kế hoạch thử nghiệm trong sandbox sẽ bị xóa sạch để kiểm thử lại từ đầu.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xác nhận xóa sạch',
      cancelButtonText: 'Hủy'
    });
    if (!confirm.isConfirmed) return;

    try {
      setLoading(true);
      const res = await axios.post('/api/bu-planning/dev-reset-sandbox');
      if (res.data.success) {
        Swal.fire('Sandbox Đã Dọn Sạch!', res.data.message, 'success');
        await loadPlanData();
      }
    } catch (err) {
      Swal.fire('Lỗi Dọn Sandbox', err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Helper color tags
  const getPriorityBadge = (pri) => {
    switch (pri) {
      case 'Cao': return { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' };
      case 'Trung bình': return { bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      default: return { bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
    }
  };

  const getStageBadge = (stg) => {
    switch (stg) {
      case 'Đang bán': return { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'Đang phát triển': return { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' };
      case 'Khảo sát': return { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' };
      default: return { bg: '#f8fafc', text: '#64748b', border: '#e2e8f0' };
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return { label: 'Đã Duyệt (v1.0)', bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' };
      case 'SUBMITTED': return { label: 'Chờ BOD Duyệt', bg: '#fef3c7', text: '#d97706', border: '#fde68a' };
      case 'CHANGES_REQUESTED': return { label: 'Yêu Cầu Chỉnh Sửa', bg: '#fef2f2', text: '#dc2626', border: '#fca5a5' };
      case 'HIDDEN_DRAFT': return { label: 'Bản Nháp Bảo Mật (BU Khác)', bg: '#f1f5f9', text: '#64748b', border: '#cbd5e1' };
      default: return { label: 'Bản Nháp', bg: '#f0f9ff', text: '#0284c7', border: '#bae6fd' };
    }
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    if (!planDetail?.tasks) return [];
    if (taskFilter === 'OVERDUE') return planDetail.tasks.filter(t => t.is_overdue);
    if (taskFilter === 'RUNNING') return planDetail.tasks.filter(t => t.status === 'Đang chạy');
    if (taskFilter === 'DONE') return planDetail.tasks.filter(t => t.status === 'Đã hoàn tất');
    return planDetail.tasks;
  }, [planDetail, taskFilter]);

  return (
    <div 
      className={`bu-planning-root ${isFocusMode ? 'focus-mode-canvas' : ''}`}
      style={isFocusMode ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: '#f8fafc',
        zIndex: 99999,
        overflowY: 'auto',
        padding: '16px 28px 80px 28px'
      } : {
        padding: '0 2rem 5rem 2rem',
        background: '#f8fafc',
        minHeight: '100vh'
      }}
    >
      {/* ── BANNER GỢI Ý MỞ TRANG TRẮNG TOÀN MÀN HÌNH (ẨN SIDEBAR) ── */}
      {!isFocusMode && (
        <div style={{
          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
          color: '#ffffff',
          borderRadius: '10px',
          padding: '12px 20px',
          marginTop: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
              <Sparkles size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                💡 Trải nghiệm Trang Trắng Toàn Màn Hình (Không Sidebar)?
              </div>
              <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>
                Ẩn hoàn toàn sidebar CRM, mở rộng không gian 100% để nhập liệu trực tiếp vào các ô như Excel / Google Sheets.
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsFocusMode(true)}
            style={{
              background: '#ffffff',
              color: '#0284c7',
              fontWeight: 800,
              fontSize: '0.84rem',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 18px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <span>🖥️ Mở Trang Trắng Toàn Màn Hình</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* ── HEADER FOCUS MODE (KHI Ở CHẾ ĐỘ TOÀN MÀN HÌNH) ── */}
      {isFocusMode && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '10px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img src="/logo.png" alt="FIT TOUR" style={{ height: '28px', objectFit: 'contain' }} />
            <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '14px' }}>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>FIT TOUR | BU Planning Studio</span>
                <span style={{ fontSize: '0.68rem', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '12px', fontWeight: 800 }}>EXCEL FOCUS CANVAS</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                Trang trắng không sidebar • Tự động tính công thức & Lưu nháp
              </div>
            </div>
          </div>

          {/* BU Switcher in Focus mode */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {BU_LIST.map(b => (
              <button
                key={b.id}
                onClick={() => setSelectedBU(b.id)}
                style={{
                  background: selectedBU === b.id ? b.color : '#f1f5f9',
                  color: selectedBU === b.id ? '#ffffff' : '#475569',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                {b.id}
              </button>
            ))}

            <select
              value={selectedYear}
              onChange={e => setSelectedYear(Number(e.target.value))}
              style={{
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 10px',
                fontWeight: 700,
                fontSize: '0.8rem',
                background: '#ffffff',
                color: '#0f172a',
                marginLeft: '6px'
              }}
            >
              <option value={2026}>Năm 2026</option>
              <option value={2027}>Năm 2027</option>
              <option value={2028}>Năm 2028</option>
              <option value={2029}>Năm 2029</option>
            </select>
          </div>

          {/* Actions in Focus mode - Gọn gàng trên 1 hàng duy nhất */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* 🎮 Nút Hướng Dẫn Bước Này (Bật pop-up game walkthrough trực quan) */}
            <button
              onClick={() => {
                if (activeStage === 1) {
                  setGameTourStep(1);
                } else if (activeStage === 2) {
                  setStage2TourStep(1);
                } else {
                  setActiveQuestModal(activeStage);
                }
              }}
              style={{
                background: ((activeStage === 1 && gameTourStep) || (activeStage === 2 && stage2TourStep)) ? '#e0f2fe' : '#f0f9ff',
                color: '#0284c7',
                border: ((activeStage === 1 && gameTourStep) || (activeStage === 2 && stage2TourStep)) ? '1.5px solid #0284c7' : '1.5px solid #38bdf8',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: ((activeStage === 1 && gameTourStep) || (activeStage === 2 && stage2TourStep)) ? '0 0 10px rgba(2, 132, 199, 0.25)' : '0 1px 3px rgba(2, 132, 199, 0.15)'
              }}
              title="Xem hướng dẫn và nhiệm vụ chi tiết bước này"
            >
              <HelpCircle size={15} color="#0284c7" />
              <span>{((activeStage === 1 && gameTourStep) || (activeStage === 2 && stage2TourStep)) ? '🎮 Đang Bật Hướng Dẫn' : `💡 Hướng Dẫn Chặng ${activeStage}`}</span>
            </button>

            {/* BOD Phê Duyệt khi được submit */}
            {isAdminOrBOD && currentPlan?.status === 'SUBMITTED' && (
              <button
                onClick={() => handleStatusTransition('APPROVE', 'Phê duyệt chính thức toàn diện')}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px 13px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <CheckCircle2 size={14} />
                <span>Duyệt v1.0</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── MODAL POP-UP HƯỚNG DẪN NHIỆM VỤ CHI TIẾT ── */}
      {activeQuestModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '14px',
            maxWidth: '620px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            border: '2px solid #38bdf8',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              padding: '18px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                  <Gamepad2 size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9, fontWeight: 800 }}>
                    {QUEST_STAGES.find(q => q.id === activeQuestModal)?.badge} • NHIỆM VỤ CHẶNG {activeQuestModal} / 5
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '2px' }}>
                    {QUEST_STAGES.find(q => q.id === activeQuestModal)?.title}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveQuestModal(null)}
                style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
              <div style={{ fontSize: '0.9rem', color: '#334155', lineHeight: '1.5', marginBottom: '16px' }}>
                {QUEST_STAGES.find(q => q.id === activeQuestModal)?.mission}
              </div>

              {/* Chi tiết từng bước (Ghi gì & Tác dụng gì) nếu có */}
              {QUEST_STAGES.find(q => q.id === activeQuestModal)?.stepDetails && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
                  {QUEST_STAGES.find(q => q.id === activeQuestModal).stepDetails.map((sd, sidx) => (
                    <div key={sidx} style={{
                      background: '#f8fafc',
                      border: '1px solid #cbd5e1',
                      borderLeft: '4px solid #0284c7',
                      borderRadius: '8px',
                      padding: '12px 14px'
                    }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a', marginBottom: '6px' }}>
                        {sd.step}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '4px', lineHeight: 1.5 }}>
                        <b style={{ color: '#0284c7' }}>📝 Ghi gì:</b> {sd.ghiGi}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5 }}>
                        <b style={{ color: '#16a34a' }}>🎯 Tác dụng:</b> {sd.tacDung}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                📋 CÁC BƯỚC CẦN THỰC HIỆN:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {QUEST_STAGES.find(q => q.id === activeQuestModal)?.checklist.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    background: '#f8fafc',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.84rem',
                    color: '#1e293b'
                  }}>
                    <CheckCircle2 size={16} color="#16a34a" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Mẹo Pro Tip */}
              <div style={{
                background: '#fefce8',
                border: '1px solid #fef08a',
                padding: '12px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#854d0e',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Sparkles size={18} color="#ca8a04" style={{ flexShrink: 0 }} />
                <span><b>Mẹo BUM:</b> {QUEST_STAGES.find(q => q.id === activeQuestModal)?.hint}</span>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setActiveQuestModal(null)}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
                }}
              >
                <span>🚀 Đã Hiểu Nhiệm Vụ — Bắt Đầu Nhập Liệu!</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL POP-UP CHÚC MỪNG VƯỢT QUA CHẶNG (CELEBRATION MODAL) ── */}
      {celebrationData && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 100000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '540px',
            width: '100%',
            textAlign: 'center',
            padding: '32px 28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            border: '2px solid #86efac',
            position: 'relative'
          }}>
            {/* Celebration Icon */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
            }}>
              <Trophy size={38} />
            </div>

            <div style={{ display: 'inline-block', background: '#dcfce7', color: '#166534', padding: '3px 12px', borderRadius: '14px', fontSize: '0.74rem', fontWeight: 800, marginBottom: '8px' }}>
              LEVEL UP • +100 EXP ⭐
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>
              {celebrationData.title}
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5', margin: '0 0 20px' }}>
              {celebrationData.message}
            </p>

            {celebrationData.toStage ? (
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '10px',
                padding: '14px',
                textAlign: 'left',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 800, textTransform: 'uppercase' }}>
                  👉 BƯỚC TIẾP THEO: {celebrationData.nextLevelName}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                  {celebrationData.nextTitle}
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              {celebrationData.toStage ? (
                <button
                  onClick={handleProceedNextStage}
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)'
                  }}
                >
                  <span>Tiến Lên Bước Kế Tiếp ➔</span>
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => setCelebrationData(null)}
                  style={{
                    flex: 1,
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 20px',
                    fontSize: '0.92rem',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Tuyệt Vời! Đã Hoàn Thành
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      
      {/* ── HEADER CHÍNH CỦA MODULE (ẨN KHI Ở TRANG TRẮNG FOCUS MODE) ── */}
      {!isFocusMode && (
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '24px 28px',
          marginTop: '1.2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.12)',
          border: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                background: '#0284c7',
                color: '#ffffff',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                COMMERCIAL PLANNING STUDIO
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Đơn vị: {selectedBU} • Năm {selectedYear}</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 6px', color: '#f8fafc' }}>
              FIT TOUR | BU Planning Studio
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.86rem', maxWidth: '780px', lineHeight: '1.4' }}>
              Không gian lập kế hoạch kinh doanh, danh mục tour và phân bổ ngân sách Marketing chuẩn hóa từng chặng cho Business Unit.
            </p>
          </div>

          {/* Cụm điều khiển Bộ Lọc BU, Năm & Trạng Thái */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Chọn BU */}
            <div style={{ display: 'flex', background: '#1e293b', border: '1px solid #475569', borderRadius: '8px', padding: '3px' }}>
              {BU_LIST.map(b => {
                const isSel = selectedBU === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBU(b.id)}
                    style={{
                      background: isSel ? '#0284c7' : 'transparent',
                      color: isSel ? '#ffffff' : '#94a3b8',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      fontWeight: isSel ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {b.name}
                  </button>
                );
              })}
            </div>

            {/* Chọn Năm */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #475569',
                borderRadius: '8px',
                padding: '7px 12px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <option value={2026}>Năm 2026</option>
              <option value={2027}>Năm 2027</option>
              <option value={2028}>Năm 2028</option>
              <option value={2029}>Năm 2029</option>
            </select>

            {/* Nút Xuất Excel & In */}
            {planDetail && (
              <>
                <button
                  onClick={handleExportExcel}
                  className="btn-pro-cancel"
                  style={{
                    background: '#047857',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Download size={15} />
                  <span>Xuất Excel</span>
                </button>

                <button
                  onClick={handlePrintPDF}
                  className="btn-pro-cancel"
                  style={{
                    background: '#334155',
                    color: '#ffffff',
                    border: 'none',
                    padding: '7px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} />
                  <span>In / PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── NẾU BỊ CHẶN BỞI BẢO MẬT BU (TEST 12) ── */}
      {currentPlan?.status === 'HIDDEN_DRAFT' && (
        <div style={{
          background: '#ffffff',
          border: '2px dashed #cbd5e1',
          borderRadius: '12px',
          padding: '60px 24px',
          textAlign: 'center',
          color: '#64748b',
          maxWidth: '650px',
          margin: '3rem auto'
        }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '14px' }} />
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b', fontWeight: 800, margin: '0 0 8px' }}>
            Kế Hoạch Thuộc Quyền Riêng Tư Của {selectedBU}
          </h2>
          <p style={{ fontSize: '0.88rem', lineHeight: '1.5', margin: '0 0 20px', color: '#64748b' }}>
            Theo quy chuẩn bảo mật dự án (Test 12), bản nháp kế hoạch chưa được phê duyệt chỉ dành riêng cho BUM/Nhân sự thuộc {selectedBU} và Ban Giám Đốc. Khi kế hoạch được BOD phê duyệt chính thức, toàn bộ dữ liệu sẽ mở quyền xem cho toàn công ty.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => setSelectedBU(currentUser?.bus?.[0] || 'BU5')}
              className="btn-pro-save"
              style={{ padding: '8px 18px', fontSize: '0.85rem' }}
            >
              Về Kế Hoạch BU Của Tôi
            </button>
          </div>
        </div>
      )}

      {/* ── NẾU CHƯA CÓ KẾ HOẠCH NÀO ĐƯỢC TẠO CHO BU VÀ NĂM NÀY ── */}
      {!currentPlan && !loading && (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '48px 24px',
          textAlign: 'center',
          maxWidth: '780px',
          margin: '2rem auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Calendar size={32} />
          </div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Chưa Có Kế Hoạch Cho {selectedBU} Năm {selectedYear}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b', maxWidth: '580px', margin: '0 auto 24px', lineHeight: '1.5' }}>
            Bắt đầu tạo kế hoạch mới để quản lý danh mục sản phẩm, tính toán lãi gộp, phân bổ số đoàn và dự toán ngân sách Marketing theo quý.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '620px', margin: '0 auto' }}>
            {/* Thẻ 1: Khởi tạo từ Template chuẩn */}
            <div
              onClick={() => handleCreatePlan('template')}
              style={{
                border: '2px solid #38bdf8',
                background: '#f0f9ff',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#0284c7'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#38bdf8'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px' }}>
                <Sparkles size={18} />
                <span>Nạp Từ Tour Mẫu Chuẩn</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#475569', lineHeight: '1.4' }}>
                Tự động nạp sẵn danh mục tour cốt lõi, giá thành đối soát và lịch đoàn của {selectedBU} để BUM hoàn tất nhanh trong 5 phút.
              </p>
            </div>

            {/* Thẻ 2: Bắt đầu từ bảng trắng */}
            <div
              onClick={() => handleCreatePlan('blank')}
              style={{
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#94a3b8'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontWeight: 700, fontSize: '0.92rem', marginBottom: '6px' }}>
                <Edit2 size={16} />
                <span>Tạo Bảng Trắng</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
                Tạo một bản kế hoạch hoàn toàn mới để BUM tự gõ và thiết kế danh mục tour từ đầu.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── KHI ĐÃ CÓ KẾ HOẠCH HỢP LỆ ĐƯỢC CHỌN ── */}
      {currentPlan && currentPlan.status !== 'HIDDEN_DRAFT' && planDetail && (
        <div>
          {/* Nếu có phản hồi yêu cầu sửa từ BOD */}
          {currentPlan.feedback_notes && currentPlan.status === 'CHANGES_REQUESTED' && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '10px 16px',
              marginBottom: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: '#b91c1c',
              fontSize: '0.84rem'
            }}>
              <AlertTriangle size={18} color="#dc2626" />
              <span><b>Yêu cầu chỉnh sửa từ BOD:</b> {currentPlan.feedback_notes}</span>
            </div>
          )}

          {/* ── THANH TIẾN ĐỘ 5 CHẶNG GỌN GÀNG (5-STAGE STEPPER) ── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}>
            {/* 5 Tab Chặng */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', flex: 1 }}>
              {STAGES.map((s) => {
                const isActive = activeStage === s.id;
                const isDone = completedStages.includes(s.id);
                const IconComp = s.icon;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveStage(s.id)}
                    style={{
                      background: isActive ? '#0284c7' : isDone ? '#f0fdf4' : '#f8fafc',
                      color: isActive ? '#ffffff' : isDone ? '#16a34a' : '#475569',
                      border: isActive ? '1.5px solid #0284c7' : isDone ? '1.5px solid #86efac' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '7px',
                      transition: 'all 0.15s',
                      boxShadow: isActive ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none'
                    }}
                  >
                    {isDone && !isActive ? (
                      <CheckCircle2 size={15} color="#16a34a" />
                    ) : (
                      <IconComp size={15} color={isActive ? '#ffffff' : '#64748b'} />
                    )}
                    <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 800 : 600 }}>
                      {s.title}
                    </span>
                    {isDone && !isActive && (
                      <span style={{ fontSize: '0.62rem', background: '#dcfce7', color: '#15803d', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Nút Hoàn thành & Chuyển bước nhanh */}
            {activeStage < 5 ? (
              <button
                onClick={() => handleCompleteStage(activeStage)}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                }}
              >
                <span>Xong Bước {activeStage} ➔ Sang Bước {activeStage + 1}</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => handleCompleteStage(5)}
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '9px 16px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Trophy size={15} />
                <span>Tổng Kết Kế Hoạch ➔</span>
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* CHẶNG 1: THIẾT LẬP MỤC TIÊU KINH DOANH BU (BU TARGETS) */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeStage === 1 && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🎯 Thiết Lập Mục Tiêu Kinh Doanh Toàn Năm Của {selectedBU}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                      NĂM {selectedYear}
                    </span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#64748b' }}>
                    BUM định hình các chỉ tiêu kinh doanh trọng tâm (Doanh thu, Đoàn, Khách, Lãi gộp) làm cơ sở xây dựng Kế hoạch sản phẩm.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setGameTourStep(prev => prev ? null : 1)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: gameTourStep ? '#e0f2fe' : '#f0f9ff',
                    border: gameTourStep ? '1.5px solid #0284c7' : '1px solid #bae6fd',
                    color: '#0284c7',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: gameTourStep ? '0 0 10px rgba(2, 132, 199, 0.2)' : 'none'
                  }}
                  title="Bật/Tắt hướng dẫn game chặng 1"
                >
                  <Gamepad2 size={16} />
                  <span>{gameTourStep ? '🎮 Đang Bật Hướng Dẫn' : '💡 Hướng Dẫn Chặng 1'}</span>
                </button>
              </div>

              {/* Thông tin định danh kế hoạch */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '22px' }}>
                {/* Tên bản kế hoạch */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                      📋 Tên Bản Kế Hoạch *
                    </label>
                    {currentPlan.title ? (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>✓ Xong</span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 7px', borderRadius: '10px' }}>⚡ Cần điền</span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="filter-input"
                    value={currentPlan.title || ''}
                    disabled={isPlanLocked}
                    placeholder={`VD: Kế Hoạch & Dự Toán Kinh Doanh ${selectedBU} Năm ${selectedYear}`}
                    onChange={(e) => setCurrentPlan({ ...currentPlan, title: e.target.value })}
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.9rem' }}
                  />
                </div>

                {/* BUM Phụ trách */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                      👤 Chủ Sở Hữu / BUM *
                    </label>
                    {currentPlan.owner_name ? (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>✓ Xong</span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 7px', borderRadius: '10px' }}>⚡ Cần điền</span>
                    )}
                  </div>
                  <input
                    type="text"
                    className="filter-input"
                    value={currentPlan.owner_name || ''}
                    disabled={isPlanLocked}
                    placeholder="VD: Nguyễn Văn A (Trưởng BU)"
                    onChange={(e) => setCurrentPlan({ ...currentPlan, owner_name: e.target.value })}
                    style={{ width: '100%', fontWeight: 700, fontSize: '0.9rem' }}
                  />
                </div>

                {/* Đơn vị & Năm */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                      🏢 Đơn Vị & Niên Độ
                    </label>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>Khóa cố định</span>
                  </div>
                  <div style={{ height: '38px', display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 800, color: '#0f172a', fontSize: '0.88rem' }}>
                    🏢 {selectedBU} • Niên độ {selectedYear}
                  </div>
                </div>
              </div>

              {/* KHỐI 5 CHỈ TIÊU KINH DOANH MỤC TIÊU CỦA BU */}
              <div style={{
                marginBottom: '22px',
                paddingTop: gameTourStep ? '145px' : '0px',
                transition: 'padding-top 0.25s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    ⭐ BẢNG CHỈ TIÊU KINH DOANH CỐT LÕI (BU BUSINESS TARGETS)
                  </span>
                  {gameTourStep && (
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontStyle: 'italic' }}>
                      (🎮 Hướng dẫn tương tác đang bật • Nhấn vào hộp thoại hoặc nút để sang bước tiếp theo)
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
                  {/* KPI 1: Doanh Thu */}
                  <div style={{
                    position: 'relative',
                    background: '#ffffff',
                    border: gameTourStep === 1 ? '2px solid #0284c7' : '1px solid #bae6fd',
                    borderRadius: '10px',
                    padding: '14px',
                    borderTop: '4px solid #0284c7',
                    boxShadow: gameTourStep === 1
                      ? '0 0 0 4px rgba(2, 132, 199, 0.25), 0 8px 20px rgba(2, 132, 199, 0.15)'
                      : '0 1px 3px rgba(2, 132, 199, 0.08)',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* RPG GAME TUTORIAL BOXTEXT • BƯỚC 1 */}
                    {gameTourStep === 1 && (
                      <div
                        onClick={() => { playLevelUpSound(); setGameTourStep(2); }}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 14px)',
                          left: '-5px',
                          right: '-5px',
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          color: '#ffffff',
                          border: '2px solid #38bdf8',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.45), 0 0 16px rgba(56, 189, 248, 0.35)',
                          zIndex: 60,
                          cursor: 'pointer'
                        }}
                      >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.95rem' }}>🎮</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              HƯỚNG DẪN • BƯỚC 1/3
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setGameTourStep(null); }}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px', fontSize: '0.9rem', lineHeight: 1 }}
                            title="Tắt hướng dẫn"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Title */}
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                          🎯 Bước 1: Điền Doanh Thu
                        </div>

                        {/* Description */}
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45, marginBottom: '10px' }}>
                          Gõ mục tiêu tổng doanh số tour BU cam kết đạt trong năm (VD: 15.000.000.000 ₫). Hệ thống tự trích 1% làm hạn mức Marketing.
                        </div>

                        {/* Button */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); playLevelUpSound(); setGameTourStep(2); }}
                            style={{
                              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)'
                            }}
                          >
                            <span>Nhấn để sang Bước 2: Số Đoàn ➔</span>
                          </button>
                        </div>

                        {/* Arrow pointing down directly to Doanh Thu */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-9px',
                          left: '32px',
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: '9px solid #38bdf8'
                        }}>
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '-7px',
                            width: 0,
                            height: 0,
                            borderLeft: '7px solid transparent',
                            borderRight: '7px solid transparent',
                            borderTop: '8px solid #0f172a'
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#0369a1', textTransform: 'uppercase' }}>
                        💰 BƯỚC 1: ĐIỀN DOANH THU (VNĐ) *
                      </label>
                      {Number(currentPlan.target_revenue || 0) > 0 ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>✓ Đã điền</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 7px', borderRadius: '10px' }}>⚡ Cần điền</span>
                      )}
                    </div>
                    <input
                      type="text"
                      className="filter-input"
                      value={currentPlan.target_revenue !== '' && currentPlan.target_revenue !== undefined && currentPlan.target_revenue !== null ? fmt(currentPlan.target_revenue) : ''}
                      disabled={isPlanLocked}
                      placeholder="VD: 15.000.000.000"
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const rev = raw ? parseInt(raw, 10) : '';
                        const numRev = Number(rev) || 0;
                        const gp = Number(currentPlan.target_gross_profit || 0);
                        const margin = numRev > 0 && gp > 0 ? Number(((gp / numRev) * 100).toFixed(1)) : (currentPlan.target_margin_pct || 0);
                        setCurrentPlan({ ...currentPlan, target_revenue: rev, target_margin_pct: margin });
                      }}
                      onBlur={() => {
                        if (currentPlan.target_revenue === '') {
                          setCurrentPlan({ ...currentPlan, target_revenue: 0 });
                        }
                      }}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 800, fontSize: '1.1rem', color: '#0284c7' }}
                    />
                    <div style={{ fontSize: '0.88rem', color: '#0284c7', marginTop: '6px', fontWeight: 800 }}>
                      {fmtVND(currentPlan.target_revenue || 0)}
                    </div>
                  </div>

                  {/* KPI 2: Số Đoàn */}
                  <div style={{
                    position: 'relative',
                    background: '#ffffff',
                    border: gameTourStep === 2 ? '2px solid #16a34a' : '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '14px',
                    borderTop: '4px solid #16a34a',
                    boxShadow: gameTourStep === 2
                      ? '0 0 0 4px rgba(22, 163, 74, 0.25), 0 8px 20px rgba(22, 163, 74, 0.15)'
                      : '0 1px 3px rgba(22, 163, 74, 0.08)',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* RPG GAME TUTORIAL BOXTEXT • BƯỚC 2 */}
                    {gameTourStep === 2 && (
                      <div
                        onClick={() => { playLevelUpSound(); setGameTourStep(3); }}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 14px)',
                          left: '-5px',
                          right: '-5px',
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          color: '#ffffff',
                          border: '2px solid #4ade80',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.45), 0 0 16px rgba(74, 222, 128, 0.35)',
                          zIndex: 60,
                          cursor: 'pointer'
                        }}
                      >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.95rem' }}>🎮</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              HƯỚNG DẪN • BƯỚC 2/3
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setGameTourStep(null); }}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px', fontSize: '0.9rem', lineHeight: 1 }}
                            title="Tắt hướng dẫn"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Title */}
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#4ade80', marginBottom: '4px' }}>
                          🚩 Bước 2: Điền Số Đoàn
                        </div>

                        {/* Description */}
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45, marginBottom: '10px' }}>
                          Nhập tổng số đoàn tour dự kiến tổ chức cả năm (VD: 15 đoàn) để phân bổ vào Lịch đoàn & Ma trận 12T.
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setGameTourStep(1); }}
                            style={{
                              background: 'transparent',
                              color: '#94a3b8',
                              border: '1px solid #475569',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ⬅ Bước 1
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); playLevelUpSound(); setGameTourStep(3); }}
                            style={{
                              background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
                            }}
                          >
                            <span>Nhấn để sang Bước 3: Số Khách ➔</span>
                          </button>
                        </div>

                        {/* Arrow pointing down to Số Đoàn */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-9px',
                          left: '32px',
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: '9px solid #4ade80'
                        }}>
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '-7px',
                            width: 0,
                            height: 0,
                            borderLeft: '7px solid transparent',
                            borderRight: '7px solid transparent',
                            borderTop: '8px solid #0f172a'
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                        🚩 BƯỚC 2: ĐIỀN SỐ ĐOÀN KHỞI HÀNH *
                      </label>
                      {Number(currentPlan.target_groups || 0) > 0 ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>✓ Đã điền</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 7px', borderRadius: '10px' }}>⚡ Cần điền</span>
                      )}
                    </div>
                    <input
                      type="number"
                      className="filter-input"
                      value={currentPlan.target_groups || 0}
                      disabled={isPlanLocked}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, target_groups: parseInt(e.target.value, 10) || 0 })}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 800, fontSize: '1.1rem', color: '#16a34a' }}
                    />
                    <div style={{ fontSize: '0.88rem', color: '#16a34a', marginTop: '6px', fontWeight: 800 }}>
                      {currentPlan.target_groups || 0} Đoàn khởi hành
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      Tổng số tour dự kiến chạy thành công
                    </div>
                  </div>

                  {/* KPI 3: Số Khách (Pax) */}
                  <div style={{
                    position: 'relative',
                    background: '#ffffff',
                    border: gameTourStep === 3 ? '2px solid #8b5cf6' : '1px solid #ddd6fe',
                    borderRadius: '10px',
                    padding: '14px',
                    borderTop: '4px solid #8b5cf6',
                    boxShadow: gameTourStep === 3
                      ? '0 0 0 4px rgba(139, 92, 246, 0.25), 0 8px 20px rgba(139, 92, 246, 0.15)'
                      : '0 1px 3px rgba(139, 92, 246, 0.08)',
                    transition: 'all 0.2s ease'
                  }}>
                    {/* RPG GAME TUTORIAL BOXTEXT • BƯỚC 3 */}
                    {gameTourStep === 3 && (
                      <div
                        onClick={() => { playLevelUpSound(); setGameTourStep(null); }}
                        style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 14px)',
                          left: '-5px',
                          right: '-5px',
                          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                          color: '#ffffff',
                          border: '2px solid #c084fc',
                          borderRadius: '12px',
                          padding: '12px 14px',
                          boxShadow: '0 14px 30px rgba(15, 23, 42, 0.45), 0 0 16px rgba(192, 132, 252, 0.35)',
                          zIndex: 60,
                          cursor: 'pointer'
                        }}
                      >
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.95rem' }}>🎮</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              HƯỚNG DẪN • BƯỚC 3/3
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setGameTourStep(null); }}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 4px', fontSize: '0.9rem', lineHeight: 1 }}
                            title="Tắt hướng dẫn"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Title */}
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#c084fc', marginBottom: '4px' }}>
                          👥 Bước 3: Điền Số Khách
                        </div>

                        {/* Description */}
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: 1.45, marginBottom: '10px' }}>
                          Nhập tổng số khách mục tiêu (VD: 150 khách). Hệ thống tự tính sĩ số TB mỗi đoàn (~pax/đoàn).
                        </div>

                        {/* Buttons */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setGameTourStep(2); }}
                            style={{
                              background: 'transparent',
                              color: '#94a3b8',
                              border: '1px solid #475569',
                              borderRadius: '6px',
                              padding: '5px 10px',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ⬅ Bước 2
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); playLevelUpSound(); setGameTourStep(null); }}
                            style={{
                              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px 12px',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 6px rgba(139, 92, 246, 0.3)'
                            }}
                          >
                            <span>🚀 Hoàn Tất & Nhập Liệu! ✕</span>
                          </button>
                        </div>

                        {/* Arrow pointing down to Số Khách */}
                        <div style={{
                          position: 'absolute',
                          bottom: '-9px',
                          left: '32px',
                          width: 0,
                          height: 0,
                          borderLeft: '8px solid transparent',
                          borderRight: '8px solid transparent',
                          borderTop: '9px solid #c084fc'
                        }}>
                          <div style={{
                            position: 'absolute',
                            bottom: '2px',
                            left: '-7px',
                            width: 0,
                            height: 0,
                            borderLeft: '7px solid transparent',
                            borderRight: '7px solid transparent',
                            borderTop: '8px solid #0f172a'
                          }} />
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#7c3aed', textTransform: 'uppercase' }}>
                        👥 BƯỚC 3: ĐIỀN SỐ KHÁCH (PAX) *
                      </label>
                      {Number(currentPlan.target_pax || 0) > 0 ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>✓ Đã điền</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 7px', borderRadius: '10px' }}>⚡ Cần điền</span>
                      )}
                    </div>
                    <input
                      type="number"
                      className="filter-input"
                      value={currentPlan.target_pax || 0}
                      disabled={isPlanLocked}
                      onChange={(e) => setCurrentPlan({ ...currentPlan, target_pax: parseInt(e.target.value, 10) || 0 })}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 800, fontSize: '1.1rem', color: '#7c3aed' }}
                    />
                    <div style={{ fontSize: '0.88rem', color: '#7c3aed', marginTop: '6px', fontWeight: 800 }}>
                      {currentPlan.target_pax || 0} Khách
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      TB ~{currentPlan.target_groups > 0 ? Math.round((currentPlan.target_pax || 0) / currentPlan.target_groups) : 0} pax/đoàn
                    </div>
                  </div>

                  {/* KPI 4: Lãi Gộp */}
                  <div style={{ background: '#ffffff', border: '1px solid #a7f3d0', borderRadius: '10px', padding: '14px', borderTop: '4px solid #059669', boxShadow: '0 1px 3px rgba(5, 150, 105, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>
                        📈 Lãi Gộp Kỳ Vọng *
                      </label>
                      {Number(currentPlan.target_gross_profit || 0) > 0 ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>✓ Đã điền</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 7px', borderRadius: '10px' }}>⚡ Cần điền</span>
                      )}
                    </div>
                    <input
                      type="text"
                      className="filter-input"
                      value={currentPlan.target_gross_profit !== '' && currentPlan.target_gross_profit !== undefined && currentPlan.target_gross_profit !== null ? fmt(currentPlan.target_gross_profit) : ''}
                      disabled={isPlanLocked}
                      placeholder="VD: 2.500.000.000"
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        const gp = raw ? parseInt(raw, 10) : '';
                        const numGp = Number(gp) || 0;
                        const rev = Number(currentPlan.target_revenue || 0);
                        const margin = rev > 0 && numGp > 0 ? Number(((numGp / rev) * 100).toFixed(1)) : (currentPlan.target_margin_pct || 0);
                        setCurrentPlan({ ...currentPlan, target_gross_profit: gp, target_margin_pct: margin });
                      }}
                      onBlur={() => {
                        if (currentPlan.target_gross_profit === '') {
                          setCurrentPlan({ ...currentPlan, target_gross_profit: 0 });
                        }
                      }}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 800, fontSize: '1.1rem', color: '#059669' }}
                    />
                    <div style={{ fontSize: '0.88rem', color: '#059669', marginTop: '6px', fontWeight: 800 }}>
                      {fmtVND(currentPlan.target_gross_profit || 0)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      Lợi nhuận gộp sau khi trừ chi phí trực tiếp tour
                    </div>
                  </div>

                  {/* KPI 5: Tỷ Suất Lãi Gộp */}
                  <div style={{ background: '#ffffff', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px', borderTop: '4px solid #f59e0b', boxShadow: '0 1px 3px rgba(245, 158, 11, 0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>
                        ⚡ Biên Lãi Kỳ Vọng (%) *
                      </label>
                      {Number(currentPlan.target_margin_pct || 0) > 0 ? (
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#16a34a', background: '#dcfce7', padding: '1px 7px', borderRadius: '10px' }}>✓ Đã điền</span>
                      ) : (
                        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#d97706', background: '#fef3c7', padding: '1px 7px', borderRadius: '10px' }}>⚡ Cần điền</span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      className="filter-input"
                      value={currentPlan.target_margin_pct !== undefined && currentPlan.target_margin_pct !== null && currentPlan.target_margin_pct !== '' ? Number(Number(currentPlan.target_margin_pct).toFixed(1)) : ''}
                      disabled={isPlanLocked}
                      placeholder="VD: 16.7"
                      onChange={(e) => {
                        const pct = parseFloat(e.target.value) || 0;
                        const rev = Number(currentPlan.target_revenue || 0);
                        const newGp = rev > 0 ? Math.round(rev * (pct / 100)) : (currentPlan.target_gross_profit || 0);
                        setCurrentPlan({ ...currentPlan, target_margin_pct: pct, target_gross_profit: newGp });
                      }}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 800, fontSize: '1.1rem', color: '#d97706' }}
                    />
                    <div style={{ fontSize: '0.88rem', color: '#d97706', marginTop: '6px', fontWeight: 800 }}>
                      {Number(currentPlan.target_margin_pct || 0).toFixed(1)}% Doanh Thu
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                      Tỷ suất lợi nhuận gộp mục tiêu toàn BU
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghi chú chiến lược */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                  Ghi Chú & Định Hướng Chiến Lược Toàn BU
                </label>
                <textarea
                  className="filter-input"
                  rows={3}
                  value={currentPlan.notes || ''}
                  disabled={isPlanLocked}
                  onChange={(e) => setCurrentPlan({ ...currentPlan, notes: e.target.value })}
                  style={{ width: '100%', marginTop: '6px', height: 'auto', padding: '10px' }}
                  placeholder="Ghi chú về định hướng thị trường, thị phần, các tuyến tour trọng điểm..."
                />
              </div>

              {!isPlanLocked && canEditCurrentBU && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <button
                    onClick={handleUpdateSetup}
                    className="btn-pro-save"
                    style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  >
                    <Save size={16} /> Lưu Thiết Lập
                  </button>
                  <button
                    onClick={async () => {
                      await handleUpdateSetup();
                      handleCompleteStage(1);
                    }}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 20px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <span>Lưu & Hoàn Thành Bước 1 ➔</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* CHẶNG 2: DANH MỤC SẢN PHẨM & ĐỊNH GIÁ (PRODUCT MASTER) */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeStage === 2 && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              {/* Header Stage 2 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>📊 Bảng Tính Giỏ Sản Phẩm & Định Giá (Unit Economics)</span>
                      <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>
                        {gridProducts.filter(p => p.name).length} Tuyến Tour
                      </span>
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: isSavingGrid ? '#0284c7' : '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {isSavingGrid ? <RefreshCw size={13} className="spin" /> : <CheckCircle2 size={13} />}
                      {isSavingGrid ? 'Đang tự động lưu...' : '✓ Tự động lưu nháp'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    💡 <b>Nhập trực tiếp vào các ô bên dưới tương tự Excel / Google Sheets</b>. Các cột có biểu tượng ⚡ tự động tính theo công thức.
                  </p>
                </div>

                {!isPlanLocked && canEditCurrentBU && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handleAddGridRow()}
                      className="btn-pro-save"
                      style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Thêm một dòng mới ở cuối bảng tính"
                    >
                      <Plus size={16} /> Thêm Dòng (Enter)
                    </button>

                    <button
                      onClick={() => setShowPasteModal(true)}
                      style={{
                        background: '#f8fafc',
                        color: '#0284c7',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '8px 14px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Dán nhanh nhiều dòng từ Google Sheet hoặc Excel"
                    >
                      <FileText size={15} /> Dán Từ Excel / Sheets
                    </button>

                    <button
                      onClick={handleDevSeedBU5}
                      style={{
                        background: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Nạp ngay 11 tour mẫu BU5 2027 chuẩn Google Sheet để tham khảo"
                    >
                      <Sparkles size={14} /> Mẫu BU5 (Google Sheet)
                    </button>

                    <button
                      onClick={handleSaveGridExplicit}
                      style={{
                        background: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Save size={15} /> Lưu Bảng Tính
                    </button>
                  </div>
                )}
              </div>

              {/* 🎮 RPG GAME TUTORIAL BOXTEXT • CHẶNG 2 */}
              {stage2TourStep && (
                <div
                  style={{
                    position: 'relative',
                    marginBottom: '18px',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                    color: '#ffffff',
                    border: stage2TourStep === 1 ? '2px solid #38bdf8' : stage2TourStep === 2 ? '2px solid #0284c7' : '2px solid #4ade80',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    boxShadow: '0 14px 30px rgba(15, 23, 42, 0.45), 0 0 20px ' + (stage2TourStep === 1 ? 'rgba(56, 189, 248, 0.3)' : stage2TourStep === 2 ? 'rgba(2, 132, 199, 0.3)' : 'rgba(74, 222, 128, 0.3)'),
                    animation: 'fadeIn 0.25s ease-out'
                  }}
                >
                  {/* Top Bar of Boxtext */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem' }}>🎮</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        HƯỚNG DẪN CHẶNG 2 • BƯỚC {stage2TourStep}/3
                      </span>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: '10px', color: '#94a3b8' }}>
                        Bảng Tính Định Giá Chuẩn Google Sheets
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStage2TourStep(null)}
                      style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0 6px', fontSize: '1.1rem', lineHeight: 1 }}
                      title="Tắt hướng dẫn"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Step 1: Điền Tên Tour */}
                  {stage2TourStep === 1 && (
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                        ✍️ Bước 1: Điền Tên Sản Phẩm / Tuyến Tour (Cột 3)
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
                        Nhập tên tour thương mại của BU bạn (Ví dụ: <i>Mông Cổ Mùa Hè 9N8Đ, Ladakh Chinh Phục Đèo Khardung La</i>).
                        <br />
                        <span style={{ color: '#facc15' }}>⌨️ Chuẩn Google Sheets:</span> Bấm <b>Enter</b> hoặc <b>mũi tên ↓</b> để di chuyển ngay xuống dòng tiếp theo. Bấm <b>Tab</b> để di chuyển ngang.
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => { playLevelUpSound(); setStage2TourStep(2); focusGridCell(0, 'price_per_pax'); }}
                          style={{
                            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '7px 16px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.4)'
                          }}
                        >
                          <span>👉 Sang Bước 2: Điền Giá Bán</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Điền Giá Bán */}
                  {stage2TourStep === 2 && (
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginBottom: '4px' }}>
                        💰 Bước 2: Điền Giá Bán Dự Kiến (VNĐ/Pax) (Cột 8)
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
                        Nhập giá bán thu từ mỗi khách (Ví dụ: <i>69.900.000</i>).
                        <br />
                        <span style={{ color: '#4ade80' }}>⚡ Tiện ích thông minh:</span> Nhấp vào ô là số được <b>bôi đen chọn sẵn</b> — bạn chỉ cần gõ ngay số mới đè lên mà không cần xóa số 0!
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => { playLevelUpSound(); setStage2TourStep(1); focusGridCell(0, 'name'); }}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            padding: '7px 12px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          ← Quay lại Bước 1
                        </button>
                        <button
                          type="button"
                          onClick={() => { playLevelUpSound(); setStage2TourStep(3); focusGridCell(0, 'variable_cost_per_pax'); }}
                          style={{
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '7px 16px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.4)'
                          }}
                        >
                          <span>👉 Sang Bước 3: Điền Biến Phí & Xem Lãi Gộp</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Điền Biến Phí */}
                  {stage2TourStep === 3 && (
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#4ade80', marginBottom: '4px' }}>
                        ⚡ Bước 3: Điền Biến Phí — Hệ Thống Tự Tính Lãi Gộp & Biên Lãi
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '12px' }}>
                        Nhập chi phí trực tiếp cho 1 pax (vé bay + land tour + visa...).
                        <br />
                        <span style={{ color: '#4ade80' }}>🎉 Công thức Excel tự động:</span> Ngay khi nhập, các cột xanh lá <b>⚡ LÃI GỘP</b>, <b>⚡ BIÊN LÃI (%)</b>, và <b>⚡ HÒA VỐN</b> sẽ tự động tính toán tức thì!
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => { playLevelUpSound(); setStage2TourStep(2); focusGridCell(0, 'price_per_pax'); }}
                          style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: '#cbd5e1',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '6px',
                            padding: '7px 12px',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          ← Quay lại Bước 2
                        </button>
                        <button
                          type="button"
                          onClick={() => { playLevelUpSound(); setStage2TourStep(null); }}
                          style={{
                            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '7px 18px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.4)'
                          }}
                        >
                          <span>🎉 Hoàn Tất Hướng Dẫn! Bắt đầu nhập bảng tính</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mũi tên chỉ xuống thẳng cột mục tiêu */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-9px',
                      left: stage2TourStep === 1 ? '180px' : stage2TourStep === 2 ? '62%' : '76%',
                      transform: 'rotate(45deg)',
                      width: '18px',
                      height: '18px',
                      background: '#1e293b',
                      borderRight: stage2TourStep === 1 ? '2px solid #38bdf8' : stage2TourStep === 2 ? '2px solid #0284c7' : '2px solid #4ade80',
                      borderBottom: stage2TourStep === 1 ? '2px solid #38bdf8' : stage2TourStep === 2 ? '2px solid #0284c7' : '2px solid #4ade80',
                      transition: 'all 0.3s ease'
                    }}
                  />
                </div>
              )}

              {/* Bảng Tính Sản Phẩm Grid (Excel Spreadsheet Mode) */}
              <div className="data-table-container" style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                <table className="excel-spreadsheet-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ background: '#0f172a', color: '#f8fafc' }}>
                      <th style={{ width: '38px', textAlign: 'center', padding: '10px 4px', borderRight: '1px solid #334155' }}>#</th>
                      <th style={{ width: '105px', padding: '10px 8px', borderRight: '1px solid #334155' }} title="Mã định danh sản phẩm theo BU (VD: BU1-SP-01)">MÃ SP</th>
                      <th
                        style={{
                          minWidth: '220px',
                          padding: '10px 8px',
                          borderRight: '1px solid #334155',
                          background: stage2TourStep === 1 ? '#0284c7' : '#0f172a',
                          color: '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        title="Bấm vào ô để gõ tên tour trực tiếp như Excel (VD: Lệ Giang - Shangrila 6N5Đ)"
                      >
                        SẢN PHẨM / TUYẾN TOUR ✍️
                      </th>
                      <th style={{ width: '130px', padding: '10px 6px', borderRight: '1px solid #334155' }} title="Phân loại: Tuyến trụ cột / Khám phá độc bản / Tuyến mới">NHÓM SP ℹ️</th>
                      <th style={{ width: '105px', padding: '10px 6px', borderRight: '1px solid #334155', textAlign: 'center' }} title="Mức độ ưu tiên dồn lực quảng bá: Cao / Trung bình / Thấp">ƯU TIÊN</th>
                      <th style={{ width: '110px', padding: '10px 6px', borderRight: '1px solid #334155', textAlign: 'center' }} title="Trạng thái triển khai sản phẩm: Đang bán / Chuẩn bị / Nghiên cứu">GIAI ĐOẠN</th>
                      <th style={{ width: '75px', padding: '10px 6px', borderRight: '1px solid #334155', textAlign: 'right' }} title="Quy mô khách dự kiến mỗi đoàn (mặc định 10 pax)">PAX/ĐOÀN</th>
                      <th
                        style={{
                          width: '115px',
                          padding: '10px 6px',
                          borderRight: '1px solid #334155',
                          textAlign: 'right',
                          background: stage2TourStep === 2 ? '#0284c7' : '#1e293b',
                          color: '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        title="Giá bán thu từ mỗi khách (VNĐ - nhập số tự động format chấm hàng ngàn)"
                      >
                        GIÁ BÁN (₫) ℹ️
                      </th>
                      <th
                        style={{
                          width: '115px',
                          padding: '10px 6px',
                          borderRight: '1px solid #334155',
                          textAlign: 'right',
                          background: stage2TourStep === 3 ? '#059669' : '#1e293b',
                          color: '#ffffff',
                          transition: 'all 0.2s ease'
                        }}
                        title="Biến phí trực tiếp cho 1 pax (vé bay, land tour, visa, bảo hiểm...)"
                      >
                        BIẾN PHÍ (₫) ℹ️
                      </th>
                      <th
                        style={{
                          width: '115px',
                          padding: '10px 6px',
                          borderRight: '1px solid #334155',
                          textAlign: 'right',
                          background: stage2TourStep === 3 ? '#047857' : '#064e3b',
                          color: '#6ee7b7',
                          transition: 'all 0.2s ease'
                        }}
                        title="⚡ Công thức tự động: Giá Bán - Biến Phí"
                      >
                        ⚡ LÃI GỘP / PAX
                      </th>
                      <th
                        style={{
                          width: '90px',
                          padding: '10px 6px',
                          borderRight: '1px solid #334155',
                          textAlign: 'center',
                          background: stage2TourStep === 3 ? '#047857' : '#064e3b',
                          color: '#6ee7b7',
                          transition: 'all 0.2s ease'
                        }}
                        title="⚡ Công thức tự động: (Lãi Gộp / Giá Bán) x 100%"
                      >
                        ⚡ BIÊN LÃI
                      </th>
                      <th style={{ width: '85px', padding: '10px 6px', borderRight: '1px solid #334155', textAlign: 'center', background: '#1e293b' }} title="⚡ Số pax tối thiểu để bù đắp định phí mỗi đoàn">⚡ HÒA VỐN</th>
                      <th style={{ width: '90px', padding: '10px 4px', textAlign: 'center' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridProducts.map((p, idx) => {
                      const isEven = idx % 2 === 0;
                      const gp = Number(p.gross_profit_per_pax) || (Number(p.price_per_pax) - Number(p.variable_cost_per_pax)) || 0;
                      const margin = Number(p.price_per_pax) > 0 ? Number(((gp / Number(p.price_per_pax)) * 100).toFixed(1)) : 0;
                      const breakEven = gp > 0 ? Math.ceil(Number(p.fixed_cost_per_group || 0) / gp) : 0;

                      return (
                        <tr key={p.id || idx} style={{ background: isEven ? '#ffffff' : '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          {/* Row Number */}
                          <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600, borderRight: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                            {idx + 1}
                          </td>

                          {/* Mã SP */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0' }}>
                            <input
                              id={`grid-cell-${idx}-product_code`}
                              type="text"
                              value={p.product_code || ''}
                              disabled={isPlanLocked}
                              onChange={(e) => handleGridCellChange(idx, 'product_code', e.target.value)}
                              onFocus={(e) => {
                                e.target.select();
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.2)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.boxShadow = 'none';
                              }}
                              onKeyDown={(e) => handleGridKeyDown(e, idx, 'product_code')}
                              placeholder={`${selectedBU}-SP-0${idx + 1}`}
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontWeight: 700,
                                color: '#0284c7',
                                background: '#ffffff',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                              }}
                            />
                          </td>

                          {/* Tên SP / Tuyến Tour */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0' }}>
                            <input
                              id={`grid-cell-${idx}-name`}
                              type="text"
                              value={p.name || ''}
                              disabled={isPlanLocked}
                              onChange={(e) => handleGridCellChange(idx, 'name', e.target.value)}
                              onFocus={(e) => {
                                e.target.select();
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.25)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = (stage2TourStep === 1 && idx === 0) ? '#38bdf8' : '#e2e8f0';
                                e.target.style.boxShadow = (stage2TourStep === 1 && idx === 0) ? '0 0 0 3px rgba(56, 189, 248, 0.35)' : 'none';
                              }}
                              onKeyDown={(e) => handleGridKeyDown(e, idx, 'name')}
                              placeholder="Nhập tên tuyến tour (VD: Mông Cổ Mùa Hè: Thảo Nguyên & Sa Mạc)..."
                              style={{
                                width: '100%',
                                padding: '5px 8px',
                                border: (stage2TourStep === 1 && idx === 0) ? '2px solid #38bdf8' : '1px solid #cbd5e1',
                                boxShadow: (stage2TourStep === 1 && idx === 0) ? '0 0 0 3px rgba(56, 189, 248, 0.35)' : 'none',
                                borderRadius: '4px',
                                fontWeight: 700,
                                color: '#0f172a',
                                background: (stage2TourStep === 1 && idx === 0) ? '#f0f9ff' : '#ffffff',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                              }}
                            />
                          </td>

                          {/* Nhóm SP */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0' }}>
                            <select
                              id={`grid-cell-${idx}-group_type`}
                              value={p.group_type || 'Tuyến trụ cột'}
                              disabled={isPlanLocked}
                              onChange={(e) => handleGridCellChange(idx, 'group_type', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '5px 4px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                fontWeight: 600,
                                color: '#334155',
                                background: '#ffffff',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Tuyến trụ cột">Tuyến trụ cột (Flagship)</option>
                              <option value="Khám phá độc bản">Khám phá độc bản</option>
                              <option value="Tuyến mới / Tiềm năng">Tuyến mới / Tiềm năng</option>
                              <option value="MICE Doanh nghiệp">MICE Doanh nghiệp</option>
                            </select>
                          </td>

                          {/* Mức Ưu Tiên */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <select
                              id={`grid-cell-${idx}-priority`}
                              value={p.priority || 'Cao'}
                              disabled={isPlanLocked}
                              onChange={(e) => handleGridCellChange(idx, 'priority', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 6px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                textAlign: 'center',
                                background: p.priority === 'Cao' || p.priority === 'P1' ? '#fee2e2' : p.priority === 'Trung bình' || p.priority === 'P2' ? '#fef3c7' : '#f1f5f9',
                                color: p.priority === 'Cao' || p.priority === 'P1' ? '#dc2626' : p.priority === 'Trung bình' || p.priority === 'P2' ? '#d97706' : '#475569',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            >
                              <option value="Cao">P1 (Cao)</option>
                              <option value="Trung bình">P2 (Trung bình)</option>
                              <option value="Thấp">P3 (Thấp)</option>
                            </select>
                          </td>

                          {/* Giai Đoạn */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <select
                              id={`grid-cell-${idx}-stage`}
                              value={p.stage || 'Đang bán'}
                              disabled={isPlanLocked}
                              onChange={(e) => handleGridCellChange(idx, 'stage', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '4px 4px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                background: '#ffffff',
                                color: '#334155',
                                outline: 'none',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Đang bán">Đang bán</option>
                              <option value="Chuẩn bị">Chuẩn bị</option>
                              <option value="Nghiên cứu">Nghiên cứu</option>
                              <option value="Đóng sổ">Đóng sổ</option>
                            </select>
                          </td>

                          {/* Pax / Đoàn */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0' }}>
                            <input
                              id={`grid-cell-${idx}-target_pax_per_group`}
                              type="number"
                              min="1"
                              max="100"
                              value={p.target_pax_per_group || 10}
                              disabled={isPlanLocked}
                              onChange={(e) => handleGridCellChange(idx, 'target_pax_per_group', parseInt(e.target.value) || 1)}
                              onFocus={(e) => {
                                e.target.select();
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.2)';
                              }}
                              onBlur={(e) => {
                                e.target.style.borderColor = '#cbd5e1';
                                e.target.style.boxShadow = 'none';
                              }}
                              onKeyDown={(e) => handleGridKeyDown(e, idx, 'target_pax_per_group')}
                              style={{
                                width: '100%',
                                padding: '5px 6px',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                textAlign: 'right',
                                fontWeight: 600,
                                background: '#ffffff',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                              }}
                            />
                          </td>

                          {/* Giá Bán */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0', background: stage2TourStep === 2 && idx === 0 ? '#f0f9ff' : '#fafafa' }}>
                            <input
                              id={`grid-cell-${idx}-price_per_pax`}
                              type="text"
                              value={p.price_per_pax === '' ? '' : (p.price_per_pax === 0 ? '0' : fmt(p.price_per_pax || 0))}
                              disabled={isPlanLocked}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                handleGridCellChange(idx, 'price_per_pax', raw === '' ? '' : parseInt(raw, 10));
                              }}
                              onFocus={(e) => {
                                e.target.select();
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.25)';
                              }}
                              onBlur={(e) => {
                                if (p.price_per_pax === '' || p.price_per_pax === undefined) {
                                  handleGridCellChange(idx, 'price_per_pax', 0);
                                }
                                e.target.style.borderColor = (stage2TourStep === 2 && idx === 0) ? '#0284c7' : '#cbd5e1';
                                e.target.style.boxShadow = (stage2TourStep === 2 && idx === 0) ? '0 0 0 3px rgba(2, 132, 199, 0.35)' : 'none';
                              }}
                              onKeyDown={(e) => handleGridKeyDown(e, idx, 'price_per_pax')}
                              placeholder="0"
                              style={{
                                width: '100%',
                                padding: '5px 6px',
                                border: (stage2TourStep === 2 && idx === 0) ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                boxShadow: (stage2TourStep === 2 && idx === 0) ? '0 0 0 3px rgba(2, 132, 199, 0.35)' : 'none',
                                borderRadius: '4px',
                                textAlign: 'right',
                                fontWeight: 800,
                                color: '#0f172a',
                                background: (stage2TourStep === 2 && idx === 0) ? '#f0f9ff' : '#ffffff',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                              }}
                            />
                          </td>

                          {/* Biến Phí */}
                          <td style={{ padding: '3px 4px', borderRight: '1px solid #e2e8f0', background: stage2TourStep === 3 && idx === 0 ? '#f0fdf4' : '#fafafa' }}>
                            <input
                              id={`grid-cell-${idx}-variable_cost_per_pax`}
                              type="text"
                              value={p.variable_cost_per_pax === '' ? '' : (p.variable_cost_per_pax === 0 ? '0' : fmt(p.variable_cost_per_pax || 0))}
                              disabled={isPlanLocked}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/\D/g, '');
                                handleGridCellChange(idx, 'variable_cost_per_pax', raw === '' ? '' : parseInt(raw, 10));
                              }}
                              onFocus={(e) => {
                                e.target.select();
                                e.target.style.borderColor = '#2563eb';
                                e.target.style.boxShadow = '0 0 0 2px rgba(37, 99, 235, 0.25)';
                              }}
                              onBlur={(e) => {
                                if (p.variable_cost_per_pax === '' || p.variable_cost_per_pax === undefined) {
                                  handleGridCellChange(idx, 'variable_cost_per_pax', 0);
                                }
                                e.target.style.borderColor = (stage2TourStep === 3 && idx === 0) ? '#16a34a' : '#cbd5e1';
                                e.target.style.boxShadow = (stage2TourStep === 3 && idx === 0) ? '0 0 0 3px rgba(22, 163, 74, 0.35)' : 'none';
                              }}
                              onKeyDown={(e) => handleGridKeyDown(e, idx, 'variable_cost_per_pax')}
                              placeholder="0"
                              style={{
                                width: '100%',
                                padding: '5px 6px',
                                border: (stage2TourStep === 3 && idx === 0) ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                boxShadow: (stage2TourStep === 3 && idx === 0) ? '0 0 0 3px rgba(22, 163, 74, 0.35)' : 'none',
                                borderRadius: '4px',
                                textAlign: 'right',
                                fontWeight: 700,
                                color: '#475569',
                                background: (stage2TourStep === 3 && idx === 0) ? '#f0fdf4' : '#ffffff',
                                outline: 'none',
                                transition: 'all 0.15s ease'
                              }}
                            />
                          </td>

                          {/* ⚡ CÔNG THỨC: Lãi Gộp / Pax */}
                          <td style={{
                            padding: '5px 8px',
                            textAlign: 'right',
                            fontWeight: 800,
                            color: '#16a34a',
                            background: stage2TourStep === 3 && idx === 0 ? '#dcfce7' : '#f0fdf4',
                            borderRight: '1px solid #e2e8f0',
                            border: stage2TourStep === 3 && idx === 0 ? '2px solid #16a34a' : '1px solid #e2e8f0',
                            boxShadow: stage2TourStep === 3 && idx === 0 ? '0 0 0 3px rgba(22, 163, 74, 0.3)' : 'none',
                            transition: 'all 0.2s ease'
                          }}>
                            {fmt(gp)}
                          </td>

                          {/* ⚡ CÔNG THỨC: Biên Lãi % */}
                          <td style={{
                            padding: '5px 6px',
                            textAlign: 'center',
                            borderRight: '1px solid #e2e8f0',
                            background: stage2TourStep === 3 && idx === 0 ? '#dcfce7' : '#f0fdf4'
                          }}>
                            <span style={{
                              fontWeight: 800,
                              fontSize: '0.78rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              color: margin >= 15 ? '#15803d' : margin >= 10 ? '#b45309' : '#b91c1c',
                              background: margin >= 15 ? '#dcfce7' : margin >= 10 ? '#fef3c7' : '#fee2e2'
                            }}>
                              {margin}%
                            </span>
                          </td>

                          {/* ⚡ CÔNG THỨC: Hòa Vốn */}
                          <td style={{ padding: '5px 6px', textAlign: 'center', color: '#475569', fontWeight: 600, borderRight: '1px solid #e2e8f0' }}>
                            {breakEven} pax
                          </td>

                          {/* Thao Tác */}
                          <td style={{ padding: '3px 4px', textAlign: 'center' }}>
                            {!isPlanLocked && canEditCurrentBU && (
                              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => handleAddGridRow(idx)}
                                  className="btn-action"
                                  style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '3px 6px', borderRadius: '4px' }}
                                  title="Thêm dòng dưới"
                                >
                                  <Plus size={13} />
                                </button>
                                <button
                                  onClick={() => handleDuplicateGridRow(idx)}
                                  className="btn-action"
                                  style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '3px 6px', borderRadius: '4px' }}
                                  title="Nhân bản dòng này"
                                >
                                  <Layers size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteGridRow(idx)}
                                  className="btn-action"
                                  style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', padding: '3px 6px', borderRadius: '4px' }}
                                  title="Xóa dòng"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Dưới bảng: Quick add & Excel Guide */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleAddGridRow()}
                    style={{
                      background: '#f8fafc',
                      color: '#0284c7',
                      border: '1px dashed #0284c7',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Plus size={15} /> Thêm Dòng Sản Phẩm Mới (Enter)
                  </button>
                  <button
                    onClick={() => setShowPasteModal(true)}
                    style={{
                      background: '#f8fafc',
                      color: '#475569',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '8px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FileText size={15} /> Dán Từ Excel / Google Sheets
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setActiveStage(1)}
                    className="btn-pro-cancel"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <ChevronLeft size={15} /> Quay lại Thiết lập
                  </button>
                  <button
                    onClick={async () => {
                      await handleSaveGridExplicit();
                      handleCompleteStage(2);
                    }}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 18px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <span>Lưu Bảng Tính & Sang Chặng 3 ➔</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* CHẶNG 3: LỊCH ĐOÀN KHỞI HÀNH (DEPARTURES SCHEDULE) */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeStage === 3 && (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                    Kế Hoạch Lịch Đoàn Khởi Hành ({planDetail.departures?.length || 0} Đợt • {planDetail.summary.total_groups} Đoàn)
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                    Thêm các đợt khởi hành cho từng sản phẩm. Giá bán và biến phí được tự động ánh xạ từ Danh mục sản phẩm.
                  </p>
                </div>

                {!isPlanLocked && canEditCurrentBU && (
                  <button
                    onClick={() => handleOpenAddDeparture()}
                    className="btn-pro-save"
                    style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                  >
                    <Plus size={16} /> Thêm Đợt Khởi Hành
                  </button>
                )}
              </div>

              {/* Bảng Đợt Khởi Hành */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: '105px' }}>MÃ ĐỢT</th>
                      <th style={{ width: '90px' }}>THÁNG KH</th>
                      <th>SẢN PHẨM</th>
                      <th style={{ textAlign: 'center' }}>SỐ ĐOÀN</th>
                      <th style={{ textAlign: 'right' }}>KHÁCH/ĐOÀN</th>
                      <th style={{ textAlign: 'right' }}>TỔNG KHÁCH</th>
                      <th style={{ textAlign: 'right' }}>GIÁ/PAX</th>
                      <th style={{ textAlign: 'right' }}>DOANH THU KẾ HOẠCH</th>
                      <th style={{ textAlign: 'right' }}>LÃI GỘP KẾ HOẠCH</th>
                      <th style={{ textAlign: 'center' }}>TRẠNG THÁI</th>
                      <th style={{ textAlign: 'center' }}>THAO TÁC</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planDetail.departures.length === 0 ? (
                      <tr>
                        <td colSpan="11" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                          Chưa có đợt khởi hành nào. Nhấp "+ Thêm Đợt Khởi Hành" để lên lịch!
                        </td>
                      </tr>
                    ) : (
                      planDetail.departures.map(d => (
                        <tr key={d.id}>
                          <td style={{ fontWeight: 700, color: '#0284c7' }}>{d.departure_code}</td>
                          <td>
                            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '0.75rem' }}>
                              Tháng {d.month}
                            </span>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.product_name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Mã: {d.product_code}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: '#0284c7' }}>{d.groups_count} đoàn</td>
                          <td style={{ textAlign: 'right' }}>{d.pax_per_group}p</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{d.total_pax} pax</td>
                          <td style={{ textAlign: 'right', color: '#64748b' }}>{fmt(d.price_per_pax)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmt(d.total_revenue)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmt(d.total_gross_profit)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ fontSize: '0.72rem', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                              {d.sales_status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {!isPlanLocked && canEditCurrentBU && (
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button
                                  className="btn-action btn-edit-pro"
                                  onClick={() => handleOpenEditDeparture(d)}
                                  title="Sửa đợt"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  className="btn-action btn-delete-pro"
                                  onClick={() => handleDeleteDeparture(d.id, d.departure_code)}
                                  title="Xóa đợt"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                <button
                  onClick={() => setActiveStage(2)}
                  className="btn-pro-cancel"
                  style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                >
                  <ChevronLeft size={15} /> Quay lại Sản phẩm
                </button>
                <button
                  onClick={() => handleCompleteStage(3)}
                  style={{
                    background: '#16a34a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                  }}
                >
                  <span>Hoàn Thành Bước 3 & Sang Chặng 4 ➔</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* CHẶNG 4: MA TRẬN 12 THÁNG & DÒNG TIỀN MARKETING */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeStage === 4 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* PHẦN A: MA TRẬN KHỞI HÀNH 12 THÁNG */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                      Ma Trận Khởi Hành 12 Tháng Năm {selectedYear}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      Số trong mỗi ô = số đoàn khởi hành. Lưới tự động cập nhật ngay khi bạn thêm, sửa hoặc xóa đợt khởi hành ở Chặng 3. Bạn cũng có thể click trực tiếp vào ô tháng để xem hoặc thêm nhanh đợt khởi hành.
                    </p>
                  </div>
                </div>

                <div className="data-table-container" style={{ overflowX: 'auto' }}>
                  <table className="data-table" style={{ fontSize: '0.82rem' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '85px' }}>MÃ SP</th>
                        <th style={{ minWidth: '180px' }}>SẢN PHẨM</th>
                        <th style={{ width: '80px', textAlign: 'center' }}>ƯU TIÊN</th>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                          <th key={m} style={{ width: '45px', textAlign: 'center', background: '#f8fafc' }}>
                            T{m}
                          </th>
                        ))}
                        <th style={{ width: '75px', textAlign: 'center', background: '#e0f2fe', color: '#0369a1' }}>CẢ NĂM</th>
                        <th style={{ minWidth: '110px', textAlign: 'right' }}>DOANH THU</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planDetail.matrix.map(m => (
                        <tr key={m.product_id}>
                          <td style={{ fontWeight: 700, color: '#0284c7' }}>{m.product_code}</td>
                          <td style={{ fontWeight: 600, color: '#0f172a' }}>{m.name}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              padding: '1px 6px',
                              borderRadius: '10px',
                              background: getPriorityBadge(m.priority).bg,
                              color: getPriorityBadge(m.priority).text
                            }}>
                              {m.priority}
                            </span>
                          </td>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mon => {
                            const count = m.months[mon] || 0;
                            return (
                              <td
                                key={mon}
                                style={{
                                  textAlign: 'center',
                                  padding: '2px',
                                  borderRight: '1px solid #e2e8f0',
                                  background: count >= 3 ? 'rgba(2, 132, 199, 0.12)' : count > 0 ? 'rgba(56, 189, 248, 0.08)' : 'transparent'
                                }}
                              >
                                <input
                                  type="number"
                                  min="0"
                                  max="30"
                                  defaultValue={count > 0 ? count : ''}
                                  placeholder="·"
                                  disabled={isPlanLocked}
                                  onBlur={(e) => {
                                    const val = parseInt(e.target.value, 10) || 0;
                                    if (val !== count) {
                                      handleMatrixCellChange(m.product_id, mon, val);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                    }
                                  }}
                                  style={{
                                    width: '36px',
                                    height: '30px',
                                    textAlign: 'center',
                                    fontWeight: count > 0 ? 800 : 500,
                                    fontSize: '0.82rem',
                                    color: count > 0 ? '#0284c7' : '#94a3b8',
                                    background: count > 0 ? '#e0f2fe' : 'transparent',
                                    border: count > 0 ? '1px solid #7dd3fc' : '1px solid transparent',
                                    borderRadius: '4px',
                                    outline: 'none',
                                    cursor: 'pointer'
                                  }}
                                  onFocus={(e) => { e.target.style.background = '#ffffff'; e.target.style.border = '1px solid #0284c7'; }}
                                  title={`Gõ số đoàn tháng ${mon} cho ${m.name} (Enter hoặc click ra ngoài để lưu)`}
                                />
                              </td>
                            );
                          })}
                          <td style={{ textAlign: 'center', fontWeight: 800, background: '#f0f9ff', color: '#0284c7' }}>
                            {m.total_groups}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>
                            {fmtVND(m.total_revenue)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                        <td colSpan="3" style={{ textAlign: 'right', textTransform: 'uppercase' }}>TỔNG CỘNG ĐOÀN KHỞI HÀNH:</td>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(mon => {
                          const totalMonth = planDetail.matrix.reduce((acc, m) => acc + (m.months[mon] || 0), 0);
                          return (
                            <td key={mon} style={{ textAlign: 'center', color: totalMonth > 0 ? '#0284c7' : '#94a3b8' }}>
                              {totalMonth}
                            </td>
                          );
                        })}
                        <td style={{ textAlign: 'center', background: '#0284c7', color: '#ffffff' }}>
                          {planDetail.summary.total_groups}
                        </td>
                        <td style={{ textAlign: 'right', color: '#16a34a' }}>
                          {fmtVND(planDetail.summary.total_revenue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* PHẦN B: BẢNG DÒNG TIỀN VÀ NGÂN SÁCH MARKETING THEO THÁNG */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                      Phân Bổ Ngân Sách Marketing & Dòng Tiền 12 Tháng
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      Đối soát nhịp chi tiêu Marketing với doanh thu khởi hành thực tế. Định mức chuẩn: {((currentPlan.mkt_budget_quota || 0.01) * 100).toFixed(2)}% Doanh thu.
                    </p>
                  </div>

                  {/* Tỷ lệ sử dụng ngân sách */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    textAlign: 'right'
                  }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Tỷ Lệ MKT / Doanh Thu Kế Hoạch</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                      {planDetail.summary.mkt_ratio_actual}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                      Ngân sách: {fmtVND(planDetail.summary.mkt_budget_total)} / DT {fmtVND(planDetail.summary.total_revenue)}
                    </div>
                  </div>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>THÁNG</th>
                        <th style={{ textAlign: 'center' }}>SỐ ĐOÀN</th>
                        <th style={{ textAlign: 'right' }}>KHÁCH KẾ HOẠCH</th>
                        <th style={{ textAlign: 'right' }}>DOANH THU KẾ HOẠCH</th>
                        <th style={{ textAlign: 'right' }}>LÃI GỘP KẾ HOẠCH</th>
                        <th style={{ textAlign: 'right' }}>NGÂN SÁCH MKT ĐỊNH MỨC (1%)</th>
                        <th style={{ textAlign: 'center' }}>TỶ LỆ CHI/DT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planDetail.monthly_cashflow.map(m => (
                        <tr key={m.month}>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{m.month_label}</td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>{m.groups_count} đoàn</td>
                          <td style={{ textAlign: 'right' }}>{m.pax_count} pax</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{fmtVND(m.revenue)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>{fmtVND(m.gross_profit)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 600, color: '#0284c7' }}>{fmtVND(m.mkt_budget_planned)}</td>
                          <td style={{ textAlign: 'center', color: '#64748b' }}>{m.mkt_ratio}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr style={{ background: '#f8fafc', fontWeight: 800 }}>
                        <td>TỔNG CỘNG 12 THÁNG:</td>
                        <td style={{ textAlign: 'center' }}>{planDetail.summary.total_groups} đoàn</td>
                        <td style={{ textAlign: 'right' }}>{planDetail.summary.total_pax} pax</td>
                        <td style={{ textAlign: 'right', color: '#0f172a' }}>{fmtVND(planDetail.summary.total_revenue)}</td>
                        <td style={{ textAlign: 'right', color: '#16a34a' }}>{fmtVND(planDetail.summary.total_gross_profit)}</td>
                        <td style={{ textAlign: 'right', color: '#0284c7' }}>{fmtVND(planDetail.summary.mkt_budget_required_1pct)}</td>
                        <td style={{ textAlign: 'center', color: '#10b981' }}>{planDetail.summary.mkt_ratio_actual}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                  <button
                    onClick={() => setActiveStage(3)}
                    className="btn-pro-cancel"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <ChevronLeft size={15} /> Quay lại Lịch đoàn
                  </button>
                  <button
                    onClick={() => handleCompleteStage(4)}
                    style={{
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 18px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <span>Hoàn Thành Bước 4 & Sang Chặng 5 ➔</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* CHẶNG 5: TIẾN ĐỘ TRIỂN KHAI & BÁO CÁO ĐIỀU HÀNH */}
          {/* ══════════════════════════════════════════════════════════════ */}
          {activeStage === 5 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* PHẦN A: BẢNG ĐỐI SOÁT CHỈ TIÊU (MỤC TIÊU BƯỚC 1 VS KẾ HOẠCH SẢN PHẨM THỰC TẾ) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🎯 Bảng Đối Soát: Mục Tiêu Chỉ Tiêu vs Kế Hoạch Sản Phẩm Thực Tế</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd' }}>
                        BU1 • NĂM {selectedYear}
                      </span>
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      Đối chiếu trực tiếp giữa Chỉ tiêu mục tiêu BUM xác lập ở Bước 1 và Tổng thực tế lập được từ Giỏ sản phẩm & Lịch khởi hành.
                    </p>
                  </div>
                </div>

                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>CHỈ SỐ ĐỐI SOÁT</th>
                        <th style={{ textAlign: 'right' }}>MỤC TIÊU BƯỚC 1 (TARGET)</th>
                        <th style={{ textAlign: 'right' }}>KẾ HOẠCH LẬP ĐƯỢC (ACTUAL)</th>
                        <th style={{ textAlign: 'center' }}>ĐỘ LỆCH (DIFF)</th>
                        <th style={{ textAlign: 'center' }}>TỶ LỆ ĐẠT</th>
                        <th style={{ textAlign: 'center' }}>ĐÁNH GIÁ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Doanh thu */}
                      {(() => {
                        const targetRev = Number(currentPlan.target_revenue || 0);
                        const actualRev = Number(planDetail.summary.total_revenue || 0);
                        const diffRev = actualRev - targetRev;
                        const pctRev = targetRev > 0 ? ((actualRev / targetRev) * 100).toFixed(1) : '100.0';
                        const isOkRev = actualRev >= targetRev;
                        return (
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>💰 Tổng Doanh Thu (VNĐ)</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#64748b' }}>{fmtVND(targetRev)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#0284c7' }}>{fmtVND(actualRev)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: diffRev >= 0 ? '#16a34a' : '#ef4444' }}>
                              {diffRev >= 0 ? `+${fmtVND(diffRev)}` : `-${fmtVND(Math.abs(diffRev))}`}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: isOkRev ? '#16a34a' : '#f59e0b' }}>
                              {pctRev}%
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: isOkRev ? '#ecfdf5' : '#fef3c7', color: isOkRev ? '#059669' : '#b45309' }}>
                                {isOkRev ? 'Đạt Mục Tiêu' : 'Cần Bổ Sung Tour'}
                              </span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Số đoàn */}
                      {(() => {
                        const targetG = parseInt(currentPlan.target_groups || 0, 10);
                        const actualG = parseInt(planDetail.summary.total_groups || 0, 10);
                        const diffG = actualG - targetG;
                        const pctG = targetG > 0 ? ((actualG / targetG) * 100).toFixed(1) : '100.0';
                        const isOkG = actualG >= targetG;
                        return (
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>🚩 Số Đoàn Khởi Hành</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#64748b' }}>{targetG} đoàn</td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#16a34a' }}>{actualG} đoàn</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: diffG >= 0 ? '#16a34a' : '#ef4444' }}>
                              {diffG >= 0 ? `+${diffG} đoàn` : `${diffG} đoàn`}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: isOkG ? '#16a34a' : '#f59e0b' }}>
                              {pctG}%
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: isOkG ? '#ecfdf5' : '#fef3c7', color: isOkG ? '#059669' : '#b45309' }}>
                                {isOkG ? 'Đạt Số Đoàn' : 'Thiếu Đợt Chạy'}
                              </span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Số khách */}
                      {(() => {
                        const targetP = parseInt(currentPlan.target_pax || 0, 10);
                        const actualP = parseInt(planDetail.summary.total_pax || 0, 10);
                        const diffP = actualP - targetP;
                        const pctP = targetP > 0 ? ((actualP / targetP) * 100).toFixed(1) : '100.0';
                        const isOkP = actualP >= targetP;
                        return (
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>👥 Tổng Số Khách (Pax)</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#64748b' }}>{targetP} khách</td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#8b5cf6' }}>{actualP} khách</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: diffP >= 0 ? '#16a34a' : '#ef4444' }}>
                              {diffP >= 0 ? `+${diffP} pax` : `${diffP} pax`}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: isOkP ? '#16a34a' : '#f59e0b' }}>
                              {pctP}%
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: isOkP ? '#ecfdf5' : '#fef3c7', color: isOkP ? '#059669' : '#b45309' }}>
                                {isOkP ? 'Đủ Quy Mô' : 'Cần Tăng Chỗ'}
                              </span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Lãi gộp */}
                      {(() => {
                        const targetGP = Number(currentPlan.target_gross_profit || 0);
                        const actualGP = Number(planDetail.summary.total_gross_profit || 0);
                        const diffGP = actualGP - targetGP;
                        const pctGP = targetGP > 0 ? ((actualGP / targetGP) * 100).toFixed(1) : '100.0';
                        const isOkGP = actualGP >= targetGP;
                        return (
                          <tr>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>📈 Lợi Nhuận Gộp (VNĐ)</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#64748b' }}>{fmtVND(targetGP)}</td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#059669' }}>{fmtVND(actualGP)}</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: diffGP >= 0 ? '#16a34a' : '#ef4444' }}>
                              {diffGP >= 0 ? `+${fmtVND(diffGP)}` : `-${fmtVND(Math.abs(diffGP))}`}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: isOkGP ? '#16a34a' : '#f59e0b' }}>
                              {pctGP}%
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: isOkGP ? '#ecfdf5' : '#fef3c7', color: isOkGP ? '#059669' : '#b45309' }}>
                                {isOkGP ? 'Hiệu Quả Cao' : 'Cần Tối Ưu Phí'}
                              </span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Tỷ suất biên lãi gộp */}
                      {(() => {
                        const targetM = Number(currentPlan.target_margin_pct || 0);
                        const actualM = Number(planDetail.summary.gross_margin_pct || 0);
                        const isOkM = actualM >= targetM;
                        return (
                          <tr style={{ background: '#f8fafc' }}>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>⚡ Biên Lãi Gộp TB (%)</td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#64748b' }}>{targetM}%</td>
                            <td style={{ textAlign: 'right', fontWeight: 800, color: '#d97706' }}>{actualM}%</td>
                            <td style={{ textAlign: 'center', fontWeight: 700, color: (actualM - targetM) >= 0 ? '#16a34a' : '#ef4444' }}>
                              {(actualM - targetM) >= 0 ? `+${(actualM - targetM).toFixed(1)}%` : `${(actualM - targetM).toFixed(1)}%`}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 800, color: isOkM ? '#16a34a' : '#f59e0b' }}>
                              {targetM > 0 ? `${((actualM / targetM) * 100).toFixed(0)}%` : '100%'}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: isOkM ? '#ecfdf5' : '#fef3c7', color: isOkM ? '#059669' : '#b45309' }}>
                                {isOkM ? 'Biên Chuẩn' : 'Biên Thấp'}
                              </span>
                            </td>
                          </tr>
                        );
                      })()}

                      {/* Hạn mức MKT 1% phục vụ khai thác */}
                      <tr style={{ background: '#f0fdf4' }}>
                        <td style={{ fontWeight: 700, color: '#166534' }}>📢 Ngân Sách MKT Phục Vụ Khai Thác (1% DT)</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
                          {fmtVND(Math.round(Number(currentPlan.target_revenue || 0) * 0.0100))}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: 800, color: '#166534' }}>
                          {fmtVND(Math.round(Number(planDetail.summary.total_revenue || 0) * 0.0100))}
                        </td>
                        <td colSpan="3" style={{ textAlign: 'center', fontSize: '0.78rem', color: '#15803d', fontStyle: 'italic' }}>
                          Hạn mức tự động trích 1.00% cho Marketing khai thác chiến dịch
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PHẦN B: TÓM TẮT CHỈ SỐ NHANH */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '14px'
              }}>
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Tổng Đoàn Kế Hoạch</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                    {planDetail.summary.total_groups} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>Đoàn</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    Quy mô khách: {planDetail.summary.total_pax} Pax
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Doanh Thu Kế Hoạch</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
                    {fmt(planDetail.summary.total_revenue)} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>₫</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '2px', fontWeight: 600 }}>
                    Lãi gộp: {fmt(planDetail.summary.total_gross_profit)} ₫
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Biên Lãi Gộp Thực Tế</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    {planDetail.summary.gross_margin_pct}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {planDetail.products.length} tuyến trong danh mục
                  </div>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Ngân Sách MKT Khai Thác (1%)</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    1.00%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {fmt(Math.round(Number(planDetail.summary.total_revenue || 0) * 0.0100))} ₫ dự kiến
                  </div>
                </div>
              </div>

              {/* PHẦN B: BẢNG TIẾN ĐỘ ĐẦU VIỆC & CẢNH BÁO QUÁ HẠN (DELIVERY TRACKER) */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                      Tiến Độ Triển Khai — Người Phụ Trách & Hạn Chót ({planDetail.tasks?.length || 0} Đầu Việc)
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b' }}>
                      Theo dõi tiến độ ký quỹ vé máy bay, khảo sát tuyến mới và chiến dịch truyền thông. Tự động cảnh báo đỏ nếu quá hạn hoàn thành.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {/* Bộ lọc tiến độ */}
                    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
                      <button
                        onClick={() => setTaskFilter('ALL')}
                        style={{
                          background: taskFilter === 'ALL' ? '#ffffff' : 'transparent',
                          color: taskFilter === 'ALL' ? '#0f172a' : '#64748b',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: taskFilter === 'ALL' ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        Tất Cả ({planDetail.tasks?.length || 0})
                      </button>
                      <button
                        onClick={() => setTaskFilter('OVERDUE')}
                        style={{
                          background: taskFilter === 'OVERDUE' ? '#fee2e2' : 'transparent',
                          color: taskFilter === 'OVERDUE' ? '#dc2626' : '#64748b',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        ⚠️ Quá Hạn ({planDetail.tasks?.filter(t => t.is_overdue).length || 0})
                      </button>
                      <button
                        onClick={() => setTaskFilter('RUNNING')}
                        style={{
                          background: taskFilter === 'RUNNING' ? '#ffffff' : 'transparent',
                          color: taskFilter === 'RUNNING' ? '#0284c7' : '#64748b',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: taskFilter === 'RUNNING' ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        Đang Chạy
                      </button>
                      <button
                        onClick={() => setTaskFilter('DONE')}
                        style={{
                          background: taskFilter === 'DONE' ? '#ffffff' : 'transparent',
                          color: taskFilter === 'DONE' ? '#059669' : '#64748b',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          fontWeight: taskFilter === 'DONE' ? 700 : 500,
                          cursor: 'pointer'
                        }}
                      >
                        Đã Xong
                      </button>
                    </div>

                    {!isPlanLocked && canEditCurrentBU && (
                      <button
                        onClick={handleOpenAddTask}
                        className="btn-pro-save"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        <Plus size={15} /> Thêm Đầu Việc
                      </button>
                    )}
                  </div>
                </div>

                {/* Bảng Đầu Việc */}
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '90px' }}>MÃ VIỆC</th>
                        <th style={{ width: '130px' }}>GIAI ĐOẠN</th>
                        <th>HẠNG MỤC CÔNG VIỆC</th>
                        <th>SẢN PHẨM</th>
                        <th style={{ width: '120px' }}>HẠN HOÀN THÀNH</th>
                        <th style={{ width: '130px' }}>NGƯỜI PHỤ TRÁCH</th>
                        <th style={{ textAlign: 'center', width: '130px' }}>TRẠNG THÁI</th>
                        <th style={{ textAlign: 'center', width: '90px' }}>THAO TÁC</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.length === 0 ? (
                        <tr>
                          <td colSpan="8" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                            Không có công việc nào trong danh sách.
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map(t => (
                          <tr key={t.id} style={{ background: t.is_overdue ? '#fff5f5' : 'transparent' }}>
                            <td style={{ fontWeight: 700, color: '#0284c7' }}>{t.task_code}</td>
                            <td style={{ fontSize: '0.78rem', color: '#64748b' }}>{t.season_stage}</td>
                            <td>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{t.category}</div>
                              {t.obstacles_notes && (
                                <div style={{ fontSize: '0.72rem', color: '#e11d48', marginTop: '2px' }}>
                                  Vướng mắc: {t.obstacles_notes}
                                </div>
                              )}
                            </td>
                            <td style={{ fontSize: '0.78rem', color: '#475569' }}>{t.related_products}</td>
                            <td>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: t.is_overdue ? '#dc2626' : '#0f172a' }}>
                                {t.deadline ? t.deadline.substring(0, 10) : 'Chưa đặt'}
                              </div>
                              {t.is_overdue && (
                                <span style={{
                                  fontSize: '0.66rem',
                                  background: '#fee2e2',
                                  color: '#dc2626',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontWeight: 800,
                                  display: 'inline-block',
                                  marginTop: '2px'
                                }}>
                                  ⚠️ Quá hạn {t.days_overdue} ngày
                                </span>
                              )}
                            </td>
                            <td style={{ fontSize: '0.8rem', fontWeight: 600 }}>{t.assignee}</td>
                            <td style={{ textAlign: 'center' }}>
                              <span style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 700,
                                background: t.status === 'Đã hoàn tất' ? '#ecfdf5' : t.status === 'Chậm tiến độ' ? '#fee2e2' : '#eff6ff',
                                color: t.status === 'Đã hoàn tất' ? '#059669' : t.status === 'Chậm tiến độ' ? '#dc2626' : '#2563eb'
                              }}>
                                {t.status}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {!isPlanLocked && canEditCurrentBU && (
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    className="btn-action btn-edit-pro"
                                    onClick={() => handleOpenEditTask(t)}
                                    title="Sửa công việc"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    className="btn-action btn-delete-pro"
                                    onClick={() => handleDeleteTask(t.id, t.task_code)}
                                    title="Xóa công việc"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '20px' }}>
                  <button
                    onClick={() => setActiveStage(4)}
                    className="btn-pro-cancel"
                    style={{ padding: '8px 16px', fontSize: '0.82rem' }}
                  >
                    <ChevronLeft size={15} /> Quay lại Ma trận & Dòng tiền
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: DÁN DỮ LIỆU TỪ EXCEL / GOOGLE SHEETS */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showPasteModal && (
        <div className="glass-modal-overlay" onClick={() => setShowPasteModal(false)}>
          <div className="drawer-content slide-in-right" onClick={e => e.stopPropagation()} style={{ width: '680px', maxWidth: '95vw', background: '#ffffff', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="drawer-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={20} color="#0284c7" />
                  <span>Dán Dữ Liệu Từ Excel / Google Sheets</span>
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Sao chép các cột từ Google Sheet hoặc Excel và dán trực tiếp vào đây.
                </p>
              </div>
              <button onClick={() => setShowPasteModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '1.5rem 1.75rem' }}>
              <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '12px 14px', marginBottom: '14px', fontSize: '0.78rem', color: '#0369a1' }}>
                <b>💡 Thứ tự các cột chuẩn khi copy:</b><br />
                <code>Mã SP | Tên Tuyến Tour | Nhóm SP | Mức Ưu Tiên | Giai Đoạn | Số Khách/Đoàn | Giá Bán | Biến Phí | Định Phí</code><br />
                <span style={{ color: '#64748b', fontSize: '0.74rem' }}>* Dòng tiêu đề đầu tiên sẽ được hệ thống tự động bỏ qua nếu có chữ "Mã" hoặc "Tên".</span>
              </div>

              <textarea
                value={pasteRawText}
                onChange={e => setPasteRawText(e.target.value)}
                rows={10}
                placeholder={"BU5-MC-01\tMông Cổ Mùa Hè: Thảo Nguyên & Sa Mạc\tTuyến trụ cột\tCao\tĐang bán\t15\t59900000\t46000000\t5000000\nBU5-TC-01\tTân Cương Mùa Thu: Khám Phá Nam Cương\tKhám phá độc bản\tCao\tĐang bán\t12\t79900000\t61000000\t6000000"}
                style={{
                  width: '100%',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.82rem',
                  fontFamily: 'monospace',
                  background: '#f8fafc',
                  outline: 'none',
                  lineHeight: '1.5'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowPasteModal(false)}
                  className="btn-pro-cancel"
                  style={{ padding: '8px 16px', fontSize: '0.84rem' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleParseAndImportPaste}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 20px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={16} /> Nhập Dữ Liệu Vào Bảng Tính
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: THÊM / SỬA SẢN PHẨM (STAGE 2) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showProductModal && (
        <div className="glass-modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="drawer-content slide-in-right" onClick={e => e.stopPropagation()} style={{ width: '640px', maxWidth: '95vw' }}>
            <div className="drawer-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  {editingProduct ? `Sửa Sản Phẩm: ${editingProduct.product_code}` : 'Thêm Sản Phẩm Mới'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Nhập thông tin tuyến tour, giá bán và cấu trúc chi phí để hệ thống tự động tính biên lãi gộp.
                </p>
              </div>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div className="drawer-body" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>MÃ SP *</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={productForm.product_code}
                      onChange={e => setProductForm({ ...productForm, product_code: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>TÊN TUYẾN / SẢN PHẨM *</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={productForm.name}
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>NHÓM</label>
                    <select
                      className="filter-input"
                      value={productForm.group_type}
                      onChange={e => setProductForm({ ...productForm, group_type: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="Tuyến trụ cột">Tuyến trụ cột</option>
                      <option value="Tuyến mùa vụ">Tuyến mùa vụ</option>
                      <option value="Tuyến khảo sát">Tuyến khảo sát</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>ƯU TIÊN</label>
                    <select
                      className="filter-input"
                      value={productForm.priority}
                      onChange={e => setProductForm({ ...productForm, priority: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="Cao">Cao</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Thấp">Thấp</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>GIAI ĐOẠN</label>
                    <select
                      className="filter-input"
                      value={productForm.stage}
                      onChange={e => setProductForm({ ...productForm, stage: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="Đang bán">Đang bán</option>
                      <option value="Đang phát triển">Đang phát triển</option>
                      <option value="Khảo sát">Khảo sát</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>MÙA BÁN / KHỞI HÀNH</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={productForm.season}
                      onChange={e => setProductForm({ ...productForm, season: e.target.value })}
                      placeholder="VD: Tháng 6-9, Tết..."
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>NGƯỜI PHỤ TRÁCH</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={productForm.person_in_charge}
                      onChange={e => setProductForm({ ...productForm, person_in_charge: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                {/* Phần Định Giá & Chi Phí */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginTop: '4px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    CẤU TRÚC GIÁ THÀNH & LỢI NHUẬN
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>GIÁ BÁN/PAX (₫)</label>
                      <input
                        type="text"
                        className="filter-input"
                        value={productForm.price_per_pax !== '' && productForm.price_per_pax !== undefined ? fmt(productForm.price_per_pax || 0) : ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setProductForm({ ...productForm, price_per_pax: raw ? parseInt(raw, 10) : 0 });
                        }}
                        style={{ width: '100%', marginTop: '4px', fontWeight: 700 }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>BIẾN PHÍ/PAX (₫)</label>
                      <input
                        type="text"
                        className="filter-input"
                        value={productForm.variable_cost_per_pax !== '' && productForm.variable_cost_per_pax !== undefined ? fmt(productForm.variable_cost_per_pax || 0) : ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setProductForm({ ...productForm, variable_cost_per_pax: raw ? parseInt(raw, 10) : 0 });
                        }}
                        style={{ width: '100%', marginTop: '4px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569' }}>ĐỊNH PHÍ/ĐOÀN (₫)</label>
                      <input
                        type="text"
                        className="filter-input"
                        value={productForm.fixed_cost_per_group !== '' && productForm.fixed_cost_per_group !== undefined ? fmt(productForm.fixed_cost_per_group || 0) : ''}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setProductForm({ ...productForm, fixed_cost_per_group: raw ? parseInt(raw, 10) : 0 });
                        }}
                        style={{ width: '100%', marginTop: '4px' }}
                      />
                    </div>
                  </div>

                  {/* Tính nhanh Lãi gộp & Margin */}
                  {productForm.price_per_pax > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <div>
                        Lãi gộp: <strong style={{ color: '#16a34a' }}>{fmtVND(productForm.price_per_pax - productForm.variable_cost_per_pax)}</strong> / pax
                      </div>
                      <div>
                        Tỷ suất lãi gộp: <strong style={{ color: '#0284c7' }}>
                          {(((productForm.price_per_pax - productForm.variable_cost_per_pax) / productForm.price_per_pax) * 100).toFixed(1)}%
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>CHIẾN LƯỢC / GHI CHÚ</label>
                  <textarea
                    className="filter-input"
                    rows={2}
                    value={productForm.strategy_notes}
                    onChange={e => setProductForm({ ...productForm, strategy_notes: e.target.value })}
                    style={{ width: '100%', marginTop: '4px', height: 'auto', padding: '8px' }}
                  />
                </div>
              </div>

              <div className="drawer-footer" style={{ padding: '1rem 1.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff' }}>
                <button type="button" className="btn-pro-cancel" onClick={() => setShowProductModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-pro-save">
                  <Save size={16} /> Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: THÊM / SỬA ĐỢT KHỞI HÀNH (STAGE 3) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showDepartureModal && (
        <div className="glass-modal-overlay" onClick={() => setShowDepartureModal(false)}>
          <div className="drawer-content slide-in-right" onClick={e => e.stopPropagation()} style={{ width: '580px', maxWidth: '95vw' }}>
            <div className="drawer-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  {editingDeparture ? `Sửa Đợt: ${editingDeparture.departure_code}` : 'Thêm Đợt Khởi Hành Mới'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Chọn sản phẩm và tháng khởi hành để xếp đoàn vào ma trận 12 tháng.
                </p>
              </div>
              <button onClick={() => setShowDepartureModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveDeparture}>
              <div className="drawer-body" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>SẢN PHẨM *</label>
                  <select
                    className="filter-input"
                    value={departureForm.product_id}
                    onChange={e => {
                      const selProd = planDetail.products.find(p => p.id === parseInt(e.target.value));
                      setDepartureForm({
                        ...departureForm,
                        product_id: parseInt(e.target.value),
                        pax_per_group: selProd?.target_pax_per_group || 10
                      });
                    }}
                    style={{ width: '100%', marginTop: '4px', fontWeight: 600 }}
                    required
                  >
                    <option value="">-- Chọn sản phẩm --</option>
                    {planDetail.products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.product_code} — {p.name} ({fmtVND(p.price_per_pax)})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>MÃ ĐỢT KHỞI HÀNH</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={departureForm.departure_code}
                      onChange={e => setDepartureForm({ ...departureForm, departure_code: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>THÁNG KHỞI HÀNH *</label>
                    <select
                      className="filter-input"
                      value={departureForm.month}
                      onChange={e => setDepartureForm({ ...departureForm, month: parseInt(e.target.value) })}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 700, color: '#0284c7' }}
                      required
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>SỐ ĐOÀN TRONG ĐỢT *</label>
                    <input
                      type="number"
                      min="1"
                      className="filter-input"
                      value={departureForm.groups_count}
                      onChange={e => setDepartureForm({ ...departureForm, groups_count: parseInt(e.target.value) || 1 })}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 700 }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>KHÁCH / ĐOÀN (PAX) *</label>
                    <input
                      type="number"
                      min="1"
                      className="filter-input"
                      value={departureForm.pax_per_group}
                      onChange={e => setDepartureForm({ ...departureForm, pax_per_group: parseInt(e.target.value) || 10 })}
                      style={{ width: '100%', marginTop: '4px', fontWeight: 700 }}
                      required
                    />
                  </div>
                </div>

                {/* Preview Doanh thu của đợt */}
                {departureForm.product_id && (
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span>Tổng khách dự kiến:</span>
                      <strong>{departureForm.groups_count * departureForm.pax_per_group} pax</strong>
                    </div>
                    {(() => {
                      const prod = planDetail.products.find(p => p.id === departureForm.product_id);
                      if (!prod) return null;
                      const rev = departureForm.groups_count * departureForm.pax_per_group * Number(prod.price_per_pax);
                      const gp = departureForm.groups_count * (
                        departureForm.pax_per_group * (Number(prod.price_per_pax) - Number(prod.variable_cost_per_pax)) - Number(prod.fixed_cost_per_group)
                      );
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span>Doanh thu kế hoạch:</span>
                            <strong style={{ color: '#0f172a' }}>{fmtVND(rev)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Lãi gộp kế hoạch:</span>
                            <strong style={{ color: '#16a34a' }}>{fmtVND(gp)}</strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>GHI CHÚ / MỐC VẬN HÀNH</label>
                  <input
                    type="text"
                    className="filter-input"
                    value={departureForm.notes}
                    onChange={e => setDepartureForm({ ...departureForm, notes: e.target.value })}
                    placeholder="VD: Khởi hành dịp 30/4, đợt hoa nở..."
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>
              </div>

              <div className="drawer-footer" style={{ padding: '1rem 1.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff' }}>
                <button type="button" className="btn-pro-cancel" onClick={() => setShowDepartureModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-pro-save">
                  <Save size={16} /> Lưu Đợt Khởi Hành
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: THÊM / SỬA TIẾN ĐỘ ĐẦU VIỆC (STAGE 5) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showTaskModal && (
        <div className="glass-modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="drawer-content slide-in-right" onClick={e => e.stopPropagation()} style={{ width: '580px', maxWidth: '95vw' }}>
            <div className="drawer-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  {editingTask ? `Sửa Công Việc: ${editingTask.task_code}` : 'Thêm Đầu Việc Triển Khai Mới'}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Gán người phụ trách, deadline và kiểm soát cảnh báo quá hạn.
                </p>
              </div>
              <button onClick={() => setShowTaskModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="drawer-body" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>MÃ VIỆC *</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={taskForm.task_code}
                      onChange={e => setTaskForm({ ...taskForm, task_code: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>MÙA / GIAI ĐOẠN</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={taskForm.season_stage}
                      onChange={e => setTaskForm({ ...taskForm, season_stage: e.target.value })}
                      placeholder="VD: 10-12/2026, Quý 1..."
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>HẠNG MỤC CÔNG VIỆC *</label>
                  <input
                    type="text"
                    className="filter-input"
                    value={taskForm.category}
                    onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}
                    placeholder="VD: Ký allotment vé Emirates, chốt brochure..."
                    style={{ width: '100%', marginTop: '4px' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>SẢN PHẨM LIÊN QUAN</label>
                  <input
                    type="text"
                    className="filter-input"
                    value={taskForm.related_products}
                    onChange={e => setTaskForm({ ...taskForm, related_products: e.target.value })}
                    placeholder="VD: Ai Cập; Mông Cổ; Pakistan..."
                    style={{ width: '100%', marginTop: '4px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>HẠN HOÀN THÀNH (DEADLINE)</label>
                    <input
                      type="date"
                      className="filter-input"
                      value={taskForm.deadline}
                      onChange={e => setTaskForm({ ...taskForm, deadline: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>NGƯỜI PHỤ TRÁCH</label>
                    <input
                      type="text"
                      className="filter-input"
                      value={taskForm.assignee}
                      onChange={e => setTaskForm({ ...taskForm, assignee: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>TRẠNG THÁI</label>
                    <select
                      className="filter-input"
                      value={taskForm.status}
                      onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    >
                      <option value="Đang chạy">Đang chạy</option>
                      <option value="Chậm tiến độ">Chậm tiến độ</option>
                      <option value="Đã hoàn tất">Đã hoàn tất</option>
                      <option value="Tạm dừng">Tạm dừng</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>NGÀY HOÀN TẤT THỰC TẾ</label>
                    <input
                      type="date"
                      className="filter-input"
                      value={taskForm.completed_date}
                      onChange={e => setTaskForm({ ...taskForm, completed_date: e.target.value })}
                      style={{ width: '100%', marginTop: '4px' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>VƯỚNG MẮC / BƯỚC TIẾP THEO</label>
                  <textarea
                    className="filter-input"
                    rows={2}
                    value={taskForm.obstacles_notes}
                    onChange={e => setTaskForm({ ...taskForm, obstacles_notes: e.target.value })}
                    style={{ width: '100%', marginTop: '4px', height: 'auto', padding: '8px' }}
                  />
                </div>
              </div>

              <div className="drawer-footer" style={{ padding: '1rem 1.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff' }}>
                <button type="button" className="btn-pro-cancel" onClick={() => setShowTaskModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-pro-save">
                  <Save size={16} /> Lưu Đầu Việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: CELL DRILL-DOWN TẠI MA TRẬN 12 THÁNG */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {matrixCellModal && (
        <div className="glass-modal-overlay" onClick={() => setMatrixCellModal(null)}>
          <div className="drawer-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ margin: '0 0 2px', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  {matrixCellModal.product.name} — Tháng {matrixCellModal.month}
                </h4>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Mã: {matrixCellModal.product.product_code} • {matrixCellModal.deps.length} đợt khởi hành
                </div>
              </div>
              <button onClick={() => setMatrixCellModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ maxHeight: '220px', overflowY: 'auto', marginBottom: '16px' }}>
              {matrixCellModal.deps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Chưa có đợt khởi hành nào trong tháng {matrixCellModal.month}.
                </div>
              ) : (
                matrixCellModal.deps.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', marginBottom: '6px', border: '1px solid #e2e8f0' }}>
                    <div>
                      <strong style={{ color: '#0284c7', fontSize: '0.85rem' }}>{d.departure_code}</strong>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                        {d.groups_count} đoàn x {d.pax_per_group}p = {d.total_pax} pax ({fmtVND(d.total_revenue)})
                      </div>
                    </div>
                    {!isPlanLocked && canEditCurrentBU && (
                      <button
                        onClick={() => handleDeleteDeparture(d.id, d.departure_code)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        title="Xóa đợt"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {!isPlanLocked && canEditCurrentBU && (
              <button
                onClick={() => {
                  const pId = matrixCellModal.product.product_id;
                  const m = matrixCellModal.month;
                  handleOpenAddDeparture(pId, m);
                }}
                className="btn-pro-save"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <Plus size={16} /> Thêm Đợt Khởi Hành Vào Tháng {matrixCellModal.month}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* DRAWER: LỊCH SỬ PHIÊN BẢN (VERSION SNAPSHOTS) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showVersionsDrawer && (
        <div className="glass-modal-overlay" onClick={() => setShowVersionsDrawer(false)}>
          <div className="drawer-content slide-in-right" onClick={e => e.stopPropagation()} style={{ width: '520px', maxWidth: '90vw' }}>
            <div className="drawer-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>
                  Lịch Sử Phiên Bản Đã Phê Duyệt
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                  Danh sách các snapshot bất biến được lưu trữ mỗi khi BOD phê duyệt kế hoạch.
                </p>
              </div>
              <button onClick={() => setShowVersionsDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div className="drawer-body" style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              {!planDetail?.versions || planDetail.versions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Chưa có phiên bản phê duyệt nào được lưu trữ. Sau khi BOD phê duyệt chính thức, một bản snapshot v1.0 sẽ được đóng băng tại đây.
                </div>
              ) : (
                planDetail.versions.map(v => (
                  <div key={v.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', marginBottom: '12px', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '0.78rem', fontWeight: 800, padding: '2px 8px', borderRadius: '12px' }}>
                        ● {v.version_label}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        {new Date(v.created_at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                      Phê duyệt bởi: {v.created_by_name}
                    </div>
                    {v.approval_notes && (
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                        Ghi chú: "{v.approval_notes}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="drawer-footer" style={{ padding: '1rem 1.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', background: '#ffffff' }}>
              <button className="btn-pro-cancel" onClick={() => setShowVersionsDrawer(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* MODAL: YÊU CẦU CHỈNH SỬA (CHANGES REQUESTED) */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {showFeedbackModal && (
        <div className="glass-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="drawer-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px', padding: '24px' }}>
            <h4 style={{ margin: '0 0 6px', fontSize: '1.15rem', fontWeight: 800, color: '#dc2626' }}>
              Yêu Cầu BU Điều Chỉnh Kế Hoạch
            </h4>
            <p style={{ margin: '0 0 14px', fontSize: '0.82rem', color: '#64748b' }}>
              Nhập lý do hoặc nội dung chỉ tiêu cần điều chỉnh để gửi phản hồi trực tiếp cho BUM {selectedBU}.
            </p>
            <textarea
              className="filter-input"
              rows={3}
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="VD: Cần hạ định mức chi phí MKT tour Ai Cập từ 10% xuống 7%, điều chỉnh số đoàn T7..."
              style={{ width: '100%', marginBottom: '16px', height: 'auto', padding: '10px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button className="btn-pro-cancel" onClick={() => setShowFeedbackModal(false)}>
                Hủy
              </button>
              <button
                className="btn-pro-save"
                style={{ background: '#dc2626', borderColor: '#dc2626' }}
                onClick={() => {
                  setShowFeedbackModal(false);
                  handleStatusTransition('REQUEST_CHANGES', feedbackText);
                }}
              >
                Gửi Yêu Cầu Chỉnh Sửa
              </button>
            </div>
          </div>
        </div>
      )}



    </div>
  );
}
