import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, Search, Menu, X, ChevronDown, ChevronRight,
  Share2, Printer, ArrowLeft, CheckCircle2, Sparkles, Layers,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/erp-guide.css';

export const ERP_GUIDE_MENU = [
  {
    category: 'Cẩm Nang Hướng Dẫn ERP',
    items: [
      {
        id: 'tao-nghi-phep',
        title: 'Tạo Đơn Xin Nghỉ Phép',
        path: '/huong-dan-erp/tao-nghi-phep',
        icon: '🌴',
        badge: 'Có Slider'
      },
      {
        id: 'dat-phong-hop',
        title: 'Đặt Phòng Họp',
        path: '/huong-dan-erp/dat-phong-hop',
        icon: '🏢',
        badge: 'Có Slider'
      }
    ]
  },
  {
    category: 'Tiện Ích & Công Cụ Hệ Thống',
    items: [
      {
        id: 'lich-nhan-su',
        title: 'Xem Lịch Nhân Sự & Sinh Nhật',
        path: '/staff-calendar',
        icon: '🎂',
        badge: 'Tiện ích'
      },
      {
        id: 'zoho-email',
        title: 'Cấu Hình Zoho Mail (IMAP)',
        path: '/tai-lieu/zoho-email',
        icon: '📧',
        badge: 'IT Support'
      }
    ]
  }
];

export default function ErpGuideLayout({ children, currentGuideId = 'tao-nghi-phep' }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleGroup = (cat) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Đã sao chép liên kết bài hướng dẫn!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter items by search
  const filteredMenu = ERP_GUIDE_MENU.map(grp => {
    const matchedItems = grp.items.filter(it => 
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grp.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...grp, items: matchedItems };
  }).filter(grp => grp.items.length > 0);

  // Count total guides
  const totalGuides = ERP_GUIDE_MENU.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="erp-guide-container">
      {/* ── Top Sticky Navbar ── */}
      <nav className="erp-guide-navbar">
        <div className="erp-navbar-left">
          <button 
            className="erp-sidebar-toggle-btn"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            title="Đóng / Mở Menu Hướng Dẫn"
          >
            {isMobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link to="/" className="erp-nav-logo" title="Trang chủ CRM FIT Tour">
            <img src="/logo.png" alt="FIT TOUR" />
          </Link>
          <span className="erp-nav-badge">ERP Manual Hub</span>
        </div>

        <div className="erp-navbar-right">
          <Link to="/huong-dan-erp" className="erp-btn-ghost">
            <BookOpen size={16} /> Cổng hướng dẫn
          </Link>
          <button onClick={handleCopyLink} className="erp-btn-ghost" title="Sao chép link">
            <Share2 size={16} /> Chia sẻ
          </button>
          <button onClick={handlePrint} className="erp-btn-ghost" title="In hoặc lưu PDF">
            <Printer size={16} /> In
          </button>
          <Link to="/" className="erp-btn-primary">
            Vào ERP FIT Tour
          </Link>
        </div>
      </nav>

      {/* ── Two Column Coursera-style Layout ── */}
      <div className="erp-guide-layout-wrapper">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div 
            className="erp-sidebar-backdrop" 
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* ── Left Sidebar (Coursera Style - Compact & Focused) ── */}
        <aside className={`erp-guide-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
          {/* Search bar inside sidebar */}
          <div className="erp-sidebar-search-box">
            <div style={{ position: 'relative' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '9px', color: '#94a3b8' }} />
              <input
                type="text"
                className="erp-sidebar-search-input"
                placeholder="Tìm bài hướng dẫn..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Bar */}
          <div className="erp-sidebar-stats-bar">
            <span>Mục lục hướng dẫn</span>
            <span style={{ color: '#2563eb' }}>{totalGuides} bài</span>
          </div>

          {/* Nav scroll items */}
          <div className="erp-sidebar-nav-scroll">
            {filteredMenu.map(grp => {
              const isCollapsed = !!collapsedGroups[grp.category];
              return (
                <div key={grp.category} className="erp-sidebar-group">
                  <button 
                    type="button" 
                    className="erp-sidebar-group-header"
                    onClick={() => toggleGroup(grp.category)}
                  >
                    <span>{grp.category}</span>
                    {isCollapsed ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {!isCollapsed && (
                    <ul className="erp-sidebar-items-list">
                      {grp.items.map(item => {
                        const isCurrent = item.id === currentGuideId || location.pathname === item.path;
                        return (
                          <li key={item.id}>
                            <Link
                              to={item.path}
                              className={`erp-sidebar-item-link ${isCurrent ? 'active' : ''}`}
                              onClick={() => setIsMobileSidebarOpen(false)}
                            >
                              <span className="erp-sidebar-item-icon">{item.icon}</span>
                              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.title}
                              </span>
                              {item.badge && (
                                <span className={`erp-sidebar-item-badge ${isCurrent ? 'badge-active' : 'badge-upcoming'}`}>
                                  {isCurrent ? 'Đang xem' : item.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Right Content Area ── */}
        <div className="erp-guide-main-area">
          {children}
        </div>
      </div>
    </div>
  );
}
