import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Save, X, Settings, Users, Shield, Inbox } from 'lucide-react';
import { swalConfirm } from '../utils/swalHelpers';

const STYLES = {
  page: { padding: '28px 32px', maxWidth: '1100px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' },
  title: { fontSize: '26px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary, #1e293b)' },
  subtitle: { color: 'var(--text-secondary, #64748b)', fontSize: '14px', marginTop: '6px' },
  card: { background: 'var(--bg-card, #fff)', borderRadius: '14px', border: '1px solid var(--border-color, #e2e8f0)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 24px rgba(0,0,0,0.03)', overflow: 'hidden' },
  searchWrap: { padding: '16px 20px', borderBottom: '1px solid var(--border-color, #e2e8f0)', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-secondary, #f8fafc)' },
  searchInput: { border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', width: '280px', color: 'var(--text-primary, #1e293b)' },
  th: { padding: '12px 16px', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-secondary, #64748b)', borderBottom: '2px solid var(--border-color, #e2e8f0)', background: 'var(--bg-secondary, #f8fafc)' },
  td: { padding: '14px 16px', borderBottom: '1px solid var(--border-color, #f1f5f9)', fontSize: '14px', color: 'var(--text-primary, #334155)' },
  btnPrimary: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 10px rgba(99,102,241,0.25)', transition: 'all 0.2s' },
  btnIcon: { background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'background 0.15s', display: 'flex', alignItems: 'center' },
  badge: (color) => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: color === 'green' ? '#ecfdf5' : color === 'red' ? '#fef2f2' : '#f1f5f9', color: color === 'green' ? '#059669' : color === 'red' ? '#dc2626' : '#64748b' }),
  avatar: (letter) => ({ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 }),
  // Empty state
  emptyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' },
  emptyIcon: { width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #ede9fe, #e0e7ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  emptyTitle: { fontSize: '20px', fontWeight: '700', color: 'var(--text-primary, #1e293b)', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: 'var(--text-secondary, #64748b)', maxWidth: '400px', lineHeight: '1.6', marginBottom: '24px' },
  // Modal
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, animation: 'fadeIn 0.2s ease' },
  modal: { background: 'var(--bg-card, #fff)', borderRadius: '16px', width: '90%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', overflow: 'hidden', animation: 'slideUp 0.25s ease' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color, #e2e8f0)' },
  modalTitle: { fontSize: '18px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' },
  modalBody: { padding: '24px' },
  formGroup: { marginBottom: '18px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary, #475569)', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border-color, #e2e8f0)', fontSize: '14px', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s', background: 'var(--bg-primary, #fff)', color: 'var(--text-primary, #1e293b)', boxSizing: 'border-box' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  modalFooter: { display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 24px', borderTop: '1px solid var(--border-color, #e2e8f0)', background: 'var(--bg-secondary, #f8fafc)' },
  btnSecondary: { padding: '10px 20px', border: '1px solid var(--border-color, #e2e8f0)', borderRadius: '10px', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: 'var(--text-primary, #475569)', fontWeight: '500' },
  // Info cards
  infoRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  infoCard: (gradient) => ({ padding: '18px 20px', borderRadius: '12px', background: gradient, display: 'flex', alignItems: 'center', gap: '14px' }),
  infoIcon: (bg) => ({ width: '42px', height: '42px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
};

function EmailMailboxesTab({ addToast, users }) {
  const [mailboxes, setMailboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ email_address: '', user_id: '', display_name: '', signature: '', mailbox_type: 'personal', max_send_per_minute: 10, is_active: true });

  useEffect(() => { fetchMailboxes(); }, []);

  const fetchMailboxes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/emails/mailboxes');
      setMailboxes(res.data || []);
    } catch (err) {
      addToast?.('Lỗi tải danh sách hộp thư: ' + (err.response?.data?.error || err.message), 'error');
    } finally { setLoading(false); }
  };

  const openModal = (m = null) => {
    if (m) {
      setEditingId(m.id);
      setFormData({ email_address: m.email_address || '', user_id: m.user_id || '', display_name: m.display_name || '', signature: m.signature || '', mailbox_type: m.mailbox_type || 'personal', max_send_per_minute: m.max_send_per_minute || 10, is_active: m.is_active });
    } else {
      setEditingId(null);
      setFormData({ email_address: '', user_id: '', display_name: '', signature: '', mailbox_type: 'personal', max_send_per_minute: 10, is_active: true });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.email_address) return addToast?.('Vui lòng nhập địa chỉ email', 'error');
    try {
      const payload = { ...formData };
      if (!payload.user_id) payload.user_id = null;
      if (editingId) {
        await axios.put(`/api/emails/mailboxes/${editingId}`, payload);
        addToast?.('Cập nhật hộp thư thành công!');
      } else {
        await axios.post('/api/emails/mailboxes', payload);
        addToast?.('🎉 Thêm hộp thư mới thành công!');
      }
      setShowModal(false);
      fetchMailboxes();
    } catch (err) { addToast?.('Lỗi: ' + (err.response?.data?.error || err.message), 'error'); }
  };

  const handleDelete = async (id) => {
    if (!await swalConfirm('Xóa hộp thư này? Cấu hình sẽ mất nhưng email đã nhận vẫn còn.', { title: 'Xóa hộp thư' })) return;
    try {
      await axios.delete(`/api/emails/mailboxes/${id}`);
      addToast?.('Đã xóa hộp thư!');
      fetchMailboxes();
    } catch (err) { addToast?.('Lỗi: ' + (err.response?.data?.error || err.message), 'error'); }
  };

  const filtered = mailboxes.filter(m =>
    (m.email_address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.user_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = mailboxes.filter(m => m.is_active).length;
  const personalCount = mailboxes.filter(m => m.mailbox_type === 'personal').length;
  const sharedCount = mailboxes.filter(m => m.mailbox_type !== 'personal').length;

  return (
    <div style={STYLES.page}>
      {/* Header */}
      <div style={STYLES.header}>
        <div>
          <div style={STYLES.title}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Settings size={22} color="#fff" />
            </div>
            Cài đặt Hộp Thư
          </div>
          <p style={STYLES.subtitle}>Quản lý địa chỉ email nhận/gửi và phân quyền cho nhân sự</p>
        </div>
        <button style={STYLES.btnPrimary} onClick={() => openModal()} onMouseEnter={e => e.target.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.target.style.transform = 'none'}>
          <Plus size={18} /> Thêm Hộp Thư
        </button>
      </div>

      {/* Stats Cards */}
      {mailboxes.length > 0 && (
        <div style={STYLES.infoRow}>
          <div style={STYLES.infoCard('linear-gradient(135deg, #ede9fe, #e0e7ff)')}>
            <div style={STYLES.infoIcon('rgba(99,102,241,0.15)')}><Inbox size={20} color="#6366f1" /></div>
            <div><div style={{ fontSize: '24px', fontWeight: '800', color: '#4338ca' }}>{mailboxes.length}</div><div style={{ fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>Tổng hộp thư</div></div>
          </div>
          <div style={STYLES.infoCard('linear-gradient(135deg, #ecfdf5, #d1fae5)')}>
            <div style={STYLES.infoIcon('rgba(16,185,129,0.15)')}><CheckCircle size={20} color="#059669" /></div>
            <div><div style={{ fontSize: '24px', fontWeight: '800', color: '#047857' }}>{activeCount}</div><div style={{ fontSize: '12px', color: '#059669', fontWeight: '500' }}>Đang hoạt động</div></div>
          </div>
          <div style={STYLES.infoCard('linear-gradient(135deg, #fff7ed, #ffedd5)')}>
            <div style={STYLES.infoIcon('rgba(234,88,12,0.15)')}><Users size={20} color="#ea580c" /></div>
            <div><div style={{ fontSize: '24px', fontWeight: '800', color: '#c2410c' }}>{personalCount} / {sharedCount}</div><div style={{ fontSize: '12px', color: '#ea580c', fontWeight: '500' }}>Cá nhân / Chung</div></div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div style={STYLES.card}>
        {mailboxes.length > 0 && (
          <div style={STYLES.searchWrap}>
            <Search size={16} color="#94a3b8" />
            <input style={STYLES.searchInput} placeholder="Tìm theo email, tên hiển thị, người quản lý..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>
        )}

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>Đang tải...</div>
        ) : mailboxes.length === 0 ? (
          /* Empty State — Setup CTA */
          <div style={STYLES.emptyWrap}>
            <div style={STYLES.emptyIcon}><Mail size={36} color="#6366f1" /></div>
            <div style={STYLES.emptyTitle}>Chưa có hộp thư nào</div>
            <div style={STYLES.emptyDesc}>
              Thêm hộp thư email đầu tiên để bắt đầu nhận và quản lý email trực tiếp trong CRM. Mỗi hộp thư có thể gán cho một nhân sự cụ thể.
            </div>
            <button style={{ ...STYLES.btnPrimary, padding: '14px 32px', fontSize: '15px' }} onClick={() => openModal()}>
              <Plus size={20} /> Thiết lập hộp thư đầu tiên
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={STYLES.th}>Địa chỉ Email</th>
                <th style={STYLES.th}>Người quản lý</th>
                <th style={STYLES.th}>Tên hiển thị</th>
                <th style={STYLES.th}>Loại</th>
                <th style={{ ...STYLES.th, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ ...STYLES.th, textAlign: 'center', width: '90px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id} style={{ transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary, #f8fafc)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ ...STYLES.td, fontWeight: '600' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="#6366f1" /> {m.email_address}
                    </div>
                  </td>
                  <td style={STYLES.td}>
                    {m.user_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={STYLES.avatar()}>{m.user_name.charAt(0).toUpperCase()}</div>
                        {m.user_name}
                      </div>
                    ) : <span style={STYLES.badge('gray')}>Chưa gán</span>}
                  </td>
                  <td style={STYLES.td}>{m.display_name || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                  <td style={STYLES.td}><span style={STYLES.badge('gray')}>{m.mailbox_type === 'personal' ? '👤 Cá nhân' : m.mailbox_type === 'shared' ? '👥 Chung' : '⚙️ Hệ thống'}</span></td>
                  <td style={{ ...STYLES.td, textAlign: 'center' }}>
                    {m.is_active ? <span style={STYLES.badge('green')}><CheckCircle size={12} /> Hoạt động</span> : <span style={STYLES.badge('red')}><XCircle size={12} /> Tạm khóa</span>}
                  </td>
                  <td style={{ ...STYLES.td, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button style={STYLES.btnIcon} onClick={() => openModal(m)} title="Sửa" onMouseEnter={e => e.target.style.background = '#ede9fe'} onMouseLeave={e => e.target.style.background = 'none'}><Edit2 size={15} color="#6366f1" /></button>
                      <button style={STYLES.btnIcon} onClick={() => handleDelete(m.id)} title="Xóa" onMouseEnter={e => e.target.style.background = '#fee2e2'} onMouseLeave={e => e.target.style.background = 'none'}><Trash2 size={15} color="#ef4444" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={STYLES.overlay} onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div style={STYLES.modal} onClick={e => e.stopPropagation()}>
            <div style={STYLES.modalHeader}>
              <div style={STYLES.modalTitle}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mail size={16} color="#fff" /></div>
                {editingId ? 'Chỉnh sửa hộp thư' : 'Thiết lập hộp thư mới'}
              </div>
              <button style={{ ...STYLES.btnIcon, padding: '4px' }} onClick={() => setShowModal(false)}><X size={20} color="#94a3b8" /></button>
            </div>
            <form onSubmit={handleSave}>
              <div style={STYLES.modalBody}>
                <div style={STYLES.formGroup}>
                  <label style={STYLES.label}>Địa chỉ Email <span style={{ color: '#ef4444' }}>*</span></label>
                  <input style={{ ...STYLES.input, ...(editingId ? { background: '#f1f5f9', cursor: 'not-allowed' } : {}) }} type="email" required value={formData.email_address} onChange={e => setFormData({ ...formData, email_address: e.target.value })} placeholder="vd: quynhphuong.bu1@fittour.vn" disabled={!!editingId} onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }} onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                  {!editingId && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>⚠️ Không thể đổi địa chỉ sau khi tạo</div>}
                </div>

                <div style={STYLES.formGroup}>
                  <label style={STYLES.label}>Gán cho nhân sự</label>
                  <select style={STYLES.input} value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })}>
                    <option value="">— Dùng chung / Không gán —</option>
                    {users?.map(u => <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.email})</option>)}
                  </select>
                </div>

                <div style={STYLES.formGroup}>
                  <label style={STYLES.label}>Tên hiển thị khi gửi mail</label>
                  <input style={STYLES.input} value={formData.display_name} onChange={e => setFormData({ ...formData, display_name: e.target.value })} placeholder="vd: FIT Tour Support" onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }} onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <div style={STYLES.row}>
                  <div style={STYLES.formGroup}>
                    <label style={STYLES.label}>Loại hộp thư</label>
                    <select style={STYLES.input} value={formData.mailbox_type} onChange={e => setFormData({ ...formData, mailbox_type: e.target.value })}>
                      <option value="personal">👤 Cá nhân</option>
                      <option value="shared">👥 Dùng chung</option>
                      <option value="system">⚙️ Hệ thống</option>
                    </select>
                  </div>
                  <div style={STYLES.formGroup}>
                    <label style={STYLES.label}>Giới hạn gửi / phút</label>
                    <input style={STYLES.input} type="number" min="1" max="100" value={formData.max_send_per_minute} onChange={e => setFormData({ ...formData, max_send_per_minute: parseInt(e.target.value) || 10 })} onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }} onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>

                <div style={STYLES.formGroup}>
                  <label style={STYLES.label}>Chữ ký email</label>
                  <textarea style={{ ...STYLES.input, resize: 'vertical', minHeight: '70px' }} rows="3" value={formData.signature} onChange={e => setFormData({ ...formData, signature: e.target.value })} placeholder="Trân trọng,&#10;[Tên của bạn]" onFocus={e => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }} onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '12px 14px', borderRadius: '10px', background: formData.is_active ? '#ecfdf5' : '#fef2f2', border: `1px solid ${formData.is_active ? '#a7f3d0' : '#fecaca'}`, transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: '#6366f1', cursor: 'pointer' }} />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: formData.is_active ? '#059669' : '#dc2626' }}>{formData.is_active ? '✓ Hộp thư đang hoạt động' : '✕ Hộp thư bị tạm khóa'}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>{formData.is_active ? 'Nhận và gửi email bình thường' : 'Tạm ngưng nhận email mới'}</div>
                  </div>
                </label>
              </div>
              <div style={STYLES.modalFooter}>
                <button type="button" style={STYLES.btnSecondary} onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" style={STYLES.btnPrimary}><Save size={16} /> {editingId ? 'Lưu thay đổi' : 'Tạo hộp thư'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailMailboxesTab;
