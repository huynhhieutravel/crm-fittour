import React from 'react';
import { DollarSign, TrendingUp, ExternalLink, Info, CheckCircle2 } from 'lucide-react';

const fmtVND = (num) => {
  if (!num || isNaN(num) || num === 0) return '—';
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}\u00A0đ`;
};

const fmtShortVND = (num) => {
  if (!num || isNaN(num) || num === 0) return '—';
  const tr = num / 1000000;
  return `${tr >= 1000 ? (tr / 1000).toFixed(2) + ' Tỷ' : Math.round(tr) + ' triệu'}`;
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
    note: 'Mùa hoa anh đào & Thu Hunza'
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
    note: 'Du thuyền sông Nile 5 sao'
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
    note: 'Viên ngọc Bắc Phi & Sahara'
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
    note: 'Săn Cực Quang Murmansk mùa đông'
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
    note: 'Thử nghiệm hồ băng'
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
    note: 'Volume chủ lực hè (T6-T9)'
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
    note: 'Con đường tơ lụa hè'
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
    note: 'Định vị hoang dã Bắc Mỹ'
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
    note: 'Đường xa đỉnh cao (Biên LN cao nhất: 18.4%)'
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
    note: 'Chờ khóa costing đối tác landtour'
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
    note: 'Tuần lộc Tsaatan thu'
  }
];

export const BU5_PNL_TOTAL = {
  groups: 30,
  pax: 300,
  revenue: 33034000000,
  totalCost: 28352923960,
  profit: 4681076040,
  margin: 14.2,
  mktBudget: 330340000
};

export default function BU5PnLProductTable() {
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
              BU5 - P&amp;L SẢN PHẨM
            </h2>
          </div>
          <p style={{
            margin: '4px 0 0',
            color: '#94a3b8',
            fontSize: '0.8rem'
          }}>
            Bảng cơ cấu tài chính, giá vốn costing, doanh thu, lợi nhuận gộp và biên lợi nhuận % chuẩn 11 tuyến sản phẩm
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '6px',
            padding: '6px 12px',
            color: '#34d399',
            fontSize: '0.78rem',
            fontWeight: 700
          }}>
            Biên LN toàn BU5: 14.2% • Lãi gộp: 4.681 Tỷ
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

      {/* ── THANH CHÚ THÍCH Ô MÀU VÀNG (DÒNG 2 GOOGLE SHEET) ── */}
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
            <strong>Quy ước dữ liệu:</strong> Cột nền vàng nhẹ <em>(Giá bán, Cost/khách)</em> là dữ liệu nhập từ Costing chi tiết. Các cột Doanh thu, Chi phí, Lợi nhuận và <strong>Biên LN %</strong> tự động tính theo công thức.
          </span>
        </div>
      </div>

      {/* ── BẢNG P&L 12 CỘT CHUẨN XÁC ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.84rem'
        }}>
          <thead>
            <tr style={{ background: '#000000', color: '#ffffff', borderBottom: '2px solid #334155' }}>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '38px', borderRight: '1px solid #1e293b' }}>STT</th>
              <th style={{ padding: '12px 14px', textAlign: 'left', minWidth: '170px', borderRight: '1px solid #1e293b' }}>Sản phẩm</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '70px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>Số đoàn</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '85px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>Khách/đoàn</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '125px', borderRight: '1px solid #1e293b', background: '#1c1917', color: '#fde047', whiteSpace: 'nowrap' }}>Giá bán/khách</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '125px', borderRight: '1px solid #1e293b', background: '#1c1917', color: '#fde047', whiteSpace: 'nowrap' }}>Cost/khách</th>
              <th style={{ padding: '12px 8px', textAlign: 'center', width: '80px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>CP cố định</th>
              <th style={{ padding: '12px 10px', textAlign: 'center', width: '85px', borderRight: '1px solid #1e293b', whiteSpace: 'nowrap' }}>Tổng khách</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '135px', borderRight: '1px solid #1e293b', color: '#38bdf8', whiteSpace: 'nowrap' }}>Doanh thu</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '135px', borderRight: '1px solid #1e293b', color: '#cbd5e1', whiteSpace: 'nowrap' }}>Tổng chi phí</th>
              <th style={{ padding: '12px 12px', textAlign: 'right', minWidth: '130px', borderRight: '1px solid #1e293b', color: '#34d399', whiteSpace: 'nowrap' }}>Lợi nhuận</th>
              <th style={{ padding: '12px 12px', textAlign: 'center', width: '90px', background: '#0284c7', color: '#ffffff', fontWeight: 800, whiteSpace: 'nowrap' }}>Biên LN</th>
            </tr>
          </thead>
          <tbody>
            {BU5_PNL_PRODUCTS.map((prod, idx) => {
              const isZero = prod.groups === 0 || prod.revenue === 0;
              const hasHighMargin = prod.margin >= 15.0;

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
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', fontWeight: 600, borderRight: '1px solid #f1f5f9' }}>
                    {prod.stt}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{prod.icon}</span>
                      <span style={{ color: prod.color }}>{prod.name}</span>
                    </div>
                    {prod.note && (
                      <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>
                        {prod.note}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, borderRight: '1px solid #f1f5f9' }}>
                    {prod.groups}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#64748b', borderRight: '1px solid #f1f5f9' }}>
                    {prod.paxPerGroup}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, background: '#fffbeb', borderRight: '1px solid #fef3c7', whiteSpace: 'nowrap' }}>
                    {fmtVND(prod.price)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, background: '#fffbeb', borderRight: '1px solid #fef3c7', whiteSpace: 'nowrap', color: '#78350f' }}>
                    {fmtVND(prod.cost)}
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', color: '#94a3b8', borderRight: '1px solid #f1f5f9' }}>
                    —
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: '#0f172a', borderRight: '1px solid #f1f5f9' }}>
                    {prod.totalPax}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0284c7', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {fmtVND(prod.revenue)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, color: '#64748b', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {fmtVND(prod.totalCost)}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 800, color: '#16a34a', borderRight: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
                    {fmtVND(prod.profit)}
                  </td>
                  {/* CỘT BIÊN LỢI NHUẬN (%) NỔI BẬT */}
                  <td style={{
                    padding: '10px 12px',
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

            {/* DÒNG TỔNG CỘNG CHUẨN GOOGLE SHEET (DÒNG 16) */}
            <tr style={{
              background: '#f0f9ff',
              borderTop: '2px solid #0284c7',
              fontWeight: 800,
              color: '#0f172a'
            }}>
              <td colSpan={2} style={{ padding: '14px 16px', textAlign: 'left', borderRight: '1px solid #bae6fd', fontSize: '0.88rem' }}>
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.02em', color: '#0369a1' }}>
                  TỔNG CỘNG TOÀN BỘ BU5
                </span>
              </td>
              <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #bae6fd', color: '#0369a1', fontSize: '0.94rem' }}>
                {BU5_PNL_TOTAL.groups}
              </td>
              <td style={{ padding: '14px 8px', textAlign: 'center', borderRight: '1px solid #bae6fd', color: '#64748b' }}>
                —
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
              {/* TỔNG BIÊN LỢI NHUẬN: 14.2% */}
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
          </tbody>
        </table>
      </div>

      {/* ── 3 THẺ TỔNG HỢP NHANH DƯỚI BẢNG P&L ── */}
      <div style={{
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px'
      }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>TỔNG LỢI NHUẬN GỘP KẾ HOẠCH:</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
            {fmtVND(BU5_PNL_TOTAL.profit)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            Biên lợi nhuận gộp toàn BU: <strong>14.2%</strong>
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>NGÂN SÁCH MARKETING 1% DOANH THU:</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
            {fmtVND(BU5_PNL_TOTAL.mktBudget)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0369a1', marginTop: '2px' }}>
            Chuẩn định mức 1.00% trên 33.034 Tỷ Doanh thu
          </div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>LÃI GỘP BÌNH QUÂN / ĐOÀN:</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
            {fmtVND(BU5_PNL_TOTAL.profit / 30)}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
            Trên quy mô 30 đoàn (300 khách)
          </div>
        </div>
      </div>
    </div>
  );
}
