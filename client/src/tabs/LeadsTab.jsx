import React from 'react';
import { 
  UserPlus, 
  MessageSquare, 
  CheckCircle, 
  Search, 
  Plus, 
  Clock, 
  ArrowUpRight, 
  Edit3, 
  Trash2, 
  FileText, 
  Package 
} from 'lucide-react';
import SearchableSelect from '../components/common/SearchableSelect';

const LeadsTab = ({ 
  leads, 
  filteredLeads, 
  leadFilters, 
  setLeadFilters, 
  setShowAddLeadModal, 
  setEditingLead, 
  handleDeleteLead, 
  users, 
  fastLead, 
  setFastLead, 
  handleFastAddLead, 
  getSourceIcon, 
  handleQuickUpdate, 
  hoveredNote, 
  setHoveredNote, 
  LEAD_STATUSES, 
  LEAD_SOURCES, 
  LEAD_CLASSIFICATIONS,
  tours,
  bus
}) => {
  return (
    <>
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon-bg"><UserPlus size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">HỒ SƠ MỚI</span>
            <div className="stat-value">{leads.filter(l => l.status === 'Mới').length}</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon-bg"><MessageSquare size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">ĐÃ LIÊN HỆ</span>
            <div className="stat-value">{leads.filter(l => l.status === 'Đã tư vấn' || l.status === 'Tư vấn lần 2').length}</div>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon-bg"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">CHỐT ĐƠN</span>
            <div className="stat-value">{leads.filter(l => l.status === 'Chốt đơn').length}</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
          <div className="filter-group">
            <label>TÌM KIẾM</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                className="filter-input" 
                style={{ width: '100%', paddingLeft: '36px' }} 
                placeholder="Tìm tên, SĐT..." 
                value={leadFilters.search} 
                onChange={e => setLeadFilters({...leadFilters, search: e.target.value})} 
              />
            </div>
          </div>
          <div className="filter-group">
            <label>TRẠNG THÁI</label>
            <select className="filter-select" value={leadFilters.status} onChange={e => setLeadFilters({...leadFilters, status: e.target.value})}>
              <option value="">-- Trạng thái --</option>
              {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>NHÓM BU</label>
            <select className="filter-select" value={leadFilters.bu_group} onChange={e => setLeadFilters({...leadFilters, bu_group: e.target.value})}>
              <option value="">Khối: Tất cả</option>
              {bus.filter(bu => bu.is_active !== false).map(bu => (
                <option key={bu.id} value={bu.id}>{bu.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>TƯ VẤN VIÊN</label>
            <select className="filter-select" value={leadFilters.assigned_to} onChange={e => setLeadFilters({...leadFilters, assigned_to: e.target.value})}>
              <option value="">-- Tư vấn viên --</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </select>
          </div>
          <button 
            className="login-btn" 
            style={{ 
              width: 'auto', 
              height: '42px', 
              padding: '0 1.5rem', 
              borderRadius: '8px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              background: '#2563eb', 
              color: 'white', 
              fontWeight: '800',
              border: 'none',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }} 
            onClick={() => setShowAddLeadModal(true)}
          >
            <Plus size={18} strokeWidth={3} /> <span style={{ letterSpacing: '0.5px' }}>THÊM LEAD</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.85rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>THỜI GIAN:</span>
          {[
            { id: 'today', label: 'Hôm nay' },
            { id: 'week', label: 'Tuần này' },
            { id: 'month', label: 'Tháng này' },
            { id: 'quarter', label: 'Quý này' },
            { id: 'all', label: 'Tất cả' }
          ].map(p => (
            <button key={p.id} className={`preset-btn ${(leadFilters.timeRange === p.id && !leadFilters.startDate && !leadFilters.endDate) ? 'active' : ''}`} onClick={() => setLeadFilters({...leadFilters, timeRange: p.id, startDate: '', endDate: ''})}>
              {p.label}
            </button>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Tùy chọn:</span>
            <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px' }} value={leadFilters.startDate || ''} onChange={e => setLeadFilters({...leadFilters, timeRange: 'custom', startDate: e.target.value})} />
            <span style={{ color: '#94a3b8' }}>-</span>
            <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px' }} value={leadFilters.endDate || ''} onChange={e => setLeadFilters({...leadFilters, timeRange: 'custom', endDate: e.target.value})} />
          </div>

          <div style={{ marginLeft: 'auto', color: '#94a3b8', fontWeight: 600, background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px' }}>
            {filteredLeads.length} Lead
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="col-date">NGÀY TẠO</th>
              <th className="col-info">THÔNG TIN LEAD</th>
              <th className="col-product">SẢN PHẨM QUAN TÂM</th>
              <th className="col-source">NGUỒN & NHÓM</th>
              <th className="col-staff">TƯ VẤN VIÊN</th>
              <th className="col-status">TRẠNG THÁI TƯ VẤN</th>
              <th className="col-contact">THỜI GIAN LIÊN HỆ</th>
              <th className="col-actions">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead.id}>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                </td>
                <td>
                  <div className="lead-info">
                    <span className="lead-name" style={{ fontWeight: 700 }}>
                      {lead.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      <span className="lead-phone" style={{ color: '#6366f1', fontSize: '0.85rem' }}>
                        {lead.phone || 'Chưa có SĐT'}
                      </span>
                      {(lead.facebook_psid || lead.meta_lead_id) && (
                        <div title="Đơn từ luồng tự động Meta" style={{ background: '#e0f2fe', color: '#0284c7', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                           META
                        </div>
                      )}
                      {Number(lead.notes_count) > 0 && (
                        <div 
                          className="note-icon-wrapper"
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            position: 'relative',
                            cursor: 'pointer',
                            padding: '4px',
                            background: '#f1f5f9',
                            borderRadius: '6px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredNote({ 
                              id: lead.id, 
                              content: lead.latest_note, 
                              count: lead.notes_count,
                              date: lead.latest_note_at,
                              x: rect.left, 
                              y: rect.top 
                            });
                          }} 
                          onMouseLeave={() => setHoveredNote({ id: null, content: '', x: 0, y: 0 })}
                        >
                          <FileText size={16} color="#2563eb" strokeWidth={2.5} />
                          <div className="note-badge" style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#e11d48', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {lead.notes_count}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <SearchableSelect 
                      options={tours}
                      value={lead.tour_id}
                      onChange={(val) => handleQuickUpdate(lead.id, 'tour_id', val)}
                      placeholder="Chọn tour..."
                      style={{ 
                        border: 'none', 
                        background: 'transparent',
                        padding: '0',
                        minHeight: 'auto',
                        minWidth: '220px',
                        fontSize: '0.85rem'
                      }}
                      className="table-searchable-select"
                    />
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getSourceIcon(lead.source)}
                      <select className="table-select-ghost" value={lead.source} onChange={e => handleQuickUpdate(lead.id, 'source', e.target.value)}>
                        {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Package size={12} color="#6366f1" />
                      <select className="table-select-ghost" style={{ color: '#6366f1', fontWeight: 600 }} value={lead.bu_group || ''} onChange={e => handleQuickUpdate(lead.id, 'bu_group', e.target.value)}>
                        <option value="">-- Nhóm --</option>
                        {bus.filter(bu => bu.is_active !== false || bu.id === lead.bu_group).map(bu => <option key={bu.id} value={bu.id}>{bu.label}</option>)}
                      </select>
                    </div>
                  </div>
                </td>
                <td>
                  <select className="table-select-ghost" style={{ fontWeight: 600 }} value={lead.assigned_to || ''} onChange={e => handleQuickUpdate(lead.id, 'assigned_to', e.target.value)}>
                    <option value="">Chưa giao</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <select className={`status-select badge-${lead.status}`} value={lead.status} onChange={e => handleQuickUpdate(lead.id, 'status', e.target.value)}>
                      {LEAD_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select className={`table-select-ghost classification-${lead.classification}`} style={{ fontSize: '0.65rem', padding: '2px 6px', fontWeight: 700 }} value={lead.classification || 'Mới'} onChange={e => handleQuickUpdate(lead.id, 'classification', e.target.value)}>
                      {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.75rem', color: '#64748b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={10} /> LH: {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ArrowUpRight size={10} /> BOOK: {lead.won_at ? new Date(lead.won_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '--'}
                    </div>
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button type="button" className="icon-btn-square" title="Chỉnh sửa" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingLead(lead); }}><Edit3 size={14} /></button>
                    <button type="button" className="icon-btn-square danger" title="Xóa" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteLead(lead.id); }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {hoveredNote.id && (
        <div className="dark-tooltip animate-fade-in" style={{ 
          position: 'fixed',
          top: hoveredNote.y - 8,
          left: hoveredNote.x + 20,
          transform: 'translateY(-100%)',
          pointerEvents: 'none',
          zIndex: 9999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <FileText size={14} color="#3b82f6" strokeWidth={3} />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ghi chú gần nhất ({hoveredNote.count})</span>
          </div>
          <div style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#e2e8f0', fontWeight: 400, whiteSpace: 'pre-wrap' }}>
            {hoveredNote.content || 'Không có nội dung ghi chú.'}
          </div>
          <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(hoveredNote.date).toLocaleString('vi-VN')}</span>
            <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 700 }}>FIT Tour CRM</span>
          </div>
        </div>
      )}
    </>
  );
};

export default LeadsTab;
