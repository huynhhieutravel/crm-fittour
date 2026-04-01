import React, { useState, useEffect } from 'react';
import { X, Save, LogOut, FileText, User, ShoppingCart, DollarSign, Calendar } from 'lucide-react';
import Select from 'react-select';

export const AddBookingModal = ({ 
  show, 
  onClose, 
  onSave, 
  customers, 
  departures 
}) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    tour_departure_id: '',
    notes: '',
    payment_status: 'unpaid',
    booking_status: 'pending'
  });
  
  const [paxDetails, setPaxDetails] = useState([]);
  const [serviceDetails, setServiceDetails] = useState([]);
  
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [newCustomerInfo, setNewCustomerInfo] = useState({ name: '', phone: '' });

  // Reset state when opened
  useEffect(() => {
    if (show) {
      setFormData({
        customer_id: '', tour_departure_id: '', notes: '', payment_status: 'unpaid', booking_status: 'pending'
      });
      setPaxDetails([]);
      setServiceDetails([]);
      setIsNewCustomer(false);
      setNewCustomerInfo({ name: '', phone: '' });
    }
  }, [show]);

  const handleDepartureChange = (selectedOption) => {
    const depId = selectedOption ? selectedOption.value : '';
    setFormData({ ...formData, tour_departure_id: depId });
    
    if (depId) {
      const dep = departures.find(d => d.id === depId);
      if (dep) {
        // Initialize Pax Rules
        const defaultPax = (dep.price_rules || []).map(rule => ({
          type: rule.type,
          price: rule.price,
          qty: rule.is_default ? 1 : 0
        }));
        setPaxDetails(defaultPax);
        
        // Initialize Services
        const defaultServices = (dep.additional_services || []).map(svc => ({
          service: svc.service,
          price: svc.price,
          qty: 0
        }));
        setServiceDetails(defaultServices);
      }
    } else {
      setPaxDetails([]);
      setServiceDetails([]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    paxDetails.forEach(p => total += p.price * (p.qty || 0));
    serviceDetails.forEach(s => total += s.price * (s.qty || 0));
    return total;
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
      <div className="modal-content animate-slide-up" style={{ maxWidth: '800px', padding: '1.5rem', maxHeight: '95vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
          <div style={{ padding: '10px', background: 'var(--primary-light)', borderRadius: '10px', color: 'var(--primary)' }}>
            <ShoppingCart size={24} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tạo Đơn Hàng (Booking)</h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
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
                    placeholder="Tìm theo tên nặc số điện thoại..."
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
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>BẢNG GIÁ VÉ</h4>
                  {paxDetails.length > 0 ? (
                    <table className="data-table" style={{ fontSize: '0.9rem' }}>
                      <thead style={{ background: '#f8fafc' }}><tr><th style={{textAlign:'left'}}>Loại giá</th><th style={{textAlign:'right'}}>Đơn giá (VND)</th><th style={{textAlign:'center', width:'100px'}}>Số lượng</th><th style={{textAlign:'right'}}>Thành tiền</th></tr></thead>
                      <tbody>
                        {paxDetails.map((pax, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{pax.type}</td>
                            <td style={{ textAlign: 'right' }}>{Number(pax.price).toLocaleString('vi-VN')}</td>
                            <td style={{ padding: '4px' }}>
                              <input 
                                type="number" min="0" className="modal-input" style={{ textAlign: 'center', height: '32px' }}
                                value={pax.qty || 0}
                                onChange={(e) => {
                                  const newPax = [...paxDetails];
                                  newPax[idx].qty = parseInt(e.target.value) || 0;
                                  setPaxDetails(newPax);
                                }}
                              />
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>
                              {Number(pax.price * (pax.qty || 0)).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Lịch trình này chưa thiết lập cấu trúc giá.</p>
                  )}
                </div>

                {/* Additional Services Table */}
                {serviceDetails.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>DỊCH VỤ KÈM THEO</h4>
                    <table className="data-table" style={{ fontSize: '0.9rem' }}>
                      <thead style={{ background: '#f8fafc' }}><tr><th style={{textAlign:'left'}}>Dịch vụ</th><th style={{textAlign:'right'}}>Đơn vị / Đơn giá</th><th style={{textAlign:'center', width:'100px'}}>Số lượng</th><th style={{textAlign:'right'}}>Thành tiền</th></tr></thead>
                      <tbody>
                        {serviceDetails.map((svc, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{svc.service}</td>
                            <td style={{ textAlign: 'right' }}>{Number(svc.price).toLocaleString('vi-VN')}</td>
                            <td style={{ padding: '4px' }}>
                              <input 
                                type="number" min="0" className="modal-input" style={{ textAlign: 'center', height: '32px' }}
                                value={svc.qty || 0}
                                onChange={(e) => {
                                  const newSvcs = [...serviceDetails];
                                  newSvcs[idx].qty = parseInt(e.target.value) || 0;
                                  setServiceDetails(newSvcs);
                                }}
                              />
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 600, color: '#f59e0b' }}>
                              {Number(svc.price * (svc.qty || 0)).toLocaleString('vi-VN')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                
                {/* Total Summary */}
                <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '8px', border: '1px dashed #f59e0b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700 }}>TỔNG CHỖ BÁN: {totalPaxCount} khách</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>TỔNG THANH TOÁN</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#dc2626' }}>{calculateTotal().toLocaleString('vi-VN')} đ</div>
                  </div>
                </div>

              </div>
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
                <option value="pending">Chờ xác nhận (Pending)</option>
                <option value="processing">Đang xử lý (Processing)</option>
                <option value="confirmed">Thành công (Confirmed)</option>
                <option value="cancelled">Đã Hủy (Cancelled)</option>
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
              <Save size={18} /> LƯU ĐƠN HÀNG
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
