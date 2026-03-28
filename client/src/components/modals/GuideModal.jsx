import React from 'react';
import { X } from 'lucide-react';

const GuideModal = ({
  showAddGuideModal,
  setShowAddGuideModal,
  editingGuide,
  handleUpdateGuide,
  handleAddGuide,
  newGuide,
  setNewGuide
}) => {
  if (!showAddGuideModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>👤 {editingGuide ? 'CẬP NHẬT' : 'THÊM'} HƯỚNG DẪN VIÊN</h2>
          <button className="icon-btn" onClick={() => setShowAddGuideModal(false)}><X size={24} /></button>
        </div>
        <form onSubmit={editingGuide ? handleUpdateGuide : handleAddGuide} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="modal-form-group">
            <label>HỌ VÀ TÊN HDV *</label>
            <input className="modal-input" required value={newGuide.name} onChange={e => setNewGuide({...newGuide, name: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label>SỐ ĐIỆN THOẠI *</label>
              <input className="modal-input" required value={newGuide.phone} onChange={e => setNewGuide({...newGuide, phone: e.target.value})} />
            </div>
            <div className="modal-form-group">
              <label>EMAIL</label>
              <input className="modal-input" type="email" value={newGuide.email} onChange={e => setNewGuide({...newGuide, email: e.target.value})} />
            </div>
          </div>
          <div className="modal-form-group">
            <label>NGÔN NGỮ (CÁCH NHAU BẰNG DẤU PHẨY)</label>
            <input className="modal-input" value={newGuide.languages} onChange={e => setNewGuide({...newGuide, languages: e.target.value})} placeholder="Tiếng Việt, Tiếng Trung, Tiếng Anh..." />
          </div>
          <div className="modal-form-group">
            <label>TRẠNG THÁI</label>
            <select className="modal-select" value={newGuide.status} onChange={e => setNewGuide({...newGuide, status: e.target.value})}>
              <option value="Available">Sẵn sàng (Available)</option>
              <option value="Busy">Đang dẫn tour (Busy)</option>
              <option value="Inactive">Tạm nghỉ (Inactive)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>{editingGuide ? 'CẬP NHẬT THÔNG TIN' : 'LƯU HỒ SƠ MỚI'}</button>
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddGuideModal(false)}>HỦY</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuideModal;
