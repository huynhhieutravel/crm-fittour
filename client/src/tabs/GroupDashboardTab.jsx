import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  Building,
  X
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
  LabelList,
  LineChart
} from "recharts";

const GroupDashboardTab = () => {
  const navigate = useNavigate();
  const [showSalesModal, setShowSalesModal] = useState(false);
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

  // Parse KPIs safely
  const kpi = stats.kpi || {};
  const totalProjects = kpi.total_projects || 0;
  const totalPax = kpi.total_pax || 0;
  const totalRevenue = kpi.total_revenue ? Number(kpi.total_revenue) : 0;
  const totalProfit = kpi.total_profit ? Number(kpi.total_profit) : 0;
  const wonProjects = kpi.won_projects ? Number(kpi.won_projects) : 0;


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
    count: Number(s.count),
    total_revenue: Number(s.total_revenue || 0)
  }));

  const getStatusData = (statusArr) => {
    let count = 0;
    let rev = 0;
    statusArr.forEach(st => {
       const found = chartStatusStats.find(s => s.status === st);
       if (found) {
           count += found.count;
           rev += found.total_revenue;
       }
    });
    return { count, rev };
  };

  const pipeNew = getStatusData(["Mới"]);
  const pipeContact = getStatusData(["Đã liên hệ"]); 
  const pipeConsult = getStatusData(["Đang tư vấn", "Đang theo dõi"]); 
  const pipeQuote = getStatusData(["Báo giá"]);
  const pipeWon = getStatusData(["Thành công", "Đã quyết toán"]);

  const totalPipeDeals = pipeNew.count + pipeContact.count + pipeConsult.count + pipeQuote.count + pipeWon.count;
  const totalPipeRev = pipeNew.rev + pipeContact.rev + pipeConsult.rev + pipeQuote.rev + pipeWon.rev;

  return (
    <div className="dashboard-content" style={{ padding: '0 1rem 3rem 1rem', background: '#f8fafc', minHeight: '100vh' }}>
      
      {/* 1. Dashboard Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Tổng quan Group Dashboard 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: '#64748b' }}>
            <span>Cập nhật: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
              <Activity size={12} /> Dữ liệu real-time
            </span>
          </div>
        </div>

        {/* Dynamic Filters aligned to the right like a Search bar in the design */}
        <div className="segmented-control glass">
            <button onClick={() => setDateFilter("year")} className={`segment-btn ${dateFilter === "year" ? "active" : ""}`}>Năm</button>
            <button onClick={() => setDateFilter("quarter")} className={`segment-btn ${dateFilter === "quarter" ? "active" : ""}`}>Quý</button>
            <button onClick={() => setDateFilter("month-select")} className={`segment-btn ${dateFilter === "month-select" ? "active" : ""}`}>Tháng</button>
            
            {(dateFilter === "month-select" || dateFilter === "quarter" || dateFilter === "year") && (
              <select className="executive-select-mini" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                {[2023, 2024, 2025, 2026, 2027].map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            )}
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {/* Card 1 - Blue */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #3b82f6)', borderRadius: '16px', padding: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.9 }}>TỔNG DOANH THU</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={16} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{formatMoneyLarge(totalRevenue)}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', opacity: 0.9 }}>↑ Tất cả giai đoạn Chốt</div>
          <div style={{ marginTop: '12px', height: '30px' }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartTimeSeries.slice(-10)}><Line type="monotone" dataKey="revenue" stroke="rgba(255,255,255,0.6)" strokeWidth={2} dot={{r:2, fill:"#fff"}}/></LineChart></ResponsiveContainer>
          </div>
        </div>

        {/* Card 2 - Green */}
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', borderRadius: '16px', padding: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.9 }}>LỢI NHUẬN THÀNH CÔNG</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Briefcase size={16} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{formatMoneyLarge(totalProfit)}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', opacity: 0.9 }}>↑ {avgProfitMargin}% Biên lợi nhuận</div>
          <div style={{ marginTop: '12px', height: '30px' }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartTimeSeries.slice(-10)}><Line type="monotone" dataKey="profit" stroke="rgba(255,255,255,0.6)" strokeWidth={2} dot={{r:2, fill:"#fff"}}/></LineChart></ResponsiveContainer>
          </div>
        </div>

        {/* Card 3 - Orange */}
        <div style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', borderRadius: '16px', padding: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.9 }}>TỔNG KHÁCH (PAX)</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={16} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{new Intl.NumberFormat('vi-VN').format(totalPax)}</div>
          <div style={{ fontSize: '10px', fontWeight: '600', opacity: 0.9 }}>↑ Lũy kế khách đoàn</div>
          <div style={{ marginTop: '12px', height: '30px' }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartTimeSeries.slice(-10)}><Line type="monotone" dataKey="count" stroke="rgba(255,255,255,0.6)" strokeWidth={2} dot={{r:2, fill:"#fff"}}/></LineChart></ResponsiveContainer>
          </div>
        </div>

        {/* Card 4 - Pink */}
        <div style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', borderRadius: '16px', padding: '16px', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ fontSize: '10px', fontWeight: '800', opacity: 0.9 }}>TỶ LỆ CHỐT (WIN RATE)</div>
            <div style={{ background: 'rgba(255,255,255,0.2)', width: '28px', height: '28px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Target size={16} /></div>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px' }}>{winRate}%</div>
          <div style={{ fontSize: '10px', fontWeight: '600', opacity: 0.9 }}>{wonProjects}/{totalProjects} dự án</div>
          <div style={{ marginTop: '12px', height: '30px' }}>
            <ResponsiveContainer width="100%" height="100%"><LineChart data={chartTimeSeries.slice(-10)}><Line type="monotone" dataKey="count" stroke="rgba(255,255,255,0.6)" strokeWidth={2} dot={{r:2, fill:"#fff"}}/></LineChart></ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Main Split Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Main Chart */}
        <div className="md-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div className="md-panel-title">DOANH THU & LỢI NHUẬN THEO THỜI GIAN</div>
            <select className="md-select">
              <option>Theo {dateFilter === 'year' ? 'Tháng' : dateFilter === 'quarter' ? 'Tháng' : 'Ngày'}</option>
            </select>
          </div>
          
          {/* Custom Legend */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#3b82f6', borderRadius: '3px' }}></div> Doanh thu</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '3px' }}></div> Lợi nhuận</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><div style={{ width: '8px', height: '8px', border: '2px solid #f97316', borderRadius: '50%', background: 'white' }}></div> Số dự án</div>
          </div>

          <div style={{ height: "320px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartTimeSeries} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="period" axisLine={{stroke: '#e2e8f0'}} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} dy={10} />
                <YAxis yAxisId="left" tickFormatter={(val) => formatMoneyLarge(val).replace(' Tỷ', '') + ' Tỷ'} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const rev = payload.find(p => p.dataKey === 'revenue')?.value || 0;
                      const prof = payload.find(p => p.dataKey === 'profit')?.value || 0;
                      const count = payload.find(p => p.dataKey === 'count')?.value || 0;
                      const margin = rev > 0 ? ((prof / rev) * 100).toFixed(1) : 0;
                      return (
                        <div style={{ background: "white", padding: "12px 16px", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "#1e293b", marginBottom: "4px", borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>{label}</div>
                          <div style={{ fontSize: "12px", color: "#f97316", fontWeight: "600", display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Số dự án:</span> <span style={{fontWeight: '800'}}>{count}</span></div>
                          <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "600", display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Doanh thu:</span> <span style={{fontWeight: '800'}}>{formatMoneyLarge(rev)}</span></div>
                          <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Lợi nhuận:</span> <span style={{fontWeight: '800'}}>{formatMoneyLarge(prof)}</span></div>
                          <div style={{ fontSize: "12px", color: "#8b5cf6", fontWeight: "600", display: 'flex', justifyContent: 'space-between', gap: '16px' }}><span>Biên lợi nhuận:</span> <span style={{fontWeight: '800'}}>{margin}%</span></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar yAxisId="left" dataKey="profit" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="#f97316" strokeWidth={2} dot={{ r: 4, strokeWidth: 2, fill: "white", stroke: "#f97316" }} activeDot={{ r: 6 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pipeline List */}
        <div className="md-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div className="md-panel-title">PIPELINE DỰ ÁN</div>
            <select className="md-select"><option>Tất cả dự án</option></select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            
            {/* NEW LEAD */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${Math.max(10, totalPipeDeals > 0 ? (pipeNew.count/totalPipeDeals)*100 : 0)}%`, background: '#eff6ff', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)', zIndex: 0, borderRadius: '12px 0 0 12px' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#3b82f6', letterSpacing: '0.5px' }}>LEAD MỚI</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{pipeNew.count}</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#3b82f6' }}>{formatMoneyLarge(pipeNew.rev)}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6' }}>{totalPipeDeals > 0 ? ((pipeNew.count/totalPipeDeals)*100).toFixed(0) : 0}%</div>
              </div>
            </div>

            {/* CONTACTED */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${Math.max(10, totalPipeDeals > 0 ? (pipeContact.count/totalPipeDeals)*100 : 0)}%`, background: '#ecfdf5', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)', zIndex: 0, borderRadius: '12px 0 0 12px' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', letterSpacing: '0.5px' }}>ĐÃ LIÊN HỆ</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{pipeContact.count}</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>{formatMoneyLarge(pipeContact.rev)}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981' }}>{totalPipeDeals > 0 ? ((pipeContact.count/totalPipeDeals)*100).toFixed(0) : 0}%</div>
              </div>
            </div>

            {/* CONSULTING */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${Math.max(10, totalPipeDeals > 0 ? (pipeConsult.count/totalPipeDeals)*100 : 0)}%`, background: '#fffbeb', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)', zIndex: 0, borderRadius: '12px 0 0 12px' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b', letterSpacing: '0.5px' }}>ĐANG TƯ VẤN</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{pipeConsult.count}</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#f59e0b' }}>{formatMoneyLarge(pipeConsult.rev)}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: '#fffbeb', color: '#f59e0b' }}>{totalPipeDeals > 0 ? ((pipeConsult.count/totalPipeDeals)*100).toFixed(0) : 0}%</div>
              </div>
            </div>

            {/* QUOTE */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${Math.max(10, totalPipeDeals > 0 ? (pipeQuote.count/totalPipeDeals)*100 : 0)}%`, background: '#faf5ff', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)', zIndex: 0, borderRadius: '12px 0 0 12px' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#a855f7', letterSpacing: '0.5px' }}>BÁO GIÁ</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{pipeQuote.count}</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#a855f7' }}>{formatMoneyLarge(pipeQuote.rev)}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: '#faf5ff', color: '#a855f7' }}>{totalPipeDeals > 0 ? ((pipeQuote.count/totalPipeDeals)*100).toFixed(0) : 0}%</div>
              </div>
            </div>

            {/* WON */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: `${Math.max(10, totalPipeDeals > 0 ? (pipeWon.count/totalPipeDeals)*100 : 0)}%`, background: '#ecfdf5', clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)', zIndex: 0, borderRadius: '12px 0 0 12px' }}></div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: '800', color: '#10b981', letterSpacing: '0.5px' }}>CHỐT (WON)</div>
                <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{pipeWon.count}</div>
              </div>
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>{formatMoneyLarge(pipeWon.rev)}</div>
                <div style={{ fontSize: '11px', fontWeight: '800', padding: '4px 10px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981' }}>{totalPipeDeals > 0 ? ((pipeWon.count/totalPipeDeals)*100).toFixed(1) : 0}%</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>Tổng cộng</div>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
              <span>{totalPipeDeals} deals</span>
              <span>{formatMoneyLarge(totalPipeRev)}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. Bottom 4-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        
        {/* Top Sales */}
        <div className="md-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="md-panel-title">TOP NHÂN VIÊN SALES</div>
            <a href="#" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); setShowSalesModal(true); }}>Xem bảng xếp hạng</a>
          </div>
          <div className="md-list">
            {chartSalesStats.slice(0, 5).map((sales, idx) => {
              const rev = Number(sales.total_revenue || 0);
              const prof = Number(sales.total_profit || 0);
              const won = Number(sales.won_projects || 0);
              const total = Number(sales.total_projects || 0);
              const wr = total > 0 ? ((won / total) * 100).toFixed(0) : '0';
              const margin = rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0.0';

              return (
                <div key={idx} className="md-list-item sales-item-hover" style={{ position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '24px', textAlign: 'center', fontSize: '13px', fontWeight: '700', color: idx < 3 ? '#f59e0b' : '#94a3b8' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </div>
                    <img src={`https://ui-avatars.com/api/?name=${sales.sales_name.replace(' ', '+')}&background=random`} alt="avatar" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>{sales.sales_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>MICE</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', background: '#dcfce7', padding: '2px 8px', borderRadius: '100px' }}>
                    {sales.won_projects} deals
                  </div>

                  {/* Tooltip Content */}
                  <div className="sales-tooltip">
                    <div style={{ fontWeight: 800, fontSize: '13px', color: '#1e293b', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>{sales.sales_name}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4px 12px', fontSize: '11px' }}>
                      <div style={{ color: '#64748b' }}>Chốt đơn:</div>
                      <div style={{ fontWeight: 700, color: '#ec4899', textAlign: 'right' }}>{won} Deal</div>
                      <div style={{ color: '#64748b' }}>Tổng dự án:</div>
                      <div style={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>{total} (Tỷ lệ: {wr}%)</div>
                      <div style={{ color: '#64748b' }}>Doanh thu:</div>
                      <div style={{ fontWeight: 700, color: '#10b981', textAlign: 'right' }}>{formatMoneyLarge(rev)}</div>
                      <div style={{ color: '#64748b' }}>Biên lợi nhuận:</div>
                      <div style={{ fontWeight: 700, color: '#f59e0b', textAlign: 'right' }}>{margin}%</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* B2B Clients */}
        <div className="md-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="md-panel-title">KHÁCH HÀNG CHIẾN LƯỢC (B2B)</div>
            <a href="#" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none', fontWeight: '600' }} onClick={(e) => { e.preventDefault(); navigate('/group/projects'); }}>Xem tất cả</a>
          </div>
          <div className="md-list">
            {chartB2BStats.slice(0, 5).map((b2b, idx) => {
               const maxRev = chartB2BStats[0]?.total_revenue || 1;
               const pct = ((b2b.total_revenue / totalRevenue) * 100).toFixed(1);
               const widthPct = ((b2b.total_revenue / maxRev) * 100).toFixed(0);
               return (
                <div key={idx} className="md-list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#64748b' }}>{idx+1}</div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1e293b' }}>{b2b.company_name}</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>{pct}%</div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${widthPct}%`, background: '#3b82f6', borderRadius: '3px' }}></div>
                  </div>
                </div>
               )
            })}
          </div>
        </div>

        {/* Recent Activities Mock */}
        <div className="md-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="md-panel-title">HOẠT ĐỘNG GẦN ĐÂY</div>
          </div>
          <div className="md-list">
            <div className="md-list-item">
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#3b82f6', background: '#eff6ff', padding: '6px', borderRadius: '8px' }}><Calendar size={14}/></div>
                <div>
                  <div style={{ fontSize: '12px', color: '#1e293b' }}>Bạn đã tạo booking <b>#FT240424-01</b></div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>10:30 AM</div>
                </div>
              </div>
            </div>
            <div className="md-list-item">
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#10b981', background: '#dcfce7', padding: '6px', borderRadius: '8px' }}><CheckCircle size={14}/></div>
                <div>
                  <div style={{ fontSize: '12px', color: '#1e293b' }}>Anh Tuấn đã mở báo giá</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>09:45 AM</div>
                </div>
              </div>
            </div>
            <div className="md-list-item">
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#f59e0b', background: '#fef3c7', padding: '6px', borderRadius: '8px' }}><AlertCircle size={14}/></div>
                <div>
                  <div style={{ fontSize: '12px', color: '#1e293b' }}>Deal Công ty ABC bị trễ follow</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Hôm qua, 14:20</div>
                </div>
              </div>
            </div>
            <div className="md-list-item">
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: '#8b5cf6', background: '#f3e8ff', padding: '6px', borderRadius: '8px' }}><Briefcase size={14}/></div>
                <div>
                  <div style={{ fontSize: '12px', color: '#1e293b' }}>Bạn đã tạo dự án mới - Tour Đà Lạt</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>Hôm qua, 09:10</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* VIP Events */}
        <div className="md-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div className="md-panel-title">SỰ KIỆN KHÁCH VIP</div>
          </div>
          <div className="md-list">
            {(stats?.vipEvents || []).length > 0 ? (
              (stats?.vipEvents || []).map((evt, idx) => {
                const dateObj = new Date(evt.event_date);
                const dayStr = dateObj.getDate().toString().padStart(2, '0') + '/' + (dateObj.getMonth() + 1).toString().padStart(2, '0');
                const isB2B = evt.event_type === 'Thành lập công ty';
                
                return (
                  <div key={idx} className="md-list-item">
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ background: isB2B ? '#eff6ff' : '#fdf4ff', color: isB2B ? '#3b82f6' : '#d946ef', padding: '6px 8px', borderRadius: '8px', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', fontWeight: '800' }}>{dayStr}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>{evt.title}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{evt.subtitle}</div>
                      </div>
                    </div>
                    <button style={{ background: 'none', border: 'none', color: isB2B ? '#3b82f6' : '#d946ef', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Gửi quà</button>
                  </div>
                );
              })
            ) : (
               <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '20px 0' }}>Không có sự kiện VIP nào sắp tới</div>
            )}
          </div>
        </div>

      </div>

      {/* Sales Leaderboard Modal */}
      {showSalesModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setShowSalesModal(false)}>
          <div style={{ background: 'white', borderRadius: '24px', width: '100%', maxWidth: '600px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Bảng Vàng Sales MICE</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Toàn bộ danh sách xếp hạng nhân viên chốt sales</p>
              </div>
              <button onClick={() => setShowSalesModal(false)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px 32px', overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {chartSalesStats.map((sales, idx) => {
                  const rev = Number(sales.total_revenue || 0);
                  const prof = Number(sales.total_profit || 0);
                  const won = Number(sales.won_projects || 0);
                  const total = Number(sales.total_projects || 0);
                  const wr = total > 0 ? ((won / total) * 100).toFixed(0) : '0';
                  const margin = rev > 0 ? ((prof / rev) * 100).toFixed(1) : '0.0';

                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ width: '28px', textAlign: 'center', fontSize: '16px', fontWeight: '800', color: idx < 3 ? '#f59e0b' : '#94a3b8' }}>
                          {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                        </div>
                        <img src={`https://ui-avatars.com/api/?name=${sales.sales_name.replace(' ', '+')}&background=random`} alt="avatar" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>{sales.sales_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Tỷ lệ: {wr}% • Lãi: {margin}%</div>
                        </div>
                      </div>
                      
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>{formatMoneyLarge(rev)}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', marginTop: '2px' }}>{won} / {total} dự án</div>
                      </div>
                    </div>
                  );
                })}
                {chartSalesStats.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8', fontSize: '14px', fontWeight: '600' }}>Không có dữ liệu sales trong giai đoạn này</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .md-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }
        .md-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .md-card-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .md-card-value {
          font-size: 26px;
          font-weight: 900;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
        }
        .md-card-footer {
          font-size: 11px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .md-chart-mock {
          height: 40px;
          width: 100%;
          margin-top: 16px;
        }

        .md-panel {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
        }
        .md-panel-title {
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          letter-spacing: 0.5px;
        }
        .md-select {
          padding: 4px 24px 4px 12px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #f8fafc;
          outline: none;
        }

        .md-pipeline-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .md-pipe-item {
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .md-pipe-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .md-pipe-name {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.5px;
        }
        .md-pipe-count {
          font-size: 16px;
          font-weight: 800;
          color: #0f172a;
        }
        .md-pipe-stats {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }
        .md-pipe-val {
          font-size: 14px;
          font-weight: 800;
        }
        .md-pipe-pct {
          font-size: 11px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 100px;
        }

        .md-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .md-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .segmented-control.glass {
          display: flex;
          background: #e2e8f0;
          padding: 4px;
          border-radius: 10px;
        }
        .segment-btn {
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 700;
          color: #64748b;
          border-radius: 6px;
          border: none;
          background: transparent;
          cursor: pointer;
        }
        .segment-btn.active {
          background: #ffffff;
          color: #0f172a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .executive-select-mini {
          padding: 6px 12px;
          font-size: 12px;
          font-weight: 700;
          border: none;
          background: transparent;
          color: #475569;
          outline: none;
        }
        .sales-tooltip {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: white;
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
          min-width: 220px;
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          transition: all 0.2s ease;
          pointer-events: none;
        }
        .sales-item-hover:hover .sales-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(5px);
        }
      `}</style>
    </div>
  );
};

export default GroupDashboardTab;
