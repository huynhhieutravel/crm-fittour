import React from 'react';
import { X, Globe, Trash2, Download } from 'lucide-react';
import axios from 'axios';
export const AddTemplateModal = ({
  showAddTemplateModal,
  setShowAddTemplateModal,
  handleAddTemplate,
  newTemplate,
  setNewTemplate,
  bus
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
          <div className="modal-form-group">
            <label>MÃ TOUR / SẢN PHẨM *</label>
            <input className="modal-input" required value={newTemplate.code || ''} onChange={e => setNewTemplate({...newTemplate, code: e.target.value})} placeholder="Vd: BK6N5D" />
          </div>
          <div className="modal-form-group">
            <label>TÊN TOUR / SẢN PHẨM *</label>
            <input className="modal-input" required value={newTemplate.name} onChange={e => setNewTemplate({...newTemplate, name: e.target.value})} placeholder="Vd: Tour Bắc Kinh - Thượng Hải - Hàng Châu" />
          </div>
          <div className="modal-form-group">
            <label>KHỐI BU (BUSINESS UNIT) *</label>
            <select 
              className="modal-select" 
              required 
              value={newTemplate.bu_group || ''} 
              onChange={e => setNewTemplate({...newTemplate, bu_group: e.target.value, destination: ''})}
            >
              <option value="">-- Chọn BU --</option>
              {bus.map(bu => <option key={bu.id} value={bu.id}>{bu.label}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>ĐIỂM ĐẾN (THEO BU) *</label>
            <select 
              className="modal-select" 
              required 
              disabled={!newTemplate.bu_group}
              value={newTemplate.destination} 
              onChange={e => setNewTemplate({...newTemplate, destination: e.target.value})}
            >
              <option value="">-- Chọn điểm đến --</option>
              {newTemplate.bu_group && bus.find(b => b.id === newTemplate.bu_group)?.countries?.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
          <div className="modal-form-group">
            <label>THỜI LƯỢNG *</label>
            <input className="modal-input" required value={newTemplate.duration} onChange={e => setNewTemplate({...newTemplate, duration: e.target.value})} placeholder="Vd: 6N5Đ" />
          </div>
          <div className="modal-form-group">
            <label>LOẠI TOUR</label>
            <select className="modal-select" value={newTemplate.tour_type} onChange={e => setNewTemplate({...newTemplate, tour_type: e.target.value})}>
              <option value="Group Tour">Group Tour</option>
              <option value="Private Tour">Private Tour</option>
              <option value="Luxury Tour">Luxury Tour</option>
              <option value="MICE Tour">MICE Tour</option>
            </select>
          </div>
          <div className="modal-form-group">
            <label>TRẠNG THÁI HOẠT ĐỘNG (Đồng bộ Quảng cáo)</label>
            <div style={{ display: 'flex', alignItems: 'center', height: '44px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={newTemplate.is_active !== false}
                  onChange={e => setNewTemplate({...newTemplate, is_active: e.target.checked})}
                  style={{ width: '20px', height: '20px', marginRight: '10px', accentColor: '#10b981' }}
                />
                <span style={{ fontWeight: 600, color: newTemplate.is_active !== false ? '#10b981' : '#ef4444' }}>
                  {newTemplate.is_active !== false ? '✅ Đang chạy (Hiển thị Quảng Cáo)' : '❌ Tạm ngưng (Xóa khỏi Quảng Cáo)'}
                </span>
              </label>
            </div>
          </div>
          <div className="modal-form-group">
            <label>TAGS (CÁCH NHAU BẰNG DẤU PHẨY)</label>
            <input className="modal-input" value={newTemplate.tags} onChange={e => setNewTemplate({...newTemplate, tags: e.target.value})} placeholder="Trekking, Văn hóa, Nghỉ dưỡng..." />
          </div>
          <div className="modal-form-group">
             <label>GIÁ NIÊM YẾT DỰ KIẾN</label>
             <p style={{fontSize: '0.75rem', color: '#666', marginBottom: '6px', lineHeight: '1.2'}}>Hệ thống sẽ tự động chuyển thành số chuẩn khi gửi lên Meta.</p>
             <input 
               className="modal-input" 
               type="text" 
               value={newTemplate.base_price ? new Intl.NumberFormat('vi-VN').format(Number(newTemplate.base_price)) : ''} 
               onChange={e => {
                 const rawValue = e.target.value.replace(/\D/g, '');
                 setNewTemplate({...newTemplate, base_price: rawValue ? Number(rawValue) : 0});
               }} 
             />
          </div>
          <div className="modal-form-group">
             <label>GIÁ COST NỘI BỘ</label>
             <input 
               className="modal-input" 
               type="text" 
               value={newTemplate.internal_cost ? new Intl.NumberFormat('vi-VN').format(Number(newTemplate.internal_cost)) : ''} 
               onChange={e => {
                 const rawValue = e.target.value.replace(/\D/g, '');
                 setNewTemplate({...newTemplate, internal_cost: rawValue ? Number(rawValue) : 0});
               }} 
             />
          </div>
          <div className="modal-form-group">
            <label>🖼️ LINK ẢNH ĐẠI DIỆN CHẠY ADS (TUỲ CHỌN)</label>
            <p style={{fontSize: '0.75rem', color: '#666', marginBottom: '6px', lineHeight: '1.2'}}>Bắt buộc để đồng bộ Meta Catalog. Dùng để Meta run Ads, <strong>tỷ lệ 1:1, chuẩn 1080x1080px (Tối thiểu 500x500px)</strong>.</p>
            <input className="modal-input" value={newTemplate.image_url || ''} onChange={e => setNewTemplate({...newTemplate, image_url: e.target.value})} placeholder="https://..." />
          </div>
          <div className="modal-form-group">
            <label>🌐 LINK WEBSITE PUBLIC (TUỲ CHỌN)</label>
            <p style={{fontSize: '0.75rem', color: '#666', marginBottom: '6px', lineHeight: '1.2'}}>Bắt buộc để đồng bộ Meta. Link bài chi tiết để KH click trực tiếp từ FB Ads về Website.</p>
            <input className="modal-input" value={newTemplate.website_link || ''} onChange={e => setNewTemplate({...newTemplate, website_link: e.target.value})} placeholder="https://..." />
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

export const EditTemplateModal = ({
  template,
  onClose,
  onUpdate,
  bus
}) => {
  const [formData, setFormData] = React.useState(template || {});

  React.useEffect(() => {
    if (template) setFormData(template);
  }, [template]);

  if (!template) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>⚙️ CHỈNH SỬA SẢN PHẨM TOUR</h2>
          <button className="icon-btn" onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="modal-form-group">
            <label>MÃ TOUR *</label>
            <input className="modal-input" required value={formData.code || ''} onChange={e => setFormData({...formData, code: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>TÊN SẢN PHẨM *</label>
            <input className="modal-input" required value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>KHỐI BU *</label>
            <select 
              className="modal-select" 
              required 
              value={formData.bu_group || ''} 
              onChange={e => setFormData({...formData, bu_group: e.target.value, destination: ''})}
            >
              <option value="">-- Chọn BU --</option>
              {bus.map(bu => <option key={bu.id} value={bu.id}>{bu.label}</option>)}
            </select>
          </div>
          <div className="modal-form-group">
            <label>ĐIỂM ĐẾN *</label>
            <select 
              className="modal-select" 
              required 
              disabled={!formData.bu_group}
              value={formData.destination || ''} 
              onChange={e => setFormData({...formData, destination: e.target.value})}
            >
              <option value="">-- Chọn điểm đến --</option>
              {formData.bu_group && bus.find(b => b.id === formData.bu_group)?.countries?.map(dest => (
                <option key={dest} value={dest}>{dest}</option>
              ))}
            </select>
          </div>
          <div className="modal-form-group">
            <label>THỜI LƯỢNG *</label>
            <input className="modal-input" required value={formData.duration || ''} onChange={e => setFormData({...formData, duration: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>LOẠI TOUR</label>
            <select className="modal-select" value={formData.tour_type || 'Group Tour'} onChange={e => setFormData({...formData, tour_type: e.target.value})}>
              <option value="Group Tour">Group Tour</option>
              <option value="Private Tour">Private Tour</option>
              <option value="Luxury Tour">Luxury Tour</option>
              <option value="MICE Tour">MICE Tour</option>
            </select>
          </div>
          <div className="modal-form-group">
            <label>TRẠNG THÁI HOẠT ĐỘNG (Đồng bộ Quảng cáo)</label>
            <div style={{ display: 'flex', alignItems: 'center', height: '44px' }}>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}>
                <input 
                  type="checkbox" 
                  checked={formData.is_active !== false}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  style={{ width: '20px', height: '20px', marginRight: '10px', accentColor: '#10b981' }}
                />
                <span style={{ fontWeight: 600, color: formData.is_active !== false ? '#10b981' : '#ef4444' }}>
                  {formData.is_active !== false ? '✅ Đang chạy (Hiển thị Quảng Cáo)' : '❌ Tạm ngưng (Xóa khỏi Quảng Cáo)'}
                </span>
              </label>
            </div>
          </div>
          <div className="modal-form-group">
            <label>GIÁ NIÊM YẾT</label>
            <p style={{fontSize: '0.75rem', color: '#666', marginBottom: '6px', lineHeight: '1.2'}}>Hiển thị có dấu chấm cho dễ đọc, khi gửi Meta API vẫn là số liền.</p>
            <input 
               className="modal-input" 
               type="text" 
               value={(formData.base_price || formData.price) ? new Intl.NumberFormat('vi-VN').format(Number(formData.base_price || formData.price)) : ''} 
               onChange={e => {
                 const rawValue = e.target.value.replace(/\D/g, '');
                 setFormData({...formData, base_price: rawValue ? Number(rawValue) : 0});
               }} 
            />
          </div>
          <div className="modal-form-group">
            <label>🖼️ LINK ẢNH ĐẠI DIỆN CHẠY ADS (TUỲ CHỌN)</label>
            <p style={{fontSize: '0.75rem', color: '#666', marginBottom: '6px', lineHeight: '1.2'}}>Bắt buộc để đồng bộ Meta. Dùng để Meta run Ads, <strong>tỷ lệ 1:1, chuẩn 1080x1080px</strong>.</p>
            <input className="modal-input" value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
          </div>
          <div className="modal-form-group">
            <label>🌐 LINK WEBSITE PUBLIC (TUỲ CHỌN)</label>
            <p style={{fontSize: '0.75rem', color: '#666', marginBottom: '6px', lineHeight: '1.2'}}>Bắt buộc để đồng bộ Meta. Link bài chi tiết để KH click từ FB Ads về Website.</p>
            <input className="modal-input" value={formData.website_link || ''} onChange={e => setFormData({...formData, website_link: e.target.value})} placeholder="https://..." />
          </div>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>ĐIỂM NỔI BẬT</label>
            <p style={{fontSize: '0.75rem', color: '#666', marginBottom: '6px', lineHeight: '1.2'}}>Hiển thị trên FB Catalog dưới dạng văn bản (không hỗ trợ in đậm, màu sắc...). Tối đa 5000 ký tự.</p>
            <textarea className="modal-textarea" value={formData.highlights || ''} onChange={e => setFormData({...formData, highlights: e.target.value})} />
          </div>
          <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>CẬP NHẬT SẢN PHẨM</button>
            <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={onClose}>HỦY</button>
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

  const handleAddPriceRule = () => {
    const newRules = [...(newDeparture.price_rules || []), { id: Math.random().toString(36).substring(7), name: '', price: 0, is_default: false }];
    setNewDeparture({...newDeparture, price_rules: newRules});
  };

  const handleUpdatePriceRule = (idx, field, val) => {
    const newRules = [...(newDeparture.price_rules || [])];
    newRules[idx][field] = field === 'price' ? Number(val) : val;
    setNewDeparture({...newDeparture, price_rules: newRules});
  };

  const handleRemovePriceRule = (idx) => {
    const newRules = [...(newDeparture.price_rules || [])];
    newRules.splice(idx, 1);
    setNewDeparture({...newDeparture, price_rules: newRules});
  };

  const handleAddAddon = () => {
    const srvs = [...(newDeparture.additional_services || []), { id: Math.random().toString(36).substring(7), name: '', price: 0 }];
    setNewDeparture({...newDeparture, additional_services: srvs});
  };

  const handleUpdateAddon = (idx, field, val) => {
    const srvs = [...(newDeparture.additional_services || [])];
    srvs[idx][field] = field === 'price' ? Number(val) : val;
    setNewDeparture({...newDeparture, additional_services: srvs});
  };

  const handleRemoveAddon = (idx) => {
    const srvs = [...(newDeparture.additional_services || [])];
    srvs.splice(idx, 1);
    setNewDeparture({...newDeparture, additional_services: srvs});
  };

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
              {tourTemplates.map(t => <option key={t.id} value={t.id}>{t.code ? `[${t.code}] ` : ''}{t.name}</option>)}
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
          <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>BẢNG GIÁ VÉ (VND)</h4>
              <button type="button" onClick={handleAddPriceRule} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                + Thêm loại vé
              </button>
            </div>
            
            {(newDeparture.price_rules || []).map((pr, idx) => (
              <div key={pr.id || idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input 
                  className="modal-input" style={{ flex: 1, padding: '8px' }} type="text" 
                  placeholder="Tên loại vé (Vd: Trẻ em không giường)" 
                  value={pr.name} 
                  onChange={e => handleUpdatePriceRule(idx, 'name', e.target.value)} 
                  disabled={pr.is_default && pr.name === 'Người lớn'}
                />
                <input 
                  className="modal-input" style={{ width: '150px', padding: '8px' }} type="text" 
                  placeholder="Giá vé tiền" 
                  value={new Intl.NumberFormat('vi-VN').format(pr.price || 0)} 
                  onChange={e => handleUpdatePriceRule(idx, 'price', e.target.value.replace(/\D/g, ''))} 
                />
                {!pr.is_default ? (
                  <button type="button" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} onClick={() => handleRemovePriceRule(idx)}>
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <div style={{ width: '28px' }}></div>
                )}
              </div>
            ))}
            {(!newDeparture.price_rules || newDeparture.price_rules.length === 0) && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có bảng giá cho lịch khởi hành này.</div>
            )}
          </div>

          <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>DỊCH VỤ KÈM THEO / PHỤ THU (VND)</h4>
              <button type="button" onClick={handleAddAddon} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                + Thêm dịch vụ
              </button>
            </div>
            
            {(newDeparture.additional_services || []).map((srv, idx) => (
              <div key={srv.id || idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input 
                  className="modal-input" style={{ flex: 1, padding: '8px' }} type="text" 
                  placeholder="Tên dịch vụ (Vd: Phụ thu phòng đơn, Vé máy bay...)" 
                  value={srv.name} 
                  onChange={e => handleUpdateAddon(idx, 'name', e.target.value)} 
                />
                <input 
                  className="modal-input" style={{ width: '150px', padding: '8px' }} type="text" 
                  placeholder="Phí dịch vụ" 
                  value={new Intl.NumberFormat('vi-VN').format(srv.price || 0)} 
                  onChange={e => handleUpdateAddon(idx, 'price', e.target.value.replace(/\D/g, ''))} 
                />
                <button type="button" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} onClick={() => handleRemoveAddon(idx)}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {(!newDeparture.additional_services || newDeparture.additional_services.length === 0) && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Không có phụ thu / dịch vụ phát sinh nào.</div>
            )}
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
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>GHI CHÚ KHI LÊN LỊCH</label>
            <textarea className="modal-textarea" rows={3} placeholder="Ghi chú thêm về lịch khởi hành này..." value={newDeparture.notes || ''} onChange={e => setNewDeparture({...newDeparture, notes: e.target.value})} />
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

export const EditDepartureModal = ({
  showEditDepartureModal,
  setShowEditDepartureModal,
  handleUpdateDeparture,
  editingDeparture,
  setEditingDeparture,
  tourTemplates,
  guides
}) => {
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loadingBookings, setLoadingBookings] = React.useState(false);
  const [linkedBookings, setLinkedBookings] = React.useState([]);

  React.useEffect(() => {
    if (showEditDepartureModal && editingDeparture) {
      setErrorMsg('');
      setLoadingBookings(true);
      const token = localStorage.getItem('token');
      axios.get(`/api/departures/${editingDeparture.id}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setLinkedBookings(res.data);
      }).catch(err => {
        console.error('Failed to load linked bookings:', err);
      }).finally(() => {
        setLoadingBookings(false);
      });
    }
  }, [showEditDepartureModal, editingDeparture?.id]);

  if (!showEditDepartureModal || !editingDeparture) return null;

  const handleExportCSV = () => {
    if (linkedBookings.length === 0) return alert('Không có khách để xuất!');
    let csv = '\uFEFF'; // BOM cho UTF-8
    csv += 'STT,MÃ ĐƠN,TÊN KHÁCH HÀNG,SĐT KHÁCH,SỐ PAX,GHI CHÚ (PHÂN PHÒNG),TRẠNG THÁI THANH TOÁN\n';
    linkedBookings.forEach((bk, i) => {
      const row = [
        i + 1,
        bk.booking_code || '',
        bk.customer_name ? `"${bk.customer_name.replace(/"/g, '""')}"` : '',
        bk.customer_phone || '',
        bk.pax_count || 0,
        bk.notes ? `"${bk.notes.replace(/"/g, '""')}"` : '',
        bk.payment_status === 'paid' ? 'Đã Thanh Toán' : 'Chưa thu đủ'
      ];
      csv += row.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `DanhSachDoan_${editingDeparture.code || 'Tour'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddPriceRule = () => {
    const newRules = [...(editingDeparture.price_rules || []), { id: Math.random().toString(36).substring(7), name: '', price: 0, is_default: false }];
    setEditingDeparture({...editingDeparture, price_rules: newRules});
  };

  const handleUpdatePriceRule = (idx, field, val) => {
    const newRules = [...(editingDeparture.price_rules || [])];
    newRules[idx][field] = field === 'price' ? Number(val) : val;
    setEditingDeparture({...editingDeparture, price_rules: newRules});
  };

  const handleRemovePriceRule = (idx) => {
    const newRules = [...(editingDeparture.price_rules || [])];
    newRules.splice(idx, 1);
    setEditingDeparture({...editingDeparture, price_rules: newRules});
  };

  const handleAddAddon = () => {
    const srvs = [...(editingDeparture.additional_services || []), { id: Math.random().toString(36).substring(7), name: '', price: 0 }];
    setEditingDeparture({...editingDeparture, additional_services: srvs});
  };

  const handleUpdateAddon = (idx, field, val) => {
    const srvs = [...(editingDeparture.additional_services || [])];
    srvs[idx][field] = field === 'price' ? Number(val) : val;
    setEditingDeparture({...editingDeparture, additional_services: srvs});
  };

  const handleRemoveAddon = (idx) => {
    const srvs = [...(editingDeparture.additional_services || [])];
    srvs.splice(idx, 1);
    setEditingDeparture({...editingDeparture, additional_services: srvs});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const error = await handleUpdateDeparture(editingDeparture);
    if (error) {
      setErrorMsg(error);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up" style={{ maxWidth: '1000px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📅 CHỈNH SỬA LỊCH KHỞI HÀNH</h2>
          <button className="icon-btn" onClick={() => setShowEditDepartureModal(false)}><X size={24} /></button>
        </div>

        {errorMsg && (
          <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', color: '#b91c1c', fontWeight: 600, fontSize: '0.95rem' }}>
            LỖI CẬP NHẬT: {errorMsg}
          </div>
        )}

        {/* 1. THÔNG TIN VẬN HÀNH */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>1. THÔNG TIN VẬN HÀNH</h3>
        <form id="edit-departure-form" onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>SẢN PHẨM TOUR *</label>
            <select className="modal-select" required value={editingDeparture.tour_template_id} disabled>
              <option value="">-- Chọn sản phẩm thiết kế --</option>
              {tourTemplates.map(t => <option key={t.id} value={t.id}>{t.code ? `[${t.code}] ` : ''}{t.name}</option>)}
            </select>
          </div>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>MÃ KHỞI HÀNH (CODE)</label>
            <input className="modal-input" type="text" value={editingDeparture.code || ''} onChange={e => setEditingDeparture({...editingDeparture, code: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGÀY KHỞI HÀNH *</label>
            <input className="modal-input" type="date" required value={editingDeparture.start_date ? new Date(editingDeparture.start_date).toISOString().split('T')[0] : ''} onChange={e => setEditingDeparture({...editingDeparture, start_date: e.target.value})} />
          </div>
          <div className="modal-form-group">
            <label>NGÀY KẾT THÚC (DỰ KIẾN)</label>
            <input className="modal-input" type="date" value={editingDeparture.end_date ? new Date(editingDeparture.end_date).toISOString().split('T')[0] : ''} onChange={e => setEditingDeparture({...editingDeparture, end_date: e.target.value})} />
          </div>
          
          <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>BẢNG GIÁ VÉ (VND)</h4>
              <button type="button" onClick={handleAddPriceRule} style={{ padding: '6px 12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                + Thêm loại vé
              </button>
            </div>
            
            {(editingDeparture.price_rules || []).map((pr, idx) => (
              <div key={pr.id || idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input 
                  className="modal-input" style={{ flex: 1, padding: '8px' }} type="text" 
                  placeholder="Tên loại vé (Vd: Trẻ em không giường)" 
                  value={pr.name} 
                  onChange={e => handleUpdatePriceRule(idx, 'name', e.target.value)} 
                  disabled={pr.is_default && pr.name === 'Người lớn'}
                />
                <input 
                  className="modal-input" style={{ width: '150px', padding: '8px' }} type="text" 
                  placeholder="Giá vé tiền" 
                  value={new Intl.NumberFormat('vi-VN').format(pr.price || 0)} 
                  onChange={e => handleUpdatePriceRule(idx, 'price', e.target.value.replace(/\D/g, ''))} 
                />
                {!pr.is_default ? (
                  <button type="button" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} onClick={() => handleRemovePriceRule(idx)}>
                    <Trash2 size={20} />
                  </button>
                ) : (
                  <div style={{ width: '28px' }}></div>
                )}
              </div>
            ))}
            {(!editingDeparture.price_rules || editingDeparture.price_rules.length === 0) && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Chưa có bảng giá cho lịch khởi hành này.</div>
            )}
          </div>

          <div style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#1e293b' }}>DỊCH VỤ KÈM THEO / PHỤ THU (VND)</h4>
              <button type="button" onClick={handleAddAddon} style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                + Thêm dịch vụ
              </button>
            </div>
            
            {(editingDeparture.additional_services || []).map((srv, idx) => (
              <div key={srv.id || idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <input 
                  className="modal-input" style={{ flex: 1, padding: '8px' }} type="text" 
                  placeholder="Tên dịch vụ (Vd: Phụ thu phòng đơn, Vé máy bay...)" 
                  value={srv.name} 
                  onChange={e => handleUpdateAddon(idx, 'name', e.target.value)} 
                />
                <input 
                  className="modal-input" style={{ width: '150px', padding: '8px' }} type="text" 
                  placeholder="Phí dịch vụ" 
                  value={new Intl.NumberFormat('vi-VN').format(srv.price || 0)} 
                  onChange={e => handleUpdateAddon(idx, 'price', e.target.value.replace(/\D/g, ''))} 
                />
                <button type="button" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }} onClick={() => handleRemoveAddon(idx)}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
            {(!editingDeparture.additional_services || editingDeparture.additional_services.length === 0) && (
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic' }}>Không có phụ thu / dịch vụ phát sinh nào.</div>
            )}
          </div>
          <div className="modal-form-group">
             <label>SỐ KHÁCH TỐI ĐA (CAPACITY)</label>
             <input className="modal-input" type="number" value={editingDeparture.max_participants || ''} onChange={e => setEditingDeparture({...editingDeparture, max_participants: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label>ĐIỂM HÒA VỐN (PAX)</label>
             <input className="modal-input" type="number" value={editingDeparture.break_even_pax || ''} onChange={e => setEditingDeparture({...editingDeparture, break_even_pax: e.target.value})} />
          </div>
          <div className="modal-form-group">
             <label>HƯỚNG DẪN VIÊN</label>
             <select className="modal-select" value={editingDeparture.guide_id || ''} onChange={e => setEditingDeparture({...editingDeparture, guide_id: e.target.value})}>
                <option value="">-- Chưa gán HDV --</option>
                {guides.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
             </select>
          </div>
          <div className="modal-form-group">
            <label>TRẠNG THÁI VẬN HÀNH</label>
            <select className="modal-select" value={editingDeparture.status || 'Open'} onChange={e => setEditingDeparture({...editingDeparture, status: e.target.value})}>
              <option value="Open">Mở bán (Open)</option>
              <option value="Guaranteed">Chắc chắn đi (Guaranteed)</option>
              <option value="Full">Đã đầy (Full)</option>
              <option value="Cancelled">Hủy tour (Cancelled)</option>
            </select>
          </div>
          <div className="modal-form-group" style={{ gridColumn: 'span 2' }}>
            <label>GHI CHÚ KHI LÊN LỊCH</label>
            <textarea className="modal-textarea" rows={3} placeholder="Ghi chú thêm về lịch khởi hành này..." value={editingDeparture.notes || ''} onChange={e => setEditingDeparture({...editingDeparture, notes: e.target.value})} />
          </div>
        </form>

        {/* 2. DANH SÁCH KHÁCH HÀNG/BOOKINGS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>2. DANH SÁCH KHÁCH ĐÃ ĐẶT (BOOKINGS)</h3>
          <button 
            type="button"
            className="btn-pro-save"
            style={{ width: 'auto', padding: '6px 16px', background: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
            onClick={handleExportCSV}
          >
            <Download size={16} /> Xuất DS Cục Nhập Cảnh / CQ Hàng Không
          </button>
        </div>
        <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          {loadingBookings ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách...</div>
          ) : linkedBookings.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Chưa có khách hàng/booking nào cho tuyến này.</div>
          ) : (
            <table className="data-table" style={{ margin: 0, fontSize: '0.9rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px' }}>MÃ / KHÁCH ÁP ĐẶT</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center' }}>PAX</th>
                  <th style={{ padding: '8px 12px', textAlign: 'right' }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {linkedBookings.map(bk => (
                  <tr key={bk.id}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: '#3b82f6' }}>{bk.booking_code}</div>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{bk.customer_name}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{bk.customer_phone}</div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700 }}>{bk.pax_count}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem', 
                        fontWeight: 700,
                        background: bk.payment_status === 'paid' ? '#dcfce7' : '#fef9c3',
                        color: bk.payment_status === 'paid' ? '#166534' : '#854d0e'
                      }}>
                        {bk.payment_status === 'paid' ? 'Đã Thanh Toán' : 'Chưa thu'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b', textAlign: 'right' }}>
          Tổng cộng: <strong style={{color: '#1e293b'}}>{linkedBookings.reduce((sum, b) => sum + (b.pax_count || 0), 0)}</strong> / {editingDeparture.max_participants || 0} Pax đã đặt
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid #e2e8f0', paddingTop: '1.5rem' }}>
          <button type="submit" form="edit-departure-form" className="btn-pro-save" style={{ flex: 1 }}>CẬP NHẬT LỊCH KHỞI HÀNH</button>
          <button type="button" className="btn-pro-cancel" style={{ width: 'auto' }} onClick={() => setShowEditDepartureModal(false)}>ĐÓNG LẠI</button>
        </div>
      </div>
    </div>
  );
};
