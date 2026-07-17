import React from 'react';
import { Megaphone, Target, Image as ImageIcon, Lightbulb, ArrowRight, Users, FileText, Calendar } from 'lucide-react';

const SopMetaAdsInfographic = () => {
  return (
    <div style={{ background: '#eef2f6', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", sans-serif' }}>
        <style>{`
          * { box-sizing: border-box; }
          .meta-wrapper { max-width: 1280px; margin: 0 auto; background: white; box-shadow: 0 10px 40px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; }
          
          /* HEADER */
          .meta-header { 
            background: #0f172a; 
            padding: 30px 40px; 
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .meta-logo { display: flex; align-items: center; gap: 10px; }
          .meta-logo img { height: 40px; filter: brightness(0) invert(1); }
          .meta-logo-text { color: white; font-weight: 800; font-size: 1.5rem; letter-spacing: -0.5px; }
          .meta-logo-sub { color: #22c55e; font-size: 0.8rem; font-weight: 600; margin-top: -5px; }
          .meta-header-right { text-align: right; }
          .meta-title { color: white; font-size: 2.2rem; font-weight: 900; margin: 0; letter-spacing: -0.5px; }
          .meta-subtitle { color: #f8fafc; font-size: 1.1rem; font-weight: 500; margin: 5px 0 0 0; }
          
          /* MAIN CONTENT */
          .meta-content { padding: 30px; display: grid; grid-template-columns: 2fr 1fr; gap: 30px; }
          
          /* LEFT COLUMN */
          .meta-left { display: flex; flex-direction: column; gap: 20px; }
          
          /* CARD COMPONENT */
          .meta-card { display: flex; border-radius: 16px; overflow: hidden; background: white; }
          
          /* COLORS */
          .meta-c-blue { border: 1px solid #bfdbfe; }
          .meta-c-blue .meta-card-left { color: #2563eb; }
          .meta-c-blue .meta-example { background: #eff6ff; border: 1px solid #bfdbfe; }
          
          .meta-c-green { border: 1px solid #bbf7d0; }
          .meta-c-green .meta-card-left { color: #16a34a; }
          .meta-c-green .meta-example { background: #f0fdf4; border: 1px solid #bbf7d0; }
          
          .meta-c-purple { border: 1px solid #e9d5ff; }
          .meta-c-purple .meta-card-left { color: #9333ea; }
          .meta-c-purple .meta-example { background: #faf5ff; border: 1px solid #e9d5ff; }

          /* UTILITY COLORS FOR VARIABLES */
          .c-blue .meta-var { color: #2563eb; border-color: #bfdbfe; }
          .c-blue .meta-var-desc::before { color: #2563eb; }
          .c-blue .meta-var-desc { color: #1e293b; }
          
          .c-green .meta-var { color: #16a34a; border-color: #bbf7d0; }
          .c-green .meta-var-desc::before { color: #16a34a; }
          .c-green .meta-var-desc { color: #1e293b; }
          
          .c-orange .meta-var { color: #ea580c; border-color: #fed7aa; }
          .c-orange .meta-var-desc::before { color: #ea580c; }
          .c-orange .meta-var-desc { color: #1e293b; }
          
          .c-purple .meta-var { color: #9333ea; border-color: #e9d5ff; }
          .c-purple .meta-var-desc::before { color: #9333ea; }
          .c-purple .meta-var-desc { color: #1e293b; }
          
          .c-red .meta-var { color: #dc2626; border-color: #fecaca; }
          .c-red .meta-var-desc::before { color: #dc2626; }
          .c-red .meta-var-desc { color: #1e293b; }
          
          .c-gray .meta-var { color: #0f172a; border-color: #cbd5e1; }
          .c-gray .meta-var-desc::before { color: #0f172a; }
          .c-gray .meta-var-desc { color: #1e293b; }

          .meta-card-left {
            width: 140px;
            padding: 30px 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border-right: 1px dashed #cbd5e1;
          }
          .meta-card-icon {
            width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
            color: white; margin-bottom: 15px;
          }
          .meta-c-blue .meta-card-icon { background: #2563eb; }
          .meta-c-green .meta-card-icon { background: #16a34a; }
          .meta-c-purple .meta-card-icon { background: #9333ea; }
          
          .meta-card-num { font-size: 3rem; font-weight: 900; line-height: 1; margin-bottom: 5px; }
          .meta-card-name { font-size: 1.2rem; font-weight: 800; line-height: 1.1; }
          .meta-card-sub { font-size: 0.8rem; font-weight: 500; color: #475569; margin-top: 5px; }
          
          .meta-card-right { flex: 1; padding: 20px; }
          .meta-vars { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 20px; }
          .meta-var-item { flex: 1; text-align: center; }
          .meta-var { font-weight: 700; font-size: 0.9rem; padding: 5px 0; border: 1px solid #e2e8f0; border-radius: 6px; margin-bottom: 8px; background: white; }
          .meta-var-desc { font-size: 0.75rem; color: #475569; font-weight: 500; line-height: 1.3; position: relative; }
          .meta-var-desc::before { content: '⋮'; display: block; color: #94a3b8; font-size: 1.2rem; line-height: 0.8; margin-bottom: 5px; }
          .meta-badge-opt { position: absolute; top: -8px; right: -8px; background: #f1f5f9; color: #64748b; padding: 2px 6px; border-radius: 6px; font-size: 0.55rem; font-weight: 800; border: 1px solid #cbd5e1; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
          
          .meta-example { border-radius: 12px; padding: 15px; position: relative; }
          .meta-example-badge { position: absolute; top: -12px; left: 15px; background: #2563eb; color: white; padding: 4px 15px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
          .meta-c-green .meta-example-badge { background: #16a34a; }
          .meta-c-purple .meta-example-badge { background: #9333ea; }
          .meta-example-list { list-style: none; padding: 0; margin: 0; }
          .meta-example-list li { position: relative; padding-left: 15px; margin-bottom: 8px; font-size: 0.9rem; color: #1e293b; font-weight: 500; }
          .meta-example-list li:last-child { margin-bottom: 0; }
          .meta-example-list li::before { content: '•'; color: #2563eb; font-weight: bold; font-size: 1.2rem; position: absolute; left: 0; top: -2px; }
          .meta-c-green .meta-example-list li::before { color: #16a34a; }
          .meta-c-purple .meta-example-list li::before { color: #9333ea; }

          /* WARNING ROW */
          .meta-warning { background: #fffbeb; border: 1px solid #fde68a; border-radius: 16px; padding: 20px; display: flex; align-items: flex-start; gap: 20px; margin-top: 10px; }
          .meta-warning-icon { width: 50px; height: 50px; background: #ea580c; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .meta-warning-title { font-weight: 800; color: #ea580c; font-size: 0.9rem; margin-top: 15px; text-align: center; }
          .meta-warning-list { list-style: none; padding: 0; margin: 0; }
          .meta-warning-list li { position: relative; padding-left: 20px; margin-bottom: 8px; font-size: 0.85rem; color: #334155; font-weight: 600; line-height: 1.4; }
          .meta-warning-list li::before { content: '✓'; color: white; background: #2563eb; width: 14px; height: 14px; border-radius: 50%; font-size: 0.6rem; display: flex; align-items: center; justify-content: center; position: absolute; left: 0; top: 2px; }

          /* FULL EXAMPLE ROW */
          .meta-full { display: flex; align-items: center; gap: 15px; margin-top: 20px; }
          .meta-full-title { color: #2563eb; font-weight: 800; font-size: 0.9rem; text-align: center; width: 90px; line-height: 1.3; }
          
          .meta-f-box { border-radius: 8px; padding: 8px 12px; display: flex; align-items: center; gap: 10px; flex: 1; border: 1px solid #e2e8f0; }
          .meta-f-icon { width: 30px; height: 30px; border-radius: 50%; color: white; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
          .meta-f-content { flex: 1; }
          .meta-f-name { font-size: 0.7rem; font-weight: 800; letter-spacing: 0.5px; margin-bottom: 2px; }
          .meta-f-text { font-size: 0.75rem; color: #0f172a; font-weight: 600; line-height: 1.3; }
          
          .meta-f-arrow { color: #2563eb; font-weight: bold; }

          /* RIGHT COLUMN */
          .meta-right { border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; display: flex; flex-direction: column; }
          .meta-r-header { background: #0f172a; color: white; text-align: center; padding: 15px; font-weight: 800; font-size: 1.1rem; letter-spacing: 0.5px; }
          .meta-r-content { background: #f8fafc; padding: 20px 20px 5px 20px; flex: 1; display: flex; flex-direction: column; }
          
          .meta-r-section { margin-bottom: 35px; }
          .meta-r-section-header { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 15px; padding-bottom: 10px; position: relative; }
          .meta-r-section-header::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 150px; height: 1px; background: #e2e8f0; }
          .meta-r-icon { width: 22px; height: 22px; }
          .meta-r-main { flex: 1; }
          .meta-r-title { font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0; display: flex; align-items: center; }
          .meta-r-title span { font-weight: 500; font-size: 0.75rem; color: #64748b; text-transform: none; margin-left: 5px; }
          
          .meta-r-list { list-style: none; padding: 0; margin: 0; }
          .meta-r-list li { display: grid; grid-template-columns: 85px 1fr; gap: 15px; margin-bottom: 12px; }
          .meta-r-list li:last-child { margin-bottom: 0; }
          .meta-r-list-key { font-weight: 700; font-size: 0.8rem; text-align: left; }
          .meta-r-list-val { font-size: 0.85rem; color: #334155; line-height: 1.4; }
          
          .meta-r-list-blue .meta-r-icon, .meta-r-list-blue .meta-r-title, .meta-r-list-blue .meta-r-list-key { color: #2563eb; }
          .meta-r-list-green .meta-r-icon, .meta-r-list-green .meta-r-title, .meta-r-list-green .meta-r-list-key { color: #16a34a; }
          .meta-r-list-purple .meta-r-icon, .meta-r-list-purple .meta-r-title, .meta-r-list-purple .meta-r-list-key { color: #9333ea; }
          .meta-r-list-red .meta-r-icon, .meta-r-list-red .meta-r-title, .meta-r-list-red .meta-r-list-key { color: #dc2626; }
          .meta-r-list-orange .meta-r-icon, .meta-r-list-orange .meta-r-title, .meta-r-list-orange .meta-r-list-key { color: #ea580c; }
          
          /* RESPONSIVE */
          @media (max-width: 992px) {
            .meta-content { grid-template-columns: 1fr; }
            .meta-vars { flex-wrap: wrap; }
            .meta-var-item { min-width: 30%; }
          }
          @media (max-width: 768px) {
            .meta-header { flex-direction: column; gap: 15px; padding: 20px; text-align: center; }
            .meta-header-right { text-align: center; }
            .meta-title { font-size: 1.6rem; }
            
            .meta-card { flex-direction: column; }
            .meta-card-left { width: 100%; border-right: none; border-bottom: 1px dashed #cbd5e1; padding: 20px; flex-direction: row; gap: 15px; justify-content: flex-start; text-align: left; }
            .meta-card-icon { margin-bottom: 0; width: 45px; height: 45px; }
            .meta-card-icon svg { width: 20px; height: 20px; }
            .meta-card-num { font-size: 2rem; margin-bottom: 0; }
            
            .meta-content { padding: 15px; }
            .meta-card-right { padding: 15px; }
            
            .meta-var-item { min-width: 45%; }
            .meta-warning { flex-direction: column; align-items: center; text-align: center; }
            .meta-warning-list li { text-align: left; }
            
            .meta-full { flex-direction: column; align-items: stretch; }
            .meta-full-title { width: auto; margin-bottom: 10px; }
            .meta-f-arrow { transform: rotate(90deg); margin: 0 auto; }
            
            .meta-r-list li { grid-template-columns: 1fr; gap: 4px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; }
            .meta-r-list li:last-child { border-bottom: none; padding-bottom: 0; }
          }
        `}</style>

        <div className="meta-wrapper">
          {/* HEADER */}
          <div className="meta-header">
            <div className="meta-logo">
              <div>
                <div className="meta-logo-text">FIT TOUR<sup style={{fontSize: '0.6em'}}>®</sup></div>
                <div className="meta-logo-sub">Du lịch có Guu ♥</div>
              </div>
            </div>
            <div className="meta-header-right">
              <h1 className="meta-title">Quy tắc đặt tên Meta Ads</h1>
              <p className="meta-subtitle">Thống nhất – Dễ hiểu – Dễ quản lý</p>
            </div>
          </div>

          {/* CONTENT */}
          <div className="meta-content">
            <div className="meta-left">
              
              {/* CARD 1: Campaign */}
              <div className="meta-card meta-c-blue">
                <div className="meta-card-left">
                  <div className="meta-card-icon"><Megaphone size={32} /></div>
                  <div className="meta-card-num">01</div>
                  <div className="meta-card-name">Campaign</div>
                  <div className="meta-card-sub">(Chiến dịch)</div>
                </div>
                <div className="meta-card-right">
                  <div className="meta-vars">
                    <div className="meta-var-item c-blue">
                      <div className="meta-var">[BU]</div>
                      <div className="meta-var-desc">Đơn vị<br/>kinh doanh</div>
                    </div>
                    <div className="meta-var-item c-blue">
                      <div className="meta-var">Objective</div>
                      <div className="meta-var-desc">Mục tiêu<br/>chiến dịch</div>
                    </div>
                    <div className="meta-var-item c-green">
                      <div className="meta-var" style={{position: 'relative'}}>Product <div className="meta-badge-opt">Tùy chọn</div></div>
                      <div className="meta-var-desc">Sản phẩm/<br/>quốc gia</div>
                    </div>
                    <div className="meta-var-item c-orange">
                      <div className="meta-var">Period</div>
                      <div className="meta-var-desc">Thời gian<br/>triển khai</div>
                    </div>
                    <div className="meta-var-item c-gray">
                      <div className="meta-var" style={{position: 'relative'}}>Ghi chú <div className="meta-badge-opt">Tùy chọn</div></div>
                      <div className="meta-var-desc">Ghi chú thêm</div>
                    </div>
                  </div>
                  <div className="meta-example">
                    <div className="meta-example-badge">Ví dụ</div>
                    <ul className="meta-example-list">
                      <li>[BU1] LEAD-MSG | Q3-2026 | Everest ưu tiên</li>
                      <li>[BU1] TRAFFIC | Ladakh | T08-2026</li>
                      <li>[BU2] LEAD-MSG | Bhutan | H2-2026 | Ngân sách lớn</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CARD 2: Ad Set */}
              <div className="meta-card meta-c-green">
                <div className="meta-card-left">
                  <div className="meta-card-icon"><Target size={32} /></div>
                  <div className="meta-card-num">02</div>
                  <div className="meta-card-name">Ad Set</div>
                  <div className="meta-card-sub">(Nhóm quảng cáo)</div>
                </div>
                <div className="meta-card-right">
                  <div className="meta-vars">
                    <div className="meta-var-item c-green">
                      <div className="meta-var">[BU]</div>
                      <div className="meta-var-desc">Đơn vị<br/>kinh doanh</div>
                    </div>
                    <div className="meta-var-item c-green">
                      <div className="meta-var">Tour</div>
                      <div className="meta-var-desc">Tour/Sản phẩm<br/>đang chạy</div>
                    </div>
                    <div className="meta-var-item c-blue">
                      <div className="meta-var">Loại chạy</div>
                      <div className="meta-var-desc">Đối tượng/<br/>chiến lược</div>
                    </div>
                    <div className="meta-var-item c-blue">
                      <div className="meta-var">Objective</div>
                      <div className="meta-var-desc">Mục tiêu<br/>chạy</div>
                    </div>
                    <div className="meta-var-item c-red">
                      <div className="meta-var">Budget</div>
                      <div className="meta-var-desc">Ngân sách<br/>mỗi ngày</div>
                    </div>
                    <div className="meta-var-item c-gray">
                      <div className="meta-var" style={{position: 'relative'}}>Ghi chú <div className="meta-badge-opt">Tùy chọn</div></div>
                      <div className="meta-var-desc">Ghi chú thêm</div>
                    </div>
                  </div>
                  <div className="meta-example">
                    <div className="meta-example-badge">Ví dụ</div>
                    <ul className="meta-example-list">
                      <li>[BU4] Bromo Bali | HCM+30km, 22T+ | LEAD-MSG | 100K</li>
                      <li>[BU1] Cửu Trại Câu | COLD | LEAD-MSG | 300K</li>
                      <li>[BU2] Ladakh | LLA1% | LEAD-MSG | 500K | Test A</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* CARD 3: Ads */}
              <div className="meta-card meta-c-purple">
                <div className="meta-card-left">
                  <div className="meta-card-icon"><ImageIcon size={32} /></div>
                  <div className="meta-card-num">03</div>
                  <div className="meta-card-name">Ads</div>
                  <div className="meta-card-sub">(Quảng cáo)</div>
                </div>
                <div className="meta-card-right">
                  <div className="meta-vars">
                    <div className="meta-var-item c-purple">
                      <div className="meta-var">[BU]</div>
                      <div className="meta-var-desc">Đơn vị<br/>kinh doanh</div>
                    </div>
                    <div className="meta-var-item c-purple">
                      <div className="meta-var">Tên Creative</div>
                      <div className="meta-var-desc">Tên nội dung<br/>quảng cáo</div>
                    </div>
                    <div className="meta-var-item c-blue">
                      <div className="meta-var">Format</div>
                      <div className="meta-var-desc">Định dạng<br/>quảng cáo</div>
                    </div>
                    <div className="meta-var-item c-red">
                      <div className="meta-var">Hook</div>
                      <div className="meta-var-desc">Góc triển khai<br/>nội dung</div>
                    </div>
                    <div className="meta-var-item c-orange">
                      <div className="meta-var">Version</div>
                      <div className="meta-var-desc">Phiên bản</div>
                    </div>
                  </div>
                  <div className="meta-example">
                    <div className="meta-example-badge">Ví dụ</div>
                    <ul className="meta-example-list">
                      <li>[BU1] Everest Base Camp | VID | Story | V1</li>
                      <li>[BU1] Everest Base Camp | IMG | Offer | V2</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* LƯU Ý QUAN TRỌNG */}
              <div className="meta-warning">
                <div>
                  <div className="meta-warning-icon"><Lightbulb size={28} /></div>
                  <div className="meta-warning-title">LƯU Ý QUAN TRỌNG</div>
                </div>
                <ul className="meta-warning-list">
                  <li>Dùng "|" để ngăn cách các phần.</li>
                  <li>Tên ngắn gọn, rõ ràng, không trùng lặp.</li>
                  <li>Không đổi tên phiên bản đã chạy khi sửa nội dung, hãy tạo phiên bản mới.</li>
                  <li>Đảm bảo tên phản ánh đúng mục tiêu, nội dung và đối tượng.</li>
                </ul>
              </div>

              {/* VÍ DỤ ĐẦY ĐỦ 3 CẤP */}
              <div className="meta-full">
                <div className="meta-full-title">VÍ DỤ ĐẦY ĐỦ<br/>3 CẤP</div>
                
                <div className="meta-f-box meta-c-blue" style={{background: 'white'}}>
                  <div className="meta-f-icon" style={{background: '#2563eb'}}><Megaphone size={16} /></div>
                  <div className="meta-f-content">
                    <div className="meta-f-name" style={{color: '#2563eb'}}>CAMPAIGN</div>
                    <div className="meta-f-text">[BU1] LEAD-MSG | Q3-2026 | Everest ưu tiên</div>
                  </div>
                </div>
                
                <ArrowRight size={24} className="meta-f-arrow" />

                <div className="meta-f-box meta-c-green" style={{background: 'white'}}>
                  <div className="meta-f-icon" style={{background: '#16a34a'}}><Target size={16} /></div>
                  <div className="meta-f-content">
                    <div className="meta-f-name" style={{color: '#16a34a'}}>AD SET</div>
                    <div className="meta-f-text">[BU1] Everest | COLD | LEAD-MSG | 300K</div>
                  </div>
                </div>

                <ArrowRight size={24} className="meta-f-arrow" />

                <div className="meta-f-box meta-c-purple" style={{background: 'white'}}>
                  <div className="meta-f-icon" style={{background: '#9333ea'}}><ImageIcon size={16} /></div>
                  <div className="meta-f-content">
                    <div className="meta-f-name" style={{color: '#9333ea'}}>ADS</div>
                    <div className="meta-f-text">[BU1] Everest Base Camp | VID | Story | V1</div>
                  </div>
                </div>
              </div>

            </div>
            
            {/* RIGHT COLUMN */}
            <div className="meta-right">
              <div className="meta-r-header">QUY ƯỚC NHANH</div>
              <div className="meta-r-content">
                
                {/* OBJECTIVE */}
                <div className="meta-r-section meta-r-list-blue">
                  <div className="meta-r-section-header">
                    <Target className="meta-r-icon" />
                    <div className="meta-r-title">OBJECTIVE <span>(MỤC TIÊU)</span></div>
                  </div>
                  <ul className="meta-r-list">
                    <li><span className="meta-r-list-key">MSG</span><span className="meta-r-list-val">Tin nhắn chung (Tương tác / Bán hàng)</span></li>
                    <li><span className="meta-r-list-key">LEAD-MSG</span><span className="meta-r-list-val">Tin nhắn Tiềm năng (Tìm kiếm Lead)</span></li>
                    <li><span className="meta-r-list-key">LEAD-FORM</span><span className="meta-r-list-val">Biểu mẫu Tiềm năng (Instant Form)</span></li>
                    <li><span className="meta-r-list-key">SALES</span><span className="meta-r-list-val">Chuyển đổi / Bán hàng (Website)</span></li>
                    <li><span className="meta-r-list-key">TRAFFIC</span><span className="meta-r-list-val">Lưu lượng truy cập Website</span></li>
                    <li><span className="meta-r-list-key">ENG</span><span className="meta-r-list-val">Tương tác bài viết</span></li>
                    <li><span className="meta-r-list-key">VIDEO</span><span className="meta-r-list-val">Lượt xem video</span></li>
                  </ul>
                </div>

                {/* PERIOD */}
                <div className="meta-r-section meta-r-list-orange">
                  <div className="meta-r-section-header">
                    <Calendar className="meta-r-icon" />
                    <div className="meta-r-title">PERIOD <span>(THỜI GIAN CAMPAIGN)</span></div>
                  </div>
                  <ul className="meta-r-list">
                    <li><span className="meta-r-list-key">T1, T2...</span><span className="meta-r-list-val">Tháng 1, Tháng 2...</span></li>
                    <li><span className="meta-r-list-key">Q1, Q2...</span><span className="meta-r-list-val">Quý 1, Quý 2...</span></li>
                    <li><span className="meta-r-list-key">H1, H2</span><span className="meta-r-list-val">Nửa đầu năm / Nửa cuối năm</span></li>
                  </ul>
                </div>

                {/* LOẠI CHẠY */}
                <div className="meta-r-section meta-r-list-green">
                  <div className="meta-r-section-header">
                    <Users className="meta-r-icon" />
                    <div className="meta-r-title">LOẠI CHẠY <span>(AD SET)</span></div>
                  </div>
                  <ul className="meta-r-list">
                    <li><span className="meta-r-list-key">COLD</span><span className="meta-r-list-val">Khách hàng mới (Tệp lạnh)</span></li>
                    <li><span className="meta-r-list-key">RMKT</span><span className="meta-r-list-val">Remarketing (Tiếp thị lại)</span></li>
                    <li><span className="meta-r-list-key">LLA1%</span><span className="meta-r-list-val">Lookalike 1% (Tệp tương tự)</span></li>
                    <li><span className="meta-r-list-key">BROAD</span><span className="meta-r-list-val">Tệp rộng (Không target)</span></li>
                    <li><span className="meta-r-list-key">CỤ THỂ</span><span className="meta-r-list-val">Khu vực, tuổi... (VD: HCM+30km, 22T+)</span></li>
                  </ul>
                </div>

                {/* FORMAT */}
                <div className="meta-r-section meta-r-list-orange">
                  <div className="meta-r-section-header">
                    <FileText className="meta-r-icon" />
                    <div className="meta-r-title">FORMAT <span>(ADS)</span></div>
                  </div>
                  <ul className="meta-r-list">
                    <li><span className="meta-r-list-key">VID</span><span className="meta-r-list-val">Video</span></li>
                    <li><span className="meta-r-list-key">IMG</span><span className="meta-r-list-val">Hình ảnh</span></li>
                    <li><span className="meta-r-list-key">CAR</span><span className="meta-r-list-val">Carousel</span></li>
                    <li><span className="meta-r-list-key">REEL</span><span className="meta-r-list-val">Reel</span></li>
                    <li><span className="meta-r-list-key">UGC</span><span className="meta-r-list-val">Nội dung từ khách hàng</span></li>
                  </ul>
                </div>

                {/* HOOK */}
                <div className="meta-r-section meta-r-list-red">
                  <div className="meta-r-section-header">
                    <Megaphone className="meta-r-icon" />
                    <div className="meta-r-title">HOOK <span>(ADS)</span></div>
                  </div>
                  <ul className="meta-r-list">
                    <li><span className="meta-r-list-key">Story</span><span className="meta-r-list-val">Kể chuyện</span></li>
                    <li><span className="meta-r-list-key">Review</span><span className="meta-r-list-val">Đánh giá khách hàng</span></li>
                    <li><span className="meta-r-list-key">Offer</span><span className="meta-r-list-val">Ưu đãi</span></li>
                    <li><span className="meta-r-list-key">Price</span><span className="meta-r-list-val">Giá bán</span></li>
                    <li><span className="meta-r-list-key">Experience</span><span className="meta-r-list-val">Trải nghiệm</span></li>
                    <li><span className="meta-r-list-key">Highlight</span><span className="meta-r-list-val">Điểm nổi bật</span></li>
                    <li><span className="meta-r-list-key">Itinerary</span><span className="meta-r-list-val">Lịch trình</span></li>
                    <li><span className="meta-r-list-key">FAQ</span><span className="meta-r-list-val">Giải đáp</span></li>
                    <li><span className="meta-r-list-key">Testimonial</span><span className="meta-r-list-val">Chia sẻ khách hàng</span></li>
                    <li><span className="meta-r-list-key">Seasonal</span><span className="meta-r-list-val">Theo mùa</span></li>
                    <li><span className="meta-r-list-key">Promo</span><span className="meta-r-list-val">Khuyến mãi</span></li>
                  </ul>
                </div>
                
                {/* VERSION */}
                <div className="meta-r-section meta-r-list-orange">
                  <div className="meta-r-section-header" style={{marginBottom: '10px'}}>
                    <div className="meta-r-title">VERSION <span>(ADS)</span></div>
                  </div>
                  <div style={{textAlign: 'center'}}>
                    <div style={{fontWeight: 800, fontSize: '1rem', color: '#0f172a', marginBottom: '8px'}}>V1, V2, V3...</div>
                    <div style={{fontSize: '0.8rem', color: '#475569', lineHeight: 1.4}}>Phiên bản của cùng một nội dung.<br/>Khi chỉnh sửa lớn, tạo version mới.</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
    </div>
  );
};

export default SopMetaAdsInfographic;
