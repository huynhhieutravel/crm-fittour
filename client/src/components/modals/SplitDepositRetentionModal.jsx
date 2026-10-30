import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldAlert, CheckCircle2, UserCheck, Calendar, DollarSign, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SplitDepositRetentionModal({
  isOpen,
  onClose,
  booking,
  member,
  memberIndex,
  tour,
  onSuccess
}) {
  if (!isOpen || !booking || !member) return null;

  const raw = booking.raw_details || {};
  const members = Array.isArray(raw.members) ? raw.members : [];
  const totalSlots = members.length || Number(booking.pax_count) || 1;
  const totalPaid = Number(booking.paid || 0);

  // Mặc định chia đều cọc
  const defaultAllocated = totalSlots > 0 ? Math.round(totalPaid / totalSlots) : totalPaid;

  const [allocatedDeposit, setAllocatedDeposit] = useState(defaultAllocated);
  const [deductionFee, setDeductionFee] = useState(0);
  const [validityMonths, setValidityMonths] = useState(12); // Khóa cứng trần tối đa 12 tháng
  const [creditToOption, setCreditToOption] = useState('canceling_passenger');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatMoney = (val) => {
    if (val === undefined || val === null || val === '') return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
  };

  const netRetention = Math.max(0, Number(allocatedDeposit || 0) - Number(deductionFee || 0));

  const bookerName = booking.name || raw.bookingInfo?.name || 'Người đại diện';
  const cancelingName = member.name || 'Hành khách';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (allocatedDeposit > totalPaid) {
      return toast.error(`Số tiền cọc phân bổ không được lớn hơn tổng cọc của booking (${formatMoney(totalPaid)})`);
    }

    setIsSubmitting(true);
    try {
      const payload = {
        bookingId: booking.id,
        passengerIndex: memberIndex,
        allocatedDeposit: Number(allocatedDeposit),
        deductionFee: Number(deductionFee),
        validityMonths: Math.min(12, Math.max(1, parseInt(validityMonths) || 12)),
        creditToOption,
        notes: notes.trim()
      };

      const res = await axios.post('/api/customer-credits/split-and-retain', payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Đã tách và bảo lưu tiền cọc thành công!');
        if (onSuccess) {
          onSuccess(res.data.credit, res.data.updatedBooking);
        }
        onClose();
      } else {
        toast.error(res.data?.error || 'Lỗi xử lý bảo lưu.');
      }
    } catch (err) {
      console.error('Lỗi split-and-retain:', err);
      toast.error(err.response?.data?.error || err.message || 'Lỗi hệ thống khi tách bảo lưu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1900, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px' }}>
      <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '650px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldAlert size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>Tách Khách Hủy & Bảo Lưu Tiền Cọc</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Hành khách: <b>{cancelingName}</b> (Booking: {booking.booking_code || booking.id})</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Box tóm tắt thông tin Booking */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '12px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Tổng khách đoàn:</span>
              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px' }}>{totalSlots} khách</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Tổng cọc đã thu:</span>
              <span style={{ fontWeight: 700, color: '#16a34a', fontSize: '14px' }}>{formatMoney(totalPaid)}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Trạng thái sau tách:</span>
              <span style={{ fontWeight: 700, color: '#ea580c', fontSize: '14px' }}>Trả 1 ghế trống</span>
            </div>
          </div>

          {/* Phân bổ số tiền cọc */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Số tiền cọc phân bổ (đ) *
              </label>
              <input
                type="number"
                min="0"
                max={totalPaid}
                value={allocatedDeposit}
                onChange={e => setAllocatedDeposit(Number(e.target.value) || 0)}
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', fontWeight: 700, color: '#0f172a', outline: 'none' }}
                required
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Gợi ý chia đều: {formatMoney(defaultAllocated)}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Phí phạt / chi phí đã phát sinh (đ)
              </label>
              <input
                type="number"
                min="0"
                value={deductionFee}
                onChange={e => setDeductionFee(Number(e.target.value) || 0)}
                placeholder="0"
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '14px', fontWeight: 700, color: '#dc2626', outline: 'none' }}
              />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Ví dụ: vé máy bay hoặc visa không hoàn hủy
              </span>
            </div>
          </div>

          {/* Hộp hiển thị số tiền bảo lưu thực */}
          <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600, display: 'block' }}>SỐ TIỀN BẢO LƯU THỰC TẾ (CREDIT):</span>
              <span style={{ fontSize: '11px', color: '#15803d' }}>(= Cọc phân bổ - Phí phát sinh)</span>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a' }}>
              {formatMoney(netRetention)}
            </div>
          </div>

          {/* Quyền thụ hưởng bảo lưu */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
              Quyền sở hữu khoản tiền bảo lưu *
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '8px 12px', border: `1px solid ${creditToOption === 'canceling_passenger' ? '#ea580c' : '#e2e8f0'}`, borderRadius: '8px', background: creditToOption === 'canceling_passenger' ? '#fff7ed' : '#ffffff' }}>
                <input
                  type="radio"
                  name="creditToOption"
                  value="canceling_passenger"
                  checked={creditToOption === 'canceling_passenger'}
                  onChange={e => setCreditToOption(e.target.value)}
                />
                <span>Ghi nhận cho <b>Khách hủy: {cancelingName}</b> {member.phone ? `(${member.phone})` : ''}</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '8px 12px', border: `1px solid ${creditToOption === 'booker' ? '#ea580c' : '#e2e8f0'}`, borderRadius: '8px', background: creditToOption === 'booker' ? '#fff7ed' : '#ffffff' }}>
                <input
                  type="radio"
                  name="creditToOption"
                  value="booker"
                  checked={creditToOption === 'booker'}
                  onChange={e => setCreditToOption(e.target.value)}
                />
                <span>Ủy quyền cho <b>Người thanh toán / Đại diện: {bookerName}</b></span>
              </label>
            </div>
          </div>

          {/* Thời hạn hiệu lực: Khóa cứng trần tối đa 12 tháng */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Thời hạn bảo lưu hiệu lực (Giới hạn tối đa 12 tháng) *
            </label>
            <select
              value={validityMonths}
              onChange={e => setValidityMonths(Number(e.target.value))}
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', backgroundColor: '#f8fafc', color: '#0f172a', outline: 'none', fontWeight: 600 }}
            >
              <option value={3}>3 Tháng</option>
              <option value={6}>6 Tháng</option>
              <option value={9}>9 Tháng</option>
              <option value={12}>12 Tháng (Tối đa theo quy chế công ty)</option>
            </select>
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
              🔒 Hệ thống khóa cứng tối đa 12 tháng kể từ ngày hủy để đảm bảo quản trị dòng tiền.
            </span>
          </div>

          {/* Ghi chú */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Ghi chú nội bộ
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Nhập lý do khách hủy hoặc thỏa thuận riêng..."
              style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none' }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{ padding: '10px 18px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '10px 22px', border: 'none', borderRadius: '8px', background: '#ea580c', color: '#ffffff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.3)' }}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác Nhận Tách & Bảo Lưu'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
