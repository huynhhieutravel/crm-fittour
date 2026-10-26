import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { TrendingUp, ShieldAlert, CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { BU5_SCENARIOS } from './BU5BusinessScenariosTable';

const fmtVND = (num) => {
  if (!num || isNaN(num) || num === 0) return '—';
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}\u00A0đ`;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;

  return (
    <div style={{
      background: '#0f172a',
      color: '#ffffff',
      padding: '14px 16px',
      borderRadius: '8px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
      border: '1px solid #334155',
      fontSize: '0.8rem',
      minWidth: '240px'
    }}>
      <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '8px', color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
        Kịch bản {data.name} ({data.runRate})
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Doanh thu dự kiến:</span>
        <strong style={{ color: '#38bdf8' }}>{fmtVND(data.revenue)}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Lãi gộp dự kiến:</span>
        <strong style={{ color: '#34d399' }}>{fmtVND(data.profit)}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Biên lợi nhuận gộp:</span>
        <strong style={{ color: '#10b981' }}>{data.margin}%</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Quy mô vận hành:</span>
        <span style={{ color: '#f8fafc' }}>{data.groups} đoàn • {data.totalPax} pax</span>
      </div>
      <div style={{ borderTop: '1px dashed #334155', paddingTop: '6px', marginTop: '6px', fontSize: '0.72rem', color: '#cbd5e1' }}>
        <em>{data.action}</em>
      </div>
    </div>
  );
};

export default function BU5ScenariosChart() {
  const chartData = BU5_SCENARIOS.map(s => ({
    ...s,
    revenueTỷ: +(s.revenue / 1000000000).toFixed(2),
    profitTỷ: +(s.profit / 1000000000).toFixed(2),
    marginPct: s.margin
  }));

  return (
    <div style={{ padding: '24px', background: '#ffffff' }}>
      {/* ── 3 KHỐI SO SÁNH NHANH ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        marginBottom: '22px'
      }}>
        {BU5_SCENARIOS.map((sc) => {
          return (
            <div
              key={sc.id}
              style={{
                background: sc.accentBg,
                border: `1.5px solid ${sc.borderColor}`,
                borderRadius: '8px',
                padding: '12px 16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>{sc.name} ({sc.runRate})</span>
                <span style={{
                  background: sc.color,
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px'
                }}>
                  Biên LN {sc.margin}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Doanh thu:</span>
                <span style={{ fontSize: '1.05rem', fontWeight: 800, color: sc.color }}>{(sc.revenue / 1000000000).toFixed(2)} Tỷ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Lãi gộp:</span>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{(sc.profit / 1000000000).toFixed(2)} Tỷ</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BIỂU ĐỒ RECHARTS GROUPED BAR CHART ── */}
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#0f172a', fontSize: 13, fontWeight: 700 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            <YAxis
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              unit=" Tỷ"
              domain={[0, 48]}
            />

            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem', fontWeight: 600 }}
            />

            {/* Cột 1: Doanh thu dự kiến */}
            <Bar
              dataKey="revenueTỷ"
              name="Doanh thu dự kiến (Tỷ đ)"
              radius={[6, 6, 0, 0]}
              barSize={40}
            >
              <Cell fill="#f59e0b" /> {/* Thận trọng */}
              <Cell fill="#0284c7" /> {/* Cơ sở */}
              <Cell fill="#16a34a" /> {/* Tăng trưởng */}
            </Bar>

            {/* Cột 2: Lãi gộp dự kiến */}
            <Bar
              dataKey="profitTỷ"
              name="Lãi gộp dự kiến (Tỷ đ)"
              radius={[6, 6, 0, 0]}
              barSize={32}
            >
              <Cell fill="#d97706" /> {/* Thận trọng */}
              <Cell fill="#0369a1" /> {/* Cơ sở */}
              <Cell fill="#15803d" /> {/* Tăng trưởng */}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── FOOTER ĐIỀU HÀNH ── */}
      <div style={{
        marginTop: '14px',
        padding: '12px 18px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        <div>
          Mốc ngân sách &amp; nhân sự chính thức: <strong>Kịch Bản Cơ Sở (33.03 Tỷ Doanh thu • 4.68 Tỷ Lãi gộp • 30 đoàn)</strong>
        </div>
        <div>
          Biên độ an toàn rủi ro (Downside floor): <strong>Lãi tối thiểu ≥ 2.03 Tỷ đ</strong> ngay cả khi thị trường suy giảm 20%.
        </div>
      </div>
    </div>
  );
}
