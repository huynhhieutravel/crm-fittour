import React, { useState, useEffect } from 'react';
import { X, Save, DollarSign, Package, Calendar, Clock, ChevronRight, FileText, ChevronLeft, CreditCard, Ship, Train, MoreHorizontal, User } from 'lucide-react';

const SERVICE_TYPES = [
  { value: 'Lưu trú', label: '1. Lưu trú' },
  { value: 'Hàng không', label: '2. Hàng không' },
  { value: 'Vận chuyển', label: '3. Vận chuyển' },
  { value: 'Nhà hàng', label: '4. Nhà hàng' },
  { value: 'Vé tham quan', label: '5. Vé tham quan' },
  { value: 'Bảo hiểm du lịch', label: '6. Bảo hiểm du lịch' },
  { value: 'Thuê SIM', label: '7. Thuê SIM' },
  { value: 'Khác...', label: '8. Khác...' }
];

// Hàm định dạng số có dấu chấm phân cách
const formatMoney = (val) => {
  if (val === 0) return '0';
  if (!val) return '';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Hàm chuyển từ chuỗi có dấu chấm về số thuần túy
const parseMoney = (val) => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/\./g, '')) || 0;
};

const TravelSupportModal = ({ isOpen, onClose, onSave, editingItem, users = [], loading }) => {
  const [formData, setFormData] = useState({
    service_type: '',
    service_name: '',
    usage_date: new Date().toLocaleDateString('en-CA'),
    departure_date: '',
    return_date: '',
    route: '',
    quantity: 1,
    unit_cost: 0,
    unit_price: 0,
    total_cost: 0,
    total_income: 0,
    tax: 0,
    collected_amount: 0,
    notes: '',
    status: 'pending',
    sale_id: '',
    op_id: ''
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        ...editingItem,
        usage_date: editingItem.usage_date ? new Date(editingItem.usage_date).toLocaleDateString('en-CA') : '',
        departure_date: editingItem.departure_date ? new Date(editingItem.departure_date).toLocaleDateString('en-CA') : '',
        return_date: editingItem.return_date ? new Date(editingItem.return_date).toLocaleDateString('en-CA') : '',
      });
    } else {
      setFormData({
        service_type: '',
        service_name: '',
        usage_date: new Date().toLocaleDateString('en-CA'),
        departure_date: '',
        return_date: '',
        route: '',
        quantity: 1,
        unit_cost: 0,
        unit_price: 0,
        total_cost: 0,
        total_income: 0,
        tax: 0,
        collected_amount: 0,
        notes: '',
        status: 'pending',
        sale_id: '',
        op_id: ''
      });
    }
  }, [editingItem, isOpen]);

  if (!isOpen) return null;

  const updateForm = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const profit = parseMoney(formData.total_income) - parseMoney(formData.total_cost) - parseMoney(formData.tax);
  const remaining = parseMoney(formData.total_income) - parseMoney(formData.collected_amount);

  const sortedUsers = [...users].sort((a, b) => (a.username || '').localeCompare(b.username || ''));

  const opsUsers = users.filter(u => {
    if (u.is_active === false) return false;
    const info = ((u.role_name || '') + ' ' + (u.department || '')).toLowerCase();
    return info.includes('điều hành') || info.includes('ops') || info.includes('visa') || info.includes('sale') || info.includes('sales');
  }).sort((a, b) => {
    const getPriority = (u) => {
      const p = ((u.role_name || '') + ' ' + (u.department || '')).toLowerCase();
      if (p.includes('điều hành') || p.includes('ops')) return 1;
      if (p.includes('visa')) return 2;
      return 3;
    };
    const pa = getPriority(a), pb = getPriority(b);
    if (pa !== pb) return pa - pb;
    return (a.username || '').localeCompare(b.username || '');
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1050 }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '800px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        
        {/* Header Chuẩn CRM */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={24} color="#6366f1" />
            {editingItem ? 'CHỈNH SỬA DỊCH VỤ' : 'THÊM MỚI DỊCH VỤ'}
          </h2>
          <button className="icon-btn" type="button" onClick={onClose}><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

               {/* 1. Nhân sự */}
               <div className="modal-form-group">
                 <label>SALE PHỤ TRÁCH</label>
                 <select className="modal-select" value={formData.sale_id} onChange={e => updateForm('sale_id', e.target.value)}>
                    <option value="">-- Chọn Sale --</option>
                    {sortedUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                 </select>
               </div>
               <div className="modal-form-group">
                 <label>NHÂN SỰ ĐH</label>
                 <select className="modal-select" value={formData.op_id || ''} onChange={e => updateForm('op_id', e.target.value)}>
                    <option value="">-- Điều hành --</option>
                    {opsUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                 </select>
               </div>

               {/* 2. Loại + Tên dịch vụ */}
               <div className="modal-form-group">
                 <label>LOẠI DỊCH VỤ *</label>
                 <select className="modal-select" required value={formData.service_type} onChange={e => updateForm('service_type', e.target.value)}>
                   <option value="">-- Chọn loại --</option>
                   {SERVICE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                 </select>
               </div>
               <div className="modal-form-group">
                 <label>NGÀY SỬ DỤNG</label>
                 <input type="date" className="modal-input" value={formData.usage_date} onChange={e => updateForm('usage_date', e.target.value)} />
               </div>
               <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                 <label>NỘI DUNG DỊCH VỤ / ĐOÀN (1 DÒNG) *</label>
                 <input className="modal-input" required placeholder="Đoàn Công ty ABC / Khách sạn XYZ..." value={formData.service_name} onChange={e => updateForm('service_name', e.target.value)} />
               </div>

               {/* 3. Tuyến */}
               <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                 <label>TUYẾN / HÀNH TRÌNH (NẾU CÓ)</label>
                 <input className="modal-input" placeholder="VD: SGN-HAN..." value={formData.route} onChange={e => updateForm('route', e.target.value)} />
               </div>

               {/* 4. Tài chính — theo thứ tự bảng */}
               <div className="nav-section-title" style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>Doanh thu & Chi phí</div>

               <div className="modal-form-group">
                 <label style={{ color: '#991b1b' }}>GIÁ VỐN (ĐƠN VỊ)</label>
                 <input type="text" className="modal-input" value={formatMoney(formData.unit_cost)} onChange={e => updateForm('unit_cost', parseMoney(e.target.value))} />
               </div>
               <div className="modal-form-group">
                 <label style={{ color: '#1e40af' }}>GIÁ BÁN (ĐƠN VỊ)</label>
                 <input type="text" className="modal-input" value={formatMoney(formData.unit_price)} onChange={e => updateForm('unit_price', parseMoney(e.target.value))} />
               </div>
               <div className="modal-form-group">
                 <label>SỐ LƯỢNG</label>
                 <input type="number" step="any" className="modal-input" value={formData.quantity} onChange={e => updateForm('quantity', e.target.value)} />
               </div>
               <div className="modal-form-group">
                 <label>THUẾ / PHÍ THÊM</label>
                 <input type="text" className="modal-input" value={formatMoney(formData.tax)} onChange={e => updateForm('tax', parseMoney(e.target.value))} />
               </div>

               <div className="modal-form-group">
                 <label>TỔNG CHI (TỰ TÍNH/SỬA)</label>
                 <input type="text" className="modal-input" style={{ background: '#fff1f2', fontWeight: 700, color: '#991b1b' }} value={formatMoney(formData.total_cost)} onChange={e => updateForm('total_cost', parseMoney(e.target.value))} />
               </div>
               <div className="modal-form-group">
                 <label>TỔNG THU (TỰ TÍNH/SỬA)</label>
                 <input type="text" className="modal-input" style={{ background: '#eff6ff', fontWeight: 700, color: '#1e40af' }} value={formatMoney(formData.total_income)} onChange={e => updateForm('total_income', parseMoney(e.target.value))} />
               </div>

               <div className="modal-form-group">
                 <label style={{ color: '#4f46e5' }}>KHÁCH ĐÃ TRẢ</label>
                 <input type="text" className="modal-input" style={{ fontWeight: 800, border: '1px solid #c7d2fe' }} value={formatMoney(formData.collected_amount)} onChange={e => updateForm('collected_amount', parseMoney(e.target.value))} />
               </div>
               <div className="modal-form-group">
                 <label>TRẠNG THÁI</label>
                 <select className="modal-select" style={{ background: '#f8fafc', fontWeight: 800 }} value={formData.status} onChange={e => updateForm('status', e.target.value)}>
                   <option value="pending">⏳ ĐANG CHỜ</option>
                   <option value="confirmed">✅ XÁC NHẬN</option>
                   <option value="paid">💰 TẤT TOÁN</option>
                   <option value="cancelled">❌ ĐÃ HỦY</option>
                 </select>
               </div>

               {/* 5. Ghi chú */}
               <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
                 <label>GHI CHÚ / NHẮC NHỞ</label>
                 <textarea className="modal-textarea" rows={3} placeholder="Ghi chú thêm thông tin..." value={formData.notes} onChange={e => updateForm('notes', e.target.value)} />
               </div>

               {/* Bảng tính lợi nhuận tự động */}
               <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                  <div style={{ flex: 1 }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>LỢI NHUẬN DỰ KIẾN</div>
                     <div style={{ fontSize: '1.25rem', fontWeight: 900, color: profit >= 0 ? '#10b981' : '#ef4444' }}>{formatMoney(profit)}đ</div>
                  </div>
                  <div style={{ flex: 1, borderLeft: '1px solid #cbd5e1', paddingLeft: '1rem' }}>
                     <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>CÒN NỢ</div>
                     <div style={{ fontSize: '1.25rem', fontWeight: 900, color: remaining > 0 ? '#f59e0b' : '#94a3b8' }}>{formatMoney(remaining)}đ</div>
                  </div>
               </div>

               {/* Buttons */}
               <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
                  <button type="submit" disabled={loading} className="btn-pro-save" style={{ flex: 1, height: '48px', fontSize: '1.05rem', gap: '8px' }}>
                    {loading ? <div className="animate-spin" style={{ width: '16px', height: '16px', border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%' }} /> : <Save size={20} />}
                    {editingItem ? 'CẬP NHẬT DỮ LIỆU' : 'LƯU DỊCH VỤ MỚI'}
                  </button>
                  <button type="button" onClick={onClose} className="btn-pro-cancel" style={{ width: 'auto', padding: '0 2rem' }}>ĐÓNG</button>
               </div>

        </form>
      </div>
    </div>
  );
};

export default TravelSupportModal;
