import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Users,
  TrendingUp,
  Target,
  AlertCircle,
  Calendar,
  PieChart as PieChartIcon,
  BarChart3,
  ArrowUpRight,
  Clock,
  Filter,
  Globe,
  Briefcase
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from 'recharts';

const LeadsDashboardTab = ({ setEditingLead }) => {
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
      console.error('Error fetching lead stats:', err);
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
          <span className="text-indigo-500 font-bold tracking-wider">ĐANG TẢI DỮ LIỆU DASHBOARD...</span>
        </div>
      </div>
    );
  }

  // Calculate derived stats
  const totalLeads = stats.statusStats.reduce((acc, curr) => acc + curr.count, 0);
  const wonLeads = stats.statusStats.find(s => s.status === 'Chốt đơn')?.count || 0;
  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
  const newLeads = stats.statusStats.find(s => s.status === 'Mới')?.count || 0;
  const overdueCount = stats.overdueLeads?.length || 0;

  const monthOptions = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const quickFilters = ['today', 'week', 'month'];
  const advancedFilters = ['month-select', 'quarter', 'year', 'custom'];

  return (
    <div className="dashboard-content">
      {/* Executive Single-Row Filter Bar */}
      <div className="executive-filter-panel mb-12">
        <div className="filter-scroll-container">
          <div className="horizontal-filter-row">
            {/* Quick Filters Group */}
            <div className="segmented-control glass text-white">
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

      {/* KPI Section - Premium Row */}
      <div className="kpi-grid mb-16">
        <div className="stat-card premium blue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">TỔNG LEADS</span>
              <div className="stat-icon-glass"><Users size={20} /></div>
            </div>
            <div className="stat-value">{totalLeads}</div>
            <div className="stat-footer">
              <ArrowUpRight size={14} />
              <span>Dữ liệu thời gian thực</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium green">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">TY LỆ CHỐT</span>
              <div className="stat-icon-glass"><TrendingUp size={20} /></div>
            </div>
            <div className="stat-value">{conversionRate}%</div>
            <div className="stat-footer">
              <TrendingUp size={14} />
              <span>Hiệu suất chuyển đổi</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium orange">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">LEAD MỚI</span>
              <div className="stat-icon-glass"><Target size={20} /></div>
            </div>
            <div className="stat-value">{newLeads}</div>
            <div className="stat-footer">
              <Clock size={14} />
              <span>Lead chưa xử lý</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium rose">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">CẦN CHĂM SÓC</span>
              <div className="stat-icon-glass"><AlertCircle size={20} /></div>
            </div>
            <div className="stat-value">{overdueCount}</div>
            <div className="stat-footer">
              <AlertCircle size={14} />
              <span>Ưu tiên liên hệ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 1: Pie Charts */}
      <div className="analytics-row mb-16">
        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Phân bổ theo Trạng thái</h3>
              <p className="card-subtitle">Chi tiết trạng thái xử lý lead</p>
            </div>
            <PieChartIcon size={20} className="text-indigo-500" />
          </div>
          <div className="mt-6" style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  isAnimationActive={false}
                  label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.statusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Phân bổ theo Khối (BU)</h3>
              <p className="card-subtitle">Hiệu suất theo từng đơn vị kinh doanh</p>
            </div>
            <Briefcase size={20} className="text-violet-500" />
          </div>
          <div className="mt-6" style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.buStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={105}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="name"
                  isAnimationActive={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.buStats.map((entry, index) => (
                    <Cell key={`cell-bu-${index}`} fill={COLORS[(index + 4) % COLORS.length]} cornerRadius={8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 2: Bar Charts */}
      <div className="analytics-row mb-16">
        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Nguồn Marketing</h3>
              <p className="card-subtitle">Hiệu quả các kênh tiếp cận</p>
            </div>
            <BarChart3 size={20} className="text-amber-500" />
          </div>
          <div className="mt-8" style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sourceStats} layout="vertical" margin={{ left: 20, right: 30, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="source"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} leads`, 'Số lượng']}
                />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={24} isAnimationActive={false}>
                  {stats.sourceStats.map((entry, index) => (
                    <Cell key={`cell-source-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                  <LabelList dataKey="count" position="right" style={{ fontSize: '11px', fontWeight: 'bold', fill: '#64748b' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Phân bổ theo Quốc gia</h3>
              <p className="card-subtitle">Sức hút theo từng địa điểm du lịch</p>
            </div>
            <Globe size={20} className="text-cyan-500" />
          </div>
          <div className="mt-8" style={{ height: '350px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.destinationStats} layout="vertical" margin={{ left: 20, right: 30, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 700, fill: '#475569' }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 8, 8, 0]} barSize={24} isAnimationActive={false}>
                  <LabelList dataKey="count" position="right" style={{ fontSize: '11px', fontWeight: 'bold', fill: '#64748b' }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 3: Quality & Urgent Actions */}
      <div className="analytics-row mb-16">
        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Phân loại Chất lượng Lead</h3>
              <p className="card-subtitle">Tiềm năng vs Thực tế (Nóng/Ấm/Lạnh)</p>
            </div>
            <Target size={20} className="text-rose-500" />
          </div>
          <div className="mt-6" style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.classificationStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  isAnimationActive={false}
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {stats.classificationStats.map((entry, index) => (
                    <Cell
                      key={`cell-quality-${index}`}
                      fill={
                        entry.name === 'Nóng' ? '#ef4444' :
                          entry.name === 'Tiềm năng' ? '#10b981' :
                            entry.name === 'Ấm' ? '#f59e0b' :
                              entry.name === 'Lạnh' ? '#6366f1' : COLORS[index % COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Cần chăm sóc ngay (Top 5)</h3>
              <p className="card-subtitle">Danh sách Lead quá hạn liên hệ</p>
            </div>
            <AlertCircle size={20} className="text-red-600" />
          </div>
          <div className="mt-6 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-50">
                    <th className="text-left py-3 font-bold text-[10px] uppercase">Khách hàng</th>
                    <th className="text-left py-3 font-bold text-[10px] uppercase">Nhân viên</th>
                    <th className="text-right py-3 font-bold text-[10px] uppercase">Liên hệ lần cuối</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.overdueLeads && stats.overdueLeads.length > 0 ? (
                    stats.overdueLeads.map((lead, idx) => (
                      <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-red-50 transition-colors cursor-pointer" onClick={() => setEditingLead(lead)}>
                        <td className="py-3 pr-2">
                          <div className="font-bold text-slate-700">{lead.name}</div>
                          <div className="text-[10px] text-slate-400">{lead.phone || 'Không có SĐT'}</div>
                        </td>
                        <td className="py-3 text-slate-600 font-medium">{lead.staff_name || 'Chưa giao'}</td>
                        <td className="py-3 text-right">
                          <div className="text-red-500 font-bold text-[11px]">
                            {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="py-10 text-center text-slate-400 font-medium italic">
                        Tuyệt vời! Không có lead quá hạn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-content {
          padding: 1.5rem 0 4rem 0;
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
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }
        .stat-card.premium {
          padding: 1.75rem;
          border-radius: 28px;
          border: none;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.1);
        }
        .stat-card.blue { background: linear-gradient(135deg, #6366f1 0%, #4447e5 100%); }
        .stat-card.green { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
        .stat-card.orange { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
        .stat-card.rose { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }
        .stat-icon-glass {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -1px;
          color: white !important;
        }
        .stat-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 700;
          opacity: 0.8;
          margin-top: 0.5rem;
        }

        .analytics-card.professional {
          background: white;
          padding: 2rem;
          border-radius: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .card-header h3 {
          font-size: 1.125rem;
          font-weight: 900;
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

export default LeadsDashboardTab;
