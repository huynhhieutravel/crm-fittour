import React from 'react';
import { X } from 'lucide-react';

export const AddTemplateModal = ({
  showAddTemplateModal,
  setShowAddTemplateModal,
  handleAddTemplate,
  newTemplate,
  setNewTemplate
}) => {
  if (!showAddTemplateModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📦 THIẾT KẾ SẢN PHẨM TOUR MỚI</h2>
          <button className="icon-btn" onClick={() => setShowAddTemplateModal(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleAddTemplate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>TÊN TOUR / SẢN PHẨM *</label>
            <input className="modal-input" required value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Vd: Tour Bắc Kinh - Thượng Hải - Hàng Châu" />
          </div>
          <div className="modal-form-group">
            <label>ĐIỂM ĐẾN *</label>
            <input className="modal-input" required value={newTemplate.destination} onChange={e => setNewTemplate({...newTemplate, destination: e.target.value})} placeholder="Vd: Trung Quốc" />
          </div>
          <div className="modal-form-group">
            <label>THỜI LƯỢNG *</label>
            <input className="modal-input" required value={newTemplate.duration} onChange={e => setNewTemplate({...newTemplate, duration: e.target.value})} placeholder="Vd: 6N5Đ" />
          </div>
          <div className="modal-form-group">
            <label>LOẠI TOUR</label>
            <select className="modal-select" value={newTemplate.tour_type} onChange={e => setNewTemplate({...newTemplate, tour_type: e.target.value})}>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
              <option value="Budget">Budget</option>
            </select>
          </div>
          <div className="modal-form-group">
            <label>TAGS (CÁCH NHAU BẰNG DẤU PHẨY)</label>
            <input className="modal-input" value={newTemplate.tags} onChange={e => setNewTemplate({...newTemplate, tags: e.target.value})} placeholder="Trekking, Văn hóa, Nghỉ dưỡng..." />
          </div>
          <div className="modal-form-group">
             <label>GIÁ NIÊM YẾT DỰ KIẾN</label>
             <input className="modal-input" type="number" value={newTemplate.base_price} onChange={e => setNewTemplate({...newTemplate, base_price: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label>GIÁ COST NỘI BỘ</label>
             <input className="modal-input" type="number" value={newTemplate.internal_cost} onChange={e => setNewTemplate({...newTemplate, internal_cost: e.target.value})} />
          </div>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>MÔ TẢ NGẮN / ĐIỂM NỔI BẬT</label>
            <textarea className="modal-textarea" value={newTemplate.highlights} onChange={e => setNewTemplate({...newTemplate, highlights: e.target.value})} />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>LƯU THIẾT KẾ SẢN PHẨM</button>
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddTemplateModal(false)}>HỦY</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const AddDepartureModal = ({
  showAddDepartureModal,
  setShowAddDepartureModal,
  handleAddDeparture,
  newDeparture,
  setNewDeparture,
  tourTemplates,
  guides
}) => {
  if (!showAddDepartureModal) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📅 LÊN LỊCH KHỞI HÀNH THỰC TẾ</h2>
          <button className="icon-btn" onClick={() => setShowAddDepartureModal(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleAddDeparture} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>SẢN PHẨM TOUR *</label>
            <select className="modal-select" required value={newDeparture.tour_template_id} onChange={e => setNewDeparture({...newDeparture, tour_template_id: e.target.value})}>
              <option value="">-- Chọn sản phẩm thiết kế --</option>
              {tourTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>NGÀY KHỞI HÀNH *</label>
            <input className="modal-input" type="date" required value={newDeparture.start_date} onChange={e => setNewDeparture({...newDeparture, start_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGÀY KẾT THÚC (DỰ KIẾN)</label>
            <input className="modal-input" type="date" value={newDeparture.end_date} onChange={e => setNewDeparture({...newDeparture, end_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>GIÁ TOUR THỰC TẾ *</label>
            <input className="modal-input" type="number" required value={newDeparture.actual_price} onChange={e => setNewDeparture({...newDeparture, actual_price: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label>SỐ KHÁCH TỐI ĐA (CAPACITY)</label>
             <input className="modal-input" type="number" value={newDeparture.max_participants} onChange={e => setNewDeparture({...newDeparture, max_participants: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label>ĐIỂM HÒA VỐN (PAX)</label>
             <input className="modal-input" type="number" value={newDeparture.break_even_pax} onChange={e => setNewDeparture({...newDeparture, break_even_pax: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label>HƯỚNG DẪN VIÊN</label>
             <select className="modal-select" value={newDeparture.guide_id} onChange={e => setNewDeparture({...newDeparture, guide_id: e.target.value})}>
                <option value="">-- Chưa gán HDV --</option>
                {guides.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
             </select>
          </div>
          <div className="modal-form-group">
            <label>TRẠNG THÁI VẬN HÀNH</label>
            <select className="modal-select" value={newDeparture.status} onChange={e => setNewDeparture({...newDeparture, status: e.target.value})}>
              <option value="Open">Mở bán (Open)</option>
              <option value="Guaranteed">Chắc chắn đi (Guaranteed)</option>
              <option value="Full">Đã đầy (Full)</option>
              <option value="Cancelled">Hủy tour (Cancelled)</option>
            </select>
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>XÁC NHẬN KHỞI HÀNH</button>
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowAddDepartureModal(false)}>HỦY</button>
          </div>
        </form>
      </div>
    </div>
  );
};
