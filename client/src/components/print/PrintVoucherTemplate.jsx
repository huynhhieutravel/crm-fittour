import React, { forwardRef } from 'react';
import { numberToWordsInVND } from '../../utils/numberToWords';

const PrintVoucherTemplate = forwardRef(({ voucher, tour, booking }, ref) => {
  if (!voucher) return null;

  const vDate = new Date(voucher.created_at);
  const day = vDate.getDate();
  const month = vDate.getMonth() + 1;
  const year = vDate.getFullYear();
  const time = vDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div 
      ref={ref} 
      className="voucher-print-container"
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '10px 40px',
        background: '#fff',
        color: '#000',
        fontFamily: '"Times New Roman", Times, serif',
        lineHeight: '1.5',
        fontSize: '15px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
        <div style={{ flex: 1, paddingRight: '20px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>CÔNG TY TNHH DU LỊCH QUỐC TẾ FIT TOUR</div>
          <div>19 Lương Hữu Khánh, P. Bến Thành, TP. HCM, Việt Nam</div>
          <div>0836999909 - info@fittour.com.vn</div>
        </div>
        <div style={{ textAlign: 'center', width: '320px', position: 'relative' }}>
          <div style={{ fontWeight: 'bold', fontSize: '15px' }}>Mẫu số TT-01</div>
          <div style={{ fontSize: '13px', fontStyle: 'italic' }}>
            (Ban hành theo Thông tư số 200/2014/TT-BTC Ngày 22/12/2014 của Bộ Tài chính)
          </div>
          <div style={{ 
            color: '#dc2626', 
            border: '2px solid #dc2626', 
            display: 'inline-block', 
            padding: '4px 12px',
            fontWeight: 'bold',
            fontSize: '18px',
            marginTop: '10px',
            transform: 'rotate(-5deg)'
          }}>
            ĐÃ THU TIỀN
          </div>
        </div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: 'bold' }}>PHIẾU THU</h1>
        <div style={{ fontStyle: 'italic', fontSize: '15px' }}>
          Ngày {day} tháng {month} năm {year}
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ fontWeight: 'bold', width: '180px' }}>Họ và tên người nộp tiền:</div>
          <div style={{ flex: 1 }}>{voucher.payer_name || '...'}</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ fontWeight: 'bold', width: '180px' }}>Số điện thoại:</div>
          <div style={{ flex: 1 }}>{voucher.payer_phone || '...'}</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ fontWeight: 'bold', width: '180px' }}>Địa chỉ:</div>
          <div style={{ flex: 1 }}>Việt Nam</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ fontWeight: 'bold', width: '180px' }}>Lý do (Nội dung):</div>
          <div style={{ flex: 1 }}>{voucher.title}</div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ fontWeight: 'bold', width: '180px' }}>Số tiền:</div>
          <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 'bold' }}>{Number(voucher.amount).toLocaleString('vi-VN')} đ</span>
            <span><span style={{ fontWeight: 'bold' }}>Viết bằng chữ:</span> {numberToWordsInVND(voucher.amount)}</span>
          </div>
        </div>
        <div style={{ display: 'flex' }}>
          <div style={{ fontWeight: 'bold', width: '180px' }}>Mã phiếu thu:</div>
          <div style={{ flex: 1 }}>{voucher.voucher_code}</div>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ fontWeight: 'bold', width: '180px' }}>Mã tham chiếu:</div>
            <div style={{ flex: 1 }}>{voucher.booking_code || (tour && tour.tour_code) || ''}</div>
          </div>
          <div style={{ display: 'flex', flex: 1 }}>
            <div style={{ fontWeight: 'bold', marginRight: '10px' }}>Phương thức thanh toán:</div>
            <div style={{ flex: 1 }}>{voucher.payment_method}</div>
          </div>
        </div>
        <div style={{ display: 'flex', marginTop: '10px' }}>
          <div style={{ fontWeight: 'bold', width: '180px' }}>Ghi chú:</div>
          <div style={{ flex: 1 }}>{voucher.notes || '(Phiếu có giá trị khi có đầy đủ sự xác nhận và đóng dấu của công ty)'}</div>
        </div>
      </div>

      {/* Signatures */}
      <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', marginTop: '20px', tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ fontWeight: 'bold', border: 'none', padding: '5px' }}>Giám đốc</th>
            <th style={{ fontWeight: 'bold', border: 'none', padding: '5px' }}>Kế toán trưởng</th>
            <th style={{ fontWeight: 'bold', border: 'none', padding: '5px' }}>Người nộp</th>
            <th style={{ fontWeight: 'bold', border: 'none', padding: '5px' }}>Người lập phiếu</th>
            <th style={{ fontWeight: 'bold', border: 'none', padding: '5px' }}>Thủ quỹ</th>
          </tr>
          <tr style={{ fontStyle: 'italic', fontSize: '13px', color: '#666' }}>
            <td style={{ border: 'none', padding: '0 5px' }}>(Ký, họ tên)</td>
            <td style={{ border: 'none', padding: '0 5px' }}>(Ký, họ tên)</td>
            <td style={{ border: 'none', padding: '0 5px' }}>(Ký, họ tên)</td>
            <td style={{ border: 'none', padding: '0 5px' }}></td>
            <td style={{ border: 'none', padding: '0 5px' }}>(Ký, họ tên)</td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ height: '80px', border: 'none' }}></td>
            <td style={{ height: '80px', border: 'none' }}></td>
            <td style={{ height: '80px', border: 'none' }}></td>
            <td style={{ height: '80px', border: 'none', verticalAlign: 'top', paddingTop: '8px', color: '#16a34a' }}>
               <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>✔ Đã ký</div>
               <div style={{ fontSize: '13px' }}>{`${day}/${month}/${year} ${time}`}</div>
               <div style={{ fontWeight: 'bold', marginTop: '4px', color: '#000' }}>{booking?.created_by_name || voucher.created_by_name || 'Hệ thống'}</div>
            </td>
            <td style={{ height: '80px', border: 'none' }}></td>
          </tr>
        </tbody>
      </table>

    </div>
  );
});

export default PrintVoucherTemplate;
