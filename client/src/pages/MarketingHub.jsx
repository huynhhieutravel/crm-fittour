import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, Bell, Plus, Home, BookOpen, BarChart2, FileText, 
  LayoutTemplate, Star, Image as ImageIcon, MessageSquare, 
  ChevronDown, ArrowRight, ArrowLeft, TrendingUp
} from 'lucide-react';

const MarketingHub = () => {
  const [activeMenu, setActiveMenu] = useState('Tài liệu Marketing');
  const navigate = useNavigate();

  // Dữ liệu mẫu (Mock Data)
  const menuItems = [
    { section: 'TỔNG QUAN', items: [{ name: 'Tổng quan', icon: <Home size={18} /> }] },
    { 
      section: 'TÀI LIỆU MARKETING', 
      items: [
        { name: 'Tài liệu Marketing', icon: <BookOpen size={18} /> },
        { name: 'Báo cáo Marketing', icon: <BarChart2 size={18} /> }
      ] 
    },
    { 
      section: 'DANH MỤC TÀI LIỆU', 
      items: [
        { name: 'Guideline', icon: <FileText size={18} /> },
        { name: 'Template', icon: <LayoutTemplate size={18} /> },
        { name: 'Best Content', icon: <Star size={18} /> },
        { name: 'Asset', icon: <ImageIcon size={18} /> }
      ] 
    }
  ];

  const recentUpdates = [
    { title: 'Cách viết caption Facebook hiệu quả', category: 'Guideline', author: 'Nguyễn Anh', time: '2 giờ trước', color: '#3b82f6', bg: '#eff6ff', icon: <FileText size={16} color="#3b82f6"/> },
    { title: 'Template bài bán tour Trung Quốc', category: 'Template', author: 'Phạm Hà', time: '5 giờ trước', color: '#16a34a', bg: '#f0fdf4', icon: <LayoutTemplate size={16} color="#16a34a"/> },
    { title: 'Video Review Tứ Xuyên đạt 1M views', category: 'Best Content', author: 'Trần Minh', time: '1 ngày trước', color: '#f59e0b', bg: '#fef3c7', icon: <Star size={16} color="#f59e0b"/> },
    { title: 'Bộ ảnh mùa thu Nhật Bản 2024', category: 'Asset', author: 'Lê Phương', time: '2 ngày trước', color: '#9333ea', bg: '#faf5ff', icon: <ImageIcon size={16} color="#9333ea"/> },
    { title: 'Quy chuẩn hình ảnh thương hiệu FIT Tour', category: 'Guideline', author: 'Nguyễn Anh', time: '3 ngày trước', color: '#3b82f6', bg: '#eff6ff', icon: <FileText size={16} color="#3b82f6"/> },
  ];

  const quickLinks = [
    { name: 'Brand Guidelines', icon: <BookOpen size={16} /> },
    { name: 'Giọng văn & Tone of voice', icon: <MessageSquare size={16} /> },
    { name: 'Quy chuẩn hình ảnh', icon: <ImageIcon size={16} /> },
    { name: 'Mẫu hashtag theo chủ đề', icon: <FileText size={16} /> },
    { name: 'Template video TikTok', icon: <LayoutTemplate size={16} /> },
  ];

  const bestContents = [
    { title: 'Review Cửu Trại Câu mùa...', img: 'https://images.unsplash.com/photo-1542880941-197171ea7eeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', reach: '1M', lead: '230' },
    { title: 'Thượng Hải – Nơi quá khứ...', img: 'https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', reach: '850K', lead: '180' },
    { title: 'Mùa hoa anh đào Nhật Bản...', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80', reach: '620K', lead: '120' },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', overflow: 'hidden', fontFamily: '"Inter", "Segoe UI", sans-serif' }}>
      
      {/* =========================================================
          SIDEBAR
          ========================================================= */}
      <div style={{ width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        {/* Logo */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => window.location.href='/tai-lieu'}>
            <div style={{ width: 32, height: 32, backgroundColor: '#2563eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={20} color="white" /> {/* Tạm thay logo FIT TOUR */}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>FIT TOUR®</div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Marketing Hub</div>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <div style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          {menuItems.map((block, idx) => (
            <div key={idx} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: 8, paddingLeft: 12, letterSpacing: '0.5px' }}>
                {block.section}
              </div>
              {block.items.map(item => {
                const isActive = activeMenu === item.name;
                return (
                  <div 
                    key={item.name}
                    onClick={() => setActiveMenu(item.name)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8,
                      cursor: 'pointer', marginBottom: 4, transition: 'all 0.2s',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      color: isActive ? '#2563eb' : '#475569',
                      fontWeight: isActive ? 600 : 500
                    }}
                  >
                    <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>{item.icon}</span>
                    <span style={{ fontSize: '14px' }}>{item.name}</span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer Góp ý */}
        <div style={{ padding: '20px' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: 12, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ backgroundColor: '#eff6ff', width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <MessageSquare size={24} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Góp ý tài liệu</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: 12 }}>Bạn có tài liệu hay muốn chia sẻ với team?</div>
            <button style={{ width: '100%', padding: '8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 6, fontSize: '12px', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>Gửi góp ý</button>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN CONTENT AREA
          ========================================================= */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header Bar */}
        <header style={{ height: 72, backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 8, padding: '8px 16px', width: 400 }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Tìm kiếm tài liệu..." 
              style={{ border: 'none', backgroundColor: 'transparent', outline: 'none', paddingLeft: 12, fontSize: '14px', width: '100%', color: '#334155' }}
            />
            <div style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: 4, border: '1px solid #e2e8f0' }}>Ctrl + K</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={20} color="#64748b" />
              <span style={{ position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>8</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderLeft: '1px solid #e2e8f0', paddingLeft: 24 }}>
              <img src="https://ui-avatars.com/api/?name=Nguyen+Anh&background=2563eb&color=fff" alt="Avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Nguyễn Anh</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Marketing Manager</div>
              </div>
              <ChevronDown size={16} color="#94a3b8" />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            
            {/* Title & Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>Tài liệu Marketing</h1>
                <p style={{ margin: 0, fontSize: '15px', color: '#64748b' }}>Kho tài liệu, guideline và template giúp team Marketing làm việc hiệu quả và thống nhất.</p>
              </div>
              <button onClick={() => navigate('/tai-lieu/marketing/create')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37,99,235,0.2)' }}>
                <Plus size={18} /> Viết bài mới
              </button>
            </div>

            {/* 4 Category Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, marginBottom: 32 }}>
              {[
                { title: 'Guideline', count: '12 bài viết', desc: 'Quy chuẩn thương hiệu, giọng văn, định dạng nội dung...', icon: <FileText size={24} color="#3b82f6" />, bg: '#eff6ff' },
                { title: 'Template', count: '18 bài viết', desc: 'Mẫu caption, format bài viết, kịch bản video...', icon: <LayoutTemplate size={24} color="#16a34a" />, bg: '#f0fdf4' },
                { title: 'Best Content', count: '27 bài viết', desc: 'Tuyển chọn nội dung hiệu quả nhất (reach, lead, booking...)', icon: <Star size={24} color="#f59e0b" />, bg: '#fef3c7' },
                { title: 'Asset', count: '96 file', desc: 'Hình ảnh, video, template thiết kế, tài nguyên...', icon: <ImageIcon size={24} color="#9333ea" />, bg: '#faf5ff' },
              ].map((card, idx) => (
                <div key={idx} style={{ backgroundColor: '#ffffff', borderRadius: 16, padding: '24px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ backgroundColor: card.bg, width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    {card.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: '0 0 4px' }}>{card.title}</h3>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: 12 }}>{card.count}</div>
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 20px', flex: 1 }}>{card.desc}</p>
                  <a href="#" style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Xem tất cả <ArrowRight size={16} />
                  </a>
                </div>
              ))}
            </div>

            {/* Main Columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              
              {/* Left Column: Cập nhật mới nhất */}
              <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: '0 0 20px' }}>Cập nhật mới nhất</h2>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {recentUpdates.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', padding: '16px', borderRadius: 12, border: '1px solid #f1f5f9', transition: 'background 0.2s', cursor: 'pointer' }} className="hover:bg-slate-50">
                      <div style={{ backgroundColor: item.bg, width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 16 }}>
                        {item.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{item.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: item.color, backgroundColor: item.bg, padding: '2px 8px', borderRadius: 6 }}>{item.category}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: '#64748b' }}>
                            <img src={`https://ui-avatars.com/api/?name=${item.author.replace(' ','+')}&background=e2e8f0&color=475569`} style={{ width: 16, height: 16, borderRadius: '50%' }} /> {item.author}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{item.time}</div>
                    </div>
                  ))}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <a href="#" style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>Xem tất cả bài viết →</a>
                </div>
              </div>

              {/* Right Column: Truy cập nhanh & Best Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                
                {/* Truy cập nhanh */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Truy cập nhanh</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {quickLinks.map((link, idx) => (
                      <a href="#" key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#475569', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px', borderRadius: 8 }} className="hover:bg-slate-50 hover:text-blue-600">
                        <span style={{ color: '#94a3b8' }}>{link.icon}</span> {link.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Best Content nổi bật */}
                <div style={{ backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', padding: '24px' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }}>Best Content nổi bật</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {bestContents.map((content, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: 12, cursor: 'pointer' }}>
                        <img src={content.img} alt="Thumbnail" style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: 4, lineHeight: 1.4 }}>{content.title}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>Reach: <strong style={{ color: '#0f172a' }}>{content.reach}</strong> • Lead: <strong style={{ color: '#0f172a' }}>{content.lead}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                    <a href="#" style={{ fontSize: '14px', fontWeight: 600, color: '#2563eb', textDecoration: 'none' }}>Xem tất cả →</a>
                  </div>
                </div>

              </div>

            </div>
          </div>
          
          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: 40, paddingBottom: 20, fontSize: '13px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', maxWidth: 1200, margin: '40px auto 0' }}>
            <span>© 2026 FIT Tour. All rights reserved.</span>
            <span>Phiên bản 1.0.0</span>
          </div>

        </div>
      </div>

    </div>
  );
};

export default MarketingHub;
