import React from 'react';
import { Mail, Download, FileText, Plane, RefreshCw, Calendar, Shield, Users, ConciergeBell, X, ArrowRight, Handshake, AlertTriangle, CheckSquare, MessageCircle, MapPin } from 'lucide-react';
import '../styles/quy-trinh-sale.css';

const QuyTrinhSaleDieuHanhPage = () => {
  return (
    <div style={{ padding: '20px', background: '#f1f5f9', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div className="qts-container">
        
        {/* Header */}
        <header className="qts-header">
          <div className="qts-header-bg-shape"></div>
          <div className="qts-header-image-wrapper">
            <img src="/images/3d-header-graphics.png" alt="3D Graphics" className="qts-header-image" />
          </div>
          
          <div className="qts-header-content">
            <div className="qts-logo-area">
              <img src="/logo.png" alt="FIT Tour" />
              <span className="qts-logo-text">FIT TOUR®</span>
            </div>
            
            <h1 className="qts-title">
              Nhắc Nhở<br/>
              Quy Trình Làm Việc
              <span>Giữa Sale & Điều Hành</span>
              Và Các Lỗi Sai
            </h1>
            
            <div className="qts-badge">TÀI LIỆU LƯU THÔNG NỘI BỘ – FIT TOUR</div>
            
            <p className="qts-subtitle">
              Để hạn chế tối đa sai sót trong vận hành vé và dịch vụ,<br/>
              từ hôm nay team <strong>SALE & ĐIỀU HÀNH</strong> vui lòng phối hợp <strong>đúng quy trình</strong>.
            </p>
            
            <div className="qts-actions">
              <a href="#quy-trinh" className="qts-btn qts-btn-primary">
                <Download size={18} /> Xem Quy Trình
              </a>
              <a href="/docs/SOP_QuyTrinhSaleDieuHanh.pdf" className="qts-btn qts-btn-secondary" target="_blank" rel="noopener noreferrer">
                <FileText size={18} /> Tải SOP Đầy Đủ
              </a>
            </div>
          </div>
        </header>

        {/* 01. Quy Trình Bắt Buộc */}
        <section id="quy-trinh" className="qts-section" style={{ paddingTop: '40px' }}>
          <div className="qts-section-header color-orange">
            <div className="qts-section-num">01</div>
            <div className="qts-section-title">Quy Trình Bắt Buộc</div>
          </div>

          <div className="qts-grid-6" style={{ background: '#fff', border: '1px solid #ffedd5', boxShadow: '0 4px 15px rgba(255, 87, 34, 0.05)', borderRadius: '16px', padding: '30px 15px' }}>
            <div className="qts-card">
              <div className="qts-card-icon"><Plane size={40} strokeWidth={2} fill="#0f172a" color="#0f172a" /></div>
              <div className="qts-card-title">Xuất vé</div>
              <div className="qts-card-desc">Kiểm tra đúng group, đúng hành trình, đúng thông tin.</div>
            </div>
            <div className="qts-card">
              <div className="qts-card-icon"><RefreshCw size={40} strokeWidth={2.5} color="#0f172a" /></div>
              <div className="qts-card-title">Đổi vé</div>
              <div className="qts-card-desc">Xác nhận qua email trước khi thực hiện.</div>
            </div>
            <div className="qts-card">
              <div className="qts-card-icon"><Calendar size={40} strokeWidth={2} fill="#0f172a" color="#fff" /></div>
              <div className="qts-card-title">Đổi ngày</div>
              <div className="qts-card-desc">Đối chiếu lịch trình và điều kiện vé.</div>
            </div>
            <div className="qts-card">
              <div className="qts-card-icon"><Shield size={40} strokeWidth={2} fill="#0f172a" color="#fff" /></div>
              <div className="qts-card-title">Xác nhận hành trình</div>
              <div className="qts-card-desc">Chỉ thực hiện khi có email xác nhận.</div>
            </div>
            <div className="qts-card">
              <div className="qts-card-icon"><Users size={40} strokeWidth={2} fill="#0f172a" color="#0f172a" /></div>
              <div className="qts-card-title">Danh sách khách</div>
              <div className="qts-card-desc">Nhận danh sách qua email, không qua tin nhắn rời rạc.</div>
            </div>
            <div className="qts-card">
              <div className="qts-card-icon"><ConciergeBell size={40} strokeWidth={2} fill="#0f172a" color="#0f172a" /></div>
              <div className="qts-card-title">Booking dịch vụ</div>
              <div className="qts-card-desc">Xác nhận qua email là căn cứ cuối cùng.</div>
            </div>
          </div>

          <div className="qts-warning-box" style={{ borderRadius: '16px' }}>
            <div className="qts-warning-left">
              <Mail size={56} fill="#ff5722" color="#fff" />
              <div>
                <div className="qts-warning-text-title">BẮT BUỘC <span>phải xác nhận qua</span> EMAIL.</div>
                <div className="qts-warning-text-desc" style={{ fontSize: '14px' }}>Không xử lý chỉ dựa trên tin nhắn Zalo hoặc thông tin gửi rời rạc trong group.</div>
              </div>
            </div>
            <div className="qts-warning-right-icon" style={{ background: '#ff5722', width: '56px', height: '56px' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold' }}>@</span>
            </div>
          </div>
        </section>

        {/* 02. Các lỗi thường gặp */}
        <section className="qts-section bg-gray">
          <div className="qts-section-header color-orange">
            <div className="qts-section-num">02</div>
            <div className="qts-section-title" style={{ background: '#0f172a' }}>Các Lỗi Thường Gặp</div>
          </div>

          <div className="qts-grid-3">
            <div className="qts-error-item">
              <div className="qts-error-icon-wrapper" style={{ background: 'transparent', border: 'none' }}>
                <Users size={48} fill="#cbd5e1" color="#cbd5e1" />
                <div className="qts-error-x"><X size={16} strokeWidth={4} /></div>
              </div>
              <div className="qts-error-title">Gửi lộn group</div>
              <div className="qts-error-arrow"><ArrowRight size={16} /> Xuất vé sai</div>
            </div>
            
            <div className="qts-error-item">
              <div className="qts-error-icon-wrapper" style={{ background: 'transparent', border: 'none' }}>
                <Calendar size={48} fill="#cbd5e1" color="#fff" />
                <div className="qts-error-x"><X size={16} strokeWidth={4} /></div>
              </div>
              <div className="qts-error-title">Gửi lộn ngày</div>
              <div className="qts-error-arrow"><ArrowRight size={16} /> Xuất vé sai</div>
            </div>
            
            <div className="qts-error-item">
              <div className="qts-error-icon-wrapper" style={{ background: 'transparent', border: 'none' }}>
                <MapPin size={48} fill="#cbd5e1" color="#fff" />
                <div className="qts-error-x"><X size={16} strokeWidth={4} /></div>
              </div>
              <div className="qts-error-title">Gửi lộn hành trình</div>
              <div className="qts-error-arrow"><ArrowRight size={16} /> Xuất vé sai</div>
            </div>
          </div>
        </section>

        {/* 03 & 04. Role Grid */}
        <section className="qts-section">
          <div className="qts-role-grid">
            
            {/* Đối với Sale */}
            <div className="qts-role-col" style={{ background: '#fff' }}>
              <div className="qts-section-header color-orange" style={{ marginBottom: '30px' }}>
                <div className="qts-section-num" style={{ background: '#0f172a' }}>03</div>
                <div className="qts-section-title" style={{ background: '#ff5722' }}>Đối Với Sale</div>
              </div>
              <div className="qts-role-list">
                <div className="qts-role-item">
                  <div className="qts-role-item-icon" style={{ background: '#ff5722', width: '40px', height: '40px' }}><Mail size={20} fill="#fff" color="#ff5722" /></div>
                  <div className="qts-role-item-text" style={{ fontSize: '14px', paddingTop: '10px' }}>
                    Chủ động gửi <strong>Email</strong> đầy đủ thông tin.
                  </div>
                </div>
                <div className="qts-role-item">
                  <div className="qts-role-item-icon" style={{ background: '#0068ff', width: '40px', height: '40px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Zalo</span>
                  </div>
                  <div className="qts-role-item-text" style={{ fontSize: '14px', paddingTop: '10px' }}>
                    Zalo chỉ dùng để nhắc việc hoặc báo "đã gửi mail".
                  </div>
                </div>
                <div className="qts-role-item">
                  <div className="qts-role-item-icon" style={{ background: '#ff5722', width: '40px', height: '40px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" stroke="#ff5722" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>
                  </div>
                  <div className="qts-role-item-text" style={{ fontSize: '14px', paddingTop: '10px' }}>
                    <strong>Không thúc xử lý</strong> khi chưa có <strong>Email</strong> xác nhận chính thức.
                  </div>
                </div>
              </div>
            </div>

            {/* Đối với Điều Hành */}
            <div className="qts-role-col" style={{ background: '#fff' }}>
              <div className="qts-section-header color-orange" style={{ marginBottom: '30px' }}>
                <div className="qts-section-num" style={{ background: '#0f172a' }}>04</div>
                <div className="qts-section-title" style={{ background: '#ff5722' }}>Đối Với Điều Hành</div>
              </div>
              <div className="qts-role-list">
                <div className="qts-role-item">
                  <div className="qts-role-item-icon" style={{ background: '#ff5722', width: '40px', height: '40px' }}><Shield size={20} fill="#fff" color="#ff5722" /></div>
                  <div className="qts-role-item-text" style={{ fontSize: '14px', paddingTop: '1px' }}>
                    Có quyền <strong>từ chối</strong> bất kỳ demand nào <strong>không có Email</strong>.
                  </div>
                </div>
                <div className="qts-role-item">
                  <div className="qts-role-item-icon" style={{ background: '#ff5722', width: '40px', height: '40px' }}>
                    <CheckSquare size={20} fill="#fff" color="#ff5722" />
                  </div>
                  <div className="qts-role-item-text" style={{ fontSize: '14px', paddingTop: '1px' }}>
                    Luôn làm <strong>đúng quy trình</strong> để tự bảo vệ chính mình và tránh các trường hợp đòi co khi phát sinh sự cố.
                  </div>
                </div>
                <div className="qts-role-item">
                  <div className="qts-role-item-icon" style={{ background: '#ff5722', width: '40px', height: '40px' }}><Mail size={20} fill="#fff" color="#ff5722" /></div>
                  <div className="qts-role-item-text" style={{ fontSize: '14px', paddingTop: '10px' }}>
                    Email là <strong>căn cứ cuối cùng</strong> để đối chiếu xử lý.
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 05. Cảnh báo */}
        <section className="qts-section" style={{ paddingBottom: '40px' }}>
          <div className="qts-section-header color-red" style={{ marginBottom: '20px' }}>
            <div className="qts-section-num" style={{ background: '#0f172a' }}>05</div>
            <div className="qts-section-title" style={{ background: '#e11d48' }}>Cảnh Báo Trách Nhiệm</div>
          </div>
          
          <div className="qts-alert-box" style={{ background: '#fff5f5', borderColor: '#fecdd3' }}>
            <AlertTriangle size={64} className="qts-alert-icon-big" color="#e11d48" fill="#ffe4e6" />
            <div className="qts-alert-content">
              <div className="qts-alert-text" style={{ fontSize: '15px' }}>
                Nếu Điều Hành tự xác nhận hoặc tự xuất vé dựa trên Zalo với bất kỳ hình thức nào:
              </div>
              <div className="qts-alert-highlight" style={{ fontSize: '16px' }}>
                → ĐIỀU HÀNH TỰ CHỊU TRÁCH NHIỆM NẾU PHÁT SINH SAI SÓT.
              </div>
            </div>
            <div className="qts-alert-right-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ position: 'relative', width: '60px', height: '100px', border: '3px solid #0f172a', borderRadius: '12px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px' }}>
                 <div style={{ background: '#0068ff', width: '100%', height: '24px', borderRadius: '4px', marginBottom: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '8px', fontWeight: 'bold' }}>Zalo</div>
                 <div style={{ background: '#e2e8f0', width: '100%', height: '6px', borderRadius: '3px', marginBottom: '6px' }}></div>
                 <div style={{ background: '#e2e8f0', width: '100%', height: '6px', borderRadius: '3px', marginBottom: '6px' }}></div>
                 <div style={{ background: '#e2e8f0', width: '70%', height: '6px', borderRadius: '3px' }}></div>
                 <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', background: '#ff5722', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', border: '3px solid #fff' }}>
                    <X size={20} strokeWidth={4} />
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="qts-footer" style={{ borderTop: 'none', background: '#f8fafc', padding: '40px' }}>
          <Handshake size={64} className="qts-footer-icon" strokeWidth={1.5} color="#ff5722" fill="#fff5f2" />
          <div className="qts-footer-text" style={{ fontSize: '15px' }}>
            Mong cả 2 team phối hợp nghiêm túc để đảm bảo chất lượng vận hành và hạn chế tối đa rủi ro cho khách hàng cũng như công ty.
          </div>
          <div className="qts-footer-logo" style={{ borderLeft: 'none', flexDirection: 'column', paddingLeft: '0' }}>
            <img src="/logo.png" alt="FIT Tour Logo" style={{ height: '32px' }} />
            <span style={{ fontSize: '16px' }}>FIT TOUR®</span>
          </div>
        </footer>

      </div>
    </div>
  );
};

export default QuyTrinhSaleDieuHanhPage;
