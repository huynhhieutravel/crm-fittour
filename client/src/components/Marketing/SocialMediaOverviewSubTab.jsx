import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Globe, 
  Share2, 
  Video, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  BarChart3,
  Sparkles,
  ArrowRight,
  Layers,
  Award,
  Mail
} from 'lucide-react';

const SocialMediaOverviewSubTab = () => {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 40px 0' }}>
      {/* ── HEADER BANNER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        borderRadius: '20px',
        padding: '30px 36px',
        color: 'white',
        boxShadow: '0 12px 30px -10px rgba(15, 23, 42, 0.4)',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: '24px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {/* Glow decoration */}
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '260px',
          height: '260px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, rgba(56, 189, 248, 0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '780px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{
                background: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>
                Báo Cáo Tổng Hợp & Đối Soát KPI
              </span>
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• Kỳ Báo Cáo: Tháng 09/2026</span>
            </div>
            
            <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
              Hiệu Suất Mạng Xã Hội & Digital Tháng 09/2026
            </h1>
            <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.6 }}>
              Đối soát chỉ tiêu KPI và kết quả triển khai thực tế trên 3 kênh truyền thông cốt lõi: 
              <strong> Website fittour.vn</strong>, <strong>Facebook Fanpage</strong> và <strong>TikTok Studio</strong>. 
              Nhấn "Xem chi tiết" để xem toàn văn tài liệu trong kho <code>/tai-lieu/</code>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a
              href="/email_preview_bao_cao_tong_hop_mxh_t9_2026.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38bdf8',
                fontWeight: 600,
                fontSize: '0.82rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <Mail size={14} /> Preview Email
            </a>

            <a
              href="/preview_bao_cao_tong_hop_mxh_t9_2026.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.82rem',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <ExternalLink size={14} /> Preview HTML
            </a>

            <button
              onClick={() => navigate('/tai-lieu/bao-cao-tong-hop-mxh-thang-9-2026')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)'
              }}
            >
              <FileText size={14} /> Đọc Toàn Văn Trong /tai-lieu/
            </button>
          </div>
        </div>

        {/* ── 3 DISTINCT CHANNEL SUMMARY CARDS (NO CROSS-CHANNEL FAKE TOTALS) ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Card Web */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#86efac', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>🌐 Website fittour.vn</span>
              <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#86efac', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>ĐẠT 416.7% KPI</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 2px 0', color: '#ffffff' }}>
              125 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8' }}>/ > 30 bài T9</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '8px' }}>
              21 Tour • 63 Cẩm nang • 29 Showroom • 12 Page
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#86efac', background: 'rgba(34, 197, 94, 0.15)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
              🎯 Đề xuất KPI T10: 40 bài viết mới
            </div>
          </div>

          {/* Card Facebook */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>📱 Facebook Fanpage</span>
              <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#93c5fd', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>VƯỢT +38.6% VIEW</span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '6px 0 2px 0', color: '#ffffff' }}>
              138,580 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#94a3b8' }}>/ 100k view T9</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '8px' }}>
              43 bài Org (35 Ảnh • 6 Reels • 2 Text) • 1,096 tương tác
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#93c5fd', background: 'rgba(59, 130, 246, 0.15)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
              🎯 Đề xuất KPI T10: 40 bài • &gt; 120k view
            </div>
          </div>

          {/* Card TikTok */}
          <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#fbcfe8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>🎵 TikTok Studio</span>
              <span style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fca5a5', fontSize: '0.7rem', fontWeight: 800, padding: '2px 7px', borderRadius: '4px' }}>KPI T9: 30 Clip / 20k View</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, margin: '8px 0 4px 0', color: '#f43f5e' }}>
              Đang cập nhật...
            </div>
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1', marginBottom: '8px' }}>
              Chờ bộ phận Video xuất số liệu từ TikTok Studio Creator
            </div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbcfe8', background: 'rgba(244, 63, 94, 0.15)', padding: '3px 8px', borderRadius: '4px', display: 'inline-block' }}>
              🎯 Đề xuất KPI T10: 30 clip • &gt; 20k view
            </div>
          </div>
        </div>
      </div>

      {/* ── BẢNG ĐỐI SOÁT KPI THÁNG 09/2026 & ĐỀ XUẤT THÁNG 10 (CENTERPIECE) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '24px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} color="#0284c7" /> Bảng Đối Soát Chỉ Tiêu KPI vs Thực Tế & Đề Xuất KPI Tháng 10/2026
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Phân loại cụ thể từng kiểu bài viết, đối soát thực tế minh bạch và đề xuất chỉ tiêu hành động tháng tiếp theo
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, width: '18%' }}>Kênh</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, width: '28%' }}>Phân Loại Bài Viết Chi Tiết (T9)</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, width: '26%' }}>Chỉ Số KPI, Thực Tế & % Đạt (T9)</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, width: '16%' }}>Đề Xuất KPI Tháng 10</th>
                <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, textAlign: 'center', width: '12%' }}>Đánh Giá</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Website */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px', fontWeight: 700, color: '#059669', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Globe size={16} /> Website fittour.vn
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Astro Native • Cloudflare</span>
                </td>
                <td style={{ padding: '14px', color: '#334155', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 800, color: '#059669', marginBottom: '6px' }}>
                    Tổng: 125 trang/bài hoàn thành
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                    • <strong style={{ color: '#0f172a' }}>21</strong> Sản phẩm Tour độc bản<br />
                    • <strong style={{ color: '#0f172a' }}>63</strong> Cẩm nang & Bài viết SEO (Posts)<br />
                    • <strong style={{ color: '#0f172a' }}>29</strong> Showroom thư viện ảnh 16:9<br />
                    • <strong style={{ color: '#0f172a' }}>12</strong> Trang tĩnh hệ thống (Pages)
                  </div>
                </td>
                <td style={{ padding: '14px', verticalAlign: 'top' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SỐ BÀI VIẾT:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>125</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ KPI &gt; 30</span>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
                        416.7%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LƯỢT TRUY CẬP (VIEWS):</div>
                    <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 600, marginTop: '2px' }}>
                      Đo lường GA4 / Organic Search
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tải cực nhanh &lt; 0.8s (Astro Native)</div>
                  </div>
                </td>
                <td style={{ padding: '14px', verticalAlign: 'top' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>Chỉ tiêu T10</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>40 Bài viết</div>
                    <div style={{ fontSize: '0.72rem', color: '#475569' }}>Cẩm nang SEO & Tour mùa Thu - Đông</div>
                  </div>
                </td>
                <td style={{ padding: '14px', textAlign: 'center', verticalAlign: 'top' }}>
                  <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', display: 'inline-block' }}>
                    VƯỢT TRỘI<br /><span style={{ fontSize: '0.68rem', fontWeight: 500 }}>(Xong 100%)</span>
                  </span>
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => navigate('/tai-lieu/bao-cao-website-thang-9-2026')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: '#059669',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(5, 150, 105, 0.2)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#047857'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#059669'; }}
                    >
                      Xem chi tiết <ArrowRight size={12} />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 2: Facebook */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px', fontWeight: 700, color: '#1877f2', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Share2 size={16} /> Facebook Fanpage
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>FIT TOUR – Du lịch có Guu</span>
                </td>
                <td style={{ padding: '14px', color: '#334155', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 800, color: '#1877f2', marginBottom: '6px' }}>
                    Tổng: 43 bài Organic
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                    • <strong style={{ color: '#0f172a' }}>35</strong> Album & Ảnh hành trình (81.4%)<br />
                    • <strong style={{ color: '#0f172a' }}>6</strong> Thước phim (Reels du lịch)<br />
                    • <strong style={{ color: '#0f172a' }}>2</strong> Bài viết cảm xúc / Tin ngắn<br />
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>• Paid Ads: 6 bài quảng cáo (tách riêng)</span>
                  </div>
                </td>
                <td style={{ padding: '14px', verticalAlign: 'top' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SỐ BÀI VIẾT:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>43 bài</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ KPI 40</span>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
                        107.5%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LƯỢT XEM NỘI DUNG (VIEWS):</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1877f2' }}>138,580</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ &gt; 100k</span>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
                        138.6%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '3px' }}>
                      TB: ~3,223 view/bài (138.5k / 43 bài)
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '1px' }}>
                      1,096 tương tác • 71,459 reach • Ads riêng: 66.1k
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px', verticalAlign: 'top' }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1e40af', textTransform: 'uppercase' }}>Chỉ tiêu T10</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1d4ed8', margin: '4px 0' }}>40 Bài viết</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1e40af' }}>&gt; 120,000 views</div>
                    <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '2px' }}>&gt; 3,000 view TB/bài</div>
                  </div>
                </td>
                <td style={{ padding: '14px', textAlign: 'center', verticalAlign: 'top' }}>
                  <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', display: 'inline-block' }}>
                    ĐẠT VƯỢT<br /><span style={{ fontSize: '0.68rem', fontWeight: 500 }}>CHỈ TIÊU</span>
                  </span>
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => navigate('/tai-lieu/bao-cao-facebook-thang-9-2026')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: '#1877f2',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(24, 119, 242, 0.2)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#1877f2'; }}
                    >
                      Xem chi tiết <ArrowRight size={12} />
                    </button>
                  </div>
                </td>
              </tr>

              {/* Row 3: TikTok */}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px', fontWeight: 700, color: '#e11d48', verticalAlign: 'top' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Video size={16} /> TikTok Studio
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500 }}>Kênh @fittour</span>
                </td>
                <td style={{ padding: '14px', color: '#334155', verticalAlign: 'top' }}>
                  <div style={{ fontWeight: 800, color: '#e11d48', marginBottom: '6px' }}>
                    Tổng: 30 video dọc (Studio)
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.6 }}>
                    • Short-form cảnh đẹp, flycam Cửu Trại Câu, Ladakh<br />
                    • Trải nghiệm văn hóa & ẩm thực bản địa<br />
                    • Review & tips du lịch thực tế<br />
                    • Đề xuất FYP: 56.2% • <strong style={{ color: '#7c3aed' }}>Search SEO: 32.2% ⭐</strong>
                  </div>
                </td>
                <td style={{ padding: '14px', verticalAlign: 'top' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>SỐ VIDEO CLIP:</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>30 clip</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ KPI 30</span>
                      <span style={{ background: '#fce7f3', color: '#9d174d', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
                        100%
                      </span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>LƯỢT XEM VIDEO (VIEWS):</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#db2777' }}>22,700</span>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>/ &gt; 20k</span>
                      <span style={{ background: '#fce7f3', color: '#be185d', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, fontSize: '0.72rem' }}>
                        113.5%
                      </span>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '3px' }}>
                      533 like (+36.7%) • 155 share • 633 profile views
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px', verticalAlign: 'top' }}>
                  <div style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '8px', padding: '10px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', textTransform: 'uppercase' }}>Chỉ tiêu T10</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#be185d', margin: '4px 0' }}>30 Video</div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#9d174d' }}>&gt; 25,000 views</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>(Tăng +10.1% MoM)</div>
                  </div>
                </td>
                <td style={{ padding: '14px', textAlign: 'center', verticalAlign: 'top' }}>
                  <span style={{ background: '#fdf2f8', color: '#be185d', border: '1px solid #fbcfe8', padding: '4px 8px', borderRadius: '6px', fontWeight: 700, fontSize: '0.75rem', display: 'inline-block' }}>
                    VƯỢT KPI<br /><span style={{ fontSize: '0.68rem', fontWeight: 500 }}>(113.5% View)</span>
                  </span>
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => navigate('/tai-lieu/bao-cao-tiktok-thang-9-2026')}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: '#0f172a',
                        color: 'white',
                        border: 'none',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 2px rgba(15, 23, 42, 0.2)',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#e11d48'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#0f172a'; }}
                    >
                      Xem chi tiết <ArrowRight size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SAU ĐÓ ĐI XUỐNG NÓI VỀ CHI TIẾT TỪNG KÊNH ── */}
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
          Chi Tiết Triển Khai & Hiệu Suất Từng Kênh
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
          Phân tích sâu kết quả đạt được, giải pháp kỹ thuật và kế hoạch hành động cụ thể cho tháng 10
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '22px', marginBottom: '32px' }}>
        
        {/* CARD CHI TIẾT 1: WEBSITE */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#059669', borderRadius: '16px 16px 0 0' }} />
          
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Website fittour.vn</h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Astro Native • Cloudflare Edge</span>
                </div>
              </div>
              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                125 Trang
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              <strong>Hoàn thành xuất sắc KPI (&gt;30 bài):</strong> Bàn giao 125 trang/bài số hóa, dọn sạch code Elementor, đạt tốc độ tải trang cực nhanh &lt;0.8s.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                <div>Sản phẩm Tour: <strong style={{ color: '#059669' }}>21 Tour</strong></div>
                <div>Cẩm nang/Bài viết: <strong>63 Bài</strong></div>
                <div>Showroom 16:9: <strong>29 Trang</strong></div>
                <div>Trang hệ thống: <strong>12 Page</strong></div>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <CheckCircle2 size={14} color="#10b981" />
              <a
                href="https://docs.google.com/spreadsheets/d/1dr95yLvqX_WfucYrruugkKXns8L0WDP5/edit?usp=sharing&ouid=107203445454776991915&rtpof=true&sd=true"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                Trang tính trực tuyến: 125 URL Astro T9/2026 <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              onClick={() => navigate('/tai-lieu/bao-cao-website-thang-9-2026')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#059669',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <FileText size={14} /> Xem Chi Tiết Trong /tai-lieu/
            </button>
            <a
              href="/email_preview_bao_cao_website_t9_2026.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none'
              }}
              title="Mở bản Preview HTML"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* CARD CHI TIẾT 2: FACEBOOK */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#1877f2', borderRadius: '16px 16px 0 0' }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Share2 size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Facebook Fanpage</h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>FIT TOUR – Du lịch có Guu</span>
                </div>
              </div>
              <span style={{ background: '#dbeafe', color: '#1d4ed8', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                43 Bài Organic
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              <strong>Vượt chỉ tiêu KPI (40 bài & 100k views):</strong> Đạt 43 bài (107.5%) và 138,580 lượt xem organic (138.6%). Tuần 3 bứt phá 54,743 views nhờ album ảnh hành trình.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                <div>Lượt xem Org: <strong style={{ color: '#1877f2' }}>138,580</strong></div>
                <div>Người tiếp cận: <strong>71,459</strong></div>
                <div>Tương tác: <strong>1,096</strong></div>
                <div>TB xem/bài: <strong>3,223</strong></div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <Sparkles size={14} color="#f59e0b" />
              <span>Paid Media T9: 6 bài quảng cáo đạt 66,173 views & 271 clicks (tách riêng)</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              onClick={() => navigate('/tai-lieu/bao-cao-facebook-thang-9-2026')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#1877f2',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <FileText size={14} /> Xem Chi Tiết Trong /tai-lieu/
            </button>
            <a
              href="/preview_bao_cao_fanpage_facebook_t9_2026.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none'
              }}
              title="Mở bản Preview HTML"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* CARD CHI TIẾT 3: TIKTOK */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#ec4899', borderRadius: '16px 16px 0 0' }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0f172a', color: '#f43f5e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Video size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>TikTok Studio</h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Kênh @fittour • Video Ngắn</span>
                </div>
              </div>
              <span style={{ background: '#fce7f3', color: '#be185d', fontSize: '0.72rem', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                Khung Báo Cáo
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              <strong>Chỉ tiêu KPI Tháng 9:</strong> 30 short-form videos &gt; 20,000 views. Dữ liệu thực tế đang trong quá trình xuất từ TikTok Studio Creator, giữ nguyên tính trung thực.
            </p>

            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '14px', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                <div>KPI Video: <strong>30 Clip</strong></div>
                <div>Thực tế: <span style={{ color: '#be185d', fontWeight: 600 }}>Chờ xuất file</span></div>
                <div>KPI Views: <strong>&gt; 20k Views</strong></div>
                <div>Thực tế: <span style={{ color: '#be185d', fontWeight: 600 }}>Chờ xuất file</span></div>
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <Clock size={14} color="#ec4899" />
              <span>Sẵn sàng biểu mẫu nhập chỉ số Views, Thích, Cmt, Save, Bio clicks</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <button
              onClick={() => navigate('/tai-lieu/bao-cao-tiktok-thang-9-2026')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#0f172a',
                color: 'white',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <FileText size={14} /> Xem Chi Tiết Trong /tai-lieu/
            </button>
            <a
              href="/preview_bao_cao_tiktok_studio_t9_2026.html"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '9px 12px',
                borderRadius: '8px',
                background: '#f1f5f9',
                color: '#334155',
                textDecoration: 'none'
              }}
              title="Mở bản Preview HTML"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

      </div>

      {/* ── MÔ HÌNH PHỐI HỢP & CALL-TO-ACTION ── */}
      <div style={{
        background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '22px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            Định Hướng Phối Hợp Nội Dung Đa Kênh Tháng 10/2026
          </h4>
          <p style={{ margin: 0, fontSize: '0.84rem', color: '#475569', maxWidth: '750px', lineHeight: 1.5 }}>
            Website là mỏ neo cẩm nang thông tin (125 trang) ➔ Facebook tập trung Album ảnh hành trình thực tế nuôi dưỡng niềm tin ➔ TikTok đẩy mạnh video ngắn tạo tò mò và mở rộng tệp khách hàng.
          </p>
        </div>

        <button
          onClick={() => navigate('/tai-lieu')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '8px',
            background: '#0f172a',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            fontSize: '0.84rem',
            cursor: 'pointer'
          }}
        >
          Toàn Bộ Tài Liệu CRM <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default SocialMediaOverviewSubTab;
