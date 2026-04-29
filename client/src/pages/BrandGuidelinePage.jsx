import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, CheckCircle, ChevronDown } from 'lucide-react';
import '../styles/brand-guideline.css';

const BrandGuidelinePage = () => {
  const [copiedColor, setCopiedColor] = useState(null);

  const colors = [
    { name: 'Sunrise Orange', hex: '#FF600B', type: 'Primary' },
    { name: 'Golden Yellow', hex: '#FDAF03', type: 'Primary' },
    { name: 'Ocean Blue', hex: '#1E99E5', type: 'Primary' },
    { name: 'Forest Green', hex: '#43A047', type: 'Primary' },
    { name: 'Neutral Dark', hex: '#212121', type: 'Neutral' },
    { name: 'Warm Grey', hex: '#F5F5F5', type: 'Neutral', border: true },
    { name: 'Light Grey', hex: '#E0E0E0', type: 'Neutral' },
    { name: 'Medium Grey', hex: '#9E9E9E', type: 'Neutral' }
  ];

  const handleCopy = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="brand-guideline-wrapper">
      {/* Navigation */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
        <Link to="/tai-lieu/marketing" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'white', textDecoration: 'none', fontWeight: 600, background: 'rgba(0,0,0,0.3)', padding: '10px 20px', borderRadius: 30, backdropFilter: 'blur(10px)' }}>
          <ArrowLeft size={16} /> Quay lại HUB Marketing
        </Link>
      </div>

      {/* Hero Section */}
      <section className="bg-hero">
        <h1 className="bg-hero-title">Brand Identity Guideline</h1>
        <p className="bg-hero-subtitle">Tài liệu quy chuẩn nhận diện thương hiệu nội bộ của FIT TOUR. Hướng đến sự sang trọng, tinh tế và trải nghiệm đẳng cấp (Luxury & Bespoke).</p>
        <div className="bg-hero-scroll">
          Cuộn để khám phá <br/><ChevronDown size={24} style={{ marginTop: 8 }} />
        </div>
      </section>

      {/* Core Message */}
      <section className="bg-section fade-in-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="bg-section-title">Định vị & Thông điệp</h2>
        <div className="bg-core-message">
          <div className="bg-core-text">
            <p>FIT TOUR là đơn vị chuyên thiết kế tour và tổ chức sự kiện, tập trung vào những hành trình có chiều sâu và trải nghiệm khác biệt.</p>
            <p style={{ marginTop: '1rem' }}>Mỗi chuyến đi không chỉ là di chuyển, mà là sự kết hợp giữa cảm xúc, câu chuyện và giá trị cá nhân hóa.</p>
            <div className="bg-core-highlight">
              "Khách hàng mục tiêu là người có thu nhập cao, ưa thích sự tinh tế, sẵn sàng chi trả cho sự chỉn chu."
            </div>
            <p>Hành vi trên Facebook: Họ lướt nhanh, bị thu hút bởi cảm xúc (Cinematic). Hình ảnh phải tinh gọn, đẳng cấp, không được "rẻ tiền" hay nhồi nhét chữ.</p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=2000&auto=format&fit=crop" alt="Luxury Travel" style={{ width: '100%', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} />
          </div>
        </div>
      </section>

      {/* Logo */}
      <section className="bg-section fade-in-up" style={{ backgroundColor: '#fafafa', borderRadius: 40, marginTop: '2rem' }}>
        <h2 className="bg-section-title">Logo & Clear Space</h2>
        <div className="bg-logo-showcase">
          <img src="/logo.png" alt="FIT TOUR Logo" className="bg-logo-img" />
          <div className="bg-clear-space">
            <img src="/logo.png" alt="Logo Clear Space" style={{ height: 60, opacity: 0.8 }} />
          </div>
          <p style={{ marginTop: '2rem', color: '#666', textAlign: 'center', maxWidth: 600 }}>Lấy ý tưởng từ vùng núi Himalaya, tượng trưng cho sự khám phá, mạo hiểm không ngừng tiến lên. <br/><strong>Khoảng cách an toàn (Clear Space):</strong> 120px tối thiểu ở các file thiết kế.</p>
        </div>
      </section>

      {/* Typography */}
      <section className="bg-section fade-in-up">
        <h2 className="bg-section-title">Typography</h2>
        <div className="bg-typo-grid">
          <div className="bg-typo-card">
            <div className="bg-typo-name">Headline Font</div>
            <div className="bg-typo-sample-heading">SVN Playfair Display</div>
            <p style={{ marginTop: '1.5rem', color: '#666' }}>Nhắm đến sự sang trọng, truyền cảm hứng. Thích hợp với ngành du lịch cao cấp. Sử dụng cho các tiêu đề chính, poster, và banner.</p>
            <div style={{ marginTop: '2rem', fontSize: '1.2rem', fontFamily: 'var(--bg-font-heading)', color: 'var(--bg-primary)', fontStyle: 'italic' }}>Aa Bb Cc Dd Ee Ff Gg</div>
          </div>
          <div className="bg-typo-card">
            <div className="bg-typo-name">Body Font</div>
            <div className="bg-typo-sample-body">Inter / Roboto</div>
            <p style={{ marginTop: '1.5rem', color: '#666' }}>Dễ đọc, hiện đại, hiển thị tốt trên digital lẫn in ấn. Sử dụng cho đoạn văn bản dài, chú thích, và nội dung chi tiết.</p>
            <div style={{ marginTop: '2rem', fontSize: '1.1rem', fontFamily: 'var(--bg-font-body)', color: 'var(--bg-dark)' }}>Aa Bb Cc Dd Ee Ff Gg</div>
          </div>
        </div>
      </section>

      {/* Color Palette */}
      <section className="bg-section fade-in-up">
        <h2 className="bg-section-title">Color Palette</h2>
        <p style={{ marginBottom: '3rem', fontSize: '1.1rem', color: '#666', maxWidth: 800 }}>Tông màu ấm (cam – vàng) đại diện cho hành trình, cảm xúc và sự dẫn dắt, kết hợp với nền trung tính giúp tổng thể luôn sạch, sang và dễ ứng dụng đa nền tảng.</p>
        
        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Primary Colors</h3>
        <div className="bg-color-grid">
          {colors.filter(c => c.type === 'Primary').map(color => (
            <div key={color.hex} className="bg-color-card" onClick={() => handleCopy(color.hex)}>
              <div className="bg-color-swatch" style={{ backgroundColor: color.hex }}></div>
              <div className="bg-color-info">
                <div className="bg-color-name">{color.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="bg-color-hex">{color.hex}</span>
                  {copiedColor === color.hex ? <CheckCircle size={16} color="#43A047" /> : <Copy size={16} color="#ccc" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 600 }}>Neutral Colors</h3>
        <div className="bg-color-grid">
          {colors.filter(c => c.type === 'Neutral').map(color => (
            <div key={color.hex} className="bg-color-card" onClick={() => handleCopy(color.hex)}>
              <div className="bg-color-swatch" style={{ backgroundColor: color.hex, borderBottom: color.border ? '1px solid #eee' : 'none' }}></div>
              <div className="bg-color-info">
                <div className="bg-color-name">{color.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="bg-color-hex">{color.hex}</span>
                  {copiedColor === color.hex ? <CheckCircle size={16} color="#43A047" /> : <Copy size={16} color="#ccc" />}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Media Layouts */}
      <section className="bg-section fade-in-up" style={{ backgroundColor: '#111', borderRadius: 40, color: 'white', marginBottom: '4rem' }}>
        <h2 className="bg-section-title" style={{ color: 'white' }}>Social Media & Imagery</h2>
        <div className="bg-layout-grid">
          
          <div className="bg-layout-card">
            <img src="https://images.unsplash.com/photo-1544365558-35aa4afcf11f?q=80&w=900&auto=format&fit=crop" alt="Facebook Post 1" className="bg-layout-img" />
            <div className="bg-layout-overlay">
              <span className="bg-layout-tag">Facebook Post (Vuông)</span>
              <div className="bg-layout-title">Kích thước 900x900px</div>
              <div className="bg-layout-desc">Ảnh chiếm 70-80%. Bố cục thoáng. Overlay cam nhẹ (opacity thấp).</div>
            </div>
          </div>

          <div className="bg-layout-card">
            <img src="https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?q=80&w=900&auto=format&fit=crop" alt="Facebook Post 2" className="bg-layout-img" style={{ height: '450px' }} />
            <div className="bg-layout-overlay">
              <span className="bg-layout-tag">Poster (Dọc)</span>
              <div className="bg-layout-title">Kích thước 1080x1350px</div>
              <div className="bg-layout-desc">Ưu tiên hình ảnh lớn, chất lượng cao Cinematic. Nội dung ngắn gọn, thông điệp rõ ràng.</div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};

export default BrandGuidelinePage;
