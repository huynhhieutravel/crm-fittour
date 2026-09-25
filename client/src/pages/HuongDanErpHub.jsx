import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, Search, ArrowRight, Calendar, Users, 
  ShieldCheck, FileText, CheckCircle, Clock, Sparkles,
  PhoneCall, Laptop, ChevronRight, Layers, HelpCircle
} from 'lucide-react';
import '../styles/erp-guide.css';

const GUIDES_LIST = [
  {
    id: 'tao-nghi-phep',
    title: 'Tạo Đơn Xin Nghỉ Phép',
    desc: 'Hướng dẫn 3 bước gửi đơn xin nghỉ phép, kiểm tra quỹ phép năm, loại trừ cuối tuần và bàn giao công việc tự động.',
    category: 'Hành chính',
    path: '/huong-dan-erp/tao-nghi-phep',
    icon: '🌴',
    badge: 'Mới cập nhật',
    isAvailable: true,
    stepsCount: 3,
    readTime: '2 phút'
  },
  {
    id: 'dat-phong-hop',
    title: 'Đăng Ký & Sử Dụng Phòng Họp',
    desc: 'Quy trình đặt lịch phòng họp, kiểm tra lịch trống theo khung giờ và tránh xung đột cuộc họp.',
    category: 'Hành chính',
    path: '/huong-dan-erp/dat-phong-hop',
    icon: '🏢',
    badge: 'Có Slider',
    isAvailable: true,
    stepsCount: 3,
    readTime: '2 phút'
  },
  {
    id: 'dieu-phoi-lead',
    title: 'Tiếp Nhận & Điều Phối Lead BU',
    desc: 'Hướng dẫn Sales & Điều phối nhận Lead từ Facebook Ads / Fanpage, gán BU và chuyển tiếp nhân viên phụ trách.',
    category: 'Kinh doanh',
    path: '/tai-lieu/sop-dieu-phoi',
    icon: '🔀',
    badge: 'Tài liệu SOP',
    isAvailable: true,
    stepsCount: 4,
    readTime: '4 phút'
  },
  {
    id: 'dat-ten-tour',
    title: 'Quy Chuẩn Đặt Tên Tour & Sản Phẩm',
    desc: 'Chuẩn hóa cú pháp đặt tên tour trên hệ thống ERP, Landing page và các kênh truyền thông xã hội.',
    category: 'Điều hành',
    path: '/tai-lieu/dat-ten-tour',
    icon: '📝',
    badge: 'Chuẩn nội bộ',
    isAvailable: true,
    stepsCount: 3,
    readTime: '3 phút'
  },
  {
    id: 'ket-noi-zoho-email',
    title: 'Cấu Hình Zoho Mail (IMAP / Outlook)',
    desc: 'Hướng dẫn đồng bộ hòm thư điện tử @fittour.vn vào các phần mềm Outlook, Apple Mail và Spark.',
    category: 'Kỹ thuật',
    path: '/tai-lieu/zoho-email',
    icon: '📧',
    badge: 'Hướng dẫn IT',
    isAvailable: true,
    stepsCount: 4,
    readTime: '5 phút'
  },
  {
    id: 'thanh-toan-quyet-toan',
    title: 'Quy Trình Quyết Toán & Bàn Giao Tour',
    desc: 'Quy định đối soát chi phí nhà cung cấp, thanh toán tạm ứng và hoàn thiện hồ sơ quyết toán tour.',
    category: 'Kế toán',
    path: '/tai-lieu/quy-trinh-thanh-toan-ban-giao-quyet-toan-tour',
    icon: '💸',
    badge: 'Tài chính',
    isAvailable: true,
    stepsCount: 5,
    readTime: '6 phút'
  }
];

export default function HuongDanErpHub() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'Hành chính', 'Kinh doanh', 'Điều hành', 'Kế toán', 'Kỹ thuật'];

  const filteredGuides = GUIDES_LIST.filter(item => {
    const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
    const matchQuery = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="erp-guide-container">
      {/* ── Top Navbar ── */}
      <nav className="erp-guide-navbar">
        <div className="erp-navbar-left">
          <Link to="/" className="erp-nav-logo" title="Trang chủ CRM FIT Tour">
            <img src="/logo.png" alt="FIT TOUR" />
          </Link>
          <span className="erp-nav-badge">ERP User Manual</span>
        </div>

        <div className="erp-navbar-right">
          <Link to="/tai-lieu" className="erp-btn-ghost">
            <BookOpen size={16} /> Kho tài liệu & SOP
          </Link>
          <Link to="/" className="erp-btn-primary">
            Vào ERP FIT Tour
          </Link>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <header className="erp-guide-hero">
        <div className="erp-hero-inner">
          <div className="erp-breadcrumbs">
            <Link to="/">Trang chủ CRM</Link>
            <span>/</span>
            <span className="active">Cổng hướng dẫn sử dụng ERP</span>
          </div>

          <div className="erp-hero-header-row">
            <div className="erp-hero-title-group">
              <h1>Cổng Hướng Dẫn Sử Dụng ERP FIT Tour</h1>
              <p className="erp-hero-desc">
                Trung tâm tra cứu cẩm nang thao tác hệ thống, quy trình nội bộ và hướng dẫn từng bước trực quan kèm hình ảnh slider minh họa.
              </p>

              {/* Search & Filter Bar */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '20px', maxWidth: '680px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '12px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm hướng dẫn (ví dụ: nghỉ phép, phòng họp, lead...)"
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 42px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: 'white',
                      fontSize: '14px',
                      outline: 'none',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: selectedCategory === cat ? '#3b82f6' : '#cbd5e1',
                        background: selectedCategory === cat ? '#3b82f6' : 'white',
                        color: selectedCategory === cat ? 'white' : '#475569',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {cat === 'all' ? 'Tất cả' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Guides Grid ── */}
      <main className="erp-guide-main">
        {/* Featured Guide Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '16px',
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          marginBottom: '36px',
          boxShadow: '0 4px 14px rgba(59, 130, 246, 0.08)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ background: '#3b82f6', color: 'white', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                Tiêu điểm
              </span>
              <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: '600' }}>
                Cẩm nang trực quan có Slider ảnh minh họa
              </span>
            </div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '22px', fontWeight: '800', color: '#1e3a8a' }}>
              🌴 Hướng Dẫn Sử Dụng ERP: Tạo Đơn Xin Nghỉ Phép
            </h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#334155', maxWidth: '640px' }}>
              Xem hướng dẫn chi tiết 3 bước: Mở menu profile &gt; Chọn ngày trên bộ lịch thông minh tự loại trừ cuối tuần &gt; Bàn giao công việc và gửi duyệt tự động qua Email.
            </p>
          </div>

          <Link
            to="/huong-dan-erp/tao-nghi-phep"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              borderRadius: '10px',
              background: '#2563eb',
              color: 'white',
              fontSize: '14px',
              fontWeight: '700',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s'
            }}
          >
            Mở bài hướng dẫn <ArrowRight size={16} />
          </Link>
        </div>

        {/* Guides List Section */}
        <div className="erp-section-title-wrap">
          <div className="erp-section-icon" style={{ background: '#f8fafc', color: '#334155' }}>
            <Layers size={20} />
          </div>
          <div>
            <h2>Tất Cả Hướng Dẫn Thao Tác</h2>
            <p>Chọn bài viết để xem quy trình chi tiết theo từng bước</p>
          </div>
        </div>

        <div className="erp-hub-grid">
          {filteredGuides.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className="erp-hub-card"
              style={{ opacity: item.isAvailable ? 1 : 0.7 }}
            >
              <div>
                <div className="erp-hub-card-header">
                  <div className="erp-hub-icon" style={{ background: '#f1f5f9' }}>
                    {item.icon}
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: item.isAvailable ? '#ecfdf5' : '#f1f5f9',
                    color: item.isAvailable ? '#059669' : '#64748b'
                  }}>
                    {item.badge}
                  </span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>

              <div className="erp-hub-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>{item.category}</span>
                  <span>•</span>
                  <span>{item.readTime}</span>
                </div>
                <div className="erp-card-cta">
                  {item.isAvailable ? (
                    <>Xem ngay <ChevronRight size={15} /></>
                  ) : (
                    <span>Sắp có</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
