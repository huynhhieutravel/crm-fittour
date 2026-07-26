import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { TrendingUp, TrendingDown, Star, MessageSquare, Image as ImageIcon, BarChart3, Loader2 } from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, Sector, LabelList
} from 'recharts';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 'bold', color: '#1e293b' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: '4px 0', color: entry.color, fontSize: '13px', display: 'flex', justifyContent: 'space-between', gap: '16px' }}>
            <span>{entry.name}:</span>
            <span style={{ fontWeight: '600' }}>{entry.value} {entry.name === 'Đánh giá' ? 'lượt' : '⭐'}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const ReviewsDashboard = ({ dateBounds, filters }) => {
  const [loading, setLoading] = useState(true);
  const [compareMode, setCompareMode] = useState('pop'); // pop | yoy
  const [data, setData] = useState({
    overview: { current: {}, previous: {} },
    bu_breakdown: [],
    trend: []
  });

  useEffect(() => {
    fetchStats();
  }, [dateBounds, filters.bu_id]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      let query = '';
      if (dateBounds?.startDate && dateBounds?.endDate) {
        // format to YYYY-MM-DD
        const start = typeof dateBounds.startDate.toISOString === 'function' ? dateBounds.startDate.toISOString().split('T')[0] : dateBounds.startDate;
        const end = typeof dateBounds.endDate.toISOString === 'function' ? dateBounds.endDate.toISOString().split('T')[0] : dateBounds.endDate;
        query += `start_date=${start}&end_date=${end}&`;
      }
      if (filters?.bu_id) {
        query += `bu_id=${filters.bu_id}&`;
      }

      const res = await axios.get(`/api/customer-reviews/dashboard-stats?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats', error);
      toast.error('Không thể tải dữ liệu Dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return (((current - previous) / previous) * 100).toFixed(1);
  };

  const renderGrowthBadge = (growth, isInverse = false) => {
    const isPositive = growth > 0;
    const isNeutral = growth == 0;
    
    // For things like complaints, positive growth is bad (inverse). For reviews, positive is good.
    const isGood = isInverse ? !isPositive : isPositive;
    
    let color = '#64748b'; // neutral
    let bg = '#f1f5f9';
    let Icon = null;

    if (!isNeutral) {
      color = isGood ? '#16a34a' : '#dc2626';
      bg = isGood ? '#dcfce7' : '#fee2e2';
      Icon = isPositive ? TrendingUp : TrendingDown;
    }

    return (
      <span style={{ 
        display: 'inline-flex', alignItems: 'center', gap: '2px',
        padding: '2px 6px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
        color: color, backgroundColor: bg
      }}>
        {Icon && <Icon size={12} />}
        {isNeutral ? '-' : `${Math.abs(growth)}%`}
      </span>
    );
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', width: '100%' }}>
        <Loader2 className="spinning" size={40} color="#3b82f6" />
        <p style={{ marginTop: '16px', color: '#64748b', fontWeight: '500' }}>Đang tổng hợp dữ liệu chuyên gia...</p>
      </div>
    );
  }

  const { overview, bu_breakdown, trend } = data;
  const comparisonData = compareMode === 'yoy' ? overview.yoy : overview.previous;
  const compareText = compareMode === 'yoy' ? 'năm ngoái' : 'kỳ trước';

  const growthTotal = calculateGrowth(overview.current?.total, comparisonData?.total);
  const growthRating = calculateGrowth(overview.current?.avg_rating, comparisonData?.avg_rating);
  const growthRich = calculateGrowth(overview.current?.rich_reviews, comparisonData?.rich_reviews);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0', animation: 'fadeIn 0.4s ease-out' }}>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-10px' }}>
        <select 
          value={compareMode}
          onChange={(e) => setCompareMode(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#475569', backgroundColor: 'white', cursor: 'pointer', outline: 'none' }}
        >
          <option value="pop">So với Kỳ trước</option>
          <option value="yoy">So với Cùng kỳ năm ngoái</option>
        </select>
      </div>

      {/* ROW 1: KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* KPI: Tổng Đánh Giá */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Tổng Đánh Giá</p>
              <h3 style={{ margin: '0', fontSize: '32px', color: '#1e293b', fontWeight: '800' }}>{overview.current?.total || 0}</h3>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#eff6ff', borderRadius: '12px', color: '#3b82f6' }}>
              <MessageSquare size={24} />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            {renderGrowthBadge(growthTotal)} <span>so với {compareText} ({comparisonData?.total || 0})</span>
          </div>
        </div>

        {/* KPI: Điểm Trung Bình */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Điểm Đánh Giá</p>
              <h3 style={{ margin: '0', fontSize: '32px', color: '#1e293b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {overview.current?.avg_rating || '0.0'}
                <Star fill="#facc15" color="#facc15" size={24} style={{ marginTop: '-4px' }} />
              </h3>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#fef3c7', borderRadius: '12px', color: '#f59e0b' }}>
              <Star size={24} />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            {renderGrowthBadge(growthRating)} <span>so với {compareText} ({comparisonData?.avg_rating || '0.0'})</span>
          </div>
        </div>

        {/* KPI: Đánh giá Chất Lượng (>5 ảnh) */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: '#64748b', fontWeight: '600' }}>Rich Reviews (≥5 Ảnh)</p>
              <h3 style={{ margin: '0', fontSize: '32px', color: '#1e293b', fontWeight: '800' }}>{overview.current?.rich_reviews || 0}</h3>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#ecfdf5', borderRadius: '12px', color: '#10b981' }}>
              <ImageIcon size={24} />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            {renderGrowthBadge(growthRich)} <span>so với {compareText} ({comparisonData?.rich_reviews || 0})</span>
          </div>
        </div>
      </div>

      {/* ROW 2: CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', '@media(max-width: 1024px)': { gridTemplateColumns: '1fr' } }}>
        
        {/* Trend Combo Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minHeight: '350px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} color="#6366f1" /> Xu Hướng Đánh Giá
          </h3>
          {trend.length > 0 ? (
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trend.map(item => {
                  const d = new Date(item.date);
                  let display = `${d.getDate()}/${d.getMonth()+1}`;
                  if (data.group_by === 'week') {
                     const endOfWeek = new Date(d);
                     endOfWeek.setDate(d.getDate() + 6);
                     display = `${d.getDate()}/${d.getMonth()+1} - ${endOfWeek.getDate()}/${endOfWeek.getMonth()+1}`;
                  } else if (data.group_by === 'month') {
                     display = `Tháng ${d.getMonth()+1}`;
                  }
                  return {
                    ...item,
                    displayDate: display
                  };
                })} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} iconType="circle" />
                  
                  {bu_breakdown.map((bu, index) => (
                    <Bar 
                      key={bu.bu_id} 
                      yAxisId="left" 
                      dataKey={bu.bu_id} 
                      name={bu.bu_id} 
                      stackId="a" 
                      fill={COLORS[index % COLORS.length]} 
                      maxBarSize={40} 
                    />
                  ))}
                  
                  {/* Invisible Line for Total Label */}
                  <Line yAxisId="left" type="monotone" dataKey="total" stroke="transparent" strokeWidth={0} dot={false} activeDot={false} legendType="none">
                     <LabelList dataKey="total" position="top" fill="#64748b" fontSize={13} fontWeight={600} />
                  </Line>
                  
                  <Line yAxisId="right" type="monotone" dataKey="avg_rating" name="Điểm trung bình" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: 'white' }} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#94a3b8', fontSize: '14px' }}>
               Không có dữ liệu trong khoảng thời gian này
             </div>
          )}
        </div>

        {/* BU Share Pie Chart */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', minHeight: '350px' }}>
          <h3 style={{ margin: '0 0 20px', fontSize: '16px', color: '#1e293b', fontWeight: '700', textAlign: 'center' }}>
            Thị Phần Theo BU
          </h3>
          {bu_breakdown.length > 0 ? (
            <div style={{ height: '280px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={bu_breakdown}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="total"
                    nameKey="bu_id"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {bu_breakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => {
                     const total = bu_breakdown.reduce((sum, item) => sum + parseInt(item.total), 0);
                     const ratio = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                     return [`${value} lượt (${ratio}%)`, 'Số lượng'];
                  }} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Custom Legend for Pie */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '-10px' }}>
                {bu_breakdown.slice(0, 6).map((entry, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span style={{ fontWeight: '600' }}>{entry.bu_id}</span> ({entry.total})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '250px', color: '#94a3b8', fontSize: '14px' }}>
               Không có dữ liệu
             </div>
          )}
        </div>
      </div>

      {/* ROW 3: BU Leaderboard Table */}
      <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h3 style={{ margin: '0 0 20px', fontSize: '16px', color: '#1e293b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Star size={18} fill="#facc15" color="#facc15" /> Bảng Xếp Hạng BU (Leaderboard)
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Hạng</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600' }}>Tên BU</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>Điểm Trung Bình</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>Tổng Lượt</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>Rich Reviews (≥5 Ảnh)</th>
                <th style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px', fontWeight: '600', textAlign: 'center' }}>Thị Phần %</th>
              </tr>
            </thead>
            <tbody>
              {bu_breakdown.map((bu, index) => {
                const isTop3 = index < 3;
                let rankColor = '#94a3b8';
                if (index === 0) rankColor = '#f59e0b'; // Vàng
                if (index === 1) rankColor = '#94a3b8'; // Bạc
                if (index === 2) rankColor = '#b45309'; // Đồng

                const shareRatio = overview.current?.total > 0 ? Math.round((bu.total / overview.current.total) * 100) : 0;

                return (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s', ':hover': { backgroundColor: '#f8fafc' } }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ 
                        width: '28px', height: '28px', borderRadius: '8px', 
                        backgroundColor: isTop3 ? rankColor : '#f1f5f9', 
                        color: isTop3 ? 'white' : '#64748b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 'bold', fontSize: '13px',
                        boxShadow: isTop3 ? `0 2px 4px ${rankColor}40` : 'none'
                      }}>
                        {index + 1}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: '600', color: '#1e293b' }}>{bu.bu_id}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: '#fef3c7', color: '#b45309', borderRadius: '20px', fontWeight: '700', fontSize: '13px' }}>
                        {bu.avg_rating} <Star fill="#f59e0b" color="#f59e0b" size={12} />
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#475569' }}>{bu.total}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#10b981' }}>{bu.rich_reviews}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569', minWidth: '36px' }}>{shareRatio}%</span>
                        <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${shareRatio}%`, backgroundColor: '#3b82f6', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {bu_breakdown.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default ReviewsDashboard;
