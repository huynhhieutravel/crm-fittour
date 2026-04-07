import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, Save, MoreHorizontal } from 'lucide-react';
import Select from 'react-select';
import { CKEditor } from 'ckeditor4-react';

export default function OpTourDetailDrawer({ onClose, tour }) {
  const [formData, setFormData] = useState({
    tour_code: '',
    tour_name: '',
    start_date: '',
    end_date: '',
    market: '',
    status: 'Đang chạy',
    tour_info: {
        price_adult: 0,
        total_seats: 0,
        sold: 0,
        commission_type: '%'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [guides, setGuides] = useState([]);

  useEffect(() => {
    const fetchGuides = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/guides');
            setGuides(res.data.map(g => ({ label: `${g.name} - ${g.phone}`, value: g.id })));
        } catch (e) {
            console.error('Lỗi tải Guides:', e);
        }
    };
    fetchGuides();
  }, []);

  useEffect(() => {
    if (tour) {
      setFormData({
        ...tour,
        status: tour.status || 'Đang chạy',
        start_date: tour.start_date ? tour.start_date.split('T')[0] : '',
        end_date: tour.end_date ? tour.end_date.split('T')[0] : '',
        tour_info: tour.tour_info || {},
      });
    }
  }, [tour]);

  const handleChange = (field, value, isInfo = false) => {
    if (isInfo) {
      setFormData(prev => ({
        ...prev,
        tour_info: { ...prev.tour_info, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null || val === '') return '';
    return new Intl.NumberFormat('vi-VN').format(Number(val));
  };

  const parseCurrency = (val) => {
    if (!val) return 0;
    const raw = String(val).replace(/\D/g, '');
    return raw ? Number(raw) : 0;
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData
      };

      if (tour?.id) {
        await axios.put(`http://localhost:5001/api/op-tours/${tour.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('http://localhost:5001/api/op-tours', payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      }
      alert('Lưu thành công!');
      onClose();
    } catch (error) {
      console.error('Save error', error);
      alert('Lỗi lưu tour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
      background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end'
    }}>
      <div className="drawer-content" style={{
        width: '90%', height: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column',
        boxShadow: '-5px 0 15px rgba(0,0,0,0.1)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
             <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>TOUR FIT: {formData.tour_name || 'Tạo mới'}</h3>
             <small style={{ color: '#64748b' }}>Phiên bản test cấu trúc Group</small>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleSave} 
              disabled={loading}
              style={{ background: '#ff5722', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
               <Save size={16} /> Lưu Tour
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
          </div>
        </div>

        {/* Body scroll */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          
          {/* Card 1: Thông tin Tour */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ color: '#f59e0b', margin: '0 0 15px 0', fontSize: '15px' }}>Thông tin Tour</h4>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mã tour: <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_code} onChange={e => handleChange('tour_code', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tên: <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_name} onChange={e => handleChange('tour_name', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Hành trình bay:</label>
                   <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.flight_itinerary || ''} onChange={e => handleChange('flight_itinerary', e.target.value, true)} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nhóm/Thị trường:</label>
                   <select style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.market} onChange={e => handleChange('market', e.target.value)}>
                     <option value="">Chọn Tuyến điểm...</option>
                     {["Việt Nam (MICE)", "TP.HCM", "Hà Nội", "Nha Trang", "Vũng Tàu", "Phú Yên", "Nhật Bản", "Hàn Quốc", "Đài Loan", "Châu Âu", "Mỹ", "Trung Quốc", "Giang Nam"].map(d => (
                        <option key={d} value={d}>{d}</option>
                     ))}
                   </select>
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Khởi hành: <span style={{color:'red'}}>(*)</span></label>
                    <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 1' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ngày về: <span style={{color:'red'}}>(*)</span></label>
                    <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.end_date} onChange={e => handleChange('end_date', e.target.value)} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Loại hình:</label>
                    <select style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.tour_type || 'Outbound'} onChange={e => handleChange('tour_type', e.target.value, true)}>
                      <option value="Outbound">Outbound</option>
                      <option value="Inbound">Inbound</option>
                      <option value="Domestic">Domestic</option>
                    </select>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tỷ giá:</label>
                    <select style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.exchange_rate || 'VNĐ- 1'} onChange={e => handleChange('exchange_rate', e.target.value, true)}>
                      <option value="VNĐ- 1">VNĐ- 1</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                </div>
                <div style={{ gridColumn: 'span 8' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nhân viên điều hành:</label>
                    <input type="text" placeholder="Nhập tên nhân viên (cách nhau bằng dấu phẩy)..." style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.operators || ''} onChange={e => handleChange('operators', e.target.value, true)} />
                </div>
             </div>
          </div>

          {/* Card 2: Thời gian nhận chỗ & Giá */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ color: '#f59e0b', margin: '0 0 15px 0', fontSize: '15px' }}>Thời gian nhận chỗ</h4>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px', alignItems: 'center' }}>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', width: '130px' }}>Số chỗ nhận <span style={{color:'red'}}>(*)</span></label>
                   <input type="number" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.total_seats || 0} onChange={e => handleChange('total_seats', e.target.value, true)} />
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', width: '100px', textAlign: 'right' }}>Phương tiện <span style={{color:'red'}}>(*)</span></label>
                   <select style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.transport || 'Đường hàng không'} onChange={e => handleChange('transport', e.target.value, true)}>
                      <option value="Đường hàng không">Đường hàng không</option>
                      <option value="Đường bộ">Đường bộ</option>
                      <option value="Đường sắt">Đường sắt</option>
                      <option value="Đường thủy">Đường thủy</option>
                   </select>
                </div>

                <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Giá Tour</label>
                   <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formatCurrency(formData.tour_info.price_tour)} onChange={e => handleChange('price_tour', parseCurrency(e.target.value), true)} />
                </div>
                <div style={{ gridColumn: 'span 3', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '60px', textAlign: 'right' }}>Giảm giá</label>
                   <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formatCurrency(formData.tour_info.discount)} onChange={e => handleChange('discount', parseCurrency(e.target.value), true)} />
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right' }}>Hành trình đi</label>
                   <input type="text" placeholder="Hãng bay" style={{ width: '120px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.dep_airline || ''} onChange={e => handleChange('dep_airline', e.target.value, true)} />
                   <input type="text" placeholder="Chuyến bay, ngày giờ..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.departure_flight || ''} onChange={e => handleChange('departure_flight', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px' }}>Giá người lớn <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold' }} value={formatCurrency(formData.tour_info.price_adult)} onChange={e => handleChange('price_adult', parseCurrency(e.target.value), true)} />
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right' }}>Hành trình về</label>
                   <input type="text" placeholder="Hãng bay" style={{ width: '120px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.ret_airline || ''} onChange={e => handleChange('ret_airline', e.target.value, true)} />
                   <input type="text" placeholder="Chuyến bay, ngày giờ..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.return_flight || ''} onChange={e => handleChange('return_flight', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Giá trẻ em (2-5)</label>
                   <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                     <input type="number" placeholder="%" value={formData.tour_info.price_child_2_5_percent || ''} onChange={e => {
                         const percent = Number(e.target.value);
                         handleChange('price_child_2_5_percent', percent, true);
                         if (percent > 0) {
                            const adultPrice = Number(formData.tour_info.price_adult || 0);
                            handleChange('price_child_2_5', adultPrice * percent / 100, true);
                         }
                     }} style={{ width: '50px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                     <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formatCurrency(formData.tour_info.price_child_2_5)} onChange={e => { handleChange('price_child_2_5_percent', '', true); handleChange('price_child_2_5', parseCurrency(e.target.value), true); }} />
                   </div>
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '100px', textAlign: 'right' }}>Điểm đón <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.pickup_point || ''} onChange={e => handleChange('pickup_point', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Giá trẻ em (6-11)</label>
                   <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                     <input type="number" placeholder="%" value={formData.tour_info.price_child_6_11_percent || ''} onChange={e => {
                         const percent = Number(e.target.value);
                         handleChange('price_child_6_11_percent', percent, true);
                         if (percent > 0) {
                            const adultPrice = Number(formData.tour_info.price_adult || 0);
                            handleChange('price_child_6_11', adultPrice * percent / 100, true);
                         }
                     }} style={{ width: '50px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                     <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formatCurrency(formData.tour_info.price_child_6_11)} onChange={e => { handleChange('price_child_6_11_percent', '', true); handleChange('price_child_6_11', parseCurrency(e.target.value), true); }} />
                   </div>
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '100px', textAlign: 'right' }}>Điểm trả <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.dropoff_point || ''} onChange={e => handleChange('dropoff_point', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Giá em bé</label>
                   <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                     <input type="number" placeholder="%" value={formData.tour_info.price_infant_percent || ''} onChange={e => {
                         const percent = Number(e.target.value);
                         handleChange('price_infant_percent', percent, true);
                         if (percent > 0) {
                            const adultPrice = Number(formData.tour_info.price_adult || 0);
                            handleChange('price_infant', adultPrice * percent / 100, true);
                         }
                     }} style={{ width: '50px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                     <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formatCurrency(formData.tour_info.price_infant)} onChange={e => { handleChange('price_infant_percent', '', true); handleChange('price_infant', parseCurrency(e.target.value), true); }} />
                   </div>
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right' }}>Hạn xin Visa</label>
                   <input type="date" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.tour_info.visa_deadline || ''} onChange={e => handleChange('visa_deadline', e.target.value, true)} />
                </div>
                
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Hoa hồng</label>
                   <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                     <select style={{ width: '110px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.commission_type || '%'} onChange={e => handleChange('commission_type', e.target.value, true)}>
                        <option value="%">% Hoa Hồng</option>
                        <option value="Số tiền">Số tiền</option>
                     </select>
                     <input type="number" style={{ width: '60px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} value={formData.tour_info.commission_value || ''} onChange={e => {
                         const val = Number(e.target.value);
                         handleChange('commission_value', val, true);
                         if (formData.tour_info.commission_type === '%') {
                            const adultPrice = Number(formData.tour_info.price_adult || 0);
                            handleChange('commission_amount', adultPrice * val / 100, true);
                         } else {
                            handleChange('commission_amount', val, true);
                         }
                     }} />
                     <input type="text" readOnly style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#f1f5f9' }} value={formatCurrency(formData.tour_info.commission_amount || 0)} />
                   </div>
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right' }}>Hạn xin Visa</label>
                   <input type="date" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.tour_info.visa_deadline || ''} onChange={e => handleChange('visa_deadline', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px', marginTop: '8px' }}>Phụ thu trên tour</label>
                   <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                       <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formatCurrency(formData.tour_info.surcharge_tour)} onChange={e => handleChange('surcharge_tour', parseCurrency(e.target.value), true)} />
                       <button style={{ background: '#22c55e', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }}><Plus size={16} /></button>
                     </div>
                   </div>
                </div>
                
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right' }}>Tour Guide</label>
                   <div style={{ flex: 1 }}>
                       <Select 
                           options={guides}
                           value={guides.find(g => g.value === formData.tour_info.tour_guide_id) || null}
                           onChange={opt => {
                               handleChange('tour_guide_id', opt ? opt.value : '', true);
                               handleChange('tour_guide_name', opt ? opt.label : '', true);
                           }}
                           isClearable
                           placeholder="Nhập tên, SĐT HDV..."
                           styles={{
                               control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1' })
                           }}
                       />
                   </div>
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px' }}>Thời gian giữ chỗ (h)</label>
                   <input type="number" style={{ width: '150px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.hold_time_hours || 24} onChange={e => handleChange('hold_time_hours', e.target.value, true)} />
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right' }}>Ghi chú</label>
                   <textarea rows={1} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.internal_notes || ''} onChange={e => handleChange('internal_notes', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px' }}>Thời gian nhận chỗ <span style={{color:'red'}}>(*)</span></label>
                   <input type="date" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.tour_info.booking_deadline || ''} onChange={e => handleChange('booking_deadline', e.target.value, true)} />
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right' }}>File</label>
                   <input type="file" style={{ flex: 1, padding: '5px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#fff' }} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '130px' }}></div>
                   <label style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500' }}>
                     <input type="checkbox" checked={formData.tour_info.allow_overbooking || false} onChange={e => handleChange('allow_overbooking', e.target.checked, true)} />
                     Cho bán quá số chỗ/ghế
                   </label>
                </div>
                <div style={{ gridColumn: 'span 6' }}></div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px', textAlign: 'left' }}>Thời gian đóng <span style={{color:'red'}}>(*)</span></label>
                   <input type="date" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.tour_info.close_time || ''} onChange={e => handleChange('close_time', e.target.value, true)} />
                </div>
                <div style={{ gridColumn: 'span 6' }}></div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px', textAlign: 'left' }}>Trạng thái <span style={{color:'red'}}>(*)</span></label>
                   <select style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                     
                     <option value="Sắp chạy">Sắp chạy</option>
                     <option value="Kích hoạt giá">Kích hoạt giá</option>
                     <option value="Đang chạy">Đang chạy</option>
                     <option value="Chưa quyết toán">Chưa quyết toán</option>
                     <option value="Đã quyết toán">Đã quyết toán</option>
                     <option value="Hoàn thành">Hoàn thành</option>
                     <option value="Hủy">Hủy</option>
                   </select>
                </div>
             </div>
          </div>
          
          {/* Card: Lịch trình Tours */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ margin: '0 0 15px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Lịch trình Tours <span style={{ fontSize: '12px' }}>▼</span>
             </h4>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>Link lịch trình (File PDF)</label>
                <input type="text" placeholder="Nhập link file PDF lịch trình" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.tour_itinerary_link || ''} onChange={e => handleChange('tour_itinerary_link', e.target.value, true)} />
             </div>
          </div>

          {/* Card: Điều khoản & Lưu ý */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ margin: '0 0 15px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Điều khoản & Lưu ý <span style={{ fontSize: '12px' }}>▼</span>
             </h4>
             <div style={{ display: 'flex', gap: '10px', fontSize: '13px', marginBottom: '8px', color: '#f59e0b' }}>
                <span style={{ cursor: 'pointer', fontWeight: 'bold' }}>(VN)</span>
                <span style={{ cursor: 'pointer', color: '#3b82f6' }}>(EN)</span>
             </div>
             <div className="ckeditor-wrapper" style={{ marginBottom: '50px' }}>
                <CKEditor 
                  initData={formData.tour_info.terms_and_conditions || ''} 
                  onChange={(evt) => handleChange('terms_and_conditions', evt.editor.getData(), true)} 
                  config={{ height: 300, extraPlugins: 'justify,colorbutton,panelbutton,font,magicline,pastefromword' }}
                  editorUrl="https://cdn.ckeditor.com/4.22.1/full/ckeditor.js"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
