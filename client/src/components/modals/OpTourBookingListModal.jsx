import React from 'react';
import { X, Trash2, Edit2, CheckCircle, Mail, DollarSign, RefreshCw, FileText, UserPlus, Users } from 'lucide-react';
import axios from 'axios';

export default function OpTourBookingListModal({ isOpen, onClose, tour, onOpenAddCustomer, onEditBooking }) {
  if (!isOpen) return null;

  // Parse revenues
  let bookings = [];
  try {
    if (tour?.revenues) {
      bookings = typeof tour.revenues === 'string' ? JSON.parse(tour.revenues) : tour.revenues;
      if (!Array.isArray(bookings)) bookings = [];
    }
  } catch (e) {
    bookings = [];
  }

  // Calculate top cards stats
  const formatMoney = (val) => Number(val || 0).toLocaleString('vi-VN');
  
  let countGiuCho = 0;
  let countDatCoc = 0;
  let countThanhToan = 0;
  let sumNguoiLon = 0;
  let sumTreEm = 0;
  let sumTreNho = 0;
  let sumDaThu = 0;
  let sumConThieu = 0;

  bookings.forEach(b => {
    // Status counts
    const st = b.status || 'Giữ chỗ';
    if (st.includes('Giữ chỗ') || st.includes('Mới')) countGiuCho++;
    else if (st.includes('cọc')) countDatCoc++;
    else if (st.includes('toán')) countThanhToan++;

    // Sum Money
    if (st !== 'Huỷ' && st !== 'Hủy') {
       sumDaThu += Number(b.paid || 0);
       sumConThieu += (Number(b.total || 0) - Number(b.paid || 0));
    }

    // Age counts
    const pricingRows = b.raw_details?.pricingRows || [];
    pricingRows.forEach(row => {
       const qty = Number(row.qty || 0);
       if (row.ageType?.includes('Người lớn')) sumNguoiLon += qty;
       else if (row.ageType?.includes('Trẻ em')) sumTreEm += qty;
       else if (row.ageType?.includes('Trẻ nhỏ')) sumTreNho += qty;
    });
  });

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '20px' }}>
      <div style={{ background: '#f8fafc', borderRadius: '8px', width: '100%', maxWidth: '1400px', height: '95vh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        {/* HEADER */}
        <div style={{ padding: '15px 20px', borderBottom: '1px solid #e2e8f0', background: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'center' }}>
            DANH SÁCH NHÓM TRONG TOUR
            <div style={{ fontSize: '14px', color: '#64748b', textTransform: 'none', marginTop: '4px', fontWeight: 'normal' }}>
              {tour?.tour_name || 'Đang tải...'}
            </div>
          </h2>
          <button onClick={onClose} style={{ position: 'absolute', right: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, background: 'white' }}>
          
          {/* TOP 6 CARDS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '15px', marginBottom: '20px' }}>
             <div style={{ background: '#ec4899', color: 'white', padding: '15px', borderRadius: '4px', position: 'relative', minHeight: '80px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', position: 'absolute', top: '10px', right: '15px' }}>{countGiuCho}</div>
                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '13px' }}>Giữ chỗ</div>
             </div>
             <div style={{ background: '#f59e0b', color: 'white', padding: '15px', borderRadius: '4px', position: 'relative', minHeight: '80px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', position: 'absolute', top: '10px', right: '15px' }}>{countDatCoc}</div>
                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '13px' }}>Đã đặt cọc</div>
             </div>
             <div style={{ background: '#84cc16', color: 'white', padding: '15px', borderRadius: '4px', position: 'relative', minHeight: '80px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', position: 'absolute', top: '10px', right: '15px' }}>{countThanhToan}</div>
                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '13px' }}>Đã thanh toán</div>
             </div>
             <div style={{ background: '#22c55e', color: 'white', padding: '15px', borderRadius: '4px', position: 'relative', minHeight: '80px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '10px', right: '15px' }}>{formatMoney(sumDaThu)}</div>
                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '13px' }}>Tổng Thực Thu</div>
             </div>
             <div style={{ background: '#ef4444', color: 'white', padding: '15px', borderRadius: '4px', position: 'relative', minHeight: '80px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', position: 'absolute', top: '10px', right: '15px' }}>{formatMoney(sumConThieu)}</div>
                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '13px' }}>Còn Thiếu</div>
             </div>
             <div style={{ background: '#0ea5e9', color: 'white', padding: '15px', borderRadius: '4px', position: 'relative', minHeight: '80px' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', position: 'absolute', top: '10px', right: '15px' }}>{sumNguoiLon + sumTreEm + sumTreNho}</div>
                <div style={{ position: 'absolute', bottom: '15px', left: '15px', fontSize: '13px' }}>Tổng Số Khách</div>
             </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '15px' }}>
            <button onClick={onOpenAddCustomer} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>+ Thêm khách hàng</button>
          </div>

          {/* TABLE */}
          <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>STT</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'left', minWidth: '250px' }}>Khách hàng</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Ngày đặt</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Ngày đóng chỗ</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Tổng tiền</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Thực thu</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Còn thiếu</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Sales phụ trách</th>
                  <th style={{ padding: '12px', borderRight: '1px solid #e2e8f0', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ padding: '12px', textAlign: 'center', minWidth: '150px' }}>Chức năng</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan="10" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                      Chưa có dữ liệu khách hàng. Vui lòng bấm <b>+ Thêm khách hàng</b>
                    </td>
                  </tr>
                ) : (
                  bookings.map((b, idx) => {
                    const raw = b.raw_details || {};
                    const bInfo = raw.bookingInfo || {};
                    const members = raw.members || [];
                    const bdt = new Date(b.created_at || Date.now());
                    
                    const formatDate = (iso) => {
                       if (!iso) return '---';
                       try { return new Date(iso).toLocaleDateString('vi-VN'); } catch(e) { return iso; }
                    };

                    const firstMember = members[0] || {};
                    const isNew = true; // Hardcode cá nhân tag
                    
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'top' }}>{idx + 1}</td>
                        <td style={{ padding: '15px', verticalAlign: 'top', lineHeight: '1.6' }}>
                           <div style={{ marginBottom: '4px' }}><b>Tên:</b> {b.name} <span style={{ border: '1px solid #f59e0b', color: '#f59e0b', borderRadius: '12px', padding: '2px 6px', fontSize: '10px', marginLeft: '5px' }}>Cá nhân</span></div>
                           <div style={{ marginBottom: '4px' }}><b>Điện thoại:</b> {b.phone || firstMember.phone || '---'}</div>
                           <div style={{ marginBottom: '4px' }}><b>CMTND:</b> {b.cmnd || firstMember.docId || '---'}</div>
                           <div style={{ marginBottom: '4px' }}><b>Giới tính:</b> {bInfo.gender || firstMember.gender || '---'}</div>
                           <div style={{ marginBottom: '4px' }}><b>Ngày sinh:</b> {formatDate(firstMember.dob)}</div>
                           <div style={{ marginBottom: '4px' }}><b>Số lượng:</b> {b.qty}</div>
                           {raw.pricingRows?.[0]?.internalNote ? (
                              <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                 <b>Ghi chú:</b> 
                                 <span title={raw.pricingRows[0].internalNote} style={{ cursor: 'help', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px', fontSize: '10px' }}>
                                    Xem chi tiết
                                 </span>
                              </div>
                           ) : (
                              <div style={{ marginBottom: '4px' }}><b>Ghi chú:</b> ---</div>
                           )}
                           <div style={{ marginBottom: '4px' }}><b>Giá NL:</b> {formatMoney(raw.pricingRows?.[0]?.price || 0)}</div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle', fontSize: '12px' }}>
                           <div style={{ color: '#1d4ed8', fontWeight: 'bold' }}>T.Gian đặt: {bdt.toLocaleDateString('vi-VN')} {bdt.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
                           <div style={{ marginTop: '8px', background: '#fbcfe8', color: '#be185d', padding: '4px 8px', borderRadius: '12px', display: 'inline-block', fontWeight: 'bold' }}>Mã đặt chỗ:{bInfo.reservationCode || String(b.id || '').substring(0,6) || '---'}</div>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>11/04/2026</td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle', color: '#f59e0b', fontWeight: 'bold' }}>{formatMoney(b.total)}</td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle', color: '#22c55e', fontWeight: 'bold' }}>{formatMoney(b.paid)}</td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle', color: '#ef4444', fontWeight: 'bold' }}>{formatMoney(b.total - b.paid)}</td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>
                           Sales
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>
                           <div style={{ color: '#ef4444', fontWeight: 'bold', marginBottom: '5px' }}>{b.status || 'Giữ chỗ'}</div>
                           <div style={{ color: '#3b82f6', fontSize: '11px', fontWeight: 'bold' }}>0d 17h 48m 59s</div>
                           <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>Xác nhận chỗ</button>
                        </td>
                        <td style={{ padding: '15px', textAlign: 'center', verticalAlign: 'middle' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Xác nhận dịch vụ</button>
                              <button style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Hợp đồng dịch vụ</button>
                              
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '10px' }}>
                                 <FileText size={16} color="#475569" cursor="pointer"/>
                                 <DollarSign size={16} color="#475569" cursor="pointer"/>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '5px' }}>
                                 <Trash2 size={16} color="#475569" cursor="pointer"/>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '5px' }}>
                                 <Edit2 size={16} color="#475569" cursor="pointer" onClick={() => onEditBooking(b)}/>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '5px' }}>
                                 <Users size={16} color="#475569" cursor="pointer"/>
                              </div>

                              <button style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '10px' }}>
                                 <X size={12}/> Hủy chỗ
                              </button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
