import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import '../styles/brand-guideline.css';

/* ═══ Data Extracted from PDF ═══ */
const COLORS = [
  { name: 'Sunrise Orange', hex: '#FF600B', text: 'white' },
  { name: 'Golden Yellow', hex: '#FDAF03', text: 'black' },
  { name: 'Ocean Blue', hex: '#1E99E5', text: 'white' },
  { name: 'Forest Green', hex: '#43A047', text: 'white' },
  { name: 'Neutral Dark', hex: '#212121', text: 'white' },
  { name: 'Warm Grey', hex: '#F5F5F5', text: 'black' },
  { name: 'Light Grey', hex: '#E0E0E0', text: 'black' },
  { name: 'Medium Grey', hex: '#9E9E9E', text: 'white' },
];

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

const Swatch = ({ name, hex, text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bp-swatch" onClick={handleCopy}>
      <div className="bp-swatch-color" style={{ backgroundColor: hex, color: text }}>
        <div className={`bp-swatch-copied ${copied ? 'show' : ''}`}>
          <CheckCircle size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: 4 }} /> 
          Copied
        </div>
      </div>
      <div className="bp-swatch-info">
        <div className="bp-swatch-name">{name}</div>
        <div className="bp-swatch-hex">{hex}</div>
      </div>
    </div>
  );
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
      {/* ── Header ── */}
      <header className={`bp-header ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/tai-lieu" className="bp-header-logo">
          <ArrowLeft size={20} />
          <span>FIT Tour Bespoke</span>
        </Link>
        <nav className="bp-nav">
          <a href="#vision" onClick={(e) => { e.preventDefault(); scrollTo('vision'); }} className="bp-nav-link">Định Vị</a>
          <Link to="/cam-nang-thuong-hieu/logo" className="bp-nav-link">Logo</Link>
          <a href="#colors" onClick={(e) => { e.preventDefault(); scrollTo('colors'); }} className="bp-nav-link">Màu Sắc</a>
          <a href="#typography" onClick={(e) => { e.preventDefault(); scrollTo('typography'); }} className="bp-nav-link">Phông Chữ</a>
          <a href="#social" onClick={(e) => { e.preventDefault(); scrollTo('social'); }} className="bp-nav-link">Facebook & AI</a>
        </nav>
      </header>

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

      {/* ── Colors Section ── */}
      <section id="colors" className="bp-section dark">
        <RevealText>
          <h2 className="bp-large-text">Sắc cam dẫn lối.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24 }}>
            Bảng màu được xây dựng xoay quanh năng lượng – trải nghiệm – sự cao cấp tinh gọn. Tông màu ấm (Cam – Vàng) đại diện cho hành trình, cảm xúc và sự dẫn dắt, kết hợp với nền trung tính giúp tổng thể luôn sạch, sang.
          </p>
        </RevealText>
        <RevealText>
          <div className="bp-color-grid">
            {COLORS.map(c => <Swatch key={c.hex} {...c} />)}
          </div>
        </RevealText>
      </section>

      {/* ── Typography Section ── */}
      <section id="typography" className="bp-section">
        <RevealText>
          <h2 className="bp-large-text">Tôn vinh <br/>từng con chữ.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24 }}>
            Font chữ lựa chọn sự tối giản, an toàn mà hiệu quả. Ưu tiên: Việt hóa, in ấn, ấn phẩm digital, Facebook.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-typo-showcase">
            <div className="bp-typo-block heading">
              <div className="bp-typo-label">Headline Font — Nhắm đến sự sang trọng, truyền cảm hứng</div>
              <p style={{fontFamily: "var(--bp-font-heading)", fontSize: "2rem", margin: "0 0 16px"}}>SVN Playfair Display / Cinzel / Lora</p>
              <div className="bp-typo-alphabet" style={{fontSize: "1.5rem", opacity: 0.7}}>
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br/>
                0 1 2 3 4 5 6 7 8 9
              </div>
            </div>
            <div className="bp-typo-block body">
              <div className="bp-typo-label">Body Font — Dễ đọc, hiện đại, hiển thị tốt trên digital lẫn in ấn</div>
              <p style={{fontFamily: "var(--bp-font-body)", fontSize: "2rem", margin: "0 0 16px"}}>Inter / Roboto / Noto Sans</p>
              <div className="bp-typo-alphabet" style={{fontSize: "1.5rem", opacity: 0.7}}>
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br/>
                0 1 2 3 4 5 6 7 8 9
              </div>
            </div>
          </div>
        </RevealText>
      </section>

      {/* ── Social & AI Section ── */}
      <section id="social" className="bp-section dark">
        <RevealText>
          <h2 className="bp-large-text">Ứng dụng <br/>Facebook & AI.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24 }}>
            Quy chuẩn hình ảnh và sử dụng trí tuệ nhân tạo (AI) trong sản xuất nội dung Digital.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-rules-grid">
            <div className="bp-rule-card do">
              <div className="bp-rule-icon">📱 Facebook Post</div>
              <strong>Ảnh chiếm 70–80% bố cục</strong><br/>
              Ưu tiên hình ảnh lớn, chất lượng cao. Bố cục thoáng, tập trung vào cảm xúc. <br/><br/>
              • Overlay nhẹ màu cam (opacity thấp)<br/>
              • Text trắng / vàng để nổi bật<br/>
              • CTA bắt buộc dùng Orange<br/>
              • Logo luôn đặt góc trái hoặc phía trên
            </div>
            <div className="bp-rule-card dont">
              <div className="bp-rule-icon">🤖 Lưu ý Sử dụng AI</div>
              <strong>AI là nguồn tài nguyên, không thay thế con người</strong><br/>
              Kết hợp AI lên ý tưởng, nhưng phải hoàn thiện lại bằng con người (AI final file). <br/><br/>
              • Tối đa đăng sản phẩm về AI / 1 tuần: 3 post.<br/>
              • Khung giờ đăng: 10h - 16h - 19h.<br/>
              • Không đăng bài trùng lặp khung thời gian để tránh flop.
            </div>
          </div>
        </RevealText>
        <RevealText>
           <div className="bp-typo-block" style={{ marginTop: 40, paddingTop: 40, borderColor: 'rgba(255,255,255,0.1)' }}>
              <div className="bp-typo-label">Kích thước Chuẩn Facebook</div>
              <ul style={{ color: '#a1a1aa', fontSize: '1.1rem', lineHeight: '1.8' }}>
                <li><strong>Post Vuông (Quảng cáo, social post):</strong> 900x900 px</li>
                <li><strong>Post Ngang:</strong> 1200x630 px, 1800x900px (post cắt đôi)</li>
                <li><strong>Post Dọc (Poster):</strong> 1080x1350 px</li>
                <li><strong>Story:</strong> 1080x1920 px</li>
                <li><strong>Post Sự Kiện:</strong> 1200x1200 px</li>
                <li><strong>Banner Web/Mail:</strong> 250x60, 200x60, 160x60 px</li>
              </ul>
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
