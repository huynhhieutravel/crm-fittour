import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  UserCheck,
  TrendingUp,
  Target,
  Filter,
  BarChart3,
  Users,
  Award,
  Zap,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

const StaffPerformanceTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const formatLocalDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "";
    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  const getDateRange = useCallback((filter) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (filter) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const day = start.getDay() || 7;
        if (day !== 1) start.setHours(-24 * (day - 1));
        start.setHours(0, 0, 0, 0);
        break;
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'month-select':
        start = new Date(selectedYear, selectedMonth, 1);
        end = new Date(selectedYear, selectedMonth + 1, 0);
        break;
      case 'quarter':
        start = new Date(selectedYear, (selectedQuarter - 1) * 3, 1);
        const qEndMonth = (selectedQuarter - 1) * 3 + 3;
        end = new Date(selectedYear, qEndMonth, 0);
        break;
      case 'year':
        start = new Date(selectedYear, 0, 1);
        end = new Date(selectedYear, 12, 0);
        break;
      case 'custom':
        return customRange;
      default:
        return { startDate: '', endDate: '' };
    }

    return {
      startDate: formatLocalDate(start),
      endDate: formatLocalDate(end)
    };
  }, [customRange, selectedMonth, selectedYear, selectedQuarter]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const { startDate, endDate } = getDateRange(dateFilter);

      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await axios.get(`/api/leads/stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching staff stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const quickFilters = ['today', 'week', 'month'];
    if (quickFilters.includes(dateFilter)) {
      fetchStats();
    }
  }, [dateFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium bg-slate-900/10 rounded-3xl m-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-indigo-500 font-bold tracking-wider uppercase">Đang tải hiệu suất nhân viên...</span>
        </div>
      </div>
    );
  }

  const staffData = stats.staffStats.map(s => ({
    ...s,
    conversion: s.total_leads > 0 ? parseFloat(((s.won_leads / s.total_leads) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.won_leads - a.won_leads);

  const topPerformer = staffData[0];

  const monthOptions = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const quickFilters = ['today', 'week', 'month'];
  const advancedFilters = ['month-select', 'quarter', 'year', 'custom'];

  return (
    <div className="executive-dashboard p-8">
      {/* Executive Single-Row Filter Bar */}
      <div className="executive-filter-panel mb-12">
        <div className="filter-scroll-container">
          <div className="horizontal-filter-row">
            {/* Quick Filters Group */}
            <div className="segmented-control glass">
              {quickFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`segment-btn ${dateFilter === f ? 'active' : ''}`}
                >
                  {f === 'today' ? 'Hôm nay' :
                    f === 'week' ? 'Tuần này' : 'Tháng này'}
                </button>
              ))}
            </div>

            {/* Visual Separator */}
            <div className="filter-divider"></div>

            {/* Advanced Filters Group */}
            <div className="segmented-control glass">
              {advancedFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`segment-btn ${dateFilter === f ? 'active' : ''}`}
                >
                  {f === 'month-select' ? 'Tháng' :
                    f === 'quarter' ? 'Quý' :
                      f === 'year' ? 'Năm' : 'Tùy chọn'}
                </button>
              ))}
            </div>

            {/* Dynamic Inputs (Flattened) */}
            {dateFilter === 'month-select' && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {monthOptions.map((m, i) => (
                    <option key={i} value={i}>{m}</option>
                  ))}
                </select>
              </div>
            )}

            {dateFilter === 'quarter' && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4].map(q => (
                    <option key={q} value={q}>Quý {q}</option>
                  ))}
                </select>
              </div>
            )}

            {(dateFilter === 'month-select' || dateFilter === 'quarter' || dateFilter === 'year') && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {[2023, 2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
              </div>
            )}

            {dateFilter === 'custom' && (
              <div className="flex flex-row flex-nowrap items-center gap-3">
                <div className="date-input-group premium">
                  <Calendar size={13} className="text-indigo-500" />
                  <input
                    type="date"
                    value={customRange.startDate}
                    onChange={e => setCustomRange({ ...customRange, startDate: e.target.value })}
                  />
                </div>
                <span className="text-slate-300 font-bold">→</span>
                <div className="date-input-group premium">
                  <Calendar size={13} className="text-indigo-500" />
                  <input
                    type="date"
                    value={customRange.endDate}
                    onChange={e => setCustomRange({ ...customRange, endDate: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Final Action */}
            {advancedFilters.includes(dateFilter) && (
              <button
                onClick={fetchStats}
                className="confirm-btn-premium"
              >
                <Filter size={14} />
                <span>Xác nhận</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Highlights - Premium Row */}
      <div className="kpi-grid mb-16">
        <div className="stat-card premium blue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">BEST SELLER</span>
              <div className="stat-icon-glass"><Award size={20} /></div>
            </div>
            <div className="stat-value" style={{ fontSize: '1.75rem' }}>{topPerformer?.name || '---'}</div>
            <div className="stat-footer">
              <TrendingUp size={14} />
              <span>{topPerformer?.won_leads || 0} chốt đơn thành công</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium green">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">AVG CONVERSION</span>
              <div className="stat-icon-glass"><Zap size={20} /></div>
            </div>
            <div className="stat-value">
              {(staffData.reduce((acc, curr) => acc + parseFloat(curr.conversion), 0) / (staffData.length || 1)).toFixed(1)}%
            </div>
            <div className="stat-footer">
              <Zap size={14} />
              <span>Tỷ lệ chốt trung bình toàn đội</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium orange">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">ACTIVE STAFF</span>
              <div className="stat-icon-glass"><Users size={20} /></div>
            </div>
            <div className="stat-value">{staffData.length}</div>
            <div className="stat-footer">
              <Users size={14} />
              <span>Nhân sự đang hoạt động</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 gap-12 mb-16">
        <div className="analytics-card professional p-8">
          <div className="card-header border-0 mb-8">
            <div>
              <h3>So sánh Hiệu suất Nhân viên</h3>
              <p className="card-subtitle">Dựa trên số lượng leads được giao và tỷ lệ chốt thành công</p>
            </div>
            <UserCheck size={24} className="text-emerald-500" />
          </div>

          <div style={{ height: '450px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 600, fill: '#64748b' }}
                  interval={0}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="top" align="right" iconType="circle" />
                <Bar dataKey="total_leads" name="Tổng Leads" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} isAnimationActive={false}>
                  <LabelList dataKey="total_leads" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#6366f1' }} />
                </Bar>
                <Bar dataKey="won_leads" name="Chốt đơn" fill="#10b981" radius={[6, 6, 0, 0]} barSize={32} isAnimationActive={false}>
                  <LabelList dataKey="won_leads" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#10b981' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-row min-h-[400px]">
          <div className="analytics-card professional p-6">
            <div className="card-header border-0 mb-6">
              <h3><TrendingUp size={20} color="#6366f1" /> Tỷ lệ Chốt (%)</h3>
            </div>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={staffData} layout="vertical" margin={{ left: 30, right: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    width={100}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none' }}
                  />
                  <Bar dataKey="conversion" name="Tỷ lệ chốt %" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} isAnimationActive={false}>
                    {staffData.map((entry, index) => (
                      <Cell key={`cell-rate-${index}`} fill={parseFloat(entry.conversion) > 20 ? '#10b981' : '#6366f1'} />
                    ))}
                    <LabelList dataKey="conversion" position="right" formatter={(v) => `${v}%`} style={{ fontSize: '10px', fontWeight: 'bold' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="analytics-card professional p-6">
            <div className="card-header border-0 mb-4">
              <h3><BarChart3 size={20} color="#f59e0b" /> Bảng xếp hạng chi tiết</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-50">
                    <th className="text-left py-3 font-bold uppercase tracking-wider text-[10px]">Nhân viên</th>
                    <th className="text-center py-3 font-bold uppercase tracking-wider text-[10px]">Tổng</th>
                    <th className="text-center py-3 font-bold uppercase tracking-wider text-[10px]">Chốt</th>
                    <th className="text-right py-3 font-bold uppercase tracking-wider text-[10px]">% Chốt</th>
                  </tr>
                </thead>
                <tbody>
                  {staffData.map((s, idx) => (
                    <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-bold text-slate-700">{s.name}</td>
                      <td className="py-3 text-center text-slate-500 font-medium">{s.total_leads}</td>
                      <td className="py-3 text-center text-teal-600 font-bold">{s.won_leads}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-1 rounded-lg font-bold text-xs ${parseFloat(s.conversion) > 20 ? 'bg-teal-50 text-teal-600' :
                            parseFloat(s.conversion) > 10 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                          }`}>
                          {s.conversion}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .executive-dashboard {
          padding-bottom: 4rem;
        }

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
          color: #6366f1;
          background: rgba(255, 255, 255, 0.6);
        }
        .segment-btn.active {
          background: #ffffff;
          color: #6366f1;
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
          color: #6366f1;
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

        .date-input-group.premium {
          display: flex;
          align-items: center; gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 5px 12px;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .date-input-group input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 10px;
          font-weight: 800;
          color: #1e293b;
        }

        .confirm-btn-premium {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          background: #6366f1;
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .confirm-btn-premium:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        /* KPI Premium Cards */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .stat-card.premium {
          padding: 2rem;
          border-radius: 32px;
          border: none;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.1);
        }
        .stat-card.blue { background: linear-gradient(135deg, #6366f1 0%, #4447e5 100%); }
        .stat-card.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .stat-card.orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .stat-icon-glass {
          width: 42px;
          height: 42px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-value {
          font-size: 2.25rem;
          font-weight: 900;
          letter-spacing: -1px;
          color: white !important;
        }
        .stat-footer {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          opacity: 0.8;
          margin-top: 0.5rem;
        }

        .analytics-card.professional {
          background: white;
          padding: 2.5rem;
          border-radius: 36px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .card-header h3 {
          font-size: 1.25rem;
          font-weight: 950;
          color: #1e293b;
        }
        .analytics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .analytics-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default StaffPerformanceTab;
