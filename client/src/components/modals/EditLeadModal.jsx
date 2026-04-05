import { useState, useEffect } from 'react';
import { X, ChevronLeft, CheckCircle, PlusCircle, Send, Clock, FileText, LogOut, TrendingUp, UserPlus, Package, AlertTriangle, ExternalLink } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';
import axios from 'axios';

const EditLeadModal = ({ 
  editingLead, 
  setEditingLead, 
  handleUpdateLead, 
  handleConvertLead, 
  LEAD_SOURCES, 
  LEAD_CLASSIFICATIONS, 
  LEAD_STATUSES,
  tours, 
  users, 
  leadNotes, 
  newNote, 
  setNewNote, 
  handleAddNoteForLead,
  bus,
  loading
}) => {
  const [existingCustomer, setExistingCustomer] = useState(null);

  useEffect(() => {
    if (!editingLead?.phone || editingLead.phone.trim().length < 8) {
      setExistingCustomer(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const phoneTrimmed = editingLead.phone.toString().trim();
        if (phoneTrimmed.length < 8) return;
        const res = await axios.get(`/api/customers/check-phone?phone=${phoneTrimmed}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.data.exists && res.data.customer.id !== editingLead.customer_id) {
          setExistingCustomer(res.data.customer);
        } else {
          setExistingCustomer(null);
        }
      } catch (err) {}
    }, 500);
    return () => clearTimeout(timer);
  }, [editingLead?.phone, editingLead?.customer_id]);

  if (!editingLead) return null;
  
  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
    } catch (e) {
      return '';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '2rem', background: 'white', borderRadius: '1.5rem', border: '1px solid #e2e8f0', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>FIT Tour CRM / Leads</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Chỉnh sửa Hồ sơ Lead</h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Cập nhật tiến trình chăm sóc và thông tin tư vấn.</p>
      
      {existingCustomer && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ padding: '8px', background: '#fef3c7', color: '#d97706', borderRadius: '8px' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#b45309', fontWeight: 800, margin: '0 0 6px 0', fontSize: '1rem' }}>SĐT trùng với danh bạ Khách hàng cũ!</h4>
            <p style={{ color: '#92400e', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Bản ghi khách hàng đang chăm sóc trùng khớp với thông tin trong CSDL.
              <br/>
              Tên gốc: <strong>{existingCustomer.name}</strong> • Phân hạng: <strong>{existingCustomer.customer_segment}</strong> ({existingCustomer.total_trips || 0} chuyến)
            </p>
            <div style={{ marginTop: '8px' }}>
              <a 
                href={`/customers?view=${existingCustomer.id}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#d97706', textDecoration: 'none', background: '#fef3c7', padding: '4px 10px', borderRadius: '4px' }}
              >
                <ExternalLink size={14} /> KIỂM TRA HỒ SƠ GỐC TẠI ĐÂY
              </a>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
        <button type="button" className="btn-pro-cancel" style={{ width: 'auto', border: 'none', background: 'white', fontWeight: 800, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => setEditingLead(null)}>
          <ChevronLeft size={18} strokeWidth={3} /> QUAY LẠI
        </button>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button type="button" className="btn-pro-save" style={{ width: 'auto', background: '#10b981' }} onClick={() => {
            setEditingLead({...editingLead, status: 'Chốt đơn'});
            handleConvertLead(editingLead.id);
          }}>
             <CheckCircle size={18} strokeWidth={3} /> CHỐT ĐƠN & CHUYỂN KHÁCH
          </button>
          <button type="button" onClick={() => setEditingLead(null)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      <form onSubmit={handleUpdateLead} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {/* SECTION 1: TIẾN ĐỘ XỬ LÝ (PROCESS) */}
        <div style={{ gridColumn: 'span 3', padding: '10px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={18} color="#6366f1" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>TIẾN ĐỘ & TRẠNG THÁI XỬ LÝ</h3>
        </div>

        <div className="modal-form-group">
          <label style={{ color: '#6366f1', fontWeight: 800 }}>TRẠNG THÁI HIỆN TẠI</label>
          <select 
            className="modal-select" 
            style={{ border: '2px solid #e0e7ff', background: '#f5f7ff', fontWeight: 700 }}
            value={editingLead.status || ''} 
            onChange={e => setEditingLead({...editingLead, status: e.target.value})}
          >
            {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-form-group">
          <label>THỜI GIAN LIÊN HỆ</label>
          <input className="modal-input" type="datetime-local" value={formatDateTime(editingLead.last_contacted_at)} onChange={e => setEditingLead({...editingLead, last_contacted_at: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>THỜI GIAN CHỐT ĐƠN (BOOK)</label>
          <input className="modal-input" type="datetime-local" value={formatDateTime(editingLead.won_at)} onChange={e => setEditingLead({...editingLead, won_at: e.target.value})} />
        </div>

        {/* SECTION 2: THÔNG TIN KHÁCH HÀNG */}
        <div style={{ gridColumn: 'span 3', padding: '10px 0', borderBottom: '1px solid #f1f5f9', marginTop: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus size={18} color="#64748b" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>THÔNG TIN CƠ BẢN</h3>
        </div>

        <div className="modal-form-group">
          <label>HỌ VÀ TÊN *</label>
          <input className="modal-input" required value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>SỐ ĐIỆN THOẠI *</label>
          <input className="modal-input" value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>EMAIL</label>
          <input className="modal-input" type="email" value={editingLead.email || ''} onChange={e => setEditingLead({...editingLead, email: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>FACEBOOK ID (PSID)</label>
          <input className="modal-input" disabled value={editingLead.facebook_psid || ''} style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
        </div>
        <div className="modal-form-group">
          <label>GIỚI TÍNH</label>
          <select className="modal-select" value={editingLead.gender || ''} onChange={e => setEditingLead({...editingLead, gender: e.target.value})}>
            <option value="">-- Giới tính --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div className="modal-form-group">
          <label>NGÀY SINH</label>
          <input className="modal-input" type="date" value={formatDate(editingLead.birth_date)} onChange={e => setEditingLead({...editingLead, birth_date: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>NHÓM BU (TƯ VẤN)</label>
          <select 
            className="modal-select" 
            value={editingLead.bu_group || ''} 
            onChange={e => setEditingLead({...editingLead, bu_group: e.target.value})}
          >
            <option value="">-- Tất cả BU --</option>
            {bus.map(bu => <option key={bu.id} value={bu.id}>{bu.label}</option>)}
          </select>
        </div>

        {/* SECTION 3: THÔNG TIN TOUR & PHÂN LOẠI */}
        <div style={{ gridColumn: 'span 3', padding: '10px 0', borderBottom: '1px solid #f1f5f9', marginTop: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={18} color="#64748b" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>SẢN PHẨM & PHÂN LOẠI</h3>
        </div>

        <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
          <label>SẢN PHẨM QUAN TÂM</label>
          <SearchableSelect 
            options={tours}
            value={editingLead.tour_id}
            onChange={(val) => setEditingLead({...editingLead, tour_id: val})}
            placeholder="Chọn tour quan tâm..."
          />
        </div>
        <div className="modal-form-group">
          <label>NGUỒN KHÁCH HÀNG</label>
          <select className="modal-select" value={editingLead.source || ''} onChange={e => setEditingLead({...editingLead, source: e.target.value})}>
            {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-form-group">
          <label>PHÂN LOẠI KHÁCH HÀNG</label>
          <select className="modal-select" value={editingLead.classification || ''} onChange={e => setEditingLead({...editingLead, classification: e.target.value})}>
            {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="modal-form-group">
          <label>TƯ VẤN VIÊN (CSKH)</label>
          <select className="modal-select" value={editingLead.assigned_to || ''} onChange={e => setEditingLead({...editingLead, assigned_to: e.target.value})}>
             <option value="">-- Chọn nhân viên --</option>
             {users.filter(u => u.is_active !== false).map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </div>

        <div className="modal-form-group" style={{ gridColumn: 'span 3' }}>
          <label>GHI CHÚ CHI TIẾT</label>
          <textarea className="modal-textarea" style={{ height: '80px' }} value={editingLead.consultation_note || ''} onChange={e => setEditingLead({...editingLead, consultation_note: e.target.value})} />
        </div>

        <div className="consultation-section animate-fade-in" style={{ gridColumn: 'span 3' }}>
          <h2 className="consultation-title">Lịch sử tư vấn & Chăm sóc</h2>
          <p className="consultation-subtitle">Theo dõi các lần trao đổi và ghi chú tiến trình với khách hàng.</p>
          
          <div className="note-input-container">
            <div className="note-input-label">
              <PlusCircle size={18} /> THÊM GHI CHÚ MỚI
            </div>
            <textarea 
              className="note-textarea" 
              placeholder="Nhập nội dung tư vấn..." 
              value={newNote} 
              onChange={e => setNewNote(e.target.value)}
            />
            <button type="button" className="note-submit-btn" onClick={() => handleAddNoteForLead(editingLead.id)}>
              <Send size={16} /> Gửi
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {leadNotes.map(note => (
              <div key={note.id} style={{ padding: '1.5rem', background: 'white', borderRadius: '1rem', border: '1px solid #eaeff4', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '24px', height: '24px', background: '#f1f5f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: '#6366f1' }}>
                      {note.creator_name?.charAt(0) || 'U'}
                    </div>
                    <strong>{note.creator_name}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    <span>{new Date(note.created_at).toLocaleString('vi-VN')}</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.95rem', color: '#1e293b', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{note.content}</div>
              </div>
            ))}
            {leadNotes.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', border: '2px dashed #f1f5f9', borderRadius: '1rem' }}>
                <FileText size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <div>Chưa có lịch sử tư vấn nào.</div>
              </div>
            )}
          </div>
        </div>

        <div style={{ gridColumn: 'span 3', display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
          <button type="submit" className="btn-pro-save" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
            <CheckCircle size={18} strokeWidth={3} /> {loading ? 'ĐANG LƯU...' : 'CẬP NHẬT HỒ SƠ'}
          </button>
          <button type="button" className="btn-pro-cancel" onClick={() => setEditingLead(null)} disabled={loading}>
            <LogOut size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLeadModal;
