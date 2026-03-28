import React from 'react';
import { X } from 'lucide-react';

export const AddCustomerModal = ({ 
  showAddCustomerModal, 
  setShowAddCustomerModal, 
  handleAddCustomer, 
  newCustomer, 
  setNewCustomer,
  CITY_OPTIONS,
  CUSTOMER_ROLES,
  CUSTOMER_SEGMENTS
}) => {
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
            <label>QUỐC TỊCH</label>
            <input className="modal-input" value={newCustomer.nationality} onChange={e => setNewCustomer({...newCustomer, nationality: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGÀY SINH</label>
            <input className="modal-input" type="date" value={newCustomer.birth_date} onChange={e => setNewCustomer({...newCustomer, birth_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>GIỚI TÍNH</label>
            <select className="modal-select" value={newCustomer.gender} onChange={e => setNewCustomer({...newCustomer, gender: e.target.value})}>
              <option value="">-- Giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>CCCD / PASSPORT</label>
            <input className="modal-input" value={newCustomer.id_card} onChange={e => setNewCustomer({...newCustomer, id_card: e.target.value})} />
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

          <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Vai trò & Insight</div>

          <div className="modal-form-group">
            <label>VAI TRÒ</label>
            <select className="modal-select" value={newCustomer.role} onChange={e => setNewCustomer({...newCustomer, role: e.target.value})}>
              {CUSTOMER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>PHÂN KHÚC</label>
            <select className="modal-select" value={newCustomer.customer_segment} onChange={e => setNewCustomer({...newCustomer, customer_segment: e.target.value})}>
              {CUSTOMER_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
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
  handleAddCustomerNote
}) => {
  if (!editingCustomer) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📝 CHỈNH SỬA KHÁCH HÀNG</h2>
          <button className="icon-btn" onClick={() => setEditingCustomer(null)}><X size={24} /></button>
        </div>
        
        <form onSubmit={handleUpdateCustomer} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
            <label>QUỐC TỊCH</label>
            <input className="modal-input" value={editingCustomer.nationality || ''} onChange={e => setEditingCustomer({...editingCustomer, nationality: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGÀY SINH</label>
            <input className="modal-input" type="date" value={editingCustomer.birth_date ? editingCustomer.birth_date.split('T')[0] : ''} onChange={e => setEditingCustomer({...editingCustomer, birth_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>GIỚI TÍNH</label>
            <select className="modal-select" value={editingCustomer.gender || ''} onChange={e => setEditingCustomer({...editingCustomer, gender: e.target.value})}>
              <option value="">-- Giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          <div className="modal-form-group">
            <label>CCCD / PASSPORT</label>
            <input className="modal-input" value={editingCustomer.id_card || ''} onChange={e => setEditingCustomer({...editingCustomer, id_card: e.target.value})} />
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

          <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Vai trò & Insight</div>

          <div className="modal-form-group">
            <label>VAI TRÒ</label>
            <select className="modal-select" value={editingCustomer.role || 'booker'} onChange={e => setEditingCustomer({...editingCustomer, role: e.target.value})}>
              {CUSTOMER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>PHÂN KHÚC</label>
            <select className="modal-select" value={editingCustomer.customer_segment || 'New Customer'} onChange={e => setEditingCustomer({...editingCustomer, customer_segment: e.target.value})}>
              {CUSTOMER_SEGMENTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="modal-form-group">
            <label>SỞ THÍCH TOUR (Insight)</label>
            <input className="modal-input" value={editingCustomer.tour_interests || ''} onChange={e => setEditingCustomer({...editingCustomer, tour_interests: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>THỜI GIAN HAY ĐI (Tháng/Mùa)</label>
            <input className="modal-input" value={editingCustomer.travel_season || ''} onChange={e => setEditingCustomer({...editingCustomer, travel_season: e.target.value})} />
          </div>

          <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '1rem' }}>Lịch sử tư vấn & Chăm sóc (từ Lead)</div>
          
          <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '1.5rem', borderRadius: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', background: 'white', padding: '1rem', borderRadius: '0.75rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              <input 
                className="modal-input" 
                style={{ flex: 1, border: '1px solid #e2e8f0' }} 
                placeholder="Nhập nội dung tư vấn mới cho khách hàng này..." 
                value={newCustomerNote} 
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCustomerNote(e); } }}
                onChange={e => setNewCustomerNote(e.target.value)} 
              />
              <button type="button" onClick={handleAddCustomerNote} className="login-btn" style={{ width: 'auto', padding: '0 1.5rem' }}>GỬI</button>
            </div>
            {editingCustomer.interaction_history && editingCustomer.interaction_history.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {editingCustomer.interaction_history.map(note => (
                  <div key={note.id} style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', borderLeft: '3px solid #6366f1' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{note.creator_name}</strong>
                      <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>{note.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: '#94a3b8' }}>Chưa có lịch sử chuyển đổi hoặc ghi chú cũ.</div>
            )}
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>CẬP NHẬT THÔNG TIN</button>
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setEditingCustomer(null)}>ĐÓNG</button>
          </div>
        </form>
      </div>
    </div>
  );
};
