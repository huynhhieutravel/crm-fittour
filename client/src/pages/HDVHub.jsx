import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import CustomerReviewsTab from '../tabs/CustomerReviewsTab';
import { 
  Bell, ChevronDown, Calendar, Users, Hash, CheckCircle2, Circle, Clock, 
  PhoneCall, AlertTriangle, Edit3, MapPin, Search, ArrowRight, Star,
  Clock4, XOctagon, MessageSquareWarning, PackageX, Activity, CloudRain,
  FileText
} from 'lucide-react';
import '../styles/hdv-hub.css';

const HDVHub = () => {
  const location = useLocation();
  const isDashboard = location.pathname === '/hdv/dashboard';
  const isReviews = location.pathname === '/hdv' || location.pathname === '/hdv/reviews';

  return (
    <div className="hdv-hub-wrapper">
      {/* 1. Header (Navbar) */}
      <header className="hdv-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <Link to="/hdv"><img src="/logo.png" alt="FIT Tour" style={{ height: '32px' }} /></Link>
          <nav className="hdv-nav">
            <Link to="/hdv/dashboard" className={`hdv-nav-item ${isDashboard ? 'active' : ''}`}>Trang chủ</Link>
            <Link to="/hdv" className={`hdv-nav-item ${isReviews ? 'active' : ''}`}>Đánh giá</Link>
            <a href="#" className="hdv-nav-item">Checklist <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span></a>
            <a href="#" className="hdv-nav-item">Xử lý sự cố <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span></a>
            <a href="#" className="hdv-nav-item">Thư viện SOP <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span></a>
            <a href="#" className="hdv-nav-item">Case Study <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span></a>
            <a href="#" className="hdv-nav-item">Báo cáo <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span></a>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <Bell size={20} color="#64748b" />
            <span style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>3</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
            <img src="https://ui-avatars.com/api/?name=Nguyen+Van+A&background=f97316&color=fff" alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Nguyễn Văn A</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Hướng dẫn viên</div>
            </div>
            <ChevronDown size={14} color="#64748b" />
          </div>
        </div>
      </header>

      {!isDashboard ? (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          <CustomerReviewsTab isHDVView={true} />
        </div>
      ) : (
        <>
          {/* 2. Hero Section */}
      <section className="hdv-hero">
        <h1>Bạn không chỉ dẫn tour,<br/>Bạn đang vận hành trải nghiệm <span className="highlight">FIT Tour</span></h1>
        <p>Bàn làm việc của Hướng Dẫn Viên chuyên nghiệp</p>
        <div className="hdv-hero-btns">
          <button className="hdv-btn-primary">▶ Bắt đầu tour</button>
          <button className="hdv-btn-secondary">Xem checklist nhanh</button>
        </div>
      </section>

      {/* Container */}
      <div className="hdv-container">
        
        {/* 3. Main Tour Status Panel */}
        <div className="hdv-tour-panel">
          {/* Col 1 */}
          <div className="hdv-panel-col">
            <div className="hdv-col-title">TOUR HÔM NAY <span className="tour-badge">● Đang diễn ra</span></div>
            <div className="tour-name">Hà Nội – Sapa 3N2Đ</div>
            <div className="tour-meta">
              <div className="tour-meta-item">
                <span className="tour-meta-label"><Calendar size={12}/> Ngày khởi hành</span>
                <span className="tour-meta-value">24/04/2026</span>
              </div>
              <div className="tour-meta-item">
                <span className="tour-meta-label"><Users size={12}/> Số khách</span>
                <span className="tour-meta-value">12 khách</span>
              </div>
              <div className="tour-meta-item">
                <span className="tour-meta-label"><Hash size={12}/> Mã tour</span>
                <span className="tour-meta-value">FT260424-01</span>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', marginBottom: '8px' }}>TIẾN ĐỘ CHUNG</div>
              <div className="progress-huge">65%</div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: '65%' }}></div></div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>13/20 công việc đã hoàn thành</div>
            </div>
            <a href="#" className="view-all">Xem chi tiết tour <ArrowRight size={14} /></a>
          </div>

          {/* Col 2 */}
          <div className="hdv-panel-col">
            <div className="hdv-col-title">TIẾN ĐỘ THỰC TẾ</div>
            <div className="timeline-item">
              <div className="timeline-icon done"><CheckCircle2 size={24} /></div>
              <div className="timeline-line"></div>
              <div className="timeline-content"><span className="timeline-text">Đón khách tại sân bay</span> <span className="timeline-time">08:15</span></div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon done"><CheckCircle2 size={24} /></div>
              <div className="timeline-line"></div>
              <div className="timeline-content"><span className="timeline-text">Di chuyển đến Sapa</span> <span className="timeline-time">09:30</span></div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon active"><Circle size={24} /></div>
              <div className="timeline-line"></div>
              <div className="timeline-content"><span className="timeline-text" style={{ color: '#f97316' }}>Check-in khách sạn</span> <span className="timeline-time">13:45</span></div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon pending"><Circle size={24} /></div>
              <div className="timeline-line"></div>
              <div className="timeline-content"><span className="timeline-text" style={{ color: '#94a3b8' }}>Tham quan Cát Cát</span> <span className="timeline-time">15:30</span></div>
            </div>
            <div className="timeline-item" style={{ marginBottom: '16px' }}>
              <div className="timeline-icon pending"><Circle size={24} /></div>
              <div className="timeline-line"></div>
              <div className="timeline-content"><span className="timeline-text" style={{ color: '#94a3b8' }}>Ăn tối tại nhà hàng</span> <span className="timeline-time">19:00</span></div>
            </div>
            <a href="#" className="view-all">Xem full timeline <ArrowRight size={14} /></a>
          </div>

          {/* Col 3 */}
          <div className="hdv-panel-col">
            <div className="hdv-col-title">CẢNH BÁO</div>
            <div className="alert-card">
              <div className="alert-icon"><AlertTriangle size={16} /></div>
              <div className="alert-info">
                <h4>Delay dịch vụ</h4>
                <p>Nhà hàng A báo delay 20 phút</p>
              </div>
              <div className="alert-time">12:30</div>
            </div>
            <div className="alert-card warning" style={{ marginBottom: '24px' }}>
              <div className="alert-icon"><CloudRain size={16} /></div>
              <div className="alert-info">
                <h4>Thời tiết xấu</h4>
                <p>Mưa lớn tại Sapa chiều nay</p>
              </div>
              <div className="alert-time">11:45</div>
            </div>
            <a href="#" className="view-all">Xem tất cả cảnh báo <ArrowRight size={14} /></a>
          </div>

          {/* Col 4 */}
          <div>
            <div className="hdv-col-title">THAO TÁC NHANH</div>
            <button className="action-btn green"><PhoneCall size={18} /> Gọi điều hành</button>
            <button className="action-btn red"><AlertTriangle size={18} /> Báo sự cố</button>
            <button className="action-btn blue"><Edit3 size={18} /> Ghi chú nhanh</button>
            <button className="action-btn purple"><MapPin size={18} /> Check-in điểm đến</button>
          </div>
        </div>

        {/* 4. The 3 Phases (Checklist) */}
        <div className="phases-wrapper">
          <div className="phases-connector"></div>
          <div className="phases-grid">
            {/* Phase 1 */}
            <div className="phase-card phase-1">
              <div className="phase-header">
                <div className="phase-number">01</div>
                <div className="phase-title">TRƯỚC TOUR</div>
              </div>
              <ul className="phase-list">
                <li className="checked"><div className="icon">✓</div> Xem chương trình chi tiết</li>
                <li className="checked"><div className="icon">✓</div> Nắm thông tin đoàn</li>
                <li className="checked"><div className="icon">✓</div> Kiểm tra dịch vụ đặt</li>
                <li><div className="icon"></div> Nhận briefing từ điều hành</li>
                <li><div className="icon"></div> Chuẩn bị câu chuyện & tài liệu</li>
              </ul>
              <div className="phase-action">
                <a href="#" className="phase-link">Xem checklist đầy đủ <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span> <ArrowRight size={14} /></a>
                <img src="https://cdn-icons-png.flaticon.com/512/854/854878.png" className="phase-img" alt="Illustration" />
              </div>
            </div>
            {/* Phase 2 */}
            <div className="phase-card phase-2">
              <div className="phase-header">
                <div className="phase-number">02</div>
                <div className="phase-title">TRONG TOUR</div>
              </div>
              <ul className="phase-list">
                <li className="checked"><div className="icon">✓</div> Timeline & lịch trình</li>
                <li><div className="icon"></div> <span style={{flex: 1}}>Checklist theo điểm đến</span> <span style={{fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>Đang làm</span></li>
                <li className="checked"><div className="icon">✓</div> Ghi chú & nhật ký hành trình</li>
                <li className="checked"><div className="icon">✓</div> Upload hình ảnh / Bill</li>
                <li><div className="icon"></div> Khách hàng phản hồi nhanh</li>
              </ul>
              <div className="phase-action">
                <a href="#" className="phase-link">Vào trong tour <ArrowRight size={14} /></a>
                <img src="https://cdn-icons-png.flaticon.com/512/3068/3068694.png" className="phase-img" alt="Illustration" />
              </div>
            </div>
            {/* Phase 3 */}
            <div className="phase-card phase-3">
              <div className="phase-header">
                <div className="phase-number">03</div>
                <div className="phase-title">SAU TOUR</div>
              </div>
              <ul className="phase-list">
                <li className="checked"><div className="icon">✓</div> Tổng kết & báo cáo tour</li>
                <li className="checked"><div className="icon">✓</div> Upload ảnh đẹp</li>
                <li className="checked"><div className="icon">✓</div> Gửi feedback khách hàng</li>
                <li className="checked"><div className="icon">✓</div> Đánh giá dịch vụ</li>
                <li className="checked"><div className="icon">✓</div> Báo cáo chi phí (nếu có)</li>
              </ul>
              <div className="phase-action">
                <a href="#" className="phase-link">Hoàn tất tour <ArrowRight size={14} /></a>
                <img src="https://cdn-icons-png.flaticon.com/512/2830/2830305.png" className="phase-img" alt="Illustration" />
              </div>
            </div>
          </div>
        </div>

        {/* 4b. TÀI LIỆU QUAN TRỌNG */}
        <div className="hdv-docs-section">
          <div className="section-header">
            <div className="section-title">📚 TÀI LIỆU QUAN TRỌNG</div>
          </div>
          <div className="hdv-docs-grid">
            {/* Card 1: Overview Đánh Giá */}
            <a 
              href="https://drive.google.com/file/d/1s_WBLcpunGLAuHC8JE5MdwPopUR-4Nqe/view" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hdv-doc-card"
            >
              <div className="hdv-doc-card-header overview">
                <div className="hdv-doc-icon">
                  <Star size={24} />
                </div>
                <div className="hdv-doc-badge">PDF</div>
              </div>
              <div className="hdv-doc-card-body">
                <h3>Overview Đánh Giá FIT Tour</h3>
                <p>Tổng quan hệ thống đánh giá hiệu suất và chất lượng dịch vụ Hướng Dẫn Viên</p>
                <div className="hdv-doc-action">
                  <span>Xem tài liệu</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </a>

            {/* Card 2: SOP HDV */}
            <a 
              href="https://drive.google.com/file/d/1ql-COwH3w78L-lHmuKr6D5BaDKz5f46o/view" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hdv-doc-card"
            >
              <div className="hdv-doc-card-header sop">
                <div className="hdv-doc-icon">
                  <FileText size={24} />
                </div>
                <div className="hdv-doc-badge">PDF</div>
              </div>
              <div className="hdv-doc-card-body">
                <h3>SOP Hướng Dẫn Viên</h3>
                <p>Quy trình chuẩn vận hành dành cho Hướng Dẫn Viên FIT Tour — từ chuẩn bị đến hoàn tất tour</p>
                <div className="hdv-doc-action">
                  <span>Xem tài liệu</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* 5. Bottom Grids */}
        <div className="bottom-grid">
          {/* Incidents */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">XỬ LÝ SỰ CỐ THƯỜNG GẶP</div>
              <a href="#" className="view-all">Xem tất cả <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span> <ArrowRight size={14} /></a>
            </div>
            <div className="incident-grid">
              <div className="incident-card">
                <div className="incident-icon" style={{ background: '#fee2e2', color: '#ef4444' }}><Clock4 size={18} /></div>
                <div className="incident-info"><h4>Delay dịch vụ</h4><p>Hướng dẫn xử lý khi dịch vụ bị trễ</p></div>
              </div>
              <div className="incident-card">
                <div className="incident-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}><XOctagon size={18} /></div>
                <div className="incident-info"><h4>Hủy dịch vụ</h4><p>Xử lý khi nhà cung cấp hủy dịch vụ</p></div>
              </div>
              <div className="incident-card">
                <div className="incident-icon" style={{ background: '#e0f2fe', color: '#0ea5e9' }}><MessageSquareWarning size={18} /></div>
                <div className="incident-info"><h4>Khách hàng phàn nàn</h4><p>Quy trình xử lý khách hàng khó tính</p></div>
              </div>
              <div className="incident-card">
                <div className="incident-icon" style={{ background: '#ffedd5', color: '#f97316' }}><PackageX size={18} /></div>
                <div className="incident-info"><h4>Thất lạc tài sản</h4><p>Các bước xử lý khi khách mất đồ</p></div>
              </div>
              <div className="incident-card">
                <div className="incident-icon" style={{ background: '#f3e8ff', color: '#a855f7' }}><Activity size={18} /></div>
                <div className="incident-info"><h4>Sự cố sức khỏe</h4><p>Xử lý khi khách gặp vấn đề sức khỏe</p></div>
              </div>
              <div className="incident-card">
                <div className="incident-icon" style={{ background: '#f1f5f9', color: '#64748b' }}><CloudRain size={18} /></div>
                <div className="incident-info"><h4>Thời tiết xấu</h4><p>Phương án khi thời tiết bất lợi</p></div>
              </div>
            </div>
          </div>

          {/* Case Study */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">CASE STUDY</div>
              <a href="#" className="view-all">Xem tất cả <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span> <ArrowRight size={14} /></a>
            </div>
            <div className="case-study-content">
              <div className="case-study-info">
                <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '8px' }}>Khách phàn nàn về khách sạn và đồ ăn</h3>
                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>Khách không hài lòng về chất lượng khách sạn và đồ ăn không như cam kết.</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>Độ khó</span>
                  <div style={{ color: '#f59e0b', display: 'flex' }}><Star size={14} fill="#f59e0b"/><Star size={14} fill="#f59e0b"/><Star size={14} fill="#f59e0b"/><Star size={14} fill="#f59e0b"/><Star size={14} color="#cbd5e1"/></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#10b981', background: '#dcfce7', padding: '4px 8px', borderRadius: '100px', fontWeight: 'bold' }}>● Đã xử lý thành công</span>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>02 / 06 &lt; &gt;</span>
                </div>
              </div>
              <img src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=300&auto=format&fit=crop" className="case-study-img" alt="Hotel room" />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <span style={{ fontSize: '11px', border: '1px solid #e2e8f0', color: '#64748b', padding: '4px 8px', borderRadius: '4px' }}>📄 Khách khó tính</span>
              <span style={{ fontSize: '11px', border: '1px solid #e2e8f0', color: '#64748b', padding: '4px 8px', borderRadius: '4px' }}>📄 Dịch vụ</span>
            </div>
          </div>
        </div>

        <div className="bottom-grid-3">
          {/* Feedback */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">FEEDBACK KHÁCH HÀNG</div>
              <a href="#" className="view-all">Xem tất cả <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span> <ArrowRight size={14} /></a>
            </div>
            <div className="feedback-summary">
              <div className="feedback-score">
                <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a' }}>4.8<span style={{ fontSize: '18px', color: '#94a3b8' }}>/5</span></div>
                <div style={{ color: '#f59e0b', display: 'flex', justifyContent: 'center', marginBottom: '4px' }}><Star size={14} fill="#f59e0b"/><Star size={14} fill="#f59e0b"/><Star size={14} fill="#f59e0b"/><Star size={14} fill="#f59e0b"/><Star size={14} fill="#f59e0b"/></div>
                <div style={{ fontSize: '11px', color: '#64748b' }}>(126 đánh giá)</div>
              </div>
              <div className="feedback-bars">
                {[5,4,3,2,1].map(star => (
                  <div key={star} className="feedback-bar-row">
                    <span style={{ width: '30px' }}>{star} sao</span>
                    <div className="f-bar-bg"><div className="f-bar-fill" style={{ width: star === 5 ? '85%' : star === 4 ? '10%' : star === 3 ? '3%' : '1%' }}></div></div>
                    <span style={{ width: '24px', textAlign: 'right' }}>{star === 5 ? '85%' : star === 4 ? '10%' : star === 3 ? '3%' : '1%'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>Nhận xét mới nhất</div>
            <div className="recent-review">
              <div style={{ display: 'flex', gap: '12px' }}>
                <img src="https://ui-avatars.com/api/?name=Thị+Minh&background=f1f5f9" style={{ width: '32px', height: '32px', borderRadius: '50%' }} alt="Reviewer"/>
                <div>
                  <p style={{ fontStyle: 'italic', fontSize: '13px', color: '#475569', margin: '0 0 8px 0' }}>"HDV nhiệt tình, chu đáo, kiến thức tốt. Chuyến đi rất tuyệt vời!"</p>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>– Nguyễn Thị Minh, 23/04/2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* SOP */}
          <div className="section-card">
            <div className="section-header">
              <div className="section-title">THƯ VIỆN SOP</div>
              <a href="#" className="view-all">Xem tất cả <span style={{fontSize: '10px', opacity: 0.6}}>(tạm thời chưa có)</span> <ArrowRight size={14} /></a>
            </div>
            <div>
              <div className="sop-item">
                <div className="sop-info">
                  <div className="sop-icon"><FileText size={18} /></div>
                  <div className="sop-text"><h4>SOP đón tiễn sân bay</h4><p>Quy trình chuẩn</p></div>
                </div>
                <div className="pdf-badge">📄 PDF</div>
              </div>
              <div className="sop-item">
                <div className="sop-info">
                  <div className="sop-icon" style={{ color: '#10b981', background: '#dcfce7' }}><FileText size={18} /></div>
                  <div className="sop-text"><h4>SOP xử lý sự cố</h4><p>Quy trình chuẩn</p></div>
                </div>
                <div className="pdf-badge">📄 PDF</div>
              </div>
              <div className="sop-item">
                <div className="sop-info">
                  <div className="sop-icon" style={{ color: '#f59e0b', background: '#fef3c7' }}><FileText size={18} /></div>
                  <div className="sop-text"><h4>SOP chăm sóc khách hàng</h4><p>Quy trình chuẩn</p></div>
                </div>
                <div className="pdf-badge">📄 PDF</div>
              </div>
              <div className="sop-item">
                <div className="sop-info">
                  <div className="sop-icon" style={{ color: '#a855f7', background: '#f3e8ff' }}><FileText size={18} /></div>
                  <div className="sop-text"><h4>SOP thanh toán & chi phí</h4><p>Quy trình chuẩn</p></div>
                </div>
                <div className="pdf-badge">📄 PDF</div>
              </div>
            </div>
          </div>

          {/* Mindset */}
          <div className="mindset-card">
            <div>
              <h3>MINDSET CÙNG FIT TOUR</h3>
              <div className="mindset-quote">
                Khách không nhớ bạn nói gì,<br/>
                <span style={{ color: '#f97316' }}>Nhưng sẽ nhớ cảm xúc</span><br/>
                bạn tạo ra.
              </div>
            </div>
            <a href="#" style={{ color: 'white', textDecoration: 'none', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>Đọc thêm câu chuyện truyền cảm hứng <span style={{fontSize: '10px', opacity: 0.8}}>(tạm thời chưa có)</span> <ArrowRight size={14} /></a>
          </div>
        </div>

      </div>
        </>
      )}
    </div>
  );
};

export default HDVHub;
