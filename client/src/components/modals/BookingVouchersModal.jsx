import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Save, FileText, CheckCircle, Printer, Trash2 } from 'lucide-react';
import PrintVoucherTemplate from '../print/PrintVoucherTemplate';
import html2canvas from 'html2canvas';

export default function BookingVouchersModal({ booking, tour, onClose, onRefresh }) {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [viewVoucher, setViewVoucher] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [voucherImageBase64, setVoucherImageBase64] = useState(null);


  useEffect(() => {
    if (viewVoucher) {
       setVoucherImageBase64(null);
       setTimeout(() => {
          const node = document.getElementById('voucher-capture-node');
          if (node) {
             html2canvas(node, { scale: 2, backgroundColor: '#ffffff' })
               .then(canvas => {
                  setVoucherImageBase64(canvas.toDataURL('image/png'));
               })
               .catch(err => console.error('html2canvas error', err));
          }
       }, 300);
    }
  }, [viewVoucher]);

  const [newVoucher, setNewVoucher] = useState({
    title: 'Thanh toán đợt 1',
    amount: booking?.total ? Number(booking.total) - Number(booking.paid || 0) : 0,
    payment_method: 'Chuyển khoản',
    payer_name: booking?.name || '',
    payer_phone: booking?.phone || '',
    notes: ''
  });

  useEffect(() => {
    if (booking?.id) {
      fetchVouchers();
    }
  }, [booking]);

  const fetchVouchers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/vouchers/booking/${booking.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVouchers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
        setSelectedFile(null);
        return;
    }
    if (file.size > 10 * 1024 * 1024) {
        alert('File vượt quá giới hạn 10MB!');
        e.target.value = '';
        return;
    }
    if (!file.type.startsWith('image/')) {
        alert('Chỉ cho phép tải lên file hình ảnh!');
        e.target.value = '';
        return;
    }
    setSelectedFile(file);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (newVoucher.amount <= 0) {
      alert("Số tiền phải lớn hơn 0");
      return;
    }
    const remaining = Number((booking?.total || 0) - (booking?.paid || 0));
    if (Number(newVoucher.amount) > remaining) {
      alert(`Số tiền thu vượt quá số tiền còn nợ (${remaining.toLocaleString('vi-VN')} đ)! Kế toán vui lòng kiểm tra lại.`);
      return;
    }
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      let attachment_url = '';
      if (selectedFile) {
          const formData = new FormData();
          formData.append('file', selectedFile);
          
          const uploadRes = await axios.post('/api/media/upload', formData, {
              headers: { 
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'multipart/form-data'
              }
          });
          attachment_url = uploadRes.data.url;
      }

      const payload = {
        ...newVoucher,
        tour_id: tour.id,
        booking_id: booking.id,
        booking_code: booking?.raw_details?.bookingInfo?.reservationCode || String(booking?.id),
        attachment_url
      };
      await axios.post('/api/vouchers', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Đã sinh phiếu thu thành công và ghi có cho Đơn hàng!');
      setShowAddForm(false);
      setSelectedFile(null);
      setNewVoucher({...newVoucher, title: '', amount: 0, payment_method: 'Chuyển khoản', payer_name: '', notes: ''});
      fetchVouchers();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi tạo phiếu thu');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelVoucher = async (id, code, amount) => {
    if (!window.confirm(`XÁC NHẬN HỦY PHIẾU THU: ${code}?\n\nSố tiền ${Number(amount).toLocaleString('vi-VN')} vnđ sẽ MẤT khỏi mục "Đã thanh toán" của Booking hiện tại. Thao tác này sẽ lưu vết trên hóa đơn.`)) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`/api/vouchers/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
      fetchVouchers();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi hủy phiếu thu');
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 100);
  };

  const handleDeleteVoucher = async (id, code, amount, status) => {
    Swal.fire({
      title: 'CẢNH BÁO',
      text: `Xóa vĩnh viễn phiếu thu ${code} khỏi hệ thống? Chức năng này dành cho Kế toán để xóa bỏ Phiếu tạo sai hoàn toàn khỏi CSDL.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Đồng ý Xóa',
      cancelButtonText: 'Đóng'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          setLoading(true);
          const token = localStorage.getItem('token');
          const res = await axios.delete(`/api/vouchers/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          alert(res.data.message);
          setViewVoucher(null);
          fetchVouchers();
          if (onRefresh) onRefresh();
        } catch (err) {
          console.error(err);
          alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa phiếu thu');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1900, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '900px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FileText color="#2563eb" />
              PHIẾU THU TIỀN
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '6px', marginBottom: 0 }}>Khách hàng: <b>{booking?.name}</b> - {tour?.tour_code}</p>
          </div>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', background: '#fff', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <div>
                <div style={{ color: '#64748b', marginBottom: '2px' }}>Tổng hợp đồng</div>
                <div style={{ fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap' }}>{Number(booking?.total || booking?.total_price || 0).toLocaleString('vi-VN')} đ</div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                <div style={{ color: '#64748b', marginBottom: '2px' }}>Đã thu</div>
                <div style={{ fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>{Number(booking?.paid || 0).toLocaleString('vi-VN')} đ</div>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px' }}>
                <div style={{ color: '#64748b', marginBottom: '2px' }}>Còn nợ</div>
                <div style={{ fontWeight: 'bold', color: '#ef4444', whiteSpace: 'nowrap' }}>{Number((booking?.total || booking?.total_price || 0) - (booking?.paid || 0)).toLocaleString('vi-VN')} đ</div>
              </div>
            </div>
            <button onClick={onClose} style={{ padding: '8px', background: '#e2e8f0', border: 'none', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', transition: 'all 0.2s', alignSelf: 'center' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Add Form Toggle */}
          {!showAddForm ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #dbeafe', marginBottom: '24px' }}>
              <div style={{ color: '#1e3a8a', fontWeight: 'bold' }}>Hiện có {vouchers.length} phiếu thu cho đơn này</div>
              <button 
                onClick={() => setShowAddForm(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#2563eb', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                <Plus size={18} /> TẠO PHIẾU THU MỚI
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '30px', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
               <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 THÔNG TIN PHIẾU THU
                 <button onClick={() => setShowAddForm(false)} style={{ color: '#ef4444', fontSize: '14px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Hủy & Đóng</button>
               </div>
               <form onSubmit={handleCreate} style={{ padding: '20px', background: '#fff' }}>
                 
                 <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Tên phiếu thu / Nội dung (*)</label>
                      <input 
                        type="text" 
                        required
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} 
                        value={newVoucher.title}
                        onChange={(e) => setNewVoucher({...newVoucher, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Số tiền thu (VND) (*)</label>
                      <input 
                        type="text" 
                        required
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', fontWeight: 'bold', color: '#16a34a', fontSize: '16px' }} 
                        value={newVoucher.amount ? Number(newVoucher.amount).toLocaleString('vi-VN') : ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setNewVoucher({...newVoucher, amount: val ? Number(val) : 0});
                        }}
                      />
                      <p style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Còn lại phải thu: {Number((booking?.total || 0) - (booking?.paid || 0)).toLocaleString('vi-VN')} vnđ</p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Phương thức thanh toán (*)</label>
                      <select 
                        required
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: '#fff' }} 
                        value={newVoucher.payment_method}
                        onChange={(e) => setNewVoucher({...newVoucher, payment_method: e.target.value})}
                      >
                        <option value="Chuyển khoản">Chuyển khoản</option>
                        <option value="Tiền mặt">Tiền mặt</option>
                        <option value="Cà thẻ">Cà thẻ (Thẻ tín dụng)</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Người đóng tiền</label>
                      <input 
                        type="text" 
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} 
                        value={newVoucher.payer_name}
                        onChange={(e) => setNewVoucher({...newVoucher, payer_name: e.target.value})}
                      />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Ghi chú thêm</label>
                      <textarea 
                        rows="2"
                        style={{ width: '100%', padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', resize: 'vertical' }} 
                        value={newVoucher.notes}
                        onChange={(e) => setNewVoucher({...newVoucher, notes: e.target.value})}
                        placeholder="Nhập ghi chú cho kế toán..."
                      />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>Ảnh chứng từ (Tối đa 10MB)</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ width: '100%', padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '8px', background: '#f8fafc' }} 
                      />
                    </div>
                 </div>

                 <div style={{ paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                    <button type="submit" disabled={uploading} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: '#fff', padding: '10px 24px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer' }}>
                       <Save size={18} /> {uploading ? 'Đang xử lý...' : 'Lưu Phiếu Thu'}
                    </button>
                 </div>
               </form>
            </div>
          )}

          {/* Vouchers List */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
             <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead style={{ background: '#f8fafc', color: '#475569' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Ngày tạo</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Mã phiếu</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Nội dung</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Số tiền</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>Trạng thái</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', textAlign: 'center' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Đang tải...</td></tr>
                  ) : vouchers.length === 0 ? (
                    <tr><td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>Chưa có phiếu thu nào.</td></tr>
                  ) : (
                    vouchers.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 16px', color: '#475569' }}>{new Date(v.created_at).toLocaleString('vi-VN')}</td>
                        <td style={{ padding: '12px 16px' }}>
                           <button 
                             onClick={() => setViewVoucher(v)}
                             style={{ background: 'none', border: 'none', fontWeight: 'bold', color: '#2563eb', textDecoration: 'underline', cursor: 'pointer', padding: 0 }}
                           >
                              {v.voucher_code}
                           </button>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                           <div style={{ fontWeight: 500 }}>{v.title}</div>
                           <div style={{ fontSize: '12px', color: '#64748b' }}>{v.payment_method}</div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>
                           {Number(v.amount).toLocaleString()}đ
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                           {v.status === 'Đã hủy' ? (
                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#ef4444', background: '#fee2e2', padding: '4px 8px', borderRadius: '99px' }}>
                                <X size={14} /> {v.status}
                             </span>
                           ) : (
                             <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 'bold', color: '#15803d', background: '#dcfce3', padding: '4px 8px', borderRadius: '99px' }}>
                                <CheckCircle size={14} /> {v.status}
                             </span>
                           )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                           {v.status !== 'Đã hủy' && (
                             <button 
                               onClick={() => handleCancelVoucher(v.id, v.voucher_code, v.amount)} 
                               style={{ background: '#fff', border: '1px solid #f87171', color: '#ef4444', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                               disabled={loading}
                             >
                               Hủy Phiếu
                             </button>
                           )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* Popup Xem Lại Phiếu Thu (Clean A4 Document View) */}
      {viewVoucher && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1910, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ position: 'relative', background: '#fff', width: '100%', maxWidth: '820px', maxHeight: '95vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', borderRadius: '4px' }}>
            
            {/* Action Buttons floating at the top right */}
            <div className="no-print" style={{ position: 'sticky', top: 0, zIndex: 100, display: 'flex', justifyContent: 'flex-end', padding: '16px 16px 12px 0', background: '#fff' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fff', color: '#1e293b', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', fontWeight: 500 }}>
                     <Printer size={16} /> In / Lưu PDF
                  </button>
                  <button onClick={() => setViewVoucher(null)} style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', color: '#475569' }}>
                    <X size={20} />
                  </button>
                </div>
            </div>

            <div style={{ padding: '0', minHeight: '400px' }}>
               
               <div id="voucher-capture-node" style={{ background: '#fff', borderRadius: '2px', boxShadow: voucherImageBase64 ? 'none' : '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', maxWidth: '800px', marginBottom: '24px', overflow: 'hidden', position: voucherImageBase64 ? 'absolute' : 'relative', top: voucherImageBase64 ? '-9999px' : 'auto', left: voucherImageBase64 ? '-9999px' : 'auto' }}>
                  <PrintVoucherTemplate voucher={viewVoucher} tour={tour} booking={booking} />
               </div>

               {voucherImageBase64 && (
                   <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
                       <img src={voucherImageBase64} alt="Phiếu Thu" style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '2px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)' }} />
                       <div style={{ textAlign: 'center', marginTop: '16px', color: '#16a34a', fontSize: '14px', background: '#dcfce7', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0', fontWeight: 500 }}>
                         💡 Ảnh chất lượng cao đã sẵn sàng! Chuột phải (hoặc nhấn giữ) vào ảnh để <b>Copy Image</b> (Sao chép hình ảnh) và gửi thẳng vào Zalo Khách.
                       </div>
                   </div>
               )}

            </div>

          </div>
        </div>
      )}

      {/* Hidden Print Layout */}
      {isPrinting && (
        <div className="voucher-print-wrapper" style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0,
          background: '#fff', 
          zIndex: 99999, 
          padding: 0,
          margin: 0
        }}>
          <PrintVoucherTemplate voucher={viewVoucher} tour={tour} booking={booking} />
        </div>
      )}
    </div>
  );
}
