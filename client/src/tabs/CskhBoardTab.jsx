import { swalConfirm } from '../utils/swalHelpers';
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Phone, PhoneOff, PhoneMissed, X, Clock, Search, RefreshCw, CheckCircle, AlertTriangle, User, MapPin, Calendar, Tag, ChevronDown } from 'lucide-react';

const COLOR_LABELS = {
  red: { label: '🔴 Cần xử lý ngay', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  yellow: { label: '🟡 Đang chờ chốt', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  green: { label: '🟢 Đã ổn định', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  gray: { label: '⚪ Lưu ý / Tạm ẩn', color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

const STATUS_LABELS = {
  pending: { label: 'Chờ xử lý', color: '#f59e0b', bg: '#fffbeb' },
  in_progress: { label: 'Đang gọi', color: '#3b82f6', bg: '#eff6ff' },
  overdue: { label: 'Quá hạn', color: '#ef4444', bg: '#fef2f2' },
  completed: { label: 'Hoàn thành', color: '#22c55e', bg: '#f0fdf4' },
  canceled: { label: 'Bỏ qua', color: '#9ca3af', bg: '#f9fafb' },
};

const CskhBoardTab = ({ users = [] }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ by_color: [], by_status: [], today_due: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('active');
  const [filterColor, setFilterColor] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssigned, setFilterAssigned] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalTask, setModalTask] = useState(null);
  const [formData, setFormData] = useState({
    interaction_result: 'answered',
    call_outcome: 'booked',
    notes: '',
    reminders: { passport: false, luggage: false, review: false, promo: false }
  });

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get('/api/cskh/stats', { headers });
      setStats(res.data);
    } catch (err) { console.error(err); }
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const params = { status: filterStatus, page, limit: 30 };
      if (filterColor) params.color = filterColor;
      if (searchQuery) params.search = searchQuery;
      if (filterAssigned) params.assigned_to = filterAssigned;
      const res = await axios.get('/api/cskh/tasks', { headers, params });
      setTasks(res.data.tasks);
      setTotal(res.data.total);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filterStatus, filterColor, searchQuery, filterAssigned, page]);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { setPage(1); }, [filterStatus, filterColor, searchQuery, filterAssigned]);

  const getColorCount = (color) => {
    const found = stats.by_color.find(c => c.priority_color === color);
    return found ? found.cnt : 0;
  };
  const totalActive = stats.by_color.reduce((s, c) => s + c.cnt, 0);

  const openModal = (task) => {
    setModalTask(task);
    setFormData({
      interaction_result: 'answered',
      call_outcome: 'booked',
      notes: '',
      reminders: { passport: false, luggage: false, review: false, promo: false }
    });
  };

  const handleProcess = async () => {
    if (!modalTask) return;
    try {
      await axios.post(`/api/cskh/tasks/${modalTask.id}/process`, formData, { headers });
      setModalTask(null);
      fetchTasks();
      fetchStats();
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleSkip = async (taskId) => {
    if (!await swalConfirm('Bỏ qua task này?')) return;
    try {
      await axios.post(`/api/cskh/tasks/${taskId}/skip`, {}, { headers });
      fetchTasks();
      fetchStats();
    } catch (err) { console.error(err); }
  };

  const totalPages = Math.ceil(total / 30) || 1;

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Stats Cards */}
      <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(COLOR_LABELS).map(([color, info]) => (
          <div key={color} style={{
            padding: '1.25rem', borderRadius: '16px', background: info.bg,
            borderLeft: `5px solid ${info.color}`, cursor: 'pointer',
            transition: 'all 0.2s', boxShadow: filterColor === color ? `0 0 0 2px ${info.color}` : 'none'
          }}
            onClick={() => { setFilterColor(filterColor === color ? '' : color); setFilterStatus('active'); }}
          >
            <div style={{ fontSize: '0.8rem', color: info.color, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>{info.label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: info.color }}>{getColorCount(color)}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs + Search */}
      <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setFilterStatus('active'); setFilterColor(''); }}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem',
                border: filterStatus === 'active' && !filterColor ? '2px solid #475569' : '2px solid transparent',
                background: '#f1f5f9', color: '#475569', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              Tất cả <span style={{ background: '#475569', color: 'white', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem' }}>{totalActive}</span>
            </button>
            {Object.entries(COLOR_LABELS).map(([color, info]) => (
              <button key={color}
                onClick={() => { setFilterColor(color); setFilterStatus('active'); }}
                style={{
                  padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem',
                  border: filterColor === color ? `2px solid ${info.color}` : '2px solid transparent',
                  background: info.bg, color: info.color, cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                {info.label} <span style={{ background: info.color, color: 'white', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem' }}>{getColorCount(color)}</span>
              </button>
            ))}
            <button
              onClick={() => { setFilterStatus('completed'); setFilterColor(''); }}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '12px', fontWeight: 700, fontSize: '0.85rem',
                border: filterStatus === 'completed' ? '2px solid #16a34a' : '2px solid transparent',
                background: '#f0fdf4', color: '#16a34a', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >✅ Đã xong</button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text" placeholder="🔍 Tìm tên/SĐT..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '32px', height: '40px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', width: '200px', outline: 'none' }}
              />
            </div>
            <select value={filterAssigned} onChange={e => setFilterAssigned(e.target.value)}
              style={{ height: '40px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '0.85rem', padding: '0 12px', outline: 'none', background: '#f8fafc', fontWeight: 600 }}
            >
              <option value="">Tất cả NV</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
            <button onClick={() => { fetchTasks(); fetchStats(); }}
              style={{ height: '40px', padding: '0 16px', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
            ><RefreshCw size={16} /> Tải lại</button>
          </div>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', background: '#fff', borderRadius: '16px' }}>Đang tải...</div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <CheckCircle size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#94a3b8' }}>Không có task nào cần xử lý</div>
          <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem' }}>Hệ thống Cron sẽ tự động sinh task khi có dữ liệu mới</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {tasks.map(t => {
            const cl = COLOR_LABELS[t.priority_color] || COLOR_LABELS.gray;
            const sl = STATUS_LABELS[t.status] || STATUS_LABELS.pending;
            return (
              <div key={t.id} style={{
                background: 'white', borderRadius: '16px', padding: '1.25rem 1.5rem',
                border: '1px solid #f1f5f9', borderLeft: `4px solid ${cl.color}`,
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                transition: 'all 0.25s', cursor: 'default'
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
              >
                {/* Color dot */}
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: cl.color, flexShrink: 0, boxShadow: '0 0 0 3px rgba(0,0,0,0.05)' }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', marginBottom: '0.2rem' }}>
                    {t.customer_name}
                    {t.title && <span style={{ fontWeight: 500, fontSize: '0.85rem', color: '#64748b', marginLeft: '8px' }}>— {t.title}</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    <Phone size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />{t.customer_phone || 'Chưa có SĐT'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600, marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {t.rule_name && <span><Tag size={11} style={{ marginRight: 2 }} />{t.rule_name}</span>}
                    {t.total_bookings > 0 && (
                      <span style={{ background: '#dbeafe', color: '#2563eb', padding: '1px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>{t.total_bookings} booking</span>
                    )}
                    {t.retry_count > 0 && (
                      <span style={{ background: '#fee2e2', color: '#dc2626', padding: '1px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>Retry #{t.retry_count}</span>
                    )}
                    {t.assigned_name && (
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '1px 8px', borderRadius: '4px', fontSize: '0.7rem' }}><User size={10} /> {t.assigned_name}</span>
                    )}
                  </div>
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                  <span style={{ padding: '0.3rem 0.7rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700, background: sl.bg, color: sl.color }}>{sl.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: t.status === 'overdue' ? '#dc2626' : '#64748b' }}>
                    <Clock size={12} style={{ marginRight: 2 }} />{new Date(t.due_date).toLocaleDateString('vi-VN')}
                  </span>
                  {t.next_departure && (
                    <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>
                      <Calendar size={11} /> Bay: {new Date(t.next_departure).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {t.status !== 'completed' && t.status !== 'canceled' ? (
                    <>
                      <button onClick={() => openModal(t)} style={{
                        padding: '0.5rem 1rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.8rem',
                        border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white',
                        display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                      ><Phone size={14} /> Chăm sóc</button>
                      <button onClick={() => handleSkip(t.id)} title="Bỏ qua" style={{
                        padding: '0.5rem', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center'
                      }}><X size={16} /></button>
                    </>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}><CheckCircle size={14} color="#22c55e" /> Xong</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1.5rem' }}>
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: '6px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: page <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600, background: '#fff' }}
          >← Trước</button>
          <span style={{ fontWeight: 700, color: '#64748b' }}>Trang {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
            style={{ padding: '6px 16px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: page >= totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, background: '#fff' }}
          >Sau →</button>
        </div>
      )}

      {/* ═══ CSKH MODAL ═══ */}
      {modalTask && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setModalTask(null); }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', borderRadius: '20px', width: '90%', maxWidth: '640px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', padding: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>📞 Chăm sóc Khách hàng</h3>
              <button onClick={() => setModalTask(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>×</button>
            </div>

            {/* Customer Summary */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
              {[
                ['Khách hàng', modalTask.customer_name],
                ['Điện thoại', modalTask.customer_phone || 'Chưa có'],
                ['Lý do gọi', modalTask.rule_name || modalTask.title || '—'],
                ['Tour sắp tới', modalTask.next_departure ? new Date(modalTask.next_departure).toLocaleDateString('vi-VN') : 'Chưa có'],
                ['Tổng booking', `${modalTask.total_bookings || 0} đơn`],
              ].map(([label, val], i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', fontSize: '0.9rem' }}>
                  <span style={{ color: '#64748b', fontWeight: 600 }}>{label}</span>
                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{val}</span>
                </div>
              ))}
            </div>

            {/* Kết quả liên hệ */}
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>Kết quả liên hệ</label>
            <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[
                ['answered', '✅ Nghe máy'],
                ['busy', '📞 Bận'],
                ['no_answer', '❌ Không nghe'],
              ].map(([val, label]) => (
                <label key={val} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem',
                  border: `2px solid ${formData.interaction_result === val ? '#4f46e5' : '#f1f5f9'}`,
                  borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                  background: formData.interaction_result === val ? '#eef2ff' : 'transparent',
                  transition: 'all 0.2s'
                }}>
                  <input type="radio" name="ir" checked={formData.interaction_result === val}
                    onChange={() => setFormData(d => ({ ...d, interaction_result: val }))}
                  /> {label}
                </label>
              ))}
            </div>

            {/* Kết quả sau cuộc gọi (chỉ khi nghe máy) */}
            {formData.interaction_result === 'answered' && (
              <>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>Kết quả sau cuộc gọi</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  {[
                    ['booked', '📅 Khách chốt tour / đặt cọc → Chuyển XANH', '#bbf7d0', '#f0fdf4', '#166534'],
                    ['thinking', '🤔 Khách cần suy nghĩ thêm → Hẹn gọi lại', '#fde68a', '#fffbeb', '#92400e'],
                    ['refused', '🚫 Không quan tâm → Chuyển XÁM', '#e5e7eb', '#f9fafb', '#6b7280'],
                    ['info_only', 'ℹ️ Hỏi thăm / Chúc mừng (không chốt)', '#bfdbfe', '#eff6ff', '#1e40af'],
                  ].map(([val, label, border, bg, color]) => (
                    <label key={val} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                      border: `2px solid ${formData.call_outcome === val ? border : '#f1f5f9'}`,
                      borderRadius: '12px', background: formData.call_outcome === val ? bg : 'transparent',
                      cursor: 'pointer', fontWeight: 700, fontSize: '0.9rem', color: color,
                      transition: 'all 0.2s'
                    }}>
                      <input type="radio" name="co" checked={formData.call_outcome === val}
                        onChange={() => setFormData(d => ({ ...d, call_outcome: val }))}
                      /> {label}
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Checklist nhắc nhở */}
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>Nhắc nhở khách hàng</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.25rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
              {[
                ['passport', '✈️ Nhắc mang theo hộ chiếu, visa, giấy tờ'],
                ['luggage', '🧳 Nhắc chuẩn bị hành lý, đọc lịch trình'],
                ['review', '⭐ Nhắc đánh giá Google Maps / Facebook'],
                ['promo', '🎁 Thông báo ưu đãi, tour mới sắp có'],
              ].map(([key, label]) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.reminders[key]}
                    onChange={() => setFormData(d => ({ ...d, reminders: { ...d.reminders, [key]: !d.reminders[key] } }))}
                  /> {label}
                </label>
              ))}
            </div>

            {/* Ghi chú */}
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '0.5rem' }}>Ghi chú cuộc gọi</label>
            <textarea
              value={formData.notes} onChange={e => setFormData(d => ({ ...d, notes: e.target.value }))}
              rows={3} placeholder="VD: Khách quan tâm tour Nhật Bản tháng 7, hẹn gọi lại thứ 6..."
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px', marginBottom: '1.5rem', resize: 'vertical', outline: 'none', fontSize: '0.9rem', fontFamily: 'inherit' }}
            />

            {/* Submit */}
            <button onClick={handleProcess} style={{
              width: '100%', height: '48px', fontSize: '1rem', borderRadius: '14px',
              background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white',
              border: 'none', cursor: 'pointer', fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(79,70,229,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <CheckCircle size={18} /> Xác nhận & Lưu kết quả
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CskhBoardTab;
