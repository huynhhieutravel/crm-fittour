import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
  Search, BarChart2, TrendingUp, DollarSign, MousePointer, 
  Users, Phone, Mail, MessageCircle, CheckCircle, AlertTriangle, 
  Calendar, Edit2, Trash2, Lock, Unlock, Send, X, Plus, 
  ChevronDown, Layers, FileText, ArrowUpRight, HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, Line, Legend, PieChart, Pie, Cell 
} from 'recharts';

const NAM_OPTIONS = [2024, 2025, 2026, 2027];
const THANG_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const PIE_COLORS = ['#0284c7', '#16a34a', '#f59e0b', '#8b5cf6', '#ec4899'];

const GoogleAdsTab = ({ addToast, currentUser }) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const lastMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const lastMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const [data, setData] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedYear, setSelectedYear] = useState(lastMonthYear);
  const [selectedMonth, setSelectedMonth] = useState(lastMonth);

  // Modals state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
  const [editingKpi, setEditingKpi] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailParams, setEmailParams] = useState({
    month: lastMonth,
    recipient_email: 'huynhhieutravel@gmail.com'
  });
  const [resolvedRecipients, setResolvedRecipients] = useState([]);

  const fetchRecipients = async (external) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/google-ads/recipients?external_email=${encodeURIComponent(external || 'huynhhieutravel@gmail.com')}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.data?.success) {
        setResolvedRecipients(res.data.recipients || []);
      }
    } catch (e) {
      console.error('Lỗi tải recipients:', e);
    }
  };

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [reportsRes, kpiRes] = await Promise.all([
        axios.get(`/api/google-ads?year=${selectedYear}&bu_name=BU3`, { headers }),
        axios.get(`/api/google-ads/kpis?year=${selectedYear}&bu_name=BU3`, { headers })
      ]);

      if (reportsRes.data?.success) setData(reportsRes.data.data || []);
      if (kpiRes.data?.success) setKpis(kpiRes.data.kpis || []);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu Google Ads:', err);
      addToast?.('Không thể tải dữ liệu Google Ads', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  // Lọc dữ liệu theo tháng nếu người dùng chọn tháng cụ thể
  const filteredData = useMemo(() => {
    if (!selectedMonth) return data;
    return data.filter(d => parseInt(d.month) === parseInt(selectedMonth));
  }, [data, selectedMonth]);

  // Tổng hợp các chỉ số cấp cao (Executive KPI Summary)
  const summary = useMemo(() => {
    const totalSpend = filteredData.reduce((acc, r) => acc + parseFloat(r.spend || 0), 0);
    const totalImpressions = filteredData.reduce((acc, r) => acc + parseInt(r.impressions || 0), 0);
    const totalClicks = filteredData.reduce((acc, r) => acc + parseInt(r.clicks || 0), 0);

    const totalZalo = filteredData.reduce((acc, r) => acc + parseInt(r.click_zalo || 0), 0);
    const totalPhone = filteredData.reduce((acc, r) => acc + parseInt(r.click_phone || 0), 0);
    const totalConsultation = filteredData.reduce((acc, r) => acc + parseInt(r.click_consultation || 0), 0);
    const totalEmail = filteredData.reduce((acc, r) => acc + parseInt(r.click_email || 0), 0);
    const totalFormSubmit = filteredData.reduce((acc, r) => acc + parseInt(r.form_submit || 0), 0);
    const totalB2BInterest = filteredData.reduce((acc, r) => acc + parseInt(r.interest_b2b_tour || 0), 0);

    const totalDirectActions = totalZalo + totalPhone + totalConsultation + totalEmail;

    const totalCrmLeads = filteredData.reduce((acc, r) => acc + parseInt(r.crm_leads || 0), 0);
    const totalCrmWon = filteredData.reduce((acc, r) => acc + parseInt(r.crm_won || 0), 0);
    const totalRevenueWon = filteredData.reduce((acc, r) => acc + parseFloat(r.revenue_won || 0), 0);

    // Tính target từ KPIs
    const relevantKpis = selectedMonth
      ? kpis.filter(k => parseInt(k.month) === parseInt(selectedMonth))
      : kpis;
    const totalBudget = relevantKpis.reduce((acc, k) => acc + parseFloat(k.budget || 0), 0);
    const targetLeads = relevantKpis.reduce((acc, k) => acc + parseInt(k.target_leads || 0), 0);

    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;
    const cpa = totalDirectActions > 0 ? totalSpend / totalDirectActions : 0;
    const cpl = totalCrmLeads > 0 ? totalSpend / totalCrmLeads : 0;
    const conversionRate = totalClicks > 0 ? (totalDirectActions / totalClicks) * 100 : 0;
    const spendProgress = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;
    const roi = totalSpend > 0 && totalRevenueWon > 0 ? totalRevenueWon / totalSpend : 0;

    return {
      totalSpend,
      totalBudget,
      spendProgress,
      totalImpressions,
      totalClicks,
      ctr,
      avgCpc,
      totalDirectActions,
      totalZalo,
      totalPhone,
      totalConsultation,
      totalEmail,
      totalFormSubmit,
      totalB2BInterest,
      cpa,
      cpl,
      conversionRate,
      totalCrmLeads,
      targetLeads,
      totalCrmWon,
      totalRevenueWon,
      roi
    };
  }, [filteredData, kpis, selectedMonth]);

  // Chuẩn bị dữ liệu cho Biểu đồ Xu hướng Tháng (Trend Chart)
  const trendChartData = useMemo(() => {
    return data.map(r => ({
      name: `T${r.month}`,
      month: r.month,
      spend: Math.round(r.spend / 1000000), // Triệu VND
      clicks: r.clicks,
      actions: r.total_actions,
      b2b_interest: r.interest_b2b_tour
    }));
  }, [data]);

  // Chuẩn bị dữ liệu cho Biểu đồ Donut Kênh Tương Tác
  const donutChartData = useMemo(() => {
    return [
      { name: 'Chat Zalo B2B', value: summary.totalZalo },
      { name: 'Gọi Hotline', value: summary.totalPhone },
      { name: 'Yêu Cầu Tư Vấn', value: summary.totalConsultation },
      { name: 'Gửi Email', value: summary.totalEmail },
    ].filter(i => i.value > 0);
  }, [summary]);

  // Xóa báo cáo
  const handleDeleteReport = async (item) => {
    if (item.is_locked) {
      Swal.fire('Đã khóa', 'Dữ liệu tháng này đã được khóa. Hãy mở khóa trước khi xóa.', 'warning');
      return;
    }
    const result = await Swal.fire({
      title: `Xóa báo cáo Tháng ${item.month}/${item.year}?`,
      text: 'Thao tác này sẽ xóa toàn bộ số liệu Google Ads và GA4 của tháng đã chọn.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy bỏ'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/google-ads/monthly-report/${item.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        addToast?.(`Đã xóa báo cáo Tháng ${item.month}/${item.year}!`);
        fetchData();
      } catch (err) {
        console.error(err);
        addToast?.('Lỗi khi xóa báo cáo', 'error');
      }
    }
  };

  // Khóa / Mở khóa
  const handleToggleLock = async (item) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/google-ads/monthly-report/${item.id}/lock`, {
        is_locked: !item.is_locked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast?.(item.is_locked ? 'Đã mở khóa dữ liệu' : 'Đã khóa dữ liệu an toàn');
      fetchData();
    } catch (err) {
      console.error(err);
      addToast?.('Lỗi khi cập nhật trạng thái khóa', 'error');
    }
  };

  // Mở modal sửa
  const handleEditReport = (item) => {
    setEditingReport(item);
    setIsReportModalOpen(true);
  };

  // Mở modal tạo mới
  const handleAddNewReport = () => {
    const nextMonth = data.length > 0 ? Math.min(12, Math.max(...data.map(d => d.month)) + 1) : (new Date().getMonth() + 1);
    setEditingReport({
      bu_name: 'BU3',
      year: selectedYear,
      month: nextMonth,
      campaign_name: `[ BU3 | SEARCH | Tour Doanh Nghiệp | VN | T${nextMonth}-${selectedYear} ]`,
      spend: '',
      impressions: '',
      clicks: '',
      conversions_ads: '',
      interest_b2b_tour: '',
      interest_b2b_tour_users: '',
      click_zalo: '',
      click_zalo_users: '',
      click_phone: '',
      click_phone_users: '',
      click_consultation: '',
      click_consultation_users: '',
      click_email: '',
      click_email_users: '',
      generate_lead: '',
      form_submit: '',
      form_start: '',
      page_view: '',
      user_engagement: '',
      crm_leads: '',
      crm_won: '',
      revenue_won: '',
      notes: ''
    });
    setIsReportModalOpen(true);
  };

  // Mở modal KPI
  const handleOpenKpiModal = () => {
    const targetMonth = selectedMonth ? parseInt(selectedMonth) : (new Date().getMonth() + 1);
    const existingKpi = kpis.find(k => parseInt(k.month) === targetMonth) || {};
    setEditingKpi({
      bu_name: 'BU3',
      year: selectedYear,
      month: targetMonth,
      budget: existingKpi.budget || '',
      target_leads: existingKpi.target_leads || '',
      target_cpl: existingKpi.target_cpl || '',
      target_groups: existingKpi.target_groups || '',
      target_cpa: existingKpi.target_cpa || '',
      pic_name: existingKpi.pic_name || 'Leader BU3',
      notes: existingKpi.notes || ''
    });
    setIsKpiModalOpen(true);
  };

  // Gửi Email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailSending(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/google-ads/send-email', {
        month: emailParams.month,
        year: selectedYear,
        recipient_email: emailParams.recipient_email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast?.(`Đã gửi email báo cáo Tháng ${emailParams.month}/${selectedYear} thành công!`);
      setIsEmailModalOpen(false);
    } catch (err) {
      console.error(err);
      addToast?.(err.response?.data?.error || 'Lỗi khi gửi email', 'error');
    } finally {
      setEmailSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 24px 24px' }}>
      
      {/* 1. Header Bar: Tiêu đề và Các nút chức năng */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '0.75rem 0 1.25rem 0', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              BU3 • B2B / MICE TOUR
            </span>
            <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#059669', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Chu kỳ Tháng
            </span>
          </div>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0f172a', margin: '6px 0 2px 0' }}>
            Báo Cáo Google Ads & Tương Tác B2B
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
            Quản trị hiệu suất Google Search Ads, đo lường sự kiện chuyển đổi GA4 và số liệu chốt đoàn doanh nghiệp.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={handleOpenKpiModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff', fontWeight: 700, fontSize: '0.82rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(245, 158, 11, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Edit2 size={15} /> Cập nhật Target Tháng
          </button>

          <button
            onClick={handleAddNewReport}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              color: '#ffffff', fontWeight: 700, fontSize: '0.82rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Plus size={16} /> Nhập Dữ Liệu Tháng
          </button>

          <button
            onClick={() => {
              const targetM = selectedMonth || (data.length > 0 ? data[data.length - 1].month : lastMonth);
              setEmailParams({
                month: targetM,
                recipient_email: 'huynhhieutravel@gmail.com'
              });
              fetchRecipients('huynhhieutravel@gmail.com');
              setIsEmailModalOpen(true);
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px',
              background: '#10b981', color: '#ffffff',
              fontWeight: 700, fontSize: '0.82rem',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
              transition: 'all 0.2s'
            }}
          >
            <Send size={15} /> Gửi Báo Cáo Tháng
          </button>
        </div>
      </div>

      {/* 2. Filter Bar: Chọn Năm, Dropdown Tháng & Nút Chọn Nhanh */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        {/* Chọn Năm */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Năm:</span>
          <select 
            className="filter-input" 
            value={selectedYear} 
            onChange={e => setSelectedYear(parseInt(e.target.value))}
            style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, background: '#fff' }}
          >
            {NAM_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }}></div>

        {/* Dropdown chọn Tháng */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Tháng:</span>
          <select 
            className="filter-input" 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(e.target.value === '' ? '' : parseInt(e.target.value))}
            style={{ padding: '6px 14px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, color: '#1e293b', background: '#fff', minWidth: '160px' }}
          >
            <option value="">Cả Năm {selectedYear}</option>
            {THANG_OPTIONS.map(m => {
              const hasData = data.some(d => parseInt(d.month) === m);
              return (
                <option key={m} value={m}>
                  Tháng {m}/{selectedYear} {hasData ? '• (Có data)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        <div style={{ width: '1px', height: '24px', background: '#cbd5e1' }}></div>

        {/* Nút chọn nhanh (Quick Filter Pills) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginRight: '2px' }}>Xem nhanh:</span>
          
          <button
            type="button"
            onClick={() => {
              setSelectedYear(lastMonthYear);
              setSelectedMonth(lastMonth);
            }}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              border: (selectedMonth === lastMonth && selectedYear === lastMonthYear) ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: (selectedMonth === lastMonth && selectedYear === lastMonthYear) ? '#eff6ff' : '#ffffff',
              color: (selectedMonth === lastMonth && selectedYear === lastMonthYear) ? '#1d4ed8' : '#475569',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              boxShadow: (selectedMonth === lastMonth && selectedYear === lastMonthYear) ? '0 1px 3px rgba(37,99,235,0.2)' : 'none'
            }}
          >
            ⏪ Tháng trước (T{lastMonth})
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedYear(currentYear);
              setSelectedMonth(currentMonth);
            }}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              border: (selectedMonth === currentMonth && selectedYear === currentYear) ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: (selectedMonth === currentMonth && selectedYear === currentYear) ? '#eff6ff' : '#ffffff',
              color: (selectedMonth === currentMonth && selectedYear === currentYear) ? '#1d4ed8' : '#475569',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              boxShadow: (selectedMonth === currentMonth && selectedYear === currentYear) ? '0 1px 3px rgba(37,99,235,0.2)' : 'none'
            }}
          >
            ▶️ Tháng này (T{currentMonth})
          </button>

          <button
            type="button"
            onClick={() => setSelectedMonth('')}
            style={{
              padding: '6px 14px', borderRadius: '20px',
              border: selectedMonth === '' ? '2px solid #2563eb' : '1px solid #cbd5e1',
              background: selectedMonth === '' ? '#eff6ff' : '#ffffff',
              color: selectedMonth === '' ? '#1d4ed8' : '#475569',
              fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              boxShadow: selectedMonth === '' ? '0 1px 3px rgba(37,99,235,0.2)' : 'none'
            }}
          >
            📅 Cả năm {selectedYear}
          </button>
        </div>
      </div>

      {/* 3. Executive KPI Cards (4 Thẻ chỉ số tổng quan) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        
        {/* Card 1: Ngân Sách & Chi Tiêu */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Chi Phí & Ngân Sách
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {summary.totalSpend.toLocaleString('vi-VN')} <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#64748b' }}>₫</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Target: <b>{summary.totalBudget > 0 ? summary.totalBudget.toLocaleString('vi-VN') + ' ₫' : 'Chưa đặt'}</b></span>
            <span style={{ fontWeight: 700, color: summary.spendProgress > 100 ? '#ef4444' : '#059669' }}>
              {summary.spendProgress > 0 ? `${summary.spendProgress.toFixed(1)}%` : '0%'}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', marginTop: '8px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(summary.spendProgress, 100)}%`,
              height: '100%',
              background: summary.spendProgress > 100 ? '#ef4444' : summary.spendProgress > 80 ? '#10b981' : '#3b82f6',
              transition: 'width 0.3s'
            }}></div>
          </div>
        </div>

        {/* Card 2: Hiệu Suất Tìm Kiếm (Google Search) */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Lần Nhấp & Hiển Thị
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MousePointer size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
            {summary.totalClicks.toLocaleString('vi-VN')} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>clicks</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.82rem', color: '#64748b' }}>
            <span>Hiển thị: <b>{summary.totalImpressions.toLocaleString('vi-VN')}</b></span>
            <span>CTR: <b style={{ color: '#2563eb' }}>{summary.ctr.toFixed(2)}%</b></span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px' }}>
            CPC Trung bình: <b style={{ color: '#475569' }}>{Math.round(summary.avgCpc).toLocaleString('vi-VN')} ₫/click</b>
          </div>
        </div>

        {/* Card 3: Phễu Tương Tác GA4 */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Tương Tác Chuyển Đổi (GA4)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fdf2f8', color: '#db2777', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#db2777', letterSpacing: '-0.02em' }}>
            {summary.totalDirectActions} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>hành động</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.82rem', color: '#64748b' }}>
            <span>CPA (Chi phí/Hành động):</span>
            <b style={{ color: '#ea580c' }}>{Math.round(summary.cpa).toLocaleString('vi-VN')} ₫</b>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span>Zalo: <b>{summary.totalZalo}</b></span> •
            <span>Hotline: <b>{summary.totalPhone}</b></span> •
            <span>Tư vấn: <b>{summary.totalConsultation}</b></span> •
            <span>Email: <b>{summary.totalEmail}</b></span>
          </div>
        </div>

        {/* Card 4: Kết Quả Kinh Doanh CRM BU3 */}
        <div style={{ background: '#ffffff', padding: '18px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Kết Quả Đoàn B2B (CRM)
            </span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16a34a', letterSpacing: '-0.02em' }}>
            {summary.totalCrmWon} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>đoàn chốt</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.82rem', color: '#64748b' }}>
            <span>Doanh thu ký:</span>
            <b style={{ color: '#059669' }}>{summary.totalRevenueWon.toLocaleString('vi-VN')} ₫</b>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.82rem', color: '#64748b' }}>
            <span>Lead Doanh nghiệp: <b>{summary.totalCrmLeads}</b></span>
            <span>ROI: <b style={{ color: '#7c3aed' }}>{summary.roi > 0 ? `${summary.roi}x` : '–'}</b></span>
          </div>
        </div>

      </div>

      {/* 4. Master Data Table (Bảng chi tiết theo tháng) - Đưa lên trước theo yêu cầu */}
      <div className="data-table-container" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafbfc' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              Chi Tiết Báo Cáo Google Ads & GA4 Theo Tháng
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Dữ liệu tổng hợp từng tháng cho BU3 (Tour Doanh Nghiệp)
            </span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
            Hiển thị: <b>{filteredData.length}</b> tháng
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.83rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 14px', width: '90px' }}>THÁNG</th>
                <th style={{ padding: '12px 14px', minWidth: '220px' }}>CHIẾN DỊCH SEARCH</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>CHI PHÍ (₫)</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>HIỂN THỊ</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>CLICKS</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>CTR</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>CPC (₫)</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>QUAN TÂM B2B</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>ZALO</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>HOTLINE</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>TƯ VẤN</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', background: '#eff6ff', color: '#1d4ed8' }}>EMAIL</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800 }}>TỔNG LIÊN HỆ</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>CPA (₫)</th>
                <th style={{ padding: '12px 14px', textAlign: 'center', background: '#ecfdf5', color: '#047857' }}>CRM WON</th>
                <th style={{ padding: '12px 14px', textAlign: 'center' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="16" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    Đang tải dữ liệu báo cáo Google Ads...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="16" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Chưa có dữ liệu báo cáo cho Tháng {selectedMonth ? `Tháng ${selectedMonth}` : `Năm ${selectedYear}`}. Nhấn <b>"Nhập Dữ Liệu Tháng"</b> để thêm mới.
                  </td>
                </tr>
              ) : (
                filteredData.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#1e293b' }}>
                      Tháng {r.month}/{r.year}
                      {r.is_locked && (
                        <Lock size={12} style={{ marginLeft: '4px', color: '#eab308', verticalAlign: 'middle' }} title="Đã khóa dữ liệu" />
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 600 }}>
                      <div style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={r.campaign_name}>
                        {r.campaign_name}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#d97706' }}>
                      {parseFloat(r.spend || 0).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {parseInt(r.impressions || 0).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#2563eb' }}>
                      {parseInt(r.clicks || 0).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {r.ctr}%
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {r.avg_cpc.toLocaleString('vi-VN')}
                    </td>
                    {/* GA4 Columns */}
                    <td style={{ padding: '12px 14px', textAlign: 'center', background: '#f8fafc' }}>
                      <b style={{ color: '#2563eb' }}>{r.interest_b2b_tour}</b>
                      {r.interest_b2b_tour_users > 0 && (
                        <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>({r.interest_b2b_tour_users} user)</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', background: '#f8fafc', color: '#0284c7', fontWeight: 700 }}>
                      {r.click_zalo}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', background: '#f8fafc', color: '#16a34a', fontWeight: 700 }}>
                      {r.click_phone}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', background: '#f8fafc', color: '#ea580c', fontWeight: 700 }}>
                      {r.click_consultation}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', background: '#f8fafc', color: '#8b5cf6', fontWeight: 700 }}>
                      {r.click_email}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 800, color: '#db2777', fontSize: '0.9rem' }}>
                      {r.total_actions}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#475569' }}>
                      {r.cpa.toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', background: '#f0fdf4', color: '#15803d', fontWeight: 700 }}>
                      {r.crm_won} đoàn
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                        <button 
                          className="btn-action btn-edit-pro"
                          onClick={() => handleEditReport(r)} 
                          title="Chỉnh sửa số liệu"
                          style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} color="#2563eb" />
                        </button>
                        <button 
                          className="btn-action"
                          onClick={() => handleToggleLock(r)} 
                          title={r.is_locked ? "Mở khóa" : "Khóa dữ liệu"}
                          style={{ padding: '5px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                        >
                          {r.is_locked ? <Unlock size={14} color="#10b981" /> : <Lock size={14} color="#eab308" />}
                        </button>
                        <button 
                          className="btn-action btn-delete-pro"
                          onClick={() => handleDeleteReport(r)} 
                          title="Xóa dữ liệu"
                          style={{ padding: '5px', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Charts Section: Xu hướng chi phí vs tương tác + Cơ cấu kênh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        
        {/* Trend Bar Chart */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={16} color="#3b82f6" /> Xu Hướng Chi Phí (Tr.₫) & Lượt Tương Tác Qua Các Tháng
          </h3>
          {trendChartData.length === 0 ? (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Chưa có dữ liệu biểu đồ
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'spend') return [`${value} Tr. ₫`, 'Chi phí Ads'];
                    if (name === 'actions') return [`${value} lượt`, 'Tương tác trực tiếp'];
                    if (name === 'clicks') return [`${value} clicks`, 'Lần nhấp'];
                    return [value, name];
                  }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="spend" name="Chi phí (Tr.₫)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="actions" name="Tương tác liên hệ" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut Chart: Cơ cấu kênh liên hệ */}
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={16} color="#8b5cf6" /> Cơ Cấu Kênh Tương Tác Chuyển Đổi (GA4)
          </h3>
          {donutChartData.length === 0 ? (
            <div style={{ height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              Chưa có dữ liệu tương tác
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '240px' }}>
              <div style={{ width: '60%', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {donutChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ width: '40%', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {donutChartData.map((item, idx) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                    <span style={{ color: '#475569', flex: 1 }}>{item.name}:</span>
                    <b style={{ color: '#0f172a' }}>{item.value}</b>
                  </div>
                ))}
                <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '6px', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>Tổng cộng:</span>
                  <span style={{ color: '#2563eb' }}>{summary.totalDirectActions}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* MODAL 1: Nhập/Sửa Báo Cáo Tháng */}
      {isReportModalOpen && editingReport && (
        <ReportModal 
          report={editingReport}
          onClose={() => { setIsReportModalOpen(false); setEditingReport(null); }}
          onSave={async (formData) => {
            try {
              const token = localStorage.getItem('token');
              await axios.post('/api/google-ads/monthly-report', formData, {
                headers: { Authorization: `Bearer ${token}` }
              });
              addToast?.(`Lưu dữ liệu Tháng ${formData.month}/${formData.year} thành công!`);
              setIsReportModalOpen(false);
              setEditingReport(null);
              fetchData();
            } catch (err) {
              console.error(err);
              addToast?.('Lỗi khi lưu dữ liệu báo cáo', 'error');
            }
          }}
        />
      )}

      {/* MODAL 2: Cập Nhật Target / KPI */}
      {isKpiModalOpen && editingKpi && (
        <KpiModal 
          kpi={editingKpi}
          onClose={() => { setIsKpiModalOpen(false); setEditingKpi(null); }}
          onSave={async (kpiData) => {
            try {
              const token = localStorage.getItem('token');
              await axios.post('/api/google-ads/kpis', kpiData, {
                headers: { Authorization: `Bearer ${token}` }
              });
              addToast?.(`Đã lưu Target KPI Tháng ${kpiData.month}/${kpiData.year}!`);
              setIsKpiModalOpen(false);
              setEditingKpi(null);
              fetchData();
            } catch (err) {
              console.error(err);
              addToast?.('Lỗi khi lưu KPI', 'error');
            }
          }}
        />
      )}

      {/* MODAL 3: Gửi Báo Cáo Tháng qua Email */}
      {isEmailModalOpen && (
        <div 
          className="drawer-overlay" 
          onClick={() => setIsEmailModalOpen(false)}
          style={{ 
            position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
            zIndex: 10000, display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch'
          }}
        >
          <div 
            className="drawer-content" 
            onClick={e => e.stopPropagation()} 
            style={{ 
              width: '520px', maxWidth: '100vw', background: '#ffffff', height: '100vh', maxHeight: '100vh',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-10px 0 35px rgba(0,0,0,0.25)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            }}
          >
            <div className="drawer-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>Gửi Báo Cáo Tháng (BU3)</h2>
                  <span style={{ fontSize: '11px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '12px', fontWeight: 700 }}>Group BU3</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0 0' }}>Gửi độc quyền tới Group Email BU3 & Email ngoài chỉ định</p>
              </div>
              <button onClick={() => setIsEmailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSendEmail} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 75px)', flex: 1, overflow: 'hidden', margin: 0 }}>
              <div className="drawer-body" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
                {/* Chọn Tháng */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Kỳ Báo Cáo:</label>
                  <select 
                    className="filter-input"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                    value={emailParams.month}
                    onChange={e => setEmailParams({ ...emailParams, month: parseInt(e.target.value) })}
                  >
                    {THANG_OPTIONS.map(m => (
                      <option key={m} value={m}>Tháng {m}/{selectedYear}</option>
                    ))}
                  </select>
                </div>

                {/* Box Cấu hình Người nhận */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} color="#2563eb" /> Phạm Vi Nhận Báo Cáo (Đã giới hạn):
                  </div>

                  {/* Nhóm BU3 */}
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>👥 Group Email BU3 (Nội bộ):</span>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                        {resolvedRecipients.filter(r => r.role !== 'EXTERNAL').length || 7} nhân sự BU3
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
                      Tự động gửi đến các nhân sự thuộc khối BU3 (Tour Doanh Nghiệp).
                    </div>
                  </div>

                  {/* Email ngoài */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '5px' }}>
                      ✉️ Email Ngoài Nhận Báo Cáo:
                    </label>
                    <input 
                      type="email" 
                      required
                      className="filter-input"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: 600, color: '#1e293b', background: '#ffffff' }}
                      value={emailParams.recipient_email}
                      onChange={e => setEmailParams({ ...emailParams, recipient_email: e.target.value })}
                      placeholder="huynhhieutravel@gmail.com"
                    />
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                      Mặc định gửi tới: <code style={{ color: '#2563eb', fontWeight: 700 }}>huynhhieutravel@gmail.com</code>
                    </div>
                  </div>
                </div>

                {/* Security Banner */}
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '10px 12px', marginBottom: '16px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <CheckCircle size={16} color="#059669" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ fontSize: '11.5px', color: '#065f46', lineHeight: '1.45' }}>
                    <b>Bảo mật phân quyền:</b> Báo cáo này chỉ gửi cho <b>Group BU3</b> và <b>{emailParams.recipient_email || 'huynhhieutravel@gmail.com'}</b>. Tuyệt đối không gửi sang Ban Lãnh Đạo (BOARD_DIRECTORS) hay Toàn bộ nhân viên (ALL_STAFF).
                  </div>
                </div>
              </div>

              <div className="drawer-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff', flexShrink: 0 }}>
                <button type="button" className="btn-pro-cancel" onClick={() => setIsEmailModalOpen(false)}>Hủy bỏ</button>
                <button 
                  type="submit" 
                  disabled={emailSending}
                  className="btn-pro-save" 
                  style={{ background: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={16} /> {emailSending ? 'Đang gửi...' : 'Xác nhận gửi báo cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Modal chi tiết Nhập/Sửa Báo Cáo
function ReportModal({ report, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...report });

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div 
      className="drawer-overlay" 
      onClick={onClose}
      style={{ 
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
        background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        zIndex: 10000, display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch'
      }}
    >
      <div 
        className="drawer-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          width: '850px', maxWidth: '100vw', background: '#ffffff', height: '100vh', maxHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.25)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        
        {/* Header */}
        <div className="drawer-header" style={{ padding: '1.25rem 1.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              {report.id ? `Cập nhật Dữ Liệu Tháng ${report.month}/${report.year}` : `Nhập Dữ Liệu Mới Tháng ${formData.month}/${formData.year}`}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Điền các thông số từ bảng quản trị Google Ads và Google Analytics 4 (GA4).
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 75px)', flex: 1, overflow: 'hidden', margin: 0 }}>
          <div className="drawer-body" style={{ padding: '1.5rem 1.75rem', flex: 1, overflowY: 'auto' }}>
            
            {/* NHÓM 1: Thông tin chung & Thời gian */}
            <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', marginBottom: '10px' }}>
                📌 1. Thông Tin Chung
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>NĂM</label>
                  <select 
                    value={formData.year} 
                    onChange={e => handleChange('year', parseInt(e.target.value))}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {NAM_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>THÁNG BÁO CÁO</label>
                  <select 
                    value={formData.month} 
                    onChange={e => handleChange('month', parseInt(e.target.value))}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {THANG_OPTIONS.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>TÊN CHIẾN DỊCH GOOGLE ADS</label>
                  <input 
                    type="text" 
                    value={formData.campaign_name} 
                    onChange={e => handleChange('campaign_name', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    placeholder="[ BU3 | SEARCH | Tour Doanh Nghiệp | VN ]"
                  />
                </div>
              </div>
            </div>

            {/* NHÓM 2: Chỉ số Google Ads */}
            <div style={{ marginBottom: '20px', background: '#eff6ff', padding: '14px', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '10px' }}>
                🔍 2. Chỉ Số Google Search Ads
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>CHI PHÍ ADS (VNĐ) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.spend} 
                    onChange={e => handleChange('spend', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd', fontWeight: 700, color: '#b45309' }}
                    placeholder="Ví dụ: 4380000"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>LẦN NHẤP (CLICKS) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.clicks} 
                    onChange={e => handleChange('clicks', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd', fontWeight: 700, color: '#2563eb' }}
                    placeholder="Ví dụ: 231"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>LƯỢT HIỂN THỊ (IMPRESSIONS) *</label>
                  <input 
                    type="number" 
                    required
                    value={formData.impressions} 
                    onChange={e => handleChange('impressions', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd' }}
                    placeholder="Ví dụ: 4640"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#1e3a8a', marginBottom: '4px' }}>CONVERSIONS (ADS)</label>
                  <input 
                    type="number" 
                    value={formData.conversions_ads} 
                    onChange={e => handleChange('conversions_ads', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #93c5fd' }}
                    placeholder="Người liên hệ Ads ghi nhận (0)"
                  />
                </div>
              </div>
            </div>

            {/* NHÓM 3: Chỉ số GA4 Tương tác & Chuyển đổi */}
            <div style={{ marginBottom: '20px', background: '#fdf2f8', padding: '14px', borderRadius: '10px', border: '1px solid #fbcfe8' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#db2777', textTransform: 'uppercase', marginBottom: '10px' }}>
                ⚡ 3. Phễu Tương Tác & Sự Kiện GA4 (Website)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>interest_b2b_tour (Sự kiện)</label>
                  <input 
                    type="number" 
                    value={formData.interest_b2b_tour} 
                    onChange={e => handleChange('interest_b2b_tour', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6' }}
                    placeholder="Ví dụ: 263"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>interest_b2b_tour (Users)</label>
                  <input 
                    type="number" 
                    value={formData.interest_b2b_tour_users} 
                    onChange={e => handleChange('interest_b2b_tour_users', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6' }}
                    placeholder="Ví dụ: 132"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>click_zalo (Nhấp Zalo)</label>
                  <input 
                    type="number" 
                    value={formData.click_zalo} 
                    onChange={e => handleChange('click_zalo', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6', fontWeight: 700, color: '#0284c7' }}
                    placeholder="Ví dụ: 32"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>click_phone (Nhấp Hotline)</label>
                  <input 
                    type="number" 
                    value={formData.click_phone} 
                    onChange={e => handleChange('click_phone', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6', fontWeight: 700, color: '#16a34a' }}
                    placeholder="Ví dụ: 14"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>click_consultation (Tư vấn)</label>
                  <input 
                    type="number" 
                    value={formData.click_consultation} 
                    onChange={e => handleChange('click_consultation', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6' }}
                    placeholder="Ví dụ: 7"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>click_email (Nhấp Email)</label>
                  <input 
                    type="number" 
                    value={formData.click_email} 
                    onChange={e => handleChange('click_email', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6' }}
                    placeholder="Ví dụ: 7"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>form_submit (Gửi Form)</label>
                  <input 
                    type="number" 
                    value={formData.form_submit} 
                    onChange={e => handleChange('form_submit', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6' }}
                    placeholder="Ví dụ: 246"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#9d174d', marginBottom: '4px' }}>page_view (Lượt xem trang)</label>
                  <input 
                    type="number" 
                    value={formData.page_view} 
                    onChange={e => handleChange('page_view', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #f472b6' }}
                    placeholder="Ví dụ: 23733"
                  />
                </div>
              </div>
            </div>

            {/* NHÓM 4: Kết Quả Kinh Doanh CRM BU3 */}
            <div style={{ marginBottom: '14px', background: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', marginBottom: '10px' }}>
                💼 4. Kết Quả Chốt Đoàn Doanh Nghiệp (CRM BU3)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>SỐ LEAD B2B (CRM)</label>
                  <input 
                    type="number" 
                    value={formData.crm_leads} 
                    onChange={e => handleChange('crm_leads', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #86efac' }}
                    placeholder="Ví dụ: 18"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>SỐ ĐOÀN CHỐT (WON)</label>
                  <input 
                    type="number" 
                    value={formData.crm_won} 
                    onChange={e => handleChange('crm_won', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #86efac', fontWeight: 700, color: '#15803d' }}
                    placeholder="Ví dụ: 2"
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#166534', marginBottom: '4px' }}>DOANH THU KÝ ĐOÀN (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formData.revenue_won} 
                    onChange={e => handleChange('revenue_won', e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #86efac', fontWeight: 700, color: '#059669' }}
                    placeholder="Ví dụ: 125000000"
                  />
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>GHI CHÚ / ĐÁNH GIÁ THÁNG</label>
              <textarea 
                rows="2"
                value={formData.notes} 
                onChange={e => handleChange('notes', e.target.value)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                placeholder="Nhận xét hiệu quả chiến dịch, từ khóa, kênh Zalo/hotline..."
              />
            </div>

          </div>

          {/* Footer */}
          <div className="drawer-footer" style={{ padding: '1rem 1.75rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff', flexShrink: 0 }}>
            <button type="button" className="btn-pro-cancel" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn-pro-save">Lưu dữ liệu</button>
          </div>
        </form>

      </div>
    </div>
  );
}

// Modal Cập Nhật Target KPI
function KpiModal({ kpi, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...kpi });

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div 
      className="drawer-overlay" 
      onClick={onClose}
      style={{ 
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
        background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        zIndex: 10000, display: 'flex', justifyContent: 'flex-end', alignItems: 'stretch'
      }}
    >
      <div 
        className="drawer-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          width: '560px', maxWidth: '100vw', background: '#ffffff', height: '100vh', maxHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.25)', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden'
        }}
      >
        <div className="drawer-header" style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>
              Target KPI Google Ads BU3 (Tháng {formData.month}/{formData.year})
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Thiết lập mục tiêu ngân sách, số lượng Lead và Đoàn cho BU3
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 75px)', flex: 1, overflow: 'hidden', margin: 0 }}>
          <div className="drawer-body" style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>THÁNG ÁP DỤNG</label>
              <select 
                value={formData.month} 
                onChange={e => handleChange('month', parseInt(e.target.value))}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
              >
                {THANG_OPTIONS.map(m => <option key={m} value={m}>Tháng {m}/{formData.year}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>BUDGET MỤC TIÊU (VNĐ) *</label>
                <input 
                  type="number" 
                  required
                  value={formData.budget} 
                  onChange={e => handleChange('budget', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 700 }}
                  placeholder="5000000"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>MỤC TIÊU LEAD B2B</label>
                <input 
                  type="number" 
                  value={formData.target_leads} 
                  onChange={e => handleChange('target_leads', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  placeholder="20"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>TARGET ĐOÀN WON</label>
                <input 
                  type="number" 
                  value={formData.target_groups} 
                  onChange={e => handleChange('target_groups', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  placeholder="2"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>TARGET CPA TƯƠNG TÁC (VNĐ)</label>
                <input 
                  type="number" 
                  value={formData.target_cpa} 
                  onChange={e => handleChange('target_cpa', e.target.value)}
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  placeholder="80000"
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>NGƯỜI PHỤ TRÁCH (PIC)</label>
              <input 
                type="text" 
                value={formData.pic_name} 
                onChange={e => handleChange('pic_name', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                placeholder="Leader BU3"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>GHI CHÚ MỤC TIÊU</label>
              <textarea 
                rows="2"
                value={formData.notes} 
                onChange={e => handleChange('notes', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                placeholder="Chiến lược tháng..."
              />
            </div>

          </div>
          <div className="drawer-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', background: '#ffffff', flexShrink: 0 }}>
            <button type="button" className="btn-pro-cancel" onClick={onClose}>Hủy bỏ</button>
            <button type="submit" className="btn-pro-save">Lưu Target</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoogleAdsTab;
