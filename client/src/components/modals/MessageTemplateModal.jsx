import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageTemplateModal = ({ onClose, onSuccess, editingTemplate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    title: '',
    subtitle: '',
    image_url: '',
    buttons: []
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTemplate) {
      const elements = editingTemplate.payload?.elements || [];
      const firstElement = elements[0] || {};
      
      setFormData({
        name: editingTemplate.name || '',
        description: editingTemplate.description || '',
        title: firstElement.title || '',
        subtitle: firstElement.subtitle || '',
        image_url: firstElement.image_url || '',
        buttons: firstElement.buttons || []
      });
    }
  }, [editingTemplate]);

  const handleAddButton = () => {
    if (formData.buttons.length >= 3) {
      toast.error('Chỉ được tối đa 3 nút bấm theo chuẩn Facebook.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      buttons: [...prev.buttons, { type: 'web_url', title: '', url: '' }]
    }));
  };

  const handleRemoveButton = (index) => {
    const newButtons = [...formData.buttons];
    newButtons.splice(index, 1);
    setFormData({ ...formData, buttons: newButtons });
  };

  const handleButtonChange = (index, field, value) => {
    const newButtons = [...formData.buttons];
    newButtons[index][field] = value;
    setFormData({ ...formData, buttons: newButtons });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.title.trim()) {
      toast.error('Tên mẫu và Tiêu đề thẻ không được để trống.');
      return;
    }

    for (let i = 0; i < formData.buttons.length; i++) {
      const btn = formData.buttons[i];
      if (!btn.title.trim() || (!btn.url?.trim() && !btn.payload?.trim())) {
        toast.error(`Vui lòng điền đủ Tên và URL/Payload cho nút thứ ${i + 1}`);
        return;
      }
    }

    setSaving(true);
    
    const payload = {
      template_type: "generic",
      elements: [
        {
          title: formData.title,
          subtitle: formData.subtitle || undefined,
          image_url: formData.image_url || undefined,
          buttons: formData.buttons.length > 0 ? formData.buttons : undefined
        }
      ]
    };

    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      payload: payload
    };

    try {
      const token = localStorage.getItem('token');
      if (editingTemplate) {
        await axios.put(`/api/messages/templates/${editingTemplate.id}`, dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Đã cập nhật mẫu thẻ thành công');
      } else {
        await axios.post('/api/messages/templates', dataToSubmit, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Đã tạo mẫu thẻ mới thành công');
      }
      onSuccess();
    } catch (err) {
      toast.error('Lỗi khi lưu mẫu thẻ: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', margin: 0 }}>
            {editingTemplate ? 'Sửa Mẫu Thẻ Messenger' : 'Tạo Mẫu Thẻ Mới'}
          </h2>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }} onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }} onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}>
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Tên mẫu thẻ (Quản lý nội bộ) *</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="VD: Thẻ Khuyến Mãi Hè"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Mô tả chung (Dành cho AI đọc hiểu)</label>
            <textarea 
              className="form-control" 
              placeholder="Giải thích cho AI biết thẻ này dùng để làm gì. VD: Thẻ này chứa thông tin các tour mùa hè..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={2}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Tiêu đề thẻ (Hiển thị trên Messenger) *</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="VD: Siêu Khuyến Mãi Du Lịch Hè"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Phụ đề thẻ (Subtitle)</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="VD: Giảm ngay 2 triệu đồng cho nhóm 4 người..."
              value={formData.subtitle}
              onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Link Ảnh (Image URL)</label>
            <input 
              type="url" 
              className="form-control" 
              placeholder="VD: https://fittour.vn/image.jpg"
              value={formData.image_url}
              onChange={(e) => setFormData({...formData, image_url: e.target.value})}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              <span>Nút bấm (Tối đa 3 nút)</span>
              <button 
                type="button" 
                className="btn btn-secondary btn-sm"
                onClick={handleAddButton}
                disabled={formData.buttons.length >= 3}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Plus size={14} /> Thêm nút
              </button>
            </label>
            
            {formData.buttons.length === 0 ? (
              <div style={{ color: '#64748b', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '5px' }}>
                Chưa có nút bấm nào.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {formData.buttons.map((btn, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select 
                          className="form-control" 
                          style={{ width: '120px' }}
                          value={btn.type}
                          onChange={(e) => handleButtonChange(index, 'type', e.target.value)}
                        >
                          <option value="web_url">Mở Web</option>
                          <option value="postback">Gửi Data ngầm</option>
                        </select>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Tên nút (VD: Xem ngay)"
                          value={btn.title}
                          onChange={(e) => handleButtonChange(index, 'title', e.target.value)}
                          required
                        />
                      </div>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder={btn.type === 'web_url' ? 'URL trang web (VD: https://...)' : 'Dữ liệu gửi ngầm (VD: payload_tour_he)'}
                        value={btn.type === 'web_url' ? (btn.url || '') : (btn.payload || '')}
                        onChange={(e) => {
                          if (btn.type === 'web_url') {
                            handleButtonChange(index, 'url', e.target.value);
                            handleButtonChange(index, 'payload', undefined);
                          } else {
                            handleButtonChange(index, 'payload', e.target.value);
                            handleButtonChange(index, 'url', undefined);
                          }
                        }}
                        required
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveButton(index)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                      title="Xóa nút"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer" style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" className="btn-cancel" onClick={onClose} style={{ height: '40px', padding: '0 1.5rem', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 600 }}>Hủy</button>
            <button type="submit" className="btn-pro-save" disabled={saving} style={{ height: '40px', padding: '0 1.5rem', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600 }}>
              {saving ? 'Đang lưu...' : (editingTemplate ? 'Cập nhật mẫu thẻ' : 'Lưu mẫu thẻ')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessageTemplateModal;
