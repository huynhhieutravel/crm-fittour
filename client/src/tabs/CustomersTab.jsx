import React from 'react';
import { Search, UserPlus, Edit3, Trash2 } from 'lucide-react';

const CustomersTab = ({ 
  customers, 
  customerFilters, 
  setCustomerFilters, 
  setShowAddCustomerModal, 
  setEditingCustomer,
  handleDeleteCustomer,
  users = []
}) => {
  return (
    <div className="animate-fade-in">
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="filter-group" style={{ flex: 1, maxWidth: '400px' }}>
          <label>TÌM KHÁCH HÀNG</label>
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8' 
              }} 
            />
            <input 
              className="filter-input" 
              style={{ paddingLeft: '36px' }} 
              placeholder="Tên, SĐT, Email..." 
              value={customerFilters.search} 
              onChange={e => setCustomerFilters({...customerFilters, search: e.target.value})} 
            />
          </div>
        </div>
        <button 
          className="btn-pro-save" 
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }} 
          onClick={() => setShowAddCustomerModal(true)}
        >
          <UserPlus size={18} strokeWidth={3} /> THÊM KHÁCH HÀNG MỚI
        </button>
      </div>

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
              (c.name || '').toLowerCase().includes(customerFilters.search.toLowerCase()) ||
              (c.phone || '').includes(customerFilters.search)
            ).map(customer => (
              <tr key={customer.id}>
                <td style={{ fontWeight: 700 }}>{customer.name}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontWeight: 600 }}>{customer.phone || 'N/A'}</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.email || ''}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.address || ''}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${customer.customer_segment === 'VIP' ? 'badge-priority-high' : customer.customer_segment === 'Repeat Customer' ? 'badge-priority-medium' : 'badge-priority-low'}`}>
                    {customer.customer_segment}
                  </span>
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
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="icon-btn" onClick={() => setEditingCustomer(customer.id)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="icon-btn danger" style={{ color: '#ef4444' }} onClick={() => handleDeleteCustomer(customer.id)}>
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
    </div>
  );
};

export default CustomersTab;
