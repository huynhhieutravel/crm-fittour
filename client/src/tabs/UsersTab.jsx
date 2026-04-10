import React, { useState } from 'react';
import { Search, UserPlus, Shield, Edit3, Key, Trash2, Mail, Clock, UserCog, Users } from 'lucide-react';

const UsersTab = ({ 
  users, 
  roles, 
  currentUser,
  checkPerm,
  onAddUser, 
  onEditUser, 
  onChangePassword, 
  onDeleteUser,
  onEditRolePerms,
  onEditUserPerms
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTeam, setSelectedTeam] = useState('ALL');

  // Extract unique teams from users (now users have `teams` array)
  const allTeamNames = [...new Set(users.flatMap(u => (u.teams || []).map(t => t.name)).filter(Boolean))];

  const filteredUsers = users.filter(u => {
    const matchSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchRole = selectedRole === 'ALL' ? true : u.role_name === selectedRole;
    const matchTeam = selectedTeam === 'ALL' ? true : (u.teams || []).some(t => t.name === selectedTeam);
    
    let matchStatus = true;
    if (selectedStatus === 'ACTIVE') matchStatus = u.is_active !== false;
    if (selectedStatus === 'INACTIVE') matchStatus = u.is_active === false;

    return matchSearch && matchRole && matchTeam && matchStatus;
  });

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'admin': return { bg: '#fee2e2', text: '#ef4444', icon: <Shield size={12} /> };
      case 'manager': return { bg: '#fef3c7', text: '#d97706', icon: <Shield size={12} /> };
      case 'sales': return { bg: '#dcfce7', text: '#22c55e', icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} /> };
      case 'marketing': return { bg: '#e0f2fe', text: '#0ea5e9', icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9' }} /> };
      case 'operations': return { bg: '#f3e8ff', text: '#9333ea', icon: <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#9333ea' }} /> };
      default: return { bg: '#f1f5f9', text: '#64748b', icon: null };
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
          <div className="filter-group" style={{ flex: 2, minWidth: '200px' }}>
            <label>TÌM THÀNH VIÊN</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                className="filter-input" 
                style={{ paddingLeft: '36px', width: '100%' }} 
                placeholder="Tên, username, email..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
          </div>
          <div className="filter-group" style={{ flex: 1, minWidth: '130px' }}>
            <label>TEAM</label>
            <select 
              className="filter-input"
              value={selectedTeam}
              onChange={e => setSelectedTeam(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="ALL">-- Tất cả --</option>
              {allTeamNames.map(tn => (
                <option key={tn} value={tn}>{tn}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ flex: 1, minWidth: '130px' }}>
            <label>PHÂN QUYỀN</label>
            <select 
              className="filter-input"
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="ALL">-- Tất cả --</option>
              {roles.map(r => (
                <option key={r.id} value={r.name}>{r.name.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ flex: 1, minWidth: '130px' }}>
            <label>TRẠNG THÁI</label>
            <select 
              className="filter-input"
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="ALL">-- Tất cả --</option>
              <option value="ACTIVE">Đang hoạt động</option>
              <option value="INACTIVE">Tạm dừng (Khóa)</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {checkPerm && checkPerm('users', 'change_permissions') && (
            <button 
              className="btn-pro-save" 
              onClick={onEditRolePerms}
              style={{ width: 'auto', padding: '0.75rem 1.5rem', background: '#059669', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}
            >
              <Shield size={18} strokeWidth={3} /> PHÂN QUYỀN CHỨC VỤ
            </button>
          )}
          {checkPerm && checkPerm('users', 'create') && (
            <button 
              className="btn-pro-save" 
              onClick={onAddUser}
              style={{ width: 'auto', padding: '0.75rem 1.5rem', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
            >
              <UserPlus size={18} strokeWidth={3} /> TẠO TÀI KHOẢN
            </button>
          )}
        </div>
      </div>

      <div className="data-table-container shadow-sm" style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem' }}>THÔNG TIN THÀNH VIÊN</th>
              <th>SỐ ĐIỆN THOẠI</th>
              <th>TEAM</th>
              <th>PHÂN QUYỀN</th>
              <th>NGÀY GIA NHẬP</th>
              <th style={{ textAlign: 'right', paddingRight: '2.5rem' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(u => {
              const roleStyle = getRoleColor(u.role_name);
              const isTargetAdmin = u.role_name === 'admin';
              const isCurrentUserReadOnly = currentUser?.role === 'manager' && isTargetAdmin;

              return (
                <tr key={u.id} style={{ opacity: u.is_active === false ? 0.6 : 1, filter: u.is_active === false ? 'grayscale(100%)' : 'none' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px',
                        background: u.avatar_url ? `url(${u.avatar_url}) center/cover no-repeat` : `linear-gradient(135deg, ${roleStyle.color}20, ${roleStyle.color}40)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: roleStyle.color, fontWeight: 800, fontSize: '0.9rem',
                        border: `1px solid ${roleStyle.color}40`, flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        {!u.avatar_url && u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {u.full_name}
                          {u.is_active === false && <span style={{ fontSize: '0.65rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>TẠM DỪNG</span>}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ fontWeight: 600, color: u.is_active === false ? '#64748b' : '#2563eb' }}>@{u.username}</span>
                          {u.email && (
                            <>
                              <span style={{ color: '#cbd5e1' }}>|</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Mail size={10} /> {u.email}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
                    {u.phone ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#0ea5e9" /> {u.phone}
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    {(u.teams || []).length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(u.teams || []).map(t => (
                          <div key={t.id} style={{ 
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 8px', borderRadius: '6px',
                            background: '#f0fdf4', color: '#15803d',
                            fontSize: '0.7rem', fontWeight: 600
                          }}>
                            <Users size={10} />
                            {t.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      padding: '4px 10px', 
                      borderRadius: '6px', 
                      background: roleStyle.bg, 
                      color: roleStyle.text,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}>
                      {roleStyle.icon}
                      {u.role_name}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b' }}>
                      <Clock size={14} />
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </div>
                  </td>
                  <td>
                    {!isCurrentUserReadOnly ? (
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingRight: '1rem' }}>
                        {checkPerm && checkPerm('users', 'change_permissions') && (
                          <button 
                            className="icon-btn-square" 
                            title="Phân quyền cá nhân" 
                            style={{ color: '#2563eb' }}
                            onClick={() => onEditUserPerms(u)}
                          ><UserCog size={14} /></button>
                        )}
                        {checkPerm && checkPerm('users', 'edit') && (
                          <button 
                            className="icon-btn-square" 
                            title="Sửa thông tin" 
                            onClick={() => onEditUser(u)}
                          ><Edit3 size={14} /></button>
                        )}
                        {(checkPerm && (checkPerm('users', 'edit') || checkPerm('users', 'reset_password_team') || checkPerm('users', 'manage_team'))) && (
                          <button 
                            className="icon-btn-square" 
                            title="Đổi mật khẩu" 
                            style={{ color: '#d97706' }}
                            onClick={() => onChangePassword(u)}
                          ><Key size={14} /></button>
                        )}
                        {checkPerm && checkPerm('users', 'delete') && (
                          <button 
                            className="icon-btn-square danger" 
                            title="Xóa thành viên" 
                            onClick={() => onDeleteUser(u.id)}
                          ><Trash2 size={14} /></button>
                        )}
                      </div>
                    ) : (
                      <div style={{ textAlign: 'right', paddingRight: '2rem', fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                        Không có quyền sửa Admin
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Không tìm thấy thành viên phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersTab;
