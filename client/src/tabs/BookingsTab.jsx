import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Edit2, Trash2 } from 'lucide-react';
import BookingProfileSlider from '../components/BookingProfileSlider';

const BookingsTab = ({ 
  bookings, 
  bookingFilters, 
  setBookingFilters,
  bookingCurrentPage,
  setBookingCurrentPage,
  bookingTotalPages,
  setShowAddBookingModal,
  handleDeleteBooking,
  handleEditBooking,
  currentUser
}) => {
  const navigate = useNavigate();
  const [selectedBookingId, setSelectedBookingId] = useState(null);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { bg: '#fef3c7', color: '#b45309', label: 'Chờ xác nhận' };
      case 'confirmed': return { bg: '#e0f2fe', color: '#0369a1', label: 'Đã xác nhận' };
      case 'completed': return { bg: '#dcfce7', color: '#15803d', label: 'Hoàn thành' };
      case 'cancelled': return { bg: '#fee2e2', color: '#b91c1c', label: 'Đã huỷ' };
      default: return { bg: '#fef3c7', color: '#b45309', label: status };
    }
  };

  return (
    <>
      <div className="animate-fade-in">
        <div className="filter-bar" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: '1rem', alignItems: 'flex-end', paddingBottom: '1rem' }}>
          <div className="filter-group" style={{ flex: '1 1 auto', minWidth: '200px' }}>
            <label>TÌM BOOKING</label>
            <div style={{ position: 'relative' }}>
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: '#94a3b8' 
                }} 
              />
              <input 
                className="filter-input" 
                style={{ paddingLeft: '36px' }} 
                placeholder="Mã booking, tên khách..." 
                value={bookingFilters.search} 
                onChange={e => setBookingFilters({...bookingFilters, search: e.target.value})} 
              />
            </div>
          </div>
          
          <div className="filter-group" style={{ flex: '0 0 auto', minWidth: '150px' }}>
            <label>TRẠNG THÁI ĐƠN</label>
            <select 
              className="filter-input" 
              value={bookingFilters.bookingStatus || ''} 
              onChange={e => setBookingFilters({...bookingFilters, bookingStatus: e.target.value})}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Hoàn thành</option>
              <option value="cancelled">Đã huỷ</option>
            </select>
          </div>

          <div className="filter-group" style={{ flex: '0 0 auto', minWidth: '150px' }}>
            <label>THANH TOÁN</label>
            <select 
              className="filter-input" 
              value={bookingFilters.paymentStatus || ''} 
              onChange={e => setBookingFilters({...bookingFilters, paymentStatus: e.target.value})}
            >
              <option value="">Tất cả</option>
              <option value="unpaid">Chưa thu</option>
              <option value="partial">Thu một phần</option>
              <option value="paid">Hoàn tất</option>
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
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)',
              marginLeft: 'auto'
            }} 
            onClick={() => setShowAddBookingModal && setShowAddBookingModal(true)}
          >
            <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> <span style={{ letterSpacing: '0.5px' }}>TẠO MỚI BOOKING</span>
          </button>
        </div>
        <div className="data-table-container" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '1000px' }}>
            <thead>
              <tr>
                <th style={{ width: '10%' }}>MÃ ĐƠN</th>
                <th style={{ width: '15%' }}>KHÁCH HÀNG</th>
                <th style={{ width: '25%' }}>TOUR</th>
                <th style={{ width: '25%' }}>TÀI CHÍNH</th>
                <th style={{ width: '10%' }}>TRẠNG THÁI</th>
                <th style={{ textAlign: 'center', width: '15%' }}>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(booking => {
                const total = Number(booking.total_price) || 0;
                const paid = Number(booking.paid_amount) || 0;
                const debt = Math.max(0, total - paid);
                
                return (
                <tr key={booking.id}>
                  <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    <button 
                      onClick={() => setSelectedBookingId(booking.id)}
                      style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 800, padding: 0, cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s', letterSpacing: '0.5px' }}
                      onMouseOver={e => e.currentTarget.style.color = '#1d4ed8'}
                      onMouseOut={e => e.currentTarget.style.color = '#2563eb'}
                      title="Xem chi tiết Booking"
                    >
                      {booking.booking_code}
                    </button>
                  </td>
                  <td style={{ fontSize: '0.9rem' }}>
                    <button 
                      onClick={() => navigate('/customers')}
                      style={{ background: 'none', border: 'none', color: '#334155', fontWeight: 600, padding: 0, cursor: 'pointer', textAlign: 'left', transition: 'color 0.2s' }}
                      onMouseOver={e => e.currentTarget.style.color = '#2563eb'}
                      onMouseOut={e => e.currentTarget.style.color = '#334155'}
                      title="Đi đến Quản lý Khách hàng"
                    >
                      {booking.customer_name}
                    </button>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{booking.customer_phone}</div>
                    {(booking.customer_segment || booking.past_trip_count > 0) && (
                      <div style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px',
                        background: (booking.customer_segment || '').toLowerCase().includes('vip') ? '#fef08a' : '#f1f5f9', 
                        color: (booking.customer_segment || '').toLowerCase().includes('vip') ? '#854d0e' : '#475569', 
                        padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 700 
                      }}>
                        {booking.customer_segment && booking.customer_segment !== 'Tất cả' ? booking.customer_segment : 'Khách'}
                        {booking.past_trip_count > 0 && <span style={{opacity: 0.8}}>• Đi {booking.past_trip_count} lần</span>}
                      </div>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>
                    <button 
                      onClick={() => booking.tour_departure_id && navigate(`/departures/view/${booking.tour_departure_id}`)}
                      style={{ display: 'block', background: 'none', border: 'none', color: '#334155', padding: 0, cursor: booking.tour_departure_id ? 'pointer' : 'default', textAlign: 'left', transition: 'all 0.2s' }}
                      onMouseOver={e => { if(booking.tour_departure_id) e.currentTarget.style.color = '#2563eb'; }}
                      onMouseOut={e => { if(booking.tour_departure_id) e.currentTarget.style.color = '#334155'; }}
                      title={booking.tour_departure_id ? "Xem chi tiết Lịch khởi hành" : ""}
                    >
                      {booking.tour_code ? <span style={{ fontWeight: 800, color: '#0ea5e9' }}>[{booking.tour_code}] </span> : ''}
                      <span style={{ fontWeight: 600 }}>{booking.tour_name}</span>
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '160px' }}>
                        <span style={{ color: '#64748b' }}>Tổng:</span>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{total.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '160px' }}>
                        <span style={{ color: '#64748b' }}>Đã thu:</span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{paid.toLocaleString('vi-VN')} đ</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '160px', borderTop: '1px solid #e2e8f0', paddingTop: '4px', marginTop: '2px' }}>
                        <span style={{ color: '#64748b' }}>Còn lại:</span>
                        <span style={{ fontWeight: 700, color: debt > 0 ? '#ef4444' : '#64748b' }}>{debt.toLocaleString('vi-VN')} đ</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{
                      background: getStatusBadge(booking.booking_status).bg,
                      color: getStatusBadge(booking.booking_status).color,
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      whiteSpace: 'nowrap'
                    }}>
                      {getStatusBadge(booking.booking_status).label}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'nowrap' }}>
                      <button className="icon-btn view" title="Xem chi tiết" onClick={() => setSelectedBookingId(booking.id)}>
                        <Eye size={18} />
                      </button>
                      <button className="icon-btn edit" title="Sửa thông tin" onClick={() => handleEditBooking && handleEditBooking(booking)}>
                        <Edit2 size={18} />
                      </button>
                      {['admin', 'manager'].includes(currentUser?.role) && (
                        <button className="icon-btn delete" title="Xóa" onClick={() => handleDeleteBooking && handleDeleteBooking(booking.id)}>
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    Chưa có dữ liệu booking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', padding: '0.5rem 0' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
            Trang {bookingCurrentPage} / {bookingTotalPages || 1} {bookingTotalPages > 1 ? `(${bookings.length} trang hiển thị)` : ''}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => setBookingCurrentPage(Math.max(1, bookingCurrentPage - 1))}
              disabled={bookingCurrentPage <= 1}
              style={{ padding: '6px 12px', background: bookingCurrentPage <= 1 ? '#f1f5f9' : '#fff', color: bookingCurrentPage <= 1 ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: bookingCurrentPage <= 1 ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
            >
              Trang trước
            </button>
            <button 
              onClick={() => setBookingCurrentPage(Math.min(bookingTotalPages, bookingCurrentPage + 1))}
              disabled={bookingCurrentPage >= bookingTotalPages}
              style={{ padding: '6px 12px', background: bookingCurrentPage >= bookingTotalPages ? '#f1f5f9' : '#fff', color: bookingCurrentPage >= bookingTotalPages ? '#94a3b8' : '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: bookingCurrentPage >= bookingTotalPages ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}
            >
              Trang sau
            </button>
          </div>
        </div>
      </div>
      {selectedBookingId && (
        <BookingProfileSlider 
          bookingId={selectedBookingId} 
          onClose={() => setSelectedBookingId(null)} 
        />
      )}
    </>
  );
};

export default BookingsTab;
