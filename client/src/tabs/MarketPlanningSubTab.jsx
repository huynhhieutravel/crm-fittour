import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  ExternalLink, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Search, 
  Calendar,
  Layers,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Helper format tiền tệ
const fmt = (val) => {
  if (!val && val !== 0) return '0';
  return Math.round(Number(val)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// ══════════════════════════════════════════════════════════════════════════════
// CẤU HÌNH THỜI GIAN (QUÝ)
// ══════════════════════════════════════════════════════════════════════════════
const QUARTERS = [
  { id: 'Q4_2026', label: 'Quý 4/2026', period: '01/10/2026 - 31/12/2026', status: 'active', statusLabel: 'Hiện tại' },
  { id: 'Q1_2027', label: 'Quý 1/2027', period: '01/01/2027 - 31/03/2027', status: 'upcoming', statusLabel: 'Sắp tới' },
  { id: 'Q2_2027', label: 'Quý 2/2027', period: '01/04/2027 - 30/06/2027', status: 'upcoming', statusLabel: 'Dự kiến' },
  { id: 'Q3_2027', label: 'Quý 3/2027', period: '01/07/2027 - 30/09/2027', status: 'upcoming', statusLabel: 'Dự kiến' }
];

// ══════════════════════════════════════════════════════════════════════════════
// 5 BU (GỌN GÀNG, KHÔNG GHI THỊ TRƯỜNG DÀI DÒNG)
// ══════════════════════════════════════════════════════════════════════════════
const BU_TABS = [
  { id: 'ALL', name: 'Tất cả BU', hasPlan: true },
  { id: 'BU1', name: 'BU1', hasPlan: true },
  { id: 'BU2', name: 'BU2', hasPlan: false },
  { id: 'BU3', name: 'BU3', hasPlan: false },
  { id: 'BU4', name: 'BU4', hasPlan: true },
  { id: 'BU5', name: 'BU5', hasPlan: false }
];

// Dữ liệu kế hoạch Quý 4/2026
const Q4_PLANS = [
  {
    id: 'bu1',
    bu: 'BU1',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán Ngân Sách BU1 — Quý 4/2026',
    subtitle: 'Đề xuất phân bổ ngân sách Marketing 120 triệu Quý 4 cho thị trường Tour Trung Quốc (Giang Nam, Bắc Kinh, Lệ Giang, Cáp Nhĩ Tân, Á Đinh, Tân Cương, Thanh Tạng), đối soát 100% từ Database ERP.',
    quarter: 'Quý 4/2026',
    period: '01/10/2026 - 31/12/2026',
    status: 'active',
    statusLabel: 'Đang áp dụng',
    badgeColor: '#dc2626',
    badgeBg: '#fee2e2',
    budget: 120000000,
    expectedLeads: '812 - 822 Lead SĐT',
    expectedMessages: '~2.580 Inbox',
    expectedPaxAds: '162 - 163 Pax',
    totalPaxOverall: '198 Pax',
    adsRevenue: '~5.18 Tỷ',
    fullRevenue: '6.320.000.000 đ',
    costRatio: '1.90% - 2.32%',
    path: '/tai-lieu/thi-truong-bu1',
    hasPlan: true,
    routes: [
      { name: 'Giang Nam (2 Đoàn)', budget: '30.000.000 đ', leads: '156 SĐT', pax: '33 Pax Ads', cpl: '192.528 đ', time: 'T10 - T11', tab: 'giangnam' },
      { name: 'Bắc Kinh (2 Đoàn)', budget: '25.000.000 đ', leads: '168 SĐT', pax: '34 Pax Ads', cpl: '148.563 đ', time: 'T10 - T11', tab: 'backinh' },
      { name: 'Lệ Giang (2 Đoàn)', budget: '20.000.000 đ', leads: '157 SĐT', pax: '31 Pax Ads', cpl: '127.295 đ', time: 'T10 - T12', tab: 'legian' },
      { name: 'Cáp Nhĩ Tân (Series)', budget: '15.000.000 đ', leads: '147 SĐT', pax: '28 Pax Ads', cpl: '102.122 đ', time: 'T11 - T12', tab: 'capnhitan' },
      { name: 'Đạo Thành Á Đinh (1 Đoàn)', budget: '12.000.000 đ', leads: '88 SĐT', pax: '17 Pax Ads', cpl: '136.081 đ', time: 'T10', tab: 'adinh' },
      { name: 'Tân Cương (1 Đoàn)', budget: '10.000.000 đ', leads: '52 SĐT', pax: '11 Pax Ads', cpl: '193.796 đ', time: 'T10', tab: 'tancuong' },
      { name: 'Thanh Tạng (1 Đoàn)', budget: '8.000.000 đ', leads: '54 SĐT', pax: '9 Pax Ads', cpl: '149.358 đ', time: 'T10', tab: 'thanhtang' }
    ],
    highlights: [
      '100% đối soát từ 385 chiến dịch Meta Ads thực tế BU1 trong ERP',
      'Tổng ngân sách 120 triệu chia đều 40 triệu/tháng (T10, T11, T12)',
      'Chi phí Ads chỉ chiếm ~1.9% tổng doanh thu dự kiến 6.32 tỷ',
      'Đầy đủ Máy tính dự toán 7 tuyến tour (tính xuôi theo đoàn & tính ngược theo ngân sách)'
    ]
  },
  {
    id: 'bu2',
    bu: 'BU2',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán BU2',
    subtitle: 'Chưa có liên kết đề án cho BU2 trong Quý 4/2026. Tạm để trống link, sẽ cập nhật sau.',
    status: 'empty',
    statusLabel: 'Trống link (Thêm sau)',
    hasPlan: false
  },
  {
    id: 'bu3',
    bu: 'BU3',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán BU3',
    subtitle: 'Chưa có liên kết đề án cho BU3 trong Quý 4/2026. Tạm để trống link, sẽ cập nhật sau.',
    status: 'empty',
    statusLabel: 'Trống link (Thêm sau)',
    hasPlan: false
  },
  {
    id: 'bu4',
    bu: 'BU4',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán Ngân Sách BU4 — Quý 4/2026',
    subtitle: 'Đề xuất phân bổ ngân sách Marketing 30 triệu Quý 4 cho các thị trường đặc thù (Bhutan, Ladakh, Sri Lanka), timeline vận hành và bảng đề xuất theo từng tuyến.',
    quarter: 'Quý 4/2026',
    period: '01/10/2026 - 31/12/2026',
    status: 'active',
    statusLabel: 'Đang áp dụng',
    badgeColor: '#0284c7',
    badgeBg: '#e0f2fe',
    budget: 30000000,
    expectedLeads: '111 - 120 Lead SĐT',
    expectedMessages: '~643 - 698 Inbox',
    expectedPaxAds: '34 - 42 Pax',
    totalPaxOverall: '45 - 53 Pax',
    adsRevenue: '~1.95 - 2.42 Tỷ',
    fullRevenue: '3.960.450.000 đ',
    costRatio: '1.24% - 1.54%',
    path: '/tai-lieu/thi-truong-bu4',
    hasPlan: true,
    routes: [
      { name: 'Bhutan (3 Đoàn)', budget: '21.060.000 đ', leads: '88 - 92 SĐT', pax: '28 - 35 Pax', cpl: '233.121 đ', time: 'T10 - T12', tab: 'bhutan' },
      { name: 'Ladakh (Tăng Cường)', budget: '2.940.000 đ', leads: '12 - 16 SĐT', pax: '3 - 4 Pax', cpl: '181.018 đ', time: '01 - 07/10', tab: 'ladakh' },
      { name: 'Sri Lanka (Tăng Cường)', budget: '6.000.000 đ', leads: '11 - 12 SĐT', pax: '3 Pax', cpl: '508.063 đ', time: '01 - 20/10', tab: 'srilanka' }
    ],
    highlights: [
      '100% đối soát số liệu chuẩn Database Production (loại bỏ toàn bộ dữ liệu ảo)',
      'Tổng ngân sách đề xuất tròn 30 triệu VNĐ, phân bổ 3 giai đoạn rõ ràng',
      'Chi phí Ads chỉ chiếm 1.24% - 1.54% doanh thu trực tiếp từ Ads',
      'Đầy đủ Máy tính dự toán tính xuôi (theo đoàn) & tính ngược (theo ngân sách)'
    ]
  },
  {
    id: 'bu5',
    bu: 'BU5',
    quarterId: 'Q4_2026',
    title: 'Kế Hoạch & Dự Toán BU5',
    subtitle: 'Chưa có liên kết đề án cho BU5 trong Quý 4/2026. Tạm để trống link, sẽ cập nhật sau.',
    status: 'empty',
    statusLabel: 'Trống link (Thêm sau)',
    hasPlan: false
  }
];

export default function MarketPlanningSubTab() {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4_2026');
  const [selectedBu, setSelectedBu] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const currentQuarterInfo = useMemo(() => {
    return QUARTERS.find(q => q.id === selectedQuarter) || QUARTERS[0];
  }, [selectedQuarter]);

  // Lọc kế hoạch theo Quý, Tab BU và ô tìm kiếm
  const filteredPlans = useMemo(() => {
    if (selectedQuarter !== 'Q4_2026') {
      return [];
    }
    return Q4_PLANS.filter(p => {
      if (selectedBu !== 'ALL' && p.bu !== selectedBu) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = p.title.toLowerCase().includes(q);
        const inSub = p.subtitle.toLowerCase().includes(q);
        const inBu = p.bu.toLowerCase().includes(q);
        const inRoutes = p.routes ? p.routes.some(r => r.name.toLowerCase().includes(q)) : false;
        if (!inTitle && !inSub && !inBu && !inRoutes) return false;
      }
      return true;
    });
  }, [selectedQuarter, selectedBu, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* ── 1. HEADER MODULE TỔNG QUAN ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: '10px',
        padding: '24px 28px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.12)',
        border: '1px solid #334155'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ background: '#0284c7', color: '#ffffff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              MARKETING STRATEGY & ADS FORECAST
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{currentQuarterInfo.label}</span>
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, margin: '0 0 6px', color: '#f8fafc', letterSpacing: '-0.01em' }}>
            Danh Sách Kế Hoạch & Dự Toán Thị Trường
          </h2>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', maxWidth: '820px', lineHeight: '1.5' }}>
            Quản lý kế hoạch ngân sách Marketing và dự toán theo từng Business Unit (BU1 - BU5) phân theo chu kỳ thời gian. Dữ liệu kế hoạch BU4 đối soát trực tiếp với Database Production của hệ thống.
          </p>
        </div>

        {/* 4 Thống kê nhanh toàn module BU4 Quý 4/2026 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginTop: '20px',
          paddingTop: '18px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Kế Hoạch Áp Dụng</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>BU4</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Quý 4/2026 • Đã duyệt</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Ngân Sách Marketing BU4</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>30.000.000 đ</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Phân bổ 3 giai đoạn rõ ràng</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Kỳ Vọng Pax Ads BU4</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>34 - 42 Pax</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tổng nguồn: 45 - 53 Pax</div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Tỷ Lệ Chi Phí Ads Mục Tiêu</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>1.24% - 1.54%</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Doanh thu Ads: ~1.95 - 2.42 Tỷ</div>
          </div>
        </div>
      </div>

      {/* ── 2. THANH THỜI GIAN (QUÝ) & TÌM KIẾM ── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Chọn Quý */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Thời Gian Kế Hoạch:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {QUARTERS.map((q) => {
              const isActive = selectedQuarter === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuarter(q.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #0284c7' : '1px solid #cbd5e1',
                    background: isActive ? '#0284c7' : '#f8fafc',
                    color: isActive ? '#ffffff' : '#334155',
                    fontSize: '0.82rem',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>{q.label}</span>
                  {q.status === 'active' && (
                    <span style={{
                      fontSize: '0.66rem',
                      background: isActive ? '#38bdf8' : '#e0f2fe',
                      color: isActive ? '#0c4a6e' : '#0369a1',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700
                    }}>
                      Hiện tại
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px', maxWidth: '340px', flex: '1 1 220px' }}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Tìm theo BU, tuyến tour..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              fontSize: '0.82rem',
              color: '#1e293b'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── 3. TAB BU (GỌN GÀNG, VỪA ĐỦ, KHÔNG CẦN GHI THỊ TRƯỜNG DÀI DÒNG) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '8px'
      }}>
        {BU_TABS.map((b) => {
          const isSelected = selectedBu === b.id;
          const isBU4 = b.id === 'BU4';
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBu(b.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 14px',
                borderRadius: '8px',
                border: isSelected ? '2px solid #0284c7' : '1px solid #e2e8f0',
                background: isSelected ? '#f0f9ff' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s',
                boxShadow: isSelected ? '0 2px 4px rgba(2, 132, 199, 0.12)' : 'none'
              }}
            >
              <span style={{
                fontSize: '0.88rem',
                fontWeight: isSelected ? 800 : 700,
                color: isSelected ? '#0284c7' : '#334155'
              }}>
                {b.name}
              </span>
              {b.id === 'ALL' ? (
                <span style={{
                  fontSize: '0.68rem',
                  background: isSelected ? '#e0f2fe' : '#f1f5f9',
                  color: isSelected ? '#0369a1' : '#64748b',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 600
                }}>
                  Tất cả
                </span>
              ) : isBU4 ? (
                <span style={{
                  fontSize: '0.68rem',
                  background: '#ecfdf5',
                  color: '#059669',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  border: '1px solid #a7f3d0'
                }}>
                  Đang áp dụng
                </span>
              ) : (
                <span style={{
                  fontSize: '0.68rem',
                  background: '#f8fafc',
                  color: '#94a3b8',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: 500,
                  border: '1px solid #e2e8f0'
                }}>
                  Trống link
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 4. DANH SÁCH CARD KẾ HOẠCH ── */}
      {selectedQuarter !== 'Q4_2026' ? (
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '48px 20px',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <h3 style={{ margin: '0 0 8px', color: '#1e293b', fontSize: '1.1rem' }}>
            Kế Hoạch Cho {currentQuarterInfo.label} Đang Được Chuẩn Bị
          </h3>
          <p style={{ margin: '0 0 16px', fontSize: '0.85rem' }}>
            Hiện tại hệ thống đang áp dụng đề án cho Quý 4/2026. Các quý tiếp theo sẽ được cập nhật khi các BU hoàn tất đề án.
          </p>
          <button
            onClick={() => setSelectedQuarter('Q4_2026')}
            style={{
              background: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Quay Về Quý 4/2026
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredPlans.length === 0 ? (
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '36px 20px',
              textAlign: 'center',
              color: '#64748b'
            }}>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>Không tìm thấy kế hoạch phù hợp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            filteredPlans.map((plan) => {
              if (plan.id === 'bu4') {
                // CARD CHI TIẾT BU4 (DUY NHẤT 1 BUTTON: XEM CHI TIẾT KẾ HOẠCH MỞ TAB RIÊNG)
                return (
                  <div
                    key={plan.id}
                    style={{
                      background: '#ffffff',
                      border: '2px solid #38bdf8',
                      borderRadius: '8px',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(2, 132, 199, 0.08)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px'
                    }}
                  >
                    {/* Header BU4 Card */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            background: plan.badgeBg,
                            color: plan.badgeColor,
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: '4px'
                          }}>
                            {plan.bu}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                            {plan.quarter} ({plan.period})
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            background: '#ecfdf5',
                            color: '#059669',
                            border: '1px solid #a7f3d0'
                          }}>
                            ● {plan.statusLabel}
                          </span>
                        </div>
                        <h3 style={{ margin: '6px 0 2px', fontSize: '1.18rem', fontWeight: 700, color: '#0f172a' }}>
                          {plan.title}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748b', maxWidth: '800px', lineHeight: '1.4' }}>
                          {plan.subtitle}
                        </p>
                      </div>

                      {/* CÁC NÚT HÀNH ĐỘNG: MÁY TÍNH & DATA CŨ + XEM CHI TIẾT KẾ HOẠCH */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* NÚT MÁY TÍNH & DATA CŨ (TRƯỚC NÚT XEM CHI TIẾT) */}
                        <a
                          href={`${plan.path}?tab=calculator`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#f0f9ff',
                            color: '#0284c7',
                            border: '1px solid #7dd3fc',
                            borderRadius: '6px',
                            padding: '9px 14px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'none',
                            boxShadow: '0 1px 2px rgba(2, 132, 199, 0.08)',
                            transition: 'all 0.15s'
                          }}
                        >
                          <Calculator size={15} color="#0284c7" />
                          <span>Máy Tính & Data Cũ</span>
                        </a>

                        {/* NÚT XEM CHI TIẾT KẾ HOẠCH */}
                        <a
                          href={plan.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '9px 16px',
                            fontSize: '0.84rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            textDecoration: 'none',
                            boxShadow: '0 2px 4px rgba(2, 132, 199, 0.25)'
                          }}
                        >
                          <span>Xem Chi Tiết Kế Hoạch</span>
                          <ArrowRight size={15} />
                        </a>
                      </div>
                    </div>

                    {/* 4 Chỉ số KPI nổi bật (Grid) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                      gap: '10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      padding: '12px 14px'
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Ngân Sách Kế Hoạch</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                          {fmt(plan.budget)} đ
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Kỳ Vọng Lead SĐT</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          {plan.expectedLeads}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{plan.expectedMessages}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Kỳ Vọng Khách (Pax)</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          {plan.expectedPaxAds}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#16a34a', fontWeight: 600 }}>Tổng nguồn: {plan.totalPaxOverall}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Doanh Thu Từ Ads</div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#16a34a', marginTop: '2px' }}>
                          {plan.adsRevenue}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Chi phí Ads: {plan.costRatio}</div>
                      </div>
                    </div>

                    {/* Các tuyến tour trọng điểm BU4 */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Phân Bổ Tuyến Trọng Điểm:
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
                        {plan.routes.map((r, rIdx) => (
                          <a
                            key={rIdx}
                            href={`${plan.path}?tab=${r.tab || 'bhutan'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              background: '#ffffff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              padding: '8px 10px',
                              fontSize: '0.78rem',
                              textDecoration: 'none',
                              color: 'inherit',
                              display: 'block',
                              transition: 'all 0.15s',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span>{r.name}</span>
                              <span style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>
                                {r.time} • Xem data & tính →
                              </span>
                            </div>
                            <div style={{ color: '#0284c7', fontWeight: 600, marginTop: '3px' }}>
                              {r.budget}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              {r.leads && <span>{r.leads} • </span>}
                              {r.pax && <span>{r.pax}</span>}
                              {r.cpl && <span> (CPL: {r.cpl})</span>}
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Điểm nhấn nổi bật */}
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Điểm nhấn:</div>
                      {plan.highlights.map((h, hIdx) => (
                        <div key={hIdx} style={{ fontSize: '0.74rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={12} color="#10b981" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>

                  </div>
                );
              }

              // CARD CHO CÁC BU TẠM ĐỂ TRỐNG LINK (BU1, BU2, BU3, BU5)
              return (
                <div
                  key={plan.id}
                  style={{
                    background: '#ffffff',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    opacity: 0.85
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {plan.bu}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        Quý 4/2026
                      </span>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        background: '#f1f5f9',
                        color: '#94a3b8',
                        border: '1px solid #e2e8f0'
                      }}>
                        {plan.statusLabel}
                      </span>
                    </div>
                    <h4 style={{ margin: '0 0 2px', fontSize: '0.96rem', fontWeight: 600, color: '#334155' }}>
                      {plan.title}
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                      {plan.subtitle}
                    </p>
                  </div>

                  <div>
                    <span style={{
                      fontSize: '0.78rem',
                      color: '#94a3b8',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontWeight: 500,
                      display: 'inline-block'
                    }}>
                      Trống link (Thêm sau)
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
