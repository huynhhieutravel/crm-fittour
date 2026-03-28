import React from 'react';
import { X, PlusCircle, LogOut } from 'lucide-react';

const AddLeadModal = ({ 
  showAddLeadModal, 
  setShowAddLeadModal, 
  handleAddLead, 
  newLead, 
  setNewLead, 
  LEAD_SOURCES, 
  LEAD_CLASSIFICATIONS, 
  tours, 
  users 
}) => {
  if (!showAddLeadModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowAddLeadModal(false)}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '800px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setShowAddLeadModal(false)}>
          <X size={18} strokeWidth={3} />
        </button>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hệ thống Quản lý Lead</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Thêm Lead Marketing Mới</h2>
        
        <form onSubmit={handleAddLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="modal-form-group">
            <label>TÊN KHÁCH HÀNG *</label>
            <input className="modal-input" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="Nguyễn Văn A..." />
          </div>
          <div className="modal-form-group">
            <label>SỐ ĐIỆN THOẠI</label>
            <input className="modal-input" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="0901 234..." />
          </div>

          <div className="modal-form-group">
            <label>GENDER / GIỚI TÍNH</label>
            <select className="modal-select" value={newLead.gender} onChange={e => setNewLead({...newLead, gender: e.target.value})}>
              <option value="">-- Giới tính --</option>
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <div className="modal-form-group">
            <label>EMAIL</label>
            <input className="modal-input" type="email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} placeholder="email@example.com" />
          </div>

          <div className="modal-form-group">
            <label>NGÀY SINH</label>
            <input className="modal-input" type="date" value={newLead.birth_date} onChange={e => setNewLead({...newLead, birth_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGUỒN KHÁCH HÀNG</label>
            <select className="modal-select" value={newLead.source} onChange={e => setNewLead({...newLead, source: e.target.value})}>
              {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="modal-form-group">
            <label>PHÂN LOẠI KHÁCH HÀNG</label>
            <select className="modal-select" value={newLead.classification} onChange={e => setNewLead({...newLead, classification: e.target.value})}>
              {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>DỊCH VỤ QUAN TÂM</label>
            <select className="modal-select" value={newLead.tour_id || ''} onChange={e => setNewLead({...newLead, tour_id: e.target.value})}>
              <option value="">Chọn tour...</option>
              {tours.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div className="modal-form-group">
            <label>TƯ VẤN VIÊN (CSKH)</label>
            <select className="modal-select" value={newLead.assigned_to || ''} onChange={e => setNewLead({...newLead, assigned_to: e.target.value})}>
              <option value="">-- Chọn nhân viên --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>NHÓM BU (TƯ VẤN)</label>
            <select className="modal-select" value={newLead.bu_group || ''} onChange={e => setNewLead({...newLead, bu_group: e.target.value})}>
              <option value="">-- Chọn nhóm --</option>
              <option value="BU1">BU1</option>
              <option value="BU2">BU2</option>
              <option value="BU3">BU3</option>
              <option value="BU4">BU4</option>
            </select>
          </div>
          
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>THỜI GIAN LIÊN HỆ</label>
            <input 
              className="modal-input" 
              type="datetime-local" 
              value={newLead.last_contacted_at ? new Date(new Date(newLead.last_contacted_at).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''} 
              onChange={e => setNewLead({...newLead, last_contacted_at: e.target.value})} 
            />
          </div>

          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>GHI CHÚ BAN ĐẦU</label>
            <textarea className="modal-textarea" value={newLead.consultation_note} onChange={e => setNewLead({...newLead, consultation_note: e.target.value})} placeholder="Nội dung tư vấn sơ bộ..." />
          </div>

          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button type="submit" className="btn-pro-save">
              <PlusCircle size={18} strokeWidth={3} /> LƯU HỒ SƠ MỚI
            </button>
            <button type="button" className="btn-pro-cancel" onClick={() => setShowAddLeadModal(false)}>
              <LogOut size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeadModal;
