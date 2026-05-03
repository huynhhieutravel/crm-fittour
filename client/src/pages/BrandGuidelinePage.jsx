import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import '../styles/brand-guideline.css';

/* ═══ Data Extracted from PDF ═══ */

/* ═══ Reusable Components ═══ */
const RevealText = ({ children, className = '' }) => {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal-up ${className}`}>{children}</div>;
};



/* ═══ Main Page Component ═══ */
const BrandGuidelinePage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bp-container">
      {/* ── Hero ── */}
      <section className="bp-hero">
        <div className="bp-hero-bg-blur"></div>
        <RevealText>
          <h1 className="bp-massive-text">
            Luxury & <br />
            <span style={{ color: 'var(--bp-orange)' }}>Bespoke.</span>
          </h1>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 32 }}>
            Sổ tay nhận diện thương hiệu nội bộ. FIT TOUR không phục vụ thị trường đại trà. Tập trung vào nhóm khách hàng có khả năng chi trả cao, đề cao trải nghiệm – cá nhân hóa – chất lượng dịch vụ.
          </p>
        </RevealText>
      </section>

      {/* ── Vision Section ── */}
      <section id="vision" className="bp-section dark">
        <RevealText>
          <h2 className="bp-large-text">Sự kết hợp giữa <br/>cảm xúc & câu chuyện.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 40 }}>
            FIT TOUR là đơn vị chuyên thiết kế tour và tổ chức sự kiện, tập trung vào những hành trình có chiều sâu và trải nghiệm khác biệt. Mỗi chuyến đi không chỉ là di chuyển, mà là sự kết hợp giữa cảm xúc, câu chuyện và giá trị cá nhân hóa. Từ tour khám phá, roadtrip, trekking đến các chương trình doanh nghiệp, FIT TOUR luôn đảm bảo tính đồng bộ, chuyên nghiệp và dấu ấn riêng biệt.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-rules-grid">
            <div className="bp-rule-card do">
              <div className="bp-rule-icon">✅ KHÁCH HÀNG MỤC TIÊU</div>
              <strong>Người có thu nhập cao, ưa thích sự tinh tế</strong><br/>
              Khách hàng lướt nhanh Facebook, bị thu hút bởi cảm xúc từ hình ảnh (Cinematic). Sẵn sàng chi trả cho sự chỉn chu.
            </div>
            <div className="bp-rule-card dont">
              <div className="bp-rule-icon">❌ NGUYÊN TẮC THIẾT KẾ</div>
              <strong>Không "rẻ tiền", không nhồi nhét</strong><br/>
              Thông tin trên ảnh phải cực kỳ tinh gọn, đẳng cấp. KHÔNG ĐƯỢC đăng bài sai logo. Phải đồng bộ hoàn toàn về thương hiệu.
            </div>
          </div>
        </RevealText>
      </section>

      {/* ── Logo Section ── */}
      <section id="logo" className="bp-section">
        <RevealText>
          <h2 className="bp-large-text">Himalaya <br/>Mountain.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24, maxWidth: '800px' }}>
            Logo lấy ý tưởng từ vùng núi Himalaya, tượng trưng cho sự khám phá, mạo hiểm không ngừng tiến lên phía trước. Dưới đây là các tiêu chuẩn bắt buộc về Không Gian An Toàn, Tỉ lệ tối thiểu và Phiên bản Logo trên các nền màu khác nhau.
          </p>
        </RevealText>

        <RevealText>
          <div className="bp-logo-showcase" style={{ marginTop: 40, background: 'var(--bp-card-bg)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--bp-border)' }}>
            <img 
              src="/logo-guideline.png" 
              alt="FIT Tour Logo Guidelines" 
              style={{ width: '100%', height: 'auto', display: 'block', mixBlendMode: 'multiply' }} 
            />
          </div>
        </RevealText>

        <RevealText>
          <div className="bp-rules-grid" style={{ marginTop: 24 }}>
             <div className="bp-rule-card" style={{ border: '1px solid var(--bp-border)' }}>
              <div className="bp-rule-icon">📐 Vùng An Toàn</div>
              <strong>Khoảng cách tối thiểu 120px</strong><br/>
              Luôn giữ không gian trống 120px xung quanh Logo. Tỉ lệ in tối thiểu (Print) là 20mm.
            </div>
             <div className="bp-rule-card" style={{ border: '1px solid var(--bp-border)' }}>
              <div className="bp-rule-icon">🏷️ Nametag & In ấn</div>
              <strong>Nền trắng hoặc cam</strong><br/>
              Logo luôn rõ ràng, không chìm nền. Tôn trọng thiết kế cũ được khách hàng đánh giá là mẫu Nametag đẹp.
            </div>
          </div>
        </RevealText>
      </section>



      {/* ── Footer ── */}
      <footer className="bp-footer">
        <div className="bp-footer-logo">FIT Tour</div>
        <p>Bespoke Brand Identity Guideline. Dành cho team Marketing, không chia sẻ với bất kì hình thức nào khác.</p>
      </footer>
    </div>
  );
};

export default BrandGuidelinePage;
