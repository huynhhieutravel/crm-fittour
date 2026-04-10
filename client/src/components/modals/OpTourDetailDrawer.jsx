import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, Save, MoreHorizontal } from 'lucide-react';
import Select from 'react-select';
import { CKEditor } from 'ckeditor4-react';

export default function OpTourDetailDrawer({ onClose, tour }) {
  const [formData, setFormData] = useState({
    tour_code: '',
    tour_name: '',
    tour_template_id: '',
    start_date: '',
    end_date: '',
    market: '',
    status: 'Mở bán',
    tour_info: {
        price_adult: 0,
        total_seats: 0,
        sold: 0,
        commission_type: '%',
        transport: 'Đường hàng không'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [guides, setGuides] = useState([]);
  const [airlinesList, setAirlinesList] = useState([]);
  const [tourTemplates, setTourTemplates] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const [guidesRes, airlinesRes, templatesRes, usersRes] = await Promise.all([
                axios.get('/api/guides'),
                axios.get('/api/airlines?limit=1000'),
                axios.get('/api/tours', {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }).catch(() => ({ data: [] })),
                axios.get('/api/users', {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                }).catch(() => ({ data: [] }))
            ]);
            setGuides(guidesRes.data.map(g => ({ label: `${g.name} - ${g.phone}`, value: g.id })));
            if (airlinesRes.data && airlinesRes.data.data) {
                setAirlinesList(airlinesRes.data.data.map(a => ({ label: `${a.code} - ${a.name}`, value: a.name })));
            }
            if (Array.isArray(templatesRes.data)) {
                setTourTemplates(templatesRes.data);
            }
            if (Array.isArray(usersRes.data)) {
                setOperatorsList(usersRes.data
                  .filter(u => {
                      if (u.is_active === false || u.role_name === 'admin') return false;
                      const hasOpRole = ['operations', 'manager'].includes(u.role_name);
                      const inOpTeam = u.teams && u.teams.some(t => 
                          (t.name && t.name.toLowerCase().includes('điều hành')) || 
                          (t.code && t.code.toLowerCase() === 'operations')
                      );
                      return hasOpRole || inOpTeam;
                  })
                  .map(u => ({ label: u.full_name, value: u.full_name }))
                );
            }
        } catch (e) {
            console.error('Lỗi tải Data (Guides/Airlines/Templates):', e);
        }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (tour) {
      setFormData({
        ...tour,
        tour_template_id: tour.tour_template_id || '',
        status: tour.status || 'Mở bán',
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
    // Validation
    const { tour_code, tour_name, tour_template_id, start_date, end_date, status } = formData;
    const { total_seats, price_adult, pickup_point, dropoff_point, booking_deadline, close_time } = formData.tour_info || {};
    const transport = formData.tour_info?.transport || 'Đường hàng không';
    
    // tour_template_id is required for new tours
    if (!tour?.id && !tour_template_id) {
        alert('Vui lòng chọn Sản phẩm Tour trước khi tạo mới.');
        return;
    }
    
    // allow 0 for total_seats or price_adult
    if (!tour_code || !start_date || !end_date || !status ||
        total_seats === '' || total_seats == null || 
        price_adult === '' || price_adult == null || 
        !transport || !pickup_point || !dropoff_point || 
        !booking_deadline || !close_time) {
        
        let msg = "Cần kiểm tra: \n";
        if (!tour_code) msg += "- Mã tour\n";
        if (!start_date) msg += "- Khởi hành\n";
        if (!end_date) msg += "- Ngày về\n";
        if (total_seats === '' || total_seats == null) msg += "- Số chỗ nhận\n";
        if (price_adult === '' || price_adult == null) msg += "- Giá người lớn\n";
        if (!pickup_point) msg += "- Điểm đón\n";
        if (!dropoff_point) msg += "- Điểm trả\n";
        if (!booking_deadline) msg += "- Thời gian nhận chỗ\n";
        if (!close_time) msg += "- Thời gian đóng\n";

        alert('Vui lòng điền đầy đủ các trường có đánh dấu (* đỏ).\n\n' + msg);
        return;
    }
    
    // Flight validation
    const { dep_airline, departure_flight, ret_airline, return_flight } = formData.tour_info || {};
    if (transport === 'Đường hàng không') {
        if (!dep_airline || !departure_flight || !ret_airline || !return_flight) {
            let flightMsg = "- Hành trình đi (Hãng & Chuyến bay)\n- Hành trình về (Hãng & Chuyến bay)\n";
            alert('Vui lòng điền đầy đủ các thông tin chuyến bay bắt buộc (* đỏ) khi phương tiện là Hàng không.\n\nCần kiểm tra:\n' + flightMsg);
            return;
        }
    }
    
    // Normalize into formData
    formData.tour_info = { ...formData.tour_info, transport };

    setLoading(true);
    try {
      const payload = {
        ...formData
      };

      if (tour?.id) {
        await axios.put(`/api/op-tours/${tour.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } else {
        await axios.post('/api/op-tours', payload, {
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
      background: 'rgba(0,0,0,0.5)', zIndex: 1500, display: 'flex', justifyContent: 'flex-end'
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
          
          {/* Copy Tour Banner */}
          {tour?._isCopy && (
            <div style={{ 
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', 
              border: '2px solid #f59e0b', 
              borderRadius: '8px', 
              padding: '14px 20px', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '24px' }}>📋</span>
              <div>
                <div style={{ fontWeight: 800, color: '#92400e', fontSize: '14px', marginBottom: '2px' }}>
                  📋 BẢN SAO TOUR — Mã tour tự động kèm số thứ tự (DEP-01, 02...)
                </div>
                <div style={{ color: '#a16207', fontSize: '12px' }}>
                  ⚠️ Hãy sửa <strong>Ngày khởi hành</strong>, <strong>Ngày về</strong> cho đúng lịch mới. Booking &amp; Phiếu thu cũ KHÔNG copy theo.
                </div>
              </div>
            </div>
          )}


          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ color: '#f59e0b', margin: '0 0 15px 0', fontSize: '15px' }}>Thông tin Tour</h4>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mã tour: <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_code} onChange={e => handleChange('tour_code', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Sản phẩm Tour: {!tour?.id && <span style={{color:'red'}}>(*)</span>}</label>
                   <Select
                       options={tourTemplates.map(t => ({ label: `${t.code} - ${t.name}`, value: t.id, tour: t }))}
                       value={tourTemplates.map(t => ({ label: `${t.code} - ${t.name}`, value: t.id, tour: t })).find(o => o.value === formData.tour_template_id || (!formData.tour_template_id && formData.tour_name && o.tour.name === formData.tour_name)) || null}
                       onChange={opt => {
                          if (opt) {
                             handleChange('tour_template_id', opt.value);
                             handleChange('tour_name', opt.tour.name);
                          } else {
                             handleChange('tour_template_id', '');
                             handleChange('tour_name', '');
                          }
                       }}
                       isClearable
                       placeholder="-- Tìm Sản phẩm Tour --"
                       styles={{ 
                         control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1', fontSize: '13px' }),
                         menu: (base) => ({ ...base, fontSize: '13px' })
                       }}
                   />
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

                <div style={{ gridColumn: 'span 6' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nhân viên điều hành:</label>
                    <Select
                        isMulti
                        options={operatorsList}
                        value={operatorsList.filter(o => (formData.tour_info.operators || '').split(', ').includes(o.value))}
                        onChange={opts => handleChange('operators', opts ? opts.map(o => o.value).join(', ') : '', true)}
                        placeholder="Chọn nhân viên điều hành..."
                        styles={{ control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1' }) }}
                    />
                </div>
                <div style={{ gridColumn: 'span 6' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Tour Guide:</label>
                    <Select 
                        options={guides}
                        value={guides.find(g => g.value === formData.tour_info.tour_guide_id) || null}
                        onChange={opt => {
                            handleChange('tour_guide_id', opt ? opt.value : '', true);
                            handleChange('tour_guide_name', opt ? opt.label : '', true);
                        }}
                        isClearable
                        placeholder="Nhập tên, SĐT HDV..."
                        styles={{ control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1' }) }}
                    />
                </div>
             </div>
          </div>

          {/* Card 2: Thời gian nhận chỗ & Giá */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ color: '#f59e0b', margin: '0 0 15px 0', fontSize: '15px' }}>Thời gian nhận chỗ</h4>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px', alignItems: 'center' }}>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', width: '130px', flexShrink: 0 }}>Số chỗ nhận <span style={{color:'red'}}>(*)</span></label>
                   <input type="number" style={{ flex: 1, minWidth: '60px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.total_seats || 0} onChange={e => handleChange('total_seats', e.target.value, true)} />
                   <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold', color: '#ea580c', flexShrink: 0 }}>
                     <input type="checkbox" checked={formData.tour_info.allow_overbooking || false} onChange={e => handleChange('allow_overbooking', e.target.checked, true)} />
                     Cho bán quá chỗ
                   </label>
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
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right', paddingTop: '8px' }}>Hành trình đi {formData.tour_info?.transport === 'Đường hàng không' && <span style={{color:'red'}}>(*)</span>}</label>
                   <div style={{ width: '220px' }}>
                       <Select 
                           options={airlinesList}
                           value={airlinesList.find(a => a.value === formData.tour_info.dep_airline) || (formData.tour_info.dep_airline ? { label: formData.tour_info.dep_airline, value: formData.tour_info.dep_airline } : null)}
                           onChange={opt => handleChange('dep_airline', opt ? opt.value : '', true)}
                           isClearable
                           placeholder="Chọn Hãng bay..."
                           styles={{ control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1' }) }}
                       />
                   </div>
                   <textarea placeholder="Chuyến bay, ngày giờ (Enter xuống dòng)..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '100px', minHeight: '52px', resize: 'vertical', fontSize: '13px', lineHeight: '1.4' }} value={formData.tour_info.departure_flight || ''} onChange={e => handleChange('departure_flight', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px' }}>Giá người lớn <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontWeight: 'bold' }} value={formatCurrency(formData.tour_info.price_adult)} onChange={e => handleChange('price_adult', parseCurrency(e.target.value), true)} />
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '100px', textAlign: 'right', paddingTop: '8px' }}>Hành trình về {formData.tour_info?.transport === 'Đường hàng không' && <span style={{color:'red'}}>(*)</span>}</label>
                   <div style={{ width: '220px' }}>
                       <Select 
                           options={airlinesList}
                           value={airlinesList.find(a => a.value === formData.tour_info.ret_airline) || (formData.tour_info.ret_airline ? { label: formData.tour_info.ret_airline, value: formData.tour_info.ret_airline } : null)}
                           onChange={opt => handleChange('ret_airline', opt ? opt.value : '', true)}
                           isClearable
                           placeholder="Chọn Hãng bay..."
                           styles={{ control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1' }) }}
                       />
                   </div>
                   <textarea placeholder="Chuyến bay, ngày giờ (Enter xuống dòng)..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '100px', minHeight: '52px', resize: 'vertical', fontSize: '13px', lineHeight: '1.4' }} value={formData.tour_info.return_flight || ''} onChange={e => handleChange('return_flight', e.target.value, true)} />
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
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px', paddingTop: '8px' }}>Ghi chú nội bộ</label>
                   <textarea rows={3} style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', minHeight: '60px', resize: 'vertical' }} value={formData.tour_info.internal_notes || ''} onChange={e => handleChange('internal_notes', e.target.value, true)} />
                </div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px' }}>Thời gian nhận chỗ <span style={{color:'red'}}>(*)</span></label>
                   <input type="date" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.tour_info.booking_deadline || ''} onChange={e => handleChange('booking_deadline', e.target.value, true)} />
                </div>

                {/* Row 2 */}
                <div style={{ gridColumn: 'span 6' }}></div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', width: '130px', fontWeight: 'bold', color: '#1e293b' }}>Hạn xin Visa</label>
                   <input type="date" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.tour_info.visa_deadline || ''} onChange={e => handleChange('visa_deadline', e.target.value, true)} />
                </div>

                {/* Row 3 */}
                <div style={{ gridColumn: 'span 6' }}></div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px', textAlign: 'left' }}>Thời gian đóng <span style={{color:'red'}}>(*)</span></label>
                   <input type="date" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.tour_info.close_time || ''} onChange={e => handleChange('close_time', e.target.value, true)} />
                </div>

                {/* Row 4 */}
                <div style={{ gridColumn: 'span 6' }}></div>
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <label style={{ fontSize: '12px', color: '#1e293b', fontWeight: 'bold', width: '130px', textAlign: 'left' }}>Trạng thái <span style={{color:'red'}}>(*)</span></label>
                   <select style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.status} onChange={e => handleChange('status', e.target.value)}>
                     <option value="Mở bán">Mở bán</option>
                     <option value="Chắc chắn đi">Chắc chắn đi</option>
                     <option value="Đã đầy">Đã đầy</option>
                     <option value="Hoàn thành">Hoàn thành</option>
                     <option value="Huỷ">Huỷ</option>
                   </select>
                </div>
             </div>
          </div>
          
          {/* Card: Lịch trình Tours */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ margin: '0 0 15px 0', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Lịch trình Tours <span style={{ fontSize: '12px' }}>▼</span>
             </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                 <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', minWidth: '180px' }}>📄 Link lịch trình (File PDF)</label>
                 <input type="text" placeholder="Nhập link file PDF lịch trình" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.tour_itinerary_link || ''} onChange={e => handleChange('tour_itinerary_link', e.target.value, true)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <label style={{ fontSize: '13px', color: '#64748b', fontWeight: '500', minWidth: '180px' }}>🌐 Link lịch trình (Trang Web)</label>
                 <input type="text" placeholder="Nhập link trang web lịch trình" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.tour_itinerary_web_link || ''} onChange={e => handleChange('tour_itinerary_web_link', e.target.value, true)} />
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
