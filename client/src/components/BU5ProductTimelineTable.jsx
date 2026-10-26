import React, { useState } from 'react';
import { Calendar, ExternalLink, Sparkles, Compass, MapPin, Info } from 'lucide-react';
import { getCategoryBadgeStyle } from '../data/bu5MarketingMasterPlan';

// 15 mốc tháng từ Google Sheet Tab "Timeline theo tháng" (gid=2106737229)
export const TIMELINE_MONTHS = [
  { key: '10/26', label: '10/26', year: 2026, isPrep: true },
  { key: '11/26', label: '11/26', year: 2026, isPrep: true },
  { key: '12/26', label: '12/26', year: 2026, isPrep: true },
  { key: '01/27', label: '01/27', year: 2027, isPrep: false },
  { key: '02/27', label: '02/27', year: 2027, isPrep: false, holiday: '🧧 Tết' },
  { key: '03/27', label: '03/27', year: 2027, isPrep: false },
  { key: '04/27', label: '04/27', year: 2027, isPrep: false, holiday: '🏖️ 30/4' },
  { key: '05/27', label: '05/27', year: 2027, isPrep: false },
  { key: '06/27', label: '06/27', year: 2027, isPrep: false },
  { key: '07/27', label: '07/27', year: 2027, isPrep: false },
  { key: '08/27', label: '08/27', year: 2027, isPrep: false, holiday: '🇻🇳 2/9' },
  { key: '09/27', label: '09/27', year: 2027, isPrep: false, holiday: '🇻🇳 2/9' },
  { key: '10/27', label: '10/27', year: 2027, isPrep: false },
  { key: '11/27', label: '11/27', year: 2027, isPrep: false },
  { key: '12/27', label: '12/27', year: 2027, isPrep: false }
];

// 11 Tuyến sản phẩm chính xác theo Google Sheet BU5 Tab Timeline
export const PRODUCT_TIMELINE_ROWS = [
  {
    stt: 1,
    id: 'pakistan',
    name: 'Pakistan',
    fullName: 'Pakistan - Mùa Hoa Anh Đào & Thu Hunza',
    category: 'Tuyến trụ cột',
    icon: '🏔️',
    color: '#16a34a',
    note: 'Mùa hoa (T3-4) và Mùa thu (T10-12) là hai campaign độc lập',
    departures: {
      '10/26': 1,
      '03/27': 1,
      '04/27': 1,
      '10/27': 1,
      '11/27': 1,
      '12/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 2,
    id: 'aicap',
    name: 'Ai Cập',
    fullName: 'Ai Cập Huyền Bí & Du Thuyền Nile 5 Sao',
    category: 'Tuyến trụ cột',
    icon: '☀️',
    color: '#d97706',
    note: 'Tạo nền sản phẩm; ưu tiên mùa thu, cuối năm, Tết & 30/4',
    departures: {
      '11/26': 1,
      '12/26': 1,
      '02/27': 1,
      '04/27': 1,
      '11/27': 1,
      '12/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 3,
    id: 'maroc',
    name: 'Maroc',
    fullName: 'Maroc - Viên Ngọc Bắc Phi & Sa Mạc Sahara',
    category: 'Tuyến trụ cột',
    icon: '🏜️',
    color: '#e11d48',
    note: 'Văn hóa & sa mạc thời tiết đẹp; ưu tiên Tết và 30/4',
    departures: {
      '11/26': 1,
      '02/27': 1,
      '03/27': 1,
      '04/27': 1,
      '11/27': 1,
      '12/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 4,
    id: 'nga',
    name: 'Nga - Bắc Cực Quang',
    fullName: 'Nga - Săn Cực Quang Murmansk & Moscow - St. Petersburg',
    category: 'Tuyến mùa vụ',
    icon: '❄️',
    color: '#0284c7',
    note: 'Trải nghiệm Bắc Cực; gom đoàn cao điểm mùa đông',
    departures: {
      '02/27': 1,
      '12/27': 1
    },
    totalGroups: 2
  },
  {
    stt: 5,
    id: 'baikal',
    name: 'Baikal',
    fullName: 'Hồ Baikal Mùa Đông Băng Tuyết',
    category: 'Tuyến mùa vụ',
    icon: '🧊',
    color: '#06b6d4',
    note: 'Sản phẩm thử nghiệm mùa đông băng tuyết đặc thù',
    departures: {
      '02/27': 1,
      '03/27': 1
    },
    totalGroups: 2
  },
  {
    stt: 6,
    id: 'mongco',
    name: 'Mông Cổ',
    fullName: 'Mông Cổ - Thảo Nguyên Bất Tận & Sa Mạc Gobi',
    category: 'Tuyến trụ cột',
    icon: '🐎',
    color: '#059669',
    note: 'Sản phẩm volume chủ lực mùa hè (T6-T9), tổng 6 đoàn',
    departures: {
      '06/27': 1,
      '07/27': 2,
      '08/27': 2,
      '09/27': 1
    },
    totalGroups: 6
  },
  {
    stt: 7,
    id: 'trunga',
    name: 'Trung Á',
    category: 'Tuyến mùa vụ',
    icon: '🏛️',
    color: '#8b5cf6',
    note: 'Con đường tơ lụa 5 nước mùa hè từ tháng 6 đến tháng 9',
    departures: {
      '04/27': 1,
      '06/27': 1,
      '07/27': 1,
      '08/27': 1
    },
    totalGroups: 4
  },
  {
    stt: 8,
    id: 'alaska',
    name: 'Alaska',
    fullName: 'Alaska - Vùng Cực Bắc Mỹ (Hè & Thu)',
    category: 'Tuyến định vị',
    icon: '🌲',
    color: '#0284c7',
    note: 'Thiên nhiên hoang dã premium; 2 đoàn (T7 hè & T8 lễ 2/9)',
    departures: {
      '07/27': 1,
      '08/27': 1
    },
    totalGroups: 2
  },
  {
    stt: 9,
    id: 'nammy',
    name: 'Nam Mỹ',
    fullName: 'Nam Mỹ Huyền Thoại (Brazil - Argentina - Peru - Chile)',
    category: 'Tuyến định vị',
    icon: '🗿',
    color: '#f59e0b',
    note: 'Đường xa đỉnh cao, tạo khác biệt; khởi hành mùa thu T9/2027',
    departures: {
      '09/27': 1
    },
    totalGroups: 1
  },
  {
    stt: 10,
    id: 'namibia',
    name: 'Namibia',
    fullName: 'Namibia - Wildlife Safari & Cồn Cát Đỏ Sossusvlei',
    category: 'Tuyến định vị',
    icon: '🦒',
    color: '#ea580c',
    note: 'Wildlife, sa mạc mùa lễ 2/9 phân khúc siêu cao cấp',
    departures: {
      '08/27': 1
    },
    totalGroups: 1
  },
  {
    stt: 11,
    id: 'bacmongco',
    name: 'Bắc Mông Cổ',
    fullName: 'Bắc Mông Cổ - Hồ Khovsgol & Bộ Tộc Tuần Lộc Tsaatan',
    category: 'Tuyến phát triển',
    icon: '🦌',
    color: '#475569',
    note: 'Mở rộng hệ sinh thái sản phẩm Mông Cổ mùa thu lá vàng',
    departures: {
      '09/27': 1,
      '10/27': 1
    },
    totalGroups: 2
  }
];

// Tổng số đoàn theo tháng chính xác 100% từ dòng 17 Google Sheet
export const MONTHLY_TOTAL_DEPARTURES = {
  '10/26': 1,
  '11/26': 2,
  '12/26': 1,
  '01/27': 0,
  '02/27': 4,
  '03/27': 3,
  '04/27': 4,
  '05/27': 0,
  '06/27': 2,
  '07/27': 4,
  '08/27': 5,
  '09/27': 3,
  '10/27': 2,
  '11/27': 3,
  '12/27': 4
};

export default function BU5ProductTimelineTable() {
  const [hoveredCell, setHoveredCell] = useState(null);

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
            <span style={{ fontSize: '1.2rem' }}>🗓️</span>
            <h2 style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              BU5 - TIMELINE SẢN PHẨM THEO THÁNG
            </h2>
          </div>
          <p style={{
            margin: '4px 0 0',
            color: '#94a3b8',
            fontSize: '0.8rem'
          }}>
            Kế hoạch tổng thể nhịp độ khởi hành 11 tuyến sản phẩm (15 tháng từ 10/2026 đến 12/2027)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#38bdf8',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            Tổng 38 lượt khởi hành (34 đoàn 2027 + 4 đoàn cuối 2026)
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/10kuQXdFgFLVSRS4CbKYa-ozuch6RnPJd8NTo36fFhrc/edit#gid=2106737229"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#059669',
              color: '#ffffff',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              textDecoration: 'none'
            }}
          >
            <span>Mở Sheet Timeline</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ── THANH CHÚ THÍCH VÀNG NHƯ GOOGLE SHEET (DÒNG 2 GOOGLE SHEET) ── */}
      <div style={{
        background: '#fef3c7',
        borderBottom: '1px solid #fde68a',
        padding: '8px 24px',
        fontSize: '0.78rem',
        color: '#78350f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={14} color="#b45309" />
          <span>
            <strong>Quy ước ô tính:</strong> Số trong ô là <em>số đoàn dự kiến khởi hành</em> trong tháng; ô trống là <em>không bố trí khởi hành</em>. Timeline phản ánh trực quan kế hoạch vận hành sản phẩm.
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '18px', height: '14px', borderRadius: '3px', background: '#dbeafe', border: '1px solid #93c5fd', display: 'inline-block' }} />
            <span>Có đoàn khởi hành</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '18px', height: '14px', borderRadius: '3px', background: '#fef3c7', border: '1px solid #f59e0b', display: 'inline-block' }} />
            <span>Tổng đoàn tháng</span>
          </span>
        </div>
      </div>

      {/* ── BẢNG TIMELINE SẢN PHẨM ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.84rem',
          textAlign: 'center'
        }}>
          {/* Header Bảng: Màu đen chuẩn Google Sheet */}
          <thead>
            <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '2px solid #334155' }}>
              <th style={{
                padding: '12px 10px',
                width: '36px',
                textAlign: 'center',
                borderRight: '1px solid #1e293b',
                fontWeight: 700
              }}>#</th>

              <th style={{
                padding: '12px 14px',
                minWidth: '180px',
                textAlign: 'left',
                borderRight: '2px solid #334155',
                fontWeight: 800,
                fontSize: '0.88rem'
              }}>
                Sản Phẩm
              </th>

              {/* 15 Cột Tháng */}
              {TIMELINE_MONTHS.map(tm => {
                const isPrep = tm.year === 2026;
                const isPeak = ['02/27', '04/27', '07/27', '08/27'].includes(tm.key);
                return (
                  <th
                    key={tm.key}
                    style={{
                      padding: '10px 4px',
                      minWidth: '58px',
                      borderRight: '1px solid #1e293b',
                      background: isPeak ? '#0f172a' : (isPrep ? '#1e293b' : '#000000'),
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      color: isPrep ? '#fbbf24' : (isPeak ? '#38bdf8' : '#ffffff')
                    }}>
                      {tm.label}
                    </div>
                    {tm.holiday && (
                      <div style={{
                        fontSize: '0.62rem',
                        fontWeight: 700,
                        color: tm.holiday.includes('Tết') ? '#f87171' : '#38bdf8',
                        marginTop: '2px'
                      }}>
                        {tm.holiday}
                      </div>
                    )}
                  </th>
                );
              })}

              <th style={{
                padding: '12px 10px',
                width: '80px',
                textAlign: 'center',
                background: '#0f172a',
                borderLeft: '2px solid #334155',
                fontWeight: 800,
                color: '#38bdf8'
              }}>
                Tổng Đoàn
              </th>
            </tr>
          </thead>

          {/* Body Bảng: 11 Tuyến Sản Phẩm */}
          <tbody>
            {PRODUCT_TIMELINE_ROWS.map((row, idx) => {
              const badgeStyle = getCategoryBadgeStyle(row.category);
              return (
                <tr
                  key={row.id}
                  style={{
                    background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <td style={{
                    padding: '10px 8px',
                    color: '#64748b',
                    fontWeight: 600,
                    borderRight: '1px solid #f1f5f9'
                  }}>
                    {row.stt}
                  </td>

                  {/* Cột Tên Sản Phẩm */}
                  <td style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    borderRight: '2px solid #e2e8f0',
                    fontWeight: 700,
                    color: '#0f172a',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1rem' }}>{row.icon}</span>
                      <span style={{ color: row.color, fontSize: '0.88rem' }}>{row.name}</span>
                      <span style={{
                        background: badgeStyle.bg,
                        color: badgeStyle.text,
                        border: `1px solid ${badgeStyle.border}`,
                        fontSize: '0.65rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {row.category}
                      </span>
                    </div>
                  </td>

                  {/* 15 Ô Tháng của Sản Phẩm */}
                  {TIMELINE_MONTHS.map(tm => {
                    const count = row.departures[tm.key] || 0;
                    const hasTour = count > 0;
                    const isCellHovered = hoveredCell === `${row.id}-${tm.key}`;

                    return (
                      <td
                        key={tm.key}
                        onMouseEnter={() => setHoveredCell(`${row.id}-${tm.key}`)}
                        onMouseLeave={() => setHoveredCell(null)}
                        style={{
                          padding: '6px 4px',
                          borderRight: '1px solid #f1f5f9',
                          background: hasTour ? (isCellHovered ? '#bfdbfe' : '#dbeafe') : (isCellHovered ? '#f1f5f9' : 'transparent'),
                          transition: 'all 0.1s ease',
                          cursor: hasTour ? 'pointer' : 'default'
                        }}
                        title={hasTour ? `${row.name}: ${count} đoàn cất cánh trong tháng ${tm.label}` : ''}
                      >
                        {hasTour ? (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '26px',
                            height: '24px',
                            borderRadius: '4px',
                            background: count > 1 ? '#2563eb' : '#3b82f6',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '0.82rem',
                            boxShadow: '0 1px 3px rgba(37, 99, 235, 0.25)'
                          }}>
                            {count}
                          </div>
                        ) : (
                          <span style={{ color: '#cbd5e1', fontSize: '0.75rem' }}>·</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Cột Tổng Số Đoàn của Tuyến */}
                  <td style={{
                    padding: '10px 8px',
                    textAlign: 'center',
                    fontWeight: 800,
                    color: '#0284c7',
                    background: '#f8fafc',
                    borderLeft: '2px solid #e2e8f0',
                    fontSize: '0.86rem'
                  }}>
                    {row.totalGroups} đoàn
                  </td>
                </tr>
              );
            })}

            {/* ── DÒNG TỔNG KẾT THEO THÁNG (DÒNG 17 GOOGLE SHEET) ── */}
            <tr style={{
              background: '#fef3c7',
              borderTop: '2px solid #f59e0b',
              fontWeight: 800,
              color: '#78350f'
            }}>
              <td colSpan={2} style={{
                padding: '12px 16px',
                textAlign: 'left',
                borderRight: '2px solid #fde68a',
                fontSize: '0.88rem'
              }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  Tổng số đoàn theo tháng:
                </span>
              </td>

              {/* 15 Giá trị Tổng Tháng */}
              {TIMELINE_MONTHS.map(tm => {
                const total = MONTHLY_TOTAL_DEPARTURES[tm.key] || 0;
                const isPeak = total >= 4;

                return (
                  <td
                    key={tm.key}
                    style={{
                      padding: '12px 4px',
                      borderRight: '1px solid #fde68a',
                      fontSize: '0.88rem',
                      fontWeight: 800,
                      color: total === 0 ? '#a16207' : (isPeak ? '#b45309' : '#78350f'),
                      background: isPeak ? '#fde68a' : '#fef3c7'
                    }}
                  >
                    {total}
                  </td>
                );
              })}

              {/* Tổng Cộng Toàn Bộ 15 Tháng */}
              <td style={{
                padding: '12px 8px',
                textAlign: 'center',
                background: '#fde68a',
                borderLeft: '2px solid #f59e0b',
                color: '#78350f',
                fontSize: '0.94rem',
                fontWeight: 800
              }}>
                38 đoàn
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── 3 THẺ ĐIỂM RƠI CÁC KỲ NGHỈ LỄ & TẾT (GHI CHÚ GOOGLE SHEET BÊN PHẢI) ── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '14px'
      }}>
        {/* Card 1: Tết Âm Lịch 2027 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🧧</span>
            <span style={{ fontWeight: 800, color: '#dc2626', fontSize: '0.86rem' }}>
              Tết Âm Lịch 2027 (Điểm rơi T02/2027)
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
            • <strong>Thời gian:</strong> Nghỉ 7 ngày (04/02 – 10/02/2027) hoặc 10 ngày (05/02 – 14/02/2027).<br />
            • <strong>4 đoàn cất cánh:</strong> Ai Cập Tết, Maroc Tết, Nga Murmansk (3 đoàn), Baikal mùa đông.
          </div>
        </div>

        {/* Card 2: Lễ 30/04 & 01/05 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🏖️</span>
            <span style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.86rem' }}>
              Lễ 30/04 – 01/05 (Điểm rơi T04/2027)
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
            • <strong>Thời gian:</strong> Nghỉ 4 ngày (Thứ 6 30/04 đến Thứ 2 03/05/2027).<br />
            • <strong>4 đoàn cất cánh:</strong> Pakistan (Hoa Anh Đào), Ai Cập lễ 30/4, Maroc mùa xuân, Trung Á.
          </div>
        </div>

        {/* Card 3: Lễ Quốc Khánh 2/9 */}
        <div style={{
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #fed7aa',
          padding: '12px 14px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🇻🇳</span>
            <span style={{ fontWeight: 800, color: '#ea580c', fontSize: '0.86rem' }}>
              Lễ Quốc Khánh 2/9 (Điểm rơi T08 – T09/2027)
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', color: '#475569', lineHeight: 1.45 }}>
            • <strong>Thời gian:</strong> Nghỉ 4 ngày (Thứ 5 02/09 đến Chủ nhật 05/09/2027).<br />
            • <strong>5 đoàn đỉnh cao:</strong> Alaska (Lễ 2/9), Namibia, Nam Mỹ, Bắc Mông Cổ, Mông Cổ mùa thu.
          </div>
        </div>
      </div>
    </div>
  );
}
