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
  users = []
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomerFull, setSelectedCustomerFull] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showDuplicateManager, setShowDuplicateManager] = useState(false);
  const [hoveredNoteId, setHoveredNoteId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  // Lọc nâng cao locally 
  const [localFilters, setLocalFilters] = useState({ segment: '', birthdayOnly: false, minSpent: '', source: '' });

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
    <div className="animate-fade-in">
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px' }}>
          <div className="filter-group" style={{ flex: 1, maxWidth: '400px', margin: 0 }}>
            <label>TÌM KHÁCH HÀNG</label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={16} 
                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} 
              />
              <input 
                className="filter-input" 
                style={{ paddingLeft: '36px' }} 
                placeholder="Tên, SĐT, Email..." 
                value={customerFilters?.search || ''} 
                onChange={e => setCustomerFilters({...customerFilters, search: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="filter-group" style={{ margin: 0 }}>
            <label>PHÂN KHÚC</label>
            <select 
              className="filter-select"
              value={localFilters.segment}
              onChange={e => setLocalFilters({...localFilters, segment: e.target.value})}
            >
              <option value="">Tất cả</option>
              <option value="VIP">VIP</option>
              <option value="Platinum">Platinum</option>
              <option value="Repeat Customer">Khách hàng cũ</option>
              <option value="New Customer">Khách hàng mới</option>
            </select>
          </div>

          <div className="filter-group" style={{ margin: 0 }}>
            <label>TỔNG CHI TIÊU</label>
            <select 
              className="filter-select"
              value={localFilters.minSpent}
              onChange={e => setLocalFilters({...localFilters, minSpent: e.target.value})}
            >
              <option value="">Mọi mức chi</option>
              <option value="10000000">&gt; 10 Triệu</option>
              <option value="50000000">&gt; 50 Triệu</option>
              <option value="100000000">&gt; 100 Triệu</option>
            </select>
          </div>

          <div className="filter-group" style={{ margin: 0 }}>
            <label>NGUỒN KHÁCH</label>
            <select 
              className="filter-select"
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

          <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <button 
              className={`btn ${localFilters.birthdayOnly ? 'btn-priority-medium' : 'btn-outline'}`}
              style={{ height: '42px', display: 'flex', alignItems: 'center', gap: '8px' }}
              onClick={() => setLocalFilters({...localFilters, birthdayOnly: !localFilters.birthdayOnly})}
            >
              🎂 SN Tuần này
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', border: 'none', boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', display: 'flex', gap: '6px', alignItems: 'center', fontWeight: '600' }}
              onClick={() => setViewMode('list')}
            >
              <ListIcon size={18} /> Danh Sách
            </button>
            <button
              className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 16px', border: 'none', boxShadow: viewMode === 'calendar' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', color: viewMode === 'calendar' ? '#fff' : '#64748b', display: 'flex', gap: '6px', alignItems: 'center', fontWeight: '600' }}
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon size={18} /> Xem Lịch
            </button>
          </div>

          <button 
            className="btn-pro-save" 
            style={{ width: 'auto', padding: '0.75rem 1.5rem', backgroundColor: '#fef08a', color: '#854d0e', border: '1px solid #fde047' }} 
            onClick={() => setShowDuplicateManager(true)}
            title="Quét Dữ Liệu Rác"
          >
            <Network size={18} strokeWidth={3} /> QUÉT RÁC
          </button>
          <button 
            className="btn-pro-save" 
            style={{ width: 'auto', padding: '0.75rem 1.5rem' }} 
            onClick={() => setShowAddCustomerModal(true)}
          >
            <UserPlus size={18} strokeWidth={3} /> THÊM KHÁCH HÀNG
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <CustomerCalendarView users={users} onCustomerClick={handleViewProfile} />
      ) : (
        <div className="data-table-container">
          <table className="data-table">
          <thead>
            <tr>
              <th>HỌ TÊN</th>
              <th>LIÊN HỆ / ĐỊA CHỈ</th>
              <th>PHÂN KHÚC & NGUỒN</th>
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
              (localFilters.birthdayOnly ? c.is_birthday_this_week === true : true) &&
              (localFilters.minSpent ? (c.total_spent || 0) >= parseInt(localFilters.minSpent) : true) &&
              (localFilters.source ? (c.lead_source || '').toLowerCase() === localFilters.source.toLowerCase() : true)
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
                    {customer.is_birthday_this_week && <span title="Sinh nhật vào tuần này">🎂</span>}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span className={`badge ${customer.customer_segment === 'VIP' ? 'badge-priority-high' : customer.customer_segment === 'Repeat Customer' ? 'badge-priority-medium' : 'badge-priority-low'}`}>
                      {customer.customer_segment}
                    </span>
                    {customer.lead_source && (
                      <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>
                        {customer.lead_source}
                      </span>
                    )}
                  </div>
                </td>
                <td style={{ fontSize: '0.85rem' }}>
                  {customer.first_deal_date ? new Date(customer.first_deal_date).toLocaleDateString('vi-VN') : 'N/A'}
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
    </div>
  );
};

export default CustomersTab;
