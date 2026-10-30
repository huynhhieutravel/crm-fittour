import React, { useState } from 'react';
import axios from 'axios';
import { X, ShieldAlert, CheckCircle2, UserCheck, Calendar, DollarSign, FileText, UserPlus, Search, ArrowRightLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AsyncSelect from 'react-select/async';

export default function SplitDepositRetentionModal({
  isOpen,
  onClose,
  booking,
  member,
  memberIndex,
  tour,
  onSuccess
}) {
  if (!isOpen || !booking) return null;

  const raw = booking.raw_details || {};
  const members = (Array.isArray(raw.members) && raw.members.length > 0)
    ? raw.members
    : (member ? [member] : [{ name: booking.name || 'Hành khách', phone: booking.phone || '' }]);

  const [selectedIdx, setSelectedIdx] = useState(
    memberIndex !== undefined && memberIndex !== null ? Number(memberIndex) : 0
  );
  const currentMember = members[selectedIdx] || members[0] || {};
  const cancelingName = currentMember.name || 'Hành khách';
  const cancelingPhone = currentMember.phone || '';

  const companionMembers = members
    .map((m, idx) => ({ ...m, origIdx: idx }))
    .filter(m => m.origIdx !== selectedIdx);

  const bookerName = booking.name || raw.bookingInfo?.name || '';
  const bookerPhone = booking.phone || raw.bookingInfo?.phone || '';

  const isBookerSameAsCanceling = bookerName && (bookerName.toLowerCase().trim() === cancelingName.toLowerCase().trim());
  const isBookerInCompanions = bookerName && companionMembers.some(c => (c.name || '').toLowerCase().trim() === bookerName.toLowerCase().trim());
  const showBookerOption = bookerName && !isBookerSameAsCanceling && !isBookerInCompanions;

  const totalSlots = members.length || Number(booking.pax_count) || 1;
  const totalPaid = Number(booking.paid || 0);

  // Mặc định chia đều cọc
  const defaultAllocated = totalSlots > 0 ? Math.round(totalPaid / totalSlots) : totalPaid;

  const [allocatedDeposit, setAllocatedDeposit] = useState(defaultAllocated);
  const [deductionFee, setDeductionFee] = useState(0);
  const [validityMonths, setValidityMonths] = useState(12); // Khóa cứng trần tối đa 12 tháng
  const [creditToOption, setCreditToOption] = useState('canceling_passenger');
  const [selectedCustomCustomer, setSelectedCustomCustomer] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [isQuickAdd, setIsQuickAdd] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatMoney = (val) => {
    if (val === undefined || val === null || val === '') return '0 đ';
    return Number(val).toLocaleString('vi-VN') + ' đ';
  };

  const formatNumberWithDots = (val) => {
    if (val === undefined || val === null || val === '') return '';
    const num = Number(String(val).replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('vi-VN');
  };

  const parseNumberFromDots = (str) => {
    if (!str) return 0;
    const clean = String(str).replace(/\D/g, '');
    return Number(clean) || 0;
  };

  const netRetention = Math.max(0, Number(allocatedDeposit || 0) - Number(deductionFee || 0));

  const loadCustomerOptions = async (inputValue) => {
    if (!inputValue || inputValue.trim().length < 1) return [];
    try {
      const res = await axios.get('/api/customers?search=' + encodeURIComponent(inputValue.trim()), {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = res.data?.data || res.data;
      return Array.isArray(data) ? data.map(c => ({
        value: c.id,
        label: `${c.name}${c.phone ? ' - ' + c.phone : (c.id_card ? ' - HC/CCCD:' + c.id_card : '')}`,
        customer: c
      })) : [];
    } catch (err) {
      console.error("Lỗi tìm kiếm khách hàng:", err);
      return [];
    }
  };

  const handlePassengerChange = (newIdx) => {
    setSelectedIdx(newIdx);
    setCreditToOption('canceling_passenger');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (allocatedDeposit > totalPaid) {
      return toast.error(`Số tiền cọc phân bổ không được lớn hơn tổng cọc của booking (${formatMoney(totalPaid)})`);
    }

    let finalCreditToOption = creditToOption;
    let finalCreditedCustomerId = null;
    let finalCreditedName = '';
    let finalCreditedPhone = '';

    if (creditToOption.startsWith('companion_')) {
      const compIdx = parseInt(creditToOption.replace('companion_', ''), 10);
      const companion = members[compIdx];
      if (!companion) {
        return toast.error('Không tìm thấy thông tin người đồng hành đã chọn.');
      }
      finalCreditToOption = 'custom';
      finalCreditedName = (companion.name || '').trim();
      finalCreditedPhone = (companion.phone || '').trim();
      finalCreditedCustomerId = companion.customerId || companion.id || null;
    } else if (creditToOption === 'custom_customer') {
      if (selectedCustomCustomer) {
        finalCreditToOption = 'custom';
        finalCreditedCustomerId = selectedCustomCustomer.id;
        finalCreditedName = (selectedCustomCustomer.name || '').trim();
        finalCreditedPhone = (selectedCustomCustomer.phone || '').trim();
      } else {
        if (!customName.trim()) {
          return toast.error('Vui lòng tìm chọn khách hàng CRM hoặc bấm Tạo nhanh để nhập họ tên.');
        }
        if (!customPhone.trim()) {
          return toast.error('Vui lòng nhập số điện thoại người thụ hưởng để hệ thống nhận diện khi đặt tour mới.');
        }
        finalCreditToOption = 'custom';
        finalCreditedName = customName.trim();
        finalCreditedPhone = customPhone.trim();
        finalCreditedCustomerId = null;
      }
    } else if (creditToOption === 'canceling_passenger') {
      finalCreditToOption = 'canceling_passenger';
      finalCreditedName = (cancelingName || '').trim();
      finalCreditedPhone = (cancelingPhone || '').trim();
      finalCreditedCustomerId = currentMember.customerId || null;
    } else if (creditToOption === 'booker') {
      finalCreditToOption = 'booker';
    }

    setIsSubmitting(true);
    try {
      const payload = {
        bookingId: booking.id,
        passengerIndex: selectedIdx,
        allocatedDeposit: Number(allocatedDeposit),
        deductionFee: Number(deductionFee),
        validityMonths: Math.min(12, Math.max(1, parseInt(validityMonths) || 12)),
        creditToOption: finalCreditToOption,
        customCreditedCustomerId: finalCreditedCustomerId,
        customCreditedName: finalCreditedName,
        customCreditedPhone: finalCreditedPhone,
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
      <div style={{ background: '#ffffff', borderRadius: '16px', width: '100%', maxWidth: '680px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        
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
          
          {/* Lựa chọn hành khách hủy nếu booking có nhiều người */}
          {members.length > 1 && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#9a3412', marginBottom: '6px' }}>
                👥 Chọn hành khách hủy cần bảo lưu cọc ({members.length} khách trong đoàn):
              </label>
              <select
                value={selectedIdx}
                onChange={e => handlePassengerChange(Number(e.target.value))}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', border: '1px solid #fdba74', fontSize: '13px', fontWeight: 700, color: '#0f172a', background: '#ffffff', outline: 'none' }}
              >
                {members.map((m, idx) => (
                  <option key={idx} value={idx}>
                    Khách #{idx + 1}: {m.name || 'Chưa đặt tên'} {m.phone ? `(${m.phone})` : ''} — {m.ageType || 'Người lớn'}
                  </option>
                ))}
              </select>
            </div>
          )}

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

          {/* Phân bổ số tiền cọc (Định dạng dấu . phân cách hàng nghìn) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Số tiền cọc phân bổ (đ) *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formatNumberWithDots(allocatedDeposit)}
                  onChange={e => {
                    const val = parseNumberFromDots(e.target.value);
                    setAllocatedDeposit(Math.min(totalPaid, val));
                  }}
                  placeholder="0"
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '15px', fontWeight: 700, color: '#0f172a', outline: 'none' }}
                  required
                />
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Gợi ý chia đều: {formatMoney(defaultAllocated)}
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Phí phạt / chi phí đã phát sinh (đ)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formatNumberWithDots(deductionFee)}
                  onChange={e => {
                    const val = parseNumberFromDots(e.target.value);
                    setDeductionFee(val);
                  }}
                  placeholder="0"
                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px 12px', fontSize: '15px', fontWeight: 700, color: '#dc2626', outline: 'none' }}
                />
              </div>
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
              
              {/* Lựa chọn 1: Khách hủy */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '10px 12px', border: `1px solid ${creditToOption === 'canceling_passenger' ? '#ea580c' : '#e2e8f0'}`, borderRadius: '8px', background: creditToOption === 'canceling_passenger' ? '#fff7ed' : '#ffffff' }}>
                <input
                  type="radio"
                  name="creditToOption"
                  value="canceling_passenger"
                  checked={creditToOption === 'canceling_passenger'}
                  onChange={e => setCreditToOption(e.target.value)}
                />
                <span>Ghi nhận cho <b>Khách hủy: {cancelingName}</b> {cancelingPhone ? `(${cancelingPhone})` : ''}</span>
              </label>

              {/* Lựa chọn 2: Người đồng hành trong cùng booking (nếu có) */}
              {companionMembers.map(comp => {
                const optKey = `companion_${comp.origIdx}`;
                const isSelected = creditToOption === optKey;
                return (
                  <label
                    key={optKey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      padding: '10px 12px',
                      border: `1px solid ${isSelected ? '#ea580c' : '#e2e8f0'}`,
                      borderRadius: '8px',
                      background: isSelected ? '#fff7ed' : '#ffffff'
                    }}
                  >
                    <input
                      type="radio"
                      name="creditToOption"
                      value={optKey}
                      checked={isSelected}
                      onChange={e => setCreditToOption(e.target.value)}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ArrowRightLeft size={14} color="#ea580c" />
                      <span>
                        Chuyển cọc cho người đồng hành: <b>{comp.name || 'Hành khách'}</b> {comp.phone ? `(${comp.phone})` : ''} {comp.ageType ? `— ${comp.ageType}` : ''}
                      </span>
                    </div>
                  </label>
                );
              })}

              {/* Lựa chọn 3: Người đại diện thanh toán (chỉ hiển thị nếu khác khách hủy & khác đồng hành) */}
              {showBookerOption && (
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', padding: '10px 12px', border: `1px solid ${creditToOption === 'booker' ? '#ea580c' : '#e2e8f0'}`, borderRadius: '8px', background: creditToOption === 'booker' ? '#fff7ed' : '#ffffff' }}>
                  <input
                    type="radio"
                    name="creditToOption"
                    value="booker"
                    checked={creditToOption === 'booker'}
                    onChange={e => setCreditToOption(e.target.value)}
                  />
                  <span>Ủy quyền cho <b>Người thanh toán / Đại diện booking: {bookerName}</b> {bookerPhone ? `(${bookerPhone})` : ''}</span>
                </label>
              )}

              {/* Lựa chọn 4: Gán / Chuyển nhượng cho Khách hàng khác trên CRM hoặc Tạo mới (DIV wrapper, un-nested label) */}
              <div
                style={{
                  border: `1px solid ${creditToOption === 'custom_customer' ? '#ea580c' : '#e2e8f0'}`,
                  borderRadius: '8px',
                  background: creditToOption === 'custom_customer' ? '#fff7ed' : '#ffffff',
                  padding: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="creditToOption"
                    value="custom_customer"
                    checked={creditToOption === 'custom_customer'}
                    onChange={e => setCreditToOption(e.target.value)}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>
                      Gán / Chuyển nhượng cho Khách hàng khác trong CRM (hoặc Tạo mới)
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      Số tiền cọc bảo lưu sẽ được gán trực tiếp vào hồ sơ khách hàng để cấn trừ vào các booking tiếp theo
                    </div>
                  </div>
                </label>

                {creditToOption === 'custom_customer' && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', padding: '14px', borderRadius: '8px', border: '1px solid #fed7aa' }}>
                    
                    {/* Phần Tìm kiếm CRM */}
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#9a3412', marginBottom: '6px' }}>
                        🔍 Tìm kiếm khách hàng trong CRM (Gõ tên hoặc SĐT):
                      </label>
                      <AsyncSelect
                        cacheOptions
                        loadOptions={loadCustomerOptions}
                        defaultOptions={false}
                        placeholder="Gõ tên khách (vd: VUU MINH THONG) hoặc SĐT để tìm..."
                        value={selectedCustomCustomer ? { value: selectedCustomCustomer.id, label: `${selectedCustomCustomer.name}${selectedCustomCustomer.phone ? ' - ' + selectedCustomCustomer.phone : ''}` } : null}
                        onChange={(opt) => {
                          if (opt && opt.customer) {
                            setSelectedCustomCustomer(opt.customer);
                            setCustomName(opt.customer.name || '');
                            setCustomPhone(opt.customer.phone || '');
                            setIsQuickAdd(false);
                          } else {
                            setSelectedCustomCustomer(null);
                            setCustomName('');
                            setCustomPhone('');
                          }
                        }}
                        isClearable
                        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                        menuPosition="fixed"
                        noOptionsMessage={({ inputValue }) => !inputValue ? "Nhập ít nhất 1 ký tự để tìm kiếm..." : "Không tìm thấy khách hàng. Hãy bấm '+ Tạo nhanh' bên dưới."}
                        loadingMessage={() => "Đang tìm kiếm trong CRM..."}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 999999 }),
                          control: (base, state) => ({
                            ...base,
                            borderRadius: '6px',
                            borderColor: state.isFocused ? '#ea580c' : '#fdba74',
                            boxShadow: state.isFocused ? '0 0 0 1px #ea580c' : 'none',
                            fontSize: '13px',
                            minHeight: '38px'
                          }),
                          option: (base, state) => ({
                            ...base,
                            fontSize: '13px',
                            backgroundColor: state.isSelected ? '#ea580c' : state.isFocused ? '#fff7ed' : '#ffffff',
                            color: state.isSelected ? '#ffffff' : '#0f172a',
                            cursor: 'pointer'
                          })
                        }}
                      />
                    </div>

                    {/* Khách hàng đã chọn từ CRM */}
                    {selectedCustomCustomer ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <UserCheck size={20} color="#16a34a" />
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#166534' }}>
                              {selectedCustomCustomer.name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#15803d' }}>
                              SĐT: {selectedCustomCustomer.phone || 'Chưa có SĐT'} {selectedCustomCustomer.id_card ? `| CCCD/HC: ${selectedCustomCustomer.id_card}` : ''}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCustomCustomer(null);
                            setCustomName('');
                            setCustomPhone('');
                          }}
                          style={{ fontSize: '11px', color: '#dc2626', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', padding: '4px 10px', cursor: 'pointer', fontWeight: 600 }}
                        >
                          ✕ Đổi khách khác
                        </button>
                      </div>
                    ) : (
                      /* Trường hợp chưa chọn khách từ CRM: Cho phép tạo nhanh nếu cần */
                      <div>
                        {!isQuickAdd ? (
                          <button
                            type="button"
                            onClick={() => setIsQuickAdd(true)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '4px 0',
                              color: '#ea580c',
                              fontSize: '12px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                          >
                            <UserPlus size={15} /> + Khách hàng chưa có trong CRM? Bấm vào đây để tạo nhanh
                          </button>
                        ) : (
                          <div style={{ background: '#f8fafc', border: '1px dashed #fdba74', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#9a3412', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <UserPlus size={15} color="#ea580c" /> Tạo nhanh hồ sơ khách hàng mới:
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsQuickAdd(false);
                                  setCustomName('');
                                  setCustomPhone('');
                                }}
                                style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                              >
                                Đóng tạo nhanh
                              </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                  Họ và tên khách mới *:
                                </label>
                                <input
                                  type="text"
                                  value={customName}
                                  onChange={e => setCustomName(e.target.value)}
                                  placeholder="Nhập họ tên (vd: VUU MINH THONG)"
                                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}
                                  required={creditToOption === 'custom_customer' && !selectedCustomCustomer}
                                />
                              </div>
                              <div>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                  Số điện thoại *:
                                </label>
                                <input
                                  type="tel"
                                  value={customPhone}
                                  onChange={e => setCustomPhone(e.target.value)}
                                  placeholder="Nhập SĐT nhận bảo lưu"
                                  style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}
                                  required={creditToOption === 'custom_customer' && !selectedCustomCustomer}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>

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
