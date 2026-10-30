import { swalConfirm } from '../utils/swalHelpers';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Download, FileText, CheckCircle, RefreshCw, X, Calendar, DollarSign, Filter, Grid, ShieldAlert, ShieldCheck, Clock, User, Printer } from 'lucide-react';
import * as XLSX from 'xlsx-js-style';
import PrintDepositRetentionModal from '../components/modals/PrintDepositRetentionModal';

export default function PaymentVouchersTab() {
  const getInitialTab = () => {
    try {
      const p = new URLSearchParams(window.location.search).get('subtab');
      return p === 'retention' ? 'retention' : 'vouchers';
    } catch (e) {
      return 'vouchers';
    }
  };
  const [activeSubTab, setActiveSubTab] = useState(getInitialTab);

  // Tab 1: Phiếu Thu Tiền
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', minAmount: '', maxAmount: '' });

  // Tab 2: Sổ Quản Lý Bảo Lưu Tiền Cọc (ADR 0011)
  const [credits, setCredits] = useState([]);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [creditsSummary, setCreditsSummary] = useState(null);
  const [retentionStatus, setRetentionStatus] = useState('ALL');
  const [retentionSearch, setRetentionSearch] = useState('');
  const [selectedCreditToPrint, setSelectedCreditToPrint] = useState(null);

  useEffect(() => {
    fetchVouchers();
    fetchCredits();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/vouchers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCredits = async () => {
    setCreditsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (retentionStatus && retentionStatus !== 'ALL') params.append('status', retentionStatus);
      if (retentionSearch) params.append('search', retentionSearch);
      const res = await axios.get(`/api/customer-credits?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        setCredits(res.data.data || []);
        setCreditsSummary(res.data.summary || null);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách bảo lưu:', err);
    } finally {
      setCreditsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'retention') {
      fetchCredits();
    }
  }, [activeSubTab, retentionStatus]);

  const handleCancelVoucher = async (id, code, amount) => {
    if (!await swalConfirm(`XÁC NHẬN HỦY PHIẾU THU: ${code}?\n\nSố tiền ${Number(amount).toLocaleString('vi-VN')} vnđ sẽ MẤT khỏi mục "Đã thanh toán" của Booking hiện tại.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/vouchers/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchVouchers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy phiếu thu');
    }
  };

  const removeAccents = (str) => {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/\s+/g, ' ').trim();
  };

  const filteredVouchers = vouchers.filter(v => {
    let match = true;
    if (filters.search) {
      const q = removeAccents(filters.search.trim().toLowerCase());
      const matchSearch = removeAccents((v.voucher_code || '').toLowerCase()).includes(q) ||
             removeAccents((v.title || '').toLowerCase()).includes(q) ||
             removeAccents((v.payer_name || '').toLowerCase()).includes(q) ||
             removeAccents((v.tour_code || '').toLowerCase()).includes(q);
      if (!matchSearch) match = false;
    }
    if (filters.status && filters.status !== '-- Chọn trạng thái --') {
      if (v.status !== filters.status) match = false;
    }
    if (filters.minAmount) {
       if (Number(v.amount) < Number(filters.minAmount)) match = false;
    }
    if (filters.maxAmount) {
       if (Number(v.amount) > Number(filters.maxAmount)) match = false;
    }
    return match;
  });

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredVouchers.map((v, i) => ({
      'STT': i + 1,
      'Số chứng từ': v.voucher_code,
      'Ngày chứng từ': new Date(v.created_at).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', }),
      'Thuộc Tour': v.tour_code,
      'Tên phiếu thu': v.title,
      'Số tiền thu': Number(v.amount),
      'Người đóng': v.payer_name,
      'SĐT': v.payer_phone,
      'HT Thanh toán': v.payment_method,
      'Trạng thái': v.status,
      'Người tạo': v.creator_full_name || v.creator_username || v.created_by_name || 'Hệ thống'
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Phiếu Thu");
    XLSX.writeFile(wb, "DanhSachPhieuThu.xlsx");
  };

  const totalAmount = filteredVouchers.filter(v => v.status !== 'Đã hủy').reduce((sum, v) => sum + Number(v.amount || 0), 0);

  // Stats for Voucher Tab
  const box1 = filteredVouchers.length;
  const box2 = totalAmount;
  const box3 = filteredVouchers.filter(v => new Date(v.created_at).getMonth() === new Date().getMonth()).length;
  const box4 = filteredVouchers.filter(v => v.booking_status !== 'Hoàn thành' && v.booking_status !== 'Đã thanh toán').length;
  const box5 = filteredVouchers.filter(v => ['Hoàn thành', 'Đã thanh toán', 'Kết thúc'].includes(v.booking_status)).length;

  const getCreditStatusBadge = (status, expiryDate) => {
    const isExpired = expiryDate && new Date(expiryDate) < new Date();
    if (status === 'EXPIRED' || (isExpired && status !== 'FULLY_USED')) {
      return <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>HẾT HẠN</span>;
    }
    if (status === 'FULLY_USED') {
      return <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>ĐÃ CẤN TRỪ HẾT</span>;
    }
    if (status === 'PARTIALLY_USED') {
      return <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>ĐÃ DÙNG 1 PHẦN</span>;
    }
    return <span style={{ background: '#dcfce7', color: '#166534', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>CÒN HIỆU LỰC</span>;
  };

  return (
    <div style={{ padding: '20px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Page Title & Main Navigation Switcher */}
      <div style={{ marginBottom: '24px', background: '#ffffff', borderRadius: '12px', padding: '18px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
              Nghiệp Vụ Kế Toán & Dòng Tiền
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {activeSubTab === 'vouchers' ? 'Phiếu Thu Tiền (PT-...)' : 'Sổ Quản Lý Bảo Lưu Tiền Cọc (BL-...)'}
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {activeSubTab === 'vouchers' 
                ? 'Quản lý toàn bộ chứng từ thanh toán tiền mặt & chuyển khoản theo từng booking/tour' 
                : 'Theo dõi các khoản tiền cọc bảo lưu (tối đa 12 tháng), tra cứu số dư và cấn trừ cho tour mới'}
            </p>
          </div>

          {/* Sub-Tab Navigation Bar */}
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '6px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => {
                setActiveSubTab('vouchers');
                try { window.history.replaceState(null, '', '/vouchers?subtab=vouchers'); } catch (e) {}
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === 'vouchers' ? '#2563eb' : 'transparent',
                color: activeSubTab === 'vouchers' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeSubTab === 'vouchers' ? '0 2px 6px rgba(37, 99, 235, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <FileText size={18} color={activeSubTab === 'vouchers' ? '#ffffff' : '#64748b'} />
              Phiếu Thu (PT-...)
            </button>

            <button
              onClick={() => {
                setActiveSubTab('retention');
                try { window.history.replaceState(null, '', '/vouchers?subtab=retention'); } catch (e) {}
                fetchCredits();
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                border: 'none',
                background: activeSubTab === 'retention' ? '#ea580c' : 'transparent',
                color: activeSubTab === 'retention' ? '#ffffff' : '#475569',
                fontWeight: 800,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: activeSubTab === 'retention' ? '0 2px 6px rgba(234, 88, 12, 0.3)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <ShieldAlert size={18} color={activeSubTab === 'retention' ? '#ffffff' : '#ea580c'} />
              Sổ Bảo Lưu Tiền Cọc (BL-...)
              {creditsSummary?.active_count > 0 && (
                <span style={{
                  background: activeSubTab === 'retention' ? '#ffffff' : '#ea580c',
                  color: activeSubTab === 'retention' ? '#ea580c' : '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 800
                }}>
                  {creditsSummary.active_count}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: PHIẾU THU TIỀN */}
      {activeSubTab === 'vouchers' && (
        <>
          {/* Basic Filters row */}
          <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div className="mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                   <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Tìm kiếm chung:</label>
                   <input 
                     type="text" 
                     placeholder="Tên, SĐT, Email, Số chứng từ, Mã tour" 
                     value={filters.search}
                     onChange={e => setFilters({...filters, search: e.target.value})}
                     style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }}
                   />
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Ngày chứng từ:</label>
                   <input type="text" placeholder="Chọn thời gian chứng từ" style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Trạng thái:</label>
                   <select 
                      value={filters.status}
                      onChange={e => setFilters({...filters, status: e.target.value})}
                      style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none', background: '#fff' }}
                   >
                      <option>-- Chọn trạng thái --</option>
                      <option value="Đã duyệt">Đã duyệt</option>
                      <option value="Chưa duyệt">Chưa duyệt</option>
                      <option value="Không duyệt">Không duyệt</option>
                      <option value="Đã hủy">Đã hủy</option>
                   </select>
                </div>
                <div>
                   <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Loại phiếu thu:</label>
                   <select style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none', background: '#fff' }}>
                      <option>-- Chọn --</option>
                   </select>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#64748b', fontWeight: 'bold', marginBottom: '6px' }}>Tìm kiếm theo số tiền:</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="number" placeholder="Từ" value={filters.minAmount} onChange={e => setFilters({...filters, minAmount: e.target.value})} style={{ width: '100px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }} />
                  <input type="number" placeholder="Đến" value={filters.maxAmount} onChange={e => setFilters({...filters, maxAmount: e.target.value})} style={{ width: '100px', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mobile-stats-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px', marginBottom: '20px' }}>
             <div style={{ background: '#fff', borderLeft: '4px solid #3b82f6', padding: '15px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                 <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TỔNG SỐ PHIẾU</div>
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{box1}</div>
             </div>
             <div style={{ background: '#fff', borderLeft: '4px solid #10b981', padding: '15px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                 <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TỔNG THỰC THU</div>
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', marginTop: '5px' }}>{box2.toLocaleString('vi-VN')}</div>
             </div>
             <div style={{ background: '#fff', borderLeft: '4px solid #f59e0b', padding: '15px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                 <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>PHIẾU THU THÁNG NÀY</div>
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{box3}</div>
             </div>
             <div style={{ background: '#fff', borderLeft: '4px solid #ef4444', padding: '15px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                 <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>ĐANG ĐẶT CỌC</div>
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{box4}</div>
             </div>
             <div style={{ background: '#fff', borderLeft: '4px solid #8b5cf6', padding: '15px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                 <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>ĐÃ HOÀN THÀNH</div>
                 <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', marginTop: '5px' }}>{box5}</div>
             </div>
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={exportExcel} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                <Download size={14} /> Xuất Excel
              </button>
              <button onClick={fetchVouchers} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 14px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                <RefreshCw size={14} /> Tải lại
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div style={{ background: '#fff', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px', width: '40px' }}><input type="checkbox" /></th>
                  <th style={{ padding: '12px' }}>STT</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Số chứng từ</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tour</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tên phiếu thu</th>
                  <th style={{ padding: '12px' }}>Giờ/Phút</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Ngày</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Số tiền (vnđ)</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Người đóng</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Số điện thoại</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Người tạo</th>
                  <th style={{ padding: '12px' }}>HT Thanh toán</th>
                  <th style={{ padding: '12px' }}>Trạng thái</th>
                  <th style={{ padding: '12px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="14" style={{ padding: '30px' }}>Đang tải dữ liệu...</td></tr>
                ) : filteredVouchers.length === 0 ? (
                  <tr><td colSpan="14" style={{ padding: '30px', color: '#64748b' }}>Không tìm thấy phiếu thu nào</td></tr>
                ) : (
                  filteredVouchers.map((v, index) => {
                    const d = new Date(v.created_at);
                    const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
                    const dateStr = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

                    return (
                    <tr key={v.id || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                      <td style={{ padding: '15px 12px' }}><input type="checkbox" /></td>
                      <td style={{ padding: '15px 12px', color: '#64748b' }}>{index + 1}</td>
                      <td style={{ padding: '15px 12px', fontWeight: 'bold', color: '#2563eb', textAlign: 'left', whiteSpace: 'nowrap' }}>
                         {v.voucher_code}
                      </td>
                      <td style={{ padding: '15px 12px', textAlign: 'left', whiteSpace: 'nowrap', fontWeight: 'bold', color: '#475569' }}>
                         {v.tour_code || '---'}
                      </td>
                      <td style={{ padding: '15px 12px', textAlign: 'left', color: '#334155' }}>
                         {v.title || 'Thu tiền cọc'}
                      </td>
                      <td style={{ padding: '15px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                         <span style={{ fontSize: '11px' }}>{timeStr}</span>
                      </td>
                      <td style={{ padding: '15px 12px', whiteSpace: 'nowrap', textAlign: 'left' }}>
                         <div style={{ color: '#475569', fontSize: '12px' }}>CT: <span style={{fontWeight: 600}}>{dateStr}</span></div>
                         <div style={{ color: '#059669', fontSize: '12px', marginTop: '4px' }}>TT: <span style={{fontWeight: 600}}>{dateStr}</span></div>
                      </td>
                      <td style={{ padding: '15px 12px', color: '#16a34a', fontWeight: 'bold', fontSize: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                         {Number(v.amount).toLocaleString('vi-VN')}
                      </td>
                      <td style={{ padding: '15px 12px', color: '#334155', fontWeight: '500', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                         {v.payer_name || 'Khách lẻ'}
                      </td>
                      <td style={{ padding: '15px 12px', color: '#2563eb', whiteSpace: 'nowrap' }}>
                         {v.payer_phone || '---'}
                      </td>
                      <td style={{ padding: '15px 12px', color: '#334155', whiteSpace: 'nowrap' }}>
                         <div style={{ fontWeight: 600 }}>{v.creator_full_name || v.creator_username || v.created_by_name || 'Hệ thống'}</div>
                      </td>
                      <td style={{ padding: '15px 12px', color: '#334155', whiteSpace: 'nowrap' }}>
                         <div style={{ fontWeight: 500 }}>{v.payment_method}</div>
                      </td>
                      <td style={{ padding: '15px 12px', whiteSpace: 'nowrap' }}>
                         {v.booking_status === 'Hoàn thành' ? (
                           <span style={{ background: '#0ea5e9', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>HOÀN THÀNH</span>
                         ) : (
                           <span style={{ background: '#f59e0b', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>{v.booking_status || 'ĐẶT CỌC'}</span>
                         )}
                      </td>
                      <td style={{ padding: '15px 12px', whiteSpace: 'nowrap' }}>
                         <div style={{ fontSize: '12px', fontWeight: 'bold', color: v.status === 'Đã hủy' ? '#ef4444' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                             {v.status === 'Đã hủy' ? <><X size={14} color="#ef4444" /> ĐÃ HỦY</> : <>{v.creator_full_name || v.creator_username || v.created_by_name || 'Hệ thống'} - <CheckCircle size={14} color="#16a34a" /></>}
                         </div>
                         {v.status !== 'Đã hủy' && (
                           <button onClick={() => handleCancelVoucher(v.id, v.voucher_code, v.amount)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', border: '1px solid #f87171', background: '#fff', color: '#ef4444', fontWeight: 'bold', padding: '3px 8px', borderRadius: '15px', marginTop: '6px', fontSize: '11px', cursor: 'pointer', margin: '6px auto 0' }}>
                               <X size={11} /> Hủy Phiếu
                           </button>
                         )}
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            
            {/* Footer Sum */}
            {filteredVouchers.length > 0 && (
              <div style={{ padding: '15px', borderTop: '2px solid #e2e8f0', display: 'flex', background: '#f8fafc', fontWeight: 'bold', fontSize: '14px' }}>
                 <div style={{ marginLeft: '150px' }}>Tổng cộng(chỉ trang này)</div>
                 <div style={{ marginLeft: 'auto', marginRight: '400px' }}>Tổng thu : {totalAmount.toLocaleString('vi-VN')}</div>
              </div>
            )}
          </div>
        </>
      )}

      {/* VIEW 2: SỔ QUẢN LÝ BẢO LƯU TIỀN CỌC (ADR 0011) */}
      {activeSubTab === 'retention' && (
        <>
          {/* Stats Bar */}
          <div className="mobile-stats-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div style={{ background: '#fff', borderLeft: '4px solid #ea580c', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>TỔNG CỌC ĐANG BẢO LƯU</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ea580c', marginTop: '5px' }}>
                {Number(creditsSummary?.total_active_balance || 0).toLocaleString('vi-VN')} đ
              </div>
            </div>

            <div style={{ background: '#fff', borderLeft: '4px solid #16a34a', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>PHIẾU CÒN HIỆU LỰC</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#16a34a', marginTop: '5px' }}>
                {creditsSummary?.active_count || 0} phiếu
              </div>
            </div>

            <div style={{ background: '#fff', borderLeft: '4px solid #0284c7', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>ĐÃ CẤN TRỪ HẾT</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#0284c7', marginTop: '5px' }}>
                {creditsSummary?.fully_used_count || 0} phiếu
              </div>
            </div>

            <div style={{ background: '#fff', borderLeft: '4px solid #dc2626', padding: '16px', borderRadius: '6px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>ĐÃ HẾT HẠN (QUÁ 12 THÁNG)</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc2626', marginTop: '5px' }}>
                {creditsSummary?.expired_count || 0} phiếu
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div style={{ background: '#fff', padding: '15px 20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '260px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Tìm kiếm phiếu bảo lưu:</label>
              <input
                type="text"
                placeholder="Mã phiếu (BL-...), Tên khách, SĐT, Mã booking gốc..."
                value={retentionSearch}
                onChange={e => setRetentionSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchCredits()}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ width: '200px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#64748b', fontWeight: 'bold', marginBottom: '4px' }}>Lọc trạng thái:</label>
              <select
                value={retentionStatus}
                onChange={e => setRetentionStatus(e.target.value)}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none', background: '#fff' }}
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Còn hiệu lực (Chưa dùng)</option>
                <option value="PARTIALLY_USED">Đã dùng một phần</option>
                <option value="FULLY_USED">Đã cấn trừ hết</option>
                <option value="EXPIRED">Đã hết hạn</option>
              </select>
            </div>

            <div style={{ alignSelf: 'flex-end' }}>
              <button
                onClick={fetchCredits}
                style={{ background: '#ea580c', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Search size={14} /> Tìm kiếm
              </button>
            </div>
          </div>

          {/* Credits Table */}
          <div style={{ background: '#fff', borderRadius: '8px', overflowX: 'auto', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 'bold' }}>
                  <th style={{ padding: '12px', width: '50px' }}>STT</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Mã Phiếu Bảo Lưu</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Chủ sở hữu / Thụ hưởng</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Tour & Booking gốc</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Cọc gốc</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Phí phạt</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Số dư khả dụng</th>
                  <th style={{ padding: '12px' }}>Hạn hiệu lực (Max 12T)</th>
                  <th style={{ padding: '12px' }}>Trạng thái</th>
                  <th style={{ padding: '12px' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {creditsLoading ? (
                  <tr><td colSpan="10" style={{ padding: '30px' }}>Đang tải danh sách bảo lưu tiền cọc...</td></tr>
                ) : credits.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ padding: '40px', color: '#94a3b8' }}>
                      <ShieldAlert size={36} style={{ margin: '0 auto 8px auto', opacity: 0.3 }} />
                      <div>Chưa có phiếu bảo lưu tiền cọc nào phù hợp với bộ lọc.</div>
                    </td>
                  </tr>
                ) : (
                  credits.map((c, index) => {
                    const daysLeft = Math.ceil((new Date(c.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
                    const isExp = daysLeft <= 0;

                    return (
                      <tr key={c.id || index} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: index % 2 === 0 ? '#fff' : '#fcfcfc' }}>
                        <td style={{ padding: '14px 10px', color: '#64748b' }}>{index + 1}</td>
                        <td style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 'bold', color: '#ea580c', fontFamily: 'monospace', fontSize: '14px' }}>
                          {c.credit_code}
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'left' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.credited_to_name}</div>
                          <div style={{ fontSize: '11px', color: '#2563eb' }}>{c.credited_to_phone || '---'}</div>
                          {c.passenger_name && c.passenger_name !== c.credited_to_name && (
                            <div style={{ fontSize: '11px', color: '#64748b' }}>Khách hủy: {c.passenger_name}</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'left', maxWidth: '200px' }}>
                          <div style={{ fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.original_tour_name}>
                            {c.original_tour_name || 'Tour FIT TOUR'}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Đơn: {c.original_booking_code}</div>
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'right', color: '#64748b', fontWeight: 600 }}>
                          {Number(c.original_deposit || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'right', color: '#dc2626', fontWeight: 600 }}>
                          {Number(c.deduction_fee || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td style={{ padding: '14px 10px', textAlign: 'right', color: '#16a34a', fontWeight: 800, fontSize: '14px' }}>
                          {Number(c.remaining_balance || 0).toLocaleString('vi-VN')} đ
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <div style={{ fontWeight: 600, color: isExp ? '#dc2626' : '#0f172a' }}>
                            {new Date(c.expiry_date).toLocaleDateString('vi-VN')}
                          </div>
                          {c.status !== 'FULLY_USED' && (
                            <div style={{ fontSize: '11px', color: isExp ? '#dc2626' : '#64748b', marginTop: '2px' }}>
                              {isExp ? 'Hết hạn' : `Còn ${daysLeft} ngày`}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          {getCreditStatusBadge(c.status, c.expiry_date)}
                        </td>
                        <td style={{ padding: '14px 10px' }}>
                          <button
                            onClick={() => setSelectedCreditToPrint(c)}
                            style={{
                              background: '#fff7ed',
                              border: '1px solid #ea580c',
                              color: '#ea580c',
                              padding: '5px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                            title="In lại phiếu xác nhận bảo lưu tiền cọc"
                          >
                            <Printer size={13} /> In Phiếu
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal In Phiếu Bảo Lưu */}
      {selectedCreditToPrint && (
        <PrintDepositRetentionModal
          isOpen={!!selectedCreditToPrint}
          onClose={() => setSelectedCreditToPrint(null)}
          credit={selectedCreditToPrint}
        />
      )}

    </div>
  );
}
