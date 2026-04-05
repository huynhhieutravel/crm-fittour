import React, { useState, useEffect } from 'react';
import { X, PlusCircle, LogOut, AlertTriangle, ExternalLink } from 'lucide-react';
import SearchableSelect from '../common/SearchableSelect';
import axios from 'axios';

const AddLeadModal = ({ 
  showAddLeadModal, 
  setShowAddLeadModal, 
  handleAddLead, 
  newLead, 
  setNewLead, 
  LEAD_SOURCES, 
  LEAD_CLASSIFICATIONS, 
  LEAD_STATUSES,
  tours, 
  users,
  bus
}) => {
  const [existingCustomer, setExistingCustomer] = useState(null);

  useEffect(() => {
    if (!newLead.phone || newLead.phone.trim().length < 8) {
      setExistingCustomer(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/customers/check-phone?phone=${newLead.phone.trim()}`, {
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
  }, [newLead.phone]);

  if (!showAddLeadModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowAddLeadModal(false)}>
      <div className="modal-content animate-fade-in" style={{ maxWidth: '800px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={() => setShowAddLeadModal(false)}>
          <X size={18} strokeWidth={3} />
        </button>
        <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Hệ thống Quản lý Lead</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem' }}>Thêm Lead Marketing Mới</h2>
        
        {existingCustomer && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ padding: '8px', background: '#fef3c7', color: '#d97706', borderRadius: '8px' }}>
              <AlertTriangle size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ color: '#b45309', fontWeight: 800, margin: '0 0 6px 0', fontSize: '1rem' }}>Phát hiện Khách hàng cũ!</h4>
              <p style={{ color: '#92400e', margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>
                Số điện thoại này đã tồn tại trong Danh mục Khách Hàng Cơ Sở.
                <br/>
                Tên: <strong>{existingCustomer.name}</strong> • Phân hạng: <strong>{existingCustomer.customer_segment}</strong> ({existingCustomer.total_trips || 0} chuyến đi)
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

        <form onSubmit={handleAddLead} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="modal-form-group" style={existingCustomer ? { opacity: 0.5 } : {}}>
            <label>TÊN KHÁCH HÀNG *</label>
            <input className="modal-input" required value={newLead.name} onChange={e => setNewLead({...newLead, name: e.target.value})} placeholder="Nguyễn Văn A..." />
          </div>
          <div className="modal-form-group">
            <label>SỐ ĐIỆN THOẠI</label>
            <input className="modal-input" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} placeholder="0901 234..." style={existingCustomer ? { borderColor: '#f59e0b', backgroundColor: '#fffbeb', color: '#92400e', fontWeight: 800 } : {}} />
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
            <label>SẢN PHẨM QUAN TÂM</label>
            <SearchableSelect 
              options={tours}
              value={newLead.tour_id}
              onChange={(val) => setNewLead({...newLead, tour_id: val})}
              placeholder="Chọn tour quan tâm..."
            />
          </div>

          <div className="modal-form-group">
            <label>TƯ VẤN VIÊN (CSKH)</label>
            <select className="modal-select" value={newLead.assigned_to || ''} onChange={e => setNewLead({...newLead, assigned_to: e.target.value})}>
              <option value="">-- Chọn nhân viên --</option>
              {users.filter(u => u.is_active !== false).map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>NHÓM BU (TƯ VẤN)</label>
            <select 
              className="modal-select" 
              value={newLead.bu_group} 
              onChange={e => setNewLead({...newLead, bu_group: e.target.value})}
            >
              <option value="">-- Tất cả BU --</option>
              {bus.map(bu => <option key={bu.id} value={bu.id}>{bu.label}</option>)}
            </select>
          </div>
          
          <div className="modal-form-group">
            <label>TRẠNG THÁI HIỆN TẠI</label>
            <select 
              className="modal-select" 
              style={{ border: '2px solid #e0e7ff', background: '#f5f7ff', fontWeight: 700 }}
              value={newLead.status || ''} 
              onChange={e => setNewLead({...newLead, status: e.target.value})}
            >
              {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="modal-form-group">
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
