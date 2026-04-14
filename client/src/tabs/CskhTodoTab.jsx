import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, Clock, Trash2, Edit3, User, Calendar, Search, Filter } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: 'red', label: '🔴 Khẩn cấp', color: '#dc2626' },
  { value: 'yellow', label: '🟡 Bình thường', color: '#d97706' },
  { value: 'green', label: '🟢 Thấp', color: '#16a34a' },
  { value: 'gray', label: '⚪ Ghi chú', color: '#6b7280' },
];

const CskhTodoTab = ({ users = [], customers = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const [form, setForm] = useState({
    customer_id: '', title: '', description: '', due_date: new Date().toLocaleDateString('en-CA'),
    assigned_to: '', priority_color: 'yellow'
  });
  const [editingId, setEditingId] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { status: filterStatus, limit: 100 };
      if (searchQuery) params.search = searchQuery;
      if (filterAssigned) params.assigned_to = filterAssigned;
      const res = await axios.get('/api/cskh/tasks', { headers, params });
      // Filter to only manual tasks (no rule_id) or show all
      setTasks(res.data.tasks);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterStatus, searchQuery, filterAssigned]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filteredCustomers = customers.filter(c =>
    customerSearch && (
      (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone || '').includes(customerSearch)
    )
  ).slice(0, 10);

  const handleSubmit = async () => {
    if (!form.customer_id || !form.title) {
      alert('Vui lòng chọn khách hàng và nhập tiêu đề');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`/api/cskh/tasks/${editingId}`, form, { headers });
      } else {
        await axios.post('/api/cskh/tasks', form, { headers });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ customer_id: '', title: '', description: '', due_date: new Date().toLocaleDateString('en-CA'), assigned_to: '', priority_color: 'yellow' });
      setCustomerSearch('');
      fetchTasks();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.put(`/api/cskh/tasks/${taskId}`, { status: newStatus }, { headers });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const handleEdit = (task) => {
    setForm({
      customer_id: task.customer_id,
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date ? new Date(task.due_date).toLocaleDateString('en-CA') : '',
      assigned_to: task.assigned_to || '',
      priority_color: task.priority_color || 'yellow'
    });
    setEditingId(task.id);
    setCustomerSearch(task.customer_name || '');
    setShowForm(true);
  };

  const handleSkip = async (taskId) => {
    try {
      await axios.post(`/api/cskh/tasks/${taskId}/skip`, {}, { headers });
      fetchTasks();
    } catch (err) { console.error(err); }
  };

  const pendingTasks = tasks.filter(t => ['pending', 'overdue'].includes(t.status));
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => ['completed', 'canceled'].includes(t.status));

  const TaskCard = ({ task }) => {
    const priorityInfo = PRIORITY_OPTIONS.find(p => p.value === task.priority_color) || PRIORITY_OPTIONS[1];
    const isOverdue = task.status === 'overdue';
    return (
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '1rem', border: '1px solid #f1f5f9',
        borderLeft: `4px solid ${priorityInfo.color}`, transition: 'all 0.2s', marginBottom: '0.5rem'
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.95rem', marginBottom: '4px' }}>
              {task.title || task.rule_name || 'Task'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
              <User size={11} /> {task.customer_name} · {task.customer_phone || '—'}
            </div>
            {task.description && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', lineHeight: '1.4' }}>{task.description}</div>
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: isOverdue ? '#dc2626' : '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Clock size={11} /> {task.due_date ? new Date(task.due_date).toLocaleDateString('vi-VN') : '—'}
                {isOverdue && ' (Quá hạn)'}
              </span>
              {task.assigned_name && (
                <span style={{ fontSize: '0.7rem', fontWeight: 600, background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', color: '#475569' }}>
                  {task.assigned_name}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {task.status !== 'completed' && task.status !== 'canceled' && (
              <>
                <button onClick={() => handleStatusChange(task.id, 'completed')} title="Hoàn thành"
                  style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><CheckCircle size={14} /></button>
                <button onClick={() => handleEdit(task)} title="Sửa"
                  style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><Edit3 size={14} /></button>
                <button onClick={() => handleSkip(task.id)} title="Xóa"
                  style={{ width: 28, height: 28, borderRadius: '6px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><Trash2 size={14} /></button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#fff', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#1e293b' }}>✅ Todo List — Chăm Sóc Khách Hàng</h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>Tạo task thủ công, giao việc cho nhân viên</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setForm({ customer_id: '', title: '', description: '', due_date: new Date().toLocaleDateString('en-CA'), assigned_to: '', priority_color: 'yellow' }); setCustomerSearch(''); }}
          style={{ padding: '0.6rem 1.25rem', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
        ><Plus size={16} /> Tạo Task Mới</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          ['active', '🕒 Đang chờ'],
          ['completed', '✅ Đã xong'],
          ['all', '📋 Tất cả'],
        ].map(([val, label]) => (
          <button key={val} onClick={() => setFilterStatus(val)}
            style={{
              padding: '6px 16px', borderRadius: '8px', fontWeight: 700, fontSize: '0.85rem',
              border: filterStatus === val ? '2px solid #4f46e5' : '2px solid #e2e8f0',
              background: filterStatus === val ? '#eef2ff' : '#fff', color: filterStatus === val ? '#4f46e5' : '#475569',
              cursor: 'pointer'
            }}
          >{label}</button>
        ))}
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input type="text" placeholder="Tìm tên KH..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '30px', height: '36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', width: '180px', outline: 'none' }}
          />
        </div>
        <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}
          style={{ height: '36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', padding: '0 10px', outline: 'none' }}
        >
          <option value="">Tất cả NV</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
        </select>
      </div>

      {/* Kanban Columns */}
      {filterStatus === 'active' ? (
        <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Pending */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#f59e0b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> ĐANG CHỜ ({pendingTasks.length})
            </div>
            {pendingTasks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e1', background: '#fafafa', borderRadius: '12px', fontSize: '0.85rem' }}>Không có task đang chờ</div>
            ) : (
              pendingTasks.map(t => <TaskCard key={t.id} task={t} />)
            )}
          </div>
          {/* Completed recently */}
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#22c55e', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle size={16} /> HOÀN THÀNH GẦN ĐÂY
            </div>
            {completedTasks.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#cbd5e1', background: '#fafafa', borderRadius: '12px', fontSize: '0.85rem' }}>Chưa hoàn thành task nào</div>
            ) : (
              completedTasks.slice(0, 10).map(t => <TaskCard key={t.id} task={t} />)
            )}
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
          ) : tasks.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Không có task nào</div>
          ) : (
            tasks.map(t => <TaskCard key={t.id} task={t} />)
          )}
        </div>
      )}

      {/* ═══ CREATE/EDIT MODAL ═══ */}
      {showForm && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', width: '90%', maxWidth: '520px', padding: '2rem', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ margin: '0 0 1.5rem 0', fontWeight: 800, color: '#1e293b' }}>{editingId ? '✏️ Sửa Task' : '➕ Tạo Task CSKH Mới'}</h3>

            {/* Customer Search */}
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Khách hàng *</label>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input type="text" placeholder="Tìm khách hàng..." value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setForm(d => ({ ...d, customer_id: '' })); }}
                style={{ width: '100%', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none', fontSize: '0.9rem' }}
              />
              {customerSearch && !form.customer_id && filteredCustomers.length > 0 && (
                <div style={{ position: 'absolute', top: '42px', left: 0, right: 0, background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                  {filteredCustomers.map(c => (
                    <div key={c.id} onClick={() => { setForm(d => ({ ...d, customer_id: c.id })); setCustomerSearch(c.name); }}
                      style={{ padding: '8px 12px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid #f1f5f9' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                    >
                      {c.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>· {c.phone || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Tiêu đề *</label>
            <input type="text" value={form.title} onChange={e => setForm(d => ({ ...d, title: e.target.value }))}
              placeholder="VD: Gọi xác nhận tour Nhật Bản"
              style={{ width: '100%', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none', fontSize: '0.9rem', marginBottom: '1rem' }}
            />

            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Mô tả</label>
            <textarea value={form.description} onChange={e => setForm(d => ({ ...d, description: e.target.value }))}
              rows={2} placeholder="Chi tiết công việc..."
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px', outline: 'none', resize: 'vertical', fontSize: '0.9rem', marginBottom: '1rem', fontFamily: 'inherit' }}
            />

            <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Hạn chót</label>
                <input type="date" value={form.due_date} onChange={e => setForm(d => ({ ...d, due_date: e.target.value }))}
                  style={{ width: '100%', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Giao cho</label>
                <select value={form.assigned_to} onChange={e => setForm(d => ({ ...d, assigned_to: e.target.value }))}
                  style={{ width: '100%', height: '40px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px', outline: 'none' }}
                >
                  <option value="">— Chọn nhân viên —</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                </select>
              </div>
            </div>

            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: '#475569', marginBottom: '6px' }}>Độ ưu tiên</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {PRIORITY_OPTIONS.map(p => (
                <button key={p.value} onClick={() => setForm(d => ({ ...d, priority_color: p.value }))}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem',
                    border: form.priority_color === p.value ? `2px solid ${p.color}` : '2px solid #e2e8f0',
                    background: form.priority_color === p.value ? `${p.color}15` : '#fff',
                    color: p.color, cursor: 'pointer'
                  }}
                >{p.label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => setShowForm(false)}
                style={{ flex: 1, height: '44px', border: '1px solid #e2e8f0', borderRadius: '10px', background: '#f8fafc', fontWeight: 700, cursor: 'pointer', color: '#64748b' }}
              >Hủy</button>
              <button onClick={handleSubmit}
                style={{ flex: 2, height: '44px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >{editingId ? 'Lưu thay đổi' : 'Tạo Task'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CskhTodoTab;
