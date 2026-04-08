import React, { useState, useEffect } from 'react';
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
  Package,
  X 
} from 'lucide-react';
import SearchableSelect from '../components/common/SearchableSelect';
import axios from 'axios';
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
  bus,
  fetchLeads,
  handleConvertLead,
  navigateToInbox
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [bulkActionStatus, setBulkActionStatus] = useState('');
  const [bulkActionClass, setBulkActionClass] = useState('');
  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);
  const [editingPhoneId, setEditingPhoneId] = useState(null);
  const [tempPhone, setTempPhone] = useState('');

  const handlePhoneEdit = (lead) => {
    setEditingPhoneId(lead.id);
    setTempPhone(lead.phone || '');
  };

  const handlePhoneSave = (id) => {
    if (tempPhone.trim() !== '') {
       handleQuickUpdate(id, 'phone', tempPhone.trim());
    }
    setEditingPhoneId(null);
  };

  const handlePhoneKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      handlePhoneSave(id);
    } else if (e.key === 'Escape') {
      setEditingPhoneId(null);
    }
  };

  const toggleTour = (id) => {
    const currentTours = leadFilters.tours || [];
    if (currentTours.includes(id)) {
      setLeadFilters({ ...leadFilters, tours: currentTours.filter(t => t !== id) });
    } else {
      setLeadFilters({ ...leadFilters, tours: [...currentTours, id] });
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedLeadIds.length === 0) return;
    if (!bulkActionStatus && !bulkActionClass) {
        alert("Vui lòng chọn trạng thái hoặc phân loại để cập nhật!");
        return;
    }
    
    const updates = {};
    if (bulkActionStatus) updates.status = bulkActionStatus;
    if (bulkActionClass) updates.classification = bulkActionClass;

    if (!window.confirm(`Xác nhận cập nhật dữ liệu cho ${selectedLeadIds.length} hồ sơ?`)) return;

    try {
        const token = localStorage.getItem('token');
        await axios.post('/api/leads/bulk-update', {
            ids: selectedLeadIds,
            updates: updates
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        setSelectedLeadIds([]);
        setBulkActionStatus('');
        setBulkActionClass('');
        if (fetchLeads) {
            await fetchLeads();
        } else {
            window.location.reload();
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [leadFilters]);

  const actualItemsPerPage = itemsPerPage === 'all' ? Math.max(1, filteredLeads.length) : itemsPerPage;
  const totalPages = Math.ceil(filteredLeads.length / actualItemsPerPage) || 1;
  const currentLeads = filteredLeads.slice((currentPage - 1) * actualItemsPerPage, currentPage * actualItemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card purple">
          <div className="stat-icon-bg"><UserPlus size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">HỒ SƠ MỚI</span>
            <div className="stat-value">{filteredLeads.filter(l => l.status === 'Mới').length}</div>
          </div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon-bg"><MessageSquare size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">ĐÃ LIÊN HỆ</span>
            <div className="stat-value">{filteredLeads.filter(l => ['Đang liên hệ', 'Tiềm năng', 'Đặt cọc'].includes(l.status)).length}</div>
          </div>
        </div>
        <div className="stat-card teal">
          <div className="stat-icon-bg"><CheckCircle size={24} /></div>
          <div className="stat-content">
            <span className="stat-label">CHỐT ĐƠN</span>
            <div className="stat-value">{filteredLeads.filter(l => l.status === 'Chốt đơn').length}</div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '1rem', alignItems: 'end' }}>
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
              <option value="NO_BU">⚠ Chưa chọn BU</option>
              {bus.filter(bu => bu.is_active !== false).map(bu => (
                <option key={bu.id} value={bu.id}>{bu.label}</option>
              ))}
            </select>
          </div>
          <div className="filter-group" style={{ position: 'relative' }}>
            <label>SẢN PHẨM / TOUR</label>
            <div 
              className="filter-select" 
              style={{ cursor: 'pointer', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', background: 'white' }}
              onClick={() => setIsTourDropdownOpen(!isTourDropdownOpen)}
            >
              {(leadFilters.tours && leadFilters.tours.length > 0) ? `Đã chọn: ${leadFilters.tours.length}` : '-- Tất cả Tour --'}
            </div>
            {isTourDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 100, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#fef2f2' }} onClick={() => toggleTour('NO_TOUR')}>
                  <input type="checkbox" checked={leadFilters.tours?.includes('NO_TOUR') || false} readOnly />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>[Chưa chọn Tour]</span>
                </div>
                {tours.map(tour => (
                  <div key={tour.id} style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => toggleTour(String(tour.id))}>
                    <input type="checkbox" checked={leadFilters.tours?.includes(String(tour.id)) || false} readOnly />
                    <span style={{ fontSize: '0.85rem' }}>{tour.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="filter-group">
            <label>TƯ VẤN VIÊN</label>
            <select className="filter-select" value={leadFilters.assigned_to} onChange={e => setLeadFilters({...leadFilters, assigned_to: e.target.value})}>
              <option value="">-- Tất cả --</option>
              <option value="NO_STAFF">⚠ Chưa giao ai</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
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
            { id: 'yesterday', label: 'Hôm qua' },
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
            <span style={{ color: '#64748b', fontWeight: 600 }}>SĐT:</span>
            {[
              { id: '', label: 'Tất cả' },
              { id: 'yes', label: '✅ Có SĐT' },
              { id: 'no', label: '❌ Chưa có' }
            ].map(p => (
              <button key={p.id} className={`preset-btn ${leadFilters.hasPhone === p.id ? 'active' : ''}`} onClick={() => setLeadFilters({...leadFilters, hasPhone: p.id})}>
                {p.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', borderLeft: '1px solid #e2e8f0', paddingLeft: '1rem' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Tùy chọn:</span>
            <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px' }} value={leadFilters.startDate || ''} onChange={e => setLeadFilters({...leadFilters, timeRange: 'custom', startDate: e.target.value})} />
            <span style={{ color: '#94a3b8' }}>-</span>
            <input type="date" className="filter-input" style={{ padding: '4px 8px', height: '32px' }} value={leadFilters.endDate || ''} onChange={e => setLeadFilters({...leadFilters, timeRange: 'custom', endDate: e.target.value})} />
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(leadFilters.status || leadFilters.bu_group || leadFilters.assigned_to || leadFilters.search || leadFilters.hasPhone || (leadFilters.tours && leadFilters.tours.length > 0) || leadFilters.startDate || leadFilters.endDate) && (
              <button 
                type="button"
                onClick={() => setLeadFilters({ status: '', source: '', search: '', bu_group: '', assigned_to: '', timeRange: 'all', startDate: '', endDate: '', tours: [], hasPhone: '' })}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', 
                  padding: '4px 12px', borderRadius: '6px', cursor: 'pointer', 
                  fontWeight: 700, fontSize: '0.8rem',
                  transition: 'all 0.2s'
                }}
              >
                <X size={12} strokeWidth={3} /> Xóa bộ lọc
              </button>
            )}
            <select
              className="filter-select"
              style={{ padding: '4px 24px 4px 12px', height: '28px', fontSize: '0.8rem', borderRadius: '6px', fontWeight: 600, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', minWidth: '70px' }}
              value={itemsPerPage}
              onChange={(e) => {
                const val = e.target.value;
                setItemsPerPage(val === 'all' ? 'all' : parseInt(val, 10));
                setCurrentPage(1);
              }}
            >
              <option value={30}>30 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
              <option value={300}>300 dòng</option>
              <option value={1000}>1000 dòng</option>
              <option value="all">Tất cả</option>
            </select>
            <div style={{ color: '#94a3b8', fontWeight: 600, background: '#f1f5f9', padding: '4px 12px', borderRadius: '6px', fontSize: '0.85rem' }}>
              {filteredLeads.length} Lead
            </div>
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={currentLeads.length > 0 && selectedLeadIds.length === currentLeads.length}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedLeadIds(currentLeads.map(l => l.id));
                    else setSelectedLeadIds([]);
                  }}
                  style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                />
              </th>
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
            {currentLeads.map(lead => (
              <tr key={lead.id} className={selectedLeadIds.includes(lead.id) ? "selected-row" : ""}>
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedLeadIds.includes(lead.id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedLeadIds([...selectedLeadIds, lead.id]);
                      else setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead.id));
                    }}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                </td>
                <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>{new Date(lead.created_at).toLocaleDateString('vi-VN')}</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(lead.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    {lead.facebook_psid && (
                      <button
                        onClick={(e) => { e.stopPropagation(); navigateToInbox(lead.facebook_psid); }}
                        title="Xem hội thoại Messenger"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                          background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe',
                          borderRadius: '4px', padding: '2px 6px', fontSize: '0.65rem',
                          fontWeight: 700, cursor: 'pointer', marginTop: '2px',
                          transition: 'all 0.15s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#3b82f6'; }}
                      >
                        <MessageSquare size={10} /> Chat
                      </button>
                    )}
                  </div>
                </td>
                <td>
                  <div className="lead-info">
                    <span className="lead-name" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {lead.name}
                      {lead.is_returning_customer && (
                        <span 
                          style={{ 
                            fontSize: '0.65rem', 
                            background: '#f3e8ff', 
                            color: '#9333ea', 
                            padding: '2px 6px', 
                            borderRadius: '4px', 
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            whiteSpace: 'nowrap'
                          }}
                          title="Khách VVIP đã từng booking."
                        >
                          🎖️ KHÁCH QUEN {lead.total_spent > 0 ? `(Đã chi ${new Intl.NumberFormat('vi-VN').format(lead.total_spent)}đ)` : ''}
                        </span>
                      )}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                      {editingPhoneId === lead.id ? (
                        <input 
                          type="text" 
                          value={tempPhone}
                          onChange={e => setTempPhone(e.target.value)}
                          onBlur={() => handlePhoneSave(lead.id)}
                          onKeyDown={e => handlePhoneKeyDown(e, lead.id)}
                          autoFocus
                          style={{ 
                            fontSize: '0.85rem', 
                            padding: '2px 6px', 
                            border: '1px solid #6366f1', 
                            borderRadius: '4px', 
                            width: '120px',
                            outline: 'none',
                            color: '#6366f1',
                            fontWeight: 600
                          }} 
                        />
                      ) : (
                        <span 
                          className="lead-phone" 
                          style={{ color: '#6366f1', fontSize: '0.85rem', cursor: 'text', borderBottom: '1px dashed #cbd5e1' }}
                          title="Nhấn để sửa số điện thoại"
                          onClick={(e) => { e.stopPropagation(); handlePhoneEdit(lead); }}
                        >
                          {lead.phone || 'Chưa định danh SĐT...'}
                        </span>
                      )}
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
                  <SearchableSelect 
                    options={users.map(u => ({ id: u.id, name: u.username }))}
                    value={lead.assigned_to}
                    onChange={(val) => handleQuickUpdate(lead.id, 'assigned_to', val)}
                    placeholder="Chưa giao"
                    style={{ 
                      border: 'none', 
                      background: 'transparent',
                      padding: '0',
                      minHeight: 'auto',
                      minWidth: '150px',
                      fontSize: '0.85rem',
                      fontWeight: 600
                    }}
                    className="table-searchable-select"
                  />
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
                    <button 
                      type="button" 
                      className="icon-btn-square" 
                      style={{ color: '#10b981', background: '#d1fae5', border: 'none' }} 
                      title="Chuyển thành Khách Hàng (Chốt đơn)" 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        e.stopPropagation(); 
                        handleConvertLead(lead.id);
                      }}
                    >
                      <UserPlus size={14} />
                    </button>
                    <button type="button" className="icon-btn-square" title="Chỉnh sửa" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingLead(lead); }}><Edit3 size={14} /></button>
                    <button type="button" className="icon-btn-square danger" title="Xóa" onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteLead(lead.id); }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', paddingBottom: '1rem' }}>
          <button 
            type="button"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === 1 ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === 1 ? '#cbd5e1' : '#475569' }}
          >
            Trang trước
          </button>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
            Trang {currentPage} / {totalPages}
          </div>
          <button 
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', background: currentPage === totalPages ? '#f8fafc' : 'white', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontWeight: 600, color: currentPage === totalPages ? '#cbd5e1' : '#475569' }}
          >
            Trang sau
          </button>
        </div>
      )}

      {selectedLeadIds.length > 0 && (
        <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: 'white', padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', zIndex: 9999, animation: 'fadeIn 0.2s ease-out' }}>
          <div style={{ fontWeight: 800 }}>Đã chọn {selectedLeadIds.length} lead</div>
          <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
          <select value={bulkActionStatus} onChange={e => setBulkActionStatus(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}>
            <option value="" style={{ color: 'black' }}>-- Đổi trạng thái --</option>
            {LEAD_STATUSES.map(s => <option key={s} value={s} style={{ color: 'black' }}>{s}</option>)}
          </select>
          <select value={bulkActionClass} onChange={e => setBulkActionClass(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}>
            <option value="" style={{ color: 'black' }}>-- Đổi phân loại --</option>
            {LEAD_CLASSIFICATIONS.map(c => <option key={c} value={c} style={{ color: 'black' }}>{c}</option>)}
          </select>
          <button onClick={handleBulkUpdate} style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>CẬP NHẬT</button>
        </div>
      )}

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
