import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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
  Briefcase,
  CheckCircle,
  Activity,
  DollarSign,
  Building
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ComposedChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LabelList
} from "recharts";

const GroupDashboardTab = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState("year");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(
    Math.floor(new Date().getMonth() / 3) + 1,
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customRange, setCustomRange] = useState({
    startDate: "",
    endDate: "",
  });

  const COLORS = [
    "#6366f1",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
  ];

  const formatLocalDate = (date) => {
    if (!date || isNaN(new Date(date).getTime())) return "";
    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  const getDateRange = useCallback(
    (filter) => {
      const now = new Date();
      let start = new Date();
      let end = new Date();

      switch (filter) {
        case "today":
          start.setHours(0, 0, 0, 0);
          break;
        case "yesterday":
          start.setDate(start.getDate() - 1);
          start.setHours(0, 0, 0, 0);
          end.setDate(end.getDate() - 1);
          end.setHours(23, 59, 59, 999);
          break;
        case "week":
          const day = start.getDay() || 7;
          start.setDate(start.getDate() - (day - 1));
          start.setHours(0, 0, 0, 0);
          end = new Date(start);
          end.setDate(end.getDate() + 6);
          end.setHours(23, 59, 59, 999);
          break;
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case "month-select":
          start = new Date(selectedYear, selectedMonth, 1);
          end = new Date(selectedYear, selectedMonth + 1, 0);
          break;
        case "quarter":
          start = new Date(selectedYear, (selectedQuarter - 1) * 3, 1);
          const qEndMonth = (selectedQuarter - 1) * 3 + 3;
          end = new Date(selectedYear, qEndMonth, 0);
          break;
        case "year":
          start = new Date(selectedYear, 0, 1);
          end = new Date(selectedYear, 12, 0);
          break;
        case "custom":
          return customRange;
        default:
          return { startDate: "", endDate: "" };
      }

      return {
        startDate: formatLocalDate(start),
        endDate: formatLocalDate(end),
      };
    },
    [customRange, selectedMonth, selectedYear, selectedQuarter],
  );

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { startDate, endDate } = getDateRange(dateFilter);

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      let groupBy = "day";
      if (["quarter", "year"].includes(dateFilter)) groupBy = "month";
      params.append("groupBy", groupBy);

      let chartStartDate, chartEndDate, chartGroupBy;
      if (dateFilter === "month-select") {
         chartStartDate = `${selectedYear}-01-01`;
         chartEndDate = `${selectedYear}-12-31`;
         chartGroupBy = "month";
      } else if (dateFilter === "quarter") {
         chartStartDate = `${selectedYear}-01-01`;
         chartEndDate = `${selectedYear}-12-31`;
         chartGroupBy = "quarter";
      } else if (dateFilter === "year") {
         chartStartDate = `${selectedYear}-01-01`;
         chartEndDate = `${selectedYear}-12-31`;
         chartGroupBy = "month";
      } else {
         chartStartDate = startDate;
         chartEndDate = endDate;
         chartGroupBy = groupBy;
      }
      
      if (chartStartDate) params.append("chartStartDate", chartStartDate);
      if (chartEndDate) params.append("chartEndDate", chartEndDate);
      if (chartGroupBy) params.append("chartGroupBy", chartGroupBy);

      const res = await axios.get(`/api/group-projects/stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching project stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dateFilter !== "custom") {
      fetchStats();
    }
  }, [dateFilter, selectedMonth, selectedQuarter, selectedYear]);

  useEffect(() => {
    if (dateFilter === "custom") {
      fetchStats();
    }
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium bg-slate-900/10 rounded-3xl m-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-indigo-500 font-bold tracking-wider">
            ĐANG TẢI DỮ LIỆU DASHBOARD MICE...
          </span>
        </div>
      </div>
    );
  }

  // Parse KPIs
  const totalProjects = stats.kpi.total_projects || 0;
  const totalPax = stats.kpi.total_pax || 0;
  const totalRevenue = stats.kpi.total_revenue ? Number(stats.kpi.total_revenue) : 0;
  const totalProfit = stats.kpi.total_profit ? Number(stats.kpi.total_profit) : 0;
  const wonProjects = stats.kpi.won_projects ? Number(stats.kpi.won_projects) : 0;

  // Derived KPIs
  const winRate = totalProjects > 0 ? ((wonProjects / totalProjects) * 100).toFixed(1) : '0.0';
  const avgDealSize = wonProjects > 0 ? totalRevenue / wonProjects : 0;
  const pipelineRevenue = stats.kpi.pipeline_revenue ? Number(stats.kpi.pipeline_revenue) : 0;
  const pipelineProjects = stats.kpi.pipeline_projects ? Number(stats.kpi.pipeline_projects) : 0;
  const avgProfitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  const STATUS_COLORS = {
    "Mới": "#3b82f6",
    "Báo giá": "#8b5cf6", // purple
    "Đang theo dõi": "#f59e0b", // yellow
    "Thành công": "#10b981", // green
    "Đã quyết toán": "#3b82f6", // blue
    "Chưa thành công": "#ef4444", // red
    "Chưa xác định": "#94a3b8", // slate
    "Khác": "#475569" // dark slate
  };

  const monthOptions = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  const quickFilters = ["today", "yesterday", "week", "month"];
  const advancedFilters = ["month-select", "quarter", "year", "custom"];

  const formatMoneyLarge = (val) => {
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + ' Tỷ';
    if (val >= 1000000) return (val / 1000000).toFixed(0) + ' Tr';
    return new Intl.NumberFormat('vi-VN').format(val);
  };

  // Convert revenue and profit data from strings to numbers for charts
  const chartSalesStats = (stats.salesStats || []).map(s => ({
    ...s,
    total_revenue: Number(s.total_revenue),
    total_profit: Number(s.total_profit),
    won_projects: Number(s.won_projects)
  }));
  
  const chartB2BStats = (stats.b2bStats || []).map(s => ({
    ...s,
    total_revenue: Number(s.total_revenue),
    total_profit: Number(s.total_profit)
  }));

  let finalTimeSeries = [];
  if (stats && stats.timeSeries) {
    if (dateFilter === "month-select") {
       for (let i=1; i<=12; i++) {
          const period = `${selectedYear}-${String(i).padStart(2,'0')}`;
          const found = stats.timeSeries.find(t => t.period === period);
          finalTimeSeries.push(found ? { ...found, period: `Tháng ${i}` } : { period: `Tháng ${i}`, count: 0, revenue: 0, profit: 0 });
       }
    } else if (dateFilter === "quarter") {
       for (let i=1; i<=4; i++) {
          const period = `${selectedYear}-Q${i}`;
          const found = stats.timeSeries.find(t => t.period === period);
          finalTimeSeries.push(found ? { ...found, period: `Quý ${i}` } : { period: `Quý ${i}`, count: 0, revenue: 0, profit: 0 });
       }
    } else if (dateFilter === "year") {
       for (let i=1; i<=12; i++) {
          const period = `${selectedYear}-${String(i).padStart(2,'0')}`;
          const found = stats.timeSeries.find(t => t.period === period);
          finalTimeSeries.push(found ? { ...found, period: `Tháng ${i}` } : { period: `Tháng ${i}`, count: 0, revenue: 0, profit: 0 });
       }
    } else {
       finalTimeSeries = stats.timeSeries;
    }
  }

  const chartTimeSeries = finalTimeSeries.map(s => ({
    ...s,
    revenue: Number(s.revenue || 0),
    profit: Number(s.profit || 0),
    count: Number(s.count || 0)
  }));

  const chartStatusStats = (stats.statusStats || []).map(s => ({
    ...s,
    count: Number(s.count)
  }));

  return (
    <div className="dashboard-content" style={{ paddingBottom: '3rem' }}>
      {/* Executive Single-Row Filter Bar */}
      <div className="executive-filter-panel mb-8">
        <div className="filter-scroll-container">
          <div className="horizontal-filter-row">
            {/* Advanced Filters Group */}
            <div className="segmented-control glass text-white">
              <button
                onClick={() => setDateFilter("year")}
                className={`segment-btn ${dateFilter === "year" ? "active" : ""}`}
              >
                Năm
              </button>
              <button
                onClick={() => setDateFilter("quarter")}
                className={`segment-btn ${dateFilter === "quarter" ? "active" : ""}`}
              >
                Quý
              </button>
              <button
                onClick={() => setDateFilter("month-select")}
                className={`segment-btn ${dateFilter === "month-select" ? "active" : ""}`}
              >
                Tháng
              </button>
              <button
                onClick={() => setDateFilter("custom")}
                className={`segment-btn ${dateFilter === "custom" ? "active" : ""}`}
              >
                Tùy chọn
              </button>
            </div>

            {/* Dynamic Inputs */}
            {dateFilter === "month-select" && (
              <div className="executive-select-wrapper">
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                  {monthOptions.map((m, i) => (<option key={i} value={i}>{m}</option>))}
                </select>
              </div>
            )}

            {dateFilter === "quarter" && (
              <div className="executive-select-wrapper">
                <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}>
                  {[1, 2, 3, 4].map((q) => (<option key={q} value={q}>Quý {q}</option>))}
                </select>
              </div>
            )}

            {(dateFilter === "month-select" || dateFilter === "quarter" || dateFilter === "year") && (
              <div className="executive-select-wrapper">
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                  {[2023, 2024, 2025, 2026, 2027].map((y) => (<option key={y} value={y}>Năm {y}</option>))}
                </select>
              </div>
            )}

            {dateFilter === "custom" && (
              <div className="flex flex-row flex-nowrap items-center gap-3">
                <div className="date-input-group premium">
                  <Calendar size={13} className="text-indigo-500" />
                  <input type="date" value={customRange.startDate} onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })} />
                </div>
                <span className="text-slate-300 font-bold">→</span>
                <div className="date-input-group premium">
                  <Calendar size={13} className="text-indigo-500" />
                  <input type="date" value={customRange.endDate} onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })} />
                </div>
              </div>
            )}

            {dateFilter === "custom" && (
              <button onClick={fetchStats} className="confirm-btn-premium border-none cursor-pointer p-2 px-4 rounded-xl font-bold bg-blue-600 text-white flex items-center justify-center gap-2">
                <Filter size={14} /> Xác nhận
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Section - Four Strategic Metrics */}
      <div className="kpi-grid mb-16">
        <div className="stat-card premium blue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">TỔNG DỰ ÁN</span>
              <div className="stat-icon-glass">
                <Briefcase size={20} />
              </div>
            </div>
            <div className="stat-value">{totalProjects}</div>
            <div className="stat-footer">
              <ArrowUpRight size={14} />
              <span>Tất cả các giai đoạn (Trừ Thất bại)</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium green">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">DOANH THU THÀNH CÔNG</span>
              <div className="stat-icon-glass">
                <DollarSign size={20} />
              </div>
            </div>
            <div className="stat-value">{formatMoneyLarge(totalRevenue)}</div>
            <div className="stat-footer">
              <TrendingUp size={14} />
              <span>Chỉ áp dụng dự án Chốt đơn</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium orange">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">LỢI NHUẬN THÀNH CÔNG</span>
              <div className="stat-icon-glass">
                <TrendingUp size={20} />
              </div>
            </div>
            <div className="stat-value" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {formatMoneyLarge(totalProfit)}
              {totalRevenue > 0 && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                  {((totalProfit / totalRevenue) * 100).toFixed(1)}% Biên LN
                </span>
              )}
            </div>
            <div className="stat-footer">
              <Activity size={14} />
              <span>Thước đo hiệu quả kinh doanh</span>
            </div>
          </div>
        </div>

        <div className="stat-card premium rose">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">TỔNG KHÁCH (PAX)</span>
              <div className="stat-icon-glass">
                <Users size={20} />
              </div>
            </div>
            <div className="stat-value">{new Intl.NumberFormat('vi-VN').format(totalPax)}</div>
            <div className="stat-footer">
              <Users size={14} />
              <span>Thị phần khách số lượng lớn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary KPI Insights Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Target size={20} color="#2563eb" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tỷ lệ chốt (Win Rate)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb', letterSpacing: '-0.5px' }}>{winRate}%</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{wonProjects}/{totalProjects} dự án</div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DollarSign size={20} color="#059669" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DT Trung bình / Deal</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', letterSpacing: '-0.5px' }}>{formatMoneyLarge(avgDealSize)}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Trên {wonProjects} deal thành công</div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={20} color="#d97706" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DT Pipeline (Chờ chốt)</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', letterSpacing: '-0.5px' }}>{formatMoneyLarge(pipelineRevenue)}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>{pipelineProjects} dự án đang trong ống</div>
          </div>
        </div>
        <div style={{ background: 'white', borderRadius: '14px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <TrendingUp size={20} color="#db2777" />
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biên LN Trung bình</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#db2777', letterSpacing: '-0.5px' }}>{avgProfitMargin}%</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600 }}>Hiệu suất sinh lời</div>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 1: Time Series Chart */}
      <div className="w-full" style={{ marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Dòng tiền Doanh Thu Dự Án</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>So sánh dòng tiền chốt thực tế theo diễn biến thời gian</p>
            </div>
            <Activity size={24} color="#3b82f6" />
          </div>
          <div style={{ height: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartTimeSeries} margin={{ top: 25, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis yAxisId="left" tickFormatter={(val) => formatMoneyLarge(val)} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip 
                  formatter={(value, name, props) => {
                    if (name === "Doanh thu" || name === "Lợi nhuận") {
                        let formattedStr = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
                        if (name === "Lợi nhuận" && props.payload.revenue > 0) {
                            const margin = ((value / props.payload.revenue) * 100).toFixed(1);
                            formattedStr += ` (${margin}% Biên LN)`;
                        }
                        return [formattedStr, name];
                    }
                    return [value, name];
                  }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar yAxisId="left" dataKey="revenue" name="Doanh thu" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40}>
                  <LabelList dataKey="revenue" position="top" style={{ fontSize: "10px", fontWeight: "bold", fill: "#059669" }} formatter={(val) => val > 0 ? formatMoneyLarge(val) : ""} />
                </Bar>
                <Bar yAxisId="left" dataKey="profit" name="Lợi nhuận" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="count" name="Số dự án" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 2: Sales & Status */}
      <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Top Sales Performance */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Bảng Vàng Sales MICE</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Top nhân viên có số lượng đoàn Chốt đơn cao nhất</p>
            </div>
            <Users size={24} color="#ec4899" />
          </div>
          <div style={{ height: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSalesStats} layout="vertical" margin={{ left: 20, right: 30, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="sales_name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700, fill: "#475569" }} width={140} />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }} 
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    const rev = Number(d.total_revenue || 0);
                    const prof = Number(d.total_profit || 0);
                    const won = Number(d.won_projects || 0);
                    const total = Number(d.total_projects || 0);
                    const share = totalRevenue > 0 ? ((rev / totalRevenue) * 100).toFixed(1) : '0.0';
                    const wr = total > 0 ? ((won / total) * 100).toFixed(0) : '0';
                    const margin = rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0.0';
                    return (
                      <div style={{ background: 'white', borderRadius: '14px', padding: '14px 18px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.12)', border: '1px solid #f1f5f9', minWidth: '220px' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#1e293b', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>{d.sales_name}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px', fontSize: '12px' }}>
                          <div style={{ color: '#64748b' }}>Chốt đơn:</div>
                          <div style={{ fontWeight: 700, color: '#ec4899', textAlign: 'right' }}>{won} Deal</div>
                          <div style={{ color: '#64748b' }}>Tổng DA:</div>
                          <div style={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>{total} (WR: {wr}%)</div>
                          <div style={{ color: '#64748b' }}>Doanh thu:</div>
                          <div style={{ fontWeight: 700, color: '#10b981', textAlign: 'right' }}>{formatMoneyLarge(rev)}</div>
                          <div style={{ color: '#64748b' }}>Lợi nhuận:</div>
                          <div style={{ fontWeight: 700, color: '#f59e0b', textAlign: 'right' }}>{formatMoneyLarge(prof)} ({margin}%)</div>
                          <div style={{ color: '#64748b' }}>Market Share:</div>
                          <div style={{ fontWeight: 800, color: '#6366f1', textAlign: 'right' }}>{share}%</div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="won_projects" name="Dự án Thành công" fill="#ec4899" radius={[0, 6, 6, 0]} barSize={24} minPointSize={2}>
                  <LabelList dataKey="won_projects" position="right" style={{ fontSize: "12px", fontWeight: "bold", fill: "#ec4899" }} formatter={(val) => `${val} Deal`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Tỷ Trọng Theo Giai Đoạn</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Nhịp độ đường ống kinh doanh (Pipeline)</p>
            </div>
            <PieChartIcon size={24} color="#8b5cf6" />
          </div>
          <div style={{ height: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 50, bottom: 20, left: 50 }} style={{ overflow: 'visible' }}>
                <Pie
                  data={chartStatusStats}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={80} paddingAngle={4}
                  dataKey="count" nameKey="status" isAnimationActive={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius * 1.35;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    if (percent < 0.05) return null;
                    return (
                      <text x={x} y={y} fill="#475569" fontSize="11" fontWeight="700" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                        <tspan x={x} dy="-0.6em">{name}</tspan>
                        <tspan x={x} dy="1.2em">({(percent * 100).toFixed(0)}%)</tspan>
                      </text>
                    );
                  }}
                >
                  {chartStatusStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", padding: "12px" }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 3: B2B Companies */}
      <div className="w-full">
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', margin: '0 0 4px 0' }}>Khách hàng Chiến lược B2B (Top 10)</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>Những doanh nghiệp đóng góp Doanh thu Thành công cao nhất cho Khối MICE</p>
            </div>
            <Building size={24} color="#06b6d4" />
          </div>
          <div style={{ height: "450px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartB2BStats} layout="vertical" margin={{ left: 20, right: 30, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="company_name" axisLine={false} tickLine={false} tick={{ fontSize: 13, fontWeight: 700, fill: "#475569" }} width={200} />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }} 
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                  formatter={(value, name, props) => {
                    if (name === "Doanh thu MICE") {
                        let info = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
                        const prof = props.payload.total_profit || 0;
                        if (value > 0) {
                            const margin = ((prof / value) * 100).toFixed(1);
                            info += ` (Mang về ${margin}% Biên LN)`;
                        }
                        return [info, name];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="total_revenue" name="Doanh thu MICE" fill="#06b6d4" radius={[0, 6, 6, 0]} barSize={24} minPointSize={2}>
                  <LabelList content={props => {
                      const { x, y, width, value } = props;
                      return (
                          <text x={x + width + 10} y={y + 16} fill="#0ea5e9" fontSize={13} fontWeight="bold">
                              {formatMoneyLarge(value)}
                          </text>
                      );
                  }}/>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
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
          margin-bottom: 3.5rem;
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

        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
};

export default GroupDashboardTab;
