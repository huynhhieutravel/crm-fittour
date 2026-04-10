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
  const [allowedRoles, setAllowedRoles] = useState([]);

  useEffect(() => {
    if (show) {
      axios.get('/api/users/allowed-roles')
        .then(res => setAllowedRoles(res.data))
        .catch(err => console.error("Error fetching allowed roles:", err));
    }
  }, [show]);

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
            <input className="modal-input" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="Ví dụ: nva_sale" />
          </div>
          <div className="modal-form-group">
            <label><Lock size={14} style={{ marginRight: '4px' }}/> MẬT KHẨU *</label>
            <input className="modal-input" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
          </div>
          <div className="modal-form-group">
            <label>HỌ VÀ TÊN *</label>
            <input className="modal-input" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Nguyễn Văn A" />
          </div>
          <div className="modal-form-group">
            <label><Mail size={14} style={{ marginRight: '4px' }}/> SỐ ĐIỆN THOẠI</label>
            <input className="modal-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0901234567" />
          </div>
          <div className="modal-form-group">
            <label><Mail size={14} style={{ marginRight: '4px' }}/> EMAIL</label>
            <input className="modal-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
          </div>
          <div className="modal-form-group">
            <label><Shield size={14} style={{ marginRight: '4px' }}/> PHÂN QUYỀN (ROLE) *</label>
            <select className="modal-select" required value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})}>
              <option value="">-- Chọn quyền --</option>
              {allowedRoles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}><Save size={18} /> LƯU NHÂN VIÊN</button>
            <button type="button" className="btn-pro-cancel" onClick={onClose} style={{ flex: 1 }}><LogOut size={18} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ</button>
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
    full_name: '', email: '', phone: '', role_id: '', is_active: true, permissions: {},
    birth_date: '', gender: '', id_card: '', passport_url: '', id_expiry: '', address: '', facebook_url: '', created_at: '', position: '', avatar_url: ''
  });
  const [activeTab, setActiveTab] = useState('personal');
  const [uploadingPassport, setUploadingPassport] = useState(false);

  const MODULES_MAP = [
    { key: 'leads', label: 'Lead Marketing', group: 'Tour Lẻ (FIT)' },
    { key: 'tours', label: 'Sản phẩm Tour', group: 'Tour Lẻ (FIT)' },
    { key: 'departures', label: 'Khởi hành', group: 'Tour Lẻ (FIT)' },
    { key: 'guides', label: 'Hướng dẫn viên', group: 'Tour Lẻ (FIT)' },
    { key: 'customers', label: 'Khách hàng', group: 'Tour Lẻ (FIT)' },
    { key: 'bookings', label: 'Bán hàng/Booking', group: 'Tour Lẻ (FIT)' },
    { key: 'users', label: 'Nhân sự', group: 'Tour Lẻ (FIT)' },
    { key: 'group_hotels', label: 'NCC Khách sạn Đoàn', group: 'Tour Đoàn 🔒' },
    { key: 'group_restaurants', label: 'NCC Nhà hàng Đoàn', group: 'Tour Đoàn 🔒' },
    { key: 'group_transports', label: 'NCC Nhà xe Đoàn', group: 'Tour Đoàn 🔒' },
    { key: 'group_tickets', label: 'NCC Vé TQ Đoàn', group: 'Tour Đoàn 🔒' },
    { key: 'group_airlines', label: 'NCC Hãng bay Đoàn', group: 'Tour Đoàn 🔒' },
    { key: 'group_landtours', label: 'NCC Land Tour Đoàn', group: 'Tour Đoàn 🔒' },
    { key: 'group_insurances', label: 'NCC Bảo Hiểm Đoàn', group: 'Tour Đoàn 🔒' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '', email: user.email || '', phone: user.phone || '',
        role_id: user.role_id || '', is_active: user.is_active !== false, permissions: user.permissions || {},
        birth_date: user.birth_date ? user.birth_date.split('T')[0] : '',
        gender: user.gender || '', id_card: user.id_card || '',
        passport_url: user.passport_url || '',
        id_expiry: user.id_expiry ? user.id_expiry.split('T')[0] : '',
        address: user.address || '', facebook_url: user.facebook_url || '',
        created_at: user.created_at ? user.created_at.split('T')[0] : '',
        position: user.position || '', avatar_url: user.avatar_url || ''
      });
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e) => { e.preventDefault(); onSave(user.id, formData); };

  const handleUploadAvatar = async (file) => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post('/api/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data?.url) setFormData(p => ({ ...p, avatar_url: res.data.url }));
    } catch (err) { alert('Lỗi tải lên: ' + (err.response?.data?.message || err.message)); }
  };

  const handleUploadPassport = async (file) => {
    if (!file) return;
    setUploadingPassport(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post('/api/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data?.url) setFormData(p => ({ ...p, passport_url: res.data.url }));
    } catch (err) { alert('Lỗi tải lên: ' + (err.response?.data?.message || err.message)); }
    finally { setUploadingPassport(false); }
  };

  const grouped = MODULES_MAP.reduce((acc, mod) => { if (!acc[mod.group]) acc[mod.group] = []; acc[mod.group].push(mod); return acc; }, {});

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Header Profile Summary */}
          {user ? (
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                width: '64px', height: '64px', borderRadius: '16px', background: formData.avatar_url ? `url(${formData.avatar_url}) center/cover no-repeat` : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#64748b'
              }}>
                {!formData.avatar_url && user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#1e293b' }}>{user.full_name}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.85rem', color: '#64748b' }}>
                  <span>@{user.username}</span>
                  <span>•</span>
                  <span>{user.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.1rem' }}>
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{user.full_name}</h2>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>@{user.username} • {user.role_name?.toUpperCase()}</div>
              </div>
            </div>
          )}
          <button className="icon-btn" onClick={onClose}><X size={22} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem' }}>
          {[{ id: 'personal', label: '👤 Thông tin cá nhân' }, { id: 'permissions', label: '🔐 Phân quyền' }].map(tab => (
            <button type="button" key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ background: 'none', border: 'none', padding: '0.8rem 1rem', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent' }}
            >{tab.label}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'personal' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>TÊN ĐĂNG NHẬP (KHÔNG THỂ SỬA)</label>
                <input className="modal-input" disabled value={user.username} style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
              </div>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>HỌ VÀ TÊN *</label>
                <input className="modal-input" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>SỐ ĐIỆN THOẠI</label>
                <input className="modal-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="090..." />
              </div>
              <div className="modal-form-group">
                <label>EMAIL</label>
                <input className="modal-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              {/* Ảnh đại diện */}
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>ẢNH ĐẠI DIỆN 1:1 (AVATAR)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="modal-input" disabled value={formData.avatar_url} placeholder="Đường dẫn..." style={{ flex: 1 }} />
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    📷 Tải lên
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleUploadAvatar(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="modal-form-group">
                <label>NGÀY SINH</label>
                <input className="modal-input" type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>GIỚI TÍNH</label>
                <select className="modal-select" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">-- Giới tính --</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div className="modal-form-group">
                <label>CCCD / PASSPORT</label>
                <input className="modal-input" value={formData.id_card} onChange={e => setFormData({...formData, id_card: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY HẾT HẠN PASSPORT</label>
                <input className="modal-input" type="date" value={formData.id_expiry} onChange={e => setFormData({...formData, id_expiry: e.target.value})} />
              </div>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  ẢNH HỘ CHIẾU / CCCD
                  {formData.passport_url && <a href={formData.passport_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.85rem' }}>👁️ Xem</a>}
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="modal-input" placeholder="URL ảnh..." value={formData.passport_url} onChange={e => setFormData({...formData, passport_url: e.target.value})} style={{ flex: 1 }} />
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                    {uploadingPassport ? 'Đang up...' : '📷 Tải lên'}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleUploadPassport(e.target.files[0])} />
                  </label>
                </div>
              </div>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>ĐỊA CHỈ</label>
                <input className="modal-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Địa chỉ chi tiết..." />
              </div>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>🔗 LINK FACEBOOK</label>
                <input className="modal-input" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} placeholder="https://facebook.com/..." />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>📅 NGÀY GIA NHẬP</label>
                  <input className="modal-input" type="date" value={formData.created_at} onChange={e => setFormData({...formData, created_at: e.target.value})} />
                </div>
                <div className="modal-form-group">
                  <label>💼 CHỨC VỤ BÊN NGOÀI</label>
                  <select className="modal-select" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>
                    <option value="">-- Chọn chức vụ --</option>
                    <option value="Giám Đốc">Giám Đốc</option>
                    <option value="Phó Giám Đốc">Phó Giám Đốc</option>
                    <option value="Trưởng Phòng">Trưởng Phòng</option>
                    <option value="Nhân Viên">Nhân Viên</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>PHÂN QUYỀN GỐC (ROLE HỆ THỐNG) *</label>
                  <select className="modal-select" required value={formData.role_id} onChange={e => setFormData({...formData, role_id: e.target.value})}>
                    {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="modal-form-group">
                  <label>TRẠNG THÁI</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                    <div onClick={() => setFormData({...formData, is_active: !formData.is_active})} style={{ width: '44px', height: '24px', borderRadius: '12px', background: formData.is_active ? '#22c55e' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '2px', left: formData.is_active ? '22px' : '2px', transition: '0.3s' }} />
                    </div>
                    <span style={{ fontWeight: 600, color: formData.is_active ? '#22c55e' : '#64748b' }}>{formData.is_active ? 'Đang hoạt động' : 'Tạm dừng'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>*Tick để ghi đè (thêm/bớt) quyền cho riêng nhân sự này.</p>
              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead style={{ background: '#f8fafc' }}><tr><th style={{ textAlign: 'left' }}>MODULE</th><th style={{ textAlign: 'center' }}>XEM</th><th style={{ textAlign: 'center' }}>THÊM</th><th style={{ textAlign: 'center' }}>SỬA</th><th style={{ textAlign: 'center' }}>XÓA</th></tr></thead>
                <tbody>
                  {Object.entries(grouped).map(([groupName, mods]) => (
                    <React.Fragment key={groupName}>
                      <tr><td colSpan="5" style={{ background: groupName.includes('Đoàn') ? '#fef3c7' : '#e0f2fe', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', padding: '8px 12px', color: groupName.includes('Đoàn') ? '#92400e' : '#0369a1' }}>{groupName}</td></tr>
                      {mods.map(mod => {
                        const p = formData.permissions[mod.key] || { can_view: false, can_create: false, can_edit: false, can_delete: false };
                        const togglePerm = (action) => setFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [mod.key]: { ...p, [action]: !p[action] } } }));
                        return (
                          <tr key={mod.key}>
                            <td style={{ fontWeight: 600, paddingLeft: '20px' }}>{mod.label}</td>
                            <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_view} onChange={() => togglePerm('can_view')} /></td>
                            <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_create} onChange={() => togglePerm('can_create')} /></td>
                            <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_edit} onChange={() => togglePerm('can_edit')} /></td>
                            <td style={{ textAlign: 'center' }}><input type="checkbox" checked={p.can_delete} onChange={() => togglePerm('can_delete')} /></td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
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
          <input className="modal-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nhập mật khẩu mới..." />
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn-pro-save" style={{ flex: 1 }} onClick={() => { onSave(user.id, newPassword); setNewPassword(''); }}>XÁC NHẬN ĐỔI</button>
          <button className="btn-pro-cancel" style={{ flex: 1 }} onClick={onClose}>HỦY</button>
        </div>
      </div>
    </div>
  );
};
