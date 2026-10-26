import React, { useMemo, useState } from 'react';
import {
  CalendarRange,
  DollarSign,
  TrendingUp,
  Sparkles,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  PieChart as PieIcon,
  ArrowRight,
  ShieldCheck,
  Layers,
  Info
} from 'lucide-react';

const QUARTERS_DEF = [
  {
    key: 'Q4_2026',
    name: 'Quý 4/2026',
    sub: 'Chạy trước & Chuẩn bị',
    badge: 'Tiền mồi (Seed)',
    months: ['2026-09', '2026-10', '2026-11', '2026-12'],
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    badgeBg: '#fef3c7',
    badgeColor: '#92400e',
    focus: 'Gieo hạt & Gom khách sớm cho Murmansk, Nam Mỹ 330tr, Alaska & Tết'
  },
  {
    key: 'Q1_2027',
    name: 'Quý 1/2027',
    sub: 'Đỉnh điểm Marketing',
    badge: 'Đỉnh chi tiền MKT',
    months: ['2027-01', '2027-02', '2027-03'],
    color: '#dc2626',
    bg: '#fff1f2',
    border: '#fecdd3',
    badgeBg: '#fee2e2',
    badgeColor: '#9f1239',
    focus: 'Dồn lực Ads T2/2027 (35.3 Tr), chốt cọc tour 30/4 và khởi động hè'
  },
  {
    key: 'Q2_2027',
    name: 'Quý 2/2027',
    sub: 'Giữ nhịp & Hè',
    badge: 'Chốt khách Hè',
    months: ['2027-04', '2027-05', '2027-06'],
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    badgeBg: '#e0f2fe',
    badgeColor: '#0369a1',
    focus: 'Booking cao điểm Mông Cổ Naadam, Ladakh, Nga cung vàng'
  },
  {
    key: 'Q3_2027',
    name: 'Quý 3/2027',
    sub: 'Đỉnh Doanh Thu',
    badge: 'Bội thu 14.9 Tỷ DT',
    months: ['2027-07', '2027-08', '2027-09'],
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
    badgeBg: '#dcfce7',
    badgeColor: '#166534',
    focus: 'Khởi hành 11 đoàn cao điểm, giảm ngân sách Ads, tối ưu chốt cọc'
  },
  {
    key: 'Q4_2027',
    name: 'Quý 4/2027',
    sub: 'Về đích & Đóng sổ',
    badge: 'Đóng sổ kế hoạch',
    months: ['2027-10', '2027-11', '2027-12'],
    color: '#475569',
    bg: '#f8fafc',
    border: '#cbd5e1',
    badgeBg: '#f1f5f9',
    badgeColor: '#1e293b',
    focus: 'Hoàn tất 4 đoàn Pakistan mùa thu & kết chuyển quỹ sang năm 2028'
  }
];

export default function BU5QuarterlyMktReport({
  departures = [],
  monthlyTotals = {},
  monthlyDepartureRevenues = {},
  monthlyDeparturesCount = {},
  monthlyActiveTours = {},
  fmt = (v) => `${(v || 0).toLocaleString('vi-VN')}\u00A0đ`,
  fmtShort = (v) => `${((v || 0) / 1000000).toFixed(1)}\u00A0tr`,
  getCategoryBadgeStyle = () => ({ bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' })
}) {
  const [selectedQuarterKey, setSelectedQuarterKey] = useState('ALL');

  // 1. Tính toán tổng hợp ngân sách MKT & Doanh thu theo từng Quý
  const quarterSummaries = useMemo(() => {
    let totalAllMkt = 0;
    let totalAllRev = 0;
    let totalAllGroups = 0;

    const list = QUARTERS_DEF.map(q => {
      let qMkt = 0;
      let qRev = 0;
      let qGroups = 0;
      let qActiveTours = 0;

      q.months.forEach(m => {
        qMkt += (monthlyTotals[m] || 0);
        qRev += (monthlyDepartureRevenues[m] || 0);
        qGroups += (monthlyDeparturesCount[m] || 0);
        if ((monthlyActiveTours[m] || 0) > qActiveTours) {
          qActiveTours = monthlyActiveTours[m];
        }
      });

      totalAllMkt += qMkt;
      totalAllRev += qRev;
      totalAllGroups += qGroups;

      return {
        ...q,
        mkt: qMkt,
        rev: qRev,
        groups: qGroups,
        activeTours: qActiveTours
      };
    });

    // Bổ sung % tỷ trọng ngân sách
    return {
      list: list.map(q => ({
        ...q,
        mktPct: totalAllMkt > 0 ? ((q.mkt / totalAllMkt) * 100).toFixed(1) : '0.0'
      })),
      totalMkt: totalAllMkt,
      totalRev: totalAllRev,
      totalGroups: totalAllGroups
    };
  }, [monthlyTotals, monthlyDepartureRevenues, monthlyDeparturesCount, monthlyActiveTours]);

  // 2. Tính số tiền phân bổ theo từng quý cho từng departure
  const departuresWithQuarterly = useMemo(() => {
    return departures.map(dep => {
      const qAlloc = {};
      let totalAlloc = 0;

      QUARTERS_DEF.forEach(q => {
        const val = q.months.reduce((sum, m) => sum + (dep.monthlyAllocations?.[m] || 0), 0);
        qAlloc[q.key] = val;
        totalAlloc += val;
      });

      return {
        ...dep,
        quarterlyAllocations: qAlloc,
        calculatedTotalMkt: totalAlloc
      };
    });
  }, [departures]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ── BANNER GIỚI THIỆU PHÂN BỔ THEO QUÝ ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: '12px',
        padding: '18px 24px',
        border: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            width: '46px',
            height: '46px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
          }}>
            <CalendarRange size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                Bảng Phân Bổ Ngân Sách Marketing Theo Quý (Quarterly Budget Matrix)
              </h3>
              <span style={{
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                Quy Quỹ Tiền Mặt 5 Giai Đoạn
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>
              Nhóm toàn bộ 15 tháng tiến độ chiến dịch về <strong>5 Quý trọng yếu</strong> (Q4/2026 đến Q4/2027) giúp Ban Lãnh Đạo &amp; Phòng Kế Toán dễ dàng phê duyệt và chuẩn bị hạn mức tiền mặt giải ngân.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '8px 14px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>TỔNG QUỸ MKT 1%</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
              {fmt(quarterSummaries.totalMkt)}
            </div>
          </div>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '8px 14px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>TỔNG DOANH THU 27 ĐOÀN</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34d399' }}>
              {(quarterSummaries.totalRev / 1000000000).toFixed(2)} Tỷ đ
            </div>
          </div>
        </div>
      </div>

      {/* ── 5 THẺ TỔNG QUAN PHÂN TIỀN THEO QUÝ (CARDS) ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {quarterSummaries.list.map((q) => {
          return (
            <div
              key={q.key}
              style={{
                background: q.bg,
                border: `1.5px solid ${q.border}`,
                borderRadius: '10px',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.98rem', color: '#0f172a' }}>
                    {q.name}
                  </span>
                  <span style={{
                    background: q.badgeBg,
                    color: q.badgeColor,
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {q.badge}
                  </span>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '8px' }}>
                  {q.sub}
                </div>

                <div style={{
                  background: '#ffffff',
                  borderRadius: '6px',
                  padding: '8px 10px',
                  border: `1px solid ${q.border}`,
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Ngân sách MKT:</span>
                    <strong style={{ fontSize: '1.05rem', color: q.color, fontWeight: 800 }}>
                      {fmtShort(q.mkt)}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '3px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Tỷ trọng chi tiêu:</span>
                    <span style={{
                      background: q.color,
                      color: '#ffffff',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '8px'
                    }}>
                      {q.mktPct}%
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569', marginBottom: '3px' }}>
                  <span>Doanh thu khởi hành:</span>
                  <strong style={{ color: '#0f172a' }}>
                    {q.rev > 0 ? `${(q.rev / 1000000000).toFixed(2)} Tỷ` : '—'}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#475569' }}>
                  <span>Quy mô khởi hành:</span>
                  <strong>{q.groups > 0 ? `${q.groups} đoàn` : '0 đoàn (chuẩn bị)'}</strong>
                </div>
              </div>

              <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: `1px dashed ${q.border}`,
                fontSize: '0.71rem',
                color: '#64748b',
                lineHeight: 1.35
              }}>
                💡 <em>{q.focus}</em>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BẢNG MA TRẬN PHÂN BỔ MKT 27 ĐOÀN THEO QUÝ (SPREADSHEET CHUẨN) ── */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #cbd5e1',
        boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden'
      }}>
        {/* Table header bar */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
              Bảng Tiến Độ Giải Ngân Ngân Sách Marketing 27 Đoàn (Nhóm Theo 5 Quý)
            </span>
            <span style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              27 đoàn • DT 31.65 Tỷ
            </span>
          </div>

          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
            Định mức MKT chuẩn: <strong>1% Doanh thu</strong> • Phân bổ theo số tháng Lead Time cọc thực tế
          </div>
        </div>

        {/* Bảng cuộn dọc & ngang với Header & Footer Sticky */}
        <div style={{
          overflow: 'auto',
          maxHeight: 'calc(100vh - 200px)',
          position: 'relative',
          scrollbarWidth: 'thin',
          scrollbarColor: '#94a3b8 #f1f5f9'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', color: '#ffffff' }}>
              <tr>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', padding: '12px 10px', width: '38px', textAlign: 'center', borderRight: '1px solid #1e293b', borderBottom: '2px solid #334155' }}>
                  #
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', padding: '12px 14px', minWidth: '220px', borderRight: '1px solid #1e293b', borderBottom: '2px solid #334155' }}>
                  Tuyến / Sản Phẩm
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', padding: '12px 8px', width: '85px', textAlign: 'center', borderRight: '1px solid #1e293b', borderBottom: '2px solid #334155' }}>
                  Khởi Hành
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', padding: '12px 8px', width: '55px', textAlign: 'center', borderRight: '1px solid #1e293b', borderBottom: '2px solid #334155' }}>
                  Đoàn
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', padding: '12px 12px', minWidth: '110px', textAlign: 'right', borderRight: '1px solid #1e293b', borderBottom: '2px solid #334155', whiteSpace: 'nowrap' }}>
                  Doanh Thu
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#1e293b', padding: '12px 12px', minWidth: '115px', textAlign: 'right', borderRight: '1px solid #1e293b', borderBottom: '2px solid #334155', color: '#38bdf8', whiteSpace: 'nowrap' }}>
                  Tổng MKT 1%
                </th>
                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', padding: '12px 8px', width: '70px', textAlign: 'center', borderRight: '2px solid #334155', borderBottom: '2px solid #334155' }}>
                  Chạy Trước
                </th>

                {/* 5 Cột Quý */}
                {QUARTERS_DEF.map(q => (
                  <th
                    key={q.key}
                    style={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 20,
                      background: q.key === 'Q1_2027' ? '#1e293b' : '#0f172a',
                      padding: '10px 12px',
                      minWidth: '120px',
                      textAlign: 'right',
                      borderRight: '1px solid #1e293b',
                      borderBottom: '2px solid #334155'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: q.color === '#475569' ? '#ffffff' : q.color }}>
                      {q.name}
                    </div>
                    <div style={{ fontSize: '0.62rem', color: '#94a3b8' }}>
                      {q.sub}
                    </div>
                  </th>
                ))}

                <th style={{ position: 'sticky', top: 0, zIndex: 20, background: '#0f172a', padding: '12px 10px', width: '90px', textAlign: 'center', borderBottom: '2px solid #334155' }}>
                  Tiến Độ
                </th>
              </tr>
            </thead>

            <tbody>
              {departuresWithQuarterly.map((dep, rIdx) => {
                const isZeroGroup = dep.groupsCount === 0;
                return (
                  <tr
                    key={dep.stt}
                    style={{
                      background: isZeroGroup ? '#f8fafc' : (rIdx % 2 === 0 ? '#ffffff' : '#fcfcfd'),
                      opacity: isZeroGroup ? 0.6 : 1,
                      borderBottom: '1px solid #f1f5f9'
                    }}
                  >
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                      {dep.stt}
                    </td>

                    <td style={{ padding: '10px 14px', borderRight: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: isZeroGroup ? '#64748b' : '#0f172a', fontSize: '0.86rem' }}>
                          {dep.prod?.icon} {dep.name}
                        </span>
                        {dep.category && (() => {
                          const badgeStyle = getCategoryBadgeStyle(dep.category);
                          return (
                            <span style={{
                              background: badgeStyle.bg,
                              color: badgeStyle.text,
                              border: `1px solid ${badgeStyle.border}`,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}>
                              {dep.category}
                            </span>
                          );
                        })()}
                      </div>
                      {dep.note && (
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', lineHeight: 1.35 }}>
                          • {dep.note}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 600, color: '#1e293b', borderRight: '1px solid #f1f5f9' }}>
                      {dep.displayTime}
                    </td>

                    <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: isZeroGroup ? '#94a3b8' : '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                      {dep.groupsCount > 0 ? dep.groupsCount : '-'}
                    </td>

                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: isZeroGroup ? '#94a3b8' : '#1e293b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      {dep.revenue > 0 ? fmtShort(dep.revenue) : '-'}
                    </td>

                    <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: isZeroGroup ? '#94a3b8' : '#0284c7', background: '#f8fafc', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                      {dep.mktBudget > 0 ? fmt(dep.mktBudget) : '-'}
                    </td>

                    <td style={{ padding: '10px 8px', textAlign: 'center', borderRight: '2px solid #e2e8f0' }}>
                      <span style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        border: '1px solid #fde68a',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        fontWeight: 700
                      }}>
                        {dep.leadMonths}T
                      </span>
                    </td>

                    {/* 5 Cột số tiền theo Quý */}
                    {QUARTERS_DEF.map(q => {
                      const val = dep.quarterlyAllocations?.[q.key] || 0;
                      const hasVal = val > 0;
                      return (
                        <td
                          key={q.key}
                          style={{
                            padding: '10px 12px',
                            textAlign: 'right',
                            borderRight: '1px solid #f1f5f9',
                            background: hasVal ? q.bg : 'transparent',
                            color: hasVal ? '#0f172a' : '#cbd5e1',
                            fontWeight: hasVal ? 700 : 400,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {hasVal ? (
                            <div>
                              <span>{fmtShort(val)}</span>
                              <div style={{ fontSize: '0.66rem', color: q.color, fontWeight: 600 }}>
                                {dep.mktBudget > 0 ? `${Math.round((val / dep.mktBudget) * 100)}%` : ''}
                              </div>
                            </div>
                          ) : '—'}
                        </td>
                      );
                    })}

                    <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                      <span style={{
                        background: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #bbf7d0',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '0.68rem',
                        fontWeight: 700
                      }}>
                        100%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* ── STICKY FOOTER TỔNG HỢP TIỀN THEO QUÝ (3 TẦNG) ── */}
            <tfoot style={{ position: 'sticky', bottom: 0, zIndex: 15, background: '#0f172a', color: '#ffffff' }}>
              {/* Tầng 1: Tổng tiền MKT chi ra mỗi quý */}
              <tr style={{ height: '42px' }}>
                <td colSpan={6} style={{
                  position: 'sticky',
                  bottom: '64px',
                  zIndex: 16,
                  background: '#0f172a',
                  borderTop: '2px solid #38bdf8',
                  boxShadow: '0 -3px 8px rgba(0,0,0,0.22)',
                  padding: '10px 14px',
                  textAlign: 'right',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  color: '#38bdf8',
                  whiteSpace: 'nowrap'
                }}>
                  DỰ TOÁN NGÂN SÁCH MKT CẦN PHÂN BỔ THEO QUÝ (VNĐ):
                </td>
                <td style={{
                  position: 'sticky',
                  bottom: '64px',
                  zIndex: 16,
                  background: '#0f172a',
                  borderTop: '2px solid #38bdf8',
                  boxShadow: '0 -3px 8px rgba(0,0,0,0.22)',
                  padding: '10px 8px',
                  textAlign: 'center',
                  fontWeight: 700,
                  color: '#94a3b8',
                  fontSize: '0.75rem',
                  whiteSpace: 'nowrap'
                }}>
                  100%
                </td>

                {quarterSummaries.list.map(q => (
                  <td
                    key={q.key}
                    style={{
                      position: 'sticky',
                      bottom: '64px',
                      zIndex: 16,
                      background: '#0f172a',
                      borderTop: '2px solid #38bdf8',
                      boxShadow: '0 -3px 8px rgba(0,0,0,0.22)',
                      padding: '10px 12px',
                      textAlign: 'right',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      color: q.mkt >= 90000000 ? '#fde047' : '#38bdf8',
                      borderRight: '1px solid #1e293b',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {fmtShort(q.mkt)}
                  </td>
                ))}

                <td style={{
                  position: 'sticky',
                  bottom: '64px',
                  zIndex: 16,
                  background: '#0f172a',
                  borderTop: '2px solid #38bdf8',
                  boxShadow: '0 -3px 8px rgba(0,0,0,0.22)',
                  padding: '10px 8px',
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#34d399'
                }}>
                  {fmtShort(quarterSummaries.totalMkt)}
                </td>
              </tr>

              {/* Tầng 2: Tỷ trọng % ngân sách MKT mỗi quý */}
              <tr style={{ height: '32px' }}>
                <td colSpan={6} style={{
                  position: 'sticky',
                  bottom: '32px',
                  zIndex: 15,
                  background: '#1e293b',
                  borderTop: '1px solid #334155',
                  padding: '6px 14px',
                  textAlign: 'right',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  color: '#cbd5e1',
                  whiteSpace: 'nowrap'
                }}>
                  Tỷ trọng giải ngân Marketing (%):
                </td>
                <td style={{
                  position: 'sticky',
                  bottom: '32px',
                  zIndex: 15,
                  background: '#1e293b',
                  borderTop: '1px solid #334155',
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  color: '#94a3b8'
                }}>
                  —
                </td>

                {quarterSummaries.list.map(q => (
                  <td
                    key={q.key}
                    style={{
                      position: 'sticky',
                      bottom: '32px',
                      zIndex: 15,
                      background: '#1e293b',
                      borderTop: '1px solid #334155',
                      padding: '6px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      color: q.color === '#475569' ? '#ffffff' : q.color,
                      borderRight: '1px solid #334155',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {q.mktPct}%
                  </td>
                ))}

                <td style={{
                  position: 'sticky',
                  bottom: '32px',
                  zIndex: 15,
                  background: '#1e293b',
                  borderTop: '1px solid #334155',
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#34d399',
                  fontSize: '0.76rem'
                }}>
                  100%
                </td>
              </tr>

              {/* Tầng 3: Doanh thu khởi hành thực tế trong quý */}
              <tr style={{ height: '32px' }}>
                <td colSpan={6} style={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 15,
                  background: '#0f172a',
                  borderTop: '1px solid #334155',
                  padding: '6px 14px',
                  textAlign: 'right',
                  fontWeight: 600,
                  fontSize: '0.76rem',
                  color: '#94a3b8',
                  whiteSpace: 'nowrap'
                }}>
                  Doanh thu các đoàn khởi hành trong quý:
                </td>
                <td style={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 15,
                  background: '#0f172a',
                  borderTop: '1px solid #334155',
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontSize: '0.72rem',
                  color: '#64748b'
                }}>
                  —
                </td>

                {quarterSummaries.list.map(q => (
                  <td
                    key={q.key}
                    style={{
                      position: 'sticky',
                      bottom: 0,
                      zIndex: 15,
                      background: '#0f172a',
                      borderTop: '1px solid #334155',
                      padding: '6px 12px',
                      textAlign: 'right',
                      fontWeight: 700,
                      fontSize: '0.76rem',
                      color: q.rev > 0 ? '#34d399' : '#64748b',
                      borderRight: '1px solid #1e293b',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {q.rev > 0 ? `${(q.rev / 1000000000).toFixed(2)} Tỷ` : '—'}
                  </td>
                ))}

                <td style={{
                  position: 'sticky',
                  bottom: 0,
                  zIndex: 15,
                  background: '#0f172a',
                  borderTop: '1px solid #334155',
                  padding: '6px 8px',
                  textAlign: 'center',
                  fontWeight: 800,
                  color: '#34d399',
                  fontSize: '0.76rem'
                }}>
                  {(quarterSummaries.totalRev / 1000000000).toFixed(2)} Tỷ
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── NGUYÊN TẮC ĐIỀU PHỐI VỐN THỰC CHIẾN THEO QUÝ ── */}
      <div style={{
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color="#0284c7" />
          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>
            Quy Trình Điều Phối Dòng Tiền Marketing Theo Quý (Cash Allocation Playbook):
          </strong>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          fontSize: '0.78rem',
          color: '#475569'
        }}>
          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#d97706' }}>1. Quý 4/2026 (85.5 Tr - 27.0%):</strong>
            <p style={{ margin: '3px 0 0', lineHeight: 1.4 }}>
              Duyệt trước ngân sách hạt giống để Ads chạy liên tục cho các tour tuyến dài (visa 6-9 tháng). Dòng tiền lúc này chưa có cọc lớn, công ty ứng trước quỹ MKT.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#dc2626' }}>2. Quý 1/2027 (99.5 Tr - 31.4%):</strong>
            <p style={{ margin: '3px 0 0', lineHeight: 1.4 }}>
              Đỉnh điểm chi tiền MKT. Nhờ 8 đoàn Tết khởi hành thu về 9.68 Tỷ Doanh thu, dùng trực tiếp dòng tiền cọc của khách để bù đắp chi phí Ads mà không phải vay hạn mức.
            </p>
          </div>

          <div style={{ background: '#ffffff', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
            <strong style={{ color: '#16a34a' }}>3. Quý 3/2027 (41.5 Tr - Thu 14.88 Tỷ):</strong>
            <p style={{ margin: '3px 0 0', lineHeight: 1.4 }}>
              Tỷ suất hoàn vốn ròng cao nhất. Chi MKT giảm mạnh còn 13.1%, trong khi doanh thu đạt đỉnh nhờ 11 đoàn đồng loạt khởi hành trong mùa hè &amp; thu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
