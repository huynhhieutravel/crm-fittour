import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { X, User, MapPin, Calendar, CreditCard, Users, FileText, CheckCircle, Tag, DollarSign, Plus, ArrowRight } from 'lucide-react';

const BookingProfileSlider = ({ bookingId, onClose }) => {
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  // Form states for transaction
  const [txAmount, setTxAmount] = useState('');
  const [txMethod, setTxMethod] = useState('CASH');
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));

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
      className="modal-overlay" 
      onClick={onClose} 
      style={{ 
        zIndex: 1050, 
        position: 'fixed', 
        inset: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'stretch'
      }}
    >
      <div 
        className="modal-content animate-slide-up" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '800px', 
          width: '100%',
          backgroundColor: '#f8fafc',
          padding: 0,
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.1)',
          animation: 'slideInRight 0.3s ease-out'
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>Loading...</div>
        ) : (
          <>
            {/* Header Area */}
            <div style={{ padding: '1.5rem', backgroundColor: '#fff', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, color: '#0f172a', fontSize: '1.25rem', letterSpacing: '0.5px' }}>
                    {booking.booking_code}
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '999px', 
                    fontSize: '0.75rem', 
                    fontWeight: 800, 
                    backgroundColor: booking.booking_status === 'Giữ chỗ' ? '#e0f2fe' : booking.booking_status === 'Hoàn thành' ? '#dcfce7' : booking.booking_status === 'Huỷ' ? '#fee2e2' : booking.booking_status === 'Đã thanh toán' ? '#d1fae5' : booking.booking_status === 'Đã đặt cọc' ? '#fef3c7' : '#f1f5f9',
                    color: booking.booking_status === 'Giữ chỗ' ? '#0369a1' : booking.booking_status === 'Hoàn thành' ? '#15803d' : booking.booking_status === 'Huỷ' ? '#b91c1c' : booking.booking_status === 'Đã thanh toán' ? '#065f46' : booking.booking_status === 'Đã đặt cọc' ? '#b45309' : '#475569',
                  }}>
                    {booking.booking_status}
                  </span>
                  {booking.payment_status === 'paid' && (
                    <span style={{ padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800, backgroundColor: '#dcfce7', color: '#166534', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={12} /> Đã thanh toán đủ
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button 
                    onClick={() => { onClose(); navigate('/customers'); }}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; }}
                    title="Đến trang Quản lý Khách Hàng"
                  >
                    <User size={14} /> {booking.customer_name} <ArrowRight size={12} />
                  </button>
                  
                  <button 
                    onClick={() => { 
                      if (booking.tour_departure_id) {
                        onClose(); navigate(`/departures/view/${booking.tour_departure_id}`);
                      }
                    }}
                    style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#334155', cursor: booking.tour_departure_id ? 'pointer' : 'default', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                    onMouseOver={e => { if(booking.tour_departure_id) { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.color = '#2563eb'; } }}
                    onMouseOut={e => { if(booking.tour_departure_id) { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.color = '#334155'; } }}
                    title={booking.tour_departure_id ? "Xem chi tiết Lịch khởi hành" : ""}
                  >
                    <MapPin size={14} /> {booking.tour_name || 'Booking vé lẻ'} {booking.tour_departure_id && <ArrowRight size={12} />}
                  </button>

                  <div style={{ background: 'transparent', border: 'none', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>
                    <Calendar size={14} /> Đi: {booking.start_date ? new Date(booking.start_date).toLocaleDateString('vi-VN') : '--'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => window.print()} 
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '8px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; }}
                >
                  <FileText size={14} /> In Phiếu Thu
                </button>
                <button 
                  onClick={onClose} 
                  style={{ background: '#fef2f2', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', transition: 'all 0.2s' }}
                  onMouseOver={e => { e.currentTarget.style.background = '#fca5a5'; e.currentTarget.style.color = '#7f1d1d'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                >
                  <X size={20} strokeWidth={3} />
                </button>
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
                                 <td>{new Date(tx.transaction_date).toLocaleDateString('vi-VN')}</td>
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
