import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, Rocket, ExternalLink, Info, Compass, ShieldAlert } from 'lucide-react';

const fmtVND = (num) => {
  if (!num || isNaN(num) || num === 0) return '—';
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}\u00A0đ`;
};

export const BU5_SCENARIOS = [
  {
    id: 'cautious',
    name: 'Thận trọng',
    badge: 'Kịch bản tối thiểu',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    badgeBorder: '#fde68a',
    runRate: '80%',
    runRateNum: 0.8,
    groups: 24,
    paxPerGroup: 8,
    totalPax: 192,
    priceFactor: '0.98x',
    costFactor: '1.03x',
    revenue: 20718924800,
    profit: 2028677326,
    margin: 9.8,
    action: 'Ưu tiên tuyến trụ cột; dừng sản phẩm chưa đạt ngưỡng',
    color: '#d97706',
    accentBg: '#fffbeb',
    borderColor: '#fde68a',
    icon: ShieldAlert,
    highlights: [
      'Áp dụng khi thị trường trầm lắng hoặc visa khó khăn',
      'Giảm 6 đoàn so với kế hoạch (chạy 24/30 đoàn)',
      'Lợi nhuận vẫn đạt ~2.03 Tỷ đ (Biên LN 9.8%) an toàn'
    ]
  },
  {
    id: 'base',
    name: 'Cơ sở',
    badge: 'Kế hoạch đã duyệt',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    badgeBorder: '#bae6fd',
    isCurrentPlan: true,
    runRate: '100%',
    runRateNum: 1.0,
    groups: 30,
    paxPerGroup: 10,
    totalPax: 300,
    priceFactor: '1.00x',
    costFactor: '1.00x',
    revenue: 33034000000,
    profit: 4681076040,
    margin: 14.2,
    action: 'Triển khai đúng kế hoạch sản phẩm đã duyệt',
    color: '#0284c7',
    accentBg: '#f0f9ff',
    borderColor: '#bae6fd',
    icon: CheckCircle2,
    highlights: [
      'Kế hoạch mục tiêu chính thức trình Ban Giám Đốc',
      'Định mức 10 khách/đoàn • 30 đoàn toàn bộ 11 tuyến',
      'Lợi nhuận gộp đạt 4.68 Tỷ đ (Biên LN chuẩn: 14.2%)'
    ]
  },
  {
    id: 'growth',
    name: 'Tăng trưởng',
    badge: 'Kịch bản bứt phá',
    badgeBg: '#dcfce7',
    badgeColor: '#166534',
    badgeBorder: '#bbf7d0',
    runRate: '109%',
    runRateNum: 1.09,
    groups: 33,
    paxPerGroup: 12,
    totalPax: 396,
    priceFactor: '1.00x',
    costFactor: '0.98x',
    revenue: 43208472000,
    profit: 6864559951,
    margin: 15.9,
    action: 'Mở thêm đoàn khi booking/waitlist và năng lực vận hành đáp ứng',
    color: '#16a34a',
    accentBg: '#f0fdf4',
    borderColor: '#bbf7d0',
    icon: Rocket,
    highlights: [
      'Khai thác tối đa năng lực khi nhu cầu tour độc bản tăng vọt',
      'Mở thêm 3 đoàn dự phòng (tổng 33 đoàn) & đẩy lên 12 pax/đoàn',
      'Doanh thu vượt 43.2 Tỷ đ • Lợi nhuận bứt phá 6.86 Tỷ đ (15.9%)'
    ]
  }
];

export default function BU5BusinessScenariosTable() {
  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #cbd5e1',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden',
      marginBottom: '36px'
    }}>
      {/* ── BANNER TIÊU ĐỀ CHUẨN GOOGLE SHEET BU5 ── */}
      <div style={{
        background: '#000000',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎯</span>
            <h2 style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              BU5 - KỊCH BẢN KINH DOANH
            </h2>
          </div>
          <p style={{
            margin: '4px 0 0',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            fontStyle: 'italic'
          }}>
            Ba kịch bản dựa trên số đoàn thực chạy và khách bình quân. Doanh thu/lợi nhuận lấy theo giá bán và chi phí đã nhập trong tab P&amp;L sản phẩm.
          </p>
        </div>

        <a
          href="https://docs.google.com/spreadsheets/d/10kuQXdFgFLVSRS4CbKYa-ozuch6RnPJd8NTo36fFhrc/edit#gid=1540002078"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.12)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '7px 14px',
            borderRadius: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textDecoration: 'none',
            backdropFilter: 'blur(4px)',
            transition: 'background 0.2s'
          }}
        >
          <span>Mở Tab Kịch Bản Trên Sheet</span>
          <ExternalLink size={13} color="#ffffff" />
        </a>
      </div>

      {/* ── 3 THẺ TỔNG QUAN 3 KỊCH BẢN ── */}
      <div style={{
        padding: '20px 24px 10px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px',
        background: '#f8fafc',
        borderBottom: '1px solid #e2e8f0'
      }}>
        {BU5_SCENARIOS.map((sc) => {
          const Icon = sc.icon;
          return (
            <div
              key={sc.id}
              style={{
                background: sc.accentBg,
                border: `1.5px solid ${sc.borderColor}`,
                borderRadius: '10px',
                padding: '16px 18px',
                position: 'relative',
                boxShadow: sc.isCurrentPlan ? '0 4px 12px rgba(2, 132, 199, 0.12)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Icon size={18} color={sc.color} />
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                    {sc.name}
                  </span>
                </div>
                <span style={{
                  background: sc.badgeBg,
                  color: sc.badgeColor,
                  border: `1px solid ${sc.badgeBorder}`,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}>
                  {sc.badge}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '12px 0 10px' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Doanh thu dự kiến</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: sc.color, whiteSpace: 'nowrap' }}>
                    {fmtVND(sc.revenue)}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Lợi nhuận dự kiến</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap' }}>
                    {fmtVND(sc.profit)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.76rem',
                color: '#475569',
                borderTop: '1px dashed rgba(0,0,0,0.1)',
                paddingTop: '8px',
                marginTop: '8px'
              }}>
                <span>Quy mô: <strong>{sc.groups} đoàn • {sc.totalPax} pax</strong></span>
                <span style={{
                  background: sc.color,
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: 800,
                  fontSize: '0.74rem'
                }}>
                  Biên LN: {sc.margin}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BẢNG CHI TIẾT ĐỐI CHIẾU 100% CẤU TRÚC GOOGLE SHEET ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: '#000000', color: '#ffffff', textAlign: 'center' }}>
              <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: '130px', fontWeight: 800 }}>Kịch bản</th>
              <th style={{ padding: '12px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>Tỷ lệ đoàn thực chạy</th>
              <th style={{ padding: '12px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>Số đoàn</th>
              <th style={{ padding: '12px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>Khách/đoàn</th>
              <th style={{ padding: '12px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>Tổng khách</th>
              <th style={{ padding: '12px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>Hệ số giá bán</th>
              <th style={{ padding: '12px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>Hệ số chi phí</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>Doanh thu dự kiến</th>
              <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>Lợi nhuận dự kiến</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', minWidth: '240px', fontWeight: 700 }}>Hướng xử lý</th>
            </tr>
          </thead>
          <tbody>
            {BU5_SCENARIOS.map((sc, idx) => {
              // Highlight màu nền ô vàng theo đúng thiết kế Google Sheet (input costing)
              const yellowCell = { background: '#fef3c7', fontWeight: 700, color: '#92400e' };
              const isBaseRow = sc.id === 'base';

              return (
                <tr
                  key={sc.id}
                  style={{
                    background: isBaseRow ? '#f0f9ff' : idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background 0.15s'
                  }}
                >
                  {/* Cột 1: Kịch bản */}
                  <td style={{
                    padding: '14px 14px',
                    fontWeight: 800,
                    color: isBaseRow ? '#0284c7' : '#0f172a',
                    borderLeft: `4px solid ${sc.color}`
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{sc.name}</span>
                      {isBaseRow && (
                        <span style={{
                          background: '#0284c7',
                          color: '#ffffff',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontSize: '0.68rem',
                          fontWeight: 700
                        }}>
                          CHUẨN
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cột 2: Tỷ lệ đoàn thực chạy (ô vàng) */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', ...yellowCell }}>
                    {sc.runRate}
                  </td>

                  {/* Cột 3: Số đoàn */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                    {sc.groups}
                  </td>

                  {/* Cột 4: Khách/đoàn (ô vàng) */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', ...yellowCell }}>
                    {sc.paxPerGroup}
                  </td>

                  {/* Cột 5: Tổng khách */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', fontWeight: 700, color: '#0f172a' }}>
                    {sc.totalPax}
                  </td>

                  {/* Cột 6: Hệ số giá bán (ô vàng) */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', ...yellowCell }}>
                    {sc.priceFactor}
                  </td>

                  {/* Cột 7: Hệ số chi phí (ô vàng) */}
                  <td style={{ padding: '14px 12px', textAlign: 'center', ...yellowCell }}>
                    {sc.costFactor}
                  </td>

                  {/* Cột 8: Doanh thu dự kiến */}
                  <td style={{
                    padding: '14px 14px',
                    textAlign: 'right',
                    fontWeight: 800,
                    color: sc.color,
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}>
                    {fmtVND(sc.revenue)}
                  </td>

                  {/* Cột 9: Lợi nhuận dự kiến */}
                  <td style={{
                    padding: '14px 14px',
                    textAlign: 'right',
                    fontWeight: 800,
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    fontSize: '0.9rem'
                  }}>
                    {fmtVND(sc.profit)}
                    <span style={{
                      display: 'block',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: sc.color
                    }}>
                      (Biên LN: {sc.margin}%)
                    </span>
                  </td>

                  {/* Cột 10: Hướng xử lý */}
                  <td style={{ padding: '14px 16px', color: '#334155', lineHeight: 1.45, fontSize: '0.82rem' }}>
                    {sc.action}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER GHI CHÚ ĐIỀU HÀNH ── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={14} color="#0284c7" />
          <span>
            Ô màu vàng (<span style={{ background: '#fef3c7', padding: '1px 6px', borderRadius: '3px', color: '#92400e', fontWeight: 700 }}>#fef3c7</span>) là thông số giả định vận hành. Doanh thu và lợi nhuận tự động tính theo định mức tab <strong>P&amp;L Sản Phẩm</strong>.
          </span>
        </div>
        <div>
          Trọng số Kế Hoạch 2027: <strong>Kịch Bản Cơ Sở (100% đoàn • 300 khách • DT 33.03 Tỷ)</strong>
        </div>
      </div>
    </div>
  );
}
