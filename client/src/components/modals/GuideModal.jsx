import React from 'react';
import { X, MapPin, Calendar, Clock, CheckCircle } from 'lucide-react';

const GuideModal = ({
  showAddGuideModal,
  setShowAddGuideModal,
  editingGuide,
  handleUpdateGuide,
  handleAddGuide,
  newGuide,
  setNewGuide,
  guideTimelineData,
  tourDepartures,
  handleEditDeparture
}) => {
  if (!showAddGuideModal) return null;
  
  const myTimeline = editingGuide ? guideTimelineData.find(d => d.id === editingGuide.id) : null;
  const assignments = myTimeline ? [...myTimeline.assignments].sort((a,b) => new Date(b.start) - new Date(a.start)) : [];


  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: editingGuide ? '1000px' : '600px', width: '96%', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>👤 {editingGuide ? 'HỒ SƠ HƯỚNG DẪN VIÊN' : 'THÊM HƯỚNG DẪN VIÊN MỚI'}</h2>
          <button className="icon-btn" onClick={() => setShowAddGuideModal(false)}><X size={24} /></button>
        </div>
        
        <div style={{ display: 'flex', gap: '2rem', flexDirection: editingGuide ? 'row' : 'column' }}>
          {/* CỘT TRÁI: THÔNG TIN HỒ SƠ */}
          <div style={{ flex: editingGuide ? '0 0 50%' : '1 1 auto' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#334155' }}>Thông tin Cơ bản</h3>
            <form id="guide-form" onSubmit={editingGuide ? handleUpdateGuide : handleAddGuide} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="modal-form-group">
                <label>HỌ VÀ TÊN HDV *</label>
                <input className="modal-input" required value={newGuide.name || ''} onChange={e => setNewGuide({...newGuide, name: e.target.value})} />
              </div>
              <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>SỐ ĐIỆN THOẠI *</label>
                  <input className="modal-input" required value={newGuide.phone || ''} onChange={e => setNewGuide({...newGuide, phone: e.target.value})} />
                </div>
                <div className="modal-form-group">
                  <label>EMAIL</label>
                  <input className="modal-input" type="email" value={newGuide.email || ''} onChange={e => setNewGuide({...newGuide, email: e.target.value})} />
                </div>
              </div>
              
              <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>SỐ HỘ CHIẾU</label>
                  <input className="modal-input" value={newGuide.passport || ''} onChange={e => setNewGuide({...newGuide, passport: e.target.value})} placeholder="Số Passport..." />
                </div>
                <div className="modal-form-group">
                  <label>TÌNH TRẠNG LÀM VIỆC</label>
                  <select className="modal-select" value={newGuide.status || 'Active'} onChange={e => setNewGuide({...newGuide, status: e.target.value})}>
                    <option value="Active">Hoạt động (Active)</option>
                    <option value="Inactive">Tạm nghỉ (Inactive)</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-group">
                <label>NGÔN NGỮ CHUYÊN MÔN</label>
                <input className="modal-input" value={newGuide.languages || ''} onChange={e => setNewGuide({...newGuide, languages: e.target.value})} placeholder="Tiếng Việt, Tiếng Trung, Tiếng Anh..." />
              </div>

              <div className="modal-form-group">
                <label>GHI CHÚ / TIỂU SỬ</label>
                <textarea 
                  className="modal-input" 
                  rows="4" 
                  value={newGuide.bio || ''} 
                  onChange={e => setNewGuide({...newGuide, bio: e.target.value})} 
                  placeholder="Kinh nghiệm, thế mạnh các tuyến điểm, tính cách..." 
                  style={{ resize: 'vertical' }}
                />
              </div>
            </form>
          </div>

          {/* CỘT PHẢI: LỊCH SỬ TOUR */}
          {editingGuide && (
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: 0 }}>Lịch sử Lượt Tour</h3>
                <span style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                  {assignments.length} Tour
                </span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '400px', paddingRight: '1rem' }} className="custom-scrollbar">
                {assignments.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem', fontStyle: 'italic' }}>
                    Chưa có lịch phân công nào.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {assignments.map(asg => {
                      const start = new Date(asg.start);
                      const end = new Date(asg.end);
                      const now = new Date();
                      
                      let badgeColor = '#94a3b8';
                      let badgeText = 'Đã hoàn thành';
                      let bgCard = 'white';
                      let Icon = CheckCircle;
                      
                      if (end >= now && start <= now) {
                        badgeColor = '#ef4444';
                        badgeText = 'Đang chạy';
                        bgCard = '#fff1f2';
                        Icon = Activity;
                      } else if (start > now) {
                        badgeColor = '#3b82f6';
                        badgeText = 'Sắp tới';
                        bgCard = '#eff6ff';
                        Icon = Clock;
                      }
                      
                      return (
                        <div 
                          key={asg.id} 
                          onClick={() => {
                            const dep = tourDepartures.find(d => d.id === asg.id);
                            if (dep) {
                              setShowAddGuideModal(false);
                              handleEditDeparture(dep);
                            }
                          }}
                          style={{ background: bgCard, border: `1px solid ${badgeColor}30`, borderRadius: '8px', padding: '1rem', position: 'relative', cursor: 'pointer', transition: 'all 0.2s ease' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <div style={{ position: 'absolute', top: '12px', right: '12px', background: `${badgeColor}20`, color: badgeColor, fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icon size={10} /> {badgeText}
                          </div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e293b', marginBottom: '8px', paddingRight: '80px', lineHeight: '1.4' }}>
                            {asg.tourName}
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar size={14} color="#94a3b8" /> {start.toLocaleDateString('vi-VN')} - {end.toLocaleDateString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', justifyContent: 'flex-end' }}>
          <button type="button" className="btn-pro-cancel" style={{ width: 'auto', padding: '0 2rem' }} onClick={() => setShowAddGuideModal(false)}>HỦY</button>
          <button type="submit" form="guide-form" className="btn-pro-save" style={{ width: 'auto', padding: '0 2rem' }}>{editingGuide ? 'LƯU HỒ SƠ CHỈNH SỬA' : 'TẠO MỚI HƯỚNG DẪN VIÊN'}</button>
        </div>
      </div>
    </div>
  );
};

export default GuideModal;
