import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Mail, Users, Save, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import Select from 'react-select';



function EmailGroupsTab({ user, addToast }) {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [usersOptionGroup, setUsersOptionGroup] = useState([]);
  const [allUsersFlat, setAllUsersFlat] = useState([]);
  const [buOptions, setBuOptions] = useState([]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    users: [], // Array of user objects {value, label}
    target_bus: [], // Array of BU objects {value, label}
    external_emails: '', // Comma separated string
    is_active: true
  });

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'manager') return;
    fetchGroups();
    fetchAllUsers();
    fetchBUs();
  }, [user]);

  const fetchBUs = async () => {
    try {
      const res = await axios.get('/api/business-units');
      setBuOptions(res.data.map(b => ({ value: b.id, label: b.label || b.id })));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/users', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      const activeUsers = res.data.filter(u => u.is_active);
      const flat = activeUsers.map(u => ({ 
        value: u.id, 
        label: `${u.full_name || 'Chưa có tên'} (@${u.username}) - ${u.email || u.phone || 'Chưa có thông tin'}` 
      }));
      setAllUsersFlat(flat);
      
      const groupsMap = {};
      activeUsers.forEach(u => {
        const rName = u.role_name || 'Khác';
        if(!groupsMap[rName]) groupsMap[rName] = [];
        groupsMap[rName].push({ 
          value: u.id, 
          label: `${u.full_name || 'Chưa có tên'} (@${u.username}) - ${u.email || u.phone || 'Chưa có thông tin'}` 
        });
      });
      const options = Object.keys(groupsMap).map(k => ({
        label: k,
        options: groupsMap[k]
      }));
      setUsersOptionGroup(options);
    } catch(err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchGroups = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/email-groups', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (err) {
      addToast('Lỗi khi tải danh sách nhóm email', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setCurrentGroup(group);
      
      setFormData({
        code: group.code,
        name: group.name,
        description: group.description || '',
        users: group.users || [],
        target_bus: (group.target_bus || []).map(b => ({ value: b, label: b })),
        external_emails: (group.external_emails || []).join(', '),
        is_active: group.is_active !== undefined ? group.is_active : true
      });
    } else {
      setCurrentGroup(null);
      setFormData({
        code: '',
        name: '',
        description: '',
        users: [],
        target_bus: [],
        external_emails: '',
        is_active: true
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: formData.code.toUpperCase().replace(/\s+/g, '_'),
        name: formData.name,
        description: formData.description,
        users: formData.users.map(u => (typeof u === 'object' ? u.value : u)),
        target_bus: formData.target_bus.map(b => (typeof b === 'object' ? b.value : b)),
        external_emails: formData.external_emails.split(',').map(e => e.trim()).filter(e => e),
        is_active: formData.is_active
      };

      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      if (currentGroup) {
        await axios.put(`/api/email-groups/${currentGroup.id}`, payload, config);
        addToast('Cập nhật nhóm thành công', 'success');
      } else {
        await axios.post('/api/email-groups', payload, config);
        addToast('Thêm nhóm thành công', 'success');
      }
      setShowModal(false);
      fetchGroups();
    } catch (err) {
      addToast(err.response?.data?.error || 'Lỗi khi lưu thông tin', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhóm này không? Lịch sử gửi qua nhóm này có thể bị ảnh hưởng nếu code đang dùng.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/email-groups/${id}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast('Xóa nhóm thành công', 'success');
      fetchGroups();
    } catch (err) {
      addToast('Lỗi khi xóa nhóm', 'error');
    }
  };

  const handleSelectAll = () => {
    setFormData({...formData, users: allUsersFlat});
  };

  const handleClearAll = () => {
    setFormData({...formData, users: []});
  };

  if (user?.role !== 'admin' && user?.role !== 'manager') {
    return <div className="p-6">Bạn không có quyền truy cập trang này.</div>;
  }

  return (
    <div className="tab-pane active" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={24} /> Cấu hình Nhóm Email (Routing)
          </h2>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '14px' }}>
            Quản lý việc định tuyến email hệ thống đến các nhân sự phụ trách cụ thể.
          </p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plus size={16} /> Thêm Nhóm Mới
        </button>
      </div>

      <div className="table-responsive">
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>MÃ (CODE)</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Tên Nhóm</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Thành viên (Hệ thống)</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#475569', fontWeight: 600 }}>Email ngoài hệ thống</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: '#475569', fontWeight: 600 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</td></tr>
            ) : groups.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Chưa có nhóm email nào.</td></tr>
            ) : (
              groups.map(g => (
                <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#334155' }}>
                    <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{g.code}</code>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontWeight: 500 }}>{g.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{g.description}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                        <Users size={14} color="#3b82f6" /> {(g.users?.length || 0) + (g.dynamic_users?.length || 0)} user(s)
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '4px', maxHeight: '60px', overflowY: 'auto' }}>
                        {[...(g.users || []), ...(g.dynamic_users || [])].map((u, idx) => {
                           const displayName = u.label ? u.label.split(' - ')[0].trim() : (u.full_name || 'N/A');
                           return (
                             <span key={u.value || u.id || idx} style={{ background: u.isDynamic ? '#eff6ff' : '#f1f5f9', color: u.isDynamic ? '#2563eb' : '#475569', border: u.isDynamic ? '1px solid #bfdbfe' : '1px solid #e2e8f0', padding: '2px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                               {displayName} {u.isDynamic ? <span style={{fontSize: '9px', fontWeight: 'bold'}}>(BU)</span> : ''}
                             </span>
                           )
                        })}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '13px', color: '#64748b' }}>
                    {g.external_emails?.join(', ') || '-'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
                      backgroundColor: g.is_active ? '#dcfce7' : '#f1f5f9',
                      color: g.is_active ? '#166534' : '#64748b'
                    }}>
                      {g.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => handleOpenModal(g)} title="Sửa">
                      <Edit2 size={16} color="#3b82f6" />
                    </button>
                    <button className="btn-icon" onClick={() => handleDelete(g.id)} title="Xóa">
                      <Trash2 size={16} color="#ef4444" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="modal-content" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {currentGroup ? 'Sửa Nhóm Email' : 'Thêm Nhóm Email'}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Mã Nhóm (CODE) *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  disabled={currentGroup !== null}
                  required
                  placeholder="VD: LEAVE_APPROVERS"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: currentGroup ? '#f1f5f9' : 'white' }}
                />
                {currentGroup && <small style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}><ShieldAlert size={12}/> CODE là API Contract, không được phép sửa.</small>}
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Tên hiển thị *</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="VD: Nhóm duyệt nghỉ phép"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Mô tả</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, color: '#2563eb' }}>Business Unit (Tự động quét thành viên)</label>
                <Select
                  isMulti
                  options={buOptions}
                  value={formData.target_bus}
                  onChange={selected => setFormData({...formData, target_bus: selected || []})}
                  placeholder="Chọn BU (VD: BU1, KETOAN...)"
                  menuPortalTarget={document.body}
                  styles={{ 
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                  }}
                />
                <small style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>Những nhân sự thuộc các BU được chọn ở đây sẽ tự động được gom vào nhóm này.</small>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                  <label style={{ margin: 0, fontWeight: 500 }}>Thành viên hệ thống (Nhận In-App & Email)</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button type="button" onClick={handleSelectAll} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #3b82f6', background: '#eff6ff', color: '#2563eb', cursor: 'pointer', fontWeight: 500 }}>Chọn tất cả</button>
                    <button type="button" onClick={handleClearAll} style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ef4444', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', fontWeight: 500 }}>Bỏ chọn tất cả</button>
                  </div>
                </div>
                <Select
                  isMulti
                  controlShouldRenderValue={false}
                  hideSelectedOptions={true}
                  options={usersOptionGroup}
                  value={formData.users}
                  onChange={selected => setFormData({...formData, users: selected || []})}
                  placeholder="Tìm kiếm và thêm nhân sự..."
                  noOptionsMessage={() => "Không tìm thấy người dùng"}
                  menuPortalTarget={document.body}
                  styles={{ 
                    menuPortal: base => ({ ...base, zIndex: 9999 })
                  }}
                />

                {/* Danh sách user đã chọn */}
                {formData.users && formData.users.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#f8fafc', maxHeight: '300px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Danh sách đã chọn ({formData.users.length} nhân sự)</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {formData.users.map(u => (
                        <div key={u.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '4px', fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <span style={{ color: '#334155', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.label.split(' - ')[0].trim()}
                            </span>
                            <span style={{ color: '#64748b', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {u.label.split(' - ').slice(1).join(' - ')}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setFormData({...formData, users: formData.users.filter(x => x.value !== u.value)})}
                            style={{ background: '#fee2e2', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px', minHeight: '24px' }}
                            title="Xóa khỏi nhóm"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Email ngoài hệ thống (Chỉ nhận Email)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={formData.external_emails}
                  onChange={e => setFormData({...formData, external_emails: e.target.value})}
                  placeholder="Ví dụ: ceo@fittour.vn, ketoan@gmail.com"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input 
                  type="checkbox" 
                  id="isActiveToggle"
                  checked={formData.is_active}
                  onChange={e => setFormData({...formData, is_active: e.target.checked})}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="isActiveToggle" style={{ margin: 0, fontWeight: 500, cursor: 'pointer' }}>
                  Kích hoạt (Active)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: 'white', cursor: 'pointer' }}>Hủy</button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#3b82f6', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Save size={16} /> Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailGroupsTab;
