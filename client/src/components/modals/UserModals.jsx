import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save, LogOut, Shield, Mail, User, Lock, Trash2 } from 'lucide-react';
import axios from 'axios';

export const AddUserModal = ({ 
  show, 
  onClose, 
  onSave, 
  roles 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    role_id: ''
  });

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    setFormData({ username: '', password: '', full_name: '', email: '', phone: '', role_id: '' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '500px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
          <div style={{ padding: '8px', background: 'var(--secondary-light)', borderRadius: '10px', color: 'var(--secondary)' }}>
            <UserPlus size={20} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Thêm Nhân Viên Mới</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="modal-form-group">
            <label><User size={14} style={{ marginRight: '4px' }}/> TÊN ĐĂNG NHẬP *</label>
            <input 
              className="modal-input" 
              required 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              placeholder="Ví dụ: nva_sale"
            />
          </div>
          <div className="modal-form-group">
            <label><Lock size={14} style={{ marginRight: '4px' }}/> MẬT KHẨU *</label>
            <input 
              className="modal-input" 
              type="password"
              required 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              placeholder="••••••••"
            />
          </div>
          <div className="modal-form-group">
            <label>HỌ VÀ TÊN *</label>
            <input 
              className="modal-input" 
              required 
              value={formData.full_name} 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div className="modal-form-group">
            <label><Mail size={14} style={{ marginRight: '4px' }}/> SỐ ĐIỆN THOẠI</label>
            <input 
              className="modal-input" 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              placeholder="0901234567"
            />
          </div>
          <div className="modal-form-group">
            <label><Mail size={14} style={{ marginRight: '4px' }}/> EMAIL</label>
            <input 
              className="modal-input" 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              placeholder="email@example.com"
            />
          </div>
          <div className="modal-form-group">
            <label><Shield size={14} style={{ marginRight: '4px' }}/> PHÂN QUYỀN (ROLE) *</label>
            <select 
              className="modal-select" 
              required
              value={formData.role_id} 
              onChange={e => setFormData({...formData, role_id: e.target.value})}
            >
              <option value="">-- Chọn quyền --</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>
              <Save size={18} /> LƯU NHÂN VIÊN
            </button>
            <button type="button" className="btn-pro-cancel" onClick={onClose} style={{ flex: 1 }}>
              <LogOut size={18} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditUserModal = ({ 
  user, 
  onClose, 
  onSave, 
  roles 
}) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    role_id: '',
    is_active: true,
    permissions: {}
  });

  const MODULES_MAP = [
    { key: 'leads', label: 'Lead Marketing' },
    { key: 'tours', label: 'Sản phẩm Tour' },
    { key: 'departures', label: 'Khởi hành' },
    { key: 'guides', label: 'Hướng dẫn viên' },
    { key: 'customers', label: 'Khách hàng' },
    { key: 'bookings', label: 'Bán hàng/Booking' },
    { key: 'users', label: 'Nhân sự' }
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
        role_id: user.role_id || '',
        is_active: user.is_active !== false,
        permissions: user.permissions || {}
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Chỉnh Sửa Nhân Sự & Phân Quyền</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <div className="modal-form-group">
            <label>TÊN ĐĂNG NHẬP (KHÔNG THỂ SỬA)</label>
            <input className="modal-input" disabled value={user.username} style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
          </div>
          <div className="modal-form-group">
            <label>HỌ VÀ TÊN *</label>
            <input 
              className="modal-input" 
              required 
              value={formData.full_name} 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label>SỐ ĐIỆN THOẠI</label>
              <input 
                className="modal-input" 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
            <div className="modal-form-group">
              <label>EMAIL</label>
              <input 
                className="modal-input" 
                type="email"
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label>PHÂN QUYỀN GỐC (ROLE) *</label>
              <select 
                className="modal-select" 
                required
                value={formData.role_id} 
                onChange={e => setFormData({...formData, role_id: e.target.value})}
              >
                {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="modal-form-group">
              <label>TRẠNG THÁI HOẠT ĐỘNG</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                <div 
                  onClick={() => setFormData({...formData, is_active: !formData.is_active})}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', background: formData.is_active ? '#22c55e' : '#cbd5e1',
                    position: 'relative', cursor: 'pointer', transition: '0.3s'
                  }}
                >
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '2px', left: formData.is_active ? '22px' : '2px', transition: '0.3s'
                  }} />
                </div>
                <span style={{ fontWeight: 600, color: formData.is_active ? '#22c55e' : '#64748b' }}>
                  {formData.is_active ? 'Đang hoạt động' : 'Tạm dừng (Vô hiệu hóa)'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>BẢNG MA TRẬN QUYỀN</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>*Tick để ghi đè (thêm/bớt) quyền cho riêng nhân sự này so với quyền gốc mặc định.</p>
            <table className="data-table" style={{ fontSize: '0.85rem' }}>
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ textAlign: 'left' }}>MODULE</th>
                  <th style={{ textAlign: 'center' }}>XEM</th>
                  <th style={{ textAlign: 'center' }}>THÊM MỚI</th>
                  <th style={{ textAlign: 'center' }}>SỬA</th>
                  <th style={{ textAlign: 'center' }}>XÓA</th>
                </tr>
              </thead>
              <tbody>
                {MODULES_MAP.map(mod => {
                  const p = formData.permissions[mod.key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
                  const togglePerm = (action) => {
                    setFormData(prev => ({
                      ...prev,
                      permissions: {
                        ...prev.permissions,
                        [mod.key]: {
                          ...p,
                          [action]: !p[action]
                        }
                      }
                    }));
                  };
                  return (
                    <tr key={mod.key}>
                      <td style={{ fontWeight: 600 }}>{mod.label}</td>
                      <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_view} onChange={() => togglePerm('can_view')} /></td>
                      <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_create} onChange={() => togglePerm('can_create')} /></td>
                      <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_edit} onChange={() => togglePerm('can_edit')} /></td>
                      <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_delete} onChange={() => togglePerm('can_delete')} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>CẬP NHẬT</button>
            <button type="button" className="btn-pro-cancel" onClick={onClose} style={{ flex: 1 }}>HỦY</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ChangePasswordModal = ({ 
  user, 
  onClose, 
  onSave 
}) => {
  const [newPassword, setNewPassword] = useState('');

  if (!user) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '400px' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '50px', height: '50px', background: '#fef3c7', color: '#d97706', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Đổi Mật Khẩu</h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Cho người dùng: <strong>{user.username}</strong></p>
        </div>

        <div className="modal-form-group">
          <label>MẬT KHẨU MỚI</label>
          <input 
            className="modal-input" 
            type="password"
            value={newPassword} 
            onChange={e => setNewPassword(e.target.value)} 
            placeholder="Nhập mật khẩu mới..."
          />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            className="btn-pro-save" 
            style={{ flex: 1 }}
            onClick={() => { onSave(user.id, newPassword); setNewPassword(''); }}
          >XÁC NHẬN ĐỔI</button>
          <button className="btn-pro-cancel" style={{ flex: 1 }} onClick={onClose}>HỦY</button>
        </div>
      </div>
    </div>
  );
};
