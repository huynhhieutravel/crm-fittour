import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, CheckCircle, Activity, Upload, Image as ImageIcon } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('personal');

  if (!showAddGuideModal) return null;
  
  const myTimeline = editingGuide && guideTimelineData ? guideTimelineData.find(d => d.id === editingGuide.id) : null;
  const assignments = myTimeline ? [...myTimeline.assignments].sort((a,b) => new Date(b.start) - new Date(a.start)) : [];

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      // Using SweetAlert2 if available, else standard alert. Usually we don't block, just show loading state.
      // For simplicity, we just fetch.
      const res = await fetch('/api/guides/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setNewGuide(prev => ({ ...prev, [field]: data.url }));
      } else {
        alert(data.message || 'Lỗi upload file');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối upload file');
    }
  };

  const renderUploadBox = (field, label) => (
    <div className="modal-form-group" style={{ flex: 1 }}>
      <label>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {newGuide[field] && (
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <a href={newGuide[field]} target="_blank" rel="noreferrer" style={{ width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
              <img src={newGuide[field]} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
              <ImageIcon size={20} color="#94a3b8" style={{ display: 'none' }} />
            </a>
            <button
              type="button"
              onClick={() => setNewGuide(prev => ({ ...prev, [field]: null }))}
              style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
            >
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        )}
        <label style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: '#f1f5f9', border: '1px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', margin: 0, color: '#475569', fontWeight: 600, fontSize: '0.85rem' }}>
          <Upload size={16} /> Chọn ảnh...
          <input type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, field)} />
        </label>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '700px', width: '96%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>👤 {editingGuide ? 'HỒ SƠ HƯỚNG DẪN VIÊN' : 'THÊM HƯỚNG DẪN VIÊN MỚI'}</h2>
          <button className="icon-btn" onClick={() => setShowAddGuideModal(false)}><X size={24} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: '100%' }}>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
              <button 
                type="button"
                onClick={() => setActiveTab('personal')}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'personal' ? '2px solid #4f46e5' : '2px solid transparent', color: activeTab === 'personal' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
              >
                Thông tin Cá nhân
              </button>
              <button 
                type="button"
                onClick={() => setActiveTab('profession')}
                style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'profession' ? '2px solid #4f46e5' : '2px solid transparent', color: activeTab === 'profession' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
              >
                Thông tin Hành nghề
              </button>
              {editingGuide && (
                <button 
                  type="button"
                  onClick={() => setActiveTab('history')}
                  style={{ padding: '0.5rem 1rem', background: 'none', border: 'none', borderBottom: activeTab === 'history' ? '2px solid #4f46e5' : '2px solid transparent', color: activeTab === 'history' ? '#4f46e5' : '#64748b', fontWeight: 700, cursor: 'pointer' }}
                >
                  Lịch sử Tour
                </button>
              )}
            </div>

            <form id="guide-form" onSubmit={editingGuide ? handleUpdateGuide : handleAddGuide} style={{ display: activeTab === 'history' ? 'none' : 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {activeTab === 'personal' && (
                <>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="modal-form-group" style={{ flex: 2 }}>
                      <label>HỌ VÀ TÊN HDV *</label>
                      <input className="modal-input" required value={newGuide.name || ''} onChange={e => setNewGuide({...newGuide, name: e.target.value})} />
                    </div>
                    {renderUploadBox('avatar_url', 'HÌNH THẺ')}
                  </div>

                  <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="modal-form-group">
                      <label>SỐ ĐIỆN THOẠI</label>
                      <input className="modal-input" value={newGuide.phone || ''} onChange={e => setNewGuide({...newGuide, phone: e.target.value})} />
                    </div>
                    <div className="modal-form-group">
                      <label>EMAIL</label>
                      <input className="modal-input" type="email" value={newGuide.email || ''} onChange={e => setNewGuide({...newGuide, email: e.target.value})} />
                    </div>
                  </div>

                  <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="modal-form-group">
                      <label>NGÀY SINH</label>
                      <input className="modal-input" type="date" value={newGuide.dob ? newGuide.dob.split('T')[0] : ''} onChange={e => setNewGuide({...newGuide, dob: e.target.value})} />
                    </div>
                    <div className="modal-form-group">
                      <label>GIỚI TÍNH</label>
                      <select className="modal-select" value={newGuide.gender || ''} onChange={e => setNewGuide({...newGuide, gender: e.target.value})}>
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label>ĐỊA CHỈ</label>
                    <input className="modal-input" value={newGuide.address || ''} onChange={e => setNewGuide({...newGuide, address: e.target.value})} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div className="modal-form-group">
                      <label>SỐ CCCD</label>
                      <input className="modal-input" value={newGuide.id_card || ''} onChange={e => setNewGuide({...newGuide, id_card: e.target.value})} />
                    </div>
                    <div className="modal-form-group">
                      <label>NGÀY CẤP CCCD</label>
                      <input className="modal-input" type="date" value={newGuide.id_card_date ? newGuide.id_card_date.split('T')[0] : ''} onChange={e => setNewGuide({...newGuide, id_card_date: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div className="modal-form-group">
                      <label>SỐ HỘ CHIẾU (PASSPORT)</label>
                      <input className="modal-input" value={newGuide.passport || ''} onChange={e => setNewGuide({...newGuide, passport: e.target.value})} />
                    </div>
                    <div className="modal-form-group">
                      <label>NGÀY HẾT HẠN PASSPORT</label>
                      <input className="modal-input" type="date" value={newGuide.passport_expiry ? newGuide.passport_expiry.split('T')[0] : ''} onChange={e => setNewGuide({...newGuide, passport_expiry: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      {renderUploadBox('passport_url', 'ẢNH MẶT HỘ CHIẾU')}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'profession' && (
                <>
                  <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="modal-form-group">
                      <label>TÌNH TRẠNG LÀM VIỆC</label>
                      <select className="modal-select" value={newGuide.status || 'Active'} onChange={e => setNewGuide({...newGuide, status: e.target.value})}>
                        <option value="Active">Hoạt động (Active)</option>
                        <option value="Inactive">Tạm nghỉ (Inactive)</option>
                      </select>
                    </div>
                    <div className="modal-form-group">
                      <label>NĂM KINH NGHIỆM</label>
                      <input className="modal-input" type="number" value={newGuide.experience || ''} onChange={e => setNewGuide({...newGuide, experience: e.target.value})} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                    <div className="modal-form-group">
                      <label>LOẠI THẺ HDV</label>
                      <select className="modal-select" value={newGuide.guide_card_type || ''} onChange={e => setNewGuide({...newGuide, guide_card_type: e.target.value})}>
                        <option value="">Chọn loại thẻ</option>
                        <option value="Nội địa">Thẻ Nội địa</option>
                        <option value="Quốc tế">Thẻ Quốc tế</option>
                      </select>
                    </div>
                    <div className="modal-form-group">
                      <label>SỐ THẺ HDV</label>
                      <input className="modal-input" value={newGuide.guide_card_number || ''} onChange={e => setNewGuide({...newGuide, guide_card_number: e.target.value})} />
                    </div>
                    <div className="modal-form-group">
                      <label>NGÀY HẾT HẠN THẺ</label>
                      <input className="modal-input" type="date" value={newGuide.guide_card_expiry ? newGuide.guide_card_expiry.split('T')[0] : ''} onChange={e => setNewGuide({...newGuide, guide_card_expiry: e.target.value})} />
                    </div>
                    <div className="modal-form-group">
                      {renderUploadBox('guide_card_url', 'ẢNH THẺ HDV')}
                    </div>
                  </div>

                  <div className="modal-form-group">
                    <label>NGÔN NGỮ CHUYÊN MÔN</label>
                    <input className="modal-input" value={newGuide.languages || ''} onChange={e => setNewGuide({...newGuide, languages: e.target.value})} placeholder="Tiếng Việt, Tiếng Trung, Tiếng Anh..." />
                  </div>
                  
                  <div className="modal-form-group">
                    <label>THẾ MẠNH (SPECIALTIES)</label>
                    <input className="modal-input" value={newGuide.specialties || ''} onChange={e => setNewGuide({...newGuide, specialties: e.target.value})} placeholder="Ví dụ: Team building, Tuyến Trung Quốc..." />
                  </div>

                  <div className="modal-form-group">
                    <label>GHI CHÚ / TIỂU SỬ</label>
                    <textarea 
                      className="modal-input" 
                      rows="3" 
                      value={newGuide.bio || ''} 
                      onChange={e => setNewGuide({...newGuide, bio: e.target.value})} 
                      placeholder="Tính cách, review khách hàng..." 
                      style={{ resize: 'vertical' }}
                    />
                  </div>
                </>
              )}
            </form>

          {activeTab === 'history' && (
            <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', margin: 0 }}>Lịch sử Lượt Tour</h3>
                <span style={{ background: '#e0e7ff', color: '#4f46e5', fontWeight: 800, padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                  {assignments.length} Tour
                </span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px', paddingRight: '1rem' }} className="custom-scrollbar">
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
                            if (asg.source === 'mice') return;
                            const dep = tourDepartures && tourDepartures.find(d => d.id === asg.id);
                            if (dep && handleEditDeparture) {
                              setShowAddGuideModal(false);
                              handleEditDeparture(dep);
                            }
                          }}
                          style={{ background: bgCard, border: `1px solid ${badgeColor}30`, borderRadius: '8px', padding: '1rem', position: 'relative', cursor: asg.source !== 'mice' ? 'pointer' : 'default', transition: 'all 0.2s ease' }}
                          onMouseOver={e => { if (asg.source !== 'mice') e.currentTarget.style.transform = 'translateY(-2px)' }}
                          onMouseOut={e => { if (asg.source !== 'mice') e.currentTarget.style.transform = 'translateY(0)' }}
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
