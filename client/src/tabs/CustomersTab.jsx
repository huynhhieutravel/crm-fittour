import React, { useState, useEffect } from 'react';
import { 
  Search, UserPlus, Edit3, Trash2, Eye, Filter, MessageSquareText, 
  BarChart3, Repeat, TrendingUp, TrendingDown, AlertTriangle, ArrowUpRight, 
  Calendar as CalendarIcon, List as ListIcon, ShieldAlert, Sparkles, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';
import CustomerProfileSlider from '../components/CustomerProfileSlider';
import CustomerCalendarView from '../components/CustomerCalendarView';
import CustomerDuplicateManager from '../components/CustomerDuplicateManager';
import { canEdit, canDelete } from '../utils/permissions';

const CustomersTab = ({ 
  currentUser,
  customers, 
  customerFilters, 
  setCustomerFilters, 
  setShowAddCustomerModal, 
  setEditingCustomer,
  handleDeleteCustomer,
  users = [],
  customerActiveTab = 'list',
  setCustomerActiveTab
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerFull, setSelectedCustomerFull] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);

  const [localFilters, setLocalFilters] = useState({ segment: '', minSpent: '', source: '', assignedTo: '' });
  const [quickStats, setQuickStats] = useState(null);
  const [quickStatsLoading, setQuickStatsLoading] = useState(false);

  useEffect(() => {
    const fetchQuickStats = async () => {
      setQuickStatsLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/customers/analytics/overview?period=month', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuickStats(res.data);
      } catch (e) {
        console.error('Error fetching quick customer stats:', e);
      } finally {
        setQuickStatsLoading(false);
      }
    };
    fetchQuickStats();
  }, []);

  React.useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('search');
    if (s && !customerFilters?.search) {
      setCustomerFilters(prev => ({ ...prev, search: s }));
    }
    const viewId = new URLSearchParams(window.location.search).get('view');
    if (viewId) {
      handleViewProfile(viewId);
    }
    const editId = new URLSearchParams(window.location.search).get('edit');
    if (editId) {
      setEditingCustomer(Number(editId));
    }
  }, []);

  const handleViewProfile = async (id) => {
    try {
      const res = await axios.get(`/api/customers/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedCustomerFull(res.data);
      setSelectedCustomerId(id);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải thông tin khách hàng');
    }
  };

  const handleAddNote = async (customerId, content) => {
    try {
      const res = await axios.post(`/api/customers/${customerId}/notes`, 
        { content },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      const newNote = res.data;
      setSelectedCustomerFull(prev => ({
        ...prev,
        interaction_history: [newNote, ...(prev.interaction_history || [])]
      }));
    } catch (err) {
      console.error(err);
      alert('Lỗi thêm ghi chú');
    }
  };

  const filteredCustomers = customers.filter(c => 
    ((c.name || '').toLowerCase().includes((customerFilters?.search || '').toLowerCase()) ||
     (c.phone || '').includes(customerFilters?.search || '')) &&
    (localFilters.segment ? c.customer_segment === localFilters.segment : true) &&
    (localFilters.minSpent ? (c.total_spent || 0) >= parseInt(localFilters.minSpent) : true) &&
    (localFilters.source ? (c.lead_source || '').toLowerCase() === localFilters.source.toLowerCase() : true) &&
    (localFilters.assignedTo ? (localFilters.assignedTo === 'NO_STAFF' ? !c.assigned_to : c.assigned_to === parseInt(localFilters.assignedTo)) : true)
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [customerFilters, localFilters]);

  const actualItemsPerPage = itemsPerPage === 'all' ? Math.max(1, filteredCustomers.length) : itemsPerPage;
  const totalPages = Math.ceil(filteredCustomers.length / actualItemsPerPage) || 1;
  const currentCustomers = filteredCustomers.slice((currentPage - 1) * actualItemsPerPage, currentPage * actualItemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const kpi = quickStats?.kpi || {};
  const integrity = quickStats?.dataIntegritySummary || {};

  return (
    <>
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Top Navigation Subtabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', background: '#ffffff', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', gap: '4px' }}>
            <button
              onClick={() => setCustomerActiveTab && setCustomerActiveTab('list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: customerActiveTab === 'list' ? 700 : 500,
                background: customerActiveTab === 'list' ? '#0284c7' : 'transparent',
                color: customerActiveTab === 'list' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <ListIcon size={16} /> Danh Sách Khách Hàng
            </button>

            <button
              onClick={() => setCustomerActiveTab && setCustomerActiveTab('analytics')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: customerActiveTab === 'analytics' ? 700 : 500,
                background: customerActiveTab === 'analytics' ? '#0284c7' : 'transparent',
                color: customerActiveTab === 'analytics' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <BarChart3 size={16} /> Dashboard & Kiểm Toán
              {integrity?.totalIssues > 0 && (
                <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                  {integrity.totalIssues}
                </span>
              )}
            </button>

            <button
              onClick={() => setCustomerActiveTab && setCustomerActiveTab('calendar')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: customerActiveTab === 'calendar' ? 700 : 500,
                background: customerActiveTab === 'calendar' ? '#0284c7' : 'transparent',
                color: customerActiveTab === 'calendar' ? '#ffffff' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <CalendarIcon size={16} /> Lịch Chăm Sóc & Sinh Nhật
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="btn-pro-save" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }} 
              onClick={() => setShowAddCustomerModal(true)}
            >
              <UserPlus size={16} strokeWidth={3} /> THÊM KHÁCH HÀNG
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Banner (Hiển thị tóm tắt Tháng Này) */}
        {customerActiveTab === 'list' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '1rem'
          }}>
            {/* KPI 1 */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #bbf7d0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Khách Mới Tháng Này</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{kpi.newCustomersCount ?? '...'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (kpi.momGrowth || 0) >= 0 ? '#16a34a' : '#ef4444', display: 'flex', alignItems: 'center' }}>
                    {(kpi.momGrowth || 0) >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    {(kpi.momGrowth || 0) > 0 ? `+${kpi.momGrowth}%` : `${kpi.momGrowth || 0}%`}
                  </span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#dcfce7', color: '#16a34a' }}>
                <UserPlus size={20} />
              </div>
            </div>

            {/* KPI 2 */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #bfdbfe', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>Khách Cũ Mua Tour Lại</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{kpi.returningCustomersCount ?? '...'}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>({kpi.repeatBookingsCount || 0} booking)</span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#dbeafe', color: '#2563eb' }}>
                <Repeat size={20} />
              </div>
            </div>

            {/* KPI 3 */}
            <div style={{ background: '#ffffff', padding: '1rem 1.25rem', borderRadius: '12px', border: '1px solid #fde68a', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>Tỷ Lệ Khách Quay Lại</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a' }}>{kpi.repeatRate ?? '...'}%</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Retention</span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: '#fef3c7', color: '#d97706' }}>
                <Sparkles size={20} />
              </div>
            </div>

            {/* KPI 4 */}
            <div 
              onClick={() => setCustomerActiveTab && setCustomerActiveTab('analytics')}
              style={{ 
                background: (integrity.totalIssues || 0) > 0 ? '#fff1f2' : '#ffffff', 
                padding: '1rem 1.25rem', 
                borderRadius: '12px', 
                border: (integrity.totalIssues || 0) > 0 ? '1px solid #fecdd3' : '1px solid #e2e8f0', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: (integrity.totalIssues || 0) > 0 ? '#be123c' : '#64748b', textTransform: 'uppercase' }}>Cảnh Báo Dữ Liệu</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: (integrity.totalIssues || 0) > 0 ? '#e11d48' : '#0f172a' }}>{integrity.totalIssues ?? 0}</span>
                  <span style={{ fontSize: '0.75rem', color: '#e11d48', fontWeight: 700, display: 'flex', alignItems: 'center' }}>
                    Chi tiết <ArrowUpRight size={13} />
                  </span>
                </div>
              </div>
              <div style={{ padding: '8px', borderRadius: '10px', background: (integrity.totalIssues || 0) > 0 ? '#ffe4e6' : '#f1f5f9', color: (integrity.totalIssues || 0) > 0 ? '#e11d48' : '#64748b' }}>
                <ShieldAlert size={20} />
              </div>
            </div>
          </div>
        )}

        <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={18} className="text-secondary" /> BỘ LỌC TÌM KIẾM
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {Object.values(localFilters).some(v => v !== '') || customerFilters?.search ? (
              <button 
                className="btn btn-ghost"
                style={{ padding: '0.5rem 1rem', color: '#ef4444' }}
                onClick={() => {
                  setLocalFilters({ segment: '', minSpent: '', source: '', assignedTo: '' });
                  setCustomerFilters({ search: '' });
                }}
              >
                Xóa lọc
              </button>
            ) : null}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="filter-group" style={{ flex: 1, minWidth: '250px', margin: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>TỪ KHÓA TÌM KIẾM</label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
              <input 
                className="filter-input" 
                style={{ paddingLeft: '36px', height: '42px', borderRadius: '8px' }} 
                placeholder="Nhập tên, SĐT, Email..." 
                value={customerFilters?.search || ''} 
                onChange={e => setCustomerFilters({...customerFilters, search: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="filter-group" style={{ flex: '0 0 auto', width: '150px', margin: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>LỌC THEO HẠNG KHÁCH</label>
            <select 
              className="filter-select"
              style={{ height: '42px', borderRadius: '8px' }}
              value={localFilters.segment}
              onChange={e => setLocalFilters({...localFilters, segment: e.target.value})}
            >
              <option value="">Tất cả</option>
              <option value="VIP 1">⭐⭐⭐ VIP 1</option>
              <option value="VIP 2">⭐⭐ VIP 2</option>
              <option value="VIP 3">⭐ VIP 3</option>
              <option value="Repeat Customer">🔄 Repeat Customer</option>
              <option value="New Customer">🆕 New Customer</option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: 1, minWidth: '150px', margin: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>TỔNG CHI TIÊU</label>
            <select 
              className="filter-select"
              style={{ height: '42px', borderRadius: '8px' }}
              value={localFilters.minSpent}
              onChange={e => setLocalFilters({...localFilters, minSpent: e.target.value})}
            >
              <option value="">Mọi mức chi</option>
              <option value="10000000">&gt; 10.000.000đ</option>
              <option value="50000000">&gt; 50.000.000đ</option>
              <option value="100000000">&gt; 100.000.000đ</option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: '0 0 auto', width: '150px', margin: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>NGUỒN KHÁCH</label>
            <select 
              className="filter-select"
              style={{ height: '42px', borderRadius: '8px' }}
              value={localFilters.source}
              onChange={e => setLocalFilters({...localFilters, source: e.target.value})}
            >
              <option value="">Tất cả nguồn</option>
              <option value="facebook">Facebook Ads</option>
              <option value="zalo">Zalo OA</option>
              <option value="website">Website</option>
              <option value="referral">Khách quen giới thiệu</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: 1, minWidth: '180px', margin: 0 }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>NHÂN VIÊN CHĂM SÓC</label>
            <select 
              className="filter-select"
              style={{ height: '42px', borderRadius: '8px' }}
              value={localFilters.assignedTo}
              onChange={e => setLocalFilters({...localFilters, assignedTo: e.target.value})}
            >
              <option value="">Tất cả nhân viên</option>
              <option value="NO_STAFF">⚠ Chưa giao ai</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {customerActiveTab === 'calendar' ? (
        <CustomerCalendarView users={users} customers={filteredCustomers} onCustomerClick={handleViewProfile} />
      ) : (
        <div className="data-table-container">
          <table className="data-table">
          <thead>
            <tr>
              <th>HỌ TÊN</th>
              <th>LIÊN HỆ / ĐỊA CHỈ</th>
              <th>GIA NHẬP</th>
              <th>NHÂN VIÊN</th>
              <th>LTV (TỔNG CHI)</th>
              <th>VAI TRÒ</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {currentCustomers.map(customer => (
              <tr key={customer.id}>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b' }}>{customer.name}</span>
                      {customer.latest_note && (
                        <div 
                          style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}
                          onMouseEnter={() => setHoveredNoteId(customer.id)}
                          onMouseLeave={() => setHoveredNoteId(null)}
                        >
                          <MessageSquareText size={16} color="#f59e0b" />
                          {hoveredNoteId === customer.id && (
                            <div style={{
                              position: 'absolute',
                              left: '24px',
                              top: '-50%',
                              width: '260px',
                              background: '#1e293b',
                              color: '#f8fafc',
                              padding: '12px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 500,
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.2)',
                              zIndex: 100,
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.4'
                            }}>
                              <div style={{ fontWeight: 700, marginBottom: '4px', color: '#fbbf24' }}>GHI CHÚ MỚI NHẤT</div>
                              {customer.latest_note}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span 
                        style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          ...(customer.customer_segment === 'VIP 1' ? { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' } : 
                              customer.customer_segment === 'VIP 2' ? { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' } : 
                              customer.customer_segment === 'VIP 3' ? { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' } : 
                              customer.customer_segment === 'Repeat Customer' ? { background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' } : 
                              { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' })
                        }}
                      >
                        {customer.customer_segment === 'VIP 1' ? '⭐⭐⭐ VIP 1' :
                         customer.customer_segment === 'VIP 2' ? '⭐⭐ VIP 2' :
                         customer.customer_segment === 'VIP 3' ? '⭐ VIP 3' :
                         customer.customer_segment || 'New Customer'}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600 }}>
                        {(customer.total_trip_count || 0)} chuyến
                      </span>
                      {customer.lead_source && (
                        <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>
                          · {customer.lead_source}
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600 }}>{customer.phone || 'Chưa cập nhật SĐT'}</span>
                    <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Giới tính: {customer.gender || 'N/A'}</span>
                    {customer.email && <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{customer.email}</span>}
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', }) : 'N/A'}
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {users.find(u => u.id === customer.assigned_to)?.username || 'Chưa gán'}
                </td>
                <td style={{ fontWeight: 700, color: '#10b981' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(customer.total_spent || 0)}
                </td>
                <td style={{ fontSize: '0.85rem' }}>{customer.role || 'Booker'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="icon-btn" title="Xem hồ sơ" onClick={() => handleViewProfile(customer.id)}>
                      <Eye size={16} className="text-blue-500" />
                    </button>
                    {(canEdit(currentUser?.role, 'core') || (currentUser?.id && customer.assigned_to === currentUser.id)) && (
                      <button className="icon-btn" title="Sửa" onClick={() => setEditingCustomer(customer.id)}>
                        <Edit3 size={16} />
                      </button>
                    )}
                    {canDelete(currentUser?.role, 'core') && (
                      <button className="icon-btn danger" style={{ color: '#ef4444' }} title="Xóa" onClick={() => handleDeleteCustomer(customer.id)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Chưa có dữ liệu khách hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {customerActiveTab === 'list' && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Hiển thị:</span>
            <select
              className="filter-select"
              style={{ padding: '4px 24px 4px 12px', height: '32px', fontSize: '0.85rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', minWidth: '70px', margin: 0 }}
              value={itemsPerPage}
              onChange={(e) => {
                const val = e.target.value;
                setItemsPerPage(val === 'all' ? 'all' : parseInt(val, 10));
                setCurrentPage(1);
              }}
            >
              <option value={30}>30 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
              <option value={300}>300 dòng</option>
              <option value={1000}>1000 dòng</option>
              <option value="all">Tất cả</option>
            </select>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8' }}>
              Hiển thị {currentCustomers.length} / {filteredCustomers.length} khách hàng
            </span>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === 1 ? '#cbd5e1' : '#475569', fontSize: '0.85rem' }}
              >
                Trang trước
              </button>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', margin: '0 8px' }}>
                Trang {currentPage} / {totalPages}
              </div>
              <button 
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === totalPages ? '#cbd5e1' : '#475569', fontSize: '0.85rem' }}
              >
                Trang sau
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      <CustomerProfileSlider 
        customer={selectedCustomerFull} 
        users={users}
        onClose={() => { setSelectedCustomerId(null); setSelectedCustomerFull(null); }} 
        onAddNote={handleAddNote}
      />

      {showDuplicateManager && (
        <CustomerDuplicateManager 
          onClose={() => setShowDuplicateManager(false)} 
          onMerged={() => {
            // Trigger parent refresh if needed, but for now we can just let user refresh manually or we refresh state
            window.location.reload(); 
          }} 
        />
      )}
    </>
  );
};

export default CustomersTab;
