import { useState, useEffect } from 'react';
import { X, ChevronLeft, CheckCircle, PlusCircle, Send, Clock, FileText, LogOut, TrendingUp, UserPlus, Package, AlertTriangle, ExternalLink, Compass } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';
import axios from 'axios';
import { getLocalIsoString, getLocalDateTimeLocal } from '../../utils/dateUtils';

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
  const [activeTab, setActiveTab] = useState(editingLead?.openTab || 'info');
  const [localReminders, setLocalReminders] = useState([]);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [customerJourney, setCustomerJourney] = useState(null);
  const [loadingJourney, setLoadingJourney] = useState(false);

  useEffect(() => {
    if (activeTab === 'journey' && editingLead?.id && customerJourney === null) {
       setLoadingJourney(true);
       axios.get(`/api/leads/${editingLead.id}/customer-journey`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }})
       .then(res => setCustomerJourney(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoadingJourney(false));
    }
  }, [activeTab, editingLead?.id]);

  useEffect(() => {
    if (activeTab === 'history' && editingLead?.id) {
       setLoadingReminders(true);
       axios.get(`/api/reminders/leads/by-lead/${editingLead.id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }})
       .then(res => setLocalReminders(res.data))
       .catch(err => console.error(err))
       .finally(() => setLoadingReminders(false));
    }
  }, [activeTab, editingLead?.id]);

  const handleNoteWithReminder = async () => {
    try {
      await handleAddNoteForLead(editingLead.id);
      
      const inlineReminderDate = document.getElementById('inline_reminder_date')?.value;
      const inlineReminderAssignedTo = document.getElementById('inline_reminder_assigned_to')?.value;
      
      if (inlineReminderDate) {
         await axios.post(`/api/reminders/leads`, {
            title: `Lịch hẹn từ Ghi chú: ${newNote.substring(0, 50)}...`,
            lead_id: editingLead.id,
            due_date: getLocalIsoString(inlineReminderDate),
            assigned_to: inlineReminderAssignedTo || null
         }, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
         
         const res = await axios.get(`/api/reminders/leads/by-lead/${editingLead.id}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
         setLocalReminders(res.data);
         
         if (document.getElementById('inline_reminder_date')) {
             document.getElementById('inline_reminder_date').value = '';
         }
      }
    } catch (e) {
      console.error(e);
      alert('Có lỗi khi tạo lịch hẹn nhắc nhở');
    }
  };

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
        if (res.data.exists) {
          setExistingCustomer(res.data.customer);
        } else {
          setExistingCustomer(null);
        }
      } catch (err) {}
    }, 500);
    return () => clearTimeout(timer);
  }, [editingLead?.phone, editingLead?.customer_id]);

  if (!editingLead) return null;

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return getLocalDateTimeLocal(new Date(dateString));
  };



  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '';
      return new Date(date).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="animate-fade-in edit-lead-container">
      <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>FIT Tour CRM / Leads</div>
      <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
        Chỉnh sửa Hồ sơ Lead
        {editingLead.is_locked && <span style={{ fontSize: '1rem', background: '#f87171', color: 'white', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={16} /> DATA BỊ KHÓA</span>}
      </h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Cập nhật tiến trình chăm sóc và thông tin tư vấn.</p>
      
      {editingLead.is_locked && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ padding: '8px', background: '#fee2e2', color: '#ef4444', borderRadius: '8px' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#991b1b', fontWeight: 800, margin: '0 0 6px 0', fontSize: '1rem' }}>Hồ sơ thuộc về tư vấn viên khác</h4>
            <p style={{ color: '#7f1d1d', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Bạn không có quyền thay đổi thông tin hay gán lại Người phụ trách cho Lead này. Số điện thoại đã được ẩn bảo mật. Bạn chỉ có thể theo dõi tiến độ tư vấn.
            </p>
          </div>
        </div>
      )}
      
      {existingCustomer && (
        <div style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ padding: '8px', background: '#d1fae5', color: '#059669', borderRadius: '8px' }}>
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: '#047857', fontWeight: 800, margin: '0 0 6px 0', fontSize: '1rem' }}>🌟 KHÁCH QUEN ĐÃ ĐI TOUR</h4>
            <p style={{ color: '#065f46', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
              Tên khách: <strong>{existingCustomer.name}</strong> • Phân hạng: <strong>{existingCustomer.customer_segment || 'Thường'}</strong> ({existingCustomer.total_trips || 0} chuyến)
            </p>
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <a 
                href={`/customers?view=${existingCustomer.id}`} 
                target="_blank" 
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#047857', textDecoration: 'none', background: '#d1fae5', padding: '6px 12px', borderRadius: '6px' }}
              >
                <ExternalLink size={14} /> MỞ HỒ SƠ KHÁCH HÀNG
              </a>
              {!editingLead.customer_id && (
                <span style={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.8rem', color: '#059669', fontStyle: 'italic' }}>
                  (Sẽ tự động liên kết khi bấm Ghi nhận & Lưu)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="modal-header-actions">
        <button type="button" className="btn-pro-cancel" style={{ border: 'none', background: 'white', fontWeight: 800, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} onClick={() => setEditingLead(null)}>
          <ChevronLeft size={18} strokeWidth={3} /> QUAY LẠI
        </button>
        <div className="modal-header-actions-group">
          {!editingLead.is_locked && (
             <button type="button" className="btn-pro-save" style={{ width: 'auto', background: '#10b981' }} onClick={() => {
               setEditingLead({...editingLead, status: 'Chốt đơn'});
               handleConvertLead(editingLead.id);
             }}>
                <CheckCircle size={18} strokeWidth={3} /> CHỐT ĐƠN & CHUYỂN KHÁCH
             </button>
          )}
          <button type="button" onClick={() => setEditingLead(null)} style={{ background: '#fee2e2', color: '#dc2626', border: 'none', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={24} strokeWidth={3} />
          </button>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
        <button 
          onClick={() => setActiveTab('info')}
          style={{ 
            padding: '10px 16px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'info' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'info' ? '#6366f1' : '#64748b',
            fontWeight: activeTab === 'info' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserPlus size={16} /> Thông tin Lead
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          style={{ 
            padding: '10px 16px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'history' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'history' ? '#6366f1' : '#64748b',
            fontWeight: activeTab === 'history' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FileText size={16} /> Lịch sử tư vấn
        </button>
        <button 
          onClick={() => setActiveTab('journey')}
          style={{ 
            padding: '10px 16px', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'journey' ? '2px solid #6366f1' : '2px solid transparent',
            color: activeTab === 'journey' ? '#6366f1' : '#64748b',
            fontWeight: activeTab === 'journey' ? 800 : 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Compass size={16} /> Hành trình Khách hàng
        </button>
      </div>
      
      <form onSubmit={handleUpdateLead}>
        <div className="modal-grid-3" style={{ display: activeTab === 'info' ? 'grid' : 'none' }}>
        {/* SECTION 1: TIẾN ĐỘ XỬ LÝ (PROCESS) */}
        <div style={{ gridColumn: 'span 3', padding: '10px 0', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={18} color="#6366f1" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>TIẾN ĐỘ & TRẠNG THÁI XỬ LÝ</h3>
        </div>

        <div className="modal-form-group">
          <label style={{ color: '#6366f1', fontWeight: 800 }}>TRẠNG THÁI HIỆN TẠI</label>
          <select 
            disabled={editingLead.is_locked}
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
          <input disabled={editingLead.is_locked} className="modal-input" type="datetime-local" value={getLocalDateTimeLocal(editingLead.last_contacted_at)} onChange={e => setEditingLead({...editingLead, last_contacted_at: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>THỜI GIAN CHỐT ĐƠN (BOOK)</label>
          <input disabled={editingLead.is_locked} className="modal-input" type="datetime-local" value={getLocalDateTimeLocal(editingLead.won_at)} onChange={e => setEditingLead({...editingLead, won_at: e.target.value})} />
        </div>

        {/* SECTION 2: THÔNG TIN KHÁCH HÀNG */}
        <div style={{ gridColumn: 'span 3', padding: '10px 0', borderBottom: '1px solid #f1f5f9', marginTop: '1rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <UserPlus size={18} color="#64748b" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>THÔNG TIN CƠ BẢN</h3>
        </div>

        <div className="modal-form-group">
          <label>HỌ VÀ TÊN *</label>
          <input disabled={editingLead.is_locked} className="modal-input" required value={editingLead.name} onChange={e => setEditingLead({...editingLead, name: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>SỐ ĐIỆN THOẠI *</label>
          <input disabled={editingLead.is_locked} className="modal-input" value={editingLead.phone} onChange={e => setEditingLead({...editingLead, phone: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>EMAIL</label>
          <input disabled={editingLead.is_locked} className="modal-input" type="email" value={editingLead.email || ''} onChange={e => setEditingLead({...editingLead, email: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>FACEBOOK ID (PSID)</label>
          <input className="modal-input" disabled value={editingLead.facebook_psid || ''} style={{ background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
        </div>
        <div className="modal-form-group">
          <label>GIỚI TÍNH</label>
          <select disabled={editingLead.is_locked} className="modal-select" value={editingLead.gender || ''} onChange={e => setEditingLead({...editingLead, gender: e.target.value})}>
            <option value="">-- Giới tính --</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>
        <div className="modal-form-group">
          <label>NGÀY SINH</label>
          <input disabled={editingLead.is_locked} className="modal-input" type="date" value={formatDate(editingLead.birth_date)} onChange={e => setEditingLead({...editingLead, birth_date: e.target.value})} />
        </div>
        <div className="modal-form-group">
          <label>NHÓM BU (TƯ VẤN)</label>
          <select 
            disabled={editingLead.is_locked}
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
            onChange={(val) => !editingLead.is_locked && setEditingLead({...editingLead, tour_id: val})}
            placeholder="Chọn tour quan tâm..."
            style={{ opacity: editingLead.is_locked ? 0.7 : 1, pointerEvents: editingLead.is_locked ? 'none' : 'auto' }}
          />
        </div>
        <div className="modal-form-group">
          <label>NGUỒN KHÁCH HÀNG</label>
          <select disabled={editingLead.is_locked} className="modal-select" value={editingLead.source || ''} onChange={e => setEditingLead({...editingLead, source: e.target.value})}>
            {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="modal-form-group">
          <label>PHÂN LOẠI KHÁCH HÀNG</label>
          <select disabled={editingLead.is_locked} className="modal-select" value={editingLead.classification || ''} onChange={e => setEditingLead({...editingLead, classification: e.target.value})}>
            {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="modal-form-group">
          <label>TƯ VẤN VIÊN (CSKH)</label>
          <select disabled={editingLead.is_locked} className="modal-select" value={editingLead.assigned_to || ''} onChange={e => setEditingLead({...editingLead, assigned_to: e.target.value})}>
             <option value="">-- Chọn nhân viên --</option>
             {users.filter(u => u.is_active !== false).map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
          </select>
        </div>

        <div className="modal-form-group" style={{ gridColumn: 'span 3' }}>
          <label>GHI CHÚ CHI TIẾT</label>
          <textarea disabled={editingLead.is_locked} className="modal-textarea" style={{ height: '80px' }} value={editingLead.consultation_note || ''} onChange={e => setEditingLead({...editingLead, consultation_note: e.target.value})} />
        </div>
      </div>

      <div style={{ display: activeTab === 'history' ? 'block' : 'none' }}>
        <div className="consultation-section animate-fade-in" style={{ gridColumn: 'span 3' }}>
          <h2 className="consultation-title">Lịch sử tư vấn & Chăm sóc</h2>
          <p className="consultation-subtitle">Theo dõi các lần trao đổi và ghi chú tiến trình với khách hàng.</p>
          
          <div className="note-input-container">
            <div className="note-input-label">
              <PlusCircle size={18} /> THÊM GHI CHÚ MỚI
            </div>
            <textarea 
              disabled={editingLead.is_locked}
              className="note-textarea" 
              placeholder={editingLead.is_locked ? "Data bị khóa, không thể thêm ghi chú" : "Nhập nội dung tư vấn..."} 
              value={newNote} 
              onChange={e => setNewNote(e.target.value)}
            />
            {!editingLead.is_locked && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} /> KÈM LỊCH HẸN NHẮC NHỞ (Tùy chọn)
                </div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                   <button type="button" onClick={() => {
                      const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9,0,0,0);
                      document.getElementById('inline_reminder_date').value = getLocalDateTimeLocal(d);
                   }} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' }}>Sáng mai (9h)</button>
                   <button type="button" onClick={() => {
                      const d = new Date(); d.setDate(d.getDate() + 3);
                      document.getElementById('inline_reminder_date').value = getLocalDateTimeLocal(d);
                   }} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' }}>Sau 3 ngày</button>
                   <button type="button" onClick={() => {
                      const d = new Date(); d.setDate(d.getDate() + 7);
                      document.getElementById('inline_reminder_date').value = getLocalDateTimeLocal(d);
                   }} style={{ padding: '4px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontSize: '0.8rem', color: '#334155' }}>Sau 7 ngày</button>
                </div>
                 <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                   <input type="datetime-local" id="inline_reminder_date" className="modal-input" style={{ background: 'white', maxWidth: '200px' }} />
                   <select id="inline_reminder_assigned_to" className="modal-select" style={{ background: 'white', maxWidth: '180px', padding: '6px' }} defaultValue={editingLead.assigned_to || ''}>
                     <option value="">-- Nhắc bản thân --</option>
                     {users && users
                        .filter(u => u.is_active !== false)
                        .sort((a, b) => {
                            const aInBU = editingLead.bu_group && (a.bus || []).includes(editingLead.bu_group);
                            const bInBU = editingLead.bu_group && (b.bus || []).includes(editingLead.bu_group);
                            if (aInBU && !bInBU) return -1;
                            if (!aInBU && bInBU) return 1;
                            return (a.full_name || a.username || '').localeCompare(b.full_name || b.username || '');
                        })
                        .map(u => (
                       <option key={u.id} value={u.id}>{u.full_name ? `${u.full_name} (${u.username})` : u.username}</option>
                     ))}
                   </select>
                 </div>
              </div>
            )}
            
            <button disabled={editingLead.is_locked} type="button" className="note-submit-btn" style={{ position: 'relative', bottom: 'auto', right: 'auto', opacity: editingLead.is_locked ? 0.5 : 1, width: '100%', padding: '12px', fontSize: '1rem', marginTop: '16px' }} onClick={handleNoteWithReminder}>
              <Send size={18} /> GHI NHẬN & LƯU
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Reminders section */}
            {localReminders.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> Lịch hẹn đang chờ
                </div>
                {localReminders.filter(r => r.status === 'PENDING').map(r => (
                  <div key={r.id} style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#b45309', marginBottom: '4px' }}>{new Date(r.due_date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}</div>
                      <div style={{ fontSize: '0.9rem', color: '#92400e' }}>{r.title}</div>
                    </div>
                    <button type="button" onClick={async () => {
                        try {
                           await axios.put(`/api/reminders/leads/${r.id}/done`, {}, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }});
                           setLocalReminders(localReminders.map(x => x.id === r.id ? {...x, status: 'DONE'} : x));
                        } catch(e) {}
                     }} style={{ background: 'white', color: '#059669', border: '1px solid #a7f3d0', padding: '6px 12px', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>
                        <CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '4px' }} /> Hoàn thành
                     </button>
                  </div>
                ))}
              </div>
            )}

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
                    <span>{new Date(note.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}</span>
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
      </div>

      <div style={{ display: activeTab === 'journey' ? 'block' : 'none' }}>
        <div className="consultation-section animate-fade-in" style={{ gridColumn: 'span 3' }}>
          <h2 className="consultation-title">Hành trình Khách hàng</h2>
          <p className="consultation-subtitle">Toàn bộ lịch sử các lần hỏi Tour trước đây của số điện thoại này.</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem', borderLeft: '2px solid #e2e8f0', paddingLeft: '1.5rem', marginLeft: '1rem' }}>
            {loadingJourney && (
              <div style={{ color: '#64748b', fontSize: '0.9rem' }}><Clock size={14} className="spin" style={{ display: 'inline', marginRight: '6px' }} /> Đang tải hành trình...</div>
            )}
            {!loadingJourney && customerJourney !== null && customerJourney.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '1rem' }}>
                <Compass size={40} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                <div>Không tìm thấy dữ liệu Lead cũ nào.</div>
              </div>
            )}
            {!loadingJourney && customerJourney && customerJourney.map((journeyLead) => (
              <div key={journeyLead.id} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '-2.15rem', top: '0', width: '20px', height: '20px', background: '#fff', border: '4px solid #6366f1', borderRadius: '50%' }}></div>
                
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '1.05rem', marginBottom: '4px' }}>Tour: {journeyLead.tour_name || 'Không xác định'}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', gap: '1rem' }}>
                        <span>Tạo ngày: <strong>{new Date(journeyLead.created_at).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}</strong></span>
                        <span>Phụ trách: <strong>{journeyLead.assigned_name || 'Chưa chia'}</strong></span>
                        <span>Trạng thái: <strong>{journeyLead.status}</strong></span>
                      </div>
                    </div>
                    <a href={`/leads?view=${journeyLead.id}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: '#6366f1', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ExternalLink size={14} /> MỞ LEAD
                    </a>
                  </div>
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {journeyLead.notes && journeyLead.notes.length > 0 ? journeyLead.notes.map(note => (
                      <div key={note.id} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #cbd5e1' }}>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{note.creator_name}</strong>
                          <span>{new Date(note.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{note.content}</div>
                      </div>
                    )) : (
                      <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có ghi chú nào trong Lead này.</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

        <div className="modal-header-actions-group" style={{ gridColumn: '1 / -1', marginTop: '1.5rem', paddingTop: '2rem', borderTop: '1px solid #f1f5f9' }}>
          {!editingLead.is_locked && (
            <button type="submit" className="btn-pro-save" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              <CheckCircle size={18} strokeWidth={3} /> {loading ? 'ĐANG LƯU...' : 'CẬP NHẬT HỒ SƠ'}
            </button>
          )}
          <button type="button" className="btn-pro-cancel" onClick={() => setEditingLead(null)} disabled={loading}>
            <LogOut size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditLeadModal;
