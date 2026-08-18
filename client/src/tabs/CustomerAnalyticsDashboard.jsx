import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Repeat, TrendingUp, TrendingDown, AlertTriangle, 
  CheckCircle2, DollarSign, Calendar, Filter, RefreshCw, Layers, 
  ShieldAlert, ExternalLink, Search, Sparkles, Award, PieChart as PieChartIcon,
  BarChart3, ArrowUpRight, HelpCircle, Phone, UserCheck, AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#06b6d4', '#ec4899', '#8b5cf6', '#ef4444', '#64748b'];

const formatMoney = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0 ₫';
  return Number(val).toLocaleString('vi-VN') + ' ₫';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '---';
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};

const CustomerAnalyticsDashboard = ({ 
  onViewCustomer, 
  onViewLead, 
  onViewBooking,
  currentUser 
}) => {
  const [period, setPeriod] = useState('month');
  const [customDates, setCustomDates] = useState({ startDate: '', endDate: '' });
  const [loading, setLoading] = useState(true);
  const [overviewData, setOverviewData] = useState(null);
  const [growthChartData, setGrowthChartData] = useState([]);
  const [auditData, setAuditData] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [activeAuditTab, setActiveAuditTab] = useState('orphan_bookings');
  const [auditSearch, setAuditSearch] = useState('');

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = { period };
      if (period === 'custom' && customDates.startDate && customDates.endDate) {
        params.startDate = customDates.startDate;
        params.endDate = customDates.endDate;
      }

      const [resOverview, resChart] = await Promise.all([
        axios.get('/api/customers/analytics/overview', {
          params,
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/customers/analytics/growth-chart?months=12', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setOverviewData(resOverview.data);
      setGrowthChartData(resChart.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [period, customDates]);

  const fetchAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/customers/analytics/data-audit?type=all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAuditData(res.data);
    } catch (err) {
      console.error('Error fetching audit:', err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const kpi = overviewData?.kpi || {};
  const integrity = overviewData?.dataIntegritySummary || {};

  // Compute Active Period Display Text
  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Hôm nay';
      case 'yesterday': return 'Hôm qua';
      case 'week': return 'Tuần này';
      case 'month': return 'Tháng này';
      case 'last_month': return 'Tháng trước';
      case 'quarter': return 'Quý này';
      case 'year': return 'Năm nay';
      case 'custom': return `${formatDate(customDates.startDate)} - ${formatDate(customDates.endDate)}`;
      default: return 'Tháng này';
    }
  };

  return (
    <div className="customer-analytics-dashboard animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      
      {/* 1. Header Toolbar & Filters */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.25rem 1.5rem',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 className="text-primary" size={26} />
            DASHBOARD PHÂN TÍCH KHÁCH HÀNG & CHẤT LƯỢNG DỮ LIỆU
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
            Đo lường tăng trưởng khách mới, khách cũ quay lại, tỷ lệ giữ chân & kiểm toán dữ liệu chưa chuẩn hoá
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '10px', gap: '2px' }}>
            {[
              { key: 'today', label: 'Hôm nay' },
              { key: 'week', label: 'Tuần này' },
              { key: 'month', label: 'Tháng này' },
              { key: 'last_month', label: 'Tháng trước' },
              { key: 'quarter', label: 'Quý này' },
              { key: 'year', label: 'Năm nay' },
              { key: 'custom', label: 'Tùy chọn' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setPeriod(tab.key)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: period === tab.key ? 700 : 500,
                  background: period === tab.key ? '#ffffff' : 'transparent',
                  color: period === tab.key ? '#0284c7' : '#64748b',
                  boxShadow: period === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {period === 'custom' && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input 
                type="date"
                className="filter-input"
                style={{ height: '36px', fontSize: '0.82rem', padding: '0 8px' }}
                value={customDates.startDate}
                onChange={e => setCustomDates({ ...customDates, startDate: e.target.value })}
              />
              <span style={{ color: '#94a3b8' }}>-</span>
              <input 
                type="date"
                className="filter-input"
                style={{ height: '36px', fontSize: '0.82rem', padding: '0 8px' }}
                value={customDates.endDate}
                onChange={e => setCustomDates({ ...customDates, endDate: e.target.value })}
              />
            </div>
          )}

          <button
            onClick={() => { fetchOverview(); fetchAudit(); }}
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: '#ffffff',
              color: '#64748b',
              cursor: 'pointer'
            }}
            title="Làm mới số liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem'
      }}>
        
        {/* Card 1: Khách Mới Thêm Vào */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #bbf7d0',
          boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Khách Hàng Mới ({getPeriodLabel()})
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>
                  {loading ? '...' : (kpi.newCustomersCount || 0)}
                </h3>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>khách</span>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a' }}>
              <UserPlus size={24} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.82rem', fontWeight: 700, color: (kpi.momGrowth || 0) >= 0 ? '#16a34a' : '#ef4444' }}>
              {(kpi.momGrowth || 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              <span>{(kpi.momGrowth || 0) > 0 ? `+${kpi.momGrowth}%` : `${kpi.momGrowth || 0}%`}</span>
              <span style={{ fontWeight: 500, color: '#64748b' }}>vs kỳ trước</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Tổng: <b>{kpi.totalAllCustomers || 0}</b> hồ sơ
            </span>
          </div>
        </div>

        {/* Card 2: Khách Cũ Quay Lại */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #bfdbfe',
          boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Khách Cũ Mua Tour Lại
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: '#0f172a' }}>
                  {loading ? '...' : (kpi.returningCustomersCount || 0)}
                </h3>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>khách</span>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: '#dbeafe', color: '#2563eb' }}>
              <Repeat size={24} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#1e40af', fontWeight: 700, background: '#dbeafe', padding: '2px 8px', borderRadius: '6px' }}>
              Tỷ lệ quay lại: {kpi.repeatRate || 0}%
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              {kpi.repeatBookingsCount || 0} đơn booking
            </span>
          </div>
        </div>

        {/* Card 3: Doanh Thu Khách Cũ vs Khách Mới */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #fde68a',
          boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Doanh Thu Từ Khách Cũ
              </span>
              <div style={{ marginTop: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>
                  {loading ? '...' : formatMoney(kpi.repeatRevenue || 0)}
                </h3>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: '#fef3c7', color: '#d97706' }}>
              <DollarSign size={24} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #fde68a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Khách mới: <b style={{ color: '#0f172a' }}>{formatMoney(kpi.newCustomerRevenue || 0)}</b>
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              Tổng: <b style={{ color: '#0f172a' }}>{formatMoney(kpi.totalRevenueInPeriod || 0)}</b>
            </span>
          </div>
        </div>

        {/* Card 4: Kiểm Toán Dữ Liệu Chưa Chuẩn */}
        <div style={{
          background: integrity.totalIssues > 0 
            ? 'linear-gradient(135deg, #ffffff 0%, #fff1f2 100%)' 
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          padding: '1.5rem',
          border: integrity.totalIssues > 0 ? '1px solid #fecdd3' : '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: integrity.totalIssues > 0 ? '#be123c' : '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Cảnh Báo Dữ Liệu Chưa Chuẩn
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <h3 style={{ margin: 0, fontSize: '2.2rem', fontWeight: 900, color: integrity.totalIssues > 0 ? '#e11d48' : '#0f172a' }}>
                  {loading ? '...' : (integrity.totalIssues || 0)}
                </h3>
                <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>vấn đề</span>
              </div>
            </div>
            <div style={{ padding: '10px', borderRadius: '12px', background: integrity.totalIssues > 0 ? '#ffe4e6' : '#f1f5f9', color: integrity.totalIssues > 0 ? '#e11d48' : '#64748b' }}>
              <AlertTriangle size={24} />
            </div>
          </div>

          <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: integrity.totalIssues > 0 ? '1px dashed #fecdd3' : '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {integrity.orphanBookingsCount || 0} booking vãng lai • {integrity.wonLeadsUnconvertedCount || 0} lead chưa convert
            </span>
            <a 
              href="#audit-section"
              style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e11d48', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              Rà soát <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

      </div>

      {/* 3. Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.25rem' }}>
        
        {/* Chart 1: Tăng Trưởng Khách Hàng 12 Tháng */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} className="text-primary" /> XU HƯỚNG KHÁCH MỚI & KHÁCH CŨ QUAY LẠI (12 THÁNG)
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Cột: Số khách • Đường: Doanh thu</span>
          </div>

          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={growthChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={val => `${Math.round(val / 1000000)}Tr`} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Doanh thu') return [formatMoney(value), name];
                    return [`${value} khách`, name];
                  }}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '8px' }} />
                <Bar yAxisId="left" dataKey="newCustomers" name="Khách Mới" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Bar yAxisId="left" dataKey="returningCustomers" name="Khách Cũ Quay Lại" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={28} />
                <Line yAxisId="right" type="monotone" dataKey="totalRevenue" name="Doanh thu" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Cơ Cấu Nguồn Khách Mới */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChartIcon size={18} className="text-secondary" /> NGUỒN TIẾP CẬN KHÁCH MỚI ({getPeriodLabel()})
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Tỷ trọng theo kênh</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: 320 }}>
            {overviewData?.sourceDistribution?.length > 0 ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="60%" height="100%">
                  <PieChart>
                    <Pie
                      data={overviewData.sourceDistribution}
                      dataKey="count"
                      nameKey="source_name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {overviewData.sourceDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} khách`, name]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '10px' }}>
                  {overviewData.sourceDistribution.map((item, idx) => {
                    const total = overviewData.sourceDistribution.reduce((sum, s) => sum + s.count, 0);
                    const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }}></span>
                          <span style={{ fontWeight: 600, color: '#334155', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.source_name}>
                            {item.source_name}
                          </span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{item.count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'center', alignItems: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                Chưa có dữ liệu nguồn khách trong kỳ này
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Secondary Breakdown: Top Sales & Segments */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        
        {/* Phân bổ theo Nhân viên phụ trách */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} color="#6366f1" /> TOP NHÂN VIÊN MANG VỀ KHÁCH MỚI ({getPeriodLabel()})
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {overviewData?.staffDistribution?.map((staff, idx) => {
              const maxCount = overviewData.staffDistribution[0]?.count || 1;
              const pct = Math.round((staff.count / maxCount) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{staff.staff_name}</span>
                    <span style={{ fontWeight: 700, color: '#6366f1' }}>{staff.count} khách</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }}></div>
                  </div>
                </div>
              );
            })}
            {(!overviewData?.staffDistribution || overviewData.staffDistribution.length === 0) && (
              <div style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', padding: '1rem' }}>Chưa có phát sinh khách mới</div>
            )}
          </div>
        </div>

        {/* Phân khúc khách hàng toàn hệ thống */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#f59e0b" /> CƠ CẤU PHÂN HẠNG KHÁCH HÀNG (TOÀN HỆ THỐNG)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {overviewData?.segmentDistribution?.map((seg, idx) => (
              <div key={idx} style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{seg.segment}</span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{seg.count} <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>khách</span></span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. DATA INTEGRITY & AUDIT SECTION (Kiểm toán chất lượng dữ liệu) */}
      <div id="audit-section" style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '1.5rem',
        border: '1px solid #fecdd3',
        boxShadow: '0 4px 12px -2px rgba(225, 29, 72, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#be123c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#e11d48" /> BÁO CÁO KIỂM TOÁN DỮ LIỆU & RÀ SOÁT LỖ HỔNG (DATA INTEGRITY AUDIT)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              Danh sách các đơn hàng, khách hàng và khách tiềm năng bị thiếu liên kết hoặc chưa chuẩn hoá thông tin
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                placeholder="Tìm mã đơn, tên, SĐT..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                style={{ height: '34px', paddingLeft: '30px', fontSize: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', width: '200px' }}
              />
            </div>
          </div>
        </div>

        {/* Audit Sub-Tabs */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', borderBottom: '1px solid #f1f5f9' }}>
          {[
            { key: 'orphan_bookings', label: `Booking Vãng Lai / Chưa Gắn Khách (${integrity.orphanBookingsCount || 0})`, icon: AlertCircle, color: '#e11d48' },
            { key: 'won_leads_unconverted', label: `Lead Chốt Nhưng Chưa Tạo Khách (${integrity.wonLeadsUnconvertedCount || 0})`, icon: UserCheck, color: '#f59e0b' },
            { key: 'unassigned_customers', label: `Khách Chưa Gán Sale (${integrity.unassignedCustCount || 0})`, icon: Users, color: '#6366f1' },
            { key: 'missing_phone', label: `Khách Thiếu Số Điện Thoại (${integrity.missingPhoneCustCount || 0})`, icon: Phone, color: '#64748b' },
            { key: 'duplicate_phones', label: `Khách Trùng SĐT (${integrity.duplicatePhoneGroupsCount || 0} nhóm)`, icon: Repeat, color: '#06b6d4' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeAuditTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveAuditTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: isActive ? 700 : 500,
                  background: isActive ? '#fff1f2' : 'transparent',
                  color: isActive ? '#be123c' : '#64748b',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <Icon size={15} color={isActive ? tab.color : '#94a3b8'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Audit Content Tables */}
        {auditLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
            Đang tải dữ liệu kiểm toán...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            
            {/* 1. Orphan Bookings Table */}
            {activeAuditTab === 'orphan_bookings' && (
              <table className="data-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>MÃ BOOKING</th>
                    <th>TOUR / SỐ CHỖ</th>
                    <th>TỔNG TIỀN</th>
                    <th>NGƯỜI TẠO</th>
                    <th>NGÀY TẠO</th>
                    <th>TRẠNG THÁI</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {(auditData?.orphanBookings || [])
                    .filter(b => !auditSearch || (b.booking_code || '').toLowerCase().includes(auditSearch.toLowerCase()) || (b.tour_name || '').toLowerCase().includes(auditSearch.toLowerCase()))
                    .map(b => (
                      <tr key={b.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#e11d48' }}>{b.booking_code}</span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{b.tour_name || 'Tour tuỳ chỉnh'}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{b.pax_count} khách</div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{formatMoney(b.total_price)}</td>
                        <td>{b.creator_name}</td>
                        <td>{formatDate(b.created_at)}</td>
                        <td>
                          <span style={{ background: '#ffe4e6', color: '#be123c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600 }}>
                            Chưa gắn Khách hàng
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => onViewBooking && onViewBooking(b.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> Xem Đơn
                          </button>
                        </td>
                      </tr>
                    ))}
                  {(!auditData?.orphanBookings || auditData.orphanBookings.length === 0) && (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '1.5rem', color: '#16a34a' }}>
                        <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        Tuyệt vời! Toàn bộ đơn Booking đều đã được liên kết đúng với hồ sơ Khách hàng.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 2. Won Leads Unconverted Table */}
            {activeAuditTab === 'won_leads_unconverted' && (
              <table className="data-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>TÊN LEAD</th>
                    <th>SỐ ĐIỆN THOẠI</th>
                    <th>NGUỒN / BU</th>
                    <th>SALE PHỤ TRÁCH</th>
                    <th>NGÀY CHỐT</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {(auditData?.wonLeadsUnconverted || [])
                    .filter(l => !auditSearch || (l.name || '').toLowerCase().includes(auditSearch.toLowerCase()) || (l.phone || '').includes(auditSearch))
                    .map(l => (
                      <tr key={l.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{l.name}</span>
                        </td>
                        <td>{l.phone || <span style={{ color: '#94a3b8' }}>Chưa có SĐT</span>}</td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>
                            {l.source || 'Chưa rõ'} {l.bu_group ? `(${l.bu_group})` : ''}
                          </span>
                        </td>
                        <td>{l.assigned_to_name}</td>
                        <td>{formatDate(l.won_at || l.created_at)}</td>
                        <td>
                          <button
                            onClick={() => onViewLead && onViewLead(l.id)}
                            className="btn btn-primary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> Mở Lead Chuyển Đổi
                          </button>
                        </td>
                      </tr>
                    ))}
                  {(!auditData?.wonLeadsUnconverted || auditData.wonLeadsUnconverted.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#16a34a' }}>
                        <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        Tất cả Lead chốt đơn đều đã được tạo thành Khách hàng chính thức!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 3. Unassigned Customers Table */}
            {activeAuditTab === 'unassigned_customers' && (
              <table className="data-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>HỌ TÊN</th>
                    <th>SỐ ĐIỆN THOẠI</th>
                    <th>PHÂN KHÚC</th>
                    <th>SỐ CHUYẾN ĐI</th>
                    <th>NGÀY GIA NHẬP</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {(auditData?.unassignedCustomers || [])
                    .filter(c => !auditSearch || (c.name || '').toLowerCase().includes(auditSearch.toLowerCase()) || (c.phone || '').includes(auditSearch))
                    .map(c => (
                      <tr key={c.id}>
                        <td>
                          <span style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</span>
                        </td>
                        <td>{c.phone || '---'}</td>
                        <td>
                          <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.72rem' }}>
                            {c.customer_segment || 'New Customer'}
                          </span>
                        </td>
                        <td>{c.booking_count || 0} đơn</td>
                        <td>{formatDate(c.created_at)}</td>
                        <td>
                          <button
                            onClick={() => onViewCustomer && onViewCustomer(c.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> Gán Nhân Viên
                          </button>
                        </td>
                      </tr>
                    ))}
                  {(!auditData?.unassignedCustomers || auditData.unassignedCustomers.length === 0) && (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: '#16a34a' }}>
                        <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        100% Khách hàng đều đã được phân công nhân viên phụ trách.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 4. Missing Phone Table */}
            {activeAuditTab === 'missing_phone' && (
              <table className="data-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>HỌ TÊN</th>
                    <th>EMAIL</th>
                    <th>SALE PHỤ TRÁCH</th>
                    <th>NGÀY TẠO</th>
                    <th>HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {(auditData?.missingPhoneCustomers || [])
                    .filter(c => !auditSearch || (c.name || '').toLowerCase().includes(auditSearch.toLowerCase()))
                    .map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</td>
                        <td>{c.email || '---'}</td>
                        <td>{c.assigned_to_name}</td>
                        <td>{formatDate(c.created_at)}</td>
                        <td>
                          <button
                            onClick={() => onViewCustomer && onViewCustomer(c.id)}
                            className="btn btn-secondary"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <ExternalLink size={12} /> Bổ Sung SĐT
                          </button>
                        </td>
                      </tr>
                    ))}
                  {(!auditData?.missingPhoneCustomers || auditData.missingPhoneCustomers.length === 0) && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '1.5rem', color: '#16a34a' }}>
                        <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                        Không có khách hàng nào bị thiếu số điện thoại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {/* 5. Duplicate Phones Groups */}
            {activeAuditTab === 'duplicate_phones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {(auditData?.duplicatePhoneGroups || []).map((group, idx) => (
                  <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#0284c7', fontSize: '0.88rem' }}>
                        📞 SĐT trùng lặp: {group.phone} ({group.customers.length} hồ sơ)
                      </span>
                    </div>
                    <table className="data-table" style={{ fontSize: '0.8rem', background: '#fff' }}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>TÊN KHÁCH</th>
                          <th>PHÂN KHÚC</th>
                          <th>SALE PHỤ TRÁCH</th>
                          <th>NGÀY TẠO</th>
                          <th>THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.customers.map(c => (
                          <tr key={c.id}>
                            <td>#{c.id}</td>
                            <td style={{ fontWeight: 600 }}>{c.name}</td>
                            <td>{c.customer_segment}</td>
                            <td>{c.assigned_to_name}</td>
                            <td>{formatDate(c.created_at)}</td>
                            <td>
                              <button
                                onClick={() => onViewCustomer && onViewCustomer(c.id)}
                                className="btn btn-secondary"
                                style={{ padding: '2px 6px', fontSize: '0.72rem' }}
                              >
                                Xem Hồ Sơ
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
                {(!auditData?.duplicatePhoneGroups || auditData.duplicatePhoneGroups.length === 0) && (
                  <div style={{ textAlign: 'center', padding: '1.5rem', color: '#16a34a' }}>
                    <CheckCircle2 size={20} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                    Dữ liệu sạch! Không có số điện thoại nào bị trùng lặp.
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>

    </div>
  );
};

export default CustomerAnalyticsDashboard;
