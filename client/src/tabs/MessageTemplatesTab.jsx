import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, LayoutTemplate } from 'lucide-react';
import { swalConfirm } from '../utils/swalHelpers';
import toast from 'react-hot-toast';
import MessageTemplateModal from '../components/modals/MessageTemplateModal';

const MessageTemplatesTab = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/messages/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTemplates(res.data);
    } catch (err) {
      toast.error('Lỗi tải danh sách thẻ mẫu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id) => {
    swalConfirm('Bạn có chắc chắn muốn xóa mẫu thẻ này?', async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/messages/templates/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Đã xóa mẫu thẻ');
        fetchTemplates();
      } catch (err) {
        toast.error('Lỗi khi xóa mẫu thẻ');
      }
    });
  };

  const handleOpenEdit = (tpl) => {
    setEditingTemplate(tpl);
    setShowModal(true);
  };

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setShowModal(true);
  };

  return (
    <div className="tab-content fade-in">
      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2><LayoutTemplate size={24} style={{ marginRight: '10px' }} /> Quản lý Mẫu thẻ Messenger</h2>
          <p className="tab-desc">Quản lý các mẫu thẻ (Generic Templates) dùng để gửi nhanh cho khách hàng qua Messenger.</p>
        </div>
        <div style={{ marginLeft: 'auto', paddingTop: '24px', display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-pro-save" 
            style={{ height: '44px', padding: '0 1.5rem', whiteSpace: 'nowrap' }} 
            onClick={handleOpenAdd}
          >
            <Plus size={18} strokeWidth={3} style={{ marginRight: '8px' }} /> TẠO MẪU THẺ MỚI
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '0', border: 'none', background: 'transparent', boxShadow: 'none' }}>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="data-table-container shadow-sm" style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
            <table className="data-table">
              <thead style={{ background: '#f8fafc' }}>
                <tr>
                  <th style={{ minWidth: '200px' }}>TÊN MẪU (NỘI BỘ)</th>
                  <th style={{ minWidth: '150px' }}>MÔ TẢ (CHO AI)</th>
                  <th style={{ minWidth: '100px', textAlign: 'center' }}>ẢNH THUMNAIL</th>
                  <th style={{ minWidth: '250px' }}>TIÊU ĐỀ THẺ (HIỂN THỊ KH)</th>
                  <th>NÚT BẤM</th>
                  <th style={{ width: '100px', textAlign: 'right', paddingRight: '2rem' }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {templates.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>Chưa có mẫu thẻ nào.</td></tr>
                ) : (
                  templates.map(tpl => {
                    const elements = tpl.payload?.elements || [];
                    const firstElement = elements[0] || {};
                    const buttons = firstElement.buttons || [];
                    
                    return (
                      <tr key={tpl.id}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' }}>{tpl.name}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#64748b', fontSize: '0.85rem' }}>{tpl.description || '-'}</span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {firstElement.image_url ? (
                            <img src={firstElement.image_url} alt="Cover" style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Không có ảnh</span>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{firstElement.title || '-'}</span>
                            {firstElement.subtitle && <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{firstElement.subtitle}</span>}
                          </div>
                        </td>
                        <td>
                          <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 700, padding: '4px 8px', borderRadius: '12px', whiteSpace: 'nowrap' }}>
                            {buttons.length} nút
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', paddingRight: '2rem' }}>
                          <button className="action-btn edit-btn" onClick={() => handleOpenEdit(tpl)} title="Sửa" style={{ marginRight: '8px' }}>
                            <Edit2 size={16} />
                          </button>
                          <button className="action-btn delete-btn" onClick={() => handleDelete(tpl.id)} title="Xóa">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <MessageTemplateModal
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            fetchTemplates();
          }}
          editingTemplate={editingTemplate}
        />
      )}
    </div>
  );
};

export default MessageTemplatesTab;
