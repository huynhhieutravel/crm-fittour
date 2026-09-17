import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  Users,
  Phone,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Filter,
  BarChart3,
  Calendar,
  Search,
  ArrowUpDown,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  ShieldAlert
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

const StaffPerformanceTab = ({ bus = [] }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBU, setSelectedBU] = useState('all');
  const [viewMode, setViewMode] = useState('staff'); // 'staff' | 'bu'
  const [dateFilter, setDateFilter] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('total_leads');
  const [sortOrder, setSortOrder] = useState('desc');

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
      if (selectedBU !== 'all') params.append('buGroup', selectedBU);

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
  }, [dateFilter, selectedBU]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Helper BU badge
  const getBUBadge = (buInput) => {
    let name = '';
    if (Array.isArray(buInput) && buInput.length > 0) name = buInput[0];
    else if (typeof buInput === 'string') name = buInput;
    else name = 'Chưa xếp BU';

    const b = name.toUpperCase();
    if (b.includes('BU1')) return { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', label: 'BU1' };
    if (b.includes('BU2')) return { bg: '#f5f3ff', color: '#6d28d9', border: '#ddd6fe', label: 'BU2' };
    if (b.includes('BU3')) return { bg: '#fffbeb', color: '#b45309', border: '#fde68a', label: 'BU3' };
    if (b.includes('BU4')) return { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0', label: 'BU4' };
    if (b.includes('BU5')) return { bg: '#fdf2f8', color: '#be185d', border: '#fbcfe8', label: 'BU5' };
    return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1', label: name || 'Khác' };
  };

  // Staff data processing
  const staffData = useMemo(() => {
    const raw = (stats?.staffStats || []).map(s => {
      const primaryBU = Array.isArray(s.bus) && s.bus.length > 0 ? s.bus[0] : (typeof s.bus === 'string' ? s.bus : 'Chưa xếp BU');
      return {
        ...s,
        total_leads: Number(s.total_leads) || 0,
        has_phone: Number(s.has_phone) || 0,
        in_contact: Number(s.in_contact) || 0,
        is_new: Number(s.is_new) || 0,
        unresponsive: Number(s.unresponsive) || 0,
        phone_rate: Number(s.phone_rate) || 0,
        contact_rate: Number(s.contact_rate) || 0,
        primary_bu: primaryBU
      };
    });

    return raw.filter(s => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.username && s.username.toLowerCase().includes(term)) ||
        (s.primary_bu && s.primary_bu.toLowerCase().includes(term))
      );
    }).sort((a, b) => {
      const valA = a[sortBy] ?? 0;
      const valB = b[sortBy] ?? 0;
      return sortOrder === 'desc' ? valB - valA : valA - valB;
    });
  }, [stats?.staffStats, searchTerm, sortBy, sortOrder]);

  // BU data processing
  const buData = useMemo(() => {
    return (stats?.buStats || []).map(b => ({
      ...b,
      name: b.name || 'Chưa phân loại',
      total_leads: Number(b.count) || 0,
      has_phone: Number(b.has_phone) || 0,
      in_contact: Number(b.in_contact) || 0,
      is_new: Number(b.is_new) || 0,
      unresponsive: Number(b.unresponsive) || 0,
      staff_count: Number(b.staff_count) || 0,
      phone_rate: Number(b.phone_rate) || 0,
      contact_rate: Number(b.contact_rate) || 0
    })).sort((a, b) => b.total_leads - a.total_leads);
  }, [stats?.buStats]);

  // Totals calculations
  const totalAssignedLeads = useMemo(() => staffData.reduce((acc, s) => acc + s.total_leads, 0), [staffData]);
  const totalHasPhone = useMemo(() => staffData.reduce((acc, s) => acc + s.has_phone, 0), [staffData]);
  const totalInContact = useMemo(() => staffData.reduce((acc, s) => acc + s.in_contact, 0), [staffData]);
  const totalIsNew = useMemo(() => staffData.reduce((acc, s) => acc + s.is_new, 0), [staffData]);
  const overallPhoneRate = totalAssignedLeads > 0 ? ((totalHasPhone / totalAssignedLeads) * 100).toFixed(1) : 0;
  const overallContactRate = totalAssignedLeads > 0 ? (((totalAssignedLeads - totalIsNew) / totalAssignedLeads) * 100).toFixed(1) : 0;

  const monthOptions = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ];

  const quickFilters = ['today', 'week', 'month'];
  const advancedFilters = ['month-select', 'quarter', 'year', 'custom'];

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium bg-slate-900/10 rounded-3xl m-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-indigo-500 font-bold tracking-wider uppercase">Đang tải hiệu suất nhân viên & BU...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="executive-dashboard p-6 md:p-8">
      {/* 1. Header & Filter Bar */}
      <div className="executive-filter-panel mb-8">
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
                  {f === 'today' ? 'Hôm nay' : f === 'week' ? 'Tuần này' : 'Tháng này'}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="segmented-control glass">
              <button
                onClick={() => setViewMode('staff')}
                className={`segment-btn ${viewMode === 'staff' ? 'active' : ''}`}
              >
                👤 Nhân viên
              </button>
              <button
                onClick={() => setViewMode('bu')}
                className={`segment-btn ${viewMode === 'bu' ? 'active' : ''}`}
              >
                🏢 Khối BU
              </button>
            </div>

            <div className="filter-divider"></div>

            {/* Advanced Filters Group */}
            <div className="segmented-control glass">
              {advancedFilters.map((f) => (
                <button
                  key={f}
                  onClick={() => setDateFilter(f)}
                  className={`segment-btn ${dateFilter === f ? 'active' : ''}`}
                >
                  {f === 'month-select' ? 'Tháng ▾' : f === 'quarter' ? 'Quý' : f === 'year' ? 'Năm' : 'Tùy chọn'}
                </button>
              ))}
            </div>

            {/* Month Select */}
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

            {/* Quarter Select */}
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

            {/* Year Select */}
            {(dateFilter === 'month-select' || dateFilter === 'quarter' || dateFilter === 'year') && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>Năm {y}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div className="flex flex-row flex-nowrap items-center gap-2">
                <div className="date-input-group premium">
                  <Calendar size={13} className="text-indigo-500" />
                  <input
                    type="date"
                    value={customRange.startDate}
                    onChange={e => setCustomRange({ ...customRange, startDate: e.target.value })}
                  />
                </div>
                <span className="text-slate-400 font-bold">→</span>
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

            {/* BU Filter (For Staff View) */}
            {viewMode === 'staff' && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedBU}
                  onChange={(e) => setSelectedBU(e.target.value)}
                >
                  <option value="all">🏢 Tất cả Khối BU</option>
                  {bus.filter(b => b.is_active !== false && !['khác', 'marketing', 'kế toán'].includes(b.label?.toLowerCase())).map((bu) => (
                    <option key={bu.id} value={bu.id}>{bu.label || bu.id}</option>
                  ))}
                  <option value="NO_BU">Chưa xếp khối</option>
                </select>
              </div>
            )}

            {/* Submit Action for Advanced Filter */}
            {advancedFilters.includes(dateFilter) && (
              <button onClick={fetchStats} className="confirm-btn-premium">
                <Filter size={14} />
                <span>Xem số liệu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top 4 Executive KPI Cards (Real Operational Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {/* Card 1: Tổng Lead Phân Bổ */}
        <div className="stat-card premium blue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">TỔNG LEAD PHÂN BỔ</span>
              <div className="stat-icon-glass"><Users size={22} /></div>
            </div>
            <div className="stat-value">{totalAssignedLeads}</div>
            <div className="stat-footer">
              <span>{viewMode === 'staff' ? `${staffData.length} nhân sự đang xử lý` : `${buData.length} khối BU`}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Có SĐT */}
        <div className="stat-card premium purple">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">LEAD CÓ SĐT</span>
              <div className="stat-icon-glass"><Phone size={22} /></div>
            </div>
            <div className="stat-value">{totalHasPhone}</div>
            <div className="stat-footer">
              <TrendingUp size={14} />
              <span>Tỷ lệ có SĐT: <strong>{overallPhoneRate}%</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Đang Chăm Sóc */}
        <div className="stat-card premium green">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">ĐANG CHĂM SÓC</span>
              <div className="stat-icon-glass"><MessageSquare size={22} /></div>
            </div>
            <div className="stat-value">{totalInContact}</div>
            <div className="stat-footer">
              <CheckCircle2 size={14} />
              <span>Tỷ lệ tiếp cận: <strong>{overallContactRate}%</strong></span>
            </div>
          </div>
        </div>

        {/* Card 4: Tồn Đọng Chưa Gọi */}
        <div className={`stat-card premium ${totalIsNew > 0 ? 'rose' : 'teal'}`}>
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">TỒN ĐỌNG (CHƯA XỬ LÝ)</span>
              <div className="stat-icon-glass">
                {totalIsNew > 0 ? <AlertCircle size={22} /> : <CheckCircle2 size={22} />}
              </div>
            </div>
            <div className="stat-value">{totalIsNew}</div>
            <div className="stat-footer">
              <Clock size={14} />
              <span>{totalIsNew > 0 ? 'Lead ở trạng thái Mới chưa chăm sóc' : 'Đã tiếp cận 100% lead'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Chart: Tải công việc & Tiến trình chăm sóc */}
      <div className="analytics-card professional p-6 md:p-8 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 size={20} className="text-indigo-600" />
              So sánh Khối lượng & Năng suất {viewMode === 'staff' ? 'Nhân Viên' : 'Khối BU'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Phân bổ số lượng lead được giao, lead có SĐT, số lượng đang chăm sóc và tồn đọng
            </p>
          </div>
          <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {viewMode === 'staff' ? `Đang hiển thị ${staffData.length} nhân sự` : `Đang hiển thị ${buData.length} khối BU`}
          </div>
        </div>

        <div style={{ height: '380px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={viewMode === 'staff' ? staffData.slice(0, 15) : buData} 
              margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
                interval={0}
                angle={-35}
                textAnchor="end"
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar dataKey="total_leads" name="Tổng Lead" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false}>
                <LabelList dataKey="total_leads" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#6366f1' }} />
              </Bar>
              <Bar dataKey="has_phone" name="Có SĐT" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false}>
                <LabelList dataKey="has_phone" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#0ea5e9' }} />
              </Bar>
              <Bar dataKey="in_contact" name="Đang chăm sóc" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
              <Bar dataKey="is_new" name="Tồn (Mới)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={20} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Detailed Data Table (Staff or BU) */}
      <div className="analytics-card professional p-6 md:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layers size={20} className="text-indigo-600" />
              {viewMode === 'staff' ? 'Bảng Thống Kê Chi Tiết Từng Nhân Viên' : 'Bảng Thống Kê Từng Khối BU'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Click vào tiêu đề cột để sắp xếp theo chỉ số tương ứng
            </p>
          </div>

          {/* Search Box */}
          {viewMode === 'staff' && (
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên nhân viên, BU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-extrabold uppercase text-slate-600 tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">
                  {viewMode === 'staff' ? 'Nhân Viên' : 'Khối BU'}
                </th>
                {viewMode === 'staff' && (
                  <th className="py-3 px-4 text-center">Khối BU</th>
                )}
                <th 
                  className="py-3 px-4 text-center cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort('total_leads')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Tổng Lead</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-center cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort('has_phone')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Có SĐT</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-center cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort('in_contact')}
                >
                  <div className="inline-flex items-center gap-1">
                    <span>Đang chăm sóc</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th 
                  className="py-3 px-4 text-center cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort('is_new')}
                >
                  <div className="inline-flex items-center gap-1 text-amber-600">
                    <span>Tồn đọng (Mới)</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="py-3 px-4 text-center text-slate-400">
                  Không phản hồi
                </th>
                <th 
                  className="py-3 px-4 text-right cursor-pointer hover:text-indigo-600 transition-colors"
                  onClick={() => handleSort('contact_rate')}
                >
                  <div className="inline-flex items-center justify-end gap-1">
                    <span>Tỷ lệ tiếp cận</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {viewMode === 'staff' ? (
                staffData.length > 0 ? (
                  staffData.map((s, idx) => {
                    const badge = getBUBadge(s.primary_bu);
                    return (
                      <tr key={s.staff_id || idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                              {(s.name || s.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{s.name || s.username}</div>
                              <div className="text-[10px] text-slate-400">@{s.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span 
                            style={{ 
                              background: badge.bg, 
                              color: badge.color, 
                              border: `1px solid ${badge.border}` 
                            }} 
                            className="inline-block px-2.5 py-1 rounded-md text-[11px] font-extrabold tracking-wide"
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-slate-700 text-sm">
                          {s.total_leads}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-bold text-sky-600 text-sm">{s.has_phone}</div>
                          <div className="text-[10px] text-slate-400">{s.phone_rate}% SĐT</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-emerald-600 text-sm">{s.in_contact}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {s.is_new > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle size={11} /> {s.is_new}
                            </span>
                          ) : (
                            <span className="text-slate-300 font-semibold">—</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                          {s.unresponsive > 0 ? s.unresponsive : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="font-extrabold text-slate-700 text-xs">{s.contact_rate}%</span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${Math.min(100, s.contact_rate)}%`,
                                  background: s.contact_rate >= 90 ? '#10b981' : s.contact_rate >= 60 ? '#6366f1' : '#f59e0b'
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-slate-400 font-medium">
                      Không tìm thấy nhân viên phù hợp theo bộ lọc
                    </td>
                  </tr>
                )
              ) : (
                buData.map((b, idx) => {
                  const badge = getBUBadge(b.name);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <span 
                          style={{ 
                            background: badge.bg, 
                            color: badge.color, 
                            border: `1px solid ${badge.border}` 
                          }} 
                          className="inline-block px-3 py-1.5 rounded-md text-xs font-extrabold tracking-wide"
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-extrabold text-slate-700 text-sm">
                        {b.total_leads}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-bold text-sky-600 text-sm">{b.has_phone}</div>
                        <div className="text-[10px] text-slate-400">{b.phone_rate}% SĐT</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600 text-sm">
                        {b.in_contact}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {b.is_new > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <AlertCircle size={11} /> {b.is_new}
                          </span>
                        ) : (
                          <span className="text-slate-300 font-semibold">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                        {b.unresponsive > 0 ? b.unresponsive : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="font-extrabold text-slate-700 text-xs">{b.contact_rate}%</span>
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                            <div 
                              className="h-full rounded-full transition-all duration-300"
                              style={{ 
                                width: `${Math.min(100, b.contact_rate)}%`,
                                background: b.contact_rate >= 90 ? '#10b981' : b.contact_rate >= 60 ? '#6366f1' : '#f59e0b'
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .executive-dashboard {
          padding-bottom: 4rem;
        }

        .executive-filter-panel {
          background: #ffffff;
          padding: 1rem 1.25rem;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.04);
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
          gap: 1.25rem !important;
          min-width: max-content;
          justify-content: flex-start;
          width: 100%;
        }

        .segmented-control.glass {
          display: flex;
          background: #f8fafc;
          padding: 4px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          flex-shrink: 0;
          gap: 3px;
        }
        .segment-btn {
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          border-radius: 9px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
        }
        .segment-btn:hover {
          color: #4f46e5;
          background: rgba(255, 255, 255, 0.8);
        }
        .segment-btn.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }

        .filter-divider {
          width: 1px;
          height: 22px;
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
          padding: 6px 30px 6px 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
          outline: none;
          cursor: pointer;
          appearance: none;
          min-width: 110px;
        }

        .date-input-group.premium {
          display: flex;
          align-items: center; gap: 6px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 5px 10px;
          border-radius: 10px;
          flex-shrink: 0;
        }
        .date-input-group input {
          border: none;
          outline: none;
          background: transparent;
          font-size: 11px;
          font-weight: 700;
          color: #1e293b;
        }

        .confirm-btn-premium {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background: #4f46e5;
          color: white;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .confirm-btn-premium:hover {
          background: #4338ca;
        }

        /* KPI Premium Cards */
        .stat-card.premium {
          padding: 1.5rem;
          border-radius: 20px;
          border: none;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s ease;
        }
        .stat-card.premium:hover {
          transform: translateY(-2px);
        }
        .stat-card.blue { background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); }
        .stat-card.purple { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); }
        .stat-card.green { background: linear-gradient(135deg, #059669 0%, #10b981 100%); }
        .stat-card.teal { background: linear-gradient(135deg, #0d9488 0%, #14b8a6 100%); }
        .stat-card.rose { background: linear-gradient(135deg, #e11d48 0%, #f43f5e 100%); }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          opacity: 0.9;
        }
        .stat-icon-glass {
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(6px);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-value {
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: -0.5px;
          color: white !important;
          line-height: 1.1;
        }
        .stat-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          opacity: 0.9;
          margin-top: 0.5rem;
        }

        .analytics-card.professional {
          background: white;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
      `}</style>
    </div>
  );
};

export default StaffPerformanceTab;
