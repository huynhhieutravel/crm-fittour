import React, { useRef } from 'react';
import { X, Printer, Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { numberToWordsInVND } from '../../utils/numberToWords';

export default function PrintDepositRetentionModal({ isOpen, onClose, credit }) {
  if (!isOpen || !credit) return null;

  const printAreaRef = useRef(null);

  const formatMoney = (val) => {
    if (val === undefined || val === null || val === '') return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '---';
    try {
      const d = new Date(dateStr);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch (e) {
      return dateStr;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="print-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '95vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)', overflow: 'hidden' }}>
        
        {/* Modal Top Bar */}
        <div className="no-print" style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} /> Mã: {credit.credit_code}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b' }}>Hạn dùng: <b>{formatDate(credit.expiry_date)}</b></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{ background: '#ea580c', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Printer size={16} /> In Phiếu Bảo Lưu
            </button>
            <button
              onClick={onClose}
              style={{ background: '#e2e8f0', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '30px 40px', background: '#ffffff' }} ref={printAreaRef}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #ea580c', paddingBottom: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: '#ea580c', letterSpacing: '0.5px' }}>
                FIT TOUR — DU LỊCH CÓ GUU
              </h2>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', lineHeight: '1.5' }}>
                <div>Công Ty TNHH Du Lịch FIT TOUR (Beyond Ordinary Journeys)</div>
                <div>Địa chỉ: 19 Lương Hữu Khánh, Phường Bến Thành, Quận 1, TP. HCM</div>
                <div>Hotline: 0836 999 909 | Email: info@fittour.com.vn | Website: fittour.vn</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>MÃ PHIẾU:</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#ea580c', fontFamily: 'monospace' }}>
                {credit.credit_code}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Ngày cấp: {formatDate(credit.retention_date)}
              </div>
            </div>
          </div>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase' }}>
              PHIẾU XÁC NHẬN BẢO LƯU TIỀN CỌC TOUR
            </h1>
            <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
              (Chứng từ có giá trị cấn trừ thanh toán tiền tour trong thời hạn hiệu lực)
            </p>
          </div>

          {/* Details Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '24px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 0', width: '220px', color: '#64748b', fontWeight: 600 }}>Người thụ hưởng khoản bảo lưu:</td>
                <td style={{ padding: '8px 0', fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>
                  {credit.credited_to_name} {credit.credited_to_phone ? `— SĐT: ${credit.credited_to_phone}` : ''}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Hành khách hủy chuyến:</td>
                <td style={{ padding: '8px 0', color: '#334155' }}>
                  {credit.passenger_name} {credit.passenger_id_card ? `(Số CMT/HC: ${credit.passenger_id_card})` : ''}
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Hành trình tour gốc:</td>
                <td style={{ padding: '8px 0', color: '#334155' }}>
                  <b>[{credit.original_tour_code || 'TOUR'}]</b> {credit.original_tour_name || 'Hành trình FIT TOUR'} (Booking: {credit.original_booking_code || credit.original_booking_id})
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Số tiền cọc phân bổ:</td>
                <td style={{ padding: '8px 0', color: '#334155' }}>
                  {formatMoney(credit.original_deposit)}
                </td>
              </tr>
              {Number(credit.deduction_fee || 0) > 0 && (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', color: '#dc2626', fontWeight: 600 }}>Chi phí hủy thực tế phát sinh:</td>
                  <td style={{ padding: '8px 0', color: '#dc2626', fontWeight: 600 }}>
                    - {formatMoney(credit.deduction_fee)} (vé máy bay/dịch vụ không hoàn hủy)
                  </td>
                </tr>
              )}
              <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
                <td style={{ padding: '12px 8px', color: '#0f172a', fontWeight: 700, fontSize: '14px' }}>
                  SỐ TIỀN BẢO LƯU THỰC TẾ:
                </td>
                <td style={{ padding: '12px 8px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#16a34a' }}>
                    {formatMoney(credit.retention_amount)}
                  </div>
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#475569', marginTop: '2px' }}>
                    (Bằng chữ: {numberToWordsInVND(credit.retention_amount)})
                  </div>
                </td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 0', color: '#64748b', fontWeight: 600 }}>Thời hạn bảo lưu hiệu lực:</td>
                <td style={{ padding: '10px 0', color: '#ea580c', fontWeight: 700 }}>
                  Có giá trị sử dụng đến hết ngày {formatDate(credit.expiry_date)} ({credit.validity_months || 12} tháng)
                </td>
              </tr>
              {credit.notes && (
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 0', color: '#64748b', fontWeight: 600 }}>Ghi chú / Thỏa thuận:</td>
                  <td style={{ padding: '8px 0', color: '#334155', fontStyle: 'italic' }}>
                    {credit.notes}
                  </td>
                </tr>
              )}
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 0', color: '#64748b', fontWeight: 600 }}>Số dư khả dụng hiện tại:</td>
                <td style={{ padding: '10px 0', fontWeight: 800, color: '#0f172a' }}>
                  {formatMoney(credit.remaining_balance)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Terms & Conditions */}
          <div style={{ background: '#fff7ed', border: '1px dashed #fdba74', borderRadius: '8px', padding: '12px 16px', marginBottom: '30px', fontSize: '11px', color: '#9a3412', lineHeight: '1.6' }}>
            <div style={{ fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> QUY ĐỊNH BẢO LƯU TIỀN CỌC CỦA FIT TOUR:
            </div>
            <div>1. Số tiền bảo lưu được sử dụng để thanh toán tiền cọc hoặc cấn trừ tiền tour cho bất kỳ hành trình nào do FIT TOUR tổ chức.</div>
            <div>2. Khoản bảo lưu có thể được sử dụng cấn trừ một lần hoặc nhiều lần cho đến khi hết số dư khả dụng.</div>
            <div>3. Thời hạn sử dụng tối đa là <b>{credit.validity_months || 12} tháng</b> kể từ ngày lập phiếu. Sau ngày <b>{formatDate(credit.expiry_date)}</b>, phiếu sẽ tự động hết giá trị sử dụng theo quy chế bảo lưu.</div>
            <div>4. Phiếu được bảo mật và theo dõi trực tiếp trên hệ thống ERP của FIT TOUR thông qua Mã phiếu và Số điện thoại thụ hưởng.</div>
          </div>

          {/* Signatures */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', textAlign: 'center', marginTop: '20px', pageBreakInside: 'avoid' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>NGƯỜI THỤ HƯỞNG</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>(Ký và ghi rõ họ tên)</div>
              <div style={{ height: '70px' }}></div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>{credit.credited_to_name}</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>ĐẠI DIỆN FIT TOUR</div>
              <div style={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>(Ký, ghi rõ họ tên & đóng dấu)</div>
              <div style={{ height: '70px' }}></div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                {credit.creator_full_name || credit.created_by_name || 'Bộ Phận Điều Hành FIT TOUR'}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

