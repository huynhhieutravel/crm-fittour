import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, ChevronDown, ChevronUp, Copy, Search, ExternalLink, Calendar, MapPin, Gift, Tent, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// Hạn chót thu hồi popup: Trước 12h00 trưa Thứ Hai, ngày 26/10/2026 (GMT+7)
const EXPIRY_TIMESTAMP = new Date('2026-10-26T12:00:00+07:00').getTime();
const SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/1RW2Qp3O-HC30KeoaWF5Vqx2LEY6kQXtw/edit?gid=1730784899#gid=1730784899';

// Dữ liệu ban đầu dự phòng
const INITIAL_STATS = {
  summary: {
    total: 32,
    agreedCount: 5,
    pendingCount: 27,
    declinedCount: 0,
    rateAgreed: '15.6',
    ratePending: '84.4'
  },
  byBu: {
    'BU1': { total: 5, agreed: 2, pending: 3 },
    'BU2': { total: 2, agreed: 0, pending: 2 },
    'BU3': { total: 8, agreed: 0, pending: 8 },
    'BU4': { total: 3, agreed: 0, pending: 3 },
    'BU5': { total: 4, agreed: 1, pending: 3 },
    'Kế toán': { total: 3, agreed: 1, pending: 2 },
    'Marketing': { total: 3, agreed: 1, pending: 2 },
    'Visa': { total: 1, agreed: 0, pending: 1 },
    'Khối Chung / Ban Giám Đốc': { total: 3, agreed: 0, pending: 3 }
  },
  members: [
    { stt: 1, name: 'Nguyễn Nhất Vũ', gender: 'Nam', bu: 'Khối Chung / Ban Giám Đốc', role: 'Giám Đốc', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 2, name: 'Trần Quốc Thịnh', gender: 'Nam', bu: 'BU1', role: 'Trưởng phòng kinh doanh', statusClass: 'agreed', confirm: 'Đồng ý', notes: '' },
    { stt: 3, name: 'Nguyễn Quỳnh Phương', gender: 'Nữ', bu: 'BU1', role: 'NVKD', statusClass: 'agreed', confirm: 'Đồng ý', notes: 'Không về Sài Gòn cùng công ty' },
    { stt: 4, name: 'Đoàn Thúy An', gender: 'Nữ', bu: 'BU1', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 5, name: 'Lâm Mỹ Duyên', gender: 'Nữ', bu: 'BU1', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 6, name: 'Nguyễn Hưng Thịnh', gender: 'Nam', bu: 'BU1', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 7, name: 'Lê Minh Tuấn', gender: 'Nam', bu: 'BU2', role: 'Trưởng phòng kinh doanh', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 8, name: 'Bùi Ngọc Hiếu', gender: 'Nam', bu: 'BU2', role: 'Phó phòng kinh doanh', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 9, name: 'Phan Hoàng Trúc Vy', gender: 'Nữ', bu: 'BU3', role: 'Phó Giám Đốc', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 10, name: 'Nguyễn Huỳnh Hồng Trang', gender: 'Nữ', bu: 'BU3', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 11, name: 'Hầu Quang Hưng', gender: 'Nam', bu: 'BU3', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 12, name: 'Lê Thị Trang', gender: 'Nữ', bu: 'BU3', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 13, name: 'Lê Văn Tâm', gender: 'Nam', bu: 'BU3', role: 'Nhân Viên KD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 14, name: 'Võ Thị Hồng Trang', gender: 'Nữ', bu: 'BU4', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 15, name: 'Ngô Ngọc Đăng Huy', gender: 'Nam', bu: 'BU4', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 16, name: 'Lê Thanh Hà', gender: 'Nam', bu: 'BU5', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 17, name: 'Dương Quỳnh Như', gender: 'Nữ', bu: 'BU5', role: 'Trưởng phòng kinh doanh', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 18, name: 'Nguyễn Thị Hằng', gender: 'Nữ', bu: 'BU5', role: 'NVKD', statusClass: 'agreed', confirm: 'Đồng ý', notes: '' },
    { stt: 19, name: 'Trần Đức Mẫn', gender: 'Nam', bu: 'BU3', role: 'Nhân viên điều hành', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 20, name: 'Nguyễn Hồ Đông Hải', gender: 'Nam', bu: 'BU1', role: 'Nhân viên điều hành', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 21, name: 'Trần Minh Dũng', gender: 'Nam', bu: 'BU1', role: 'Nhân viên điều hành', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 22, name: 'Phạm Nguyễn Phương Thụy', gender: 'Nữ', bu: 'BU3', role: 'Nhân viên điều hành', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 23, name: 'Nguyễn Thị Thu Xuân', gender: 'Nữ', bu: 'Kế toán', role: 'Kế toán', statusClass: 'agreed', confirm: 'Đồng ý', notes: '' },
    { stt: 24, name: 'Đoàn Bảo Ngọc', gender: 'Nữ', bu: 'Kế toán', role: 'Kế toán', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 25, name: 'Trần Hiếu Thảo', gender: 'Nữ', bu: 'Kế toán', role: 'Kế toán', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 26, name: 'Hồ Hải Long', gender: 'Nam', bu: 'Marketing', role: 'NV Marketing', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 27, name: 'Huỳnh Trọng Hiếu', gender: 'Nam', bu: 'Marketing', role: 'NV Marketing', statusClass: 'agreed', confirm: 'Đồng ý', notes: 'Tự di chuyển lên Đà Lạt trước từ Cần Thơ (nhà xa)' },
    { stt: 28, name: 'Châu Quốc Kiệt', gender: 'Nam', bu: 'Marketing', role: 'NV Marketing', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 29, name: 'Phan Trọng Trí', gender: 'Nam', bu: 'Visa', role: 'Nhân Viên visa', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 30, name: 'Trương Huy Hoàng', gender: 'Nam', bu: 'BU3', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 31, name: 'Lê Đoàn Khánh Giao', gender: 'Nữ', bu: 'BU4', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' },
    { stt: 32, name: 'Trần Gia Tuệ', gender: 'Nữ', bu: 'BU5', role: 'NVKD', statusClass: 'pending', confirm: 'Chưa phản hồi', notes: '' }
  ]
};

export default function CompanyTripModal({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [statsData, setStatsData] = useState(INITIAL_STATS);
  const [isFolded, setIsFolded] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeBu, setActiveBu] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  const userKey = `seen_company_trip_2026_${currentUser?.id || 'guest'}`;

  // Kiểm tra điều kiện hiển thị
  useEffect(() => {
    // 1. Quá hạn 12h00 trưa 26/10/2026 -> Thu hồi vĩnh viễn
    if (Date.now() >= EXPIRY_TIMESTAMP) {
      return;
    }

    // 2. Mỗi người dùng chỉ thấy đúng 1 lần (đã lưu trong localStorage)
    const hasSeen = localStorage.getItem(userKey);
    if (!hasSeen) {
      // Delay nhẹ 600ms sau khi vào trang cho mượt mà
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [userKey]);

  // Lắng nghe sự kiện mở thủ công nếu người dùng muốn xem lại từ menu / bell
  useEffect(() => {
    const handleManualOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-company-trip-modal', handleManualOpen);
    return () => window.removeEventListener('open-company-trip-modal', handleManualOpen);
  }, []);

  // Fetch số liệu realtime từ Google Sheet
  useEffect(() => {
    if (!isOpen) return;

    axios.get('/api/announcements/company-trip/stats')
      .then(res => {
        if (res.data && res.data.summary) {
          setStatsData(res.data);
        }
      })
      .catch(err => {
        console.warn('Live stats fetch warning, using pre-rendered data:', err.message);
      });
  }, [isOpen]);

  // Đóng modal và đánh dấu đã xem để không hiện lại
  const handleDismiss = () => {
    try {
      localStorage.setItem(userKey, 'true');
    } catch (e) {
      console.error(e);
    }
    setIsOpen(false);
  };

  // Đóng khi click ra ngoài backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleDismiss();
    }
  };

  // Đóng khi nhấn phím ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Xử lý filter danh sách nhân sự
  let filteredMembers = statsData.members || [];
  if (activeFilter === 'agreed') {
    filteredMembers = filteredMembers.filter(m => m.statusClass === 'agreed');
  } else if (activeFilter === 'pending') {
    filteredMembers = filteredMembers.filter(m => m.statusClass === 'pending');
  }
  if (activeBu) {
    filteredMembers = filteredMembers.filter(m => m.bu === activeBu);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredMembers = filteredMembers.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.bu.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q)
    );
  }

  const handleBuClick = (bu) => {
    if (activeBu === bu) {
      setActiveBu(null);
    } else {
      setActiveBu(bu);
      setIsFolded(false); // Tự động mở danh sách khi click chọn 1 BU
    }
  };

  const copyPendingList = () => {
    const pendingMembers = statsData.members.filter(m => m.statusClass === 'pending');
    const byBuPending = {};
    pendingMembers.forEach(m => {
      if (!byBuPending[m.bu]) byBuPending[m.bu] = [];
      byBuPending[m.bu].push(m.name);
    });

    let text = `📢 [NHẮC NHỞ HẠN CHÓT] ĐĂNG KÝ COMPANY TRIP FIT TOUR 2026 (TRƯỚC 12H00 TRƯA 26/10)\n`;
    text += `Hiện còn ${pendingMembers.length} thành viên chưa điền xác nhận tham gia:\n\n`;
    for (const [bu, names] of Object.entries(byBuPending)) {
      text += `• ${bu} (${names.length} bạn): ${names.join(', ')}\n`;
    }
    text += `\n👉 Link điền form: ${SPREADSHEET_URL}\n`;
    text += `Các bạn vui lòng điền sớm để HR & Điều Hành chốt số lượng xe, phòng và tiệc nhé!`;

    navigator.clipboard.writeText(text).then(() => {
      showToast('✅ Đã copy danh sách 27 bạn chưa đăng ký để gửi Zalo / Chat!');
    });
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(10, 15, 29, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Floating Modal Box */}
      <div
        style={{
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          background: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 35px 80px -15px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          animation: 'modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <style>{`
          @keyframes modalPop {
            0% { opacity: 0; transform: scale(0.95) translateY(15px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* 1. Header (Title + [X] Button) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
            padding: '22px 28px',
            color: '#ffffff',
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #10b981'
          }}
        >
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 800,
              lineHeight: 1.35,
              color: '#ffffff',
              letterSpacing: '-0.3px',
              margin: 0,
              paddingRight: '45px'
            }}
          >
            THÔNG BÁO CHƯƠNG TRÌNH COMPANY TRIP 2026: "FIT TOGETHER ĐÀ LẠT"
          </h1>
          <button
            onClick={handleDismiss}
            title="Đóng thông báo (ESC / Nhấn ra ngoài)"
            style={{
              position: 'absolute',
              top: '18px',
              right: '20px',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#ef4444';
              e.currentTarget.style.borderColor = '#ef4444';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Scrollable Body Content */}
        <div style={{ padding: '24px 28px 36px', overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          
          {/* Urgent Deadline Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
              border: '2px solid #f87171',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div
                style={{
                  display: 'inline-block',
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '5px'
                }}
              >
                ⏰ HẠN CHÓT ĐĂNG KÝ QUAN TRỌNG
              </div>
              <div style={{ fontSize: '15.5px', fontWeight: 800, color: '#991b1b', marginBottom: '2px' }}>
                Trước 12h00 trưa Thứ Hai, ngày 26/10/2026
              </div>
              <div style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: 1.4 }}>
                Vui lòng điền form xác nhận tham gia để Phòng Nhân sự & Điều hành chốt số lượng đặt xe, villa và tiệc chu đáo nhất.
              </div>
            </div>
            <div>
              <a
                href={SPREADSHEET_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  textDecoration: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap'
                }}
              >
                👉 ĐIỀN FORM ĐĂNG KÝ NGAY 📝
              </a>
            </div>
          </div>

          {/* 3 Pillars Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '14px',
              marginBottom: '26px'
            }}
          >
            {/* Pillar 1 */}
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderTop: '4px solid #16a34a', borderRadius: '12px', padding: '16px 14px' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>🎁</div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#15803d', marginBottom: '4px' }}>
                CHÍNH SÁCH PHÚC LỢI ĐẶC BIỆT
              </div>
              <div style={{ fontSize: '16.5px', fontWeight: 800, color: '#15803d', lineHeight: 1.35, marginBottom: '4px' }}>
                TÀI TRỢ 100% CHI PHÍ
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>
                Ban Giám Đốc quyết định <strong>đài thọ 100% toàn bộ chi phí</strong> chuyến đi cho TOÀN BỘ Nhân viên chính thức (bao gồm mở rộng tài trợ 100% cho 08 bạn dưới 6 tháng theo đề xuất của HR).
              </div>
            </div>

            {/* Pillar 2 */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderTop: '4px solid #065f46', borderRadius: '12px', padding: '16px 14px' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>📍</div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '4px' }}>
                ĐỊA ĐIỂM & THỜI LƯỢNG
              </div>
              <div style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, marginBottom: '4px' }}>
                ĐÀ LẠT • 4N3Đ
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>
                Từ <strong>Thứ Tư (11/11/2026)</strong> đến <strong>Thứ Bảy (14/11/2026)</strong>. Trở lại văn phòng làm việc bình thường vào <strong>Thứ Hai (16/11/2026)</strong>.
              </div>
            </div>

            {/* Pillar 3 */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderTop: '4px solid #065f46', borderRadius: '12px', padding: '16px 14px' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>⛺</div>
              <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '4px' }}>
                TRẢI NGHIỆM ĐỈNH CAO
              </div>
              <div style={{ fontSize: '16.5px', fontWeight: 800, color: '#0f172a', lineHeight: 1.35, marginBottom: '4px' }}>
                CAMPING & VILLA RIÊNG
              </div>
              <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>
                Kết hợp 01 đêm Camping hồ ngắm sao + BBQ lửa trại và 02 đêm nghỉ dưỡng Villa hồ bơi sang trọng + Đêm nhạc "Bình Minh Ơi".
              </div>
            </div>
          </div>

          {/* Realtime Stats Dashboard */}
          <div
            style={{
              background: '#ffffff',
              border: '2px solid #0f766e',
              borderRadius: '14px',
              padding: '20px',
              marginBottom: '26px',
              boxShadow: '0 10px 25px -5px rgba(15, 118, 110, 0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>📊</span> TIẾN ĐỘ ĐĂNG KÝ THAM GIA (TỰ ĐỘNG CẬP NHẬT)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '5px 12px', borderRadius: '20px', border: '1px solid #86efac' }}>
                  <span style={{ width: '7px', height: '7px', background: '#16a34a', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 6px #16a34a' }} /> Live Sync Google Sheet
                </span>
                <button
                  onClick={copyPendingList}
                  style={{
                    background: '#ea580c',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Copy size={13} /> Copy DS 27 Bạn Chưa Điền
                </button>
              </div>
            </div>

            {/* KPI Counters */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '2px' }}>Tổng CBNV</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>{statsData.summary.total}</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>16 Nam • 16 Nữ</div>
              </div>
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '2px' }}>Đã Xác Nhận</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#16a34a', lineHeight: 1.1 }}>{statsData.summary.agreedCount}</div>
                <div style={{ fontSize: '11.5px', color: '#15803d', marginTop: '3px', fontWeight: 600 }}>{statsData.summary.rateAgreed}% nhân sự</div>
              </div>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '2px' }}>Chưa Phản Hồi</div>
                <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706', lineHeight: 1.1 }}>{statsData.summary.pendingCount}</div>
                <div style={{ fontSize: '11.5px', color: '#b45309', marginTop: '3px', fontWeight: 600 }}>{statsData.summary.ratePending}% cần nhắc</div>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#64748b', marginBottom: '2px' }}>Hạn Chót</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', lineHeight: 1.1, marginTop: '4px' }}>12:00</div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>Thứ Hai 26/10</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                <span>Tiến độ hoàn thành danh sách</span>
                <span>{statsData.summary.agreedCount} / {statsData.summary.total} nhân sự ({statsData.summary.rateAgreed}%)</span>
              </div>
              <div style={{ height: '12px', background: '#e2e8f0', borderRadius: '20px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: `${statsData.summary.rateAgreed}%`, background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', transition: 'width 0.5s ease' }} />
                <div style={{ width: `${statsData.summary.ratePending}%`, background: '#cbd5e1' }} />
              </div>
            </div>

            {/* BU Breakdown Pills */}
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
              🏢 Tiến độ theo Đơn vị / Phòng Ban (Click để lọc danh sách):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginBottom: '14px' }}>
              {Object.entries(statsData.byBu).map(([bu, info]) => {
                const isActive = activeBu === bu;
                const pct = info.total > 0 ? Math.round((info.agreed / info.total) * 100) : 0;
                return (
                  <div
                    key={bu}
                    onClick={() => handleBuClick(bu)}
                    style={{
                      background: isActive ? '#f0fdfa' : '#f8fafc',
                      border: isActive ? '1.5px solid #0f766e' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '8px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '11.5px', fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{bu}</div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f766e' }}>{info.agreed}/{info.total} ({pct}%)</div>
                  </div>
                );
              })}
            </div>

            {/* Fold / Unfold Action Button */}
            <div style={{ marginTop: '14px', textAlign: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '14px' }}>
              <button
                onClick={() => setIsFolded(!isFolded)}
                style={{
                  background: isFolded ? '#f1f5f9' : '#334155',
                  color: isFolded ? '#0f766e' : '#ffffff',
                  border: isFolded ? '1px solid #cbd5e1' : '1px solid #334155',
                  padding: '9px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.2s ease'
                }}
              >
                {isFolded ? (
                  <>
                    <span>👁️</span> Xem chi tiết danh sách nhân sự ({statsData.summary.total} bạn) <ChevronDown size={14} />
                  </>
                ) : (
                  <>
                    <span>🙈</span> Thu gọn danh sách nhân sự <ChevronUp size={14} />
                  </>
                )}
              </button>
            </div>

            {/* Collapsible Member List (Folded by default) */}
            {!isFolded && (
              <div style={{ marginTop: '16px' }}>
                {/* Filter & Search Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setActiveFilter('all')}
                      style={{
                        background: activeFilter === 'all' ? '#0f766e' : '#f1f5f9',
                        color: activeFilter === 'all' ? '#fff' : '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Tất cả ({statsData.summary.total})
                    </button>
                    <button
                      onClick={() => setActiveFilter('agreed')}
                      style={{
                        background: activeFilter === 'agreed' ? '#0f766e' : '#f1f5f9',
                        color: activeFilter === 'agreed' ? '#fff' : '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ✅ Đã đồng ý ({statsData.summary.agreedCount})
                    </button>
                    <button
                      onClick={() => setActiveFilter('pending')}
                      style={{
                        background: activeFilter === 'pending' ? '#0f766e' : '#f1f5f9',
                        color: activeFilter === 'pending' ? '#fff' : '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      ⏳ Chưa phản hồi ({statsData.summary.pendingCount})
                    </button>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="🔍 Tìm tên, BU, chức vụ..."
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '12.5px',
                        minWidth: '200px'
                      }}
                    />
                  </div>
                </div>

                {/* Table */}
                <div style={{ maxHeight: '340px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 2 }}>
                        <th style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', width: '45px', color: '#475569' }}>STT</th>
                        <th style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>Họ và tên</th>
                        <th style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', width: '60px', color: '#475569' }}>Giới tính</th>
                        <th style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>Phòng Ban</th>
                        <th style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>Chức danh</th>
                        <th style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', width: '120px', color: '#475569' }}>Trạng thái</th>
                        <th style={{ padding: '9px 10px', textAlign: 'left', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>Không tìm thấy nhân sự phù hợp</td>
                        </tr>
                      ) : (
                        filteredMembers.map((m) => {
                          const isAgreed = m.statusClass === 'agreed';
                          return (
                            <tr key={m.stt} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#64748b' }}>{m.stt}</td>
                              <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{m.name}</td>
                              <td style={{ padding: '8px 10px', color: '#475569' }}>{m.gender}</td>
                              <td style={{ padding: '8px 10px' }}>
                                <span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: '#334155' }}>
                                  {m.bu}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', color: '#475569' }}>{m.role}</td>
                              <td style={{ padding: '8px 10px' }}>
                                <span
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '2px 7px',
                                    borderRadius: '12px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    background: isAgreed ? '#dcfce7' : '#fef3c7',
                                    color: isAgreed ? '#15803d' : '#b45309'
                                  }}
                                >
                                  {isAgreed ? '✅ Đã đồng ý' : '⏳ Chưa phản hồi'}
                                </span>
                              </td>
                              <td style={{ padding: '8px 10px', fontSize: '11px', color: '#b45309', fontStyle: 'italic' }}>
                                {m.notes ? `📝 ${m.notes}` : <span style={{ color: '#cbd5e1' }}>-</span>}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span>🕒 Dữ liệu đồng bộ trực tiếp từ Google Sheet</span>
                  <a
                    href={SPREADSHEET_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#0f766e', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    Mở Google Sheet trực tiếp <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* 4. Visual Itinerary Poster Section */}
          <div style={{ background: '#f1f5f9', borderRadius: '14px', padding: '18px', marginBottom: '24px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🗺️</span> Lịch Trình Chi Tiết: "FIT Together Đà Lạt 2026"
              </div>
              <span style={{ fontSize: '12px', background: '#e2e8f0', color: '#334155', padding: '4px 10px', borderRadius: '6px', fontWeight: 700 }}>
                4 Ngày 3 Đêm | 11/11 - 14/11/2026
              </span>
            </div>

            {/* Poster Image */}
            <div style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)', border: '1px solid #cbd5e1', background: '#000' }}>
              <img
                src="/lich_trinh_company_trip_dalat_2026.jpg"
                alt="Lịch trình chi tiết Company Trip FIT TOUR Đà Lạt 2026"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#64748b', fontStyle: 'italic', marginTop: '8px' }}>
              Ảnh Infographic chính thức chương trình Company Trip FIT Together Đà Lạt 2026
            </div>

            {/* Timeline Day Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {/* Day 1 */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#065f46', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textAlign: 'center', minWidth: '80px', flexShrink: 0 }}>
                  NGÀY 1
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 500, opacity: 0.9 }}>11/11 • Thứ 4</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                    KHỞI HÀNH ➔ TREKKING RỪNG ➔ CẮM TRẠI CAMPING & BBQ LỬA TRẠI
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.55 }}>
                    • <strong>05:30:</strong> Tập trung 19 Lương Hữu Khánh ➔ Ăn sáng Văn Thánh ➔ Khởi hành đi Đà Lạt (ăn trưa Bảo Lộc).<br />
                    • <strong>14:00:</strong> Đến nơi, trekking 2km vào khu cắm trại hồ, dựng lều Camping (tiêu chuẩn lều 2 - 3 - 4 người).<br />
                    • <strong>18:00:</strong> Thưởng thức tiệc BBQ lửa trại, sinh hoạt chung gắn kết đồng đội giữa không gian thông reo.
                  </div>
                </div>
              </div>

              {/* Day 2 */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#c2410c', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textAlign: 'center', minWidth: '80px', flexShrink: 0 }}>
                  NGÀY 2
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 500, opacity: 0.9 }}>12/11 • Thứ 5</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                    HUẤN LUYỆN CHÈO SUP ➔ TREKKING RỪNG ➔ NHẬN VILLA HỒ BƠI ➔ ĐÊM NHẠC BÌNH MINH ƠI
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.55 }}>
                    • <strong>06:00 - 08:00:</strong> Ăn sáng & Cà phê bên hồ ➔ Huấn luyện chèo thuyền SUP (chia đội thi đấu 2 người/thuyền).<br />
                    • <strong>10:00 - 14:00:</strong> Trekking 2km đường rừng ➔ Ăn trưa bên rừng, trả lều ➔ Nhận Villa cao cấp có hồ bơi.<br />
                    • <strong>18:00 - 19:00:</strong> Ăn tối ➔ Thưởng thức đêm nhạc acoustic lãng mạn tại sân khấu "Bình Minh Ơi".
                  </div>
                </div>
              </div>

              {/* Day 3 */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#0284c7', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textAlign: 'center', minWidth: '80px', flexShrink: 0 }}>
                  NGÀY 3
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 500, opacity: 0.9 }}>13/11 • Thứ 6</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                    FREEDAY: TỰ DO KHÁM PHÁ THEO SỞ THÍCH ➔ TIỆC BBQ VILLA RIÊNG
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.55 }}>
                    • <strong>Cả ngày tự do:</strong> Thảnh thơi nghỉ dưỡng tại villa hoặc vi vu cà phê, khám phá Đà Lạt theo sở thích riêng.<br />
                    • <strong>Hỗ trợ ẩm thực:</strong> Công ty gửi chi phí dùng bữa Sáng/Trưa: <strong>200.000đ / thành viên</strong>.<br />
                    • <strong>18:00:</strong> Quây quần bên tiệc nướng BBQ ấm cúng tại khuôn viên Villa riêng.
                  </div>
                </div>
              </div>

              {/* Day 4 */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ background: '#15803d', color: '#ffffff', padding: '6px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 800, textAlign: 'center', minWidth: '80px', flexShrink: 0 }}>
                  NGÀY 4
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 500, opacity: 0.9 }}>14/11 • Thứ 7</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                    BÚN BÒ ĐÀ LẠT ➔ DẠO CHỢ MUA QUÀ ĐẶC SẢN ➔ VỀ LẠI TP. HỒ CHÍ MINH
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.55 }}>
                    • <strong>07:00:</strong> Thưởng thức đặc sản Bún Bò Đà Lạt ➔ Dạo chợ mua quà địa phương cho gia đình, bạn bè.<br />
                    • <strong>09:30:</strong> Check-out villa, khởi hành về lại TP.HCM (dừng chân ăn trưa tại Bảo Lộc).<br />
                    • <strong>16:30:</strong> Về đến văn phòng FIT TOUR, kết thúc chuyến Company Trip tràn ngập kỷ niệm đẹp.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coordination & Handover */}
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <span>⚠️</span> CÔNG TÁC PHỐI HỢP, BÀN GIAO CÔNG VIỆC & LƯU Ý
            </div>
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px', fontSize: '13px', color: '#78350f', lineHeight: 1.6, margin: 0 }}>
              <li><strong>Thời gian tạm ngưng văn phòng:</strong> Văn phòng Công ty sẽ tạm ngưng hoạt động từ Thứ Tư (11/11/2026) đến hết Thứ Bảy (14/11/2026) và hoạt động trở lại bình thường vào Thứ Hai (16/11/2026).</li>
              <li><strong>Bàn giao công việc:</strong> Các Trưởng Bộ phận chủ động phân công, sắp xếp và bàn giao công việc trước chuyến đi, duy trì các đầu mối trực online để không làm gián đoạn dịch vụ khách hàng và đối tác.</li>
              <li><strong>Đối tượng tham gia:</strong> Chương trình áp dụng cho CBNV chính thức của FIT TOUR (không áp dụng người thân đi cùng).</li>
            </ul>
          </div>

          {/* Big CTA Button & Close Button */}
          <div style={{ textAlign: 'center', margin: '24px 0 16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#ffffff',
                textDecoration: 'none',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '15px',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              👉 NHẤP VÀO ĐÂY ĐỂ ĐIỀN LINK ĐĂNG KÝ TRƯỚC 12H00 NGÀY 26/10 📝
            </a>
            <button
              onClick={handleDismiss}
              style={{
                background: '#f1f5f9',
                color: '#475569',
                border: '1px solid #cbd5e1',
                padding: '14px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#e2e8f0';
                e.currentTarget.style.color = '#0f172a';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#475569';
              }}
            >
              Đã hiểu & Đóng lại
            </button>
          </div>

          {/* Footer Sign-off */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ maxWidth: '440px', fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', lineHeight: 1.5 }}>
              Company Trip 2026 là dịp để đại gia đình FIT TOUR cùng nhìn lại chặng đường nỗ lực, sẻ chia những khoảnh khắc quý giá và nạp đầy năng lượng cho những mục tiêu bứt phá cuối năm. Rất mong sự góp mặt đông đủ của toàn thể Anh/Chị/Em!
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#065f46' }}>
                BAN GIÁM ĐỐC & PHÒNG NHÂN SỰ
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#64748b', marginTop: '2px' }}>
                CÔNG TY TNHH DU LỊCH QUỐC TẾ FIT TOUR
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#38bdf8',
            border: '1px solid #38bdf8',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            zIndex: 999999
          }}
        >
          {toastMsg}
        </div>
      )}
    </div>
  );
}
