import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Star, Trash2, UserPlus, UserMinus, Crown, ChevronDown, ChevronUp, Edit3, X, Shield } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || '';

const TeamsTab = ({ addToast, users = [] }) => {
  const [teams, setTeams] = useState([]);
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [teamMembers, setTeamMembers] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [showAddMember, setShowAddMember] = useState(null); // teamId
  const [newTeam, setNewTeam] = useState({ name: '', code: '', description: '' });

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

  const fetchTeams = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/users/teams`, { headers });
      if (res.ok) setTeams(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const fetchMembers = async (teamId) => {
    try {
      const res = await fetch(`${API}/api/users/teams/${teamId}/members`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTeamMembers(prev => ({ ...prev, [teamId]: data }));
      }
    } catch (e) { console.error(e); }
  };

  const toggleExpand = (teamId) => {
    if (expandedTeam === teamId) {
      setExpandedTeam(null);
    } else {
      setExpandedTeam(teamId);
      if (!teamMembers[teamId]) fetchMembers(teamId);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.code) return addToast?.('Vui lòng nhập tên và mã team', 'error');
    try {
      const res = await fetch(`${API}/api/users/teams`, { method: 'POST', headers, body: JSON.stringify(newTeam) });
      const data = await res.json();
      if (res.ok) {
        addToast?.('Tạo team thành công!', 'success');
        setShowCreateModal(false);
        setNewTeam({ name: '', code: '', description: '' });
        fetchTeams();
      } else {
        addToast?.(data.message, 'error');
      }
    } catch (e) { addToast?.('Lỗi hệ thống', 'error'); }
  };

  const handleUpdateTeam = async () => {
    if (!editingTeam) return;
    try {
      const res = await fetch(`${API}/api/users/teams/${editingTeam.id}`, {
        method: 'PUT', headers,
        body: JSON.stringify({ name: editingTeam.name, description: editingTeam.description })
      });
      if (res.ok) {
        addToast?.('Cập nhật team thành công!', 'success');
        setEditingTeam(null);
        fetchTeams();
      }
    } catch (e) { addToast?.('Lỗi hệ thống', 'error'); }
  };

  const handleDeleteTeam = async (team) => {
    if (!confirm(`Xóa team "${team.name}"?`)) return;
    try {
      const res = await fetch(`${API}/api/users/teams/${team.id}`, { method: 'DELETE', headers });
      const data = await res.json();
      if (res.ok) {
        addToast?.('Đã xóa team', 'success');
        fetchTeams();
      } else {
        addToast?.(data.message, 'error');
      }
    } catch (e) { addToast?.('Lỗi hệ thống', 'error'); }
  };

  const handleAddMember = async (teamId, userId) => {
    try {
      const res = await fetch(`${API}/api/users/teams/${teamId}/members`, {
        method: 'POST', headers, body: JSON.stringify({ userId })
      });
      if (res.ok) {
        addToast?.('Đã thêm thành viên', 'success');
        fetchMembers(teamId);
        fetchTeams();
        setShowAddMember(null);
      }
    } catch (e) { addToast?.('Lỗi', 'error'); }
  };

  const handleRemoveMember = async (teamId, userId, name) => {
    if (!confirm(`Xóa "${name}" khỏi team?`)) return;
    try {
      const res = await fetch(`${API}/api/users/teams/${teamId}/members/${userId}`, { method: 'DELETE', headers });
      if (res.ok) {
        addToast?.('Đã xóa thành viên', 'success');
        fetchMembers(teamId);
        fetchTeams();
      }
    } catch (e) { addToast?.('Lỗi', 'error'); }
  };

  const handleToggleManager = async (teamId, userId, isCurrentlyManager) => {
    try {
      if (isCurrentlyManager) {
        await fetch(`${API}/api/users/teams/${teamId}/managers/${userId}`, { method: 'DELETE', headers });
        addToast?.('Đã gỡ quyền trưởng nhóm', 'success');
      } else {
        await fetch(`${API}/api/users/teams/${teamId}/managers`, {
          method: 'POST', headers, body: JSON.stringify({ userId })
        });
        addToast?.('Đã gán trưởng nhóm', 'success');
      }
      fetchMembers(teamId);
      fetchTeams();
    } catch (e) { addToast?.('Lỗi', 'error'); }
  };

  // Users not yet in this specific team
  const getAvailableUsers = (teamId) => {
    const currentMembers = teamMembers[teamId] || [];
    const memberIds = new Set(currentMembers.map(m => m.id));
    return users.filter(u => !memberIds.has(u.id) && u.is_active !== false);
  };

  const getTeamColor = (code) => {
    const colors = {
      'SALE': { bg: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)', border: '#86efac', text: '#15803d', accent: '#22c55e' },
      'MARKETING': { bg: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', border: '#93c5fd', text: '#1d4ed8', accent: '#3b82f6' },
      'OPERATIONS': { bg: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%)', border: '#c4b5fd', text: '#7c3aed', accent: '#8b5cf6' },
      'MICE': { bg: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', border: '#fcd34d', text: '#b45309', accent: '#f59e0b' },
    };
    return colors[code] || { bg: 'linear-gradient(135deg, #f1f5f9, #e2e8f0)', border: '#cbd5e1', text: '#475569', accent: '#64748b' };
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            <Shield size={24} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Quản lý Team
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0' }}>
            Tổ chức nhân sự theo nhóm — gán trưởng nhóm, thêm/xóa thành viên
          </p>
        </div>
        <button 
          className="btn-pro-save" 
          onClick={() => setShowCreateModal(true)}
          style={{ width: 'auto', padding: '0.75rem 1.5rem' }}
        >
          <Plus size={18} /> TẠO TEAM MỚI
        </button>
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
        {teams.map(team => {
          const color = getTeamColor(team.code);
          const isExpanded = expandedTeam === team.id;
          const members = teamMembers[team.id] || [];

          return (
            <div key={team.id} style={{
              background: '#fff',
              borderRadius: '16px',
              border: `2px solid ${isExpanded ? color.accent : '#f1f5f9'}`,
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: isExpanded ? `0 8px 32px ${color.accent}22` : '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              {/* Team Header */}
              <div 
                style={{ 
                  background: color.bg, padding: '1.25rem 1.5rem', cursor: 'pointer',
                  borderBottom: isExpanded ? `2px solid ${color.border}` : 'none'
                }}
                onClick={() => toggleExpand(team.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ 
                        fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                        background: color.accent, color: '#fff', letterSpacing: '1px'
                      }}>
                        {team.code}
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: color.text }}>
                        {team.name}
                      </h3>
                    </div>
                    {team.description && (
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 8px' }}>{team.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Users size={14} /> <strong>{team.member_count}</strong> thành viên
                      </span>
                      {(team.managers || []).length > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Crown size={14} color={color.accent} />
                          {team.managers.map(m => m.full_name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button 
                      className="icon-btn-square" title="Sửa" 
                      onClick={(e) => { e.stopPropagation(); setEditingTeam({ ...team }); }}
                      style={{ color: color.text }}
                    ><Edit3 size={14} /></button>
                    <button 
                      className="icon-btn-square danger" title="Xóa"
                      onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team); }}
                    ><Trash2 size={14} /></button>
                    {isExpanded ? <ChevronUp size={20} color={color.text} /> : <ChevronDown size={20} color="#94a3b8" />}
                  </div>
                </div>
              </div>

              {/* Expanded Members List */}
              {isExpanded && (
                <div style={{ padding: '1rem 1.5rem' }}>
                  {/* Add Member Button */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.75rem' }}>
                    <button 
                      onClick={() => setShowAddMember(showAddMember === team.id ? null : team.id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px',
                        borderRadius: '8px', border: `1px solid ${color.accent}`, background: 'transparent',
                        color: color.accent, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
                      }}
                    >
                      <UserPlus size={14} /> Thêm thành viên
                    </button>
                  </div>

                  {/* Add Member Dropdown */}
                  {showAddMember === team.id && (
                    <div style={{
                      background: '#f8fafc', borderRadius: '10px', padding: '0.75rem',
                      marginBottom: '0.75rem', border: '1px solid #e2e8f0', maxHeight: '200px', overflowY: 'auto'
                    }}>
                      {getAvailableUsers(team.id).length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', margin: '0.5rem 0' }}>
                          Tất cả nhân viên đã thuộc team này.
                        </p>
                      ) : (
                        getAvailableUsers(team.id).map(u => (
                          <div key={u.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '6px 10px', borderRadius: '6px', cursor: 'pointer',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          onClick={() => handleAddMember(team.id, u.id)}
                          >
                            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.full_name}</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>@{u.username} • {u.role_name}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Members List */}
                  {members.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem', fontSize: '0.85rem' }}>
                      Chưa có thành viên nào.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {members.map(m => (
                        <div key={m.id} style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          padding: '10px 14px', borderRadius: '10px',
                          background: m.is_manager ? `${color.accent}0a` : '#fafafa',
                          border: m.is_manager ? `1px solid ${color.accent}33` : '1px solid transparent'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '34px', height: '34px', borderRadius: '8px',
                              background: m.is_manager ? color.accent : '#e2e8f0',
                              color: m.is_manager ? '#fff' : '#64748b',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 800, fontSize: '0.8rem'
                            }}>
                              {m.is_manager ? <Crown size={16} /> : m.full_name?.charAt(0)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {m.full_name}
                                {m.is_manager && (
                                  <span style={{
                                    fontSize: '0.6rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px',
                                    background: color.accent, color: '#fff'
                                  }}>TRƯỞNG NHÓM</span>
                                )}
                              </div>
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                @{m.username} • {m.role_name?.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button 
                              className="icon-btn-square"
                              title={m.is_manager ? 'Gỡ quyền trưởng nhóm' : 'Gán trưởng nhóm'}
                              style={{ color: m.is_manager ? color.accent : '#94a3b8' }}
                              onClick={() => handleToggleManager(team.id, m.id, m.is_manager)}
                            >
                              <Star size={14} fill={m.is_manager ? color.accent : 'none'} />
                            </button>
                            <button 
                              className="icon-btn-square danger"
                              title="Xóa khỏi team"
                              onClick={() => handleRemoveMember(team.id, m.id, m.full_name)}
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Tạo Team Mới</h3>
              <button className="icon-btn-square" onClick={() => setShowCreateModal(false)}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="filter-group">
                <label>TÊN TEAM *</label>
                <input className="filter-input" placeholder="VD: Team Sale Inbound" value={newTeam.name} onChange={e => setNewTeam(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="filter-group">
                <label>MÃ TEAM * (viết hoa, không dấu)</label>
                <input className="filter-input" placeholder="VD: SALE_INBOUND" value={newTeam.code} onChange={e => setNewTeam(p => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, '_') }))} />
              </div>
              <div className="filter-group">
                <label>MÔ TẢ</label>
                <textarea className="filter-input" rows={3} placeholder="Mô tả ngắn về team..." value={newTeam.description} onChange={e => setNewTeam(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button className="btn-pro-save" onClick={handleCreateTeam} style={{ marginTop: '0.5rem' }}>
                <Plus size={18} /> TẠO TEAM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      {editingTeam && (
        <div className="modal-overlay" onClick={() => setEditingTeam(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Sửa Team: {editingTeam.code}</h3>
              <button className="icon-btn-square" onClick={() => setEditingTeam(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="filter-group">
                <label>TÊN TEAM</label>
                <input className="filter-input" value={editingTeam.name} onChange={e => setEditingTeam(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="filter-group">
                <label>MÔ TẢ</label>
                <textarea className="filter-input" rows={3} value={editingTeam.description || ''} onChange={e => setEditingTeam(p => ({ ...p, description: e.target.value }))} />
              </div>
              <button className="btn-pro-save" onClick={handleUpdateTeam} style={{ marginTop: '0.5rem' }}>
                LƯU THAY ĐỔI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamsTab;
