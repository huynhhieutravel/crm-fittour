import React from 'react';
import { Users, TrendingUp, Calendar, FileText, Target, PieChart, Trophy, Plus, UserCircle, Award, CheckSquare, Briefcase, FileCheck, DollarSign, CheckCircle, ArrowDown } from 'lucide-react';

const CoCheKpiPage = () => {
  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh', padding: '40px 0', fontFamily: '"Inter", sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        
        * { box-sizing: border-box; }
        .kpi-wrapper { max-width: 800px; margin: 0 auto; background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; position: relative; }
        
        /* HEADER */
        .kpi-header { 
          background: #0d47a1; 
          background: linear-gradient(180deg, #0d47a1 0%, #1565c0 100%);
          padding: 40px 20px 90px 20px; 
          text-align: center; 
          position: relative;
        }
        /* Yellow swoosh line */
        .kpi-header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 30px;
          background: white;
          border-top: 4px solid #facc15;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        
        .kpi-logo img { height: 100px; filter: brightness(0) invert(1); }
        .kpi-title { color: white; font-size: 2.8rem; font-weight: 900; margin: 15px 0 0 0; letter-spacing: -0.5px; }
        .kpi-subtitle { 
          background: #facc15; color: #0d47a1; display: inline-flex; align-items: center; justify-content: center; padding: 8px 30px; 
          border-radius: 30px; font-weight: 900; font-size: 1.1rem;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .kpi-doc-btn {
          background: white; color: #0d47a1; display: inline-flex; align-items: center; justify-content: center; padding: 8px 25px; 
          border-radius: 30px; font-weight: 800; font-size: 0.95rem; text-decoration: none; gap: 8px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.2); transition: all 0.2s;
        }
        .kpi-doc-btn:hover { background: #f8fafc; transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.3); }
        .kpi-header-actions {
          display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 20px; position: relative; z-index: 2; flex-wrap: wrap;
        }

        .kpi-content { padding: 0 25px 40px 25px; }

        /* CARDS OVERLAP */
        .kpi-row-1 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: -50px; position: relative; z-index: 10; }
        .kpi-card-top { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .kpi-card-icon { width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: white; }
        .kpi-card-title { font-size: 0.75rem; font-weight: 900; color: #1e3a8a; margin-bottom: 2px; }
        .kpi-card-desc { font-size: 0.7rem; color: #475569; line-height: 1.3; font-weight: 500; }

        /* SECTION: QUY ĐỊNH CHUNG */
        .kpi-section-qd { margin-top: 40px; position: relative; border: 1px solid #cbd5e1; border-radius: 12px; padding: 30px 15px 20px 15px; display: flex; gap: 10px; justify-content: space-between; }
        .kpi-section-badge { position: absolute; top: -15px; left: 50%; transform: translateX(-50%); background: #1565c0; color: white; padding: 6px 30px; border-radius: 20px; font-weight: 800; font-size: 0.85rem; }
        .kpi-qd-item { display: flex; align-items: center; gap: 10px; flex: 1; }
        .kpi-qd-icon { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #1565c0; color: #1565c0; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.75rem; flex-shrink: 0; background: #f0f4f8; }
        .kpi-qd-text { font-size: 0.75rem; color: #334155; font-weight: 600; line-height: 1.4; }

        /* SECTION: NGUYÊN TẮC GHI NHẬN */
        .kpi-section-nt { margin-top: 30px; position: relative; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px 15px 20px 80px; display: flex; gap: 15px; }
        .kpi-nt-icon-main { position: absolute; left: -15px; top: 15px; width: 60px; height: 60px; background: #0d47a1; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 4px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.1); z-index: 2; }
        .kpi-nt-badge { position: absolute; left: 30px; top: -12px; background: #1565c0; color: white; padding: 4px 25px 4px 40px; border-radius: 15px; font-weight: 800; font-size: 0.85rem; z-index: 1; }
        .kpi-nt-item { display: flex; align-items: center; gap: 8px; flex: 1; }
        .kpi-nt-text { font-size: 0.75rem; font-weight: 700; color: #334155; }

        /* ROW 4: SALE & OP */
        .kpi-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px; }
        
        .kpi-box { border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
        .kpi-box-header { padding: 10px 15px; color: white; font-weight: 800; font-size: 0.9rem; display: flex; align-items: center; gap: 10px; }
        
        /* SALE BOX */
        .kpi-box-sale { border: 2px solid #3b82f6; }
        .kpi-box-sale .kpi-box-header { background: #3b82f6; }
        .kpi-box-sale-body { background: #eff6ff; padding: 15px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
        
        .kpi-sale-top-cols { display: flex; gap: 10px; }
        .kpi-sale-col { background: white; border-radius: 8px; border: 1px solid #bfdbfe; text-align: center; padding: 10px; flex: 1; position: relative; }
        .kpi-sale-col-title { font-size: 0.75rem; font-weight: 800; color: #1e3a8a; margin-bottom: 5px; }
        .kpi-sale-percent { font-size: 2.2rem; font-weight: 900; color: #1e3a8a; line-height: 1; margin: 10px 0 5px 0; }
        .kpi-sale-sub { font-size: 0.7rem; color: #475569; font-weight: 600; }
        
        .kpi-sale-bottom-row { background: white; border-radius: 8px; border: 1px solid #bfdbfe; display: flex; align-items: center; padding: 10px; }
        .kpi-sale-b-col { flex: 1; text-align: center; }
        .kpi-sale-b-title { font-size: 0.65rem; color: #475569; font-weight: 600; }
        .kpi-sale-b-val { font-size: 1.1rem; font-weight: 900; color: #1e3a8a; }
        .kpi-sale-plus { background: #1e3a8a; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem; flex-shrink: 0; }
        
        .kpi-sale-footer { background: #1e3a8a; color: white; text-align: center; padding: 8px; font-weight: 800; font-size: 0.85rem; }

        /* OP BOX */
        .kpi-box-op { border: 2px solid #10b981; }
        .kpi-box-op .kpi-box-header { background: #10b981; }
        .kpi-box-op-body { background: #ecfdf5; padding: 15px; flex: 1; display: flex; flex-direction: column; }
        .kpi-op-title { text-align: center; font-weight: 800; color: #065f46; font-size: 0.8rem; margin-bottom: 15px; }
        
        .kpi-op-split { display: flex; gap: 10px; flex: 1; }
        .kpi-op-left { flex: 2; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .kpi-op-col { text-align: center; }
        .kpi-op-percent { font-size: 2rem; font-weight: 900; color: #065f46; line-height: 1; }
        .kpi-op-sub { font-size: 0.75rem; color: #065f46; font-weight: 700; margin-top: 5px; }
        .kpi-op-desc { font-size: 0.7rem; color: #475569; font-weight: 600; margin-top: 2px; }
        .kpi-op-plus { background: #065f46; color: white; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 0.8rem; }
        
        .kpi-op-right { flex: 1; background: #ecfdf5; border-radius: 8px; border: 1px dashed #34d399; padding: 15px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 0.85rem; font-weight: 700; color: #065f46; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); margin-left: 5px; }

        /* ROW 5: THAY THẾ SALE & LEAD TEAM */
        /* ORANGE BOX */
        .kpi-box-orange { border: 2px solid #f59e0b; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; background: white; }
        .kpi-box-orange-header { background: #f59e0b; color: white; padding: 10px 15px; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; }
        .kpi-box-orange-body { padding: 25px 15px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; }
        .kpi-orange-text1 { font-size: 0.85rem; font-weight: 700; color: #92400e; }
        .kpi-orange-percent { font-size: 3.2rem; font-weight: 900; color: #d97706; line-height: 1; margin: 10px 0; }
        
        /* PURPLE BOX */
        .kpi-box-purple { border: 2px solid #8b5cf6; border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; position: relative; background: white; }
        .kpi-box-purple-header { background: #8b5cf6; color: white; padding: 10px 15px; font-weight: 800; font-size: 0.95rem; display: flex; align-items: center; gap: 10px; }
        .kpi-box-purple-body { padding: 25px 15px; text-align: center; flex: 1; display: flex; flex-direction: column; justify-content: center; position: relative; z-index: 2; }
        .kpi-purple-percent { font-size: 3.5rem; font-weight: 900; color: #7c3aed; line-height: 1; margin: 10px 0; }
        .kpi-purple-text { font-size: 0.8rem; font-weight: 600; color: #5b21b6; padding: 0 10px; line-height: 1.4; }
        .kpi-purple-bg-icon { position: absolute; right: 15px; bottom: 15px; opacity: 0.1; color: #8b5cf6; z-index: 1; }

        /* ROW 6: FOOTER */
        .kpi-footer-row { display: grid; grid-template-columns: 1fr 1.5fr; gap: 15px; margin-top: 15px; }
        .kpi-footer-col { display: flex; flex-direction: column; gap: 15px; }
        
        .kpi-box-check { border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px; display: flex; gap: 10px; align-items: center; }
        .kpi-box-check-left { display: flex; flex-direction: column; align-items: center; color: #2563eb; width: 60px; border-right: 1px solid #e2e8f0; padding-right: 10px; }
        .kpi-box-check-right { flex: 1; font-size: 0.7rem; font-weight: 600; color: #334155; display: flex; flex-direction: column; gap: 8px; }
        .kpi-check-item { display: flex; gap: 8px; align-items: flex-start; }
        
        .kpi-box-date { background: #0d47a1; border-radius: 12px; padding: 15px; display: flex; align-items: center; gap: 15px; color: white; }
        
        .kpi-box-org { border: 2px solid #0d47a1; border-radius: 12px; overflow: hidden; }
        .kpi-box-org-header { background: #0d47a1; color: white; padding: 8px 15px; font-weight: 800; font-size: 0.85rem; display: flex; align-items: center; gap: 10px; border-radius: 0 0 20px 0; display: inline-flex; }
        .kpi-org-roles { display: flex; justify-content: space-between; padding: 10px 15px 5px 15px; }
        .kpi-org-role { font-size: 0.7rem; font-weight: 700; color: #334155; display: flex; align-items: center; gap: 4px; }
        .kpi-org-tasks { display: flex; justify-content: space-between; padding: 5px 15px 10px 15px; }
        .kpi-org-task { font-size: 0.7rem; font-weight: 700; color: #1e3a8a; display: flex; align-items: center; gap: 4px; }
        
        .kpi-sign-area { border: 1px solid #cbd5e1; border-radius: 8px; margin: 0 15px 15px 15px; padding: 10px; text-align: center; position: relative; }
        
        .kpi-bottom-strip { background: #0d47a1; color: white; padding: 10px 25px; display: flex; justify-content: space-between; align-items: center; font-size: 0.7rem; font-weight: 700; }
        .kpi-bottom-slogan { display: flex; gap: 15px; }

        /* MOBILE RESPONSIVE */
        @media (max-width: 768px) {
          .kpi-wrapper { margin: 0 10px; border-radius: 8px; }
          .kpi-header { padding: 30px 15px 70px 15px; }
          .kpi-logo img { height: 80px; }
          .kpi-title { font-size: 1.8rem; }
          .kpi-subtitle { font-size: 0.9rem; padding: 6px 20px; margin-top: 10px; }
          .kpi-content { padding: 0 15px 30px 15px; }
          
          .kpi-row-1 { grid-template-columns: 1fr; margin-top: -30px; gap: 10px; }
          
          .kpi-section-qd { flex-direction: column; gap: 15px; padding: 35px 15px 20px 15px; margin-top: 30px; }
          .kpi-section-badge { font-size: 0.75rem; padding: 6px 20px; white-space: nowrap; width: 90%; text-align: center; }
          .kpi-qd-item { align-items: flex-start; }
          
          .kpi-section-nt { flex-direction: column; padding: 75px 15px 20px 15px; margin-top: 40px; gap: 15px; }
          .kpi-nt-icon-main { left: 50%; transform: translateX(-50%); top: -30px; }
          .kpi-nt-badge { left: 50%; transform: translateX(-50%); top: 38px; padding: 4px 20px; width: max-content; }
          .kpi-nt-item { justify-content: flex-start; }
          
          .kpi-grid-2 { grid-template-columns: 1fr; margin-top: 20px; }
          .kpi-sale-top-cols { flex-direction: column; }
          .kpi-sale-bottom-row { flex-direction: column; gap: 10px; }
          .kpi-sale-plus { margin: 5px 0; }
          
          .kpi-op-split { flex-direction: column; gap: 15px; }
          .kpi-op-right { margin-left: 0; }
          
          .kpi-footer-row { grid-template-columns: 1fr; gap: 15px; }
          .kpi-org-roles { flex-wrap: wrap; gap: 10px; justify-content: center; }
          .kpi-org-tasks { flex-wrap: wrap; gap: 10px; justify-content: center; }
          
          .kpi-bottom-strip { flex-direction: column; gap: 12px; padding: 15px; text-align: center; }
          .kpi-bottom-slogan { flex-wrap: wrap; justify-content: center; gap: 10px; }
        }
      `}</style>

      <div className="kpi-wrapper">
        {/* HEADER */}
        <div className="kpi-header">
          <div className="kpi-logo">
            <img src="/logo.png" alt="FIT TOUR" />
          </div>
          <h1 className="kpi-title">CƠ CHẾ KPI FIT TOUR 2026</h1>
          <div className="kpi-header-actions">
            <div className="kpi-subtitle">ÁP DỤNG TỪ 01/01/2026</div>
            <a href="/quyet-dinh-co-che-kpi.docx" download className="kpi-doc-btn">
              <FileText size={18} /> Nhấn vào xem văn bản
            </a>
          </div>
        </div>

        <div className="kpi-content">
          {/* ROW 1 */}
          <div className="kpi-row-1">
            <div className="kpi-card-top">
              <div className="kpi-card-icon" style={{ background: '#3b82f6' }}><Users size={20} /></div>
              <div>
                <div className="kpi-card-title">PHẠM VI ÁP DỤNG</div>
                <div className="kpi-card-desc">Áp dụng cho toàn bộ nhân sự Công ty TNHH Du lịch Quốc tế FIT TOUR</div>
              </div>
            </div>
            <div className="kpi-card-top">
              <div className="kpi-card-icon" style={{ background: '#22c55e' }}><TrendingUp size={20} /></div>
              <div>
                <div className="kpi-card-title" style={{ color: '#166534' }}>KPI NĂM</div>
                <div className="kpi-card-desc">Lương cơ bản tháng x 04 x Số tháng chính thức</div>
              </div>
            </div>
            <div className="kpi-card-top">
              <div className="kpi-card-icon" style={{ background: '#f97316' }}><Calendar size={20} /></div>
              <div>
                <div className="kpi-card-title" style={{ color: '#9a3412' }}>HIỆU LỰC</div>
                <div className="kpi-card-desc">Từ ngày 01/01/2026 đến khi có quyết định thay thế</div>
              </div>
            </div>
          </div>

          {/* ROW 2 */}
          <div className="kpi-section-qd">
            <div className="kpi-section-badge">QUY ĐỊNH CHUNG VÀ THUẬT NGỮ</div>
            <div className="kpi-qd-item">
              <div className="kpi-qd-icon">LN<br/>KPI</div>
              <div className="kpi-qd-text">Lợi nhuận sau khi trừ toàn bộ chi phí</div>
            </div>
            <div className="kpi-qd-item">
              <div className="kpi-qd-icon">KPI</div>
              <div className="kpi-qd-text">KPI năm = Lương cơ bản tháng x 04 x Số tháng chính thức</div>
            </div>
            <div className="kpi-qd-item">
              <div className="kpi-qd-icon" style={{ border: 'none', background: '#e0e7ff', color: '#1e3a8a' }}><FileText size={20} /></div>
              <div className="kpi-qd-text">Số liệu theo báo cáo được BGĐ duyệt</div>
            </div>
          </div>

          {/* ROW 3 */}
          <div className="kpi-section-nt">
            <div className="kpi-nt-icon-main"><Target size={32} /></div>
            <div className="kpi-nt-badge">NGUYÊN TẮC GHI NHẬN</div>
            <div className="kpi-nt-item">
              <Users size={28} color="#10b981" />
              <span className="kpi-nt-text">KPI tính theo LN sau chi phí của các đoàn phụ trách</span>
            </div>
            <div className="kpi-nt-item">
              <Calendar size={28} color="#f59e0b" />
              <span className="kpi-nt-text">Ghi nhận theo tháng</span>
            </div>
            <div className="kpi-nt-item">
              <PieChart size={28} color="#3b82f6" />
              <span className="kpi-nt-text">Tổng hợp theo năm</span>
            </div>
          </div>

          {/* ROW 4 */}
          <div className="kpi-grid-2">
            {/* SALE */}
            <div className="kpi-box kpi-box-sale">
              <div className="kpi-box-header">
                <Trophy size={18} /> CƠ CHẾ THƯỞNG SALE
              </div>
              <div className="kpi-box-sale-body">
                <div className="kpi-sale-top-cols">
                  <div className="kpi-sale-col">
                    <div className="kpi-sale-col-title">THƯỞNG HÀNG THÁNG</div>
                    <div className="kpi-sale-percent">13%</div>
                    <div className="kpi-sale-sub">lợi nhuận</div>
                    <div className="kpi-sale-desc" style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '5px' }}>(Sale trực tiếp)</div>
                  </div>
                  <div className="kpi-sale-col">
                    <div className="kpi-sale-col-title">THƯỞNG NĂM</div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1e3a8a' }}>Đạt 100% KPI/năm</div>
                    <ArrowDown size={14} color="#1e3a8a" style={{ margin: '2px auto' }} />
                    <div className="kpi-sale-percent">20%</div>
                    <div className="kpi-sale-sub">lợi nhuận</div>
                  </div>
                </div>
                <div className="kpi-sale-bottom-row">
                  <div className="kpi-sale-b-col">
                    <div className="kpi-sale-b-title">Đã nhận:</div>
                    <div className="kpi-sale-b-val">13%</div>
                    <div className="kpi-sale-b-title">theo tháng</div>
                  </div>
                  <div className="kpi-sale-plus">+</div>
                  <div className="kpi-sale-b-col">
                    <div className="kpi-sale-b-title">Thưởng bổ sung:</div>
                    <div className="kpi-sale-b-val">7%</div>
                    <div className="kpi-sale-b-title">(cuối năm)</div>
                  </div>
                </div>
              </div>
              <div className="kpi-sale-footer">Tổng thưởng = 20% lợi nhuận</div>
            </div>

            {/* OP */}
            <div className="kpi-box kpi-box-op">
              <div className="kpi-box-header">
                <Users size={18} /> CƠ CHẾ KHỐI ĐIỀU HÀNH & HẬU CẦN
              </div>
              <div className="kpi-box-op-body">
                <div className="kpi-op-title">THƯỞNG THEO LỢI NHUẬN<br/>HÀNG THÁNG</div>
                <div className="kpi-op-split">
                  <div className="kpi-op-left">
                    <div className="kpi-op-col">
                      <div className="kpi-op-percent">4%</div>
                      <div className="kpi-op-sub">lợi nhuận</div>
                      <div className="kpi-op-desc">Điều hành<br/>trực tiếp</div>
                    </div>
                    <div className="kpi-op-plus">+</div>
                    <div className="kpi-op-col">
                      <div className="kpi-op-percent">4%</div>
                      <div className="kpi-op-sub">lợi nhuận</div>
                      <div className="kpi-op-desc">Khối<br/>hậu cần</div>
                    </div>
                  </div>
                  <div className="kpi-op-right">
                    Thay cho cơ chế chi trả theo quý trước đây
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 5 */}
          <div className="kpi-grid-2" style={{ marginTop: '20px' }}>
            <div className="kpi-box-orange">
              <div className="kpi-box-orange-header"><UserCircle size={18} /> TRƯỜNG HỢP THAY THẾ SALE</div>
              <div className="kpi-box-orange-body">
                <div className="kpi-orange-text1">Nhân sự Điều hành trực tiếp xử lý đoàn thay Sale</div>
                <ArrowDown size={20} color="#d97706" style={{ margin: '8px 0' }} />
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#92400e', textTransform: 'uppercase' }}>Nhận thưởng</div>
                <div className="kpi-orange-percent">10%</div>
                <div className="kpi-orange-text1" style={{ textTransform: 'uppercase' }}>Lợi nhuận đoàn</div>
              </div>
            </div>
            
            <div className="kpi-box-purple">
              <div className="kpi-box-purple-header"><Award size={18} /> THƯỞNG LEAD TEAM / BU</div>
              <div className="kpi-box-purple-body">
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#5b21b6', textTransform: 'uppercase' }}>Nhận</div>
                <div className="kpi-purple-percent">10%</div>
                <div className="kpi-purple-text">trên phần lợi nhuận vượt hàng tháng của nhân sự vượt KPI/tháng</div>
                <TrendingUp className="kpi-purple-bg-icon" size={100} />
              </div>
            </div>
          </div>

          {/* ROW 6 */}
          <div className="kpi-footer-row">
            <div className="kpi-footer-col">
              <div className="kpi-box-check">
                <div className="kpi-box-check-left">
                  <CheckSquare size={28} />
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, textAlign: 'center', marginTop: '2px' }}>CẬP NHẬT<br/>DỰ TOÁN</div>
                </div>
                <div className="kpi-box-check-right">
                  <div className="kpi-check-item">
                    <CheckCircle size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                    Thực hiện theo quy trình nội bộ hiện hành
                  </div>
                  <div className="kpi-check-item">
                    <CheckCircle size={14} color="#2563eb" style={{ flexShrink: 0 }} />
                    Chi phí phát sinh cần phê duyệt theo cấp
                  </div>
                </div>
              </div>
              <div className="kpi-box-date">
                <Calendar size={32} />
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 900 }}>HIỆU LỰC</div>
                  <div style={{ fontSize: '0.65rem', marginTop: '2px' }}>CÓ HIỆU LỰC TỪ</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>01/01/2026</div>
                </div>
              </div>
            </div>

            <div className="kpi-box-org">
              <div className="kpi-box-org-header">
                <Users size={16} /> TỔ CHỨC THỰC HIỆN
              </div>
              <div className="kpi-org-roles">
                <div className="kpi-org-role"><Briefcase size={14} color="#10b981" /> Phòng Nhân sự</div>
                <div className="kpi-org-role"><DollarSign size={14} color="#f59e0b" /> Kế toán</div>
                <div className="kpi-org-role"><UserCircle size={14} color="#3b82f6" /> Trưởng bộ phận</div>
              </div>
              <div className="kpi-org-tasks">
                <div className="kpi-org-task"><CheckCircle size={14} /> Theo dõi KPI</div>
                <div className="kpi-org-task"><FileCheck size={14} /> Xác nhận số liệu</div>
                <div className="kpi-org-task"><Award size={14} /> Đề xuất thưởng</div>
              </div>
              <div className="kpi-sign-area">
                <div style={{ fontSize: '0.8rem', fontWeight: 900, color: '#0f172a' }}>ĐẠI DIỆN CÔNG TY</div>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#475569' }}>Giám đốc</div>
                <div style={{ fontSize: '0.65rem', fontStyle: 'italic', color: '#64748b' }}>(Ký, ghi rõ họ tên, đóng dấu)</div>
                
                <div style={{ height: '120px', position: 'relative', marginTop: '10px' }}>
                  <img src="/con-dau-tron-fittour.png" alt="FIT TOUR Stamp" style={{ height: '120px', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, color: '#0f172a', marginTop: '5px' }}>NGUYỄN NHẤT VŨ</div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM STRIP */}
        <div className="kpi-bottom-strip">
          <div><img src="/logo.png" alt="FIT TOUR" style={{ height: '16px', filter: 'brightness(0) invert(1)', verticalAlign: 'middle' }} /></div>
          <div className="kpi-bottom-slogan">
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> ĐOÀN KẾT</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Target size={12} /> CHUYÊN NGHIỆP</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> TẬN TÂM</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><TrendingUp size={12} /> HIỆU QUẢ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoCheKpiPage;
