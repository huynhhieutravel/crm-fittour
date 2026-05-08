import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Calendar, MapPin, Shield, Save, ExternalLink, Camera, Clock } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';

const MyProfileTab = ({ currentUser, addToast, onUpdateUser }) => {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPassport, setUploadingPassport] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/users/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfile(res.data);
      setFormData({
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        birth_date: res.data.birth_date ? new Date(res.data.birth_date).toLocaleDateString('en-CA') : '',
        gender: res.data.gender || '',
        id_card: res.data.id_card || '',
        passport_url: res.data.passport_url || '',
        id_expiry: res.data.id_expiry ? new Date(res.data.id_expiry).toLocaleDateString('en-CA') : '',
        address: res.data.address || '',
        facebook_url: res.data.facebook_url || '',
        created_at: res.data.created_at ? new Date(res.data.created_at).toLocaleDateString('en-CA') : '',
        position: res.data.position || '',
        avatar_url: res.data.avatar_url || ''
      });
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/users/me', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      addToast?.('Đã cập nhật hồ sơ cá nhân thành công!');
      fetchProfile();
      if (onUpdateUser) {
        onUpdateUser(formData);
      }
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post('/api/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data?.url) {
        const newUrl = res.data.url;
        setFormData(p => ({ ...p, avatar_url: newUrl }));
        setProfile(p => ({ ...p, avatar_url: newUrl }));
        
        // Auto-save immediately
        await axios.put('/api/users/me', { ...formData, avatar_url: newUrl }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (onUpdateUser) {
          onUpdateUser({ avatar_url: newUrl });
        }
        addToast?.('Đã thay đổi ảnh đại diện!');
      }
    } catch (err) {
      alert('Lỗi tải ảnh: ' + (err.response?.data?.message || err.message));
    }
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
      if (res.data?.url) {
        const newUrl = res.data.url;
        setFormData(p => ({ ...p, passport_url: newUrl }));
        
        // Auto-save immediately
        await axios.put('/api/users/me', { ...formData, passport_url: newUrl }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        addToast?.('Đã tải lên ảnh hộ chiếu!');
      }
    } catch (err) {
      alert('Lỗi tải lên: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploadingPassport(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Đang tải...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>Không tải được hồ sơ</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Profile Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)',
        borderRadius: '16px', padding: '2rem', color: '#fff', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 8px 32px rgba(37, 99, 235, 0.3)'
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '20px',
          background: profile.avatar_url ? `url(${profile.avatar_url}) center/cover no-repeat` : 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', fontWeight: 800, border: '2px solid rgba(255,255,255,0.3)',
          overflow: 'hidden'
        }}>
          {!profile.avatar_url && profile.full_name?.charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>{profile.full_name}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px', opacity: 0.9 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
              <User size={14} /> @{profile.username}
            </span>
            <span style={{ padding: '2px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              {profile.position || profile.role_name}
            </span>
          </div>
          {(profile.teams || []).length > 0 && (
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
              {profile.teams.map(t => (
                <span key={t.id} style={{ padding: '3px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.15)', fontSize: '0.7rem', fontWeight: 600 }}>
                  {t.name}
                </span>
              ))}
            </div>
          )}
          <div style={{ marginTop: '12px' }}>
            <a 
              href={`${window.location.hostname === 'localhost' ? 'http://localhost:5001' : 'https://erp.fittour.vn'}/api/auth/google?sync_token=${localStorage.getItem('token')}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px',
                background: profile.google_email ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.2)', 
                borderRadius: '8px', 
                color: profile.google_email ? '#a7f3d0' : 'white',
                fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
                border: `1px solid ${profile.google_email ? 'rgba(16, 185, 129, 0.5)' : 'rgba(255,255,255,0.3)'}`, 
                transition: 'all 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = profile.google_email ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.3)'}
              onMouseOut={e => e.currentTarget.style.background = profile.google_email ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.2)'}
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '14px', height: '14px' }} />
              {profile.google_email ? 'Đã liên kết Gmail' : 'Đồng bộ Gmail'}
            </a>
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: '0.75rem', opacity: 0.7 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
            <Clock size={12} /> Gia nhập: {new Date(profile.created_at).toLocaleDateString('vi-VN')}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave}>
        <div style={{
          background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
          padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="#3b82f6" /> Thông tin cá nhân
          </h3>

          <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
              <label>HỌ VÀ TÊN</label>
              <input className="modal-input" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} style={{ fontWeight: 700 }} />
            </div>
            
            <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
              <label>ẢNH ĐẠI DIỆN (AVATAR) - Tỷ lệ vuông 1:1</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input className="modal-input" disabled value={formData.avatar_url || ''} placeholder="Đường dẫn ảnh..." style={{ flex: 1 }} />
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0.6rem 1rem', background: '#e0e7ff', color: '#4338ca', fontWeight: 600, borderRadius: '8px', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                  📸 Tải ảnh lên
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadAvatar} />
                </label>
              </div>
            </div>

            <div className="modal-form-group">
              <label><Phone size={13} style={{ marginRight: '4px' }} /> SỐ ĐIỆN THOẠI</label>
              <input className="modal-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="090..." />
            </div>
            <div className="modal-form-group">
              <label><Mail size={13} style={{ marginRight: '4px' }} /> EMAIL</label>
              <input className="modal-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className="modal-form-group">
              <label><Calendar size={13} style={{ marginRight: '4px' }} /> NGÀY SINH</label>
              <DatePicker
                selected={formData.birth_date ? new Date(formData.birth_date) : null}
                onChange={date => setFormData({...formData, birth_date: date ? format(date, 'yyyy-MM-dd') : ''})}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="modal-input"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                isClearable
                autoComplete="off"
              />
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
              <label>💼 CHỨC VỤ (EXTERNAL)</label>
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
            <div className="modal-form-group">
              <label><Clock size={13} style={{ marginRight: '4px' }} /> NGÀY GIA NHẬP CÔNG TY</label>
              <DatePicker
                selected={formData.created_at ? new Date(formData.created_at) : null}
                onChange={date => setFormData({...formData, created_at: date ? format(date, 'yyyy-MM-dd') : ''})}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="modal-input"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                isClearable
                autoComplete="off"
              />
            </div>

            <div className="modal-form-group">
              <label><Shield size={13} style={{ marginRight: '4px' }} /> CCCD / PASSPORT</label>
              <input className="modal-input" value={formData.id_card} onChange={e => setFormData({...formData, id_card: e.target.value})} />
            </div>
            <div className="modal-form-group">
              <label>NGÀY HẾT HẠN PASSPORT</label>
              <DatePicker
                selected={formData.id_expiry ? new Date(formData.id_expiry) : null}
                onChange={date => setFormData({...formData, id_expiry: date ? format(date, 'yyyy-MM-dd') : ''})}
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="modal-input"
                showYearDropdown
                showMonthDropdown
                dropdownMode="select"
                isClearable
                autoComplete="off"
              />
            </div>

            <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <Camera size={13} style={{ marginRight: '4px' }} /> ẢNH HỘ CHIẾU / CCCD
                {formData.passport_url && <a href={formData.passport_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.85rem' }}>👁️ Xem ảnh</a>}
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input className="modal-input" placeholder="URL ảnh..." value={formData.passport_url} onChange={e => setFormData({...formData, passport_url: e.target.value})} style={{ flex: 1 }} />
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 12px', borderRadius: '6px', border: '1px solid #cbd5e1', whiteSpace: 'nowrap', fontSize: '0.85rem', background: '#f8fafc' }}>
                  {uploadingPassport ? 'Đang up...' : '📷 Tải lên'}
                  <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleUploadPassport(e.target.files[0])} />
                </label>
              </div>
            </div>

            <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
              <label><MapPin size={13} style={{ marginRight: '4px' }} /> ĐỊA CHỈ</label>
              <input className="modal-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Địa chỉ chi tiết..." />
            </div>

            <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <ExternalLink size={13} style={{ marginRight: '4px' }} /> LINK FACEBOOK
                {formData.facebook_url && <a href={formData.facebook_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.85rem' }}>↗ Mở trang</a>}
              </label>
              <input className="modal-input" value={formData.facebook_url} onChange={e => setFormData({...formData, facebook_url: e.target.value})} placeholder="https://facebook.com/..." />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
            <button type="submit" className="btn-pro-save" disabled={saving} style={{ width: 'auto', padding: '0.75rem 2rem', opacity: saving ? 0.7 : 1 }}>
              <Save size={16} /> {saving ? 'Đang lưu...' : 'LƯU THAY ĐỔI'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MyProfileTab;
