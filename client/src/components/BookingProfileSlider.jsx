import React, { useState, useEffect } from 'react';
import { getLocalIsoString, getLocalDateTimeLocal, getLocalDateString } from '../utils/dateUtils';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, User, MapPin, Calendar, CreditCard, Users, FileText, CheckCircle, Tag, DollarSign, Plus, ArrowRight, MessageCircle, Send } from 'lucide-react';

const BookingProfileSlider = ({ bookingId, onClose }) => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Form states for transaction
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState('CASH');
  const [txDate, setTxDate] = useState(getLocalDateString());

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setBooking(res.data);
    } catch (err) {
      console.error(err);
      alert('Lỗi tải chi tiết booking');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
     if (!txAmount || Number(txAmount) <= 0) return alert('Vui lòng nhập số tiền hợp lệ lớn hơn 0');
     try {
       await axios.post(`/api/bookings/${bookingId}/transactions`, {
          amount: Number(txAmount),
          payment_method: txMethod,
          transaction_date: txDate,
          notes: ''
       }, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
       });
       setTxAmount('');
       fetchBooking(); // Refresh data
       alert('Thêm giao dịch thu tiền thành công!');
     } catch (err) {
       console.error(err);
       alert('Lỗi tạo giao dịch');
     }
  };

  const handleSendZaloPaymentReq = async () => {
    if (!window.confirm('Gửi tin nhắn Yêu cầu thanh toán qua Zalo ZNS cho khách hàng này?')) return;
    try {
      const res = await axios.post(`/api/bookings/${booking.id}/send-zalo-payment-request`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      alert(res.data.message || 'Đã gửi thành công!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Lỗi gửi Zalo');
    }
  };

  const handleSendZaloConfirm = async () => {
    if (!window.confirm('Gửi tin nhắn Xác nhận Booking qua Zalo ZNS cho khách hàng này?')) return;
    try {
      const res = await axios.post(`/api/bookings/${booking.id}/send-zalo-payment-confirm`, {}, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      alert(res.data.message || 'Đã gửi thành công!');
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Lỗi gửi Zalo');
    }
  };

  useEffect(() => {
    if (bookingId) fetchBooking();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId]);

  if (!booking && !loading) return null;

  const totalPaid = (booking?.transactions || []).reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const balance = Number(booking?.total_price || 0) - totalPaid;
  const progressPercent = typeof booking?.total_price === 'number' && booking.total_price > 0 ? Math.min(100, Math.round((totalPaid / booking.total_price) * 100)) : 0;

  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }
      .modal-content, .modal-content * {
        visibility: visible;
      }
      .modal-content {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        box-shadow: none !important;
        background: white !important;
      }
      .modal-overlay {
        position: static;
        background: white !important;
      }
      .icon-btn, .btn-secondary, button {
        display: none !important;
      }
    }
  `;

  // Add representative customer to passengers if not present
  const displayPassengers = [...(booking?.passengers || [])];
  if (displayPassengers.length === 0 && booking?.customer_name) {
     displayPassengers.push({
        id: 'rep-customer',
        full_name: booking.customer_name,
        display_name: booking.customer_name,
        pax_type: 'ADULT (Đại diện)',
        visa_status: 'NOT_APPLIED'
     });
  }

  // Render Component Content
  const modalContent = (
    <div 
      onClick={onClose} 
      style={{ 
        zIndex: 9999, 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(15, 23, 42, 0.6)', 
        backdropFilter: 'blur(4px)',
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{ 
          width: '920px', 
          maxWidth: '96vw',
          height: '100vh',
          backgroundColor: '#f8fafc',
          padding: 0,
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
          zIndex: 10000
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontWeight: 600 }}>Đang tải dữ liệu đơn hàng...</div>
        ) : (
          <>
            {/* Header Area */}
            <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0' }}>
              
              {/* Row 1: Code, Status & Actions */}
              <div style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 12px', borderRadius: '8px', fontWeight: 800, color: '#0f172a', fontSize: '1.15rem', fontFamily: 'monospace' }}>
                    {booking.booking_code}
                  </span>
                  <span style={{ 
                    padding: '5px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    backgroundColor: (booking.booking_status === 'Giữ chỗ' || booking.booking_status === 'HELD') ? '#e0f2fe' : booking.booking_status === 'Hoàn thành' ? '#dcfce7' : booking.booking_status === 'Huỷ' ? '#fee2e2' : booking.booking_status === 'Đã thanh toán' ? '#d1fae5' : booking.booking_status === 'Đã đặt cọc' ? '#fef3c7' : '#f1f5f9',
                    color: (booking.booking_status === 'Giữ chỗ' || booking.booking_status === 'HELD') ? '#0369a1' : booking.booking_status === 'Hoàn thành' ? '#15803d' : booking.booking_status === 'Huỷ' ? '#b91c1c' : booking.booking_status === 'Đã thanh toán' ? '#065f46' : booking.booking_status === 'Đã đặt cọc' ? '#b45309' : '#475569',
                  }}>
                    {booking.booking_status}
                  </span>
                  {booking.payment_status === 'paid' && (
                    <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} /> Đã thanh toán đủ
                    </span>
                  )}
                </div>

                {/* Top Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={handleSendZaloPaymentReq}
                    style={{ background: '#fdf4ff', border: '1px solid #f0abfc', color: '#a21caf', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#fae8ff'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#fdf4ff'; }}
                    title="Gửi Zalo ZNS Yêu cầu thanh toán"
                  >
                    <MessageCircle size={14} /> Yêu cầu CK (Zalo)
                  </button>
                  <button 
                    onClick={handleSendZaloConfirm}
                    style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#dcfce7'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#f0fdf4'; }}
                    title="Gửi Zalo ZNS Xác nhận Booking"
                  >
                    <MessageCircle size={14} /> Xác nhận (Zalo)
                  </button>
                  <a 
                    href={`/receipt/${booking.public_token}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: '#f0f9ff', border: '1px solid #bae6fd', color: '#0369a1', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#e0f2fe'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#f0f9ff'; }}
                    title="Mở giao diện Hóa Đơn Công Khai"
                  >
                    <FileText size={14} /> Hóa Đơn
                  </a>
                  <button 
                    onClick={() => window.print()} 
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; }}
                    title="In nội bộ"
                  >
                    <FileText size={14} /> In
                  </button>
                  <button 
                    onClick={onClose} 
                    style={{ background: '#fee2e2', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', transition: 'all 0.2s', marginLeft: '4px' }}
                    onMouseOver={e => { e.currentTarget.style.background = '#fca5a5'; e.currentTarget.style.color = '#7f1d1d'; }}
                    onMouseOut={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                    title="Đóng"
                  >
                    <X size={18} strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* Row 2: Customer & Tour Context Bar */}
              <div style={{ padding: '0.75rem 1.5rem', background: '#fafafa', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', fontSize: '0.825rem' }}>
                <button 
                  onClick={() => { onClose(); navigate('/customers'); }}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; }}
                  title="Xem hồ sơ khách hàng"
                >
                  <User size={13} color="#2563eb" /> {booking.customer_name} <ArrowRight size={11} />
                </button>
                
                <button 
                  onClick={() => { 
                    if (booking.tour_departure_id) {
                      onClose(); navigate(`/departures/view/${booking.tour_departure_id}`);
                    }
                  }}
                  style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#1e293b', cursor: booking.tour_departure_id ? 'pointer' : 'default', fontWeight: 600, transition: 'all 0.2s', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  onMouseOver={e => { if(booking.tour_departure_id) { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; } }}
                  onMouseOut={e => { if(booking.tour_departure_id) { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#1e293b'; } }}
                  title={booking.tour_name}
                >
                  <MapPin size={13} color="#ea580c" /> {booking.tour_name || 'Booking vé lẻ'} {booking.tour_departure_id && <ArrowRight size={11} />}
                </button>

                <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontWeight: 500 }}>
                  <Calendar size={13} /> Đi: {booking.start_date ? new Date(booking.start_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : '--'}
                </div>
              </div>

            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#fff', padding: '0 1.5rem' }}>
              {[
                { id: 'overview', icon: <FileText size={16} />, label: 'Tổng Quan' },
                { id: 'passengers', icon: <Users size={16} />, label: `Khách đi (${displayPassengers.length})` },
                { id: 'transactions', icon: <CreditCard size={16} />, label: 'Thanh Toán' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '1rem 1rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                    color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
              
              {/* TAB OVEWVIEW */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#64748b' }}></div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800 }}>TỔNG GIÁ TRỊ</h3>
                        {booking.discount > 0 && <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: '800', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '999px', border: '1px solid #fca5a5' }}>- {Number(booking.discount).toLocaleString('vi-VN')}₫</span>}
                      </div>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>{Number(booking.total_price || 0).toLocaleString('vi-VN')}<span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600, marginLeft: '4px' }}>₫</span></div>
                    </div>
                    
                    <div style={{ backgroundColor: '#f0fdf4', padding: '1.5rem', borderRadius: '16px', border: '1px solid #bbf7d0', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: '#22c55e' }}></div>
                      <h3 style={{ fontSize: '0.85rem', color: '#166534', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800 }}>ĐÃ THU</h3>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d', letterSpacing: '-0.5px' }}>{totalPaid.toLocaleString('vi-VN')}<span style={{ fontSize: '1rem', color: '#86efac', fontWeight: 600, marginLeft: '4px' }}>₫</span></div>
                    </div>

                    <div style={{ backgroundColor: balance > 0 ? '#fef2f2' : '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: balance > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: balance > 0 ? '#ef4444' : '#94a3b8' }}></div>
                      <h3 style={{ fontSize: '0.85rem', color: balance > 0 ? '#991b1b' : '#64748b', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 800 }}>CÒN NỢ LẠI</h3>
                      <div style={{ fontSize: '1.75rem', fontWeight: 900, color: balance > 0 ? '#b91c1c' : '#0f172a', letterSpacing: '-0.5px' }}>{balance.toLocaleString('vi-VN')}<span style={{ fontSize: '1rem', color: balance > 0 ? '#fca5a5' : '#94a3b8', fontWeight: 600, marginLeft: '4px' }}>₫</span></div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'flex-end' }}>
                      <div>
                         <h3 style={{ fontSize: '1rem', color: '#0f172a', margin: '0 0 4px 0', fontWeight: 800 }}>Tiến độ thu tiền</h3>
                         <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Trạng thái thanh toán: {progressPercent === 100 ? 'Hoàn tất' : 'Đang xử lý'}</span>
                      </div>
                      <span style={{ fontSize: '1.25rem', color: progressPercent === 100 ? '#16a34a' : '#2563eb', fontWeight: 900 }}>{progressPercent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: progressPercent === 100 ? '#22c55e' : '#3b82f6', transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                     <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: '0 0 1rem 0', fontWeight: 800 }}>Thông tin Người Đặt (Đại Diện)</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                           <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Họ và tên</div>
                           <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{booking.customer_name}</div>
                        </div>
                        <div>
                           <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Số điện thoại</div>
                           <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{booking.customer_phone || 'N/A'}</div>
                        </div>
                        <div>
                           <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Email liên hệ</div>
                           <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{booking.customer_email || 'N/A'}</div>
                        </div>
                        <div>
                           <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Số lượng Hành Khách (Pax)</div>
                           <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '1rem' }}>{booking.pax_count} pax</div>
                        </div>
                     </div>
                  </div>

                  {/* CHITIET BAOGIA (PRICING BREAKDOWN) FOR PDF */}
                  {booking.raw_details && booking.raw_details.pricingRows && booking.raw_details.pricingRows.some(r => Number(r.qty) > 0) && (
                    <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
                       <h3 style={{ fontSize: '1.1rem', color: '#1e293b', margin: '0 0 1rem 0', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Tag size={18} color="#3b82f6" /> Chi tiết Báo Giá
                       </h3>
                       <div style={{ overflowX: 'auto' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                             <thead>
                                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                   <th style={{ padding: '10px', textAlign: 'left', color: '#475569', fontWeight: 700 }}>Loại khách</th>
                                   <th style={{ padding: '10px', textAlign: 'center', color: '#475569', fontWeight: 700 }}>SL</th>
                                   <th style={{ padding: '10px', textAlign: 'right', color: '#475569', fontWeight: 700 }}>Đơn giá</th>
                                   <th style={{ padding: '10px', textAlign: 'right', color: '#475569', fontWeight: 700 }}>Phụ thu</th>
                                   <th style={{ padding: '10px', textAlign: 'right', color: '#475569', fontWeight: 700 }}>Giảm giá</th>
                                   <th style={{ padding: '10px', textAlign: 'right', color: '#475569', fontWeight: 700 }}>Tổng con</th>
                                </tr>
                             </thead>
                             <tbody>
                                {booking.raw_details.pricingRows.filter(r => Number(r.qty) > 0).map((row, idx) => (
                                   <React.Fragment key={idx}>
                                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                                         <td style={{ padding: '10px', fontWeight: 600, color: '#1e293b' }}>{row.ageType}</td>
                                         <td style={{ padding: '10px', textAlign: 'center' }}>{row.qty}</td>
                                         <td style={{ padding: '10px', textAlign: 'right' }}>{Number(row.price).toLocaleString('vi-VN')}₫</td>
                                         <td style={{ padding: '10px', textAlign: 'right', color: row.surcharge > 0 ? '#ea580c' : 'inherit' }}>{row.surcharge > 0 ? `+${Number(row.surcharge).toLocaleString('vi-VN')}₫` : '-'}</td>
                                         <td style={{ padding: '10px', textAlign: 'right', color: row.discount > 0 ? '#16a34a' : 'inherit' }}>{row.discount > 0 ? `-${Number(row.discount).toLocaleString('vi-VN')}₫` : '-'}</td>
                                         <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>{Number(row.total || 0).toLocaleString('vi-VN')}₫</td>
                                      </tr>
                                      {/* Extra Services for this row */}
                                      {row.extraServices && row.extraServices.length > 0 && row.extraServices.map((svc, sIdx) => (
                                         <tr key={`svc-${idx}-${sIdx}`} style={{ borderBottom: '1px dashed #e2e8f0', backgroundColor: '#fcfcfc' }}>
                                            <td colSpan="2" style={{ padding: '6px 10px 6px 30px', color: '#64748b', fontSize: '0.85rem' }}>
                                               ↳ <span style={{ fontWeight: 600 }}>Dịch vụ kèm theo:</span> {svc.name}
                                            </td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>{Number(svc.price).toLocaleString('vi-VN')}₫</td>
                                            <td colSpan="2" style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>SL: {svc.qty}</td>
                                            <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>+{Number(svc.total).toLocaleString('vi-VN')}₫</td>
                                         </tr>
                                      ))}
                                      {/* Customer Notes for this row */}
                                      {row.customerNote && row.customerNote.trim() !== '' && (
                                         <tr style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fcfcfc' }}>
                                            <td colSpan="6" style={{ padding: '8px 10px', color: '#334155', fontSize: '0.85rem', fontStyle: 'italic' }}>
                                               <span style={{ fontWeight: 600, color: '#0f172a' }}>Ghi chú:</span> {row.customerNote}
                                            </td>
                                         </tr>
                                      )}
                                   </React.Fragment>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB PASSENGERS */}
              {activeTab === 'passengers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 800 }}>Danh sách Khách bay (Rooming/Visa)</h3>
                  </div>
                  
                  {displayPassengers.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {displayPassengers.map((pax, idx) => (
                        <div key={pax.id} style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', gap: '16px', flexDirection: 'column', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                 <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', backgroundColor: '#eff6ff', borderRadius: '50%', fontSize: '0.9rem', color: '#2563eb' }}>{idx + 1}</span>
                                 {pax.display_name} 
                                 <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', backgroundColor: '#f1f5f9', color: '#475569', textTransform: 'uppercase' }}>{pax.pax_type || 'ADULT'}</span>
                              </div>
                           </div>
                           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                              <div>
                                 <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>TÊN TRÊN PP / CMND</label>
                                 <input type="text" className="filter-input" style={{ width: '100%', backgroundColor: '#f8fafc' }} placeholder="Tên để mua vé máy bay..." defaultValue={pax.full_name} title="Dành cho cập nhật API sau" readOnly />
                              </div>
                              <div>
                                 <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, marginBottom: '6px', display: 'block', textTransform: 'uppercase' }}>CẬP NHẬT VISA</label>
                                 <select className="filter-input" style={{ width: '100%', backgroundColor: pax.visa_status === 'APPROVED' ? '#dcfce7' : pax.visa_status === 'REJECTED' ? '#fee2e2' : '#f8fafc', color: pax.visa_status === 'APPROVED' ? '#166534' : pax.visa_status === 'REJECTED' ? '#991b1b' : '#334155', fontWeight: 600 }} defaultValue={pax.visa_status} disabled>
                                    <option value="NOT_APPLIED">Chưa xử lý Visa</option>
                                    <option value="PROCESSING">Đang xử lý / Nộp hồ sơ</option>
                                    <option value="APPROVED">Đỗ Visa ✅</option>
                                    <option value="REJECTED">Trượt Visa ❌</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center', color: '#94a3b8' }}>
                      Đơn hàng trống khách. Hãy liên hệ Sale mớm data.
                    </div>
                  )}
                </div>
              )}

              {/* TAB TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                     <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b', fontWeight: 700 }}>Ghi nhận Thanh Toán Mới</h3>
                     <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input type="number" placeholder="Số tiền (VNĐ)..." className="modal-input" style={{ flex: 1 }} value={txAmount} onChange={e => setTxAmount(e.target.value)} />
                        <select className="modal-input" style={{ flex: 1 }} value={txMethod} onChange={e => setTxMethod(e.target.value)}>
                           <option value="CASH">Tiền mặt</option>
                           <option value="BANK_TRANSFER">Chuyển khoản</option>
                           <option value="CARD">Quẹt thẻ</option>
                        </select>
                        <input type="date" className="modal-input" style={{ flex: 1 }} value={txDate} onChange={e => setTxDate(e.target.value)} />
                        <button className="btn-pro-save" onClick={handleAddTransaction}>Lưu Phiếu Thu</button>
                     </div>
                  </div>

                  <h3 style={{ margin: '1rem 0 0 0', fontSize: '1.1rem', color: '#1e293b', fontWeight: 800 }}>Lịch sử Thu/Chi ({booking.transactions?.length || 0})</h3>
                  
                  {booking.transactions && booking.transactions.length > 0 ? (
                    <div className="data-table-container">
                      <table className="data-table" style={{ margin: 0 }}>
                        <thead style={{ backgroundColor: '#f8fafc' }}>
                           <tr>
                              <th>Ngày nộp</th>
                              <th>Số tiền</th>
                              <th>Phương thức</th>
                              <th>Kế toán thu</th>
                           </tr>
                        </thead>
                        <tbody>
                           {booking.transactions.map(tx => (
                              <tr key={tx.id}>
                                 <td>{new Date(tx.transaction_date).toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', })}</td>
                                 <td style={{ fontWeight: 700, color: '#22c55e' }}>+{Number(tx.amount).toLocaleString('vi-VN')}đ</td>
                                 <td>{tx.payment_method}</td>
                                 <td>{tx.creator_name || 'System'}</td>
                              </tr>
                           ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center', color: '#94a3b8' }}>
                      Chưa có giao dịch thu tiền nào cho Đơn hàng này.
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}
      </div>
    </div>
  );

  return modalContent;
};

export default BookingProfileSlider;
