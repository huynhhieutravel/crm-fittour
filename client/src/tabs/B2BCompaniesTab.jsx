import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Search, Building, Plus, Eye, Trash2, Phone, Mail, Calendar, MapPin, Globe, ChevronDown, ChevronUp, Users, FolderOpen, X, Edit3, UserCheck } from 'lucide-react';
import SearchableSelect from '../components/common/SearchableSelect';
import B2BCompanyModal, { INDUSTRY_OPTIONS } from '../components/modals/B2BCompanyModal';

const B2BCompaniesTab = ({ currentUser, addToast, users = [], activeView = 'list', companies: externalCompanies, onCompaniesChange, handleDeleteCompany }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [industryFilter, setIndustryFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');

  const uniqueIndustries = INDUSTRY_OPTIONS;

  useEffect(() => { fetchCompanies(); }, []);

  useEffect(() => {
    const handleReload = () => fetchCompanies();
    window.addEventListener('reloadB2bCompanies', handleReload);
    
    const pending = sessionStorage.getItem('pendingCompanyOpen');
    if (pending && companies.length > 0) {
      const c = companies.find(comp => String(comp.id) === String(pending));
      if (c) {
        setSelectedCompany(c);
        setShowDetailDrawer(true);
      }
      sessionStorage.removeItem('pendingCompanyOpen');
    }
    
    return () => {
      window.removeEventListener('reloadB2bCompanies', handleReload);
    };
  }, [companies]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/b2b-companies', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setCompanies(res.data);
      if (onCompaniesChange) onCompaniesChange(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedCompany({}); // empty object triggers create mode in Modal
    setShowDetailDrawer(true);
  };

  const handleDelete = (id) => {
    if (handleDeleteCompany) {
      handleDeleteCompany(id);
    }
  };

  const openDetail = async (company) => {
    try {
      const res = await axios.get(`/api/b2b-companies/${company.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedCompany(res.data);
      setShowDetailDrawer(true);
    } catch (err) {
      addToast?.('Lỗi tải chi tiết DN', 'error');
    }
  };

  const openEdit = (company) => {
    openDetail(company); // The modal handles edit/view collectively now.
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowDetailDrawer(false);
    setSelectedCompany(null);
  };

  const filteredCompanies = useMemo(() => {
    let list = companies.filter(c => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q) || c.tax_id?.toLowerCase().includes(q);
      const matchIndustry = !industryFilter || c.industry === industryFilter;
      const matchAssigned = !assignedFilter || c.assigned_to === assignedFilter;
      return matchSearch && matchIndustry && matchAssigned;
    });
    list.sort((a, b) => {
      let va = a[sortField], vb = b[sortField];
      if (sortField === 'total_revenue' || sortField === 'total_projects' || sortField === 'total_contacts') {
        va = Number(va) || 0; vb = Number(vb) || 0;
      } else {
        va = (va || '').toString().toLowerCase(); vb = (vb || '').toString().toLowerCase();
      }
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
    return list;
  }, [companies, searchTerm, sortField, sortDir, industryFilter, assignedFilter]);

  const handleInlineAssign = async (companyId, newAssignedTo, e) => {
    e.stopPropagation();
    try {
      await axios.put(`/api/b2b-companies/${companyId}`, 
        { ...companies.find(c => c.id === companyId), assigned_to: newAssignedTo || null },
        { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchCompanies();
      addToast?.('Cập nhật Sale thành công!', 'success');
    } catch (err) {
      addToast?.('Lỗi cập nhật Sale', 'error');
    }
  };

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => sortField === field ? (sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;

  const formatVND = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString('vi-VN') + ' đ';
  };

  // Render is delegated to B2BCompanyModal

  return (
    <div className="tab-content-area">
      <div className="section-header" style={{ marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Building size={22} color="#6366f1" /> DOANH NGHIỆP B2B
        </h2>
        <button className="btn-pro-save" style={{ background: '#6366f1' }} onClick={handleCreateNew}>
          <Plus size={16} /> THÊM DOANH NGHIỆP
        </button>
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text" placeholder="Tìm kiếm DN: Tên, SĐT, Email, MST..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }}
          />
        </div>
        <div style={{ minWidth: '200px' }}>
          <select className="filter-select" style={{ width: '100%' }} value={industryFilter} onChange={e => setIndustryFilter(e.target.value)}>
            <option value="">Tất cả ngành nghề</option>
            {uniqueIndustries.map(ind => <option key={ind} value={ind}>{ind}</option>)}
          </select>
        </div>
        <div style={{ minWidth: '200px' }}>
          <select className="filter-select" style={{ width: '100%' }} value={assignedFilter} onChange={e => setAssignedFilter(e.target.value)}>
            <option value="">Tất cả Sale phụ trách</option>
            {users.filter(u => ['group_manager', 'group_staff'].includes(u.role_name)).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <table className="leads-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              <th style={{ cursor: 'pointer', padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }} onClick={() => toggleSort('name')}>
                Tên Doanh nghiệp <SortIcon field="name" />
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Liên hệ</th>
              <th style={{ cursor: 'pointer', padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }} onClick={() => toggleSort('total_contacts')}>
                Số NLH <SortIcon field="total_contacts" />
              </th>
              <th style={{ cursor: 'pointer', padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }} onClick={() => toggleSort('total_projects')}>
                Dự án <SortIcon field="total_projects" />
              </th>
              <th style={{ cursor: 'pointer', padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }} onClick={() => toggleSort('total_revenue')}>
                Tổng DT <SortIcon field="total_revenue" />
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', minWidth: '160px' }}>
                <UserCheck size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />Sale chăm sóc
              </th>
              <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Đang tải...</td></tr>
            ) : filteredCompanies.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Không có doanh nghiệp nào</td></tr>
            ) : filteredCompanies.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => openDetail(c)}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {c.name}
                    {Number(c.total_projects) > 0 && (
                      <span style={{ fontSize: '0.65rem', background: '#ecfdf5', color: '#059669', padding: '2px 6px', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                        📁 {c.total_projects} Dự án
                      </span>
                    )}
                  </div>
                  {c.industry && <span style={{ fontSize: '0.75rem', background: '#ede9fe', color: '#6366f1', padding: '1px 8px', borderRadius: '8px', display: 'inline-block', marginTop: '4px' }}>{c.industry}</span>}
                </td>
                <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '0.85rem' }}>
                  {c.phone || '—'}<br/>
                  <span style={{ fontSize: '0.75rem' }}>{c.email || ''}</span>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>{c.total_contacts}</td>
                <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 600 }}>{c.total_projects}</td>
                <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: Number(c.total_revenue) > 0 ? '#16a34a' : '#94a3b8' }}>
                  {formatVND(c.total_revenue)}
                </td>
                <td style={{ padding: '14px 8px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  <select 
                    value={c.assigned_to || ''} 
                    onChange={e => handleInlineAssign(c.id, e.target.value, e)}
                    style={{ 
                      padding: '6px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', 
                      fontSize: '0.8rem', background: c.assigned_to ? '#f0fdf4' : '#fef2f2', 
                      color: c.assigned_to ? '#15803d' : '#dc2626', fontWeight: 600, 
                      cursor: 'pointer', minWidth: '130px',
                      outline: 'none'
                    }}
                  >
                    <option value="">-- Chưa gán --</option>
                    {users.filter(u => ['group_manager', 'group_staff'].includes(u.role_name)).map(u => <option key={u.id} value={u.id}>{u.full_name || u.username}</option>)}
                  </select>
                </td>
                <td style={{ padding: '14px 16px', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button className="icon-btn" title="Chi tiết" onClick={() => openDetail(c)}><Eye size={16} color="#6366f1" /></button>
                    <button className="icon-btn" title="Sửa" onClick={() => openEdit(c)}><Edit3 size={16} color="#3b82f6" /></button>
                    <button className="icon-btn" title="Xóa" onClick={() => handleDelete(c.id)}><Trash2 size={16} color="#ef4444" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showDetailDrawer && selectedCompany && (
          <B2BCompanyModal 
              company={selectedCompany} 
              onClose={closeModals} 
              users={users} 
              onUpdateSuccess={() => {
                  closeModals();
                  addToast?.('Lưu Doanh nghiệp thành công!', 'success');
                  fetchCompanies();
              }} 
          />
      )}
    </div>
  );
};

export default B2BCompaniesTab;
