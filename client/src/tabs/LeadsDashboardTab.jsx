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
  Phone,
  DollarSign,
  Sparkles,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Zap,
  Info,
  HelpCircle,
  Check,
  TrendingDown,
  Layers,
  Award,
  X,
  Loader2
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

const LeadsDashboardTab = ({ setEditingLead }) => {
  const [stats, setStats] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBuSwitching, setIsBuSwitching] = useState(false);
  const [dateFilter, setDateFilter] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedQuarter, setSelectedQuarter] = useState(
    Math.floor(new Date().getMonth() / 3) + 1,
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [comparisonBu, setComparisonBu] = useState("ALL");
  const [showComparison, setShowComparison] = useState(false);
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

  const fetchStats = async (isBuOnly = false) => {
    if (!stats) {
      setInitialLoading(true);
    } else {
      setIsUpdating(true);
      if (isBuOnly) setIsBuSwitching(true);
    }

    try {
      const token = localStorage.getItem("token");
      const { startDate, endDate } = getDateRange(dateFilter);

      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (dateFilter) params.append("dateFilter", dateFilter);
      if (comparisonBu) params.append("comparisonBu", comparisonBu);

      // Determine groupBy based on dateFilter
      let groupBy = "day";
      if (["quarter", "year"].includes(dateFilter)) groupBy = "month";
      params.append("groupBy", groupBy);

      if (dateFilter === "today" || dateFilter === "yesterday") {
        const d = new Date(endDate.split(' ')[0]);
        d.setDate(d.getDate() - 6);
        params.append("tsStartDate", formatLocalDate(d));
        params.append("tsEndDate", endDate);
      }

      const res = await axios.get(`/api/leads/stats?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Error fetching lead stats:", err);
    } finally {
      setInitialLoading(false);
      setIsUpdating(false);
      setIsBuSwitching(false);
    }
  };

  useEffect(() => {
    if (dateFilter !== "custom") {
      fetchStats();
    }
  }, [dateFilter, selectedMonth, selectedQuarter, selectedYear, comparisonBu]);

  useEffect(() => {
    if (dateFilter === "custom") {
      fetchStats();
    }
  }, []);

  if (initialLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-slate-400 font-medium bg-slate-900/10 rounded-3xl m-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
          <span className="text-indigo-500 font-bold tracking-wider">
            ĐANG TẢI DỮ LIỆU DASHBOARD...
          </span>
        </div>
      </div>
    );
  }

  // Calculate derived stats
  const totalLeads = stats.statusStats.reduce(
    (acc, curr) => acc + curr.count,
    0,
  );
  const wonLeads =
    stats.statusStats.find((s) => s.status === "Chốt đơn")?.count || 0;
  const conversionRate =
    totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;
  const newLeads =
    stats.statusStats.find((s) => s.status === "Mới")?.count || 0;

  // Process time series for chart and fill gaps
  const { startDate, endDate } = getDateRange(dateFilter);
  let rawTimeSeries = stats.timeSeriesStats || [];
  
  let chartStartDate = startDate;
  let chartEndDate = endDate;

  if (dateFilter === "today" || dateFilter === "yesterday") {
      const d = new Date(endDate.split(' ')[0]);
      d.setDate(d.getDate() - 6);
      chartStartDate = formatLocalDate(d);
  }

  if (chartStartDate && chartEndDate && ["today", "yesterday", "week", "month", "month-select", "custom"].includes(dateFilter)) {
    const filled = [];
    let current = new Date(chartStartDate + 'T00:00:00');
    const end = new Date(chartEndDate.split(' ')[0] + 'T00:00:00');
    const rawMap = {};
    rawTimeSeries.forEach(r => rawMap[r.period] = r);
    
    while (current <= end) {
      const pStr = formatLocalDate(current);
      if (rawMap[pStr]) {
        filled.push(rawMap[pStr]);
      } else {
        filled.push({ period: pStr, totalCount: 0 });
      }
      current.setDate(current.getDate() + 1);
    }
    rawTimeSeries = filled;
  } else if (chartStartDate && chartEndDate && ["quarter", "year"].includes(dateFilter)) {
    const filled = [];
    let current = new Date(chartStartDate + 'T00:00:00');
    current.setDate(1);
    const end = new Date(chartEndDate.split(' ')[0] + 'T00:00:00');
    end.setDate(1);
    const rawMap = {};
    rawTimeSeries.forEach(r => rawMap[r.period] = r);
    
    while (current <= end) {
      const y = current.getFullYear();
      const m = String(current.getMonth() + 1).padStart(2, '0');
      const pStr = `${y}-${m}`;
      if (rawMap[pStr]) {
        filled.push(rawMap[pStr]);
      } else {
        filled.push({ period: pStr, totalCount: 0 });
      }
      current.setMonth(current.getMonth() + 1);
    }
    rawTimeSeries = filled;
  }
  
  const processedTimeSeries = rawTimeSeries;
  const statusKeys = new Set();
  processedTimeSeries.forEach(item => {
    Object.keys(item).forEach(k => {
      if (k !== 'period' && k !== 'totalCount') statusKeys.add(k);
    });
  });
  // Sort statuses to make 'Mới' appear first (bottom of stack)
  const sortedStatuses = Array.from(statusKeys).sort((a,b) => {
    if(a === 'Mới') return -1;
    if(b === 'Mới') return 1;
    return a.localeCompare(b);
  });
  
  const STATUS_COLORS = {
    "Mới": "#3b82f6", // blue
    "Chưa chăm sóc": "#94a3b8", // slate
    "Đang liên hệ": "#f59e0b", // yellow
    "Liên hệ lần 2": "#8b5cf6", // purple
    "Chốt đơn": "#10b981", // green
    "Thất bại": "#ef4444", // red
    "Không phản hồi": "#6b7280", // gray
    "Chưa xác định": "#cbd5e1" // light slate
  };

  const QUALITY_COLORS = {
    "Tiềm Năng": "#10b981", // green
    "Không Tiềm Năng": "#f59e0b", // yellow
    "Không có nhu cầu": "#ef4444", // red
    "Mới": "#3b82f6", // blue
    "Chưa xác định": "#cbd5e1" // light slate
  };

  const monthOptions = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const quickFilters = ["today", "yesterday", "week", "month"];
  const advancedFilters = ["month-select", "quarter", "year", "custom"];

  const correlation = stats.correlationStats || {
    mode: 'weeks',
    targetYear: new Date().getFullYear(),
    targetMonth: new Date().getMonth() + 1,
    selectedBu: comparisonBu || 'ALL',
    availableBus: ['BU1', 'BU2', 'BU3', 'BU4', 'BU5'],
    periods: [],
    summary: { totalLeads: 0, totalWon: 0, totalSpend: 0, avgCpl: 0, avgConversionRate: 0 }
  };

  const CustomCorrelationTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-corr-tooltip">
          <div className="tooltip-head">
            <span className="tooltip-title">{data.periodLabel}</span>
            <span className="tooltip-sub">{data.periodSub} ({data.daysCount} ngày)</span>
          </div>
          <div className="tooltip-body">
            <div className="tooltip-row">
              <span className="tooltip-dot" style={{ background: '#6366f1' }}></span>
              <span className="tooltip-label">Số Lead CRM:</span>
              <span className="tooltip-val text-indigo-700 font-black">{data.crmLeads.toLocaleString()} lead</span>
              <span className="text-xs text-slate-500 font-bold">(TB {data.dailyLeads}/ng)</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-dot" style={{ background: '#38bdf8' }}></span>
              <span className="tooltip-label">Lead Cùng Kỳ ({correlation.summary?.prevPeriodLabel || 'T-1'}):</span>
              <span className="tooltip-val text-sky-700 font-black">{data.prevCrmLeads.toLocaleString()} lead</span>
              <span className="text-xs text-slate-500 font-bold">(TB {data.prevDailyLeads}/ng)</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-dot" style={{ background: '#10b981' }}></span>
              <span className="tooltip-label">Chốt đơn:</span>
              <span className="tooltip-val text-emerald-700 font-bold">{data.crmWon} ({data.conversionRate}%)</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-dot" style={{ background: '#ec4899' }}></span>
              <span className="tooltip-label">Chi phí Ads:</span>
              <span className="tooltip-val text-pink-700 font-black">{data.adsSpend.toLocaleString('vi-VN')} đ</span>
              <span className="text-xs text-slate-500 font-bold">(TB {(data.dailySpend / 1000000).toFixed(1)}M/ng)</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-dot" style={{ background: '#f59e0b' }}></span>
              <span className="tooltip-label">Giá / Lead CRM (CPL):</span>
              <span className="tooltip-val text-amber-700 font-bold">
                {data.cplCrm > 0 ? `${data.cplCrm.toLocaleString('vi-VN')} đ` : 'N/A'}
              </span>
            </div>

            {/* So sánh với Kỳ trước (Tuần trước - WoW) */}
            {data.lastPeriod && (
              <div className="tooltip-compare-box last-period-tooltip-box">
                <div className="tooltip-compare-title text-indigo-900 font-extrabold">
                  <span>⏪ So với Kỳ trước ({data.lastPeriod.periodLabel} • {data.lastPeriod.periodSub} - {data.lastPeriod.daysCount} ngày):</span>
                </div>
                <div className="tooltip-compare-content">
                  <div>Lead: <strong className="text-slate-900">{data.lastPeriod.crmLeads}</strong> (TB {data.lastPeriod.dailyLeads}/ng) {data.lastPeriod.deltaLeadsPct !== 0 && <span className={data.lastPeriod.deltaLeadsPct > 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>({data.lastPeriod.deltaLeadsPct > 0 ? '+' : ''}{data.lastPeriod.deltaLeadsPct}% | {data.lastPeriod.deltaDailyLeadsPct > 0 ? '+' : ''}{data.lastPeriod.deltaDailyLeadsPct}%/ng)</span>}</div>
                  <div>Ads: <strong className="text-slate-900">{(data.lastPeriod.adsSpend / 1000000).toFixed(1)}M</strong> (TB {(data.lastPeriod.dailySpend / 1000000).toFixed(1)}M/ng) {data.lastPeriod.deltaSpendPct !== 0 && <span className="text-slate-800 font-bold">({data.lastPeriod.deltaSpendPct > 0 ? '+' : ''}{data.lastPeriod.deltaSpendPct}%)</span>}</div>
                  <div>CPL: <strong className="text-slate-900">{data.lastPeriod.cplCrm.toLocaleString('vi-VN')} đ</strong> {data.lastPeriod.deltaCplPct !== 0 && <span className={data.lastPeriod.deltaCplPct < 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>({data.lastPeriod.deltaCplPct > 0 ? '+' : ''}{data.lastPeriod.deltaCplPct}%)</span>}</div>
                </div>
              </div>
            )}

            {/* Đối chiếu tháng trước cùng kỳ (MoM) */}
            {(data.prevCrmLeads > 0 || data.prevAdsSpend > 0) && (
              <div className="tooltip-compare-box prev-period-tooltip-box">
                <div className="tooltip-compare-title text-amber-950 font-extrabold">
                  <span>📅 So với Cùng kỳ ({correlation.summary?.prevPeriodLabel || 'Tháng trước'} • {data.prevPeriodSub} - {data.prevDaysCount} ngày):</span>
                </div>
                <div className="tooltip-compare-content">
                  <div>Lead: <strong className="text-slate-900">{data.prevCrmLeads}</strong> (TB {data.prevDailyLeads}/ng) {data.deltaMoMLeadsPct !== null && <span className={data.deltaDailyLeadsPct >= 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>({data.deltaDailyLeadsPct >= 0 ? '+' : ''}{data.deltaDailyLeadsPct}%/ng | Tổng: {data.deltaMoMLeadsPct >= 0 ? '+' : ''}{data.deltaMoMLeadsPct}%)</span>}</div>
                  <div>Ads: <strong className="text-slate-900">{(data.prevAdsSpend / 1000000).toFixed(1)}M</strong> (TB {(data.prevDailySpend / 1000000).toFixed(1)}M/ng) {data.deltaMoMSpendPct !== null && <span className="text-slate-800 font-bold">({data.deltaDailySpendPct >= 0 ? '+' : ''}{data.deltaDailySpendPct}%/ng)</span>}</div>
                  <div>CPL: <strong className="text-slate-900">{data.prevCplCrm.toLocaleString('vi-VN')} đ</strong> {data.deltaMoMCplPct !== null && <span className={data.deltaMoMCplPct <= 0 ? 'text-emerald-700 font-black' : 'text-rose-700 font-black'}>({data.deltaMoMCplPct >= 0 ? '+' : ''}{data.deltaMoMCplPct}%)</span>}</div>
                </div>
              </div>
            )}
          </div>
          {data.diagnosis && (
            <div className="tooltip-foot">
              <Sparkles size={14} className="text-indigo-600 flex-shrink-0 mt-0.5" />
              <span>{data.diagnosis}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

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
                  className={`segment-btn ${dateFilter === f ? "active" : ""}`}
                >
                  {f === "today"
                    ? "Hôm nay"
                    : f === "yesterday"
                      ? "Hôm qua"
                      : f === "week"
                        ? "Tuần này"
                        : "Tháng này"}
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
                  className={`segment-btn ${dateFilter === f ? "active" : ""}`}
                >
                  {f === "month-select"
                    ? "Tháng"
                    : f === "quarter"
                      ? "Quý"
                      : f === "year"
                        ? "Năm"
                        : "Tùy chọn"}
                </button>
              ))}
            </div>

            {/* Dynamic Inputs (Flattened) */}
            {dateFilter === "month-select" && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                >
                  {monthOptions.map((m, i) => (
                    <option key={i} value={i}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {dateFilter === "quarter" && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedQuarter}
                  onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4].map((q) => (
                    <option key={q} value={q}>
                      Quý {q}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {(dateFilter === "month-select" ||
              dateFilter === "quarter" ||
              dateFilter === "year") && (
              <div className="executive-select-wrapper">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                >
                  {[2023, 2024, 2025, 2026].map((y) => (
                    <option key={y} value={y}>
                      Năm {y}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {dateFilter === "custom" && (
              <div className="flex flex-row flex-nowrap items-center gap-3">
                <div className="date-input-group premium">
                  <Calendar size={13} className="text-indigo-500" />
                  <input
                    type="date"
                    value={customRange.startDate}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <span className="text-slate-300 font-bold">→</span>
                <div className="date-input-group premium">
                  <Calendar size={13} className="text-indigo-500" />
                  <input
                    type="date"
                    value={customRange.endDate}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {/* Final Action */}
            {dateFilter === "custom" && (
              <button onClick={fetchStats} className="confirm-btn-premium">
                <Filter size={14} />
                <span>Xác nhận</span>
              </button>
            )}

            {/* Visual Separator */}
            <div className="filter-divider"></div>

            {/* Compare Mode Toggle Filter Pill */}
            <button
              type="button"
              onClick={() => {
                const nextState = !showComparison;
                setShowComparison(nextState);
                if (nextState) {
                  setTimeout(() => {
                    document.getElementById("leads-comparison-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 120);
                }
              }}
              className={`compare-filter-pill-btn ${showComparison ? "active" : ""}`}
              title="Nhấn để mở / đóng phân hệ So sánh Tương quan Lead & Chi phí Ads"
            >
              <Sparkles size={14} className={showComparison ? "text-amber-300 animate-pulse" : "text-indigo-500"} />
              <span className="font-extrabold tracking-wide">So sánh</span>
              <span className={`pill-status-dot ${showComparison ? "active" : ""}`}>
                {showComparison ? "Đang bật" : "Bật"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Section - Premium Row */}
      <div className="kpi-grid mb-16">
        <div className="stat-card premium blue">
          <div className="stat-content">
            <div className="stat-header">
              <span className="stat-label">TỔNG LEADS</span>
              <div className="stat-icon-glass">
                <Users size={20} />
              </div>
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
              <div className="stat-icon-glass">
                <TrendingUp size={20} />
              </div>
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
              <div className="stat-icon-glass">
                <Target size={20} />
              </div>
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
              <span className="stat-label">LEAD THÀNH CÔNG</span>
              <div className="stat-icon-glass">
                <CheckCircle size={20} />
              </div>
            </div>
            <div className="stat-value">{wonLeads}</div>
            <div className="stat-footer">
              <CheckCircle size={14} />
              <span>Đã chốt đơn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 0: Time Series Chart */}
      <div className="mb-16 flex w-full">
        <div className="analytics-card professional flex-1 w-full">
          <div className="card-header">
            <div>
              <h3>Xu hướng Lead theo thời gian {
                (dateFilter === 'month-select' || dateFilter === 'month') ? `(Tháng ${selectedMonth}/${selectedYear})` : 
                dateFilter === 'quarter' ? `(Quý ${selectedQuarter}/${selectedYear})` :
                dateFilter === 'year' ? `(Năm ${selectedYear})` : ''
              }</h3>
              <p className="card-subtitle">So sánh tốc độ thu thập Lead qua các {dateFilter === 'quarter' || dateFilter === 'year' ? 'tháng' : 'ngày'}</p>
            </div>
            <BarChart3 size={20} className="text-blue-500" />
          </div>
          <div className="mt-6" style={{ height: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={processedTimeSeries}
                margin={{ top: 30, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="period" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#64748b" }} 
                  dy={10}
                  interval={0}
                  tickFormatter={(val) => {
                    if (!val) return "";
                    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}-\d{2}$/)) {
                      const d = new Date(val);
                      const parts = val.split('-');
                      if (['month', 'month-select'].includes(dateFilter)) {
                        return parseInt(parts[2], 10).toString();
                      } else {
                        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
                        const dayName = days[d.getDay()];
                        return `${dayName} (${parts[2]}/${parts[1]})`;
                      }
                    }
                    if (typeof val === 'string' && val.match(/^\d{4}-\d{2}$/)) {
                       const parts = val.split('-');
                       return `Tháng ${parts[1]}/${parts[0]}`;
                    }
                    return val;
                  }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: "#64748b" }} 
                />
                <Tooltip 
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: "13px", fontWeight: "500", color: "#475569" }}/>
                {sortedStatuses.map((status, idx) => (
                  <Bar 
                    key={status} 
                    dataKey={status} 
                    name={status} 
                    stackId="a" 
                    fill={STATUS_COLORS[status] || COLORS[idx % COLORS.length]} 
                    radius={idx === sortedStatuses.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                    maxBarSize={60}
                    isAnimationActive={false}
                  />
                ))}
                
                {/* Invisible line solely for rendering total values on top of the stacked bars */}
                <Line 
                  type="monotone" 
                  dataKey="totalCount" 
                  stroke="transparent" 
                  dot={false} 
                  activeDot={false} 
                  isAnimationActive={false}
                  tooltipType="none"
                >
                  <LabelList 
                    dataKey="totalCount" 
                    position="top" 
                    fill="#334155" 
                    style={{ fontSize: "13px", fontWeight: "800" }}
                  />
                </Line>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Analytics Grid - Row 0.5: Executive Comparison & Marketing Ads Correlation (Toggled via Filter 'So sánh') */}
      {showComparison && (
        <div id="leads-comparison-section" className="comparison-outer-wrapper">
          <div 
            className="analytics-card professional correlation-card flex-1 w-full"
            style={{ 
              opacity: isBuSwitching ? 0.6 : 1, 
              transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Section Header & BU Selection */}
            <div className="corr-card-header">
              <div className="header-left">
                <div className="header-badge-row">
                  <span className="badge-pill-gradient">
                    <Sparkles size={11} className="inline mr-1" /> PHÂN TÍCH SO SÁNH & QUẢNG CÁO
                  </span>
                  <span className="header-tag">Marketing ROI & Lead Velocity</span>
                </div>
                <h3 className="corr-main-title">
                  So sánh Tương quan Lead & Chi phí Ads Marketing
                </h3>
                <p className="card-subtitle mt-1">
                  {correlation.mode === 'weeks' 
                    ? `Đối chiếu biến động giữa các tuần trong Tháng ${correlation.targetMonth}/${correlation.targetYear} để phân tích nguyên nhân tăng/giảm Lead`
                    : `Đối chiếu biến động 12 Tháng trong Năm ${correlation.targetYear} để phân tích hiệu quả ngân sách Ads và tăng trưởng Lead`
                  }
                </p>
              </div>

              {/* BU Selection Pills + Close Button */}
              <div className="header-right">
                <div className="bu-pills-row">
                  <span className="bu-filter-label">
                    <Filter size={13} /> Lọc BU:
                    {isBuSwitching && <Loader2 size={13} className="animate-spin text-indigo-600 inline-block ml-1" />}
                  </span>
                  <button
                    onClick={() => {
                      if (comparisonBu === "ALL") return;
                      setIsBuSwitching(true);
                      setComparisonBu("ALL");
                    }}
                    className={`bu-pill-btn ${comparisonBu === "ALL" ? "active" : ""}`}
                    disabled={isBuSwitching}
                  >
                    Tất cả BU
                  </button>
                  {(correlation.availableBus || ['BU1', 'BU2', 'BU3', 'BU4', 'BU5']).map((bu) => (
                    <button
                      key={bu}
                      onClick={() => {
                        if (comparisonBu === bu) return;
                        setIsBuSwitching(true);
                        setComparisonBu(bu);
                      }}
                      className={`bu-pill-btn ${comparisonBu === bu ? "active" : ""}`}
                      disabled={isBuSwitching}
                    >
                      {bu}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowComparison(false)}
                  className="close-compare-pill-btn"
                  title="Đóng / Ẩn bảng so sánh"
                >
                  <X size={14} />
                  <span>Thu gọn</span>
                </button>
              </div>
            </div>

            {/* 4-Column Metric Grid */}
            <div className="corr-kpi-grid">
              <div className="metric-strip-card card-indigo">
                <div className="metric-strip-top">
                  <span className="metric-strip-label label-indigo">TỔNG LEADS CRM</span>
                  <div className="metric-icon-circle icon-indigo">
                    <Users size={18} />
                  </div>
                </div>
                <div className="metric-strip-value text-indigo-950">
                  {correlation.summary?.totalLeads?.toLocaleString() || 0}
                </div>
                <div className="metric-strip-footer">
                  <span className="footer-pill pill-indigo">Chốt {correlation.summary?.totalWon || 0} đơn ({correlation.summary?.avgConversionRate || 0}%)</span>
                  {correlation.summary?.momTotalLeadsPct !== null && correlation.summary?.momTotalLeadsPct !== undefined && (
                    <span className={`footer-mom-badge ${correlation.summary.momTotalLeadsPct >= 0 ? 'pos' : 'neg'}`} title={`So với ${correlation.summary.prevPeriodLabel}: ${correlation.summary.prevTotalLeads} Lead`}>
                      {correlation.summary.momTotalLeadsPct >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                      {correlation.summary.momTotalLeadsPct >= 0 ? '+' : ''}{correlation.summary.momTotalLeadsPct}% MoM
                    </span>
                  )}
                </div>
              </div>

              <div className="metric-strip-card card-pink">
                <div className="metric-strip-top">
                  <span className="metric-strip-label label-pink">TỔNG CHI PHÍ ADS</span>
                  <div className="metric-icon-circle icon-pink">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="metric-strip-value text-pink-950">
                  {(correlation.summary?.totalSpend || 0).toLocaleString('vi-VN')} <span className="currency-unit">đ</span>
                </div>
                <div className="metric-strip-footer">
                  <span className="footer-sub text-pink-700">Dữ liệu từ Meta Ads Report</span>
                  {correlation.summary?.momTotalSpendPct !== null && correlation.summary?.momTotalSpendPct !== undefined && (
                    <span className="footer-mom-badge neutral" title={`So với ${correlation.summary.prevPeriodLabel}: ${((correlation.summary.prevTotalSpend || 0) / 1000000).toFixed(1)}M đ`}>
                      {correlation.summary.momTotalSpendPct >= 0 ? `+${correlation.summary.momTotalSpendPct}%` : `${correlation.summary.momTotalSpendPct}%`} MoM
                    </span>
                  )}
                </div>
              </div>

              <div className="metric-strip-card card-amber">
                <div className="metric-strip-top">
                  <span className="metric-strip-label label-amber">GIÁ / LEAD CRM (CPL)</span>
                  <div className="metric-icon-circle icon-amber">
                    <Target size={18} />
                  </div>
                </div>
                <div className="metric-strip-value text-amber-950">
                  {correlation.summary?.avgCpl > 0 ? (
                    <>
                      {correlation.summary.avgCpl.toLocaleString('vi-VN')} <span className="currency-unit">đ</span>
                    </>
                  ) : (
                    <span className="text-base text-slate-400 font-bold">Chưa có chi phí</span>
                  )}
                </div>
                <div className="metric-strip-footer">
                  <span className="footer-pill pill-amber">
                    {correlation.summary?.bestPeriod ? `Tối ưu: ${correlation.summary.bestPeriod}` : 'CPL bình quân'}
                  </span>
                  {correlation.summary?.momAvgCplPct !== null && correlation.summary?.momAvgCplPct !== undefined && (
                    <span className={`footer-mom-badge ${correlation.summary.momAvgCplPct <= 0 ? 'pos' : 'neg'}`} title={`So với ${correlation.summary.prevPeriodLabel}: ${(correlation.summary.prevAvgCpl || 0).toLocaleString('vi-VN')} đ`}>
                      {correlation.summary.momAvgCplPct <= 0 ? <ArrowDown size={11} /> : <ArrowUp size={11} />}
                      {correlation.summary.momAvgCplPct >= 0 ? '+' : ''}{correlation.summary.momAvgCplPct}% MoM
                    </span>
                  )}
                </div>
              </div>

              <div className="metric-strip-card card-emerald">
                <div className="metric-strip-top">
                  <span className="metric-strip-label label-emerald">TỶ LỆ CHỐT THÀNH CÔNG</span>
                  <div className="metric-icon-circle icon-emerald">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="metric-strip-value text-emerald-950">
                  {correlation.summary?.avgConversionRate || 0}%
                </div>
                <div className="metric-strip-footer">
                  <span className="footer-sub text-emerald-700">Hiệu suất chuyển đổi Sales</span>
                </div>
              </div>
            </div>

            {/* Dual Axis Chart Box */}
            <div className="corr-chart-box">
              <div className="corr-chart-header">
                <div className="corr-chart-title">
                  <BarChart3 size={16} className="text-indigo-600 flex-shrink-0" />
                  <span>Biểu đồ Đối Chiếu: Lượng Lead CRM vs Chi Phí Ads</span>
                </div>
                <div className="corr-chart-legend">
                  <div className="legend-item text-indigo-700">
                    <span className="legend-badge-bar bg-indigo-500"></span> Lead CRM ({correlation.summary?.targetMonth ? `T${correlation.summary.targetMonth}` : 'Kỳ này'})
                  </div>
                  <div className="legend-item text-sky-700">
                    <span className="legend-badge-bar bg-sky-400"></span> Lead Cùng Kỳ ({correlation.summary?.prevPeriodLabel || 'Kỳ trước'})
                  </div>
                  <div className="legend-item text-emerald-700">
                    <span className="legend-badge-bar bg-emerald-500"></span> Chốt Đơn
                  </div>
                  <div className="legend-item text-pink-700">
                    <span className="legend-badge-line bg-pink-500"></span> Chi Phí Ads ({correlation.summary?.targetMonth ? `T${correlation.summary.targetMonth}` : 'Kỳ này'})
                  </div>
                  <div className="legend-item text-amber-700">
                    <span className="legend-badge-line bg-amber-500" style={{ borderTop: '2px dashed #f59e0b' }}></span> Ads Cùng Kỳ ({correlation.summary?.prevPeriodLabel || 'Kỳ trước'})
                  </div>
                </div>
              </div>

              <div style={{ height: "370px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={correlation.periods || []}
                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="periodLabel"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#334155", fontWeight: 800 }}
                      dy={10}
                    />
                    {/* Trục Y trái: Số Lead */}
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#4f46e5", fontWeight: 700 }}
                      label={{ value: 'Số Lead CRM', angle: -90, position: 'insideLeft', fill: '#4f46e5', fontSize: 11, fontWeight: 800 }}
                    />
                    {/* Trục Y phải: Chi phí Ads */}
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#db2777", fontWeight: 700 }}
                      tickFormatter={(val) => {
                        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                        return val;
                      }}
                      label={{ value: 'Chi phí Ads (VNĐ)', angle: 90, position: 'insideRight', fill: '#db2777', fontSize: 11, fontWeight: 800 }}
                    />
                    <Tooltip content={<CustomCorrelationTooltip />} />
                    
                    {/* Cột Bar 1: Số Lead CRM Kỳ này */}
                    <Bar
                      yAxisId="left"
                      dataKey="crmLeads"
                      name={`Lead CRM (${correlation.summary?.targetMonth ? `T${correlation.summary.targetMonth}` : 'Kỳ này'})`}
                      fill="#6366f1"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={38}
                      isAnimationActive={false}
                    >
                      <LabelList dataKey="crmLeads" position="top" fill="#3730a3" style={{ fontSize: "11px", fontWeight: "900" }} />
                    </Bar>
                    
                    {/* Cột Bar 2: Số Lead CRM CÙNG KỲ THÁNG TRƯỚC */}
                    <Bar
                      yAxisId="left"
                      dataKey="prevCrmLeads"
                      name={`Lead Cùng Kỳ (${correlation.summary?.prevPeriodLabel || 'Kỳ trước'})`}
                      fill="#38bdf8"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={38}
                      isAnimationActive={false}
                    >
                      <LabelList dataKey="prevCrmLeads" position="top" fill="#0284c7" style={{ fontSize: "11px", fontWeight: "900" }} />
                    </Bar>

                    {/* Cột Bar 3: Chốt Đơn */}
                    <Bar
                      yAxisId="left"
                      dataKey="crmWon"
                      name="Chốt Đơn"
                      fill="#10b981"
                      radius={[5, 5, 0, 0]}
                      maxBarSize={22}
                      isAnimationActive={false}
                    />

                    {/* Đường Line 1: Chi phí Ads Kỳ này */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="adsSpend"
                      name={`Chi Phí Ads (${correlation.summary?.targetMonth ? `T${correlation.summary.targetMonth}` : 'Kỳ này'})`}
                      stroke="#ec4899"
                      strokeWidth={3.5}
                      dot={{ r: 5, fill: "#ec4899", strokeWidth: 2.5, stroke: "#fff" }}
                      activeDot={{ r: 7 }}
                      isAnimationActive={false}
                    />

                    {/* Đường Line 2: Chi phí Ads CÙNG KỲ (Đường nét đứt) */}
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="prevAdsSpend"
                      name={`Ads Cùng Kỳ (${correlation.summary?.prevPeriodLabel || 'Kỳ trước'})`}
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Comparative Breakdown Table */}
            <div className="corr-table-section">
              <div className="corr-table-header-row">
                <h4 className="corr-table-title">
                  <Layers size={16} className="text-indigo-600" />
                  <span>Bảng So Sánh Chi Tiết Từng Kỳ & Biến Động</span>
                </h4>
                <span className="corr-table-unit">
                  Đơn vị: VNĐ / Lead
                </span>
              </div>

              <div className="corr-table-wrapper">
                <table className="corr-table">
                  <thead>
                    <tr>
                      <th style={{ width: "12%" }}>KỲ PHÂN TÍCH</th>
                      <th style={{ width: "20%" }}>KỲ HIỆN TẠI (LEAD & ADS)</th>
                      <th style={{ width: "21%" }}>KỲ TRƯỚC (TUẦN TRƯỚC - WoW)</th>
                      <th style={{ width: "22%" }}>CÙNG KỲ {correlation.summary?.prevPeriodLabel?.toUpperCase() || 'THÁNG TRƯỚC'} (MoM)</th>
                      <th style={{ width: "25%" }}>CHẨN ĐOÁN & NGUYÊN NHÂN TỰ ĐỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(correlation.periods || []).map((p, idx) => (
                      <tr key={idx} className="corr-row">
                        <td>
                          <div className="period-cell">
                            <span className="period-title">{p.periodLabel}</span>
                            <span className="period-subtitle">{p.periodSub}</span>
                            <span className="period-days-badge">{p.daysCount} ngày</span>
                          </div>
                        </td>
                        <td>
                          <div className="curr-metrics-box">
                            <div className="metric-cell-row">
                              <span className="metric-main-val font-black">{p.crmLeads.toLocaleString()} lead</span>
                              <span className="metric-daily-sub">(TB <strong>{p.dailyLeads}</strong>/ngày)</span>
                            </div>
                            <div className="metric-cell-row mt-1">
                              <span className="spend-val">{p.adsSpend.toLocaleString('vi-VN')} đ</span>
                              <span className="metric-daily-sub">(TB <strong>{(p.dailySpend / 1000000).toFixed(1)}M</strong>/ngày)</span>
                            </div>
                            <div className="metric-sub-row mt-1.5">
                              <span className="cpl-badge">CPL: <strong>{p.cplCrm > 0 ? `${p.cplCrm.toLocaleString('vi-VN')} đ` : '—'}</strong></span>
                              <span className="won-badge">Chốt: <strong>{p.crmWon}</strong> ({p.conversionRate}%)</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="last-period-cell">
                            {p.lastPeriod ? (
                              <div className="compare-card last-period-card">
                                <div className="compare-head">
                                  <span className="compare-title text-indigo-700">{p.lastPeriod.periodLabel}</span>
                                  <span className="compare-sub">{p.lastPeriod.periodSub} ({p.lastPeriod.daysCount} ngày)</span>
                                </div>
                                <div className="compare-line">
                                  <span>Lead: <strong>{p.lastPeriod.crmLeads}</strong> ({p.lastPeriod.dailyLeads}/ng)</span>
                                  {p.lastPeriod.deltaLeadsPct !== 0 && (
                                    <span className={`delta-badge-sm ${p.lastPeriod.deltaLeadsPct > 0 ? 'pos' : 'neg'}`} title={`Biến động tổng: ${p.lastPeriod.deltaLeadsPct > 0 ? '+' : ''}{p.lastPeriod.deltaLeadsPct}% | TB/ngày: ${p.lastPeriod.deltaDailyLeadsPct > 0 ? '+' : ''}{p.lastPeriod.deltaDailyLeadsPct}%`}>
                                      {p.lastPeriod.deltaLeadsPct > 0 ? '+' : ''}{p.lastPeriod.deltaLeadsPct}%
                                    </span>
                                  )}
                                </div>
                                <div className="compare-line">
                                  <span>Ads: <strong>{(p.lastPeriod.adsSpend / 1000000).toFixed(1)}M</strong> ({(p.lastPeriod.dailySpend / 1000000).toFixed(1)}M/ng)</span>
                                  {p.lastPeriod.deltaSpendPct !== 0 && (
                                    <span className="delta-badge-sm neutral" title={`Biến động Ads`}>
                                      {p.lastPeriod.deltaSpendPct > 0 ? `+${p.lastPeriod.deltaSpendPct}%` : `${p.lastPeriod.deltaSpendPct}%`}
                                    </span>
                                  )}
                                </div>
                                <div className="compare-line text-xs text-slate-500">
                                  <span>CPL: <strong>{p.lastPeriod.cplCrm > 0 ? `${p.lastPeriod.cplCrm.toLocaleString('vi-VN')} đ` : '—'}</strong></span>
                                  {p.lastPeriod.deltaCplPct !== 0 && (
                                    <span className={p.lastPeriod.deltaCplPct < 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                      ({p.lastPeriod.deltaCplPct > 0 ? `+${p.lastPeriod.deltaCplPct}%` : `${p.lastPeriod.deltaCplPct}%`})
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="compare-empty-card">
                                <span>Kỳ bắt đầu theo dõi</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="prev-period-cell">
                            {(p.prevCrmLeads > 0 || p.prevAdsSpend > 0) ? (
                              <div className="compare-card prev-period-card">
                                <div className="compare-head">
                                  <span className="compare-title text-amber-700">{correlation.summary?.prevPeriodLabel || 'Tháng trước'}</span>
                                  <span className="compare-sub">{p.prevPeriodSub} ({p.prevDaysCount} ngày)</span>
                                </div>
                                <div className="compare-line">
                                  <span>Lead: <strong>{p.prevCrmLeads}</strong> ({p.prevDailyLeads}/ng)</span>
                                  {p.deltaMoMLeadsPct !== null && (
                                    <span className={`delta-badge-sm ${p.deltaDailyLeadsPct >= 0 ? 'pos' : 'neg'}`} title={`Tổng MoM: ${p.deltaMoMLeadsPct >= 0 ? '+' : ''}{p.deltaMoMLeadsPct}% | TB/ngày: ${p.deltaDailyLeadsPct >= 0 ? '+' : ''}{p.deltaDailyLeadsPct}%`}>
                                      {p.deltaDailyLeadsPct >= 0 ? '+' : ''}{p.deltaDailyLeadsPct}%/ng
                                    </span>
                                  )}
                                </div>
                                <div className="compare-line">
                                  <span>Ads: <strong>{(p.prevAdsSpend / 1000000).toFixed(1)}M</strong> ({(p.prevDailySpend / 1000000).toFixed(1)}M/ng)</span>
                                  {p.deltaMoMSpendPct !== null && (
                                    <span className="delta-badge-sm neutral" title={`Tổng Ads MoM: ${p.deltaMoMSpendPct >= 0 ? '+' : ''}{p.deltaMoMSpendPct}% | TB/ngày: ${p.deltaDailySpendPct >= 0 ? '+' : ''}{p.deltaDailySpendPct}%`}>
                                      {p.deltaDailySpendPct >= 0 ? `+${p.deltaDailySpendPct}%` : `${p.deltaDailySpendPct}%`}/ng
                                    </span>
                                  )}
                                </div>
                                <div className="compare-line text-xs text-slate-500">
                                  <span>CPL: <strong>{p.prevCplCrm > 0 ? `${p.prevCplCrm.toLocaleString('vi-VN')} đ` : '—'}</strong></span>
                                  {p.deltaMoMCplPct !== null && (
                                    <span className={p.deltaMoMCplPct <= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                      ({p.deltaMoMCplPct >= 0 ? '+' : ''}{p.deltaMoMCplPct}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="compare-empty-card">
                                <span>Chưa có dữ liệu cùng kỳ</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="diagnosis-cell">
                            {p.diagnosis || '—'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="corr-footer-row">
                      <td>
                        <div className="period-cell">
                          <span className="font-extrabold text-indigo-950 text-xs uppercase tracking-wider">TỔNG LŨY KẾ</span>
                          <span className="period-days-badge">{correlation.summary?.totalDays || 0} ngày</span>
                        </div>
                      </td>
                      <td>
                        <div className="curr-metrics-box">
                          <div className="metric-cell-row">
                            <span className="metric-main-val text-indigo-700 font-black">{correlation.summary?.totalLeads?.toLocaleString() || 0} lead</span>
                            <span className="metric-daily-sub">(TB <strong>{correlation.summary?.avgDailyLeads || 0}</strong>/ngày)</span>
                          </div>
                          <div className="metric-cell-row mt-1">
                            <span className="spend-val text-pink-700 font-bold">{(correlation.summary?.totalSpend || 0).toLocaleString('vi-VN')} đ</span>
                            <span className="metric-daily-sub">(TB <strong>{((correlation.summary?.avgDailySpend || 0) / 1000000).toFixed(1)}M</strong>/ngày)</span>
                          </div>
                          <div className="metric-sub-row mt-1.5">
                            <span className="cpl-badge">CPL: <strong>{(correlation.summary?.avgCpl || 0).toLocaleString('vi-VN')} đ</strong></span>
                            <span className="won-badge">Chốt: <strong>{correlation.summary?.totalWon || 0}</strong> ({correlation.summary?.avgConversionRate || 0}%)</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="compare-empty-card">
                          <span className="text-slate-600 font-semibold">Theo dõi biến động WoW</span>
                        </div>
                      </td>
                      <td>
                        <div className="compare-card prev-period-card">
                          <div className="compare-head">
                            <span className="compare-title text-amber-700">{correlation.summary?.prevPeriodLabel || 'Kỳ trước'}</span>
                            <span className="compare-sub">{correlation.summary?.prevTotalDays || 0} ngày</span>
                          </div>
                          <div className="compare-line">
                            <span>Lead: <strong>{correlation.summary?.prevTotalLeads?.toLocaleString() || 0}</strong> ({correlation.summary?.prevAvgDailyLeads || 0}/ng)</span>
                            {correlation.summary?.momDailyLeadsPct !== null && (
                              <span className={`delta-badge-sm ${correlation.summary?.momDailyLeadsPct >= 0 ? 'pos' : 'neg'}`}>
                                {correlation.summary.momDailyLeadsPct >= 0 ? '+' : ''}{correlation.summary.momDailyLeadsPct}%/ng
                              </span>
                            )}
                          </div>
                          <div className="compare-line">
                            <span>Ads: <strong>{((correlation.summary?.prevTotalSpend || 0) / 1000000).toFixed(1)}M</strong> ({((correlation.summary?.prevAvgDailySpend || 0) / 1000000).toFixed(1)}M/ng)</span>
                            {correlation.summary?.momDailySpendPct !== null && (
                              <span className="delta-badge-sm neutral">
                                {correlation.summary.momDailySpendPct >= 0 ? `+${correlation.summary.momDailySpendPct}%` : `${correlation.summary.momDailySpendPct}%`}/ng
                              </span>
                            )}
                          </div>
                          <div className="compare-line text-xs text-slate-500">
                            <span>CPL: <strong>{(correlation.summary?.prevAvgCpl || 0).toLocaleString('vi-VN')} đ</strong></span>
                            {correlation.summary?.momAvgCplPct !== null && (
                              <span className={correlation.summary.momAvgCplPct <= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                                ({correlation.summary.momAvgCplPct >= 0 ? '+' : ''}{correlation.summary.momAvgCplPct}%)
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-bold text-xs text-indigo-900 leading-relaxed">
                          Đối chiếu toàn diện {correlation.summary?.targetMonth ? `Tháng ${correlation.summary.targetMonth}/${correlation.summary.targetYear}` : ''} với {correlation.summary?.prevPeriodLabel || 'kỳ trước'}.
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Smart Diagnosis Banner */}
            <div className="smart-diagnosis-banner">
              <div className="diagnosis-banner-head">
                <div className="diagnosis-icon-box">
                  <Sparkles size={20} className="text-indigo-600 animate-pulse" />
                </div>
                <div>
                  <h5 className="diagnosis-banner-title">
                    Đánh Giá Tổng Hợp Từ Hệ Thống (Smart Diagnosis Insights)
                  </h5>
                  <p className="diagnosis-banner-sub">
                    Tự động đối chiếu dữ liệu CRM & Meta Ads để phân tích hiệu quả chiến dịch
                  </p>
                </div>
              </div>

              <div className="diagnosis-insights-list">
                {correlation.summary?.bestPeriod && (
                  <div className="insight-card best">
                    <span className="insight-icon">🏆</span>
                    <span className="insight-text">
                      <strong>Kỳ đạt hiệu quả cao nhất:</strong> {correlation.summary.bestPeriod} với chi phí thu thập mỗi lead CRM tối ưu nhất.
                    </span>
                  </div>
                )}
                {correlation.summary?.highestCplPeriod && (
                  <div className="insight-card warning">
                    <span className="insight-icon">⚠️</span>
                    <span className="insight-text">
                      <strong>Cần lưu ý:</strong> {correlation.summary.highestCplPeriod} có mức CPL cao nhất trong kỳ, cần rà soát lại thông điệp quảng cáo hoặc độ tương thích tệp khách hàng.
                    </span>
                  </div>
                )}
                {!correlation.summary?.bestPeriod && (
                  <div className="insight-card info">
                    <span className="insight-icon">💡</span>
                    <span className="insight-text">
                      Dữ liệu đang được đối chiếu thời gian thực giữa CRM và báo cáo Marketing Ads để đưa ra khuyến nghị phân bổ ngân sách tối ưu.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
          <div className="mt-6" style={{ height: "320px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
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
                  label={({ status, percent }) =>
                    percent > 0.05 ? `${status}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {stats.statusStats.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                      cornerRadius={8}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    padding: "12px",
                  }}
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
              <p className="card-subtitle">
                Hiệu suất theo từng đơn vị kinh doanh
              </p>
            </div>
            <Briefcase size={20} className="text-violet-500" />
          </div>
          <div className="mt-6" style={{ height: "320px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
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
                  label={({ name, percent }) =>
                    percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {stats.buStats.map((entry, index) => (
                    <Cell
                      key={`cell-bu-${index}`}
                      fill={COLORS[(index + 4) % COLORS.length]}
                      cornerRadius={8}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                    padding: "12px",
                  }}
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
          <div className="mt-8" style={{ height: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.sourceStats}
                layout="vertical"
                margin={{ left: 20, right: 30, top: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="source"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 700, fill: "#475569" }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${value} leads`, "Số lượng"]}
                />
                <Bar
                  dataKey="count"
                  fill="#f59e0b"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                  isAnimationActive={false}
                >
                  {stats.sourceStats.map((entry, index) => (
                    <Cell
                      key={`cell-source-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      fill: "#64748b",
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Phân bổ theo Quốc gia</h3>
              <p className="card-subtitle">
                Sức hút theo từng địa điểm du lịch
              </p>
            </div>
            <Globe size={20} className="text-cyan-500" />
          </div>
          <div className="mt-8" style={{ height: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.destinationStats}
                layout="vertical"
                margin={{ left: 20, right: 30, top: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 700, fill: "#475569" }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#06b6d4"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                  isAnimationActive={false}
                >
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      fill: "#64748b",
                    }}
                  />
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
              <p className="card-subtitle">
                Liên hệ lần 2 vs Thực tế (Nóng/Ấm/Lạnh/Mới)
              </p>
            </div>
            <Target size={20} className="text-rose-500" />
          </div>
          <div className="mt-6" style={{ height: "320px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <Pie
                  data={stats.classificationStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={100}
                  dataKey="count"
                  nameKey="name"
                  isAnimationActive={false}
                  label={({ name, percent, count }) => 
                    percent > 0.05 ? `${name}: ${count}` : ''
                  }
                >
                  {stats.classificationStats.map((entry, index) => (
                    <Cell
                      key={`cell-quality-${index}`}
                      fill={QUALITY_COLORS[entry.name] || COLORS[(index + 2) % COLORS.length]}
                      cornerRadius={8}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-card professional flex-1">
          <div className="card-header">
            <div>
              <h3>Phân loại Lead (Chi tiết)</h3>
              <p className="card-subtitle">Tỷ lệ theo đánh giá của nhân viên</p>
            </div>
            <PieChartIcon size={20} className="text-emerald-500" />
          </div>
          <div className="mt-8" style={{ height: "350px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.classificationStats}
                layout="vertical"
                margin={{ left: 20, right: 30, top: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fontWeight: 700, fill: "#475569" }}
                  width={100}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [`${value} leads`, "Số lượng"]}
                />
                <Bar
                  dataKey="count"
                  radius={[0, 8, 8, 0]}
                  barSize={24}
                  isAnimationActive={false}
                >
                  {stats.classificationStats.map((entry, index) => (
                    <Cell
                      key={`cell-bar-quality-${index}`}
                      fill={QUALITY_COLORS[entry.name] || COLORS[(index + 2) % COLORS.length]}
                    />
                  ))}
                  <LabelList
                    dataKey="count"
                    position="right"
                    style={{
                      fontSize: "11px",
                      fontWeight: "bold",
                      fill: "#64748b",
                    }}
                  />
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

        .analytics-card.professional {
          background: white;
          padding: 2rem;
          border-radius: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        .card-header h3 {
          font-size: 1.125rem;
          font-weight: 900;
          color: #1e293b;
          padding-left: 2px;
        }
        .analytics-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          margin-bottom: 2.5rem;
        }

        /* Compare Filter Pill Button in Header */
        .compare-filter-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 6px 14px;
          border-radius: 14px;
          font-size: 11px;
          font-weight: 800;
          border: 1.5px solid #e0e7ff;
          background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
          color: #4f46e5;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
          flex-shrink: 0;
        }
        .compare-filter-pill-btn:hover {
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          border-color: #a5b4fc;
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.18);
        }
        .compare-filter-pill-btn.active {
          background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
          color: #ffffff;
          border-color: #3730a3;
          box-shadow: 0 6px 18px rgba(79, 70, 229, 0.35);
        }
        .pill-status-dot {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 8px;
          background: rgba(99, 102, 241, 0.12);
          color: #4f46e5;
          transition: all 0.2s ease;
        }
        .pill-status-dot.active {
          background: rgba(255, 255, 255, 0.25);
          color: #ffffff;
        }

        /* Comparison Section Outer Wrapper */
        .comparison-outer-wrapper {
          margin: 2rem 0 3.5rem 0;
          display: flex;
          width: 100%;
        }

        /* Correlation & Ads Comparison Section Styles */
        .correlation-card {
          position: relative;
          border: 1.5px solid #c7d2fe !important;
          box-shadow: 0 20px 45px -12px rgba(99, 102, 241, 0.12) !important;
          background: #ffffff;
          border-radius: 32px !important;
          padding: 2.25rem 2.5rem !important;
          animation: corrFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes corrFadeIn {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .corr-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .header-badge-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0.5rem;
        }
        .corr-main-title {
          font-size: 1.35rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin: 0;
        }
        .header-tag {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
        }
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .bu-pills-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .bu-filter-label {
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          display: flex;
          align-items: center;
          gap: 4px;
          margin-right: 4px;
        }
        .close-compare-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 14px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 800;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .close-compare-pill-btn:hover {
          background: #fee2e2;
          color: #dc2626;
          border-color: #fca5a5;
        }

        .badge-pill-gradient {
          display: inline-flex;
          align-items: center;
          padding: 4px 11px;
          border-radius: 9999px;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.6px;
          color: #4338ca;
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%);
          border: 1px solid #c7d2fe;
          text-transform: uppercase;
        }
        .bu-pill-btn {
          padding: 6px 13px;
          font-size: 11px;
          font-weight: 800;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .bu-pill-btn:hover {
          color: #4f46e5;
          border-color: #c7d2fe;
          background: #ffffff;
          transform: translateY(-1px);
        }
        .bu-pill-btn.active {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: #ffffff;
          border-color: #4f46e5;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
        }

        /* 4-Column Metric Grid */
        .corr-kpi-grid {
          display: grid !important;
          grid-template-columns: repeat(4, 1fr) !important;
          gap: 1.35rem !important;
          margin: 2rem 0 !important;
        }
        @media (max-width: 1200px) {
          .corr-kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .corr-kpi-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .metric-strip-card {
          padding: 1.4rem 1.6rem;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.02);
        }
        .metric-strip-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
        }

        .metric-strip-card.card-indigo {
          background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%);
          border: 1.5px solid #ddd6fe;
        }
        .metric-strip-card.card-pink {
          background: linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%);
          border: 1.5px solid #fbcfe8;
        }
        .metric-strip-card.card-amber {
          background: linear-gradient(135deg, #ffffff 0%, #fffbeb 100%);
          border: 1.5px solid #fde68a;
        }
        .metric-strip-card.card-emerald {
          background: linear-gradient(135deg, #ffffff 0%, #ecfdf5 100%);
          border: 1.5px solid #a7f3d0;
        }

        .metric-strip-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .metric-strip-label {
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.75px;
          text-transform: uppercase;
        }
        .metric-strip-label.label-indigo { color: #6366f1; }
        .metric-strip-label.label-pink { color: #db2777; }
        .metric-strip-label.label-amber { color: #d97706; }
        .metric-strip-label.label-emerald { color: #059669; }

        .metric-icon-circle {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
          background: #ffffff;
        }
        .icon-indigo { color: #6366f1; border: 1px solid #e0e7ff; }
        .icon-pink { color: #ec4899; border: 1px solid #fce7f3; }
        .icon-amber { color: #f59e0b; border: 1px solid #fef3c7; }
        .icon-emerald { color: #10b981; border: 1px solid #d1fae5; }

        .metric-strip-value {
          font-size: 1.95rem;
          font-weight: 950;
          letter-spacing: -1px;
          line-height: 1.1;
          margin-bottom: 0.75rem;
        }
        .currency-unit {
          font-size: 1.1rem;
          font-weight: 700;
          opacity: 0.75;
        }

        .metric-strip-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .footer-pill {
          font-size: 10px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 8px;
        }
        .pill-indigo { background: #ede9fe; color: #5b21b6; }
        .pill-amber { background: #fef3c7; color: #92400e; }
        .footer-sub {
          font-size: 11px;
          font-weight: 700;
        }

        /* Chart Header and Legends */
        .corr-chart-box {
          background: #ffffff;
          border: 1px solid #f1f5f9;
          border-radius: 26px;
          padding: 1.75rem 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.02);
          margin-bottom: 2rem;
        }
        .corr-chart-header {
          display: flex !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
          margin-bottom: 1.25rem !important;
          padding-bottom: 0.75rem !important;
          border-bottom: 1px dashed #f1f5f9 !important;
        }
        .corr-chart-title {
          display: inline-flex !important;
          align-items: center !important;
          gap: 8px !important;
          font-size: 13px !important;
          font-weight: 900 !important;
          color: #334155 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.5px !important;
        }
        .corr-chart-legend {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 16px !important;
        }
        .legend-item {
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
          font-size: 12px !important;
          font-weight: 800 !important;
        }
        .legend-badge-bar {
          width: 12px !important;
          height: 12px !important;
          border-radius: 4px !important;
          display: inline-block !important;
        }
        .legend-badge-line {
          width: 18px !important;
          height: 4px !important;
          border-radius: 2px !important;
          display: inline-block !important;
        }

        /* Table Section */
        .corr-table-section {
          margin-top: 1.5rem;
        }
        .corr-table-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.85rem;
        }
        .corr-table-title {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 900;
          color: #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }
        .corr-table-unit {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
        }
        .corr-table-wrapper {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 22px;
          overflow-x: auto;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
        }
        .corr-table {
          border-collapse: collapse;
          width: 100%;
        }
        .corr-table thead {
          background: #f8fafc;
        }
        .corr-table th {
          padding: 14px 20px;
          font-size: 11px;
          font-weight: 900;
          color: #475569;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #e2e8f0;
          text-transform: uppercase;
        }
        .corr-table td {
          padding: 16px 20px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }
        .corr-row:hover td {
          background: #f8fafc;
        }
        .corr-row:last-child td {
          border-bottom: none;
        }

        /* Table Cell Layouts */
        .period-cell {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 3px !important;
        }
        .period-title {
          font-size: 13.5px !important;
          font-weight: 900 !important;
          color: #4338ca !important;
        }
        .period-subtitle {
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #64748b !important;
          background: #f1f5f9 !important;
          padding: 2px 7px !important;
          border-radius: 6px !important;
          display: inline-block !important;
        }
        .period-days-badge {
          font-size: 10px !important;
          font-weight: 800 !important;
          color: #475569 !important;
          background: #e2e8f0 !important;
          padding: 1px 6px !important;
          border-radius: 5px !important;
          display: inline-block !important;
        }

        .curr-metrics-box {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .metric-cell-row {
          display: flex !important;
          flex-direction: row !important;
          align-items: baseline !important;
          gap: 6px !important;
          flex-wrap: wrap !important;
        }
        .metric-main-val {
          font-size: 14px !important;
          font-weight: 900 !important;
          color: #0f172a !important;
        }
        .metric-daily-sub {
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #64748b !important;
        }
        .spend-val {
          font-size: 13px !important;
          font-weight: 800 !important;
          color: #db2777 !important;
        }
        .metric-sub-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }
        .cpl-badge {
          font-size: 11px;
          color: #b45309;
          background: #fef3c7;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 700;
        }
        .won-badge {
          font-size: 11px;
          color: #047857;
          background: #d1fae5;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 700;
        }

        /* Comparison Cards (WoW & MoM) */
        .compare-card {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 8px 10px;
          border-radius: 10px;
          font-size: 11.5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
        }
        .last-period-card {
          background: #f8faff;
          border: 1px solid #e0e7ff;
        }
        .prev-period-card {
          background: #fffdfa;
          border: 1px solid #fef3c7;
        }
        .compare-empty-card {
          padding: 8px 10px;
          background: #f8fafc;
          border: 1px dashed #cbd5e1;
          border-radius: 10px;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          font-style: italic;
        }
        .compare-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px dashed rgba(0, 0, 0, 0.08);
          padding-bottom: 3px;
          margin-bottom: 2px;
        }
        .compare-title {
          font-weight: 800;
          font-size: 11px;
        }
        .compare-sub {
          font-size: 10px;
          color: #64748b;
          font-weight: 600;
        }
        .compare-line {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
          line-height: 1.35;
        }

        /* Delta Badges */
        .delta-badge {
          display: inline-flex !important;
          align-items: center !important;
          gap: 2px !important;
          padding: 2px 8px !important;
          border-radius: 8px !important;
          font-size: 10px !important;
          font-weight: 800 !important;
          white-space: nowrap !important;
        }
        .delta-badge.pos {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }
        .delta-badge.neg {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fecdd3;
        }
        .delta-badge.neutral {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .delta-badge-sm {
          display: inline-flex;
          align-items: center;
          padding: 1px 5px;
          border-radius: 5px;
          font-size: 9.5px;
          font-weight: 800;
          white-space: nowrap;
        }
        .delta-badge-sm.pos {
          background: #dcfce7;
          color: #15803d;
        }
        .delta-badge-sm.neg {
          background: #ffe4e6;
          color: #be123c;
        }
        .delta-badge-sm.neutral {
          background: #e2e8f0;
          color: #334155;
        }

        .footer-mom-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          padding: 2px 7px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 800;
        }
        .footer-mom-badge.pos {
          background: #dcfce7;
          color: #15803d;
        }
        .footer-mom-badge.neg {
          background: #ffe4e6;
          color: #be123c;
        }
        .footer-mom-badge.neutral {
          background: #f1f5f9;
          color: #475569;
        }

        .corr-footer-row td {
          background: #f1f5f9 !important;
          border-top: 2px solid #cbd5e1 !important;
          font-weight: 800;
          padding: 14px 16px;
        }

        .tooltip-compare-box {
          margin-top: 8px;
          padding-top: 6px;
          border-top: 1px dashed #cbd5e1;
          font-size: 11.5px;
        }
        .tooltip-compare-title {
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 3px;
        }
        .tooltip-compare-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
          color: #334155;
        }

        .diagnosis-cell {
          background: #f8fafc;
          padding: 9px 14px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          font-size: 12px;
          font-weight: 600;
          color: #334155;
          line-height: 1.45;
        }

        /* Smart Diagnosis Banner */
        .smart-diagnosis-banner {
          background: linear-gradient(135deg, #f8faff 0%, #eff6ff 100%);
          border: 1.5px solid #dbeafe;
          border-radius: 24px;
          padding: 1.5rem 1.85rem;
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.06);
          margin-top: 1.75rem;
        }
        .diagnosis-banner-head {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 1rem;
        }
        .diagnosis-icon-box {
          width: 44px;
          height: 44px;
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #bfdbfe;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.12);
        }
        .diagnosis-banner-title {
          font-size: 14px;
          font-weight: 900;
          color: #1e293b;
          margin: 0;
        }
        .diagnosis-banner-sub {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
          margin: 2px 0 0 0;
        }

        .diagnosis-insights-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .insight-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 12px;
          background: #ffffff;
          border: 1px solid #e2e8f0;
        }
        .insight-card.best {
          background: #fffbeb;
          border-color: #fde68a;
        }
        .insight-card.warning {
          background: #fff7ed;
          border-color: #fed7aa;
        }
        .insight-card.info {
          background: #ffffff;
          border-color: #e2e8f0;
        }
        .insight-icon {
          font-size: 16px;
          flex-shrink: 0;
          line-height: 1.2;
        }
        .insight-text {
          font-size: 12.5px;
          color: #334155;
          line-height: 1.45;
        }

        /* Custom Correlation Tooltip */
        .custom-corr-tooltip {
          background: #ffffff !important;
          border: 1.5px solid #cbd5e1 !important;
          border-radius: 16px !important;
          padding: 14px 18px !important;
          color: #0f172a !important;
          box-shadow: 0 20px 40px -5px rgba(15, 23, 42, 0.22) !important;
          min-width: 320px !important;
          max-width: 380px !important;
        }
        .tooltip-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          padding-bottom: 8px;
          margin-bottom: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .tooltip-title {
          font-size: 14px;
          font-weight: 900;
          color: #1e1b4b;
        }
        .tooltip-sub {
          font-size: 11.5px;
          font-weight: 700;
          color: #64748b;
        }
        .tooltip-body {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .tooltip-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #1e293b;
        }
        .tooltip-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .tooltip-label {
          color: #475569;
          font-weight: 700;
        }
        .tooltip-val {
          color: #0f172a;
          margin-left: auto;
        }
        .last-period-tooltip-box {
          background: #f8faff !important;
          border: 1px solid #c7d2fe !important;
        }
        .prev-period-tooltip-box {
          background: #fffdf7 !important;
          border: 1px solid #fed7aa !important;
        }
        .tooltip-foot {
          display: flex;
          align-items: flex-start;
          gap: 6px;
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px dashed #cbd5e1;
          font-size: 11.5px;
          color: #312e81;
          font-weight: 600;
          line-height: 1.4;
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
