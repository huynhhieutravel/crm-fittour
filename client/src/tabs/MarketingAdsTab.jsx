import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { Upload, CloudUpload, Trash2, Filter, X, Save, Edit2, Lock, Unlock } from 'lucide-react';

const THANG_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const TUAN_OPTIONS = [1, 2, 3, 4, 5];
const NAM_OPTIONS = [2024, 2025, 2026, 2027];

const getWeekRanges = (year, month) => {
  if (!year || !month) return {};
  const y = parseInt(year);
  const m = parseInt(month);
  
  const firstDay = new Date(y, m - 1, 1);
  const lastDay = new Date(y, m, 0); 
  
  let firstSunday = new Date(firstDay);
  while (firstSunday.getDay() !== 0) {
    firstSunday.setDate(firstSunday.getDate() + 1);
  }
  
  let w1End = new Date(firstSunday);
  const daysInFirstSegment = firstSunday.getDate() - firstDay.getDate() + 1;
  // Rule: If <= 2 days in the first segment, merge with the next week
  if (daysInFirstSegment <= 2 && w1End.getDate() + 7 <= lastDay.getDate()) {
    w1End.setDate(w1End.getDate() + 7);
  }
  
  const ranges = {};
  ranges[1] = `${firstDay.getDate()}/${m} - ${w1End.getDate()}/${m}`;
  
  let currentStart = new Date(w1End);
  currentStart.setDate(currentStart.getDate() + 1);
  
  for (let w = 2; w <= 4; w++) {
    if (currentStart > lastDay) {
      ranges[w] = '';
      continue;
    }
    let currentEnd = new Date(currentStart);
    currentEnd.setDate(currentEnd.getDate() + 6);
    if (currentEnd > lastDay) currentEnd = new Date(lastDay);
    
    ranges[w] = `${currentStart.getDate()}/${m} - ${currentEnd.getDate()}/${m}`;
    
    currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() + 1);
  }
  
  if (currentStart <= lastDay) {
    ranges[5] = `${currentStart.getDate()}/${m} - ${lastDay.getDate()}/${m}`;
  } else {
    ranges[5] = '';
  }
  return ranges;
};

const MarketingAdsTab = ({ addToast, currentUser, bus }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [activeSubTab, setActiveSubTab] = useState('monthly'); // 'monthly', 'weekly', or 'progress'
  const [kpiData, setKpiData] = useState({ aggregates: [], kpis: [] });
  const [editingRecord, setEditingRecord] = useState(null);
  const [kpiModal, setKpiModal] = useState(null);

  const [filters, setFilters] = useState({
    bu_name: 'All',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    week_number: '',
  });
  
  const [selectedIds, setSelectedIds] = useState([]);

  const weekDaysInfo = React.useMemo(() => {
    if (!filters.month || !filters.year) return null;
    const m = parseInt(filters.month);
    const y = parseInt(filters.year);
    if (isNaN(m) || isNaN(y)) return null;
    
    const date = new Date(y, m - 1, 1);
    const lastDay = new Date(y, m, 0).getDate();
    const dayOfWeek = date.getDay();
    const w1Days = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const w5Days = lastDay - (w1Days + 21);
    
    return { w1: w1Days, w5: w5Days };
  }, [filters.month, filters.year]);

  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  
  const [importParams, setImportParams] = useState({
    bu_name: bus?.[0]?.id || 'BU1',
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    week_number: 1,
  });
  
  const [previewData, setPreviewData] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(r => {
      const cn = r.campaign_name ? r.campaign_name.toLowerCase() : '';
      const asn = r.ad_set_name ? r.ad_set_name.toLowerCase() : '';
      const an = r.ad_name ? r.ad_name.toLowerCase() : '';
      return cn.includes(term) || asn.includes(term) || an.includes(term);
    });
  }, [data, searchTerm]);

  useEffect(() => {
    fetchData();
    fetchKpis();
  }, [filters]);

  const fetchKpis = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/marketing-ads/kpis', {
        headers: { Authorization: `Bearer ${token}` },
        params: { year: filters.year }
      });
      setKpiData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper: format số có dấu chấm phân cách hàng nghìn
  const fmtNum = (v) => {
    if (!v && v !== 0) return '';
    return Number(v).toLocaleString('vi-VN');
  };
  const parseNum = (s) => {
    if (!s) return '';
    return s.replace(/[^0-9]/g, '');
  };

  const handleKpiSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        ...kpiModal,
        budget: parseNum(String(kpiModal.budget)),
        target_leads: parseNum(String(kpiModal.target_leads)),
        target_cpl: parseNum(String(kpiModal.target_cpl)),
        target_customers: parseNum(String(kpiModal.target_customers)),
        target_cpa: parseNum(String(kpiModal.target_cpa)),
        target_routes: parseNum(String(kpiModal.target_routes)),
        target_groups: parseNum(String(kpiModal.target_groups)),
      };
      await axios.post('/api/marketing-ads/kpis', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast?.('Cập nhật chỉ tiêu KPI thành công!', 'success');
      setKpiModal(null);
      fetchKpis();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Đã xảy ra lỗi khi lưu KPI.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/marketing-ads', {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      addToast?.('Lỗi khi tải dữ liệu báo cáo Ads', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (record) => {
    if (record.is_locked) {
      return Swal.fire('Dữ liệu đã khóa', 'Dòng báo cáo này đã bị khóa an toàn. Vui lòng mở khóa trước khi xóa!', 'error');
    }

    const result = await Swal.fire({
      title: 'Xóa báo cáo này?',
      text: `Bạn có chắc chắn muốn xóa dòng báo cáo "${record.campaign_name || 'Không tên'}" của ${record.bu_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đồng ý, xóa!',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/marketing-ads/${record.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast?.(`Đã xoá một dòng dữ liệu của ${record.bu_name}`);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa dòng dữ liệu.', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      return Swal.fire('Oops...', 'Vui lòng tích chọn vào các ô vuông bên trái của các dòng bạn muốn xóa!', 'warning');
    }

    const selectedRecords = data.filter(d => selectedIds.includes(d.id));
    const lockedRecordsCount = selectedRecords.filter(d => d.is_locked).length;
    
    if (lockedRecordsCount === selectedIds.length) {
      return Swal.fire('Không thể xóa', 'Tất cả các dòng bạn chọn đều đã bị KHÓA an toàn. Vui lòng mở khóa trước!', 'error');
    }
    
    let warningText = `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedIds.length} dòng báo cáo đã chọn không? Hành động này không thể hoàn tác.`;
    if (lockedRecordsCount > 0) {
      warningText = `Bạn đã chọn ${selectedIds.length} dòng, trong đó có ${lockedRecordsCount} dòng ĐÃ BỊ KHÓA.\nHệ thống bảo vệ data nên sẽ chỉ xóa ${selectedIds.length - lockedRecordsCount} dòng chưa khóa. Bạn có chắc chắn không?`;
    }
    
    const result = await Swal.fire({
      title: 'CẢNH BÁO XÓA',
      text: warningText,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Xác nhận xóa',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/marketing-ads/bulk-delete', { ids: selectedIds }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      addToast?.(response.data.message || `Đã thao tác xóa xong.`);
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', 'Đã xảy ra lỗi khi xóa hàng loạt báo cáo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkLock = async (lockStatus) => {
    if (selectedIds.length === 0) {
      return Swal.fire('Oops...', `Vui lòng tích chọn vào các ô vuông bên trái của các dòng bạn muốn ${lockStatus ? 'khóa' : 'mở khóa'}!`, 'warning');
    }
    
    const actionText = lockStatus ? 'KHÓA' : 'MỞ KHÓA';
    const result = await Swal.fire({
      title: `Xác nhận ${actionText}`,
      text: `Bạn có muốn ${actionText.toLowerCase()} ${selectedIds.length} dòng dữ liệu đã chọn? Dữ liệu bị khóa sẽ an toàn và không thể xóa.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: lockStatus ? '#eab308' : '#10b981',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.post('/api/marketing-ads/bulk-lock', { ids: selectedIds, is_locked: lockStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      Swal.fire('Thành công', `Đã thao tác xong trên ${selectedIds.length} dòng`, 'success');
      setSelectedIds([]);
      fetchData();
    } catch (err) {
      console.error(err);
      Swal.fire('Lỗi', `Đã xảy ra lỗi khi ${actionText.toLowerCase()} dữ liệu.`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleBlurManual = async (id, field, value) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/marketing-ads/${id}`, {
        [field]: value
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const finalValue = field === 'bu_name' ? value : (value === '' ? 0 : parseInt(value));
      setData(data.map(d => d.id === id ? { ...d, [field]: finalValue } : d));
      addToast?.('Đã tiếp nhận số liệu', 'success');
    } catch (err) {
      console.error(err);
      addToast?.('Lỗi lưu số liệu', 'error');
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios.put(`/api/marketing-ads/${editingRecord.id}`, {
        campaign_name: editingRecord.campaign_name,
        spend: editingRecord.spend,
        messages: editingRecord.messages,
        leads: editingRecord.leads
      });
      // addToast('Cập nhật thành công!', 'success');
      setEditingRecord(null);
      fetchData();
    } catch (err) {
      console.error(err);
      // addToast('Lỗi cập nhật', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      
      const mappedData = [];
      
      jsonData.forEach((row) => {
        const campaign = (row['Tên chiến dịch'] || row['Chiến dịch'] || '').toUpperCase();
        const adSet = (row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '').toUpperCase();
        const ad = (row['Tên quảng cáo'] || row['Quảng cáo'] || '').toUpperCase();
        const spend = parseFloat((row['Số tiền đã chi tiêu (VND)'] || row['Chi tiêu'] || row['Số tiền đã chi tiêu (VND)'] || '0').toString().replace(/[^0-9.-]+/g,"")) || 0;
        const msgs = parseInt(row['Lượt bắt đầu cuộc trò chuyện qua tin nhắn'] || row['Tin nhắn'] || row['Quan hệ kết nối qua tin nhắn mới'] || '0') || 0;
        const leads = parseInt(row['Khách hàng tiềm năng'] || row['Lead'] || '0') || 0;

        if (!campaign && !adSet && !ad) return;

        let detectedBu = null;
        if (campaign.includes('BU1')) detectedBu = 'BU1';
        else if (campaign.includes('BU2')) detectedBu = 'BU2';
        else if (campaign.includes('BU4')) detectedBu = 'BU4';

        if (!detectedBu) {
          if (adSet.includes('BU1')) detectedBu = 'BU1';
          else if (adSet.includes('BU2')) detectedBu = 'BU2';
          else if (adSet.includes('BU4')) detectedBu = 'BU4';
        }

        if (!detectedBu) {
          const allText = `${campaign} ${adSet} ${ad}`;
          if (allText.includes('TRUNG QUỐC') || allText.includes('BẮC KINH') || allText.includes('THƯỢNG HẢI') || allText.includes('Á ĐINH') || allText.includes('GIANG NAM') || allText.includes('LỆ GIANG') || allText.includes('GIANG TÂY')) detectedBu = 'BU1';
          else if (allText.includes('ALASKA') || allText.includes('NAM MỸ') || allText.includes('CHÂU ÂU') || allText.includes('SILKROAD') || allText.includes('AI CẬP')) detectedBu = 'BU2';
          else if (allText.includes('BALI') || allText.includes('BHUTAN') || allText.includes('LADAKH') || allText.includes('BROMO')) detectedBu = 'BU4';
        }

        if (!detectedBu) detectedBu = 'UNKNOWN';
        if (detectedBu === 'UNKNOWN') return; // Skip unknown logic

        mappedData.push({
          bu_name: detectedBu,
          campaign_name: row['Tên chiến dịch'] || row['Chiến dịch'] || '',
          ad_set_name: row['Tên nhóm quảng cáo'] || row['Nhóm quảng cáo'] || '',
          ad_name: row['Tên quảng cáo'] || row['Quảng cáo'] || '',
          spend: spend,
          messages: msgs,
          cpl_msg: msgs > 0 ? spend / msgs : 0,
          leads: leads,
          cpl_lead: leads > 0 ? spend / leads : 0,
        });
      });
      
      setPreviewData(mappedData.filter(r => r.spend > 0 || r.campaign_name));
    };
    reader.readAsArrayBuffer(file);
  };

  const submitImport = async () => {
    if (previewData.length === 0) {
      addToast?.('Không có dữ liệu để import', 'error');
      return;
    }
    
    setImporting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Group by bu_name
      const groups = previewData.reduce((acc, row) => {
        if (!acc[row.bu_name]) acc[row.bu_name] = [];
        acc[row.bu_name].push(row);
        return acc;
      }, {});

      // Send requests for each BU sequentially
      for (const bu in groups) {
        await axios.post('/api/marketing-ads/import', {
          bu_name: bu,
          year: importParams.year,
          month: importParams.month,
          week_number: importParams.week_number,
          dataRows: groups[bu]
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      addToast?.(`Import file thành công cho ${Object.keys(groups).length} BU!`);
      setIsImportModalVisible(false);
      setPreviewData([]);
      fetchData();
    } catch (err) {
      console.error(err);
      addToast?.('Lỗi khi import file', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '0 24px 24px 24px' }}>
      <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem', gap: '2rem' }}>
        <button 
          onClick={() => setActiveSubTab('monthly')}
          style={{ background: 'none', border: 'none', borderBottom: activeSubTab === 'monthly' ? '3px solid #3b82f6' : '3px solid transparent', padding: '12px 0', fontSize: '15px', fontWeight: 600, color: activeSubTab === 'monthly' ? '#1e293b' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          TỔNG QUAN THÁNG (KPI)
        </button>
        <button 
          onClick={() => setActiveSubTab('progress')}
          style={{ background: 'none', border: 'none', borderBottom: activeSubTab === 'progress' ? '3px solid #3b82f6' : '3px solid transparent', padding: '12px 0', fontSize: '15px', fontWeight: 600, color: activeSubTab === 'progress' ? '#3b82f6' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          TỔNG QUAN TUẦN
        </button>
        <button 
          onClick={() => setActiveSubTab('weekly')}
          style={{ background: 'none', border: 'none', borderBottom: activeSubTab === 'weekly' ? '3px solid #3b82f6' : '3px solid transparent', padding: '12px 0', fontSize: '15px', fontWeight: 600, color: activeSubTab === 'weekly' ? '#3b82f6' : '#64748b', cursor: 'pointer', transition: 'all 0.2s' }}
        >
          CHI TIẾT CHIẾN DỊCH (DATA)
        </button>
      </div>

      {activeSubTab !== 'monthly' && (
        <>
          {/* Filter Row 1: Dropdowns + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {/* BU Pill Tabs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>Team / BU:</span>
              <button
                onClick={() => setFilters({...filters, bu_name: 'All'})}
                style={{
                  padding: '5px 14px',
                  borderRadius: '20px',
                  border: filters.bu_name === 'All' ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                  background: filters.bu_name === 'All' ? '#3b82f6' : 'transparent',
                  color: filters.bu_name === 'All' ? '#fff' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Tất cả
              </button>
              {bus?.map(b => {
                const isBU3 = b.id === 'BU3';
                return (
                  <button
                    key={b.id}
                    disabled={isBU3}
                    onClick={() => !isBU3 && setFilters({...filters, bu_name: b.id})}
                    style={{
                      padding: '5px 14px',
                      borderRadius: '20px',
                      border: isBU3 ? '1px solid #fca5a5' : (filters.bu_name === b.id ? '2px solid #3b82f6' : '1px solid #cbd5e1'),
                      background: isBU3 ? '#fef2f2' : (filters.bu_name === b.id ? '#3b82f6' : 'transparent'),
                      color: isBU3 ? '#ef4444' : (filters.bu_name === b.id ? '#fff' : '#475569'),
                      textDecoration: isBU3 ? 'line-through' : 'none',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: isBU3 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease',
                      opacity: isBU3 ? 0.8 : 1,
                    }}
                    title={isBU3 ? "BU3 (Tour Đoàn) chưa khởi chạy quảng cáo" : ""}
                  >
                    {b.label || b.id}
                  </button>
                );
              })}
            </div>

            <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 4px' }}></div>

            {/* Time Selectors */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <select className="filter-input" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} style={{ padding: '5px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                {NAM_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              <select className="filter-input" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} style={{ padding: '5px 8px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}>
                <option value="">Tháng: Tất cả</option>
                {THANG_OPTIONS.map(m => <option key={m} value={m}>Tháng {m}</option>)}
              </select>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '8px' }}>
                <Filter size={14} style={{ position: 'absolute', left: '8px', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="Tìm Tên, Nhóm QC..." 
                  className="filter-input"
                  style={{ padding: '5px 8px 5px 28px', fontSize: '0.85rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', width: '220px' }}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                   <X 
                     size={14} 
                     style={{ position: 'absolute', right: '8px', color: '#ef4444', cursor: 'pointer' }} 
                     onClick={() => setSearchTerm('')}
                   />
                )}
              </div>
            </div>

            {activeSubTab === 'weekly' && (
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
                <button 
                  className="btn-pro-save" 
                  onClick={() => {
                    setPreviewData([]);
                    setIsImportModalVisible(true);
                  }}
                  style={{ width: 'auto', padding: '6px 14px', background: '#3b82f6', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)', fontSize: '0.8rem' }}
                >
                  <CloudUpload size={15} strokeWidth={3} /> UPLOAD EXCEL
                </button>
                <a 
                  href="/manual_images/TEMPLATE_MARKETING_ADS_FIT_TOUR.xlsx" 
                  download="TEMPLATE_MARKETING_ADS_FIT_TOUR.xlsx" 
                  style={{ padding: '6px 14px', background: '#e2e8f0', color: '#1e293b', borderRadius: '6px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.8rem' }}
                >
                   📥 TEMPLATE
                </a>
                <button 
                  onClick={() => handleBulkLock(true)}
                  style={{ cursor: 'pointer', padding: '6px 14px', background: '#fef9c3', color: '#854d0e', border: '1px solid #fde047', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, borderRadius: '6px' }}
                  title="Khóa dữ liệu không cho phép xóa"
                >
                  <Lock size={15} /> KHÓA
                </button>
                <button 
                  onClick={() => handleBulkLock(false)}
                  style={{ cursor: 'pointer', padding: '6px 14px', background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, borderRadius: '6px' }}
                  title="Mở khóa lấy lại quyền xóa"
                >
                  <Unlock size={15} /> MỞ KHÓA
                </button>
                <button 
                  onClick={handleBulkDelete}
                  style={{ cursor: 'pointer', padding: '6px 14px', background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, borderRadius: '6px' }}
                  title="Xóa nhanh các dữ liệu đã chọn"
                >
                  <Trash2 size={15} /> XÓA
                </button>
              </div>
            )}
          </div>

          {/* Filter Row 2: Week Pill Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginRight: '4px' }}>Tuần:</span>
            {(() => {
              const currentRanges = getWeekRanges(filters.year, filters.month);
              return [
                { value: '', label: 'Tất cả' },
                ...TUAN_OPTIONS.filter(w => !currentRanges || currentRanges[w] !== '').map(w => ({ 
                  value: w, 
                  label: currentRanges && currentRanges[w] ? `T${w} (${currentRanges[w]})` : `T${w}` 
                }))
              ].map(tab => (
                <button
                  key={tab.value}
                  onClick={() => setFilters({...filters, week_number: tab.value})}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '20px',
                    border: String(filters.week_number) === String(tab.value) ? '2px solid #3b82f6' : '1px solid #cbd5e1',
                    background: String(filters.week_number) === String(tab.value) ? '#3b82f6' : 'transparent',
                    color: String(filters.week_number) === String(tab.value) ? '#fff' : '#475569',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              ));
            })()}
            {filters.month && (
              <span style={{ marginLeft: '12px', fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic' }}>
                📅 Tháng {filters.month}/{filters.year}
              </span>
            )}

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', background: '#e2e8f0', color: '#475569', borderRadius: '50%', fontWeight: 700, fontSize: '10px' }}>i</div>
              <span style={{ fontStyle: 'italic', maxWidth: '400px' }}>
                <b style={{ color: '#475569' }}>Lưu ý Thuật Toán Gộp Tuần:</b> Ngày lẻ mồ côi đầu/cuối tháng sẽ tự động gộp vào tuần liền kề. Đảm bảo mọi tháng chốt đúng 5 chu kỳ báo cáo chuẩn (không đẻ Tuần 6).
              </span>
            </div>
          </div>
        </>
      )}

      {activeSubTab === 'weekly' && (
      <>
      <div className="data-table-container shadow-sm" style={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
        <table className="data-table" style={{ fontSize: '0.85rem', tableLayout: 'fixed', width: '100%' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                  checked={filteredData.length > 0 && selectedIds.length === filteredData.length}
                  onChange={(e) => setSelectedIds(e.target.checked ? filteredData.map(d => d.id) : [])}
                />
              </th>
              <th style={{ padding: '1rem', width: '130px' }}>BU / KỲ BÁO CÁO</th>
              <th style={{ width: '40%' }}>CHIẾN DỊCH / NHÓM QC / TÊN QC</th>
              <th style={{ textAlign: 'right' }}>CHI TIÊU (đ)</th>
              <th style={{ textAlign: 'center' }}>TIN NHẮN / CPL</th>
              <th style={{ textAlign: 'center' }}>LEAD MKT / CPL</th>
              {/* <th style={{ textAlign: 'center', background: '#fef3c7' }}>LEAD CRM (Tay)</th> */}
              {/* <th style={{ textAlign: 'center', background: '#d1fae5' }}>CHỐT DEAL / CAC</th> */}
              <th style={{ textAlign: 'right', paddingRight: '1rem' }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Chưa có dữ liệu. Hãy Upload file hoặc đổi bộ lọc.</td></tr>
            ) : (
              <>
                <tr style={{ background: '#fffbeb', borderBottom: '2px solid #e2e8f0', fontWeight: 'bold' }}>
                  <td></td>
                  <td colSpan={2} style={{ textAlign: 'center', color: '#1e293b' }}>
                    TỔNG CỘNG ({filteredData.length} Quảng Cáo)
                  </td>
                  <td style={{ textAlign: 'right', color: '#ef4444' }}>
                    {filteredData.reduce((acc, r) => acc + parseFloat(r.spend || 0), 0).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {filteredData.reduce((acc, r) => acc + parseInt(r.messages || 0), 0)} Msg
                    <br/><span style={{fontSize: '0.75rem', color: '#64748b'}}>{
                      Math.round(filteredData.reduce((acc, r) => acc + parseFloat(r.spend||0), 0) / (filteredData.reduce((acc, r) => acc + parseInt(r.messages || 0), 0) || 1)).toLocaleString()
                    }/Msg</span>
                  </td>
                  <td style={{ textAlign: 'center', color: '#10b981' }}>
                    {filteredData.reduce((acc, r) => acc + parseInt(r.leads || 0), 0)} Lead
                    <br/><span style={{fontSize: '0.75rem', color: '#64748b'}}>{
                      Math.round(filteredData.reduce((acc, r) => acc + parseFloat(r.spend||0), 0) / (filteredData.reduce((acc, r) => acc + parseInt(r.leads || 0), 0) || 1)).toLocaleString()
                    }/Lead</span>
                  </td>
                  {/* <td style={{ textAlign: 'center', background: '#fffbeb', color: '#ca8a04' }}>
                    {filteredData.reduce((acc, r) => acc + parseInt(r.crm_leads_manual || 0), 0)} Lead
                  </td>
                  <td style={{ textAlign: 'center', background: '#d1fae5', color: '#059669' }}>
                    {filteredData.reduce((acc, r) => acc + parseInt(r.crm_won_manual || 0), 0)} Khách
                  </td> */}
                  <td></td>
                </tr>
                {filteredData.map(r => (
                <tr key={r.id}>
                  <td style={{ textAlign: 'center' }}>
                    <input 
                      type="checkbox" 
                      style={{ cursor: 'pointer', transform: 'scale(1.2)' }}
                      checked={selectedIds.includes(r.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedIds([...selectedIds, r.id]);
                        else setSelectedIds(selectedIds.filter(id => id !== r.id));
                      }}
                    />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 700, color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {r.is_locked ? (
                        <>
                          <span style={{ cursor: 'not-allowed' }}>{r.bu_name}</span>
                          <Lock size={14} color="#eab308" title="Dữ liệu đã khóa" />
                        </>
                      ) : (
                        <select 
                          value={r.bu_name} 
                          onChange={(e) => handleBlurManual(r.id, 'bu_name', e.target.value)}
                          style={{
                            background: 'transparent',
                            border: '1px dashed #cbd5e1',
                            borderRadius: '4px',
                            color: '#2563eb',
                            fontWeight: 700,
                            padding: '2px 4px',
                            cursor: 'pointer',
                            outline: 'none',
                            fontSize: '14px',
                            width: '65px'
                          }}
                        >
                          {bus?.map(b => <option key={b.id} value={b.id} style={{ color: '#1e293b' }}>{b.label || b.id}</option>)}
                          <option value="UNKNOWN" style={{ color: '#ef4444' }}>LỖI BU</option>
                        </select>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tuần {r.week_number} / {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(r.month) - 1]} {String(r.year).slice(-2)}</div>
                  </td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '1rem' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1e293b' }} title={r.campaign_name}>{r.campaign_name || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }} title={r.ad_set_name}>{r.ad_set_name || '-'}</div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.ad_name}>{r.ad_name || '-'}</div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>
                    {parseFloat(r.spend).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 600 }}>{r.messages} Msg</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.cpl_msg > 0 ? `${Math.round(r.cpl_msg).toLocaleString()}/Msg` : '-'}</div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>{r.leads} Lead</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.cpl_lead > 0 ? `${Math.round(r.cpl_lead).toLocaleString()}/Lead` : '-'}</div>
                  </td>
                  {/* <td style={{ textAlign: 'center', background: '#fffbeb' }}>
                    <input 
                      type="number" 
                      className="filter-input input-number-no-spin"
                      style={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }}
                      defaultValue={r.crm_leads_manual || ''}
                      onBlur={(e) => handleBlurManual(r.id, 'crm_leads_manual', e.target.value)}
                      placeholder="0"
                    />
                  </td>
                  <td style={{ textAlign: 'center', background: '#ecfdf5' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <input 
                        type="number" 
                        className="filter-input input-number-no-spin"
                        style={{ width: '70px', textAlign: 'center', fontWeight: 'bold', borderColor: '#10b981' }}
                        defaultValue={r.crm_won_manual || ''}
                        onBlur={(e) => handleBlurManual(r.id, 'crm_won_manual', e.target.value)}
                        placeholder="0"
                      />
                      <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                        {r.crm_won_manual > 0 ? `${Math.round(r.spend / r.crm_won_manual).toLocaleString()} / Khách` : '-'}
                      </div>
                    </div>
                  </td> */}
                  <td style={{ textAlign: 'right', paddingRight: '1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                      <button className="icon-btn-square" style={{ background: '#f8fafc', color: '#3b82f6', borderColor: '#bfdbfe' }} title="Sửa dữ liệu" onClick={() => setEditingRecord(r)}>
                        <Edit2 size={16} />
                      </button>
                      {!r.is_locked ? (
                        <button className="icon-btn-square danger" title="Xoá báo cáo này" onClick={() => handleDelete(r)}>
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button className="icon-btn-square" disabled style={{ background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0', cursor: 'not-allowed', opacity: 0.6 }} title="Dữ liệu đã khóa, thao tác bị vô hiệu hóa">
                          <Lock size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {isImportModalVisible && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => !importing && setIsImportModalVisible(false)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%', maxHeight: '90vh', overflowY: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CloudUpload size={28} color="#3b82f6" /> IMPORT DỮ LIỆU MARKETING
              </h2>
              <button className="icon-btn" style={{ margin: 0 }} onClick={() => !importing && setIsImportModalVisible(false)}><X size={24} /></button>
            </div>
            
            <div style={{ overflowY: 'auto', paddingRight: '8px', flex: 1 }}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Tuần (VD: 1)</label>
                  <select className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={importParams.week_number} onChange={e => setImportParams({...importParams, week_number: e.target.value})}>
                    {TUAN_OPTIONS.map(w => <option key={w} value={w}>Tuần {w}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Tháng</label>
                  <select className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={importParams.month} onChange={e => setImportParams({...importParams, month: e.target.value})}>
                    {THANG_OPTIONS.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Năm</label>
                  <select className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={importParams.year} onChange={e => setImportParams({...importParams, year: e.target.value})}>
                    {NAM_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Phân luồng BU</label>
                  <div style={{ padding: '6px 8px', fontSize: '0.85rem', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', borderRadius: '4px', fontWeight: 600 }}>Tự động nhận diện BU</div>
                </div>
              </div>

              {previewData.length === 0 ? (
                <div style={{ border: '2px dashed #cbd5e1', padding: '40px', borderRadius: '12px', textAlign: 'center', background: '#f8fafc' }}>
                  <Upload size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
                  <h3 style={{ margin: '0 0 16px 0' }}>Kéo thả hoặc Chọn file Excel</h3>
                  <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} style={{ width: '100%', maxWidth: '300px' }} />
                  <div style={{ marginTop: '16px', textAlign: 'left', display: 'inline-block' }}>
                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}>1. Export dữ liệu báo cáo quảng cáo gốc từ Meta Ads (.xlsx).</p>
                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}>2. Không cần sửa cột, không cần xóa hàng Tổng hoặc rác.</p>
                    <p style={{ margin: '4px 0', color: '#64748b', fontSize: '13px' }}>3. Tải file thẳng lên đây, Thuật toán Auto-Mapping sẽ tự bóc tách BU và tính CPL.</p>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#10b981' }}>Đã quét tự động {previewData.length} dòng hợp lệ.</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Hệ thống sẽ tự rẽ nhánh dữ liệu về đúng BU tương đương (Tháng {importParams.month} / Tuần {importParams.week_number})</p>
                    </div>
                    <button className="btn-secondary" onClick={() => setPreviewData([])} disabled={importing}>Hủy, Up lại</button>
                  </div>

                  <div className="data-table-container shadow-sm" style={{ border: '1px solid #f1f5f9', borderRadius: '8px', overflowX: 'auto', maxHeight: '400px', overflowY: 'auto', marginBottom: '24px' }}>
                    <table className="data-table" style={{ fontSize: '0.85rem', width: '100%', minWidth: '800px' }}>
                      <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                          <th>BU</th>
                          <th>CHIẾN DỊCH</th>
                          <th>NHÓM QUẢNG CÁO / TÊN QC</th>
                          <th style={{ textAlign: 'right' }}>CHI TIÊU (đ)</th>
                          <th style={{ textAlign: 'right' }}>TIN NHẮN</th>
                          <th style={{ textAlign: 'right' }}>LEAD</th>
                          <th style={{ textAlign: 'right' }}>CPL (Msg/Lead)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((r, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700, color: '#3b82f6' }}>{r.bu_name}</td>
                            <td title={r.campaign_name}>{r.campaign_name.substring(0, 30)}{r.campaign_name.length > 30 ? '...' : ''}</td>
                            <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              <div style={{ fontSize: '0.8rem', title: r.ad_set_name }}>{(r.ad_set_name || '-').substring(0, 30)}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }} title={r.ad_name}>{(r.ad_name || '-').substring(0, 30)}</div>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{parseFloat(r.spend).toLocaleString()}</td>
                            <td style={{ textAlign: 'right' }}>{r.messages}</td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#10b981' }}>{r.leads}</td>
                            <td style={{ textAlign: 'right', color: '#64748b' }}>
                              {r.cpl_msg > 0 ? `${Math.round(r.cpl_msg).toLocaleString()}` : '-'} / {r.cpl_lead > 0 ? `${Math.round(r.cpl_lead).toLocaleString()}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <button 
                    className="btn-pro-save" 
                    onClick={submitImport}
                    disabled={importing}
                    style={{ width: '100%', padding: '1rem', background: '#3b82f6', display: 'flex', justifyContent: 'center', gap: '8px' }}
                  >
                    <Save /> XÁC NHẬN NẠP DỮ LIỆU VÀO DB
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      </>
      )}

      {activeSubTab === 'monthly' && (
        <div className="monthly-dashboard animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <select className="filter-input" value={filters.year} onChange={e => setFilters({...filters, year: e.target.value})} style={{ minWidth: '100px' }}>
                {NAM_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select className="filter-input" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value})} style={{ minWidth: '150px' }}>
                <option value="">Xem Tổng Cả Năm (12 Tháng)</option>
                {THANG_OPTIONS.map(m => <option key={m} value={m}>Tháng {m} (Xem 5 Tuần)</option>)}
              </select>
              <div style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
                Xem tổng quan KPI và tiến độ báo cáo
              </div>
            </div>
            <div>
              <button 
                style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
                }}
                onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.5)'}
                onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(245, 158, 11, 0.3)'}
                onClick={() => {
                  const defaultBu = filters.bu_name === 'All' ? 'BU1' : filters.bu_name;
                  const targetMonth = filters.month ? parseInt(filters.month) : 0;
                  const match = kpiData.kpis.find(k => k.bu_name === defaultBu && k.month === targetMonth) || {};
                  setKpiModal({
                    bu_name: defaultBu,
                    year: filters.year,
                    month: targetMonth,
                    budget: match.budget || '',
                    target_routes: match.target_routes || '',
                    target_groups: match.target_groups || '',
                    target_customers: match.target_customers || '',
                    target_cpa: match.target_cpa || '',
                    target_leads: match.target_leads || '',
                    target_cpl: match.target_cpl || ''
                  });
                }}
              >
                <Edit2 size={16} /> Cập nhật Target {filters.month ? `Tháng ${filters.month}` : 'Năm'}
              </button>
            </div>
          </div>

          {(() => {
            const activeBUs = bus?.filter(b => b.id !== 'BU3') || [];
            const targetMonth = filters.month ? parseInt(filters.month) : 0;
            const isMonthlyZoom = !!filters.month;
            
            const buData = activeBUs.map(bu => {
              const kpi = kpiData.kpis.find(k => k.bu_name === bu.id && k.month === targetMonth) 
                        || {};
              const actualRecords = kpiData.aggregates
                .filter(a => a.bu_name === bu.id && (isMonthlyZoom ? parseInt(a.month) === targetMonth : true));
                
              const uniqueWeeks = new Set(actualRecords.map(a => `${a.year}-${a.month}-${a.week_number}`)).size;

              const actual = actualRecords
                .reduce((acc, curr) => ({
                  spend: acc.spend + parseFloat(curr.actual_spend || 0),
                  leads: acc.leads + parseInt(curr.actual_leads || 0),
                  messages: acc.messages + parseInt(curr.actual_messages || 0),
                  crm_won: acc.crm_won + parseInt(curr.actual_crm_won || 0)
                }), { spend: 0, leads: 0, messages: 0, crm_won: 0 });
                
              // Đánh giá Funnel trung bình theo tuần: Chia Target theo số ngày (chuẩn 1 tuần = 7 ngày)
              const totalTargetLeads = parseInt(kpi.target_leads || 0);
              const targetCPA = parseFloat(kpi.target_cpa || 0);
              
              const currentYear = parseInt(filters.year) || new Date().getFullYear();
              const daysInPeriod = isMonthlyZoom 
                ? new Date(currentYear, targetMonth, 0).getDate() // Số ngày của tháng được chọn
                : (new Date(currentYear, 1, 29).getMonth() === 1 ? 366 : 365); // Xem cả năm
                
              const targetLeadsPerDay = totalTargetLeads / daysInPeriod;
              const targetLeadsPerWeek = targetLeadsPerDay * 7;
              
              const actualLeadsPerWeek = uniqueWeeks > 0 ? actual.leads / uniqueWeeks : 0;
              
              const isThieuLead = actualLeadsPerWeek < targetLeadsPerWeek;
              
              const actualCPA = (actual.crm_won > 0) ? (actual.spend / actual.crm_won) : (actual.spend > 0 ? actual.spend : 0);
              const isCpaVuot = targetCPA > 0 && actualCPA > targetCPA;
              
              const shortfallLeads = Math.ceil(Math.max(0, targetLeadsPerWeek - actualLeadsPerWeek));
              const excessCpa = Math.ceil(Math.max(0, actualCPA - targetCPA));
              const formatK = (val) => `${(val / 1000).toLocaleString('vi-VN')}k`;
              
              let statusObj = { label: '🟢 Tốt', color: '#10b981', bgColor: '#ecfdf5', title: 'Đủ Lead & CPA trong ngưỡng', subtext: '' };
              if (isThieuLead && isCpaVuot) {
                statusObj = { label: '🔴 Gãy funnel', color: '#ef4444', bgColor: '#fef2f2', title: 'Thiếu Lead & CPA vượt ngưỡng', subtext: `Thiếu ${shortfallLeads} Lead, vượt ${formatK(excessCpa)}` };
              } else if (isThieuLead) {
                statusObj = { label: '🟡 Nguy cơ', color: '#f59e0b', bgColor: '#fffbeb', title: 'Thiếu Lead hàng tuần', subtext: `Thiếu ${shortfallLeads} Lead/tuần` };
              } else if (isCpaVuot) {
                statusObj = { label: '🟡 Nguy cơ', color: '#f59e0b', bgColor: '#fffbeb', title: 'CPA vượt ngưỡng', subtext: `CPA vượt ${formatK(excessCpa)}` };
              }
              
              if (totalTargetLeads === 0 && targetCPA === 0) {
                statusObj = { label: 'Chưa có Target', color: '#94a3b8', bgColor: '#f1f5f9', title: '', subtext: '' };
              }

              return { id: bu.id, kpi, actual, statusObj };
            });

            const total = buData.reduce((acc, curr) => ({
              kpi: {
                budget: acc.kpi.budget + parseFloat(curr.kpi.budget || 0),
                routes: acc.kpi.routes + parseInt(curr.kpi.target_routes || 0),
                groups: acc.kpi.groups + parseInt(curr.kpi.target_groups || 0),
                customers: acc.kpi.customers + parseInt(curr.kpi.target_customers || 0),
                leads: acc.kpi.leads + parseInt(curr.kpi.target_leads || 0)
              },
              actual: {
                spend: acc.actual.spend + curr.actual.spend,
                leads: acc.actual.leads + curr.actual.leads,
                messages: acc.actual.messages + curr.actual.messages,
                crm_won: acc.actual.crm_won + curr.actual.crm_won
              }
            }), { kpi: { budget: 0, routes: 0, groups: 0, customers: 0, leads: 0 }, actual: { spend: 0, leads: 0, messages: 0, crm_won: 0 } });

            return (
              <div className="data-table-container shadow-sm animate-fade-in" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto' }}>
                <table className="data-table" style={{ fontSize: '0.85rem', width: '100%', minWidth: '1000px' }}>
                  <thead style={{ background: '#f8fafc' }}>
                    <tr>
                      <th style={{ width: '250px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2, borderRight: '2px solid #e2e8f0' }}>CHỈ SỐ KPI ({isMonthlyZoom ? `THÁNG ${filters.month}` : 'CẢ NĂM'})</th>
                      {activeBUs.map(bu => <th key={bu.id} style={{ textAlign: 'center', width: '180px' }}>{bu.id}</th>)}
                      <th style={{ textAlign: 'center', background: '#eff6ff', color: '#1d4ed8', width: '180px' }}>TỔNG CỘNG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Cảnh Báo Status Funnel */}
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 800, color: '#334155' }}>
                        Tình trạng Funnel (TB Tuần)
                      </td>
                      {buData.map(b => (
                        <td key={b.id} style={{ textAlign: 'center', padding: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                            <span 
                              title={b.statusObj.title}
                              style={{ 
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                padding: '6px 12px', borderRadius: '99px',
                                background: b.statusObj.bgColor, color: b.statusObj.color,
                                fontSize: '0.8rem', fontWeight: 700, cursor: 'help'
                              }}>
                              {b.statusObj.label}
                            </span>
                            {b.statusObj.subtext && (
                              <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic', fontWeight: 500 }}>
                                {b.statusObj.subtext}
                              </span>
                            )}
                          </div>
                        </td>
                      ))}
                      <td style={{ background: '#eff6ff', borderLeft: '2px solid #e2e8f0' }}></td>
                    </tr>
                    
                    {/* Spacer */}
                    <tr style={{ height: '8px', background: '#f8fafc' }}><td colSpan={activeBUs.length + 2}></td></tr>

                    {/* Ngân sách Kế hoạch */}
                    <tr style={{ background: '#f1f5f9' }}>
                      <td style={{ position: 'sticky', left: 0, background: '#f1f5f9', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Ngân sách kế hoạch (đ)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', fontWeight: 700, color: '#334155' }}>{parseFloat(b.kpi.budget || 0).toLocaleString()}</td>)}
                      <td style={{ textAlign: 'center', fontWeight: 700, background: '#e0e7ff', color: '#1e40af' }}>{total.kpi.budget.toLocaleString()}</td>
                    </tr>
                    
                    {/* Chi tiêu Thực tế */}
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600, color: '#f97316' }}>Chi tiêu tới hiện tại (đ)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', fontWeight: 700, color: '#f97316' }}>{b.actual.spend.toLocaleString()}</td>)}
                      <td style={{ textAlign: 'center', fontWeight: 700, background: '#fff7ed', color: '#c2410c' }}>{total.actual.spend.toLocaleString()}</td>
                    </tr>

                    {/* Tiến độ chi tiêu */}
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontStyle: 'italic', color: '#64748b' }}>% Tiến độ giải ngân</td>
                      {buData.map(b => {
                        const pct = b.kpi.budget ? Math.min((b.actual.spend / b.kpi.budget) * 100, 1000).toFixed(1) : 0;
                        return <td key={b.id} style={{ textAlign: 'center', color: pct > 100 ? '#ef4444' : '#10b981' }}>{pct}%</td>
                      })}
                      <td style={{ textAlign: 'center', background: '#eff6ff', fontStyle: 'italic' }}>
                        {total.kpi.budget ? Math.min((total.actual.spend / total.kpi.budget) * 100, 1000).toFixed(1) : 0}%
                      </td>
                    </tr>

                    <tr style={{ height: '8px', background: '#f8fafc' }}><td colSpan={5}></td></tr>

                    {/* Chỉ số Quảng Cáo (Facebook) */}
                    <tr style={{ background: '#eef2ff' }}>
                      <td style={{ position: 'sticky', left: 0, background: '#eef2ff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Lead Cần (Mục tiêu)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', fontWeight: 700 }}>{b.kpi.target_leads || '-'}</td>)}
                      <td style={{ textAlign: 'center', background: '#c7d2fe', fontWeight: 700, color: '#3730a3' }}>{total.kpi.leads || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600, color: '#2563eb' }}>» Lead (Thực tế)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', fontWeight: 700, color: '#2563eb' }}>{b.actual.leads}</td>)}
                      <td style={{ textAlign: 'center', background: '#eff6ff', fontWeight: 700, color: '#1d4ed8' }}>{total.actual.leads}</td>
                    </tr>
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontStyle: 'italic', color: '#64748b' }}>% Tiến độ gom Lead</td>
                      {buData.map(b => {
                        const pct = b.kpi.target_leads ? Math.min((b.actual.leads / b.kpi.target_leads) * 100, 1000).toFixed(1) : 0;
                        return <td key={b.id} style={{ textAlign: 'center', color: pct >= 100 ? '#10b981' : '#f59e0b' }}>{pct}%</td>
                      })}
                      <td style={{ textAlign: 'center', background: '#eff6ff', fontStyle: 'italic' }}>
                        {total.kpi.leads ? Math.min((total.actual.leads / total.kpi.leads) * 100, 1000).toFixed(1) : 0}%
                      </td>
                    </tr>
                    
                    {/* CPL */}
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 500 }}>CPL Mục tiêu (đ)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', color: '#64748b' }}>{parseFloat(b.kpi.target_cpl || 0).toLocaleString()}</td>)}
                      <td style={{ textAlign: 'center', background: '#eff6ff', color: '#64748b' }}>
                        {total.kpi.leads ? Math.round(total.kpi.budget / total.kpi.leads).toLocaleString() : '-'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600, color: '#d97706' }}>CPL Thực tế (đ)</td>
                      {buData.map(b => {
                        const cpl = b.actual.leads ? Math.round(b.actual.spend / b.actual.leads) : 0;
                        return <td key={b.id} style={{ textAlign: 'center', fontWeight: 'bold', color: cpl > (b.kpi.target_cpl || Infinity) ? '#ef4444' : '#10b981' }}>
                          {cpl.toLocaleString()}
                        </td>
                      })}
                      <td style={{ textAlign: 'center', background: '#fffbeb', fontWeight: 'bold', color: '#b45309' }}>
                        {total.actual.leads ? Math.round(total.actual.spend / total.actual.leads).toLocaleString() : '-'}
                      </td>
                    </tr>

                    <tr style={{ height: '8px', background: '#f8fafc' }}><td colSpan={5}></td></tr>
                    
                    {/* Tin nhắn */}
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600, color: '#8b5cf6' }}>» Tin nhắn (Thực tế)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', fontWeight: 700, color: '#8b5cf6' }}>{b.actual.messages}</td>)}
                      <td style={{ textAlign: 'center', background: '#f5f3ff', fontWeight: 700, color: '#7c3aed' }}>{total.actual.messages}</td>
                    </tr>
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600, color: '#c026d3' }}>CPL Tin nhắn Thực tế (đ)</td>
                      {buData.map(b => {
                        const cplMsg = b.actual.messages ? Math.round(b.actual.spend / b.actual.messages) : 0;
                        return <td key={b.id} style={{ textAlign: 'center', fontWeight: 'bold', color: '#c026d3' }}>
                          {cplMsg.toLocaleString()}
                        </td>
                      })}
                      <td style={{ textAlign: 'center', background: '#fdf4ff', fontWeight: 'bold', color: '#a21caf' }}>
                        {total.actual.messages ? Math.round(total.actual.spend / total.actual.messages).toLocaleString() : '-'}
                      </td>
                    </tr>

                    <tr style={{ height: '8px', background: '#f8fafc' }}><td colSpan={5}></td></tr>

                    {/* Chỉ số sản phẩm & Khách */}
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Số tuyến triển khai</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center' }}>{b.kpi.target_routes || '-'}</td>)}
                      <td style={{ textAlign: 'center', background: '#eff6ff', fontWeight: 700 }}>{total.kpi.routes || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Số đoàn mục tiêu</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center' }}>{b.kpi.target_groups || '-'}</td>)}
                      <td style={{ textAlign: 'center', background: '#eff6ff', fontWeight: 700 }}>{total.kpi.groups || '-'}</td>
                    </tr>
                    <tr style={{ background: '#f0fdfa' }}>
                      <td style={{ position: 'sticky', left: 0, background: '#f0fdfa', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Số lượng khách mục tiêu</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', fontWeight: 'bold' }}>{b.kpi.target_customers || '-'}</td>)}
                      <td style={{ textAlign: 'center', background: '#ccfbf1', fontWeight: 700, color: '#0f766e' }}>{total.kpi.customers || '-'}</td>
                    </tr>
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600, color: '#059669' }}>» Khách CRM Chốt (Thực tế)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', fontWeight: 'bold', color: '#059669' }}>{b.actual.crm_won}</td>)}
                      <td style={{ textAlign: 'center', background: '#eff6ff', fontWeight: 700, color: '#059669' }}>{total.actual.crm_won}</td>
                    </tr>
                    <tr>
                      <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 500 }}>CPA Dự kiến (Cho 1 đơn / đ)</td>
                      {buData.map(b => <td key={b.id} style={{ textAlign: 'center', color: '#64748b' }}>{parseFloat(b.kpi.target_cpa || 0).toLocaleString()}</td>)}
                      <td style={{ textAlign: 'center', background: '#eff6ff', color: '#64748b' }}>
                         {total.kpi.customers ? Math.round(total.kpi.budget / total.kpi.customers).toLocaleString() : '-'}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            );
          })()}
        </div>
      )}

      {activeSubTab === 'progress' && (() => {
            const isMonthlyZoom = !!filters.month;
            const matrixCols = isMonthlyZoom 
               ? (filters.week_number ? [parseInt(filters.week_number)] : [1, 2, 3, 4, 5]) 
               : THANG_OPTIONS;
            const targetMonth = isMonthlyZoom ? parseInt(filters.month) : 0;
            // Target month KPI overrides if implemented later, fallback to year target (month = 0)
            let currentKpi = {};
            if (filters.bu_name === 'All') {
              const kpiList = kpiData.kpis.filter(k => k.month === targetMonth).length > 0 
                              ? kpiData.kpis.filter(k => k.month === targetMonth) 
                              : kpiData.kpis.filter(k => k.month === 0);
              currentKpi = {
                budget: kpiList.reduce((sum, k) => sum + parseFloat(k.budget || 0), 0)
              };
            } else {
              currentKpi = kpiData.kpis.find(k => k.bu_name === filters.bu_name && k.month === targetMonth) 
                                 || kpiData.kpis.find(k => k.bu_name === filters.bu_name && k.month === 0) 
                                 || {};
            }

            const getAgg = (monthFilter, weekFilter) => {
              return kpiData.aggregates
                .filter(a => (filters.bu_name === 'All' ? true : a.bu_name === filters.bu_name) && 
                            (monthFilter ? parseInt(a.month) === parseInt(monthFilter) : true) && 
                            (weekFilter ? parseInt(a.week_number) === parseInt(weekFilter) : true))
                .reduce((acc, curr) => ({
                  actual_spend: acc.actual_spend + parseFloat(curr.actual_spend || 0),
                  actual_messages: acc.actual_messages + parseInt(curr.actual_messages || 0),
                  actual_leads: acc.actual_leads + parseInt(curr.actual_leads || 0),
                  actual_crm_leads: acc.actual_crm_leads + parseInt(curr.actual_crm_leads || 0),
                  actual_crm_won: acc.actual_crm_won + parseInt(curr.actual_crm_won || 0)
                }), { actual_spend: 0, actual_messages: 0, actual_leads: 0, actual_crm_leads: 0, actual_crm_won: 0 });
            };

            const grandTotal = getAgg(isMonthlyZoom ? filters.month : null, null);

            return (
            <div className="data-table-container shadow-sm" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.85rem', width: '100%', minWidth: '1200px' }}>
                <thead style={{ background: '#f8fafc' }}>
                  <tr>
                    <th style={{ width: '200px', position: 'sticky', left: 0, background: '#f8fafc', zIndex: 2, borderRight: '2px solid #e2e8f0' }}>TRƯỜNG DỮ LIỆU</th>
                    <th style={{ textAlign: 'center', background: '#ffedd5', width: '150px' }}>
                      {isMonthlyZoom ? `TỔNG THÁNG ${filters.month}` : `KPI TỔNG CẢ NĂM (${filters.year})`}
                    </th>
                    {matrixCols.map(c => (
                      <th key={c} style={{ textAlign: 'center', minWidth: '100px' }}>{isMonthlyZoom ? `TUẦN ${c}` : `THÁNG ${c}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Row: Ngân sách Mục Tiêu */}
                  <tr>
                    <td style={{ position: 'sticky', left: 0, background: '#f8fafc', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Ngân sách (Kế hoạch)</td>
                    <td style={{ textAlign: 'center', background: '#e2e8f0', fontWeight: 700, color: '#334155' }}>
                      {parseFloat(currentKpi.budget || 0).toLocaleString()}đ
                    </td>
                    {matrixCols.map(c => (
                      <td key={c} style={{ textAlign: 'center', background: '#f8fafc', color: '#94a3b8' }}>-</td>
                    ))}
                  </tr>

                  {/* Row: Chi tiêu (Actual) */}
                  <tr>
                    <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Chi tiêu (Thực tế)</td>
                    <td style={{ textAlign: 'center', background: '#fff7ed', fontWeight: 700, color: '#f97316' }}>
                      {grandTotal.actual_spend.toLocaleString()}đ
                    </td>
                    {matrixCols.map(c => {
                      const agg = isMonthlyZoom ? getAgg(filters.month, c) : getAgg(c, null);
                      return (
                        <td key={c} style={{ textAlign: 'center' }}>
                          {agg.actual_spend > 0 ? agg.actual_spend.toLocaleString() + 'đ' : '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Tin nhắn (Inbox) */}
                  <tr>
                    <td style={{ position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Tin nhắn (Inbox)</td>
                    <td style={{ textAlign: 'center', background: '#fff7ed', fontWeight: 700 }}>
                      <div style={{ color: '#1e293b' }}>{grandTotal.actual_messages.toLocaleString()} Msg</div>
                      {grandTotal.actual_messages > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>
                          {Math.round(grandTotal.actual_spend / grandTotal.actual_messages).toLocaleString()}đ/Msg
                        </div>
                      )}
                    </td>
                    {matrixCols.map(c => {
                      const agg = isMonthlyZoom ? getAgg(filters.month, c) : getAgg(c, null);
                      return (
                        <td key={c} style={{ textAlign: 'center' }}>
                          <div style={{ fontWeight: 600, color: '#1e293b' }}>{agg.actual_messages > 0 ? agg.actual_messages.toLocaleString() : '-'}</div>
                          {agg.actual_messages > 0 && agg.actual_spend > 0 && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              {Math.round(agg.actual_spend / agg.actual_messages).toLocaleString()}đ/Msg
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Lead (Fb MKT) */}
                  <tr>
                    <td style={{ position: 'sticky', left: 0, background: '#f0fdf4', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Lead (MKT Facebook)</td>
                    <td style={{ textAlign: 'center', background: '#dcfce7', fontWeight: 700, color: '#16a34a' }}>
                      <div>{grandTotal.actual_leads.toLocaleString()} Lead</div>
                      {grandTotal.actual_leads > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal', marginTop: '2px' }}>
                          {Math.round(grandTotal.actual_spend / grandTotal.actual_leads).toLocaleString()}đ/Lead
                        </div>
                      )}
                    </td>
                    {matrixCols.map(c => {
                      const agg = isMonthlyZoom ? getAgg(filters.month, c) : getAgg(c, null);
                      return (
                        <td key={c} style={{ textAlign: 'center', background: '#f0fdf4' }}>
                          <div style={{ fontWeight: 600, color: '#16a34a' }}>{agg.actual_leads > 0 ? agg.actual_leads.toLocaleString() : '-'}</div>
                          {agg.actual_leads > 0 && agg.actual_spend > 0 && (
                            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>
                              {Math.round(agg.actual_spend / agg.actual_leads).toLocaleString()}đ/Lead
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Lead (CRM Manual) */}
                  <tr>
                    <td style={{ position: 'sticky', left: 0, background: '#fefce8', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>Lead CRM (Nhập Tay)</td>
                    <td style={{ textAlign: 'center', background: '#fef9c3', fontWeight: 700, color: '#ca8a04' }}>
                      {grandTotal.actual_crm_leads.toLocaleString()} Lead
                    </td>
                    {matrixCols.map(c => {
                      const agg = isMonthlyZoom ? getAgg(filters.month, c) : getAgg(c, null);
                      return (
                        <td key={c} style={{ textAlign: 'center', background: '#fefce8' }}>
                          {agg.actual_crm_leads > 0 ? agg.actual_crm_leads.toLocaleString() : '-'}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Khách Chốt (Won) */}
                  <tr>
                    <td style={{ position: 'sticky', left: 0, background: '#ecfdf5', zIndex: 1, borderRight: '2px solid #e2e8f0', fontWeight: 600 }}>KHÁCH ĐÃ CHỐT DEAL</td>
                    <td style={{ textAlign: 'center', background: '#d1fae5', fontWeight: 700, color: '#059669' }}>
                      {grandTotal.actual_crm_won.toLocaleString()} Khách
                    </td>
                    {matrixCols.map(c => {
                      const agg = isMonthlyZoom ? getAgg(filters.month, c) : getAgg(c, null);
                      return (
                        <td key={c} style={{ textAlign: 'center', background: '#ecfdf5' }}>
                          {agg.actual_crm_won > 0 ? agg.actual_crm_won.toLocaleString() : '-'}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
            );
          })()}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="modal-overlay" style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="modal-content animate-zoom-in" style={{ background: '#fff', borderRadius: '16px', width: '90%', maxWidth: '550px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }}>
            <div className="modal-header" style={{ padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit2 size={20} color="#3b82f6" /> Sửa Báo Cáo Chiến Dịch
              </h3>
              <button 
                onClick={() => setEditingRecord(null)} 
                style={{ background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.background = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f1f5f9'}
              >
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ background: '#f8fafc', padding: '24px' }}>
              <form onSubmit={handleEditSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Chiến dịch</label>
                  <input 
                    className="filter-input" 
                    style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s' }} 
                    value={editingRecord.campaign_name || ''} 
                    onChange={e => setEditingRecord({...editingRecord, campaign_name: e.target.value})} 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Chi tiêu (đ)</label>
                  <input 
                    type="number" 
                    className="filter-input" 
                    style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s' }} 
                    value={editingRecord.spend || ''} 
                    onChange={e => setEditingRecord({...editingRecord, spend: e.target.value})} 
                  />
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Tin nhắn (Msg)</label>
                    <input 
                      type="number" 
                      className="filter-input" 
                      style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s' }} 
                      value={editingRecord.messages || ''} 
                      onChange={e => setEditingRecord({...editingRecord, messages: e.target.value})} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'block' }}>Lead</label>
                    <input 
                      type="number" 
                      className="filter-input" 
                      style={{ width: '100%', padding: '12px 16px', fontSize: '0.95rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', transition: 'border 0.2s' }} 
                      value={editingRecord.leads || ''} 
                      onChange={e => setEditingRecord({...editingRecord, leads: e.target.value})} 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    marginTop: '8px',
                    width: '100%', 
                    padding: '14px', 
                    background: loading ? '#93c5fd' : '#2563eb', 
                    color: '#fff', 
                    borderRadius: '8px', 
                    fontWeight: 600, 
                    fontSize: '0.95rem',
                    border: 'none', 
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px',
                    boxShadow: loading ? 'none' : '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => !loading && (e.currentTarget.style.background = '#1d4ed8')}
                  onMouseOut={(e) => !loading && (e.currentTarget.style.background = '#2563eb')}
                >
                  <Save size={18} /> {loading ? 'ĐANG LƯU DỮ LIỆU...' : 'LƯU THAY ĐỔI'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* KPI Update Modal - Cấu trúc y hệt Import Modal */}
      {kpiModal && typeof document !== 'undefined' && createPortal(
        <div className="modal-overlay" onClick={() => setKpiModal(null)} style={{ zIndex: 9999 }}>
          <div className="modal-content animate-slide-up" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Edit2 size={28} color="#f59e0b" /> CẬP NHẬT KPI MỤC TIÊU
              </h2>
              <button className="icon-btn" style={{ margin: 0 }} onClick={() => setKpiModal(null)}><X size={24} /></button>
            </div>

            <form onSubmit={handleKpiSave}>
              <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                {filters.bu_name === 'All' && (
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Phòng Ban (BU)</label>
                    <select className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }}
                      value={kpiModal.bu_name}
                      onChange={e => {
                        const newBu = e.target.value;
                        const match = kpiData.kpis.find(k => k.bu_name === newBu && k.month === kpiModal.month && k.year === kpiModal.year) || {};
                        setKpiModal({ ...kpiModal, bu_name: newBu, budget: match.budget || '', target_routes: match.target_routes || '', target_groups: match.target_groups || '', target_customers: match.target_customers || '', target_cpa: match.target_cpa || '', target_leads: match.target_leads || '', target_cpl: match.target_cpl || '' });
                      }}
                    >
                      {bus?.filter(b => b.id !== 'BU3').map(b => <option key={b.id} value={b.id}>{b.label || b.id}</option>)}
                    </select>
                  </div>
                )}
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Năm</label>
                  <select className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }}
                    value={kpiModal.year}
                    onChange={e => {
                      const y = parseInt(e.target.value);
                      const match = kpiData.kpis.find(k => k.bu_name === kpiModal.bu_name && k.month === kpiModal.month && k.year === y) || {};
                      setKpiModal({ ...kpiModal, year: y, budget: match.budget || '', target_routes: match.target_routes || '', target_groups: match.target_groups || '', target_customers: match.target_customers || '', target_cpa: match.target_cpa || '', target_leads: match.target_leads || '', target_cpl: match.target_cpl || '' });
                    }}
                  >
                    {NAM_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1, minWidth: '100px' }}>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Tháng</label>
                  <select className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }}
                    value={kpiModal.month}
                    onChange={e => {
                      const m = parseInt(e.target.value);
                      const match = kpiData.kpis.find(k => k.bu_name === kpiModal.bu_name && k.month === m && k.year === kpiModal.year) || {};
                      setKpiModal({ ...kpiModal, month: m, budget: match.budget || '', target_routes: match.target_routes || '', target_groups: match.target_groups || '', target_customers: match.target_customers || '', target_cpa: match.target_cpa || '', target_leads: match.target_leads || '', target_cpl: match.target_cpl || '' });
                    }}
                  >
                    <option value={0}>Cả Năm</option>
                    {THANG_OPTIONS.map(m => <option key={m} value={m}>Tháng {m}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Ngân sách (đ)</label>
                  <input type="text" className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={fmtNum(kpiModal.budget)} onChange={e => setKpiModal({...kpiModal, budget: parseNum(e.target.value)})} placeholder="Vd: 650.000.000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Lead Cần Đạt</label>
                  <input type="text" className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={fmtNum(kpiModal.target_leads)} onChange={e => setKpiModal({...kpiModal, target_leads: parseNum(e.target.value)})} placeholder="Vd: 1.500" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>CPL Mục Tiêu (đ)</label>
                  <input type="text" className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={fmtNum(kpiModal.target_cpl)} onChange={e => setKpiModal({...kpiModal, target_cpl: parseNum(e.target.value)})} placeholder="Vd: 60.000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Số lượng khách</label>
                  <input type="text" className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={fmtNum(kpiModal.target_customers)} onChange={e => setKpiModal({...kpiModal, target_customers: parseNum(e.target.value)})} placeholder="Vd: 500" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>CPA Dự Kiến (đ)</label>
                  <input type="text" className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={fmtNum(kpiModal.target_cpa)} onChange={e => setKpiModal({...kpiModal, target_cpa: parseNum(e.target.value)})} placeholder="Vd: 150.000" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Số tuyến triển khai</label>
                  <input type="text" className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={fmtNum(kpiModal.target_routes)} onChange={e => setKpiModal({...kpiModal, target_routes: parseNum(e.target.value)})} placeholder="Vd: 12" />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 700, color: '#64748b', marginBottom: '4px', display: 'block' }}>Số đoàn mục tiêu</label>
                  <input type="text" className="filter-input" style={{ width: '100%', padding: '6px 8px', fontSize: '0.85rem' }} value={fmtNum(kpiModal.target_groups)} onChange={e => setKpiModal({...kpiModal, target_groups: parseNum(e.target.value)})} placeholder="Vd: 45" />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-pro-save"
                disabled={loading}
                style={{ width: '100%', padding: '1rem', background: '#f59e0b', display: 'flex', justifyContent: 'center', gap: '8px' }}
              >
                <Save /> {loading ? 'ĐANG LƯU DỮ LIỆU...' : 'LƯU CHỈ TIÊU KPI'}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default MarketingAdsTab;
