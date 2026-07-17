import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Users, Phone, Mail, ExternalLink, Search, Copy, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const TeamDirectoryTab = ({ users }) => {
  const [selectedBU, setSelectedBU] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [showCopyMenu, setShowCopyMenu] = useState(false);
  const copyMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(event.target)) {
        setShowCopyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only show active users
  const activeUsers = useMemo(() => (users || []).filter(u => u.is_active !== false), [users]);

  // Extract unique BUs (for top filter and copy menu)
  const allBUs = useMemo(() => {
    const buMap = new Map();
    activeUsers.forEach(u => {
      (u.bus || []).forEach(b => {
        if (!buMap.has(b)) buMap.set(b, { name: b, count: 0 });
        buMap.get(b).count++;
      });
    });
    return [...buMap.values()]
      .filter(b => b.name && b.name.toUpperCase() !== 'KHÁC' && b.name.toUpperCase() !== 'KHAC')
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activeUsers]);

  // Filter
  const filteredUsers = useMemo(() => {
    return activeUsers.filter(u => {
      const matchBU = selectedBU === 'ALL' || (u.bus || []).includes(selectedBU);
      const matchSearch = !searchTerm || 
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone?.includes(searchTerm);
      return matchBU && matchSearch;
    });
  }, [activeUsers, selectedBU, searchTerm]);

  const isCopyableUser = (u) => {
    const bus = u.bus || [];
    return bus.length > 0 && bus.some(b => b && b.toUpperCase() !== 'KHÁC' && b.toUpperCase() !== 'KHAC');
  };

  const copyableUsers = useMemo(() => activeUsers.filter(isCopyableUser), [activeUsers]);
  const copyableFilteredUsers = useMemo(() => filteredUsers.filter(isCopyableUser), [filteredUsers]);

  const handleCopyEmails = (buName) => {
    let targetUsers = copyableUsers;
    if (buName === 'CURRENT_VIEW') {
      targetUsers = copyableFilteredUsers;
    } else if (buName !== 'ALL') {
      targetUsers = copyableUsers.filter(u => (u.bus || []).includes(buName));
    }
    const emails = targetUsers.map(u => u.email).filter(Boolean).join(', ');
    if (emails) {
      navigator.clipboard.writeText(emails);
      setCopied(buName);
      setTimeout(() => setCopied(false), 2000);
      toast.success(`Đã copy ${emails.split(',').length} email thành công!`, { position: 'bottom-center' });
    } else {
      toast.error(`Không tìm thấy email nào cho nhóm ${buName === 'CURRENT_VIEW' ? 'hiện tại' : buName}`, { position: 'bottom-center' });
    }
    setShowCopyMenu(false);
  };

  const getRoleLabel = (roleName) => {
    switch (roleName) {
      case 'admin': return { label: 'Quản trị viên', color: '#ef4444', bg: '#fef2f2' };
      case 'manager': return { label: 'Trưởng phòng', color: '#d97706', bg: '#fffbeb' };
      case 'sales': return { label: 'Nhân viên Sale', color: '#22c55e', bg: '#f0fdf4' };
      case 'marketing': return { label: 'Marketing', color: '#0ea5e9', bg: '#f0f9ff' };
      case 'operations': return { label: 'Điều hành', color: '#8b5cf6', bg: '#f5f3ff' };
      default: return { label: roleName || 'Nhân viên', color: '#64748b', bg: '#f8fafc' };
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #2563eb 100%)',
        borderRadius: '16px', padding: '2rem', color: '#fff', marginBottom: '1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 8px 32px rgba(15, 23, 42, 0.3)'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={28} /> Nhân Sự FIT Tour
          </h2>
          <p style={{ margin: '6px 0 0', opacity: 0.7, fontSize: '0.9rem' }}>
            Danh bạ thành viên công ty • {activeUsers.length} người
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative' }} ref={copyMenuRef}>
            <button
              onClick={() => setShowCopyMenu(!showCopyMenu)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '0.6rem 1rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                background: copied ? '#22c55e' : (showCopyMenu ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'),
                color: '#fff', backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={e => { if(!copied && !showCopyMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { if(!copied && !showCopyMenu) e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
            >
              <Copy size={16} />
              {copied ? 'Đã Copy!' : 'Copy Emails'}
              <ChevronDown size={14} style={{ transition: '0.2s', transform: showCopyMenu ? 'rotate(180deg)' : 'rotate(0)' }} />
            </button>
            
            {showCopyMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#fff', borderRadius: '12px', padding: '8px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.2)', zIndex: 100,
                minWidth: '240px', border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '4px 12px', textTransform: 'uppercase' }}>
                  Tùy chọn Copy
                </div>
                <button
                  onClick={() => handleCopyEmails('ALL')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#1e293b', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Tất cả nhân sự <span style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{copyableUsers.length}</span>
                </button>
                <button
                  onClick={() => handleCopyEmails('CURRENT_VIEW')}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  Theo bộ lọc hiện tại <span style={{ background: '#dbeafe', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{copyableFilteredUsers.length}</span>
                </button>
                
                <div style={{ height: '1px', background: '#e2e8f0', margin: '4px 0' }}></div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', padding: '4px 12px', textTransform: 'uppercase' }}>
                  Theo Business Unit
                </div>
                <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                  {allBUs.map(bu => (
                    <button
                      key={bu.name}
                      onClick={() => handleCopyEmails(bu.name)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                        padding: '8px 12px', borderRadius: '8px', border: 'none', background: 'transparent',
                        cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, color: '#475569', textAlign: 'left'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; }}
                    >
                      {bu.name} <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#64748b' }}>{bu.count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
            <input
              placeholder="Tìm tên, email, SĐT..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoComplete="new-password"
              spellCheck="false"
              className="directory-search-input"
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', padding: '0.6rem 0.75rem 0.6rem 2.2rem', borderRadius: '10px',
                fontSize: '0.85rem', width: '220px', outline: 'none',
                backdropFilter: 'blur(10px)'
              }}
            />
          </div>
        </div>
      </div>

      {/* BU Filter Buttons */}
      <div style={{
        display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap',
        padding: '0.75rem', background: '#fff', borderRadius: '12px',
        border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)'
      }}>
        <button
          onClick={() => setSelectedBU('ALL')}
          style={{
            padding: '0.55rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.8rem', transition: '0.2s',
            background: selectedBU === 'ALL' ? '#2563eb' : '#f1f5f9',
            color: selectedBU === 'ALL' ? '#fff' : '#475569',
            boxShadow: selectedBU === 'ALL' ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
          }}
        >
          Tất cả ({activeUsers.length})
        </button>
        {allBUs.map(bu => (
          <button
            key={bu.name}
            onClick={() => setSelectedBU(bu.name)}
            style={{
              padding: '0.55rem 1.2rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.8rem', transition: '0.2s',
              background: selectedBU === bu.name ? '#2563eb' : '#f1f5f9',
              color: selectedBU === bu.name ? '#fff' : '#475569',
              boxShadow: selectedBU === bu.name ? '0 4px 12px rgba(37, 99, 235, 0.3)' : 'none'
            }}
          >
            {bu.name} ({bu.count})
          </button>
        ))}
      </div>

      {/* Team List Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#111827', color: '#fff' }}>
            <tr>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>THÀNH VIÊN</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>SỐ ĐIỆN THOẠI</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>EMAIL / LIÊN HỆ</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>BUSINESS UNIT</th>
              <th style={{ padding: '1.25rem 1rem', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>GIA NHẬP</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u, i) => {
              const roleInfo = getRoleLabel(u.role_name);
              return (
                <tr key={u.id} style={{ borderBottom: i === filteredUsers.length - 1 ? 'none' : '1px solid #f1f5f9', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  {/* Thành viên */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        background: u.avatar_url ? `url(${u.avatar_url}) center/cover no-repeat` : `linear-gradient(135deg, ${roleInfo.color}20, ${roleInfo.color}40)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: '1rem', color: roleInfo.color,
                        border: `1px solid ${roleInfo.color}30`, flexShrink: 0,
                        overflow: 'hidden'
                      }}>
                        {!u.avatar_url && u.full_name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e293b' }}>{u.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{u.position || '-'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Số điện thoại */}
                  <td style={{ padding: '1rem', fontWeight: 700, color: '#1e293b', fontSize: '0.85rem' }}>
                    {u.phone ? (
                      <a href={`tel:${u.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', textDecoration: 'none' }}>
                        <Phone size={13} color="#0ea5e9" /> {u.phone}
                      </a>
                    ) : '-'}
                  </td>

                  {/* Email & Facebook */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {u.email && <a href={`mailto:${u.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', textDecoration: 'none' }}>
                        <Mail size={13} color="#8b5cf6" /> {u.email}
                      </a>}
                      {u.facebook_url && <a href={u.facebook_url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#3b82f6', textDecoration: 'none' }}>
                        <ExternalLink size={12} /> Facebook
                      </a>}
                    </div>
                  </td>

                  {/* Business Unit */}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '200px' }}>
                      {(u.bus || []).map((b, idx) => (
                        <span key={idx} style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          padding: '3px 8px', borderRadius: '6px',
                          background: '#f0fdf4', color: '#15803d',
                          fontSize: '0.7rem', fontWeight: 700
                        }}>
                          <Users size={10} /> {b}
                        </span>
                      ))}
                      {(!u.bus || u.bus.length === 0) && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>}
                    </div>
                  </td>

                  {/* Ngày gia nhập */}
                  <td style={{ padding: '1rem', color: '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('vi-VN') : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredUsers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            Không tìm thấy thành viên phù hợp.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDirectoryTab;
