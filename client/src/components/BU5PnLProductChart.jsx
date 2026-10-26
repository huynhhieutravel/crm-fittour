import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { Trophy, TrendingUp, DollarSign, Award, Compass, Star } from 'lucide-react';
import { BU5_PNL_PRODUCTS, BU5_PNL_TOTAL } from './BU5PnLProductTable';

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
      minWidth: '220px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.9rem', marginBottom: '8px', color: '#f8fafc', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
        <span>{data.icon}</span>
        <span>{data.name}</span>
        {data.isPillar && (
          <span style={{ background: '#fef3c7', color: '#92400e', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px' }}>
            Trụ Cột
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Doanh thu:</span>
        <strong style={{ color: '#38bdf8' }}>{fmtVND(data.revenue)}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Lãi gộp:</span>
        <strong style={{ color: '#34d399' }}>{fmtVND(data.profit)}</strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Biên lợi nhuận:</span>
        <strong style={{ color: '#10b981', background: '#064e3b', padding: '1px 6px', borderRadius: '3px' }}>
          {data.margin > 0 ? `${data.margin.toFixed(1)}%` : '0.0%'}
        </strong>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Quy mô:</span>
        <span style={{ color: '#f8fafc' }}>{data.groups} đoàn • {data.totalPax} pax</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #334155', paddingTop: '4px', marginTop: '4px' }}>
        <span style={{ color: '#94a3b8' }}>Ngưỡng hòa vốn:</span>
        <span style={{ color: '#fde047', fontWeight: 600 }}>≥ {data.breakEvenPax} khách / đoàn</span>
      </div>
    </div>
  );
};

export default function BU5PnLProductChart() {
  // Chuẩn bị dữ liệu cho biểu đồ Recharts (Doanh thu đổi ra Tỷ đồng cho dễ đọc)
  const chartData = BU5_PNL_PRODUCTS.map(p => ({
    ...p,
    revenueTỷ: +(p.revenue / 1000000000).toFixed(2),
    profitTỷ: +(p.profit / 1000000000).toFixed(2),
    shortName: p.name.replace(' - Bắc Cực Quang', '').replace('Bắc Mông Cổ', 'Bắc M.Cổ')
  }));

  return (
    <div style={{ padding: '24px', background: '#ffffff' }}>
      {/* ── 3 THẺ INSIGHT CHIẾN LƯỢC TRÊN ĐẦU BIỂU ĐỒ ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Top 1 Doanh thu */}
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          border: '1px solid #bae6fd',
          borderRadius: '10px',
          padding: '14px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Trophy size={15} color="#0284c7" />
            <span>Top 1 Doanh Thu Toàn Tuyến</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
            Nga Murmansk • 4.95 Tỷ đ
          </div>
          <div style={{ fontSize: '0.75rem', color: '#0369a1' }}>
            Chiếm <strong>15.0% Doanh thu</strong> • 3 đoàn cao điểm săn cực quang
          </div>
        </div>

        {/* Card 2: Top 1 Biên LN */}
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '1px solid #bbf7d0',
          borderRadius: '10px',
          padding: '14px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Star size={15} color="#16a34a" />
            <span>Top 1 Biên Lợi Nhuận Gộp</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
            Nam Mỹ • Biên LN 18.4%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#166534' }}>
            Lãi gộp <strong>609 Triệu / đoàn 10 pax</strong> • Đỉnh cao tour độc bản
          </div>
        </div>

        {/* Card 3: Tuyến Volume Lớn Nhất */}
        <div style={{
          background: 'linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)',
          border: '1px solid #fef08a',
          borderRadius: '10px',
          padding: '14px 18px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#854d0e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Award size={15} color="#ca8a04" />
            <span>Trụ Cột Quy Mô (Volume Lớn Nhất)</span>
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '4px 0 2px' }}>
            Mông Cổ • 6 Đoàn (60 Pax)
          </div>
          <div style={{ fontSize: '0.75rem', color: '#854d0e' }}>
            Doanh thu <strong>4.73 Tỷ đ</strong> • Lãi gộp 600 Triệu (Biên LN 12.7%)
          </div>
        </div>
      </div>

      {/* ── BIỂU ĐỒ RECHARTS COMBO (BAR + LINE) ── */}
      <div style={{ width: '100%', height: 380, marginTop: '8px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="shortName" 
              tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={50}
            />

            {/* Trục Y trái: Doanh thu (Tỷ đồng) */}
            <YAxis
              yAxisId="left"
              orientation="left"
              tick={{ fill: '#0284c7', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: '#bae6fd' }}
              tickLine={false}
              unit=" Tỷ"
              domain={[0, 6]}
            />

            {/* Trục Y phải: Biên lợi nhuận (%) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fill: '#16a34a', fontSize: 11, fontWeight: 700 }}
              axisLine={{ stroke: '#bbf7d0' }}
              tickLine={false}
              unit="%"
              domain={[0, 22]}
            />

            <Tooltip content={<CustomTooltip />} />
            
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '0.8rem', fontWeight: 600 }}
            />

            {/* Cột Bar: Doanh thu kế hoạch (Tỷ đ) */}
            <Bar
              yAxisId="left"
              dataKey="revenueTỷ"
              name="Doanh thu kế hoạch (Tỷ đ)"
              radius={[6, 6, 0, 0]}
              barSize={32}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isPillar ? '#0284c7' : '#94a3b8'} 
                />
              ))}
            </Bar>

            {/* Đường Line: Biên lợi nhuận (%) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="margin"
              name="Biên lợi nhuận gộp (%)"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 7, fill: '#059669' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── GHI CHÚ ĐIỀU HÀNH DƯỚI BIỂU ĐỒ ── */}
      <div style={{
        marginTop: '16px',
        padding: '12px 18px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.76rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#0284c7', borderRadius: '2px' }} />
          <span>Cột xanh dương: <strong>Tuyến trụ cột (&gt; 4 Tỷ Doanh thu)</strong></span>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', background: '#94a3b8', borderRadius: '2px', marginLeft: '12px' }} />
          <span>Cột xám: Tuyến chuyên sâu / thử nghiệm</span>
        </div>
        <div>
          Đường xanh lá: <strong>Biên LN %</strong> (Đỉnh: Nam Mỹ 18.4%, Maroc 17.3%, Nga 15.2% | Chuẩn toàn BU: 14.2%)
        </div>
      </div>
    </div>
  );
}
