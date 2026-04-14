import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Shield, User, Save, RefreshCw, CheckCircle2 } from 'lucide-react';

const MODULE_NAMES = {
  leads: 'Khách hàng Tiềm năng (Leads)',
  tours: 'Sản phẩm Tour FIT',
  departures: 'Lịch khởi hành FIT',
  bookings: 'Quản lý Đặt chỗ (Booking)',
  customers: 'Khách hàng cá nhân',
  op_tours: 'Điều hành Tour (BU)',
  vouchers: 'Đề nghị thanh toán / Phiếu thu',
  costings: 'Bảng chiết tính',
  hotels: 'Khách sạn',
  restaurants: 'Nhà hàng',
  transports: 'Nhà xe / Vận chuyển',
  tickets: 'Vé tham quan',
  airlines: 'Vé máy bay',
  landtours: 'LandTour / Combo',
  insurances: 'Bảo hiểm',
  b2b_companies: 'Doanh nghiệp (B2B)',
  group_leaders: 'Trưởng đoàn (B2B)',
  group_projects: 'MICE / Dự án Tour Đoàn',
  users: 'Tài khoản & Phân quyền',
  settings: 'Cấu hình hệ thống',
  licenses: 'Chữ ký số cá nhân',
  messenger: 'CSKH Messenger',
  guides: 'Thiết lập Hướng dẫn viên'
};

const shortActionLabel = (label) => {
  let s = label.replace(/toàn bộ|của mình|cá nhân|hệ thống|thông tin/gi, '').trim();
  // Rút gọn các từ dài
  s = s.replace(/Sản phẩm Tour/gi, 'Tour');
  s = s.replace(/Lịch khởi hành/gi, 'Lịch KH');
  s = s.replace(/Khách hàng/gi, 'KH');
  if (s.length > 25) return s.substring(0, 22) + '...';
  return s;
};

// --- BUIIDING BLOCKS ---

const PillToggle = ({ checked, label, onChange, readonly }) => {
  return (
    <div 
      onClick={() => !readonly && onChange()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px', borderRadius: '20px',
        background: checked ? '#ecfdf5' : '#f8fafc',
        border: `1px solid ${checked ? '#10b981' : '#e2e8f0'}`,
        color: checked ? '#065f46' : '#64748b',
        cursor: readonly ? 'not-allowed' : 'pointer',
        opacity: readonly ? 0.7 : 1,
        fontSize: '0.78rem', fontWeight: checked ? 600 : 500,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        userSelect: 'none',
        boxShadow: checked ? '0 2px 4px rgba(16, 185, 129, 0.1)' : 'none'
      }}
    >
      <div style={{
        width: '12px', height: '12px', borderRadius: '50%',
        background: checked ? '#10b981' : '#cbd5e1',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {checked && <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }} />}
      </div>
      {label}
    </div>
  );
};

// --- ROLE PERMISSION MODAL ---

export const RolePermissionModal = ({ open, onClose, addToast }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  
  const [permMaster, setPermMaster] = useState([]);
  const [rolePerms, setRolePerms] = useState({});
  const [activeGroup, setActiveGroup] = useState('');

  useEffect(() => {
    if (open) fetchInitData();
  }, [open]);

  useEffect(() => {
    if (selectedRole) fetchRolePerms(selectedRole);
    else setRolePerms({});
  }, [selectedRole]);

  const fetchInitData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [resRoles, resMaster] = await Promise.all([
        axios.get('/api/users/roles', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('/api/permissions/master', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setRoles(resRoles.data);
      setPermMaster(resMaster.data);
      
      const groups = [...new Set(resMaster.data.map(p => p.group_vi))];
      if (groups.length > 0) setActiveGroup(groups[0]);
    } catch (err) {
      addToast('Lỗi khi tải dữ liệu phân quyền', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePerms = async (roleId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/permissions/role/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const mapping = {};
      res.data.forEach(rp => { mapping[rp.permission_id] = rp.granted; });
      setRolePerms(mapping);
    } catch (err) {
      addToast('Lỗi khi tải quyền của role', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRole) return addToast('Vui lòng chọn chức vụ', 'error');
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updates = Object.keys(rolePerms).map(permId => ({
        permission_id: parseInt(permId),
        granted: rolePerms[permId]
      }));
      
      await axios.put(`/api/permissions/role/${selectedRole}`, {
        permissions: updates
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      addToast('Đã lưu cấu hình Phân Quyền thành công!', 'success');
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Lỗi khi lưu', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (permId) => {
    setRolePerms(prev => ({ ...prev, [permId]: !prev[permId] }));
  };

  const handleToggleAllModule = (moduleId, permsInModule, isChecked) => {
    const nextState = { ...rolePerms };
    permsInModule.forEach(p => { nextState[p.id] = isChecked; });
    setRolePerms(nextState);
  };

  if (!open) return null;

  // Group by Module
  const permsInActiveGroup = permMaster.filter(p => p.group_vi === activeGroup);
  const modulesInGroup = permsInActiveGroup.reduce((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = [];
    acc[curr.module].push(curr);
    return acc;
  }, {});
  const allGroups = [...new Set(permMaster.map(p => p.group_vi))];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content special-fullscreen" style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', background: '#f8fafc' }}>
        
        {/* HEADER */}
        <div style={{ background: 'linear-gradient(90deg, #1e293b 0%, #0f172a 100%)', color: '#fff', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', margin: 0 }}>
              <Shield size={28} className="text-emerald-400" /> Hệ sinh thái Phân Quyền (Role-based)
            </h2>
            <p style={{ margin: '0.4rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Thiết lập ma trận phân quyền lõi cho từng chức vụ/phòng ban</p>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.8} onClick={onClose}><X size={24} /></button>
        </div>
        
        {/* CONTROL HUB */}
        <div style={{ padding: '1.5rem 2rem', background: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
            <div style={{ flex: 1, maxWidth: '400px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.5px' }}>ĐỐI TƯỢNG ÁP DỤNG</label>
              <select 
                value={selectedRole} 
                onChange={e => setSelectedRole(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '1rem', border: '2px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontWeight: 600, color: '#0f172a', background: '#f8fafc', cursor: 'pointer' }}
              >
                <option value="">-- Chọn chức danh/phòng ban --</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.name.toUpperCase()}</option>)}
              </select>
            </div>
          </div>
          
          <button onClick={handleSave} disabled={saving || !selectedRole} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: (saving || !selectedRole) ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)', opacity: (saving || !selectedRole) ? 0.7 : 1 }}>
            {saving ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            LƯU VÀ ÁP DỤNG
          </button>
        </div>

        {/* WORKSPACE */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* SIDEBAR */}
          <div style={{ width: '280px', background: '#fff', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
            {allGroups.map((g, idx) => (
              <div 
                key={idx}
                onClick={() => setActiveGroup(g)}
                style={{
                  padding: '1rem 1.1rem',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  borderBottom: '1px solid #f1f5f9',
                  background: activeGroup === g ? '#eff6ff' : 'transparent',
                  borderLeft: `4px solid ${activeGroup === g ? '#3b82f6' : 'transparent'}`,
                  fontWeight: activeGroup === g ? 700 : 500,
                  color: activeGroup === g ? '#1d4ed8' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                {g}
              </div>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', marginTop: '10%' }}><RefreshCw size={40} className="animate-spin text-primary" style={{ margin: '0 auto 1rem auto' }}/></div>
            ) : !selectedRole ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '10%' }}>
                <Shield size={64} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
                <h3>Chưa chọn chức vụ</h3>
                <p>Vui lòng chọn chức vụ ở thanh công cụ phía trên để bắt đầu phân quyền.</p>
              </div>
            ) : (
              <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {Object.entries(modulesInGroup).map(([modCode, perms]) => {
                  const moduleName = MODULE_NAMES[modCode] || modCode;
                  const allChecked = perms.every(p => rolePerms[p.id]);
                  
                  return (
                    <div key={modCode} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{moduleName}</strong>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', cursor: 'pointer', userSelect: 'none' }}>
                          <input 
                            type="checkbox" 
                            checked={allChecked} 
                            onChange={(e) => handleToggleAllModule(modCode, perms, e.target.checked)} 
                            style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                          />
                          Full Quyền
                        </label>
                      </div>
                      <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {perms.map(p => (
                          <PillToggle 
                            key={p.id}
                            checked={rolePerms[p.id] || false}
                            label={shortActionLabel(p.label_vi)}
                            onChange={() => handleToggle(p.id)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};


// --- USER OVERRIDE MODAL ---

export const UserPermissionOverrideModal = ({ open, onClose, user, addToast }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permMaster, setPermMaster] = useState([]);
  const [rolePerms, setRolePerms] = useState({}); 
  const [userPerms, setUserPerms] = useState({}); 
  const [activeGroup, setActiveGroup] = useState('');

  useEffect(() => {
    if (open && user) fetchData();
  }, [open, user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [resMaster, resRole, resUser] = await Promise.all([
        axios.get('/api/permissions/master', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/permissions/role/${user.role_id}`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`/api/permissions/user/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setPermMaster(resMaster.data);
      const groups = [...new Set(resMaster.data.map(p => p.group_vi))];
      if (groups.length > 0) setActiveGroup(groups[0]);
      
      const rMap = {}; resRole.data.forEach(rp => { rMap[rp.permission_id] = rp.granted; }); setRolePerms(rMap);
      const uMap = {}; resUser.data.forEach(up => { 
        if (up.user_override !== null && up.user_override !== undefined) {
          uMap[up.permission_id] = up.user_override; 
        }
      }); 
      setUserPerms(uMap);
    } catch (err) { addToast('Lỗi tải cấu hình cá nhân', 'error'); } finally { setLoading(false); }
  };

  const handleToggle = (permId) => {
    setUserPerms(prev => {
      const currentVal = prev[permId];
      const roleVal = rolePerms[permId] || false;
      const isEffectivelyGranted = currentVal !== undefined ? currentVal : roleVal;
      const newVal = !isEffectivelyGranted;
      
      // Nếu trạng thái mới trở về y như trạng thái Role gốc -> Xóa cấu hình ngoại lệ (về null)
      if (newVal === roleVal) {
        const copy = { ...prev };
        delete copy[permId];
        return copy;
      }
      return { ...prev, [permId]: newVal };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const updates = Object.keys(userPerms).map(permId => ({
        permission_id: parseInt(permId),
        granted: userPerms[permId]
      }));
      
      await axios.put(`/api/permissions/user/${user.id}`, {
        overrides: updates
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      addToast('Cập nhật Ngoại Lệ quyền Nhân sự thành công!'); onClose();
    } catch (err) { addToast('Lỗi lưu cấu hình', 'error'); } finally { setSaving(false); }
  };

  if (!open || !user) return null;

  const permsInActiveGroup = permMaster.filter(p => p.group_vi === activeGroup);
  const modulesInGroup = permsInActiveGroup.reduce((acc, curr) => {
    if (!acc[curr.module]) acc[curr.module] = [];
    acc[curr.module].push(curr);
    return acc;
  }, {});
  const allGroups = [...new Set(permMaster.map(p => p.group_vi))];

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal-content special-fullscreen" style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', overflow: 'hidden', background: '#f8fafc' }}>
        
        <div style={{ background: 'linear-gradient(90deg, #1e40af 0%, #1e3a8a 100%)', color: '#fff', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', margin: 0 }}>
              <User size={28} className="text-blue-300" /> Hồ sơ Quyền Ngoại Lệ (User Override)
            </h2>
            <p style={{ margin: '0.4rem 0 0 0', color: '#bfdbfe', fontSize: '0.9rem' }}>
              Điều chỉnh Quyền Cá nhân cho <span style={{ color: '#fff', fontWeight: 600 }}>@{user.username} ({user.full_name})</span>
            </p>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0.8} onClick={onClose}><X size={24} /></button>
        </div>
        
        <div style={{ padding: '1.5rem 2rem', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '2rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1e3a8a' }}>
               <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} /> Quyền được Phép
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1e3a8a' }}>
               <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#cbd5e1' }} /> Bị Chặn
             </div>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#1e3a8a', paddingLeft: '1rem', borderLeft: '1px solid #bfdbfe' }}>
               <span style={{ border: '1px solid #f59e0b', padding: '2px 6px', borderRadius: '4px', background: '#fef3c7', fontWeight: 600, color: '#b45309' }}>Viền CAM</span> = Bạn đang sửa khác biệt so với Role gốc
             </div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '0.8rem 2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', boxShadow: '0 2px 8px rgba(29, 78, 216, 0.3)', opacity: saving ? 0.7 : 1 }}>
            {saving ? <RefreshCw className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
            LƯU NGOẠI LỆ CÁ NHÂN
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '280px', background: '#fff', borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
            {allGroups.map((g, idx) => (
              <div 
                key={idx} onClick={() => setActiveGroup(g)}
                style={{
                  padding: '1rem 1.1rem', fontSize: '0.82rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
                  background: activeGroup === g ? '#f0f9ff' : 'transparent',
                  borderLeft: `4px solid ${activeGroup === g ? '#2563eb' : 'transparent'}`,
                  fontWeight: activeGroup === g ? 700 : 500,
                  color: activeGroup === g ? '#1d4ed8' : '#475569',
                  transition: 'all 0.2s'
                }}
              >
                {g}
              </div>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
            {loading ? (
              <div style={{ textAlign: 'center', marginTop: '10%' }}><RefreshCw size={40} className="animate-spin text-primary" style={{ margin: '0 auto 1rem auto' }}/></div>
            ) : (
              <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {Object.entries(modulesInGroup).map(([modCode, perms]) => {
                  const moduleName = MODULE_NAMES[modCode] || modCode;
                  
                  return (
                    <div key={modCode} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0' }}>
                        <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{moduleName}</strong>
                      </div>
                      <div style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {perms.map(p => {
                          const roleVal = rolePerms[p.id] || false;
                          const userOverride = userPerms[p.id];
                          const isOverridden = userOverride !== undefined;
                          const effectivelyGranted = isOverridden ? userOverride : roleVal;

                          return (
                            <div 
                              key={p.id}
                              onClick={() => handleToggle(p.id)}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '6px 12px', borderRadius: '20px',
                                background: effectivelyGranted ? '#ecfdf5' : '#f8fafc',
                                border: isOverridden ? '2px solid #f59e0b' : `1px solid ${effectivelyGranted ? '#10b981' : '#e2e8f0'}`,
                                color: effectivelyGranted ? '#065f46' : '#64748b',
                                cursor: 'pointer',
                                fontSize: '0.78rem', fontWeight: effectivelyGranted ? 600 : 500,
                                userSelect: 'none'
                              }}
                            >
                              <div style={{
                                width: '12px', height: '12px', borderRadius: '50%',
                                background: effectivelyGranted ? '#10b981' : '#cbd5e1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}>
                                {effectivelyGranted && <div style={{ width: '4px', height: '4px', background: '#fff', borderRadius: '50%' }} />}
                              </div>
                              {shortActionLabel(p.label_vi)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
