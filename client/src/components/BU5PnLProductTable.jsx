import React, { useState } from 'react';
import { DollarSign, TrendingUp, ExternalLink, Info, CheckCircle2, AlertTriangle, ShieldCheck, Star, BarChart3, Table } from 'lucide-react';
import BU5PnLProductChart from './BU5PnLProductChart';

const fmtVND = (num) => {
  if (!num || isNaN(num) || num === 0) return '—';
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}\u00A0đ`;
};

export const BU5_PNL_PRODUCTS = [
  {
    stt: 1,
    name: 'Pakistan',
    groups: 4,
    paxPerGroup: 10,
    price: 74900000,
    cost: 67000000,
    fixedCost: null,
    totalPax: 40,
    revenue: 2996000000,
    totalCost: 2680000000,
    profit: 316000000,
    margin: 10.5,
    icon: '🏔️',
    color: '#16a34a',
    note: 'Mùa hoa anh đào & Thu Hunza',
    breakEvenPax: 6,
    isPillar: false
  },
  {
    stt: 2,
    name: 'Ai Cập',
    groups: 4,
    paxPerGroup: 10,
    price: 104900000,
    cost: 89372535,
    fixedCost: null,
    totalPax: 40,
    revenue: 4196000000,
    totalCost: 3574901400,
    profit: 621098600,
    margin: 14.8,
    icon: '☀️',
    color: '#d97706',
    note: 'Du thuyền sông Nile 5 sao (2 đoàn chuẩn + 2 đoàn mở rộng)',
    breakEvenPax: 6,
    isPillar: true
  },
  {
    stt: 3,
    name: 'Maroc',
    groups: 4,
    paxPerGroup: 10,
    price: 109000000,
    cost: 90175564,
    fixedCost: null,
    totalPax: 40,
    revenue: 4360000000,
    totalCost: 3607022560,
    profit: 752977440,
    margin: 17.3,
    icon: '🏜️',
    color: '#e11d48',
    note: 'Viên ngọc Bắc Phi & Sahara (3 đoàn chuẩn + 1 đoàn mở rộng)',
    breakEvenPax: 6,
    isPillar: true
  },
  {
    stt: 4,
    name: 'Nga - Bắc Cực Quang',
    groups: 3,
    paxPerGroup: 10,
    price: 165000000,
    cost: 140000000,
    fixedCost: null,
    totalPax: 30,
    revenue: 4950000000,
    totalCost: 4200000000,
    profit: 750000000,
    margin: 15.2,
    icon: '❄️',
    color: '#0284c7',
    note: 'Săn Cực Quang Murmansk mùa đông',
    breakEvenPax: 6,
    isPillar: true
  },
  {
    stt: 5,
    name: 'Baikal',
    groups: 0,
    paxPerGroup: 10,
    price: null,
    cost: null,
    fixedCost: null,
    totalPax: 0,
    revenue: 0,
    totalCost: 0,
    profit: 0,
    margin: 0.0,
    icon: '🧊',
    color: '#06b6d4',
    note: 'Thử nghiệm hồ băng (Dự phòng)',
    breakEvenPax: 6,
    isPillar: false
  },
  {
    stt: 6,
    name: 'Mông Cổ',
    groups: 6,
    paxPerGroup: 10,
    price: 78900000,
    cost: 68900000,
    fixedCost: null,
    totalPax: 60,
    revenue: 4734000000,
    totalCost: 4134000000,
    profit: 600000000,
    margin: 12.7,
    icon: '🐎',
    color: '#059669',
    note: 'Volume chủ lực mùa hè (T6-T9)',
    breakEvenPax: 6,
    isPillar: true
  },
  {
    stt: 7,
    name: 'Trung Á',
    groups: 4,
    paxPerGroup: 10,
    price: 80000000,
    cost: 72000000,
    fixedCost: null,
    totalPax: 40,
    revenue: 3200000000,
    totalCost: 2880000000,
    profit: 320000000,
    margin: 10.0,
    icon: '🏛️',
    color: '#8b5cf6',
    note: 'Con đường tơ lụa hè',
    breakEvenPax: 6,
    isPillar: false
  },
  {
    stt: 8,
    name: 'Alaska',
    groups: 2,
    paxPerGroup: 10,
    price: 215000000,
    cost: 185000000,
    fixedCost: null,
    totalPax: 20,
    revenue: 4300000000,
    totalCost: 3700000000,
    profit: 600000000,
    margin: 14.0,
    icon: '🌲',
    color: '#0284c7',
    note: 'Định vị hoang dã Bắc Mỹ đỉnh cao',
    breakEvenPax: 6,
    isPillar: true
  },
  {
    stt: 9,
    name: 'Nam Mỹ',
    groups: 1,
    paxPerGroup: 10,
    price: 330900000,
    cost: 270000000,
    fixedCost: null,
    totalPax: 10,
    revenue: 3309000000,
    totalCost: 2700000000,
    profit: 609000000,
    margin: 18.4,
    icon: '🗿',
    color: '#f59e0b',
    note: 'Đường xa đỉnh cao (Biên LN cao nhất 18.4%)',
    breakEvenPax: 5,
    isPillar: false
  },
  {
    stt: 10,
    name: 'Namibia',
    groups: 1,
    paxPerGroup: 10,
    price: null,
    cost: null,
    fixedCost: null,
    totalPax: 10,
    revenue: 0,
    totalCost: 0,
    profit: 0,
    margin: 0.0,
    icon: '🦒',
    color: '#ea580c',
    note: 'Chờ khóa costing đối tác landtour',
    breakEvenPax: 6,
    isPillar: false
  },
  {
    stt: 11,
    name: 'Bắc Mông Cổ',
    groups: 1,
    paxPerGroup: 10,
    price: 98900000,
    cost: 87700000,
    fixedCost: null,
    totalPax: 10,
    revenue: 989000000,
    totalCost: 877000000,
    profit: 112000000,
    margin: 11.3,
    icon: '🦌',
    color: '#475569',
    note: 'Tuần lộc Tsaatan mùa thu',
    breakEvenPax: 6,
    isPillar: false
  }
];

export const BU5_PNL_TOTAL = {
  groups: 30,
  pax: 300,
  revenue: 33034000000,
  totalCost: 28352923960,
  profit: 4681076040,
  margin: 14.2,
  mktBudget: 330340000,
  netMarginAfterMkt: 4350736040,
  netMarginPctAfterMkt: 13.17
};

export default function BU5PnLProductTable() {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'chart'
  const [activeTooltip, setActiveTooltip] = useState(null);

  const totalRev = BU5_PNL_TOTAL.revenue;
  const totalProfit = BU5_PNL_TOTAL.profit;

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
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <h2 style={{
              margin: 0,
              color: '#ffffff',
              fontSize: '1.15rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              BU5 - P&amp;L SẢN PHẨM &amp; ĐỊNH MỨC BIÊN LỢI NHUẬN
            </h2>
          </div>
          <p style={{
            margin: '4px 0 0',
            color: '#cbd5e1',
            fontSize: '0.8rem'
          }}>
            Bảng cơ cấu tài chính, giá vốn costing, doanh thu, lãi gộp và biên lợi nhuận % chuẩn 11 tuyến sản phẩm độc bản năm 2027
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* NÚT CHUYỂN ĐỔI BẢNG / BIỂU ĐỒ (EXECUTIVE VIEW SWITCHER) */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.22)',
            borderRadius: '8px',
            padding: '3px',
            gap: '3px'
          }}>
            <button
              onClick={() => setViewMode('table')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'table' ? '#0284c7' : 'transparent',
                color: viewMode === 'table' ? '#ffffff' : '#cbd5e1',
                boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <Table size={13} />
              <span>Bảng Tính P&amp;L</span>
            </button>

            <button
              onClick={() => setViewMode('chart')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'chart' ? '#0284c7' : 'transparent',
                color: viewMode === 'chart' ? '#ffffff' : '#cbd5e1',
                boxShadow: viewMode === 'chart' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <BarChart3 size={13} />
              <span>Biểu Đồ Trực Quan</span>
            </button>
          </div>

          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#34d399',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            Biên LN: 14.2% • Lãi gộp: 4.681 Tỷ • Sau MKT: 4.351 Tỷ
          </div>

          <a
            href="https://docs.google.com/spreadsheets/d/10kuQXdFgFLVSRS4CbKYa-ozuch6RnPJd8NTo36fFhrc/edit#gid=1049113920"
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
            <span>Mở Sheet P&amp;L</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* ── THẺ ĐỐI CHIẾU SỐ LIỆU 2 TẦNG (RECONCILIATION CARD) ── */}
      <div style={{
        background: '#0f172a',
        color: '#ffffff',
        padding: '12px 24px',
        borderBottom: '1px solid #334155',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', maxWidth: '820px' }}>
          <span style={{ fontSize: '1.05rem', marginTop: '1px' }}>📌</span>
          <div style={{ fontSize: '0.81rem', lineHeight: 1.5, color: '#e2e8f0' }}>
            <strong style={{ color: '#38bdf8' }}>Đối chiếu mô hình kế hoạch BU5:</strong> Lịch khởi hành thực tế là <strong style={{ color: '#34d399' }}>27 đoàn (31.65 Tỷ đ)</strong> đã chốt vé máy bay &amp; visa. Bảng P&amp;L bên dưới mô hình hóa trần công suất tối đa <strong style={{ color: '#38bdf8' }}>30 đoàn (33.03 Tỷ đ)</strong>, bao gồm <strong>3 đoàn mở rộng dự phòng (+2 Ai Cập &amp; +1 Maroc)</strong> khi lượng khách booking vượt chỉ tiêu.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '6px', padding: '4px 10px', fontSize: '0.74rem' }}>
            <span style={{ color: '#94a3b8' }}>Lịch thực tế:</span> <strong style={{ color: '#34d399' }}>27 đoàn • 31.65 Tỷ</strong>
          </div>
          <div style={{ background: '#1e293b', border: '1px solid #0284c7', borderRadius: '6px', padding: '4px 10px', fontSize: '0.74rem' }}>
            <span style={{ color: '#94a3b8' }}>Trần P&amp;L:</span> <strong style={{ color: '#38bdf8' }}>30 đoàn • 33.03 Tỷ</strong>
          </div>
        </div>
      </div>

      {/* ── THANH CHÚ THÍCH Ô MÀU VÀNG & QUY ƯỚC TÀI CHÍNH ── */}
      <div style={{
        background: '#fffbeb',
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
            <strong>Quy ước tài chính:</strong> Nền vàng nhạt <em>(Giá bán, Cost/khách)</em> lấy từ Costing chi tiết. <strong>Lãi gộp (Gross Profit)</strong> = Doanh thu - Chi phí trực tiếp. Ngưỡng hòa vốn chuẩn an toàn: <strong>6 khách/đoàn</strong>.
          </span>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#92400e', fontWeight: 600 }}>
          ⭐ Tuyến Trụ Cột: Doanh thu &gt; 4 Tỷ / tuyến (Nga Murmansk, Mông Cổ, Maroc, Alaska, Ai Cập)
        </div>
      </div>

      {/* NỘI DUNG HIỂN THỊ THEO CHẾ ĐỘ (BẢNG TÍNH HOẶC BIỂU ĐỒ) */}
      {viewMode === 'chart' ? (
        <BU5PnLProductChart />
      ) : (
        <>
          {/* ── BẢNG P&L 12 CỘT CHUẨN XÁC VỚI PARETO & BREAK-EVEN ── */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.84rem'
            }}>
              <thead>
                <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '2px solid #334155' }}>
                  <th style={{ padding: '12px 10px', textAlign: 'center', width: '38px', borderRight: '1px solid #1e293b' }}>STT</th>
                  <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: '220px', borderRight: '1px solid #1e293b' }}>
                    <div>Sản phẩm</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 400 }}>Tỷ trọng DT &amp; Hòa vốn</div>
                  </th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', width: '70px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>Số đoàn</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', width: '85px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>Khách/đoàn</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '125px', borderRight: '1px solid #1e293b', background: '#1c1917', color: '#fde047', whiteSpace: 'nowrap' }}>Giá bán/khách</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '125px', borderRight: '1px solid #1e293b', background: '#1c1917', color: '#fde047', whiteSpace: 'nowrap' }}>Cost/khách</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center', width: '80px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>CP cố định</th>
                  <th style={{ padding: '12px 10px', textAlign: 'center', width: '85px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>Tổng khách</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '135px', borderRight: '1px solid #1e293b', color: '#38bdf8', whiteSpace: 'nowrap' }}>Doanh thu</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '135px', borderRight: '1px solid #1e293b', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Tổng chi phí</th>
                  <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '135px', borderRight: '1px solid #1e293b', color: '#34d399', whiteSpace: 'nowrap' }}>
                    <div>Lãi Gộp Kế Hoạch</div>
                    <div style={{ fontSize: '0.68rem', color: '#86efac', fontWeight: 500 }}>(Gross Profit)</div>
                  </th>
                  <th style={{ padding: '12px 12px', textAlign: 'center', width: '90px', background: '#0284c7', color: '#ffffff', fontWeight: 800, whiteSpace: 'nowrap' }}>Biên LN</th>
                </tr>
              </thead>
              <tbody>
                {BU5_PNL_PRODUCTS.map((prod, idx) => {
                  const isZero = prod.groups === 0 || prod.revenue === 0;
                  const hasHighMargin = prod.margin >= 15.0;
                  const pctRev = totalRev > 0 ? ((prod.revenue / totalRev) * 100).toFixed(1) : '0.0';
                  const pctProfit = totalProfit > 0 ? ((prod.profit / totalProfit) * 100).toFixed(1) : '0.0';

                  return (
                    <tr
                      key={prod.stt}
                      style={{
                        background: isZero ? '#f8fafc' : (idx % 2 === 0 ? '#ffffff' : '#fafafa'),
                        opacity: isZero ? 0.65 : 1,
                        borderBottom: '1px solid #e2e8f0',
                        transition: 'background 0.1s ease'
                      }}
                    >
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                        {prod.stt}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{prod.icon}</span>
                            <span style={{ color: prod.color, fontSize: '0.88rem' }}>{prod.name}</span>
                          </div>
                          {prod.isPillar && (
                            <span style={{
                              background: '#fef3c7',
                              color: '#92400e',
                              border: '1px solid #fde68a',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              whiteSpace: 'nowrap'
                            }}>
                              ⭐ Trụ Cột
                            </span>
                          )}
                        </div>

                        {/* Thanh tỷ trọng đóng góp Pareto % Doanh thu & Ngưỡng hòa vốn */}
                        {!isZero && (
                          <div style={{ marginTop: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.71rem', color: '#64748b', marginBottom: '3px' }}>
                              <span>Tỷ trọng: <strong style={{ color: '#0284c7' }}>{pctRev}% DT</strong> • <strong style={{ color: '#16a34a' }}>{pctProfit}% Lãi</strong></span>
                              <span style={{
                                background: '#f1f5f9',
                                color: '#334155',
                                padding: '1px 5px',
                                borderRadius: '3px',
                                fontWeight: 600,
                                fontSize: '0.68rem'
                              }} title="Cần tối thiểu số khách này để hòa vốn vé máy bay Leader & xe riêng">
                                Hòa vốn: ≥{prod.breakEvenPax}p
                              </span>
                            </div>
                            {/* Mini Progress Bar */}
                            <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div style={{ width: `${pctRev}%`, height: '100%', background: prod.color, borderRadius: '2px' }} />
                            </div>
                          </div>
                        )}

                        {prod.note && (
                          <div style={{ fontSize: '0.71rem', color: '#64748b', fontWeight: 400, marginTop: '4px' }}>
                            {prod.note}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                        {prod.groups}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                        {prod.paxPerGroup}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 600, background: '#fffbeb', borderRight: '1px solid #fef3c7', whiteSpace: 'nowrap' }}>
                        {fmtVND(prod.price)}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 600, background: '#fffbeb', borderRight: '1px solid #fef3c7', whiteSpace: 'nowrap', color: '#78350f' }}>
                        {fmtVND(prod.cost)}
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', color: '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                        —
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'center', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                        {prod.totalPax}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {fmtVND(prod.revenue)}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 600, color: '#64748b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {fmtVND(prod.totalCost)}
                      </td>
                      <td style={{ padding: '12px 12px', textAlign: 'right', fontWeight: 800, color: '#16a34a', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                        {fmtVND(prod.profit)}
                      </td>
                      {/* CỘT BIÊN LỢI NHUẬN (%) NỔI BẬT */}
                      <td style={{
                        padding: '12px 12px',
                        textAlign: 'center',
                        fontWeight: 800,
                        color: isZero ? '#94a3b8' : (hasHighMargin ? '#15803d' : '#0369a1'),
                        background: isZero ? '#f8fafc' : (hasHighMargin ? '#f0fdf4' : '#f0f9ff'),
                        whiteSpace: 'nowrap'
                      }}>
                        {prod.margin > 0 ? `${prod.margin.toFixed(1)}%` : '0.0%'}
                      </td>
                    </tr>
                  );
                })}

                {/* DÒNG 1: TỔNG LÃI GỘP SẢN PHẨM (GROSS PROFIT) */}
                <tr style={{
                  background: '#f0f9ff',
                  borderTop: '2px solid #0284c7',
                  fontWeight: 800,
                  color: '#0f172a'
                }}>
                  <td colSpan={2} style={{ padding: '14px 16px', textAlign: 'left', borderRight: '1px solid #bae6fd', fontSize: '0.86rem' }}>
                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.02em', color: '#0369a1' }}>
                      1. TỔNG LÃI GỘP SẢN PHẨM (GROSS PROFIT)
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400 }}>
                      Trước khi phân bổ ngân sách Marketing và chi phí văn phòng
                    </div>
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.94rem' }}>
                    {BU5_PNL_TOTAL.groups}
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #bae6fd', color: '#64748b' }}>
                    10p
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', borderRight: '1px solid #bae6fd' }}>
                    —
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', borderRight: '1px solid #bae6fd' }}>
                    —
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #bae6fd', color: '#64748b' }}>
                    —
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.94rem' }}>
                    {BU5_PNL_TOTAL.pax}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#0284c7', fontSize: '0.96rem', borderRight: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                    {fmtVND(BU5_PNL_TOTAL.revenue)}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#475569', fontSize: '0.92rem', borderRight: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                    {fmtVND(BU5_PNL_TOTAL.totalCost)}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#16a34a', fontSize: '0.98rem', borderRight: '1px solid #bae6fd', whiteSpace: 'nowrap' }}>
                    {fmtVND(BU5_PNL_TOTAL.profit)}
                  </td>
                  {/* TỔNG BIÊN LÃI GỘP: 14.2% */}
                  <td style={{
                    padding: '14px 12px',
                    textAlign: 'center',
                    background: '#0284c7',
                    color: '#ffffff',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    {BU5_PNL_TOTAL.margin.toFixed(1)}%
                  </td>
                </tr>

                {/* DÒNG 2: TRỪ CHI PHÍ MARKETING KẾ HOẠCH (1.00%) */}
                <tr style={{
                  background: '#fefce8',
                  borderTop: '1px dashed #fde047',
                  fontSize: '0.82rem',
                  color: '#854d0e'
                }}>
                  <td colSpan={2} style={{ padding: '10px 16px', textAlign: 'left', borderRight: '1px solid #fef08a' }}>
                    <span style={{ fontWeight: 700 }}>2. TRỪ NGÂN SÁCH MARKETING TÌM KIẾM KHÁCH (1.00% DT)</span>
                    <span style={{ fontSize: '0.72rem', color: '#a16207', display: 'block' }}>Chuẩn định mức 1% trên tổng doanh thu 33.034 Tỷ</span>
                  </td>
                  <td colSpan={6} style={{ padding: '10px 8px', textAlign: 'center', borderRight: '1px solid #fef08a', color: '#a16207' }}>
                    Định mức chuẩn 1.00% Doanh Thu Toàn Tuyến
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', borderRight: '1px solid #fef08a' }}>—</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#ca8a04', borderRight: '1px solid #fef08a', whiteSpace: 'nowrap' }}>
                    +{fmtVND(BU5_PNL_TOTAL.mktBudget)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#dc2626', borderRight: '1px solid #fef08a', whiteSpace: 'nowrap' }}>
                    -{fmtVND(BU5_PNL_TOTAL.mktBudget)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', background: '#fef08a', color: '#854d0e', fontWeight: 700 }}>
                    -1.0%
                  </td>
                </tr>

                {/* DÒNG 3: LÃI ĐÓNG GÓP THỰC TẾ SAU MARKETING (CONTRIBUTION MARGIN) */}
                <tr style={{
                  background: '#ecfdf5',
                  borderTop: '2px solid #059669',
                  borderBottom: '2px solid #059669',
                  fontWeight: 800,
                  color: '#065f46'
                }}>
                  <td colSpan={2} style={{ padding: '14px 16px', textAlign: 'left', borderRight: '1px solid #a7f3d0' }}>
                    <div style={{ textTransform: 'uppercase', letterSpacing: '0.02em', color: '#065f46', fontSize: '0.88rem' }}>
                      ⭐ 3. LÃI ĐÓNG GÓP SAU MARKETING (CONTRIBUTION MARGIN)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#047857', fontWeight: 500 }}>
                      Số tiền thực thu về BU5 sau khi đã trang trải 100% chi phí tour &amp; ngân sách tìm khách
                    </div>
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #a7f3d0', color: '#065f46' }}>
                    30 đoàn
                  </td>
                  <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #a7f3d0' }}>
                    10p
                  </td>
                  <td colSpan={4} style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #a7f3d0', color: '#047857', fontSize: '0.78rem' }}>
                    Tổng CP Tour + MKT: <strong>{fmtVND(BU5_PNL_TOTAL.totalCost + BU5_PNL_TOTAL.mktBudget)}</strong>
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#0284c7', fontSize: '0.96rem', borderRight: '1px solid #a7f3d0', whiteSpace: 'nowrap' }}>
                    {fmtVND(BU5_PNL_TOTAL.revenue)}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#475569', fontSize: '0.92rem', borderRight: '1px solid #a7f3d0', whiteSpace: 'nowrap' }}>
                    {fmtVND(BU5_PNL_TOTAL.totalCost + BU5_PNL_TOTAL.mktBudget)}
                  </td>
                  <td style={{ padding: '14px 12px', textAlign: 'right', color: '#047857', fontSize: '1.05rem', borderRight: '1px solid #a7f3d0', whiteSpace: 'nowrap' }}>
                    {fmtVND(BU5_PNL_TOTAL.netMarginAfterMkt)}
                  </td>
                  {/* TỔNG BIÊN LÃI SAU MKT: 13.2% */}
                  <td style={{
                    padding: '14px 12px',
                    textAlign: 'center',
                    background: '#059669',
                    color: '#ffffff',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    whiteSpace: 'nowrap'
                  }}>
                    {BU5_PNL_TOTAL.netMarginPctAfterMkt.toFixed(1)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── 4 THẺ TỔNG HỢP QUẢN TRỊ CAO CẤP DƯỚI BẢNG P&L ── */}
          <div style={{
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '18px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px'
          }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>LÃI GỘP SẢN PHẨM (GROSS PROFIT):</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#16a34a', marginTop: '3px' }}>
                {fmtVND(BU5_PNL_TOTAL.profit)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                Biên lợi nhuận gộp toàn BU: <strong style={{ color: '#16a34a' }}>14.2%</strong>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>NGÂN SÁCH MARKETING (1% DT):</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0284c7', marginTop: '3px' }}>
                {fmtVND(BU5_PNL_TOTAL.mktBudget)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#0369a1', marginTop: '2px' }}>
                Định mức chuẩn 1.00% trên 33.034 Tỷ DT
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '8px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.74rem', color: '#166534', fontWeight: 700, textTransform: 'uppercase' }}>LÃI ĐÓNG GÓP SAU MARKETING:</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d', marginTop: '3px' }}>
                {fmtVND(BU5_PNL_TOTAL.netMarginAfterMkt)}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#166534', marginTop: '2px' }}>
                Biên LN thực sau MKT: <strong style={{ color: '#15803d' }}>13.2%</strong>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>NGƯỠNG HÒA VỐN VẬN HÀNH:</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', marginTop: '3px' }}>
                ≥ 6 Khách / Đoàn
              </div>
              <div style={{ fontSize: '0.74rem', color: '#b45309', marginTop: '2px', fontWeight: 600 }}>
                Dưới 6 khách: Kích hoạt phụ thu hoặc dời ngày
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
