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

const BrandTypographyPage = () => {
  return (
    <div className="bp-container">
      <section id="typography" className="bp-section" style={{ minHeight: '100vh' }}>
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
      <footer className="bp-footer">
        <div className="bp-footer-logo">FIT Tour</div>
        <p>Bespoke Brand Identity Guideline. Dành cho team Marketing, không chia sẻ với bất kì hình thức nào khác.</p>
      </footer>
    </div>
  );
};

export default BrandTypographyPage;
