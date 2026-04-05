import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Phone, Mail, Building, Calendar, Briefcase, FileText, Send, Clock, CreditCard, Tag } from 'lucide-react';
import axios from 'axios';

const GroupLeaderProfileSlider = ({ leader, onClose, onAddNote, users = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  if (!leader) return null;

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(leader.id, newNote);
      setNewNote('');
    }
  };

  const formatMoney = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Báo giá': return { bg: '#e0e7ff', color: '#4f46e5' };
      case 'Đang theo dõi': return { bg: '#fef3c7', color: '#d97706' };
      case 'Thành công': return { bg: '#dcfce7', color: '#16a34a' };
      case 'Đã quyết toán': return { bg: '#f1f5f9', color: '#475569' };
      case 'Chưa thành công': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const modalContent = (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '800px', 
          width: '100%',
          maxHeight: '90vh', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
          padding: 0,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{ padding: '1.5rem', backgroundColor: '#1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(59,130,246,0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                {leader.name?.charAt(0) || 'B'}
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#f8fafc' }}>{leader.name}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(59,130,246,0.2)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.3)' }}>
                    🏢 {leader.company_name || 'Khách Lẻ B2B'}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, background: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}>
                    {leader.total_projects || 0} Dự án
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '6px', cursor: 'pointer', color: 'white', display: 'flex' }}><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '0 1.5rem' }}>
          {['overview', 'projects', 'interactions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '1rem',
                fontWeight: 600,
                color: activeTab === tab ? '#3b82f6' : '#64748b',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'overview' ? 'Tổng quan' : tab === 'projects' ? 'Dự Án MICE' : 'Lịch Chăm Sóc'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700, marginBottom: '4px' }}>TỔNG DỰ ÁN</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e40af' }}>{leader.total_projects || 0}</div>
                </div>
                <div style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 700, marginBottom: '4px' }}>TỔNG DOANH THU (LTV)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#065f46' }}>{formatMoney(leader.total_revenue)}</div>
                </div>
              </div>

              {/* Contact info */}
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={16} /> Thông tin liên hệ
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}><Phone size={12} style={{marginRight:'4px'}}/> Số điện thoại</div>
                    <div style={{ fontWeight: 500 }}>{leader.phone || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}><Mail size={12} style={{marginRight:'4px'}}/> Email</div>
                    <div style={{ fontWeight: 500 }}>{leader.email || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}><Building size={12} style={{marginRight:'4px'}}/> Công ty / Tổ chức</div>
                    <div style={{ fontWeight: 600 }}>{leader.company_name || 'Chưa cập nhật'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}><Calendar size={12} style={{marginRight:'4px'}}/> Ngày sinh</div>
                    <div style={{ fontWeight: 500 }}>{leader.dob ? new Date(leader.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</div>
                  </div>
                </div>
              </div>

              {/* Sale info */}
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Briefcase size={16} /> Nhân viên chăm sóc
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Sale phụ trách</div>
                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>
                      {leader.assigned_name || '--- Chưa gán ---'}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px' }}>Ngày tạo hồ sơ</div>
                    <div style={{ fontWeight: 500 }}>{leader.created_at ? new Date(leader.created_at).toLocaleDateString('vi-VN') : 'N/A'}</div>
                  </div>
                </div>
              </div>

              {/* Preferences / notes */}
              {leader.preferences && (
                <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tag size={16} /> Ghi chú nội bộ / Sở thích
                  </h3>
                  <div style={{ backgroundColor: '#fef2f2', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
                    <div style={{ color: '#7f1d1d', fontSize: '0.85rem', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{leader.preferences}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'projects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ color: '#64748b' }}>Tổng doanh thu từ B2B này:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>
                    {formatMoney(leader.total_revenue)}
                  </span>
                </div>
              </div>
              
              {!leader.projects || leader.projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có dự án MICE nào.</div>
              ) : (
                leader.projects.map(p => {
                  const sc = getStatusColor(p.status);
                  return (
                    <div key={p.id} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.name}</span>
                        <span style={{ padding: '2px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, background: sc.bg, color: sc.color }}>{p.status || 'Báo giá'}</span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '8px' }}>
                        📍 {p.destination || 'Chưa xác định'} · {p.expected_pax || 0} Pax
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '8px', marginTop: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                          {p.departure_date ? new Date(p.departure_date).toLocaleDateString('vi-VN') : '---'}
                          {p.return_date ? ` → ${new Date(p.return_date).toLocaleDateString('vi-VN')}` : ''}
                        </span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{formatMoney(p.total_revenue)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'interactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  className="modal-input" 
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }} 
                  placeholder="Ghi chú chăm sóc B2B..." 
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleAddNote()}
                />
                <button className="btn-pro-save" onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Send size={16} /> Lưu
                </button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {!leader.interaction_history || leader.interaction_history.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>Chưa có ghi chú chăm sóc nào.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {leader.interaction_history.map(note => (
                      <div key={note.id} style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ fontWeight: 600, color: '#3b82f6' }}>{note.creator_name || 'Hệ thống'}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} /> {new Date(note.created_at).toLocaleString('vi-VN')}
                          </span>
                        </div>
                        <div style={{ color: '#1e293b', fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {note.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default GroupLeaderProfileSlider;
