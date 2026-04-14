import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, LabelList
} from 'recharts';
import { 
  TrendingUp, Activity, DollarSign, Users, Award, Shield, 
  Calendar 
} from 'lucide-react';

const getDashboardDateLabel = (filter, year, month) => {
  if (filter === 'year') return `Năm ${year}`;
  if (filter === 'month') return `Tháng ${month} / ${year}`;
  return '';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <div style={{ fontWeight: 800, marginBottom: '8px', color: '#1e293b' }}>Tháng {label}</div>
        {payload.map((entry, index) => {
          if(!entry.value) return null;
          return (
            <div key={index} style={{ color: entry.color, display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
              <span>{entry.name}:</span>
              <span>{entry.value.toLocaleString('vi-VN')} {String(entry.dataKey).includes('spend') || String(entry.dataKey).includes('cpl') || entry.dataKey === 'MarketingSpend' ? 'đ' : ''}</span>
            </div>
          )
        })}
      </div>
    );
  }
  return null;
};

const ManagementDashboardTab = ({ user }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));
  const [viewMode, setViewMode] = useState('year'); // 'year', 'month'

  const dateFilters = ['year', 'month'];

  useEffect(() => {
    fetchData();
  }, [year, month, viewMode]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = viewMode === 'month' 
        ? `/api/management-dashboard/overview?year=${year}&month=${month}`
        : `/api/management-dashboard/overview?year=${year}`;
        
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching management data:', err);
    } finally {
      setLoading(false);
    }
  };

  const { cashflow = [], buComparison = [], leaderboard = [], funnel = [] } = data || {};

  const totalSpend = funnel.find(f => f.name === 'Tổng Spend')?.value || 0;
  const totalMessages = funnel.find(f => f.name === 'Tổng Tin Nhắn')?.value || 0;
  const totalLeads = funnel.find(f => f.name === 'Tổng Leads')?.value || 0;
  
  const avgCpl = totalLeads > 0 ? Math.round(totalSpend / totalLeads) : 0;
  const avgCpm = totalMessages > 0 ? Math.round(totalSpend / totalMessages) : 0;

  // Custom colors for BUs to keep them consistent
  const buColors = {
      BU1: '#f59e0b',
      BU2: '#8b5cf6',
      BU3: '#ec4899',
      BU4: '#10b981'
  };

  return (
    <div className="management-dashboard animate-slide-up" style={{ padding: '0 24px 24px 24px' }}>
      
      {/* Executive Single-Row Filter Bar */}
      <div className="executive-filter-panel mb-12">
        <div className="filter-scroll-container">
          <div className="horizontal-filter-row" style={{ display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'space-between', width: '100%' }}>
            
            {/* Left side: Segmented and Select */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="segmented-control glass text-white">
                {dateFilters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setViewMode(f)}
                    className={`segment-btn ${viewMode === f ? "active" : ""}`}
                  >
                    {f === 'year' ? 'Trong Năm' : 'Trong Tháng'}
                  </button>
                ))}
              </div>

              <div className="filter-divider"></div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="executive-select-wrapper">
                  <select 
                    value={year} 
                    onChange={e => setYear(e.target.value)}
                    className="executive-select"
                  >
                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                </div>

                {viewMode === 'month' && (
                  <div className="executive-select-wrapper">
                    <select 
                      value={month} 
                      onChange={e => setMonth(e.target.value)}
                      className="executive-select"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>Tháng {m}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#be185d', fontWeight: 800, fontSize: '1.2rem', paddingRight: '12px' }}>
                <TrendingUp size={22} />
                Tổng Quan Marketing
            </div>
          </div>
        </div>
      </div>

      {loading && !data ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Đang tải dữ liệu phân tích...</div>
      ) : (
        <>
          {/* QUICK STATS */}
          <div className="stats-grid" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', color: '#fff', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div className="stat-icon-bg" style={{ opacity: 0.2, position: 'absolute', right: '-10px', top: '10px' }}><DollarSign size={80} /></div>
              <div className="stat-content" style={{ position: 'relative', zIndex: 2 }}>
                <span className="stat-label" style={{ color: '#fbcfe8', fontWeight: 700, fontSize: '0.85rem' }}>TỔNG THANH TOÁN ADS</span>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0' }}>{totalSpend.toLocaleString('vi-VN')}đ</div>
                <div style={{ fontSize: '0.8rem', color: '#fbcfe8' }}>Đã chi tiêu trong {getDashboardDateLabel(viewMode, year, month)}</div>
              </div>
            </div>
            
            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
              <div className="stat-icon-bg" style={{ opacity: 0.2, position: 'absolute', right: '-10px', top: '10px' }}><Activity size={80} /></div>
              <div className="stat-content" style={{ position: 'relative', zIndex: 2 }}>
                <span className="stat-label" style={{ color: '#bfdbfe', fontWeight: 700, fontSize: '0.85rem' }}>TỔNG MESSAGES</span>
                <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  {totalMessages.toLocaleString('vi-VN')} <span style={{fontSize: '1rem', fontWeight: 600, opacity: 0.8}}>sms</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#bfdbfe', fontWeight: 600 }}>CPM: {avgCpm.toLocaleString('vi-VN')}đ / Mess</div>
              </div>
            </div>

            <div className="stat-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: '#fff', padding: '24px', borderRadius: '16px', position: 'relative', overflow: 'hidden' }}>
               <div className="stat-icon-bg" style={{ opacity: 0.2, position: 'absolute', right: '-10px', top: '10px' }}><Users size={80} /></div>
               <div className="stat-content" style={{ position: 'relative', zIndex: 2 }}>
                 <span className="stat-label" style={{ color: '#a7f3d0', fontWeight: 700, fontSize: '0.85rem' }}>TỔNG LEADS (MKT CHẠY RA)</span>
                 <div className="stat-value" style={{ fontSize: '2rem', fontWeight: 800, margin: '8px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                   {totalLeads.toLocaleString('vi-VN')} <span style={{fontSize: '1rem', fontWeight: 600, opacity: 0.8}}>leads</span>
                 </div>
                 <div style={{ fontSize: '0.9rem', color: '#a7f3d0', fontWeight: 600 }}>Giá Lead (CPL TỔNG): {avgCpl.toLocaleString('vi-VN')}đ / Lead</div>
               </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px', marginBottom: '24px' }}>
            
            {/* SPEND VS. LEADS (STACKED + DUAL AXIS) */}
            <div className="analytics-card" style={{ gridColumn: 'span 12', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Phân Bộ Chi Tiêu Marketing Hàng Tháng theo Từng BU</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>Cột tiền được cắt lớp theo từng đội (BU1, BU2, BU3, BU4). Đường Line Xanh hiển thị lượng Khách/Lead đem về của toàn công ty.</p>
              </div>
              <div style={{ width: '100%', height: 380 }}>
                <ResponsiveContainer>
                   <ComposedChart data={cashflow} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                     <CartesianGrid stroke="#f1f5f9" vertical={false} />
                     <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     
                     <YAxis yAxisId="left" tickFormatter={(v) => `${(v/1000000).toFixed(0)}Tr`} stroke="#831843" fontSize={12} tickLine={false} axisLine={false} orientation="left" />
                     <YAxis yAxisId="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} orientation="right" />
                     
                     <Tooltip content={<CustomTooltip />} />
                     <Legend wrapperStyle={{ paddingTop: '20px' }} />
                     
                     {/* Băm cột tiền theo stack BU */}
                     <Bar yAxisId="left" dataKey="BU1_spend" name="Tiền BU1" stackId="spend" barSize={32} fill={buColors.BU1} radius={[0, 0, 0, 0]} />
                     <Bar yAxisId="left" dataKey="BU2_spend" name="Tiền BU2" stackId="spend" barSize={32} fill={buColors.BU2} radius={[0, 0, 0, 0]} />
                     <Bar yAxisId="left" dataKey="BU3_spend" name="Tiền BU3" stackId="spend" barSize={32} fill={buColors.BU3} radius={[0, 0, 0, 0]} />
                     <Bar yAxisId="left" dataKey="BU4_spend" name="Tiền BU4" stackId="spend" barSize={32} fill={buColors.BU4} radius={[4, 4, 0, 0]} />
                     
                     {/* Tổng Leads */}
                     <Line yAxisId="right" type="monotone" dataKey="Leads" name="Tổng Lead (Cả Công Ty)" stroke="#10b981" strokeWidth={5} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                   </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CPL TREND CHART */}
            <div className="analytics-card" style={{ gridColumn: 'span 12', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b' }}>Xu Hướng Biến Động Giá Khách / Lead (CPL TREND)</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>So sánh biến động "đắt/rẻ" của việc mua khách trên nền tảng kĩ thuật số qua từng tháng theo mỗi BU. Càng cao càng báo động.</p>
              </div>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                   <LineChart data={cashflow} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                     <CartesianGrid stroke="#f1f5f9" vertical={true} />
                     <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} stroke="#be185d" fontSize={12} tickLine={false} axisLine={false} />
                     <Tooltip content={<CustomTooltip />} />
                     <Legend wrapperStyle={{ paddingTop: '20px' }} />
                     
                     {/* Biểu đồ Line của CPL từng BU */}
                     <Line type="stepAfter" dataKey="avg_cpl" name="CPL Trung Bình Cty" stroke="#be185d" strokeWidth={5} strokeDasharray="5 5" dot={false} activeDot={{r: 6}} />
                     <Line type="monotone" dataKey="BU1_cpl" name="CPL BU1" stroke={buColors.BU1} strokeWidth={3} dot={{r: 3}} />
                     <Line type="monotone" dataKey="BU2_cpl" name="CPL BU2" stroke={buColors.BU2} strokeWidth={3} dot={{r: 3}} />
                     <Line type="monotone" dataKey="BU3_cpl" name="CPL BU3" stroke={buColors.BU3} strokeWidth={3} dot={{r: 3}} />
                     <Line type="monotone" dataKey="BU4_cpl" name="CPL BU4" stroke={buColors.BU4} strokeWidth={3} dot={{r: 3}} />
                   </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SIDE-BY-SIDE BU COMPARISON (Tránh gộp chung trục Horizontal X) */}
            <div className="analytics-card" style={{ gridColumn: 'span 12', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
               <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>Mức Độ Đóng Góp (BU Performance Funnel)</h3>
               <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '24px' }}>Phân tách rạch ròi 2 mảng: Mảng Spend và Mảng Kết quả Leads để dễ dàng đối chiếu.</p>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px' }}>
                 {/* Khối Quy Mô: Spend vs Leads (Dual Axis) */}
                 <div style={{ width: '100%', height: 350, background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{textAlign: 'center', margin: '0 0 16px 0', color: '#334155'}}>Quy Mô Ngân Sách & Sản Lượng Khách</h4>
                    {buComparison.length > 0 ? (
                      <ResponsiveContainer>
                        <ComposedChart data={buComparison} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="bu_name" fontSize={14} fontWeight={800} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="left" tickFormatter={(v) => `${(v/1000000).toFixed(0)}Tr`} stroke="#f59e0b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip formatter={(val, name) => [val.toLocaleString('vi-VN'), name === 'total_spend' ? 'Tiền (đ)' : 'Leads']} cursor={{fill: '#f1f5f9'}} />
                          <Legend wrapperStyle={{paddingTop:'15px'}} />
                          <Bar yAxisId="left" dataKey="total_spend" name="Tiền Bơm (đ)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40}>
                              <LabelList dataKey="total_spend" position="top" fill="#f59e0b" fontWeight={700} fontSize={12} formatter={(v) => `${(v/1000000).toLocaleString('vi-VN', {maximumFractionDigits: 1})} Tr`} />
                          </Bar>
                          <Line yAxisId="right" type="monotone" dataKey="total_leads" name="Lượng Leads" stroke="#10b981" strokeWidth={4} dot={{r: 6}} activeDot={{r: 8}}>
                              <LabelList dataKey="total_leads" position="right" fill="#10b981" fontWeight={800} fontSize={14} />
                          </Line>
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : <span style={{color: '#94a3b8'}}>No data</span>}
                 </div>

                 {/* Khối Hiệu Quả: CPL */}
                 <div style={{ width: '100%', height: 350, background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                    <h4 style={{textAlign: 'center', margin: '0 0 16px 0', color: '#be185d'}}>Hiệu Quả (Giá Mỗi Lead) - Thấp là tốt</h4>
                    {buComparison.length > 0 ? (
                      <ResponsiveContainer>
                        <BarChart 
                          data={[...buComparison].sort((a,b) => a.avg_cpl - b.avg_cpl)} 
                          layout="vertical" 
                          margin={{ top: 5, right: 60, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="bu_name" type="category" axisLine={false} tickLine={false} fontWeight={800} fontSize={14} width={50} />
                          <Tooltip formatter={(val) => val.toLocaleString('vi-VN') + ' đ'} cursor={{fill: '#f1f5f9'}} />
                          <Bar dataKey="avg_cpl" name="CPL (đ/Lead)" fill="#be185d" radius={[0, 4, 4, 0]} barSize={32}>
                              <LabelList dataKey="avg_cpl" position="right" fill="#be185d" fontWeight={800} fontSize={13} formatter={(v) => `${(v/1000).toLocaleString('vi-VN', {maximumFractionDigits: 0})}k / Lead`} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <span style={{color: '#94a3b8'}}>No data</span>}
                 </div>
               </div>
            </div>

            {/* LEADERBOARD CAMPAIGNS */}
            <div className="analytics-card" style={{ gridColumn: 'span 12', background: '#fff', padding: '24px', borderRadius: '16px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                 <TrendingUp size={24} color="#db2777" /> Bảng Lương Chiến Dịch Đốt Tiền Nhất
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px' }}>Đánh dấu chỉ số CPL báo động đỏ (Khách quá đắt) hoặc xanh (đang rất ngon).</p>
              <div style={{ overflowX: 'auto', maxHeight: '450px' }}>
                <table className="data-table" style={{ width: '100%', fontSize: '0.9rem' }}>
                   <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                     <tr>
                       <th style={{ textAlign: 'left', padding: '16px 16px', color: '#475569', fontWeight: 800, borderBottom: '2px solid #e2e8f0' }}>Tên Chiến Dịch Quảng Cáo</th>
                       <th style={{ textAlign: 'center', padding: '16px 16px', color: '#475569', fontWeight: 800, borderBottom: '2px solid #e2e8f0' }}>Ngân Sách Tích Lũy</th>
                       <th style={{ textAlign: 'center', padding: '16px 16px', color: '#475569', fontWeight: 800, borderBottom: '2px solid #e2e8f0' }}>Tiến Trình (CPL)</th>
                     </tr>
                   </thead>
                   <tbody>
                     {leaderboard.map((camp, index) => (
                       <tr key={index} style={{ borderBottom: '1px solid #f1f5f9', background: index % 2 === 0 ? '#fff' : '#fafafa' }}>
                         <td style={{ padding: '16px 16px' }}>
                            <div style={{ fontWeight: 800, color: '#1e293b' }}>{camp.name || 'Không tên'}</div>
                            <div style={{ display: 'inline-block', fontSize: '0.7rem', color: buColors[camp.username] || '#94a3b8', background: (buColors[camp.username] || '#94a3b8') + '20', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 800, marginTop: '8px' }}>{camp.username}</div>
                         </td>
                         <td style={{ padding: '16px 16px', fontWeight: 800, color: '#be185d', textAlign: 'center', fontSize: '1rem' }}>
                            {parseFloat(camp.spend).toLocaleString('vi-VN')} đ
                         </td>
                         <td style={{ padding: '16px 16px', textAlign: 'center' }}>
                            <div style={{ 
                              background: parseFloat(camp.conversion_rate) < 130000 ? '#dcfce7' : (parseFloat(camp.conversion_rate) > 200000 ? '#fee2e2' : '#fef9c3'),
                              color: parseFloat(camp.conversion_rate) < 130000 ? '#166534' : (parseFloat(camp.conversion_rate) > 200000 ? '#991b1b' : '#854d0e'),
                              padding: '8px 16px',
                              borderRadius: '8px',
                              display: 'inline-block',
                              fontWeight: 800,
                              minWidth: '120px'
                            }}>
                              {parseFloat(camp.conversion_rate).toLocaleString('vi-VN')} đ <span style={{fontSize:'0.7rem', fontWeight:600}}>/ Lead</span>
                            </div>
                         </td>
                       </tr>
                     ))}
                     {leaderboard.length === 0 && (
                       <tr>
                         <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có dữ liệu chiến dịch.</td>
                       </tr>
                     )}
                   </tbody>
                </table>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Embedded CSS to ensure filter panel matches the exact styling from other dashboard components */}
      <style>{`
        /* Fixed Single-Row Filter Panel */
        .executive-filter-panel {
          background: #ffffff;
          padding: 1rem 1.5rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.05);
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .filter-scroll-container {
          width: 100%;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .filter-scroll-container::-webkit-scrollbar {
          display: none;
        }
        
        .horizontal-filter-row {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          align-items: center !important;
          gap: 2rem !important;
          min-width: max-content;
          justify-content: flex-start;
          width: 100%;
        }

        .segmented-control.glass {
          display: flex;
          background: #f8fafc;
          padding: 5px;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          flex-shrink: 0;
          gap: 4px;
        }
        .segment-btn {
          padding: 7px 15px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          border-radius: 10px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
        }
        .segment-btn:hover {
          color: #be185d;
          background: rgba(255, 255, 255, 0.6);
        }
        .segment-btn.active {
          background: #ffffff;
          color: #be185d;
          box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        }

        .filter-divider {
          width: 1px;
          height: 24px;
          background: #e2e8f0;
          flex-shrink: 0;
        }

        .executive-select-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .executive-select-wrapper::after {
          content: '▾';
          position: absolute;
          right: 12px;
          font-size: 12px;
          color: #be185d;
          pointer-events: none;
        }
        .executive-select-wrapper select {
          padding: 7px 30px 7px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          color: #1e293b;
          outline: none;
          cursor: pointer;
          appearance: none;
          min-width: 100px;
        }
      `}</style>
    </div>
  );
};

export default ManagementDashboardTab;
