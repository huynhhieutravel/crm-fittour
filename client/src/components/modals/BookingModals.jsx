import React, { useState, useEffect } from 'react';
import { X, Save, LogOut, FileText, User, ShoppingCart, DollarSign, Calendar } from 'lucide-react';
import Select from 'react-select';

export const AddBookingModal = ({ 
  show, 
  onClose, 
  onSave, 
  customers, 
  departures,
  bookingToEdit 
}) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    tour_departure_id: '',
    notes: '',
    payment_status: 'unpaid',
    booking_status: 'Mới',
    discount: 0,
    initial_deposit_amount: '',
    initial_deposit_method: 'CASH',
    initial_deposit_date: new Date().toISOString().slice(0, 10)
  });
  
  const [paxDetails, setPaxDetails] = useState([]);
  const [serviceDetails, setServiceDetails] = useState([]);
  
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerInfo, setNewCustomerInfo] = useState({ name: '', phone: '' });

  const formatMoney = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseMoney = (str) => {
    if (!str) return '';
    const parsed = parseInt(str.toString().replace(/\./g, ''), 10);
    return isNaN(parsed) ? '' : parsed;
  };

  // Reset state or Hydrate when opened
  useEffect(() => {
    if (show) {
      if (bookingToEdit) {
        setFormData({
          customer_id: bookingToEdit.customer_id || '',
          tour_departure_id: bookingToEdit.tour_departure_id || '',
          notes: bookingToEdit.notes || '',
          payment_status: bookingToEdit.payment_status || 'unpaid',
          booking_status: bookingToEdit.booking_status || 'Mới',
          discount: Number(bookingToEdit.discount) || 0,
          initial_deposit_amount: '',
          initial_deposit_method: 'CASH',
          initial_deposit_date: new Date().toISOString().slice(0, 10)
        });
        
        // Parse dynamic arrays safely
        try { setPaxDetails(typeof bookingToEdit.pax_details === 'string' ? JSON.parse(bookingToEdit.pax_details) : (bookingToEdit.pax_details || [])); } catch (e) { setPaxDetails([]); }
        try { setServiceDetails(typeof bookingToEdit.service_details === 'string' ? JSON.parse(bookingToEdit.service_details) : (bookingToEdit.service_details || [])); } catch (e) { setServiceDetails([]); }
        setIsNewCustomer(false);
        setNewCustomerInfo({ name: '', phone: '' });
      } else {
        setFormData({
          customer_id: '', tour_departure_id: '', notes: '', payment_status: 'unpaid', booking_status: 'Mới',
          discount: 0, initial_deposit_amount: '', initial_deposit_method: 'CASH', initial_deposit_date: new Date().toISOString().slice(0, 10)
        });
        setPaxDetails([]);
        setServiceDetails([]);
        setIsNewCustomer(false);
        setNewCustomerInfo({ name: '', phone: '' });
      }
    }
  }, [show, bookingToEdit]);

  const handleDepartureChange = (selectedOption) => {
    const depId = selectedOption ? selectedOption.value : '';
    setFormData({ ...formData, tour_departure_id: depId });
    
    if (depId) {
      const dep = departures.find(d => d.id === depId);
      if (dep) {
        // Initialize Pax Rules
        const defaultPax = (dep.price_rules || []).map(rule => ({
          type: rule.name || 'Vé tùy chỉnh',
          price: rule.price || 0,
          qty: rule.is_default ? 1 : 0
        }));
        setPaxDetails(defaultPax);
        
        // Initialize Services
        const defaultServices = (dep.additional_services || []).map(svc => ({
          service: svc.name || 'Dịch vụ tùy chỉnh',
          price: svc.price || 0,
          qty: 0
        }));
        setServiceDetails(defaultServices);
      }
    } else {
      setPaxDetails([]);
      setServiceDetails([]);
    }
  };

  const calculateGrossTotal = () => {
    let total = 0;
    paxDetails.forEach(p => total += (p.price || 0) * (p.qty || 0));
    serviceDetails.forEach(s => total += (s.price || 0) * (s.qty || 0));
    return total;
  };

  const calculateTotal = () => {
    return Math.max(0, calculateGrossTotal() - (formData.discount || 0));
  };
  
  const totalPaxCount = paxDetails.reduce((sum, p) => sum + (p.qty || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isNewCustomer && !formData.customer_id) return alert('Vui lòng chọn hoặc tạo khách hàng!');
    if (!formData.tour_departure_id) return alert('Vui lòng chọn lịch khởi hành!');
    if (totalPaxCount === 0) return alert('Vui lòng nhập ít nhất 1 khách!');

    const submission = {
      ...formData,
      is_new_customer: isNewCustomer,
      new_customer_info: newCustomerInfo,
      pax_details: paxDetails.filter(p => p.qty > 0),
      service_details: serviceDetails.filter(s => s.qty > 0),
      pax_count: totalPaxCount,
      total_price: calculateTotal()
    };
    
    onSave(submission);
  };

  if (!show) return null;

  const customerOptions = customers.map(c => ({ value: c.id, label: `${c.name} - ${c.phone}` }));
  const currCustomerValue = formData.customer_id ? customerOptions.find(o => o.value === formData.customer_id) : null;

  const departureOptions = departures.map(d => ({ 
    value: d.id, 
    label: `[${d.code}] ${d.template_name || 'Tour'} - Đi: ${new Date(d.start_date).toLocaleDateString('vi-VN')}` 
  }));
  const currDepartureValue = formData.tour_departure_id ? departureOptions.find(o => o.value === formData.tour_departure_id) : null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 9999 }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '850px', padding: '0', maxHeight: '95vh', overflowY: 'auto', borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
        <div style={{ position: 'sticky', top: 0, background: 'white', zIndex: 10, padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '8px', color: 'var(--primary)' }}>
              <ShoppingCart size={22} />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {bookingToEdit ? 'Cập Nhật Đơn Hàng (Booking)' : 'Tạo Đơn Hàng (Booking)'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: '#f1f5f9', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.2s' }}
            onMouseOver={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
          >
            <X size={18} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem' }}>
          
          {/* Section: Khách hàng & Lịch trình */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              
              <div className="modal-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label><User size={14} style={{ marginRight: '4px' }}/> KHÁCH HÀNG *</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', cursor: 'pointer', color: '#6366f1' }}>
                    <input type="checkbox" checked={isNewCustomer} onChange={e => setIsNewCustomer(e.target.checked)} /> Khách mới
                  </label>
                </div>
                {isNewCustomer ? (
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input className="modal-input" required placeholder="Họ và tên..." value={newCustomerInfo.name} onChange={e => setNewCustomerInfo({...newCustomerInfo, name: e.target.value})} />
                    <input className="modal-input" required placeholder="Số điện thoại..." value={newCustomerInfo.phone} onChange={e => setNewCustomerInfo({...newCustomerInfo, phone: e.target.value})} />
                  </div>
                ) : (
                  <Select
                    options={customerOptions}
                    value={currCustomerValue}
                    onChange={(opt) => setFormData({...formData, customer_id: opt ? opt.value : ''})}
                    placeholder="Tìm theo tên hoặc số điện thoại..."
                    isClearable
                    styles={{ control: (base) => ({ ...base, minHeight: '42px', borderRadius: '8px', border: '1px solid #cbd5e1' }) }}
                  />
                )}
              </div>

              <div className="modal-form-group">
                <label><Calendar size={14} style={{ marginRight: '4px' }}/> CHỌN LỊCH KHỞI HÀNH *</label>
                <Select
                  options={departureOptions}
                  value={currDepartureValue}
                  onChange={handleDepartureChange}
                  placeholder="Chọn lịch khởi hành (mã code, tên tour)..."
                  isClearable
                  styles={{ control: (base) => ({ ...base, minHeight: '42px', borderRadius: '8px', border: '1px solid #cbd5e1' }) }}
                />
              </div>

            </div>
          </div>

          {/* Section: Bảng tính tiền động */}
          {formData.tour_departure_id && (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#f1f5f9', padding: '0.75rem 1rem', fontWeight: 700, borderBottom: '1px solid #e2e8f0' }}>
                CẤU TRÚC GIÁ VÀ DỊCH VỤ CHỌN THÊM
              </div>
              <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Pax Pricing Table */}
                <div>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>BẢNG GIÁ VÉ</h4>
                  {paxDetails.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', width: '35%', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>LOẠI VÉ / PHỤ THU</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>ĐƠN GIÁ (VND)</th>
                          <th style={{ textAlign: 'center', width: '80px', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>SỐ LƯỢNG</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>THÀNH TIỀN</th>
                          <th style={{ width: '40px', borderBottom: '2px solid #e2e8f0' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {paxDetails.map((pax, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="text" className="modal-input" style={{ width: '100%', height: '36px', fontWeight: 600, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                value={pax.type || ''}
                                onChange={(e) => {
                                  const newPax = [...paxDetails];
                                  newPax[idx].type = e.target.value;
                                  setPaxDetails(newPax);
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="text" className="modal-input" style={{ width: '100%', height: '36px', textAlign: 'right', padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, color: '#0f172a' }}
                                value={formatMoney(pax.price)}
                                onChange={(e) => {
                                  const newPax = [...paxDetails];
                                  newPax[idx].price = parseMoney(e.target.value);
                                  setPaxDetails(newPax);
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="number" min="0" className="modal-input" style={{ textAlign: 'center', height: '36px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, color: '#0f172a' }}
                                value={pax.qty || 0}
                                onChange={(e) => {
                                  const newPax = [...paxDetails];
                                  newPax[idx].qty = parseInt(e.target.value) || 0;
                                  setPaxDetails(newPax);
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 800, color: '#d97706', verticalAlign: 'middle', fontSize: '0.95rem' }}>
                              {Number(pax.price * (pax.qty || 0)).toLocaleString('vi-VN')}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                               <button type="button" onClick={() => setPaxDetails(paxDetails.filter((_, i) => i !== idx))} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} strokeWidth={3}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', padding: '0.5rem 0' }}>Lịch trình này chưa thiết lập cấu trúc vé.</p>
                  )}
                  <button type="button" onClick={() => setPaxDetails([...paxDetails, { type: 'Vé tùy chỉnh', price: 0, qty: 1 }])} style={{ marginTop: '8px', fontSize: '0.8rem', padding: '6px 14px', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Thêm loại vé mới</button>
                </div>

                {/* Additional Services Table */}
                {serviceDetails.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>DỊCH VỤ KÈM THEO</h4>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: 'left', width: '35%', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>DỊCH VỤ</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>ĐƠN GIÁ (VND)</th>
                          <th style={{ textAlign: 'center', width: '80px', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>SỐ LƯỢNG</th>
                          <th style={{ textAlign: 'right', padding: '0.75rem 0.5rem', color: '#64748b', fontSize: '0.8rem', borderBottom: '2px solid #e2e8f0' }}>THÀNH TIỀN</th>
                          <th style={{ width: '40px', borderBottom: '2px solid #e2e8f0' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {serviceDetails.map((svc, idx) => (
                          <tr key={idx}>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="text" className="modal-input" style={{ width: '100%', height: '36px', fontWeight: 600, padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                                value={svc.service || ''}
                                onChange={(e) => {
                                  const newSvcs = [...serviceDetails];
                                  newSvcs[idx].service = e.target.value;
                                  setServiceDetails(newSvcs);
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="text" className="modal-input" style={{ width: '100%', height: '36px', textAlign: 'right', padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, color: '#0f172a' }}
                                value={formatMoney(svc.price)}
                                onChange={(e) => {
                                  const newSvcs = [...serviceDetails];
                                  newSvcs[idx].price = parseMoney(e.target.value);
                                  setServiceDetails(newSvcs);
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem' }}>
                              <input 
                                type="number" min="0" className="modal-input" style={{ textAlign: 'center', height: '36px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', fontWeight: 600, color: '#0f172a' }}
                                value={svc.qty || 0}
                                onChange={(e) => {
                                  const newSvcs = [...serviceDetails];
                                  newSvcs[idx].qty = parseInt(e.target.value) || 0;
                                  setServiceDetails(newSvcs);
                                }}
                              />
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 800, color: '#d97706', verticalAlign: 'middle', fontSize: '0.95rem' }}>
                              {Number(svc.price * (svc.qty || 0)).toLocaleString('vi-VN')}
                            </td>
                            <td style={{ padding: '0.5rem', textAlign: 'center', verticalAlign: 'middle' }}>
                               <button type="button" onClick={() => setServiceDetails(serviceDetails.filter((_, i) => i !== idx))} style={{ color: '#ef4444', background: '#fee2e2', border: 'none', cursor: 'pointer', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} strokeWidth={3}/></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <button type="button" onClick={() => setServiceDetails([...serviceDetails, { service: 'Dịch vụ tuỳ chỉnh', price: 0, qty: 1 }])} style={{ marginTop: '8px', fontSize: '0.8rem', padding: '6px 14px', background: '#eff6ff', color: '#2563eb', border: '1px dashed #93c5fd', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Thêm dịch vụ mới</button>
                  </div>
                )}
                {serviceDetails.length === 0 && (
                   <button type="button" onClick={() => setServiceDetails([{ service: 'Dịch vụ tuỳ chỉnh', price: 0, qty: 1 }])} style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '6px 14px', background: '#eff6ff', color: '#2563eb', border: '1px dashed #93c5fd', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>+ Thêm dịch vụ kèm theo</button>
                )}
                
                {/* Total Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Chiết khấu / Khuyến mãi (VND):</div>
                    <input 
                      type="text" 
                      className="modal-input" 
                      style={{ width: '150px', textAlign: 'right', color: '#dc2626', fontWeight: 600 }} 
                      value={formatMoney(formData.discount)} 
                      onChange={e => {
                        let val = parseMoney(e.target.value);
                        const gross = calculateGrossTotal();
                        if (val > gross) val = gross;
                        setFormData({...formData, discount: val});
                      }}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div style={{ background: '#fffbeb', padding: '1.5rem', borderRadius: '8px', border: '1px dashed #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#d97706', fontWeight: 700 }}>TỔNG CHỖ BÁN: {totalPaxCount} khách</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase' }}>TỔNG THANH TOÁN (Sau Khuyến Mãi)</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#dc2626' }}>{calculateTotal().toLocaleString('vi-VN')} ₫</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Section: Đóng Cọc Tiền Mặt Lập Tức */}
          {formData.tour_departure_id && !bookingToEdit && (
             <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
               <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', marginBottom: '1rem' }}>💸 Ghi nhận thu Cọc Đơn Hàng ngay</h4>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="modal-form-group">
                    <label style={{ color: '#15803d' }}>SỐ TIỀN CỌC (VND)</label>
                    <input 
                      type="text" 
                      className="modal-input" 
                      placeholder="Ví dụ: 5.000.000 (Để trống nếu chưa thu)" 
                      value={formatMoney(formData.initial_deposit_amount)}
                      onChange={e => setFormData({...formData, initial_deposit_amount: parseMoney(e.target.value)})}
                    />
                  </div>
                  <div className="modal-form-group">
                    <label style={{ color: '#15803d' }}>PHƯƠNG THỨC</label>
                    <select className="modal-select" value={formData.initial_deposit_method} onChange={e => setFormData({...formData, initial_deposit_method: e.target.value})}>
                      <option value="CASH">Tiền mặt</option>
                      <option value="BANK_TRANSFER">Chuyển khoản</option>
                      <option value="CARD">Quẹt thẻ</option>
                    </select>
                  </div>
                  <div className="modal-form-group">
                    <label style={{ color: '#15803d' }}>NGÀY THU CỌC</label>
                    <input 
                      type="date" 
                      className="modal-input" 
                      value={formData.initial_deposit_date}
                      onChange={e => setFormData({...formData, initial_deposit_date: e.target.value})}
                    />
                  </div>
               </div>
               <p style={{ marginTop: '8px', fontSize: '0.8rem', color: '#16a34a', fontStyle: 'italic' }}>*Hệ thống sẽ tự động cập nhật Trạng thái Thanh Toán mà không cần bạn làm thủ công nếu bạn nhập Khung này.</p>
             </div>
          )}

          {/* Section: Bổ sung */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="modal-form-group">
              <label>TRẠNG THÁI THANH TOÁN</label>
              <select className="modal-select" value={formData.payment_status} onChange={e => setFormData({...formData, payment_status: e.target.value})}>
                <option value="unpaid">Chưa thanh toán</option>
                <option value="partial">Đặt cọc (Partial)</option>
                <option value="paid">Đã thanh toán đủ (Paid)</option>
              </select>
            </div>
            <div className="modal-form-group">
              <label>TRẠNG THÁI ĐƠN</label>
              <select className="modal-select" value={formData.booking_status} onChange={e => setFormData({...formData, booking_status: e.target.value})}>
                <option value="Mới">Mới</option>
                <option value="Giữ chỗ">Giữ chỗ</option>
                <option value="Đã đặt cọc">Đã đặt cọc</option>
                <option value="Đã thanh toán">Đã thanh toán</option>
                <option value="Hoàn thành">Hoàn thành</option>
                <option value="Huỷ">Huỷ</option>
              </select>
            </div>
          </div>

          <div className="modal-form-group">
            <label><FileText size={14} style={{ marginRight: '4px' }}/> GHI CHÚ ĐƠN HÀNG</label>
            <textarea 
              className="modal-input" 
              style={{ minHeight: '80px', padding: '12px' }}
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              placeholder="Ghi chú về chế độ ăn uống, yêu cầu đặc biệt..."
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
            <button type="submit" className="btn-pro-save" style={{ flex: 1 }}>
              <Save size={18} /> {bookingToEdit ? 'LƯU CẬP NHẬT' : 'LƯU ĐƠN HÀNG'}
            </button>
            <button type="button" className="btn-pro-cancel" onClick={onClose} style={{ flex: 1 }}>
              <LogOut size={18} style={{ transform: 'rotate(180deg)' }} /> HỦY BỎ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
