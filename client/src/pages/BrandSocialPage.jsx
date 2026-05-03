import React, { useEffect, useRef } from 'react';

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

const BrandSocialPage = () => {
  return (
    <div className="bp-container">
      <section id="social" className="bp-section dark" style={{ minHeight: '100vh' }}>
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
      <footer className="bp-footer">
        <div className="bp-footer-logo">FIT Tour</div>
        <p>Bespoke Brand Identity Guideline. Dành cho team Marketing, không chia sẻ với bất kì hình thức nào khác.</p>
      </footer>
    </div>
  );
};

export default BrandSocialPage;
