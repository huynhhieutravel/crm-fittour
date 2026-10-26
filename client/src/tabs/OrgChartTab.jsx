import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { 
  Users, Crown, Search, Filter, ZoomIn, ZoomOut, RotateCcw, 
  Download, Printer, Phone, Mail, ChevronRight, X, Sparkles, 
  Building2, ShieldCheck, Briefcase, Award, Eye, Copy, Check, 
  Share2, Compass, Layers, UserCheck, Calendar, MapPin, ExternalLink,
  ChevronDown, Grid, Network, ListFilter, Maximize2, Move, Navigation, PhoneCall
} from 'lucide-react';
import html2canvas from 'html2canvas';

// Helper lấy ký tự viết tắt đại diện (Initials) chuẩn xác cho người Việt:
// Ví dụ: "Trần Gia Tuệ" -> "GT", "Huỳnh Trọng Hiếu" -> "TH", "Nguyễn Nhất Vũ" -> "NV"
export const getInitials = (fullNameOrUsername) => {
  if (!fullNameOrUsername) return '?';
  const parts = String(fullNameOrUsername).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts.slice(-2).map(w => w[0].toUpperCase()).join('');
};

// ═════════════════════════════════════════════════════════════════════
// 1. DỮ LIỆU CƠ CẤU TỔ CHỨC CHUẨN XÁC 100% THEO 32 TÀI KHOẢN FIT TOUR
// ═════════════════════════════════════════════════════════════════════
export const ORG_STRUCTURE = {
  board: {
    id: 'bod',
    name: 'Ban Giám Đốc',
    subTitle: 'Hội đồng Quản trị & Ban Lãnh đạo Điều hành FIT TOUR',
    members: [
      {
        id: 14,
        username: 'hi2.sale',
        defaultName: 'Nguyễn Nhất Vũ',
        shortName: 'Max Vũ',
        title: 'Giám Đốc Điều Hành (CEO)',
        roleTag: 'CEO',
        badge: '👑 Tổng Giám Đốc',
        color: '#0f172a',
        accent: '#f59e0b'
      },
      {
        id: 33,
        username: 'sv1.sale',
        defaultName: 'Phan Hoàng Trúc Vy',
        shortName: 'Vy Phan',
        title: 'Phó Giám Đốc (Vice Director)',
        roleTag: 'VICE_DIRECTOR',
        badge: '👑 Phó Giám Đốc',
        color: '#78350f',
        accent: '#d97706'
      }
    ]
  },
  departments: [
    {
      id: 'bu1',
      code: 'BU1',
      name: 'Khối Kinh Doanh BU1',
      market: 'Châu Âu • Úc • Mỹ • Thị trường Xa',
      accentColor: '#2563eb', // Royal Blue
      bgLight: '#eff6ff',
      borderColor: '#bfdbfe',
      icon: '🌍',
      head: {
        id: 16,
        username: 'tq1.sale',
        defaultName: 'Trần Quốc Thịnh',
        title: 'Trưởng phòng Kinh Doanh BU1',
        badge: 'Trưởng bộ phận',
        roleTag: 'HEAD'
      },
      groups: [
        {
          groupName: 'Bộ phận Điều hành (Operations)',
          members: [
            { id: 40, username: 'tq1.dh', defaultName: 'Nguyễn Hồ Đông Hải', title: 'Lead Điều Hành BU1', roleTag: 'LEAD_OPS' },
            { id: 46, username: 'dung.dh', defaultName: 'Trần Minh Dũng', title: 'Chuyên viên Điều Hành', roleTag: 'OPS' }
          ]
        },
        {
          groupName: 'Bộ phận Kinh doanh (Sales)',
          members: [
            { id: 17, username: 'tq2.sale', defaultName: 'Đoàn Thúy An', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 18, username: 'tq3.sale', defaultName: 'Nguyễn Quỳnh Phương', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 19, username: 'tq4.sale', defaultName: 'Lâm Mỹ Duyên', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 20, username: 'tq5.sale', defaultName: 'Nguyễn Hưng Thịnh', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' }
          ]
        }
      ]
    },
    {
      id: 'bu2',
      code: 'BU2',
      name: 'Khối Kinh Doanh BU2',
      market: 'Đông Bắc Á (Nhật Bản • Hàn Quốc • Đài Loan)',
      accentColor: '#7c3aed', // Purple
      bgLight: '#f5f3ff',
      borderColor: '#ddd6fe',
      icon: '🏯',
      head: {
        id: 21,
        username: 'gu1.sale',
        defaultName: 'Lê Minh Tuấn',
        title: 'Trưởng phòng Kinh Doanh BU2',
        badge: 'Trưởng bộ phận',
        roleTag: 'HEAD'
      },
      viceHead: {
        id: 22,
        username: 'gu2.sale',
        defaultName: 'Bùi Ngọc Hiếu',
        title: 'Phó phòng Kinh Doanh BU2',
        badge: 'Phó phòng',
        roleTag: 'VICE_HEAD'
      },
      groups: [
        {
          groupName: 'Nghiệp vụ Visa & Dịch vụ',
          members: [
            { id: 77, username: 'gu1.visa', defaultName: 'Phan Trọng Trí', title: 'Chuyên viên Visa & Nghiệp vụ', roleTag: 'VISA' }
          ]
        }
      ]
    },
    {
      id: 'bu3',
      code: 'BU3',
      name: 'Khối Kinh Doanh BU3',
      market: 'Tour MICE • Khách Đoàn Doanh Nghiệp',
      accentColor: '#ea580c', // Sunset Orange
      bgLight: '#fff7ed',
      borderColor: '#fed7aa',
      icon: '🏢',
      head: {
        id: 33,
        username: 'sv1.sale',
        defaultName: 'Phan Hoàng Trúc Vy',
        title: 'Phó Giám Đốc Phụ Trách BU3',
        badge: 'Lãnh đạo phụ trách',
        roleTag: 'DIRECTOR_BU'
      },
      groups: [
        {
          groupName: 'Bộ phận Điều hành (Operations)',
          members: [
            { id: 34, username: 'sv2.sale', defaultName: 'Trần Đức Mẫn', title: 'Lead Điều Hành BU3', roleTag: 'LEAD_OPS' },
            { id: 35, username: 'sv3.sale', defaultName: 'Phạm Nguyễn Phương Thụy', title: 'Chuyên viên Điều Hành', roleTag: 'OPS' }
          ]
        },
        {
          groupName: 'Bộ phận Kinh doanh & Visa',
          members: [
            { id: 36, username: 'sv4.sale', defaultName: 'Nguyễn Huỳnh Hồng Trang', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 39, username: 'sv7.sale', defaultName: 'Hầu Quang Hưng', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 37, username: 'sv5.sale', defaultName: 'Lê Thị Trang', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 82, username: 'sv8.sale', defaultName: 'Trương Huy Hoàng', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 60, username: 'tam.visa', defaultName: 'Lê Văn Tâm', title: 'Chuyên viên Visa & Sales', roleTag: 'VISA_SALES' }
          ]
        }
      ]
    },
    {
      id: 'bu4',
      code: 'BU4',
      name: 'Khối Kinh Doanh BU4',
      market: 'Tây Tạng • Ladakh • Bhutan • Nepal • Nam Á',
      accentColor: '#e11d48', // Rose Red
      bgLight: '#fff1f2',
      borderColor: '#fecdd3',
      icon: '🏔️',
      head: {
        id: 13,
        username: 'hi1.sale',
        defaultName: 'Võ Thị Hồng Trang',
        title: 'Trưởng phòng Kinh Doanh BU4',
        badge: 'Trưởng bộ phận',
        roleTag: 'HEAD'
      },
      groups: [
        {
          groupName: 'Bộ phận Kinh doanh (Sales)',
          members: [
            { id: 15, username: 'hi3.sale', defaultName: 'Ngô Ngọc Đăng Huy', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' },
            { id: 81, username: 'hi5.sale', defaultName: 'Lê Đoàn Khánh Giao', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' }
          ]
        }
      ]
    },
    {
      id: 'bu5',
      code: 'BU5',
      name: 'Khối Kinh Doanh BU5',
      market: 'Tuyến Độc Bản: Mông Cổ • Trung Á • Pakistan • Ai Cập • Nam Mỹ',
      accentColor: '#059669', // Emerald
      bgLight: '#ecfdf5',
      borderColor: '#a7f3d0',
      icon: '🐎',
      head: {
        id: 23,
        username: 'gu3.sale',
        defaultName: 'Dương Quỳnh Như',
        title: 'Trưởng phòng Kinh Doanh BU5',
        badge: 'Trưởng bộ phận',
        roleTag: 'HEAD'
      },
      groups: [
        {
          groupName: 'Điều hành & Kinh doanh',
          members: [
            { id: 45, username: 'ha.dh', defaultName: 'Lê Thanh Hà', title: 'Điều Hành & Kinh Doanh', roleTag: 'OPS' },
            { id: 44, username: 'hang.dh', defaultName: 'Nguyễn Thị Hằng', title: 'Điều Hành & Kinh Doanh', roleTag: 'OPS' },
            { id: 76, username: 'hi4.sale', defaultName: 'Trần Gia Tuệ', title: 'Chuyên viên Kinh Doanh', roleTag: 'SALES' }
          ]
        }
      ]
    },
    {
      id: 'ketoan',
      code: 'KETOAN',
      name: 'Phòng Kế Toán - Tài Chính',
      market: 'Tài chính doanh nghiệp • Thu chi • Quyết toán đoàn',
      accentColor: '#0891b2', // Teal
      bgLight: '#ecfeff',
      borderColor: '#a5f3fc',
      icon: '📊',
      head: {
        id: 41,
        username: 'xuan.kt',
        defaultName: 'Nguyễn Thị Thu Xuân',
        title: 'Phụ trách Kế Toán Trưởng',
        badge: 'Trưởng bộ phận',
        roleTag: 'HEAD'
      },
      groups: [
        {
          groupName: 'Kế toán viên',
          members: [
            { id: 42, username: 'bngoc.kt', defaultName: 'Đoàn Bảo Ngọc', title: 'Kế toán viên', roleTag: 'STAFF' },
            { id: 43, username: 'hthao.kt', defaultName: 'Trần Hiếu Thảo', title: 'Kế toán viên', roleTag: 'STAFF' }
          ]
        }
      ]
    },
    {
      id: 'marketing',
      code: 'MARKETING',
      name: 'Phòng Marketing & Truyền Thông',
      market: 'Chiến dịch Ads • Media • Social Media • CRM Digital',
      accentColor: '#4f46e5', // Indigo
      bgLight: '#eef2ff',
      borderColor: '#c7d2fe',
      icon: '🚀',
      head: {
        id: 1,
        username: 'admin',
        defaultName: 'Huỳnh Trọng Hiếu',
        title: 'Trưởng bộ phận Marketing / Admin CRM',
        badge: 'Trưởng bộ phận',
        roleTag: 'HEAD'
      },
      groups: [
        {
          groupName: 'Chuyên viên Marketing',
          members: [
            { id: 24, username: 'long.mkt', defaultName: 'Hồ Hải Long', title: 'Marketing Ads & Social', roleTag: 'STAFF' },
            { id: 74, username: 'kietchau.mkt', defaultName: 'Châu Quốc Kiệt', title: 'Media & Creative Content', roleTag: 'STAFF' }
          ]
        }
      ]
    }
  ]
};

// ═════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: MEMBER CARD VỚI AVATAR CHỐNG ẢNH LỖI (FALLBACK ROBUST)
// ═════════════════════════════════════════════════════════════════════
const MemberCard = ({ 
  memberConfig, 
  deptAccent = '#3b82f6', 
  isLeader = false, 
  isBOD = false, 
  onSelect, 
  isMatched = false, 
  isSelected = false, 
  isInChain = false,
  isChainActive = false,
  resolveUser 
}) => {
  const user = resolveUser(memberConfig);
  const [imgError, setImgError] = useState(false);

  const initials = getInitials(user.fullName || user.username);

  const isDimmed = isChainActive && !isInChain && !isSelected;
  const isChainAncestor = isInChain && !isSelected;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onSelect) onSelect(user);
      }}
      className={`org-member-card ${isLeader ? 'is-leader' : ''} ${isBOD ? 'is-bod' : ''} ${isMatched ? 'is-search-match' : ''} ${isSelected ? 'is-selected' : ''} ${isChainAncestor ? 'is-in-chain' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
      style={{
        '--dept-accent': deptAccent
      }}
    >
      {/* Crown / Leader Badge or Chain Badge */}
      {isChainAncestor ? (
        <div className="chain-ancestor-badge">
          <ShieldCheck size={11} className="text-blue-500" />
          <span>Cấp trên trực tiếp</span>
        </div>
      ) : isBOD ? (
        <div className="leader-crown-badge bod-badge">
          <Crown size={12} className="text-amber-400 fill-amber-300" />
          <span>{memberConfig.badge || 'Lãnh đạo'}</span>
        </div>
      ) : isLeader ? (
        <div className="leader-crown-badge">
          <Crown size={11} className="text-amber-500 fill-amber-400" />
          <span>{memberConfig.badge || 'Trưởng bộ phận'}</span>
        </div>
      ) : null}

      <div className="card-inner">
        {/* Avatar with Status Dot & Error Fallback */}
        <div className="avatar-wrapper">
          {!imgError && user.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={user.fullName} 
              className="avatar-img" 
              onError={() => setImgError(true)} 
            />
          ) : (
            <div className="avatar-fallback" style={{ background: isBOD ? '#1e293b' : deptAccent }}>
              {initials}
            </div>
          )}
          <span className={`status-indicator ${user.isActive ? 'online' : 'offline'}`} title={user.isActive ? 'Đang làm việc' : 'Đã nghỉ việc'} />
        </div>

        {/* Info */}
        <div className="info-wrapper">
          <div className="name-row">
            <span className="member-name" title={user.fullName}>
              {user.fullName}
            </span>
            {user.shortName && (
              <span className="short-name-pill">({user.shortName})</span>
            )}
          </div>

          <div className="member-title" title={user.title}>
            {user.title}
          </div>

          <div className="meta-row">
            <span className="username-tag">@{user.username}</span>
            {user.phone && (
              <a 
                href={`tel:${user.phone.replace(/[^\d+]/g, '')}`}
                onClick={(e) => e.stopPropagation()}
                className="phone-quick phone-quick-link" 
                title={`Bấm để gọi ngay: ${user.phone}`}
              >
                <PhoneCall size={10} /> {user.phone}
              </a>
            )}
          </div>
        </div>

        <div className="card-arrow">
          <ChevronRight size={14} />
        </div>
      </div>
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
// SUB-COMPONENT: SAFE AVATAR (TỰ ĐỘNG CHUYỂN SANG INITIALS KHI ẢNH LỖI/404)
// ═════════════════════════════════════════════════════════════════════
const SafeAvatar = ({ src, name, username, className, fallbackClassName, fallbackStyle }) => {
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [src]);

  if (!error && src) {
    return (
      <img 
        src={src} 
        alt={name || username || 'Avatar'} 
        className={className} 
        onError={() => setError(true)} 
      />
    );
  }

  return (
    <div className={fallbackClassName} style={fallbackStyle}>
      {getInitials(name || username)}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════════════
// COMPONENT CHÍNH: ORG CHART TAB PRO (PAN, ZOOM, OVERVIEW, FIT SCREEN)
// ═════════════════════════════════════════════════════════════════════
const OrgChartTab = ({ currentUser, addToast }) => {
  const [usersMap, setUsersMap] = useState(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('ALL');
  const [activeView, setActiveView] = useState('TREE'); // 'TREE' | 'GRID' | 'DIRECTORY'
  const [selectedMember, setSelectedMember] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printImageUrl, setPrintImageUrl] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // ── Pan & Zoom Engine State ──
  const [scale, setScale] = useState(0.68); // Mặc định mở ra là nhìn toàn diện
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSmoothTransition, setIsSmoothTransition] = useState(false);
  const isMovedRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const viewportRef = useRef(null);
  const contentRef = useRef(null);
  const chartExportRef = useRef(null);

  // 1. Tải danh sách User ngầm từ Database (không block giao diện)
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const map = new Map();
      (res.data || []).forEach(u => {
        map.set(u.id, u);
        if (u.username) map.set(u.username.toLowerCase(), u);
      });
      setUsersMap(map);
    } catch (err) {
      console.warn('Lỗi khi tải thông tin phụ nhân sự từ database:', err);
    }
  };

  // Helper tìm thông tin User đầy đủ từ Map DB
  const resolveUser = useCallback((memberConfig) => {
    const dbUser = usersMap.get(memberConfig.id) || (memberConfig.username ? usersMap.get(memberConfig.username.toLowerCase()) : null);
    
    return {
      id: memberConfig.id,
      username: memberConfig.username || dbUser?.username || '',
      fullName: dbUser?.full_name || memberConfig.defaultName,
      title: memberConfig.title || dbUser?.position || 'Nhân sự',
      email: dbUser?.email || '',
      phone: dbUser?.phone || '',
      avatarUrl: dbUser?.avatar_url || '',
      gender: dbUser?.gender || '',
      birthDate: dbUser?.birth_date || null,
      bus: dbUser?.bus || [],
      isActive: dbUser ? dbUser.is_active : true,
      roleTag: memberConfig.roleTag || 'STAFF',
      shortName: memberConfig.shortName || '',
      badge: memberConfig.badge || ''
    };
  }, [usersMap]);

  // 2. Chức năng "Vừa màn hình / Nhìn toàn cảnh" (Fit to Screen)
  const fitToScreen = useCallback(() => {
    if (!viewportRef.current) return;
    setIsSmoothTransition(true);
    setTimeout(() => setIsSmoothTransition(false), 500);

    const vp = viewportRef.current.getBoundingClientRect();
    // Tổng chiều rộng 7 khối phòng ban: 7 * 295px + 6 * 18px = 2173px + lề = 2260px
    const totalContentWidth = 2260;
    
    // Trên điện thoại (vp.width < 768), cho phép scale nhỏ hơn (0.18 - 0.22) để người dùng có thể nhìn thấy trọn vẹn toàn cảnh nếu muốn
    const isMobile = vp.width < 768;
    const minScale = isMobile ? 0.20 : 0.38;
    const targetScale = Math.min(1.0, Math.max(minScale, (vp.width - (isMobile ? 20 : 48)) / totalContentWidth));
    setScale(targetScale);
    
    // Căn giữa ngang và lùi lề trên hợp lý
    const centeredX = Math.max(isMobile ? 10 : 20, (vp.width - totalContentWidth * targetScale) / 2);
    setPan({ x: centeredX, y: isMobile ? 16 : 25 });
  }, []);

  // Tự động Fit to screen khi mở tab
  useEffect(() => {
    if (activeView === 'TREE') {
      const timer = setTimeout(() => {
        fitToScreen();
      }, 60);
      window.addEventListener('resize', fitToScreen);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', fitToScreen);
      };
    }
  }, [activeView, fitToScreen]);

  // 3. LẮNG NGHE PHÍM ESC -> THOÁT POPUP HỒ SƠ / HUỶ TÌM KIẾM NGAY LẬP TỨC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
        if (selectedMember) {
          setSelectedMember(null);
        } else if (searchQuery) {
          setSearchQuery('');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMember, searchQuery]);

  // Click chọn member an toàn (tránh kích hoạt nhầm khi vuốt kéo canvas trên mobile / kéo chuột)
  const handleSelectMember = useCallback((member) => {
    if (isMovedRef.current) return;
    setSelectedMember(member);
  }, []);

  // 4. Xử lý Pan kéo thả chuột (Click & Drag to Pan)
  const handleMouseDown = (e) => {
    if (activeView !== 'TREE') return;
    // Không pan nếu bấm vào button, input, link hoặc drawer
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.drawer-sheet')) {
      return;
    }
    setIsSmoothTransition(false);
    setIsPanning(true);
    isMovedRef.current = false;
    dragStartRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  const handleMouseMove = (e) => {
    if (!isPanning || activeView !== 'TREE') return;
    const deltaX = Math.abs(e.clientX - (dragStartRef.current.x + pan.x));
    const deltaY = Math.abs(e.clientY - (dragStartRef.current.y + pan.y));
    if (deltaX > 4 || deltaY > 4) {
      isMovedRef.current = true;
    }
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // 5. Xử lý Multi-Touch Events cho Màn hình điện thoại & Tablet:
  // - 1 ngón: Kéo lướt (Pan) di chuyển mượt mà
  // - 2 ngón: Chụm / phóng to thu nhỏ (Pinch-to-Zoom) chính xác theo tâm 2 ngón tay
  const touchModeRef = useRef(null); // 'pan' | 'pinch' | null
  const touchStartRef = useRef({ x: 0, y: 0 });
  const pinchStartDistRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const pinchCenterRef = useRef({ x: 0, y: 0 });
  const pinchStartPanRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    if (activeView !== 'TREE') return;
    // Không can thiệp nếu chạm vào button, input, link hoặc drawer
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('a') || e.target.closest('.drawer-sheet')) {
      return;
    }
    setIsSmoothTransition(false);

    if (e.touches.length === 1) {
      touchModeRef.current = 'pan';
      isMovedRef.current = false;
      touchStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
      setIsPanning(true);
    } else if (e.touches.length >= 2) {
      touchModeRef.current = 'pinch';
      isMovedRef.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartDistRef.current = dist > 0 ? dist : 1;
      pinchStartScaleRef.current = scale;
      pinchStartPanRef.current = { ...pan };

      const vp = viewportRef.current?.getBoundingClientRect();
      const rectLeft = vp ? vp.left : 0;
      const rectTop = vp ? vp.top : 0;
      pinchCenterRef.current = {
        x: ((t1.clientX + t2.clientX) / 2) - rectLeft,
        y: ((t1.clientY + t2.clientY) / 2) - rectTop
      };
      setIsPanning(true);
    }
  };

  const handleTouchMove = (e) => {
    if (activeView !== 'TREE') return;

    if (touchModeRef.current === 'pan' && e.touches.length === 1) {
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const curX = clientX - touchStartRef.current.x;
      const curY = clientY - touchStartRef.current.y;

      const deltaX = Math.abs(curX - pan.x);
      const deltaY = Math.abs(curY - pan.y);
      if (deltaX > 5 || deltaY > 5) {
        isMovedRef.current = true;
      }
      setPan({ x: curX, y: curY });
    } else if (e.touches.length >= 2 && pinchStartDistRef.current > 0) {
      isMovedRef.current = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const zoomFactor = dist / pinchStartDistRef.current;

      const newScale = Math.min(2.5, Math.max(0.18, pinchStartScaleRef.current * zoomFactor));
      const { x: midX, y: midY } = pinchCenterRef.current;
      const startPan = pinchStartPanRef.current;
      const startScale = pinchStartScaleRef.current;

      const newPanX = midX - (midX - startPan.x) * (newScale / startScale);
      const newPanY = midY - (midY - startPan.y) * (newScale / startScale);

      setScale(newScale);
      setPan({ x: newPanX, y: newPanY });
    }
  };

  const handleTouchEnd = (e) => {
    if (e.touches.length === 1) {
      // Chuyển mượt từ zoom 2 ngón sang kéo 1 ngón
      touchModeRef.current = 'pan';
      touchStartRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    } else if (e.touches.length === 0) {
      touchModeRef.current = null;
      setIsPanning(false);
    }
  };

  // 6. Lắng nghe Con lăn chuột (Wheel) -> Trực tiếp Zoom In / Zoom Out theo điểm trỏ chuột
  useEffect(() => {
    const el = viewportRef.current;
    if (!el || activeView !== 'TREE') return;

    const onWheel = (e) => {
      e.preventDefault();
      setIsSmoothTransition(false);

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Lăn chuột lên (deltaY < 0) -> Phóng to (Zoom In)
      // Lăn chuột xuống (deltaY > 0) -> Thu nhỏ (Zoom Out)
      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;

      setScale(prevScale => {
        const newScale = Math.min(2.5, Math.max(0.18, prevScale * zoomFactor));
        if (newScale === prevScale) return prevScale;

        // Phóng to / thu nhỏ tập trung chính xác vào điểm con trỏ chuột đang chỉ
        setPan(prevPan => ({
          x: mouseX - (mouseX - prevPan.x) * (newScale / prevScale),
          y: mouseY - (mouseY - prevPan.y) * (newScale / prevScale)
        }));

        return newScale;
      });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [activeView]);

  // Phóng to / thu nhỏ mượt mà bằng nút bấm HUD
  const handleZoom = (direction) => {
    setIsSmoothTransition(true);
    setTimeout(() => setIsSmoothTransition(false), 300);

    const vpEl = viewportRef.current;
    if (!vpEl) return;
    const rect = vpEl.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const zoomFactor = direction === 'in' ? 1.18 : 0.84;

    setScale(prevScale => {
      const newScale = Math.min(2.5, Math.max(0.18, prevScale * zoomFactor));
      if (newScale === prevScale) return prevScale;

      setPan(prevPan => ({
        x: centerX - (centerX - prevPan.x) * (newScale / prevScale),
        y: centerY - (centerY - prevPan.y) * (newScale / prevScale)
      }));

      return newScale;
    });
  };

  // 7. Nhảy trực tiếp đến Phòng ban khi bấm nút lọc (Tự động căn chỉnh vừa vặn cả trên Mobile & Desktop)
  const handleJumpToDept = (deptCode) => {
    setSelectedDeptFilter(deptCode);

    if (activeView !== 'TREE') {
      return;
    }

    if (deptCode === 'ALL') {
      fitToScreen();
      return;
    }

    setIsSmoothTransition(true);
    setTimeout(() => setIsSmoothTransition(false), 500);

    const vpEl = viewportRef.current;
    if (!vpEl) return;
    const vpRect = vpEl.getBoundingClientRect();
    const isMobile = vpRect.width < 768;

    let targetCenterX = 0;
    let targetTop = 0;
    let targetScale = isMobile ? 0.85 : 0.95;

    if (deptCode === 'BOD') {
      // Chiều rộng thẻ BOD là 640px, trên mobile tự scale vừa màn hình
      targetScale = isMobile ? Math.min(0.85, (vpRect.width - 24) / 640) : 0.9;
      // Tổng chiều rộng 7 khối: 7 * 295 + 6 * 18 = 2173px
      // Padding bên trái: 40px => Tọa độ tâm BOD = 40 + 2173 / 2 = 1126.5px
      targetCenterX = 1126.5;
      targetTop = 20;
    } else {
      const deptIndex = ORG_STRUCTURE.departments.findIndex(d => d.code === deptCode);
      if (deptIndex >= 0) {
        const colWidth = 295;
        const gap = 18;
        targetScale = isMobile ? Math.min(0.95, (vpRect.width - 24) / colWidth) : 0.95;
        // Padding trái = 40px, mỗi cột rộng 295px, gap 18px
        targetCenterX = 40 + deptIndex * (colWidth + gap) + colWidth / 2;
        // Điểm bắt đầu của các cột phòng ban: 20 (padding) + 175 (bod) + 34 (stem) + 24 (drop) = 253px
        targetTop = 253;
      }
    }

    // Căn giữa ngang chính xác trên viewport
    const targetPanX = (vpRect.width / 2) - (targetCenterX * targetScale);
    // Đưa đỉnh thẻ về vị trí cách mép trên 25px (mobile) hoặc 35px (desktop)
    const targetPanY = (isMobile ? 20 : 35) - (targetTop * targetScale);

    setScale(targetScale);
    setPan({ x: targetPanX, y: targetPanY });
  };

  // ── TIỆN ÍCH LÀM SẠCH SỐ ĐIỆN THOẠI ĐỂ GỌI TRỰC TIẾP TRÊN MOBILE / DESKTOP ──
  const cleanPhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.replace(/[^\d+]/g, '');
  };

  // ── TÍNH TOÁN CHUỖI PHÂN CẤP (CHAIN OF COMMAND), QUẢN LÝ & ĐỘI NGŨ TRỰC THUỘC ──
  const getHierarchyForMember = useCallback((memberId) => {
    if (!memberId) return null;
    
    const ceoConfig = ORG_STRUCTURE.board.members.find(m => m.id === 14);
    const viceDirConfig = ORG_STRUCTURE.board.members.find(m => m.id === 33);
    const ceo = ceoConfig ? resolveUser(ceoConfig) : null;
    const viceDir = viceDirConfig ? resolveUser(viceDirConfig) : null;

    // 1. Nếu là CEO (id 14 - Nguyễn Nhất Vũ)
    if (memberId === 14) {
      const heads = ORG_STRUCTURE.departments
        .filter(d => d.head.id !== 33)
        .map(d => resolveUser(d.head));
      return {
        deptCode: 'BOD',
        chainIds: new Set([14]),
        manager: null,
        subordinates: [viceDir, ...heads].filter(Boolean)
      };
    }

    // 2. Nếu là Phó Giám Đốc (id 33 - Phan Hoàng Trúc Vy)
    if (memberId === 33) {
      const bu3 = ORG_STRUCTURE.departments.find(d => d.code === 'BU3');
      const bu3Subs = [];
      if (bu3) {
        bu3.groups.forEach(g => {
          g.members.forEach(m => bu3Subs.push(resolveUser(m)));
        });
      }
      return {
        deptCode: 'BOD',
        chainIds: new Set([14, 33]),
        manager: ceo,
        subordinates: bu3Subs
      };
    }

    // 3. Tìm xem member thuộc Department nào
    for (const dept of ORG_STRUCTURE.departments) {
      const headUser = resolveUser(dept.head);
      const viceHeadUser = dept.viceHead ? resolveUser(dept.viceHead) : null;

      // A. Nếu là Trưởng bộ phận
      if (dept.head.id === memberId) {
        const subs = [];
        if (viceHeadUser) subs.push(viceHeadUser);
        dept.groups.forEach(g => {
          g.members.forEach(m => subs.push(resolveUser(m)));
        });
        return {
          deptCode: dept.code,
          chainIds: new Set([14, 33, memberId]),
          manager: ceo,
          subordinates: subs
        };
      }

      // B. Nếu là Phó phòng (ví dụ Bùi Ngọc Hiếu ở BU2)
      if (dept.viceHead && dept.viceHead.id === memberId) {
        const subs = [];
        dept.groups.forEach(g => {
          g.members.forEach(m => subs.push(resolveUser(m)));
        });
        return {
          deptCode: dept.code,
          chainIds: new Set([14, 33, dept.head.id, memberId]),
          manager: headUser,
          subordinates: subs
        };
      }

      // C. Tìm trong các groups chuyên môn
      for (const group of dept.groups) {
        const memberInGroup = group.members.find(m => m.id === memberId);
        if (memberInGroup) {
          const leadInGroup = group.members.find(m => m.roleTag === 'LEAD_OPS');

          if (leadInGroup && leadInGroup.id === memberId) {
            const otherGroupMembers = group.members
              .filter(m => m.id !== memberId)
              .map(m => resolveUser(m));
            return {
              deptCode: dept.code,
              chainIds: new Set([14, 33, dept.head.id, memberId]),
              manager: headUser,
              subordinates: otherGroupMembers
            };
          }

          if (leadInGroup && leadInGroup.id !== memberId) {
            const leadUser = resolveUser(leadInGroup);
            return {
              deptCode: dept.code,
              chainIds: new Set([14, 33, dept.head.id, leadInGroup.id, memberId]),
              manager: leadUser,
              subordinates: []
            };
          }

          const directManager = viceHeadUser || headUser;
          const chainIds = new Set([14, 33, dept.head.id]);
          if (viceHeadUser) chainIds.add(viceHeadUser.id);
          chainIds.add(memberId);

          return {
            deptCode: dept.code,
            chainIds,
            manager: directManager,
            subordinates: []
          };
        }
      }
    }

    return null;
  }, [resolveUser]);

  // Thông tin chuỗi phân cấp hiện tại dựa trên selectedMember
  const chainInfo = useMemo(() => {
    if (!selectedMember) return null;
    return getHierarchyForMember(selectedMember.id);
  }, [selectedMember, getHierarchyForMember]);

  const activeChainIds = useMemo(() => {
    return chainInfo ? chainInfo.chainIds : null;
  }, [chainInfo]);

  const activeChainDeptCode = useMemo(() => {
    return chainInfo ? chainInfo.deptCode : null;
  }, [chainInfo]);

  // Chuyển nhanh giữa Quản lý và Cấp dưới (Cross-navigation)
  const handleCrossNavigate = useCallback((targetUser) => {
    if (!targetUser) return;
    setSelectedMember(targetUser);
    
    if (activeView === 'TREE') {
      const hierarchy = getHierarchyForMember(targetUser.id);
      if (hierarchy) {
        handleJumpToDept(hierarchy.deptCode);
      }
    }
  }, [activeView, getHierarchyForMember]);

  // Kiểm tra Search Match
  const isMemberMatch = (member) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      (member.fullName && member.fullName.toLowerCase().includes(q)) ||
      (member.username && member.username.toLowerCase().includes(q)) ||
      (member.title && member.title.toLowerCase().includes(q)) ||
      (member.email && member.email.toLowerCase().includes(q)) ||
      (member.phone && member.phone.includes(q))
    );
  };

  // Copy Clipboard
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    if (addToast) addToast(`Đã sao chép: ${text}`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Lắng nghe sau khi in xong để tự động xóa class in ấn
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('is-printing-org-chart');
      setIsPrinting(false);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, []);

  // In / Xuất file PDF Sơ đồ tổ chức (A4 Ngang, tự động căn chỉnh và giữ 100% màu sắc)
  const handlePrint = async () => {
    if (isPrinting) return;
    try {
      setIsPrinting(true);
      if (addToast) addToast('Đang kết xuất bản in PDF sắc nét...', 'info');

      // 1. Nếu đang ở view khác, tạm chuyển sang TREE để render chart
      const originalView = activeView;
      if (originalView !== 'TREE') {
        setActiveView('TREE');
        await new Promise(r => setTimeout(r, 200));
      }

      // 2. Tạm đưa về scale: 1 để html2canvas chụp sắc nét 100% không bị lệch toạ độ
      const prevScale = scale;
      const prevPan = pan;
      setScale(1);
      setPan({ x: 40, y: 40 });

      await new Promise(r => setTimeout(r, 300));

      // 3. Chụp toàn bộ sơ đồ 2260px ở độ phân giải 2x (retina)
      if (chartExportRef.current) {
        const canvas = await html2canvas(chartExportRef.current, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        setPrintImageUrl(imgData);
      }

      // 4. Khôi phục lại trạng thái giao diện tương tác ban đầu
      setScale(prevScale);
      setPan(prevPan);
      if (originalView !== 'TREE') {
        setActiveView(originalView);
      }

      // 5. Thêm class in ấn và mở hộp thoại Print / Save as PDF của trình duyệt
      document.body.classList.add('is-printing-org-chart');
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          document.body.classList.remove('is-printing-org-chart');
          setIsPrinting(false);
        }, 3000);
      }, 150);
    } catch (err) {
      console.error('Lỗi khi chuẩn bị bản in sơ đồ:', err);
      setIsPrinting(false);
      document.body.classList.add('is-printing-org-chart');
      window.print();
    }
  };

  return (
    <div className="org-chart-master-container">
      {/* ── Scoped CSS Styles ── */}
      <style>{`
        .org-chart-master-container {
          height: calc(100vh - 145px);
          height: calc(100dvh - 120px);
          min-height: 480px;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #0f172a;
          overflow: hidden;
          position: relative;
        }

        /* ── COMPACT TOOLBAR HEADER (SLIM SINGLE ROW) ── */
        .org-header {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.45rem 1.25rem;
          display: flex;
          flex-wrap: nowrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          z-index: 30;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
        }

        .org-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: nowrap;
          flex: 1;
          min-width: 0;
        }

        .view-switcher {
          display: inline-flex;
          flex-shrink: 0;
          background: #f1f5f9;
          padding: 3px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border: none;
          background: transparent;
          font-size: 0.78rem;
          font-weight: 600;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }

        .view-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        .search-box {
          position: relative;
          width: 320px;
          max-width: 100%;
          flex-shrink: 1;
        }

        .search-box input {
          width: 100%;
          padding: 0.42rem 0.75rem 0.42rem 2.1rem;
          font-size: 0.82rem;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          outline: none;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .search-box input:focus {
          background: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .search-icon {
          position: absolute;
          left: 0.7rem;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .org-actions-group {
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .view-btn {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.35rem 0.65rem;
          border: none;
          background: transparent;
          font-size: 0.78rem;
          font-weight: 600;
          color: #64748b;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .view-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
        }

        .btn-action-tool {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          padding: 0.4rem 0.75rem;
          font-size: 0.78rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          transition: all 0.15s;
        }

        .btn-action-tool:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        .btn-action-tool.primary {
          background: #2563eb;
          color: #ffffff;
          border-color: #1d4ed8;
        }
        .btn-action-tool.primary:hover {
          background: #1d4ed8;
        }

        /* ── SUB-BAR: QUICK JUMP BY BU ── */
        .org-filter-bar {
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.5rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          overflow-x: auto;
          flex-shrink: 0;
          z-index: 20;
        }

        .filter-chip-btn {
          white-space: nowrap;
          padding: 0.28rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #475569;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
        }

        .filter-chip-btn:hover {
          border-color: #cbd5e1;
          background: #f1f5f9;
        }

        .filter-chip-btn.active {
          background: #0f172a;
          color: #ffffff;
          border-color: #0f172a;
        }

        /* ── INFINITE PAN/ZOOM VIEWPORT ── */
        .org-viewport-area {
          flex: 1;
          position: relative;
          overflow: hidden;
          cursor: grab;
          user-select: none;
          touch-action: none; /* Khóa gesture trình duyệt để pinch & pan mượt mà trên mobile */
          background: #f8fafc;
          background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
          background-size: 24px 24px;
        }

        .org-viewport-area.is-panning {
          cursor: grabbing;
        }

        .org-infinite-content {
          position: absolute;
          top: 0;
          left: 0;
          transform-origin: 0 0;
          will-change: transform;
        }

        /* ── TREE VIEW CSS STRUCTURE ── */
        .tree-level-bod {
          display: flex;
          justify-content: center;
          margin-bottom: 0;
        }

        .bod-super-card {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 16px;
          padding: 1.25rem 1.6rem;
          color: #ffffff;
          box-shadow: 0 15px 35px -8px rgba(15, 23, 42, 0.35);
          width: 640px;
          max-width: 95vw;
          position: relative;
        }

        .bod-header-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(245, 158, 11, 0.22);
          border: 1px solid rgba(245, 158, 11, 0.45);
          color: #fbbf24;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 0.2rem 0.65rem;
          border-radius: 9999px;
          margin-bottom: 0.75rem;
        }

        .bod-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Connector Stem from BOD down */
        .tree-stem-down {
          width: 3px;
          height: 34px;
          background: #94a3b8;
          margin: 0 auto;
        }

        .tree-horizontal-rail {
          height: 3px;
          background: #94a3b8;
          border-radius: 2px;
          margin: 0 auto;
        }

        .tree-departments-row {
          display: flex;
          gap: 18px;
          align-items: flex-start;
          width: max-content;
          margin-top: 0;
        }

        .dept-tree-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 295px;
          flex-shrink: 0;
        }

        .dept-drop-line {
          width: 3px;
          height: 24px;
          background: #94a3b8;
        }

        /* ── DEPARTMENT CONTAINER ── */
        .dept-box {
          width: 100%;
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 14px -3px rgba(0, 0, 0, 0.06);
          display: flex;
          flex-direction: column;
          height: auto;
          min-height: fit-content;
          transition: all 0.2s;
        }

        .dept-box:hover {
          box-shadow: 0 8px 22px -4px rgba(0, 0, 0, 0.1);
          border-color: #cbd5e1;
        }

        .dept-box-header {
          padding: 0.85rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          border-top-left-radius: 11px;
          border-top-right-radius: 11px;
        }

        .dept-badge-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.25rem;
        }

        .dept-code-tag {
          font-size: 0.68rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .dept-count-pill {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          background: #ffffff;
          padding: 0.1rem 0.45rem;
          border-radius: 9999px;
          border: 1px solid #e2e8f0;
        }

        .dept-box-name {
          font-size: 0.92rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .dept-market-sub {
          font-size: 0.73rem;
          color: #64748b;
          margin: 0.25rem 0 0;
          line-height: 1.4;
        }

        .dept-box-body {
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          background: #fafafa;
          border-bottom-left-radius: 11px;
          border-bottom-right-radius: 11px;
          flex: 1;
          height: auto;
        }

        .dept-subgroup-label {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.04em;
          margin: 0.35rem 0 0.1rem;
        }

        /* ── MEMBER CARD STYLES ── */
        .org-member-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 0.55rem 0.65rem;
          cursor: pointer;
          transition: all 0.15s ease;
          position: relative;
        }

        .org-member-card:hover {
          transform: translateY(-2px);
          border-color: var(--dept-accent, #3b82f6);
          box-shadow: 0 6px 14px -3px rgba(0, 0, 0, 0.09);
        }

        .org-member-card.is-leader {
          border-left: 3.5px solid var(--dept-accent, #f59e0b);
          background: #ffffff;
          box-shadow: 0 2px 7px -1px rgba(0, 0, 0, 0.05);
        }

        .leader-crown-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #b45309;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
        }

        .leader-crown-badge.bod-badge {
          color: #fbbf24;
        }

        .org-member-card.is-search-match {
          border-color: #ef4444 !important;
          background: #fef2f2 !important;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.25) !important;
        }

        .org-member-card.is-in-chain {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.45), 0 4px 12px rgba(59, 130, 246, 0.1) !important;
          background: #ffffff !important;
          transform: translateY(-2px);
          opacity: 1 !important;
          z-index: 5;
        }

        .org-member-card.is-selected {
          border-color: #2563eb !important;
          box-shadow: 0 0 0 3.5px #3b82f6, 0 10px 24px rgba(37, 99, 235, 0.3) !important;
          background: #ffffff !important;
          transform: translateY(-3px) scale(1.02);
          opacity: 1 !important;
          z-index: 10;
        }

        .org-member-card.is-dimmed {
          opacity: 0.32 !important;
          filter: grayscale(35%);
          transition: all 0.25s ease;
        }

        .org-member-card.is-dimmed:hover {
          opacity: 0.85 !important;
          filter: grayscale(0%);
        }

        .chain-ancestor-badge {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.65rem;
          font-weight: 700;
          color: #2563eb;
          margin-bottom: 0.25rem;
          text-transform: uppercase;
          background: #eff6ff;
          padding: 1px 6px;
          border-radius: 4px;
          width: fit-content;
        }

        .phone-quick-link {
          text-decoration: none;
          color: inherit;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 1px 4px;
          border-radius: 4px;
          transition: all 0.15s;
          cursor: pointer;
        }

        .phone-quick-link:hover {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .floating-chain-banner {
          position: absolute;
          top: 14px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(8px);
          color: #ffffff;
          padding: 0.4rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.78rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
          z-index: 25;
          animation: slideDownFade 0.2s ease-out;
        }

        .btn-clear-chain {
          background: rgba(255, 255, 255, 0.22);
          border: none;
          color: #ffffff;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 9999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 3px;
          transition: background 0.15s;
        }

        .btn-clear-chain:hover {
          background: rgba(255, 255, 255, 0.38);
        }

        @keyframes slideDownFade {
          from { opacity: 0; transform: translate(-50%, -10px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        .card-inner {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
        }

        .avatar-wrapper {
          position: relative;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .avatar-img {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          object-fit: cover;
          border: 1px solid #e2e8f0;
          background: #f1f5f9;
        }

        .avatar-fallback {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.82rem;
          font-weight: 800;
          color: #ffffff;
        }

        .status-indicator {
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 9px;
          height: 9px;
          border-radius: 9999px;
          border: 2px solid #ffffff;
        }

        .status-indicator.online { background: #10b981; }
        .status-indicator.offline { background: #cbd5e1; }

        .info-wrapper {
          flex: 1;
          min-width: 0;
        }

        .name-row {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 0.3rem;
          line-height: 1.3;
        }

        .member-name {
          font-size: 0.86rem;
          font-weight: 700;
          color: #0f172a;
          white-space: normal !important;
          word-break: break-word;
          line-height: 1.3;
        }

        .short-name-pill {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
        }

        .member-title {
          font-size: 0.72rem;
          color: #64748b;
          white-space: normal !important;
          word-break: break-word;
          line-height: 1.35;
          margin-top: 0.15rem;
        }

        .meta-row {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-top: 0.2rem;
          font-size: 0.68rem;
          color: #94a3b8;
          flex-wrap: wrap;
        }

        .username-tag {
          font-weight: 600;
          color: #64748b;
        }

        .phone-quick {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
          color: #2563eb;
        }

        .card-arrow {
          color: #cbd5e1;
          opacity: 0;
          transition: opacity 0.15s;
          margin-top: 8px;
        }

        .org-member-card:hover .card-arrow {
          opacity: 1;
        }

        /* ── GRID VIEW (SCROLLABLE) ── */
        .org-grid-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }

        .org-grid-layout {
          width: 100%;
          max-width: 1400px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 1.5rem;
          align-items: start;
          height: auto;
          min-height: min-content;
          padding-bottom: 3.5rem;
        }

        /* ── DIRECTORY TABLE VIEW ── */
        .org-directory-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 1.5rem;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          min-height: 0;
          -webkit-overflow-scrolling: touch;
        }

        .org-directory-card {
          width: 100%;
          max-width: 1200px;
          background: #fff;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          overflow: hidden;
        }

        .directory-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .directory-table th {
          background: #f8fafc;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 700;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .directory-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .directory-table tr:hover td {
          background: #f8fafc;
        }

        /* ── FLOATING HUD CONTROLS (ZOOM & PAN HINT) ── */
        .floating-canvas-hud {
          position: absolute;
          bottom: 24px;
          left: 24px;
          background: #ffffff;
          border: 1.5px solid #cbd5e1;
          border-radius: 12px;
          padding: 6px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 10px 25px -3px rgba(15, 23, 42, 0.16), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          z-index: 50;
        }

        .hud-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.15s;
        }

        .hud-btn:hover {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
          transform: translateY(-1px);
        }

        .hud-text {
          font-size: 0.8rem;
          font-weight: 800;
          color: #0f172a;
          min-width: 44px;
          text-align: center;
          padding: 0 4px;
        }

        .hud-hint {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.72rem;
          color: #475569;
          font-weight: 600;
          border-left: 1px solid #e2e8f0;
          padding-left: 10px;
          margin-left: 4px;
        }

        /* ── DRAWER PROFILE MODAL ── */
        .drawer-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.4);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          justify-content: flex-end;
          animation: fadeIn 0.2s ease-out;
        }

        .drawer-sheet {
          width: 100%;
          max-width: 380px;
          background: #ffffff;
          height: 100%;
          box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.2);
          display: flex;
          flex-direction: column;
          animation: slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .drawer-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f8fafc;
        }

        .drawer-body {
          flex: 1;
          overflow-y: auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .drawer-avatar-hero {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
        }

        .drawer-avatar-img {
          width: 86px;
          height: 86px;
          border-radius: 18px;
          object-fit: cover;
          border: 3px solid #f1f5f9;
          box-shadow: 0 4px 10px rgba(0,0,0,0.1);
        }

        .drawer-avatar-fallback {
          width: 86px;
          height: 86px;
          border-radius: 18px;
          background: #0f172a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          font-weight: 800;
        }

        .drawer-contact-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.65rem 0.85rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-size: 0.85rem;
        }

        .drawer-quick-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .btn-quick-call, .btn-quick-mail {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.55rem;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.82rem;
          text-decoration: none;
          color: #fff;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          transition: all 0.15s ease;
        }

        .btn-quick-call:hover, .btn-quick-mail:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
          box-shadow: 0 4px 10px rgba(0,0,0,0.15);
        }

        .btn-quick-call { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .btn-quick-mail { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }

        .btn-quick-call.disabled, .btn-quick-mail.disabled {
          opacity: 0.45;
          cursor: not-allowed;
          box-shadow: none;
          filter: none;
        }

        /* ── HIERARCHY IN DRAWER (CẤP TRÊN & ĐỘI NGŨ) ── */
        .drawer-hierarchy-box {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .drawer-section-title {
          font-size: 0.74rem;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          margin-bottom: 0.25rem;
        }

        .drawer-manager-card {
          background: #ffffff;
          border: 1.5px solid #bfdbfe;
          border-radius: 10px;
          padding: 0.65rem 0.85rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.06);
        }

        .drawer-manager-card:hover {
          background: #eff6ff;
          border-color: #3b82f6;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.15);
        }

        .manager-card-left {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          min-width: 0;
        }

        .manager-avatar-img, .manager-avatar-fallback {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .manager-avatar-img {
          object-fit: cover;
          border: 1px solid #cbd5e1;
        }

        .manager-avatar-fallback {
          background: #1e293b;
          color: #fff;
          font-weight: 800;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .manager-name {
          font-size: 0.86rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .manager-title {
          font-size: 0.72rem;
          color: #64748b;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .manager-card-right {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #2563eb;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .drawer-ceo-badge {
          background: #fef3c7;
          border: 1px solid #fde68a;
          color: #92400e;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .drawer-subordinates-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          max-height: 175px;
          overflow-y: auto;
          padding-right: 2px;
        }

        .drawer-subordinate-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 0.45rem 0.65rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .drawer-subordinate-item:hover {
          background: #f0fdf4;
          border-color: #86efac;
          transform: translateX(2px);
        }

        .sub-avatar-img, .sub-avatar-fallback {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          flex-shrink: 0;
          margin-right: 0.5rem;
        }

        .sub-avatar-img {
          object-fit: cover;
          border: 1px solid #cbd5e1;
        }

        .sub-avatar-fallback {
          background: #334155;
          color: #fff;
          font-weight: 700;
          font-size: 0.72rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sub-info {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .sub-name {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sub-title {
          font-size: 0.7rem;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sub-arrow {
          color: #94a3b8;
          flex-shrink: 0;
        }

        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        /* ── MOBILE RESPONSIVE OPTIMIZATION (< 768px) ── */
        .btn-label-mobile {
          display: none;
        }
        .btn-label-desktop {
          display: inline;
        }
        .esc-hint-badge {
          display: inline-flex;
          align-items: center;
        }

        .btn-drawer-close {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          transition: all 0.15s;
        }
        .btn-drawer-close:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        @media (max-width: 768px) {
          .btn-label-mobile {
            display: inline;
          }
          .btn-label-desktop {
            display: none;
          }
          .esc-hint-badge {
            display: none !important;
          }

          .org-chart-master-container {
            height: calc(100vh - 110px);
            height: calc(100dvh - 90px);
            min-height: 400px;
          }

          /* Header gọn gàng trên mobile */
          .org-header {
            padding: 0.5rem 0.65rem;
            gap: 0.45rem;
            flex-direction: column;
            align-items: stretch;
          }

          .org-header-left {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 0.45rem;
            width: 100%;
          }

          .search-box {
            width: 100%;
            min-width: 0;
          }

          .search-box input {
            padding: 0.4rem 0.75rem 0.4rem 2rem;
            font-size: 0.8rem;
          }

          .view-switcher {
            width: 100%;
            display: flex;
          }

          .view-btn {
            flex: 1;
            justify-content: center;
            padding: 0.35rem 0.2rem;
            font-size: 0.72rem;
          }

          .org-actions-group {
            width: 100%;
            display: flex;
            justify-content: space-between;
            gap: 0.35rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .btn-action-tool {
            flex: 1;
            justify-content: center;
            padding: 0.35rem 0.4rem;
            font-size: 0.72rem;
            white-space: nowrap;
          }

          /* Thanh lọc phòng ban cuộn ngang mượt */
          .org-filter-bar {
            padding: 0.35rem 0.65rem;
            gap: 0.35rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .org-filter-bar::-webkit-scrollbar {
            display: none;
          }

          .filter-chip-btn {
            padding: 0.25rem 0.6rem;
            font-size: 0.7rem;
            flex-shrink: 0;
          }

          /* Floating HUD controls trên điện thoại */
          .floating-canvas-hud {
            bottom: 12px;
            left: 12px;
            padding: 4px 6px;
            gap: 4px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          }

          .hud-hint {
            display: none !important;
          }

          .hud-btn {
            width: 32px;
            height: 32px;
          }

          .hud-text {
            font-size: 0.75rem;
            min-width: 36px;
          }

          /* Drawer Profile toàn màn hình trên điện thoại */
          .drawer-overlay {
            justify-content: flex-end;
            background: rgba(15, 23, 42, 0.55);
          }

          .drawer-sheet {
            max-width: 100% !important;
            width: 100% !important;
            height: 100% !important;
            border-radius: 0;
            box-shadow: none;
          }

          .drawer-header {
            padding: 0.85rem 1rem;
          }

          .btn-drawer-close {
            width: 38px;
            height: 38px;
            background: #f1f5f9;
          }

          .drawer-body {
            padding: 1rem 1rem 2.5rem;
            -webkit-overflow-scrolling: touch;
          }

          .drawer-quick-actions {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }

          .btn-quick-call, .btn-quick-mail {
            padding: 0.75rem 0.5rem;
            font-size: 0.82rem;
          }

          .drawer-contact-item {
            padding: 0.7rem 0.8rem;
            font-size: 0.82rem;
          }

          /* Khối phòng ban Grid View trên mobile */
          .org-grid-container {
            padding: 0.65rem;
          }

          .org-grid-layout {
            grid-template-columns: 1fr;
            gap: 1rem;
            padding-bottom: 2rem;
          }

          /* Danh bạ Table trên mobile */
          .org-directory-container {
            padding: 0.5rem;
          }

          .org-directory-card {
            border-radius: 8px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }

          .directory-table {
            min-width: 600px;
          }
        }

        /* ── PRINT VIEW OPTIMIZATION (A4 LANDSCAPE PDF) ── */
        .org-chart-print-area {
          display: none;
        }

        @media print {
          @page {
            size: A4 landscape !important;
            margin: 4mm !important;
          }

          body * {
            visibility: hidden !important;
          }

          .org-chart-master-container {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          .org-header,
          .org-filter-bar,
          .org-viewport-area,
          .org-grid-container,
          .org-directory-container,
          .floating-canvas-hud,
          .drawer-overlay {
            display: none !important;
            visibility: hidden !important;
          }

          .org-chart-print-area,
          .org-chart-print-area * {
            visibility: visible !important;
            display: block;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .org-chart-print-area {
            display: block !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 289mm !important;
            background: #ffffff !important;
            z-index: 9999999 !important;
            margin: 0 auto !important;
            padding: 2mm 0 !important;
          }

          .print-image-container img {
            width: 100% !important;
            max-height: 185mm !important;
            object-fit: contain !important;
          }
        }
      `}</style>

      {/* ── TOOLBAR HEADER (SLIM & CLEAN - SINGLE ROW) ── */}
      <div className="org-header">
        <div className="org-header-left">
          {/* 1. View Mode Switcher (Sơ đồ cây, Khối phòng ban, Danh bạ) */}
          <div className="view-switcher">
            <button
              className={`view-btn ${activeView === 'TREE' ? 'active' : ''}`}
              onClick={() => setActiveView('TREE')}
            >
              <Network size={14} /> Sơ đồ Cây
            </button>
            <button
              className={`view-btn ${activeView === 'GRID' ? 'active' : ''}`}
              onClick={() => setActiveView('GRID')}
            >
              <Grid size={14} /> Khối Phòng ban
            </button>
            <button
              className={`view-btn ${activeView === 'DIRECTORY' ? 'active' : ''}`}
              onClick={() => setActiveView('DIRECTORY')}
            >
              <ListFilter size={14} /> Danh bạ
            </button>
          </div>

          {/* 2. Quick Search (nằm bên phải các Filter Sơ đồ cây, Khối phòng ban) */}
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm theo tên, chức vụ, username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div className="org-actions-group">
          {/* Fit to View Button (Nhìn Toàn Cảnh) */}
          {activeView === 'TREE' && (
            <button className="btn-action-tool primary" onClick={fitToScreen} title="Thu nhỏ vừa khít màn hình để nhìn toàn cảnh công ty">
              <Maximize2 size={13} /> <span className="btn-label-desktop">Nhìn Toàn Cảnh (Fit)</span><span className="btn-label-mobile">Toàn cảnh</span>
            </button>
          )}

          {/* In sơ đồ (PDF) */}
          <button className="btn-action-tool" onClick={handlePrint} disabled={isPrinting} title="In sơ đồ hoặc Lưu dưới dạng file PDF (A4 Ngang)">
            <Printer size={13} /> <span className="btn-label-desktop">{isPrinting ? 'Đang kết xuất PDF...' : 'In sơ đồ (PDF)'}</span><span className="btn-label-mobile">In PDF</span>
          </button>
        </div>
      </div>

      {/* ── QUICK JUMP TO DEPARTMENT FILTER CHIPS ── */}
      <div className="org-filter-bar">
        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginRight: '2px' }}>
          Xem Nhanh:
        </span>
        <button
          className={`filter-chip-btn ${selectedDeptFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => handleJumpToDept('ALL')}
        >
          🌟 Tất cả (32 NV)
        </button>
        <button
          className={`filter-chip-btn ${selectedDeptFilter === 'BOD' ? 'active' : ''}`}
          onClick={() => handleJumpToDept('BOD')}
        >
          👑 Ban Giám Đốc (2)
        </button>
        {ORG_STRUCTURE.departments.map(d => {
          let count = 1;
          if (d.viceHead) count++;
          d.groups.forEach(g => count += g.members.length);
          return (
            <button
              key={d.id}
              className={`filter-chip-btn ${selectedDeptFilter === d.code ? 'active' : ''}`}
              onClick={() => handleJumpToDept(d.code)}
            >
              <span>{d.icon}</span> {d.code} ({count})
            </button>
          );
        })}
      </div>

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 1: SƠ ĐỒ CÂY VÔ HẠN (INFINITE PAN & ZOOM TREE VIEW)     */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeView === 'TREE' && (
        <div 
          ref={viewportRef}
          className={`org-viewport-area ${isPanning ? 'is-panning' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          onClick={(e) => {
            if (isMovedRef.current) return;
            if (!e.target.closest('.org-member-card') && !e.target.closest('.floating-canvas-hud') && !e.target.closest('.floating-chain-banner') && !e.target.closest('.drawer-sheet')) {
              setSelectedMember(null);
            }
          }}
        >
          {/* Floating Chain of Command Banner */}
          {selectedMember && (
            <div className="floating-chain-banner" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldCheck size={14} className="text-blue-400" />
                <span>Chuỗi phân cấp: <strong>{selectedMember.fullName}</strong></span>
              </div>
              <button 
                onClick={() => setSelectedMember(null)}
                className="btn-clear-chain"
                title="Bỏ chọn (ESC)"
              >
                <X size={12} /> Bỏ chọn
              </button>
            </div>
          )}

          <div 
            ref={contentRef}
            className={`org-infinite-content ${selectedMember ? 'chain-active' : ''}`}
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
              transition: isSmoothTransition ? 'transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'none'
            }}
          >
            <div ref={chartExportRef} style={{ padding: '20px 40px', width: 'max-content', position: 'relative' }}>
              {/* LEVEL 1: BAN GIÁM ĐỐC */}
              <div id="tree-node-BOD" className="tree-level-bod">
                <div 
                  className="bod-super-card"
                  style={{ 
                    opacity: (selectedDeptFilter === 'ALL' || selectedDeptFilter === 'BOD') ? 1 : 0.4, 
                    transform: selectedDeptFilter === 'BOD' ? 'scale(1.02)' : 'none',
                    transition: 'all 0.25s' 
                  }}
                >
                  <div className="bod-header-pill">
                    <Crown size={12} /> {ORG_STRUCTURE.board.name} • {ORG_STRUCTURE.board.subTitle}
                  </div>
                  <div className="bod-grid">
                    {ORG_STRUCTURE.board.members.map(m => (
                      <div key={m.id} style={{ flex: 1 }}>
                        <MemberCard 
                          memberConfig={m} 
                          deptAccent={m.accent} 
                          isLeader={true} 
                          isBOD={true}
                          resolveUser={resolveUser}
                          isMatched={isMemberMatch(resolveUser(m))}
                          isSelected={selectedMember?.id === m.id}
                          isInChain={activeChainIds ? activeChainIds.has(m.id) : false}
                          isChainActive={Boolean(selectedMember)}
                          onSelect={handleSelectMember}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* STEM & HORIZONTAL RAIL */}
              <div className="tree-stem-down" />
              <div className="tree-horizontal-rail" style={{ width: 'calc(100% - 295px)' }} />

              {/* LEVEL 2: 7 KHỐI PHÒNG BAN */}
              <div className="tree-departments-row">
                {ORG_STRUCTURE.departments.map(dept => {
                  let totalCount = 1;
                  if (dept.viceHead) totalCount++;
                  dept.groups.forEach(g => totalCount += g.members.length);

                  const isDeptFocused = selectedDeptFilter === 'ALL' || selectedDeptFilter === dept.code;
                  const isDeptInChain = !selectedMember || (activeChainDeptCode === dept.code);

                  return (
                    <div 
                      key={dept.id} 
                      id={`tree-node-${dept.code}`}
                      className="dept-tree-column"
                      style={{ 
                        opacity: isDeptInChain && isDeptFocused ? 1 : 0.32, 
                        transform: selectedDeptFilter === dept.code ? 'translateY(-6px)' : 'none',
                        transition: 'all 0.25s' 
                      }}
                    >
                      <div className="dept-drop-line" />

                      <div className="dept-box" style={{ borderTop: `4px solid ${dept.accentColor}` }}>
                        <div className="dept-box-header" style={{ background: dept.bgLight }}>
                          <div className="dept-badge-row">
                            <span className="dept-code-tag" style={{ background: dept.accentColor, color: '#fff' }}>
                              {dept.code}
                            </span>
                            <span className="dept-count-pill">{totalCount} Thành viên</span>
                          </div>
                          <h3 className="dept-box-name">
                            <span>{dept.icon}</span> {dept.name}
                          </h3>
                          <p className="dept-market-sub">{dept.market}</p>
                        </div>

                        <div className="dept-box-body">
                          {/* Trưởng phòng (Head) */}
                          <MemberCard 
                            memberConfig={dept.head} 
                            deptAccent={dept.accentColor} 
                            isLeader={true} 
                            resolveUser={resolveUser}
                            isMatched={isMemberMatch(resolveUser(dept.head))}
                            isSelected={selectedMember?.id === dept.head.id}
                            isInChain={activeChainIds ? activeChainIds.has(dept.head.id) : false}
                            isChainActive={Boolean(selectedMember)}
                            onSelect={handleSelectMember}
                          />

                          {/* Phó phòng (nếu có) */}
                          {dept.viceHead && (
                            <MemberCard 
                              memberConfig={dept.viceHead} 
                              deptAccent={dept.accentColor} 
                              resolveUser={resolveUser}
                              isMatched={isMemberMatch(resolveUser(dept.viceHead))}
                              isSelected={selectedMember?.id === dept.viceHead.id}
                              isInChain={activeChainIds ? activeChainIds.has(dept.viceHead.id) : false}
                              isChainActive={Boolean(selectedMember)}
                              onSelect={handleSelectMember}
                            />
                          )}

                          {/* Nhóm chuyên môn (Điều hành, Sales, Visa) */}
                          {dept.groups.map((group, gIdx) => (
                            <div key={gIdx}>
                              <div className="dept-subgroup-label">{group.groupName}</div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                                {group.members.map(m => (
                                  <MemberCard 
                                    key={m.id} 
                                    memberConfig={m} 
                                    deptAccent={dept.accentColor} 
                                    resolveUser={resolveUser}
                                    isMatched={isMemberMatch(resolveUser(m))}
                                    isSelected={selectedMember?.id === m.id}
                                    isInChain={activeChainIds ? activeChainIds.has(m.id) : false}
                                    isChainActive={Boolean(selectedMember)}
                                    onSelect={handleSelectMember}
                                  />
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* FLOATING HUD CONTROLS */}
          <div className="floating-canvas-hud">
            <button 
              className="hud-btn" 
              onClick={() => handleZoom('out')} 
              title="Thu nhỏ (-)"
            >
              <ZoomOut size={16} />
            </button>
            <span className="hud-text">{Math.round(scale * 100)}%</span>
            <button 
              className="hud-btn" 
              onClick={() => handleZoom('in')} 
              title="Phóng to (+)"
            >
              <ZoomIn size={16} />
            </button>
            <button 
              className="hud-btn" 
              onClick={fitToScreen} 
              title="Nhìn toàn cảnh (Fit to Screen)"
            >
              <Maximize2 size={15} />
            </button>
            <button 
              className="hud-btn" 
              onClick={() => { setScale(1); setPan({ x: 50, y: 30 }); }} 
              title="Kích thước gốc (100%)"
            >
              <RotateCcw size={15} />
            </button>
            <div className="hud-hint">
              <Move size={14} />
              <span>Kéo chuột di chuyển • Lăn chuột để Zoom</span>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 2: KHỐI PHÒNG BAN DẠNG LƯỚI (DEPARTMENT MATRIX GRID)     */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeView === 'GRID' && (
        <div className="org-grid-container">
          <div className="org-grid-layout">
            {/* Ban Giám Đốc Card */}
            {(selectedDeptFilter === 'ALL' || selectedDeptFilter === 'BOD') && (
              <div className="dept-box" style={{ borderTop: '4px solid #f59e0b', gridColumn: selectedDeptFilter === 'ALL' ? '1 / -1' : 'auto' }}>
                <div className="dept-box-header" style={{ background: '#0f172a', color: '#fff' }}>
                  <div className="dept-badge-row">
                    <span className="dept-code-tag" style={{ background: '#f59e0b', color: '#000' }}>BOD</span>
                    <span className="dept-count-pill" style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}>2 Lãnh đạo</span>
                  </div>
                  <h3 className="dept-box-name" style={{ color: '#fff' }}>
                    👑 {ORG_STRUCTURE.board.name}
                  </h3>
                  <p className="dept-market-sub" style={{ color: '#94a3b8' }}>{ORG_STRUCTURE.board.subTitle}</p>
                </div>
                <div className="dept-box-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                  {ORG_STRUCTURE.board.members.map(m => (
                    <MemberCard 
                      key={m.id} 
                      memberConfig={m} 
                      deptAccent="#f59e0b" 
                      isLeader={true} 
                      isBOD={true} 
                      resolveUser={resolveUser}
                      isMatched={isMemberMatch(resolveUser(m))}
                      isSelected={selectedMember?.id === m.id}
                      isInChain={activeChainIds ? activeChainIds.has(m.id) : false}
                      isChainActive={Boolean(selectedMember)}
                      onSelect={handleSelectMember}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 7 Departments Cards */}
            {ORG_STRUCTURE.departments
              .filter(d => selectedDeptFilter === 'ALL' || selectedDeptFilter === d.code)
              .map(dept => {
                let totalCount = 1;
                if (dept.viceHead) totalCount++;
                dept.groups.forEach(g => totalCount += g.members.length);

                return (
                  <div key={dept.id} className="dept-box" style={{ borderTop: `4px solid ${dept.accentColor}` }}>
                    <div className="dept-box-header" style={{ background: dept.bgLight }}>
                      <div className="dept-badge-row">
                        <span className="dept-code-tag" style={{ background: dept.accentColor, color: '#fff' }}>{dept.code}</span>
                        <span className="dept-count-pill">{totalCount} Nhân sự</span>
                      </div>
                      <h3 className="dept-box-name">
                        <span>{dept.icon}</span> {dept.name}
                      </h3>
                      <p className="dept-market-sub">{dept.market}</p>
                    </div>

                    <div className="dept-box-body">
                      <MemberCard 
                        memberConfig={dept.head} 
                        deptAccent={dept.accentColor} 
                        isLeader={true} 
                        resolveUser={resolveUser}
                        isMatched={isMemberMatch(resolveUser(dept.head))}
                        isSelected={selectedMember?.id === dept.head.id}
                        isInChain={activeChainIds ? activeChainIds.has(dept.head.id) : false}
                        isChainActive={Boolean(selectedMember)}
                        onSelect={handleSelectMember}
                      />
                      {dept.viceHead && (
                        <MemberCard 
                          memberConfig={dept.viceHead} 
                          deptAccent={dept.accentColor} 
                          resolveUser={resolveUser}
                          isMatched={isMemberMatch(resolveUser(dept.viceHead))}
                          isSelected={selectedMember?.id === dept.viceHead.id}
                          isInChain={activeChainIds ? activeChainIds.has(dept.viceHead.id) : false}
                          isChainActive={Boolean(selectedMember)}
                          onSelect={handleSelectMember}
                        />
                      )}
                      {dept.groups.map((group, gIdx) => (
                        <div key={gIdx}>
                          <div className="dept-subgroup-label">{group.groupName}</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                            {group.members.map(m => (
                              <MemberCard 
                                key={m.id} 
                                memberConfig={m} 
                                deptAccent={dept.accentColor} 
                                resolveUser={resolveUser}
                                isMatched={isMemberMatch(resolveUser(m))}
                                isSelected={selectedMember?.id === m.id}
                                isInChain={activeChainIds ? activeChainIds.has(m.id) : false}
                                isChainActive={Boolean(selectedMember)}
                                onSelect={handleSelectMember}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* VIEW 3: DANH BẠ TOÀN BỘ NHÂN VIÊN (DIRECTORY LIST)         */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {activeView === 'DIRECTORY' && (
        <div className="org-directory-container">
          <div className="org-directory-card">
            <table className="directory-table">
              <thead>
                <tr>
                  <th>Nhân sự</th>
                  <th>Khối / Phòng ban</th>
                  <th>Chức danh</th>
                  <th>Email liên hệ</th>
                  <th>Số điện thoại</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {/* BOD */}
                {(selectedDeptFilter === 'ALL' || selectedDeptFilter === 'BOD') && ORG_STRUCTURE.board.members
                  .map(m => resolveUser(m))
                  .filter(u => !searchQuery || isMemberMatch(u))
                  .map(u => (
                    <tr key={u.id} onClick={() => setSelectedMember(u)} style={{ cursor: 'pointer' }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#0f172a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                            {getInitials(u.fullName || u.username)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.fullName}</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="stat-chip" style={{ background: '#fef3c7', color: '#92400e' }}>Ban Giám Đốc</span></td>
                      <td style={{ fontWeight: 600 }}>{u.title}</td>
                      <td style={{ color: '#2563eb' }}>{u.email}</td>
                      <td style={{ fontWeight: 600 }}>{u.phone}</td>
                      <td><span className="stat-chip accent">Active</span></td>
                    </tr>
                  ))}

                {/* Departments */}
                {ORG_STRUCTURE.departments
                  .filter(dept => selectedDeptFilter === 'ALL' || selectedDeptFilter === dept.code)
                  .map(dept => {
                    const allMembers = [dept.head];
                    if (dept.viceHead) allMembers.push(dept.viceHead);
                    dept.groups.forEach(g => allMembers.push(...g.members));

                    return allMembers
                      .map(m => resolveUser(m))
                      .filter(u => !searchQuery || isMemberMatch(u))
                      .map(u => (
                        <tr key={u.id} onClick={() => setSelectedMember(u)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: dept.accentColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.75rem' }}>
                              {getInitials(u.fullName || u.username)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a' }}>{u.fullName}</div>
                              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="stat-chip" style={{ background: dept.bgLight, color: dept.accentColor, borderColor: dept.borderColor }}>
                            {dept.icon} {dept.code}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{u.title}</td>
                        <td style={{ color: '#2563eb' }}>{u.email}</td>
                        <td style={{ fontWeight: 600 }}>{u.phone}</td>
                        <td><span className="stat-chip accent">Active</span></td>
                      </tr>
                    ))
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════ */}
      {/* DRAWER MODAL HỒ SƠ CHI TIẾT NHÂN SỰ                        */}
      {/* ═════════════════════════════════════════════════════════════ */}
      {selectedMember && (
        <div className="drawer-overlay" onClick={() => setSelectedMember(null)}>
          <div className="drawer-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={18} className="text-blue-600" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Hồ sơ nhân sự</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="esc-hint-badge" style={{ fontSize: '0.72rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '2px 6px', color: '#64748b', fontWeight: 700 }}>
                  ESC
                </span>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="btn-drawer-close"
                  title="Đóng (Phím ESC)"
                  aria-label="Đóng"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="drawer-body">
              {/* Avatar Hero */}
              <div className="drawer-avatar-hero">
                <SafeAvatar 
                  src={selectedMember.avatarUrl} 
                  name={selectedMember.fullName} 
                  username={selectedMember.username} 
                  className="drawer-avatar-img" 
                  fallbackClassName="drawer-avatar-fallback" 
                />
                <h2 style={{ margin: '0.25rem 0 0', fontSize: '1.2rem', fontWeight: 800 }}>
                  {selectedMember.fullName}
                </h2>
                <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
                  @{selectedMember.username} • {selectedMember.title}
                </span>
                <span className="stat-chip accent" style={{ marginTop: '0.25rem' }}>
                  🟢 Nhân viên chính thức (Active)
                </span>
              </div>

              {/* Quick Contact Action Buttons */}
              <div className="drawer-quick-actions">
                {selectedMember.phone ? (
                  <a 
                    href={`tel:${cleanPhoneNumber(selectedMember.phone)}`} 
                    className="btn-quick-call"
                    title={`Bấm để gọi ngay số ${selectedMember.phone}`}
                  >
                    <PhoneCall size={16} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.15 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Gọi ngay</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.9 }}>{selectedMember.phone}</span>
                    </div>
                  </a>
                ) : (
                  <button className="btn-quick-call disabled" disabled>
                    <Phone size={15} /> Chưa có SĐT
                  </button>
                )}

                {selectedMember.email ? (
                  <a 
                    href={`mailto:${selectedMember.email}`} 
                    className="btn-quick-mail"
                    title={`Bấm để soạn email gửi đến ${selectedMember.email}`}
                  >
                    <Mail size={16} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', lineHeight: 1.15 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800 }}>Gửi Email</span>
                      <span style={{ fontSize: '0.68rem', opacity: 0.9, maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedMember.email}
                      </span>
                    </div>
                  </a>
                ) : (
                  <button className="btn-quick-mail disabled" disabled>
                    <Mail size={15} /> Chưa có Email
                  </button>
                )}
              </div>

              {/* HỆ THỐNG PHÂN CẤP & QUẢN LÝ (CHAIN OF COMMAND & CROSS-NAVIGATION) */}
              <div className="drawer-hierarchy-box">
                <div className="drawer-section-title">
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span>Cấp quản lý trực tiếp</span>
                </div>

                {chainInfo?.manager ? (
                  <div 
                    className="drawer-manager-card" 
                    onClick={() => handleCrossNavigate(chainInfo.manager)}
                    title={`Bấm để xem hồ sơ của quản lý: ${chainInfo.manager.fullName}`}
                  >
                    <div className="manager-card-left">
                      <SafeAvatar 
                        src={chainInfo.manager.avatarUrl} 
                        name={chainInfo.manager.fullName} 
                        username={chainInfo.manager.username} 
                        className="manager-avatar-img" 
                        fallbackClassName="manager-avatar-fallback" 
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span className="manager-name">{chainInfo.manager.fullName}</span>
                        <span className="manager-title">{chainInfo.manager.title}</span>
                      </div>
                    </div>
                    <div className="manager-card-right">
                      <span>Xem hồ sơ</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                ) : (
                  <div className="drawer-ceo-badge">
                    <Crown size={14} className="text-amber-500 fill-amber-400" />
                    <span>Lãnh đạo cao nhất • Giám Đốc Điều Hành (CEO)</span>
                  </div>
                )}

                {/* Đội ngũ trực thuộc nếu có */}
                {chainInfo?.subordinates && chainInfo.subordinates.length > 0 && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <div className="drawer-section-title">
                      <Users size={14} className="text-emerald-600" />
                      <span>Đội ngũ trực thuộc ({chainInfo.subordinates.length} nhân sự):</span>
                    </div>
                    <div className="drawer-subordinates-list">
                      {chainInfo.subordinates.map(sub => (
                        <div 
                          key={sub.id} 
                          className="drawer-subordinate-item"
                          onClick={() => handleCrossNavigate(sub)}
                          title={`Bấm để xem hồ sơ của ${sub.fullName}`}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
                            <SafeAvatar 
                              src={sub.avatarUrl} 
                              name={sub.fullName} 
                              username={sub.username} 
                              className="sub-avatar-img" 
                              fallbackClassName="sub-avatar-fallback" 
                            />
                            <div className="sub-info">
                              <span className="sub-name">{sub.fullName}</span>
                              <span className="sub-title">{sub.title}</span>
                            </div>
                          </div>
                          <ChevronRight size={13} className="sub-arrow" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Detail Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div className="drawer-contact-item">
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Mail size={14} /> Email:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedMember.email || 'Chưa cập nhật'}</span>
                    {selectedMember.email && (
                      <button
                        onClick={() => handleCopy(selectedMember.email, 'email')}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        title="Sao chép"
                      >
                        {copiedField === 'email' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="drawer-contact-item">
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={14} /> Điện thoại:
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{selectedMember.phone || 'Chưa cập nhật'}</span>
                    {selectedMember.phone && (
                      <button
                        onClick={() => handleCopy(selectedMember.phone, 'phone')}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
                        title="Sao chép"
                      >
                        {copiedField === 'phone' ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                </div>

                <div className="drawer-contact-item">
                  <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Building2 size={14} /> Phòng ban:
                  </span>
                  <span style={{ fontWeight: 700, color: '#0f172a' }}>
                    {selectedMember.bus?.length > 0 ? selectedMember.bus.join(', ') : 'Công ty FIT TOUR'}
                  </span>
                </div>

                {selectedMember.birthDate && (
                  <div className="drawer-contact-item">
                    <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> Ngày sinh:
                    </span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>
                      {new Date(selectedMember.birthDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                style={{
                  marginTop: 'auto',
                  padding: '0.85rem',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  color: '#334155',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  transition: 'background 0.15s'
                }}
              >
                <span>Đóng cửa sổ hồ sơ</span>
                <span className="esc-hint-badge" style={{ fontSize: '0.72rem', background: '#e2e8f0', borderRadius: '4px', padding: '1px 5px', color: '#64748b' }}>ESC</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BẢN IN DÀNH RIÊNG CHO IN ẤN & XUẤT PDF (A4 LANDSCAPE) ── */}
      <div className="org-chart-print-area">
        <div className="print-banner">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2.5px solid #0f172a', paddingBottom: '6px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#0f172a', color: '#fff', fontWeight: 900, fontSize: '13px', padding: '4px 8px', borderRadius: '4px', letterSpacing: '0.05em' }}>
                FIT TOUR
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                  CÔNG TY CỔ PHẦN DU LỊCH FIT TOUR
                </h1>
                <p style={{ margin: 0, fontSize: '10px', color: '#475569', fontWeight: 600 }}>
                  SƠ ĐỒ TỔ CHỨC CÔNG TY (32 NHÂN SỰ CHÍNH THỨC) • HỆ THỐNG ERP
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: '#64748b', lineHeight: 1.35 }}>
              <div style={{ fontWeight: 700, color: '#0f172a' }}>Hệ thống ERP: erp.fittour.vn</div>
              <div>Ngày in: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>

        {printImageUrl && (
          <div className="print-image-container" style={{ textAlign: 'center', marginTop: '4px' }}>
            <img 
              src={printImageUrl} 
              alt="Sơ đồ tổ chức FIT Tour" 
              style={{ 
                width: '100%', 
                maxHeight: '182mm', 
                objectFit: 'contain', 
                display: 'block', 
                margin: '0 auto',
                borderRadius: '8px'
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default OrgChartTab;
