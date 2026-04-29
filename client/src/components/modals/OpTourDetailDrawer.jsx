import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, Trash2, Save, MoreHorizontal } from 'lucide-react';
import Select from 'react-select';
import { CKEditor } from 'ckeditor4-react';
import { useMarkets } from '../../hooks/useMarkets';

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
  const [errorMsg, setErrorMsg] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [guides, setGuides] = useState([]);
  const [airlinesList, setAirlinesList] = useState([]);
  const [tourTemplates, setTourTemplates] = useState([]);
  const [operatorsList, setOperatorsList] = useState([]);
  const marketOptions = useMarkets();

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
                      const hasOpRole = ['operations', 'manager', 'operations_lead', 'operator', 'operator_manager', 'group_operations', 'group_operations_lead'].includes(u.role_name);
                      const inOpTeam = u.teams && u.teams.some(t => 
                          (t.name && t.name.toLowerCase().includes('điều hành')) || 
                          (t.code && t.code.toLowerCase() === 'operations') ||
                          (t.code && t.code.toLowerCase().includes('op'))
                      );
                      return hasOpRole || inOpTeam;
                  })
                  .map(u => {
                      let roleLabel = 'Khác';
                      const r = u.role_name || '';
                      if (r === 'operator_manager') roleLabel = 'Trưởng ĐH';
                      else if (r.includes('operat')) roleLabel = 'Điều hành';
                      else if (r.includes('sale_lead') || r.includes('sales_lead')) roleLabel = 'Trưởng Sale';
                      else if (r.includes('sale')) roleLabel = 'Sale';
                      else if (r.includes('manager')) roleLabel = 'Quản lý';
                      else if (r.includes('account')) roleLabel = 'Kế toán';
                      return { label: `${u.full_name} - ${roleLabel}`, value: u.full_name };
                  })
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
        start_date: tour.start_date ? new Date(tour.start_date).toLocaleDateString('en-CA') : '',
        end_date: tour.end_date ? new Date(tour.end_date).toLocaleDateString('en-CA') : '',
        tour_info: tour.tour_info || {},
      });
    }
  }, [tour]);

  const handleChange = (field, value, isInfo = false) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (isInfo) {
        newData.tour_info = { ...newData.tour_info, [field]: value };
      } else {
        newData[field] = value;
      }
      
      // Auto-generate tour_code: [TemplateCode]-[YYYYMMDD] ONLY for new tours
      if ((field === 'tour_template_id' || field === 'start_date') && !tour?.id) {
        const templateId = field === 'tour_template_id' ? value : newData.tour_template_id;
        const startDate = field === 'start_date' ? value : newData.start_date;
        if (templateId && startDate) {
           const selectedTemplate = tourTemplates.find(t => t.id == templateId);
           const tCode = selectedTemplate?.code || newData.tour_code?.split('-')[0] || 'TOUR';
           const dateStr = startDate.replace(/-/g, '');
           newData.tour_code = `${tCode}-${dateStr}`;
        }
      }
      return newData;
    });
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
        setErrorMsg('Vui lòng chọn Sản phẩm Tour trước khi tạo mới.');
        return;
    }
    
    // allow 0 for total_seats or price_adult
    if (!tour_code || !start_date || !end_date || !status ||
        total_seats === '' || total_seats == null || 
        price_adult === '' || price_adult == null || 
        !transport || !pickup_point || !dropoff_point || 
        !booking_deadline || !close_time) {
        
        let msg = "Cần kiểm tra: ";
        if (!tour_code) msg += "Mã tour, ";
        if (!start_date) msg += "Khởi hành, ";
        if (!end_date) msg += "Ngày về, ";
        if (total_seats === '' || total_seats == null) msg += "Số chỗ nhận, ";
        if (price_adult === '' || price_adult == null) msg += "Giá người lớn, ";
        if (!pickup_point) msg += "Điểm đón, ";
        if (!dropoff_point) msg += "Điểm trả, ";
        if (!booking_deadline) msg += "Thời gian nhận chỗ, ";
        if (!close_time) msg += "Thời gian đóng, ";

        setErrorMsg('Vui lòng điền đầy đủ các trường: ' + msg.replace(/, $/, ''));
        return;
    }
    
    // Flight validation
    const { dep_airline, departure_flight, ret_airline, return_flight } = formData.tour_info || {};
    if (transport === 'Đường hàng không') {
        if (!dep_airline || !departure_flight || !ret_airline || !return_flight) {
            setErrorMsg('Vui lòng điền đủ thông tin Hành trình đi & về (Hãng & Chuyến bay) khi đi bằng Hàng không.');
            return;
        }
    }
    
    setErrorMsg('');
    
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
      onClose();
    } catch (error) {
      console.error('Save error', error);
      setErrorMsg('Lỗi lưu tour: ' + (error.response?.data?.message || error.message));
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
             {errorMsg && <div style={{ color: '#ef4444', fontWeight: 600, fontSize: '14px', marginTop: '5px' }}>⚠️ {errorMsg}</div>}
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
                  📋 BẢN SAO TOUR — Mã tour mặc định [Địa Danh]-[Ngày khởi hành YYYYMMDD]
                </div>
                <div style={{ color: '#a16207', fontSize: '12px' }}>
                  ⚠️ Hãy sửa <strong>Ngày khởi hành</strong>, <strong>Ngày về</strong> cho đúng lịch mới. Booking &amp; Phiếu thu cũ KHÔNG copy theo.
                </div>
              </div>
            </div>
          )}


          <div style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
             <h4 style={{ color: '#f59e0b', margin: '0 0 15px 0', fontSize: '15px' }}>Thông tin Tour</h4>
             <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Mã tour: <span style={{color:'red'}}>(*)</span></label>
                   <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_code} onChange={e => handleChange('tour_code', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 3' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Sản phẩm Tour: {!tour?.id && <span style={{color:'red'}}>(*)</span>}</label>
                   <Select
                       options={tourTemplates.filter(t => t.is_active !== false).map(t => ({ label: `${t.code} - ${t.name}`, value: t.id, tour: t }))}
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
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Nhóm/Thị trường:</label>
                   <Select
                       options={marketOptions}
                       value={
                          formData.market_ids && formData.market_ids.length > 0
                            ? formData.market_ids.map(id => {
                                for (const group of marketOptions) {
                                  if (group.id === id) return { label: group.label, value: group.label, id: group.id };
                                  const child = group.options?.find(o => o.id === id);
                                  if (child) return child;
                                }
                                return null;
                              }).filter(Boolean)
                            : (formData.market ? formData.market.split(',').map(m => ({ label: m.trim(), value: m.trim() })) : [])
                       }
                       onChange={options => {
                          handleChange('market', options ? options.map(o => o.value).join(',') : '');
                          handleChange('market_ids', options ? options.map(o => o.id) : []);
                       }}
                       isMulti
                       isClearable
                       placeholder="Tìm Tuyến điểm..."
                       styles={{ control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1', fontSize: '13px' }), menu: (base) => ({ ...base, fontSize: '13px' }) }}
                   />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Khởi hành: <span style={{color:'red'}}>(*)</span></label>
                    <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Ngày về: <span style={{color:'red'}}>(*)</span></label>
                    <input type="date" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }} value={formData.end_date} onChange={e => handleChange('end_date', e.target.value)} />
                </div>

                <div style={{ gridColumn: 'span 4' }}>
                   <label style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>Hành trình bay:</label>
                   <input type="text" style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} value={formData.tour_info.flight_itinerary || ''} onChange={e => handleChange('flight_itinerary', e.target.value, true)} />
                </div>
                <div style={{ gridColumn: 'span 4' }}>
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
                <div style={{ gridColumn: 'span 4' }}>
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
             
             <div className="mobile-stack-grid mobile-stack-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px', alignItems: 'center' }}>
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
                   <div style={{ width: '160px' }}>
                       <Select 
                           options={airlinesList}
                           value={airlinesList.find(a => a.value === formData.tour_info.dep_airline) || (formData.tour_info.dep_airline ? { label: formData.tour_info.dep_airline, value: formData.tour_info.dep_airline } : null)}
                           onChange={opt => handleChange('dep_airline', opt ? opt.value : '', true)}
                           isClearable
                           placeholder="Chọn Hãng bay..."
                           styles={{ control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1', fontSize: '13px' }), singleValue: (base) => ({ ...base, fontSize: '13px' }), option: (base) => ({...base, fontSize: '13px'}) }}
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
                   <div style={{ width: '160px' }}>
                       <Select 
                           options={airlinesList}
                           value={airlinesList.find(a => a.value === formData.tour_info.ret_airline) || (formData.tour_info.ret_airline ? { label: formData.tour_info.ret_airline, value: formData.tour_info.ret_airline } : null)}
                           onChange={opt => handleChange('ret_airline', opt ? opt.value : '', true)}
                           isClearable
                           placeholder="Chọn Hãng bay..."
                           styles={{ control: (base) => ({ ...base, minHeight: '36px', borderColor: '#cbd5e1', fontSize: '13px' }), singleValue: (base) => ({ ...base, fontSize: '13px' }), option: (base) => ({...base, fontSize: '13px'}) }}
                       />
                   </div>
                   <textarea placeholder="Chuyến bay, ngày giờ (Enter xuống dòng)..." style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', minWidth: '100px', minHeight: '52px', resize: 'vertical', fontSize: '13px', lineHeight: '1.4' }} value={formData.tour_info.return_flight || ''} onChange={e => handleChange('return_flight', e.target.value, true)} />
                </div>

                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <input type="text" value={formData.tour_info.price_child_label_1 || 'Giá trẻ em'} onChange={e => handleChange('price_child_label_1', e.target.value, true)} style={{ width: '130px', padding: '8px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', color: '#64748b', background: 'transparent', cursor: 'text' }} onFocus={e => e.target.style.borderColor = '#cbd5e1'} onBlur={e => e.target.style.borderColor = 'transparent'} />
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
                   <input type="text" value={formData.tour_info.price_child_label_2 || 'Giá trẻ em (2-10)'} onChange={e => handleChange('price_child_label_2', e.target.value, true)} style={{ width: '130px', padding: '8px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', color: '#64748b', background: 'transparent', cursor: 'text' }} onFocus={e => e.target.style.borderColor = '#cbd5e1'} onBlur={e => e.target.style.borderColor = 'transparent'} />
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
                   <input type="text" value={formData.tour_info.price_infant_label || 'Giá em bé (<2)'} onChange={e => handleChange('price_infant_label', e.target.value, true)} style={{ width: '130px', padding: '8px', border: '1px solid transparent', borderRadius: '4px', fontSize: '12px', color: '#64748b', background: 'transparent', cursor: 'text' }} onFocus={e => e.target.style.borderColor = '#cbd5e1'} onBlur={e => e.target.style.borderColor = 'transparent'} />
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
                <div style={{ gridColumn: 'span 6' }}></div>

                {/* === Extra Price Tiers (Dynamic) === */}
                {(formData.tour_info.extra_price_tiers || []).map((tier, idx) => (
                   <React.Fragment key={idx}>
                   <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input 
                         type="text" 
                         placeholder="VD: Trẻ 6-11 tuổi" 
                         value={tier.label || ''} 
                         onChange={e => {
                            const tiers = [...(formData.tour_info.extra_price_tiers || [])];
                            tiers[idx] = { ...tiers[idx], label: e.target.value };
                            handleChange('extra_price_tiers', tiers, true);
                         }}
                         style={{ width: '130px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '12px' }}
                      />
                      <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                         <input type="number" placeholder="%" value={tier.percent || ''} onChange={e => {
                            const percent = Number(e.target.value);
                            const tiers = [...(formData.tour_info.extra_price_tiers || [])];
                            const adultPrice = Number(formData.tour_info.price_adult || 0);
                            tiers[idx] = { ...tiers[idx], percent, price: percent > 0 ? adultPrice * percent / 100 : tiers[idx].price };
                            handleChange('extra_price_tiers', tiers, true);
                         }} style={{ width: '50px', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                         <input type="text" style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                            value={formatCurrency(tier.price)} 
                            onChange={e => {
                               const tiers = [...(formData.tour_info.extra_price_tiers || [])];
                               tiers[idx] = { ...tiers[idx], percent: '', price: parseCurrency(e.target.value) };
                               handleChange('extra_price_tiers', tiers, true);
                            }} 
                         />
                      </div>
                      <button 
                         type="button"
                         onClick={() => {
                            const tiers = [...(formData.tour_info.extra_price_tiers || [])];
                            tiers.splice(idx, 1);
                            handleChange('extra_price_tiers', tiers, true);
                         }}
                         style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '16px', padding: '4px 8px' }}
                         title="Xóa hàng giá này"
                      >✕</button>
                   </div>
                   <div style={{ gridColumn: 'span 6' }}></div>
                   </React.Fragment>
                ))}
                <div style={{ gridColumn: 'span 6', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <div style={{ width: '130px' }}></div>
                   <button 
                      type="button"
                      onClick={() => {
                         const tiers = [...(formData.tour_info.extra_price_tiers || [])];
                         tiers.push({ label: '', percent: '', price: 0 });
                         handleChange('extra_price_tiers', tiers, true);
                      }}
                      style={{ 
                         background: 'none', border: '1px dashed #94a3b8', borderRadius: '6px', 
                         color: '#64748b', cursor: 'pointer', fontSize: '12px', padding: '6px 14px',
                         display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                   >
                      <span style={{ fontSize: '14px' }}>＋</span> Thêm loại giá khác
                   </button>
                </div>
                <div style={{ gridColumn: 'span 6' }}></div>

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
                   <label style={{ fontSize: '12px', color: '#1e293b', width: '130px', fontWeight: 'bold' }}>Hạn xin Visa</label>
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
                  config={{ height: 300, extraPlugins: 'justify,colorbutton,panelbutton,font,magicline,pastefromword', versionCheck: false }}
                  editorUrl="https://cdn.ckeditor.com/4.22.1/full/ckeditor.js"
                />
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
