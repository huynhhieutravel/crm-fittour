import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Plus, Edit2, Trash2, CheckCircle, XCircle, Search, Save, X } from 'lucide-react';
import { swalConfirm } from '../utils/swalHelpers';


function EmailMailboxesTab({ addToast, users }) {
  const [mailboxes, setMailboxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    email_address: '',
    user_id: '',
    display_name: '',
    signature: '',
    mailbox_type: 'personal',
    max_send_per_minute: 10,
    is_active: true
  });

  useEffect(() => {
    fetchMailboxes();
  }, []);

  const fetchMailboxes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/emails/mailboxes');
      setMailboxes(res.data || []);
    } catch (err) {
      addToast?.('Lỗi tải danh sách hộp thư: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mailbox = null) => {
    if (mailbox) {
      setEditingId(mailbox.id);
      setFormData({
        email_address: mailbox.email_address || '',
        user_id: mailbox.user_id || '',
        display_name: mailbox.display_name || '',
        signature: mailbox.signature || '',
        mailbox_type: mailbox.mailbox_type || 'personal',
        max_send_per_minute: mailbox.max_send_per_minute || 10,
        is_active: mailbox.is_active
      });
    } else {
      setEditingId(null);
      setFormData({
        email_address: '',
        user_id: '',
        display_name: '',
        signature: '',
        mailbox_type: 'personal',
        max_send_per_minute: 10,
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.email_address) {
      return addToast?.('Vui lòng nhập địa chỉ email', 'error');
    }

    try {
      const payload = { ...formData };
      if (!payload.user_id) payload.user_id = null;

      if (editingId) {
        await axios.put(`/api/emails/mailboxes/${editingId}`, payload);
        addToast?.('Cập nhật hộp thư thành công!');
      } else {
        await axios.post('/api/emails/mailboxes', payload);
        addToast?.('Thêm hộp thư mới thành công!');
      }
      setShowModal(false);
      fetchMailboxes();
    } catch (err) {
      addToast?.('Lỗi lưu hộp thư: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!await swalConfirm('Bạn có chắc chắn muốn xóa hộp thư này? Dữ liệu cấu hình sẽ bị mất (email đã nhận vẫn còn trong DB).', { title: 'Xóa hộp thư' })) return;
    try {
      await axios.delete(`/api/emails/mailboxes/${id}`);
      addToast?.('Xóa hộp thư thành công!');
      fetchMailboxes();
    } catch (err) {
      addToast?.('Lỗi xóa hộp thư: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const filteredMailboxes = mailboxes.filter(m => 
    (m.email_address || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.display_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.user_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="tab-pane active" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '24px', fontWeight: 'bold' }}>
            <Mail size={28} className="text-primary" />
            Quản lý Hộp Thư Email
          </h2>
          <p className="text-muted" style={{ marginTop: '8px' }}>Cấu hình địa chỉ nhận/gửi mail và gán nhân sự quản lý</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} /> Tạo Hộp Thư
        </button>
      </div>

      <div className="card">
        <div className="card-header flex-between" style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div className="search-box" style={{ width: '300px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Tìm theo email, tên, người quản lý..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
            />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="table" style={{ minWidth: '800px' }}>
            <thead>
              <tr>
                <th>Địa chỉ Email</th>
                <th>Người Quản Lý</th>
                <th>Tên Hiển Thị</th>
                <th>Loại Hộp Thư</th>
                <th>Giới Hạn Gửi</th>
                <th>Trạng Thái</th>
                <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center" style={{ padding: '30px' }}>Đang tải...</td></tr>
              ) : filteredMailboxes.length === 0 ? (
                <tr><td colSpan="7" className="text-center text-muted" style={{ padding: '30px' }}>Không tìm thấy hộp thư nào</td></tr>
              ) : (
                filteredMailboxes.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: '500' }}>{m.email_address}</td>
                    <td>
                      {m.user_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>
                            {m.user_name.charAt(0).toUpperCase()}
                          </div>
                          {m.user_name}
                        </div>
                      ) : (
                        <span className="badge badge-secondary" style={{ opacity: 0.7 }}>Chưa gán</span>
                      )}
                    </td>
                    <td>{m.display_name || '-'}</td>
                    <td>
                      <span className="badge badge-outline" style={{ textTransform: 'capitalize' }}>
                        {m.mailbox_type}
                      </span>
                    </td>
                    <td>{m.max_send_per_minute} mail/phút</td>
                    <td>
                      {m.is_active ? (
                        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12}/> Hoạt động</span>
                      ) : (
                        <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><XCircle size={12}/> Tạm khóa</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="btn-icon" onClick={() => handleOpenModal(m)} title="Sửa">
                          <Edit2 size={16} className="text-primary" />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(m.id)} title="Xóa">
                          <Trash2 size={16} className="text-danger" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal-header">
              <h3>{editingId ? 'Chỉnh Sửa Hộp Thư' : 'Thêm Hộp Thư Mới'}</h3>
              <button className="btn-icon" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSave}>
                <div className="form-group mb-3">
                  <label>Địa chỉ Email <span className="text-danger">*</span></label>
                  <input 
                    type="email" 
                    className="form-control" 
                    required 
                    value={formData.email_address}
                    onChange={e => setFormData({...formData, email_address: e.target.value})}
                    placeholder="vd: quynhphuong.bu1@fittour.vn"
                    disabled={!!editingId}
                  />
                  {!editingId && <small className="text-muted mt-1" style={{ display: 'block' }}>Lưu ý: Không thể thay đổi địa chỉ sau khi tạo.</small>}
                </div>
                
                <div className="form-group mb-3">
                  <label>Gán cho Nhân Sự (Tùy chọn)</label>
                  <select 
                    className="form-control"
                    value={formData.user_id}
                    onChange={e => setFormData({...formData, user_id: e.target.value})}
                  >
                    <option value="">-- Dùng chung / Không gán --</option>
                    {users?.map(u => (
                      <option key={u.id} value={u.id}>{u.full_name || u.username} ({u.email})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group mb-3">
                  <label>Tên hiển thị (Tùy chọn)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.display_name}
                    onChange={e => setFormData({...formData, display_name: e.target.value})}
                    placeholder="vd: FIT Tour Support"
                  />
                </div>

                <div className="row mb-3">
                  <div className="col-md-6 form-group">
                    <label>Loại Hộp Thư</label>
                    <select 
                      className="form-control"
                      value={formData.mailbox_type}
                      onChange={e => setFormData({...formData, mailbox_type: e.target.value})}
                    >
                      <option value="personal">Cá nhân (Personal)</option>
                      <option value="shared">Dùng chung (Shared)</option>
                      <option value="system">Hệ thống (System)</option>
                    </select>
                  </div>
                  <div className="col-md-6 form-group">
                    <label>Giới hạn gửi/phút</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      min="1" max="100"
                      value={formData.max_send_per_minute}
                      onChange={e => setFormData({...formData, max_send_per_minute: parseInt(e.target.value) || 10})}
                    />
                  </div>
                </div>

                <div className="form-group mb-3">
                  <label>Chữ ký mặc định (HTML/Text)</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    value={formData.signature}
                    onChange={e => setFormData({...formData, signature: e.target.value})}
                    placeholder="Trân trọng,\n[Tên của bạn]"
                  ></textarea>
                </div>

                <div className="form-group mb-4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input 
                    type="checkbox" 
                    id="isActiveCheck"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="isActiveCheck" style={{ margin: 0, cursor: 'pointer', fontWeight: '500' }}>
                    Kích hoạt hộp thư này
                  </label>
                </div>

                <div className="flex-end" style={{ gap: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Hủy</button>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Save size={16} /> {editingId ? 'Lưu thay đổi' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailMailboxesTab;
