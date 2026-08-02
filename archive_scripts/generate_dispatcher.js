const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { Search, Send, Clock, Edit3, MessageSquare, CheckCircle, Smartphone, Plus, X } from 'lucide-react';
import axios from 'axios';

const DispatcherCenterTab = ({
  currentUser,
  filteredLeads,
  leadFilters,
  setLeadFilters,
  setEditingLead,
  users,
  getSourceIcon,
  LEAD_STATUSES,
  tours,
  bus
}) => {
  const [dispatcherLeads, setDispatcherLeads] = useState([]);
  const [loadingActionId, setLoadingActionId] = useState(null);
  const [localNotes, setLocalNotes] = useState({});
  const [localMarkets, setLocalMarkets] = useState({});

  const [isTourDropdownOpen, setIsTourDropdownOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const saleUsers = (users || []).filter(u => u.role === 'sale' || u.role === 'admin' || u.role === 'manager');

  useEffect(() => {
    let sorted = [...(filteredLeads || [])];
    
    sorted.sort((a, b) => {
        const aDispatched = a.dispatched_at ? 1 : 0;
        const bDispatched = b.dispatched_at ? 1 : 0;
        if (aDispatched !== bDispatched) return aDispatched - bDispatched; // 0 (chưa duyệt) đứng trước 1 (đã duyệt)

        const aHasPhone = (a.phone && String(a.phone).trim() !== '') ? 1 : 0;
        const bHasPhone = (b.phone && String(b.phone).trim() !== '') ? 1 : 0;
        if (aHasPhone !== bHasPhone) return bHasPhone - aHasPhone; // 1 (có phone) đứng trước 0 (ko phone)

        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime;
    });

    setDispatcherLeads(sorted);
  }, [filteredLeads]);

  const handlePush = async (leadId) => {
      try {
          setLoadingActionId(leadId);
          const note = localNotes[leadId] || '';
          const market = localMarkets[leadId] || '';
          
          await axios.put(\`/api/leads/\${leadId}\`, {
              dispatcher_notes: note,
              market_collection: market,
              dispatched_at: new Date().toISOString(),
              dispatched_by: currentUser.id,
              dispatched_by_name: currentUser.full_name
          }, {
              headers: { Authorization: \`Bearer \${localStorage.getItem('token')}\` }
          });
          
          window.dispatchEvent(new Event('refresh-leads'));
          
      } catch (err) {
          console.error('Error dispatching lead:', err);
      } finally {
          setLoadingActionId(null);
      }
  };

  const toggleTour = (tourId) => {
    const currentTours = leadFilters.tours || [];
    if (tourId === 'NO_TOUR') {
      if (currentTours.includes('NO_TOUR')) {
        setLeadFilters({...leadFilters, tours: currentTours.filter(id => id !== 'NO_TOUR')});
      } else {
        setLeadFilters({...leadFilters, tours: [...currentTours, 'NO_TOUR']});
      }
      return;
    }
    
    if (currentTours.includes(tourId)) {
      setLeadFilters({...leadFilters, tours: currentTours.filter(id => id !== tourId)});
    } else {
      setLeadFilters({...leadFilters, tours: [...currentTours, tourId]});
    }
  };

  const marketOptions = ['Nhật Bản', 'Hàn Quốc', 'Châu Âu', 'Mỹ', 'Nội Địa', 'Châu Á Khác', 'Khác'];

  // Pagination Logic
  const indexOfLastItem = itemsPerPage === 'all' ? dispatcherLeads.length : currentPage * itemsPerPage;
  const indexOfFirstItem = itemsPerPage === 'all' ? 0 : indexOfLastItem - itemsPerPage;
  const currentLeads = itemsPerPage === 'all' ? dispatcherLeads : dispatcherLeads.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="leads-list card-view fade-in">
      
      <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column-reverse', gap: '1rem', marginBottom: '16px' }}>
        <div className="lead-filter-grid">
          <div className="filter-group">
            <label>TÌM KIẾM</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                className="filter-input" 
                style={{ width: '100%', paddingLeft: '36px' }} 
                placeholder="Tìm tên, SĐT..." 
                value={leadFilters.search || ''} 
                onChange={e => setLeadFilters({...leadFilters, search: e.target.value})} 
              />
            </div>
          </div>
          <div className="filter-group">
            <label>TRẠNG THÁI</label>
            <select className="filter-select" value={leadFilters.status || ''} onChange={e => setLeadFilters({...leadFilters, status: e.target.value})}>
              <option value="">-- Trạng thái --</option>
              {(LEAD_STATUSES || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>NHÓM BU</label>
            <select className="filter-select" value={leadFilters.bu_group || ''} onChange={e => setLeadFilters({...leadFilters, bu_group: e.target.value})}>
              <option value="">Khối: Tất cả</option>
              <option value="NO_BU">⚠ Chưa chọn BU</option>
              {(bus || []).filter(bu => bu.is_active !== false).map(bu => (
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
              {(leadFilters.tours && leadFilters.tours.length > 0) ? \`Đã chọn: \${leadFilters.tours.length}\` : '-- Tất cả Tour --'}
            </div>
            {isTourDropdownOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', zIndex: 100, maxHeight: '250px', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: '#fef2f2' }} onClick={() => toggleTour('NO_TOUR')}>
                  <input type="checkbox" checked={leadFilters.tours?.includes('NO_TOUR') || false} readOnly />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ef4444' }}>[Chưa chọn Tour]</span>
                </div>
                {(tours || []).map(tour => (
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
            <select className="filter-select" value={leadFilters.assigned_to || ''} onChange={e => setLeadFilters({...leadFilters, assigned_to: e.target.value})}>
              <option value="">-- Tất cả --</option>
              <option value="NO_STAFF">⚠ Chưa giao ai</option>
              {saleUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
        </div>
        
        <div className="filter-options-container">
          <div className="filter-options-group">
            <span style={{ fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>THỜI GIAN:</span>
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'yesterday', label: 'Hôm qua' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'quarter', label: 'Quý này' },
              { id: 'all', label: 'Tất cả' }
            ].map(p => (
              <button key={p.id} className={\`preset-btn \${(leadFilters.timeRange === p.id && !leadFilters.startDate && !leadFilters.endDate) ? 'active' : ''}\`} onClick={() => setLeadFilters({...leadFilters, timeRange: p.id, startDate: '', endDate: ''})}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="filter-options-group filter-divider">
            <span style={{ color: '#64748b', fontWeight: 600 }}>SĐT:</span>
            {[
              { id: '', label: 'Tất cả' },
              { id: 'yes', label: '✅ Có SĐT' },
              { id: 'no', label: '❌ Chưa có' }
            ].map(p => (
              <button key={p.id} className={\`preset-btn \${leadFilters.hasPhone === p.id ? 'active' : ''}\`} onClick={() => setLeadFilters({...leadFilters, hasPhone: p.id})}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="filter-options-group filter-divider filter-date-group">
            <span className="filter-date-label" style={{ color: '#64748b', fontWeight: 600, whiteSpace: 'nowrap' }}>Tùy chọn:</span>
            <div className="filter-date-inputs-wrapper">
              <input type="date" className="filter-input filter-date-input" value={leadFilters.startDate || ''} onChange={e => setLeadFilters({...leadFilters, timeRange: 'custom', startDate: e.target.value})} />
              <span className="filter-date-separator" style={{ color: '#94a3b8' }}>-</span>
              <input type="date" className="filter-input filter-date-input" value={leadFilters.endDate || ''} onChange={e => setLeadFilters({...leadFilters, timeRange: 'custom', endDate: e.target.value})} />
            </div>
          </div>

          <div className="filter-options-actions">
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
              {(filteredLeads || []).length} Lead
            </div>
          </div>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table card-view-table">
          <thead>
            <tr>
              <th className="col-date">NGÀY TẠO</th>
              <th className="col-info">THÔNG TIN LEAD</th>
              <th className="col-product">SẢN PHẨM / NHU CẦU</th>
              <th className="col-source">NGUỒN GỐC</th>
              <th className="col-market" style={{minWidth: '150px'}}>THỊ TRƯỜNG (COLLECTION)</th>
              <th className="col-notes" style={{minWidth: '200px'}}>GHI CHÚ ĐIỀU PHỐI</th>
              <th className="col-dispatcher-action" style={{ textAlign: 'center', minWidth: '120px' }}>ĐIỀU PHỐI</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.map(lead => (
              <tr key={lead.id} style={{ opacity: lead.dispatched_at ? 0.6 : 1, background: lead.dispatched_at ? '#f8fafc' : 'white' }}>
                <td data-label="Ngày Tạo">
                  <div style={{ fontWeight: 600, color: '#2563eb', cursor: 'pointer' }} onClick={() => setEditingLead(lead)}>
                    {new Date(lead.created_at).toLocaleDateString('vi-VN')}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {new Date(lead.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>
                <td data-label="Thông Tin Lead">
                  <div style={{ fontWeight: 600 }}>{lead.name}</div>
                  {lead.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a', fontSize: '0.85rem', fontWeight: 500, marginTop: '2px' }}>
                      <Smartphone size={12} /> {lead.phone}
                    </div>
                  )}
                  {lead.email && <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{lead.email}</div>}
                </td>
                <td data-label="Sản Phẩm / Nhu Cầu">
                  <div style={{ fontWeight: 500 }}>{lead.tour_name || 'Khách lẻ / Chưa rõ'}</div>
                  {lead.classification && (
                    <span className="lead-type-badge">{lead.classification}</span>
                  )}
                </td>
                <td data-label="Nguồn Gốc">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {getSourceIcon && getSourceIcon(lead.source)}
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{lead.source}</span>
                  </div>
                  {lead.bu_group && (
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                      BU: {lead.bu_group}
                    </div>
                  )}
                </td>
                <td data-label="Thị Trường">
                  <select 
                    className="form-control" 
                    style={{ padding: '6px', fontSize: '0.85rem', width: '100%' }}
                    value={localMarkets[lead.id] !== undefined ? localMarkets[lead.id] : (lead.market_collection || '')}
                    onChange={(e) => setLocalMarkets({...localMarkets, [lead.id]: e.target.value})}
                    disabled={!!lead.dispatched_at}
                  >
                    <option value="">-- Chọn --</option>
                    {marketOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </td>
                <td data-label="Ghi Chú">
                  <input 
                    type="text" 
                    className="form-control"
                    style={{ padding: '6px', fontSize: '0.85rem', width: '100%' }}
                    placeholder="Dặn dò sale..."
                    value={localNotes[lead.id] !== undefined ? localNotes[lead.id] : (lead.dispatcher_notes || '')}
                    onChange={(e) => setLocalNotes({...localNotes, [lead.id]: e.target.value})}
                    disabled={!!lead.dispatched_at}
                  />
                </td>
                <td data-label="Điều Phối" style={{ textAlign: 'center' }}>
                  {lead.dispatched_at ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: '#16a34a' }}>
                      <CheckCircle size={16} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Đã duyệt</span>
                      <span style={{ fontSize: '0.7rem', color: '#64748b' }}>bởi {lead.dispatched_by_name}</span>
                    </div>
                  ) : (
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
                      onClick={() => handlePush(lead.id)}
                      disabled={loadingActionId === lead.id}
                    >
                      {loadingActionId === lead.id ? <Clock size={14} className="spin" /> : <Send size={14} />}
                      Duyệt & Push
                    </button>
                  )}
                </td>
              </tr>
            ))}
            
            {dispatcherLeads.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  Không có Lead nào cần điều phối
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatcherCenterTab;
`

fs.writeFileSync('client/src/tabs/DispatcherCenterTab.jsx', code);
