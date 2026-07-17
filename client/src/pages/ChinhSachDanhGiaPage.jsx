import React from 'react';
import { Target, CircleDollarSign, CheckCircle2, Star, MessageSquare, ShieldCheck, Image as ImageIcon, Globe, Camera, UserCircle, Users, Calculator, CalendarCheck, Phone, Facebook, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChinhSachDanhGiaPage = () => {
  return (
    <div style={{ background: '#fff', minHeight: '100vh', paddingBottom: '50px' }}>
      <style>{`
        .sop-header-flex { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; gap: 30px; }
        .sop-header-logo { width: 220px; text-align: center; }
        .sop-header-table { border-collapse: collapse; width: 280px; font-size: 0.9rem; }
        .sop-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 35px; }
        .sop-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; margin-top: 20px; }
        .sop-case-flex { padding: 25px; display: flex; align-items: center; justify-content: space-between; background: #fffaf7; }
        .sop-flex-col { display: flex; gap: 40px; align-items: center; margin-top: 10px; }
        .sop-footer { background: #1e293b; color: white; border-radius: 16px; padding: 25px 40px; display: flex; justify-content: space-between; align-items: center; margin-top: 40px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
        .sop-footer-item { display: flex; align-items: center; gap: 12px; font-weight: 700; font-size: 1.1rem; }
        .sop-title-big { color: #e55e20; font-size: 4rem; margin: 0; line-height: 1; font-weight: 900; }
        .sop-title-medium { color: #e55e20; font-size: 2.1rem; margin: 0; text-transform: uppercase; font-weight: 900; line-height: 1.2; }
        
        @media (max-width: 900px) {
          .sop-header-flex { flex-direction: column; align-items: center; }
          .sop-header-logo { width: 100%; }
          .sop-header-table { width: 100%; margin-top: 20px; }
          .sop-grid-2 { grid-template-columns: 1fr; gap: 25px; }
          .sop-grid-3 { grid-template-columns: 1fr; gap: 30px; }
          .sop-case-flex { flex-direction: column; text-align: center; gap: 15px; }
          .sop-flex-col { flex-direction: column; gap: 20px; text-align: center; }
          .sop-footer { flex-direction: column; align-items: flex-start; padding: 25px; gap: 15px; }
          .sop-footer-item { font-size: 1rem; }
          .sop-title-big { font-size: 2.5rem !important; }
          .sop-title-medium { font-size: 1.5rem !important; }
        }
      `}</style>
      {/* Breadcrumb */}
      <nav style={{ padding: '20px 40px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#64748b', flexWrap: 'wrap' }}>
        <Link to="/tai-lieu" style={{ color: '#e55e20', textDecoration: 'none', fontWeight: 600 }}>Trang chủ Tài Liệu</Link>
        <ChevronRight size={14} />
        <span style={{ color: '#1e293b', fontWeight: 600 }}>SOP Chính Sách Đánh Giá</span>
      </nav>
      {/* Removed Image block as requested */}

      <div style={{ maxWidth: '1200px', margin: '0 auto', background: '#fff', padding: '40px', fontFamily: '"Inter", system-ui, sans-serif', color: '#1e293b', lineHeight: 1.6 }}>
        
        {/* Header */}
        <div className="sop-header-flex">
          <div className="sop-header-logo">
            <img src="/logo.png" alt="FIT Tour" style={{ maxWidth: '100%' }} />
            <div style={{ fontFamily: '"Great Vibes", cursive', fontSize: '1.8rem', color: '#64748b', marginTop: '10px' }}>Truly Experiences</div>
          </div>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <h1 className="sop-title-big">SOP</h1>
            <h2 style={{ color: '#334155', fontSize: '1.4rem', margin: '15px 0 5px 0', textTransform: 'uppercase', fontWeight: 800 }}>ĐIỀU CHỈNH VÀ HƯỚNG DẪN</h2>
            <h3 className="sop-title-medium">CHÍNH SÁCH ĐÁNH GIÁ<br/>(REVIEW)</h3>
            <div style={{ background: '#e55e20', color: 'white', padding: '8px 18px', borderRadius: '30px', display: 'inline-block', marginTop: '15px', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
              TRÊN GOOGLE REVIEW CHÍNH THỨC CỦA FIT TOUR
            </div>
          </div>

          <table className="sop-header-table">
            <tbody>
              {[
                ['MÃ SOP', 'SOP-MKT-006'],
                ['PHIÊN BẢN', '1.0'],
                ['NGÀY BAN HÀNH', '03/06/2026'],
                ['NGÀY ÁP DỤNG', '01/05/2026'],
                ['LĨNH VỰC', 'MKT / CSKH'],
                ['TRANG', '1/1']
              ].map(([key, val], idx) => (
                <tr key={idx}>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px 15px', fontWeight: 700, background: '#f8fafc', width: '130px', color: '#475569' }}>{key}</td>
                  <td style={{ border: '1px solid #e2e8f0', padding: '8px 15px', textAlign: 'right', fontWeight: 600, color: '#1e293b' }}>{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* I. MỤC ĐÍCH */}
        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '30px', position: 'relative', marginBottom: '35px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: '-18px', left: '30px', background: '#e55e20', color: 'white', padding: '8px 25px', borderRadius: '25px', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
            <Target size={22} strokeWidth={2.5} /> I. MỤC ĐÍCH
          </div>
          <div style={{ flex: 1, paddingTop: '10px' }}>
            <p style={{ marginTop: 0, fontSize: '1.05rem', fontWeight: 500 }}>Nhằm tiếp tục xây dựng uy tín thương hiệu FIT TOUR trên môi trường số, đồng thời ghi nhận những nỗ lực của đội ngũ Tour Leader và Hướng Dẫn Viên trong việc chăm sóc khách hàng.</p>
            <p style={{ marginBottom: 0, fontSize: '1.05rem', fontWeight: 500 }}>Công ty điều chỉnh cơ chế hạch toán chi phí thưởng đối với các đánh giá (Review) 5 sao trên Google.</p>
          </div>
        </div>

        <div className="sop-grid-2" style={{ marginBottom: '35px' }}>
          {/* II. NỘI DUNG ĐIỀU CHỈNH */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '30px 25px 25px 25px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-18px', left: '25px', background: '#e55e20', color: 'white', padding: '8px 20px', borderRadius: '25px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
              II. NỘI DUNG ĐIỀU CHỈNH
            </div>
            
            <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
              <div style={{ flex: '0 0 100px', textAlign: 'center' }}>
                <div style={{ background: '#334155', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#fbbf24' }}>
                  <CircleDollarSign size={45} strokeWidth={1.5} />
                </div>
                <div style={{ fontWeight: 900, fontSize: '0.9rem', background: '#334155', color: 'white', borderRadius: '8px', padding: '6px', marginTop: '-15px', position: 'relative', zIndex: 2, lineHeight: 1.2 }}>MKT<br/>/CSKH</div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 10px 0', color: '#e55e20', fontSize: '1.1rem', fontWeight: 800 }}>1. NGUỒN CHI PHÍ THƯỞNG</h4>
                <p style={{ fontSize: '0.95rem', marginBottom: '15px' }}>Kể từ các đoàn khởi hành từ ngày 01/05/2026, chi phí thưởng cho Tour Leader và Hướng Dẫn Viên liên quan đến việc thu thập Google Review sẽ:</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={20} color="#e55e20" fill="#fef3c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Được hạch toán vào ngân sách Marketing / Chăm sóc Khách Hàng (MKT/CSKH).</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <CheckCircle2 size={20} color="#e55e20" fill="#fef3c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>Không trừ trực tiếp vào chi phí của từng đoàn tour.</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background: '#e55e20', color: 'white', padding: '10px', borderRadius: '25px', textAlign: 'center', fontWeight: 800, fontSize: '0.95rem', marginTop: '25px', boxShadow: '0 4px 6px rgba(229, 94, 32, 0.2)' }}>
              Áp dụng: Các đoàn khởi hành từ 01/05/2026
            </div>
          </div>

          {/* III. TIÊU CHUẨN REVIEW */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '30px 25px 25px 25px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-18px', left: '25px', background: '#e55e20', color: 'white', padding: '8px 20px', borderRadius: '25px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
              III. TIÊU CHUẨN REVIEW ĐƯỢC GHI NHẬN
            </div>
            <p style={{ fontWeight: 700, marginTop: '10px', marginBottom: '20px', fontSize: '1.05rem' }}>Review được tính thưởng phải đáp ứng đầy đủ các điều kiện sau:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { icon: <Star size={20} fill="white" />, text: 'Đánh giá 5 sao trên Google Review chính thức của FIT TOUR.' },
                { icon: <MessageSquare size={20} fill="white" />, text: 'Nội dung review rõ ràng, có cảm nhận thực tế về chuyến đi.' },
                { icon: <ShieldCheck size={20} />, text: 'Nội dung không mang tính spam hoặc sao chép.' },
                { icon: <ImageIcon size={20} />, text: 'Hình ảnh đăng tải là hình ảnh thực tế từ hành trình.' },
                { icon: <Globe size={20} />, text: 'Review được đăng công khai và hiển thị trên Google.' }
              ].map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e55e20', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, boxShadow: '0 2px 5px rgba(229, 94, 32, 0.4)' }}>
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* IV. CHÍNH SÁCH THƯỞNG */}
        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '30px 25px 20px 25px', position: 'relative', marginBottom: '35px' }}>
          <div style={{ position: 'absolute', top: '-18px', left: '30px', background: '#e55e20', color: 'white', padding: '8px 25px', borderRadius: '25px', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
            IV. CHÍNH SÁCH THƯỞNG
          </div>
          
          <div className="sop-grid-2" style={{ marginTop: '10px' }}>
            {/* TH1 */}
            <div style={{ border: '2px solid #e55e20', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: '#e55e20', color: 'white', textAlign: 'center', padding: '12px', fontWeight: 900, fontSize: '1.2rem' }}>TRƯỜNG HỢP 1</div>
              <div className="sop-case-flex">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, display: 'flex', alignItems: 'center', color: '#1e293b' }}>
                    5 <Star size={40} fill="#f59e0b" color="#f59e0b" style={{ marginLeft: '5px' }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginTop: '10px' }}>REVIEW<br/>5 SAO</div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#94a3b8' }}>+</div>
                <div style={{ textAlign: 'center' }}>
                  <Camera size={50} color="#e55e20" strokeWidth={1.5} />
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginTop: '10px' }}>TỐI THIỂU<br/>05 HÌNH ẢNH</div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#94a3b8' }}>=</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e55e20', lineHeight: 1 }}>100.000</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e55e20', marginTop: '5px' }}>VNĐ / REVIEW</div>
                </div>
              </div>
            </div>

            {/* TH2 */}
            <div style={{ border: '2px solid #e55e20', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ background: '#e55e20', color: 'white', textAlign: 'center', padding: '12px', fontWeight: 900, fontSize: '1.2rem' }}>TRƯỜNG HỢP 2</div>
              <div className="sop-case-flex">
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, display: 'flex', alignItems: 'center', color: '#1e293b' }}>
                    5 <Star size={40} fill="#f59e0b" color="#f59e0b" style={{ marginLeft: '5px' }} />
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginTop: '10px' }}>REVIEW<br/>5 SAO</div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#94a3b8' }}>+</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', width: '70px', margin: '0 auto' }}>
                    {[1,2,3,4,5,6].map(i => <Camera key={i} size={20} color="#e55e20" />)}
                  </div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginTop: '10px' }}>TỐI THIỂU<br/>10 HÌNH ẢNH</div>
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#94a3b8' }}>=</div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#e55e20', lineHeight: 1 }}>150.000</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e55e20', marginTop: '5px' }}>VNĐ / REVIEW</div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '1.05rem', fontWeight: 600, color: '#64748b' }}>
            (Áp dụng cho các review đạt chuẩn: nội dung rõ ràng, đầy đủ và kèm tối thiểu 10 hình ảnh)
          </div>
        </div>

        <div className="sop-grid-2" style={{ marginBottom: '35px' }}>
          {/* V. NGUYÊN TẮC ÁP DỤNG */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '35px 25px 25px 25px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-18px', left: '25px', background: '#e55e20', color: 'white', padding: '8px 20px', borderRadius: '25px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
              V. NGUYÊN TẮC ÁP DỤNG
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                'Quy cách xét duyệt review đạt chuẩn giữ nguyên theo chính sách hiện hành.',
                'Mức thưởng hiện hành giữ nguyên, không thay đổi.',
                'Chỉ ghi nhận các review đáp ứng đầy đủ tiêu chuẩn quy định.',
                'Mỗi review chỉ được tính thưởng một lần.',
                'Bộ phận Marketing/CSKH có trách nhiệm kiểm tra và xác nhận review trước khi thanh toán thưởng.',
                'Trường hợp review bị Google ẩn, xóa hoặc không hiển thị công khai sẽ không được ghi nhận.'
              ].map((text, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <CheckCircle2 size={20} color="#e55e20" fill="#fef3c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* VI. TRÁCH NHIỆM THỰC HIỆN */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '35px 25px 25px 25px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-18px', left: '25px', background: '#e55e20', color: 'white', padding: '8px 20px', borderRadius: '25px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
              VI. TRÁCH NHIỆM THỰC HIỆN
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e55e20', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
                <UserCircle size={22} /> TOUR LEADER / HƯỚNG DẪN VIÊN
              </div>
              <ul style={{ margin: 0, paddingLeft: '32px', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>
                <li>Chủ động hướng dẫn khách hàng thực hiện đánh giá sau hành trình.</li>
                <li>Hỗ trợ khách hàng đăng tải hình ảnh và nội dung review đúng quy chuẩn.</li>
                <li>Tổng hợp danh sách review gửi về bộ phận phụ trách theo quy định.</li>
              </ul>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e55e20', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
                <Users size={22} /> BỘ PHẬN MARKETING / CSKH
              </div>
              <ul style={{ margin: 0, paddingLeft: '32px', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>
                <li>Kiểm tra tính hợp lệ của các review.</li>
                <li>Tổng hợp số lượng review đạt chuẩn.</li>
                <li>Thực hiện đề xuất thanh toán thưởng định kỳ.</li>
              </ul>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e55e20', fontWeight: 800, fontSize: '1.1rem', marginBottom: '8px' }}>
                <Calculator size={22} /> BỘ PHẬN KẾ TOÁN
              </div>
              <ul style={{ margin: 0, paddingLeft: '32px', fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.6 }}>
                <li>Hạch toán chi phí thưởng vào ngân sách MKT/CSKH.</li>
                <li>Thực hiện chi trả theo danh sách được phê duyệt.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* VII. HIỆU LỰC */}
        <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '30px 30px 20px 30px', position: 'relative', marginBottom: '35px', background: '#fafaf9' }}>
          <div style={{ position: 'absolute', top: '-18px', left: '30px', background: '#e55e20', color: 'white', padding: '8px 25px', borderRadius: '25px', fontWeight: 800, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
            <CalendarCheck size={22} /> VII. HIỆU LỰC
          </div>
          <div className="sop-flex-col">
            <div style={{ flex: 1 }}>
              <p style={{ marginTop: 0, fontSize: '1.1rem', fontWeight: 600 }}>Chính sách này có hiệu lực đối với toàn bộ các đoàn khởi hành từ ngày <strong style={{ color: '#e55e20' }}>01/05/2026</strong>.</p>
              <p style={{ marginBottom: 0, fontSize: '0.95rem', color: '#475569', fontWeight: 500 }}>Các quy định về tiêu chuẩn review, cách thức xét duyệt và mức thưởng hiện hành không thay đổi, ngoại trừ việc điều chỉnh nguồn chi phí thưởng từ chi phí tour sang ngân sách Marketing & Chăm sóc Khách Hàng (MKT/CSKH).</p>
            </div>
            <div style={{ flex: '0 0 200px', textAlign: 'center', background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '2px', color: '#f59e0b' }}>
                <Star size={30} fill="#f59e0b" /><Star size={30} fill="#f59e0b" /><Star size={30} fill="#f59e0b" /><Star size={30} fill="#f59e0b" /><Star size={30} fill="#f59e0b" />
              </div>
              <div style={{ marginTop: '10px', fontWeight: 900, fontSize: '1.4rem', color: '#1e293b' }}>FIT TOUR</div>
            </div>
          </div>
        </div>

        <div className="sop-grid-2">
          {/* VIII. LỊCH SỬ CẬP NHẬT */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '35px 0 0 0', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-18px', left: '25px', background: '#e55e20', color: 'white', padding: '8px 20px', borderRadius: '25px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 2, boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
              VIII. LỊCH SỬ CẬP NHẬT
            </div>
            <div style={{ overflowX: 'auto', borderRadius: '0 0 15px 15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', minWidth: '400px' }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '1.5px solid #e2e8f0', borderRight: '1.5px solid #e2e8f0', padding: '15px 10px', background: '#f8fafc', color: '#475569' }}>PHIÊN BẢN</th>
                  <th style={{ borderBottom: '1.5px solid #e2e8f0', borderRight: '1.5px solid #e2e8f0', padding: '15px 10px', background: '#f8fafc', color: '#475569' }}>NGÀY BAN HÀNH</th>
                  <th style={{ borderBottom: '1.5px solid #e2e8f0', borderRight: '1.5px solid #e2e8f0', padding: '15px 10px', background: '#f8fafc', color: '#475569' }}>NỘI DUNG CẬP NHẬT</th>
                  <th style={{ borderBottom: '1.5px solid #e2e8f0', padding: '15px 10px', background: '#f8fafc', color: '#475569' }}>NGƯỜI CẬP NHẬT</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '20px 10px', textAlign: 'center', fontWeight: 800, borderRight: '1.5px solid #e2e8f0' }}>1.0</td>
                  <td style={{ padding: '20px 10px', textAlign: 'center', fontWeight: 600, borderRight: '1.5px solid #e2e8f0' }}>03/06/2026</td>
                  <td style={{ padding: '20px 15px', fontWeight: 500, borderRight: '1.5px solid #e2e8f0' }}>Ban hành mới - Điều chỉnh nguồn chi phí thưởng review từ chi phí tour sang ngân sách MKT/CSKH.</td>
                  <td style={{ padding: '20px 10px', textAlign: 'center', fontWeight: 700 }}>P. MKT/CSKH</td>
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* IX. PHÊ DUYỆT */}
          <div style={{ border: '1.5px solid #e2e8f0', borderRadius: '16px', padding: '35px 25px 25px 25px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-18px', left: '25px', background: '#e55e20', color: 'white', padding: '8px 20px', borderRadius: '25px', fontWeight: 800, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 10px rgba(229, 94, 32, 0.3)' }}>
              IX. PHÊ DUYỆT
            </div>
            <div className="sop-grid-3">
              <div>
                <div style={{ color: '#e55e20', fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>NGƯỜI ĐỀ XUẤT</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '5px', whiteSpace: 'nowrap' }}>( P. MKT/CSKH )</div>
                <div style={{ marginTop: '70px', borderTop: '1.5px dashed #cbd5e1', paddingTop: '10px', color: '#64748b', fontSize: '0.8rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Ngày: ___/___/_____</div>
              </div>
              <div>
                <div style={{ color: '#e55e20', fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>NGƯỜI KIỂM TRA</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '5px', whiteSpace: 'nowrap' }}>( P. ĐIỀU HÀNH )</div>
                <div style={{ marginTop: '70px', borderTop: '1.5px dashed #cbd5e1', paddingTop: '10px', color: '#64748b', fontSize: '0.8rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Ngày: ___/___/_____</div>
              </div>
              <div>
                <div style={{ color: '#e55e20', fontWeight: 800, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>NGƯỜI PHÊ DUYỆT</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '5px', whiteSpace: 'nowrap' }}>( BAN GIÁM ĐỐC )</div>
                <div style={{ marginTop: '70px', borderTop: '1.5px dashed #cbd5e1', paddingTop: '10px', color: '#64748b', fontSize: '0.8rem', textAlign: 'left', whiteSpace: 'nowrap' }}>Ngày: ___/___/_____</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sop-footer">
          <div className="sop-footer-item">
            <Phone size={24} color="#e55e20" /> 1900 58 58 81
          </div>
          <div className="sop-footer-item">
            <Globe size={24} color="#e55e20" /> www.fittour.vn
          </div>
          <div className="sop-footer-item">
            <Facebook size={24} color="#e55e20" /> facebook.com/fittour.vn
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChinhSachDanhGiaPage;
