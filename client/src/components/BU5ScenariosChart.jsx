import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList
} from 'recharts';
import { TrendingUp, ShieldAlert, CheckCircle2, Rocket, ArrowRight } from 'lucide-react';
import { BU5_SCENARIOS } from './BU5BusinessScenariosTable';

const fmtVND = (num) => {
  if (!num || isNaN(num) || num === 0) return '—';
  return `${Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}\u00A0đ`;
};

export default function BU5ScenariosChart() {
  const chartData = BU5_SCENARIOS.map(s => ({
    ...s,
    revenueTỷ: +(s.revenue / 1000000000).toFixed(2),
    profitTỷ: +(s.profit / 1000000000).toFixed(2),
    marginPct: s.margin
  }));

  const [selectedScenarioId, setSelectedScenarioId] = useState('base');
  const [hoveredScenario, setHoveredScenario] = useState(null);

  const activeScenario = hoveredScenario || chartData.find(s => s.id === selectedScenarioId) || chartData[1];

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
          const isSelected = activeScenario.id === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => {
                setSelectedScenarioId(sc.id);
                setHoveredScenario(null);
              }}
              style={{
                background: sc.accentBg,
                border: isSelected ? `2px solid ${sc.color}` : `1.5px solid ${sc.borderColor}`,
                borderRadius: '8px',
                padding: '12px 16px',
                cursor: 'pointer',
                boxShadow: isSelected ? `0 4px 12px rgba(0,0,0,0.08)` : 'none',
                transform: isSelected ? 'translateY(-1px)' : 'none',
                transition: 'all 0.15s ease'
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

      {/* ── BIỂU ĐỒ RECHARTS GROUPED BAR CHART KÈM TOOLTIP CỐ ĐỊNH TỰ ĐỘNG ── */}
      <div style={{ width: '100%', height: 380, position: 'relative' }}>
        {/* CARD TOOLTIP LUÔN HIỂN THỊ (PERSISTENT EXECUTIVE CALLOUT) - TRÁNH TRỐNG BIỂU ĐỒ */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '65px',
          zIndex: 10,
          background: 'rgba(15, 23, 42, 0.94)',
          color: '#ffffff',
          padding: '12px 16px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          border: '1px solid #334155',
          fontSize: '0.78rem',
          minWidth: '275px',
          maxWidth: '320px',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto'
        }}>
          {/* Nút bấm chuyển kịch bản ngay trên Tooltip */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid #334155' }}>
            {chartData.map(s => {
              const isAct = activeScenario.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedScenarioId(s.id);
                    setHoveredScenario(null);
                  }}
                  style={{
                    background: isAct ? s.color : '#1e293b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '3px 8px',
                    fontSize: '0.7rem',
                    fontWeight: isAct ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {s.name} ({s.runRate})
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#f8fafc' }}>
              Kịch bản {activeScenario.name} ({activeScenario.runRate})
            </span>
            <span style={{
              background: activeScenario.color,
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '1px 6px',
              borderRadius: '8px'
            }}>
              Biên LN {activeScenario.margin}%
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#94a3b8' }}>Doanh thu dự kiến:</span>
            <strong style={{ color: '#38bdf8' }}>{fmtVND(activeScenario.revenue)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#94a3b8' }}>Lãi gộp dự kiến:</span>
            <strong style={{ color: '#34d399' }}>{fmtVND(activeScenario.profit)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#94a3b8' }}>Biên lợi nhuận gộp:</span>
            <strong style={{ color: '#10b981' }}>{activeScenario.margin}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#94a3b8' }}>Quy mô vận hành:</span>
            <span style={{ color: '#f8fafc' }}>{activeScenario.groups} đoàn • {activeScenario.totalPax} pax</span>
          </div>
          <div style={{ borderTop: '1px dashed #334155', paddingTop: '5px', marginTop: '5px', fontSize: '0.72rem', color: '#cbd5e1', lineHeight: 1.35 }}>
            <em>{activeScenario.action}</em>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 25, right: 30, left: 10, bottom: 10 }}
            onMouseMove={(state) => {
              if (state && state.activePayload && state.activePayload.length) {
                setHoveredScenario(state.activePayload[0].payload);
              }
            }}
            onMouseLeave={() => setHoveredScenario(null)}
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
              domain={[0, 52]}
            />
            
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem', fontWeight: 600 }}
            />

            {/* Cột 1: Doanh thu dự kiến với LabelList hiển thị số trên đầu cột */}
            <Bar
              dataKey="revenueTỷ"
              name="Doanh thu dự kiến (Tỷ đ)"
              radius={[6, 6, 0, 0]}
              barSize={42}
            >
              <LabelList
                dataKey="revenueTỷ"
                position="top"
                formatter={(val) => `${val}\u00A0Tỷ`}
                style={{ fill: '#0f172a', fontSize: 11, fontWeight: 800 }}
                offset={6}
              />
              <Cell fill="#f59e0b" /> {/* Thận trọng */}
              <Cell fill="#0284c7" /> {/* Cơ sở */}
              <Cell fill="#16a34a" /> {/* Tăng trưởng */}
            </Bar>

            {/* Cột 2: Lãi gộp dự kiến với LabelList */}
            <Bar
              dataKey="profitTỷ"
              name="Lãi gộp dự kiến (Tỷ đ)"
              radius={[6, 6, 0, 0]}
              barSize={32}
            >
              <LabelList
                dataKey="profitTỷ"
                position="top"
                formatter={(val) => `${val}\u00A0Tỷ`}
                style={{ fill: '#0369a1', fontSize: 10, fontWeight: 700 }}
                offset={6}
              />
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
