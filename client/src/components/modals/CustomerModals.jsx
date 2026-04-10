import React, { useState } from 'react';
import axios from 'axios';
import { X, Calendar, MapPin, Users, CheckCircle, Clock, AlertCircle, Award } from 'lucide-react';

// Helper: Tính phân khúc VIP tự động
function computeVipTier(totalTrips) {
    if (totalTrips >= 7) return { label: 'VIP 1', badge: '⭐⭐⭐', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
    if (totalTrips >= 4) return { label: 'VIP 2', badge: '⭐⭐', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
    if (totalTrips >= 3) return { label: 'VIP 3', badge: '⭐', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' };
    if (totalTrips >= 2) return { label: 'Repeat Customer', badge: '🔄', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' };
    return { label: 'New Customer', badge: '🆕', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
}

const DESTINATION_OPTIONS = [
  'Nhật Bản 🇯🇵', 'Hàn Quốc 🇰🇷', 'Trung Quốc 🇨🇳', 'Châu Âu 🇪🇺',
  'Tây Tạng / Nepal 🏔️', 'Trung Á (Kazakhstan, Uzbekistan…) 🏜️',
  'Đông Nam Á (Bali, Thái…) 🌴', 'Nam Mỹ 🌎', 'Trung Đông / Châu Phi 🐫'
];

const EXPERIENCE_OPTIONS = [
  'Ngắm hoa (sakura, tulip…) 🌸', 'Thiên nhiên / cảnh đẹp 🌄',
  'Văn hoá - lịch sử 🏯', 'Tâm linh / hành hương 🙏',
  'Trekking / khám phá 🥾', 'Nghỉ dưỡng / chill 🏖️',
  'Motor Trip 🏍️', 'Road Trip 🚗'
];

const TRAVEL_STYLE_OPTIONS = [
  'Đi gia đình 👨‍👩‍👧‍👦', 'Đi cặp đôi 💑', 'Đi một mình 🚶‍♂️',
  'Đi nhóm bạn 👯‍♂️', 'Công ty / team building 🏢'
];

export const AddCustomerModal = ({ 
  showAddCustomerModal, 
  setShowAddCustomerModal, 
  handleAddCustomer, 
  newCustomer, 
  setNewCustomer,
  CITY_OPTIONS,
  CUSTOMER_ROLES,
  CUSTOMER_SEGMENTS,
  users = []
}) => {
  const [uploadingPassport, setUploadingPassport] = useState(false);

  const handleUploadPassport = async (file) => {
    if (!file) return;
    setUploadingPassport(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.data && res.data.url) {
         setNewCustomer({ ...newCustomer, passport_url: res.data.url });
      }
    } catch (err) {
      alert("Lỗi tải lên ảnh Hộ chiếu! " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingPassport(false);
    }
  };

  if (!showAddCustomerModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>🧾 THÊM KHÁCH HÀNG MỚI</h2>
          <button className="icon-btn" onClick={() => setShowAddCustomerModal(false)}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleAddCustomer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>HỌ TÊN KHÁCH HÀNG (VIẾT HOA) *</label>
            <input className="modal-input" required 
              style={{ textTransform: 'uppercase', fontWeight: 700 }}
              value={newCustomer.name} 
              onChange={e => setNewCustomer({...newCustomer, name: e.target.value.toUpperCase()})} 
              placeholder="VÍ DỤ: NGUYỄN VĂN A"
            />
          </div>

          <div className="modal-form-group">
            <label>SỐ ĐIỆN THOẠI (unique) *</label>
            <input className="modal-input" required value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} placeholder="090..." />
          </div>
          <div className="modal-form-group">
            <label>EMAIL</label>
            <input className="modal-input" type="email" value={newCustomer.email} onChange={e => setNewCustomer({...newCustomer, email: e.target.value})} />
          </div>

          <div className="modal-form-group">
            <label>TRỞ THÀNH KHÁCH TỪ KHI NÀO?</label>
            <input className="modal-input" type="date" value={newCustomer.created_at || new Date().toISOString().split('T')[0]} onChange={e => setNewCustomer({...newCustomer, created_at: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGÀY SINH</label>
            <input className="modal-input" type="date" value={newCustomer.birth_date} onChange={e => setNewCustomer({...newCustomer, birth_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>GIỚI TÍNH</label>
            <select className="modal-select" value={newCustomer.gender} onChange={e => setNewCustomer({...newCustomer, gender: e.target.value})}>
              <option value="">-- Giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>CCCD / PASSPORT</label>
            <input className="modal-input" value={newCustomer.id_card} onChange={e => setNewCustomer({...newCustomer, id_card: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label style={{ display: 'flex', alignItems: 'center' }}>
                ẢNH HỘ CHIẾU / CCCD 
                {newCustomer.passport_url && <a href={newCustomer.passport_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.85rem' }}>👁️ Xem ảnh</a>}
             </label>
             <div style={{ display: 'flex', gap: '8px' }}>
                <input className="modal-input" placeholder="Url ảnh..." value={newCustomer.passport_url || ''} onChange={e => setNewCustomer({...newCustomer, passport_url: e.target.value})} style={{ flex: 1 }} />
                <label className="btn-outline" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 12px', borderRadius: '4px', border: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>
                    {uploadingPassport ? 'Đang up...' : '📷 Tải lên'}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleUploadPassport(e.target.files[0])} />
                </label>
             </div>
          </div>
          <div className="modal-form-group">
            <label>NGÀY HẾT HẠN PASSPORT</label>
            <input className="modal-input" type="date" value={newCustomer.id_expiry} onChange={e => setNewCustomer({...newCustomer, id_expiry: e.target.value})} />
          </div>

          <div className="modal-form-group">
            <label>NƠI ĐANG Ở *</label>
            <select className="modal-select" required value={newCustomer.location_city} onChange={e => setNewCustomer({...newCustomer, location_city: e.target.value})}>
              <option value="">-- Chọn thành phố --</option>
              {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="modal-form-group">
            <label>ĐỊA CHỈ CHI TIẾT</label>
            <input className="modal-input" value={newCustomer.address} onChange={e => setNewCustomer({...newCustomer, address: e.target.value})} />
          </div>

          <div className="modal-form-group">
            <label>QUỐC TỊCH</label>
            <input className="modal-input" value={newCustomer.nationality} onChange={e => setNewCustomer({...newCustomer, nationality: e.target.value})} />
          </div>

          <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Vai trò & Insight</div>

          <div className="modal-form-group">
            <label>VAI TRÒ</label>
            <select className="modal-select" value={newCustomer.role} onChange={e => setNewCustomer({...newCustomer, role: e.target.value})}>
              {CUSTOMER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>


          <div className="modal-form-group">
            <label>NGÀY CHỐT ĐƠN ĐẦU TIÊN</label>
            <input className="modal-input" type="date" value={newCustomer.first_deal_date ? newCustomer.first_deal_date.split('T')[0] : ''} onChange={e => setNewCustomer({...newCustomer, first_deal_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NHÂN VIÊN CHĂM SÓC</label>
            <select className="modal-select" value={newCustomer.assigned_to || ''} onChange={e => setNewCustomer({...newCustomer, assigned_to: e.target.value})}>
              <option value="">-- Chọn nhân viên --</option>
              {users.filter(u => u.is_active !== false).map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role_name})</option>
              ))}
            </select>
          </div>

          <div className="modal-form-group">
            <label>SỞ THÍCH TOUR (Insight)</label>
            <input className="modal-input" value={newCustomer.tour_interests} onChange={e => setNewCustomer({...newCustomer, tour_interests: e.target.value})} placeholder="Trung Quốc, Tây Tạng, Mông Cổ..." />
          </div>
          <div className="modal-form-group">
            <label>THỜI GIAN HAY ĐI (Tháng/Mùa)</label>
            <input className="modal-input" value={newCustomer.travel_season || ''} onChange={e => setNewCustomer({...newCustomer, travel_season: e.target.value})} placeholder="Tháng 10, Mùa Thu..." />
          </div>

          <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Vận hành & Ghi chú</div>

          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>YÊU CẦU ĐẶC BIỆT (Ăn chay, Sức khỏe, Visa...)</label>
            <textarea className="modal-textarea" value={newCustomer.special_requests} onChange={e => setNewCustomer({...newCustomer, special_requests: e.target.value})} placeholder="Ăn chay / dị ứng / cần chăm sóc đặc biệt..." />
          </div>

          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>GHI CHÚ NỘI BỘ (Vũ khí bí mật)</label>
            <textarea className="modal-textarea" value={newCustomer.internal_notes} onChange={e => setNewCustomer({...newCustomer, internal_notes: e.target.value})} placeholder="Tính cách: kỹ tính, khách VIP..." />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>LƯU HỒ SƠ KHÁCH HÀNG</button>
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddCustomerModal(false)}>HỦY</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditCustomerModal = ({
  editingCustomer,
  setEditingCustomer,
  handleUpdateCustomer,
  CITY_OPTIONS,
  CUSTOMER_ROLES,
  CUSTOMER_SEGMENTS,
  newCustomerNote,
  setNewCustomerNote,
  handleAddCustomerNote,
  users = [],
  currentUser = null
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showMiniEventForm, setShowMiniEventForm] = useState(false);
  const [miniEvent, setMiniEvent] = useState({ title: '', event_type: 'CALL', event_date: '', description: '' });
  const [uploadingPassport, setUploadingPassport] = useState(false);

  const handleUploadPassport = async (file) => {
    if (!file) return;
    setUploadingPassport(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post('/api/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.data && res.data.url) {
         setEditingCustomer({ ...editingCustomer, passport_url: res.data.url });
      }
    } catch (err) {
      alert("Lỗi tải lên ảnh Hộ chiếu! " + (err.response?.data?.message || err.message));
    } finally {
      setUploadingPassport(false);
    }
  };

  const handleCreateMiniEvent = async () => {
    if (!miniEvent.title || !miniEvent.event_date) return alert('Vui lòng nhập tên và ngày hẹn báo trước!');
    try {
      await axios.post('/api/customers/events', {
        ...miniEvent,
        customer_id: editingCustomer.id,
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Đã LÊN LỊCH CHĂM SÓC thành công! Lịch sẽ xuất hiện trên màn hình Bảng theo dõi.');
      setShowMiniEventForm(false);
      setMiniEvent({ title: '', event_type: 'CALL', event_date: '', description: '' });
    } catch (err) {
      alert('Lỗi tạo lịch: ' + (err.response?.data?.message || err.message));
    }
  };

  if (!editingCustomer) return null;

  const toggleArrayItem = (field, item) => {
    const currentArray = Array.isArray(editingCustomer[field]) ? editingCustomer[field] : 
                         (typeof editingCustomer[field] === 'string' ? JSON.parse(editingCustomer[field] || '[]') : []);
    if (currentArray.includes(item)) {
      setEditingCustomer({ ...editingCustomer, [field]: currentArray.filter(i => i !== item) });
    } else {
      setEditingCustomer({ ...editingCustomer, [field]: [...currentArray, item] });
    }
  };

  const getArrayValue = (field) => {
      if (Array.isArray(editingCustomer[field])) return editingCustomer[field];
      if (typeof editingCustomer[field] === 'string') {
          try { return JSON.parse(editingCustomer[field] || '[]'); } catch(e) { return []; }
      }
      return [];
  };

  return (
    <div className="modal-overlay" onClick={() => setEditingCustomer(null)} style={{ zIndex: 1050 }}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '800px', 
          width: '100%',
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b' }}>📝 CHỈNH SỬA KHÁCH HÀNG</h2>
          <button type="button" className="icon-btn" onClick={() => setEditingCustomer(null)}><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '0 1.5rem' }}>
          {[
            { id: 'overview', label: 'Tổng quan' },
            { id: 'insight', label: 'Insight' },
            { id: 'history_interaction', label: 'Lịch sử & Tương tác' }
          ].map(tab => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                fontWeight: 600,
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleUpdateCustomer} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>HỌ TÊN KHÁCH HÀNG (VIẾT HOA) *</label>
            <input className="modal-input" required 
              style={{ textTransform: 'uppercase', fontWeight: 700 }}
              value={editingCustomer.name} 
              onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value.toUpperCase()})} 
            />
          </div>

          <div className="modal-form-group">
            <label>SỐ ĐIỆN THOẠI *</label>
            <input className="modal-input" required value={editingCustomer.phone} onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>EMAIL</label>
            <input className="modal-input" type="email" value={editingCustomer.email || ''} onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})} />
          </div>

          <div className="modal-form-group">
            <label>TRỞ THÀNH KHÁCH TỪ KHI NÀO?</label>
            <input className="modal-input" type="date" value={editingCustomer.created_at ? editingCustomer.created_at.split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, created_at: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGÀY SINH</label>
            <input className="modal-input" type="date" value={editingCustomer.birth_date ? editingCustomer.birth_date.split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, birth_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>GIỚI TÍNH</label>
            <select className="modal-select" value={editingCustomer.gender || ''} onChange={e => setEditingCustomer({...editingCustomer, gender: e.target.value})}>
              <option value="">-- Giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>CCCD / PASSPORT</label>
            <input className="modal-input" value={editingCustomer.id_card || ''} onChange={e => setEditingCustomer({...editingCustomer, id_card: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label style={{ display: 'flex', alignItems: 'center' }}>
                ẢNH HỘ CHIẾU / CCCD 
                {editingCustomer.passport_url && <a href={editingCustomer.passport_url} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', marginLeft: '8px', fontSize: '0.85rem' }}>👁️ Xem ảnh</a>}
             </label>
             <div style={{ display: 'flex', gap: '8px' }}>
                <input className="modal-input" placeholder="Url ảnh..." value={editingCustomer.passport_url || ''} onChange={e => setEditingCustomer({...editingCustomer, passport_url: e.target.value})} style={{ flex: 1 }} />
                <label className="btn-outline" style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '0 12px', borderRadius: '4px', border: '1px solid #cbd5e1', whiteSpace: 'nowrap' }}>
                    {uploadingPassport ? 'Đang up...' : '📷 Tải lên'}
                    <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => handleUploadPassport(e.target.files[0])} />
                </label>
             </div>
          </div>
          <div className="modal-form-group">
            <label>NGÀY HẾT HẠN PASSPORT</label>
            <input className="modal-input" type="date" value={editingCustomer.id_expiry ? editingCustomer.id_expiry.split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, id_expiry: e.target.value})} />
          </div>

          <div className="modal-form-group">
            <label>NƠI ĐANG Ở</label>
            <select className="modal-select" value={editingCustomer.location_city || ''} onChange={e => setEditingCustomer({...editingCustomer, location_city: e.target.value})}>
              <option value="">-- Chọn thành phố --</option>
              {CITY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

              <div className="modal-form-group">
                <label>ĐỊA CHỈ CHI TIẾT</label>
                <input className="modal-input" value={editingCustomer.address || ''} onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>QUỐC TỊCH</label>
                <input className="modal-input" value={editingCustomer.nationality || 'Việt Nam'} onChange={e => setEditingCustomer({...editingCustomer, nationality: e.target.value})} />
              </div>
            </div>
          )}

          {activeTab === 'insight' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>VAI TRÒ</label>
                  <select className="modal-select" value={editingCustomer.role || 'booker'} onChange={e => setEditingCustomer({...editingCustomer, role: e.target.value})}>
                    {CUSTOMER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="modal-form-group">
                  <label>PHÂN KHÚC KHÁCH HÀNG</label>
                  {(() => {
                    const pastTrips = parseInt(editingCustomer.past_trip_count || 0);
                    const crmTrips = parseInt(editingCustomer.crm_trip_count || 0);
                    const totalTrips = pastTrips + crmTrips;
                    const tier = computeVipTier(totalTrips);
                    return (
                      <div style={{ padding: '12px', borderRadius: '10px', background: tier.bg, border: `1.5px solid ${tier.border}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <Award size={18} color={tier.color} />
                          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: tier.color }}>{tier.badge} {tier.label}</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                          <div style={{ background: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>Trước CRM</div>
                            {currentUser && ['admin', 'manager'].includes(currentUser.role) ? (
                              <input type="number" min="0" value={pastTrips} onChange={e => setEditingCustomer({...editingCustomer, past_trip_count: parseInt(e.target.value) || 0})} style={{ width: '100%', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '4px', fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', outline: 'none' }} />
                            ) : (
                              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', padding: '4px' }}>{pastTrips}</div>
                            )}
                          </div>
                          <div style={{ background: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>Trong CRM</div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#1e293b', padding: '4px' }}>{crmTrips}</div>
                          </div>
                          <div style={{ background: 'white', padding: '8px', borderRadius: '6px', textAlign: 'center' }}>
                            <div style={{ color: '#94a3b8', fontWeight: 600, marginBottom: '2px' }}>Tổng</div>
                            <div style={{ fontWeight: 800, fontSize: '1.1rem', color: tier.color, padding: '4px' }}>{totalTrips} chuyến</div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                <div className="modal-form-group">
                  <label>NGÀY CHỐT ĐƠN ĐẦU</label>
                  <input className="modal-input" type="date" value={editingCustomer.first_deal_date ? (typeof editingCustomer.first_deal_date === 'string' ? editingCustomer.first_deal_date.split('T')[0] : new Date(editingCustomer.first_deal_date).toISOString().split('T')[0]) : ''} onChange={e => setEditingCustomer({...editingCustomer, first_deal_date: e.target.value})} />
                </div>
                <div className="modal-form-group">
                  <label>NHÂN VIÊN CHĂM SÓC</label>
                  <select className="modal-select" value={editingCustomer.assigned_to || ''} onChange={e => setEditingCustomer({...editingCustomer, assigned_to: e.target.value})}>
                    <option value="">-- Chọn nhân viên --</option>
                    {users.filter(u => u.is_active !== false).map(u => (
                      <option key={u.id} value={u.id}>{u.username} ({u.role_name})</option>
                    ))}
                  </select>
                </div>
              </div>



              {/* TRẢI NGHIỆM */}
              <div className="modal-form-group">
                <label>TRẢI NGHIỆM ĐỀ CAO</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {EXPERIENCE_OPTIONS.map(opt => {
                    const isSelected = getArrayValue('experiences').includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleArrayItem('experiences', opt)}
                        style={{
                          padding: '6px 12px', borderRadius: '20px',
                          border: isSelected ? '1px solid #10b981' : '1px solid #e2e8f0',
                          background: isSelected ? '#ecfdf5' : '#f8fafc',
                          color: isSelected ? '#047857' : '#475569',
                          fontSize: '0.8rem', fontWeight: isSelected ? 600 : 500, cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                  {getArrayValue('experiences').filter(d => !EXPERIENCE_OPTIONS.includes(d)).map(opt => (
                     <button type="button" key={opt} onClick={() => toggleArrayItem('experiences', opt)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #10b981', background: '#ecfdf5', color: '#047857', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                       {opt} ✕
                     </button>
                  ))}
                  <input 
                    type="text" placeholder="+ Khác..."
                    style={{ padding: '6px 12px', borderRadius: '20px', border: '1px dashed #cbd5e1', fontSize: '0.8rem', background: 'transparent', outline: 'none', width: '100px' }}
                    onKeyDown={e => {
                      if(e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        toggleArrayItem('experiences', e.target.value.trim()); e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* KIỂU ĐI */}
              <div className="modal-form-group">
                <label>KIỂU ĐI / NHÓM</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TRAVEL_STYLE_OPTIONS.map(opt => {
                    const isSelected = getArrayValue('travel_styles').includes(opt);
                    return (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => toggleArrayItem('travel_styles', opt)}
                        style={{
                          padding: '6px 12px', borderRadius: '20px',
                          border: isSelected ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                          background: isSelected ? '#fffbeb' : '#f8fafc',
                          color: isSelected ? '#b45309' : '#475569',
                          fontSize: '0.8rem', fontWeight: isSelected ? 600 : 500, cursor: 'pointer'
                        }}
                      >
                        {opt}
                      </button>
                    );
                  })}
                  {getArrayValue('travel_styles').filter(d => !TRAVEL_STYLE_OPTIONS.includes(d)).map(opt => (
                     <button type="button" key={opt} onClick={() => toggleArrayItem('travel_styles', opt)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #f59e0b', background: '#fffbeb', color: '#b45309', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                       {opt} ✕
                     </button>
                  ))}
                  <input 
                    type="text" placeholder="+ Khác..."
                    style={{ padding: '6px 12px', borderRadius: '20px', border: '1px dashed #cbd5e1', fontSize: '0.8rem', background: 'transparent', outline: 'none', width: '100px' }}
                    onKeyDown={e => {
                      if(e.key === 'Enter' && e.target.value.trim()) {
                        e.preventDefault();
                        if (!getArrayValue('travel_styles').includes(e.target.value.trim())) {
                          toggleArrayItem('travel_styles', e.target.value.trim());
                        }
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              </div>

              {/* GHI CHÚ INSIGHT */}
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>GHI CHÚ THÊM CỦA SALE (Insight đút túi)</label>
                <textarea 
                  className="modal-input" 
                  rows="3" 
                  placeholder="Ghi chú thêm thông tin đặc thù, tính cách khách hàng..."
                  value={editingCustomer.internal_notes || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, internal_notes: e.target.value})}
                  style={{ resize: 'vertical' }}
                />
              </div>

            </div>
          )}

          {activeTab === 'history_interaction' && (
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              
              {/* Cột Lịch sử mua hàng */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Lịch sử đi Tour</h3>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {editingCustomer.booking_history && editingCustomer.booking_history.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {editingCustomer.booking_history.map(booking => (
                        <div key={booking.id} style={{ 
                          background: 'white', 
                          padding: '1rem', 
                          borderRadius: '0.75rem', 
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>
                              {booking.tour_name}
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={12} /> {booking.departure_date ? new Date(booking.departure_date).toLocaleDateString('vi-VN') : 'Sắp diễn ra'}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Users size={12} /> {booking.pax_count} khách
                              </span>
                              <span style={{ color: '#0f172a', fontWeight: 600 }}>
                                #{booking.booking_code}
                              </span>
                            </div>
                          </div>
                          <div>
                            <span className={`badge-${booking.booking_status}`} style={{ 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '0.7rem', 
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}>
                              {booking.booking_status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '0.75rem' }}>
                      <Clock size={32} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                      <div>Chưa có lịch sử đi tour.</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cột Tương tác */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Ghi chú & Tương tác</h3>
                  <button type="button" onClick={() => setShowMiniEventForm(!showMiniEventForm)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <Calendar size={14} /> {showMiniEventForm ? 'Đóng form hẹn' : '+ LÊN LỊCH HẸN'}
                  </button>
                </div>

                {showMiniEventForm && (
                  <div style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'slideDown 0.2s ease-out' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8', marginBottom: '4px' }}>Tạo Lịch Chăm Sóc cho Khách Này</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select style={{ flex: 1, padding: '4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #93c5fd', outline: 'none' }} value={miniEvent.event_type} onChange={e => setMiniEvent({...miniEvent, event_type: e.target.value})}>
                        <option value="CALL">📞 Gọi điện</option>
                        <option value="MEETING">🤝 Hẹn gặp mặt</option>
                        <option value="PAYMENT">💰 Nhắc thanh toán</option>
                        <option value="EMAIL">✉️ Gửi Email/TN</option>
                      </select>
                      <input type="date" required style={{ flex: 1, padding: '4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #93c5fd', outline: 'none' }} value={miniEvent.event_date} onChange={e => setMiniEvent({...miniEvent, event_date: e.target.value})} />
                    </div>
                    <input type="text" required placeholder="Tiêu đề (Vd: Gọi tư vấn Tour TBN)..." style={{ padding: '6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #93c5fd', outline: 'none' }} value={miniEvent.title} onChange={e => setMiniEvent({...miniEvent, title: e.target.value})} />
                    <textarea placeholder="Ghi chú thêm... (không bắt buộc)" style={{ padding: '6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #93c5fd', outline: 'none', resize: 'none' }} rows={2} value={miniEvent.description} onChange={e => setMiniEvent({...miniEvent, description: e.target.value})} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '4px' }}>
                      <button type="button" onClick={() => setShowMiniEventForm(false)} style={{ padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer', background: 'transparent', border: 'none', color: '#64748b' }}>Hủy</button>
                      <button type="button" onClick={handleCreateMiniEvent} style={{ padding: '6px 16px', fontSize: '0.75rem', cursor: 'pointer', background: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', fontWeight: 600 }}>TẠO LỊCH</button>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    className="modal-input" 
                    style={{ flex: 1 }} 
                    placeholder="Nhập ghi chú nhanh..." 
                    value={newCustomerNote} 
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomerNote(e); } }}
                    onChange={e => setNewCustomerNote(e.target.value)} 
                  />
                  <button type="button" onClick={handleAddCustomerNote} className="login-btn" style={{ width: 'auto', padding: '0 1rem', fontSize: '0.85rem' }}>GỬI</button>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                  {editingCustomer.interaction_history && editingCustomer.interaction_history.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {editingCustomer.interaction_history.map(note => (
                        <div key={note.id} style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: '#3b82f6' }}>{note.creator_name}</strong>
                            <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{note.content}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>Chưa có ghi chú cũ.</div>
                  )}
                </div>
              </div>

            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', marginTop: 'auto', borderTop: '1px solid #e2e8f0' }}>

            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>CẬP NHẬT THÔNG TIN</button>
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setEditingCustomer(null)}>ĐÓNG</button>
          </div>
        </form>
      </div>
    </div>
  );
};
