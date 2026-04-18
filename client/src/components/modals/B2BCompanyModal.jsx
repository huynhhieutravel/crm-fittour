import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createPortal } from 'react-dom';
import { X, Calendar, MapPin, Users, CheckCircle, Clock, AlertCircle, Award, CalendarPlus, ExternalLink } from 'lucide-react';
import { formatRoleDisplayName } from '../../utils/roleUtils';

export const INDUSTRY_OPTIONS = [
  'Sản xuất', 'Giáo dục', 'CNTT', 'Y tế', 'Bán lẻ', 'Dịch vụ', 
  'Tài chính - Ngân hàng', 'Xây dựng', 'Khác'
];

const EXPERIENCE_OPTIONS = [
  'Hoạt động Gắn kết (Team Building)', 'Nghỉ dưỡng / Chill',
  'Gala Dinner hoành tráng', 'Khám phá văn hóa / thiên nhiên',
  'Trải nghiệm mạo hiểm (Trekking/Rafting)', 'Sang trọng / VIP'
];

const TRAVEL_STYLE_OPTIONS = [
  'Khuyến thưởng Nhân viên (Incentive)', 'Tri ân Đại lý / Khách hàng',
  'Hội nghị / Hội thảo (MICE)', 'Team Building', 'Kỷ niệm thành lập Công ty'
];

const formatDateLocal = (dateInput) => {
    if (!dateInput) return '';
    const d = new Date(dateInput);
    if (isNaN(d)) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const B2BCompanyModal = ({ company, onClose, onUpdateSuccess, users = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    name: '', tax_id: '', industry: '', phone: '', email: '', 
    address: '', website: '', founded_date: '', assigned_to: '', notes: '',
    travel_styles: [], experiences: [], internal_notes: '', special_requests: '', first_deal_date: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Focus Company Detail Load State
  const [extendedData, setExtendedData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newNote, setNewNote] = useState('');
  const [showMiniEventForm, setShowMiniEventForm] = useState(false);
  const [miniEvent, setMiniEvent] = useState({ title: '', event_type: 'CALL', event_date: '', description: '' });

  useEffect(() => {
    if (!company) return;
    
    // Init form
    const initData = {
      name: company.name || '', tax_id: company.tax_id || '', industry: company.industry || '',
      phone: company.phone || '', email: company.email || '', address: company.address || '',
      website: company.website || '', 
      founded_date: company.founded_date ? formatDateLocal(company.founded_date) : '',
      assigned_to: company.assigned_to || '', notes: company.notes || '',
      internal_notes: company.internal_notes || '', special_requests: company.special_requests || '',
      first_deal_date: company.first_deal_date ? formatDateLocal(company.first_deal_date) : ''
    };
    
    try {
      initData.travel_styles = typeof company.travel_styles === 'string' ? JSON.parse(company.travel_styles || '[]') : (company.travel_styles || []);
      initData.experiences = typeof company.experiences === 'string' ? JSON.parse(company.experiences || '[]') : (company.experiences || []);
    } catch(e) {
      initData.travel_styles = []; initData.experiences = [];
    }
    
    setFormData(initData);
    
    // Fetch full details
    if (company.id) {
        setLoading(true);
        axios.get(`/api/b2b-companies/${company.id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then(res => setExtendedData(res.data)).finally(() => setLoading(false));
    }
  }, [company]);

  if (!company) return null;

  const toggleArrayItem = (field, item) => {
    const arr = [...formData[field]];
    if (arr.includes(item)) {
      setFormData({ ...formData, [field]: arr.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [field]: [...arr, item] });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Vui lòng nhập tên công ty!');
    try {
      setIsSubmitting(true);
      const payload = {
        ...formData,
        assigned_to: formData.assigned_to || null,
        founded_date: formData.founded_date || null,
        first_deal_date: formData.first_deal_date || null
      };
      
      if (company.id) {
          await axios.put(`/api/b2b-companies/${company.id}`, payload, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
      } else {
          await axios.post(`/api/b2b-companies`, payload, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
      }
      onUpdateSuccess();
    } catch (err) {
      alert('Lỗi cập nhật: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNote = async (e) => {
      e?.preventDefault();
      if (!newNote.trim() || !company.id) return;
      try {
          const res = await axios.post(`/api/b2b-companies/${company.id}/notes`, { content: newNote }, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          setExtendedData(prev => ({
              ...prev,
              interaction_history: [res.data, ...(prev.interaction_history || [])]
          }));
          setNewNote('');
      } catch (e) {
          alert('Lỗi thêm ghi chú: ' + e.message);
      }
  };

  const navigateToLeader = (id) => {
    sessionStorage.setItem('pendingLeaderOpen', id);
    window.history.pushState({}, '', '/group/leaders');
    window.dispatchEvent(new PopStateEvent('popstate'));
    onClose();
  };

  const navigateToProject = (id) => {
    sessionStorage.setItem('pendingProjectOpen', id);
    window.history.pushState({}, '', '/group/projects');
    window.dispatchEvent(new PopStateEvent('popstate'));
    onClose();
  };

  const handleCreateMiniEvent = async () => {
    if (!miniEvent.title || !miniEvent.event_date) return alert('Vui lòng nhập tên và ngày hẹn báo trước!');
    try {
      const res = await axios.post(`/api/b2b-companies/${company.id}/events`, miniEvent, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      alert('Đã LÊN LỊCH CHĂM SÓC thành công!');
      setShowMiniEventForm(false);
      setMiniEvent({ title: '', event_type: 'CALL', event_date: '', description: '' });
      setExtendedData(prev => ({
          ...prev,
          events: [res.data, ...(prev.events || [])]
      }));
    } catch (err) {
      alert('Lỗi tạo lịch: ' + err.message);
    }
  };

  const toggleEventStatus = async (eventId, currentStatus) => {
      try {
          const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
          await axios.put(`/api/b2b-companies/events/${eventId}/status`, { status: newStatus }, {
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          setExtendedData(prev => ({
              ...prev,
              events: prev.events.map(ev => ev.id === eventId ? { ...ev, status: newStatus } : ev)
          }));
      } catch (e) {
          alert('Lỗi cập nhật status');
      }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '900px', width: '100%', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0
        }}
      >
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#1e293b', fontWeight: 800 }}>
            {company.id ? '📝 SỬA THÔNG TIN DOANH NGHIỆP' : '🏢 THÊM DOANH NGHIỆP MỚI'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>

        {/* Tabs */}
        {company.id && (
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', padding: '0 1.5rem' }}>
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
                    background: 'none', border: 'none', padding: '1rem', fontWeight: 600,
                    color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent', cursor: 'pointer'
                }}
                >
                {tab.label}
                </button>
            ))}
            </div>
        )}
        
        <form onSubmit={handleUpdate} style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          
          {(!company.id || activeTab === 'overview') && (
            <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>TÊN DOANH NGHIỆP *</label>
                <input className="modal-input" required 
                  style={{ textTransform: 'uppercase', fontWeight: 700 }}
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value.toUpperCase()})} 
                />
              </div>

              <div className="modal-form-group">
                <label>MÃ SỐ THUẾ</label>
                <input className="modal-input" value={formData.tax_id} onChange={e => setFormData({...formData, tax_id: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀNH NGHỀ</label>
                <select className="modal-select" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}>
                  <option value="">-- Chọn ngành nghề --</option>
                  {INDUSTRY_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>

              <div className="modal-form-group">
                <label>SĐT CÔNG TY</label>
                <input className="modal-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>EMAIL CÔNG TY</label>
                <input className="modal-input" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>

              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>ĐỊA CHỈ TRỤ SỞ</label>
                <input className="modal-input" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>

              <div className="modal-form-group">
                <label>WEBSITE</label>
                <input className="modal-input" type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
              <div className="modal-form-group">
                <label>NGÀY THÀNH LẬP</label>
                <input className="modal-input" type="date" value={formData.founded_date} onChange={e => setFormData({...formData, founded_date: e.target.value})} />
              </div>

              <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                <label>NHÂN VIÊN CHĂM SÓC</label>
                <select className="modal-select" value={formData.assigned_to || ''} onChange={e => setFormData({...formData, assigned_to: e.target.value})}>
                  <option value="">-- Chọn nhân viên --</option>
                  {users.filter(u => u.is_active !== false && ['group_manager', 'group_staff', 'group_operations', 'group_operations_lead'].includes(u.role_name)).map(u => (
                    <option key={u.id} value={u.id}>{u.full_name || u.username} ({formatRoleDisplayName(u.role_name)})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeTab === 'insight' && (
            <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
              <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="modal-form-group">
                  <label>NGÀY CHỐT ĐƠN ĐẦU / KHỞI HÀNH LẦN ĐẦU</label>
                  <input className="modal-input" type="date" value={formData.first_deal_date} onChange={e => setFormData({...formData, first_deal_date: e.target.value})} />
                </div>
              </div>

              {/* TRẢI NGHIỆM */}
              <div className="modal-form-group">
                <label>TRẢI NGHIỆM ĐỀ CAO / SỞ THÍCH</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {EXPERIENCE_OPTIONS.map(opt => {
                    const isSelected = formData.experiences.includes(opt);
                    return (
                      <button type="button" key={opt} onClick={() => toggleArrayItem('experiences', opt)}
                        style={{ padding: '6px 12px', borderRadius: '20px', border: isSelected ? '1px solid #10b981' : '1px solid #e2e8f0', background: isSelected ? '#ecfdf5' : '#f8fafc', color: isSelected ? '#047857' : '#475569', fontSize: '0.8rem', fontWeight: isSelected ? 600 : 500, cursor: 'pointer' }}>
                        {opt}
                      </button>
                    );
                  })}
                  {formData.experiences.filter(d => !EXPERIENCE_OPTIONS.includes(d)).map(opt => (
                     <button type="button" key={opt} onClick={() => toggleArrayItem('experiences', opt)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #10b981', background: '#ecfdf5', color: '#047857', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                       {opt} ✕
                     </button>
                  ))}
                  <input type="text" placeholder="+ Khác..." style={{ padding: '6px 12px', borderRadius: '20px', border: '1px dashed #cbd5e1', fontSize: '0.8rem', background: 'transparent', outline: 'none', width: '100px' }}
                    onKeyDown={e => { if(e.key === 'Enter' && e.target.value.trim()) { e.preventDefault(); toggleArrayItem('experiences', e.target.value.trim()); e.target.value = ''; } }} />
                </div>
              </div>

              {/* KIỂU ĐI */}
              <div className="modal-form-group">
                <label>MỤC ĐÍCH ĐI TOUR CHÍNH</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {TRAVEL_STYLE_OPTIONS.map(opt => {
                    const isSelected = formData.travel_styles.includes(opt);
                    return (
                      <button type="button" key={opt} onClick={() => toggleArrayItem('travel_styles', opt)}
                        style={{ padding: '6px 12px', borderRadius: '20px', border: isSelected ? '1px solid #f59e0b' : '1px solid #e2e8f0', background: isSelected ? '#fffbeb' : '#f8fafc', color: isSelected ? '#b45309' : '#475569', fontSize: '0.8rem', fontWeight: isSelected ? 600 : 500, cursor: 'pointer' }}>
                        {opt}
                      </button>
                    );
                  })}
                  {formData.travel_styles.filter(d => !TRAVEL_STYLE_OPTIONS.includes(d)).map(opt => (
                     <button type="button" key={opt} onClick={() => toggleArrayItem('travel_styles', opt)} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid #f59e0b', background: '#fffbeb', color: '#b45309', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                       {opt} ✕
                     </button>
                  ))}
                  <input type="text" placeholder="+ Khác..." style={{ padding: '6px 12px', borderRadius: '20px', border: '1px dashed #cbd5e1', fontSize: '0.8rem', background: 'transparent', outline: 'none', width: '100px' }}
                    onKeyDown={e => { if(e.key === 'Enter' && e.target.value.trim()) { e.preventDefault(); toggleArrayItem('travel_styles', e.target.value.trim()); e.target.value = ''; } }} />
                </div>
              </div>

              {/* GHI CHÚ YÊU CẦU */}
              <div className="modal-form-group">
                <label>YÊU CẦU ĐẶC BIỆT THƯỜNG TRỰC (Ăn chay, hóa đơn...)</label>
                <textarea className="modal-input" rows="2" value={formData.special_requests} onChange={e => setFormData({...formData, special_requests: e.target.value})} style={{ resize: 'vertical' }} />
              </div>

              {/* GHI CHÚ INSIGHT */}
              <div className="modal-form-group">
                <label>GHI CHÚ THÊM CỦA SALE (Insight đút túi - Văn hóa nội bộ...)</label>
                <textarea className="modal-input" rows="3" value={formData.internal_notes} onChange={e => setFormData({...formData, internal_notes: e.target.value})} style={{ resize: 'vertical', background: '#fef2f2', borderColor: '#fca5a5' }} />
              </div>
            </div>
          )}

          {activeTab === 'history_interaction' && extendedData && (
            <div className="mobile-stack-grid mobile-stack-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              
              {/* Trưởng đoàn & Lịch sử dự án */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
                
                {/* Danh sách Trưởng đoàn */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Danh sách Trưởng đoàn</h3>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', paddingRight: '4px' }}>
                      {!extendedData.contacts || extendedData.contacts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
                          Chưa có trưởng đoàn liên kết.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {extendedData.contacts.map(c => (
                            <div key={c.id} style={{ background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.85rem' }}>
                                    {c.name} {c.is_primary && <span style={{ color: '#d97706', fontSize: '0.75rem' }}>(Chính)</span>}
                                    <button type="button" onClick={() => navigateToLeader(c.id)} title="Đến hồ sơ Trưởng đoàn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px', color: '#3b82f6', verticalAlign: 'middle' }}>
                                        <ExternalLink size={14} />
                                    </button>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone ? `📞 ${c.phone}` : ''} {c.email ? `✉️ ${c.email}` : ''}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Lịch sử dự án */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Lịch sử Dự án (MICE)</h3>
                  <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                    {!extendedData.projects || extendedData.projects.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', background: '#f8fafc', borderRadius: '0.75rem' }}>
                        Chưa có dự án tour nào.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {extendedData.projects.map(proj => (
                          <div key={proj.id} style={{ background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                            <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                {proj.project_name || proj.name}
                                <button type="button" onClick={() => navigateToProject(proj.id)} title="Mở chi tiết Dự án" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#3b82f6' }}>
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                            {proj.leader_name && (
                                <div style={{ fontSize: '0.75rem', color: '#475569', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    👤 <strong>Trưởng đoàn:</strong> {proj.leader_name}
                                    <button type="button" onClick={() => navigateToLeader(proj.group_leader_id)} title="Đến hồ sơ Trưởng đoàn" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#3b82f6' }}>
                                        <ExternalLink size={12} />
                                    </button>
                                </div>
                            )}
                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span>Khởi hành: {proj.departure_date ? new Date(proj.departure_date).toLocaleDateString('vi-VN') : '—'}</span>
                                <span style={{ fontWeight: 600, color: '#10b981' }}>{new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND'}).format(proj.total_revenue || 0)}</span>
                            </div>
                            <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', background: '#f1f5f9', color: '#64748b' }}>
                                {proj.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tương tác & Events */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: '#1e293b' }}>Ghi chú & Sự kiện</h3>
                  <button type="button" onClick={() => setShowMiniEventForm(!showMiniEventForm)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {showMiniEventForm ? 'Đóng form' : '+ LÊN LỊCH HẸN'}
                  </button>
                </div>

                {showMiniEventForm && (
                  <div style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '0.5rem', border: '1px solid #bfdbfe', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1d4ed8' }}>Tạo Lịch Chăm Sóc / Gọi điện</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select style={{ flex: 1, padding: '4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #93c5fd' }} value={miniEvent.event_type} onChange={e => setMiniEvent({...miniEvent, event_type: e.target.value})}>
                        <option value="CALL">📞 Gọi điện</option>
                        <option value="MEETING">🤝 Hẹn gặp mặt</option>
                        <option value="EMAIL">✉️ Gửi Email/HSNL</option>
                        <option value="OTHER">📌 Khác</option>
                      </select>
                      <input type="date" required style={{ flex: 1, padding: '4px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #93c5fd' }} value={miniEvent.event_date} onChange={e => setMiniEvent({...miniEvent, event_date: e.target.value})} />
                    </div>
                    <input type="text" required placeholder="Tiêu đề..." style={{ padding: '6px', fontSize: '0.8rem', borderRadius: '4px', border: '1px solid #93c5fd' }} value={miniEvent.title} onChange={e => setMiniEvent({...miniEvent, title: e.target.value})} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button type="button" onClick={() => setShowMiniEventForm(false)} style={{ padding: '4px 12px', fontSize: '0.75rem', cursor: 'pointer', background: 'transparent', border: 'none', color: '#64748b' }}>Hủy</button>
                      <button type="button" onClick={handleCreateMiniEvent} style={{ padding: '6px 16px', fontSize: '0.75rem', cursor: 'pointer', background: '#3b82f6', color: 'white', borderRadius: '4px', border: 'none', fontWeight: 600 }}>TẠO LỊCH</button>
                    </div>
                  </div>
                )}

                {/* Event list */}
                {extendedData.events && extendedData.events.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                        {extendedData.events.map(ev => (
                            <div key={ev.id} style={{ padding: '8px', background: ev.status === 'completed' ? '#f1f5f9' : '#fffbeb', borderRadius: '6px', border: `1px solid ${ev.status === 'completed' ? '#cbd5e1' : '#fde68a'}`, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 600, color: ev.status === 'completed' ? '#64748b' : '#92400e', textDecoration: ev.status === 'completed' ? 'line-through' : 'none' }}>
                                        {ev.event_type === 'CALL' ? '📞' : ev.event_type==='MEETING' ? '🤝' : '📌'} {ev.title}
                                    </div>
                                    <div style={{ color: '#94a3b8' }}>{new Date(ev.event_date).toLocaleDateString('vi-VN')} - {ev.creator_name}</div>
                                </div>
                                <div>
                                    <input type="checkbox" checked={ev.status === 'completed'} onChange={() => toggleEventStatus(ev.id, ev.status)} style={{ cursor: 'pointer', width: '16px', height: '16px' }} title={ev.status === 'completed' ? 'Đánh dấu chưa xong' : 'Đánh dấu hoàn thành'} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input className="modal-input" style={{ flex: 1 }} placeholder="Nhập ghi chú nhanh..." value={newNote} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNote(); } }} onChange={e => setNewNote(e.target.value)} />
                  <button type="button" onClick={handleAddNote} className="btn-pro-save" style={{ width: 'auto', padding: '0 1rem' }}>GỬI</button>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', background: '#f8fafc', padding: '1rem', borderRadius: '0.75rem' }}>
                  {!extendedData.interaction_history || extendedData.interaction_history.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#94a3b8', padding: '1rem' }}>Chưa có ghi chú cũ.</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {extendedData.interaction_history.map(note => (
                        <div key={note.id} style={{ padding: '0.75rem', background: 'white', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                            <strong style={{ color: '#3b82f6' }}>{note.creator_name}</strong>
                            <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                          </div>
                          <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{note.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', paddingTop: '1.5rem', marginTop: 'auto', borderTop: '1px solid #e2e8f0' }}>
            {activeTab !== 'history_interaction' && (
                <button type="submit" disabled={isSubmitting} className="btn-pro-save" style={{ flex: 1 }}>{company.id ? 'CẬP NHẬT THÔNG TIN' : 'TẠO CÔNG TY MỚI'}</button>
            )}
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={onClose}>ĐÓNG</button>
          </div>
        </form>

      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default B2BCompanyModal;
