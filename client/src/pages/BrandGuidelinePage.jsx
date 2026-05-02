import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Copy, CheckCircle, ChevronLeft, ChevronRight, Menu, X, ArrowLeft, Download } from 'lucide-react';
import '../styles/brand-guideline.css';

/* ═══ Page Data ═══ */
const PAGES = [
  { id: 'home', path: '/tai-lieu/brand-guideline', label: 'Tổng Quan', icon: '🏠' },
  { id: 'logo', path: '/tai-lieu/brand-guideline/logo', label: 'Logo', icon: '✦' },
  { id: 'colors', path: '/tai-lieu/brand-guideline/mau-sac', label: 'Màu Sắc', icon: '🎨' },
  { id: 'typography', path: '/tai-lieu/brand-guideline/phong-chu', label: 'Phông Chữ', icon: '𝐀' },
  { id: 'photography', path: '/tai-lieu/brand-guideline/nhiep-anh', label: 'Nhiếp Ảnh', icon: '📷' },
  { id: 'application', path: '/tai-lieu/brand-guideline/ung-dung', label: 'Ứng Dụng', icon: '📐' },
  { id: 'resources', path: '/tai-lieu/brand-guideline/tai-nguyen', label: 'Tài Nguyên', icon: '📦' },
];

const COLORS = {
  primary: [
    { name: 'Sunrise Orange', hex: '#FF600B' },
    { name: 'Golden Yellow', hex: '#FDAF03' },
    { name: 'Ocean Blue', hex: '#1E99E5' },
    { name: 'Forest Green', hex: '#43A047' },
  ],
  neutral: [
    { name: 'Neutral Dark', hex: '#212121' },
    { name: 'Warm Grey', hex: '#F5F5F5' },
    { name: 'Light Grey', hex: '#E0E0E0' },
    { name: 'Medium Grey', hex: '#9E9E9E' },
  ],
};

/* ═══ Sidebar ═══ */
const Sidebar = ({ currentPath, onNavigate, open, onClose }) => (
  <>
    <div className={`bp-overlay ${open ? 'show' : ''}`} onClick={onClose} />
    <aside className={`bp-sidebar ${open ? 'open' : ''}`}>
      <Link to="/tai-lieu/marketing" className="bp-sidebar-logo" onClick={onClose}>
        <img src="/logo.png" alt="FIT Tour" />
        <span>Brand Book</span>
      </Link>
      <nav className="bp-sidebar-nav">
        {PAGES.map(p => (
          <button key={p.id} className={`bp-nav-item ${currentPath === p.path ? 'active' : ''}`}
            onClick={() => { onNavigate(p.path); onClose(); }}>
            <span className="bp-nav-item-icon">{p.icon}</span> {p.label}
          </button>
        ))}
      </nav>
      <div className="bp-sidebar-footer">
        <Link to="/tai-lieu" style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
          <ArrowLeft size={12} /> Quay lại Tài Liệu
        </Link>
        <div style={{ marginTop: 8 }}>© FIT Tour {new Date().getFullYear()}</div>
      </div>
    </aside>
  </>
);

/* ═══ Prev/Next Footer ═══ */
const PageNav = ({ currentPath, onNavigate }) => {
  const idx = PAGES.findIndex(p => p.path === currentPath);
  const prev = idx > 0 ? PAGES[idx - 1] : null;
  const next = idx < PAGES.length - 1 ? PAGES[idx + 1] : null;
  return (
    <div className="bp-nav-footer">
      {prev ? (
        <button className="bp-nav-footer-btn" onClick={() => onNavigate(prev.path)}>
          <span className="bp-nav-footer-label">← Trang trước</span>
          <span className="bp-nav-footer-title">{prev.label}</span>
        </button>
      ) : <div />}
      {next && (
        <button className="bp-nav-footer-btn next" onClick={() => onNavigate(next.path)}>
          <span className="bp-nav-footer-label">Trang sau →</span>
          <span className="bp-nav-footer-title">{next.label}</span>
        </button>
      )}
    </div>
  );
};

/* ═══ Color Swatch ═══ */
const Swatch = ({ name, hex }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  const isLight = ['#F5F5F5', '#E0E0E0', '#FFFFFF'].includes(hex.toUpperCase());
  return (
    <div className="bp-swatch" onClick={handleCopy}>
      <div className="bp-swatch-color" style={{ backgroundColor: hex, border: isLight ? '1px solid #e2e8f0' : 'none' }}>
        {copied && <div className="bp-swatch-copied"><CheckCircle size={16} /> Đã copy!</div>}
      </div>
      <div className="bp-swatch-info">
        <div className="bp-swatch-name">{name}</div>
        <div className="bp-swatch-hex">{hex}</div>
      </div>
    </div>
  );
};

/* ═══ Individual Pages ═══ */
const HomePage = ({ onNavigate }) => (
  <div className="bp-page">
    <div className="bp-hero home">
      <div className="bp-hero-label">FIT Tour Brand Identity</div>
      <h1>One guidebook for everyone.</h1>
      <p>Tài liệu quy chuẩn nhận diện thương hiệu nội bộ — Hướng đến sự sang trọng, tinh tế và trải nghiệm đẳng cấp (Luxury & Bespoke).</p>
    </div>
    <div className="bp-content">
      <div className="bp-section">
        <h2>Về FIT Tour</h2>
        <p style={{ marginTop: 20 }}>FIT TOUR là đơn vị chuyên thiết kế tour và tổ chức sự kiện, tập trung vào những hành trình có chiều sâu và trải nghiệm khác biệt. Mỗi chuyến đi không chỉ là di chuyển, mà là sự kết hợp giữa cảm xúc, câu chuyện và giá trị cá nhân hóa.</p>
        <div className="bp-highlight">"Khách hàng mục tiêu là người có thu nhập cao, ưa thích sự tinh tế, sẵn sàng chi trả cho sự chỉn chu."</div>
        <p>Hành vi trên Facebook: Họ lướt nhanh, bị thu hút bởi cảm xúc (Cinematic). Hình ảnh phải tinh gọn, đẳng cấp, không được "rẻ tiền" hay nhồi nhét chữ.</p>
      </div>
      <div className="bp-cta-grid">
        <div className="bp-cta-card" onClick={() => onNavigate(PAGES[1].path)}>
          <div className="bp-cta-card-icon">📘</div>
          <h3>Cẩm Nang Thương Hiệu</h3>
          <p>Logo, Màu sắc, Phông chữ, Nhiếp ảnh và Ứng dụng — tất cả quy chuẩn nhận diện thương hiệu FIT Tour.</p>
          <span className="bp-cta-card-arrow">→</span>
        </div>
        <div className="bp-cta-card" onClick={() => onNavigate(PAGES[6].path)}>
          <div className="bp-cta-card-icon">📦</div>
          <h3>Tài Nguyên</h3>
          <p>Tải về logo, font chữ, template thiết kế và các tài nguyên thương hiệu khác.</p>
          <span className="bp-cta-card-arrow">→</span>
        </div>
      </div>
    </div>
  </div>
);

const LogoPage = () => (
  <div className="bp-page">
    <div className="bp-hero">
      <div className="bp-hero-label">Cẩm Nang</div>
      <h1>Logo</h1>
      <p>Logo FIT Tour là biểu tượng nhận diện quan trọng, xuất hiện trên mọi nền tảng truyền thông và ấn phẩm.</p>
    </div>
    <div className="bp-content">
      <div className="bp-section">
        <h2>Logo Chính</h2>
        <p style={{ marginTop: 20 }}>Lấy ý tưởng từ vùng núi Himalaya, tượng trưng cho sự khám phá, mạo hiểm không ngừng tiến lên.</p>
        <div className="bp-logo-display">
          <div className="bp-logo-box light">
            <span className="bp-logo-box-label" style={{ color: '#64748b' }}>Nền sáng</span>
            <img src="/logo.png" alt="FIT Tour Logo" />
          </div>
          <div className="bp-logo-box dark">
            <span className="bp-logo-box-label" style={{ color: '#94a3b8' }}>Nền tối</span>
            <img src="/logo.png" alt="FIT Tour Logo" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
        </div>
      </div>
      <div className="bp-section">
        <h2>Khoảng Cách An Toàn</h2>
        <p style={{ marginTop: 20 }}>Luôn đảm bảo khoảng cách tối thiểu 120px xung quanh logo trong mọi thiết kế.</p>
        <div className="bp-clearspace">
          <span className="bp-clearspace-label top">120px</span>
          <span className="bp-clearspace-label left">120px</span>
          <span className="bp-clearspace-label right">120px</span>
          <span className="bp-clearspace-label bottom">120px</span>
          <img src="/logo.png" alt="Logo Clear Space" />
        </div>
      </div>
      <div className="bp-section">
        <h2>Sử Dụng Đúng / Sai</h2>
        <div className="bp-do-dont">
          <div className="bp-do"><strong>✅ NÊN</strong>Sử dụng logo nguyên bản trên nền sáng hoặc nền tối. Giữ đúng tỉ lệ và khoảng cách an toàn.</div>
          <div className="bp-dont"><strong>❌ KHÔNG NÊN</strong>Không kéo giãn, xoay, thay đổi màu sắc hoặc thêm hiệu ứng (shadow, glow) lên logo.</div>
        </div>
      </div>
    </div>
  </div>
);

const ColorsPage = () => (
  <div className="bp-page">
    <div className="bp-hero">
      <div className="bp-hero-label">Cẩm Nang</div>
      <h1>Màu Sắc</h1>
      <p>Tông màu ấm (cam – vàng) đại diện cho hành trình, cảm xúc và sự dẫn dắt, kết hợp với nền trung tính giúp tổng thể luôn sạch, sang.</p>
    </div>
    <div className="bp-content">
      <div className="bp-section">
        <h2>Bảng Màu FIT Tour</h2>
        <div className="bp-color-group" style={{ marginTop: 24 }}>
          <div className="bp-color-group-title">Màu chủ đạo (Primary)</div>
          <p style={{ marginBottom: 16, fontSize: '0.9rem', color: '#64748b' }}>Nhóm màu chính, sử dụng nhất quán trong logo, vật phẩm in ấn và thiết kế digital.</p>
          <div className="bp-swatches">
            {COLORS.primary.map(c => <Swatch key={c.hex} {...c} />)}
          </div>
        </div>
        <div className="bp-color-group">
          <div className="bp-color-group-title">Màu trung tính (Neutral)</div>
          <p style={{ marginBottom: 16, fontSize: '0.9rem', color: '#64748b' }}>Dùng cho nền, văn bản và các thành phần UI phụ trợ.</p>
          <div className="bp-swatches">
            {COLORS.neutral.map(c => <Swatch key={c.hex} {...c} />)}
          </div>
        </div>
      </div>
      <div className="bp-section">
        <h2>Quy Tắc Sử Dụng Màu</h2>
        <div className="bp-do-dont" style={{ marginTop: 20 }}>
          <div className="bp-do"><strong>✅ NÊN</strong>Ưu tiên Sunrise Orange (#FF600B) cho CTA, tiêu đề nổi bật. Dùng Golden Yellow (#FDAF03) cho accent. Nền trung tính sạch sẽ.</div>
          <div className="bp-dont"><strong>❌ KHÔNG NÊN</strong>Không dùng quá 3 màu chủ đạo trong cùng 1 thiết kế. Không dùng màu neon hay gradient cầu vồng.</div>
        </div>
      </div>
    </div>
  </div>
);

const TypographyPage = () => (
  <div className="bp-page">
    <div className="bp-hero">
      <div className="bp-hero-label">Cẩm Nang</div>
      <h1>Phông Chữ</h1>
      <p>Hệ thống phông chữ của FIT Tour gồm font Heading sang trọng và font Body hiện đại, dễ đọc.</p>
    </div>
    <div className="bp-content">
      <div className="bp-section">
        <h2>Phông Chữ FIT Tour</h2>
        <div className="bp-type-specimen" style={{ marginTop: 24 }}>
          <div className="bp-type-label">Headline Font</div>
          <div className="bp-type-preview heading">SVN Playfair Display</div>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>Nhắm đến sự sang trọng, truyền cảm hứng. Thích hợp với ngành du lịch cao cấp. Sử dụng cho các tiêu đề chính, poster, và banner.</p>
          <div className="bp-type-alphabet" style={{ fontFamily: 'var(--brand-font-heading)' }}>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</div>
          <div className="bp-type-alphabet" style={{ fontFamily: 'var(--brand-font-heading)' }}>0 1 2 3 4 5 6 7 8 9 ! @ # $ % & * ( )</div>
        </div>
        <div className="bp-type-specimen">
          <div className="bp-type-label">Body Font</div>
          <div className="bp-type-preview body">Inter / Roboto</div>
          <p style={{ color: '#64748b', margin: '8px 0 0' }}>Dễ đọc, hiện đại, hiển thị tốt trên digital lẫn in ấn. Sử dụng cho đoạn văn bản dài, chú thích, và nội dung chi tiết.</p>
          <div className="bp-type-alphabet" style={{ fontFamily: 'var(--brand-font-body)' }}>Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz</div>
          <div className="bp-type-weights">
            <div className="bp-type-weight"><span style={{ fontWeight: 300, fontFamily: 'var(--brand-font-body)' }}>Ag</span><small>Light 300</small></div>
            <div className="bp-type-weight"><span style={{ fontWeight: 400, fontFamily: 'var(--brand-font-body)' }}>Ag</span><small>Regular 400</small></div>
            <div className="bp-type-weight"><span style={{ fontWeight: 600, fontFamily: 'var(--brand-font-body)' }}>Ag</span><small>SemiBold 600</small></div>
            <div className="bp-type-weight"><span style={{ fontWeight: 700, fontFamily: 'var(--brand-font-body)' }}>Ag</span><small>Bold 700</small></div>
          </div>
        </div>
      </div>
      <div className="bp-section">
        <h2>Phân Loại Sử Dụng</h2>
        <div className="bp-do-dont" style={{ marginTop: 20 }}>
          <div className="bp-do"><strong>✅ NÊN</strong>Dùng SVN Playfair Display cho tiêu đề (3–10 từ). Dùng Inter/Roboto cho thân bài dài. Giữ khoảng cách dòng 150%.</div>
          <div className="bp-dont"><strong>❌ KHÔNG NÊN</strong>Không dùng font heading cho đoạn văn dài. Không mix quá 2 font trong 1 layout. Không dùng font in hoa toàn bộ thân bài.</div>
        </div>
      </div>
    </div>
  </div>
);

const PhotographyPage = () => (
  <div className="bp-page">
    <div className="bp-hero">
      <div className="bp-hero-label">Cẩm Nang</div>
      <h1>Nhiếp Ảnh & Imagery</h1>
      <p>Phong cách hình ảnh Cinematic — tinh gọn, đẳng cấp, gợi cảm xúc cho đối tượng thu nhập cao.</p>
    </div>
    <div className="bp-content">
      <div className="bp-section">
        <h2>Phong Cách Chụp Ảnh</h2>
        <div className="bp-highlight" style={{ marginTop: 20 }}>Ảnh phải chiếm 70-80% bố cục. Overlay cam nhẹ (opacity thấp). Nội dung ngắn gọn, thông điệp rõ ràng.</div>
        <div className="bp-imagery-grid">
          <div className="bp-imagery-card">
            <img src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?w=800&auto=format&fit=crop" alt="Landscape" />
            <div className="bp-imagery-overlay">
              <span className="bp-imagery-tag">Landscape</span>
              <div className="bp-imagery-title">Phong cảnh hùng vĩ</div>
              <div className="bp-imagery-desc">Ưu tiên góc rộng, ánh sáng tự nhiên, tông ấm</div>
            </div>
          </div>
          <div className="bp-imagery-card">
            <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?w=800&auto=format&fit=crop" alt="Culture" />
            <div className="bp-imagery-overlay">
              <span className="bp-imagery-tag">Culture</span>
              <div className="bp-imagery-title">Văn hóa & Con người</div>
              <div className="bp-imagery-desc">Chân thực, cảm xúc, storytelling</div>
            </div>
          </div>
        </div>
      </div>
      <div className="bp-section">
        <h2>Quy Tắc Hình Ảnh</h2>
        <div className="bp-do-dont" style={{ marginTop: 20 }}>
          <div className="bp-do"><strong>✅ NÊN</strong>Ảnh chất lượng cao, Cinematic. Tông màu ấm. Bố cục thoáng. Hình ảnh truyền cảm xúc khám phá.</div>
          <div className="bp-dont"><strong>❌ KHÔNG NÊN</strong>Không dùng stock ảnh rẻ tiền, filter quá đậm, nhồi nhét chữ lên ảnh, hoặc watermark.</div>
        </div>
      </div>
    </div>
  </div>
);

const ApplicationPage = () => (
  <div className="bp-page">
    <div className="bp-hero">
      <div className="bp-hero-label">Cẩm Nang</div>
      <h1>Ứng Dụng</h1>
      <p>Hướng dẫn áp dụng nhận diện thương hiệu trên Social Media và các ấn phẩm truyền thông.</p>
    </div>
    <div className="bp-content">
      <div className="bp-section">
        <h2>Social Media Layouts</h2>
        <div className="bp-cards-grid" style={{ marginTop: 20 }}>
          {[
            { title: 'Facebook Post (Vuông)', desc: 'Kích thước 900×900px. Ảnh chiếm 70-80%.', size: '900×900' },
            { title: 'Poster (Dọc)', desc: 'Kích thước 1080×1350px. Hình ảnh lớn, Cinematic.', size: '1080×1350' },
            { title: 'Facebook Cover', desc: 'Kích thước 820×312px. Bố cục thoáng, branding rõ.', size: '820×312' },
            { title: 'Instagram Story', desc: 'Kích thước 1080×1920px. Nội dung ngắn gọn.', size: '1080×1920' },
          ].map(item => (
            <div key={item.title} className="bp-card-link" style={{ cursor: 'default' }}>
              <h4>{item.title}</h4>
              <p>{item.desc}</p>
              <div style={{ marginTop: 12, display: 'inline-block', padding: '4px 12px', background: '#f1f5f9', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, color: '#64748b' }}>{item.size}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bp-section">
        <h2>Quy Tắc Thiết Kế</h2>
        <ul style={{ marginTop: 16 }}>
          <li>Logo FIT Tour luôn xuất hiện ở góc trên hoặc dưới, kích thước vừa phải</li>
          <li>Màu chủ đạo: Sunrise Orange cho CTA, nền tối cho sang trọng</li>
          <li>Font tiêu đề: SVN Playfair Display, Font body: Inter</li>
          <li>Không nhồi nhét quá 30 từ trên 1 ấn phẩm social</li>
        </ul>
      </div>
    </div>
  </div>
);

const ResourcesPage = () => (
  <div className="bp-page">
    <div className="bp-hero">
      <div className="bp-hero-label">Tài Nguyên</div>
      <h1>Tải Về Tài Nguyên</h1>
      <p>Logo, font chữ, template thiết kế và các tài nguyên thương hiệu chính thức của FIT Tour.</p>
    </div>
    <div className="bp-content">
      <div className="bp-section">
        <h2>Tài Nguyên Thương Hiệu</h2>
        <div className="bp-resource-grid" style={{ marginTop: 20 }}>
          {[
            { icon: '🖼️', name: 'Logo Pack', type: 'PNG, SVG — Full color & Mono' },
            { icon: '🔤', name: 'Font Files', type: 'SVN Playfair Display + Inter' },
            { icon: '🎨', name: 'Bảng Màu', type: 'ASE, PDF — Color Palette' },
            { icon: '📄', name: 'Brand Guideline PDF', type: 'PDF — Tài liệu gốc đầy đủ' },
            { icon: '📐', name: 'Template Social', type: 'PSD, Figma — FB, IG layouts' },
            { icon: '✉️', name: 'Email Signature', type: 'HTML — Chữ ký email chuẩn' },
          ].map(r => (
            <a key={r.name} className="bp-resource-card" href="#" onClick={e => { e.preventDefault(); alert('Tính năng tải về sẽ sớm được cập nhật!'); }}>
              <div className="bp-resource-icon">{r.icon}</div>
              <div className="bp-resource-name">{r.name}</div>
              <div className="bp-resource-type">{r.type}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  </div>
);

/* ═══ Page Router Map ═══ */
const PAGE_COMPONENTS = {
  home: HomePage,
  logo: LogoPage,
  colors: ColorsPage,
  typography: TypographyPage,
  photography: PhotographyPage,
  application: ApplicationPage,
  resources: ResourcesPage,
};

/* ═══ Main Component ═══ */
const BrandGuidelinePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentPath = location.pathname.replace(/\/$/, '') || '/tai-lieu/brand-guideline';
  const currentPage = PAGES.find(p => p.path === currentPath) || PAGES[0];
  const PageComponent = PAGE_COMPONENTS[currentPage.id] || HomePage;

  const handleNavigate = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  useEffect(() => { window.scrollTo(0, 0); }, [currentPath]);

  return (
    <div className="bp-shell">
      <button className="bp-hamburger" onClick={() => setSidebarOpen(true)}><Menu size={22} /></button>
      <Sidebar currentPath={currentPath} onNavigate={handleNavigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="bp-main">
        <PageComponent onNavigate={handleNavigate} />
        <PageNav currentPath={currentPath} onNavigate={handleNavigate} />
        <div className="bp-footer">FIT Tour Brand Identity Guideline · Tài liệu nội bộ · Không chia sẻ ra bên ngoài.</div>
      </main>
    </div>
  );
};

export default BrandGuidelinePage;
