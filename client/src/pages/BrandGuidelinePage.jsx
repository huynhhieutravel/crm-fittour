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
            Bespoke <br />
            <span style={{ color: 'var(--bp-orange)' }}>With Taste.</span>
          </h1>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 32 }}>
            Sổ tay nhận diện thương hiệu nội bộ của FIT Tour. Một bản nguyên tắc hướng đến sự sang trọng, tinh tế và trải nghiệm đẳng cấp dành cho dòng khách hàng thu nhập cao.
          </p>
        </RevealText>
      </section>

      {/* ── Vision Section ── */}
      <section id="vision" className="bp-section dark">
        <RevealText>
          <h2 className="bp-large-text">Không chỉ là di chuyển.<br/>Đó là cảm xúc.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 40 }}>
            FIT Tour định vị là chuyên gia thiết kế các hành trình có chiều sâu. Đối tượng khách hàng lướt nhanh, bị thu hút bởi cảm giác "Cinematic". 
            Mọi hình ảnh, màu sắc và câu chữ phát ra từ thương hiệu không được phép "rẻ tiền", nhồi nhét, hay thiếu thẩm mỹ.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-rules-grid">
            <div className="bp-rule-card do">
              <div className="bp-rule-icon">✅ NÊN</div>
              <strong>Tinh Gọn & Sang Trọng</strong><br/>
              Ưu tiên sự tối giản. Hình ảnh chiếm 80% bố cục, copy cực ngắn gọn. Sử dụng khoảng trắng một cách có chủ đích để mắt người đọc được nghỉ ngơi.
            </div>
            <div className="bp-rule-card dont">
              <div className="bp-rule-icon">❌ KHÔNG NÊN</div>
              <strong>Nhồi Nhét & Rối Mắt</strong><br/>
              Tránh viết đoạn văn dài trên ảnh. Tránh dùng màu gradient cầu vồng, hiệu ứng shadow/glow quê mùa. Đừng bao giờ làm méo logo.
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
          <h2 className="bp-large-text">Ống kính<br/>điện ảnh.</h2>
        </RevealText>
        <RevealText>
          <p className="bp-subtitle" style={{ marginTop: 24 }}>
            Khắt khe trong việc chọn ảnh. Không dùng ảnh stock giả tạo. Hình ảnh phải bắt được ánh sáng tự nhiên, bố cục thoáng, có chiều sâu và truyền tải được một câu chuyện.
          </p>
        </RevealText>
        
        <RevealText>
          <div className="bp-imagery-grid">
            <div className="bp-image-card">
              <img src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?w=1200&auto=format&fit=crop" alt="Landscape" />
              <div className="bp-image-overlay">
                <h3>Sự hùng vĩ</h3>
                <p>Khung cảnh thiên nhiên bao la, con người là một điểm nhấn nhỏ bé để tôn lên sự vĩ đại của hành trình.</p>
              </div>
            </div>
            <div className="bp-image-card">
              <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=1200&auto=format&fit=crop" alt="Culture" />
              <div className="bp-image-overlay">
                <h3>Văn hóa chân thực</h3>
                <p>Bắt trọn khoảnh khắc đời thường, nụ cười chân thật, tránh các bức ảnh tạo dáng cứng nhắc.</p>
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
