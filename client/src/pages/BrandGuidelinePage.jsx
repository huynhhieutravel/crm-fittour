import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, CheckCircle, ArrowLeft } from 'lucide-react';
import '../styles/brand-guideline.css';

/* ═══ Data ═══ */
const COLORS = [
  { name: 'Sunrise Orange', hex: '#FF600B', text: 'white' },
  { name: 'Golden Yellow', hex: '#FDAF03', text: 'black' },
  { name: 'Ocean Blue', hex: '#1E99E5', text: 'white' },
  { name: 'Forest Green', hex: '#43A047', text: 'white' },
  { name: 'Neutral Dark', hex: '#212121', text: 'white' },
  { name: 'Warm Grey', hex: '#F5F5F5', text: 'black' },
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
  const navigate = useNavigate();
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
          <a href="#vision" onClick={(e) => { e.preventDefault(); scrollTo('vision'); }} className="bp-nav-link">Tầm Nhìn</a>
          <a href="#colors" onClick={(e) => { e.preventDefault(); scrollTo('colors'); }} className="bp-nav-link">Màu Sắc</a>
          <a href="#typography" onClick={(e) => { e.preventDefault(); scrollTo('typography'); }} className="bp-nav-link">Phông Chữ</a>
          <a href="#photography" onClick={(e) => { e.preventDefault(); scrollTo('photography'); }} className="bp-nav-link">Nhiếp Ảnh</a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="bp-hero">
        <div className="bp-hero-bg-blur"></div>
        <RevealText>
          <h1 className="bp-massive-text">
            Du Lịch <br />
            <span style={{ color: 'var(--bp-orange)' }}>Có Guu.</span>
          </h1>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 32 }}>
            Sổ tay thương hiệu nội bộ của FIT Tour. Sinh ra từ trải nghiệm thực địa và tinh thần làm nghề cẩn trọng. Không chỉ đi, mà sống trọn hành trình.
          </p>
        </RevealText>
      </section>

      {/* ── Vision Section ── */}
      <section id="vision" className="bp-section dark">
        <RevealText>
          <h2 className="bp-large-text">Trải nghiệm thực địa <br/>& Omotenashi.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 40 }}>
            FIT Tour định vị là chuyên gia thiết kế hành trình Bespoke (Vinh danh Thương Hiệu Thiết Kế Tour Xuất Sắc Nhất 2024). Khách hàng của chúng ta yêu thích sự khác biệt ở Tây Tạng, Tân Cương, Ai Cập, Ladakh... Mọi thiết kế, câu chữ phải phản ánh sự chân thực, cái "Guu" riêng và tinh thần phục vụ tận tâm.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-rules-grid">
            <div className="bp-rule-card do">
              <div className="bp-rule-icon">✅ NÊN</div>
              <strong>Chân Thực & Tinh Tế</strong><br/>
              Ưu tiên sự tối giản và chân thực. Hình ảnh thể hiện rõ không khí vùng đất và cảm xúc thật. Câu chữ ngắn gọn, sâu sắc, chia sẻ từ chính kinh nghiệm thực địa của HDV.
            </div>
            <div className="bp-rule-card dont">
              <div className="bp-rule-icon">❌ KHÔNG NÊN</div>
              <strong>Phô Trương & Đại Trà</strong><br/>
              Không dùng từ ngữ sáo rỗng, hô khẩu hiệu cường điệu ("siêu rẻ", "sốc"). Không nhồi nhét quá nhiều thông tin vào một ấn phẩm. Tránh ảnh stock giả tạo.
            </div>
          </div>
        </RevealText>
      </section>

      {/* ── Colors Section ── */}
      <section id="colors" className="bp-section">
        <RevealText>
          <h2 className="bp-large-text">Sắc cam dẫn lối.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24 }}>
            Tông màu ấm (Cam – Vàng) đại diện cho hành trình, ánh sáng mặt trời và sự dẫn dắt. Kết hợp cùng nền trung tính giúp tổng thể luôn sạch và sang trọng.
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
            SVN Playfair Display mang lại nét sang trọng, điện ảnh cho các tiêu đề lớn. Inter cung cấp sự dễ đọc, hiện đại cho phần thân bài.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-typo-showcase">
            <div className="bp-typo-block heading">
              <div className="bp-typo-label">Headline Font — SVN Playfair Display</div>
              <div className="bp-typo-alphabet">
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br/>
                0 1 2 3 4 5 6 7 8 9
              </div>
            </div>
            <div className="bp-typo-block body">
              <div className="bp-typo-label">Body Font — Inter</div>
              <div className="bp-typo-alphabet">
                Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz<br/>
                0 1 2 3 4 5 6 7 8 9
              </div>
            </div>
          </div>
        </RevealText>
      </section>

      {/* ── Photography Section ── */}
      <section id="photography" className="bp-section dark">
        <RevealText>
          <h2 className="bp-large-text">Góc nhìn<br/>chân thực.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24 }}>
            Hình ảnh phải thể hiện được trải nghiệm thực tế, văn hóa bản địa (Tân Cương, Tây Tạng, Himalaya) và cảm xúc thật của khách hàng cùng đội ngũ FIT Tour. Tuyệt đối không dùng ảnh stock sáo rỗng.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-imagery-grid">
            <div className="bp-image-card">
              <img src="https://images.unsplash.com/photo-1518599904199-0ca897819ddb?w=1200&auto=format&fit=crop" alt="Himalaya Landscape" />
              <div className="bp-image-overlay">
                <h3>Hành trình vĩ đại</h3>
                <p>Tôn vinh thiên nhiên Tây Tạng, Tân Cương, Ladakh. Con người là điểm nhấn nhỏ bé để thấy sự hùng vĩ của đất trời.</p>
              </div>
            </div>
            <div className="bp-image-card">
              <img src="https://images.unsplash.com/photo-1533630654593-b222d5d44449?w=1200&auto=format&fit=crop" alt="Local Culture" />
              <div className="bp-image-overlay">
                <h3>Văn hóa bản địa</h3>
                <p>Bắt trọn nụ cười chân thật của người dân địa phương và khoảnh khắc tận tâm của hướng dẫn viên trên hành trình.</p>
              </div>
            </div>
          </div>
        </RevealText>
      </section>

      {/* ── Footer ── */}
      <footer className="bp-footer">
        <div className="bp-footer-logo">FIT Tour</div>
        <p>Bespoke Brand Identity Guideline. Tài liệu nội bộ lưu hành trong công ty.</p>
      </footer>
    </div>
  );
};

export default BrandGuidelinePage;
