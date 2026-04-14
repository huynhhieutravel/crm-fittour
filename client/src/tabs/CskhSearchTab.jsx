import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Users, Phone, Mail, Download, CheckSquare, Square, Filter, MapPin, Star, Plus } from 'lucide-react';

const CskhSearchTab = ({ users = [], tourTemplates = [], tourDepartures = [] }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filters, setFilters] = useState({
    search: '', tour_id: '', departure_id: '', assigned_to: '', has_phone: 'yes', min_trips: ''
  });
  const [bulkAction, setBulkAction] = useState('');
  const [bulkTaskForm, setBulkTaskForm] = useState({ title: '', due_date: new Date().toLocaleDateString('en-CA'), priority_color: 'yellow' });
  const [showBulkModal, setShowBulkModal] = useState(false);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = {};
      Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
      const res = await axios.get('/api/cskh/search-customers', { headers, params });
      setResults(res.data);
      setSelectedIds(new Set());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map(r => r.id)));
    }
  };

  const getSelectedCustomers = () => results.filter(r => selectedIds.has(r.id));

  const copyPhones = () => {
    const phones = getSelectedCustomers().map(c => c.phone).filter(Boolean).join('\n');
    navigator.clipboard.writeText(phones);
    alert(`Đã copy ${phones.split('\n').length} số điện thoại!`);
  };

  const copyEmails = () => {
    const emails = getSelectedCustomers().map(c => c.email).filter(Boolean).join('\n');
    navigator.clipboard.writeText(emails);
    alert(`Đã copy ${emails.split('\n').length} email!`);
  };

  const createBulkTasks = async () => {
    if (!bulkTaskForm.title) { alert('Nhập tiêu đề task'); return; }
    const selected = getSelectedCustomers();
    if (selected.length === 0) { alert('Chọn ít nhất 1 khách hàng'); return; }

    try {
      let created = 0;
      for (const customer of selected) {
        await axios.post('/api/cskh/tasks', {
          customer_id: customer.id,
          title: bulkTaskForm.title,
          due_date: bulkTaskForm.due_date,
          priority_color: bulkTaskForm.priority_color,
          assigned_to: customer.assigned_to || null
        }, { headers });
        created++;
      }
      alert(`✅ Đã tạo ${created} task CSKH thành công!`);
      setShowBulkModal(false);
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={22} color="#6366f1" /> Tìm Khách Hàng Hàng Loạt
        </h2>
        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>Lọc nhóm khách hàng theo tour, segment, nhân viên — để nhắn tin hoặc tạo task CSKH hàng loạt.</p>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>TÌM KIẾM</label>
            <input type="text" placeholder="Tên, SĐT..." value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>TOUR ĐÃ ĐI</label>
            <select value={filters.tour_id} onChange={e => setFilters(f => ({ ...f, tour_id: e.target.value }))}
              style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontSize: '0.85rem' }}
            >
              <option value="">Tất cả tour</option>
              {tourTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>NHÂN VIÊN</label>
            <select value={filters.assigned_to} onChange={e => setFilters(f => ({ ...f, assigned_to: e.target.value }))}
              style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontSize: '0.85rem' }}
            >
              <option value="">Tất cả</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>SỐ CHUYẾN ≥</label>
            <input type="number" placeholder="VD: 2" value={filters.min_trips}
              onChange={e => setFilters(f => ({ ...f, min_trips: e.target.value }))}
              style={{ width: '100%', height: '38px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 10px', outline: 'none', fontSize: '0.85rem' }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
            <input type="checkbox" checked={filters.has_phone === 'yes'}
              onChange={e => setFilters(f => ({ ...f, has_phone: e.target.checked ? 'yes' : '' }))}
            /> Chỉ KH có SĐT
          </label>
          <button onClick={handleSearch}
            style={{ marginLeft: 'auto', padding: '0.5rem 1.25rem', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          ><Search size={16} /> Tìm kiếm</button>
        </div>
      </div>

      {/* Bulk Actions */}
      {results.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', background: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>
            {selectedIds.size > 0 ? `Đã chọn ${selectedIds.size} / ${results.length} khách hàng` : `Tìm thấy ${results.length} khách hàng`}
          </div>
          {selectedIds.size > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={copyPhones} style={{ padding: '6px 14px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Phone size={14} /> Copy SĐT
              </button>
              <button onClick={copyEmails} style={{ padding: '6px 14px', background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Mail size={14} /> Copy Email
              </button>
              <button onClick={() => setShowBulkModal(true)} style={{ padding: '6px 14px', background: '#e0e7ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={14} /> Tạo Task CSKH
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Đang tìm kiếm...</div>
      ) : results.length > 0 ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" checked={selectedIds.size === results.length && results.length > 0} onChange={toggleAll} />
                </th>
                <th>HỌ TÊN</th>
                <th>LIÊN HỆ</th>
                <th>SỐ CHUYẾN</th>
                <th>TOUR ĐÃ ĐI</th>
                <th>NHÂN VIÊN</th>
              </tr>
            </thead>
            <tbody>
              {results.map(c => (
                <tr key={c.id} style={{ background: selectedIds.has(c.id) ? '#eef2ff' : 'transparent' }}>
                  <td>
                    <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelect(c.id)} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div>
                    {c.birth_date && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>🎂 {new Date(c.birth_date).toLocaleDateString('vi-VN')}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{c.phone || '—'}</div>
                    {c.email && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.email}</div>}
                  </td>
                  <td style={{ fontWeight: 700, color: '#3b82f6' }}>{(parseInt(c.past_trip_count) || 0) + (parseInt(c.crm_trip_count) || 0)} chuyến</td>
                  <td style={{ fontSize: '0.8rem', color: '#64748b', maxWidth: '200px' }}>{c.tours_history || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{c.staff_name || 'Chưa gán'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', background: '#fff', borderRadius: '12px' }}>
          <Users size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <div style={{ fontWeight: 700 }}>Nhập bộ lọc và bấm "Tìm kiếm" để bắt đầu</div>
        </div>
      )}

      {/* Bulk Task Modal */}
      {showBulkModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowBulkModal(false); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '90%', maxWidth: '480px', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, color: '#1e293b' }}>🎯 Tạo Task CSKH Hàng Loạt</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem' }}>Sẽ tạo task cho <strong>{selectedIds.size}</strong> khách hàng đã chọn.</p>

            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Tiêu đề task *</label>
            <input type="text" value={bulkTaskForm.title} onChange={e => setBulkTaskForm(f => ({ ...f, title: e.target.value }))}
              placeholder="VD: Gọi giới thiệu tour Hè 2026"
              style={{ width: '100%', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}
            />

            <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Hạn chót</label>
                <input type="date" value={bulkTaskForm.due_date} onChange={e => setBulkTaskForm(f => ({ ...f, due_date: e.target.value }))}
                  style={{ width: '100%', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Ưu tiên</label>
                <select value={bulkTaskForm.priority_color} onChange={e => setBulkTaskForm(f => ({ ...f, priority_color: e.target.value }))}
                  style={{ width: '100%', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none' }}
                >
                  <option value="red">🔴 Khẩn cấp</option>
                  <option value="yellow">🟡 Bình thường</option>
                  <option value="green">🟢 Thấp</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowBulkModal(false)}
                style={{ flex: 1, height: '44px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
              >Hủy</button>
              <button onClick={createBulkTasks}
                style={{ flex: 2, height: '44px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >Tạo {selectedIds.size} Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CskhSearchTab;
