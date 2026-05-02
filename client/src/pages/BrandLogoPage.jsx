import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
import '../styles/brand-guideline.css';

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

const BrandLogoPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bp-container">
      {/* ── Hero ── */}
      <section className="bp-hero" style={{ minHeight: '60vh' }}>
        <div className="bp-hero-bg-blur"></div>
        <RevealText>
          <h1 className="bp-massive-text" style={{ fontSize: '6rem' }}>
            Logo <br />
            <span style={{ color: 'var(--bp-orange)' }}>FIT Tour.</span>
          </h1>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 32, maxWidth: '800px' }}>
            Biểu tượng thương hiệu FIT Tour lấy ý tưởng từ dãy núi Himalaya, đại diện cho tinh thần khám phá, mạo hiểm và khát khao tiến về phía trước.
          </p>
        </RevealText>
      </section>

      {/* ── Visual Guideline ── */}
      <section className="bp-section dark">
        <RevealText>
          <h2 className="bp-large-text">Quy chuẩn <br/>sử dụng.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24, maxWidth: '800px' }}>
            Để duy trì tính nhất quán và đẳng cấp của thương hiệu, logo phải được sử dụng đúng tỷ lệ, luôn tuân thủ khoảng cách an toàn và màu nền cho phép.
          </p>
        </RevealText>

        <RevealText>
          <div className="bp-logo-showcase" style={{ marginTop: 60, background: 'var(--bp-card-bg)', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
            <img 
              src="/logo-guideline.png" 
              alt="FIT Tour Logo Guidelines" 
              style={{ width: '100%', height: 'auto', display: 'block' }} 
            />
          </div>
        </RevealText>

        <RevealText>
          <div className="bp-rules-grid" style={{ marginTop: 60 }}>
             <div className="bp-rule-card do">
              <div className="bp-rule-icon">📐 Vùng An Toàn</div>
              <strong>Khoảng cách tối thiểu 120px</strong><br/>
              Luôn giữ không gian trống 120px xung quanh Logo để logo luôn nổi bật và không bị chèn ép bởi các yếu tố thiết kế khác. Tỉ lệ in tối thiểu (Print) là 20mm.
            </div>
             <div className="bp-rule-card dont">
              <div className="bp-rule-icon">❌ Không Được Làm</div>
              <strong>Nghiêm cấm biến dạng</strong><br/>
              Tuyệt đối không kéo giãn, bóp méo, tự ý đổi màu logo khác với bảng màu chuẩn, hoặc đặt logo lên các nền quá rối mắt (chìm nền).
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

export default BrandLogoPage;
