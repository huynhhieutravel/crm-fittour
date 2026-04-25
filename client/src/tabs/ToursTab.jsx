import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Trash2, Edit3, Eye } from 'lucide-react';
import Select from 'react-select';
import axios from 'axios';
import { useMarkets } from '../hooks/useMarkets';

const ToursTab = ({ 
  tourTemplates, 
  tourFilters, 
  setTourFilters, 
  setShowAddTemplateModal,
  setEditingTemplate,
  handleDeleteTour,
  handleUpdateTemplate,
  bus,
  currentUser,
  canCreate,
  canEdit,
  canDelete
}) => {
  const marketOptions = useMarkets();
  const uniqueDestinations = [...new Set(tourTemplates.map(t => t.destination).filter(Boolean))].sort();
  const tourTypes = ['Group Tour', 'Private Tour', 'Luxury Tour', 'MICE Tour'];

  const filteredTours = tourTemplates.filter(t => {
    const matchesSearch = (t.name || '').toLowerCase().includes(tourFilters.search.toLowerCase()) ||
                        (t.code || '').toLowerCase().includes(tourFilters.search.toLowerCase()) ||
                        (t.destination || '').toLowerCase().includes(tourFilters.search.toLowerCase()) ||
                        (t.bu_group || '').toLowerCase().includes(tourFilters.search.toLowerCase());
    const matchesType = !tourFilters.tour_type || t.tour_type === tourFilters.tour_type;
    const matchesDest = !tourFilters.destination || t.destination === tourFilters.destination;
    return matchesSearch && matchesType && matchesDest;
  });

  const [selectedTours, setSelectedTours] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', tour: null, message: '' });

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedTours(filteredTours.map(t => t.id));
    } else {
      setSelectedTours([]);
    }
  };

  const handleSelectTour = (tourId) => {
    setSelectedTours(prev => 
      prev.includes(tourId) ? prev.filter(id => id !== tourId) : [...prev, tourId]
    );
  };

  const handleBulkDeleteClicked = () => {
    if (selectedTours.length === 0) return;
    setConfirmModal({
       isOpen: true,
       type: 'delete',
       message: `Bạn có chắc chắn muốn xóa ${selectedTours.length} sản phẩm đã chọn không?\n\nLưu ý: Hệ thống sẽ tự động bỏ qua các Tour đang có Lịch Khởi Hành hoặc Lead liên kết.`
    });
  };

  const handleConfirmBulkDelete = async () => {
    try {
      const res = await axios.post('/api/tours/bulk-delete', { ids: selectedTours }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setConfirmModal({ isOpen: false });
      alert(res.data.message || 'Đã xóa thành công');
      setSelectedTours([]);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setConfirmModal({ isOpen: false });
      alert(err.response?.data?.error || 'Có lỗi xảy ra khi xóa hàng loạt');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="filter-bar" style={{ 
        display: 'flex', 
        flexDirection: 'row',
        flexWrap: 'wrap', 
        gap: '1rem', 
        alignItems: 'center', 
        backgroundColor: 'white',
        padding: '1.25rem',
        borderRadius: '1rem',
        boxShadow: 'var(--shadow)',
        marginBottom: '2rem'
      }}>
        <div className="filter-group" style={{ flex: '1 1 300px', margin: 0 }}>
          <label style={{ marginBottom: '8px', display: 'block' }}>TÌM KIẾM SẢN PHẨM</label>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input 
              className="filter-input" 
              style={{ width: '100%', paddingLeft: '40px', height: '44px' }} 
              placeholder="Tên tour, mã tour..." 
              value={tourFilters.search} 
              onChange={e => setTourFilters({...tourFilters, search: e.target.value})} 
            />
          </div>
        </div>

        <div className="filter-group" style={{ flex: '0 0 200px', margin: 0 }}>
          <label style={{ marginBottom: '8px', display: 'block' }}>LOẠI TOUR</label>
          <select 
            className="filter-input"
            style={{ width: '100%', height: '44px' }}
            value={tourFilters.tour_type || ''}
            onChange={e => setTourFilters({...tourFilters, tour_type: e.target.value})}
          >
            <option value="">-- Tất cả loại --</option>
            {tourTypes.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="filter-group" style={{ flex: '0 0 250px', margin: 0 }}>
          <label style={{ marginBottom: '8px', display: 'block' }}>ĐIỂM ĐẾN</label>
          <Select
            options={marketOptions}
            value={tourFilters.destination ? { value: tourFilters.destination, label: tourFilters.destination } : null}
            onChange={option => setTourFilters({...tourFilters, destination: option ? option.value : ''})}
            isClearable
            placeholder="-- Tất cả điểm --"
            styles={{
              control: (base) => ({ ...base, height: '44px', borderColor: '#e2e8f0', fontSize: '0.9rem' }),
              menu: (base) => ({ ...base, fontSize: '0.85rem', zIndex: 20 }),
              groupHeading: (base) => ({ ...base, fontWeight: 700, color: '#1e293b', textTransform: 'uppercase' })
            }}
          />
        </div>

        <div style={{ marginLeft: 'auto', paddingTop: '24px', display: 'flex', gap: '1rem' }}>
          <a 
            href={`${window.location.origin}/api/meta/catalog/feed.csv`}
            target="_blank"
            rel="noreferrer"
            title="Tải dữ liệu CSV cho Facebook Catalog"
            style={{ height: '44px', padding: '0 10px', background: '#f8fafc', color: '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '6px', textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 500, gap: '4px', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.color = '#d97706'; e.currentTarget.style.borderColor = '#f59e0b'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
          >
            📥 CSV
          </a>
          {canDelete && selectedTours.length > 0 && (
            <button 
              className="btn-danger" 
              style={{ display: 'flex', alignItems: 'center', height: '44px', padding: '0 1.5rem', whiteSpace: 'nowrap', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }} 
              onClick={handleBulkDeleteClicked}
            >
              <Trash2 size={18} strokeWidth={3} style={{ marginRight: '8px' }} /> XÓA {selectedTours.length} SẢN PHẨM
            </button>
          )}
          {canCreate && (
            <button 
              className="btn-pro-save" 
              style={{ height: '44px', padding: '0 1.5rem', whiteSpace: 'nowrap' }} 
              onClick={() => setShowAddTemplateModal(true)}
            >
              <Plus size={18} strokeWidth={3} style={{ marginRight: '8px' }} /> SẢN PHẨM MỚI
            </button>
          )}
        </div>
      </div>

      <div className="data-table-container shadow-sm" style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table">
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={filteredTours.length > 0 && selectedTours.length === filteredTours.length} 
                  onChange={handleSelectAll} 
                />
              </th>
              <th style={{ minWidth: '280px' }}>SẢN PHẨM TOUR</th>
              <th>KHỐI BU</th>
              <th>ĐIỂM ĐẾN</th>
              <th>LOẠI TOUR</th>
              <th>TRẠNG THÁI</th>
              <th>GIÁ NIÊM YẾT</th>
              <th style={{ textAlign: 'right', paddingRight: '2rem' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredTours.map(template => (
              <tr key={template.id}>
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedTours.includes(template.id)} 
                    onChange={() => handleSelectTour(template.id)} 
                  />
                </td>
                <td>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#2563eb' }}>{template.code || '-'}</span>
                          {Number(template.departures_count) > 0 && (
                             <span style={{ background: '#e0e7ff', color: '#4338ca', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px' }} title="Số Lịch khởi hành hiện có">
                                {template.departures_count} LKH
                             </span>
                          )}
                      </div>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, whiteSpace: 'normal', lineHeight: '1.4' }}>{template.name}</span>
                   </div>
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.8rem' }}>
                    {bus.find(b => b.id === template.bu_group)?.label || template.bu_group || 'BU4'}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', width: '15%' }}>{template.destination}</td>
                <td>
                  <span 
                    className="status-badge" 
                    style={{ 
                      background: template.tour_type === 'Luxury Tour' ? '#fef3c7' : 
                                 template.tour_type === 'MICE Tour' ? '#f0fdf4' : 
                                 template.tour_type === 'Private Tour' ? '#f5f3ff' : '#f1f5f9', 
                      color: template.tour_type === 'Luxury Tour' ? '#b45309' : 
                             template.tour_type === 'MICE Tour' ? '#15803d' : 
                             template.tour_type === 'Private Tour' ? '#6d28d9' : '#475569', 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      padding: '4px 8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {(template.tour_type || 'Group Tour').toUpperCase()}
                  </span>
                </td>
                <td>
                  <button 
                    disabled={!canEdit}
                    onClick={() => {
                        if (!canEdit) return;
                        setConfirmModal({
                           isOpen: true,
                           type: 'toggle_active',
                           tour: template,
                           message: `Bạn muốn ${template.is_active !== false ? 'TẠM NGƯNG' : 'MỞ LẠI'} tour này trên hệ thống Facebook Ads?`
                        });
                    }}
                    title="Bấm để bật/tắt quảng cáo tour này trên Facebook"
                    style={{ 
                      padding: '4px 10px', 
                      borderRadius: '20px', 
                      fontSize: '0.7rem', 
                      fontWeight: 700, 
                      backgroundColor: template.is_active !== false ? '#dcfce7' : '#fee2e2', 
                      color: template.is_active !== false ? '#166534' : '#991b1b',
                      display: 'inline-block',
                      border: 'none',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                  }}>
                    {template.is_active !== false ? '● ĐANG MỞ' : '○ TẠM NGƯNG'}
                  </button>
                </td>
                <td style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: '0.8rem' }}>
                  {Number(template.base_price || template.price || 0).toLocaleString('vi-VN')}đ
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingRight: '1rem' }}>
                    <button 
                      className="icon-btn-square primary" 
                      title="Xem biểu đồ và Lịch khởi hành" 
                      onClick={() => setEditingTemplate({...template, _openTab: 'departures'})}
                    >
                      <Eye size={14} />
                    </button>
                    {canEdit && (
                      <button 
                        className="icon-btn-square" 
                        title="Sửa sản phẩm" 
                        onClick={() => setEditingTemplate(template)}
                      >
                        <Edit3 size={14} />
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        className="icon-btn-square danger" 
                        title="Xoá sản phẩm" 
                        onClick={() => handleDeleteTour(template.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredTours.length === 0 && (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Không tìm thấy sản phẩm phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirmModal.isOpen && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative' }}>
             <h3 style={{ marginTop: 0, color: '#1e293b', fontSize: '1.25rem', fontWeight: 600 }}>Xác nhận</h3>
             <p style={{ color: '#475569', lineHeight: 1.5, marginBottom: '24px', whiteSpace: 'pre-wrap' }}>{confirmModal.message}</p>
             <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button style={{ padding: '8px 16px', border: '1px solid #cbd5e1', background: '#fff', color: '#1e293b', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }} onClick={() => setConfirmModal({isOpen: false, type: '', tour: null, message: ''})}>Hủy</button>
                <button style={{ padding: '8px 16px', border: 'none', background: confirmModal.type === 'delete' ? '#ef4444' : '#3b82f6', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }} onClick={() => {
                    if (confirmModal.type === 'delete') {
                       handleConfirmBulkDelete();
                    } else if (confirmModal.type === 'toggle_active') {
                       handleUpdateTemplate({...confirmModal.tour, is_active: confirmModal.tour.is_active === false ? true : false});
                       setConfirmModal({isOpen: false, type: '', tour: null, message: ''});
                    }
                }}>Đồng ý</button>
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default ToursTab;
