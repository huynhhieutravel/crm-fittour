import React, { useState } from 'react';
import { Search, UserPlus, Edit3, Trash2, Eye, Filter, MessageSquareText } from 'lucide-react';
import axios from 'axios';
import CustomerProfileSlider from '../components/CustomerProfileSlider';
import CustomerCalendarView from '../components/CustomerCalendarView';
import CustomerDuplicateManager from '../components/CustomerDuplicateManager';
import { Calendar as CalendarIcon, List as ListIcon, Network } from 'lucide-react';

const CustomersTab = ({ 
  customers, 
  customerFilters, 
  setCustomerFilters, 
  setShowAddCustomerModal, 
  setEditingCustomer,
  handleDeleteCustomer,
  users = [],
  customerActiveTab = 'list'
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerFull, setSelectedCustomerFull] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);

  const [localFilters, setLocalFilters] = useState({ segment: '', minSpent: '', source: '', assignedTo: '' });

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

  return (
    <>
      <div className="animate-fade-in">
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
            <button 
              className="btn-pro-save" 
              style={{ width: 'auto', padding: '0.5rem 1rem' }} 
              onClick={() => setShowAddCustomerModal(true)}
            >
              <UserPlus size={16} strokeWidth={3} /> THÊM KHÁCH HÀNG
            </button>
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
              <option value="VIP">🌟 VIP</option>
              <option value="VVIP">👑 VVIP</option>
              <option value="Platinum">💎 Platinum</option>
              <option value="Repeat Customer">🔄 Khách hàng cũ</option>
              <option value="New Customer">✨ Khách hàng mới</option>
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
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {customerActiveTab === 'calendar' ? (
        <CustomerCalendarView users={users} customers={customers} onCustomerClick={handleViewProfile} />
      ) : (
        <div className="data-table-container">
          <table className="data-table">
          <thead>
            <tr>
              <th>HỌ TÊN</th>
              <th>LIÊN HỆ / ĐỊA CHỈ</th>
              <th>PHÂN KHÚC</th>
              <th>GIA NHẬP</th>
              <th>NHÂN VIÊN</th>
              <th>LTV (TỔNG CHI)</th>
              <th>VAI TRÒ</th>
              <th>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {customers.filter(c => 
              ((c.name || '').toLowerCase().includes((customerFilters?.search || '').toLowerCase()) ||
               (c.phone || '').includes(customerFilters?.search || '')) &&
              (localFilters.segment ? c.customer_segment === localFilters.segment : true) &&
              (localFilters.minSpent ? (c.total_spent || 0) >= parseInt(localFilters.minSpent) : true) &&
              (localFilters.source ? (c.lead_source || '').toLowerCase() === localFilters.source.toLowerCase() : true) &&
              (localFilters.assignedTo ? c.assigned_to === parseInt(localFilters.assignedTo) : true)
            ).map(customer => (
              <tr key={customer.id}>
                <td>
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
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{customer.phone || 'N/A'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.email || ''}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.address || ''}</span>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
                    <span 
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        ...(customer.customer_segment === 'VVIP' ? { background: 'linear-gradient(135deg, #a855f7 0%, #db2777 100%)', color: 'white', border: 'none' } : 
                            customer.customer_segment === 'VIP' ? { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' } : 
                            customer.customer_segment === 'Platinum' ? { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' } : 
                            customer.customer_segment === 'Repeat Customer' ? { background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' } : 
                            { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }) // New Customer
                      }}
                    >
                      {customer.customer_segment || 'New Customer'}
                    </span>
                    {customer.lead_source && (
                      <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        Nguồn: {customer.lead_source}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {customer.created_at ? new Date(customer.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {users.find(u => u.id === customer.assigned_to)?.full_name || 'Chưa gán'}
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
                    <button className="icon-btn" title="Sửa" onClick={() => setEditingCustomer(customer.id)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="icon-btn danger" style={{ color: '#ef4444' }} title="Xóa" onClick={() => handleDeleteCustomer(customer.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Chưa có dữ liệu khách hàng.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
