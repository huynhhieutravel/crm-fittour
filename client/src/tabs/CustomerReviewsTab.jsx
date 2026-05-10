import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import ManualReviewModal from '../components/modals/ManualReviewModal';
import { Star, CheckCircle, XCircle, Clock, Image, Facebook, Globe, Plus, Trash2, Edit2, CalendarDays, Award, X, Activity, QrCode, ExternalLink, ArrowLeft } from 'lucide-react';
import { swalConfirm } from '../utils/swalHelpers';
import { useLocation } from 'react-router-dom';
import '../styles/customerReviews.css';

const CustomerReviewsTab = ({ isHDVView = false }) => {
  const location = useLocation();
  const initialGuideName = location.state?.guideName || '';

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buList, setBuList] = useState([]);
  const [stats, setStats] = useState({ guideStats: [], buStats: [], bvGuideStats: [], bvBuStats: [] });
  const [isBangVangOpen, setIsBangVangOpen] = useState(false);
  const [bvType, setBvType] = useState('BU'); // 'BU' or 'HDV'
  const [bvMonth, setBvMonth] = useState('Tất cả');
  const [bvYear, setBvYear] = useState(new Date().getFullYear().toString());
  const [bvBU, setBvBU] = useState('Tất cả');
  const [loadingBv, setLoadingBv] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    source: '',
    bu_id: '',
    status: '',
    search: initialGuideName
  });
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const currentQuarter = Math.floor(currentMonth / 3) + 1;
  const [dateFilter, setDateFilter] = useState('all'); // all, month, month-select, quarter, year, custom
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedQuarter, setSelectedQuarter] = useState(currentQuarter);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [customRange, setCustomRange] = useState({ startDate: '', endDate: '' });
  
  const [searchInput, setSearchInput] = useState(initialGuideName);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const canApprove = ['admin', 'manager', 'accountant'].includes(currentUser.role);

  useEffect(() => {
    fetchBUs();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [filters, pagination.page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);
  const getBounds = () => {
      const now = new Date();
      let start = new Date();
      let end = new Date();

      switch (dateFilter) {
        case "month":
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
          break;
        case "month-select":
          start = new Date(selectedYear, selectedMonth, 1);
          end = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);
          break;
        case "quarter":
          start = new Date(selectedYear, (selectedQuarter - 1) * 3, 1);
          end = new Date(selectedYear, (selectedQuarter - 1) * 3 + 3, 0, 23, 59, 59, 999);
          break;
        case "year":
          start = new Date(selectedYear, 0, 1);
          end = new Date(selectedYear, 12, 0, 23, 59, 59, 999);
          break;
        case "all":
          return { startDate: null, endDate: null };
        case "custom":
          return {
             startDate: customRange.startDate ? new Date(customRange.startDate + 'T00:00:00') : null,
             endDate: customRange.endDate ? new Date(customRange.endDate + 'T23:59:59') : null
          };
        default:
          return { startDate: null, endDate: null };
      }
      return { startDate: start, endDate: end };
  };

  const formatDateString = (date) => date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [filters, pagination.page, pagination.limit, dateFilter, selectedMonth, selectedQuarter, selectedYear, customRange]);

  const fetchStats = async () => {
    try {
      const bounds = getBounds();
      let query = '';
      if (bounds.startDate && bounds.endDate) {
        query = `?start_date=${formatDateString(bounds.startDate)}&end_date=${formatDateString(bounds.endDate)}`;
      }
      const res = await axios.get('/api/customer-reviews/stats' + query, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(prev => ({ ...prev, buStats: res.data.buStats }));
    } catch (err) {
      console.error('Lỗi lấy thống kê:', err);
    }
  };


  const fetchBangVangStats = async () => {
    setLoadingBv(true);
    try {
      let url = `/api/customer-reviews/stats?month=${bvMonth}&year=${bvYear}&bu_id=${bvBU}`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(prev => ({ ...prev, bvGuideStats: res.data.guideStats, bvBuStats: res.data.buStats }));
    } catch (err) {
      console.error('Lỗi lấy Bảng Vàng:', err);
    } finally {
      setLoadingBv(false);
    }
  };

  useEffect(() => {
    if (isBangVangOpen) {
      fetchBangVangStats();
    }
  }, [bvMonth, bvYear, bvBU, isBangVangOpen]);

  const fetchBUs = async () => {
    try {
      const res = await axios.get('/api/business-units', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBuList(res.data);
    } catch (error) {
      console.error('Error fetching BUs', error);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { source, bu_id, status, search } = filters;
      const { page, limit } = pagination;
      const bounds = getBounds();
      
      let url = `/api/customer-reviews?page=${page}&limit=${limit}`;
      if (source) url += `&source=${source}`;
      if (bu_id) url += `&bu_id=${bu_id}`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${search}`;
      if (bounds.startDate) url += `&start_date=${formatDateString(bounds.startDate)}`;
      if (bounds.endDate) url += `&end_date=${formatDateString(bounds.endDate)}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setReviews(res.data.data);
      setPagination(prev => ({
        ...prev,
        total: res.data.pagination.total,
        pages: res.data.pagination.pages
      }));
    } catch (error) {
      toast.error('Lỗi khi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    const actionText = status === 'approved' ? 'DUYỆT' : (status === 'rejected' ? 'TỪ CHỐI' : 'CHUYỂN VỀ CHỜ DUYỆT');
    const titleText = status === 'approved' ? 'Duyệt đánh giá' : (status === 'rejected' ? 'Từ chối đánh giá' : 'Chờ duyệt');
    const iconType = status === 'approved' ? 'question' : 'warning';
    
    if (!await swalConfirm(`Bạn có chắc chắn muốn ${actionText} đánh giá này?`, { 
      title: titleText, 
      icon: iconType 
    })) return;
    
    try {
      const res = await axios.put(`/api/customer-reviews/${id}/approve`, { status }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi thao tác');
    }
  };

  const handleDelete = async (id) => {
    if (!await swalConfirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này? Hành động này không thể hoàn tác.', { title: 'Xác nhận xóa', icon: 'error' })) return;
    
    try {
      const res = await axios.delete(`/api/customer-reviews/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa');
    }
  };

  const handleUpdateBU = async (id, bu_id) => {
    try {
      const res = await axios.put(`/api/customer-reviews/${id}/bu`, { bu_id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchReviews();
        fetchStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi cập nhật BU');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setIsModalOpen(true);
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex' }}>
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={16} color={i < rating ? '#facc15' : '#d1d5db'} fill={i < rating ? '#facc15' : 'transparent'} style={{ marginRight: 2 }} />
        ))}
      </div>
    );
  };

  const getSourceIcon = (source) => {
    if (source === 'facebook') return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, border: '1px solid #bae6fd' }}>FACEBOOK</span>;
    if (source === 'google') return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, border: '1px solid #fecaca' }}>GOOGLE</span>;
    if (source === 'thread') return <span style={{ background: '#f1f5f9', color: '#0f172a', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, border: '1px solid #e2e8f0' }}>THREADS</span>;
    return <span style={{ background: '#f8fafc', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, border: '1px solid #e2e8f0' }}>KHÁC</span>;
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return <span className="cr-badge-approved"><CheckCircle style={{ width: 16, height: 16, marginRight: 4 }} /> Đã duyệt</span>;
    if (status === 'rejected') return <span className="cr-badge-rejected"><XCircle style={{ width: 16, height: 16, marginRight: 4 }} /> Từ chối</span>;
    return <span className="cr-badge-pending"><Clock style={{ width: 16, height: 16, marginRight: 4 }} /> Chờ duyệt</span>;
  };

  return (
    <div className="cr-container">
      <div className="cr-header">
        <div>
          <h1 className="cr-title">Quản lý Đánh Giá (Hoa Hồng HDV)</h1>
          <p className="cr-subtitle">Danh sách đánh giá từ khách hàng để xét duyệt hoa hồng cho Hướng dẫn viên.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isHDVView && currentUser && currentUser.role && (
            <button
              onClick={() => window.location.href = '/guides/reviews'}
              style={{ background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
            >
              <ArrowLeft size={14} /> Về ERP Quản lý
            </button>
          )}
          <button
            onClick={() => setIsQrModalOpen(true)}
            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            <QrCode size={14} /> QR Đánh Giá
          </button>
          <button
            onClick={() => setIsBangVangOpen(true)}
            style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            <Award size={14} /> Bảng Vàng Đánh Giá
          </button>
          {!isHDVView && (
            <button
              onClick={() => { setEditingReview(null); setIsModalOpen(true); }}
              className="cr-btn-primary"
            >
              <Plus style={{ width: 20, height: 20, marginRight: 8 }} />
              Thêm Đánh Giá Thủ Công
            </button>
          )}
        </div>
      </div>

      {/* Stats Board */}
      {!isHDVView && (
        <div className="cr-grid-2" style={{ gridTemplateColumns: '1fr' }}>
          <div className="cr-card" style={{ maxWidth: '400px' }}>
            <h3 className="cr-card-title">Top BU theo Rating</h3>
            <div style={{ maxWidth: '400px' }}>
              {stats.buStats.slice(0, 5).map((b, i) => (
                <div key={i} className="cr-stat-item">
                  <span className="cr-stat-name">{b.bu_name}</span>
                  <span className="cr-stat-score">{b.avg_rating} <Star style={{ width: 16, height: 16, marginLeft: 4, fill: '#ca8a04' }} /> ({b.total_reviews})</span>
                </div>
              ))}
              {stats.buStats.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8' }}>Chưa có dữ liệu</p>}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Form Row - Executive UI */}
      <div className="executive-filter-panel" style={{ padding: '0', marginBottom: '20px', width: '100%' }}>
        <div className="filter-scroll-container">
          <div className="horizontal-filter-row" style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', alignItems: 'stretch' }}>
            
            {/* Row 1: Search & Date Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'nowrap', width: '100%', justifyContent: 'flex-start' }}>
              <div style={{ minWidth: '220px', flexShrink: 0 }}>
                <input type="text" placeholder="Tìm kiếm: Tên khách, nội dung..." value={searchInput} onChange={e => setSearchInput(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontSize: '13px' }} />
              </div>

              <div className="segmented-control glass text-white" style={{ flexShrink: 0 }}>
                <button
                  onClick={() => setDateFilter('all')}
                  className={`segment-btn ${dateFilter === 'all' ? "active" : ""}`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setDateFilter('month')}
                  className={`segment-btn ${dateFilter === 'month' ? "active" : ""}`}
                >
                  Tháng này
                </button>
              </div>

              <div className="filter-divider" style={{ minHeight: '30px', borderLeft: '1px solid #e2e8f0', margin: '0' }}></div>

              <div className="segmented-control glass" style={{ flexShrink: 0 }}>
                {["month-select", "quarter", "year", "custom"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setDateFilter(f)}
                    className={`segment-btn ${dateFilter === f ? "active" : ""}`}
                  >
                    {f === "month-select" ? "Tháng" : f === "quarter" ? "Quý" : f === "year" ? "Năm" : "Tùy chọn"}
                  </button>
                ))}
              </div>

              {dateFilter === "month-select" && (
                <div className="executive-select-wrapper">
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                    {["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"].map((m, i) => (
                      <option key={i} value={i}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              {dateFilter === "quarter" && (
                <div className="executive-select-wrapper">
                  <select value={selectedQuarter} onChange={(e) => setSelectedQuarter(parseInt(e.target.value))}>
                    {[1, 2, 3, 4].map((q) => <option key={q} value={q}>Quý {q}</option>)}
                  </select>
                </div>
              )}

              {(["month-select", "quarter", "year"].includes(dateFilter)) && (
                <div className="executive-select-wrapper">
                  <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                    {[2023, 2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>Năm {y}</option>)}
                  </select>
                </div>
              )}

              {dateFilter === "custom" && (
                <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: '12px' }}>
                  <div className="date-input-group premium">
                    <CalendarDays size={13} style={{ color: '#6366f1' }} />
                    <input type="date" value={customRange.startDate} onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value })} />
                  </div>
                  <span style={{ color: '#cbd5e1', fontWeight: 'bold' }}>→</span>
                  <div className="date-input-group premium">
                    <CalendarDays size={13} style={{ color: '#6366f1' }} />
                    <input type="date" value={customRange.endDate} onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ width: '100%', height: '1px', background: '#e2e8f0' }}></div>

            {/* Row 2: Status, Source, BU Pills */}
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
              <div style={{ minWidth: '150px' }}>
                 <select value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: 'white', outline: 'none', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                    <option value="">-- Trạng thái duyệt --</option>
                    <option value="pending">Chờ duyệt</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Từ chối</option>
                 </select>
              </div>

              <div style={{ minWidth: '150px' }}>
                 <select value={filters.source} onChange={e => setFilters({...filters, source: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: 'white', outline: 'none', fontSize: '13px', fontWeight: '500', color: '#1e293b' }}>
                    <option value="">-- Nguồn --</option>
                    <option value="facebook">Facebook</option>
                    <option value="google">Google</option>
                    <option value="thread">Threads</option>
                    <option value="khác">Khác</option>
                 </select>
              </div>
              
              <div className="filter-divider" style={{ minHeight: '30px', borderLeft: '1px solid #e2e8f0', margin: '0' }}></div>

              {/* BU Filter: Pill Action Bar */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                 <button
                    onClick={() => setFilters({...filters, bu_id: ''})}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textTransform: 'uppercase',
                      padding: '6px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', border: '1px solid #e2e8f0',
                      backgroundColor: filters.bu_id === '' ? '#3b82f6' : 'white', color: filters.bu_id === '' ? 'white' : '#64748b',
                      boxShadow: filters.bu_id === '' ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                 >
                    Tất cả BU
                 </button>
                 <button
                    onClick={() => setFilters({...filters, bu_id: 'null'})}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textTransform: 'uppercase',
                      padding: '6px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', border: '1px solid #e2e8f0',
                      backgroundColor: filters.bu_id === 'null' ? '#f59e0b' : 'white', color: filters.bu_id === 'null' ? 'white' : '#64748b',
                      boxShadow: filters.bu_id === 'null' ? '0 2px 4px rgba(245, 158, 11, 0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                 >
                    Chưa có BU
                 </button>
                 {buList.map(bu => {
                    const isActive = filters.bu_id === bu.id;
                    return (
                       <button
                          key={bu.id}
                          onClick={() => setFilters({...filters, bu_id: bu.id})}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', textTransform: 'uppercase',
                            padding: '6px 16px', borderRadius: '4px', fontWeight: '700', fontSize: '12px', whiteSpace: 'nowrap', border: '1px solid #e2e8f0',
                            backgroundColor: isActive ? '#3b82f6' : 'white', color: isActive ? 'white' : '#64748b',
                            boxShadow: isActive ? '0 2px 4px rgba(59, 130, 246, 0.3)' : 'none',
                            transition: 'all 0.2s'
                          }}
                       >
                          {bu.label}
                       </button>
                    );
                 })}
              </div>
            </div>

          </div>
        </div>
      </div>



      {/* Table */}
      <div className="cr-table-wrapper">
        <table className="cr-table">
          <thead>
            <tr>
              <th>KHÁCH HÀNG & NỘI DUNG</th>
              <th>NGUỒN</th>
              <th>BU & HDV</th>
              <th>BẰNG CHỨNG</th>
              <th>TRẠNG THÁI</th>
              {!isHDVView && <th style={{ textAlign: 'right' }}>THAO TÁC</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Đang tải dữ liệu...</td></tr>
            ) : reviews.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Không có đánh giá nào phù hợp.</td></tr>
            ) : reviews.map(review => (
              <tr key={review.id}>
                <td>
                  <div className="cr-reviewer-name">{review.reviewer_name}</div>
                  <div className="cr-rating-stars">{renderStars(review.rating)}</div>
                  <div className="cr-comment" title={review.comment} style={{ fontSize: '13px', lineHeight: '1.4', marginTop: '4px' }}>{review.comment}</div>
                  <div className="cr-date" style={{ marginTop: '6px' }}>Ngày đánh giá: {review.review_date_str ? format(new Date(review.review_date_str), 'dd/MM/yyyy') : (review.review_date ? format(new Date(review.review_date), 'dd/MM/yyyy') : 'N/A')}</div>
                </td>
                <td style={{ verticalAlign: 'top', paddingTop: '16px' }}>
                  <div className="cr-source-icon">{getSourceIcon(review.source)}</div>
                </td>
                <td>
                  {!isHDVView ? (
                    <select 
                      value={review.bu_id || ''} 
                      onChange={(e) => handleUpdateBU(review.id, e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', cursor: 'pointer', maxWidth: '120px', marginBottom: '4px' }}
                    >
                      <option value="">Không có BU</option>
                      {buList.map(bu => <option key={bu.id} value={bu.id}>{bu.label}</option>)}
                    </select>
                  ) : (
                    <div style={{ fontSize: 13, fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {buList.find(b => b.id === review.bu_id)?.label || 'Không có BU'}
                    </div>
                  )}
                  <div style={{ fontSize: 13, color: '#64748b' }}>HDV: {review.guide_name || 'N/A'}</div>
                </td>
                <td style={{ whiteSpace: 'nowrap', verticalAlign: 'top', paddingTop: '16px' }}>
                  {review.proof_url ? (
                    <a href={review.proof_url} target="_blank" rel="noreferrer" className="cr-link" style={{ display: 'inline-flex', alignItems: 'center' }}>
                      <Image style={{ width: 16, height: 16, marginRight: 4 }} />
                      Xem ảnh
                    </a>
                  ) : (
                    <span style={{ fontSize: 13, color: '#94a3b8', fontStyle: 'italic' }}>Không có</span>
                  )}
                </td>
                <td style={{ whiteSpace: 'nowrap', verticalAlign: 'top', paddingTop: '16px' }}>
                  {getStatusBadge(review.approval_status)}
                  {review.approved_by_name && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                      Bởi: {review.approved_by_name}
                    </div>
                  )}
                </td>
                {!isHDVView && (
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {canApprove && (
                        <select 
                          value={review.approval_status}
                          onChange={(e) => handleApprove(review.id, e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: review.approval_status === 'approved' ? '#dcfce7' : review.approval_status === 'rejected' ? '#fee2e2' : '#fef9c3', outline: 'none', cursor: 'pointer', width: '110px' }}
                        >
                          <option value="pending">Chờ duyệt</option>
                          <option value="approved">Đã duyệt</option>
                          <option value="rejected">Từ chối</option>
                        </select>
                      )}
                      {currentUser.role === 'admin' && (
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                          <button onClick={() => handleEdit(review)} style={{ border: '1px solid #e2e8f0', background: 'white', color: '#3b82f6', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }} title="Sửa đánh giá">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(review.id)} style={{ border: '1px solid #e2e8f0', background: 'white', color: '#ef4444', cursor: 'pointer', padding: '4px 8px', borderRadius: '4px' }} title="Xóa vĩnh viễn">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="cr-pagination">
            <span style={{ fontSize: 14, color: '#475569' }}>Hiển thị {reviews.length} / {pagination.total} kết quả</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button 
                disabled={pagination.page === 1}
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                className="cr-btn-outline"
                style={{ padding: '6px 12px', fontSize: 13 }}
              >Trước</button>
              <button 
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                className="cr-btn-outline"
                style={{ padding: '6px 12px', fontSize: 13 }}
              >Sau</button>
            </div>
          </div>
        )}
      </div>

      <ManualReviewModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchReviews}
        initialData={editingReview}
      />
      {/* Bảng Vàng Modal */}
      {isBangVangOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="animate-slide-up" style={{ background: 'white', borderRadius: '16px', width: '95%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
            
            <div style={{ padding: '20px 25px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: '16px 16px 0 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award size={22} color="#f59e0b" />
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '18px', fontWeight: 800 }}>
                  Bảng Vàng Đánh Giá (Top Rating)
                </h3>
              </div>
              <button onClick={() => setIsBangVangOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px' }}>
                <X size={22} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '4px', whiteSpace: 'nowrap' }}>THÁNG:</div>
                    {['Tất cả', '5', '6', '7', '8', '9', '10', '11', '12'].map(m => (
                      <button key={m} onClick={() => setBvMonth(m)}
                        style={{
                          padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          background: bvMonth === m ? '#f59e0b' : '#f1f5f9', color: bvMonth === m ? 'white' : '#64748b',
                        }}>{m === 'Tất cả' ? m : `Tháng ${m}`}</button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '4px', whiteSpace: 'nowrap' }}>NĂM:</div>
                    {['Tất cả', '2026'].map(y => (
                      <button key={y} onClick={() => setBvYear(y)}
                        style={{
                          padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          background: bvYear === y ? '#f59e0b' : '#f1f5f9', color: bvYear === y ? 'white' : '#64748b',
                        }}>{y}</button>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginTop: '4px' }}>
                    <button onClick={() => setBvType('BU')} style={{ padding: '8px 16px', border: 'none', background: 'none', fontSize: '14px', fontWeight: 700, color: bvType === 'BU' ? '#f59e0b' : '#64748b', borderBottom: bvType === 'BU' ? '2px solid #f59e0b' : '2px solid transparent', cursor: 'pointer' }}>
                      Bảng Xếp Hạng BU
                    </button>
                    <button onClick={() => setBvType('HDV')} style={{ padding: '8px 16px', border: 'none', background: 'none', fontSize: '14px', fontWeight: 700, color: bvType === 'HDV' ? '#f59e0b' : '#64748b', borderBottom: bvType === 'HDV' ? '2px solid #f59e0b' : '2px solid transparent', cursor: 'pointer' }}>
                      Bảng Xếp Hạng HDV
                    </button>
                  </div>

                  {bvType === 'HDV' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginTop: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginRight: '4px', whiteSpace: 'nowrap' }}>TEAM:</div>
                    <button onClick={() => setBvBU('Tất cả')}
                        style={{
                          padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          background: bvBU === 'Tất cả' ? '#f59e0b' : '#f1f5f9', color: bvBU === 'Tất cả' ? 'white' : '#64748b',
                        }}>Tất cả BU</button>
                    <button onClick={() => setBvBU('null')}
                        style={{
                          padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          background: bvBU === 'null' ? '#f59e0b' : '#f1f5f9', color: bvBU === 'null' ? 'white' : '#64748b',
                        }}>Chưa xếp hạng</button>
                    {buList.map(bu => (
                      <button key={bu.id} onClick={() => setBvBU(bu.id)}
                        style={{
                          padding: '4px 12px', borderRadius: '16px', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          background: bvBU === bu.id ? '#f59e0b' : '#f1f5f9', color: bvBU === bu.id ? 'white' : '#64748b',
                        }}>{bu.label}</button>
                    ))}
                  </div>
                  )}
                </div>

                {loadingBv ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}><Activity size={32} color="#f59e0b" className="spin" /></div>
                ) : (
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', color: '#64748b', fontWeight: 700, borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '12px 16px', width: '50px', textAlign: 'center' }}>#</th>
                          <th style={{ padding: '12px 16px' }}>{bvType === 'BU' ? 'TÊN BU (TEAM)' : 'HƯỚNG DẪN VIÊN'}</th>
                          <th style={{ padding: '12px 16px', textAlign: 'center' }}>SỐ LƯỢNG ĐÁNH GIÁ</th>
                          <th style={{ padding: '12px 16px', textAlign: 'right' }}>ĐIỂM TRUNG BÌNH</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(bvType === 'BU' ? (stats.bvBuStats || []) : (stats.bvGuideStats || [])).length === 0 ? (
                          <tr><td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>Chưa có dữ liệu xếp hạng</td></tr>
                        ) : (bvType === 'BU' ? (stats.bvBuStats || []) : (stats.bvGuideStats || [])).map((s, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              {idx === 0 ? <Award size={20} color="#ca8a04" /> : idx === 1 ? <Award size={18} color="#94a3b8" /> : idx === 2 ? <Award size={18} color="#b45309" /> : <span style={{ fontWeight: 600, color: '#64748b' }}>{idx + 1}</span>}
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>{bvType === 'BU' ? s.bu_name : s.guide_name}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, color: '#22c55e' }}>{s.total_reviews}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#f59e0b' }}>{s.avg_rating} <Star size={12} fill="#f59e0b" style={{ display: 'inline', verticalAlign: 'middle', marginBottom: '2px' }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* QR Code Modal */}
      {isQrModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100001, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
          <div className="animate-slide-up" style={{ background: 'white', borderRadius: '16px', width: '95%', maxWidth: '400px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
            
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={20} color="#3b82f6" />
                <h3 style={{ margin: 0, color: '#1e293b', fontSize: '16px', fontWeight: 700 }}>
                  QR Code Đánh Giá Maps
                </h3>
              </div>
              <button onClick={() => setIsQrModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={20} color="#64748b" />
              </button>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <img src="/images/qr-review.jpg" alt="QR Code" style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px' }} />
              
              <div style={{ textAlign: 'center', width: '100%' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#475569', fontWeight: 500 }}>Link Đánh Giá Google Maps:</p>
                <div style={{ background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a href="https://g.page/r/CWpAMNNN_-VpEBM/review" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#2563eb', fontWeight: 600, fontSize: '14px', textDecoration: 'none', wordBreak: 'break-all' }}>
                    <ExternalLink size={16} style={{ flexShrink: 0 }} /> https://g.page/r/CWpAMNNN_-VpEBM/review
                  </a>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("https://g.page/r/CWpAMNNN_-VpEBM/review");
                      toast.success("Đã copy link!");
                    }}
                    style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', marginTop: '4px', display: 'inline-block' }}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        /* Fixed Single-Row Filter Panel */
        .executive-filter-panel {
          background: #ffffff;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
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
          width: 100%;
        }

        .segmented-control.glass {
          display: flex;
          background: #f8fafc;
          padding: 5px;
          border-radius: 8px;
          border: 1px solid #f1f5f9;
          flex-shrink: 0;
          gap: 4px;
        }
        .segment-btn {
          padding: 7px 15px;
          font-size: 11px;
          font-weight: 800;
          color: #64748b;
          border-radius: 6px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
        }
        .segment-btn:hover {
          color: #6366f1;
        }
        .segment-btn.active {
          background: #ffffff;
          color: #6366f1;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .filter-divider {
          width: 1px;
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
          border-radius: 8px;
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
          border-radius: 8px;
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
      `}</style>
    </div>
  );
};

export default CustomerReviewsTab;
