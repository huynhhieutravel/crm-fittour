import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, Trash2, Edit2, MoreVertical, 
  Calendar, CreditCard, ChevronRight, User, Package, Lock, Unlock,
  TrendingUp, ArrowDownRight, ArrowUpRight, CheckCircle, Clock, XCircle, FileText, Download, Briefcase,
  Save, X
} from 'lucide-react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import TravelSupportModal from '../components/modals/TravelSupportModal';
import Swal from 'sweetalert2';

// Hàm định dạng số có dấu chấm phân cách
const formatMoney = (val) => {
  if (val === 0) return '0';
  if (!val) return '';
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Hàm chuyển từ chuỗi có dấu chấm về số thuần túy
const parseMoney = (val) => {
  if (!val) return 0;
  return parseFloat(val.toString().replace(/\./g, '')) || 0;
};

const TravelSupportTab = ({ checkPerm, users = [], currentUser }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  

  const [fastAdd, setFastAdd] = useState({
    sale_id: currentUser?.id || '',
    op_id: '',
    service_type: 'Lưu trú',
    service_name: '',
    usage_date: new Date().toLocaleDateString('en-CA'),
    unit_cost: 0,
    quantity: 1,
    unit_price: 0,
    collected_amount: 0,
    total_cost: 0,
    total_income: 0
  });

  const [filters, setFilters] = useState({
    timeRange: 'all',
    start_date: '',
    end_date: '',
    service_type: 'All',
    sale_id: '',
    status: 'All',
    search: ''
  });

  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionStatus, setBulkActionStatus] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  const handleTimeRangeChange = (rangeId) => {
    let start = '', end = '';
    const td = new Date();
    if (rangeId === 'today') {
      start = end = td.toLocaleDateString('en-CA');
    } else if (rangeId === 'yesterday') {
      const y = new Date(td);
      y.setDate(y.getDate() - 1);
      start = end = y.toLocaleDateString('en-CA');
    } else if (rangeId === 'week') {
      const first = td.getDate() - td.getDay() + 1;
      start = new Date(td.setDate(first)).toLocaleDateString('en-CA');
      const last = first + 6;
      end = new Date(td.setDate(last)).toLocaleDateString('en-CA');
    } else if (rangeId === 'month') {
      start = new Date(td.getFullYear(), td.getMonth(), 1).toLocaleDateString('en-CA');
      end = new Date(td.getFullYear(), td.getMonth() + 1, 0).toLocaleDateString('en-CA');
    } else if (rangeId === 'quarter') {
      const q = Math.floor(td.getMonth() / 3);
      start = new Date(td.getFullYear(), q * 3, 1).toLocaleDateString('en-CA');
      end = new Date(td.getFullYear(), q * 3 + 3, 0).toLocaleDateString('en-CA');
    }
    setFilters({ ...filters, timeRange: rangeId, start_date: start, end_date: end });
    setCurrentPage(1);
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/travel-support', {
        params: filters,
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters.start_date, filters.end_date, filters.service_type, filters.sale_id, filters.status]);

  // Lắng nghe tiếng gọi của AI Copilot
  useEffect(() => {
    const handleAiUpdate = (e) => {
      // Chỉ tự refresh nếu không phải form khác
      console.log("[TravelSupportTab] AI updated DB, auto refreshing...", e.detail);
      fetchItems();
    };
    window.addEventListener('AI_DATA_CHANGED', handleAiUpdate);
    return () => window.removeEventListener('AI_DATA_CHANGED', handleAiUpdate);
  }, [filters]);

  const handleSave = async (formData) => {
    try {
      if (editingItem) {
        await axios.put(`/api/travel-support/${editingItem.id}`, formData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('/api/travel-support', formData, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Không thể lưu dữ liệu.', 'error');
    }
  };

  // Logic Fast Add - Nhập tay hoàn toàn cho khỏe
  const updateFastAdd = (field, value) => {
    setFastAdd({ ...fastAdd, [field]: value });
  };

  const handleFastAddSubmit = async () => {
    if (!fastAdd.service_name || !fastAdd.sale_id) {
      Swal.fire('Cảnh báo', 'Vui lòng nhập Tên dịch vụ và chọn Sale!', 'warning');
      return;
    }
    try {
      await axios.post('/api/travel-support', fastAdd, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setFastAdd({
        sale_id: currentUser?.id || '',
        op_id: '',
        service_type: 'Lưu trú',
        service_name: '',
        usage_date: new Date().toLocaleDateString('en-CA'),
        unit_cost: 0,
        quantity: 1,
        unit_price: 0,
        collected_amount: 0,
        total_cost: 0,
        total_income: 0
      });
      fetchItems();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Không thể lưu nhanh.', 'error');
    }
  };

  const handleStatusUpdate = async (item, newStatus) => {
    try {
      await axios.put(`/api/travel-support/${item.id}`, { ...item, status: newStatus }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchItems();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Không thể cập nhật trạng thái.', 'error');
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkActionStatus || selectedIds.length === 0) return;

    const userRole = (currentUser?.role || '').toLowerCase();
    const canUnlock = (checkPerm && checkPerm('travel_support', 'unlock')) || userRole === 'admin';
    const itemsToUpdate = data.filter(item => selectedIds.includes(item.id));
    const hasLockedItems = itemsToUpdate.some(item => item.status === 'paid' || item.status === 'cancelled');

    if (hasLockedItems && !canUnlock) {
      Swal.fire('Lỗi phân quyền', 'Bạn không có quyền Mở khóa (chuyển trạng thái) các vé đã Tất toán hoặc Hủy!', 'error');
      return;
    }

    try {
      await axios.post('/api/travel-support/bulk-update', {
        ids: selectedIds,
        status: bulkActionStatus
      }, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedIds([]);
      setBulkActionStatus('');
      fetchItems();
      Swal.fire('Thành công', 'Đã cập nhật trạng thái hàng loạt', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Lỗi', 'Không thể cập nhật hàng loạt', 'error');
    }
  };

  const handleBulkExport = () => {
    if (selectedIds.length === 0) return;
    
    const itemsToExport = data.filter(item => selectedIds.includes(item.id)).map(item => ({
      'Sale Phụ Trách': item.sale_name || '---',
      'Loại Dịch Vụ': item.service_type,
      'Nội Dung / Tên Đoàn': item.service_name,
      'Ngày Sử Dụng': item.usage_date ? new Date(item.usage_date).toLocaleDateString('vi-VN') : '',
      'Hành Trình': item.route || '',
      'Số Lượng': item.quantity || 1,
      'Giá Vốn': item.unit_cost,
      'Giá Bán': item.unit_price,
      'Tổng Chi': item.total_cost,
      'Tổng Thu': item.total_income,
      'Thuế / Phí Khác': item.tax,
      'Đã Thu': item.collected_amount,
      'Lợi Nhuận': (parseFloat(item.total_income) || 0) - (parseFloat(item.total_cost) || 0) - (parseFloat(item.tax) || 0),
      'Trạng Thái': item.status === 'paid' ? 'Tất toán' : item.status === 'cancelled' ? 'Hủy' : 'Đang chờ',
      'Ghi Chú': item.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(itemsToExport);
    
    // Auto adjust column widths
    const colWidths = [
      {wch: 20}, {wch: 15}, {wch: 40}, {wch: 15}, {wch: 20},
      {wch: 10}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15},
      {wch: 15}, {wch: 15}, {wch: 15}, {wch: 12}, {wch: 30}
    ];
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DichVuHoTro");
    
    XLSX.writeFile(workbook, `ThongKeDV_HoTro_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Xác nhận xóa?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });
    if (result.isConfirmed) {
      try {
        await axios.delete(`/api/travel-support/${id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        fetchItems();
      } catch (err) {
        Swal.fire('Lỗi', 'Không thể xóa.', 'error');
      }
    }
  };

  const filteredData = (data || []).filter(item => 
    (item.service_name || '').toLowerCase().includes((filters.search || '').toLowerCase()) ||
    (item.sale_name || '').toLowerCase().includes((filters.search || '').toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

  const userRole = (currentUser?.role || '').toLowerCase();
  const canCreate = (checkPerm && checkPerm('travel_support', 'create')) || userRole === 'admin';
  const canEdit = (checkPerm && checkPerm('travel_support', 'edit')) || userRole === 'admin';
  const canDelete = (checkPerm && checkPerm('travel_support', 'delete')) || userRole === 'admin';

  const saleUsers = users.filter(u => 
    u.is_active !== false && 
    (['admin', 'manager', 'sales', 'marketing'].includes(u.role_name) || u.permissions?.leads?.can_view || u.permissions?.leads?.can_edit)
  ).sort((a, b) => {
    if (currentUser) {
       if (a.id === currentUser.id) return -1;
       if (b.id === currentUser.id) return 1;
    }
    return (a.username || '').localeCompare(b.username || '');
  });

  const opsUsers = users.filter(u => {
    if (u.is_active === false) return false;
    const info = ((u.role_name || '') + ' ' + (u.department || '')).toLowerCase();
    return info.includes('điều hành') || info.includes('ops') || info.includes('visa') || info.includes('sale') || info.includes('sales');
  }).sort((a, b) => {
    if (currentUser) {
       if (a.id === currentUser.id) return -1;
       if (b.id === currentUser.id) return 1;
    }
    const getPriority = (u) => {
      const p = ((u.role_name || '') + ' ' + (u.department || '')).toLowerCase();
      if (p.includes('điều hành') || p.includes('ops')) return 1;
      if (p.includes('visa')) return 2;
      return 3;
    };
    const pa = getPriority(a), pb = getPriority(b);
    if (pa !== pb) return pa - pb;
    return (a.username || '').localeCompare(b.username || '');
  });

  return (
    <div className="travel-support-container" style={{ padding: '0', background: 'transparent' }}>
      
      {/* Bộ lọc */}
      <div className="filter-bar" style={{ marginBottom: '1rem' }}>
        <div className="lead-filter-grid travel-support-filters" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', width: '100%', alignItems: 'end' }}>
          <div className="filter-group">
            <label>TÌM KIẾM</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input className="filter-input" style={{ width: '100%', paddingLeft: '36px' }} placeholder="Tìm nội dung..." value={filters.search} onChange={e => { setFilters({...filters, search: e.target.value}); setCurrentPage(1); }} />
            </div>
          </div>
          <div className="filter-group">
            <label>LOẠI DỊCH VỤ</label>
            <select className="filter-select" value={filters.service_type} onChange={e => { setFilters({...filters, service_type: e.target.value}); setCurrentPage(1); }}>
              <option value="All">-- Tất cả loại --</option>
              <option value="Lưu trú">1. Lưu trú</option>
              <option value="Hàng không">2. Hàng không</option>
              <option value="Vận chuyển">3. Vận chuyển</option>
              <option value="Nhà hàng">4. Nhà hàng</option>
              <option value="Vé tham quan">5. Vé tham quan</option>
              <option value="Bảo hiểm du lịch">6. Bảo hiểm du lịch</option>
              <option value="Thuê SIM">7. Thuê SIM</option>
              <option value="Khác...">8. Khác...</option>
            </select>
          </div>
          <div className="filter-group">
            <label>SALE</label>
            <select className="filter-select" value={filters.sale_id} onChange={e => { setFilters({...filters, sale_id: e.target.value}); setCurrentPage(1); }}>
              <option value="">-- Tất cả Sale --</option>
              {saleUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>TRẠNG THÁI</label>
            <select className="filter-select" value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setCurrentPage(1); }}>
              <option value="All">-- Tất cả --</option>
              <option value="pending">Đang chờ</option>
              <option value="paid">Tất toán</option>
              <option value="cancelled">Hủy</option>
            </select>
          </div>
          {canCreate && <button onClick={() => { setEditingItem(null); setIsModalOpen(true); }} className="btn-pro-save" style={{ flexShrink: 0, height: '42px', padding: '0 1.5rem' }}><Plus size={18} /> THÊM</button>}
        </div>

        <div className="filter-options-container" style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="filter-options-group" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, color: '#64748b', marginRight: '0.5rem' }}>THỜI GIAN:</span>
            {[
              { id: 'today', label: 'Hôm nay' },
              { id: 'yesterday', label: 'Hôm qua' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'quarter', label: 'Quý này' },
              { id: 'all', label: 'Tất cả' }
            ].map(p => (
              <button key={p.id} className={`preset-btn ${(filters.timeRange === p.id) ? 'active' : ''}`} onClick={() => handleTimeRangeChange(p.id)}>
                {p.label}
              </button>
            ))}
          </div>

          <div className="filter-options-group filter-divider" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#64748b', fontWeight: 600 }}>Tùy chọn:</span>
            <input type="date" className="filter-input" style={{ width: '130px', padding: '8px' }} value={filters.start_date} onChange={e => { setFilters({...filters, start_date: e.target.value, timeRange: 'custom'}); setCurrentPage(1); }} />
            <span style={{ color: '#cbd5e1' }}>-</span>
            <input type="date" className="filter-input" style={{ width: '130px', padding: '8px' }} value={filters.end_date} onChange={e => { setFilters({...filters, end_date: e.target.value, timeRange: 'custom'}); setCurrentPage(1); }} />
          </div>
        </div>
      </div>

      <style>{`
        .travel-support-compact th, .travel-support-compact td {
           padding: 6px 12px !important;
        }
        .td-mobile-only { display: none; }
        @media (max-width: 1400px) {
           .fast-add-row {
              display: none !important;
           }
        }
        @media (max-width: 768px) {
           .travel-support-filters {
              display: flex !important;
              flex-direction: column;
           }
           .travel-support-filters > * {
              width: 100%;
           }
           .travel-support-filters button {
              width: 100%;
              justify-content: center;
           }
           .travel-support-compact {
              min-width: unset !important;
           }
           .td-mobile-only { display: flex !important; }
           .td-desktop-only { display: none !important; }
        }
      `}</style>
      <div className="data-table-container" style={{ overflowX: 'auto', minHeight: '500px', borderRadius: '16px', background: 'white' }}>
        <table className="data-table travel-support-compact mobile-card-table" style={{ minWidth: '1500px', tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th style={{ width: '35px', textAlign: 'center' }}>
                <input type="checkbox"
                  checked={currentItems.length > 0 && selectedIds.length === currentItems.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(currentItems.map(i => i.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                />
              </th>
              <th style={{ width: '35px', textAlign: 'center' }}>STT</th>
              <th style={{ width: '120px' }}>&nbsp;&nbsp;SALE</th>
              <th style={{ width: '130px' }}>ĐH</th>
              <th style={{ width: '120px' }}>LOẠI DV</th>
              <th style={{ minWidth: '180px' }}>TÊN DỊCH VỤ / ĐOÀN</th>
              <th style={{ textAlign: 'center', width: '110px' }}>NGÀY DÙNG</th>
              <th style={{ textAlign: 'right', width: '110px' }}>GIÁ THÀNH</th>
              <th style={{ textAlign: 'center', width: '40px' }}>SL</th>
              <th style={{ textAlign: 'right', width: '110px' }}>TỔNG CHI</th>
              <th style={{ textAlign: 'right', width: '110px' }}>TỔNG THU</th>
              <th style={{ textAlign: 'right', width: '110px' }}>ĐÃ THU</th>
              <th style={{ textAlign: 'right', width: '100px' }}>CÒN LẠI</th>
              <th style={{ textAlign: 'center', width: '95px' }}>TRẠNG THÁI</th>
              <th style={{ width: '70px', textAlign: 'center' }}></th>
            </tr>
          </thead>
          <tbody>
            {/* FAST ADD ROW */}
            {canCreate && (
                  <tr style={{ background: '#f8fafc' }} className="fast-add-row">
                 <td style={{ textAlign: 'center' }}></td>
                 <td style={{ textAlign: 'center' }}><Plus size={14} color="#6366f1" /></td>
                 <td style={{ padding: '6px 4px', minWidth: '120px' }}>
                    <select className="table-select-ghost" required style={{ fontWeight: 800, width: '100%', height: '36px', borderRadius: '8px', fontSize: '0.82rem' }} value={fastAdd.sale_id} onChange={e => updateFastAdd('sale_id', e.target.value)}>
                      <option value="">Sale</option>
                      {saleUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </select>
                 </td>
                 <td style={{ padding: '6px 4px', minWidth: '130px' }}>
                    <select className="table-select-ghost" style={{ fontWeight: 800, width: '100%', height: '36px', borderRadius: '8px', fontSize: '0.82rem' }} value={fastAdd.op_id} onChange={e => updateFastAdd('op_id', e.target.value)}>
                      <option value="">-- ĐH --</option>
                      {opsUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </select>
                 </td>
                 <td style={{ padding: '6px 4px', minWidth: '120px' }}>
                    <select className="table-select-ghost" style={{ width: '100%', height: '36px', borderRadius: '8px', fontSize: '0.82rem' }} value={fastAdd.service_type} onChange={e => updateFastAdd('service_type', e.target.value)}>
                      <option value="Lưu trú">1. Lưu trú</option><option value="Hàng không">2. Hàng không</option><option value="Vận chuyển">3. Vận chuyển</option><option value="Nhà hàng">4. Nhà hàng</option><option value="Vé tham quan">5. Vé tham quan</option><option value="Bảo hiểm du lịch">6. Bảo hiểm du lịch</option><option value="Thuê SIM">7. Thuê SIM</option><option value="Khác...">8. Khác...</option>
                    </select>
                 </td>
                 <td style={{ padding: '6px 8px' }}>
                   <input type="text" className="modal-input" style={{ fontSize: '0.82rem', height: '36px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0 12px' }} placeholder="Nhập tên..." value={fastAdd.service_name} onChange={e => updateFastAdd('service_name', e.target.value)} />
                 </td>
                 <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                    <input type="date" className="modal-input" style={{ fontSize: '0.82rem', height: '36px', width: '100%', borderRadius: '8px' }} value={fastAdd.usage_date} onChange={e => updateFastAdd('usage_date', e.target.value)} />
                 </td>
                 <td style={{ textAlign: 'right', padding: '6px 4px', minWidth: '110px' }}>
                    <input type="text" className="modal-input" style={{ fontSize: '0.82rem', height: '36px', textAlign: 'right', borderRadius: '8px', width: '100%' }} placeholder="Vốn" value={formatMoney(fastAdd.unit_cost)} onChange={e => updateFastAdd('unit_cost', parseMoney(e.target.value))} />
                 </td>
                 <td style={{ textAlign: 'center', padding: '6px 4px' }}>
                    <input type="number" className="modal-input" style={{ fontSize: '0.82rem', height: '36px', textAlign: 'center', width: '100%', borderRadius: '8px' }} value={fastAdd.quantity} onChange={e => updateFastAdd('quantity', parseFloat(e.target.value) || 1)} />
                 </td>
                 <td style={{ textAlign: 'right', padding: '6px 4px', minWidth: '110px' }}>
                    <input type="text" className="modal-input" style={{ fontSize: '0.82rem', height: '36px', textAlign: 'right', color: '#991b1b', borderRadius: '8px', background: '#fff5f5', width: '100%' }} value={formatMoney(fastAdd.total_cost)} onChange={e => updateFastAdd('total_cost', parseMoney(e.target.value))} />
                 </td>
                 <td style={{ textAlign: 'right', padding: '6px 4px', minWidth: '110px' }}>
                    <input type="text" className="modal-input" style={{ fontSize: '0.82rem', height: '36px', textAlign: 'right', color: '#1e40af', borderRadius: '8px', background: '#f0f7ff', width: '100%' }} value={formatMoney(fastAdd.total_income)} onChange={e => updateFastAdd('total_income', parseMoney(e.target.value))} />
                 </td>
                 <td style={{ textAlign: 'right', padding: '6px 4px', minWidth: '110px' }}>
                    <input type="text" className="modal-input" style={{ fontSize: '0.82rem', height: '36px', textAlign: 'right', color: '#6366f1', borderRadius: '8px', width: '100%' }} placeholder="Đã thu" value={formatMoney(fastAdd.collected_amount)} onChange={e => updateFastAdd('collected_amount', parseMoney(e.target.value))} />
                 </td>
                 <td style={{ textAlign: 'right', color: '#f59e0b', fontSize: '0.9rem', paddingRight: '12px', fontWeight: 600 }}>
                    {formatMoney(parseMoney(fastAdd.total_income) - parseMoney(fastAdd.collected_amount))}
                 </td>
                 <td style={{ textAlign: 'center' }}>
                    <button onClick={handleFastAddSubmit} className="btn-pro-save" style={{ width: '36px', height: '36px', padding: 0, borderRadius: '8px' }}><Save size={18} /></button>
                 </td>
              </tr>
            )}

            {/* DATA ROWS */}
            {!loading && currentItems.map((item, idx) => {
                 const total_cost = parseFloat(item.total_cost || 0);
                 const total_income = parseFloat(item.total_income || 0);
                 const collected = parseFloat(item.collected_amount || 0);
                 const balance = total_income - collected;
                 const isLocked = item.status === 'paid' || item.status === 'cancelled';
                 const userRole = (currentUser?.role || '').toLowerCase();
                 const canEditLocked = (checkPerm && checkPerm('travel_support', 'unlock')) || userRole === 'admin';
                 
                  return (
                  <tr key={item.id} style={{ cursor: (isLocked && !canEditLocked) ? 'default' : 'pointer', fontSize: '0.85rem', background: selectedIds.includes(item.id) ? '#eff6ff' : (isLocked ? '#fafafa' : ''), opacity: isLocked ? 0.8 : 1 }} onClick={() => { if (canEdit && (!isLocked || canEditLocked)) { setEditingItem(item); setIsModalOpen(true); } }}>
                    <td style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                       <input type="checkbox" 
                         checked={selectedIds.includes(item.id)}
                         onChange={(e) => {
                           if (e.target.checked) setSelectedIds([...selectedIds, item.id]);
                           else setSelectedIds(selectedIds.filter(id => id !== item.id));
                         }}
                       />
                    </td>
                    <td data-label="STT" className="td-desktop-only" style={{ textAlign: 'center', color: '#94a3b8' }}>{idx + 1 + indexOfFirstItem}</td>
                    <td data-label="" className="td-mobile-only card-highlight-name">{item.service_name} <span style={{ fontSize: '0.75rem', color: '#6366f1', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px', marginLeft: '6px' }}>{item.service_type}</span></td>
                    <td data-label="Sale">{item.sale_name || '---'}</td>
                    <td data-label="Điều hành">{item.op_name || '---'}</td>
                    <td data-label="Loại DV" className="td-desktop-only"><span style={{ fontSize: '0.75rem', color: '#6366f1', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: '6px' }}>{item.service_type}</span></td>
                    <td data-label="Tên DV" className="td-desktop-only">{item.service_name}</td>
                    <td data-label="Ngày dùng" style={{ textAlign: 'center' }}>{item.usage_date ? new Date(item.usage_date).toLocaleDateString('vi-VN') : '--'}</td>
                    <td data-label="Giá thành" style={{ textAlign: 'right' }}>{formatMoney(item.unit_cost)}</td>
                    <td data-label="SL" style={{ textAlign: 'center' }}>{item.quantity || 1}</td>
                    <td data-label="Tổng chi" style={{ textAlign: 'right', color: '#64748b' }}>{formatMoney(total_cost)}</td>
                    <td data-label="Tổng thu" style={{ textAlign: 'right' }}>{formatMoney(total_income)}</td>
                    <td data-label="Đã thu" style={{ textAlign: 'right', color: '#6366f1' }}>{formatMoney(collected)}</td>
                    <td data-label="Còn nợ" style={{ textAlign: 'right', color: balance > 0 ? '#f59e0b' : '#10b981' }}>{formatMoney(balance)}</td>
                    <td data-label="Trạng thái" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
                       <select 
                         disabled={!canEdit || (isLocked && !canEditLocked)}
                         className={`status-select-inline ${item.status === 'paid' ? 'status-guaranteed' : item.status === 'cancelled' ? 'status-cancelled' : 'status-open'}`} 
                         style={{ fontWeight: 600, padding: '4px 8px', borderRadius: '8px', cursor: (!canEdit || (isLocked && !canEditLocked)) ? 'not-allowed' : 'pointer', border: 'none', outline: 'none', textAlign: 'center', appearance: 'auto', width: '100px', opacity: (!canEdit || (isLocked && !canEditLocked)) ? 0.8 : 1 }}
                         value={item.status || 'pending'}
                         onChange={(e) => {
                           if (!canEdit || (isLocked && !canEditLocked)) return;
                           handleStatusUpdate(item, e.target.value);
                         }}
                       >
                         <option value="pending">Đang chờ</option>
                         <option value="paid">Tất toán</option>
                         <option value="cancelled">Hủy</option>
                       </select>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                       <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                         {(!isLocked || canEditLocked) ? (
                            <>
                              {canEdit && <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="icon-btn-square"><Edit2 size={16} /></button>}
                              {canDelete && <button onClick={() => handleDelete(item.id)} className="icon-btn-square danger"><Trash2 size={16} /></button>}
                            </>
                         ) : (
                            <div style={{ padding: '4px 8px', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Lock size={12} /> Đã khóa
                            </div>
                         )}
                       </div>
                    </td>
                  </tr>
                 )
              })}
          </tbody>
        </table>
      </div>

      <TravelSupportModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} editingItem={editingItem} onSave={handleSave} loading={loading} users={users} />

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (() => {
        const userRole = (currentUser?.role || '').toLowerCase();
        const canUnlock = (checkPerm && checkPerm('travel_support', 'unlock')) || userRole === 'admin';
        const hasLockedItems = data.filter(item => selectedIds.includes(item.id)).some(item => item.status === 'paid' || item.status === 'cancelled');

        return (
          <div className="bulk-actions-popup animate-fade-in" style={{
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
            background: '#1e293b', padding: '12px 24px', borderRadius: '12px',
            display: 'flex', alignItems: 'center', gap: '16px', zIndex: 9999,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)', color: 'white'
          }}>
            <div style={{ fontWeight: 600 }}>Đã chọn: <span style={{ color: '#38bdf8' }}>{selectedIds.length}</span></div>
            <div className="bulk-divider" style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
            
            <select value={bulkActionStatus} onChange={e => setBulkActionStatus(e.target.value)} style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}>
              <option value="" style={{ color: 'black' }}>-- Chuyển trạng thái --</option>
              {!(hasLockedItems && !canUnlock) && <option value="pending" style={{ color: 'black' }}>Đang chờ</option>}
              <option value="paid" style={{ color: 'black' }}>Tất toán</option>
              <option value="cancelled" style={{ color: 'black' }}>Hủy</option>
            </select>
            
            <button onClick={handleBulkUpdate} disabled={!bulkActionStatus} style={{ background: '#3b82f6', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 800, border: 'none', cursor: bulkActionStatus ? 'pointer' : 'not-allowed', opacity: bulkActionStatus ? 1 : 0.5 }}>
              CẬP NHẬT
            </button>

            <button disabled={!hasLockedItems || !canUnlock} onClick={() => { setBulkActionStatus('pending'); setTimeout(handleBulkUpdate, 0); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f59e0b', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 800, border: 'none', cursor: (hasLockedItems && canUnlock) ? 'pointer' : 'not-allowed', opacity: (hasLockedItems && canUnlock) ? 1 : 0.5 }} title={!canUnlock ? "Chỉ Quản lý/Kế toán mới có quyền Mở khóa" : (hasLockedItems ? "Mở khóa các dòng đã Tất toán/Hủy" : "Bạn chưa chọn dòng nào đang bị khóa")}>
              <Unlock size={16} /> MỞ KHÓA
            </button>

            <div style={{ height: '24px', width: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
            <button onClick={handleBulkExport} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '6px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
              <Download size={16} /> TẢI EXCEL
            </button>
            <button onClick={() => setSelectedIds([])} style={{ background: 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', padding: '8px' }}><X size={20} /></button>
          </div>
        );
      })()}

      {/* Phân trang */}
      {filteredData.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0 0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            <span>Hiển thị</span>
            <select 
              value={itemsPerPage} 
              onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
              style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', outline: 'none' }}
            >
              <option value={30}>30 dòng</option>
              <option value={50}>50 dòng</option>
              <option value={100}>100 dòng</option>
            </select>
            <span>/ {filteredData.length} kết quả</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
             <button disabled={currentPage === 1} onClick={prevPage} style={{ padding: '6px 12px', borderRadius: '6px', background: currentPage === 1 ? '#f1f5f9' : '#fff', border: '1px solid #e2e8f0', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}>Trước</button>
             <span style={{ margin: '0 8px', fontSize: '0.9rem', color: '#475569' }}>
               Trang <b>{currentPage}</b> / {totalPages || 1}
             </span>
             <button disabled={currentPage === totalPages || totalPages === 0} onClick={nextPage} style={{ padding: '6px 12px', borderRadius: '6px', background: currentPage === totalPages || totalPages === 0 ? '#f1f5f9' : '#fff', border: '1px solid #e2e8f0', cursor: currentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}>Sau</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelSupportTab;
