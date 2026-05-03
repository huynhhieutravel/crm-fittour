import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

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

const BrandColorPage = () => {
  return (
    <div className="bp-container">
      <section id="colors" className="bp-section dark" style={{ minHeight: '100vh' }}>
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
      <footer className="bp-footer">
        <div className="bp-footer-logo">FIT Tour</div>
        <p>Bespoke Brand Identity Guideline. Dành cho team Marketing, không chia sẻ với bất kì hình thức nào khác.</p>
      </footer>
    </div>
  );
};

export default BrandColorPage;
