import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  ExternalLink, 
  FileText, 
  Clock, 
  Sparkles,
  BarChart3,
  CheckCircle2,
  Calendar,
  Search,
  Share2,
  Heart,
  MessageSquare,
  Users,
  Compass,
  ArrowRight,
  Mail
} from 'lucide-react';

const TiktokReportSubTab = () => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState('t10'); // 't9' | 't10'

  return (
    <div className="animate-fade-in" style={{ padding: '0 0 40px 0' }}>
      
      {/* ── MONTH SWITCHER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Video size={20} color="#ec4899" />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            TikTok Studio Creator Hub
          </h2>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#fdf2f8', color: '#be185d', padding: '2px 8px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
            @fittour
          </span>
        </div>

        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setSelectedMonth('t9')}
            style={{
              border: 'none',
              borderRadius: '7px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: selectedMonth === 't9' ? '#ffffff' : 'transparent',
              color: selectedMonth === 't9' ? '#0f172a' : '#64748b',
              boxShadow: selectedMonth === 't9' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            Nghiệm Thu Tháng 09/2026 (22.7K View)
          </button>
          <button
            type="button"
            onClick={() => setSelectedMonth('t10')}
            style={{
              border: 'none',
              borderRadius: '7px',
              padding: '6px 14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: selectedMonth === 't10' ? '#ec4899' : 'transparent',
              color: selectedMonth === 't10' ? '#ffffff' : '#64748b',
              boxShadow: selectedMonth === 't10' ? '0 2px 6px rgba(236, 72, 153, 0.3)' : 'none',
              transition: 'all 0.15s'
            }}
          >
            🔥 Kế Hoạch & KPI Tháng 10/2026
          </button>
        </div>
      </div>

      {/* ── THÁNG 10 TAB ── */}
      {selectedMonth === 't10' && (
        <>
          {/* HEADER BANNER T10 */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
            borderRadius: '20px',
            padding: '30px 36px',
            color: 'white',
            boxShadow: '0 12px 30px -10px rgba(15, 23, 42, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.25) 0%, rgba(236, 72, 153, 0) 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: '780px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(236, 72, 153, 0.2)',
                    color: '#f472b6',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase'
                  }}>
                    Kế Hoạch Bứt Phá Tháng 10
                  </span>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}>
                    Đòn Bẩy T9: 22.7K Views (Search 32.2%)
                  </span>
                </div>

                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                  Báo Cáo Kế Hoạch & Chỉ Tiêu TikTok Studio (T10/2026)
                </h1>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  Tập trung vào <strong>30 video ngắn</strong> khai thác cao điểm mùa Thu – Đông (Cửu Trại Câu, Ladakh, Bhutan). 
                  Nâng mục tiêu lượt xem lên <strong>&gt; 25,000 views</strong> (+10.1%) và chuyển đổi lead từ <strong>633+ profile views</strong>.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="/email_preview_bao_cao_tiktok_studio_t9_2026.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'rgba(236, 72, 153, 0.2)',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    color: '#f472b6',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={14} /> Preview Email
                </a>
                <a
                  href="/preview_bao_cao_tiktok_studio_t10_2026.html"
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
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={14} /> Preview HTML
                </a>
                <button
                  onClick={() => navigate('/tai-lieu/bao-cao-tiktok-thang-10-2026')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)'
                  }}
                >
                  <FileText size={14} /> Xem Trong /tai-lieu/
                </button>
              </div>
            </div>

            {/* METRICS GRID T10 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>KPI Số Video</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#38bdf8' }}>30 Video</div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>1 video chất lượng/ngày</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#86efac', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Mục Tiêu Lượt Xem</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#4ade80' }}>&gt; 25,000</div>
                <div style={{ fontSize: '0.72rem', color: '#86efac' }}>Tăng +10.1% so với T9 (22.7K)</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#fde047', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Mục Tiêu Profile Views</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#fbbf24' }}>&gt; 800</div>
                <div style={{ fontSize: '0.72rem', color: '#fde047' }}>Du khách xem trang chủ kênh</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#f472b6', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Mục Tiêu Chuyển Đổi</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#ec4899' }}>&gt; 50 Leads</div>
                <div style={{ fontSize: '0.72rem', color: '#f472b6' }}>Bấm Link Bio về Zalo OA / Hotline</div>
              </div>
            </div>
          </div>

          {/* 4 CONTENT PILLARS T10 */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={18} color="#ec4899" /> 4 Trụ Cột Nội Dung Trọng Tâm (Content Pillars) Tháng 10
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#64748b' }}>
              Phân bổ 30 video bài bản tập trung vào các tuyến mùa cao điểm và chuyển đổi khách:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '16px', border: '1px solid #fde68a' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase' }}>🍂 Tuyến Mùa Vàng Lá Đỏ</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400e', margin: '4px 0' }}>11 Video (35%)</div>
                <p style={{ fontSize: '0.8rem', color: '#78350f', margin: 0 }}>Cửu Trại Câu, Bắc Kinh, Nhật Bản lá phong rực rỡ.</p>
              </div>

              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '16px', border: '1px solid #bfdbfe' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', textTransform: 'uppercase' }}>🏔️ Tuyến Độc Bản Himalaya</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8', margin: '4px 0' }}>9 Video (30%)</div>
                <p style={{ fontSize: '0.8rem', color: '#1e3a8a', margin: 0 }}>Ladakh tuyết đầu mùa, Vương quốc Hạnh Phúc Bhutan.</p>
              </div>

              <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', border: '1px solid #bbf7d0' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#166534', textTransform: 'uppercase' }}>💡 Tips & Cẩm Nang Du Lịch</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>6 Video (20%)</div>
                <p style={{ fontSize: '0.8rem', color: '#14532d', margin: 0 }}>Mẹo chống sốc độ cao, chuẩn bị áo ấm, mẹo chụp ảnh có guu.</p>
              </div>

              <div style={{ background: '#faf5ff', borderRadius: '12px', padding: '16px', border: '1px solid #e9d5ff' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#7e22ce', textTransform: 'uppercase' }}>💬 Cảm Nhận Khách Hàng</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#9333ea', margin: '4px 0' }}>4 Video (15%)</div>
                <p style={{ fontSize: '0.8rem', color: '#581c87', margin: 0 }}>Phỏng vấn cảm xúc thực tế du khách (Social Proof).</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── THÁNG 9 TAB (NGHIỆM THU) ── */}
      {selectedMonth === 't9' && (
        <>
          {/* HEADER BANNER T9 */}
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #0f172a 100%)',
            borderRadius: '20px',
            padding: '30px 36px',
            color: 'white',
            boxShadow: '0 12px 30px -10px rgba(15, 23, 42, 0.4)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
              <div style={{ maxWidth: '780px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase'
                  }}>
                    Nghiệm Thu Chính Thức
                  </span>
                  <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>• Kênh @fittour • Tháng 09/2026</span>
                </div>

                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.25, letterSpacing: '-0.02em' }}>
                  Báo Cáo Hiệu Suất Kênh TikTok Studio (T9/2026)
                </h1>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.5 }}>
                  Kết quả thực tế xuất từ TikTok Studio Creator: Đạt <strong>22,700 lượt xem</strong> (113.5% KPI), 
                  tăng <strong>+12.7%</strong> views và <strong>+36.7%</strong> tương tác thích.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <a
                  href="/email_preview_bao_cao_tiktok_studio_t9_2026.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'rgba(236, 72, 153, 0.2)',
                    border: '1px solid rgba(236, 72, 153, 0.4)',
                    color: '#f472b6',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={14} /> Preview Email
                </a>
                <a
                  href="/preview_bao_cao_tiktok_studio_t9_2026.html"
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
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={14} /> Preview HTML
                </a>
                <button
                  onClick={() => navigate('/tai-lieu/bao-cao-tiktok-thang-9-2026')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 18px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    border: 'none',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <FileText size={14} /> Xem Trong /tai-lieu/
                </button>
              </div>
            </div>

            {/* METRICS GRID T9 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#93c5fd', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Lượt Xem Video</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#38bdf8' }}>22.7K</div>
                <div style={{ fontSize: '0.72rem', color: '#4ade80' }}>+2.6K (+12.7%) • Đạt 113.5% KPI</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#f472b6', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Lượt Thích (Likes)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#ec4899' }}>533</div>
                <div style={{ fontSize: '0.72rem', color: '#f472b6' }}>+143 lượt (+36.7%)</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Lượt Chia Sẻ (Shares)</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#a855f7' }}>155</div>
                <div style={{ fontSize: '0.72rem', color: '#c084fc' }}>+36 lượt (+30.3%)</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', padding: '14px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ color: '#fde047', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Lượt Xem Hồ Sơ</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '4px 0 2px 0', color: '#fbbf24' }}>633</div>
                <div style={{ fontSize: '0.72rem', color: '#fde047' }}>Du khách xem trang chủ kênh</div>
              </div>
            </div>
          </div>

          {/* TRAFFIC SOURCE BREAKDOWN */}
          <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#2563eb" /> Phân Bổ Nguồn Lưu Lượng Truy Cập Tháng 9
            </h3>
            <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
              Cơ cấu lượng người xem xuất từ thuật toán TikTok Studio:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span>🔥 Đề Xuất (For You Feed - FYP)</span>
                  <span style={{ color: '#2563eb' }}>56.2%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '56.2%', background: '#2563eb', borderRadius: '999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span>🔍 Tìm Kiếm (TikTok Search) — Rất Ấn Tượng!</span>
                  <span style={{ color: '#16a34a' }}>32.2%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '32.2%', background: '#16a34a', borderRadius: '999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span>👤 Hồ Sơ Cá Nhân (Profile Views)</span>
                  <span style={{ color: '#f59e0b' }}>10.5%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '10.5%', background: '#f59e0b', borderRadius: '999px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                  <span>👥 Đã Follow (Following Feed)</span>
                  <span style={{ color: '#64748b' }}>1.1%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '1.1%', background: '#64748b', borderRadius: '999px' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default TiktokReportSubTab;
